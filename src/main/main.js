// SwayCommand main process, window lifecycle, permissions, IPC surface.

'use strict';

const path = require('node:path');
const fs = require('node:fs');
const { app, BrowserWindow, desktopCapturer, dialog, ipcMain, session, shell } = require('electron');

const doctor = require('./doctor');
const audima = require('./audima');
const driver = require('./driver-install');
const projectfile = require('./projectfile');
const ganfile = require('./ganfile');
const vsthost = require('./vsthost');
const { APP } = require('../shared/constants');

let win = null;

// --- the shader cold-compile switches ---------------------------------------
// Both were measured on this machine with the scene harness (scripts/
// scene-harness.js, "electronArgs" in the plan); the numbers are the FIRST DRAW
// of Nature's Tomb and Miracle Mile, whose shaders are by far the biggest.
//
// GPU PROGRAM CACHE SIZE. Chromium's default program cache is a couple of
// megabytes. These two scenes' compiled binaries do not both fit, so they
// evicted each other and NEITHER was ever cached: a relaunch recompiled them
// from scratch, 131 s and 99 s, every single time. Measured: with the default
// cache, a second run of the same profile still cost 131 s / 99 s; with the
// cache raised, 2.9 s / 1.6 s. (Alone in a profile either scene cached fine,
// which is why this looked like a compile problem rather than an eviction one.)
//
// ANGLE BACKEND. On the default D3D11 backend every shader goes through fxc,
// which fully unrolls constant-trip loops and inlines every call site; the
// first compile of Nature's Tomb costs 132 s. ANGLE's OpenGL backend does not
// use fxc: the same shader compiles in 12 s, and even a cache-warm first draw
// falls from 2.9 s to 0.29 s. The trade is a small runtime cost, measured at
// 1080p tier med, between −0.1 and +1.9 ms a frame across nine scene states,
// worst on the heaviest ones. A hundred-second freeze on a stage is worse than
// a millisecond a frame, so GL is the default; SWAYCOMMAND_ANGLE overrides it
// (`d3d11` restores the old behaviour, or any backend ANGLE accepts).
const ANGLE_BACKEND = process.env.SWAYCOMMAND_ANGLE || 'gl';
if (ANGLE_BACKEND !== 'default') app.commandLine.appendSwitch('use-angle', ANGLE_BACKEND);
app.commandLine.appendSwitch('gpu-program-cache-size-kb', '524288');

// gan:// serves unpacked .gan web-plugins to the renderer's plugin frame; a
// privileged scheme has to be declared before the app is ready.
ganfile.registerScheme();

// Domains the renderer may ask the main process to open in the system browser.
// Subdomains of each entry are accepted. The list covers the application's own
// endpoints plus every host cited by the bundled documentation, so links in the
// docs viewer resolve without widening the policy to arbitrary URLs.
const EXTERNAL_ALLOW = [
  'audima.com.au',
  'github.com',
  'githubusercontent.com',
  'nodejs.org',
  'community.polyexpression.com',
  'discord.com',
  'vidvox.net',
  'huggingface.co',
  'unity.com',
  'resolume.com',
  'st3nd.com',
  'serato.com',
  'synesthesia.live',
  'elektronauts.com',
  'indiegogo.com',
  // Cited by README.md's masthead.
  'gantasmo.com',
  'spotify.com',
  'youtube.com',
  'instagram.com',
  'x.com',
  'electronjs.org',
  'threejs.org',
];

function allowedExternal(url) {
  try {
    const u = new URL(url);
    return (
      u.protocol === 'https:' &&
      EXTERNAL_ALLOW.some((d) => u.hostname === d || u.hostname.endsWith('.' + d))
    );
  } catch {
    return false;
  }
}

function settingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function readSettings() {
  try {
    return JSON.parse(fs.readFileSync(settingsPath(), 'utf8'));
  } catch {
    return {};
  }
}

function writeSettings(patch) {
  const merged = { ...readSettings(), ...patch };
  fs.mkdirSync(app.getPath('userData'), { recursive: true });
  fs.writeFileSync(settingsPath(), JSON.stringify(merged, null, 2));
  return merged;
}

// --- audio files ------------------------------------------------------------
// Stems and one-shots are chosen through the OS file dialog and read in the
// main process; the renderer receives raw bytes and decodes them itself. The
// page CSP forbids file:// fetches, so this is the only path in.

const AUDIO_EXTENSIONS = ['wav', 'mp3', 'flac', 'ogg', 'm4a', 'aac', 'aiff', 'aif', 'opus', 'webm'];
const MAX_AUDIO_BYTES = 256 * 1024 * 1024; // a long stem is fine; a video file is not

