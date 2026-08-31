// Nature's Tomb, fifteen plates on one knob: seven organisms under dark-field
// light, in the order of life and then its end, a DOUBLE HELIX of B-form
// DNA, a CELL LINE that cleaves from a zygote to a blastula and then morphs on
// through the single-celled protists into primitive multicellular colonies, a
// MYCELIUM growing out from a spore, a SLIME MOLD foraging across its dish,
// and then the TOXIN wrecking the molecule, PHAGOCYTOSIS consuming the cell,
// DECOMPOSITION taking the body; and then THE WORLD, MICROSCOPY (the slide
// refocused), OCEAN CURRENTS (the flow field of drifting pressure systems),
// THE DAY (sunrise to storm over the sea), and the five weather systems,
// LIGHTNING, TORNADO, HURRICANE, WILDFIRE, SANDSTORM. One knob picks the
// plate, one knob and the strikes drive its development, one knob picks the
// species, sway morphs whichever generator is on screen. The world plates
// live in scene-private modules under ./naturestomb/ (weather.js, the five
// systems, ported whole from the Weather Systems scene with the hurricane and
// the wildfire raised; microscopy.js, sea.js, currents.js, three CodePen
// ports, MIT, each carrying its notice); each owns its own programs, so the
// organism quad is not one mega-shader.
//
//   COLD OPEN   The plate is DARK until the show starts, the first beat the
//               analyser hears, the transport playing, or any pad, and then
//               the molecule comes up and begins to replicate: the double
//               helix at stage 0 stepping to its replication fork. That is
//               the opening element; from there the performer develops it
//               onward (the knob or the strikes), and the next organism on the
//               knob is the cell. A weather plate selected while dark shows
//               its calm sky faintly and BUILDS when the show starts (the
//               opening fires its main event); the other world plates come up
//               faint and breathe with the level until then.
//   PLATE       KNOB 6 (io.knobs[5]) picks it in FIFTEEN bands with a little
//               hysteresis at the band edges, in this order: 0 DOUBLE HELIX,
//               1 CELL LINE, 2 MYCELIUM, 3 SLIME MOLD, 4 TOXIN,
//               5 PHAGOCYTOSIS, 6 DECOMPOSITION, the order of life and then
//               its end, then the world: 7 MICROSCOPY, 8 OCEAN CURRENTS,
//               9 THE DAY, 10 LIGHTNING, 11 TORNADO, 12 HURRICANE,
//               13 WILDFIRE, 14 SANDSTORM. The selection is smoothed with a
//               0.15 s time constant, so the dissolve runs exactly as fast as
//               the knob is turned: a flick cuts, a slow sweep cross-fades.
//               Only the plates with weight run their generators, and at most
//               two run at once; every quad draws weighted and adds, so a
//               dissolve between different programs is a cross-fade of two
//               finished images. Inside the weather the change between two
//               systems is Weather Systems' own two-eye dissolve. The
//               microscope's plate dissolves run through a focus pull.
//   LEVEL       KNOB 5 (io.knobs[4]) sets the development 0..1 the moment it
//               moves, and any pad STRIKE steps it ONE STAGE OF THE PLATE ON
//               SCREEN, reversing at the top and at the bottom; the level
//               eases over ~1.3 s so every stage plays out. Driving it DOWN
//               reverses the development. The stage count is the plate's own
//              , sixteen for the cell line, three for the helix, six for each
//               simulation and for each of the three end stages, four for the
//               microscope's focus, six for the currents' regimes, five for
//               the day's phases, so one strike always means one step of
//               what you are looking at. ON A WEATHER PLATE a pad fires the
//               system's MAIN EVENT instead (touchdown / eyewall cycle /
//               strike / flare up / gust, what a performer wants from a pad
//               on a storm) and the level is the system's intensity; the
//               develop up / down actions still step it. Per world plate the
//               level is: MICROSCOPY the focus (out of focus -> focused ->
//               through focus, the layers taking it with their depth); OCEAN
//               CURRENTS the regime (calm -> levante -> mistral -> tramontana ->
//               sirocco -> winter storm, the tables interpolated so the knob
//               morphs the field); THE DAY the time of day (DAWN -> MIDDAY ->
//               DUSK -> NIGHT -> STORM).
//   SPECIES     KNOB 7 (io.knobs[6]) picks one of eight seeded parameter sets
//               for the organism on screen (quantized with hysteresis, so the
//               knob is a selector, not a smear). It is the "no two runs look
//               alike" dial: a slime mold species, a fungal species, a base
//               sequence and duplex flavour, the cell line's irregularity.
//   THE CELL LINE   Sixteen stages on one continuous axis, every boundary a
//               morph and never a cut:
//                 0..6   CLEAVAGE, 1 -> 2 -> 4 -> 8 -> 16 -> 32 -> 64 blastomeres.
//                        Radii shrink by 2^-1/3, so CELL VOLUME is conserved
//                        at every division and the embryo grows no cytoplasm.
//                        The heap's own envelope does widen, a jammed pack of
//                        sixty-four spheres at a real packing fraction reaches
//                        a fifth further out than the zygote's surface, but it
//                        is clamped at the zona, which never moves, so what the
//                        eye sees is crowding and not growth. The seats
//                        the cells take are PACKED, not laid on a lattice: a
//                        binary lattice can only ever be 4 × 2 × 2 at sixteen
//                        cells, which welds them along the twice-divided axis
//                        and opens gaps across the other two. Each stage's
//                        seats are relaxed once at scene creation, the two
//                        children are placed either side of the parent across
//                        the cleavage plane, then the heap is shrunk pass by
//                        pass while overlapping pairs are pushed back apart
//                        until it JAMS at the spacing where that many spheres
//                        fill the zona at a real packing fraction. That is
//                        compaction, the event that rounds a real embryo up
//                        into a berry, and it leaves every count a crowded
//                        ball. A smooth-min neck is the cleavage furrow, each
//                        pair is drawn with the WALL it shares (the bisector
//                        of the two nearest centres, shaded as a groove with a
//                        bright junction line), and the aggregate is clamped
//                        at the zona so the outer cells flatten against it.
//                        Driving the level down merges the cells back.
//                 7      BLASTULA, the 64 blastomeres migrate outward onto a
//                        shell of 96 smaller cells and a fluid-filled
//                        blastocoel opens inside them; the cavity is lit
//                        through the shell by its chord. Each morula cell is
//                        paired with the seat on the shell nearest its own
//                        direction, so the stage change is an outward
//                        migration and not a scramble across the embryo; the
//                        thirty-two seats left over grow in place from
//                        nothing. The wall's cells are sized to the SEAT
//                        SPACING, half the nearest-neighbour distance of 96
//                        points on that sphere, with a little overlap, so the
//                        layer closes and the neighbours press into each
//                        other, which is what makes the blastocoel a cavity
//                        instead of a colander.
//                 8..12  THE PROTISTS, AMOEBA (streaming pseudopods whose
//                        extensions run on a slow noise, granular endoplasm
//                        crowding the centre, nucleus and contractile
//                        vacuole), PARAMECIUM (a slipper body, ciliary rows
//                        beating in a metachronal wave that travels down the
//                        body as real displacement, an oral groove cut into
//                        the ventral side, macronucleus and two contractile
//                        vacuoles), EUGLENA (a spindle drawn to a posterior
//                        point, an anterior flagellum carrying a travelling
//                        sine wave, the eyespot beside the reservoir,
//                        chloroplast discs through the pellicle's helical
//                        striations), DIATOM (a centric silica frustule at a
//                        fixed tilt so the girdle band shows, its valve face
//                        pitted with hexagonally packed areolae, radial
//                        costae and a ring of marginal spines), RADIOLARIAN
//                        (a central capsule inside a perforated mineral
//                        lattice with six axial and eight diagonal spicules).
//                 13..15 PRIMITIVE MULTICELLULAR, VOLVOX (a hollow sphere of
//                        flagellated cells in a glassy matrix. Its cells are
//                        SEPARATED, unlike the blastula's: a Volvox colony is
//                        individuals suspended in gel, not an epithelium, so
//                        the wall it makes is a lattice of distinct cells
//                        inside one glassy sphere. The flagellar rows stand
//                        fixed on the colony and only the beat moves, a
//                        metachronal wave running pole to pole, so the fringe
//                        never turns by itself; daughter colonies sit inside),
//                        FILAMENT (the sphere unrolls into a beaded chain of
//                        cells with a heterocyst every seventh), SPONGE (a
//                        vase-shaped body, ostia punched through the wall, the
//                        osculum open at the top, spicules in the mesohyl).
//               Stages that are aggregates of cells share one renderer; the
//               protists and the sponge are analytic solids. EVERY boundary is
//               carried by the cells themselves. Aggregate to aggregate they
//               travel seat to seat (the morula onto the blastula's wall, the
//               colony unrolling into a chain). Protist to protist the two
//               distance fields mix, so a euglena's spindle grows a diatom's
//               pores. Aggregate to protist the cells travel onto the
//               ORGANISM'S OWN SURFACE, each protist and the sponge carries a
//               layout of ninety-six seats laid on its body, and the crossing
//               is the same seat-by-seat pour, and only over the back half of
//               the crossing does the analytic solid come up underneath them.
//               By then the two surfaces are in the same place, so the
//               handover reads as ninety-six cells fusing into one body. It is
//               done that way because the two fields cannot simply be mixed:
//               the cell field is culled per ray, so away from the cells it is
//               a bound and not a distance, and mixing that bound into a
//               solid's field ate the solid away wherever the cull came back
//               empty. The extra march costs one march for the length of the
//               crossing and nothing at all outside it.
//   THE CELLS   Up to ninety-six cells at a time, far more than a march can
//               test at every step, so the aggregate is culled before it
//               is marched: the CPU bins the cells into eight octant groups
//               and writes them into the uniform array in group order with a
//               bounding sphere per group; the fragment shader tests those
//               eight spheres against the ray, then makes two cheap passes
//               over the surviving cells, the first for the nearest true
//               ray/sphere entry, the second keeping the fourteen cells whose
//               centres lie near the ray AND near that entry, and marches the
//               smooth union of only those. The march therefore costs a
//               bounded fourteen spheres a step no matter how many cells are
//               on the plate. Shading: granular cytoplasm with per-cell tint
//               and grain from a hash of the cell index, wrap light, a
//               subsurface glow, a wet specular, and, hit analytically on the
//               cell the ray actually entered, so no neighbour's nucleus can
//               print through the wall of the cell in front of it, a LIT
//               nucleus with a nucleolus, shaded off its own normal under the
//               same two-light rig, rimmed, and dimmed by the depth of
//               cytoplasm it is seen through.
//   SLIME MOLD  A Physarum polycephalum plasmodium, simulated rather than
//               drawn: Jones's agent model, protoplasm agents on a trail map
//               sense at three sensors ahead, turn toward the strongest, step
//               if the cell is free (one agent per cell, the exclusion that
//               keeps veins thin instead of collapsing the colony into one
//               slug), deposit; the map is box-blurred and decays. Every
//               parameter of that model is species-dependent, sensor angle
//               and distance, turn angle, step, deposit, decay, agent density,
//               a random-turn rate that opens a broad fan front, one to FOUR
//               inoculation points each with its OWN reach, grown to the
//               plate's radius plus its own offset from the centre, so the
//               discs union to the whole dish at full development however far
//               off-centre the spores were dropped, and colonies expand and
//               fuse, and the food layout (ring, scatter, clusters, a
//               row) with its own attractant strength. The species table is
//               four ARCHETYPES the seed picks between and then jitters, so a
//               strain is a different network MORPHOLOGY and not merely a
//               different scale: a fine reticulum, coarse trunk veins in a
//               sparse mesh, a broad fan front, and a shuttle-streaming
//               network anchored hard to its food. The trail is displayed
//               against its own equilibrium (deposit over decay), so a heavy
//               depositor shows veins instead of saturating into a sheet.
//               Sway morphs sensing live on top of the species; the level is
//               the colony's reach, and at full development that reach is the
//               whole dish for every strain. A flake the colony has not
//               reached is a dull speckled husk the dark field still picks out
//              , it is already leaking a fifth of its attractant onto the
//               plate, which is what draws the veins to it, and the moment an
//               AGENT STEPS ONTO IT it lights, for good, and the veins wire it
//               in at full strength.
//   MYCELIUM    A hyphal growth simulation laid down in time order as one
//               instanced mesh of screen-space capsules, so the visible prefix
//               of the list is the colony at a point in its growth. Per
//               species: germ tube count, branching angle and interval,
//               branch rate, internode length, tortuosity, radial tropism,
//               gravitropism into the slab, negative autotropism (tips steer
//               down the gradient of a density grid, away from their own
//               colony), anastomosis (a tip meeting an older hypha fuses to
//               it and stops, closing a loop in the network), rhizomorph cords
//               (a cord tip lays three parallel hyphae as a bundle) and
//               sporangia (a swollen, spore-bearing head on tips that die
//               late). The network is re-run from the same random table
//               whenever sway moves, so it deforms continuously instead of
//               re-seeding.
//   DOUBLE HELIX  B-form DNA built properly: two antiparallel sugar-phosphate
//               backbones at 10.5 base pairs per turn, the second strand set
//               140° round the axis rather than 180° so the major and minor
//               grooves come out in the right ratio; base pairs as rungs with
//               two hydrogen bonds for A-T and three for G-C, each base tinted
//               from its own palette slot. The strands are laid in opposite
//               senses and SHOW it: each nucleotide's phosphate bead sits off
//               centre along its segment, and to the other side on the other
//               strand, so the beads march 5'->3' one way down the molecule and
//               3'->5' the other. The development level runs it from
//               a plain duplex, through a replication fork, the strands
//               splaying into a Y above the fork, a polymerase bubble at the
//               junction, a continuous leading strand and Okazaki fragments on
//               the lagging one, to a nucleosome-wrapped chromatin fibre, the
//               duplex making 1.65 turns round each histone core with linker
//               DNA between. Sway sweeps the torsion: from B-form it unwinds
//               toward an open ladder, then winds back through B-form into an
//               overwound, writhing supercoil. NOTHING SPINS: the geometry is
//               static and the hand's X turns the molecule about its own axis,
//               so the apparent rotation is always the performer's.
//   TOXIN       The same B-form helix, and seven real molecules built from
//               their own atom positions: four of 2,3,7,8-TCDD (dibenzo-p-
//               dioxin, three fused rings with two oxygens bridging the
//               middle one, chlorinated at the four outer positions, planar)
//               and three of DDT (a tetrahedral carbon carrying a
//               trichloromethyl group, a hydrogen and two para-chlorophenyl
//               rings twisted against each other). Bond lengths are the real
//               ones, aromatic C-C 1.40 Å, C-O 1.38, C-Cl 1.74, sp3 C-C 1.54
//              , drawn at the MOLECULE'S OWN SCALE against the helix, so a
//               dioxin is the width of a base pair because that is what it is.
//               Atoms are ball impostors shaded off their own normal, coloured
//               by element from the palette; bonds are sticks. The molecules
//               drift in from the dark on a slow wander and TUMBLE ONLY UNDER
//               THE HAND AND THE SWAY, nothing here turns on a clock. The
//               development is the attack, and every stage is a real lesion:
//               ADDUCTS dock onto the bases and the backbone; the two dioxins
//               INTERCALATE, wedging their step of the base stack open by a
//               full rise and unwinding the duplex locally by 26°, eased over
//               the neighbouring pairs so the backbones bend round the wedge
//               rather than kink; three NICKS cut one backbone each (a cut
//               segment's ends draw into its middle, so the strand frays and
//               parts instead of vanishing in a frame); then two DOUBLE-STRAND
//               BREAKS at the intercalation sites, and the three fragments
//               carry apart, each is displaced and tilted about its own fixed
//               axis by the development, with a slow wander once loose, and
//               whatever molecule docked on a fragment rides it. Through all
//               of it the molecule SICKENS: a per-base damage level, carried in
//               the segment's own attribute, tints the backbone and the bases
//               toward the palette's cold end and dims them, so the wreckage
//               is worst where the molecules struck. Sway is the torsion, as on
//               the clean helix; the hand's X is the azimuth.
//   PHAGOCYTOSIS  A macrophage consuming a smaller cell. One smooth union
//               marched on the quad: an amoeboid body under slow streaming
//               bulges (a translation through the noise domain, not a turn),
//               up to seven PSEUDOPODS, each a chain of three tapered
//               capsules, bounded by its own sphere so the march tests it only
//               where it might matter, and the phagosome. The development
//               runs the sequence: the prey drifts in from the dark, the
//               pseudopods reach out and WRAP round it (their tips travel
//               along an arc about the prey), the membrane SEALS behind it,
//               the phagosome is a sphere grown from nothing and blended into
//               the body, so the prey is enclosed rather than covered, the
//               pseudopods draw back, the vacuole is pulled INSIDE, the prey
//               is compressed, and then DIGESTED: it fades inside the vacuole
//               and the vacuole shrinks. Sway grows the last three pseudopods
//               from nothing and winds tortuosity into all of them; press
//               squeezes the whole cell. The macrophage's nucleus is hit
//               analytically and seen through the cytoplasm, like the cell
//               line's nuclei.
//   DECOMPOSITION  A dead tissue mass on the plate, fifty-four cells in two
//               layers, mounded, marched by the SAME culled cell machinery the
//               embryo uses. The development takes it apart: the turgor goes
//               and it SLUMPS (the cells sink and spread, and the smooth-min
//               neck swells so the junctions blur into one mass), the colour
//               DRAINS to the palette's ash end, the least saturated stop
//               relative to its own brightness, so a dark violet is never
//               mistaken for ash, the surface PITS on a noise the sway moves
//               through, BACTERIA colonise it in patches (a coarse noise sets
//               where a colony has taken, a fine one its cells), the MOULD
//               germinates on the body itself (the hyphal simulation, run from
//               a strain of its own, its germ tubes starting from the mass's
//               own cells and every segment lifted onto the top of the tissue
//               beneath it, so the network follows the body as it slumps), it
//               BREAKS into five pieces that drift apart as the neck lets go
//               again, and they SINK into the substrate and dissolve, leaving
//               the fungal network and a mottled ashen STAIN on the plate.
//               Sway morphs the decay pattern and the network; press squeezes
//               the mass; a strike steps it.
//   GESTURES    SWAY is each organism's morph: the cell line's membrane
//               tension (a noise displacement that jiggles and softens the
//               membranes, damped on the mineral forms), the slime mold's
//               sensing, the mycelium's branching angle and tortuosity, the
//               helix's torsion. PRESS squeezes: it flattens the embryo,
//               crowds the colony, squashes the mycelium, compresses the
//               helix. The hand PANS the plate (X) and DOLLIES the eye (Y),
//               translation only, except on the helix, where X is the
//               molecule's azimuth. Bass swells the cytoplasm and the veins,
//               the beat pulses them, treble shimmers the granules, the level
//               lifts the plate's rim glow.
//   THE WORLD   the eight world plates' gestures: on the weather SWAY is the
//               system's morph (funnel tortuosity, band tightness, bolt
//               branching, the wind, dust density) and PRESS its squeeze, the
//               hand pans and lifts the eye; MICROSCOPY sway is magnification,
//               press the aperture, the hand pans the slide; OCEAN CURRENTS
//               sway is the field gain and wander, press the system radius,
//               the hand pans the map; THE DAY sway is the storm amount and
//               wave amplitude, press the camera down to the water, the hand
//               yaws the look and sets the height. Species: the currents'
//               layout and wander, the day's swells and cloud, the
//               microscope's cell scale, the weather as its own seeds allow.
//               The hand is the ONLY camera motion anywhere.
//   ASSIGNMENT  meta.controls exposes the whole surface to the assignment
//               panel: actions to pick each of the fifteen plates, step the
//               development up or down, re-seed the simulations, and the
//               weather's events (strike in ANY weather plate, touchdown,
//               gust, flare up, eyewall cycle, calm); params for development,
//               organism (0..14), species, morph and squeeze. The raw knob
//               reads above stay as the no-assignment fallback, whichever
//               moved last wins, and morph/squeeze take the larger of the
//               gesture and the assigned control, so assigning one never kills
//               the other.
//
// Draw calls: the organism quad (the cell-line raymarch, the plasmodium's
// plate, the mycelium's plate and spore, the helix's dark-field column, the
// macrophage, the dead mass and its plate, whichever organisms have weight,
// blended by it), the hyphae mesh (the fungus, or the mould on the corpse),
// the helix mesh (the molecule, and the toxin's molecules with it), the
// weather module's four (its world quad, solid impostors, additive impostors,
// bolt capsules), the microscope's quad, the day's quad, the currents' three
// (sea, trails, markers). Everything not selected is hidden and does no
// per-frame work; every material is visible at creation and the quads draw
// a 2-px patch at zero alpha for the first two frames (the warm frames), so
// the driver's first rasterised use of each program lands off screen. GLSL3.
// Colour: cytoplasm and plasmodium from palette 3/4 lifted toward white,
// nuclei and organelles from palette 1, membranes and fans palette 0, plate,
// hyphae and backbones from palette 2 lifted toward white, the four bases from
// palette 0/1/3/4, the toxin's atoms by element (carbon off palette 2 darkened,
// oxygen palette 0, chlorine palette 4, hydrogen near white), the sickening
// and the ash picked from the palette itself, the coldest stop and the least
// saturated one, followed smoothly so a hue rotation never flicks them.

import { createWeather } from './naturestomb/weather.js';
import { createMicroscopy } from './naturestomb/microscopy.js';
import { createSea } from './naturestomb/sea.js';
import { createCurrents } from './naturestomb/currents.js';

export const meta = {
  id: 'naturestomb',
  name: "Nature's Tomb",
  mood: 'cellular',
  controls: {
    actions: [
      { key: 'cellLine', label: 'cell line' },
      { key: 'slimeMold', label: 'slime mold' },
      { key: 'mycelium', label: 'mycelium' },
      { key: 'doubleHelix', label: 'double helix' },
      { key: 'toxin', label: 'toxin' },
      { key: 'phagocytosis', label: 'phagocytosis' },
      { key: 'decomposition', label: 'decomposition' },
      { key: 'microscopy', label: 'microscopy' },
      { key: 'oceanCurrents', label: 'ocean currents' },
      { key: 'theDay', label: 'the day' },
      { key: 'lightning', label: 'lightning' },
      { key: 'tornado', label: 'tornado' },
      { key: 'hurricane', label: 'hurricane' },
      { key: 'wildfire', label: 'wildfire' },
      { key: 'sandstorm', label: 'sandstorm' },
      { key: 'developUp', label: 'develop up' },
      { key: 'developDown', label: 'develop down' },
      { key: 'reseed', label: 're-seed' },
      { key: 'strike', label: 'lightning strike' },
      { key: 'touchdown', label: 'touchdown' },
      { key: 'gust', label: 'gust front' },
      { key: 'flareUp', label: 'flare up' },
      { key: 'eyewall', label: 'eyewall cycle' },
      { key: 'calm', label: 'calm' },
    ],
    params: [
      { key: 'development', label: 'development', min: 0, max: 1, default: 0 },
      { key: 'organism', label: 'organism', min: 0, max: 14, default: 0 },
      { key: 'species', label: 'species', min: 0, max: 7, default: 0 },
      { key: 'morph', label: 'morph', min: 0, max: 1, default: 0 },
      { key: 'squeeze', label: 'squeeze', min: 0, max: 1, default: 0 },
    ],
  },
};

// --- the cell line -------------------------------------------------------------
const MAXC = 96; // cells the uniform array carries (the blastula and Volvox fill it)
const LOCAL = 14; // cells the march may consider at once, after culling
const R0 = 1.08; // zygote radius
// The zona pellucida. It is FIXED: the cleavage stages are clamped to
// ZONA × 0.955 and the shell is drawn at ZONA, so the embryo compacts inside a
// shell that does not move, however the jammed heap inside it packs.
const ZONA = 1.3;
const CLEAVE_S = 2 * R0 * 0.96; // the aggregate's span; every division works inside it
// Successive cleavage planes cycle x, y, z and then x, y, z again at half the
// separation (the child radius has halved by then), so six divisions land the
// sixty-four blastomeres on a 4 × 4 × 4 packing that FILLS the embryo. Six
// distinct oblique axes would have put every cell at a corner and left the
// morula hollow.
const AXES = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
// stage kinds: 0 an aggregate of cells, 1 an analytic solid (form id in FORM)
const KIND = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1];
const FORM = [-1, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, -1, -1, 5];
const STAGES = 16;
const SHELL_N = 96; // cells on the blastula / Volvox shell
const FIL_N = 16; // cells in the filament (long enough to run off both edges)
const FIL_SP = 0.375; // spacing along the chain
// how rigid each analytic form is (the sway jiggle is a membrane, not silica)
const FORM_SOFT = [1, 0.85, 0.7, 0.12, 0.15, 0.45];
// bounding radius of each analytic form at unit scale, so the march never
// starts further out than it must (the euglena's flagellum makes its bound
// large), and the factor the forms are blown up by to fill the plate
const FORM_BOUND = [1.16, 1.08, 1.62, 0.92, 1.08, 1.16];
const FORM_SCALE = 1.45;
// N seats spread evenly over a sphere of radius R sit a nearest-neighbour
// spacing of 2R·√(3.6276/N) apart, each seat owns 4πR²/N of the wall, laid
// out as a hexagon of side s, area (√3/2)s². Sizing the cells to THAT closes
// the wall; the hand-picked radius the blastula used before left every pair
// 0.07 apart with the smooth-min neck far too small to bridge them, so the
// "distinct outer cell layer" was a bag of separate balls you could see
// straight through. Volvox keeps small, separated cells on purpose: its cells
// really are individuals suspended in a glassy matrix, not a closed epithelium.
const seatR = (R, n, overlap) => R * Math.sqrt(3.6276 / n) * overlap;
const BLAST_R = seatR(1.0, SHELL_N, 1.18);

// --- the plate -----------------------------------------------------------------
const DISH = 1.5; // the plate's radius (world units) for the slime mold and the mycelium
const FOOD_N = 10; // oat flakes the plate can carry

// --- the mycelium ---------------------------------------------------------------
const MAX_TIPS = 640; // simultaneous hyphal tips
const MYC_STEPS = 96; // growth steps the scrub covers (the rim stops most tips before)
const RND_LEN = 65536; // the growth simulation's random table (power of two)
const GW = 96; // density / occupancy grid side, over the plate

// --- the double helix ------------------------------------------------------------
const BP = 42; // base pairs built, about four turns, running off frame at both ends
const SUB = 3; // backbone segments per base pair, so the strands read as curves
const HELIX_SEGS = 2400; // the helix, and the toxin's molecules with it
const RISE = 0.163; // world units per base pair
const HRAD = 0.50; // backbone helix radius: pitch / diameter = 1.71, B-form's own ratio
const TWIST0 = 0.5984; // 2π / 10.5 base pairs per turn
const GROOVE = 2.4435; // 140° between the strands, this is what makes the grooves unequal
const NUC = 3; // histone cores on the chromatin fibre
const COILR = 0.55; // nucleosome superhelix radius
const ANG = 0.048; // world units per ångström, the helix's own scale (3.4 Å rise, 20 Å across)

// --- the toxin ------------------------------------------------------------------
const NMOL = 7; // molecules on the plate: four TCDD, three DDT
const NBREAK = 2; // double-strand breaks, so three fragments at the end

// --- phagocytosis -----------------------------------------------------------------
const NPOD = 7; // pseudopods the macrophage can throw (sway grows the last three)
const PODPTS = 4; // points per pseudopod: the base on the body and three along it

// --- decomposition ------------------------------------------------------------------
const TIS_N = 54; // cells in the dead tissue mass
const TIS_CLUST = 5; // the pieces it breaks into

