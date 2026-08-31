// Will I Dream, the universe begins on the downbeat and you fly out of it:
// a cold open at the singularity, a big bang that resolves into the star
// field, hyperspace on the hand, a wormhole, a black hole, four flight
// ELEMENTS the flight runs into and out of (the tile corridor, the
// high-energy particle throat, the long textured tube with the mirror sphere,
// the relativistic warp), and a new celestial object waiting at the end of
// every crossing, grown in as the star trails come to rest.
//
//   COLD OPEN   The scene opens DARK. Nothing streams, nothing flies: one
//               very faint singularity ahead, the whole particle population
//               collapsed onto a single point, breathing with io.level, so
//               the stage reads as held, not dead. It waits for the show.
//   BIG BANG    On the RISING EDGE of io.transport.playing the singularity
//               ignites: 20,000-odd particles leave the point along their own
//               random velocities (Majid Manzarpour's pen, ported below), the
//               expansion decelerating as it ages; the light cools from
//               white-hot to the palette; the young universe gathers into
//               clusters as it ages; a panoramic sky washes in behind and
//               drains away again; and then, WITHOUT A CROSSFADE, the same
//               particles hand over (staggered, one by one) into their
//               slots in the star field and stream on toward the camera.
//               The bang IS the star field's first ten seconds.
//               A pad assigned to `big bang` fires it without the transport,
//               and while the scene is dark ANY pad ignites it, so a project
//               with no timeline is never stuck in the dark, and so does
//               THE FIRST BEAT the analyser hears (io.beat > 0.6 with
//               io.level > 0.12, the same test the other opening scenes use),
//               because this scene stands in the Auto-VJ pools where no
//               transport runs and no pad is ever struck. A beat-ignited
//               universe behaves exactly like a pad-ignited one; the
//               transport semantics below are unchanged.
//               STOP then PLAY restarts the universe (the transport is back
//               at 0: the scene returns to the singularity and bangs again).
//               PAUSE then PLAY does not (the position is kept: the flight
//               simply resumes, a paused transport never freezes the
//               flight). The restart is read off the transport's POSITION,
//               not off the edge of `playing` alone: a scene only sees the
//               clock on the frames it is rendered, so a show stopped and
//               started while Will I Dream was off screen would otherwise
//               come back mid-flight with the cold open silently skipped.
//               A clock at the top, or one that has moved BACKWARDS since
//               this scene last looked, a stop, a scrub back, a loop seam,
//               is a new run of the show and gets a new universe, however
//               long ago it happened and whoever was on screen at the time
//               (a bang already running is left alone, so a short loop cannot
//               strobe universes). A scene that comes on screen with the show
//               ALREADY underway, the position well past the start and never
//               having moved back, opens in the flight instead: the bang
//               belongs to the downbeat and there is not one to wait for.
//   FLIGHT      Nothing applied at rest: the star field streams TOWARD the
//               camera (forward motion only, no roll, no drift, no orbit,
//               nothing spins). Stars are palette tints pulled toward white;
//               the level breathes their brightness, treble twinkles them.
//   HYPERSPACE  The hand drives it. Warp lives on X and Y together and peaks
//               at the highest X, lowest Y, right of the deck, close to the
//               sensors: X sets the speed, closeness (1 − Y) the density;
//               their product is the warp amount, zero with the hand at rest.
//               THE STARS THEMSELVES BECOME THE STREAKS: every star is a
//               screen-space capsule from where it is to where it was a
//               shutter ago, so the streaks radiate from the vanishing point
//               along each star's own line of flight, random, never a
//               pattern. SWAY is the distribution control: it morphs the
//               field from random scatter toward an ordered lattice and back.
//               Past 0.55 the jump engages (speed ×30, long streaks); under
//               0.25 it ends, a flash, deceleration, and a NEW celestial
//               object ahead. The `hyperspace jump` action runs the same
//               envelope from a pad with no hand at all.
//   OBJECTS     Thirteen bodies, analytically ray-cast on one camera-facing
//               quad, static forms, never the same twice running: pulsar,
//               spiral galaxy, solar system, the volumetric "Nebula Madness"
//               remnant, ringed giant, HALO ringworld, DYSON SHELL (a shell
//               that grew out of one equatorial ring and is nowhere near
//               finished: solid plate inside the build front, nothing outside
//               it, the front itself ragged and wandering with longitude, and
//               whole longitude sectors nobody has started, through those
//               the star burns, and past it you see the far shell's panels
//               lit from inside by the star they enclose), DERELICT SHIPYARD
//               (a broken hull in two pieces with a gash between them, deck
//               and spine lights and two nav beacons still running on the
//               level, and a field of tumbling debris whose tumble is the
//               hand's, sway turns every chunk, nothing turns by itself),
//               VOLCANIC WORLD (basalt crust with a sunlit half; a fissure
//               network and lava basins that emit their own light, dull red
//               at the edge of a flow and white only in its core, so across
//               the terminator the cracks are the ONLY thing you see, under
//               an ash haze), ICE WORLD (crevasse fields, a hard sheen, limb
//               scatter), BANDED GAS GIANT (zonal bands sheared by
//               turbulence, three fixed storm ovals whose filaments stream
//               along the band, the largest of them placed on the face that
//               is turned toward the eye), OCEAN WORLD (a wave-roughened sun
//               glint and domain-warped cloud swirls) and TERRESTRIAL WORLD
//               (land, sea, ice caps, cloud, and city lights clustered on the
//               coasts of its night side).
//   ARRIVAL     A body never pops in at its size: it GROWS from a point at
//               the place it arrives, over 1.6 s on an ease-out (quick to
//               read, slow to settle), under the same alpha fade as before.
//               And whatever arrives at the END OF A JUMP, a body, or one of
//               the four elements below, is SCALED BY THE DECELERATION: the
//               arrival is spawned the moment the jump starts to wind down
//               (warpS falling back through 0.5, not at the 0.25 exit), and
//               its growth is min(the 1.6 s time ease, a smooth ease of
//               (1 − s)) where s is the normalised streak length, the current
//               tail over the tail at that jump's peak, so while the streaks
//               are long the arrival is a point, it grows as they shorten,
//               and it is full only when the stars have stopped. The growth
//               is monotonic (a thrust surge stretching the streaks pauses it,
//               never shrinks it). The same rule runs the wormhole transit's
//               exit body (its exit flash and speed drop are the deceleration
//              , the flight now decelerates out of the throat instead of
//               snapping to cruise), the throat's and the tube's exit bodies,
//               and the body that arrives as the relativistic warp settles
//               (the aberration smear counts as streak). `spawn object` fired
//               in cruise keeps the 1.6 s ease, there is no deceleration to
//               follow. The black hole's re-emergence still spawns nothing.
//   ELEMENTS    Four things the flight can RUN INTO, each a destination the
//               next jump or transit can end in (`next arrival`) and an event
//               a pad fires now. Each comes up AHEAD on the flight axis at
//               150 to 200 units (the approach reads), grows in under the
//               arrival rule, the flight enters it, runs through it, and
//               comes out into a re-seeded field, same camera, forward only,
//               the same star field around it; nothing is a crossfade to a
//               different picture. They are mutually exclusive with each
//               other, the black hole and the wormhole: one fired while
//               another runs ends the running one cleanly (its exit comes up
//               early) and opens once it has cleared; one fired during a jump
//               ends the jump into the element; the same one fired again
//               while inside ends it.
//   TUNNEL END  Rizki Gunawan's tile corridor (MIT, below): two rows of
//               glowing palette tiles, floor and ceiling, 31 lanes, FogExp2,
//               one InstancedMesh under one GLSL3 material. The mouth opens
//               ahead, the flight enters and the tiles stream past at FLIGHT
//               speed (the level lifts it, strikes kick it); the hand slides
//               the eye across the corridor and between floor and ceiling;
//               sway tightens lanes, gap and depth and ROLLS the corridor
//               about the flight axis, by hand only, never accumulated,
//               press narrows it, the beat flashes the tiles, bass hazes the
//               fog; the pen's bloom 3 / 0 / 0 rides the live bloom while
//               inside. ~10 s down a 300-unit corridor, then the far end opens
//               and the field (re-seeded as the mouth swallowed the eye) is
//               back at full brightness. No autonomous roll.
//   WORMHOLE    DULA's high-energy particle throat (MIT, below): the stateless
//   PT 1        vertex-shader tunnel field (120k / 300k / 600k by tier) and
//               the faint wireframe tunnel, forming AHEAD and growing in; the
//               flight is drawn down it, sway is the stability (foam <-> the
//               stable beam), press holds it stable, a strike is a zeta shock,
//               the hand bends the beam, bass swells the speed, the beat
//               pulses; shake is translation of the throat, never a roll. At
//               the end of the run the throat OPENS around the eye (the wall
//               blooms outward and fades) and the flight is out in a re-seeded
//               field with a new body growing in on the deceleration. The
//               pen's colour logic (the two coolest / two warmest palette
//               pairs), the alpha cap and the 0.8 / 0.3 / 0.85 bloom are kept.
//   WORMHOLE    fuad's long scrolling tube with the MIRROR SPHERE at its end
//   END         (MIT, below), analytic on one quad: the tube's mouth opens
//               ahead as a disc showing the interior (the ellipsoid's far
//               root, both pole caps open), the flight enters, travels up the
//               tube toward the sphere hanging near its far end, the hand
//               pans the eye across the tube and nudges it along, sway morphs
//               the layer weights and flow tightness, press squeezes the tube,
//               the beat pulses the sphere's emissive, bass lifts the scroll,
//               strikes kick it, passes the sphere (dead on, it FILLS the
//               frame as a flash) and goes out through the far cap into a
//               re-seeded field with a new body. The sphere does not spin.
//   RELATIVISTIC The hard-science regime from the old Wormhole scene, as a
//   WARP        sustained cruise instead of the hyperspace streak: the star
//               field crowds forward by relativistic aberration (each star's
//               view direction remapped by cos θ' = (cos θ + β)/(1 + β cos θ))
//               and every streak runs along its great circle toward the
//               travel direction; Doppler blues and brightens what lies
//               ahead and reddens the periphery; behind the box field the
//               procedural panorama comes up and is streaked the same way,
//               STREAK_K samples along the aberration path (a uniform loop
//               bound, so the sky program stays compact); the limb-darkened
//               G-type star with its breathing corona stands ahead as a BODY
//               the flight passes (shape 14, `next object` 14); sway sets the
//               velocity 2^((sway − 0.5)·2.6). ~8 s, then it settles back to
//               cruise and a new body arrives on the deceleration. Its
//               wormhole mouth is NOT a second wormhole: what is distinct is
//               folded into the existing transit, the mouth's thin lens now
//               bends the panorama (the star SPHERE) as well as the box field
//               while a regime is up, and the Einstein ring at the photon
//               radius brightens under it. No new pass: the star shader and
//               the sky shader take uniforms.
//   SCALE AND   `object scale` sets apparent size and applies LIVE to
//   PLACEMENT   whatever is on screen. `object x`, `object y`, `object
//               distance` and `next object` apply to the NEXT object to
//               arrive, so a performer places each jump's arrival before it
//               happens and never teleports the one already in the frame.
//               Each of the four keeps the scene's own random placement until
//               the performer first moves it, and x and y keep it one axis at
//               a time, assign only `object x` and the vertical scatter is
//               still the scene's. A body begins to fade at its own radius,
//               so the flight never passes through one, and the size has a
//               ceiling at the body's own distance: past it the eye would end
//               up INSIDE the body, every ray would miss, and the quad would
//               be paying full-frame fill for nothing. The ceiling is the
//               MAPPING, not a silent clamp, the travel above 1× is stretched
//               into whatever headroom the distance leaves, so the top of the
//               knob always reaches the ceiling and 1× is always 1×. Since the
//               ceiling is proportional to the distance, `object distance`
//               raises it: at the 900-unit default a body tops out near 3×,
//               and only past ~1800 units does the declared 6× fit.
//   WORMHOLE    Its own event, neither the hole nor the jump. A throat opens
//               ahead: a mouth disc showing ANOTHER sky (a second seed,
//               different stars, different nebulae) while the star field
//               around it bends inward on a thin-lens deflection and the
//               flight is drawn in, speed climbing. The mouth swallows the
//               frame, and inside is the tunnel: the wall is the sky you LEFT
//              , smeared around the tube, dimming as it recedes, ringed with
//               lensing bands streaming past, and the aperture ahead is the
//               sky you are going TO, both visible in the same frame. The
//               aperture rushes up, takes the screen in a flash, and you are
//               out in a re-seeded field with a new object ahead.
//   BLACK HOLE  PAD 7 opens it at the center, Darryl Huffman's "Black Hole
//               (WebGL Shader)" lens (the user's BLACKHOLE.zip), its maths
//               kept: pull = mass / dist², the view is rotated about the mass
//               by (pull + held)·π, with the sine term at zero, as upstream
//               ships it, that is a signed radial scaling that collapses and
//               inverts the sky in concentric rings, and every pixel is
//               darkened by pull·0.25, which blacks out the core. The pen's
//               mass eases in (cur += (target − cur)·0.03 per frame); then,
//               as with its held click, the hold value climbs so the rings
//               sweep inward while the mass grows until its own darkening
//               covers the screen (the swallow from the center out) then a
//               beat of void and re-emergence into a re-seeded sky with NO
//               celestial object; a jump in progress ends into the hole
//               instead of spawning one. The lens is applied to the stars'
//               streak endpoints and the object quad; the overlay carries the
//               darkening. As the mass comes fully into view a high-resolution
//               panoramic sky fades in behind everything, procedural and
//               therefore resolution-free (stars at three densities, a Milky
//               Way band with dust, nebula fields), since scenes load no
//               files, and the pen's shader samples THAT sky per pixel at
//               the rotated coordinate, so the ring inversion reads on a
//               textured sky and the hole's interior shows the mirrored sky:
//               the reflective lensing on the hole itself.
//   BANKS       PAD 8 banks left, PAD 15 banks right: the only rotation in
//               the scene, a 2.4 s roll-and-yaw that levels out again; the
//               stars sweep sideways with the turn.
//
// THE CONTROL SURFACE. Everything above is assignable, meta.controls
// declares thirteen actions (big bang, black hole, hyperspace jump, wormhole
// transit, bank left, bank right, thrust surge, spawn object, swallow and
// re-seed, tunnel end, wormhole pt 1, wormhole end, relativistic warp) and
// eight parameters (object scale, object x, object y, object distance, next
// object, warp amount, star distribution, next arrival), and action() /
// setParam() implement them, so any pad, knob, button or gesture reaches them
// through the normal assignment UI. `next arrival` (0 to 4) picks what waits at
// the end of the NEXT hyperspace jump or wormhole transit, 0 a body (the
// scene's own scatter), 1 the tunnel end, 2 wormhole pt 1, 3 wormhole end, 4
// the relativistic warp, and holds until moved; nothing consumes it. The
// hard-wired pads stay as the no-assignment fallback: PAD 7 the black hole,
// PAD 8 / PAD 15 the banks, any other pad a thrust surge (or the ignition,
// while the scene is dark). `warp amount` and `star distribution` take the
// maximum of the hand and the assigned value, so an assignment adds to the
// hand instead of fighting it. No raw knob is read.
//
// Pads are numbered as the deck shows them (0 to 15). Seven draw calls at most,
// four in cruise, in this order: the sky quad (the panorama behind the black
// hole, the wash behind the young universe, the relativistic warp's streaked
// sky, and the wormhole's tunnel), the stars (one instanced mesh of streak
// capsules, which is also the big bang's particle system), the celestial
// object (one camera-facing quad of analytic ray-cast bodies, drawn ABOVE the
// stars so a solid body occludes the field behind it), the corridor tiles
// (one InstancedMesh, additive), the throat (one Points and one LineSegments,
// additive), the tube quad (premultiplied, covering) and the overlay quad
// (black hole darkening, singularity core, wormhole rim, vanishing-point glow,
// flash; premultiplied-additive so one pass adds light and occludes). An
// element's meshes are not drawn, and cost nothing, while it is off; every
// one of them is visible at creation so the warm pipeline links it, hidden by
// the first update(), and draws its first two frames as a two-pixel patch at
// zero alpha (see warmFrames). Bloom is a LIVE request: zero at rest, no
// effects with nothing applied, rising for the bang (the pen's 2.0 / 0.5 /
// 0.0), the exit flashes, the wormhole, and each element's own numbers while
// it is inside (the corridor 3 / 0 / 0, the throat 0.8 / 0.3 / 0.85, the warp
// 0.55 + 0.45·β).
//
// PORT, "Big bang simulation three.js", Majid Manzarpour
// (https://codepen.io/Majid-Manzarpour/pen/PwYrYdg), which ships as:
//
//     The MIT License (MIT)
//     Copyright (c) 2026 Majid Manzarpour
//     Permission is hereby granted, free of charge, to any person obtaining a
//     copy of this software and associated documentation files (the
//     "Software"), to deal in the Software without restriction, including
//     without limitation the rights to use, copy, modify, merge, publish,
//     distribute, sublicense, and/or sell copies of the Software, and to
//     permit persons to whom the Software is furnished to do so, subject to
//     the following conditions: the above copyright notice and this
//     permission notice shall be included in all copies or substantial
//     portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT
//     WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//     THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
//     NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
//     LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
//     OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
//     WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// CHANGES FROM THAT ORIGINAL:
//   * The model is kept: every particle starts at the singularity with a
//     random direction on the sphere (theta uniform, phi = acos(2u − 1)) and
//     a speed in [0.5, 1.0], and position integrates outward along it. Here
//     the integration is a single scalar (the expansion radius) evaluated
//     on the CPU and the position rebuilt in the vertex shader from the
//     particle's own velocity, so the 20,000 positions are never written per
//     frame (hard rule 3: no per-frame allocation, and no 240 KB upload).
//     The pen's constant expansionSpeed becomes a decelerating one,
//     R = R∞·(1 − e^(−t/τ)), because the expansion has to ARRIVE somewhere:
//     it settles into the flight's box instead of running off to infinity.
//   * The CanvasTexture sprite is gone (scenes build no textures): the soft
//     point is drawn analytically in the fragment shader as the capsule
//     profile the star field already uses, so a bang particle and a star are
//     the same primitive, which is what makes the handover continuous.
//   * dat.GUI and OrbitControls are gone; nothing orbits (hard rule 8). The
//     pen's UnrealBloom (strength 2, radius 0.5, threshold 0) is requested
//     through the engine's per-scene bloom, live, and only while the bang,
//     a flash or the wormhole needs it.
//   * The galaxy cluster the pen adds at t > 10 s as a second 5,000-point
//     system becomes structure formation inside the SAME population: as the
//     universe ages the particles gather toward fourteen cluster directions
//     (the young universe going lumpy) with no second draw call.
//   * The nebula the pen adds at t > 15 s as a 500-unit textured BackSide
//     sphere becomes the scene's existing procedural panoramic sky quad,
//     washing in behind the expansion and draining out again as the flight
//     takes over, so the cruise afterwards is exactly the cruise before.
//   * Colour is palette-driven: white-hot at ignition, cooling into
//     io.palette as the universe ages.
//
// Other sources, all MIT CodePen exports in the user's ScifiUI folder,
// re-written here as palette-driven shaders under docs/SCENE_CONTRACT.md: the
// warp-line star field idea (Jamie, "Wormhole"), the lensing pull (Darryl
// Huffman, "Black Hole (WebGL Shader)"), the in-falling horizon (Sean Free,
// "#codevember 13"), the cosmic objects (Techartist, "Cosmic Anomaly
// Visualizer"), the forward-only flight (Rizki Gunawan, "Threejs SciFi
// Flight"), the nebula remnant (Filip Zrnzevic, "threejs-nebula-madness",
// after Duke's supernova) and the ringworld (Rob Glazebrook, "Halo").
//
// PORT, the TUNNEL END element: "Threejs SciFi Flight", Rizki Gunawan
// (https://codepen.io/mrizkigunawan/pen/NPNjQdE), MIT License, Copyright (c)
// 2026 Rizki Gunawan. Permission is hereby granted, free of charge, to any
// person obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions: the above copyright notice and this permission notice
// shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.
//   The pen: 800 unit planes lying flat (rotation.x = -pi/2) on integer lanes
//   x = round(rand * 30) - 15.5 (31 lanes, 30 units wide), in two rows, floor
//   y = 0 and ceiling y = 4, at depths z = round(rand * -80) - 0.5, each a
//   flat MeshBasicMaterial in one of five hex colours (0x4e5dff, 0x6a00ff,
//   0x00c8ff, 0x12005e, 0x03204d), scrolling toward the camera at 0.05 per
//   frame and wrapping from z > 4 back to -81; FogExp2 black at 0.02; the
//   camera at (0, 2, 5), fov 75; UnrealBloom strength 3, radius 0, threshold
//   0; and camera.rotation.z += 0.0006 every frame.
//   CHANGES FROM THE ORIGINAL:
//   * The autonomous roll is gone (hard rule 8). The corridor rolls only as
//     far as the hand SWAYS, and levels when the sway does.
//   * The 800 meshes (800 draw calls, 800 materials) are ONE InstancedMesh
//     under one GLSL3 ShaderMaterial: each instance carries its lane, row,
//     depth along the corridor and palette slot in a static attribute; the
//     position is evaluated in the vertex shader, so the CPU pushes only
//     uniforms. FogExp2 is evaluated in the fragment shader with three.js's
//     own formula (1 - exp(-(d * depth)^2) toward the fog colour).
//   * The pen's infinite scrolling loop becomes a FINITE corridor standing in
//     the flight's world (300 units, ~1,100 tiles at the pen's density, the
//     pen's units scaled ×2.6 to the flight's), its mouth ahead on the flight
//     axis; the tiles stream past because the flight flies through it, at
//     the flight's speed, and the far end opens when the eye reaches it. The
//     tiles are additive over the (dimmed) star field instead of opaque over
//     black, so the same FogExp2 dissolves the far end into the field.
//   * The five hex colours become the five io.palette entries (slot i -> the
//     i-th entry), copied into a uniform array every frame, scaled by
//     io.intensity; the pen's bloom is requested through the live bloom
//     object only while the corridor is inside.
//   * The hand's eye offset and the sway's roll move the corridor about the
//     eye (the same relative motion), because the flight's camera belongs to
//     the star field.
//
// PORT, the WORMHOLE PT 1 element: "PIE: High-Energy Wormhole (V3 - Tuned)",
// DULA (https://codepen.io/DULA2025/pen/dPXjxKQ), MIT License, Copyright (c)
// 2026 DULA. Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including without
// limitation the rights to use, copy, modify, merge, publish, distribute,
// sublicense, and/or sell copies of the Software, and to permit persons to
// whom the Software is furnished to do so, subject to the following
// conditions: the above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software. THE
// SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.
//   The pen simulated 1,048,576 particles with GPUComputationRenderer, a
//   position pass (pos += vel·dt, respawn at z = −2500 on a ring of radius
//   400·(0.8..1.2) once past z = 200) and a velocity pass (confinement toward
//   a dynamic radius, a tangential spin force ·stability, simplex foam
//   ·(1 − stability), a mouse warp force ·(1 − stability), forward
//   acceleration toward 120·(0.3 + 0.7·stability), damping 0.96), with a
//   48 × 40 wireframe tunnel and bloom 0.8 / 0.3 / 0.85.
//   CHANGES FROM THE ORIGINAL:
//   * A scene may not run compute passes, so the motion is re-expressed
//     STATELESSLY in the vertex shader from per-particle seeds plus a few
//     integrated scalars: z is the lap, −2500 + mod(z0 + travel·sv, 2700)
//     (travel integrated on the CPU so bass swelling the speed never snaps
//     positions, sv a per-particle speed step); the radius settles from the
//     spawn ring onto 400 + zeta(z, t)·80·(1 − stability); the swirl is a
//     per-particle angular advance on an integrated phase that only grows
//     while stability is up (shearing flow, not a rigid turn, and nothing at
//     stability 0); the foam is one coherent 3-D simplex field of ~150 units
//     ·(1 − stability); the mouse pull is a translation of the beam toward
//     the hand target. 120k / 300k / 600k particles by tier, each a little
//     brighter than the pen's (alpha scaled by sqrt(1M / count), capped).
//   * The throat is an ELEMENT of the flight: the tunnel's mouth (its z = 200
//     plane, where the pen's eye sat) is placed ahead on the flight axis at
//     0.15 of the pen's scale, grows in under the arrival rule, and the flight
//     flies INTO it and down it (the eye moves, the particles stream) and
//     at the end of the run the wall blooms open and fades. The pen's fixed
//     eye at the mouth is the moment of entry.
//   * The camera shake is a translation of the throat, never of the flight's
//     camera, and never a roll. The pen ran under Reinhard tone mapping;
//     without it the additive sum whites out, so each sprite is held lower
//     and the alpha is capped at one.
//   * Colour keeps the pen's speed/stability logic with the two pairs drawn
//     from io.palette each frame, the stable pair from the two coolest
//     entries (toward white), the unstable pair from the two warmest.
//
// PORT, the WORMHOLE END element: "wormhole", fuad
// (https://codepen.io/SafeOsprey52158/pen/RwGjZmd), The MIT License (MIT),
// Copyright (c) 2026 fuad. Permission is hereby granted, free of charge, to
// any person obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to the
// following conditions: The above copyright notice and this permission notice
// shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.
//   The pen: a sphere of radius 4 scaled (1, 20, 1) into a long tube, drawn
//   from the inside (BackSide MeshBasic) with a patched map chunk that
//   samples one photo (mirrored repeat) in three scrolling layers,
//     uv = vUv · (2, 10) + 0.5;  o = map(uv)
//     nu = 0.3 · map(uv · 2 + (0, t + o.b))    // water
//        + 0.1 · map(uv + t)                   // cyclone
//        + 0.6 · (map(uv + (0, t)) + 0.5)      // closest
//     C  = pow(nu + 0.1, 4)                    // t = time · 0.0001
//  , a mirror sphere (MeshStandard, metalness 1, roughness 0, a CubeCamera
//   env map, a second photo as its map, white emissive 0.12) at the origin,
//   and the camera at (−1, −4, 1) looking at (−1, 4, 0) up the tube; gsap
//   spun the sphere.
//   CHANGES FROM THE ORIGINAL:
//   * The whole thing is ONE fullscreen GLSL3 quad that ray-traces the
//     geometry analytically: the tube is the interior of the same ellipsoid
//     (semi-axes 4, 80, 4) hit at the ray's far root, the hit point giving
//     the pen's sphere UV and the tube colour the pen's three-layer mix and
//     pow(nu + 0.1, 4) verbatim; the photo is a PROCEDURAL tile (scenes load
//     no images), a two-channel value-noise fbm over mirrored-repeat
//     coordinates, one channel the luminance, one the warmth, tinted from
//     io.palette (warm = 3/4 toward white, cool = 2/0), the warmth doubling
//     as the pen's o.b displacement. The sphere's CubeCamera reflection is
//     the reflected view ray re-intersected with the tube through the same
//     colour function (no second render); the second photo becomes the
//     metal's F0 tint under a Schlick fresnel, plus the white emissive the
//     beat pulses and a fresnel rim. The sphere's gsap spin is not carried
//     over (hard rule 8).
//   * The tube is an ELEMENT of the flight, its axis the flight axis at three
//     flight units per pen unit: both pole caps are OPEN (the hit's |y| past
//     0.975 of the semi-axis is transparent), so from outside the mouth is a
//     disc showing the interior, and the eye flies in through it, up the
//     tube, past the sphere (moved to y = 60, near the far end, so the run
//     is mostly the approach to it) and out through the far cap. The pen's
//     camera dolly becomes the flight's own motion; the hand nudges it.
//   * The pen's fov 75 becomes the flight's 62, and the camera's bank roll
//     turns the quad with the field.
//
// The RELATIVISTIC WARP folds in the scene that was registered as `warp`
// ("Wormhole", this repository's own hard-science quad: aberration, Doppler,
// the limb-darkened G star, the thin-lens mouth with its Einstein ring). Its
// DRIFT regime is the panorama this scene already had; its WARP regime is the
// element; its WORMHOLE regime is folded into the existing transit, not built
// a second time.

