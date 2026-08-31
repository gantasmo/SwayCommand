// Nature's Tomb, the weather systems. A scene-private module (never
// registered, no meta): the five systems that were the Weather Systems scene
// (TORNADO, HURRICANE, LIGHTNING, WILDFIRE, SANDSTORM) ported whole into
// Nature's Tomb as its weather plates, with the hurricane and the wildfire
// raised. The factory builds the world quad and its three impostor meshes
// and returns them with an update the Tomb drives; the Tomb owns the knob,
// the cold open, the strikes and the dissolve between plates, and this
// module owns everything inside the weather: the two-eye dissolve between
// its own systems, the CPU systems (bolts as L-systems on capsules, the
// ignition circles, the trees, the debris flecks and embers, the flashes),
// the builds, calm.
//
//   PLATES      The Tomb hands in which system it wants (its organism bands
//               10..14 are LIGHTNING, TORNADO, HURRICANE, WILDFIRE,
//               SANDSTORM) and the weight the weather as a whole has on the
//               plate. A change of system inside the weather is the DISSOLVE
//               Weather Systems had: both systems render through their own
//               eyes (two camera frames in one world quad) and cross-fade
//               over half a second, each marching a shorter step budget while
//               it shares the frame; a change between the weather and another
//               plate is the Tomb's 0.15 s knob dissolve, both quads drawn
//               weighted and added.
//   INTENSITY   The Tomb's development level, how far the funnel hangs, its
//               width, spin and rain; how tight the eye is and how fast the
//               bands run; the bolt rate and the cell's mass; the fire's
//               spread and flame height; the wall's height and speed.
//   EVENTS      mainEvent() fires the system on screen's main event (a pad on
//               a weather plate): TOUCHDOWN, EYEWALL, STRIKE, FLARE UP, GUST.
//               event(key) takes the declared actions, strike (a bolt in ANY
//               system), touchdown, gust, flareUp, eyewall, calm (everything
//               stands down over ten seconds).
//   GESTURES    SWAY morphs one generative parameter per system, funnel
//               tortuosity, band tightness, bolt branching, the wind that
//               drives the fire, dust density; PRESS squeezes, the funnel
//               thins, the eye contracts and its wall steepens, the cloud base
//               drops, the flames crush low, the wall's face steepens. The
//               hand is the ONLY camera motion: X pans the eye, Y lifts it.
//   COLD OPEN   The Tomb's: a weather plate selected while the plate is dark
//               shows its calm sky faintly (a thin stratus, a haze, a faint
//               cloud base breathing with the level) and BUILDS when the show
//               starts, the supercell thickens and the funnel grows down, the
//               bands wind in round the eye, the cell closes, the fire spreads
//               from its ignition, the wall rises far out, and the opening
//               fires its main event.
//
//   TORNADO     As it was: a supercell over farm country at dusk, fields in
//               strips, a road with power poles and wires, a farm and a
//               windbreak as silhouettes, the dusk band on the horizon; a
//               marched deck whose noise domain FLOWS round the mesocyclone
//               (a bounded flow-map advection) and is striated near the axis,
//               a wall cloud lowering round the funnel, a shelf cloud on the
//               rain side, mammatus pouches, lightning in the cell; the
//               funnel a marched wedge whose axis wanders with height by
//               sway's tortuosity and whose surface is a helical noise domain
//               flowing round and down it (the rotating look, no rotation);
//               on touchdown a debris cloud boils at the foot (a marched dust
//               dome plus instanced flecks lofting on a helical field).
//   HURRICANE   From orbit, the eye under the camera, RAISED: the cloud tops
//               a heightfield marched from above and refined by bisection,
//               now with a fine CELLULAR octave in the spiral's own
//               coordinates (elongated along the arms and drifting along them
//              , a flow, not a turn) that reads as convective cells and
//               streaks rather than smooth bands, whose peaks stand up as HOT
//               TOWERS, tallest on the eyewall ring, pulsing with the bass,
//               that the two shadow taps see, so the towers shadow the bands
//               and the wall shadows the eye; the eye's STADIUM in terraces,
//               the sea glittering in it on a finer facet field; LIGHTNING in
//               the eyewall (the flashes sit under the tops and light them
//               from within); a CIRRUS OUTFLOW canopy above the deck, thin
//               and sun-lit, spiralling the other way and spreading outward;
//               gaps between the bands showing the sea with the clouds'
//               shadows on it; aerial perspective toward the limb; and a SUN
//               TERMINATOR across the storm, so one side reads in low light
//               where the flashes show. The log-spiral flow, the eye
//               replacement cycle and the sun-glitter sea as before.
//   LIGHTNING   As it was: a night cell over wet flats, the flats reflecting
//               sky and deck through a second shorter trace of the mirrored
//               ray, bolts as CPU L-systems (a leader that forks once and
//               throws branches and twigs at a rate sway raises, revealed
//               top-down, then the return stroke and its restrikes) on
//               screen-space capsules; sheet flashes between strikes.
//   WILDFIRE    RAISED: the flame tongues carry a third octave and their tops
//               are RAGGED, a fine fast noise tears the tips into tatters
//               that lift off as embers; a PYROCUMULUS stands over the front:
//               the smoke column rising into a cauliflower cap lit orange
//               underneath by the fire's glow SCATTERED up the column (falling
//               off with height) and grey-white on top; HEAT SHIMMER, the
//               view through the hot air over the front and the burnt ground
//               is refracted, a screen-space warp of the ray by a flowing
//               noise, strongest low over the fire; more embers, longer
//               streaks along the wind, some lofted high in the column; SPOT
//               FIRES, embers that land ahead of the front start small fires;
//               FIRE WHIRLS, one or two rotating columns of flame on the
//               front, their rotation a FLOW of the noise domain round and up
//               the column as the funnel does it, no object rotates; CROWN
//               FIRE on the trees, a flash running up the crown as the front
//               reaches it, then a standing torch, then the char; litter and
//               rock in the ground lit by the front, embers in the burnt
//               ground at two depths; a smoke veil in the sky toward the fire.
//               The wind (sway), the spread, the burnout / regrowth cycle as
//               before.
//   SANDSTORM   As it was: a haboob over a desert city, a marched slab of
//               density ahead of its front, lobes rolling up the face, the
//               base bulging forward, the rim catching the sun behind it,
//               per-channel extinction so the sun dims to a red disk and the
//               sky browns, the city swallowed as the wall reaches it, sand
//               streaming across the ground and grit streaking the eye; gust
//               throws it forward, it passes over the eye and a new wall
//               builds far out.
//
// Nothing rotates by itself: the eyes are the hand's; the funnel's spin, the
// mesocyclone's turn, the whirls' turn and the bands' run are flows of the
// noise domain; debris and embers travel paths; fronts and walls advance.
// Four draw calls: the world quad (sky, ground, sea, every marched volume and
// the screen rain and grit, drawn additively, weighted by the Tomb's plate
// weight), one instanced mesh of solid impostors (debris flecks and trees,
// normal-blended over the world), one of additive impostors (ember streaks),
// one of screen-space capsules (bolts). The impostors project through the
// module's OWN perspective camera (uView / uProj) because the Tomb's scene
// camera is orthographic. Its programs are separate from the Tomb's organism
// quad and from the other plates (cold-compile hygiene); the heavy marches
// keep their step budgets off ctx.quality.tier. Live bloom rides the flashes
// and the fire and is handed back for the Tomb to weight. All colour derives
// from io.palette, copied per frame and assigned BY ROLE so the fire is a
// fire and the sea a sea under any palette: the hot core, the cloud tops and
// the bolt take the palette's warmest stop lifted to white, fire and dusk its
// warmest, the cool sky, sea and cloud shade its coolest, the dusk accent and
// the flash tint its second warmest, dust, ash and ground its second warmest
// greyed toward its own luminance.

const SYSTEMS = 5; // tornado, hurricane, lightning, wildfire, sandstorm
const SYS_FADE = 0.55;
const FOV = 58;

// the tornado: cloud base height, funnel axis at the base
const T_CB = 52;
const TOR_X = 0, TOR_Z = -125;
// the hurricane: the storm centre
const HUR_X = 0, HUR_Z = -300;
// the lightning cell
const L_CB = 58;
const LIT_X = 0, LIT_Z = -240;
// the wildfire stand
const FIRE_MAX = 8;        // ignition circles (the spot fires need the room)
const FIRE_W = 3;          // the front's width
const STAND_Z0 = -300, STAND_Z1 = -40, STAND_X = 140;
const FORE_TREES = 26;     // the big trees in the foreground
const WHIRLS = 2;          // fire whirls on the front
// the sandstorm
const WALL_FAR = -950;
const WALL_DEPTH = 190;
const CITY_Z = -320;

// the CPU systems
const MAX_BOLTS = 3;
const BOLT_SEGS = 300;
const N_CAPS = MAX_BOLTS * BOLT_SEGS;
const FLASHES = 4;

// ---------------------------------------------------------------- GLSL common
const GLSL_COMMON = /* glsl */ `
  #define PI 3.14159265359
  #define TAU 6.28318530718
  // hashes without a transcendental: the marches evaluate two octaves of 3-D
  // value noise a step, eight corner hashes an octave
  float h11(float n) { n = fract(n * 0.1031); n *= n + 33.33; n *= n + n; return fract(n); }
  float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
  float h31(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
  float vnoise2(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float vnoise3(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = h31(i), n100 = h31(i + vec3(1, 0, 0)), n010 = h31(i + vec3(0, 1, 0)), n110 = h31(i + vec3(1, 1, 0));
    float n001 = h31(i + vec3(0, 0, 1)), n101 = h31(i + vec3(1, 0, 1)), n011 = h31(i + vec3(0, 1, 1)), n111 = h31(i + vec3(1, 1, 1));
    return mix(mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y), mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y), f.z);
  }
  float fbm2(vec2 p) {
    float n = 0.0, a = 0.5;
    for (int i = 0; i < 3; i++) { n += a * vnoise2(p); p = p * 2.03 + 7.1; a *= 0.5; }
    return n * 1.1429;
  }
  // two octaves, normalised to 0..1
  float fbm3(vec3 p) { return (0.5 * vnoise3(p) + 0.25 * vnoise3(p * 2.07 + 5.3)) * 1.3333; }
  // three octaves, normalised to 0..1
  float fbm3c(vec3 p) { return (0.5 * vnoise3(p) + 0.25 * vnoise3(p * 2.07 + 5.3) + 0.125 * vnoise3(p * 4.3 + 1.7)) * 1.1429; }
  vec3 grey(vec3 c, float k) { return mix(c, vec3(dot(c, vec3(0.299, 0.587, 0.114))), k); }
`;

