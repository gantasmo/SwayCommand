// Transport, timeline playback: any number of audio tracks (stems) and one
// visual track, on one clock. Audio clips are AudioBufferSourceNodes
// scheduled against the AudioContext clock (sample-accurate seek, loop and
// fades; the page CSP forbids file:// media, so buffers arrive decoded from
// the project store). The visual track never touches the engine directly:
// entering a clip fires the onVisualClip subscriber (the router), which
// decides cut versus crossfade.
//
// Clock: position = ctx.currentTime - startedAt while playing, so the
// transport cannot drift against the audio it schedules, and every stem on
// every track is scheduled from that one clock, that is what keeps them in
// sync. The loop seam is scheduled AHEAD on the context clock (the next pass
// is queued a quarter second before the seam), so it is sample-accurate too.
//
// Per track: clips -> [vst dry / wet mix] -> track input -> effect chain (live
// Web Audio nodes from audio/trackfx.js, in chain order) -> track gain -> mute
// / solo -> master. A track's VST chain is rendered offline (main/vsthost.js)
// to a wet media per source file; clips that have one play dry and wet
// together under `track.vst.mix`. Regions engage one parameter of one chain
// entry while the playhead is inside them. Stems launched from pads
// (launchStem) start on the next grid boundary at the offset the grid
// dictates, so a stem fired mid-song comes in exactly in phase with the
// timeline.

import { createFxNode, ensureWorklet } from './trackfx.js';
import { defaultAudioTrack, uid } from '../../shared/swayproject.js';
import { fxDefaults, fxClamp } from '../../shared/trackfx.js';

const LOOKAHEAD = 0.25; // seconds before the loop seam the next pass is queued
const QUANT_BEATS = { none: 0, beat: 1, bar: 4, twoBars: 8, fourBars: 16 };
const SNAP_BEATS = { off: 0, bar: 4, beat: 1, half: 0.5, quarter: 0.25 };

