// Nature's Tomb, THE DAY: a port of Luis Alberto Martinez Riancho's
// (lessrain) CodePen "WebGL Scroll Sync V3" (MIT, notice below). A
// scene-private module of Nature's Tomb (never registered, no meta); the
// factory builds one GLSL3 quad and returns it with an update the Tomb drives.
//
// The pen: a raymarched ocean in a fragment shader, a heightfield of seven
// sines on three swell directions plus a micro noise, marched (22 steps) and
// refined by bisection (5), shaded with a fresnel reflection of the sky, a
// sun specular and a sun line, sparkle, foam from the curvature, fog; a sky
// with a sun on an arc, a moon, stars, a cloud band, a horizon mist, grain,
// through five phases DAWN / MIDDAY / DUSK / NIGHT / STORM, the scroll 0 to 1
// picking the phase pair (uSc) and the blend (uBl) for every stop table
// (sky top, sky horizon, sun, sea deep, sea shallow, fog; wave amplitude, fog
// density, moon amount), with the camera height, z and pitch following the
// scroll.
//
// Here:
//   TIME OF DAY   the Tomb's development level is the pen's scroll: 0 DAWN
//               -> 1 STORM through the same stop tables; a pad steps it a
//               phase.
//   CAMERA      the pen's camY / camZ / pitch follow the level as in the pen;
//               the hand's X YAWS the look and Y sets the height; PRESS
//               squeezes the camera down to the water. The only camera motion
//               is the performer's.
//   SWAY        the storm amount and the wave amplitude.
//   SPECIES     the swell directions and the cloud band, seeded.
//   AUDIO       bass lifts the waves a little, the beat flashes the foam.
//   PALETTE     the pen's stop tables keep their STRUCTURE, which stop is
//               warm, which cool, how light each is, but are tinted from
//               io.palette: the palette is sorted by warmth (as wormholept1
//               does) and each pen colour is re-drawn as the palette entry at
//               its own warmth rank, at the pen colour's luminance and
//               saturation. The sun and the horizon warmth therefore take the
//               palette's warmest stops, the sea deep its coolest.
//   NOTE        the storm's swell rotation (rot(storm · 0.18)) is a change of
//               wave DIRECTION with the phase (not a spin) and is kept.
//
// Upstream: https://codepen.io/luis-lessrain/pen/LERxVqv
// The MIT License (MIT), Copyright (c) 2026 Luis Alberto Martinez Riancho
// (https://codepen.io/luis-lessrain/pen/LERxVqv). Permission is hereby
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
//   - GLSL3 (in/out, fragColor, no gl_FragColor) on a three.js quad; the
//     pen's scroll, wheel, HUD, theme and quality-scaling plumbing are not
//     used, the scroll is the Tomb's development level.
//   - MARCH_STEPS / REFINE_STEPS by quality tier (the pen's 22 / 5 at med).
//   - The six colour stop tables are uniforms, tinted from io.palette on the
//     CPU every frame (structure kept, see PALETTE above); the moon, star and
//     cloud colours likewise.
//   - The camera takes the hand (yaw, height) and press (down to the water)
//     on top of the pen's scroll-driven path; sway adds storm and amplitude;
//     bass and the beat breathe the water.
//   - The pen's clamp(col, 0, 1) is dropped, the compositor owns tone; the
//     pen's scroll smoother is not applied to the level (the pad's fifths
//     land on the five phases).

