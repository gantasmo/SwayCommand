# Installation

SwayCommand installs from a packaged build or from a source checkout. Packaged builds install per-user and request no elevation on any platform. The pipeline that produces the packages is documented in [BUILD.md](BUILD.md).

## Packaged installation

| Platform | Minimum version | Artifact |
|---|---|---|
| Windows | 10 (x64) | `SwayCommand-Setup-<version>.exe` (NSIS one-click installer) |
| macOS | 11 | DMG |
| Linux | glibc-based x64 distribution | AppImage |

### Windows

The installer is a one-click NSIS package (`oneClick: true` in [electron-builder.yml](../electron-builder.yml)). Running `SwayCommand-Setup-<version>.exe` installs without further prompts:

- Installation is per-user (`perMachine: false`). Files are written to `%LOCALAPPDATA%\Programs\swaycommand`, no administrator elevation is requested, and the Apps list entry is created for the current user only.
- When installation completes, the installer launches the application (`runAfterFinish: true`), which opens with the SYSTEM check modal over the cockpit.

The artifact name follows the `SwayCommand-Setup-${version}.${ext}` pattern; at version 0.1.0 the file is `SwayCommand-Setup-0.1.0.exe`.

#### Silent installation

The standard NSIS silent switch performs the same per-user installation with no user interface:

```bat
SwayCommand-Setup-0.1.0.exe /S
```

`runAfterFinish` does not apply in silent mode; a silent installation completes without launching the application.

### macOS