const GLSL = /* glsl */ `
  #define PI 3.14159265359
  #define TAU 6.28318530718
  uniform vec2 uRes;
  uniform vec4 uCells[MAXC];   // xyz centre, w radius, written in octant-group order
  uniform vec4 uGroups[8];     // per group: xyz bounding centre, w bounding radius
  uniform vec2 uSpan[8];       // per group: x first index, y count
  uniform vec4 uPseudo[6];     // the amoeba's pseudopods: xyz tip, w radius
  uniform vec4 uDaugh[4];      // Volvox daughter colonies: xyz centre, w radius
  uniform vec4 uFood[10];      // oat flakes: xy plate position, z radius, w lit
  uniform int uFormA, uFormB;
  uniform float uTime, uDist, uZonaW, uJig, uSoft, uPress, uBeat, uBass, uHigh;
  uniform float uLevelA, uIntensity, uCellW, uProtW, uFormF, uNeck, uCap, uCavity, uCavR;
  uniform float uCilia, uDaughN, uFoodN, uHetero, uGrain, uFormScale, uFringe, uFringeR;
  uniform vec2 uPan;
  uniform vec3 uPal0, uPal1, uPal2, uPal3, uPal4;
  uniform vec4 uOrg;           // organism weights: x mycelium, y slime, z cell line, w helix
  uniform sampler2D uTrail;    // the plasmodium's trail map, 0..1
  uniform float uTexel;        // one trail texel in uv
  uniform float uDish, uFlow, uTintA, uTintB;
  uniform vec3 uOrg2;          // organism weights: x toxin, y phagocytosis, z decomposition
  // phagocytosis: the macrophage's pseudopods as chains of capsules, the prey,
  // the phagosome closing round it, and the digestion
  uniform vec4 uPods[NPOD * PODPTS]; // per pseudopod: base, then three points out along it; w radius
  uniform vec4 uPodB[NPOD];    // per pseudopod: its bounding sphere
  uniform vec4 uPrey;          // xyz centre, w radius
  uniform vec4 uMacro;         // xyz the macrophage's centre, w the phagosome's blend radius
  uniform vec4 uPhA;           // x prey squash, y digestion 0..1, z vacuole radius, w phagosome radius
  uniform vec4 uPhB;           // xyz nucleus centre, w its radius
  uniform vec4 uPhC;           // the whole cell's bounding sphere: xyz centre, w radius
  // decomposition: the slump, the pits, the bacteria, the colour draining
  uniform vec4 uDec;           // x slump, y pits, z specks, w drain
  uniform vec4 uDec2;          // x stain radius, y stain strength, z dissolve, w bound radius
  uniform vec3 uAsh;           // the palette's ash end, and its cold end
  uniform vec3 uCold;
  uniform float uSick;         // the helix's sickening, 0..1
  // the loop bounds as UNIFORMS: a constant trip count is fully unrolled by
  // the D3D compiler at every call site (the march × the culled cell list ×
  // three marchers), which is what made the cold first draw take a minute
  uniform int uSpecSteps, uNSteps, uMaxC;
  in vec2 vUv;
  out vec4 fragColor;

  // the culled cell list for this pixel's ray (see cullCells), and a
  // conservative lower bound on how far the aggregate is from that ray when
  // the list comes back empty, a finite number, so a blend against another
  // field stays a blend instead of letting the other field through
  int gN;
  int gLoc[LOCAL];
  float gFar;

  float h11(float n) { return fract(sin(n * 127.1) * 43758.5453); }
  float h31(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float noise3(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = h31(i), n100 = h31(i + vec3(1, 0, 0)), n010 = h31(i + vec3(0, 1, 0)), n110 = h31(i + vec3(1, 1, 0));
    float n001 = h31(i + vec3(0, 0, 1)), n101 = h31(i + vec3(1, 0, 1)), n011 = h31(i + vec3(0, 1, 1)), n111 = h31(i + vec3(1, 1, 1));
    return mix(mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y), mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y), f.z);
  }
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }
  float smax(float a, float b, float k) { return -smin(-a, -b, k); }
  float sdCap(vec3 p, vec3 a, vec3 b, float r) {
    vec3 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    return length(pa - ba * h) - r;
  }
  float sdEll(vec3 p, vec3 r) {
    float k0 = length(p / r);
    float k1 = length(p / (r * r));
    return k0 * (k0 - 1.0) / max(k1, 1e-5);
  }
  // a tapered spicule from the origin along +x of a folded space
  float spike(float along, float perp, float len, float r0) {
    float h = clamp(along / len, 0.0, 1.0);
    return length(vec2(along - h * len, perp)) - mix(r0, 0.004, h);
  }
  float iSphere(vec3 ro, vec3 rd, vec3 c, float r, out float edge) {
    vec3 oc = ro - c;
    float b = dot(oc, rd);
    float cc = dot(oc, oc) - r * r;
    float h = b * b - cc;
    edge = h / (r * r);
    if (h < 0.0) return -1.0;
    return -b - sqrt(h);
  }
  // chord length of a ray inside a sphere, 0 if it misses
  float chord(vec3 ro, vec3 rd, float r) {
    float b = dot(ro, rd);
    float h = b * b - dot(ro, ro) + r * r;
    return h < 0.0 ? 0.0 : 2.0 * sqrt(h);
  }
  // an octahedral map of a direction, so a flat hex grid can be laid over a
  // sphere without a pole
  vec2 octa(vec3 n) {
    n /= max(abs(n.x) + abs(n.y) + abs(n.z), 1e-5);
    vec2 uv = n.xz;
    if (n.y < 0.0) uv = (1.0 - abs(uv.yx)) * vec2(uv.x >= 0.0 ? 1.0 : -1.0, uv.y >= 0.0 ? 1.0 : -1.0);
    return uv;
  }
  float hexDist(vec2 p, float s) {
    vec2 h = vec2(1.0, 1.7320508) * s;
    vec2 a = mod(p, h) - h * 0.5;
    vec2 b = mod(p + h * 0.5, h) - h * 0.5;
    return min(length(a), length(b));
  }

  // ---- the cell aggregate --------------------------------------------------
  // Ninety-six spheres are far too many to test at every march step, so the
  // list is culled once per pixel, in three cheap sweeps: the eight octant
  // groups the CPU packed are tested against the ray first, then the cells of
  // the surviving groups give the nearest true entry point, then only the
  // cells near BOTH the ray and that entry are kept. The march that follows
  // costs a bounded LOCAL spheres a step whatever the cell count is.
  void cullCells(vec3 ro, vec3 rd) {
    gN = 0;
    gFar = 1e9;
    float tHit = 1e9;
    for (int g = 0; g < 8; g++) {
      float n = uSpan[g].y;
      if (n < 0.5) continue;
      vec4 gs = uGroups[g];
      vec3 oc = gs.xyz - ro;
      float tc = dot(oc, rd);
      float d2 = dot(oc, oc) - tc * tc;
      float rr = gs.w + uNeck;
      if (d2 > rr * rr) { gFar = min(gFar, sqrt(d2) - gs.w); continue; }
      int s = int(uSpan[g].x);
      int cnt = int(n);
      for (int i = 0; i < uMaxC; i++) {
        if (i >= cnt) break;
        vec4 c = uCells[s + i];
        vec3 o2 = c.xyz - ro;
        float t2 = dot(o2, rd);
        float p2 = dot(o2, o2) - t2 * t2;
        gFar = min(gFar, sqrt(max(p2, 0.0)) - c.w);
        float r2 = c.w + uNeck * 0.5;
        float hh = r2 * r2 - p2;
        if (hh <= 0.0) continue;
        float te = t2 - sqrt(hh);
        if (te < tHit) tHit = te;
      }
    }
    // Second sweep, in two passes: the cells that can shape the surface near
    // the entry first, then (ONLY IF THERE IS ROOM LEFT) the ones further
    // down the ray. The window round the entry is what bounds the march's
    // cost, but taking it as an exclusion cost a hard black line round every
    // cell that had another cell behind it: a ray passing just OUTSIDE a cell
    // still crosses that cell's inflated test sphere, so the near cell set the
    // entry, the window then threw away the cell BEHIND it, and the march ran
    // through a list holding only a cell it misses and hit nothing at all.
    // Where the aggregate is crowded the first pass fills the list and the
    // second exits on its first test, so the bound is unchanged.
    for (int pass = 0; pass < 2; pass++) {
      if (gN >= LOCAL) break;
      for (int g = 0; g < 8; g++) {
        float n = uSpan[g].y;
        if (n < 0.5) continue;
        vec4 gs = uGroups[g];
        vec3 oc = gs.xyz - ro;
        float tc = dot(oc, rd);
        float d2 = dot(oc, oc) - tc * tc;
        float rr = gs.w + uNeck;
        if (d2 > rr * rr) continue;
        int s = int(uSpan[g].x);
        int cnt = int(n);
        for (int i = 0; i < uMaxC; i++) {
          if (i >= cnt) break;
          if (gN >= LOCAL) break;
          vec4 c = uCells[s + i];
          vec3 o2 = c.xyz - ro;
          float t2 = dot(o2, rd);
          float p2 = dot(o2, o2) - t2 * t2;
          float r2 = c.w + uNeck;
          if (p2 > r2 * r2) continue;
          bool near = tHit > 1e8 || abs(t2 - tHit) <= 2.6 * (c.w + uNeck);
          if (near != (pass == 0)) continue;
          gLoc[gN] = s + i;
          gN++;
        }
      }
    }
  }
  float dCells(vec3 p) {
    if (gN == 0) return max(gFar, 0.02);
    float d = 1e9;
    for (int j = 0; j < LOCAL; j++) {
      if (j >= gN) break;
      vec4 c = uCells[gLoc[j]];
      float di = length(p - c.xyz) - c.w;
      d = (j == 0) ? di : smin(d, di, uNeck);
    }
    // the flagella of a Volvox colony: the rows stand FIXED on the sphere and
    // only the beat moves, a metachronal wave running pole to pole down the
    // axis, a travelling wave, never a turn of the pattern about the axis
    if (uCilia > 0.0) {
      vec3 n = normalize(p);
      float rows = 0.5 + 0.5 * sin(atan(n.z, n.x) * 13.0);
      float beat = 0.5 + 0.5 * sin(n.y * 9.0 - uFlow * 2.4);
      d -= uCilia * rows * beat * smoothstep(-0.2, 0.4, d / max(uNeck, 1e-3) + 0.6);
    }
    // crowded against the zona: the outer cells flatten where they meet it,
    // rounded off at the contact rather than creased, the way a blastomere
    // pressed to the shell actually sits
    return smax(d, length(p) - uCap, uNeck * 0.8);
  }
  // which of the kept cells owns this point (for its own tint and grain), and
  // how far the point is from the wall it shares with its nearest neighbour
  float cellSeed(vec3 p, out float wall) {
    float b1 = 1e9, b2 = 1e9, seed = 0.0;
    for (int j = 0; j < LOCAL; j++) {
      if (j >= gN) break;
      vec4 c = uCells[gLoc[j]];
      float di = length(p - c.xyz) - c.w;
      if (di < b1) { b2 = b1; b1 = di; seed = float(gLoc[j]); }
      else if (di < b2) { b2 = di; }
    }
    wall = (b2 > 1e8) ? 1.0 : smoothstep(0.0, max(uNeck, 1e-4) * 0.9, b2 - b1);
    return seed;
  }

  // ---- the analytic forms ---------------------------------------------------
  // 0 amoeba, 1 paramecium, 2 euglena, 3 diatom, 4 radiolarian, 5 sponge.
  // Each is a distance field about the origin at roughly unit scale, so any
  // two of them (and a cell aggregate) blend by a mix of their distances.
  vec3 diaSpace(vec3 p) {
    // the frustule is held at a fixed tilt so the girdle band shows beside the
    // valve face; the matrices are constants, nothing here turns with time
    vec3 q = p;
    q.yz = mat2(0.52, -0.854, 0.854, 0.52) * q.yz;
    q.xy = mat2(0.94, -0.342, 0.342, 0.94) * q.xy;
    return q;
  }
  float dAmoeba(vec3 p) {
    float d = sdEll(p, vec3(0.60, 0.50, 0.52));
    for (int i = 0; i < 6; i++) {
      vec4 ps = uPseudo[i];
      d = smin(d, sdCap(p, ps.xyz * 0.20, ps.xyz, ps.w), 0.20);
    }
    return d;
  }
  float dParam(vec3 p) {
    // the slipper: a broad posterior smoothly joined to a tapered anterior,
    // bent along its length
    vec3 q = p;
    q.y += 0.15 * q.x * q.x - 0.05;
    float d = sdEll(q - vec3(-0.20, 0.0, 0.0), vec3(0.70, 0.37, 0.34));
    d = smin(d, sdEll(q - vec3(0.50, 0.03, 0.0), vec3(0.44, 0.24, 0.22)), 0.24);
    // the oral groove, a furrow cut obliquely into the ventral side
    float g = sdCap(q, vec3(0.52, -0.20, 0.19), vec3(-0.06, -0.28, 0.05), 0.17);
    d = smax(d, -g, 0.10);
    if (uCilia > 0.0) {
      // ciliary rows round the body, beating in a metachronal wave that
      // travels from the anterior astern (a travelling wave, not a rotation)
      float rows = 0.5 + 0.5 * cos(atan(q.z, q.y) * 22.0);
      float wave = 0.5 + 0.5 * sin(q.x * 16.0 - uFlow * 3.4);
      d -= uCilia * rows * wave * clamp(1.15 - 0.7 * abs(q.x), 0.0, 1.0);
    }
    return d;
  }
  float dEuglena(vec3 p) {
    float d = sdEll(p, vec3(0.30, 0.70, 0.28));
    d = smin(d, sdCap(p, vec3(0.0, -0.52, 0.0), vec3(0.0, -0.98, 0.0), 0.05), 0.20);
    // the flagellum: a travelling sine wave off the anterior reservoir
    vec3 f = p - vec3(0.05, 0.66, 0.0);
    float y = clamp(f.y, 0.0, 0.92);
    float amp = 0.15 * smoothstep(0.0, 0.30, y);
    float ph = y * 12.0 - uFlow * 4.2;
    float df = length(vec3(f.x - amp * sin(ph), f.y - y, f.z - amp * 0.45 * cos(ph))) - 0.026;
    return min(d, df);
  }
  float dDiatom(vec3 p) {
    vec3 q = diaSpace(p);
    float rr = length(q.xz);
    vec2 dd = vec2(rr - 0.70, abs(q.y) - 0.16);
    float d = min(max(dd.x, dd.y), 0.0) + length(max(dd, 0.0)) - 0.06;
    // areolae: hexagonally packed pits sunk into both valve faces
    float face = smoothstep(0.09, 0.15, abs(q.y)) * (1.0 - smoothstep(0.58, 0.70, rr));
    d += 0.030 * face * smoothstep(0.052, 0.008, hexDist(q.xz, 0.112));
    // costae radiating to the margin, and a ring of marginal spines
    float ang = atan(q.z, q.x);
    float sec = TAU / 26.0;
    float aa = mod(ang + sec * 0.5, sec) - sec * 0.5;
    vec2 rp = vec2(cos(aa), sin(aa)) * rr;
    d = min(d, sdCap(vec3(rp.x, q.y, rp.y), vec3(0.66, 0.0, 0.0), vec3(0.83, 0.0, 0.0), 0.017));
    return d;
  }
  float dRadio(vec3 p) {
    float d = length(p) - 0.30;                          // the central capsule
    float lp = max(length(p), 1e-4);
    vec3 n = p / lp;
    float shell = abs(lp - 0.70) - 0.052;
    // an ordered lattice of pores through the mineral shell
    float hd = hexDist(octa(n) * 4.6, 0.5);
    shell = max(shell, (0.20 - hd) * 0.5);
    d = min(d, shell);
    vec3 a = abs(p);
    float s1 = spike(a.x, length(a.yz), 0.98, 0.016);
    float s2 = spike(a.y, length(a.xz), 0.98, 0.016);
    float s3 = spike(a.z, length(a.xy), 0.98, 0.016);
    float dg = dot(a, vec3(0.57735));
    float s4 = spike(dg, length(a - 0.57735 * dg), 0.86, 0.013);
    return min(d, min(min(s1, s2), min(s3, s4)));
  }
  // the sponge is held tipped toward the eye, a constant, like the diatom's
  //, so the osculum reads as an opening and not as a rim seen edge-on
  vec3 spgSpace(vec3 p) {
    vec3 q = p;
    q.yz = mat2(0.8525, -0.5227, 0.5227, 0.8525) * q.yz;
    return q;
  }
  float dSponge(vec3 p) {
    vec3 q = spgSpace(p);
    float rad = 0.34 + 0.30 * smoothstep(-0.95, 0.85, q.y) + 0.05 * sin(q.y * 5.0);
    float body = max(length(q.xz) - rad, abs(q.y + 0.05) - 0.90);
    float inner = max(length(q.xz) - (rad - 0.15), -(q.y + 0.52));
    body = smax(body, -inner, 0.06);                     // spongocoel and osculum
    vec3 g = q * 7.0;
    float pore = length(g - floor(g + 0.5)) / 7.0 - 0.052;
    body = smax(body, -pore, 0.028);                     // ostia through the wall
    return body;
  }
  float formD(vec3 p, int f) {
    float d = 1e9;
    if (f == 0) d = dAmoeba(p);
    else if (f == 1) d = dParam(p);
    else if (f == 2) d = dEuglena(p);
    else if (f == 3) d = dDiatom(p);
    else if (f == 4) d = dRadio(p);
    else d = dSponge(p);
    return d;
  }
  // organelles seen through the body, marched from the surface inward
  float formOrgan(vec3 p, int f) {
    float d = 1e9;
    if (f == 0) {
      d = min(length(p - vec3(0.06, -0.06, 0.0)) - 0.21,
              length(p - vec3(0.26, 0.24, 0.16)) - 0.11);
    } else if (f == 1) {
      d = min(sdEll(p - vec3(0.02, 0.0, 0.0), vec3(0.22, 0.15, 0.15)),
              min(length(p - vec3(0.46, 0.12, 0.0)) - 0.10,
                  length(p + vec3(0.46, -0.12, 0.0)) - 0.10));
    } else if (f == 2) {
      float eye = length(p - vec3(0.06, 0.44, 0.20)) - 0.075;
      vec3 q = p * 8.6;
      float chl = length(q - floor(q + 0.5)) / 8.6 - 0.048;
      d = min(eye, max(chl, length(p) - 0.60));
    } else if (f == 3) {
      vec3 q = diaSpace(p);
      d = max(length(q.xz) - 0.42, abs(q.y) - 0.07);
    } else if (f == 4) {
      d = length(p) - 0.20;
    } else {
      // siliceous spicules glinting in the sponge's mesohyl
      vec3 sq = spgSpace(p);
      vec3 q2 = sq * 9.0;
      d = max(length(q2 - floor(q2 + 0.5)) / 9.0 - 0.020, length(sq.xz) - 0.66);
    }
    return d;
  }

  // ---- the specimen field: EITHER the cell aggregate (mode 0) or an analytic
  // form (mode 1), never a mix of the two distances. The cell field is culled
  // per ray, so away from the cells it is a bound and not a distance; mixing
  // that bound into a form's field erodes the form wherever the cull comes
  // back empty, which broke every aggregate-to-protist boundary into shards.
  // The two are marched separately instead and cross-faded by the level, so a
  // blastula pours into an amoeba as a double exposure of two lit specimens.
  float mapSpec(vec3 p, int mode) {
    p.y *= 1.0 + uPress * 0.22;                          // press squeezes it flat
    float d;
    if (mode == 0) d = dCells(p);
    else {
      // the analytic forms are built at unit scale and blown up to fill the
      // field of view; scaling the distance back keeps the march honest
      vec3 q = p / uFormScale;
      d = formD(q, uFormA);
      if (uFormF > 0.002) d = mix(d, formD(q, uFormB), uFormF);
      d *= uFormScale;
    }
    // the jiggle is a membrane, not silica, the analytic forms damp it
    d += uJig * (mode == 0 ? 1.0 : uSoft) * 0.045 * (noise3(p * 3.0 + vec3(0.0, uTime * 0.35, 0.0)) - 0.5);
    return d;
  }
  // the analytic forms' organelles, seen through the body. A cell's nucleus is
  // NOT marched: it is the owning cell's own sphere, hit analytically in
  // specimen(), which is both cheaper and correct, the min over every culled
  // cell used to draw a neighbour's nucleus through the wall of the cell in
  // front of it, as doubled, offset discs.
  float mapOrgan(vec3 p) {
    p.y *= 1.0 + uPress * 0.22;
    vec3 q = p / uFormScale;
    float d = formOrgan(q, uFormA);
    if (uFormF > 0.002) d = mix(d, formOrgan(q, uFormB), uFormF);
    return d * uFormScale;
  }
  vec3 normalOrgan(vec3 p) {
    const vec2 e = vec2(0.0022, 0.0);
    return normalize(vec3(
      mapOrgan(p + e.xyy) - mapOrgan(p - e.xyy),
      mapOrgan(p + e.yxy) - mapOrgan(p - e.yxy),
      mapOrgan(p + e.yyx) - mapOrgan(p - e.yyx)));
  }
  vec3 normalSpec(vec3 p, int mode) {
    const vec2 e = vec2(0.0025, 0.0);
    return normalize(vec3(
      mapSpec(p + e.xyy, mode) - mapSpec(p - e.xyy, mode),
      mapSpec(p + e.yxy, mode) - mapSpec(p - e.yxy, mode),
      mapSpec(p + e.yyx, mode) - mapSpec(p - e.yyx, mode)));
  }

  // ---- surface colour --------------------------------------------------------
  vec3 cellAlbedo(vec3 p, float sd, float wall, out vec3 emis) {
    float tint = h11(sd * 3.17 + 1.0);
    float gr = noise3(p * (12.0 + 5.0 * uGrain) + vec3(0.0, uTime * 0.05, 0.0));
    float gr2 = noise3(p * 40.0 + uTime * 0.02);
    vec3 cyto = mix(mix(uPal3, uPal4, 0.15 + 0.45 * tint), vec3(1.0), 0.25);
    // a heterocyst punctuates the filament: bigger, paler, thicker-walled
    float het = uHetero * step(0.5, fract(sd / 7.0) * 7.0 - 5.5);
    cyto = mix(cyto, mix(uPal1, vec3(1.0), 0.55), het * 0.8);
    cyto *= 0.85 + 0.22 * gr + 0.10 * gr2 * (1.0 + uHigh * 1.5);
    // the shared membrane: a shaded groove with a bright line along it, the
    // way a cell junction reads under dark-field light
    cyto *= 0.52 + 0.48 * wall;
    emis = mix(uPal0, vec3(1.0), 0.45) * 0.30 * pow(1.0 - wall, 3.0);
    return cyto;
  }
  vec3 formAlbedo(vec3 p, vec3 n, int f, out vec3 emis, out float gloss) {
    emis = vec3(0.0);
    gloss = 1.0;
    vec3 al = vec3(0.0);
    if (f == 0) {                                        // amoeba
      float gr = noise3(p * 17.0 + vec3(0.0, uTime * 0.12, 0.0));
      float gr2 = noise3(p * 44.0 - uTime * 0.05);
      float core = smoothstep(0.78, 0.18, length(p));     // granules crowd the endoplasm
      al = mix(mix(uPal2, vec3(1.0), 0.62), mix(uPal3, uPal4, 0.35), core * (0.5 + 0.5 * gr));
      al *= 0.8 + 0.36 * gr2;
    } else if (f == 1) {                                 // paramecium
      vec3 q = p; q.y += 0.15 * q.x * q.x - 0.05;
      float rows = 0.5 + 0.5 * cos(atan(q.z, q.y) * 17.0);
      float wave = 0.5 + 0.5 * sin(q.x * 19.0 - uFlow * 3.4);
      emis += mix(uPal0, vec3(1.0), 0.6) * rows * wave * 0.16 * (1.0 - abs(n.x));
      al = mix(mix(uPal2, uPal3, 0.4), vec3(1.0), 0.42) * (0.86 + 0.2 * noise3(p * 26.0));
    } else if (f == 2) {                                 // euglena
      // the pellicle's helical striations, chloroplast discs beneath them,
      // the eyespot beside the reservoir, and a clear hyaline flagellum
      float strip = 0.5 + 0.5 * sin(atan(p.z, p.x) * 11.0 + p.y * 15.0);
      float disc = smoothstep(0.42, 0.72, noise3(p * 15.0));
      vec3 chl = mix(uPal2, vec3(1.0), 0.35);
      al = mix(mix(uPal4, vec3(1.0), 0.62), chl, disc * 0.7) * (0.88 + 0.30 * strip);
      float fl = smoothstep(0.60, 0.80, p.y) * smoothstep(0.30, 0.16, length(p.xz));
      al = mix(al, mix(uPal2, vec3(1.0), 0.75), fl);
      emis += mix(uPal2, vec3(1.0), 0.8) * fl * 0.40;
      emis += mix(uPal3, uPal0, 0.25) * 2.2 * smoothstep(0.15, 0.04, length(p - vec3(0.06, 0.44, 0.20)));
    } else if (f == 3) {                                 // diatom
      gloss = 2.4;
      vec3 q = diaSpace(p);
      float rr = length(q.xz);
      float pore = smoothstep(0.050, 0.020, hexDist(q.xz, 0.112));
      float cost = 0.5 + 0.5 * cos(atan(q.z, q.x) * 26.0);
      al = mix(uPal2, vec3(1.0), 0.72) * (0.7 + 0.5 * cost * smoothstep(0.2, 0.68, rr));
      emis += mix(uPal2, vec3(1.0), 0.85) * pore * 0.22 * smoothstep(0.09, 0.14, abs(q.y));
    } else if (f == 4) {                                 // radiolarian
      gloss = 2.0;
      float lp = length(p);
      float capsule = smoothstep(0.34, 0.26, lp);
      al = mix(mix(uPal2, vec3(1.0), 0.7), mix(uPal1, uPal0, 0.4), capsule) * (0.85 + 0.25 * noise3(p * 21.0));
      emis += mix(uPal0, vec3(1.0), 0.4) * 0.20 * smoothstep(0.62, 0.74, lp);
    } else {                                             // sponge
      vec3 sq = spgSpace(p);
      vec3 q = sq * 7.0;
      float pr = length(q - floor(q + 0.5)) / 7.0;
      float ost = smoothstep(0.075, 0.048, pr);
      al = mix(mix(uPal2, uPal4, 0.35), vec3(1.0), 0.30) * (0.8 + 0.3 * noise3(p * 15.0));
      emis += mix(uPal0, vec3(1.0), 0.35) * ost * 0.10;
      // the osculum's throat, lit from inside
      emis += mix(uPal2, vec3(1.0), 0.9) * 0.45 * smoothstep(0.55, 0.86, sq.y) * smoothstep(0.55, 0.30, length(sq.xz));
    }
    return al;
  }
  vec3 organTintOf(vec3 p, int f) {
    if (f == 2) {
      // the eyespot burns beside the reservoir; the rest is chloroplast
      float eye = smoothstep(0.11, 0.03, length(p - vec3(0.06, 0.44, 0.20)));
      return mix(mix(uPal2, uPal3, 0.55), mix(uPal0, vec3(1.0), 0.3), eye);
    }
    if (f == 1) return mix(uPal1, vec3(1.0), 0.25);
    if (f == 3) return mix(uPal3, uPal2, 0.4);
    if (f == 5) return mix(uPal2, vec3(1.0), 0.8);
    return mix(uPal1, uPal0, 0.2);
  }
  // the organelle tint follows the SAME blend the body does; switching forms
  // on a hard threshold at half way flicked the euglena's eyespot out in one
  // frame in the middle of an otherwise continuous crossing
  vec3 organTint(vec3 p) {
    vec3 t = organTintOf(p, uFormA);
    if (uFormF > 0.002) t = mix(t, organTintOf(p, uFormB), uFormF);
    return t;
  }

  // The two marches carry their OWN bounding radii. One number for both made
  // the drawn zona jump 35 % wide in a single frame the instant a protist
  // stage came into range, while its weight was still zero and nothing of it
  // was drawn, because the bound was gated on the form being selected rather
  // than on the form being visible.
  uniform float uBound, uBoundF;

  // ---- the specimen: bound, refract at the zona, march, light ---------------
  // mode 0 marches the cell aggregate, mode 1 the analytic form; the level
  // weighs the two calls against each other, and the plate glow and the
  // colony's fringe are drawn in both because those weights sum to one. The
  // ZONA is the embryo's own shell and is drawn round the cell march only.
  vec3 specimen(vec3 ro, vec3 rd, vec3 E, int mode) {
    vec3 col = vec3(0.0);
    float bnd = mode == 0 ? uBound : uBoundF;
    vec3 roL = ro - E;
    float dC = length(cross(roL, rd));
    vec3 zonaTint = mix(uPal2, vec3(1.0), 0.6);
    col += zonaTint * 0.05 * exp(-(dC - bnd) * 5.0) * step(bnd, dC) * (0.6 + 0.4 * uLevelA);

    // the flagellar fringe of a Volvox colony: hairs standing off the wall,
    // beating in a metachronal wave round the sphere
    if (uFringe > 0.0) {
      vec3 cp = roL - rd * dot(roL, rd);
      // the hairs stand in fixed rows round the limb; only the beat travels,
      // and it travels DOWN the colony, so the fringe never turns by itself
      float hair = pow(0.5 + 0.5 * sin(atan(cp.y, cp.x) * 72.0), 3.0);
      float beat = 0.55 + 0.45 * sin(cp.y * 24.0 - uFlow * 2.6);
      float band = exp(-max(0.0, dC - uFringeR) * 52.0) * step(uFringeR * 0.99, dC);
      col += mix(uPal2, vec3(1.0), 0.6) * hair * beat * band * uFringe * 0.26;
      // the glassy matrix the colony's cells are embedded in
      float eg;
      float tg = iSphere(roL, rd, vec3(0.0), uFringeR, eg);
      if (tg > 0.0) {
        vec3 ng = normalize(roL + rd * tg);
        float fr = pow(1.0 - max(dot(ng, -rd), 0.0), 4.0);
        col += mix(uPal2, vec3(1.0), 0.7) * (fr * 0.15 + 0.012) * uFringe;
      }
    }

    float eb;
    float tb = iSphere(roL, rd, vec3(0.0), bnd, eb);
    // the hand can dolly the eye inside a long specimen's bounding sphere,
    // then the march simply starts at the eye
    bool inSphere = dot(roL, roL) < bnd * bnd;
    if (tb <= 0.0 && !inSphere) return col;
    if (inSphere) { tb = 0.0; eb = 1.0; }
    float zw = (inSphere || mode == 1) ? 0.0 : uZonaW;
    vec3 pb = roL + rd * tb;
    vec3 nb = normalize(pb);
    float fz = pow(1.0 - max(dot(nb, -rd), 0.0), 3.0);
    vec3 rdi = normalize(mix(rd, refract(rd, nb, 1.0 / 1.10), zw));

    // The cull has to run in the SAME space the field is evaluated in: press
    // squeezes the march point inside mapSpec, so the ray is squeezed here too
    // before the cell list is built. Culling the unsqueezed ray against the
    // squeezed body dropped cells near the poles and punched holes in it.
    vec3 sqv = vec3(1.0, 1.0 + uPress * 0.22, 1.0);
    if (mode == 0) cullCells(pb * sqv, normalize(rdi * sqv));
    else gN = 0;
    vec3 p = pb;
    float t = 0.0;
    bool hit = false;
    float tExit = 2.0 * bnd + 0.2;
    for (int i = 0; i < uSpecSteps; i++) {
      float d = mapSpec(p, mode);
      if (d < 0.0018) { hit = true; break; }
      t += d * 0.85;
      if (t > tExit) break;
      p = pb + rdi * t;
    }

    vec3 inner = vec3(0.0);
    if (hit) {
      vec3 q0 = p;
      vec3 n = normalSpec(q0, mode);
      vec3 L = normalize(vec3(-0.55, 0.7, 0.5));
      vec3 L2 = normalize(vec3(0.7, -0.3, 0.4));
      vec3 alb = vec3(0.0), emis = vec3(0.0);
      float gloss = 1.0;
      vec3 qs = q0 * sqv;                 // the hit point in the field's own space
      float sd = 0.0, wallv = 1.0;
      if (mode == 0) {
        if (gN > 0) {
          sd = cellSeed(qs, wallv);
          alb = cellAlbedo(qs, sd, wallv, emis);
        }
      } else {
        float g1;
        vec3 qf = q0 / uFormScale;
        alb = formAlbedo(qf, n, uFormA, emis, g1);
        if (uFormF > 0.002) {
          vec3 e2; float g2;
          vec3 a2 = formAlbedo(qf, n, uFormB, e2, g2);
          alb = mix(alb, a2, uFormF);
          emis = mix(emis, e2, uFormF);
          g1 = mix(g1, g2, uFormF);
        }
        gloss = g1;
      }

      float wrap = dot(n, L) * 0.5 + 0.5;
      float lit = wrap * wrap;
      float rim = pow(1.0 - max(dot(n, -rdi), 0.0), 2.0);
      vec3 sss = mix(uPal4, uPal3, 0.5) * (0.35 * rim + 0.25 * pow(max(dot(rdi, L), 0.0), 3.0));
      float spec = pow(max(dot(reflect(-L, n), -rdi), 0.0), 60.0 * gloss) * 0.45 * gloss
        + pow(max(dot(reflect(-L2, n), -rdi), 0.0), 30.0 * gloss) * 0.12;
      inner = alb * (0.12 + 0.88 * lit) + sss + vec3(spec) + uPal0 * rim * 0.25 + emis;

      // ---- organelles, seen through the body. They are LIT BODIES, not flat
      // stamped discs: each takes a normal, the same two-light rig as the
      // membrane, a rim, a wet highlight and a Beer term for the cytoplasm it
      // is seen under. A cell's nucleus is the OWNING cell's own sphere, hit
      // analytically, so its silhouette is the sphere's own antialiased edge
      // and no neighbour's nucleus prints through the wall in front of it.
      if (mode == 0 && gN > 0) {
        vec4 own = uCells[int(sd + 0.5)];
        vec3 rs = normalize(rdi * sqv);
        float en;
        float tn = iSphere(qs, rs, own.xyz, own.w * 0.38, en);
        if (tn > 0.0) {
          vec3 pn = qs + rs * tn;
          vec3 nn = normalize((pn - own.xyz) * sqv);
          float nl = dot(nn, L) * 0.5 + 0.5;
          vec3 nt = mix(uPal1, uPal0, 0.2);
          vec3 oc = nt * (0.18 + 0.82 * nl * nl) * (0.78 + 0.32 * noise3(pn * 9.0));
          oc += nt * pow(1.0 - max(dot(nn, -rdi), 0.0), 2.0) * 0.42
              + vec3(1.0) * pow(max(dot(reflect(-L, nn), -rdi), 0.0), 44.0) * 0.10;
          // the nucleolus: a denser body inside the nucleus
          oc = mix(oc, uPal1 * 0.45, smoothstep(0.55, 0.9, noise3(pn * 18.0 + 3.0)) * 0.55);
          float aaN = smoothstep(0.0, max(fwidth(en) * 1.5, 0.0001), en);
          inner = mix(inner, oc, aaN * exp(-tn * 2.6) * 0.70);
        }
      } else if (mode == 1) {
        float tn = 0.02, depth = 0.02, minD = 1e9;
        vec3 qb = q0;
        for (int j = 0; j < uNSteps; j++) {
          vec3 q = q0 + rdi * tn;
          float dn = mapOrgan(q);
          if (dn < minD) { minD = dn; qb = q; depth = tn; }
          if (dn < 0.0025) break;
          if (mapSpec(q, 1) > 0.02) break;
          tn += max(dn * 0.9, 0.012);
        }
        // the silhouette fades where the short march only grazes the body,
        // instead of cutting off hard wherever it happened to converge
        float cover = 1.0 - smoothstep(0.0, 0.05, minD);
        if (cover > 0.002) {
          vec3 no = normalOrgan(qb);
          float nl = dot(no, L) * 0.5 + 0.5;
          vec3 nt = organTint(qb / uFormScale);
          vec3 oc = nt * (0.20 + 0.80 * nl * nl) * (0.78 + 0.32 * noise3(qb * 9.0));
          oc += nt * pow(1.0 - max(dot(no, -rdi), 0.0), 2.0) * 0.38
              + vec3(1.0) * pow(max(dot(reflect(-L, no), -rdi), 0.0), 48.0) * 0.12;
          inner = mix(inner, oc, cover * exp(-depth * 2.5) * 0.62);
        }
      }

      // the blastocoel: the fluid the shell of cells encloses, lit by its chord
      if (mode == 0 && uCavity > 0.002) {
        float b = dot(q0, rdi);
        if (b < 0.0) {
          inner += mix(uPal2, vec3(1.0), 0.5) * uCavity * chord(q0, rdi, uCavR) * 0.19 * (0.75 + 0.35 * uBass);
        }
      }
      // daughter colonies sitting inside a Volvox sphere
      if (mode == 0) {
        for (int i = 0; i < 4; i++) {
          if (float(i) >= uDaughN) break;
          vec4 dg = uDaugh[i];
          float e2;
          float td = iSphere(q0, rdi, dg.xyz, dg.w, e2);
          if (td > 0.0) {
            vec3 pn = normalize(q0 + rdi * td - dg.xyz);
            float cellPat = smoothstep(0.30, 0.06, hexDist(vec2(atan(pn.z, pn.x) * 0.9, pn.y * 1.6), 0.34));
            inner += mix(uPal3, vec3(1.0), 0.35) * (0.07 + 0.20 * cellPat) * uCavity;
          }
        }
      }
      inner *= 1.0 + uBeat * 0.12;
    }

    float ringZ = exp(-pow((dC - bnd * 0.965) / (bnd * 0.018), 2.0));
    float aa = smoothstep(0.0, max(fwidth(eb) * 1.5, 0.0001), eb);
    vec3 shell = zonaTint * (fz * 0.55 + 0.035) * (0.6 + 0.4 * uLevelA) + zonaTint * ringZ * 0.22;
    col += inner * (0.92 - 0.25 * fz * zw) + shell * zw * aa;
    return col;
  }

  // ---- the plate: a dark-field disc with a thin bright rim and a halo outside
  vec3 plate(float r) {
    vec3 tint = mix(uPal2, vec3(1.0), 0.5);
    float inside = 1.0 - smoothstep(uDish * 0.985, uDish, r);
    float rim = exp(-pow((r - uDish * 0.992) / (uDish * 0.012), 2.0));
    float halo = exp(-(r - uDish) * 6.0) * step(uDish, r);
    return tint * (0.012 * inside + rim * 0.26 + halo * 0.04) * (0.6 + 0.4 * uLevelA);
  }

  // ---- the slime mold: the trail map lit as a plasmodium on its plate
  vec3 slimeMold(vec3 ro, vec3 rd, vec3 E) {
    vec3 col = vec3(0.0);
    float tp = (E.z - ro.z) / rd.z;
    if (tp <= 0.0) return col;
    vec2 q = (ro + rd * tp).xy - E.xy;
    float r = length(q);
    col += plate(r);
    float inside = 1.0 - smoothstep(uDish * 0.985, uDish, r);
    if (inside <= 0.0) return col;
    // the oat flakes: speckled scraps of substrate the veins anchor to. A
    // flake out of reach is a dull husk the dark field still picks out; the
    // moment the colony arrives it lights, which is how the network's targets
    // read on the plate.
    for (int i = 0; i < 10; i++) {
      if (float(i) >= uFoodN) break;
      vec4 fd = uFood[i];
      vec2 dq = q - fd.xy;
      float fr = length(dq / vec2(fd.z, fd.z * 0.72));
      float m = smoothstep(1.0, 0.42, fr);
      float rimF = smoothstep(1.05, 0.86, fr) * smoothstep(0.62, 0.9, fr);
      float speck = 0.45 + 0.55 * noise3(vec3(dq * 70.0, 0.0));
      vec3 husk = mix(uPal2, vec3(1.0), 0.45);
      col += husk * (m * speck * 0.09 + rimF * 0.16);
      col += mix(uPal1, vec3(1.0), 0.55) * m * speck * 0.55 * fd.w * (1.0 + uBeat * 0.5);
    }
    vec2 uvT = q / (2.0 * uDish) + 0.5;
    float tr = texture(uTrail, uvT).r;
    float tx = texture(uTrail, uvT + vec2(uTexel, 0.0)).r - texture(uTrail, uvT - vec2(uTexel, 0.0)).r;
    float ty = texture(uTrail, uvT + vec2(0.0, uTexel)).r - texture(uTrail, uvT - vec2(0.0, uTexel)).r;
    // fans where the trail is faint, veins where the flow concentrates, a
    // brighter ridge along the thickest flow
    float body = smoothstep(0.025, 0.2, tr);
    float vein = pow(smoothstep(0.14, 0.8, tr), 1.3);
    float ridge = smoothstep(0.6, 0.98, tr);
    vec3 n = normalize(vec3(-tx * 16.0, -ty * 16.0, 1.0));
    vec3 L = normalize(vec3(-0.5, 0.65, 0.6));
    float wrap = dot(n, L) * 0.5 + 0.5;
    float spec = pow(max(dot(reflect(-L, n), -rd), 0.0), 48.0);
    float gr = noise3(vec3(q * 26.0, uTime * 0.08));
    float stream = 0.82 + 0.18 * sin(uFlow - tr * 7.0 + gr * 2.5);
    // the species tint: where this strain sits between the palette's stops
    vec3 cyto = mix(mix(uPal3, uPal4, uTintA), vec3(1.0), 0.22);
    vec3 fan = mix(uPal3, uPal0, 0.25 + 0.6 * uTintB);
    vec3 plasm = fan * body * (0.16 + 0.24 * wrap) * (0.8 + 0.3 * gr)
      + cyto * vein * (0.3 + 0.55 * wrap * wrap) * stream * (0.9 + 0.2 * gr) * (1.0 + uBass * 0.3)
      + mix(cyto, vec3(1.0), 0.4) * ridge * 0.35 * stream
      + vec3(1.0) * spec * vein * 0.35
      + mix(uPal4, uPal3, 0.5) * vein * 0.14 * (1.0 + uBeat * 0.9);
    plasm *= 1.0 + uHigh * 0.25 * gr;
    col += plasm * inside;
    return col;
  }

  // ---- the mycelium's plate and spore (the hyphae are the second draw call)
  vec3 mycPlate(vec3 ro, vec3 rd, vec3 E) {
    vec3 col = vec3(0.0);
    float tp = (E.z - ro.z) / rd.z;
    if (tp > 0.0) col += plate(length((ro + rd * tp).xy - E.xy));
    vec3 sporeTint = mix(uPal1, uPal0, 0.4);
    float dC = length(cross(ro - E, rd));
    col += sporeTint * 0.3 * exp(-dC * 9.0) * (1.0 + uBeat * 0.4);
    float e;
    float ts = iSphere(ro, rd, E, 0.075, e);
    if (ts > 0.0) {
      vec3 n = normalize(ro + rd * ts - E);
      vec3 L = normalize(vec3(-0.5, 0.65, 0.6));
      float lit = max(dot(n, L), 0.0);
      float rim = pow(1.0 - max(dot(n, -rd), 0.0), 2.5);
      vec3 sc = sporeTint * (0.3 + 0.7 * lit) * (0.9 + 0.2 * noise3(n * 12.0)) + vec3(rim * 0.45);
      col = mix(col, sc, smoothstep(0.0, max(fwidth(e) * 1.5, 0.0001), e));
    }
    return col;
  }

  // ---- the helix's dark-field column: scattered light round the molecule
  vec3 helixField(vec3 ro, vec3 rd, vec3 E) {
    vec3 oc = ro - E;
    vec3 ax = vec3(0.0, 1.0, 0.0);
    vec3 nn = cross(rd, ax);
    float ln = length(nn);
    float dl = ln > 1e-4 ? abs(dot(oc, nn / ln)) : length(cross(oc, ax));
    // the column sickens with the molecule under the toxin
    vec3 tint = mix(mix(uPal2, vec3(1.0), 0.55), uCold, uSick * 0.7);
    float haze = noise3(vec3(oc.xy * 3.0, uTime * 0.05));
    return tint * (0.11 * exp(-dl * 3.0) + 0.012 * haze) * (0.55 + 0.45 * uLevelA) * (1.0 + uBeat * 0.25);
  }

  // ---- phagocytosis: a macrophage throwing pseudopods round a smaller cell,
  // sealing it into a phagosome, drawing it in and digesting it. One smooth
  // union: the amoeboid body (an ellipsoid under slow streaming bulges, a
  // translation through the noise domain, never a turn), up to seven
  // pseudopods as chains of three tapered capsules each, and the phagosome, a
  // sphere round the prey that grows from nothing as the membrane seals. The
  // prey is a second field, taken as the min with the body's: while it is
  // outside, the ray hits it directly; once the membrane has closed over it
  // the body's surface is hit first and the prey is seen through it.
  float sdCone(vec3 p, vec3 a, vec3 b, float r1, float r2) {
    vec3 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    return length(pa - ba * h) - mix(r1, r2, h);
  }
  // The pseudopods, smooth-united into a body already at distance dBody. A
  // bounding sphere per pseudopod skips the three capsule tests, but ONLY
  // when the sphere is further from this point than the blend can reach
  // (db > dBody + k), because there smin() is exactly min() and dropping the
  // pod changes nothing. Blending against the BOUNDING SPHERE instead, which
  // is what a plain early-out does, welds a phantom skin between the body and
  // each sphere and prints concentric rings round every pseudopod's base.
  float podsInto(vec3 p, float dBody, float k) {
    for (int i = 0; i < NPOD; i++) {
      vec4 b = uPods[i * PODPTS];
      if (b.w <= 0.0) continue;
      vec4 pb = uPodB[i];
      if (length(p - pb.xyz) - pb.w > dBody + k) continue;
      vec4 p1 = uPods[i * PODPTS + 1], p2 = uPods[i * PODPTS + 2], p3 = uPods[i * PODPTS + 3];
      float dp = sdCone(p, b.xyz, p1.xyz, b.w, p1.w);
      dp = min(dp, sdCone(p, p1.xyz, p2.xyz, p1.w, p2.w));
      dp = min(dp, sdCone(p, p2.xyz, p3.xyz, p2.w, p3.w));
      dBody = smin(dBody, dp, k);
    }
    return dBody;
  }
  float dMacro(vec3 p) {
    vec3 q = p - uMacro.xyz;
    float d = sdEll(q, vec3(0.84, 0.70, 0.66));
    // the streaming bulge is a noise on the membrane; far from it the noise
    // cannot change the sign, so a conservative bound saves the eight hashes
    // at every step of the march that is still crossing empty water
    if (abs(d) < 0.26) {
      // faded out across the window, so the bound and the true field agree at
      // the seam, switching between them hard left a straight shading band
      // across the cell where the two iso-surfaces met
      float w = 1.0 - smoothstep(0.14, 0.26, abs(d));
      d += 0.07 * w * (noise3(q * 2.4 + vec3(uTime * 0.11, -uTime * 0.06, 0.0)) - 0.5) - 0.035 * (1.0 - w);
    } else d -= 0.035;
    d = podsInto(p, d, 0.17);
    if (uPhA.w > 0.001) d = smin(d, length(p - uPrey.xyz) - uPhA.w, uMacro.w);
    return d;
  }
  float dPreyF(vec3 p) {
    return sdEll(p - uPrey.xyz, vec3(uPrey.w, uPrey.w * uPhA.x, uPrey.w));
  }
  float mapPhago(vec3 p) {
    p.y *= 1.0 + uPress * 0.22;
    return min(dMacro(p), dPreyF(p));
  }
  vec3 normalPhago(vec3 p) {
    const vec2 e = vec2(0.0025, 0.0);
    return normalize(vec3(
      mapPhago(p + e.xyy) - mapPhago(p - e.xyy),
      mapPhago(p + e.yxy) - mapPhago(p - e.yxy),
      mapPhago(p + e.yyx) - mapPhago(p - e.yyx)));
  }
  // a ray against an ellipsoid, through a scaled space
  float iEll(vec3 ro, vec3 rd, vec3 c, vec3 r, out vec3 n, out float edge) {
    vec3 o = (ro - c) / r;
    vec3 d = rd / r;
    float dl = length(d);
    d /= dl;
    float t = iSphere(o, d, vec3(0.0), 1.0, edge);
    if (t < 0.0) return -1.0;
    n = normalize((o + d * t) / r);
    return t / dl;
  }
  vec3 phago(vec3 ro, vec3 rd, vec3 E) {
    vec3 col = vec3(0.0);
    vec3 roL = ro - E;
    float bnd = uPhC.w;
    roL -= uPhC.xyz;
    float dC = length(cross(roL, rd));
    col += mix(uPal2, vec3(1.0), 0.6) * 0.03 * exp(-max(dC - 1.1, 0.0) * 2.5) * (0.6 + 0.4 * uLevelA);
    float eb;
    float tb = iSphere(roL, rd, vec3(0.0), bnd, eb);
    bool inS = dot(roL, roL) < bnd * bnd;
    if (tb <= 0.0 && !inS) return col;
    if (inS) tb = 0.0;
    vec3 pb = roL + uPhC.xyz + rd * tb;
    vec3 p = pb;
    float t = 0.0;
    bool hit = false;
    float tExit = 2.0 * bnd + 0.2;
    for (int i = 0; i < uSpecSteps; i++) {
      float d = mapPhago(p);
      if (d < 0.002) { hit = true; break; }
      t += d * 0.85;
      if (t > tExit) break;
      p = pb + rd * t;
    }
    if (!hit) return col;
    vec3 n = normalPhago(p);
    vec3 sqv = vec3(1.0, 1.0 + uPress * 0.22, 1.0);
    vec3 ps = p * sqv;                       // the hit in the field's own space
    vec3 rds = normalize(rd * sqv);
    vec3 L = normalize(vec3(-0.55, 0.7, 0.5));
    vec3 L2 = normalize(vec3(0.7, -0.3, 0.4));
    float wrap = dot(n, L) * 0.5 + 0.5;
    float lit = wrap * wrap;
    float rim = pow(1.0 - max(dot(n, -rd), 0.0), 2.0);
    float spec = pow(max(dot(reflect(-L, n), -rd), 0.0), 60.0) * 0.45
      + pow(max(dot(reflect(-L2, n), -rd), 0.0), 30.0) * 0.12;
    vec3 preyTint = mix(mix(uPal0, uPal2, 0.45), vec3(1.0), 0.42);
    vec3 inner;
    if (dPreyF(ps) < dMacro(ps)) {
      // the prey, still outside: a smaller cell of its own tint
      float gr = noise3(ps * 30.0 + uTime * 0.05);
      vec3 alb = preyTint * (0.85 + 0.25 * gr);
      inner = alb * (0.12 + 0.88 * lit) + mix(uPal0, uPal2, 0.5) * 0.3 * rim + vec3(spec) + uPal0 * rim * 0.2;
      float en;
      float tn = iSphere(ps, rds, uPrey.xyz, uPrey.w * 0.40, en);
      if (tn > 0.0) {
        vec3 nn = normalize(ps + rds * tn - uPrey.xyz);
        float nl = dot(nn, L) * 0.5 + 0.5;
        vec3 nt = mix(uPal1, uPal0, 0.35);
        vec3 oc = nt * (0.18 + 0.82 * nl * nl) * (0.8 + 0.3 * noise3(ps * 9.0));
        oc += nt * pow(1.0 - max(dot(nn, -rds), 0.0), 2.0) * 0.4;
        float aaN = smoothstep(0.0, max(fwidth(en) * 1.5, 0.0001), en);
        inner = mix(inner, oc, aaN * exp(-tn * 2.6) * 0.7);
      }
    } else {
      // the macrophage: granular cytoplasm under the same two-light rig as the cells
      float gr = noise3(ps * 14.0 + vec3(0.0, uTime * 0.05, 0.0));
      float gr2 = noise3(ps * 42.0 + uTime * 0.02);
      vec3 alb = mix(mix(uPal3, uPal4, 0.35), vec3(1.0), 0.28) * (0.85 + 0.22 * gr + 0.10 * gr2 * (1.0 + uHigh * 1.5));
      vec3 sss = mix(uPal4, uPal3, 0.5) * (0.35 * rim + 0.25 * pow(max(dot(rd, L), 0.0), 3.0));
      inner = alb * (0.12 + 0.88 * lit) + sss + vec3(spec) + uPal0 * rim * 0.25;
      // seen through the body: the prey in its phagosome, dissolving as it is
      // digested; the phagosome's wall; the nucleus pushed aside
      if (uPhA.y < 0.995) {
        float tn = 0.02, depth = 0.02, minD = 1e9;
        vec3 qb = ps;
        for (int j = 0; j < uNSteps; j++) {
          vec3 q = ps + rds * tn;
          float dn = dPreyF(q);
          if (dn < minD) { minD = dn; qb = q; depth = tn; }
          if (dn < 0.0025) break;
          if (dMacro(q) > 0.02) break;
          tn += max(dn * 0.9, 0.012);
        }
        float cover = (1.0 - smoothstep(0.0, 0.04, minD)) * (1.0 - uPhA.y);
        if (cover > 0.002) {
          vec3 no = normalize(qb - uPrey.xyz);
          float nl = dot(no, L) * 0.5 + 0.5;
          vec3 nt = mix(preyTint, mix(uPal2, vec3(1.0), 0.5), uPhA.y);
          vec3 oc = nt * (0.2 + 0.8 * nl * nl) * (0.8 + 0.3 * noise3(qb * 12.0));
          oc += nt * pow(1.0 - max(dot(no, -rds), 0.0), 2.0) * 0.38;
          inner = mix(inner, oc, cover * exp(-depth * 2.2) * 0.7);
        }
      }
      if (uPhA.z > 0.002) {
        float ev;
        float tv = iSphere(ps, rds, uPrey.xyz, uPhA.z, ev);
        if (tv > 0.0) {
          vec3 nv = normalize(ps + rds * tv - uPrey.xyz);
          float fr = pow(1.0 - max(dot(nv, -rds), 0.0), 3.0);
          float aaV = smoothstep(0.0, max(fwidth(ev) * 1.5, 0.0001), ev);
          inner += mix(uPal2, vec3(1.0), 0.5) * (fr * 0.4 + 0.05) * aaV * exp(-tv * 1.8) * 0.8;
        }
      }
      {
        vec3 nn; float en;
        float tn = iEll(ps, rds, uPhB.xyz, vec3(uPhB.w * 1.25, uPhB.w, uPhB.w * 0.9), nn, en);
        if (tn > 0.0) {
          float nl = dot(nn, L) * 0.5 + 0.5;
          vec3 nt = mix(uPal1, uPal0, 0.2);
          vec3 oc = nt * (0.18 + 0.82 * nl * nl) * (0.78 + 0.32 * noise3((ps + rds * tn) * 9.0));
          oc += nt * pow(1.0 - max(dot(nn, -rds), 0.0), 2.0) * 0.42;
          oc = mix(oc, uPal1 * 0.45, smoothstep(0.55, 0.9, noise3((ps + rds * tn) * 18.0 + 3.0)) * 0.55);
          float aaN = smoothstep(0.0, max(fwidth(en) * 1.5, 0.0001), en);
          inner = mix(inner, oc, aaN * exp(-tn * 2.4) * 0.62);
        }
      }
    }
    inner *= 1.0 + uBeat * 0.12;
    col += inner;
    return col;
  }

  // ---- decomposition: the dead tissue on its plate. The cell machinery
  // marches the mass exactly as it marches the embryo (culled per ray); pits
  // eat into the surface on a noise the sway moves through; bacteria speckle
  // it; the plate takes the stain; whatever has sunk below the plate is gone.
  float mapDec(vec3 p) {
    float d = dCells(p);
    // the pits are a noise on the surface; away from it the same conservative
    // bound as the macrophage's membrane keeps the march honest and cheap
    if (uDec.y > 0.002 && d < 0.22) {
      float w = 1.0 - smoothstep(0.10, 0.22, d);   // faded out across the window, as the macrophage's is
      d += w * uDec.y * 0.10 * smoothstep(0.40, 0.80, noise3(p * 8.0 + vec3(uJig * 3.0, 1.7, uJig * 2.0)));
    }
    return d;
  }
  vec3 normalDec(vec3 p) {
    const vec2 e = vec2(0.0025, 0.0);
    return normalize(vec3(
      mapDec(p + e.xyy) - mapDec(p - e.xyy),
      mapDec(p + e.yxy) - mapDec(p - e.yxy),
      mapDec(p + e.yyx) - mapDec(p - e.yyx)));
  }
  vec3 decomp(vec3 ro, vec3 rd, vec3 E) {
    vec3 base = vec3(0.0);
    float tp = (E.z - ro.z) / rd.z;
    if (tp > 0.0) {
      vec2 q = (ro + rd * tp).xy - E.xy;
      float r = length(q);
      base += plate(r);
      if (uDec2.y > 0.002) {
        // the stain the body leaves on the substrate: an ashen splotch under
        // where it lay, ragged at its edge, mottled, with a second lobe
        // spreading off it where the fragments went
        float sn = noise3(vec3(q * 2.6, 4.2));
        float R = uDec2.x * (0.82 + 0.4 * sn);
        float sm = smoothstep(R, R * 0.22, r);
        vec2 q2 = q - vec2(0.42, -0.26);
        sm = max(sm, smoothstep(R * 0.72, R * 0.16, length(q2)) * 0.75);
        // two octaves: one sample of a value noise this soft shows its lattice
        // as squares across a stain this wide
        float mott = 0.45 + 0.85 * (0.62 * noise3(vec3(q * 6.3, 1.0)) + 0.38 * noise3(vec3(q * 15.7 + 2.7, 4.1)));
        base += mix(uAsh, uPal2, 0.3) * uDec2.y * sm * 0.30 * mott;
      }
    }
    vec3 roL = ro - E;
    float bnd = uDec2.w;
    float eb;
    float tb = iSphere(roL, rd, vec3(0.0), bnd, eb);
    bool inS = dot(roL, roL) < bnd * bnd;
    if (tb <= 0.0 && !inS) return base;
    if (inS) tb = 0.0;
    vec3 pb = roL + rd * tb;
    cullCells(pb, rd);
    if (gN == 0) return base;
    vec3 p = pb;
    float t = 0.0;
    bool hit = false;
    float tExit = 2.0 * bnd + 0.2;
    for (int i = 0; i < uSpecSteps; i++) {
      float d = mapDec(p);
      if (d < 0.002) { hit = true; break; }
      t += d * 0.85;
      if (t > tExit || p.z < -0.02) break;
      p = pb + rd * t;
    }
    if (!hit || p.z < 0.0) return base;
    vec3 n = normalDec(p);
    float wall;
    float sd = cellSeed(p, wall);
    vec3 L = normalize(vec3(-0.55, 0.7, 0.5));
    float nz = noise3(p * 8.0 + vec3(uJig * 3.0, 1.7, uJig * 2.0));
    float pit = smoothstep(0.40, 0.80, nz) * uDec.y;
    float gr = noise3(p * 13.0);
    float gr2 = noise3(p * 40.0);
    float tint = h11(sd * 3.17 + 1.0);
    vec3 cyto = mix(mix(uPal3, uPal4, 0.15 + 0.45 * tint), vec3(1.0), 0.25) * (0.85 + 0.22 * gr + 0.10 * gr2);
    vec3 ash = mix(uAsh, vec3(0.34), 0.55);
    vec3 alb = mix(cyto, ash * (0.80 + 0.3 * gr), uDec.w);
    alb *= 0.55 + 0.45 * wall;               // the cell junctions still show on the fresh corpse
    alb *= 1.0 - 0.45 * pit;                 // the pits are dark
    float gloss = 1.0 - 0.8 * uDec.x;        // wet and glossy fresh, matte once the turgor is gone
    float wrap = dot(n, L) * 0.5 + 0.5;
    float lit = wrap * wrap;
    float rim = pow(1.0 - max(dot(n, -rd), 0.0), 2.0);
    vec3 sss = mix(uPal4, uPal3, 0.5) * (0.3 * rim) * (1.0 - 0.8 * uDec.w);
    float spec = pow(max(dot(reflect(-L, n), -rd), 0.0), 50.0) * 0.4 * gloss;
    vec3 inner = alb * (0.12 + 0.88 * lit) + sss + vec3(spec) + mix(uPal0, ash, uDec.w) * rim * 0.2;
    // bacteria: fine specks in colonies, a coarse noise sets where a patch has
    // taken hold, a fine one the individual cells inside it, thickest in the pits
    float colony = smoothstep(0.42, 0.72, noise3(p * 5.5 + 11.0));
    float sp = noise3(p * 120.0 + 7.0);
    float speck = smoothstep(0.74, 0.86, sp) * uDec.z * colony * (0.5 + 0.7 * pit);
    inner += mix(uPal1, vec3(1.0), 0.5) * speck * 0.55 * (1.0 + uBeat * 0.4);
    inner *= 1.0 + uBeat * 0.1;
    return inner;
  }

  void main() {
    vec2 uv = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
    vec3 ro = vec3(0.0, 0.0, uDist);
    vec3 rd = normalize(vec3(uv * 1.05, -1.0));
    vec3 E = vec3(uPan.x, uPan.y, 0.0); // the specimen, panned by the hand
    vec3 col = vec3(0.0);
    if (uOrg.x > 0.002) col += mycPlate(ro, rd, E) * uOrg.x;
    if (uOrg.y > 0.002) col += slimeMold(ro, rd, E) * uOrg.y;
    if (uOrg.z > 0.002) {
      // the cell aggregate and the analytic form are marched separately and
      // weighed against each other; the weights always sum to one
      float wc = clamp(uCellW, 0.0, 1.0);
      float wf = uProtW * (1.0 - wc);
      vec3 sp = vec3(0.0);
      if (wc > 0.002) sp += specimen(ro, rd, E, 0) * wc;
      if (wf > 0.002) sp += specimen(ro, rd, E, 1) * wf;
      col += sp * uOrg.z;
    }
    if (uOrg.w > 0.002) col += helixField(ro, rd, E) * uOrg.w;
    if (uOrg2.x > 0.002) col += helixField(ro, rd, E) * uOrg2.x;
    if (uOrg2.y > 0.002) col += phago(ro, rd, E) * uOrg2.y;
    if (uOrg2.z > 0.002) col += decomp(ro, rd, E) * uOrg2.z;
    fragColor = vec4(col * uIntensity, 1.0);
  }
`;

