// Quantum Lattice, the real lattice engine from GANTASMO's theDAW: an
// instanced node-and-beam structure that MORPHS between four sacred
// geometries (Grand Torus, Cubic Frame, Merkabah Star, Cosmos Cage) around a
// cuboctahedron core with a reactor at its heart, under UnrealBloom.
//
// Ported from theDAW frontend/src/lib/quantumLattice.ts
// (https://github.com/gantasmo/theDAW). That file carries no SPDX header, so
// the repository licence applies: MIT License, Copyright (c) 2026 Stability AI.
// Its own header states it is meant to be copied into the VJ tree.
//
// CHANGES FROM THE ORIGINAL:
//   * Full fidelity this time: the complete 373-node body (360 strand nodes +
//     12 cuboctahedron core vertices + the center reactor) and the complete
//     756-beam topology (360 strand rings + 360 inter-strand rungs + 24 core
//     edges + 12 reactor spokes), positions easing toward their targets at
//     upstream's 0.06/frame so geometry changes POUR rather than snap, the
//     morphEnergy shockwave, per-shape core scales, node scale factors, and
//     bloom multipliers.
//   * Bloom is real now: the engine runs UnrealBloomPass per scene, and this
//     instance mutates its live bloom (base 0.2 × shape multiplier, + volume,
//     + morph shockwave, radius 0.35, threshold 0.82, upstream's numbers).
//   * Both fragment shaders' maths verbatim (fresnel/energyFlux/grid/burst
//     beams, thermal/storm/reactor nodes), upstream fresnel powers (beams 3.0,
//     nodes 2.5) and heartbeat default 6.5, written in GLSL3 form
//     (glslVersion: THREE.GLSL3; `in` / `out` in place of `varying`, a
//     declared `out vec4 fragColor` in place of gl_FragColor).
//   * Upstream's four named palettes become io.palette on the four color
//     roles, as the scene contract requires.
//   * Control morphs drive the engine's own parameters, not object motion:
//     STRIKE advances the geometry and fires the full morph shockwave
//     (upstream's beat-cycle mechanism, hand-triggered); SWAY morphs the
//     filament field (waveDetail + a continuous morph push, so the lattice
//     writhes and unravels); PULSE surges bloom and the reactor heartbeat;
//     PRESS dives the camera; XY steers the orbit. Nothing merely rotates.

export const meta = {
  id: 'lattice',
  name: 'Quantum Lattice',
  mood: 'crystalline',
  bloom: { strength: 0.2, radius: 0.35, threshold: 0.82 },
};

export const QUANTUM_GEOMETRY_NAMES = ['Grand Torus', 'Cubic Frame', 'Merkabah Star', 'Cosmos Cage'];

const N_POINTS = 120;
const STRANDS = 3;
const TOTAL = N_POINTS * STRANDS; // 360 strand points
const R_BASE = 3.0;
const R_MINOR = 1.0;
const CORE_SCALES = [1.25, 0.75, 1.05, 0.6];
const CORE_NODE_FACTOR = [1.0, 0.8, 0.65, 0.5];
const SHAPE_SCALE = [1.0, 0.8, 0.55, 0.45];
const BLOOM_MUL = [1.0, 0.78, 0.42, 0.32];