async function pickAudioFiles() {
  const result = await dialog.showOpenDialog(win, {
    title: 'Add stems and samples',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Audio', extensions: AUDIO_EXTENSIONS },
      { name: 'All files', extensions: ['*'] },
    ],
  });
  if (result.canceled) return [];
  return result.filePaths.map((p) => ({ path: p, name: path.basename(p) }));
}

function readAudioFile(filePath) {
  const stat = fs.statSync(filePath);
  if (stat.size > MAX_AUDIO_BYTES) {
    throw new Error(`${path.basename(filePath)} is ${Math.round(stat.size / 1e6)} MB; the limit is ${MAX_AUDIO_BYTES / 1e6} MB`);
  }
  return fs.readFileSync(filePath); // arrives in the renderer as a Uint8Array
}

// --- bundled documentation ------------------------------------------------
// Docs ship as Markdown inside the package. The renderer requests them by
// name; names are validated against the enumerated set, so no caller-supplied
// path ever reaches the filesystem.

function docsRoot() {
  return path.join(__dirname, '..', '..');
}

// Reading order for the viewer's sidebar. Entries absent from disk are skipped.
const DOC_ORDER = [
  'README.md',
  'docs/INDEX.md',
  'docs/OVERVIEW.md',
  'docs/INSTALLATION.md',
  'docs/DOCTOR.md',
  'docs/STUDIO.md',
  'docs/SYNTH.md',
  'docs/TROUBLESHOOTING.md',
  'docs/ARCHITECTURE.md',
  'docs/ENGINE.md',
  'docs/SCENE_CONTRACT.md',
  'docs/PROJECTS.md',
  'docs/MIDI.md',
  'docs/AUDIO.md',
  'docs/SWAY_INTEGRATION.md',
  'docs/BUILD.md',
  'docs/ENVIRONMENT.md',
  'docs/RESEARCH.md',
];

function listDocs() {
  const root = docsRoot();
  return DOC_ORDER.map((rel) => {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) return null;
    let title = path.basename(rel, '.md');
    try {
      const head = fs.readFileSync(abs, 'utf8').slice(0, 4096);
      // The first heading names the document. README.md opens on a banner
      // instead, because a wordmark image followed by the same word as an H1
      // titles the page twice, so its alt text names it there.
      const m = /^#\s+(.+)$/m.exec(head) || /^!\[([^\]]+)\]\(/m.exec(head);
      if (m) title = m[1].trim();
    } catch {
      /* fall back to the file name */
    }
    return { id: rel, title };
  }).filter(Boolean);
}

function readDoc(id) {
  // Only ids the enumeration produced are readable.
  if (!DOC_ORDER.includes(id)) throw new Error(`Unknown document: ${id}`);
  return fs.readFileSync(path.join(docsRoot(), id), 'utf8');
}

