// VJ Shader, the five GANTASMO VJ-9000 fragment-shader presets plus its
// eight-material picker, ported into one SwayCommand scene.
//
// ============================ PROVENANCE / LICENSING =========================
// Ported from GANTASMO VJ-9000 (the author's own project), files:
//   src/shader/shaderPresets.ts , the shared raymarch() template, the four
//     distance-field fractals (Mandelbulb / Julia Bulb / Mandelbox / Kaleido
//     IFS), the yotta Menger flythrough, the eight-material branch, the env()
//     analytic sky, the hueShift() Rodrigues rotation and the per-preset
//     parameter tables (min / max / default / audio band / audio amount).
//   src/shader/ShaderRenderer.ts, the uniform feed, the 25 ms / 180 ms audio
//     envelope follower, the 80 ms parameter easing and the wheelOffset drift
//     (BASE_DRIFT 220, AUDIO_GAIN 1700).
// The upstream VJ-9000 repository carries no LICENSE file; it is used here as
// the author's own work. The yotta preset inside it is credited upstream to
// Matthias Hurrle (@atzedent) under MIT, that attribution is retained verbatim
// in the shader body below.
//
// CHANGES MADE IN THIS PORT (full list; see the report notes inline):
//   * GLSL3, as upstream. Every material sets glslVersion: THREE.GLSL3, so the
//     shaders are GLSL ES 3.00 end to end: `in`/`out` stage variables and a
//     declared `out vec4 fragColor` (upstream's `out vec4 O`; `O = ...` is
//     `fragColor = ...`). `#version 300 es` and `precision` are left to the
//     three.js prefix. An earlier pass of this port had rewritten the syntax
//     down to GLSL1 (varyings, gl_FragColor, tanh polyfills, a cpAt(int)
//     selector); that is undone. The NaN guards, the determinism fixes and
//     the loop-invariant hoist that pass added are version-independent and
//     stay, each is listed below with why.
//   * gl_FragCoord / `resolution` are replaced by the interpolated `vUv` of a
//     2x2 clip-space quad plus a precomputed `uAspectScale`. This is exactly
//     equivalent, (FC - 0.5*R)/min(R.x,R.y) == (vUv-0.5) * vec2(max(A,1),
//     max(1/A,1)) and FC/R == vUv, and it makes the frame independent of the
//     engine's device-pixel-ratio scaling of the render target.
//   * yotta's `vec3 cp[14]` global array + initCam() are one `const vec3
//     cp[14] = vec3[14](...)` array constructor. GLSL ES 3.00 has array
//     constructors and dynamic array indexing, so the table is built at
//     compile time instead of once per fragment and camPath() indexes it
//     exactly as upstream. The 14 control points, the `a = 2*0.96, b = 2*a`
//     constants and the Catmull-Rom evaluation are unchanged.
//   * yotta's `for(; i++<maxd;)` march runs inside a constant-bound `for` with
//     the identical `if (i++ >= maxd) break;` test. Kept from the GLSL1 pass:
//     GLSL ES 3.00 accepts the upstream form, but the literal bound hands the
//     compiler a known trip count, and the step count and the final value of
//     `i` are unchanged either way.
//   * yotta's `#define ZERO (time*.0)` loop initialiser stays a literal `0.`.
//     Kept from the GLSL1 pass: the macro is an unroll hint to the compiler,
//     not maths (time*0 is 0), and the Menger fold count is a per-tier literal
//     here anyway. Same math.
//   * tanh() is the native GLSL ES 3.00 builtin again, as upstream. The GLSL1
//     pass's tanh1()/tanh3() exp() polyfills (argument clamped to +/-10) are
//     removed: both call sites feed tanh() values inside [0, ~1.1], ao*ao and
//     a smoothstep()'d colour cubed, so there is nothing to overflow.
//   * Upstream undefined behaviour made deterministic: yotta's `bool near;`,
//     `float dd, i, edge;` are now explicitly zero/false-initialised (drivers
//     zero-init in practice, so this reproduces the observed upstream look),
//     march() gained the missing `return false;` on fall-through, and the stray
//     double semicolon after getao() was removed.
//   * NaN guards (a NaN blanks the whole frame): normalize -> nsafe() via
//     `#define N nsafe`, acos/atan operands pinned off the origin, log/pow
//     bases floored, every division by a derivative/scale/tangent floored, and
//     the Velvet material's rim term clamped (upstream takes pow() of
//     1.0-max(dot(n,-rd),0.), which rounds negative for near-grazing normals
//     and makes pow() undefined). Marked `// GUARD` at each site.
//   * One loop-invariant hoist, bit-identical maths: the Kaleido IFS distance
//     estimator called rot(u_kang) inside its fold loop. u_kang is a uniform,
//     so the matrix is now built once per de() instead of once per iteration.
//     No other expression was reordered or restructured for speed.
//   * Contract deviation, deliberate: SCENE_CONTRACT.md says the compositor
//     owns tone shaping and a scene "does not apply its own limiting or
//     vignetting". Both upstream shaders end with their own gamma (the
//     fractals' pow(col,0.75)) and their own vignette, and those are load-
//     bearing for the look these presets are named after, so they are kept.
//     The compositor's limiter and vignette then apply on top; the result is
//     slightly softer at the frame edge than upstream in isolation.
//   * Quality tiers: march limits and fractal iteration counts scale with
//     ctx.quality.tier (table in createScene). `high` reproduces the upstream
//     counts verbatim; `med` and `low` are reduced. Measured on the brief's
//     reference part, Radeon RX Vega M GL, 1920x1080, one full-screen draw,
//     GPU-synced per frame (a trivial passthrough shader measures 0.45 ms on
//     the same harness, so these are honest fill costs):
//
//       preset        low       med       high (upstream counts)
//       Mandelbulb    11.1 ms   15.0 ms   33.4 ms
//       Julia Bulb    11.0 ms   15.0 ms   25.7 ms
//       Mandelbox      9.4 ms   14.4 ms   39.9 ms
//       Kaleido IFS    8.3 ms   10.9 ms   22.7 ms
//       yotta         12.8 ms   17.0 ms   23.1 ms
//
//     `med` therefore holds 60 fps at 1080p on the reference part at DPR 1,
//     with yotta right on the line at ~59 fps. Three honest caveats:
//       - The reference part is a Radeon RX Vega M GL (~1.8 TFLOP). The weakest
//         integrated GPU SwayCommand targets, an Intel HD 630 (~0.4 TFLOP), is
//         roughly a quarter of that, so `med` lands near 15-20 fps at 1080p
//         there and even `low` does not reach 60. This scene does NOT meet
//         contract hard rule 6 on HD 630-class graphics, and no setting of the
//         march limit fixes it: the per-pixel cost is dominated by transcen-
//         dentals inside the distance estimator (the Mandelbulb spends 2 pow +
//         1 acos + 1 atan + 4 sin/cos on each of ~200 DE iterations per pixel
//         at `med`), so holding 60 fps there would need a march short enough to
//         destroy the solid. Run this scene on discrete or Iris-Xe-class
//         graphics; keep it out of the pool of projects aimed at HD 630.
//       - The engine renders into a target of canvas * DPR (capped 1.75), so a
//         HiDPI display triples the fill and this scene will not hold 60 there.
//       - A crossfade renders two scenes, so a fade into or out of this one
//         costs its own time plus the other scene's.
//     `low` exists for exactly those cases. For scale, the shipped
//     mandelbulb.js measures 5.6 ms and warp.js 2.5 ms at med on the same
//     harness, this scene is the most expensive in the registry, because the
//     upstream template marches every pixel to maxd with no bounding volume
//     and no early-out, and reproducing that was the brief.
//   * Preset ORDER differs from upstream. SHADER_PRESETS lists yotta first,
//     then Mandelbulb / Julia Bulb / Mandelbox / Kaleido IFS. Here the four
//     fractals come first and yotta last, so the four presets that share the
//     eight-material picker occupy pads 0-3 and the one that ignores it sits on
//     pad 4. Consequence: the scene opens on the Mandelbulb, not on yotta.
//     Every preset's own parameters are unchanged by the reordering.
//   * NO AUTONOMOUS ROTATION (project rule: nothing auto-rotates in any
//     scene). The raymarch template's camera orbit advanced by itself,
//     azimuth T*0.2, elevation sin(T*0.15)*0.4. Both terms are removed; the
//     orbit angles are now io.xy alone (azimuth uPan.x*3.0, elevation
//     uPan.y*0.9), so the view holds still until the hand moves it. T still
//     drives everything non-rotational it drove upstream: the surface colour
//     cycling, the glow tint cycle, the Julia constant's c.z oscillation and
//     yotta's forward travel along the Catmull-Rom path (which turns with the
//     corridor but never rolls, dir() keeps world up). The wheelOffset drift
//     that advances T is therefore a scrub of those terms, not a turn.
//   * SwayCommand additions, all additive on top of untouched upstream math:
//     u_hue is driven from io.palette[0]'s hue, the glow accumulator is tinted
//     with a palette colour, io.xy sets the camera orbit angles, press
//     biases the active preset's primary parameter, SWAY is a preset-space
//     morph, every structural parameter carries a per-preset morph vector
//     (swA/swB in the tables below) so the hand glides the solid through
//     distinct pattern families instead of nudging one slot, STRIKE
//     (io.strike on a pad rising edge) kicks the primary parameter, jumps the
//     wheel scrub (a seed jump along the flythrough) and flashes, pads 5-7
//     step to the next preset the way the Quantum Lattice steps geometries,
//     io.knobs[3..6] take direct parameter control and io.knobs[7] is the
//     wheel-drift audioDrive, and a preset/material change fires a short
//     white transition flash.
//     Every one of those inputs contributes ZERO at its documented rest value
//     (knobs 0.5, io.xy 0.5/0.5, gestures 0, no strikes), so with nothing
//     connected the scene sits on the upstream parameter defaults exactly,
//     verified: u_power 8.0000, u_glow 1.0000 after 30 s of idle update()
//     calls. (The camera, per the bullet above, rests at azimuth 0 /
//     elevation 0 instead of drifting.)
// =============================================================================
//
// Pads 0-4 pick the preset (Mandelbulb, Julia Bulb, Mandelbox, Kaleido IFS,
// Yotta); pads 5-7 step to the next preset. Pads 8-15 pick one of the eight
// materials, which (exactly as upstream) apply to the four fractals only;
// yotta ignores u_material. Every pad rising edge is also a STRIKE that
// convulses the active preset's own structure (STRIKE_KICK below).
// One draw call: five ShaderMaterials on one shared 2x2 quad geometry, with
// only the active preset's mesh visible, so three.js compiles a preset's
// program on its first selection and never branches between fractals at
// fragment rate. Follows docs/SCENE_CONTRACT.md; reference style: warp.js.

