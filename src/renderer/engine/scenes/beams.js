// Beam Sixteen, sixteen light beams, one per Sway IR sensor. Each beam is
// a tall camera-facing quad (an axial billboard: the quad turns about the
// beam's own axis to face the eye), so the fragment shader works in a clean
// 2-D beam coordinate (u across the beam, v up its height) and paints one
// of three beam styles, crossfading between them per pixel:
//
//   HOLOGRAM     (style 0)  a translucent volumetric column: the body is
//                shaded by chord thickness through a cylinder, brighter at a
//                fresnel-like rim, with horizontal scanlines scrolling UPWARD,
//                slow interference bands, a slight chromatic split (the two
//                rims carry two palette tints) and a gentle flicker. Low
//                contrast and airy, projected light, not a solid.
//   LASER        (style 1)  the rest look: a razor-thin white-hot core (a
//                gaussian ~2 device pixels wide at 1080 p, constant brilliance
//                along the height), a wide palette-coloured halo with an
//                exponential falloff, a bright impact bloom where the beam
//                meets the floor and a faint drifting haze glow around the
//                core, a physical laser in a hazy room.
//   ELECTRICITY  (style 2)  the core becomes an arc: its path is displaced
//                across the beam by 2 to 3 octaves of value noise whose domain
//                translates along the height axis (nothing rotates), a thin
//                white core inside a blue-white halo tinted by the palette's
//                coolest entry, bright nodes travelling up the arc, hard
//                48 Hz random gating and an intermittent fainter secondary
//                branch, a Tesla beam.
//
// KNOB 4 (io.knobs[3]) is the style: s = knob × 2, so 0 = hologram, 1 = laser
// (the 0.5 default, pure laser at rest), 2 = electricity, blended
// continuously (0..1 hologram->laser, 1..2 laser->electricity). The value is
// smoothed with a 0.15 s time constant, so the transition runs exactly as
// fast as the knob is turned, a flick snaps, a slow sweep dissolves.
//
// Morph responses (docs/SCENE_CONTRACT.md): sway morphs the beam FIELD, a
// tight parallel array spreads, fans outward and cross-tilts odd/even
// columns into a crossing lattice, and a strike re-seeds the formation
// (idle phases, palette slots, depth stagger, noise seeds) so the array
// visibly re-patterns while the struck column still flashes. The hand
// sweeps a highlight across the row (x) and lifts the eye and beam energy
// (y); pads flash their own column; bass fattens the halo; beats lift;
// io.intensity scales emissive output. Nothing rotates on its own: the
// camera is fixed apart from the hand-driven lift and lateral drift.
//
// Three draw calls: the sixteen beams (one InstancedMesh of quads with
// per-instance state and colour attributes), the floor (a faint grid plus
// per-beam impact pools and reflection streaks, reading the beam table as
// uniform arrays) and the dust (one Points cloud whose motes are lit by the
// beams they drift through). All colour derives from io.palette, copied per
// frame. Shaders are GLSL3 (glslVersion: THREE.GLSL3; three.js supplies the
// version and precision headers). Reference implementation of the scene
// contract.

export const meta = { id: 'beams', name: 'Beam Sixteen', mood: 'anthemic' };

const COUNT = 16;
const SPACING = 4.6;   // column pitch at full sway (tightens toward rest)
const FLOOR_Y = -8;    // the floor plane; every beam roots here
const HEIGHT = 60;     // beam quad height in world units (the top is off-frame)

