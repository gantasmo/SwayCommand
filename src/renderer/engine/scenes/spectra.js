// Spectra, the VJ-9000 audio-reactive spectrum terrain.
//
// ===========================================================================
// PORT / LICENSING HEADER
// ---------------------------------------------------------------------------
// Ported from: GANTASMO VJ-9000, `src/spectra/SpectraRenderer.ts` (itself the
// framework-free port of SPECTRA-RIDER, a React-Three-Fiber audio
// spectrogram-terrain visualiser).
// Upstream project: GANTASMO VJ-9000. The upstream repository carries NO
// LICENSE file; it is the work of this project's author and is used here as
// the author's own work.
//
// Reproduced VERBATIM from SpectraRenderer.ts:
//   * the terrain vertex shader (mel history sample, noise gate, centre
//     smoothing, ring-buffer edge flatten, z displacement 5.0 + energy*5.0);
//   * the terrain fragment shader, the inline INFERNO colormap polynomial
//     (Matt Zucker's 7-term fit) coefficient for coefficient, the theme `heat`
//     ramp, the in-shader `terrainH` height reconstruction, the 4-tap normal,
//     nScale 7.0, light dir (0.35,0.45,0.82), spec pow 28.0, light
//     0.72 + 0.55*diff + 0.7*spec, and the edge/depth alpha fades;
//   * the curved wall vertex shader (theta = x/R, z += R*(1-cos), x = R*sin)
//     and its `getPalette` four-segment ramp, edge fades, 0.45 / 0.25 gains;
//   * the particle vertex/fragment shaders (drift, energy inflation,
//     8.0*aScale/(-mvz) point size, alpha 0.06 + energy*0.18, round sprite
//     mask, mix toward (0.7,0.9,1.0) by energy*0.25);
//   * the mel resampling, 2595*log10(1+hz/700), 40 Hz .. min(9000, nyquist),
//     eq = 0.85 + pct*0.55, pow(.., 1.15), the EMA (default 0.65), the
//     30-band `energy` tracker and its 0.15 display lerp;
//   * all SEVEN themes (hex for hex) and all FIVE camera modes with their
//     upstream radii, heights, look targets, steer rates, damping and clamps
//     (less their self-advancing orbit / bob / slide terms, item 10);
//   * the world-group sway block (its translations; the rotations are out,
//     item 10) and the geometry layout (50x50 terrain at y=-2, walls
//     1000x320 at x=+/-280 in a group at y=45, FOV 55).
//
// ADAPTED (see the inline notes marked "SwayCommand"):
//   1. AUDIO. Upstream takes a live FFT of any width when the host supplies
//      one (`getSpectrum()`), and otherwise synthesizes a SPECTRUM_SIZE-wide
//      (256-bin) stand-in into its own `synthBins`. SwayCommand scenes get only
//      io.bands.bass/mid/high + io.level, so the synthesis branch is the only
//      branch: a 256-bin source spectrum, upstream's own fallback width, so
//      the mel resampler's `srcLen` arithmetic stays literally upstream's, is
//      SYNTHESIZED every frame (see synthSpectrum) and then fed through the
//      verbatim mel/EMA chain. Only the CONTENT of those 256 bins differs from
//      upstream; every consumer of them is unchanged. This is the one place
//      the port cannot be literal, full note at synthSpectrum().
//   2. GLSL. Upstream is GLSL1 (three.js ShaderMaterial: `varying`,
//      `texture2D`, `gl_FragColor`). This file is GLSL3 (GLSL ES 3.00): all
//      three ShaderMaterials set `glslVersion: THREE.GLSL3`, `attribute` /
//      `varying` are `in` / `out`, `texture2D` is `texture`, and each fragment
//      shader writes a declared `out vec4 fragColor`; three.js supplies the
//      `#version` and precision headers. The maths are upstream's unchanged.
//      There are no loops in any of the three shaders, so no bounds to make
//      constant. Added guards: `max(-mvPosition.z, 0.25)` and `min(.., 64.0)`
//      around the point-size divide (NaN and fill-rate respectively) and
//      `max(..,0.0)` on the pow base in the mel chain.
//   3. NO POST. Upstream stacks an UnrealBloomPass; SwayCommand owns compositing,
//      so the wall and particle emissive terms carry a BLOOM_GAIN lift to
//      stand in for the missing bloom.
//   4. NO DOM. Upstream scrolls the wall spectrogram on a 2048x512 2-D canvas
//      via drawImage. Replaced with a DataTexture ring buffer + a scroll
//      offset uniform (one column written per frame instead of a full blit).
//   5. NO KEYBOARD. Upstream steers Canyon Flight / Free Flight with WASD.
//      Here io.xy is the stick; the rest of the rig is upstream's.
//   6. NO BACKGROUND / FOG. Upstream sets scene.background and a THREE.Fog to
//      the theme's bgFogColor. The engine clears each target to black and the
//      contract forbids full-screen fills, so the background is dropped; the
//      fog was already inert upstream (ShaderMaterial defaults fog:false, and
//      no shader there includes the fog chunks).
//   7. PALETTE. inferno + the seven themes stay the authentic look; an
//      additive io.palette emissive term rides on top, full note at PAL_GLSL.
//   8. Cold-start prefill of the history grid, tier-scaled mesh/texture sizes,
//      a livelier default scroll rate, and mel tables precomputed once
//      (identical arithmetic, just hoisted out of the per-frame loop).
//   9. SWAY / STRIKE. Upstream has no gesture surface. Sway is a LAYOUT
//      morph: it glides the analyzer between arrangements, the frequency
//      axis re-warps (log <-> lin), the mirror re-folds (one pair -> a
//      multi-fold comb) and the plane blooms into a radial burst, via three
//      uniforms the height math mixes in (u_axisWarp / u_fold / u_radial;
//      0 / 1 / 0 reproduce the upstream layout exactly). A STRIKE (io.strike
//      on a pad rising edge) is a spectral slam: a full-band impulse enters
//      the synthesized SOURCE spectrum, so it rides upstream's own mel / EMA /
//      energy machinery through the terrain, the wall ring and the flight
//      height field before scrolling away with the history, and the layout
//      SEED jumps, the arrangement sway morphs toward steps to the next
//      LAYOUT_SEEDS entry, the way the Quantum Lattice steps geometries.
//  10. NO AUTONOMOUS ROTATION (project rule: nothing auto-rotates in any
//      scene). Upstream's Dynamic Orbit and Bird's Eye cameras advanced their
//      orbit angle by themselves (t*0.18 / t*0.25 behind an auto-rotate flag
//      on pad 7), Dynamic Orbit bobbed its height on sin(t*0.3), Deep Horizon
//      slid its eye on sin(t*0.3), and the world-group sway block rocked the
//      whole world on three sin/cos(t) rotations. Every one of those
//      self-advancing terms is removed: the orbit angles rest at the upstream
//      non-rotating values (0.6 / 0) and move only with the io.xy stick, the
//      world-group rotation holds at zero, and pad 7 is a pure slam like pad
//      15. Kept: io.xy steering in every mode, Free Flight's hand-integrated
//      yaw / pitch and forward travel, Canyon Flight's hand-driven bank, the
//      energy-driven radius / height / world-position terms, the world
//      group's lateral slide (a translation, not a turn), the terrain scroll
//      and the particle drift.
// ===========================================================================
//
// The mechanism: a 256x256 scrolling spectrogram history lives in a RedFormat
// DataTexture. A 50x50 plane samples it in the vertex shader and displaces
// upward by magnitude, so the terrain IS the spectrogram, frequency mirrored
// left/right about the centre line, time running away from the camera. Two
// curved walls carry the same spectrum as a distant backdrop, and a 1200-point
// additive particle field floats above it. Pads pick the theme (0-6) and the
// camera mode (8-12), and every strike slams a full-band impulse through the
// display while the layout seed jumps; io.xy steers whichever camera is live,
// press compresses the relief, sway morphs the layout itself, axis warp,
// fold count, radial bloom, shear, the beat pulses the particles, and
// knobs 3-7 give scroll speed, height, particle amount, wall curvature and
// spectrum smoothing. Follows docs/SCENE_CONTRACT.md; reference style: warp.js.

export const meta = { id: 'spectra', name: 'Spectra', mood: 'spectral' };

// --- upstream constants (SpectraRenderer.ts) -------------------------------
const SPECTRUM_SIZE = 256; // mel bins per history column   (upstream 256)
const HISTORY_SIZE = 256;  // history rows in the ring      (upstream 256)
const FOV = 55;            // upstream camera FOV
const PADS = 16;

// SwayCommand: the synthesized stand-in for upstream's live analyser buffer.
// Width is upstream's own: its fallback fills `synthBins = new Uint8Array(
// SPECTRUM_SIZE)` and fillColumn then resamples with `srcLen = src.length`, so
// SRC_BINS === SPECTRUM_SIZE makes targetIndex, lowBin/highBin, the fraction
// and the ripple's `p` bit-for-bit upstream's rather than a half-resolution
// approximation of them. NYQUIST matches the 22050 the mel mapping assumes, so
// bin i sits at i/(SRC_BINS-1) * 22050 Hz, and the 40 Hz .. 9 kHz mel window
// therefore reads source bins 2 .. 104 exactly as upstream does.
const SRC_BINS = SPECTRUM_SIZE;
const NYQUIST = 22050;