// `object scale`'s declared range, shared by meta.controls, setParam and the
// distance mapping in update() so the three can never drift apart.
const SCALE_MIN = 0.2;
const SCALE_MAX = 6;
const GROW_LEN = 1.6; // seconds a new body takes to grow from nothing to its size
const GROW_FLOOR = 0.015; // where the growth starts, not zero, so 1/uScale stays finite

export const meta = {
  id: 'willidream',
  name: 'Will I Dream',
  mood: 'lucid',
  // Declared for the assignment UI, which lists these without instancing the
  // scene; the router dispatches scene:willidream:<key> to action()/setParam().
  controls: {
    actions: [
      { key: 'bigbang', label: 'big bang' },
      { key: 'blackhole', label: 'black hole' },
      { key: 'hyperspace', label: 'hyperspace jump' },
      { key: 'wormhole', label: 'wormhole transit' },
      { key: 'bankLeft', label: 'bank left' },
      { key: 'bankRight', label: 'bank right' },
      { key: 'thrust', label: 'thrust surge' },
      { key: 'spawn', label: 'spawn object' },
      { key: 'swallow', label: 'swallow and re-seed' },
      { key: 'tunnelEnd', label: 'tunnel end' },
      { key: 'wormholePt1', label: 'wormhole pt 1' },
      { key: 'wormholeEnd', label: 'wormhole end' },
      { key: 'warp', label: 'relativistic warp' },
    ],
    params: [
      { key: 'objectScale', label: 'object scale', min: SCALE_MIN, max: SCALE_MAX, default: 1 },
      { key: 'objectX', label: 'object x', min: -1, max: 1, default: 0 },
      { key: 'objectY', label: 'object y', min: -1, max: 1, default: 0 },
      { key: 'objectDistance', label: 'object distance', min: 200, max: 2000, default: 900 },
      { key: 'objectNext', label: 'next object', min: 0, max: 14, default: 0 },
      { key: 'warpAmount', label: 'warp amount', min: 0, max: 1, default: 0 },
      { key: 'starDistribution', label: 'star distribution', min: 0, max: 1, default: 0 },
      { key: 'nextArrival', label: 'next arrival', min: 0, max: 4, default: 0 },
    ],
  },
};

const PADS = 16;
const PAD_BLACKHOLE = 7; // deck PAD 7
const PAD_BANK_LEFT = 8; // deck PAD 8
const PAD_BANK_RIGHT = 15; // deck PAD 15
const SHAPES = 13; // the bodies the scene picks among on its own
const SHAPE_SUN = 13; // the relativistic warp's G-type star (`next object` 14 reaches it too)
// the four elements, in `next arrival` order
const EL_NONE = 0, EL_CORRIDOR = 1, EL_THROAT = 2, EL_TUBE = 3, EL_WARP = 4;
const ELEM_SPAWN_Z = [0, 220, 260, 230, 0]; // how far ahead each element's mouth forms
// tunnel end: the pen's corridor in the flight's units
const CORR_S = 2.6; // flight units per pen unit
const CORR_LEN = 420; // the corridor's length in flight units (~8 to 12 s at the speed inside)
const CORR_LANES = 31;
const CORR_LANE_OFFSET = -15.5;
const CORR_GAP = 4; // pen units: floor y = 0, ceiling y = 4
const CORR_ROLL_MAX = 0.75; // the sway's roll, radians
const CORR_FOG_D = 0.02; // the pen's FogExp2 density, per pen unit
// wormhole pt 1: the pen's throat in the flight's units
const TH_S = 0.15; // flight units per pen unit
const TH_RADIUS = 400;
const TH_LENGTH = 2500;
const TH_LAP = TH_LENGTH + 200; // spawn at −2500, respawn past 200
const TH_SPEED_STEPS = 9; // sv = 0.8 + k·0.05, k in 0..8, so 20·sv is an integer
const TH_TRAVEL_WRAP = TH_LAP * 20; // every sv·TRAVEL_WRAP is a whole number of laps
const TH_SWIRL_BASE = 0.31 / 8; // rad/s per swirl step at full stability
const TH_SWIRL_WRAP = (Math.PI * 2) / TH_SWIRL_BASE; // every rate·SWIRL_WRAP is a whole turn
const TH_RUN = 2800 * TH_S; // flight units down the throat before it opens
// wormhole end: the pen's tube in the flight's units
const TUBE_S = 3; // flight units per pen unit
const TUBE_R = 4; // the pen's sphere radius
const TUBE_LEN = 80; // radius × the (1, 20, 1) scale: the ellipsoid's y semi-axis
const TUBE_SPH_Y = 60; // the mirror sphere, near the far end
const TUBE_RATE = 0.1; // the pen's t = ms × 0.0001 -> 0.1 uv units per second
// relativistic warp: ramp, hold, settle
const REL_RISE = 1.5, REL_HOLD = 5.0, REL_FALL = 1.6;
const REL_SUN_Z = 1000; // where the G star forms; the flight, at warp, passes it inside the hold
const FOV = 62;
const TAN_HALF = Math.tan((FOV * Math.PI) / 360);
const BOX_W = 420;
const BOX_H = 280;
const BOX_DEPTH = 700;
const BOX_NEAR = 8;
const CRUISE = 22;
const WARP_GAIN = 30;
const OBJ_SPAWN_Z = 900; // far enough that the post-jump deceleration (~300 units) leaves a long cruise toward it
const BANK_LEN = 2.4;
const T_OPEN = 0.6;
const T_SWALLOW = 3.4;
const T_VOID = 4.0;
const T_END = 5.8;
// big bang: ignition, expansion, structure, handover
const BANG_LEN = 10.5;
const BANG_R = 430; // the expansion settles at roughly the flight box's own scale
const BANG_TAU = 1.9; // R = BANG_R · (1 − e^(−t/τ))
const BANG_Z = -340; // the singularity sits at the box's centre, dead ahead
// wormhole: mouth, draw-in, transit, exit
const W_OPEN = 1.7;
const W_DRAW = 3.4;
const W_TRANSIT = 6.4;
const W_EXIT = 7.4;
// the hyperspace action's own envelope, when no hand is driving the warp
const JUMP_LEN = 3.2;
// per shape, object-local units at scale 1 (the nebula lives in the pen's
// units, radius sqrt 8; the worlds are a radius-6 body plus its limb glow).
// This is the radius of the window the body is drawn through, so it has to
// clear the body's own content: the window starts falling off at 0.86 of it
// (see uWindow in the object shader), and the solar system's outermost planet
// reaches 38.8, at 40 its far limb was cut in half and the outer orbit line
// stopped mid-arc.
const OBJ_EXTENT = [74, 26, 46, 3.0, 21, 38, 13, 26, 8.5, 8.5, 8.5, 8.5, 8.5, 34];
// Every body is modelled in whatever units suit it, so the default scale is
// derived rather than tuned: OBJ_UNIT is the world half-size the quad wants at
// the default spawn distance, a body of that size fills about a sixth of the
// frame when it arrives and grows as the flight closes on it, and the taste
// row is the only judgement in it (a world is smaller than a galaxy).
const OBJ_UNIT = 190;
// (the nebula is held smaller than the rest: it is the one body that is
// marched rather than intersected, so its cost is its screen area)
const OBJ_TASTE = [0.90, 1.00, 1.05, 0.52, 1.00, 1.00, 0.80, 0.90, 0.72, 0.72, 0.78, 0.72, 0.72, 1.00];
const OBJ_SCALE = OBJ_EXTENT.map((e, i) => (OBJ_UNIT * OBJ_TASTE[i]) / e);

const GLSL_COMMON = /* glsl */ `
  #define PI 3.14159265359
  #define TAU 6.28318530718
  float h11(float n) { return fract(sin(n * 127.1 + 311.7) * 43758.5453); }
  float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float n = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { n += a * vnoise(p); p = p * 2.03 + 11.7; a *= 0.5; }
    return n;
  }
  mat2 rot2(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
  // Darryl Huffman's black-hole lens (CodePen gRZrpv, MIT) on a centred,
  // aspect-corrected screen position (height = 1): pull = mass / dist², the
  // point is rotated about the mass by (pull + held)·π with the sine term at
  // zero exactly as upstream ships it, i.e. a signed radial scaling that
  // collapses and inverts the view in rings. hole = (mass, held). Zero mass is
  // the identity.
  vec2 lens(vec2 q, vec2 hole) {
    if (hole.x <= 0.0) return q;
    float pull = hole.x / max(dot(q, q), 0.00001);
    return q * cos((pull + hole.y) * PI);
  }
  // the pen's darkening of what the lens shows: colour − pull·0.25
  float lensDark(vec2 q, vec2 hole) {
    if (hole.x <= 0.0) return 0.0;
    float pull = hole.x / max(dot(q, q), 0.00001);
    return clamp(pull * 0.25, 0.0, 1.0);
  }
  // the wormhole mouth: a thin-lens deflection toward the throat, ~ r₀²/r²,
  // which pulls the field inward as the mouth opens. worm = (radius, pull).
  vec2 mouthLens(vec2 q, vec2 worm) {
    if (worm.x <= 0.0 || worm.y <= 0.0) return q;
    float r2 = max(dot(q, q), 0.00001);
    float defl = clamp((worm.x * worm.x) / r2 * worm.y * 0.55, 0.0, 0.94);
    return q * (1.0 - defl);
  }
`;

// -------------------------------------------------------------- star streaks
// One instanced screen-space capsule per particle, from where it is to where
// it was a shutter ago. The same primitive serves both populations: in the
// flight the capsule runs from the star's position to its position one
// shutter back along the line of flight, and in the big bang from the
// particle's position back along its own outward velocity, which is why the
// handover between them is a lerp of two endpoints and not a crossfade.
const STAR_VERT = /* glsl */ `
  ${GLSL_COMMON}
  uniform float uTravel, uSide, uDepth, uHalfW, uHalfH, uNear, uAspect, uTime, uTwinkle, uBreath, uOrder, uTail, uGain, uFovK, uFade;
  uniform float uBang, uBangR, uBangTail, uBangGain, uBangHeat, uCluster;
  uniform float uAber; // the relativistic warp: β, 0 at cruise
  uniform vec3 uOrigin;
  uniform vec2 uRes;
  uniform vec2 uHole;
  uniform vec3 uWorm; // mouth radius, mouth pull, fade inside the mouth
  uniform vec3 uPal0, uPal1, uPal2;
  in vec2 aQuad;  // per vertex: side -1..1, along 0 (head) .. 1 (tail)
  in vec3 aStar;  // per instance: x0, y0, z0
  in vec3 aInfo;  // per instance: magnitude, tint pick, phase
  in vec4 aBang;  // per instance: outward velocity xyz (speed 0.5..1), handover stagger w
  out vec2 vQ;
  out vec3 vCol;
  out float vA;
  out float vLenR;
  vec2 toScreen(vec4 c) { return c.xy / max(c.w, 0.001) * vec2(uAspect, 1.0) * 0.5; }
  // Relativistic aberration of a view-space position: the direction's angle
  // to the travel axis (−z) closes by cos θ' = (cos θ + β) / (1 + β cos θ),
  // so the sky crowds forward as β rises; the distance is kept.
  vec3 aberrate(vec3 v, float beta) {
    float d = length(v);
    vec3 n = v / max(d, 0.0001);
    float c = -n.z;
    float c2 = (c + beta) / (1.0 + beta * c);
    vec3 perp = n + vec3(0.0, 0.0, c);
    float pl = length(perp);
    vec3 n2 = vec3(0.0, 0.0, -c2) + (pl > 0.00001 ? perp / pl : vec3(0.0)) * sqrt(max(1.0 - c2 * c2, 0.0));
    return n2 * d;
  }
  void main() {
    // ---- flight slot: distribution morphs random scatter -> lattice on sway
    vec3 st = aStar;
    vec3 pitch = vec3(2.0 * uHalfW / 9.0, 2.0 * uHalfH / 6.0, uDepth / 14.0);
    vec3 snapped = (floor(st / pitch + 0.5)) * pitch;
    st = mix(st, snapped, uOrder);
    float x = mod(st.x + uSide + uHalfW, 2.0 * uHalfW) - uHalfW;
    float y = st.y;
    // FORWARD: the box scrolls toward the camera (z rises to uNear) and wraps
    float z = (uNear - uDepth) + mod(st.z + uTravel, uDepth);

    // ---- big bang slot: the pen's model, out from the singularity along
    // this particle's own velocity, gathering into clusters as it ages
    vec3 vel = aBang.xyz;
    float ci = floor(aBang.w * float(CLUSTERS));
    vec3 craw = normalize(vec3(h11(ci * 1.7 + 0.3), h11(ci * 3.9 + 1.1), h11(ci * 7.3 + 2.7)) * 2.0 - 1.0);
    vec3 cdir = normalize(mix(normalize(vel), craw, 0.85));
    // knots at their own distances, not all on one shell
    vec3 vClus = cdir * (0.55 + 0.6 * h11(ci * 11.3 + 5.9)) + vel * 0.22;
    vec3 pBang = uOrigin + mix(vel, vClus, uCluster) * uBangR;
    vec3 vBang = mix(vel, vClus, uCluster) * uBangTail;

    // ---- handover: staggered per particle, so the field resolves into the
    // flight one particle at a time instead of snapping as a layer
    float bm = clamp((uBang - aBang.w * 0.30) / 0.70, 0.0, 1.0);
    bm = bm * bm * (3.0 - 2.0 * bm);
    vec3 headP = mix(vec3(x, y, z), pBang, bm);
    vec3 tailP = mix(vec3(x, y, z - uTail), pBang - vBang, bm);

    vec4 mvH = modelViewMatrix * vec4(headP, 1.0);
    vec4 mvT = modelViewMatrix * vec4(tailP, 1.0);
    // the relativistic warp: both ends crowd toward the travel axis, the tail
    // a little less than the head, so every streak lies along its own great
    // circle toward the direction of travel; Doppler below
    float ahead = 1.0;
    if (uAber > 0.0) {
      mvH.xyz = aberrate(mvH.xyz, uAber);
      mvT.xyz = aberrate(mvT.xyz, uAber * 0.72);
      ahead = -mvH.z / max(length(mvH.xyz), 0.0001) * 0.5 + 0.5;
    }
    float dist = max(-mvH.z, 0.5);
    vec4 ch = projectionMatrix * mvH;
    vec4 ct = projectionMatrix * mvT;
    float vis = step(0.3, ch.w) * step(0.3, ct.w);
    vec2 qh = toScreen(ch);
    vec2 sh = mouthLens(lens(qh, uHole), uWorm.xy);
    vec2 stl = mouthLens(lens(toScreen(ct), uHole), uWorm.xy);
    float dark = lensDark(qh, uHole);
    vec2 d = sh - stl;
    float len = length(d);
    vec2 dir = len > 0.00001 ? d / len : vec2(1.0, 0.0);
    vec2 nrm = vec2(-dir.y, dir.x);
    float mag = aInfo.x;
    // dot radius in height units: world size over distance, clamped in pixels
    float pxH = 1.0 / uRes.y;
    float rad = clamp((0.55 + mag * 0.9) * uFovK / dist, 0.7 * pxH, 5.0 * pxH);
    vLenR = len / rad;
    vec2 pos = mix(sh + dir * rad, stl - dir * rad, aQuad.y) + nrm * aQuad.x * rad;
    vec2 ndc = pos / vec2(uAspect, 1.0) * 2.0;
    gl_Position = vec4(ndc * vis, 0.0, 1.0);
    vQ = aQuad;
    float near = smoothstep(uDepth, uDepth * 0.3, dist);
    float tw = 1.0 - 0.18 * uTwinkle * (0.5 + 0.5 * sin(uTime * (2.0 + aInfo.z * 7.0) + aInfo.z * 40.0));
    // stars falling into the open throat are gone from the field
    float mIn = uWorm.x > 0.0 ? 1.0 - smoothstep(uWorm.x * 0.72, uWorm.x * 1.02, length(sh)) : 0.0;
    // a stretched star spreads its light; the jump adds energy back
    vA = (0.42 + mag * 1.3) * (0.5 + 0.5 * near) * tw * uBreath * vis * (1.0 - dark) * (1.0 + uGain) / sqrt(1.0 + vLenR * 0.22);
    vA *= uFade * (1.0 - mIn * uWorm.z) * mix(1.0, uBangGain, bm);
    vec3 tint = aInfo.y < 0.33 ? uPal0 : (aInfo.y < 0.66 ? uPal1 : uPal2);
    vCol = mix(vec3(1.0), tint, 0.38 + 0.22 * mag);
    // ignition is white-hot and cools into the palette as the universe ages
    vCol = mix(vCol, mix(vec3(1.0), uPal2, 0.16), uBangHeat * bm);
    // Doppler under the warp: blue and bright toward the travel direction,
    // red and dim toward the periphery (the box field has no astern)
    if (uAber > 0.0) vCol *= mix(vec3(1.0), mix(vec3(0.9, 0.5, 0.35) * 0.6, vec3(0.8, 0.95, 1.45) * 1.6, ahead), uAber / 0.93);
  }
`;

const STAR_FRAG = /* glsl */ `
  out vec4 fragColor;
  uniform float uIntensity;
  in vec2 vQ;
  in vec3 vCol;
  in float vA;
  in float vLenR;
  void main() {
    // capsule profile in radius units: head centre at 0, tail centre at vLenR
    float along = vQ.y * (vLenR + 2.0) - 1.0;
    float u = clamp(along, 0.0, vLenR);
    float dx = along - u;
    float d2 = dx * dx + vQ.x * vQ.x;
    if (d2 > 1.0) discard;
    float prof = exp(-d2 * 3.2) * (1.0 - d2 * 0.15);
    float tailFade = 1.0 - 0.75 * (u / max(vLenR, 0.001)) * step(0.5, vLenR);
    fragColor = vec4(vCol * prof * tailFade * vA * uIntensity, 1.0);
  }
`;

// ---------------------------------------------------------- celestial object
const OBJ_VERT = /* glsl */ `
  ${GLSL_COMMON}
  uniform vec3 uObjPos;
  uniform float uExtent, uAspect, uWarm;
  uniform vec2 uHole;
  uniform vec3 uWorm;
  out vec3 vWorld;
  void main() {
    // uWarm shrinks the quad into a two-pixel patch in the corner of the
    // frame so the driver has to translate this program, see the note at the
    // end of update(). It has to RASTERISE: a draw that clips away entirely
    // is skipped and the translation is deferred all over again.
    if (uWarm > 0.5) { vWorld = uObjPos; gl_Position = vec4(position.xy * 0.002 - 0.998, 0.0, 1.0); return; }
    vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
    vec3 world = uObjPos + (right * position.x + up * position.y) * uExtent;
    vWorld = world;
    vec4 clip = projectionMatrix * viewMatrix * vec4(world, 1.0);
    vec2 ndc = clip.xy / max(clip.w, 0.001);
    vec2 q = mouthLens(lens(ndc * vec2(uAspect, 1.0) * 0.5, uHole), uWorm.xy);
    clip.xy = q * 2.0 / vec2(uAspect, 1.0) * clip.w;
    gl_Position = clip;
  }
`;

