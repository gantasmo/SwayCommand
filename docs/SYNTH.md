# Synth

SwayCommand includes a wavetable synthesizer so a Sway is playable as an instrument without installing a plugin. Audima's downloads page recommends [Vital](https://vital.audio/) to first-time users ("Vital Synth Pack Free · Best for Beginners") and ships a Sway project for it; this engine targets the same ground.

Implementation: [`src/renderer/audio/synth.js`](../src/renderer/audio/synth.js) and the wavetable bank in [`src/renderer/audio/wavetables.js`](../src/renderer/audio/wavetables.js). The panel lives in the SYNTH drawer ([STUDIO.md](STUDIO.md)).

## Capability against Vital

| Vital feature | SwayCommand | Notes |
|---|---|---|
| 3 wavetable oscillators | Yes | 7 generated tables, continuous morph |
| Wavetable position morph | Yes | Crossfade between adjacent spectral frames |
| Unison with detune and stereo spread | Yes | 1 to 8 voices per oscillator |
| Sub oscillator | Yes | sine/triangle/saw/square, −3 to 0 octaves |
| Noise oscillator | Yes | white or pink |
| 2 filters | Yes | lowpass, highpass, bandpass, notch, with drive and key tracking |
| 3 envelopes | Yes | ADSR; env1 is the amplifier |
| 4 LFOs | Yes | sine, triangle, saw, square |
| Modulation matrix | Yes | 9 sources, 15 destinations, bipolar amount |
| Effects | Yes | distortion, chorus, phaser, delay, reverb, compressor, 3-band EQ |
| Presets | 7 factory | Init, Super Saw, Deep Bass, Wobble Bass, Glass Pad, Pluck Lead, Formant Vox |
| Spectral warp modes | No | Vital's warp operates on the table in the spectral domain; here the table generators fix the spectrum |
| Sample and text-to-wavetable import | No | Tables are generated, not loaded |
| Wavetable editor | No | |
| MPE | Partial | Pitch bend and mod wheel are handled; per-note expression is not |

The gaps are the parts of Vital that need a custom DSP path. `createPeriodicWave` supplies band-limited harmonic frames, which covers wavetable playback and morphing but not runtime spectral warping.

## Wavetables

A Vital table is a series of frames the oscillator morphs between. Web Audio has no wavetable oscillator, but `createPeriodicWave` takes harmonic amplitudes, which is a frame expressed spectrally. Each table is therefore 8 `PeriodicWave` frames of up to 64 harmonics, and the morph is a crossfade between the two frames the position falls between, two oscillators per unison voice, gain-blended.

Frames are generated rather than sampled, so the bank costs kilobytes and every frame is band-limited by construction.

| Table | Character |
|---|---|
| `basic` | Saw to square |
| `harmonic` | Sine to saw; harmonics enter one at a time |
| `hollow` | Odd harmonics opening to a reedy spectrum |
| `formant` | Two moving spectral peaks, vowel-like |
| `bell` | Inharmonic-leaning partial clusters |
| `pulse` | Pulse-width modulation expressed spectrally |
| `noisy` | Deterministic pseudo-random partials |

## Signal path

```
osc1 ┐
osc2 ┼─ mix ─ filter1 ─ filter2 ─ ampEnv ─ pan ─┐
osc3 ┤                                          ├─ distortion ─ chorus ─ phaser
sub  ┤                                          │   ─ delay ─ reverb ─ comp ─ EQ ─ master
noise┘                                          ┘
```

The master output connects to both the speakers and the analyser, so playing the synth drives the visuals exactly as any other audio source does.

Effects are built once and bypassed by mix level rather than rewiring, so changing a patch never clicks.

## Modulation

Envelopes are per-voice, scheduled as `AudioParam` automation at note-on. LFOs are global nodes fanned into per-voice gain stages, which keeps polyphony cheap.

| Source | Kind |
|---|---|
| `env2`, `env3` | Per-voice, scheduled at note-on |
| `lfo1`-`lfo4` | Global, live node connection |
| `velocity`, `keytrack`, `modwheel` | Static, evaluated at note-on |

Destinations: oscillator position, level and tune; both filters' cutoff and resonance; amplitude; pan.

## Playing it

| Input | Behaviour |
|---|---|
| Sway notes | Note-on and note-off drive the synth, including notes outside the pad range that the Theory Engine sends |
| Pitch bend | Applies over the patch's bend range, default 2 semitones |
| CC 1 | Mod wheel, available as a matrix source |
| On-screen keyboard | Seventeen keys from C3 in the SYNTH drawer |
| Computer keyboard | `A W S E D F T G Y H U J K O L P ;` while the SYNTH drawer is open; the keys are not captured elsewhere, so the cockpit shortcuts are unaffected |

Whether a pad strike also plays the synth is decided by the project's note-routing mode: by default, pads that carry an assignment no longer double-fire the synth, while free pitches (Theory Engine notes outside the pad range) always reach it ([STUDIO.md](STUDIO.md#note-routing)).

## theDAW alignment

The module is shaped to lift into theDAW rather than to be rewritten for it.

| theDAW interface | Here |
|---|---|
| `VoiceTrigger`, `(ctx, dest, midi, velocity, when, duration, master)` | `synth.voiceTrigger()` returns a function with that exact signature, so a patch drops into piano-roll preview, offline bounce, init render, and the timeline |
| `VisualControl`, `{ key, label, kind, group, min, max, step }` | `synth.controlManifest()` returns that shape; theDAW's control-sync bus and MIDI mapper consume it without an adapter |
| Factory-function modules taking `ctx` and a destination list | `createSynth(ctx, destinationNodes)`, matching `sampler.js` and `audio.js` |
| `synthVoiceKit` helpers (`mtof`, `distCurve`) | Reproduced locally with the same semantics |

`noteOff` accepts a future timestamp and retires its bookkeeping when the release begins, not when it is scheduled, so offline rendering reports voice counts correctly.
