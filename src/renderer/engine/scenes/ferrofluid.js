// Ferrofluid Orb, the real cymatics "orb" mode from GANTASMO's theDAW.
//
// Ported from theDAW frontend/src/components/audio/cymatics/sphere-shader.ts
// and backdrop-shader.ts, composed after the orb branch of
// frontend/src/components/audio/CymaticsVisualizer.tsx
// (https://github.com/gantasmo/theDAW), which carry:
//     @license
//     SPDX-License-Identifier: Apache-2.0
// That notice is retained here as Apache-2.0 requires, along with this
// statement of changes.
//
// CHANGES FROM THE ORIGINAL:
//   * The whole sphere vertex shader, rosensweig() with its pole-field
//     dropoff, Fibonacci (13/21/34) phyllotaxis cross-hatch, witch's-hat
//     foot/apex/sharpTip profile and stillness-on-silence guard, calc(), and
//     the tangent-frame normal rebuild at inc = 0.005, is carried over and
//     installed exactly the way upstream installs it: onBeforeCompile swaps
//     MeshStandardMaterial's vertexShader for the ported string. TWO
//     deviations inside the GLSL: (1) upstream declares `uniform float
//     spikeDensity` but never reads it, so here it scales the phyllotaxis
//     winding pair as d = spikeDensity / 5.0. At the upstream default of 5.0,
//     d = 1.0 and the arm expressions are upstream's verbatim; the uniform
//     merely gains its evidently intended effect so the morphs below can
//     restructure the field. (2) The phyllotaxis longitude no longer carries
//     upstream's `t * 0.08` background drift, see the no-autonomous-rotation
//     bullet below.
//   * Shader language: the backdrop is a RawShaderMaterial in GLSL3
//     (glslVersion: THREE.GLSL3, `in` / `out vec4 fragmentColor`), as upstream
//     wrote it. The sphere vertex shader above is installed through
//     onBeforeCompile into three.js's own MeshStandardMaterial program, so
//     it follows three's built-in shader conventions by necessity (`varying`,
//     the <chunk> includes); three.js compiles and versions that program
//     itself.
//   * Upstream reflects piz_compressed.exr through PMREMGenerator. Scenes may
//     not load assets, so the chrome reflects ctx.environment, the engine's
//     shared PMREM-filtered RoomEnvironment, through material.envMap.
//   * Upstream's UnrealBloomPass (strength 1.65, radius 0.4, threshold 0.6)
//     is requested through the engine's per-scene bloom: meta.bloom carries
//     the base numbers and the live instance.bloom surges with pulse/strikes.
//   * The camera keeps upstream's 3.3 orbit radius and 65° FOV but is steered
//     by io.xy alone; the rim and fill lights are tinted from io.palette each
//     frame (contract rule 1).
//   * IcosahedronGeometry detail 64 becomes 32/48/64 by quality tier.
//   * Upstream's calc() returns a perfectly still ball whenever volume is
//     under 0.01, right for a reactive art piece, wrong for a VJ scene that
//     must hold the screen between cues. A small floor on the CPU-side band
//     values fed into inputData keeps a standing spike field alive; the
//     shader itself is untouched.
//   * Sway-gesture morphs drive the spike PARAMETERS, not mere motion:
//     STRIKE re-magnetizes (spikeDensity jumps through 3->5->7->9, amplitude
//     surges +0.5 decaying ~1.5 s), SWAY glides density 2..9 and viscosity
//     2.0..0.6 (oily swells -> needle forest), PRESS squeezes amplitude toward
//     0.1 while envMapIntensity rises (crushed chrome), PULSE surges bloom
//     and amplitude.
//   * No autonomous rotation (project rule): the slow camera azimuth drift
//     this port first added (0.05 rad/s on top of the io.xy orbit) is gone,
//     and upstream's `t * 0.08` longitude drift, which slowly spun the
//     phyllotaxis spike field around the pole axis by itself, is dropped from
//     rosensweig(); the audio-reactive beatSpin swing stays. In its place the
//     idle floor breathes slowly, so the standing field swells and settles
//     between cues instead of turning.

