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
// Kinds named `host:<id>` are effects the embedding host supplies (theDAW's
// rack); their rows are registered at run time, see "host effects" below.
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

// --- host effects --------------------------------------------------------------
// Inside theDAW the host hands the cockpit its own effect catalog
// (renderer/audio/hostfx.js). Each of those effects is a kind `host:<id>` whose
// spec is registered here at run time, in the shape of the rows above, so the
// transport, the validator and the assignment panel treat it as one more kind.
// A host param spec is [min, max, default, unit, extra]: unit is 'enum' for a
// pick, otherwise unset; extra is { name, step, log, percent, suffix, values,
// tip }, where `values` holds the number each option of a pick sets.
//
// The table is empty in the desktop app and in the main process. A `host:`
// entry then has no spec: it stays in the project and passes audio through.

const HOST_PREFIX = 'host:';
const hostKinds = new Map();

function isHostKind(kind) {
  return typeof kind === 'string' && kind.startsWith(HOST_PREFIX) && kind.length > HOST_PREFIX.length;
}

function hostFxId(kind) {
  return isHostKind(kind) ? kind.slice(HOST_PREFIX.length) : null;
}

function hostFxKind(id) {
  return HOST_PREFIX + id;
}

// Replaces the table with the host's catalog: [{ id, name, group, mix, params:
// [{ key, name, min, max, step, default, unit, options, values, curve,
// percent, tip }] }]. Rows that do not describe a usable effect are skipped.
// Returns how many kinds are registered.
function registerHostFx(catalog) {
  hostKinds.clear();
  for (const fx of Array.isArray(catalog) ? catalog : []) {
    if (!fx || typeof fx.id !== 'string' || !fx.id || !Array.isArray(fx.params)) continue;
    const params = {};
    const options = {};
    for (const p of fx.params) {
      if (!p || typeof p.key !== 'string' || !p.key) continue;
      const lo = Number(p.min);
      const hi = Number(p.max);
      if (!Number.isFinite(lo) || !Number.isFinite(hi) || !(hi > lo)) continue;
      const def = Number.isFinite(Number(p.default)) ? Math.min(hi, Math.max(lo, Number(p.default))) : lo;
      const labels = Array.isArray(p.options) && p.options.length ? p.options.map(String) : null;
      const values = labels && Array.isArray(p.values) && p.values.length === labels.length ? p.values.map(Number) : null;
      const pick = !!(labels && values && values.every(Number.isFinite));
      params[p.key] = [
        lo,
        hi,
        def,
        pick ? 'enum' : undefined,
        {
          name: typeof p.name === 'string' && p.name ? p.name : p.key,
          step: Number(p.step) > 0 ? Number(p.step) : 0,
          log: p.curve === 'log' && lo > 0,
          percent: p.percent === true,
          suffix: typeof p.unit === 'string' ? p.unit : '',
          values: pick ? values : null,
          tip: typeof p.tip === 'string' ? p.tip : '',
        },
      ];
      if (pick) options[p.key] = labels;
    }
    if (!Object.keys(params).length) continue;
    hostKinds.set(hostFxKind(fx.id), {
      label: typeof fx.name === 'string' && fx.name ? fx.name : fx.id,
      group: typeof fx.group === 'string' ? fx.group : '',
      mix: typeof fx.mix === 'string' && params[fx.mix] ? fx.mix : null,
      host: true,
      params,
      options,
    });
  }
  return hostKinds.size;
}

// The registered host kinds, in the host's own order.
function hostFxOrder() {
  return [...hostKinds.keys()];
}

function fxSpec(kind) {
  return FX_KINDS[kind] || hostKinds.get(kind) || null;
}

// The name a chain entry shows: its kind's label, else the label the entry
// carries (a host effect outside its host), else the kind.
function fxLabel(entry) {
  const spec = entry ? fxSpec(entry.kind) : null;
  if (spec) return spec.label;
  if (!entry) return '';
  return (typeof entry.label === 'string' && entry.label) || hostFxId(entry.kind) || String(entry.kind);
}

function fxDefaults(kind) {
  const spec = fxSpec(kind);
  if (!spec) return null;
  const out = {};
  for (const [k, s] of Object.entries(spec.params)) out[k] = s[2];
  return out;
}

// Clamps one param into its spec range; returns null for unknown keys.
function fxClamp(kind, key, value) {
  const spec = fxSpec(kind);
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

module.exports = {
  FX_KINDS,
  FX_ORDER,
  fxSpec,
  fxLabel,
  fxDefaults,
  fxClamp,
  beatsToSeconds,
  isHostKind,
  hostFxId,
  hostFxKind,
  hostFxOrder,
  registerHostFx,
};
