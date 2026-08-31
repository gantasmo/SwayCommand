# Troubleshooting

Symptom-oriented reference for known issues. Check-by-check detection methods and fix internals: [DOCTOR.md](DOCTOR.md). Terminology: [OVERVIEW.md](OVERVIEW.md#terminology).

## SmartScreen warning on the Windows installer

| | |
|---|---|
| Symptom | Windows SmartScreen interrupts the downloaded installer with a protection dialog before it runs. |
| Cause | Release binaries are unsigned: [`electron-builder.yml`](../electron-builder.yml) defines no code-signing configuration for the Windows target, and SmartScreen flags unsigned executables downloaded from the internet. |
| Resolution | The dialog's "More info" control reveals a "Run anyway" option. Alternatively, building the installer from source (`npm run dist:win`) produces the same artifact without the download mark. The installer is per-user (`perMachine: false`) and requests no elevation. |

## Gatekeeper blocks the application on macOS

| | |
|---|---|
| Symptom | macOS refuses to open the downloaded application, reporting that the developer cannot be verified. |
| Cause | The macOS target in [`electron-builder.yml`](../electron-builder.yml) defines no signing identity and no notarization step, so downloaded builds carry the quarantine attribute and fail Gatekeeper's verification. |
| Resolution | Control-clicking the application and choosing Open bypasses the block for that copy; `xattr -d com.apple.quarantine` on the application bundle removes the quarantine attribute. A from-source build (`npm run dist:mac`) carries no quarantine mark. |

## "Cannot read properties of undefined (reading 'whenReady')" at launch

| | |
|---|---|
| Symptom | `npm start` from a development shell aborts immediately with `TypeError: Cannot read properties of undefined (reading 'whenReady')` at the top of [`src/main/main.js`](../src/main/main.js). |
| Cause | The environment variable `ELECTRON_RUN_AS_NODE` is set, typically inherited from a parent process that is itself an Electron application (an editor's integrated terminal, an Electron-based agent). With it set, the Electron binary starts as plain Node.js, `require('electron')` resolves to the path-export stub instead of the API, and the destructured `app` is `undefined` when `main.js` calls `app.whenReady()`. |
| Resolution | Clearing the variable in the launching shell restores the Electron API: `Remove-Item Env:ELECTRON_RUN_AS_NODE` (PowerShell), `set ELECTRON_RUN_AS_NODE=` (cmd), or `unset ELECTRON_RUN_AS_NODE` (POSIX shells), followed by `npm start`. |

## UI colors overridden under a Windows contrast theme

| | |
|---|---|
| Symptom | With a Windows contrast theme active, interface colors are replaced by the system theme's colors. |
| Cause | The shipped stylesheet opts the document out of forced colors with `html { forced-color-adjust: none; }` ([`src/renderer/styles.css`](../src/renderer/styles.css), mirrored in `dist/styles.css`); the property inherits to every element. If a rebuilt or modified bundle strips that declaration, the browser engine substitutes the forced-colors palette for the application's CSS colors. |
| Resolution | Restoring the declaration in `src/renderer/styles.css` and rebuilding the renderer bundle (`npm run build:renderer`) reinstates the application palette. Packaged builds ship the declaration intact. |

## Audima update channel warns while offline

| | |
|---|---|
| Symptom | The Doctor's "Audima update channel" check reports `warn` with an unreachable-CDN message. |
| Cause | The check fetches `https://cdn.audima.com.au/software/latest.json` with a 5,000 ms timeout ([`src/main/doctor.js`](../src/main/doctor.js), `checkNetwork`); no network, a firewall, or a CDN outage fails the fetch. |
| Resolution | Playing is unaffected, SwayCommand operates fully offline and the `warn` does not block manual advancement. Only the download fixes (`fetch-companion`, `install-dfu-driver`) are unavailable until the CDN is reachable. The check offers a fallback fix that opens `audima.com.au/downloads/` in the system browser for manual downloads. A later re-run refreshes the check. |

## Manual CDN test with curl returns 403

| | |
|---|---|
| Symptom | A manual reachability test of `cdn.audima.com.au` with curl or a script returns HTTP 403 while the Doctor's update-channel check reports `ok`. |
| Cause | The CDN rejects generic tool User-Agents (curl-, python-, and Go-style); SwayCommand sends the custom User-Agent `SwayCommand/0.1 (Sway companion; +https://github.com/swaycommand)` on every Audima request ([`src/shared/constants.js`](../src/shared/constants.js), [`src/main/audima.js`](../src/main/audima.js)). |
| Resolution | The 403 is expected for tool-default User-Agents and indicates nothing about connectivity. A test with a custom User-Agent (`curl -A`) or from a browser succeeds; the Doctor's check result is authoritative for the application. |

## Companion download reported as deleted

| | |
|---|---|
| Symptom | The Sway Software download fix ends with a failure stating the downloaded installer was deleted. |
| Cause | Minisign verification failed: the signature's key id did not match Audima's pinned public key, or Ed25519 verification over the BLAKE2b-512 digest of the file failed (`minisignVerify` in [`src/main/audima.js`](../src/main/audima.js)). The file is deleted before it can be opened. A truncated or corrupted transfer produces the same outcome. |
| Resolution | Re-running the fix retries the download and verification. Manual download from `audima.com.au/downloads` remains available. When the manifest is unreachable and a pinned fallback URL is used, no signature exists; the installer then opens unverified with an explicit notice in the result. Algorithm details: [DOCTOR.md](DOCTOR.md#fetch-companion). |

## DFU driver fix ends without installing

| | |
|---|---|
| Symptom | The driver-install fix reports that elevation was declined and the driver was not installed. |
| Cause | The elevated `pnputil` launch (`Start-Process -Verb RunAs`) was refused at the UAC prompt; [`src/main/driver-install.js`](../src/main/driver-install.js) matches exit code 1223 or a cancellation message and reports the decline. |
| Resolution | The fix can be run again at any time; approving the UAC prompt lets `pnputil` stage the INF. The manual alternative is the Windows DFU Driver package from `audima.com.au/downloads`. |

## Sway reported in DFU mode

| | |
|---|---|
| Symptom | The Doctor's "Audima Sway" check reports `warn`: the device is present as `VID 0x0483`, `PID 0xDF11` (the STM32 ROM bootloader) instead of normal mode (`PID 0x52A4`). |
| Cause | The Sway is in firmware-update (DFU) mode. In this mode it exposes no MIDI port. |
| Resolution | Power-cycling the Sway returns it to normal mode when no firmware update is intended. The DFU driver is used only for firmware updates; on Windows the check offers the `install-dfu-driver` fix for the case where an update is stalled on a missing driver. Driver details: [DOCTOR.md](DOCTOR.md#install-dfu-driver) and [SWAY_INTEGRATION.md](SWAY_INTEGRATION.md). |

## Sway not detected while plugged in

| | |
|---|---|
| Symptom | The Sway is connected over USB, but the Doctor's "Audima Sway" check reports not detected. |
| Cause | The check is a point-in-time USB scan with per-OS tooling: `pnputil.exe /enum-devices /connected` (with a `Get-PnpDevice` PowerShell fallback) on Windows, `system_profiler SPUSBDataType` on macOS, `lsusb` on Linux. A missing scan tool (`lsusb` is not installed on all distributions) resolves to an empty device list rather than an error. A charge-only USB cable carries no data lines and prevents enumeration entirely (unconfirmed). |
| Resolution | The USB scan is informational only; MIDI binding is independent of it. The MIDI layer ([`src/renderer/midi/midi.js`](../src/renderer/midi/midi.js)) binds any port whose name contains `Audima Labs The Sway` and hot-attaches on plug-in via the WebMIDI `statechange` event, so a Sway that enumerates as a MIDI device works even when the scan reports nothing. Re-running the checks after reseating the connection refreshes both the scan and the MIDI report. |

## Sway plugged in, no scene responds, link pill reads BUSY or KEYS

| | |
|---|---|
| Symptom | The Sway is connected and enumerates as a MIDI device, but no scene responds to the hand, pads, or knobs (in every scene) and the link pill in the top bar reads `BUSY` (or, in builds before the explicit open, `KEYS`). |
| Cause | Windows allows one process to hold a MIDI input port. Another application (a DAW, Audima's companion, or a leftover instance of this application, including a headless one started for verification (`npm start` / `electron .`) that never quit) already owns the Sway's port, so this instance's open fails. The MIDI layer opens every bound input explicitly and marks the failure: `control.busy` is set, the MIDI monitor (K) logs `PORT BUSY <name>`, and the pill lights `BUSY`. |
| Resolution | Close the other application or kill the stray instance (Task Manager, or `taskkill /PID <pid> /T /F` after `tasklist | findstr electron`), then unplug and replug the Sway or restart the application so the port is re-bound. |

## First launch after an install stutters for several seconds

| | |
|---|---|
| Symptom | The first launch after installing a build (or the first launch of a new build) is rough for a few seconds: the boot door reads `Warming visuals · n of m`, the cursor and the checks hesitate, and if ENTER is pressed early the stage hitches once per scene as it comes up. Every later launch is smooth. |
| Cause | The GPU driver compiles every scene's shader programs the first time it meets them, synchronously, on the main thread, and on Windows compiles a program a second time the first time it is drawn into a render target of a new format. Chromium caches compiled programs on disk (`GPUCache` under the application's user-data directory), so the cost is paid once per build per machine. The engine's warm pipeline ([ENGINE.md](ENGINE.md#the-warm-pipeline)) takes as much of it off the frame as the platform allows (the link runs on the driver's threads through `KHR_parallel_shader_compile`, and it runs against a target of the scenes' own format so the second compile folds into the first) and the door waits for it (up to six seconds) before opening by itself. What remains synchronous is the PMREM environment the chrome scenes (`ferrofluid`, `chladni`, `valley`) use, built on first need. |
| Resolution | Let the door open by itself. If every launch is slow, the program cache is not persisting: check that the user-data directory is writable, and that no second instance is running with the same directory (Chromium logs `Gpu Cache Creation failed` in that case and compiles cold every time). The per-scene costs are readable from a probe: `SWAYCOMMAND_PROBE="JSON.stringify(__swaycommand.state.engine.stats.warm)"` prints `buildMs` / `submitMs` / `linkMs` / `drawMs` per scene ([ENVIRONMENT.md](ENVIRONMENT.md)). |

## Hand X and Y read the same axis, or X does nothing

| | |
|---|---|
| Symptom | Moving the hand across the Sway drives the vertical response, or nothing; the MIDI monitor (K) shows `CC50=... -> xy:y`, the X CC landing on Y. Every scene is affected. |
| Cause | A MIDI-learn override. LEARN on the Y chip captured CC 50 (the CC the surface sends for X) as `xy:y`, and overrides **add** a binding rather than replacing one, so both CC 50 (override) and CC 38 (factory) drive Y and nothing drives X. Overrides persist in `settings.json` (`midiOverrides`) and in the project, so the fault survives a restart. |
| Resolution | Select Y on the deck and press **UNLEARN** in the assignment panel header (it appears whenever the selected control carries an override), or clear `midiOverrides` in `settings.json` while the application is closed. The factory map is X on CC 50, Y on CC 38 ([MIDI.md](MIDI.md#factory-map)). |

## No audio reaction

| | |
|---|---|
| Symptom | Visuals render but do not follow the music; the input pill in the top bar reads `GROOVE` instead of `LINE`. |
| Cause | At startup, `autoStart()` in [`src/renderer/engine/audio.js`](../src/renderer/engine/audio.js) requests the default audio input via `getUserMedia`; when no input exists or capture fails, the internal groove takes over, a synthesized 120 BPM kick-and-hat bus routed only into the analyser, inaudible by design. The Doctor's audio check counts inputs via `enumerateDevices`; device labels are blank until an active capture stream exists, and blank labels are replaced with the generic `Audio input`. |
| Resolution | An operating-system-level input (microphone, line-in, or a loopback device) must exist and be permitted; the application itself grants capture permission to the renderer ([`src/main/main.js`](../src/main/main.js) permission handlers), so a denial originates from OS privacy settings. Once an input is available, selecting it from the INPUT box in the right rail switches the analysis source and the pill changes to `LINE` (`LOOPBACK` for system audio on Windows). Slow auto-gain normalizes quiet and loud sources into the 0 to 1 band range, so low input level alone does not disable reaction. |

## Black render or WebGL2 failure

| | |
|---|---|
| Symptom | The stage stays black, or the Doctor's "Graphics (WebGL2)" check reports `fail`; in severe cases the application shows a startup-failure message with a stack trace instead of the cockpit. |
| Cause | The check probes `canvas.getContext('webgl2')` and fails when the GPU or its driver exposes no WebGL2 context. The render pipeline is three.js on WebGL2; when context creation throws during engine construction, the `main().catch` handler in [`src/renderer/app.js`](../src/renderer/app.js) replaces the page with the failure message. |
| Resolution | A GPU driver update is the primary remedy; WebGL2 support is a hard requirement per the [requirements table](../README.md#requirements). On capable hardware with low headroom, the quality tier bounds the per-scene particle budget (`low` 8,000, `med` 30,000 (the default passed by `app.js`), `high` 80,000) and the renderer caps `devicePixelRatio` at 1.75. |

## No MIDI devices listed

| | |
|---|---|
| Symptom | The Doctor's MIDI check reports `warn` (WebMIDI unavailable) or `ok` with no devices, and the link pill in the top bar reads `KEYS`. |
| Cause | The MIDI layer requires `navigator.requestMIDIAccess` (requested with `sysex: false`); the check reports `warn` when the API is absent or access fails. An `ok` with no devices means WebMIDI is working and no ports are currently attached. When a Sway is attached, it is bound exclusively and other controllers are ignored by design; otherwise all inputs are bound. |
| Resolution | Device attachment requires no restart: the layer rescans on every WebMIDI `statechange` event, so plugging a controller in binds it immediately ([`src/renderer/midi/midi.js`](../src/renderer/midi/midi.js)). The application grants the `midi` and `midiSysex` permissions itself, so no browser-style prompt is involved. Mouse and keyboard remain fully mapped whenever no MIDI device is bound. |

## Generic controller stops responding when a Sway is attached

| | |
|---|---|
| Symptom | A class-compliant MIDI controller drives the show until a Sway is plugged in, then stops responding. |
| Cause | Exclusive binding: when a port whose name contains `Audima Labs The Sway` is present, `rescan()` in [`src/renderer/midi/midi.js`](../src/renderer/midi/midi.js) binds only that port; all inputs are bound only when no Sway is found. |
| Resolution | This is by design, the Sway is authoritative while attached. Unplugging the Sway triggers a `statechange` rescan that rebinds every remaining input automatically. |
