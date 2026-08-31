// SwayCommand synth, a Vital-class wavetable synthesizer in Web Audio.
//
// WHY VITAL: Audima's downloads page recommends Vital to first-timers ("Vital
// Synth Pack Free · Best for Beginners") and ships a Sway project for it. This
// engine targets the same feature set so a Sway owner has an instrument in the
// box, without leaving the app to install a plugin.
//
// THEDAW ALIGNMENT: this module is deliberately shaped to lift into theDAW.
//   * `voiceTrigger()` returns a function with theDAW's exact VoiceTrigger
//     signature ((ctx, dest, midi, velocity, when, duration, master)) so a
//     patch drops into every place theDAW uses a voice: piano-roll preview,
//     offline bounce, init render, timeline.
//   * `controlManifest()` returns theDAW's VisualControl shape
//     ({ key, label, kind: 'range'|'toggle', group, min, max, step }), which is
//     what its control-sync bus and MIDI mapper consume.
//   * The factory-function form, the `ctx`-in / destination-array-out
//     construction, and the no-DOM rule match sampler.js and audio.js here.
//
// SIGNAL PATH (per voice)
//   osc1 ─┐
//   osc2 ─┼─ mix ─ filter1 ─ filter2 ─ ampEnv ─ voiceGain ─┐
//   osc3 ─┤                                                 │
//   sub  ─┤                                                 ├─ FX chain ─ master
//   noise─┘                                                 │
// Each oscillator is a unison stack of detuned pairs; each pair crossfades two
// PeriodicWave frames to realise the wavetable morph (see wavetables.js).
//
// MODULATION: envelopes are per-voice (scheduled AudioParam automation); LFOs
// are global nodes fanned into per-voice gains, which is how they stay cheap.
// The mod matrix is a list of { source, dest, amount } applied at note-on for
// envelope sources and as live node connections for LFO sources.

import { createWavetableBank, TABLE_NAMES } from './wavetables.js';

const MAX_VOICES = 16;
const LFO_COUNT = 4;
const mtof = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

// Soft-clip curves cached by drive, after theDAW's synthVoiceKit.distCurve.
const distCurves = new Map();
function distCurve(amount) {
  const cached = distCurves.get(amount);
  if (cached) return cached;
  const n = 1024;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = ((1 + amount) * x) / (1 + amount * Math.abs(x));
  }
  distCurves.set(amount, curve);
  return curve;
}

// ---------------------------------------------------------------- patch model

export const MOD_SOURCES = ['env2', 'env3', 'lfo1', 'lfo2', 'lfo3', 'lfo4', 'velocity', 'keytrack', 'modwheel'];
export const MOD_DESTS = [
  'osc1.position', 'osc2.position', 'osc3.position',
  'osc1.level', 'osc2.level', 'osc3.level',
  'osc1.tune', 'osc2.tune', 'osc3.tune',
  'filter1.cutoff', 'filter1.resonance',
  'filter2.cutoff', 'filter2.resonance',
  'amp', 'pan',
];

const LFO_SHAPES = ['sine', 'triangle', 'sawtooth', 'square'];

function oscDefaults(on, table, transpose) {
  return {
    on,
    table,
    position: 0.0,   // wavetable morph 0..1
    level: 0.5,
    pan: 0,          // -1..1
    transpose,       // semitones
    tune: 0,         // cents
    unison: 1,       // 1..8 voices
    detune: 12,      // cents spread across the unison stack
    stereo: 0.6,     // unison stereo spread 0..1
    phaseRand: 1,    // 0 = fixed phase, 1 = free running
  };
}

export function defaultPatch() {
  return {
    name: 'Init',
    osc1: oscDefaults(true, 'basic', 0),
    osc2: oscDefaults(false, 'harmonic', 0),
    osc3: oscDefaults(false, 'formant', -12),
    sub: { on: false, type: 'sine', octave: -1, level: 0.4 },
    noise: { on: false, level: 0.15, color: 'white' },
    filter1: { on: true, type: 'lowpass', cutoff: 0.75, resonance: 0.12, drive: 0, keytrack: 0.3 },
    filter2: { on: false, type: 'highpass', cutoff: 0.05, resonance: 0.1, drive: 0, keytrack: 0 },
    // Envelope times are seconds; sustain is a level 0..1.
    env1: { attack: 0.005, decay: 0.35, sustain: 0.8, release: 0.25 },
    env2: { attack: 0.002, decay: 0.20, sustain: 0.0, release: 0.15 },
    env3: { attack: 0.30, decay: 0.50, sustain: 0.5, release: 0.6 },
    lfos: [
      { shape: 'sine', rate: 5.0, depth: 1 },
      { shape: 'triangle', rate: 0.5, depth: 1 },
      { shape: 'sawtooth', rate: 2.0, depth: 1 },
      { shape: 'square', rate: 8.0, depth: 1 },
    ],
    matrix: [
      { source: 'env2', dest: 'filter1.cutoff', amount: 0.35 },
      { source: 'velocity', dest: 'amp', amount: 0.6 },
    ],
    fx: {
      distortion: { on: false, drive: 8, mix: 0.5 },
      chorus: { on: true, rate: 0.6, depth: 0.004, mix: 0.3 },
      phaser: { on: false, rate: 0.4, depth: 900, mix: 0.4 },
      delay: { on: true, time: 0.28, feedback: 0.32, mix: 0.22 },
      reverb: { on: true, size: 2.4, damp: 0.4, mix: 0.25 },
      compressor: { on: true, threshold: -18, ratio: 4 },
      eq: { low: 0, mid: 0, high: 0 },
    },
    glide: 0,        // seconds; 0 = off
    polyphony: 12,
    masterGain: 0.7,
    pitchBendRange: 2,
  };
}