// ------------------------------------------------------------- the world quad
// Rays come from each system's own eye (two frames, two weights) so a dissolve
// is a cross-fade of two views and not one camera flying between worlds.
const WORLD_FRAG = /* glsl */ `
  ${GLSL_COMMON}
  uniform vec2 uRes;
  // the step budgets as UNIFORMS: a constant trip count is fully unrolled by
  // the D3D compiler (and render() is inlined twice, once per eye), which is
  // what made the cold first draw take a minute; a uniform bound is a loop
  uniform ivec4 uStepsA;   // deck, hurricane, funnel, wall
  uniform ivec4 uStepsB;   // flames (×2 + 2), smoke (+6), reflection, -
  uniform float uTanHalf, uTime, uIntensity, uOpen, uLevel, uWeight;
  uniform vec4 uBreath;   // bass, mid, high, beat pulse
  uniform int uSysA, uSysB;
  uniform vec2 uW;
  uniform vec3 uPosA, uFwdA, uRightA, uUpA;
  uniform vec3 uPosB, uFwdB, uRightB, uUpB;
  uniform vec3 uPal0, uPal1, uPal2, uPal3, uPal4;
  uniform vec4 uFlash[${FLASHES}];   // xyz, intensity
  uniform vec3 uFlashCol;
  // tornado
  uniform vec4 uTor;      // drop, tortuosity, thin, storm
  uniform vec4 uTorB;     // intensity, rain, spin, touched
  uniform vec2 uTorAxis;
  // hurricane
  uniform vec4 uHur;      // eye radius, tightness, storm, eyewall cycle
  uniform vec4 uHurB;     // intensity, flow, press, -
  uniform vec2 uHurC;
  // lightning
  uniform vec4 uLit;      // storm, cell radius, press, rain
  uniform vec2 uLitC;
  // wildfire
  uniform vec4 uFireP;    // storm, wind, press, intensity
  uniform vec4 uFire[${FIRE_MAX}];   // cx, cz, radius, alive
  uniform int uFireN;
  uniform vec4 uFireW;    // whirl strength (max), -, -, -
  uniform vec4 uWhirl[${WHIRLS}];    // x, z, radius, strength
  // sandstorm
  uniform vec4 uSand;     // wall z, height, density, press
  uniform vec4 uSandB;    // gust surge, storm, grit, intensity
  in vec2 vUv;
  out vec4 fragColor;

  #define T_CB ${T_CB.toFixed(1)}
  #define T_TH 16.0
  #define H_CB 40.0
  #define H_TOP 130.0
  #define H_CIR 212.0
  #define L_CB ${L_CB.toFixed(1)}
  #define L_TH 32.0
  #define F_H 9.0
  #define S_H 190.0
  #define S_CAP0 70.0
  #define S_CAP1 130.0
  #define W_DEPTH ${WALL_DEPTH.toFixed(1)}
  #define CITY_Z ${CITY_Z.toFixed(1)}
  #define FIRE_W ${FIRE_W.toFixed(1)}
  #define T_SUN vec3(0.6212, 0.0601, -0.7815)
  #define T_SUNH vec2(0.6224, -0.7827)
  #define H_SUN vec3(0.4924, 0.7385, -0.4605)
  #define H_DAY vec2(0.80, 0.60)
  #define S_SUN vec3(0.1798, 0.1698, -0.9689)

  // the flashes: point lights with a soft 1/r² falloff, no shadowing
  vec3 flashLight(vec3 p) {
    float s = 0.0;
    for (int i = 0; i < ${FLASHES}; i++) {
      vec4 f = uFlash[i];
      if (f.w > 0.001) { vec3 d = p - f.xyz; s += f.w * 9000.0 / (9000.0 + dot(d, d)); }
    }
    return uFlashCol * s;
  }
  float flashSum() {
    float s = 0.0;
    for (int i = 0; i < ${FLASHES}; i++) s += uFlash[i].w;
    return s;
  }
  // rain and grit at the eye: long cells of value noise thresholded into streaks
  float rainScreen(vec2 uv, float slant) {
    float aspect = uRes.x / uRes.y;
    float a = vnoise2(vec2(uv.x * 70.0 * aspect + uv.y * slant, uv.y * 3.5 + uTime * 9.0));
    float b = vnoise2(vec2(uv.x * 130.0 * aspect + uv.y * slant * 1.5 + 3.1, uv.y * 6.0 + uTime * 14.0));
    return smoothstep(0.70, 0.93, a) * 0.6 + smoothstep(0.74, 0.95, b) * 0.4;
  }
  float gritScreen(vec2 uv) {
    float aspect = uRes.x / uRes.y;
    float a = vnoise2(vec2(uv.x * 5.0 * aspect + uTime * 7.0, uv.y * 80.0 + uTime * 1.5));
    float b = vnoise2(vec2(uv.x * 9.0 * aspect + uTime * 12.0, uv.y * 150.0 - 7.0));
    float c = vnoise2(vec2(uv.x * 3.0 * aspect + uTime * 18.0 + uv.y * 2.0, uv.y * 40.0 + 3.0));
    return smoothstep(0.55, 0.90, a) * 0.45 + smoothstep(0.60, 0.92, b) * 0.3 + smoothstep(0.62, 0.9, c) * 0.35;
  }
  // the step budget scales with the view's weight: mid-dissolve both views
  // march shorter, so the pair costs little more than one view
  float gStepK = 1.0;
  vec2 rot2(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(v.x * c - v.y * s, v.x * s + v.y * c); }
  // a differential flow of the noise domain about a centre, kept BOUNDED: two
  // copies of the domain turn from sawtooth phases half a period apart and
  // cross-fade, so the shear between radii resets every period instead of
  // winding the texture into streaks (the flow-map trick)
  #define FLOW_T 5.0
  float flowNoise3(vec2 rel, float y, float om, float scale) {
    float f1 = fract(uTime / FLOW_T), f2 = fract(uTime / FLOW_T + 0.5);
    vec2 q1 = rot2(rel, om * FLOW_T * (f1 - 0.5)) * scale;
    vec2 q2 = rot2(rel, om * FLOW_T * (f2 - 0.5)) * scale;
    float w = abs(1.0 - 2.0 * f1);
    return mix(vnoise3(vec3(q1.x, y, q1.y)), vnoise3(vec3(q2.x, y, q2.y)), w);
  }
  float flowNoise2(vec2 rel, float om, float scale) {
    float f1 = fract(uTime / FLOW_T), f2 = fract(uTime / FLOW_T + 0.5);
    vec2 q1 = rot2(rel, om * FLOW_T * (f1 - 0.5)) * scale;
    vec2 q2 = rot2(rel, om * FLOW_T * (f2 - 0.5)) * scale;
    float w = abs(1.0 - 2.0 * f1);
    return mix(vnoise2(q1), vnoise2(q2), w);
  }
  // striations wound round a centre: the noise is sampled on a circle (no
  // seam) at low angular and high radial frequency, so it reads as arcs, and
  // the arcs flow with the same bounded phase trick
  float striate(vec2 rel, float y, float om, float ang, float rad) {
    float r = length(rel);
    float th = atan(rel.y, rel.x);
    float f1 = fract(uTime / FLOW_T), f2 = fract(uTime / FLOW_T + 0.5);
    float a1 = th + om * FLOW_T * (f1 - 0.5) + r * 0.03, a2 = th + om * FLOW_T * (f2 - 0.5) + r * 0.03;
    float w = abs(1.0 - 2.0 * f1);
    float rr = r * rad + y;
    return mix(vnoise3(vec3(cos(a1) * ang, rr, sin(a1) * ang)), vnoise3(vec3(cos(a2) * ang, rr, sin(a2) * ang)), w);
  }
  // a ray against an axis-aligned box: the entry distance, or -1
  float boxHit(vec3 ro, vec3 rd, vec3 bmin, vec3 bmax, out vec3 nrm) {
    vec3 inv = 1.0 / rd;
    vec3 t0 = (bmin - ro) * inv, t1 = (bmax - ro) * inv;
    vec3 tn = min(t0, t1), tf = max(t0, t1);
    float tN = max(max(tn.x, tn.y), tn.z), tF = min(min(tf.x, tf.y), tf.z);
    nrm = vec3(0.0);
    if (tN > tF || tF < 0.0) return -1.0;
    if (tN == tn.x) nrm = vec3(-sign(rd.x), 0.0, 0.0);
    else if (tN == tn.y) nrm = vec3(0.0, -sign(rd.y), 0.0);
    else nrm = vec3(0.0, 0.0, -sign(rd.z));
    return tN;
  }

  // ================================================================ TORNADO
  // the funnel's axis: anchored at the base, wandering with height by sway
  vec2 torAxis(float y) {
    float s = clamp(1.0 - y / T_CB, 0.0, 1.0);
    float a = (1.5 + 9.0 * uTor.y) * s;
    return uTorAxis + a * vec2(sin(y * 0.11 + uTime * 0.7) + 0.5 * sin(y * 0.23 - uTime * 1.1), cos(y * 0.09 - uTime * 0.55));
  }
  vec3 torSky(vec3 rd) {
    float h = max(rd.y, 0.0);
    vec2 hd = normalize(rd.xz + vec2(1e-4, 0.0));
    float sunSide = 0.5 + 0.5 * dot(hd, T_SUNH);
    vec3 zen = grey(uPal2, 0.3) * 0.22;
    vec3 horWarm = mix(uPal1, uPal3, 0.25) * 1.15;
    vec3 horCool = grey(mix(uPal2, uPal3, 0.5), 0.3) * 0.55;
    vec3 hor = mix(horCool, horWarm, pow(sunSide, 2.5));
    vec3 c = mix(hor, zen, pow(h, 0.45));
    float sa = max(dot(rd, T_SUN), 0.0);
    c += uPal1 * (pow(sa, 6.0) * 0.5 + pow(sa, 90.0) * 1.2);
    return c;
  }
  float torDens(vec3 p) {
    vec2 rel = p.xz - uTorAxis;
    float r = length(rel);
    float storm = uTor.w;
    // the mesocyclone: the noise domain flows round the axis, fastest at it
    float om = uTorB.z * 0.9 / (1.0 + r * 0.03);
    // the wall cloud lowers out of the base round the funnel; a shelf lowers
    // on the rain side; mammatus pouches hang from the rest of the base
    float wall = exp(-r * r / 2200.0) * storm;
    float shelf = smoothstep(15.0, 90.0, rel.x) * smoothstep(260.0, 160.0, rel.x) * smoothstep(200.0, 60.0, abs(rel.y)) * storm;
    float pouch = vnoise2(p.xz * 0.05 + vec2(uTime * 0.02, 0.0));
    pouch *= pouch;
    float base = T_CB - 17.0 * wall - 8.0 * shelf - 6.0 * pouch * storm * (1.0 - wall);
    float yb = p.y - base;
    float n = flowNoise3(rel, p.y * 0.05 - uTime * 0.03, om, 0.02);
    float near = exp(-r * r / 12000.0);
    if (near > 0.03) n = mix(n, striate(rel, p.y * 0.07, om * 1.4, 2.4, 0.12), 0.65 * near);
    n = n * 0.72 + 0.28 * vnoise3(vec3(p.x * 0.07, p.y * 0.12, p.z * 0.07) + 5.3);
    float ext = smoothstep(380.0, 200.0, r);
    float d = n * 1.9 - mix(0.85, 0.62, ext) + 0.1 * uBreath.x + 0.5 * wall + 0.25 * shelf;
    d *= mix(0.12, 1.0, ext);
    d *= smoothstep(-1.0, 3.0, yb) * smoothstep(T_CB + T_TH, T_CB + T_TH - 10.0, p.y);
    d *= mix(0.3, 1.0, storm);   // calm: a thin stratus; the storm builds the base in
    return max(d, 0.0);
  }
  vec4 torDeck(vec3 ro, vec3 rd, float jit) {
    vec4 res = vec4(0.0, 0.0, 0.0, 1.0);
    if (rd.y < 0.01) return res;
    float y0 = T_CB - 26.0, y1 = T_CB + T_TH;
    float t0 = max((y0 - ro.y) / rd.y, 0.0), t1 = (y1 - ro.y) / rd.y;
    if (t1 <= t0) return res;
    t1 = min(t1, t0 + 900.0);
    float nS = max(floor(float(uStepsA.x) * gStepK), 4.0);
    float dtv = (t1 - t0) / nS;
    vec3 p = ro + rd * (t0 + dtv * jit);
    float T = 1.0; vec3 acc = vec3(0.0);
    vec3 belly = grey(mix(uPal2, uPal4, 0.4), 0.5) * 0.38;
    vec3 lit = mix(uPal1, uPal3, 0.35) * 1.05;
    vec3 cool = grey(uPal2, 0.3) * 0.78;
    vec3 breath = uPal1 * 0.08 * uLevel;
    // the dusk comes in low from the sun side: the thin edges toward it catch
    // the warm light; the rest of the base is cool grey-blue, darkest under
    // the mesocyclone
    float sunSide = 0.5 + 0.5 * dot(rd, T_SUN);
    for (int i = 0; i < uStepsA.x; i++) {
      if (float(i) >= nS) break;
      float d = torDens(p);
      if (d > 0.002) {
        float hf = clamp((p.y - y0) / (T_TH + 26.0), 0.0, 1.0);
        float thin = 1.0 - min(d, 1.0);
        float warm = clamp(thin * thin * (0.1 + 0.9 * sunSide * sunSide), 0.0, 1.0);
        vec2 rel = p.xz - uTorAxis;
        float dark = exp(-dot(rel, rel) / 14000.0) * uTor.w;
        vec3 c = mix(mix(belly * (0.7 + 0.6 * thin), cool, thin * 0.6 + hf * 0.3), lit, warm) * (1.0 - 0.4 * dark) + flashLight(p) * 0.9 + breath;
        float a = 1.0 - exp(-d * dtv * 0.14);
        acc += c * a * T; T *= 1.0 - a;
        if (T < 0.03) break;
      }
      p += rd * dtv;
    }
    return vec4(acc, T);
  }
  vec4 torFunnel(vec3 ro, vec3 rd, float tg, float jit) {
    vec4 res = vec4(0.0, 0.0, 0.0, 1.0);
    float RB = 42.0;
    vec2 oc = ro.xz - uTorAxis;
    float a = dot(rd.xz, rd.xz);
    if (a < 1e-5) return res;
    float b = dot(oc, rd.xz), cc = dot(oc, oc) - RB * RB;
    float disc = b * b - a * cc;
    if (disc < 0.0) return res;
    float sq = sqrt(disc);
    float t0 = max((-b - sq) / a, 0.0), t1 = min((-b + sq) / a, tg);
    if (abs(rd.y) > 1e-4) { float ta = -ro.y / rd.y, tb = (T_CB - ro.y) / rd.y; t0 = max(t0, min(ta, tb)); t1 = min(t1, max(ta, tb)); }
    else if (ro.y < 0.0 || ro.y > T_CB) return res;
    if (t1 <= t0) return res;
    float nS = max(floor(float(uStepsA.z) * gStepK), 6.0);
    float dtv = (t1 - t0) / nS;
    vec3 p = ro + rd * (t0 + dtv * jit);
    float T = 1.0; vec3 acc = vec3(0.0);
    float drop = uTor.x;
    vec3 dark = grey(mix(uPal4, uPal2, 0.5), 0.55) * 0.1;
    vec3 lit = mix(uPal1, grey(uPal4, 0.5), 0.55) * 0.7;
    vec3 dust = grey(mix(uPal4, uPal1, 0.25), 0.3) * 0.5;
    vec3 wallC = grey(mix(uPal2, uPal4, 0.4), 0.5) * 0.2;
    float spinT = uTime * uTorB.z * 2.4;
    float thin = (1.0 - 0.5 * uTor.z) * (0.7 + 0.5 * uTorB.x);
    for (int i = 0; i < uStepsA.z; i++) {
      if (float(i) >= nS) break;
      float yn = clamp(p.y / T_CB, 0.0, 1.0);
      vec2 ax = torAxis(p.y);
      vec2 rel = p.xz - ax;
      float r = length(rel);
      float th = atan(rel.y, rel.x);
      // the wedge: narrow at the ground, flaring into the wall cloud; the tip tapers
      float tipS = smoothstep(1.0 - drop - 0.03, 1.0 - drop + 0.22, yn);
      float rr = (thin * (3.0 + 12.0 * pow(yn, 1.5)) + 10.0 * pow(smoothstep(0.8, 1.0, yn), 2.0)) * (0.35 + 0.65 * tipS);
      // the surface: a helical noise domain flows round the funnel and down it
      float sp = th + spinT + yn * 7.0;
      vec3 q = vec3(cos(sp) * 3.0, p.y * 0.35 - uTime * 3.5, sin(sp) * 3.0);
      float n = vnoise3(q) * 0.55 + vnoise3(q * 2.3 + 3.7) * 0.3 + 0.15 * vnoise3(q * 5.1 + 1.3);
      float edge = 0.25 * rr + 0.5;
      float d = smoothstep(rr + edge, rr - edge, r + (n - 0.5) * rr * 0.8);
      d *= smoothstep(1.0 - drop - 0.04, 1.0 - drop + 0.06, yn) * uTor.w;
      // the debris cloud boiling at the foot where it touches down
      float dome = 0.0;
      if (uTorB.w > 0.01 && p.y < 16.0) {
        vec3 dq = vec3(rel.x, p.y * 2.3, rel.y);
        float dsp = th + spinT * 0.6;
        float dn = vnoise3(vec3(cos(dsp) * 2.0, p.y * 0.35 - uTime * 2.0, sin(dsp) * 2.0)) * 0.6 + 0.4 * vnoise3(dq * 0.15 + uTime * 0.4);
        dome = smoothstep(32.0, 8.0, length(dq) + (dn - 0.5) * 26.0) * uTorB.w * 1.4;
      }
      float dd = d * 1.3 + dome * 0.7;
      if (dd > 0.003) {
        float ndl = 0.5 + 0.5 * dot(rel / max(r, 1e-3), T_SUNH);
        // the funnel: lit on the sun side, dark on the other, and it melts into
        // the wall cloud's grey at the top
        vec3 fc = mix(dark, lit, ndl * 0.6 + 0.08) * (0.7 + 0.3 * (1.0 - yn));
        fc = mix(fc, wallC, smoothstep(0.78, 0.98, yn) * 0.75);
        vec3 c = mix(fc, dust * (0.5 + 0.6 * ndl), clamp(dome * 0.7 / dd, 0.0, 1.0)) + flashLight(p) * 0.5;
        float al = 1.0 - exp(-dd * dtv * 0.4);
        acc += c * al * T; T *= 1.0 - al;
        if (T < 0.03) break;
      }
      p += rd * dtv;
    }
    return vec4(acc, T);
  }
  // the plain: fields in strips, a road, the storm's shadow
  vec3 torGround(vec3 hp) {
    vec2 fs = vec2(70.0, 110.0);
    vec2 cellF = hp.xz / fs;
    float fh = h21(floor(cellF));
    float fh2 = h21(floor(cellF) + 3.7);
    float n = fbm2(hp.xz * 0.03);
    float rows = 0.5 + 0.5 * sin(hp.x * 1.1 + fh * 20.0);
    vec3 cropA = mix(grey(uPal4, 0.3), uPal1, 0.22);                 // stubble
    vec3 cropB = mix(grey(uPal2, 0.7), uPal4, 0.45) * 0.6;           // green
    vec3 crop = mix(cropA, cropB, fh);
    vec3 g = crop * 0.42 * (0.55 + 0.5 * n) * (0.86 + 0.14 * rows * step(0.5, fh2));
    vec2 fe = abs(fract(cellF) - 0.5);
    g *= 1.0 - 0.45 * smoothstep(0.485, 0.5, max(fe.x, fe.y));       // hedgerow lines
    // the road and its pale shoulders
    float rx = abs(hp.x - 24.0);
    g = mix(g, grey(uPal4, 0.85) * 0.22, smoothstep(4.6, 3.6, rx));
    g = mix(g, grey(uPal4, 0.4) * 0.55, smoothstep(0.9, 0.3, abs(rx - 4.2)));
    // dusk: lit from the right, the storm's shadow under the cell
    vec2 rel = hp.xz - uTorAxis;
    float shade = 1.0 - 0.55 * exp(-dot(rel, rel) / 50000.0) * uTor.w;
    vec3 dusk = mix(vec3(1.0), mix(uPal1, uPal3, 0.3), 0.35);
    return g * shade * dusk + flashLight(hp) * 0.4;
  }
  // the opaque props: power poles and wires along the road, the farm
  float torProps(vec3 ro, vec3 rd, float tmax, out vec3 col) {
    float best = tmax;
    col = vec3(0.0);
    vec3 sil = grey(mix(uPal4, uPal2, 0.5), 0.6) * 0.06;
    vec3 litF = mix(uPal1, uPal4, 0.5) * 0.35;
    // poles at x = 30 every 24 along the road
    if (abs(rd.x) > 1e-5) {
      float t = (30.0 - ro.x) / rd.x;
      if (t > 0.0 && t < best) {
        vec3 p = ro + rd * t;
        if (p.y > 0.0 && p.y < 10.5 && p.z < 0.0 && p.z > -420.0) {
          float u = (p.z + 10.0) / 24.0;
          float dz = abs(fract(u) - 0.5) * 24.0;   // distance to the nearest pole
          float w = max(0.32, t * 0.0012);
          bool pole = dz < w && p.y < 9.8;
          bool arm = abs(p.y - 9.1) < max(0.3, t * 0.001) && dz < 2.6;
          float uu = fract(u + 0.5);
          float wy = 9.1 - 1.3 * 4.0 * uu * (1.0 - uu);
          bool wire = abs(p.y - wy) < max(0.09, t * 0.0011);
          if (pole || arm || wire) { best = t; col = sil * (pole ? 1.0 : 0.8); }
        }
      }
    }
    // the farm: a barn, a house, a silo
    vec3 nrm;
    float tb = boxHit(ro, rd, vec3(-64.0, 0.0, -82.0), vec3(-48.0, 7.5, -70.0), nrm);
    if (tb > 0.0 && tb < best) { best = tb; col = mix(sil, litF, max(dot(nrm, T_SUN), 0.0)); }
    tb = boxHit(ro, rd, vec3(-86.0, 0.0, -66.0), vec3(-78.0, 5.0, -58.0), nrm);
    if (tb > 0.0 && tb < best) { best = tb; col = mix(sil, litF, max(dot(nrm, T_SUN), 0.0)); }
    tb = boxHit(ro, rd, vec3(-45.0, 0.0, -78.0), vec3(-40.0, 12.0, -73.0), nrm);
    if (tb > 0.0 && tb < best) { best = tb; col = mix(sil, litF, max(dot(nrm, T_SUN), 0.0) * 0.8); }
    // a far windbreak of trees on the left
    tb = boxHit(ro, rd, vec3(-260.0, 0.0, -190.0), vec3(-120.0, 6.0, -186.0), nrm);
    if (tb > 0.0 && tb < best) {
      vec3 p = ro + rd * tb;
      float canopy = 3.0 + 3.0 * vnoise2(vec2(p.x * 0.25, 0.0));
      if (p.y < canopy) { best = tb; col = sil * 0.9; }
    }
    return best;
  }
  vec3 tornado(vec3 ro, vec3 rd, vec2 uv, float jit) {
    vec3 sky = torSky(rd);
    float tg = rd.y < -1e-4 ? -ro.y / rd.y : 1e9;
    vec3 pc;
    float tp = torProps(ro, rd, tg, pc);
    float topq = min(tp, tg);
    vec3 col;
    if (tp < tg) col = pc;
    else if (tg < 1e8) col = torGround(ro + rd * tg);
    else col = sky;
    if (topq < 1e8) col = mix(col, sky * 0.85, 1.0 - exp(-topq * 0.003));
    vec4 dk = torDeck(ro, rd, jit);
    col = col * dk.a + dk.rgb;
    // the rain curtain hanging under the shelf, on the right of the funnel
    if (rd.z < -1e-4) {
      float zc = uTorAxis.y - 30.0;
      float tc = (zc - ro.z) / rd.z;
      if (tc > 0.0 && tc < topq) {
        vec3 cp = ro + rd * tc;
        float xr = cp.x - uTorAxis.x;
        float m = smoothstep(10.0, 40.0, xr) * smoothstep(210.0, 140.0, xr) * step(0.0, cp.y) * smoothstep(T_CB + 2.0, T_CB - 16.0, cp.y);
        float s = fbm2(vec2(cp.x * 0.07, cp.y * 0.02 + uTime * 2.0)) * 0.75 + 0.25 * vnoise2(vec2(cp.x * 0.4, cp.y * 0.04 + uTime * 6.0));
        float rain = uTorB.y * smoothstep(0.3, 0.9, s) * 0.6 * m;
        col = mix(col, grey(mix(uPal2, uPal3, 0.3), 0.4) * 0.75, rain);
      }
    }
    vec4 fn = torFunnel(ro, rd, topq, jit);
    col = col * fn.a + fn.rgb;
    col += grey(uPal2, 0.4) * 0.55 * rainScreen(uv, 14.0) * uTorB.y * 0.25;
    return col;
  }

  // ============================================================== HURRICANE
  // the terminator runs across the storm: the side toward H_DAY is day, the
  // far side night, so one half reads in low light where the flashes show
  float hurDay(vec2 xz) { vec2 rel = xz - uHurC; return clamp(0.55 + dot(rel, H_DAY) / (uHur.x * 5.5), 0.06, 1.0); }
  // the cloud tops as a field over the sea: coverage (0 clear .. ~2.4 at the
  // eyewall's hot towers) and the top height that follows it
  float hurCov(vec2 xz) {
    vec2 rel = xz - uHurC;
    float r = max(length(rel), 1.0);
    float phi = atan(rel.y, rel.x);
    float eyeR = uHur.x;
    float storm = uHur.z;
    // log spiral iso-lines; the texture flows along the bands (the domain
    // advects about the centre at a rate that falls with radius) and the band
    // pattern itself drifts along the arms, slower out wide
    float b = mix(0.30, 0.16, uHur.y);
    float s = log(r / eyeR) / b - phi;
    float om = uHurB.y * 0.30 * eyeR / r;
    float armPh = uTime * uHurB.y * 0.08 * eyeR / (eyeR + r * 0.5);
    float arm = 0.5 + 0.5 * cos(s * 2.0 + armPh);
    arm = pow(arm, 1.4 + 2.0 * uHur.y);
    // the convective texture: broad cells that flow along the bands, finer
    // cells on them, streaks drawn along the arms
    float n = flowNoise2(rel, om, 0.008) * 0.55 + 0.45 * vnoise2(rel * 0.022 + 3.1);
    float cdo = smoothstep(eyeR * 2.8, eyeR * 1.3, r);
    float reach = smoothstep(eyeR * 10.5, eyeR * 2.2, r);
    float body = cdo * 1.2 + arm * reach * 1.15 + 0.15 * reach;
    float cov = body * (n * 1.6 - 0.25) + cdo * 0.35;
    // the stadium: the wall slopes outward going up, in TERRACES (steps cut
    // into the slope between the eye and the wall's crest); press steepens it
    float eyeIn = smoothstep(eyeR * (0.96 - 0.08 * uHurB.z), eyeR * (1.14 - 0.1 * uHurB.z), r);
    float ter = smoothstep(0.35, 0.65, 0.5 + 0.5 * sin(r / eyeR * 44.0));
    float terZone = smoothstep(eyeR * 0.9, eyeR * 1.0, r) * smoothstep(eyeR * 1.45, eyeR * 1.2, r);
    eyeIn *= 1.0 - 0.22 * ter * terZone;
    float wall = exp(-pow((r - eyeR * 1.18) / (eyeR * 0.28), 2.0)) * 1.1;
    if (uHur.w > 0.0) {
      // eye replacement: an outer ring forms and contracts while the inner weakens
      float c = uHur.w;
      float sn = sin(PI * c);
      float R2 = eyeR * mix(2.6, 1.18, c);
      float outer = exp(-pow((r - R2) / (eyeR * 0.3), 2.0)) * 1.1 * sn;
      wall = wall * (1.0 - 0.85 * sn) + outer;
      cov += 0.6 * sn * smoothstep(eyeR * 1.1, eyeR * 0.3, r) * n;  // the old eye fills
      eyeIn = mix(eyeIn, 1.0, 0.6 * sn);
    }
    cov = (cov + wall * (0.7 + 0.5 * n)) * eyeIn;
    // convective cells and HOT TOWERS: a fine cellular octave in the spiral's
    // own coordinates, elongated along the arms and drifting along them (a
    // flow, not a turn), whose peaks stand up as towers, tallest on the
    // eyewall ring, pulsing with the bass
    // (sampled on a circle in the spiral phase, so there is no seam where the
    // angle wraps)
    float cellN = vnoise3(vec3(cos(s) * 4.0, sin(s) * 4.0, log(r) * 9.0 - uTime * 0.07) + 2.7);
    float ring = exp(-pow((r - eyeR * 1.22) / (eyeR * 0.36), 2.0));
    float tower = smoothstep(0.56, 0.86, cellN) * (0.45 + 1.3 * ring) * (1.0 + 0.5 * uBreath.x);
    cov += (0.30 * cellN * cellN + 0.65 * tower) * smoothstep(0.12, 0.5, cov) * eyeIn;
    cov = cov * storm + (1.0 - storm) * 0.3 * (n * 1.6 - 0.55);  // calm: a thin haze
    return max(cov, 0.0);
  }
  float hurH(float cov) { return H_CB + (H_TOP - H_CB) * min(cov, 2.4) / 1.4; }
  // the tops' texture: streaks drawn along the arms and finer cells on them
  float hurTex(vec2 xz) {
    vec2 rel = xz - uHurC;
    float r = max(length(rel), 1.0);
    float phi = atan(rel.y, rel.x);
    float b = mix(0.30, 0.16, uHur.y);
    float s = log(r / uHur.x) / b - phi;
    return 0.6 * vnoise3(vec3(cos(s) * 3.0, sin(s) * 3.0, log(r) * 3.0 - uTime * 0.1)) + 0.4 * vnoise2(rel * 0.06 + vec2(uTime * 0.05, 0.0));
  }
  // lightning in the eyewall: the flashes sit under the tops and light them
  // from within, a local glow through the cloud, on top of the point light
  vec3 hurFlashGlow(vec3 p) {
    float s = 0.0;
    for (int i = 0; i < ${FLASHES}; i++) {
      vec4 f = uFlash[i];
      if (f.w > 0.001) { vec3 d = p - f.xyz; s += f.w * exp(-dot(d, d) / 2600.0) * 1.8; }
    }
    return uFlashCol * s;
  }
  vec3 hurSea(vec3 hp, vec3 rd) {
    float day = hurDay(hp.xz);
    float n = vnoise2(hp.xz * 0.008 + uTime * 0.02);
    vec3 c = grey(uPal2, 0.05) * 0.09 * (0.75 + 0.4 * n) * (0.25 + 0.75 * day);
    // the sun's glitter: a broad lobe on a gentle swell
    float g1 = vnoise2(hp.xz * 0.004 + uTime * 0.03), g2 = vnoise2(hp.xz * 0.0045 + 9.0 - uTime * 0.025);
    vec3 nrm = normalize(vec3((g1 - 0.5) * 0.25, 1.0, (g2 - 0.5) * 0.25));
    float spec = pow(max(dot(reflect(rd, nrm), H_SUN), 0.0), 10.0);
    c += mix(uPal0, vec3(1.0), 0.6) * spec * 0.5 * day;
    float r = length(hp.xz - uHurC);
    // the sea glittering in the eye: a finer facet field inside the stadium
    float inEye = smoothstep(uHur.x * 1.1, uHur.x * 0.6, r);
    if (inEye > 0.01) {
      float g3 = vnoise2(hp.xz * 0.03 + uTime * 0.12), g4 = vnoise2(hp.xz * 0.033 + 4.0 - uTime * 0.1);
      vec3 n2 = normalize(vec3((g3 - 0.5) * 0.5, 1.0, (g4 - 0.5) * 0.5));
      float sp2 = pow(max(dot(reflect(rd, n2), H_SUN), 0.0), 40.0);
      c += mix(uPal0, vec3(1.0), 0.8) * sp2 * 0.9 * inEye * day;
    }
    float caps = smoothstep(0.6, 0.8, vnoise2(hp.xz * 0.05 + uTime * 0.2)) * smoothstep(uHur.x * 2.4, uHur.x * 0.7, r) * uHur.z;
    c += vec3(0.8) * caps * 0.18 * (0.3 + 0.7 * day);
    // the clouds' shadow on the sea, in the gaps between the bands
    vec2 sp = hp.xz - H_SUN.xz / H_SUN.y * 70.0;
    c *= 1.0 - 0.55 * smoothstep(0.05, 0.6, hurCov(sp)) * day;
    c += flashLight(hp) * 0.15;
    return c;
  }
  vec3 hurricane(vec3 ro, vec3 rd, vec2 uv, float jit) {
    vec3 zen = uPal2 * 0.3;
    vec3 hor = mix(uPal2, uPal0, 0.25) * 0.36;
    vec3 sky = mix(hor, zen, pow(max(rd.y, 0.0), 0.5));
    vec3 breath = uPal2 * 0.06 * uLevel;
    if (rd.y >= -1e-4) return sky;
    float tsea = -ro.y / rd.y;
    // the cloud tops: march the heightfield from above the tallest tower down
    // to the deck's base, refine the hit by bisection, shade by slope and the
    // shadow taps
    float yTop = H_TOP + 70.0;
    float t0 = max((yTop - ro.y) / rd.y, 0.0), t1 = (H_CB - ro.y) / rd.y;
    float alpha = 0.0;
    vec3 cc = vec3(0.0);
    if (t1 > t0) {
      float nS = max(floor(float(uStepsA.y) * gStepK), 6.0);
      float dtv = (t1 - t0) / nS;
      float t = t0 + dtv * 0.5, tp = t0;   // no per-pixel jitter: a surface, not a volume
      bool hit = false;
      float covH = 0.0;
      for (int i = 0; i < uStepsA.y; i++) {
        if (float(i) >= nS) break;
        vec3 P = ro + rd * t;
        float c = hurCov(P.xz);
        if (P.y < hurH(c)) { hit = true; covH = c; break; }
        tp = t; t += dtv;
      }
      if (hit) {
        float ta = tp, tb = t;
        for (int k = 0; k < 4; k++) {
          float tm = 0.5 * (ta + tb);
          vec3 Pm = ro + rd * tm;
          float c = hurCov(Pm.xz);
          if (Pm.y < hurH(c)) { tb = tm; covH = c; } else ta = tm;
        }
        vec3 P = ro + rd * tb;
        float e = 12.0;
        float h0 = hurH(covH);
        float cx = hurCov(P.xz + vec2(e, 0.0)), cz = hurCov(P.xz + vec2(0.0, e));
        vec3 N = normalize(vec3(h0 - hurH(cx), e, h0 - hurH(cz)));
        float ndl = max(dot(N, H_SUN), 0.0);
        // self-shadowing: two soft taps toward the sun, the towers shadow the
        // bands, the wall shadows the eye
        vec3 q1 = P + H_SUN * 14.0, q2 = P + H_SUN * 38.0;
        float sh = clamp(1.0 - (hurH(hurCov(q1.xz)) - q1.y) / 14.0, 0.45, 1.0) * clamp(1.0 - (hurH(hurCov(q2.xz)) - q2.y) / 20.0, 0.6, 1.0);
        float hn = clamp((P.y - H_CB) / (H_TOP - H_CB), 0.0, 1.0);
        float tex = hurTex(P.xz);
        float day = hurDay(P.xz);
        vec3 lit = mix(uPal0, vec3(1.0), 0.6) * 1.05;
        vec3 shade = grey(uPal2, 0.3) * 0.42;
        vec3 nightC = grey(uPal2, 0.2) * 0.16;   // the night side: the tops in moonlight
        vec3 sunlit = mix(shade, lit, clamp(0.22 + 0.78 * ndl * sh, 0.0, 1.0)) * (0.6 + 0.4 * hn) * (0.5 + 0.85 * tex);
        cc = mix(nightC * (0.6 + 0.6 * tex) * (0.7 + 0.3 * hn), sunlit, day);
        cc += flashLight(P) * 0.5 + hurFlashGlow(P) + breath;
        // aerial perspective toward the limb
        cc = mix(cc, hor * (0.3 + 0.7 * day), 1.0 - exp(-tb * 0.00035));
        alpha = smoothstep(0.08, 0.4, covH);
      }
    }
    vec3 col = cc;
    if (alpha < 0.98) {
      vec3 hp = ro + rd * tsea;
      vec3 sea = hurSea(hp, rd);
      sea = mix(sea, hor * (0.3 + 0.7 * hurDay(hp.xz)), 1.0 - exp(-tsea * 0.00014));
      col = mix(sea, cc, alpha);
    }
    // the CIRRUS OUTFLOW canopy: a thin sun-lit sheet above the deck that
    // spirals the other way (anticyclonic) and spreads outward from the top
    if (ro.y > H_CIR) {
      float tc = (H_CIR - ro.y) / rd.y;
      vec3 cp = ro + rd * tc;
      vec2 rel = cp.xz - uHurC;
      float r = max(length(rel), 1.0);
      float phi = atan(rel.y, rel.x);
      float s2 = log(r / uHur.x) / -0.55 - phi;
      float cn = 0.6 * vnoise3(vec3(cos(s2) * 2.6, sin(s2) * 2.6, log(r) * 4.5 - uTime * 0.04)) + 0.4 * vnoise2(rel * 0.012 + vec2(uTime * 0.012, 0.0));
      float cir = smoothstep(0.46, 0.78, cn) * smoothstep(uHur.x * 0.9, uHur.x * 2.2, r) * smoothstep(uHur.x * 10.0, uHur.x * 4.0, r) * uHur.z;
      float day = hurDay(cp.xz);
      vec3 cirC = mix(uPal0, vec3(1.0), 0.7) * (0.35 + 0.9 * day) + flashLight(cp) * 0.2;
      col = mix(col, cirC, cir * 0.42);
    }
    return col;
  }

  // ============================================================== LIGHTNING
  float litDens(vec3 p) {
    vec2 rel = p.xz - uLitC;
    float r = length(rel);
    float R = uLit.y;
    float base = L_CB - uLit.z * 8.0 - 7.0 * exp(-r * r / (R * R * 0.3));
    float n = fbm3c(vec3(p.x * 0.02, p.y * 0.045, p.z * 0.02) + vec3(uTime * 0.02, 0.0, -uTime * 0.015));
    float yb = p.y - base;
    float ext = smoothstep(R, R * 0.55, r);
    float d = (n * 1.8 - 0.6 + 0.08 * uBreath.x) * ext + 0.3 * ext * (1.0 - smoothstep(0.0, 12.0, yb)) * n;
    d += 0.05 * (1.0 - uLit.x) * n;  // calm: a thin overcast
    d *= smoothstep(-2.0, 5.0, yb) * smoothstep(L_CB + L_TH, L_CB + L_TH - 10.0, p.y);
    return max(d, 0.0);
  }
  vec4 litDeck(vec3 ro, vec3 rd, int steps, float jit) {
    vec4 res = vec4(0.0, 0.0, 0.0, 1.0);
    if (rd.y < 0.01) return res;
    float y0 = L_CB - 16.0, y1 = L_CB + L_TH;
    float t0 = max((y0 - ro.y) / rd.y, 0.0), t1 = (y1 - ro.y) / rd.y;
    if (t1 <= t0) return res;
    t1 = min(t1, t0 + 900.0);
    float nS = max(floor(float(steps) * gStepK), 3.0);
    float dtv = (t1 - t0) / nS;
    vec3 p = ro + rd * (t0 + dtv * jit);
    float T = 1.0; vec3 acc = vec3(0.0);
    vec3 belly = grey(uPal2, 0.5) * 0.3;
    vec3 edge = grey(uPal2, 0.3) * 0.5;
    vec3 breath = uPal2 * 0.05 * uLevel;
    float fa = min(flashSum(), 3.0);
    vec3 amb = uFlashCol * fa * 0.035;
    for (int i = 0; i < steps; i++) {
      if (float(i) >= nS) break;
      float d = litDens(p);
      if (d > 0.002) {
        float thin = exp(-d * 1.2);
        vec3 c = belly + edge * thin + flashLight(p) * (0.35 + 0.8 * thin) + amb * (0.4 + thin) + breath;
        float a = 1.0 - exp(-d * dtv * 0.15);
        acc += c * a * T; T *= 1.0 - a;
        if (T < 0.03) break;
      }
      p += rd * dtv;
    }
    return vec4(acc, T);
  }
  vec3 litSky(vec3 rd) {
    vec3 c = grey(uPal2, 0.5) * 0.09 + mix(uPal2, uPal3, 0.5) * 0.12 * exp(-max(rd.y, 0.0) * 6.0);
    float st = h31(floor(rd * 520.0));
    c += vec3(0.45) * step(0.9975, st) * (0.5 + 0.5 * h11(st * 91.0)) * smoothstep(0.02, 0.1, rd.y);
    c += uFlashCol * min(flashSum(), 3.0) * 0.02;
    return c;
  }
  vec3 lightning(vec3 ro, vec3 rd, vec2 uv, float jit) {
    vec3 sky = litSky(rd);
    float tg = rd.y < -1e-4 ? -ro.y / rd.y : 1e9;
    vec3 col;
    float fl = min(flashSum(), 3.0);
    if (tg < 1e8) {
      vec3 hp = ro + rd * tg;
      vec3 rr = reflect(rd, vec3(0.0, 1.0, 0.0));
      float wet = 0.5 + 0.5 * smoothstep(0.3, 0.7, vnoise2(hp.xz * 0.06));
      rr.xz += (vnoise2(hp.xz * 0.3 + uTime * 0.5) - 0.5) * 0.06;
      rr = normalize(rr);
      vec4 rdk = litDeck(hp, rr, uStepsB.z, jit);
      vec3 refl = litSky(rr) * rdk.a + rdk.rgb;
      float fres = 0.2 + 0.8 * pow(clamp(1.0 + rd.y, 0.0, 1.0), 3.0);
      float gn = vnoise2(hp.xz * 0.4);
      vec3 ground = grey(uPal4, 0.6) * 0.14 * (0.7 + 0.6 * gn) + flashLight(hp) * 0.28 * (0.6 + 0.6 * gn);
      col = ground + refl * fres * wet * 0.9;
      col = mix(col, sky, 1.0 - exp(-tg * 0.003));
    } else col = sky;
    vec4 dk = litDeck(ro, rd, uStepsA.x, jit);
    col = col * dk.a + dk.rgb;
    col += mix(uPal2, vec3(1.0), 0.5) * rainScreen(uv, 6.0) * uLit.w * (0.03 + 0.2 * min(fl, 1.2));
    return col;
  }

  // =============================================================== WILDFIRE
  // the burnt depth: positive inside a burnt circle, zero at the front
  float burn(vec2 xz) {
    float m = -1e3;
    for (int i = 0; i < ${FIRE_MAX}; i++) {
      if (i >= uFireN) break;
      vec4 f = uFire[i];
      if (f.w < 0.5) continue;
      vec2 rel = xz - f.xy;
      rel.x -= uFireP.y * f.z * 0.04;   // the wind carries the circle downwind as it grows
      m = max(m, f.z - length(rel));
    }
    return m;
  }
  vec3 fireGround(vec3 p) {
    float d = burn(p.xz);
    float n = vnoise2(p.xz * 0.35);
    float fl = 0.85 + 0.15 * uBreath.w;
    // litter and rock under the stand, lit by the front
    float rock = smoothstep(0.62, 0.78, vnoise2(p.xz * 0.7 + 9.0));
    float litter = 0.6 + 0.6 * vnoise2(p.xz * 2.6 + 1.0);
    vec3 grass = mix(grey(uPal4, 0.4), uPal2, 0.25) * 0.09 * (0.6 + 0.6 * n) * litter;
    grass = mix(grass, grey(uPal4, 0.6) * 0.14, rock * 0.6);
    vec3 ash = grey(uPal4, 0.85) * 0.035 * (0.7 + 0.5 * rock);
    // the burnt ground: embers at two depths, a fine crust that fades fast
    // behind the front, and heavier logs that glow on far back into the burn
    float speck = smoothstep(0.45, 0.85, vnoise2(p.xz * 2.2 + 3.0)) * (0.6 + 0.4 * vnoise2(p.xz * 5.0 + uTime * 0.6));
    float speck2 = smoothstep(0.55, 0.92, vnoise2(p.xz * 0.9 + 17.0)) * (0.5 + 0.5 * vnoise2(p.xz * 3.0 - uTime * 0.4));
    float dp = max(d, 0.0);
    float glowF = (exp(-dp / 28.0) * (0.2 + 0.8 * speck) + 0.55 * exp(-dp / 90.0) * speck2) * fl;
    vec3 ember = uPal1 * glowF * 1.1 * smoothstep(-FIRE_W, 0.5, d) * uFireP.x;
    vec3 g = mix(grass, ash, smoothstep(-1.5, 1.5, d)) + ember;
    // the front lights the ground on both sides of itself
    float lt = 1.0 / (1.0 + d * d / 900.0);
    g += mix(uPal1, uPal0, 0.3) * 0.6 * lt * uFireP.x * fl * (0.7 + 0.3 * n) * (0.7 + 0.5 * rock);
    return g;
  }
  // a FIRE WHIRL: a rotating column of flame on the front, the rotation is a
  // FLOW of the noise domain round and up the column, as the funnel's is; no
  // object rotates
  float whirlDens(vec3 p, vec4 wh, float fh) {
    if (wh.w < 0.01) return 0.0;
    vec2 rel = p.xz - wh.xy;
    float rw = length(rel);
    if (rw > wh.z * 1.6) return 0.0;
    float yn = clamp(p.y / (fh * 2.8), 0.0, 1.0);
    float th = atan(rel.y, rel.x);
    float sp = th + uTime * 7.0 + yn * 9.0;
    vec3 q = vec3(cos(sp) * 2.2, p.y * 0.45 - uTime * 6.0, sin(sp) * 2.2);
    float n = vnoise3(q) * 0.6 + 0.4 * vnoise3(q * 2.3 + 1.7);
    float rr = wh.z * (0.3 + 0.7 * (1.0 - yn)) * (0.6 + 0.4 * wh.w);
    return smoothstep(rr * 1.2, rr * 0.3, rw + (n - 0.5) * rr * 0.9) * smoothstep(1.0, 0.7, yn) * wh.w;
  }
  vec4 flames(vec3 ro, vec3 rd, float tg, float jit) {
    vec4 res = vec4(0.0, 0.0, 0.0, 1.0);
    if (uFireP.x < 0.01 || abs(rd.y) < 1e-4) return res;
    float fh = F_H * (1.0 - 0.45 * uFireP.z) * (0.6 + 0.7 * uFireP.w) * (1.0 + 0.3 * uBreath.y);
    float top = fh * (1.4 + 1.6 * uFireW.x);   // the slab reaches up to the whirls when they stand
    float ta = -ro.y / rd.y, tb = (top - ro.y) / rd.y;
    float t0 = max(min(ta, tb), 0.0), t1 = min(max(ta, tb), tg);
    if (t1 <= t0) return res;
    t1 = min(t1, t0 + 420.0);
    // the band is thin and the slab is crossed at a graze, so the march
    // strides by the distance to the front (a Lipschitz bound in xz) and
    // only steps finely inside the band
    float T = 1.0; vec3 acc = vec3(0.0);
    float w = FIRE_W + 2.0 * uFireP.w;
    vec3 hot = mix(uPal1, uPal0, 0.3) * (1.2 + 0.4 * uBreath.w);
    vec3 warm = uPal1 * (1.0 + 0.35 * uBreath.w);
    vec3 tip = grey(mix(uPal1, uPal4, 0.5), 0.5) * 0.12;   // soot at the tips
    vec3 core = mix(hot, vec3(1.0), 0.25);
    float horiz = max(length(rd.xz), 0.2);
    float fine = 1.2;
    float tc = t0;
    bool inBand = false;
    bool whirls = uFireW.x > 0.01;
    for (int i = 0; i < uStepsB.x; i++) {
      if (tc > t1) break;
      vec3 p = ro + rd * tc;
      float d = burn(p.xz);
      float ad = abs(d);
      bool nearW = whirls && (length(p.xz - uWhirl[0].xy) < uWhirl[0].z * 1.6 || length(p.xz - uWhirl[1].xy) < uWhirl[1].z * 1.6);
      if (ad > w * 1.6 && !nearW) { tc += max(ad - w * 1.2, 2.0) / horiz; inBand = false; continue; }
      if (!inBand) { inBand = true; tc += fine * jit; p = ro + rd * tc; d = burn(p.xz); }
      float m = exp(-d * d / (w * w));
      vec2 lean = p.xz - vec2(uFireP.y * p.y * 0.6, 0.0);
      // tongues: the local flame height varies along the front and in time
      float tongue = vnoise2(lean * 0.45 + vec2(0.0, uTime * 0.6)) * 0.7 + 0.3 * vnoise2(lean * 1.3 - uTime * 1.1);
      float hl = fh * (0.3 + 1.3 * tongue);
      float yn = clamp(p.y / hl, 0.0, 1.0);
      float n = fbm3c(vec3(lean.x * 0.5, p.y * 0.22 - uTime * 3.0, lean.y * 0.5));
      // ragged tops: a fine fast noise tears the tips into tatters that lift off
      float tear = vnoise3(vec3(lean.x * 1.8, p.y * 0.8 - uTime * 6.5, lean.y * 1.8));
      float dens = m * smoothstep(0.0, 0.3, n * 1.75 - 0.25 - yn * 0.85 - yn * yn * 0.8 * tear) * (1.0 - yn * 0.55) * uFireP.x * 1.5;
      float wd = 0.0;
      if (whirls) { wd = whirlDens(p, uWhirl[0], fh) + whirlDens(p, uWhirl[1], fh); dens += wd * 1.8 * uFireP.x; }
      if (dens > 0.003) {
        float yh = clamp(p.y / fh, 0.0, 1.0);
        vec3 c = mix(mix(warm, hot, pow(1.0 - yh, 2.0) * 0.85), tip, smoothstep(0.4, 1.0, yn));
        // the whirl's core burns hotter and holds its colour up the column
        if (wd > 0.001) c = mix(c, core, clamp(wd * 1.8 / max(dens, 1e-3), 0.0, 1.0) * 0.8);
        float a = 1.0 - exp(-dens * fine * 0.6);
        acc += c * a * T; T *= 1.0 - a;
        if (T < 0.03) break;
      }
      tc += fine;
    }
    return vec4(acc, T);
  }
  vec4 smoke(vec3 ro, vec3 rd, float tg, float jit) {
    vec4 res = vec4(0.0, 0.0, 0.0, 1.0);
    if (uFireP.x < 0.01 || abs(rd.y) < 1e-4) return res;
    float fh = F_H * 1.1;
    float ta = (fh - ro.y) / rd.y, tb = (S_H - ro.y) / rd.y;
    float t0 = max(min(ta, tb), 0.0), t1 = min(max(ta, tb), tg);
    if (t1 <= t0) return res;
    t1 = min(t1, t0 + 900.0);
    // the column stands over the front, so the march strides by the distance
    // to the front (in xz) and steps finely only inside the column
    float T = 1.0; vec3 acc = vec3(0.0);
    float w = (FIRE_W + 2.0 * uFireP.w) * 2.8;
    vec3 darkS = grey(mix(uPal4, uPal2, 0.4), 0.6) * 0.03;
    vec3 litS = uPal1 * (1.1 + 0.3 * uBreath.w);
    vec3 capTop = grey(mix(uPal2, vec3(1.0), 0.55), 0.6) * 0.26;
    float horiz = max(length(rd.xz), 0.15);
    float fine = 13.0;
    float tc = t0 + fine * jit * 0.4;
    for (int i = 0; i < uStepsB.y; i++) {
      if (tc > t1) break;
      vec3 p = ro + rd * tc;
      // the column leans downwind, widens going up and, past the condensation
      // level, blossoms into the PYROCUMULUS cap
      float up = p.y - fh;
      vec2 q = p.xz - vec2(uFireP.y * up * 0.5, 0.0);
      float d = burn(q);
      float capF = smoothstep(S_CAP0, S_CAP1, p.y) * (0.4 + 0.6 * uFireP.w);
      float ww = w * (1.0 + up / 50.0) + w * 6.0 * capF;
      float ad = abs(d);
      if (ad > ww * 1.6) { tc += max(ad - ww * 1.3, 3.0) / horiz; continue; }
      float m = exp(-d * d / (ww * ww));
      float n = fbm3(vec3(q.x * 0.04, p.y * 0.03 - uTime * 0.35, q.y * 0.04));
      float shape = max(n * 1.6 - 0.45, 0.0);
      float nc = 0.0;
      if (capF > 0.01) {
        // cauliflower: a sharper threshold on a finer second sample
        nc = vnoise3(vec3(q.x * 0.075, p.y * 0.06 - uTime * 0.25, q.y * 0.075) + 3.1);
        shape = mix(shape, smoothstep(0.40, 0.62, n * 0.65 + nc * 0.5) * 1.4, capF);
      }
      float dens = m * shape * uFireP.x * (0.5 + uFireP.w) * smoothstep(S_H, S_H * 0.72, p.y) * smoothstep(0.0, 12.0, up) * 1.4;
      if (dens > 0.003) {
        // the front's glow SCATTERED up the column, falling off with height; the
        // cap's top goes grey-white where it faces the sky
        float near = exp(-d * d / (w * w * 3.0)) * exp(-up / 34.0);
        vec3 c = mix(darkS, litS, clamp(near * 1.3, 0.0, 1.0)) + uPal1 * 0.10 * exp(-up / 60.0);
        c += capTop * capF * smoothstep(0.35, 0.85, nc) * smoothstep(S_CAP0, S_H, p.y);
        float a = 1.0 - exp(-dens * fine * 0.25);
        acc += c * a * T; T *= 1.0 - a;
        if (T < 0.03) break;
      }
      tc += fine;
    }
    return vec4(acc, T);
  }
  vec3 wildfire(vec3 ro, vec3 rd, vec3 right, vec3 up, vec2 uv, float jit) {
    // HEAT SHIMMER: the view through the hot air over the front and the burnt
    // ground is refracted, a screen-space warp of the ray by a flowing noise,
    // strongest low over the fire
    if (uFireP.x > 0.01 && rd.y < -1e-4) {
      float tg0 = -ro.y / rd.y;
      float d0 = burn((ro + rd * tg0).xz);
      float heat = uFireP.x * (exp(-abs(d0) / 30.0) + 0.35 * smoothstep(0.0, 6.0, d0) * exp(-d0 / 140.0)) * smoothstep(0.45, -0.3, uv.y) * (0.6 + 0.4 * uFireP.w);
      if (heat > 0.002) {
        float aspect = uRes.x / uRes.y;
        vec2 wv = vec2(vnoise2(vec2(uv.x * 26.0 * aspect, uv.y * 9.0 + uTime * 4.5)), vnoise2(vec2(uv.x * 19.0 * aspect + 3.0, uv.y * 13.0 + uTime * 6.0))) - 0.5;
        rd = normalize(rd + (right * wv.x + up * wv.y) * heat * 0.035);
      }
    }
    // the sky glows toward the fire, under a smoke veil that dims the stars
    float toward = 0.5;
    if (uFireN > 0) { vec2 fd = uFire[0].xy - ro.xz; toward = 0.5 + 0.5 * dot(normalize(rd.xz + vec2(1e-4, 0.0)), normalize(fd + vec2(1e-4, 0.0))); }
    vec3 sky = grey(uPal2, 0.5) * 0.05 + uPal1 * 0.34 * uFireP.x * (0.8 + 0.2 * uBreath.w) * exp(-max(rd.y, 0.0) * 3.0) * (0.35 + 0.65 * toward);
    float veil = uFireP.x * (0.25 + 0.75 * toward) * smoothstep(0.6, 0.0, rd.y) * 0.6;
    float st = h31(floor(rd * 700.0));
    sky += vec3(0.35) * step(0.9985, st) * smoothstep(0.04, 0.2, rd.y) * (1.0 - veil);
    sky = mix(sky, grey(mix(uPal4, uPal1, 0.35), 0.45) * 0.07 * (0.8 + 0.2 * uBreath.w), veil * 0.7);
    float tg = rd.y < -1e-4 ? -ro.y / rd.y : 1e9;
    vec3 col;
    if (tg < 1e8) {
      vec3 hp = ro + rd * tg;
      col = mix(fireGround(hp), sky, 1.0 - exp(-tg * 0.003));
    } else col = sky;
    vec4 fl = flames(ro, rd, tg, jit);
    col = col * fl.a + fl.rgb;
    vec4 sm = smoke(ro, rd, tg, jit);
    return col * sm.a + sm.rgb;
  }

  // ============================================================== SANDSTORM
  float sandFront(float x, float y) {
    vec2 q = vec2(x * 0.012, y * 0.02) + vec2(0.0, -uTime * 0.2);
    float lob = (vnoise2(q) * 0.65 + vnoise2(q * 2.1 + 7.1) * 0.35) * 2.0 - 1.0;
    return uSand.x + lob * 36.0 * (0.5 + 0.5 * uSand.z) + 26.0 * exp(-y / 40.0) * (1.0 + uSandB.x * 1.5);
  }
  float sandDens(vec3 p, float H, out float n, out float lit) {
    n = 0.5; lit = 0.5;
    float fr = sandFront(p.x, p.y);
    float d = smoothstep(fr + 2.0, fr - 26.0 * (1.0 - 0.5 * uSand.w), p.z);
    // the top: rounded lobes, and a little lower out ahead of the front
    float Ht = H * (0.78 + 0.27 * vnoise2(vec2(p.x * 0.025 + 1.7, p.z * 0.02 - uTime * 0.1)));
    d *= smoothstep(Ht, Ht - 9.0, p.y);
    if (d < 0.003) return 0.0;
    // the face's slope: where the front recedes going up the lobe faces the
    // sky and is lit; where it overhangs it is dark
    float frU = sandFront(p.x, p.y + 8.0);
    lit = smoothstep(-10.0, 12.0, fr - frU);
    n = fbm3(vec3(p.x * 0.03, p.y * 0.035 - uTime * 0.9, p.z * 0.03 + uTime * 0.5));
    d *= (0.2 + 1.4 * smoothstep(0.25, 0.8, n)) * (0.6 + 0.8 * uSand.z + 0.15 * uBreath.x) * uSandB.y;
    return max(d, 0.0);
  }
  vec4 sandWall(vec3 ro, vec3 rd, float tg, float jit) {
    vec4 res = vec4(0.0, 0.0, 0.0, 1.0);
    if (uSandB.y < 0.01) return res;
    float zA = uSand.x + 80.0, zB = uSand.x - W_DEPTH;
    float t0, t1;
    if (abs(rd.z) < 1e-4) { if (ro.z > zA || ro.z < zB) return res; t0 = 0.0; t1 = tg; }
    else { float ta = (zA - ro.z) / rd.z, tb = (zB - ro.z) / rd.z; t0 = max(min(ta, tb), 0.0); t1 = min(max(ta, tb), tg); }
    float Hmax = uSand.y * 1.1 + 1.0;
    if (rd.y > 1e-4) t1 = min(t1, (Hmax - ro.y) / rd.y);
    else if (rd.y < -1e-4) t0 = max(t0, (Hmax - ro.y) / rd.y);
    if (t1 <= t0) return res;
    t1 = min(t1, t0 + 600.0);
    float nS = max(floor(float(uStepsA.w) * gStepK), 4.0);
    float dtv = (t1 - t0) / nS;
    vec3 p = ro + rd * (t0 + dtv * jit);
    float T = 1.0; vec3 acc = vec3(0.0);
    vec3 base = grey(uPal4, 0.15);
    vec3 rim = mix(uPal1, uPal0, 0.4) * 0.9;
    vec3 skyL = grey(mix(uPal4, uPal2, 0.3), 0.2) * 0.8;
    float H = uSand.y * (0.85 + 0.3 * fbm2(vec2(p.x * 0.01 + uTime * 0.05, 0.3)));
    float n, lit;
    for (int i = 0; i < uStepsA.w; i++) {
      if (float(i) >= nS) break;
      float d = sandDens(p, H, n, lit);
      if (d > 0.003) {
        float yn = clamp(p.y / max(uSand.y, 1.0), 0.0, 1.0);
        // the face stands in the shadow of the sun behind it: tan where it
        // faces the sky, dark in the overhangs and at the foot; the top rim
        // catches the sun
        float thin = 1.0 - min(d, 1.0);
        vec3 c = base * mix(0.16, 0.75, yn) * (0.5 + 0.8 * n) * (0.35 + 1.25 * lit) + skyL * lit * yn * 0.35 + rim * pow(yn, 3.0) * thin * 0.9;
        float a = 1.0 - exp(-d * dtv * 0.09);
        acc += c * a * T; T *= 1.0 - a;
        if (T < 0.02) break;
      }
      p += rd * dtv;
    }
    return vec4(acc, T);
  }
  float skylineH(float x) {
    float cell = floor(x / 22.0);
    float h = h11(cell) * 16.0 + 5.0;
    float k = h11(cell + 7.3);
    if (k > 0.86) h += 34.0 + 30.0 * h11(cell + 1.7);   // a tower
    else if (k < 0.18) h = 3.0 + 3.0 * h11(cell + 2.1);  // tents
    // a minaret: a thin spire on some roofs
    float fx = fract(x / 22.0);
    if (k > 0.55 && k < 0.62 && abs(fx - 0.5) < 0.06) h += 22.0;
    return h;
  }
  vec3 sandstorm(vec3 ro, vec3 rd, vec2 uv, float jit) {
    vec3 skyC = mix(grey(uPal4, 0.25) * 1.15, grey(uPal2, 0.4) * 0.8, pow(max(rd.y, 0.0), 0.45));
    float sd = dot(rd, S_SUN);
    vec3 sunC = mix(uPal0, uPal1, 0.3);
    float disc = smoothstep(0.99880, 0.99950, sd);
    float glow = pow(max(sd, 0.0), 24.0) * 0.45 + pow(max(sd, 0.0), 4.0) * 0.12;
    float tg = rd.y < -1e-4 ? -ro.y / rd.y : 1e9;
    vec3 col;
    float ts = rd.z < -1e-4 ? (CITY_Z - ro.z) / rd.z : 1e9;
    if (tg < 1e8) {
      vec3 hp = ro + rd * tg;
      float n = fbm2(hp.xz * 0.05 + vec2(0.0, uTime * 0.1));
      float r = 0.5 + 0.5 * sin(hp.x * 0.8 + n * 6.0 + hp.z * 0.2);
      col = grey(uPal4, 0.1) * 0.85 * (0.7 + 0.3 * n) * (0.85 + 0.15 * r);
      // sand streaming across the ground toward the eye
      float st = smoothstep(0.62, 0.9, vnoise2(vec2(hp.x * 0.2 + n * 2.0, hp.z * 0.015 + uTime * 6.0)))
               + smoothstep(0.7, 0.92, vnoise2(vec2(hp.x * 0.45 + 3.0, hp.z * 0.03 + uTime * 9.0)));
      col += grey(uPal4, 0.2) * 0.9 * st * uSandB.z;
      col = mix(col, skyC, 1.0 - exp(-tg * 0.003));
    } else col = skyC + sunC * (glow + disc * 1.8);
    if (ts > 0.0 && ts < tg) {
      vec3 sp = ro + rd * ts;
      if (sp.y >= 0.0 && sp.y < skylineH(sp.x)) {
        float win = step(0.7, h21(floor(sp.xy * vec2(0.5, 0.45)))) * smoothstep(0.5, 0.3, abs(fract(sp.y * 0.45) - 0.5)) * 0.2;
        col = mix(grey(uPal4, 0.7) * 0.12 + uPal1 * win, skyC, 0.35);
      }
    }
    vec4 w = sandWall(ro, rd, tg, jit);
    float tau = -log(max(w.a, 1e-4));
    vec3 T3 = exp(-tau * vec3(0.55, 1.0, 1.6));
    col = col * T3 + w.rgb;
    float g = gritScreen(uv) * uSandB.z;
    col = mix(col, grey(uPal4, 0.25) * 0.7, g * 0.7);
    return col;
  }

  vec3 render(int s, vec3 ro, vec3 fwd, vec3 right, vec3 up, vec2 uv, float jit) {
    float aspect = uRes.x / uRes.y;
    vec3 rd = normalize(fwd + right * (uv.x * uTanHalf * aspect) + up * (uv.y * uTanHalf));
    vec3 c;
    if (s == 0) c = tornado(ro, rd, uv, jit);
    else if (s == 1) c = hurricane(ro, rd, uv, jit);
    else if (s == 2) c = lightning(ro, rd, uv, jit);
    else if (s == 3) c = wildfire(ro, rd, right, up, uv, jit);
    else c = sandstorm(ro, rd, uv, jit);
    return c;
  }

  void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    float jit = h21(gl_FragCoord.xy);
    vec3 col = vec3(0.0);
    if (uW.x > 0.002) { gStepK = clamp(uW.x * 1.6, 0.55, 1.0); col += render(uSysA, uPosA, uFwdA, uRightA, uUpA, uv, jit) * uW.x; }
    if (uW.y > 0.002) { gStepK = clamp(uW.y * 1.6, 0.55, 1.0); col += render(uSysB, uPosB, uFwdB, uRightB, uUpB, uv, jit) * uW.y; }
    fragColor = vec4(col * uIntensity * uWeight, 1.0);
  }
`;
// the quads' vertex shader: the 2-px patch for the warm frames (see uWarm)
const QUAD_VERT = /* glsl */ `
  uniform float uWarm;
  out vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = uWarm > 0.5 ? vec4(position.xy * 0.002 - 0.998, 0.0, 1.0) : vec4(position.xy, 0.0, 1.0);
  }`;

