# Studio: drawers and assignments

The Studio screen of earlier builds is gone. Its contents now live in two always-available cockpit surfaces: the **drawer** (SYNTH, RACK, and KIT panels that open inboard of the right rail without stopping the render loop) and the **assignment panel** in the right rail, which edits what the currently selected control does. This document covers both, plus the deck as the selection surface.

Implementation: the drawer shell in [`src/renderer/ui/drawer.js`](../src/renderer/ui/drawer.js), the deck schematic in [`src/renderer/ui/surface.js`](../src/renderer/ui/surface.js), the assignment panel in [`src/renderer/ui/assign.js`](../src/renderer/ui/assign.js), the dispatch layer in [`src/renderer/control/router.js`](../src/renderer/control/router.js), and sample playback in [`src/renderer/audio/sampler.js`](../src/renderer/audio/sampler.js).

## The drawer

| Panel | Key | Contents |
|---|---|---|
| SYNTH | `S` | Enable toggle, preset selector, on-screen keys, the parameter decks generated from the synth's control manifest, and the modulation matrix. Details: [SYNTH.md](SYNTH.md). |
| RACK | `R` | The effects rack: ACTIVE toggle, RESET, and the 38 parameters in their five decks (Geometrics, Corruption, Chromatics, Timecode, ASCII), generated from the rack's exported range table. Pipeline placement: [ENGINE.md](ENGINE.md). |
| KIT | `E` | The sample pool and its LOAD button (below). |
| PLUGINS | `G` | `.gan` control surfaces from theDAW's Foundry and the VST3 host status and plugin list ([Plugins](#plugins-gan-surfaces-and-vst3)). |

The deck buttons in the top bar toggle the same panels and show which one is open. Panel content renders lazily on first open; `Esc` or the close button closes the drawer. While the SYNTH drawer is open, the tracker key row `A W S E D F T G Y H U J K O L P ;` plays the synth; those keys return to the cockpit shortcuts the moment the drawer closes.

## The deck as control surface

The Sway deck at the bottom of the cockpit is a stroke line-art schematic of the hardware: the rear LED beam, the IR sensor field with the hand dot, the gesture chips X, Y, PULSE, PRESS, SWAY, eight knobs with value arcs, sixteen pads, and eight mappable buttons. (The center preset row, display, and scroll wheel are drawn for orientation but are device-local (nothing in SwayCommand maps them.) Every interactive element carries a control id) `pad:0`...`pad:15`, `knob:0`...`knob:7`, `button:0`...`button:7`, `xy:x`, `xy:y`, `gesture:pulse`, `gesture:press`, `gesture:sway`.

Clicking a control on the deck selects it in the assignment panel. With **FOLLOW** on (the default), touching a control on the hardware selects it too: the router records the last physically moved control (a pad strike, a knob past a small movement threshold, a learned button, or a factory-mapped continuous CC) and the panel follows. FOLLOW pauses while a popover is open.

## The KIT panel and the sample pool

The kit maps audio files onto the sixteen pads. A pad strike plays its sample and drives the visuals at the same time, because the sampler's output is connected both to the speakers and to the analyser.

