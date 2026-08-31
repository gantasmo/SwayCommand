// Cymatic Plate, the real cymatics "cymatics" mode from GANTASMO's theDAW:
// a Chladni/Faraday standing-wave liquid plate.
//
// Ported from theDAW frontend/src/components/audio/cymatics/cymatics-shader.ts,
// backdrop-shader.ts, and the cymatics branch of CymaticsVisualizer.tsx
// (https://github.com/gantasmo/theDAW), which carry:
//     @license
//     SPDX-License-Identifier: Apache-2.0
// That notice is retained here as Apache-2.0 requires, along with this
// statement of changes.
//
// CHANGES FROM THE ORIGINAL:
//   * The plate maths are verbatim, one term excepted (next bullet): the
//     float[16] n/m/sign mode tables, getCymaticValue() (quadrature
//     traveling-wave Chladni + polar Faraday cell + even/odd geometryMix),
//     calcPlane() (1.75 half-extent, adjacent-mode blend, 0.45 *
//     smoothedAmplitude excitation, clamped-edge damping), and the
//     central-difference normals at inc = 0.01. They are injected into
//     MeshStandardMaterial's vertex shader via onBeforeCompile instead of
//     replacing the whole shader, so the surrounding chunk list tracks this
//     tree's three.js rather than upstream's.
//   * Shader language: the backdrop is a RawShaderMaterial in GLSL3
//     (glslVersion: THREE.GLSL3, `in` / `out vec4 fragmentColor`), as upstream
//     wrote it. The plate maths ride inside three.js's own
//     MeshStandardMaterial program through onBeforeCompile, so those chunks
//     follow three's built-in shader conventions by necessity; three.js
//     compiles and versions that program itself.
//   * No autonomous rotation (project rule): the Faraday spoke term
//     cos(n * theta - t * 0.4), which slowly turned the polar nodal spokes by
//     themselves, is cos(n * theta) here, the spokes hold still while the
//     rings keep propagating and the quadrature Chladni waves keep migrating.
//     The camera was already hand-only (io.xy inside the DRIFT margin).
//   * Upstream reads a real 16-band FFT. SwayCommand scenes receive three bands
//     plus a level, so the 16 audioLevels are synthesized (bins 0-3 bass,
//     4-10 mid, 11-15 high (upstream's own split) shaped into a curve with a
//     small deterministic ripple). The spectral-centroid mode picker and both
//     asymmetric smoothings (mode 0.04 down / 0.08 up, amplitude 0.28 up /
//     0.07 down) then run on that spectrum unchanged, as does the
//     time += dt·60·0.04 clock.
//   * The .exr environment becomes ctx.environment, the engine's shared
//     PMREM-filtered RoomEnvironment; upstream's composer bloom becomes the
//     engine's per-scene UnrealBloom at the same 1.65 / 0.4 / 0.6.
//   * The rim and fill lights are tinted from io.palette each frame; the key
//     light stays near its warm white with a whisper of the palette.
//   * A floor under the drive amplitude keeps the plate rippling without
//     audio, upstream lets it rest perfectly flat on silence.
//   * Control morphs drive the plate's own physics, not object motion:
//     STRIKE jumps activeModeIndex to a new discrete mode (+3..5, wrapping)
//     with a decaying amplitude hit, a mallet on the plate re-sorting the
//     sand; SWAY bows it, biasing the target the centroid eases toward across
//     the whole mode table; PRESS is a finger damping the plate (amplitude
//     toward 0.15, time ×0.4); PULSE drives it (cymaticAmplitude 1 -> 2 and a
//     bloom surge). XY drifts the cover-framed camera over the surface.
//   * Plane segments 160 as upstream at the med tier, 110 low / 200 high.

export const meta = {
  id: 'chladni',
  name: 'Cymatic Plate',
  mood: 'resonant',
  bloom: { strength: 1.65, radius: 0.4, threshold: 0.6 },
};

const MODES = 16;
const PADS = 16;

