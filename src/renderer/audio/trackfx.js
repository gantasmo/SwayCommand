// Track effects, the live Web Audio graph behind every kind in
// shared/trackfx.js. The transport builds one node per chain entry and wires
// input -> entries in order -> track gain; this module knows how to build a
// single entry and how to move its parameters smoothly.
//
// createFxNode(ctx, kind, params, env) -> { kind, input, output, set(key, v),
// retune(), dispose() }. `env.bpm()` returns the timeline tempo (0 when
// unknown -> 120) so tempo-synced params (delay time, gate rate, tremolo and
// auto-filter rates) follow it; retune() re-derives them when it changes.
// Pure module: no DOM, nothing persistent except the worklet registration.

import { FX_KINDS, fxClamp, beatsToSeconds } from '../../shared/trackfx.js';

const SMOOTH = 0.03;
const MIN = 0.0001;

let workletPromise = null;
let workletOk = false;

// The worklet lives beside the bundle (build-renderer.js copies it). One
// registration per context; kinds that need it fall back to a pass-through
// until it lands, which is a few ms after the first call.
export function ensureWorklet(ctx) {
  if (workletPromise) return workletPromise;
  if (!ctx.audioWorklet) return (workletPromise = Promise.resolve(false));
  workletPromise = ctx.audioWorklet
    .addModule('./dsp.worklet.js')
    .then(() => (workletOk = true))
    .catch((err) => {
      console.warn('[trackfx] worklet unavailable:', err && err.message);
      return false;
    });
  return workletPromise;
}
export function workletReady() {
  return workletOk;
}

function ramp(param, value, ctx, time = SMOOTH) {
  const now = ctx.currentTime;
  param.cancelScheduledValues(now);
  param.setValueAtTime(param.value, now);
  param.linearRampToValueAtTime(value, now + time);
}
function rampExp(param, value, ctx, time = SMOOTH) {
  const now = ctx.currentTime;
  param.cancelScheduledValues(now);
  param.setValueAtTime(Math.max(param.value, MIN), now);
  param.exponentialRampToValueAtTime(Math.max(value, MIN), now + time);
}

// A dry/wet pair: input -> dry -> output, input -> (chain) -> wet -> output.
function dryWet(ctx, input, output) {
  const dry = ctx.createGain();
  const wet = ctx.createGain();
  input.connect(dry);
  dry.connect(output);
  wet.connect(output);
  return {
    dry,
    wet,
    setMix(m) {
      ramp(dry.gain, Math.cos(m * Math.PI * 0.5), ctx);
      ramp(wet.gain, Math.sin(m * Math.PI * 0.5), ctx);
    },
  };
}

function makeLfo(ctx, hz) {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = hz;
  const depth = ctx.createGain();
  depth.gain.value = 0;
  osc.connect(depth);
  osc.start();
  return { osc, depth };
}

// Reverb impulse: exponentially decaying noise, a one-pole low pass walked
// down the tail so `damp` darkens the late reflections. Built off the graph;
// the convolver swaps buffers when it lands.
const irCache = new Map();
function makeImpulse(ctx, size, damp) {
  const key = `${ctx.sampleRate}|${size.toFixed(2)}|${damp.toFixed(2)}`;
  if (irCache.has(key)) return irCache.get(key);
  const len = Math.max(1, Math.floor(ctx.sampleRate * size));
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  const k = 1 - Math.exp(-(0.0008 + damp * 0.02) * 4);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    let lp = 0;
    let seed = 1234567 + c * 7919;
    for (let i = 0; i < len; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const white = (seed / 4294967296) * 2 - 1;
      const env = Math.exp((-6.9 * i) / len); // -60 dB at the end
      lp += (white - lp) * (1 - k * (i / len));
      d[i] = lp * env * (i < 200 ? i / 200 : 1);
    }
  }
  if (irCache.size > 12) irCache.delete(irCache.keys().next().value);
  irCache.set(key, buf);
  return buf;
}

function makeShaper(drive) {
  const n = 2048;
  const curve = new Float32Array(n);
  const k = 1 + drive * 60;
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * k) / Math.tanh(k);
  }
  return curve;
}

