# MIDI input

The MIDI layer lives in two renderer modules: [`src/renderer/midi/midi.js`](../src/renderer/midi/midi.js) (device binding, message routing, MIDI-learn, monitor) and [`src/renderer/midi/swaymap.js`](../src/renderer/midi/swaymap.js) (the factory map and the control-state constructor). Above it sits the assignment router, [`src/renderer/control/router.js`](../src/renderer/control/router.js), the single dispatch point between the control surface and everything playable. Consumers never read raw MIDI: continuous values land in the control state (which the engine reads through `attachControl()`), and discrete events flow through the router. Hardware provenance for every factory binding: [SWAY_INTEGRATION.md](SWAY_INTEGRATION.md).

## Event flow

```
hardware MIDI ─┐
keyboard pads ─┼─> router ──> sampler   (pad sample actions)
timeline      ─┘      ├────> synth     (note routing, bend, mod wheel)
                      ├────> engine    (scene actions, engine params, Auto-VJ)
                      ├────> fx rack   (knob targets, punches, button toggles)
                      └────> transport (play/pause and stop toggles)
```

The MIDI module's `onEvent` callback is the router's `handleMidiEvent`; the keyboard pad keys call the same function, so keys and hardware take one dispatch path; the transport's visual-lane events arrive through a separate subscription but land in the same module. Continuous control (XY, gestures, knobs) additionally flows through the control state into the engine's per-frame `io`, where the router's frame hook reads it back for knob and gesture dispatch.

## Device detection and binding policy

`createMidi()` requests WebMIDI access with `navigator.requestMIDIAccess({ sysex: false })`. Two flags describe the outcome:

| Flag | Meaning |
|---|---|
| `supported` | `navigator.requestMIDIAccess` exists in this runtime |
| `available` | the access request succeeded; input ports can be bound |