// Upstream's camera framing: FOV 65, and the camera pulled in so the larger
// viewport axis stays inside the active plate region (~1.45 of the 1.75 half,
// never showing the damped flat rim), cover, not contain. DRIFT is carved
// out of that 1.45 so the io.xy camera drift can never expose the rim.
const FOV = 65;
const TAN_HALF_FOV = Math.tan((FOV * Math.PI) / 360);
const COVER = 1.45;
const DRIFT = 0.14;

// --- upstream cymatics-shader.ts, verbatim plate maths (the spoke-drift term
//     dropped, see header) --------------------------------------------------

const PLATE_PARS = /* glsl */ `
uniform float time;

// We pass the 16 frequency bands of our analyser
uniform float audioLevels[16];

// The smoothly interpolated continuous mode index (0.0 to 15.0)
uniform float activeModeIndex;

// The smoothly animated resonance amplitude based on physical inertia
uniform float smoothedAmplitude;

// Global parameters to fine-tune the liquid metal Cymatic effect
uniform float cymaticAmplitude;

// Predefined 16 distinct, highly beautiful, mathematically authentic Chladni & Faraday modes
// n, m indices correspond to the frequency bands
float ns[16] = float[16](2.0, 3.0, 3.0, 4.0, 4.0, 5.0, 5.0, 6.0, 6.0, 6.0, 7.0, 7.0, 8.0, 8.0, 10.0, 12.0);
float ms[16] = float[16](2.0, 1.0, 3.0, 2.0, 4.0, 3.0, 5.0, 2.0, 4.0, 6.0, 3.0, 5.0, 4.0, 8.0,  6.0,  10.0);
float signs[16] = float[16](1.0, -1.0, 1.0, -1.0, 1.0, -1.0, 1.0, -1.0, 1.0, -1.0, 1.0, -1.0, 1.0, -1.0,  1.0,  -1.0);

float getCymaticValue(float u, float v, float r, float theta, int idx, float t) {
  float n = ns[idx];
  float m = ms[idx];
  float s = signs[idx];

  // 1. Classical Chladni plate standing wave solution converted to smooth traveling waves via quadrature phase offset.
  // The phases of the individual components are shifted out-of-phase (sin/cos) so the peaks and valleys continuously
  // migrate across the surface and the total wave energy never collapses to flat simultaneously.
  float chladni1 = cos(n * PI * u) * cos(m * PI * v);
  float chladni2 = cos(m * PI * u) * cos(n * PI * v);
  float chladni = chladni1 * sin(t * 3.5) + s * chladni2 * cos(t * 3.5);

  // 2. Faraday liquid cell polar standing waves converted to centrifugal propagating ripples:
  // - cos(m * PI * r - t * 3.5) continuously translates circles outward/inward.
  // - cos(n * theta) holds the nodal spokes still. PORT NOTE: upstream writes
  //   cos(n * theta - t * 0.4), which slowly rotates the spokes by themselves;
  //   the project rules out autonomous rotation, so the drift term is dropped
  //   and the rings keep propagating through a fixed spoke pattern.
  float polarCymatic = cos(m * PI * r - t * 3.5) * cos(n * theta);

  // Even modes have a square tray look, odd modes have a round, polar fluidic look
  float geometryMix = mod(float(idx), 2.0) == 0.0 ? 0.3 : 0.7;
  float val = mix(chladni, polarCymatic, geometryMix);

  return val;
}

vec3 calcPlane( vec3 pos ) {
  // Normalize pos.x and pos.y from [-1.75, 1.75] to [-1.0, 1.0] for exact plate boundaries
  float u = pos.x / 1.75;
  float v = pos.y / 1.75;
  float r = length(vec2(u, v));
  float theta = atan(v, u);

  // Interpolate between the two adjacent mode indices for a seamless fluid morphing effect
  int idx0 = clamp(int(floor(activeModeIndex)), 0, 15);
  int idx1 = clamp(idx0 + 1, 0, 15);
  float tBlend = fract(activeModeIndex);

  float val0 = getCymaticValue(u, v, r, theta, idx0, time);
  float val1 = getCymaticValue(u, v, r, theta, idx1, time);
  float z = mix(val0, val1, tBlend);

  // 4. Physical Inertia & Amplitude scaling
  float excitation = 0.45 * smoothedAmplitude;
  z *= excitation;

  // 5. Clamped Boundary Conditions
  // Displacement goes to 0 gracefully at the edges of the square tray to contain the mercury
  float edgeDamping = (1.0 - smoothstep(0.85, 1.0, abs(u))) * (1.0 - smoothstep(0.85, 1.0, abs(v)));
  z *= edgeDamping;

  // Global scale factor
  z *= cymaticAmplitude;

  return pos + vec3(0.0, 0.0, z);
}
`;