export const meta = {
  id: 'ferrofluid',
  name: 'Ferrofluid Orb',
  mood: 'magnetic',
  bloom: { strength: 1.65, radius: 0.4, threshold: 0.6 },
};

const PADS = 16;

// Upstream CymaticsVisualizer constants (orb branch).
const FOV = 65;
const CAM_RADIUS = 3.3;
const SPIKE_DENSITY = 5.0;
const SPIKE_AMPLITUDE = 0.45;
const NOISE_VISCOSITY = 1.2;
const IS_FERROFLUID = 1.0;

// Idle floor (adaptation, see header): keeps a standing spike field between
// cues, breathing slowly (see update()). Everything above the floor is
// upstream's own response.
const FLOOR = 0.16;

// STRIKE re-magnetization cycle for spikeDensity.
const DENSITY_CYCLE = [3, 5, 7, 9];

// Upstream sphere-shader.ts vertex shader, whole. The only deviations are the
// d = spikeDensity / 5.0 winding factor and the dropped t * 0.08 longitude
// drift (see header).
const SPHERE_VS = /* glsl */ `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
  varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

uniform float time;
uniform vec4 inputData; // Packed audio tracking data (x: bass, y: mids, z: highs, w: amplitude)
uniform vec4 outputData; // Same packed format for output stream

uniform float spikeDensity;
uniform float spikeAmplitude;
uniform float noiseViscosity;
uniform float isFerrofluid; // 0.0 (smooth ripples) to 1.0 (sharp ferrofluid needles)

float rosensweig(vec3 p, float t, vec4 audio) {
  // Normalize p to unit sphere to compute pure angular coordinates
  vec3 np = normalize(p);

  // 1. Natural magnetic pole field dropoff:
  // Strongest field at the top and bottom poles, dropping off smoothly at the equator.
  float fieldStrength = abs(np.y); // Ranges from 0 at equator to 1 at poles
  fieldStrength = pow(fieldStrength, 1.5);

  float totalAudio = max(audio.x, max(audio.y, audio.z));

  // 2. Fibonacci / Sunflower phyllotaxis cross-hatching spiral wave grid
  // Introduce a highly dynamic, audio-reactive rotational swing.
  // Energetic transient rotation on mids (audio.y) and highs (audio.z).
  // PORT NOTE: upstream adds a slow background drift here (t * 0.08) that
  // spins the whole field around the pole axis by itself; the project rules
  // out autonomous rotation, so that term is dropped and only the audio
  // swing remains.
  float beatSpin = (audio.y * 1.8 + audio.z * 1.4);
  float theta = atan(np.z, np.x) + beatSpin;  // Longitude angle with reactive spin
  float phi = acos(clamp(np.y, -0.999, 0.999));       // Latitude angle from north pole

  // Symmetricize north/south hemispheres for uniform polar alignment
  float symPhi = phi;
  if (symPhi > 1.5707963) {
    symPhi = 3.14159265 - symPhi;
  }

  // Logarithmic spiral coordinates
  float logR = log(max(0.01, symPhi));

  // Consecutive Fibonacci winding numbers (13, 21, 34)
  // This produces Golden Ratio cross-hatching sunflower seed lattice centers.
  // PORT NOTE: d scales the winding pair; at the upstream default
  // spikeDensity = 5.0 it is exactly 1.0 and both arms are upstream verbatim.
  float d = spikeDensity / 5.0;
  float arm1 = cos(d * (13.0 * theta - 21.0 * logR));
  float arm2 = cos(d * (-21.0 * theta - 34.0 * logR));

  // Combine intersecting spiral wave fronts
  float grid = (arm1 + arm2) / 2.0;
  grid = grid * 0.5 + 0.5; // Map to [0.0, 1.0]

  // Implement the physical double-curvature Hershey's Kiss / "Witch's Hat" silhouette:
  // 1. Broad candle-foot flare near base (low exponent), widened so adjacent
  //    spike bases flare out and touch.
  float foot = pow(grid, 1.3);

  // 2. High-strength magnetic apex needle core (high exponent, scales dynamically with total audio response)
  float magneticStrength = isFerrofluid * (0.15 + 0.85 * totalAudio) * fieldStrength;

  // Higher magnetic intensity creates sharper, narrower, taller spikes
  float apexExp = mix(5.0, 28.0, magneticStrength);
  float apexMultiplier = mix(0.1, 7.0, magneticStrength);
  float apex = pow(grid, apexExp) * apexMultiplier;

  // Combine base and apex to construct splayed profile
  float profile = (foot + apex) / (1.0 + apexMultiplier);

  // 3. Apply a sharp-tapering micro-cusp filter near the extreme point (grid == 1.0)
  // to avoid standard rounded vertex blunting, giving is perfect needle tips under high fields
  float sharpTip = 1.0 - pow(1.5 * (1.0 - grid), 0.75);
  profile = mix(profile, profile * clamp(sharpTip, 0.0, 1.0), isFerrofluid);

  return profile * fieldStrength;
}

vec3 calc( vec3 pos, vec3 norm ) {
  float t = time * noiseViscosity;

  vec4 totalAudio = inputData + outputData;
  float bass = totalAudio.x;
  float mids = totalAudio.y;
  float highs = totalAudio.z;
  float volume = max(bass, max(mids, highs));

  // Strictly enforce complete stillness when silent
  if (volume < 0.01) {
    return pos;
  }

  // Organic, slow, low-intensity fluid pulsation (pulsing on bass)
  // Highly subtle and low amplitude to prevent excessive shape distortion/shaking
  float pulsation = (0.015 * bass) * sin(t * 0.4 + pos.y * 0.6) * cos(t * 0.35 + pos.x * 0.5);

  // High-frequency structured ferrofluid spikes
  float spikeValue = rosensweig(pos, t, totalAudio);

  // Spacing stays LOCKED. Only height and sharpness scale dynamically with audio intensity.
  float dynamicAmp = spikeAmplitude * volume * (0.2 + 0.8 * (bass + mids + highs * 1.2));

  float displacement = pulsation + (spikeValue * dynamicAmp);

  return pos + norm * displacement;
}

void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <batching_vertex>
  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  #include <begin_vertex>

  float inc = 0.005;

  vec3 np = calc( position, objectNormal );

  // Construct a tangent-space coordinate frame at this vertex
  vec3 t1 = cross(objectNormal, vec3(0.0, 1.0, 0.0));
  if (length(t1) < 0.01) {
    t1 = cross(objectNormal, vec3(0.0, 0.0, 1.0));
  }
  t1 = normalize(t1);
  vec3 t2 = cross(objectNormal, t1); // Orthonormal second tangent

  // Sample displacements of neighboring vertices in tangent plane
  vec3 p1 = position + t1 * inc;
  vec3 p2 = position + t2 * inc;

  vec3 np1 = calc( p1, objectNormal );
  vec3 np2 = calc( p2, objectNormal );

  vec3 tangent = normalize( np1 - np );
  vec3 bitangent = normalize( np2 - np );

  // Recalculating the exact surface normal post-displacement
  transformedNormal = normalMatrix * normalize( cross( tangent, bitangent ) );
  vNormal = normalize( transformedNormal );

  transformed = np;

  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vViewPosition = - mvPosition.xyz;
  #include <worldpos_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
  #ifdef USE_TRANSMISSION
    vWorldPosition = worldPosition.xyz;
  #endif
}`;