export const meta = { id: 'vjshader', name: 'VJ Shader', mood: 'kaleidoscopic' };

const PADS = 16;

// --- upstream ShaderRenderer.ts constants, verbatim ---------------------------
const BASE_DRIFT = 220;  // hands-off constant flight, so it never freezes in silence
const AUDIO_GAIN = 1700; // how hard audio energy accelerates the flythrough
const TC_ATTACK = 0.025; // 25 ms envelope attack
const TC_RELEASE = 0.18; // 180 ms envelope release
const TC_PARAM = 0.08;   // 80 ms parameter easing

// --- SwayCommand gesture smoothing, seconds (63 % settle time). The task calls for
//     1.5-2.5 s: structural parameters must drift under the hand, never snap.
const TAU_PRESS = 2.0;  // press -> active preset's PRIMARY parameter
const TAU_SWAY = 2.5;   // sway  -> preset-space morph position (swA/swB tables)
const TAU_PAN = 1.5;    // io.xy -> camera orbit angles (the only thing that turns the view)
const TAU_DRIVE = 0.4;  // knob 7 -> wheel-drift audioDrive (a trim, not a gesture)

const FLASH_TAU = 0.22; // preset / material change flash decay, seconds
const PAD_ARM = 0.25;   // a pad must land at least this hard to register
const PAD_EDGE = 0.06;  // ...and rise at least this much above the last frame

// STRIKE, a pad rising edge, magnitude io.strike (the engine's max pad
// energy). A hit must morph the fractal's own structure, never just spin the
// view: the strike envelope kicks the active preset's PRIMARY parameter, and
// the wheel scrub jumps forward, for yotta a leap down the Menger corridor,
// for the fractals a scrub of every T-driven term in the distance fields. The
// 80 ms parameter easing then turns the kick into a fast structural
// convulsion rather than a snap.
const STRIKE_TAU = 0.30;  // strike envelope decay, seconds
const STRIKE_KICK = 0.30; // primary-parameter kick, fraction of (max-min)
const WHEEL_JUMP = 1400;  // wheel-scrub seed jump per full-velocity strike

// How far the upstream glow tint is pulled toward the engine palette colour.
// The upstream expression (0.5+0.5*cos(vec3(0,1,2)+T+u_high*4.0)) is kept
// intact and simply multiplied by mix(vec3(1), uGlowTint, GLOW_PAL).
const GLOW_PAL = '0.65';

// Audio band selectors for the parameter tables (upstream ShaderAudioBand).
const A_NONE = 0, A_BASS = 1, A_MID = 2, A_HIGH = 3, A_VOL = 4;

// --- the eight global shading styles, upstream SHADER_MATERIALS order ---------
const MATERIALS = ['Neon', 'Chrome', 'Matte', 'Glass', 'Gold', 'Iridescent', 'Velvet', 'Plasma'];

