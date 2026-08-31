# Build system

The build system has three parts: a renderer bundler ([`scripts/build-renderer.js`](../scripts/build-renderer.js)), an icon generator ([`scripts/gen-icon.js`](../scripts/gen-icon.js)), and electron-builder driven by [`electron-builder.yml`](../electron-builder.yml). All three run through the npm scripts declared in [`package.json`](../package.json). Installation of the resulting packages is documented in [INSTALLATION.md](INSTALLATION.md).

## Prerequisites

Building requires Node.js 18 or later and the development dependencies installed by `npm install`:

| Package | Version range | Role |
|---|---|---|
| `electron` | `^43.4.1` | runtime for development and for the packaged application |
| `electron-builder` | `^26.0.0` | installer and package production |
| `esbuild` | `^0.28.2` | renderer bundling |
| `three` | `^0.185.1` | WebGL library, compiled into the renderer bundle |

The project declares no production dependencies. `three` is inlined into `dist/renderer.bundle.js` at build time, so the packaged application ships without `node_modules`.

## npm scripts

| Script | Command |
|---|---|
| `build:renderer` | `node scripts/build-renderer.js` |
| `build:icon` | `node scripts/gen-icon.js` |
| `start` | `npm run build:renderer && electron .` |
| `dist:win` | `npm run build:icon && npm run build:renderer && electron-builder --win` |
| `dist:mac` | `npm run build:icon && npm run build:renderer && electron-builder --mac` |
| `dist:linux` | `npm run build:icon && npm run build:renderer && electron-builder --linux` |

Every `dist:*` script regenerates the icons and the renderer bundle before invoking electron-builder, so a distribution build never packages stale artifacts.

## Renderer bundle

`scripts/build-renderer.js` creates `dist/` and runs a single esbuild pass:

| esbuild option | Value |
|---|---|
| `entryPoints` | `src/renderer/app.js` |
| `bundle` | `true` |
| `format` | `iife` |
| `platform` | `browser` |
| `target` | `chrome140` |
| `outfile` | `dist/renderer.bundle.js` |
| `minify` | `false` |
| `sourcemap` | `false` |
| `logLevel` | `info` |

The output is an immediately-invoked function expression compiled against the Chromium 140 feature set (Electron 43 ships a newer Chromium, so the target is a floor); `three` is resolved from `node_modules`, the renderer modules from `src/renderer/`, and all of them are inlined into the single output file. The bundle is not minified and no source map is emitted. After bundling, the script copies `src/renderer/index.html` and `src/renderer/styles.css` into `dist/` unchanged. The main and preload processes are not bundled; Electron loads them directly from `src/`.

## Icon generation

`scripts/gen-icon.js` produces both application icons with no image-processing dependency; it imports only `node:fs`, `node:path`, and `node:zlib`. Three stages run in sequence:

| Stage | Mechanism |
|---|---|
| Painter | fills a raw RGBA buffer per pixel: a rounded-square mask (outer radius 0.47 × size, corner radius 0.22 × size), a near-black base with a violet floor glow, and the beam motif |
| PNG encoder | hand-rolled: 8-bit RGBA `IHDR`, one `none` filter byte per scanline, `IDAT` compressed with `zlib.deflateSync` at level 9, chunk CRCs from a generated 256-entry CRC32 table |
| ICO wrapper | a single-entry PNG-in-ICO container (32 bpp, image data at offset 22), a format valid on Windows Vista and later |

The motif is sixteen vertical beam stripes (one per Sway infrared sensor) rising from the base. Each beam has a Gaussian cross-section; beam color interpolates from cyan `#2de1fc` at beam 0 to pink `#ff2d95` at beam 15, and beam heights follow a swell curve peaking between beams 9 and 10. The floor glow uses violet `#7a0bc0`.

| Output | Content |
|---|---|
| `build/icon.ico` | one 256 px PNG in an ICO container; a 256 px entry stores its width and height directory bytes as 0 |
| `build/icon.png` | 512 px PNG |

electron-builder reads both files from `build/` (`directories.buildResources: build`).

## Packaging

`electron-builder.yml` defines the package identity, contents, and per-platform targets.

| Key | Value |
|---|---|
| `appId` | `app.swaycommand` |
| `productName` | `SwayCommand` |
| `copyright` | `MIT, unaffiliated with Audima Labs` |
| `directories.output` | `release` |
| `directories.buildResources` | `build` |
| `asar` | `true` |

The `files` whitelist limits the package to:

| Pattern | Content |
|---|---|
| `src/main/**/*` | main process |
| `src/preload/**/*` | preload bridge |
| `src/shared/**/*` | shared modules |
| `dist/**/*` | renderer bundle, `index.html`, `styles.css`, the bundled font, and `media/` for the documentation viewer |
| `projects/**/*` | bundled projects |
| `docs/**/*.md` | the documentation the in-app viewer renders |
| `README.md` | the first document in the viewer |
| `package.json` | application manifest |

