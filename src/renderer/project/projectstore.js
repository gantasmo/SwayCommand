// Project store, owns the current .sway document and its lifecycle: open,
// hydrate the live modules, load media, reassemble on save. The document is
// the single source of truth for meta, palette, media, timeline, and
// assignments; the timeline and assignment objects are handed to the
// transport and router BY REFERENCE, so UI edits mutate the document
// directly and collect() only has to refresh what live modules own
// (kit, synth patch, fx params, autoVJ, midi overrides).

import { validateProject, uid } from '../../shared/swayproject.js';

// decodeAudioData expands to Float32 PCM; a long compressed file can decode
// to gigabytes. Estimated from cached duration when known.
const DECODED_WARN_BYTES = 600e6;
const DECODED_REFUSE_BYTES = 1.5e9;

export function createProjectStore(deps) {
  const { engine, audio, sampler, synth, transport, midi } = deps;
  let router = deps.router || null;
  let setSynthEnabled = deps.setSynthEnabled || (() => {});

  const state = {
    path: null,
    name: 'Untitled',
    dirty: false,
    loading: false,
    mediaLoading: 0, // count of media files still decoding
    warnings: [],
  };

  let doc = null;

  function project() {
    return doc ? doc.project : null;
  }

  function decodedEstimate(media) {
    if (!media.duration) return 0;
    return media.duration * 48000 * 2 * 4;
  }

  async function readMediaBytes(media) {
    const p = media.resolvedPath || media.path;
    const bytes = await window.swaycommand.files.readAudio(p);
    return bytes;
  }

  // Loads every media file the kit or timeline references. Sequential on
  // purpose: one decode at a time keeps the render loop breathing. Never
  // awaited by open, the show starts while stems stream in.
  async function loadMediaAsync() {
    const p = project();
    if (!p) return;
    const kitIds = new Set(p.sampler.kit.pads.filter(Boolean).map((pad) => pad.id));
    const clipIds = new Set();
    for (const t of p.timeline.tracks) {
      if (t.type !== 'audio') continue;
      for (const c of t.clips) clipIds.add(c.media);
      // VST renders (wet media) play beside their source clips.
      for (const wet of Object.values((t.vst && t.vst.renders) || {})) clipIds.add(wet);
    }
    // Stems launched from pads are timeline media too: they must be decoded
    // for the transport, not the kit.
    for (const a of p.assignments.pads) if (a && a.type === 'stem') clipIds.add(a.media);
    const wanted = p.media.filter((m) => kitIds.has(m.id) || clipIds.has(m.id));
    state.mediaLoading = wanted.length;
    for (const m of wanted) {
      try {
        const est = decodedEstimate(m);
        if (est > DECODED_REFUSE_BYTES) {
          state.warnings.push(`${m.name}: would decode to ~${Math.round(est / 1e6)} MB; not loaded`);
          continue;
        }
        if (est > DECODED_WARN_BYTES) {
          state.warnings.push(`${m.name}: decodes to ~${Math.round(est / 1e6)} MB`);
        }
        const bytes = await readMediaBytes(m);
        if (kitIds.has(m.id)) {
          const info = await sampler.loadSample(m.id, bytes.slice().buffer, { name: m.name });
          if (info && info.duration) m.duration = info.duration;
        }
        if (clipIds.has(m.id)) {
          // A media used by both kit and timeline decodes twice (the sampler
          // decodes internally); rare enough that sharing is not worth a
          // sampler API change in v1.
          const buffer = await audio.ctx.decodeAudioData(bytes.slice().buffer);
          m.duration = buffer.duration;
          transport.setBuffer(m.id, buffer);
        }
      } catch (err) {
        state.warnings.push(`${m.name}: ${err.message}`);
      } finally {
        state.mediaLoading--;
      }
    }
    // Pads restore once every kit sample had its chance to load. A filled
    // kit pad must also fire from hardware, so it gets a sample assignment
    // unless the project already routes that pad elsewhere.
    if (kitIds.size) {
      const result = sampler.setKit(p.sampler.kit);
      for (const name of result.missing || []) state.warnings.push(`kit: ${name} missing`);
      const padsA = p.assignments.pads;
      p.sampler.kit.pads.forEach((pad, i) => {
        if (pad && pad.id && !padsA[i]) padsA[i] = { type: 'sample', pad: i };
      });
    }
  }

  function applySamplerKnobs() {
    const kn = project().sampler.knobs;
    sampler.setKnob(4, kn.master);
    sampler.setKnob(5, kn.cutoff);
    sampler.setKnob(6, kn.rate);
    sampler.setKnob(7, kn.send);
  }

  // Hydration order matters: synth before engine (a patch swap is silent;
  // a scene cut is visible), router assignments before the transport starts
  // firing visual clips at it.
  function applyProject(input, path) {
    const { doc: valid, warnings } = validateProject(input);
    doc = valid;
    const p = doc.project;
    state.path = path || null;
    state.name = p.meta.name;
    state.warnings = warnings;
    state.dirty = false;

    if (p.synth.patch) synth.setPatch(p.synth.patch);
    else if (p.synth.preset) synth.loadPreset(p.synth.preset);
    setSynthEnabled(p.synth.enabled);

    engine.applyProject(p);
    if (router) router.setAssignments(p.assignments);
    midi.setOverrides({ ...(p.midiOverrides || {}) });
    transport.setTimeline(p.timeline);
    applySamplerKnobs();

    state.loading = false;
    if (deps.onApplied) deps.onApplied();
    loadMediaAsync().then(() => {
      if (deps.onMediaLoaded) deps.onMediaLoaded();
    });
    return warnings;
  }

  function collect() {
    if (!doc) return null;
    const p = doc.project;
    p.meta.name = state.name;
    p.sampler.kit = sampler.getKit();
    const patch = JSON.parse(JSON.stringify(synth.patch));
    p.synth.patch = patch;
    p.synth.preset = patch.name || p.synth.preset;
    p.fx.params = { ...engine.fx.params };
    p.engine.fxEnabled = engine.fxEnabled;
    p.engine.autoVJ = {
      enabled: engine.autoVJ.enabled,
      pool: engine.autoVJ.pool.slice(),
      minHold: engine.autoVJ.minHold,
      maxHold: engine.autoVJ.maxHold,
      fadeTime: engine.autoVJ.fadeTime,
    };
    if (router) p.assignments = router.getAssignments();
    p.midiOverrides = midi.getOverrides();
    p.timeline = transport.collect() || p.timeline;
    return doc;
  }

  async function fillMediaStats() {
    for (const m of project().media) {
      if (m.sha256 && m.bytes) continue;
      try {
        const info = await window.swaycommand.files.statAudio(m.resolvedPath || m.path);
        m.sha256 = info.sha256;
        m.bytes = info.bytes;
      } catch {
        /* unreadable media was already reported at load */
      }
    }
  }

  async function saveTo(path) {
    collect();
    await fillMediaStats();
    const result = await window.swaycommand.project.write(path, doc);
    state.path = result.path;
    state.dirty = false;
    return result;
  }

  return {
    state,
    get doc() {
      return doc;
    },
    project,
    applyProject,
    collect,
    setRouter(r) {
      router = r;
    },
    setSynthEnabledHook(fn) {
      setSynthEnabled = fn;
    },
    markDirty() {
      state.dirty = true;
    },

    async openPath(path) {
      state.loading = true;
      const result = await window.swaycommand.project.read(path);
      return applyProject(result.doc, result.path);
    },

    async openTemplate(id) {
      state.loading = true;
      const result = await window.swaycommand.project.readTemplate(id);
      return applyProject(result.doc, null);
    },

    async openFromDialog() {
      const picked = await window.swaycommand.project.openDialog();
      if (!picked) return null;
      return this.openPath(picked.path);
    },

    async save() {
      if (!state.path) return this.saveAs();
      return saveTo(state.path);
    },

    async saveAs() {
      const picked = await window.swaycommand.project.saveDialog(state.name);
      if (!picked) return null;
      return saveTo(picked.path);
    },

    // Registers a picked audio file as project media and loads it into the
    // sampler pool; the kit surface assigns it to pads from there.
    async addMedia(file) {
      const p = project();
      if (!p) return null;
      const existing = p.media.find((m) => (m.resolvedPath || m.path) === file.path);
      const media = existing || {
        id: uid('m'),
        name: file.name,
        path: file.path,
        resolvedPath: file.path,
        sha256: null,
        bytes: null,
        duration: null,
      };
      const bytes = await window.swaycommand.files.readAudio(file.path);
      const info = await sampler.loadSample(media.id, bytes.slice().buffer, { name: media.name });
      if (info && info.duration) media.duration = info.duration;
      if (!existing) p.media.push(media);
      state.dirty = true;
      return media;
    },

    // Decodes a media entry for timeline use (drag onto the audio lane).
    async loadMediaBuffer(mediaId) {
      const p = project();
      const m = p && p.media.find((x) => x.id === mediaId);
      if (!m) return null;
      if (transport.hasBuffer(mediaId)) return transport.getBuffer(mediaId);
      const bytes = await readMediaBytes(m);
      const buffer = await audio.ctx.decodeAudioData(bytes.slice().buffer);
      m.duration = buffer.duration;
      transport.setBuffer(mediaId, buffer);
      return buffer;
    },
  };
}