export function createScene(ctx) {
  const { THREE, quality } = ctx;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020005, 0.025); // upstream
  const camera = new THREE.PerspectiveCamera(45, ctx.width / Math.max(1, ctx.height), 0.1, 100);

  const sphereSeg = quality.tier === 'low' ? 8 : quality.tier === 'high' ? 16 : 12;

  const PAL = {
    uColorCyan: { value: new THREE.Color(0x00ffff) },
    uColorMagenta: { value: new THREE.Color(0xff007f) },
    uColorGold: { value: new THREE.Color(0xffaa00) },
    uColorWhite: { value: new THREE.Color(0xffffff) },
  };

  const nodeUniforms = {
    uTime: { value: 0 },
    uSpeed: { value: 1.2 },
    uFresnelPow: { value: 2.5 },
    uHeartbeat: { value: 6.5 },
    uIntensity: { value: 1 },
    ...PAL,
  };
  const beamUniforms = {
    uTime: { value: 0 },
    uSpeed: { value: 1.2 },
    uWaveScale: { value: 1 },
    uFresnelPow: { value: 3.0 },
    uGridIntensity: { value: 0.45 },
    uIntensity: { value: 1 },
    ...PAL,
  };

  const VERT = /* glsl */ `
    out vec2 vUv;
    out vec3 vNormalW;
    out vec3 vViewDir;
    void main() {
      vUv = uv;
      vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
      vNormalW = normalize(normalMatrix * mat3(instanceMatrix) * normal);
      vViewDir = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }`;

  // Upstream beam/tube shader, verbatim chain.
  const beamMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: beamUniforms,
    vertexShader: VERT,
    fragmentShader: /* glsl */ `
      uniform float uTime, uSpeed, uWaveScale, uFresnelPow, uGridIntensity, uIntensity;
      uniform vec3 uColorCyan, uColorMagenta, uColorGold, uColorWhite;
      in vec2 vUv;
      in vec3 vNormalW;
      in vec3 vViewDir;
      out vec4 fragColor;
      void main() {
        float fresnel = pow(clamp(1.0 - abs(dot(vViewDir, vNormalW)), 0.0, 1.0), uFresnelPow);
        float speedFactor = uTime * uSpeed * 4.0;
        float wave1 = sin(vUv.y * 18.0 * uWaveScale - speedFactor);
        float wave2 = cos(vUv.y * 36.0 * uWaveScale + speedFactor * 0.8);
        float wave3 = sin(vUv.y * 90.0 * uWaveScale - speedFactor * 1.5) * 0.4;
        float energyFlux = smoothstep(0.2, 0.8, (wave1 * wave2 + wave3) * 0.5 + 0.5);
        float wireX = sin(vUv.x * 3.14159265 * 4.0);
        float lineX = smoothstep(max(fwidth(wireX), 0.0001) * 1.5, 0.0, abs(wireX));
        float wireY = sin(vUv.y * 3.14159265 * 30.0);
        float lineY = smoothstep(max(fwidth(wireY), 0.0001) * 1.5, 0.0, abs(wireY));
        float grid = max(lineX, lineY);
        vec3 surfaceColor = mix(uColorMagenta * 0.2, uColorCyan, fresnel);
        vec3 activeFilament = mix(surfaceColor, uColorMagenta * 1.8, energyFlux);
        vec3 finalColor = mix(activeFilament, uColorGold * 1.5, grid * uGridIntensity);
        float burst = smoothstep(0.96, 1.0, sin(vUv.y * 6.0 - speedFactor * 1.8));
        finalColor = mix(finalColor, uColorWhite, burst * 0.85);
        float alpha = mix(0.12 + fresnel * 0.65, 1.0, (grid * 0.75) + (energyFlux * 0.35));
        fragColor = vec4(clamp(finalColor * uIntensity, vec3(0.0), vec3(8.0)), clamp(alpha, 0.0, 1.0));
      }`,
  });

  // Upstream node/sphere shader, verbatim chain.
  const nodeMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: nodeUniforms,
    vertexShader: VERT,
    fragmentShader: /* glsl */ `
      uniform float uTime, uSpeed, uFresnelPow, uHeartbeat, uIntensity;
      uniform vec3 uColorCyan, uColorMagenta, uColorGold, uColorWhite;
      in vec2 vUv;
      in vec3 vNormalW;
      in vec3 vViewDir;
      out vec4 fragColor;
      void main() {
        float fresnel = pow(clamp(1.0 - abs(dot(vViewDir, vNormalW)), 0.0, 1.0), uFresnelPow);
        float speedFactor = uTime * uSpeed * 3.2;
        float distFromCenter = length(vUv - vec2(0.5));
        float thermalWave = sin(distFromCenter * 28.0 - speedFactor) * 0.5 + 0.5;
        float stormNoise = sin(vUv.x * 24.0 + speedFactor) * cos(vUv.y * 24.0 - speedFactor);
        float activeSolar = smoothstep(0.3, 0.9, stormNoise * thermalWave);
        vec3 basePlasma = mix(uColorMagenta, uColorCyan, fresnel);
        vec3 solarLattice = mix(basePlasma, uColorGold * 1.8, activeSolar);
        float centralReactor = smoothstep(0.28, 0.0, distFromCenter);
        vec3 finalColor = mix(solarLattice, uColorWhite, centralReactor * 0.95);
        float heartbeat = sin(uTime * uHeartbeat) * 0.5 + 0.5;
        finalColor += uColorGold * (fresnel * heartbeat * 0.4);
        float alpha = mix(0.3 + fresnel * 0.7, 1.0, activeSolar * 0.5 + centralReactor * 0.5);
        fragColor = vec4(clamp(finalColor * uIntensity, vec3(0.0), vec3(8.0)), alpha);
      }`,
  });

  // --- geometry tables (upstream, hoisted) -----------------------------------

  const CUBE_V = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
  ];
  const CUBE_E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  const TETRA_A = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
  const TETRA_B = [[-1, -1, -1], [-1, 1, 1], [1, -1, 1], [1, 1, -1]];
  const TETRA_E = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
  const OCTA_V = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  const OCTA_E = [[0, 2], [2, 1], [1, 3], [3, 0], [0, 4], [1, 4], [2, 4], [3, 4], [0, 5], [1, 5], [2, 5], [3, 5]];
  const CUBE_SCALES = [3.3, 2.2, 1.1];
  const GOLDEN = (1 + Math.sqrt(5)) / 2;

  // Cuboctahedron core: 12 vertices; edges are the vertex pairs at squared
  // distance 2 (upstream's 1.9..2.1 window), 24 of them.
  const CUBO_V = [
    [1, 1, 0], [1, -1, 0], [-1, 1, 0], [-1, -1, 0],
    [1, 0, 1], [1, 0, -1], [-1, 0, 1], [-1, 0, -1],
    [0, 1, 1], [0, 1, -1], [0, -1, 1], [0, -1, -1],
  ];
  const CUBO_E = [];
  for (let i = 0; i < CUBO_V.length; i++) {
    for (let j = i + 1; j < CUBO_V.length; j++) {
      const dx = CUBO_V[i][0] - CUBO_V[j][0];
      const dy = CUBO_V[i][1] - CUBO_V[j][1];
      const dz = CUBO_V[i][2] - CUBO_V[j][2];
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > 1.9 && d2 < 2.1) CUBO_E.push([i, j]);
    }
  }

  const NODE_COUNT = TOTAL + CUBO_V.length + 1; // 373
  const BEAM_COUNT = TOTAL + TOTAL + CUBO_E.length + CUBO_V.length; // 756

  const sphereGeo = new THREE.SphereGeometry(1, sphereSeg, sphereSeg);
  const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1, false);
  const nodes = new THREE.InstancedMesh(sphereGeo, nodeMat, NODE_COUNT);
  const beams = new THREE.InstancedMesh(cylGeo, beamMat, BEAM_COUNT);
  nodes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  beams.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  nodes.frustumCulled = false;
  beams.frustumCulled = false;
  scene.add(nodes, beams);

  // --- preallocated state ----------------------------------------------------

  const cur = new Float32Array(TOTAL * 3); // eased strand positions
  const coreCur = new Float32Array(CUBO_V.length * 3);
  const prevPads = new Float32Array(16);
  const m4 = new THREE.Matrix4();
  const q4 = new THREE.Quaternion();
  const qI = new THREE.Quaternion();
  const s3 = new THREE.Vector3();
  const p3 = new THREE.Vector3();
  const a3 = new THREE.Vector3();
  const b3 = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const lookTarget = new THREE.Vector3(0, 0, 0);

  function lerpEdge(out, verts, edge, f, scale) {
    const A = verts[edge[0]];
    const B = verts[edge[1]];
    out.set(A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f, A[2] + (B[2] - A[2]) * f).multiplyScalar(scale);
  }

  // Upstream computeTargetCoordinate, verbatim.
  function targetCoord(shape, s, i, time, waveSpeed, out) {
    const alpha = (s * Math.PI * 2) / STRANDS;
    const phi = (i / N_POINTS) * Math.PI * 2;
    if (shape === 0) {
      const p = 3;
      const qq = 7;
      const deltaR = Math.sin(5 * phi - time * waveSpeed) * Math.cos(3 * phi + time * waveSpeed) * 0.15;
      const rCur = R_MINOR + deltaR;
      const ring = R_BASE + rCur * Math.cos(qq * phi + alpha);
      out.set(ring * Math.cos(p * phi), ring * Math.sin(p * phi), rCur * Math.sin(qq * phi + alpha));
    } else if (shape === 1) {
      const edge = CUBE_E[Math.floor(i / 10) % 12];
      lerpEdge(out, CUBE_V, edge, (i % 10) / 9, CUBE_SCALES[s]);
      out.multiplyScalar(1 + Math.sin(time * 2 + i * 0.1) * 0.02);
    } else if (shape === 2) {
      if (s === 0) lerpEdge(out, TETRA_A, TETRA_E[Math.floor(i / 20) % 6], (i % 20) / 19, 2.6);
      else if (s === 1) lerpEdge(out, TETRA_B, TETRA_E[Math.floor(i / 20) % 6], (i % 20) / 19, 2.6);
      else lerpEdge(out, OCTA_V, OCTA_E[Math.floor(i / 10) % 12], (i % 10) / 9, 1.6);
    } else {
      const index = s * N_POINTS + i;
      const y = 1 - (index / (TOTAL - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = 2 * Math.PI * GOLDEN * index;
      const baseRad = 2.6 + Math.sin(time * 1.5 + index * 0.05) * 0.1;
      out.set(Math.cos(theta) * radiusAtY, y, Math.sin(theta) * radiusAtY).multiplyScalar(baseRad);
    }
  }

  // Seed the eased positions on shape 0 so the first frames pour into place.
  for (let s = 0; s < STRANDS; s++) {
    for (let i = 0; i < N_POINTS; i++) {
      targetCoord(0, s, i, 0, 1.2, p3);
      const idx = (s * N_POINTS + i) * 3;
      cur[idx] = p3.x;
      cur[idx + 1] = p3.y;
      cur[idx + 2] = p3.z;
    }
  }
  for (let i = 0; i < CUBO_V.length; i++) {
    coreCur[i * 3] = CUBO_V[i][0] * 1.25;
    coreCur[i * 3 + 1] = CUBO_V[i][1] * 1.25;
    coreCur[i * 3 + 2] = CUBO_V[i][2] * 1.25;
  }

  let activeShape = 0;
  let morphEnergy = 0;
  let coreScale = CORE_SCALES[0];
  let scaleFactor = SHAPE_SCALE[0];
  let bloomMul = BLOOM_MUL[0];
  let bassEnv = 0;
  let volEnv = 0;
  let beatArmed = true;
  let beatCooldown = 0;
  let tAccum = 0;
  let az = 0.6;
  let el = 0.15;

  const bloom = { strength: 0.2, radius: 0.35, threshold: 0.82 };
  const approach = (v, to, tau, dt) => v + (to - v) * (1 - Math.exp(-dt / tau));

  function setBeam(idx, ax, ay, azz, bx, by, bz, radius) {
    a3.set(ax, ay, azz);
    b3.set(bx, by, bz);
    dir.subVectors(b3, a3);
    const len = dir.length();
    if (len < 1e-4) {
      s3.setScalar(0);
      m4.compose(a3, qI, s3);
    } else {
      p3.addVectors(a3, b3).multiplyScalar(0.5);
      dir.divideScalar(len);
      q4.setFromUnitVectors(up, dir);
      s3.set(radius, len, radius);
      m4.compose(p3, q4, s3);
    }
    beams.setMatrixAt(idx, m4);
  }

  return {
    scene,
    camera,
    bloom,
    get shapeName() {
      return QUANTUM_GEOMETRY_NAMES[activeShape];
    },
    update(dt, t, io) {
      // Upstream envelopes: 25 ms attack, 180 ms release (bass + volume).
      const tcUp = 1 - Math.exp(-dt / 0.025);
      const tcDn = 1 - Math.exp(-dt / 0.18);
      bassEnv += (io.bands.bass - bassEnv) * (io.bands.bass > bassEnv ? tcUp : tcDn);
      volEnv += (io.level - volEnv) * (io.level > volEnv ? tcUp : tcDn);

      // A STRIKE advances the geometry and fires the full morph shockwave,
      // upstream's beat-cycle mechanism, triggered by the hand. The bass
      // hysteresis gate keeps working underneath it.
      beatCooldown = Math.max(0, beatCooldown - dt);
      if (bassEnv < 0.3) beatArmed = true;
      let switched = false;
      if (beatArmed && beatCooldown <= 0 && bassEnv > 0.55) {
        activeShape = (activeShape + 1) % 4;
        morphEnergy = 1;
        beatArmed = false;
        beatCooldown = 0.18;
        switched = true;
      }
      for (let i = 0; i < 16; i++) {
        if (!switched && io.pads[i] > 0.25 && io.pads[i] > prevPads[i] + 0.06) {
          activeShape = (activeShape + 1) % 4;
          morphEnergy = 1;
          switched = true;
        }
        prevPads[i] = io.pads[i];
      }
      // bass keeps kicking the shockwave (upstream); fast decay between kicks
      morphEnergy = Math.max(morphEnergy * Math.pow(0.05, dt), bassEnv * 0.6);

      // SWAY morphs the filament field: wave detail and a continuous morph
      // push that makes the whole lattice writhe off its ideal form.
      const sway = io.gestures.sway;
      const waveSpeed = 1.2 + io.bands.mid * 0.8;
      const morphAmount = 0.15 + sway * 0.45 + bassEnv * 0.25;
      tAccum += dt;

      beamUniforms.uTime.value = tAccum;
      nodeUniforms.uTime.value = tAccum;
      beamUniforms.uSpeed.value = waveSpeed;
      nodeUniforms.uSpeed.value = waveSpeed;
      beamUniforms.uWaveScale.value = 0.5 + sway * 2.2;
      beamUniforms.uGridIntensity.value = 0.45 + io.bands.high * 0.6;
      nodeUniforms.uHeartbeat.value = 6.5 + io.gestures.pulse * 6 + bassEnv * 3;
      beamUniforms.uIntensity.value = io.intensity;
      nodeUniforms.uIntensity.value = io.intensity;

      // per-shape eased factors (upstream 0.06/frame at 60 fps)
      const k = 1 - Math.pow(1 - 0.06, dt * 60);
      coreScale += (CORE_SCALES[activeShape] - coreScale) * k;
      scaleFactor += (SHAPE_SCALE[activeShape] - scaleFactor) * k;
      bloomMul += (BLOOM_MUL[activeShape] - bloomMul) * k;

      // live bloom: base × shape multiplier + volume drive + shockwave + pulse
      bloom.strength = (0.2 + volEnv * 0.6) * bloomMul + morphEnergy * 0.5 + io.gestures.pulse * 0.8;

      // strand positions pour toward their targets; the shockwave pushes them
      // outward along their own directions while morphEnergy rings
      const shock = Math.sin(tAccum * 25) * morphEnergy * morphAmount;
      for (let s = 0; s < STRANDS; s++) {
        for (let i = 0; i < N_POINTS; i++) {
          targetCoord(activeShape, s, i, tAccum, waveSpeed, p3);
          if (morphEnergy > 0.001) {
            const len = p3.length() || 1;
            p3.addScaledVector(p3, shock / len);
          }
          const idx = (s * N_POINTS + i) * 3;
          cur[idx] += (p3.x - cur[idx]) * k;
          cur[idx + 1] += (p3.y - cur[idx + 1]) * k;
          cur[idx + 2] += (p3.z - cur[idx + 2]) * k;
        }
      }
      const corePulse = coreScale + Math.sin(tAccum * 2.5) * 0.08;
      for (let i = 0; i < CUBO_V.length; i++) {
        coreCur[i * 3] += (CUBO_V[i][0] * corePulse - coreCur[i * 3]) * k;
        coreCur[i * 3 + 1] += (CUBO_V[i][1] * corePulse - coreCur[i * 3 + 1]) * k;
        coreCur[i * 3 + 2] += (CUBO_V[i][2] * corePulse - coreCur[i * 3 + 2]) * k;
      }

      // nodes: strands, then core vertices, then the reactor
      let n = 0;
      const nodeScale = 0.065 * scaleFactor * (1 + morphEnergy * 0.45);
      for (let i = 0; i < TOTAL; i++) {
        p3.set(cur[i * 3], cur[i * 3 + 1], cur[i * 3 + 2]);
        s3.setScalar(nodeScale);
        m4.compose(p3, qI, s3);
        nodes.setMatrixAt(n++, m4);
      }
      const coreFactor = CORE_NODE_FACTOR[activeShape];
      for (let i = 0; i < CUBO_V.length; i++) {
        p3.set(coreCur[i * 3], coreCur[i * 3 + 1], coreCur[i * 3 + 2]);
        s3.setScalar(0.115 * coreFactor);
        m4.compose(p3, qI, s3);
        nodes.setMatrixAt(n++, m4);
      }
      p3.set(0, 0, 0);
      s3.setScalar((0.2 + Math.sin(tAccum * 5) * 0.05) * coreFactor);
      m4.compose(p3, qI, s3);
      nodes.setMatrixAt(n++, m4);
      nodes.instanceMatrix.needsUpdate = true;

      // beams: strand rings, inter-strand rungs, core edges, reactor spokes
      let b = 0;
      const beamR = 0.015 * scaleFactor;
      for (let s = 0; s < STRANDS; s++) {
        for (let i = 0; i < N_POINTS; i++) {
          const i0 = (s * N_POINTS + i) * 3;
          const i1 = (s * N_POINTS + ((i + 1) % N_POINTS)) * 3;
          setBeam(b++, cur[i0], cur[i0 + 1], cur[i0 + 2], cur[i1], cur[i1 + 1], cur[i1 + 2], beamR);
        }
      }
      for (let i = 0; i < N_POINTS; i++) {
        for (let s = 0; s < STRANDS; s++) {
          const i0 = (s * N_POINTS + i) * 3;
          const i1 = (((s + 1) % STRANDS) * N_POINTS + i) * 3;
          setBeam(b++, cur[i0], cur[i0 + 1], cur[i0 + 2], cur[i1], cur[i1 + 1], cur[i1 + 2], beamR * 0.65);
        }
      }
      for (let e = 0; e < CUBO_E.length; e++) {
        const i0 = CUBO_E[e][0] * 3;
        const i1 = CUBO_E[e][1] * 3;
        setBeam(b++, coreCur[i0], coreCur[i0 + 1], coreCur[i0 + 2], coreCur[i1], coreCur[i1 + 1], coreCur[i1 + 2], beamR * 1.6);
      }
      for (let i = 0; i < CUBO_V.length; i++) {
        setBeam(b++, coreCur[i * 3], coreCur[i * 3 + 1], coreCur[i * 3 + 2], 0, 0, 0, beamR * 0.8);
      }
      beams.instanceMatrix.needsUpdate = true;

      // palette onto upstream's color roles; the white role stays near-white
      // (it is the reactor's specular burn, not a palette voice) with a
      // whisper of the palette's warm slot.
      PAL.uColorCyan.value.copy(io.palette[2]);
      PAL.uColorMagenta.value.copy(io.palette[0]);
      PAL.uColorGold.value.copy(io.palette[3]);
      PAL.uColorWhite.value.setRGB(1, 1, 1).lerp(io.palette[4], 0.15);

      // XY steers the orbit; PRESS dives toward the reactor.
      az = approach(az, io.xy.x * Math.PI * 2, 0.28, dt);
      el = approach(el, (io.xy.y - 0.5) * 1.6, 0.28, dt);
      const rad = 9.5 - io.gestures.press * 4.2 - morphEnergy * 0.5;
      const ce = Math.cos(el);
      camera.position.set(Math.sin(az) * ce * rad, Math.sin(el) * rad, Math.cos(az) * ce * rad);
      camera.up.set(0, 1, 0);
      camera.lookAt(lookTarget);
    },
    resize(w, h) {
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    },
    dispose() {
      nodes.dispose();
      beams.dispose();
      sphereGeo.dispose();
      cylGeo.dispose();
      nodeMat.dispose();
      beamMat.dispose();
    },
  };
}
