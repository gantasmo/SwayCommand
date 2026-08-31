// Nature's Tomb, OCEAN CURRENTS: a port of Luis Alberto Martinez Riancho's
// (lessrain) CodePen "Mediterranean Drift V3 (WebGL)" (MIT, notice below). A
// scene-private module of Nature's Tomb (never registered, no meta); the
// factory builds a background quad, one instanced trail mesh and one
// instanced marker mesh, and returns them with an update the Tomb drives.
//
// The pen: 14,000 CPU particles circulating round six drifting low- and
// high-pressure systems, a flow field (per system a tangential swirl
// s·mag·t̂ with mag = strength·(d/r)·exp(−d²/2r²)·gain, an inflow of 0.32·mag
// toward a low, out of a high, plus a background wind) sampled off a JS grid,
// integrated at 30 Hz, each step drawn as a speed-coloured line (an eight-
// colour ramp by speed²) into a ping-pong accumulation buffer faded by 7 % a
// frame; six modes (Summer Calm, Levante, Mistral, Tramontana, Sirocco,
// Winter Storm) each a table of flow speed, field gain, background wind,
// wander and six systems (x, y, spin, r, strength) that setMode eases into;
// pressure rings as point sprites, L / H markers in the DOM.
//
// Here:
//   TRAILS      no accumulation pass (a scene does not render): each particle
//               keeps its last NINE positions in a ring of instanced
//               attributes and is drawn as EIGHT capsule segments in one draw
//               call, alpha fading along the trail, colour by the current
//               speed, which gives the pen's fading-streak look; the ring
//               head advances at the pen's 30 Hz and only the slot written
//               that step is uploaded. The field is evaluated directly per
//               particle (no grid) on the CPU, allocation-free. A re-spawned
//               particle's trail grows from its spawn point segment by segment
//               (nothing appears at its size).
//   MODE        the Tomb's development level steps through the six regimes
//               in the pen's order (calm -> levante -> mistral -> tramontana ->
//               sirocco -> winter storm) with every table value, the
//               systems' positions, spins, radii and strengths, the flow
//               speed, the gain, the background wind, the wander,
//               INTERPOLATED continuously, so the knob morphs the field rather
//               than cutting (a spin flip passes through zero: the system
//               weakens and reverses); a pad steps one regime.
//   GESTURES    sway is the field gain and the wander, press the system
//               radius, the hand pans the map; bass lifts the flow speed, the
//               beat pulses the rings.
//   SPECIES     a seeded variation of the system layout, the wobble phases
//               and the wander scale.
//   PALETTE     the trails' ramp runs between the palette's entries sorted
//               cool -> warm (the pen's eight-colour ramp by speed bin); the
//               sea background is the palette's darkest stop; the rings and
//               the glyphs its lightest, lifted.
//   MOTION      systems drift by their wobble (translation), particles
//               circulate (per-particle flow); nothing rotates.
//
// Upstream: https://codepen.io/luis-lessrain/pen/emgBwPj
// The MIT License (MIT), Copyright (c) 2026 Luis Alberto Martinez Riancho
// (https://codepen.io/luis-lessrain/pen/emgBwPj). Permission is hereby
// granted, free of charge, to any person obtaining a copy of this software
// and associated documentation files (the "Software"), to deal in the
// Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions: The above
// copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED
// "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
// NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
// PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// CHANGES FROM THE ORIGINAL
//   - GLSL3 on three.js meshes; the accumulation framebuffers, the fading
//     quad and the DOM markers are replaced by per-particle position rings
//     drawn as capsule segments (trails), and by an instanced ring + glyph
//     impostor (the markers), see TRAILS above.
//   - The field is evaluated per particle instead of off a grid; particle
//     count by quality tier (the pen's 14,000 one-step lines become 9,000
//     eight-segment trails at med).
//   - The six modes are interpolated on the development level instead of
//     picked by buttons; gestures, the hand, the audio and the species are
//     added; colour from io.palette; the mode's own palette / bg are
//     replaced by the Tomb's palette.

const SEGS = 8;         // capsule segments per particle
const RING = SEGS + 1;  // positions kept per particle
const NSYS = 6;
const INFLOW = 0.32;
const LIFE_MIN = 1.15, LIFE_MAX = 3.9;
const SYSTEM_EVOLUTION = 0.08;
const STEP_HZ = 30;