The whitelisted files are packed into `resources/app.asar` (`asar: true`). `node_modules`, `scripts/`, the non-Markdown contents of `docs/` and the bootstrap files are excluded by omission. One file is deliberately left outside the archive: `extraResources` copies `src/main/vst-host.py` to `resources/vst-host.py`, because the Python interpreter has to read the sidecar from a real path.

| Platform | Target | Icon | Metadata |
|---|---|---|---|
| `win` | `nsis` | `build/icon.ico` | n/a |
| `mac` | `dmg` | `build/icon.png` | category `public.app-category.music` |
| `linux` | `AppImage` | `build/icon.png` | category `AudioVideo`; synopsis "Gesture VJ instrument for the Audima Labs Sway" |

NSIS options:

| Option | Value | Effect |
|---|---|---|
| `oneClick` | `true` | single-page installer with no configuration prompts |
| `perMachine` | `false` | per-user installation under `%LOCALAPPDATA%\Programs\swaycommand`, no elevation |
| `runAfterFinish` | `true` | launches the application when an interactive installation completes; not applied by silent (`/S`) installations |
| `deleteAppDataOnUninstall` | `false` | `%APPDATA%\SwayCommand` survives uninstallation |
| `artifactName` | `SwayCommand-Setup-${version}.${ext}` | `SwayCommand-Setup-0.1.0.exe` at the current version |

## Release workflow

`.github/workflows/release.yml` produces the three packages on GitHub-hosted
runners and attaches them to a GitHub release. Each installer is built on its
own operating system, because NSIS needs Windows, the DMG needs macOS and the
AppImage needs Linux; a single runner cannot produce all three.

| Job | Runner | Command | Artifact |
|---|---|---|---|
| Windows installer | `windows-latest` | `npm run dist:win` | `.exe` and its `.blockmap` |
| macOS disk image | `macos-latest` | `npm run dist:mac -- --arm64 --x64` | one `.dmg` per architecture |
| Linux AppImage | `ubuntu-latest` | `npm run dist:linux` | `.AppImage` |
| Publish release | `ubuntu-latest` | `gh release create` | the release itself |

Two triggers start it. Pushing a tag matching `v*` runs it for that tag, and
`workflow_dispatch` runs it for a tag given as an input, creating the tag at the
checked-out commit if it does not exist. Whether the release is marked as a
prerelease follows the dispatch input when one is supplied, and otherwise the
tag: a semver prerelease carries a hyphen after the version (`v0.1.0-pre.1`),
a finished release does not (`v0.1.0`).

Before building, each job stamps the tag into `package.json` with
`npm version --no-git-tag-version`. Artifact names come from `` in
`electron-builder.yml`, so this is what makes a downloaded prerelease say which
prerelease it is. The change is runner-local and is never committed.

The builds are unsigned. No code-signing certificate is configured for either
platform, and `CSC_IDENTITY_AUTO_DISCOVERY` is set to `false` so that
electron-builder does not search the macOS keychain for a Developer ID and fail
the build when it finds none. Windows SmartScreen and macOS Gatekeeper both
treat the result as coming from an unidentified developer; the release notes
the workflow writes tell a downloader how to proceed. Signing later means
adding certificates as repository secrets and the matching electron-builder
configuration, and changes nothing else about the workflow.

The runner cost is worth knowing on a private repository, where Actions minutes
are metered with a multiplier per platform: Linux counts once, Windows twice
and macOS ten times. On a public repository standard runners are free.

## Release layout

`npm run dist:win` leaves the following in `release/`:

| Path | Content |
|---|---|
| `SwayCommand-Setup-<version>.exe` | the NSIS installer; 94 MB at version 0.1.0, dominated by the Electron runtime |
| `SwayCommand-Setup-<version>.exe.blockmap` | block-checksum map emitted alongside every NSIS artifact for differential updates; SwayCommand configures no auto-updater, so the file is unused |
| `win-unpacked/` | the unpacked application, `SwayCommand.exe`, the Electron runtime files, and `resources/app.asar`; runs in place without installation, suitable for smoke tests |
| `builder-debug.yml` | electron-builder's dump of the effective build configuration |

macOS and Linux builds write their artifacts and unpacked directories to the same `release/` directory. `release/`, `dist/`, and the generated icons are listed in `.gitignore` and are not tracked.

## Cross-platform constraints

`npm run dist:win` runs natively on Windows. `npm run dist:mac` requires a macOS host: DMG creation depends on macOS-only tooling. AppImage builds are best made on a Linux host. The repository contains no CI or cross-compilation configuration; each platform's artifact is produced on that platform.

## Development environment caveat

When the `ELECTRON_RUN_AS_NODE` environment variable is set, the Electron binary starts as a plain Node.js process: `electron .` executes `src/main/main.js` without Electron's APIs and no window appears. Development tools that are themselves built on Electron can leave this variable set in shells they spawn. The variable must be absent from the environment before `npm start`:

```powershell
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
```

```sh
unset ELECTRON_RUN_AS_NODE
```

Environment variables recognized by the application are documented in [ENVIRONMENT.md](ENVIRONMENT.md).