When the API is absent, or the request fails (the failure is logged as a console warning), the layer stays inactive; the control state still exists and mouse/keyboard input drives it (see [Mouse and keyboard equivalents](#mouse-and-keyboard-equivalents)).

A port is recognized as a Sway when its name contains the exact string `Audima Labs The Sway` (`SWAY_PORT_NAME` in `swaymap.js`), tested with `String.prototype.includes()`. The substring match covers Windows and macOS, where the port name equals that string, and Linux/ALSA, where the rawmidi layer typically appends ` MIDI 1`. Port-name provenance: [SWAY_INTEGRATION.md](SWAY_INTEGRATION.md#midi-port-name-per-os).

The `rescan()` routine clears all existing `onmidimessage` handlers, then binds according to one rule: when a Sway port is present, the Sway is bound exclusively; when no Sway is present, every available input port is bound, so any class-compliant controller drives the performance. Hot-plug and hot-unplug are handled by `access.onstatechange`, which triggers a full rescan.

Each rescan writes three connection fields into the control state:

| Field | Value |
|---|---|
| `connected` | `true` when at least one input is bound |
| `isSway` | `true` when the bound port matched the Sway name |
| `portName` | the Sway port name; otherwise a comma-joined list of all bound port names; `null` when nothing is bound |

The link pill in the top bar reads these fields: `SWAY`, `MIDI`, or `KEYS`, or `BUSY` when a bound port exists but another process already holds it (Windows allows one opener per MIDI input; the MIDI layer opens every bound input explicitly, and a failed open sets `control.busy`, logs `PORT BUSY <name>` in the MIDI monitor, and lights the pill BUSY until the other process lets go and the port is re-bound). Close the other application, or a leftover headless instance of this one, then unplug and replug the Sway, or restart the application.

## Message routing

The message handler ignores the MIDI channel for routing; messages on any channel are accepted. Every incoming message stamps `control.lastEventAt` with `performance.now()`.

| Message | Condition | Handling |
|---|---|---|
| Control Change (`0xB0`) | a learn is pending | The CC number is captured as the binding for the pending target; the value is not applied. |
| Control Change (`0xB0`) | no learn pending | The CC number is resolved to a continuous target, learned overrides first, then the factory map, and the target is written into the control state as `value / 127`. CC 1 additionally emits a `mod` event (the synth's mod-wheel source). Every CC then emits a `cc` event `{ cc, value, channel, target }`, the router matches learned button bindings and touch-to-select on it. |
| Note On (`0x90`, velocity > 0) | n/a | If the note resolves to a pad, `pads[index] = velocity / 127` and `lastPad = index`. Two events fire: `pad` `{ idx, vel }` (with `idx = -1` when no pad matched) and `note` `{ note, vel, channel, idx }`, the raw pitch rides along so note routing can tell an assigned pad from a free pitch. |
| Note Off (`0x80`, or `0x90` with velocity 0) | n/a | Emits `noteoff` `{ note, channel, idx }`. Pad values decay in the engine, but a gate-mode pad needs the release, and a synth voice must be released. |
| Pitch bend (`0xE0`) | n/a | Emits `bend` with the 14-bit value scaled to 0..1 (center 0.5). |
| Program Change (`0xC0`) | program 37 / 38 | `control.awake = false` / `true` (the Sway's sleep and wake announcements). |
| Any other status | n/a | Not handled. |

Pad-index resolution for notes tries two lookups in order:

1. Chromatic range: notes 24 to 39 map to pad indices 0 to 15 (`note - 24`). This is the layout Audima's own Ableton demo packs use and the layout SwayCommand normalizes to.
2. Factory B-minor table: the note is looked up in the Theory Engine grid `47 49 50 52 54 55 57 59 61 62 64 66 67 69 71 73`; its position is the pad index. A note in neither set resolves to no pad.

## The assignment router

`createRouter()` owns the project's assignment table ([STUDIO.md](STUDIO.md) documents the editing surface; [PROJECTS.md](PROJECTS.md) the stored shape) and applies it three ways.

**Events**, `handleMidiEvent(e)`:

- `pad`: executes the pad's assignment, trigger a sample, switch the scene (disabling Auto-VJ; the entry transition decides cut versus fade), fire a scene event on the scene that owns it, or start a held effect punch (previous parameter value saved, restored on release).
- `note` / `noteoff`: consults `noteRouting.synth`, `always`, `unassigned` (the default: notes whose pad carries an assignment do not reach the synth; free pitches such as Theory Engine notes always do), or `off`. Note-offs release unconditionally in every mode so a voice can never hang; a noteoff whose index maps to a pad also releases gate-mode samples and ends punches.
- `cc`: matched against the learned button slots (CC number, plus channel when one was pinned); a rising edge across 0.5 executes the button's toggle target. The event's resolved continuous target, if any, feeds touch-to-select.
- `bend` / `mod`: forwarded to the synth.

**Frames**, the router registers itself as the engine's frame hook (`engine.setFrameHook`), running inside the frame after control ingestion and before the palette update. Each frame it updates the transport, then dispatches knobs and gesture routes:

- Knobs are change-driven: a knob's assignment fires only when the hardware position moves past a small epsilon, so an idle knob never fights a value edited in a drawer panel. The 0 to 1 position runs through the assignment's curve (`linear`, or `detent`, center of travel maps to exactly zero) and min-max range, then drives the target: `engine:hue` / `engine:intensity` / `engine:fadeTime`, any numeric `fx:` parameter, any `synth:` range parameter, the four `sampler:` knobs, or any parameter a scene declares (`scene:<sceneId>:<key>`).
- Gesture routes (X, Y, PULSE, PRESS, SWAY, any number of routes per dimension) are applied after knobs, so on a shared target the gesture wins.
- Held punches are re-asserted last so nothing overwrites them mid-hold.

The frame hook also mirrors the transport into the engine's `io` (`io.transport = { playing, time }`), which is how a scene that opens on a trigger (Will I Dream stays dark until the show starts) sees the show clock without reaching outside the contract.

**Timeline**, the transport reports visual-clip entries to the router, which suspends Auto-VJ while the timeline drives the stage (restoring its previous state when playback stops or leaves the clips) and applies the clip: the stored transition at a played boundary, an instant cut on any seek or play start.

The router also records the last physically touched control (pads, learned buttons, moved knobs, and factory-mapped continuous CCs) which is what lets the assignment panel follow the hardware (FOLLOW).

## Normalization

All continuous values are scaled from the 7-bit MIDI range to 0..1 by division by 127. `createControlState()` in `swaymap.js` defines the fields and their initial values:

| Field | Range | Initial value |
|---|---|---|
| `xy.x`, `xy.y` | 0..1 | 0.5, 0.5 |
| `gestures.pulse`, `gestures.press`, `gestures.sway` | 0..1 | 0 |
| `xtrigYmod.x`, `xtrigYmod.y` | 0..1 | 0 |
| `knobs[0..7]` | 0..1 | 0.5 each |
| `pads[0..15]` | velocity 0..1, decays in the engine | 0 each |
| `lastPad` | pad index, or −1 | −1 |
| `awake` | boolean | `true` |
| `lastEventAt` | `performance.now()` timestamp of the last message | 0 |

## Factory map

The factory map in `swaymap.js` reproduces the Sway's Base Project V2 assignments, recovered from Audima's own artifacts (the `.swayproj` file, the official Ableton remote scripts, and the Cubase MIDI Remote script) and not officially published by Audima. Sources and confidence flags: [SWAY_INTEGRATION.md](SWAY_INTEGRATION.md#factory-midi-map-base-project-v2) and [RESEARCH.md](RESEARCH.md). The declared channel is MIDI channel 1 (`channel: 0`, 0-indexed); the router itself applies no channel filter.

| Control | Message | Numbers |
|---|---|---|
| Hand tracking X (full surface, both hands merged) | CC | 50 |
| Hand tracking Y | CC | 38 |
| Pulse gesture (vertical bounce energy) | CC | 35 |
| Press gesture (downward press depth) | CC | 36 |
| Sway gesture (lateral sway amount) | CC | 37 |
| X-trigger region | CC | 73 |
| Y-modulation region | CC | 74 |
| Knobs 1 to 8, rotation | CC | 20 to 27 -> `knob:0` ... `knob:7` |
| Pads, chromatic layout (internal normalization) | Note On | 24 to 39 -> pad index 0 to 15 |
| Pads, factory Theory Engine grid (B natural minor, low to high) | Note On | 47 49 50 52 54 55 57 59 61 62 64 66 67 69 71 73 |
| Sleep | Program Change | 37 |
| Wake | Program Change | 38 |

The map declares pads on channel 1 or channel 16 (`channels: [0, 15]`) because Audima's `.swayproj` and Ableton script disagree about the transmit channel (unconfirmed); since the router ignores channel entirely, both arrive correctly. Knob-press CCs and the eight mappable buttons have no entry in the factory map; their defaults are not established (unconfirmed), which is why button slots start empty and are filled by LEARN.

## MIDI-learn

Any continuous control can be rebound at runtime, which also makes any class-compliant controller a full replacement for the Sway. The low-level API on the object returned by `createMidi()`:

| Function | Behavior |
|---|---|
| `learn(target)` | Arms a learn for `target` and returns a promise. The next incoming CC message becomes the binding: the override `{ type: 'cc', num }` is stored, the promise resolves with `{ target, cc }`, and that CC message is consumed rather than applied. |
| `cancelLearn()` | Clears the pending target; the pending promise never settles. A second `learn()` call before a CC arrives replaces the pending target with the same effect. |
| `setOverrides(o)` | Replaces the whole override set. |
| `getOverrides()` | Returns a shallow copy of the current override set. |

Valid continuous learn targets:

| Target | Control-state field |
|---|---|
| `xy:x`, `xy:y` | `xy.x`, `xy.y` |
| `gesture:pulse`, `gesture:press`, `gesture:sway` | `gestures.*` |
| `xtrig:x`, `xtrig:y` | `xtrigYmod.*` |
| `knob:0` ... `knob:7` | `knobs[0]` ... `knobs[7]` |

Overrides win over the factory map: incoming CC numbers are checked against the override set first, in insertion order, and only unmatched CCs fall through to the factory table. An override adds a binding for its target without removing the factory CC for that target; when an override claims a CC number the factory map assigns elsewhere, the override wins for that number, which is the one sharp edge here. Learning `xy:y` onto CC 50, the CC the surface sends for X, leaves `xy:x` driven by nothing at all and both hand axes reporting Y, so the sensor array reads as broken while the hardware is fine. The **UNLEARN** chip in the assignment panel ([STUDIO.md](STUDIO.md#learn-and-persistence)) drops one override and restores the factory binding. Only CC messages can be learned; notes cannot.

The caller is the router's `learnBinding(target)`, reached through the LEARN chip in the assignment panel ([STUDIO.md](STUDIO.md)). After every completed learn it persists the override set to `settings.json` (`midiOverrides`, applied again at the next startup) and marks the project dirty, so the binding also lands in the `.sway` file on the next save. A **button** learn captures the CC number and channel into the button slot instead; the temporary continuous override recorded on the way is deleted immediately so a button press never drives a knob path.

## Monitor

The layer keeps a 14-entry ring buffer (`MONITOR_SIZE`) of human-readable message lines, newest first. Entry formats, with channels displayed 1-based:

| Event | Format | Example |
|---|---|---|
| Control Change | `CC<num>=<value> ch<n>` plus ` -> <target>` when routed | `CC50=64 ch1 -> xy:x` |
| Note On | `NOTE <note> vel<velocity> ch<n>` plus ` -> pad<index>` when a pad matched | `NOTE 24 vel127 ch16 -> pad0` |
| Note Off | `NOTE OFF <note> ch<n>` | `NOTE OFF 24 ch16` |
| Pitch bend | `BEND <value> ch<n>` (value 0..1, three decimals) | `BEND 0.500 ch1` |
| Program Change | `PC <program> ch<n>` | `PC 38 ch1` |
| Learn capture | `LEARN <target> <- CC<num>` | `LEARN knob:3 <- CC71` |

The `K` key toggles the `#midi-monitor` overlay, which joins the buffer with newlines and shows `(waiting for MIDI...)` while the buffer is empty; the deck's display element also shows the newest line. The monitor sits on `K` rather than `M` because `M` is the seventh pad key.

## Mouse and keyboard equivalents

`src/renderer/app.js` writes the same control state from mouse and keyboard. Pointer and wheel handlers on the stage canvas are gated on `control.isSway` being `false`; they stay active while a generic (non-Sway) MIDI controller is bound, and go inert only when a Sway is bound.

| Input | Effect |
|---|---|
| Pointer move over the stage | `xy.x` = horizontal position 0..1; `xy.y` = vertical position 0..1 with the bottom edge as 0 |
| Pointer button down / up | `gestures.press` = 1 / 0 |
| Wheel over the stage | `gestures.pulse` increases by `abs(deltaY) × 0.002`, clamped to 1; each wheel event schedules a halving of the value 150 ms later |
| `Z X C V B N M ,` | pads 1 to 8: the pad value is set to 0.9 and the strike is dispatched through `router.handleMidiEvent`, exactly as a hardware strike would be; the key release dispatches a `noteoff` so gate-mode pads work from the keyboard |

Pad keys are not gated on `isSway`, and auto-repeat is ignored. Pads 9 to 16 have no keyboard equivalent. The full cockpit key list (scene digits, transport, drawers, overlays) lives in the [README](../README.md#controls) and in the CONTROLS modal (`H`).
