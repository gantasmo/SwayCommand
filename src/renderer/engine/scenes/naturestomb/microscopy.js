// Nature's Tomb, MICROSCOPY: a port of Matthias Hurrle's (@atzedent)
// CodePen "Microscopy" (MIT, notice below). A scene-private module of
// Nature's Tomb (never registered, no meta); the factory builds one GLSL3 quad
// and returns it with an update the Tomb drives.
//
// The pen: stacked layers of Worley noise, a two-octave fbm of the F1
// distance to cell points that drift on a sine (p = .5 + .5·sin(t + 6.3·p))
//, domain-warped by two more Worley samples, lit as a heightfield with a
// normal whose z term breathes on sin(sin(T)), which is what makes it read as
// the lens focus being adjusted; a deep colour under a bright one by height
// thresholds, a specular, tanh tone, a vignette.
//
// Here:
//   FOCUS       the Tomb's development level IS the focus pull: out of focus
//               -> focused -> through focus. The pen's sin(sin(T)) normal term
//               is driven by the level instead of the clock (the relief's
//               contrast is what sharpens and softens), and the two Worley
//               layers take the focus with their DEPTH, the coarse layer is
//               sharp before focus, both at focus, the fine layer past it.
//               Nothing animates itself but the slow Worley drift, which is
//               the cells' own flow. When the organism knob dissolves the
//               plate in or out, the dissolve runs THROUGH a short focus
//               pull (defocus -> refocus), so every change of plate reads as
//               the microscope being refocused, one uniform, no cost.
//   SWAY        magnification (the uv scale).
//   PRESS       aperture: the pen's vignette (the scene applies none at rest
//              , the compositor owns tone) and a contrast lift.
//   HAND        pans the slide.
//   PALETTE     the pen's vec3(.05,.1,.2) and vec3(.1,.7,.8) become the
//               palette's two coolest stops at the pen's luminances; the
//               specular is the warmest stop lifted to white.
//
// Upstream: https://codepen.io/atzedent/pen/NPbMpWQ
// The MIT License (MIT), Copyright (c) 2026 Matthias Hurrle
// (https://codepen.io/atzedent/pen/NPbMpWQ). Permission is hereby granted,
// free of charge, to any person obtaining a copy of this software and
// associated documentation files (the "Software"), to deal in the Software
// without restriction, including without limitation the rights to use, copy,
// modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions: The above copyright notice and this
// permission notice shall be included in all copies or substantial portions
// of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
// KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// CHANGES FROM THE ORIGINAL
//   - GLSL3 (in/out, fragColor) on a three.js quad; the pen's editor plumbing
//     (script.js) is not used.
//   - The Worley F1 is taken over the 3 × 3 neighbourhood instead of the
//     pen's 5 × 5: every cell point lies inside its own cell and the pen caps
//     the distance at .25, so the nearest point is always in the 3 × 3 and
//     the result is identical at a third of the cost.
//   - The pen's fbm turned its domain by cos(T·.01) per octave, a slow
//     rotation of the whole pattern; that turn is a CONSTANT here (the
//     scene contract: nothing rotates by itself). The cell drift stays.
//   - The focus (the normal's z term) follows the development level, not
//     the clock, and the layer weights follow it too (see FOCUS above); a
//     focus pull is added across plate dissolves.
//   - Colour from io.palette; the pen's time fade-in is the Tomb's cold
//     open; the vignette is on press (zero at rest); magnification on sway;
//     the hand pans.

