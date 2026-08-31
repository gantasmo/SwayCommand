// ─────────────────────────────────────────────────────────────────────────────
// EFFECTS RACK, a GPU post-processing chain reproducing the GANTASMO VJ-9000
// effect decks (GEOMETRICS / CORRUPTION / CHROMATICS / TIMECODE / ASCII).
//
// PORTED FROM, GANTASMO VJ-9000, the three.js/WebGL VJ engine that ships inside
// the author's own prior project theDAW (https://github.com/gantasmo/theDAW),
// which this repository records as MIT-licensed in README.md ("theDAW by
// GANTASMO (MIT)") and docs/RESEARCH.md. Reused here by the same author under
// those MIT terms; SwayCommand is itself MIT (package.json). Files drawn on:
//   • src/components/VideoOutput.tsx  , the whole 2D-canvas effect pipeline:
//       feedback wash, tiling/kaleidoscope/mirror, softEdges gradients, the
//       radial-spoke wheel, pixelate downscale, glitch slice tearing, rgbGhost
//       screen smear, strobe, echo trails, posterize-time frame hold, backskip
//       ring, the bass sweetening block, the CSS filter chain (hue/sat/contrast/
//       brightness/invert/sepia/grayscale/blur) and the SVG filters it appends
//       (feConvolveMatrix edge, feTurbulence+feDisplacementMap wave warp,
//       feOffset+feBlend rgb split), plus the scanline / CRT / vignette overlays.
//   • src/asciiline/AsciilineRenderer.ts, the ASCII pass: the 93-char ramp,
//       the baked glyph atlas, the cell/atlas sampling shader, mono/accent
//       modes and the audio ink term. (That file is itself a port of ASCILINE
//       by YusufB5, distributed under an MIT-style permission grant carrying an
//       ADDED USE RESTRICTION, it is therefore NOT plain MIT: this code must
//       not be used to render advertising. That restriction travels with this
//       file and binds anyone who reuses it. Attribution: YusufB5/ASCILINE.)
//   • src/pluginRegistry.ts, src/components/VJControls.tsx, src/types.ts
//      , effect ids, neutral values, control ranges and DEFAULT_VJ_STATE.
//
// SUMMARY OF CHANGES (full detail in the per-effect comments below):
//   1. 2D canvas -> GPU. Every per-pixel canvas op became a fragment-shader
//      stage; forward canvas transforms (rotate/scale/clip/drawImage) became
//      inverse UV maps. The maths and constants are reproduced verbatim.
//   2. GLSL route: GLSL3 (GLSL ES 3.00, `glslVersion: THREE.GLSL3` on every
//      material). The upstream ASCII shader was already `#version 300 es`; it
//      keeps `texture()` and its own fragment output (`out vec4 O` -> `out vec4
//      fragColor`), and `gl_FragCoord.xy/u_resolution` -> an `in vec2 vUv`. No
//      array constructors were needed.
//   3. Pass folding. All the cheap per-pixel work lives in four mega-shaders
//      (geometry+feedback, corruption, the colour grade+blur, and optics+
//      overlays) with uniform toggles. Only trails/feedback (persistent
//      targets) and ASCII (glyph atlas) get passes of their own, and every
//      optional pass is skipped when neutral. The grade is split off from
//      optics purely for cost, see PASS SPLIT at FRAG_GRADE.
//   4. Frame-history effects are the one place cost forced a real deviation:
//      upstream keeps a 60-frame full-resolution ring of canvases. Echo trails
//      became an exponential accumulator (same operator, see ECHO TRAILS) and
//      backskip a short tier-scaled ring. Both are called out at their sites.
//   5. Additions for SwayCommand, all marked `// [SwayCommand]`: io.beat/io.gestures.pulse
//      as extra strobe triggers, an optional palette-driven ASCII accent, an
//      optional radial mode for the chromatic-aberration offset, and the
//      audio-sweetening ARM GATE, upstream lets bass push glitch/ghost/split/
//      warp up from a fader parked at zero, which "autoplays" a deck the VJ has
//      switched off; here each push is gated on its own fader being > 0. The
//      push VALUE is upstream's (see the render() block); only the gate is new.
//      Two rack-native effects are additions outright (no upstream source):
//      `anaglyph`, a depth-scaled red/cyan stereo split in FRAG_FINAL, and
//      `mosaic`, a grouted tile quantiser in FRAG_GEO, both marked at their
//      sites and both taking the same arm-gated bass sweetening.
//
// NOT PORTED (out of scope for this rack, they are sources or whole-frame
// compositors, not the effect decks): equirect projection, stereo SBS/TB,
// slit-scan, time displacement, the Category A/B plugin passes (reaction-
// diffusion, SDF portal, topographic, fluid displacement, depth fog, z-planes,
// tilt-shift, depth outline), autopilot, playback speed/reverse, recording.
//
// CONTRACT
//   createFxRack(THREE, renderer, width, height, opts?) -> {
//     render(inputTexture, outputTarget, dt, io), params, setParam(k, v),
//     reset(), resize(w, h), dispose()
//   }
//   `opts` is optional and keeps the four-argument call working:
//     { tier: 'low'|'med'|'high' } , default 'med'. Scales the blur tap count,
//     the ASCII cell-average tap grid and the backskip ring depth (see TIERS).
//     (createFxRack has no ctx, so the host passes its quality tier here.)
//   ZERO allocation in render(), verified at zero bytes/frame in steady state,
//   after the lazily-created targets exist. dispose() frees every target,
//   geometry, material and texture the rack created.
//   `setParam` is the guarded entry point: it clamps to the table below and
//   rejects non-finite input. Writing `params` directly is supported (the UI
//   binds to it) but is trusted to supply finite numbers; the two values that
//   would amplify a stray NaN into a blank frame, the geometry zoom and the
//   tile count, are guarded at their use sites regardless.
//
// ─────────────────────────────────────────────────────────────────────────────
// PARAMETER TABLE (key: default (range)) source of each default/range noted.
// (`params` is a plain mutable object; a UI can be generated straight from this.)
//
//   GEOMETRICS
//     mirrorX        false      toggle          VJControls TogglePad "Mirror X"
//     mirrorY        false      toggle          VJControls TogglePad "Mirror Y"
//     kaleidoscope   false      toggle          VJControls TogglePad "Kaleido"
//     tiling         1          1..8   step 1   Fader "Grid Tiling"
//     mosaic         0          0..1            [SwayCommand] see MOSAIC at FRAG_GEO
//     radialSpokes   0          0..24  step 1   Fader "Radial Mirror (Spokes)"
//     feedback       0.85       0..0.99         Fader "Feedback Wash"
//     softEdges      true       toggle          TogglePad "Soft Edges"
//   CORRUPTION
//     glitch         0          0..1            Fader "Glitch"
//     rgbGhost       0          0..1            Fader "Ghosting"
//     rgbSplit       0          0..1            Fader "Anaglyph"
//     waveWarp       0          0..1            Fader "Wave Warp"
//     chromaAb       0          0..1            Fader "Chroma Ab"
//     pixelate       0          0..1            Fader "Pixel Destroy"
//     backskip       0          0..1            Fader "Backskip"
//     chromaAbRadial false      toggle          [SwayCommand] see CHROMA/RGB SPLIT
//     anaglyph       0          0..1            [SwayCommand] see ANAGLYPH at FRAG_FINAL
//   CHROMATICS
//     hue            0          0..360 deg      Fader "Hue Cycle"
//     saturation     100        0..300 %        Fader "Saturation"
//     contrast       100        0..300 %        Fader "Contrast"
//     brightness     100        0..200 %        Fader "Brightness"
//     invert         false      toggle          TogglePad "INV"
//     edgeDetect     false      toggle          TogglePad "EDG"
//     sepia          0          0..1            Fader "Sepia"        (fxSepia)
//     grayscale      0          0..1            Fader "Grayscale"    (fxGrayscale)
//     blur           0          0..1            Fader "Soft Blur"    (fxBlur)
//     scanlines      true       toggle          TogglePad "SCN"
//     crt            true       toggle          TogglePad "CRT"
//     vignette       true       toggle          TogglePad "VIG"
//   TIMECODE
//     echoTrails     0          0..40  frames   Fader "Echo/Motion Trails"
//     strobe         0          0..1            Fader "Strobe Burst"
//     posterizeTime  60         1..60  fps      Fader "Posterize Time (Stutter)"
//   ASCII
//     ascii          false      toggle          TogglePad "ASCII"    (asciiFx)
//     asciiCols      160        40..320 step 1  Fader "Density (cols)"
//     asciiMono      false      toggle          TogglePad "Mono"
//     asciiAccent    '#00ff41'  #rrggbb         colour input
//     asciiPalette   true       toggle          [SwayCommand] accent from io.palette
//   GLOBAL
//     audioReactive  true       toggle          upstream default is FALSE (no
//                                               mic guaranteed); SwayCommand always
//                                               has an audio engine, so the bass
//                                               sweetening is armed by default.
// ─────────────────────────────────────────────────────────────────────────────

/** Upstream DEFAULT_VJ_STATE values for every key this rack owns (types.ts). */
export const DEFAULTS = Object.freeze({
  // GEOMETRICS
  mirrorX: false,
  mirrorY: false,
  kaleidoscope: false,
  tiling: 1,
  mosaic: 0,
  radialSpokes: 0,
  feedback: 0.85,
  softEdges: true,
  // CORRUPTION
  glitch: 0,
  rgbGhost: 0,
  rgbSplit: 0,
  waveWarp: 0,
  chromaAb: 0,
  pixelate: 0,
  backskip: 0,
  chromaAbRadial: false,
  anaglyph: 0,
  // CHROMATICS
  hue: 0,
  saturation: 100,
  contrast: 100,
  brightness: 100,
  invert: false,
  edgeDetect: false,
  sepia: 0,
  grayscale: 0,
  blur: 0,
  scanlines: true,
  crt: true,
  vignette: true,
  // TIMECODE
  echoTrails: 0,
  strobe: 0,
  posterizeTime: 60,
  // ASCII
  ascii: false,
  asciiCols: 160,
  asciiMono: false,
  asciiAccent: '#00ff41',
  asciiPalette: true,
  // GLOBAL
  audioReactive: true,
});

/**
 * Clamp ranges for setParam. `true` marks a boolean; 'hex' a #rrggbb string.
 * Exported so the Studio FX panel can build its controls from the same table
 * that guards assignment, rather than duplicating the ranges in the UI.
 */
