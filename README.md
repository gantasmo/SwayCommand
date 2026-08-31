![SwayCommand](docs/media/banner.webp)

**by [GANTASMO](https://gantasmo.com)**

[![Electron 43](https://img.shields.io/badge/Electron-43-2de1fc?style=flat-square&labelColor=0b0f17&logo=electron&logoColor=white)](https://www.electronjs.org)
[![three.js r185](https://img.shields.io/badge/three.js-r185-2de1fc?style=flat-square&labelColor=0b0f17&logo=threedotjs&logoColor=white)](https://threejs.org)
[![GLSL3 on WebGL2](https://img.shields.io/badge/shaders-GLSL3%20on%20WebGL2-2de1fc?style=flat-square&labelColor=0b0f17&logo=webgl&logoColor=white)](docs/SCENE_CONTRACT.md)
![Web Audio and AudioWorklet](https://img.shields.io/badge/audio-Web%20Audio%20%2B%20AudioWorklet-2de1fc?style=flat-square&labelColor=0b0f17)
[![16 procedural scenes](https://img.shields.io/badge/scenes-16%20procedural-ff2d95?style=flat-square&labelColor=0b0f17)](#scenes)

[![hardware Audima Sway](https://img.shields.io/badge/hardware-Audima%20Sway-ff2d95?style=flat-square&labelColor=0b0f17)](https://audima.com.au)
![platform Windows macOS Linux](https://img.shields.io/badge/platform-Windows%20%2F%20macOS%20%2F%20Linux-2de1fc?style=flat-square&labelColor=0b0f17&logo=windows&logoColor=white)
[![companion theDAW](https://img.shields.io/badge/companion-theDAW-7C3AED?style=flat-square&labelColor=0b0f17&logo=github&logoColor=white)](https://github.com/gantasmo/theDAW)
[![license MIT](https://img.shields.io/badge/license-MIT-2de1fc?style=flat-square&labelColor=0b0f17)](LICENSE)
![status active development](https://img.shields.io/badge/status-active%20development-F4A261?style=flat-square&labelColor=0b0f17)

[![Listen on Spotify](https://img.shields.io/badge/Listen-Spotify-1DB954?style=flat-square&labelColor=0b0f17&logo=spotify&logoColor=white)](https://open.spotify.com/artist/4q5n0QgK6mvyuw8FRzhuNA)
[![Watch on YouTube](https://img.shields.io/badge/Watch-YouTube-FF0000?style=flat-square&labelColor=0b0f17&logo=youtube&logoColor=white)](https://www.youtube.com/@GANTASMO)
[![Follow @gantasmo on Instagram](https://img.shields.io/badge/Follow-%40gantasmo-E4405F?style=flat-square&labelColor=0b0f17&logo=instagram&logoColor=white)](https://www.instagram.com/gantasmo)
[![Follow @gantasmo on X](https://img.shields.io/badge/Follow-%40gantasmo-000000?style=flat-square&labelColor=0b0f17&logo=x&logoColor=white)](https://x.com/gantasmo)
[![Learn more at gantasmo.com](https://img.shields.io/badge/Learn%20More-gantasmo.com-7C3AED?style=flat-square&labelColor=0b0f17&logo=googlechrome&logoColor=white)](https://gantasmo.com)

<!-- rizz:ignore-start reason="GANTASMO identity paragraph, supplied verbatim" -->
> **GANTASMO** is an amorphous entity by [Daniel Joaquin Trujillo](https://github.com/danieljtrujillo)
> and [Josh Valenzuela](https://github.com/StarskreamEXE) that defies conventional
> classification. We make thought provoking, highly technical, yet listenable music
> inspired by the underappreciated pioneers of modern music. Beyond musical composition
> and performance, GANTASMO is a powerhouse of research and development in the fields
> Artificial Intelligence, Augmented Reality, Virtual Reality, the democratization of
> musical tools and education, and the preservation and evolution of musical history
> and traditions predating modern recording infrastructure.
<!-- rizz:ignore-end -->

---

SwayCommand is a desktop VJ instrument built around the Audima Labs Sway, a
gesture MIDI controller whose sixteen infrared sensors read hand positions in
the air above it. Sixteen procedural scenes render on WebGL2 through three.js,
driven by live audio analysis and by those hands. The whole rig lives on one
page that renders from boot to quit: the scene bank, the timeline, the control
deck and the instrument drawers all work on top of a frame that never stops.

The Sway is optional at every point. Audio arrives from any input device, from
Windows system loopback, or from stems on the built-in timeline. Control arrives
from the Sway, from any class-compliant MIDI controller, or from the mouse and
keyboard. With no peripherals attached at all, the analyser synthesises a
120 BPM groove into the analyser node and every scene still plays.

> SwayCommand is an independent project. It is not affiliated with or endorsed
> by Audima Labs Pty Ltd, and it redistributes no Audima binary. Optional Audima
> components download from Audima's own CDN on request. See [Legal](#legal).

![Miracle Mile](docs/media/hero.webp)

*Miracle Mile, DETONATION act. Four acts sit on one knob, a noir city sits under
all of them, and every pad on the deck is its own re-entry vehicle.*

## Scenes

Sixteen modules in [src/renderer/engine/scenes/](src/renderer/engine/scenes/),
every shader GLSL3, none of them rotating on their own. Each one reads the same
five-colour palette, the same three audio bands and the same gesture snapshot,
and answers a pad strike with an event of its own: a mode jump, a geometry
advance, a re-seed. The interface they implement is
[SCENE_CONTRACT.md](docs/SCENE_CONTRACT.md).

| Beam Sixteen | Swarm | Ribbons | Voxels |
|---|---|---|---|
| ![Beam Sixteen](docs/media/scenes/beams.webp) | ![Swarm](docs/media/scenes/swarm.webp) | ![Ribbons](docs/media/scenes/ribbons.webp) | ![Voxels](docs/media/scenes/voxels.webp) |
| One beam per IR sensor. Knob 4 crossfades hologram, laser, electricity. | A stateless GPU cloud orbiting an attractor that chases the hand. | Lissajous trails. A strike runs a whipcrack head to tail. | A box heightfield. Bass pumps rings, each pad drops a stone. |

| Nebula | Mandelbulb | Cymatic Orb | Spectra |
|---|---|---|---|
| ![Nebula](docs/media/scenes/nebula.webp) | ![Mandelbulb](docs/media/scenes/mandelbulb.webp) | ![Cymatic Orb](docs/media/scenes/cymatic.webp) | ![Spectra](docs/media/scenes/spectra.webp) |
| Three fbm layers warping each other, mirror-folded, contoured into filaments. | A raymarched solid. Strikes jump between six distance estimators. | Three spherical modes summed in the vertex shader, nodal lines lit per pixel. | A mel-history terrain scrolling under the inferno ramp. |

| VJ Shader | Ferrofluid Orb | Cymatic Plate | Chrome Valley |
|---|---|---|---|
| ![VJ Shader](docs/media/scenes/vjshader.webp) | ![Ferrofluid Orb](docs/media/scenes/ferrofluid.webp) | ![Cymatic Plate](docs/media/scenes/chladni.webp) | ![Chrome Valley](docs/media/scenes/valley.webp) |
| Five raymarch presets and eight materials, both picked from pads. | A Rosensweig spike field over a Fibonacci phyllotaxis cross-hatch. | A Chladni plate: sixteen mode pairs, adjacent modes blended. | An endless valley under a plasma sun, morphing into a spike field. |

| Quantum Lattice | Will I Dream | Nature's Tomb | Miracle Mile |
|---|---|---|---|
| ![Quantum Lattice](docs/media/scenes/lattice.webp) | ![Will I Dream](docs/media/scenes/willidream.webp) | ![Nature's Tomb](docs/media/scenes/naturestomb.webp) | ![Miracle Mile](docs/media/scenes/miraclemile.webp) |
| 373 nodes and 756 beams morphing between four geometries. | A big bang on the downbeat, then hyperspace, wormhole, black hole. | Fifteen plates on one knob: life, its end, then weather. | Four acts on one knob: collider, fission, detonation, shockwave. |

Three of the sixteen are shows rather than loops. Will I Dream opens dark on a
singularity, ignites on the first downbeat, and flies out through thirteen
celestial bodies and four things the flight can run into; the hand alone drives
the hyperspace jump, and whatever waits at the far end grows in as the star
trails come to rest. Nature's Tomb runs the order of life and then its end, from
a B-form double helix through the cell line, the mycelium and the slime mold to
the toxin, phagocytosis and decomposition, then out to the world: microscopy,
ocean currents, the day, and five weather systems. Miracle Mile starts inside a
particle detector and ends with a city under a mushroom cloud, and the wreck it
leaves persists until a rebuild.

Stills in this section are rendered by the offscreen scene harness from
[docs/media/gallery.plan.json](docs/media/gallery.plan.json). Provenance and the
regeneration command: [docs/media/README.md](docs/media/README.md).

## The cockpit

One page, always live. The stage renders behind every panel, drawer and modal,
and nothing in the interface interrupts a frame.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ SWAYCOMMAND  PROJECT   PLAY STOP  01:24.6  LOOP    MIRACLE MILE   58 fps │
├────────────┬──────────────────────────────────────────┬──────────────────┤
│ SCENES     │                                          │ ASSIGNMENT       │
│  16 tiles  │                                          │  the selected    │
│  keys 1..9 │                                          │  pad, knob,      │
│            │                S T A G E                 │  button or       │
│ AUTO       │      renders from boot to quit           │  gesture         │
│  RUN       │                                          ├──────────────────┤
│  HOLD      │                                          │ INPUT            │
│  18..40 s  │                                          │  source, meter,  │
│  FADE 4 s  │                                          │  three bands     │
├────────────┴──────────────────────────────────────────┴──────────────────┤
│ IMPORT  +TRACK  BPM 128  TAP  SNAP beat      1       2       3       4   │
│ SCENES │       [ voxels ][ miracle mile        ][ will i dream ]         │
│ DRUMS  │ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ │
│ BASS   │ ~~~~~~~~~~~~~~[ section: filter cutoff ]~~~~~~~~~~~~~~~~~~~~~~~ │
├──────────────────────────────────────────────────────────────────────────┤
│ K1 K2 K3 K4     ( ( ( (  sixteen IR sensors  ) ) ) )      K5 K6 K7 K8    │
│ 00 01 02 03          OLED   WHEEL   PRESETS               08 09 10 11    │
│ 04 05 06 07                                               12 13 14 15    │
└──────────────────────────────────────────────────────────────────────────┘
```

| Region | Contents |
|---|---|
| Top bar | Project menu, transport and clock, current scene, link and input pills, fps, and the SYNTH / RACK / KIT / DOCS / HELP buttons |
| Left rail | The scene bank, with digit hints on the first nine of the active pool, and the Auto-VJ group: RUN, a hold range in seconds, a crossfade time |
| Centre | The stage. A line-art blast door covers it while the Doctor runs, then opens once |
| Right rail | The assignment panel for the selected control, over the input box: analysis source, level meter, band display |
| Timeline band | Toolbar, one head per track, a bar and beat ruler with loop region and locators, a visual lane of scene clips, and one waveform lane per audio track |
| Deck | A stroke line-art schematic of the Sway. Clicking a control on it selects that control; touching the control on the hardware does the same |

Every region resizes from a grip on its inner edge, collapses to a thin strip
from a corner chip, and restores its default on a double-click. Sizes and
collapsed states persist in the settings file and survive solo view, which hides
everything but the stage on `O`.

## Playing it

### The Sway

The factory map was recovered from Audima's own artifacts (the Base Project V2
`.swayproj`, the official Ableton Live remote scripts, the Cubase MIDI Remote
script) rather than from published documentation. Any binding can be replaced by
MIDI-learn, which is also what makes any other class-compliant controller work.

| Surface | Factory MIDI | Role |
|---|---|---|
| Hand position over the rail | CC 50 (X), CC 38 (Y) | Continuous steering of the active scene, and two modulation routes |
| Pulse | CC 35 | Vertical bounce energy: a brightness surge, plus any routes bound to it |
| Press | CC 36 | Press depth: each scene's own crush or dive |
| Sway | CC 37 | Lateral sway: morphs the active scene's generative parameters |
| X-trigger and Y-modulation region | CC 73, CC 74 | A paired region, available as routes |
| Knobs 1 to 8 | CC 20 to 27 | Unassigned by default. Any engine, rack, synth, kit, track or scene parameter, with range and curve |
| Pads 0 to 15 | Notes 24 to 39 chromatic, or the B minor Theory Engine grid | A sample, a scene switch, a scene event, a momentary effect punch, or a grid-locked stem launch. Every strike is also the active scene's morph event |
| Buttons | Unpublished CCs, learned | Toggle anything: rack, Auto-VJ, synth, transport, track mute or solo |
| Sleep and wake | Program 37, 38 | Link pill state |

### Assignment

Selecting a control on the deck opens its panel on the right rail. Every
assignable destination in the application answers one target string, so the same
grammar covers the engine, the post chain, the instruments, the timeline and
anything a scene chooses to publish.

| Target | Reaches |
|---|---|
| `engine:hue`, `engine:intensity`, `engine:fadeTime` | Global palette rotation, output intensity, Auto-VJ crossfade time |
| `fx:<param>` | One of the 38 rack parameters. A control reaching for the rack switches the rack on, and clearing it switches the rack off again |
| `synth:<param>`, `sampler:<knob>` | The wavetable synth and the kit's four macro knobs |
| `scene:<sceneId>:<key>` | An action or parameter the scene declares in `meta.controls`. Actions fire only while that scene is on screen; parameters apply whenever they are set |
| `track:<id>:gain`, `:mute`, `:solo`, `:vstmix` | One timeline track |
| `track:<id>:<fxId>:<param>` | One parameter of one effect in that track's live chain |
| `transport:playPause`, `transport:stop` | The timeline |
| `gan:<plugin>:<control>[:x\|y\|z]` | A `.gan` plugin surface as a control **source**, driving anything above |

A knob carries a range and a curve. A gesture route wins over a knob on the same
target. Touching a control on the hardware selects it on screen, so binding is a
matter of reaching for the thing and pressing BIND.

### Timeline and tracks

The timeline holds any number of audio tracks and one visual lane. Dropping
files on the band creates one track per stem at the playhead, and tempo is
estimated on the first import. Clips are scheduled sample-accurately on the one
`AudioContext` clock, with the loop seam scheduled ahead so nothing drifts at
the wrap.

Each track carries a live effect chain built from 14 kinds: filter, delay,
reverb, distortion, bit crusher, trance gate, phaser, flanger, chorus, tremolo,
auto filter, compressor, three-band EQ and pan. Any parameter binds to a pad as
a held punch, to a knob as a continuous control, or to a gesture. Shift-dragging
on a track marks a section, a region where an effect engages by itself while the
playhead is inside it. Pads can also launch stems phase-locked to the grid, at
the next beat, bar, two bars or four.

VST3 plugins run through a pedalboard sidecar, rendered offline per track and
played back under a wet and dry mix. `.gan` surfaces from theDAW's Foundry load
in the plugins drawer and contribute their controls as route sources.

### Projects

A project is one JSON document with the `.sway` extension: palette, engine
settings, effects snapshot, synth patch, linked media, kit, timeline, linked
plugins, every control assignment and any MIDI overrides. Eleven templates ship
with the application, three of them tuned to pair with Audima's official Ableton
demo packs (Garage, DNB, Hip Hop). Format and schema:
[PROJECTS.md](docs/PROJECTS.md).

### Everything else on the deck

The rack is 38 post-processing parameters in five decks (Geometrics,
Corruption, Chromatics, Timecode, ASCII) applied to the composited frame. The
synth is a wavetable instrument with seven factory presets and a modulation
matrix, playable from the Sway or the keyboard row. The kit puts one sample per
pad across the sixteen pads with one-shot, loop and gate modes and choke groups.
Auto-VJ holds a scene for a randomised interval and then crossfades to another
from the project's pool, with the palette carried across the fade.

## Installation

| Platform | Minimum | Package |
|---|---|---|
| Windows | 10 (x64) | NSIS installer, `SwayCommand-Setup-<version>.exe` |
| macOS | 11 | DMG |
| Linux | glibc-based x64 | AppImage |

A WebGL2 GPU is required. Packaged builds install per user and need no
elevation; the Windows installer is one click and launches on completion.

Running from source needs no preparation on Windows: double-click
`SwayCommand.bat`. It opens a setup window that works out what
is already on the machine, installs only what is missing (including Node.js, as
a private copy that needs no administrator and touches no system PATH), and then
starts the app, with a progress bar and a time estimate measured from the work
actually in front of it. Everything it downloads is cached and checksummed, so a
second run installs nothing and launches straight away. The optional Sway
firmware-update driver can be staged from the same window. `-Console` runs it
without the window; `docs/INSTALLER-DIAGNOSIS.md` explains what it is working
around.

macOS and Linux use `SwayCommand.command` and
`SwayCommand.sh`, which need Node.js 18 or later already installed. Silent
installation and uninstallation are covered in
[INSTALLATION.md](docs/INSTALLATION.md).

At first launch the Doctor checks the system: the Sway over USB (including
firmware-update mode), WebGL2, WebMIDI, audio input, and the optional Audima
components, each with a one-click fix where one exists. Details:
[DOCTOR.md](docs/DOCTOR.md).

## Keys

| Key | Action |
|---|---|
| `1` to `9` | Select a scene from the active project's pool, disabling Auto-VJ |
| `Space` | Crossfade to another scene from the pool |
| `A` | Auto-VJ on or off |
| `Z X C V B N M ,` | Pads 0 to 7 |
| `P` / `L` / `I` | Play or pause / loop on or off / import stems |
| `Delete`, `Left`, `Right` | Remove or nudge the selected timeline clip or section |
| `S` / `R` / `E` / `G` | Synth, rack, kit and plugins drawers |
| `F` / `O` | Fullscreen / solo view, stage only |
| `H` / `D` / `K` | Controls modal, documentation, MIDI monitor (`M` is a pad key) |
| `A W S E D F T G Y H U J K O L P ;` | Play the synth, only while the synth drawer is open |
| `Esc` | Close the topmost layer: popover, drawer, modal, then selection |

Pointer input stands in for the Sway when none is bound: position on the stage
is XY, buttons are press, the wheel is pulse. In Will I Dream that means the
hyperspace jump is on the pointer too, since warp is the product of X and
closeness to the sensors, engaging past 0.55 and releasing under 0.25.

## Development

```sh
npm install                  # postinstall fetches the Electron runtime
npm run hooks                # activate .githooks (once per clone)
npm start                    # bundle the renderer, launch Electron
npm test                     # BLAKE2b and minisign, under Node
npm run test:electron        # the same tests under Electron's BoringSSL
npm run build:renderer       # dist/, the desktop bundle
npm run build:renderer:embed # dist-embed/, a static bundle a host app serves
npm run dist:win             # Windows installer
npm run dist:mac             # macOS DMG
npm run dist:linux           # Linux AppImage
```

Git hooks are not cloned, so `npm run hooks` points `core.hooksPath` at
`.githooks/`. The `commit-msg` hook rejects AI attribution trailers; real
co-authors are unaffected. Because a hook can be skipped with `--no-verify`, the
Checks workflow enforces the same rule on what a push actually adds, and keeps
the documentation free of dashes, arrows, ellipses and curly quotes.

Both test commands matter. Electron links BoringSSL and Node links OpenSSL, and
they disagree about which hashes exist, so a crypto test that passes under one
can fail under the other. Electron 43 also publishes no install hook of its own,
which is why `postinstall` fetches the runtime; without it `npm start` and the
harness have no binary to spawn.

Scenes are verified without launching the application. The offscreen harness
compiles a scene in a hidden Electron window, drives its `update()` with a
patched input snapshot for a set number of frames, and returns a PNG, the cost
per frame and any shader error:

```sh
node scripts/scene-harness.js <plan.json>
```

Packaged builds come from a tag. Pushing `v*` runs
[the release workflow](.github/workflows/release.yml), which builds the Windows
installer, both macOS disk images and the Linux AppImage on their own runners
and attaches them to a GitHub release. The builds are unsigned.

Build system: [BUILD.md](docs/BUILD.md). Environment variables, settings file
locations and network endpoints: [ENVIRONMENT.md](docs/ENVIRONMENT.md).

## Documentation

Every document below ships inside the application and renders in the
documentation modal, opened with `D` or the DOCS button, so the text always
matches the installed version.

| Document | Scope |
|---|---|
| [INDEX.md](docs/INDEX.md) | Documentation map and reading order |
| [OVERVIEW.md](docs/OVERVIEW.md) | System overview, the cockpit, terminology, component map |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Process model, module inventory, IPC surface, security model |
| [INSTALLATION.md](docs/INSTALLATION.md) | Packaged and from-source installation, uninstallation |
| [DOCTOR.md](docs/DOCTOR.md) | Every system check, detection method and fix action |
| [STUDIO.md](docs/STUDIO.md) | The drawers, the sample pool, tracks, sections and assignments |
| [SYNTH.md](docs/SYNTH.md) | The wavetable synth, its capability against Vital, theDAW alignment |
| [MIDI.md](docs/MIDI.md) | Device detection, factory map, MIDI-learn, the assignment router |
| [AUDIO.md](docs/AUDIO.md) | Analysis chain, signal sources, beat detection, the transport |
| [ENGINE.md](docs/ENGINE.md) | Render pipeline, crossfade compositor, effects rack, Auto-VJ, ColorMaster |
| [PROJECTS.md](docs/PROJECTS.md) | The `.sway` format, templates, the timeline model |
| [SCENE_CONTRACT.md](docs/SCENE_CONTRACT.md) | Scene module interface and authoring rules |
| [SWAY_INTEGRATION.md](docs/SWAY_INTEGRATION.md) | Sway USB identity, MIDI map, driver matrix, CDN interface |
| [BUILD.md](docs/BUILD.md) | Build scripts, packaging, release artifacts |
| [ENVIRONMENT.md](docs/ENVIRONMENT.md) | Environment variables, settings file, network endpoints |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Known issues and resolutions |
| [RESEARCH.md](docs/RESEARCH.md) | Source research record with citations |

## Privacy and network use

The application collects no telemetry and works offline. Its own network access
reaches Audima hosts only: a reachability check when the Doctor runs, and
downloads the user asks for. The companion installer is verified against
Audima's published minisign signature before it is opened. Links followed from
the documentation are handed to the system browser and refused unless the
hostname is on an allowlist; renderer navigation is disabled outright.

## Credits

| Project | Author | License | Contribution |
|---|---|---|---|
| [theDAW](https://github.com/gantasmo/theDAW) | GANTASMO | MIT and Apache-2.0 in parts | The web-native VJ engine approach and local-first design. The cymatics work behind Ferrofluid Orb, Cymatic Plate and Chrome Valley, and the lattice engine behind Quantum Lattice |
| VJ-9000 | GANTASMO | Author's own work | The spectrogram terrain behind Spectra, and the five raymarch presets and eight materials behind VJ Shader |
| [Akvj](https://github.com/keijiro/Akvj), [MetavidoVFX](https://github.com/keijiro/MetavidoVFX) | Keijiro Takahashi | Unlicense | The VfxController crossfade-cycling pattern, ColorMaster palette synchronisation, and the runtime effect-switcher architecture, reimplemented in three.js |

Individual scenes also carry ported CodePen work under MIT from Majid
Manzarpour, Matthias Hurrle, Luis Alberto Martinez Riancho, amCharts and others.
Every derived file states its upstream, its license and its changes in the file
header.

## Legal

SwayCommand is released under the [MIT license](LICENSE), copyright 2026 Daniel
Joaquin Trujillo and GANTASMO. Derived files stay under their own licenses and
carry the upstream notice in their headers. "Sway" and "Audima Labs" are the
property of Audima Labs Pty Ltd. In accordance with Audima's terms
and conditions the application bundles no Audima software: the Doctor downloads
the official driver package and companion application directly from
`cdn.audima.com.au` onto the local machine, and verifies the companion
application against Audima's published minisign signature before opening the
installer.

---

[![Listen on Spotify](https://img.shields.io/badge/Listen-Spotify-1DB954?style=flat-square&labelColor=0b0f17&logo=spotify&logoColor=white)](https://open.spotify.com/artist/4q5n0QgK6mvyuw8FRzhuNA)
[![Watch on YouTube](https://img.shields.io/badge/Watch-YouTube-FF0000?style=flat-square&labelColor=0b0f17&logo=youtube&logoColor=white)](https://www.youtube.com/@GANTASMO)
[![Follow @gantasmo on Instagram](https://img.shields.io/badge/Follow-%40gantasmo-E4405F?style=flat-square&labelColor=0b0f17&logo=instagram&logoColor=white)](https://www.instagram.com/gantasmo)
[![Follow @gantasmo on X](https://img.shields.io/badge/Follow-%40gantasmo-000000?style=flat-square&labelColor=0b0f17&logo=x&logoColor=white)](https://x.com/gantasmo)
[![Learn more at gantasmo.com](https://img.shields.io/badge/Learn%20More-gantasmo.com-7C3AED?style=flat-square&labelColor=0b0f17&logo=googlechrome&logoColor=white)](https://gantasmo.com)

Made by [Daniel Joaquin Trujillo](https://github.com/danieljtrujillo) and
[Josh Valenzuela](https://github.com/StarskreamEXE) as
[GANTASMO](https://gantasmo.com).
