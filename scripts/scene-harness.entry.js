// Browser side of scripts/scene-harness.js: the scene registry and three.js,
// bundled by esbuild and loaded into a hidden Electron window. Exposes
// window.__h, init(width, height, tier) builds the renderer and the creation
// context the engine would pass (docs/SCENE_CONTRACT.md); run(id, frames, dt,
// patch) drives one scene's update() for a number of frames with a patched
// io snapshot, renders, times a burst, and returns the still as a PNG data
// URL. Shader compile errors surface through the console hooks.
//
// A shot's patch may carry, besides the io fields:
//   "strike": 3               one pad struck on the first frame (decays as the engine decays it)
//   "strikes": [0, 5, 12]     several pads struck together on the first frame
//   "transport": { "playing": true, "time": 0 }   the show clock a scene sees in io.transport
//   "actions": ["blackhole"]  scene-declared events fired through action() on the first frame
//   "params": { "objectScale": 3 }   scene-declared parameters set through setParam() before the frames
// The last two reach the scene exactly as the router would reach it.

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { creators, sceneList } from '../src/renderer/engine/scenes/index.js';

const logs = [];
for (const k of ['error', 'warn']) {
  const orig = console[k].bind(console);
  console[k] = (...a) => {
    logs.push(`${k[0].toUpperCase()}: ${a.map((x) => String((x && x.message) || x)).join(' ').slice(0, 2000)}`);
    orig(...a);
  };
}

const TIERS = { low: 8000, med: 30000, high: 80000 };
const instances = new Map();
let renderer = null;
let ctx = null;
let io = null;
let t = 0;
let timerExt = null;

function init(width, height, tier = 'med') {
  const canvas = document.getElementById('c');
  canvas.width = width;
  canvas.height = height;
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  // The environment is built on first access, as the engine builds it: it
  // costs most of a second and only the chrome scenes ask for it. Building it
  // eagerly also put three's PMREM program info log (a D3D X4122 note on a
  // cold program cache) into every report, attributed to nothing.
  let environmentTex = null;
  ctx = { THREE, renderer, width, height, quality: { tier, particles: TIERS[tier] || TIERS.med } };
  Object.defineProperty(ctx, 'environment', {
    enumerable: true,
    get() {
      if (!environmentTex) {
        const pmrem = new THREE.PMREMGenerator(renderer);
        const room = new RoomEnvironment();
        environmentTex = pmrem.fromScene(room, 0.04).texture;
        pmrem.dispose();
        room.dispose();
      }
      return environmentTex;
    },
  });
  timerExt = renderer.getContext().getExtension('EXT_disjoint_timer_query_webgl2');
  io = {
    level: 0,
    bands: { bass: 0, mid: 0, high: 0 },
    beat: 0,
    xy: { x: 0.5, y: 0.5 },
    gestures: { pulse: 0, press: 0, sway: 0 },
    knobs: new Array(8).fill(0.5),
    pads: new Array(16).fill(0),
    lastPad: -1,
    strike: 0,
    palette: ['#f2c9a6', '#5b3f9e', '#bfefff', '#ffb26b', '#e88aa8'].map((c) => new THREE.Color(c)),
    intensity: 1,
    transport: { playing: false, time: 0 },
  };
  return sceneList.map((s) => s.id);
}

function sceneCtx() {
  const c = { THREE: ctx.THREE, renderer: ctx.renderer, width: ctx.width, height: ctx.height, quality: ctx.quality };
  Object.defineProperty(c, 'environment', { enumerable: true, get: () => ctx.environment });
  return c;
}

// Per-scene cost of coming up: build (createScene), the synchronous program
// compile + link, and the FIRST draw, on a cold shader cache the first draw
// is where the D3D driver's real compile lands, and a shader that unrolls
// into something huge shows up here as tens of seconds. Run the harness with
// `"freshCache": true` in the plan to measure it cold.
const warm = {};
function instance(id) {
  if (!instances.has(id)) {
    const create = creators[id];
    if (!create) throw new Error(`Unknown scene: ${id}`);
    const t0 = performance.now();
    const inst = create(sceneCtx());
    const t1 = performance.now();
    instances.set(id, inst);
    renderer.compile(inst.scene, inst.camera);
    const t2 = performance.now();
    renderer.setRenderTarget(null);
    renderer.render(inst.scene, inst.camera);
    const gl = renderer.getContext();
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4)); // drain: the first draw must finish
    const t3 = performance.now();
    warm[id] = { buildMs: Math.round(t1 - t0), compileMs: Math.round(t2 - t1), firstDrawMs: Math.round(t3 - t2) };
  }
  return instances.get(id);
}

