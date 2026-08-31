// Sample/stem playback, the Sway's 16 pads as a WebAudio kit.
//
// The caller owns the AudioContext (engine/audio.js builds it) and passes the
// nodes the master bus feeds: ctx.destination for the speakers AND the engine
// analyser, so every stem the DJ fires is heard and drives the visuals at the
// same time. Pure module: no DOM, no fetch, no filesystem, the caller hands
// us ArrayBuffers and we decode them.
//
// Knob idiom follows engine.js: the 0.5 detent is "untouched" and every mapped
// knob is neutral there (unity gain, filter open, rate 1.0, send dry), so a
// controller nobody has moved never muffles or duplicates the kit.

const PAD_COUNT = 16;
const MAX_VOICES = 32; // sounding voices; the oldest is stolen past this
const POOL_SIZE = MAX_VOICES + 8; // headroom so a stolen voice can fade on its own slot
const KIT_VERSION = 1;

const MIN_GAIN = 0.0001; // exponential ramps never touch zero
const ATTACK = 0.004; // declick on note-on
const RELEASE = 0.03; // gate note-off / loop toggle-off
const CHOKE = 0.012; // hi-hat choke and voice steal
const SMOOTH = 0.02; // knob and master parameter ramps

const MASTER_MAX = 2; // knob 4 detent (0.5) => unity
const CUT_MIN = 120;
const RATE_MIN = 0.5;
const RATE_MAX = 2;
const SEND_MAX = 0.8;
const MODES = ['oneshot', 'loop', 'gate'];

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
// strict: only real numbers count, so JSON nulls and stray strings fall back
const num = (v, def, lo, hi) => (typeof v === 'number' && Number.isFinite(v) ? clamp(v, lo, hi) : def);

