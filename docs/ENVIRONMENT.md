# Environment

This document covers the environment variables the application reads, the renderer query parameters, the automation handle for headless verification, the settings file, on-disk data locations, and the complete list of network endpoints. Process model and IPC surface: [ARCHITECTURE.md](ARCHITECTURE.md). System overview: [OVERVIEW.md](OVERVIEW.md).

## Environment variables

All seven variables are read in `src/main/main.js`. Four exist for automated verification (`SWAYCOMMAND_SHOT`, `SWAYCOMMAND_SHOT_DELAY`, `SWAYCOMMAND_PROBE`, `SWAYCOMMAND_WINDOW`), two preset the renderer's query parameters, and `SWAYCOMMAND_ANGLE` picks the graphics backend before the app is ready.

| Variable | Value | Default | Behavior |
|---|---|---|---|
| `SWAYCOMMAND_SHOT` | Output PNG path | unset | Screenshot mode. After the renderer's `did-finish-load` event plus the configured delay, the main process captures the page (`webContents.capturePage`), writes the PNG to the given path, logs `[shot] saved <path>` (or `[shot] failed:` with the error), and quits the application in either case. |
| `SWAYCOMMAND_SHOT_DELAY` | Milliseconds | `5000` | Delay between `did-finish-load` and the capture. Read only when `SWAYCOMMAND_SHOT` is set. |
| `SWAYCOMMAND_PROBE` | JavaScript expression | unset | DOM probe. 3000 ms after `did-finish-load`, the expression is evaluated in the renderer via `webContents.executeJavaScript`; the result is logged to stdout with a `[probe]` prefix (strings verbatim, other values JSON-encoded); a failure logs `[probe] failed:` with the error message to stderr. The application keeps running. |
| `SWAYCOMMAND_WINDOW` | `<width>x<height>`, e.g. `960x600` | unset | Forces the initial window size so narrow layouts can be screenshot-tested headlessly. |
| `SWAYCOMMAND_AUTOPLAY` | Template id, or a `.sway` file path | unset | Forwarded to the renderer as the `autoplay` query parameter of `dist/index.html`. |
| `SWAYCOMMAND_SCENE` | Scene id | unset | Forwarded to the renderer as the `scene` query parameter. |
| `SWAYCOMMAND_ANGLE` | ANGLE backend name (`gl`, `d3d11`, `vulkan`), or `default` | `gl` | The graphics backend ANGLE translates the shaders through, applied as Chromium's `--use-angle` before the app is ready. The default is **`gl`** because the D3D11 backend compiles through fxc, which fully unrolls and inlines: the first draw of Nature's Tomb cost 132 s on D3D11 against 12 s on GL, and a cache-warm first draw 2.9 s against 0.29 s, for between −0.1 and +1.9 ms a frame at 1080p tier med. Set `d3d11` to restore the old backend, or `default` to let Chromium choose. The program cache is raised to 512 MB at the same point and is not configurable, at Chromium's default the two big scenes' binaries evict each other and neither is ever cached, so every launch pays the full compile. |

`SWAYCOMMAND_SHOT` and `SWAYCOMMAND_PROBE` register independent `did-finish-load` timers and can be combined; screenshot mode quits the application once its own delay elapses, so a probe result appears only when the probe timer (3000 ms) fires first. Launch examples:

```powershell
# PowerShell: capture the cockpit (door open, template loaded) after 8 s
$env:SWAYCOMMAND_AUTOPLAY = 'first-flight'; $env:SWAYCOMMAND_SHOT = "$PWD\shot.png"; $env:SWAYCOMMAND_SHOT_DELAY = '8000'; npm start
```

```sh
# POSIX shells: open a saved project file on a specific scene
SWAYCOMMAND_AUTOPLAY="$HOME/Documents/SwayCommand Projects/My Set.sway" SWAYCOMMAND_SCENE=warp npm start
```

### ELECTRON_RUN_AS_NODE caveat

When `ELECTRON_RUN_AS_NODE` is present in the environment (typically inherited when the application is launched from a tool that is itself an Electron process) the `electron` binary behaves as a plain Node.js interpreter. `require('electron')` then does not return the Electron API, `app` is `undefined`, and startup fails at the `app.whenReady()` call in `src/main/main.js` with:

