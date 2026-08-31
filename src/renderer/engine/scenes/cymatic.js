// Cymatic Orb, a sphere carrying standing waves, Chladni-plate style.
// Three spherical-harmonic-like modes are summed in the vertex shader and
// displace the surface; their mode numbers are driven by bass / mid / high,
// so the resonance figure literally re-tunes with the music. The fragment
// shader re-evaluates the same field per pixel and lights the zero
// crossings as hair-thin neon nodal lines over a near-black interior.
// Sway is the resonance morph: it re-tunes all four mode numbers at once,
// gliding the orb from a sparse low-order figure to a dense high-order
// weave, the standing-wave pattern reorganises, the orb does not spin.
// A strike (pad rising edge) is a mode jump: the whole mode stack snaps to
// a fresh figure and the amplitude hit rings down over ~1.2 s, the way a
// struck bell settles. Beats and pads also fire travelling ripples, press
// collapses the resonance back toward a perfect sphere while the lines
// burn white. A second back-facing shell adds the aura. Nothing turns on
// its own: no orb spin, no camera drift, and the azimuthal phases hold
// still (re-seated only by a strike), the figure's motion is the polar
// phases flowing pole to pole and the hand alone orbits the eye. Two draw
// calls, everything procedural. See docs/SCENE_CONTRACT.md.

export const meta = { id: 'cymatic', name: 'Cymatic Orb', mood: 'resonant' };

const PADS = 16;
const RIPPLES = 4; // preallocated ripple pool, round-robin reuse

// Icosahedron detail per tier, the 12 / 18 / 26 of the scene contract.
// PolyhedronGeometry splits each of the 20 base faces into (detail + 1)^2
// triangles and emits them non-indexed, so the real cost is 20*(d+1)^2
// triangles and 3x that in vertices:
//   d=12 ->  3,380 tris / 10,140 verts   (low)
//   d=18 ->  7,220 tris / 21,660 verts   (med)
//   d=26 -> 14,580 tris / 43,740 verts   (high)
// A coarse mesh is not an option: the fragment stage evaluates the field per
// pixel from the interpolated direction, and across a heavily displaced
// triangle that interpolation drifts from the true sphere direction, so too
// few triangles print their own facets onto the figure. Past d=26 the return
// is nil, the cost of this scene is per-pixel, not per-vertex (med is ~22k
// verts of trig against ~700k shaded pixels), while the non-indexed build
// cost and the static VBO both grow as d^2, and that build runs on the
// scene's first activation, mid-set.
const DETAIL = { low: 12, med: 18, high: 26 };

const TAU = Math.PI * 2;
// Framing: at fov 46 the visible half-height at the origin is
// CAM_R * tan(23deg) = 1.83. The orb peaks near r = 1.5 under a stacked
// ripple and the aura sits at 1.30 (x1.26 at full pulse = 1.64), so the
// whole form stays inside the frame with black around it, no full-screen
// fill. The aura hugs the orb deliberately: pushed out further it stops
// reading as a rim and becomes a dim disc behind everything.
const CAM_R = 4.3;
const AURA_R = 1.3;

// --- shared GLSL -----------------------------------------------------------

// Palette lerp across all five entries, t in [0..5). Same helper as warp.js.
const PAL_GLSL = /* glsl */ `
  uniform vec3 uColors[5];

  vec3 pal(float t) {
    vec3 c = mix(uColors[0], uColors[1], clamp(t, 0.0, 1.0));
    c = mix(c, uColors[2], clamp(t - 1.0, 0.0, 1.0));
    c = mix(c, uColors[3], clamp(t - 2.0, 0.0, 1.0));
    c = mix(c, uColors[4], clamp(t - 3.0, 0.0, 1.0));
    return mix(c, uColors[0], clamp(t - 4.0, 0.0, 1.0));
  }

  // Push a palette color to full brightness, keeping its hue and saturation.
  // The nodal lines travel the whole palette for iridescence, and a palette
  // whose entries include a near-black would otherwise dim the neon to mud
  // exactly where the hue sweep crosses it. The interior deliberately uses
  // the raw (dark) palette color instead.
  vec3 neon(vec3 c) {
    return c / (max(max(c.r, c.g), c.b) + 0.002);
  }
`;

