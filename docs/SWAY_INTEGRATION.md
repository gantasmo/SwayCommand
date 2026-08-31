# Sway integration

Technical reference for SwayCommand's interface to the Audima Labs Sway and to Audima's distribution endpoints. All facts were verified against official Audima artifacts (firmware USB descriptors, companion-application binaries, and the Cubase/Ableton DAW scripts) on 2026-08-19; sources and open questions are recorded in [RESEARCH.md](RESEARCH.md). The code constants live in [`src/shared/constants.js`](../src/shared/constants.js) and [`src/renderer/midi/swaymap.js`](../src/renderer/midi/swaymap.js); this document and those two files record the same values.

## USB identity

The identity is stable across firmware v1.0.0 to v1.3.0 (from the official CM7.bin device descriptor).

| Mode | VID | PID | Device |
|---|---|---|---|
| Normal | `0x0483` | `0x52A4` | Composite device (IAD): CDC-ACM serial (the proprietary companion-application protocol) plus class-compliant USB-MIDI, single 1×1 port pair |
| DFU (firmware update) | `0x0483` | `0xDF11` | STM32 ROM bootloader |

USB strings: manufacturer `Audima Labs`, product `Audima Labs The Sway`.

Detection reads an OS device enumeration and matches the VID/PID: `pnputil /enum-devices /connected` on Windows (PowerShell `Get-PnpDevice -PresentOnly` as fallback), `system_profiler SPUSBDataType` on macOS (VID plus product string; DFU mode via the `STM32 BOOTLOADER` marker), `lsusb` on Linux. The implementation is `usbSnapshot()` in [`src/main/doctor.js`](../src/main/doctor.js). The CDC serial port is never identified by its friendly name.

The device runs a dual-core STM32H7 with separate CM7 and CM4 firmware images; firmware is normally flashed through Sway Software.

## MIDI port name per OS

| OS | Port name | Basis |
|---|---|---|
| Windows | `Audima Labs The Sway` (exact) | Confirmed by the official Cubase script's cross-platform equals-match filter |
| macOS | `Audima Labs The Sway` (exact) | Same confirmation |
| Linux (ALSA) | Typically `Audima Labs The Sway MIDI 1` (rawmidi suffix) | ALSA port-naming convention |