// ---------------------------------------------------------------- factory presets
// Chosen to cover the ground Vital's own init categories cover, so a first-time
// Sway owner has something playable on every pad without patching anything.

export const FACTORY_PRESETS = {
  Init: () => defaultPatch(),

  'Super Saw': () => {
    const p = defaultPatch();
    p.name = 'Super Saw';
    p.osc1.table = 'basic';
    p.osc1.position = 0;
    p.osc1.unison = 7;
    p.osc1.detune = 28;
    p.osc1.stereo = 1;
    p.osc2.on = true;
    p.osc2.table = 'basic';
    p.osc2.transpose = -12;
    p.osc2.unison = 5;
    p.osc2.detune = 18;
    p.osc2.level = 0.35;
    p.filter1.cutoff = 0.85;
    p.env1.attack = 0.01;
    p.env1.release = 0.5;
    p.fx.reverb.mix = 0.3;
    return p;
  },

  'Deep Bass': () => {
    const p = defaultPatch();
    p.name = 'Deep Bass';
    p.osc1.table = 'hollow';
    p.osc1.unison = 2;
    p.osc1.detune = 6;
    p.sub.on = true;
    p.sub.level = 0.6;
    p.filter1.cutoff = 0.32;
    p.filter1.resonance = 0.25;
    p.filter1.keytrack = 0.5;
    p.env1.attack = 0.004;
    p.env1.decay = 0.22;
    p.env1.sustain = 0.6;
    p.env1.release = 0.12;
    p.env2.decay = 0.14;
    p.matrix = [
      { source: 'env2', dest: 'filter1.cutoff', amount: 0.5 },
      { source: 'velocity', dest: 'amp', amount: 0.7 },
    ];
    p.fx.reverb.on = false;
    p.fx.delay.mix = 0.1;
    p.polyphony = 6;
    return p;
  },

  'Wobble Bass': () => {
    const p = FACTORY_PRESETS['Deep Bass']();
    p.name = 'Wobble Bass';
    p.osc1.table = 'noisy';
    p.filter1.resonance = 0.45;
    p.lfos[0].rate = 5.5; // the wub, matching theDAW's wobbleBass
    p.matrix = [
      { source: 'lfo1', dest: 'filter1.cutoff', amount: 0.55 },
      { source: 'velocity', dest: 'amp', amount: 0.5 },
    ];
    p.fx.distortion.on = true;
    p.fx.distortion.drive = 12;
    return p;
  },

  'Glass Pad': () => {
    const p = defaultPatch();
    p.name = 'Glass Pad';
    p.osc1.table = 'bell';
    p.osc1.unison = 4;
    p.osc1.detune = 14;
    p.osc2.on = true;
    p.osc2.table = 'formant';
    p.osc2.transpose = 12;
    p.osc2.level = 0.3;
    p.filter1.cutoff = 0.6;
    p.env1.attack = 0.6;
    p.env1.decay = 1.2;
    p.env1.sustain = 0.7;
    p.env1.release = 1.4;
    p.matrix = [
      { source: 'lfo2', dest: 'osc1.position', amount: 0.4 },
      { source: 'env3', dest: 'filter1.cutoff', amount: 0.3 },
    ];
    p.fx.reverb.size = 4.0;
    p.fx.reverb.mix = 0.45;
    p.fx.chorus.mix = 0.4;
    return p;
  },

  'Pluck Lead': () => {
    const p = defaultPatch();
    p.name = 'Pluck Lead';
    p.osc1.table = 'pulse';
    p.osc1.position = 0.4;
    p.osc1.unison = 3;
    p.osc1.detune = 10;
    p.filter1.cutoff = 0.7;
    p.filter1.resonance = 0.3;
    p.env1.attack = 0.002;
    p.env1.decay = 0.28;
    p.env1.sustain = 0.15;
    p.env1.release = 0.2;
    p.env2.decay = 0.16;
    p.matrix = [
      { source: 'env2', dest: 'filter1.cutoff', amount: 0.6 },
      { source: 'velocity', dest: 'amp', amount: 0.8 },
    ];
    p.fx.delay.mix = 0.3;
    p.fx.delay.feedback = 0.4;
    return p;
  },

  'Formant Vox': () => {
    const p = defaultPatch();
    p.name = 'Formant Vox';
    p.osc1.table = 'formant';
    p.osc1.unison = 3;
    p.osc1.detune = 8;
    p.filter1.cutoff = 0.8;
    p.env1.attack = 0.08;
    p.env1.release = 0.5;
    p.matrix = [
      { source: 'lfo2', dest: 'osc1.position', amount: 0.6 },
      { source: 'lfo1', dest: 'osc1.tune', amount: 0.06 }, // vibrato
    ];
    p.lfos[1].rate = 0.35;
    p.fx.reverb.mix = 0.35;
    return p;
  },
};