const OBJ_FRAG = /* glsl */ `
  out vec4 fragColor;
  ${GLSL_COMMON}
  uniform vec3 uObjPos;
  uniform float uShape, uScale, uAlpha, uPulse, uTime, uSeed, uIntensity, uSway, uLevel, uWindow;
  uniform float uAber; // the relativistic warp's Doppler on the G star
  uniform vec3 uPal0, uPal1, uPal2, uPal3, uPal4;
  in vec3 vWorld;

  // returns t of the nearest hit, or -1; edge = normalized discriminant for AA
  float iSphere(vec3 ro, vec3 rd, vec3 c, float r, out float edge) {
    vec3 oc = ro - c;
    float b = dot(oc, rd);
    float cc = dot(oc, oc) - r * r;
    float h = b * b - cc;
    edge = h / (r * r);
    if (h < 0.0) return -1.0;
    return -b - sqrt(h);
  }
  float iPlane(vec3 ro, vec3 rd, vec3 c, vec3 n) {
    float d = dot(rd, n);
    if (abs(d) < 0.00001) return -1.0;
    return dot(c - ro, n) / d;
  }
  float aa(float edge) { return smoothstep(0.0, max(fwidth(edge) * 1.5, 0.0001), edge); }
  // axis-aligned box in the ray's own frame (iq's slab form); returns the
  // nearest positive hit and its normal, or -1
  float iBox(vec3 ro, vec3 rd, vec3 rad, out vec3 nrm) {
    vec3 m = 1.0 / rd;
    vec3 n = m * ro;
    vec3 k = abs(m) * rad;
    vec3 t1 = -n - k, t2 = -n + k;
    float tN = max(max(t1.x, t1.y), t1.z);
    float tF = min(min(t2.x, t2.y), t2.z);
    if (tN > tF || tF < 0.0) return -1.0;
    nrm = -sign(rd) * step(t1.yzx, t1.xyz) * step(t1.zxy, t1.xyz);
    return tN > 0.0 ? tN : tF;
  }

  // --- 3-D value noise on the body's own surface normal, so the pattern is
  // seamless over the sphere (no polar pinch, no lon/lat seam)
  float wh3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float wn3(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(wh3(i), wh3(i + vec3(1, 0, 0)), f.x), mix(wh3(i + vec3(0, 1, 0)), wh3(i + vec3(1, 1, 0)), f.x), f.y),
               mix(mix(wh3(i + vec3(0, 0, 1)), wh3(i + vec3(1, 0, 1)), f.x), mix(wh3(i + vec3(0, 1, 1)), wh3(i + vec3(1, 1, 1)), f.x), f.y), f.z);
  }
  float wf3(vec3 p) {
    float n = 0.0, a = 0.5;
    for (int i = 0; i < WORLD_OCT; i++) { n += a * wn3(p); p = p * 2.07 + 9.3; a *= 0.5; }
    return n * WORLD_NORM; // normalized to 0..1 (the constant comes in as a
                           // literal: folding 1/(1 − 2^−oct) in the shader
                           // makes the HLSL translator warn about precision)
  }
  float ridged(vec3 p) { return 1.0 - abs(wf3(p) * 2.0 - 1.0); }

  vec3 shadePlanet(vec3 n, vec3 rd, vec3 L, vec3 base, vec3 atmo, float bandFreq, vec3 axis) {
    float lit = max(dot(n, L), 0.0);
    float wrap = smoothstep(-0.25, 0.45, dot(n, L));
    float lat = dot(n, axis);
    float bands = 0.82 + 0.18 * sin(lat * bandFreq + sin(lat * bandFreq * 2.7) * 0.6);
    vec3 col = base * bands * (0.04 + 0.96 * wrap);
    float fres = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
    col += atmo * fres * (0.12 + 0.88 * lit) * 1.3;
    float spec = pow(max(dot(reflect(-L, n), -rd), 0.0), 28.0) * 0.22;
    return col + vec3(spec) * lit;
  }

  // ---- pulsar: core, two jets, magnetosphere rings, halo; pulses in place
  vec4 pulsar(vec3 ro, vec3 rd, vec3 C) {
    vec3 J = normalize(vec3(0.35, 1.0, 0.22));
    vec3 U = normalize(cross(J, vec3(0.0, 0.0, 1.0)));
    vec3 V = cross(J, U);
    float pulse = 0.55 + 0.45 * uPulse;
    vec3 col = vec3(0.0); float cover = 0.0;
    // core
    float e; float t = iSphere(ro, rd, C, 1.6, e);
    if (t > 0.0) { float k = aa(e); col += mix(uPal2, vec3(1.0), 0.8) * 3.0 * k; cover = k; }
    // closest approach to the jet axis (both directions), with taper along h
    vec3 oc = ro - C;
    float hAlong = dot(oc, J) ; float vAlong = dot(rd, J);
    // parameter of closest approach between ray and the axis line
    vec3 w0 = oc - J * hAlong;  vec3 w1 = rd - J * vAlong;
    float a = dot(w1, w1), b = dot(w0, w1);
    float tc = a > 0.00001 ? -b / a : 0.0;
    tc = max(tc, 0.0);
    vec3 pc = ro + rd * tc - C;
    float h = dot(pc, J);
    float dAx = length(pc - J * h);
    float ah = abs(h);
    float taper = smoothstep(62.0, 8.0, ah);
    float w = 0.6 + ah * 0.045;
    float flow = 0.7 + 0.3 * sin(ah * 0.9 - uTime * 9.0) * (0.5 + 0.5 * sin(ah * 0.31 + 1.7));
    float jet = exp(-dAx * dAx / (w * w)) * taper * flow;
    float jetCore = exp(-dAx * dAx / (0.12 + ah * 0.004)) * taper;
    col += (uPal2 * 1.4 * jet + vec3(1.0) * jetCore * 0.9) * pulse * (ah < 64.0 ? 1.0 : 0.0);
    // magnetosphere: two static tori around the equator (distance to circle)
    float rXY = length(pc - J * h);
    float dT1 = length(vec2(rXY - 9.0, h));
    float dT2 = length(vec2(rXY - 16.0, h * 0.7));
    col += mix(uPal1, uPal0, 0.5) * (exp(-dT1 * dT1 * 0.9) * 0.35 + exp(-dT2 * dT2 * 0.5) * 0.12) * (0.6 + 0.4 * pulse);
    // halo around the core (volumetric-ish)
    float dC = length(cross(oc, rd));
    col += mix(uPal2, vec3(1.0), 0.4) * exp(-dC * 0.55) * 0.9 * pulse;
    return vec4(col, cover);
  }

  // ---- spiral galaxy: an inclined plane with log-spiral arms, bulge, dust
  vec4 galaxy(vec3 ro, vec3 rd, vec3 C) {
    vec3 N = normalize(vec3(0.55, 0.75, 0.35));
    vec3 U = normalize(cross(N, vec3(0.0, 1.0, 0.0)));
    vec3 V = cross(N, U);
    vec3 col = vec3(0.0); float cover = 0.0;
    float t = iPlane(ro, rd, C, N);
    if (t > 0.0) {
      vec3 p = ro + rd * t - C;
      float r = length(p);
      float phi = atan(dot(p, V), dot(p, U));
      float bulge = exp(-r / 3.2) * 2.2;
      float armW = 0.55;
      float arms = 0.0;
      for (int k = 0; k < 2; k++) {
        float phiArm = log(max(r, 0.3) / 1.2) / 0.34 + float(k) * PI;
        float dphi = phi - phiArm;
        dphi = mod(dphi + PI, TAU) - PI;
        float across = dphi * r;           // arc distance from the arm ridge
        arms += exp(-(across * across) / (armW * armW + r * 0.08));
      }
      float n = fbm(vec2(phi * 2.5 + uSeed, r * 0.9));
      float clumps = smoothstep(0.45, 0.8, n) * 0.8;
      float disc = exp(-r / 14.0) * smoothstep(0.0, 1.5, r);
      float dust = smoothstep(0.3, 0.6, fbm(vec2(phi * 4.0 + 9.0, r * 1.4 + uSeed))) * disc * 0.6;
      float dens = bulge + (arms * (0.6 + clumps) + 0.10) * disc;
      dens *= (1.0 - dust * 0.7);
      vec3 warm = mix(uPal3, vec3(1.0), 0.5);
      vec3 cool = mix(uPal2, uPal0, 0.5);
      vec3 c = mix(cool, warm, clamp(bulge * 0.9, 0.0, 1.0));
      c = mix(c, uPal1 * 0.5, dust);
      c += uPal4 * clumps * 0.25;
      col = c * dens * 1.2;
      cover = clamp(dens * 0.55, 0.0, 0.9) * (1.0 - smoothstep(24.0, 30.0, r));
      col *= (1.0 - smoothstep(24.0, 30.0, r));
    }
    // bulge glow sphere (volumetric-ish) so the core has depth
    float dC = length(cross(ro - C, rd));
    col += mix(uPal3, vec3(1.0), 0.6) * exp(-dC * 0.5) * 0.5;
    return vec4(col, cover);
  }

  // ---- solar system: sun, six planets (one ringed), belt, faint orbit lines
  vec4 solarSystem(vec3 ro, vec3 rd, vec3 C) {
    vec3 N = normalize(vec3(0.15, 0.9, 0.4));
    vec3 U = normalize(cross(N, vec3(1.0, 0.0, 0.0)));
    vec3 V = cross(N, U);
    vec3 col = vec3(0.0); float cover = 0.0;
    float tBest = 1e9; vec3 bestCol = vec3(0.0); float bestCov = 0.0;
    // sun
    float e; float t = iSphere(ro, rd, C, 3.0, e);
    if (t > 0.0 && t < tBest) {
      vec3 n = normalize(ro + rd * t - C);
      float mu = max(dot(n, -rd), 0.0);
      float k = aa(e);
      bestCol = mix(uPal3, vec3(1.0), 0.55) * (0.45 + 0.55 * mu) * 3.2; bestCov = k; tBest = t;
    }
    // planets
    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      float orbit = 7.5 + fi * 5.4 + (fi > 2.5 ? 3.0 : 0.0);
      float ang = fi * 2.39996 + 1.3 + uSeed;
      vec3 pc = C + orbit * (cos(ang) * U + sin(ang) * V);
      float pr = i == 0 ? 0.7 : i == 1 ? 1.0 : i == 2 ? 0.95 : i == 3 ? 2.6 : i == 4 ? 2.1 : 1.3;
      float ep; float tp = iSphere(ro, rd, pc, pr, ep);
      if (tp > 0.0 && tp < tBest) {
        vec3 n = normalize(ro + rd * tp - pc);
        vec3 L = normalize(C - pc);          // lit by the sun
        vec3 base = i == 0 ? mix(uPal3, uPal4, 0.5) * 0.6 : i == 1 ? mix(uPal0, uPal2, 0.3) : i == 2 ? mix(uPal1, uPal0, 0.4) : i == 3 ? mix(uPal3, uPal4, 0.35) : i == 4 ? mix(uPal2, uPal1, 0.5) : mix(uPal0, vec3(1.0), 0.3);
        vec3 atmo = i == 1 ? uPal2 : i == 3 ? uPal3 : uPal0;
        float bf = i >= 3 ? 14.0 : 5.0;
        vec3 axis = normalize(N + U * 0.35 * sin(fi * 2.1));
        vec3 sc = shadePlanet(n, rd, L, base, atmo, bf, axis);
        // ring shadow on planet 3
        if (i == 3) {
          vec3 hp = ro + rd * tp;
          float tl = iPlane(hp, L, pc, N);
          if (tl > 0.0) { float rr = length(hp + L * tl - pc); if (rr > 3.6 && rr < 5.8) sc *= 0.45; }
        }
        bestCol = sc; bestCov = aa(ep); tBest = tp;
      }
      // rings around planet 3
      if (i == 3) {
        float tr = iPlane(ro, rd, pc, N);
        if (tr > 0.0 && tr < tBest) {
          float rr = length(ro + rd * tr - pc);
          if (rr > 3.6 && rr < 5.8) {
            float g = 0.55 + 0.45 * sin(rr * 9.0 + uSeed) * sin(rr * 3.1);
            float inner = smoothstep(3.6, 3.8, rr) * (1.0 - smoothstep(5.6, 5.8, rr));
            // planet shadow on the ring
            vec3 hp = ro + rd * tr; vec3 L = normalize(C - pc);
            float esh; float tsh = iSphere(hp, L, pc, pr, esh);
            float sh = tsh > 0.0 ? 0.35 : 1.0;
            vec3 rc = mix(uPal3, uPal4, 0.4) * (0.5 + 0.5 * g) * sh;
            float ra = (0.35 + 0.45 * g) * inner;
            bestCol = mix(bestCol, rc, ra); bestCov = max(bestCov, ra); tBest = tr;
          }
        }
      }
    }
    // asteroid belt: a dusty annulus between planets 2 and 3
    float tb = iPlane(ro, rd, C, N);
    if (tb > 0.0 && tb < tBest) {
      vec3 p = ro + rd * tb - C;
      float r = length(p);
      float phi = atan(dot(p, V), dot(p, U));
      float band = smoothstep(17.5, 18.5, r) * (1.0 - smoothstep(20.5, 21.5, r));
      float n = fbm(vec2(phi * 9.0 + uSeed, r * 2.2));
      float belt = band * smoothstep(0.55, 0.85, n) * 0.22;
      // faint orbit lines
      float lines = 0.0;
      for (int i = 0; i < 6; i++) { float fi = float(i); float orbit = 7.5 + fi * 5.4 + (fi > 2.5 ? 3.0 : 0.0); lines += exp(-pow((r - orbit) / 0.06, 2.0)); }
      lines *= 0.035;
      vec3 bc = uPal3 * belt + mix(uPal2, uPal0, 0.5) * lines;
      bestCol = mix(bestCol, bc, belt) + bc * (1.0 - belt);
      bestCov = max(bestCov, belt * 0.6);
    }
    col = bestCol; cover = bestCov;
    // sun corona (additive)
    float dC = length(cross(ro - C, rd));
    col += mix(uPal3, vec3(1.0), 0.5) * (exp(-dC * 0.9) * 1.2 + exp(-dC * 0.25) * 0.15);
    return vec4(col, cover);
  }

  // ---- nebula: "Nebula Madness" (Filip Zrnzevic, MIT; after Duke's supernova
  // remnant), the volumetric march kept line for line; the 256² noise texture
  // becomes a hash of the same texel lookup, the theme colours come from the
  // palette, and the pen's mouse rotation is the hand's sway (no self-spin).
  float nebNoise(vec3 x) {
    vec3 p = floor(x), f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    vec2 uv2 = (p.xy + vec2(37.0, 17.0) * p.z) + f.xy;
    return 1.0 - 0.82 * h21(floor(uv2 + 0.5));
  }
  float nebFbm(vec3 p) { return nebNoise(p * .06125) * .5 + nebNoise(p * .125) * .25 + nebNoise(p * .25) * .125 + nebNoise(p * .4) * .2; }
  float length8(vec2 p) { p = p * p; p = p * p; p = p * p; return pow(p.x + p.y, 1.0 / 8.0); }
  float nebDisk(vec3 p, vec3 t) { vec2 q = vec2(length(p.xy) - t.x, p.z * 0.5); return max(length8(q) - t.y, abs(p.z) - t.z); }
  float spiralNoiseC(vec3 p) {
    const float nudge = 0.9;
    const float normalizer = 1.0 / sqrt(1.0 + nudge * nudge);
    float n = 0.0, iter = 2.0;
    for (int i = 0; i < 8; i++) {
      n += -abs(sin(p.y * iter) + cos(p.x * iter)) / iter;
      p.xy += vec2(p.y, -p.x) * nudge; p.xy *= normalizer;
      p.xz += vec2(p.z, -p.x) * nudge; p.xz *= normalizer;
      iter *= 1.733733;
    }
    return n;
  }
  float nebField(vec3 p) {
    float f = nebDisk(p.xzy, vec3(2.0, 1.8, 1.25));
    f += nebFbm(p * 90.0);
    f += spiralNoiseC(p.zxy * 0.5123 + 100.0) * 3.0;
    return f;
  }
  float nebMap(vec3 p) {
    float c = cos(uSway), sn = sin(uSway);
    p.xz = vec2(c * p.x + sn * p.z, -sn * p.x + c * p.z);
    return abs(nebField(p / 0.5) * 0.5) + 0.07;
  }
  vec3 nebColor(float density, float radius, vec3 base, vec3 edge, vec3 accent, vec3 glow) {
    vec3 r = mix(base, edge, density);
    r *= mix(7.0 * accent, 1.5 * glow, min((radius + .05) / .9, 1.15));
    return r;
  }
  vec4 nebula(vec3 ro, vec3 rd, vec3 C) {
    vec3 org = ro - C;
    vec3 base = mix(uPal3, vec3(1.0), 0.35), accent = uPal4, edge = uPal1, glow = uPal2;
    float b = dot(rd, org);
    float c = dot(org, org) - 8.0;
    float delta = b * b - c;
    if (delta < 0.0) return vec4(0.0);
    float ds = sqrt(delta);
    float tn = -b - ds, tf = -b + ds;
    if (tf < 0.0) return vec4(0.0);
    float t = max(tn, 0.0);
    float ld = 0.0, td = 0.0, w = 0.0;
    const float h = 0.1;
    vec4 sum = vec4(0.0);
    for (int i = 0; i < NEB_STEPS; i++) {
      vec3 pos = org + t * rd;
      if (td > 0.7 || sum.a > 0.99 || t > tf) break; // the pen's t > 10 assumed its camera 6 units out; tf bounds ours
      float d = max(nebMap(pos), 0.0);
      float lDist = max(length(pos), 0.001);
      vec3 lightColor = accent * 1.5;
      sum.rgb += (base / (lDist * lDist * 10.) / 80.);
      sum.rgb += (lightColor / exp(lDist * lDist * lDist * .08) / 30.);
      if (d < h) {
        ld = h - d;
        w = (1. - td) * ld;
        td += w + 1. / 200.;
        vec4 col = vec4(nebColor(td, lDist, base, edge, accent, glow), td);
        sum += sum.a * vec4(sum.rgb, 0.0) * 0.2;
        col.a *= 0.2;
        col.rgb *= col.a;
        sum = sum + col * (1.0 - sum.a);
      }
      td += 1. / 70.;
      t += max(d * 0.12 * max(min(length(pos), length(org)), 1.0), 0.01);
    }
    sum *= 1. / exp(ld * 0.02) * 0.57;
    sum = clamp(sum, 0.0, 1.0);
    sum.xyz = sum.xyz * sum.xyz * (3.0 - 2.0 * sum.xyz);
    return vec4(sum.xyz * (1.0 + uPulse * 0.15), sum.a * 0.9);
  }

  // ---- ringed planet: gas giant with atmosphere, banded rings, mutual shadows
  vec4 ringed(vec3 ro, vec3 rd, vec3 C) {
    vec3 N = normalize(vec3(0.3, 0.85, 0.42));
    vec3 L = normalize(vec3(-0.6, 0.5, 0.6));
    vec3 col = vec3(0.0); float cover = 0.0;
    float tBest = 1e9;
    float e; float tp = iSphere(ro, rd, C, 6.5, e);
    if (tp > 0.0) {
      vec3 n = normalize(ro + rd * tp - C);
      vec3 base = mix(uPal1, uPal4, 0.45);
      col = shadePlanet(n, rd, L, base, mix(uPal0, uPal2, 0.5), 16.0, N);
      vec3 hp = ro + rd * tp;
      float tl = iPlane(hp, L, C, N);
      if (tl > 0.0) { float rr = length(hp + L * tl - C); if (rr > 9.0 && rr < 18.0) col *= 0.4 + 0.3 * sin(rr * 4.0); }
      cover = aa(e); tBest = tp;
    }
    float tr = iPlane(ro, rd, C, N);
    if (tr > 0.0 && tr < tBest) {
      float rr = length(ro + rd * tr - C);
      if (rr > 9.0 && rr < 18.0) {
        float g = 0.55 + 0.45 * sin(rr * 4.0 + uSeed) * (0.7 + 0.3 * sin(rr * 11.0));
        float gaps = smoothstep(0.25, 0.4, fract(rr * 0.7 + 0.2));
        float inner = smoothstep(9.0, 9.4, rr) * (1.0 - smoothstep(17.4, 18.0, rr));
        vec3 hp = ro + rd * tr;
        float esh; float tsh = iSphere(hp, L, C, 6.5, esh);
        float sh = tsh > 0.0 ? 0.25 : 1.0;
        float lit = 0.5 + 0.5 * abs(dot(N, L));
        vec3 rc = mix(uPal3, mix(uPal4, vec3(1.0), 0.3), fract(rr * 0.37)) * (0.45 + 0.55 * g) * sh * lit;
        float ra = (0.3 + 0.5 * g) * gaps * inner;
        col = mix(col, rc, ra); cover = max(cover, ra);
      }
    }
    // thin atmosphere glow
    float dC = length(cross(ro - C, rd));
    col += mix(uPal0, uPal2, 0.5) * exp(-(dC - 6.5) * 1.6) * step(6.5, dC) * 0.35;
    return vec4(col, cover);
  }

  // ---- halo: a ringworld after Rob Glazebrook's "Halo" (MIT), the inner
  // habitable band and the outer hull, analytic cylinder band, static (the
  // pen's CSS spin is not carried over)
  vec4 halo(vec3 ro, vec3 rd, vec3 C) {
    vec3 N = normalize(vec3(0.25, 0.9, 0.36));
    vec3 U = normalize(cross(N, vec3(1.0, 0.0, 0.0)));
    vec3 V = cross(N, U);
    vec3 L = normalize(vec3(-0.5, 0.6, 0.62));
    const float R = 30.0, W = 5.0;
    vec3 o = ro - C;
    vec3 ol = vec3(dot(o, U), dot(o, N), dot(o, V));
    vec3 dl = vec3(dot(rd, U), dot(rd, N), dot(rd, V));
    float a = dl.x * dl.x + dl.z * dl.z;
    float b = 2.0 * (ol.x * dl.x + ol.z * dl.z);
    float c = ol.x * ol.x + ol.z * ol.z - R * R;
    float disc = b * b - 4.0 * a * c;
    if (disc < 0.0 || a < 0.000001) return vec4(0.0);
    float sq = sqrt(disc);
    float t1 = (-b - sq) / (2.0 * a), t2 = (-b + sq) / (2.0 * a);
    vec3 col = vec3(0.0);
    float cover = 0.0;
    for (int k = 1; k >= 0; k--) {
      float t = k == 1 ? t2 : t1;
      if (t <= 0.0) continue;
      vec3 p = ol + dl * t;
      float band = smoothstep(W * 0.5 + 0.15, W * 0.5 - 0.15, abs(p.y));
      if (band <= 0.001) continue;
      vec3 nrm = normalize(vec3(p.x, 0.0, p.z));
      float along = atan(p.z, p.x) * R;
      vec3 sc;
      if (k == 1) {
        vec3 n = -nrm;
        float terr = fbm(vec2(along * 0.06 + uSeed, p.y * 0.5));
        float sea = smoothstep(0.42, 0.5, terr);
        float cloud = smoothstep(0.55, 0.8, fbm(vec2(along * 0.11 + 7.0 + uTime * 0.01, p.y * 0.7)));
        vec3 land = mix(mix(uPal3, uPal4, 0.4), uPal1, smoothstep(0.5, 0.8, terr));
        vec3 ocean = mix(uPal2, uPal0, 0.4) * 0.7;
        vec3 surf = mix(mix(ocean, land, sea), vec3(1.0), cloud * 0.6);
        float lit = max(dot(n, L), 0.0);
        float wrap = smoothstep(-0.3, 0.5, dot(n, L));
        sc = surf * (0.08 + 0.92 * wrap) + mix(uPal2, uPal0, 0.5) * pow(1.0 - max(dot(n, -rd), 0.0), 2.0) * 0.35 * (0.3 + lit);
        sc += uPal3 * (1.0 - wrap) * smoothstep(0.7, 0.95, fbm(vec2(along * 0.4, p.y * 3.0))) * 0.35;
      } else {
        vec3 n = nrm;
        float plate = h21(floor(vec2(along * 0.25, p.y * 0.8)));
        float seams = smoothstep(0.02, 0.0, abs(fract(along * 0.25) - 0.5) - 0.47) + smoothstep(0.02, 0.0, abs(fract(p.y * 0.8) - 0.5) - 0.47);
        vec3 hull = mix(uPal1, uPal0, 0.35) * (0.55 + 0.45 * plate);
        float lit = max(dot(n, L), 0.0);
        float spec = pow(max(dot(reflect(-L, n), -rd), 0.0), 40.0) * 0.5;
        sc = hull * (0.1 + 0.9 * lit) * (1.0 - seams * 0.5) + vec3(spec) + uPal2 * smoothstep(0.875, 0.96875, h21(floor(vec2(along * 0.5, p.y * 2.0)))) * 0.3;
      }
      col = mix(col, sc, band);
      cover = max(cover, band);
    }
    return vec4(col, cover);
  }

  // ---- dyson shell: a star inside a sphere that is only half built. The
  // shell is cut into panel cells; a cell is built when its hash falls under
  // a build fraction that is high at the equator and near zero at the poles,
  // so the structure reads as a machine growing outward from its first ring.
  // Unbuilt cells are simply not there, the ray passes through them to the
  // star, which is what leaks the light, and where the ray leaves through a
  // gap and lands on the FAR shell you see the finished panels lit from
  // inside by their own star.
  #define DYSON_LON 56.0
  #define DYSON_LAT 28.0
  vec2 dysonCell(vec3 d) {
    float lon = atan(d.z, d.x);
    float lat = asin(clamp(d.y, -1.0, 1.0));
    return vec2(floor(lon / TAU * DYSON_LON), floor(lat / PI * DYSON_LAT + 0.5));
  }
  // The shell grew outward from one equatorial ring and is nowhere near
  // finished. Inside the build front it is solid plate; outside it there is
  // nothing at all; the front itself wanders with longitude and is ragged at
  // the panel scale, and two or three longitude sectors have not been started.
  // Solid-then-nothing is the point: a per-cell coin toss everywhere gives a
  // mirror ball, not a machine.
  float dysonBuilt(vec3 d) {
    vec2 cell = dysonCell(d);
    float lon = atan(d.z, d.x);
    float lat = asin(clamp(d.y, -1.0, 1.0));
    float front = 0.60 + 0.26 * sin(lon * 2.0 + uSeed * 3.0) + 0.12 * h11(floor(lon / TAU * 22.0) * 5.3 + uSeed);
    float reach = abs(sin(lat)) / max(front, 0.08);
    float sec = floor(lon / TAU * 9.0 + 9.0);
    float open = step(0.70, h11(sec * 4.7 + uSeed * 2.3));  // sectors nobody has reached
    float frac = (1.0 - smoothstep(0.74, 1.06, reach)) * (1.0 - open * 0.94);
    // clamped past 1 and below 0 so the middle of the shell is genuinely
    // solid and the empty sky is genuinely empty; only the front is a coin toss
    return step(h21(cell + uSeed * 7.0), clamp(frac * 1.30 - 0.14, 0.0, 1.0));
  }
  vec3 dysonPanel(vec3 d, vec3 nrm, vec3 rd, float inside) {
    vec2 cell = dysonCell(d);
    float lon = atan(d.z, d.x), lat = asin(clamp(d.y, -1.0, 1.0));
    vec2 f = vec2(fract(lon / TAU * DYSON_LON), fract(lat / PI * DYSON_LAT + 0.5));
    float edge = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y));
    float seam = smoothstep(0.04, 0.0, edge);
    // panel to panel the plating varies, a flat tone under a bright grid is
    // what makes a sphere of squares read as a mirror ball
    float plate = 0.30 + 0.70 * h21(cell + 31.0) * (0.55 + 0.45 * h21(cell * 3.0 + 7.0));
    vec3 hull = mix(uPal1, uPal0, 0.4) * plate;
    vec3 warm = mix(uPal3, vec3(1.0), 0.35);
    // The near shell is a silhouette, plate, barely lit, against its own
    // star. The far shell is the same plate lit from inside by that star.
    vec3 col = hull * mix(0.055, 0.66, inside);
    // a radiator strip down every panel, running hot on the lit shell
    float strip = smoothstep(0.42, 0.47, f.y) * (1.0 - smoothstep(0.53, 0.58, f.y));
    col += warm * strip * mix(0.09, 0.34, inside) * (0.55 + 0.45 * uPulse);
    // seams: a thin line, not a lit grid, a grid is what reads as a ball
    col += warm * seam * mix(0.10, 0.14, inside);
    // the star's light spilling round the limb of its own shell
    col += warm * pow(1.0 - abs(dot(normalize(d), -rd)), 6.0) * 0.5;
    float spec = pow(max(dot(reflect(normalize(vec3(0.3, 0.6, 0.5)), nrm), -rd), 0.0), 30.0) * 0.14;
    return col + vec3(spec) * (1.0 - inside);
  }
  vec4 dyson(vec3 ro, vec3 rd, vec3 C) {
    const float RS = 9.0, RSTAR = 3.8;
    vec3 oc = ro - C;
    float b = dot(oc, rd), cc = dot(oc, oc) - RS * RS;
    float h = b * b - cc;
    vec3 col = vec3(0.0); float cover = 0.0;
    float tN = -1.0, tF = -1.0;
    if (h > 0.0) { float s = sqrt(h); tN = -b - s; tF = -b + s; }
    bool blocked = false;
    if (tN > 0.0) {
      vec3 d = normalize(oc + rd * tN);
      if (dysonBuilt(d) > 0.5) {
        col = dysonPanel(d, d, rd, 0.0);
        cover = 1.0;
        blocked = true;
      }
    }
    if (!blocked) {
      // through a gap: the star
      float e; float ts = iSphere(ro, rd, C, RSTAR, e);
      if (ts > 0.0) {
        // limb-darkened rather than a clipped white disc, so the panels that
        // cross it read as plates against a star and not as holes in a lamp
        vec3 n = normalize(ro + rd * ts - C);
        float mu = max(dot(n, -rd), 0.0);
        col = mix(uPal3, vec3(1.0), 0.42) * (0.26 + 0.74 * mu) * 1.28;
        cover = aa(e);
      } else if (tF > 0.0) {
        // the far shell, lit from inside by the star it encloses
        vec3 d = normalize(oc + rd * tF);
        if (dysonBuilt(d) > 0.5) {
          col = dysonPanel(d, -d, rd, 1.0) * 1.15;
          cover = 1.0;
        }
      }
      // the light escaping through the unbuilt sectors
      float dC = length(cross(oc, rd));
      col += mix(uPal3, vec3(1.0), 0.45) * (exp(-max(dC - RSTAR, 0.0) * 0.62) * 1.25 + exp(-dC * 0.26) * 0.18);
    }
    return vec4(col, cover);
  }

  // ---- derelict shipyard: a hull broken in two with a gash between the
  // sections, its nav beacons still running on the audio level, in a field of
  // tumbling debris. Nothing turns by itself, the chunks hold the attitude
  // they were built with until the hand's sway turns them (hard rule 8).
  // The hull is painted, not black: the first cut mixed two dark palette
  // entries at a third of their value and the whole yard disappeared into the
  // star field. A hard key from the local star, a cold fill so the shadowed
  // faces still read, a rim off the limb, and the plating on top of that.
  vec3 hullShade(vec3 n, vec3 p, vec3 rd, vec3 L, float wreck) {
    float lit = max(dot(n, L), 0.0);
    vec2 uv = abs(n.x) > 0.5 ? p.zy : (abs(n.y) > 0.5 ? p.xz : p.xy);
    float panel = h21(floor(uv * vec2(0.7, 1.6)) + uSeed);
    float seam = smoothstep(0.06, 0.0, min(fract(uv.x * 0.7), fract(uv.y * 1.6)));
    vec3 base = mix(mix(uPal1, uPal0, 0.55), vec3(1.0), 0.30) * (0.55 + 0.45 * panel);
    base = mix(base, mix(uPal4, uPal1, 0.55) * 0.26, wreck); // scorched near the break
    vec3 col = base * (0.10 + 0.90 * lit) + base * 0.15 * (0.5 + 0.5 * n.y);
    col *= 1.0 - seam * 0.35;
    col += vec3(pow(max(dot(reflect(-L, n), -rd), 0.0), 40.0)) * 0.7 * lit;
    col += mix(uPal2, vec3(1.0), 0.5) * pow(1.0 - max(dot(n, -rd), 0.0), 4.0) * 0.22;
    return col;
  }
  vec4 junk(vec3 ro, vec3 rd, vec3 C) {
    vec3 L = normalize(vec3(0.52, 0.38, 0.76));
    vec3 A = normalize(vec3(0.90, 0.13, 0.42));  // the hull's long axis
    vec3 U = normalize(cross(A, vec3(0.0, 1.0, 0.0)));
    vec3 V = cross(A, U);
    vec3 o = ro - C;
    vec3 ol = vec3(dot(o, A), dot(o, U), dot(o, V));
    vec3 dl = vec3(dot(rd, A), dot(rd, U), dot(rd, V));
    vec3 col = vec3(0.0); float cover = 0.0; float tBest = 1e9;
    // two sections of one hull, a gash of empty space between them
    for (int s = 0; s < 2; s++) {
      float sgn = s == 0 ? 1.0 : -1.0;
      vec3 off = vec3(sgn * 8.5, s == 0 ? 0.0 : 0.55, s == 0 ? 0.0 : 0.5);
      vec3 rad = s == 0 ? vec3(6.2, 1.5, 2.0) : vec3(4.4, 1.25, 1.7);
      vec3 nb;
      float t = iBox(ol - off, dl, rad, nb);
      if (t > 0.0 && t < tBest) {
        vec3 p = ol + dl * t - off;
        vec3 n = nb.x * A + nb.y * U + nb.z * V;
        float wreck = smoothstep(6.0, 2.0, abs(p.x) + (s == 0 ? 0.0 : 2.0));
        col = hullShade(n, p, rd, L, wreck);
        // spine lights and a deck row along the flank, still burning
        float run = smoothstep(0.84375, 0.96875, sin(p.x * 1.7) * 0.5 + 0.5) * step(abs(nb.y), 0.5);
        float deck = smoothstep(0.7, 0.95, sin(p.x * 5.3) * 0.5 + 0.5) * smoothstep(0.55, 0.2, abs(p.z))
                   * step(abs(nb.z), 0.5) * (1.0 - wreck);
        col += mix(uPal2, vec3(1.0), 0.5) * (run * 0.55 + deck * 0.30) * (0.35 + 0.65 * uLevel);
        cover = 1.0; tBest = t;
      }
    }
    // debris: chunks on hashed sites with hashed attitudes; sway turns them
    for (int i = 0; i < JUNK_N; i++) {
      float fi = float(i) + uSeed * 3.0;
      vec3 site = (vec3(h11(fi * 1.7), h11(fi * 3.3 + 1.1), h11(fi * 5.9 + 2.3)) * 2.0 - 1.0) * vec3(19.0, 7.0, 9.0);
      // mostly small chunks with a few big pieces of hull among them
      float sc = 0.40 + 1.85 * pow(h11(fi * 7.7 + 4.1), 1.7);
      vec3 p = ol - site;
      vec3 d = dl;
      float a1 = h11(fi * 2.9 + 0.7) * TAU + uSway * 1.4;
      float a2 = h11(fi * 4.3 + 3.1) * TAU + uSway * 0.9;
      p.xy = rot2(a1) * p.xy; d.xy = rot2(a1) * d.xy;
      p.yz = rot2(a2) * p.yz; d.yz = rot2(a2) * d.yz;
      vec3 nb;
      float t = iBox(p, d, vec3(sc, sc * 0.62, sc * 0.8), nb);
      if (t > 0.0 && t < tBest) {
        vec3 nr = nb;
        nr.yz = rot2(-a2) * nr.yz; nr.xy = rot2(-a1) * nr.xy;
        vec3 n = nr.x * A + nr.y * U + nr.z * V;
        col = hullShade(n, (p + d * t) * 3.0, rd, L, 0.45) * 1.2;
        cover = 1.0; tBest = t;
      }
    }
    // beacons on the wreck, and the dust the yard sits in
    for (int k = 0; k < 2; k++) {
      vec3 bp = C + A * (k == 0 ? 14.0 : -12.5) + U * (k == 0 ? 1.4 : -1.2);
      float dB = length(cross(ro - bp, rd));
      float phase = 0.5 + 0.5 * sin(uTime * 2.2 + float(k) * 2.1);
      col += mix(k == 0 ? uPal4 : uPal2, vec3(1.0), 0.4) * exp(-dB * dB * 1.1) * (0.35 + 0.65 * phase) * (1.2 + 1.4 * uLevel);
    }
    float dC = length(cross(o, rd));
    col += mix(uPal0, uPal1, 0.5) * exp(-dC * 0.14) * 0.10;
    return vec4(col, cover);
  }

  // ---- the worlds: one radius-6 body, five surfaces on a shape index.
  //   0 volcanic   fissure network and lava seas that emit their own light,
  //                so the night side of the terminator is nothing but cracks
  //   1 ice        crevasse fields, hard sheen, limb scatter
  //   2 gas giant  zonal bands sheared by turbulence, three storm ovals
  //   3 ocean      wave-roughened sun glint, domain-warped cloud swirls
  //   4 terrestrial land/sea/ice, cloud, city lights on the coasts at night
  vec4 world(vec3 ro, vec3 rd, vec3 C, int kind) {
    const float R = 6.0;
    // the sun sits nearly side-on, so every world carries a real terminator,
    // the volcanic one's fissures are the only light across it, and the
    // terrestrial one's cities come up on the dark half
    vec3 L = normalize(vec3(-0.88, 0.32, 0.24));
    vec3 axis = normalize(vec3(0.16, 1.0, 0.22));
    vec3 col = vec3(0.0); float cover = 0.0;
    float e; float t = iSphere(ro, rd, C, R, e);
    // The air is chosen BEFORE the sphere test. The limb term at the bottom is
    // the atmosphere seen where the ray MISSES the body, exactly the rays for
    // which the surface branch never runs, so a colour picked inside it never
    // reaches the halo, and every world wore the same default rim.
    vec3 atmo; float atmoK;
    if (kind == 0) { atmo = mix(uPal4, uPal3, 0.55); atmoK = 0.52; }        // volcanic: ash lit from below
    else if (kind == 1) { atmo = mix(uPal2, vec3(1.0), 0.35); atmoK = 0.5; } // ice: thin and bright
    else if (kind == 2) { atmo = mix(uPal3, uPal0, 0.5); atmoK = 0.7; }      // gas giant: deep haze
    else if (kind == 3) { atmo = mix(uPal2, uPal0, 0.35); atmoK = 0.9; }     // ocean: the thickest air here
    else { atmo = mix(uPal2, uPal0, 0.3); atmoK = 0.5; }                     // terrestrial
    // (a surface branch may still deepen atmoK per pixel for the fresnel on
    // the disc; the limb term below is masked off wherever that has happened)
    if (t > 0.0) {
      vec3 n = normalize(ro + rd * t - C);
      vec3 sp = n * 1.0 + uSeed * 0.7;
      float lit = max(dot(n, L), 0.0);
      float ndl = dot(n, L);
      float wrap = smoothstep(-0.16, 0.38, ndl);
      float night = 1.0 - smoothstep(-0.04, 0.20, ndl);
      float term = exp(-ndl * ndl * 11.0);
      float fres = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
      if (kind == 0) {
        // VOLCANIC, a basalt crust with a sunlit half and a night half, cut
        // by a fissure network and flooded in the low ground by lava that
        // lights itself, so across the terminator the cracks are all there is
        float base = wf3(sp * 2.4);
        // the ridge of value noise sits at its own mode, so the fissures have
        // to be cut close to 1 or the whole crust glows
        float fis = smoothstep(0.88, 0.99, ridged(sp * 5.5)) + 0.55 * smoothstep(0.92, 0.99, ridged(sp * 12.0));
        // lava seas: the basins, skinned over with a cooling crust
        float sea = smoothstep(0.34, 0.15, base);
        float crust = smoothstep(0.34, 0.78, wf3(sp * 13.0 + vec3(0.0, uTime * 0.035, 0.0)));
        float molten = clamp(fis * (0.35 + 0.65 * crust) + sea * (0.22 + 0.78 * crust), 0.0, 1.6);
        // the crust reads as rock in the sun and as nothing at all at night
        vec3 basalt = mix(mix(uPal1, uPal2, 0.30) * 0.16, mix(uPal0, uPal1, 0.30) * 0.50, base);
        basalt *= 0.62 + 0.38 * wf3(sp * 9.0);
        // molten rock is dull red at the edge of a flow and white only in its
        // core, the old ramp started at 72 % white and the whole planet
        // looked like cracked marble
        vec3 dull = mix(uPal4, uPal3, 0.22) * 0.55;
        vec3 core = mix(uPal3, vec3(1.0), 0.55);
        vec3 lava = mix(dull, uPal3, clamp(molten * 1.5, 0.0, 1.0));
        lava = mix(lava, core, clamp((molten - 0.72) * 2.4, 0.0, 1.0));
        col = basalt * (0.04 + 1.40 * wrap);
        col += lava * molten * 1.15;  // emissive: the only light at night
        // ash: a haze that catches the sun, and glows from beneath over a flow
        float ash = wf3(sp * 3.1 + 4.0);
        col += mix(uPal4, uPal0, 0.5) * ash * (0.05 + 0.34 * wrap) * 0.5;
        col += mix(uPal3, vec3(1.0), 0.3) * molten * ash * 0.30;
        atmoK = 0.38 + molten * 0.45;  // the ash over a flow carries its light
      } else if (kind == 1) {
        // ICE
        float base = wf3(sp * 3.0);
        float crev = smoothstep(0.90625, 0.96875, ridged(sp * 7.5));
        vec3 ice = mix(mix(uPal2, vec3(1.0), 0.74), mix(uPal0, vec3(1.0), 0.55), base);
        col = ice * (0.06 + 0.94 * wrap) * (1.0 - crev * 0.5);
        col += mix(uPal2, vec3(1.0), 0.75) * pow(max(dot(reflect(-L, n), -rd), 0.0), 90.0) * 0.85 * lit;
        col += mix(uPal2, vec3(1.0), 0.6) * fres * (0.15 + 0.85 * lit) * 0.55;
        col += mix(uPal2, uPal0, 0.5) * night * 0.02;
      } else if (kind == 2) {
        // GAS GIANT, bands shear along the flow, storms hold their place
        float la = dot(n, axis);
        float flow = uTime * 0.02;
        float turb = wf3(sp * 3.2 + vec3(flow * 2.4, 0.0, flow)) * 2.0 - 1.0;
        float bands = sin(la * 15.0 + turb * 2.6);
        vec3 c1 = mix(uPal3, vec3(1.0), 0.42), c2 = mix(uPal4, uPal1, 0.45), c3 = mix(uPal0, vec3(1.0), 0.25);
        vec3 surf = mix(mix(c2, c1, 0.5 + 0.5 * bands), c3, smoothstep(0.55, 0.98, abs(la)));
        for (int k = 0; k < 3; k++) {
          float fk = float(k) + uSeed;
          // the first storm is placed on the hemisphere that faces the eye,
          // three storms on random directions leave the visible face plain
          // more often than not, and a banded giant with no spot is a stripe
          vec3 sc = k == 0
            ? normalize(vec3(0.44 * (h11(fk * 2.3) * 2.0 - 1.0), -0.30 + 0.24 * h11(fk * 5.1), 0.80))
            : normalize(vec3(h11(fk * 2.3) * 2.0 - 1.0, (h11(fk * 5.1) - 0.5) * 0.9, h11(fk * 7.9) * 2.0 - 1.0));
          float dLat = dot(n - sc, axis);
          float dAlong = length(n - sc) ;
          float oval = exp(-(dAlong * dAlong * (k == 0 ? 8.5 : 14.0) + dLat * dLat * (k == 0 ? 42.0 : 70.0)));
          float streak = 0.5 + 0.5 * sin(dAlong * 46.0 - uTime * 0.7 + turb * 3.0);
          vec3 storm = mix(mix(uPal4, vec3(1.0), 0.5), mix(uPal3, vec3(1.0), 0.2), streak);
          surf = mix(surf, storm * (0.7 + 0.5 * streak), clamp(oval * 1.3, 0.0, 0.95));
        }
        col = surf * (0.05 + 0.95 * wrap);
      } else if (kind == 3) {
        // OCEAN
        float base = wf3(sp * 2.2);
        vec3 deep = mix(uPal2, uPal1, 0.45) * 0.28, shallow = mix(uPal2, vec3(1.0), 0.45) * 0.75;
        vec3 sea = mix(deep, shallow, smoothstep(0.40, 0.70, base) * 0.8);
        vec3 wp = sp * 3.2 + vec3(uTime * 0.014, 0.0, uTime * 0.008);
        float warp = wf3(wp * 1.8);
        float cl = smoothstep(0.58, 0.86, wf3(wp + warp * 0.9));
        col = mix(sea, vec3(0.95), cl * 0.85) * (0.05 + 0.95 * wrap);
        vec3 H = normalize(L - rd);
        float rough = 0.30 + 0.45 * wf3(sp * 20.0 + vec3(uTime * 0.05, 0.0, 0.0));
        float glint = pow(max(dot(n, H), 0.0), mix(620.0, 55.0, rough)) * (1.0 - cl) * lit;
        col += mix(uPal3, vec3(1.0), 0.80) * glint * 3.2;
      } else {
        // TERRESTRIAL
        float base = wf3(sp * 2.6);
        float landM = smoothstep(0.475, 0.535, base);
        float coast = smoothstep(0.44, 0.48, base) * (1.0 - smoothstep(0.53, 0.60, base));
        float cap = smoothstep(0.70, 0.90, abs(dot(n, axis)));
        vec3 land = mix(mix(uPal1, uPal3, 0.45) * 0.42, mix(uPal4, uPal3, 0.6) * 0.55, wf3(sp * 6.5));
        vec3 sea = mix(uPal2, uPal0, 0.55) * 0.26;
        vec3 surf = mix(sea, land, landM);
        surf = mix(surf, vec3(0.86), cap);
        float cl = smoothstep(0.58, 0.86, wf3(sp * 3.4 + vec3(uTime * 0.012, 0.0, 0.0)));
        surf = mix(surf, vec3(0.92), cl * 0.62);
        col = surf * (0.04 + 0.96 * wrap);
        // city lights: hashed cells, clustered on land and along the coasts,
        // each a point inside its cell rather than the cell itself
        vec3 g = n * 64.0;
        vec3 gc = floor(g + 0.5);
        vec3 gf = g - gc;
        float grid = wh3(gc);
        float point = exp(-dot(gf, gf) * 13.0);
        float lights = smoothstep(0.72, 0.96, grid) * point * landM * (0.30 + 0.70 * coast) * night * (1.0 - cl * 0.8);
        col += mix(uPal3, vec3(1.0), 0.4) * lights * 4.0 * (0.65 + 0.35 * sin(uTime * 2.4 + grid * 60.0));
        atmoK = 0.5 + term * 0.7;  // the terminator's own scattering
      }
      col += atmo * fres * (0.10 + 0.90 * lit + term * 0.5) * atmoK;
      cover = aa(e);
    }
    // the limb's own scattering, just outside the disc
    float dC = length(cross(ro - C, rd));
    col += atmo * exp(-max(dC - R, 0.0) * 2.2) * step(R, dC) * 0.28 * atmoK;
    return vec4(col, cover);
  }

  // ---- the G-type star of the relativistic warp (from the old Wormhole
  // scene's DRIFT sky): a limb-darkened disc, an inner glare and a thin
  // corona, the glare and corona breathing slowly on two incommensurate
  // periods (a few percent each, not a rotation), Doppler-blued as the
  // flight runs at it. Radius 12 in the body's own units, the glare and
  // corona reaching out to the window's edge.
  vec4 sunBody(vec3 ro, vec3 rd, vec3 C) {
    const float R = 12.0;
    vec3 col = vec3(0.0); float cover = 0.0;
    vec3 disc = mix(uPal3, vec3(1.0), 0.72) * vec3(1.0, 0.97, 0.92);
    vec3 glare = mix(uPal3, vec3(1.0), 0.55) * vec3(1.0, 0.93, 0.82);
    vec3 corona = mix(uPal4, uPal3, 0.5) * vec3(1.0, 0.9, 0.78);
    float e; float t = iSphere(ro, rd, C, R, e);
    if (t > 0.0) {
      vec3 n = normalize(ro + rd * t - C);
      float mu = max(dot(n, -rd), 0.0);
      col = disc * (0.35 + 0.65 * mu) * 3.2; // limb darkening
      cover = aa(e);
    }
    float breathe = 1.0 + 0.08 * sin(uTime * 0.61) + 0.05 * sin(uTime * 1.37);
    float dC = length(cross(ro - C, rd));
    float ang = max(dC - R, 0.0) / R; // the pen's angle, in units of the disc's radius
    col += glare * exp(-ang * 0.88 * 4.0) * 0.6 * breathe * (1.0 + uPulse * 0.15); // inner glare
    col += corona * exp(-ang * 0.224 * 4.0) * 0.08 * breathe;                      // outer corona
    col *= mix(vec3(1.0), vec3(0.75, 0.85, 1.25), clamp(uAber, 0.0, 1.0));          // Doppler
    return vec4(col, cover);
  }

  void main() {
    vec3 ro = cameraPosition;
    vec3 rd = normalize(vWorld - ro);
    // work in object-local scale: scale the ray origin instead of the shapes
    vec3 C = uObjPos;
    vec3 roS = C + (ro - C) / uScale;
    vec4 o;
    if (uShape < 5.5) {
      if (uShape < 0.5) o = pulsar(roS, rd, C);
      else if (uShape < 1.5) o = galaxy(roS, rd, C);
      else if (uShape < 2.5) o = solarSystem(roS, rd, C);
      else if (uShape < 3.5) o = nebula(roS, rd, C);
      else if (uShape < 4.5) o = ringed(roS, rd, C);
      else o = halo(roS, rd, C);
    } else if (uShape < 6.5) o = dyson(roS, rd, C);
    else if (uShape < 7.5) o = junk(roS, rd, C);
    else if (uShape < 12.5) o = world(roS, rd, C, int(uShape) - 8);
    else o = sunBody(roS, rd, C);
    // the quad is a window onto the body, and a window must not have edges:
    // everything falls off inside the disc inscribed in it, so no halo, dust
    // or corona can ever run into the corner of its own billboard
    float dWin = length(cross(roS - C, rd));
    float win = 1.0 - smoothstep(0.859375, 0.96875, dWin / max(uWindow, 0.001));
    o *= win;
    float a = clamp(o.a, 0.0, 1.0) * uAlpha;
    fragColor = vec4(o.rgb * uAlpha * uIntensity, a);
  }
`;