function createWindow() {
  // Verification hook: SWAYCOMMAND_WINDOW=960x600 forces an initial size so the
  // narrow-window layout can be screenshot-tested headlessly.
  const sizeOverride = /^(\d+)x(\d+)$/.exec(process.env.SWAYCOMMAND_WINDOW || '');
  win = new BrowserWindow({
    width: sizeOverride ? Number(sizeOverride[1]) : 1440,
    height: sizeOverride ? Number(sizeOverride[2]) : 900,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: '#05060a',
    title: APP.NAME,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.once('ready-to-show', () => win.show());

  const query = {};
  if (process.env.SWAYCOMMAND_AUTOPLAY) query.autoplay = process.env.SWAYCOMMAND_AUTOPLAY;
  if (process.env.SWAYCOMMAND_SCENE) query.scene = process.env.SWAYCOMMAND_SCENE;
  win.loadFile(path.join(__dirname, '..', '..', 'dist', 'index.html'), { query });

  // DOM probe for automated verification: SWAYCOMMAND_PROBE=<js expression>
  if (process.env.SWAYCOMMAND_PROBE) {
    win.webContents.once('did-finish-load', () => {
      setTimeout(async () => {
        try {
          const r = await win.webContents.executeJavaScript(process.env.SWAYCOMMAND_PROBE);
          console.log('[probe]', typeof r === 'string' ? r : JSON.stringify(r));
        } catch (err) {
          console.error('[probe] failed:', err.message);
        }
      }, 3000);
    });
  }

  // Screenshot mode for automated verification: SWAYCOMMAND_SHOT=<out.png>
  if (process.env.SWAYCOMMAND_SHOT) {
    const delay = Number(process.env.SWAYCOMMAND_SHOT_DELAY || 5000);
    win.webContents.once('did-finish-load', () => {
      setTimeout(async () => {
        try {
          const img = await win.webContents.capturePage();
          fs.writeFileSync(process.env.SWAYCOMMAND_SHOT, img.toPNG());
          console.log(`[shot] saved ${process.env.SWAYCOMMAND_SHOT}`);
        } catch (err) {
          console.error('[shot] failed:', err);
        }
        app.quit();
      }, delay);
    });
  }
}

app.whenReady().then(() => {
  // WebMIDI + microphone are the only permissions the renderer legitimately needs.
  const ses = session.defaultSession;
  const GRANT = new Set(['midi', 'midiSysex', 'media', 'audioCapture', 'display-capture']);
  ses.setPermissionRequestHandler((_wc, permission, cb) => cb(GRANT.has(permission)));
  ses.setPermissionCheckHandler((_wc, permission) => GRANT.has(permission));

  // System-audio capture. getDisplayMedia in Chromium always requires a video
  // source, so a screen source is supplied and the renderer discards the video
  // track immediately; only the loopback audio is kept. Loopback is a Windows
  // capability, elsewhere the request resolves without audio and the renderer
  // reports that system audio is unavailable on the platform.
  ses.setDisplayMediaRequestHandler(
    async (_request, callback) => {
      try {
        const sources = await desktopCapturer.getSources({ types: ['screen'] });
        if (!sources.length) return callback({});
        callback(
          process.platform === 'win32'
            ? { video: sources[0], audio: 'loopback' }
            : { video: sources[0] }
        );
      } catch (err) {
        console.error('[display-media] failed:', err.message);
        callback({});
      }
    },
    { useSystemPicker: false }
  );

  app.on('web-contents-created', (_e, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
      if (allowedExternal(url)) shell.openExternal(url);
      return { action: 'deny' };
    });
    contents.on('will-navigate', (e) => e.preventDefault());
  });

  // --- IPC surface ---
  ipcMain.handle('app:info', () => ({
    name: APP.NAME,
    version: app.getVersion(),
    platform: process.platform,
    arch: process.arch,
  }));

  ipcMain.handle('doctor:run', () => doctor.runAll());

  ipcMain.handle('doctor:fix', async (_e, fixId) => {
    const progress = (p) => win && win.webContents.send('fix:progress', { fixId, ...p });
    switch (fixId) {
      case 'fetch-companion':
        return audima.downloadCompanion(progress);
      case 'install-dfu-driver':
        return driver.installDfuDriver(progress);
      case 'open-downloads-page':
        await shell.openExternal('https://audima.com.au/downloads/');
        return { ok: true, detail: 'Opened Audima downloads page in your browser.' };
      case 'open-manual':
        await shell.openExternal(require('../shared/constants').AUDIMA.USER_MANUAL);
        return { ok: true, detail: 'Opened the Sway user manual.' };
      default:
        return { ok: false, detail: `Unknown fix: ${fixId}` };
    }
  });

  // --- .sway project files ---
  ipcMain.handle('project:openDialog', async () => {
    const settings = readSettings();
    const result = await dialog.showOpenDialog(win, {
      title: 'Open project',
      defaultPath: settings.lastProjectDir || projectfile.defaultProjectsDir(),
      properties: ['openFile'],
      filters: [{ name: 'Sway Project', extensions: ['sway'] }],
    });
    if (result.canceled || !result.filePaths.length) return null;
    writeSettings({ lastProjectDir: path.dirname(result.filePaths[0]) });
    return { path: result.filePaths[0] };
  });

  ipcMain.handle('project:saveDialog', async (_e, suggestedName) => {
    const settings = readSettings();
    const dir = settings.lastProjectDir || projectfile.defaultProjectsDir();
    fs.mkdirSync(dir, { recursive: true });
    const base = String(suggestedName || 'Untitled').replace(/[<>:"/\\|?*]/g, '');
    const result = await dialog.showSaveDialog(win, {
      title: 'Save project',
      defaultPath: path.join(dir, `${base}.sway`),
      filters: [{ name: 'Sway Project', extensions: ['sway'] }],
    });
    if (result.canceled || !result.filePath) return null;
    const filePath = result.filePath.toLowerCase().endsWith('.sway') ? result.filePath : `${result.filePath}.sway`;
    writeSettings({ lastProjectDir: path.dirname(filePath) });
    return { path: filePath };
  });

  ipcMain.handle('project:read', (_e, filePath) => {
    const result = projectfile.readProject(filePath);
    const settings = readSettings();
    writeSettings({
      recentProjects: projectfile.pushRecent(settings.recentProjects, {
        path: result.path,
        name: result.doc.project.meta.name,
      }),
    });
    return result;
  });

  ipcMain.handle('project:write', (_e, filePath, doc) => {
    const result = projectfile.writeProject(filePath, doc);
    const settings = readSettings();
    writeSettings({
      recentProjects: projectfile.pushRecent(settings.recentProjects, {
        path: result.path,
        name: (doc && doc.project && doc.project.meta && doc.project.meta.name) || path.basename(result.path, '.sway'),
      }),
    });
    return result;
  });

  ipcMain.handle('project:recent', () => {
    const settings = readSettings();
    const pruned = projectfile.pruneRecents(settings.recentProjects);
    if ((settings.recentProjects || []).length !== pruned.length) writeSettings({ recentProjects: pruned });
    return pruned;
  });

  ipcMain.handle('project:templates', () => projectfile.listTemplates());
  ipcMain.handle('project:readTemplate', (_e, id) => projectfile.readTemplate(id));
  ipcMain.handle('files:statAudio', (_e, filePath) => projectfile.statAudio(filePath, MAX_AUDIO_BYTES));

  ipcMain.handle('docs:list', () => listDocs());
  ipcMain.handle('docs:read', (_e, id) => readDoc(id));
  ipcMain.handle('files:pickAudio', () => pickAudioFiles());
  ipcMain.handle('files:readAudio', (_e, filePath) => readAudioFile(filePath));
  ipcMain.handle('platform:systemAudio', () => ({
    supported: process.platform === 'win32',
    detail:
      process.platform === 'win32'
        ? 'System audio capture uses WASAPI loopback.'
        : 'System audio capture is available on Windows only. On this platform, route audio to an input device with a virtual loopback driver (BlackHole or Loopback on macOS, PulseAudio or PipeWire monitor sources on Linux) and select that input.',
  }));
  ipcMain.handle('settings:get', () => readSettings());
  ipcMain.handle('settings:set', (_e, patch) => writeSettings(patch));

  // --- .gan web-plugins (control surfaces from theDAW's Foundry) ---
  ganfile.installHandler();
  ipcMain.handle('gan:pick', async () => {
    const settings = readSettings();
    const result = await dialog.showOpenDialog(win, {
      title: 'Open a .gan plugin',
      defaultPath: settings.lastGanDir || undefined,
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'GANTASMO web-plugin', extensions: ['gan'] }, { name: 'All files', extensions: ['*'] }],
    });
    if (result.canceled || !result.filePaths.length) return [];
    writeSettings({ lastGanDir: path.dirname(result.filePaths[0]) });
    return result.filePaths;
  });
  ipcMain.handle('gan:open', (_e, ganPath) => ganfile.open(ganPath));
  ipcMain.handle('gan:list', () => ganfile.list());
  ipcMain.handle('gan:remove', (_e, id) => ganfile.remove(id));

  // --- VST3 through the pedalboard sidecar ---
  vsthost.configure({ read: readSettings, write: writeSettings });
  ipcMain.handle('vst:status', () => vsthost.status(readSettings(), writeSettings));
  ipcMain.handle('vst:setPython', (_e, py) => vsthost.setPython(py, readSettings(), writeSettings));
  ipcMain.handle('vst:pickPython', async () => {
    const result = await dialog.showOpenDialog(win, {
      title: 'Pick a Python that can import pedalboard',
      properties: ['openFile'],
      filters: process.platform === 'win32' ? [{ name: 'Python', extensions: ['exe'] }] : [],
    });
    if (result.canceled || !result.filePaths.length) return vsthost.status(readSettings(), writeSettings);
    return vsthost.setPython(result.filePaths[0], readSettings(), writeSettings);
  });
  ipcMain.handle('vst:scan', (_e, refresh) => vsthost.scan(!!refresh));
  ipcMain.handle('vst:params', (_e, pluginPath, state) => vsthost.params(pluginPath, state));
  ipcMain.handle('vst:render', (_e, inputPath, plugins, opts) => vsthost.render(inputPath, plugins, opts));
  ipcMain.handle('vst:editor', (_e, pluginPath, state) => vsthost.editor(pluginPath, state));
  ipcMain.handle('shell:openExternal', (_e, url) => {
    if (allowedExternal(url)) return shell.openExternal(url);
    return Promise.reject(new Error('URL not on the allowlist'));
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