export const RANGES = Object.freeze({
  mirrorX: true, mirrorY: true, kaleidoscope: true, softEdges: true,
  invert: true, edgeDetect: true, scanlines: true, crt: true, vignette: true,
  ascii: true, asciiMono: true, asciiPalette: true, audioReactive: true,
  chromaAbRadial: true,
  asciiAccent: 'hex',
  tiling: [1, 8], radialSpokes: [0, 24], feedback: [0, 0.99], mosaic: [0, 1],
  glitch: [0, 1], rgbGhost: [0, 1], rgbSplit: [0, 1], waveWarp: [0, 1],
  chromaAb: [0, 1], pixelate: [0, 1], backskip: [0, 1], anaglyph: [0, 1],
  hue: [0, 360], saturation: [0, 300], contrast: [0, 300], brightness: [0, 200],
  sepia: [0, 1], grayscale: [0, 1], blur: [0, 1],
  echoTrails: [0, 40], strobe: [0, 1], posterizeTime: [1, 60],
  asciiCols: [40, 320],
});

/**
 * UI grouping for the rack panel. Lives beside RANGES so the deck list and the
 * parameter table cannot drift apart: every key here has a RANGES entry, and
 * every RANGES key appears in exactly one deck.
 */
export const DECKS = Object.freeze([
  { name: 'Geometrics', keys: ['mirrorX', 'mirrorY', 'kaleidoscope', 'softEdges', 'tiling', 'mosaic', 'radialSpokes', 'feedback'] },
  { name: 'Corruption', keys: ['glitch', 'rgbGhost', 'rgbSplit', 'chromaAb', 'chromaAbRadial', 'anaglyph', 'waveWarp', 'pixelate', 'backskip'] },
  { name: 'Chromatics', keys: ['hue', 'saturation', 'contrast', 'brightness', 'invert', 'edgeDetect', 'sepia', 'grayscale', 'blur', 'scanlines', 'crt', 'vignette'] },
  { name: 'Timecode', keys: ['echoTrails', 'strobe', 'posterizeTime', 'audioReactive'] },
  { name: 'ASCII', keys: ['ascii', 'asciiCols', 'asciiMono', 'asciiAccent', 'asciiPalette'] },
]);

// ── ASCII constants, AsciilineRenderer.ts, verbatim ────────────────────────
/** ASCILINE's 93-char ramp, dark (space) to light (@). Verbatim. */
const RAMP = " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
const RAMP_N = RAMP.length;       // 93
const CELL_W = 16;
const CELL_H = 32;                // glyph cell aspect 0.5 (monospace)
const GLYPH_ASPECT = CELL_W / CELL_H;

/** Upstream's glitch slice ceiling: floor(random()*12*glitch)+1 never exceeds 12. */
const MAX_SLICES = 12;

const TAU = Math.PI * 2;

// ─────────────────────────────────────────────────────────────────────────────
// SHADERS, GLSL3 (GLSL ES 3.00) throughout: every material below sets
// `glslVersion: THREE.GLSL3` (through MAT_OPTS), so the vertex stage uses
// in/out, each fragment stage declares its own `out vec4 fragColor`, and
// sampling is `texture()`. three.js supplies `#version 300 es`, the precision
// statements and the position/uv/matrix declarations in its prefix. Every
// division, pow base and normalize below is guarded: a NaN blanks the frame.
//
// Coordinate conventions. The canvas 2D pipeline upstream works in device
// pixels with y DOWN and the origin top-left; three.js render-target UV has y UP
// with the origin bottom-left. Each shader that reproduces a canvas transform
// converts explicitly:  canvasY = (1.0 - uv.y) * resY,  uv.y = 1.0 - canvasY/resY.
// Getting this wrong mirrors the wheel and flips the scanline phase, so the
// conversions are written out rather than folded away.
// ─────────────────────────────────────────────────────────────────────────────

const VERT = /* glsl */ `
  out vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0); // fullscreen, no matrices
  }`;

/** Straight copy, used for the posterize-time hold and the backskip ring write. */
const FRAG_COPY = /* glsl */ `
  precision highp float;
  uniform sampler2D tSrc;
  in vec2 vUv;
  out vec4 fragColor;
  void main() { fragColor = vec4(texture(tSrc, vUv).rgb, 1.0); }`;

// ── ECHO TRAILS ─────────────────────────────────────────────────────────────
// Upstream (VideoOutput.tsx, "Time-domain Composite Pass"):
//     echoCount = floor(echoTrails)
//     slitCtx.globalAlpha = 1 / (echoCount + 1)
//     drawImage(head); for i = 1..echoCount: drawImage(frame[head - i])
// Canvas source-over with a constant globalAlpha a is exactly the recurrence
//     c <- a * f + (1 - a) * c
// so the upstream composite is a truncated exponential accumulation with
// a = 1/(N+1), total weight g = 1 - (1-a)^(N+1)  (g < 1, the frame genuinely
// darkens; that is part of the look and is reproduced).
//
// DEVIATION: upstream feeds the ring newest-frame-first, so the OLDEST frame
// carries the largest weight and the picture lags by ~N frames. Reproducing
// that streaming needs the 60-frame full-resolution ring, which is ~330 MB at
// 1080p. This is the same exponential kernel with the same coefficient and the
// same total gain, run newest-dominant over an unbounded tail: identical smear
// length and brightness, without the N-frame lag.
//
// The gain is folded into the recurrence rather than applied on read, so one
// target holds the finished value:  out = (a*g)*src + (1-a)*prevOut.
const FRAG_ECHO = /* glsl */ `
  precision highp float;
  uniform sampler2D tSrc;   // this frame
  uniform sampler2D tAcc;   // previous accumulator (ping-pong)
  uniform float uAlpha;     // a   = 1 / (N + 1)
  uniform float uAlphaGain; // a*g = a * (1 - (1-a)^(N+1))
  in vec2 vUv;
  out vec4 fragColor;
  void main() {
    vec3 s = texture(tSrc, vUv).rgb;
    vec3 a = texture(tAcc, vUv).rgb;
    fragColor = vec4(s * uAlphaGain + a * (1.0 - uAlpha), 1.0);
  }`;

// ── GEOMETRY + FEEDBACK WASH ────────────────────────────────────────────────
// Reproduces, in one inverse UV map, upstream's:
//   • pixelate      offCanvas downscale by (1 - pixelate*0.96) then a NEAREST
//                   upscale (imageSmoothingEnabled = false)
//   • zoomScale     translate(w/2,h/2) scale(z) translate(-w/2,-h/2)
//   • tiling        t = floor(tiling); a t x t grid of full-frame draws
//   • kaleidoscope  the 4-quadrant symmetry inside each tile (TL, TR mirrored
//                   in x, BL mirrored in y, BR both)
//   • mirrorX/Y     scale(±1, ±1) about the tile centre
//   • softEdges     two sequential black linear-gradient fills, stops
//                   0->1, 0.15->0, 0.85->0, 1->1, over the drawn rect
//   • feedback      the black-fill + lowered-globalAlpha accumulation
//
// drawVideoCover's aspect "cover" fit collapses to the identity here: the input
// texture already has the output's aspect and every tile / quadrant is a scaled
// copy of the full frame, so the source ratio always equals the destination
// ratio. (Upstream's equirect sliver branch is out of scope, see the header.)
//
// FEEDBACK, derived from the canvas ops verbatim:
//     fillRect(black) at globalAlpha (1-fb)        -> c = prev * fb
//     then the geometry draw at globalAlpha 1-0.95*fb (source-over)
//                                                   -> c = geo*a + prev*fb*(1-a)
//   with a = 1 - 0.95*fb, so
//     out = geo * (1 - 0.95*fb) + prev * 0.95*fb*fb
//   At the 0.85 default that is 0.1925*geo + 0.6864*prev, a decaying wash, not
//   a unity-gain feedback loop. Reproduced exactly, fb-squared and all.
//
// [SwayCommand] MOSAIC, rack-native, no upstream source; deliberately distinct
// from pixelate above. The frame is quantised into square tiles (4..64 px,
// ramped by the fader), each tile samples its own CENTRE, a thin grout line is
// darkened on the tile borders and each tile takes a subtle brightness
// variation from a hash of its integer coords, so the result reads as tilework
// rather than resolution loss. Neutral-skip: uMosCells = (0,0) leaves srcUv
// untouched and mosShade at exactly 1.0, so the off state is the old shader.
const FRAG_GEO = /* glsl */ `
  precision highp float;
  uniform sampler2D tSrc;
  uniform sampler2D tPrev;    // feedback accumulator (ping-pong)
  uniform float uZoom;        // 1 + powBass*0.25 when armed
  uniform float uTiles;       // floor(tiling), >= 1
  uniform float uKaleido;     // 0/1
  uniform vec2  uMirror;      // (mirrorX, mirrorY) as 0/1
  uniform float uSoft;        // 0/1
  uniform vec2  uPixCells;    // pixelate cell counts; (0,0) = off
  uniform vec2  uMosCells;    // [SwayCommand] mosaic tile counts; (0,0) = off
  uniform float uMosGrout;    // [SwayCommand] grout half-width, tile units
  uniform float uMosTint;     // [SwayCommand] per-tile brightness amplitude
  uniform float uFbGeo;       // 1 - 0.95*fb
  uniform float uFbPrev;      // 0.95*fb*fb
  in vec2 vUv;
  out vec4 fragColor;

  // One black gradient fill: alpha 1 at the edge, 0 from 15% to 85%.
  float softAlpha(float u) {
    float lo = 1.0 - clamp(u / 0.15, 0.0, 1.0);          // 0.15 is a literal: safe
    float hi = clamp((u - 0.85) / 0.15, 0.0, 1.0);
    return clamp(lo + hi, 0.0, 1.0);
  }

  // [SwayCommand] per-tile hash for the mosaic tint, the same construction
  // FRAG_FINAL's value noise uses, so the rack keeps a single hash flavour.
  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    // zoom about the canvas centre (the CPU guarantees uZoom > 1e-3, and falls
    // back to exactly 1 for any non-finite value, so this divide is safe)
    vec2 uv = (vUv - 0.5) / uZoom + 0.5;

    // tile-local coordinates, then flip to the canvas convention (y down) so
    // the mirror / kaleidoscope maths reads exactly like the 2D canvas code
    vec2 cell = fract(uv * uTiles);
    vec2 l = vec2(cell.x, 1.0 - cell.y);

    vec2 s;   // source coords in canvas convention
    vec2 e;   // coords of the drawn rect, for the soft-edge mask
    if (uKaleido > 0.5) {
      // TL/TR/BL/BR quadrant symmetry = a triangle wave on each axis:
      //   lx < 0.5 -> 2lx        (TL/BL, unmirrored)
      //   lx >= 0.5 -> 2 - 2lx   (TR/BR, scale(-1,1))
      s = 1.0 - abs(2.0 * l - 1.0);
      e = fract(l * 2.0);              // softEdges runs per quadrant upstream
    } else {
      s = mix(l, 1.0 - l, uMirror);    // scale(mirrorX ? -1 : 1, mirrorY ? -1 : 1)
      e = l;
    }

    vec2 srcUv = vec2(s.x, 1.0 - s.y); // back to three.js UV

    // pixelate: sample the cell centre of the downscaled grid
    if (uPixCells.x > 0.0) {
      srcUv = (floor(srcUv * uPixCells) + 0.5) / uPixCells;
    }

    // [SwayCommand] mosaic: quantise into square tiles, sample each tile's
    // CENTRE; the shade term (grout + hashed per-tile tint) multiplies the
    // fetch below. See the MOSAIC note above FRAG_GEO.
    float mosShade = 1.0;
    if (uMosCells.x > 0.0) {
      vec2 mg = srcUv * uMosCells;
      vec2 mc = floor(mg);
      vec2 db = abs(fract(mg) - 0.5);            // 0 at tile centre, 0.5 at border
      srcUv = (mc + 0.5) / uMosCells;            // tile-centre sample
      float grout = step(0.5 - uMosGrout, max(db.x, db.y));
      mosShade = (1.0 - 0.45 * grout) * (1.0 + (hash21(mc) - 0.5) * uMosTint);
    }

    vec3 geo = texture(tSrc, srcUv).rgb;
    if (uMosCells.x > 0.0) geo *= mosShade;

    if (uSoft > 0.5) {
      geo *= 1.0 - softAlpha(e.x);     // the X gradient fill...
      geo *= 1.0 - softAlpha(e.y);     // ...then the Y gradient fill
    }

    vec3 prev = texture(tPrev, vUv).rgb;
    fragColor = vec4(geo * uFbGeo + prev * uFbPrev, 1.0);
  }`;