// ------------------------------------------------------------------- impostors
// A camera-facing quad per instance, projected through the module's own
// perspective camera (uView / uProj, the Tomb's scene camera is
// orthographic). aS = (radius, alpha, shape, seed), aC = (rgb, canopy) for the
// solids, (velocity, heat) for the glows. Shapes: 0 a fleck, 1..2 a tree (the
// fraction is how far the crown fire has run up it), 3 an ember streak.
const SPH_VERT = /* glsl */ `
  uniform mat4 uView, uProj;
  in vec2 aQuad;
  in vec3 aPos;
  in vec4 aS;
  in vec4 aC;
  out vec2 vQ;
  out vec4 vC;
  out float vA, vShape, vSeed;
  void main() {
    vec4 mv = uView * vec4(aPos, 1.0);
    float vis = step(0.001, aS.y);
    vec2 off;
    if (aS.z > 2.5) {
      // an ember streak: the quad stretched along the projected velocity
      vec3 vv = (uView * vec4(aC.xyz, 0.0)).xyz;
      vec2 dir = vv.xy;
      float L = length(dir);
      dir = L > 1e-4 ? dir / L : vec2(0.0, 1.0);
      vec2 nrm = vec2(-dir.y, dir.x);
      float len = aS.x + min(L * 0.2, aS.x * 10.0);
      off = dir * aQuad.y * len + nrm * aQuad.x * aS.x;
    } else {
      float tree = step(0.5, aS.z);
      off = mix(aQuad * aS.x, vec2(aQuad.x * aS.x * 0.8, (aQuad.y * 0.5 + 0.5) * aS.x * 2.6), tree);
    }
    mv.xy += off;
    gl_Position = vis > 0.5 ? uProj * mv : vec4(0.0, 0.0, 2.0, 1.0);
    vQ = aQuad;
    vA = aS.y;
    vShape = aS.z;
    vSeed = aS.w;
    vC = aC;
  }
`;
const SPH_FRAG_SOLID = /* glsl */ `
  ${GLSL_COMMON}
  uniform float uIntensity, uWeight;
  uniform vec3 uPal0, uPal1, uPal2, uPal3, uPal4;
  in vec2 vQ;
  in vec4 vC;
  in float vA, vShape, vSeed;
  out vec4 fragColor;
  void main() {
    float a;
    vec3 rgb = vC.rgb;
    if (vShape < 0.5) {
      // a fleck: a soft irregular disc
      float d = length(vQ) * (0.85 + 0.3 * vnoise2(vQ * 3.0 + vSeed * 7.0));
      a = smoothstep(1.0, 0.5, d);
    } else {
      // a tree: trunk and canopy in quad space, y from the foot (-1) to the top (1)
      float y = vQ.y * 0.5 + 0.5;
      float x = vQ.x;
      float trunk = step(abs(x), 0.05 + 0.03 * (1.0 - y)) * step(y, 0.45);
      float conifer = step(0.5, fract(vSeed * 7.31));
      float hw = conifer > 0.5
        ? (1.0 - y) * 0.62 * smoothstep(0.18, 0.3, y)
        : 0.7 * sqrt(max(0.0, 1.0 - pow((y - 0.62) / 0.4, 2.0)));
      hw *= (0.85 + 0.3 * vnoise2(vec2(y * 9.0 + vSeed * 10.0, x * 4.0))) * vC.a;
      float canopy = step(abs(x), hw) * step(0.02, vC.a);
      a = max(trunk, canopy);
      // CROWN FIRE: as the front arrives a flash runs up the crown, a bright
      // front climbing the canopy, and then the whole crown stands as a torch
      float torch = fract(vShape);
      if (torch > 0.01) {
        float yf = 0.3 + 0.75 * torch;
        float lit = smoothstep(yf + 0.06, yf - 0.12, y) * canopy * smoothstep(0.0, 0.2, torch);
        rgb = mix(rgb, mix(uPal1, uPal0, 0.3) * 1.9 * (0.8 + 0.4 * vnoise2(vec2(y * 14.0 + vSeed * 9.0, x * 6.0))), lit);
      }
    }
    if (a < 0.01) discard;
    fragColor = vec4(rgb * uIntensity, a * vA * uWeight);
  }
`;
const SPH_FRAG_GLOW = /* glsl */ `
  uniform float uIntensity, uWeight;
  uniform vec3 uPal0, uPal1;
  in vec2 vQ;
  in vec4 vC;
  in float vA, vShape, vSeed;
  out vec4 fragColor;
  void main() {
    float d2 = dot(vQ, vQ);
    if (d2 > 1.0) discard;
    float g = exp(-d2 * 3.0) * (1.0 - d2 * 0.3);
    // an ember: orange, yellow-hot while young
    vec3 c = uPal1 * (1.3 + 0.7 * vC.a) + mix(uPal0, uPal1, 0.5) * vC.a * 0.5;
    fragColor = vec4(c * g * vA * uIntensity * uWeight, 1.0);
  }
`;