1. **LOAD** opens the OS file dialog, filtered to `wav`, `mp3`, `flac`, `ogg`, `m4a`, `aac`, `aiff`, `aif`, `opus`, and `webm`. Files above 256 MB are rejected with their size in the message.
2. Each picked file becomes a media entry in the project ([PROJECTS.md](PROJECTS.md)) and is decoded into the sample pool; the list shows name, duration, and channel count.
3. Select a sample in the list, then click a pad on the deck to place it. The pad's mode, gain, and choke settings are edited in the assignment panel.
4. Drag a sample from the list onto a timeline track to lay it as a clip there instead. (Whole stems go in through the timeline's own IMPORT, or by dropping files on the band, [Tracks, effects and sections](#tracks-effects-and-sections).)

Sample data is never copied into the settings directory or the project file, only paths are stored, project-relative when possible. A saved kit from a pre-cockpit build (the `kit` key in `settings.json`) is still restored at startup: its files are re-read by path, missing files are reported to the console, and restored pads receive sample assignments.

## The assignment panel

The panel header names the selection, PAD *n*, KNOB *n*, BUTTON *n*, X, Y, PULSE, PRESS, or SWAY, and carries up to four chips: **FOLLOW** (hardware touch selects here), **LEARN** (bind the next incoming CC; shown for continuous controls and buttons), **UNLEARN** (shown only when the selected dimension carries a learned override, drops it and falls back to the factory map), and **CLEAR** (remove the selection's assignment). All edits mutate the project's assignment table in place, the router holds the same references, and mark the project dirty.

### Pads

A pad's ACTION is one of:

| Action | Fields | Behavior |
|---|---|---|
| sample | SAMPLE, MODE, GAIN, CHOKE, TRIG | Plays the chosen sample. MODE: `one-shot` plays to the end; `loop` toggles a looping voice on alternate strikes; `gate` plays while held. GAIN 0 to 1.5 scales the voice (strike velocity scales it further). CHOKE: pads sharing a non-empty group cut each other, the closed-hat-cuts-open-hat behavior. TRIG auditions the pad. |
| visual | VISUAL, ENTRY | Switches the stage to the chosen scene and disables Auto-VJ. ENTRY is `cut` (instant) or `fade` with a duration in seconds. |
| punch | PARAM, VALUE | Momentary effect: while the pad is held, the chosen numeric rack parameter is forced to VALUE; on release the previous value is restored. The router re-asserts a held punch every frame so nothing overwrites it mid-hold. |
| scene event | EVENT | Fires one of the active scene's own events, a black hole, a hyperspace jump, an organism change. Events are grouped by scene and come from each scene's `meta.controls` ([SCENE_CONTRACT.md](SCENE_CONTRACT.md#the-scene-control-surface)); the panel says whether the chosen scene is the one on stage, because an event only reaches a scene that is actually visible. |
| stem (in sync) | STEM, START, MODE, THROUGH, GAIN | Launches a project media file **phase-locked to the timeline grid**: the stem starts on the next beat / bar / two bars / four bars (START) at the offset the grid dictates (it plays as if it had been running from the timeline's zero) so a stem fired mid-song lands in time with every other stem and with the clips. MODE `toggle` stops it on the next strike (on the grid again), `hold` plays it while the pad is down. THROUGH routes it into a track's effect chain, or the plain stem bus. Launching a stem starts the transport if it was stopped. The pad label shows `...` while the stem waits for its boundary and `▶` once it is in. |
| track punch | PARAM, VALUE | Momentary effect on a **track**: while the pad is held the chosen parameter of one of the track's effects (or the track's VST wet / dry mix) is forced to VALUE, and restored on release. The BIND chip on a track-effect parameter writes one of these onto the next pad you click. |

An assigned pad no longer double-fires the synth, see [Note routing](#note-routing).

### Knobs

A knob drives one continuous TARGET, chosen from five groups:

| Group | Targets |
|---|---|
| ENGINE | palette hue, fade length, intensity (`engine:hue`, `engine:fadeTime`, `engine:intensity`) |
| RACK | every numeric effects-rack parameter (`fx:<key>`) |
| SYNTH | every range parameter in the synth's control manifest (`synth:<key>`) |
| KIT | kit level, kit filter, kit rate, kit delay (`sampler:master`, `sampler:cutoff`, `sampler:rate`, `sampler:send`) |
| TRACK · *name* | one group per timeline track: its level (`track:<trackId>:gain`), its VST wet / dry when it has plugins (`track:<trackId>:vstmix`), and every parameter of every effect in its chain (`track:<trackId>:<fxId>:<param>`) |
| *scene name* | every parameter that scene declares in `meta.controls.params` (`scene:<sceneId>:<key>`), one group per scene that has any |

RANGE sets the min-max the 0 to 1 knob position maps into (picking a target preloads its natural range). CURVE is `linear` or `center detent`; the detent maps the exact center of travel to zero, the semantics the hue knob has always had. Knob dispatch is change-driven: an idle knob never fights an edit made in a drawer panel.

There is no default knob table: a new project's knobs are empty, so nothing drives an effect, the intensity, or anything else until it is assigned, and clearing a control resets the effect it was driving, the rack switches off again if a control had switched it on and nothing drives it any more (the router reconciles this every frame). Templates carry their own tables: the factory presets map hue (knob 1, center detent), fade length (knob 2, 1 to 8 s), and kit level (knob 8); `will-i-dream` maps nothing. Driving any rack target still switches the rack on, so a knob mapped to glitch never turns silently in a disabled chain; the four kit targets stay available in the picker.

### Buttons

The Sway's eight mappable buttons transmit CC numbers that Audima has not published, so a button slot starts empty and **LEARN captures it**: arm LEARN, press the hardware button, and its CC (and channel) binds to the slot. The button then executes a toggle TARGET on each press (rising edge):

| Target | Toggles |
|---|---|
| rack active | the effects rack on/off (`engine:fxEnabled`) |
| auto rotation | Auto-VJ (`engine:autoVJ`) |
| synth notes | whether notes reach the synth (`synth:enabled`) |
| play / pause | the transport (`transport:playPause`) |
| stop | the transport (`transport:stop`) |
| any boolean rack parameter | that parameter (`fx:<key>`) |
| a track's mute or solo, or an effect's on / off | `track:<trackId>:mute`, `track:<trackId>:solo`, `track:<trackId>:<fxId>:enabled`, one group per track |
| any scene event | fires it, momentarily, on the scene that owns it (`scene:<sceneId>:<key>`), a scene event is a trigger, not a switch, so the deck never lights for one |

The deck lights a button whose toggled state is currently on.

### Gesture dimensions

X, Y, PULSE, PRESS, and SWAY each hold a list of modulation ROUTEs. A route maps the dimension's 0 to 1 value through a DEPTH min-max onto any continuous target from the same groups knobs use; a checkbox enables or disables it, and ADD ROUTE appends another. A dimension can drive any number of targets at once. Routes are applied every frame **after** knob dispatch, so on a shared target the gesture wins over the knob. The control outputs of a `.gan` plugin surface are route sources of the same kind (`gan:<pluginId>:<controlId>`, with `:x` / `:y` / `:z` for an XY field), see [Plugins](#plugins-gan-surfaces-and-vst3).

## Tracks, effects and sections

The timeline band is where stems go in and where effects are put on them; the assignment panel edits whatever the band selects. The flow the design aims at: **add a track or stems -> put an effect on the track (or on a section of it) -> BIND the effect to a pad, a knob or a gesture.**

**Stems in.** IMPORT on the band (or `I`, or dropping audio files from the desktop anywhere on the band) lays every file down as its own track at the playhead, snapped to the grid; the track takes the file's name. Dropping onto a particular track lays the file on that track. The first import into a session that has no tempo estimates the BPM from the longest file (onset autocorrelation) and sets it; BPM is editable on the band and TAP taps it in. SNAP chooses the grid everything lands on, bar, beat, 1/2, 1/4, or off. Every stem on every track is scheduled from the one audio clock, so stems stay in sync with each other and with the loop seam, which is itself scheduled ahead on the audio clock. `+ TRACK` adds an empty track; a track head shows M (mute) and S (solo), click selects the track, double-click renames it.

**The track panel** (click a track head): NAME, LEVEL (with BIND), MUTE / SOLO, DELETE; the EFFECTS chain; the VST3 chain; the track's SECTIONS. Effects come from a fixed set of live Web Audio processors (filter, delay, reverb, distortion, bit crusher, trance gate, phaser, flanger, chorus, tremolo, auto filter, compressor, three band eq, pan) each with a handful of parameters (tempo-synced ones follow the BPM: delay time, gate rate, tremolo and auto-filter rates are in beats). Entries can be switched ON / OFF, reordered, removed; every parameter row carries a **BIND** chip. BIND arms the next control you select on the deck (or touch on the Sway): a pad becomes a *track punch* to the parameter's full value (its current value for non-mix parameters), a knob becomes a continuous control over the parameter's range, a gesture chip or a `.gan` control becomes a route. A bound parameter's readout turns magenta and the chip shows ●. `Esc` cancels an armed BIND.

**Sections.** Shift+drag across a track on the band marks a section, a region on the track that engages one parameter of one effect (or the track's VST wet / dry) at a value while the playhead is inside it, and lets go when it leaves. The section's panel picks the effect, the parameter, the value and the exact start / end; the band draws sections as a magenta band across the top of the track row; drag moves one, its trailing edge resizes it, `Delete` removes the selected one. A section needs an effect on the track first.

**VST3** on a track is a rendered chain, not a live one (there is no native host in the application): add plugins under VST3, set them with PARAMS (inline) or EDIT (the plugin's own window, whose state is captured when it closes), press RENDER, and every stem on the track is written through the chain once to a wet file that the transport plays beside the dry stem under the track's **wet / dry** mix, which is what BIND, a pad punch, a knob or a section drives live. Changing a plugin or its parameters marks the renders stale; RE-RENDER refreshes them. How the host is found is in [Plugins](#plugins-gan-surfaces-and-vst3).

## Plugins: .gan surfaces and VST3

The PLUGINS drawer (`G`) holds the two ways theDAW's plugin world reaches this application.

**`.gan` web-plugins** are GANTASMO's portable control surfaces (a ZIP with `manifest.json`, an `index.html` and assets, exported by theDAW's Foundry (The Owl and Ares ship that way). LOAD .gan (or dropping a `.gan` file on the window) unpacks one into the user data directory, links it into the project (`project.plugins`), and renders its page in the drawer's frame through the `gan://` protocol. The surface posts `{ type: 'updateValue', id, value }` (or `valueX` / `valueY` / `valueZ` for an XY field) as its knobs, pads and fields move; every control id the manifest declares becomes a route source) click a control in the list (or move it on the surface, with FOLLOW on) and the assignment panel shows its routes. A `.gan` is a controller, not a processor: it drives targets, it does not process audio.

**VST3** plugins are hosted through [pedalboard](https://github.com/spotify/pedalboard) (the same library theDAW's MIX chain uses) in a sidecar process (`src/main/vst-host.py`, driven by `src/main/vsthost.js`). The application looks for a Python that can `import pedalboard`: theDAW's own environment beside this repository, a previously chosen interpreter, or `py` / `python3` / `python`; PYTHON... picks one by hand. The drawer shows the host status and the scanned VST3 list (the standard VST3 folders; RESCAN re-reads them). pedalboard's built-in effects ride along as `builtin:<Name>` entries so a machine with no VST3 installed still has a chain to render. Renders land in the user data directory (`renders/`, named by a hash of the input and the chain state, so an unchanged chain reuses its file) and are linked into the project as media.

## LEARN and persistence

LEARN on a continuous control (a knob, X, Y, or a gesture chip) rebinds it to the next incoming CC, this is what makes any class-compliant controller a full replacement for the Sway. Learned overrides are stored twice: in `settings.json` (device-level, applied at startup) and in the project's `midiOverrides` (so a `.sway` file carries its bindings). A button LEARN captures the CC into the button slot only; the throwaway continuous override it records is removed immediately so a button press never drives a knob path. Mechanics of the underlying learn call: [MIDI.md](MIDI.md).

A learn that lands on the wrong dimension is undone with **UNLEARN**, which appears on the header whenever the selected control carries an override: it removes that one binding and writes the reduced set back to `settings.json`, so the control falls back to its factory CC. This matters because an override does not replace the factory binding for its target (it adds one) so learning, say, Y onto the CC the surface sends for X leaves X driven by nothing and both CCs fighting over Y until the override is dropped.

## Note routing

`assignments.noteRouting.synth` decides which incoming notes reach the synth:

| Mode | Behavior |
|---|---|
| `always` | Every note plays the synth, assigned pads included. |
| `unassigned` (default) | Notes whose pad has an assignment do not reach the synth, a kit pad no longer doubles as a synth key. Free pitches (notes outside the pad range, such as the Sway's Theory Engine notes) always reach it. |
| `off` | No notes reach the synth. |

Note-offs are released unconditionally in every mode, so a voice can never hang after a mode change. The SYNTH drawer's enable toggle (and the `synth:enabled` button target) gates the same path.

## Sampler internals

Voices are polyphonic with a 32-voice cap; the oldest voice is stolen when the cap is reached. Triggering an unassigned pad, an out-of-range index, or a pad whose sample was removed is a no-op.

```
AudioBufferSourceNode -> voice gain -> master lowpass -> master gain -> speakers
                                                                    -> analyser (drives the visuals)
                                            delay send -> feedback -> master gain
```

The four KIT targets map onto this chain: level -> master gain, filter -> low-pass cutoff, rate -> playback rate, delay -> delay send. Their current positions are saved in the project (`sampler.knobs`) and restored on load.
