// Checks the host effect entries of a track's chain (kind `host:<id>`, the
// effects theDAW supplies when it frames the cockpit): the project validator
// keeps them with and without the host's catalog, and the catalog becomes
// kinds the transport and the assignment panel read like the cockpit's own.
//
//   node scripts/test-hostfx.js

'use strict';

const assert = require('node:assert/strict');

const trackfx = require('../src/shared/trackfx');
const { validateProject, defaultProject } = require('../src/shared/swayproject');

let checks = 0;
function check(name, fn) {
  checks++;
  try {
    fn();
  } catch (err) {
    console.error(`FAIL  ${name}\n        ${err.message}`);
    process.exitCode = 1;
  }
}

// A project whose first track holds one cockpit effect, one host effect and a
// section and a pad on the host effect's parameter.
function projectWith(fx) {
  const doc = defaultProject();
  const track = doc.project.timeline.tracks[0];
  track.fx = fx;
  track.regions = [{ id: 'rg-1', start: 1, end: 2, fx: 'fx-host', param: 'wet', value: 0.9 }];
  doc.project.assignments.pads[0] = { type: 'trackFx', track: track.id, fx: 'fx-host', param: 'wet', value: 1 };
  return doc;
}

const HOST_ENTRY = { id: 'fx-host', kind: 'host:reverb', enabled: false, label: 'Reverb', params: { decay: 3.5, wet: 0.4, junk: 'x', hall: 1 } };
const OWN_ENTRY = { id: 'fx-own', kind: 'filter', enabled: true, params: { cutoff: 900 } };

const CATALOG = [
  {
    id: 'reverb',
    name: 'Reverb',
    group: 'Space',
    mix: 'wet',
    params: [
      { key: 'hall', name: 'Hall', min: 0, max: 2, step: 1, default: 0, unit: '', options: ['Synthetic room', 'Front', 'Rear'], values: [0, 1, 2], curve: 'lin' },
      { key: 'decay', name: 'Decay', min: 0.1, max: 8, step: 0.1, default: 2, unit: 's', options: null, values: null, curve: 'log' },
      { key: 'wet', name: 'Mix', min: 0, max: 1, step: 0.01, default: 0.3, unit: '', percent: true, options: null, values: null, curve: 'lin' },
    ],
  },
  { id: 'broken', name: 'Broken', params: [{ key: 'x', min: 1, max: 1 }] },
  { name: 'no id', params: [] },
];

// --- without a catalog: the desktop app, and the moments before the handshake

trackfx.registerHostFx([]);

check('a host entry is kept with no catalog', () => {
  const { doc } = validateProject(projectWith([OWN_ENTRY, HOST_ENTRY]));
  const fx = doc.project.timeline.tracks[0].fx;
  assert.deepEqual(fx.map((e) => e.kind), ['filter', 'host:reverb']);
  assert.deepEqual(fx[1], { id: 'fx-host', kind: 'host:reverb', enabled: false, params: { decay: 3.5, wet: 0.4, hall: 1 }, label: 'Reverb' });
});

check('it survives a second pass unchanged (save, then load)', () => {
  const once = validateProject(projectWith([OWN_ENTRY, HOST_ENTRY])).doc;
  const twice = validateProject(JSON.parse(JSON.stringify(once))).doc;
  assert.deepEqual(twice.project.timeline.tracks[0].fx, once.project.timeline.tracks[0].fx);
});

check('a section and a pad on its parameter are kept with it', () => {
  const { doc } = validateProject(projectWith([HOST_ENTRY]));
  assert.equal(doc.project.timeline.tracks[0].regions[0].fx, 'fx-host');
  assert.equal(doc.project.assignments.pads[0].fx, 'fx-host');
});

check('with no catalog it has no spec, and its name is the label it carries', () => {
  assert.equal(trackfx.fxSpec('host:reverb'), null);
  assert.equal(trackfx.fxDefaults('host:reverb'), null);
  assert.equal(trackfx.fxClamp('host:reverb', 'wet', 2), null);
  assert.equal(trackfx.fxLabel(HOST_ENTRY), 'Reverb');
  assert.equal(trackfx.fxLabel({ kind: 'host:reverb' }), 'reverb');
  assert.equal(trackfx.fxLabel(OWN_ENTRY), 'filter');
});

check('an entry of no known kind is still dropped', () => {
  const { doc } = validateProject(projectWith([{ id: 'x', kind: 'nope', params: {} }, { id: 'y', kind: 'host:', params: {} }]));
  assert.deepEqual(doc.project.timeline.tracks[0].fx, []);
});

// --- with the host's catalog ---------------------------------------------------