// --- per-preset parameter tables, verbatim from shaderPresets.ts -------------
// { id, min, max, def, audio, amt, swA, swB }, `amt` is the audio depth as a
// fraction of (max-min); upstream's default when a preset omits audioAmt is
// 0.3. `primary` indexes the parameter press and strike bias: the one that
// visibly reshapes the solid. `swA` / `swB` are the preset-space morph vector
// (fractions of the span): sway travels the parameter along
//   swA * sin(pi * sway) + swB * sway
// so the swA lobe peaks mid-travel and the swB ramp owns the far end, the
// sweep visits one pattern family and lands on another, morphing the solid
// BETWEEN families instead of spinning it. Upstream has no such concept; each
// vector is chosen so every stop on the sweep stays inside the upstream
// min/max after the shared clamp, and every vector is zero at sway = 0.
const PRESETS = [
  {
    // sway sweeps u_power 8 -> ~4 (fat low-power lobes) -> 11 (spiky bulb)
    id: 'mandelbulb', name: 'Mandelbulb', primary: 0,
    params: [
      { id: 'u_power', min: 2, max: 12, def: 8, audio: A_BASS, amt: 0.22, swA: -0.55, swB: 0.30 },
      { id: 'u_glow', min: 0, max: 3, def: 1, audio: A_NONE, amt: 0.3, swA: 0.30, swB: 0 },
    ],
  },
  {
    // sway arcs the Julia constant (0.45,0.3) -> (~-0.1,~0.9) -> (-0.65,0.3):
    // a curve through Julia-set space, each stop a different set family. The
    // cy lobe stops short of |c| > 1, where the power-8 set thins to dust.
    id: 'juliabulb', name: 'Julia Bulb', primary: 1,
    params: [
      { id: 'u_power', min: 2, max: 10, def: 8, audio: A_NONE, amt: 0.3, swA: -0.30, swB: 0 },
      { id: 'u_cx', min: -1, max: 1, def: 0.45, audio: A_MID, amt: 0.15, swA: 0, swB: -0.55 },
      { id: 'u_cy', min: -1, max: 1, def: 0.3, audio: A_HIGH, amt: 0.15, swA: 0.30, swB: 0 },
      { id: 'u_glow', min: 0, max: 3, def: 1, audio: A_NONE, amt: 0.3, swA: 0, swB: 0 },
    ],
  },
  {
    // sway sweeps u_scale 2.1 -> ~3.0 (mid) -> 2.82: the box tightens through
    // progressively denser fold families. UP only: the box's bounding radius
    // grows as (scale+1)/(scale-1), so a glide below ~1.6 inflates the solid
    // past the camera at 7.0 and the frame collapses to bare glow (measured).
    id: 'mandelbox', name: 'Mandelbox', primary: 0,
    params: [
      { id: 'u_scale', min: -3, max: 3, def: 2.1, audio: A_NONE, amt: 0.3, swA: 0.10, swB: 0.12 },
      { id: 'u_glow', min: 0, max: 3, def: 1, audio: A_VOL, amt: 0.4, swA: 0.40, swB: 0 },
    ],
  },
  {
    // the kaleidoscope proper: sway lifts the fold angle to ~0.63 mid-travel,
    // then flips it through zero to -0.65 while the fold scale tightens,
    // the wedge pattern re-tiles through visibly different symmetry families
    id: 'kifs', name: 'Kaleido IFS', primary: 1,
    params: [
      { id: 'u_kscale', min: 1.5, max: 2.6, def: 2.0, audio: A_NONE, amt: 0.3, swA: 0.18, swB: -0.30 },
      { id: 'u_kang', min: -1.5, max: 1.5, def: 0.4, audio: A_MID, amt: 0.4, swA: 0.25, swB: -0.35 },
      { id: 'u_glow', min: 0, max: 3, def: 1, audio: A_NONE, amt: 0.3, swA: 0, swB: 0 },
    ],
  },
  {
    // sway rushes the flythrough to ~2.9x mid-travel (the zoom rhythm), eases
    // back to 2x at the top, and drains the warmth toward the cold grade
    id: 'yotta', name: 'Yotta (Cloud Computing)', primary: 0,
    params: [
      { id: 'u_speed', min: 0, max: 4, def: 1, audio: A_NONE, amt: 0.3, swA: 0.35, swB: 0.25 },
      { id: 'u_warmth', min: 0, max: 1, def: 1, audio: A_NONE, amt: 0.3, swA: 0, swB: -0.85 },
    ],
  },
];
// Upstream also exposes a Hue param per preset. Here u_hue is owned by the
// engine palette instead (contract hard rule 1), so it is not in these tables.

// =============================== SHARED GLSL ==================================

// Rodrigues hue rotation in RGB, verbatim from HUE_GLSL in shaderPresets.ts.
const HUE_GLSL =
  'vec3 hueShift(vec3 c, float h){ const vec3 k=vec3(0.57735); float ca=cos(h*6.2831853), sa=sin(h*6.2831853); return c*ca+cross(k,c)*sa+k*dot(k,c)*(1.0-ca); }';

// Analytic sky the eight materials reflect, verbatim from the raymarch()
// template in shaderPresets.ts.
const ENV_GLSL =
  'vec3 env(vec3 d){ float t=d.y*0.5+0.5; vec3 c=mix(vec3(0.03,0.04,0.07),vec3(0.45,0.55,0.75),t); c+=vec3(1.0,0.95,0.85)*pow(max(dot(d,normalize(vec3(0.6,0.7,0.4))),0.0),24.0)*2.0; c+=vec3(0.4,0.5,0.7)*pow(max(dot(d,normalize(vec3(-0.5,0.2,-0.6))),0.0),8.0); return c; }';

// One vertex shader for all five presets: emit the 2x2 plane straight to clip
// space and carry the 0..1 uv, which stands in for gl_FragCoord/resolution.
const VERT = /* glsl */ `
  out vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0); // fullscreen, no matrices
  }`;

/**
 * The shared distance-field raymarch harness from shaderPresets.ts, GLSL ES
 * 3.00 as upstream. The camera orbit, march, normal, eight-material shading,
 * glow, hue, gamma and vignette are reproduced expression for expression; only
 * the declarations above main(), the guards marked GUARD and the two
 * orbit-angle lines differ, the orbit's self-advancing T terms are removed
 * (header CHANGES list), so the view turns only under io.xy.
 */