SwayCommand matches by substring (`name.includes('Audima Labs The Sway')`) which covers the exact name on Windows and macOS and the suffixed name on ALSA in a single test. The string is defined as `SWAY.MIDI_PORT_NAME` in `src/shared/constants.js` and `SWAY_PORT_NAME` in `src/renderer/midi/swaymap.js`. Runtime binding policy: [MIDI.md](MIDI.md#device-detection-and-binding-policy).

## Hardware reference

Recorded from section 08 of Audima's user manual (pages 29 to 32 of the
[published PDF](https://cdn.audima.com.au/docs/Audima%20Labs%20The%20Sway%20User%20Manual.pdf)).
The manual is Audima's copyrighted document and is not reproduced here; what
follows is the subset this project depends on.

The unit is mirror-symmetric about a centre panel. A 16-LED reactive beam and a
16-sensor array run along the top edge. Each side carries four click knobs above
a four-by-two pad block, with a two-by-two group of mappable buttons inboard of
the pads. The centre holds six preset buttons, the display and the scroll-click
wheel.

| Component | Behaviour |
|---|---|
| Reactive LED beam | 16 RGB LEDs following hand movement, customisable per region |
| Motion-tracking sensors | 16 sensors reading hand position and movement above the playable area |
| Preset buttons, 1 to 6 | Press loads a preset; holding enters bank selection |
| Click knobs, 8 | A CC on rotation, and a button when pressed |
| Drum pads, 16 | A note on activation. Not velocity sensitive by default |
| Mappable buttons | Send CC values, configurable per preset |
| Display | Current preset parameters: mode, note, scale, octave, CC values |
| Scroll-click wheel | Navigates and adjusts on-device parameters; also the power button, held two seconds |

Two of those settle rows the factory map had left open. A knob press sends a
second, independent CC rather than a note, and the mappable buttons send CC
rather than notes. Neither number is published, so both still need one hardware
MIDI-monitor session to pin down.

Pad and knob assignments are edited in the companion application, under Encoder
and Pad Mapping.

### I/O

| Port | Position | Purpose |
|---|---|---|
| MIDI output, TRS-A | Left | Hardware synthesisers or external MIDI interfaces, through a TRS-A to 5-pin DIN adapter, which is not supplied |
| USB-C power in | Centre | Power only, for a wall adapter rated under 35 W when the host cannot supply enough |
| USB-C host, data and power | Right | The primary connection: MIDI and power over one cable |

Only the right-hand USB-C port carries data, so a Sway that enumerates no MIDI
port is often plugged into the centre one. The box ships the controller, two
USB-C cables, a quick-start card and warranty information.

## Factory MIDI map (Base Project V2)

The map was recovered from Audima's own artifacts (the Base Project V2 `.swayproj`, the decompiled Ableton remote script, and the inflated Cubase script) and is not officially published. Every binding is overridable at runtime via MIDI-learn ([MIDI.md](MIDI.md#midi-learn)).

Everything transmits on MIDI channel 1 (0-indexed `0` in code) except where the table flags otherwise.

| Control | Message | Value(s) | Confidence |
|---|---|---|---|
| Full-surface hand tracking X | CC | 50 | Confirmed |
| Full-surface hand tracking Y | CC | 38 | Confirmed |
| Gesture isolation: Pulse (vertical bounce energy) | CC | 35 | Confirmed |
| Gesture isolation: Press (downward press depth) | CC | 36 | Confirmed |
| Gesture isolation: Sway (lateral sway amount) | CC | 37 | Confirmed |
| X-trigger / Y-modulation paired regions | CC | 73 (X) / 74 (Y) | Confirmed |
| Knobs 1 to 8, rotation | CC | 20 to 27 | Confirmed |
| Knobs 1 to 8, press | CC | A second, independent CC per the manual, so a press is never a note. Numbers not established; resolvable with one hardware MIDI-monitor session | Mechanism confirmed, numbers (unconfirmed) |
| 8 mappable buttons, defaults | CC | The manual states CC, configurable per preset, which settles the earlier CC-versus-note question. Numbers not established | Kind confirmed, numbers (unconfirmed) |
| 16 drum pads, factory layout | Note On/Off | B natural minor Theory Engine grid: `47 49 50 52 54 55 57 59 61 62 64 66 67 69 71 73` (low to high) | Confirmed |
| 16 drum pads, Audima Ableton demo packs and SwayCommand's internal normalization | Note On/Off | Chromatic 24 to 39 -> pad index 0 to 15 | Confirmed |
| 16 drum pads, on-device default | Note On/Off | The manual's Figure 15 shows one eight-pad block as E0 F0 F#0 G0 over C1 C#1 D1 D#1, which is neither the Theory Engine grid nor the chromatic run. Treat it as a third layout the device can ship in, not a correction to either row above | (unconfirmed) |
| Pad transmit channel | n/a | 1 per the `.swayproj`, 16 per the official Ableton script; SwayCommand accepts both (`channels: [0, 15]`) | (unconfirmed) |
| Sleep / wake | Program Change (bank 0) | PC 37 = sleep, PC 38 = wake | Confirmed |
| MPE | Per-region flag in projects | Zone and channel details unpublished | (unconfirmed) |

SwayCommand maps all CCs to 0..1 and pad velocities to 0..1 in the control state constructed by `createControlState()` in `src/renderer/midi/swaymap.js`; consumers read that state, never raw MIDI. Routing and normalization details: [MIDI.md](MIDI.md#message-routing).

## Driver matrix

| OS | Normal mode (MIDI) | DFU mode (firmware update) |
|---|---|---|
| Windows 10+ | Driverless (class-compliant USB-MIDI) | Requires the ST WinUSB driver for `USB\VID_0483&PID_DF11` |
| macOS | Driverless | No driver at any point |
| Linux | Driverless (ALSA) | No driver at any point |

Audima's official Windows DFU driver package is <https://cdn.audima.com.au/software/Windows%20DFU%20Driver.zip>. It contains `STM32Bootloader.inf` and an ST-signed `.cat`; [`src/main/driver-install.js`](../src/main/driver-install.js) stages the extracted INF with `pnputil /add-driver <inf> /install` under a user-approved UAC elevation. The package is licensed under ST's SLA0048, which permits bundling with notices retained.

SwayCommand installs nothing by default; the driver installs only from an explicit Doctor fix click. Two Doctor checks offer that fix on Windows: the Sway USB check, when a device at `0483:DF11` is detected, and the driver check, whenever `STM32Bootloader.inf` is absent from the driver store (`pnputil /enum-drivers`).

## Audima CDN interface

`cdn.audima.com.au` and `audima.com.au` return HTTP 403 to requests whose User-Agent contains curl, python, or Go tool signatures; any honest custom User-Agent passes. SwayCommand sends `AUDIMA.USER_AGENT` from `src/shared/constants.js` (`SwayCommand/0.1 (Sway companion; +https://github.com/swaycommand)`) and never falls back to a default `curl/...` or `python-requests/...` value. The CDN supports Range/206 requests and requires no authentication. The blocking rules can tighten at any time (for example, to a JavaScript challenge); on fetch failure the Doctor offers a fix action that opens <https://audima.com.au/downloads/> in the system browser.

The download layer in [`src/main/audima.js`](../src/main/audima.js) enforces an HTTPS-only host allowlist (`cdn.audima.com.au`, `audima.com.au`, `www.audima.com.au`), a 15-second default timeout (10 minutes for artifact downloads), and writes downloads to a `.part` file renamed only on completion.

### Version manifest

The Tauri updater manifest is queried first; pinned URLs (`AUDIMA.FALLBACK_APP_*` in `constants.js`) are used only when the manifest is unreachable, malformed, or missing the platform entry, because pinned version directories have been deleted before (the v1.0.x directories are gone). Audima ships no Linux build of the companion application.

Endpoint: <https://cdn.audima.com.au/software/latest.json>. Manifest shape (standard Tauri updater):

```json
{
  "version": "1.2.1",
  "platforms": {
    "windows-x86_64": { "url": "https://cdn.audima.com.au/software/v1.2.1/...", "signature": "<minisign>" },
    "darwin-aarch64":  { "url": "...", "signature": "..." },
    "darwin-x86_64":   { "url": "...", "signature": "..." }
  }
}
```

### Minisign verification

Audima's MSIs are not Authenticode-signed; the minisign signature is the only integrity mechanism. The public key, embedded in Audima's own application:

```
RWSHmZALaQgTB08RzBn8ecTwgikkFPA5K01eHmEKTds/Th8QYzV6UlpX
```

The verification algorithm, implemented in `minisignVerify()` in `src/main/audima.js`:

1. The public key decodes from base64 to 42 bytes: the ASCII tag `Ed`, an 8-byte key id, and a 32-byte Ed25519 public key.
2. The signature decodes from base64 to 74 bytes: a 2-byte algorithm tag (`ED` or `Ed`), an 8-byte key id, and a 64-byte signature. Tauri manifests carry the entire `.sig` file base64-encoded; both the raw text and the encoded form are accepted, and comment lines are discarded.
3. The signature's key id must equal the public key's key id.
4. With tag `ED` (prehashed), the Ed25519 signature is verified over the BLAKE2b-512 digest of the file; with tag `Ed` (legacy), over the file bytes directly.

The flow: fetch `latest.json`, download the platform artifact to the user's Downloads folder, verify the minisign signature, and only then hand the file to the OS installer. A failed verification deletes the download. The pinned fallback URLs carry no signature; a fallback download is opened with an explicit unverified notice. Final fallback: the downloads page in the browser.

Audima's terms and conditions prohibit redistributing their content (<https://audima.com.au/terms-and-conditions/>), so SwayCommand distributions never bundle Audima binaries; fetching onto the user's machine at the user's request is the compliant path. The ST DFU driver alone may be bundled under SLA0048.

## Serial write prohibition

SwayCommand never writes to the Sway's CDC serial interface. This is a hard policy, for three reasons established during research:

1. The official application's serial protocol (Handshake, SendProjectFragment*, EEPROM upload, ACK/retry) was identified in the Tauri executable, but the wire framing (CRC polynomial, baud rate, ACK bytes) is not statically recoverable.
2. `.swayproj` is a versioned raw EEPROM image, and the format has already changed once (the `FF 02` prefix).
3. Audima's own application ships a deliberate `corrupt_eeprom` test demonstrating that a bad write soft-bricks the device's stored configuration.

The supported alternative: any SwayCommand-tuned preset is authored as a `.swayproj` in Audima's own Sway Software, shipped as a file, and pushed to the device with Audima's application, no reverse engineering, no brick risk. The Base Project V2 factory map (<https://cdn.audima.com.au/software/Audima%20Labs%20The%20Sway%20V2.swayproj>) plus runtime MIDI-learn covers every remaining case. Direct device configuration would be revisited only under an Audima partnership (contactus@audima.com.au, <https://discord.com/invite/CYUrJXjjN4>).

## Official resources

Everything Audima publishes about the device, for anyone who needs the primary
source rather than this project's reading of it.

| Resource | Link |
|---|---|
| Product site | <https://audima.com.au/> |
| Downloads: companion application, drivers, DAW scripts | <https://audima.com.au/downloads/> |
| User manual, PDF | <https://cdn.audima.com.au/docs/Audima%20Labs%20The%20Sway%20User%20Manual.pdf> |
| Firmware update guide, PDF | <https://cdn.audima.com.au/docs/Audima%20Labs%20The%20Sway%20Firmware%20Update%20Guide.pdf> |
| Firmware archive | <https://cdn.audima.com.au/firmware/v1.3.0.zip> |
| Windows DFU driver | <https://cdn.audima.com.au/software/Windows%20DFU%20Driver.zip> |
| Version manifest the Doctor reads | <https://cdn.audima.com.au/software/latest.json> |
| Ableton Live 12 remote script | <https://cdn.audima.com.au/daws/ableton/Audima%20Labs%20The%20Sway%20Ableton%20Live%2012.zip> |
| Cubase MIDI Remote script | <https://cdn.audima.com.au/daws/cubase/Audima%20Labs%20The%20Sway%20Cubase.midiremote> |
| Base Project V2, the factory map source | <https://cdn.audima.com.au/software/Audima%20Labs%20The%20Sway%20V2.swayproj> |
| Terms and conditions | <https://audima.com.au/terms-and-conditions/> |

SwayCommand never redistributes any of these. The Doctor downloads the driver
package and the companion installer directly from Audima on request, verifies
the installer against Audima's published minisign signature, and opens it.
Everything else here is a link a reader follows themselves.

## Sources

Every claim above traces to a primary source listed in [RESEARCH.md](RESEARCH.md): the firmware descriptor and USB identity to the official firmware archive, the factory map to the Base Project V2 file and the DAW scripts, the CDN behavior to empirical verification dated 2026-08-19, and the serial-protocol findings to binary analysis of the companion application's installer.

The physical layout and the I/O table come from section 08 of the user manual. The manual itself is Audima's copyrighted document and is not redistributed here; the [Official resources](#official-resources) section links to it.
