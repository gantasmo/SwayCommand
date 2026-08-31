// Mandelbulb, a raymarched multi-formula fractal solid on one fullscreen quad.
//
// Two instruments, two time scales:
//
//   STRIKES JUMP THE FORMULA. A pad rising edge picks one of six distance
//   estimators (pad index modulo six) AND hops the iteration-constant seed
//   by the golden angle, so even a strike that lands on the same formula
//   lands in a new basin (a visibly different fractal) under a detonation
//   flash. Both event scalars are CPU-side with exponential decay, so the
//   solid changes shape ON the hit instead of popping silently.
//
//   HANDS BEND THE FORMULA. Every continuous gesture runs through heavy
//   exponential smoothing with long time constants (0.09 s for the treble
//   shimmer up to 3.0 s for the hand-height offset), so the gestures drift
//   the formula's own parameters rather than snapping them. Sway owns the
//   primary parameter, for the bulb that is the power itself, glid across
//   6..12, the canonical mandelbulb morph, press squeezes the secondary
//   fold while diving the camera, and bass breathes the primary parameter
//   AROUND whatever the hand set, so the solid pumps on the beat without
//   ever fighting the player.
//
// Rays that miss still paint neon haze, striped by the active formula's
// rotational symmetry order, so the frame keeps depth instead of falling to
// flat black. Nothing turns on its own: the solid holds its orientation and
// the haze stripes hold their angle, only the hand orbits the camera. One
// draw call, all GLSL3 (GLSL ES 3.00). Follows docs/SCENE_CONTRACT.md;
// reference style: beams.js.

export const meta = { id: 'mandelbulb', name: 'Mandelbulb', mood: 'infinite' };

const PADS = 16;
const TAU = Math.PI * 2;

// --- the six distance estimators, in pad order (pad index % FORMULAS)
const FORMULAS = 6;
const FORMULA_NAMES = [
  'Mandelbulb',
  'Mandelbox',
  'Julia Bulb',
  'Menger Sponge',
  'Sierpinski Tetra',
  'Apollonian',
];

// World -> formula space scale, per formula. The march happens inside a
// BOUND-radius sphere; each formula's natural extent is divided down to fit,
// so the camera rig, bounding sphere and haze work unchanged for all six.
const F_SCALE = [1.00, 5.20, 1.00, 1.45, 1.60, 1.15];

// Camera standoff multiplier per formula. F_SCALE fits each solid inside the
// marching bound, but the solids do not fill that bound equally, the box and
// the sponge occupy a much smaller fraction of it than the bulb, so without
// this the frame goes from full to postage-stamp when a pad switches formula.
const F_DIST = [1.00, 0.62, 1.00, 0.74, 0.78, 0.86];

// Step under-relaxation, per formula. The bulb DE is a tight lower bound and
// tolerates 0.95; the fold formulas overestimate near cell seams and need
// shorter steps to avoid punching through thin sheets.
const F_RELAX = [0.95, 0.88, 0.95, 0.82, 0.88, 0.80];

// Rotational symmetry order of each formula, used to stripe the outer haze.
const F_SYM = [8.0, 4.0, 8.0, 4.0, 3.0, 6.0];

// --- smoothing time constants, seconds (63 % settle time).
//     Structural parameters are slow, the camera is comparatively responsive,
//     audio envelopes are fast enough to still read as rhythm.
const TAU_SHAPE = 2.0;   // sway   -> primary shape parameter (the bulb's power)
const TAU_FOLD = 1.4;    // press  -> secondary fold / squeeze parameter
const TAU_DETAIL = 1.2;  // pulse  -> detail (epsilon / bailout) bias
const TAU_HEIGHT = 3.0;  // xy.y   -> slow formula offset (reshapes the solid)
const TAU_ORBIT = 0.22;  // xy     -> camera azimuth + elevation
const TAU_STAND = 0.30;  // knob 3 -> camera standoff
const TAU_KNOB = 0.80;   // knobs 4/5 -> direct formula parameters A and B
const TAU_TRIM = 0.45;   // knobs 6/7 -> colour-cycle rate, haze amount
const TAU_BASS = 0.16;   // bass breathing around the gesture-set value
const TAU_HIGH = 0.09;   // treble shimmer
const TAU_LEVEL = 0.55;  // loudness envelope for the haze swell

// Transition scalars: the flash is short and hard, the scale pulse rings a
// little longer so the size change reads as the solid inflating on the hit.
const TRANS_RATE = 6.2;  // flash decay, tau ~0.16 s
const SWELL_RATE = 2.5;  // scale-pulse decay, tau ~0.40 s

