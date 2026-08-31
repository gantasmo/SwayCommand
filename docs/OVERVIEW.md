# System overview

SwayCommand is an Electron application with two processes. The main process owns operating-system integration: window lifecycle, USB and registry inspection, downloads from Audima's CDN, driver installation, the settings file, and `.sway` project file I/O. The renderer process owns everything visible and audible: the cockpit interface, MIDI input, audio analysis, sample and synth playback, timeline transport, and the WebGL render pipeline. The two communicate over a fixed IPC surface exposed through a context-isolated preload script.

The application is one page, the cockpit, and it is always live. There is no screen flow: the stage renders from the first frame to quit, and every panel, drawer, and modal works on top of it without stopping the render loop. At startup the stage is covered by a line-art blast door while the SYSTEM modal runs the Doctor checks; ENTER (or auto-advance when every check passes) opens the door onto a loaded project, the most recent one, or the First Flight template on a fresh install.

## The cockpit

| Region | Contents |
|---|---|
| Top bar | Wordmark; the project button (opens the project menu: New, Open, Save, Save as, recent files, templates); the transport (play/pause, stop, clock, LOOP); the current scene readout; status pills (`SWAY`/`MIDI`/`KEYS` link, `LOOPBACK`/`LINE`/`GROOVE`/`MUTE` input, fps); the deck buttons SYNTH, RACK, KIT, DOCS, HELP |
| Left rail | The SCENES bank (all sixteen registry scenes, with digit hints on the first nine of the active pool; a click switches the stage, a drag onto the timeline lays a clip. The AUTO group) RUN toggle, HOLD min-max seconds, FADE seconds |
| Center | The stage canvas. The blast door covers it at boot and opens once |
| Right rail | The assignment panel for the selected control, and the INPUT box: the analysis-source button, a level meter, and an audio-reactive band display |
| Bottom band | The timeline: a toolbar (IMPORT, + TRACK, BPM, TAP, SNAP), a head column (SCENES, then one head per audio track with M / S), a ruler in bars and beats (scrub, loop region, locators), a VISUAL lane of scene clips, one lane per audio track with waveforms and effect sections, and the playhead |
| Below the band | The Sway deck: a stroke line-art schematic of the hardware. Clicking any control on it (or touching the control on the hardware, with FOLLOW on) selects it for assignment |

Every region around the stage is adjustable (`src/renderer/ui/layout.js`). Thin grips on the inner edge of each rail, the top edge of the timeline band and of the deck, and the seam between the assignment panel and the INPUT box drag to resize; double-clicking a grip restores that dimension's default. A chevron chip in each region's top corner collapses it to a thin strip (a rail to an 18 px column, a band to its ruler line or an 18 px bar, a right-rail panel to its header line) and expands it again at the size it had. Sizes and collapsed states persist across sessions in the settings file (`layout` key) and compose with solo view: `O` hides everything, and the collapsed states are still there when it returns.

Three surfaces overlay the cockpit:

- **Drawer**, SYNTH (`S`), RACK (`R`), KIT (`E`). Opens inboard of the right rail; the stage keeps rendering behind it.
- **Modals**, SYSTEM (the Doctor), CONTROLS (`H`), DOCS (`D`). The SYSTEM modal is also reachable from the CONTROLS modal.
- **Popovers**, the project menu and the analysis-source list.

`Esc` peels one layer at a time: popover, then drawer, then the topmost modal, then the timeline selection, then the deck selection.

## Purpose and scope

The Sway (Audima Labs Pty Ltd) is a gesture-based MIDI controller: sixteen infrared distance sensors translate hand positions above the unit into MIDI continuous controllers and notes. Audima ships a companion application for preset editing and firmware updates, DAW integration scripts, and demo packs, but no visual-performance software. SwayCommand supplies that layer: a self-contained VJ instrument mapped to the Sway's factory MIDI assignments, playable immediately after installation.

The Sway is optional at every point. All Sway controls have mouse, keyboard, and generic-MIDI equivalents, and the audio-analysis layer synthesizes an internal signal when no input device is available, so every scene renders meaningful output on a machine with no peripherals at all.

## Terminology

