// Chrome Valley, the real cymatics "landscape" modes from GANTASMO's theDAW:
// an infinite-scroll synthwave valley under a turbulent plasma sun, morphing
// into a ferrofluid spike field.
//
// Ported from theDAW frontend/src/components/audio/cymatics/landscape-shader.ts
// and plasma-shader.ts, with the scene rig (sun, starfield, fog, lights, bloom)
// from CymaticsVisualizer.tsx (https://github.com/gantasmo/theDAW), which carry:
//     @license
//     SPDX-License-Identifier: Apache-2.0
// That notice is retained here as Apache-2.0 requires, along with this
// statement of changes.
//
// CHANGES FROM THE ORIGINAL:
//   * baseTerrain(), spikeField() and calcLandscape() are reproduced verbatim,
//     the sideMask that carves the flat valley floor between mountain walls,
//     the three sine/cosine octaves, the valleyWave, the 7-direction
//     golden-angle quasicrystal, the phi/romanesco modulation, the same
//     witch's-hat foot/apex/sharpTip profile as the orb, the ebb term, the
//     e = 0.18 base normal the spikes grow along, and the inc = 0.02
//     central-difference lighting normal are all unchanged.
//   * Upstream replaces MeshStandardMaterial's whole vertex shader; this port
//     injects the same code through onBeforeCompile, the supported r180 route.
//     Those chunks ride inside three.js's own program and so follow three's
//     built-in shader conventions by necessity; three.js compiles and
//     versions that program itself.
//   * plasmaVS/plasmaFS/haloFS keep their maths verbatim but are written in
//     GLSL3 form (glslVersion: THREE.GLSL3; `in` / `out` in place of
//     `varying`, a declared `out vec4 fragColor` in place of gl_FragColor,
//     and the body-level precision line dropped because three.js prefixes
//     it); the plasma sun, its additive fresnel halo, the purple point light
//     that lights the terrain, and the 240-star golden-scatter sky keep their
//     upstream geometry, placement and response (the star roll excepted,
//     below), but every colour is re-tinted from io.palette each frame
//     (contract rule 1) instead of the fixed purples.
//   * Upstream reflects an .exr through PMREMGenerator; scenes may not load
//     assets, so the chrome reflects ctx.environment, the engine's shared
//     PMREM-filtered RoomEnvironment.
//   * Upstream's UnrealBloomPass (1.65 / 0.4 / 0.6) is requested from the
//     engine's per-scene bloom instead of owning a composer.
//   * The near-black backdrop dome is omitted: the engine clears to black and
//     the contract discourages full-screen fills.
//   * Audio: theDAW's analyser bands become io.bands, smoothed with upstream's
//     own slow envelope (k = 0.035 per 60 Hz frame) so the spikes rise and
//     fall without jitter.
//   * Gestures replace theDAW's mode switcher, terrain physics, not motion:
//     SWAY glides isFerrofluid 0..1, crossfading landscape-chrome into
//     landscape-ferrofluid live, and biases the scroll speed 0.6..1.8 (applied
//     through the time accumulator: the scrollSpeed uniform scales accumulated
//     time inside the shader, so changing it live would teleport the terrain);
//     a pad STRIKE is a seismic hit (mountainHeight +1.2 decaying ~1.5 s, the
//     plasma and bloom flare with it); PRESS dives the camera down between the
//     ridges while the fog pulls in (near 5 -> 3); PULSE surges the sun and the
//     stars; XY steers, x drifts the camera across the valley, y moves the
//     eye line.
//   * No autonomous rotation (project rule): upstream rolls the star field
//     0.0006/frame around the view axis; here the sky holds still behind the
//     scrolling terrain. The terrain scroll, the valleyWave, the spike ebb
//     and the plasma's noise-domain flow are translations and pulses, not
//     rotations, and stay as they are. The camera has no orbit of its own,
//     io.xy and press place it.
//   * Plane segments are 180/300/340 by quality tier (upstream fixed 300).

export const meta = {
  id: 'valley',
  name: 'Chrome Valley',
  mood: 'synthwave',
  bloom: { strength: 1.65, radius: 0.4, threshold: 0.6 },
};

const PADS = 16;
const MOUNTAIN_HEIGHT = 1.5; // upstream landscapeHeight default

