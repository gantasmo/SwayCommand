# Architecture

SwayCommand runs as a standard two-process Electron application: a main process with operating-system access and a context-isolated renderer that receives a fixed API surface through a preload script. This document covers the process model, the module inventory, the renderer page structure, the complete IPC surface, renderer bundling, the security model, and the packaged file layout. System-level context and terminology: [OVERVIEW.md](OVERVIEW.md). Environment variables and file locations: [ENVIRONMENT.md](ENVIRONMENT.md).

## Process model

| Process | Entry | Responsibility |
|---|---|---|
| Main | `src/main/main.js` | Window lifecycle, session permission handlers, IPC handlers, settings file, project loading, bundled-documentation access; delegates to `doctor.js`, `audima.js`, `driver-install.js` |
| Preload | `src/preload/preload.js` | Exposes `window.swaycommand` through `contextBridge`; the renderer has no other path to the main process |
| Renderer | `dist/renderer.bundle.js` (built from `src/renderer/app.js`) | The cockpit interface, MIDI input, audio analysis, sample/synth/timeline playback, WebGL rendering, documentation modal |

The `BrowserWindow` is created with `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: false`. Window parameters: 1440 × 900 default size, 960 × 600 minimum, background color `#05060a`, menu bar auto-hidden, shown only after the `ready-to-show` event. The window loads `dist/index.html` from disk via `loadFile`, with optional `autoplay` and `scene` query parameters taken from the `SWAYCOMMAND_AUTOPLAY` and `SWAYCOMMAND_SCENE` environment variables (see [ENVIRONMENT.md](ENVIRONMENT.md)).

On macOS, `activate` recreates the window when none exists; on every other platform, closing the last window quits the application.

## Module inventory

| File | Responsibility | Key exports |
|---|---|---|
| `src/main/main.js` | Entry point: window creation, permission handlers, IPC handlers, settings read/merge/write, project listing, bundled-documentation listing and reading, external-URL allowlist | none (entry point) |
| `src/main/doctor.js` | Main-process system checks: platform summary, Sway USB presence, Sway Software install state, DFU driver state, Audima CDN reachability | `runAll` |
| `src/main/audima.js` | Audima CDN client: host allowlist, `latest.json` fetch, downloads with progress, minisign verification | `fetchLatest`, `downloadCompanion`, `downloadDfuDriver`, `minisignVerify`, `audimaFetch` |
| `src/main/driver-install.js` | Windows DFU driver staging via `pnputil.exe` under a user-approved UAC elevation | `installDfuDriver` |
| `src/preload/preload.js` | `contextBridge` exposure of the IPC surface as `window.swaycommand` | none (side effect) |
| `src/shared/constants.js` | Sway USB identity, Audima endpoints and public key, application name | `SWAY`, `AUDIMA`, `APP` |
| `src/renderer/app.js` | Cockpit assembly, Doctor UI, documentation modal, keyboard and pointer input | none (bundle entry) |
| `src/renderer/markdown.js` | Dependency-free Markdown renderer for the documentation viewer, plus the heading-to-anchor slug rule | `renderMarkdown`, `slugify` |
| `src/renderer/engine/engine.js` | Render pipeline and Auto-VJ | `createEngine` |
| `src/renderer/engine/audio.js` | Audio analysis and the internal groove | `createAudioEngine` |
| `src/renderer/midi/midi.js` | MIDI detection, routing, MIDI-learn overrides | `createMidi` |
| `scripts/build-renderer.js` | esbuild renderer bundling into `dist/` | none (build script) |

## Page structure in app.js

