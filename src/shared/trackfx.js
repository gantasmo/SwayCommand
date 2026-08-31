// Track effects, the specification table shared by the .sway validator, the
// audio graph (renderer/audio/trackfx.js) and the assignment panel. Shared
// between the main process (CommonJS require) and the renderer bundle, so it
// stays dependency-free and touches no DOM, fs or Electron.
//
// A track's chain is an ordered list of entries { id, kind, enabled, params }
// where `kind` names a row below and `params` holds one number per key. The
// kinds here are the LIVE effects, Web Audio graphs the transport builds per
// track. VST3 plugins are the separate `track.vst` chain, rendered offline
// through the pedalboard sidecar (main/vsthost.js) and played as a wet/dry
// mix; they have no row here.
//
// Param spec: [min, max, default, unit?]. Units: 'hz' (log mapped on the UI
// slider), 'beats' (a tempo-synced division, converted with the timeline's
// bpm, 120 when unknown), 'db', 'enum' (an integer pick from `options`).

'use strict';

const FX_KINDS = Object.freeze({
  filter: {
    label: 'filter',
    params: {
      type: [0, 2, 0, 'enum'],
      cutoff: [40, 18000, 18000, 'hz'],
      resonance: [0.1, 18, 0.7],
    },
    options: { type: ['low pass', 'high pass', 'band pass'] },
  },
  delay: {
    label: 'delay',
    params: {
      time: [0.0625, 2, 0.5, 'beats'],
      feedback: [0, 0.95, 0.35],
      tone: [400, 18000, 7000, 'hz'],
      mix: [0, 1, 0.35],
    },
  },
  reverb: {
    label: 'reverb',
    params: {
      size: [0.2, 8, 2.2],
      damp: [0, 1, 0.5],
      mix: [0, 1, 0.3],
    },
  },
  distortion: {
    label: 'distortion',
    params: {
      drive: [0, 1, 0.4],
      tone: [300, 16000, 6000, 'hz'],
      mix: [0, 1, 1],
    },
  },
  crusher: {
    label: 'bit crusher',
    params: {
      bits: [2, 16, 8],
      rate: [0.02, 1, 0.5],
      mix: [0, 1, 1],
    },
  },
  gate: {
    label: 'trance gate',
    params: {
      rate: [0.0625, 1, 0.25, 'beats'],
      depth: [0, 1, 1],
      shape: [0, 1, 0.3],
    },
  },
  phaser: {
    label: 'phaser',
    params: {
      rate: [0.05, 8, 0.5, 'hz'],
      depth: [0, 1, 0.7],
      feedback: [0, 0.9, 0.3],
      mix: [0, 1, 0.5],
    },
  },
  flanger: {
    label: 'flanger',
    params: {
      rate: [0.05, 5, 0.25, 'hz'],
      depth: [0, 1, 0.6],
      feedback: [0, 0.9, 0.4],
      mix: [0, 1, 0.5],
    },
  },
  chorus: {
    label: 'chorus',
    params: {
      rate: [0.05, 4, 0.8, 'hz'],
      depth: [0, 1, 0.5],
      mix: [0, 1, 0.5],
    },
  },
  tremolo: {
    label: 'tremolo',
    params: {
      rate: [0.0625, 2, 0.25, 'beats'],
      depth: [0, 1, 0.8],
    },
  },
  autofilter: {
    label: 'auto filter',
    params: {
      rate: [0.125, 4, 1, 'beats'],
      depth: [0, 1, 0.8],
      cutoff: [80, 8000, 400, 'hz'],
      resonance: [0.1, 12, 4],
    },
  },
  compressor: {
    label: 'compressor',
    params: {
      threshold: [-60, 0, -18, 'db'],
      ratio: [1, 20, 4],
      attack: [0.001, 0.3, 0.01],
      release: [0.02, 1, 0.2],
      makeup: [0, 24, 0, 'db'],
    },
  },
  eq3: {
    label: 'three band eq',
    params: {
      low: [-18, 18, 0, 'db'],
      mid: [-18, 18, 0, 'db'],
      high: [-18, 18, 0, 'db'],
    },
  },
  pan: {
    label: 'pan',
    params: {
      pan: [-1, 1, 0],
    },
  },
});

const FX_ORDER = Object.keys(FX_KINDS);

function fxSpec(kind) {
  return FX_KINDS[kind] || null;
}

function fxDefaults(kind) {
  const spec = FX_KINDS[kind];
  if (!spec) return null;
  const out = {};
  for (const [k, s] of Object.entries(spec.params)) out[k] = s[2];
  return out;
}

// Clamps one param into its spec range; returns null for unknown keys.
function fxClamp(kind, key, value) {
  const spec = FX_KINDS[kind];
  if (!spec || !spec.params[key]) return null;
  const [lo, hi] = spec.params[key];
  const v = Number(value);
  if (!Number.isFinite(v)) return spec.params[key][2];
  return v < lo ? lo : v > hi ? hi : v;
}

// A tempo-synced division in beats -> seconds at the given bpm.
function beatsToSeconds(beats, bpm) {
  const b = Number(bpm) > 0 ? Number(bpm) : 120;
  return (60 / b) * beats;
}

module.exports = { FX_KINDS, FX_ORDER, fxSpec, fxDefaults, fxClamp, beatsToSeconds };