// Upstream backdrop-shader.ts, verbatim: the dark-plasma void the orb floats
// in, a faint radial gradient with temporal dither, in screen space.
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
}`;

export function createScene(ctx) {
  const { THREE, quality } = ctx;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, ctx.width / Math.max(1, ctx.height), 0.1, 1000);
  camera.position.set(0, 0, CAM_RADIUS);

  // Upstream detail 64 scaled by quality tier.
  const detail = quality.tier === 'high' ? 64 : quality.tier === 'low' ? 32 : 48;

  // --- backdrop: upstream's BackSide icosahedron with the raw GLSL3 shader.
  //     gl_FragCoord runs over the engine's render target, which is sized
  //     canvas × the renderer's pixel ratio, resolution tracks that.
  const pr0 = ctx.renderer.getPixelRatio();
  const backdropGeo = new THREE.IcosahedronGeometry(12, 5);
  const backdropMat = new THREE.RawShaderMaterial({
    uniforms: {
      resolution: { value: new THREE.Vector2(ctx.width * pr0, Math.max(1, ctx.height) * pr0) },
      rand: { value: 0 },
    },
    vertexShader: BACKDROP_VS,
    fragmentShader: BACKDROP_FS,
    glslVersion: THREE.GLSL3,
  });
  backdropMat.side = THREE.BackSide;
  const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
  backdrop.frustumCulled = false; // camera lives inside it
  scene.add(backdrop);

  // --- the orb: pristine high-gloss wet-obsidian black chrome. The near-zero
  //     albedo means facing surfaces stay black while grazing angles mirror
  //     the environment, the whole look depends on envMap being present.
  const orbGeo = new THREE.IcosahedronGeometry(1.0, detail);
  const orbMat = new THREE.MeshStandardMaterial({
    color: 0x010101,
    metalness: 0.99,
    roughness: 0.003,
    emissive: 0x000000,
  });
  orbMat.envMap = ctx.environment; // THE reflection source (engine-owned)
  orbMat.envMapIntensity = 1.45;

  // Uniform objects shared into the compiled program; update() writes these.
  const orbUniforms = {
    time: { value: 0 },
    inputData: { value: new THREE.Vector4() },
    outputData: { value: new THREE.Vector4() },
    spikeDensity: { value: SPIKE_DENSITY },
    spikeAmplitude: { value: SPIKE_AMPLITUDE },
    noiseViscosity: { value: NOISE_VISCOSITY },
    isFerrofluid: { value: IS_FERROFLUID },
  };

  orbMat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, orbUniforms);
    shader.vertexShader = SPHERE_VS;
  };
  orbMat.customProgramCacheKey = () => 'swaycommand-ferrofluid-orb';

  const orb = new THREE.Mesh(orbGeo, orbMat);
  orb.frustumCulled = false; // displaced past its bounding sphere
  scene.add(orb);

  // --- upstream three-point studio + neon accent rig, verbatim numbers
  const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.4);
  keyLight.position.set(6, 9, 5);
  const rimLight = new THREE.DirectionalLight(0xb14dff, 0.9);
  rimLight.position.set(-6, -3, -4);
  const fillLight = new THREE.DirectionalLight(0x00d2ff, 0.4);
  fillLight.position.set(0, -6, 5);
  const ambient = new THREE.AmbientLight(0x0c0714, 0.15);
  scene.add(keyLight, rimLight, fillLight, ambient);

  // --- preallocated state
  const bloom = { strength: 1.65, radius: 0.4, threshold: 0.6 };
  const prevPads = new Float32Array(PADS);
  let cycleIdx = 1; // DENSITY_CYCLE[1] = 5, the upstream default
  let density = SPIKE_DENSITY;
  let viscosity = NOISE_VISCOSITY;
  let surge = 0; // strike amplitude surge, decays ~1.5 s
  let strikeFlash = 0; // strike bloom kick, decays faster
  let envB = 0;
  let envM = 0;
  let envH = 0;
  let azS = 0;
  let elS = 0;

  const approach = (cur, to, tau, dt) => cur + (to - cur) * (1 - Math.exp(-dt / tau));

  return {
    scene,
    camera,
    bloom,
    update(dt, t, io) {
      const fdt = dt * 60; // upstream animates in frame units (dt / (1000/60))

      // Upstream's slow shared band envelopes: low gain = slow, smooth spike
      // rise/fall and far less jitter.
      const envK = Math.min(1, 0.035 * fdt);
      envB += (io.bands.bass - envB) * envK;
      envM += (io.bands.mid - envM) * envK;
      envH += (io.bands.high - envH) * envK;

      // STRIKE, re-magnetization. A pad rising edge cycles spikeDensity to a
      // new value (an instant jump: the field restructures, then glides back
      // toward the sway target) and fires a decaying amplitude surge.
      for (let i = 0; i < PADS; i++) {
        if (io.pads[i] > 0.25 && io.pads[i] > prevPads[i] + 0.05) {
          cycleIdx = (cycleIdx + 1) % DENSITY_CYCLE.length;
          density = DENSITY_CYCLE[cycleIdx];
          surge = 1;
          strikeFlash = 1;
        }
        prevPads[i] = io.pads[i];
      }
      surge *= Math.exp(-dt / 0.5); // ~1.5 s to fade out
      strikeFlash *= Math.exp(-dt / 0.35);

      // SWAY, continuous field morph: density glides 2..9, viscosity 2.0..0.6
      // (calm oily swells at the bottom, needle forests at the top).
      density = approach(density, 2 + io.gestures.sway * 7, 0.45, dt);
      viscosity = approach(viscosity, 2.0 - 1.4 * io.gestures.sway, 0.45, dt);

      // PRESS, squeeze: amplitude compresses toward 0.1 while the chrome
      // crushes brighter below. PULSE, amplitude surge (bloom surges below).
      const amp =
        SPIKE_AMPLITUDE + (0.1 - SPIKE_AMPLITUDE) * io.gestures.press +
        surge * 0.5 +
        io.gestures.pulse * 0.3;

      orbUniforms.spikeDensity.value = density;
      orbUniforms.spikeAmplitude.value = amp;
      orbUniforms.noiseViscosity.value = viscosity;

      // Upstream clock: time += dt · 0.015 · (1 + 0.6 · bass).
      orbUniforms.time.value += fdt * 0.015 * (1 + 0.6 * envB);

      // Pack the bands into upstream's vec4 layout, over the idle floor
      // (adaptation, see header). The floor breathes slowly (±25 %, ~9 s) so
      // the standing field swells and settles between cues, non-rotational
      // idle life in place of the drifts this port no longer carries.
      // outputData stays zero as in the orb branch.
      const breath = 1 + 0.25 * Math.sin(t * 0.7);
      const b = FLOOR * breath + envB;
      const m = FLOOR * 0.7 * breath + envM;
      const h = FLOOR * 0.5 * breath + envH;
      orbUniforms.inputData.value.set(b, m, h, (b + m + h) / 3);

      // Upstream sphere scale.
      orb.scale.setScalar(1 + 0.04 * envB);

      // Camera: upstream's 3.3 orbit, steered by io.xy alone, no autonomous
      // drift (project rule: nothing rotates by itself).
      azS = approach(azS, io.xy.x * Math.PI * 2, 0.25, dt);
      elS = approach(elS, (io.xy.y - 0.5) * 2.2, 0.25, dt);
      const ce = Math.cos(elS);
      camera.position.set(
        Math.sin(azS) * ce * CAM_RADIUS,
        Math.sin(elS) * CAM_RADIUS,
        Math.cos(azS) * ce * CAM_RADIUS
      );
      camera.lookAt(orb.position);

      // Rim/fill tinted from the palette every frame (contract rule 1); the
      // key stays upstream's warm white so the chrome reads neutral.
      rimLight.color.copy(io.palette[1]);
      fillLight.color.copy(io.palette[2]);
      keyLight.intensity = 1.4 * io.intensity;
      rimLight.intensity = (0.9 + io.beat * 0.6) * io.intensity;
      fillLight.intensity = 0.4 * io.intensity;

      // PRESS crushes the chrome brighter; base sits in the 1.2 to 1.6 band the
      // RoomEnvironment needs to make black chrome read at all.
      orbMat.envMapIntensity = 1.45 + io.gestures.press * 1.15;

      // PULSE + STRIKE surge the real bloom (upstream UnrealBloomPass base).
      bloom.strength = 1.65 + io.gestures.pulse * 0.8 + strikeFlash * 0.5;

      // Backdrop dither reseeds every frame, as upstream.
      backdropMat.uniforms.rand.value = Math.random() * 10000;
    },
    resize(w, h) {
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      const pr = ctx.renderer.getPixelRatio();
      backdropMat.uniforms.resolution.value.set(w * pr, Math.max(1, h) * pr);
    },
    dispose() {
      orbGeo.dispose();
      orbMat.dispose(); // ctx.environment is engine-owned, not disposed here
      backdropGeo.dispose();
      backdropMat.dispose();
      keyLight.dispose();
      rimLight.dispose();
      fillLight.dispose();
      ambient.dispose();
    },
  };
}
