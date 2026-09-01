# Android

`android/` builds the cockpit into an APK, so a phone with USB host support
becomes the machine that runs the show. The Sway plugs into the phone, the phone
renders and sounds, and nothing else is needed.

Electron does not run on Android, so this is not a port of the desktop
application. It is a second host for the same web bundle theDAW already embeds.
The renderer, the scenes, the router, the timeline and the synth are the exact
files that ship on the desktop; what changes is the shell around them.

## How it fits together

| Piece | Role |
|---|---|
| `npm run build:renderer:android` | Bundles the renderer into `android/app/src/main/assets` with `--base=/assets/` |
| `MainActivity.kt` | A full-screen WebView, served through `WebViewAssetLoader` |
| `MidiBridge.kt` | Opens the hardware with `android.media.midi` and relays raw bytes to the page |
| `src/renderer/host/host-channel.js` | Receives those bytes, unchanged from theDAW's embedding |

Two decisions carry the design.

The bundle is **served, not loaded from a file**. `WebViewAssetLoader` publishes
the assets under `https://appassets.androidplatform.net`, which is a secure
origin. A `file://` page is not, and outside a secure context `getUserMedia`
refuses the microphone and `AudioWorklet` refuses to load its module, which
would leave the analyser with no signal and the synth with no voice.

The **host owns MIDI**. An Android WebView implements no Web MIDI API, so the
page cannot open the Sway itself. `MainActivity` sets `__SWAY_HOST_MIDI__`
before `app.js` runs, `midi.js` takes the relay path it already uses inside
theDAW, and the bytes are decoded by the same factory map, learned overrides and
pad channels as on the desktop. Nothing about the decode is Android-specific.

Frames are batched. Hand tracking alone emits two continuous controllers as fast
as the surface changes, so a busy moment is a few hundred messages a second. One
`evaluateJavascript` per message would spend longer crossing into the WebView
than decoding, so messages are collected and flushed once per display interval,
about sixty calls a second no matter how hard the surface is worked.

## Power is the real constraint

The Sway has three ports, and only one of them carries data. From section 08 of
Audima's manual, recorded in [SWAY_INTEGRATION.md](SWAY_INTEGRATION.md):

| Port | Position | Purpose |
|---|---|---|
| MIDI output, TRS-A | Left | Hardware synthesisers, through a TRS-A to 5-pin DIN adapter |
| USB-C power in | Centre | Power only, for a supply under 35 W when the host cannot provide enough |
| USB-C host, data and power | Right | MIDI and power over one cable |

A phone in USB host mode supplies little current and is running its own screen
and GPU at the same time. The arrangement that works is a **powered USB-C hub**:
the phone on one port for data, mains or a battery pack on the hub, and the Sway
drawing its power from the hub rather than from the phone. The manual's centre
port exists for exactly this case and can take the supply directly.

Plugging the Sway straight into a phone may enumerate and may not, and a device
that browns out under sixteen infrared emitters and sixteen RGB LEDs will do so
in the middle of a set rather than at connection time.

## Building

The web bundle has to exist before Gradle runs. The build fails with that
instruction rather than producing an APK whose WebView loads a blank page.

```sh
npm run build:renderer:android
cd android
./gradlew assembleDebug
```

The APK lands at `android/app/build/outputs/apk/debug/app-debug.apk`.

`local.properties` points Gradle at the SDK and is not committed:

```properties
sdk.dir=C:/Users/you/AppData/Local/Android/Sdk
```

Forward slashes matter. A Java properties file reads a backslash as an escape,
so `C:\Users\...` fails with a message about volume label syntax that names no
file.

| Requirement | Version |
|---|---|
| JDK | 17 |
| Gradle | 8.11.1, fetched by the wrapper |
| Android Gradle Plugin | 8.7.3 |
| compileSdk, targetSdk | 34 |
| minSdk | 26 |

`minSdk` is set by the adaptive launcher icon, which is what lets the icon be a
vector instead of five PNG densities. `android.media.midi`, the reason this
module exists, arrived in API 23, so MIDI is not what sets the floor.

## What works, and what does not

| Capability | On Android |
|---|---|
| Scenes, engine, effects rack, Auto-VJ | Yes, the same bundle as the desktop |
| Sway over USB, and any class-compliant controller | Yes, through the MIDI relay |
| Mouse and keyboard equivalents | Touch drives the stage; a Bluetooth keyboard drives the rest |
| Microphone input for the analyser | Yes, after the permission prompt |
| System audio loopback | No. That is a Windows WASAPI feature with no Android equivalent |
| Timeline, stems, sampler, synth | Yes, through Web Audio |
| VST3 plugins | No. Those need the desktop sidecar |
| `.gan` plugin surfaces | Untested |

Performance is the open question. Every scene is GLSL3 on WebGL2, and the two
heaviest, Miracle Mile and Nature's Tomb, compile large fragment shaders that
take seconds even on a desktop GPU. A phone will want the `low` quality tier,
which is an 8,000 instance budget against 80,000 on `high`.

## Not yet verified on hardware

The module builds and the APK packages correctly, and it has not been run with a
Sway attached to a phone. What is proven is that it compiles clean, that the web
bundle is inside the APK, and that the manifest declares USB host and MIDI. What
is unproven is enumeration, power draw, frame rate and the relay end to end.

The first run wants `adb logcat -s SwayMidi` alongside it. `MidiBridge` logs the
name of the device it opened, and reports through to the page when it finds
none.