```
TypeError: Cannot read properties of undefined (reading 'whenReady')
```

The variable must be cleared before a development launch (`npm start`, `electron .`):

```powershell
Remove-Item Env:ELECTRON_RUN_AS_NODE   # PowerShell
```

```sh
unset ELECTRON_RUN_AS_NODE             # POSIX shells
```

## Query parameters

Both parameters are consumed once, in `main()` of `src/renderer/app.js`, from `location.search`. In normal operation they are supplied by the main process from `SWAYCOMMAND_AUTOPLAY` and `SWAYCOMMAND_SCENE`.

| Parameter | Value | Behavior |
|---|---|---|
| `autoplay` | Template id, or a `.sway` file path | A value ending in `.sway` (case-insensitive) is opened as a project file; anything else is opened as a template id. On failure the startup falls through to the normal selection (most recent project, then the `first-flight` template) with a console warning. Any `autoplay` value also skips the SYSTEM modal: the blast door opens immediately and the Doctor still runs in the background, keeping its checks reachable from the CONTROLS modal. |
| `scene` | Scene id | Applied after the boot project loads: Auto-VJ is disabled and the engine switches to the named scene via `setScene(scene, 0.3)`. The value is one of the sixteen ids in the scene registry (`src/renderer/engine/scenes/index.js`): `beams`, `swarm`, `ribbons`, `voxels`, `nebula`, `mandelbulb`, `cymatic`, `spectra`, `vjshader`, `ferrofluid`, `chladni`, `valley`, `lattice`, `willidream`, `naturestomb`, `miraclemile`. `setScene` ignores an id with no registered creator, so an unknown value leaves the project's opening scene on stage with Auto-VJ still disabled. |

## The automation handle

The renderer exposes `window.__swaycommand` for `SWAYCOMMAND_PROBE` expressions (the page CSP admits no other script path). Its shape:

```
{ state, studio, openStudio(tab), openDocs, renderPads, renderSamples,
  transport, projectStore, router, selectControl, openProject, saveProject }
```

`state` carries the live modules (`engine`, `midi`, `audio`, `sampler`, `synth`, `transport`, `router`, `projectStore`) plus the `entered` flag (whether the blast door has opened). There is no `state.screen`, the cockpit is one page; probes that branched on the active screen should read `state.entered`, the drawer, or the modal states instead. Working probe examples:

```powershell
# scene registry size and current scene
$env:SWAYCOMMAND_PROBE = "JSON.stringify({ scenes: __swaycommand.state.engine.sceneList.length, now: __swaycommand.state.engine.currentScene.id })"

# frame health and the warm pipeline: worst frame (ms, raw delta), frames past 50 ms, the first forty stalls, per-scene warm costs
$env:SWAYCOMMAND_PROBE = "(async () => { const e = __swaycommand.state.engine; await new Promise(r => setTimeout(r, 8000)); return JSON.stringify({ worst: e.stats.worst, slow: e.stats.slow, log: e.stats.stallLog, warm: e.stats.warm }); })()"
# (SWAYCOMMAND_SHOT_DELAY must exceed 3000 + 8000 here)

# project document state: path, name, dirty flag, media count
$env:SWAYCOMMAND_PROBE = "JSON.stringify({ ...__swaycommand.projectStore.state, media: __swaycommand.projectStore.project().media.length })"

# transport clock and timeline duration
$env:SWAYCOMMAND_PROBE = "JSON.stringify(__swaycommand.transport.state)"

# assignment table: how many pads and knobs are mapped
$env:SWAYCOMMAND_PROBE = "(() => { const a = __swaycommand.router.getAssignments(); return JSON.stringify({ pads: a.pads.filter(Boolean).length, knobs: a.knobs.filter(Boolean).length, routes: a.gestures.length }); })()"

# drive the interface: open the kit drawer and select pad 0
$env:SWAYCOMMAND_PROBE = "__swaycommand.openStudio('kit'); __swaycommand.selectControl('pad:0'); 'ok'"
```