// ------------------------------------------------------ capsules: the bolts
// Endpoints in world units projected by the module's camera; the quad is
// built in screen space so a channel is a constant-width capsule at any
// depth, with room round the core for a wide halo. aS = (core radius px,
// alpha, heat, -).
const CAP_VERT = /* glsl */ `
  uniform vec2 uRes;
  uniform mat4 uView, uProj;
  in vec2 aQuad;
  in vec3 aP0;
  in vec3 aP1;
  in vec4 aS;
  out vec2 vQ;
  out float vLenR, vA, vHeat;
  vec2 toScreen(vec3 p, out float w) {
    vec4 c = uProj * uView * vec4(p, 1.0);
    w = c.w;
    return c.xy / max(c.w, 0.001) * vec2(uRes.x / uRes.y, 1.0) * 0.5;
  }
  void main() {
    float w0, w1;
    vec2 s0 = toScreen(aP0, w0);
    vec2 s1 = toScreen(aP1, w1);
    float vis = step(0.1, w0) * step(0.1, w1) * step(0.001, aS.y);
    float aspect = uRes.x / uRes.y;
    vec2 d = s1 - s0;
    float len = length(d);
    vec2 dir = len > 1e-5 ? d / len : vec2(1.0, 0.0);
    vec2 nrm = vec2(-dir.y, dir.x);
    float rad = max(aS.x, 0.75) / uRes.y * 8.0;   // the halo reaches eight core radii
    vLenR = len / rad;
    vec2 pos = mix(s0 - dir * rad, s1 + dir * rad, aQuad.y) + nrm * aQuad.x * rad;
    gl_Position = vec4(pos / vec2(aspect, 1.0) * 2.0 * vis, vis > 0.5 ? 0.0 : 2.0, 1.0);
    vQ = vec2(aQuad.x, aQuad.y * (vLenR + 2.0) - 1.0);
    vA = aS.y;
    vHeat = aS.z;
  }
`;
const CAP_FRAG = /* glsl */ `
  uniform vec3 uBoltCol;
  uniform float uIntensity, uWeight;
  in vec2 vQ;
  in float vLenR, vA, vHeat;
  out vec4 fragColor;
  void main() {
    float u = clamp(vQ.y, 0.0, vLenR);
    float dx = vQ.y - u;
    float d2 = (dx * dx + vQ.x * vQ.x) * 64.0;   // in core radii²
    if (d2 > 64.0) discard;
    float dd = sqrt(d2);
    float core = exp(-d2 * 0.7);
    float halo = exp(-dd * 0.42) * 0.6;
    vec3 col = vec3(1.0) * core * (1.2 + 1.3 * vHeat) + uBoltCol * halo * (0.5 + 1.0 * vHeat);
    fragColor = vec4(col * vA * uIntensity * uWeight, 1.0);
  }
`;