const FRAG = /* glsl */ `
  uniform vec2 uRes;
  uniform float uTime, uS, uIntensity, uWeight, uOpen;
  uniform vec4 uCam;     // yaw, height add, pitch add, squeeze to the water
  uniform vec4 uWave;    // amplitude multiplier, storm add, foam flash, bass
  uniform vec4 uSwell;   // swell 2 angle, swell 3 angle, cloud offset, cloud amount
  uniform vec3 uStops[30];   // six tables x five phases: skyTop, skyHori, sun, seaDeep, seaShlo, fog
  uniform vec3 uMoon, uStar, uCloudA, uCloudB;
  in vec2 vUv;
  out vec4 fragColor;

  #define PI 3.14159265359
  #define TAU 6.28318530718

  float sat(float x) { return clamp(x, 0.0, 1.0); }
  float smoother(float x) { x = sat(x); return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }

  // the phase pair and the blend, from the level (the pen's uSc / uBl)
  int gSi = 0;
  float gBl = 0.0;
  vec3 sCol(int table) {
    return mix(uStops[table * 5 + gSi], uStops[table * 5 + gSi + 1], gBl);
  }
  float sF(float c0, float c1, float c2, float c3, float c4) {
    float a = c0, b = c1;
    if (gSi == 1) { a = c1; b = c2; }
    else if (gSi == 2) { a = c2; b = c3; }
    else if (gSi == 3) { a = c3; b = c4; }
    return mix(a, b, gBl);
  }
  mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  float waveH(vec2 p, float t, float amp, float storm) {
    float h = 0.0;
    vec2 swell1 = normalize(vec2(1.0, 0.28));
    vec2 swell2 = vec2(cos(uSwell.x), sin(uSwell.x));
    vec2 swell3 = vec2(cos(uSwell.y), sin(uSwell.y));
    // the storm turns the swells a little: a change of wave direction with the phase
    swell2 = rot(storm * 0.18) * swell2;
    swell3 = rot(-storm * 0.14) * swell3;
    float d1 = dot(p, swell1), d2 = dot(p, swell2), d3 = dot(p, swell3);
    h += amp * 0.66 * sin(d1 * 0.42 + t * 0.38);
    h += amp * 0.22 * sin(d1 * 0.94 - t * 0.62);
    h += amp * 0.14 * sin(d2 * 1.18 - t * 0.82);
    h += amp * 0.09 * sin(d3 * 1.82 + t * 1.04);
    h += amp * (0.11 + storm * 0.07) * sin(p.x * 1.45 - t * 0.76 + p.y * 0.66);
    h += amp * (0.07 + storm * 0.05) * sin(p.x * 2.85 + t * 1.06 - p.y * 0.52);
    h += amp * (0.04 + storm * 0.03) * sin(p.x * 4.60 - t * 1.50 + p.y * 1.02);
    float micro = noise(p * 14.0 + vec2(t * 0.18, t * 0.06)) - 0.5;
    h += micro * amp * (0.010 + storm * 0.008);
    return h;
  }
  vec3 waveNorm(vec2 p, float t, float amp, float storm) {
    float e = 0.018;
    float hL = waveH(p - vec2(e, 0.0), t, amp, storm);
    float hR = waveH(p + vec2(e, 0.0), t, amp, storm);
    float hD = waveH(p - vec2(0.0, e), t, amp, storm);
    float hU = waveH(p + vec2(0.0, e), t, amp, storm);
    return normalize(vec3(-(hR - hL) / (2.0 * e), 1.0, -(hU - hD) / (2.0 * e)));
  }
  float starField(vec2 uv) {
    vec2 gv = floor(uv);
    vec2 lv = fract(uv) - 0.5;
    float h = hash(gv);
    float size = mix(0.012, 0.0025, h);
    float d = length(lv + vec2(hash(gv + 3.1) - 0.5, hash(gv + 7.3) - 0.5) * 0.25);
    float star = smoothstep(size, 0.0, d);
    star *= smoothstep(0.82, 1.0, h);
    return star;
  }

  void main() {
    vec2 uv = (vUv * uRes - uRes * 0.5) / uRes.y;
    // the level is the pen's scroll AFTER its smoother (the pen eased the
    // scroll for feel; here the knob and the pad's fifths land on the phases:
    // 0 DAWN, .25 MIDDAY, .5 DUSK, .75 NIGHT, 1 STORM)
    float s = clamp(uS, 0.0, 1.0);
    float raw = s * 4.0;
    gSi = int(min(floor(raw), 3.0));
    gBl = raw - float(gSi);

    // the pen's camera path on the level, the hand's height and yaw, press
    // down to the water
    float camY = mix(1.14, 1.03, s);
    camY += sin(s * PI * 1.4) * 0.028;
    camY += uCam.y;
    float camZ = mix(0.08, -0.18, s);
    float pitch = mix(0.115, 0.088, s) + uCam.z;
    float storm = max(smoothstep(0.80, 1.0, s), uWave.y);
    float waveAmp = sF(0.082, 0.070, 0.100, 0.054, 0.30);
    waveAmp += storm * 0.020;
    waveAmp *= uWave.x;
    camY = mix(camY, waveAmp * 1.9 + 0.10, uCam.w);
    pitch = mix(pitch, 0.02, uCam.w * 0.7);
    vec3 ro = vec3(0.0, camY, camZ);
    vec3 rd = normalize(vec3(uv.x, uv.y - pitch, -1.4));
    rd.xz = rot(uCam.x) * rd.xz;

    float night = smoothstep(0.56, 0.84, s);
    vec3 skyTop = sCol(0), skyHori = sCol(1), sunCol = sCol(2), seaDeep = sCol(3), seaShlo = sCol(4), fogCol = sCol(5);

    float sunProgress = clamp(s / 0.58, 0.0, 1.0);
    float sunAngle = sunProgress * PI;
    float sunArcX = cos(sunAngle) * -0.75;
    float sunArcY = sin(sunAngle) * 0.38 - 0.08;
    vec3 sunDir = normalize(vec3(sunArcX, sunArcY, -1.0));
    vec3 moonDir = normalize(vec3(-0.14, 0.42, -1.0));

    float fogDen = sF(0.020, 0.010, 0.022, 0.034, 0.046);
    float moonAmt = sF(0.0, 0.0, 0.05, 0.92, 0.06);
    float sunAbove = step(0.0, sunDir.y);
    float sunGlow = smoothstep(-0.10, 0.06, sunDir.y);

    vec3 col;
    if (rd.y < 0.0) {
      float tFlat = ro.y / (-rd.y);
      float stepSize = tFlat / float(MARCH_STEPS);
      float t = stepSize;
      for (int i = 0; i < MARCH_STEPS; i++) {
        vec2 wpTest = ro.xz + rd.xz * t;
        float wy = ro.y + rd.y * t;
        if (wy < waveH(wpTest, uTime, waveAmp, storm)) break;
        t += stepSize;
      }
      float ta = t - stepSize, tb = t;
      for (int i = 0; i < REFINE_STEPS; i++) {
        float tm = (ta + tb) * 0.5;
        vec2 wpm = ro.xz + rd.xz * tm;
        if (ro.y + rd.y * tm < waveH(wpm, uTime, waveAmp, storm)) tb = tm;
        else ta = tm;
      }
      t = (ta + tb) * 0.5;
      vec2 wp = ro.xz + rd.xz * t;
      vec3 n = waveNorm(wp, uTime, waveAmp, storm);
      vec3 vDir = -rd;
      float fres = pow(1.0 - clamp(dot(n, vDir), 0.0, 1.0), 4.0);
      vec3 refl = reflect(rd, n);
      float rh = clamp(refl.y, 0.0, 1.0);
      vec3 reflSky = mix(skyHori, skyTop, pow(rh, 0.42));
      reflSky = mix(reflSky, skyHori, 0.12);
      float rSun = max(dot(refl, sunDir), 0.0);
      reflSky += sunCol * pow(rSun, 120.0) * 2.0 * sunGlow;
      reflSky += sunCol * pow(rSun, 18.0) * 0.07 * sunGlow;
      if (moonAmt > 0.04) {
        float rMoon = max(dot(refl, moonDir), 0.0);
        reflSky += uMoon * pow(rMoon, 120.0) * 0.78 * moonAmt;
      }
      float depth = exp(-t * 0.40);
      vec3 waterC = mix(seaDeep, seaShlo, depth * 0.5);
      vec3 absorb = vec3(0.85, 0.92, 1.0);
      waterC *= mix(vec3(1.0), absorb, clamp(t * 0.25, 0.0, 1.0));
      col = mix(waterC, reflSky, 0.15 + fres * 0.34);
      float spec = pow(max(dot(reflect(-sunDir, n), vDir), 0.0), 200.0);
      col += sunCol * spec * 1.10 * sunAbove;
      float broadSpec = pow(max(dot(reflect(-sunDir, n), vDir), 0.0), 32.0);
      col += sunCol * broadSpec * 0.12 * sunGlow;
      float sunLine = pow(max(dot(reflect(rd, n), sunDir), 0.0), 8.0);
      col += sunCol * sunLine * 0.48 * smoothstep(0.0, 0.35, -rd.y) * sunGlow;
      float sparkle = noise(wp * 18.0 + vec2(uTime * 0.55, uTime * 0.22));
      sparkle = smoothstep(0.94, 1.0, sparkle);
      col += sunCol * sparkle * 0.08 * sunGlow * sunAbove;
      if (moonAmt > 0.04) {
        float mSpec = pow(max(dot(reflect(-moonDir, n), vDir), 0.0), 520.0);
        col += uMoon * mSpec * 0.09 * moonAmt;
      }
      float hC = waveH(wp, uTime, waveAmp, storm);
      float hL = waveH(wp - vec2(0.025, 0.0), uTime, waveAmp, storm);
      float hR = waveH(wp + vec2(0.025, 0.0), uTime, waveAmp, storm);
      float hD = waveH(wp - vec2(0.0, 0.025), uTime, waveAmp, storm);
      float hU = waveH(wp + vec2(0.0, 0.025), uTime, waveAmp, storm);
      float curvature = hR + hL + hU + hD - 4.0 * hC;
      float foam = clamp(curvature * (24.0 + storm * 10.0), 0.0, 1.0);
      col += foam * vec3(1.0) * (0.03 + storm * 0.10 + uWave.z * 0.08);
      float fog = 1.0 - exp(-t * fogDen * 1.65);
      col = mix(col, fogCol, fog);
    } else {
      float h = clamp(rd.y, 0.0, 1.0);
      col = mix(skyHori, skyTop, pow(h, 0.38));
    }

    float horizonW = 0.008;
    float skyMix = smoothstep(-horizonW, horizonW, rd.y);
    vec3 skyCol;
    {
      float h = clamp(rd.y, 0.0, 1.0);
      skyCol = mix(skyHori, skyTop, pow(h, 0.38));
      float cloudBand = noise(rd.x * 5.5 + vec2(rd.y * 3.0 + uSwell.z, uTime * 0.015));
      float cloudBand2 = noise(rd.x * 8.0 - vec2(rd.y * 4.0, uTime * 0.010) + uSwell.z);
      float clouds = smoothstep(0.62, 0.86, cloudBand * 0.65 + cloudBand2 * 0.35);
      clouds *= smoothstep(-0.02, 0.24, rd.y);
      clouds *= (0.08 + storm * 0.18) * uSwell.w;
      vec3 cloudCol = mix(uCloudA, uCloudB, storm);
      skyCol = mix(skyCol, mix(skyCol * 0.97, cloudCol, 0.35), clouds);
      float sd = max(dot(rd, sunDir), 0.0);
      skyCol += sunCol * pow(sd, 380.0) * 6.8 * sunGlow;
      skyCol += sunCol * pow(sd, 22.0) * 0.20 * sunGlow;
      skyCol += sunCol * pow(sd, 5.0) * 0.09 * sunGlow;
      float sunDisk = smoothstep(0.99925, 0.99995, dot(rd, sunDir));
      skyCol += sunCol * sunDisk * 2.6 * sunGlow;
      float horizonBand = exp(-abs(rd.y) * 24.0);
      skyCol += sunCol * horizonBand * 0.11 * sunGlow;
      float viewSun = max(dot(rd, sunDir), 0.0);
      skyCol += sunCol * pow(viewSun, 3.0) * 0.035 * sunGlow;
      if (moonAmt > 0.04) {
        float md = max(dot(rd, moonDir), 0.0);
        skyCol += uMoon * pow(md, 820.0) * 7.4 * moonAmt;
        skyCol += uMoon * pow(md, 6.0) * 0.045 * moonAmt;
      }
      if (night > 0.02) {
        vec2 starUv = rd.xy / max(0.12, rd.z + 1.6);
        starUv *= 140.0;
        float stars = starField(starUv) + starField(starUv * 0.55 + 11.7) * 0.65;
        stars *= smoothstep(0.02, 0.26, rd.y);
        stars *= (1.0 - storm * 0.85);
        skyCol += uStar * stars * night * 0.82;
      }
      float horizonMist = exp(-abs(rd.y) * mix(38.0, 22.0, storm));
      skyCol += fogCol * horizonMist * (0.09 + storm * 0.10);
      skyCol = mix(skyCol, skyCol * vec3(0.91, 0.94, 0.98), storm * 0.22);
    }
    col = mix(col, skyCol, skyMix);
    float hEdge = smoothstep(-0.008, 0.018, rd.y);
    col = mix(fogCol, col, hEdge * 0.25 + 0.75);
    float grain = hash(gl_FragCoord.xy * 0.5 + floor(uTime * 12.0)) - 0.5;
    col += grain * 0.006;
    fragColor = vec4(col * uOpen * uIntensity * uWeight, 1.0);
  }
`;