function raymarchSource(o) {
  return /* glsl */ `
in vec2 vUv;
uniform float time;
uniform vec2  wheel;
uniform vec2  uAspectScale; // (max(A,1), max(1/A,1)); stands in for resolution
uniform vec2  uPan;         // SwayCommand: io.xy, centred, smoothed
uniform float u_bass;
uniform float u_mid;
uniform float u_high;
uniform float u_volume;
uniform float u_hue;
uniform float u_material;
uniform vec3  uGlowTint;    // SwayCommand: palette tint for the glow accumulator
uniform float uFlash;       // SwayCommand: preset / material change flash
uniform float uIntensity;   // SwayCommand: io.intensity
${o.uniforms}
out vec4 fragColor;         // upstream: out vec4 O
#define T (time + wheel.y/1e3)
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
${HUE_GLSL}
${ENV_GLSL}
float de(vec3 p){
${o.de}
}
vec3 nrm(vec3 p){
  vec2 e=vec2(1e-3,0.);
  vec3 gr=vec3(
    de(p+e.xyy)-de(p-e.xyy),
    de(p+e.yxy)-de(p-e.yxy),
    de(p+e.yyx)-de(p-e.yyx));
  float gn=length(gr);
  return gn>1e-12 ? gr/gn : vec3(0.,0.,1.); // GUARD: normalize(vec3(0)) is NaN
}
void main(){
  // Upstream: uv=(gl_FragCoord.xy-0.5*resolution)/min(resolution.x,resolution.y)
  vec2 uv=(vUv-0.5)*uAspectScale;
  vec3 ro=vec3(0.,0.,${o.camDist.toFixed(2)});
  vec3 rd=normalize(vec3(uv,-1.3));
  float a=uPan.x*3.0;   // SwayCommand: io.xy.x sets the azimuth (upstream T*0.2 self-drift removed)
  ro.xz*=rot(a); rd.xz*=rot(a);
  float b=uPan.y*0.9;   // SwayCommand: io.xy.y sets the elevation (upstream sin(T*0.15)*0.4 removed)
  ro.yz*=rot(b); rd.yz*=rot(b);
  float t=0., g=0.;
  vec3 p=ro;
  bool hit=false;
  for(int i=0;i<${o.iters};i++){
    p=ro+rd*t;
    float d=de(p);
    g+=0.015/(1.0+d*d*30.0);
    if(d<1e-3){ hit=true; break; }
    if(t>${o.maxd.toFixed(1)}) break;
    t+=d*0.6;
  }
  vec3 col=vec3(0.);
  if(hit){
    vec3 n=nrm(p);
    vec3 l=normalize(vec3(0.7,0.8,0.6));
    float dif=clamp(dot(n,l),0.,1.);
    float fres=pow(1.0-clamp(dot(n,-rd),0.,1.),3.0);
    vec3 base=${o.color};
    vec3 rf=reflect(rd,n);
    int mat=int(u_material+0.5);
    if(mat==1){ // Chrome -- mirror reflection of the environment
      col=env(rf)*(0.85+0.15*fres)+vec3(pow(max(dot(rf,l),0.),80.0));
    } else if(mat==2){ // Matte -- flat clay, solid albedo, no rainbow
      col=vec3(0.78,0.75,0.72)*(0.12+0.88*dif)+env(n)*0.08;
    } else if(mat==3){ // Glass -- refraction + fresnel reflection + sharp spec
      vec3 rr=refract(rd,n,0.72);
      col=mix(vec3(0.55,0.8,1.0)*env(rr)*1.1, env(rf), clamp(fres+0.1,0.,1.))+vec3(pow(max(dot(rf,l),0.),120.0));
    } else if(mat==4){ // Gold -- gold-tinted metal reflection
      vec3 gd=vec3(1.0,0.76,0.33);
      col=env(rf)*gd+gd*0.08+vec3(1.0,0.9,0.6)*pow(max(dot(rf,l),0.),60.0);
    } else if(mat==5){ // Iridescent -- thin-film shimmer over a reflective base
      vec3 ir=0.5+0.5*cos(6.2831*(fres*3.0+vec3(0.0,0.33,0.67)));
      col=env(rf)*0.25+ir*(0.4+0.5*dif)+ir*fres*1.2;
    } else if(mat==6){ // Velvet -- deep fabric with a retroreflective rim
      // GUARD: n and -rd are both unit, but dot() rounds to just over 1.0, so
      // upstream's 1.0-max(dot,0.) reaches ~-1e-7 and pow(x<0,1.5) is undefined
      // -- one NaN fragment blanks the whole frame. clamp is a no-op in range.
      float rim=pow(clamp(1.0-max(dot(n,-rd),0.),0.,1.),1.5);
      col=vec3(0.45,0.08,0.55)*(0.08+0.4*dif)+vec3(0.45,0.08,0.55)*rim*1.8;
    } else if(mat==7){ // Plasma -- energy field (position palette is the point)
      col=base*0.5+base*pow(fres,1.5)*3.0+base*dif*0.5;
    } else { // Neon -- glowing emissive tube
      vec3 neon=mix(vec3(1.0,0.1,0.6), vec3(0.1,0.85,1.0), 0.5+0.5*n.y);
      col=neon*(0.5+0.4*dif)+neon*fres*2.2;
    }
  }
  // Upstream glow tint kept intact; SwayCommand multiplies it by the palette tint.
  col+=g*(${o.glow})*(0.5+0.5*cos(vec3(0,1,2)+T+u_high*4.0))*mix(vec3(1.0),uGlowTint,${GLOW_PAL});
  col=pow(clamp(col,0.,1.),vec3(0.75));
  vec2 q=vUv;
  col*=0.4+0.6*pow(max(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.0),0.2); // GUARD: pow base
  col=hueShift(col,u_hue);
  col=mix(col,vec3(1.0),clamp(uFlash,0.,1.)*0.35); // SwayCommand transition flash
  fragColor=vec4(col*uIntensity,1.0);
}`;
}

// --- the four distance estimators + colour expressions, verbatim -------------
// Only the GUARD-marked floors are added: the upstream forms divide by r, by a
// derivative and by an accumulated scale, and take log()/pow() of values that
// reach zero at the origin, any of which produces a NaN that blanks the frame.

function mandelbulbSource(iters, deIter) {
  return raymarchSource({
    uniforms: 'uniform float u_power;\nuniform float u_glow;',
    camDist: 2.6, maxd: 14, glow: 'u_glow', iters,
    de: `  vec3 z=p; float dr=1.0, r=0.0;
  for(int i=0;i<${deIter};i++){
    r=length(z); if(r>2.0) break;
    float rs=max(r,1e-9);                                  // GUARD
    vec2 zx=z.xy; if(dot(zx,zx)<1e-18) zx=vec2(1e-9,0.);   // GUARD: atan(0,0)
    float th=acos(clamp(z.z/rs,-1.,1.))*u_power;
    float ph=atan(zx.y,zx.x)*u_power;
    dr=pow(rs,u_power-1.0)*u_power*dr+1.0;
    float zr=pow(rs,u_power);
    z=zr*vec3(sin(th)*cos(ph),sin(th)*sin(ph),cos(th))+p;
  }
  return 0.5*log(max(r,1e-6))*r/max(dr,1e-9);`,             // GUARD on dr
    color: '(0.5+0.5*cos(vec3(0.,0.6,1.0)*6.0+length(p)*2.5+T*0.4))',
  });
}

function juliabulbSource(iters, deIter) {
  return raymarchSource({
    uniforms: 'uniform float u_power;\nuniform float u_cx;\nuniform float u_cy;\nuniform float u_glow;',
    camDist: 2.4, maxd: 12, glow: 'u_glow', iters,
    de: `  vec3 z=p; float dr=1.0, r=0.0;
  vec3 c=vec3(u_cx,u_cy,0.3*sin(T*0.1));
  for(int i=0;i<${deIter};i++){
    r=length(z); if(r>2.0) break;
    float rs=max(r,1e-9);                                  // GUARD
    vec2 zx=z.xy; if(dot(zx,zx)<1e-18) zx=vec2(1e-9,0.);   // GUARD: atan(0,0)
    float th=acos(clamp(z.z/rs,-1.,1.))*u_power;
    float ph=atan(zx.y,zx.x)*u_power;
    dr=pow(rs,u_power-1.0)*u_power*dr+1.0;
    float zr=pow(rs,u_power);
    z=zr*vec3(sin(th)*cos(ph),sin(th)*sin(ph),cos(th))+c;
  }
  return 0.5*log(max(r,1e-6))*r/max(dr,1e-9);`,             // GUARD on dr
    color: '(0.5+0.5*cos(vec3(0.,0.5,1.0)*6.2+length(p)*3.0+u_mid*4.0+T*0.3))',
  });
}

function mandelboxSource(iters, deIter) {
  return raymarchSource({
    uniforms: 'uniform float u_scale;\nuniform float u_glow;',
    camDist: 7.0, maxd: 30, glow: 'u_glow', iters,
    de: `  vec3 z=p; float dr=1.0;
  for(int i=0;i<${deIter};i++){
    z=clamp(z,-1.0,1.0)*2.0-z;
    float r2=dot(z,z);
    if(r2<0.25){ z*=4.0; dr*=4.0; }
    else if(r2<1.0){ z/=r2; dr/=r2; }   // r2 >= 0.25 here, never zero
    z=z*u_scale+p;
    dr=dr*abs(u_scale)+1.0;
  }
  return length(z)/max(abs(dr),1e-9);`,                     // GUARD on dr
    color: '(0.5+0.5*cos(vec3(0.,0.7,1.0)*5.0+p.y*1.5+length(p)*1.2+T*0.25))',
  });
}

function kifsSource(iters, deIter) {
  return raymarchSource({
    uniforms: 'uniform float u_kscale;\nuniform float u_kang;\nuniform float u_glow;',
    camDist: 3.0, maxd: 16, glow: 'u_glow', iters,
    de: `  float s=1.0;
  // PERF: rot(u_kang) is loop-invariant (u_kang is a uniform), so the upstream
  // in-loop rot() call costs ${deIter} cos/sin pairs per de() and de() runs once per
  // march step plus six times in nrm(). Hoisting is bit-identical maths and
  // removes all but one of them; three.js/ANGLE does not reliably LICM it out
  // of an unrolled loop that spans a function call.
  mat2 kr=rot(u_kang);
  for(int i=0;i<${deIter};i++){
    p.xy*=kr;
    if(p.x+p.y<0.0) p.xy=-p.yx;
    if(p.x+p.z<0.0) p.xz=-p.zx;
    if(p.y+p.z<0.0) p.yz=-p.zy;
    p=p*u_kscale-vec3(1.0)*(u_kscale-1.0);
    s*=u_kscale;
  }
  return length(p)/max(abs(s),1e-9)-0.002;`,                // GUARD on s
    color: '(0.5+0.5*cos(vec3(0.,0.4,0.8)*7.0+length(p)*3.5+T*0.5))',
  });
}