// the pen's six modes: flowSpeed, fieldGain, bgU, bgV, wander, then six
// systems of (x, y, spin, r, strength), in the order the level steps them
const MODES = [
  [1.75, 0.31, 0.032, 0.0, 0.018, 0.18, 0.36, 1, 0.24, 0.55, 0.46, 0.22, -1, 0.25, 0.48, 0.56, 0.68, -1, 0.29, 0.52, 0.8, 0.34, 1, 0.24, 0.5, 0.86, 0.74, 1, 0.27, 0.42, 0.3, 0.58, 1, 0.2, 0.38],
  [2.25, 0.35, -0.055, 0.004, 0.023, 0.82, 0.3, -1, 0.26, 0.76, 0.62, 0.64, 1, 0.23, 0.7, 0.36, 0.28, 1, 0.22, 0.58, 0.18, 0.72, -1, 0.27, 0.66, 0.74, 0.78, 1, 0.22, 0.5, 0.44, 0.52, -1, 0.2, 0.54],
  [2.9, 0.43, 0.07, 0.02, 0.026, 0.14, 0.24, -1, 0.2, 0.84, 0.34, 0.44, 1, 0.18, 0.86, 0.54, 0.66, 1, 0.23, 0.95, 0.74, 0.34, -1, 0.2, 0.7, 0.88, 0.72, 1, 0.22, 0.8, 0.46, 0.2, -1, 0.18, 0.62],
  [3.05, 0.46, 0.025, 0.055, 0.031, 0.2, 0.18, -1, 0.18, 0.78, 0.4, 0.36, 1, 0.16, 0.82, 0.62, 0.28, -1, 0.18, 0.72, 0.8, 0.56, 1, 0.19, 0.9, 0.54, 0.76, 1, 0.22, 0.76, 0.26, 0.66, -1, 0.19, 0.68],
  [2.45, 0.4, -0.015, -0.045, 0.024, 0.22, 0.78, 1, 0.26, 0.78, 0.38, 0.56, -1, 0.2, 0.66, 0.58, 0.36, 1, 0.22, 0.86, 0.78, 0.22, -1, 0.24, 0.74, 0.84, 0.68, 1, 0.2, 0.68, 0.28, 0.28, -1, 0.21, 0.58],
  [3.2, 0.5, 0.06, -0.012, 0.034, 0.15, 0.32, 1, 0.18, 1.08, 0.35, 0.18, -1, 0.17, 0.86, 0.5, 0.62, -1, 0.22, 1.0, 0.7, 0.38, 1, 0.18, 1.04, 0.86, 0.78, 1, 0.2, 0.9, 0.28, 0.62, -1, 0.17, 0.78],
];