// ------------------------------------------------------------- the hyphae
// Screen-space capsules from aP0 to aP1 (plate-local, the same pinhole as the
// quad: a point at depth d = uDist − z lands at uv = xy / (1.05 d)), so the
// tubes sit exactly on the plate the quad draws. aInfo carries the generation
// with a cord flag added at +32, the cap kind (0 none, 1 apex, 2 sporangium,
// 3 anastomosis), a per-segment random and the growth step it was laid at.
const MYC_VERT = /* glsl */ `
  uniform vec2 uRes, uPan;
  uniform float uDist, uPress, uBass, uCount, uTotal, uWeight, uThick;
  // under decomposition the hyphae climb the dead mass: every endpoint is
  // lifted to the top of the tissue's cells beneath it (the same cell list the
  // quad marches), so the network follows the body as it slumps and sinks
  uniform vec4 uBody[MAXC];
  uniform float uBodyN, uLift;
  uniform int uMaxC;
  in vec2 aQuad;  // per vertex: side -1..1, along 0 (start) .. 1 (end)
  in vec3 aP0;
  in vec3 aP1;
  in vec4 aInfo;
  out vec2 vQ;
  out float vLenR, vTip, vA, vGen, vRnd, vKind;
  float lift(vec2 xy) {
    float h = 0.0;
    for (int i = 0; i < uMaxC; i++) {
      if (float(i) >= uBodyN) break;
      vec4 c = uBody[i];
      vec2 d = xy - c.xy;
      float hh = c.w * c.w - dot(d, d);
      if (hh > 0.0) h = max(h, c.z + sqrt(hh) + 0.012);
    }
    return h;
  }
  vec2 toUv(vec3 p) {
    if (uLift > 0.5) p.z = max(p.z, lift(p.xy));
    p.y /= 1.0 + uPress * 0.22; // press squashes the colony like the embryo
    float d = max(uDist - p.z, 0.3);
    return (p.xy + uPan) / (1.05 * d);
  }
  void main() {
    float id = float(gl_InstanceID);
    float vis = step(id + 0.5, uCount);
    float gen = mod(aInfo.x, 32.0);
    float cord = step(32.0, aInfo.x);      // a rhizomorph strand runs thicker
    float kind = aInfo.y;
    vec2 s0 = toUv(aP0);
    vec2 s1 = toUv(aP1);
    float aspect = uRes.x / uRes.y;
    vec2 d = s1 - s0;
    float len = length(d);
    vec2 dir = len > 0.00001 ? d / len : vec2(1.0, 0.0);
    vec2 nrm = vec2(-dir.y, dir.x);
    float depth = uDist - 0.5 * (aP0.z + aP1.z);
    float pxH = 1.0 / uRes.y;
    // radius in height units: thicker main hyphae and cords, thinner branches,
    // a swollen head on a sporangium, bass swells them all
    float radPx = uThick * pow(0.87, gen) * (1.0 + cord * 1.15) * (3.4 / depth) * (1.0 + uBass * 0.3);
    radPx *= (kind > 1.5 && kind < 2.5) ? 3.2 : 1.0;
    float rad = max(radPx, 0.9) * pxH;
    vLenR = len / rad;
    // segments butt flat against each other (no additive doubling at the
    // joints); only a hypha's last segment (its apex) gets a round cap
    float cap = step(0.5, kind);
    vec2 pos = mix(s0, s1 + dir * rad * cap, aQuad.y) + nrm * aQuad.x * rad;
    vec2 ndc = pos / vec2(aspect, 1.0) * 2.0;
    gl_Position = vec4(ndc * vis, vis > 0.5 ? 0.0 : 2.0, 1.0);
    vQ = vec2(aQuad.x, aQuad.y * (vLenR + cap));
    // the growth front glows as the apices; once grown, the true tips do
    float front = smoothstep(uCount - 70.0, uCount, id);
    vTip = max(front, step(0.5, kind) * smoothstep(uTotal * 0.97, uTotal, uCount));
    vGen = gen;
    vRnd = aInfo.z;
    vKind = kind;
    vA = uWeight * vis * (0.42 + 0.22 * smoothstep(4.6, 2.6, depth)) * pow(0.9, gen);
  }
`;