export function createTransport(ctx, destinationNodes) {
  const outs = Array.isArray(destinationNodes) ? destinationNodes : [destinationNodes];
  const master = ctx.createGain();
  for (const node of outs) {
    try {
      master.connect(node);
    } catch {
      /* duplicate connections are harmless */
    }
  }
  ensureWorklet(ctx);

  const state = {
    playing: false,
    position: 0,
    duration: 0,
    loop: { enabled: false, start: 0, end: 0 },
    activeVisualClip: null, // clip id or null
    bpm: 0,
    snap: 'beat',
  };

  let timeline = null; // the project.timeline object, edited live by the UI
  const buffers = new Map(); // mediaId -> AudioBuffer
  let startedAt = 0;
  let live = []; // [{ src, gain, clip, until }]
  let visualCb = null;
  let pendingVisualCause = null;
  let seamQueued = false; // the next loop pass is already scheduled
  let seamAt = 0; // context time of the queued seam

  // Live track graphs: trackId -> { input, vstDry, vstWet, chain: [{ entry, node }], gain, mute }
  const graphs = new Map();
  // Stems launched from pads: mediaId -> { src, gain, state, startAt, stopAt, track }
  const stems = new Map();
  const stemBus = ctx.createGain();
  stemBus.connect(master);
  // Region engagement: `${trackId}|${regionId}` -> the value to restore on exit
  const engaged = new Map();

  function audioTracks() {
    return timeline ? timeline.tracks.filter((t) => t.type === 'audio') : [];
  }
  function visualTrack() {
    return timeline ? timeline.tracks.find((t) => t.type === 'visual') : null;
  }
  function trackById(id) {
    return audioTracks().find((t) => t.id === id) || null;
  }
  function bpm() {
    return state.bpm > 0 ? state.bpm : 0;
  }
  function beatLen() {
    return 60 / (bpm() || 120);
  }

  function refreshDuration() {
    let end = 0;
    if (timeline) {
      for (const t of timeline.tracks) {
        for (const c of t.clips) end = Math.max(end, c.end);
      }
    }
    state.duration = end;
  }

  // --- track graphs ---------------------------------------------------------------

  function buildGraph(track) {
    const g = {
      input: ctx.createGain(),
      vstDry: ctx.createGain(),
      vstWet: ctx.createGain(),
      chain: [],
      gain: ctx.createGain(),
      mute: ctx.createGain(),
    };
    g.vstDry.connect(g.input);
    g.vstWet.connect(g.input);
    g.gain.gain.value = track.gain ?? 1;
    g.gain.connect(g.mute);
    g.mute.connect(master);
    graphs.set(track.id, g);
    wireChain(track, g);
    applyVstMix(track, g);
    return g;
  }

  // Rewires input -> enabled entries in order -> gain. Nodes are kept across
  // rewires by entry id, so a reorder or a toggle does not lose state.
  function wireChain(track, g) {
    g.input.disconnect();
    for (const c of g.chain) {
      try {
        c.node.output.disconnect();
      } catch {
        /* detached */
      }
    }
    const keep = new Map(g.chain.map((c) => [c.entry.id, c]));
    const next = [];
    for (const entry of track.fx) {
      let c = keep.get(entry.id);
      if (c && c.node.kind !== entry.kind) {
        c.node.dispose();
        c = null;
      }
      if (!c) {
        const node = createFxNode(ctx, entry.kind, entry.params, { bpm });
        if (!node) continue;
        c = { entry, node };
      } else {
        c.entry = entry;
      }
      keep.delete(entry.id);
      next.push(c);
    }
    for (const c of keep.values()) c.node.dispose(); // removed entries
    g.chain = next;
    let prev = g.input;
    for (const c of g.chain) {
      if (!c.entry.enabled) continue;
      prev.connect(c.node.input);
      prev = c.node.output;
    }
    prev.connect(g.gain);
  }

  function applyVstMix(track, g) {
    const m = Math.max(0, Math.min(1, track.vst ? track.vst.mix : 1));
    const now = ctx.currentTime;
    g.vstDry.gain.cancelScheduledValues(now);
    g.vstDry.gain.setValueAtTime(g.vstDry.gain.value, now);
    g.vstDry.gain.linearRampToValueAtTime(Math.cos(m * Math.PI * 0.5), now + 0.03);
    g.vstWet.gain.cancelScheduledValues(now);
    g.vstWet.gain.setValueAtTime(g.vstWet.gain.value, now);
    g.vstWet.gain.linearRampToValueAtTime(Math.sin(m * Math.PI * 0.5), now + 0.03);
  }

  function applyMutes() {
    const tracks = audioTracks();
    const anySolo = tracks.some((t) => t.solo);
    const now = ctx.currentTime;
    for (const t of tracks) {
      const g = graphs.get(t.id);
      if (!g) continue;
      const on = !t.muted && (!anySolo || t.solo);
      g.mute.gain.cancelScheduledValues(now);
      g.mute.gain.setValueAtTime(g.mute.gain.value, now);
      g.mute.gain.linearRampToValueAtTime(on ? 1 : 0, now + 0.02);
    }
  }

  function syncGraphs() {
    const ids = new Set();
    for (const t of audioTracks()) {
      ids.add(t.id);
      const g = graphs.get(t.id) || buildGraph(t);
      if (g.chain.length !== t.fx.length || g.chain.some((c, i) => c.entry !== t.fx[i])) wireChain(t, g);
    }
    for (const [id, g] of graphs) {
      if (ids.has(id)) continue;
      disposeGraph(g);
      graphs.delete(id);
    }
    applyMutes();
  }

  function disposeGraph(g) {
    for (const c of g.chain) c.node.dispose();
    for (const n of [g.input, g.vstDry, g.vstWet, g.gain, g.mute]) {
      try {
        n.disconnect();
      } catch {
        /* detached */
      }
    }
  }

  function syncGatePhases(position) {
    const bps = (bpm() || 120) / 60;
    for (const g of graphs.values()) {
      for (const c of g.chain) {
        if (c.node.kind !== 'gate') continue;
        const cycles = (position * bps) / c.node.params.rate;
        c.node.syncPhase(cycles - Math.floor(cycles));
      }
    }
  }

  // --- scheduling ------------------------------------------------------------------

  function stopSources() {
    for (const v of live) {
      try {
        v.src.onended = null;
        v.src.stop();
      } catch {
        /* already ended */
      }
      v.src.disconnect();
      v.gain.disconnect();
    }
    live = [];
    seamQueued = false;
  }

  function startSource(buffer, dest, when, offset, dur, level, fades) {
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    src.connect(gain);
    gain.connect(dest);
    gain.gain.setValueAtTime(level, when);
    if (fades) {
      if (fades.inLen > 0) {
        gain.gain.setValueAtTime(fades.inFrom, when);
        gain.gain.linearRampToValueAtTime(level, when + fades.inLen);
      }
      if (fades.outLen > 0 && fades.outAt >= 0) {
        gain.gain.setValueAtTime(level, when + fades.outAt);
        gain.gain.linearRampToValueAtTime(0, when + fades.outAt + fades.outLen);
      }
    }
    src.start(when, offset, dur);
    const entry = { src, gain, done: false };
    src.onended = () => {
      entry.done = true;
      try {
        src.disconnect();
        gain.disconnect();
      } catch {
        /* detached */
      }
    };
    return entry;
  }

  // Schedules every clip on every track that is still ahead of `position`,
  // playing from context time `at` (now by default). With the loop on, the
  // pass ends at loop.end; the next pass is queued from update() just ahead
  // of the seam. Clips whose buffer has not arrived yet are skipped;
  // setBuffer reschedules when it lands.
  function schedulePass(position, at) {
    const now = ctx.currentTime;
    const when0 = at === undefined ? now : at;
    const passEnd = state.loop.enabled ? state.loop.end : Infinity;
    for (const track of audioTracks()) {
      const g = graphs.get(track.id) || buildGraph(track);
      for (const clip of track.clips) {
        if (clip.end <= position || clip.start >= passEnd) continue;
        const buffer = buffers.get(clip.media);
        if (!buffer) continue;
        const wetId = track.vst && track.vst.renders ? track.vst.renders[clip.media] : null;
        const wet = wetId ? buffers.get(wetId) : null;

        const startsAhead = clip.start > position;
        const when = when0 + (startsAhead ? clip.start - position : 0);
        const offset = clip.offset + (startsAhead ? 0 : position - clip.start);
        const from = startsAhead ? clip.start : position;
        const remaining = Math.min(clip.end, passEnd) - from;
        if (remaining <= 0 || offset >= buffer.duration) continue;

        const level = clip.gain;
        const inEnd = clip.start + clip.fadeIn;
        const outStart = clip.end - clip.fadeOut;
        const fades = {
          inLen: clip.fadeIn > 0 && inEnd > from ? inEnd - from : 0,
          inFrom: startsAhead ? 0 : level * Math.min(1, (from - clip.start) / Math.max(clip.fadeIn, 1e-6)),
          outLen: clip.fadeOut > 0 && outStart > from ? clip.end - Math.max(outStart, from) : 0,
          outAt: clip.fadeOut > 0 && outStart > from ? outStart - from : -1,
        };
        const dur = Math.min(remaining, buffer.duration - offset);
        const dest = wet ? g.vstDry : g.input;
        live.push({ ...startSource(buffer, dest, when, offset, dur, level, fades), clip });
        if (wet && offset < wet.duration) {
          live.push({ ...startSource(wet, g.vstWet, when, offset, Math.min(remaining, wet.duration - offset), level, fades), clip });
        }
      }
    }
    syncGatePhases(position);
    // Reap finished sources so `live` stays bounded over a long set.
    live = live.filter((v) => !v.done);
  }

  function scheduleFrom(position) {
    stopSources();
    schedulePass(position);
    restemAt(position);
  }

  // --- visual lane -----------------------------------------------------------------

  function visualClipAt(position) {
    const track = visualTrack();
    if (!track) return null;
    for (const clip of track.clips) {
      if (position >= clip.start && position < clip.end) return clip;
    }
    return null;
  }

  function fireVisual(clip, cause) {
    state.activeVisualClip = clip ? clip.id : null;
    if (clip && visualCb) visualCb({ clip, cause });
  }

  function seekInternal(seconds, cause) {
    state.position = Math.max(0, Math.min(seconds, Math.max(state.duration, state.loop.enabled ? state.loop.end : 0)));
    if (state.playing) {
      startedAt = ctx.currentTime - state.position;
      scheduleFrom(state.position);
    }
    pendingVisualCause = null;
    fireVisual(visualClipAt(state.position), cause);
  }

  function pauseInternal() {
    if (!state.playing) return;
    state.position = ctx.currentTime - startedAt;
    state.playing = false;
    stopSources();
    stopAllStems(true);
  }

  // --- regions ----------------------------------------------------------------------

  function paramGet(track, fxId, key) {
    if (fxId === 'vst') return key === 'mix' ? track.vst.mix : null;
    const entry = track.fx.find((e) => e.id === fxId);
    if (!entry) return null;
    return key === 'enabled' ? (entry.enabled ? 1 : 0) : entry.params[key];
  }

  function paramSet(track, fxId, key, value) {
    const g = graphs.get(track.id);
    if (fxId === 'vst') {
      if (key !== 'mix') return false;
      track.vst.mix = Math.max(0, Math.min(1, Number(value) || 0));
      if (g) applyVstMix(track, g);
      return true;
    }
    const entry = track.fx.find((e) => e.id === fxId);
    if (!entry) return false;
    if (key === 'enabled') {
      const on = Number(value) >= 0.5;
      if (entry.enabled !== on) {
        entry.enabled = on;
        if (g) wireChain(track, g);
      }
      return true;
    }
    const v = fxClamp(entry.kind, key, value);
    if (v === null) return false;
    entry.params[key] = v;
    const c = g && g.chain.find((x) => x.entry === entry);
    if (c) c.node.set(key, v);
    return true;
  }

  function updateRegions(position) {
    for (const track of audioTracks()) {
      for (const r of track.regions) {
        const key = `${track.id}|${r.id}`;
        const inside = state.playing && position >= r.start && position < r.end;
        const was = engaged.has(key);
        if (inside && !was) {
          engaged.set(key, paramGet(track, r.fx, r.param));
          paramSet(track, r.fx, r.param, r.value);
        } else if (!inside && was) {
          const back = engaged.get(key);
          engaged.delete(key);
          if (back !== null && back !== undefined) paramSet(track, r.fx, r.param, back);
        }
      }
    }
  }

  function releaseRegions() {
    for (const [key, back] of engaged) {
      const [tid, rid] = key.split('|');
      const track = trackById(tid);
      const r = track && track.regions.find((x) => x.id === rid);
      if (track && r && back !== null && back !== undefined) paramSet(track, r.fx, r.param, back);
    }
    engaged.clear();
  }

  // --- stems launched from pads -------------------------------------------------

  function quantSeconds(quant) {
    const beats = QUANT_BEATS[quant] ?? 4;
    return beats * beatLen();
  }

  function nextBoundary(position, quant) {
    const q = quantSeconds(quant);
    if (q <= 0) return position;
    return Math.ceil((position + 0.005) / q) * q;
  }

  function stemDest(trackId) {
    const t = trackId && trackById(trackId);
    if (t) return (graphs.get(t.id) || buildGraph(t)).input;
    return stemBus;
  }

  function startStemAt(mediaId, s, gridTime, ctxWhen) {
    const buffer = buffers.get(mediaId);
    if (!buffer) return;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctxWhen);
    gain.gain.linearRampToValueAtTime(s.gain, ctxWhen + 0.004);
    src.connect(gain);
    gain.connect(stemDest(s.track));
    // Phase-locked: the stem plays as if it had run from the timeline's zero.
    const offset = ((gridTime % buffer.duration) + buffer.duration) % buffer.duration;
    src.start(ctxWhen, offset);
    src.onended = () => {
      if (s.src === src) {
        s.src = null;
        s.state = 'off';
      }
    };
    s.src = src;
    s.gainNode = gain;
    s.startAt = ctxWhen;
    s.state = 'pending';
  }

  function restemAt(position) {
    // After a seek or reschedule, every sounding stem re-phases to the new position.
    const now = ctx.currentTime;
    for (const [mediaId, s] of stems) {
      if (s.state === 'off' || s.state === 'stopping') continue;
      if (s.src) {
        try {
          s.src.onended = null;
          s.src.stop();
          s.src.disconnect();
          s.gainNode.disconnect();
        } catch {
          /* gone */
        }
      }
      startStemAt(mediaId, s, position, now);
      s.state = 'on';
    }
  }

  function launchStem(mediaId, opts = {}) {
    if (!buffers.has(mediaId)) return 'missing';
    if (!state.playing) play();
    const s = stems.get(mediaId) || { src: null, gainNode: null, state: 'off', track: null, gain: 1, quant: 'bar' };
    s.track = opts.track || null;
    s.gain = Math.max(0, Math.min(4, opts.gain ?? 1));
    s.quant = opts.quant || 'bar';
    stems.set(mediaId, s);
    const pos = ctx.currentTime - startedAt;
    const gridT = nextBoundary(pos, s.quant);
    const when = ctx.currentTime + (gridT - pos);
    if (s.src) {
      try {
        s.src.onended = null;
        s.src.stop(when);
      } catch {
        /* gone */
      }
    }
    startStemAt(mediaId, s, gridT, when);
    return 'pending';
  }

  function stopStem(mediaId, quant) {
    const s = stems.get(mediaId);
    if (!s || !s.src || s.state === 'off') return;
    const pos = ctx.currentTime - startedAt;
    const gridT = nextBoundary(pos, quant || s.quant);
    const when = ctx.currentTime + Math.max(0, gridT - pos);
    s.state = 'stopping';
    try {
      s.gainNode.gain.setValueAtTime(s.gain, when);
      s.gainNode.gain.linearRampToValueAtTime(0, when + 0.01);
      s.src.stop(when + 0.02);
    } catch {
      /* gone */
    }
  }

  function stopAllStems(now) {
    for (const [, s] of stems) {
      if (!s.src) continue;
      try {
        s.src.onended = null;
        if (now) s.src.stop();
        else s.src.stop(ctx.currentTime + 0.02);
      } catch {
        /* gone */
      }
      s.src = null;
      s.state = 'off';
    }
  }

  function stemState(mediaId) {
    const s = stems.get(mediaId);
    if (!s || !s.src) return 'off';
    if (s.state === 'pending' && ctx.currentTime >= s.startAt) s.state = 'on';
    return s.state;
  }

  // --- public ----------------------------------------------------------------------

  function play() {
    if (state.playing || !timeline) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    state.playing = true;
    startedAt = ctx.currentTime - state.position;
    scheduleFrom(state.position);
    pendingVisualCause = null;
    fireVisual(visualClipAt(state.position), 'play');
  }

  return {
    state,

    setTimeline(tl) {
      timeline = tl;
      refreshDuration();
      state.loop = tl ? tl.loop : { enabled: false, start: 0, end: 0 };
      state.bpm = tl ? tl.bpm || 0 : 0;
      state.snap = tl ? tl.snap || 'beat' : 'beat';
      stopSources();
      stopAllStems(true);
      stems.clear();
      engaged.clear();
      state.playing = false;
      state.position = 0;
      state.activeVisualClip = null;
      for (const g of graphs.values()) disposeGraph(g);
      graphs.clear();
      if (tl) syncGraphs();
    },

    // Re-sorts clips and recomputes duration after the UI edits the timeline
    // in place; rebuilds track graphs that changed; reschedules if rolling.
    refresh() {
      if (!timeline) return;
      for (const t of timeline.tracks) t.clips.sort((a, b) => a.start - b.start);
      for (const t of audioTracks()) t.regions.sort((a, b) => a.start - b.start);
      refreshDuration();
      syncGraphs();
      if (state.playing) scheduleFrom(ctx.currentTime - startedAt);
    },

    setBuffer(mediaId, audioBuffer) {
      if (audioBuffer) buffers.set(mediaId, audioBuffer);
      else buffers.delete(mediaId);
      if (state.playing) scheduleFrom(ctx.currentTime - startedAt);
    },
    hasBuffer(mediaId) {
      return buffers.has(mediaId);
    },
    getBuffer(mediaId) {
      return buffers.get(mediaId) || null;
    },

    play,
    pause: pauseInternal,

    stop() {
      state.playing = false;
      stopSources();
      stopAllStems(true);
      releaseRegions();
      state.position = 0;
      state.activeVisualClip = null;
    },

    seek(seconds) {
      seekInternal(seconds, 'seek');
    },

    setLoop(start, end, enabled) {
      state.loop.start = Math.max(0, start);
      state.loop.end = Math.max(state.loop.start, end);
      state.loop.enabled = !!enabled && state.loop.end > state.loop.start;
      if (timeline) timeline.loop = state.loop;
      if (state.playing) scheduleFrom(ctx.currentTime - startedAt);
    },

    onVisualClip(cb) {
      visualCb = cb;
    },

    update() {
      if (!state.playing) return;
      const now = ctx.currentTime;
      state.position = now - startedAt;
      if (state.loop.enabled) {
        // Queue the next pass just ahead of the seam so the crossing is on
        // the audio clock, not on this frame.
        if (!seamQueued && state.loop.end - state.position < LOOKAHEAD && state.loop.end > state.loop.start) {
          seamAt = now + (state.loop.end - state.position);
          schedulePass(state.loop.start, seamAt);
          seamQueued = true;
        }
        if (seamQueued && now >= seamAt) {
          startedAt += state.loop.end - state.loop.start;
          state.position = now - startedAt;
          seamQueued = false;
          pendingVisualCause = 'seek';
          // Stems re-phase across the seam (the seam is a jump on the grid).
          restemAt(state.position);
        }
      } else if (state.position >= state.duration && state.duration > 0 && stems.size === 0) {
        pauseInternal();
        state.position = state.duration;
        releaseRegions();
        return;
      }
      updateRegions(state.position);
      const clip = visualClipAt(state.position);
      const id = clip ? clip.id : null;
      if (id !== state.activeVisualClip) fireVisual(clip, pendingVisualCause || 'boundary');
      pendingVisualCause = null;
    },

    collect() {
      if (timeline) {
        refreshDuration();
        timeline.bpm = state.bpm;
        timeline.snap = state.snap;
      }
      return timeline;
    },

    // --- grid -------------------------------------------------------------------
    setBpm(v) {
      const b = Math.max(0, Math.min(400, Number(v) || 0));
      state.bpm = b;
      if (timeline) timeline.bpm = b;
      for (const g of graphs.values()) for (const c of g.chain) c.node.retune();
    },
    setSnap(s) {
      state.snap = SNAP_BEATS[s] !== undefined ? s : 'beat';
      if (timeline) timeline.snap = state.snap;
    },
    beatSeconds: beatLen,
    // Snaps a time to the grid (beats when the tempo is known; half seconds
    // otherwise (the old behaviour) so an untimed session still lines up).
    snapTime(t) {
      const beats = SNAP_BEATS[state.snap] || 0;
      const q = beats > 0 ? (bpm() > 0 ? beats * beatLen() : 0.5) : 0;
      return q > 0 ? Math.max(0, Math.round(t / q) * q) : Math.max(0, t);
    },
    nextBoundary,

    // --- tracks -----------------------------------------------------------------
    tracks: audioTracks,
    trackById,
    addTrack(name) {
      if (!timeline) return null;
      const t = defaultAudioTrack(uid('t'), name || `Audio ${audioTracks().length + 1}`);
      const vi = timeline.tracks.findIndex((x) => x.type === 'visual');
      timeline.tracks.splice(vi < 0 ? timeline.tracks.length : vi, 0, t);
      syncGraphs();
      return t;
    },
    removeTrack(id) {
      if (!timeline) return false;
      if (audioTracks().length <= 1) return false;
      const i = timeline.tracks.findIndex((t) => t.id === id && t.type === 'audio');
      if (i < 0) return false;
      timeline.tracks.splice(i, 1);
      for (const [key] of engaged) if (key.startsWith(`${id}|`)) engaged.delete(key);
      syncGraphs();
      refreshDuration();
      if (state.playing) scheduleFrom(ctx.currentTime - startedAt);
      return true;
    },
    setTrackGain(id, v) {
      const t = trackById(id);
      if (!t) return;
      t.gain = Math.max(0, Math.min(2, Number(v) || 0));
      const g = graphs.get(id);
      if (g) {
        const now = ctx.currentTime;
        g.gain.gain.cancelScheduledValues(now);
        g.gain.gain.setValueAtTime(g.gain.gain.value, now);
        g.gain.gain.linearRampToValueAtTime(t.gain, now + 0.03);
      }
    },
    setTrackMute(id, on) {
      const t = trackById(id);
      if (!t) return;
      t.muted = !!on;
      applyMutes();
    },
    setTrackSolo(id, on) {
      const t = trackById(id);
      if (!t) return;
      t.solo = !!on;
      applyMutes();
    },

    // --- effect chain -------------------------------------------------------------
    addFx(trackId, kind) {
      const t = trackById(trackId);
      const params = fxDefaults(kind);
      if (!t || !params) return null;
      const entry = { id: uid('fx'), kind, enabled: true, params };
      t.fx.push(entry);
      syncGraphs();
      return entry;
    },
    removeFx(trackId, fxId) {
      const t = trackById(trackId);
      if (!t) return false;
      const i = t.fx.findIndex((e) => e.id === fxId);
      if (i < 0) return false;
      t.fx.splice(i, 1);
      t.regions = t.regions.filter((r) => r.fx !== fxId);
      syncGraphs();
      return true;
    },
    moveFx(trackId, fxId, dir) {
      const t = trackById(trackId);
      if (!t) return false;
      const i = t.fx.findIndex((e) => e.id === fxId);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= t.fx.length) return false;
      [t.fx[i], t.fx[j]] = [t.fx[j], t.fx[i]];
      syncGraphs();
      return true;
    },
    // The one entry point the router and the panel share: fxId 'vst' + key
    // 'mix' is the VST wet/dry; otherwise a chain entry's param or 'enabled'.
    setTrackParam(trackId, fxId, key, value) {
      const t = trackById(trackId);
      return t ? paramSet(t, fxId, key, value) : false;
    },
    getTrackParam(trackId, fxId, key) {
      const t = trackById(trackId);
      return t ? paramGet(t, fxId, key) : null;
    },
    setVstMix(trackId, v) {
      const t = trackById(trackId);
      return t ? paramSet(t, 'vst', 'mix', v) : false;
    },
    // A VST render landed: wet media for a source media on this track.
    setRender(trackId, srcMedia, wetMedia) {
      const t = trackById(trackId);
      if (!t) return;
      if (wetMedia) t.vst.renders[srcMedia] = wetMedia;
      else delete t.vst.renders[srcMedia];
      if (state.playing) scheduleFrom(ctx.currentTime - startedAt);
    },

    // --- regions ------------------------------------------------------------------
    addRegion(trackId, start, end, fxId, param, value) {
      const t = trackById(trackId);
      if (!t) return null;
      const r = { id: uid('rg'), start: Math.max(0, start), end: Math.max(start + 0.05, end), fx: fxId, param, value };
      t.regions.push(r);
      t.regions.sort((a, b) => a.start - b.start);
      return r;
    },
    removeRegion(trackId, regionId) {
      const t = trackById(trackId);
      if (!t) return false;
      const i = t.regions.findIndex((r) => r.id === regionId);
      if (i < 0) return false;
      const key = `${trackId}|${regionId}`;
      if (engaged.has(key)) {
        const back = engaged.get(key);
        engaged.delete(key);
        if (back !== null && back !== undefined) paramSet(t, t.regions[i].fx, t.regions[i].param, back);
      }
      t.regions.splice(i, 1);
      return true;
    },

    // --- stems --------------------------------------------------------------------
    launchStem,
    stopStem,
    stemState,
    toggleStem(mediaId, opts) {
      const s = stemState(mediaId);
      if (s === 'off' || s === 'stopping') return launchStem(mediaId, opts);
      stopStem(mediaId, opts && opts.quant);
      return 'stopping';
    },

    dispose() {
      stopSources();
      stopAllStems(true);
      for (const g of graphs.values()) disposeGraph(g);
      graphs.clear();
      stemBus.disconnect();
      master.disconnect();
      buffers.clear();
    },
  };
}