export function createScene(ctx) {
  const { THREE, quality } = ctx;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, ctx.width / ctx.height, 0.1, 400);
  camera.position.set(0, 6, 34);

  // the engine renders into targets sized canvas × pixel ratio; the laser
  // core is specified in device pixels, so the shader needs that height
  const dpr = ctx.renderer.getPixelRatio();

  const ELEC_OCT = quality.tier === 'low' ? 2 : 3; // arc noise octaves
  const BRANCH = quality.tier === 'low' ? 0 : 1;   // secondary arc branch

  // --- shared per-beam tables. beamA / beamC feed the floor and dust shaders
  // as flat uniform arrays; beamC doubles as the beams' own colour attribute.
  const beamA = new Float32Array(COUNT * 4); // footX, footZ, tan(tilt), energy
  const beamC = new Float32Array(COUNT * 3); // per-beam palette colour (slot blend)
  const beamB = new Float32Array(COUNT * 3); // second palette tint (hologram split)
  const stateArr = new Float32Array(COUNT * 4); // energy, flash, prox, seed

  // --- 16 beams: one InstancedMesh of unit quads, additive, depthWrite off.
  // Local space: x in [-0.5, 0.5] across, y in [0, 1] up from the foot; the
  // instance matrix carries foot position, tilt and (width, height) scale,
  // and the vertex shader turns the quad about the beam axis to face the eye.
  const beamGeo = new THREE.BufferGeometry();
  beamGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    -0.5, 0, 0, 0.5, 0, 0, 0.5, 1, 0, -0.5, 1, 0,
  ]), 3));
  beamGeo.setIndex([0, 1, 2, 0, 2, 3]);
  const stateAttr = new THREE.InstancedBufferAttribute(stateArr, 4);
  const colAAttr = new THREE.InstancedBufferAttribute(beamC, 3);
  const colBAttr = new THREE.InstancedBufferAttribute(beamB, 3);
  stateAttr.setUsage(THREE.DynamicDrawUsage);
  colAAttr.setUsage(THREE.DynamicDrawUsage);
  colBAttr.setUsage(THREE.DynamicDrawUsage);
  beamGeo.setAttribute('aState', stateAttr);
  beamGeo.setAttribute('aColA', colAAttr);
  beamGeo.setAttribute('aColB', colBAttr);

  const beamMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uStyle: { value: 1 },       // 0 hologram, 1 laser, 2 electricity
      uBass: { value: 0 },
      uBeat: { value: 0 },
      uHaze: { value: 0.6 },      // laser haze glow, breathes with level
      uIntensity: { value: 1 },
      uResY: { value: ctx.height * dpr },
      uCool: { value: new THREE.Color(0.5, 0.7, 1.0) }, // palette's coolest entry
    },
    vertexShader: /* glsl */ `
      in vec4 aState;
      in vec3 aColA;
      in vec3 aColB;
      uniform float uResY;
      out vec2 vUv;      // x: -1..1 across the beam, y: 0..1 up the height
      out float vPix;    // device pixels across the full quad width
      out float vH;      // quad height in world units
      out vec4 vState;
      out vec3 vColA;
      out vec3 vColB;
      void main() {
        mat4 im = modelMatrix * instanceMatrix;
        vec3 foot = (im * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        vec3 up = (im * vec4(0.0, 1.0, 0.0, 0.0)).xyz;
        float H = length(up);
        vec3 axis = up / H;
        float W = length((im * vec4(1.0, 0.0, 0.0, 0.0)).xyz);
        // axial billboard: perpendicular to the beam axis and to the eye
        vec3 right = cross(axis, cameraPosition - foot);
        float rl = length(right);
        right = rl > 1e-4 ? right / rl : vec3(1.0, 0.0, 0.0);
        vec3 wp = foot + axis * (position.y * H) + right * (position.x * W);
        vec4 mv = viewMatrix * vec4(wp, 1.0);
        gl_Position = projectionMatrix * mv;
        vUv = vec2(position.x * 2.0, position.y);
        // projected width in device pixels -> the core can hold ~2 px
        vPix = W * uResY * 0.5 * projectionMatrix[1][1] / max(-mv.z, 0.1);
        vH = H;
        vState = aState;
        vColA = aColA;
        vColB = aColB;
      }`,
    fragmentShader: /* glsl */ `
      #define ELEC_OCT ${ELEC_OCT}
      #define BRANCH ${BRANCH}
      uniform float uTime, uStyle, uBass, uBeat, uHaze, uIntensity;
      uniform vec3 uCool;
      in vec2 vUv;
      in float vPix;
      in float vH;
      in vec4 vState;
      in vec3 vColA;
      in vec3 vColB;
      out vec4 fragColor;

      float h11(float p) { return fract(sin(p * 127.1 + 311.7) * 43758.5453); }
      float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n1(float x) {
        float i = floor(x), f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        return mix(h11(i), h11(i + 1.0), f);
      }
      float vnoise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x),
                   mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y);
      }
      // chord length through a unit cylinder at offset x, and a fresnel-ish
      // rim that brightens toward the silhouette (masked outside it)
      float chord(float x) { return sqrt(max(0.0, 1.0 - x * x)); }
      float rim(float x) {
        float c = 1.0 - chord(x);
        return c * c * c * (1.0 - smoothstep(0.96, 1.0, x));
      }

      // HOLOGRAM: translucent cylinder body, fresnel rim with a chromatic
      // split, upward-scrolling scanlines, interference bands, soft flicker
      vec3 hologram(float u, float y, float seed, float t) {
        float au = abs(u);
        float body = chord(au);
        float scan = pow(0.5 + 0.5 * sin((y * 1.8 - t * 1.3) * 6.2832), 1.5); // f(y - ct): moves up
        float bands = 0.8 + 0.2 * sin(y * 0.45 - t * 0.7) * sin(y * 0.31 + t * 0.5);
        float grain = 0.85 + 0.3 * vnoise(vec2(u * 10.0 + seed, y * 2.5 - t * 5.0));
        float fl = 0.88 + 0.12 * n1(t * 9.0 + seed * 13.0);
        fl *= 1.0 - 0.35 * step(0.965, h11(floor(t * 18.0) + seed * 7.0)); // rare dropout
        float fall = 0.55 + 0.45 * exp(-y * 0.12);   // brightest at the projector foot
        vec3 mid = mix(vColA, vColB, 0.5);
        vec3 col = mid * body * (0.35 + 0.35 * scan) * bands * grain
                 + vColA * rim(abs(u + 0.07)) * 1.3    // left rim, tint A
                 + vColB * rim(abs(u - 0.07)) * 1.3;   // right rim, tint B
        return col * fl * fall;
      }

      // LASER: ~2 px white-hot gaussian core, wide exponential halo, impact
      // bloom at the floor, faint drifting haze glow
      vec3 laser(float u, float y, float seed, float t, float flash, float prox, float pxU) {
        float au = abs(u);
        float sig = pxU * 1.1;
        float core = exp(-u * u / (2.0 * sig * sig));
        core *= 0.9 + 0.1 * n1(y * 6.0 - t * 4.0 + seed);   // haze speckle sliding up the core
        float k = 5.5 / (1.0 + uBass * 0.9 + flash * 0.6);   // bass fattens the halo
        float halo = exp(-au * k);
        float haze = exp(-au * 1.4) * (0.3 + 0.7 * vnoise(vec2(u * 1.5 + seed, y * 0.25 - t * 0.35)));
        float impact = exp(-y * 0.55) * exp(-au * au * 2.5);
        vec3 hot = mix(vColA, vec3(1.0), 0.85);              // white-hot: a lightness shift
        vec3 haloC = mix(vColA, vec3(1.0), prox * 0.35);      // the hand sweep whitens the halo
        return hot * core * (2.6 + flash * 2.5)
             + haloC * halo * (0.5 + uBass * 0.45 + flash * 0.4)
             + vColA * haze * 0.12 * uHaze
             + mix(vColA, vec3(1.0), 0.55) * impact * 1.3;
      }

      // ELECTRICITY: the arc path, octave 0 glides, higher octaves re-route
      // in 48 Hz steps; the noise domain translates along the height (y)
      float arcPath(float y, float seed, float t, float tq) {
        float d = 0.0, a = 0.85, f = 0.33;
        for (int o = 0; o < ELEC_OCT; o++) {
          float tt = (o == 0) ? t * 6.0 : tq * (9.0 + float(o) * 4.0);
          d += (n1(y * f - tt + seed * 19.0 + float(o) * 5.7) - 0.5) * a;
          a *= 0.5;
          f *= 2.4;
        }
        return d;
      }
      vec3 electric(float u, float y, float v, float seed, float t, float flash, float pxU) {
        float tq = floor(t * 48.0) / 48.0;
        float pin = smoothstep(0.0, 0.05, v);                 // the arc roots at the floor
        float d = clamp(arcPath(y, seed, t, tq) * pin, -0.8, 0.8);
        float du = u - d;
        float sig = pxU;
        float core = exp(-du * du / (2.0 * sig * sig));
        float kh = 9.0 / (1.0 + uBass * 0.8 + flash * 0.5);
        float halo = exp(-abs(du) * kh);
        float nodes = pow(n1(y * 2.5 - t * 9.0 + seed * 31.0), 6.0) * 3.0; // beads travelling up
        float gf = floor(t * 48.0);
        float gate = (0.3 + 0.7 * step(0.28, h11(gf + seed * 7.3)))        // hard random gating
                   * (0.7 + 0.6 * h11(gf + seed * 3.1));
        vec3 hot = mix(uCool, vec3(1.0), 0.9);
        vec3 hc = mix(uCool, vec3(1.0), 0.35);
        vec3 col = hot * core * (2.2 + nodes + flash * 2.0) + hc * halo * (0.55 + 0.3 * nodes);
        #if BRANCH
          // secondary branch: splits off at a random height, fainter, intermittent
          float bf = floor(t * 5.0);
          float b0 = h11(bf + seed * 11.0) * 0.5;
          float on = step(0.45, h11(bf + seed * 2.7));
          float seg = smoothstep(b0 - 0.02, b0 + 0.05, v) * (1.0 - smoothstep(b0 + 0.22, b0 + 0.38, v));
          float bd = clamp(d + arcPath(y + 37.0, seed + 0.5, t, tq) * 1.6 * smoothstep(b0, b0 + 0.12, v), -0.95, 0.95);
          float bdu = u - bd;
          float bcore = exp(-bdu * bdu / (2.0 * sig * sig));
          float bhalo = exp(-abs(bdu) * kh * 1.2);
          col += (hot * bcore * 0.9 + hc * bhalo * 0.22) * on * seg;
        #endif
        col += hc * exp(-abs(u) * 2.0) * 0.06;                // ionised-air glow
        return col * gate;
      }

      void main() {
        float u = vUv.x, v = vUv.y;
        float y = v * vH;                     // world units up the beam
        float pxU = 2.0 / max(vPix, 1.0);     // u units per device pixel
        float energy = vState.x, flash = vState.y, prox = vState.z, seed = vState.w;
        // style weights: 0..1 hologram->laser, 1..2 laser->electricity
        float wH = clamp(1.0 - uStyle, 0.0, 1.0);
        float wL = 1.0 - min(abs(uStyle - 1.0), 1.0);
        float wE = clamp(uStyle - 1.0, 0.0, 1.0);
        vec3 col = vec3(0.0);
        if (wH > 0.001) col += hologram(u, y, seed, uTime) * wH;
        if (wL > 0.001) col += laser(u, y, seed, uTime, flash, prox, pxU) * wL;
        if (wE > 0.001) col += electric(u, y, v, seed, uTime, flash, pxU) * wE;
        float au = abs(u);
        float au4 = au * au * au * au;
        float win = 1.0 - au4 * au4;          // the quad edge never shows
        col *= win * (0.25 + energy * 1.1) * uIntensity * (1.0 + uBeat * 0.25);
        fragColor = vec4(col, 1.0);
      }`,
  });
  const beams = new THREE.InstancedMesh(beamGeo, beamMat, COUNT);
  beams.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  beams.frustumCulled = false; // the vertex shader places the quads itself
  scene.add(beams);

  // --- floor: a faint grid plus, per beam, an impact pool (tight for laser,
  // wide and soft for hologram, flickering for electricity) and a reflection
  // streak smeared toward the camera. Static plane, no motion of its own.
  const floorGeo = new THREE.PlaneGeometry(240, 160);
  const floorMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: {
      uBeamA: { value: beamA },
      uBeamC: { value: beamC },
      uTime: { value: 0 },
      uStyle: { value: 1 },
      uGrid: { value: 0.1 },
      uIntensity: { value: 1 },
      uGridCol: { value: new THREE.Color() },
    },
    vertexShader: /* glsl */ `
      out vec3 vW;
      void main() {
        vW = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec4 uBeamA[16];
      uniform vec3 uBeamC[16];
      uniform float uTime, uStyle, uGrid, uIntensity;
      uniform vec3 uGridCol;
      in vec3 vW;
      out vec4 fragColor;
      float h11(float p) { return fract(sin(p * 127.1 + 311.7) * 43758.5453); }
      void main() {
        float x = vW.x, z = vW.z;
        float wH = clamp(1.0 - uStyle, 0.0, 1.0);
        float wL = 1.0 - min(abs(uStyle - 1.0), 1.0);
        float wE = clamp(uStyle - 1.0, 0.0, 1.0);
        // faint grid, fading away from the beam row
        vec2 g = abs(fract(vec2(x, z) / ${SPACING.toFixed(1)} + 0.5) - 0.5) * ${SPACING.toFixed(1)};
        float line = 1.0 - smoothstep(0.02, 0.1, min(g.x, g.y));
        float fade = exp(-length(vec2(x, z)) * 0.035);
        vec3 col = uGridCol * line * fade * uGrid;
        // style-weighted pool falloff and amplitude (weights sum to one)
        float kPool = 2.5 * wL + 0.35 * wH + 1.6 * wE;
        float gf = floor(uTime * 48.0);
        for (int i = 0; i < 16; i++) {
          vec4 b = uBeamA[i];
          float dx = x - b.x, dz = z - b.y;
          float e = b.w;
          float flick = 0.5 + 0.5 * step(0.3, h11(gf + float(i) * 7.3));
          float amp = 1.4 * wL + 0.35 * wH + 1.1 * wE * flick;
          float pool = amp * exp(-(dx * dx + dz * dz) * kPool);
          // reflection streak: the mirrored beam smears toward the camera (+z),
          // leaning with the beam's tilt
          float sx = dx + b.z * dz * 0.5;
          float streak = exp(-sx * sx * 5.0) * exp(-max(dz, 0.0) * 0.16) * smoothstep(-0.6, 0.6, dz)
                       * (0.45 * wL + 0.1 * wH + 0.3 * wE * flick);
          col += uBeamC[i] * (pool + streak) * e;
        }
        fragColor = vec4(col * uIntensity, 1.0);
      }`,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2; // laid flat once; it never turns
  floor.position.set(0, FLOOR_Y, -10);
  scene.add(floor);

  // --- dust motes drifting through the beams, lit by the beams they cross
  const dustCount = Math.max(500, Math.floor(quality.particles / 12));
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  const dustSeed = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 90;
    dustPos[i * 3 + 1] = Math.random() * 44 - 8;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    dustSeed[i] = Math.random() * Math.PI * 2;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(dustSeed, 1));
  const dustMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: {
      uBeamA: { value: beamA },
      uBeamC: { value: beamC },
      uTime: { value: 0 },
      uBase: { value: new THREE.Color(1, 1, 1) },
      uLevel: { value: 0 },
      uIntensity: { value: 1 },
    },
    vertexShader: /* glsl */ `
      in float aSeed;
      uniform vec4 uBeamA[16];
      uniform vec3 uBeamC[16];
      uniform float uTime;
      uniform vec3 uBase;
      out vec3 vCol;
      out float vA;
      void main() {
        vec3 p = position;
        p.y += sin(uTime * 0.3 + aSeed) * 2.0;
        p.x += cos(uTime * 0.2 + aSeed * 1.7) * 1.5;
        float tw = 0.5 + 0.5 * sin(uTime * 2.0 + aSeed * 13.0);
        // beam light: horizontal distance to each (tilted) beam line at this height
        float h = p.y - (${FLOOR_Y.toFixed(1)});
        vec3 lit = vec3(0.0);
        float lsum = 0.0;
        for (int i = 0; i < 16; i++) {
          vec4 b = uBeamA[i];
          float dx = p.x - (b.x - b.z * h), dz = p.z - b.y;
          float w = b.w * exp(-(dx * dx + dz * dz) * 0.5);
          lit += uBeamC[i] * w;
          lsum += w;
        }
        vCol = uBase * 0.5 + lit * 1.6;
        vA = (0.2 + 0.8 * tw) * (0.25 + min(lsum, 1.5));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (1.2 + tw + min(lsum, 1.0) * 1.5) * (140.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uLevel, uIntensity;
      in vec3 vCol;
      in float vA;
      out vec4 fragColor;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d) * vA * (0.3 + uLevel) * uIntensity;
        fragColor = vec4(vCol * uIntensity, a);
      }`,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  dust.frustumCulled = false;
  scene.add(dust);

  // --- preallocated scratch
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  const c = new THREE.Color();
  const zAxis = new THREE.Vector3(0, 0, 1); // tilt axis for the field morph
  const camTarget = new THREE.Vector3(0, 4, 0);
  const flash = new Float32Array(COUNT);    // per-beam pad flash energy
  const colPhase = new Float32Array(COUNT); // per-column idle phase (strike re-seeds)
  const colPal = new Float32Array(COUNT);   // per-column palette slot shift (strike re-seeds)
  const colZ = new Float32Array(COUNT);     // per-column depth stagger (strike re-seeds)
  const colSeed = new Float32Array(COUNT);  // per-column shader noise seed (strike re-seeds)
  for (let i = 0; i < COUNT; i++) {
    colPhase[i] = i * 0.62;
    colZ[i] = (Math.random() - 0.5) * 4;
    colSeed[i] = Math.random() * 100;
  }
  let swayS = 0;      // smoothed sway -> field morph position
  let styleS = 1;     // smoothed style -> KNOB 4, pure laser at rest
  let camX = 0;       // hand-driven lateral drift of the eye
  let strikePrev = 0; // last frame's strike energy, for rising-edge detection

  const approach = (v, to, tau, dt) => v + (to - v) * (1 - Math.exp(-dt / tau));

  return {
    scene,
    camera,
    update(dt, t, io) {
      const bass = io.bands.bass;
      const sweep = io.xy.x * (COUNT - 1); // hand position in beam-index space

      // KNOB 4 is the style; the short time constant makes the knob's own
      // speed the transition speed (flick = snap, slow sweep = dissolve)
      const styleTarget = Math.min(2, Math.max(0, io.knobs[3] * 2));
      styleS = approach(styleS, styleTarget, 0.15, dt);
      const holoW = Math.max(0, 1 - styleS); // hologram wants a fuller body
      const elecW = Math.max(0, styleS - 1); // the arc needs room to wander

      // sway morphs the field, not the camera: spacing tightens toward a
      // column array at rest and spreads as sway rises, while each beam
      // picks up an outward fan + alternating cross-tilt so the row folds
      // into a crossing lattice at full sway
      swayS = approach(swayS, io.gestures.sway, 0.25, dt);
      const spacing = SPACING * (0.62 + 0.38 * swayS);
      const x0 = -((COUNT - 1) * spacing) / 2;

      // strike (pad-energy rising edge) re-seeds the formation: every
      // column draws a fresh idle phase, palette slot, depth stagger and
      // noise seed, so the array visibly re-patterns while the struck
      // column still flashes
      if (io.strike > strikePrev + 0.25) {
        for (let i = 0; i < COUNT; i++) {
          colPhase[i] = Math.random() * Math.PI * 2;
          colPal[i] = (Math.random() * 5) | 0;
          colZ[i] = (Math.random() - 0.5) * 4;
          colSeed[i] = Math.random() * 100;
        }
      }
      strikePrev = io.strike;

      // the palette's coolest entry tints the electricity (white-blue)
      let coolI = 0;
      let coolBest = -9;
      for (let k = 0; k < 5; k++) {
        const pk = io.palette[k];
        const cool = pk.b - pk.r;
        if (cool > coolBest) { coolBest = cool; coolI = k; }
      }
      beamMat.uniforms.uCool.value.copy(io.palette[coolI]);

      for (let i = 0; i < COUNT; i++) {
        // pad hits inject flash energy into their own column
        flash[i] = Math.max(flash[i] * Math.pow(0.06, dt), io.pads[i]);

        // proximity of the hand sweep to this beam (soft highlight);
        // sway counter-phases odd/even columns' idle weighting so the
        // lattice checkers instead of breathing in unison
        const ni = (i / (COUNT - 1)) * 2 - 1; // -1..1 across the row
        const alt = i & 1 ? 1 : -1;           // alternating crossing sign
        const prox = Math.exp(-Math.pow(i - sweep, 2) * 0.5);
        const idle = 0.55 + 0.45 * Math.sin(t * 0.8 + colPhase[i] + swayS * alt * 2.2);
        const energy = Math.min(1.5, idle * 0.25 + prox * (0.4 + io.xy.y) + flash[i] + bass * 0.5);

        // quad width: bass, energy and press fatten it (the halo falls off in
        // beam units, so it widens with the quad; the laser core stays ~2 px)
        const w = (1.15 + 0.35 * holoW + 0.25 * elecW) * (1 + bass * 0.9 + Math.min(energy, 1) * 0.35 + io.gestures.press * 0.6);
        const ang = swayS * (ni * 0.5 + alt * 0.3); // fan + cross
        const fx = x0 + i * spacing;
        p.set(fx, FLOOR_Y, colZ[i]);
        q.setFromAxisAngle(zAxis, ang);
        s.set(w, HEIGHT, 1);
        m.compose(p, q, s);
        beams.setMatrixAt(i, m);

        stateArr[i * 4] = energy;
        stateArr[i * 4 + 1] = flash[i];
        stateArr[i * 4 + 2] = prox;
        stateArr[i * 4 + 3] = colSeed[i];

        // palette: the slot glides across the row and slowly over time; the
        // colour is blended between adjacent entries so hue never snaps
        const slot = (i + colPal[i] + t * 0.15) % 5;
        const i0 = slot | 0;
        c.copy(io.palette[i0]).lerp(io.palette[(i0 + 1) % 5], slot - i0);
        beamC[i * 3] = c.r;
        beamC[i * 3 + 1] = c.g;
        beamC[i * 3 + 2] = c.b;
        c.copy(io.palette[(i0 + 2) % 5]); // the hologram's second tint
        beamB[i * 3] = c.r;
        beamB[i * 3 + 1] = c.g;
        beamB[i * 3 + 2] = c.b;

        // the shared beam table for the floor and dust shaders
        beamA[i * 4] = fx;
        beamA[i * 4 + 1] = colZ[i];
        beamA[i * 4 + 2] = Math.tan(ang);
        beamA[i * 4 + 3] = energy;
      }
      beams.instanceMatrix.needsUpdate = true;
      stateAttr.needsUpdate = true;
      colAAttr.needsUpdate = true;
      colBAttr.needsUpdate = true;

      const bu = beamMat.uniforms;
      bu.uTime.value = t;
      bu.uStyle.value = styleS;
      bu.uBass.value = bass;
      bu.uBeat.value = io.beat;
      bu.uHaze.value = 0.6 + io.level * 0.8;
      bu.uIntensity.value = io.intensity;

      const fu = floorMat.uniforms;
      fu.uTime.value = t;
      fu.uStyle.value = styleS;
      fu.uGrid.value = 0.06 + bass * 0.18;
      fu.uIntensity.value = io.intensity;
      fu.uGridCol.value.copy(io.palette[coolI]).lerp(io.palette[4], 0.5);

      // dust follows the palette accent, twinkles with treble, lit by the beams
      const du = dustMat.uniforms;
      du.uTime.value = t;
      du.uBase.value.copy(io.palette[4]);
      du.uLevel.value = io.bands.high;
      du.uIntensity.value = io.intensity;

      // fixed eye: the hand lifts it (y) and drifts it sideways (x), the
      // beat nudges it; nothing orbits on its own
      camX = approach(camX, (io.xy.x - 0.5) * 6, 0.4, dt);
      camera.position.set(camX, 4 + io.xy.y * 10 + io.beat * 0.6, 34);
      camera.lookAt(camTarget);
    },
    resize(w, h) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      beamMat.uniforms.uResY.value = h * dpr;
    },
    dispose() {
      beams.dispose(); // frees instanceMatrix GPU buffers
      beamGeo.dispose();
      beamMat.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
    },
  };
}