// ------------------------------------------- sky: the panorama and the throat
// One quad behind everything, in two modes.
//
//   PANORAMA  (the black hole) A procedural sky, stars at three cell
//             densities, a Milky Way band with dust lanes, nebula fields,
//             sampled per pixel THROUGH the pen's lens at the rotated
//             coordinate (texture(sky, rotate(mt, st, pull)) in the original)
//             and darkened by pull·0.25, so the ring inversion reads on a
//             textured sky and the hole's interior shows the mirrored sky.
//             It also serves the big bang, washing in behind the expansion as
//             the pen's nebula does when its universe ages.
//   THROAT    (the wormhole) The disc ahead is the sky you are going TO
//             (seed B) through the mouth; outside it, once you are inside,
//             the tube wall is the sky you LEFT (seed A) smeared around the
//             tube, dimming as it recedes behind you, with lensing rings
//             streaming past, so both skies are in the frame at once and
//             they do not match.
const SKY_FRAG = /* glsl */ `
  ${GLSL_COMMON}
  uniform vec2 uRes;
  uniform float uTime, uSky, uIntensity, uRoll, uYaw, uMode, uSeedA, uSeedB, uFlow, uNebula;
  uniform float uPanA; // the panorama's own alpha outside the mouth: 1 for the hole and the bang, the regime's for the warp, 0 for a transit opening from cruise
  uniform float uAber; // the relativistic warp: β, streaks the panorama along the aberration path
  uniform int uStreakK; // samples along that path (a uniform bound: the loop is not unrolled)
  uniform vec2 uHole;
  uniform vec2 uMouthLens; // the wormhole mouth's thin lens on the panorama: radius, pull
  uniform vec4 uThroat; // aperture radius, inside 0..1, rim, wall gain
  uniform vec3 uPal0, uPal1, uPal2, uPal3, uPal4;
  in vec2 vUv;
  out vec4 fragColor;
  vec2 octa(vec3 d) {
    d /= (abs(d.x) + abs(d.y) + abs(d.z));
    vec2 o = d.xy;
    if (d.z < 0.0) o = (1.0 - abs(o.yx)) * vec2(o.x >= 0.0 ? 1.0 : -1.0, o.y >= 0.0 ? 1.0 : -1.0);
    return o;
  }
  vec3 starTint(float t) {
    vec3 warm = vec3(1.0, 0.55, 0.32), sol = vec3(1.0, 0.94, 0.85), blue = vec3(0.66, 0.78, 1.0);
    return t < 0.6 ? mix(warm, sol, t / 0.6) : mix(sol, blue, (t - 0.6) / 0.4);
  }
  // the star cells get their own sin-free hash for the same reason as h31,
  // and the magnitude curve is a chain of squarings rather than two pow()s
  float sh21(vec2 p) {
    vec3 q = fract(vec3(p.xyx) * 0.1031);
    q += dot(q, q.yzx + 33.33);
    return fract((q.x + q.y) * q.z);
  }
  vec3 starSphere(vec3 rd, float seed) {
    vec3 col = vec3(0.0);
    vec2 o = octa(rd);
    for (int L = 0; L < 3; L++) {
      float sc = 26.0 + float(L) * 42.0;
      vec2 p = o * sc + seed * (7.13 + float(L) * 3.71);
      vec2 cell = floor(p);
      vec2 f = fract(p);
      vec2 sp = vec2(sh21(cell), sh21(cell + 91.0));
      float d = length(f - sp) / sc;
      float m = sh21(cell + 17.0);
      float m2 = m * m, m4 = m2 * m2, m8 = m4 * m4, m16 = m8 * m8;
      float mag = m16 * m2 * 3.0 + m4 * m * 0.12;
      float psf = 0.0008 + min(mag, 2.5) * 0.0006;
      col += starTint(sh21(cell + 5.0)) * min(mag * smoothstep(psf, 0.0, d), 1.7);
    }
    return col;
  }
  // Seamless on the sphere: value noise on the direction itself (the
  // octahedral map is only used for the star cells, whose seams are
  // invisible). The hash is deliberately sin-free, this is the one shader in
  // the scene that evaluates noise over every pixel of the frame, and a
  // transcendental per lattice corner is most of its cost.
  float h31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }
  float noise3(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    // Quintic fade, not the cubic one. A cubic fade leaves a second-derivative
    // kink on every lattice plane; a smoothstep threshold over it, which is
    // how every nebula field below is cut, turns those planes into visible
    // cube faces, and the sky reads as stacked boxes instead of gas.
    f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    return mix(mix(mix(h31(i), h31(i + vec3(1, 0, 0)), f.x), mix(h31(i + vec3(0, 1, 0)), h31(i + vec3(1, 1, 0)), f.x), f.y),
               mix(mix(h31(i + vec3(0, 0, 1)), h31(i + vec3(1, 0, 1)), f.x), mix(h31(i + vec3(0, 1, 1)), h31(i + vec3(1, 1, 1)), f.x), f.y), f.z);
  }
  // Each octave is turned as well as scaled (iq's rotation, scaled by 2), so
  // the lattices never line up and the sum has no preferred axis, the other
  // half of what stops the field looking like masonry.
  const mat3 OCT = mat3(0.0, 1.6, 1.2, -1.6, 0.72, -0.96, -1.2, -0.96, 1.28);
  float fbm3(vec3 p) {
    float n = 0.0, a = 0.5;
    for (int i = 0; i < SKY_OCT; i++) { n += a * noise3(p); p = OCT * p + 11.7; a *= 0.5; }
    return n;
  }
  // the gas: the Milky Way band with its dust lanes and the nebula fields,
  // everything in the sky but the point stars
  vec3 skyGas(vec3 rd, float seed) {
    vec3 col = vec3(0.0);
    vec3 N = normalize(vec3(0.35, 1.0, 0.2));
    float lat = dot(rd, N);
    float band = exp(-lat * lat * 18.0);
    float mw = fbm3(rd * 6.0 + 3.0 + seed) * band;
    // the dust lanes live at one scale, so they cost one octave, not four
    float dust = smoothstep(0.42, 0.72, noise3(rd * 14.0 + 9.0 + seed) * 0.65 + noise3(OCT * rd * 14.5 + seed) * 0.35) * band;
    col += mix(uPal3, vec3(1.0), 0.6) * mw * 0.6 * (1.0 - dust * 0.8);
    col += mix(uPal0, vec3(1.0), 0.4) * band * 0.12;
    // one fbm for the big nebula field; the second is a single octave, which
    // is all a soft blob needs and half the cost of the whole function
    float n1 = fbm3(rd * 3.5 + 17.0 + seed);
    float n2 = noise3(rd * 4.0 + 41.0 + seed) * 0.7 + noise3(OCT * rd * 4.5 + seed) * 0.3;
    vec3 neb = uPal1 * smoothstep(0.5, 0.85, n1) * 0.4 + uPal4 * smoothstep(0.55, 0.9, n2) * 0.35 + uPal2 * smoothstep(0.6, 0.95, n1 * n2 * 1.6) * 0.45;
    return col + neb * (1.0 + uNebula * 2.2);
  }
  // The two modes and the throat's two halves choose a DIRECTION, a seed and a
  // gain; the sky itself is evaluated exactly once per pixel, at the end. The
  // HLSL translator flattens branches in code with no side effects, so a sky
  // call inside each branch would be paid for three times over on every pixel
  // of the frame, the difference between 5 ms and 27 ms at 1080p.
  //   mode 0  the PANORAMA: through the black hole's lens; behind the young
  //           universe; behind the box field under the relativistic warp,
  //           streaked along the aberration path; and around the wormhole's
  //           mouth as it opens, the mouth's thin lens bends it, the disc
  //           shows the sky ahead (seed B), the Einstein ring at the photon
  //           radius brightens under the warp
  //   mode 1  the THROAT: inside the wormhole's tube
  void main() {
    vec2 uv = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
    uv = rot2(uRoll) * uv;
    float r = length(uv);
    vec3 rd; float seed, gain, alpha;
    vec3 add = vec3(0.0);
    float ab = 0.0; // aberration on this pixel's stars
    if (uMode > 0.5) {
      // ---- the wormhole throat
      float ap = max(uThroat.x, 0.0001);
      float inDisc = step(r, ap);
      float wall = uThroat.w * uThroat.y;
      // the sky AHEAD, through the mouth: the far hemisphere compressed into
      // the disc, so the aperture is a window and not a hole
      vec2 p = uv / ap;
      vec3 rdA = normalize(vec3(p * 1.25, -1.0));
      // the tube wall: the sky BEHIND, wrapped around the throat. dep = 1 at
      // the aperture rim, falling to 0 at the frame edge (right beside the
      // eye), so the mapping is the lensing itself.
      float ang = atan(uv.y, uv.x);
      float dep = clamp(ap / r, 0.0, 1.0);
      vec3 rdW = normalize(vec3(cos(ang), sin(ang), 0.0) * (0.30 + 0.70 * dep) + vec3(0.0, 0.0, dep * 1.7 - 0.85));
      float s = -log(max(dep, 0.002)) * 0.85 + uFlow;
      // the sky you left dims toward the frame edge, that is the wall
      // passing the eye, and carries lensing bands streaming down it. The
      // falloff is gentle on purpose: the whole point of the transit is that
      // the sky BEHIND and the sky AHEAD are in the frame together and do not
      // match, and a steeper curve leaves the wall black and the point unmade.
      float gW = pow(dep, 1.5) * 0.85 * (0.40 + 0.60 * (0.5 + 0.5 * sin(s * 5.0))) * wall;
      float gA = 1.15 + 0.85 * (1.0 - length(p));
      rd = mix(rdW, rdA, inDisc);
      seed = mix(uSeedA, uSeedB, inDisc);
      gain = mix(gW, gA, inDisc);
      add = (1.0 - inDisc) * wall * (mix(uPal2, uPal0, 0.55) * pow(dep, 1.5) * (0.10 + 0.34 * pow(0.5 + 0.5 * sin(s * 5.0 + 1.1), 3.0))
           + mix(uPal1, uPal4, 0.5) * pow(dep, 3.5) * 0.45);
      // the rim where the two skies meet
      float rim = exp(-pow((r - ap) / (ap * 0.05 + 0.004), 2.0));
      add += mix(uPal2, vec3(1.0), 0.32) * rim * uThroat.z * 0.5;
      alpha = max(mix(uThroat.y, 1.0, inDisc), rim * uThroat.z * 0.9);
    } else {
      // ---- the panorama, seen through the pen's lens and the mouth's
      vec2 q = mouthLens(lens(uv, uHole), uMouthLens);
      vec3 rr = normalize(vec3(q * 1.2, -1.0));
      float cy = cos(uYaw), sy = sin(uYaw);
      rd = vec3(rr.x * cy + rr.z * sy, rr.y, -rr.x * sy + rr.z * cy);
      seed = uSeedA;
      gain = 1.0 - lensDark(uv, uHole);
      alpha = uPanA;
      ab = uAber;
      // the wormhole's mouth opening ahead: through the aperture the sky you
      // are going TO (seed B), compressed into the disc so it is a window and
      // not a hole; the rim where the two skies meet is the Einstein ring at
      // the photon radius, brighter under the warp
      if (uThroat.z > 0.0001) {
        float ap = max(uThroat.x, 0.0001);
        float inDisc = step(r, ap);
        vec2 p = uv / ap;
        vec3 rdA = normalize(vec3(p * 1.25, -1.0));
        rd = mix(rd, rdA, inDisc);
        seed = mix(seed, uSeedB, inDisc);
        gain = mix(gain, 1.15 + 0.85 * (1.0 - length(p)), inDisc);
        alpha = mix(alpha, 1.0, inDisc);
        ab *= 1.0 - inDisc;
        float rim = exp(-pow((r - ap) / (ap * 0.05 + 0.004), 2.0));
        add += mix(uPal2, vec3(1.0), 0.32) * rim * uThroat.z * (0.5 + uAber * 1.3);
        alpha = max(alpha, rim * uThroat.z * 0.9);
      }
    }
    // where the hole's darkening (or the receding tube wall) has taken the
    // pixel to nothing there is no sky to evaluate, a real early-out, which
    // is most of the frame through the swallow (and the whole frame around a
    // mouth opening from cruise)
    if (gain < 0.004 || alpha < 0.002) {
      fragColor = vec4(add * uIntensity * uSky, clamp(alpha, 0.0, 1.0) * uSky);
      return;
    }
    // the stars: under the warp, integrated along the aberration path, the
    // star field smears toward the direction of travel as the sky crowds
    // forward, blue-bright ahead and red-dim toward the edge, otherwise one
    // sample; the gas once either way
    vec3 stars;
    if (ab > 0.003) {
      vec3 fwd = vec3(0.0, 0.0, -1.0);
      float wsum = 0.0;
      stars = vec3(0.0);
      for (int k = 0; k < uStreakK; k++) {
        float f = float(k) / float(max(uStreakK - 1, 1));
        vec3 rk = normalize(mix(rd, fwd, ab * f * 0.28));
        float w = 1.0 - f * 0.75;
        stars += starSphere(rk, 3.7 + seed + f * ab * 0.9) * w; // seed advance = flight
        wsum += w;
      }
      stars *= 1.3 / max(wsum, 0.001);
      float ahead = dot(rd, fwd) * 0.5 + 0.5;
      stars *= mix(vec3(0.9, 0.5, 0.35) * 0.6, vec3(0.8, 0.95, 1.45) * 1.6, ahead) * (1.0 + ab * 0.6);
    } else {
      stars = starSphere(rd, 3.7 + seed) * 1.3;
    }
    vec3 col = (stars + skyGas(rd, seed)) * gain + add;
    fragColor = vec4(col * uIntensity * uSky, clamp(alpha, 0.0, 1.0) * uSky);
  }
`;