`openProject(path)` and `saveProject()` call straight into the project store; `openStudio(tab)` opens the drawer (`synth`, `rack`, or `kit`); `renderPads` and `renderSamples` refresh the deck labels and the KIT list.


## The offscreen scene harness

Scene work does not need the app at all. `node scripts/scene-harness.js <plan.json>` bundles the scene registry with esbuild, opens a **hidden** Electron window (no focus steal, no MIDI port taken, the app untouched), creates scenes with the same creation context the engine passes, drives `update()` with a patched `io` per planned shot, saves a PNG still per shot, and prints one JSON report: per shot `updateMs` (CPU, per frame), `msPerFrame` (a 40-frame burst closed by a pipeline-draining `readPixels`), `gpuMs` (the GPU's own per-frame time from `EXT_disjoint_timer_query_webgl2`, `null` where the driver does not expose it), and the hooked console errors and warnings, a shader that fails to compile shows there. The plan format is in the file's header; a shot's `io` patch takes `knobs`, `xy`, `gestures`, `bands`, `level`, `beat`, `intensity`, `palette`, `strike` (one pad) or `strikes` (several together), `transport` (`{ playing, time }`), and, for scenes that declare a control surface ([SCENE_CONTRACT.md](SCENE_CONTRACT.md#the-scene-control-surface)), `actions` (fired through `action()` on the first frame) and `params` (set through `setParam()` before the frames). Shots run in order on cached instances, so state carries from one to the next. Clear `ELECTRON_RUN_AS_NODE` before running it, as for any Electron launch.

## Settings file

The settings file lives at `<userData>/settings.json`, with `userData` resolved by Electron's `app.getPath('userData')`. The file does not exist until the first `settings:set` call; all access is synchronous (`fs.readFileSync` / `fs.writeFileSync`). Read, merge, and write semantics, from `src/main/main.js`:

- `settings:get` parses the file as JSON and returns `{}` when the file is missing or unparsable.
- `settings:set` shallow-merges the patch over the current file contents (`{ ...current, ...patch }`), creates the `userData` directory when absent, writes the result as JSON with two-space indentation, and returns the merged object. The merge is shallow: a nested object in the patch replaces the stored one wholesale.
- Keys the application does not recognize survive every write.

Keys in use:

| Key | Writer | Reader |
|---|---|---|
| `midiOverrides` | The router after every completed LEARN (`learnBinding` passes `midi.getOverrides()` to `settings:set`) | Applied at startup via the MIDI module's `setOverrides`; shape defined in `src/renderer/midi/midi.js` |
| `recentProjects` | The main process on every project open and save (up to 10 entries; missing paths pruned on read) | The project menu's RECENT section and the startup project selection |
| `lastProjectDir` | The main process after every open/save dialog | The next dialog's starting directory |
| `kit` | No current writer (pre-cockpit builds wrote it) | Restored once at startup as a legacy kit; the kit now lives in the project file |
| `layout` | The layout module (`src/renderer/ui/layout.js`) ~300 ms after a grip drag, a grip double-click, or a collapse chip | Applied at startup: `{ railLeft, railRight, tl, deck, input, collapsed: { railLeft, railRight, tl, deck, assign, input } }`, panel sizes in px (a missing key means the CSS default) and which regions are collapsed |

## Data locations

| Item | Location |
|---|---|
| `userData` (Windows) | `%APPDATA%\SwayCommand` |
| `userData` (macOS) | `~/Library/Application Support/SwayCommand` |
| `userData` (Linux) | `~/.config/SwayCommand` |
| Settings file | `<userData>/settings.json` |
| Default `.sway` save directory | `~/Documents/SwayCommand Projects` (created on first save; the dialogs accept any location outside the application directory) |
| Bundled templates | `projects/templates/*.sway` at the package root, the repository root in development, the `resources/app.asar` root when packaged |
| Downloaded Sway Software installer | The system Downloads folder (`app.getPath('downloads')`); the file name is taken from the download URL |
| DFU driver package | `<userData>/audima/dfu-driver.zip`, extracted to `<userData>/audima/dfu-driver/` |
| Installed application (Windows) | `%LOCALAPPDATA%\Programs\swaycommand` |
| Bundled documentation read by the in-application modal | `README.md` and `docs/*.md` at the package root, the repository root in development, the `resources/app.asar` root when packaged |

In-progress downloads use a `.part` suffix next to the destination and are renamed only on completion. Project saves are atomic: a `.tmp` file next to the destination, renamed into place.

## Network endpoints

Apart from the Doctor's reachability check at startup, every request below is user-initiated: downloads run only from an explicit fix click in the SYSTEM modal, never silently.

Every HTTP request the application makes goes through `audimaFetch` in `src/main/audima.js`, which refuses any URL that is not `https:` on `cdn.audima.com.au`, `audima.com.au`, or `www.audima.com.au`. Every request carries the User-Agent `SwayCommand/0.1 (Sway companion; +https://github.com/swaycommand)`; the CDN returns 403 to curl-, python-, and Go-style User-Agents, so the custom header is required. Default request timeout is 15 s; downloads are allowed 10 min; the Doctor's reachability check uses 5 s.

| Endpoint | Contacted when | Purpose |
|---|---|---|
| `https://cdn.audima.com.au/software/latest.json` | The Doctor's network check and the `fetch-companion` fix; the first successful response is cached in memory for the process lifetime | Reachability check; resolves the current Sway Software version, per-platform download URL, and minisign signature |
| Companion installer URL from the `latest.json` `platforms` entry | `fetch-companion` fix | Downloads the installer to the Downloads folder; the minisign signature is verified before the installer is opened, and a failed verification deletes the file |
| `https://cdn.audima.com.au/software/v1.2.1/The.Sway_1.2.1_x64_en-US.msi` | `fetch-companion` fix, Windows, when `latest.json` is unreachable or malformed | Pinned fallback installer; no signature is available for the fallbacks |
| `https://cdn.audima.com.au/software/v1.2.0/The.Sway_1.2.0_aarch64.dmg` | `fetch-companion` fix, macOS arm64 fallback | As above |
| `https://cdn.audima.com.au/software/v1.2.0/The.Sway_1.2.0_x64.dmg` | `fetch-companion` fix, macOS x64 fallback | As above |
| `https://cdn.audima.com.au/software/Windows%20DFU%20Driver.zip` | `install-dfu-driver` fix (Windows only) | Downloads Audima's STM32 WinUSB driver package into `<userData>/audima/` |
| `https://audima.com.au/downloads/` | `open-downloads-page` fix | Opened in the system browser, not fetched by the application |
| `https://cdn.audima.com.au/docs/Audima%20Labs%20The%20Sway%20User%20Manual.pdf` | `open-manual` fix | Opened in the system browser, not fetched by the application |

`latest.json` is a Tauri updater manifest of the shape `{ version, platforms: { <key>: { url, signature } } }`; `fetchLatest` rejects a response that lacks `version` or `platforms`, and redirects are followed. The platform keys the application selects:

| `process.platform` / `process.arch` | Manifest key |
|---|---|
| `win32` | `windows-x86_64` |
| `darwin` / `arm64` | `darwin-aarch64` |
| `darwin` / other | `darwin-x86_64` |
| `linux` | none, the `fetch-companion` fix reports that Audima ships no Linux companion build |

The Doctor's network check reports the manifest's version on success; on failure it downgrades to a warning and offers the `open-downloads-page` fix instead of retrying.

No other host is ever contacted. The renderer cannot reach the network at all (`connect-src 'self'` in the page CSP), and the `shell:openExternal` channel only hands allowlisted `https:` URLs to the system browser, the fifteen `EXTERNAL_ALLOW` entries tabulated in [ARCHITECTURE.md](ARCHITECTURE.md), including their subdomains. The list covers the hosts cited by the bundled documentation, so a link followed in the documentation modal reaches the system browser; a target outside the list is refused and the modal shows an inline notice with the URL instead. The documentation modal issues no network request of its own: `docs:list` and `docs:read` read Markdown from the package. Signature verification runs locally against the Ed25519 public key embedded in `src/shared/constants.js` and issues no additional request. The application contains no telemetry and performs no update check for itself; the version resolved from `latest.json` concerns Sway Software only.