// ── CORRUPTION (post-geometry canvas stage) ─────────────────────────────────
// Radial-spoke wheel -> glitch slice tearing -> rgbGhost screen smear -> strobe.
// This is upstream's draw order on the canvas, and it matters: the wheel reads
// the geometry composite, the slices read the wheel, the ghost reads the slices.
//
// RADIAL SPOKE WHEEL, VideoOutput.tsx "RADIAL MIRROR / KALEIDOSCOPE WHEEL".
// Upstream snapshots the canvas, fills black, then for i = 0..spokes-1:
//     translate(w/2,h/2); rotate(baseRotation + i*sectorAngle);
//     if (i % 2 === 1) scale(1,-1);            // mirror every other sector
//     clip(wedge -sectorAngle/2 .. +sectorAngle/2, radius sqrt(w²+h²));
//     translate(-w/2,-h/2); drawImage(snapshot, 0, 0);
// with sectorAngle = 2π/spokes and
//     baseRotation = (timestamp/1000) * 0.15  [+ (mid + high) * π if reactive]
// Forward transform T = Tr(c) ∘ Rot(R_i) ∘ Flip_i ∘ Tr(-c), so the inverse map
// this shader needs is  srcRel = Flip_i( Rot(-R_i) · screenRel ).  Flip is an
// involution, hence no separate inverse. The wedges tile the circle exactly, so
// the sector that owns a pixel is the nearest one:  i = round((θ - R)/sector).
// i is then wrapped into 0..spokes-1 with mod() (NOT just used raw) because
// the y-flip depends on i's parity and upstream only ever draws indices
// 0..spokes-1. With an odd spoke count that leaves a parity seam where the
// wheel closes; the seam is upstream's and is reproduced rather than smoothed.
//
// GLITCH SLICE TEARING, VideoOutput.tsx "PIXEL TEARING (DATAMOSH)".
//     if (Math.random() < glitch) {
//       slices = floor(random()*12*glitch) + 1
//       for each: srcY = random()*h
//                 sliceH = (random()*0.3 + 0.02)*h
//                 shiftX = (random()-0.5)*w*glitch*2.5
//                 drawImage(canvas, 0,srcY,w,sliceH, shiftX,srcY,w,sliceH)
//     }
// The random draw happens on the CPU each frame, exactly as above, and lands in
// uSlices as (srcY, sliceH, shiftX, ·) in canvas pixels. A band is a full-width
// copy placed at x = shiftX, so a pixel inside the band's rows reads the source
// at x - shiftX when that lands inside [0, w) and the untouched original when it
// does not (|shiftX| reaches 1.25w at glitch = 1, so the test is load-bearing).
// DEVIATION: upstream re-snapshots the canvas per slice, so overlapping slices
// compound their shifts. Here the last slice covering a row wins (matching the
// draw order) with a single tap; compounding would need one pass per slice.
//
// RGB GHOST, VideoOutput.tsx "GHOSTING (DELAY BUFFER SMEAR)".
//     globalCompositeOperation = 'screen'; globalAlpha = a = 0.5 * rgbGhost
//     sx = ghost*w*0.08; sy = ghost*h*0.02
//     drawImage(canvas,  sx,  sy, w, h)      // then, over that result:
//     drawImage(canvas, -sx, -sy, w, h)
// Each drawImage snapshots the canvas first, so the second draw sees the first
// draw's output as BOTH backdrop and (offset) source. Writing c0 for the
// pre-ghost image and d for the offset, that is exactly three taps:
//     c1(p)   = mix(c0(p),  screen(c0(p),  c0(p-d)), a)
//     c1(p+d) = mix(c0(p+d),screen(c0(p+d),c0(p)),   a)
//     c2(p)   = mix(c1(p),  screen(c1(p),  c1(p+d)), a)
// so the two-draw sequence is reproduced exactly, not approximated.
//
// STROBE, VideoOutput.tsx "STROBE": fills white (black when the invert toggle
// is on) at globalAlpha 0.9. The trigger is resolved on the CPU; see render().
const FRAG_CORRUPT = /* glsl */ `
  precision highp float;
  #define MAX_SLICES ${MAX_SLICES}
  uniform sampler2D tSrc;
  uniform vec2  uRes;
  uniform float uSpokes;        // 0 or >= 2
  uniform float uSpokeRot;      // baseRotation, radians
  uniform float uSliceCount;    // 0..MAX_SLICES
  uniform vec4  uSlices[MAX_SLICES];   // (srcY, sliceH, shiftX, ·) canvas px
  uniform float uGhost;         // 0..1
  uniform vec2  uGhostShift;    // (sx, sy) canvas px
  uniform float uStrobe;        // 0/1, fire this frame
  uniform vec3  uStrobeCol;     // white, or black when invert is on
  in vec2 vUv;
  out vec4 fragColor;

  const float TAU = 6.2831853;

  // inverse of the wheel: screen uv -> uv in the snapshot it sampled
  vec2 radialMap(vec2 uv) {
    // centred canvas pixels, y down
    vec2 p = vec2((uv.x - 0.5) * uRes.x, (0.5 - uv.y) * uRes.y);
    // atan(0,0) is undefined in GLSL; nudge the exact centre pixel off-axis
    if (dot(p, p) < 1.0e-8) p = vec2(1.0e-4, 0.0);
    float th = atan(p.y, p.x);
    // uSpokes is >= 2 at the call site, but the guard is UNCONDITIONAL: ANGLE
    // flattens the if-guarded call below into a select on some drivers and
    // then evaluates the untaken side. With uSpokes = 0 that is TAU/0 -> inf,
    // then mod(inf, 0) -> NaN, and a NaN reaching fragColor blanks the
    // whole frame. (No backticks in this comment: it lives inside a JS
    // template literal, where a backtick would end the shader string.)
    float spokes = max(uSpokes, 2.0);
    float sector = TAU / spokes;
    float i = floor((th - uSpokeRot) / sector + 0.5);
    i = mod(i, spokes);                           // upstream only draws 0..spokes-1
    float R = uSpokeRot + i * sector;
    float c = cos(R), s = sin(R);
    // Rot(-R) in the y-down canvas basis
    vec2 loc = vec2(c * p.x + s * p.y, -s * p.x + c * p.y);
    // mirror every other sector: scale(1,-1)
    if (mod(i, 2.0) > 0.5) loc.y = -loc.y;
    return vec2(loc.x / uRes.x + 0.5, 0.5 - loc.y / uRes.y);
  }

  // inverse of the slice tearing, evaluated at the tap's own position
  vec2 glitchMap(vec2 uv) {
    float py = (1.0 - uv.y) * uRes.y;   // canvas y
    float px = uv.x * uRes.x;
    vec2 out_ = uv;
    for (int k = 0; k < MAX_SLICES; k++) {
      if (float(k) >= uSliceCount) break;
      vec4 sl = uSlices[k];
      if (py >= sl.x && py < sl.x + sl.y) {
        float sx = px - sl.z;
        // outside the pasted band the original pixel survives
        out_ = (sx >= 0.0 && sx < uRes.x) ? vec2(sx / uRes.x, uv.y) : uv;
      }
    }
    return out_;
  }

  // one full corruption fetch: inverse chain runs last-forward-stage-first
  vec3 fetchC(vec2 uv) {
    vec2 u = uv;
    if (uSliceCount > 0.0) u = glitchMap(u);
    if (uSpokes >= 2.0)    u = radialMap(u);
    // the wheel can map a pixel off the snapshot; upstream cleared to black
    // first, so anything outside reads black. Masked rather than branched so
    // the function keeps a single exit.
    float inside = step(0.0, u.x) * step(u.x, 1.0) * step(0.0, u.y) * step(u.y, 1.0);
    return texture(tSrc, clamp(u, 0.0, 1.0)).rgb * inside;
  }

  vec3 screenBlend(vec3 b, vec3 s) { return b + s - b * s; }

  void main() {
    vec3 col = fetchC(vUv);

    if (uGhost > 0.0) {
      float a = 0.5 * uGhost;
      // canvas +y is down, so the uv offset flips sign on y
      vec2 d = vec2(uGhostShift.x / uRes.x, -uGhostShift.y / uRes.y);
      vec3 c0m = fetchC(vUv - d);
      vec3 c0q = fetchC(vUv + d);
      vec3 c1p = mix(col, screenBlend(col, c0m), a);
      vec3 c1q = mix(c0q, screenBlend(c0q, col), a);
      col = mix(c1p, screenBlend(c1p, c1q), a);
    }

    if (uStrobe > 0.5) col = mix(col, uStrobeCol, 0.9);

    fragColor = vec4(col, 1.0);
  }`;

