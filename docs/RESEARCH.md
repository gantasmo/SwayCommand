# Research record

This document condenses the SwayCommand technical brief. All findings were research-verified on **2026-08-19**. Every factual claim in the [README](../README.md) and in `src/shared/constants.js` and `src/renderer/midi/swaymap.js` traces to a URL in this document. Items not officially published by Audima are marked **[recovered]**; open questions are marked **[UNCERTAIN]**.

## Product identity

The Sway is a gesture MIDI controller made by Audima Labs Pty Ltd (Australia; founders Jeremy Buckley and Isaac Jack). Sixteen overlapping infrared distance sensors read hands moving in the air above the unit and convert the motion to standard MIDI. The Sway is hardware; it is not software, and it is not itself audio-reactive. Audima defines six gesture dimensions: Strike, Sway, Pulse, Glide, Press, Sculpt (<https://audima.com.au/>).

| Attribute | Fact |
|---|---|
| Sensing | 16 overlapping IR distance sensors |
| Lighting | 16 RGB LED beam and motion-reactive LEDs |
| Display | 3.2" OLED |
| Knobs | 8 click knobs |
| Pads and buttons | 16 drum pads plus 8 mappable buttons, not "20 pads"; confirmed from manual Fig. 14 |
| Preset buttons | 6 |
| Power control | Scroll-click power wheel |
| Dimensions | 45 × 17 × 4 cm |
| Onboard mapping | "Theory Engine" note/scale/chord grid |
| Processor | Dual-core STM32H7 with separate CM7 and CM4 firmware images; DFU-updatable |

Hardware sources: <https://www.indiegogo.com/en/projects/audimalabs/sway-the-world-s-most-expressive-midi-controller> , <https://cdn.audima.com.au/docs/Audima%20Labs%20The%20Sway%20User%20Manual.pdf>. Processor source: <https://cdn.audima.com.au/firmware/v1.3.0.zip>.

Commercial and community status:

| Fact | Value |
|---|---|
| Retail price | US$830 |
| Crowdfunding | A$213,900 raised on Indiegogo from 244 backers |
| Delivery | Batches 1 to 3 delivered; Batch 4 pre-orders opened approximately 2026-08-18, shipping November-December 2026 |
| Community size | 244 Indiegogo backers plus batch sales; a Discord server of approximately 1,500 members |

Commercial sources: <https://audima.com.au/faqs/> , <https://audima.com.au/updates/>. Community sources: the Indiegogo page above, <https://discord.com/invite/CYUrJXjjN4>.

Community assessment: forum discussion characterizes the tracking as effectively XY hand position (approximately 2 DOF per hand) and records skepticism about polyphony and fatigue (<https://community.polyexpression.com/t/audima-labs-sway/2050>).

## Downloads inventory

The inventory below is complete as of the verification date. All Audima downloads are hosted on `cdn.audima.com.au`. The CDN and audima.com.au return HTTP 403 for User-Agents containing curl, python, or Go tool signatures; any other User-Agent (including a custom honest one) passes (verified empirically). Range/206 requests are supported; no authentication is required. Sources: <https://audima.com.au/downloads/> (behavior), <https://cdn.audima.com.au/robots.txt>.

### Sway Software

The companion application is built on Tauri 2.10.3 (Rust). No Linux, iOS, or Android build exists.

| Item | URL | Platform |
|---|---|---|
| v1.2.1 Windows MSI (actual latest) | <https://cdn.audima.com.au/software/v1.2.1/The.Sway_1.2.1_x64_en-US.msi> | Windows x64 |
| v1.2.0 Windows MSI (site-linked) | <https://cdn.audima.com.au/software/v1.2.0/The.Sway_1.2.0_x64_en-US.msi> | Windows x64 |
| v1.2.0 macOS Apple Silicon DMG | <https://cdn.audima.com.au/software/v1.2.0/The.Sway_1.2.0_aarch64.dmg> | macOS arm64 |
| v1.2.0 macOS Intel DMG | <https://cdn.audima.com.au/software/v1.2.0/The.Sway_1.2.0_x64.dmg> | macOS x64 |

The version endpoint <https://cdn.audima.com.au/software/latest.json> is a standard Tauri updater manifest (currently 1.2.1) carrying per-platform URLs and minisign signatures. The minisign public key `RWSHmZALaQgTB08RzBn8ecTwgikkFPA5K01eHmEKTds/Th8QYzV6UlpX` is embedded in the Sway Software itself. The MSIs are not Authenticode-signed; minisign is the only integrity mechanism.

### Driver, firmware, and documentation

| Item | URL | Notes |
|---|---|---|
| Windows DFU driver | <https://cdn.audima.com.au/software/Windows%20DFU%20Driver.zip> | STM32Bootloader.inf (WinUSB for `USB\VID_0483&PID_DF11`), ST-signed .cat, installer exes, pnputil .bat. Required only for firmware updates on Windows; normal MIDI use is driverless on Windows 10+, macOS, and Linux. Licensed under ST **SLA0048** (embedded in the INF), which permits redistribution with notices retained |
| Firmware v1.3.0 (latest) | <https://cdn.audima.com.au/firmware/v1.3.0.zip> | CM7.bin plus CM4.bin; v1.0.0 to v1.2.0 at the same URL pattern. The site publishes no standalone firmware link; firmware is normally flashed via the Sway Software |
| User manual (37 pp, 14.8 MB) | <https://cdn.audima.com.au/docs/Audima%20Labs%20The%20Sway%20User%20Manual.pdf> | |
| Firmware update guide (18.5 MB) | <https://cdn.audima.com.au/docs/Audima%20Labs%20The%20Sway%20Firmware%20Update%20Guide.pdf> | |

### Projects and DAW scripts

Index: <https://audima.com.au/downloads/>.

| Item | URL |
|---|---|
| Base Project V2 (.swayproj, factory map) | <https://cdn.audima.com.au/software/Audima%20Labs%20The%20Sway%20V2.swayproj> |
| Ableton Live 12 remote script (compiled .pyc; Live 10/11 at sibling URLs) | <https://cdn.audima.com.au/daws/ableton/Audima%20Labs%20The%20Sway%20Ableton%20Live%2012.zip> |
| Cubase MIDI Remote | <https://cdn.audima.com.au/daws/cubase/Audima%20Labs%20The%20Sway%20Cubase.midiremote> |
| Demo packs | Vital (.swayproj), Logic (.logicx.zip plus Mappings.cs plus .swayproj), Ableton **Garage** (255 MB) / **DNB** (60.6 MB) / **Hip Hop** (69.2 MB), each with a matching .swayproj, all under `https://cdn.audima.com.au/daws/...` |

Audima publishes no SDK, no public API, no GitHub organization, no OSC support, and no MPE specification. Sources: <https://audima.com.au/downloads/> , <https://github.com/wavestat3/SwayAI> (the only third-party repository, confirming the absence).

### Redistribution terms

Audima's terms and conditions prohibit redistributing Audima content without written permission (<https://audima.com.au/terms-and-conditions/>). SwayCommand therefore never bundles the MSI or the driver zip; an install-time fetch onto the user's machine is compliant. The ST DFU driver alone may be bundled under SLA0048 with notices retained. Contact for partnership or permission: contactus@audima.com.au , <https://discord.com/invite/CYUrJXjjN4>.

## USB identity and MIDI integration

The runtime USB identity comes from the official firmware descriptors, is authoritative, and is stable across firmware v1.0.0 to v1.3.0:

| Attribute | Value |
|---|---|
| VID / PID (normal operation) | `0x0483` / `0x52A4`, composite device (IAD) |
| Interface 1 | CDC-ACM serial, the proprietary companion-app protocol |
| Interface 2 | Class-compliant USB-MIDI, single 1×1 port pair |
| Manufacturer string | "Audima Labs" |
| Product / MIDI port name | Exactly "Audima Labs The Sway" on Windows and macOS; the Cubase script's cross-platform equals-match filter confirms the exact string |
| DFU mode | `0483:DF11` (STM32 ROM bootloader) |

Sources: <https://cdn.audima.com.au/firmware/v1.3.0.zip> , <https://cdn.audima.com.au/daws/cubase/Audima%20Labs%20The%20Sway%20Cubase.midiremote>.

Integration is plain MIDI: notes, CC, Program Change, plus a per-region MPE flag in projects. Reliable device detection reads the USB VID/PID device node (`pnputil`/`Get-PnpDevice` on Windows, `system_profiler` on macOS, `lsusb` on Linux, the method implemented in `src/main/doctor.js`); matching serial ports by friendly name is unreliable and is not used.

## Factory MIDI map

**[recovered]** The map below was decoded from the Base Project V2 binary, the decompiled official Ableton .pyc, and the inflated Cubase script. Confidence is high, but Audima has not published the map officially. Sources: <https://cdn.audima.com.au/software/Audima%20Labs%20The%20Sway%20V2.swayproj> , <https://cdn.audima.com.au/daws/ableton/Audima%20Labs%20The%20Sway%20Ableton%20Live%2012.zip> , User Manual p. 35.

| Control | Factory binding |
|---|---|
| MIDI channel | 1 (everything) |
| Full-surface XY tracking | X = CC 50, Y = CC 38 |
| Gesture isolation: Pulse | CC 35 |
| Gesture isolation: Press | CC 36 |
| Gesture isolation: Sway | CC 37 |
| X-trigger / Y-mod region pairs | e.g. CC 73 / CC 74 |
| Knobs 1 to 8 (rotation) | CC 20 to 27 |
| 16 drum pads | B-minor Theory Engine notes by default; Audima's Ableton demo projects remap pads to chromatic notes 24 to 39 |
| Sleep / wake | Program Change bank 0, PC 37 / PC 38 |

**[UNCERTAIN]** The following items require one hardware MIDI-monitor session to resolve:

| Item | Open question |
|---|---|
| Knob press | CC numbers unknown |
| Mappable buttons | Defaults unknown (CC vs. notes) |
| Pad transmit channel | The .swayproj states channel 1; the official Ableton script listens on channel 16. SwayCommand accepts both |
| MPE | Zone and channel details unknown |

### Serial and EEPROM write prohibition

Programmatic device configuration was evaluated and rejected. The Sway Software's serial protocol (Handshake, SendProjectFragment*, EEPROM upload, ACK/retry) was recovered from the Tauri executable, but the wire framing (CRC polynomial, baud rate, ACK bytes) is not statically recoverable. The `.swayproj` format is a versioned raw EEPROM image whose layout has already changed once (`FF 02` prefix). The Sway Software ships a deliberate `corrupt_eeprom` test demonstrating that bad writes **soft-brick the stored configuration**. SwayCommand does not write to the device; the write-prohibition policy is recorded in [SWAY_INTEGRATION.md](SWAY_INTEGRATION.md). Source: binary analysis of <https://cdn.audima.com.au/software/v1.2.0/The.Sway_1.2.0_x64_en-US.msi>.

## Prior art

### Source projects

SwayCommand reuses ideas from three projects.

#### theDAW

<https://github.com/gantasmo/theDAW> (MIT). GANTASMO's local-first all-in-one AI music studio: a Python 3.10 FastAPI backend, a React 19 / Vite 7 / Tailwind 4 / Zustand 5 frontend, PyTorch on CUDA 12.8, a three.js/WebGL VJ engine ("VJ-9000"), approximately 110 auto-detected MIDI controller profiles, and a Quest 3 XR companion over ADB. Ideas reused in SwayCommand: MIDI learn-by-capture with controller profiles, the local-first rule that nothing downloads at startup, VJ-9000 GLSL patterns, and the installer approach. Releases: <https://github.com/gantasmo/theDAW/releases>.

#### Akvj

<https://github.com/keijiro/Akvj> (Unlicense / public domain). Keijiro Takahashi's automated VJ rig: Unity 2019.4.15f1 HDRP with Azure Kinect input via `jp.keijiro.akvfx 1.0.4`, plus `kino.post-processing 2.1.15`, `klak.motion 1.0.1`, `metamesh 0.0.6`, and `noiseshader 1.0.0` (manifest: <https://raw.githubusercontent.com/keijiro/Akvj/master/Packages/manifest.json>). Akvj has no audio or MIDI input. Ideas reused: the **VfxController pattern** (random cycling of two effect groups with fades), ColorMaster palette syncing, and the adjust/perform mode toggle. The hardware dependency was not reused: the Azure Kinect DK was discontinued in October 2023 **[UNCERTAIN]** (noted in the research open questions, not primary-sourced).

#### Metavido and MetavidoVFX

<https://github.com/keijiro/Metavido> , <https://github.com/keijiro/MetavidoVFX> (Unlicense). A volumetric video format that burns camera pose, depth, and stencil into ordinary .mp4 frames, decoded in Unity 6 (6000.0) with URP 17.0.4; package `jp.keijiro.metavido 5.1.1` via the `jp.keijiro` scoped registry (registry.npmjs.com). MetavidoVFX adds `VFXMetavidoBinder` and ready VJ effects (Voxels, Particles, Ribbons, Swarm, Warp, among others) with a runtime `VfxSwitcher`, and a WebGPU browser build: <https://play.unity.com/games/f4e0ea34-bd6d-4b2d-b24d-69ffa6e88795/metavido>. Sample footage: <https://huggingface.co/keijiro-tk/metavido-data>.

### Third-party software survey

No VJ or visualizer application for the Sway has shipped. The niche is empty.

| Finding | Detail |
|---|---|
| Only genuine third-party Sway software | <https://github.com/wavestat3/SwayAI>, a web configuration editor (React/TypeScript); 1 star, no releases, device-push is a stub, and its JSON schema diverges from the Sway Software's |
| Adjacent project | <https://github.com/SenProduction/virtual-dj-gesture-mixer> is "inspired by" the Sway (webcam/MediaPipe); no device integration |
| Physical accessories | One stand exists: <https://st3nd.com/product/stand-audima-labs-sway-30-dual/> |
| Owner practice | Owners hand-map the Sway into TouchDesigner, Pangolin, and projection rigs; nothing has been released (<https://audima.com.au/reviews/>) |
| Distribution channels | Nothing on itch.io; no GitHub organization; zero community software in the forum threads (<https://community.polyexpression.com/t/audima-labs-sway/2050> , <https://www.elektronauts.com/t/audima-labs-sway-midi-controller/242226>) |

### Comparable applications

Each nearest comparable implements exactly one ingredient of the combined install-to-performance flow that SwayCommand targets:

| Application | Single ingredient |
|---|---|
| Resolume | Auto-opening Example composition (<https://resolume.com/forum/viewtopic.php?t=22202>) |
| Synesthesia | Approximately 80 ready audio-reactive scenes (<https://synesthesia.live/>) |
| VDMX | Per-controller templates; macOS-only (<https://docs.vidvox.net/vdmx/vdmx_templates>) |
| Serato | On-connect driver prompt (<https://support.serato.com/hc/en-us/articles/360000156476>) |

No application combines an installer, driver handling, and auto-opening controller-tuned example projects; Audima itself leaves its DFU driver as a manual zip. That combined flow is SwayCommand's gap.

## Risk register

Risks are ranked by severity.

| Rank | Risk | Mitigation or resolution |
|---|---|---|
| 1 | Cloudflare rules on cdn.audima.com.au can change from a User-Agent blocklist to a JavaScript challenge at any time; behavior was tested from one region only | SwayCommand ships graceful failure and a browser fallback to <https://audima.com.au/downloads/>. Behavior of <https://cdn.audima.com.au/software/latest.json> was verified empirically 2026-08-19 |
| 2 | Factory-map unknowns: knob-press CCs, mappable-button defaults, pad channel (1 vs. 16), MPE details | Resolvable with a single hardware MIDI-monitor session |
| 3 | Format and firmware churn: `.swayproj` has changed layout once; pinned CDN version directories have been deleted before (v1.0.x is gone) | `latest.json` is preferred over pinned URLs |
| 4 | No Audima permission yet for automated fetching; the terms and conditions are silent on automation | An email to contactus@audima.com.au would fully de-risk the practice |
| 5 | Market size: 244 Indiegogo backers plus batch sales, an approximately 1,500-member Discord | Design rule: the Sway is the primary input, but any class-compliant MIDI controller works |
| 6 | SmartScreen friction: Audima's MSI is unsigned | SwayCommand's own installer must be Authenticode-signed to avoid the same friction |