check('the catalog registers its usable effects as host kinds', () => {
  assert.equal(trackfx.registerHostFx(CATALOG), 1);
  assert.deepEqual(trackfx.hostFxOrder(), ['host:reverb']);
  assert.equal(trackfx.isHostKind('host:reverb'), true);
  assert.equal(trackfx.isHostKind('reverb'), false);
  assert.equal(trackfx.hostFxId('host:reverb'), 'reverb');
  const spec = trackfx.fxSpec('host:reverb');
  assert.equal(spec.label, 'Reverb');
  assert.equal(spec.mix, 'wet');
  assert.equal(spec.params.hall[3], 'enum');
  assert.deepEqual(spec.params.hall[4].values, [0, 1, 2]);
  assert.deepEqual(spec.options.hall, ['Synthetic room', 'Front', 'Rear']);
  assert.equal(spec.params.decay[4].log, true);
  assert.equal(spec.params.wet[4].percent, true);
});

check('defaults and clamps read the host spec; the cockpit kinds are untouched', () => {
  assert.deepEqual(trackfx.fxDefaults('host:reverb'), { hall: 0, decay: 2, wet: 0.3 });
  assert.equal(trackfx.fxClamp('host:reverb', 'decay', 99), 8);
  assert.equal(trackfx.fxClamp('host:reverb', 'nope', 1), null);
  assert.equal(trackfx.fxClamp('filter', 'cutoff', 5), 40);
  assert.deepEqual(trackfx.FX_ORDER.includes('host:reverb'), false);
});

check('with the catalog a host entry is filled and clamped to it', () => {
  const entry = { id: 'fx-host', kind: 'host:reverb', params: { decay: 99, gone: 4 } };
  const { doc } = validateProject(projectWith([entry]));
  assert.deepEqual(doc.project.timeline.tracks[0].fx[0], {
    id: 'fx-host',
    kind: 'host:reverb',
    enabled: true,
    params: { hall: 0, decay: 8, wet: 0.3 },
    label: 'Reverb',
  });
});

check('a host effect this catalog lacks keeps its values', () => {
  const entry = { id: 'fx-host', kind: 'host:chop', enabled: true, params: { rate: 8 }, label: 'Chop' };
  const { doc } = validateProject(projectWith([entry]));
  assert.deepEqual(doc.project.timeline.tracks[0].fx[0].params, { rate: 8 });
});

trackfx.registerHostFx([]);

// --- VST3 rows and the instruments' buses

check('every VST3 row gets an id unique in the project, and keeps its state and host', () => {
  const doc = defaultProject();
  const tracks = doc.project.timeline.tracks;
  tracks.splice(1, 0, { ...JSON.parse(JSON.stringify(tracks[0])), id: 'audio-2' });
  tracks[0].vst.plugins = [
    { path: 'C:/p/a.vst3', name: 'A', rawState: 'QUJD', stateHost: 'thedaw' },
    { id: 'vst-1', path: 'C:/p/b.vst3', stateHost: 'nonsense' },
  ];
  tracks[1].vst.plugins = [{ id: 'vst-1', path: 'C:/p/c.vst3' }];
  const { doc: out } = validateProject(doc);
  const [t1, t2] = out.project.timeline.tracks;
  const ids = [...t1.vst.plugins, ...t2.vst.plugins].map((r) => r.id);
  assert.equal(new Set(ids).size, 3, `ids ${ids.join(', ')}`);
  assert.equal(t1.vst.plugins[1].id, 'vst-1', 'the first holder of an id keeps it');
  assert.equal(t1.vst.plugins[0].rawState, 'QUJD');
  assert.equal(t1.vst.plugins[0].stateHost, 'thedaw');
  assert.equal(t1.vst.plugins[1].stateHost, null, 'an unknown host reads as none');
  assert.equal(t1.vst.live, true, 'a chain is live unless it says otherwise');
});

check('a project holds the kit and synth buses, with their chains, and nothing else', () => {
  const doc = defaultProject();
  doc.project.timeline.buses = [
    { id: 'bus-synth', name: 'Renamed', fx: [OWN_ENTRY], clips: [{ media: 'x', start: 0, end: 1 }], vst: { live: false, plugins: [{ path: 'C:/p/s.vst3' }] } },
    { id: 'bus-other', fx: [] },
  ];
  doc.project.assignments.pads[1] = { type: 'trackFx', track: 'bus-synth', fx: 'fx-own', param: 'cutoff', value: 200 };
  const { doc: out } = validateProject(doc);
  const buses = out.project.timeline.buses;
  assert.deepEqual(buses.map((b) => `${b.id}:${b.source}:${b.type}:${b.name}`), ['bus-kit:kit:bus:Kit', 'bus-synth:synth:bus:Synth']);
  assert.equal(buses[1].fx[0].id, 'fx-own');
  assert.equal(buses[1].clips.length, 0, 'a bus has no clips');
  assert.equal(buses[1].vst.live, true, 'a bus chain is always live');
  assert.equal(buses[1].vst.plugins[0].path, 'C:/p/s.vst3');
  assert.ok(out.project.assignments.pads[1], 'a pad may punch a bus effect');
  assert.equal(out.project.timeline.tracks.some((t) => t.type === 'bus'), false, 'buses are not timeline tracks');
});

if (process.exitCode) {
  console.error(`hostfx: FAILED (${checks} checks)`);
} else {
  console.log(`hostfx: ok (${checks} checks)`);
}