// Exponential approach with an explicit time constant. Frame-rate independent:
// tau is the time to close 63 % of the remaining gap regardless of dt.
function approach(cur, target, tau, dt) {
  return cur + (target - cur) * (1 - Math.exp(-dt / tau));
}

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function createScene(ctx) {
  const { THREE, quality } = ctx;
  const scene = new THREE.Scene();
  // Orthographic camera + 2x2 plane; the vertex shader emits clip-space
  // coords directly so the camera is only there to satisfy the contract.
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // --- quality budget: every loop bound is a compile-time constant so the
  //     shader compiler sees literal, unrollable counts (GLSL ES 3.00 would
  //     accept a uniform bound; the literal is kept for the unroll). Worst
  //     case per marched pixel is
  //     MB_STEPS * (iterations of the active formula), and the engine renders
  //     at canvas * devicePixelRatio (capped 1.75), 6.3 Mpx at 1080p, doubled
  //     during a crossfade. med holds the bulb at 44 * 6 = 264 iterations, the
  //     same budget as before. The fold formulas get more iterations only
  //     because they cost far less each: a bulb iteration is a pow + acos +
  //     atan + two sin/cos, a Sierpinski iteration is three compares and a
  //     multiply-add, so 44 * 9 folds is cheaper than 44 * 6 bulbs.
  const tier = quality.tier;
  const MB_STEPS = tier === 'high' ? 72 : tier === 'low' ? 30 : 44;
  const BULB_ITER = tier === 'high' ? 8 : tier === 'low' ? 4 : 6;   // 0, 2
  const BOX_ITER = tier === 'high' ? 10 : tier === 'low' ? 5 : 7;   // 1
  const MENGER_ITER = tier === 'high' ? 7 : tier === 'low' ? 4 : 5; // 3
  const TETRA_ITER = tier === 'high' ? 12 : tier === 'low' ? 6 : 9; // 4
  const APO_ITER = tier === 'high' ? 9 : tier === 'low' ? 5 : 7;    // 5

  // --- palette uniforms: five preallocated colors, .copy()'d every frame
  const palette = [
    new THREE.Color(), new THREE.Color(), new THREE.Color(),
    new THREE.Color(), new THREE.Color(),
  ];

  const geo = new THREE.PlaneGeometry(2, 2);
  const mat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    depthTest: false,
    depthWrite: false,
    defines: {
      MB_STEPS: MB_STEPS,
      BULB_ITER: BULB_ITER,
      BOX_ITER: BOX_ITER,
      MENGER_ITER: MENGER_ITER,
      TETRA_ITER: TETRA_ITER,
      APO_ITER: APO_ITER,
    },
    uniforms: {
      uTime: { value: 0 },
      uAspect: { value: ctx.width / ctx.height },
      uCamPos: { value: new THREE.Vector3(0, 0, 2.8) }, // orbit, CPU-smoothed
      uFormula: { value: 0 },      // active distance estimator, 0..5 (pads)
      uParamA: { value: 8 },       // primary shape parameter (sway + bass)
      uParamB: { value: 0 },       // secondary fold / asymmetry (press)
      uOffset: { value: new THREE.Vector3() }, // slow offset (hand height)
      uSolidScale: { value: 1 },   // world -> formula space, with scale pulse
      uRelax: { value: 0.95 },     // per-formula step under-relaxation
      uJuliaSel: { value: 0 },     // 1 only for the Julia bulb
      uJuliaC: { value: new THREE.Vector3(0, 0, 0) },   // lissajous constant
      uSym: { value: 8 },          // haze symmetry order of the formula
      uDetail: { value: 0 },       // epsilon / bailout bias (pulse)
      uHaze: { value: 1 },         // haze amount (knob 7)
      uHuePhase: { value: 0 },     // integrated colour-cycle phase (knob 6)
      uTrans: { value: 0 },        // formula-change detonation flash
      uBeat: { value: 0 },         // rim punch
      uHigh: { value: 0 },         // treble shimmer amount
      uBass: { value: 0 },         // haze swell
      uGlow: { value: 0 },         // beat + pad detonation glow spike
      uHitColor: { value: new THREE.Color() }, // last pad's palette color
      uColors: { value: palette },
      uIntensity: { value: 1 },
    },
    vertexShader: /* glsl */ `
      out vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0); // fullscreen, no matrices
      }`,
    fragmentShader: /* glsl */ `
      in vec2 vUv;

      uniform float uTime, uAspect, uHuePhase;
      uniform float uParamA, uParamB, uSolidScale, uJuliaSel, uRelax;
      uniform float uDetail, uHaze, uTrans, uSym;
      uniform float uBeat, uHigh, uBass, uGlow, uIntensity;
      uniform vec3  uCamPos, uJuliaC, uHitColor, uOffset;
      uniform vec3  uColors[5];
      uniform int   uFormula;

      out vec4 fragColor;

      const float BOUND = 1.40; // bounding sphere; every formula fits inside
      const float FOCAL = 1.70; // ray-fan tightness (~60 deg vertical fov)

      const float BOX_MINR2 = 0.25; // mandelbox inner sphere-fold radius^2
      const float BOX_FIXR2 = 1.00; // mandelbox outer sphere-fold radius^2

      // orbit trap and iteration measure, both normalised to 0..1 by whichever
      // estimator ran. Written by mapDE, read straight after the march loop
      // (the normal taps overwrite them, so capture first).
      float gTrap;
      float gIter;

      // wrap-around lerp across all five palette entries, t in [0..5)
      vec3 pal(float t) {
        vec3 c = mix(uColors[0], uColors[1], clamp(t, 0.0, 1.0));
        c = mix(c, uColors[2], clamp(t - 1.0, 0.0, 1.0));
        c = mix(c, uColors[3], clamp(t - 2.0, 0.0, 1.0));
        c = mix(c, uColors[4], clamp(t - 3.0, 0.0, 1.0));
        return mix(c, uColors[0], clamp(t - 4.0, 0.0, 1.0));
      }

      float sdBox(vec3 p, float b) {
        vec3 q = abs(p) - vec3(b);
        return min(max(q.x, max(q.y, q.z)), 0.0) + length(max(q, 0.0));
      }

      // --- 0 Mandelbulb / 2 Julia bulb -------------------------------------
      // Power-N spherical iteration with a running derivative. c is the sample
      // point for the pure bulb; uJuliaSel swaps it for the animated constant,
      // which is the only difference between the two formulas, so they share
      // one loop body instead of duplicating the most expensive one twice.
      // uParamA is the exponent (6..12), uParamB twists the azimuth.
      float deBulb(vec3 pos) {
        vec3 z = pos;
        vec3 cc = mix(pos, uJuliaC, uJuliaSel) + uOffset;
        float pw = max(uParamA, 1.5);
        float dr = 1.0;
        float r = 0.0;
        float trap = 1e4;
        float it = 0.0;
        float bail = 2.2 + uDetail * 0.9;
        for (int i = 0; i < BULB_ITER; i++) {
          r = length(z);
          if (r > bail) break;         // bailout: far field leaves in 1-2 steps
          trap = min(trap, dot(z, z)); // sphere orbit trap -> surface color
          it += 1.0;
          float rs = max(r, 1e-6);
          float zr = pow(rs, pw);
          dr = (zr / rs) * pw * dr + 1.0;   // == pow(r, p - 1.0) * p * dr + 1
          float th = acos(clamp(z.z / rs, -1.0, 1.0)) * pw;
          float ph = atan(z.y, z.x + 1e-9) * pw + uParamB;
          z = zr * vec3(sin(th) * cos(ph), sin(th) * sin(ph), cos(th)) + cc;
        }
        gTrap = clamp(sqrt(max(trap, 0.0)) * 1.25, 0.0, 1.0);
        gIter = it / float(BULB_ITER);
        r = max(r, 1e-6);
        // r stuck below the bailout means the orbit stayed bounded: inside
        return max(0.5 * log(r) * r / max(abs(dr), 1e-6), 0.0);
      }

      // --- 1 Mandelbox ------------------------------------------------------
      // Box fold (reflect each component about +/- uParamB), then sphere fold
      // (rescale by the two radius thresholds), then z = scale * z + c, with
      // the standard derivative tracking. The sphere fold's three cases
      // collapse into one clamp: BOX_FIXR2 / clamp(r2, MIN, FIX) is
      // FIX/MIN below the inner radius, FIX/r2 between them, and 1.0 outside.
      float deBox(vec3 pos) {
        float s = uParamA;               // scale, -2.6..-1.6 and 1.6..3.0
        float fl = max(uParamB, 0.15);   // folding limit
        // the box lives in a ~7-unit space, so the shared world-space offset
        // is scaled up to stay a meaningful shift of the iteration constant
        vec3 c = pos + uOffset * 2.5;
        vec3 z = pos;
        float dr = 1.0;
        float trap = 1e4;
        float it = 0.0;
        float bail = 48.0 + uDetail * 64.0;
        for (int i = 0; i < BOX_ITER; i++) {
          z = clamp(z, -fl, fl) * 2.0 - z;            // box fold about +/- fl
          float r2 = dot(z, z);
          if (r2 > bail) break;
          trap = min(trap, r2);
          it += 1.0;
          float g = BOX_FIXR2 / clamp(r2, BOX_MINR2, BOX_FIXR2); // sphere fold
          z *= g;
          dr *= g;
          z = z * s + c;
          dr = dr * abs(s) + 1.0;
        }
        gTrap = clamp(sqrt(min(max(trap, 0.0), 16.0)) * 0.45, 0.0, 1.0);
        gIter = it / float(BOX_ITER);
        return length(z) / max(abs(dr), 1e-6);
      }

      // --- 3 Menger sponge --------------------------------------------------
      // Classic box-minus-cross construction: start from a cube, then at every
      // level fold space into a cell and subtract the three-axis cross. The
      // fold scale uParamA also scales the cross, so the estimator stays
      // Lipschitz-1 for any scale, not just the textbook 3.0. uParamB slides
      // the cell lattice, which walks the holes through the solid.
      float deMenger(vec3 pos) {
        vec3 z = pos + uOffset;
        float d = sdBox(z, 1.0);
        float s = 1.0;
        float sc = max(uParamA, 1.2);
        float off = uParamB;
        float trap = 1e4;
        float fc = 0.0;
        for (int i = 0; i < MENGER_ITER; i++) {
          vec3 a = mod(z * s + off, 2.0) - 1.0;
          s *= sc;
          vec3 r = abs(1.0 - sc * abs(a));
          trap = min(trap, dot(a, a));
          float da = max(r.x, r.y);
          float db = max(r.y, r.z);
          float dc = max(r.z, r.x);
          float cr = (min(da, min(db, dc)) - 1.0) / s; // s >= 1.2, never zero
          fc += step(d, cr);                           // which level carved it
          d = max(d, cr);
        }
        gTrap = clamp(sqrt(max(trap, 0.0)) * 0.85, 0.0, 1.0);
        gIter = fc / float(MENGER_ITER);
        return d;
      }

      // --- 4 Sierpinski tetrahedron ----------------------------------------
      // Fold against the three planes that generate the tetrahedral group,
      // then scale about the vertex offset. The fold count is the colour
      // channel: it bands the solid by how deep the point sits in the group.
      float deTetra(vec3 pos) {
        vec3 z = pos;
        float sc = max(uParamA, 1.15);
        vec3 o = vec3(uParamB) + uOffset;
        float dr = 1.0;
        float trap = 1e4;
        float fc = 0.0;
        for (int i = 0; i < TETRA_ITER; i++) {
          if (z.x + z.y < 0.0) { z.xy = -z.yx; fc += 1.0; }
          if (z.x + z.z < 0.0) { z.xz = -z.zx; fc += 1.0; }
          if (z.y + z.z < 0.0) { z.zy = -z.yz; fc += 1.0; }
          z = z * sc - o * (sc - 1.0);
          dr *= sc;
          trap = min(trap, dot(z, z));
        }
        gTrap = clamp(sqrt(max(trap, 0.0)) * 0.35, 0.0, 1.0);
        gIter = fc / (3.0 * float(TETRA_ITER));
        return (length(z) - 1.0) / max(dr, 1e-6);
      }

      // --- 5 Apollonian / Kleinian -----------------------------------------
      // Repeated inversion in a sphere of radius^2 uParamA, each pass preceded
      // by a modulo fold back into the unit cell, so the gasket tiles space.
      // The fold keeps z inside [-1,1] before each inversion, so nothing here
      // can run away to infinity: only the accumulated scale grows.
      float deApollonian(vec3 pos) {
        vec3 z = pos + uOffset;
        float ir = max(uParamA, 0.35);
        float off = uParamB;
        float scale = 1.0;
        float trap = 1e4;
        float fc = 0.0;
        for (int i = 0; i < APO_ITER; i++) {
          z = -1.0 + 2.0 * fract(0.5 * z + 0.5 + off);  // modulo fold
          float r2 = max(dot(z, z), 0.02);              // guarded inversion
          float k = ir / r2;
          z *= k;
          scale *= k;
          trap = min(trap, r2);
          fc += step(r2, ir);
        }
        gTrap = clamp(sqrt(max(trap, 0.0)) * 1.10, 0.0, 1.0);
        gIter = fc / float(APO_ITER);
        return 0.25 * abs(z.y) / max(scale, 1e-6);
      }

      // Formula dispatch. uFormula is uniform across the whole frame, so this
      // chain is uniform control flow: every fragment takes the same branch
      // and there is no divergence cost, only one live code path per draw.
      // uSolidScale maps world space into the active formula's own space (and
      // carries the transition scale pulse); dividing the result back out
      // keeps the returned distance in world units for the marcher.
      float mapDE(vec3 wp) {
        float k = max(uSolidScale, 0.05);
        vec3 p = wp * k;
        float d;
        if (uFormula == 1)      d = deBox(p);
        else if (uFormula == 3) d = deMenger(p);
        else if (uFormula == 4) d = deTetra(p);
        else if (uFormula == 5) d = deApollonian(p);
        else                    d = deBulb(p);   // 0 and 2 share the loop
        return d / k;
      }

      // 4-tap tetrahedral gradient of the DE
      vec3 calcNormal(vec3 p, float e) {
        vec2 k = vec2(1.0, -1.0);
        vec3 g = k.xyy * mapDE(p + k.xyy * e)
               + k.yyx * mapDE(p + k.yyx * e)
               + k.yxy * mapDE(p + k.yxy * e)
               + k.xxx * mapDE(p + k.xxx * e);
        float gLen = length(g);
        if (gLen < 1e-8) return vec3(0.0, 1.0, 0.0); // degenerate pit, fake up
        return g / gLen;
      }

      void main() {
        gTrap = 1.0;
        gIter = 0.0;

        vec2 q = (vUv - 0.5) * 2.0;
        q.x *= uAspect;

        // camera orbits the origin (io.xy, CPU-smoothed) and always looks at it
        vec3 ro = uCamPos;
        vec3 fw = normalize(-ro);
        // right-handed basis: cross(fw, worldUp) is +right, so the image is
        // not mirrored and the solid turns the same way the hand does.
        // el is CPU-clamped to +/-1.25 rad, so fw is never parallel to worldUp
        // and this cross can never degenerate to a zero vector.
        vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
        vec3 up = cross(rt, fw);
        vec3 rd = normalize(fw * FOCAL + rt * q.x + up * q.y);
        // the solid sits fixed in world space: no spin of its own, the only
        // turning is the hand's camera orbit above

        // closest approach of the ray to the origin, cheap outer-haze basis
        float tc = max(-dot(ro, rd), 0.0);
        vec3 cp = ro + rd * tc;
        float perp = length(cp);

        // bounding sphere: rays that never enter it skip the march entirely,
        // which is what keeps this inside budget on integrated graphics
        float bb = dot(ro, rd);
        float cs = dot(ro, ro) - BOUND * BOUND;
        float hh = bb * bb - cs;
        float tNear = 0.0;
        float tFar = -1.0;
        if (hh > 0.0) {
          hh = sqrt(hh);
          tNear = max(-bb - hh, 0.0);
          tFar = -bb + hh;
        }

        // pulse biases the pixel-footprint epsilon: tighter epsilon resolves
        // more filigree, looser epsilon fattens the solid and marches shorter
        float epsBias = 1.15 - 0.45 * uDetail;

        float tt = tNear;
        float dmin = perp - BOUND + 0.30; // stand-in when the bound is missed
        float steps = 0.0;
        float hit = 0.0;
        float glow = 0.0;
        float trapHit = 0.0;
        float iterHit = 0.0;

        if (tFar > tt) {
          dmin = BOUND;
          for (int i = 0; i < MB_STEPS; i++) {
            vec3 p = ro + rd * tt;
            float d = mapDE(p);
            dmin = min(dmin, d);
            float eps = (0.0010 + tt * 0.0028) * epsBias;
            glow += exp(-max(d, 0.0) * 24.0) * 0.055; // volumetric haze
            if (d < eps) {                            // early out on distance
              hit = 1.0;
              trapHit = gTrap;
              iterHit = gIter;
              break;
            }
            if (glow > 2.2) break;                    // early out on alpha
            tt += max(d * uRelax, eps);               // under-relaxed step
            if (tt > tFar) break;
            steps += 1.0;
          }
        }
        dmin = max(dmin, 0.0);

        vec3 col = vec3(0.0);

        if (hit > 0.5) {
          vec3 p = ro + rd * tt;
          vec3 n = calcNormal(p, (0.0006 + tt * 0.0015) * epsBias);

          // fresnel-like view term: hue travels with the viewing angle, so the
          // solid shears through the whole palette as the camera orbits
          float fres = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 3.0);

          // Azimuth around the solid spreads the palette across the lobes; the
          // orbit trap alone clusters most of the surface into one palette
          // region, which reads as a single-hue object rather than a jewel.
          float azi = atan(p.z, p.x + 1e-9) * 0.1591549;   // -0.5 .. 0.5
          float hue = trapHit * 1.55 + iterHit * 0.55 + fres * 0.70
                    + azi * 0.85 + n.y * 0.28 + uHuePhase;
          vec3 base = pal(fract(hue) * 5.0);
          vec3 irid = pal(fract(hue + 0.36) * 5.0);
          col = mix(base, irid, fres * 0.85); // iridescent, never lambert

          // high-frequency filigree across the trap, detail that rewards staring
          float bands = 0.5 + 0.5 * sin(trapHit * 44.0 - uTime * 1.1 + iterHit * 11.0);
          // Floors are generous: interpolating between complementary palette
          // entries already darkens the midpoints, so stacking two low-floor
          // multipliers on top sinks the whole solid.
          col *= 0.55 + 0.70 * bands;

          // ambient occlusion from march effort: creases and pits go deep black
          float ao = clamp(1.0 - steps * (1.5 / float(MB_STEPS)), 0.10, 1.0);
          col *= 0.38 + 0.80 * ao;

          // hard neon rim on the silhouette, punched by the beat
          col += pal(fract(hue + 0.5) * 5.0) * pow(fres, 1.5) * (0.70 + uBeat * 1.3);

          // treble shimmer: strobing micro-flecks locked to surface position
          float sh = sin(dot(p, vec3(97.0, 113.0, 89.0)) + uTime * 26.0);
          sh = smoothstep(0.88, 1.0, sh) * step(0.5, fract(uTime * 11.0 + iterHit));
          col += pal(fract(hue + 0.17) * 5.0) * sh * uHigh * 1.4;

          // pad detonation flares the solid in that pad's own palette color
          col += uHitColor * uGlow * 0.16 * (0.25 + fres);

          // formula change: the new solid arrives white-hot from the inside out
          col += mix(uHitColor, vec3(1.0), 0.35) * uTrans * (0.55 + fres * 1.30);

          // fade past the bounding-sphere entry so far lobes sink into black
          col *= exp(-max(tt - (length(ro) - BOUND), 0.0) * 0.75);
        }

        // Volumetric neon haze: how close the ray passed plus the marched
        // accumulation, striped by the active formula's own rotational
        // symmetry so misses read as a kaleidoscopic corona, not black. The
        // stripes hold a fixed angle (no phase advance: they do not spin);
        // the hand's orbit is what carries the pattern across the frame.
        float sym = 0.60 + 0.40 * cos(atan(cp.y, cp.x + 1e-9) * uSym);
        float halo = exp(-dmin * 7.0);
        vec3 hazeCol = pal(fract(dmin * 1.3 + uHuePhase + 0.35) * 5.0);
        col += hazeCol * (glow * 0.11 + halo * 0.30 * sym)
             * (0.45 + uGlow * 0.50 + uBass * 0.30) * uHaze;

        // detonation shockwave: a bright ring expanding off the silhouette,
        // so the formula switch is visible even on rays that miss the solid
        col += mix(uHitColor, vec3(1.0), 0.5) * uTrans * uTrans
             * exp(-abs(dmin - (1.0 - uTrans) * 0.9) * 9.0) * 0.9;

        fragColor = vec4(col * uIntensity, 1.0);
      }`,
  });
  const quad = new THREE.Mesh(geo, mat);
  quad.frustumCulled = false; // clip-space quad, skip culling
  scene.add(quad);

  // --- preallocated CPU-side state (update() allocates nothing)
  const u = mat.uniforms;
  let formula = 0;     // active distance estimator, switched by pads
  let az = 0;          // smoothed orbit azimuth, radians
  let el = 0;          // smoothed orbit elevation, radians
  let huePhase = 0;    // integrated colour-cycle phase (knob 6 sets the rate)
  let swaySm = 0.5;    // slow: sway  -> primary shape parameter (the power)
  let pressSm = 0;     // slow: press -> secondary fold squeeze + camera dive
  let pulseSm = 0;     // slow: pulse -> detail bias
  let heightSm = 0.5;  // very slow: hand height -> formula offset
  let k3 = 0.5, k4 = 0.5, k5 = 0.5, k6 = 0.5, k7 = 0.5; // smoothed knobs 3..7
  let bassSm = 0;      // bass envelope: breathes the shape around the hand
  let highSm = 0;      // treble envelope
  let levelSm = 0;     // loudness envelope
  let dolly = 0;       // beat dolly toward the surface, exponential decay
  let deton = 0;       // pad detonation energy, exponential decay
  let trans = 0;       // formula-change flash, exponential decay
  let swell = 0;       // formula-change scale pulse, exponential decay
  let hitIdx = 0;      // palette slot of the most recent pad hit
  let basin = 0;       // iteration-constant seed phase, hopped by strikes
  const prevPads = new Float32Array(PADS); // rising-edge detection scratch

  const api = {
    scene,
    camera,
    // Display name of the live formula. An extra plain-string property on the
    // returned object is outside the contract's required members but does not
    // conflict with any of them; update() keeps it current.
    formulaName: FORMULA_NAMES[0],
    update(dt, t, io) {
      // ---- knobs 3..7 only; 0..2 are engine-reserved and never read here
      k3 = approach(k3, io.knobs[3], TAU_STAND, dt);
      k4 = approach(k4, io.knobs[4], TAU_KNOB, dt);
      k5 = approach(k5, io.knobs[5], TAU_KNOB, dt);
      k6 = approach(k6, io.knobs[6], TAU_TRIM, dt);
      k7 = approach(k7, io.knobs[7], TAU_TRIM, dt);

      // ---- event decays, before this frame's edges can re-arm them
      deton *= Math.pow(0.04, dt);
      trans *= Math.exp(-dt * TRANS_RATE);
      swell *= Math.exp(-dt * SWELL_RATE);

      // ---- pads: a rising edge detonates the solid, and the pad index modulo
      //      six also selects which distance estimator is marched. Switching
      //      arms the transition so the change lands as an event, not a pop.
      let padMax = 0;
      let padIdx = -1;
      for (let i = 0; i < PADS; i++) {
        const v = io.pads[i];
        if (v > prevPads[i] + 0.08 && v > padMax) { padMax = v; padIdx = i; }
        prevPads[i] = v;
      }
      if (padIdx >= 0) {
        deton = Math.max(deton, padMax);
        hitIdx = padIdx % 5;
        // every strike is a phase jump: the seed phase hops by the golden
        // angle, relocating the iteration constant (and the julia orbit) to
        // a new basin, so the strike lands on a visibly different fractal
        // even when the formula stays the same. Golden-angle steps never
        // revisit a neighbouring basin two strikes running.
        basin = (basin + 2.399963229728653) % TAU;
        const next = padIdx % FORMULAS;
        if (next !== formula) {
          formula = next;
          trans = 1;   // bright detonation flash
          swell = 1;   // brief scale pulse: the new solid inflates into place
          api.formulaName = FORMULA_NAMES[formula]; // closure, not `this`
        } else {
          trans = Math.max(trans, 0.55); // same formula, new basin: the jump
        }                                // still arrives under a glow flash
      }

      // ---- beat: brief dolly toward the surface plus a glow spike
      dolly = Math.max(dolly * Math.pow(0.02, dt), io.beat);

      // ---- audio envelopes
      bassSm = approach(bassSm, io.bands.bass, TAU_BASS, dt);
      highSm = approach(highSm, io.bands.high, TAU_HIGH, dt);
      levelSm = approach(levelSm, io.level, TAU_LEVEL, dt);

      // ---- gestures, heavily smoothed: the shape drifts, it never snaps
      swaySm = approach(swaySm, io.gestures.sway, TAU_SHAPE, dt);
      pressSm = approach(pressSm, io.gestures.press, TAU_FOLD, dt);
      pulseSm = approach(pulseSm, io.gestures.pulse, TAU_DETAIL, dt);
      heightSm = approach(heightSm, io.xy.y, TAU_HEIGHT, dt);

      // Normalised shape controls, mapped into each formula's own range below.
      // Smoothing happens here, in normalised space, so a formula switch
      // remaps the range instantly without a jump in the underlying gesture.
      // SWAY owns the primary parameter, the formula's own shape glides
      // across its whole travel, nothing so cheap as a lean, and press owns
      // the secondary fold: the squeeze tightens the formula while the
      // camera dives (below). Bass rides ON TOP of the sway value: it
      // breathes the solid around wherever the hand put it instead of
      // overriding it.
      const a01 = clamp01(swaySm * 0.85 + (k4 - 0.5) * 0.60 + 0.06
                          + (bassSm - 0.28) * 0.30);
      const b01 = clamp01(pressSm * 0.80 + (k5 - 0.5) * 0.60 + 0.10);

      // ---- per-formula parameter mapping
      let pA = 8;
      let pB = 0;
      let juliaR = 0;
      if (formula === 1) {
        // Mandelbox scale, split around the degenerate |scale| < 1.6 middle so
        // the whole travel of the hand stays in structured territory.
        pA = a01 < 0.5 ? -2.6 + a01 * 2.0 : 1.6 + (a01 - 0.5) * 2.8;
        pB = 0.55 + b01 * 1.05;              // folding limit
      } else if (formula === 3) {
        pA = 1.8 + a01 * 0.8;                // menger fold scale
        pB = -0.5 + b01 * 1.0;               // cell offset: walks the holes
      } else if (formula === 4) {
        pA = 1.8 + a01 * 0.8;                // sierpinski scale
        pB = 0.55 + b01 * 0.60;              // vertex offset
      } else if (formula === 5) {
        pA = 0.85 + a01 * 0.75;              // inversion radius^2
        pB = -0.22 + b01 * 0.44;             // cell offset
      } else {
        // the canonical mandelbulb morph: sway glides the power itself, and
        // the whole solid re-forms (lobe count, pinch, filigree) as the
        // exponent travels. Iteration cost is exponent-independent, so the
        // wider range is free.
        pA = 6.0 + a01 * 6.0;                // bulb / julia exponent, 6..12
        if (formula === 2) {
          pB = 0.0;                          // no twist: press owns c's orbit
          juliaR = 0.18 + b01 * 0.55;        // julia c orbit radius
        } else {
          pB = (b01 - 0.5) * 1.8;            // azimuth twist -> asymmetry
        }
      }

      u.uFormula.value = formula;
      u.uParamA.value = pA;
      u.uParamB.value = pB;
      u.uJuliaSel.value = formula === 2 ? 1 : 0;
      u.uSym.value = (formula === 0 || formula === 2) ? pA : F_SYM[formula];
      u.uRelax.value = F_RELAX[formula];
      // World -> formula space, widened by the transition swell: the new solid
      // arrives collapsed to two thirds and springs back out over ~0.4 s. The
      // pulse deliberately shrinks rather than grows, growing past F_SCALE
      // would push the solid through the fixed BOUND sphere and shear its
      // silhouette flat against it.
      u.uSolidScale.value = F_SCALE[formula] * (1 + swell * 0.45);

      // the julia constant walks a lissajous at the press-set radius; the
      // basin phase shears all three component phases, so a strike relocates
      // c to a different arc of the orbit, a different julia set
      u.uJuliaC.value.set(
        Math.sin(t * 0.17 + basin) * juliaR,
        Math.sin(t * 0.23 + 1.7 + basin * 1.7) * juliaR * 0.92,
        Math.cos(t * 0.13 + basin * 2.3) * juliaR * 0.96,
      );

      // hand height still reshapes the solid on the slowest constant of all,
      // and the basin phase adds a fixed seed displacement on top: every
      // sin term vanishes at basin 0, so the scene boots on the pure
      // formula, and after a strike the constant sits somewhere genuinely
      // new until the next one moves it again
      u.uOffset.value.set(
        Math.sin(t * 0.11 + basin) * 0.03 + Math.sin(basin * 1.9) * 0.10,
        (heightSm - 0.5) * 0.22 + Math.sin(basin * 2.7) * 0.07,
        Math.cos(t * 0.09 + basin * 1.3) * 0.03 + Math.sin(basin * 2.2) * 0.10,
      );

      // ---- hand orbits the camera: x is azimuth over a full turn, y is
      //      elevation. Azimuth smooths the short way around the wrap.
      const kOrbit = 1 - Math.exp(-dt / TAU_ORBIT);
      let dAz = io.xy.x * TAU - az;
      while (dAz > Math.PI) dAz -= TAU;
      while (dAz < -Math.PI) dAz += TAU;
      az += dAz * kOrbit;
      if (az > Math.PI) az -= TAU; else if (az < -Math.PI) az += TAU;
      // clamped short of the poles so the look-at basis never degenerates
      el += (Math.max(-1.25, Math.min(1.25, (io.xy.y - 0.5) * 2.3)) - el) * kOrbit;

      // knob 3 sets the standoff distance, and press dives the camera toward
      // the surface, the squeeze is also a dive. The 1.55 floor stays clear
      // of the 1.40 marching bound for every formula's F_DIST, so the camera
      // can never end up inside the bounding sphere.
      const rad = Math.max(1.55,
        (2.15 + k3 * 1.35 - dolly * 0.50 - swell * 0.10 - pressSm * 0.50)
        * F_DIST[formula]);
      const ce = Math.cos(el);
      u.uCamPos.value.set(
        Math.sin(az) * ce * rad,
        Math.sin(el) * rad,
        Math.cos(az) * ce * rad,
      );

      // ---- no idle spin: the solid holds its orientation, and sway's whole
      //      travel goes into the exponent above, where it morphs the fractal
      //      instead of merely turning it.

      // ---- knob 6 sets the colour-cycling rate; integrating the phase means
      //      turning the knob changes the speed without jumping the hue
      huePhase += dt * (0.004 + k6 * 0.16);
      huePhase -= Math.floor(huePhase);
      u.uHuePhase.value = huePhase;

      u.uTime.value = t;
      u.uDetail.value = pulseSm;
      u.uHaze.value = 0.30 + k7 * 1.30;      // knob 7 owns the haze amount
      u.uTrans.value = trans;
      u.uBeat.value = io.beat;
      u.uHigh.value = highSm;
      // haze swells with the bass envelope and with overall loudness
      u.uBass.value = bassSm * 0.7 + levelSm * 0.5;
      u.uGlow.value = Math.min(1.8, io.beat * 0.7 + deton * 1.1 + trans * 0.8);
      u.uIntensity.value = io.intensity;

      // palette animates upstream, copy all five every frame, never mutate
      for (let i = 0; i < 5; i++) palette[i].copy(io.palette[i]);
      u.uHitColor.value.copy(io.palette[hitIdx]);
    },
    resize(w, h) {
      u.uAspect.value = w / h; // ortho quad ignores the camera aspect
    },
    dispose() {
      geo.dispose();
      mat.dispose();
    },
  };

  return api;
}