// The standing-wave field itself. Included verbatim in both the vertex
// shader (which displaces by it) and the fragment shader (which finds its
// zero set), so the geometry and the nodal lines can never disagree.
const FIELD_GLSL = /* glsl */ `
  uniform vec4 uMode;    // x,y,z = bass/mid/high mode numbers, w = zonal ring order
  uniform vec4 uAmp;     // matching amplitudes, per band
  uniform vec4 uPhaseA;  // azimuthal phase per term, fixed; re-seated per strike
  uniform vec4 uPhaseB;  // polar phase per term (w = zonal term's phase)
  uniform vec3 uRipDir[${RIPPLES}];
  uniform float uRipAmp[${RIPPLES}];
  uniform float uRipR[${RIPPLES}];

  // phi = azimuth, th = polar angle, st = sin(th). One acos for the whole
  // shader stage; every mode term below reuses these. dir.y is clamped
  // because a normalize() can land a hair outside [-1,1] and acos() of that
  // is NaN.
  vec3 sphAngles(vec3 dir) {
    float ct = clamp(dir.y, -1.0, 1.0);
    float st = sqrt(max(0.0, 1.0 - ct * ct));
    // At a pole dir.xz is (0,0) and atan(0.0, 0.0) is undefined, NaN on some
    // drivers. The sin(theta) factor in modeTerm cannot rescue that, since
    // NaN * 0.0 is still NaN and one bad pixel would blow out the whole
    // fragment. st is zero exactly on that degenerate set, so nudge x to 1.0
    // there: phi becomes a finite 0.0 where the term is already dead, and
    // every other direction is untouched.
    return vec3(atan(dir.z, dir.x + step(st, 0.0)), acos(ct), st);
  }

  // One standing-wave mode of fractional azimuthal order m. A fractional m
  // fed straight into sin(m*phi) tears along the atan branch cut, so the
  // two neighbouring integer orders (both of which wrap seamlessly) are
  // blended by frac(m) instead: the figure morphs continuously, no seam.
  // The st factor makes every term vanish at the poles, where phi is
  // undefined and the term would otherwise be discontinuous.
  float modeTerm(vec3 sa, float m, float n, float pa, float pb) {
    float mA = floor(m);
    float f = m - mA;
    float a = sin(mA * sa.x + pa);
    float b = sin((mA + 1.0) * sa.x + pa);
    return mix(a, b, f) * cos(n * sa.y + pb) * sa.z;
  }

  float cymaticField(vec3 dir, vec3 sa) {
    // three sectoral/tesseral modes: the polar order is tied to the
    // azimuthal one so each band keeps a coherent figure as it sweeps
    float w  = uAmp.x * modeTerm(sa, uMode.x, uMode.x * 0.7 + 1.0, uPhaseA.x, uPhaseB.x);
    w += uAmp.y * modeTerm(sa, uMode.y, uMode.y * 0.5 + 2.0, uPhaseA.y, uPhaseB.y);
    w += uAmp.z * modeTerm(sa, uMode.z, uMode.z * 0.9 + 3.0, uPhaseA.z, uPhaseB.z);
    // zonal term: pure latitude rings, pole to pole, no azimuthal seam
    w += uAmp.w * cos(uMode.w * sa.y + uPhaseB.w);

    // Travelling shock ripples. Chord length is monotonic in the geodesic
    // angle and costs a subtract + length instead of a second acos. The bound
    // is the literal RIPPLES, so the compiler sees a constant it can unroll
    // (GLSL ES 3.00 would also take a dynamic index into uRipAmp; the literal
    // is kept for the unroll); it is interpolated from the JS pool size so
    // the two can never drift apart.
    for (int i = 0; i < ${RIPPLES}; i++) {
      if (uRipAmp[i] > 0.002) {          // uniform branch: free when idle
        float x = (length(dir - uRipDir[i]) - uRipR[i]) * 6.0;
        w += uRipAmp[i] * exp(-x * x) * cos(x * 1.7);
      }
    }
    return w;
  }
`;