// ── ASCII ───────────────────────────────────────────────────────────────────
// AsciilineRenderer.ts FRAG, kept GLSL3 (GLSL ES 3.00):
//   `#version 300 es` is supplied by three.js, `out vec4 O` -> `out vec4
//   fragColor`, `texture()` stays, and `gl_FragCoord.xy / u_resolution` -> the
//   vUv input (the same value; upstream needed the fragcoord form because its
//   quad carried no attributes). The luma weights, the mono/accent branch and the
//   `col *= 0.85 + 0.25*u_volume + 0.15*u_bass` audio term are verbatim. The
//   glyph-index line is the even-spread form `clamp(floor(luma*N), 0, N-1)`,
//   which gives all 93 glyphs an equal 1/N slice of luma and folds the
//   luma == 1.0 case back onto the last glyph, see the note at the line.
//
// DEVIATION: upstream downscales the frame to the cell grid with a Canvas2D
// drawImage (a box filter) and uploads that as a NEAREST texture, so each texel
// is one averaged cell. Here the source is already a GPU texture, so the cell
// average is taken with a small tap grid at the cell's own footprint,
// ASCII_TAPS² bilinear taps spread across the cell. Same intent (one averaged
// value per cell), no CPU readback.
const FRAG_ASCII = /* glsl */ `
  precision highp float;
  #ifndef ASCII_TAPS
  #define ASCII_TAPS 2
  #endif
  uniform sampler2D u_source;
  uniform sampler2D u_atlas;
  uniform vec2  u_grid;      // (cols, rows)
  uniform float u_n;         // 93
  uniform float u_mono;
  uniform vec3  u_accent;
  uniform float u_bass;
  uniform float u_volume;
  in vec2 vUv;
  out vec4 fragColor;
  void main() {
    vec2 uv = vUv;
    vec2 cell = floor(uv * u_grid);
    vec2 inCell = fract(uv * u_grid);
    vec2 cuv = (cell + 0.5) / u_grid;               // u_grid components >= 2
    // box-average the cell (stands in for the cv2.resize / drawImage downscale)
    vec3 src = vec3(0.0);
    vec2 step_ = (1.0 / u_grid) / float(ASCII_TAPS);
    for (int y = 0; y < ASCII_TAPS; y++) {
      for (int x = 0; x < ASCII_TAPS; x++) {
        vec2 o = (vec2(float(x), float(y)) - (float(ASCII_TAPS) - 1.0) * 0.5) * step_;
        src += texture(u_source, cuv + o).rgb;
      }
    }
    src /= float(ASCII_TAPS * ASCII_TAPS);

    float luma = dot(src, vec3(0.299, 0.587, 0.114));
    // Even spread over the whole ramp: floor(luma*N) hands each of the N glyphs
    // an equal 1/N slice of luma, and the clamp folds the single luma == 1.0
    // value (which would index N) back onto the last glyph. u_n is 93 and never
    // zero, so the divide below is safe.
    // UNVERIFIED: AsciilineRenderer.ts is not vendored into this repo, so this
    // one line could not be diffed against it. If the upstream file becomes
    // available, check it for the off-by-one variant floor(luma*(N-1)+0.5).
    float idx = clamp(floor(luma * u_n), 0.0, u_n - 1.0);
    vec2 auv = vec2((idx + inCell.x) / u_n, inCell.y);
    float ink = texture(u_atlas, auv).a;
    vec3 col = (u_mono > 0.5) ? (u_accent * ink) : (src * ink);
    // Gentle audio pulse on the ink brightness.
    col *= 0.85 + 0.25 * u_volume + 0.15 * u_bass;
    fragColor = vec4(col, 1.0);
  }`;

// ── CHROMATICS + OPTICS (the CSS/SVG filter chain and the DOM overlays) ─────
// Upstream builds one CSS `filter` string and applies it to the canvas element:
//     hue-rotate(H deg) saturate(S%) contrast(C%) brightness(B%) [invert(100%)]
//     [sepia(x%)] [grayscale(x%)] [blur(Npx)]
//     [url(#fvj-edge)] [url(#fvj-warp)] [url(#fvj-rgb)]
// then layers three DOM overlays on top: scanlines, CRT flicker, vignette.
// CSS filter functions are applied left to right, so the SVG filters run LAST,
// after the colour grade, not before it. That order is preserved here.
//
// COLOUR GRADE. hue-rotate / saturate / sepia / grayscale are the Filter
// Effects colour matrices, verbatim from the spec (they are what the browser
// runs, so "reproduce the maths" means reproduce those matrices, see
// buildColourMatrices()). contrast(c) = c·x + (0.5 - 0.5c), brightness(b) = b·x,
// invert = 1 - x. The four matrices collapse on the CPU into two mat3 uniforms
// (uM1 = saturate·hueRotate, uM2 = grayscale·sepia); between them sit TWO
// clamped affines, not one, uAff.xy is contrast and uAff.zw is brightness with
// invert folded in. The spec clamps each primitive to [0,1], and the clamp
// between contrast and brightness is load-bearing: contrast(300%) on a white
// pixel yields 2.0, which the spec clamps to 1.0, so brightness(25%) must give
// 0.25 and not 0.5. Invert then folds into brightness exactly, because
// clamp(1 - clamp(z)) == clamp(1 - z).
// MICRO-DEVIATION: collapsing the matrix PAIRS still drops the clamp between
// hue<->saturate and between sepia<->grayscale. Those two only differ on
// out-of-gamut intermediates that the very next clamp catches.
//
// BLUR, upstream `blur(fxBlur * 20 px)`, a true Gaussian. Reproduced as a
// ring-of-taps disc of the same pixel radius (BLUR_TAPS by tier). DEVIATION:
// the tap count, and nothing else. Blur now runs in every combination,
// edgeDetect included, see PASS SPLIT for why that became affordable.
//
// PASS SPLIT (a performance change, not a fidelity one). The grade and the blur
// are pointwise / small-kernel operations on the source; edge, warp and the rgb
// split each RE-EVALUATE everything upstream of them at several offsets. Folded
// into one shader those multiply out: the 9-tap edge kernel inside the 3-tap
// split is 27 evaluations of the full grade per pixel, roughly 1,600 ALU ops
// per pixel, about half an Intel HD 630 at 1080p60 for this pass alone,
// before the scene that feeds the rack has been drawn at all. So the grade and
// blur run ONCE per pixel into their own target (FRAG_GRADE) and every tap in
// FRAG_FINAL is a plain texture fetch: the same worst case is 27 fetches with
// almost no ALU behind them. Same operators, same order, same result; only the
// redundancy is gone. It is also what lets the old "blur is bypassed when
// edgeDetect is on" deviation be deleted, so the chain is now closer to
// upstream than the single-shader version was.
//
// EDGE, `<feConvolveMatrix order="3 3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1">`
// verbatim. Kernel sum is 0, so per spec the divisor falls back to 1; the result
// is clamped. (The kernel is symmetric, so the spec's 180° kernel rotation is a
// no-op here.)
//
// WAVE WARP, `<feTurbulence type="fractalNoise" baseFrequency=F numOctaves=2>`
// into `<feDisplacementMap scale=S xChannelSelector="R" yChannelSelector="G">`
// with the upstream drive values S = waveWarp*150 and F = 0.01 + waveWarp*0.04
// (cycles per pixel), both reproduced exactly. feDisplacementMap is defined as
//     result(x,y) = in(x + S*(XC-0.5), y + S*(YC-0.5))
// which is what the shader computes. DEVIATION: the turbulence itself is a
// 2-octave value-noise fbm normalised to 0..1 rather than SVG's Perlin
// generator, same octave count, same lacunarity/gain, same output range, a
// different (unspecified-by-us) noise basis.
//
// RGB SPLIT / CHROMA AB, `<feOffset>` pairs, verbatim:
//     dx = rgbSplit*100 + chromaAb*20      dy = chromaAb*15     (CSS pixels)
//     red  offset (+dx, +dy), blue offset (-dx, -dy), green untouched,
//     then feBlend mode="screen" of the three single-channel images.
// Screening images whose channels are disjoint reduces to taking each channel
// from its own source, so the three-way blend is exact, not an approximation.
// feOffset by (dx,dy) means result(p) = in(p - d), hence red samples at -d.
// [SwayCommand] `chromaAbRadial` (default false, off = pure upstream) sends the
// chromaAb component along the radial direction instead of a fixed diagonal,
// the plugin registry describes this effect as "radial per-channel RGB offsets"
// even though the implementation upstream is a uniform feOffset. Off by default
// so the ported behaviour is what you get unless you ask for the other one.
//
// [SwayCommand] ANAGLYPH, rack-native, no upstream source (upstream's stereo
// SBS/TB compositor is out of scope, see the header). Deliberately distinct
// from the flat feOffset split above: red is displaced left and slightly down,
// green+blue (cyan) right and slightly up, and the parallax scales with the
// distance from a screen-centre convergence plane, zero at the centre, full
// at the corners, so the separation reads as depth rather than a channel
// shift. At high drive the red and cyan images also counter-rotate slightly
// about the centre (uAnaRot ramps cubically, so it only wakes near the top of
// the fader). The anaglyph taps JOIN the split's own taps, so split+anaglyph
// together still cost three s3 evaluations; with uAnaPx at (0,0) the tap
// positions collapse to the split's exact previous expressions, which is the
// no-op-on-a-uniform branch this always-on pass requires.
//
// SCANLINES / CRT / VIGNETTE, the DOM overlays, index.css:
//   .scanlines-overlay  4px tile, top 2px clear, bottom 2px rgba(0,0,0,0.3),
//                       mix-blend-mode: overlay, element opacity 0.8
//   .crt-flicker-overlay rgba(0,0,0,0.1), mix-blend-mode: overlay,
//                       @keyframes crt 0.15s: opacity 0.8 -> 1 -> 0.8
//   vignette            inset 0 0 250px rgba(0,0,0,0.9); reproduced through the
//                       author's own GPU-shaped equivalent from the record-canvas
//                       path ("match div radial shadow"): a radial gradient from
//                       alpha 0 at r = w*0.35 to alpha 0.85 at r = max(w,h)*0.6.
// CSS `overlay` with a pure black source simplifies to 0 below 0.5 and 2·Cb-1
// above, per channel, that identity is what the shader evaluates.
// The CRT deck also gets the rolling bright bar from the record-canvas path
// (rgba(255,255,255,0.04), height 5..25px, random y, on ~half the frames);
// its randomness is drawn on the CPU and passed in as a uniform.
/**
 * CHROMATICS pass 1, the CSS colour functions and blur(), evaluated once per
 * pixel into their own target. See COLOUR GRADE, BLUR and PASS SPLIT above.
 */
