// Swarm, a stateless GPU particle cloud orbiting an attractor that chases
// the hand. Every particle's position is computed in the vertex shader from
// pure random seeds + time (layered sin/cos pseudo-curl), so the CPU only
// pushes uniforms: bass swells the orbits, beats detonate a radial burst,
// press clenches the swarm, and sway morphs the flocking itself, one tight
// murmuration glides apart into five sub-flock cells parked on a fixed ring
// while each cell's cohesion radius pulls in. A strike is a scatter shock: a
// velocity burst plus an attractor re-seed the swarm reforms from over ~2 s,
// with the cells re-slotting on their ring. Nothing turns by itself: the
// ring never revolves (the cells breathe radially and bob instead), and the
// camera holds a fixed eye, only easing its look toward the attractor as it
// chases the hand, each particle's pseudo-curl path is per-particle flow,
// not a turning cloud. One Points draw call.
// Scene contract: docs/SCENE_CONTRACT.md.

export const meta = { id: 'swarm', name: 'Swarm', mood: 'hypnotic' };

const TAU = Math.PI * 2;

export function createScene(ctx) {
  const { THREE, quality } = ctx;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, ctx.width / ctx.height, 0.1, 400);
  camera.position.set(0, 4, 30);

  // --- geometry: nothing but random seeds; the shader does all the motion.
  // position = per-particle scatter direction in [-1,1]^3 (doubles as a seed),
  // aSeed = (phase, speed, radius, colorMix) each in [0,1].
  const count = quality.particles;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = Math.random() * 2 - 1;
    pos[i * 3 + 1] = Math.random() * 2 - 1;
    pos[i * 3 + 2] = Math.random() * 2 - 1;
    seed[i * 4] = Math.random();
    seed[i * 4 + 1] = Math.random();
    seed[i * 4 + 2] = Math.random();
    seed[i * 4 + 3] = Math.random();
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));

  const mat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uAttractor: { value: new THREE.Vector3(0, 0, 0) }, // lagged hand position
      uBass: { value: 0 },
      uBurst: { value: 0 }, // beat/pad impulse, decayed CPU-side
      uPress: { value: 0 },
      uMorph: { value: 0 },    // flocking morph: 0 = one murmuration, 1 = split cells
      uCellSeed: { value: 0 }, // cell ring phase, re-seeded by strikes
      uHigh: { value: 0 },
      uSize: { value: 2.0 * (ctx.height / 1080) }, // resolution-stable point scale
      // more particles -> each one dimmer, so brightness stays tier-stable
      uAlpha: { value: Math.min(1, Math.max(0.3, 24000 / count)) },
      uColorA: { value: new THREE.Color(1, 1, 1) },
      uColorB: { value: new THREE.Color(1, 1, 1) },
    },
    vertexShader: /* glsl */ `
      in vec4 aSeed; // x phase, y speed, z radius, w color mix
      uniform float uTime;
      uniform vec3 uAttractor;
      uniform float uBass;
      uniform float uBurst;
      uniform float uPress;
      uniform float uMorph;
      uniform float uCellSeed;
      uniform float uHigh;
      uniform float uSize;
      out float vMix;
      out float vTw;
      void main() {
        float ph = aSeed.x * 6.2831853;
        float sp = 0.25 + aSeed.y * 0.75;   // per-particle angular speed
        float t1 = uTime * sp + ph;

        // orbit radius: seeded spread, swollen by bass, clenched by press;
        // the flocking morph tightens it too (cohesion pulls in as the
        // murmuration splits into sub-flock cells)
        float rad = 3.0 + aSeed.z * 9.0;
        rad *= 1.0 + uBass * 0.9;
        rad *= 1.0 - uPress * 0.6;
        rad *= 1.0 - uMorph * 0.55;

        // layered incommensurate sin/cos = cheap stateless pseudo-curl orbit
        vec3 p;
        p.x = sin(t1) * rad + sin(t1 * 1.73 + ph * 3.0) * rad * 0.35;
        p.y = sin(t1 * 0.91 + ph) * rad * 0.55 + cos(t1 * 2.17 + ph * 5.0) * rad * 0.2;
        p.z = cos(t1) * rad + cos(t1 * 1.31 + ph * 4.0) * rad * 0.35;
        p += position * rad * 0.45;              // scatter the ring into a cloud

        p *= 1.0 + uBurst * (0.4 + aSeed.z * 0.9); // beat: expanding radial shell

        // flocking morph: aSeed.x assigns one of five sub-flock cells on a
        // fixed ring around the attractor, the ring never revolves by
        // itself; each cell breathes radially and bobs so the split still
        // reads alive. uMorph glides the cell offset from zero (one tight
        // murmuration) to full separation (several cells); uCellSeed
        // re-slots the ring on strikes.
        float ca = floor(aSeed.x * 5.0) * 1.2566371 + uCellSeed;
        float cr = 1.0 + 0.12 * sin(uTime * 0.45 + ca * 2.0); // radial breath
        vec3 cc = vec3(cos(ca) * cr,
                       sin(ca * 1.7 + uTime * 0.19) * 0.55,
                       sin(ca) * cr);
        p += cc * uMorph * 11.0;

        vec4 mv = modelViewMatrix * vec4(uAttractor + p, 1.0);
        vMix = aSeed.w;
        vTw = 0.5 + 0.5 * sin(uTime * (1.5 + uHigh * 6.0) + ph * 13.0); // treble twinkle
        float px = uSize * (0.6 + aSeed.y * 0.8) * (1.0 + uBass * 1.6) * (160.0 / -mv.z);
        gl_PointSize = min(px, 40.0); // cap fill cost for near particles
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform float uAlpha;
      in float vMix;
      in float vTw;
      out vec4 fragColor;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d); // soft round sprite
        a *= a * (0.35 + 0.65 * vTw) * uAlpha;
        fragColor = vec4(mix(uColorA, uColorB, vMix), a);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false; // real positions live in the shader
  scene.add(points);

  // --- preallocated scratch + scalar state
  const target = new THREE.Vector3(); // where the hand says the attractor should be
  const shockOff = new THREE.Vector3(); // strike's attractor re-seed offset
  const camTarget = new THREE.Vector3(0, 0, 0);
  let burst = 0;      // beat/pad impulse energy, exponential decay
  let shock = 0;      // strike scatter energy, ~2 s reform
  let strikePrev = 0; // last frame's strike energy, for rising-edge detection
  let swayS = 0;      // smoothed sway -> flocking morph position
  let cellSeed = 0;   // sub-flock ring phase, re-seeded by strikes

  return {
    scene,
    camera,
    update(dt, t, io) {
      const u = mat.uniforms;

      // strike: scatter shock, a velocity burst plus an attractor re-seed
      // that decays over ~2 s, so the swarm blows apart and reforms; the
      // sub-flock cells re-slot on their ring at the same instant
      if (io.strike > strikePrev + 0.25) {
        shock = 1;
        shockOff.set(
          (Math.random() - 0.5) * 24,
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 10,
        );
        cellSeed = Math.random() * TAU;
      }
      strikePrev = io.strike;
      shock *= Math.pow(0.25, dt);

      // attractor chases the hand in world space with exponential lag;
      // the shock offset shoves it off-hand and drains back as it reforms
      target.set((io.xy.x - 0.5) * 26, (io.xy.y - 0.5) * 16, 0);
      target.addScaledVector(shockOff, shock);
      u.uAttractor.value.lerp(target, 1 - Math.exp(-dt * 3.5));

      // burst: beats and pad hits detonate, then decay fast; the strike
      // shock rides the same radial-shell path as its velocity burst
      burst = Math.max(burst * Math.pow(0.04, dt), io.beat);
      for (let i = 0; i < 16; i++) if (io.pads[i] > burst) burst = io.pads[i];

      // sway glides the flocking morph (murmuration <-> orbiting cells)
      swayS += (io.gestures.sway - swayS) * (1 - Math.exp(-dt * 3));

      u.uTime.value = t;
      u.uBass.value = io.bands.bass;
      u.uHigh.value = io.bands.high;
      u.uBurst.value = Math.max(burst, shock * 0.9);
      u.uPress.value = io.gestures.press;
      u.uMorph.value = swayS;
      u.uCellSeed.value = cellSeed;

      // two palette entries per frame; slow cycle, lastPad shoves the accent
      const ia = ((t * 0.15) | 0) % 5;
      const ib = (ia + 2 + (io.lastPad >= 0 ? io.lastPad : 0)) % 5;
      u.uColorA.value.copy(io.palette[ia]).multiplyScalar(io.intensity);
      u.uColorB.value.copy(io.palette[ib]).multiplyScalar(io.intensity);

      // fixed eye at (0, 4, 30), nothing orbits or bobs by itself; the beat
      // lifts it a touch and the look-at eases toward the attractor as it
      // chases the hand
      camera.position.y = 4 + io.beat * 0.5;
      camTarget.lerp(u.uAttractor.value, 1 - Math.exp(-dt * 1.5));
      camera.lookAt(camTarget);
    },
    resize(w, h) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      mat.uniforms.uSize.value = 2.0 * (h / 1080); // keep point size resolution-stable
    },
    dispose() {
      geo.dispose();
      mat.dispose();
    },
  };
}
