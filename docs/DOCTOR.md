# Doctor

The Doctor is SwayCommand's startup system check and remediation list, shown in the SYSTEM modal. It verifies the machine, reports on optional hardware and software, and offers one-click fixes for anything missing. It never blocks: every check is isolated, every failure degrades to an informational row, and the cockpit is always reachable.

Implementation is split between two processes. Checks that need operating-system access (USB, registry, driver store, network) live in [`src/main/doctor.js`](../src/main/doctor.js); checks that need browser APIs (WebGL2, WebMIDI, audio devices) live in [`src/renderer/app.js`](../src/renderer/app.js). Fix actions are implemented in [`src/main/audima.js`](../src/main/audima.js) and [`src/main/driver-install.js`](../src/main/driver-install.js) and dispatched from [`src/main/main.js`](../src/main/main.js). Symptom-oriented guidance: [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Purpose and lifecycle

The SYSTEM modal opens over the cockpit at startup, with the stage behind the closed blast door. `runDoctor()` in `app.js` invokes the main-process checks over IPC (`doctor:run`) and the renderer checks locally, in parallel, and renders the combined list. A re-run button (`#btn-recheck`) invokes `runDoctor()` again at any time, a successful fix triggers an automatic full re-run, and the modal is reachable later from the SYSTEM button in the CONTROLS modal.

Advancement rules:

- After every run, the ENTER button (`#btn-enter`) is enabled regardless of results. A `fail` result never blocks opening the blast door manually.
- When the aggregate status is `ok` (no check reports `warn` or `fail`), the door opens on its own after 1,400 ms. Auto-advance fires at most once per session (`state._autoAdvanced`) and only if the SYSTEM modal is still open when the timer elapses.
- With `?autoplay=` (or the `SWAYCOMMAND_AUTOPLAY` environment variable), the door opens immediately and the Doctor runs in the background, populating the SYSTEM modal for later viewing.

## Status levels

Each check returns `{ id, label, status, detail, fix? }`. The four status values and their effect on advancement:

| Status | Icon | Meaning | Effect on auto-advance |
|---|---|---|---|
| `ok` | `●` | The item is present and working. | None. |
| `warn` | `▲` | Playable, but something merits attention (DFU mode, no network, no WebMIDI). | Blocks auto-advance; manual advance remains available. |
| `fail` | `✕` | A hard requirement is missing (WebGL2). | Blocks auto-advance; manual advance remains available. |
| `info` | `○` | Neutral observation about an optional item. | None — treated the same as `ok`. |

The aggregate is `fail` if any check fails, otherwise `warn` if any check warns, otherwise `ok`. The boot status line summarizes the aggregate in one sentence.

## Main-process checks

`runAll()` executes five checks. External commands run through a shared wrapper (`run()`): `execFile` with a 6,000 ms timeout, a hidden window, and an 8 MiB output buffer. A command failure that produces no output resolves to `null` instead of an exception.

### System

Always `ok`. Reports the platform name, `os.release()`, `process.arch`, and total RAM as `Math.round(os.totalmem() / 1e9)` GB. Check id `platform`.

### Audima Sway

Check id `sway`. Detects the Sway's USB presence in both modes. Identifiers come from [`src/shared/constants.js`](../src/shared/constants.js): `VID 0x0483`, `PID 0x52A4` (normal), `PID 0xDF11` (DFU). Detection method per platform:

| Platform | Method |
|---|---|
| Windows | `pnputil.exe /enum-devices /connected`; if that yields nothing, a PowerShell fallback: `Get-PnpDevice -PresentOnly` printing `InstanceId\|Status` per device. The uppercased output is searched for `VID_0483&PID_52A4` and `VID_0483&PID_DF11`. |
| macOS | `system_profiler SPUSBDataType`. Normal mode requires vendor id `0x0483` plus the exact port name `Audima Labs The Sway`; DFU mode requires the vendor id plus a match of `STM32 BOOTLOADER` (case-insensitive). |
| Linux | `lsusb`. Normal mode matches `0483:52a4`; DFU mode matches `0483:df11`. |

Results:

| Condition | Status | Fix offered |
|---|---|---|
| Normal-mode device present | `ok` | — (USB-MIDI is driverless) |
| DFU-mode device present | `warn` | `install-dfu-driver` on Windows; none elsewhere. The detail recommends a power-cycle to return to normal mode when no firmware update is in progress. |
| Neither present | `info` | — (hot-attach is automatic; mouse, keyboard, and generic MIDI substitute) |
| Scan threw | `info` | — (MIDI detection in the renderer is independent of the USB scan) |

### Audima Sway Software

Check id `companion`. Detects Audima's companion application, which is optional at every point. Detection method per platform:

| Platform | Method |
|---|---|
| Windows | Existence test on three paths, in order: `%APPDATA%\com.audima.sway`, `%LOCALAPPDATA%\The Sway`, `%ProgramFiles%\The Sway` (with home-directory and `C:\Program Files` fallbacks when the environment variables are unset). If none exists, a PowerShell registry query reads `HKLM` and `HKCU` `SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*` and filters `DisplayName -like '*Sway*'`. |
| macOS | Existence test on `/Applications/The Sway.app` and `~/Applications/The Sway.app`. |
| Linux | No detection; Audima ships no Linux build of the companion application. |

Results: `ok` when installed; `info` with the `fetch-companion` fix when absent on Windows or macOS; `info` without a fix on Linux; `info` when detection threw.

### Firmware-update driver

Check id `dfu-driver`. Windows only; on macOS and Linux the check returns `ok` because DFU works with built-in class drivers. On Windows, `pnputil.exe /enum-drivers` output is matched against `stm32bootloader.inf` (case-insensitive). Results: `ok` when the driver is staged; `info` with the `install-dfu-driver` fix when it is not; `info` when the query threw. The driver is used only for firmware updates; normal play requires no driver.

### Audima update channel

Check id `network`. Calls `fetchLatest(5000)` in `audima.js`: an HTTPS fetch of `https://cdn.audima.com.au/software/latest.json` with a 5,000 ms timeout (`AbortSignal.timeout`), following redirects, sending the User-Agent `SwayCommand/0.1 (Sway companion; +https://github.com/swaycommand)`. The response must be a Tauri updater manifest with `version` and `platforms` fields. A successful fetch is cached in the main process; subsequent Doctor runs in the same session reuse the cached manifest without a network round trip.

Results: `ok`, reporting the latest Sway Software version from the manifest; `warn` with the `open-downloads-page` fix when the CDN is unreachable. Offline operation is unaffected; the offline case is covered in [TROUBLESHOOTING.md](TROUBLESHOOTING.md#audima-update-channel-warns-while-offline).

## Renderer checks

`rendererChecks()` in `app.js` appends three checks after the main-process results.

### Graphics (WebGL2)

Check id `gpu`. A probe `<canvas>` requests a `webgl2` context. Success returns `ok` with the context's `RENDERER` string; a null context returns `fail` with driver-update guidance; an exception returns `fail` with the error message. This is the only check that can produce `fail`.

### MIDI

Check id `midi`. Reports the state of the MIDI layer created at startup (`src/renderer/midi/midi.js`). When WebMIDI access was granted, the status is `ok` with one of three details: the Sway is bound (port name, factory map armed); other inputs are bound (port names listed, and the detail states that messages are matched against the factory map and can be overridden in `settings.json`); or no devices are currently attached (hot-plug is automatic; mouse and keyboard remain mapped). When WebMIDI is unavailable or access was denied, the status is `warn`, with mouse and keyboard control unaffected.

### Audio input

Check id `audio`. Enumerates `audioinput` devices via `navigator.mediaDevices.enumerateDevices()`. Any enumeration result returns `ok`: with a device count when inputs exist, or stating that the internal groove drives the visuals when none do. An enumeration exception returns `info`. The internal groove is defined in [OVERVIEW.md](OVERVIEW.md#terminology).

## Fix actions

Clicking a fix button disables it, invokes `doctor:fix` with the fix id, and applies the `{ ok, detail }` result: on success the check flips to `ok`, the button is removed, and the full Doctor re-runs; on failure the check shows the returned detail with status `warn`. Fix ids and their handlers in `main.js`:

| Fix id | Offered by | Handler |
|---|---|---|
| `fetch-companion` | `companion` (not installed) | `audima.downloadCompanion` |
| `install-dfu-driver` | `dfu-driver` (not staged); `sway` (DFU mode, Windows) | `driver.installDfuDriver` |
| `open-downloads-page` | `network` (CDN unreachable) | `shell.openExternal` |
| `open-manual` | no check currently attaches it; the IPC handler exists | `shell.openExternal` |

### fetch-companion

Downloads and verifies the Sway Software installer.

1. Resolve the platform key: `windows-x86_64` on Windows; `darwin-aarch64` or `darwin-x86_64` on macOS by `process.arch`. On Linux the fix returns failure immediately — no companion build exists.
2. Fetch `latest.json` and read `platforms[key].url` and `platforms[key].signature`. If the manifest is unreachable or malformed, fall back to a pinned URL from `constants.js` (`v1.2.1` MSI for Windows, `v1.2.0` DMGs for macOS); pinned fallbacks carry no signature.
3. Download to the system Downloads folder (`app.getPath('downloads')`), named from the URL path. The stream writes to a `.part` file and renames on completion; the fetch enforces a 10-minute timeout and the host allowlist (`cdn.audima.com.au`, `audima.com.au`, `www.audima.com.au`, HTTPS only).
4. When a signature is present, verify it with the minisign algorithm below. Verification failure deletes the download (`fs.rmSync`) and returns failure with manual-download guidance.
5. Open the verified installer with `shell.openPath` and return success. A fallback download without a signature is opened with a detail stating that no signature was available.

Minisign verification (`minisignVerify`):

1. The public key (`AUDIMA.MINISIGN_PUBKEY`, the key Audima's own application embeds) is base64-decoded into 42 bytes: ASCII `Ed`, an 8-byte key id, and a 32-byte Ed25519 public key.
2. The manifest signature is accepted as raw `.sig` text or as base64 of a `.sig` file. Comment lines are stripped; the first remaining line decodes to 74 bytes: a 2-byte algorithm tag (`ED` or `Ed`), an 8-byte key id, and a 64-byte signature.
3. The signature's key id must equal the public key's key id; a mismatch aborts.
4. For tag `ED` (prehashed) the signed message is the BLAKE2b-512 digest of the file; for legacy tag `Ed` it is the file bytes.
5. Ed25519 verification runs through `node:crypto` with the raw key wrapped in SPKI DER. Any failure raises, which triggers the download deletion described in the outer procedure.

The BLAKE2b-512 prehash in step 4 comes from [`src/main/blake2b.js`](../src/main/blake2b.js), not from `node:crypto`. Electron links BoringSSL rather than OpenSSL, and BoringSSL implements no BLAKE2 — `process.versions.openssl` reads `0.0.0` and `crypto.getHashes()` returns nothing matching `blake`. So `crypto.createHash('blake2b512')` throws `Digest method not supported` in the main process while succeeding under plain Node, and because Audima signs with the modern `ED` tag, every `fetch-companion` attempt failed at step 4 with `Deleted download — Digest method not supported`. The replacement is a dependency-free RFC 7693 implementation that hashes the file as a stream, so a large installer is never held in memory. It is checked against Node's native `blake2b512` and the published vectors by `scripts/test-blake2b.js`, and the whole verification path — including tamper, wrong-key, wrong-key-id and prehash-confusion rejections — by `scripts/test-minisign.js`; both are meant to be run under Electron as well as Node, since the defect only appears in one of them.

### install-dfu-driver

Windows only; on other platforms the fix returns success, reporting that built-in class drivers cover DFU.

1. Emit `{ phase: 'download', pct: 0 }`, then download `https://cdn.audima.com.au/software/Windows%20DFU%20Driver.zip` to `<userData>/audima/dfu-driver.zip`.
2. Remove any previous extraction, then extract with PowerShell `Expand-Archive` to `<userData>/audima/dfu-driver` (60,000 ms timeout; no bundled zip library).
3. Search the extraction recursively for `STM32Bootloader.inf` (the INF may sit at the root or one folder down); raise if absent.
4. Emit `{ phase: 'install', pct: 100 }`, then stage the driver elevated: PowerShell runs `Start-Process -FilePath pnputil.exe -ArgumentList '/add-driver','"<inf>"','/install' -Verb RunAs -Wait -PassThru` and exits with the elevated process's exit code. Windows shows the standard UAC prompt. The wrapping PowerShell call has a 180,000 ms timeout.

A declined UAC prompt is recognized by matching `canceled`, `cancelled`, or `1223` in the error text and returns failure, stating that the fix can be run again; any other error returns failure with manual-install guidance pointing at the Audima downloads page. The fix runs only from an explicit button click, never automatically.

### open-downloads-page

Opens `https://audima.com.au/downloads/` in the system browser via `shell.openExternal` and returns success. Offered when the CDN is unreachable, so that downloads can proceed through the browser.

### open-manual

Opens the Sway user manual PDF (`AUDIMA.USER_MANUAL`, hosted on `cdn.audima.com.au`) in the system browser. The handler is registered on the IPC surface but no check currently offers it.

## Progress events

Long-running fixes report progress on the `fix:progress` channel. `main.js` wraps each fix's progress callback so every event carries the fix id: `{ fixId, phase, ... }`. Payloads by phase:

| Phase | Emitted by | Payload |
|---|---|---|
| `download` | `downloadTo` (both download fixes) | `{ received, total, pct }` per chunk, only when the response carries a `Content-Length` header; `install-dfu-driver` also emits an initial `{ pct: 0 }`. |
| `verify` | `downloadCompanion` | `{ pct: 100 }` before signature verification. |
| `install` | `installDfuDriver` | `{ pct: 100 }` before the elevated `pnputil` call. |

The renderer subscribes through `window.swaycommand.doctor.onFixProgress`, matches the event to the check owning that fix id, and writes into the check's progress element: `downloading… <pct>%` for the download phase, `<phase>…` otherwise.

## Failure isolation

The Doctor is built so that no single failure can prevent startup:

- Each main-process check wraps its body in `try`/`catch` and converts exceptions into an `info` result carrying the error message.
- The `run()` command wrapper resolves to `null` on command failure instead of rejecting, so a missing tool (`lsusb`, `pnputil`) degrades to a not-detected result.
- `runAll()` gathers the five checks with `Promise.allSettled`; a rejected check (which the per-check `catch` should already prevent) is mapped to an `info` row rather than propagating.
- Each renderer check wraps its probe in `try`/`catch`.
- The ENTER button is enabled after every run, and `fail` results affect only auto-advance. The cockpit is reachable on a machine with no GPU acceleration, no network, no MIDI, and no audio input.