The renderer is a single HTML document (the cockpit) with no screen switching. A CSS grid (`#cockpit`) lays out the top bar, the two rails, the stage cell, the timeline band, and the Sway deck; the drawer (`#drawer`) and the modals (`#modal-system`, `#modal-help`, `#modal-docs`) overlay it, and the render loop never stops for any of them. Region-by-region description: [OVERVIEW.md](OVERVIEW.md#the-cockpit).

The startup sequence in `main()`: fetch application info over `app:info`; create the audio engine, sampler, synth, and transport on one `AudioContext` (all three producers connect to the destination and the analyser); create the MIDI layer with the router as its event sink; create the render engine (quality tier `med`) and register the router as its frame hook; create the project store; assemble the UI modules (`src/renderer/ui/*.js`); restore `midiOverrides` from the settings file; expose `window.__swaycommand`; start the engine and audio (`autoStart`: live input when available, internal groove otherwise); load the boot project (`autoplay` parameter, else the most recent project, else the `first-flight` template); then either open the blast door directly (`autoplay`) or open the SYSTEM modal and run the Doctor.

### The SYSTEM modal (Doctor)

`runDoctor()` runs the main-process checks (`doctor:run`) and three renderer-local checks in parallel, then renders the combined list:

| Check id | Test | Possible statuses |
|---|---|---|
| `gpu` | WebGL2 context creation on a probe canvas | `ok`, `fail` |
| `midi` | WebMIDI availability and connected port (Sway, generic controller, or none) | `ok`, `warn` |
| `audio` | Audio input enumeration | `ok`, `info` |

The aggregate status is `fail` if any check failed, otherwise `warn` if any check warned, otherwise `ok`; checks with status `info` do not raise the aggregate. When the aggregate is `ok` (every check reports `ok` or `info`) a 1400 ms timer opens the blast door, provided the SYSTEM modal is still open. The auto-advance fires at most once per session (`state._autoAdvanced`). Manual paths exist regardless of status: the ENTER button (enabled after every run) and the RECHECK button. The modal is reachable later through the SYSTEM button in the CONTROLS modal.

A fix button click invokes `doctor:fix`; progress events arrive on `fix:progress` and are written into the check's progress element. On a successful fix the button is removed and the full Doctor re-runs.

### Input handling

One window-level key handler serves the whole page (key list: [README](../README.md#controls)); `Escape` peels the topmost layer (popover, drawer, modal, timeline selection, deck selection) and the synth tracker keys apply only while the SYNTH drawer is open. Pointer input on the stage feeds the control state whenever no Sway is driving: position maps to XY, buttons to the Press gesture, the wheel to the Pulse gesture. The MIDI monitor sits on `K` because `M` is the pad 7 key: the pad lookup is the final branch of the key handler, so `M` never reaches an overlay toggle.

With `?autoplay=<template id or .sway path>`, the SYSTEM modal is skipped: the door opens immediately and the Doctor still runs in the background to populate the modal.

### Documentation modal

`#modal-docs` renders the Markdown documentation that ships inside the package, so the text is available offline and matches the installed build. It opens from the DOCS button in the top bar and from the `D` key, and closes with its close button, the same key, or `Escape`, the stage keeps rendering behind it throughout.

The document set is fixed in the main process. `DOC_ORDER` in `src/main/main.js` enumerates eighteen package-relative paths, `README.md` followed by the seventeen files in `docs/`, and both handlers work from it. `listDocs()` maps that order to `{ id, title }` records, skipping paths absent from disk and taking each title from the first ATX H1 in the file's leading 4096 characters, falling back to the base name without the `.md` extension. `readDoc(id)` rejects any id outside the array with `Unknown document: <id>`, so no caller-supplied path reaches the filesystem and the channel cannot read arbitrary files. `docsRoot()` resolves two directories above `__dirname`, the same base the template directory in `src/main/projectfile.js` starts from, so both read from the package root in development and from the `app.asar` root when packaged.

The sidebar list is built once, on the first open, from `docs:list`. Selecting an entry calls `loadDoc()`, which fetches the source over `docs:read`, renders it with `renderMarkdown()`, writes the result into `#docs-body`, resets the scroll position, marks the active sidebar button with the `current` class, and rebuilds `#docs-toc` from the returned heading list. The renderer collects headings of level 1 to 3 and the table of contents drops level 1, so the contents list holds the level-2 and level-3 headings, carrying a `lvl-2` or `lvl-3` class for indentation. Heading anchors come from `slugify()`: lowercased, backticks and non-word characters removed, whitespace runs collapsed to single hyphens. A read failure replaces the body with an `Unavailable` heading and the error message.

`src/renderer/markdown.js` covers the subset the documentation uses: ATX headings, fenced code, pipe tables, ordered and unordered lists, blockquotes, horizontal rules, and the inline set of code spans, bold, italic, and links. Source text is HTML-escaped before any markup is generated, and code spans are extracted first behind private-use sentinels so their contents are never reprocessed. Tables are wrapped in a `<div class="table-scroll">`. Links become `<a href="#" data-href="...">`, with `"` in the target replaced by `%22`; the target is classified at click time by `followDocLink()`:

| Target form | Handling |
|---|---|
| Begins with `#` | Scrolls the element with the matching id into view within the current document |
| Matches `^https?:` | Handed to `openExternal`; a rejection, the URL is outside `EXTERNAL_ALLOW`, shows the inline notice `Link not on the allowlist, open manually: <href>` |
| Anything else | Resolved as a relative path against the current document's directory, with empty and `.` segments dropped and each `..` popping one segment. A result matching an id from `docs:list` loads that document and scrolls to the `#` fragment when present; otherwise the inline notice `Not part of the bundled documentation: <href>` appears |

The inline notice is a `.docs-external-note` element appended to the body and removed 6000 ms later. Nothing in the viewer navigates the page: `will-navigate` is prevented for every web contents, and external targets reach the system browser through `shell:openExternal` only.

## IPC surface

Every renderer-to-main channel is an `ipcMain.handle` invocation reached through `window.swaycommand`. There is one main-to-renderer event, `fix:progress`.

| Channel | Direction | Request payload | Response | Handler |
|---|---|---|---|---|
| `app:info` | renderer -> main (invoke) | none | `{ name, version, platform, arch }` | `src/main/main.js` |
| `doctor:run` | renderer -> main (invoke) | none | Array of check records `{ id, label, status, detail, fix? }`; `status` is one of `ok`, `warn`, `fail`, `info` | `src/main/main.js` -> `doctor.runAll()` |
| `doctor:fix` | renderer -> main (invoke) | `fixId` string | `{ ok, detail }` | `src/main/main.js` (dispatch table below) |
| `project:openDialog` / `project:saveDialog` | renderer -> main (invoke) | none / suggested name | `{ path }` from the OS dialog, or `null` on cancel; both remember the directory in settings | `src/main/main.js` |
| `project:read` / `project:write` | renderer -> main (invoke) | file path (+ document for write) | The validated `.sway` document with warnings; both push the recents list | `src/main/main.js` -> `projectfile.js` |
| `project:recent` | renderer -> main (invoke) | none | Pruned recents (up to 10; missing paths dropped) | `src/main/main.js` -> `projectfile.js` |
| `project:templates` / `project:readTemplate` | renderer -> main (invoke) | none / template id | Template metadata list; one validated template document (id-gated) | `src/main/main.js` -> `projectfile.js` |
| `files:pickAudio` / `files:readAudio` / `files:statAudio` | renderer -> main (invoke) | none / file path | Picked audio files; raw bytes (256 MB cap); `{ bytes, sha256 }` | `src/main/main.js` |
| `platform:systemAudio` | renderer -> main (invoke) | none | `{ supported, detail }`, whether loopback capture exists on this platform | `src/main/main.js` |
| `docs:list` | renderer -> main (invoke) | none | `{ id, title }` records in `DOC_ORDER` order; paths absent from disk are skipped | `src/main/main.js` -> `listDocs()` |
| `docs:read` | renderer -> main (invoke) | document id string | The file's UTF-8 text; throws `Error('Unknown document: <id>')` for any id outside `DOC_ORDER` | `src/main/main.js` -> `readDoc()` |
| `settings:get` | renderer -> main (invoke) | none | Settings object; `{}` when the file is missing or unparsable | `src/main/main.js` |
| `settings:set` | renderer -> main (invoke) | patch object | The merged settings object | `src/main/main.js` |
| `shell:openExternal` | renderer -> main (invoke) | URL string | Resolves after opening; rejects with `Error('URL not on the allowlist')` for any URL outside `EXTERNAL_ALLOW` | `src/main/main.js` |
| `fix:progress` | main -> renderer (event) | n/a | `{ fixId, phase, pct?, received?, total? }`; `phase` is `download`, `verify`, or `install` | Sent from the `doctor:fix` progress callback in `src/main/main.js` |

The `doctor:fix` dispatch:

| `fixId` | Action | Implementation |
|---|---|---|
| `fetch-companion` | Download, verify, and open the Sway Software installer | `audima.downloadCompanion` |
| `install-dfu-driver` | Download, extract, and stage the STM32 WinUSB driver | `driver.installDfuDriver` |
| `open-downloads-page` | Open `https://audima.com.au/downloads/` in the system browser | `shell.openExternal` |
| `open-manual` | Open the Sway user manual PDF in the system browser | `shell.openExternal(AUDIMA.USER_MANUAL)` |

An unknown `fixId` returns `{ ok: false, detail: 'Unknown fix: <id>' }`.

The preload maps these channels onto `window.swaycommand`: `info()`, `doctor.run()`, `doctor.fix(fixId)`, `doctor.onFixProgress(cb)` (returns an unsubscribe function), `project.openDialog()`, `project.saveDialog(name)`, `project.read(path)`, `project.write(path, doc)`, `project.recent()`, `project.templates()`, `project.readTemplate(id)`, `docs.list()`, `docs.read(id)`, `files.pickAudio()`, `files.readAudio(path)`, `files.statAudio(path)`, `platform.systemAudio()`, `settings.get()`, `settings.set(patch)`, and `openExternal(url)`.

## Renderer bundling

`scripts/build-renderer.js` bundles the renderer with esbuild: entry point `src/renderer/app.js`, `format: 'iife'`, `platform: 'browser'`, `target: 'chrome140'`, unminified, no source map. three.js (`^0.185.1`, imported by `engine.js` and `colormaster.js`) is statically bundled; the renderer loads no code at runtime beyond the bundle. The script then copies the two static files. Resulting `dist/` layout:

| File | Origin |
|---|---|
| `dist/renderer.bundle.js` | esbuild output |
| `dist/index.html` | copied from `src/renderer/index.html` |
| `dist/styles.css` | copied from `src/renderer/styles.css` |

`npm start` runs the bundle step and then launches Electron; the `dist:*` scripts run it before `electron-builder`.

## Security model

The page CSP, set as a `<meta http-equiv>` tag in `src/renderer/index.html`:

```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; media-src 'self' mediastream:
```

`script-src 'self'` restricts execution to local files, and `connect-src 'self'` denies the renderer all network access, every download runs in the main process. `media-src mediastream:` admits microphone capture streams.

Session permissions are governed by an explicit grant set: `{ midi, midiSysex, media, audioCapture }`. Both `setPermissionRequestHandler` and `setPermissionCheckHandler` consult this set; every other permission is denied.

Navigation and window creation are locked down for every web contents the application creates: `will-navigate` is unconditionally prevented, and `setWindowOpenHandler` returns `deny` for every request, when the URL passes `allowedExternal()`, it is handed to `shell.openExternal` and opens in the system browser instead. `allowedExternal()` accepts only `https:` URLs whose hostname equals, or is a subdomain of, an entry in `EXTERNAL_ALLOW`:

| Domain |
|---|
| `audima.com.au` |
| `github.com` |
| `githubusercontent.com` |
| `nodejs.org` |
| `community.polyexpression.com` |
| `discord.com` |
| `vidvox.net` |
| `huggingface.co` |
| `unity.com` |
| `resolume.com` |
| `st3nd.com` |
| `serato.com` |
| `synesthesia.live` |
| `elektronauts.com` |
| `indiegogo.com` |
| `gantasmo.com` |
| `spotify.com` |
| `youtube.com` |
| `instagram.com` |
| `x.com` |
| `electronjs.org` |
| `threejs.org` |

The list covers the application's own endpoints plus every host cited by the bundled documentation, so a link followed in the documentation viewer resolves without widening the policy to arbitrary URLs. `cdn.audima.com.au` has no entry of its own: the subdomain rule admits it under `audima.com.au`. The same predicate guards the `shell:openExternal` IPC channel, which is the only path the viewer has to the system browser.

The download layer in `src/main/audima.js` applies a stricter, exact-match allowlist: `audimaFetch` refuses any URL that is not `https:` on `cdn.audima.com.au`, `audima.com.au`, or `www.audima.com.au` (no subdomain wildcard). Requests carry the custom User-Agent from `AUDIMA.USER_AGENT`, time out after 15 s by default and 10 min for downloads, and write to a `.part` file that is renamed only on completion. When the manifest supplies a signature, the companion installer's minisign signature is verified against the Ed25519 public key in `src/shared/constants.js` before the file is opened, and a failed verification deletes the download; the pinned fallback URLs carry no signature, so a fallback download is opened unverified. USB identity and CDN interface details: [SWAY_INTEGRATION.md](SWAY_INTEGRATION.md).

## Packaged layout

`electron-builder.yml` packages a whitelist of paths into `resources/app.asar` (`asar: true`):

```
src/main/**/*
src/preload/**/*
src/shared/**/*
dist/**/*
projects/**/*
docs/**/*.md
README.md
package.json
```

Build output lands in `release/`; the application id is `app.swaycommand`. The template directory in `src/main/projectfile.js` resolves `projects/templates/` two directories above `__dirname` (`src/main`), which lands at the package root in development and at the `app.asar` root when packaged, so the same code path serves both, the `projects/**/*` whitelist entry is what carries the bundled templates. `docsRoot()` resolves the same two directories and the `DOC_ORDER` ids are paths relative to it, so the `docs/**/*.md` and `README.md` entries are what make the documentation modal work in an installed build: without them the Markdown would exist only in the source tree and `listDocs()` would return an empty list.

Per-platform targets: a one-click NSIS installer on Windows (`SwayCommand-Setup-${version}.exe`, per-user, launches the application when it finishes, preserves application data on uninstall), a DMG on macOS (category `public.app-category.music`), and an AppImage on Linux (category `AudioVideo`).