const MYC_FRAG = /* glsl */ `
  uniform vec3 uPal0, uPal1, uPal2;
  uniform float uIntensity, uBeat, uHigh, uTime;
  in vec2 vQ;
  in float vLenR, vTip, vA, vGen, vRnd, vKind;
  out vec4 fragColor;
  float h1(float n) { return fract(sin(n * 127.1) * 43758.5453); }
  void main() {
    float along = vQ.y; // 0 at the start, vLenR at the end, beyond it only on a capped apex
    float u = clamp(along, 0.0, vLenR);
    float dx = along - u;
    float d2 = dx * dx + vQ.x * vQ.x;
    if (d2 > 1.0) discard;
    // a glassy tube: bright core, translucent body, brighter walls
    float core = exp(-d2 * 5.0);
    float body = 1.0 - d2;
    float wall = smoothstep(0.3, 0.85, d2) * (1.0 - smoothstep(0.85, 1.0, d2));
    // septa: faint cross-walls along the hypha
    float s = fract((u + vRnd * 9.0) / 9.0);
    float sept = 1.0 - 0.18 * (1.0 - smoothstep(0.0, 0.05, abs(s - 0.5))) * step(0.5, vLenR);
    vec3 hyaline = mix(vec3(1.0), mix(uPal2, uPal0, 0.5), 0.62);
    vec3 col = hyaline * (0.22 * body + 0.55 * core + 0.4 * wall) * sept;
    // the apex: a swollen, brighter tip at the far end
    float apex = exp(-((along - vLenR) * (along - vLenR) + vQ.x * vQ.x) * 1.2) * vTip;
    col += mix(uPal0, vec3(1.0), 0.5) * apex * (1.1 + uBeat * 0.8);
    // a sporangium: a spore-speckled head; an anastomosis: a bright fusion node
    if (vKind > 1.5 && vKind < 2.5) {
      float spore = h1(floor(vQ.x * 9.0) * 31.0 + floor(along * 9.0) * 7.0 + vRnd * 51.0);
      col += mix(uPal1, vec3(1.0), 0.35) * body * (0.45 + 0.85 * spore) * (1.0 + uBeat * 0.5);
    } else if (vKind > 2.5) {
      col += mix(uPal0, vec3(1.0), 0.6) * core * 0.7;
    }
    col *= 1.0 + uHigh * 0.2 * sin(uTime * 6.0 + vRnd * 40.0);
    fragColor = vec4(col * vA * uIntensity, 1.0);
  }
`;

// ------------------------------------------------------------- the helix
// The same screen-space capsule projection, plus the hand's azimuth about the
// molecule's own axis, the ONLY thing that turns it, and never a clock.
// aInfo: x role (0 backbone, 1 base, 2 hydrogen bond, 3 histone core,
// 4 polymerase, 5 daughter strand), y palette slot, z random, w strand.
const HX_VERT = /* glsl */ `
  uniform vec2 uRes, uPan;
  uniform float uDist, uPress, uBass, uCount, uWeight, uAzim;
  in vec2 aQuad;
  in vec3 aP0;
  in vec3 aP1;
  in vec4 aInfo;
  out vec2 vQ;
  out float vLenR, vA, vRole, vSlot, vRnd, vStrand, vDepth;
  vec3 spin(vec3 p) {
    float c = cos(uAzim), s = sin(uAzim);
    return vec3(p.x * c - p.z * s, p.y / (1.0 + uPress * 0.30), p.x * s + p.z * c);
  }
  vec2 toUv(vec3 p) {
    float d = max(uDist - p.z, 0.3);
    return (p.xy + uPan) / (1.05 * d);
  }
  void main() {
    float id = float(gl_InstanceID);
    float vis = step(id + 0.5, uCount);
    vec3 a = spin(aP0), b = spin(aP1);
    vec2 s0 = toUv(a), s1 = toUv(b);
    float aspect = uRes.x / uRes.y;
    vec2 d = s1 - s0;
    float len = length(d);
    vec2 dir = len > 0.00001 ? d / len : vec2(1.0, 0.0);
    vec2 nrm = vec2(-dir.y, dir.x);
    float depth = uDist - 0.5 * (a.z + b.z);
    float pxH = 1.0 / uRes.y;
    // radii are world units here, a histone core is a real bead, not a
    // fixed number of pixels, converted through the pinhole at this depth
    float role = aInfo.x;
    float radW = 0.030;
    if (role > 0.5 && role < 1.5) radW = 0.024;
    else if (role > 1.5 && role < 2.5) radW = 0.012;
    else if (role > 2.5 && role < 4.5) radW = max(aInfo.w, 0.0001);
    else if (role > 4.5 && role < 5.5) radW = 0.022;
    else if (role > 5.5 && role < 6.5) radW = max(aInfo.w, 0.0001);   // an atom: its own ball
    else if (role > 6.5) radW = 0.009;                                // a bond: a thin stick
    float bassF = role > 5.5 ? 1.0 : 1.0 + uBass * 0.25;               // a molecule does not breathe
    float rad = max(radW * bassF / (1.05 * depth), 0.8 * pxH);
    vLenR = len / rad;
    // round caps at BOTH ends: a molecule is tubes and beads, and a bead is a
    // zero-length segment that has to come out a disc, not a half-disc
    vec2 pos = mix(s0 - dir * rad, s1 + dir * rad, aQuad.y) + nrm * aQuad.x * rad;
    vec2 ndc = pos / vec2(aspect, 1.0) * 2.0;
    gl_Position = vec4(ndc * vis, vis > 0.5 ? 0.0 : 2.0, 1.0);
    vQ = vec2(aQuad.x, aQuad.y * (vLenR + 2.0) - 1.0);
    vRole = role;
    vSlot = aInfo.y;
    vRnd = aInfo.z;
    vStrand = aInfo.w;
    vDepth = depth;
    // depth cue: the near strand burns, the far one recedes, the only way an
    // additive molecule reads as a solid
    vA = uWeight * vis * (0.30 + 0.70 * smoothstep(4.4, 2.5, depth));
  }
`;

const HX_FRAG = /* glsl */ `
  uniform vec3 uPalA[5];
  uniform vec3 uCold;          // the palette's cold end: what the poisoned molecule sickens toward
  uniform float uIntensity, uBeat, uHigh, uTime, uSick;
  in vec2 vQ;
  in float vLenR, vA, vRole, vSlot, vRnd, vStrand, vDepth;
  out vec4 fragColor;
  // the toxin's molecules: atoms coloured by element, off the palette
  vec3 elementTint(int e) {
    if (e == 0) return mix(uPalA[2], vec3(0.45), 0.55);          // carbon: a dark grey off the backbone's stop
    if (e == 1) return mix(uPalA[0], vec3(1.0), 0.15);           // oxygen
    if (e == 2) return mix(uPalA[4], vec3(1.0), 0.25);           // chlorine
    return vec3(0.92);                                           // hydrogen
  }
  void main() {
    float along = vQ.y;
    float u = clamp(along, 0.0, vLenR);
    float dx = along - u;
    float d2 = dx * dx + vQ.x * vQ.x;
    if (d2 > 1.0) discard;
    float core = exp(-d2 * 4.5);
    float body = 1.0 - d2;
    float wall = smoothstep(0.35, 0.9, d2) * (1.0 - smoothstep(0.9, 1.0, d2));
    // aInfo.z packs a per-segment sickness in its integer part (0..255) over
    // the random in its fraction, so the damage can sit where the molecules
    // struck instead of everywhere at once
    float sick = clamp(floor(vRnd) / 255.0 + uSick * 0.35, 0.0, 1.0);
    float rnd = fract(vRnd);
    int si = int(vSlot + 0.5);
    vec3 tint = si < 5 ? uPalA[si] : elementTint(si - 10);
    if (vRole < 5.5) tint = mix(tint, uCold, sick * 0.85);
    vec3 col;
    if (vRole > 5.5 && vRole < 6.5) {
      // an atom: a lit ball, the impostor's own normal under one light
      vec3 nn = normalize(vec3(vQ.x, dx, sqrt(max(1.0 - d2, 0.0))));
      vec3 L = normalize(vec3(-0.45, 0.55, 0.7));
      float nl = max(dot(nn, L), 0.0);
      float sp = pow(max(dot(reflect(-L, nn), vec3(0.0, 0.0, 1.0)), 0.0), 40.0);
      col = tint * (0.28 + 0.82 * nl) + vec3(sp * 0.55) + tint * 0.25 * pow(1.0 - nn.z, 2.0);
      col *= 1.35;
    } else if (vRole > 6.5) {
      col = mix(uPalA[2], vec3(1.0), 0.7) * (0.35 * body + 0.5 * core);
    } else if (vRole < 0.5) {
      // The sugar-phosphate backbone, with a phosphate bead at each nucleotide.
      // The bead sits OFF CENTRE, and to the other side on the other strand,
      // the two strands are laid in opposite senses, so the beads march 5'->3'
      // one way down the molecule and 3'->5' the other. That offset is the only
      // thing on the backbone that reads as a direction, and it is what makes
      // the antiparallel construction visible rather than merely true.
      vec3 c = mix(tint, vec3(1.0), 0.55 - 0.18 * vStrand);
      float bead = exp(-pow((u / max(vLenR, 0.001)) - mix(0.30, 0.70, vStrand), 2.0) * 13.0);
      col = c * (0.30 * body + 0.62 * core + 0.35 * wall) * (0.85 + 0.40 * bead);
    } else if (vRole < 1.5) {
      col = mix(tint, vec3(1.0), 0.18) * (0.34 * body + 0.55 * core);
    } else if (vRole < 2.5) {
      col = mix(tint, vec3(1.0), 0.7) * (0.20 * body + 0.55 * core) * (0.8 + 0.5 * uBeat);
    } else if (vRole < 3.5) {
      // a histone octamer: a matte bead the fibre wraps
      float sh = 0.35 + 0.65 * sqrt(max(0.0, 1.0 - d2));
      col = mix(tint, vec3(1.0), 0.30) * (0.62 * sh + 0.40 * wall);
    } else if (vRole < 4.5) {
      // the polymerase bubble: translucent, brighter at its rim
      col = mix(tint, vec3(1.0), 0.45) * (0.10 * body + 0.42 * wall) * (1.0 + 0.4 * uBeat);
    } else {
      col = mix(tint, vec3(1.0), 0.65) * (0.28 * body + 0.60 * core + 0.3 * wall);
    }
    col *= 1.0 + uHigh * 0.18 * sin(uTime * 5.0 + rnd * 37.0);
    // the poisoned molecule dims as it sickens
    if (vRole < 5.5) col *= 1.0 - 0.35 * sick;
    fragColor = vec4(col * vA * uIntensity, 1.0);
  }
`;