// Upstream settings defaults (SPECTRA_SETTINGS_DEFAULT). sensitivity, noiseGate
// and energyImpact stay at their defaults; heightMulti and smoothing are on
// knobs 4 and 7.
const SENSITIVITY = 1.0;
const NOISE_GATE = 0.06;
const ENERGY_IMPACT = 1.0;

// Upstream SCROLL_ROWS_PER_SEC is 2.0, a 128 s sweep of the 256-row history,
// chosen there because the renderer runs continuously behind a whole set.
// SwayCommand shows a scene for 18-40 s at a time, so knob 3 centres on 6 rows/s
// (a 43 s sweep) and spans 1.5 .. 24; upstream's 2.0 sits at knob 3 ~= 0.10.
const SCROLL_ROWS_MID = 6.0;

// Upstream wall canvas noise floor and alpha curve (drawWallColumn).
const WALL_FLOOR = 0.08;

// Stands in for the UnrealBloomPass upstream runs at strength 0.9, the wall
// and particle layers are authored dim on the assumption that bloom lifts them.
const BLOOM_GAIN = 2.2;

// --- SwayCommand layout morph / strike ---------------------------------------
// Sway glides the analyzer between arrangements instead of merely shearing
// it. The morph is staged along the sway travel, the frequency axis re-warps
// first, then the field re-folds, then the plane blooms radial, so the
// restructure reads as one continuous gesture; every channel rests at exactly
// the upstream layout when sway is 0.
const TAU_SWAY = 1.5;   // sway smoothing, seconds, the layout glides, never snaps
const TAU_LAYOUT = 0.6; // per-channel glide toward the seeded arrangement
const SLAM_TAU = 0.30;  // strike impulse decay, seconds

// The arrangements a strike seeds, sway morphs the resting layout toward the
// active entry, and a strike steps the index (the Quantum Lattice convention).
// fold: extra triangle folds of the frequency axis beyond the upstream
// mirrored pair; warp: log/lin re-map depth (negative crushes toward linear);
// radial: plane -> radial burst; skew: shear direction and weight.
const LAYOUT_SEEDS = [
  { fold: 1.6, warp: 0.9, radial: 1.0, skew: 1.0 },    // mirrored pair -> radial burst
  { fold: 3.2, warp: 0.4, radial: 0.7, skew: -1.0 },   // dense comb, half bloom
  { fold: 0.0, warp: 1.0, radial: 1.0, skew: 0.6 },    // pure log stretch -> full burst
  { fold: 2.2, warp: -0.6, radial: 0.35, skew: -0.5 }, // lin-crushed folded fan
];

// The seven upstream themes, hex for hex (SPECTRA_THEMES). `grid` and `bg` are
// carried for completeness: upstream binds gridColor to a uniform no shader
// declares, and bgFogColor drives scene.background/fog, both dropped here.
const THEMES = [
  { id: 'mel-spectrogram', name: 'Spectrogram',   low: 0x000004, mid: 0x932667, high: 0xed6925, peak: 0xfcffa4, grid: 0xbb3754, bg: 0x000004, inferno: true },
  { id: 'deep-space',      name: 'Deep Cosmos',   low: 0x050114, mid: 0x1a004a, high: 0xd10073, peak: 0x00e1ff, grid: 0x4f1ab3, bg: 0x020008, inferno: false },
  { id: 'emerald-grid',    name: 'Emerald Tech',  low: 0x010f08, mid: 0x004a25, high: 0x00e575, peak: 0xffffff, grid: 0x007542, bg: 0x000804, inferno: false },
  { id: 'solar-flare',     name: 'Solar Inferno', low: 0x0f0200, mid: 0x5c0c00, high: 0xff3700, peak: 0xffea00, grid: 0x961100, bg: 0x0a0100, inferno: false },
  { id: 'ice-glace',       name: 'Polar Glace',   low: 0x000714, mid: 0x02184d, high: 0x0084ff, peak: 0xd0f0ff, grid: 0x0a3399, bg: 0x00040a, inferno: false },
  { id: 'cyber-horizon',   name: 'Cyber Horizon', low: 0x0c001a, mid: 0xff00aa, high: 0x7b00ff, peak: 0x00ffff, grid: 0xbc00dd, bg: 0x07000d, inferno: false },
  { id: 'carbon',          name: 'Carbon Steel',  low: 0x050505, mid: 0x242426, high: 0x787880, peak: 0xffffff, grid: 0x3a3a3c, bg: 0x050505, inferno: false },
];

// Upstream SPECTRA_MODES, in upstream order, pads 8..12 map straight onto it.
const MODES = ['dynamic', 'flight', 'overhead', 'horizon', 'freecam'];
const M_DYNAMIC = 0;
const M_FLIGHT = 1;
const M_OVERHEAD = 2;
const M_HORIZON = 3;
const M_FREECAM = 4;

// --- shared GLSL -----------------------------------------------------------

// SwayCommand palette reconciliation. The scene keeps inferno and the seven themes
// as its authentic colour identity, replacing them would destroy the port,
// so the engine palette enters as an ADDITIVE emissive term layered on the
// ridges, the wall and the particles rather than as the base ramp. The palette
// therefore never mutes the spectrogram look, but every ColorMaster crossfade
// and every degree of knob-0 hue rotation is visible in the frame: peaks and
// specular glints carry palette hue, particles are mixed 55% toward palette
// entries, and the wall gets a palette wash. Same wrap-around lerp helper as
// warp.js / cymatic.js, constant-index only (a fragment-shader restriction of
// GLSL ES 1.00 that GLSL3 lifts; the helper is kept as is).
const PAL_GLSL = /* glsl */ `
  uniform vec3 uColors[5];

  vec3 pal(float t) {
    vec3 c = mix(uColors[0], uColors[1], clamp(t, 0.0, 1.0));
    c = mix(c, uColors[2], clamp(t - 1.0, 0.0, 1.0));
    c = mix(c, uColors[3], clamp(t - 2.0, 0.0, 1.0));
    c = mix(c, uColors[4], clamp(t - 3.0, 0.0, 1.0));
    return mix(c, uColors[0], clamp(t - 4.0, 0.0, 1.0));
  }
`;