// Upstream's main() body between <begin_vertex> and <morphtarget_vertex>,
// verbatim; transformedNormal / vNormal / transformed are in scope here.
const PLATE_BODY = /* glsl */ `
float inc = 0.01; // central difference step size suitable for our vertex density

vec3 np = calcPlane( position );

// Central difference numerical differentiation to obtain exact mathematical surface normals
vec3 npDX = calcPlane( position + vec3(inc, 0.0, 0.0) );
vec3 npDY = calcPlane( position + vec3(0.0, inc, 0.0) );

vec3 tangent = normalize( npDX - np );
vec3 bitangent = normalize( npDY - np );

// Cross product of tangent vectors produces correct normal in the local +Z coordinate system
transformedNormal = normalMatrix * normalize( cross( tangent, bitangent ) );

vNormal = normalize( transformedNormal );

transformed = np;
`;

// --- upstream backdrop-shader.ts, verbatim ------------------------------------

const BACKDROP_VS = /* glsl */ `precision highp float;

in vec3 position;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}`;

const BACKDROP_FS = /* glsl */ `precision highp float;

out vec4 fragmentColor;

uniform vec2 resolution;
uniform float rand;

void main() {
  float aspectRatio = resolution.x / resolution.y;
  vec2 vUv = gl_FragCoord.xy / resolution;
  float noise = (fract(sin(dot(vUv, vec2(12.9898 + rand,78.233)*2.0)) * 43758.5453));

  vUv -= .5;
  vUv.x *= aspectRatio;

  float factor = 4.;
  float d = factor * length(vUv);
  vec3 from = vec3(3.) / 255.;
  vec3 to = vec3(16., 12., 20.) / 2550.;

  fragmentColor = vec4(mix(from, to, d) + .005 * noise, 1.);
}
`;