const VERT = /* glsl */ `
  uniform float uWarm;
  out vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = uWarm > 0.5 ? vec4(position.xy * 0.002 - 0.998, 0.0, 1.0) : vec4(position.xy, 0.0, 1.0);
  }`;

// the pen's stop tables, in its order: skyTop, skyHori, sunCol, seaDeep,
// seaShlo, fogCol, each DAWN, MIDDAY, DUSK, NIGHT, STORM
const PEN_STOPS = new Float32Array([
  0.18, 0.06, 0.24, 0.05, 0.24, 0.68, 0.26, 0.06, 0.04, 0.01, 0.01, 0.05, 0.04, 0.05, 0.09,
  0.92, 0.48, 0.18, 0.42, 0.62, 0.90, 0.88, 0.32, 0.04, 0.03, 0.05, 0.14, 0.15, 0.17, 0.23,
  1.0, 0.62, 0.22, 1.0, 0.96, 0.80, 1.0, 0.38, 0.05, 0.70, 0.75, 0.94, 0.26, 0.28, 0.34,
  0.08, 0.05, 0.12, 0.03, 0.14, 0.34, 0.10, 0.06, 0.04, 0.00, 0.01, 0.03, 0.03, 0.04, 0.07,
  0.28, 0.17, 0.24, 0.09, 0.38, 0.60, 0.24, 0.13, 0.06, 0.04, 0.06, 0.16, 0.07, 0.10, 0.14,
  0.80, 0.50, 0.30, 0.58, 0.72, 0.90, 0.70, 0.28, 0.05, 0.02, 0.03, 0.08, 0.12, 0.14, 0.18,
]);
// and the pen's fixed colours: the moon, the stars, the clouds (clear / storm)
const PEN_FIXED = new Float32Array([0.72, 0.80, 0.95, 0.80, 0.88, 1.0, 1.0, 0.82, 0.65, 0.42, 0.48, 0.56]);