const FRAG_GRADE = /* glsl */ `
  precision highp float;
  #ifndef BLUR_TAPS
  #define BLUR_TAPS 6
  #endif
  uniform sampler2D tSrc;
  uniform vec2  uTexel;        // 1 / uRes
  uniform mat3  uM1;           // saturate * hueRotate
  uniform mat3  uM2;           // grayscale * sepia
  uniform vec4  uAff;          // (mC,kC) contrast; (mB,kB) brightness+invert
  uniform float uBlurPx;       // fxBlur * 20, in pixels; 0 = off
  in vec2 vUv;
  out vec4 fragColor;

  vec3 graded(vec2 uv) {
    vec3 c = texture(tSrc, uv).rgb;
    c = clamp(uM1 * c, 0.0, 1.0);
    c = clamp(c * uAff.x + uAff.y, 0.0, 1.0);   // contrast(), clamped per spec
    c = clamp(c * uAff.z + uAff.w, 0.0, 1.0);   // brightness(), invert folded in
    c = clamp(uM2 * c, 0.0, 1.0);
    return c;
  }

  void main() {
    // One accumulator and one exit on purpose: an early return here makes
    // ANGLE's HLSL translation emit a "potentially uninitialized variable"
    // warning for the synthesised return temp, and that is not a warning worth
    // shipping. fragColor is written on every path.
    vec3 acc = graded(vUv);
    if (uBlurPx > 0.0) {
      for (int i = 0; i < BLUR_TAPS; i++) {   // constant bound, unrollable
        float a = (float(i) + 0.5) * (6.2831853 / float(BLUR_TAPS));
        // golden-ratio radius jitter spreads the ring into a disc
        float rr = uBlurPx * (0.55 + 0.45 * fract(float(i) * 0.6180339887));
        acc += graded(vUv + vec2(cos(a), sin(a)) * rr * uTexel);
      }
      acc /= float(BLUR_TAPS + 1);            // BLUR_TAPS >= 4: never zero
    }
    fragColor = vec4(acc, 1.0);
  }`;

/**
 * CHROMATICS pass 2, the SVG filters (edge, warp, rgb split) and the DOM
 * overlays. `tSrc` is FRAG_GRADE's output, so every tap here is a bare fetch.
 */
const FRAG_FINAL = /* glsl */ `
  precision highp float;
  uniform sampler2D tSrc;      // already graded and blurred
  uniform vec2  uRes;
  uniform vec2  uTexel;        // 1 / uRes
  uniform float uEdge;         // 0/1
  uniform float uWarpScale;    // waveWarp * 150, pixels; 0 = off
  uniform float uWarpFreq;     // 0.01 + waveWarp * 0.04, cycles/pixel
  uniform vec2  uSplitPx;      // (rgbSplit*100, 0)
  uniform vec2  uChromaPx;     // (chromaAb*20, chromaAb*15)
  uniform float uChromaRadial; // 0/1 [SwayCommand]
  uniform vec2  uAnaPx;        // [SwayCommand] red/cyan parallax at full depth, canvas px; (0,0) = off
  uniform float uAnaRot;       // [SwayCommand] per-eye counter-rotation, radians
  uniform float uScan;         // 0/1
  uniform float uCrt;          // 0/1
  uniform float uCrtAlpha;     // 0.1 * animated opacity
  uniform vec3  uCrtBar;       // (y0 canvas px, height px, on)
  uniform float uVig;          // 0/1
  in vec2 vUv;
  out vec4 fragColor;

  // ---- one tap of the graded + blurred image FRAG_GRADE produced ----
  // gradeRT is ClampToEdge, so the edge kernel, the warp and the split all get
  // duplicate-edge behaviour outside the frame. That is feConvolveMatrix's own
  // default (edgeMode="duplicate"); feOffset/feDisplacementMap would strictly
  // give transparent black past the filter region, but a hard black seam under
  // a 150 px warp looks like a bug, so the clamp is used throughout.
  vec3 s1(vec2 uv) { return texture(tSrc, uv).rgb; }

  // ---- feConvolveMatrix -1 -1 -1 / -1 8 -1 / -1 -1 -1, divisor 1 ----
  vec3 s2(vec2 uv) {
    vec3 c = s1(uv);
    if (uEdge > 0.5) {
      c *= 8.0;
      c -= s1(uv + vec2(-uTexel.x, -uTexel.y));
      c -= s1(uv + vec2( 0.0,      -uTexel.y));
      c -= s1(uv + vec2( uTexel.x, -uTexel.y));
      c -= s1(uv + vec2(-uTexel.x,  0.0));
      c -= s1(uv + vec2( uTexel.x,  0.0));
      c -= s1(uv + vec2(-uTexel.x,  uTexel.y));
      c -= s1(uv + vec2( 0.0,       uTexel.y));
      c -= s1(uv + vec2( uTexel.x,  uTexel.y));
      c = clamp(c, 0.0, 1.0);
    }
    return c;
  }

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  // 2-octave fractalNoise, normalised to 0..1 like feTurbulence's fractalNoise
  float fbm2(vec2 p) {
    return (vnoise(p) * 0.5 + vnoise(p * 2.0 + vec2(31.7, 17.3)) * 0.25) / 0.75;
  }

  // ---- feTurbulence -> feDisplacementMap ----
  vec3 s3(vec2 uv) {
    vec2 u = uv;
    if (uWarpScale > 0.0) {
      vec2 px = uv * uRes;
      float nx = fbm2(px * uWarpFreq);
      float ny = fbm2(px * uWarpFreq + vec2(37.13, 91.71));
      vec2 d = uWarpScale * (vec2(nx, ny) - 0.5);   // canvas px, y down
      u = uv + vec2(d.x, -d.y) * uTexel;
    }
    return s2(u);
  }

  // CSS mix-blend-mode: overlay against a pure black source layer
  vec3 overlayBlack(vec3 cb) {
    return mix(vec3(0.0), 2.0 * cb - 1.0, step(vec3(0.5), cb));
  }

  void main() {
    // ---- feOffset red/blue split, screen-recombined ----
    vec2 dPx = uSplitPx + uChromaPx;
    if (uChromaRadial > 0.5) {
      // [SwayCommand] send the chromaAb term along the radius instead
      vec2 rel = (vUv - 0.5) * uRes;
      float len = length(rel);
      // Unconditional guard rather than a ?:, both sides of a GLSL ternary are
      // commonly evaluated by the driver, so a plain rel/len would still
      // compute a NaN at the exact centre pixel. Dividing by max(len, eps)
      // yields dir = (0,0) there, harmless because rn is 0 at the centre too.
      vec2 dir = rel / max(len, 1.0e-4);
      float rn = clamp(len / max(0.5 * length(uRes), 1.0), 0.0, 1.0);
      dPx = uSplitPx + length(uChromaPx) * rn * vec2(dir.x, -dir.y);
    }

    vec3 col;
    // [SwayCommand] the anaglyph taps ride the split's; see ANAGLYPH above.
    if (dot(dPx, dPx) > 0.0 || uAnaPx.x > 0.0) {
      vec2 d = vec2(dPx.x, -dPx.y) * uTexel;   // canvas px -> uv (y flips)
      vec2 uvR = vUv;
      vec2 uvC = vUv;
      if (uAnaPx.x > 0.0) {
        vec2 rel = (vUv - 0.5) * uRes;
        // parallax grows with distance from the screen-centre convergence
        // plane (same normalisation as the radial chromaAb / vignette)
        float depth = clamp(length(rel) / max(0.5 * length(uRes), 1.0), 0.0, 1.0);
        // sampling red at +a displays the red image shifted by -a, left and
        // down in y-up uv space; cyan mirrors it to the right and up
        vec2 a = uAnaPx * depth * uTexel;
        // slight opposing per-eye rotation about the centre at high drive
        float cA = cos(uAnaRot), sA = sin(uAnaRot);
        vec2 relR = vec2(cA * rel.x - sA * rel.y, sA * rel.x + cA * rel.y);
        vec2 relC = vec2(cA * rel.x + sA * rel.y, -sA * rel.x + cA * rel.y);
        uvR = relR * uTexel + 0.5 + a;
        uvC = relC * uTexel + 0.5 - a;
      }
      col = vec3(s3(uvR - d).r, s3(uvC).g, s3(uvC + d).b);
    } else {
      col = s3(vUv);
    }

    // ---- DOM overlays, in stacking order ----
    float cy = (1.0 - vUv.y) * uRes.y;          // canvas y

    if (uScan > 0.5) {
      // 4px tile, bottom half rgba(0,0,0,0.3), element opacity 0.8
      float a = step(0.5, fract(cy * 0.25)) * 0.3 * 0.8;
      col = mix(col, overlayBlack(col), a);
    }
    if (uCrt > 0.5) {
      col = mix(col, overlayBlack(col), uCrtAlpha);
      // rolling bright bar (record-canvas path): rgba(255,255,255,0.04)
      if (uCrtBar.z > 0.5 && cy >= uCrtBar.x && cy < uCrtBar.x + uCrtBar.y) {
        col = mix(col, vec3(1.0), 0.04);
      }
    }
    if (uVig > 0.5) {
      vec2 rel = (vUv - 0.5) * uRes;
      float dist = length(rel);
      float inner = uRes.x * 0.35;
      float outer = max(uRes.x, uRes.y) * 0.6;
      float a = 0.85 * clamp((dist - inner) / max(outer - inner, 1.0e-4), 0.0, 1.0);
      col *= 1.0 - a;
    }

    fragColor = vec4(col, 1.0);
  }`;

// ─────────────────────────────────────────────────────────────────────────────

/** Quality ladder. createFxRack takes no ctx, so the host passes a tier in opts. */
const TIERS = {
  //          blur taps   ascii cell taps   backskip ring depth (upstream: 60)
  low:  { blurTaps: 4, asciiTaps: 1, ring: 3 },
  med:  { blurTaps: 6, asciiTaps: 2, ring: 5 },
  high: { blurTaps: 9, asciiTaps: 3, ring: 8 },
};

/**
 * Read one `io` scalar as a finite number in 0..1.
 *
 * NaN HYGIENE, not defensive noise. `io` is a shared object the engine mutates
 * in place, so a band that has not been written yet reads back `undefined`, and
 * `undefined * undefined * undefined` is NaN. That NaN would reach uZoom, which
 * the geometry shader DIVIDES by, and one NaN in fragColor blanks the whole
 * frame. The comparison form is deliberate: `v > 0` is false for both NaN and
 * undefined, so either falls to 0 instead of propagating. The clamp to 1 is
 * free here and matches the 0..1 range the scene contract documents.
 */