function applyPatch(patch) {
  if (!patch) return;
  if (patch.palette) patch.palette.forEach((c, i) => io.palette[i].set(c));
  if (patch.knobs) for (const [k, v] of Object.entries(patch.knobs)) io.knobs[Number(k)] = v;
  if (patch.xy) Object.assign(io.xy, patch.xy);
  if (patch.gestures) Object.assign(io.gestures, patch.gestures);
  if (patch.bands) Object.assign(io.bands, patch.bands);
  if (patch.transport) Object.assign(io.transport, patch.transport);
  if ('level' in patch) io.level = patch.level;
  if ('beat' in patch) io.beat = patch.beat;
  if ('intensity' in patch) io.intensity = patch.intensity;
}

// The GPU cost of one frame. gl.finish() does not reliably block on ANGLE /
// D3D11 for a hidden window, so a wall-clock burst read 0.2 ms for frames
// that cost 15. Two measurements instead: the disjoint timer query, which
// is the GPU's own clock when the extension is present (`gpuMs`), and a
// burst long enough to saturate the command queue, closed by a 1×1 readPixels
// that genuinely waits for the pipeline (`msPerFrame`).
function timeBurst(inst, dt, frames) {
  const gl = renderer.getContext();
  let query = null;
  if (timerExt) {
    query = gl.createQuery();
    gl.beginQuery(timerExt.TIME_ELAPSED_EXT, query);
  }
  const t2 = performance.now();
  for (let f = 0; f < frames; f++) {
    inst.update(dt, t, io);
    t += dt;
    renderer.render(inst.scene, inst.camera);
  }
  if (query) gl.endQuery(timerExt.TIME_ELAPSED_EXT);
  const px = new Uint8Array(4);
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); // the pipeline must drain for this
  const msPerFrame = (performance.now() - t2) / frames;
  let gpuMs = null;
  if (query) {
    // the result is asynchronous; poll it without a frame loop
    const deadline = performance.now() + 2000;
    while (performance.now() < deadline) {
      if (gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE)) {
        const disjoint = gl.getParameter(timerExt.GPU_DISJOINT_EXT);
        if (!disjoint) gpuMs = gl.getQueryParameter(query, gl.QUERY_RESULT) / 1e6 / frames;
        break;
      }
    }
    gl.deleteQuery(query);
  }
  return { msPerFrame, gpuMs };
}

// frames of update() with the patched io; strikes land on the first frame
// and decay as the engine decays them; actions fire on the first frame and
// params are set before any of it; then one render, then a timed burst
function run(id, frames, dt, patch) {
  const inst = instance(id);
  applyPatch(patch);
  if (patch && patch.params && typeof inst.setParam === 'function') {
    for (const [k, v] of Object.entries(patch.params)) inst.setParam(k, v);
  }
  const strikes = [];
  if (patch && patch.strike != null && patch.strike >= 0) strikes.push(patch.strike);
  if (patch && Array.isArray(patch.strikes)) for (const i of patch.strikes) strikes.push(i);
  const t0 = performance.now();
  for (let f = 0; f < frames; f++) {
    for (const i of strikes) {
      io.pads[i] = f === 0 ? 1 : io.pads[i] * Math.exp(-dt * 5);
      io.lastPad = i;
    }
    let s = 0;
    for (let i = 0; i < 16; i++) if (io.pads[i] > s) s = io.pads[i];
    io.strike = s;
    if (f === 0 && patch && Array.isArray(patch.actions) && typeof inst.action === 'function') {
      for (const a of patch.actions) inst.action(a);
    }
    inst.update(dt, t, io);
    t += dt;
  }
  const updateMs = (performance.now() - t0) / Math.max(1, frames);
  renderer.setRenderTarget(null);
  renderer.setClearColor(0x000000, 1);
  renderer.clear();
  inst.update(dt, t, io);
  t += dt;
  renderer.render(inst.scene, inst.camera);
  const png = renderer.domElement.toDataURL('image/png');
  const { msPerFrame, gpuMs } = timeBurst(inst, dt, 40);
  for (let i = 0; i < 16; i++) io.pads[i] = 0;
  io.strike = 0;
  return { updateMs, msPerFrame, gpuMs, png, warm: warm[id] || null };
}

window.__h = { init, run, logs, ids: () => sceneList.map((s) => s.id) };