// S is the Tomb's per-frame state for its plates: { dt, t, weight, sys,
// intensity, sway, press, hx, hy, opened, openNow, openS, openDim, bass,
// mid, high, pulse, level, warm }.
export function createWeather(THREE, ctx) {
  const tier = ctx.quality.tier;
  // the module's own eye: the impostors and the bolts project through it
  const camera = new THREE.PerspectiveCamera(FOV, ctx.width / Math.max(1, ctx.height), 0.1, 4000);

  // step budgets and pools by tier
  const DECK_STEPS = tier === 'low' ? 8 : tier === 'high' ? 16 : 11;
  const HUR_STEPS = tier === 'low' ? 7 : tier === 'high' ? 14 : 10;
  const FUN_STEPS = tier === 'low' ? 12 : tier === 'high' ? 26 : 18;
  const WALL_STEPS = tier === 'low' ? 9 : tier === 'high' ? 18 : 13;
  const FLAME_STEPS = tier === 'low' ? 7 : tier === 'high' ? 12 : 9;
  const SMOKE_STEPS = tier === 'low' ? 6 : tier === 'high' ? 12 : 10;
  const REF_STEPS = tier === 'low' ? 5 : tier === 'high' ? 9 : 7;
  const DEBRIS = tier === 'low' ? 320 : tier === 'high' ? 1100 : 640;
  const EMBERS = tier === 'low' ? 400 : tier === 'high' ? 1200 : 760;
  const TREES = tier === 'low' ? 100 : tier === 'high' ? 240 : 170;
  const N_SOLID = DEBRIS + TREES;
  const N_GLOW = EMBERS;

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const approach = (v, to, tau, dt) => v + (to - v) * (1 - Math.exp(-dt / tau));
  const smooth01 = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };

  const pal5 = () => Array.from({ length: 5 }, () => ({ value: new THREE.Color(1, 1, 1) }));
  const wp = pal5(), gp = pal5();
  const palUniforms = (p) => ({ uPal0: p[0], uPal1: p[1], uPal2: p[2], uPal3: p[3], uPal4: p[4] });
  const viewU = { value: new THREE.Matrix4() };
  const projU = { value: new THREE.Matrix4() };
  const weightU = { value: 1 };
  const intensityU = { value: 1 };

  // --- the world quad -----------------------------------------------------------------
  const flashU = new Float32Array(FLASHES * 4);
  const fireU = new Float32Array(FIRE_MAX * 4);
  const whirlU = new Float32Array(WHIRLS * 4);
  const WU = {
    uRes: { value: new THREE.Vector2(ctx.width, ctx.height) },
    uTanHalf: { value: Math.tan((FOV * Math.PI) / 360) },
    uStepsA: { value: new THREE.Vector4(DECK_STEPS, HUR_STEPS, FUN_STEPS, WALL_STEPS) },
    uStepsB: { value: new THREE.Vector4(FLAME_STEPS * 2 + 2, SMOKE_STEPS + 6, REF_STEPS, 0) },
    uTime: { value: 0 },
    uIntensity: intensityU,
    uWeight: weightU,
    uWarm: { value: 1 },
    uOpen: { value: 0 },
    uLevel: { value: 0 },
    uBreath: { value: new THREE.Vector4() },
    uSysA: { value: 0 },
    uSysB: { value: 1 },
    uW: { value: new THREE.Vector2(1, 0) },
    uPosA: { value: new THREE.Vector3() }, uFwdA: { value: new THREE.Vector3(0, 0, -1) }, uRightA: { value: new THREE.Vector3(1, 0, 0) }, uUpA: { value: new THREE.Vector3(0, 1, 0) },
    uPosB: { value: new THREE.Vector3() }, uFwdB: { value: new THREE.Vector3(0, 0, -1) }, uRightB: { value: new THREE.Vector3(1, 0, 0) }, uUpB: { value: new THREE.Vector3(0, 1, 0) },
    uFlash: { value: flashU },
    uFlashCol: { value: new THREE.Color(1, 1, 1) },
    uTor: { value: new THREE.Vector4(0, 0, 0, 0) },
    uTorB: { value: new THREE.Vector4(0.5, 0, 1, 0) },
    uTorAxis: { value: new THREE.Vector2(TOR_X, TOR_Z) },
    uHur: { value: new THREE.Vector4(120, 0, 0, 0) },
    uHurB: { value: new THREE.Vector4(0.5, 1, 0, 0) },
    uHurC: { value: new THREE.Vector2(HUR_X, HUR_Z) },
    uLit: { value: new THREE.Vector4(0, 300, 0, 0.5) },
    uLitC: { value: new THREE.Vector2(LIT_X, LIT_Z) },
    uFireP: { value: new THREE.Vector4(0, 0, 0, 0.5) },
    uFire: { value: fireU },
    uFireN: { value: 0 },
    uFireW: { value: new THREE.Vector4(0, 0, 0, 0) },
    uWhirl: { value: whirlU },
    uSand: { value: new THREE.Vector4(WALL_FAR, 0, 0, 0) },
    uSandB: { value: new THREE.Vector4(0, 0, 0, 0.5) },
    ...palUniforms(wp),
  };
  const worldMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: WU,
    defines: {},
    vertexShader: QUAD_VERT,
    fragmentShader: WORLD_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  worldMat.name = 'tomb-weather-world';
  const world = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), worldMat);
  world.frustumCulled = false;
  world.renderOrder = 1;

  // --- one quad geometry for every instanced system ----------------------------------
  const quadPos = new Float32Array([-1, 0, 0, 1, 0, 0, -1, 1, 0, 1, 1, 0]);
  const quadUV = new Float32Array([-1, 0, 1, 0, -1, 1, 1, 1]);
  const sphUV = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  function instancedQuad(uvs) {
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(quadPos, 3));
    g.setAttribute('aQuad', new THREE.BufferAttribute(uvs, 2));
    g.setIndex([0, 1, 2, 2, 1, 3]);
    return g;
  }
  const dyn = (arr, n) => { const a = new THREE.InstancedBufferAttribute(arr, n); a.setUsage(THREE.DynamicDrawUsage); return a; };

  function sphereSystem(n, frag, solid, order, name) {
    const geo = instancedQuad(sphUV);
    const pos = new Float32Array(n * 3);
    const s = new Float32Array(n * 4);
    const c = new Float32Array(n * 4);
    const aPos = dyn(pos, 3), aS = dyn(s, 4), aC = dyn(c, 4);
    geo.setAttribute('aPos', aPos);
    geo.setAttribute('aS', aS);
    geo.setAttribute('aC', aC);
    geo.instanceCount = n;
    const U = { uIntensity: intensityU, uWeight: weightU, uView: viewU, uProj: projU, ...palUniforms(gp) };
    const mat = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3, uniforms: U, vertexShader: SPH_VERT, fragmentShader: frag,
      transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
      blending: solid ? THREE.NormalBlending : THREE.AdditiveBlending,
    });
    mat.name = name;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = order;
    return { geo, mat, mesh, pos, s, c, aPos, aS, aC, U };
  }
  const solids = sphereSystem(N_SOLID, SPH_FRAG_SOLID, true, 5, 'tomb-weather-solids');
  const glows = sphereSystem(N_GLOW, SPH_FRAG_GLOW, false, 6, 'tomb-weather-glows');
  const sph = (sys, i, x, y, z, r, alpha, shape, seed) => {
    const o = i * 3, q = i * 4;
    sys.pos[o] = x; sys.pos[o + 1] = y; sys.pos[o + 2] = z;
    sys.s[q] = r; sys.s[q + 1] = alpha; sys.s[q + 2] = shape; sys.s[q + 3] = seed;
  };
  const sphC = (sys, i, r, g, b, a) => {
    const q = i * 4;
    sys.c[q] = r; sys.c[q + 1] = g; sys.c[q + 2] = b; sys.c[q + 3] = a;
  };

  // the capsules (bolts)
  const capGeo = instancedQuad(quadUV);
  const capP0 = new Float32Array(N_CAPS * 3);
  const capP1 = new Float32Array(N_CAPS * 3);
  const capS = new Float32Array(N_CAPS * 4);
  const capAP0 = dyn(capP0, 3), capAP1 = dyn(capP1, 3), capAS = dyn(capS, 4);
  capGeo.setAttribute('aP0', capAP0);
  capGeo.setAttribute('aP1', capAP1);
  capGeo.setAttribute('aS', capAS);
  capGeo.instanceCount = N_CAPS;
  const CU = { uRes: { value: new THREE.Vector2(ctx.width, ctx.height) }, uIntensity: intensityU, uWeight: weightU, uView: viewU, uProj: projU, uBoltCol: { value: new THREE.Color(1, 1, 1) } };
  const capMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, uniforms: CU, vertexShader: CAP_VERT, fragmentShader: CAP_FRAG,
    transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
  capMat.name = 'tomb-weather-bolts';
  const caps = new THREE.Mesh(capGeo, capMat);
  caps.frustumCulled = false;
  caps.renderOrder = 7;

  // --- state -------------------------------------------------------------------------
  let sysTarget = 0;
  const sysW = new Float32Array(SYSTEMS);
  sysW[0] = 1;
  const build = new Float32Array(SYSTEMS);    // each system's build, 0 -> 1 once it has run
  let swayS = 0, pressS = 0, hx = 0.5, hy = 0.5;
  let bass = 0, mid = 0, high = 0, pulse = 0;
  let calmS = 0, openS = 0, opened = false;
  // per-system eyes, smoothed separately so a dissolve never flies one camera between worlds
  const eyePos = [], eyeTgt = [];
  for (let i = 0; i < SYSTEMS; i++) { eyePos.push(new THREE.Vector3()); eyeTgt.push(new THREE.Vector3()); }
  const wantPos = new THREE.Vector3(), wantTgt = new THREE.Vector3();
  const lookM = new THREE.Matrix4();
  const upV = new THREE.Vector3(0, 1, 0);
  const eyeInit = new Uint8Array(SYSTEMS);
  // the flashes: position, intensity, decay rate, restrike schedule
  const flX = new Float32Array(FLASHES), flY = new Float32Array(FLASHES), flZ = new Float32Array(FLASHES);
  const flI = new Float32Array(FLASHES), flAge = new Float32Array(FLASHES), flLife = new Float32Array(FLASHES), flAmp = new Float32Array(FLASHES);
  let flNext = 0;
  function flash(x, y, z, amp, life) {
    const i = flNext; flNext = (flNext + 1) % FLASHES;
    flX[i] = x; flY[i] = y; flZ[i] = z; flAmp[i] = amp; flAge[i] = 0; flLife[i] = life; flI[i] = amp;
  }
  let bloomS = 0.3;

  // --- the tornado ---------------------------------------------------------------------
  let tdTarget = 0, drop = 0, touched = 0;
  let torFlashT = 2;
  const dbR = new Float32Array(DEBRIS), dbTh = new Float32Array(DEBRIS), dbY = new Float32Array(DEBRIS), dbSd = new Float32Array(DEBRIS);
  for (let i = 0; i < DEBRIS; i++) { dbR[i] = 4 + Math.random() * 26; dbTh[i] = Math.random() * Math.PI * 2; dbY[i] = Math.random() * 20; dbSd[i] = Math.random(); }
  function torAxisX(y, t, tort) {
    const s = clamp(1 - y / T_CB, 0, 1);
    const a = (1.5 + 9 * tort) * s;
    return TOR_X + a * (Math.sin(y * 0.11 + t * 0.7) + 0.5 * Math.sin(y * 0.23 - t * 1.1));
  }
  function torAxisZ(y, t, tort) {
    const s = clamp(1 - y / T_CB, 0, 1);
    const a = (1.5 + 9 * tort) * s;
    return TOR_Z + a * Math.cos(y * 0.09 - t * 0.55);
  }
  function updateTornado(dt, t, w, intensity) {
    const b = build[0];
    // the funnel hangs lower the stronger the storm and reaches the ground on
    // touchdown; it grows down from the base as the system builds
    const want = (tdTarget ? 1 : 0.6 + 0.3 * intensity) * b * (1 - calmS);
    drop = approach(drop, want, want > drop ? 1.6 : 0.9, dt);
    // the circulation reaches the ground before the condensation does: the
    // debris cloud builds as the funnel comes within reach
    touched = approach(touched, smooth01((drop - 0.8) / 0.18), 0.6, dt);
    // lightning inside the cell
    torFlashT -= dt * (0.25 + 1.2 * intensity) * b;
    if (torFlashT <= 0) {
      torFlashT = 0.6 + Math.random() * 2.5;
      const a = Math.random() * Math.PI * 2, r = 40 + Math.random() * 120;
      flash(TOR_X + Math.cos(a) * r, T_CB + 4 + Math.random() * 14, TOR_Z + Math.sin(a) * r, 0.7 + Math.random() * 0.7, 0.25);
    }
    WU.uTor.value.set(drop, swayS, pressS, b * openS);
    WU.uTorB.value.set(intensity, (0.3 + 0.7 * intensity) * b * openS * (0.7 + 0.6 * high), 0.4 + 1.6 * intensity, touched);
    // the debris cloud: a helical flow field, fastest near the axis, recycled at the top
    const tort = swayS;
    const show = w > 0.002 && touched > 0.01;
    const pr = gp;
    const dr = pr[4].value, d1 = pr[1].value;
    const cr = dr.r * 0.3 + d1.r * 0.07, cg = dr.g * 0.3 + d1.g * 0.07, cb = dr.b * 0.3 + d1.b * 0.07;
    for (let i = 0; i < DEBRIS; i++) {
      if (!show) { solids.s[i * 4 + 1] = 0; continue; }
      const sd = dbSd[i];
      dbTh[i] += dt * (2.0 + 9.0 / (0.5 + dbR[i] / 6)) * (0.6 + 0.8 * intensity);
      dbY[i] += dt * (2.5 + 5 * sd) * (0.5 + intensity);
      dbR[i] += dt * (-1.2 + sd * 0.6);
      const ymax = 18 + 16 * sd;
      if (dbY[i] > ymax || dbR[i] < 1.0) { dbY[i] = Math.random() * 1.5; dbR[i] = 5 + Math.random() * 26; dbTh[i] = Math.random() * Math.PI * 2; }
      const y = dbY[i];
      const ax = torAxisX(y, t, tort), az = torAxisZ(y, t, tort);
      const x = ax + Math.cos(dbTh[i]) * dbR[i], z = az + Math.sin(dbTh[i]) * dbR[i];
      const al = touched * (1 - y / ymax) * (0.6 + 0.4 * sd) * w;
      sph(solids, i, x, y, z, 0.22 + sd * sd * 0.7, al * 0.55, 0, sd * 13);
      sphC(solids, i, cr, cg, cb, 1);
    }
  }

  // --- the hurricane -------------------------------------------------------------------
  let erc = 0, ercOn = false, hurFlashT = 1;
  let gustH = 0;   // a gust races the bands
  function updateHurricane(dt, t, w, intensity) {
    const b = build[1];
    if (ercOn) { erc += dt / 9; if (erc >= 1) { erc = 0; ercOn = false; } }
    gustH = Math.max(0, gustH - dt * 0.25);
    hurFlashT -= dt * (0.4 + 1.6 * intensity) * b;
    const eyeR = ((130 - 55 * intensity) * (1 - 0.3 * pressS) * (1 - 0.5 * calmS) + 40 * calmS) * (0.25 + 0.75 * smooth01(b));
    if (hurFlashT <= 0) {
      // lightning in the eyewall and along the inner bands, under the tops
      hurFlashT = 0.4 + Math.random() * 1.3;
      const a = Math.random() * Math.PI * 2, r = eyeR * (1.05 + Math.random() * 0.35);
      flash(HUR_X + Math.cos(a) * r, 70 + Math.random() * 50, HUR_Z + Math.sin(a) * r, 0.7 + Math.random() * 0.7, 0.22);
    }
    WU.uHur.value.set(eyeR, swayS, b * openS, ercOn ? erc : 0);
    WU.uHurB.value.set(intensity, (0.4 + 1.6 * intensity + gustH * 2) * (1 - 0.6 * calmS), pressS, 0);
  }

  // --- the lightning -------------------------------------------------------------------
  // bolts: per segment endpoints, level, reveal fraction; per bolt the clock
  const bSeg0 = new Float32Array(N_CAPS * 3), bSeg1 = new Float32Array(N_CAPS * 3);
  const bLvl = new Float32Array(N_CAPS), bRev = new Float32Array(N_CAPS);
  const bN = new Int32Array(MAX_BOLTS), bAge = new Float32Array(MAX_BOLTS), bLife = new Float32Array(MAX_BOLTS);
  const bStrikes = new Int32Array(MAX_BOLTS), bFlash = new Int32Array(MAX_BOLTS);
  const bTopY = new Float32Array(MAX_BOLTS);
  for (let i = 0; i < MAX_BOLTS; i++) bAge[i] = 99;
  let bNext = 0;
  // the branch stack
  const STACK = 32;
  const stX = new Float32Array(STACK), stY = new Float32Array(STACK), stZ = new Float32Array(STACK);
  const stDX = new Float32Array(STACK), stDY = new Float32Array(STACK), stDZ = new Float32Array(STACK);
  const stLen = new Float32Array(STACK), stLvl = new Int32Array(STACK), stRev = new Float32Array(STACK);
  let litAutoT = 2, litCcT = 1;
  const LEAD = 0.09;
  // channel widths by level: the leader, the fork, branches, twigs
  const LVL_W = [1, 0.72, 0.42, 0.24];
  function fireBolt(x0, y0, z0, x1, z1, branching) {
    const bi = bNext; bNext = (bNext + 1) % MAX_BOLTS;
    const base = bi * BOLT_SEGS;
    let n = 0, sp = 0;
    const segL = y0 / 30;
    const total = Math.sqrt((x1 - x0) * (x1 - x0) + y0 * y0 + (z1 - z0) * (z1 - z0)) * 1.25;
    let dx = x1 - x0, dy = -y0, dz = z1 - z0;
    let dl = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-6;
    stX[sp] = x0; stY[sp] = y0; stZ[sp] = z0; stDX[sp] = dx / dl; stDY[sp] = dy / dl; stDZ[sp] = dz / dl; stLen[sp] = total; stLvl[sp] = 0; stRev[sp] = 0; sp++;
    const pBranch = 0.16 + 0.25 * branching;
    // the leader forks once into a second main channel somewhere in its middle third
    const forkAt = 10 + ((Math.random() * 10) | 0);
    let forked = false;
    while (sp > 0 && n < BOLT_SEGS) {
      sp--;
      let px = stX[sp], py = stY[sp], pz = stZ[sp];
      let ddx = stDX[sp], ddy = stDY[sp], ddz = stDZ[sp];
      let len = stLen[sp];
      const lvl = stLvl[sp];
      let rev = stRev[sp];
      const jit = 0.5 + lvl * 0.22;
      const steps = Math.floor(len / segL);
      for (let k = 0; k < steps && n < BOLT_SEGS; k++) {
        ddx += (Math.random() - 0.5) * jit; ddy += (Math.random() - 0.5) * jit * 0.6 - 0.12; ddz += (Math.random() - 0.5) * jit;
        // the leader and the fork keep heading for the ground
        if (lvl <= 1) { ddx += (x1 - px) / Math.max(py, 4) * 0.08; ddz += (z1 - pz) / Math.max(py, 4) * 0.08; }
        dl = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz) + 1e-6;
        ddx /= dl; ddy /= dl; ddz /= dl;
        let qx = px + ddx * segL, qy = py + ddy * segL, qz = pz + ddz * segL;
        if (qy < 0) { qy = 0; }
        const o = (base + n) * 3;
        bSeg0[o] = px; bSeg0[o + 1] = py; bSeg0[o + 2] = pz;
        bSeg1[o] = qx; bSeg1[o + 1] = qy; bSeg1[o + 2] = qz;
        bLvl[base + n] = lvl; bRev[base + n] = rev;
        rev += segL / total;
        n++;
        px = qx; py = qy; pz = qz;
        if (py <= 0) break;
        const fork = lvl === 0 && !forked && k === forkAt;
        if (sp < STACK && lvl < 3 && (fork || Math.random() < pBranch * (lvl === 0 ? 1 : lvl === 1 ? 0.8 : 0.5))) {
          // a branch: the heading turned 25 to 55° off the channel, shorter, thinner;
          // the fork turns less and runs most of the way down
          const ang = (fork ? 0.3 + Math.random() * 0.3 : 0.45 + Math.random() * 0.55) * (Math.random() < 0.5 ? 1 : -1);
          const ca = Math.cos(ang), sa = Math.sin(ang);
          const rx = Math.random() < 0.5;
          stX[sp] = px; stY[sp] = py; stZ[sp] = pz;
          stDX[sp] = rx ? ddx * ca - ddy * sa : ddx; stDY[sp] = rx ? ddx * sa + ddy * ca : ddy * ca - ddz * sa; stDZ[sp] = rx ? ddz : ddy * sa + ddz * ca;
          stLen[sp] = (len - (k + 1) * segL) * (fork ? 0.7 + Math.random() * 0.3 : 0.25 + Math.random() * 0.45);
          stLvl[sp] = fork ? 1 : lvl < 1 ? 2 : lvl + 1; stRev[sp] = rev;
          if (fork) forked = true;
          sp++;
        }
      }
    }
    bN[bi] = n; bAge[bi] = 0; bLife[bi] = 0.42 + Math.random() * 0.22; bStrikes[bi] = 2 + ((Math.random() * 2) | 0);
    bTopY[bi] = y0;
    bFlash[bi] = flNext;
    flash((x0 + x1) * 0.5, y0 * 0.5, (z0 + z1) * 0.5, 0, 0.5);
    bloomS = Math.max(bloomS, 1.0);
    return bi;
  }
  // the stroke envelope: dim leader, then the return stroke and its restrikes
  function strokeEnv(age, life, strikes) {
    if (age < LEAD) return 0.25;
    let e = 0;
    for (let k = 0; k < strikes; k++) {
      const tk = LEAD + k * 0.07;
      if (age >= tk) e = Math.max(e, Math.exp(-(age - tk) * 11) * (k === 0 ? 1 : 0.7));
    }
    return e * (1 - smooth01((age - life * 0.6) / (life * 0.4)));
  }
  function strikeAt(sys) {
    // a bolt in any system: from that system's cloud base to its ground
    let x0, z0, y0;
    if (sys === 0) { const a = Math.random() * Math.PI * 2, r = 30 + Math.random() * 110; x0 = TOR_X + Math.cos(a) * r; z0 = TOR_Z + Math.sin(a) * r; y0 = T_CB - 6; }
    else if (sys === 1) { const a = Math.random() * Math.PI * 2, r = WU.uHur.value.x * 1.15; x0 = HUR_X + Math.cos(a) * r; z0 = HUR_Z + Math.sin(a) * r; y0 = 60; }
    else if (sys === 2) { const a = Math.random() * Math.PI * 2, r = 20 + Math.random() * 120; x0 = LIT_X + Math.cos(a) * r * 0.8; z0 = LIT_Z + 110 + Math.sin(a) * r * 0.45; y0 = L_CB - 4 - pressS * 8; }
    else if (sys === 3) { x0 = (Math.random() - 0.5) * 200; z0 = -90 - Math.random() * 200; y0 = 48; }
    else { x0 = (Math.random() - 0.5) * 300; z0 = -200 - Math.random() * 500; y0 = 70; }
    const x1 = x0 + (Math.random() - 0.5) * y0 * 0.8, z1 = z0 + (Math.random() - 0.5) * y0 * 0.8;
    fireBolt(x0, y0, z0, x1, z1, swayS);
  }
  function updateLightning(dt, t, w, intensity) {
    const b = build[2];
    // the storm strikes on its own at the intensity's rate; sheet flashes light the bellies between
    litAutoT -= dt * (0.15 + 0.9 * intensity) * b * (1 - calmS);
    if (litAutoT <= 0 && sysTarget === 2) { litAutoT = 1 + Math.random() * 4; strikeAt(2); }
    litCcT -= dt * (0.3 + 1.4 * intensity) * b * (1 - calmS);
    if (litCcT <= 0 && sysTarget === 2) {
      litCcT = 0.5 + Math.random() * 2.5;
      const a = Math.random() * Math.PI * 2, r = Math.random() * 200;
      flash(LIT_X + Math.cos(a) * r, L_CB + 6 + Math.random() * 16, LIT_Z + Math.sin(a) * r, 0.8 + Math.random() * 0.9, 0.3);
    }
    WU.uLit.value.set(b * openS, 120 + 220 * b, pressS, (0.3 + 0.7 * intensity) * b * (0.6 + 0.6 * high));
    // the bolts: reveal in the leader phase, then the stroke
    for (let bi = 0; bi < MAX_BOLTS; bi++) {
      bAge[bi] += dt;
      const base = bi * BOLT_SEGS;
      const alive = bAge[bi] < bLife[bi];
      const env = alive ? strokeEnv(bAge[bi], bLife[bi], bStrikes[bi]) : 0;
      const lead = clamp(bAge[bi] / LEAD, 0, 1);
      const fs = bFlash[bi];
      if (alive) flI[fs] = Math.max(flI[fs], (env - 0.25) * 1.9 * (bAge[bi] >= LEAD ? 1 : 0));
      for (let k = 0; k < BOLT_SEGS; k++) {
        const q = (base + k) * 4;
        if (!alive || k >= bN[bi] || bRev[base + k] > lead) { capS[q + 1] = 0; continue; }
        const lv = bLvl[base + k];
        const lf = LVL_W[lv];
        const a = env * lf * (lv <= 1 ? 1 : Math.exp(-Math.max(0, bAge[bi] - LEAD) * 7));
        const o = (base + k) * 3;
        capP0[o] = bSeg0[o]; capP0[o + 1] = bSeg0[o + 1]; capP0[o + 2] = bSeg0[o + 2];
        capP1[o] = bSeg1[o]; capP1[o + 1] = bSeg1[o + 1]; capP1[o + 2] = bSeg1[o + 2];
        capS[q] = (lv === 0 ? 3.0 : lv === 1 ? 2.3 : 1.4) * (0.7 + 0.6 * env);
        capS[q + 1] = a;
        capS[q + 2] = env;
      }
    }
  }

  // --- the wildfire ----------------------------------------------------------------------
  const fC = new Float32Array(FIRE_MAX * 2), fR = new Float32Array(FIRE_MAX), fOn = new Uint8Array(FIRE_MAX);
  let fireN = 0, fireCycle = 1;   // fireCycle: 1 burning, falls to 0 when the stand has burnt
  const emX = new Float32Array(EMBERS), emY = new Float32Array(EMBERS), emZ = new Float32Array(EMBERS);
  const emVX = new Float32Array(EMBERS), emVY = new Float32Array(EMBERS), emVZ = new Float32Array(EMBERS);
  const emLife = new Float32Array(EMBERS), emMax = new Float32Array(EMBERS), emSd = new Float32Array(EMBERS);
  const emKind = new Uint8Array(EMBERS);   // 0 a front ember, 1 lofted in the column, 2 a spotting ember carried ahead
  let emNext = 0, emAcc = 0, spotT = 0;
  const trX = new Float32Array(TREES), trZ = new Float32Array(TREES), trH = new Float32Array(TREES), trSd = new Float32Array(TREES);
  for (let i = 0; i < TREES; i++) {
    if (i < FORE_TREES) {
      // the big trees in the foreground, either side of the eye's line
      const side = i % 2 === 0 ? 1 : -1;
      trX[i] = side * (12 + Math.random() * 60); trZ[i] = -60 + Math.random() * 62; trH[i] = 7 + Math.random() * 6;
    } else { trX[i] = (Math.random() - 0.5) * 2 * STAND_X; trZ[i] = STAND_Z0 + Math.random() * (STAND_Z1 - STAND_Z0); trH[i] = 3 + Math.random() * 5; }
    trSd[i] = Math.random();
  }
  // the fire whirls: each rides the front of a circle at an angle, builds, stands, dies, rests
  const whA = new Float32Array(WHIRLS), whR = new Float32Array(WHIRLS), whS = new Float32Array(WHIRLS), whT = new Float32Array(WHIRLS);
  const whOn = new Uint8Array(WHIRLS), whK = new Int32Array(WHIRLS), whHold = new Float32Array(WHIRLS);
  for (let i = 0; i < WHIRLS; i++) { whT[i] = 4 + Math.random() * 6 + i * 5; whR[i] = 4 + Math.random() * 3; }
  function ignite(x, z, r0) {
    let slot = -1;
    for (let i = 0; i < FIRE_MAX; i++) if (!fOn[i]) { slot = i; break; }
    if (slot < 0) return;
    fOn[slot] = 1; fC[slot * 2] = x; fC[slot * 2 + 1] = z; fR[slot] = r0;
    if (slot >= fireN) fireN = slot + 1;
  }
  function resetFire() { for (let i = 0; i < FIRE_MAX; i++) fOn[i] = 0; fireN = 0; for (let i = 0; i < WHIRLS; i++) whOn[i] = 0; }
  function flareUp() {
    // a spot fire ahead of the front: beyond the nearest front toward the eye, off to one side
    let best = -1, bestD = 1e9;
    for (let i = 0; i < fireN; i++) if (fOn[i]) { const d = Math.abs(fC[i * 2 + 1] + fR[i]); if (d < bestD) { bestD = d; best = i; } }
    if (best < 0) { ignite((Math.random() - 0.5) * 60, STAND_Z0 + 60, 0.5); return; }
    const z = clamp(fC[best * 2 + 1] + fR[best] + 30 + Math.random() * 40, STAND_Z0, -60);
    ignite(fC[best * 2] + (Math.random() - 0.5) * 160, z, 0.5);
  }
  function burnAt(x, z, wind) {
    let m = -1e3;
    for (let i = 0; i < fireN; i++) {
      if (!fOn[i]) continue;
      const rx = x - fC[i * 2] - wind * fR[i] * 0.04, rz = z - fC[i * 2 + 1];
      const d = fR[i] - Math.sqrt(rx * rx + rz * rz);
      if (d > m) m = d;
    }
    return m;
  }
  function updateWildfire(dt, t, w, intensity) {
    const b = build[3];
    const wind = swayS * 12;
    // the fronts grow at the intensity's rate; when the stand has burnt the fire dies back
    const rate = (2 + 7.5 * intensity) * b * (1 - calmS) * fireCycle;
    let rmax = 0, kmax = -1;
    for (let i = 0; i < fireN; i++) if (fOn[i]) { fR[i] += dt * rate; if (fR[i] > rmax) { rmax = fR[i]; kmax = i; } }
    if (rmax > 440 && fireCycle > 0.99) fireCycle = 0.98;
    if (fireCycle < 0.99) {
      fireCycle = Math.max(0, fireCycle - dt / 6);
      if (fireCycle <= 0) { resetFire(); fireCycle = 1; build[3] = 0; }
    }
    if (b > 0.05 && fireN === 0 && opened) ignite((Math.random() - 0.5) * 40, -180 + (Math.random() - 0.5) * 30, 0.5);
    const storm = b * openS * fireCycle;
    WU.uFireP.value.set(storm, wind, pressS, intensity);
    WU.uFireN.value = fireN;
    for (let i = 0; i < FIRE_MAX; i++) { fireU[i * 4] = fC[i * 2]; fireU[i * 4 + 1] = fC[i * 2 + 1]; fireU[i * 4 + 2] = fR[i]; fireU[i * 4 + 3] = fOn[i]; }
    const show = w > 0.002;
    // the FIRE WHIRLS: one or two rotating columns on the front of the biggest
    // circle, on the side toward the eye; each builds over a second and a
    // half, stands for some seconds, dies, and rests before the next
    let whMax = 0;
    for (let i = 0; i < WHIRLS; i++) {
      if (!whOn[i]) {
        whS[i] = Math.max(0, whS[i] - dt / 2);
        whT[i] -= dt * (storm > 0.3 && kmax >= 0 ? 1 : 0);
        if (whT[i] <= 0 && kmax >= 0 && fR[kmax] > 30) {
          whOn[i] = 1; whK[i] = kmax; whHold[i] = 4 + Math.random() * 5;
          const cx = fC[kmax * 2], cz = fC[kmax * 2 + 1];
          whA[i] = Math.atan2(-cz, -cx) + (Math.random() - 0.5) * 1.4;   // toward the eye, roughly
          whR[i] = 4 + Math.random() * 3.5;
        }
      } else {
        whS[i] = approach(whS[i], 1, 1.2, dt);
        whHold[i] -= dt;
        if (whHold[i] <= 0 || !fOn[whK[i]] || storm < 0.2) { whOn[i] = 0; whT[i] = 3 + Math.random() * 7; }
      }
      const k = whK[i];
      const onF = fOn[k] ? 1 : 0;
      const x = fC[k * 2] + wind * fR[k] * 0.04 + Math.cos(whA[i]) * fR[k], z = fC[k * 2 + 1] + Math.sin(whA[i]) * fR[k];
      const s = whS[i] * onF * storm;
      whirlU[i * 4] = x; whirlU[i * 4 + 1] = z; whirlU[i * 4 + 2] = whR[i]; whirlU[i * 4 + 3] = s;
      if (s > whMax) whMax = s;
    }
    WU.uFireW.value.set(whMax, 0, 0, 0);
    // embers loft from the fronts, most from the flames, some high in the
    // column, a few carried far ahead on the wind to SPOT new fires
    if (show && storm > 0.2 && fireN > 0) {
      emAcc += dt * (70 + 300 * intensity) * storm;
      while (emAcc >= 1) {
        emAcc -= 1;
        let k = (Math.random() * fireN) | 0;
        if (!fOn[k]) { for (let j = 0; j < fireN; j++) if (fOn[j]) { k = j; break; } }
        if (!fOn[k]) break;
        const a = Math.random() * Math.PI * 2, r = fR[k] - Math.random() * FIRE_W;
        const i = emNext; emNext = (emNext + 1) % EMBERS;
        const kind = Math.random() < 0.2 ? 1 : Math.random() < 0.12 ? 2 : 0;
        emKind[i] = kind;
        emX[i] = fC[k * 2] + wind * fR[k] * 0.04 + Math.cos(a) * r; emZ[i] = fC[k * 2 + 1] + Math.sin(a) * r; emY[i] = 0.5 + Math.random() * 4;
        if (kind === 1) { emVX[i] = wind * 0.15 + (Math.random() - 0.5) * 2; emVY[i] = 11 + Math.random() * 9; emVZ[i] = (Math.random() - 0.5) * 2; emMax[i] = 3 + Math.random() * 3; }
        else if (kind === 2) { emVX[i] = wind * 0.9 + 6 + Math.random() * 6; emVY[i] = 6 + Math.random() * 5; emVZ[i] = (Math.random() - 0.5) * 4; emMax[i] = 4 + Math.random() * 3; }
        else { emVX[i] = wind * 0.25 + (Math.random() - 0.5) * 3; emVY[i] = 4 + Math.random() * 7; emVZ[i] = (Math.random() - 0.5) * 3; emMax[i] = 1.5 + Math.random() * 3; }
        emLife[i] = 0; emSd[i] = Math.random();
      }
    }
    spotT = Math.max(0, spotT - dt);
    for (let i = 0; i < EMBERS; i++) {
      if (!show || emLife[i] >= emMax[i]) { glows.s[i * 4 + 1] = 0; emLife[i] = emMax[i]; continue; }
      emLife[i] += dt;
      const kind = emKind[i];
      if (kind === 1) {
        // lofted in the column: the updraught holds it up and the wind leans it
        emVY[i] += dt * (3.0 - emVY[i] * 0.12);
        emVX[i] += dt * (wind * 0.5 - emVX[i] * 0.2);
        emVZ[i] += dt * (Math.cos(t * 1.7 + emSd[i] * 17) * 2 - emVZ[i] * 0.2);
      } else if (kind === 2) {
        // carried ahead: it arcs over and comes down
        emVY[i] -= dt * 4.5;
        emVX[i] += dt * (wind * 0.4 - emVX[i] * 0.05);
      } else {
        emVY[i] += dt * (1.5 - emVY[i] * 0.25);
        emVX[i] += dt * (Math.sin(t * 3 + emSd[i] * 20) * 3 + wind * 0.3 - emVX[i] * 0.3);
        emVZ[i] += dt * (Math.cos(t * 2.3 + emSd[i] * 17) * 3 - emVZ[i] * 0.3);
      }
      emX[i] += emVX[i] * dt; emY[i] += emVY[i] * dt; emZ[i] += emVZ[i] * dt;
      if (kind === 2 && emY[i] < 0.2 && emLife[i] > 0.8) {
        // SPOTTING: an ember landing ahead of the front starts a small fire
        emLife[i] = emMax[i];
        if (spotT <= 0 && storm > 0.4 && burnAt(emX[i], emZ[i], wind) < -14 && emZ[i] > STAND_Z0 && emZ[i] < -50) { ignite(emX[i], emZ[i], 0.5); spotT = 2.5; }
        glows.s[i * 4 + 1] = 0;
        continue;
      }
      const lf = 1 - emLife[i] / emMax[i];
      const flick = 0.6 + 0.4 * Math.sin(t * 11 + emSd[i] * 40);
      const ex = emX[i] - camera.position.x, ey = emY[i] - camera.position.y, ez = emZ[i] - camera.position.z;
      const dist = Math.sqrt(ex * ex + ey * ey + ez * ez);
      sph(glows, i, emX[i], emY[i], emZ[i], Math.max(0.16 + emSd[i] * 0.2, dist * 0.004), lf * flick * w * 1.1, 3, emSd[i]);
      sphC(glows, i, emVX[i], emVY[i], emVZ[i], lf * lf * (0.3 + 0.7 * flick));
    }
    // the trees catch (the crown fire runs up them) torch, char and shrink to a stump
    const p1 = gp[1].value, p4 = gp[4].value, p2 = gp[2].value, p0 = gp[0].value;
    for (let i = 0; i < TREES; i++) {
      const si = DEBRIS + i;
      if (!show) { solids.s[si * 4 + 1] = 0; continue; }
      const d = fireN > 0 ? burnAt(trX[i], trZ[i], wind) : -1e3;
      const bb = d / FIRE_W;
      // the stand grows back as the next fire builds
      const regrow = fireCycle < 0.99 ? fireCycle : 1;
      let r, g, bl, canopy, torch = 0;
      // unburnt trees are silhouettes, faintly lit by the front as it nears
      const lt = 0.12 / (1 + d * d / 900) * storm;
      const silR = p4.r * 0.05 + p2.r * 0.02 + p1.r * lt, silG = p4.g * 0.05 + p2.g * 0.02 + p1.g * lt, silB = p4.b * 0.05 + p2.b * 0.02 + p1.b * lt;
      if (bb < -0.6) { r = silR; g = silG; bl = silB; canopy = 1; }
      else {
        const flick = 0.7 + 0.3 * Math.sin(t * 9 + trSd[i] * 30) + 0.2 * pulse;
        const burnI = smooth01((bb + 0.4) / 1.2) * (1 - smooth01((bb - 1.2) / 3.5));
        const ember = Math.exp(-Math.max(0, bb - 1.2) / 6) * 0.35;
        const heat = (burnI * 1.8 + ember) * flick * storm;
        r = silR + p1.r * heat + p0.r * burnI * 0.5 * storm; g = silG + p1.g * heat + p0.g * burnI * 0.5 * storm; bl = silB + p1.b * heat + p0.b * burnI * 0.5 * storm;
        canopy = 1 - 0.75 * smooth01((bb - 0.6) / 2.5);
        // the crown fire: the flash climbs the crown as the front arrives, stands, dies with the char
        torch = smooth01((bb + 0.6) / 0.7) * (1 - smooth01((bb - 1.4) / 1.8)) * storm * 0.99;
      }
      const charred = bb < -0.6 ? 0 : smooth01((bb - 0.6) / 2.5);
      sph(solids, si, trX[i], 0, trZ[i], trH[i] * 0.42 * regrow * (1 - 0.55 * charred), w, 1 + torch, trSd[i]);
      sphC(solids, si, r, g, bl, canopy);
    }
  }

  // --- the sandstorm ---------------------------------------------------------------------
  let wallZ = WALL_FAR, wallH = 0, gustS = 0, gustPush = 0, sandCycle = 1;
  function updateSandstorm(dt, t, w, intensity) {
    const b = build[4];
    gustS = Math.max(0, gustS - dt * 0.8);
    // the wall advances at the intensity's rate; a gust throws it forward; it
    // passes over the eye and a new wall builds far out
    const speed = (8 + 38 * intensity) * b * (1 - calmS) * sandCycle;
    wallZ += dt * speed;
    if (gustPush > 0) { const st = Math.min(gustPush, dt * 55); wallZ += st; gustPush -= st; }
    if (wallZ > 260 && sandCycle > 0.99) sandCycle = 0.98;
    if (sandCycle < 0.99) {
      sandCycle = Math.max(0, sandCycle - dt / 4);
      if (sandCycle <= 0) { wallZ = WALL_FAR; sandCycle = 1; build[4] = 0; }
    }
    const wantH = (60 + 130 * intensity) * b * (1 - 0.5 * calmS) * sandCycle;
    wallH = approach(wallH, wantH, 1.2, dt);
    const near = clamp(1 - (-wallZ - 40) / 320, 0, 1);   // the grit rises as the wall nears, full inside it
    const inside = wallZ > 0 && wallZ < WALL_DEPTH + 80 ? 1 : 0;
    const grit = (near * 0.6 + inside * 0.5 + gustS * 0.4) * (0.6 + 0.4 * swayS) * b * sandCycle * (0.7 + 0.5 * high);
    WU.uSand.value.set(wallZ, wallH, swayS, pressS);
    WU.uSandB.value.set(gustS, b * openS * sandCycle, clamp(grit, 0, 1), intensity);
  }

  // --- the eyes --------------------------------------------------------------------------
  function rig(sys) {
    const x = hx - 0.5, y = hy;
    if (sys === 0) { wantPos.set(x * 60, 6 + y * 12, 0); wantTgt.set(TOR_X + x * 15, 22, TOR_Z); }
    else if (sys === 1) { wantPos.set(HUR_X + x * 600, 1050 + y * 750 - pressS * 300, HUR_Z + 420); wantTgt.set(HUR_X + x * 120, 60, HUR_Z - 60); }
    else if (sys === 2) { wantPos.set(x * 50, 2 + y * 12, 0); wantTgt.set(x * 10, 22, LIT_Z); }
    else if (sys === 3) { wantPos.set(x * 80, 4 + y * 16, 0); wantTgt.set(x * 20, 6, -120); }
    else { wantPos.set(x * 40, 3 + y * 20, 0); wantTgt.set(x * 10, 40, -400); }
  }
  function eye(sys, dt) {
    rig(sys);
    const p = eyePos[sys], tg = eyeTgt[sys];
    if (!eyeInit[sys]) { p.copy(wantPos); tg.copy(wantTgt); eyeInit[sys] = 1; }
    else {
      p.x = approach(p.x, wantPos.x, 0.35, dt); p.y = approach(p.y, wantPos.y, 0.35, dt); p.z = approach(p.z, wantPos.z, 0.35, dt);
      tg.x = approach(tg.x, wantTgt.x, 0.35, dt); tg.y = approach(tg.y, wantTgt.y, 0.35, dt); tg.z = approach(tg.z, wantTgt.z, 0.35, dt);
    }
  }
  function frame(sys, pos, fwd, right, up) {
    lookM.lookAt(eyePos[sys], eyeTgt[sys], upV);
    const e = lookM.elements;
    pos.copy(eyePos[sys]);
    right.set(e[0], e[1], e[2]);
    up.set(e[4], e[5], e[6]);
    fwd.set(-e[8], -e[9], -e[10]);
  }

  function mainEvent() {
    const sys = sysTarget;
    if (sys === 0) tdTarget = tdTarget ? 0 : 1;
    else if (sys === 1) { ercOn = true; erc = 0; }
    else if (sys === 2) strikeAt(2);
    else if (sys === 3) flareUp();
    else { gustS = 1; gustPush = Math.min(90, Math.max(0, 160 - wallZ)); }
  }
  function setSystem(next) {
    sysTarget = clamp(next | 0, 0, SYSTEMS - 1);
  }
  const bloom = { strength: 0, radius: 0.5, threshold: 0.6 };
  const white = new THREE.Color(1, 1, 1);
  let shown = true; // the meshes' visibility the last frame, so hiding is done once

  return {
    objects: [world, solids.mesh, glows.mesh, caps],
    bloom,
    camera,
    get system() { return sysTarget; },
    setSystem,
    mainEvent,
    event(key) {
      if (key === 'strike') strikeAt(sysTarget);
      else if (key === 'touchdown') tdTarget = tdTarget ? 0 : 1;
      else if (key === 'gust') { gustS = 1; gustPush = Math.min(90, Math.max(0, 160 - wallZ)); gustH = 1; }
      else if (key === 'flareUp') flareUp();
      else if (key === 'eyewall') { ercOn = true; erc = 0; }
      else if (key === 'calm') { calmS = 1; tdTarget = 0; }
    },
    update(S, io) {
      const dt = S.dt, t = S.t;
      WU.uWarm.value = S.warm ? 1 : 0;
      // off the weather plates nothing runs: the builds, the flashes and the
      // bolts freeze where they are (a system that has built stays built)
      let anyBolt = false;
      for (let i = 0; i < MAX_BOLTS; i++) if (bAge[i] < bLife[i]) anyBolt = true;
      if (S.weight <= 0.002 && !S.warm) {
        if (shown) { world.visible = false; solids.mesh.visible = false; glows.mesh.visible = false; caps.visible = false; shown = false; }
        bloom.strength = 0;
        return;
      }
      shown = true;
      world.visible = true;
      if (sysTarget !== S.sys) setSystem(S.sys);
      opened = S.opened;
      openS = S.openS;

      // ---- gestures and audio (the Tomb's smoothed values)
      swayS = S.sway;
      pressS = S.press;
      hx = S.hx;
      hy = S.hy;
      bass = S.bass; mid = S.mid; high = S.high; pulse = S.pulse;
      calmS = Math.max(0, calmS - dt / 10);
      const intensity = S.intensity * (1 - calmS);

      // ---- the systems' weights and builds: the one on screen builds once the show is on
      for (let i = 0; i < SYSTEMS; i++) sysW[i] = approach(sysW[i], i === sysTarget ? 1 : 0, SYS_FADE / 3, dt);
      if (opened) build[sysTarget] = approach(build[sysTarget], 1, 1.3, dt);
      let sysB = -1, wb = 0;
      for (let i = 0; i < SYSTEMS; i++) if (i !== sysTarget && sysW[i] > wb) { wb = sysW[i]; sysB = i; }
      const wa = sysW[sysTarget];
      const norm = wa + wb;
      const wA = norm > 1e-6 ? wa / norm : 1, wB = norm > 1e-6 ? wb / norm : 0;

      // ---- the opening: the show starting on a weather plate fires its main event
      if (S.openNow && S.weight > 0.5) mainEvent();

      // ---- the eyes: the system on screen's and the outgoing one's
      eye(sysTarget, dt);
      if (sysB >= 0 && wB > 0.002) eye(sysB, dt);
      frame(sysTarget, WU.uPosA.value, WU.uFwdA.value, WU.uRightA.value, WU.uUpA.value);
      if (sysB >= 0 && wB > 0.002) frame(sysB, WU.uPosB.value, WU.uFwdB.value, WU.uRightB.value, WU.uUpB.value);
      camera.position.copy(eyePos[sysTarget]);
      camera.lookAt(eyeTgt[sysTarget]);
      camera.updateMatrixWorld();
      viewU.value.copy(camera.matrixWorldInverse);
      projU.value.copy(camera.projectionMatrix);

      // ---- the flashes decay (with a flicker)
      for (let i = 0; i < FLASHES; i++) {
        if (flI[i] <= 0 && flAmp[i] <= 0) continue;
        flAge[i] += dt;
        const k = flAge[i] / Math.max(flLife[i], 0.01);
        const flick = 0.6 + 0.4 * Math.sin(flAge[i] * 90 + i * 3);
        const env = flAmp[i] * Math.exp(-k * 3.5) * flick * (k < 1.4 ? 1 : 0);
        flI[i] = Math.max(flI[i] * Math.exp(-dt * 14), env);
        if (flI[i] < 0.003) { flI[i] = 0; flAmp[i] = 0; }
      }

      // ---- the systems (the CPU objects only when their system shows).
      // The palette by ROLE, so the fire is a fire and the sea a sea under any
      // palette: slot 0 (the hot core, the cloud tops, the bolt) is the
      // WARMEST stop lifted to white, 1 (fire and dusk) the WARMEST, 2 (the
      // cool sky, sea and cloud shade) the COOLEST, 3 (the dusk accent and the
      // flash tint) the second warmest, 4 (dust, ash and ground) the second
      // warmest greyed, the Tomb hands the palette sorted cool -> warm in
      // S.order
      const pl = io.palette, ord = S.order;
      // the hot core is the fire's colour pushed to white (the lightest stop
      // could be a cold one, and a blue-white fire is not a fire); the dust is
      // the second warmest stop greyed toward its own luminance (the least
      // saturated stop could be a cold one too, and blue sand is not sand)
      wp[0].value.copy(pl[ord[4]]).lerp(white, 0.55);
      wp[1].value.copy(pl[ord[4]]);
      wp[2].value.copy(pl[ord[0]]);
      wp[3].value.copy(pl[ord[3]]);
      {
        const c = pl[ord[3]];
        const L = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
        wp[4].value.setRGB(c.r + (L - c.r) * 0.45, c.g + (L - c.g) * 0.45, c.b + (L - c.b) * 0.45);
      }
      for (let i = 0; i < 5; i++) gp[i].value.copy(wp[i].value);
      updateTornado(dt, t, sysTarget === 0 ? wA : sysB === 0 ? wB : 0, intensity);
      updateHurricane(dt, t, sysTarget === 1 ? wA : sysB === 1 ? wB : 0, intensity);
      updateLightning(dt, t, sysTarget === 2 ? wA : sysB === 2 ? wB : 0, intensity);
      updateWildfire(dt, t, sysTarget === 3 ? wA : sysB === 3 ? wB : 0, intensity);
      updateSandstorm(dt, t, sysTarget === 4 ? wA : sysB === 4 ? wB : 0, intensity);

      // ---- uniforms and buffers
      let flSum = 0;
      for (let i = 0; i < FLASHES; i++) { flashU[i * 4] = flX[i]; flashU[i * 4 + 1] = flY[i]; flashU[i * 4 + 2] = flZ[i]; flashU[i * 4 + 3] = flI[i]; flSum += flI[i]; }
      WU.uFlashCol.value.copy(wp[0].value).lerp(white, 0.5).lerp(wp[3].value, 0.15);
      CU.uBoltCol.value.copy(wp[2].value).lerp(wp[3].value, 0.3).lerp(white, 0.25);
      WU.uTime.value = t;
      intensityU.value = io.intensity * S.openDim;
      weightU.value = S.warm ? 0 : S.weight;
      WU.uOpen.value = openS;
      WU.uLevel.value = io.level;
      WU.uBreath.value.set(bass, mid, high, pulse);
      WU.uSysA.value = sysTarget;
      WU.uSysB.value = sysB < 0 ? sysTarget : sysB;
      WU.uW.value.set(wA, wB);
      capAP0.needsUpdate = true; capAP1.needsUpdate = true; capAS.needsUpdate = true;
      solids.aPos.needsUpdate = true; solids.aS.needsUpdate = true; solids.aC.needsUpdate = true;
      glows.aPos.needsUpdate = true; glows.aS.needsUpdate = true; glows.aC.needsUpdate = true;
      const showTor = sysTarget === 0 || sysB === 0, showFire = sysTarget === 3 || sysB === 3;
      solids.mesh.visible = (showTor && touched > 0.01) || showFire;
      glows.mesh.visible = showFire;
      anyBolt = false;
      for (let i = 0; i < MAX_BOLTS; i++) if (bAge[i] < bLife[i]) anyBolt = true;
      caps.visible = anyBolt;
      bloomS = Math.max(0.3, bloomS - dt * 2.5);
      bloom.strength = (bloomS + Math.min(flSum, 2) * 0.3 + (sysTarget === 3 ? 0.25 * build[3] : 0)) * S.weight;
    },
    resize(w, h) {
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      WU.uRes.value.set(w, h);
      CU.uRes.value.set(w, h);
    },
    dispose() {
      world.geometry.dispose();
      worldMat.dispose();
      solids.geo.dispose();
      solids.mat.dispose();
      glows.geo.dispose();
      glows.mat.dispose();
      capGeo.dispose();
      capMat.dispose();
    },
  };
}