export function createScene(ctx) {
  const { THREE, quality } = ctx;
  const tier = quality.tier;

  const scene = new THREE.Scene();
  // Upstream: PerspectiveCamera(FOV, w/h, 0.1, 1000) at (0, 4, 18). The far
  // plane has to clear the curved walls, which sit ~600 units out.
  const camera = new THREE.PerspectiveCamera(FOV, ctx.width / Math.max(1, ctx.height), 0.1, 1000);
  camera.position.set(0, 4, 18);

  // --- quality ladder ------------------------------------------------------
  // Upstream targets a discrete GPU at 1280x720 with TERRAIN_SEGS = 384
  // (295k triangles, 148k vertices, one vertex texture fetch each). That is
  // the single dominant cost, so it is what scales:
  //   low  96 segs ->  18,432 tris /  9,409 verts
  //   med 160 segs ->  51,200 tris / 25,921 verts
  //   high 256 segs -> 131,072 tris / 66,049 verts
  const TERRAIN_SEGS = tier === 'high' ? 256 : tier === 'low' ? 96 : 160;
  // Wall tessellation only has to keep the curve smooth (upstream 128 x 64).
  const WALL_SX = tier === 'high' ? 128 : tier === 'low' ? 64 : 96;
  const WALL_SY = tier === 'high' ? 64 : tier === 'low' ? 24 : 32;
  // Wall spectrogram ring buffer: columns of history x frequency rows.
  // Upstream's canvas is 2048x512 but only every 2nd row is drawn, so 256
  // distinct frequency rows; the ring is re-uploaded whole each frame, hence
  // the smaller sizes here.
  const WALL_W = tier === 'high' ? 640 : tier === 'low' ? 256 : 448;
  const WALL_H = tier === 'high' ? 224 : tier === 'low' ? 96 : 160;
  // Upstream PARTICLE_COUNT is 1200, exactly quality.particles / 25 at med.
  const PARTICLE_COUNT = Math.max(400, Math.min(3200, Math.round(quality.particles / 25)));

  // --- palette uniforms: five preallocated colors, .copy()'d every frame ----
  const palette = [
    new THREE.Color(), new THREE.Color(), new THREE.Color(),
    new THREE.Color(), new THREE.Color(),
  ];

  // =========================================================================
  // AUDIO, synthesized source spectrum, then upstream's mel chain verbatim
  // =========================================================================

  // The scrolling spectrogram history (RedFormat source for the DataTexture),
  // and the per-bin EMA state the mel mapping writes through. Both upstream.
  const dataArray = new Uint8Array(SPECTRUM_SIZE * HISTORY_SIZE);
  const smoothed = new Float32Array(SPECTRUM_SIZE);
  const synthBins = new Uint8Array(SRC_BINS);
  let currentRow = 0;
  let rowAccum = 0;
  let energy = 0;

  // --- per-bin synthesis tables, built once ---------------------------------
  const wBass = new Float32Array(SRC_BINS);
  const wMid = new Float32Array(SRC_BINS);
  const wHigh = new Float32Array(SRC_BINS);
  const binRipple = new Float32Array(SRC_BINS);
  const binRate = new Float32Array(SRC_BINS);
  const binPhase = new Float32Array(SRC_BINS);

  const hzToMel = (hz) => 2595 * Math.log10(1 + hz / 700); // upstream, verbatim
  const melToHz = (mel) => 700 * (Math.pow(10, mel / 2595) - 1); // upstream
  const smooth01 = (x) => {
    const c = x < 0 ? 0 : x > 1 ? 1 : x;
    return c * c * (3 - 2 * c);
  };

  {
    // Band centres as real frequencies, inside the engine's own analysis
    // ranges (audio.js: bass 20-250 Hz, mid 250-2000 Hz, high 2000-9000 Hz).
    // Placing them in Hz rather than at fractions of the array is deliberate:
    // the mel resampler below only reads 40 Hz .. 9 kHz, i.e. source bins
    // 2..104 of 256, so a spectrum laid out by array fraction (as upstream's
    // own coarse fallback does) would hide the high band entirely.
    const mB = hzToMel(90);
    const mM = hzToMel(900);
    const mH = hzToMel(5000);
    for (let i = 0; i < SRC_BINS; i++) {
      const f = (i / (SRC_BINS - 1)) * NYQUIST;
      const m = hzToMel(f);
      let b = 0;
      let mm = 0;
      let h = 0;
      if (m <= mB) {
        b = 1;
      } else if (m < mM) {
        const s = smooth01((m - mB) / (mM - mB));
        b = 1 - s;
        mm = s;
      } else if (m < mH) {
        const s = smooth01((m - mM) / (mH - mM));
        mm = 1 - s;
        h = s;
      } else {
        // Real programme material rolls off above the presence band, but not
        // to nothing: 700 mels of decay leaves ~42% of the treble at 9 kHz
        // (where the mel window ends) and ~24% at 13 kHz. That tail matters,
        // the curved wall reads the SOURCE bins linearly across 0..22 kHz and
        // its visible band (after the upstream edgeY fade) lands at roughly
        // 4-13 kHz, so a hard roll-off would leave the wall black.
        h = Math.exp(-(m - mH) / 700);
      }
      const lowRoll = smooth01(f / 70); // sub-bass rolls off toward DC
      wBass[i] = b * lowRoll;
      wMid[i] = mm;
      wHigh[i] = h;
      // upstream's own fallback ripple, verbatim: 0.7 + 0.3 * sin(p * 9)
      const p = i / (SRC_BINS - 1);
      binRipple[i] = 0.7 + 0.3 * Math.sin(p * 9);
      // deterministic per-bin shimmer (seeded hash -> fixed rate + phase), so
      // neighbouring bins breathe out of step the way real FFT bins do
      const h1 = Math.sin(i * 12.9898) * 43758.5453;
      const h2 = Math.sin(i * 78.233 + 1.7) * 43758.5453;
      binPhase[i] = (h1 - Math.floor(h1)) * 6.2831853;
      binRate[i] = 1.4 + (h2 - Math.floor(h2)) * 5.2;
    }
  }

  /**
   * SwayCommand ADAPTATION, THE ONE PLACE THIS PORT CANNOT BE LITERAL.
   *
   * Upstream reads a live FFT (`getSpectrum()`), falling back to a
   * three-plateau synthesis from bass/mid/high across SPECTRUM_SIZE bins only
   * when the host offers no spectrum. SwayCommand scenes NEVER receive a spectrum
   * (io carries three band scalars and io.level) so the fallback path is the
   * only path, and upstream's version of it (a hard step at p<0.18 / p<0.5
   * plus the ripple 0.7 + 0.3*sin(p*9)) reads as three flat mesas.
   *
   * So: the three bands are interpolated smoothly across their frequency
   * centres in MEL space (weights precomputed above), upstream's ripple is
   * kept verbatim on top, and a deterministic per-bin shimmer, one sine per
   * bin, fixed seeded rate and phase, driven by the scene clock, breaks the
   * remaining flatness into spectrogram-like grain. A strike's slam impulse
   * is added FULL-BAND on top, so the hit enters every consumer of the
   * spectrum at once, terrain, wall ring, energy tracker, flight height
   * field, and then scrolls away with the history as a rippling ridge. The
   * result is written in place into the preallocated `synthBins`; nothing is
   * allocated.
   *
   * Everything downstream of this function, the mel resampling, the EMA, the
   * energy tracker, both textures, every shader, is upstream's, unchanged.
   */
  function synthSpectrum(tSec, bass, mid, high) {
    // SwayCommand: upstream reads a real analyser whose noise floor keeps the
    // terrain lit even between transients. Three smoothed bands have no such
    // floor, so a quiet passage synthesized to near zero and the inferno ramp
    // (which begins at 0x000004) rendered the whole field black. A small
    // animated floor restores the standing relief without masking dynamics.
    const floor = 0.10 + 0.05 * (0.5 + 0.5 * Math.sin(tSec * 0.37));
    for (let i = 0; i < SRC_BINS; i++) {
      let v = bass * wBass[i] + mid * wMid[i] + high * wHigh[i];
      v *= binRipple[i];
      v *= 0.72 + 0.28 * (0.5 + 0.5 * Math.sin(tSec * binRate[i] + binPhase[i]));
      v = floor * binRipple[i] + v * (1 - floor);
      // SwayCommand: the spectral slam, a full-band strike impulse, textured
      // by the upstream ripple so the ridge still reads as spectrum.
      v += slam * 0.9 * (0.7 + 0.3 * binRipple[i]);
      v *= 255;
      synthBins[i] = v > 255 ? 255 : v < 0 ? 0 : v | 0;
    }
  }

  // --- mel resampling tables (upstream fillColumn, hoisted) -----------------
  // Upstream recomputes hzToMel/melToHz per bin per column. The inputs are
  // constant, so the identical values are computed once here; the per-frame
  // loop below is arithmetically the same as upstream's.
  const melLow = new Int32Array(SPECTRUM_SIZE);
  const melHigh = new Int32Array(SPECTRUM_SIZE);
  const melFrac = new Float32Array(SPECTRUM_SIZE);
  const melEq = new Float32Array(SPECTRUM_SIZE);
  {
    const minHz = 40;
    const maxHz = Math.min(9000, NYQUIST);
    const minMel = hzToMel(minHz);
    const maxMel = hzToMel(maxHz);
    for (let i = 0; i < SPECTRUM_SIZE; i++) {
      const pct = i / (SPECTRUM_SIZE - 1);
      const targetHz = melToHz(minMel + pct * (maxMel - minMel));
      const targetIndex = Math.max(2, (targetHz / NYQUIST) * (SRC_BINS - 1));
      const lowBin = Math.floor(targetIndex);
      melLow[i] = lowBin;
      melHigh[i] = Math.min(SRC_BINS - 1, Math.ceil(targetIndex));
      melFrac[i] = targetIndex - lowBin;
      melEq[i] = 0.85 + pct * 0.55; // upstream tilt, verbatim
    }
  }

  /** Fill spectrogram column `row` from the synthesized spectrum, EMA-smoothed.
   *  Upstream SpectraRenderer.fillColumn, verbatim past the source fetch. */
  function fillColumn(row, ema) {
    const offset = row * SPECTRUM_SIZE;
    let sum = 0;
    const trackingBands = 30;
    for (let i = 0; i < SPECTRUM_SIZE; i++) {
      const lowBin = melLow[i];
      const highBin = melHigh[i];
      let val = synthBins[lowBin];
      if (highBin !== lowBin) {
        const f = melFrac[i];
        val = val * (1 - f) + synthBins[highBin] * f;
      }
      // guard the pow base: negative would be NaN and blank the column
      const base = Math.max(0, (val / 255) * SENSITIVITY * melEq[i]);
      const normalized = Math.pow(base, 1.15);
      const finalVal = Math.min(255, normalized * 255);
      smoothed[i] = smoothed[i] * ema + finalVal * (1 - ema);
      const out = Math.min(255, Math.round(smoothed[i]));
      dataArray[offset + i] = out;
      if (i < trackingBands) sum += out;
    }
    energy = sum / (trackingBands * 255.0);
  }

  // SwayCommand: cold-start relief. The history begins empty upstream and takes a
  // full sweep to fill; upstream ran for whole sets so that was invisible, but
  // an SwayCommand scene may only be on screen for 20 s. A low-amplitude
  // deterministic field (well under the audio's own range) is seeded once so
  // the terrain reads as terrain from frame one, and is overwritten by real
  // columns as they scroll past. Three octaves of value noise, not sines: sines lay
  // down either straight ridges along the time axis or a regular egg-crate,
  // and both read as artificial. Noise reads as spectrogram grain, and the
  // exp(-p) tilt puts the weight in the low bins where music lives.
  {
    const hash2 = (x, y) => {
      const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return s - Math.floor(s);
    };
    const vnoise = (x, y) => {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const xf = x - xi;
      const yf = y - yi;
      const ux = xf * xf * (3 - 2 * xf);
      const uy = yf * yf * (3 - 2 * yf);
      const a = hash2(xi, yi);
      const b = hash2(xi + 1, yi);
      const c = hash2(xi, yi + 1);
      const d = hash2(xi + 1, yi + 1);
      return (a + (b - a) * ux) + ((c + (d - c) * ux) - (a + (b - a) * ux)) * uy;
    };
    for (let r = 0; r < HISTORY_SIZE; r++) {
      for (let i = 0; i < SPECTRUM_SIZE; i++) {
        const p = i / (SPECTRUM_SIZE - 1);
        const tilt = Math.exp(-p * 2.4);
        const n = 0.55 * vnoise(p * 6.0, r * 0.055)
                + 0.30 * vnoise(p * 15.0, r * 0.13)
                + 0.15 * vnoise(p * 33.0, r * 0.31);
        const v = tilt * (0.04 + 0.34 * Math.pow(n, 1.4));
        dataArray[r * SPECTRUM_SIZE + i] = Math.max(0, Math.min(255, v * 255)) | 0;
      }
    }
  }

  // =========================================================================
  // TEXTURES
  // =========================================================================

  // Upstream DataTexture: RedFormat / UnsignedByte, linear filtering, no
  // mipmaps, clamp S (frequency) and repeat T (the scrolling history ring).
  const dataTexture = new THREE.DataTexture(dataArray, SPECTRUM_SIZE, HISTORY_SIZE, THREE.RedFormat, THREE.UnsignedByteType);
  dataTexture.minFilter = THREE.LinearFilter;
  dataTexture.magFilter = THREE.LinearFilter;
  dataTexture.generateMipmaps = false;
  dataTexture.wrapS = THREE.ClampToEdgeWrapping;
  dataTexture.wrapT = THREE.RepeatWrapping;
  dataTexture.unpackAlignment = 1;
  dataTexture.needsUpdate = true;

  // SwayCommand: the wall spectrogram. Upstream keeps this on a 2048x512 2-D
  // canvas, scrolling it one pixel per frame with drawImage and drawing the
  // fresh column at x = 0. No DOM here, so the same picture is a RedFormat
  // ring buffer: one column written per frame at the head, and a scroll offset
  // uniform does the shifting the blit used to do. x = time, y = frequency,
  // with the highest bin at the top exactly as the flipped canvas gave.
  const wallData = new Uint8Array(WALL_W * WALL_H);
  const wallBin = new Int32Array(WALL_H); // row -> source bin, upstream mapping
  for (let r = 0; r < WALL_H; r++) {
    wallBin[r] = Math.floor((r / (WALL_H - 1)) * (SRC_BINS - 1));
  }
  let wallHead = 0;
  const wallTexture = new THREE.DataTexture(wallData, WALL_W, WALL_H, THREE.RedFormat, THREE.UnsignedByteType);
  wallTexture.minFilter = THREE.LinearFilter;
  wallTexture.magFilter = THREE.LinearFilter;
  wallTexture.generateMipmaps = false;
  wallTexture.wrapS = THREE.RepeatWrapping;   // the ring seam lives here
  wallTexture.wrapT = THREE.ClampToEdgeWrapping;
  wallTexture.unpackAlignment = 1;
  wallTexture.needsUpdate = true;

  /** Upstream drawWallColumn: noise floor 0.08, alpha = pow(x, 1.15) * 0.7. */
  function writeWallColumn() {
    const col = wallHead;
    for (let r = 0; r < WALL_H; r++) {
      const amp = synthBins[wallBin[r]] / 255;
      let a = 0;
      if (amp >= WALL_FLOOR) a = Math.pow((amp - WALL_FLOOR) / (1 - WALL_FLOOR), 1.15) * 0.7;
      wallData[r * WALL_W + col] = (a * 255) | 0;
    }
    wallHead = (wallHead + 1) % WALL_W;
    wallTexture.needsUpdate = true;
  }

  // =========================================================================
  // TERRAIN
  // =========================================================================

  const worldGroup = new THREE.Group();
  scene.add(worldGroup);

  const themeLow = new THREE.Color();
  const themeMid = new THREE.Color();
  const themeHigh = new THREE.Color();
  const themePeak = new THREE.Color();

  const terrainUniforms = {
    u_texture: { value: dataTexture },
    u_offset: { value: 0.0 },
    u_time: { value: 0.0 },
    u_energy: { value: 0.0 },
    u_noiseGate: { value: NOISE_GATE },
    u_heightMulti: { value: 1.0 },
    u_energyImpact: { value: ENERGY_IMPACT },
    u_useColormap: { value: 1.0 },
    u_skew: { value: 0.0 },      // SwayCommand: sway shears the scroll
    u_fold: { value: 1.0 },      // SwayCommand: frequency-axis folds (1 = upstream mirror)
    u_axisWarp: { value: 0.0 },  // SwayCommand: log<->lin frequency re-map depth
    u_radial: { value: 0.0 },    // SwayCommand: plane -> radial burst morph
    u_palMix: { value: 0.5 },    // SwayCommand: palette emissive weight
    u_palPhase: { value: 0.0 },
    u_intensity: { value: 1.0 },
    u_colorLow: { value: themeLow },
    u_colorMid: { value: themeMid },
    u_colorHigh: { value: themeHigh },
    u_colorPeak: { value: themePeak },
    uColors: { value: palette },
  };

  const terrainMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: terrainUniforms,
    vertexShader: /* glsl */ `
      uniform sampler2D u_texture;
      uniform float u_offset;
      uniform float u_energy;
      uniform float u_noiseGate;
      uniform float u_heightMulti;
      uniform float u_energyImpact;
      uniform float u_skew;
      uniform float u_fold;
      uniform float u_axisWarp;
      uniform float u_radial;
      out float v_height;
      out float v_amp;
      out vec2 v_uv;
      // SwayCommand layout morph. Upstream reads abs(uv.x - 0.5) * 2.0, one
      // mirrored pair. u_fold re-folds the axis as a triangle wave (1.0 is
      // upstream exactly; higher values comb the field into repeated mirrors)
      // and u_axisWarp bends the mapping log <-> lin (exponent < 1 stretches
      // the lows outward, > 1 crushes them). Both rest on the upstream layout.
      float freqAt(float x) {
        float f = abs(fract(x * u_fold) - 0.5) * 2.0;
        return pow(f, 1.0 - u_axisWarp * 0.55);
      }
      void main() {
        v_uv = uv;
        // u_skew is the SwayCommand addition: a shear of the history axis across
        // the frequency axis, so sway drags the scroll diagonally. Everything
        // else is upstream's terrain vertex shader unchanged.
        float sampleY = fract((u_offset / ${HISTORY_SIZE}.0) + uv.y + u_skew * (uv.x - 0.5));
        float freqUv = freqAt(uv.x);
        float rawHeight = texture(u_texture, vec2(freqUv, sampleY)).r;
        v_amp = rawHeight;
        float boosted = smoothstep(u_noiseGate, 1.0, rawHeight);
        float centerSmooth = smoothstep(0.0, 0.02, freqUv) * 0.1 + 0.9;
        // Flatten both ends so the ring-buffer wrap seam sits in flat terrain
        // -> seamless scroll, no periodic restart.
        float edge = smoothstep(0.0, 0.12, uv.y) * smoothstep(1.0, 0.82, uv.y);
        v_height = boosted * u_heightMulti * centerSmooth * edge;
        vec3 newPosition = position;
        newPosition.z += v_height * (5.0 + (u_energy * u_energyImpact) * 5.0);
        // SwayCommand radial burst: the same relief re-arranged as a disc,
        // frequency becomes the angle, history the radius, so the spectrum
        // reads as concentric rings bursting outward from the centre.
        // u_radial glides the plane between the two arrangements; the x-edge
        // alpha fade in the fragment shader hides the angular seam.
        float ang = (uv.x - 0.5) * 6.2831853;
        float rad = mix(4.0, 25.0, uv.y);
        newPosition.xy = mix(newPosition.xy, vec2(sin(ang), cos(ang)) * rad, u_radial);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D u_texture;
      uniform float u_offset;
      uniform float u_noiseGate;
      uniform float u_useColormap;
      uniform float u_energy;
      uniform float u_time;
      uniform float u_skew;
      uniform float u_fold;
      uniform float u_axisWarp;
      uniform float u_palMix;
      uniform float u_palPhase;
      uniform float u_intensity;
      uniform vec3 u_colorLow;
      uniform vec3 u_colorMid;
      uniform vec3 u_colorHigh;
      uniform vec3 u_colorPeak;
      in float v_height;
      in float v_amp;
      in vec2 v_uv;
      out vec4 fragColor;
      ${PAL_GLSL}
      // Accurate inferno colormap (Matt Zucker polynomial fit) -- the standard
      // spectrogram palette: near-black -> deep purple -> magenta -> orange ->
      // pale yellow. Used for the default 'Spectrogram' theme. VERBATIM.
      vec3 inferno(float t) {
        t = clamp(t, 0.0, 1.0);
        const vec3 c0 = vec3(0.00021894037, 0.0016510046, -0.019480898);
        const vec3 c1 = vec3(0.10651341949, 0.5639564368, 3.9327123889);
        const vec3 c2 = vec3(11.602493082, -3.972853966, -15.942394106);
        const vec3 c3 = vec3(-41.703996131, 17.436398882, 44.354145199);
        const vec3 c4 = vec3(77.162935699, -33.402358942, -81.807309257);
        const vec3 c5 = vec3(-71.319428245, 32.626064264, 73.209519858);
        const vec3 c6 = vec3(25.131126225, -12.242668952, -23.070325003);
        return c0 + t * (c1 + t * (c2 + t * (c3 + t * (c4 + t * (c5 + t * c6)))));
      }
      // Theme-colour heatmap for the non-spectrogram themes.
      vec3 heat(float t) {
        t = clamp(t, 0.0, 1.0);
        vec3 c = mix(u_colorLow, u_colorMid, smoothstep(0.0, 0.35, t));
        c = mix(c, u_colorHigh, smoothstep(0.30, 0.72, t));
        c = mix(c, u_colorPeak, smoothstep(0.66, 1.0, t));
        return c;
      }
      // SwayCommand: the same fold/warp of the frequency axis as the vertex
      // shader, so the derived normals track the morphed layout exactly.
      float freqAt(float x) {
        float f = abs(fract(x * u_fold) - 0.5) * 2.0;
        return pow(f, 1.0 - u_axisWarp * 0.55);
      }
      // Reconstruct the geometric height at an arbitrary uv (mirrors the vertex
      // displacement) so a surface normal can be derived in-shader: bump/normal
      // relief lit from the spectrogram itself, no external normal map.
      float terrainH(vec2 uvc) {
        float sY = fract((u_offset / ${HISTORY_SIZE}.0) + uvc.y + u_skew * (uvc.x - 0.5));
        float fU = freqAt(uvc.x);
        float rh = texture(u_texture, vec2(fU, sY)).r;
        float b = smoothstep(u_noiseGate, 1.0, rh);
        float cs = smoothstep(0.0, 0.02, fU) * 0.1 + 0.9;
        float ed = smoothstep(0.0, 0.12, uvc.y) * smoothstep(1.0, 0.82, uvc.y);
        return b * cs * ed;
      }
      void main() {
        float amp = clamp(v_amp * (1.0 + u_energy * 0.6), 0.0, 1.0);
        vec3 base = clamp((u_useColormap > 0.5) ? inferno(amp) : heat(amp), 0.0, 1.0);
        // Bump/normal relief: sample the height field around this fragment, build
        // a normal, light it so ridges shade in 3D and gain micro-detail.
        float e = 1.0 / ${SPECTRUM_SIZE}.0;
        float hL = terrainH(v_uv - vec2(e, 0.0));
        float hR = terrainH(v_uv + vec2(e, 0.0));
        float hD = terrainH(v_uv - vec2(0.0, e));
        float hU = terrainH(v_uv + vec2(0.0, e));
        float nScale = 7.0;
        vec3 nrm = normalize(vec3((hL - hR) * nScale, (hD - hU) * nScale, 1.0));
        vec3 L = normalize(vec3(0.35, 0.45, 0.82));
        float diff = clamp(dot(nrm, L), 0.0, 1.0);
        vec3 hVec = normalize(L + vec3(0.0, 0.0, 1.0));
        float spec = pow(clamp(dot(nrm, hVec), 0.0, 1.0), 28.0) * amp;
        float light = 0.72 + 0.55 * diff + 0.7 * spec;
        vec3 col = base * light;
        // --- SwayCommand: palette emissive on the ridges. Additive and weighted
        //     by amp * (0.35 + 0.65 * amp), a softened square, so the dark
        //     valleys stay pure colormap while the mid-tones and peaks carry
        //     enough engine hue for a ColorMaster crossfade or a knob-0 hue
        //     rotation to read across the whole terrain.
        vec3 tint = pal(fract(u_palPhase + amp * 0.65 + v_uv.y * 0.25) * 5.0);
        float palW = amp * (0.35 + 0.65 * amp);
        col += tint * palW * u_palMix * (0.55 + 0.85 * diff + 1.6 * spec);
        float edgeFade = smoothstep(0.0, 0.12, v_uv.x) * smoothstep(1.0, 0.88, v_uv.x);
        float depthFade = smoothstep(0.0, 0.05, v_uv.y) * smoothstep(1.0, 0.72, v_uv.y);
        float alpha = (0.55 + amp * 0.45) * edgeFade * depthFade;
        fragColor = vec4(col * u_intensity, alpha);
      }
    `,
  });

  const terrainGeo = new THREE.PlaneGeometry(50, 50, TERRAIN_SEGS, TERRAIN_SEGS);
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.rotation.x = -Math.PI / 2; // local +z becomes world +y: relief grows up
  terrain.position.set(0, -2, 0);
  terrain.renderOrder = 1; // SwayCommand: explicit order for the three alpha layers
  // The vertex shader lifts z by up to (5.0 + energy*5.0) = 10 units, which the
  // geometry's own bounding sphere knows nothing about. Every upstream camera
  // happens to sit inside that sphere so nothing is culled wrongly today, but
  // this is the same displaced-geometry case cymatic.js opts out for, and one
  // mesh costs nothing to skip.
  terrain.frustumCulled = false;
  worldGroup.add(terrain);

  // =========================================================================
  // CURVED WALLS
  // =========================================================================

  const wallCommon = {
    u_time: terrainUniforms.u_time,
    u_energy: terrainUniforms.u_energy,
    u_colorLow: terrainUniforms.u_colorLow,
    u_colorMid: terrainUniforms.u_colorMid,
    u_colorHigh: terrainUniforms.u_colorHigh,
    u_colorPeak: terrainUniforms.u_colorPeak,
    u_palMix: terrainUniforms.u_palMix,
    u_palPhase: terrainUniforms.u_palPhase,
    u_intensity: terrainUniforms.u_intensity,
    uColors: terrainUniforms.uColors,
    u_curveRadius: { value: 400.0 }, // upstream default; knob 6 drives it
    u_wallOffset: { value: 0.0 },    // SwayCommand: ring head, replaces the blit
    u_wallSpan: { value: (WALL_W - 1) / WALL_W },
  };

  const wallMats = [];
  const wallGeos = [];

  function makeWall(x, rotY, flipX) {
    const mat = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: Object.assign({
        u_texture: { value: wallTexture },
        u_flipX: { value: flipX ? 1.0 : 0.0 },
      }, wallCommon),
      vertexShader: /* glsl */ `
        uniform float u_curveRadius;
        out vec2 v_uv;
        void main() {
          v_uv = uv;
          vec3 pos = position;
          float theta = pos.x / u_curveRadius;
          pos.z += u_curveRadius * (1.0 - cos(theta));
          pos.x = u_curveRadius * sin(theta);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D u_texture;
        uniform float u_flipX;
        uniform float u_energy;
        uniform float u_wallOffset;
        uniform float u_wallSpan;
        uniform float u_palMix;
        uniform float u_palPhase;
        uniform float u_intensity;
        uniform vec3 u_colorLow;
        uniform vec3 u_colorMid;
        uniform vec3 u_colorHigh;
        uniform vec3 u_colorPeak;
        in vec2 v_uv;
        out vec4 fragColor;
        ${PAL_GLSL}
        vec3 getPalette(float t, float energy) {
          vec3 low = u_colorLow;
          vec3 midCheck = mix(u_colorMid, u_colorHigh, clamp(energy * 0.4, 0.0, 1.0));
          vec3 highCheck = mix(u_colorHigh, u_colorPeak, clamp(energy * 0.6, 0.0, 1.0));
          vec3 peak = u_colorPeak;
          if (t < 0.1) { return mix(low, midCheck, t / 0.1); }
          else if (t < 0.4) { return mix(midCheck, highCheck, (t - 0.1) / 0.3); }
          else if (t < 0.8) { return mix(highCheck, peak, (t - 0.4) / 0.4); }
          else { return mix(peak, vec3(1.0), min((t - 0.8) / 0.2, 1.0)); }
        }
        void main() {
          vec2 sampleUv = v_uv;
          if (u_flipX > 0.5) sampleUv.x = 1.0 - sampleUv.x;
          // SwayCommand: the ring-buffer read that replaces upstream's canvas blit.
          // u_wallOffset is the newest column; walking sampleUv.x back through
          // the (repeat-wrapped) ring walks back through time.
          sampleUv.x = u_wallOffset - sampleUv.x * u_wallSpan;
          float t = texture(u_texture, sampleUv).r;
          vec3 col = getPalette(t, u_energy);
          // SwayCommand: palette wash over the theme ramp.
          col = mix(col, pal(fract(u_palPhase + v_uv.y * 0.6) * 5.0), clamp(u_palMix * 0.7, 0.0, 0.85));
          float edgeX = smoothstep(0.0, 0.2, v_uv.x) * smoothstep(1.0, 0.8, v_uv.x);
          float edgeY = smoothstep(0.0, 0.2, v_uv.y) * smoothstep(1.0, 0.6, v_uv.y);
          // 0.45 / 0.25 are upstream; ${BLOOM_GAIN.toFixed(2)} stands in for the
          // UnrealBloomPass this port cannot run.
          fragColor = vec4(col * 0.45 * ${BLOOM_GAIN.toFixed(2)} * u_intensity,
                           t * edgeX * edgeY * 0.25 * ${BLOOM_GAIN.toFixed(2)});
        }
      `,
    });
    const geo = new THREE.PlaneGeometry(1000, 320, WALL_SX, WALL_SY);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, 0, 0);
    mesh.rotation.set(0, rotY, 0);
    mesh.renderOrder = 0;
    mesh.frustumCulled = false; // the curve moves vertices far outside the AABB
    wallMats.push(mat);
    wallGeos.push(geo);
    return mesh;
  }

  const wallGroup = new THREE.Group();
  wallGroup.position.set(0, 45, 0);
  wallGroup.add(makeWall(-280, Math.PI / 2, true));
  wallGroup.add(makeWall(280, -Math.PI / 2, false));
  worldGroup.add(wallGroup);

  // =========================================================================
  // PARTICLES
  // =========================================================================

  const pPos = new Float32Array(PARTICLE_COUNT * 3);
  const pScale = new Float32Array(PARTICLE_COUNT);
  const pColor = new Float32Array(PARTICLE_COUNT * 3);
  const pHue = new Float32Array(PARTICLE_COUNT); // SwayCommand: palette lookup seed

  // SwayCommand: upstream authored gl_PointSize for a 720-tall framebuffer at
  // DPR 1. Scaling by the real framebuffer height keeps the sprites the same
  // apparent size at 1080p and above. Reading the renderer's pixel ratio is a
  // query, not a state change. Seeded here because the engine only calls
  // resize() on instances that already exist.
  function pxScaleFor(h) {
    let pr = 1;
    if (ctx.renderer && typeof ctx.renderer.getPixelRatio === 'function') {
      pr = ctx.renderer.getPixelRatio() || 1;
    }
    return Math.max(0.4, (Math.max(1, h) * pr) / 720);
  }

  const particleUniforms = {
    u_time: { value: 0 },
    u_energy: { value: 0 },
    u_beat: { value: 0 },      // SwayCommand: io.beat pulses the field
    u_intensity: { value: 1 },
    u_palMix: { value: 0.65 }, // particles lean hardest on the engine palette
    u_palPhase: terrainUniforms.u_palPhase,
    u_pxScale: { value: pxScaleFor(ctx.height) },
    uColors: terrainUniforms.uColors,
  };

  const particleGeo = new THREE.BufferGeometry();
  const particleMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: particleUniforms,
    vertexShader: /* glsl */ `
      uniform float u_time;
      uniform float u_energy;
      uniform float u_beat;
      uniform float u_intensity;
      uniform float u_palMix;
      uniform float u_palPhase;
      uniform float u_pxScale;
      in float aScale;
      in float aHue;
      in vec3 aColor;
      out vec3 vColor;
      out float vAlpha;
      ${PAL_GLSL}
      void main() {
        // SwayCommand: theme colour mixed toward the engine palette. Upstream used
        // three.js vertexColors and the implicit "color" attribute; the
        // attribute is declared explicitly here so nothing depends on
        // USE_COLOR being injected by the renderer.
        vColor = mix(aColor, pal(fract(aHue + u_palPhase) * 5.0), u_palMix);
        vec3 p = position;
        p.x += sin(u_time * 0.5 + p.y * 0.1) * 3.0;
        p.z += cos(u_time * 0.3 + p.y * 0.2) * 3.0;
        p.x *= 1.0 + (u_energy * 0.2 * aScale);
        p.z *= 1.0 + (u_energy * 0.2 * aScale);
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        // Two guards on upstream's bare divide by -mvPosition.z:
        //   max(), a point at or behind the eye would divide by zero or a
        //     negative and give an infinite/NaN gl_PointSize, painting or
        //     blanking the frame.
        //   min(), upstream rendered at a fixed 1280x720 (u_pxScale == 1) and
        //     its cameras never entered the field. Here u_pxScale is ~2.6 at
        //     1080p/DPR 1.75 and Free Flight flies THROUGH the particles, so a
        //     near sprite asks for 8*1*4.5*2.6/0.25 ~= 375 px; 1200 of those is
        //     ~170 M fragments in one additive pass, which is minutes-per-frame
        //     territory on an Intel HD 630. 64 px still comfortably exceeds any
        //     sprite upstream's framing ever produced, so the cap is invisible
        //     in the modes upstream actually had.
        gl_PointSize = min(
          (8.0 * aScale * (1.0 + u_energy * 2.0 + u_beat * 1.5) * u_pxScale)
            / max(-mvPosition.z, 0.25),
          64.0);
        gl_Position = projectionMatrix * mvPosition;
        vAlpha = aScale * (0.06 + u_energy * 0.18 + u_beat * 0.22)
               * ${BLOOM_GAIN.toFixed(2)} * u_intensity;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float u_energy;
      in vec3 vColor;
      in float vAlpha;
      out vec4 fragColor;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float intensity = (0.5 - dist) * 2.0;
        vec3 finalColor = mix(vColor, vec3(0.7, 0.9, 1.0), u_energy * 0.25);
        fragColor = vec4(finalColor, vAlpha * intensity);
      }
    `,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  particles.renderOrder = 2;
  particles.frustumCulled = false; // the vertex shader moves points off the AABB
  worldGroup.add(particles);

  // --- theme state ---------------------------------------------------------
  // SwayCommand: upstream opens on the mel-spectrogram theme, whose inferno ramp
  // starts at 0x000004 and reads as a black field on the engine's black
  // ground. Cyber Horizon is the brightest of the seven and is the default
  // here; pads still select any theme, mel-spectrogram included.
  let themeIndex = 5;
  let seeded = false;
  const themeC0 = new THREE.Color();
  const themeC1 = new THREE.Color();
  const themeC2 = new THREE.Color();

  // Upstream seedParticleColors: positions/scales once, colours per theme from
  // [peak, high, mid] cycling. Positions survive a theme change.
  function seedParticles() {
    const th = THEMES[themeIndex];
    themeC0.setHex(th.peak);
    themeC1.setHex(th.high);
    themeC2.setHex(th.mid);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      if (!seeded) {
        pPos[i * 3] = (Math.random() - 0.5) * 80;
        pPos[i * 3 + 1] = (Math.random() - 0.5) * 30 + 10;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 80;
        pScale[i] = Math.random();
        pHue[i] = Math.random();
      }
      const m = i % 3;
      const c = m === 0 ? themeC0 : m === 1 ? themeC1 : themeC2;
      pColor[i * 3] = c.r;
      pColor[i * 3 + 1] = c.g;
      pColor[i * 3 + 2] = c.b;
    }
    if (!seeded) {
      particleGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      particleGeo.setAttribute('aScale', new THREE.BufferAttribute(pScale, 1));
      particleGeo.setAttribute('aHue', new THREE.BufferAttribute(pHue, 1));
      particleGeo.setAttribute('aColor', new THREE.BufferAttribute(pColor, 3));
      seeded = true;
    } else {
      particleGeo.getAttribute('aColor').needsUpdate = true;
    }
  }

  // Upstream applyTheme, minus the scene background / fog it also touched.
  function applyTheme() {
    const th = THEMES[themeIndex];
    terrainUniforms.u_useColormap.value = th.inferno ? 1.0 : 0.0;
    themeLow.setHex(th.low);
    themeMid.setHex(th.mid);
    themeHigh.setHex(th.high);
    themePeak.setHex(th.peak);
    seedParticles();
  }
  applyTheme();

  // =========================================================================
  // CPU HEIGHT QUERY (canyon flight ground following)
  // =========================================================================

  // Upstream terrainHeightAt, verbatim but for the u_skew term (mirrored from
  // the vertex shader). NOTE, as upstream ships it: this mirror uses
  // -2.0 + h*(4.0 + e*4.0) where the shader displaces by (5.0 + e*5.0) and it
  // omits the shader's `edge` flatten, so the flight camera rides a slightly
  // conservative estimate of the real relief. Kept as-is for fidelity.
  function terrainHeightAt(worldX, worldZ, skew, heightMulti) {
    const u = (worldX + 25.0) / 50.0;
    const v = (25.0 - worldZ) / 50.0;
    const uClamp = u < 0 ? 0 : u > 1 ? 1 : u;
    const vClamp = v < 0 ? 0 : v > 1 ? 1 : v;
    const offsetProgress = currentRow / HISTORY_SIZE;
    const rawY = offsetProgress + vClamp + skew * (uClamp - 0.5);
    const sampleY = rawY - Math.floor(rawY);
    // SwayCommand: mirror the layout morph's fold/warp of the frequency axis
    // (the radial term is left out, flight keeps a conservative planar read,
    // in the same spirit as the height-scale mismatch noted above).
    const foldX = uClamp * (1 + foldCur);
    const fTri = Math.abs(foldX - Math.floor(foldX) - 0.5) * 2.0;
    const freqUv = Math.pow(fTri, 1.0 - warpCur * 0.55);
    let spectrumIdx = Math.floor(freqUv * (SPECTRUM_SIZE - 1));
    if (spectrumIdx < 0) spectrumIdx = 0;
    else if (spectrumIdx > SPECTRUM_SIZE - 1) spectrumIdx = SPECTRUM_SIZE - 1;
    let historyIdx = Math.floor(sampleY * (HISTORY_SIZE - 1));
    if (historyIdx < 0) historyIdx = 0;
    else if (historyIdx > HISTORY_SIZE - 1) historyIdx = HISTORY_SIZE - 1;
    const rawVal = dataArray[historyIdx * SPECTRUM_SIZE + spectrumIdx] / 255.0;
    let clampT = (rawVal - NOISE_GATE) / (1.0 - NOISE_GATE);
    clampT = clampT < 0 ? 0 : clampT > 1 ? 1 : clampT;
    const boosted = clampT * clampT * (3 - 2 * clampT);
    let centerSmoothT = freqUv / 0.02;
    centerSmoothT = centerSmoothT < 0 ? 0 : centerSmoothT > 1 ? 1 : centerSmoothT;
    const centerSmooth = centerSmoothT * centerSmoothT * (3 - 2 * centerSmoothT) * 0.1 + 0.9;
    const vHeight = boosted * heightMulti * centerSmooth;
    return -2.0 + vHeight * (4.0 + energy * ENERGY_IMPACT * 4.0);
  }

  // =========================================================================
  // CPU STATE, all preallocated; update() allocates nothing
  // =========================================================================

  let clock = 0;          // own clock: only advances while the scene is visible
  let modeIndex = M_DYNAMIC;
  let lastCamMode = -1;
  const prevPads = new Float32Array(PADS);

  // flight / freecam rig (upstream names)
  let shipYaw = 0;
  let shipPitch = 0;
  let shipRoll = 0;
  let flightAlt = 1.5;
  let steerXs = 0;
  let steerYs = 0;

  // smoothed continuous controls
  let skew = 0;
  let palPhase = 0;

  // SwayCommand layout morph / strike state: the smoothed sway position, the
  // glided layout channels, the strike-seeded arrangement index and the slam
  // impulse. All rest at zero, the upstream layout exactly.
  let swaySm = 0;
  let foldCur = 0;    // extra folds beyond the upstream mirrored pair
  let warpCur = 0;    // log<->lin re-map depth
  let radialCur = 0;  // plane -> radial burst
  let layoutSeed = 0; // which LAYOUT_SEEDS entry sway morphs toward
  let slam = 0;       // full-band strike impulse

  // preallocated scratch (upstream allocated an Euler and a Vector3 per frame)
  const eul = new THREE.Euler(0, 0, 0, 'YXZ');
  const fwd = new THREE.Vector3();

  const lerp = (a, b, t) => a + (b - a) * (t < 0 ? 0 : t > 1 ? 1 : t);
  // scalar smoothstep, stages the layout channels along the sway travel
  const sstep = (a, b, x) => {
    const r = (x - a) / (b - a);
    const c = r < 0 ? 0 : r > 1 ? 1 : r;
    return c * c * (3 - 2 * c);
  };

  function applyCamera(tSec, dt, io, heightMulti) {
    const e = energy * ENERGY_IMPACT;
    // io.xy is the stick: x steers/orbits, y climbs. Upstream read WASD here.
    const stickX = (io.xy.x - 0.5) * 2;
    const stickY = (io.xy.y - 0.5) * 2;

    // Reset the rig when switching INTO a flight mode (upstream).
    if (modeIndex !== lastCamMode) {
      if (modeIndex === M_FLIGHT) {
        camera.position.set(0, -0.5, 12);
        camera.quaternion.identity();
        flightAlt = 1.5;
      } else if (modeIndex === M_FREECAM) {
        camera.position.set(0, 4, 18);
        camera.quaternion.identity();
      }
      shipYaw = 0;
      shipPitch = 0;
      shipRoll = 0;
      lastCamMode = modeIndex;
    }

    if (modeIndex === M_FLIGHT) {
      // Ease the raw stick so starts/stops ramp instead of snapping.
      steerXs = lerp(steerXs, stickX, 4.0 * dt);
      steerYs = lerp(steerYs, stickY, 4.0 * dt);
      camera.position.x = Math.max(-19, Math.min(19, camera.position.x + steerXs * 13 * dt));
      flightAlt = Math.max(0, Math.min(15, flightAlt + steerYs * 8 * dt));
      shipRoll = lerp(shipRoll, -steerXs * 0.38, 3.0 * dt);
      shipYaw = lerp(shipYaw, -steerXs * 0.15, 3.0 * dt);
      shipPitch = lerp(shipPitch, -0.1 + steerYs * 0.12, 3.0 * dt);
      camera.up.set(0, 1, 0);
      eul.set(shipPitch, shipYaw, shipRoll);
      camera.quaternion.setFromEuler(eul);
      const under = terrainHeightAt(camera.position.x, camera.position.z, skew, heightMulti);
      const ahead = terrainHeightAt(camera.position.x, camera.position.z - 4.5, skew, heightMulti);
      const targetY = Math.max(under, ahead) + 0.8 + flightAlt;
      const damp = targetY > camera.position.y ? 1.1 : 2.5;
      camera.position.y = Math.max(-1.5, lerp(camera.position.y, targetY, damp * dt));
      camera.position.z = 12;
    } else if (modeIndex === M_FREECAM) {
      // Upstream's Space/Shift speed keys become the pulse gesture.
      const speedMul = 1 + io.gestures.pulse * 0.8;
      steerXs = lerp(steerXs, stickX, 3.5 * dt);
      steerYs = lerp(steerYs, -stickY, 3.5 * dt);
      shipYaw -= steerXs * 1.6 * dt;
      shipPitch -= steerYs * 1.2 * dt;
      shipPitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, shipPitch));
      shipRoll = lerp(shipRoll, -steerXs * 0.45, 3.0 * dt);
      camera.up.set(0, 1, 0);
      eul.set(shipPitch, shipYaw, shipRoll);
      camera.quaternion.setFromEuler(eul);
      fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
      camera.position.addScaledVector(fwd, 12 * speedMul * dt);
      if (camera.position.z < -25) camera.position.z += 50;
      if (camera.position.z > 25) camera.position.z -= 50;
      if (camera.position.x < -25) camera.position.x += 50;
      if (camera.position.x > 25) camera.position.x -= 50;
      camera.position.y = Math.max(1.5, Math.min(18, camera.position.y));
    } else if (modeIndex === M_OVERHEAD) {
      // Bird's Eye. xy sets the orbit angle and the altitude; the angle no
      // longer advances by itself (header item 10).
      const a = stickX * 1.2;
      camera.position.set(Math.sin(a) * 2, 30 - stickY * 9, Math.cos(a) * 2);
      camera.up.set(0, 0, -1);
      camera.lookAt(0, 0, 0);
    } else if (modeIndex === M_HORIZON) {
      // Deep Horizon. xy slides along the ridge line and lifts the eye; the
      // upstream sin(t*0.3) self-slide is removed (header item 10).
      const slide = stickX * 9;
      camera.position.set(slide, 1 + e * 2 + stickY * 4, 30);
      camera.up.set(0, 1, 0);
      camera.lookAt(0, 3, -8);
    } else {
      // Dynamic Orbit (upstream default). xy sets orbit offset and height;
      // the upstream t*0.18 orbit advance and sin(t*0.3) height bob are
      // removed (header item 10), the eye rests at the upstream
      // non-rotating angle 0.6 and energy still breathes the radius.
      const a = 0.6 + stickX * 1.6;
      const r = 22 - e * 3;
      camera.position.set(
        Math.sin(a) * r,
        7 + stickY * 5,
        Math.cos(a) * r,
      );
      camera.up.set(0, 1, 0);
      camera.lookAt(0, 1, -2);
    }
  }

  return {
    scene,
    camera,

    update(dt, t, io) {
      clock += dt; // own clock, so a cached scene never jumps on re-entry
      const tSec = clock;

      // strike impulse decays first, so this frame's edges can re-arm it
      slam *= Math.exp(-dt / SLAM_TAU);

      // --- PADS ------------------------------------------------------------
      // 0-6  theme          7   pure slam (the upstream auto-rotate toggle is
      //                         gone with auto-rotate itself, header item 10)
      // 8-12 camera mode    13  next theme   14  next camera mode   15 free
      // EVERY rising edge is also a STRIKE, the spectral slam: io.strike
      // (the engine's max pad energy) becomes a full-band impulse in the
      // source spectrum, and the layout seed jumps so sway morphs toward the
      // next arrangement. Pads keep their picks on top; 15 is a pure slam.
      let struck = false;
      for (let i = 0; i < PADS; i++) {
        const v = io.pads[i];
        if (v > 0.1 && v > prevPads[i] + 0.05) {
          struck = true;
          if (i < THEMES.length) {
            themeIndex = i;
            applyTheme();
          } else if (i >= 8 && i < 8 + MODES.length) {
            modeIndex = i - 8;
          } else if (i === 13) {
            themeIndex = (themeIndex + 1) % THEMES.length;
            applyTheme();
          } else if (i === 14) {
            modeIndex = (modeIndex + 1) % MODES.length;
          }
        }
        prevPads[i] = v;
      }
      if (struck) {
        slam = Math.max(slam, io.strike > 1 ? 1 : io.strike < 0 ? 0 : io.strike);
        layoutSeed = (layoutSeed + 1) % LAYOUT_SEEDS.length;
      }

      // --- KNOBS 3-7 -------------------------------------------------------
      const k3 = io.knobs[3];
      const k4 = io.knobs[4];
      const k5 = io.knobs[5];
      const k6 = io.knobs[6];
      const k7 = io.knobs[7];
      // 3: scroll speed. 1.5 .. 24 rows/s, centred on 6 (upstream's 2.0 sits
      //    at k3 ~= 0.10); the ring is 256 rows deep.
      const scrollRows = SCROLL_ROWS_MID * Math.pow(2, (k3 - 0.5) * 4);
      // 4: height scale (upstream heightMulti, default 1.0 at k4 = 0.5), then
      //    press compresses the relief on top of it.
      const heightMulti = Math.max(0.05, (0.4 + k4 * 1.2) * (1 - io.gestures.press * 0.75));
      // 5: particle amount, draw range plus a brightness trim.
      const pAmount = 0.15 + k5 * 0.85;
      // 6: wall curvature. Upstream's radius is 400 (k6 = 0.5); smaller radius
      //    wraps the walls tighter around the viewer.
      const curveRadius = Math.max(60, 100 * Math.pow(2, (1 - k6) * 4));
      // 7: spectrum smoothing (upstream EMA, default 0.65 near k7 = 0.54).
      const ema = Math.max(0, Math.min(0.95, 0.30 + k7 * 0.65));

      // --- AUDIO -> spectrum -> history ------------------------------------
      synthSpectrum(tSec, io.bands.bass, io.bands.mid, io.bands.high);

      // Time-based scroll (fps-independent): advance the history head at a
      // fixed rate; refresh the live head column even between advances so it
      // stays reactive. Upstream, verbatim.
      rowAccum += dt * scrollRows;
      let steps = Math.floor(rowAccum);
      rowAccum -= steps;
      if (steps > 4) steps = 4;
      if (steps <= 0) {
        fillColumn(currentRow, ema);
      } else {
        for (let s = 0; s < steps; s++) {
          fillColumn(currentRow, ema);
          currentRow = (currentRow + 1) % HISTORY_SIZE;
        }
      }
      dataTexture.needsUpdate = true;
      writeWallColumn();

      // --- SWAY -> LAYOUT MORPH --------------------------------------------
      // Sway glides the analyzer between arrangements, never a camera trick:
      // the frequency axis re-warps first, then re-folds into a comb, then
      // the plane blooms into the radial burst, all toward the strike-seeded
      // arrangement. Sway is unipolar with rest 0 (docs/MIDI.md), so every
      // channel contributes zero at rest and the layout IS upstream's; the
      // smoothing keeps a jumpy CC from tearing the mesh.
      const swRaw = io.gestures.sway < 0 ? 0 : io.gestures.sway > 1 ? 1 : io.gestures.sway;
      swaySm += (swRaw - swaySm) * (1 - Math.exp(-dt / TAU_SWAY));
      const sd = LAYOUT_SEEDS[layoutSeed];
      const kl = 1 - Math.exp(-dt / TAU_LAYOUT);
      foldCur += (sd.fold * sstep(0.10, 0.65, swaySm) - foldCur) * kl;
      warpCur += (sd.warp * sstep(0.05, 0.80, swaySm) - warpCur) * kl;
      radialCur += (sd.radial * sstep(0.45, 0.95, swaySm) - radialCur) * kl;
      // the shear keeps its old feel but now rests at exactly zero
      skew += (sd.skew * 0.30 * sstep(0.05, 0.90, swaySm) - skew) * kl;

      // --- UNIFORMS --------------------------------------------------------
      palPhase += dt * 0.035;
      if (palPhase > 1) palPhase -= 1;

      terrainUniforms.u_offset.value = currentRow;
      terrainUniforms.u_time.value = tSec;
      // upstream's display lerp on the energy tracker
      const lerpE = terrainUniforms.u_energy.value;
      terrainUniforms.u_energy.value = lerpE + (energy - lerpE) * 0.15;
      terrainUniforms.u_noiseGate.value = NOISE_GATE;
      terrainUniforms.u_heightMulti.value = heightMulti;
      terrainUniforms.u_energyImpact.value = ENERGY_IMPACT;
      terrainUniforms.u_skew.value = skew;
      terrainUniforms.u_fold.value = 1 + foldCur;
      terrainUniforms.u_axisWarp.value = warpCur;
      terrainUniforms.u_radial.value = radialCur;
      terrainUniforms.u_palPhase.value = palPhase;
      // SwayCommand: upstream renders on its own dark ground with a bloom pass the
      // engine does not provide, so the terrain needs headroom to read here.
      terrainUniforms.u_intensity.value = io.intensity * 2.4;
      // the palette rides the beat so peaks flare in engine hue
      terrainUniforms.u_palMix.value = 0.45 + io.beat * 0.55 + io.level * 0.25;

      wallCommon.u_curveRadius.value = curveRadius;
      // newest column, at its texel centre; the shader walks back from here
      wallCommon.u_wallOffset.value = (wallHead - 0.5) / WALL_W;

      particleUniforms.u_time.value = tSec;
      particleUniforms.u_energy.value +=
        (energy * ENERGY_IMPACT - particleUniforms.u_energy.value) * 0.15;
      // SwayCommand: a slam flares the particle field the way a beat does
      particleUniforms.u_beat.value = io.beat > slam ? io.beat : slam;
      particleUniforms.u_intensity.value = io.intensity * (0.55 + pAmount * 0.65);
      particles.position.y = energy * ENERGY_IMPACT * 8.0;
      particleGeo.setDrawRange(0, Math.max(1, Math.round(PARTICLE_COUNT * pAmount)));

      // --- WORLD SWAY (upstream, non-flight modes only) --------------------
      if (modeIndex === M_FLIGHT || modeIndex === M_FREECAM) {
        worldGroup.position.set(0, 0, 0);
        worldGroup.rotation.set(0, 0, 0);
      } else {
        // SwayCommand: upstream also rocked worldGroup.rotation.x/y/z on
        // sin/cos(tSec) here, a self-advancing rotation of the whole world,
        // removed (header item 10); the rotation holds at zero. The
        // translations stay: the lateral slide and the energy-driven
        // pull-back / dip.
        const eScaled = energy * ENERGY_IMPACT;
        const swayTurn = Math.sin(tSec * 0.4);
        worldGroup.position.x += (swayTurn * -8.0 - worldGroup.position.x) * 0.02;
        worldGroup.position.z += (eScaled * -4.0 - worldGroup.position.z) * 0.1;
        worldGroup.position.y += (eScaled * -2.5 - worldGroup.position.y) * 0.1;
        worldGroup.rotation.set(0, 0, 0);
      }

      applyCamera(tSec, dt, io, heightMulti);

      // palette animates upstream, copy all five every frame, never mutate
      for (let i = 0; i < 5; i++) palette[i].copy(io.palette[i]);
    },

    resize(w, h) {
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      particleUniforms.u_pxScale.value = pxScaleFor(h);
    },

    dispose() {
      terrainGeo.dispose();
      terrainMat.dispose();
      for (let i = 0; i < wallGeos.length; i++) wallGeos[i].dispose();
      for (let i = 0; i < wallMats.length; i++) wallMats[i].dispose();
      particleGeo.dispose();
      particleMat.dispose();
      dataTexture.dispose();
      wallTexture.dispose();
    },
  };
}