export function createScene(ctx) {
  const { THREE, quality } = ctx;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, ctx.width / Math.max(1, ctx.height), 0.1, 1000);

  const seg = quality.tier === 'high' ? 200 : quality.tier === 'low' ? 110 : 160;
  const pr = ctx.renderer.getPixelRatio();

  // --- backdrop: upstream's BackSide icosahedron behind everything
  const backdropGeo = new THREE.IcosahedronGeometry(12, 5);
  const backdropMat = new THREE.RawShaderMaterial({
    uniforms: {
      resolution: { value: new THREE.Vector2(ctx.width * pr, ctx.height * pr) },
      rand: { value: 0 },
    },
    vertexShader: BACKDROP_VS,
    fragmentShader: BACKDROP_FS,
    glslVersion: THREE.GLSL3,
    side: THREE.BackSide,
  });
  const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
  scene.add(backdrop);

  // --- the plate: opaque black chrome reflecting liquid ripples (upstream)
  const plateGeo = new THREE.PlaneGeometry(3.5, 3.5, seg, seg);
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x010101,
    metalness: 0.98,
    roughness: 0.005,
    emissive: 0x000000,
  });
  plateMat.envMap = ctx.environment; // the engine's PMREM RoomEnvironment
  plateMat.envMapIntensity = 1.45;

  const audioLevels = new Float32Array(MODES);
  const plateUniforms = {
    time: { value: 0 },
    audioLevels: { value: audioLevels },
    activeModeIndex: { value: 0 },
    smoothedAmplitude: { value: 0 },
    cymaticAmplitude: { value: 1 },
  };

  plateMat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, plateUniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\n' + PLATE_PARS)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + PLATE_BODY);
  };
  plateMat.customProgramCacheKey = () => 'swaycommand-chladni';

  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.frustumCulled = false; // displaced in the vertex shader
  scene.add(plate);

  // --- upstream's three-point studio + neon accent light rig
  const KEY_BASE = new THREE.Color(0xfff5ea);
  const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.4);
  keyLight.position.set(6, 9, 5);
  const rimLight = new THREE.DirectionalLight(0xb14dff, 0.9);
  rimLight.position.set(-6, -3, -4);
  const fillLight = new THREE.DirectionalLight(0x00d2ff, 0.4);
  fillLight.position.set(0, -6, 5);
  const ambient = new THREE.AmbientLight(0x0c0714, 0.15);
  scene.add(keyLight, rimLight, fillLight, ambient);

  // --- preallocated state ----------------------------------------------------
  const prevPads = new Float32Array(PADS);
  const lookTarget = new THREE.Vector3();
  const bloom = { strength: 1.65, radius: 0.4, threshold: 0.6 };
  let smoothedMode = 0; // upstream's eased mode index
  let smoothedAmp = 0; // upstream's eased resonance amplitude
  let tAccum = 0;
  let jumpOffset = 0; // accumulated STRIKE mode jumps, wrapped 0..15
  let strikeStep = 0; // cycles the jump size 3, 4, 5
  let ampHit = 0; // decaying STRIKE amplitude hit
  let prevStrike = 0;
  let dx = 0;
  let dy = 0;

  return {
    scene,
    camera,
    bloom,
    update(dt, t, io) {
      const { bass, mid, high } = io.bands;
      const f60 = dt * 60; // upstream's dt is measured in 60ths of a second

      // ADAPTATION: synthesize upstream's 16 analyser bands from three. Bins
      // 0-3 bass, 4-10 mid, 11-15 high (upstream's own split) leaned toward
      // the next band so the spectrum reads as a curve, with a small
      // deterministic ripple so the centroid is never perfectly static.
      let avgVolume = 0;
      let sumWeights = 0;
      let sumIndices = 0;
      for (let i = 0; i < MODES; i++) {
        const base = i < 4 ? bass : i < 11 ? mid : high;
        const next = i < 4 ? mid : i < 11 ? high : high * 0.5;
        const lean = i < 4 ? i / 4 : i < 11 ? (i - 4) / 7 : (i - 11) / 5;
        const val = (base + (next - base) * lean * 0.5) * (0.85 + 0.15 * Math.sin(t * (0.6 + i * 0.11) + i * 1.7));
        audioLevels[i] = val;
        avgVolume += val;
        // upstream's centroid weights: bin 0 nearly muted, others squared
        const weight = i === 0 ? val * 0.15 : val * val;
        sumWeights += weight;
        sumIndices += weight * i;
      }
      avgVolume /= 16;

      // STRIKE, a mallet on the plate: jump to a new discrete mode (+3..5,
      // wrapping over the 16-entry table) and kick the amplitude. Both the
      // engine's strike dimension and per-pad rising edges arm it.
      let struck = io.strike > 0.25 && io.strike > prevStrike + 0.05;
      prevStrike = io.strike;
      for (let i = 0; i < PADS; i++) {
        if (io.pads[i] > 0.25 && io.pads[i] > prevPads[i] + 0.06) struck = true;
        prevPads[i] = io.pads[i];
      }
      if (struck) {
        jumpOffset = (jumpOffset + 3 + (strikeStep++ % 3)) % MODES;
        ampHit = Math.min(1.2, ampHit + 0.6);
      }
      ampHit *= Math.pow(0.05, dt / 1.2); // the hit rings out over ~1.2 s

      // Upstream's spectral-centroid target, with SWAY bowing the plate: the
      // gesture biases the target the centroid eases toward across the whole
      // mode range, and the strike offset relocates it discretely.
      const targetMode = sumWeights > 0.005 ? sumIndices / sumWeights : 0;
      const biased = (Math.min(15, targetMode + io.gestures.sway * 11) + jumpOffset) % MODES;
      // Upstream's asymmetric mode smoothing: 0.04 down, 0.08 up.
      const modeSmoothFactor = biased < smoothedMode ? 0.04 : 0.08;
      smoothedMode += (biased - smoothedMode) * Math.min(1, modeSmoothFactor * f60);
      smoothedMode = Math.max(0, Math.min(15, smoothedMode));
      plateUniforms.activeModeIndex.value = smoothedMode;

      // Upstream's amplitude inertia: 0.28 up, 0.07 down.
      const ampSmoothFactor = avgVolume > smoothedAmp ? 0.28 : 0.07;
      smoothedAmp += (avgVolume - smoothedAmp) * Math.min(1, ampSmoothFactor * f60);

      // PRESS, a finger on the plate: drive scales toward 0.15 and the clock
      // slows to ×0.4. The 0.3 floor keeps the mercury alive without audio.
      const damp = 1 - io.gestures.press * 0.85;
      const drive = Math.max(0.3, smoothedAmp + io.level * 0.25);
      plateUniforms.smoothedAmplitude.value = Math.min(1.0, drive + ampHit) * damp;

      // PULSE, drive: global cymatic amplitude 1 -> 2 plus a bloom surge.
      plateUniforms.cymaticAmplitude.value = 1 + io.gestures.pulse;
      bloom.strength = 1.65 + io.gestures.pulse * 1.1 + ampHit * 0.5;

      // Upstream's slowed cymatics clock (dt · 0.04 in frame units).
      tAccum += f60 * 0.04 * (1 - io.gestures.press * 0.6);
      plateUniforms.time.value = tAccum;

      // Camera: upstream's cover framing, the larger viewport axis stays
      // inside the active plate region, with io.xy drifting the eye over the
      // surface inside the DRIFT margin.
      dx += ((io.xy.x - 0.5) * 0.24 - dx) * (1 - Math.exp(-dt / 0.4));
      dy += ((io.xy.y - 0.5) * 0.24 - dy) * (1 - Math.exp(-dt / 0.4));
      const d = (COVER - DRIFT) / (TAN_HALF_FOV * Math.max(1, camera.aspect));
      camera.position.set(dx, dy, d);
      camera.up.set(0, 1, 0);
      lookTarget.set(dx * 0.85, dy * 0.85, 0);
      camera.lookAt(lookTarget);

      // Palette onto the accent lights; the key keeps its warm studio white
      // with a whisper of the palette, per the light-rig port note above.
      keyLight.color.copy(KEY_BASE).lerp(io.palette[4], 0.2);
      rimLight.color.copy(io.palette[1]);
      fillLight.color.copy(io.palette[2]);
      keyLight.intensity = 1.4 * io.intensity;
      rimLight.intensity = (0.9 + io.beat * 0.5) * io.intensity;
      fillLight.intensity = 0.4 * io.intensity;
      plateMat.envMapIntensity = 1.45 + high * 0.15;

      backdropMat.uniforms.rand.value = Math.random() * 10000; // upstream grain
    },
    resize(w, h) {
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      backdropMat.uniforms.resolution.value.set(w * ctx.renderer.getPixelRatio(), h * ctx.renderer.getPixelRatio());
    },
    dispose() {
      plateGeo.dispose();
      plateMat.dispose();
      backdropGeo.dispose();
      backdropMat.dispose();
      // ctx.environment is the engine's; it is not disposed here.
    },
  };
}