export function createScene(ctx) {
  const { THREE, quality } = ctx;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const tier = quality.tier;
  const SPEC_STEPS = tier === 'low' ? 26 : tier === 'high' ? 56 : 40;
  const NSTEPS = tier === 'low' ? 12 : tier === 'high' ? 20 : 16;
  const SW = tier === 'low' ? 192 : tier === 'high' ? 320 : 256; // trail map side
  const MYC_SEGS = tier === 'low' ? 6000 : tier === 'high' ? 16000 : 11000;

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const approach = (v, to, tau, dt) => v + (to - v) * (1 - Math.exp(-dt / tau));
  const smooth01 = (u) => { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); };
  const hash1 = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  // --- the quad: specimen, plasmodium, plate, helix column ---------------------
  const cells = new Float32Array(MAXC * 4);   // packed in octant-group order
  const groups = new Float32Array(8 * 4);
  const spans = new Float32Array(8 * 2);
  const pseudo = new Float32Array(6 * 4);
  const daugh = new Float32Array(4 * 4);
  const foodU = new Float32Array(FOOD_N * 4);
  const pods = new Float32Array(NPOD * PODPTS * 4); // the macrophage's pseudopods
  const podB = new Float32Array(NPOD * 4);          // and a bounding sphere each
  const pal = Array.from({ length: 5 }, () => ({ value: new THREE.Color(1, 1, 1) }));
  const SCELLS = SW * SW;
  const trailBytes = new Uint8Array(SCELLS);
  const trailTex = new THREE.DataTexture(trailBytes, SW, SW, THREE.RedFormat, THREE.UnsignedByteType);
  trailTex.minFilter = THREE.LinearFilter;
  trailTex.magFilter = THREE.LinearFilter;
  trailTex.generateMipmaps = false;
  trailTex.unpackAlignment = 1;
  trailTex.needsUpdate = true;
  const U = {
    uRes: { value: new THREE.Vector2(ctx.width, ctx.height) },
    uCells: { value: cells },
    uGroups: { value: groups },
    uSpan: { value: spans },
    uPseudo: { value: pseudo },
    uDaugh: { value: daugh },
    uFood: { value: foodU },
    uFormA: { value: 0 },
    uFormB: { value: 0 },
    uTime: { value: 0 },
    uDist: { value: 3.4 },
    uZonaW: { value: 1 },
    uJig: { value: 0 },
    uSoft: { value: 1 },
    uPress: { value: 0 },
    uBeat: { value: 0 },
    uBass: { value: 0 },
    uHigh: { value: 0 },
    uLevelA: { value: 0 },
    uIntensity: { value: 1 },
    uCellW: { value: 1 },
    uProtW: { value: 0 },
    uFormF: { value: 0 },
    uNeck: { value: 0.24 },
    uCap: { value: ZONA },
    uCavity: { value: 0 },
    uCavR: { value: 0.8 },
    uCilia: { value: 0 },
    uDaughN: { value: 0 },
    uFoodN: { value: 0 },
    uHetero: { value: 0 },
    uGrain: { value: 0 },
    uFormScale: { value: FORM_SCALE },
    uFringe: { value: 0 },
    uFringeR: { value: 1.2 },
    uBound: { value: ZONA },
    uBoundF: { value: ZONA },
    uPan: { value: new THREE.Vector2(0, 0) },
    uOrg: { value: new THREE.Vector4(0, 0, 1, 0) },
    uTrail: { value: trailTex },
    uTexel: { value: 1 / SW },
    uDish: { value: DISH },
    uFlow: { value: 0 },
    uTintA: { value: 0.3 },
    uTintB: { value: 0.5 },
    uPal0: pal[0], uPal1: pal[1], uPal2: pal[2], uPal3: pal[3], uPal4: pal[4],
    // the end of life: the toxin's column, the macrophage, the dead mass
    uOrg2: { value: new THREE.Vector3(0, 0, 0) },
    uPods: { value: pods },
    uPodB: { value: podB },
    uPrey: { value: new THREE.Vector4(1.6, 0.2, 0.1, 0.3) },
    uMacro: { value: new THREE.Vector4(-0.42, -0.02, 0, 0.2) },
    uPhA: { value: new THREE.Vector4(1, 0, 0, 0) },
    uPhB: { value: new THREE.Vector4(-0.7, 0.08, 0, 0.24) },
    uPhC: { value: new THREE.Vector4(0, 0, 0, 2.1) },
    uDec: { value: new THREE.Vector4(0, 0, 0, 0) },
    uDec2: { value: new THREE.Vector4(1, 0, 0, 1.5) },
    uAsh: { value: new THREE.Color(0.5, 0.5, 0.5) },
    uCold: { value: new THREE.Color(0.5, 0.6, 0.8) },
    uSick: { value: 0 },
    uSpecSteps: { value: SPEC_STEPS },
    uNSteps: { value: NSTEPS },
    uMaxC: { value: MAXC },
  };
  const mat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: U,
    defines: { MAXC, LOCAL, NPOD, PODPTS },
    vertexShader: /* glsl */ `
      out vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: GLSL,
    depthTest: false,
    depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  quad.frustumCulled = false;
  quad.renderOrder = 0;
  scene.add(quad);

  // one capsule quad, shared by the hyphae and the helix
  function capsuleGeometry(n) {
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, 0, 0, 1, 0, 0, -1, 1, 0, 1, 1, 0]), 3));
    g.setAttribute('aQuad', new THREE.BufferAttribute(new Float32Array([-1, 0, 1, 0, -1, 1, 1, 1]), 2));
    g.setIndex([0, 1, 2, 2, 1, 3]);
    const p0 = new Float32Array(n * 3);
    const p1 = new Float32Array(n * 3);
    const info = new Float32Array(n * 4);
    const a0 = new THREE.InstancedBufferAttribute(p0, 3);
    const a1 = new THREE.InstancedBufferAttribute(p1, 3);
    const ai = new THREE.InstancedBufferAttribute(info, 4);
    a0.setUsage(THREE.DynamicDrawUsage);
    a1.setUsage(THREE.DynamicDrawUsage);
    ai.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('aP0', a0);
    g.setAttribute('aP1', a1);
    g.setAttribute('aInfo', ai);
    g.instanceCount = 1;
    return { g, p0, p1, info, a0, a1, ai };
  }

  // --- the hyphae -------------------------------------------------------------
  const myc = capsuleGeometry(MYC_SEGS);
  const mpal = Array.from({ length: 3 }, () => ({ value: new THREE.Color(1, 1, 1) }));
  const MU = {
    uRes: { value: new THREE.Vector2(ctx.width, ctx.height) },
    uPan: { value: new THREE.Vector2(0, 0) },
    uDist: { value: 3.4 },
    uPress: { value: 0 },
    uBass: { value: 0 },
    uCount: { value: 0 },
    uTotal: { value: 1 },
    uWeight: { value: 0 },
    uThick: { value: 2.7 },
    uIntensity: { value: 1 },
    uBeat: { value: 0 },
    uHigh: { value: 0 },
    uTime: { value: 0 },
    uPal0: mpal[0], uPal1: mpal[1], uPal2: mpal[2],
    uBody: { value: cells },   // the same packed cell list the quad marches
    uBodyN: { value: 0 },
    uLift: { value: 0 },
    uMaxC: { value: MAXC },
  };
  const mycMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: MU,
    defines: { MAXC },
    vertexShader: MYC_VERT,
    fragmentShader: MYC_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide, // the capsule's winding follows the segment's direction
    blending: THREE.AdditiveBlending,
  });
  const hyphae = new THREE.Mesh(myc.g, mycMat);
  hyphae.frustumCulled = false;
  hyphae.renderOrder = 1;
  hyphae.visible = false;
  scene.add(hyphae);

  // --- the helix ---------------------------------------------------------------
  const hx = capsuleGeometry(HELIX_SEGS);
  const hxPal = new Float32Array(15);
  const HU = {
    uRes: { value: new THREE.Vector2(ctx.width, ctx.height) },
    uPan: { value: new THREE.Vector2(0, 0) },
    uDist: { value: 3.4 },
    uPress: { value: 0 },
    uBass: { value: 0 },
    uCount: { value: 0 },
    uWeight: { value: 0 },
    uAzim: { value: 0 },
    uIntensity: { value: 1 },
    uBeat: { value: 0 },
    uHigh: { value: 0 },
    uTime: { value: 0 },
    uPalA: { value: hxPal },
    uCold: { value: new THREE.Color(0.5, 0.6, 0.8) },
    uSick: { value: 0 },
  };
  const hxMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: HU,
    vertexShader: HX_VERT,
    fragmentShader: HX_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const helix = new THREE.Mesh(hx.g, hxMat);
  helix.frustumCulled = false;
  helix.renderOrder = 4;
  helix.visible = true; // linked at warm time (nothing to draw at count 0); the first update hides it
  scene.add(helix);
  hyphae.renderOrder = 3;
  hyphae.visible = true;

  // --- the world plates: scene-private modules, each with its own programs ----------
  // (the weather's four meshes, the microscope's quad, the day's quad, the
  // currents' three). Every one is visible at creation so the warm pipeline
  // links it; the first update hides what has no weight.
  const wx = createWeather(THREE, ctx);
  const micro = createMicroscopy(THREE, ctx);
  const sea = createSea(THREE, ctx);
  const curr = createCurrents(THREE, ctx);
  const plateModules = [wx, micro, sea, curr];
  for (const m of plateModules) for (const o of m.objects) scene.add(o);
  // the per-frame plate state handed to the modules (one object, mutated)
  const PS = {
    dt: 0, t: 0, weight: 0, sys: 0, intensity: 0, level: 0, sway: 0, press: 0, hx: 0.5, hy: 0.5,
    opened: false, openNow: false, openS: 0, openDim: 0, bass: 0, mid: 0, high: 0, pulse: 0,
    speciesHash: 0, warm: true, order: [0, 1, 2, 3, 4],
  };
  const warmth = [0, 0, 0, 0, 0];
  // the quads' first two frames: every quad draws its 2-px patch at zero alpha
  let warmFrames = 2;

  // --- the cell line: layouts for every aggregate stage --------------------------
  // Cleavage is continuous in the level, so a fractional stage is a furrow in
  // progress; the later aggregates are discrete layouts the level lerps
  // between, which is what turns a morula into a blastula (cells migrating
  // outward as the cavity opens) and a Volvox sphere into a filament.
  const layA = new Float32Array(MAXC * 4);
  const layB = new Float32Array(MAXC * 4);
  const raw = new Float32Array(MAXC * 4);
  const bins = new Int32Array(MAXC);
  const gcount = new Int32Array(8);
  const gstart = new Int32Array(8);
  const JIT = new Float32Array(MAXC * 3);
  for (let i = 0; i < MAXC * 3; i++) JIT[i] = hash1(i * 1.7 + 0.3) - 0.5;
  let cellCount = 0;
  let cellNeck = 0.24;
  let cellCap = ZONA;
  let cellBound = ZONA;
  let cellGrain = 0;

  // THE PACKED CLEAVAGE SEATS. Volume is conserved, N blastomeres of radius
  // R0·N^(-1/3) always fill the same space, so the embryo never grows and the
  // cells simply crowd. A binary LATTICE cannot express that: cycling the
  // cleavage plane x, y, z, x... puts sixteen cells on a 4 × 2 × 2 block, which
  // welds them along the twice-divided axis and opens gaps across the other
  // two, so the sixteen-cell stage read as fewer cells than the eight. The
  // seats are therefore relaxed once, here: the two children are placed either
  // side of the parent across the cleavage plane, then the heap is shrunk pass
  // by pass while every overlapping pair is pushed back apart, until it JAMS
  // at the spacing where N spheres of that radius fill the zona at a real
  // random-close-packing fraction. That is compaction, and it leaves every
  // count a crowded ball whose outer cells flatten against the zona. Seeding
  // each stage from its own parents keeps cell i near cell i's parent, so the
  // furrow still reads as one cell splitting in two.
  const PACK = [];                 // PACK[j] = the 2^j relaxed centres, xyz
  const PACKR = new Float32Array(7); // and the blastomere radius at that stage
  const AGG = 1.30;                // where the jammed heap's outer surface lands
  const RCP = 0.64;                // random close packing fraction
  function stageSpacing(j, r) {
    // two, four and eight blastomeres are huge and simply halve inside the
    // zona, so the furrow's own separation is the spacing that reads
    if (j <= 3) return CLEAVE_S * 0.5;
    const rc = Math.max(0.05, AGG - r);
    return 2 * Math.cbrt((RCP * rc * rc * rc) / (1 << j));
  }
  function buildPackings() {
    PACK[0] = new Float32Array(3);
    PACKR[0] = R0;
    for (let j = 1; j <= 6; j++) {
      const n = 1 << j;
      const r = R0 * Math.pow(2, -j / 3);
      const sep = stageSpacing(j, r);
      const rc = j <= 3 ? 9 : Math.max(0.05, AGG - r); // small counts are unconstrained
      const P = new Float32Array(n * 3);
      const par = PACK[j - 1];
      const ax = (j - 1) % 3;
      for (let i = 0; i < n; i++) {
        const p = i & ((1 << (j - 1)) - 1);
        const side = (i >> (j - 1)) & 1 ? 1 : -1;
        P[i * 3] = par[p * 3] + (ax === 0 ? side * sep * 0.5 : 0);
        P[i * 3 + 1] = par[p * 3 + 1] + (ax === 1 ? side * sep * 0.5 : 0);
        P[i * 3 + 2] = par[p * 3 + 2] + (ax === 2 ? side * sep * 0.5 : 0);
        // a hair of asymmetry so a symmetric seed cannot deadlock the relaxer
        P[i * 3] += (hash1(i * 1.7 + j * 5.3) - 0.5) * sep * 0.02;
        P[i * 3 + 1] += (hash1(i * 2.9 + j * 7.1) - 0.5) * sep * 0.02;
        P[i * 3 + 2] += (hash1(i * 4.1 + j * 9.7) - 0.5) * sep * 0.02;
      }
      const s2 = sep * sep;
      for (let it = 0; it < 200; it++) {
        for (let k = 0; k < n * 3; k++) P[k] *= 0.995;
        for (let pass = 0; pass < 2; pass++) {
          for (let a = 0; a < n; a++) {
            for (let b = a + 1; b < n; b++) {
              const dx = P[b * 3] - P[a * 3];
              const dy = P[b * 3 + 1] - P[a * 3 + 1];
              const dz = P[b * 3 + 2] - P[a * 3 + 2];
              const d2 = dx * dx + dy * dy + dz * dz;
              if (d2 >= s2 || d2 < 1e-12) continue;
              const d = Math.sqrt(d2);
              const k = ((sep - d) / d) * 0.5;
              P[b * 3] += dx * k; P[b * 3 + 1] += dy * k; P[b * 3 + 2] += dz * k;
              P[a * 3] -= dx * k; P[a * 3 + 1] -= dy * k; P[a * 3 + 2] -= dz * k;
            }
          }
        }
        for (let a = 0; a < n; a++) {
          const l = Math.hypot(P[a * 3], P[a * 3 + 1], P[a * 3 + 2]);
          if (l > rc) { const k = rc / l; P[a * 3] *= k; P[a * 3 + 1] *= k; P[a * 3 + 2] *= k; }
        }
      }
      PACK[j] = P;
      PACKR[j] = r;
    }
  }
  buildPackings();

  // A fractional stage is a furrow in progress: cell i of stage j becomes
  // cells i and i + 2^j of stage j + 1, so both children pour out of the
  // parent's seat as the level crosses the stage.
  function cleavageLayout(L, out) {
    const j0 = clamp(Math.floor(L), 0, 6);
    const j1 = Math.min(6, j0 + 1);
    const dividing = L - j0 > 1e-4 && j1 > j0;
    const q = dividing ? smooth01(clamp(L - j0, 0, 1)) : 0;
    const count = 1 << (dividing ? j1 : j0);
    const A = PACK[j0], B = PACK[j1];
    const mask = (1 << j0) - 1;
    const rad = PACKR[j0] + (PACKR[j1] - PACKR[j0]) * q;
    for (let i = 0; i < count; i++) {
      const p = i & mask;
      const bi = dividing ? i : p;
      let x = A[p * 3] + (B[bi * 3] - A[p * 3]) * q;
      let y = A[p * 3 + 1] + (B[bi * 3 + 1] - A[p * 3 + 1]) * q;
      let z = A[p * 3 + 2] + (B[bi * 3 + 2] - A[p * 3 + 2]) * q;
      // a little irregularity so the aggregate is a packing, not a lattice
      const jw = rad * 0.18 * (0.35 + cellGrain) * smooth01(L);
      x += JIT[i * 3] * jw;
      y += JIT[i * 3 + 1] * jw;
      z += JIT[i * 3 + 2] * jw;
      // hold the whole embryo at a fixed oblique angle, so the eye never
      // looks straight down a cleavage axis into a flat grid of cells
      // (a constant, not a clock, nothing here turns)
      const rx = x * 0.8139 + z * 0.5810;
      const rz0 = z * 0.8139 - x * 0.5810;
      out[i * 4] = rx;
      out[i * 4 + 1] = y * 0.9287 - rz0 * 0.3709;
      out[i * 4 + 2] = y * 0.3709 + rz0 * 0.9287;
      out[i * 4 + 3] = rad;
    }
    for (let i = count; i < MAXC; i++) { out[i * 4] = 0; out[i * 4 + 1] = 0; out[i * 4 + 2] = 0; out[i * 4 + 3] = 0; }
    return count;
  }
  // The morula's sixty-four cells migrate outward onto the blastula's wall.
  // Pairing each one with the seat on the shell that lies nearest its own
  // direction turns that stage change into an outward migration instead of a
  // scramble across the embryo; the thirty-two seats left over are the cells
  // the wall gains, and they grow in place from nothing.
  const SHELL_SLOT = new Int32Array(SHELL_N);
  {
    const taken = new Uint8Array(SHELL_N);
    const sdx = new Float32Array(SHELL_N * 3);
    for (let i = 0; i < SHELL_N; i++) {
      const y = 1 - 2 * (i + 0.5) / SHELL_N;
      const rr = Math.sqrt(Math.max(0, 1 - y * y));
      const th = i * 2.39996;
      sdx[i * 3] = Math.cos(th) * rr; sdx[i * 3 + 1] = y; sdx[i * 3 + 2] = Math.sin(th) * rr;
    }
    const M = PACK[6];
    let spare = 64;
    for (let i = 0; i < SHELL_N; i++) SHELL_SLOT[i] = -1;
    for (let c = 0; c < 64; c++) {
      const l = Math.hypot(M[c * 3], M[c * 3 + 1], M[c * 3 + 2]) || 1;
      const dx = M[c * 3] / l, dy = M[c * 3 + 1] / l, dz = M[c * 3 + 2] / l;
      let best = -1, bd = -2;
      for (let s = 0; s < SHELL_N; s++) {
        if (taken[s]) continue;
        const d = dx * sdx[s * 3] + dy * sdx[s * 3 + 1] + dz * sdx[s * 3 + 2];
        if (d > bd) { bd = d; best = s; }
      }
      taken[best] = 1;
      SHELL_SLOT[best] = c;
    }
    for (let s = 0; s < SHELL_N; s++) if (SHELL_SLOT[s] < 0) SHELL_SLOT[s] = spare++;
  }
  // ---- the protists as CELL CLOUDS -------------------------------------------
  // The brief asks the cells to MORPH into the organism, and a cross-dissolve
  // of two superimposed bodies is not a morph. A cell aggregate and an
  // analytic solid cannot share one distance field, the aggregate is culled
  // per ray, so away from the cells it is a bound and not a distance, and
  // mixing that bound into a solid's field erodes the solid wherever the cull
  // comes back empty. So the morph is done on the CELL side: every protist and
  // the sponge carries a layout of MAXC seats laid ON its own surface, and an
  // aggregate-to-protist crossing is the same seat-by-seat travel every
  // aggregate-to-aggregate crossing already uses. The cells swim out and take
  // the organism's shape; only over the back half of the crossing does the
  // analytic body fade in under them, and by then the two surfaces are in the
  // same place, so the handover reads as the cells fusing into one body.
  const FIBD = new Float32Array(MAXC * 3);   // one golden-angle spiral, shared
  for (let i = 0; i < MAXC; i++) {
    const y = 1 - 2 * (i + 0.5) / MAXC;
    const rr = Math.sqrt(Math.max(0, 1 - y * y));
    const th = i * 2.39996;
    FIBD[i * 3] = Math.cos(th) * rr;
    FIBD[i * 3 + 1] = y;
    FIBD[i * 3 + 2] = Math.sin(th) * rr;
  }
  // the diatom and the sponge are held at a fixed tilt in the shader (a
  // constant, not a clock), so a cloud laid in the form's own space has to be
  // rotated back out of it to land where the field draws the body
  const cq = new Float32Array(3);
  function unDia(x, y, z) {
    const ty = 0.342 * x + 0.94 * y;
    cq[0] = 0.94 * x - 0.342 * y;
    cq[1] = 0.52 * ty - 0.854 * z;
    cq[2] = 0.854 * ty + 0.52 * z;
  }
  function unSpg(x, y, z) {
    cq[0] = x;
    cq[1] = 0.8525 * y - 0.5227 * z;
    cq[2] = 0.5227 * y + 0.8525 * z;
  }
  function cloudFor(f, out) {
    const N = MAXC;
    for (let i = 0; i < N; i++) {
      const dx = FIBD[i * 3], dy = FIBD[i * 3 + 1], dz = FIBD[i * 3 + 2];
      let x = 0, y = 0, z = 0;
      if (f === 0) {
        // AMOEBA, seventy-two seats over the endoplasm's envelope, the rest
        // four-deep out along each of the six pseudopods, so the cells stream
        // into the lobes as the lobes stream
        if (i < 72) { x = dx * 0.60; y = dy * 0.50; z = dz * 0.52; }
        else {
          const k = (i - 72) % 6, j = ((i - 72) / 6) | 0;
          const v = 0.24 + 0.76 * ((j + 1) / 4);   // out to the lobe's tip
          x = pseudo[k * 4] * v; y = pseudo[k * 4 + 1] * v; z = pseudo[k * 4 + 2] * v;
        }
      } else if (f === 1) {
        // PARAMECIUM, a slipper: an ellipsoid tapered toward the anterior and
        // then bent along its length, the same bend the field applies
        const tp = 1 - 0.30 * smooth01((dx + 0.2) / 1.1);
        const qx = dx * 0.92 - 0.03;
        x = qx; y = dy * 0.355 * tp - 0.15 * qx * qx + 0.05; z = dz * 0.33 * tp;
      } else if (f === 2) {
        // EUGLENA, a spindle drawn to a posterior point
        const nd = dy < 0 ? -dy : 0;
        const c3 = nd * nd * nd;
        const tp = 1 - 0.70 * c3;
        x = dx * 0.30 * tp; y = dy * 0.70 - 0.30 * c3 * nd; z = dz * 0.28 * tp;
      } else if (f === 3) {
        // DIATOM, the two valve faces and the girdle band between them
        let qx, qy, qz;
        if (i < 66) {
          const j = i % 33;
          const rr = 0.70 * Math.sqrt((j + 0.4) / 33);
          const th = i * 2.39996;
          qx = Math.cos(th) * rr; qz = Math.sin(th) * rr; qy = (i < 33 ? 0.16 : -0.16);
        } else {
          const j = i - 66;
          const th = j * 2.39996;
          qx = Math.cos(th) * 0.70; qz = Math.sin(th) * 0.70; qy = ((j % 3) - 1) * 0.08;
        }
        unDia(qx, qy, qz);
        x = cq[0]; y = cq[1]; z = cq[2];
      } else if (f === 4) {
        // RADIOLARIAN, the mineral shell itself
        x = dx * 0.70; y = dy * 0.70; z = dz * 0.70;
      } else {
        // SPONGE, the seats climb the vase's wall in a phyllotactic spiral,
        // on the same radius profile the field uses
        const qy = -0.92 + 1.74 * ((i + 0.5) / N);
        const rad = 0.34 + 0.30 * smooth01((qy + 0.95) / 1.8) + 0.05 * Math.sin(qy * 5);
        const th = i * 2.39996;
        unSpg(Math.cos(th) * rad, qy, Math.sin(th) * rad);
        x = cq[0]; y = cq[1]; z = cq[2];
      }
      out[i * 4] = x * FORM_SCALE;
      out[i * 4 + 1] = y * FORM_SCALE;
      out[i * 4 + 2] = z * FORM_SCALE;
    }
    // size the seats to the cloud's OWN spacing, half the mean nearest
    // neighbour with a little overlap, so the skin closes over whatever shape
    // it was laid on, the same rule the blastula's wall follows. Ninety-six
    // squared distance tests, and only while a crossing is running.
    let sum = 0;
    for (let i = 0; i < N; i++) {
      const ax = out[i * 4], ay = out[i * 4 + 1], az = out[i * 4 + 2];
      let b = 1e9;
      for (let j = 0; j < N; j++) {
        if (j === i) continue;
        const ddx = out[j * 4] - ax, ddy = out[j * 4 + 1] - ay, ddz = out[j * 4 + 2] - az;
        const d2 = ddx * ddx + ddy * ddy + ddz * ddz;
        if (d2 < b) b = d2;
      }
      sum += Math.sqrt(b);
    }
    const r = Math.max(0.06, (sum / N) * 0.61);
    for (let i = 0; i < N; i++) out[i * 4 + 3] = r * (1 + JIT[i * 3] * 0.16 * cellGrain);
    return N;
  }

  // a hollow ball of cells: the blastula's wall, and Volvox's colony
  function shellLayout(out, n, R, r, jit) {
    for (let i = 0; i < n; i++) {
      const o = n === SHELL_N ? SHELL_SLOT[i] : i;
      const y = 1 - 2 * (i + 0.5) / n;
      const rr = Math.sqrt(Math.max(0, 1 - y * y));
      const th = i * 2.39996;
      const jx = JIT[o * 3] * jit, jy = JIT[o * 3 + 1] * jit, jz = JIT[o * 3 + 2] * jit;
      out[o * 4] = Math.cos(th) * rr * R + jx;
      out[o * 4 + 1] = y * R + jy;
      out[o * 4 + 2] = Math.sin(th) * rr * R + jz;
      out[o * 4 + 3] = r * (1 + JIT[o * 3] * 0.22 * cellGrain);
    }
    for (let i = n; i < MAXC; i++) { out[i * 4 + 3] = 0; }
    return n;
  }
  // the colony unrolls into a chain: a beaded filament with heterocysts
  function filamentLayout(out, n) {
    for (let i = 0; i < n; i++) {
      const u = (i - (n - 1) / 2) * FIL_SP;
      const het = i % 7 === 6;
      out[i * 4] = u;
      out[i * 4 + 1] = 0.26 * Math.sin(u * 0.8) + JIT[i * 3 + 1] * 0.02;
      out[i * 4 + 2] = 0.11 * Math.sin(u * 1.7);
      out[i * 4 + 3] = (het ? 0.255 : 0.222) * (1 + JIT[i * 3] * 0.12 * cellGrain);
    }
    for (let i = n; i < MAXC; i++) {
      // the cells the chain sheds fold back onto it along its WHOLE length, so
      // a crossing into a chain draws its cells in everywhere instead of
      // piping eighty of them out of one end
      const src = i % n;
      out[i * 4] = out[src * 4];
      out[i * 4 + 1] = out[src * 4 + 1];
      out[i * 4 + 2] = out[src * 4 + 2];
      out[i * 4 + 3] = 0;
    }
    return n;
  }
  function layoutFor(stage, out) {
    if (stage <= 6) return cleavageLayout(stage, out);
    if (stage === 7) return shellLayout(out, SHELL_N, 1.00, BLAST_R, 0.012);
    if (stage === 13) return shellLayout(out, SHELL_N, 1.06, 0.125, 0.008);
    if (stage === 14) return filamentLayout(out, FIL_N);
    return cloudFor(FORM[stage], out);   // the protists, and the sponge
  }
  // the zona the cells are clamped to: the cleavage stages compact inside it,
  // everything past the morula has left it behind. Lerped between stages like
  // every other layout number, because releasing the clamp in one frame popped
  // the outer cells out by four per cent at the top of the cleavage.
  const capFor = (stage) => (stage <= 6 ? ZONA * 0.955 : 3.0);
  // pack the cells into eight octant groups with a bounding sphere each, so
  // the fragment shader can throw whole groups away before it tests a cell
  function packCells(count) {
    for (let g = 0; g < 8; g++) gcount[g] = 0;
    let live = 0;
    for (let i = 0; i < count; i++) {
      if (raw[i * 4 + 3] < 1e-3) { bins[i] = -1; continue; }
      const g = (raw[i * 4] >= 0 ? 1 : 0) | (raw[i * 4 + 1] >= 0 ? 2 : 0) | (raw[i * 4 + 2] >= 0 ? 4 : 0);
      bins[i] = g;
      gcount[g]++;
      live++;
    }
    let acc = 0;
    for (let g = 0; g < 8; g++) { gstart[g] = acc; acc += gcount[g]; gcount[g] = 0; }
    let meanR = 0, bound = 0;
    for (let i = 0; i < count; i++) {
      const g = bins[i];
      if (g < 0) continue;
      const o = (gstart[g] + gcount[g]) * 4;
      gcount[g]++;
      cells[o] = raw[i * 4];
      cells[o + 1] = raw[i * 4 + 1];
      cells[o + 2] = raw[i * 4 + 2];
      cells[o + 3] = raw[i * 4 + 3];
      meanR += raw[i * 4 + 3];
      const l = Math.hypot(raw[i * 4], raw[i * 4 + 1], raw[i * 4 + 2]) + raw[i * 4 + 3];
      if (l > bound) bound = l;
    }
    for (let g = 0; g < 8; g++) {
      const s = gstart[g], n = gcount[g];
      spans[g * 2] = s;
      spans[g * 2 + 1] = n;
      if (!n) { groups[g * 4 + 3] = 0; continue; }
      let cx = 0, cy = 0, cz = 0;
      for (let i = s; i < s + n; i++) { cx += cells[i * 4]; cy += cells[i * 4 + 1]; cz += cells[i * 4 + 2]; }
      cx /= n; cy /= n; cz /= n;
      let rad = 0;
      for (let i = s; i < s + n; i++) {
        const d = Math.hypot(cells[i * 4] - cx, cells[i * 4 + 1] - cy, cells[i * 4 + 2] - cz) + cells[i * 4 + 3];
        if (d > rad) rad = d;
      }
      groups[g * 4] = cx; groups[g * 4 + 1] = cy; groups[g * 4 + 2] = cz; groups[g * 4 + 3] = rad;
    }
    cellCount = live;
    meanR = live ? meanR / live : 0.2;
    cellNeck = Math.max(0.025, meanR * 0.17);
    cellBound = bound;
    return live;
  }
  // the whole cell axis, from a continuous level in stages
  function computeCells(L) {
    const s0 = clamp(Math.floor(L), 0, STAGES - 1);
    const s1 = Math.min(STAGES - 1, s0 + 1);
    const f = smooth01(clamp(L - s0, 0, 1));
    const k0 = KIND[s0], k1 = KIND[s1];
    let count = 0;
    if (k0 === 1 && k1 === 1) {
      // protist to protist: no cells at all, the two fields simply mix
      for (let i = 0; i < MAXC; i++) raw[i * 4 + 3] = 0;
      cellCount = 0;
      for (let g = 0; g < 8; g++) { spans[g * 2 + 1] = 0; groups[g * 4 + 3] = 0; }
      cellBound = 0;
      cellCap = 3.0;
      return 0;
    }
    if (k0 === 0 && k1 === 0 && s1 <= 6) {
      count = cleavageLayout(clamp(L, 0, 6), raw);
      cellCap = ZONA * 0.955;
    } else {
      // EVERY other crossing is the same seat-by-seat travel, the morula onto
      // the blastula's wall, the blastula onto the amoeba's surface, the
      // radiolarian's surface onto the Volvox shell, the filament onto the
      // sponge, so the cells THEMSELVES carry the shape change
      const nA = layoutFor(s0, layA);
      const nB = layoutFor(s1, layB);
      count = Math.max(nA, nB);
      for (let i = 0; i < count; i++) {
        const o = i * 4;
        const ax = i < nA ? layA[o] : layB[o], ay = i < nA ? layA[o + 1] : layB[o + 1];
        const az = i < nA ? layA[o + 2] : layB[o + 2], ar = i < nA ? layA[o + 3] : 0;
        const bx = i < nB ? layB[o] : layA[o], by = i < nB ? layB[o + 1] : layA[o + 1];
        const bz = i < nB ? layB[o + 2] : layA[o + 2], br = i < nB ? layB[o + 3] : 0;
        raw[o] = ax + (bx - ax) * f;
        raw[o + 1] = ay + (by - ay) * f;
        raw[o + 2] = az + (bz - az) * f;
        raw[o + 3] = ar + (br - ar) * f;
      }
      cellCap = capFor(s0) + (capFor(s1) - capFor(s0)) * f;
    }
    return packCells(count);
  }

  // --- the slime mold: Physarum agents on a trail map ------------------------------
  // Jones's model: each agent senses the trail at three sensors ahead, turns
  // toward the strongest, steps, deposits; the map is box-blurred and decays.
  // Everything that shapes the network, sensing geometry, turn rate, deposit,
  // decay, density, the random-turn rate that opens a fan front, how many
  // inoculation points there are and where, the food layout and its pull, is
  // drawn from the species table, so one strain builds a fine reticulum and
  // the next a sparse mesh of trunk veins between fused colonies.
  const SAGENTS = Math.floor(SCELLS * 0.17); // capacity; the species sets the live count
  const trail = new Float32Array(SCELLS);
  const trail2 = new Float32Array(SCELLS);
  const occ = new Uint8Array(SCELLS); // one agent per cell, the exclusion that keeps veins thin
  const agX = new Float32Array(SAGENTS);
  const agY = new Float32Array(SAGENTS);
  const agH = new Float32Array(SAGENTS);
  const agI = new Uint8Array(SAGENTS);
  const MAX_INOC = 4;
  const inocX = new Float32Array(MAX_INOC);
  const inocY = new Float32Array(MAX_INOC);
  const inocD = new Float32Array(MAX_INOC); // each inoculum's distance from the plate's centre
  const inocR = new Float32Array(MAX_INOC); // and its own reach this frame
  const foodX = new Float32Array(FOOD_N);
  const foodY = new Float32Array(FOOD_N);
  const foodOn = new Uint8Array(FOOD_N);
  // which flake, if any, a trail cell belongs to, the colony lights a flake by
  // ARRIVING on it, not by being within some radius of a spore
  const foodMap = new Int16Array(SCELLS);
  let agSpawned = 0; // agents that have ever been placed
  let agActive = 0;  // and how many are being stepped right now
  let spawnG = 0;    // the growth the last placement filled out to
  const SP = {
    sa: 0.4, sd: 8, ra: 0.5, ss: 1, dep: 5, decay: 0.905, tmax: 22, bk: 255 / 22,
    dens: 0.14, rnd: 0.02, inoc: 1, food: 0, foodN: 9, foodStr: 2.4, tintA: 0.2, tintB: 0.5,
  };

  // Four archetypes the seed picks between and then jitters, so a species is
  // a different NETWORK MORPHOLOGY and not merely a different scale: a fine
  // reticulum, coarse trunk veins in a sparse mesh, a broad fan front, and a
  // shuttle-streaming network anchored hard to its food. The densities are a
  // floor as well as a shape: a strain that runs the plate at a quarter of the
  // agent count still has to cover it, so the sparse archetypes buy their
  // sparseness from vein thickness and sensing, not from an empty dish.
  const ARCHE = [
    //  sa    sd    ra    ss   dep  decay  dens   rnd  inoc food  fstr
    [0.34, 4.2, 0.32, 0.9, 3.2, 0.862, 0.105, 0.02, 1, 1, 1.2],
    [0.92, 18.0, 0.82, 1.5, 6.5, 0.950, 0.082, 0.02, 2, 0, 3.2],
    [0.26, 7.0, 0.24, 1.35, 4.0, 0.900, 0.130, 0.24, 1, 3, 0.5],
    [0.60, 11.0, 0.55, 1.0, 5.0, 0.932, 0.088, 0.05, 3, 2, 3.6],
  ];
  // the strain's own draws, hoisted with their seed so picking a species
  // builds no closure, nothing in the per-frame path allocates
  let spSeed = 1;
  const h = (k) => hash1(spSeed * 7.13 + k * 19.77 + 0.11);
  const spj = (k) => 0.8 + 0.4 * h(k);   // the +/-20% jitter on an archetype
  function slimeSpecies(seed) {
    spSeed = seed;
    const A = ARCHE[Math.floor(h(0) * 4 * 0.999)];
    const j = spj;
    SP.sa = A[0] * j(1);
    SP.sd = A[1] * j(2) * (SW / 256);
    SP.ra = A[2] * j(3);
    SP.ss = A[3] * j(4) * (SW / 256);
    SP.dep = A[4] * j(5);
    SP.decay = clamp(A[5] * (0.985 + 0.03 * h(6)), 0.84, 0.962);
    SP.dens = A[6] * j(7);
    // the trail's own equilibrium (deposit over decay) sets the display range,
    // so a heavy depositor does not simply saturate to a flat sheet and every
    // species shows its veins at the same contrast
    SP.tmax = clamp(SP.dep / (1 - SP.decay) * 0.42, 8, 400);
    SP.bk = 255 / SP.tmax;
    SP.rnd = A[7] * j(8);
    SP.inoc = clamp(A[8] + (h(9) > 0.6 ? 1 : 0), 1, MAX_INOC);
    SP.food = A[9];
    SP.foodN = 4 + Math.floor(h(11) * (FOOD_N - 3));
    SP.foodStr = A[10] * j(12);
    SP.tintA = h(13);
    SP.tintB = h(14);
    // the inoculation points, and the food the colony will find
    const C = SW * 0.5, Rmax = SW * 0.5 - 3;
    for (let k = 0; k < SP.inoc; k++) {
      const a = h(20 + k) * 6.2831853;
      const r = SP.inoc === 1 ? 0 : Rmax * (0.18 + 0.42 * h(30 + k));
      inocX[k] = C + Math.cos(a) * r;
      inocY[k] = C + Math.sin(a) * r;
      inocD[k] = r;
    }
    for (let k = 0; k < FOOD_N; k++) {
      let fx = C, fy = C;
      if (SP.food === 0) {                                   // a ring of flakes
        const a = (k / SP.foodN) * 6.2831853 + h(40) * 3.0;
        fx = C + Math.cos(a) * Rmax * 0.74;
        fy = C + Math.sin(a) * Rmax * 0.74;
      } else if (SP.food === 1) {                            // scattered
        const a = k * 2.39996 + h(41) * 6.0;
        const r = Rmax * (0.28 + 0.62 * ((k + 1) / SP.foodN));
        fx = C + Math.cos(a) * r;
        fy = C + Math.sin(a) * r;
      } else if (SP.food === 2) {                            // two clusters
        const c = k % 2;
        const a = h(42 + c) * 6.2831853;
        const cr = Rmax * 0.62;
        fx = C + Math.cos(a) * cr + (h(50 + k) - 0.5) * Rmax * 0.24;
        fy = C + Math.sin(a) * cr + (h(60 + k) - 0.5) * Rmax * 0.24;
      } else {                                               // a row across the plate
        const a = h(43) * 3.1415927;
        const u = ((k + 0.5) / SP.foodN - 0.5) * 1.7 * Rmax;
        fx = C + Math.cos(a) * u;
        fy = C + Math.sin(a) * u;
      }
      const lim = Rmax - 6;
      const dx = fx - C, dy = fy - C, dl = Math.hypot(dx, dy);
      if (dl > lim) { fx = C + (dx / dl) * lim; fy = C + (dy / dl) * lim; }
      foodX[k] = fx;
      foodY[k] = fy;
    }
    // stamp the flakes' footprints, so a stepping agent knows the moment it
    // walks onto one
    foodMap.fill(0);
    for (let k = 0; k < SP.foodN; k++) {
      const ix = foodX[k] | 0, iy = foodY[k] | 0;
      for (let oy = -4; oy <= 4; oy++) {
        for (let ox = -4; ox <= 4; ox++) {
          if (ox * ox + oy * oy > 16) continue;
          foodMap[(iy + oy) * SW + ix + ox] = k + 1;
        }
      }
    }
  }
  function slimeReset() {
    trail.fill(0);
    trail2.fill(0);
    occ.fill(0);
    foodOn.fill(0);
    foodU.fill(0);
    agSpawned = 0;
    agActive = 0;
    spawnG = 0;
  }
  function slimeStep(swayV, pressV, devel) {
    const W = SW, last = W - 1;
    // sway morphs the sensing live, on top of whatever the species is
    const SA = SP.sa + swayV * 0.70;
    const RA = SP.ra + swayV * 0.45;
    const SD = SP.sd * (1 + swayV * 1.3);
    const SS = SP.ss;
    const DEP = SP.dep;
    const cx = W * 0.5, cy = W * 0.5;
    const Rmax = W * 0.5 - 3;
    // THE LEVEL IS THE COLONY'S REACH, and at full development the reach is the
    // whole dish. Each inoculum therefore carries its own radius, grown to
    // Rmax + its own offset from the centre, so the discs UNION to the plate
    // however far off-centre the spores were dropped, a single shared radius
    // measured from each spore left the far side of a two-spore plate
    // unreachable at any development level, and its flakes could never light.
    const growth = clamp((0.14 + 0.86 * devel) * (1 - 0.42 * pressV), 0, 1);
    for (let k = 0; k < SP.inoc; k++) inocR[k] = (Rmax + inocD[k]) * growth;
    const Rp2 = Rmax * Rmax;
    const frac = growth * growth * 1.15 + 0.02;
    const nAct = Math.min(SAGENTS, Math.floor(SCELLS * SP.dens * (frac > 1 ? 1 : frac)));
    // The population follows the reach BOTH WAYS. An agent that stops being
    // stepped has to give its cell back: the exclusion bit is cleared only by
    // that agent's own next move, so a colony driven down used to leave every
    // retired agent's bit set and then grow back into a dish of invisible
    // obstacles, noticeably noisier and more broken on the way down than up.
    if (nAct < agActive) {
      for (let i = nAct; i < agActive; i++) occ[(agY[i] | 0) * W + (agX[i] | 0)] = 0;
    } else if (nAct > agActive) {
      const back = nAct < agSpawned ? nAct : agSpawned;
      for (let i = agActive; i < back; i++) occ[(agY[i] | 0) * W + (agX[i] | 0)] = 1;
    }
    agActive = nAct;
    // newcomers fill the ground the reach has just gained, uniformly by area
    // around their own inoculum (a spread population is what makes the model
    // wire a network rather than pile into one slug)
    if (nAct > agSpawned) {
      for (let i = agSpawned; i < nAct; i++) {
        const k = i % SP.inoc;
        const a = Math.random() * 6.2831853;
        const R = inocR[k];
        const r0 = (Rmax + inocD[k]) * spawnG;
        // most newcomers pour onto the ground the reach has just gained, the
        // rest anywhere in the disc, so the interior keeps its mesh instead of
        // emptying out behind an advancing front
        const rr = Math.random() < 0.35
          ? Math.sqrt(Math.random()) * R
          : Math.sqrt(r0 * r0 + (R * R - r0 * r0) * Math.random());
        let x = inocX[k] + Math.cos(a) * rr;
        let y = inocY[k] + Math.sin(a) * rr;
        const dx = x - cx, dy = y - cy, dl = Math.hypot(dx, dy);
        if (dl > Rmax - 1) { x = cx + (dx / dl) * (Rmax - 1); y = cy + (dy / dl) * (Rmax - 1); }
        agX[i] = x; agY[i] = y; agI[i] = k;
        agH[i] = Math.random() * 6.2831853;
        occ[(y | 0) * W + (x | 0)] = 1;
      }
      agSpawned = nAct;
      spawnG = growth;
    }
    for (let i = 0; i < nAct; i++) {
      let x = agX[i], y = agY[i], h = agH[i];
      let sx = x + Math.cos(h) * SD, sy = y + Math.sin(h) * SD;
      const f = trail[(sy < 0 ? 0 : sy > last ? last : sy | 0) * W + (sx < 0 ? 0 : sx > last ? last : sx | 0)];
      sx = x + Math.cos(h + SA) * SD; sy = y + Math.sin(h + SA) * SD;
      const l = trail[(sy < 0 ? 0 : sy > last ? last : sy | 0) * W + (sx < 0 ? 0 : sx > last ? last : sx | 0)];
      sx = x + Math.cos(h - SA) * SD; sy = y + Math.sin(h - SA) * SD;
      const r = trail[(sy < 0 ? 0 : sy > last ? last : sy | 0) * W + (sx < 0 ? 0 : sx > last ? last : sx | 0)];
      if (f > l && f > r) {
        // straight on
      } else if (f < l && f < r) {
        h += Math.random() < 0.5 ? RA : -RA;
      } else if (l > r) {
        h += RA;
      } else if (r > l) {
        h -= RA;
      }
      // the random-turn rate: high, and the front spreads as a fan instead of
      // condensing into veins
      if (SP.rnd > 0 && Math.random() < SP.rnd) h += (Math.random() - 0.5) * 1.9;
      let nx = x + Math.cos(h) * SS, ny = y + Math.sin(h) * SS;
      const k = agI[i];
      const idx = nx - inocX[k], idy = ny - inocY[k];
      const pdx = nx - cx, pdy = ny - cy;
      const Rk = inocR[k];
      if (idx * idx + idy * idy > Rk * Rk || pdx * pdx + pdy * pdy > Rp2) {
        h = Math.atan2(inocY[k] - y, inocX[k] - x) + (Math.random() - 0.5) * 1.6;
        nx = x + Math.cos(h) * SS; ny = y + Math.sin(h) * SS;
      }
      const from = (y | 0) * W + (x | 0);
      const to = (ny | 0) * W + (nx | 0);
      if (to !== from) {
        if (occ[to]) {
          agH[i] = Math.random() * 6.2831853;
          trail[from] += DEP;
          continue;
        }
        occ[from] = 0;
        occ[to] = 1;
      }
      // an agent stepping onto a flake IS the colony arriving on it
      const fm = foodMap[to];
      if (fm !== 0) foodOn[fm - 1] = 1;
      agX[i] = nx; agY[i] = ny; agH[i] = h;
      trail[to] += DEP;
    }
    // A flake diffuses attractant whether or not the plasmodium has found it,
    // faintly while it is only a scent on the plate, at full strength once the
    // veins are on it. It LIGHTS the moment an agent walks onto it (foodMap
    // above) and stays lit: a distance from a spore is not arrival, and with
    // off-centre inocula it was a test flakes on the far side could never pass.
    for (let k = 0; k < SP.foodN; k++) {
      const fx = foodX[k], fy = foodY[k];
      const on = foodOn[k] === 1;
      const o = k * 4;
      foodU[o] = (fx / SW - 0.5) * 2 * DISH;
      foodU[o + 1] = (fy / SW - 0.5) * 2 * DISH;
      foodU[o + 2] = 0.055;
      foodU[o + 3] = on ? 1 : 0.18;
      const str = SP.foodStr * (on ? 1 : 0.2);
      const ix = fx | 0, iy = fy | 0;
      for (let oy = -5; oy <= 5; oy++) {
        for (let ox = -5; ox <= 5; ox++) {
          const d2 = ox * ox + oy * oy;
          if (d2 > 25) continue;
          trail[(iy + oy) * W + ix + ox] += str * Math.exp(-d2 * 0.12);
        }
      }
    }
    // diffuse (3 × 3 box, separable), decay, and pack the bytes
    for (let y = 0; y < W; y++) {
      const b = y * W;
      trail2[b] = trail[b] * 2 + trail[b + 1];
      for (let x = 1; x < last; x++) trail2[b + x] = trail[b + x - 1] + trail[b + x] + trail[b + x + 1];
      trail2[b + last] = trail[b + last - 1] + trail[b + last] * 2;
    }
    const k9 = SP.decay / 9;
    const tmax = SP.tmax, bk = SP.bk;
    for (let y = 0; y < W; y++) {
      const b = y * W;
      const bu = (y === 0 ? 0 : y - 1) * W;
      const bd = (y === last ? last : y + 1) * W;
      for (let x = 0; x < W; x++) {
        const v = (trail2[bu + x] + trail2[b + x] + trail2[bd + x]) * k9;
        trail[b + x] = v;
        trailBytes[b + x] = v >= tmax ? 255 : (v * bk) | 0;
      }
    }
    trailTex.needsUpdate = true;
  }

  // --- the mycelium: hyphal growth in time order ----------------------------------
  // Germ tubes leave the spore; every step each live tip extends by the
  // species' internode with heading persistence, tortuosity, a radial tropism,
  // gravitropism into the slab and NEGATIVE AUTOTROPISM, it reads the
  // gradient of a density grid its own colony has written and steers down it,
  // away from itself. A tip that runs into an older hypha ANASTOMOSES: it lays
  // one last connecting segment, fuses and stops, which is what closes loops in
  // a real network. A cord tip lays three parallel hyphae as a rhizomorph. Tips
  // that die late enough swell into sporangia. Segments are appended in
  // (step, tip) order, so the first N are the colony N segments into its
  // growth, and the random table is read in the same order every run, so
  // changing an angle deforms the network instead of re-seeding it.
  const RND = new Float32Array(RND_LEN);
  for (let i = 0; i < RND_LEN; i++) RND[i] = Math.random();
  const tipX = new Float32Array(MAX_TIPS), tipY = new Float32Array(MAX_TIPS), tipZ = new Float32Array(MAX_TIPS);
  const tipHx = new Float32Array(MAX_TIPS), tipHy = new Float32Array(MAX_TIPS), tipHz = new Float32Array(MAX_TIPS);
  const tipGen = new Uint8Array(MAX_TIPS);
  const tipAlive = new Uint8Array(MAX_TIPS);
  const tipCord = new Uint8Array(MAX_TIPS);
  const tipGap = new Uint16Array(MAX_TIPS);
  const tipSeg = new Int32Array(MAX_TIPS);
  const stepStart = new Int32Array(MYC_STEPS + 2);
  const dens = new Float32Array(GW * GW);
  const mark = new Int32Array(GW * GW);
  const markStep = new Int32Array(GW * GW);
  let mycTotal = 0;
  let mycSteps = 0;
  const MYP = {
    germ: 8, angle: 0.58, prob: 0.15, gap: 3, step: 0.031, tort: 0.35,
    radial: 0.07, grav: 0.4, auto: 0.0, anas: 0.0, cord: 0.0, spor: 0.0, thick: 2.7, maxGen: 8,
  };
  // the fungal strain's draws, hoisted with their seed for the same reason
  let mySeed = 1;
  const mh = (k) => hash1(mySeed * 5.31 + k * 23.13 + 0.57);
  function mycSpecies(seed) {
    mySeed = seed;
    MYP.germ = 4 + Math.floor(mh(1) * 11);
    MYP.angle = 0.30 + mh(2) * 0.85;
    MYP.prob = 0.05 + mh(3) * 0.26;
    MYP.gap = 2 + Math.floor(mh(4) * 6);
    MYP.step = 0.020 + mh(5) * 0.026;
    MYP.tort = 0.10 + mh(6) * 0.80;
    MYP.radial = mh(7) * 0.14;
    MYP.grav = 0.2 + mh(8) * 0.7;
    MYP.auto = mh(9) * mh(9) * 0.9;
    MYP.anas = mh(10) * 0.85;
    MYP.cord = mh(11) * mh(11) * 0.35;
    MYP.spor = mh(12) * 0.8;
    MYP.thick = 1.75 + mh(13) * 1.45;
    MYP.maxGen = 4 + Math.floor(mh(14) * 6);
  }
  const gIdx = (x, y) => {
    let gx = ((x + DISH) / (2 * DISH) * GW) | 0;
    let gy = ((y + DISH) / (2 * DISH) * GW) | 0;
    if (gx < 0) gx = 0; else if (gx >= GW) gx = GW - 1;
    if (gy < 0) gy = 0; else if (gy >= GW) gy = GW - 1;
    return gy * GW + gx;
  };
  // hoisted so a regrow inside update() allocates nothing
  let mSeg = 0;
  function mput(x0, y0, z0, x1, y1, z1, gen, cord, kind, rnd, st) {
    const o3 = mSeg * 3, o4 = mSeg * 4;
    myc.p0[o3] = x0; myc.p0[o3 + 1] = y0; myc.p0[o3 + 2] = z0;
    myc.p1[o3] = x1; myc.p1[o3 + 1] = y1; myc.p1[o3 + 2] = z1;
    myc.info[o4] = gen + (cord ? 32 : 0);
    myc.info[o4 + 1] = kind;
    myc.info[o4 + 2] = rnd;
    myc.info[o4 + 3] = st;
    mSeg++;
  }
  // the mould on the dead mass: a fixed strain, thin, dense, quick to branch,
  // germinating at several points on the body rather than from one spore
  const MYD = {
    germ: 10, angle: 0.72, prob: 0.22, gap: 2, step: 0.022, tort: 0.55,
    radial: 0.02, grav: 0.5, auto: 0.3, anas: 0.3, cord: 0.0, spor: 0.5, thick: 1.6, maxGen: 7,
  };
  // P is the strain (MYP the fungus, MYD the mould); germAt, when given, is a
  // cell layout the germ tubes start from instead of the spore at the centre
  function growMycelium(swayV, seedOff, P, germAt) {
    let rc = seedOff | 0;
    dens.fill(0);
    mark.fill(0);
    markStep.fill(0);
    const branchAngle = P.angle + swayV * 0.62;
    const tort = P.tort + swayV * 0.55;
    const stepLen = P.step;
    const GERM = P.germ;
    for (let k = 0; k < GERM; k++) {
      const a = (k / GERM) * 6.2831853 + RND[rc++ & (RND_LEN - 1)] * 0.6;
      if (germAt) {
        const gi = ((k * 7 + 3) % TIS_N) * 4;
        tipX[k] = germAt[gi] * 0.9; tipY[k] = germAt[gi + 1] * 0.9;
      } else {
        tipX[k] = Math.cos(a) * 0.06; tipY[k] = Math.sin(a) * 0.06;
      }
      tipZ[k] = (RND[rc++ & (RND_LEN - 1)] - 0.5) * 0.05;
      tipHx[k] = Math.cos(a); tipHy[k] = Math.sin(a); tipHz[k] = (RND[rc++ & (RND_LEN - 1)] - 0.5) * 0.3;
      tipGen[k] = 0; tipAlive[k] = 1; tipGap[k] = 0; tipSeg[k] = -1;
      tipCord[k] = RND[rc++ & (RND_LEN - 1)] < P.cord ? 1 : 0;
    }
    let nTips = GERM;
    mSeg = 0;
    const rim = DISH * 0.965;
    const INFO = myc.info;
    let step = 0;
    for (; step < MYC_STEPS && mSeg < MYC_SEGS - 8; step++) {
      stepStart[step] = mSeg;
      let live = 0;
      const nNow = nTips;
      for (let i = 0; i < nNow && mSeg < MYC_SEGS - 8; i++) {
        // four draws per tip-step, always, so the decisions hold across morphs
        const r0 = RND[rc++ & (RND_LEN - 1)], r1 = RND[rc++ & (RND_LEN - 1)];
        const r2 = RND[rc++ & (RND_LEN - 1)], r3 = RND[rc++ & (RND_LEN - 1)];
        if (!tipAlive[i]) continue;
        live++;
        let x = tipX[i], y = tipY[i], z = tipZ[i];
        let hx = tipHx[i], hy = tipHy[i], hz = tipHz[i];
        const c = Math.cos((r0 - 0.5) * tort), s = Math.sin((r0 - 0.5) * tort);
        const nhx = hx * c - hy * s, nhy = hx * s + hy * c;
        const rl = Math.sqrt(x * x + y * y) + 1e-5;
        hx = nhx + (x / rl) * P.radial;
        hy = nhy + (y / rl) * P.radial;
        // negative autotropism: read the colony's own density and turn away
        if (P.auto > 0.01) {
          const gx = ((x + DISH) / (2 * DISH) * GW) | 0;
          const gy = ((y + DISH) / (2 * DISH) * GW) | 0;
          if (gx > 0 && gy > 0 && gx < GW - 1 && gy < GW - 1) {
            const b = gy * GW + gx;
            hx -= (dens[b + 1] - dens[b - 1]) * P.auto * 0.020;
            hy -= (dens[b + GW] - dens[b - GW]) * P.auto * 0.020;
          }
        }
        hz = hz * 0.7 + (r1 - 0.5) * 0.12 - z * P.grav; // gravitropism into the slab
        const hl = Math.sqrt(hx * hx + hy * hy + hz * hz);
        hx /= hl; hy /= hl; hz /= hl;
        const nx = x + hx * stepLen, ny = y + hy * stepLen, nz = z + hz * stepLen;
        const cell = gIdx(nx, ny);
        // anastomosis: a tip that meets an older hypha fuses to it and stops
        const other = mark[cell];
        const fuse = other !== 0 && other !== i + 1 && step - markStep[cell] > 5 && r3 < P.anas;
        const cord = tipCord[i] === 1;
        mput(x, y, z, nx, ny, nz, tipGen[i], cord, fuse ? 3 : 1, r2, step);
        const mine = mSeg - 1;
        if (cord && mSeg < MYC_SEGS - 4) {
          // a rhizomorph cord: the bundle runs as three parallel hyphae
          const px = -hy * 0.016, py = hx * 0.016;
          mput(x + px, y + py, z, nx + px, ny + py, nz, tipGen[i] + 1, cord, 0, r2 * 0.7, step);
          mput(x - px, y - py, z, nx - px, ny - py, nz, tipGen[i] + 1, cord, 0, r2 * 0.3, step);
        }
        if (tipSeg[i] >= 0) INFO[tipSeg[i] * 4 + 1] = 0;
        tipSeg[i] = mine;
        dens[cell] += 1;
        mark[cell] = i + 1;
        markStep[cell] = step;
        tipX[i] = nx; tipY[i] = ny; tipZ[i] = nz;
        tipHx[i] = hx; tipHy[i] = hy; tipHz[i] = hz;
        tipGap[i]++;
        const late = step > MYC_STEPS * 0.45;
        if (fuse) { tipAlive[i] = 0; continue; }
        if (nx * nx + ny * ny > rim * rim) {
          tipAlive[i] = 0;
          if (late && r0 < P.spor) INFO[mine * 4 + 1] = 2; // a sporangium at the rim
          continue;
        }
        if (late && r1 < P.spor * 0.02) { tipAlive[i] = 0; INFO[mine * 4 + 1] = 2; continue; }
        if (tipGap[i] >= P.gap && r2 < P.prob && nTips < MAX_TIPS && tipGen[i] < P.maxGen) {
          const side = r1 < 0.5 ? 1 : -1;
          const ca = Math.cos(branchAngle * side), sa = Math.sin(branchAngle * side);
          const j = nTips++;
          tipX[j] = nx; tipY[j] = ny; tipZ[j] = nz;
          tipHx[j] = hx * ca - hy * sa; tipHy[j] = hx * sa + hy * ca; tipHz[j] = hz * 0.5 + (r0 - 0.5) * 0.2;
          tipGen[j] = tipGen[i] + 1; tipAlive[j] = 1; tipGap[j] = 0; tipSeg[j] = -1;
          tipCord[j] = r3 < P.cord ? 1 : 0;
          tipGap[i] = 0;
        }
      }
      if (!live) break;
    }
    mycSteps = Math.max(1, step);
    stepStart[step] = mSeg;
    mycTotal = mSeg;
    myc.a0.needsUpdate = true;
    myc.a1.needsUpdate = true;
    myc.ai.needsUpdate = true;
    MU.uTotal.value = Math.max(1, mSeg);
    MU.uThick.value = P.thick;
  }
  // the visible prefix for a development level, linear in growth time
  function mycCount(devel) {
    const u = clamp(devel, 0, 1) * mycSteps;
    const s = Math.min(Math.floor(u), mycSteps - 1);
    const f = u - s;
    const a = stepStart[s], b = stepStart[s + 1];
    return Math.min(mycTotal, Math.max(1, Math.round(a + (b - a) * f)));
  }

  // --- the double helix ------------------------------------------------------------
  // B-form geometry: 10.5 base pairs per turn, the second backbone set 140°
  // round the axis rather than 180° so the major and minor grooves come out
  // unequal, antiparallel (the strands are laid in opposite senses), base pairs
  // as rungs with two hydrogen bonds for A-T and three for G-C. The level runs
  // it from a plain duplex through a replication fork to a chromatin fibre;
  // sway is the torsion. Everything here is static geometry, the hand's
  // azimuth in the vertex shader is the only thing that turns it.
  const axP = new Float32Array(BP * 3);
  const frN = new Float32Array(BP * 3);
  const frB = new Float32Array(BP * 3);
  const seq = new Uint8Array(BP);
  const SLOT = [0, 1, 3, 4]; // A, T, G, C take their own palette stops
  let hxCount = 0;
  const WK = 2.3; // superhelical frequency of the writhe

  function helixSequence(seed) {
    for (let k = 0; k < BP; k++) seq[k] = Math.floor(hash1(seed * 3.71 + k * 1.13) * 4) & 3;
  }
  // hoisted scratch, so a rebuild inside update() allocates nothing
  let hn = 0, hTwist = TWIST0, hWF = 0, hKf = 0;
  const hPa = new Float32Array(3), hPb = new Float32Array(3);
  const hPc = new Float32Array(3), hPd = new Float32Array(3);
  function hput(ax0, ay0, az0, ax1, ay1, az1, role, slot, rnd, w) {
    if (hn >= HELIX_SEGS) return;
    const o3 = hn * 3, o4 = hn * 4;
    hx.p0[o3] = ax0; hx.p0[o3 + 1] = ay0; hx.p0[o3 + 2] = az0;
    hx.p1[o3] = ax1; hx.p1[o3 + 1] = ay1; hx.p1[o3 + 2] = az1;
    hx.info[o4] = role; hx.info[o4 + 1] = slot; hx.info[o4 + 2] = rnd; hx.info[o4 + 3] = w;
    hn++;
  }
  // The molecule's axis, evaluated at any fractional base index: a gentle
  // superhelical writhe at rest, blending into the chromatin path where the
  // duplex makes 1.65 turns round each histone core with straight linker DNA
  // between. Continuous in kf, so the sub-sampled backbone reads as a curve.
  let hWN = 0, hWrithe = 0, hRad = HRAD, hRise = RISE, hSpace = 1;
  const coreY = (i) => (i + 0.5 - NUC / 2) * hSpace;
  const coreX = (i) => 0.18 * Math.cos(i * 2.1);
  const coreZ = (i) => 0.18 * Math.sin(i * 2.1);
  const WRAP = 0.70; // of each nucleosome's span the duplex spends wrapped
  const hFa = new Float32Array(3), hFb = new Float32Array(3);
  // ---- the toxin's damage to the molecule, all zero for the clean helix:
  // intercalation sites wedge the stack open (extra rise) and unwind it
  // locally; nicks cut one backbone; double-strand breaks cut both and the
  // fragments either side are carried apart; a per-base sickness tints it
  const hOpenK = new Float32Array(NMOL);   // the base index below each opened step
  const hOpen = new Float32Array(NMOL);    // the extra rise there, world units
  const hUnw = new Float32Array(NMOL);     // and the unwinding, radians
  let hOpenN = 0;
  const hNickK = new Float32Array(NMOL), hNickS = new Float32Array(NMOL), hNickP = new Float32Array(NMOL);
  let hNickN = 0;
  const hBrkK = new Float32Array(NBREAK), hBrkP = new Float32Array(NBREAK);
  let hBrkN = 0;
  // per break: the pivot (the axis at the break), the offset carried across
  // it, and the rotation (Rodrigues, about a fixed per-break axis, by an angle
  // the development sets, the performer's, not a clock's)
  const hBrkPiv = new Float32Array(NBREAK * 3), hBrkOff = new Float32Array(NBREAK * 3), hBrkRot = new Float32Array(NBREAK * 9);
  const hSickK = new Float32Array(NMOL), hSickA = new Float32Array(NMOL);
  let hSickN = 0;
  function clearDamage() { hOpenN = 0; hNickN = 0; hBrkN = 0; hSickN = 0; }
  // the wedge is centred on the opened step and eased over the neighbouring
  // base pairs, so the backbones bend round it instead of kinking
  function riseExtra(kf) {
    let e = 0;
    for (let i = 0; i < hOpenN; i++) e += hOpen[i] * (smooth01((kf - hOpenK[i] + 0.5) / 2) - 0.5);
    return e;
  }
  function twistOf(kf) {
    let th = kf * hTwist;
    for (let i = 0; i < hOpenN; i++) th -= hUnw[i] * (smooth01((kf - hOpenK[i] + 1.5) / 4) - 0.5);
    return th;
  }
  // how far a backbone sub-segment centred on kc, on strand w, has been cut
  function cutAt(kc, w) {
    let c = 0;
    for (let i = 0; i < hNickN; i++) if (hNickS[i] === w && Math.abs(kc - hNickK[i]) < 0.5) c = Math.max(c, hNickP[i]);
    for (let b = 0; b < hBrkN; b++) if (Math.abs(kc - hBrkK[b] - 0.5) < 0.5) c = Math.max(c, hBrkP[b]);
    return c;
  }
  // the per-base sickness, packed into aInfo.z's integer part
  function sickAt(kf) {
    let s = 0;
    for (let i = 0; i < hSickN; i++) s += hSickA[i] * Math.exp(-Math.abs(kf - hSickK[i]) / 3.5);
    return Math.floor(clamp(s, 0, 1) * 255);
  }
  // carry a point at base index kf with its fragment: across every break
  // below it, the pivot's rotation then the offset
  function fragXf(kf, p) {
    for (let b = 0; b < hBrkN; b++) {
      if (kf <= hBrkK[b] + 0.5 || hBrkP[b] < 0.002) continue;
      const o3 = b * 3, o9 = b * 9;
      const x = p[0] - hBrkPiv[o3], y = p[1] - hBrkPiv[o3 + 1], z = p[2] - hBrkPiv[o3 + 2];
      p[0] = hBrkPiv[o3] + hBrkRot[o9] * x + hBrkRot[o9 + 1] * y + hBrkRot[o9 + 2] * z + hBrkOff[o3];
      p[1] = hBrkPiv[o3 + 1] + hBrkRot[o9 + 3] * x + hBrkRot[o9 + 4] * y + hBrkRot[o9 + 5] * z + hBrkOff[o3 + 1];
      p[2] = hBrkPiv[o3 + 2] + hBrkRot[o9 + 6] * x + hBrkRot[o9 + 7] * y + hBrkRot[o9 + 8] * z + hBrkOff[o3 + 2];
    }
  }
  function axisAt(kf, out) {
    const y0 = (kf - (BP - 1) / 2) * hRise + riseExtra(kf);
    let x = hWrithe * Math.cos(WK * y0);
    let y = y0;
    let z = hWrithe * Math.sin(WK * y0);
    if (hWN > 0.002) {
      const u = clamp(BP > 1 ? kf / (BP - 1) : 0, 0, 0.99999);
      const cellU = u * NUC;
      const ci = Math.min(NUC - 1, Math.floor(cellU));
      const lf = cellU - ci;
      let nx, ny, nz;
      if (lf < WRAP) {
        const a = (lf / WRAP) * 1.65 * 6.2831853;
        nx = coreX(ci) + Math.cos(a) * COILR;
        nz = coreZ(ci) + Math.sin(a) * COILR;
        ny = coreY(ci) + (lf / WRAP - 0.5) * 0.30;
      } else {
        const g = (lf - WRAP) / (1 - WRAP);
        const ae = 1.65 * 6.2831853;
        const ex = coreX(ci) + Math.cos(ae) * COILR, ez = coreZ(ci) + Math.sin(ae) * COILR;
        const ey = coreY(ci) + 0.16;
        const ni = ci + 1;
        const sx = coreX(ni) + COILR, sz = coreZ(ni);
        const sy = coreY(ni) - 0.16;
        nx = ex + (sx - ex) * g; ny = ey + (sy - ey) * g; nz = ez + (sz - ez) * g;
      }
      x += (nx - x) * hWN; y += (ny - y) * hWN; z += (nz - z) * hWN;
    }
    out[0] = x; out[1] = y; out[2] = z;
  }
  // frames by parallel transport up the molecule, so the twist never flips
  // where the coil's tangent crosses a world axis
  function buildFrames() {
    let pnx = 0, pny = 0, pnz = 1;
    for (let k = 0; k < BP; k++) {
      axisAt(k, hFa);
      axP[k * 3] = hFa[0]; axP[k * 3 + 1] = hFa[1]; axP[k * 3 + 2] = hFa[2];
      axisAt(k - 0.15, hFa);
      axisAt(k + 0.15, hFb);
      let tx = hFb[0] - hFa[0], ty = hFb[1] - hFa[1], tz = hFb[2] - hFa[2];
      const tl = Math.hypot(tx, ty, tz) || 1;
      tx /= tl; ty /= tl; tz /= tl;
      const dt = pnx * tx + pny * ty + pnz * tz;
      let nx = pnx - tx * dt, ny = pny - ty * dt, nz = pnz - tz * dt;
      let nl = Math.hypot(nx, ny, nz);
      if (nl < 1e-4) { nx = ty; ny = -tx; nz = 0; nl = Math.hypot(nx, ny, nz) || 1; }
      nx /= nl; ny /= nl; nz /= nl;
      pnx = nx; pny = ny; pnz = nz;
      frN[k * 3] = nx; frN[k * 3 + 1] = ny; frN[k * 3 + 2] = nz;
      frB[k * 3] = ty * nz - tz * ny;
      frB[k * 3 + 1] = tz * nx - tx * nz;
      frB[k * 3 + 2] = tx * ny - ty * nx;
    }
  }
  // a point on strand `which` at fractional base index kf, `frac` of the way
  // out to the backbone: 1 is the backbone itself, 0.34 the base's inner edge
  function pointAt(kf, which, frac, out) {
    axisAt(kf, hFa);
    const k0 = Math.min(BP - 1, Math.max(0, Math.floor(kf)));
    const k1 = Math.min(BP - 1, k0 + 1);
    const m = kf - k0;
    const o0 = k0 * 3, o1 = k1 * 3;
    let nx = frN[o0] + (frN[o1] - frN[o0]) * m;
    let ny = frN[o0 + 1] + (frN[o1 + 1] - frN[o0 + 1]) * m;
    let nz = frN[o0 + 2] + (frN[o1 + 2] - frN[o0 + 2]) * m;
    const nl = Math.hypot(nx, ny, nz) || 1;
    nx /= nl; ny /= nl; nz /= nl;
    let bx = frB[o0] + (frB[o1] - frB[o0]) * m;
    let by = frB[o0 + 1] + (frB[o1 + 1] - frB[o0 + 1]) * m;
    let bz = frB[o0 + 2] + (frB[o1 + 2] - frB[o0 + 2]) * m;
    const bl = Math.hypot(bx, by, bz) || 1;
    bx /= bl; by /= bl; bz /= bl;
    const sep = kf <= hKf ? 0 : ((kf - hKf) / (BP - 1 - hKf)) * hWF;
    const R = hRad * (1 + 2.3 * sep) * frac;
    const tw = twistOf(kf);
    const th = which === 0
      ? (1 - sep) * tw + sep * 1.5708
      : (1 - sep) * (tw + GROOVE) - sep * 1.5708;
    const c = Math.cos(th), sn = Math.sin(th);
    // the radial is kept for whatever docks on this point (the toxin's adducts)
    hRadial[0] = c * nx + sn * bx; hRadial[1] = c * ny + sn * by; hRadial[2] = c * nz + sn * bz;
    out[0] = hFa[0] + R * hRadial[0];
    out[1] = hFa[1] + R * hRadial[1];
    out[2] = hFa[2] + R * hRadial[2];
  }
  const hRadial = new Float32Array(3);
  // the molecule itself, built under whatever damage state is set (none for
  // the clean helix; the toxin sets sites, nicks and breaks before calling)
  function helixCore(devH, swayV) {
    // sway sweeps the torsion: B-form unwinds toward an open ladder, then
    // winds back through B-form into an overwound, writhing supercoil
    const twistF = swayV < 0.45 ? 1 - (swayV / 0.45) * 0.80 : 0.20 + ((swayV - 0.45) / 0.55) * 1.12;
    const twist = TWIST0 * twistF;
    const writhe = smooth01((swayV - 0.55) / 0.45) * 0.40;
    const wF = devH < 1 ? smooth01(devH) : smooth01(2 - devH);
    const wN = smooth01(devH - 1);
    hTwist = twist;
    hWF = wF;
    hKf = Math.floor(BP * 0.42);
    // the duplex thins and shortens as it condenses onto the histones, so
    // the wrap reads at the same scale a real nucleosome does
    hWN = wN;
    hWrithe = writhe;
    hRad = HRAD * (1 - 0.55 * wN);
    hRise = RISE * (1 - 0.45 * wN);
    hSpace = (BP * hRise) / NUC;
    buildFrames();
    // the two sugar-phosphate backbones, sub-sampled so the strands read as
    // curves rather than a ten-sided polygon a turn, and laid in opposite
    // senses (5'->3' one way, 3'->5' the other): antiparallel by construction,
    // and visibly so, the fragment shader keys each segment's phosphate bead
    // off aInfo.w, the strand, so the beads sit off centre in opposite
    // directions and the two backbones read as running against each other
    const steps = (BP - 1) * SUB;
    const damaged = hNickN + hBrkN + hSickN > 0;
    for (let s = 0; s < steps; s++) {
      const ka = s / SUB, kb = (s + 1) / SUB;
      const sk = damaged ? sickAt(ka) : 0;
      for (let w = 0; w < 2; w++) {
        // a cut segment's ends retreat to its middle and it is gone, the
        // backbone frays into beads and parts, it never vanishes in a frame
        const cut = damaged ? cutAt((ka + kb) * 0.5, w) : 0;
        if (cut > 0.98) continue;
        pointAt(ka, w, 1, hPa);
        pointAt(kb, w, 1, hPb);
        if (damaged) { fragXf(ka, hPa); fragXf(kb, hPb); }
        if (cut > 0) {
          const mx = (hPa[0] + hPb[0]) * 0.5, my = (hPa[1] + hPb[1]) * 0.5, mz = (hPa[2] + hPb[2]) * 0.5;
          hPa[0] += (mx - hPa[0]) * cut; hPa[1] += (my - hPa[1]) * cut; hPa[2] += (mz - hPa[2]) * cut;
          hPb[0] += (mx - hPb[0]) * cut; hPb[1] += (my - hPb[1]) * cut; hPb[2] += (mz - hPb[2]) * cut;
        }
        const rnd = sk + hash1(s * (w === 0 ? 1.7 : 2.3)) * 0.999;
        if (w === 0) hput(hPa[0], hPa[1], hPa[2], hPb[0], hPb[1], hPb[2], 0, 2, rnd, 0);
        else hput(hPb[0], hPb[1], hPb[2], hPa[0], hPa[1], hPa[2], 0, 2, rnd, 1);
      }
    }
    // the base pairs: two bases reaching in, joined by their hydrogen bonds;
    // past the fork they are unpaired and stand as stubs on their own strand
    for (let k = 0; k < BP; k++) {
      const sepF = k <= hKf ? 0 : ((k - hKf) / (BP - 1 - hKf)) * wF;
      const bA = seq[k];
      const bB = bA ^ 1; // A pairs with T, G with C
      const sk = damaged ? sickAt(k) : 0;
      pointAt(k, 0, 1, hPa);
      pointAt(k, 1, 1, hPb);
      const inner = sepF < 0.92 ? 0.34 : 0.72;
      pointAt(k, 0, inner, hPc);
      pointAt(k, 1, inner, hPd);
      if (damaged) { fragXf(k, hPa); fragXf(k, hPb); fragXf(k, hPc); fragXf(k, hPd); }
      hput(hPa[0], hPa[1], hPa[2], hPc[0], hPc[1], hPc[2], 1, SLOT[bA], sk + hash1(k * 3.1) * 0.999, 0);
      hput(hPb[0], hPb[1], hPb[2], hPd[0], hPd[1], hPd[2], 1, SLOT[bB], sk + hash1(k * 4.9) * 0.999, 1);
      if (sepF < 0.35) {
        const nb = bA >= 2 ? 3 : 2; // G-C holds with three bonds, A-T with two
        const o = k * 3;
        const ux = frB[o], uy = frB[o + 1], uz = frB[o + 2];
        for (let j = 0; j < nb; j++) {
          const off = (j - (nb - 1) / 2) * 0.032;
          hput(hPc[0] + ux * off, hPc[1] + uy * off, hPc[2] + uz * off,
            hPd[0] + ux * off, hPd[1] + uy * off, hPd[2] + uz * off, 2, SLOT[bA], sk + hash1(k * 5.3 + j) * 0.999, 0);
        }
      }
    }
    // the daughter strands the polymerase leaves behind the fork: continuous
    // on the leading template, Okazaki fragments on the lagging one
    if (wF > 0.02) {
      for (let s = hKf * SUB; s < steps; s++) {
        const ka = s / SUB, kb = (s + 1) / SUB;
        const fa = 1 - 0.44 * wF * Math.min(1, (ka - hKf) / 3);
        const fb = 1 - 0.44 * wF * Math.min(1, (kb - hKf) / 3);
        pointAt(ka, 0, fa, hPa);
        pointAt(kb, 0, fb, hPb);
        hput(hPa[0], hPa[1], hPa[2], hPb[0], hPb[1], hPb[2], 5, 3, hash1(s * 6.1), 0);
        if ((s - hKf * SUB) % 25 < 17) {
          pointAt(ka, 1, fa, hPc);
          pointAt(kb, 1, fb, hPd);
          hput(hPd[0], hPd[1], hPd[2], hPc[0], hPc[1], hPc[2], 5, 4, hash1(s * 7.7), 1);
        }
      }
    }
    // the polymerase bubble sits on the junction; the histone cores carry the
    // wrapped fibre - both scale in from nothing so neither pops
    if (wF > 0.005) {
      const o = hKf * 3;
      hput(axP[o], axP[o + 1], axP[o + 2], axP[o] + 0.001, axP[o + 1], axP[o + 2], 4, 0, 0.5, 0.62 * wF);
    }
    if (wN > 0.005) {
      for (let i = 0; i < NUC; i++) {
        hput(coreX(i), coreY(i), coreZ(i), coreX(i) + 0.001, coreY(i), coreZ(i), 3, 1, 0.5, 0.44 * wN);
      }
    }
  }
  function finishHelix() {
    hxCount = hn;
    hx.g.instanceCount = Math.max(1, hn);
    hx.a0.needsUpdate = true;
    hx.a1.needsUpdate = true;
    hx.ai.needsUpdate = true;
    HU.uCount.value = hn;
  }
  function buildHelix(devH, swayV) {
    clearDamage();
    hn = 0;
    helixCore(devH, swayV);
    finishHelix();
  }

  // --- the toxin ---------------------------------------------------------------------
  // 2,3,7,8-TCDD is dibenzo-p-dioxin, anthracene's three fused rings with the
  // middle ring's 9 and 10 carbons replaced by oxygen, planar, chlorinated at
  // 2,3,7,8, the four outermost positions. DDT is a CH carbon carrying a
  // trichloromethyl group, a hydrogen and two para-chlorophenyl rings,
  // tetrahedral at the centre, the rings twisted against each other.
  // Coordinates in ångströms from standard bond lengths (aromatic C-C 1.40,
  // C-O 1.38, C-Cl 1.74, C-H 1.08, single C-C 1.54, C-Cl on sp3 carbon 1.77),
  // drawn at the helix's own scale, ANG world units per ångström, so a dioxin
  // is the width of a base pair, as it is. Atoms: x, y, z, element (0 C, 1 O,
  // 2 Cl, 3 H); bonds: pairs of atom indices.
  function molTCDD() {
    const A = [], B = [];
    const add = (x, y, z, e) => { A.push(x, y, z, e); return A.length / 4 - 1; };
    const bond = (i, j) => { B.push(i, j); };
    const s3 = 1.2124; // 1.40 · cos 30°
    const O1 = add(0, 1.4, 0, 1), O2 = add(0, -1.4, 0, 1);
    const Cf = [add(-s3, 0.7, 0, 0), add(-s3, -0.7, 0, 0), add(s3, 0.7, 0, 0), add(s3, -0.7, 0, 0)];
    bond(O1, Cf[0]); bond(O1, Cf[2]); bond(O2, Cf[1]); bond(O2, Cf[3]); bond(Cf[0], Cf[1]); bond(Cf[2], Cf[3]);
    for (let side = 0; side < 2; side++) {
      const sgn = side === 0 ? -1 : 1;
      const cx = sgn * 2 * s3;                 // the outer ring's centre
      const c1 = add(cx, 1.4, 0, 0), c2 = add(cx + sgn * s3, 0.7, 0, 0);
      const c3 = add(cx + sgn * s3, -0.7, 0, 0), c4 = add(cx, -1.4, 0, 0);
      const fa = sgn < 0 ? Cf[0] : Cf[2], fb = sgn < 0 ? Cf[1] : Cf[3];
      bond(fa, c1); bond(c1, c2); bond(c2, c3); bond(c3, c4); bond(c4, fb);
      bond(c1, add(cx, 2.48, 0, 3)); bond(c4, add(cx, -2.48, 0, 3));
      // the chlorines at 2,3 (7,8), out along the radial from the ring's centre
      bond(c2, add(cx + sgn * (s3 + 1.507), 0.7 + 0.87, 0, 2));
      bond(c3, add(cx + sgn * (s3 + 1.507), -0.7 - 0.87, 0, 2));
    }
    return { atoms: new Float32Array(A), bonds: new Int16Array(B) };
  }
  function molDDT() {
    const A = [], B = [];
    const add = (x, y, z, e) => { A.push(x, y, z, e); return A.length / 4 - 1; };
    const bond = (i, j) => { B.push(i, j); };
    const k = 0.57735;
    const D = [[k, k, k], [k, -k, -k], [-k, k, -k], [-k, -k, k]]; // the tetrahedral directions
    const Cc = add(0, 0, 0, 0);
    const c1 = [1.54 * D[0][0], 1.54 * D[0][1], 1.54 * D[0][2]];
    const C1 = add(c1[0], c1[1], c1[2], 0);
    bond(Cc, C1);
    {
      // the three chlorines stand tetrahedrally round the CCl3 carbon, 109.5° off its bond back to the centre
      const b = D[0];
      let ux = -b[1], uy = b[0], uz = 0;
      const ul = Math.hypot(ux, uy, uz); ux /= ul; uy /= ul; uz /= ul;
      const vx = b[1] * uz - b[2] * uy, vy = b[2] * ux - b[0] * uz, vz = b[0] * uy - b[1] * ux;
      for (let j = 0; j < 3; j++) {
        const th = j * 2.0944 + 0.5236;
        const px = Math.cos(th) * ux + Math.sin(th) * vx, py = Math.cos(th) * uy + Math.sin(th) * vy, pz = Math.cos(th) * uz + Math.sin(th) * vz;
        const dx = b[0] / 3 + 0.9428 * px, dy = b[1] / 3 + 0.9428 * py, dz = b[2] / 3 + 0.9428 * pz;
        bond(C1, add(c1[0] + 1.77 * dx, c1[1] + 1.77 * dy, c1[2] + 1.77 * dz, 2));
      }
    }
    bond(Cc, add(1.09 * D[3][0], 1.09 * D[3][1], 1.09 * D[3][2], 3));
    // the two para-chlorophenyl rings, each a planar hexagon on its own tetrahedral arm
    for (let ri = 1; ri <= 2; ri++) {
      const d = D[ri];
      const o = ri === 1 ? D[0] : D[3];        // the plane's tilt: the rings twist against each other
      let px = d[1] * o[2] - d[2] * o[1], py = d[2] * o[0] - d[0] * o[2], pz = d[0] * o[1] - d[1] * o[0];
      const pl = Math.hypot(px, py, pz); px /= pl; py /= pl; pz /= pl;
      const cx = 2.91 * d[0], cy = 2.91 * d[1], cz = 2.91 * d[2];   // ipso at 1.51, the ring's centre 1.40 beyond
      const idx = [];
      for (let j = 0; j < 6; j++) {
        const a = j * 1.0472;
        const rx = -Math.cos(a) * d[0] + Math.sin(a) * px;
        const ry = -Math.cos(a) * d[1] + Math.sin(a) * py;
        const rz = -Math.cos(a) * d[2] + Math.sin(a) * pz;
        idx.push(add(cx + 1.40 * rx, cy + 1.40 * ry, cz + 1.40 * rz, 0));
        if (j === 3) bond(idx[j], add(cx + 3.14 * rx, cy + 3.14 * ry, cz + 3.14 * rz, 2));        // the para chlorine
        else if (j !== 0) bond(idx[j], add(cx + 2.48 * rx, cy + 2.48 * ry, cz + 2.48 * rz, 3));   // the ring hydrogens
      }
      for (let j = 0; j < 6; j++) bond(idx[j], idx[(j + 1) % 6]);
      bond(Cc, idx[0]);
    }
    return { atoms: new Float32Array(A), bonds: new Int16Array(B) };
  }
  const MOLS = [molTCDD(), molDDT()];
  const ATOM_R = [0.50, 0.48, 0.62, 0.30]; // ball radii, ångströms: C, O, Cl, H
  // The seven molecules on the plate: kind (0 TCDD, 1 DDT), how it strikes
  // (0 an adduct on a base, 1 intercalation between two), the base index, the
  // strand, where it waits in the dark, and when in the development it sets
  // off. The two intercalators are the dioxins, it is the planar molecule
  // that slips between base pairs, and their sites are where the stack
  // breaks later.
  const MOLDEF = [
    [0, 1, 13, 0, -1.9, 0.9, 0.6, 0.10],
    [0, 1, 27, 0, 1.8, -0.4, -0.7, 0.16],
    [0, 0, 7, 0, -1.5, -1.05, 0.7, 0.02],
    [0, 0, 35, 1, 1.6, 1.25, -0.5, 0.22],
    [1, 0, 19, 0, 2.1, 0.2, 0.8, 0.06],
    [1, 0, 31, 1, -2.0, -0.2, -0.9, 0.27],
    [1, 0, 10, 1, 1.5, -1.0, 0.6, 0.31],
  ];
  // the nicks fall on three adduct sites, the breaks on the two intercalations
  const NICKS = [2, 4, 3];
  const BREAKS = [0, 1];
  const molA = new Float32Array(NMOL);     // each molecule's approach, 0 waiting .. 1 docked
  const mFree = new Float32Array(9), mDock = new Float32Array(9); // orientation scratch
  const mO = new Float32Array(3), mOd = new Float32Array(3), mAt = new Float32Array(3), mBt = new Float32Array(3);
  const mTan = new Float32Array(3), mAx = new Float32Array(3);
  // a rotation matrix from three angles (about x, then y, then z), into out
  function rotXYZ(out, ax, ay, az) {
    const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay), cz = Math.cos(az), sz = Math.sin(az);
    out[0] = cy * cz; out[1] = sx * sy * cz - cx * sz; out[2] = cx * sy * cz + sx * sz;
    out[3] = cy * sz; out[4] = sx * sy * sz + cx * cz; out[5] = cx * sy * sz - sx * cz;
    out[6] = -sy; out[7] = sx * cy; out[8] = cx * cy;
  }
  // a rotation about a unit axis by an angle (Rodrigues), into out at offset o
  function rotAxis(out, o, ux, uy, uz, a) {
    const c = Math.cos(a), s = Math.sin(a), t = 1 - c;
    out[o] = t * ux * ux + c; out[o + 1] = t * ux * uy - s * uz; out[o + 2] = t * ux * uz + s * uy;
    out[o + 3] = t * ux * uy + s * uz; out[o + 4] = t * uy * uy + c; out[o + 5] = t * uy * uz - s * ux;
    out[o + 6] = t * ux * uz - s * uy; out[o + 7] = t * uy * uz + s * ux; out[o + 8] = t * uz * uz + c;
  }
  // a frame from three orthonormal columns into out
  function frameCols(out, x0, x1, x2, y0, y1, y2, z0, z1, z2) {
    out[0] = x0; out[1] = y0; out[2] = z0;
    out[3] = x1; out[4] = y1; out[5] = z1;
    out[6] = x2; out[7] = y2; out[8] = z2;
  }
  // the damage with the development: every window is the performer's level,
  // nothing here runs on the clock except the free molecules' drift and the
  // loose fragments' wander, both translations
  function buildToxin(d, swayV, handY, t) {
    clearDamage();
    hn = 0;
    // the molecules' progress toward their sites
    for (let m = 0; m < NMOL; m++) {
      const M = MOLDEF[m];
      const a = smooth01((d - M[7]) / 0.22);
      molA[m] = a;
      if (M[1] === 1 && a > 0.002) {
        // intercalation: the step below the molecule opens by one rise and
        // unwinds by 26° as the molecule slides in
        hOpenK[hOpenN] = M[2];
        hOpen[hOpenN] = a * RISE;
        hUnw[hOpenN] = a * 0.45;
        hOpenN++;
      }
      if (a > 0.002) { hSickK[hSickN] = M[2]; hSickA[hSickN] = a * 0.9; hSickN++; }
    }
    // nicks, then the breaks, then the fragments drift
    for (let i = 0; i < NICKS.length; i++) {
      const M = MOLDEF[NICKS[i]];
      const p = smooth01((d - (0.42 + i * 0.05)) / 0.12);
      if (p > 0.002) { hNickK[hNickN] = M[2]; hNickS[hNickN] = M[3]; hNickP[hNickN] = p; hNickN++; }
    }
    const fragP = smooth01((d - 0.74) / 0.26);
    hBrkN = 0;
    for (let b = 0; b < NBREAK; b++) {
      const M = MOLDEF[BREAKS[b]];
      const p = smooth01((d - (0.58 + b * 0.08)) / 0.14);
      if (p < 0.002) continue;
      const o3 = hBrkN * 3;
      hBrkK[hBrkN] = M[2];
      hBrkP[hBrkN] = p;
      // the offset across the break: the gap opening, then the drift apart
      // (the upper pieces come down and sideways, so they stay in the frame),
      // with a slow wander once loose (translation, never a spin)
      const wob = fragP * 0.035;
      if (b === 0) {
        hBrkOff[o3] = p * 0.05 + fragP * 0.30 + wob * Math.sin(t * 0.61);
        hBrkOff[o3 + 1] = p * 0.06 - fragP * 0.08 + wob * Math.cos(t * 0.47);
        hBrkOff[o3 + 2] = -fragP * 0.22 + wob * Math.sin(t * 0.39);
      } else {
        hBrkOff[o3] = -p * 0.05 - fragP * 0.50 + wob * Math.sin(t * 0.61 + 2.1);
        hBrkOff[o3 + 1] = p * 0.06 - fragP * 0.34 + wob * Math.cos(t * 0.47 + 1.0);
        hBrkOff[o3 + 2] = fragP * 0.26 + wob * Math.sin(t * 0.39 + 3.3);
      }
      hBrkN++;
    }
    // the helix's geometry first (the breaks' pivots need the damaged axis),
    // then the pivots and tilts, then the molecule
    const twistF = swayV < 0.45 ? 1 - (swayV / 0.45) * 0.80 : 0.20 + ((swayV - 0.45) / 0.55) * 1.12;
    hTwist = TWIST0 * twistF;
    hWF = 0; hWN = 0; hWrithe = smooth01((swayV - 0.55) / 0.45) * 0.40;
    hRad = HRAD; hRise = RISE; hSpace = (BP * hRise) / NUC; hKf = BP;
    for (let b = 0; b < hBrkN; b++) {
      const o3 = b * 3;
      axisAt(hBrkK[b] + 0.5, hFa);
      hBrkPiv[o3] = hFa[0]; hBrkPiv[o3 + 1] = hFa[1]; hBrkPiv[o3 + 2] = hFa[2];
      // the tilt of the fragment above the break: about a fixed oblique axis,
      // by an angle the drift sets
      const ax = b === 0 ? 0.80 : -0.55, az = b === 0 ? 0.45 : 0.72;
      const al = Math.hypot(ax, 0.2, az);
      rotAxis(hBrkRot, b * 9, ax / al, 0.2 / al, az / al, fragP * hBrkP[b] * (b === 0 ? 0.30 : -0.40));
    }
    helixCore(0, swayV);
    // the molecules: each drifts in from the dark on a slow wander, tumbling
    // only as the sway and the hand turn it, and settles onto its site as its
    // approach completes; a docked molecule rides its fragment
    for (let m = 0; m < NMOL; m++) {
      const M = MOLDEF[m];
      const mol = MOLS[M[0]];
      const a = molA[m];
      const k = M[2], w = M[3];
      // free pose: the waiting point plus the wander, under the sway's tumble
      const ph = m * 1.37;
      const wander = 1 - a;
      mO[0] = M[4] + wander * 0.14 * Math.sin(t * 0.37 + ph);
      mO[1] = M[5] + wander * 0.12 * Math.sin(t * 0.29 + ph * 2.0);
      mO[2] = M[6] + wander * 0.14 * Math.cos(t * 0.33 + ph);
      rotXYZ(mFree, ph * 2.3 + swayV * (2.6 + 0.4 * (m % 3)) + handY * 1.1, ph * 1.1 + swayV * 1.7, ph * 0.7 + handY * (m % 2 ? 1.0 : -0.8));
      // docked pose
      if (M[1] === 1) {
        // flat in the opened step, its long axis across the base pair
        const kf = k + 0.5;
        axisAt(kf, mOd);
        axisAt(kf - 0.15, hFa); axisAt(kf + 0.15, hFb);
        let tx = hFb[0] - hFa[0], ty = hFb[1] - hFa[1], tz = hFb[2] - hFa[2];
        const tl = Math.hypot(tx, ty, tz) || 1; tx /= tl; ty /= tl; tz /= tl;
        pointAt(kf, 0, 1, hPa);               // sets hRadial to strand 0's radial here
        const th = GROOVE * 0.5;              // the base pair's own direction lies between the strands
        const c = Math.cos(th), s = Math.sin(th);
        let rx = hRadial[0], ry = hRadial[1], rz = hRadial[2];
        // rotate the radial half way round toward strand 1 about the tangent
        const cx = ty * rz - tz * ry, cy = tz * rx - tx * rz, cz = tx * ry - ty * rx;
        rx = rx * c + cx * s; ry = ry * c + cy * s; rz = rz * c + cz * s;
        const bx = ty * rz - tz * ry, by = tz * rx - tx * rz, bz = tx * ry - ty * rx;
        frameCols(mDock, rx, ry, rz, bx, by, bz, tx, ty, tz);
      } else {
        // on the backbone, standing a little off it, the plane tangent to the helix
        pointAt(k, w, 1, mOd);
        axisAt(k - 0.15, hFa); axisAt(k + 0.15, hFb);
        let tx = hFb[0] - hFa[0], ty = hFb[1] - hFa[1], tz = hFb[2] - hFa[2];
        const tl = Math.hypot(tx, ty, tz) || 1; tx /= tl; ty /= tl; tz /= tl;
        const rx = hRadial[0], ry = hRadial[1], rz = hRadial[2];
        mOd[0] += rx * 0.13; mOd[1] += ry * 0.13; mOd[2] += rz * 0.13;
        const bx = ty * rz - tz * ry, by = tz * rx - tx * rz, bz = tx * ry - ty * rx;
        frameCols(mDock, tx, ty, tz, bx, by, bz, rx, ry, rz);
      }
      const n = mol.atoms.length / 4;
      const bright = 0.35 + 0.65 * a;
      molK = k;
      for (let i = 0; i < n; i++) {
        molAtom(mol, i, a, mAt);
        hput(mAt[0], mAt[1], mAt[2], mAt[0], mAt[1], mAt[2], 6, 10 + mol.atoms[i * 4 + 3], bright, ATOM_R[mol.atoms[i * 4 + 3]] * ANG);
      }
      const nb = mol.bonds.length / 2;
      for (let i = 0; i < nb; i++) {
        molAtom(mol, mol.bonds[i * 2], a, mAt);
        molAtom(mol, mol.bonds[i * 2 + 1], a, mBt);
        hput(mAt[0], mAt[1], mAt[2], mBt[0], mBt[1], mBt[2], 7, 2, bright, 0);
      }
    }
    finishHelix();
  }
  // atom i of a molecule in the world: its free pose and its docked pose
  // (the docked one carried with its fragment), blended by the approach
  let molK = 0;
  function molAtom(mol, i, a, out) {
    const x = mol.atoms[i * 4] * ANG, y = mol.atoms[i * 4 + 1] * ANG, z = mol.atoms[i * 4 + 2] * ANG;
    const fx = mO[0] + mFree[0] * x + mFree[1] * y + mFree[2] * z;
    const fy = mO[1] + mFree[3] * x + mFree[4] * y + mFree[5] * z;
    const fz = mO[2] + mFree[6] * x + mFree[7] * y + mFree[8] * z;
    if (a <= 0.0001) { out[0] = fx; out[1] = fy; out[2] = fz; return; }
    out[0] = mOd[0] + mDock[0] * x + mDock[1] * y + mDock[2] * z;
    out[1] = mOd[1] + mDock[3] * x + mDock[4] * y + mDock[5] * z;
    out[2] = mOd[2] + mDock[6] * x + mDock[7] * y + mDock[8] * z;
    fragXf(molK, out);
    out[0] = fx + (out[0] - fx) * a;
    out[1] = fy + (out[1] - fy) * a;
    out[2] = fz + (out[2] - fz) * a;
  }

  // --- phagocytosis ---------------------------------------------------------------------
  // The macrophage sits left of centre; the prey waits out to the right and
  // drifts in. The sequence is the development's: the pseudopods reach, wrap
  // round the prey, the membrane seals behind it into a phagosome (a sphere
  // grown from nothing, blended into the body), the pseudopods draw back, the
  // phagosome is pulled inside, the prey is compressed and digested, the
  // vacuole shrinks. Sway grows the last three pseudopods from nothing and
  // winds tortuosity into all of them; press squeezes the whole cell.
  const PH_M = [-0.42, -0.02, 0.0];
  const PH_FAR = [1.62, 0.24, 0.14];
  const PREY_R = 0.30;
  const phU = new Float32Array(3), phE1 = new Float32Array(3), phE2 = new Float32Array(3);
  let phFarD = 1;
  {
    let ux = PH_FAR[0] - PH_M[0], uy = PH_FAR[1] - PH_M[1], uz = PH_FAR[2] - PH_M[2];
    phFarD = Math.hypot(ux, uy, uz);
    ux /= phFarD; uy /= phFarD; uz /= phFarD;
    phU[0] = ux; phU[1] = uy; phU[2] = uz;
    // e1 = normalize(u × z), e2 = u × e1
    let ex = uy, ey = -ux, ez = 0;
    const el = Math.hypot(ex, ey, ez) || 1; ex /= el; ey /= el; ez /= el;
    phE1[0] = ex; phE1[1] = ey; phE1[2] = ez;
    phE2[0] = uy * ez - uz * ey; phE2[1] = uz * ex - ux * ez; phE2[2] = ux * ey - uy * ex;
  }
  // the radius of the macrophage's ellipsoid in a direction
  const ellR = (dx, dy, dz) => 1 / Math.sqrt((dx * dx) / (0.84 * 0.84) + (dy * dy) / (0.70 * 0.70) + (dz * dz) / (0.66 * 0.66));
  function updatePhago(d, swayV, t) {
    const a = smooth01(d / 0.18);              // the prey drifts in
    const e = smooth01((d - 0.06) / 0.24);     // the pseudopods reach
    const w = smooth01((d - 0.22) / 0.26);     // and wrap round it
    const s = smooth01((d - 0.44) / 0.14);     // the membrane seals
    const g = smooth01((d - 0.52) / 0.22);     // the phagosome is drawn in
    const dg = smooth01((d - 0.72) / 0.28);    // and digested
    const ux = phU[0], uy = phU[1], uz = phU[2];
    const touch = 0.84 + PREY_R + 0.03;
    const along = (phFarD + (touch - phFarD) * a) * (1 - g) + 0.16 * g;
    const preyR = PREY_R * (1 - 0.22 * g) * (1 - 0.72 * dg);
    const bob = 0.025 * Math.sin(t * 0.5) * (1 - g);
    const px = PH_M[0] + ux * along, py = PH_M[1] + uy * along + bob, pz = PH_M[2] + uz * along;
    U.uPrey.value.set(px, py, pz, preyR);
    U.uMacro.value.set(PH_M[0], PH_M[1], PH_M[2], 0.22);
    const squash = 1 - 0.35 * g;
    const vacR = s * (preyR + 0.05 * (1 - dg));
    const bulgeR = s * (preyR + 0.07);
    U.uPhA.value.set(squash, dg, vacR, bulgeR);
    U.uPhB.value.set(PH_M[0] - ux * (0.30 + 0.12 * g), PH_M[1] + 0.10 - uy * 0.3, PH_M[2] - uz * 0.3, 0.24);
    // the pseudopods
    const ext = e * (1 - s);
    const L = Math.max(0.3, along - 0.45);
    const podR0 = 0.135, podR1 = 0.07;
    for (let i = 0; i < NPOD; i++) {
      const live = i < 4 ? 1 : smooth01((swayV - (0.12 + 0.28 * (i - 4))) / 0.22);
      const o = i * PODPTS * 4;
      if (live <= 0) { pods[o + 3] = 0; podB[i * 4 + 3] = -1; continue; }
      const ph = (i / NPOD) * 6.2831853 + 0.4 + 0.25 * swayV * i;
      const c = Math.cos(ph), sn = Math.sin(ph);
      const vx = c * phE1[0] + sn * phE2[0], vy = c * phE1[1] + sn * phE2[1], vz = c * phE1[2] + sn * phE2[2];
      let dx = ux * 0.85 + vx * 0.55, dy = uy * 0.85 + vy * 0.55, dz = uz * 0.85 + vz * 0.55;
      let dl = Math.hypot(dx, dy, dz); dx /= dl; dy /= dl; dz /= dl;
      const er = ellR(dx, dy, dz) * 0.92;
      const bx = PH_M[0] + dx * er, by = PH_M[1] + dy * er, bz = PH_M[2] + dz * er;
      let fx = ux + vx * 0.30, fy = uy + vy * 0.30, fz = uz + vz * 0.30;
      dl = Math.hypot(fx, fy, fz); fx /= dl; fy /= dl; fz /= dl;
      // the binormal the tortuosity wanders along
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      pods[o] = bx; pods[o + 1] = by; pods[o + 2] = bz; pods[o + 3] = podR0 * live;
      for (let k = 1; k <= 3; k++) {
        const sk = k / 3;
        const sx = bx + fx * L * sk, sy = by + fy * L * sk, sz = bz + fz * L * sk;
        const th = sk * w * 3.1415927 * 0.95;
        const ar = preyR + podR1 + 0.02;
        const ax = px + ar * (-Math.cos(th) * ux + Math.sin(th) * vx);
        const ay = py + ar * (-Math.cos(th) * uy + Math.sin(th) * vy);
        const az = pz + ar * (-Math.cos(th) * uz + Math.sin(th) * vz);
        const tw = swayV * 0.11 * Math.sin(sk * 5.0 + i * 1.7 + t * 0.6) * ext;
        const ox = o + k * 4;
        pods[ox] = bx + ((sx + (ax - sx) * w) - bx) * ext + nx * tw;
        pods[ox + 1] = by + ((sy + (ay - sy) * w) - by) * ext + ny * tw;
        pods[ox + 2] = bz + ((sz + (az - sz) * w) - bz) * ext + nz * tw;
        pods[ox + 3] = (podR0 + (podR1 - podR0) * sk) * live * (0.35 + 0.65 * ext);
      }
      // its bounding sphere: the centroid of the four points, and the farthest
      // of them plus its radius
      let cx = 0, cy = 0, cz = 0;
      for (let k = 0; k < PODPTS; k++) { cx += pods[o + k * 4]; cy += pods[o + k * 4 + 1]; cz += pods[o + k * 4 + 2]; }
      cx /= PODPTS; cy /= PODPTS; cz /= PODPTS;
      let br = 0;
      for (let k = 0; k < PODPTS; k++) {
        const dd = Math.hypot(pods[o + k * 4] - cx, pods[o + k * 4 + 1] - cy, pods[o + k * 4 + 2] - cz) + pods[o + k * 4 + 3];
        if (dd > br) br = dd;
      }
      podB[i * 4] = cx; podB[i * 4 + 1] = cy; podB[i * 4 + 2] = cz; podB[i * 4 + 3] = br;
    }
    // one bounding sphere over the whole cell, the body, every live
    // pseudopod, the prey, centred between the macrophage and the prey, so
    // the march's entry is as tight as the scene allows and every ray that
    // misses it costs one sphere test
    const bx = (PH_M[0] + px) * 0.5, by = (PH_M[1] + py) * 0.5, bz = (PH_M[2] + pz) * 0.5;
    let R = Math.hypot(PH_M[0] - bx, PH_M[1] - by, PH_M[2] - bz) + 0.90;
    R = Math.max(R, Math.hypot(px - bx, py - by, pz - bz) + preyR + 0.06);
    for (let i = 0; i < NPOD; i++) {
      if (podB[i * 4 + 3] < 0) continue;
      const dd = Math.hypot(podB[i * 4] - bx, podB[i * 4 + 1] - by, podB[i * 4 + 2] - bz) + podB[i * 4 + 3];
      if (dd > R) R = dd;
    }
    U.uPhC.value.set(bx, by, bz, R + 0.20);
  }

  // --- decomposition ------------------------------------------------------------------------
  // The dead mass: a mound of tissue on the plate, a lower layer of cells on
  // a disc and an upper layer riding on it, drawn by the same culled cell
  // march as the embryo. The development runs it down: the turgor goes and it
  // slumps (the cells sink and spread, their junctions blur into one mass),
  // the colour drains to the palette's ash end, pits eat into the surface,
  // bacteria speckle it, the hyphae germinate on it and spread over it and out
  // across the plate, it breaks into pieces that sink into the substrate and
  // dissolve, and the plate keeps the stain under the network.
  const TIS = new Float32Array(TIS_N * 4);
  const TIS_C = new Uint8Array(TIS_N);
  const CL_DIR = new Float32Array(TIS_CLUST * 2);
  {
    let n = 0;
    for (let layer = 0; layer < 2; layer++) {
      const cnt = layer === 0 ? 36 : 18, R = layer === 0 ? 0.82 : 0.44;
      for (let i = 0; i < cnt; i++, n++) {
        const rr = R * Math.sqrt((i + 0.5) / cnt), th = i * 2.39996 + layer * 1.3;
        const r = 0.20 + 0.06 * hash1(n * 3.3);
        const x = Math.cos(th) * rr + (hash1(n * 1.1) - 0.5) * 0.05;
        const y = Math.sin(th) * rr + (hash1(n * 2.7) - 0.5) * 0.05;
        TIS[n * 4] = x;
        TIS[n * 4 + 1] = y;
        // a mound, not two discs: the lower layer's cells ride a little
        // higher toward the middle and the upper layer settles into them
        TIS[n * 4 + 2] = layer === 0
          ? r * (0.88 + 0.30 * (1 - rr / R))
          : r + 0.20 + 0.06 * (1 - rr / R);
        TIS[n * 4 + 3] = r;
        TIS_C[n] = Math.floor(((Math.atan2(y, x) + 3.1415927) / 6.2831853) * TIS_CLUST) % TIS_CLUST;
      }
    }
    for (let c = 0; c < TIS_CLUST; c++) {
      const a = ((c + 0.5) / TIS_CLUST) * 6.2831853 - 3.1415927;
      CL_DIR[c * 2] = Math.cos(a);
      CL_DIR[c * 2 + 1] = Math.sin(a);
    }
  }
  function updateDecomp(d, pressV) {
    const slump = smooth01(d / 0.30);
    const pit = smooth01((d - 0.26) / 0.52);
    const drain = smooth01((d - 0.10) / 0.78);
    const speck = smooth01((d - 0.30) / 0.25) * (1 - smooth01((d - 0.80) / 0.2));
    const frag = smooth01((d - 0.58) / 0.25);
    const sink = smooth01((d - 0.72) / 0.28);
    const stain = smooth01((d - 0.45) / 0.4);
    for (let i = 0; i < TIS_N; i++) {
      const o = i * 4, c = TIS_C[i];
      const spread = 1 + 0.22 * slump;
      let x = TIS[o] * spread + CL_DIR[c * 2] * 0.40 * frag;
      let y = TIS[o + 1] * spread + CL_DIR[c * 2 + 1] * 0.40 * frag;
      let z = TIS[o + 2] * (1 - 0.40 * slump) * (1 - 0.30 * pressV) - sink * (0.40 + 0.25 * hash1(i * 5.1));
      const r = TIS[o + 3] * (1 - 0.10 * slump) * (1 - 0.9 * sink * sink);
      raw[o] = x; raw[o + 1] = y; raw[o + 2] = z; raw[o + 3] = r;
    }
    packCells(TIS_N);
    // the junctions blur into one mass as the turgor goes, and the neck lets
    // go again as the mass breaks up, so the pieces separate instead of
    // stretching one skin between them
    // capped: the cull inflates its test spheres by the neck, so a neck as
    // wide as a cell puts far more of the mound into every ray's local list
    // than the list can hold, and the cells at the back are dropped in patches
    cellNeck = clamp(0.09 + 0.16 * slump - 0.20 * frag, 0.03, 0.17);
    cellCap = 3.0;
    U.uDec.value.set(slump, pit, speck, drain);
    U.uDec2.value.set(0.95 + 0.3 * stain, stain * (0.6 + 0.4 * sink), sink, Math.max(cellBound * 1.05 + 0.05, 0.6));
  }

  // --- state ------------------------------------------------------------------------
  // The organisms sit on the knob in the ORDER OF LIFE, and then its end: the
  // molecule first, then the cell and what it becomes, then the fungus, then
  // the mold; then the toxin at the molecule, the cell consumed, the body
  // decomposed.
  const ORG_HELIX = 0, ORG_CELL = 1, ORG_MYC = 2, ORG_SLIME = 3, ORG_TOXIN = 4, ORG_PHAGO = 5, ORG_DECOMP = 6;
  // then the world: the microscope, the currents, the day, and the five
  // weather systems in the order lightning, tornado, hurricane, wildfire,
  // sandstorm (weather.js's own indices: 2, 0, 1, 3, 4)
  const ORG_MICRO = 7, ORG_CURR = 8, ORG_DAY = 9, ORG_WX0 = 10, ORG_WX1 = 14;
  const WX_SYS = [2, 0, 1, 3, 4];
  const ORG_N = 15;
  // stages per plate: helix, cell line, mycelium, slime mold, toxin,
  // phagocytosis, decomposition, the focus (four), the regimes (six), the
  // day's phases (five), then the five weather plates (the level is the
  // intensity; a pad fires the main event, develop up / down step in sixths)
  const ORG_STAGES = [3, STAGES, 6, 6, 6, 6, 6, 4, 6, 5, 6, 6, 6, 6, 6];
  const isWx = (o) => o >= ORG_WX0 && o <= ORG_WX1;

  let level = 0, target = 0, dir = 1;
  let knobLvlPrev = null, knobOrgPrev = null, knobSpcPrev = null, strikePrev = 0;
  let orgTarget = ORG_HELIX, orgPos = ORG_HELIX;
  // The cold open: the plate is dark until the show starts, the first beat,
  // the transport playing, or any pad, and then the molecule comes up and
  // begins to replicate; everything else is the performer's.
  let opened = false, openS = 0, tpPrev = false, openAge = 0;
  // the strain the scene comes up on is the one the params declare, so a
  // project that saves species 0 gets species 0 and two launches of the same
  // show match; "no two runs look alike" lives in the seeded table and the
  // re-seed action, not in an unrepeatable draw at creation
  let speciesIdx = 0;
  let reseedN = 0;
  let paramMorph = null, paramSqueeze = null;
  let jig = 0, press = 0, bass = 0, mid = 0, high = 0, lvl = 0, dist = 3.4;
  let panX = 0, panY = 0, azim = 0, pulse = 0, beatPrev = 0, flow = 0;
  let hxS = 0.5, hyS = 0.5;  // the hand, smoothed, for the world plates
  let wxSys = 2;             // the weather system the weather plates last asked for (lightning)
  const bloom = { strength: 0, radius: 0.5, threshold: 0.6 }; // the weather's, weighted by its plate
  let mycSway = -1, mycDirty = true, mycMode = 0; // the mode the hyphae buffer holds: 0 the fungus, 1 the mould
  let hxSway = -1, hxLevel = -1, hxDirty = true;
  let seedOff = 0;
  let sickG = 0; // the toxin's sickening of the helix, smoothed

  function applySpecies() {
    const seed = speciesIdx * 13.37 + reseedN * 3.77 + 1.0;
    cellGrain = hash1(seed * 2.91);
    seedOff = (reseedN * 977 + speciesIdx * 131) & (RND_LEN - 1);
    slimeSpecies(seed);
    slimeReset();
    mycSpecies(seed);
    helixSequence(seed);
    mycDirty = true;
    hxDirty = true;
  }
  function stepLevel(s) {
    const org = clamp(Math.round(orgPos), 0, ORG_N - 1);
    const n = ORG_STAGES[org] - 1;
    const q = Math.round(target * n) + s;
    target = clamp(q, 0, n) / n;
  }
  // the daughter colonies a Volvox sphere carries, fixed positions inside the
  // parent, seen through its glassy wall (they sit still; nothing here turns)
  const DAUGH = [0.40, 0.30, 0.12, 0.26, -0.38, -0.22, 0.24, 0.22, 0.10, -0.46, -0.28, 0.19, -0.20, 0.44, -0.30, 0.16];
  for (let i = 0; i < 16; i++) daugh[i] = DAUGH[i];

  applySpecies();
  computeCells(0);
  growMycelium(0, seedOff, MYP, null);
  mycSway = 0;
  buildHelix(0, 0);
  hxSway = 0; hxLevel = 0;

  return {
    scene,
    camera,
    update(dt, t, io) {
      // ---- the cold open
      let openNow = false;
      if (!opened) {
        const tp = io.transport || null;
        const tpNow = !!(tp && tp.playing);
        const beat = io.beat > 0.6 && io.level > 0.12;
        if ((tpNow && !tpPrev) || beat || io.strike > 0.12) {
          opened = true;
          openNow = true;
          openAge = 0;
          // the opening element: the molecule replicating, the fork is stage 1 of the helix
          if (orgTarget === ORG_HELIX && target < 0.25) { dir = 1; target = 1 / (ORG_STAGES[ORG_HELIX] - 1); }
        }
        tpPrev = tpNow;
      } else {
        openAge += dt;
      }
      openS = approach(openS, opened ? 1 : 0, 0.6, dt);
      const openDim = Math.max(openS, 0.05 + 0.04 * io.level); // dark, not dead

      // ---- the plate: KNOB 6 in fifteenths of a turn, with hysteresis at the edges
      const k6 = io.knobs[5];
      if (knobOrgPrev === null) knobOrgPrev = k6;
      if (Math.abs(k6 - knobOrgPrev) > 1 / 256) {
        knobOrgPrev = k6;
        const band = 1 / ORG_N;
        const b = clamp(Math.floor(k6 * ORG_N), 0, ORG_N - 1);
        if (b !== orgTarget && (k6 < orgTarget * band - 0.012 || k6 > (orgTarget + 1) * band + 0.012)) orgTarget = b;
      }
      orgPos = approach(orgPos, orgTarget, 0.15, dt);
      const wMyc = Math.max(0, 1 - Math.abs(orgPos - ORG_MYC));
      const wSlime = Math.max(0, 1 - Math.abs(orgPos - ORG_SLIME));
      const wCell = Math.max(0, 1 - Math.abs(orgPos - ORG_CELL));
      const wHelix = Math.max(0, 1 - Math.abs(orgPos - ORG_HELIX));
      const wToxin = Math.max(0, 1 - Math.abs(orgPos - ORG_TOXIN));
      const wPhago = Math.max(0, 1 - Math.abs(orgPos - ORG_PHAGO));
      const wDecomp = Math.max(0, 1 - Math.abs(orgPos - ORG_DECOMP));
      const wMicro = Math.max(0, 1 - Math.abs(orgPos - ORG_MICRO));
      const wCurr = Math.max(0, 1 - Math.abs(orgPos - ORG_CURR));
      const wDay = Math.max(0, 1 - Math.abs(orgPos - ORG_DAY));
      // the weather as a whole: the five weather bands' weights sum (the
      // tents between two weather plates add to one, so the module's own
      // two-eye dissolve carries a change of system)
      let wWx = 0;
      for (let k = ORG_WX0; k <= ORG_WX1; k++) wWx += Math.max(0, 1 - Math.abs(orgPos - k));
      const wLife = wMyc + wSlime + wCell + wHelix + wToxin + wPhago + wDecomp;
      if (isWx(orgTarget)) wxSys = WX_SYS[orgTarget - ORG_WX0];

      // ---- the species: KNOB 7, quantized to the eight seeded parameter sets
      const k7 = io.knobs[6];
      if (knobSpcPrev === null) knobSpcPrev = k7;
      if (Math.abs(k7 - knobSpcPrev) > 1 / 256) {
        knobSpcPrev = k7;
        const s = clamp(Math.floor(k7 * 8), 0, 7);
        if (s !== speciesIdx && (k7 < speciesIdx * 0.125 - 0.012 || k7 > (speciesIdx + 1) * 0.125 + 0.012)) {
          speciesIdx = s;
          applySpecies();
        }
      }

      // ---- the level: KNOB 5 sets it, any strike steps one stage of what is
      // on screen (sixteen for the cell line, three for the helix, six each
      // for the simulations), reversing at the ends
      const k5 = io.knobs[4];
      if (knobLvlPrev === null) knobLvlPrev = k5;
      if (Math.abs(k5 - knobLvlPrev) > 1 / 256) {
        knobLvlPrev = k5;
        dir = k5 >= level ? 1 : -1;
        target = k5;
      }
      if (io.strike > strikePrev + 0.3 && openAge > 0.1) {
        // on a weather plate a pad is the system's main event; everywhere
        // else it steps the development one stage of what is on screen
        if (isWx(orgTarget)) wx.mainEvent();
        else {
          if (target >= 1 - 1e-3) dir = -1;
          else if (target <= 1e-3) dir = 1;
          stepLevel(dir);
        }
      }
      strikePrev = io.strike;
      level = approach(level, target, 1.3, dt);

      // ---- gestures: sway morphs, press squeezes, the hand pans and dollies.
      // An assigned morph / squeeze takes the larger of the two, so assigning
      // one never kills the gesture.
      const swayIn = paramMorph === null ? io.gestures.sway : Math.max(io.gestures.sway, paramMorph);
      const pressIn = paramSqueeze === null ? io.gestures.press : Math.max(io.gestures.press, paramSqueeze);
      jig = approach(jig, swayIn, 0.4, dt);
      press = approach(press, pressIn, 0.15, dt);
      panX = approach(panX, (io.xy.x - 0.5) * 1.6 * (1 - wHelix - wToxin), 0.3, dt);
      panY = approach(panY, (io.xy.y - 0.5) * 0.9, 0.3, dt);
      azim = approach(azim, (io.xy.x - 0.5) * 6.2831853, 0.25, dt);
      dist = approach(dist, 4.3 - io.xy.y * 1.9, 0.35, dt);
      bass = approach(bass, io.bands.bass, 0.12, dt);
      mid = approach(mid, io.bands.mid, 0.12, dt);
      high = approach(high, io.bands.high, 0.1, dt);
      hxS = approach(hxS, io.xy.x, 0.3, dt);
      hyS = approach(hyS, io.xy.y, 0.3, dt);
      lvl = approach(lvl, io.level, 0.25, dt);
      if (io.beat > beatPrev + 0.3) pulse = 1;
      beatPrev = io.beat;
      pulse = Math.max(0, pulse - dt * 3.5);
      flow += dt * (1.6 + pulse * 4.0);

      // ---- the cell line: which stages the level sits between, and how the
      // two fields are weighed against each other
      if (wCell > 0.002) {
        const L = level * (STAGES - 1);
        const s0 = clamp(Math.floor(L), 0, STAGES - 1);
        const s1 = Math.min(STAGES - 1, s0 + 1);
        const f = smooth01(clamp(L - s0, 0, 1));
        const k0 = KIND[s0], k1 = KIND[s1];
        let cellW = 1, protW = 0, fA = 0, fB = 0, fF = 0;
        if (k0 === 0 && k1 === 0) { cellW = 1; protW = 0; }
        else if (k0 === 1 && k1 === 1) { cellW = 0; protW = 1; fA = FORM[s0]; fB = FORM[s1]; fF = f; }
        else {
          // An aggregate-to-protist crossing: computeCells has ALREADY sent the
          // cells travelling onto the organism's own surface, so the analytic
          // body only comes up over the back half of the crossing. By then the
          // two surfaces coincide and the handover reads as the cells fusing
          // into one body, not as two lit specimens double-exposed.
          fA = fB = FORM[k0 === 0 ? s1 : s0];
          cellW = 1 - smooth01((k0 === 0 ? f - 0.5 : 0.5 - f) * 2);
          protW = 1;
        }
        // the amoeba's pseudopods stream out and draw back on a slow noise.
        // They are set BEFORE the cells are laid out, because the amoeba's cell
        // cloud runs seats out along them, the lobes and the cells that pour
        // into them have to agree within the frame.
        if (protW > 0.002 && (fA === 0 || fB === 0)) {
          for (let i = 0; i < 6; i++) {
            // evenly spread directions, each lobe streaming out and drawing
            // back on its own slow phase, cytoplasmic streaming, not rotation
            const yv = 1 - 2 * (i + 0.5) / 6;
            const rr = Math.sqrt(Math.max(0, 1 - yv * yv));
            const th = i * 2.39996 + 0.7;
            const ext = 0.42 + 0.66 * (0.5 + 0.5 * Math.sin(t * 0.31 + i * 1.9));
            pseudo[i * 4] = Math.cos(th) * rr * ext;
            pseudo[i * 4 + 1] = yv * ext * 0.92;
            pseudo[i * 4 + 2] = Math.sin(th) * rr * ext * 0.8;
            pseudo[i * 4 + 3] = (0.15 + 0.10 * hash1(i * 3.7)) * (1.35 - 0.5 * ext);
          }
        }
        computeCells(L);
        const zonaW = 1 - smooth01(clamp(L - 7, 0, 1));
        const cav = (s0 === 7 || s0 === 13 ? 1 - f : 0) + (s1 === 7 || s1 === 13 ? f : 0);
        const vlv = (s0 === 13 ? 1 - f : 0) + (s1 === 13 ? f : 0);
        const het = (s0 === 14 ? 1 - f : 0) + (s1 === 14 ? f : 0);
        // how far the sway jiggle carries on the analytic form; the cell
        // aggregate is all membrane and always takes it in full
        const soft = protW > 0.002 ? FORM_SOFT[fA] + (FORM_SOFT[fB] - FORM_SOFT[fA]) * fF : 1;
        // Each march carries its OWN bound. Folding the form's bound into one
        // shared number jumped the drawn zona 35 % wide the frame a protist
        // stage came into range, while its weight was still zero. The cells are
        // shaved off at the zona, so the aggregate's bound never reaches
        // further than the cap however far a packed seat sits out.
        const bc = Math.max(Math.min(cellBound, cellCap) * 1.04, ZONA * zonaW, 0.6);
        const bf = Math.max(Math.max(FORM_BOUND[fA], FORM_BOUND[fB]) * FORM_SCALE * 1.04, 0.6);
        let cilia = vlv * 0.008;
        if (protW > 0.002) {
          const pm = (fA === 1 ? 1 - fF : 0) + (fB === 1 ? fF : 0);
          cilia = Math.max(cilia, pm * 0.018 * (1 - cellW));
        }
        U.uFringe.value = vlv * 0.9;
        U.uFringeR.value = cellBound > 0.1 ? cellBound * 1.02 : 1.2;
        U.uCellW.value = cellW;
        U.uProtW.value = protW;
        U.uFormA.value = fA;
        U.uFormB.value = fB;
        U.uFormF.value = fF;
        U.uSoft.value = soft;
        U.uZonaW.value = zonaW;
        U.uBound.value = bc;
        U.uBoundF.value = bf;
        U.uNeck.value = cellNeck;
        U.uCap.value = cellCap;
        U.uCavity.value = cav;
        // the blastocoel fills the wall's inner surface; Volvox's cells are
        // individuals in a matrix, so its cavity runs almost out to them
        U.uCavR.value = 0.74 + 0.19 * vlv;
        U.uCilia.value = cilia;
        U.uDaughN.value = vlv > 0.02 ? 4 : 0;
        U.uHetero.value = het;
        U.uGrain.value = cellGrain;
      }

      // ---- the slime mold and the mycelium
      if (wSlime > 0.002) {
        slimeStep(jig, press, smooth01(level));
        U.uTintA.value = SP.tintA;
        U.uTintB.value = SP.tintB;
        U.uFoodN.value = SP.foodN;
      }
      // The hyphae buffer holds ONE network, the fungus, or the mould on the
      // corpse, so the heavier weight owns it. The two organisms are four
      // bands apart and their weights cannot overlap, but the buffer is shared
      // state and a claim on it belongs to one of them explicitly: two claims
      // in a frame would re-grow the colony twice and flicker between networks.
      const mycWant = wDecomp > wMyc ? 1 : 0;
      if (wMyc > 0.002 && mycWant === 0) {
        if (mycDirty || mycMode !== 0 || Math.abs(jig - mycSway) > 0.004) {
          growMycelium(jig, seedOff, MYP, null);
          mycSway = jig;
          mycMode = 0;
          mycDirty = false;
        }
        const n = mycCount(level);
        myc.g.instanceCount = n;
        MU.uCount.value = n;
      }

      // ---- the toxin: the helix rebuilt every frame under its damage (the
      // free molecules wander, the loose fragments drift), the clean helix
      // marked to rebuild when it comes back
      if (wToxin > 0.002) {
        buildToxin(level, jig, io.xy.y - 0.5, t);
        hxLevel = -1;
      }
      sickG = approach(sickG, wToxin > 0.002 ? smooth01((level - 0.1) / 0.8) : 0, 0.3, dt);

      // ---- phagocytosis
      if (wPhago > 0.002) updatePhago(level, jig, t);

      // ---- decomposition: the mass, and the mould on it
      if (wDecomp > 0.002) {
        updateDecomp(level, press);
        if (mycWant === 1 && (mycDirty || mycMode !== 1 || Math.abs(jig - mycSway) > 0.004)) {
          growMycelium(jig, seedOff, MYD, TIS);
          mycSway = jig;
          mycMode = 1;
          mycDirty = false;
        }
        if (mycWant === 1) {
          const n = mycCount(smooth01((level - 0.32) / 0.5));
          myc.g.instanceCount = n;
          MU.uCount.value = n;
        }
        U.uNeck.value = cellNeck;
        U.uCap.value = cellCap;
        U.uCilia.value = 0;
      }
      hyphae.visible = wMyc > 0.002 || wDecomp > 0.002;

      // ---- the helix
      if (wHelix > 0.002) {
        const devH = level * (ORG_STAGES[ORG_HELIX] - 1);
        if (hxDirty || Math.abs(devH - hxLevel) > 0.002 || Math.abs(jig - hxSway) > 0.002) {
          buildHelix(devH, jig);
          hxLevel = devH;
          hxSway = jig;
          hxDirty = false;
        }
      }
      helix.visible = wHelix > 0.002 || wToxin > 0.002;

      // ---- the palette's cold end (what the poisoned molecule sickens toward)
      // and its ash end (what the dead mass drains to), followed smoothly so a
      // hue rotation never flicks them
      const pl = io.palette;
      let ci = 0, cs = -9, ai = 0, as = -9;
      for (let i = 0; i < 5; i++) {
        const c = pl[i];
        const mx = Math.max(c.r, c.g, c.b), mn = Math.min(c.r, c.g, c.b);
        const cold = c.b - c.r;
        if (cold > cs) { cs = cold; ci = i; }
        // ash is the LEAST SATURATED stop, measured relative to its own
        // brightness, an absolute chroma test picks whichever stop is merely
        // darkest, and a dark violet is not ash
        const ash = -(mx - mn) / Math.max(mx, 1e-3);
        if (ash > as) { as = ash; ai = i; }
      }
      const kTint = 1 - Math.exp(-dt / 0.4);
      U.uCold.value.lerp(pl[ci], kTint);
      HU.uCold.value.copy(U.uCold.value);
      U.uAsh.value.lerp(pl[ai], kTint);

      // ---- uniforms
      for (let i = 0; i < 5; i++) {
        pal[i].value.copy(pl[i]);
        hxPal[i * 3] = pl[i].r; hxPal[i * 3 + 1] = pl[i].g; hxPal[i * 3 + 2] = pl[i].b;
      }
      mpal[0].value.copy(pl[0]); mpal[1].value.copy(pl[1]); mpal[2].value.copy(pl[2]);
      U.uTime.value = t;
      U.uDist.value = dist;
      U.uJig.value = jig;
      U.uPress.value = press;
      U.uBeat.value = pulse;
      U.uBass.value = bass;
      U.uHigh.value = high;
      U.uLevelA.value = lvl;
      U.uIntensity.value = io.intensity * openDim;
      U.uPan.value.set(panX, panY);
      U.uOrg.value.set(wMyc, wSlime, wCell, wHelix);
      U.uOrg2.value.set(wToxin, wPhago, wDecomp);
      U.uSick.value = sickG;
      U.uFlow.value = flow;
      MU.uPan.value.set(panX, panY);
      MU.uDist.value = dist;
      // under decomposition the squeeze is in the mass itself (the cells are
      // flattened on the CPU and the hyphae ride them), not in the projection
      MU.uPress.value = mycWant === 1 ? 0 : press;
      MU.uBass.value = bass;
      MU.uWeight.value = mycWant === 1 ? wDecomp : wMyc;
      MU.uLift.value = mycWant;
      MU.uBodyN.value = mycWant === 1 ? cellCount : 0;
      MU.uIntensity.value = io.intensity * openDim;
      MU.uBeat.value = pulse;
      MU.uHigh.value = high;
      MU.uTime.value = t;
      HU.uPan.value.set(panX, panY);
      HU.uDist.value = dist;
      HU.uPress.value = press;
      HU.uBass.value = bass;
      HU.uWeight.value = wHelix + wToxin;
      HU.uSick.value = sickG;
      HU.uAzim.value = azim;
      HU.uIntensity.value = io.intensity * openDim;
      HU.uBeat.value = pulse;
      HU.uHigh.value = high;
      HU.uTime.value = t;

      // ---- the world plates. The organism quad is the opaque base and is
      // drawn only while a life plate has weight; the world plates' quads
      // draw weighted and add, so a dissolve between different programs is
      // the cross-fade of two finished images. For the first two frames every
      // quad draws its 2-px patch instead (the warm frames), whatever the
      // weights.
      const warm = warmFrames > 0;
      if (warm) warmFrames--;
      quad.visible = wLife > 0.002 || warm;
      // the palette sorted cool -> warm by (r − b), in place, for the world
      // plates' tinting (the day's stop tables, the currents' ramp, the
      // microscope's two colours)
      const ord = PS.order;
      for (let i = 0; i < 5; i++) { warmth[i] = pl[i].r - pl[i].b; ord[i] = i; }
      for (let i = 1; i < 5; i++) {
        const k = ord[i];
        let j = i - 1;
        while (j >= 0 && warmth[ord[j]] > warmth[k]) { ord[j + 1] = ord[j]; j--; }
        ord[j + 1] = k;
      }
      PS.dt = dt; PS.t = t;
      PS.level = level; PS.intensity = level;
      PS.sway = jig; PS.press = press; PS.hx = hxS; PS.hy = hyS;
      // the world plates' dark floor sits a little higher than the organisms'
      // (a calm sky is faint, not black, the same floor Weather Systems had)
      PS.opened = opened; PS.openNow = openNow; PS.openS = openS; PS.openDim = Math.max(openS, 0.07 + 0.05 * io.level);
      PS.bass = bass; PS.mid = mid; PS.high = high; PS.pulse = pulse;
      PS.speciesHash = hash1(speciesIdx * 13.37 + reseedN * 3.77 + 2.0);
      PS.warm = warm;
      PS.sys = wxSys;
      PS.weight = wWx; wx.update(PS, io);
      PS.weight = wMicro; micro.update(PS, io);
      PS.weight = wDay; sea.update(PS, io);
      PS.weight = wCurr; curr.update(PS, io);
      // live bloom: the weather's, which its plate weight already scales
      bloom.strength = wx.bloom.strength;
      bloom.radius = wx.bloom.radius;
      bloom.threshold = wx.bloom.threshold;
    },
    bloom,
    // discrete events: pick a plate, step the development, re-seed, the
    // weather's events (the module takes them; strike lands in any weather
    // system)
    action(key) {
      if (key === 'mycelium') orgTarget = ORG_MYC;
      else if (key === 'slimeMold') orgTarget = ORG_SLIME;
      else if (key === 'cellLine') orgTarget = ORG_CELL;
      else if (key === 'doubleHelix') orgTarget = ORG_HELIX;
      else if (key === 'toxin') orgTarget = ORG_TOXIN;
      else if (key === 'phagocytosis') orgTarget = ORG_PHAGO;
      else if (key === 'decomposition') orgTarget = ORG_DECOMP;
      else if (key === 'microscopy') orgTarget = ORG_MICRO;
      else if (key === 'oceanCurrents') orgTarget = ORG_CURR;
      else if (key === 'theDay') orgTarget = ORG_DAY;
      else if (key === 'lightning') orgTarget = ORG_WX0;
      else if (key === 'tornado') orgTarget = ORG_WX0 + 1;
      else if (key === 'hurricane') orgTarget = ORG_WX0 + 2;
      else if (key === 'wildfire') orgTarget = ORG_WX0 + 3;
      else if (key === 'sandstorm') orgTarget = ORG_WX0 + 4;
      else if (key === 'developUp') { dir = 1; stepLevel(1); }
      else if (key === 'developDown') { dir = -1; stepLevel(-1); }
      else if (key === 'reseed') { reseedN++; applySpecies(); }
      else if (key === 'strike' || key === 'touchdown' || key === 'gust' || key === 'flareUp' || key === 'eyewall' || key === 'calm') wx.event(key);
    },
    // continuous parameters; the raw knobs above stay the fallback, whichever
    // moved last winning, and morph / squeeze ride alongside their gestures
    setParam(key, value) {
      if (key === 'development') { const v = clamp(value, 0, 1); dir = v >= level ? 1 : -1; target = v; }
      else if (key === 'organism') orgTarget = clamp(Math.round(value), 0, ORG_N - 1);
      else if (key === 'species') {
        const s = clamp(Math.round(value), 0, 7);
        if (s !== speciesIdx) { speciesIdx = s; applySpecies(); }
      } else if (key === 'morph') paramMorph = clamp(value, 0, 1);
      else if (key === 'squeeze') paramSqueeze = clamp(value, 0, 1);
    },
    resize(w, h) {
      U.uRes.value.set(w, h);
      MU.uRes.value.set(w, h);
      HU.uRes.value.set(w, h);
      for (const m of plateModules) m.resize(w, h);
    },
    dispose() {
      quad.geometry.dispose();
      mat.dispose();
      trailTex.dispose();
      myc.g.dispose();
      mycMat.dispose();
      hx.g.dispose();
      hxMat.dispose();
      for (const m of plateModules) m.dispose();
    },
  };
}