export function createScene(ctx) {
  const { THREE, quality } = ctx;
  const scene = new THREE.Scene();
  const fog = new THREE.Fog(0x000000, 5, 16); // upstream landscapeFog
  scene.fog = fog;
  const camera = new THREE.PerspectiveCamera(50, ctx.width / Math.max(1, ctx.height), 0.1, 1000);
  camera.position.set(0, 0.6, 2.4); // upstream landscape camera

  const seg = quality.tier === 'high' ? 340 : quality.tier === 'low' ? 180 : 300;

  // --- terrain: black chrome heightfield, upstream vertex shader ------------
  const landGeo = new THREE.PlaneGeometry(34, 40, seg, seg);
  const landMat = new THREE.MeshStandardMaterial({
    color: 0x010101,
    metalness: 0.99,
    roughness: 0.008,
    envMapIntensity: 1.3,
  });
  // The engine's shared PMREM RoomEnvironment stands in for upstream's EXR.
  // Engine-owned: not disposed here.
  landMat.envMap = ctx.environment;

  const landUniforms = {
    time: { value: 0 },
    audioData: { value: new THREE.Vector4() }, // x bass, y mids, z highs, w level
    scrollSpeed: { value: 1.0 }, // constant; sway speed rides the time accumulator
    mountainHeight: { value: MOUNTAIN_HEIGHT },
    isFerrofluid: { value: 0 }, // 0 smooth chrome -> 1 ferrofluid spikes
  };

  // Upstream landscape-shader.ts, verbatim.
  const LAND_PARS = /* glsl */ `
    uniform float time;
    uniform vec4 audioData;
    uniform float scrollSpeed;
    uniform float mountainHeight;
    uniform float isFerrofluid;

    float baseTerrain(vec3 pos) {
      vec2 p = pos.xy + vec2(0.0, time * scrollSpeed);
      float sideMask = smoothstep(1.2, 4.5, abs(pos.x));
      float n1 = sin(p.x * 0.35) * cos(p.y * 0.22);
      float n2 = sin(p.x * 0.8 + 1.2) * cos(p.y * 0.5) * 0.45;
      float n3 = sin(p.x * 1.6 - 0.5) * cos(p.y * 1.1) * 0.18;
      float baseMountains = (n1 + n2 + n3) * mountainHeight * 1.7 * (1.0 + 0.45 * audioData.x);
      float valleyWave = sin(p.y * 1.4 - time * 1.6) * 0.25 * (audioData.x + audioData.y);
      return mix(valleyWave, baseMountains, sideMask);
    }

    float spikeField(vec3 pos) {
      if (isFerrofluid < 0.001) return 0.0;
      vec2 p = pos.xy + vec2(0.0, time * scrollSpeed);
      float totalAudio = max(audioData.x, max(audioData.y, audioData.z));
      float phi = 1.61803398875;
      float dens = 8.0;
      float field = 0.0;
      for (int i = 0; i < 7; i++) {
        float a = float(i) * 2.39996323; // golden angle (137.5 deg)
        field += cos(dot(p, vec2(cos(a), sin(a))) * dens);
      }
      float grid = clamp(field / 7.0 * 0.5 + 0.5, 0.0, 1.0);
      float macro = cos(p.x / phi) * sin(p.y / phi);
      float romanesco = 0.6 + 0.4 * (macro * 0.5 + 0.5);
      float foot = pow(grid, 1.3);
      float magneticStrength = isFerrofluid * (0.15 + 0.85 * totalAudio);
      float apexExp = mix(5.0, 28.0, magneticStrength);
      float apexMul = mix(0.1, 7.0, magneticStrength);
      float apex = pow(grid, apexExp) * apexMul;
      float profile = (foot + apex) / (1.0 + apexMul);
      float sharpTip = 1.0 - pow(1.5 * (1.0 - grid), 0.75);
      profile = mix(profile, profile * clamp(sharpTip, 0.0, 1.0), isFerrofluid);
      float ebb = 0.55 + 0.45 * sin(time * 0.5 + p.x * 1.3 + p.y * 0.9);
      float amount = (0.4 + 0.9 * totalAudio) * ebb;
      return profile * mountainHeight * 3.0 * romanesco * amount * isFerrofluid;
    }

    vec3 calcLandscape(vec3 pos) {
      float e = 0.18; // broad step -> spikes lean to follow the big contours
      float b0 = baseTerrain(pos);
      float bx = baseTerrain(pos + vec3(e, 0.0, 0.0));
      float by = baseTerrain(pos + vec3(0.0, e, 0.0));
      vec3 baseN = normalize(cross(vec3(e, 0.0, bx - b0), vec3(0.0, e, by - b0)));
      float s = spikeField(pos);
      return pos + vec3(0.0, 0.0, b0) + baseN * s;
    }
  `;

  // Upstream main(): displaced position + central-difference normal at
  // inc = 0.02, expressed against objectNormal so defaultnormal_vertex does
  // the normalMatrix transform. Guarded so degenerate differences can never
  // normalize() into NaN and blank the mesh.
  const LAND_BODY = /* glsl */ `
    float inc = 0.02;
    vec3 np = calcLandscape(position);
    vec3 npDX = calcLandscape(position + vec3(inc, 0.0, 0.0));
    vec3 npDY = calcLandscape(position + vec3(0.0, inc, 0.0));
    vec3 dTan = npDX - np;
    vec3 dBit = npDY - np;
    if (length(dTan) > 1e-9 && length(dBit) > 1e-9) {
      vec3 nrm = cross(normalize(dTan), normalize(dBit));
      if (length(nrm) > 1e-9) { objectNormal = normalize(nrm); }
    }
    vec3 transformed = np;
  `;

  landMat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, landUniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\n' + LAND_PARS)
      // Recompute the normal before three.js transforms it, then supply our
      // own `transformed` in place of the default begin_vertex assignment.
      .replace('#include <defaultnormal_vertex>', LAND_BODY + '\n#include <defaultnormal_vertex>')
      .replace('#include <begin_vertex>', '');
  };
  landMat.customProgramCacheKey = () => 'swaycommand-valley';

  const land = new THREE.Mesh(landGeo, landMat);
  land.frustumCulled = false; // displaced far past the plane's bounds
  land.rotation.x = -Math.PI / 2.3; // upstream
  land.position.set(0, -1.15, -8); // upstream
  scene.add(land);

  // --- plasma sun: fbm plasma core + additive fresnel halo (upstream 3b) ----
  // plasma-shader.ts, maths verbatim, GLSL3 form.
  const plasmaVS = /* glsl */ `
    out vec3 vPos;
    out vec3 vNrm;
    out vec3 vView;
    void main() {
      vPos = position;
      vNrm = normalize(normalMatrix * normal);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vView = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }`;
  const plasmaFS = /* glsl */ `
    uniform float time;
    uniform float intensity;
    uniform vec3 colorLow;
    uniform vec3 colorHigh;
    in vec3 vPos;
    in vec3 vNrm;
    in vec3 vView;
    out vec4 fragColor;

    float hash(vec3 p) {
      p = fract(p * 0.3183099 + 0.1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    float vnoise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(hash(i + vec3(0.0, 0.0, 0.0)), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
                     mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
                 mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
                     mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
    }
    float fbm(vec3 p) {
      float v = 0.0;
      float a = 0.55;
      for (int i = 0; i < 5; i++) {
        v += a * vnoise(p);
        p *= 2.03;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec3 q = normalize(vPos);
      float n  = fbm(q * 3.0 + vec3(0.0, time * 0.6, time * 0.3));
      float n2 = fbm(q * 6.5 - vec3(time * 0.45, 0.0, time * 0.5));
      float plasma = pow(clamp(n * 0.65 + n2 * 0.6, 0.0, 1.0), 1.6);
      float fres = pow(1.0 - max(dot(normalize(vNrm), normalize(vView)), 0.0), 2.5);
      vec3 col = mix(colorLow, colorHigh, plasma);
      col += colorHigh * fres * 0.55;
      col += vec3(1.0, 0.85, 1.0) * pow(plasma, 5.0) * 0.5; // hot white filament cores
      fragColor = vec4(col * intensity, 1.0);
    }`;
  const haloFS = /* glsl */ `
    uniform vec3 color;
    in vec3 vPos;
    in vec3 vNrm;
    in vec3 vView;
    out vec4 fragColor;
    void main() {
      float fres = pow(1.0 - max(dot(normalize(vNrm), normalize(vView)), 0.0), 3.0);
      fragColor = vec4(color * fres, fres);
    }`;

  const sun = new THREE.Group();
  const plasmaMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: {
      time: { value: 0 },
      intensity: { value: 0.85 },
      colorLow: { value: new THREE.Color(0x2a0a4e) },
      colorHigh: { value: new THREE.Color(0xc24dff) },
    },
    vertexShader: plasmaVS,
    fragmentShader: plasmaFS,
  });
  const sunCoreGeo = new THREE.IcosahedronGeometry(3.0, 6);
  const sunCore = new THREE.Mesh(sunCoreGeo, plasmaMat);
  const haloMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: { color: { value: new THREE.Color(0x9b30ff) } },
    vertexShader: plasmaVS,
    fragmentShader: haloFS,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const sunHaloGeo = new THREE.IcosahedronGeometry(4.7, 5);
  const sunHalo = new THREE.Mesh(sunHaloGeo, haloMat);
  sun.add(sunHalo, sunCore);
  sun.position.set(0, 2.4, -16); // upstream SUN_POS, behind the ridgeline
  scene.add(sun);

  // The plasma actually lights the landscape: a point light at the sun.
  const sunLight = new THREE.PointLight(0xc24dff, 2.4, 70, 1.3);
  sunLight.position.set(0, 2.4, -16);
  scene.add(sunLight);

  // --- starfield sky (upstream 3c): fog:false so it survives the fog-to-black
  // horizon; opacity rides the highs.
  const STARS = 240;
  const starPos = new Float32Array(STARS * 3);
  for (let i = 0; i < STARS; i++) {
    // upstream golden-angle scatter across a wide swath of sky
    const gx = ((i * 0.61803398875) % 1) * 2 - 1;
    const gy = (i * 0.7548776662) % 1;
    const gz = (i * 0.5698402909) % 1;
    starPos[i * 3] = gx * 34;
    starPos[i * 3 + 1] = 2.5 + gy * 24;
    starPos[i * 3 + 2] = -20 - gz * 26;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0x8fa8d8,
    size: 0.13,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    fog: false,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // --- upstream three-point studio + neon rig (positions/intensities kept) --
  const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.4);
  keyLight.position.set(6, 9, 5);
  const rimLight = new THREE.DirectionalLight(0xb14dff, 0.9);
  rimLight.position.set(-6, -3, -4);
  const fillLight = new THREE.DirectionalLight(0x00d2ff, 0.4);
  fillLight.position.set(0, -6, 5);
  const ambient = new THREE.AmbientLight(0x0c0714, 0.15);
  scene.add(keyLight, rimLight, fillLight, ambient);

  // --- preallocated state ---------------------------------------------------
  const prevPads = new Float32Array(PADS);
  const lookTarget = new THREE.Vector3(0, 2.2, -6.5); // upstream lookAt
  // Live per-scene bloom, upstream's UnrealBloomPass numbers; strikes flare it.
  const bloom = { strength: 1.65, radius: 0.4, threshold: 0.6 };
  let tAccum = 0; // shader clock, in upstream 60 Hz frame units
  let pTime = 0; // plasma clock
  let envB = 0; // slow band envelopes (upstream envK = 0.035/frame)
  let envM = 0;
  let envH = 0;
  let envL = 0;
  let swaySm = 0; // smoothed sway -> ferrofluid morph + scroll bias
  let pressSm = 0; // smoothed press -> dive
  let camX = 0; // xy.x -> lateral drift
  let shock = 0; // strike -> seismic surge + flare

  const approach = (cur, to, tau, dt) => cur + (to - cur) * (1 - Math.exp(-dt / tau));

  return {
    scene,
    camera,
    bloom,
    update(dt, t, io) {
      // Upstream's slow shared envelopes: k = 0.035 per 60 Hz frame.
      const k = Math.min(1, 0.035 * dt * 60);
      envB += (io.bands.bass - envB) * k;
      envM += (io.bands.mid - envM) * k;
      envH += (io.bands.high - envH) * k;
      envL += (io.level - envL) * k;

      // STRIKE = seismic hit: any pad rising edge kicks the shockwave.
      for (let i = 0; i < PADS; i++) {
        if (io.pads[i] > 0.25 && io.pads[i] > prevPads[i] + 0.06) shock = 1;
        prevPads[i] = io.pads[i];
      }
      shock *= Math.exp(-dt * 2.2); // ~1.5 s back to rest

      // SWAY = the signature morph: liquid-chrome ridges -> magnetic spike
      // terrain (upstream's two landscape modes, crossfaded live) and faster
      // flight. Speed goes through the accumulator, not the uniform (header).
      swaySm = approach(swaySm, io.gestures.sway, 0.3, dt);
      landUniforms.isFerrofluid.value = swaySm;
      const scroll = 0.6 + swaySm * 1.2;
      // Upstream: time += dt * 0.012 * scrollSpeed * (1 + bass * 0.6), dt in frames.
      tAccum += dt * 60 * 0.012 * scroll * (1 + envB * 0.6);
      landUniforms.time.value = tAccum;
      landUniforms.audioData.value.set(envB, envM, envH, envL);
      landUniforms.mountainHeight.value = MOUNTAIN_HEIGHT + shock * 1.2;

      // Plasma sun: turbulence drifts, brightens on bass/mids, flares on
      // strikes and PULSE, and its light paints the terrain.
      pTime += dt * 60 * 0.02; // upstream: time += dt * 0.02, dt in frames
      plasmaMat.uniforms.time.value = pTime;
      plasmaMat.uniforms.intensity.value =
        (0.75 + 0.45 * envB + 0.2 * envM + shock * 0.9 + io.gestures.pulse * 0.7) * io.intensity;
      sunCore.scale.setScalar(1 + 0.06 * Math.sin(t * 3) + 0.3 * envB + shock * 0.2);
      sunHalo.scale.setScalar(1 + 0.1 * Math.sin(t * 4) + 0.4 * envM + io.gestures.pulse * 0.15);
      sunLight.intensity = (2.4 + envB * 1.0 + shock * 1.1) * io.intensity;

      // Palette tint (rule 1): copy into the uniforms, no allocation.
      plasmaMat.uniforms.colorHigh.value.copy(io.palette[1]);
      plasmaMat.uniforms.colorLow.value.copy(io.palette[3]).multiplyScalar(0.4);
      haloMat.uniforms.color.value.copy(io.palette[0]);
      sunLight.color.copy(io.palette[1]);

      // Sky: stars twinkle with the highs; PULSE surges them. Upstream's
      // 0.0006/frame roll of the star field around the view axis is dropped
      // (project rule: nothing rotates by itself), the sky holds still
      // behind the scrolling terrain.
      starMat.color.copy(io.palette[2]);
      starMat.opacity = 0.3 + 0.45 * envH + io.gestures.pulse * 0.45;

      // PRESS = dive INTO the valley: the camera sinks toward the deck while
      // the fog pulls in. XY steers: x drifts laterally, y sets the eye line.
      pressSm = approach(pressSm, io.gestures.press, 0.18, dt);
      camX = approach(camX, (io.xy.x - 0.5) * 2.4, 0.3, dt);
      const eyeY = 0.6 + (io.xy.y - 0.5) * 1.2 - pressSm * 0.85;
      camera.position.set(camX, eyeY, 2.4);
      lookTarget.set(camX * 0.65, 2.2 - pressSm * 1.4, -6.5);
      camera.lookAt(lookTarget);
      fog.near = 5 - pressSm * 2;

      // Light rig recoloured from the palette (rule 1).
      keyLight.color.copy(io.palette[4]);
      rimLight.color.copy(io.palette[1]);
      fillLight.color.copy(io.palette[2]);
      ambient.color.copy(io.palette[3]);
      keyLight.intensity = 1.4 * io.intensity;
      rimLight.intensity = (0.9 + io.beat * 0.7) * io.intensity;
      fillLight.intensity = 0.4 * io.intensity;
      landMat.envMapIntensity = 1.3 + envH * 0.5;

      // Bloom flares with the seismic hit.
      bloom.strength = 1.65 + shock * 0.6;
    },
    resize(w, h) {
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    },
    dispose() {
      landGeo.dispose();
      landMat.dispose(); // envMap is ctx.environment, engine-owned, kept
      sunCoreGeo.dispose();
      plasmaMat.dispose();
      sunHaloGeo.dispose();
      haloMat.dispose();
      starGeo.dispose();
      starMat.dispose();
    },
  };
}
