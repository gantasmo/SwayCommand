# Launcher failure diagnosis (Windows)

Reproduced on the machine that reported it: Windows 11 26200, PowerShell 5.1.26100,
Node v22.19.0, npm 10.9.3, winget v1.29.290, repo on `G:\`.

The old path was `Install & Launch SwayCommand.bat` -> `scripts/install-launch.ps1`
(the entry point is now named `SwayCommand.bat`). It has three defects that
compound. Two of them make a *successful-looking* run produce an app that cannot
start.

---

## 1. `npm install` never installs the Electron runtime (primary cause)

Electron dropped its `postinstall` hook somewhere between v38 and v43. Verified
against the registry:

| version | published `scripts` |
| --- | --- |
| `electron@33.0.0` | `{"postinstall":"node install.js"}` |
| `electron@38.0.0` | `{"postinstall":"node install.js"}` |
| `electron@43.4.1` | *(no `scripts` field)* |
| `electron@44.0.0` | *(no `scripts` field)* |

`package.json` pins `electron: ^43.4.1`, so on this repo:

```
$ rm -rf node_modules/electron && npm install --no-audit --no-fund
added 1 package in 2s                     <- exit code 0
$ ls node_modules/electron/dist/electron.exe
No such file or directory                 <- 235 MB runtime absent
```

`npm install` exits **0** having downloaded no runtime at all. Instead,
`node_modules/electron/index.js` now lazily shells out to `install.js` the first
time something resolves the module:

```js
if (!fs.existsSync(fullPath)) { downloadElectron(); }   // index.js
```

So the 235 MB download moves from install time to **launch time**, where the
launcher prints one unexplained line (`Downloading Electron binary...`) and
then appears to hang for however long the download takes. On a slow link that
reads as a frozen window; if the download fails, the user gets a raw Node stack
trace. This is also the source of the "it re-downloads stuff every launch"
symptom: nothing in the launcher owns or verifies that cache, so any run that
starts with `node_modules/electron/dist` missing pays the full download again.

## 2. The environment is passed through unscrubbed

`ELECTRON_RUN_AS_NODE=1` is exported by every Electron-hosted terminal, VS
Code's integrated terminal being the common one. With it set, Electron runs as
plain Node, `require('electron')` returns a **path string** instead of the API
object, and `src/main/main.js` dies on its first real statement:

```
src\main\main.js:42
if (ANGLE_BACKEND !== 'default') app.commandLine.appendSwitch('use-angle', ANGLE_BACKEND);
                                     ^
TypeError: Cannot read properties of undefined (reading 'commandLine')
```

Confirmed both directions on this machine: the crash is 100% reproducible from
the VS Code terminal, and the app launches normally under the identical command
with `ELECTRON_RUN_AS_NODE` removed. Anyone who double-clicks the `.bat` from
Explorer will not hit this; anyone who runs it from an editor terminal always
will. `NODE_OPTIONS` and `ELECTRON_OVERRIDE_DIST_PATH` are the same class of
hazard.

## 3. The "are dependencies current?" test cannot work

```powershell
$pkgTime = (Get-Item $packageJson).LastWriteTimeUtc
$nmTime  = (Get-Item $nodeModules).LastWriteTimeUtc
if ($pkgTime -gt $nmTime) { $needInstall = $true }
```

Three ways this is wrong:

- `node_modules`' mtime is bumped by every npm write, so straight after any
  install it is always newer than `package.json`, the check can essentially
  never fire again.
- It watches `package.json` but not `package-lock.json`, so a lockfile-only
  change (the normal case for a dependency bump) is invisible.
- A fresh `git clone` writes arbitrary mtimes, so the ordering is luck.
- Presence of the `node_modules` *directory* is treated as proof the install is
  complete. Per defect 1 the directory exists and is useless.

## Secondary problems

- **No feedback surface.** A console window with `[OK]`/`[FIX]` lines, and
  `pause` only on the failure path, so when the app starts and then crashes,
  the window disappears with the evidence in it.
- **`winget` is the only way it can install Node**, and a failure there is
  terminal: it prints a URL and exits 1. No portable fallback, so a machine
  without winget or without admin rights simply cannot proceed.
- **"Install Node, then run me again."** Even in the good case, a fresh machine
  needs two double-clicks because `Update-SessionPath` cannot refresh the PATH
  of a `cmd.exe` parent that has already started.
- **Drivers are never considered.** The STM32 DFU driver needed for Sway
  firmware updates is only reachable from a Doctor "Fix" click inside the
  running app (`src/main/driver-install.js`), so a first-run setup can't stage it.
- **`chcp 65001`** switches the console to UTF-8 but the `.bat` is CRLF/ANSI and
  the PS script emits box-drawing-free ASCII anyway, harmless, but it also
  wrecks the code page for any non-ASCII path echoed afterward.

---

## What the replacement does about each

| Defect | Fix |
| --- | --- |
| 1, no Electron runtime | `electron-runtime` is its own node in the graph. It tests for `dist/electron.exe`, not for `node_modules`. It downloads the release zip itself with real byte progress, verifies it against the SHA-256 in the electron package's own `checksums.json`, and keeps it in a private cache so a wipe of `node_modules` never re-downloads. `node install.js` remains the fallback. |
| 2, dirty environment | The launcher strips `ELECTRON_RUN_AS_NODE`, `ELECTRON_NO_ATTACH_CONSOLE`, `ELECTRON_OVERRIDE_DIST_PATH`, `NODE_OPTIONS` and `VSCODE_*` from the child environment before spawning anything. |
| 3, bogus staleness test | State file records the SHA-256 of `package-lock.json` alongside a real probe of the installed tree. Content-addressed, so clone mtimes are irrelevant. |
| No feedback | WPF progress UI with a per-step plan, elapsed, and a computed remaining estimate. |
| winget-only Node | Portable Node zip into a private toolchain dir is the default and needs no admin; winget/MSI is offered but never required. |
| Two double-clicks | Node is resolved to an absolute path for the rest of the run, so PATH never needs to refresh. One double-click. |
| Drivers ignored | `dfu-driver` is an optional, opt-in node in the same graph. |

---

## Separately: the Doctor could not verify any Audima download

Found while testing the above, unrelated to the launcher. The `fetch-companion`
fix failed on every attempt with `Deleted download, Digest method not
supported`, because Electron links BoringSSL, which implements no BLAKE2, and
minisign's modern signature format signs `BLAKE2b-512(file)`. Written up in
[DOCTOR.md](DOCTOR.md#fetch-companion); fixed by
[`src/main/blake2b.js`](../src/main/blake2b.js).