const FRAG = /* glsl */ `
  uniform vec2 uRes, uPan;
  uniform float uTime, uFocus, uPull, uMag, uAperture, uIntensity, uWeight, uOpen;
  uniform vec3 uColA, uColB, uColS;
  in vec2 vUv;
  out vec4 fragColor;
  #define S smoothstep
  float rnd(vec2 a) {
    vec3 p = fract(vec3(a.xyx) * .1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }
  // Worley F1: the cell points drift on a sine of t, the cells' own flow
  float noise(vec2 p, float t) {
    vec2 i = floor(p), f = fract(p);
    float d = .25;
    for (float y = -1.; y <= 1.; y++) {
      for (float x = -1.; x <= 1.; x++) {
        vec2 n = vec2(x, y);
        float r = rnd(i + n);
        vec2 q = vec2(r, fract(r + x * y));
        q = .5 + .5 * sin(t + 6.3 * q);
        d = min(d, length(n + q - f));
      }
    }
    return d;
  }
  // two Worley layers; wA / wB are the focus's weights on the coarse and the
  // fine layer; the octave turn is a constant (the pen turned it on the clock)
  float fbm(vec2 p, float tt, float wA, float wB) {
    const mat2 m = mat2(0.9950, -0.0998, 0.0998, 0.9950);
    float t = .0;
    t += .5 * wA * noise(p, tt);
    p *= 2. * m;
    t += .25 * wB * noise(p, tt);
    return t;
  }
  vec3 render(vec2 uv, float nz, float wA, float wB) {
    float t = uTime * .2;
    vec2 q = vec2(noise(uv * 10. + t, t), noise(uv - t, t * 1.5)) * .1;
    float h = fbm(uv * 6. - q, t, wA, wB);
    // the pen's own normal terms, and the focus in z
    vec3 n = normalize(-vec3(
      fbm((vec2(.015, 0)) * 10. + q, t, wA, wB) - h,
      fbm((uv + vec2(0, .015)) * 1.5 + q, t, wA, wB) - h,
      nz));
    vec3 l = normalize(vec3(.1, .5, 1));
    float d = clamp(dot(n, l), .0, 1.), spe = pow(d, 8.);
    vec3 col = uColA * S(.7, .2, h);
    col = mix(col, uColB, S(.7, .5, h));
    col += spe * 1.5 * uColS;
    col *= S(-.5, 1.5, d);
    col = tanh(col);
    return col;
  }
  void main() {
    vec2 FC = vUv * uRes;
    float MN = min(uRes.x, uRes.y);
    vec2 uv = (FC - uRes * 0.5) / MN * uMag + uPan;
    // the focus pull: 0 out of focus, .5 focused, 1 through focus; the plate
    // dissolve adds its own defocus on top
    float f = clamp(uFocus, 0.0, 1.0);
    float sharp = cos((f - 0.5) * 3.14159265) * (1.0 - uPull);
    float nz = -(0.045 + 0.14 * (1.0 - sharp));
    // the layers' depth: the coarse layer is sharp before focus, the fine one past it
    float wA = 1.0 - 0.55 * S(0.5, 1.0, f);
    float wB = 0.45 + 0.75 * S(0.0, 0.5, f) * (1.0 - 0.4 * S(0.5, 1.0, f));
    vec3 col = mix(vec3(0), render(uv * .5 + sin(uv * vec2(10, 30)) * 3e-3, nz, wA, wB), uOpen);
    // the aperture: the pen's vignette and a contrast lift, on press only
    vec2 c = vUv;
    c *= 1. - c.yx;
    float vig = pow(c.x * c.y * 25., .125);
    col = mix(col, col * vig, uAperture);
    col = mix(col, col * col * (3.0 - 2.0 * col), uAperture * 0.6);
    fragColor = vec4(col * uIntensity * uWeight, 1.0);
  }
`;

const VERT = /* glsl */ `
  uniform float uWarm;
  out vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = uWarm > 0.5 ? vec4(position.xy * 0.002 - 0.998, 0.0, 1.0) : vec4(position.xy, 0.0, 1.0);
  }`;

// S is the Tomb's per-frame plate state: { dt, t, weight, level, sway, press,
// hx, hy, openS, openDim, species, warm }; the Tomb hands its palette sorted
// cool -> warm in S.order (indices into io.palette).
export function createMicroscopy(THREE, ctx) {
  const U = {
    uRes: { value: new THREE.Vector2(ctx.width, ctx.height) },
    uPan: { value: new THREE.Vector2(0, 0) },
    uTime: { value: 0 },
    uFocus: { value: 0 },
    uPull: { value: 0 },
    uMag: { value: 1 },
    uAperture: { value: 0 },
    uIntensity: { value: 1 },
    uWeight: { value: 0 },
    uOpen: { value: 0 },
    uWarm: { value: 1 },
    uColA: { value: new THREE.Color(0.05, 0.1, 0.2) },
    uColB: { value: new THREE.Color(0.1, 0.7, 0.8) },
    uColS: { value: new THREE.Color(1, 1, 1) },
  };
  const mat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: U,
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  mat.name = 'tomb-microscopy';
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  quad.frustumCulled = false;
  quad.renderOrder = 1;

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const approach = (v, to, tau, dt) => v + (to - v) * (1 - Math.exp(-dt / tau));
  const lum = (c) => 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
  // a palette stop scaled to a luminance, lifted toward white by k
  function tone(out, c, L, k) {
    const s = L / Math.max(lum(c), 0.02);
    out.setRGB(c.r * s, c.g * s, c.b * s);
    if (k > 0) out.lerp(white, k);
  }
  const white = new THREE.Color(1, 1, 1);
  let mag = 1, ap = 0, panX = 0, panY = 0, focus = 0, shown = true;

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
      // the species: the cell scale and the layer mix, a seeded magnification base
      const spMag = 0.7 + 0.7 * S.speciesHash;
      mag = approach(mag, spMag * (1.35 - 0.9 * S.sway), 0.3, dt);
      ap = approach(ap, S.press, 0.15, dt);
      panX = approach(panX, (S.hx - 0.5) * 0.9, 0.3, dt);
      panY = approach(panY, (S.hy - 0.5) * 0.6, 0.3, dt);
      focus = approach(focus, S.level, 0.25, dt);
      const pl = io.palette, o = S.order;
      tone(U.uColA.value, pl[o[0]], 0.10, 0.0);
      tone(U.uColB.value, pl[o[1]], 0.56, 0.12);
      tone(U.uColS.value, pl[o[4]], 0.9, 0.7);
      U.uTime.value = S.t;
      U.uFocus.value = focus;
      U.uPull.value = clamp(1 - S.weight, 0, 1) * 0.8;   // the plate dissolve is a focus pull
      U.uMag.value = mag;
      U.uAperture.value = ap;
      U.uPan.value.set(panX, panY);
      U.uIntensity.value = io.intensity * S.openDim;
      U.uWeight.value = S.warm ? 0 : S.weight;
      U.uOpen.value = Math.max(S.openS, 0.12);
    },
    resize(w, h) { U.uRes.value.set(w, h); },
    dispose() { quad.geometry.dispose(); mat.dispose(); },
  };
}