// ------------------------------------------------- overlay: black hole + glow
const OVER_VERT = /* glsl */ `
  out vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// The sky's own vertex shader: the overlay's, plus the same warm-up collapse
// the object quad carries (see the note at the end of update()).
const SKY_VERT = /* glsl */ `
  uniform float uWarm;
  out vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = uWarm > 0.5 ? vec4(position.xy * 0.002 - 0.998, 0.0, 1.0) : vec4(position.xy, 0.0, 1.0);
  }
`;

const OVER_FRAG = /* glsl */ `
  ${GLSL_COMMON}
  uniform vec2 uRes;
  uniform float uTime, uWarp, uFlash, uVeil, uIntensity, uRoll, uSing;
  uniform vec2 uHole;
  uniform vec3 uMouth; // wormhole: aperture radius, rim brightness, surrounding darkening
  uniform vec3 uPal0, uPal1, uPal2, uPal3, uPal4;
  in vec2 vUv;
  out vec4 fragColor;
  void main() {
    vec2 uv = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
    uv = rot2(uRoll) * uv;
    float r = length(uv);
    vec3 col = vec3(0.0);
    // the cold open: the singularity, breathing on the level, and nothing else
    col += mix(uPal2, vec3(1.0), 0.7) * uSing * (0.010 / (r * r * 26.0 + 0.004) + 0.05 * exp(-r * 34.0));
    // vanishing-point glow of the jump, and the exit flash
    col += mix(uPal2, vec3(1.0), 0.5) * uWarp * uWarp * 0.22 / (r * 6.0 + 0.25);
    col += vec3(1.0) * uFlash * 0.35;
    // the wormhole mouth: a gravitational darkening around the throat. The
    // rim itself belongs to the sky pass, drawing it twice blows it out.
    float ap = max(uMouth.x, 0.0001);
    float mouthDark = uMouth.z * smoothstep(ap * 0.97, ap * 1.06, r) * (1.0 - smoothstep(ap * 1.05, ap * 3.4, r));
    // the pen's darkening: the core goes black, the rings dim toward it
    float dark = lensDark(uv, uHole);
    float cover = max(max(dark, uVeil), clamp(mouthDark, 0.0, 1.0));
    col *= (1.0 - cover);
    fragColor = vec4(col * uIntensity, cover);
  }
`;

// ------------------------------------------------ tunnel end: the corridor
// Gunawan's tiles as one InstancedMesh standing in the flight's world: the
// mouth at uMouthZ on the flight axis, the tiles laid from the mouth away down
// −z, scaled about the mouth by the arrival growth, ended at uEndZ (the far
// end opens there). The flight flies through it; the eye's offset inside the
// corridor and the sway's roll are applied to the corridor, not the camera.
const TILE_VERT = /* glsl */ `
  in vec4 aInst;      // lane x, row (0 floor / 1 ceiling), z0 along the corridor (pen units), palette slot
  uniform float uMouthZ, uEndZ, uScale, uPitch, uGap, uComp, uBeat, uIntensity, uAlpha, uWarm;
  uniform vec2 uEye;   // the eye's offset inside the corridor, pen units
  uniform vec3 uPal[5];
  out vec3 vCol;
  out float vDepth;
  out float vA;
  void main() {
    if (uWarm > 0.5) { vCol = vec3(0.0); vDepth = 0.0; vA = 0.0; gl_Position = vec4(position.xy * 0.002 - 0.998, 0.0, 1.0); return; }
    float s = uScale; // flight units per pen unit × the arrival growth
    // the tile's place along the corridor, then the sway's depth compression
    // about the mouth (or the eye once the mouth is behind), then its own
    // footprint, the tile is the pen's unit plane lying flat
    float zu = uMouthZ - aInst.z * s;
    float pivot = min(uMouthZ, 0.0);
    float z = pivot + (zu - pivot) * uComp + position.z * s * uComp;
    float x = ((aInst.x + position.x) * uPitch - uEye.x) * s;
    float y = (aInst.y * uGap - uEye.y) * s;
    vec4 mv = modelViewMatrix * vec4(x, y, z, 1.0);
    gl_Position = projectionMatrix * mv;
    vDepth = -mv.z;
    // the far end: tiles past it are not there (the opening is soft)
    vA = uAlpha * smoothstep(uEndZ - 4.0 * s, uEndZ + 4.0 * s, zu);
    // flat emissive colour from the slot's palette entry; the beat lifts it
    // toward white
    vec3 c = uPal[int(aInst.w)];
    c = mix(c, vec3(1.0), uBeat * 0.3) * (1.0 + uBeat * 0.4);
    vCol = c * uIntensity;
  }
`;
const TILE_FRAG = /* glsl */ `
  uniform float uFogD, uIntensity;
  uniform vec3 uFogCol;
  in vec3 vCol;
  in float vDepth;
  in float vA;
  out vec4 fragColor;
  void main() {
    // three.js FogExp2: 1 - exp(-(density * depth)^2), toward the fog colour
    float f = 1.0 - exp(-uFogD * uFogD * vDepth * vDepth);
    fragColor = vec4(mix(vCol, uFogCol * uIntensity, f) * vA, 1.0);
  }
`;

// --------------------------------------------- wormhole pt 1: the throat
// DULA's tunnel field, stateless in the vertex shader; the mesh carries the
// throat's place in the world (its mouth (the pen's z = 200) at the mesh
// origin) and the scale, so the shader works in the pen's units throughout.
const THROAT_VERT = /* glsl */ `
  in vec4 aSeed; // x swirl rate, y speed step, z foam jitter, w colour jitter
  uniform float uTime, uTravel, uSwirl, uStab, uShock, uSpeedZ, uWarpW, uBright, uSize, uCap, uOpen, uWarm;
  uniform vec2 uWarp;
  uniform vec3 uStableA, uStableB, uUnstableA, uUnstableB;
  out vec3 vColor;
  out float vAlpha;

  const float TUNNEL_LENGTH = ${TH_LENGTH.toFixed(1)};
  const float TUNNEL_RADIUS = ${TH_RADIUS.toFixed(1)};
  const float LAP = ${TH_LAP.toFixed(1)};
  const float SWIRL_BASE = ${TH_SWIRL_BASE.toFixed(6)};

  // --- Ashima simplex noise (MIT), as the pen's velocity pass used it
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
                                    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                                    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  // the pen's zeta resonance: three standing waves along z at the first
  // three zeta zeros' frequencies, wobbling the confinement radius
  float zetaResonance(float z, float t) {
    return sin(z * 0.01 + t * 1.41347)
         + 0.5 * sin(z * 0.02 - t * 2.10220)
         + 0.25 * sin(z * 0.05 + t * 2.50108);
  }

  void main() {
    if (uWarm > 0.5) { vColor = vec3(0.0); vAlpha = 0.0; gl_PointSize = 1.0; gl_Position = vec4(-0.998, -0.998, 0.0, 1.0); return; }
    // --- the lap: forward travel through the tunnel, respawn at −2500
    float sv = 0.8 + floor(aSeed.y * ${TH_SPEED_STEPS}.0) * 0.05; // 0.8..1.2 in 0.05 steps
    float z = -TUNNEL_LENGTH + mod(position.x * LAP + uTravel * sv, LAP);
    float age = (z + TUNNEL_LENGTH) / LAP; // 0 at spawn, 1 at the mouth

    // --- radius: the ring it spawned on, settling onto the dynamic radius
    // that the zeta resonance wobbles when stability is low (a shock kicks
    // the wobble harder); at the exit the wall blooms open around the eye
    float r0 = TUNNEL_RADIUS * (0.8 + 0.4 * position.z);
    float wob = (1.0 - uStab) + uShock * 2.0;
    float dynR = TUNNEL_RADIUS + zetaResonance(z, uTime) * 80.0 * wob;
    float r = mix(r0, dynR, 1.0 - exp(-age * 30.0)) * (1.0 + uOpen * (1.5 + 2.0 * age));

    // --- swirl: per-particle angular advance on an integrated phase
    float rateStep = 3.0 + floor(aSeed.x * 10.999); // 3..13 steps
    float theta = position.y * 6.2831853 + uSwirl * rateStep * SWIRL_BASE;
    vec3 p = vec3(cos(theta) * r, sin(theta) * r, z);

    // --- foam: one coherent simplex field, (1 − stability) plus shock
    float foamAmp = (1.0 - uStab) * 150.0 + uShock * 60.0;
    float foamSpeed = 0.0;
    if (foamAmp > 0.5) {
      vec3 q = p * 0.01 + uTime * 0.6 + aSeed.z * 0.15;
      vec3 n = vec3(snoise(q), snoise(q + 10.0), snoise(q + 20.0));
      p += n * foamAmp;
      foamSpeed = foamAmp * 2.0 * length(n);
    }

    // --- warp: the beam bends toward the hand, most at the mouth
    p.xy += uWarp * uWarpW * mix(0.3, 1.0, age);
    // the mouth (the pen's z = 200) is the mesh origin
    p.z -= 200.0;

    // --- colour from the pen's speed/stability logic
    float tang = 125.0 * uStab * rateStep * 0.125;
    float speed = uSpeedZ * sv + tang + foamSpeed;
    float sm = clamp(speed * 0.005, 0.0, 1.0);
    vec3 colStable = mix(uStableA, uStableB, sm);
    vec3 colUnstable = mix(uUnstableA, uUnstableB, sm);
    float st = clamp(uStab + (aSeed.w - 0.5) * 0.2, 0.0, 1.0);
    vColor = mix(colUnstable, colStable, st) * (1.0 + speed * 0.005) * uBright;

    float fog = smoothstep(2000.0, 0.0, abs(p.z + 200.0));
    vAlpha = 0.2 + fog * 0.8;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float px = uSize * 400.0 * (1.0 + speed * 0.02) / max(-mv.z, 1.0);
    gl_PointSize = min(px, 64.0 * uCap); // cap fill cost as particles pass the eye
    gl_Position = projectionMatrix * mv;
  }
`;
const THROAT_FRAG = /* glsl */ `
  uniform float uAlpha;
  in vec3 vColor;
  in float vAlpha;
  out vec4 fragColor;
  void main() {
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard;
    float glow = pow(1.0 / (r * 8.0 + 0.1), 1.2); // the pen's glow sprite
    // the pen ran this under Reinhard tone mapping; without it the additive
    // sum of a few hundred thousand sprites whites out, so each sprite is
    // held lower and the alpha is capped at one, the colour survives
    float a = min(vAlpha * glow * 0.8 * uAlpha, 1.0);
    fragColor = vec4(vColor * 0.55 * a, 1.0);
  }
`;
// the faint additive wireframe tunnel (the pen's 48 × 40 open cylinder,
// opacity ~0.1, FogExp2 0.0008), bent toward the hand like the beam
const THROAT_LINE_VERT = /* glsl */ `
  uniform vec2 uWarp;
  uniform float uWarpW, uInvS, uOpen, uWarm;
  out float vFog;
  void main() {
    if (uWarm > 0.5) { vFog = 0.0; gl_Position = vec4(position.xy * 0.002 - 0.998, 0.0, 1.0); return; }
    vec3 p = position;
    float age = (p.z + 200.0 + ${TH_LENGTH.toFixed(1)}) / ${TH_LAP.toFixed(1)};
    p.xy *= 1.0 + uOpen * (1.5 + 2.0 * age);
    p.xy += uWarp * uWarpW * mix(0.3, 1.0, age);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float d = length(mv.xyz) * uInvS * 0.0008; // FogExp2 density, in the pen's units
    vFog = exp(-d * d);
    gl_Position = projectionMatrix * mv;
  }
`;
const THROAT_LINE_FRAG = /* glsl */ `
  uniform vec3 uTint;
  uniform float uOpacity;
  in float vFog;
  out vec4 fragColor;
  void main() { fragColor = vec4(uTint * uOpacity * vFog, 1.0); }
`;

// ---------------------------------------------- wormhole end: the tube
// fuad's tube and mirror sphere, ray-traced on one quad in the pen's units
// (the tube axis +y is the flight axis, the eye flying up it); both pole caps
// are open, so from outside the mouth is a disc showing the interior and the
// far cap shows the field beyond. Premultiplied: the wall covers, the
// openings and misses are transparent.
const TUBE_VERT = /* glsl */ `
  uniform float uWarm;
  out vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = uWarm > 0.5 ? vec4(position.xy * 0.002 - 0.998, 0.0, 1.0) : vec4(position.xy, 0.0, 1.0);
  }