export const PRESET_NAMES = Object.keys(FACTORY_PRESETS);

// ---------------------------------------------------------------- engine

/**
 * @param ctx  an existing AudioContext
 * @param destinationNodes  nodes the master output connects to. The caller
 *        passes [ctx.destination, analyser] so the synth is heard AND drives
 *        the visuals, exactly like the sampler.
 */
export function createSynth(ctx, destinationNodes) {
  const bank = createWavetableBank(ctx);
  let patch = defaultPatch();

  // ---- master chain: fx are built once and bypassed by mix, not rewiring,
  //      so changing a patch never clicks.
  const preFx = ctx.createGain();
  const master = ctx.createGain();
  master.gain.value = patch.masterGain;

  // distortion
  const distIn = ctx.createGain();
  const distShaper = ctx.createWaveShaper();
  distShaper.curve = distCurve(patch.fx.distortion.drive);
  distShaper.oversample = '2x';
  const distWet = ctx.createGain();
  const distDry = ctx.createGain();

  // chorus (two delay lines modulated in quadrature)
  const chorusDry = ctx.createGain();
  const chorusWet = ctx.createGain();
  const chorusA = ctx.createDelay(0.05);
  const chorusB = ctx.createDelay(0.05);
  chorusA.delayTime.value = 0.012;
  chorusB.delayTime.value = 0.019;
  const chorusLfoA = ctx.createOscillator();
  const chorusLfoB = ctx.createOscillator();
  const chorusDepthA = ctx.createGain();
  const chorusDepthB = ctx.createGain();
  chorusLfoA.type = 'sine';
  chorusLfoB.type = 'sine';
  chorusLfoB.frequency.value = 0.43;

  // phaser (cascaded allpass)
  const phaserDry = ctx.createGain();
  const phaserWet = ctx.createGain();
  const allpass = [];
  for (let i = 0; i < 4; i++) {
    const ap = ctx.createBiquadFilter();
    ap.type = 'allpass';
    ap.frequency.value = 500 + i * 400;
    allpass.push(ap);
  }
  const phaserLfo = ctx.createOscillator();
  const phaserDepth = ctx.createGain();

  // delay
  const delayDry = ctx.createGain();
  const delayWet = ctx.createGain();
  const delayNode = ctx.createDelay(2.0);
  const delayFb = ctx.createGain();
  const delayDamp = ctx.createBiquadFilter();
  delayDamp.type = 'lowpass';
  delayDamp.frequency.value = 6000;

  // reverb (generated impulse, no asset, matching the no-assets rule)
  const reverbDry = ctx.createGain();
  const reverbWet = ctx.createGain();
  const convolver = ctx.createConvolver();

  // dynamics + EQ
  const comp = ctx.createDynamicsCompressor();
  const eqLow = ctx.createBiquadFilter();
  const eqMid = ctx.createBiquadFilter();
  const eqHigh = ctx.createBiquadFilter();
  eqLow.type = 'lowshelf';
  eqLow.frequency.value = 200;
  eqMid.type = 'peaking';
  eqMid.frequency.value = 1200;
  eqMid.Q.value = 0.9;
  eqHigh.type = 'highshelf';
  eqHigh.frequency.value = 5000;

  function buildImpulse(seconds, damp) {
    const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const data = buf.getChannelData(c);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        // exponential decay with a damped high end
        const env = Math.pow(1 - t, 1.6 + damp * 3);
        data[i] = (Math.random() * 2 - 1) * env;
      }
    }
    return buf;
  }
  convolver.buffer = buildImpulse(patch.fx.reverb.size, patch.fx.reverb.damp);

  // wiring: preFx -> dist -> chorus -> phaser -> delay -> reverb -> comp -> eq -> master
  preFx.connect(distIn);
  distIn.connect(distDry);
  distIn.connect(distShaper);
  distShaper.connect(distWet);

  const afterDist = ctx.createGain();
  distDry.connect(afterDist);
  distWet.connect(afterDist);

  afterDist.connect(chorusDry);
  afterDist.connect(chorusA);
  afterDist.connect(chorusB);
  chorusA.connect(chorusWet);
  chorusB.connect(chorusWet);
  chorusLfoA.connect(chorusDepthA).connect(chorusA.delayTime);
  chorusLfoB.connect(chorusDepthB).connect(chorusB.delayTime);

  const afterChorus = ctx.createGain();
  chorusDry.connect(afterChorus);
  chorusWet.connect(afterChorus);

  afterChorus.connect(phaserDry);
  let apChain = afterChorus;
  for (const ap of allpass) {
    apChain.connect(ap);
    apChain = ap;
  }
  apChain.connect(phaserWet);
  phaserLfo.connect(phaserDepth);
  for (const ap of allpass) phaserDepth.connect(ap.frequency);

  const afterPhaser = ctx.createGain();
  phaserDry.connect(afterPhaser);
  phaserWet.connect(afterPhaser);

  afterPhaser.connect(delayDry);
  afterPhaser.connect(delayNode);
  delayNode.connect(delayDamp).connect(delayFb).connect(delayNode);
  delayNode.connect(delayWet);

  const afterDelay = ctx.createGain();
  delayDry.connect(afterDelay);
  delayWet.connect(afterDelay);

  afterDelay.connect(reverbDry);
  afterDelay.connect(convolver);
  convolver.connect(reverbWet);

  const afterReverb = ctx.createGain();
  reverbDry.connect(afterReverb);
  reverbWet.connect(afterReverb);

  afterReverb.connect(comp).connect(eqLow).connect(eqMid).connect(eqHigh).connect(master);
  for (const node of destinationNodes || []) master.connect(node);

  chorusLfoA.start();
  chorusLfoB.start();
  phaserLfo.start();

  // ---- global LFOs, fanned to per-voice gains
  const lfoNodes = [];
  for (let i = 0; i < LFO_COUNT; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = patch.lfos[i].shape;
    osc.frequency.value = patch.lfos[i].rate;
    gain.gain.value = patch.lfos[i].depth;
    osc.connect(gain);
    osc.start();
    lfoNodes.push({ osc, gain });
  }

  applyFx();

  // ---- voice state
  const voices = new Map(); // midi -> voice
  const order = []; // note-on order, for stealing
  let bendSemis = 0;
  let modWheel = 0;
  let lastFreq = 0;

  function applyFx() {
    const f = patch.fx;
    distShaper.curve = distCurve(Math.max(1, f.distortion.drive));
    distWet.gain.value = f.distortion.on ? f.distortion.mix : 0;
    distDry.gain.value = f.distortion.on ? 1 - f.distortion.mix : 1;

    chorusLfoA.frequency.value = f.chorus.rate;
    chorusLfoB.frequency.value = f.chorus.rate * 0.72;
    chorusDepthA.gain.value = f.chorus.depth;
    chorusDepthB.gain.value = f.chorus.depth * 0.8;
    chorusWet.gain.value = f.chorus.on ? f.chorus.mix : 0;
    chorusDry.gain.value = f.chorus.on ? 1 - f.chorus.mix * 0.5 : 1;

    phaserLfo.frequency.value = f.phaser.rate;
    phaserDepth.gain.value = f.phaser.depth;
    phaserWet.gain.value = f.phaser.on ? f.phaser.mix : 0;
    phaserDry.gain.value = f.phaser.on ? 1 - f.phaser.mix * 0.5 : 1;

    delayNode.delayTime.value = clamp(f.delay.time, 0.001, 2);
    delayFb.gain.value = clamp(f.delay.feedback, 0, 0.95);
    delayWet.gain.value = f.delay.on ? f.delay.mix : 0;
    delayDry.gain.value = 1;

    reverbWet.gain.value = f.reverb.on ? f.reverb.mix : 0;
    reverbDry.gain.value = 1;

    comp.threshold.value = f.compressor.on ? f.compressor.threshold : 0;
    comp.ratio.value = f.compressor.on ? f.compressor.ratio : 1;

    eqLow.gain.value = f.eq.low;
    eqMid.gain.value = f.eq.mid;
    eqHigh.gain.value = f.eq.high;

    master.gain.value = patch.masterGain;
  }

  function rebuildReverb() {
    convolver.buffer = buildImpulse(clamp(patch.fx.reverb.size, 0.2, 8), clamp(patch.fx.reverb.damp, 0, 1));
  }

  function applyLfoSettings() {
    for (let i = 0; i < LFO_COUNT; i++) {
      const cfg = patch.lfos[i];
      lfoNodes[i].osc.type = LFO_SHAPES.includes(cfg.shape) ? cfg.shape : 'sine';
      lfoNodes[i].osc.frequency.value = clamp(cfg.rate, 0.01, 60);
      lfoNodes[i].gain.gain.value = clamp(cfg.depth, 0, 1);
    }
  }

  /** Static modulation from non-node sources, summed per destination. */
  function staticMod(dest, velocity, midi) {
    let sum = 0;
    for (const row of patch.matrix) {
      if (row.dest !== dest) continue;
      if (row.source === 'velocity') sum += row.amount * velocity;
      else if (row.source === 'keytrack') sum += row.amount * ((midi - 60) / 48);
      else if (row.source === 'modwheel') sum += row.amount * modWheel;
    }
    return sum;
  }

  function envRows(dest) {
    return patch.matrix.filter((r) => r.dest === dest && (r.source === 'env2' || r.source === 'env3'));
  }

  function lfoRows(dest) {
    return patch.matrix.filter((r) => r.dest === dest && r.source.startsWith('lfo'));
  }

  // Schedules an ADSR onto a param, scaled to `depth`, returning the release time.
  function scheduleEnv(param, env, when, depth, base) {
    param.cancelScheduledValues(when);
    param.setValueAtTime(base, when);
    param.linearRampToValueAtTime(base + depth, when + Math.max(0.001, env.attack));
    param.linearRampToValueAtTime(
      base + depth * env.sustain,
      when + Math.max(0.001, env.attack) + Math.max(0.001, env.decay)
    );
  }

  function buildOscStack(cfg, freq, when, voice, destNode) {
    if (!cfg.on) return;
    const n = clamp(Math.round(cfg.unison), 1, 8);
    const { a, b, mix } = bank.get(cfg.table, cfg.position + staticMod(`${cfg.key}.position`, voice.velocity, voice.midi));
    for (let i = 0; i < n; i++) {
      const spread = n === 1 ? 0 : (i / (n - 1)) * 2 - 1; // -1..1
      const detuneCents = cfg.tune + spread * cfg.detune + cfg.transpose * 100;

      // Two oscillators per unison voice realise the wavetable morph as a
      // crossfade between adjacent frames.
      const oA = ctx.createOscillator();
      const oB = ctx.createOscillator();
      oA.setPeriodicWave(a);
      oB.setPeriodicWave(b);
      oA.frequency.value = freq;
      oB.frequency.value = freq;
      oA.detune.value = detuneCents;
      oB.detune.value = detuneCents;

      const gA = ctx.createGain();
      const gB = ctx.createGain();
      const lvl = (cfg.level / Math.sqrt(n)) * 0.6;
      gA.gain.value = lvl * (1 - mix);
      gB.gain.value = lvl * mix;

      const panner = ctx.createStereoPanner();
      panner.pan.value = clamp(cfg.pan + spread * cfg.stereo, -1, 1);

      oA.connect(gA).connect(panner);
      oB.connect(gB).connect(panner);
      panner.connect(destNode);

      // pitch modulation: bend, glide, and any lfo -> tune rows
      const tuneRows = lfoRows(`${cfg.key}.tune`);
      for (const row of tuneRows) {
        const idx = Number(row.source.slice(3)) - 1;
        const amt = ctx.createGain();
        amt.gain.value = row.amount * 1200; // cents
        lfoNodes[idx].gain.connect(amt);
        amt.connect(oA.detune);
        amt.connect(oB.detune);
        voice.modGains.push(amt);
      }

      if (cfg.phaseRand > 0) {
        // Web Audio has no phase control; a tiny random start offset gives the
        // same "free running" character without extra nodes.
        const jitter = Math.random() * 0.002 * cfg.phaseRand;
        oA.start(when + jitter);
        oB.start(when + jitter);
      } else {
        oA.start(when);
        oB.start(when);
      }
      voice.sources.push(oA, oB);
      voice.nodes.push(gA, gB, panner);
    }
  }

  function noteOn(midi, velocity, when, glideFrom) {
    const now = when === undefined ? ctx.currentTime : when;
    const vel = clamp(velocity, 0, 1);
    if (voices.has(midi)) noteOff(midi, now);

    // steal the oldest voice past the polyphony cap
    const cap = clamp(Math.round(patch.polyphony), 1, MAX_VOICES);
    while (order.length >= cap) {
      const oldest = order.shift();
      if (voices.has(oldest)) hardStop(oldest, now);
    }

    const freq = mtof(midi);
    const voice = {
      midi,
      velocity: vel,
      sources: [],
      nodes: [],
      modGains: [],
      startedAt: now,
      released: false,
    };

    const ampEnv = ctx.createGain();
    const voiceGain = ctx.createGain();
    const pan = ctx.createStereoPanner();
    voice.ampEnv = ampEnv;
    voice.nodes.push(ampEnv, voiceGain, pan);

    // filters
    let chainIn = ctx.createGain();
    voice.nodes.push(chainIn);
    let node = chainIn;
    for (const key of ['filter1', 'filter2']) {
      const cfg = patch[key];
      if (!cfg.on) continue;
      const f = ctx.createBiquadFilter();
      f.type = cfg.type;
      const keytrackHz = cfg.keytrack * (freq - 261.63);
      const baseHz = clamp(20 * Math.pow(1000, cfg.cutoff) + keytrackHz, 20, ctx.sampleRate / 2 - 1000);
      f.frequency.value = baseHz;
      f.Q.value = clamp(cfg.resonance * 24, 0.0001, 30);
      node.connect(f);
      node = f;
      voice.nodes.push(f);

      // envelope modulation of cutoff
      for (const row of envRows(`${key}.cutoff`)) {
        const env = patch[row.source];
        const depth = row.amount * 8000;
        scheduleEnv(f.frequency, env, now, depth, baseHz);
        voice.filterRelease = voice.filterRelease || [];
        voice.filterRelease.push({ param: f.frequency, env, base: baseHz });
      }
      // lfo modulation of cutoff
      for (const row of lfoRows(`${key}.cutoff`)) {
        const idx = Number(row.source.slice(3)) - 1;
        const amt = ctx.createGain();
        amt.gain.value = row.amount * 5000;
        lfoNodes[idx].gain.connect(amt);
        amt.connect(f.frequency);
        voice.modGains.push(amt);
      }
      if (cfg.drive > 0) {
        const ws = ctx.createWaveShaper();
        ws.curve = distCurve(cfg.drive);
        node.connect(ws);
        node = ws;
        voice.nodes.push(ws);
      }
    }

    node.connect(ampEnv);
    ampEnv.connect(voiceGain).connect(pan).connect(preFx);

    // oscillators
    for (const key of ['osc1', 'osc2', 'osc3']) {
      const cfg = { ...patch[key], key };
      buildOscStack(cfg, freq, now, voice, chainIn);
    }

    // sub
    if (patch.sub.on) {
      const o = ctx.createOscillator();
      o.type = patch.sub.type;
      o.frequency.value = freq * Math.pow(2, patch.sub.octave);
      const g = ctx.createGain();
      g.gain.value = patch.sub.level * 0.6;
      o.connect(g).connect(chainIn);
      o.start(now);
      voice.sources.push(o);
      voice.nodes.push(g);
    }

    // noise
    if (patch.noise.on) {
      const len = Math.floor(ctx.sampleRate * 2);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        // 'pink' rolls off the top, 'white' passes through
        last = patch.noise.color === 'pink' ? (last + 0.02 * w) / 1.02 : w;
        d[i] = patch.noise.color === 'pink' ? last * 3 : w;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const g = ctx.createGain();
      g.gain.value = patch.noise.level * 0.4;
      src.connect(g).connect(chainIn);
      src.start(now);
      voice.sources.push(src);
      voice.nodes.push(g);
    }

    // glide: ramp every oscillator from the previous note's frequency
    if (patch.glide > 0 && glideFrom) {
      for (const s of voice.sources) {
        if (!s.frequency) continue;
        const target = s.frequency.value;
        const ratio = target / Math.max(1, lastFreq);
        s.frequency.cancelScheduledValues(now);
        s.frequency.setValueAtTime(target / ratio, now);
        s.frequency.exponentialRampToValueAtTime(target, now + patch.glide);
      }
    }
    lastFreq = freq;

    // amp envelope (env1) with velocity via the matrix
    const e1 = patch.env1;
    const ampDepth = clamp(0.35 + staticMod('amp', vel, midi) + vel * 0.5, 0.02, 1.4);
    ampEnv.gain.cancelScheduledValues(now);
    ampEnv.gain.setValueAtTime(0.0001, now);
    ampEnv.gain.exponentialRampToValueAtTime(Math.max(0.0002, ampDepth), now + Math.max(0.001, e1.attack));
    ampEnv.gain.setTargetAtTime(
      Math.max(0.0002, ampDepth * clamp(e1.sustain, 0.0001, 1)),
      now + Math.max(0.001, e1.attack),
      Math.max(0.005, e1.decay / 3)
    );

    voiceGain.gain.value = 1;
    pan.pan.value = clamp(staticMod('pan', vel, midi), -1, 1);

    voices.set(midi, voice);
    order.push(midi);
    return voice;
  }

  function noteOff(midi, when) {
    const voice = voices.get(midi);
    if (!voice || voice.released) return;
    const now = when === undefined ? ctx.currentTime : when;
    voice.released = true;
    const rel = Math.max(0.01, patch.env1.release);
    const g = voice.ampEnv.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(Math.max(0.0002, g.value), now);
    g.setTargetAtTime(0.0001, now, rel / 3);

    const stopAt = now + rel + 0.25;
    for (const s of voice.sources) {
      try {
        s.stop(stopAt);
      } catch {
        /* already stopped */
      }
    }
    // Bookkeeping is retired when the release actually starts, not when it is
    // scheduled: the offline bounce and the VoiceTrigger adapter both call
    // noteOff with a future timestamp, and dropping the voice immediately made
    // activeVoices lie and let voice-stealing free a note that was still to
    // sound.
    const retire = () => {
      const idx = order.indexOf(midi);
      if (idx >= 0) order.splice(idx, 1);
      if (voices.get(midi) === voice) voices.delete(midi);
    };
    const lead = now - ctx.currentTime;
    if (lead > 0.001) setTimeout(retire, lead * 1000);
    else retire();

    const last = voice.sources[voice.sources.length - 1];
    const cleanup = () => {
      for (const n of voice.nodes) {
        try { n.disconnect(); } catch { /* already gone */ }
      }
      for (const n of voice.modGains) {
        try { n.disconnect(); } catch { /* already gone */ }
      }
    };
    if (last) last.onended = cleanup;
    else cleanup();
  }

  function hardStop(midi, when) {
    const voice = voices.get(midi);
    if (!voice) return;
    const now = when === undefined ? ctx.currentTime : when;
    const g = voice.ampEnv.gain;
    g.cancelScheduledValues(now);
    g.setTargetAtTime(0.0001, now, 0.01);
    for (const s of voice.sources) {
      try { s.stop(now + 0.08); } catch { /* already stopped */ }
    }
    voices.delete(midi);
    const idx = order.indexOf(midi);
    if (idx >= 0) order.splice(idx, 1);
    const last = voice.sources[voice.sources.length - 1];
    const cleanup = () => {
      for (const n of voice.nodes) { try { n.disconnect(); } catch { /* gone */ } }
      for (const n of voice.modGains) { try { n.disconnect(); } catch { /* gone */ } }
    };
    if (last) last.onended = cleanup;
    else cleanup();
  }

  // ---------------------------------------------------------------- public API
  return {
    get patch() {
      return patch;
    },

    noteOn,
    noteOff,

    allNotesOff() {
      for (const midi of [...voices.keys()]) noteOff(midi);
    },

    /** 0..1 -> the patch's bend range in semitones, applied to live voices. */
    pitchBend(value) {
      bendSemis = (value * 2 - 1) * patch.pitchBendRange;
      const cents = bendSemis * 100;
      for (const voice of voices.values()) {
        for (const s of voice.sources) {
          if (s.detune) s.detune.setTargetAtTime(s.detune.value + cents, ctx.currentTime, 0.02);
        }
      }
    },

    modulation(value) {
      modWheel = clamp(value, 0, 1);
    },

    setPatch(next) {
      patch = { ...defaultPatch(), ...next };
      applyFx();
      applyLfoSettings();
      rebuildReverb();
    },

    loadPreset(name) {
      const make = FACTORY_PRESETS[name];
      if (!make) return false;
      patch = make();
      applyFx();
      applyLfoSettings();
      rebuildReverb();
      return true;
    },

    /**
     * Dotted-path assignment guarded by the manifest, so the UI and any host
     * automation write through one validated door.
     * e.g. setParam('filter1.cutoff', 0.6), setParam('fx.delay.mix', 0.3)
     */
    setParam(path, value) {
      const parts = path.split('.');
      let node = patch;
      for (let i = 0; i < parts.length - 1; i++) {
        if (node[parts[i]] === undefined) return false;
        node = node[parts[i]];
      }
      const leaf = parts[parts.length - 1];
      if (node[leaf] === undefined) return false;
      node[leaf] = typeof node[leaf] === 'boolean' ? !!value : value;
      if (path.startsWith('fx.') || path === 'masterGain') applyFx();
      if (path.startsWith('fx.reverb')) rebuildReverb();
      if (path.startsWith('lfos')) applyLfoSettings();
      return true;
    },

    getParam(path) {
      return path.split('.').reduce((o, k) => (o === undefined ? undefined : o[k]), patch);
    },

    /**
     * theDAW's VisualControl manifest shape, so its control-sync bus and MIDI
     * mapper can drive this synth without an adapter.
     */
    controlManifest() {
      const out = [];
      const range = (key, label, group, min, max, step) =>
        out.push({ key, label, kind: 'range', group, min, max, step });
      const toggle = (key, label, group) => out.push({ key, label, kind: 'toggle', group });

      for (const o of ['osc1', 'osc2', 'osc3']) {
        const g = o.toUpperCase();
        toggle(`${o}.on`, 'Enabled', g);
        range(`${o}.position`, 'Wavetable Position', g, 0, 1, 0.001);
        range(`${o}.level`, 'Level', g, 0, 1, 0.001);
        range(`${o}.pan`, 'Pan', g, -1, 1, 0.01);
        range(`${o}.transpose`, 'Transpose', g, -24, 24, 1);
        range(`${o}.tune`, 'Tune', g, -100, 100, 1);
        range(`${o}.unison`, 'Unison', g, 1, 8, 1);
        range(`${o}.detune`, 'Detune', g, 0, 60, 0.5);
        range(`${o}.stereo`, 'Stereo', g, 0, 1, 0.01);
      }
      toggle('sub.on', 'Enabled', 'SUB');
      range('sub.level', 'Level', 'SUB', 0, 1, 0.01);
      range('sub.octave', 'Octave', 'SUB', -3, 0, 1);
      toggle('noise.on', 'Enabled', 'NOISE');
      range('noise.level', 'Level', 'NOISE', 0, 1, 0.01);

      for (const f of ['filter1', 'filter2']) {
        const g = f.toUpperCase();
        toggle(`${f}.on`, 'Enabled', g);
        range(`${f}.cutoff`, 'Cutoff', g, 0, 1, 0.001);
        range(`${f}.resonance`, 'Resonance', g, 0, 1, 0.001);
        range(`${f}.drive`, 'Drive', g, 0, 30, 0.5);
        range(`${f}.keytrack`, 'Key Track', g, 0, 1, 0.01);
      }
      for (const e of ['env1', 'env2', 'env3']) {
        const g = e.toUpperCase();
        range(`${e}.attack`, 'Attack', g, 0.001, 4, 0.001);
        range(`${e}.decay`, 'Decay', g, 0.001, 4, 0.001);
        range(`${e}.sustain`, 'Sustain', g, 0, 1, 0.001);
        range(`${e}.release`, 'Release', g, 0.001, 6, 0.001);
      }
      for (let i = 0; i < LFO_COUNT; i++) {
        range(`lfos.${i}.rate`, `LFO ${i + 1} Rate`, 'LFO', 0.01, 30, 0.01);
        range(`lfos.${i}.depth`, `LFO ${i + 1} Depth`, 'LFO', 0, 1, 0.01);
      }
      toggle('fx.distortion.on', 'Distortion', 'FX');
      range('fx.distortion.drive', 'Dist Drive', 'FX', 1, 40, 0.5);
      range('fx.distortion.mix', 'Dist Mix', 'FX', 0, 1, 0.01);
      toggle('fx.chorus.on', 'Chorus', 'FX');
      range('fx.chorus.rate', 'Chorus Rate', 'FX', 0.05, 8, 0.01);
      range('fx.chorus.mix', 'Chorus Mix', 'FX', 0, 1, 0.01);
      toggle('fx.phaser.on', 'Phaser', 'FX');
      range('fx.phaser.rate', 'Phaser Rate', 'FX', 0.05, 8, 0.01);
      range('fx.phaser.mix', 'Phaser Mix', 'FX', 0, 1, 0.01);
      toggle('fx.delay.on', 'Delay', 'FX');
      range('fx.delay.time', 'Delay Time', 'FX', 0.01, 1.5, 0.005);
      range('fx.delay.feedback', 'Delay Feedback', 'FX', 0, 0.95, 0.01);
      range('fx.delay.mix', 'Delay Mix', 'FX', 0, 1, 0.01);
      toggle('fx.reverb.on', 'Reverb', 'FX');
      range('fx.reverb.size', 'Reverb Size', 'FX', 0.2, 8, 0.1);
      range('fx.reverb.mix', 'Reverb Mix', 'FX', 0, 1, 0.01);
      range('fx.eq.low', 'EQ Low', 'FX', -18, 18, 0.5);
      range('fx.eq.mid', 'EQ Mid', 'FX', -18, 18, 0.5);
      range('fx.eq.high', 'EQ High', 'FX', -18, 18, 0.5);
      range('glide', 'Glide', 'GLOBAL', 0, 1, 0.005);
      range('polyphony', 'Polyphony', 'GLOBAL', 1, 16, 1);
      range('masterGain', 'Master', 'GLOBAL', 0, 1, 0.01);
      return out;
    },

    /** Mod matrix editing. */
    setMatrix(rows) {
      patch.matrix = rows.filter(
        (r) => MOD_SOURCES.includes(r.source) && MOD_DESTS.includes(r.dest)
      );
    },
    getMatrix() {
      return patch.matrix.map((r) => ({ ...r }));
    },

    /**
     * theDAW VoiceTrigger adapter. Same signature as its synthVoiceKit voices:
     * (ctx, dest, midi, velocity, when, duration, master). Scheduling a note in
     * the future (which the offline bounce does) is handled by passing `when`
     * straight through to noteOn/noteOff.
     */
    voiceTrigger() {
      return (voiceCtx, dest, midi, velocity, when, duration, masterLevel) => {
        // The engine owns its own graph, so `dest` is honoured by routing the
        // master output there for the duration of the render.
        if (dest && !destinationNodes.includes(dest)) {
          try { master.connect(dest); } catch { /* already connected */ }
        }
        const prevMaster = patch.masterGain;
        if (typeof masterLevel === 'number') {
          patch.masterGain = masterLevel;
          master.gain.setValueAtTime(masterLevel, when);
        }
        noteOn(midi, (velocity || 100) / 127, when);
        noteOff(midi, when + Math.max(0.02, duration));
        patch.masterGain = prevMaster;
      };
    },

    get activeVoices() {
      return voices.size;
    },

    dispose() {
      for (const midi of [...voices.keys()]) hardStop(midi);
      for (const l of lfoNodes) {
        try { l.osc.stop(); } catch { /* already stopped */ }
        l.osc.disconnect();
        l.gain.disconnect();
      }
      try { chorusLfoA.stop(); chorusLfoB.stop(); phaserLfo.stop(); } catch { /* already stopped */ }
      master.disconnect();
      preFx.disconnect();
    },
  };
}

export { TABLE_NAMES };