The DMG contains the application bundle. Installation is a copy of `SwayCommand.app` into `/Applications` (or any writable location). The build is not signed or notarized; the first launch is subject to Gatekeeper, as described under [Code-signing status](#code-signing-status).

### Linux

The AppImage is a self-contained executable and performs no system installation.

1. Mark the file executable: `chmod +x <file>.AppImage`.
2. Run the file.

Settings are written to `~/.config/SwayCommand` on first run.

## Uninstallation

| Platform | Removal | Data left behind |
|---|---|---|
| Windows | "SwayCommand" entry in Settings → Apps → Installed apps | `%APPDATA%\SwayCommand` |
| macOS | deletion of `SwayCommand.app` | `~/Library/Application Support/SwayCommand` |
| Linux | deletion of the AppImage file | `~/.config/SwayCommand` |

The Windows uninstaller does not delete application data (`deleteAppDataOnUninstall: false`): the settings file and any MIDI control overrides in `%APPDATA%\SwayCommand` survive uninstallation and are reused by a subsequent installation. The DFU driver package cache under `<userData>/audima/` persists for the same reason. Complete removal requires manual deletion of the directories listed above.

## Code-signing status

The distributed binaries are not Authenticode-signed, and the macOS build is neither signed nor notarized. Consequences:

- Windows SmartScreen shows an unknown-publisher warning the first time the installer runs; installation proceeds through "More info" → "Run anyway".
- macOS Gatekeeper refuses to open the application until an exception is granted in System Settings → Privacy & Security.

The signing hooks of electron-builder are the place to configure a certificate: the `win` and `mac` sections of [electron-builder.yml](../electron-builder.yml) currently contain no signing options.

## From-source installation

| Platform | Entry point | Implementation | Needs Node.js first? |
|---|---|---|---|
| Windows | `SwayCommand.bat` (double-click) | [`scripts/bootstrap/`](../scripts/bootstrap/) | No |
| macOS | `SwayCommand.command` (double-click) | [`SwayCommand.sh`](../SwayCommand.sh) | Yes, 18 or later |
| Linux | `./SwayCommand.sh` from a terminal | same file | Yes, 18 or later |

### Windows bootstrap

`SwayCommand.bat` clears the inherited Electron environment variables (see below), then starts [`scripts/bootstrap/Install-SwayCommand.ps1`](../scripts/bootstrap/Install-SwayCommand.ps1) hidden under Windows PowerShell with `-NoProfile -ExecutionPolicy Bypass -STA`. All progress and error reporting happens in the setup window, so the console closes immediately. Setting `SWAYCOMMAND_SETUP_CONSOLE=1` runs it visibly in the console instead.

Setup is a dependency graph rather than a fixed sequence. Each node owns one prerequisite, tests for the artifact it is responsible for, and declares what it requires; the resolver sorts them, the detection pass prunes whatever is already satisfied, and only the remainder is installed:

| Node | Satisfied when | Installed by |
|---|---|---|
| `system` | Windows build, architecture and ≥ 2 GB free on the install volume | — (a gate) |
| `repo` | `package.json`, `src/main/main.js` and `scripts/build-renderer.js` all present | — (a gate) |
| `node` | A Node.js ≥ 18 at a known absolute path | Portable `node-v*-win-*.zip` from nodejs.org unpacked into the private toolchain folder |
| `npm-deps` | `node_modules/.package-lock.json` exists and the recorded SHA-256 of `package-lock.json` matches | `npm install --no-audit --no-fund` |
| `electron-runtime` | `node_modules/electron/dist/electron.exe` exists | Release zip verified against the SHA-256 in the electron package's own `checksums.json`, falling back to `node install.js` |
| `renderer` | `dist/renderer.bundle.js` is newer than every renderer and shared source | `node scripts/build-renderer.js` |
| `dfu-driver` | `pnputil /enum-drivers` lists `stm32bootloader.inf` | Audima's official package staged with `pnputil`, under an elevation prompt. Optional, off by default |

No node requires administrator rights except `dfu-driver`, which is opt-in. Node.js is installed as a private copy under `%LOCALAPPDATA%\SwayCommand\toolchain` and is resolved by absolute path for the rest of the run, so nothing depends on `PATH` refreshing and one double-click is always enough. The install location is shown on the plan screen and can be changed there.

State lives in `%LOCALAPPDATA%\SwayCommand`: `cache/` for verified downloads, `toolchain/` for the private Node.js, `logs/` for a per-run transcript, and `bootstrap-state.json` for the lockfile hash, package count and measured per-step durations. Because every test is content-addressed rather than timestamp-based, a fresh `git clone` is judged on its contents; because downloads are cached and checksummed, wiping `node_modules` costs an unpack rather than a download.

Time remaining is computed from measured per-step durations recorded on that machine, scaled live by how far the run has drifted from its own estimate, with downloads reporting true bytes and rate. Durations are recorded per variant — restoring Electron from cache and downloading it are timed separately — so a warm run never distorts the estimate for a cold one.

#### Inherited Electron environment variables

Every Electron-hosted terminal, VS Code's integrated terminal included, exports `ELECTRON_RUN_AS_NODE=1`. Inherited by a child Electron process it makes `require('electron')` return a path string instead of the API object, and `src/main/main.js` fails immediately on `app.commandLine`. The `.bat`, the bootstrapper and `SwayCommand.sh` all clear `ELECTRON_RUN_AS_NODE`, `ELECTRON_NO_ATTACH_CONSOLE`, `ELECTRON_OVERRIDE_DIST_PATH`, `ELECTRON_NO_ASAR` and `NODE_OPTIONS` before spawning anything. Background in [INSTALLER-DIAGNOSIS.md](INSTALLER-DIAGNOSIS.md).

### macOS and Linux bootstrap

`SwayCommand.command` changes to its own directory and executes `SwayCommand.sh`. When macOS refuses to run the file — for example after the repository arrives as a zip download — executable permission is restored from Terminal:

```sh
chmod +x SwayCommand.command SwayCommand.sh
```

`SwayCommand.sh` does not install Node.js itself. When Node.js is absent or older than 18, it prints installation hints matched to the detected system, opens the download page (`open` on macOS, `xdg-open` on Linux), and exits with code 1:

| Detected system | Hint printed |
|---|---|
| macOS (`uname -s` = `Darwin`) | `brew install node`; without Homebrew, the LTS installer from `https://nodejs.org/en/download` |
| `/etc/os-release` `ID`/`ID_LIKE` matches `debian`/`ubuntu` | `sudo apt-get update && sudo apt-get install -y nodejs npm`; NodeSource for the current LTS |
| `/etc/os-release` `ID`/`ID_LIKE` matches `fedora`/`rhel`/`centos` | `sudo dnf install -y nodejs npm` |
| other | both hints above in abbreviated form (the `apt-get` line without the preceding `apt-get update`), plus the download page |

With Node.js present it installs dependencies when `node_modules/.package-lock.json` is missing or older than `package-lock.json`, then checks for the Electron runtime named by `node_modules/electron/path.txt` and runs `node node_modules/electron/install.js` if it is absent — electron ≥ 43 publishes no postinstall hook, so `npm install` exits 0 without ever downloading it. `ELECTRON_CACHE` defaults to `~/.cache/electron` so the download survives a `node_modules` wipe. Finally it launches with `npm run start`.

### Manual installation

The bootstrap scripts are a convenience; the equivalent manual procedure is:

1. Install Node.js 18 or later.
2. Run `npm install` in the repository root.
3. Run `npm start`.

## First run

From source, `npm run start` first builds the renderer bundle (`scripts/build-renderer.js`), then launches Electron; packaged builds contain a prebuilt bundle and start directly. In both cases the application opens on the cockpit with the stage behind a closed blast door, and the SYSTEM modal runs the Doctor, the startup system check. Each check reports its result with a remediation action where one exists; when every check passes, the door opens on its own after 1.4 seconds — ENTER opens it manually regardless of results. The individual checks, their detection methods, and the fix actions are documented in [DOCTOR.md](DOCTOR.md).

A Sway, other MIDI hardware, and an audio input are optional at first run: the application substitutes mouse and keyboard control and an internal analysis signal when they are absent, so every scene renders output on a machine with no peripherals.