const TRAIL_VERT = /* glsl */ `
  uniform vec2 uRes, uPan, uDom;
  uniform float uAspect, uStep, uWidth, uAlpha, uSpeedGain;
  uniform int uHead;
  uniform vec3 uRamp[5];
  in vec2 aQuad;
  in float aJ;
  in vec4 aR0, aR1, aR2, aR3, aInfo;
  in vec2 aR4;
  out vec3 vCol;
  out vec2 vQ;
  out float vA, vLenR;
  vec2 slot(int k) {
    if (k == 0) return aR0.xy; if (k == 1) return aR0.zw;
    if (k == 2) return aR1.xy; if (k == 3) return aR1.zw;
    if (k == 4) return aR2.xy; if (k == 5) return aR2.zw;
    if (k == 6) return aR3.xy; if (k == 7) return aR3.zw;
    return aR4;
  }
  void main() {
    int j = int(aJ + 0.5);
    int k0 = (uHead - j + 18) % ${RING};
    int k1 = (uHead - j - 1 + 18) % ${RING};
    vec2 p0 = slot(k0), p1 = slot(k1);
    // a trail is only as long as the particle has lived: its segments come
    // in one a step from the spawn point
    float age = uStep - aInfo.y;
    float vis = step(float(j) + 0.5, age) * aInfo.w;
    vec2 s0 = p0 - uDom * 0.5 + uPan;
    vec2 s1 = p1 - uDom * 0.5 + uPan;
    vec2 d = s1 - s0;
    float len = length(d);
    vec2 dir = len > 1e-6 ? d / len : vec2(1.0, 0.0);
    vec2 nrm = vec2(-dir.y, dir.x);
    float rad = uWidth / uRes.y;
    vLenR = len / rad;
    vec2 pos = mix(s0 - dir * rad, s1 + dir * rad, aQuad.y) + nrm * aQuad.x * rad;
    vec2 ndc = pos / vec2(uAspect * 0.5, 0.5);
    gl_Position = vec4(ndc * vis, vis > 0.5 ? 0.0 : 2.0, 1.0);
    vQ = vec2(aQuad.x, aQuad.y * (vLenR + 2.0) - 1.0);
    // the colour by speed: the pen's ramp by speed², between the palette's
    // entries sorted cool -> warm
    float sc = clamp(aInfo.x * uSpeedGain, 0.0, 1.0) * 3.999;
    int ci = int(sc);
    float cf = sc - float(ci);
    vCol = mix(uRamp[ci], uRamp[min(ci + 1, 4)], cf);
    vA = uAlpha * (1.0 - float(j) / float(${SEGS})) * vis;
  }
`;
const TRAIL_FRAG = /* glsl */ `
  uniform float uIntensity, uWeight;
  in vec3 vCol;
  in vec2 vQ;
  in float vA, vLenR;
  out vec4 fragColor;
  void main() {
    float u = clamp(vQ.y, 0.0, vLenR);
    float dx = vQ.y - u;
    float d2 = dx * dx + vQ.x * vQ.x;
    if (d2 > 1.0) discard;
    float a = (1.0 - d2) * vA;
    fragColor = vec4(vCol * a * uIntensity * uWeight, 1.0);
  }
`;
// the pressure rings (the pen's point sprite) with an L / H glyph at the
// centre, as a screen-space impostor per system
const RING_VERT = /* glsl */ `
  uniform vec2 uPan, uDom;
  uniform float uAspect, uPulse;
  in vec2 aQuad;
  in vec2 aPos;
  in vec4 aS;    // radius (height units), strength, kind (+1 low, -1 high), alpha
  out vec2 vQ;
  out float vKind, vA;
  void main() {
    vec2 c = aPos - uDom * 0.5 + uPan;
    float r = max(aS.x * 0.62, 0.04) * (1.0 + 0.05 * uPulse);
    vec2 pos = c + aQuad * r;
    vec2 ndc = pos / vec2(uAspect * 0.5, 0.5);
    float vis = step(0.001, aS.w);
    gl_Position = vec4(ndc * vis, vis > 0.5 ? 0.0 : 2.0, 1.0);
    vQ = aQuad;
    vKind = aS.z;
    vA = aS.w;
  }
`;
const RING_FRAG = /* glsl */ `
  uniform vec3 uRingCol;
  uniform float uIntensity, uWeight;
  in vec2 vQ;
  in float vKind, vA;
  out vec4 fragColor;
  float box(vec2 p, vec2 b) { vec2 q = abs(p) - b; return 1.0 - smoothstep(0.0, 0.08, max(q.x, q.y)); }
  void main() {
    float d = length(vQ);
    float outer = smoothstep(1.0, 0.94, d) * smoothstep(0.88, 0.94, d);
    float mid = smoothstep(0.74, 0.69, d) * smoothstep(0.63, 0.69, d);
    float inner = smoothstep(0.48, 0.43, d) * smoothstep(0.36, 0.43, d);
    float alpha = max(max(outer, mid * 0.72), inner * 0.58);
    // the glyph: L for a low, H for a high, as bars
    vec2 g = vQ / 0.14;
    float bar;
    if (vKind > 0.0) bar = max(box(g - vec2(-0.45, 0.0), vec2(0.14, 0.8)), box(g - vec2(0.02, -0.66), vec2(0.55, 0.14)));
    else bar = max(max(box(g - vec2(-0.5, 0.0), vec2(0.14, 0.8)), box(g - vec2(0.5, 0.0), vec2(0.14, 0.8))), box(g, vec2(0.5, 0.14)));
    alpha = max(alpha, bar * 0.9);
    if (alpha < 0.004) discard;
    fragColor = vec4(uRingCol * alpha * vA * uIntensity * uWeight, 1.0);
  }
`;
const BG_VERT = /* glsl */ `
  uniform float uWarm;
  out vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = uWarm > 0.5 ? vec4(position.xy * 0.002 - 0.998, 0.0, 1.0) : vec4(position.xy, 0.0, 1.0);
  }`;