/**
 * yotta, the recursive Menger "cloud computing" flythrough.
 *
 *   made by Matthias Hurrle (@atzedent), MIT.
 *
 * Ported from the YOTTA_SOURCE string in shaderPresets.ts. The Catmull-Rom
 * spline through the 14 control points, the 5-iteration Menger fold in map(),
 * the edge detection, AO, lighting, fog, hue bloom, tonemap and vignette are
 * reproduced expression for expression. u_speed / u_warmth / u_hue are the
 * three uniforms VJ-9000 added upstream; u_speed=1, u_warmth=1, u_hue=0
 * reproduce the original @atzedent look. This preset ignores u_material,
 * exactly as upstream.
 */
function yottaSource(near, far, mengerIter) {
  return /* glsl */ `
/*********
* made by Matthias Hurrle (@atzedent)
* MIT -- attribution carried through from VJ-9000's shaderPresets.ts, which
* records this preset's origin as "Source: Matthias Hurrle (@atzedent), MIT."
*/
in vec2 vUv;
uniform float time;
uniform vec2  wheel;
uniform vec2  uAspectScale;
uniform vec2  uPan;
uniform float u_speed;
uniform float u_warmth;
uniform float u_hue;
uniform vec3  uGlowTint;
uniform float uFlash;
uniform float uIntensity;
out vec4 fragColor;   // upstream: out vec4 O
#define T (time+wheel.y/1e3)
#define S smoothstep
#define EDGESIZE 42e-4
#define hue(a) (.5+.5*sin(3.14*(a)+vec3(1,2,3)))
const vec3 LP = vec3(-2,8,-2);   // upstream #define LP, hoisted to a const
// GUARD: every upstream normalize() routes through here, normalize(vec3(0))
// is NaN and a single NaN fragment blanks the frame.
vec3 nsafe(vec3 v){ float l=length(v); return l>1e-9 ? v/l : vec3(0.,0.,1.); }
#define N nsafe
${HUE_GLSL}
// The 14 camera control points, verbatim (a = 2*.96, b = 2*a). Upstream fills
// a global vec3 cp[14] from initCam() once per fragment; GLSL ES 3.00 has
// array constructors, so the same table is one const array built at compile
// time and indexed directly (dynamic indexing is legal in ES 3.00).
const float CPA = 2.*.96;
const float CPB = 2.*CPA;
const vec3 cp[14] = vec3[14](
	vec3(0.),
	vec3(0.,0.,CPB),
	vec3(CPA,0.,CPB),
	vec3(CPA,0.,CPA),
	vec3(CPA,-CPA*1.2,CPA),
	vec3(-CPA,-CPA,CPA),
	vec3(-CPA,0.,CPA),
	vec3(-CPA,0.,0.),
	vec3(0.),
	vec3(0.,0.,-CPB),
	vec3(0.,CPA,-CPB),
	vec3(-CPA,CPA,-CPB),
	vec3(-CPA,0.,-CPB),
	vec3(-CPA,0.,0.)
);
vec3 catmull(vec3 a, vec3 b, vec3 c, vec3 d, float t){
	return (((-a+b*3.-c*3.+d)*t*t*t + (a*2.- b*5.+c*4.-d)*t*t + (-a+c)*t + b*2.)*.5);
}
vec3 camPath(float t){
	const int n=14;
	const float k=float(n);
	t=fract(t/k)*k;
	float sn=floor(t), st=t-sn;
	if (sn==.0) return catmull(cp[n-1], cp[0], cp[1], cp[2], st);
	for (int i=1; i<n-2; i++) {
		if (sn==float(i)) return catmull(cp[i-1], cp[i], cp[i+1], cp[i+2], st);
	}
	if (sn==k-2.) return catmull(cp[n-3], cp[n-2], cp[n-1], cp[0], st);
	if (sn==k-1.) return catmull(cp[n-2], cp[n-1], cp[0], cp[1], st);
	return vec3(0.);
}
float rnd(vec3 p) {
	p=fract(p*vec3(12.9898,78.233,156.345));
	p+=dot(p,p+34.56);
	return fract(p.x*p.y*p.z);
}
float smin(float a, float b, float k) {
	float k2=k*log(2.);
	float x=b-a;
	// GUARD: at x == 0 the upstream denominator is exactly 0. The analytic
	// limit of a + x/(1-exp2(x/k2)) as x -> 0 is a - k2/ln2 == a - k.
	float den=1.-exp2(clamp(x/k2,-60.,60.));
	if (abs(den)<1e-6) return a-k;
	return a+x/den;
}
float box(vec3 p, float s) {
	p=abs(p)-s;
	return length(max(p,.0))+min(.0,max(max(p.x,p.y),p.z));
}
float map(vec3 p) {
	float e=length(vec2(fract(p.z)-.5,p.y-1.))-.1;
	p.xz=mod(p.xz+1.,2.)-1.;
	float d=box(p,1.), f=1.;
	for(float i=0.; i<${mengerIter}.; i++) {   // upstream ZERO initialiser -> literal 0. (unroll hint, not maths)
		vec3 a=mod(p*f,2.)-1., r=abs(1.-3.*abs(a));
		f*=2.25;
		float
		da=max(r.x,r.y),
		db=max(r.y,r.z),
		dc=max(r.z,r.x);
		d=max(d,(min(da,min(db,dc))-1.)/f);
	}
	return smin(d,e,1e-2)+2e-3;
}
vec3 norm(vec3 p) {
	float h=1e-3; vec2 k=vec2(-1,1);
	return N(
		k.xyy*map(p+k.xyy*h)+
		k.yxy*map(p+k.yxy*h)+
		k.yyx*map(p+k.yyx*h)+
		k.xxx*map(p+k.xxx*h)
	);
}
// Upstream: bool march(inout vec3 p, vec3 rd, out float dd, out float edge,
// out float i) with a 'for (; i++<maxd;)' march. Reading an 'out' parameter
// before writing it is undefined in every GLSL version, so dd/edge/i are
// 'inout', zero-initialised at the call site; and the identical 'i++ >= maxd'
// test lives inside a constant-bound loop -- GLSL ES 3.00 would take the
// upstream form, the literal bound just hands the compiler a known trip
// count. Step count and the final value of i are unchanged.
bool march(inout vec3 p, vec3 rd, inout float dd, inout float edge, inout float i) {
	bool near=false;
	float maxd=abs(p.y)>1.?${near}.:${far}.;
	for (int j=0; j<${far}; j++) {
		if (i++>=maxd) break;
		float d=map(p);
		if (abs(d)<1e-3) return true;
		if (d>100.) return false;
		if (near && d>EDGESIZE) edge=1.;
		if (d<EDGESIZE) near=true;
		p+=rd*d*.5;
		dd*=d*.5;
	}
	return false;   // upstream falls off the end of the function (undefined)
}
float calcAO(vec3 p, vec3 n) {
	float occ=.0, sca=1.;
	for (float i=.0; i<5.; i++) {
		float
		h=.01+i*.05,
		d=map(p+h*n);
		occ+=(h-d)*sca;
		sca*=.95;
		if (occ>.35) break;
	}
	return clamp(1.-3.*occ,.0,1.);
}
float getao(vec3 p, vec3 n, float dist) {
	return clamp(map(p+n*dist)/dist,.0,1.);   // dist is +/-EDGESIZE, never 0
}
vec3 dir(vec2 uv, vec3 ro, vec3 t, float z) {
	vec3 up=vec3(0,1,0),
	f=N(t-ro),
	r=N(cross(up,f)),
	u=cross(f,r),
	c=f*z,
	i=c+uv.x*r+uv.y*u,
	d=N(i);
	return d;
}
vec3 render(vec2 uv) {
	float speed=T*.25*u_speed;
	vec3 col=vec3(0),
	p=camPath(-speed+.5), ro=p,
	ta=camPath(-speed),
	rd=dir(uv,p,ta,.6);
	float dd=.0, i=.0, edge=.0;   // upstream leaves these uninitialised
	if (march(p,rd,dd,edge,i)) {
		float x=mix(.8,1.,rnd(p)), lf=S(80.,30.,length(p.z));
		vec3 n=norm(p)*x, lp=vec3(LP.x,LP.y+lf,LP.z), l=N(lp-p);
		float ao=calcAO(p,n), amb=.8+.2*n.y, ld=distance(lp,p),
		ldd=distance(ro,p), dif=clamp(dot(l,n),.0,1.),
		atten=1./(1.+ldd*.5+ldd*ldd*.25);
		if (abs(p.y)<.992) {
			ao*=(n.y*.5+.55);
			col+=S(-.1,1.,amb*ao)+dif*ao*atten;
			col+=atten*pow(clamp(dot(N(ro-p),n),.0,1.),.8);
		} else col+=dif*ao;
		col+=clamp(dot(-rd,l),.0,1.)*ao*atten;
		col*=vec3(1,.65,.5)+.3*amb*ao*atten;
		col*=tanh(ao*ao);
		float fog=1.-clamp(dd/200.,.0,1.), eo=getao(p,n,EDGESIZE);
		if(eo<.9) edge=max(edge,max(1.,fog));
		eo=getao(p,n,-EDGESIZE);
		if(eo<.9) edge=max(edge,max(1.,fog));
		float fres=pow(clamp(1.+dot(rd,n),.0,1.),5.);
		col*=S(2.,.0,edge)*(1.-fres);
		vec3 dp=abs(p-ro);
		// GUARD: upstream .3/tan(length(dp)) hits +/-inf at every multiple of
		// pi, and fract(inf) is NaN. Floor the tangent at 1e-3, keeping sign.
		float tl=tan(length(dp));
		float ts=tl<.0?-1.:1.;
		float ll=.3/(ts*max(abs(tl),1e-3))+T;
		dp=(.5+.5*cos(.78*T-vec3(0,-2,3)*fract(ll)-.5));
		dp=p.y>1.01?vec3(1):.02/max(dp.bgg,vec3(1e-3));   // GUARD: /0 -> inf
		col=mix(col,fres*dp,S(.5,3.,edge));
		col=S(-.5,2.,col);
	}
	float k=max(.3,1.-distance(LP,ro));
	// SwayCommand: the one bloom term yotta has is tinted with the engine palette,
	// mirroring what the glow accumulator gets in the four fractal presets.
	col+=hue(k*k*1.57+1.5)*k*.6*mix(vec3(1.),uGlowTint,${GLOW_PAL});
	col=mix(col,vec3(1,.95,.9),S(.0,15.,distance(p,ro)));
	col+=S(-1.,2.,clamp(i/300.,.0,1.))*k*vec3(1,.65,.5);
	col=S(-.2,.8,col*1.2);
	col=tanh(col*col*col);
	col=sqrt(max(col,.0));                        // GUARD: sqrt of negative
	vec2 c=vUv;                                   // upstream: FC/R
	c*=1.-c.yx;
	float vig=c.x*c.y*25.;
	vig=pow(max(vig,.0),.25);                     // GUARD: pow base
	col*=vig;
	col=mix(col,col*col,S(1.,-1.,clamp(vig,.0,1.)));
	return col*mix(vec3(.95,.97,1.),vec3(1,.85,.65),u_warmth);
}
void main() {
	// Upstream: uv=(FC-.5*R)/MN. uPan is the SwayCommand io.xy look-around.
	vec2 uv=(vUv-0.5)*uAspectScale+uPan*0.35;
	vec3 col=render(uv);
	col=hueShift(col,u_hue);
	col=mix(col,vec3(1.0),clamp(uFlash,0.,1.)*0.35); // SwayCommand transition flash
	fragColor=vec4(col*uIntensity,1.);
}`;
}