| Term | Definition |
|---|---|
| Sway | Audima Labs' gesture MIDI controller. USB `VID 0x0483`, `PID 0x52A4` in normal operation; `PID 0xDF11` in firmware-update (DFU) mode. |
| Sway Software | Audima's companion application for preset editing and firmware updates. Optional; not required by SwayCommand. |
| Doctor | The system check and remediation list shown in the SYSTEM modal. See [DOCTOR.md](DOCTOR.md). |
| cockpit | The single always-live page: top bar, rails, stage, timeline band, Sway deck. |
| deck | The on-screen schematic of the Sway hardware at the bottom of the cockpit; the control-selection surface. |
| drawer | The panel that opens inboard of the right rail and holds the SYNTH, RACK, and KIT surfaces. See [STUDIO.md](STUDIO.md). |
| documentation modal | The `#modal-docs` overlay. It renders the Markdown files enumerated by `DOC_ORDER` in `src/main/main.js`, requested over the `docs:list` and `docs:read` IPC channels. |
| scene | A self-contained procedural visual module conforming to [SCENE_CONTRACT.md](SCENE_CONTRACT.md). |
| project | A `.sway` file: one JSON document holding palette, engine settings, effects snapshot, synth patch, media list, kit, timeline, and assignments. See [PROJECTS.md](PROJECTS.md). |
| template | A read-only bundled project (`projects/templates/*.sway`) reachable from the project menu; the former factory presets. |
| assignment | What a control does: a pad action (a sample, a scene switch, a scene event, an effect punch), a knob target, a button toggle, or a gesture route. Targets span the engine, the effects rack, the synth, the kit, and any event or parameter a scene declares. Stored in the project. See [STUDIO.md](STUDIO.md). |
| router | The single dispatch point between the control surface and everything playable (sampler, synth, engine, effects rack, transport): `src/renderer/control/router.js`. |
| transport | Timeline playback: audio clips on any number of tracks scheduled on the one `AudioContext` clock, each track through its live effect chain, visual clips fired at the router, stems launched from pads on the grid. `src/renderer/audio/transport.js`. |
| track | One audio lane of the timeline: clips, a live effect chain, a rendered VST3 chain with a wet / dry mix, and sections (regions that engage an effect parameter). See [STUDIO.md](STUDIO.md#tracks-effects-and-sections). |
| `.gan` | GANTASMO's portable web-plugin (a control surface from theDAW's Foundry); loads into the PLUGINS drawer and contributes route sources. See [STUDIO.md](STUDIO.md#plugins-gan-surfaces-and-vst3). |
| factory map | The Sway's default MIDI assignments, recovered from Audima's own artifacts. See [SWAY_INTEGRATION.md](SWAY_INTEGRATION.md). |
| control state | The normalized input snapshot (XY, gestures, knobs, pads) shared between the MIDI layer and the engine. |
| Auto-VJ | The scheduler that holds a scene for a randomized interval, then crossfades to another scene from the project pool. The AUTO group in the left rail exposes it. |
| ColorMaster | The global five-color palette instance that every scene reads each frame. |
| effects rack | The post-processing chain (38 parameters in five decks) applied to the composited frame when enabled. `src/renderer/engine/fxrack.js`. |
| internal groove | A synthesized 120 BPM rhythm routed only into the analyser node; inaudible, used when no audio input is available. |
| quality tier | A particle/instance budget preset passed to scenes at creation: `low` (8,000), `med` (30,000), `high` (80,000). |

## Component map

| Layer | Module | File | Reference |
|---|---|---|---|
| Main | Application entry, window, IPC | `src/main/main.js` | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Main | `.sway` file I/O, templates, recents | `src/main/projectfile.js` | [PROJECTS.md](PROJECTS.md) |
| Main | System checks | `src/main/doctor.js` | [DOCTOR.md](DOCTOR.md) |
| Main | Audima CDN client, minisign verification | `src/main/audima.js` | [DOCTOR.md](DOCTOR.md), [SWAY_INTEGRATION.md](SWAY_INTEGRATION.md) |
| Main | DFU driver installation (Windows) | `src/main/driver-install.js` | [DOCTOR.md](DOCTOR.md) |
| Bridge | IPC surface | `src/preload/preload.js` | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Shared | `.sway` schema, defaults, validation | `src/shared/swayproject.js` | [PROJECTS.md](PROJECTS.md) |
| Renderer | Cockpit assembly, keyboard/pointer input, modals | `src/renderer/app.js` | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Renderer | Deck schematic, assignment panel, drawer, timeline band | `src/renderer/ui/*.js` | [STUDIO.md](STUDIO.md) |
| Renderer | Project document lifecycle | `src/renderer/project/projectstore.js` | [PROJECTS.md](PROJECTS.md) |
| Renderer | Assignment router | `src/renderer/control/router.js` | [MIDI.md](MIDI.md), [STUDIO.md](STUDIO.md) |
| Renderer | Timeline transport | `src/renderer/audio/transport.js` | [AUDIO.md](AUDIO.md), [PROJECTS.md](PROJECTS.md) |
| Renderer | Markdown rendering for the documentation modal | `src/renderer/markdown.js` | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Renderer | MIDI detection, routing, MIDI-learn | `src/renderer/midi/midi.js`, `src/renderer/midi/swaymap.js` | [MIDI.md](MIDI.md) |
| Renderer | Audio analysis | `src/renderer/engine/audio.js` | [AUDIO.md](AUDIO.md) |
| Renderer | Sample playback (kit) | `src/renderer/audio/sampler.js` | [STUDIO.md](STUDIO.md) |
| Renderer | Wavetable synth | `src/renderer/audio/synth.js`, `src/renderer/audio/wavetables.js` | [SYNTH.md](SYNTH.md) |
| Renderer | Render pipeline, Auto-VJ | `src/renderer/engine/engine.js` | [ENGINE.md](ENGINE.md) |
| Renderer | Effects rack | `src/renderer/engine/fxrack.js` | [ENGINE.md](ENGINE.md) |
| Renderer | Palette management | `src/renderer/engine/colormaster.js` | [ENGINE.md](ENGINE.md) |
| Renderer | Visual scenes | `src/renderer/engine/scenes/*.js` | [SCENE_CONTRACT.md](SCENE_CONTRACT.md) |
| Content | Bundled templates | `projects/templates/*.sway` | [PROJECTS.md](PROJECTS.md) |
| Content | Bundled documentation | `docs/*.md`, `README.md` | [INDEX.md](INDEX.md) |
| Build | Renderer bundling, icon generation, packaging | `scripts/`, `electron-builder.yml` | [BUILD.md](BUILD.md) |

## External interfaces

The application fetches from Audima's hosts only:

| Endpoint | When | Purpose |
|---|---|---|
| `https://cdn.audima.com.au/software/latest.json` | Doctor run (startup and re-run) | Reachability check; resolves the current Sway Software version and download URLs |
| Companion binary URL from the manifest, or pinned fallbacks | "Download from Audima" fix only | Fetches the Sway Software installer to the local Downloads folder; the minisign signature is verified before the installer is opened |
| `https://cdn.audima.com.au/software/Windows%20DFU%20Driver.zip` | "Install DFU driver" fix only (Windows) | Fetches Audima's official STM32 bootloader driver package |
| `https://audima.com.au/downloads/`, user-manual PDF | Fallback fix actions | Opened in the system browser |

All requests to Audima hosts carry the User-Agent `SwayCommand/0.1 (Sway companion; +https://github.com/swaycommand)`; the CDN rejects generic tool User-Agents. Requests to any other host are refused by the download layer, and renderer navigation is disabled entirely. The application collects no telemetry and writes no data outside its own settings directory, the Downloads folder (user-initiated), the user's chosen project locations, and a driver cache under the settings directory.

Handing a link to the system browser is the second, user-initiated path outward. `shell.openExternal` accepts an `https` URL only when its hostname matches an entry in `EXTERNAL_ALLOW` in `src/main/main.js`, or is a subdomain of one: `audima.com.au`, `github.com`, `githubusercontent.com`, `nodejs.org`, `community.polyexpression.com`, `discord.com`, `vidvox.net`, `huggingface.co`, `unity.com`, `resolume.com`, `st3nd.com`, `serato.com`, `synesthesia.live`, `elektronauts.com`, `indiegogo.com`, `gantasmo.com`, `spotify.com`, `youtube.com`, `instagram.com`, `x.com`, `electronjs.org`, `threejs.org`. The list covers the hosts cited by the bundled documentation, so links in the documentation modal resolve without widening the policy to arbitrary URLs. A link outside the list is refused; the modal then shows an inline notice naming the URL so the reader can open it manually.

## Data locations

| Item | Location |
|---|---|
| Settings (`settings.json`; holds `midiOverrides`, `recentProjects`, `lastProjectDir`, and any legacy `kit`) | Electron `userData`: `%APPDATA%\SwayCommand` on Windows, `~/Library/Application Support/SwayCommand` on macOS, `~/.config/SwayCommand` on Linux |
| Default save location for `.sway` projects | `~/Documents/SwayCommand Projects` (created on first save; any location outside the application directory is accepted) |
| Bundled templates | `projects/templates/` at the package root; inside `resources/app.asar` in packaged builds |
| Downloaded Sway Software installer | The system Downloads folder |
| DFU driver package cache | `<userData>/audima/` |
| Documentation read by the modal | `README.md` and `docs/*.md` at the package root; inside `resources/app.asar` in packaged builds |
| Installed application (Windows) | `%LOCALAPPDATA%\Programs\swaycommand` |