function aud(v) { return v > 0 ? (v < 1 ? v : 1) : 0; }

/** AsciilineRenderer.ts hexToRgb, verbatim (returns 0..1 components). */
function hexToRgb(hex, out) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) { out[0] = 0; out[1] = 1; out[2] = 0.25; return out; }
  const v = parseInt(m[1], 16);
  out[0] = ((v >> 16) & 255) / 255;
  out[1] = ((v >> 8) & 255) / 255;
  out[2] = (v & 255) / 255;
  return out;
}

export function createFxRack(THREE, renderer, width, height, opts) {
  const tier = TIERS[(opts && opts.tier) || 'med'] || TIERS.med;
  let W = Math.max(1, Math.floor(width) || 1);
  let H = Math.max(1, Math.floor(height) || 1);

  // ── parameters ────────────────────────────────────────────────────────────
  const params = {};
  for (const k in DEFAULTS) params[k] = DEFAULTS[k];

  // ── render targets ────────────────────────────────────────────────────────
  const RT_OPTS = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.UnsignedByteType,
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false,
  };
  const allTargets = [];               // everything dispose() must free
  function makeRT() {
    const rt = new THREE.WebGLRenderTarget(W, H, RT_OPTS);
    rt.texture.wrapS = THREE.ClampToEdgeWrapping;
    rt.texture.wrapT = THREE.ClampToEdgeWrapping;
    allTargets.push(rt);
    return rt;
  }

  // Always live: the two chain scratch buffers, the feedback accumulator, and
  // the colour-grade target (see PASS SPLIT, the grade runs every frame).
  let ping = makeRT();
  let pong = makeRT();
  let fbA = makeRT();
  let fbB = makeRT();
  let gradeRT = makeRT();
  // Created once, the first time their effect is switched on, and kept for the
  // rack's lifetime. Upstream does the same thing for its frame ring (it parks
  // on slot 0 until a history effect is active), allocating all of these up
  // front would cost ~100 MB of VRAM at 1080p for decks that are usually off.
  let echoA = null, echoB = null;      // echo trails accumulator (ping-pong)
  let holdRT = null;                   // posterize-time frame hold
  let ring = null;                     // backskip history ring
  let ringHead = 0;

  // ── fullscreen quad, reused by every pass ─────────────────────────────────
  const quadGeo = new THREE.PlaneGeometry(2, 2);
  const passScene = new THREE.Scene();
  const passCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(quadGeo, null);
  quad.frustumCulled = false;          // clip-space quad, skip culling
  passScene.add(quad);

  // GLSL ES 3.00 for every pass, see SHADERS above.
  const MAT_OPTS = { depthTest: false, depthWrite: false, glslVersion: THREE.GLSL3 };

  const copyMat = new THREE.ShaderMaterial({
    ...MAT_OPTS,
    uniforms: { tSrc: { value: null } },
    vertexShader: VERT,
    fragmentShader: FRAG_COPY,
  });
  const echoMat = new THREE.ShaderMaterial({
    ...MAT_OPTS,
    uniforms: {
      tSrc: { value: null }, tAcc: { value: null },
      uAlpha: { value: 0 }, uAlphaGain: { value: 0 },
    },
    vertexShader: VERT,
    fragmentShader: FRAG_ECHO,
  });
  const geoMat = new THREE.ShaderMaterial({
    ...MAT_OPTS,
    uniforms: {
      tSrc: { value: null }, tPrev: { value: null },
      uZoom: { value: 1 }, uTiles: { value: 1 }, uKaleido: { value: 0 },
      uMirror: { value: new THREE.Vector2(0, 0) }, uSoft: { value: 0 },
      uPixCells: { value: new THREE.Vector2(0, 0) },
      uMosCells: { value: new THREE.Vector2(0, 0) },
      uMosGrout: { value: 0 }, uMosTint: { value: 0 },
      uFbGeo: { value: 1 }, uFbPrev: { value: 0 },
    },
    vertexShader: VERT,
    fragmentShader: FRAG_GEO,
  });
  const corruptMat = new THREE.ShaderMaterial({
    ...MAT_OPTS,
    uniforms: {
      tSrc: { value: null },
      uRes: { value: new THREE.Vector2(W, H) },
      uSpokes: { value: 0 }, uSpokeRot: { value: 0 },
      uSliceCount: { value: 0 },
      uSlices: { value: new Float32Array(MAX_SLICES * 4) },
      uGhost: { value: 0 },
      uGhostShift: { value: new THREE.Vector2(0, 0) },
      uStrobe: { value: 0 },
      uStrobeCol: { value: new THREE.Color(1, 1, 1) },
    },
    vertexShader: VERT,
    fragmentShader: FRAG_CORRUPT,
  });
  const asciiMat = new THREE.ShaderMaterial({
    ...MAT_OPTS,
    defines: { ASCII_TAPS: tier.asciiTaps },
    uniforms: {
      u_source: { value: null }, u_atlas: { value: null },
      u_grid: { value: new THREE.Vector2(160, 45) },
      u_n: { value: RAMP_N },
      u_mono: { value: 0 },
      u_accent: { value: new THREE.Color(0, 1, 0.25) },
      u_bass: { value: 0 }, u_volume: { value: 0 },
    },
    vertexShader: VERT,
    fragmentShader: FRAG_ASCII,
  });
  const finalMat = new THREE.ShaderMaterial({
    ...MAT_OPTS,
    uniforms: {
      tSrc: { value: null },
      uRes: { value: new THREE.Vector2(W, H) },
      uTexel: { value: new THREE.Vector2(1 / W, 1 / H) },
      uEdge: { value: 0 },
      uWarpScale: { value: 0 }, uWarpFreq: { value: 0.01 },
      uSplitPx: { value: new THREE.Vector2(0, 0) },
      uChromaPx: { value: new THREE.Vector2(0, 0) },
      uChromaRadial: { value: 0 },
      uAnaPx: { value: new THREE.Vector2(0, 0) },
      uAnaRot: { value: 0 },
      uScan: { value: 1 }, uCrt: { value: 1 }, uCrtAlpha: { value: 0.1 },
      uCrtBar: { value: new THREE.Vector3(0, 0, 0) },
      uVig: { value: 1 },
    },
    vertexShader: VERT,
    fragmentShader: FRAG_FINAL,
  });
  const gradeMat = new THREE.ShaderMaterial({
    ...MAT_OPTS,
    defines: { BLUR_TAPS: tier.blurTaps },
    uniforms: {
      tSrc: { value: null },
      // uTexel is the SAME uniform object finalMat holds, so resize() updates
      // one place and both passes see it.
      uTexel: finalMat.uniforms.uTexel,
      uM1: { value: new THREE.Matrix3() },
      uM2: { value: new THREE.Matrix3() },
      uAff: { value: new THREE.Vector4(1, 0, 1, 0) },
      uBlurPx: { value: 0 },
    },
    vertexShader: VERT,
    fragmentShader: FRAG_GRADE,
  });
  const allMaterials = [copyMat, echoMat, geoMat, corruptMat, asciiMat, gradeMat, finalMat];
  // The Mesh was built with an explicit null material (three.js only substitutes
  // a default MeshBasicMaterial for `undefined`, which would leak an undisposed
  // material). Give it a real one now; drawPass swaps it per pass.
  quad.material = copyMat;

  // ── ASCII glyph atlas ─────────────────────────────────────────────────────
  // AsciilineRenderer.bakeAtlas(), verbatim: the 93 glyphs are drawn once, at
  // construction, into a 93*16 x 32 strip, white on transparent, and uploaded
  // as a texture. This is the one permitted canvas use and it never runs again.
  let atlasTex = null;
  let atlasCanvas = null;
  if (typeof document !== 'undefined' && document.createElement) {
    try {
      const c = document.createElement('canvas');
      c.width = RAMP_N * CELL_W;
      c.height = CELL_H;
      const g = c.getContext('2d');
      if (g) {
        g.clearRect(0, 0, c.width, c.height);
        g.fillStyle = '#fff';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.font = `bold ${Math.round(CELL_H * 0.78)}px ui-monospace, monospace`;
        for (let i = 0; i < RAMP_N; i++) {
          g.fillText(RAMP[i], i * CELL_W + CELL_W / 2, CELL_H / 2 + 1);
        }
        atlasCanvas = c;
        atlasTex = new THREE.CanvasTexture(c);
        // Upstream sets UNPACK_FLIP_Y_WEBGL on both the atlas and the source;
        // CanvasTexture.flipY defaults to true, which puts the glyph the right
        // way up against three.js' y-up UV, so the pair stays consistent.
        atlasTex.minFilter = THREE.LinearFilter;
        atlasTex.magFilter = THREE.LinearFilter;
        atlasTex.wrapS = THREE.ClampToEdgeWrapping;
        atlasTex.wrapT = THREE.ClampToEdgeWrapping;
        atlasTex.generateMipmaps = false;
        asciiMat.uniforms.u_atlas.value = atlasTex;
      }
    } catch {
      atlasTex = null;   // no 2D context: the ASCII deck simply stays bypassed
    }
  }

  // ── preallocated scratch (render() allocates nothing) ─────────────────────
  const sliceData = corruptMat.uniforms.uSlices.value;   // Float32Array(48)
  const accentRgb = new Float32Array(3);
  let lastAccentHex = '';                                // upstream's parse cache
  const matHue = new THREE.Matrix3();
  const matSat = new THREE.Matrix3();
  const matSepia = new THREE.Matrix3();
  const matGray = new THREE.Matrix3();
  const clearCol = new THREE.Color();
  let clockMs = 0;                 // internal clock; no window globals
  let lastSampleMs = 0;            // posterize-time sampling clock
  let holdValid = false;

  // ── helpers ───────────────────────────────────────────────────────────────
  function drawPass(material, target) {
    quad.material = material;
    renderer.setRenderTarget(target);
    renderer.render(passScene, passCam);
  }

  function clearRT(rt) {
    renderer.getClearColor(clearCol);
    const a = renderer.getClearAlpha();
    renderer.setRenderTarget(rt);
    renderer.setClearColor(0x000000, 1);
    renderer.clear(true, false, false);
    renderer.setClearColor(clearCol, a);
    renderer.setRenderTarget(null);
  }

  /** Pick whichever chain scratch is not currently being read. */
  function scratchFor(tex) {
    return ping.texture === tex ? pong : ping;
  }

  function ensureEcho() {
    if (echoA) return;
    echoA = makeRT();
    echoB = makeRT();
    clearRT(echoA);
    clearRT(echoB);
  }
  function ensureHold() {
    if (holdRT) return;
    holdRT = makeRT();
    clearRT(holdRT);
  }
  function ensureRing() {
    if (ring) return;
    ring = [];
    for (let i = 0; i < tier.ring; i++) {
      const rt = makeRT();
      clearRT(rt);
      ring.push(rt);
    }
    ringHead = 0;
  }

  clearRT(fbA);
  clearRT(fbB);

  // ── CSS/SVG colour matrices (Filter Effects spec), rebuilt each frame ─────
  function buildColourMatrices() {
    const rad = (params.hue * Math.PI) / 180;
    const c = Math.cos(rad), s = Math.sin(rad);
    matHue.set(
      0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928,
      0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.140, 0.072 - c * 0.072 - s * 0.283,
      0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072,
    );
    const sa = params.saturation / 100;
    matSat.set(
      0.213 + 0.787 * sa, 0.715 - 0.715 * sa, 0.072 - 0.072 * sa,
      0.213 - 0.213 * sa, 0.715 + 0.285 * sa, 0.072 - 0.072 * sa,
      0.213 - 0.213 * sa, 0.715 - 0.715 * sa, 0.072 + 0.928 * sa,
    );
    const tsep = 1 - params.sepia;
    matSepia.set(
      0.393 + 0.607 * tsep, 0.769 - 0.769 * tsep, 0.189 - 0.189 * tsep,
      0.349 - 0.349 * tsep, 0.686 + 0.314 * tsep, 0.168 - 0.168 * tsep,
      0.272 - 0.272 * tsep, 0.534 - 0.534 * tsep, 0.131 + 0.869 * tsep,
    );
    const gs = 1 - params.grayscale;         // grayscale(a) === saturate(1-a)
    matGray.set(
      0.213 + 0.787 * gs, 0.715 - 0.715 * gs, 0.072 - 0.072 * gs,
      0.213 - 0.213 * gs, 0.715 + 0.285 * gs, 0.072 - 0.072 * gs,
      0.213 - 0.213 * gs, 0.715 - 0.715 * gs, 0.072 + 0.928 * gs,
    );
    gradeMat.uniforms.uM1.value.copy(matSat).multiply(matHue);
    gradeMat.uniforms.uM2.value.copy(matGray).multiply(matSepia);

    // contrast(c), then brightness(b), then invert, TWO clamped affines, in
    // the CSS filter order. The spec clamps after contrast, so brightness must
    // not see the unclamped product (see the FRAG_FINAL note). invert folds
    // into brightness exactly: clamp(1 - clamp(b·x)) == clamp(1 - b·x).
    const ct = params.contrast / 100;
    let br = params.brightness / 100;
    let kb = 0;
    if (params.invert) { br = -br; kb = 1; }
    gradeMat.uniforms.uAff.value.set(ct, 0.5 - 0.5 * ct, br, kb);
  }

  // ── render ────────────────────────────────────────────────────────────────
  return {
    params,

    /**
     * Apply the enabled decks to `inputTexture` and render the result into
     * `outputTarget` (null = the screen). Allocation-free.
     */
    render(inputTexture, outputTarget, dt, io) {
      if (!inputTexture) return;
      const p = params;
      clockMs += Math.max(0, Math.min(0.05, dt || 0)) * 1000;

      // ---- audio, from io ----------------------------------------------------
      // Every read goes through aud(): see its note, an unwritten band would
      // otherwise turn powBass into NaN and blank the frame via uZoom.
      const bands = io && io.bands ? io.bands : null;
      const bass = bands ? aud(bands.bass) : 0;
      const mid = bands ? aud(bands.mid) : 0;
      const high = bands ? aud(bands.high) : 0;
      const level = io ? aud(io.level) : 0;
      const beat = io ? aud(io.beat) : 0;
      const pulse = io && io.gestures ? aud(io.gestures.pulse) : 0;

      // VideoOutput.tsx: powBass = Math.pow(audio.bass, 3). (Upstream also keeps
      // a bassSmooth EMA, but only the autopilot drop detector reads it, and
      // autopilot is not part of this rack, so it is not carried here.)
      const powBass = bass * bass * bass;

      // ---- resolved (audio-sweetened) parameter values ----------------------
      let cGlitch = p.glitch;
      let cGhost = p.rgbGhost;
      let cSplit = p.rgbSplit;
      let cWave = p.waveWarp;
      let cAnaglyph = p.anaglyph;   // [SwayCommand] rack-native, see ANAGLYPH
      let cMosaic = p.mosaic;       // [SwayCommand] rack-native, see MOSAIC
      let cBackskip = p.backskip;
      let zoomScale = 1.0;
      let isAudioStrobe = false;

      if (p.audioReactive) {
        // Bass-driven sweetening of the corruption effects. The pushed VALUES
        // are VideoOutput.tsx verbatim: max(fader, powBass * K) with K = 0.9 /
        // 0.7 / 0.5 / 0.4. [SwayCommand] only the `p.X > 0` ARM GATE is added, so a
        // deck the VJ has parked at zero stays fully off instead of autoplaying
        // with the beat.
        //
        // NOTE FOR FUTURE EDITORS: do NOT reintroduce a `* p.X` scale on the
        // pushed value. powBass * K is always < 1, so max(fader, powBass*K*fader)
        // === fader for every fader in (0,1], scaling makes this whole block a
        // no-op and silently kills the bass reactivity of four decks.
        if (p.glitch > 0) cGlitch = Math.max(cGlitch, powBass * 0.9);
        if (p.rgbGhost > 0) cGhost = Math.max(cGhost, powBass * 0.7);
        if (p.rgbSplit > 0) cSplit = Math.max(cSplit, powBass * 0.5);
        if (p.waveWarp > 0) cWave = Math.max(cWave, powBass * 0.4);
        // [SwayCommand] the two rack-native decks join the same arm-gated
        // pattern: anaglyph rides with split's 0.5, mosaic with warp's 0.4.
        if (p.anaglyph > 0) cAnaglyph = Math.max(cAnaglyph, powBass * 0.5);
        if (p.mosaic > 0) cMosaic = Math.max(cMosaic, powBass * 0.4);

        // Pulse-zoom only when feedback/geometry are actually in play.
        if (p.feedback > 0 || p.kaleidoscope || p.tiling > 1 || p.radialSpokes >= 2) {
          zoomScale = 1.0 + powBass * 0.25;
        }
        if (p.strobe > 0 && powBass > 0.5) isAudioStrobe = true;
        // [SwayCommand] upstream had no beat detector or gesture rig; SwayCommand does,
        // and a strobe deck that ignores them would feel dead on this hardware.
        if (p.strobe > 0 && (beat > 0.6 || pulse > 0.6)) isAudioStrobe = true;
        if (cBackskip > 0 && powBass > 0.8) cBackskip = Math.max(cBackskip, 0.8);
      }

      let src = inputTexture;

      // ---- TIMECODE: posterize time (frame hold) ----------------------------
      // Upstream throttles SOURCE SAMPLING to posterizeTime fps and keeps
      // drawing the last sampled frame in between, so the picture stutters
      // while the effects keep running at 60.
      if (p.posterizeTime < 60) {
        ensureHold();
        const fpsInterval = 1000 / Math.max(1, p.posterizeTime);
        if (!holdValid || clockMs - lastSampleMs >= fpsInterval) {
          copyMat.uniforms.tSrc.value = src;
          drawPass(copyMat, holdRT);
          lastSampleMs = clockMs;
          holdValid = true;
        }
        src = holdRT.texture;
      } else {
        holdValid = false;
        lastSampleMs = clockMs;
      }

      // ---- CORRUPTION: backskip (frame ring) --------------------------------
      // Upstream: backFrames = floor(backskip * (bufferSize - 1)) over a
      // 60-canvas ring. DEVIATION: the ring here is tier.ring deep (3/5/8),
      // 60 full-resolution targets is ~500 MB at 1080p. The mapping keeps its
      // shape, floor(backskip * (depth - 1)), so the fader still sweeps from
      // "now" to "as far back as the rack remembers"; the reachable jump is
      // shorter. Like upstream, the ring is only written while the deck is on.
      if (cBackskip > 0) {
        ensureRing();
        const depth = ring.length;
        copyMat.uniforms.tSrc.value = src;
        drawPass(copyMat, ring[ringHead]);
        ringHead = (ringHead + 1) % depth;
        const head = (ringHead - 1 + depth) % depth;
        const back = Math.floor(cBackskip * (depth - 1));
        src = ring[(head - back + depth) % depth].texture;
      }

      // ---- TIMECODE: echo trails --------------------------------------------
      const echoN = Math.floor(p.echoTrails);
      if (echoN >= 1) {
        ensureEcho();
        const a = 1 / (echoN + 1);
        const gain = 1 - Math.pow(1 - a, echoN + 1);   // base in [0,1]: safe
        echoMat.uniforms.tSrc.value = src;
        echoMat.uniforms.tAcc.value = echoA.texture;
        echoMat.uniforms.uAlpha.value = a;
        echoMat.uniforms.uAlphaGain.value = a * gain;
        drawPass(echoMat, echoB);
        const swap = echoA; echoA = echoB; echoB = swap;
        src = echoA.texture;
      }

      // ---- GEOMETRICS + feedback wash ---------------------------------------
      // `params` is documented as directly mutable, so a UI can put a NaN in
      // p.tiling without going through setParam. Both guards below are written
      // as comparisons rather than Math.max, because Math.max(1, NaN) is NaN
      // and NaN in uTiles/uZoom blanks the frame.
      const tiles = p.tiling > 1 ? Math.min(8, Math.floor(p.tiling)) : 1;
      const pixScale = 1.0 - p.pixelate * 0.96;        // 1.0 down to 0.04
      const needGeo =
        p.feedback > 0 || tiles > 1 || p.kaleidoscope || p.mirrorX || p.mirrorY ||
        p.softEdges || p.pixelate > 0 || p.mosaic > 0 || zoomScale !== 1.0;
      if (needGeo) {
        const gu = geoMat.uniforms;
        gu.tSrc.value = src;
        gu.tPrev.value = fbA.texture;
        gu.uZoom.value = zoomScale > 1e-3 ? zoomScale : 1;
        gu.uTiles.value = tiles;
        gu.uKaleido.value = p.kaleidoscope ? 1 : 0;
        gu.uMirror.value.set(p.mirrorX ? 1 : 0, p.mirrorY ? 1 : 0);
        gu.uSoft.value = p.softEdges ? 1 : 0;
        if (p.pixelate > 0) {
          gu.uPixCells.value.set(
            Math.max(4, Math.floor(W * pixScale)),
            Math.max(4, Math.floor(H * pixScale)),
          );
        } else {
          gu.uPixCells.value.set(0, 0);
        }
        // [SwayCommand] mosaic: square tiles ramp 4..64 px with the (bass-
        // sweetened) fader; grout is 1..2 px a side, tint a subtle ±8%.
        if (p.mosaic > 0) {
          const mosCellPx = 4 + cMosaic * 60;
          gu.uMosCells.value.set(
            Math.max(2, Math.floor(W / mosCellPx)),
            Math.max(2, Math.floor(H / mosCellPx)),
          );
          gu.uMosGrout.value = (1 + cMosaic) / mosCellPx;
          gu.uMosTint.value = 0.16;
        } else {
          gu.uMosCells.value.set(0, 0);
        }
        gu.uFbGeo.value = 1 - 0.95 * p.feedback;
        gu.uFbPrev.value = 0.95 * p.feedback * p.feedback;
        drawPass(geoMat, fbB);
        const swap = fbA; fbA = fbB; fbB = swap;
        src = fbA.texture;
      }

      // ---- CORRUPTION: radial wheel, glitch slices, ghost, strobe -----------
      const spokes = Math.round(p.radialSpokes);

      // Slice draw, VideoOutput.tsx verbatim, the randomness is redrawn every
      // frame exactly as upstream does, into a preallocated array.
      let sliceCount = 0;
      if (cGlitch > 0 && Math.random() < cGlitch) {
        sliceCount = Math.min(MAX_SLICES, Math.floor(Math.random() * 12 * cGlitch) + 1);
        for (let i = 0; i < sliceCount; i++) {
          const o = i * 4;
          sliceData[o] = Math.random() * H;                              // srcY
          sliceData[o + 1] = (Math.random() * 0.3 + 0.02) * H;           // sliceH
          sliceData[o + 2] = (Math.random() - 0.5) * W * cGlitch * 2.5;  // shiftX
          sliceData[o + 3] = 0;
        }
      }

      let strobeOn = false;
      if (p.strobe > 0) {
        if (p.audioReactive) {
          strobeOn = isAudioStrobe;
        } else {
          const freq = p.strobe * 20 + 1;
          const period = 1000 / freq;                    // freq >= 1: safe
          strobeOn = clockMs % period > period * 0.5;
        }
      }

      const needCorrupt = spokes >= 2 || sliceCount > 0 || cGhost > 0 || strobeOn;
      if (needCorrupt) {
        const cu = corruptMat.uniforms;
        cu.tSrc.value = src;
        cu.uSpokes.value = spokes >= 2 ? spokes : 0;
        // Upstream: baseRotation = (timestamp/1000)*0.15, plus (mid+high)*PI
        // when reactive. SwayCommand holds the wheel still, nothing in the
        // rack auto-rotates (user rule), so the spoke pattern is static and
        // only the spoke count moves.
        const baseRotation = 0;
        cu.uSpokeRot.value = baseRotation;
        cu.uSliceCount.value = sliceCount;
        cu.uGhost.value = cGhost;
        cu.uGhostShift.value.set(cGhost * W * 0.08, cGhost * H * 0.02);
        cu.uStrobe.value = strobeOn ? 1 : 0;
        // upstream picks black when the colour deck's invert toggle is on
        cu.uStrobeCol.value.setScalar(p.invert ? 0 : 1);
        const dst = scratchFor(src);
        drawPass(corruptMat, dst);
        src = dst.texture;
      }

      // ---- ASCII ------------------------------------------------------------
      if (p.ascii && atlasTex) {
        const au = asciiMat.uniforms;
        const cols = Math.max(8, Math.round(p.asciiCols));
        const rows = Math.max(2, Math.round(GLYPH_ASPECT * cols * (H / W)));
        au.u_grid.value.set(cols, rows);
        au.u_source.value = src;
        au.u_mono.value = p.asciiMono ? 1 : 0;
        // [SwayCommand] the mono accent is the one colour this rack injects rather
        // than grades, so it is the one place io.palette can drive it. With
        // asciiPalette off it falls back to the upstream constant #00ff41.
        if (p.asciiPalette && io && io.palette && io.palette[4]) {
          au.u_accent.value.copy(io.palette[4]);
        } else {
          if (p.asciiAccent !== lastAccentHex) {
            lastAccentHex = p.asciiAccent;
            hexToRgb(p.asciiAccent, accentRgb);
          }
          au.u_accent.value.setRGB(accentRgb[0], accentRgb[1], accentRgb[2]);
        }
        au.u_bass.value = bass;      // aud() already clamped these to 0..1
        au.u_volume.value = level;
        const dst = scratchFor(src);
        drawPass(asciiMat, dst);
        src = dst.texture;
      }

      // ---- CHROMATICS pass 1: colour grade + blur ---------------------------
      // Its own pass so the edge/warp/split taps below do not each re-run it;
      // see PASS SPLIT above. Always runs, it is also the only writer of
      // gradeRT, so no ping-pong is needed.
      buildColourMatrices();
      gradeMat.uniforms.tSrc.value = src;
      gradeMat.uniforms.uBlurPx.value = p.blur * 20;
      drawPass(gradeMat, gradeRT);

      // ---- CHROMATICS pass 2: optics + overlays (writes the output) ---------
      const fu = finalMat.uniforms;
      fu.tSrc.value = gradeRT.texture;
      fu.uEdge.value = p.edgeDetect ? 1 : 0;
      fu.uWarpScale.value = cWave > 0 ? cWave * 150 : 0;
      fu.uWarpFreq.value = 0.01 + cWave * 0.04;
      fu.uSplitPx.value.set(cSplit * 100, 0);
      fu.uChromaPx.value.set(p.chromaAb * 20, p.chromaAb * 15);
      fu.uChromaRadial.value = p.chromaAbRadial ? 1 : 0;
      // [SwayCommand] anaglyph drive: (x,y) parallax in canvas px at full
      // depth, plus the counter-rotation, cubic so it only wakes near 1.
      fu.uAnaPx.value.set(cAnaglyph * 30, cAnaglyph * 10);
      fu.uAnaRot.value = cAnaglyph * cAnaglyph * cAnaglyph * 0.05;
      fu.uScan.value = p.scanlines ? 1 : 0;
      fu.uCrt.value = p.crt ? 1 : 0;
      fu.uVig.value = p.vignette ? 1 : 0;
      if (p.crt) {
        // @keyframes crt 0.15s: opacity 0.8 -> 1 -> 0.8, over rgba(0,0,0,0.1)
        const ph = (clockMs % 150) / 150;
        const tri = ph < 0.5 ? ph * 2 : (1 - ph) * 2;
        const eased = tri * tri * (3 - 2 * tri);        // stands in for CSS `ease`
        fu.uCrtAlpha.value = 0.1 * (0.8 + 0.2 * eased);
        if (Math.random() > 0.5) {
          const barH = Math.random() * 20 + 5;
          fu.uCrtBar.value.set(Math.random() * Math.max(0, H - barH), barH, 1);
        } else {
          fu.uCrtBar.value.z = 0;
        }
      }
      drawPass(finalMat, outputTarget || null);
      // Always hand the renderer back unbound, so a caller that renders again
      // without setting a target does not silently draw into one of ours.
      renderer.setRenderTarget(null);
    },

    /** Clamped assignment. Unknown keys are ignored. */
    setParam(key, value) {
      const r = RANGES[key];
      if (r === undefined) return;
      if (r === true) {
        params[key] = !!value;
      } else if (r === 'hex') {
        const s = String(value);
        params[key] = /^#?[0-9a-f]{6}$/i.test(s.trim())
          ? (s.trim()[0] === '#' ? s.trim() : `#${s.trim()}`)
          : DEFAULTS[key];
      } else {
        const n = Number(value);
        params[key] = !isFinite(n) ? DEFAULTS[key] : Math.min(r[1], Math.max(r[0], n));
      }
    },

    /** Restore every parameter to its upstream default / neutral value. */
    reset() {
      for (const k in DEFAULTS) params[k] = DEFAULTS[k];
      lastAccentHex = '';
      holdValid = false;
      lastSampleMs = clockMs;
      ringHead = 0;
      clearRT(fbA);
      clearRT(fbB);
      if (echoA) { clearRT(echoA); clearRT(echoB); }
      if (holdRT) clearRT(holdRT);
      if (ring) for (let i = 0; i < ring.length; i++) clearRT(ring[i]);
    },

    resize(w, h) {
      W = Math.max(1, Math.floor(w) || 1);
      H = Math.max(1, Math.floor(h) || 1);
      for (let i = 0; i < allTargets.length; i++) allTargets[i].setSize(W, H);
      corruptMat.uniforms.uRes.value.set(W, H);
      finalMat.uniforms.uRes.value.set(W, H);
      finalMat.uniforms.uTexel.value.set(1 / W, 1 / H);
      // the persistent buffers lose their contents on a resize; start clean
      clearRT(fbA);
      clearRT(fbB);
      if (echoA) { clearRT(echoA); clearRT(echoB); }
      if (holdRT) clearRT(holdRT);
      if (ring) for (let i = 0; i < ring.length; i++) clearRT(ring[i]);
      holdValid = false;
      ringHead = 0;
    },

    dispose() {
      for (let i = 0; i < allTargets.length; i++) allTargets[i].dispose();
      allTargets.length = 0;
      ping = pong = fbA = fbB = gradeRT = null;
      echoA = echoB = holdRT = null;
      ring = null;
      // Drop every texture reference the uniforms still hold before disposing
      // the materials, so nothing keeps a freed GPU object reachable.
      copyMat.uniforms.tSrc.value = null;
      gradeMat.uniforms.tSrc.value = null;
      echoMat.uniforms.tSrc.value = null;
      echoMat.uniforms.tAcc.value = null;
      geoMat.uniforms.tSrc.value = null;
      geoMat.uniforms.tPrev.value = null;
      corruptMat.uniforms.tSrc.value = null;
      asciiMat.uniforms.u_source.value = null;
      asciiMat.uniforms.u_atlas.value = null;
      finalMat.uniforms.tSrc.value = null;
      for (let i = 0; i < allMaterials.length; i++) allMaterials[i].dispose();
      quadGeo.dispose();
      quad.material = null;
      passScene.remove(quad);
      if (atlasTex) { atlasTex.dispose(); atlasTex = null; }
      if (atlasCanvas) { atlasCanvas.width = 0; atlasCanvas.height = 0; atlasCanvas = null; }
    },
  };
}