export function createScene(ctx) {
  const { THREE, quality } = ctx;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, ctx.width / ctx.height, 0.1, 400);
  camera.position.set(0, 0, CAM_R);

  // --- palette uniforms: five preallocated colors, .copy()'d every frame.
  // Both materials point their uColors uniform at this one array.
  const palette = [
    new THREE.Color(), new THREE.Color(), new THREE.Color(),
    new THREE.Color(), new THREE.Color(),
  ];

  // --- ripple pool. These typed arrays / vectors ARE the uniform payloads,
  // so the CPU state and the GPU state are the same allocation.
  const ripDir = [
    new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
  ];
  const ripAmp = new Float32Array(RIPPLES);
  const ripRad = new Float32Array(RIPPLES);
  let ripNext = 0;

  const detail = DETAIL[quality.tier] || DETAIL.med;

  // --- the orb: one mesh, one ShaderMaterial, displaced in the vertex stage
  const orbGeo = new THREE.IcosahedronGeometry(1, detail);
  const orbMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: {
      uMode: { value: new THREE.Vector4(3, 5, 9, 4) },
      uAmp: { value: new THREE.Vector4(0.14, 0.1, 0.06, 0.08) },
      uPhaseA: { value: new THREE.Vector4() },
      uPhaseB: { value: new THREE.Vector4() },
      uRipDir: { value: ripDir },
      uRipAmp: { value: ripAmp },
      uRipR: { value: ripRad },
      uDisp: { value: 0.24 },   // displacement gain; press collapses it
      uBreathe: { value: 0 },   // uniform radial swell on bass/beat
      uNorm: { value: 2.5 },    // 1 / total amplitude, keeps lines alive when quiet
      uNode: { value: 0.05 },   // half-width of the nodal band (~9% coverage)
      uMicro: { value: new THREE.Vector3(10, 0, 0) }, // fine figure: order, phase a, phase b
      uTime: { value: 0 },
      uHue: { value: 0 },
      uHigh: { value: 0 },
      uBeat: { value: 0 },
      uPress: { value: 0 },
      uFlash: { value: 0 },     // pad flash on the nodal lines
      uIntensity: { value: 1 },
      uColors: { value: palette },
    },
    vertexShader: /* glsl */ `
      ${FIELD_GLSL}
      uniform float uDisp;
      uniform float uBreathe;
      out vec3 vDir;
      out vec3 vNv;
      out vec3 vPv;

      void main() {
        vec3 dir = normalize(position);      // unit sphere: dir is also the normal
        float f = cymaticField(dir, sphAngles(dir));
        vDir = dir;
        // radial displacement: the standing wave plus a uniform breath
        vec3 p = dir * (1.0 + uBreathe + f * uDisp);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vNv = normalMatrix * dir;            // undisplaced normal: the surface is
        vPv = mv.xyz;                        // emissive, so it only feeds the rim
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      ${PAL_GLSL}
      ${FIELD_GLSL}
      uniform float uNorm, uNode, uTime, uHue, uHigh, uBeat, uPress, uFlash, uIntensity;
      uniform vec3 uMicro;
      in vec3 vDir;
      in vec3 vNv;
      in vec3 vPv;
      out vec4 fragColor;

      void main() {
        vec3 dir = normalize(vDir);
        vec3 sa = sphAngles(dir);

        // The field is re-evaluated per pixel from the interpolated direction
        // rather than carried through as an interpolated out. An interpolant
        // is linear across a triangle while the field is not, so the difference shows
        // up as flat facets and polygon-straight nodal lines; recomputing
        // costs a few trig ops and keeps the figure curved and hair-thin at
        // any tessellation. Vertex and fragment share cymaticField(), so the
        // displaced geometry and the lines can never disagree.
        float n = cymaticField(dir, sa) * uNorm;  // amplitude-normalised, so a
        float an = abs(n);                        // quiet mix still draws lines

        // --- the signature: neon where the standing wave crosses zero
        float line = smoothstep(uNode, 0.0, an);
        float core = pow(line, 4.0);

        // --- contour filigree at fixed field levels: a second, finer set of
        // rings nested inside every antinode, which is what rewards staring
        float cd = abs(fract(n * 4.0 + 0.5) - 0.5);
        float cont = smoothstep(0.05, 0.0, cd) * (1.0 - line);

        // --- iridescence: hue travels by latitude and bends with the field,
        // so the palette wraps around the orb instead of flat-filling it
        float hu = fract(dir.y * 0.42 + 0.5 + uHue + n * 0.13);
        vec3 hot = neon(pal(hu * 5.0));
        vec3 cool = pal(fract(hu + 0.45) * 5.0);   // raw, so the belly stays dark
        vec3 edgeC = neon(pal(fract(hu + 0.22) * 5.0));

        // --- interior: dark palette color, deepening into the antinodes.
        // Driven by the per-pixel field, not the interpolant: an interpolated
        // value shades each triangle as a flat facet and the tessellation
        // reads straight through the surface.
        float belly = smoothstep(0.1, 0.9, an);
        vec3 col = cool * (0.05 + belly * 0.22);

        // --- nodal lines take the hot color, whiten as press collapses the
        // resonance and as pads flash the figure
        col += hot * line * (0.85 + uPress * 1.5 + uFlash * 2.2 + uBeat * 0.45);
        col += mix(hot, vec3(1.0), 0.6) * core * (0.7 + uFlash * 1.5 + uPress);
        col += edgeC * cont * 0.22;

        // --- treble: a much higher-order figure, strobing in hard cells.
        // The band is deliberately wide relative to the order: any thinner
        // and lines this fine fall under a pixel and alias into noise.
        // The sa.z gate matters, modeTerm carries a sin(theta) factor, so
        // near the poles the term degenerates to zero and the smoothstep
        // would otherwise light the entire polar cap as one hot disc.
        float mic = modeTerm(sa, uMicro.x, uMicro.x * 1.4 + 5.0, uMicro.y, uMicro.z);
        float fil = smoothstep(0.16, 0.0, abs(mic)) * sa.z;
        // Cells are diced from the 3D direction, not from (phi, theta):
        // angular cells converge at the poles and burst into moire there.
        float cell = floor(dir.x * 21.0) * 2.7 + floor(dir.y * 21.0) * 1.9
                   + floor(dir.z * 21.0) * 3.3;
        float strobe = step(0.3, sin(uTime * 40.0 + cell));
        col += edgeC * fil * (0.06 + strobe * uHigh * 1.1);

        // --- hard neon silhouette so the orb never reads as a soft blob
        float fres = pow(1.0 - clamp(dot(normalize(vNv), normalize(-vPv)), 0.0, 1.0), 3.0);
        col += hot * fres * (0.3 + uBeat * 0.55 + uPress * 0.4);

        fragColor = vec4(col * uIntensity, 1.0);
      }`,
  });
  const orb = new THREE.Mesh(orbGeo, orbMat);
  orb.rotation.x = 0.28;      // tilt the pole axis off the view axis
  orb.frustumCulled = false;  // displacement pushes past the base bounding sphere
  scene.add(orb);

  // --- aura: a larger back-facing shell, additive and depth-tested, so the
  // orb occludes its near half and only a rim of glow survives around the
  // silhouette. Cheap geometry (20*16 = 320 tris) and a cheap shader.
  const auraGeo = new THREE.IcosahedronGeometry(AURA_R, 3);
  const auraMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
    uniforms: {
      uGlow: { value: 0.3 },
      uBand: { value: 0 },   // banding phase, integrated CPU-side
      uHue: { value: 0 },
      uIntensity: { value: 1 },
      uColors: { value: palette },
    },
    vertexShader: /* glsl */ `
      out vec3 vNv;
      out vec3 vPv;
      out float vLat;
      void main() {
        vec3 dir = normalize(position);
        vLat = dir.y;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNv = normalMatrix * dir;
        vPv = mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      ${PAL_GLSL}
      uniform float uGlow, uBand, uHue, uIntensity;
      in vec3 vNv;
      in vec3 vPv;
      in float vLat;
      out vec4 fragColor;
      void main() {
        // Grazing angle on the shell's far side. The high power plus the
        // smoothstep gate concentrates the glow into a narrow bright ring at
        // the silhouette; a low power spreads it into a flat dim disc that
        // just greys out the black behind the orb.
        float f = abs(dot(normalize(vNv), normalize(-vPv)));
        float rim = pow(1.0 - f, 5.0) * smoothstep(0.55, 0.0, f);
        // faint latitude banding keeps the halo from being a flat gradient
        float band = 0.72 + 0.28 * sin(vLat * 22.0 + uBand);
        vec3 c = neon(pal(fract(vLat * 0.42 + 0.5 + uHue) * 5.0));
        fragColor = vec4(c * rim * band * uGlow * uIntensity, 1.0);
      }`,
  });
  const aura = new THREE.Mesh(auraGeo, auraMat);
  aura.frustumCulled = false;
  aura.renderOrder = 1;
  scene.add(aura);

  const u = orbMat.uniforms;
  const au = auraMat.uniforms;

  // --- pad impact points: 16 well-spread directions (Fibonacci sphere), so
  // every pad launches its ripple from its own place on the surface
  const padDir = [];
  for (let i = 0; i < PADS; i++) {
    const y = 1 - (i + 0.5) * (2 / PADS);
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const a = i * 2.399963229728653; // golden angle
    padDir.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
  }

  // --- preallocated scratch
  const camTarget = new THREE.Vector3(0, 0, 0);
  const poleDir = new THREE.Vector3(0, 1, 0);
  const prevPads = new Float32Array(PADS);

  // --- smoothed / integrated control state (CPU-side so the figure glides
  // between resonances instead of snapping frame to frame)
  let azim = 0, elev = 0;                       // camera orbit
  let modeLo = 3, modeMi = 5, modeHi = 9, modeZo = 4;
  let ampLo = 0.14, ampMi = 0.1, ampHi = 0.06, ampZo = 0.08;
  let pb0 = 0, pb1 = 0, pb2 = 0, pb3 = 0;       // polar phases (the azimuthal
                                                // ones are strike-seated, below)
  let micB = 0;                                 // fine-figure polar phase
  let wtime = 0;                                // wrapped clock for the strobe
  let band = 0;                                 // aura banding phase
  let hue = 0;                                  // slow palette travel
  let swaySm = 0.5;                             // smoothed sway -> mode morph
  let ring = 0;                                 // strike ring-down envelope
  let jumpPhase = 0;                            // mode-jump seed, hopped per strike
  let press = 0, flash = 0, auraScale = 1;
  let prevBeat = 0, beatCount = 0, poleSign = 1;

  // Phase wrap. Every phase enters the shader only as `sin(k*x + p)` with
  // integer k, so subtracting a whole turn is exact, no visible jump, and
  // float precision never decays over a long set.
  const wrap = (p) => (p >= TAU ? p - TAU : p < 0 ? p + TAU : p);
  // The strobe clock is used only as sin(uTime*40.0 + ...), and 40*20*PI is
  // a whole number of turns, so wrapping at 20*PI is likewise seamless.
  const TWRAP = Math.PI * 20;

  // Launch a ripple from `dir` into the next pool slot (round-robin).
  function launch(dir, amp) {
    ripDir[ripNext].copy(dir);
    ripAmp[ripNext] = amp;
    ripRad[ripNext] = 0;
    ripNext = (ripNext + 1) % RIPPLES;
  }

  return {
    scene,
    camera,
    update(dt, t, io) {
      const bass = io.bands.bass;
      const mid = io.bands.mid;
      const high = io.bands.high;
      const k = Math.min(1, dt * 6);      // fast smoothing
      const ks = Math.min(1, dt * 2.5);   // slow smoothing, for mode travel

      // --- camera: hand x orbits in azimuth, hand y in elevation, both
      // smoothed so sensor jitter never shakes the frame. The orbit is the
      // hand's alone, no drift term advances it on its own.
      azim += ((io.xy.x - 0.5) * 2.6 - azim) * k;
      elev += ((io.xy.y - 0.5) * 1.9 - elev) * k;
      const ce = Math.cos(elev);
      camera.position.set(Math.sin(azim) * ce * CAM_R, Math.sin(elev) * CAM_R,
        Math.cos(azim) * ce * CAM_R);
      camera.lookAt(camTarget);

      // --- pads: rising edge launches a ripple from that pad's own point on
      // the sphere, flashes the nodal set, and strikes the resonance itself
      // (the mode jump just below). Runs before the mode block so the jump
      // can land on the same frame as the hit.
      let hit = 0;
      for (let i = 0; i < PADS; i++) {
        const v = io.pads[i];
        if (v > 0.1 && v > prevPads[i] + 0.05) {
          launch(padDir[i], 0.35 + v * 0.65);
          if (v > hit) hit = v;
        }
        prevPads[i] = v;
      }
      flash = Math.max(flash * Math.pow(0.04, dt), hit);

      // --- strike: mode jump + ring-down. The jump seed hops by the golden
      // angle so consecutive strikes never land on neighbouring figures, and
      // the amplitude hit rings down over ~1.2 s like a struck bell.
      // io.strike carries the winning pad's energy on the hit frame.
      ring *= Math.pow(0.04, dt / 1.2);
      if (hit > 0) {
        jumpPhase = wrap(jumpPhase + 2.399963229728653);
        ring = Math.max(ring, 0.45 + io.strike * 0.85);
      }
      // jump offsets ride the mode targets below; every sin vanishes at
      // jumpPhase 0, so the orb boots on the pure band-driven figure
      const jLo = Math.sin(jumpPhase) * 2.2;
      const jMi = Math.sin(jumpPhase * 1.7) * 3.5;
      const jHi = Math.sin(jumpPhase * 2.3) * 5.0;
      const jZo = Math.sin(jumpPhase * 1.3) * 3.0;

      // --- mode numbers: bass picks the coarse figure, mid the middle,
      // high the fine one, and sway is the resonance morph, it lifts all
      // four orders at once, gliding the orb from a sparse low-order figure
      // to a dense high-order weave. The numbers are fractional and travel
      // continuously, so the figure morphs rather than stepping, except on
      // a strike frame, where km goes to 1 and the jump lands as a jump.
      swaySm += (io.gestures.sway - swaySm) * Math.min(1, dt * 1.8);
      const lift = swaySm - 0.5;
      const km = hit > 0 ? 1 : ks;
      modeLo += (Math.max(0.6, 1.5 + bass * 5.5 + lift * 3.5 + jLo) - modeLo) * km;
      modeMi += (Math.max(1.0, 3.0 + mid * 8.0 + lift * 6.0 + jMi) - modeMi) * km;
      modeHi += (Math.max(2.0, 6.0 + high * 13.0 + lift * 9.0 + jHi) - modeHi) * km;
      modeZo += (Math.max(1.0, 2.0 + io.level * 7.0 + lift * 5.0 + jZo) - modeZo) * km;
      u.uMode.value.set(modeLo, modeMi, modeHi, modeZo);

      // --- amplitudes: each band's energy is that term's contribution, with
      // an idle floor so a silent mix still shows a slow breathing figure.
      // The ring-down multiplies the whole stack: the strike swells the
      // displacement and bleeds away, while uNorm carries the same factor so
      // the nodal lines keep their weight through the ring.
      ampLo += ((0.10 + bass * 0.75) - ampLo) * k;
      ampMi += ((0.08 + mid * 0.55) - ampMi) * k;
      ampHi += ((0.05 + high * 0.40) - ampHi) * k;
      ampZo += ((0.06 + io.level * 0.30) - ampZo) * k;
      const rs = 1 + ring * 1.1;
      u.uAmp.value.set(ampLo * rs, ampMi * rs, ampHi * rs, ampZo * rs);
      // normalise the field by its own budget: the nodal lines then stay a
      // constant thickness instead of flooding the sphere on a quiet bar
      u.uNorm.value = 1 / Math.max(0.35, (ampLo + ampMi + ampHi + ampZo) * rs);

      // --- phases. The polar phases flow pole to pole at their own
      // band-driven rates, alternating direction per term, so the figure
      // churns along the axis. The azimuthal phases do NOT advance, an
      // azimuthal phase running in sin(m*phi + pa) would turn the whole lobe
      // pattern about the axis, and nothing here rotates on its own. They
      // sit on three distinct constants (so no two terms share a nodal
      // meridian) and re-seat with the strike's jump seed, landing as part
      // of the mode jump.
      pb0 = wrap(pb0 - dt * (0.22 + bass * 0.9));
      pb1 = wrap(pb1 + dt * (0.31 + mid * 1.1));
      pb2 = wrap(pb2 - dt * (0.44 + high * 1.7));
      pb3 = wrap(pb3 + dt * (0.18 + io.level * 0.8));
      u.uPhaseA.value.set(jumpPhase, 1.9 + jumpPhase * 1.7, 4.1 + jumpPhase * 2.3, 0);
      u.uPhaseB.value.set(pb0, pb1, pb2, pb3);

      // --- fine treble figure: much higher order, gated by the highs. Its
      // azimuthal phase is fixed for the same reason; only the polar one flows.
      micB = wrap(micB - dt * 0.8);
      u.uMicro.value.set(10 + high * 14, 0.7, micB);

      // --- beats: alternate between a pole shock and one thrown from the
      // last pad's position, so a run of beats never looks repetitive
      if (io.beat > prevBeat + 0.25) {
        beatCount = (beatCount + 1) & 1023; // bounded: only its parity is read
        if ((beatCount & 1) === 1 && io.lastPad >= 0) {
          launch(padDir[io.lastPad], 0.45 + io.beat * 0.4);
        } else {
          poleDir.set(0, poleSign, 0);
          poleSign = -poleSign;
          launch(poleDir, 0.45 + io.beat * 0.4);
        }
      }
      prevBeat = io.beat;

      // --- ripples expand outward (chord distance runs 0..2 across the
      // sphere) and bleed away exponentially
      const ripDecay = Math.pow(0.12, dt);
      for (let i = 0; i < RIPPLES; i++) {
        if (ripAmp[i] <= 0.002) continue;
        ripRad[i] += dt * 1.15;
        ripAmp[i] *= ripDecay;
        if (ripRad[i] > 2.7) ripAmp[i] = 0;
      }

      // --- press: resonance collapse. The displacement gain folds toward
      // zero (the orb becomes a perfect sphere) while the field driving the
      // nodal lines is untouched, so the figure stays painted on and burns
      // brighter, rather than the whole surface flashing white.
      press += (io.gestures.press - press) * k;
      u.uPress.value = press;
      // knobs 3 and 4 trim the look; 0.5 (their default) is the tuned value.
      // uNode stays small on purpose: the band covers ~9% of the surface at
      // the default, and because the field is amplitude-normalised that
      // figure barely moves between a silent bar and a loud one, the lines
      // stay the same weight instead of pumping the whole orb.
      u.uDisp.value = (0.10 + io.knobs[4] * 0.28) * (1 - press * 0.94);
      u.uNode.value = 0.02 + io.knobs[3] * 0.06 + press * 0.03 + flash * 0.03;
      u.uFlash.value = flash;

      // --- the orb holds its orientation: no drift on its axis. Sway's
      // travel goes into the mode numbers above, which is the difference
      // between turning a globe and re-striking a bell

      // --- bass/beat breathe the whole radius a little
      u.uBreathe.value = bass * 0.05 + io.beat * 0.03;
      u.uBeat.value = io.beat;
      u.uHigh.value = high;
      u.uIntensity.value = io.intensity;

      wtime += dt;
      if (wtime >= TWRAP) wtime -= TWRAP;
      u.uTime.value = wtime;

      hue += dt * 0.03;
      if (hue >= 1) hue -= 1;
      u.uHue.value = hue;
      au.uHue.value = hue;

      // --- aura: pulse scales the shell, loudness and beat feed the glow
      auraScale += ((1 + io.gestures.pulse * 0.26) - auraScale) * k;
      aura.scale.setScalar(auraScale);
      band = wrap(band + dt * 0.6);
      au.uBand.value = band;
      au.uGlow.value = (0.5 + io.level * 1.3 + io.beat * 1.1)
        * (0.55 + io.gestures.pulse * 0.9);
      au.uIntensity.value = io.intensity;

      // palette animates upstream, copy all five every frame, never mutate
      for (let i = 0; i < 5; i++) palette[i].copy(io.palette[i]);
    },
    resize(w, h) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    dispose() {
      orbGeo.dispose();
      orbMat.dispose();
      auraGeo.dispose();
      auraMat.dispose();
    },
  };
}
