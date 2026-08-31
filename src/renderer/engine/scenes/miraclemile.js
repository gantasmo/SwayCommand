// Miracle Mile, the atom, and the city it ends. Four acts on one knob, a noir
// city under all of them, and a deck of sixteen re-entry vehicles over the top.
//
//   COLD OPEN   The scene opens DARK on the collider: a faint detector
//               breathing with the level, nothing else, until the show starts
//              , the first beat the analyser hears, the transport playing, or
//               any pad, and then the first collision fires as the opening
//               element. KNOB 6 / 'act' take over the moment they move.
//   ACT         KNOB 6 (io.knobs[5]) picks it in quarter turns the moment the
//               knob moves: 0-¼ COLLIDER, ¼-½ FISSION, ½-¾ DETONATION, ¾-1
//               SHOCKWAVE. The 'act' parameter drives the same choice from any
//               assigned control.
//   YIELD       KNOB 5 (io.knobs[4]), or the 'yield' parameter: collision
//               multiplicity, prompt-neutron count, and the size of every
//               cloud the deck lands.
//   PADS        In the COLLIDER and FISSION acts a strike fires that act's
//               event, as it always did. In the two CITY acts every pad is its
//               own re-entry vehicle (below). A strike thrown with the hand
//               CLENCHED (press ≥ 0.8) fires ground zero instead, that is how
//               the classic single-cloud detonation stays on an unassigned
//               deck; 'detonate' is the assignable form of the same event.
//
//   COLLIDER    Inside the detector: a barrel of tracker and calorimeter
//               layers (thin rings and axial lines, one instanced mesh of
//               capsules), the beam pipe on the axis, two bunches racing in
//               from either end and crossing at the interaction point. A
//               strike is the collision: 40 to 120 charged tracks spray from the
//               vertex as helices in the solenoid field (rebuilt every frame
//               from each track's pT, φ, η and charge, so the field is live),
//               propagate outward in 0.4 s, leave hits on every layer they
//               cross and dump energy into calorimeter bars at the barrel,
//               then fade over ~3 s. Most tracks cluster about three jet axes.
//               SWAY is the field strength; PRESS dives the eye toward the
//               vertex; the hand orbits.
//   FISSION     Thirteen nuclei in the dark, one at the centre, twelve around
//               it on an icosahedron, each a packed cluster of nucleons that
//               jitters in place. A strike fires a neutron at the nearest idle
//               nucleus: the drop swells, oscillates, elongates, necks and
//               splits; two hot fragments fly apart while two to four prompt
//               neutrons leave for neighbouring nuclei, which split in turn.
//               The chain crosses the lattice with a gamma flash and an
//               expanding shell at every scission, whites out when the last
//               one goes, and the lattice re-forms. SWAY morphs clean
//               symmetric scission into a wobbling asymmetric one; PRESS
//               compresses the nuclei; the hand orbits.
//   THE CUT     FISSION -> DETONATION is not a dissolve. The lattice hangs
//               forty-six metres up in the middle of a boulevard, and the act
//               change is one continuous pull-back along a single straight
//               line, no turn, no cross-fade, no flare. The eye recedes from
//               eleven metres to five hundred and twenty on a LOG schedule, so
//               the field of view opens at a constant rate and the picture
//               never lurches. As it opens, every nucleon leaves its shell and
//               travels to a REAL LIT WINDOW: the block grid is keyed by an
//               integer hash that JS and GLSL evaluate bit for bit alike, and
//               the JS runs the shader's window rule verbatim, the same
//               pitch, the same lit fraction, the same pane inside its cell,
//               the same on/off hash and colour temperature, and the SAME
//               MASSES: a lot stands as up to three stacked boxes, and a JS
//               copy that knew only the total height sent most of the deco
//               tower's panes to a wall plane that does not exist above the
//               setback. It has to be verbatim in every one of those, or the
//               cluster lands on panes the city leaves dark or on air, and the
//               points wink out instead of becoming windows. Only panes bright
//               enough to read at that distance are candidates; a nucleon that
//               lands on a desk lamp has landed on nothing. Each nucleon is
//               then matched to a window by WHERE IT SITS IN THE FRAME, its
//               place seen from the near station against the window's place
//               seen from the far one, so the point crosses the move without
//               crossing the screen, and it ARRIVES HOLDING THAT PANE'S OWN
//               COLOUR, computed from the shader's own window expression and
//               carried on a per-instance colour rather than a palette ramp
//               coordinate, because the ramp and the window rule only agree at
//               the warm end and a constellation resolving cyan over a gold
//               and blue-white grid is the hand-off showing. The cluster does
//               not dissolve into the city; it unfolds onto it, and what was a
//               shell of nucleons is the pattern of lit windows down the
//               canyon. The city's own window emission only comes up under
//               them at the end of the move, when a pane is a pixel wide and
//               the hand-off cannot be seen. Reversing the knob runs it
//               backwards; the 'transition' parameter scrubs it by hand. The
//               MIRV deck stands down for the move: it is the one time the eye
//               flies THROUGH the block the near row of the deck lands on, and
//               a cloud column the eye is standing inside is not readable at
//               any step count. The clouds thin out as the move starts and
//               stand again as it lands, ageing all the way through; ground
//               zero, five hundred metres beyond where the move ends, stays.
//   CITY        One city serves both city acts; the act weight only moves the
//               eye. A raymarched block grid, a DDA across thirty-metre lots,
//               avenues every fourth lot and cross streets every fifth, the
//               boulevard on the centre line, a river three lots wide bridged
//               by the boulevard, a rail yard, of SIX families drawn from the
//               lot's hash, a sea of four-to-twenty-five-storey blocks with a
//               few towers: a DECO SETBACK TOWER (three stacked masses, the
//               tall ones), a BRICK PAIR (two walk-ups side by side, a water
//               tank on the taller, a fire escape), a GLASS SLAB (curtain wall,
//               plant room, mast), a SHED (corrugated, a ghost sign, an LED
//               billboard on the roof), a CONCRETE MID-RISE (balconies every
//               floor, a plant box) and a PODIUM + SLAB (a two-storey retail
//               base under a narrower slab). Per lot: footprint, heights,
//               window pitch, lit fraction, colour temperature, a palette tint
//               for the material, signage. Materials carry micro-variation,
//               grime running down from the sills, a wet sheen of the dome;
//               brick courses and panel joints resolve at the pavement's range.
//               Every lit pane is a ROOM: the view ray is carried into a box a
//               cell wide, a floor high, five metres deep, lit ceiling with a
//               fixture, dark floor, furniture silhouetted against the back
//               wall, a screen on some, a figure at the glass in one in seven,
//               blinds, the odd flicker, so the interiors slide against the
//               facade as the eye moves. Panes and curtain walls reflect the
//               dome (the sun as one hard glint where a wall catches it) and
//               rain runs down the glass. Light is the sunset: one hard low
//               sun whose shadow is two height lookups along its bearing (at
//               three degrees every shadow is hundreds of metres long, so what
//               decides it is whether the next blocks clear the ray), the dome
//               as ambient, occlusion at the canyon floor, the bases and the
//               setbacks. Signage keeps the palette's colour: neon tubes (a
//               rectangle tube and glyph strokes) on the podium fronts and the
//               walk-ups, LED boards (dot-matrix glyph columns, a third of
//               them scrolling) up the mid-rises and slabs, the billboards on
//               the sheds. Past the DDA's reach the MEGALOPOLIS goes on: two
//               bands of blocky skyline on the horizon with a scatter of
//               lights, each fading into the haze. Aerial perspective hazes the
//               distance; low fog banks, rain, steam off the gratings, lamp
//               streaks in the wet asphalt (the dome and the sun in it where
//               the trace misses), window grids folding to their average under
//               a pixel, as before.
//   SKY         A pretty sunset, interrupted. The sun low on the left of the
//               look axis (28°, 3.5° up), a warm gradient, a cirrus veil lit
//               from beneath, a cumulus deck on the horizon, a storm cell on
//               the right, the first stars as the dusk deepens. The bursts
//               interrupt it: each adds to a WRECK level that decays over
//               minutes, the ash overcast creeps in, the sun reddens and dims
//               through the dust, the haze goes grey and thickens, the lamps
//               come up. LIGHTNING: the storm cell throws a forked bolt every
//               so often (a ten-segment random walk in azimuth/elevation with a
//               branch, a return stroke in the flash envelope), lighting the
//               cloud bellies and the city faintly; 'lightning' fires one. The
//               bolt is light, not an object: it may appear at full length.
//   THE WRECK   The fronts leave damage. Every burst is a CRATER the scene
//               remembers (up to MAX_DMG, merged when close; the damage at a
//               point is the max over them of a falloff from each ground zero,
//               plus a low plateau out to four and a half radii, the front's
//               wake) until 'rebuild'. The JS lot mirror runs the same rule,
//               so the window gather matches against the wrecked city. Inside
//               the heavy radius the blocks are knocked down to STUMPS (heights
//               scaled, exposed floor slabs across the ragged top, rubble at
//               the foot); a pane past its own threshold is BLOWN OUT, a dark
//               hole, lit no more; one in five of those BURNS (an orange
//               flicker from the room); FIRE SITES (lots inside the crater and
//               round a point ahead of the eye, one in five by hash, the few
//               nearest kept) catch as the front reaches them and stand SMOKE
//               COLUMNS, leaning noise columns rising nine metres a second
//               from the roof, dust-grey as the front passes, black as the
//               fire takes, lit from the fire at the foot, burning out over
//               minutes, the big readable cue behind the front; signage
//               dims; the lamp posts are knocked over by the front and stay
//               down; a DEBRIS SHOWER rides every front, dark chunks waiting
//               on the front at radii round the eye's distance, thrown out
//               along it with gravity and drag as it reaches them.
//   DETONATION  The eye is eighty-odd metres up on the boulevard's axis, the
//               city running away under it to ground zero at the far end,
//               above most of the skyline so the bursts tower over it. At rest
//               the cloud there stands mature and churns, the cap's roll and
//               the stem's updraft are flows of the noise domain, not rotation
//               of anything (the roll fades out on the axis, where its mapping
//               flips). Ground zero detonates on 'detonate' (or a clenched
//               strike): flash, fireball, stem, cap broadening and cooling
//               through orange to ash, the front out across the city, the
//               wreck behind it. SWAY morphs the build (squat and broad <-> tall
//               and turbulent); PRESS flattens the cap; the hand dollies and
//               lifts the eye.
//   SHOCKWAVE   The same city from the pavement, looking down the boulevard.
//               When ground zero goes, the front comes down the road, a shell
//               that refracts what lies behind it, a condensation band just
//               inside it, a dust wall where it meets the ground, lamps
//               flaring and dying as it passes, then arrival: the eye shakes,
//               dust sweeps the view, debris and embers fly, the posts go
//               over, the blocks ahead catch and their smoke climbs, and the
//               boulevard relights from the outside in. SWAY morphs hemisphere
//               <-> Mach stem; PRESS ducks; the hand sets the position across the
//               road and the eye's height.
//
//   MIRV        In the two city acts every pad is an independent re-entry
//               vehicle with its own place, its own yield and its own cloud;
//               several fly and several clouds stand at once (five cloud slots
//               on med, eight on high, four on low; slot zero is ground
//               zero's). A cloud never leaves the frame by winking out: it
//               thins over its last three and a half seconds, whether its life
//               ran out or the deck did. When the deck IS full the slot that
//               goes is the one furthest through its own life, not the one
//               launched first, the deck runs clouds whose lifetimes differ
//               by a factor of three side by side, and evicting by launch
//               order deleted a one-second-old fireball at its brightest while
//               a minute-old ash column stood next to it. The 'full salvo'
//               action fires exactly as many vehicles as the deck is deep,
//               spread across the pad map, for the same reason.
//               PLACE, the Sway's deck is physically two rows of eight, and
//               the rows are two RINGS round the eye: the TOP row (pads 0 to 7)
//               the far ring, 600 to 950 m out across ±48° of the look axis, the
//               BOTTOM row (pads 8 to 15) the near ring, 180 to 380 m out across
//               ±70° (the eye sees ±40°: the far ring lands across the whole
//               frame, the near ring wraps past its edges), the column the
//               bearing from left to right. So a chord lands all around the
//               viewer and the near bursts tower over the frame. Each
//               cell carries a fixed jitter of its own so the pattern never
//               reads as a grid, and the map is deterministic, so it can be
//               learned.
//               YIELD, the pads are chromatic, 0 the lowest note and 15 the
//               highest, and the yield falls with pitch on 0.30 + 0.70·(1 −
//               i/15)^1.35. Pad 0 is a city-killer: a cap five hundred metres
//               up, ten seconds to full height, a minute standing, a front
//               that crosses the whole city. Pad 15 is a tactical burst that
//               tops out around a hundred and fifty, three and a third times
//               smaller in every dimension, up in four seconds, gone in
//               twenty-five. The curve's floor is set by the skyline and not by
//               the arithmetic: a cap that tops out under the rooftops is a
//               flash on a wall and nothing else, which is what the first cut
//               of this scene delivered on the high notes. Cap height and
//               width, stem width, rise, lifetime, front radius, dust, flash
//               and flight time all ride the same curve; velocity trims it.
//               RE-ENTRY, the burst lands ON the hit. The strike begins six
//               hundred metres up and fourteen hundred out to the SIDE of its
//               target (alternating by pad, a little from beyond), and crosses
//               the sky diagonally on a shallow twenty-five-degree line in
//               0.14 to 0.24 s, a
//               STREAK, the way a meteor crosses a sky, two kilometres of
//               track in a fifth of a second, barely an arc, at constant
//               speed (nothing this fast slows visibly in a quarter of a
//               second), and the burst is on the ground before the ear has
//               finished the note. Shallow because that is what the frame can
//               hold: a steep track from high altitude stayed above the top
//               of the picture until its last few frames. What the eye
//               keeps is the LIGHT: a hard white head with a tight violet-white
//               halo and, behind it, a thin streak of ionised air covering the
//               last two thirds of the track, white-hot at the head and
//               thinning to nothing along its length, no puffs, no smoke, no
//               contrail, which is the signature of a slow object, gone as an
//               afterimage in under half a second. Head and streak are sized
//               in ANGLE, not in metres: the thing itself is never resolved at
//               this speed, only its light. Several notes at once arrive as a
//               spread. The city and the deck HIDE them: the world quad
//               writes no depth, so nothing it draws can occlude an impostor
//               on its own, and a vehicle diving at a target twenty-eight
//               blocks away was painted flat across the face of the tower in
//               front of it. The CPU asks the question the depth buffer cannot
//              , the DDA's own lot grid and the same masses, run from the eye
//               to four stations along the track, then the cap and stem bounds
//               of every standing cloud, and eases the answer into the body's
//               and the trail's alpha, so a vehicle passing behind a cornice
//               dims through it instead of blinking.
//               THEN, the flash, the fireball, the cap rising with its
//               toroidal roll, the stem drawing dust off the ground, the
//               condensation cap, and the front crossing the city: every
//               facade turned toward a fireball burns, windows and lamps flare
//               white as the front reaches them and go dark behind it, glass
//               glitters in the front, the ground scorches under the fireball,
//               and the grid relights from the outside in. The shell the eye
//               sees and the blackout the city takes are one radius law, so
//               they are always the same front.
//
// Nothing rotates by itself: the orbits and the dollies are the hand's, the
// pull-back is the knob's, bunches, tracks, fragments, vehicles and the front
// travel paths, the cloud's roll is a flow of the noise domain. Four draw
// calls: the world quad (the analytic backgrounds, the city DDA and its wet
// reflection trace, the cloud march, the front), one instanced mesh of
// screen-space capsules (detector lines, tracks, calorimeter bars, neutron
// streaks, lamp posts, ablation trails), and two instanced meshes of sphere
// impostors (solid, depth-writing: nucleons; additive: bunches, layer hits,
// free neutrons, re-entry bodies and sheaths, the windows the nucleons become,
// embers). Live bloom rides the flash.
//
// The cost centre is the city shading and the cloud deck, in that order: the
// boulevard alone is thirteen milliseconds a frame at 1080p on med, which
// leaves about three for everything the pads land, so every cloud has to be
// cheap by construction rather than by luck.
//
// TWO clouds are marched per ray on med and high and ONE on low. Every extra
// inlined copy of the density map costs the WHOLE shader its occupancy, a
// second march measured 2.4 ms a frame at 1080p even on frames where no ray
// took it, so a deck of six or eight will never fit in marches. The two the
// ray gets are ranked by where it ENTERS their bounds, nearest first, with a
// grazing guard that demotes a cloud the ray only clips behind every cloud it
// goes squarely through: without it a near cloud's grazed limb claims the ray,
// contributes almost nothing, and the cloud behind it is the one that suffers.
// Every cloud past the second is composited COARSELY, the same solid, sampled
// once across the ray's span, with the noise left off, and not dropped: a
// dropped third cloud leaves the silhouette of the second one's BOUND cut out
// of the deck in straight black edges, which is a worse artefact than an
// under-detailed mass at the back. The bound itself is a cap ellipsoid unioned
// with a capped stem cylinder rather than a ball, because empty sky inside a
// bound is a crescent bitten out of whatever stands behind it; the steps are
// apportioned by how much of the frame the cloud fills; a step further outside
// the solid than the noise can carve leaves before it evaluates the noise at
// all, and hands back its distance so the next step strides the whole of the
// empty space instead of walking it.
//
// The deck's uniforms are PACKED: the standing clouds sit at the front of five
// vec4 arrays with a uniform count, so an idle slot costs nothing (a uniform
// loop bound is coherent across the draw where a per-slot skip is not, and five
// idle slots measured a third of a millisecond each), and everything past the
// first array, cap height and radius, stem, carve depth, fire, embers, the
// flow of the noise domain, the fireball's light, is worked out once a frame
// on the CPU, because none of it depends on the pixel and every one of them was
// being recomputed once per cloud per pixel. The DDA skips any mass whose
// height band the ray cannot reach inside that cell; the dust veil's noise runs
// only while there is dust; the fireball terms leave before their divide once
// the fireball is out. Step budgets, the slot cap and the second march come off
// ctx.quality.tier.
//
// Colour comes from the palette: 0 the hot core, 1 fire and tungsten, 2 the
// detector, cool matter and cold window light, 3 the secondary tracks, gamma
// and signage, 4 ash, asphalt and dust, everything structural pulled most of
// the way to its own luminance, because noir keeps its saturation for the
// windows and the signs. Nothing lifts a wall that is turned away from the
// light: the fireballs' term on a facade is purely directional and the air
// glow rides the ray's own fog integral, so a deck standing over the city
// lights the haze and the faces turned toward it and leaves the rest black.

// The launch map is a scene-private module (docs/SCENE_CONTRACT.md, hard rule 4):
// a factory taking THREE, owned and disposed by this scene, never registered.
import { createLaunchMap } from './miraclemile/launchmap.js';

export const meta = {
  id: 'miraclemile',
  name: 'Miracle Mile',
  mood: 'critical',
  controls: {
    actions: [
      { key: 'collide', label: 'collision' },
      { key: 'split', label: 'fission' },
      { key: 'detonate', label: 'ground zero' },
      { key: 'blast', label: 'front only' },
      { key: 'strike', label: 'launch vehicle' },
      { key: 'salvo', label: 'full salvo' },
      { key: 'rebuild', label: 're-seed city' },
      { key: 'lightning', label: 'lightning' },
      { key: 'launchMap', label: 'launch map' },
      { key: 'launchAll', label: 'all launched' },
    ],
    params: [
      { key: 'act', label: 'act', min: 0, max: 3, default: 0 },
      { key: 'yield', label: 'yield', min: 0.05, max: 1, default: 0.5 },
      { key: 'transition', label: 'atom to city', min: 0, max: 1, default: 1 },
      { key: 'cloudScale', label: 'cloud scale', min: 0.35, max: 2.4, default: 1 },
      { key: 'place', label: 'strike place', min: 0, max: 15, default: 0 },
      { key: 'shadowContrast', label: 'shadow contrast', min: 0, max: 1, default: 0.5 },
    ],
  },
};

const ACTS = 4; // collider, fission, detonation, shockwave
const ACT_FADE = 0.7;
const TRANSIT_T = 2.6; // seconds for the atom -> city pull-back
const FOV = 55;

// the collider
const LAYERS = [1.1, 1.8, 2.6, 3.5, 4.6, 5.8];
const HALF_Z = 6;
const RING_SEGS = 36;
const AXIALS = 18;
const DET_CAPS = LAYERS.length * (2 * RING_SEGS + AXIALS) + 1;
const MAX_TRACKS = 120;
const TRACK_SEGS = 20;
const TRACK_CAPS = MAX_TRACKS * TRACK_SEGS;
const MAX_HITS = MAX_TRACKS * 4;
const CALO_R = 6.2;
const TRACK_C = 18; // propagation speed, units per second

// fission
const NUCLEI = 13;
const NUCLEONS = 72;
const NUC_R = 1.0;
const LATTICE_D = 4.0;
const MAX_NEUTRONS = 48;

// the city: metres. The lot grid is keyed by an integer hash mirrored exactly
// in GLSL, so the CPU knows where every facade and every lit window stands.
const CELL = 30;      // lot pitch
const AV = 4;         // an avenue every fourth lot (lot 0 is the boulevard)
const ST = 5;         // a cross street every fifth lot
const H_MAX = 112;    // the DDA's ceiling: nothing stands taller (the deco towers top out here)
const CITY_FAR = 1700;
const LAMPS = 46;
const LAMP_DZ = 30;
const LAMP_Z0 = 60;
const LAMP_X = 19;
const LAMP_H = 8.5;
const EMBERS = 220;
const CARS = 110;     // parked along the kerbs of the boulevard, the avenues and the cross streets
const CLOUD_H = 600;  // the height of the deck the projected light comes through
// open ground across the grid: the river (three lots wide, the boulevard bridged
// over it) and the rail yard, both in lot rows (cz)
const RIVER_C0 = -15, RIVER_C1 = -17;
const YARD_C0 = -27, YARD_C1 = -28;
// the sun, low on the left of the look axis, 28° off it, three and a half
// degrees up, and the storm cell on the right horizon; the wind the smoke leans in
const SUN_AZ = -0.49, SUN_EL = 0.061;
const STORM_AZ = 0.62;
const WIND_X = 0.20, WIND_Z = 0.09;


// the atom hangs in the boulevard; the city eye is 520 m straight back from it
const ATOM_X = 0, ATOM_Y = 46, ATOM_Z = -360;
const TD_LEN = Math.sqrt(0.03 * 0.03 + 1);
const TDX = 0, TDY = 0.03 / TD_LEN, TDZ = 1 / TD_LEN;
const CITY_DIST = 520;
const ATOM_DIST = 11;

// ground zero, and the front that leaves it
const GZ_X = 0, GZ_Z = -900;
const GZ_SCALE = 0.95; // ground zero stays the act's hero cloud at the deck's larger scale

// re-entry vehicles and their clouds
const MAX_RV = 16;
const TRAIL_SEGS = 22;
const CLOUD_U = 40;      // metres of cloud scale at full yield, the bursts are the show
// The pad map is two rings AROUND THE EYE, not two rows in front of it: the far
// ring (pads 0 to 7) at 600 to 950 m across ±48° of the look axis, the near ring
// (pads 8 to 15) at 180 to 380 m across ±70°, the eye sees ±40°, so the far ring
// lands across the whole frame and the near ring wraps past its edges, the
// nearest bursts towering over the top of it. A wider spread was tried first
// (±75° / ±115°): most of the deck then burst out of frame and the performer
// saw a glow at the edge and nothing else. The rings are measured from the
// eye's rest position in DETONATION.
const EYE_X = 0, EYE_Z = 160;
const RING_R = [[600, 950], [180, 380]];
const RING_SPAN = [0.84, 1.22];
// The streak comes in SHALLOW, six hundred metres up, fourteen hundred out
// beyond the target, a descent of about twenty degrees, because that is what
// the eye can see: from sixty metres up looking down the canyon the frame
// reaches twenty-five degrees of elevation, and a steep track from high
// altitude (tried first: 1.5 km up over 600 m) stayed above the frame until its
// last four frames, so the burst arrived without the light that caused it.
// Shallow, the whole streak crosses the upper frame, and the track is still two
// kilometres in a fifth of a second, eleven kilometres a second.
const RV_ALT = 600;
const RV_OUT = 1400;
const STREAK_SPAN = 0.62; // the fraction of the track the light streak covers behind the head

const GLSL_COMMON = /* glsl */ `
  // shared helpers
  #define PI 3.14159265359
  #define TAU 6.28318530718
  // Hashes without a transcendental in them. The cloud march evaluates three
  // octaves of 3-D value noise three times a step, which is eight corner
  // hashes an octave: a sine in the hash would put thousands of them in every
  // pixel, and it did, this is the difference between 25 ms and 8 ms a frame.
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
  float fbm2b(vec2 p) {
    return 0.667 * vnoise2(p) + 0.333 * vnoise2(p * 2.03 + 7.1);
  }
  float fbm2(vec2 p) {
    float n = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { n += a * vnoise2(p); p = p * 2.03 + 7.1; a *= 0.5; }
    return n;
  }
  float fbm3(vec3 p) {
    float n = 0.0, a = 0.5;
    for (int i = 0; i < 3; i++) { n += a * vnoise3(p); p = p * 2.07 + 5.3; a *= 0.5; }
    return n;
  }
  // the cloud's own field: two octaves, normalised to the same range
  float fbm3c(vec3 p) {
    return (0.5 * vnoise3(p) + 0.25 * vnoise3(p * 2.07 + 5.3)) * 1.1667;
  }
  // noir holds saturation back for the signs and the windows: everything
  // structural is the palette pulled most of the way toward its own luminance
  vec3 grey(vec3 c, float k) { return mix(c, vec3(dot(c, vec3(0.299, 0.587, 0.114))), k); }
  // palette ramp: 0..4 between the five entries, 4..5 toward white
  vec3 ramp(vec3 p0, vec3 p1, vec3 p2, vec3 p3, vec3 p4, float t) {
    t = clamp(t, 0.0, 5.0);
    if (t < 1.0) return mix(p0, p1, t);
    if (t < 2.0) return mix(p1, p2, t - 1.0);
    if (t < 3.0) return mix(p2, p3, t - 2.0);
    if (t < 4.0) return mix(p3, p4, t - 3.0);
    return mix(p4, vec3(1.0), t - 4.0);
  }
`;

// ------------------------------------------------------------- the world quad
// Rays come from the camera's frame (uCamPos, uCamFwd/Right/Up, uTanHalf) so
// the analytic backgrounds, the city DDA, the cloud march and the blast agree
// with the capsule and impostor meshes drawn by the same camera.
const WORLD_FRAG = /* glsl */ `
  ${GLSL_COMMON}
  #define CELLF ${CELL}.0
  #define HMAXF ${H_MAX}.0
  #define CFAR ${CITY_FAR}.0
  #define CLOUD_H 600.0
  uniform vec2 uRes;
  uniform vec3 uCamPos, uCamFwd, uCamRight, uCamUp;
  uniform float uTanHalf, uTime, uIntensity, uFlash;
  uniform vec4 uActW; // act weights: collider, fission, detonation, shockwave
  uniform vec3 uPal0, uPal1, uPal2, uPal3, uPal4;
  // collider
  uniform float uVertexGlow, uCollFlash;
  // fission
  uniform vec4 uNuc[${NUCLEI}];  // xyz centre, w glow (0 gone, 1 intact, >1 hot)
  uniform vec4 uGamma[4];        // xyz centre, w radius (<=0 none)
  uniform float uGammaA[4];      // the four shells' brightness
  // the city
  uniform float uCitySeed, uCityFade, uWinFade, uRain, uFogD, uStreet;
  // the sunset and what interrupts it: the sun's direction, the wind the smoke
  // leans in, the ash dusk (uWreck), the haze density, the lamps' level, the
  // lightning's flash and the bolt it draws
  uniform vec3 uSun;
  uniform vec2 uWind;
  uniform float uWreck, uHaze, uLamps, uLtn, uBoltSeed;
  // THE SHADOWS. The sun's shadow is a march along its bearing over the lot
  // grid (uShadowSteps lots, a uniform bound so HLSL does not unroll it; the
  // wet road's reflection takes the short form); the light that reaches the
  // city is gated by the PROJECTED mask of the storm's broken deck and the
  // smoke (uGateT its threshold); every burst is a point light for its flash
  // and throws a hard shadow AWAY from itself (uNFlash of them, the biggest
  // two; uFlashP = x, y, z, r² and uFlashC = amplitude; uFlashExpo the
  // exposure the flash takes off everything it does not light); the etched
  // shadows the wreck keeps trace at uEtchSteps toward each crater's burst
  // (uDmgY its height).
  uniform int uShadowSteps, uShadowStepsLite, uFlashSteps, uEtchSteps, uNFlash, uNEtch;
  uniform vec4 uFlashP[2];
  uniform float uFlashC[2];
  uniform float uFlashExpo, uGateT;
  uniform float uDmgY[MAX_DMG];
  // the wreck: craters (x, z, 1/R², strength), the box round their heavy radii
  // (min x, min z, max x, max z), and the fires the fronts lit (x, z, y, age)
  uniform int uNDmg;
  uniform vec4 uDmg[MAX_DMG];
  uniform vec4 uDmgBox;
  uniform int uNFire;
  uniform vec4 uFire[MAX_FIRE];
  // The clouds. The standing ones are packed at the front of these arrays and
  // uNCloud says how many there are, so an idle slot costs the frame nothing,
  // a uniform loop bound is coherent across the whole draw where a per-slot
  // skip is not, and five idle slots measured a third of a millisecond each.
  // Everything past A is worked out ONCE A FRAME on the CPU, because none
  // of it depends on the pixel and every one of these arrays is read once per
  // cloud per pixel: the two exponentials and the page of arithmetic that used
  // to open every cloud's shading are gone from the fragment shader entirely.
  //   A = (x, z, age, scale)
  //   B = (front radius, stem drift, fire light, fireball amplitude)
  //   C = (cap height, air-glow amplitude, density fade, maturity)
  //   D = (cap radius, cap thickness, stem radius, carve depth)
  //   E = (core radius, fire, ember, cap roll)
  uniform int uNCloud;
  uniform vec4 uCloudA[MAX_CLOUDS];
  uniform vec4 uCloudB[MAX_CLOUDS];
  uniform vec4 uCloudC[MAX_CLOUDS];
  uniform vec4 uCloudD[MAX_CLOUDS];
  uniform vec4 uCloudE[MAX_CLOUDS];
  uniform float uMorph, uPress;
  // the front out of ground zero
  uniform float uBlastAge, uBlastR, uBlastMorph, uBlastFire, uVeil, uDustH;
  in vec2 vUv;
  out vec4 fragColor;

  // ---- collider: the hall, the beam pipe, the interaction point
  vec3 colliderBg(vec3 ro, vec3 rd) {
    vec3 c = cross(rd, vec3(0.0, 0.0, 1.0));
    float cl = length(c);
    float dAx = cl > 1e-5 ? abs(dot(ro, c)) / cl : length(ro.xy);
    float dC = length(cross(ro, rd));
    vec3 col = uPal2 * 0.018 * (0.6 + 0.4 * rd.y);
    col += mix(uPal2, vec3(1.0), 0.3) * 0.07 * exp(-dAx * 2.2);
    col += mix(uPal2, vec3(1.0), 0.5) * (0.3 + uVertexGlow) * exp(-dC * 1.6) * 0.5;
    col += vec3(1.0) * uCollFlash * 0.6 * exp(-dC * 0.35);
    return col;
  }

  // ---- fission: the dark, each nucleus's glow, the gamma shells
  vec3 fissionBg(vec3 ro, vec3 rd) {
    vec3 col = uPal1 * 0.008;
    for (int i = 0; i < ${NUCLEI}; i++) {
      vec4 n = uNuc[i];
      vec3 v = n.xyz - ro;
      float ahead = step(0.0, dot(v, rd));
      float dC = length(cross(v, rd));
      col += mix(uPal1, uPal0, 0.4) * n.w * 0.1 * exp(-dC * dC * 0.8) * ahead;
    }
    for (int k = 0; k < 4; k++) {
      vec4 g = uGamma[k];
      if (g.w <= 0.0) continue;
      float dC = length(cross(g.xyz - ro, rd));
      float rw = (dC - g.w) / (0.06 + g.w * 0.07);
      float ring = exp(-rw * rw);
      col += mix(uPal3, vec3(1.0), 0.5) * ring * uGammaA[k] * 0.9;
    }
    return col;
  }

  // ================================================================ the city
  // An integer hash, evaluated bit-for-bit the same in JS, keys every lot; the
  // CPU reads the same grid to find the windows the nucleons land on.
  uint hu(uint x) { x ^= x >> 16u; x *= 0x7feb352du; x ^= x >> 15u; x *= 0x846ca68bu; x ^= x >> 16u; return x; }
  float hf(uint x) { return float(hu(x) & 0xffffffu) / 16777216.0; }
  uint lotKey(ivec2 c) { return uint(c.x + 1024) * 4096u + uint(c.y + 1024) + uint(uCitySeed) * 7919u; }
  // the river and the rail yard: bands of open ground across the grid
  bool lotRiver(ivec2 c) { return c.y <= (${RIVER_C0}) && c.y >= (${RIVER_C1}); }
  bool lotYard(ivec2 c) { return c.y <= (${YARD_C0}) && c.y >= (${YARD_C1}); }
  bool lotStreet(ivec2 c) {
    // the offsets are multiples of both spacings, so the fraction of the scaled
    // index is the modulo, and no integer division reaches the DDA's inner loop
    return fract((float(c.x) + 4100.0) * ${(1 / AV).toFixed(6)}) < 0.05
        || fract((float(c.y) + 4100.0) * ${(1 / ST).toFixed(6)}) < 0.05
        || lotRiver(c) || lotYard(c);
  }
  // ---- the wreck: the max over every burst of a falloff from its ground zero,
  // plus the front's wake past it (a fifth of the panes out to four and a half
  // radii). Persistent (the bursts' clouds come and go; the damage stays until
  // the city is rebuilt). D = (x, z, 1/R², strength); no sqrt. A texture of
  // the field, one texel a lot, was tried: a fetch in the DDA's inner loop
  // measured six milliseconds slower than this loop, with nothing standing.
  float damageAt(vec2 q) {
    float d = 0.0;
    for (int i = 0; i < MAX_DMG; i++) {
      if (i >= uNDmg) break;
      vec4 D = uDmg[i];
      vec2 dv = q - D.xy;
      float d2 = dot(dv, dv);
      d = max(d, D.w * max(clamp((1.0 - d2 * D.z) * 1.6, 0.0, 1.0), 0.22 * clamp((1.0 - d2 * D.z * 0.05) * 4.0, 0.0, 1.0)));
    }
    return d;
  }
  // the crater term alone, for the geometry, over the STUMPS biggest craters
  // (the list is kept sorted): the wake's plateau never reaches the height a
  // block starts to fall at, and a lot outside the box round the heavy radii
  // never enters the loop, which is what keeps the DDA cheap
  float craterAt(vec2 q) {
    if (uNDmg == 0 || q.x < uDmgBox.x || q.y < uDmgBox.y || q.x > uDmgBox.z || q.y > uDmgBox.w) return 0.0;
    float d = 0.0;
    for (int i = 0; i < STUMPS; i++) {
      if (i >= uNDmg || d >= 1.0) break;
      vec4 D = uDmg[i];
      vec2 dv = q - D.xy;
      d = max(d, D.w * clamp((1.0 - dot(dv, dv) * D.z) * 1.6, 0.0, 1.0));
    }
    return d;
  }

  // one lot: family, plan centre, the up-to-three masses it stands as, its
  // random words. b* = (half x, half z, y base, y top); off = (mass 1 offset,
  // mass 2 offset) off the centre; rnd = plan bits, rnd2 = colour / material /
  // furniture / signage bits. Six families: DECO TOWER (three setback masses,
  // the few towers), BRICK PAIR (two walk-ups side by side, a water tank on the
  // taller), GLASS SLAB (plant room, mast), SHED (a billboard on the roof),
  // CONCRETE MID-RISE (balconies, a plant box), PODIUM + SLAB (a two-storey
  // retail base under a narrower slab). Inside a burst's heavy radius the block
  // is knocked down to a stump. The JS mirror (lotOfJS) runs every number here.
  void lotOf(ivec2 c, out int fam, out vec2 ctr, out vec4 b0, out vec4 b1, out vec4 b2, out vec4 off, out vec4 rnd, out vec4 rnd2, out float top) {
    uint k = lotKey(c);
    uint a = hu(k), b = hu(k ^ 0x9e3779b9u), e = hu(k ^ 0x3c6ef372u);
    rnd = vec4(float(a & 255u), float((a >> 8) & 255u), float((a >> 16) & 255u), float(a >> 24)) * (1.0 / 255.0);
    rnd2 = vec4(float(e & 255u), float((e >> 8) & 255u), float((e >> 16) & 255u), float(e >> 24)) * (1.0 / 255.0);
    float f = float(b & 4095u) * (1.0 / 4096.0);
    float g = float((b >> 12) & 4095u) * (1.0 / 4096.0);
    float g2 = float(b >> 24) * (1.0 / 255.0);
    fam = f < 0.06 ? 0 : (f < 0.36 ? 1 : (f < 0.50 ? 2 : (f < 0.62 ? 3 : (f < 0.85 ? 4 : 5))));
    float hx = CELLF * 0.5 - (3.0 + rnd.x * 4.0);
    float hz = CELLF * 0.5 - (3.0 + rnd.y * 4.0);
    vec2 o = vec2((rnd.z - 0.5) * 3.0, (rnd.w - 0.5) * 3.0);
    if (abs(c.x) == 1) { hx -= 4.0; o.x += c.x > 0 ? 4.0 : -4.0; } // the boulevard is set back
    ctr = vec2(c) * CELLF + o;
    float fall = 1.0 - 0.72 * smoothstep(0.55, 1.0, craterAt(ctr) + (rnd2.x - 0.5) * 0.2);
    off = vec4(0.0);
    b1 = vec4(0.0); b2 = vec4(0.0);
    if (fam == 0) {          // deco setback tower
      float H = (64.0 + g * 48.0) * fall;
      b0 = vec4(hx, hz, 0.0, H * 0.42);
      b1 = vec4(hx * 0.74, hz * 0.74, H * 0.42, H * 0.76);
      b2 = vec4(hx * 0.46, hz * 0.46, H * 0.76, H);
    } else if (fam == 1) {   // two brick walk-ups side by side, a water tank on the taller
      float hxa = hx * (0.36 + rnd2.y * 0.28), hxb = hx - 0.4 - hxa;
      ctr.x -= hx - hxa;
      float H0 = (12.0 + g * 16.0) * fall, H1 = (12.0 + g2 * 16.0) * fall;
      b0 = vec4(hxa, hz, 0.0, H0);
      b1 = vec4(hxb, hz * 0.9, 0.0, H1);
      off.xy = vec2(hxa + 0.4 + hxb, 0.0);
      float Ht = max(H0, H1);
      b2 = vec4(2.6, 2.6, Ht, Ht + 5.5);
      off.zw = (H1 > H0 ? off.xy : vec2(0.0)) + vec2((H1 > H0 ? hxb : hxa) * 0.4 * (rnd.z > 0.5 ? 1.0 : -1.0), -hz * 0.45);
    } else if (fam == 2) {   // glass slab, plant room and a mast
      hx *= 1.06; hz *= 0.60;
      float H = (30.0 + g * 46.0) * fall;
      b0 = vec4(hx, hz, 0.0, H);
      b1 = vec4(hx * 0.55, hz * 0.75, H, H + 4.5);
      b2 = vec4(0.5, 0.5, H + 4.5, H + 18.0);
      off.zw = vec2(hx * 0.32, 0.0);
    } else if (fam == 3) {   // shed: long and low, a billboard standing on the roof, vents
      float H = (7.0 + g * 9.0) * fall;
      b0 = vec4(hx, hz, 0.0, H);
      b1 = vec4(min(hx * 0.8, 7.5), 0.25, H, H + 5.5);
      off.xy = vec2(0.0, (rnd2.z > 0.5 ? 1.0 : -1.0) * (hz - 1.0));
      b2 = vec4(hx * 0.3, hz * 0.3, H, H + 2.5);
      off.zw = vec2(-hx * 0.4, -hz * 0.2 * (rnd2.z > 0.5 ? 1.0 : -1.0));
    } else if (fam == 4) {   // concrete mid-rise, a plant box on the roof
      float H = (18.0 + g * 34.0) * fall;
      b0 = vec4(hx, hz, 0.0, H);
      b1 = vec4(hx * 0.4, hz * 0.45, H, H + 3.2);
      off.xy = vec2(hx * 0.25, -hz * 0.2);
    } else {                 // podium and slab: a two-storey retail base, a narrower slab on it
      float H0 = 7.0 + g2 * 3.5;
      float H = max((H0 + 22.0 + g * 40.0) * fall, H0 + 2.0);
      b0 = vec4(hx, hz, 0.0, H0);
      b1 = vec4(hx * 0.55, hz * 0.62, H0, H);
      off.xy = vec2((rnd2.w - 0.5) * hx * 0.6, (rnd.z - 0.5) * hz * 0.4);
      b2 = vec4(hx * 0.2475, hz * 0.31, H, H + 3.0);
      off.zw = off.xy;
    }
    top = max(max(b0.w, b1.w), b2.w);
  }

  // the ceiling of a lot, undamaged, a bound for the DDA's reach test, so it
  // stays conservative (a stump is never taller than its block was)
  float lotTop(uint k, out int fam, out float g) {
    uint b = hu(k ^ 0x9e3779b9u);
    float f = float(b & 4095u) * (1.0 / 4096.0);
    g = float((b >> 12) & 4095u) * (1.0 / 4096.0);
    float g2 = float(b >> 24) * (1.0 / 255.0);
    fam = f < 0.06 ? 0 : (f < 0.36 ? 1 : (f < 0.50 ? 2 : (f < 0.62 ? 3 : (f < 0.85 ? 4 : 5))));
    if (fam == 0) return 64.0 + g * 48.0;
    if (fam == 1) return 17.5 + max(g, g2) * 16.0;
    if (fam == 2) return 48.0 + g * 46.0;
    if (fam == 3) return 12.5 + g * 9.0;
    if (fam == 4) return 21.2 + g * 34.0;
    return 32.0 + g2 * 3.5 + g * 40.0;
  }

  // ================================================================ the shadows
  // the sun's bearing on the ground, its rise per metre along it, and the
  // inverse, set once a pixel (prepColours)
  vec2 gSunDir; float gRise, gInvRise;
  // Does lot c block a ray leaving p along dir (unit, on the ground) and
  // rising rise per metre? The lot's footprint (the same plan bits lotOf
  // reads, two hashes, no family branches) is slab-tested along the ray, and
  // the ray's height where it ENTERS the footprint is held against the lot's
  // top: a real trace, not a height lookup at a guessed distance. The penumbra
  // widens with that entry distance (the sun is half a degree wide; the flash
  // is a fireball), so the shadow is knife-sharp at the foot of the block that
  // throws it and soft at the far end of its run, the contact hardening of a
  // soft shadow map. fallen takes the crater into account (a stump throws a
  // stump's shadow); the etched shadows pass 0, they were thrown by the
  // blocks as they STOOD at the instant of the flash.
  float lotBlock(ivec2 c, vec3 p, vec2 dir, float rise, float soft, float fallen) {
    uint k = lotKey(c);
    uint a = hu(k);
    float rx = float(a & 255u) * (1.0 / 255.0), rz = float((a >> 8) & 255u) * (1.0 / 255.0);
    float ox = (float((a >> 16) & 255u) * (1.0 / 255.0) - 0.5) * 3.0, oz = (float(a >> 24) * (1.0 / 255.0) - 0.5) * 3.0;
    float hx = CELLF * 0.5 - (3.0 + rx * 4.0), hz = CELLF * 0.5 - (3.0 + rz * 4.0);
    if (abs(c.x) == 1) { hx -= 4.0; ox += c.x > 0 ? 4.0 : -4.0; }
    vec2 ctr = vec2(c) * CELLF + vec2(ox, oz);
    vec2 id = vec2(1.0) / (abs(dir) + vec2(1e-5)) * sign(dir + vec2(1e-7));
    vec2 t1 = (ctr - vec2(hx, hz) - p.xz) * id, t2 = (ctr + vec2(hx, hz) - p.xz) * id;
    vec2 tn = min(t1, t2), tf = max(t1, t2);
    float tIn = max(tn.x, tn.y), tOut = min(tf.x, tf.y);
    if (tOut <= max(tIn, 0.0)) return 1.0;
    tIn = max(tIn, 0.0);
    int fam; float g;
    float top = lotTop(k, fam, g) - 3.0;   // the furniture on the roof is thin; the mass is what shadows
    if (fallen > 0.5) top *= 1.0 - 0.72 * smoothstep(0.55, 1.0, craterAt(ctr));
    float w = soft * (0.35 + tIn * 0.012);
    return smoothstep(-w, w, p.y + rise * tIn - top);
  }
  // The sun's shadow at p: a march along the bearing, the first lots one by
  // one and then at a widening stride out to a few hundred metres, the sun
  // stands three and a half degrees up, so a tower throws its shadow hundreds
  // of metres down the boulevard and what decides the light at a point is
  // whether ANY block along that run clears the ray. own is the cell p
  // stands in (a block does not shadow its own lit face); steps is a uniform
  //, the wet road's trace takes the short form. The result is squared by the
  // callers: the shadow side goes to black.
  float sunShadow(vec3 p, ivec2 own, int steps) {
    float lit = 1.0;
    ivec2 prev = ivec2(100000);
    for (int i = 0; i < steps; i++) {
      float fi = float(i);
      float d = CELLF * (0.55 + 0.62 * fi + 0.075 * fi * fi);
      ivec2 c = ivec2(floor((p.xz + gSunDir * d) / CELLF + 0.5));
      if (c == own || c == prev || lotStreet(c)) { prev = c; continue; }
      prev = c;
      lit = min(lit, lotBlock(c, p, gSunDir, gRise, 1.0, 1.0));
      if (lit < 0.01) break;
    }
    return lit;
  }
  // The flash: a burst is a point light for the instant of its flash, and
  // every block throws a HARD shadow away from it, a march from p toward the
  // burst, the ray climbing to the fireball. fallen as in lotBlock.
  float flashShadow(vec3 p, vec3 B, int steps, float fallen) {
    vec2 dv = B.xz - p.xz;
    float D = length(dv);
    if (D < 2.0) return 1.0;
    vec2 dir = dv / D;
    float rise = (B.y - p.y) / D;
    float lit = 1.0;
    ivec2 prev = ivec2(100000);
    for (int i = 0; i < steps; i++) {
      float d = CELLF * (0.5 + 0.85 * float(i));
      if (d >= D) break;
      ivec2 c = ivec2(floor((p.xz + dir * d) / CELLF + 0.5));
      if (c == prev || lotStreet(c)) { prev = c; continue; }
      prev = c;
      lit = min(lit, lotBlock(c, p, dir, rise, 0.6, fallen));
      if (lit < 0.01) break;
    }
    return lit;
  }
  // THE PROJECTED LIGHT. The sunlight reaching the city comes through the
  // storm's broken deck and the smoke between the sun and the city, so it is
  // gated by a PROJECTED mask, the pen's projection map: a domain-warped fbm,
  // a ridge, the pen's own mask weights and a luma threshold with a 0.1
  // smoothstep, evaluated where the sun ray from p crosses the cloud plane
  // (CLOUD_H), so the pattern is carried along the sun onto whatever it hits;
  // it FLOWS (translation, never rotation) and the wreck thickens it as the
  // ash comes in (the caller raises uGateT). Bands of hard light and cloud
  // shadow sweep the city; the shafts in the haze read the same mask.
  float skyGate(vec3 p) {
    vec2 q = p.xz + gSunDir * ((CLOUD_H - p.y) * gInvRise);
    vec2 fl = vec2(uTime * 5.5, uTime * 3.2);
    vec2 w = q + 110.0 * (vec2(vnoise2(q * 0.0021 + fl * 0.002), vnoise2(q * 0.0021 + vec2(7.3, 2.1) - fl.yx * 0.002)) - 0.5);
    vec2 wa = (w + fl) * 0.0037;
    float nA = 0.75 * fbm2b(wa) + 0.25 * vnoise2(wa * 4.1 + 3.0);
    float nB = fbm2b((w + fl * 0.6) * 0.0083 + 11.0);
    float ridge = 1.0 - abs(2.0 * nB - 1.0);
    float mask = 0.18 + 1.12 * (0.58 * nA + 0.42 * ridge);
    return smoothstep(uGateT, uGateT + 0.1, mask);
  }
  // THE ETCHED SHADOWS. Inside a crater the flash bleached whatever it
  // reached and left the ground and the walls dark wherever a block stood
  // between them and the burst, the silhouette persists in the wreck. Traced
  // toward each crater's burst (the STUMPS biggest) at a reduced step count
  // against the city as it STOOD; 'rebuild' clears the craters and the etch
  // with them. Returns how bleached p is (0 in the silhouette or outside).
  float etchAt(vec3 p) {
    if (uNDmg == 0 || p.x < uDmgBox.x - 60.0 || p.z < uDmgBox.y - 60.0 || p.x > uDmgBox.z + 60.0 || p.z > uDmgBox.w + 60.0) return 0.0;
    float e = 0.0;
    for (int i = 0; i < uNEtch; i++) {
      vec4 D = uDmg[i];
      vec2 dv = p.xz - D.xy;
      float fall = D.w * clamp((1.0 - dot(dv, dv) * D.z) * 1.8, 0.0, 1.0);
      if (fall < 0.05) continue;
      e = max(e, fall * flashShadow(p, vec3(D.x, uDmgY[i], D.y), uEtchSteps, 0.0));
    }
    return e;
  }
  // the flash's light at p on a face n: the two biggest live bursts, each a
  // point light with a hard traced shadow; white-hot on the lit side
  float flashLight(vec3 p, vec3 n) {
    float L = 0.0;
    for (int i = 0; i < uNFlash; i++) {
      vec4 F = uFlashP[i];
      vec3 dv = F.xyz - p;
      float d2 = dot(dv, dv);
      float ndl = dot(n, dv) * inversesqrt(max(d2, 1.0));
      if (ndl < 0.001) continue;
      L += uFlashC[i] * F.w / (F.w + d2) * ndl * flashShadow(p, F.xyz, uFlashSteps, 1.0);
    }
    return L;
  }

  vec3 safeInv(vec3 v) {
    vec3 s = vec3(v.x >= 0.0 ? 1.0 : -1.0, v.y >= 0.0 ? 1.0 : -1.0, v.z >= 0.0 ? 1.0 : -1.0);
    return s / max(abs(v), vec3(1e-7));
  }
  // slab test; the normal comes from whichever slab produced the entry
  float boxT(vec3 ro, vec3 ird, vec3 bmn, vec3 bmx, out vec3 n) {
    n = vec3(0.0, 1.0, 0.0);
    vec3 t1 = (bmn - ro) * ird, t2 = (bmx - ro) * ird;
    vec3 tn = min(t1, t2), tf = max(t1, t2);
    float tN = max(max(tn.x, tn.y), tn.z);
    float tF = min(min(tf.x, tf.y), tf.z);
    if (tF < max(tN, 0.0)) return -1.0;
    vec3 sel = step(tn.yzx, tn.xyz) * step(tn.zxy, tn.xyz);
    n = -sign(ird) * sel;
    return tN > 0.0 ? tN : tF;
  }

  // A DDA across the lot grid. Street lots cost nothing; a built lot tests its
  // masses only while the ray's height band could reach them. tEnd hands back
  // how far the walk got, so the caller knows where the drawn city ends and the
  // megalopolis impostor takes over.
  float traceCity(vec3 ro, vec3 rd, float tMax, int steps, out vec3 nrm, out ivec2 hc, out int hlvl, out float tEnd) {
    nrm = vec3(0.0, 1.0, 0.0); hc = ivec2(0); hlvl = -1; tEnd = 0.0;
    if (ro.y > HMAXF && rd.y >= 0.0) { tEnd = tMax; return -1.0; }
    vec3 ird = safeInv(rd);
    vec2 g = ro.xz / CELLF + 0.5;
    vec2 rg = rd.xz / CELLF;
    ivec2 c = ivec2(floor(g));
    ivec2 st = ivec2(rg.x >= 0.0 ? 1 : -1, rg.y >= 0.0 ? 1 : -1);
    vec2 dl = abs(vec2(1.0) / max(abs(rg), vec2(1e-7)));
    vec2 nx = vec2(
      ((float(c.x) + (st.x > 0 ? 1.0 : 0.0)) - g.x) / (abs(rg.x) < 1e-7 ? 1e-7 * float(st.x) : rg.x),
      ((float(c.y) + (st.y > 0 ? 1.0 : 0.0)) - g.y) / (abs(rg.y) < 1e-7 ? 1e-7 * float(st.y) : rg.y));
    float t0 = 0.0;
    int famQ = 0; float gQ = 0.0;
    for (int i = 0; i < steps; i++) {
      float tc = min(nx.x, nx.y);
      float t1 = min(tc, tMax);
      float ya = ro.y + rd.y * t0, yb = ro.y + rd.y * t1;
      float ylo = min(ya, yb), yhi = max(ya, yb);
      if (ylo < HMAXF && !lotStreet(c) && ylo < lotTop(lotKey(c), famQ, gQ)) {
        int fam; vec2 ctr; vec4 b0, b1, b2, off, rnd, rnd2; float top;
        lotOf(c, fam, ctr, b0, b1, b2, off, rnd, rnd2, top);
        {
          float best = 1e9; vec3 bn = vec3(0.0); int bl = -1;
          for (int j = 0; j < 3; j++) {
            vec4 b = j == 0 ? b0 : (j == 1 ? b1 : b2);
            // the ray's height band inside this cell decides which masses it
            // can reach at all: a water tank on a roof costs nothing to a ray
            // running along the pavement
            if (b.x < 0.05 || b.w < ylo || b.z > yhi) continue;
            vec2 cc = ctr + (j == 1 ? off.xy : (j == 2 ? off.zw : vec2(0.0)));
            vec3 n = vec3(0.0);
            float t = boxT(ro, ird, vec3(cc.x - b.x, b.z, cc.y - b.y), vec3(cc.x + b.x, b.w, cc.y + b.y), n);
            if (t > 0.0 && t < best && t <= t1 + 0.001 && t <= tMax) { best = t; bn = n; bl = j; }
          }
          if (bl >= 0) { nrm = bn; hc = c; hlvl = bl; tEnd = best; return best; }
        }
      }
      tEnd = t1;
      if (t1 >= tMax) break;
      if (rd.y > 0.0 && ro.y + rd.y * t1 > HMAXF) { tEnd = tMax; break; }
      if (nx.x < nx.y) { nx.x += dl.x; c.x += st.x; } else { nx.y += dl.y; c.y += st.y; }
      t0 = t1;
    }
    return -1.0;
  }

  // ---- the front each burst drives across the city (its radius arrives as
  // uCloudB[i].x and its fireball's brightness as uCloudB[i].w, both computed
  // once a frame on the CPU rather than once per pixel per cloud)
  // at a ground point: how much light survives, how hard the front is flaring
  // there right now, how much glass is glittering in it, how burnt the ground
  // is, and how hard the fireballs are lighting it
  void frontAt(vec2 q, out float blown, out float flare, out float glint, out float scorch, out float fireLit, out vec2 fireDir) {
    blown = 1.0; flare = 0.0; glint = 0.0; scorch = 0.0; fireLit = 0.0; fireDir = vec2(0.0);
    for (int i = 0; i < MAX_CLOUDS; i++) {
      if (i >= uNCloud) break;
      vec4 A = uCloudA[i];
      vec4 B = uCloudB[i];
      float sc = A.w;
      vec2 dv = q - A.xy;
      float d2 = dot(dv, dv);
      // Every fireball lights the whole quarter it stands in, while there is a
      // fireball. A cloud a minute old contributes a number with twenty zeroes
      // after the point, and this loop runs once per pixel per cloud, so it
      // leaves before the divide rather than after it.
      if (B.w > 0.0008) {
        float r2 = sc * sc * 170.0;
        float fl = B.w * r2 / (r2 + d2);
        fireLit += fl;
        fireDir -= dv * (fl * inversesqrt(max(d2, 1.0)));
      }
      if (d2 > B.x * B.x) continue;                          // the front is not here yet
      float d = sqrt(d2);
      // when it did reach here. The exact inverse of the radius law wants a
      // pow; a quarter root off it is the same curve to the eye and it is the
      // only transcendental in this loop that ran per pixel per cloud.
      float xr = max(d, 0.001) / (sc * 9.0);
      float since = A.z - xr * sqrt(sqrt(xr));
      // the grid comes back from the outside in: the blocks the front reached
      // last are the ones the crews reach first
      float relight = smoothstep(0.0, 1.0, (since - 14.0 - (1.0 - d / (sc * 45.0)) * 14.0) * 0.075);
      blown *= 1.0 - (1.0 - relight) * 0.95;
      float e = exp(-max(since, 0.0) / 1.2);
      glint += e;
      flare += e * e * 2.0;
      scorch = max(scorch, smoothstep(sc * 3.0, sc * 0.8, d) * smoothstep(0.0, 1.5, A.z));
    }
    flare = min(flare, 2.4);
    fireLit = min(fireLit, 1.9);   // a salvo lights the city, it does not bleach it
    fireDir = fireLit > 0.001 ? normalize(fireDir + vec2(1e-5, 0.0)) : vec2(0.0);
  }

  // ---- lamps down the boulevard: surface light, head glow, and the shaft.
  // "on" is the front's verdict on this stretch of the boulevard, sampled once
  // by the caller: the lamps in a group stand within a few metres of each other
  // and the front is metres wide, so one query serves the whole group.
  float lampLight(vec3 p, float on) {
    float k0 = floor((-p.z - ${-LAMP_Z0}.0) / ${LAMP_DZ}.0);
    float sum = 0.0;
    for (int i = -1; i <= 1; i++) {
      float k = clamp(k0 + float(i), 0.0, ${LAMPS - 1}.0);
      float lz = ${LAMP_Z0}.0 - ${LAMP_DZ}.0 * k;
      for (int s = 0; s < 2; s++) {
        vec3 lp = vec3(s == 0 ? -${LAMP_X}.0 : ${LAMP_X}.0, ${LAMP_H.toFixed(2)}, lz);
        vec3 dv = p - lp;
        float d2 = dot(dv, dv);
        float cosT = max(-dv.y, 0.0) / sqrt(max(d2, 1e-4));
        sum += on * 130.0 * cosT / (d2 + 20.0);
      }
    }
    return sum;
  }
  // the closed form of the integral of 1/(r^2+k) along the ray: real shafts
  vec3 lampAir(vec3 ro, vec3 rd, float tEnd, float on) {
    float tm = min(tEnd, 260.0) * 0.5;
    float zc = ro.z + rd.z * tm;
    float k0 = floor((-zc - ${-LAMP_Z0}.0) / ${LAMP_DZ}.0);
    float sum = 0.0;
    float head = 0.0;
    for (int i = -1; i <= 1; i++) {
      float k = clamp(k0 + float(i), 0.0, ${LAMPS - 1}.0);
      float lz = ${LAMP_Z0}.0 - ${LAMP_DZ}.0 * k;
      for (int s = 0; s < 2; s++) {
        vec3 lp = vec3(s == 0 ? -${LAMP_X}.0 : ${LAMP_X}.0, ${LAMP_H.toFixed(2)}, lz);
        vec3 w = lp - ro;
        float b = dot(w, rd);
        float perp = max(dot(w, w) - b * b, 0.0);
        float c2 = perp + 3.0;
        float sq = sqrt(c2);
        float seen = smoothstep(-40.0, 40.0, b) * smoothstep(tEnd + 40.0, tEnd - 40.0, b);
        sum += 180.0 / (c2 + sq * 57.3) * seen;
        // the head itself: a glow of fixed angular size falling off as 1/d²
        if (b > 3.0 && b < tEnd) head += exp(-perp * 2600.0 / max(b * b, 9.0)) * 2400.0 / max(dot(w, w), 60.0);
      }
    }
    return mix(uPal1, vec3(1.0), 0.35) * on * (sum * 0.12 * (0.35 + uFogD * 90.0) + head * 0.8);
  }

  // ================================================================ the sky
  // A sunset, interrupted. The sun is low on the left; the dome is a warm
  // gradient; a cirrus veil lit from beneath; a cumulus deck on the horizon; a
  // storm cell stands on the right and throws the lightning. uWreck is the ash
  // dusk the bursts leave, the overcast creeps in, the sun reddens and dims
  // through the dust, the haze goes grey, and it decays over minutes.
  // the sun's tint, the haze and the dome's ambient: the same three colours in
  // every function below, so they are worked out once a pixel (prepColours)
  vec3 gSunT, gHaze, gAmb;
  void prepColours() {
    gSunDir = normalize(uSun.xz);
    gRise = uSun.y / max(length(uSun.xz), 1e-4);
    gInvRise = 1.0 / max(gRise, 1e-3);
    gSunT = mix(mix(uPal0, vec3(1.0), 0.55), mix(uPal1, uPal3, 0.5) * 0.8, uWreck * 0.85);
    gHaze = mix(mix(uPal3, uPal0, 0.5) * 0.55, grey(mix(uPal4, uPal1, 0.3), 0.6) * 0.22, uWreck * 0.85);
    gAmb = mix(mix(mix(uPal3, uPal0, 0.5), grey(uPal2, 0.4), 0.5) * 0.40, grey(mix(uPal4, uPal1, 0.3), 0.6) * 0.14, uWreck * 0.85);
  }
  // the dome without its clouds: what glass and wet asphalt reflect
  vec3 skyBase(vec3 rd) {
    float h = clamp(rd.y, 0.0, 1.0);
    vec3 zen = mix(grey(uPal2, 0.35), uPal1, 0.55) * 0.30;
    vec3 hor = mix(uPal3, uPal0, 0.55) * 1.05;
    vec3 col = mix(hor, zen, pow(h, 0.42));
    float sd = max(dot(rd, uSun), 0.0);
    float sd2 = sd * sd, sd4 = sd2 * sd2, sd8 = sd4 * sd4, sd16 = sd8 * sd8, sd32 = sd16 * sd16;
    // the warm band round the sun, its glare, and the disc (HDR, the
    // compositor's limiter takes it)
    col += mix(uPal0, uPal3, 0.4) * sd8 * 0.55 * (1.0 - h * 0.5);
    col += mix(uPal0, vec3(1.0), 0.4) * sd32 * sd16 * 0.9;
    float disc = smoothstep(0.99982, 0.99993, sd);
    col += gSunT * (disc * 16.0 + sd32 * sd32 * sd32 * sd32 * sd32 * sd32 * sd32 * sd32 * 1.4) * (1.0 - uWreck * 0.8);
    vec3 ash = mix(grey(uPal4, 0.5), uPal1, 0.25) * 0.14;
    col = mix(col, ash * (0.6 + 0.8 * (1.0 - h)), uWreck * 0.78);
    return col;
  }

  // a dot-matrix panel: q relative to its centre, hf its half size; glyph-like
  // columns of dots, a gap every fourth column and every sixth row, scrolling
  // where the board is animated. Folds to its average under a pixel.
  vec3 ledBoard(vec2 q, vec2 hf, float seed, float scroll, float aa, vec3 colA) {
    float inside = step(abs(q.x), hf.x) * step(abs(q.y), hf.y);
    if (inside < 0.5) return vec3(0.0);
    vec2 g = (q + hf) * 2.4;
    g.x += scroll;
    vec2 gi = floor(g);
    float gapC = step(0.75, fract(gi.x * 0.25));
    float gapR = step(0.83, fract(gi.y * 0.1667));
    float dt = step(0.42, h21(gi + seed));
    float onF = dt * (1.0 - gapC) * (1.0 - gapR);
    vec2 fr = fract(g) - 0.5;
    float led = mix(smoothstep(0.42, 0.25, length(fr)), 0.55, aa);
    float border = step(abs(q.x), hf.x - 0.12) * step(abs(q.y), hf.y - 0.12);
    return colA * (onF * led * 2.8 * border + 0.05);
  }

  // ---- facades
  // window emission at a facade point; aa folds the grid into its average once
  // a pane falls under a pixel, so the city never crawls. rd is the view ray:
  // behind a lit pane stands a ROOM, a box the cell wide, a floor high, five
  // metres deep, its ceiling lit, its furniture a silhouette against the back
  // wall, and the ray is carried into it, so the interiors slide against the
  // facade as the eye moves. dmg is the wreck here: a pane past its own
  // threshold is BLOWN OUT (a dark hole, lit no more) and one in five of
  // those burns. hole and fire come back for the caller (the wall darkens in
  // the hole; the fire is emission the caller also uses as light).
  vec3 windows(float u, float v, vec3 rd, vec3 n, uint k, int fam, vec4 rnd, vec4 bx, float aa, float blown, float dmg, float rooms, out float lum, out float hole, out float fire, out float paneM) {
    float wx = 3.0 + rnd.x * 1.5, wy = 3.3 + rnd.y * 0.9;
    // most buildings are mostly dark at this hour; a few burn late. The cube
    // pulls the mass of the distribution down so the skyline reads as blocks
    // with a scatter of occupied floors, not a lit grid.
    float litF = 0.03 + 0.5 * rnd.z * rnd.z;
    float ct = rnd.w * 0.5;
    if (fam == 2) { wx = 2.1 + rnd.x * 0.7; wy = 3.1; litF = 0.10 + 0.55 * rnd.z * rnd.z; ct = 0.55 + rnd.w * 0.45; }
    else if (fam == 3) { wx = 4.5 + rnd.x * 2.0; wy = 4.2; litF = 0.03 + rnd.z * 0.12; }
    else if (fam == 4) { wx = 2.6 + rnd.x * 1.2; wy = 3.0; litF = 0.05 + 0.45 * rnd.z * rnd.z; ct = 0.3 + rnd.w * 0.5; }
    else if (fam == 5) { wx = 2.4 + rnd.x * 1.0; wy = 3.2; litF = 0.08 + 0.5 * rnd.z * rnd.z; ct = 0.45 + rnd.w * 0.4; }
    vec3 warm = mix(uPal1, uPal0, 0.30);
    vec3 cool = mix(uPal2, vec3(1.0), 0.30);
    float above = step(bx.z + 1.2, v) * step(v, bx.w - 1.4);
    hole = 0.0; fire = 0.0; paneM = 0.0;
    float broken = smoothstep(0.08, 0.55, dmg);
    // past a pane a pixel wide the grid is its own average, so the far half of
    // the skyline never pays for the pane, the room, the blind or the flicker
    if (aa > 0.985) {
      lum = litF * 0.30 * above * (1.0 - broken);
      hole = broken * 0.30 * above;
      return mix(warm, cool, ct) * lum * blown;
    }
    float v0 = 1.6 + rnd.w * 1.4;
    float fu = u / wx, fv = (v - v0) / wy;
    ivec2 wi = ivec2(floor(fu), floor(fv));
    uint wk = k * 131u + uint(wi.x + 512) * 17u + uint(wi.y + 512) * 71u;
    uint w1 = hu(wk), w2 = hu(wk ^ 0x85ebca6bu);
    float on = step(float(w1 & 4095u) * (1.0 / 4096.0), litF);
    // brightness spread over more than a decade: a desk lamp and a whole floor
    float bh = float((w1 >> 12) & 4095u) * (1.0 / 4096.0);
    float br = 0.06 + 0.95 * bh * bh * bh;
    float ctj = clamp(ct + (float(w2 & 255u) * (1.0 / 255.0) - 0.5) * 0.5, 0.0, 1.0);
    float gu = fract(fu), gv = fract(fv);
    // mullion and spandrel: the pane is well short of its cell
    float pane = step(0.24, gu) * step(gu, 0.78) * step(0.18, gv) * step(gv, 0.64);
    // this pane's own threshold against the wreck: blown out past it
    float pth = float((w2 >> 24) & 255u) * (1.0 / 255.0);
    float blownOut = step(pth * 0.9 + 0.05, dmg) * above;
    float burns = blownOut * step(0.80, float((w1 >> 24) & 255u) * (1.0 / 255.0)) * step(0.25, dmg);
    float near = 1.0 - aa;
    hole = pane * blownOut * near;
    paneM = pane * above * near;
    // a blind drawn in a third of them, and the odd fluorescent flicker
    float blind = 1.0 - 0.55 * step(0.62, float((w2 >> 8) & 255u) * (1.0 / 255.0)) * step(0.5, fract(gv * 6.0));
    float flk = 1.0 - 0.6 * step(0.94, float((w2 >> 16) & 255u) * (1.0 / 255.0)) * step(0.5, h11(floor(uTime * 11.0) + float(wi.x + wi.y)));
    float room = 0.6;   // the rooms' own average, where they are not drawn
    if (rooms > 0.01 && on * pane * above > 0.5 && blownOut < 0.5) {
      // the room: carry the ray in. u runs along the face (p.z on an x-face,
      // p.x on a z-face), v is up, depth is along -n.
      float dd = max(dot(rd, -n), 0.02);
      float du = abs(n.x) > 0.5 ? rd.z : rd.x;
      float dv = rd.y;
      float D = 5.0;
      float uMin = (float(wi.x) + 0.06) * wx, uMax = (float(wi.x) + 0.96) * wx;
      float vMin = (float(wi.y) + 0.06) * wy + v0, vMax = (float(wi.y) + 0.92) * wy + v0;
      float sBack = D / dd;
      float sU = du > 0.0 ? (uMax - u) / max(du, 1e-4) : (uMin - u) / min(du, -1e-4);
      float sV = dv > 0.0 ? (vMax - v) / max(dv, 1e-4) : (vMin - v) / min(dv, -1e-4);
      float s = min(sBack, min(sU, sV));
      float depth = s * dd / D;
      float iu = clamp((u + du * s - uMin) / (uMax - uMin), 0.0, 1.0);
      float iv = clamp((v + dv * s - vMin) / (vMax - vMin), 0.0, 1.0);
      float hr = h11(float(wi.x) * 3.1 + float(wi.y) * 7.7 + float(k & 1023u));
      if (s == sV) {
        // ceiling lit, with a fixture strip across its middle; floor dark
        room = dv > 0.0 ? (0.78 - 0.25 * depth + 0.2 * step(abs(depth - 0.5), 0.1)) : 0.18;
      } else if (s == sU) {
        room = 0.50 - 0.2 * depth;                                   // the side walls
      } else {
        room = 0.62 - 0.15 * iv;                                     // the back wall
        float furn = step(iv, 0.28 + 0.14 * hr);                     // a desk, a counter, a sofa
        room *= 1.0 - 0.55 * furn;
        float scr = step(abs(iu - 0.5), 0.16) * step(abs(iv - 0.58), 0.12) * step(0.6, hr);
        room += scr * 0.55;                                          // a screen, a picture
      }
      // a figure standing at the glass in one room in seven
      float fig = step(0.86, fract(hr * 13.7));
      room *= 1.0 - 0.85 * fig * step(abs(gu - (0.35 + 0.3 * fract(hr * 3.3))), 0.06) * step(gv, 0.56) * step(0.18, gv);
      room = mix(0.6, room, rooms);
    }
    float sharp = on * pane * br * blind * flk * room * (1.0 - blownOut);
    lum = mix(sharp, litF * 0.30 * (1.0 - broken), aa) * above;
    vec3 col = mix(warm, cool, mix(ctj, ct, aa)) * lum * blown;
    if (burns > 0.5) {
      // fire in the blown pane: an orange flicker from inside the room
      float fl = 0.55 + 0.6 * vnoise2(vec2(uTime * 9.0 + float(wi.x) * 3.0, uTime * 5.0 + float(wi.y) * 2.0));
      float inPane = step(0.20, gu) * step(gu, 0.82) * step(0.12, gv) * step(gv, 0.70);
      fire = inPane * fl * near;
      col += mix(uPal1, uPal0, 0.5) * fire * 2.8;
      lum += fire;
    }
    return col;
  }

  // just the material and the panes: what a wet road can carry
  vec3 shadeFacadeLite(vec3 p, vec3 n, vec3 rd, ivec2 c, int lvl, float dist, float blown) {
    int fam; vec2 ctr; vec4 b0, b1, b2, off, rnd, rnd2; float top;
    lotOf(c, fam, ctr, b0, b1, b2, off, rnd, rnd2, top);
    vec4 bx = lvl == 0 ? b0 : (lvl == 1 ? b1 : b2);
    vec2 cc = ctr + (lvl == 1 ? off.xy : (lvl == 2 ? off.zw : vec2(0.0)));
    if (n.y > 0.5) return grey(uPal4, 0.8) * 0.03;
    float u = abs(n.x) > 0.5 ? p.z : p.x;
    float sunD = max(dot(n, uSun), 0.0);
    float shL = sunD > 0.001 ? sunShadow(p, c, uShadowStepsLite) : 0.0;   // the short trace; the gate's average stands in
    float sun = sunD * shL * shL * 0.35;
    float ao = mix(0.4, 1.0, smoothstep(0.0, 22.0, p.y));
    vec3 stone = grey(mix(uPal4, vec3(1.0), 0.18), 0.8) * (fam == 2 ? 0.3 : 1.0);
    vec3 col = stone * (gAmb * ao * 0.45 + gSunT * sun * 0.9 * (1.0 - uWreck * 0.75));
    float lum = 0.0, hole = 0.0, fire = 0.0, paneM = 0.0;
    if (bx.w - bx.z > 8.0) col += windows(u, p.y, rd, n, lotKey(c), fam, rnd, bx, smoothstep(1.4, 4.2, dist * uTanHalf * 2.0 / uRes.y), blown, damageAt(cc), 0.0, lum, hole, fire, paneM) * (0.06 + 1.05 * uWinFade);
    return col * (1.0 - hole * 0.8);
  }

  vec3 shadeFacade(vec3 p, vec3 n, vec3 rd, ivec2 c, int lvl, float dist, float blown, float flare, float glint, float scorch, float fireLit, vec2 fireDir) {
    int fam; vec2 ctr; vec4 b0, b1, b2, off, rnd, rnd2; float top;
    lotOf(c, fam, ctr, b0, b1, b2, off, rnd, rnd2, top);
    vec4 bx = lvl == 0 ? b0 : (lvl == 1 ? b1 : b2);
    vec2 cc = ctr + (lvl == 1 ? off.xy : (lvl == 2 ? off.zw : vec2(0.0)));
    uint k = lotKey(c);
    bool roof = n.y > 0.5;
    bool xface = abs(n.x) > 0.5;
    float u = xface ? p.z : p.x;
    float v = p.y;
    float ucc = xface ? cc.y : cc.x;                     // the face's centre along u
    float uh = xface ? bx.y : bx.x;                      // and its half width
    float px = dist * uTanHalf * 2.0 / uRes.y;           // metres per pixel
    float aa = smoothstep(1.4, 4.2, px);
    float near = 1.0 - aa;
    float close = 1.0 - smoothstep(0.12, 0.5, px);       // brick courses, panel joints: the pavement act's range
    float det = 1.0 - smoothstep(0.30, 0.60, px);        // the rooms, the glyphs, the balconies: a pane several pixels wide
    float dmg = damageAt(cc);
    float hgt = v - bx.z;                                // height above this mass's base

    // ---- light: the sun (hard, low, long shadows), the dome, the occlusion of
    // the canyon floor and the setbacks, the lightning
    // the traced shadow, squared to black, under the projected gate, the
    // face is lit only where every block along the sun's run clears the ray
    // AND the deck is open over that run
    float sunD = max(dot(n, uSun), 0.0);
    float sun = 0.0;
    if (sunD > 0.001) {
      float sh = sunShadow(p, c, uShadowSteps);
      sh *= sh;
      if (sh > 0.01) sun = sunD * sh * skyGate(p);
    }
    float ao = roof ? 0.85 : mix(0.38, 1.0, smoothstep(0.0, 9.0, hgt)) * mix(0.55, 1.0, smoothstep(0.0, 24.0, v));
    if (roof) {
      // the roof darkens against the mass standing on it, and lights at its parapet
      vec2 c1 = ctr + off.xy;
      float d1 = lvl == 0 && b1.x > 0.05 && b1.z <= bx.w + 0.01 ? max(abs(p.x - c1.x) - b1.x, abs(p.z - c1.y) - b1.y) : 50.0;
      ao *= mix(0.5, 1.0, smoothstep(0.0, 4.0, d1));
      float edge = min(bx.x - abs(p.x - cc.x), bx.y - abs(p.z - cc.y));
      ao *= 1.0 + 0.35 * (1.0 - smoothstep(0.3, 1.0, edge));
    }
    vec3 amb = gAmb;
    vec3 sunCol = gSunT * (1.0 - uWreck * 0.75);
    // the flash takes the exposure: everything it does not light goes toward
    // black while it lasts, and the faces it reaches go white-hot
    float expo = 1.0 / (1.0 + uFlashExpo);
    vec3 light = (amb * ao * (0.62 + 0.38 * (n.y * 0.5 + 0.5)) + sunCol * sun * 1.5) * expo;
    light += mix(uPal2, vec3(1.0), 0.5) * uLtn * 0.10;
    if (uNFlash > 0) light += mix(uPal0, vec3(1.0), 0.75) * flashLight(p, n) * 2.2;

    // ---- material: micro-variation, grime running down from the sills, a wet sheen
    float g1 = vnoise2(vec2(u, v) * 0.55 + rnd.xy * 17.0);
    float g2n = close > 0.0 ? vnoise2(vec2(u, v) * 3.1 + rnd.zw * 9.0) : 0.5;
    float grain = 0.78 + 0.30 * g1 + 0.14 * g2n;
    float streak = vnoise2(vec2(u * 2.6, v * 0.16) + rnd.wz * 5.0);
    float grime = 1.0 - 0.38 * smoothstep(0.42, 0.8, streak) * (0.45 + 0.55 * (1.0 - smoothstep(0.0, 18.0, hgt)));
    vec3 tintA = rnd2.x < 0.33 ? uPal1 : (rnd2.x < 0.66 ? uPal2 : uPal0);
    vec3 base = grey(mix(uPal4, tintA, 0.10 + rnd2.y * 0.22), 0.7);
    float albedo = 0.42;
    vec3 rr = reflect(rd, n);
    float fres = pow(1.0 - max(dot(-rd, n), 0.0), 5.0);
    float wetF = uRain * 0.7;
    if (fam == 0) { base = grey(mix(uPal4, mix(uPal0, vec3(1.0), 0.5), 0.30), 0.75); albedo = 0.52; }          // limestone
    else if (fam == 1) {                                                                                      // brick
      base = grey(mix(uPal4, uPal1, 0.40), 0.45) * (lvl == 2 ? 0.5 : 1.0);
      albedo = 0.34;
      float course = step(0.88, fract(v * 4.0)) + step(0.93, fract(u * 2.0 + step(0.5, fract(v * 2.0)) * 0.5));
      grain *= 1.0 - 0.35 * clamp(course, 0.0, 1.0) * close;
    }
    else if (fam == 3) {                                                                                      // corrugated sheet, rust
      base = grey(mix(uPal4, uPal1, 0.22), 0.6); albedo = 0.36;
      grain *= 0.85 + 0.25 * step(0.5, fract(v * 1.6)) * close + 0.2 * smoothstep(0.55, 0.8, vnoise2(vec2(u, v) * 1.3 + rnd.yx * 4.0));
    }
    else if (fam == 4) {                                                                                      // concrete panels
      albedo = 0.46;
      float joint = step(0.95, fract(u * 0.25)) + step(0.93, fract(v * 0.3333));
      grain *= 1.0 - 0.25 * clamp(joint, 0.0, 1.0) * close;
    }
    else if (fam == 5 && lvl == 0) { base = grey(mix(uPal4, tintA, 0.25), 0.5); albedo = 0.30; }            // the podium: dark stone
    vec3 col = base * albedo * grain * grime * light;
    // the wet sheen: the dome, and the sun where the face can catch it
    col += gAmb * 2.2 * (0.02 + 0.25 * fres) * wetF * (1.0 - float(roof) * 0.6);
    bool glassSkin = (fam == 2 && !roof) || (fam == 5 && lvl == 1 && !roof && rnd2.z > 0.45);
    float lum = 0.0, hole = 0.0, fire = 0.0, paneM = 0.0;
    if (glassSkin) {
      // a curtain wall: the dome in it above the horizon, the dark canyon below,
      // the sun as one hard glint, mullions and the spandrel bands between
      // floors; rain runs down it
      float run = uRain * near > 0.01 ? smoothstep(0.55, 0.85, vnoise2(vec2(u * 4.0, v * 0.3 - uTime * 0.7) + rnd.xy * 3.0)) * uRain * near : 0.0;
      vec3 rr2 = normalize(rr + vec3(0.0, run * 0.25, 0.0));
      vec3 refl = rr2.y > 0.0 ? skyBase(rr2) : mix(grey(uPal4, 0.7) * 0.03, gHaze * 0.6, clamp(-rr2.y * 4.0, 0.0, 1.0) * 0.3);
      float F = 0.04 + 0.42 * fres;
      float mull = step(0.90, fract(u / (2.1 + rnd.x * 0.7))) + step(0.0, fract(v * 0.3226) - 0.82);
      float spandrel = step(0.82, fract(v / 3.1));
      col = mix(refl * F * 0.75 * (1.0 - spandrel * 0.7), base * 0.35 * light, clamp(mull, 0.0, 1.0) * near * 0.8);
      float gl = max(dot(rr2, uSun), 0.0);
      float gl2 = gl * gl, gl4 = gl2 * gl2, gl16 = gl4 * gl4 * gl4 * gl4;
      col += sunCol * (gl16 * gl16 * gl16 * gl16 * 4.0 + gl16 * 0.08) * (1.0 - spandrel * 0.8);
      col *= 1.0 - run * 0.15;
    }
    if (roof) {
      // tar and gravel, standing water carrying the dome, and whatever the block keeps up there
      float wetR = smoothstep(0.45, 0.7, vnoise2(p.xz * 0.09 + rnd.zw * 7.0)) * (0.3 + uRain * 0.7);
      vec3 pud = skyBase(vec3(rr.x, abs(rr.y), rr.z));
      col = grey(uPal4, 0.85) * (0.30 + 0.35 * vnoise2(p.xz * 1.6)) * light * 0.7;
      col = mix(col, pud * (0.08 + 0.5 * fres), wetR * 0.85);
      if (lvl > 0) col *= 0.8;
    }
    if (bx.w - bx.z > 8.0 && !roof) {
      vec3 wcol = windows(u, v, rd, n, k, fam, rnd, bx, aa, blown, dmg, det, lum, hole, fire, paneM);
      // the dome reflected in every pane (the curtain walls did their own)
      vec3 refl = rr.y > 0.0 ? gHaze * (1.2 + rr.y * 1.5) : grey(uPal4, 0.7) * 0.02;
      if (!glassSkin) col = mix(col, refl * (0.04 + 0.5 * fres) + base * 0.1 * light, paneM * 0.7 * (1.0 - hole));
      col += wcol * (0.06 + 1.05 * uWinFade);
      col *= 1.0 - hole * 0.85;
    }

    bool boardHere = (fam == 4 && rnd2.w > 0.62) || (fam == 2 && rnd2.w > 0.86) || (fam == 0 && lvl == 1 && rnd2.w > 0.7) || (fam == 5 && lvl == 1 && rnd2.w > 0.8);
    bool neonHere = (fam == 5 && lvl == 0) || (fam == 1 && lvl < 2 && rnd2.z > 0.45) || (fam == 4 && rnd2.z > 0.82);
    float signAlive = blown * (1.0 - smoothstep(0.15, 0.6, dmg) * 0.9);
    vec3 neonCol = mix(uPal3, rnd2.y > 0.5 ? uPal2 : uPal0, 0.6 * rnd2.x);
    if (!roof && det <= 0.01) {
      // the far form of the signage: the board's and the tube's average over their rectangles
      if (boardHere) {
        vec2 hf = vec2(min(3.6, uh * 0.8), 2.0 + rnd2.x * 1.4);
        float sy = bx.z + (bx.w - bx.z) * (0.45 + 0.35 * rnd2.y);
        vec2 q = vec2(u - ucc, v - sy);
        vec3 bc = rnd2.x > 0.66 ? uPal3 : (rnd2.x > 0.33 ? uPal2 : mix(uPal0, uPal3, 0.5));
        col += bc * step(abs(q.x), hf.x) * step(abs(q.y), hf.y) * 0.9 * signAlive;
      }
      if (neonHere) {
        float sy = bx.z + (fam == 5 ? 5.0 : 3.4 + rnd2.w * 5.0);
        float sw = min(2.0 + rnd2.x * 3.0, uh - 1.0);
        vec2 q = vec2(u - ucc - (rnd2.w - 0.5) * 4.0, v - sy);
        col += neonCol * step(abs(q.y), 1.2) * step(abs(q.x), sw + 0.4) * 0.7 * signAlive;
      }
      if (fam == 3 && lvl == 1 && !xface) col = base * 0.2 * light + (rnd2.y > 0.5 ? uPal3 : mix(uPal2, uPal0, rnd2.x)) * 0.8 * signAlive;
    }
    if (!roof && det > 0.01) {
      // cornice: a lit lip and the shadow it throws
      float cn = smoothstep(bx.w - 1.5, bx.w - 0.9, v) * (1.0 - step(bx.w, v));
      float cnS = smoothstep(bx.w - 3.4, bx.w - 1.6, v) * (1.0 - smoothstep(bx.w - 1.6, bx.w - 1.4, v));
      float hasCn = glassSkin ? 0.15 : 1.0;
      col += base * cn * (0.02 + 0.5 * sun + 0.3 * amb.g) * hasCn - base * cnS * 0.03 * hasCn;
      if (fam == 0) {
        // deco piers: vertical ribs catching the sun, and a banded crown
        float rib = smoothstep(0.40, 0.5, abs(fract(u / 3.6) - 0.5));
        col += base * rib * light * 0.16;
        float crown = step(bx.w - 7.0, v) * step(0.55, fract(v * 0.9));
        col += base * crown * light * 0.20;
      }
      if (fam == 1 && lvl < 2) {
        // fire escape: platforms every floor, rails, a diagonal run, over a
        // band of the facade
        float wy = 3.3 + rnd.y * 0.9;
        float band = 1.0 - smoothstep(2.4, 3.2, abs(u - (ucc + (rnd.w - 0.5) * 5.0)));
        float fvv = fract((v - 1.0) / wy);
        float plat = step(fvv, 0.10);
        float rail = step(0.10, fvv) * step(fvv, 0.16);
        float diag = step(abs(fract(u * 0.32 + fvv) - 0.5), 0.06) * step(0.16, fvv);
        float fe = clamp(plat + rail * 0.6 + diag * 0.5, 0.0, 1.0) * band * near;
        col = mix(col, grey(uPal4, 0.9) * 0.25 * light, fe * 0.9);
      }
      if (fam == 4) {
        // balconies: a slab every floor across the face, its shadow under it
        float fvv = fract((v - 0.4) / 3.0);
        float slab = step(fvv, 0.10) * step(1.5, abs(u - ucc) - 0.0) * step(abs(u - ucc), uh - 0.8);
        float under = smoothstep(0.28, 0.10, fvv) * (1.0 - slab);
        col = mix(col, base * albedo * light * 1.1, slab * near * 0.9);
        col *= 1.0 - under * 0.35 * near;
      }
      if (fam == 3 && lvl == 0) {
        // a painted sign across the flank, ghosted
        float paint = smoothstep(0.45, 0.55, vnoise2(vec2(u * 0.35, v * 0.7) + rnd.zw * 9.0)) * step(v, bx.w - 2.0) * step(bx.z + 3.0, v);
        col += base * paint * light * 0.22;
      }
      // ---- signage: the few saturated things in the frame. The palette keeps
      // its colour here, neon tubes on the podium fronts and the walk-ups, LED
      // boards up the mid-rises and the slabs, the billboard on the shed's roof.
      if (neonHere) {
        float sy = bx.z + (fam == 5 ? 5.0 : 3.4 + rnd2.w * 5.0);
        float sw = min(2.0 + rnd2.x * 3.0, uh - 1.0);
        float sc0 = ucc + (rnd2.w - 0.5) * 4.0;
        vec2 q = vec2(u - sc0, v - sy);
        // a rectangle outline tube, and a row of glyph tubes inside it
        float dRect = abs(max(abs(q.x) - sw, abs(q.y) - 0.85));
        float gq = fract((q.x + sw) * 1.25);
        float glyph = step(abs(q.y), 0.45) * step(abs(q.x), sw - 0.4) * (step(abs(gq - 0.25), 0.05) + step(abs(q.y - 0.45 * (fract(q.x * 0.7) - 0.5)), 0.05) * step(gq, 0.75));
        float tube = exp(-dRect * dRect * 70.0) + clamp(glyph, 0.0, 1.0);
        float halo = exp(-dRect * dRect * 2.0) * 0.22;
        float nflk = 0.7 + 0.3 * step(0.12, h11(floor(uTime * 11.0) + rnd2.w * 40.0));
        float avg = step(abs(q.y), 1.2) * step(abs(q.x), sw + 0.4) * 0.35;
        col += neonCol * (mix(tube * 3.2, avg * 2.0, aa) + halo * 0.7) * nflk * signAlive;
      }
      if (boardHere) {
        vec2 hf = vec2(min(3.6, uh * 0.8), 2.0 + rnd2.x * 1.4);
        float sy = bx.z + (bx.w - bx.z) * (0.45 + 0.35 * rnd2.y);
        float scroll = rnd2.z > 0.55 ? uTime * (1.6 + rnd2.z * 3.0) : 0.0;
        vec3 bc = rnd2.x > 0.66 ? uPal3 : (rnd2.x > 0.33 ? uPal2 : mix(uPal0, uPal3, 0.5));
        col += ledBoard(vec2(u - ucc, v - sy), hf, rnd2.w * 91.0, scroll, aa, bc) * signAlive;
      }
      if (fam == 3 && lvl == 1 && !xface) {
        // the billboard: the whole face is one board, scrolling on a third of them
        float scroll = rnd2.z > 0.66 ? uTime * 2.4 : 0.0;
        vec3 bc = rnd2.y > 0.5 ? uPal3 : mix(uPal2, uPal0, rnd2.x);
        col = base * 0.2 * light + ledBoard(vec2(u - ucc, v - (bx.z + bx.w) * 0.5), vec2(bx.x - 0.2, (bx.w - bx.z) * 0.5 - 0.2), rnd2.w * 57.0, scroll, aa, bc) * signAlive;
      }
    }
    // the wreck: exposed floor slabs across a stump's ragged top, the rubble at its foot
    float stump = smoothstep(0.55, 0.9, dmg);
    if (stump > 0.01 && !roof) {
      float slabs = step(0.88, fract(v * 0.303)) * smoothstep(bx.w - 12.0, bx.w - 2.0, v);
      col = mix(col, grey(uPal4, 0.8) * 0.35 * light, stump * slabs * 0.8);
      col *= 1.0 - stump * 0.3 * smoothstep(0.4, 0.65, vnoise2(vec2(u * 0.7, v * 0.5) + rnd.xy * 3.0));
    }
    // the etched shadow: inside the crater the flash bleached the wall where it
    // reached it and left the silhouette of whatever stood between
    if (dmg > 0.3 && !roof) {
      float et = etchAt(p);
      if (et > 0.01) col = mix(col, (base * albedo * grain * 2.4 + grey(uPal4, 0.9) * 0.08) * light * (1.0 - hole * 0.6), et * 0.6);
    }
    // the street lamps reach the lower floors
    if (p.y < 46.0) col += lampLight(p, clamp(blown + flare * 0.5, 0.0, 2.0)) * mix(uPal1, uPal0, 0.3) * 0.22 * uLamps * max(1.0 - n.y, 0.15) * expo;
    // Every fireball is a light: the facades turned toward it burn. The term is
    // PURELY directional and carries no ambient share at all, the smallest
    // floor here is a floor under every wall in frame, and with a deck standing
    // it lifted the whole city to a flat mid grey and took the blacks with it.
    // A wall turned away from every fireball stays unlit however many stand.
    vec3 fireCol = mix(uPal1, uPal0, 0.45);
    float face = roof ? 0.75 : clamp(n.x * fireDir.x + n.z * fireDir.y, 0.0, 1.0);
    col += fireCol * fireLit * 0.11 * face * face * grain;
    // the front: a hard white edge as it arrives, glass glittering behind it
    col += mix(uPal0, vec3(1.0), 0.6) * flare * (0.04 + sun * 0.08);
    col += vec3(1.0) * glint * (0.10 + lum) * 0.35 * near;
    col *= 1.0 - scorch * 0.6;
    return col;
  }

  // ---- the ground: asphalt, kerbs, markings, the river, the yard, wet reflection
  vec3 shadeGround(vec3 ro, vec3 rd, vec3 p, float dist, float blown, float flare, float glint, float scorch, float fireLit) {
    // the ground faces every fireball equally, so it takes the sum as it comes
    ivec2 c = ivec2(floor(p.xz / CELLF + 0.5));
    bool street = lotStreet(c);
    bool river = lotRiver(c);
    bool yard = lotYard(c);
    vec2 lc = p.xz - vec2(c) * CELLF;                 // position inside the lot
    float edgeD = min(CELLF * 0.5 - abs(lc.x), CELLF * 0.5 - abs(lc.y));
    float kerb = 1.0 - smoothstep(0.35, 0.7, edgeD);
    float gn = 0.75 + 0.5 * vnoise2(p.xz * 0.7);
    float wet = uRain * smoothstep(0.34, 0.66, fbm2b(p.xz * 0.035 + 3.1));
    float dmg = damageAt(p.xz);
    // light: the dome into the canyon, the sun where the blocks let it through
    //, the traced shadow squared to black, the projected gate over it; the
    // long dark lanes the towers throw down the grid are this number
    float shadowG = sunShadow(p, ivec2(100000), uShadowSteps);
    shadowG *= shadowG;
    if (shadowG > 0.01) shadowG *= skyGate(p);
    float sun = shadowG * max(uSun.y, 0.0) * 4.0;
    float aoG = street ? mix(0.55, 1.0, smoothstep(0.0, 10.0, edgeD)) : 0.5;
    float expo = 1.0 / (1.0 + uFlashExpo);
    vec3 light = (gAmb * aoG * 0.8 + gSunT * sun * (1.0 - uWreck * 0.75)) * expo;
    light += mix(uPal2, vec3(1.0), 0.5) * uLtn * 0.08;
    if (uNFlash > 0) light += mix(uPal0, vec3(1.0), 0.75) * flashLight(p, vec3(0.0, 1.0, 0.0)) * 2.2;
    vec3 col = vec3(0.0);
    vec3 tar = grey(uPal4, 0.85);
    if (river && abs(p.x) > 17.0) {
      // the water: the dome in it, broken by ripples; the bridge carries the boulevard across
      vec3 nw = normalize(vec3((vnoise2(p.xz * 0.22 + uTime * 0.25) - 0.5) * 0.14, 1.0, (vnoise2(p.xz * 0.22 + 7.0 - uTime * 0.18) - 0.5) * 0.14));
      vec3 rr = reflect(rd, nw);
      rr.y = abs(rr.y);
      float fr = pow(1.0 - max(-rd.y, 0.0), 4.0);
      // the blocks' shadow lies across the water as it does across the road
      col = mix(grey(mix(uPal2, uPal4, 0.5), 0.6) * 0.03 * light, skyBase(rr) * 0.75 * (0.45 + 0.55 * shadowG) * expo, 0.12 + 0.88 * fr);
      col += mix(uPal1, uPal0, 0.45) * fireLit * 0.04;
      col *= 1.0 - scorch * 0.4;
    } else {
    if (street) {
      vec3 asphalt = tar * 0.19 * gn;
      float centre = 1.0 - smoothstep(0.10, 0.22, abs(p.x));
      float lane = step(0.5, fract(-p.z / 9.0)) * (1.0 - smoothstep(0.10, 0.2, abs(abs(p.x) - 7.5)));
      float edge = 1.0 - smoothstep(0.12, 0.26, abs(abs(p.x) - 13.6));
      float onBlvd = c.x == 0 ? 1.0 : 0.0;
      vec3 paint = mix(tar, vec3(1.0), 0.8) * 0.6 * onBlvd;
      col = asphalt + paint * (centre * 0.8 + lane + edge * 0.5);
      if (yard && c.x != 0) {
        // the rail yard: ballast and rails running across the grid
        float rail = step(0.93, fract(p.z * 0.6)) + step(0.93, fract(p.z * 0.6 + 0.3));
        col = mix(tar, vec3(1.0), 0.1) * 0.22 * gn + grey(mix(uPal4, uPal2, 0.3), 0.5) * 0.45 * clamp(rail, 0.0, 1.0);
      }
      if (river) col = asphalt * 1.1 + paint * centre * 0.8 + mix(tar, vec3(1.0), 0.3) * 0.3 * step(14.0, abs(p.x));   // the bridge deck and its parapets
      col *= light;
    } else {
      col = (mix(tar, vec3(1.0), 0.16) * 0.26 * gn + mix(tar, vec3(1.0), 0.3) * kerb * 0.20) * light;
    }
    // ---- the rubble: PILES, never a carpet. Heaps at the feet of the stumps
    // and along the bases of the standing blocks on the burst side, drifts
    // down the streets on the blast bearing (radially out from each crater,
    // fading with distance, thicker where two wakes overlap), clumps and
    // clear patches by a noise, the boulevard's centre line scoured thin by
    // the blast wind and the rubble piled at the kerbs and corners, glass
    // glitter on the asphalt where the panes blew out, and the etched shadow
    // on the bare ground between.
    float wreckG = smoothstep(0.12, 0.5, dmg);
    if (wreckG > 0.01) {
      float drift = 0.0; vec2 blastDir = vec2(0.0);
      for (int i = 0; i < MAX_DMG; i++) {
        if (i >= uNDmg) break;
        vec4 D = uDmg[i];
        vec2 dv = p.xz - D.xy;
        float d2 = dot(dv, dv);
        float reach = D.w * clamp((1.0 - d2 * D.z * 0.3) * 1.3, 0.0, 1.0);   // the wake, to ~1.8 radii
        if (reach < 0.02) continue;
        float d = sqrt(d2);
        float th = atan(dv.y, dv.x);
        // streaked ALONG the radial: fine across it, slow along it
        float streak = 0.65 * vnoise2(vec2(th * 18.0, d * 0.025 + float(i) * 3.0)) + 0.35 * vnoise2(vec2(th * 47.0 + 5.0, d * 0.06));
        drift += reach * smoothstep(0.40, 0.72, streak);
        blastDir += dv / max(d, 1.0) * reach;
      }
      float bl = length(blastDir);
      blastDir = bl > 1e-4 ? blastDir / bl : vec2(1.0, 0.0);
      float heap;
      if (street) heap = exp(-edgeD * 0.33) * 0.9;                     // the kerbs and the corners
      else {
        // the foot of the block on this lot (the same plan bits lotBlock reads)
        uint a = hu(lotKey(c));
        float hxf = CELLF * 0.5 - (3.0 + float(a & 255u) * (1.0 / 255.0) * 4.0), hzf = CELLF * 0.5 - (3.0 + float((a >> 8) & 255u) * (1.0 / 255.0) * 4.0);
        vec2 ctrf = vec2(c) * CELLF + vec2((float((a >> 16) & 255u) * (1.0 / 255.0) - 0.5) * 3.0, (float(a >> 24) * (1.0 / 255.0) - 0.5) * 3.0);
        if (abs(c.x) == 1) { hxf -= 4.0; ctrf.x += c.x > 0 ? 4.0 : -4.0; }
        vec2 outv = p.xz - ctrf;
        float dFoot = max(abs(outv.x) - hxf, abs(outv.y) - hzf);
        float facing = 0.5 - 0.5 * dot(normalize(outv + vec2(1e-4, 0.0)), blastDir);   // the side turned toward the burst
        heap = exp(-max(dFoot, 0.0) * 0.3) * (0.35 + 0.65 * facing) * (0.55 + 0.7 * smoothstep(0.55, 0.9, dmg));
      }
      float clump = smoothstep(0.30, 0.72, fbm2b(p.xz * 0.045 + 1.7));
      float scour = 1.0 - 0.7 * exp(-min(lc.x * lc.x, lc.y * lc.y) / 80.0) * float(street);
      float rub = clamp((heap + drift * 0.8) * (0.35 + 0.65 * clump) * scour + 0.18 * clump, 0.0, 1.0) * wreckG;
      rub = max(rub, 0.55 * smoothstep(0.55, 0.9, dmg) * clump);
      // the lumps, lit on the side that faces the sun
      float lump = vnoise2(p.xz * 0.9 + 2.0);
      float lump2 = vnoise2((p.xz + gSunDir * 0.5) * 0.9 + 2.0);
      float relief = clamp((lump2 - lump) * 5.0, -0.5, 0.5);
      float fine = 0.5 + 0.5 * vnoise2(p.xz * 3.0);
      vec3 rubCol = grey(uPal4, 0.85) * (0.20 + 0.30 * smoothstep(0.48, 0.72, lump) * fine) * light * (0.75 + 0.6 * relief * (0.4 + 0.6 * shadowG * 3.0));
      col = mix(col, rubCol, rub);
      // glass on the asphalt: points of the dome, hard sun glints where the sun reaches
      vec2 gc = floor(p.xz * 7.0), gf = fract(p.xz * 7.0) - 0.5;
      float glit = step(0.985, h21(gc)) * smoothstep(0.22, 0.0, length(gf)) * smoothstep(0.2, 0.6, dmg) * (1.0 - rub * 0.7) * (1.0 - smoothstep(60.0, 200.0, dist));
      col += mix(gSunT, vec3(1.0), 0.3) * glit * (0.10 + 2.0 * shadowG);
      // the etched shadow on the bare ground
      float et = etchAt(p);
      if (et > 0.01) col = mix(col, grey(mix(uPal4, vec3(1.0), 0.45), 0.85) * 0.55 * light, et * 0.6 * (1.0 - rub * 0.8));
    }
    float lampOn = clamp(blown + flare * 0.5, 0.0, 2.0) * uLamps * (1.0 - smoothstep(0.3, 0.6, dmg));
    col += lampLight(p, lampOn) * mix(uPal1, uPal0, 0.25) * 0.62 * gn * (0.55 + wet * 0.8);
    col += mix(uPal1, uPal0, 0.45) * fireLit * 0.055 * gn;
    // wet asphalt: a second, shorter trace of the reflected ray, torn up
    // vertically so it smears the way a wet road smears; where the trace
    // misses, the dome itself lies in the film, the sunset in the street
    #if REF_STEPS > 0
    float fr = 1.0 - max(-rd.y, 0.0);
    float fr2 = fr * fr;
    float fres = 0.06 + 0.94 * fr2 * fr2 * fr;
    float kw = clamp(wet * fres * 2.2, 0.0, 0.62) * (1.0 - smoothstep(110.0, 170.0, dist));
    if (kw > 0.015) {
      vec3 rr = reflect(rd, vec3(0.0, 1.0, 0.0));
      float rough = 0.035 + 0.05 * (1.0 - wet);
      rr.y += rough * (vnoise2(p.xz * vec2(1.9, 0.16) + uTime * 0.4) - 0.5) * 2.0;
      rr = normalize(rr);
      vec3 rn = vec3(0.0); ivec2 rc = ivec2(0); int rl = 0; float rEnd = 0.0;
      float rt = traceCity(p + vec3(0.0, 0.02, 0.0), rr, 260.0, REF_STEPS, rn, rc, rl, rEnd);
      vec3 refl = skyBase(rr) * 0.8;
      if (rt > 0.0) refl = mix(shadeFacadeLite(p + rr * rt + vec3(0.0, 0.02, 0.0), rn, rr, rc, rl, dist + rt, blown), refl, clamp(rt / 260.0, 0.0, 0.7));
      col = mix(col, col * 0.7 + refl * 0.9, kw);
    }
    #else
    {
      float fr = 1.0 - max(-rd.y, 0.0);
      float fr2 = fr * fr;
      float kw = clamp(wet * (0.06 + 0.94 * fr2 * fr2 * fr) * 2.0, 0.0, 0.5);
      col = mix(col, skyBase(reflect(rd, vec3(0.0, 1.0, 0.0))) * 0.7, kw);
    }
    #endif
    // the sun itself in the wet film: one hard glint down the road
    {
      vec3 rr0 = reflect(rd, vec3(0.0, 1.0, 0.0));
      float gl = dot(rr0, uSun);
      if (gl > 0.96) {
        float gl2 = gl * gl, gl4 = gl2 * gl2, gl16 = gl4 * gl4 * gl4 * gl4;
        col += gSunT * gl16 * gl16 * gl16 * gl16 * 3.0 * wet * (1.0 - uWreck * 0.8) * shadowG;
      }
    }
    // long lamp streaks in the film of water. The grain does not depend on
    // which lamp is throwing the streak, so it is sampled once and not six
    // times, and a lamp more than twenty metres across the road contributes a
    // number with twenty zeroes after the point.
    float k0 = floor((-p.z - ${-LAMP_Z0}.0) / ${LAMP_DZ}.0);
    float grainS = 0.7 + 0.5 * vnoise2(vec2(p.x * 2.4, p.z * 0.12));
    float streak = 0.0;
    for (int i = -1; i <= 1; i++) {
      float k = clamp(k0 + float(i), 0.0, ${LAMPS - 1}.0);
      float lz = ${LAMP_Z0}.0 - ${LAMP_DZ}.0 * k;
      for (int s = 0; s < 2; s++) {
        vec3 lp = vec3(s == 0 ? -${LAMP_X}.0 : ${LAMP_X}.0, ${LAMP_H.toFixed(2)}, lz);
        float dx = p.x - lp.x;
        float dz = p.z - lp.z;
        if (dx * dx > 220.0 || dz > 0.0) continue;
        streak += lampOn * exp(-dx * dx * 0.06 + dz * 0.055) * grainS;
      }
    }
    col += mix(uPal1, vec3(1.0), 0.35) * streak * wet * 0.15;
    col += mix(uPal0, vec3(1.0), 0.6) * flare * 0.05;
    col *= 1.0 - scorch * 0.7;
    // dust torn up along each front where it crosses the ground
    float dustSum = 0.0;
    for (int i = 0; i < MAX_CLOUDS; i++) {
      if (i >= uNCloud) break;
      vec4 A = uCloudA[i];
      float d = length(p.xz - A.xy);
      float rs = uCloudB[i].x;
      float m = smoothstep(A.w * 2.2, 0.0, abs(d - rs)) * smoothstep(30.0, 4.0, A.z);
      if (m > 0.01) dustSum += m * fbm2(p.xz * 0.02 + A.z);
    }
    col = mix(col, mix(uPal4, uPal1, 0.35) * 0.10, clamp(dustSum * 0.8, 0.0, 0.75));
    }
    return col;
  }

  // a forked bolt in the storm cell: a random walk of ten segments from the
  // cloud base toward the horizon in (azimuth, elevation), a branch off its
  // middle. Returns the angular distance to the nearest stroke.
  float bolt(float az, float el, float seed) {
    float elTop = 0.085 + 0.025 * h11(seed + 1.0);
    float x = ${STORM_AZ} + (h11(seed) - 0.5) * 0.16, y = elTop;
    float segH = elTop * 0.1;
    float best = 1e9;
    float bx0 = 0.0, by0 = 0.0;
    for (int i = 0; i < 10; i++) {
      float nx = x + (h11(seed * 3.1 + float(i) * 7.3) - 0.5) * 0.05;
      float ny = y - segH;
      vec2 pa = vec2(az - x, el - y), ba = vec2(nx - x, ny - y);
      float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
      best = min(best, length(pa - ba * h));
      if (i == 4) { bx0 = nx; by0 = ny; }
      x = nx; y = ny;
    }
    x = bx0; y = by0;
    float side = h11(seed + 9.0) > 0.5 ? 1.0 : -1.0;
    for (int i = 0; i < 4; i++) {
      float nx = x + side * 0.022 + (h11(seed * 5.7 + float(i) * 3.9) - 0.5) * 0.03;
      float ny = y - segH * 0.8;
      vec2 pa = vec2(az - x, el - y), ba = vec2(nx - x, ny - y);
      float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
      best = min(best, length(pa - ba * h) * 1.3);
      x = nx; y = ny;
    }
    return best;
  }

  // the whole sky: the dome, the cirrus veil, the cumulus deck, the storm cell
  // and its lightning, the stars that come out as the dusk deepens
  vec3 skyCol(vec3 rd, float az) {
    vec3 col = skyBase(rd);
    float h = clamp(rd.y, 0.0, 1.0);
    float sd = max(dot(rd, uSun), 0.0);
    float sd2 = sd * sd, sd4 = sd2 * sd2;
    float cumM = 0.0;
    if (rd.y > 0.0 && rd.y < 0.9) {
      // cirrus: a high thin veil, streaked, lit from beneath by the sun
      vec2 pc = rd.xz / (h + 0.12);
      float cir = fbm2b(pc * vec2(2.1, 0.7) + vec2(3.0, 11.0));
      cir = smoothstep(0.44, 0.80, cir) * smoothstep(0.0, 0.16, h) * (1.0 - smoothstep(0.45, 0.9, h));
      vec3 cirCol = mix(uPal0, vec3(1.0), 0.35) * (0.5 + 0.7 * sd4) * (1.0 - uWreck * 0.85);
      col = mix(col, cirCol, cir * 0.5);
    }
    if (rd.y > -0.012 && rd.y < 0.21) {
      // cumulus: a lower deck on the horizon, lumpier, dark bellies and a lit rim
      vec2 pk = rd.xz / (h + 0.05);
      float cum = fbm2b(pk * 0.9 + vec2(17.0, 5.0)) * 0.8 + 0.2 * vnoise2(pk * 3.8 + 9.0);
      cumM = smoothstep(0.50, 0.70, cum) * (1.0 - smoothstep(0.04, 0.20, h)) * smoothstep(-0.01, 0.015, rd.y);
      float belly = smoothstep(0.70, 0.95, cum);
      vec3 cumLit = mix(uPal0, uPal3, 0.5) * (0.35 + 0.65 * sd2);
      vec3 cumDark = mix(uPal1, uPal4, 0.6) * 0.22;
      vec3 cumCol = mix(cumLit, cumDark, belly * 0.85);
      cumCol = mix(cumCol, grey(uPal4, 0.6) * 0.10, uWreck * 0.85);
      // the storm cell: a dark anvil on the right horizon, its belly lit by the bolt
      float dAz = abs(az - (${STORM_AZ}));
      if (dAz < 0.42) {
        float storm = smoothstep(0.42, 0.12, dAz) * (1.0 - smoothstep(0.05, 0.17, h)) * smoothstep(-0.01, 0.01, rd.y);
        storm *= smoothstep(0.30, 0.55, fbm2b(pk * 0.5 + vec2(41.0, 3.0)));
        vec3 stormCol = grey(mix(uPal2, uPal4, 0.6), 0.5) * 0.07;
        stormCol += mix(uPal2, vec3(1.0), 0.6) * uLtn * 0.9 * (0.4 + 0.6 * (1.0 - smoothstep(0.0, 0.12, h)));
        cumCol = mix(cumCol, stormCol, storm);
        cumM = max(cumM, storm * 0.95);
      }
      // the flash on the cloud undersides: the bellies toward the burst go white
      for (int i = 0; i < uNFlash; i++) {
        vec4 F = uFlashP[i];
        float fAz = atan(F.x - uCamPos.x, -(F.z - uCamPos.z));
        float dA = az - fAz;
        cumCol += mix(uPal0, vec3(1.0), 0.7) * uFlashC[i] * 0.09 * exp(-dA * dA * 2.5) * (0.5 + 0.5 * belly);
      }
      col = mix(col, cumCol, cumM * 0.9);
      // the bolt, only where the storm stands and only while it flashes
      if (uLtn > 0.003 && dAz < 0.32 && rd.y < 0.14) {
        float d = bolt(az, rd.y, uBoltSeed);
        float core = exp(-d * 700.0);
        float glow = exp(-d * 60.0) * 0.18;
        col += mix(uPal2, vec3(1.0), 0.7) * (core * 9.0 + glow * 2.0) * uLtn * (1.0 - cumM * 0.7);
      }
    }
    if (rd.y > 0.1) {
      // stars through the gaps as the dusk deepens
      vec3 sc3 = rd * 110.0;
      vec3 sf = fract(sc3) - 0.5;
      col += vec3(1.0) * step(0.9955, h31(floor(sc3))) * exp(-dot(sf, sf) * 40.0) * 0.35 * smoothstep(0.10, 0.6, rd.y) * (1.0 - cumM) * (0.15 + uWreck * 0.5) * (1.0 - sd4 * sd4);
    }
    return col;
  }

  // the megalopolis past the DDA's reach: two bands of skyline on the horizon
  // (blocky cells, a tower now and then, a scatter of lights) each fading
  // into the haze, the farther the fainter
  vec3 farCity(vec3 rd, float az, vec3 sky) {
    vec3 haze = gHaze;
    vec3 dark = grey(mix(uPal4, uPal1, 0.25), 0.7) * 0.06;
    vec3 col = sky;
    vec3 lightCol = mix(uPal1, uPal0, 0.4);
    for (int bb = 0; bb < 2; bb++) {
      int b = 1 - bb;                                           // the farther band first: the nearer stands in front
      float cells = b == 0 ? 70.0 : 150.0;
      float hz = b == 0 ? 0.60 : 0.82;                          // how much of the band is haze
      float cell = floor(az * cells);
      float hh = h21(vec2(cell, 7.0 + float(b) * 3.0));
      float hh2 = h21(vec2(cell, 31.0 + float(b)));
      float top = (b == 0 ? 0.008 : 0.004) + (b == 0 ? 0.030 : 0.017) * hh * hh + step(0.96, hh2) * (b == 0 ? 0.05 : 0.025) * hh2;
      float below = 1.0 - smoothstep(top - 0.0015, top + 0.0015, rd.y);
      // the coarse form of the sun's shadow: a cell standing in the lee of a
      // taller neighbour on the sun's side is dark up to that neighbour's height
      float hhS = h21(vec2(cell - 1.0, 7.0 + float(b) * 3.0));
      float topS = (b == 0 ? 0.008 : 0.004) + (b == 0 ? 0.030 : 0.017) * hhS * hhS;
      float shF = 1.0 - 0.4 * step(top + 0.004, topS) * (1.0 - smoothstep(topS - 0.003, topS + 0.002, rd.y));
      vec3 bc = mix(dark * shF, haze, hz);
      // lit windows in the silhouette, dimmed by the same haze
      float lit = step(0.965, h21(vec2(floor(az * 900.0 + float(b) * 13.0), floor(rd.y * 2600.0)))) * (1.0 - hz) * 0.8;
      bc += lightCol * lit * (1.0 - uWreck * 0.7);
      col = mix(col, bc, below * (b == 0 ? 1.0 : 0.85));
    }
    return col;
  }

  // Smoke columns off the fires the fronts leave: each a leaning column of
  // noise rising off its roof, growing from the moment the fire catches (nine
  // metres a second, nothing stands at its height), sampled twice across the
  // ray's span (one noise sample). Dust-grey off the roofs as the front passes, black smoke as the
  // fire takes, thinning to haze as it burns out. F = (x, z, y, age).
  void smokeColumns(vec3 ro, vec3 rd, float tOpaque, inout vec3 col) {
    vec3 ax = normalize(vec3(uWind.x, 1.0, uWind.y));
    for (int i = 0; i < MAX_FIRE; i++) {
      if (i >= uNFire) break;
      vec4 F = uFire[i];
      float age = F.w;
      if (age <= 0.0) continue;
      float H = min(age * 9.0, 120.0);
      vec3 A = vec3(F.x, F.z, F.y);
      // a sphere round the whole column first: most rays leave here
      vec3 cen = A + ax * (H * 0.5);
      float rb = H * 0.56 + 12.0;
      vec3 cw = cen - ro;
      float cb = dot(cw, rd);
      if (cb < -rb || cb - rb > tOpaque || dot(cw, cw) - cb * cb > rb * rb) continue;
      vec3 w0 = ro - A;
      float b = dot(rd, ax), d0 = dot(w0, rd), d1 = dot(w0, ax);
      float den = 1.0 - b * b;
      if (den < 1e-4) continue;
      float tr = (b * d1 - d0) / den;
      float ta = (d1 - b * d0) / den;
      if (tr < 0.0 || tr > tOpaque || ta < 0.0 || ta > H * 1.05) continue;
      vec3 pr = ro + rd * tr;
      vec3 pa = A + ax * ta;
      float dd = length(pr - pa);
      float Rh = (3.0 + H * 0.075) * (0.35 + 0.65 * ta / max(H, 1.0));
      if (dd > Rh * 1.3) continue;
      float span = sqrt(max(Rh * Rh * 1.69 - dd * dd, 0.0)) * 2.0;
      float n1 = fbm3(vec3(pr.x * 0.07, pr.y * 0.05 - uTime * 0.9, pr.z * 0.07) + float(i) * 3.0);
      float prof = 1.0 - smoothstep(0.45, 1.0, dd / Rh);
      float top = 1.0 - smoothstep(H * 0.7, H, ta);
      float dens = prof * top * smoothstep(0.25, 0.55, n1) * exp(-age / 130.0);
      float al = 1.0 - exp(-dens * span * 0.28);
      float fireOn = smoothstep(4.0, 14.0, age);
      vec3 dust = grey(mix(uPal4, uPal1, 0.25), 0.5) * 0.20;
      vec3 smoke = grey(uPal4, 0.75) * 0.05;
      vec3 sc = mix(dust, smoke, fireOn) * (0.4 + 0.6 * ta / max(H, 1.0)) + gAmb * 0.30 * (0.2 + 0.8 * ta / max(H, 1.0)) * (1.0 - fireOn * 0.5);
      float flick = 0.7 + 0.3 * vnoise2(vec2(uTime * 7.0 + float(i), uTime * 3.0));
      sc += mix(uPal1, uPal0, 0.4) * 0.9 * exp(-ta * 0.09) * flick * fireOn;
      col = mix(col, sc, clamp(al, 0.0, 0.92));
    }
  }

  // ================================================================ the cloud
  float sdTorus(vec3 p, float R, float r) { return length(vec2(length(p.xz) - R, p.y)) - r; }
  float sdEllipsoid(vec3 p, vec3 r) { float k0 = length(p / r); float k1 = length(p / (r * r)); return k0 * (k0 - 1.0) / max(k1, 1e-5); }
  float sdCapCyl(vec3 p, float h, float r) { vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)); }
  float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }

  // Everything about a cloud that does not depend on the point being sampled,
  // worked out ONCE per cloud per pixel. It used to be worked out again on
  // every step of every march, three exponentials and a page of arithmetic,
  // fifteen steps deep, for each of the three map calls a step can make, which
  // is a couple of hundred transcendentals a pixel spent on constants.
  struct Cloud {
    vec2 at;
    float age, sc, s, yc, Rc, rc, rs, carve, core, fire, ember, roll, drift, fade, fireL;
  };
  Cloud cloudPrep(vec4 A, vec4 B, vec4 C, vec4 D, vec4 E) {
    Cloud c;
    c.at = A.xy; c.age = A.z; c.sc = A.w;
    c.drift = B.y; c.fireL = B.z;
    c.yc = C.x; c.fade = C.z; c.s = C.w;
    c.Rc = D.x; c.rc = D.y; c.rs = D.z; c.carve = D.w;
    c.core = E.x; c.fire = E.y; c.ember = E.z; c.roll = E.w;
    return c;
  }
  // The cloud without its noise: the cap ellipsoid, its rim torus, the stem and
  // the base bell, blended. This is a real signed distance to the solid, which
  // is what lets the march stride across empty sky instead of walking it.
  float cloudSolid(vec3 p, Cloud c) {
    vec3 pc = p - vec3(0.0, c.yc, 0.0);
    float dCap = sdEllipsoid(pc, vec3(c.Rc + c.rc, c.rc * 1.45, c.Rc + c.rc));
    float dRim = sdTorus(pc - vec3(0.0, -c.rc * 0.25, 0.0), c.Rc + c.rc * 0.5, c.rc * 0.85);
    float stemR = c.rs * (1.0 + 0.4 * (1.0 - clamp(p.y / c.yc, 0.0, 1.0)));
    float dStem = sdCapCyl(p - vec3(0.0, c.yc * 0.5, 0.0), c.yc * 0.5, stemR);
    float dBell = sdTorus(pc - vec3(0.0, -c.rc * 1.3, 0.0), c.Rc * 1.1, c.rc * 0.3) + (1.0 - c.s) * c.sc;
    return min(smin(min(dCap, dRim), dStem, c.sc * 0.7), dBell);
  }
  // the fireball's own emission at p: hot core early, embers long after
  float cloudHeat(vec3 pc, Cloud c) {
    float dCore = length(pc) / c.core;
    return (c.fire * exp(-dCore * dCore * 1.2) * 4.0 + c.ember * 0.45 * smoothstep(1.0, 0.2, dCore)) * c.fade;
  }
  // density at p, p already relative to this cloud's ground point; heat is the
  // emissive temperature and sd the distance to the solid the caller strides
  // on. The cap rolls about its core ring and the stem draws upward: both are
  // flows of the noise domain, not rotation of anything.
  float cloudMap(vec3 p, Cloud c, out float heat, out float sd) {
    vec3 pc = p - vec3(0.0, c.yc, 0.0);
    float d = cloudSolid(p, c);
    sd = d;
    // The noise can only carve so far off the solid, so a step this far outside
    // it is empty whatever the noise says, and it can leave before paying for
    // the roll and the two octaves. Most of a bound is empty space: this is
    // what makes the march affordable, and the distance it hands back is what
    // lets the next step jump the whole of it.
    heat = 0.0;
    if (d > 0.26 * c.carve) return 0.0;
    // The cap's toroidal roll, without an atan or a second sine in sight: the
    // azimuth's cosine and sine are p.xz/r already, and the poloidal angle is
    // advanced by the angle-addition identity from its own cosine and sine.
    float r = length(p.xz);
    float invR = 1.0 / max(r, 1e-4);
    float wc = smoothstep(c.yc - c.rc * 2.2, c.yc - c.rc * 0.8, p.y) * smoothstep(0.0, c.Rc * 0.4, r); // the roll fades out on the axis, where its mapping flips
    float ex = r - c.Rc, ey = pc.y;
    float rho = sqrt(ex * ex + ey * ey);
    float invRho = 1.0 / max(rho, 1e-4);
    float ct = ex * invRho, st = ey * invRho;
    float ang = c.roll * wc;
    float ca = cos(ang), sa = sin(ang);
    float rr = c.Rc + rho * (ct * ca - st * sa);
    vec3 pn = vec3(p.x * invR * rr, c.yc + rho * (st * ca + ct * sa), p.z * invR * rr);
    vec3 ps = mix(p - vec3(0.0, c.drift, 0.0), pn, wc) / c.sc;
    float n = fbm3c(ps * (1.15 + 0.6 * uMorph) + vec3(0.0, 0.0, 17.0));
    float dens = smoothstep(0.0, -0.65 * c.sc, d + (0.62 - n) * c.carve);
    heat = cloudHeat(pc, c);
    return dens * c.fade;
  }
  // Ray vs the cloud's bound. With one march per ray the bound has to be the
  // SHAPE and not a ball or a box around it: a sphere round a column three
  // hundred metres tall is mostly empty sky, and whichever bound the ray enters
  // first is the cloud it marches, so slack in the bound erases whatever stands
  // behind it, as a ball in soft patches, as a box in hard rectangles. So the
  // bound is a sphere on the cap unioned with a capped cylinder on the stem,
  // each carrying the margin the noise can carve past the solid.
  bool cloudSpan(vec3 ro, vec3 rd, Cloud c, float tMax, out float t0, out float t1, out float ang, out float depth) {
    float sc = c.sc, yc = c.yc, rc = c.rc, Rc = c.Rc, rs = c.rs;
    float slack = sc * (0.42 + 0.4 * uMorph);
    // the cap is a disc twice as wide as it is thick, so its bound is an
    // ellipsoid: a sphere round it is empty sky above and below, and empty sky
    // in the bound is a crescent bitten out of the cloud standing behind
    vec3 er = vec3(Rc + 1.4 * rc + slack, 1.55 * rc + slack, Rc + 1.4 * rc + slack);
    float Rcap = er.x;
    float Rstem = rs * 1.9 + slack;
    float tN = 1e9, tF = -1e9;
    vec3 oc = ro - vec3(c.at.x, yc, c.at.y);
    vec3 oe = oc / er, de = rd / er;
    float ae = dot(de, de);
    float be = dot(oe, de);
    float h = be * be - ae * (dot(oe, oe) - 1.0);
    if (h > 0.0) { h = sqrt(h); tN = (-be - h) / ae; tF = (-be + h) / ae; }
    float a2 = dot(rd.xz, rd.xz);
    if (a2 > 1e-6) {
      vec2 o2 = ro.xz - c.at;
      float b2 = dot(o2, rd.xz);
      float h2 = b2 * b2 - a2 * (dot(o2, o2) - Rstem * Rstem);
      if (h2 > 0.0) {
        h2 = sqrt(h2);
        float u0 = (-b2 - h2) / a2, u1 = (-b2 + h2) / a2;
        if (abs(rd.y) > 1e-5) {
          float ya = -ro.y / rd.y, yb = (yc + slack - ro.y) / rd.y;
          u0 = max(u0, min(ya, yb));
          u1 = min(u1, max(ya, yb));
        } else if (ro.y < 0.0 || ro.y > yc + slack) { u1 = u0 - 1.0; }
        if (u1 > u0) { tN = min(tN, u0); tF = max(tF, u1); }
      }
    }
    ang = 2.0 * Rcap / max(length(oc), 1.0);   // how much of the frame it fills
    depth = 0.0;
    if (tF <= max(tN, 0.0)) return false;
    t0 = max(tN, 0.0);
    t1 = min(tF, tMax);
    depth = (t1 - t0) / (2.0 * Rcap);          // how squarely the ray goes through
    return t1 > t0;
  }
  // steps in proportion to that: a burst two blocks wide on the far side of the
  // city does not deserve the same march as the column standing over the eye
  int cloudSteps(float ang, float k) {
    return int(clamp(float(CLOUD_STEPS) * k * min(1.0, ang * 1.9), 7.0, float(CLOUD_STEPS)));
  }
  // one cloud, front to back, carrying the running transmittance. The step is
  // the shorter of the ray's own budget and the distance to the solid: inside
  // the cloud it walks, and across the empty two thirds of the bound it strides,
  // so a bound that fills the frame no longer costs the frame. That stride is
  // what pays for a deck standing at once.
  void marchCloud(vec3 ro, vec3 rd, Cloud c, float t0, float t1, int steps, inout vec3 acc, inout float T) {
    float sc = c.sc, yc = c.yc;
    vec3 base = vec3(c.at.x, 0.0, c.at.y);
    float stepLen = (t1 - t0) / float(steps);
    float t = t0 + stepLen * h31(rd * 100.0 + uTime);
    vec3 lightPos = base + vec3(0.0, yc, 0.0);
    vec3 ash = grey(mix(uPal4, vec3(1.0), 0.34), 0.72);
    // the dome lights the cloud: the sunset's warmth on it, ash-grey under the dusk
    vec3 dome = mix(mix(uPal0, uPal3, 0.35) * 1.15, grey(mix(uPal4, uPal1, 0.3), 0.7) * 0.7, uWreck * 0.8);
    float fireL = c.fireL;
    vec3 fireTint = mix(uPal1, vec3(1.0), 0.3);
    vec3 cityTint = mix(uPal1, uPal0, 0.25);
    float skip = 0.26 * c.carve;
    for (int i = 0; i < CLOUD_STEPS; i++) {
      if (i >= steps || T < 0.06 || t > t1) break;
      vec3 p = ro + rd * t - base;
      float heat, sd;
      float dens = cloudMap(p, c, heat, sd);
      if (dens > 0.004) {
        // the two lighting probes are the expensive part: a wisp gets the
        // average instead, and only real density pays for them
        float lit = 0.55, du = 0.55;
        if (dens > 0.055) {
          vec3 toL = normalize(lightPos - (p + base));
          float hp, hs;
          lit = exp(-cloudMap(p + toL * sc * 0.7, c, hp, hs) * 2.2);
          du = cloudMap(p + vec3(0.0, sc * 0.85, 0.0), c, hp, hs);
        }
        float dist = length(lightPos - (p + base)) / sc;
        float fl = fireL / (1.0 + dist * dist * 0.35);
        // the overcast from above (the up-probe is the self-shadow that gives
        // the cap its form), the city's glow from below, the fireball within
        float sky = 0.22 + 0.72 * exp(-du * 2.4);
        float city = 0.22 * smoothstep(yc * 0.9, 0.0, p.y) * uCityFade;
        vec3 emit = mix(uPal1, uPal0, clamp(heat * 0.5, 0.0, 1.0)) * heat;
        vec3 col = emit + ash * (fl * lit * fireTint + sky * dome) + cityTint * city;
        float al = 1.0 - exp(-dens * stepLen * 2.6 / sc);
        acc += T * col * al;
        T *= 1.0 - al;
      }
      t += max(stepLen, (sd - skip) * 0.9);
    }
  }
  // A cloud the ray could afford to bound but not to march still has to stand
  // where it stands. This is the same body with the noise left off: the solid
  // sampled once across the ray's span, shaded with the cloud's own average
  // light. It reads as an under-detailed mass at the back of a deck, which is
  // what it is, instead of the straight-edged hole a dropped cloud leaves. The
  // coarse clouds composite behind the marched ones; they ranked worse because
  // the ray entered them later or only clipped them, so behind is where they
  // almost always are.
  void coarseCloud(vec3 ro, vec3 rd, Cloud c, float t0, float t1, inout vec3 acc, inout float T) {
    if (T < 0.03) return;
    vec3 base = vec3(c.at.x, 0.0, c.at.y);
    vec3 p = ro + rd * ((t0 + t1) * 0.5) - base;
    float d = cloudSolid(p, c);
    float dens = smoothstep(0.0, -0.55 * c.sc, d + 0.10 * c.carve) * c.fade;
    if (dens < 0.004) return;
    float al = 1.0 - exp(-dens * (t1 - t0) * 1.5 / c.sc);
    vec3 ash = grey(mix(uPal4, vec3(1.0), 0.34), 0.72) * mix(mix(uPal0, uPal3, 0.35) * 1.15, grey(mix(uPal4, uPal1, 0.3), 0.7) * 0.7, uWreck * 0.8);
    float heat = cloudHeat(p - vec3(0.0, c.yc, 0.0), c);
    float fireL = c.fireL * 0.6;
    vec3 emit = mix(uPal1, uPal0, clamp(heat * 0.5, 0.0, 1.0)) * heat;
    vec3 col = emit + ash * (0.55 + fireL * 0.35) + mix(uPal1, uPal0, 0.25) * 0.12 * uCityFade;
    acc += T * col * al;
    T *= 1.0 - al;
  }

  // ================================================================ the world
  vec3 cityWorld(vec3 ro, vec3 rd, vec2 uv) {
    prepColours();
    // the front bends the ray before anything is traced
    float bImp = length(cross(vec3(${GZ_X}.0, 0.0, ${GZ_Z}.0) - ro, rd));
    float band = 0.0, lip = 0.0;
    vec3 oc = ro - vec3(${GZ_X}.0, 0.0, ${GZ_Z}.0);
    if (uBlastAge >= 0.0 && dot(oc, oc) > uBlastR * uBlastR) {
      float b = dot(oc, rd);
      float h = b * b - (dot(oc, oc) - uBlastR * uBlastR);
      if (h > 0.0) {
        float tIn = -b - sqrt(h);
        if (tIn > 0.0) {
          vec3 nIn = normalize(oc + rd * tIn);
          float gz = 1.0 - abs(dot(nIn, rd));
          float graze = gz * gz;
          rd = normalize(rd + nIn * 0.085 * graze * (0.6 + 0.5 * uBlastMorph));
          float w = uBlastR * 0.030;
          float c1 = sqrt(max(uBlastR * uBlastR - bImp * bImp, 0.0));
          float c2 = sqrt(max((uBlastR - w) * (uBlastR - w) - bImp * bImp, 0.0));
          band = clamp((c1 - c2) / (w * 4.0), 0.0, 1.0) * smoothstep(0.1, 0.5, uBlastAge) * exp(-max(uBlastAge - 0.5, 0.0) / 2.2);
          float lw = (bImp - uBlastR) / (uBlastR * 0.022);
          lip = exp(-lw * lw);
        }
      }
    }

    float tg = rd.y < -1e-4 ? -ro.y / rd.y : -1.0;
    float tLimit = tg > 0.0 ? min(tg, CFAR) : CFAR;
    vec3 nrm = vec3(0.0); ivec2 hc = ivec2(0); int hlvl = 0; float tEnd = 0.0;
    float tB = traceCity(ro, rd, tLimit, CITY_STEPS, nrm, hc, hlvl, tEnd);
    // the ground is drawn as far as the DDA walked; past its reach the
    // megalopolis impostor stands in, so the horizon never shows bare ground
    // where blocks should be
    bool groundHit = tB <= 0.0 && tg > 0.0 && tg < CFAR && tg <= tEnd + 0.5;
    float tOpaque = tB > 0.0 ? tB : (groundHit ? tg : CFAR);
    vec3 pHit = ro + rd * min(tOpaque, 900.0);
    float blown = 1.0, flare = 0.0, glint = 0.0, scorch = 0.0, fireLit = 0.0; vec2 fireDir = vec2(0.0);
    frontAt(pHit.xz, blown, flare, glint, scorch, fireLit, fireDir);
    float az = atan(rd.x, -rd.z);
    vec3 col;
    if (tB > 0.0) col = shadeFacade(ro + rd * tB, nrm, rd, hc, hlvl, tB, blown, flare, glint, scorch, fireLit, fireDir);
    else if (groundHit) col = shadeGround(ro, rd, ro + rd * tg, tg, blown, flare, glint, scorch, fireLit);
    else { col = skyCol(rd, az); if (rd.y < 0.1) col = farCity(rd, az, col); }
    // aerial perspective: the haze takes the distance, and the dust thickens
    // it, and the flash takes the haze's exposure as it takes the city's
    float expoH = 1.0 / (1.0 + uFlashExpo * 0.7);
    if (tOpaque < CFAR) col = mix(col, gHaze * expoH, (1.0 - exp(-tOpaque * uHaze)) * 0.92);

    // fog: an exponential height layer, banded, integrated along the ray
    float Hf = 90.0;
    float dens = uFogD * (0.5 + 1.1 * fbm2b((ro.xz + rd.xz * min(tOpaque, 400.0) * 0.5) * 0.0022 + uTime * 0.01));
    float ky = rd.y;
    float I = abs(ky) < 1e-4
      ? dens * exp(-ro.y / Hf) * min(tOpaque, CFAR)
      : dens * Hf / ky * (exp(-ro.y / Hf) - exp(-(ro.y + ky * min(tOpaque, CFAR)) / Hf));
    float fog = 1.0 - exp(-max(I, 0.0));
    vec3 fogCol = gHaze * 0.55 * expoH;
    col = mix(col, fogCol, clamp(fog, 0.0, 0.96));
    // crepuscular shafts: the sun's forward scatter in the haze, gated by the
    // projected mask where the ray crosses it, bright rays where the deck
    // stands open, nothing where it is closed
    float sdv = dot(rd, uSun);
    if (sdv > 0.25) {
      float gS = skyGate(ro + rd * min(tOpaque * 0.55, 320.0));
      float sd2v = sdv * sdv, sd4v = sd2v * sd2v;
      float hazeK = clamp(fog * 1.2 + (1.0 - exp(-tOpaque * uHaze)) * 1.4 + 0.18, 0.0, 1.0);
      col += gSunT * (sd4v * sd4v * 0.16 + sd4v * 0.03) * hazeK * gS * (1.0 - uWreck * 0.5);
    }
    col += lampAir(ro, rd, min(tOpaque, 420.0), clamp(blown + flare * 0.5, 0.0, 2.0) * uLamps) * (0.35 + uStreet * 0.9);
    // the smoke off the fires, behind the clouds and in front of the blocks
    if (uNFire > 0) smokeColumns(ro, rd, tOpaque, col);

    // The clouds this ray marches, ranked by where it enters their bounds. Two
    // are marched on med and high and one on low: every extra call to cloudMap
    // that the compiler inlines costs the WHOLE shader its occupancy, a second
    // march measured 2.4 ms a frame at 1080p even on frames where no ray took
    // it. A deck of six or eight will not fit in two marches, so every cloud
    // past the second is composited coarsely instead of dropped.
    int i0 = -1, i1 = -1;
    float a0 = 1e9, a1 = 1e9, b0v = 0.0, b1v = 0.0, g0 = 0.0, g1 = 0.0;
    float k0 = 1e18, k1 = 1e18;
    Cloud c0, c1;
    vec3 cAcc = vec3(0.0);
    float cT = 1.0;
    for (int i = 0; i < MAX_CLOUDS; i++) {
      if (i >= uNCloud) break;
      Cloud c = cloudPrep(uCloudA[i], uCloudB[i], uCloudC[i], uCloudD[i], uCloudE[i]);
      float s0, s1, ang, depth;
      if (!cloudSpan(ro, rd, c, tOpaque, s0, s1, ang, depth)) continue;
      // A cloud the ray only clips is ranked behind every cloud it goes
      // squarely through. Without that a near cloud's grazed limb claims the
      // ray, contributes almost nothing, and the cloud standing behind it is
      // shaded coarsely, which reads as a notch bitten out of it.
      float key = s0 + (depth < 0.22 ? 1e6 : 0.0);
      if (key < k0) {
        #if MARCH2
        if (i1 >= 0) coarseCloud(ro, rd, c1, a1, b1v, cAcc, cT);
        i1 = i0; k1 = k0; a1 = a0; b1v = b0v; g1 = g0; c1 = c0;
        #else
        if (i0 >= 0) coarseCloud(ro, rd, c0, a0, b0v, cAcc, cT);
        #endif
        i0 = i; k0 = key; a0 = s0; b0v = s1; g0 = ang; c0 = c;
      }
      #if MARCH2
      else if (key < k1) {
        if (i1 >= 0) coarseCloud(ro, rd, c1, a1, b1v, cAcc, cT);
        i1 = i; k1 = key; a1 = s0; b1v = s1; g1 = ang; c1 = c;
      }
      #endif
      else {
        coarseCloud(ro, rd, c, s0, s1, cAcc, cT);
      }
    }
    vec3 acc = vec3(0.0);
    float T = 1.0;
    #if MARCH2
    // two marches composite front to back, whatever the rank said
    if (i1 >= 0 && a1 < a0) {
      Cloud ct = c0; c0 = c1; c1 = ct;
      float tf = a0; a0 = a1; a1 = tf;
      tf = b0v; b0v = b1v; b1v = tf;
      tf = g0; g0 = g1; g1 = tf;
      int ti = i0; i0 = i1; i1 = ti;
    }
    #endif
    if (i0 >= 0) marchCloud(ro, rd, c0, a0, b0v, cloudSteps(g0, 1.0), acc, T);
    #if MARCH2
    if (i1 >= 0) marchCloud(ro, rd, c1, a1, b1v, cloudSteps(g1, 0.55), acc, T);
    #endif
    col = (col * cT + cAcc) * T + acc;

    // Every fireball throws its own glow into the air, and it is the AIR it
    // lifts. A flat add put a share of every fireball on every facade in frame,
    // and a salvo handed back a grey city instead of a noir one lit from four
    // directions at once, so the term rides the ray's own fog integral: a wall
    // thirty metres off has almost no air in front of it and takes almost none
    // of this, while the haze between the eye and the cloud takes all of it.
    float glowSum = 0.0;
    for (int i = 0; i < MAX_CLOUDS; i++) {
      if (i >= uNCloud) break;
      float amp = uCloudC[i].y;              // the fireball's brightness, from the CPU
      if (amp < 0.0008) continue;
      vec4 A = uCloudA[i];
      vec3 cr = cross(vec3(A.x, uCloudC[i].x, A.y) - ro, rd);
      float r2 = A.w * A.w * 5.0;
      glowSum += amp * r2 / (r2 + dot(cr, cr));
    }
    col += mix(uPal1, uPal0, 0.6) * min(glowSum, 2.0) * (0.07 + 0.93 * clamp(fog + (1.0 - exp(-tOpaque * uHaze)) * 0.5, 0.0, 1.0));

    // ground zero's own front: the dust wall, the fireball dome, the shell
    if (uBlastAge >= 0.0) {
      vec3 GZ = vec3(${GZ_X}.0, 0.0, ${GZ_Z}.0);
      vec2 oc2 = ro.xz - GZ.xz;
      float bq = dot(oc2, rd.xz);
      float cq = dot(oc2, oc2) - uBlastR * uBlastR;
      float aq = dot(rd.xz, rd.xz);
      float hq = bq * bq - aq * cq;
      if (hq > 0.0 && aq > 1e-5) {
        float tw = (-bq - sqrt(hq)) / aq;
        if (tw < 0.0) tw = (-bq + sqrt(hq)) / aq;
        if (tw > 0.0 && tw < tOpaque) {
          vec3 pw = ro + rd * tw;
          if (pw.y > 0.0 && pw.y < uDustH) {
            float dn = fbm3(vec3(pw.x * 0.05, pw.y * 0.06 - uBlastAge * 0.6, pw.z * 0.05));
            float op = smoothstep(0.22, 0.6, dn) * smoothstep(uDustH, uDustH * 0.45, pw.y);
            float crest = smoothstep(uDustH * 0.25, uDustH * 0.9, pw.y);
            // dark and neutral at the foot, fire-lit along the crest
            vec3 dustCol = mix(grey(uPal4, 0.6) * 0.055, mix(uPal1, uPal0, 0.35) * (0.16 + uBlastFire * 0.55), crest);
            col = mix(col, dustCol, clamp(op * 1.1, 0.0, 0.86));
          }
        }
      }
      col += grey(mix(uPal2, vec3(1.0), 0.7), 0.45) * band * 0.16;
      col += grey(mix(uPal2, vec3(1.0), 0.6), 0.35) * lip * 0.22;
    }

    // rain in two slanted layers, and the dust that sweeps the eye
    float r1 = h21(floor(vec2(uv.x * 130.0 + uv.y * 22.0, uv.y * 26.0 - uTime * 26.0)));
    float r2 = h21(floor(vec2(uv.x * 74.0 - uv.y * 15.0 + 31.0, uv.y * 15.0 - uTime * 15.0)));
    float rain = (step(0.989, r1) + step(0.993, r2) * 0.7) * uRain;
    col += mix(uPal2, vec3(1.0), 0.6) * rain * 0.045;
    // the dust that sweeps the eye, only while there is dust to sweep: eight
    // octaves of noise on every pixel of every frame was a millisecond spent
    // multiplying by zero
    if (uVeil > 0.002) {
      float veil = uVeil * fbm2(vec2(uv.x * 3.0 + uTime * 6.0, uv.y * 2.0 - uTime * 3.0));
      float streak = uVeil * fbm2(vec2(uv.x * 1.5 + uTime * 14.0, uv.y * 9.0));
      col = col * (1.0 - veil * 0.8) + grey(mix(uPal4, uPal1, 0.4), 0.65) * (veil * 0.42 + streak * 0.22) * (0.5 + uBlastFire * 0.5);
    }

    // steam standing off four gratings on the boulevard
    if (uStreet > 0.02) {
      for (int i = 0; i < 4; i++) {
        vec2 gp = vec2(i == 0 || i == 2 ? -11.0 : 11.0, -55.0 - 130.0 * float(i));
        vec2 d2 = ro.xz - gp;
        float aq2 = dot(rd.xz, rd.xz);
        float tc = -dot(d2, rd.xz) / max(aq2, 1e-5);
        if (tc > 1.0 && tc < tOpaque) {
          vec3 pp = ro + rd * tc;
          vec2 dg = pp.xz - gp;
          float r2q = dot(dg, dg);
          // the plume is gone by eleven metres out, so the fbm only runs where
          // there is a plume to shape
          float fall = exp(-r2q / 26.0) * smoothstep(13.0, 0.4, pp.y) * step(0.0, pp.y);
          if (fall > 0.004) {
            float amt = fall * smoothstep(0.25, 0.7, fbm3(vec3(pp.x * 0.22, pp.y * 0.16 - uTime * 0.42, pp.z * 0.22)));
            col += (grey(mix(uPal4, uPal1, 0.5), 0.4) * 0.30 + gAmb * 0.6) * amt * 0.45 * uStreet;
          }
        }
      }
    }
    return col;
  }

  void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    float aspect = uRes.x / uRes.y;
    vec3 rd = normalize(uCamFwd + uCamRight * (uv.x * uTanHalf * aspect) + uCamUp * (uv.y * uTanHalf));
    vec3 ro = uCamPos;
    vec3 col = vec3(0.0);
    float cityW = uActW.z + uActW.w;
    if (uActW.x > 0.002) col += colliderBg(ro, rd) * uActW.x;
    if (uActW.y > 0.002) col += fissionBg(ro, rd) * uActW.y;
    if (cityW > 0.002) col += cityWorld(ro, rd, uv) * cityW;
    col = mix(col, vec3(1.0), uFlash);
    fragColor = vec4(col * uIntensity, 1.0);
  }
`;

// ---------------------------------------------------- capsules in world space
// Endpoints in world units, projected by the scene camera; the quad is built
// in screen space so a segment is a constant-width capsule at any depth.
// aS = (radius px, alpha, palette index, mode: 0 line, 1 glow, 2 bar).
const CAP_VERT = /* glsl */ `
  uniform vec2 uRes;
  in vec2 aQuad;
  in vec3 aP0;
  in vec3 aP1;
  in vec4 aS;
  out vec2 vQ;
  out float vLenR, vA, vTint, vMode;
  vec2 toScreen(vec3 p, out float w) {
    vec4 c = projectionMatrix * viewMatrix * vec4(p, 1.0);
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
    float glow = step(0.5, aS.w) * (1.0 - step(1.5, aS.w));
    float rad = max(aS.x, 0.75) / uRes.y * (1.0 + glow * 2.0);
    float cap = 1.0 - step(1.5, aS.w);
    vLenR = len / rad;
    vec2 pos = mix(s0 - dir * rad * cap, s1 + dir * rad * cap, aQuad.y) + nrm * aQuad.x * rad;
    gl_Position = vec4(pos / vec2(aspect, 1.0) * 2.0 * vis, vis > 0.5 ? 0.0 : 2.0, 1.0);
    vQ = vec2(aQuad.x, aQuad.y * (vLenR + 2.0 * cap) - cap);
    vA = aS.y;
    vTint = aS.z;
    vMode = aS.w;
  }
`;
const CAP_FRAG = /* glsl */ `
  ${GLSL_COMMON}
  uniform vec3 uPal0, uPal1, uPal2, uPal3, uPal4;
  uniform float uIntensity;
  in vec2 vQ;
  in float vLenR, vA, vTint, vMode;
  out vec4 fragColor;
  void main() {
    float u = clamp(vQ.y, 0.0, vLenR);
    float dx = vQ.y - u;
    float d2 = dx * dx + vQ.x * vQ.x;
    if (d2 > 1.0) discard;
    float prof;
    if (vMode < 0.5) prof = exp(-d2 * 3.0) * (1.0 - d2 * 0.2);
    else if (vMode < 1.5) prof = exp(-d2 * 2.2) * 0.35;
    else prof = 0.9 * (1.0 - smoothstep(0.7, 1.0, vQ.x * vQ.x));
    vec3 col = ramp(uPal0, uPal1, uPal2, uPal3, uPal4, vTint);
    fragColor = vec4(col * prof * vA * uIntensity, 1.0);
  }
`;

// ------------------------------------------------------------ sphere impostors
// A camera-facing quad per sphere; the fragment shader rebuilds the sphere's
// normal from the quad coordinate. aS = (radius world, alpha, palette index,
// heat) and aC = (rgb, blend) an explicit colour the instance is pulled toward,
// which is how a nucleon arrives holding the exact colour of the window it
// becomes rather than a ramp coordinate that only agrees with the city's window
// rule at the warm end. The solid mesh writes depth (nucleons occlude each
// other); the glow mesh is additive.
const SPH_VERT = /* glsl */ `
  in vec2 aQuad;
  in vec3 aPos;
  in vec4 aS;
  in vec4 aC;
  out vec2 vQ;
  out vec4 vC;
  out float vA, vTint, vHeat;
  void main() {
    vec4 mv = viewMatrix * vec4(aPos, 1.0);
    float vis = step(0.001, aS.y);
    mv.xy += aQuad * aS.x * 1.05;
    vec4 clip = projectionMatrix * mv;
    gl_Position = vis > 0.5 ? clip : vec4(0.0, 0.0, 2.0, 1.0);
    vQ = aQuad * 1.05;
    vA = aS.y;
    vTint = aS.z;
    vHeat = aS.w;
    vC = aC;
  }
`;
const SPH_FRAG_SOLID = /* glsl */ `
  ${GLSL_COMMON}
  uniform vec3 uPal0, uPal1, uPal2, uPal3, uPal4;
  uniform float uIntensity;
  in vec2 vQ;
  in vec4 vC;
  in float vA, vTint, vHeat;
  out vec4 fragColor;
  void main() {
    float r2 = dot(vQ, vQ);
    if (r2 > 1.0) discard;
    vec3 n = vec3(vQ, sqrt(1.0 - r2));
    vec3 L = vec3(-0.450428, 0.600571, 0.660628); // unit by construction
    float lit = max(dot(n, L), 0.0);
    float rr = 1.0 - n.z;
    float rim = rr * rr * sqrt(rr);
    vec3 base = mix(ramp(uPal0, uPal1, uPal2, uPal3, uPal4, vTint), vC.rgb, vC.a);
    float sp = max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0);
    float sp2 = sp * sp, sp4 = sp2 * sp2, sp8 = sp4 * sp4;
    float spec = sp8 * sp8 * sp8 * sp8 * sp8; // the 40th power, written out
    vec3 col = base * (0.22 + 0.78 * lit) + vec3(spec * 0.35) + uPal0 * rim * 0.3;
    col += mix(uPal1, uPal0, 0.6) * vHeat * (0.6 + 0.6 * rim);
    col *= 1.0 - smoothstep(0.86, 1.0, r2);
    fragColor = vec4(col * vA * uIntensity, 1.0);
  }
`;
const SPH_FRAG_GLOW = /* glsl */ `
  ${GLSL_COMMON}
  uniform vec3 uPal0, uPal1, uPal2, uPal3, uPal4;
  uniform float uIntensity;
  in vec2 vQ;
  in vec4 vC;
  in float vA, vTint, vHeat;
  out vec4 fragColor;
  void main() {
    float r2 = dot(vQ, vQ);
    if (r2 > 1.0) discard;
    float prof = exp(-r2 * 3.5) * (1.0 - r2);
    vec3 col = mix(ramp(uPal0, uPal1, uPal2, uPal3, uPal4, vTint), vC.rgb, vC.a);
    col = mix(col, vec3(1.0), vHeat * 0.5 * exp(-r2 * 6.0));
    fragColor = vec4(col * prof * vA * uIntensity, 1.0);
  }
`;

// ------------------------------------------------------------ oriented boxes
// The cars, the flying chunks and the resting rubble: one instanced box mesh,
// each instance an oriented box (position, half extents, a quaternion) lit
// per face in the vertex shader by the same light the city takes: the dome,
// the sun with the CPU mirror's traced shadow (aLit.x), the lamps (aLit.y),
// the strongest flash with its traced shadow (aLit.z), a fire of its own
// (aLit.w). The flash's exposure drop (uExpo) rides it like the city. A
// negative aLit.w marks a SHADOW STREAK: a flat black box laid down-sun from
// the thing that throws it, hardest at the foot and fading along its run,
// the cars' own shadows on the road. Depth-written, normal-blended.
const BOX_VERT = /* glsl */ `
  uniform vec3 uSun, uSunCol, uAmb, uDome, uLampCol, uFlashCol, uFireCol;
  uniform vec4 uFlash;       // x, y, z, amplitude, the strongest flash
  uniform float uFlashR2, uExpo;
  in vec3 aPos;
  in vec3 aExt;
  in vec4 aRot;
  in vec4 aCol;
  in vec4 aLit;
  out vec3 vCol;
  out float vA;
  vec3 rot(vec4 q, vec3 v) { return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v); }
  void main() {
    vec3 wp = aPos + rot(aRot, position * aExt);
    float vis = step(0.001, aCol.a) * step(0.001, aExt.x);
    if (aLit.w < -1.5) {
      // a contact shadow under a thing on the ground: even, soft at its rim
      vCol = vec3(0.0);
      vA = aCol.a / (1.0 + uExpo * 0.5);
    } else if (aLit.w < -0.5) {
      // a shadow streak: black, hardest at the foot (local x = -1), fading down its length
      vCol = vec3(0.0);
      float u = position.x * 0.5 + 0.5;
      vA = aCol.a * pow(1.0 - u, 1.6) / (1.0 + uExpo * 0.5);
    } else {
      vec3 n = normalize(rot(aRot, normal));
      float ndS = max(dot(n, uSun), 0.0);
      // the dome's sheen on the upward faces, paintwork and wet slab carry the sky
      vec3 L = (uAmb * (0.55 + 0.45 * (n.y * 0.5 + 0.5)) + uDome * (0.12 + 0.55 * max(n.y, 0.0)) + uSunCol * ndS * aLit.x * 1.5) / (1.0 + uExpo);
      L += uLampCol * aLit.y * max(n.y * 0.5 + 0.5, 0.25) / (1.0 + uExpo);
      if (uFlash.w > 0.0) {
        vec3 dv = uFlash.xyz - wp;
        float d2 = dot(dv, dv);
        float ndl = max(dot(n, dv) * inversesqrt(max(d2, 1.0)), 0.0);
        L += uFlashCol * uFlash.w * uFlashR2 / (uFlashR2 + d2) * ndl * aLit.z * 2.2;
      }
      vCol = aCol.rgb * L + uFireCol * aLit.w * (0.6 + 0.4 * max(n.y, 0.0));
      vA = 1.0;
    }
    vec4 clip = projectionMatrix * viewMatrix * vec4(wp, 1.0);
    gl_Position = vis > 0.5 ? clip : vec4(0.0, 0.0, 2.0, 1.0);
  }
`;
const BOX_FRAG = /* glsl */ `
  uniform float uIntensity;
  in vec3 vCol;
  in float vA;
  out vec4 fragColor;
  void main() {
    fragColor = vec4(vCol * uIntensity, vA);
  }
`;

// ---------------------------------------------------------- the lot grid on JS
// The same integer hash the shader runs, so the CPU knows exactly where every
// facade and every lit pane stands: that is what lets the nucleon cluster land
// on real windows instead of dissolving into an unrelated picture.
const hu = (x) => {
  x = x >>> 0;
  x ^= x >>> 16; x = Math.imul(x, 0x7feb352d) >>> 0;
  x ^= x >>> 15; x = Math.imul(x, 0x846ca68b) >>> 0;
  x ^= x >>> 16;
  return x >>> 0;
};
const hf = (x) => (hu(x) & 0xffffff) / 16777216;
const lotKeyJS = (cx, cz, seed) => ((cx + 1024) * 4096 + (cz + 1024) + seed * 7919) >>> 0;
const lotStreetJS = (cx, cz) => (cx + 4100) % AV === 0 || (cz + 4100) % ST === 0 || (cz <= RIVER_C0 && cz >= RIVER_C1) || (cz <= YARD_C0 && cz >= YARD_C1);
// the shader's damageAt and craterAt: the max over the remembered craters of a
// falloff from each ground zero (and the wake's plateau, for the shading).
// dmg = { n, x, z, invR2, s } is the scene's crater list.
function damageAtJS(dmg, x, z) {
  let d = 0;
  for (let i = 0; i < dmg.n; i++) {
    const dx = x - dmg.x[i], dz = z - dmg.z[i];
    const d2 = dx * dx + dz * dz;
    let f = (1 - d2 * dmg.invR2[i]) * 1.6;
    f = f < 0 ? 0 : f > 1 ? 1 : f;
    let w = (1 - d2 * dmg.invR2[i] * 0.05) * 4 * 0.22;
    w = w < 0 ? 0 : w > 0.22 ? 0.22 : w;
    const v = dmg.s[i] * (f > w ? f : w);
    if (v > d) d = v;
  }
  return d;
}
function craterAtJS(dmg, x, z) {
  let d = 0;
  for (let i = 0; i < dmg.n && i < dmg.stumps && d < 1; i++) {
    const dx = x - dmg.x[i], dz = z - dmg.z[i];
    let f = (1 - (dx * dx + dz * dz) * dmg.invR2[i]) * 1.6;
    f = f < 0 ? 0 : f > 1 ? 1 : f;
    const v = dmg.s[i] * f;
    if (v > d) d = v;
  }
  return d;
}
const smoothstepJS = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };

// `lotOf` in full, not just its base height: a lot stands as up to three
// masses, each with its own plan, its own offset off the lot centre and its
// own height band, the deco tower's mass 0 tops out at 0.42 of its height
// with the two above it recessed, the brick pair stands side by side, the
// podium carries its slab, and the wreck knocks the blocks inside a burst's
// heavy radius down to stumps. A JS copy that knew only the total height sent
// the cluster to panes that hang in the air in front of the setbacks, so it
// mirrors every number. out.b holds four floats per mass (half x, half z, y
// base, y top), out.off two per mass (the plan offset), out.r / out.r2 the
// lot's random words.
function lotOfJS(cx, cz, seed, out, dmg) {
  const k = lotKeyJS(cx, cz, seed);
  const a = hu(k), b = hu((k ^ 0x9e3779b9) >>> 0), e = hu((k ^ 0x3c6ef372) >>> 0);
  const r0 = (a & 255) / 255, r1 = ((a >>> 8) & 255) / 255, r2 = ((a >>> 16) & 255) / 255, r3 = (a >>> 24) / 255;
  const q0 = (e & 255) / 255, q1 = ((e >>> 8) & 255) / 255, q2 = ((e >>> 16) & 255) / 255, q3 = (e >>> 24) / 255;
  const f = (b & 4095) / 4096;
  const g = ((b >>> 12) & 4095) / 4096;
  const g2 = (b >>> 24) / 255;
  const fam = f < 0.06 ? 0 : f < 0.36 ? 1 : f < 0.50 ? 2 : f < 0.62 ? 3 : f < 0.85 ? 4 : 5;
  let hx = CELL * 0.5 - (3 + r0 * 4);
  let hz = CELL * 0.5 - (3 + r1 * 4);
  let ox = (r2 - 0.5) * 3, oz = (r3 - 0.5) * 3;
  if (Math.abs(cx) === 1) { hx -= 4; ox += cx > 0 ? 4 : -4; }
  let ctrx = cx * CELL + ox;
  const ctrz = cz * CELL + oz;
  const fall = 1 - 0.72 * smoothstepJS(0.55, 1.0, craterAtJS(dmg, ctrx, ctrz) + (q0 - 0.5) * 0.2);
  const B = out.b, O = out.off;
  B.fill(0); O.fill(0);
  if (fam === 0) {                 // deco setback tower
    const H = (64 + g * 48) * fall;
    B[0] = hx; B[1] = hz; B[2] = 0; B[3] = H * 0.42;
    B[4] = hx * 0.74; B[5] = hz * 0.74; B[6] = H * 0.42; B[7] = H * 0.76;
    B[8] = hx * 0.46; B[9] = hz * 0.46; B[10] = H * 0.76; B[11] = H;
  } else if (fam === 1) {          // two brick walk-ups side by side, a water tank on the taller
    const hxa = hx * (0.36 + q1 * 0.28), hxb = hx - 0.4 - hxa;
    ctrx -= hx - hxa;
    const H0 = (12 + g * 16) * fall, H1 = (12 + g2 * 16) * fall;
    B[0] = hxa; B[1] = hz; B[2] = 0; B[3] = H0;
    B[4] = hxb; B[5] = hz * 0.9; B[6] = 0; B[7] = H1;
    O[2] = hxa + 0.4 + hxb; O[3] = 0;
    const Ht = Math.max(H0, H1);
    B[8] = 2.6; B[9] = 2.6; B[10] = Ht; B[11] = Ht + 5.5;
    O[4] = (H1 > H0 ? O[2] : 0) + (H1 > H0 ? hxb : hxa) * 0.4 * (r2 > 0.5 ? 1 : -1);
    O[5] = (H1 > H0 ? O[3] : 0) - hz * 0.45;
  } else if (fam === 2) {          // glass slab, plant room and a mast
    hx *= 1.06; hz *= 0.60;
    const H = (30 + g * 46) * fall;
    B[0] = hx; B[1] = hz; B[2] = 0; B[3] = H;
    B[4] = hx * 0.55; B[5] = hz * 0.75; B[6] = H; B[7] = H + 4.5;
    B[8] = 0.5; B[9] = 0.5; B[10] = H + 4.5; B[11] = H + 18;
    O[4] = hx * 0.32; O[5] = 0;
  } else if (fam === 3) {          // shed: long and low, a billboard standing on the roof, vents
    const H = (7 + g * 9) * fall;
    B[0] = hx; B[1] = hz; B[2] = 0; B[3] = H;
    B[4] = Math.min(hx * 0.8, 7.5); B[5] = 0.25; B[6] = H; B[7] = H + 5.5;
    O[2] = 0; O[3] = (q2 > 0.5 ? 1 : -1) * (hz - 1);
    B[8] = hx * 0.3; B[9] = hz * 0.3; B[10] = H; B[11] = H + 2.5;
    O[4] = -hx * 0.4; O[5] = -hz * 0.2 * (q2 > 0.5 ? 1 : -1);
  } else if (fam === 4) {          // concrete mid-rise, a plant box on the roof
    const H = (18 + g * 34) * fall;
    B[0] = hx; B[1] = hz; B[2] = 0; B[3] = H;
    B[4] = hx * 0.4; B[5] = hz * 0.45; B[6] = H; B[7] = H + 3.2;
    O[2] = hx * 0.25; O[3] = -hz * 0.2;
  } else {                         // podium and slab
    const H0 = 7 + g2 * 3.5;
    const H = Math.max((H0 + 22 + g * 40) * fall, H0 + 2);
    B[0] = hx; B[1] = hz; B[2] = 0; B[3] = H0;
    B[4] = hx * 0.55; B[5] = hz * 0.62; B[6] = H0; B[7] = H;
    O[2] = (q3 - 0.5) * hx * 0.6; O[3] = (r2 - 0.5) * hz * 0.4;
    B[8] = hx * 0.2475; B[9] = hz * 0.31; B[10] = H; B[11] = H + 3;
    O[4] = O[2]; O[5] = O[3];
  }
  out.fam = fam;
  out.k = k;
  out.cx = ctrx;
  out.cz = ctrz;
  out.top = Math.max(B[3], B[7], B[11]);
  out.r[0] = r0; out.r[1] = r1; out.r[2] = r2; out.r[3] = r3;
  out.r2[0] = q0; out.r2[1] = q1; out.r2[2] = q2; out.r2[3] = q3;
  return out;
}

// ---------------------------------------------------- the shadow traces on JS
// The shader's lotTop, lotBlock, sunShadow and flashShadow, number for number,
// so a car in a tower's shadow is dark and a chunk in a flash's shadow is
// black, the impostors take the same light as the city they stand in.
const SUN_DX = Math.sin(SUN_AZ), SUN_DZ = -Math.cos(SUN_AZ);   // the bearing on the ground
const SUN_RISE = Math.tan(SUN_EL);
function lotTopJS(k) {
  const b = hu((k ^ 0x9e3779b9) >>> 0);
  const f = (b & 4095) / 4096, g = ((b >>> 12) & 4095) / 4096, g2 = (b >>> 24) / 255;
  const fam = f < 0.06 ? 0 : f < 0.36 ? 1 : f < 0.50 ? 2 : f < 0.62 ? 3 : f < 0.85 ? 4 : 5;
  if (fam === 0) return 64 + g * 48;
  if (fam === 1) return 17.5 + Math.max(g, g2) * 16;
  if (fam === 2) return 48 + g * 46;
  if (fam === 3) return 12.5 + g * 9;
  if (fam === 4) return 21.2 + g * 34;
  return 32 + g2 * 3.5 + g * 40;
}
function lotBlockJS(cx, cz, seed, px, py, pz, dx, dz, rise, soft, fallen, dmg) {
  const k = lotKeyJS(cx, cz, seed);
  const a = hu(k);
  let hx = CELL * 0.5 - (3 + ((a & 255) / 255) * 4), hz = CELL * 0.5 - (3 + (((a >>> 8) & 255) / 255) * 4);
  let ox = (((a >>> 16) & 255) / 255 - 0.5) * 3, oz = ((a >>> 24) / 255 - 0.5) * 3;
  if (Math.abs(cx) === 1) { hx -= 4; ox += cx > 0 ? 4 : -4; }
  const ctx0 = cx * CELL + ox, ctz0 = cz * CELL + oz;
  const idx = (dx >= 0 ? 1 : -1) / (Math.abs(dx) + 1e-5), idz = (dz >= 0 ? 1 : -1) / (Math.abs(dz) + 1e-5);
  let ax = (ctx0 - hx - px) * idx, bx = (ctx0 + hx - px) * idx;
  if (ax > bx) { const q = ax; ax = bx; bx = q; }
  let az = (ctz0 - hz - pz) * idz, bz = (ctz0 + hz - pz) * idz;
  if (az > bz) { const q = az; az = bz; bz = q; }
  let tIn = ax > az ? ax : az;
  const tOut = bx < bz ? bx : bz;
  if (tOut <= (tIn > 0 ? tIn : 0)) return 1;
  if (tIn < 0) tIn = 0;
  let top = lotTopJS(k) - 3;
  if (fallen) top *= 1 - 0.72 * smoothstepJS(0.55, 1.0, craterAtJS(dmg, ctx0, ctz0));
  const w = soft * (0.35 + tIn * 0.012);
  return smoothstepJS(-w, w, py + rise * tIn - top);
}
function sunShadowJS(px, py, pz, seed, steps, dmg) {
  let lit = 1, pcx = 100000, pcz = 100000;
  for (let i = 0; i < steps; i++) {
    const d = CELL * (0.55 + 0.62 * i + 0.075 * i * i);
    const cx = Math.floor((px + SUN_DX * d) / CELL + 0.5), cz = Math.floor((pz + SUN_DZ * d) / CELL + 0.5);
    if ((cx === pcx && cz === pcz) || lotStreetJS(cx, cz)) { pcx = cx; pcz = cz; continue; }
    pcx = cx; pcz = cz;
    const s = lotBlockJS(cx, cz, seed, px, py, pz, SUN_DX, SUN_DZ, SUN_RISE, 1, true, dmg);
    if (s < lit) lit = s;
    if (lit < 0.01) break;
  }
  return lit;
}
function flashShadowJS(px, py, pz, bx, by, bz, seed, steps, dmg) {
  const vx = bx - px, vz = bz - pz;
  const D = Math.sqrt(vx * vx + vz * vz);
  if (D < 2) return 1;
  const dx = vx / D, dz = vz / D, rise = (by - py) / D;
  let lit = 1, pcx = 100000, pcz = 100000;
  for (let i = 0; i < steps; i++) {
    const d = CELL * (0.5 + 0.85 * i);
    if (d >= D) break;
    const cx = Math.floor((px + dx * d) / CELL + 0.5), cz = Math.floor((pz + dz * d) / CELL + 0.5);
    if ((cx === pcx && cz === pcz) || lotStreetJS(cx, cz)) { pcx = cx; pcz = cz; continue; }
    pcx = cx; pcz = cz;
    const s = lotBlockJS(cx, cz, seed, px, py, pz, dx, dz, rise, 0.6, true, dmg);
    if (s < lit) lit = s;
    if (lit < 0.01) break;
  }
  return lit;
}
// the shader's projected gate (skyGate), number for number: h21, vnoise2,
// fbm2b and the mask, so a car or a chunk standing under a closed patch of
// the deck takes the cloud's shadow like the road it stands on
const fractJ = (x) => x - Math.floor(x);
function h21J(px, py) {
  let qx = fractJ(px * 0.1031), qy = fractJ(py * 0.1031), qz = qx;
  const d = qx * (qy + 33.33) + qy * (qz + 33.33) + qz * (qx + 33.33);
  qx += d; qy += d; qz += d;
  return fractJ((qx + qy) * qz);
}
function vnoise2J(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  let fx = x - ix, fy = y - iy;
  fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
  const a = h21J(ix, iy), b = h21J(ix + 1, iy), c = h21J(ix, iy + 1), d = h21J(ix + 1, iy + 1);
  return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
}
const fbm2bJ = (x, y) => 0.667 * vnoise2J(x, y) + 0.333 * vnoise2J(x * 2.03 + 7.1, y * 2.03 + 7.1);
function skyGateJ(px, py, pz, t, T) {
  const s = (CLOUD_H - py) / SUN_RISE;
  const qx = px + SUN_DX * s, qz = pz + SUN_DZ * s;
  const flx = t * 5.5, flz = t * 3.2;
  const wx = qx + 110 * (vnoise2J(qx * 0.0021 + flx * 0.002, qz * 0.0021 + flz * 0.002) - 0.5);
  const wz = qz + 110 * (vnoise2J(qx * 0.0021 + 7.3 - flz * 0.002, qz * 0.0021 + 2.1 - flx * 0.002) - 0.5);
  const wax = (wx + flx) * 0.0037, waz = (wz + flz) * 0.0037;
  const nA = 0.75 * fbm2bJ(wax, waz) + 0.25 * vnoise2J(wax * 4.1 + 3, waz * 4.1 + 3);
  const nB = fbm2bJ((wx + flx * 0.6) * 0.0083 + 11, (wz + flz * 0.6) * 0.0083 + 11);
  const ridge = 1 - Math.abs(2 * nB - 1);
  const mask = 0.18 + 1.12 * (0.58 * nA + 0.42 * ridge);
  return smoothstepJS(T, T + 0.1, mask);
}
// quaternion helpers on flat arrays: q = (x, y, z, w) at offset o
function quatSetAxisAngle(Q, o, ax, ay, az, ang) {
  const s = Math.sin(ang * 0.5);
  Q[o] = ax * s; Q[o + 1] = ay * s; Q[o + 2] = az * s; Q[o + 3] = Math.cos(ang * 0.5);
}
// integrate an angular velocity (world frame) into q over dt, renormalised
function quatSpin(Q, o, wx, wy, wz, dt) {
  const x = Q[o], y = Q[o + 1], z = Q[o + 2], w = Q[o + 3];
  const hx = wx * dt * 0.5, hy = wy * dt * 0.5, hz = wz * dt * 0.5;
  const nx = x + (hx * w + hy * z - hz * y);
  const ny = y + (hy * w + hz * x - hx * z);
  const nz = z + (hz * w + hx * y - hy * x);
  const nw = w - (hx * x + hy * y + hz * z);
  const l = 1 / (Math.sqrt(nx * nx + ny * ny + nz * nz + nw * nw) || 1);
  Q[o] = nx * l; Q[o + 1] = ny * l; Q[o + 2] = nz * l; Q[o + 3] = nw * l;
}
// compose a world-frame rotation (axis, angle) onto q exactly: q' = r ⊗ q
function quatPreRotate(Q, o, ax, ay, az, ang) {
  const s = Math.sin(ang * 0.5), rw = Math.cos(ang * 0.5);
  const rx = ax * s, ry = ay * s, rz = az * s;
  const x = Q[o], y = Q[o + 1], z = Q[o + 2], w = Q[o + 3];
  Q[o] = rw * x + rx * w + ry * z - rz * y;
  Q[o + 1] = rw * y - rx * z + ry * w + rz * x;
  Q[o + 2] = rw * z + rx * y - ry * x + rz * w;
  Q[o + 3] = rw * w - rx * x - ry * y - rz * z;
}

export function createScene(ctx) {
  const { THREE, quality } = ctx;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, ctx.width / Math.max(1, ctx.height), 0.4, 4000);
  const tier = quality.tier;
  const CLOUD_STEPS = tier === 'low' ? 11 : tier === 'high' ? 34 : 12; // 12 on med pays for the near ring filling the frame
  const CITY_STEPS = tier === 'low' ? 24 : tier === 'high' ? 72 : 28; // the lower city walks farther a ray; the impostor stands past the reach
  const REF_STEPS = tier === 'low' ? 0 : tier === 'high' ? 22 : 4;
  const MAX_CLOUDS = tier === 'low' ? 4 : tier === 'high' ? 8 : 5; // the bigger bursts cost a slot on med
  // A second inlined march costs the whole shader its occupancy, 2.5 ms a
  // frame at 1080p, but without it a cloud in front bites a crescent out of
  // the cloud behind, and clouds standing together is the point of the deck.
  // Med and high pay for it; low marches one and takes the coarse composite
  // for everything else.
  const MARCH2 = tier === 'low' ? 0 : 1;
  const SALVO_STEP = Math.max(1, Math.floor(16 / (MAX_CLOUDS - 1))); // the salvo's pitch across the deck
  const MAX_FIRE = tier === 'low' ? 4 : tier === 'high' ? 12 : 5;    // smoke columns the fronts can leave standing
  const MAX_DMG = tier === 'high' ? 8 : 5;                           // craters the wreck remembers (the clouds come and go; the damage stays)
  const STUMPS = tier === 'high' ? 4 : 2;                            // of those, how many knock blocks down to stumps in the DDA's geometry
  // the shadows: the lots the sun's trace walks (a uniform bound: HLSL does
  // not unroll it), the short form the wet road takes, the flash's and the
  // etched shadow's counts
  const SHADOW_STEPS = tier === 'low' ? 6 : tier === 'high' ? 11 : 8;
  const SHADOW_STEPS_LITE = 3;
  const FLASH_STEPS = tier === 'low' ? 5 : tier === 'high' ? 8 : 6;
  const ETCH_STEPS = tier === 'low' ? 3 : tier === 'high' ? 5 : 4;
  // the debris: the airborne chunks a front throws (they only cost while they
  // fly), the resting chunks a burst leaves round its crater
  const DEBRIS = tier === 'low' ? 400 : tier === 'high' ? 800 : 600;
  const REST = tier === 'low' ? 120 : tier === 'high' ? 260 : 200;

  // instance layout
  const N_CAPS_DET = DET_CAPS;
  const CAP_TRACK0 = N_CAPS_DET;
  const CAP_CALO0 = CAP_TRACK0 + TRACK_CAPS;
  const CAP_NEUT0 = CAP_CALO0 + MAX_TRACKS;
  const CAP_LAMP0 = CAP_NEUT0 + MAX_NEUTRONS;
  const CAP_RV0 = CAP_LAMP0 + LAMPS * 2;
  const N_CAPS = CAP_RV0 + MAX_RV * TRAIL_SEGS;
  const N_NUC = NUCLEI * NUCLEONS;
  const N_SOLID = N_NUC;
  // the oriented boxes: four per car (body, cabin, its shadow streak, its
  // contact shadow), one per airborne chunk, three per resting chunk (the
  // chunk, its streak, its contact shadow)
  const BX_CAR0 = 0;
  const BX_DEB0 = BX_CAR0 + CARS * 4;
  const BX_REST0 = BX_DEB0 + DEBRIS;
  const N_BOX = BX_REST0 + REST * 3;
  const GL_BUNCH0 = 0;
  const GL_HIT0 = 2;
  const GL_NEUT0 = GL_HIT0 + MAX_HITS;
  const GL_EMBER0 = GL_NEUT0 + MAX_NEUTRONS;
  const GL_RV0 = GL_EMBER0 + EMBERS;
  const GL_WIN0 = GL_RV0 + MAX_RV * 2;
  const GL_FIRE0 = GL_WIN0 + N_NUC;   // the glow of every fire the fronts leave burning
  const GL_VERTEX = GL_FIRE0 + MAX_FIRE;
  const N_GLOW = GL_VERTEX + 1;

  const pal5 = () => Array.from({ length: 5 }, () => ({ value: new THREE.Color(1, 1, 1) }));
  const wp = pal5(), cp = pal5(), sp = pal5(), gp = pal5();
  const palUniforms = (p) => ({ uPal0: p[0], uPal1: p[1], uPal2: p[2], uPal3: p[3], uPal4: p[4] });

  // --- the world quad -----------------------------------------------------------------
  const nucU = new Float32Array(NUCLEI * 4);
  const gammaU = new Float32Array(16);
  // The uniform side of the deck: five packed vec4 arrays, rebuilt from the
  // logical slots once a frame, holding only the clouds that stand.
  const cloudA = new Float32Array(MAX_CLOUDS * 4);
  const cloudB = new Float32Array(MAX_CLOUDS * 4);
  const cloudC = new Float32Array(MAX_CLOUDS * 4);
  const cloudD = new Float32Array(MAX_CLOUDS * 4);
  const cloudE = new Float32Array(MAX_CLOUDS * 4);
  // The wreck the bursts leave, as the shader reads it: up to MAX_DMG craters
  // (centre, 1/R², strength), the max over them the damage at a point. The JS
  // lot mirror runs the same loops, so the stumps and the blown panes the city
  // shows are the ones the nucleons are matched against.
  const dmg = { n: 0, stumps: STUMPS, x: new Float32Array(MAX_DMG), z: new Float32Array(MAX_DMG), invR2: new Float32Array(MAX_DMG), s: new Float32Array(MAX_DMG), y: new Float32Array(MAX_DMG) };
  const WU = {
    uRes: { value: new THREE.Vector2(ctx.width, ctx.height) },
    uCamPos: { value: new THREE.Vector3() },
    uCamFwd: { value: new THREE.Vector3(0, 0, -1) },
    uCamRight: { value: new THREE.Vector3(1, 0, 0) },
    uCamUp: { value: new THREE.Vector3(0, 1, 0) },
    uTanHalf: { value: Math.tan((FOV * Math.PI) / 360) },
    uTime: { value: 0 },
    uIntensity: { value: 1 },
    uFlash: { value: 0 },
    uActW: { value: new THREE.Vector4(0, 0, 1, 0) },
    uVertexGlow: { value: 0 },
    uCollFlash: { value: 0 },
    uNuc: { value: nucU },
    uGamma: { value: gammaU },
    uGammaA: { value: new Float32Array(4) },
    uCitySeed: { value: 3 },
    uCityFade: { value: 1 },
    uWinFade: { value: 1 },
    uRain: { value: 0.45 },
    uFogD: { value: 0.0075 },
    uStreet: { value: 0 },
    uNCloud: { value: 1 },
    uCloudA: { value: cloudA },
    uCloudB: { value: cloudB },
    uCloudC: { value: cloudC },
    uCloudD: { value: cloudD },
    uCloudE: { value: cloudE },
    uMorph: { value: 0 },
    uPress: { value: 0 },
    uBlastAge: { value: -1 },
    uBlastR: { value: 0 },
    uBlastMorph: { value: 0 },
    uBlastFire: { value: 0 },
    uVeil: { value: 0 },
    uDustH: { value: 40 },
    uSun: { value: new THREE.Vector3(Math.sin(SUN_AZ) * Math.cos(SUN_EL), Math.sin(SUN_EL), -Math.cos(SUN_AZ) * Math.cos(SUN_EL)) },
    uWind: { value: new THREE.Vector2(WIND_X, WIND_Z) },
    uWreck: { value: 0 },
    uHaze: { value: 0.0007 },
    uLamps: { value: 0.5 },
    uLtn: { value: 0 },
    uBoltSeed: { value: 1 },
    uNDmg: { value: 0 },
    uDmg: { value: new Float32Array(MAX_DMG * 4) },
    uDmgBox: { value: new THREE.Vector4(0, 0, 0, 0) },
    uNFire: { value: 0 },
    uFire: { value: new Float32Array(MAX_FIRE * 4) },
    uShadowSteps: { value: SHADOW_STEPS },
    uShadowStepsLite: { value: SHADOW_STEPS_LITE },
    uFlashSteps: { value: FLASH_STEPS },
    uEtchSteps: { value: ETCH_STEPS },
    uNFlash: { value: 0 },
    uNEtch: { value: 0 },
    uFlashP: { value: new Float32Array(8) },
    uFlashC: { value: new Float32Array(2) },
    uFlashExpo: { value: 0 },
    uGateT: { value: 0.62 },
    uDmgY: { value: new Float32Array(MAX_DMG) },
    ...palUniforms(wp),
  };
  const worldMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: WU,
    defines: { CLOUD_STEPS, CITY_STEPS, REF_STEPS, MAX_CLOUDS, MARCH2, MAX_DMG, MAX_FIRE, STUMPS },
    vertexShader: /* glsl */ `
      out vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: WORLD_FRAG,
    depthTest: false,
    depthWrite: false,
  });
  worldMat.name = "mile-world";
  const world = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), worldMat);
  world.frustumCulled = false;
  world.renderOrder = 0;
  scene.add(world);

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

  // capsules
  const capGeo = instancedQuad(quadUV);
  const capP0 = new Float32Array(N_CAPS * 3);
  const capP1 = new Float32Array(N_CAPS * 3);
  const capS = new Float32Array(N_CAPS * 4);
  const capAP0 = dyn(capP0, 3), capAP1 = dyn(capP1, 3), capAS = dyn(capS, 4);
  capGeo.setAttribute('aP0', capAP0);
  capGeo.setAttribute('aP1', capAP1);
  capGeo.setAttribute('aS', capAS);
  capGeo.instanceCount = N_CAPS;
  const CU = { uRes: { value: new THREE.Vector2(ctx.width, ctx.height) }, uIntensity: { value: 1 }, ...palUniforms(cp) };
  const capMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, uniforms: CU, vertexShader: CAP_VERT, fragmentShader: CAP_FRAG,
    transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
  capMat.name = "mile-caps";
  const caps = new THREE.Mesh(capGeo, capMat);
  caps.frustumCulled = false;
  caps.renderOrder = 2;
  scene.add(caps);

  // spheres: solids (depth) and glows (additive)
  function sphereSystem(n, frag, pal, solid, order) {
    const geo = instancedQuad(sphUV);
    const pos = new Float32Array(n * 3);
    const s = new Float32Array(n * 4);
    const c = new Float32Array(n * 4);   // explicit colour, zero blend at rest
    const aPos = dyn(pos, 3), aS = dyn(s, 4), aC = dyn(c, 4);
    geo.setAttribute('aPos', aPos);
    geo.setAttribute('aS', aS);
    geo.setAttribute('aC', aC);
    geo.instanceCount = n;
    const U = { uIntensity: { value: 1 }, ...palUniforms(pal) };
    const mat = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3, uniforms: U, vertexShader: SPH_VERT, fragmentShader: frag,
      transparent: !solid, depthTest: solid, depthWrite: solid, side: THREE.DoubleSide,
      blending: solid ? THREE.NormalBlending : THREE.AdditiveBlending,
    });
    mat.name = solid ? "mile-solids" : "mile-glows";
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = order;
    scene.add(mesh);
    return { geo, mat, mesh, pos, s, c, aPos, aS, aC, U };
  }
  const solids = sphereSystem(N_SOLID, SPH_FRAG_SOLID, sp, true, 1);
  const glows = sphereSystem(N_GLOW, SPH_FRAG_GLOW, gp, false, 3);

  // --- the launch map: the holographic globe over the city. Its own module and
  // its own programs, so nothing here grows the city shader; it draws above
  // everything (renderOrder 10+) and does no per-frame work while hidden.
  const launchMap = createLaunchMap(THREE, { tier, width: ctx.width, height: ctx.height, renderOrder: 10 });
  scene.add(launchMap.group);
  let mapOn = false;

  // the oriented boxes: cars, chunks, rubble and their shadow streaks
  const boxSrc = new THREE.BoxGeometry(2, 2, 2);
  const boxGeo = new THREE.InstancedBufferGeometry();
  boxGeo.setIndex(boxSrc.getIndex());
  boxGeo.setAttribute('position', boxSrc.getAttribute('position'));
  boxGeo.setAttribute('normal', boxSrc.getAttribute('normal'));
  const bxPos = new Float32Array(N_BOX * 3), bxExt = new Float32Array(N_BOX * 3);
  const bxRot = new Float32Array(N_BOX * 4), bxCol = new Float32Array(N_BOX * 4), bxLit = new Float32Array(N_BOX * 4);
  for (let i = 0; i < N_BOX; i++) bxRot[i * 4 + 3] = 1;
  const bxAPos = dyn(bxPos, 3), bxAExt = dyn(bxExt, 3), bxARot = dyn(bxRot, 4), bxACol = dyn(bxCol, 4), bxALit = dyn(bxLit, 4);
  boxGeo.setAttribute('aPos', bxAPos);
  boxGeo.setAttribute('aExt', bxAExt);
  boxGeo.setAttribute('aRot', bxARot);
  boxGeo.setAttribute('aCol', bxACol);
  boxGeo.setAttribute('aLit', bxALit);
  boxGeo.instanceCount = N_BOX;
  const BU = {
    uSun: { value: WU.uSun.value },
    uSunCol: { value: new THREE.Color() }, uAmb: { value: new THREE.Color() }, uDome: { value: new THREE.Color() }, uLampCol: { value: new THREE.Color() },
    uFlashCol: { value: new THREE.Color() }, uFireCol: { value: new THREE.Color() },
    uFlash: { value: new THREE.Vector4(0, 0, 0, 0) }, uFlashR2: { value: 1 }, uExpo: { value: 0 },
    uIntensity: { value: 1 },
  };
  const boxMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, uniforms: BU, vertexShader: BOX_VERT, fragmentShader: BOX_FRAG,
    transparent: true, depthTest: true, depthWrite: true, blending: THREE.NormalBlending,
  });
  boxMat.name = "mile-boxes";
  const boxes = new THREE.Mesh(boxGeo, boxMat);
  boxes.frustumCulled = false;
  boxes.renderOrder = 1;
  scene.add(boxes);
  // one box: position, half extents, quaternion (flat array + offset), colour, light terms
  const box = (i, x, y, z, ex, ey, ez, Q, qo, r, g, b, a, sunV, lamp, flashV, fire) => {
    const o3 = i * 3, o4 = i * 4;
    bxPos[o3] = x; bxPos[o3 + 1] = y; bxPos[o3 + 2] = z;
    bxExt[o3] = ex; bxExt[o3 + 1] = ey; bxExt[o3 + 2] = ez;
    bxRot[o4] = Q[qo]; bxRot[o4 + 1] = Q[qo + 1]; bxRot[o4 + 2] = Q[qo + 2]; bxRot[o4 + 3] = Q[qo + 3];
    bxCol[o4] = r; bxCol[o4 + 1] = g; bxCol[o4 + 2] = b; bxCol[o4 + 3] = a;
    bxLit[o4] = sunV; bxLit[o4 + 1] = lamp; bxLit[o4 + 2] = flashV; bxLit[o4 + 3] = fire;
  };
  const boxOff = (i) => { bxCol[i * 4 + 3] = 0; };
  // the shadow streak a thing throws down-sun: a flat black box from its foot,
  // as long as its height lets it be (capped), fading along its run
  // the box's local x runs along the streak, from the foot (x = -1) away from
  // the sun: a yaw about y sends +x onto (-SUN_DX, -SUN_DZ), a rotation by θ
  // maps (1, 0, 0) to (cos θ, 0, -sin θ)
  const shadowQ = new Float32Array(4);
  quatSetAxisAngle(shadowQ, 0, 0, 1, 0, Math.atan2(SUN_DZ, -SUN_DX));
  const shadowBox = (i, x, z, h, w, alpha) => {
    const L = Math.min(h / SUN_RISE, 34);
    const hl = L * 0.5;
    box(i, x + (-SUN_DX) * hl, 0.05, z + (-SUN_DZ) * hl, hl, 0.02, w, shadowQ, 0, 0, 0, 0, alpha, 0, 0, 0, -1);
  };

  const cap = (i, x0, y0, z0, x1, y1, z1, rad, alpha, tint, mode) => {
    const o = i * 3, q = i * 4;
    capP0[o] = x0; capP0[o + 1] = y0; capP0[o + 2] = z0;
    capP1[o] = x1; capP1[o + 1] = y1; capP1[o + 2] = z1;
    capS[q] = rad; capS[q + 1] = alpha; capS[q + 2] = tint; capS[q + 3] = mode;
  };
  const sph = (sys, i, x, y, z, r, alpha, tint, heat) => {
    const o = i * 3, q = i * 4;
    sys.pos[o] = x; sys.pos[o + 1] = y; sys.pos[o + 2] = z;
    sys.s[q] = r; sys.s[q + 1] = alpha; sys.s[q + 2] = tint; sys.s[q + 3] = heat;
  };

  // --- the detector: static capsules, their alpha set per frame ------------------------
  {
    let i = 0;
    for (const R of LAYERS) {
      for (let e = 0; e < 2; e++) {
        const z = e ? HALF_Z : -HALF_Z;
        for (let k = 0; k < RING_SEGS; k++) {
          const a0 = (k / RING_SEGS) * Math.PI * 2, a1 = ((k + 1) / RING_SEGS) * Math.PI * 2;
          cap(i++, Math.cos(a0) * R, Math.sin(a0) * R, z, Math.cos(a1) * R, Math.sin(a1) * R, z, 1.0, 0, 2, 0);
        }
      }
      for (let k = 0; k < AXIALS; k++) {
        const a = (k / AXIALS) * Math.PI * 2 + 0.1;
        cap(i++, Math.cos(a) * R, Math.sin(a) * R, -HALF_Z, Math.cos(a) * R, Math.sin(a) * R, HALF_Z, 0.9, 0, 2, 0);
      }
    }
    cap(DET_CAPS - 1, 0, 0, -9, 0, 0, 9, 2.2, 0, 2.4, 1); // the beam pipe
  }

  // --- the nuclei: one packed nucleon cloud, the lattice, the states -------------------
  const nucBase = new Float32Array(NUCLEONS * 3);
  const nucType = new Uint8Array(NUCLEONS); // 0 proton, 1 neutron
  {
    for (let i = 0; i < NUCLEONS; i++) {
      let x, y, z;
      do { x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; z = Math.random() * 2 - 1; } while (x * x + y * y + z * z > 1);
      nucBase[i * 3] = x * 0.75; nucBase[i * 3 + 1] = y * 0.75; nucBase[i * 3 + 2] = z * 0.75;
      nucType[i] = Math.random() < 0.42 ? 0 : 1;
    }
    for (let it = 0; it < 60; it++) {
      for (let i = 0; i < NUCLEONS; i++) {
        let fx = 0, fy = 0, fz = 0;
        const xi = nucBase[i * 3], yi = nucBase[i * 3 + 1], zi = nucBase[i * 3 + 2];
        for (let j = 0; j < NUCLEONS; j++) {
          if (j === i) continue;
          const dx = xi - nucBase[j * 3], dy = yi - nucBase[j * 3 + 1], dz = zi - nucBase[j * 3 + 2];
          const d2 = dx * dx + dy * dy + dz * dz + 1e-4;
          if (d2 < 0.25) { const f = (0.25 - d2) * 0.9; fx += dx * f; fy += dy * f; fz += dz * f; }
        }
        let nx = xi + fx * 0.2, ny = yi + fy * 0.2, nz = zi + fz * 0.2;
        const rl = Math.sqrt(nx * nx + ny * ny + nz * nz);
        const rMax = NUC_R - 0.22;
        if (rl > rMax) { nx *= rMax / rl; ny *= rMax / rl; nz *= rMax / rl; }
        nucBase[i * 3] = nx; nucBase[i * 3 + 1] = ny; nucBase[i * 3 + 2] = nz;
      }
    }
  }
  const latPos = new Float32Array(NUCLEI * 3);
  {
    const phi = (1 + Math.sqrt(5)) / 2;
    const v = [[0, 1, phi], [0, -1, phi], [0, 1, -phi], [0, -1, -phi], [1, phi, 0], [-1, phi, 0], [1, -phi, 0], [-1, -phi, 0], [phi, 0, 1], [-phi, 0, 1], [phi, 0, -1], [-phi, 0, -1]];
    const n = Math.sqrt(1 + phi * phi);
    for (let i = 0; i < 12; i++) {
      latPos[(i + 1) * 3] = (v[i][0] / n) * LATTICE_D;
      latPos[(i + 1) * 3 + 1] = (v[i][1] / n) * LATTICE_D;
      latPos[(i + 1) * 3 + 2] = (v[i][2] / n) * LATTICE_D;
    }
  }
  const nPhase = new Uint8Array(NUCLEI); // 0 idle, 1 excited, 2 split, 3 re-forming
  const nT = new Float32Array(NUCLEI);
  const nAxis = new Float32Array(NUCLEI * 3);
  const nOff = new Float32Array(NUCLEI); // the split plane's offset (asymmetry)
  const nHeat = new Float32Array(NUCLEI);
  const neutAlive = new Uint8Array(MAX_NEUTRONS);
  const neutFrom = new Float32Array(MAX_NEUTRONS * 3);
  const neutTo = new Float32Array(MAX_NEUTRONS * 3);
  const neutT = new Float32Array(MAX_NEUTRONS);
  const neutDur = new Float32Array(MAX_NEUTRONS);
  const neutTarget = new Int8Array(MAX_NEUTRONS);
  const gAge = new Float32Array(4).fill(-1);
  let gNext = 0;

  // --- the collider's event -------------------------------------------------------------
  const trkPhi = new Float32Array(MAX_TRACKS), trkTheta = new Float32Array(MAX_TRACKS), trkPt = new Float32Array(MAX_TRACKS);
  const trkQ = new Float32Array(MAX_TRACKS), trkTint = new Float32Array(MAX_TRACKS), trkE = new Float32Array(MAX_TRACKS);
  let evT = -1, evN = 0;

  // --- embers ---------------------------------------------------------------------------
  const embX = new Float32Array(EMBERS), embY = new Float32Array(EMBERS), embZ = new Float32Array(EMBERS), embV = new Float32Array(EMBERS);
  for (let i = 0; i < EMBERS; i++) { embX[i] = (Math.random() - 0.5) * 90; embY[i] = Math.random() * 60; embZ[i] = -Math.random() * 200; embV[i] = 2.5 + Math.random() * 6; }

  // --- the windows the nucleons become --------------------------------------------------
  // Every lit pane on the facades that flank and face the atom, gathered from
  // the same hash the shader runs, then matched to the nucleons by direction so
  // the shell unfolds outward instead of scattering.
  const WIN_CAP = 9000;
  const winPool = new Float32Array(WIN_CAP * 3);
  const winPoolCt = new Float32Array(WIN_CAP);    // each pane's colour temperature
  const winDir = new Float32Array(WIN_CAP * 2);   // each window's place in the frame
  const winNuc = new Float32Array(NUCLEI * NUCLEONS * 2); // each nucleon's place in the frame
  const winUsed = new Uint8Array(WIN_CAP);
  const winTarget = new Float32Array(N_NUC * 3);
  const winCt = new Float32Array(N_NUC);
  const order = new Int32Array(N_NUC);
  const rank = new Float32Array(N_NUC);
  const lotRec = { fam: 0, k: 0, cx: 0, cz: 0, top: 0, b: new Float64Array(12), off: new Float64Array(6), r: [0, 0, 0, 0], r2: [0, 0, 0, 0] };
  let winCount = 0;
  let winDirty = false;   // the wreck changed since the windows were gathered

  function gatherWindows(seed) {
    winCount = 0;
    const push = (x, y, z, ct) => {
      if (winCount >= WIN_CAP) return;
      winPool[winCount * 3] = x; winPool[winCount * 3 + 1] = y; winPool[winCount * 3 + 2] = z;
      winPoolCt[winCount] = ct;
      winCount++;
    };
    // one mass of one lot, one wall of it.
    //   axis 0: the plane is x = ccx + sign*halfX, u runs along z
    //   axis 1: the plane is z = ccz + sign*halfZ, u runs along x
    // Every number below is the shader's `windows()` verbatim, the pitch, the
    // lit fraction, the pane's place inside its cell, the height band it is
    // allowed to stand in, the on/off hash and the colour temperature. They
    // have to be, or the cluster lands on panes the city leaves dark and the
    // hand-off shows.
    const facade = (L, m, axis, sign) => {
      const B = L.b, off = L.off;
      const bz = B[m * 4 + 2], bw = B[m * 4 + 3];
      if (bw - bz <= 8) return;                     // the shader's own window gate
      const bx = B[m * 4], bzz = B[m * 4 + 1];
      if (bx < 0.05) return;
      const ccx = L.cx + off[m * 2], ccz = L.cz + off[m * 2 + 1];
      const r = L.r;
      let wx = 3.0 + r[0] * 1.5, wy = 3.3 + r[1] * 0.9;
      let litF = 0.03 + 0.5 * r[2] * r[2];
      let ct = r[3] * 0.5;
      if (L.fam === 2) { wx = 2.1 + r[0] * 0.7; wy = 3.1; litF = 0.10 + 0.55 * r[2] * r[2]; ct = 0.55 + r[3] * 0.45; }
      else if (L.fam === 3) { wx = 4.5 + r[0] * 2.0; wy = 4.2; litF = 0.03 + r[2] * 0.12; }
      else if (L.fam === 4) { wx = 2.6 + r[0] * 1.2; wy = 3.0; litF = 0.05 + 0.45 * r[2] * r[2]; ct = 0.3 + r[3] * 0.5; }
      else if (L.fam === 5) { wx = 2.4 + r[0] * 1.0; wy = 3.2; litF = 0.08 + 0.5 * r[2] * r[2]; ct = 0.45 + r[3] * 0.4; }
      const dmgHere = damageAtJS(dmg, ccx, ccz);   // the shader's own wreck at this mass: blown panes are no landing
      const uc = axis === 0 ? ccz : ccx;
      const uh = axis === 0 ? bzz : bx;
      const plane = axis === 0 ? ccx + sign * bx : ccz + sign * bzz;
      const v00 = 1.6 + r[3] * 1.4;                 // the grid's own vertical origin
      const vLo = bz + 1.2, vHi = bw - 1.4;
      const u0 = Math.floor((uc - uh) / wx), u1 = Math.ceil((uc + uh) / wx);
      const v0 = Math.floor((vLo - v00) / wy), v1 = Math.ceil((vHi - v00) / wy);
      for (let iu = u0; iu <= u1; iu++) {
        const u = (iu + 0.51) * wx;                 // the pane sits at gu 0.24..0.78
        if (u < uc - uh + 0.6 || u > uc + uh - 0.6) continue;
        for (let iv = v0; iv <= v1; iv++) {
          const v = (iv + 0.41) * wy + v00;         // and at gv 0.18..0.64
          if (v < vLo + 0.2 || v > vHi - 0.2) continue;
          const wk = ((L.k * 131 + (iu + 512) * 17 + (iv + 512) * 71) >>> 0);
          const w1 = hu(wk);
          if ((w1 & 4095) / 4096 > litF) continue;
          // the shader spreads a pane's brightness over a decade; a nucleon that
          // lands on a desk lamp has landed on nothing, so only the panes that
          // read at this distance are candidates
          const bh = ((w1 >>> 12) & 4095) / 4096;
          if (0.06 + 0.95 * bh * bh * bh < 0.22) continue;
          // The glass slabs carry the densest grid and the highest lit
          // fraction, so left alone they are two thirds of everything the
          // cluster can land on and it resolves entirely in their cool light.
          // Thinning their share of the CANDIDATES (not of the city, every
          // pane skipped here still burns on the wall) hands the constellation
          // the skyline's own mix of warm and cool.
          if (L.fam === 2 && (w1 >>> 24) > 150) continue;
          // the shader's blow-out rule: a pane past its own threshold is a dark hole
          const w2 = hu((wk ^ 0x85ebca6b) >>> 0);
          if (dmgHere >= ((w2 >>> 24) & 255) / 255 * 0.9 + 0.05) continue;
          // At the distance the cluster resolves at, a pane is under a pixel and
          // the shader has already folded the grid into its average, which uses
          // the building's own colour temperature and not the per-pane jitter,
          // so that is the number the point has to arrive holding.
          if (axis === 0) push(plane + sign * 0.3, v, u, ct);
          else push(u, v, plane + sign * 0.3, ct);
        }
      }
    };
    // Every lot down the canyon the cluster can reach. The pool wants to be
    // several times the nucleon count: the match is greedy and exclusive, and a
    // pool the size of the cluster leaves the last nucleons taking whatever is
    // left instead of the pane they belong on.
    const cz0 = Math.round(ATOM_Z / CELL);
    for (let cz = cz0 - 1; cz >= cz0 - 26; cz--) {
      for (let cx = -8; cx <= 8; cx++) {
        if (lotStreetJS(cx, cz)) continue;
        const L = lotOfJS(cx, cz, seed, lotRec, dmg);
        const side = Math.abs(cx) <= 5 && cz >= cz0 - 14;
        for (let m = 0; m < 3; m++) {
          facade(L, m, 1, 1); // the face turned toward the eye
          if (side) facade(L, m, 0, cx > 0 ? -1 : 1);
        }
      }
    }
    // Match each nucleon to a window by WHERE IT SITS IN THE FRAME, not by
    // where it sits in the world. The eye starts MATCH_A metres behind the atom
    // and ends at MATCH_B, both on the same line, so a nucleon's frame position
    // at the first station and its window's frame position at the second are
    // directly comparable: match them and the point crosses the move without
    // crossing the screen. The window field is scaled to BLOOM times the
    // cluster's own reach, so the shell opens outward a little as it resolves
    // while the pull-back pulls it back in, the two nearly cancel.
    const MATCH_A = 24, MATCH_B = 118, BLOOM = 1.7;
    const e2y = TDZ, e2z = -TDY;                  // the frame's up, perpendicular to the axis
    const c1 = [ATOM_X + TDX * MATCH_A, ATOM_Y + TDY * MATCH_A, ATOM_Z + TDZ * MATCH_A];
    const c2 = [ATOM_X + TDX * MATCH_B, ATOM_Y + TDY * MATCH_B, ATOM_Z + TDZ * MATCH_B];
    const frame = (px, py, pz, c, out) => {
      const vx = px - c[0], vy = py - c[1], vz = pz - c[2];
      const along = -(vy * TDY + vz * TDZ);
      if (along < 12) return false;
      out[0] = vx / along;
      out[1] = (vy * e2y + vz * e2z) / along;
      return true;
    };
    const fa = [0, 0], fb = [0, 0];
    let nMax = 0;
    for (let i = 0; i < N_NUC; i++) {
      const n = (i / NUCLEONS) | 0, j = i % NUCLEONS;
      if (!frame(ATOM_X + latPos[n * 3] + nucBase[j * 3], ATOM_Y + latPos[n * 3 + 1] + nucBase[j * 3 + 1], ATOM_Z + latPos[n * 3 + 2] + nucBase[j * 3 + 2], c1, fa)) { rank[i] = 0; continue; }
      winNuc[i * 2] = fa[0]; winNuc[i * 2 + 1] = fa[1];
      rank[i] = fa[0] * fa[0] + fa[1] * fa[1];
      if (rank[i] > nMax) nMax = rank[i];
    }
    nMax = Math.sqrt(nMax) || 1;
    let keep = 0;
    const cone = nMax * BLOOM;
    for (let w = 0; w < winCount; w++) {
      if (!frame(winPool[w * 3], winPool[w * 3 + 1], winPool[w * 3 + 2], c2, fb)) continue;
      if (fb[0] * fb[0] + fb[1] * fb[1] > cone * cone) continue;
      winPool[keep * 3] = winPool[w * 3];
      winPool[keep * 3 + 1] = winPool[w * 3 + 1];
      winPool[keep * 3 + 2] = winPool[w * 3 + 2];
      winPoolCt[keep] = winPoolCt[w];
      winDir[keep * 2] = fb[0];
      winDir[keep * 2 + 1] = fb[1];
      keep++;
    }
    winCount = keep;
    if (winCount === 0) return;
    // the outermost nucleons claim first, so the silhouette survives the match
    for (let i = 0; i < N_NUC; i++) order[i] = i;
    order.sort((a, b) => rank[b] - rank[a]);
    winUsed.fill(0, 0, winCount);
    for (let q = 0; q < N_NUC; q++) {
      const idx = order[q];
      const ax = winNuc[idx * 2] * BLOOM, ay = winNuc[idx * 2 + 1] * BLOOM;
      let best = -1, bs = 1e9;
      for (let w = 0; w < winCount; w++) {
        if (winUsed[w]) continue;
        const dx = winDir[w * 2] - ax, dy = winDir[w * 2 + 1] - ay;
        const s = dx * dx + dy * dy;
        if (s < bs) { bs = s; best = w; }
      }
      if (best < 0) best = idx % winCount;
      winUsed[best] = 1;
      winTarget[idx * 3] = winPool[best * 3];
      winTarget[idx * 3 + 1] = winPool[best * 3 + 1];
      winTarget[idx * 3 + 2] = winPool[best * 3 + 2];
      winCt[idx] = winPoolCt[best];
    }
  }

  // --- clouds and re-entry vehicles -----------------------------------------------------
  // The logical deck: one slot per cloud, indexed as the scene thinks of them
  // (slot 0 is ground zero's), independent of where they land in the packed
  // uniform arrays.
  const cX = new Float32Array(MAX_CLOUDS), cZ = new Float32Array(MAX_CLOUDS);
  const cSc = new Float32Array(MAX_CLOUDS), cTau = new Float32Array(MAX_CLOUDS);
  const cFireS = new Float32Array(MAX_CLOUDS);   // how hard this yield's fireball burns
  const cYc = new Float32Array(MAX_CLOUDS);      // cap height, this frame
  const cFade = new Float32Array(MAX_CLOUDS);    // density, thinning at end of life
  const cAge = new Float32Array(MAX_CLOUDS).fill(-1);
  // Ground zero always stands: the resting subject of the act. It rests OLD,
  // the cloud is mature either way, but an old one has let the grid come back
  // on, so the city is lit at rest instead of blacked out by its own front.
  cAge[0] = 90;
  cFade[0] = 1;
  const cLife = new Float32Array(MAX_CLOUDS);
  const cSeq = new Float32Array(MAX_CLOUDS); // launch order, for eviction
  let cSeqNext = 1;
  const rvAlive = new Uint8Array(MAX_RV);
  const rvT = new Float32Array(MAX_RV);
  const rvDur = new Float32Array(MAX_RV);
  const rvFade = new Float32Array(MAX_RV);
  const rvYf = new Float32Array(MAX_RV);
  const rvSc = new Float32Array(MAX_RV);
  const rvNoise = new Float32Array(MAX_RV * TRAIL_SEGS);
  for (let i = 0; i < rvNoise.length; i++) rvNoise[i] = Math.random();
  const RV_VIS = 4;                              // visibility stations per vehicle
  const rvVis = new Float32Array(MAX_RV * RV_VIS).fill(1);
  const rvP0 = new Float32Array(MAX_RV * 3);
  const rvCP = new Float32Array(MAX_RV * 3);
  const rvTG = new Float32Array(MAX_RV * 3);
  const pv = new Float32Array(3), pv2 = new Float32Array(3);

  // pad index -> the place it lands. The deck is two rows of eight, and the
  // rows are two RINGS round the eye: the top row the far ring, the bottom row
  // the near ring, the column the bearing from left to right; each cell
  // carries a fixed jitter of its own so the map never reads as a grid.
  const padX = new Float32Array(16), padZ = new Float32Array(16), padYf = new Float32Array(16);
  const padAz = new Float32Array(16);
  for (let i = 0; i < 16; i++) {
    const col = i & 7, row = i >> 3;
    const az = ((col - 3.5) / 3.5) * RING_SPAN[row] + (hf(i * 2654435761 + 11) - 0.5) * 0.22;
    const r = RING_R[row][0] + (RING_R[row][1] - RING_R[row][0]) * hf(i * 40503 + 977);
    padAz[i] = az;
    padX[i] = EYE_X + Math.sin(az) * r;
    padZ[i] = EYE_Z - Math.cos(az) * r;
    // Low note big, high note small, but the floor is set by the skyline, not
    // by the curve: a burst whose cap tops out under the rooftops is a flash on
    // a wall and nothing else. At 0.30 the highest note still stands a cloud
    // about a hundred and fifty metres up, and pad 0 is three and a third times
    // that in every dimension.
    padYf[i] = 0.30 + 0.70 * Math.pow(1 - i / 15, 1.35);
  }

  const bez = (i, u, out) => {
    const w0 = (1 - u) * (1 - u), w1 = 2 * u * (1 - u), w2 = u * u;
    for (let k = 0; k < 3; k++) out[k] = w0 * rvP0[i * 3 + k] + w1 * rvCP[i * 3 + k] + w2 * rvTG[i * 3 + k];
  };

  // --- state ------------------------------------------------------------------------------
  const approach = (v, to, tau, dt) => v + (to - v) * (1 - Math.exp(-dt / tau));
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const smooth01 = (u) => { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); };
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 0.8;
  const camPos = new THREE.Vector3(0, ATOM_Y + TDY * CITY_DIST, ATOM_Z + TDZ * CITY_DIST);
  const camTarget = new THREE.Vector3(0, 20, -760);
  const wantPos = new THREE.Vector3();
  const wantTarget = new THREE.Vector3();
  const jetPhi = new Float32Array(3), jetTheta = new Float32Array(3);
  // the two ends of the city's window colour, refreshed from the palette
  const winWarm = new Float32Array(3), winCool = new Float32Array(3);
  const nucPh = new Float32Array(NUCLEONS * 3);
  for (let i = 0; i < NUCLEONS * 3; i++) nucPh[i] = Math.random() * 6.2831853;
  // The scene OPENS on the collider, act 0, the detector held dark until the
  // show starts (the first beat, the transport playing, or any pad), and the
  // first collision fires as the opening element. KNOB 6 / 'act' take over the
  // moment they move, as before.
  let act = 0;
  const actW = new Float32Array(4);
  actW[0] = 1;
  let opened = false, openS = 0, tpPrev = false, openAge = 0;
  let k5Prev = null, k6Prev = null;
  let yieldTarget = 0.5, cloudScaleP = 1, placeP = 0;
  let transit = 0, transitTarget = 0;
  let citySeed = 3;
  let yieldS = 0.5, swayS = 0, pressS = 0, bass = 0, high = 0, pulse = 0, beatPrev = 0, flash = 0;
  let hx = 0.5, hy = 0.5;
  let vertexGlow = 0, collFlash = 0, bunchT = 0;
  let blastAge = -1, passAge = -1, veil = 0, shake = 0, emberA = 0;
  let cascadeFlash = 0;
  let salvoLeft = 0, salvoT = 0, salvoIdx = 0;
  let deckStand = 1;      // how much of the MIRV deck stands: out for the pull-back
  const padPrev = new Float32Array(16);
  let wasTransiting = false;
  let tNow = 0;

  // ---- the wreck, the fires, the lightning, the debris, the lamps ----------------------
  let wreck = 0;          // the ash dusk: up with every burst, down over minutes
  let gzRs = 0;           // ground zero's own front radius this frame
  // fire sites: where the fronts set the blocks alight; to the shader as (x, z, y, age)
  const fireX = new Float32Array(MAX_FIRE), fireZ = new Float32Array(MAX_FIRE), fireY = new Float32Array(MAX_FIRE);
  const fireT0 = new Float32Array(MAX_FIRE).fill(-1);   // the scene time the fire catches; < 0 idle
  const fireRec = { fam: 0, k: 0, cx: 0, cz: 0, top: 0, b: new Float64Array(12), off: new Float64Array(6), r: [0, 0, 0, 0], r2: [0, 0, 0, 0] };
  const FIRE_PICK = 5;                                   // fires one burst lights
  const candX = new Float32Array(FIRE_PICK), candZ = new Float32Array(FIRE_PICK), candY = new Float32Array(FIRE_PICK), candS = new Float32Array(FIRE_PICK);
  // lightning: the storm cell throws a bolt every so often; 'lightning' fires one
  let ltnT = 9, ltnClock = 0, ltnNext = 26 + Math.random() * 30;
  // ---- THE DEBRIS: pieces of buildings flying. Chunks waiting on a front,
  // then thrown along it, slabs, beams, panels, window frames, signage, car
  // bodies, as oriented boxes tumbling about their own axis as a function of
  // their flight (the spin rate rides the speed, so a chunk at rest does not
  // spin), ballistic: radial from the burst, gravity, a little drag, NO
  // wander. A chunk that lands stays where it fell (state 3) until a new
  // front needs it.
  const dbState = new Uint8Array(DEBRIS);                // 0 idle, 1 waiting on its front, 2 flying, 3 resting
  const dbSrc = new Int8Array(DEBRIS);                   // the cloud slot whose front it rides; -2 ground zero's own
  const dbX = new Float32Array(DEBRIS), dbY = new Float32Array(DEBRIS), dbZ = new Float32Array(DEBRIS);
  const dbVX = new Float32Array(DEBRIS), dbVY = new Float32Array(DEBRIS), dbVZ = new Float32Array(DEBRIS);
  const dbTrig = new Float32Array(DEBRIS), dbAz = new Float32Array(DEBRIS);
  const dbEx = new Float32Array(DEBRIS), dbEy = new Float32Array(DEBRIS), dbEz = new Float32Array(DEBRIS);
  const dbQ = new Float32Array(DEBRIS * 4), dbW = new Float32Array(DEBRIS * 3);
  const dbKind = new Uint8Array(DEBRIS), dbTint = new Float32Array(DEBRIS);
  const dbSun = new Float32Array(DEBRIS), dbFl = new Float32Array(DEBRIS).fill(1), dbVis = new Float32Array(DEBRIS).fill(1);
  const dbRestT = new Float32Array(DEBRIS);
  for (let i = 0; i < DEBRIS; i++) dbQ[i * 4 + 3] = 1;
  let debrisLive = 0;
  // ---- THE RESTING POOL: the bigger chunks a burst leaves round its crater,
  // slab corners, beams, a water tank, a cornice piece, settled on the
  // rubble, at the feet of the stumps and down the streets, sized by the
  // crater; each grows from nothing as the fireball hides it. Cleared by
  // 'rebuild'; the oldest recycled by the next burst.
  const rsOn = new Uint8Array(REST);
  const rsX = new Float32Array(REST), rsY = new Float32Array(REST), rsZ = new Float32Array(REST);
  const rsEx = new Float32Array(REST), rsEy = new Float32Array(REST), rsEz = new Float32Array(REST);
  const rsQ = new Float32Array(REST * 4), rsGrow = new Float32Array(REST), rsAge = new Float32Array(REST);
  const rsSun = new Float32Array(REST), rsFl = new Float32Array(REST).fill(1), rsVis = new Float32Array(REST).fill(1), rsTint = new Float32Array(REST);
  for (let i = 0; i < REST; i++) rsQ[i * 4 + 3] = 1;
  let rsNext = 0;
  // ---- THE CARS: parked along both kerbs of the boulevard, the avenues and
  // the cross streets; in the wreck shoved, flipped, stacked against the bases
  // of the blocks, burning, and lifted and tumbled along the blast wind when
  // a front takes them.
  const carState = new Uint8Array(CARS);                 // 0 empty slot, 1 parked, 2 flying, 3 wrecked at rest
  const carX = new Float32Array(CARS), carY = new Float32Array(CARS), carZ = new Float32Array(CARS);
  const carVX = new Float32Array(CARS), carVY = new Float32Array(CARS), carVZ = new Float32Array(CARS);
  const carQ = new Float32Array(CARS * 4), carW = new Float32Array(CARS * 3);
  const carSun = new Float32Array(CARS), carLamp = new Float32Array(CARS), carFl = new Float32Array(CARS).fill(1), carVis = new Float32Array(CARS).fill(1);
  const carFire = new Float32Array(CARS), carTint = new Float32Array(CARS), carHit = new Uint8Array(CARS);
  for (let i = 0; i < CARS; i++) carQ[i * 4 + 3] = 1;
  const CAR_EX = 2.2, CAR_EY = 0.36, CAR_EZ = 0.95;       // the body's half extents; the cabin sits on it
  // the blast wind: radial from the most recent burst at the eye, relaxing
  // back to the storm's wind over a minute, the smoke leans with it, the
  // embers stream along it, debris far from any burst rides it
  let bwX = 0.91, bwZ = 0.41, bwGust = 0.35;
  const WBX = WIND_X / Math.sqrt(WIND_X * WIND_X + WIND_Z * WIND_Z), WBZ = WIND_Z / Math.sqrt(WIND_X * WIND_X + WIND_Z * WIND_Z);
  // the flash picks: the two biggest live bursts, as lights
  let nFlash = 0, flashExpo = 0;
  const flX = new Float32Array(2), flY = new Float32Array(2), flZ = new Float32Array(2), flA = new Float32Array(2), flR2 = new Float32Array(2);
  let shadowContrastP = 0.5;
  let visCursor = 0;                                     // the amortised visibility query's cursor
  // the lamps: how far each has fallen (0 standing, 1 down); persistent until
  // rebuild; and the sun's shadow on each post (the trace, once)
  const lampFall = new Float32Array(LAMPS * 2);
  const lampSun = new Float32Array(LAMPS * 2).fill(1);
  function traceLamps() {
    for (let k = 0; k < LAMPS; k++) for (let s = 0; s < 2; s++) lampSun[k * 2 + s] = sunShadowJS(s ? LAMP_X : -LAMP_X, LAMP_H * 0.5, LAMP_Z0 - LAMP_DZ * k, citySeed, SHADOW_STEPS, dmg);
  }

  gatherWindows(citySeed);
  parkCars(citySeed);
  traceLamps();

  // A burst's crater: merged into one standing close by, else a free slot,
  // else the weakest. Packed straight to the shader; the window gather is
  // marked stale so the next pull-back matches against the wrecked city.
  function addDamage(x, z, R, s, y) {
    let slot = -1;
    for (let i = 0; i < dmg.n; i++) {
      const dx = x - dmg.x[i], dz = z - dmg.z[i];
      const Ri = 1 / Math.sqrt(dmg.invR2[i]);
      if (dx * dx + dz * dz < Math.max(R, Ri) * Math.max(R, Ri) * 0.2) {
        slot = i;
        if (Ri > R) { x = dmg.x[i]; z = dmg.z[i]; R = Ri; y = dmg.y[i]; }
        s = Math.max(s, dmg.s[i]);
        break;
      }
    }
    if (slot < 0) {
      if (dmg.n < MAX_DMG) slot = dmg.n++;
      else { let w = 1e18; for (let i = 0; i < MAX_DMG; i++) { const v = dmg.s[i] / dmg.invR2[i]; if (v < w) { w = v; slot = i; } } }
    }
    dmg.x[slot] = x; dmg.z[slot] = z; dmg.invR2[slot] = 1 / (R * R); dmg.s[slot] = s; dmg.y[slot] = y;
    // the biggest first: the geometry reads only the first STUMPS of them
    for (let i = 1; i < dmg.n; i++) {
      for (let j = i; j > 0 && dmg.s[j] / dmg.invR2[j] > dmg.s[j - 1] / dmg.invR2[j - 1]; j--) {
        let q = dmg.x[j]; dmg.x[j] = dmg.x[j - 1]; dmg.x[j - 1] = q;
        q = dmg.z[j]; dmg.z[j] = dmg.z[j - 1]; dmg.z[j - 1] = q;
        q = dmg.invR2[j]; dmg.invR2[j] = dmg.invR2[j - 1]; dmg.invR2[j - 1] = q;
        q = dmg.s[j]; dmg.s[j] = dmg.s[j - 1]; dmg.s[j - 1] = q;
        q = dmg.y[j]; dmg.y[j] = dmg.y[j - 1]; dmg.y[j - 1] = q;
      }
    }
    const U = WU.uDmg.value, UY = WU.uDmgY.value;
    let bx0 = 1e9, bz0 = 1e9, bx1 = -1e9, bz1 = -1e9;
    for (let i = 0; i < dmg.n; i++) {
      U[i * 4] = dmg.x[i]; U[i * 4 + 1] = dmg.z[i]; U[i * 4 + 2] = dmg.invR2[i]; U[i * 4 + 3] = dmg.s[i];
      UY[i] = dmg.y[i];
      if (i >= STUMPS) continue;
      // the box round the radii a block starts to fall at (the crater term past 0.45)
      const Rf = 0.85 / Math.sqrt(dmg.invR2[i]);
      bx0 = Math.min(bx0, dmg.x[i] - Rf); bx1 = Math.max(bx1, dmg.x[i] + Rf);
      bz0 = Math.min(bz0, dmg.z[i] - Rf); bz1 = Math.max(bz1, dmg.z[i] + Rf);
    }
    WU.uDmgBox.value.set(bx0, bz0, bx1, bz1);
    WU.uNDmg.value = dmg.n;
    WU.uNEtch.value = Math.min(dmg.n, STUMPS);
    winDirty = true;
    // the stumps throw stumps' shadows: the traced light on the cars and the lamps is stale
    carsDirty = true;
    traceLamps();
  }
  // one pass of the fire scan: the lots of a box, standing but hit (damage in
  // [dMin, 0.97]), one in five by hash, the `pick` nearest the eye kept
  function scanFires(x, z, sc, c0x, c1x, c0z, c1z, dMin, pick, scoreX, scoreZ) {
    let nc = 0;
    for (let cz = c0z; cz <= c1z; cz++) {
      for (let cx = c0x; cx <= c1x; cx++) {
        if (lotStreetJS(cx, cz)) continue;
        const k = lotKeyJS(cx, cz, citySeed);
        if ((hu((k ^ 0x51ed27) >>> 0) & 255) > 52) continue;
        const L = lotOfJS(cx, cz, citySeed, fireRec, dmg);
        const d = damageAtJS(dmg, L.cx, L.cz);
        if (d < dMin || d > 0.97) continue;
        const ex = L.cx - scoreX, ez = L.cz - scoreZ;
        const score = ex * ex + ez * ez;
        let at = nc < pick ? nc : -1;
        if (at < 0) { let w = -1; for (let i = 0; i < pick; i++) if (candS[i] > w) { w = candS[i]; at = i; } if (score >= w) continue; }
        else nc++;
        let top = 0;
        for (let m = 0; m < 3; m++) if (L.b[m * 4] > 2 && L.b[m * 4 + 3] > top) top = L.b[m * 4 + 3];
        candX[at] = L.cx + (Math.random() - 0.5) * 4; candZ[at] = L.cz + (Math.random() - 0.5) * 4; candY[at] = top; candS[at] = score;
      }
    }
    for (let c = 0; c < nc; c++) {
      let slot = -1, oldest = 1e18;
      for (let i = 0; i < MAX_FIRE; i++) { if (fireT0[i] < 0) { slot = i; break; } if (fireT0[i] < oldest) { oldest = fireT0[i]; slot = i; } }
      const dx = candX[c] - x, dz = candZ[c] - z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      fireX[slot] = candX[c]; fireZ[slot] = candZ[c]; fireY[slot] = candY[c];
      // it catches when the front reaches it, and a moment after
      fireT0[slot] = tNow + Math.pow(dist / (sc * 9), 1 / 0.7) + 1 + Math.random() * 3;
    }
  }
  // The fires a burst leaves: a scan of the lots inside its crater for blocks
  // still standing but hit hard, and a second of the blocks round the eye for
  // the ones the front's wake sets alight, so the smoke columns stand where
  // the eye is, in the front's wake, not only at ground zero
  function igniteFrom(x, z, sc) {
    const R = Math.min(sc * 10 * 0.85, 330);
    scanFires(x, z, sc, Math.floor((x - R) / CELL), Math.ceil((x + R) / CELL), Math.floor((z - R) / CELL), Math.ceil((z + R) / CELL), 0.28, 3, camPos.x, camPos.z);
    // the wake fires: round a point ahead of the eye, so the columns stand in frame
    let fx = camTarget.x - camPos.x, fz = camTarget.z - camPos.z;
    const fl = Math.sqrt(fx * fx + fz * fz) + 1e-6;
    fx = camPos.x + (fx / fl) * 150; fz = camPos.z + (fz / fl) * 150;
    const E = 170;
    scanFires(x, z, sc, Math.floor((fx - E) / CELL), Math.ceil((fx + E) / CELL), Math.floor((fz - E) / CELL), Math.ceil((fz + E) / CELL), 0.18, 2, fx, fz);
  }
  // a chunk's shape: slab, beam, panel, window frame, signage, a car body,
  // the box's x is its long axis and y its thin one, so a chunk lies flat
  // when its quaternion is a yaw
  function rollChunk(i, scale) {
    const r = Math.random();
    let ex, ey, ez, kind;
    if (r < 0.30) { kind = 0; ex = 1.2 + Math.random() * 1.2; ey = 0.15 + Math.random() * 0.15; ez = 0.8 + Math.random() * 0.8; }       // slab
    else if (r < 0.50) { kind = 1; ex = 1.8 + Math.random() * 1.4; ey = 0.15; ez = 0.15 + Math.random() * 0.1; }                          // beam
    else if (r < 0.72) { kind = 2; ex = 1.0 + Math.random() * 0.8; ey = 0.05; ez = 0.7 + Math.random() * 0.6; }                             // panel
    else if (r < 0.84) { kind = 3; ex = 0.9 + Math.random() * 0.4; ey = 0.06; ez = 1.0 + Math.random() * 0.5; }                             // window frame
    else if (r < 0.90) { kind = 4; ex = 1.4 + Math.random() * 0.8; ey = 0.08; ez = 0.8 + Math.random() * 0.4; }                             // signage
    else { kind = 5; ex = 2.1; ey = 0.55; ez = 0.9; }                                                                                        // a car body
    dbEx[i] = ex * scale; dbEy[i] = ey * scale; dbEz[i] = ez * scale;
    dbKind[i] = kind; dbTint[i] = Math.random();
    // the tumble axis: its own, fixed for the flight
    let ax = Math.random() - 0.5, ay = Math.random() - 0.5, az = Math.random() - 0.5;
    const l = Math.sqrt(ax * ax + ay * ay + az * az) + 1e-6;
    dbW[i * 3] = ax / l; dbW[i * 3 + 1] = ay / l; dbW[i * 3 + 2] = az / l;
  }
  // the debris a front throws: a share of the pool (the idle first, then the
  // longest-resting) waits on this burst's front at radii round the eye's
  // distance, bearing toward the eye, so the shower crosses the eye as the
  // front does, launched upwind of it, the chunks stream PAST it
  function seedDebris(src, x, z, sc, share) {
    const dx = camPos.x - x, dz = camPos.z - z;
    const dCam = Math.sqrt(dx * dx + dz * dz);
    const azC = Math.atan2(dz, dx);
    const rMax = Math.min(sc * 45, 900);
    const scale = 0.7 + 0.5 * clamp(sc / 40, 0.3, 1.6);
    let want = Math.round(DEBRIS * share);
    // the idle first, then the chunks resting out of the eye's sight, then any at rest
    for (let pass = 0; pass < 3 && want > 0; pass++) {
      for (let i = 0; i < DEBRIS && want > 0; i++) {
        if (pass === 0 ? dbState[i] !== 0 : dbState[i] !== 3) continue;
        if (pass > 0 && dbRestT[i] < 2) continue;
        if (pass === 1) { const ex = dbX[i] - camPos.x, ez = dbZ[i] - camPos.z; if (ex * ex + ez * ez < 150 * 150) continue; }
        if (Math.random() > 0.5) continue;
        dbState[i] = 1; dbSrc[i] = src;
        dbAz[i] = azC + (Math.random() - 0.5) * 0.7;
        dbTrig[i] = Math.min(rMax, dCam * (0.82 + Math.random() * 0.26));
        rollChunk(i, scale);
        want--;
      }
    }
  }
  // the chunks in flight, the chunks at rest: integrate, tumble, land, light
  function updateDebris(dt) {
    debrisLive = 0;
    const flashOn = nFlash > 0;
    for (let i = 0; i < DEBRIS; i++) {
      const st = dbState[i];
      if (st === 1) {
        const src = dbSrc[i];
        let rs, ox, oz;
        if (src === -2) { rs = blastAge >= 0 ? gzRs : -1; ox = GZ_X; oz = GZ_Z; }
        else { rs = cAge[src] >= 0 ? ringR(cAge[src], cSc[src]) : -1; ox = cX[src]; oz = cZ[src]; }
        if (rs < 0) { dbState[i] = 0; }
        else if (rs >= dbTrig[i]) {
          const ca = Math.cos(dbAz[i]), sa = Math.sin(dbAz[i]);
          dbX[i] = ox + ca * rs; dbZ[i] = oz + sa * rs; dbY[i] = 1 + Math.random() * 6;
          // THROWN: radial from the burst at the front's speed, a narrow spread
          // across it, a kick upward, and nothing else. No wander.
          const v = 48 + Math.random() * 44;
          const sp = (Math.random() - 0.5) * 0.24 * v;
          dbVX[i] = ca * v - sa * sp; dbVZ[i] = sa * v + ca * sp; dbVY[i] = 6 + Math.random() * 18;
          dbState[i] = 2;
          quatSetAxisAngle(dbQ, i * 4, dbW[i * 3], dbW[i * 3 + 1], dbW[i * 3 + 2], Math.random() * 6.2831853);
        }
      }
      if (dbState[i] === 2) {
        dbVY[i] -= 22 * dt;
        const drag = Math.exp(-dt * 0.10);
        dbVX[i] *= drag; dbVZ[i] *= drag;
        dbX[i] += dbVX[i] * dt; dbY[i] += dbVY[i] * dt; dbZ[i] += dbVZ[i] * dt;
        // the tumble is the flight's: rate tied to the speed and the size
        const spd = Math.sqrt(dbVX[i] * dbVX[i] + dbVY[i] * dbVY[i] + dbVZ[i] * dbVZ[i]);
        const rate = spd * 0.22 / (dbEx[i] + 0.6);
        quatSpin(dbQ, i * 4, dbW[i * 3] * rate, dbW[i * 3 + 1] * rate, dbW[i * 3 + 2] * rate, dt);
        const restY = Math.max(dbEy[i], dbEz[i] * 0.35);
        if (dbY[i] <= restY && dbVY[i] < 0) {
          // down: it lies along its travel, flat, and skids out
          dbY[i] = restY;
          dbState[i] = 3; dbRestT[i] = 0;
          dbVY[i] = 0; dbVX[i] *= 0.3; dbVZ[i] *= 0.3;
          quatSetAxisAngle(dbQ, i * 4, 0, 1, 0, Math.atan2(-dbVZ[i], dbVX[i]) + (Math.random() - 0.5) * 0.4);
          dbSun[i] = sunShadowJS(dbX[i], dbY[i], dbZ[i], citySeed, SHADOW_STEPS, dmg);
        } else {
          debrisLive++;
          dbSun[i] = sunShadowJS(dbX[i], dbY[i], dbZ[i], citySeed, SHADOW_STEPS, dmg);
        }
      } else if (dbState[i] === 3) {
        dbRestT[i] += dt;
        if (dbRestT[i] < 1) {
          const k = Math.exp(-dt * 4);
          dbVX[i] *= k; dbVZ[i] *= k;
          dbX[i] += dbVX[i] * dt; dbZ[i] += dbVZ[i] * dt;
        }
      }
      if (dbState[i] >= 2 && flashOn) dbFl[i] = flashShadowJS(dbX[i], dbY[i], dbZ[i], flX[0], flY[0], flZ[0], citySeed, FLASH_STEPS, dmg);
    }
  }
  // ---- the cars
  function parkCars(seed) {
    let n = 0;
    const slot = (x, z, yaw, h) => {
      if (n >= CARS) return;
      carState[n] = 1; carX[n] = x; carZ[n] = z; carY[n] = 0.3 + CAR_EY;
      quatSetAxisAngle(carQ, n * 4, 0, 1, 0, yaw);
      carTint[n] = h; carFire[n] = 0; carHit[n] = 0; carVis[n] = 1; carFl[n] = 1;
      carVX[n] = 0; carVY[n] = 0; carVZ[n] = 0;
      n++;
    };
    let j = 0;
    const r = () => hf((seed * 7919 + j++ * 2654435761 + 17) >>> 0);
    // the boulevard: both kerbs, from the street eye down to the river
    for (let s = 0; s < 2; s++) {
      for (let k = 0; k < 28; k++) {
        const z = 46 - k * 18.5 + (r() - 0.5) * 5;
        if (r() > 0.85) continue;
        if (z < RIVER_C0 * CELL + 20 && z > RIVER_C1 * CELL - 20) continue;   // the bridge
        slot((s ? 12.4 : -12.4) + (r() - 0.5) * 0.4, z, (s ? 0.5 : -0.5) * Math.PI + (r() - 0.5) * 0.06, r());
      }
    }
    // the avenues either side, the kerb toward the boulevard
    for (let s = 0; s < 2; s++) {
      const ax = s ? AV * CELL : -AV * CELL;
      for (let k = 0; k < 16; k++) {
        const z = -40 - k * 24 + (r() - 0.5) * 6;
        if (r() > 0.6) continue;
        slot(ax + (s ? -12.4 : 12.4), z, (s ? -0.5 : 0.5) * Math.PI + (r() - 0.5) * 0.06, r());
      }
    }
    // the cross streets: the near kerb, along x, clear of the boulevard and the avenues
    for (let cz = -ST; cz >= -ST * 4; cz -= ST) {
      if ((cz <= RIVER_C0 && cz >= RIVER_C1) || (cz <= YARD_C0 && cz >= YARD_C1)) continue;
      for (let k = 0; k < 14; k++) {
        const x = -104 + k * 16 + (r() - 0.5) * 4;
        if (Math.abs(x) < 17 || Math.abs(Math.abs(x) - AV * CELL) < 17 || r() > 0.55) continue;
        slot(x, cz * CELL + 12.4, (r() - 0.5) * 0.06, r());
      }
    }
    for (let i = n; i < CARS; i++) carState[i] = 0;
    traceCars();
  }
  // the sun's shadow on every parked car, once (again when the wreck changes)
  function traceCars() {
    for (let i = 0; i < CARS; i++) {
      if (carState[i] === 0) continue;
      carSun[i] = sunShadowJS(carX[i], carY[i] + 0.5, carZ[i], citySeed, SHADOW_STEPS, dmg);
      // the lamps' light on it: the two posts of the nearest group, as the shader sums them
      const k0 = Math.round((-carZ[i] + LAMP_Z0) / LAMP_DZ);
      let sum = 0;
      for (let kk = k0 - 1; kk <= k0 + 1; kk++) {
        const k = clamp(kk, 0, LAMPS - 1), lz = LAMP_Z0 - LAMP_DZ * k;
        for (let s = 0; s < 2; s++) {
          const dx = carX[i] - (s ? LAMP_X : -LAMP_X), dz = carZ[i] - lz, dy = carY[i] + 0.6 - LAMP_H;
          const d2 = dx * dx + dy * dy + dz * dz;
          sum += 130 * (-dy / Math.sqrt(d2)) / (d2 + 20);
        }
      }
      carLamp[i] = sum;
    }
  }
  let carsDirty = false;
  // a front reaching a car: shoved, flipped, stacked at the kerb, set
  // burning, or LIFTED and thrown along the blast wind with the chunks
  function hitCar(i, dirx, dirz, d, sc) {
    carHit[i] = 1;
    const r = Math.random();
    if (r < 0.30) {
      // lifted: it flies with the front and tumbles
      carState[i] = 2;
      const v = 26 + Math.random() * 30;
      carVX[i] = dirx * v + (Math.random() - 0.5) * 6; carVZ[i] = dirz * v + (Math.random() - 0.5) * 6; carVY[i] = 9 + Math.random() * 14;
      let ax = Math.random() - 0.5, ay = Math.random() - 0.5, az = Math.random() - 0.5;
      const l = Math.sqrt(ax * ax + ay * ay + az * az) + 1e-6;
      carW[i * 3] = ax / l; carW[i * 3 + 1] = ay / l; carW[i * 3 + 2] = az / l;
      carFire[i] = Math.random() < 0.35 ? 1 : 0;
    } else {
      // shoved down the blast: out along the radial, yawed, some flipped,
      // the ones that reach the kerb stacked up against it
      carState[i] = 3;
      const push = (3 + Math.random() * 7) * clamp(sc / 30, 0.5, 1.5) * clamp(1.6 - d, 0.3, 1.2);
      carX[i] += dirx * push; carZ[i] += dirz * push;
      const lim = Math.abs(carX[i]) < 40 ? 17.5 : 1e9;      // the boulevard's kerbs
      let stacked = 0;
      if (Math.abs(carX[i]) > lim) { carX[i] = Math.sign(carX[i]) * lim; stacked = 1; }
      const yaw = Math.atan2(-dirz, dirx) + (Math.random() - 0.5) * 1.4;
      const flip = Math.random() < 0.45 + 0.3 * stacked;
      quatSetAxisAngle(carQ, i * 4, 0, 1, 0, yaw);
      if (flip) {
        const roll = Math.random() < 0.5 ? Math.PI : (Math.random() < 0.5 ? 1.45 : -1.45);
        const cy = Math.cos(yaw), sy = Math.sin(yaw);
        quatPreRotate(carQ, i * 4, cy, 0, -sy, roll);           // roll about its own long axis
        carY[i] = Math.abs(Math.abs(roll) - Math.PI) < 0.1 ? CAR_EY + 0.62 : CAR_EZ;
      } else carY[i] = 0.3 + CAR_EY;
      if (stacked) carY[i] += 1.2 + Math.random() * 0.5;
      carFire[i] = Math.random() < 0.25 ? 1 : 0;
    }
  }
  function updateCars(dt) {
    const flashOn = nFlash > 0;
    for (let i = 0; i < CARS; i++) {
      const st = carState[i];
      if (st === 0) continue;
      if (st === 1 && !carHit[i]) {
        // has a front reached it, with damage here?
        const dHere = damageAtJS(dmg, carX[i], carZ[i]);
        if (dHere > 0.30) {
          let hit = false, dirx = 0, dirz = 0, dd = 1, scc = 20;
          if (blastAge >= 0) {
            const dx = carX[i] - GZ_X, dz = carZ[i] - GZ_Z, d = Math.sqrt(dx * dx + dz * dz);
            if (gzRs >= d) { hit = true; dirx = dx / d; dirz = dz / d; dd = d / (cSc[0] * 10); scc = cSc[0]; }
          }
          for (let c = 0; c < MAX_CLOUDS && !hit; c++) {
            if (cAge[c] < 0) continue;
            const dx = carX[i] - cX[c], dz = carZ[i] - cZ[c], d = Math.sqrt(dx * dx + dz * dz);
            if (ringR(cAge[c], cSc[c]) >= d && d < cSc[c] * 12) { hit = true; dirx = dx / d; dirz = dz / d; dd = d / (cSc[c] * 10); scc = cSc[c]; }
          }
          if (hit) hitCar(i, dirx, dirz, dd, scc);
        }
      }
      if (st === 2) {
        carVY[i] -= 22 * dt;
        const drag = Math.exp(-dt * 0.12);
        carVX[i] *= drag; carVZ[i] *= drag;
        carX[i] += carVX[i] * dt; carY[i] += carVY[i] * dt; carZ[i] += carVZ[i] * dt;
        const spd = Math.sqrt(carVX[i] * carVX[i] + carVY[i] * carVY[i] + carVZ[i] * carVZ[i]);
        const rate = spd * 0.09;
        quatSpin(carQ, i * 4, carW[i * 3] * rate, carW[i * 3 + 1] * rate, carW[i * 3 + 2] * rate, dt);
        carSun[i] = sunShadowJS(carX[i], carY[i], carZ[i], citySeed, SHADOW_STEPS, dmg);
        if (carY[i] < CAR_EZ && carVY[i] < 0) {
          // down, on whatever side it landed on
          carState[i] = 3;
          const yaw = Math.atan2(-carVZ[i], carVX[i]) + (Math.random() - 0.5) * 0.8;
          quatSetAxisAngle(carQ, i * 4, 0, 1, 0, yaw);
          const roll = Math.random() < 0.45 ? Math.PI : (Math.random() < 0.5 ? 1.5 : 0);
          if (roll !== 0) {
            const cy = Math.cos(yaw), sy = Math.sin(yaw);
            quatPreRotate(carQ, i * 4, cy, 0, -sy, roll);
          }
          carY[i] = roll === 0 ? 0.3 + CAR_EY : (roll > 3 ? CAR_EY + 0.62 : CAR_EZ);
          carVX[i] = 0; carVY[i] = 0; carVZ[i] = 0;
          carSun[i] = sunShadowJS(carX[i], carY[i], carZ[i], citySeed, SHADOW_STEPS, dmg);
        }
      }
      if (flashOn) carFl[i] = flashShadowJS(carX[i], carY[i] + 0.5, carZ[i], flX[0], flY[0], flZ[0], citySeed, FLASH_STEPS, dmg);
    }
    if (carsDirty) { traceCars(); carsDirty = false; }
  }
  // ---- the resting pool: a burst's bigger chunks, round its crater
  function placeRest(x, z, sc) {
    const R = Math.min(sc * 10 * 0.9, 360);
    const count = Math.min(REST, Math.round(REST * 0.35 * clamp(sc / 30, 0.5, 1.4)));
    const scale = 0.6 + 0.45 * clamp(sc / 40, 0.3, 1.6);
    for (let k = 0; k < count; k++) {
      const i = rsNext; rsNext = (rsNext + 1) % REST;
      const ang = Math.random() * 6.2831853;
      let px, pz;
      if (Math.random() < 0.45) {
        // at the foot of a block: a built lot inside the radius, just off its footprint
        const rr = R * (0.25 + 0.7 * Math.sqrt(Math.random()));
        const cx = Math.round((x + Math.cos(ang) * rr) / CELL), cz = Math.round((z + Math.sin(ang) * rr) / CELL);
        if (lotStreetJS(cx, cz)) { rsOn[i] = 0; continue; }
        const L = lotOfJS(cx, cz, citySeed, visRec, dmg);
        const side = Math.random() < 0.5, sg = Math.random() < 0.5 ? 1 : -1;
        px = side ? L.cx + sg * (L.b[0] + 0.5 + Math.random() * 3) : L.cx + (Math.random() - 0.5) * 2 * L.b[0];
        pz = side ? L.cz + (Math.random() - 0.5) * 2 * L.b[1] : L.cz + sg * (L.b[1] + 0.5 + Math.random() * 3);
      } else {
        // down the streets, outward-biased
        const rr = R * (0.3 + 0.7 * Math.sqrt(Math.random()));
        px = x + Math.cos(ang) * rr; pz = z + Math.sin(ang) * rr;
      }
      rsOn[i] = 1; rsX[i] = px; rsZ[i] = pz;
      const big = Math.random();
      const s = scale * (0.6 + 1.6 * big * big);
      rsEx[i] = (1.0 + Math.random() * 1.6) * s; rsEy[i] = (0.35 + Math.random() * 0.5) * s; rsEz[i] = (0.7 + Math.random() * 1.0) * s;
      if (Math.random() < 0.12) { rsEx[i] = 2.4 * s; rsEy[i] = 2.4 * s; rsEz[i] = 2.4 * s; }   // a water tank, a plant room
      rsY[i] = rsEy[i] * 0.8;
      quatSetAxisAngle(rsQ, i * 4, 0, 1, 0, Math.random() * 6.2831853);
      if (Math.random() < 0.3) { const t = Math.random() * 0.5 - 0.25; quatPreRotate(rsQ, i * 4, 0.894, 0, 0.447, t); rsY[i] += rsEx[i] * Math.abs(t) * 0.7; }
      rsGrow[i] = 0; rsAge[i] = 0; rsTint[i] = Math.random();
      rsSun[i] = sunShadowJS(px, rsY[i], pz, citySeed, SHADOW_STEPS, dmg);
      rsVis[i] = 0;
    }
  }
  function updateRest(dt) {
    const flashOn = nFlash > 0;
    for (let i = 0; i < REST; i++) {
      if (!rsOn[i]) continue;
      rsAge[i] += dt;
      rsGrow[i] = Math.min(1, rsGrow[i] + dt / 0.6);
      if (flashOn) rsFl[i] = flashShadowJS(rsX[i], rsY[i], rsZ[i], flX[0], flY[0], flZ[0], citySeed, FLASH_STEPS, dmg);
    }
  }
  // the visibility of what stands still, a few a frame: the world quad writes
  // no depth, so the CPU says what the blocks hide (visibleFrom), eased
  function amortiseVisibility(dt) {
    const per = 24;
    const total = CARS + REST + DEBRIS;
    for (let n = 0; n < per; n++) {
      const j = visCursor; visCursor = (visCursor + 1) % total;
      if (j < CARS) { if (carState[j] !== 0) carVis[j] = visibleFrom(carX[j], carY[j] + 0.8, carZ[j]); }
      else if (j < CARS + REST) { const i = j - CARS; if (rsOn[i]) rsVis[i] = visibleFrom(rsX[i], rsY[i] + 0.5, rsZ[i]); }
      else { const i = j - CARS - REST; if (dbState[i] === 3) dbVis[i] = visibleFrom(dbX[i], dbY[i] + 0.3, dbZ[i]); }
    }
    void dt;
  }
  // ---- the flash picks: the two biggest live fireballs as the city's point
  // lights, ranked by their light at the eye; the exposure they take
  function pickFlashes() {
    nFlash = 0; flashExpo = 0;
    let a0 = 0, a1 = 0, i0 = -1, i1 = -1;
    for (let i = 0; i < MAX_CLOUDS; i++) {
      if (cAge[i] < 0 || cFade[i] < 0.05) continue;
      const age = cAge[i], sc = cSc[i];
      const fire = Math.exp(-age / (1.4 + 0.09 * sc));
      const amp = cFireS[i] * 3.2 * fire * (0.35 + 0.65 * Math.exp(-age / 0.8)) * cFade[i];
      if (amp < 0.04) continue;
      const r2 = sc * sc * 170;
      const dx = cX[i] - camPos.x, dz = cZ[i] - camPos.z;
      const atEye = amp * r2 / (r2 + dx * dx + dz * dz + camPos.y * camPos.y);
      if (atEye > a0) { a1 = a0; i1 = i0; a0 = atEye; i0 = i; }
      else if (atEye > a1) { a1 = atEye; i1 = i; }
    }
    const F = WU.uFlashP.value, C = WU.uFlashC.value;
    for (let k = 0; k < 2; k++) {
      const i = k === 0 ? i0 : i1;
      if (i < 0) break;
      const age = cAge[i], sc = cSc[i];
      const fire = Math.exp(-age / (1.4 + 0.09 * sc));
      const amp = cFireS[i] * 3.2 * fire * (0.35 + 0.65 * Math.exp(-age / 0.8)) * cFade[i];
      flX[k] = cX[i]; flZ[k] = cZ[i]; flY[k] = Math.max(sc, cYc[i] * 0.7); flA[k] = amp; flR2[k] = sc * sc * 170;
      F[k * 4] = flX[k]; F[k * 4 + 1] = flY[k]; F[k * 4 + 2] = flZ[k]; F[k * 4 + 3] = flR2[k];
      C[k] = amp;
      flashExpo += (k === 0 ? a0 : a1) * 0.9;
      nFlash++;
    }
    WU.uNFlash.value = nFlash;
    WU.uFlashExpo.value = flashExpo;
  }
  // ---- the boxes: every car, chunk and resting piece, and their shadows, written
  const carCol = new Float32Array(3), chunkCol = new Float32Array(3);
  function updateBoxes(dt, w, pw) {
    // the palette's ash, greyed, for the chunks; the cars mostly dark neutrals
    const l4 = 0.299 * pw[4].r + 0.587 * pw[4].g + 0.114 * pw[4].b;
    chunkCol[0] = (pw[4].r + (l4 - pw[4].r) * 0.75) * 0.55; chunkCol[1] = (pw[4].g + (l4 - pw[4].g) * 0.75) * 0.55; chunkCol[2] = (pw[4].b + (l4 - pw[4].b) * 0.75) * 0.55;
    const cityW = w;
    const gateT = WU.uGateT.value;
    for (let i = 0; i < CARS; i++) {
      const b = BX_CAR0 + i * 4;
      const st = carState[i];
      if (st === 0 || cityW < 0.01) { boxOff(b); boxOff(b + 1); boxOff(b + 2); boxOff(b + 3); continue; }
      // colour: a dark neutral, a palette colour on a third
      const t = carTint[i];
      let r, g, bb;
      if (t < 0.66) { const v = 0.06 + t * 0.35; r = v * (0.9 + 0.2 * pw[4].r); g = v * (0.9 + 0.2 * pw[4].g); bb = v * (0.9 + 0.2 * pw[4].b); }
      else { const c = t < 0.78 ? pw[1] : t < 0.9 ? pw[2] : pw[3]; const lum = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b; r = (c.r + (lum - c.r) * 0.5) * 0.5; g = (c.g + (lum - c.g) * 0.5) * 0.5; bb = (c.b + (lum - c.b) * 0.5) * 0.5; }
      const vis = carVis[i] * cityW;
      const fire = carFire[i] * (0.5 + 0.5 * Math.abs(Math.sin(tNow * 9 + i * 2.1))) * (0.7 + 0.3 * Math.sin(tNow * 23 + i));
      const lamp = carLamp[i] * WU.uLamps.value * 0.55;
      const sunV = carSun[i] * carSun[i] * (carSun[i] > 0.05 ? skyGateJ(carX[i], carY[i], carZ[i], tNow, gateT) : 0);
      box(b, carX[i], carY[i], carZ[i], CAR_EX * cityW, CAR_EY * cityW, CAR_EZ * cityW, carQ, i * 4, r, g, bb, vis, sunV, lamp, carFl[i], fire * 0.8);
      // the cabin rides the body's frame: up and a little back in its local x
      const q = i * 4;
      const qx = carQ[q], qy = carQ[q + 1], qz = carQ[q + 2], qw = carQ[q + 3];
      // rotate the local offset (-0.25, 0.63, 0)
      const lx = -0.25 * cityW, ly = 0.63 * cityW, lz = 0;
      const cx2 = qy * lz - qz * ly + qw * lx, cy2 = qz * lx - qx * lz + qw * ly, cz2 = qx * ly - qy * lx + qw * lz;
      const ox = lx + 2 * (qy * cz2 - qz * cy2), oy = ly + 2 * (qz * cx2 - qx * cz2), oz = lz + 2 * (qx * cy2 - qy * cx2);
      box(b + 1, carX[i] + ox, carY[i] + oy, carZ[i] + oz, 1.05 * cityW, 0.27 * cityW, 0.82 * cityW, carQ, i * 4, r * 0.55 + 0.02, g * 0.55 + 0.02, bb * 0.55 + 0.03, vis, sunV, lamp, carFl[i], fire * 0.5);
      // its shadow on the road: the streak only while it stands on the ground
      // and the sun reaches it; the contact shadow whenever it stands
      if (st !== 2 && sunV > 0.02) shadowBox(b + 2, carX[i], carZ[i], 1.5, (st === 1 ? CAR_EZ : CAR_EX * 0.7) * cityW, 0.62 * sunV * vis);
      else boxOff(b + 2);
      if (st === 1) box(b + 3, carX[i], 0.04, carZ[i], CAR_EX * 1.08 * cityW, 0.02, CAR_EZ * 1.15 * cityW, carQ, i * 4, 0, 0, 0, 0.5 * vis, 0, 0, 0, -2);
      else if (st === 3) box(b + 3, carX[i], 0.04, carZ[i], CAR_EX * 0.85 * cityW, 0.02, CAR_EX * 0.85 * cityW, shadowQ, 0, 0, 0, 0, 0.45 * vis, 0, 0, 0, -2);   // on its side or its roof: a square patch
      else boxOff(b + 3);
    }
    for (let i = 0; i < DEBRIS; i++) {
      const b = BX_DEB0 + i;
      const st = dbState[i];
      if (st < 2 || cityW < 0.01) { boxOff(b); continue; }
      const t = dbTint[i];
      let r = chunkCol[0] * (0.7 + 0.6 * t), g = chunkCol[1] * (0.7 + 0.6 * t), bb = chunkCol[2] * (0.7 + 0.6 * t);
      if (dbKind[i] === 4) { const c = t < 0.5 ? pw[3] : pw[2]; r = c.r * 0.6; g = c.g * 0.6; bb = c.b * 0.6; }   // signage keeps its colour
      else if (dbKind[i] === 5) { r *= 0.6; g *= 0.6; bb *= 0.7; }
      const vis = (st === 3 ? dbVis[i] : 1) * cityW;
      const sunV = dbSun[i] * dbSun[i] * (dbSun[i] > 0.05 ? skyGateJ(dbX[i], dbY[i], dbZ[i], tNow, gateT) : 0);
      box(b, dbX[i], dbY[i], dbZ[i], dbEx[i], dbEy[i], dbEz[i], dbQ, i * 4, r, g, bb, vis, sunV, 0, dbFl[i], 0);
    }
    for (let i = 0; i < REST; i++) {
      const b = BX_REST0 + i * 3;
      if (!rsOn[i] || cityW < 0.01) { boxOff(b); boxOff(b + 1); boxOff(b + 2); continue; }
      const gsc = smooth01(rsGrow[i]);
      const t = rsTint[i];
      const r = chunkCol[0] * (0.75 + 0.5 * t), g = chunkCol[1] * (0.75 + 0.5 * t), bb = chunkCol[2] * (0.75 + 0.5 * t);
      const vis = rsVis[i] * cityW;
      const sunV = rsSun[i] * rsSun[i] * (rsSun[i] > 0.05 ? skyGateJ(rsX[i], rsY[i], rsZ[i], tNow, gateT) : 0);
      box(b, rsX[i], rsY[i] * gsc, rsZ[i], rsEx[i] * gsc, rsEy[i] * gsc, rsEz[i] * gsc, rsQ, i * 4, r, g, bb, vis, sunV, 0, rsFl[i], 0);
      if (sunV > 0.02 && gsc > 0.2) shadowBox(b + 1, rsX[i], rsZ[i], rsEy[i] * 1.6 * gsc, rsEz[i] * 0.8 * gsc, 0.5 * sunV * vis);
      else boxOff(b + 1);
      const pad = Math.max(rsEx[i], rsEz[i]) * 1.05 * gsc;
      box(b + 2, rsX[i], 0.04, rsZ[i], pad, 0.02, pad, shadowQ, 0, 0, 0, 0, 0.42 * vis * gsc, 0, 0, 0, -2);
    }
    void dt;
  }
  function fireLightning() {
    ltnT = 0;
    WU.uBoltSeed.value = 1 + ((Math.random() * 1000) | 0);
    ltnNext = ltnClock + 18 + Math.random() * 40;
  }

  // --- the collider ----------------------------------------------------------------------
  function fireCollision() {
    evT = 0;
    evN = Math.floor(40 + yieldS * 80);
    for (let k = 0; k < 3; k++) { jetPhi[k] = Math.random() * 6.2831853; jetTheta[k] = 0.6 + Math.random() * 1.9; }
    for (let j = 0; j < MAX_TRACKS; j++) {
      const inJet = Math.random() < 0.65;
      const k = (Math.random() * 3) | 0;
      const eta = (Math.random() - 0.5) * 4.8;
      trkPhi[j] = inJet ? jetPhi[k] + gauss() * 0.22 : Math.random() * 6.2831853;
      trkTheta[j] = inJet ? clamp(jetTheta[k] + gauss() * 0.18, 0.2, 2.94) : 2 * Math.atan(Math.exp(-eta));
      const pt = 0.3 + 5 * Math.pow(Math.random(), 3) + (inJet ? 1.5 * Math.random() : 0);
      trkPt[j] = pt;
      const r = Math.random();
      trkQ[j] = r < 0.15 ? 0 : r < 0.575 ? 1 : -1;
      trkTint[j] = pt < 2.5 ? 3.0 - 0.4 * pt : 4.3 + 0.7 * Math.min(1, (pt - 2.5) / 3);
      trkE[j] = pt * (0.8 + Math.random() * 0.6);
    }
    collFlash = 1;
  }
  function updateCollider(dt, t, w) {
    const base = w * (0.22 + pulse * 0.08);
    for (let i = 0; i < DET_CAPS - 1; i++) capS[i * 4 + 1] = base;
    capS[(DET_CAPS - 1) * 4 + 1] = w * 0.5;
    bunchT += dt;
    const u = (bunchT * 0.7) % 1;
    sph(glows, GL_BUNCH0, 0, 0, 12 - 24 * u, 0.12, w * 1.1, 4.7, 1);
    sph(glows, GL_BUNCH0 + 1, 0, 0, -12 + 24 * u, 0.12, w * 1.1, 4.7, 1);
    sph(glows, GL_VERTEX, 0, 0, 0, 0.6, w * (0.25 + bass * 0.6 + collFlash), 2.5, collFlash);
    vertexGlow = bass * 0.6 + collFlash;
    collFlash = Math.max(0, collFlash - dt * 3);
    if (evT < 0) return;
    evT += dt;
    if (evT > 4.5) {
      evT = -1;
      for (let i = CAP_TRACK0; i < CAP_NEUT0; i++) capS[i * 4 + 1] = 0;
      for (let i = GL_HIT0; i < GL_NEUT0; i++) glows.s[i * 4 + 1] = 0;
      return;
    }
    const B = 0.5 + swayS * 3.5;
    const front = TRACK_C * evT;
    const fade = (evT < 0.6 ? 1 : Math.exp(-(evT - 0.6) / 1.6)) * w;
    const L = 7.5, ds = L / TRACK_SEGS;
    for (let j = 0; j < MAX_TRACKS; j++) {
      const c0 = CAP_TRACK0 + j * TRACK_SEGS;
      if (j >= evN) {
        for (let k = 0; k < TRACK_SEGS; k++) capS[(c0 + k) * 4 + 1] = 0;
        capS[(CAP_CALO0 + j) * 4 + 1] = 0;
        for (let n = 0; n < 4; n++) glows.s[(GL_HIT0 + j * 4 + n) * 4 + 1] = 0;
        continue;
      }
      const phi = trkPhi[j], th = trkTheta[j], q = trkQ[j];
      const st = Math.sin(th), ct = Math.cos(th);
      const Rs = q === 0 ? 0 : (q * trkPt[j]) / (0.3 * B);
      let px = 0, py = 0, pz = 0, pr = 0, hits = 0, alive = true, exitS = -1;
      let ex = 0, ey = 0, ez = 0;
      for (let k = 0; k < TRACK_SEGS; k++) {
        const s1 = (k + 1) * ds;
        let x, y, z;
        if (q === 0) { x = s1 * st * Math.cos(phi); y = s1 * st * Math.sin(phi); z = s1 * ct; }
        else { const psi = (s1 * st) / Rs; x = Rs * (Math.sin(phi + psi) - Math.sin(phi)); y = -Rs * (Math.cos(phi + psi) - Math.cos(phi)); z = s1 * ct; }
        const r = Math.sqrt(x * x + y * y);
        const ci = c0 + k;
        if (!alive) { capS[ci * 4 + 1] = 0; continue; }
        const s0 = k * ds;
        const vis = s0 < front ? 1 : 0;
        const f = s1 <= front ? 1 : (front - s0) / ds;
        cap(ci, px, py, pz, px + (x - px) * f, py + (y - py) * f, pz + (z - pz) * f, 1.3, fade * vis * 0.9, trkTint[j], 0);
        for (let li = 0; li < LAYERS.length && hits < 4; li++) {
          const LR = LAYERS[li];
          if (pr < LR && r >= LR) {
            const u2 = (LR - pr) / (r - pr);
            const hs = s0 + ds * u2;
            sph(glows, GL_HIT0 + j * 4 + hits, px + (x - px) * u2, py + (y - py) * u2, pz + (z - pz) * u2, 0.09, hs < front ? fade * 0.9 : 0, 4.6, 0.5);
            hits++;
          }
        }
        px = x; py = y; pz = z; pr = r;
        if (r >= CALO_R || Math.abs(z) > 6.5) { alive = false; exitS = s1; ex = x; ey = y; ez = z; }
      }
      for (let n = hits; n < 4; n++) glows.s[(GL_HIT0 + j * 4 + n) * 4 + 1] = 0;
      if (exitS > 0 && pr >= CALO_R * 0.98) {
        const el = Math.sqrt(ex * ex + ey * ey + ez * ez);
        const dx = ex / el, dy = ey / el, dz = ez / el;
        const len = 0.5 + trkE[j] * 0.35;
        cap(CAP_CALO0 + j, dx * CALO_R, dy * CALO_R, dz * CALO_R, dx * (CALO_R + len), dy * (CALO_R + len), dz * (CALO_R + len), 4.5, front >= exitS ? fade * 0.8 : 0, 0.6, 2);
      } else {
        capS[(CAP_CALO0 + j) * 4 + 1] = 0;
      }
    }
  }

  // --- fission ------------------------------------------------------------------------------
  function exciteNucleus(n) {
    nPhase[n] = 1;
    nT[n] = 0;
    let ax = Math.random() - 0.5, ay = Math.random() - 0.5, az = Math.random() - 0.5;
    const l = Math.sqrt(ax * ax + ay * ay + az * az) + 1e-6;
    nAxis[n * 3] = ax / l; nAxis[n * 3 + 1] = ay / l; nAxis[n * 3 + 2] = az / l;
    nOff[n] = (Math.random() < 0.5 ? 1 : -1) * 0.24 * swayS;
    nHeat[n] = 0;
  }
  function fireNeutron(fx, fy, fz, target) {
    for (let i = 0; i < MAX_NEUTRONS; i++) {
      if (neutAlive[i]) continue;
      neutAlive[i] = 1;
      neutFrom[i * 3] = fx; neutFrom[i * 3 + 1] = fy; neutFrom[i * 3 + 2] = fz;
      let tx, ty, tz;
      if (target >= 0) { tx = latPos[target * 3]; ty = latPos[target * 3 + 1]; tz = latPos[target * 3 + 2]; }
      else { const l = Math.sqrt(fx * fx + fy * fy + fz * fz) + 1e-6; tx = fx + (fx / l) * 14; ty = fy + (fy / l) * 14 + 2; tz = fz + (fz / l) * 14; }
      neutTo[i * 3] = tx; neutTo[i * 3 + 1] = ty; neutTo[i * 3 + 2] = tz;
      const d = Math.sqrt((tx - fx) ** 2 + (ty - fy) ** 2 + (tz - fz) ** 2);
      neutDur[i] = Math.max(0.25, d / (8 + yieldS * 4));
      neutT[i] = 0;
      neutTarget[i] = target;
      return;
    }
  }
  function nearestIdle(x, y, z, exclude) {
    let best = -1, bd = 1e9;
    for (let n = 0; n < NUCLEI; n++) {
      if (n === exclude || nPhase[n] !== 0) continue;
      const d = (latPos[n * 3] - x) ** 2 + (latPos[n * 3 + 1] - y) ** 2 + (latPos[n * 3 + 2] - z) ** 2;
      if (d < bd) { bd = d; best = n; }
    }
    return best;
  }
  function fireFission() {
    const target = nearestIdle(0, 0, 0, -1);
    if (target < 0) return;
    const a = Math.random() * 6.2831853, e = (Math.random() - 0.5) * 1.2;
    fireNeutron(Math.cos(a) * Math.cos(e) * 9, Math.sin(e) * 9, Math.sin(a) * Math.cos(e) * 9, target);
  }
  function scission(n) {
    nPhase[n] = 2;
    nT[n] = 0;
    nHeat[n] = 1;
    const k = gNext; gNext = (gNext + 1) & 3;
    gammaU[k * 4] = latPos[n * 3] + ATOM_X; gammaU[k * 4 + 1] = latPos[n * 3 + 1] + ATOM_Y; gammaU[k * 4 + 2] = latPos[n * 3 + 2] + ATOM_Z; gammaU[k * 4 + 3] = 0.5;
    gAge[k] = 0;
    flash = Math.max(flash, 0.3);
    const count = 2 + Math.floor(yieldS * 2.5);
    for (let c = 0; c < count; c++) {
      const tgt = nearestIdle(latPos[n * 3], latPos[n * 3 + 1], latPos[n * 3 + 2], n);
      if (tgt >= 0) nPhase[tgt] = 4; // claimed: a neutron is on its way
      fireNeutron(latPos[n * 3], latPos[n * 3 + 1], latPos[n * 3 + 2], tgt);
    }
    let intact = 0;
    for (let m = 0; m < NUCLEI; m++) if (nPhase[m] === 0) intact++;
    if (intact === 0) { flash = 1; cascadeFlash = 1; }
  }
  function updateFission(dt, t, w, morphU) {
    for (let i = 0; i < MAX_NEUTRONS; i++) {
      const gi = GL_NEUT0 + i, ci = CAP_NEUT0 + i;
      if (!neutAlive[i]) { glows.s[gi * 4 + 1] = 0; capS[ci * 4 + 1] = 0; continue; }
      neutT[i] += dt / neutDur[i];
      const u = Math.min(neutT[i], 1);
      const o = i * 3;
      const x = neutFrom[o] + (neutTo[o] - neutFrom[o]) * u, y = neutFrom[o + 1] + (neutTo[o + 1] - neutFrom[o + 1]) * u, z = neutFrom[o + 2] + (neutTo[o + 2] - neutFrom[o + 2]) * u;
      const dx = neutTo[o] - neutFrom[o], dy = neutTo[o + 1] - neutFrom[o + 1], dz = neutTo[o + 2] - neutFrom[o + 2];
      const dl = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-6;
      sph(glows, gi, x + ATOM_X, y + ATOM_Y, z + ATOM_Z, 0.17, w, 4.8, 1);
      cap(ci, x - (dx / dl) * 0.9 + ATOM_X, y - (dy / dl) * 0.9 + ATOM_Y, z - (dz / dl) * 0.9 + ATOM_Z, x + ATOM_X, y + ATOM_Y, z + ATOM_Z, 2.0, w * 0.7, 4.6, 1);
      if (neutT[i] >= 1) {
        neutAlive[i] = 0;
        const tgt = neutTarget[i];
        if (tgt >= 0 && (nPhase[tgt] === 0 || nPhase[tgt] === 4)) exciteNucleus(tgt);
      }
    }
    for (let k = 0; k < 4; k++) {
      if (gAge[k] < 0) { gammaU[k * 4 + 3] = 0; WU.uGammaA.value[k] = 0; continue; }
      gAge[k] += dt;
      gammaU[k * 4 + 3] = 0.6 + gAge[k] * 9;
      WU.uGammaA.value[k] = Math.exp(-gAge[k] / 0.45) * 1.2;
      if (gAge[k] > 1.3) { gAge[k] = -1; gammaU[k * 4 + 3] = 0; }
    }
    const rad = 0.23 * (1 - 0.3 * pressS);
    const squeeze = 1 - 0.3 * pressS;
    const jitAmp = 0.035 * (1 + swayS * 1.2 + pressS * 1.5);
    const jitRate = 7 + pressS * 6;
    // the pull-back: every nucleon travels to its window, staggered a little so
    // the shell peels instead of snapping
    const solidW = 1 - smooth01((morphU - 0.12) / 0.16);
    const glowW = smooth01((morphU - 0.06) / 0.14) * (1 - smooth01((morphU - 0.74) / 0.22));
    for (let n = 0; n < NUCLEI; n++) {
      const ph = nPhase[n];
      let e = 0, sep = 0, alpha = 1, grow = 1, glow = 1;
      if (ph === 1) {
        nT[n] += dt;
        e = smooth01(nT[n] / 0.9) * (1 + 0.5 * swayS);
        glow = 1 + e;
        if (nT[n] >= 0.95) scission(n);
      } else if (ph === 2) {
        nT[n] += dt;
        sep = 0.45 + (2.5 + yieldS * 2.5) * nT[n];
        nHeat[n] = Math.exp(-nT[n] / 1.2);
        alpha = clamp((3.0 - nT[n]) / 0.8, 0, 1);
        glow = 0.2 + 2 * nHeat[n];
        if (nT[n] >= 3.0) { nPhase[n] = 3; nT[n] = 0; }
      } else if (ph === 3) {
        nT[n] += dt;
        const r = smooth01(nT[n] / 1.5);
        alpha = r; grow = 1 + 2 * (1 - r); glow = r;
        if (nT[n] >= 1.5) nPhase[n] = 0;
      }
      const cx = latPos[n * 3], cy = latPos[n * 3 + 1], cz = latPos[n * 3 + 2];
      const fog = n === 0 ? 1 : 0.78;
      const ux = nAxis[n * 3], uy = nAxis[n * 3 + 1], uz = nAxis[n * 3 + 2];
      nucU[n * 4] = cx + ATOM_X; nucU[n * 4 + 1] = cy + ATOM_Y; nucU[n * 4 + 2] = cz + ATOM_Z; nucU[n * 4 + 3] = glow * w;
      for (let i = 0; i < NUCLEONS; i++) {
        const b = i * 3;
        const idx = n * NUCLEONS + i;
        let x = nucBase[b] * squeeze * grow, y = nucBase[b + 1] * squeeze * grow, z = nucBase[b + 2] * squeeze * grow;
        const ja = jitAmp * (ph === 1 ? 1 + e : 1);
        x += ja * Math.sin(t * jitRate + nucPh[b]);
        y += ja * Math.sin(t * (jitRate + 1.3) + nucPh[b + 1]);
        z += ja * Math.sin(t * (jitRate + 2.1) + nucPh[b + 2]);
        if (ph === 1 || ph === 2) {
          const d = x * ux + y * uy + z * uz - nOff[n];
          if (ph === 1) {
            const wob = 0.12 * e * Math.sin(t * 14 + nucPh[b]);
            const stretch = e * 0.9 + wob;
            const neck = e * 0.45 * Math.exp(-d * d / 0.12);
            x += ux * d * stretch - (x - ux * (d + nOff[n])) * neck;
            y += uy * d * stretch - (y - uy * (d + nOff[n])) * neck;
            z += uz * d * stretch - (z - uz * (d + nOff[n])) * neck;
          } else {
            const side = d > 0 ? 1 : -1;
            x += ux * side * sep; y += uy * side * sep; z += uz * side * sep;
          }
        }
        let wx = cx + x + ATOM_X, wy2 = cy + y + ATOM_Y, wz = cz + z + ATOM_Z;
        let r = rad, mu = 0;
        const tint = nucType[i] ? 2.0 : 1.0;
        if (morphU > 0.001) {
          const stag = (((idx * 2654435761) >>> 8) & 255) / 255;
          mu = smooth01((morphU - 0.20 - stag * 0.06) / 0.42);
          wx += (winTarget[idx * 3] - wx) * mu;
          wy2 += (winTarget[idx * 3 + 1] - wy2) * mu;
          wz += (winTarget[idx * 3 + 2] - wz) * mu;
          r = rad + (0.9 - rad) * mu;
        }
        // The colour the point arrives holding is the shader's own window
        // expression at that pane's colour temperature, warm is palette 1
        // pulled 30 % to palette 0, cool is palette 2 lifted 30 % toward white
        //, and not a ramp coordinate walking 0 -> 1 -> 2. The two only agree at
        // the warm end; at the cool end the ramp handed back raw palette 2 where
        // the city lifts it, and the constellation resolved in a colour family
        // the windows under it do not use. That is the whole of the hand-off
        // this move exists to hide.
        const ct = winCt[idx];
        const cr = winWarm[0] + (winCool[0] - winWarm[0]) * ct;
        const cg = winWarm[1] + (winCool[1] - winWarm[1]) * ct;
        const cb = winWarm[2] + (winCool[2] - winWarm[2]) * ct;
        const qs = idx * 4, qg = (GL_WIN0 + idx) * 4;
        solids.c[qs] = cr; solids.c[qs + 1] = cg; solids.c[qs + 2] = cb; solids.c[qs + 3] = mu;
        glows.c[qg] = cr; glows.c[qg + 1] = cg; glows.c[qg + 2] = cb; glows.c[qg + 3] = mu;
        sph(solids, idx, wx, wy2, wz, r, alpha * fog * w * solidW, tint, nHeat[n]);
        sph(glows, GL_WIN0 + idx, wx, wy2, wz, r * 1.15, glowW * alpha * 1.0, tint, 0.35);
      }
    }
  }

  // --- the clouds ---------------------------------------------------------------------------
  // One law for every front: the radius the eye sees as a shell and the radius
  // that leaves the grid dark behind it are the same number.
  const ringR = (age, sc) => Math.min(sc * 45, sc * 9 * Math.pow(Math.max(age, 0), 0.7));
  const capHeightJS = (a, m, q, sc, tau) => sc * (1.5 + 9 * (1 - Math.exp(-a / tau))) * (1 + 0.35 * m) * (1 - 0.25 * q);
  const CLOUD_TAIL = 3.5; // seconds a cloud takes to thin out of the deck
  // Which slot a new burst takes. An empty one first; failing that the slot
  // furthest through its own life, NOT the one launched first, the deck runs
  // clouds of wildly different lifetimes side by side, and evicting by launch
  // order deletes a one-second-old fireball at its brightest while a minute-old
  // ash column stands next to it.
  function allocCloud() {
    for (let i = 1; i < MAX_CLOUDS; i++) if (cAge[i] < 0) return i;
    let worn = 1, bs = -1, bseq = 1e18;
    for (let i = 1; i < MAX_CLOUDS; i++) {
      const s = cAge[i] / Math.max(cLife[i], 0.001);
      if (s > bs || (s === bs && cSeq[i] < bseq)) { bs = s; bseq = cSeq[i]; worn = i; }
    }
    return worn;
  }
  function burst(slot, x, z, yf, vel) {
    const sc = CLOUD_U * yf * (0.55 + yieldTarget * 0.9) * cloudScaleP * (0.78 + vel * 0.35);
    cAge[slot] = 0;
    cLife[slot] = 8 + 58 * yf;
    cSeq[slot] = cSeqNext++;
    cX[slot] = x;
    cZ[slot] = z;
    cSc[slot] = Math.max(3, sc);
    cTau[slot] = 1.6 + 8 * yf;            // rise time: the big ones take ten seconds
    cFireS[slot] = 0.8 + yf * 1.4;
    cFade[slot] = 1;
    const dx = camPos.x - x, dz = camPos.z - z;
    const d = Math.sqrt(dx * dx + dz * dz + camPos.y * camPos.y);
    // what the burst leaves: a crater in the wreck, fires in its wake, debris on
    // its front, and a little more ash in the sky
    addDamage(x, z, cSc[slot] * 10, 0.45 + 0.55 * yf, cSc[slot] * 1.8);
    igniteFrom(x, z, cSc[slot]);
    seedDebris(slot, x, z, cSc[slot], 0.45 * clamp(900 / (300 + d), 0, 1));
    placeRest(x, z, cSc[slot]);
    // the blast wind at the eye is this burst's radial
    { const l = Math.sqrt(dx * dx + dz * dz) || 1; bwX = dx / l; bwZ = dz / l; bwGust = 1; }
    wreck = Math.min(1, wreck + 0.10 + 0.28 * yf);
    flash = Math.max(flash, clamp((sc * 26) / (110 + d), 0, 0.94));
    emberA = Math.max(emberA, clamp(0.35 + yf * 0.8, 0, 1) * clamp(700 / (200 + d), 0, 1));
    for (let i = 0; i < EMBERS; i++) {
      if (Math.random() > 0.35) continue;
      embX[i] = x + (Math.random() - 0.5) * sc * 5;
      embZ[i] = z + (Math.random() - 0.5) * sc * 5;
      embY[i] = Math.random() * sc * 3;
      embV[i] = 2 + Math.random() * 8;
    }
  }
  // ---- what the city and the deck hide -------------------------------------
  // The world quad writes no depth (it is a fullscreen analytic image, not a
  // surface), so nothing it draws can occlude the impostor meshes on its own,
  // and a vehicle diving at a target twenty-eight blocks away was painted flat
  // across the face of the tower in front of it. So the CPU asks the question
  // the depth buffer cannot: it runs the DDA's own lot grid from the eye to the
  // point and tests the same masses `lotOf` builds, then the same cap and stem
  // bounds the cloud march uses. One query per vehicle body and four along each
  // trail is nothing (sixteen vehicles at twenty lots apiece) and the answer
  // drives alpha, so a body passing behind a cornice fades instead of popping.
  const visRec = { fam: 0, k: 0, cx: 0, cz: 0, top: 0, b: new Float64Array(12), off: new Float64Array(6), r: [0, 0, 0, 0], r2: [0, 0, 0, 0] };
  function visibleFrom(px, py, pz) {
    const ox = camPos.x, oy = camPos.y, oz = camPos.z;
    let dx = px - ox, dy = py - oy, dz = pz - oz;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (len < 1e-3) return 1;
    dx /= len; dy /= len; dz /= len;
    // the clouds first: they are few and the test is analytic
    for (let i = 0; i < MAX_CLOUDS; i++) {
      if (cAge[i] < 0 || cFade[i] < 0.05) continue;
      const cx = cX[i], cz = cZ[i], cy = cYc[i];
      const R = cSc[i] * 3.4;
      const wx = cx - ox, wy = cy - oy, wz = cz - oz;
      const b = wx * dx + wy * dy + wz * dz;
      if (b <= 0 || b >= len) continue;
      const perp = wx * wx + wy * wy + wz * wz - b * b;
      if (perp < R * R) return 0;
    }
    // then the block grid, one lot at a time along the ray
    let gx = ox / CELL + 0.5, gz = oz / CELL + 0.5;
    const rgx = dx / CELL, rgz = dz / CELL;
    let cx = Math.floor(gx), cz = Math.floor(gz);
    const sx = rgx >= 0 ? 1 : -1, sz = rgz >= 0 ? 1 : -1;
    const dlx = Math.abs(1 / (Math.abs(rgx) < 1e-7 ? 1e-7 : rgx));
    const dlz = Math.abs(1 / (Math.abs(rgz) < 1e-7 ? 1e-7 : rgz));
    let nx = ((cx + (sx > 0 ? 1 : 0)) - gx) / (Math.abs(rgx) < 1e-7 ? 1e-7 * sx : rgx);
    let nz = ((cz + (sz > 0 ? 1 : 0)) - gz) / (Math.abs(rgz) < 1e-7 ? 1e-7 * sz : rgz);
    let t0 = 0;
    for (let step = 0; step < 96; step++) {
      const t1 = Math.min(Math.min(nx, nz), len);
      if (!lotStreetJS(cx, cz)) {
        const ya = oy + dy * t0, yb = oy + dy * t1;
        const ylo = ya < yb ? ya : yb;
        if (ylo < H_MAX) {
          const L = lotOfJS(cx, cz, citySeed, visRec, dmg);
          if (ylo < L.top) {
            const yhi = ya < yb ? yb : ya;
            for (let m = 0; m < 3; m++) {
              const bx = L.b[m * 4];
              if (bx < 0.05 || L.b[m * 4 + 3] < ylo || L.b[m * 4 + 2] > yhi) continue;
              const ccx = L.cx + L.off[m * 2], ccz = L.cz + L.off[m * 2 + 1];
              const bzz = L.b[m * 4 + 1], b2 = L.b[m * 4 + 2], b3 = L.b[m * 4 + 3];
              // the slab test the shader runs, on the segment's own range,
              // written out three times rather than through a closure so the
              // frame allocates nothing
              let tn = t0, tf = t1, a, b, q;
              if (Math.abs(dx) < 1e-7) { if (ox < ccx - bx || ox > ccx + bx) tf = tn - 1; }
              else { a = (ccx - bx - ox) / dx; b = (ccx + bx - ox) / dx; if (a > b) { q = a; a = b; b = q; } if (a > tn) tn = a; if (b < tf) tf = b; }
              if (Math.abs(dy) < 1e-7) { if (oy < b2 || oy > b3) tf = tn - 1; }
              else { a = (b2 - oy) / dy; b = (b3 - oy) / dy; if (a > b) { q = a; a = b; b = q; } if (a > tn) tn = a; if (b < tf) tf = b; }
              if (Math.abs(dz) < 1e-7) { if (oz < ccz - bzz || oz > ccz + bzz) tf = tn - 1; }
              else { a = (ccz - bzz - oz) / dz; b = (ccz + bzz - oz) / dz; if (a > b) { q = a; a = b; b = q; } if (a > tn) tn = a; if (b < tf) tf = b; }
              if (tf > tn) return 0;
            }
          }
        }
      }
      if (t1 >= len) break;
      if (nx < nz) { nx += dlx; cx += sx; } else { nz += dlz; cz += sz; }
      t0 = t1;
    }
    return 1;
  }
  function launchRV(idx, vel) {
    let slot = -1;
    for (let i = 0; i < MAX_RV; i++) if (!rvAlive[i]) { slot = i; break; }
    if (slot < 0) { slot = 0; let bt = -1; for (let i = 0; i < MAX_RV; i++) if (rvT[i] > bt) { bt = rvT[i]; slot = i; } }
    const yf = padYf[idx];
    rvAlive[slot] = 1;
    rvT[slot] = 0;
    // The flight is a STREAK, not a glide: 0.14 to 0.24 s from the top of the sky
    // to the ground, so the burst lands on the hit that launched it. A body
    // coming in at re-entry speed (eight or nine kilometres a second) crosses
    // this whole sky in under a second; what the eye keeps is the light.
    rvDur[slot] = 0.14 + 0.10 * yf;
    rvFade[slot] = 0;
    rvYf[slot] = yf;
    rvSc[slot] = clamp(vel, 0.2, 1);
    for (let k = 0; k < RV_VIS; k++) rvVis[slot * RV_VIS + k] = 1; // released above the skyline
    const tx = padX[idx], tz = padZ[idx];
    rvTG[slot * 3] = tx; rvTG[slot * 3 + 1] = 0; rvTG[slot * 3 + 2] = tz;
    // The track comes down STEEPLY from high altitude, the way a meteor does,
    // from far out beyond the target on the side away from the eye, so the
    // streak crosses the sky toward the viewer and lands in front of, beside
    // or behind them. Barely an arc: the control point lifts the midpoint a
    // little so the line reads as ballistic and not ruled. Each cell carries a
    // fixed lateral fan of its own, so a chord arrives as a spread.
    // The approach is LATERAL to the line of sight, the streak comes in from
    // the side (alternating by pad), a little from beyond, and crosses the sky
    // diagonally to its target. A track laid along the bearing from the eye
    // was tried first and read as a dot with a tail: seen end-on, a kilometre
    // of streak foreshortens to nothing. Meteors read long because they cross.
    const fan = ((idx & 7) - 3.5) * 40;
    const bx = Math.sin(padAz[idx]), bz = -Math.cos(padAz[idx]);   // eye -> target bearing
    const side = idx & 1 ? 1 : -1;
    const px = Math.cos(padAz[idx]) * side, pz = Math.sin(padAz[idx]) * side; // across it
    const ox = px * 0.85 + bx * 0.35, oz = pz * 0.85 + bz * 0.35;
    rvP0[slot * 3] = tx + ox * RV_OUT + fan; rvP0[slot * 3 + 1] = RV_ALT; rvP0[slot * 3 + 2] = tz + oz * RV_OUT;
    rvCP[slot * 3] = tx + ox * RV_OUT * 0.5 + fan * 0.5; rvCP[slot * 3 + 1] = RV_ALT * 0.56; rvCP[slot * 3 + 2] = tz + oz * RV_OUT * 0.5;
  }
  function updateRVs(dt) {
    for (let i = 0; i < MAX_RV; i++) {
      const g0 = GL_RV0 + i * 2, c0 = CAP_RV0 + i * TRAIL_SEGS;
      if (!rvAlive[i]) {
        glows.s[g0 * 4 + 1] = 0; glows.s[(g0 + 1) * 4 + 1] = 0;
        for (let k = 0; k < TRAIL_SEGS; k++) capS[(c0 + k) * 4 + 1] = 0;
        continue;
      }
      let u;
      let live = true;
      if (rvT[i] < rvDur[i]) {
        rvT[i] += dt;
        const s = clamp(rvT[i] / rvDur[i], 0, 1);
        u = s; // constant speed, nothing this fast slows visibly in a quarter of a second
        if (rvT[i] >= rvDur[i]) {
          const slot = allocCloud();
          burst(slot, rvTG[i * 3], rvTG[i * 3 + 2], rvYf[i], rvSc[i]);
          rvFade[i] = 0.001;
        }
      } else {
        u = 1;
        live = false;
        rvFade[i] += dt;
        if (rvFade[i] > 0.45) {
          rvAlive[i] = 0;
          glows.s[g0 * 4 + 1] = 0; glows.s[(g0 + 1) * 4 + 1] = 0;
          for (let k = 0; k < TRAIL_SEGS; k++) capS[(c0 + k) * 4 + 1] = 0;
          continue;
        }
      }
      const heat = smooth01((u - 0.04) / 0.25);
      const dies = live ? 1 : Math.max(0, 1 - rvFade[i] / 0.45); // the afterimage is gone in under half a second
      bez(i, u, pv);
      // Four stations along the track carry the visibility for the whole
      // vehicle: the body takes the head's, and the trail interpolates between
      // them. Each is eased rather than switched, so a body crossing a cornice
      // dims through it instead of blinking.
      for (let k = 0; k < RV_VIS; k++) {
        const uv = Math.max(0, u - (k / (RV_VIS - 1)) * STREAK_SPAN);
        bez(i, uv, pv2);
        const vi = i * RV_VIS + k;
        rvVis[vi] = approach(rvVis[vi], visibleFrom(pv2[0], pv2[1], pv2[2]), 0.06, dt);
      }
      const body = (live ? 1 : 0) * rvVis[i * RV_VIS];
      // The body inside its plasma sheath. A vehicle released fifteen hundred
      // metres downrange is a two-metre object two kilometres off, under a
      // pixel, which is to say invisible for the first half of the flight. It
      // is an unresolved point source, so it is sized in ANGLE and not in
      // metres: a hard bright point from release that swells and brightens as
      // the air thickens, and the sheath around it likewise.
      const dcx = pv[0] - camPos.x, dcy = pv[1] - camPos.y, dcz = pv[2] - camPos.z;
      const dCam = Math.sqrt(dcx * dcx + dcy * dcy + dcz * dcz);
      // The head: a hard white point and a tight violet-white halo, the thing
      // itself is never resolved at this speed, only its light.
      sph(glows, g0, pv[0], pv[1], pv[2], dCam * (0.0022 + 0.0012 * heat), body * (1.8 + heat * 1.8), 4.97, 1);
      sph(glows, g0 + 1, pv[0], pv[1], pv[2], dCam * (0.0050 + 0.0040 * heat), body * (0.12 + heat * 0.22), 0.12, 1);
      // The streak behind it covers a fixed fraction of the track, whatever the
      // flight time: a meteor's trail is the ionised air it has just crossed,
      // bright and thin at the head, thinning to nothing along its length, no
      // puffs, no smoke, no contrail, which is the signature of a slow object.
      const step = STREAK_SPAN / TRAIL_SEGS;
      for (let k = 0; k < TRAIL_SEGS; k++) {
        const uA = u - k * step, uB = u - (k + 1) * step;
        if (uB < 0) { capS[(c0 + k) * 4 + 1] = 0; continue; }
        bez(i, uA, pv);
        bez(i, uB, pv2);
        const f = k / TRAIL_SEGS;
        const nz = rvNoise[i * TRAIL_SEGS + k];
        // the visibility of this stretch, read off the four stations
        const fv = (k / Math.max(1, TRAIL_SEGS - 1)) * (RV_VIS - 1);
        const fi = Math.min(RV_VIS - 2, fv | 0), ff = fv - fi;
        const vis = rvVis[i * RV_VIS + fi] + (rvVis[i * RV_VIS + fi + 1] - rvVis[i * RV_VIS + fi]) * ff;
        // the light streak: sized in ANGLE like the head, white-hot at the head
        // and fading down its length; the per-segment noise is only a flicker
        const mx = (pv[0] + pv2[0]) * 0.5 - camPos.x, my = (pv[1] + pv2[1]) * 0.5 - camPos.y, mz = (pv[2] + pv2[2]) * 0.5 - camPos.z;
        const dSeg = Math.sqrt(mx * mx + my * my + mz * mz);
        // the capsule radius is in PIXELS (the mesh is screen-space): a few at
        // the head tapering to a hairline, and bright, the streak is the event
        const a = Math.pow(1 - f, 1.25) * (1.6 + heat * 1.4) * (0.85 + nz * 0.3) * dies * vis;
        cap(c0 + k, pv[0], pv[1], pv[2], pv2[0], pv2[1], pv2[2],
          1.0 + 4.5 * (1 - f) * (0.7 + heat * 0.5), a, 0.02 + f * 0.30, 1);
        void dSeg;
      }
    }
  }
  function updateClouds(dt, t) {
    for (let i = 0; i < MAX_CLOUDS; i++) {
      if (cAge[i] < 0) continue;
      cAge[i] += dt;
      if (i > 0 && cAge[i] > cLife[i]) { cAge[i] = -1; continue; }
      if (i === 0) cAge[i] = Math.min(cAge[i], 90);
    }
    // ground zero always stands; the yield knob keeps sizing it
    cX[0] = GZ_X;
    cZ[0] = GZ_Z;
    cSc[0] = Math.max(6, CLOUD_U * GZ_SCALE * (0.55 + yieldTarget * 0.9) * cloudScaleP);
    cTau[0] = 10.5;
    cFireS[0] = 1.6;
    // Everything the fragment shader needs about a cloud that does not depend
    // on the pixel, the front's radius, the fireball's brightness and its
    // light, the cap's height and radius, the stem, the carve depth, the flow
    // of the noise domain, computed here once, and packed so the shader's
    // loops run over the standing clouds and no further.
    const m = swayS, q = pressS;
    // THE DECK STANDS DOWN FOR THE PULL-BACK. The atom -> city move is the only
    // time the eye flies THROUGH the block the near row of the deck lands on,
    // it starts three hundred and forty-nine metres out from the atom and ends
    // five hundred and twenty back, and the near row stands between the two, so
    // for a second in the middle of it every pixel in the lower half of the
    // frame is inside a cloud, three hundred metres of bound deep. A column the
    // eye is standing inside is not readable at any step count and costs eleven
    // milliseconds a frame to say so. The move already carries the fission
    // lattice and the city at once; it does not also carry the deck. So the
    // MIRV clouds thin out the moment the move starts, stay out for as long as
    // it is running (a scrub parked mid-move is still mid-move) and stand
    // again over the second after it lands, ageing all the way through. Ground
    // zero, five hundred metres beyond where the move ends, never leaves.
    const deckW = deckStand;
    let n = 0;
    for (let i = 0; i < MAX_CLOUDS; i++) {
      const age = cAge[i];
      if (age < 0) { cFade[i] = 0; continue; }
      const sc = cSc[i], tau = cTau[i], fs = cFireS[i];
      // a cloud thins out of the deck over its last few seconds; it does not
      // wink out of the frame when its life runs out
      const fade = i === 0 ? 1 : clamp((cLife[i] - age) / CLOUD_TAIL, 0, 1) * deckW;
      cFade[i] = fade;
      if (fade < 0.02) continue;
      const s = smooth01((age - 0.084 * tau) / (2.116 * tau));
      const yc = capHeightJS(age, m, q, sc, tau);
      const fire = Math.exp(-age / (1.4 + 0.09 * sc));
      const fireAmp = fs * 3.2 * fire;
      const rate = clamp(16 / sc, 0.22, 1.7);
      cYc[i] = yc;
      const o = n * 4;
      cloudA[o] = cX[i]; cloudA[o + 1] = cZ[i]; cloudA[o + 2] = age; cloudA[o + 3] = sc;
      cloudB[o] = ringR(age, sc);
      cloudB[o + 1] = t * 0.9 * sc * rate;                       // the stem's updraft
      cloudB[o + 2] = (3.5 * Math.exp(-age / ((1.4 + 0.09 * sc) * 1.1)) + 0.35 * Math.exp(-age / (tau * 2))) * fs * fade;
      cloudB[o + 3] = fireAmp;
      cloudC[o] = yc;
      cloudC[o + 1] = (fireAmp + 0.22 * Math.exp(-age / (tau * 2)) * fs) * 0.55 * fade;
      cloudC[o + 2] = fade;
      cloudC[o + 3] = s;
      cloudD[o] = sc * (1.6 + 2.8 * s) * (1 - 0.3 * m) * (1 + 0.35 * q);
      cloudD[o + 1] = sc * (1.4 + 0.8 * s) * (1 - 0.35 * q);
      cloudD[o + 2] = sc * (0.62 + 0.85 * s) * (1 - 0.2 * m);
      cloudD[o + 3] = sc * (0.85 + 0.9 * m);
      cloudE[o] = sc * (1.6 + 1.6 * s);
      cloudE[o + 1] = fire;
      cloudE[o + 2] = Math.exp(-age / (tau * 2.6));
      cloudE[o + 3] = t * (0.30 + 0.5 * m) * rate;               // the cap's overturn
      n++;
    }
    WU.uNCloud.value = n;
  }

  // --- ground zero's front ------------------------------------------------------------------
  function detonate() {
    if (cAge[0] < 0) cAge[0] = 0;
    cAge[0] = 0;
    cSeq[0] = cSeqNext++;
    blastAge = 0;
    passAge = -1;
    flash = 1;
    emberA = 1;
    addDamage(GZ_X, GZ_Z, cSc[0] * 10, 1, cSc[0] * 1.8);
    igniteFrom(GZ_X, GZ_Z, cSc[0]);
    seedDebris(-2, GZ_X, GZ_Z, cSc[0], 0.75);
    placeRest(GZ_X, GZ_Z, cSc[0]);
    { const dx = camPos.x - GZ_X, dz = camPos.z - GZ_Z; const l = Math.sqrt(dx * dx + dz * dz) || 1; bwX = dx / l; bwZ = dz / l; bwGust = 1; }
    wreck = Math.min(1, wreck + 0.35);
    for (let i = 0; i < EMBERS; i++) {
      embX[i] = camPos.x + (Math.random() - 0.5) * 120;
      embZ[i] = camPos.z - Math.random() * 260;
      embY[i] = 6 + Math.random() * 70;
      embV[i] = 2 + Math.random() * 9;
    }
  }
  function updateShockwave(dt, t, w) {
    const sc0 = cSc[0];
    let rs = 0, fire = 0;
    if (blastAge >= 0) {
      blastAge += dt;
      rs = ringR(blastAge, sc0);
      fire = 3 * Math.exp(-blastAge / 2) + 0.3 * Math.exp(-blastAge / 10);
      const dCam = Math.sqrt((camPos.x - GZ_X) ** 2 + camPos.y * camPos.y + (camPos.z - GZ_Z) ** 2);
      if (passAge < 0 && rs >= dCam) { passAge = blastAge; shake = 1; emberA = 1; }
      if (blastAge > 12) { blastAge = -1; passAge = -1; }
    }
    gzRs = rs;
    const sincePass = passAge >= 0 && blastAge >= 0 ? blastAge - passAge : -1;
    const veiling = sincePass >= 0 && sincePass < 2.5;
    veil = approach(veil, veiling ? w : 0, veiling ? 0.25 : 0.8, dt);
    shake = Math.max(0, shake - dt * 1.4);
    if (blastAge < 0 || blastAge > 9) emberA = approach(emberA, 0, 1.4, dt);
    WU.uBlastAge.value = blastAge;
    WU.uBlastR.value = rs;
    WU.uBlastMorph.value = swayS;
    WU.uBlastFire.value = fire;
    WU.uVeil.value = veil;
    WU.uDustH.value = sc0 * (0.7 + 1.5 * swayS) + 20;
  }

  // --- the lamps and the embers ---------------------------------------------------------------
  function updateStreet(dt, t, w) {
    for (let k = 0; k < LAMPS; k++) {
      const lz = LAMP_Z0 - LAMP_DZ * k;
      for (let s = 0; s < 2; s++) {
        const lx = s ? LAMP_X : -LAMP_X;
        const i = k * 2 + s;
        // the front knocks the posts over, ground zero's own as it passes
        // (most of them), or any burst's heavy radius, and they stay down
        const dgx = lx - GZ_X, dgz = lz - GZ_Z;
        const hit = (blastAge >= 0 && gzRs * gzRs >= dgx * dgx + dgz * dgz && hf(i * 977 + 13) < 0.75) || damageAtJS(dmg, lx, lz) > 0.35;
        if (hit && lampFall[i] < 1) lampFall[i] = Math.min(1, lampFall[i] + dt * 2.2);
        const th = smooth01(lampFall[i]) * (0.95 + hf(i * 31 + 7) * 0.55);
        const dirx = (hf(i * 53 + 3) - 0.5) * 1.4;                 // away from ground zero, a little sideways
        const dl = Math.sqrt(dirx * dirx + 1);
        const st = Math.sin(th), ct = Math.cos(th);
        // the post stands in the sun or in a tower's shadow like everything else on the pavement
        cap(CAP_LAMP0 + i, lx, 0, lz, lx + (st * LAMP_H * dirx) / dl, LAMP_H * ct, lz + (st * LAMP_H) / dl, 1.6, w * 0.34 * (0.45 + 0.55 * lampSun[i]), 4.0, 0);
      }
    }
    // the embers stream along the blast wind, carried horizontally with the
    // front, faster than they fall; none of them floats, and are re-seeded
    // upwind of the eye so the stream keeps crossing it
    const wsp = (0.5 + bwGust) * dt;
    for (let i = 0; i < EMBERS; i++) {
      if (emberA > 0.01) {
        const spd = 16 + embV[i] * 2.2;
        embX[i] += bwX * spd * wsp; embZ[i] += bwZ * spd * wsp;
        embY[i] -= (1.5 + embV[i] * 0.35) * dt;
        const rx = embX[i] - camPos.x, rz = embZ[i] - camPos.z;
        if (embY[i] < 0 || rx * rx + rz * rz > 300 * 300 || rx * bwX + rz * bwZ > 120) {
          const back = 30 + Math.random() * 220, side = (Math.random() - 0.5) * 180;
          embX[i] = camPos.x - bwX * back - bwZ * side; embZ[i] = camPos.z - bwZ * back + bwX * side;
          embY[i] = 3 + Math.random() * 55;
        }
      }
      sph(glows, GL_EMBER0 + i, embX[i], embY[i], embZ[i], 0.5 + 0.4 * (i % 3), emberA * (0.4 + 0.5 * Math.sin(t * 6 + i)), 0.45, 0.8);
    }
  }

  const bloom = { strength: 0.45, radius: 0.45, threshold: 0.55 };
  // scratch colours for the boxes' light (the city's own numbers, on the CPU)
  const cA = new THREE.Color(), cB = new THREE.Color(), cC = new THREE.Color();
  const grey3 = (c, k) => { const l = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b; c.r += (l - c.r) * k; c.g += (l - c.g) * k; c.b += (l - c.b) * k; return c; };
  let warmFrames = 0;   // the boxes' first two frames draw a pinhead at zero alpha in front of the eye, so the program's first use is cheap and off screen

  function setAct(next) {
    next = clamp(next | 0, 0, ACTS - 1);
    if (next === act) return;
    const pair = (act === 1 && next === 2) || (act === 2 && next === 1);
    act = next;
    transitTarget = act >= 2 ? 1 : 0;
    if (!pair) transit = transitTarget;
  }
  function padEvent(idx, vel) {
    if (act === 0) fireCollision();
    else if (act === 1) fireFission();
    else if (pressS >= 0.8) detonate();
    else launchRV(idx, vel);
  }

  return {
    scene,
    camera,
    bloom,
    action(key) {
      if (key === 'collide') fireCollision();
      else if (key === 'split') fireFission();
      else if (key === 'detonate') detonate();
      else if (key === 'blast') { blastAge = 0; passAge = -1; flash = Math.max(flash, 0.55); }
      else if (key === 'strike') launchRV(clamp(Math.round(placeP), 0, 15), 1);
      // A salvo fills the deck and no more. Firing eight into five slots evicted
      // three of its own bursts at their brightest, half a second after they
      // landed, so the salvo is exactly as long as the deck is deep, spread
      // across the pad map so it reads as a bus's payload and not a cluster.
      else if (key === 'salvo') { salvoLeft = MAX_CLOUDS - 1; salvoT = 0; salvoIdx = 0; }
      else if (key === 'lightning') fireLightning();
      // the launch map: one toggles the globe, the other plays the scenario
      // (and raises the globe first, so a pad bound only to `all launched`
      // still shows what it is doing)
      else if (key === 'launchMap') { mapOn = !mapOn; launchMap.show(mapOn); }
      else if (key === 'launchAll') { if (!mapOn) { mapOn = true; launchMap.show(true); } launchMap.launchAll(); }
      // a new city, whole: the craters, the fires, the fallen lamps and the ash dusk go with the old one
      else if (key === 'rebuild') {
        citySeed = 1 + ((Math.random() * 900) | 0); WU.uCitySeed.value = citySeed;
        dmg.n = 0; WU.uNDmg.value = 0; WU.uNEtch.value = 0; fireT0.fill(-1); lampFall.fill(0); wreck = 0;
        // the rubble, the chunks, the wrecked cars and the etched shadows go with the old city
        rsOn.fill(0); dbState.fill(0); debrisLive = 0;
        parkCars(citySeed); traceLamps();
        gatherWindows(citySeed); winDirty = false;
      }
    },
    setParam(key, value) {
      if (key === 'act') setAct(Math.round(value));
      else if (key === 'yield') yieldTarget = clamp(value, 0, 1);
      else if (key === 'transition') { transit = clamp(value, 0, 1); transitTarget = transit; }
      else if (key === 'cloudScale') cloudScaleP = clamp(value, 0.2, 3);
      else if (key === 'place') placeP = clamp(value, 0, 15);
      else if (key === 'shadowContrast') shadowContrastP = clamp(value, 0, 1);
    },
    update(dt, t, io) {
      tNow = t;
      // ---- the cold open: held dark until the first beat, the transport, or a pad
      if (!opened) {
        const tp = io.transport || null;
        const tpNow = !!(tp && tp.playing);
        const beat = io.beat > 0.6 && io.level > 0.12;
        if ((tpNow && !tpPrev) || beat || io.strike > 0.12) {
          opened = true;
          openAge = 0;
          fireCollision();
        }
        tpPrev = tpNow;
      } else {
        openAge += dt;
      }
      openS = approach(openS, opened ? 1 : 0, 0.45, dt);
      // dark, not dead: a faint detector breathing with the level until it opens
      const openDim = Math.max(openS, 0.07 + 0.05 * io.level);

      // ---- KNOB 6 picks the act the moment it moves; KNOB 5 the yield
      const k6 = io.knobs[5];
      if (k6Prev === null) k6Prev = k6;
      if (Math.abs(k6 - k6Prev) > 0.004) setAct(Math.min(3, Math.floor(k6 * 4)));
      k6Prev = k6;
      const k5 = io.knobs[4];
      if (k5Prev === null) k5Prev = k5;
      if (Math.abs(k5 - k5Prev) > 0.004) yieldTarget = k5;
      k5Prev = k5;

      // ---- the pull-back: linear in time so it always completes
      if (transit !== transitTarget) {
        const step = dt / TRANSIT_T;
        transit = transitTarget > transit ? Math.min(transitTarget, transit + step) : Math.max(transitTarget, transit - step);
      }
      const transiting = (act === 1 || act === 2) && transit > 0.002 && transit < 0.998;
      if (transiting) {
        actW[0] = approach(actW[0], 0, ACT_FADE / 3, dt);
        actW[3] = approach(actW[3], 0, ACT_FADE / 3, dt);
        actW[1] = 1 - smooth01((transit - 0.52) / 0.46);
        actW[2] = smooth01((transit - 0.10) / 0.36);
      } else {
        for (let i = 0; i < ACTS; i++) actW[i] = approach(actW[i], i === act ? 1 : 0, ACT_FADE / 3, dt);
      }
      WU.uCityFade.value = clamp(actW[2] + actW[3], 0, 1);
      WU.uWinFade.value = transiting ? smooth01((transit - 0.62) / 0.30) : (act >= 2 ? 1 : 0);
      // the deck leaves fast when the move starts and comes back over the
      // second after it lands (updateClouds says why)
      deckStand = approach(deckStand, transiting ? 0 : 1, transiting ? 0.09 : 0.30, dt);
      // a pull-back starting over a wrecked city matches the nucleons against
      // the panes the wreck left lit, gathered again only when the wreck changed
      if (transiting && !wasTransiting && winDirty) { gatherWindows(citySeed); winDirty = false; }
      wasTransiting = transiting;

      yieldS = approach(yieldS, yieldTarget, 0.3, dt);
      swayS = approach(swayS, io.gestures.sway, 0.4, dt);
      pressS = approach(pressS, io.gestures.press, 0.15, dt);
      hx = approach(hx, io.xy.x, 0.3, dt);
      hy = approach(hy, io.xy.y, 0.3, dt);
      bass = approach(bass, io.bands.bass, 0.12, dt);
      high = approach(high, io.bands.high, 0.1, dt);
      if (io.beat > beatPrev + 0.3) pulse = 1;
      beatPrev = io.beat;
      pulse = Math.max(0, pulse - dt * 3.5);

      // ---- every pad is its own event; the rising edge is the strike
      for (let i = 0; i < 16; i++) {
        const v = io.pads[i];
        if (v > padPrev[i] + 0.25 && v > 0.12 && openAge > 0.1) padEvent(i, v);
        padPrev[i] = v;
      }
      if (salvoLeft > 0) {
        salvoT -= dt;
        if (salvoT <= 0) { launchRV(salvoIdx, 1); salvoIdx = (salvoIdx + SALVO_STEP) % 16; salvoLeft--; salvoT = 0.07; }
      }
      flash = Math.max(0, flash - dt * 2.2);
      cascadeFlash = Math.max(0, cascadeFlash - dt * 4.0);

      // ---- the eye
      const camTau = transiting ? 0.09 : 0.35;
      if (act === 0) {
        const dist0 = 9 - pressS * 4.5;
        const az = (hx - 0.5) * 2.4, el = 0.15 + (hy - 0.5) * 0.9;
        wantPos.set(Math.sin(az) * Math.cos(el) * dist0, Math.sin(el) * dist0, Math.cos(az) * Math.cos(el) * dist0);
        wantTarget.set(0, 0, 0);
      } else if (act === 3) {
        wantPos.set((hx - 0.5) * 16, 1.8 + (hy - 0.5) * 2.4 - pressS * 1.1, 40);
        wantTarget.set(wantPos.x * 0.3, 7 - pressS * 4, -420);
      } else {
        // one straight line out of the nucleus: the direction blends to the
        // city axis early, then the whole move is a dolly on a log schedule
        const az = (hx - 0.5) * 2.4, el = 0.15 + (hy - 0.5) * 0.9;
        let dx = Math.sin(az) * Math.cos(el), dy = Math.sin(el), dz = Math.cos(az) * Math.cos(el);
        const b = smooth01(transit / 0.26);
        dx += (TDX - dx) * b; dy += (TDY - dy) * b; dz += (TDZ - dz) * b;
        const dl = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-6;
        dx /= dl; dy /= dl; dz /= dl;
        const dist0 = Math.exp(Math.log(ATOM_DIST) + (Math.log(CITY_DIST) - Math.log(ATOM_DIST)) * transit);
        const hw = smooth01((transit - 0.7) / 0.3);
        wantPos.set(
          ATOM_X + dx * dist0 + (hx - 0.5) * 140 * hw,
          ATOM_Y + dy * dist0 + ((hy - 0.5) * 64 + 24) * hw,
          ATOM_Z + dz * dist0,
        );
        wantTarget.set(ATOM_X - TDX * 400 * transit, ATOM_Y - TDY * 400 * transit, ATOM_Z - TDZ * 400 * transit);
      }
      camPos.x = approach(camPos.x, wantPos.x, camTau, dt);
      camPos.y = approach(camPos.y, wantPos.y, camTau, dt);
      camPos.z = approach(camPos.z, wantPos.z, camTau, dt);
      camTarget.x = approach(camTarget.x, wantTarget.x, camTau, dt);
      camTarget.y = approach(camTarget.y, wantTarget.y, camTau, dt);
      camTarget.z = approach(camTarget.z, wantTarget.z, camTau, dt);
      camera.position.copy(camPos);
      if (shake > 0) {
        const s = shake * shake * 1.6;
        camera.position.x += (Math.random() - 0.5) * s;
        camera.position.y += (Math.random() - 0.5) * s;
      }
      camera.lookAt(camTarget);
      camera.updateMatrixWorld();
      const e = camera.matrixWorld.elements;
      WU.uCamPos.value.copy(camera.position);
      WU.uCamRight.value.set(e[0], e[1], e[2]);
      WU.uCamUp.value.set(e[4], e[5], e[6]);
      WU.uCamFwd.value.set(-e[8], -e[9], -e[10]);

      // the city's own two window colours, read off the palette before the acts
      // run so a nucleon on its way to a pane arrives holding that pane's colour
      const pw = io.palette;
      winWarm[0] = pw[1].r + (pw[0].r - pw[1].r) * 0.30;
      winWarm[1] = pw[1].g + (pw[0].g - pw[1].g) * 0.30;
      winWarm[2] = pw[1].b + (pw[0].b - pw[1].b) * 0.30;
      winCool[0] = pw[2].r + (1 - pw[2].r) * 0.30;
      winCool[1] = pw[2].g + (1 - pw[2].g) * 0.30;
      winCool[2] = pw[2].b + (1 - pw[2].b) * 0.30;

      // ---- the acts (every act keeps running; only weighted ones show)
      updateCollider(dt, t, actW[0]);
      updateFission(dt, t, actW[1], transit);
      updateClouds(dt, t);
      pickFlashes();
      updateRVs(dt);
      updateShockwave(dt, t, actW[3]);
      // the blast wind: the gust of the last burst dies back to the storm's
      // wind over a minute; the smoke leans with it, the embers and the far
      // debris stream along it
      bwGust = approach(bwGust, 0.35, 40, dt);
      bwX = approach(bwX, WBX, 70, dt); bwZ = approach(bwZ, WBZ, 70, dt);
      { const l = Math.sqrt(bwX * bwX + bwZ * bwZ) || 1; bwX /= l; bwZ /= l; }
      WU.uWind.value.set(bwX * (0.10 + 0.16 * bwGust), bwZ * (0.10 + 0.16 * bwGust));
      updateStreet(dt, t, actW[3]);
      updateDebris(dt);
      updateCars(dt);
      updateRest(dt);
      amortiseVisibility(dt);
      updateBoxes(dt, clamp(actW[2] + actW[3], 0, 1), pw);

      // ---- the sky's state: the ash dusk decays over minutes; the storm throws
      // a bolt every so often; the fires age and their smoke stands
      wreck *= Math.exp(-dt / 300);
      ltnClock += dt;
      ltnT += dt;
      if (ltnClock >= ltnNext && (actW[2] > 0.5 || actW[3] > 0.5)) fireLightning();
      else if (ltnClock >= ltnNext) ltnNext = ltnClock + 10;
      const ltn = ltnT < 0.7
        ? Math.exp(-ltnT / 0.07) + 0.35 * Math.exp(-(ltnT - 0.12) * (ltnT - 0.12) / 0.001) + 0.7 * Math.exp(-(ltnT - 0.30) * (ltnT - 0.30) / 0.003)
        : 0;
      WU.uLtn.value = Math.min(1, ltn);
      {
        const F = WU.uFire.value;
        let n = 0;
        let fwx = camTarget.x - camPos.x, fwz = camTarget.z - camPos.z;
        const fwl = Math.sqrt(fwx * fwx + fwz * fwz) + 1e-6;
        fwx /= fwl; fwz /= fwl;
        for (let i = 0; i < MAX_FIRE; i++) {
          const gi = GL_FIRE0 + i;
          if (fireT0[i] < 0) { glows.s[gi * 4 + 1] = 0; continue; }
          const age = t - fireT0[i];
          if (age > 260) { fireT0[i] = -1; glows.s[gi * 4 + 1] = 0; continue; }
          // a column behind the eye or well off to the side is not packed: the shader's loop runs over what can be seen
          const rx = fireX[i] - camPos.x, rz = fireZ[i] - camPos.z;
          const along = rx * fwx + rz * fwz, across = Math.abs(rx * fwz - rz * fwx);
          if (along < -90 || across > along * 1.6 + 160) { glows.s[gi * 4 + 1] = 0; continue; }
          F[n * 4] = fireX[i]; F[n * 4 + 1] = fireZ[i]; F[n * 4 + 2] = fireY[i]; F[n * 4 + 3] = age;
          n++;
          // the fire's own glow at the roof, flickering, hidden by what stands in front of it
          const lit = age > 0 ? (0.5 + 0.5 * Math.abs(Math.sin(t * 7.3 + i * 1.7))) * Math.min(1, age / 6) * Math.exp(-age / 180) : 0;
          sph(glows, gi, fireX[i], fireY[i] + 2, fireZ[i], 5.0, lit * 0.45 * (lit > 0 ? visibleFrom(fireX[i], fireY[i] + 3, fireZ[i]) : 0), 0.15, 1.0);
        }
        WU.uNFire.value = n;
      }

      // ---- uniforms and buffers
      const pl = io.palette;
      for (let i = 0; i < 5; i++) { wp[i].value.copy(pl[i]); cp[i].value.copy(pl[i]); sp[i].value.copy(pl[i]); gp[i].value.copy(pl[i]); }
      WU.uTime.value = t;
      WU.uIntensity.value = io.intensity * openDim;
      WU.uFlash.value = Math.min(0.97, flash * flash * 0.9 + cascadeFlash * 0.6);
      WU.uActW.value.set(actW[0], actW[1], actW[2], actW[3]);
      WU.uVertexGlow.value = vertexGlow;
      WU.uCollFlash.value = collFlash;
      WU.uStreet.value = actW[3];
      WU.uMorph.value = swayS;
      WU.uPress.value = pressS;
      WU.uRain.value = 0.25 + high * 0.45;
      WU.uWreck.value = wreck;
      WU.uHaze.value = 0.0007 + wreck * 0.0009;   // the dust thickens the distance
      WU.uLamps.value = 0.5 + 0.5 * wreck;         // the lamps come up as the dusk deepens
      WU.uFogD.value = 0.0020 + bass * 0.0015;
      // the projected light's threshold: the contrast control, and the ash thickening the deck
      WU.uGateT.value = clamp(0.40 + 0.45 * shadowContrastP + 0.22 * wreck, 0.1, 0.95);
      CU.uIntensity.value = io.intensity * openDim;
      solids.U.uIntensity.value = io.intensity * openDim;
      glows.U.uIntensity.value = io.intensity * openDim;
      // the boxes' light: the city's sun, dome, lamp, flash and fire colours
      BU.uIntensity.value = io.intensity * openDim;
      cA.copy(pl[0]).lerp(cC.set(1, 1, 1), 0.55);
      cB.copy(pl[1]).lerp(pl[3], 0.5).multiplyScalar(0.8);
      BU.uSunCol.value.copy(cA).lerp(cB, wreck * 0.85).multiplyScalar(1 - wreck * 0.75);
      cA.copy(pl[3]).lerp(pl[0], 0.5).lerp(grey3(cC.copy(pl[2]), 0.4), 0.5).multiplyScalar(0.40);
      grey3(cB.copy(pl[4]).lerp(pl[1], 0.3), 0.6).multiplyScalar(0.14);
      BU.uAmb.value.copy(cA).lerp(cB, wreck * 0.85);
      BU.uLampCol.value.copy(pl[1]).lerp(pl[0], 0.3);
      cA.copy(pl[3]).lerp(pl[0], 0.5).multiplyScalar(0.55);
      grey3(cB.copy(pl[4]).lerp(pl[1], 0.3), 0.6).multiplyScalar(0.22);
      BU.uDome.value.copy(cA).lerp(cB, wreck * 0.85);
      BU.uFlashCol.value.copy(pl[0]).lerp(cC.set(1, 1, 1), 0.75);
      BU.uFireCol.value.copy(pl[1]).lerp(pl[0], 0.5).multiplyScalar(2.2);
      BU.uFlash.value.set(flX[0], flY[0], flZ[0], nFlash > 0 ? flA[0] : 0);
      BU.uFlashR2.value = nFlash > 0 ? flR2[0] : 1;
      BU.uExpo.value = flashExpo;
      if (warmFrames < 2) {
        // a pinhead at zero alpha two metres ahead of the eye: the driver's first use of the program
        warmFrames++;
        box(0, camPos.x + WU.uCamFwd.value.x * 2, camPos.y + WU.uCamFwd.value.y * 2, camPos.z + WU.uCamFwd.value.z * 2, 0.002, 0.002, 0.002, shadowQ, 0, 0, 0, 0, 0.002, 0, 0, 0, 0);
      }
      capAP0.needsUpdate = true; capAP1.needsUpdate = true; capAS.needsUpdate = true;
      solids.aPos.needsUpdate = true; solids.aS.needsUpdate = true; solids.aC.needsUpdate = true;
      glows.aPos.needsUpdate = true; glows.aS.needsUpdate = true; glows.aC.needsUpdate = true;
      bxAPos.needsUpdate = true; bxAExt.needsUpdate = true; bxARot.needsUpdate = true; bxACol.needsUpdate = true; bxALit.needsUpdate = true;
      const cityOn = actW[2] > 0.002 || actW[3] > 0.002;
      caps.visible = actW[0] > 0.002 || actW[1] > 0.002 || cityOn;
      solids.mesh.visible = actW[1] > 0.002;
      glows.mesh.visible = caps.visible;
      boxes.visible = cityOn || warmFrames < 2;
      bloom.strength = 0.45 + flash * 1.2 + collFlash * 0.4 + cascadeFlash * 0.8;
      // the launch map rides above the city, on the eye that was just placed;
      // it early-outs while hidden
      launchMap.update(dt, t, io, { camera, hand: io.xy, intensity: io.intensity * openDim });
    },
    resize(w, h) {
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      WU.uRes.value.set(w, h);
      CU.uRes.value.set(w, h);
      launchMap.resize(w, h);
    },
    dispose() {
      world.geometry.dispose();
      worldMat.dispose();
      capGeo.dispose();
      capMat.dispose();
      solids.geo.dispose();
      solids.mat.dispose();
      glows.geo.dispose();
      glows.mat.dispose();
      boxGeo.dispose();
      boxMat.dispose();
      boxSrc.dispose();
      launchMap.dispose();
    },
  };
}