const BG_FRAG = /* glsl */ `
  uniform vec3 uBg;
  uniform float uIntensity, uWeight, uTime;
  uniform vec2 uRes;
  in vec2 vUv;
  out vec4 fragColor;
  float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
  float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
  void main() {
    vec2 uv = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
    // the dark sea: the palette's darkest stop, a little lighter toward the
    // middle, with a slow broad swell in it
    float n = vn(uv * 2.5 + vec2(uTime * 0.02, -uTime * 0.013));
    vec3 c = uBg * (0.85 + 0.25 * n) * (1.1 - 0.35 * length(uv));
    fragColor = vec4(c * uIntensity * uWeight, 1.0);
  }
`;

// S is the Tomb's per-frame plate state: { dt, t, weight, level, sway, press,
// hx, hy, openS, openDim, speciesHash, warm, bass, pulse }; S.order is the
// palette sorted cool -> warm (indices into io.palette).
export function createCurrents(THREE, ctx) {
  const tier = ctx.quality.tier;
  const N = tier === 'low' ? 5000 : tier === 'high' ? 14000 : 9000;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const approach = (v, to, tau, dt) => v + (to - v) * (1 - Math.exp(-dt / tau));
  const hash1 = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  // the map: the domain is 1.3 × the view (in height units, height 1.3), so
  // the hand's pan never shows an edge
  const MARGIN = 1.3;
  let aspect = ctx.width / Math.max(1, ctx.height);
  let domW = MARGIN * aspect, domH = MARGIN;

  // --- the trails: eight quads per particle, the positions in a ring of attributes
  const geo = new THREE.InstancedBufferGeometry();
  {
    const pos = new Float32Array(SEGS * 4 * 3);
    const quad = new Float32Array(SEGS * 4 * 2);
    const js = new Float32Array(SEGS * 4);
    const idx = [];
    for (let j = 0; j < SEGS; j++) {
      const b = j * 4;
      quad.set([-1, 0, 1, 0, -1, 1, 1, 1], b * 2);
      js[b] = j; js[b + 1] = j; js[b + 2] = j; js[b + 3] = j;
      idx.push(b, b + 1, b + 2, b + 2, b + 1, b + 3);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aQuad', new THREE.BufferAttribute(quad, 2));
    geo.setAttribute('aJ', new THREE.BufferAttribute(js, 1));
    geo.setIndex(idx);
  }
  const R = [];
  const RA = [];
  for (let k = 0; k < 4; k++) {
    const a = new Float32Array(N * 4);
    const at = new THREE.InstancedBufferAttribute(a, 4);
    at.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('aR' + k, at);
    R.push(a); RA.push(at);
  }
  const r4 = new Float32Array(N * 2);
  const r4A = new THREE.InstancedBufferAttribute(r4, 2);
  r4A.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('aR4', r4A);
  const info = new Float32Array(N * 4);
  const infoA = new THREE.InstancedBufferAttribute(info, 4);
  infoA.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('aInfo', infoA);
  geo.instanceCount = N;
  const rampU = new Float32Array(15);
  const TU = {
    uRes: { value: new THREE.Vector2(ctx.width, ctx.height) },
    uPan: { value: new THREE.Vector2(0, 0) },
    uDom: { value: new THREE.Vector2(domW, domH) },
    uAspect: { value: aspect },
    uStep: { value: 0 },
    uWidth: { value: 1.4 },
    uAlpha: { value: 0.54 },
    uSpeedGain: { value: 1 / 0.0256 },
    uHead: { value: 0 },
    uRamp: { value: rampU },
    uIntensity: { value: 1 },
    uWeight: { value: 0 },
  };
  const trailMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, uniforms: TU, vertexShader: TRAIL_VERT, fragmentShader: TRAIL_FRAG,
    transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
  trailMat.name = 'tomb-currents-trails';
  const trails = new THREE.Mesh(geo, trailMat);
  trails.frustumCulled = false;
  trails.renderOrder = 2;

  // --- the markers: one quad per system
  const rgeo = new THREE.InstancedBufferGeometry();
  rgeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0]), 3));
  rgeo.setAttribute('aQuad', new THREE.BufferAttribute(new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), 2));
  rgeo.setIndex([0, 1, 2, 2, 1, 3]);
  const mPos = new Float32Array(NSYS * 2), mS = new Float32Array(NSYS * 4);
  const mPosA = new THREE.InstancedBufferAttribute(mPos, 2), mSA = new THREE.InstancedBufferAttribute(mS, 4);
  mPosA.setUsage(THREE.DynamicDrawUsage); mSA.setUsage(THREE.DynamicDrawUsage);
  rgeo.setAttribute('aPos', mPosA);
  rgeo.setAttribute('aS', mSA);
  rgeo.instanceCount = NSYS;
  const RU = {
    uPan: TU.uPan, uDom: TU.uDom, uAspect: TU.uAspect, uPulse: { value: 0 },
    uRingCol: { value: new THREE.Color(0.94, 0.92, 0.84) }, uIntensity: TU.uIntensity, uWeight: TU.uWeight,
  };
  const ringMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, uniforms: RU, vertexShader: RING_VERT, fragmentShader: RING_FRAG,
    transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
  ringMat.name = 'tomb-currents-rings';
  const rings = new THREE.Mesh(rgeo, ringMat);
  rings.frustumCulled = false;
  rings.renderOrder = 3;

  // --- the sea behind
  const BU = { uBg: { value: new THREE.Color(0.05, 0.08, 0.1) }, uIntensity: TU.uIntensity, uWeight: TU.uWeight, uTime: { value: 0 }, uRes: TU.uRes, uWarm: { value: 1 } };
  const bgMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, uniforms: BU, vertexShader: BG_VERT, fragmentShader: BG_FRAG,
    transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  bgMat.name = 'tomb-currents-sea';
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
  bg.frustumCulled = false;
  bg.renderOrder = 1;

  // --- the particles and the systems
  const xs = new Float32Array(N), ys = new Float32Array(N), ages = new Float32Array(N), lifes = new Float32Array(N);
  const sX = new Float32Array(NSYS), sY = new Float32Array(NSYS), sSpin = new Float32Array(NSYS), sR = new Float32Array(NSYS), sStr = new Float32Array(NSYS);
  const sBaseR = new Float32Array(NSYS), sBaseS = new Float32Array(NSYS);
  const sTX = new Float32Array(NSYS), sTY = new Float32Array(NSYS), sTSpin = new Float32Array(NSYS), sTR = new Float32Array(NSYS), sTS = new Float32Array(NSYS);
  const sJX = new Float32Array(NSYS), sJY = new Float32Array(NSYS);
  const phX = new Float32Array(NSYS), phY = new Float32Array(NSYS), phS = new Float32Array(NSYS), phR = new Float32Array(NSYS);
  const dX = new Float32Array(NSYS), dY = new Float32Array(NSYS);
  let flowSpeed = 2.9, fieldGain = 0.43, bgU = 0.07, bgV = 0.02, wander = 0.026, wanderK = 1;
  let head = 0, step = 0, acc = 0, sysInit = false;
  let pan0 = 0, pan1 = 0, gainS = 1, radK = 1, shown = true, spHash = -1, level = 0;

  function spawn(i, st) {
    const x = Math.random() * domW, y = Math.random() * domH;
    xs[i] = x; ys[i] = y;
    ages[i] = Math.random() * LIFE_MAX;
    lifes[i] = LIFE_MIN + Math.random() * (LIFE_MAX - LIFE_MIN);
    const o = i * 4;
    info[o] = 0; info[o + 1] = st; info[o + 2] = Math.random(); info[o + 3] = 1;
  }
  // write a particle's position into the ring slot k
  function put(i, k, x, y) {
    if (k < 8) { const a = R[k >> 1], o = i * 4 + (k & 1) * 2; a[o] = x; a[o + 1] = y; }
    else { r4[i * 2] = x; r4[i * 2 + 1] = y; }
  }
  for (let i = 0; i < N; i++) { spawn(i, 0); for (let k = 0; k < RING; k++) put(i, k, xs[i], ys[i]); }

  function species(h) {
    for (let k = 0; k < NSYS; k++) {
      sJX[k] = (hash1(h * 31.7 + k * 1.3) - 0.5) * 0.14;
      sJY[k] = (hash1(h * 17.1 + k * 2.9) - 0.5) * 0.14;
      phX[k] = hash1(h * 5.3 + k) * 6.2832; phY[k] = hash1(h * 7.7 + k) * 6.2832;
      phS[k] = hash1(h * 9.1 + k) * 6.2832; phR[k] = hash1(h * 11.3 + k) * 6.2832;
    }
    wanderK = 0.7 + 0.9 * hash1(h * 3.3);
  }
  // the regime at a level: the pen's tables interpolated
  function regime(L) {
    const u = clamp(L, 0, 1) * (MODES.length - 1);
    const m0 = Math.min(MODES.length - 2, Math.floor(u)), m1 = m0 + 1, f = u - m0;
    const A = MODES[m0], B = MODES[m1];
    const lerp = (j) => A[j] + (B[j] - A[j]) * f;
    flowSpeed = lerp(0); fieldGain = lerp(1); bgU = lerp(2); bgV = lerp(3); wander = lerp(4);
    for (let k = 0; k < NSYS; k++) {
      const j = 5 + k * 5;
      sTX[k] = clamp(lerp(j) + sJX[k], 0.08, 0.92); sTY[k] = clamp(lerp(j + 1) + sJY[k], 0.1, 0.9);
      sTSpin[k] = lerp(j + 2); sTR[k] = lerp(j + 3); sTS[k] = lerp(j + 4);
    }
  }
  function stepSystems(dt, t) {
    const ease = Math.min(1, dt * 0.32);
    for (let k = 0; k < NSYS; k++) {
      const wobX = Math.sin(t * 0.071 + phX[k]) * wander * wanderK * (1 + 1.5 * gainS);
      const wobY = Math.cos(t * 0.064 + phY[k]) * wander * wanderK * (1 + 1.5 * gainS);
      const tx = clamp(sTX[k] + wobX, 0.08, 0.92), ty = clamp(sTY[k] + wobY, 0.1, 0.9);
      if (!sysInit) { sX[k] = tx; sY[k] = ty; sBaseR[k] = sTR[k]; sBaseS[k] = sTS[k]; sSpin[k] = sTSpin[k]; dX[k] = tx; dY[k] = ty; }
      sX[k] += (tx - sX[k]) * ease;
      sY[k] += (ty - sY[k]) * ease;
      sSpin[k] += (sTSpin[k] - sSpin[k]) * Math.min(1, dt * 2.5);
      sBaseS[k] += (sTS[k] - sBaseS[k]) * ease;
      sBaseR[k] += (sTR[k] - sBaseR[k]) * ease;
      sStr[k] = sBaseS[k] * (1 + Math.sin(t * 0.045 + phS[k]) * SYSTEM_EVOLUTION);
      sR[k] = sBaseR[k] * (1 + Math.cos(t * 0.038 + phR[k]) * SYSTEM_EVOLUTION * 0.7) * radK;
      dX[k] += (sX[k] - dX[k]) * 0.12;
      dY[k] += (sY[k] - dY[k]) * 0.12;
    }
    sysInit = true;
  }
  let fu = 0, fv = 0;
  function field(x, y, gain) {
    let u = bgU, v = bgV;
    for (let k = 0; k < NSYS; k++) {
      const cx = sX[k] * domW, cy = sY[k] * domH;
      const rx = x - cx, ry = y - cy;
      const d2 = rx * rx + ry * ry + 0.0001;
      const d = Math.sqrt(d2);
      const invD = 1 / d;
      const r = sR[k] * domH;
      const mag = sStr[k] * (d / r) * Math.exp(-d2 / (2 * r * r)) * gain;
      const spin = sSpin[k];
      u += spin * mag * (-ry * invD);
      v += spin * mag * (rx * invD);
      const radial = -spin * INFLOW * mag;
      u += rx * invD * radial;
      v += ry * invD * radial;
    }
    fu = u; fv = v;
  }
  function simulate(dt, speed, gain) {
    step++;
    head = (head + 1) % RING;
    for (let i = 0; i < N; i++) {
      const x = xs[i], y = ys[i];
      field(x, y, gain);
      const nx = x + fu * dt * speed, ny = y + fv * dt * speed;
      ages[i] += dt;
      if (ages[i] > lifes[i] || nx < 0 || nx > domW || ny < 0 || ny > domH) {
        spawn(i, step);
        put(i, head, xs[i], ys[i]);
        continue;
      }
      xs[i] = nx; ys[i] = ny;
      put(i, head, nx, ny);
      info[i * 4] = fu * fu + fv * fv;
    }
    if (head < 8) RA[head >> 1].needsUpdate = true; else r4A.needsUpdate = true;
    infoA.needsUpdate = true;
    TU.uHead.value = head;
    TU.uStep.value = step;
  }
  const white = { r: 1, g: 1, b: 1 };

  return {
    objects: [bg, trails, rings],
    update(S, io) {
      BU.uWarm.value = S.warm ? 1 : 0;
      if (S.weight <= 0.002 && !S.warm) {
        if (shown) { bg.visible = false; trails.visible = false; rings.visible = false; shown = false; }
        return;
      }
      shown = true;
      bg.visible = true; trails.visible = true; rings.visible = true;
      const dt = S.dt, t = S.t;
      if (spHash !== S.speciesHash) { spHash = S.speciesHash; species(spHash); }
      level = approach(level, S.level, 0.3, dt);
      regime(level);
      gainS = approach(gainS, S.sway, 0.4, dt);
      radK = approach(radK, 1 - 0.5 * S.press, 0.2, dt);
      pan0 = approach(pan0, (S.hx - 0.5) * 0.5, 0.3, dt);
      pan1 = approach(pan1, (S.hy - 0.5) * 0.34, 0.3, dt);
      stepSystems(dt, t);
      // the pen's 30 Hz step; a frame that ran long steps at most twice
      acc += dt;
      let n = 0;
      while (acc >= 1 / STEP_HZ && n < 2) {
        acc -= 1 / STEP_HZ;
        simulate(1 / STEP_HZ, flowSpeed * (1 + 0.35 * S.bass), fieldGain * (1 + 0.9 * gainS));
        n++;
      }
      if (acc > 2 / STEP_HZ) acc = 0;
      // the markers
      for (let k = 0; k < NSYS; k++) {
        mPos[k * 2] = dX[k] * domW; mPos[k * 2 + 1] = dY[k] * domH;
        const o = k * 4;
        mS[o] = sR[k] * domH; mS[o + 1] = sStr[k]; mS[o + 2] = sSpin[k] >= 0 ? 1 : -1;
        mS[o + 3] = clamp(0.34 + sStr[k] * 0.24, 0.42, 0.64) * Math.min(1, Math.abs(sSpin[k]) * 2 + 0.3);
      }
      mPosA.needsUpdate = true; mSA.needsUpdate = true;
      // colour: the ramp cool -> warm, lifted a little; the sea the darkest stop
      const pl = io.palette, ord = S.order;
      for (let i = 0; i < 5; i++) {
        const c = pl[ord[i]];
        const lift = 0.18 + 0.12 * (i / 4);
        rampU[i * 3] = c.r + (white.r - c.r) * lift;
        rampU[i * 3 + 1] = c.g + (white.g - c.g) * lift;
        rampU[i * 3 + 2] = c.b + (white.b - c.b) * lift;
      }
      let di = 0, dl = 9;
      for (let i = 0; i < 5; i++) { const c = pl[i]; const l = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b; if (l < dl) { dl = l; di = i; } }
      const dc = pl[di];
      const ds = 0.11 / Math.max(dl, 0.02);
      BU.uBg.value.setRGB(Math.min(dc.r * ds, 0.3), Math.min(dc.g * ds, 0.3), Math.min(dc.b * ds, 0.3));
      RU.uRingCol.value.copy(pl[ord[4]]).lerp(white, 0.7);
      RU.uPulse.value = S.pulse;
      BU.uTime.value = t;
      TU.uPan.value.set(pan0, pan1);
      TU.uIntensity.value = io.intensity * S.openDim * Math.max(S.openS, 0.12);
      TU.uWeight.value = S.warm ? 0 : S.weight;
    },
    resize(w, h) {
      aspect = w / Math.max(1, h);
      domW = MARGIN * aspect; domH = MARGIN;
      TU.uRes.value.set(w, h);
      TU.uDom.value.set(domW, domH);
      TU.uAspect.value = aspect;
      for (let i = 0; i < N; i++) if (xs[i] > domW) { spawn(i, step); put(i, head, xs[i], ys[i]); }
    },
    dispose() {
      geo.dispose(); trailMat.dispose();
      rgeo.dispose(); ringMat.dispose();
      bg.geometry.dispose(); bgMat.dispose();
    },
  };
}