// ================================ HELPERS =====================================

function clamp01(n) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

// Exponential approach with an explicit time constant; frame-rate independent.
function approach(cur, target, tau, dt) {
  return cur + (target - cur) * (1 - Math.exp(-dt / tau));
}

// Knob -> parameter base. Piecewise linear through the upstream default, so a
// knob resting at its 0.5 default reproduces the upstream value exactly while
// still giving the full min..max travel.
function knobBase(k, min, max, def) {
  return k < 0.5 ? min + (def - min) * (k * 2) : def + (max - def) * ((k - 0.5) * 2);
}

// =============================== THE SCENE ====================================

export function createScene(ctx) {
  const { THREE, quality } = ctx;
  const scene = new THREE.Scene();
  // fullscreen quad: the vertex shader emits clip-space directly, so the
  // camera is only here to satisfy the contract shape
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // --- quality ladder. Every loop bound is a literal in the generated source,
  //     so the shader compiler sees an unrollable constant count.
  //
  //     Upstream targets discrete GPUs at 1280x720 with one shared 140-step
  //     march for all four fractals and the full DE iteration counts. SwayCommand
  //     targets 1080p on integrated graphics, and the engine renders into a
  //     target of canvas * devicePixelRatio (capped 1.75), doubled during a
  //     crossfade.
  //
  //     Measured on the brief's reference part (Radeon RX Vega M GL, 1920x1080,
  //     one full-screen draw): cost is essentially linear in the march limit at
  //     ~0.46 ms per step, and the eight-material branch, being uniform across
  //     the frame, costs nothing measurable (36x5 with the whole chain: 15.97
  //     ms; with the chain collapsed to the Neon branch: 16.20 ms). So the
  //     march limit is the only lever, and it is set PER PRESET: upstream uses
  //     one number for all four, but their per-step costs differ by ~2x, and
  //     the Mandelbox marches 30 units where the Julia marches 12.
  //
  //     A visual ladder of 24/32/44/60/84/140 steps on the Mandelbulb shows the
  //     solid breaking into disconnected islands below ~32, reading as a
  //     complete (if lacy-edged) fractal from ~36, closing up fully at ~56-60,
  //     and barely changing from 84 to 140. `med` is set just above the point
  //     where the solid holds together, which is also where the measured cost
  //     lands under 16.7 ms; `high` is upstream verbatim.
  //
  //       preset       high (upstream)    med            low
  //       Mandelbulb   140 x 8 iter       34 x 5         26 x 4
  //       Julia Bulb   140 x 10           32 x 6         24 x 5
  //       Mandelbox    140 x 12           32 x 6         24 x 5
  //       Kaleido IFS  140 x 12           44 x 7         32 x 6
  //       yotta        130/300, fold 5    36/56, fold 5  24/40, fold 4
  //
  //     Fewer DE iterations smooth the finest filigree, the shape is the same,
  //     the detail floor is coarser. A shorter march dims the glow accumulator
  //     (it integrates one term per step) and lets the silhouette go lacy.
  const tier = quality.tier;
  const T3 = (h, m, l) => (tier === 'high' ? h : tier === 'low' ? l : m);
  const M_BULB = T3(140, 34, 26);
  const M_JULIA = T3(140, 32, 24);
  const M_BOX = T3(140, 32, 24);
  const M_KIFS = T3(140, 44, 32);
  const IT_BULB = T3(8, 5, 4);     // upstream 8
  const IT_JULIA = T3(10, 6, 5);   // upstream 10
  const IT_BOX = T3(12, 6, 5);     // upstream 12
  const IT_KIFS = T3(12, 7, 6);    // upstream 12
  // yotta is the most expensive preset: map() runs a Menger fold per march
  // step, and norm() + calcAO() + two getao() calls add eleven more map()
  // evaluations on every hit. Upstream marches up to 130 steps when the camera
  // starts outside the corridor (|p.y| > 1) and up to 800 inside it. Even at
  // `high` the 800 is cut to 300, no ray in this flythrough was observed to
  // need more. The Menger fold count is held at the upstream 5 for `high` and
  // `med`, because it is the one number that changes the geometry rather than
  // how far down the corridor you can see; `low` accepts fold 4 as the price
  // of running at all. Measured against the 300-step fold-5 build over three
  // points on the camera path, the `med` build differs by 0.0 / 5.5 / 8.0 out
  // of 255 on average, zero on the frames that fit inside 56 steps, and a
  // visible but modest loss of distant corridor detail on the frames that do
  // not. Raising `med` to 110 steps takes that to 0.0 / 0.7 / 1.0 but costs
  // 20.1 ms, which is over the 60 fps budget.
  //
  // Knock-on the march limit has on one upstream constant, called out because
  // it is the only place a reduced tier changes an expression's RANGE rather
  // than its detail: render() ends with an amber depth bloom weighted by
  // S(-1., 2., clamp(i/300., 0., 1.)) where `i` is the final march step count.
  // The 300 is upstream's and is kept verbatim, but upstream's `i` runs to 800,
  // so the term saturates for deep rays, while at `med` it can only ever reach
  // 56/300 = 0.19 and at `low` 40/300 = 0.13. The bloom therefore sits close to
  // constant on the reduced tiers instead of brightening down the corridor.
  // Changing 300 to track Y_FAR would restore the gradient but would be a
  // silent edit to an upstream constant, so it is documented, not applied.
  const Y_NEAR = T3(130, 36, 24);  // upstream 130
  const Y_FAR = T3(300, 56, 40);   // upstream 800
  const Y_MENGER = T3(5, 5, 4);    // upstream 5

  // --- uniform holders. One object per uniform NAME, shared by reference
  //     across every material that declares it, so update() writes each value
  //     once. Per-material `uniforms` maps are distinct (three.js keeps its own
  //     per-program bookkeeping), the holders inside them are not.
  const U = {
    time: { value: 0 },
    wheel: { value: new THREE.Vector2(0, 0) }, // .y is the drifting wheelOffset
    uAspectScale: { value: new THREE.Vector2(1, 1) },
    uPan: { value: new THREE.Vector2(0, 0) },
    u_bass: { value: 0 },
    u_mid: { value: 0 },
    u_high: { value: 0 },
    u_volume: { value: 0 },
    u_hue: { value: 0 },
    u_material: { value: 0 },
    u_power: { value: 8 },
    u_cx: { value: 0.45 },
    u_cy: { value: 0.3 },
    u_scale: { value: 2.1 },
    u_kscale: { value: 2.0 },
    u_kang: { value: 0.4 },
    u_glow: { value: 1 },
    u_speed: { value: 1 },
    u_warmth: { value: 1 },
    uGlowTint: { value: new THREE.Color(1, 1, 1) },
    uFlash: { value: 0 },
    uIntensity: { value: 1 },
  };

  const COMMON = ['time', 'wheel', 'uAspectScale', 'uPan', 'u_hue', 'uGlowTint', 'uFlash', 'uIntensity'];
  const FRACTAL = COMMON.concat(['u_bass', 'u_mid', 'u_high', 'u_volume', 'u_material']);

  // Build a fresh uniforms map holding shared holder objects.
  function pick(names, extra) {
    const o = {};
    for (let i = 0; i < names.length; i++) o[names[i]] = U[names[i]];
    for (let i = 0; i < extra.length; i++) o[extra[i]] = U[extra[i]];
    return o;
  }

  const geo = new THREE.PlaneGeometry(2, 2);

  const sources = [
    mandelbulbSource(M_BULB, IT_BULB),
    juliabulbSource(M_JULIA, IT_JULIA),
    mandelboxSource(M_BOX, IT_BOX),
    kifsSource(M_KIFS, IT_KIFS),
    yottaSource(Y_NEAR, Y_FAR, Y_MENGER),
  ];
  const uniformSets = [
    pick(FRACTAL, ['u_power', 'u_glow']),
    pick(FRACTAL, ['u_power', 'u_cx', 'u_cy', 'u_glow']),
    pick(FRACTAL, ['u_scale', 'u_glow']),
    pick(FRACTAL, ['u_kscale', 'u_kang', 'u_glow']),
    pick(COMMON, ['u_speed', 'u_warmth']),
  ];

  // One material and one mesh per preset, all sharing the single quad geometry.
  // Only the active mesh is visible, so three.js compiles a preset's program
  // the first time it is selected and the fragment shader never carries a
  // fractal-selection branch.
  const materials = [];
  const meshes = [];
  for (let i = 0; i < sources.length; i++) {
    const m = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      depthTest: false,
      depthWrite: false,
      uniforms: uniformSets[i],
      vertexShader: VERT,
      fragmentShader: sources[i],
    });
    const q = new THREE.Mesh(geo, m);
    q.frustumCulled = false; // clip-space quad, skip culling
    q.visible = i === 0;
    scene.add(q);
    materials.push(m);
    meshes.push(q);
  }

  // --- preallocated CPU state; update() allocates nothing --------------------
  let preset = 0;
  let material = 0;

  // Upstream envelope followers (25 ms attack / 180 ms release).
  let smBass = 0, smMid = 0, smHigh = 0, smVol = 0;
  // Upstream camera-scrub accumulator.
  let wheelOffset = 0;
  let audioDrive = 1;
  // Heavily smoothed gestures.
  let pressSm = 0;
  let swaySm = 0;   // rest value, matching io.gestures.sway's documented initial 0
  let panX = 0, panY = 0;
  // Preset / material change flash.
  let flash = 0;
  // Strike envelope: pad hits convulse the active preset's structure.
  let strikeEnv = 0;

  // Eased parameter values, one array per preset (upstream keys its `cur` cache
  // by parameter id alone, so u_glow carries across presets; here each preset
  // keeps its own state and resumes exactly where it was left).
  const curValues = [];
  for (let i = 0; i < PRESETS.length; i++) {
    const ps = PRESETS[i].params;
    const arr = new Float32Array(ps.length);
    for (let j = 0; j < ps.length; j++) arr[j] = ps[j].def;
    curValues.push(arr);
  }

  const prevPads = new Float32Array(PADS); // rising-edge memory
  const hsl = { h: 0, s: 0, l: 0 };        // scratch for Color.getHSL

  const api = {
    scene,
    camera,
    // Plain string properties naming the live preset and material. Extra
    // members on the returned object are outside the contract's required set
    // but conflict with none of them; update() keeps them current.
    presetName: PRESETS[0].name,
    materialName: MATERIALS[0],
    update(dt, t, io) {
      // ---- event decay, before this frame's edges can re-arm it
      flash *= Math.exp(-dt / FLASH_TAU);
      strikeEnv *= Math.exp(-dt / STRIKE_TAU);

      // ---- pads: 0-4 pick the preset, 5-7 step to the next one (the Quantum
      //      Lattice convention), 8-15 pick the material. Rising edges only,
      //      measured against the preallocated previous-pad array. EVERY edge
      //      is also a STRIKE that morphs the preset's own generative state.
      let padPreset = -1;
      let padMaterial = -1;
      let struck = false;
      for (let i = 0; i < PADS; i++) {
        const v = io.pads[i];
        if (v > PAD_ARM && v > prevPads[i] + PAD_EDGE) {
          struck = true;
          if (i < PRESETS.length) padPreset = i;
          else if (i >= 8) padMaterial = i - 8;
          else padPreset = (preset + 1) % PRESETS.length; // pads 5-7 step
        }
        prevPads[i] = v;
      }
      if (struck) {
        // io.strike is the engine's max pad energy this frame, on the edge
        // frame, the hit velocity. The envelope kicks the primary parameter
        // (param loop below); the wheel jump scrubs every T-driven term of
        // the distance fields, for yotta, a leap down the Menger corridor.
        const s = clamp01(io.strike);
        strikeEnv = Math.max(strikeEnv, s);
        wheelOffset += WHEEL_JUMP * s;
        flash = Math.max(flash, s * 0.5);
      }
      if (padPreset >= 0 && padPreset !== preset) {
        meshes[preset].visible = false;
        preset = padPreset;
        meshes[preset].visible = true;
        api.presetName = PRESETS[preset].name; // closure, not `this`
        flash = 1;
      }
      if (padMaterial >= 0 && padMaterial !== material) {
        material = padMaterial;
        api.materialName = MATERIALS[material];
        flash = 1;
      }

      // ---- audio envelopes, verbatim from ShaderRenderer.loop: fast attack so
      //      transients punch, slow release so the decay never jitters.
      const tcUp = 1 - Math.exp(-dt / TC_ATTACK);
      const tcDn = 1 - Math.exp(-dt / TC_RELEASE);
      const rb = clamp01(io.bands.bass);
      const rm = clamp01(io.bands.mid);
      const rh = clamp01(io.bands.high);
      const rv = clamp01(io.level); // SwayCommand io.level is upstream `volume`
      smBass += (rb - smBass) * (rb > smBass ? tcUp : tcDn);
      smMid += (rm - smMid) * (rm > smMid ? tcUp : tcDn);
      smHigh += (rh - smHigh) * (rh > smHigh ? tcUp : tcDn);
      smVol += (rv - smVol) * (rv > smVol ? tcUp : tcDn);

      // ---- wheelOffset drift, verbatim. yotta declares no audio uniforms at
      //      all, so this camera-scrub acceleration is the only thing that
      //      makes it react; the four fractals read it through T as well.
      //      knob 7 is the audioDrive trim (0.5 -> the upstream default of 1).
      audioDrive = approach(audioDrive, io.knobs[7] * 2, TAU_DRIVE, dt);
      const energy = clamp01(smVol * 0.7 + smBass * 0.5);
      wheelOffset += dt * (BASE_DRIFT + energy * AUDIO_GAIN * audioDrive);

      // ---- gestures, heavily smoothed: structure drifts, it never snaps
      pressSm = approach(pressSm, io.gestures.press, TAU_PRESS, dt);
      swaySm = approach(swaySm, clamp01(io.gestures.sway), TAU_SWAY, dt);
      panX = approach(panX, io.xy.x - 0.5, TAU_PAN, dt);
      panY = approach(panY, io.xy.y - 0.5, TAU_PAN, dt);

      // ---- editable params: the upstream easing law, with the SwayCommand knob
      //      and gesture biases folded into `base` before the same clamp.
      //        target = clamp(base + (max-min)*amt*level, min, max)
      //      eased with an 80 ms time constant.
      const tcPar = 1 - Math.exp(-dt / TC_PARAM);
      // Preset-space morph position: the swA lobe peaks mid-travel, the swB
      // ramp owns the far end (table above), so the sweep visits one pattern
      // family and lands on another.
      const swayLobe = Math.sin(Math.PI * swaySm);
      const ps = PRESETS[preset];
      const params = ps.params;
      const cur = curValues[preset];
      for (let i = 0; i < params.length; i++) {
        const pm = params[i];
        const band = pm.audio;
        const level = band === A_BASS ? smBass
          : band === A_MID ? smMid
            : band === A_HIGH ? smHigh
              : band === A_VOL ? smVol : 0;
        const span = pm.max - pm.min;
        // knobs 3..6 take direct control of parameter slots 0..3
        let base = i < 4 ? knobBase(io.knobs[3 + i], pm.min, pm.max, pm.def) : pm.def;
        // Press and strike bias the primary parameter; sway morphs EVERY
        // parameter along its swA/swB vector, the preset-space morph, so the
        // hand reshapes the distance field itself (power, Julia constant, box
        // scale, fold angle) and never just spins the view. All three inputs
        // are read unipolar, so all contribute exactly zero bias at rest:
        // `press` and `sway` are documented as 0..1 with an INITIAL VALUE OF 0
        // (docs/MIDI.md, createControlState), not 0.5. Reading sway bipolar as
        // (sway-0.5)*2, the convention the orbit-angle scenes use, where a
        // constant offset only rotates the view, would rest at -1 here and
        // park every morphed parameter well off its upstream default whenever
        // no Sway hardware is connected, defeating knobBase()'s whole point of
        // reproducing the upstream value at the knob default.
        if (i === ps.primary) base += span * (0.35 * pressSm + STRIKE_KICK * strikeEnv);
        base += span * (pm.swA * swayLobe + pm.swB * swaySm);
        let target = base + span * pm.amt * level;
        target = target < pm.min ? pm.min : target > pm.max ? pm.max : target;
        cur[i] += (target - cur[i]) * tcPar;
        U[pm.id].value = cur[i];
      }

      // ---- palette. Hard rule 1: colour derives from io.palette. Upstream
      //      colour is intrinsic to each preset, so the palette enters through
      //      the two places the preset maths leaves open: u_hue (the final
      //      Rodrigues rotation) takes the hue of palette[0], and the glow
      //      accumulator is tinted with palette[4]. Knob 0's engine-side hue
      //      rotation therefore spins the whole fractal colour wheel.
      io.palette[0].getHSL(hsl);
      U.u_hue.value = hsl.h;
      const tint = U.uGlowTint.value;
      tint.copy(io.palette[4]);
      tint.getHSL(hsl);
      // lift the accent to a constant lightness so a dark palette slot cannot
      // extinguish the glow term it multiplies
      tint.setHSL(hsl.h, Math.min(1, hsl.s * 1.15), 0.62);

      U.time.value = t;
      U.wheel.value.y = wheelOffset;
      U.uPan.value.set(panX, panY);
      U.u_bass.value = smBass;
      U.u_mid.value = smMid;
      U.u_high.value = smHigh;
      U.u_volume.value = smVol;
      U.u_material.value = material;
      U.uFlash.value = flash;
      U.uIntensity.value = io.intensity;
    },
    resize(w, h) {
      // (FC - 0.5*R)/min(R.x,R.y) == (vUv - 0.5) * vec2(max(A,1), max(1/A,1))
      const aspect = w / Math.max(1, h);
      U.uAspectScale.value.set(
        Math.max(aspect, 1),
        Math.max(1 / Math.max(aspect, 1e-6), 1),
      );
    },
    dispose() {
      geo.dispose();
      for (let i = 0; i < materials.length; i++) materials[i].dispose();
    },
  };

  api.resize(ctx.width, ctx.height);
  return api;
}