`;
const TUBE_FRAG = /* glsl */ `
  #define OCT TUBE_OCT
  uniform vec2 uRes;
  uniform vec3 uEye;
  uniform float uPhase, uRadius, uGrow, uMorph, uEmis, uGain, uIntensity, uAlpha, uRoll, uTanHalf;
  uniform vec3 uWarm3, uCool, uWhite;
  in vec2 vUv;
  out vec4 fragColor;

  const float PI = 3.14159265;
  const float TAU = 6.28318531;
  const float LEN = ${TUBE_LEN.toFixed(1)};
  const float SPH_Y = ${TUBE_SPH_Y.toFixed(1)};

  vec2 h22(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }
  // two value-noise channels for the price of one lattice walk
  vec2 vnoise2(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h22(i), h22(i + vec2(1.0, 0.0)), f.x),
               mix(h22(i + vec2(0.0, 1.0)), h22(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  vec2 fbm2(vec2 p) {
    vec2 n = vec2(0.0);
    float a = 0.5, w = 0.0;
    for (int i = 0; i < OCT; i++) {
      n += a * vnoise2(p);
      w += a;
      p = p * 2.03 + vec2(5.3, 1.7);
      a *= 0.5;
    }
    return n / w;
  }
  // MirroredRepeatWrapping: the pen's photo tiles back and forth
  vec2 mirrorRep(vec2 uv) { return abs(fract(uv * 0.5) * 2.0 - 1.0); }
  // The procedural photo: one tile in [0,1]^2, a luminance channel and a
  // warmth channel from the same fbm, tinted cool -> warm from the palette.
  // .a is the warmth channel raw, the pen's o.b displacement.
  vec4 photo(vec2 uv) {
    vec2 n = fbm2(mirrorRep(uv) * 3.0 + 11.0);
    float lum = smoothstep(0.22, 0.78, n.x);
    float warmth = smoothstep(0.3, 0.7, n.y);
    return vec4(mix(uCool, uWarm3, warmth) * lum, n.y);
  }
  // The pen's three scrolling layers on the sphere UV of hit point h.
  // SphereGeometry's u runs around y (atan(z, -x)), v from the bottom pole
  // (0) to the top (1); uv = vUv · (2, 10) + 0.5 as the pen.
  vec3 tubeColor(vec3 h) {
    float u = atan(h.z, -h.x) / TAU + 0.5;
    float v = 1.0 - acos(clamp(h.y / (LEN * uGrow), -1.0, 1.0)) / PI;
    vec2 uv = vec2(u, v) * vec2(2.0, 10.0) + 0.5;
    float t = uPhase;
    vec4 o = photo(uv);
    // sway morph: layer weights and flow tightness about the pen's
    // 0.3 / 0.1 / 0.6 rest. The tightness scales v only, the tile mirrors
    // with period 2 in uv.x and the seam around the tube is seamless only
    // while the u scale stays integer
    float mp = max(uMorph, 0.0), mn = max(-uMorph, 0.0);
    float wWater = 0.3 + 0.35 * mp;
    float wCyc = 0.1 + 0.2 * mn;
    float wClose = 1.0 - wWater - wCyc;
    vec3 nu = wWater * photo(uv * vec2(2.0, 2.0 + 2.0 * mp) + vec2(0.0, t + o.a * (1.0 + 1.5 * mp))).rgb // water
            + wCyc * photo(uv * vec2(1.0, 1.0 - 0.5 * mn) + vec2(t)).rgb                                  // cyclone
            + wClose * (photo(uv + vec2(0.0, t)).rgb + 0.5);                                               // closest
    return pow(nu + 0.1, vec3(4.0)) * uGain;
  }
  // far root of the ray against the ellipsoid (R, LEN, R), the inside of
  // the tube, or -1 where the ray misses it (the eye outside, looking past
  // the mouth)
  float tubeHit(vec3 ro, vec3 rd) {
    vec3 s = vec3(1.0 / (uRadius * uGrow), 1.0 / (LEN * uGrow), 1.0 / (uRadius * uGrow));
    vec3 p = ro * s, d = rd * s;
    float a = dot(d, d), b = dot(p, d), c = dot(p, p) - 1.0;
    float h = b * b - a * c;
    if (h < 0.0) return -1.0;
    return (-b + sqrt(h)) / a;
  }
  // the open pole caps: nothing past 0.9 of the semi-axis (where the wall
  // has closed to 1.74, still clear of the eye's offset)
  float capOpen(vec3 h) { return 1.0 - smoothstep(0.88, 0.92, abs(h.y) / (LEN * uGrow)); }

  void main() {
    vec2 sc = (vUv - 0.5) * 2.0;
    sc.x *= uRes.x / uRes.y;
    // the flight's camera: forward is the tube's +y, right +x, up +z; the
    // bank's roll turns the quad with the field
    float cr = cos(uRoll), sr = sin(uRoll);
    sc = vec2(sc.x * cr - sc.y * sr, sc.x * sr + sc.y * cr);
    vec3 rd = normalize(vec3(sc.x * uTanHalf, 1.0, sc.y * uTanHalf));
    vec3 ro = uEye;

    float tT = tubeHit(ro, rd);
    if (tT <= 0.0) { fragColor = vec4(0.0); return; }
    vec3 col;
    float a;
    // the mirror sphere, radius uGrow at (0, SPH_Y·uGrow, 0): near root
    vec3 sc0 = vec3(0.0, SPH_Y * uGrow, 0.0);
    vec3 oc = ro - sc0;
    float b = dot(oc, rd), c = dot(oc, oc) - uGrow * uGrow;
    float disc = b * b - c;
    if (disc > 0.0 && -b - sqrt(disc) > 0.0) {
      float s = -b - sqrt(disc);
      vec3 hp = ro + rd * s;
      vec3 n = (hp - sc0) / uGrow; // the point is the normal
      // the reflection: the tube along the reflected ray, the CubeCamera
      vec3 rr = reflect(rd, n);
      float tR = tubeHit(hp, rr);
      vec3 env = tR > 0.0 ? tubeColor(hp + rr * tR) : vec3(0.0);
      // the pen's second photo as the sphere's map: with metalness 1 it is
      // the F0 tint of the reflection (a second tile region, static)
      vec2 suv = vec2(atan(n.z, -n.x) / TAU + 0.5, 1.0 - acos(clamp(n.y, -1.0, 1.0)) / PI);
      vec3 F0 = 0.3 + 0.7 * photo(suv * vec2(2.0, 1.0) + 37.0).rgb;
      float ndv = clamp(dot(n, -rd), 0.0, 1.0);
      float fres = pow(1.0 - ndv, 5.0);
      vec3 F = F0 + (1.0 - F0) * fres;
      col = env * F
          + uWhite * uEmis                       // the pen's emissive, beat-pulsed
          + uWhite * pow(1.0 - ndv, 3.0) * 0.25; // fresnel rim
      a = 1.0;
    } else {
      vec3 h = ro + rd * tT;
      col = tubeColor(h);
      a = capOpen(h);
    }
    a *= uAlpha;
    fragColor = vec4(col * uIntensity * a, a);
  }
`;

export function createScene(ctx) {
  const { THREE, quality } = ctx;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, ctx.width / Math.max(1, ctx.height), 0.5, 4000);
  camera.position.set(0, 0, 0);
  const tier = quality.tier;
  // one population serves both the big bang and the star field, so the count
  // is the pen's 20,000 at the top tier and a budget fraction below it
  // One population serves both the big bang and the star field. The pen's
  // 20,000 particles are the high tier; the middle sits where the jump's
  // streak overdraw (the scene's real cost centre) stays where it was.
  const STARS = tier === 'low' ? 5000 : tier === 'high' ? 20000 : 10000;
  const NEB_STEPS = tier === 'low' ? 28 : tier === 'high' ? 56 : 40;
  // the sky is a fullscreen noise field, so its octave count is the scene's
  // single biggest fill-rate lever; it is only on screen during the hole,
  // the wormhole and the young universe
  const SKY_OCT = tier === 'low' ? 2 : tier === 'high' ? 4 : 3;
  const WORLD_OCT = tier === 'low' ? 3 : tier === 'high' ? 5 : 4;
  const JUNK_N = tier === 'low' ? 10 : tier === 'high' ? 26 : 18;
  const CLUSTERS = 14; // how many knots the young universe gathers into
  const fovK = 1 / (2 * Math.tan((FOV * Math.PI) / 360));
  // the elements' own budgets, per the scenes they came from
  const STREAK_K = tier === 'low' ? 5 : tier === 'high' ? 12 : 8; // the warp's samples along the aberration path
  const TILES = tier === 'low' ? 600 : tier === 'high' ? 1900 : 1100; // the pen's 400 / 800 / 1400 over 85 units, on a 300-unit corridor
  const THROAT_N = tier === 'low' ? 120000 : tier === 'high' ? 600000 : 300000;
  const TUBE_OCT = tier === 'low' ? 3 : tier === 'high' ? 5 : 4;

  const pal = () => Array.from({ length: 5 }, () => ({ value: new THREE.Color(1, 1, 1) }));
  const [sp0, sp1, sp2] = pal();
  const [op0, op1, op2, op3, op4] = pal();
  const [vp0, vp1, vp2, vp3, vp4] = pal();

  // --- stars: one instanced mesh of streak capsules, and the big bang's
  // particle system, the same instances, so the handover is a lerp
  const starGeo = new THREE.InstancedBufferGeometry();
  const quadPos = new Float32Array([-1, 0, 0, 1, 0, 0, -1, 1, 0, 1, 1, 0]);
  const quadUV = new Float32Array([-1, 0, 1, 0, -1, 1, 1, 1]);
  starGeo.setAttribute('position', new THREE.BufferAttribute(quadPos, 3));
  starGeo.setAttribute('aQuad', new THREE.BufferAttribute(quadUV, 2));
  starGeo.setIndex([0, 1, 2, 2, 1, 3]);
  const starPos = new Float32Array(STARS * 3);
  const starInfo = new Float32Array(STARS * 3);
  const starBang = new Float32Array(STARS * 4);
  for (let i = 0; i < STARS; i++) {
    starPos[i * 3] = (Math.random() * 2 - 1) * BOX_W;
    starPos[i * 3 + 1] = (Math.random() * 2 - 1) * BOX_H;
    starPos[i * 3 + 2] = Math.random() * BOX_DEPTH;
    starInfo[i * 3] = Math.pow(Math.random(), 5) * 1.4 + 0.05;
    starInfo[i * 3 + 1] = Math.random();
    starInfo[i * 3 + 2] = Math.random();
    // the pen's launch: a uniform direction on the sphere and a speed in
    // [0.5, 1.0], theta uniform, phi = acos(2u − 1)
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const speed = Math.random() * 0.5 + 0.5;
    starBang[i * 4] = speed * Math.sin(phi) * Math.cos(theta);
    starBang[i * 4 + 1] = speed * Math.sin(phi) * Math.sin(theta);
    starBang[i * 4 + 2] = speed * Math.cos(phi);
    starBang[i * 4 + 3] = Math.random(); // handover stagger, and the cluster it joins
  }
  starGeo.setAttribute('aStar', new THREE.InstancedBufferAttribute(starPos, 3));
  starGeo.setAttribute('aInfo', new THREE.InstancedBufferAttribute(starInfo, 3));
  starGeo.setAttribute('aBang', new THREE.InstancedBufferAttribute(starBang, 4));
  starGeo.instanceCount = STARS;
  const starU = {
    uTravel: { value: 0 },
    uSide: { value: 0 },
    uDepth: { value: BOX_DEPTH },
    uHalfW: { value: BOX_W },
    uHalfH: { value: BOX_H },
    uNear: { value: BOX_NEAR },
    uAspect: { value: ctx.width / Math.max(1, ctx.height) },
    uTime: { value: 0 },
    uTwinkle: { value: 0 },
    uBreath: { value: 1 },
    uOrder: { value: 0 },
    uTail: { value: 1 },
    uGain: { value: 0 },
    uFovK: { value: fovK },
    uFade: { value: 1 },
    uBang: { value: 1 }, // 1 = every particle sits in its bang slot (the cold open)
    uBangR: { value: 0 },
    uBangTail: { value: 0 },
    uBangGain: { value: 0 },
    uBangHeat: { value: 1 },
    uCluster: { value: 0 },
    uOrigin: { value: new THREE.Vector3(0, 0, BANG_Z) },
    uRes: { value: new THREE.Vector2(ctx.width, ctx.height) },
    uHole: { value: new THREE.Vector2(0, 0) },
    uWorm: { value: new THREE.Vector3(0, 0, 0) },
    uAber: { value: 0 },
    uPal0: sp0, uPal1: sp1, uPal2: sp2,
    uIntensity: { value: 1 },
  };
  const starMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: starU,
    defines: { CLUSTERS },
    vertexShader: STAR_VERT,
    fragmentShader: STAR_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const stars = new THREE.Mesh(starGeo, starMat);
  stars.frustumCulled = false;
  stars.renderOrder = 1; // below the object: a solid body occludes the field behind it
  scene.add(stars);

  // --- celestial object: one camera-facing quad, analytic bodies
  const objU = {
    uObjPos: { value: new THREE.Vector3(0, 0, -OBJ_SPAWN_Z) },
    uExtent: { value: 1 },
    uAspect: { value: ctx.width / Math.max(1, ctx.height) },
    uHole: { value: new THREE.Vector2(0, 0) },
    uWorm: { value: new THREE.Vector3(0, 0, 0) },
    uWarm: { value: 1 },
    uShape: { value: 0 },
    uScale: { value: 1 },
    uAlpha: { value: 0 },
    uPulse: { value: 0 },
    uLevel: { value: 0 },
    uWindow: { value: 1 },
    uTime: { value: 0 },
    uSeed: { value: 0.37 },
    uSway: { value: 0 },
    uAber: { value: 0 },
    uIntensity: { value: 1 },
    uPal0: op0, uPal1: op1, uPal2: op2, uPal3: op3, uPal4: op4,
  };
  const objMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: objU,
    defines: { NEB_STEPS, WORLD_OCT, JUNK_N, WORLD_NORM: (1 / (1 - Math.pow(0.5, WORLD_OCT))).toFixed(6) },
    vertexShader: OBJ_VERT,
    fragmentShader: OBJ_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
  });
  const objGeo = new THREE.PlaneGeometry(2, 2);
  const obj = new THREE.Mesh(objGeo, objMat);
  obj.frustumCulled = false;
  obj.renderOrder = 2;
  // Visible at creation ON PURPOSE: the engine warms a scene with
  // renderer.compileAsync, which walks the scene with traverseVisible, so a
  // mesh hidden here never has its program linked and the first body to
  // arrive links it inside a live frame instead, an 80 ms hitch at 1080p,
  // five dropped frames on the jump's exit flash. The first update() hides it
  // again (uAlpha is 0 until then, so nothing shows either way).
  obj.visible = true;
  scene.add(obj);

  // --- overlay: singularity, black hole, throat rim, glow, flash, veil
  const overU = {
    uRes: { value: new THREE.Vector2(ctx.width, ctx.height) },
    uTime: { value: 0 },
    uWarp: { value: 0 },
    uFlash: { value: 0 },
    uVeil: { value: 0 },
    uSing: { value: 0 },
    uIntensity: { value: 1 },
    uRoll: { value: 0 },
    uHole: { value: new THREE.Vector2(0, 0) },
    uMouth: { value: new THREE.Vector3(0, 0, 0) },
    uPal0: vp0, uPal1: vp1, uPal2: vp2, uPal3: vp3, uPal4: vp4,
  };
  const overMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: overU,
    vertexShader: OVER_VERT,
    fragmentShader: OVER_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
  });
  const overGeo = new THREE.PlaneGeometry(2, 2);
  const overlay = new THREE.Mesh(overGeo, overMat);
  overlay.frustumCulled = false;
  overlay.renderOrder = 10;
  scene.add(overlay);

  // --- sky: the panorama behind the hole, the nebula behind the bang, and
  // the wormhole's throat (drawn first)
  const [kp0, kp1, kp2, kp3, kp4] = pal();
  const skyU = {
    uRes: { value: new THREE.Vector2(ctx.width, ctx.height) },
    uTime: { value: 0 },
    uSky: { value: 0 },
    uWarm: { value: 1 },
    uIntensity: { value: 1 },
    uRoll: { value: 0 },
    uYaw: { value: 0 },
    uMode: { value: 0 },
    uSeedA: { value: 0 },
    uSeedB: { value: 11.3 },
    uFlow: { value: 0 },
    uNebula: { value: 0 },
    uPanA: { value: 1 },
    uAber: { value: 0 },
    uStreakK: { value: STREAK_K },
    uHole: { value: new THREE.Vector2(0, 0) },
    uMouthLens: { value: new THREE.Vector2(0, 0) },
    uThroat: { value: new THREE.Vector4(0.05, 0, 0, 1) },
    uPal0: kp0, uPal1: kp1, uPal2: kp2, uPal3: kp3, uPal4: kp4,
  };
  const skyMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: skyU,
    defines: { SKY_OCT },
    vertexShader: SKY_VERT,
    fragmentShader: SKY_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
  });
  const skyGeo = new THREE.PlaneGeometry(2, 2);
  const sky = new THREE.Mesh(skyGeo, skyMat);
  sky.frustumCulled = false;
  sky.renderOrder = 0;
  sky.visible = true; // linked at warm time, hidden by the first update, as above
  scene.add(sky);

  // --- tunnel end: the corridor tiles, one InstancedMesh. Per instance: lane
  // x (pen units), row, depth along the corridor (pen units, 0 at the mouth)
  // and palette slot, the pen's density, laid once.
  const tileGeo = new THREE.PlaneGeometry(1, 1);
  tileGeo.rotateX(-Math.PI * 0.5);
  const tileInst = new Float32Array(TILES * 4);
  for (let i = 0; i < TILES; i++) {
    tileInst[i * 4] = Math.round(Math.random() * (CORR_LANES - 1)) + CORR_LANE_OFFSET;
    tileInst[i * 4 + 1] = Math.round(Math.random());
    tileInst[i * 4 + 2] = Math.random() * (CORR_LEN / CORR_S);
    tileInst[i * 4 + 3] = Math.floor(Math.random() * 5);
  }
  tileGeo.setAttribute('aInst', new THREE.InstancedBufferAttribute(tileInst, 4));
  const tilePal = new Float32Array(15); // the five palette entries, copied per frame
  const tileU = {
    uMouthZ: { value: -ELEM_SPAWN_Z[EL_CORRIDOR] },
    uEndZ: { value: -ELEM_SPAWN_Z[EL_CORRIDOR] - CORR_LEN },
    uScale: { value: CORR_S * GROW_FLOOR },
    uPitch: { value: 1 },
    uGap: { value: CORR_GAP },
    uComp: { value: 1 },
    uBeat: { value: 0 },
    uIntensity: { value: 1 },
    uAlpha: { value: 0 },
    uWarm: { value: 1 },
    uEye: { value: new THREE.Vector2(0, CORR_GAP * 0.5) },
    uFogD: { value: CORR_FOG_D / CORR_S },
    uFogCol: { value: new THREE.Color(0, 0, 0) },
    uPal: { value: tilePal },
  };
  const tileMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: tileU,
    vertexShader: TILE_VERT,
    fragmentShader: TILE_FRAG,
    side: THREE.DoubleSide,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const tiles = new THREE.InstancedMesh(tileGeo, tileMat, TILES);
  tiles.frustumCulled = false; // positions live in the shader
  const identity = new THREE.Matrix4();
  for (let i = 0; i < TILES; i++) tiles.setMatrixAt(i, identity); // the shader ignores it
  tiles.instanceMatrix.needsUpdate = true;
  tiles.renderOrder = 3;
  tiles.visible = true; // linked at warm time, hidden by the first update, as above
  scene.add(tiles);

  // --- wormhole pt 1: the throat, seeds only; the shader does all the
  // motion. position = (z0 lap fraction, angle fraction, ring radius
  // fraction), aSeed = (swirl rate, speed step, foam jitter, colour jitter).
  const throatGeo = new THREE.BufferGeometry();
  const thPos = new Float32Array(THROAT_N * 3);
  const thSeed = new Float32Array(THROAT_N * 4);
  for (let i = 0; i < THROAT_N; i++) {
    thPos[i * 3] = Math.random();
    thPos[i * 3 + 1] = Math.random();
    thPos[i * 3 + 2] = Math.random();
    thSeed[i * 4] = Math.random();
    thSeed[i * 4 + 1] = Math.random();
    thSeed[i * 4 + 2] = Math.random();
    thSeed[i * 4 + 3] = Math.random();
  }
  throatGeo.setAttribute('position', new THREE.BufferAttribute(thPos, 3));
  throatGeo.setAttribute('aSeed', new THREE.BufferAttribute(thSeed, 4));
  const thU = {
    uTime: { value: 0 },
    uTravel: { value: 0 }, // integrated forward distance, wrapped at TH_TRAVEL_WRAP
    uSwirl: { value: 0 }, // integrated swirl phase (∫stability dt), wrapped at TH_SWIRL_WRAP
    uStab: { value: 0 }, // effective stability 0..1 (sway/press, knocked down by a shock)
    uShock: { value: 0 }, // zeta shock burst 0..1, strike-fired, decaying
    uSpeedZ: { value: 36 }, // current forward speed, for colour and point size
    uWarp: { value: new THREE.Vector2(0, 0) }, // hand target in tunnel xy (±800)
    uWarpW: { value: 0 }, // pull weight toward it
    uBright: { value: 0 }, // intensity × beat pulse × the element's alpha
    uSize: { value: (ctx.height / 1080) * TH_S }, // resolution-stable point scale, in the flight's units
    uCap: { value: ctx.height / 1080 },
    uOpen: { value: 0 }, // the exit: the wall blooms open
    uWarm: { value: 1 },
    // fewer particles than the pen's million -> each one a little brighter
    uAlpha: { value: Math.min(1.8, Math.sqrt(1048576 / THROAT_N)) },
    uStableA: { value: new THREE.Color(0, 0.6, 0.9) },
    uStableB: { value: new THREE.Color(0.6, 0.9, 1) },
    uUnstableA: { value: new THREE.Color(0.9, 0.1, 0) },
    uUnstableB: { value: new THREE.Color(1, 0.7, 0.1) },
  };
  const throatMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: thU,
    vertexShader: THROAT_VERT,
    fragmentShader: THROAT_FRAG,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });
  const throat = new THREE.Points(throatGeo, throatMat);
  throat.frustumCulled = false; // real positions live in the shader
  throat.renderOrder = 3;
  throat.visible = true; // as above
  scene.add(throat);
  const thCylGeo = new THREE.CylinderGeometry(TH_RADIUS, TH_RADIUS, TH_LENGTH, 48, 40, true);
  thCylGeo.rotateX(-Math.PI / 2);
  thCylGeo.translate(0, 0, -TH_LENGTH / 2 - 200); // the mouth (the pen's z = 200) at the origin
  const thWireGeo = new THREE.WireframeGeometry(thCylGeo);
  thCylGeo.dispose(); // WireframeGeometry copied what it needs
  const thLineU = {
    uWarp: thU.uWarp,
    uWarpW: thU.uWarpW,
    uOpen: thU.uOpen,
    uWarm: thU.uWarm,
    uInvS: { value: 1 / TH_S },
    uTint: { value: new THREE.Color(0, 1, 1) },
    uOpacity: { value: 0 },
  };
  const thLineMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: thLineU,
    vertexShader: THROAT_LINE_VERT,
    fragmentShader: THROAT_LINE_FRAG,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });
  const throatLines = new THREE.LineSegments(thWireGeo, thLineMat);
  throatLines.frustumCulled = false;
  throatLines.renderOrder = 3;
  throatLines.visible = true; // as above
  scene.add(throatLines);

  // --- wormhole end: the tube quad
  const tubeU = {
    uRes: { value: new THREE.Vector2(ctx.width, ctx.height) },
    uEye: { value: new THREE.Vector3(-0.5, -TUBE_LEN - 60, 0.5) },
    uPhase: { value: 0 }, // scroll phase, in the pen's t units
    uRadius: { value: TUBE_R },
    uGrow: { value: GROW_FLOOR },
    uMorph: { value: 0 }, // sway about centre, −1..1
    uEmis: { value: 0.12 }, // the sphere's emissive, beat-pulsed
    uGain: { value: 0.85 },
    uIntensity: { value: 1 },
    uAlpha: { value: 0 },
    uRoll: { value: 0 },
    uTanHalf: { value: TAN_HALF },
    uWarm: { value: 1 },
    uWarm3: { value: new THREE.Color(1, 0.8, 0.6) },
    uCool: { value: new THREE.Color(0.3, 0.5, 0.9) },
    uWhite: { value: new THREE.Color(1, 1, 1) },
  };
  const tubeMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: tubeU,
    defines: { TUBE_OCT },
    vertexShader: TUBE_VERT,
    fragmentShader: TUBE_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
  });
  const tubeGeo = new THREE.PlaneGeometry(2, 2);
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  tube.frustumCulled = false;
  tube.renderOrder = 4;
  tube.visible = true; // as above
  scene.add(tube);

  // Live bloom: nothing at rest (no effects with nothing applied) and the
  // pen's own numbers (strength 2, radius 0.5, threshold 0) while the bang,
  // a flash or the throat needs them; each element brings its own numbers.
  const bloom = { strength: 0, radius: 0.5, threshold: 0 };

  // --- state
  const approach = (v, to, tau, dt) => v + (to - v) * (1 - Math.exp(-dt / tau));
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const clampTo = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  const smooth = (a, b, x) => { const u = clamp01((x - a) / (b - a)); return u * u * (3 - 2 * u); };
  const ease = (u) => u * u * (3 - 2 * u);

  const DARK = 0, BANG = 1, FLIGHT = 2;
  let phase = DARK;
  let warmFrames = 2; // see the note at the end of update()
  let firstFrame = true, playPrev = false, tpPrev = 0;
  let bangT = -1, singA = 0, flowT = 0;

  let travel = 0, side = 0, speed = 0, kick = 0;
  let warpS = 0, flash = 0, orderS = 0, breath = 1, fadeS = 1, scaleS = 1;
  let objGrowT = -1; // seconds since the current body was spawned; drives its growth from nothing
  let objGrow = 1; // the body's growth fraction, monotonic from 0 at its spawn to 1
  let objDecel = false; // the body's growth is gated by the deceleration (it arrived at the end of a jump)
  let jumping = false, jumpT = -1, autoWarp = 0;
  // the jump's deceleration: armed while the streaks are still at the jump's
  // length, cleared when the arrival is spawned; the peak streak of this
  // jump and the normalised streak length s that gates every arrival's growth
  let jumpArmed = false, warpPrev = 0, tailPeak = 0, streakS = 0;
  const TAIL_REST = CRUISE * 0.05; // the cruise tail
  let objActive = false, objShape = -1, objZ = -OBJ_SPAWN_Z, objX = 0, objY = 0, objAlpha = 0, objTarget = 0, objBase = 1, objSpawnDist = OBJ_SPAWN_Z;
  // the four elements: one at a time
  let elemKind = EL_NONE, elemStage = 0, elemT = 0, elemZ = 0, elemEndZ = 0, elemExitT = -1;
  let elemGrowT = -1, elemGrow = 0, elemDecel = false, elemA = 0, elemSpeedMul = 1, elemQueued = EL_NONE;
  let nextArrival = EL_NONE;
  // tunnel end
  let corrSway = 0, corrPress = 0, corrEyeX = 0, corrEyeY = CORR_GAP * 0.5, corrIn = 0;
  // wormhole pt 1
  let thStab = 0, thShock = 0, thTravel = 0, thSwirl = 0, thOpen = 0, strikePrev = 0;
  const thWarpTarget = new THREE.Vector2();
  const thOrder = [0, 1, 2, 3, 4]; // palette indices sorted cool -> warm, in place
  const thWarmth = [0, 0, 0, 0, 0];
  const white = new THREE.Color(1, 1, 1);
  // wormhole end
  let tubePhase = 0, tubeTravel = 1, tubeKick = 0, tubeEyeX = -1, tubeNudge = 0, tubeRadius = TUBE_R, tubeMorph = 0, tubeA = 0, tubePassed = false;
  // relativistic warp
  let relT = 0, relS = 0, relMul = 1, aber = 0, relSpawned = false;
  let seq = 0.618;
  let bankT = -1, bankSide = 0, roll = 0, yaw = 0, rollT = 0, yawT = 0;
  let holeT = -1, voidDone = false;
  let wormT = -1, wormDone = false, wormSwapped = false, wormSpeed = 1;
  // the mouth's lens on the star field (radius, pull, fade) smoothed, so no
  // stage of the transit can hand the field back in a single frame
  let mouthRS = 0, mouthPullS = 0, mouthFadeS = 0;
  let mass = 0, held = 0, veil = 0, skyA = 0;
  let seedA = 0, seedB = 11.3;
  let pulse = 0, beatPrev = 0;
  let aspect = ctx.width / Math.max(1, ctx.height);
  const padPrev = new Float32Array(PADS);

  // assignable parameters. Each placement parameter keeps the scene's own
  // random placement until the performer first moves it, so a project that
  // assigns nothing behaves exactly as it did before, and x and y hold that
  // separately, so binding one axis does not pin the other to the centre line.
  let scaleUser = 1, pendX = 0, pendY = 0, pendDist = OBJ_SPAWN_Z, nextShape = -1;
  let xSet = false, ySet = false, distSet = false;
  let paramWarp = 0, paramOrder = 0;

  function reseed() {
    seq = (seq * 9.731 + 0.317) % 1;
    travel += 1100 + seq * 800;
    side += 240 + seq * 200;
  }

  // A body arrives ahead. `shape` forces one (the warp's G star), `dist`
  // forces the distance, `decel` gates its growth on the deceleration of the
  // jump it arrives out of (the arrival rule), a body spawned in cruise
  // takes the plain 1.6 s ease.
  function spawnObject(shape = -1, dist = 0, decel = false) {
    seq = (seq * 9.731 + 0.317) % 1;
    if (shape < 0) {
      if (nextShape >= 0) shape = nextShape;
      else {
        shape = Math.floor(seq * SHAPES);
        if (shape === objShape) shape = (shape + 1) % SHAPES;
      }
    }
    objShape = shape;
    const s2 = (seq * 7.13 + 0.51) % 1;
    const s3 = (seq * 3.77 + 0.23) % 1;
    if (!(dist > 0)) dist = distSet ? pendDist : OBJ_SPAWN_Z;
    objSpawnDist = dist;
    objZ = -dist;
    // the placement parameters are fractions of the half-frame at the spawn
    // distance, so ±1 is the frame edge whatever the distance is; an axis
    // nobody has assigned keeps its own scatter
    objX = xSet ? pendX * TAN_HALF * aspect * dist * 0.8 : (s2 - 0.5) * 0.34 * dist;
    objY = ySet ? pendY * TAN_HALF * dist * 0.8 : (s3 - 0.5) * 0.18 * dist;
    objBase = OBJ_SCALE[shape];
    objU.uSeed.value = (seq * 100) % 10;
    objU.uShape.value = shape;
    objActive = true;
    objAlpha = 0;
    objTarget = 1;
    objGrowT = 0;
    objGrow = 0;
    objDecel = decel;
  }

  // The streak length right now, against which a decelerating arrival's
  // growth is measured: the tail, plus the relativistic smear as tail.
  let streakNow = TAIL_REST;
  function markDecel() { tailPeak = Math.max(streakNow, TAIL_REST + 1); }

  // What waits at the end of a jump or a transit: a body, or the element
  // `next arrival` names (an element queued behind a transit wins once).
  function spawnArrival() {
    let kind = elemQueued !== EL_NONE ? elemQueued : nextArrival;
    elemQueued = EL_NONE;
    if (kind !== EL_NONE && elemKind !== EL_NONE) kind = EL_NONE; // one at a time
    if (kind === EL_NONE) spawnObject(-1, 0, true);
    else fireElement(kind, true);
  }

  // The jump starts to wind down: the arrival is spawned NOW, so its growth
  // runs the whole deceleration (the flash comes later, as the streaks die).
  function endJump() {
    if (holeT < 0 && wormT < 0) spawnArrival();
  }

  // The running element's exit comes up early (another event wants the
  // flight): the corridor's far end is brought to 40 units ahead, the throat
  // opens, the tube fades, the warp settles. One still approaching is simply
  // let go.
  function endElementEarly() {
    if (elemKind === EL_NONE || elemStage === 2) return;
    if (elemStage === 0 && elemKind !== EL_WARP) { elemStage = 2; elemExitT = 0; return; }
    if (elemKind === EL_CORRIDOR) elemEndZ = Math.max(elemEndZ, -40);
    else if (elemKind === EL_THROAT) { elemStage = 2; elemExitT = 0; flash = Math.max(flash, 0.7); markDecel(); }
    else if (elemKind === EL_TUBE) { elemStage = 2; elemExitT = 0; flash = Math.max(flash, 0.6); markDecel(); }
    else if (elemKind === EL_WARP) relT = Math.max(relT, REL_RISE + REL_HOLD);
  }

  // An element opens ahead. `decel` gates its growth on the deceleration of
  // the jump it arrives out of; fired from cruise it grows in over 1.6 s.
  function fireElement(kind, decel) {
    if (phase !== FLIGHT) return;
    if (holeT >= 0) return; // the hole runs to its end; nothing opens inside it
    if (wormT >= 0) { elemQueued = kind; return; } // it becomes the transit's arrival
    if (elemKind !== EL_NONE) {
      // the same one again while inside ends it; a different one ends the
      // running one and opens once it has cleared
      endElementEarly();
      if (elemKind !== kind) elemQueued = kind;
      return;
    }
    // a jump in progress ends into the element: the hand's warp is ignored
    // while an element runs, the action's envelope is cut to its fall, and
    // the growth follows the streaks as they shorten
    if (jumping) { jumpArmed = false; if (jumpT >= 0) jumpT = Math.max(jumpT, JUMP_LEN - 0.7); decel = true; }
    objTarget = 0; // whatever was ahead is left behind
    elemKind = kind; elemStage = 0; elemT = 0; elemExitT = -1;
    elemGrowT = 0; elemGrow = 0; elemDecel = decel; elemA = 0; elemSpeedMul = 1;
    // far enough ahead that the approach reads, and, arriving out of a jump,
    // further by the distance the flight still covers while it decelerates,
    // so the eye never reaches a mouth that is still a point
    elemZ = -(ELEM_SPAWN_Z[kind] + (decel ? speed * 1.0 : 0));
    elemEndZ = elemZ - CORR_LEN;
    if (kind === EL_CORRIDOR) { corrIn = 0; }
    else if (kind === EL_THROAT) { thTravel = 0; thOpen = 0; thShock = 0; }
    else if (kind === EL_TUBE) { tubeA = 0; tubeKick = 0; tubePassed = false; }
    else if (kind === EL_WARP) {
      relT = 0; relS = 0; relSpawned = false;
      // the G star stands ahead as the body the flight passes (further by the
      // jump's remaining deceleration, like the elements)
      spawnObject(SHAPE_SUN, REL_SUN_Z + (decel ? speed * 1.0 : 0), decel);
    }
  }

  function clearElement() {
    elemKind = EL_NONE; elemStage = 0; elemA = 0; elemSpeedMul = 1; elemGrowT = -1;
    relS = 0; aber = 0; thOpen = 0; tubeA = 0; corrIn = 0;
    tiles.visible = false; throat.visible = false; throatLines.visible = false; tube.visible = false;
    if (elemQueued !== EL_NONE) { const k = elemQueued; elemQueued = EL_NONE; fireElement(k, false); }
  }

  // The cold open's ignition: the singularity flares and the universe runs.
  // Everything in flight is cleared first, a big bang starts a universe, it
  // does not continue one.
  function fireBang() {
    phase = BANG;
    bangT = 0;
    holeT = -1; wormT = -1; jumpT = -1; autoWarp = 0;
    mass = 0; held = 0; veil = 0; skyA = 0;
    objActive = false; objAlpha = 0; objTarget = 0; obj.visible = false;
    jumping = false; jumpArmed = false; warpS = 0; kick = 0; speed = 0;
    bankT = -1;
    elemQueued = EL_NONE; clearElement();
    flash = 1.3;
    reseed();
  }

  function fireWormhole() {
    if (wormT >= 0) return;
    endElementEarly(); // the transit takes the flight; the element goes out first
    wormT = 0; wormDone = false; wormSwapped = false;
    holeT = -1;
    objTarget = 0; // whatever was ahead is left behind
  }

  function fireHole() {
    if (holeT >= 0) return;
    endElementEarly();
    holeT = 0; voidDone = false; wormT = -1;
  }

  // The hole's ending, on its own: a flash, a re-seeded sky and nothing in it.
  function swallow() {
    flash = Math.max(flash, 1.0);
    holeT = -1; wormT = -1; jumpT = -1; autoWarp = 0;
    mass = 0; held = 0;
    veil = 1;
    jumping = false; jumpArmed = false;
    objActive = false; objTarget = 0; objAlpha = 0;
    speed = CRUISE;
    elemQueued = EL_NONE; clearElement();
    reseed();
  }

  return {
    scene,
    camera,
    bloom,
    update(dt, t, io) {
      // ---- the transport decides whether the universe has started, and the
      // POSITION is the ground truth, not the edge of `playing` on its own: a
      // scene sees the clock only on the frames the engine renders it, so a
      // show stopped and restarted while Will I Dream was off screen leaves
      // `playing` looking unchanged when it comes back. A clock that has
      // jumped BACKWARDS to the top since this scene last looked is a new run
      // of the show whether or not the scene was watching, and gets a new
      // universe; a clock well past the start is a show already underway, and
      // a scene arriving into that opens in the flight.
      const tp = io.transport || null;
      const playing = !!(tp && tp.playing);
      const tpTime = tp ? tp.time || 0 : 0;
      const atTop = tpTime < 0.5;
      // the clock has moved BACKWARDS since this scene last looked: a stop, a
      // scrub back, or a loop seam, whenever it happened, and whether or not
      // the scene was on screen to watch it happen
      const rewound = tpTime < tpPrev - 0.5;
      if (firstFrame) {
        firstFrame = false;
        if (playing && !atTop) { phase = FLIGHT; speed = CRUISE; }
        else if (playing) fireBang(); // created ON the downbeat: it still bangs
      } else if (playing && (!playPrev || rewound)) {
        // STOP then PLAY comes back at 0 and restarts the universe; PAUSE
        // then PLAY keeps its position and simply resumes the flight. A bang
        // already running is left alone, so a short loop cannot keep
        // re-igniting a universe it never lets finish.
        if (phase !== BANG) {
          if (atTop || rewound) fireBang();
          else if (phase === DARK) { phase = FLIGHT; speed = CRUISE; }
        }
      } else if (!playing && (playPrev || rewound)) {
        // a stop (position back at 0) returns the stage to the singularity;
        // a pause leaves the flight running
        if (atTop) { phase = DARK; bangT = -1; objActive = false; objTarget = 0; }
      }
      playPrev = playing;
      tpPrev = tpTime;

      // ---- hand -> warp: speed on X, density on closeness, product = amount.
      // The `hyperspace jump` action and the `warp amount` parameter feed the
      // same number, so an assignment adds to the hand instead of fighting it.
      const sx = smooth(0.30, 1.0, io.xy.x);
      const sy = 1 - smooth(0.0, 0.70, io.xy.y);
      if (jumpT >= 0) {
        jumpT += dt;
        const fall = JUMP_LEN - 0.7;
        autoWarp = jumpT < 0.4 ? ease(jumpT / 0.4) : jumpT < fall ? 1 : 1 - ease((jumpT - fall) / 0.7);
        if (jumpT > JUMP_LEN) { jumpT = -1; autoWarp = 0; }
      }
      // (no warp while an element has the flight: one fired during a jump
      // ends the jump into the element, and nothing re-engages it inside)
      const elemHolds = elemKind !== EL_NONE;
      const handWarp = phase === FLIGHT && !elemHolds ? sx * sy : 0;
      const warpRaw = elemHolds ? 0 : Math.max(handWarp, autoWarp, paramWarp);
      warpS = approach(warpS, warpRaw, warpRaw > warpS ? 0.22 : 0.45, dt);
      if (phase === FLIGHT && wormT < 0) {
        if (!jumping && warpS > 0.55 && !elemHolds) { jumping = true; jumpArmed = true; tailPeak = 0; }
        else if (jumping) {
          // re-engaged after the wind-down began: the arrival that was
          // spawned is dismissed again (below) and a new one will come
          if (warpS > 0.55) jumpArmed = true;
          // the wind-down begins: warpS falling back through 0.5. The arrival
          // is spawned HERE, so its growth runs the whole deceleration
          if (jumpArmed && warpS < 0.5 && warpS < warpPrev) { jumpArmed = false; endJump(); }
          if (warpS < 0.25) {
            jumping = false;
            flash = Math.max(flash, 0.8);
            if (jumpArmed) { jumpArmed = false; endJump(); }
          }
        }
      }
      warpPrev = warpS;
      orderS = approach(orderS, Math.max(clamp01(io.gestures.sway), paramOrder), 0.6, dt);

      // ---- pads: the no-assignment fallback. While the stage is dark ANY
      // pad ignites the universe, so a project with no timeline is never
      // stuck looking at nothing.
      for (let i = 0; i < PADS; i++) {
        const v = io.pads[i];
        if (v > padPrev[i] + 0.3) {
          if (phase === DARK) fireBang();
          else if (i === PAD_BLACKHOLE) fireHole();
          else if (i === PAD_BANK_LEFT) { bankT = 0; bankSide = -1; }
          else if (i === PAD_BANK_RIGHT) { bankT = 0; bankSide = 1; }
          else kick = Math.max(kick, 0.6 + v * 0.4);
        }
        padPrev[i] = v;
      }
      // the first beat the analyser hears ignites a dark stage too (the
      // Auto-VJ pools run no transport and strike no pad)
      if (phase === DARK && io.beat > 0.6 && io.level > 0.12) fireBang();
      if (io.beat > beatPrev + 0.3) pulse = 1;
      beatPrev = io.beat;
      pulse = Math.max(0, pulse - dt * 3.2);

      // ---- bank: the one rotation, roll and yaw in, level out
      rollT = 0; yawT = 0;
      if (bankT >= 0) {
        bankT += dt;
        const u = bankT / BANK_LEN;
        if (u >= 1) bankT = -1;
        else {
          const s = Math.sin(Math.PI * u);
          rollT = -bankSide * 0.5 * s;
          yawT = -bankSide * 0.16 * s;
          side += -bankSide * 55 * s * dt;
        }
      }
      roll = approach(roll, rollT, 0.12, dt);
      yaw = approach(yaw, yawT, 0.12, dt);
      camera.rotation.set(0, yaw, roll);

      // ---- black hole (Huffman's lens): the mass eases in, the hold takes us in
      let massT = 0, heldT = 0, veilT = 0;
      if (holeT >= 0) {
        holeT += dt;
        if (holeT < T_OPEN) {
          massT = 0.015; heldT = 0;
        } else if (holeT < T_SWALLOW) {
          const u = (holeT - T_OPEN) / (T_SWALLOW - T_OPEN);
          // the pen's held click: its hold value climbs 0.03 per frame and the
          // rings sweep inward; the mass grows until its own darkening
          // (pull · 0.25) covers the screen, the swallow from the center out
          heldT = u * 2.4;
          massT = 0.015 + 4.0 * u * u * u * u; // a long, fully-in-view hold before the darkening takes the screen
        } else if (holeT < T_VOID) {
          if (!voidDone) {
            voidDone = true;
            reseed();
            jumping = false;
            objActive = false; objTarget = 0; objAlpha = 0;
            speed = CRUISE;
            flash = 0;
          }
          veilT = 1;
        } else if (holeT < T_END) {
          veilT = 1 - ease((holeT - T_VOID) / (T_END - T_VOID));
        } else {
          holeT = -1;
        }
      }
      if (holeT >= 0 && holeT < T_SWALLOW) {
        mass = approach(mass, massT, 0.25, dt); // the pen eases cur toward target 3 % per frame
        held = heldT;
        veil = 0;
      } else if (holeT >= T_SWALLOW && holeT < T_END) {
        mass = 0; held = 0; veil = veilT;
      } else {
        mass = 0; held = 0; veil = approach(veil, 0, 0.1, dt);
      }

      // ---- wormhole: the throat opens, draws the flight in, and the transit
      // shows the sky ahead through the aperture and the sky behind on the
      // wall of the tube at the same time
      let apR = 0.05, wIn = 0, wRim = 0, wDark = 0, wWall = 1;
      // The mouth's hold on the star field runs through EVERY stage of the
      // transit, not just the two that open it. Dropping it at the draw-in /
      // transit boundary handed the field back in one frame, the stars sprang
      // out of the lens and 20× brighter at the exact moment the mouth is
      // supposed to be swallowing the frame, so these are targets now, eased
      // like fadeS rather than assigned raw.
      let mouthT = 0, pullT = 0, fadeT = 0;
      wormSpeed = 1;
      if (wormT >= 0) {
        wormT += dt;
        if (wormT < W_OPEN) {
          const u = ease(wormT / W_OPEN);
          apR = 0.02 + 0.16 * u;
          wRim = 0.4 * u; wDark = 0.35 * u;
          mouthT = apR; pullT = 0.6 * u; fadeT = 0.95 * u;
          wormSpeed = 1 + 0.7 * u;
        } else if (wormT < W_DRAW) {
          const u = ease((wormT - W_OPEN) / (W_DRAW - W_OPEN));
          apR = 0.18 + 1.55 * u * u;
          wRim = 0.4 + 0.5 * u; wDark = 0.35 * (1 - u * 0.7);
          mouthT = Math.min(apR, 0.95); pullT = 0.6 + 1.2 * u; fadeT = 0.95;
          wIn = smooth(0.5, 0.95, u);
          wormSpeed = 1.7 + 8 * u;
        } else if (wormT < W_TRANSIT) {
          const u = (wormT - W_DRAW) / (W_TRANSIT - W_DRAW);
          wIn = 1;
          // entering, the mouth sweeps out past the frame and the tube closes
          // around us; then the exit aperture grows as we run down the throat
          apR = u < 0.18 ? 1.73 - 1.62 * (u / 0.18) : 0.11 + 0.46 * Math.pow((u - 0.18) / 0.82, 2.0);
          wRim = 0.8; wWall = 1;
          // inside the tube the sky belongs to the wall: the mouth keeps the
          // field bent and held down across the whole frame
          mouthT = 0.95; pullT = 1.8; fadeT = 0.95;
          wormSpeed = 20;
          if (!wormSwapped && u > 0.5) wormSwapped = true;
        } else if (wormT < W_EXIT) {
          const u = (wormT - W_TRANSIT) / (W_EXIT - W_TRANSIT);
          wIn = 1 - ease(u);
          apR = 0.57 + 6.5 * u * u;
          wRim = 0.8 * (1 - u);
          // and lets it go as the aperture takes the screen, the new field
          // comes back with the new sky, over the exit, not on one frame
          mouthT = 0.95; pullT = 1.8 * (1 - ease(u)); fadeT = 0.95 * (1 - ease(u));
          wormSpeed = 20 * (1 - u) + 2;
          if (!wormDone && u > 0.5) {
            wormDone = true;
            flash = Math.max(flash, 1.0);
            seedA = seedB;
            seedB = (seedB * 7.13 + 3.1) % 97;
            reseed();
            jumping = false; jumpArmed = false;
            // you come out of the throat DECELERATING: the exit flash and the
            // speed drop are this transit's deceleration, and the arrival
            // grows in on it (the arrival rule) instead of meeting a flight
            // snapped to cruise
            markDecel();
            spawnArrival();
          }
        } else {
          wormT = -1;
        }
      }
      // eased, so no stage boundary, and not the end of the transit either,
      // can return the field in a single frame. Below a thousandth the radius
      // is snapped to zero: a lens that never quite closes is a lens the star
      // shader keeps evaluating for the rest of the show.
      mouthRS = approach(mouthRS, mouthT, 0.12, dt);
      mouthPullS = approach(mouthPullS, pullT, 0.12, dt);
      mouthFadeS = approach(mouthFadeS, fadeT, 0.12, dt);
      if (wormT < 0 && mouthRS < 0.001) { mouthRS = 0; mouthPullS = 0; mouthFadeS = 0; }
      flowT += dt * 0.55;

      // ---- big bang, and the cold open before it
      let bangMix = 0, bangR = 0, bangTail = 0, bangGain = 1, bangHeat = 0, bangClus = 0;
      let nebulaT = 0, singT = 0, bloomT = 0;
      let speedT;
      if (phase === DARK) {
        // the whole population collapsed on the singularity, breathing
        bangMix = 1; bangHeat = 1; bangClus = 0;
        bangR = 1.05 + io.level * 0.85;
        bangGain = 0.00016 * (0.55 + io.level * 1.1);
        singT = 0.22 + io.level * 0.45;
        speedT = 0;
      } else if (phase === BANG) {
        bangT += dt;
        const u = bangT / BANG_LEN;
        // the pen's outward run, damped so the expansion ARRIVES: it settles
        // into the flight's own box instead of running off to infinity
        const decay = Math.exp(-bangT / BANG_TAU);
        bangR = BANG_R * (1 - decay);
        const rate = (BANG_R / BANG_TAU) * decay;
        bangTail = Math.min(70, rate * 0.055);
        bangHeat = Math.exp(-bangT * 0.5);
        bangClus = smooth(0.16, 0.44, u);
        bangMix = 1 - smooth(0.55, 0.99, u);
        bangGain = 0.6 + 2.2 * Math.exp(-bangT * 0.30);
        // the pen's nebula, as a wash BEHIND the expansion, never bright
        // enough to become the subject, and gone before the cruise
        nebulaT = 0.42 * smooth(0.26, 0.50, u) * (1 - smooth(0.68, 0.94, u));
        singT = 1 - smooth(0.0, 0.10, u);
        bloomT = 2.0 * (smooth(0.0, 0.04, u) * (1 - smooth(0.62, 0.97, u)));
        // the flight is already streaming under the handover, so the field
        // never stalls between the expansion and the cruise
        speedT = CRUISE * smooth(0.26, 0.72, u);
        if (bangT > BANG_LEN) { phase = FLIGHT; bangT = -1; }
      } else {
        speedT = CRUISE * (1 + warpS * WARP_GAIN) + kick * 160 + io.beat * 30;
        speedT *= wormSpeed * elemSpeedMul; // an element draws the flight in and sets its pace inside
      }

      // ---- flight: forward only; the jump multiplies speed, strikes kick it
      speed = approach(speed, speedT, speedT > speed ? 0.35 : 0.45, dt);
      kick = Math.max(0, kick - dt * 2.2);
      travel += speed * dt;
      flash = Math.max(0, flash - dt * 2.5);
      breath = approach(breath, 0.85 + io.level * 0.45, 0.2, dt);
      // the star's streak: where it was a shutter ago, longer in the jump
      // the streak is where the star was a shutter ago; the cap is a fill-rate
      // budget as much as a look, a longer tail spreads the same light thinner
      const tail = Math.min(BOX_DEPTH * 0.45, speed * (0.05 + warpS * 0.45) + warpS * 30);
      // ---- the arrival rule: the normalised streak length s, the streak now
      // (the tail, plus the relativistic smear counted as tail) over the peak
      // streak of the jump the arrival came out of. A jump measures its own
      // peak while its streaks are at length; a transit or an element marks
      // the moment its deceleration begins. s is 1 while the streaks are at
      // the peak and 0 at rest, and every decelerating arrival grows by
      // min(its time ease, smooth(1 − s)), monotonic.
      // s is measured on a log scale between a generous cruise tail and the
      // peak, because a streak reads by its ratio to a star's own size: a
      // 30-unit tail against a 300-unit peak is a tenth of the length but
      // still plainly a streak, and on a linear scale the arrival would be
      // nearly full while they are. The gate is smooth(1 − s)², a point
      // while the streaks are long, settling in only as they reach rest.
      streakNow = tail + aber * 40;
      if (jumping && jumpArmed) tailPeak = Math.max(tailPeak, streakNow);
      const restRef = TAIL_REST * 3;
      streakS = tailPeak > restRef * 1.5
        ? clamp01(Math.log(Math.max(streakNow, restRef) / restRef) / Math.log(tailPeak / restRef))
        : 0;
      const gateRoot = smooth(0, 1, 1 - streakS);
      const decelGate = gateRoot * gateRoot;

      // ---- the object ahead: approach at flight speed; leave it on a jump
      if (objActive) {
        objZ += speed * dt * ((jumping && jumpArmed) || wormT >= 0 ? 0.25 : 1);
        // a body starts to go as the flight reaches it, and a big body reaches
        // you first: the fade begins at its own radius, so nothing ever flies
        // through the lens (and nothing ever fills the frame with the most
        // expensive shader in the scene)
        // ...but never further out than half the distance it arrived from, so
        // turning `object scale` up does not dismiss a body that is still a
        // long way off
        const size = (objShape >= 0 ? OBJ_EXTENT[objShape] : 1) * objBase * scaleS;
        const nearZ = -Math.min(60 + size * 1.8, objSpawnDist * 0.6);
        // (a jump dismisses the body only while its streaks are still at
        // length, once the wind-down has begun the body on screen IS the
        // arrival, growing as they shorten)
        if ((jumping && jumpArmed) || objZ > nearZ) objTarget = 0;
        objAlpha = approach(objAlpha, objTarget, objTarget > objAlpha ? 1.2 : 0.3, dt);
        if ((objTarget === 0 && objAlpha < 0.01) || objZ > 30) objActive = false;
      } else {
        objAlpha = 0;
      }
      obj.visible = objActive && objAlpha > 0.002;
      scaleS = approach(scaleS, scaleUser, 0.12, dt);
      if (objGrowT >= 0) {
        objGrowT = Math.min(GROW_LEN, objGrowT + dt);
        const gu = objGrowT / GROW_LEN;
        const timeEase = 1 - (1 - gu) * (1 - gu) * (1 - gu);
        objGrow = Math.max(objGrow, Math.min(timeEase, objDecel ? decelGate : 1));
      }

      // ---- the elements: one at a time, ahead on the flight axis, grown in
      // under the arrival rule, entered, run through, left
      let elemFadeT = 1; // what the element does to the star field's brightness
      let elemBloom = 0, elemRadius = 0.5, elemThresh = 0;
      elemSpeedMul = 1;
      if (elemKind !== EL_NONE) {
        elemT += dt;
        if (elemGrowT >= 0) {
          elemGrowT = Math.min(GROW_LEN, elemGrowT + dt);
          const gu = elemGrowT / GROW_LEN;
          const timeEase = 1 - (1 - gu) * (1 - gu) * (1 - gu);
          elemGrow = Math.max(elemGrow, Math.min(timeEase, elemDecel ? decelGate : 1));
        }
        const grow = GROW_FLOOR + (1 - GROW_FLOOR) * elemGrow;
        if (elemKind !== EL_WARP) { elemZ += speed * dt; elemEndZ += speed * dt; }
        // the approach: the element draws the flight in, gently while it is
        // far and harder as its mouth nears
        const approachPull = 1.25 + 0.9 * smooth(ELEM_SPAWN_Z[elemKind] || 200, 40, -elemZ);

        if (elemKind === EL_CORRIDOR) {
          // ---- TUNNEL END: the mouth comes up, the eye enters, the tiles
          // stream past at flight speed, the far end opens
          if (elemStage === 0 && elemZ >= 0) { elemStage = 1; reseed(); }
          if (elemStage === 1 && elemEndZ >= 0) { elemStage = 2; elemExitT = 0; }
          if (elemStage === 2) {
            elemExitT += dt;
            elemA = approach(elemA, 0, 0.12, dt);
            if (elemA < 0.01 || elemExitT > 1.5) clearElement();
          } else {
            elemA = grow;
          }
          // the approach draws the flight in, harder as the mouth nears;
          // inside, the level lifts the pace (the pen's cruise 3 -> 9 on the
          // level) and strikes kick it
          elemSpeedMul = elemStage === 0 ? approachPull : 1.2 + 0.9 * io.level;
          // inside: the field dims to let the tiles carry the frame, dark as
          // the mouth swallows the eye (the re-seed lands there), back to
          // full as the far end nears
          corrIn = approach(corrIn, elemStage === 1 ? 1 : 0, 0.25, dt);
          const nearMouth = elemStage === 0 ? smooth(-40, 0, elemZ) : 0;
          const nearEnd = elemStage === 1 ? smooth(-60, -10, elemEndZ) : 1;
          elemFadeT = elemStage === 2 ? 1 : (1 - nearMouth) * (1 - corrIn) + corrIn * (0.3 + 0.7 * nearEnd);
          // the pen's controls: sway tightens the corridor and rolls it,
          // press narrows, the hand slides the eye, the beat flashes, bass
          // hazes the fog
          corrSway = approach(corrSway, io.gestures.sway, 0.25, dt);
          corrPress = approach(corrPress, io.gestures.press, 0.15, dt);
          const pitch = (1 - 0.7 * corrSway) * (1 - 0.55 * corrPress);
          const gap = CORR_GAP * (1 - 0.4 * corrSway) * (1 - 0.35 * corrPress);
          const comp = 1 - 0.5 * corrSway;
          corrEyeX = approach(corrEyeX, (io.xy.x - 0.5) * (CORR_LANES * 0.5 * pitch) * 0.7, 0.3, dt);
          corrEyeY = approach(corrEyeY, gap * (0.25 + 0.5 * io.xy.y), 0.3, dt);
          tiles.rotation.z = corrSway * CORR_ROLL_MAX; // the sway's roll, set, never accumulated
          for (let k = 0; k < 5; k++) {
            const pk = io.palette[k];
            tilePal[k * 3] = pk.r; tilePal[k * 3 + 1] = pk.g; tilePal[k * 3 + 2] = pk.b;
          }
          tileU.uMouthZ.value = elemZ;
          tileU.uEndZ.value = elemEndZ;
          tileU.uScale.value = CORR_S * grow;
          tileU.uPitch.value = pitch;
          tileU.uGap.value = gap;
          tileU.uComp.value = comp;
          tileU.uEye.value.set(corrEyeX, corrEyeY);
          tileU.uFogD.value = (CORR_FOG_D / comp / CORR_S) * (1 + 0.4 * io.bands.bass);
          tileU.uFogCol.value.copy(io.palette[0]).multiplyScalar(io.bands.bass * io.bands.bass * 0.16);
          tileU.uBeat.value = io.beat;
          tileU.uIntensity.value = io.intensity;
          tileU.uAlpha.value = elemA;
          // the pen's bloom, inside
          elemBloom = 3 * corrIn * elemA; elemRadius = 0; elemThresh = 0;
        } else if (elemKind === EL_THROAT) {
          // ---- WORMHOLE PT 1: the throat forms ahead, the flight is drawn
          // down it, the wall blooms open at the end of the run
          if (elemStage === 0 && elemZ >= 0) { elemStage = 1; reseed(); }
          if (elemStage === 1 && elemZ >= TH_RUN) {
            elemStage = 2; elemExitT = 0;
            flash = Math.max(flash, 0.7);
            markDecel();
            spawnObject(-1, 0, true); // a new body grows in on the deceleration
          }
          if (elemStage === 2) {
            elemExitT += dt;
            const u = Math.min(1, elemExitT / 0.9);
            thOpen = ease(u);
            elemA = 1 - ease(u);
            if (u >= 1) clearElement();
          } else {
            elemA = grow;
          }
          // STRIKE (rising edge): a zeta shock, the throat buckles, foams and
          // shakes, then settles over ~1.5 s
          if (io.strike > strikePrev + 0.25) thShock = 1;
          thShock *= Math.pow(0.08, dt);
          // SWAY is stability; PRESS (the pen's held click) lifts it toward 1
          const target = io.gestures.sway + (1 - io.gestures.sway) * io.gestures.press;
          thStab += (target - thStab) * (1 - Math.exp(-dt / 0.35));
          const stabEff = thStab * (1 - thShock * 0.85);
          // the pen's forward speed 120·(0.3 + 0.7·stability), swollen by
          // bass, integrated so the particles never snap when it changes;
          // the flight itself is drawn down the throat on the bass as well
          const speedZ = 120 * (0.3 + 0.7 * thStab) * (1 + io.bands.bass * 0.8);
          thTravel = (thTravel + speedZ * dt) % TH_TRAVEL_WRAP;
          thSwirl = (thSwirl + stabEff * dt) % TH_SWIRL_WRAP;
          elemSpeedMul = elemStage === 0 ? approachPull : 1.4 + 0.8 * io.bands.bass;
          // hand: the warp target in tunnel xy (the pen's (mouse·2 − 1)·800),
          // eased; the pull weight rides (1 − stability) over a small floor
          thWarpTarget.set((io.xy.x - 0.5) * 1600, (io.xy.y - 0.5) * 1600);
          thU.uWarp.value.lerp(thWarpTarget, 1 - Math.exp(-dt / 0.25));
          thU.uWarpW.value = 0.1 + 0.3 * (1 - stabEff);
          thU.uTime.value = t;
          thU.uTravel.value = thTravel;
          thU.uSwirl.value = thSwirl;
          thU.uStab.value = stabEff;
          thU.uShock.value = thShock;
          thU.uSpeedZ.value = speedZ;
          thU.uOpen.value = thOpen;
          thU.uBright.value = io.intensity * (1 + io.beat * 0.35) * elemA;
          thU.uSize.value = (ctx.height / 1080) * TH_S * grow;
          // palette: sort the five entries cool -> warm by (r − b), in place
          for (let i = 0; i < 5; i++) { thWarmth[i] = io.palette[i].r - io.palette[i].b; thOrder[i] = i; }
          for (let i = 1; i < 5; i++) {
            const k = thOrder[i];
            let j = i - 1;
            while (j >= 0 && thWarmth[thOrder[j]] > thWarmth[k]) { thOrder[j + 1] = thOrder[j]; j--; }
            thOrder[j + 1] = k;
          }
          // stable pair: the two coolest, the bright end pulled toward white;
          // unstable pair: the two warmest
          thU.uStableA.value.copy(io.palette[thOrder[0]]);
          thU.uStableB.value.copy(io.palette[thOrder[1]]).lerp(white, 0.55);
          thU.uUnstableA.value.copy(io.palette[thOrder[4]]);
          thU.uUnstableB.value.copy(io.palette[thOrder[3]]).lerp(white, 0.3);
          // tunnel: tinted warm -> cool by stability, the pen's opacity pulse
          thLineU.uTint.value.copy(io.palette[thOrder[4]]).lerp(io.palette[thOrder[0]], stabEff).multiplyScalar(io.intensity);
          thLineU.uOpacity.value = (0.05 + 0.1 * Math.sin(t * 5 * (1.5 - stabEff))) * elemA;
          thLineU.uInvS.value = 1 / (TH_S * grow);
          // the throat's place and scale in the flight's world; the shake is a
          // translation of the throat, (1 − stability)·3 of the pen's units
          // plus the shock's, no roll, the eye keeps looking down it
          const shake = ((1 - stabEff) * 3 + thShock * 6) * TH_S * 2;
          throat.position.set((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake, elemZ);
          throat.scale.setScalar(TH_S * grow);
          throatLines.position.copy(throat.position);
          throatLines.scale.copy(throat.scale);
          // inside, the field dims to the pen's black; the wall covers most of
          // it anyway
          elemFadeT = elemStage === 2 ? 1 : 1 - 0.85 * smooth(-30, 10, elemZ);
          elemBloom = 0.8 * elemA; elemRadius = 0.3; elemThresh = 0.85;
        } else if (elemKind === EL_TUBE) {
          // ---- WORMHOLE END: the tube's mouth opens ahead, the eye flies up
          // the tube to the sphere, past it, and out through the far cap
          const g = grow;
          // the eye in the pen's units: the mouth (the bottom pole) sits at
          // the world z the element carries, the tube growing away from it
          const yEye = -TUBE_LEN * g + elemZ / TUBE_S;
          if (elemStage === 0 && elemZ >= 0) { elemStage = 1; reseed(); }
          // STRIKE (rising edge) kicks the travel; the kick decays
          if (io.strike > 0.3 && strikePrev <= 0.3) tubeKick = Math.max(tubeKick, 3.5);
          tubeKick = Math.max(0, tubeKick - dt * tubeKick * 2.2);
          // forward motion only: the scroll phase is the pen's flow; bass
          // lifts the rate, the kick surges it; the flight is drawn in and
          // runs the tube on the bass as well
          tubeTravel = approach(tubeTravel, 1 + io.bands.bass * 1.8 + tubeKick, 0.12, dt);
          tubePhase += dt * TUBE_RATE * tubeTravel;
          elemSpeedMul = elemStage === 0 ? approachPull : 1.6 + 0.8 * io.bands.bass + tubeKick * 0.3;
          // PRESS squeezes the tube; the eye's offset from the axis rides in
          // with it so the eye never reaches the wall (and, squeezed at the
          // sphere, rides INTO it)
          tubeRadius = approach(tubeRadius, TUBE_R * (1 - io.gestures.press * 0.42), 0.15, dt);
          // hand: x steers the eye across the tube (about the pen's offset,
          // held inside the wall's narrowing toward the caps), y nudges it
          // along
          tubeEyeX = approach(tubeEyeX, -0.85 + (io.xy.x - 0.5) * 2.4, 0.35, dt);
          tubeNudge = approach(tubeNudge, (io.xy.y - 0.5) * 4, 0.35, dt);
          const sq = tubeRadius / TUBE_R;
          let ex = tubeEyeX * sq, ez = 0.85 * sq;
          const lateral = Math.hypot(ex, ez);
          if (lateral > 1.5) { ex *= 1.5 / lateral; ez *= 1.5 / lateral; }
          tubeU.uEye.value.set(ex, yEye + tubeNudge, ez);
          // the pass: the sphere swells past the eye, dead on (inside its
          // radius) it FILLS the frame as a flash, and the far cap is the way
          // out, into the re-seeded field with a new body
          if (elemStage === 1 && !tubePassed && yEye + tubeNudge >= TUBE_SPH_Y * g) {
            tubePassed = true;
            flash = Math.max(flash, Math.min(lateral, 1.5) < g + 0.1 ? 1.6 : 0.45);
          }
          if (elemStage === 1 && yEye + tubeNudge >= TUBE_LEN * g) {
            elemStage = 2; elemExitT = 0;
            markDecel();
            spawnObject(-1, 0, true);
          }
          if (elemStage === 2) {
            elemExitT += dt;
            tubeA = approach(tubeA, 0, 0.15, dt);
            if (tubeA < 0.01 || elemExitT > 1.2) clearElement();
          } else {
            tubeA = g;
          }
          // SWAY morphs the layer weights and the flow tightness
          tubeMorph = approach(tubeMorph, (io.gestures.sway - 0.5) * 2, 0.3, dt);
          tubeU.uMorph.value = tubeMorph;
          tubeU.uPhase.value = tubePhase;
          tubeU.uRadius.value = tubeRadius;
          tubeU.uGrow.value = g;
          // the beat pulses the sphere's emissive about the pen's 0.12
          tubeU.uEmis.value = 0.12 + io.beat * 0.5;
          tubeU.uGain.value = 0.85;
          tubeU.uIntensity.value = io.intensity;
          tubeU.uAlpha.value = tubeA;
          tubeU.uRoll.value = roll;
          // palette: the photo's warmth = 3/4 toward white, the cool layers = 2/0
          tubeU.uWarm3.value.copy(io.palette[3]).lerp(io.palette[4], 0.5).lerp(white, 0.35);
          tubeU.uCool.value.copy(io.palette[2]).lerp(io.palette[0], 0.5);
          tubeU.uWhite.value.copy(io.palette[2]).lerp(white, 0.75);
          elemA = tubeA;
          // the wall covers the field; the far cap shows it
          elemFadeT = 1;
        } else if (elemKind === EL_WARP) {
          // ---- RELATIVISTIC WARP: β rises, holds, settles; a new body
          // arrives on the settling. As an arrival it waits for the jump's
          // streaks to die before it rises.
          const gated = elemDecel && streakS > 0.2 && relT <= 0;
          if (!gated) relT += dt;
          const holdEnd = REL_RISE + REL_HOLD;
          const relTarget = relT < holdEnd ? 1 : 0;
          relS = approach(relS, relTarget, relTarget > relS ? 0.9 : 1.0, dt);
          if (relT >= holdEnd && !relSpawned) {
            relSpawned = true;
            markDecel();
            if (objActive && objShape === SHAPE_SUN) objTarget = 0;
            spawnObject(-1, 0, true);
          }
          if (relT >= holdEnd && relS < 0.01) clearElement();
          // SWAY sets the velocity; the regime's β is what the shaders see
          relMul = Math.pow(2, (io.gestures.sway - 0.5) * 2.6);
          aber = Math.min(0.93, relS * relMul * 0.55);
          elemSpeedMul = 1 + relS * 3 * relMul;
          elemA = relS;
          elemBloom = (0.55 + aber * 0.45) * relS; elemRadius = 0.5; elemThresh = 0.6;
        }
      }
      if (elemKind !== EL_WARP) aber = 0;
      fadeS = approach(fadeS, (1 - wIn * 0.78) * elemFadeT, 0.15, dt);
      tiles.visible = elemKind === EL_CORRIDOR && elemA > 0.002;
      throat.visible = throatLines.visible = elemKind === EL_THROAT && elemA > 0.002;
      tube.visible = elemKind === EL_TUBE && tubeA > 0.002;
      strikePrev = io.strike;

      // ---- the sky: the panorama for the hole, the bang and the warp, the
      // throat for the wormhole. It comes in as the hole's mass fills the
      // view, washes in behind the young universe, stands behind the box
      // field under the warp, and is the wormhole's own surface, the disc
      // of the mouth as it opens, the tube once inside.
      let skyT, panA;
      if (wormT >= 0) { skyT = 1; panA = relS; }
      else if (phase === BANG) { skyT = nebulaT; panA = 1; }
      else if (holeT >= 0 && holeT < T_SWALLOW) { skyT = Math.min(1, mass / 0.015); panA = 1; }
      else { skyT = relS > 0.002 ? 1 : 0; panA = relS; }
      skyA = approach(skyA, skyT, skyT > skyA ? (wormT >= 0 ? 0.12 : 0.35) : 0.2, dt);
      sky.visible = skyA > 0.003;
      singA = approach(singA, singT, 0.25, dt);
      bloom.strength = Math.max(bloomT, flash * 0.9 + wRim * 0.5, elemBloom);
      bloom.radius = elemBloom > 0 ? elemRadius : 0.5;
      bloom.threshold = elemBloom > 0 ? elemThresh : 0;

      // ---- uniforms
      const pl = io.palette;
      sp0.value.copy(pl[0]); sp1.value.copy(pl[1]); sp2.value.copy(pl[2]);
      op0.value.copy(pl[0]); op1.value.copy(pl[1]); op2.value.copy(pl[2]); op3.value.copy(pl[3]); op4.value.copy(pl[4]);
      vp0.value.copy(pl[0]); vp1.value.copy(pl[1]); vp2.value.copy(pl[2]); vp3.value.copy(pl[3]); vp4.value.copy(pl[4]);
      kp0.value.copy(pl[0]); kp1.value.copy(pl[1]); kp2.value.copy(pl[2]); kp3.value.copy(pl[3]); kp4.value.copy(pl[4]);

      starU.uTravel.value = travel;
      starU.uSide.value = side;
      starU.uTime.value = t;
      starU.uTwinkle.value = io.bands.high;
      starU.uBreath.value = breath;
      starU.uOrder.value = orderS;
      starU.uTail.value = tail;
      starU.uGain.value = warpS * 1.6 + io.bands.bass * 0.3;
      starU.uFade.value = fadeS;
      starU.uHole.value.set(mass, held);
      starU.uWorm.value.set(mouthRS, mouthPullS, mouthFadeS);
      starU.uAber.value = aber;
      starU.uBang.value = bangMix;
      starU.uBangR.value = bangR;
      starU.uBangTail.value = bangTail;
      starU.uBangGain.value = bangGain;
      starU.uBangHeat.value = bangHeat;
      starU.uCluster.value = bangClus;
      starU.uIntensity.value = io.intensity;

      objU.uTime.value = t;
      // `object scale` has a CEILING at the body's own distance: scaled past
      // it the eye ends up INSIDE the body, every ray misses, and the quad is
      // paying full-frame fill for nothing (the ceiling holds the window at
      // ~104 % of frame height, which is also the fill-rate guard).
      // The ceiling is the mapping, not a silent clamp: the knob's travel
      // ABOVE 1× is stretched into whatever headroom the distance leaves, so
      // the top of the range always reaches the ceiling and never dies
      // half-way, at the 900-unit default that ceiling is under 3×, so more
      // than half the declared range used to be the same picture. Below 1×
      // and wherever the full range fits (past ~1800 units) the mapping is
      // the identity, so a scale still means what it says.
      const ext = objShape >= 0 ? OBJ_EXTENT[objShape] : 1;
      const ceilScale = Math.max(0.05, -objZ / Math.max(ext * objBase * 1.6, 0.001));
      const topScale = Math.min(ceilScale, SCALE_MAX);
      let useScale = scaleS;
      if (scaleS > 1) useScale = 1 + (scaleS - 1) * ((Math.max(topScale, 1) - 1) / (SCALE_MAX - 1));
      useScale = Math.min(useScale, ceilScale);
      // Nothing appears at its size: a body GROWS out of the point it arrives
      // at, from (almost) nothing to its size over GROW_LEN, fast at first and
      // settling, an ease-out cubic, and no faster than the deceleration it
      // arrives on lets it (objGrow, above), under the alpha that was always
      // there. The floor keeps the shader's 1/uScale finite on the first frame.
      const grow = GROW_FLOOR + (1 - GROW_FLOOR) * objGrow;
      useScale *= grow;
      objU.uScale.value = objBase * useScale;
      objU.uExtent.value = ext * objBase * useScale;
      objU.uWindow.value = ext;
      objU.uAlpha.value = objAlpha;
      // the clock is the floor and the beat is the swing: a hit reads on the
      // body without the pulsar and the radiator strips going dead between
      // beats, and without the free-running sine masking io.beat, which is
      // what a max() of the two did
      objU.uPulse.value = 0.35 + 0.25 * Math.sin(t * 7.0) + 0.4 * pulse;
      objU.uLevel.value = io.level;
      objU.uObjPos.value.set(objX, objY, objZ);
      objU.uHole.value.set(mass, held);
      objU.uWorm.value.set(mouthRS, mouthPullS, mouthFadeS);
      objU.uIntensity.value = io.intensity;
      objU.uSway.value = orderS * 1.2;
      objU.uAber.value = aber;

      overU.uTime.value = t;
      overU.uWarp.value = warpS;
      overU.uFlash.value = flash;
      overU.uVeil.value = veil;
      overU.uSing.value = singA;
      overU.uIntensity.value = io.intensity;
      overU.uRoll.value = roll;
      overU.uHole.value.set(mass, held);
      overU.uMouth.value.set(Math.max(apR, 0.0001), wRim, wDark);

      skyU.uTime.value = t;
      skyU.uSky.value = skyA;
      skyU.uIntensity.value = io.intensity;
      skyU.uRoll.value = roll;
      skyU.uYaw.value = yaw;
      skyU.uMode.value = wormT >= W_DRAW ? 1 : 0;
      skyU.uSeedA.value = seedA;
      skyU.uSeedB.value = seedB;
      skyU.uFlow.value = flowT;
      skyU.uNebula.value = nebulaT;
      skyU.uPanA.value = panA;
      skyU.uAber.value = aber;
      skyU.uHole.value.set(mass, held);
      skyU.uMouthLens.value.set(mouthRS, mouthPullS);
      skyU.uThroat.value.set(Math.max(apR, 0.0001), wIn, wRim, wWall);

      // A shader program is translated by the driver at its FIRST DRAW THAT
      // RASTERISES, not when it is linked and not when it is merely bound:
      // the engine's compileAsync hands it over, but ANGLE keeps the HLSL
      // until fragments are actually wanted. The object quad and the sky quad
      // are hidden for most of this scene's life, so without this the driver
      // did that translation inside the live frame where the first body
      // arrives, measured once, on a cold shader cache, at 115 ms at 720 p
      // and 170 ms at 1080 p: ten dropped frames on the very flash that is
      // meant to reveal it. For the first two frames both quads are drawn
      // shrunk into a two-pixel patch in the corner with their output at zero
      // alpha: the driver gets a real rasterised draw and the stage gets
      // nothing to look at.
      // BE CLEAR ABOUT WHERE THAT COST LANDS. update() runs only while the
      // scene is VISIBLE (docs/SCENE_CONTRACT.md: the active scene, or the
      // incoming one mid-fade), so these two frames are the scene's first two
      // frames ON SCREEN, the head of the cut, or the head of the crossfade
      // where the incoming scene is still weighted near zero. The stall is
      // moved, not removed: out of the flash that reveals the first body and
      // into the transition that introduces the scene. Paying it genuinely
      // off screen needs a rasterising warm hook in the engine's `ready` /
      // compileAsync pipeline, a renderer-side change, not this file's.
      // The same goes for every element's mesh: the corridor tiles, the
      // throat's points and lines, the tube quad.
      if (warmFrames > 0) {
        warmFrames--;
        obj.visible = true;
        sky.visible = true;
        tiles.visible = true;
        throat.visible = true;
        throatLines.visible = true;
        tube.visible = true;
      } else {
        objU.uWarm.value = 0;
        skyU.uWarm.value = 0;
        tileU.uWarm.value = 0;
        thU.uWarm.value = 0;
        tubeU.uWarm.value = 0;
      }
    },
    debug() { return { phase, speed: +speed.toFixed(1), warpS: +warpS.toFixed(3), jumping, jumpArmed, tailPeak: +tailPeak.toFixed(1), streakNow: +streakNow.toFixed(1), streakS: +streakS.toFixed(3), objActive, objShape, objZ: +objZ.toFixed(0), objGrow: +objGrow.toFixed(3), objAlpha: +objAlpha.toFixed(2), objTarget, elemKind, elemStage, elemZ: +elemZ.toFixed(0), elemEndZ: +elemEndZ.toFixed(0), elemGrow: +elemGrow.toFixed(3), elemA: +elemA.toFixed(2), relS: +relS.toFixed(2), aber: +aber.toFixed(2), wormT: +wormT.toFixed(2), holeT: +holeT.toFixed(2), fadeS: +fadeS.toFixed(2), kick: +kick.toFixed(2) }; },
    // Discrete events. The router only delivers these while the scene is on
    // screen. Firing anything at a dark stage lights the universe first.
    action(key) {
      if (phase === DARK && key !== 'bigbang') fireBang();
      switch (key) {
        case 'bigbang': fireBang(); break;
        case 'blackhole': fireHole(); break;
        case 'hyperspace': if (elemKind === EL_NONE) jumpT = 0; break;
        case 'wormhole': fireWormhole(); break;
        case 'bankLeft': bankT = 0; bankSide = -1; break;
        case 'bankRight': bankT = 0; bankSide = 1; break;
        case 'thrust': kick = Math.max(kick, 1.0); break;
        case 'spawn': spawnObject(); break;
        case 'swallow': swallow(); break;
        case 'tunnelEnd': fireElement(EL_CORRIDOR, false); break;
        case 'wormholePt1': fireElement(EL_THROAT, false); break;
        case 'wormholeEnd': fireElement(EL_TUBE, false); break;
        case 'warp': fireElement(EL_WARP, false); break;
        default: break;
      }
    },
    // Continuous parameters, already mapped into the declared range.
    setParam(key, value) {
      const v = Number(value);
      if (!Number.isFinite(v)) return;
      switch (key) {
        case 'objectScale': scaleUser = clampTo(v, SCALE_MIN, SCALE_MAX); break;
        case 'objectX': pendX = clampTo(v, -1, 1); xSet = true; break;
        case 'objectY': pendY = clampTo(v, -1, 1); ySet = true; break;
        case 'objectDistance': pendDist = clampTo(v, 200, 2000); distSet = true; break;
        case 'objectNext': { const n = Math.round(clampTo(v, 0, SHAPES + 1)); nextShape = n <= 0 ? -1 : n - 1; break; }
        case 'warpAmount': paramWarp = clamp01(v); break;
        case 'starDistribution': paramOrder = clamp01(v); break;
        case 'nextArrival': nextArrival = Math.round(clampTo(v, 0, 4)); break;
        default: break;
      }
    },
    resize(w, h) {
      aspect = w / Math.max(1, h);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      starU.uAspect.value = aspect;
      objU.uAspect.value = aspect;
      starU.uRes.value.set(w, h);
      overU.uRes.value.set(w, h);
      skyU.uRes.value.set(w, h);
      tubeU.uRes.value.set(w, h);
      thU.uCap.value = h / 1080; // keep the throat's point size resolution-stable
    },
    dispose() {
      starGeo.dispose();
      starMat.dispose();
      objGeo.dispose();
      objMat.dispose();
      overGeo.dispose();
      overMat.dispose();
      skyGeo.dispose();
      skyMat.dispose();
      tiles.dispose(); // frees the instanceMatrix GPU buffer
      tileGeo.dispose();
      tileMat.dispose();
      throatGeo.dispose();
      throatMat.dispose();
      thWireGeo.dispose();
      thLineMat.dispose();
      tubeGeo.dispose();
      tubeMat.dispose();
    },
  };
}