// S is the Tomb's per-frame plate state: { dt, t, weight, level, sway, press,
// hx, hy, openS, openDim, speciesHash, warm, bass, pulse }; S.order is the
// palette sorted cool -> warm (indices into io.palette).
export function createSea(THREE, ctx) {
  const tier = ctx.quality.tier;
  const MARCH_STEPS = tier === 'low' ? 16 : tier === 'high' ? 30 : 22;
  const REFINE_STEPS = tier === 'low' ? 4 : tier === 'high' ? 6 : 5;
  const stops = new Float32Array(90);
  const U = {
    uRes: { value: new THREE.Vector2(ctx.width, ctx.height) },
    uTime: { value: 0 },
    uS: { value: 0 },
    uIntensity: { value: 1 },
    uWeight: { value: 0 },
    uOpen: { value: 0 },
    uWarm: { value: 1 },
    uCam: { value: new THREE.Vector4(0, 0, 0, 0) },
    uWave: { value: new THREE.Vector4(1, 0, 0, 0) },
    uSwell: { value: new THREE.Vector4(2.07, -0.19, 0, 1) },
    uStops: { value: stops },
    uMoon: { value: new THREE.Color(0.72, 0.80, 0.95) },
    uStar: { value: new THREE.Color(0.80, 0.88, 1.0) },
    uCloudA: { value: new THREE.Color(1.0, 0.82, 0.65) },
    uCloudB: { value: new THREE.Color(0.42, 0.48, 0.56) },
  };
  const mat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: U,
    defines: { MARCH_STEPS, REFINE_STEPS },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  mat.name = 'tomb-sea';
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  quad.frustumCulled = false;
  quad.renderOrder = 1;

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const approach = (v, to, tau, dt) => v + (to - v) * (1 - Math.exp(-dt / tau));
  const lum3 = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
  // a pen colour re-drawn from the palette: the entry at the pen colour's
  // warmth rank (the palette sorted cool -> warm, interpolated), scaled to the
  // pen colour's luminance, pulled toward grey by the pen colour's own
  // saturation so a near-grey stop stays near grey
  const tmp = new THREE.Color();
  function tint(pr, pg, pb, pl, order, out, o) {
    const L = lum3(pr, pg, pb);
    const mx = Math.max(pr, pg, pb), mn = Math.min(pr, pg, pb);
    const satP = mx > 1e-3 ? (mx - mn) / mx : 0;
    const warm = clamp((pr - pb) * 0.8 + 0.5, 0, 1) * 3.999;
    const i0 = Math.floor(warm), i1 = Math.min(4, i0 + 1), f = warm - i0;
    const ca = pl[order[i0]], cb = pl[order[i1]];
    tmp.setRGB(ca.r + (cb.r - ca.r) * f, ca.g + (cb.g - ca.g) * f, ca.b + (cb.b - ca.b) * f);
    const k = L / Math.max(lum3(tmp.r, tmp.g, tmp.b), 0.02);
    const sp = Math.pow(satP, 0.7);
    out[o] = L + (tmp.r * k - L) * sp;
    out[o + 1] = L + (tmp.g * k - L) * sp;
    out[o + 2] = L + (tmp.b * k - L) * sp;
  }
  const fixed = new Float32Array(12);
  let yaw = 0, hAdd = 0, sq = 0, stormS = 0, ampS = 1, level = 0, foam = 0, shown = true, spHash = -1;

  return {
    objects: [quad],
    update(S, io) {
      U.uWarm.value = S.warm ? 1 : 0;
      if (S.weight <= 0.002 && !S.warm) {
        if (shown) { quad.visible = false; shown = false; }
        return;
      }
      shown = true;
      quad.visible = true;
      const dt = S.dt;
      level = approach(level, S.level, 0.25, dt);
      yaw = approach(yaw, (S.hx - 0.5) * 1.1, 0.3, dt);
      hAdd = approach(hAdd, (S.hy - 0.5) * 0.5, 0.3, dt);
      sq = approach(sq, S.press, 0.15, dt);
      stormS = approach(stormS, S.sway * 0.75, 0.4, dt);
      ampS = approach(ampS, 1 + S.sway * 0.9 + S.bass * 0.2, 0.3, dt);
      foam = Math.max(foam * Math.exp(-dt * 3), S.pulse);
      // the species: the swell directions and the cloud band
      if (spHash !== S.speciesHash) {
        spHash = S.speciesHash;
        const h = spHash;
        U.uSwell.value.set(2.07 + (h - 0.5) * 1.6, -0.19 + (h * 7.3 % 1 - 0.5) * 1.4, h * 23.1, 0.6 + 0.9 * (h * 3.7 % 1));
      }
      // the stop tables, tinted from the palette sorted cool -> warm
      const pl = io.palette, o = S.order;
      for (let i = 0; i < 30; i++) tint(PEN_STOPS[i * 3], PEN_STOPS[i * 3 + 1], PEN_STOPS[i * 3 + 2], pl, o, stops, i * 3);
      for (let i = 0; i < 4; i++) tint(PEN_FIXED[i * 3], PEN_FIXED[i * 3 + 1], PEN_FIXED[i * 3 + 2], pl, o, fixed, i * 3);
      U.uMoon.value.setRGB(fixed[0], fixed[1], fixed[2]);
      U.uStar.value.setRGB(fixed[3], fixed[4], fixed[5]);
      U.uCloudA.value.setRGB(fixed[6], fixed[7], fixed[8]);
      U.uCloudB.value.setRGB(fixed[9], fixed[10], fixed[11]);
      U.uTime.value = S.t;
      U.uS.value = level;
      U.uCam.value.set(yaw, hAdd, 0, sq);
      U.uWave.value.set(ampS, stormS, foam, S.bass);
      U.uIntensity.value = io.intensity * S.openDim;
      U.uWeight.value = S.warm ? 0 : S.weight;
      U.uOpen.value = Math.max(S.openS, 0.12);
    },
    resize(w, h) { U.uRes.value.set(w, h); },
    dispose() { quad.geometry.dispose(); mat.dispose(); },
  };
}