export function createSampler(ctx, destinationNodes) {
  if (!ctx || typeof ctx.createGain !== 'function') {
    throw new Error('sampler: createSampler(ctx, destinationNodes) needs an AudioContext');
  }

  // --- master chain ------------------------------------------------------------
  // voice -> voiceGain -> filter -> masterGain -> destinations
  //                          \-> send -> delay -> masterGain
  //                                       \-> feedback -/

  const cutMax = Math.min(20000, ctx.sampleRate * 0.45);

  const masterGain = ctx.createGain();
  masterGain.gain.value = 1;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0.7; // flat, this is a sweep, not a resonator
  filter.frequency.value = cutMax; // open until knob 5 is moved
  filter.connect(masterGain);

  const send = ctx.createGain();
  send.gain.value = 0; // dry until knob 7 is moved
  const delay = ctx.createDelay(1.5);
  delay.delayTime.value = 0.28;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.34;

  filter.connect(send);
  send.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(masterGain);

  // whatever the caller gave us: speakers, analyser, a recorder, anything
  const outs = [];
  const wanted = Array.isArray(destinationNodes) ? destinationNodes : [destinationNodes];
  for (const node of wanted) {
    if (!node || typeof node.connect !== 'function') continue;
    try {
      masterGain.connect(node);
      outs.push(node);
    } catch {
      // incompatible target, skip it rather than kill the whole kit
    }
  }

  // --- state -------------------------------------------------------------------

  const samples = new Map(); // id -> { id, name, buffer, duration, channels }
  const pads = new Array(PAD_COUNT).fill(null); // index -> assignment | null
  const latch = new Map(); // padIndex -> slot, for loop/gate pads that hold a voice

  let masterLevel = 1;
  let rate = 1; // knob 6, multiplied into every voice's playbackRate
  let disposed = false;

  // --- voice pool --------------------------------------------------------------
  // Gain nodes and voice records are allocated once. A trigger only ever
  // allocates the AudioBufferSourceNode that Web Audio forces us to make fresh.

  const pool = [];
  const free = [];
  const active = []; // oldest first, steal order

  for (let i = 0; i < POOL_SIZE; i++) {
    const g = ctx.createGain();
    g.gain.value = 0;
    g.connect(filter);
    const slot = {
      gain: g,
      source: null,
      padIndex: -1,
      sampleId: null,
      chokeGroup: null,
      mode: 'oneshot',
      pitch: 1,
      ending: false,
      onEnded: null,
    };
    // one closure per slot, made once, never per trigger
    slot.onEnded = (ev) => endVoice(slot, ev && ev.target);
    pool.push(slot);
    free.push(slot);
  }

  // --- param helpers -----------------------------------------------------------

  function rampTo(param, value, time = SMOOTH) {
    const now = ctx.currentTime;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now); // reading .value picks up mid-ramp automation
    param.linearRampToValueAtTime(value, now + time);
  }

  // exponential feels right for frequency, but both ends must stay off zero
  function rampExp(param, value, time = SMOOTH) {
    const now = ctx.currentTime;
    const from = Math.max(param.value, MIN_GAIN);
    param.cancelScheduledValues(now);
    param.setValueAtTime(from, now);
    param.exponentialRampToValueAtTime(Math.max(value, MIN_GAIN), now + time);
  }

  const padIndexOf = (v) => {
    const i = Number(v);
    return Number.isInteger(i) && i >= 0 && i < PAD_COUNT ? i : -1;
  };
  // choke groups round-trip through JSON, so compare them as strings
  const chokeKey = (v) => (v === null || v === undefined || v === '' ? null : String(v));

  // --- voice lifecycle ---------------------------------------------------------

  function soundingCount() {
    let n = 0;
    for (let i = 0; i < active.length; i++) if (!active[i].ending) n++;
    return n;
  }

  function oldestSounding() {
    for (let i = 0; i < active.length; i++) if (!active[i].ending) return active[i];
    return null;
  }

  // Fade a voice out and schedule its stop; onended does the bookkeeping.
  function stopSlot(slot, releaseTime) {
    if (!slot || !slot.source || slot.ending) return;
    slot.ending = true;
    const now = ctx.currentTime;
    const g = slot.gain.gain;
    const from = Math.max(g.value, MIN_GAIN); // never ramp exponentially from zero
    g.cancelScheduledValues(now);
    g.setValueAtTime(from, now);
    g.exponentialRampToValueAtTime(MIN_GAIN, now + releaseTime);
    g.setValueAtTime(0, now + releaseTime + 0.001);
    if (latch.get(slot.padIndex) === slot) latch.delete(slot.padIndex);
    try {
      slot.source.stop(now + releaseTime + 0.005);
    } catch {
      endVoice(slot, slot.source); // never started, reclaim it now
    }
  }

  // The only path that returns a slot to the pool. Every started source routes
  // here through onended, so nothing leaks across a long set.
  function endVoice(slot, src) {
    const cur = slot.source;
    if (src && src !== cur) {
      // a stale ended event from a source this slot has already moved past
      try {
        src.disconnect();
      } catch {}
      return;
    }
    if (!cur) return;
    cur.onended = null;
    try {
      cur.stop();
    } catch {}
    try {
      cur.disconnect();
    } catch {}
    if (latch.get(slot.padIndex) === slot) latch.delete(slot.padIndex);
    slot.source = null;
    slot.ending = false;
    slot.padIndex = -1;
    slot.sampleId = null;
    slot.chokeGroup = null;
    const now = ctx.currentTime;
    slot.gain.gain.cancelScheduledValues(now);
    slot.gain.gain.setValueAtTime(0, now);
    const at = active.indexOf(slot);
    if (at >= 0) active.splice(at, 1);
    if (free.indexOf(slot) < 0) free.push(slot);
  }

  function takeSlot() {
    let guard = POOL_SIZE;
    while (soundingCount() >= MAX_VOICES && guard-- > 0) {
      const victim = oldestSounding();
      if (!victim) break;
      stopSlot(victim, CHOKE);
    }
    let slot = free.pop();
    if (!slot && active.length) {
      // pool exhausted by release tails, reclaim the oldest outright
      endVoice(active[0], active[0].source);
      slot = free.pop();
    }
    return slot || null;
  }

  function chokeVoices(group) {
    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i].chokeGroup === group) stopSlot(active[i], CHOKE);
    }
  }

  function stopVoicesOf(sampleId, releaseTime) {
    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i].sampleId === sampleId) stopSlot(active[i], releaseTime);
    }
  }

  function startVoice(pad, sample, padIndex, velocity) {
    const slot = takeSlot();
    if (!slot) return null;

    const src = ctx.createBufferSource(); // the one unavoidable per-trigger allocation
    src.buffer = sample.buffer;
    src.loop = pad.loop;
    src.playbackRate.value = clamp(pad.pitch * rate, 0.0625, 16);
    src.onended = slot.onEnded;
    src.connect(slot.gain);

    const now = ctx.currentTime;
    const g = slot.gain.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(0, now);
    g.linearRampToValueAtTime(clamp(pad.gain * velocity, 0, 4), now + ATTACK);

    slot.source = src;
    slot.padIndex = padIndex;
    slot.sampleId = pad.id;
    slot.chokeGroup = pad.chokeGroup;
    slot.mode = pad.mode;
    slot.pitch = pad.pitch;
    slot.ending = false;
    active.push(slot);

    try {
      src.start(now);
    } catch {
      endVoice(slot, src);
      return null;
    }
    return slot;
  }

  // --- samples -----------------------------------------------------------------

  // Decode an ArrayBuffer (or view) into the kit. Re-loading an id replaces it.
  async function loadSample(id, arrayBuffer, meta) {
    if (disposed) throw new Error('sampler: loadSample after dispose()');
    const key = id === null || id === undefined ? '' : String(id);
    if (!key) throw new Error('sampler: loadSample needs a non-empty id');

    let bytes = null;
    if (arrayBuffer instanceof ArrayBuffer) {
      // decodeAudioData detaches what it is given, so hand it a copy
      bytes = arrayBuffer.slice(0);
    } else if (arrayBuffer && arrayBuffer.buffer instanceof ArrayBuffer) {
      bytes = arrayBuffer.buffer.slice(arrayBuffer.byteOffset, arrayBuffer.byteOffset + arrayBuffer.byteLength);
    }
    if (!bytes || bytes.byteLength === 0) {
      throw new Error(`sampler: "${key}" carries no audio data (empty or detached buffer)`);
    }

    let buffer;
    try {
      // accept both the promise and the legacy callback form of decodeAudioData
      buffer = await new Promise((resolve, reject) => {
        const p = ctx.decodeAudioData(bytes, resolve, reject);
        if (p && typeof p.then === 'function') p.then(resolve, reject);
      });
    } catch (err) {
      const why = err && err.message ? err.message : 'unsupported or corrupt audio';
      throw new Error(`sampler: could not decode "${key}", ${why}`);
    }
    if (!buffer || !buffer.length) throw new Error(`sampler: "${key}" decoded to an empty buffer`);

    if (samples.has(key)) stopVoicesOf(key, CHOKE); // don't leave a loop on the old buffer
    const name = meta && meta.name ? String(meta.name) : key;
    samples.set(key, { id: key, name, buffer, duration: buffer.duration, channels: buffer.numberOfChannels });
    return { id: key, name, duration: buffer.duration, channels: buffer.numberOfChannels };
  }

  // Free a buffer and clear every pad that pointed at it.
  function removeSample(id) {
    if (disposed) return false;
    const key = id === null || id === undefined ? '' : String(id);
    if (!samples.has(key)) return false;
    stopVoicesOf(key, CHOKE);
    samples.delete(key);
    for (let i = 0; i < PAD_COUNT; i++) if (pads[i] && pads[i].id === key) clearPad(i);
    return true;
  }

  function listSamples() {
    const out = [];
    for (const s of samples.values()) {
      out.push({ id: s.id, name: s.name, duration: s.duration, channels: s.channels });
    }
    return out;
  }

  // --- pads and kits -----------------------------------------------------------

  // options: { gain=1, pitch=1, loop=false, chokeGroup=null, mode='oneshot' }
  function assignPad(padIndex, id, options) {
    if (disposed) return false;
    const i = padIndexOf(padIndex);
    if (i < 0) return false;
    if (id === null || id === undefined || id === '') {
      clearPad(i);
      return true;
    }
    const key = String(id);
    if (!samples.has(key)) return false; // load first, then assign

    const o = options || {};
    const mode = MODES.indexOf(o.mode) >= 0 ? o.mode : 'oneshot';
    // a looping oneshot would never release its voice, so looping belongs to
    // loop pads (always) and gate pads (opt-in) only
    const loop = mode === 'loop' ? true : mode === 'gate' ? !!o.loop : false;

    clearPad(i);
    pads[i] = {
      id: key,
      gain: num(o.gain, 1, 0, 4),
      pitch: num(o.pitch, 1, 0.25, 4),
      loop,
      chokeGroup: chokeKey(o.chokeGroup),
      mode,
    };
    return true;
  }

  function clearPad(padIndex) {
    if (disposed) return false;
    const i = padIndexOf(padIndex);
    if (i < 0) return false;
    const held = latch.get(i);
    if (held) stopSlot(held, RELEASE);
    latch.delete(i);
    if (!pads[i]) return false;
    pads[i] = null;
    return true;
  }

  // Plain JSON: { version, pads: [ null | {id,gain,pitch,loop,chokeGroup,mode} ] }
  function getKit() {
    return {
      version: KIT_VERSION,
      pads: pads.map((p) =>
        p ? { id: p.id, gain: p.gain, pitch: p.pitch, loop: p.loop, chokeGroup: p.chokeGroup, mode: p.mode } : null
      ),
    };
  }

  // Restores assignments over already-loaded samples. Anything it cannot place
  // comes back in the result, a kit referencing a missing stem never throws.
  function setKit(kit) {
    const result = { ok: false, version: 0, restored: 0, missing: [], rejected: [] };
    if (disposed) return result;
    if (!kit || typeof kit !== 'object' || !Array.isArray(kit.pads)) return result;
    result.version = typeof kit.version === 'number' ? kit.version : 0;

    for (let i = 0; i < PAD_COUNT; i++) clearPad(i);

    const n = Math.min(kit.pads.length, PAD_COUNT);
    for (let i = 0; i < n; i++) {
      const p = kit.pads[i];
      if (!p || typeof p !== 'object' || p.id === null || p.id === undefined || p.id === '') continue;
      const key = String(p.id);
      if (!samples.has(key)) {
        if (result.missing.indexOf(key) < 0) result.missing.push(key);
        continue;
      }
      if (assignPad(i, key, p)) result.restored++;
      else result.rejected.push(i);
    }
    result.ok = true; // the kit was readable; misses are reported above
    return result;
  }

  // --- playing -----------------------------------------------------------------

  // Strike a pad. velocity 0..1 scales the pad's gain.
  function trigger(padIndex, velocity) {
    if (disposed) return;
    const i = padIndexOf(padIndex);
    if (i < 0) return;
    const pad = pads[i];
    if (!pad) return;
    const sample = samples.get(pad.id);
    if (!sample || !sample.buffer) return; // sample was removed under the pad

    const raw = velocity === null || velocity === undefined ? 1 : Number(velocity);
    if (!Number.isFinite(raw)) return;
    const vel = clamp(raw, 0, 1);
    if (vel <= 0) {
      release(i); // note-on at velocity 0 is a note-off
      return;
    }

    // an idle context is the usual reason "nothing came out of the speakers"
    if (ctx.state === 'suspended' && typeof ctx.resume === 'function') ctx.resume().catch(() => {});

    const held = latch.get(i);
    if (pad.mode === 'loop' && held && held.source && !held.ending) {
      stopSlot(held, RELEASE); // alternate strikes toggle the loop off
      return;
    }
    if (pad.mode === 'gate' && held) stopSlot(held, CHOKE); // retrigger while held

    if (pad.chokeGroup !== null) chokeVoices(pad.chokeGroup); // hi-hat choke

    const slot = startVoice(pad, sample, i, vel);
    if (slot && pad.mode !== 'oneshot') latch.set(i, slot);
  }

  // Note-off. Only gate pads respond, loop pads latch until the next strike.
  function release(padIndex) {
    if (disposed) return;
    const i = padIndexOf(padIndex);
    if (i < 0) return;
    const held = latch.get(i);
    if (!held || held.mode !== 'gate') return;
    stopSlot(held, RELEASE);
  }

  function stopAll() {
    if (disposed) return;
    for (let i = active.length - 1; i >= 0; i--) stopSlot(active[i], CHOKE);
    latch.clear();
  }

  // --- master and knobs --------------------------------------------------------

  function setMasterGain(v) {
    if (disposed) return;
    if (typeof v !== 'number' || !Number.isFinite(v)) return;
    masterLevel = clamp(v, 0, MASTER_MAX);
    rampTo(masterGain.gain, masterLevel); // linear: it is allowed to reach zero
  }

  const getMasterGain = () => masterLevel;

  // Knobs 0-2 are engine-reserved (hue, fade time, intensity) and 3 is unmapped;
  // 4..7 are master gain, cutoff, playback rate, delay send.
  function setKnob(index, value) {
    if (disposed) return;
    if (!Number.isInteger(index) || index < 4 || index > 7) return;
    const raw = Number(value);
    if (!Number.isFinite(raw)) return;
    const v = clamp(raw, 0, 1);

    if (index === 4) {
      setMasterGain(v * MASTER_MAX); // detent 0.5 => unity
    } else if (index === 5) {
      // bottom half sweeps 120 Hz -> open, top half stays open, so an
      // untouched 0.5 knob never muffles the kit
      rampExp(filter.frequency, v <= 0.5 ? CUT_MIN * Math.pow(cutMax / CUT_MIN, v * 2) : cutMax);
    } else if (index === 6) {
      rate = RATE_MIN * Math.pow(RATE_MAX / RATE_MIN, v); // detent 0.5 => 1.0
      const now = ctx.currentTime;
      for (let i = 0; i < active.length; i++) {
        const slot = active[i];
        if (!slot.source) continue;
        const p = slot.source.playbackRate;
        p.cancelScheduledValues(now);
        p.setValueAtTime(p.value, now);
        p.linearRampToValueAtTime(clamp(slot.pitch * rate, 0.0625, 16), now + SMOOTH);
      }
    } else {
      const wet = Math.max(0, (v - 0.5) * 2); // dry below the detent
      rampTo(send.gain, wet * wet * SEND_MAX);
    }
  }

  // --- teardown ----------------------------------------------------------------

  function dispose() {
    if (disposed) return;
    disposed = true;
    for (let i = active.length - 1; i >= 0; i--) endVoice(active[i], active[i].source);
    active.length = 0;
    free.length = 0;
    latch.clear();
    for (const slot of pool) {
      try {
        slot.gain.disconnect();
      } catch {}
    }
    pool.length = 0;
    // let go of the caller's nodes first, the analyser and speakers outlive us
    for (const node of outs) {
      try {
        masterGain.disconnect(node);
      } catch {}
    }
    outs.length = 0;
    for (const node of [filter, send, delay, feedback, masterGain]) {
      try {
        node.disconnect();
      } catch {}
    }
    samples.clear();
    pads.fill(null);
  }

  return {
    loadSample,
    removeSample,
    listSamples,
    assignPad,
    clearPad,
    getKit,
    setKit,
    trigger,
    release,
    setMasterGain,
    getMasterGain,
    setKnob,
    stopAll,
    dispose,
  };
}