export function createFxNode(ctx, kind, params, env) {
  const spec = FX_KINDS[kind];
  if (!spec) return null;
  const bpm = () => (env && typeof env.bpm === 'function' ? env.bpm() : 0);
  const input = ctx.createGain();
  const output = ctx.createGain();
  const p = { ...params };
  const owned = [input, output]; // nodes to disconnect on dispose
  let lfo = null;
  let workletNode = null;
  let bypassGain = null; // worklet kinds: pass-through until the worklet lands
  let pendingIr = 0;
  const apply = {};

  switch (kind) {
    case 'filter': {
      const f = ctx.createBiquadFilter();
      input.connect(f);
      f.connect(output);
      owned.push(f);
      apply.type = (v) => (f.type = ['lowpass', 'highpass', 'bandpass'][Math.round(v)] || 'lowpass');
      apply.cutoff = (v) => rampExp(f.frequency, v, ctx);
      apply.resonance = (v) => ramp(f.Q, v, ctx);
      break;
    }
    case 'delay': {
      const mix = dryWet(ctx, input, output);
      const delay = ctx.createDelay(4);
      const fb = ctx.createGain();
      const tone = ctx.createBiquadFilter();
      tone.type = 'lowpass';
      input.connect(delay);
      delay.connect(tone);
      tone.connect(mix.wet);
      tone.connect(fb);
      fb.connect(delay);
      owned.push(delay, fb, tone, mix.dry, mix.wet);
      apply.time = (v) => ramp(delay.delayTime, Math.min(4, beatsToSeconds(v, bpm())), ctx, 0.08);
      apply.feedback = (v) => ramp(fb.gain, v, ctx);
      apply.tone = (v) => rampExp(tone.frequency, v, ctx);
      apply.mix = (v) => mix.setMix(v);
      break;
    }
    case 'reverb': {
      const mix = dryWet(ctx, input, output);
      const conv = ctx.createConvolver();
      input.connect(conv);
      conv.connect(mix.wet);
      owned.push(conv, mix.dry, mix.wet);
      const rebuild = () => {
        clearTimeout(pendingIr);
        pendingIr = setTimeout(() => {
          conv.buffer = makeImpulse(ctx, p.size, p.damp);
        }, 120);
      };
      conv.buffer = makeImpulse(ctx, p.size, p.damp);
      apply.size = () => rebuild();
      apply.damp = () => rebuild();
      apply.mix = (v) => mix.setMix(v);
      break;
    }
    case 'distortion': {
      const mix = dryWet(ctx, input, output);
      const pre = ctx.createGain();
      const shaper = ctx.createWaveShaper();
      shaper.oversample = '2x';
      const tone = ctx.createBiquadFilter();
      tone.type = 'lowpass';
      const post = ctx.createGain();
      input.connect(pre);
      pre.connect(shaper);
      shaper.connect(tone);
      tone.connect(post);
      post.connect(mix.wet);
      owned.push(pre, shaper, tone, post, mix.dry, mix.wet);
      apply.drive = (v) => {
        shaper.curve = makeShaper(v);
        ramp(pre.gain, 1 + v * 3, ctx);
        ramp(post.gain, 1 / (1 + v * 1.2), ctx);
      };
      apply.tone = (v) => rampExp(tone.frequency, v, ctx);
      apply.mix = (v) => mix.setMix(v);
      break;
    }
    case 'crusher':
    case 'gate': {
      // Pass-through now; the worklet node is spliced in when the module is
      // registered (usually already, after the first chain build).
      bypassGain = ctx.createGain();
      input.connect(bypassGain);
      bypassGain.connect(output);
      owned.push(bypassGain);
      const name = kind === 'crusher' ? 'sway-crusher' : 'sway-gate';
      const splice = () => {
        if (!workletOk || workletNode) return;
        try {
          workletNode = new AudioWorkletNode(ctx, name, { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2] });
        } catch (err) {
          console.warn('[trackfx] worklet node failed:', err && err.message);
          return;
        }
        input.disconnect(bypassGain);
        input.connect(workletNode);
        workletNode.connect(output);
        owned.push(workletNode);
        for (const k of Object.keys(p)) apply[k](p[k]);
      };
      const param = (k) => workletNode && workletNode.parameters.get(k);
      if (kind === 'crusher') {
        apply.bits = (v) => param('bits') && ramp(param('bits'), v, ctx);
        apply.rate = (v) => param('rate') && ramp(param('rate'), v, ctx);
        apply.mix = (v) => param('mix') && ramp(param('mix'), v, ctx);
      } else {
        apply.rate = (v) => param('rate') && ramp(param('rate'), (Math.max(bpm(), 1e-3) > 0 ? (bpm() || 120) / 60 : 2) / v, ctx);
        apply.depth = (v) => param('depth') && ramp(param('depth'), v, ctx);
        apply.shape = (v) => param('shape') && ramp(param('shape'), v, ctx);
      }
      ensureWorklet(ctx).then(splice);
      break;
    }
    case 'phaser': {
      const mix = dryWet(ctx, input, output);
      const stages = [];
      let prev = input;
      for (let i = 0; i < 4; i++) {
        const ap = ctx.createBiquadFilter();
        ap.type = 'allpass';
        ap.frequency.value = 600 + i * 220;
        ap.Q.value = 0.7;
        prev.connect(ap);
        prev = ap;
        stages.push(ap);
      }
      const fb = ctx.createGain();
      prev.connect(mix.wet);
      prev.connect(fb);
      fb.connect(stages[0]);
      lfo = makeLfo(ctx, p.rate);
      for (const ap of stages) lfo.depth.connect(ap.frequency);
      owned.push(...stages, fb, mix.dry, mix.wet, lfo.osc, lfo.depth);
      apply.rate = (v) => ramp(lfo.osc.frequency, v, ctx);
      apply.depth = (v) => ramp(lfo.depth.gain, v * 700, ctx);
      apply.feedback = (v) => ramp(fb.gain, v, ctx);
      apply.mix = (v) => mix.setMix(v);
      break;
    }
    case 'flanger':
    case 'chorus': {
      const mix = dryWet(ctx, input, output);
      const delay = ctx.createDelay(0.1);
      delay.delayTime.value = kind === 'flanger' ? 0.004 : 0.022;
      input.connect(delay);
      delay.connect(mix.wet);
      lfo = makeLfo(ctx, p.rate);
      lfo.depth.connect(delay.delayTime);
      owned.push(delay, mix.dry, mix.wet, lfo.osc, lfo.depth);
      if (kind === 'flanger') {
        const fb = ctx.createGain();
        delay.connect(fb);
        fb.connect(delay);
        owned.push(fb);
        apply.feedback = (v) => ramp(fb.gain, v, ctx);
      }
      apply.rate = (v) => ramp(lfo.osc.frequency, v, ctx);
      apply.depth = (v) => ramp(lfo.depth.gain, v * (kind === 'flanger' ? 0.0025 : 0.008), ctx);
      apply.mix = (v) => mix.setMix(v);
      break;
    }
    case 'tremolo': {
      const g = ctx.createGain();
      input.connect(g);
      g.connect(output);
      lfo = makeLfo(ctx, 2);
      lfo.depth.connect(g.gain);
      owned.push(g, lfo.osc, lfo.depth);
      apply.rate = (v) => ramp(lfo.osc.frequency, ((bpm() || 120) / 60) / v, ctx);
      apply.depth = (v) => {
        ramp(g.gain, 1 - v * 0.5, ctx);
        ramp(lfo.depth.gain, v * 0.5, ctx);
      };
      break;
    }
    case 'autofilter': {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      input.connect(f);
      f.connect(output);
      lfo = makeLfo(ctx, 1);
      lfo.depth.connect(f.frequency);
      owned.push(f, lfo.osc, lfo.depth);
      const retune = () => {
        rampExp(f.frequency, p.cutoff * (1 + p.depth * 2), ctx);
        ramp(lfo.depth.gain, p.cutoff * p.depth * 2, ctx);
      };
      apply.rate = (v) => ramp(lfo.osc.frequency, ((bpm() || 120) / 60) / v, ctx);
      apply.depth = () => retune();
      apply.cutoff = () => retune();
      apply.resonance = (v) => ramp(f.Q, v, ctx);
      break;
    }
    case 'compressor': {
      const c = ctx.createDynamicsCompressor();
      const makeup = ctx.createGain();
      input.connect(c);
      c.connect(makeup);
      makeup.connect(output);
      owned.push(c, makeup);
      apply.threshold = (v) => ramp(c.threshold, v, ctx);
      apply.ratio = (v) => ramp(c.ratio, v, ctx);
      apply.attack = (v) => ramp(c.attack, v, ctx);
      apply.release = (v) => ramp(c.release, v, ctx);
      apply.makeup = (v) => ramp(makeup.gain, Math.pow(10, v / 20), ctx);
      break;
    }
    case 'eq3': {
      const lo = ctx.createBiquadFilter();
      lo.type = 'lowshelf';
      lo.frequency.value = 250;
      const mid = ctx.createBiquadFilter();
      mid.type = 'peaking';
      mid.frequency.value = 1000;
      mid.Q.value = 0.8;
      const hi = ctx.createBiquadFilter();
      hi.type = 'highshelf';
      hi.frequency.value = 4000;
      input.connect(lo);
      lo.connect(mid);
      mid.connect(hi);
      hi.connect(output);
      owned.push(lo, mid, hi);
      apply.low = (v) => ramp(lo.gain, v, ctx);
      apply.mid = (v) => ramp(mid.gain, v, ctx);
      apply.high = (v) => ramp(hi.gain, v, ctx);
      break;
    }
    case 'pan': {
      const pan = ctx.createStereoPanner();
      input.connect(pan);
      pan.connect(output);
      owned.push(pan);
      apply.pan = (v) => ramp(pan.pan, v, ctx);
      break;
    }
    default:
      input.connect(output);
  }

  for (const k of Object.keys(spec.params)) {
    if (p[k] === undefined) p[k] = spec.params[k][2];
    if (apply[k]) apply[k](p[k]);
  }

  return {
    kind,
    input,
    output,
    params: p,
    set(key, value) {
      const v = fxClamp(kind, key, value);
      if (v === null) return false;
      p[key] = v;
      if (apply[key]) apply[key](v);
      return true;
    },
    // Tempo changed: re-derive every beats-unit parameter.
    retune() {
      for (const [k, s] of Object.entries(spec.params)) {
        if (s[3] === 'beats' && apply[k]) apply[k](p[k]);
      }
    },
    // The gate's phase is handed down by the transport on (re)schedule.
    syncPhase(phase01) {
      if (workletNode && kind === 'gate') workletNode.port.postMessage({ type: 'phase', phase: phase01 });
    },
    dispose() {
      clearTimeout(pendingIr);
      if (lfo) {
        try {
          lfo.osc.stop();
        } catch {
          /* already stopped */
        }
      }
      for (const n of owned) {
        try {
          n.disconnect();
        } catch {
          /* detached already */
        }
      }
    },
  };
}
