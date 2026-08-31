// VST3 hosting, drives the pedalboard sidecar (vst-host.py) from the main
// process. There is no native host in SwayCommand; a Python that can import
// pedalboard is found once (theDAW's own environment beside this repo, a
// user-picked interpreter, or whatever `py`/`python3`/`python` resolves to),
// remembered in settings.vstPython, and every command is one short-lived
// process with a JSON job on stdin. Renders land under userData/renders as
// WAV files the renderer decodes like any other media.

'use strict';

const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawn, spawnSync } = require('node:child_process');
const { app } = require('electron');

let pythonPath = null; // the interpreter that passed probe
let pythonInfo = null; // { version, python }
let lastError = null;
let scanCache = null;
// Settings access, handed in by main.js so any command can find the
// interpreter on demand (a scan may be the first call of the session).
let cfg = { read: () => ({}), write: null };
function configure(c) {
  cfg = { ...cfg, ...c };
}

function scriptPath() {
  const dev = path.join(__dirname, 'vst-host.py');
  if (fs.existsSync(dev) && !__dirname.includes('app.asar')) return dev;
  // Packaged: electron-builder's extraResources puts it beside the asar.
  const res = path.join(process.resourcesPath || '', 'vst-host.py');
  if (fs.existsSync(res)) return res;
  return dev;
}

function rendersDir() {
  const d = path.join(app.getPath('userData'), 'renders');
  fs.mkdirSync(d, { recursive: true });
  return d;
}

function candidates(settings) {
  const list = [];
  if (settings && typeof settings.vstPython === 'string' && settings.vstPython) list.push(settings.vstPython);
  const home = os.homedir();
  const exe = process.platform === 'win32' ? path.join('Scripts', 'python.exe') : path.join('bin', 'python');
  // theDAW's environment, the same pedalboard the MIX chain runs on.
  for (const base of [
    path.join(home, 'Documents', 'Dev', 'theDAW', '.venv'),
    path.join(home, 'Dev', 'theDAW', '.venv'),
    path.join(home, 'theDAW', '.venv'),
    path.join(path.dirname(app.getAppPath()), 'theDAW', '.venv'),
  ]) {
    list.push(path.join(base, exe));
  }
  if (process.platform === 'win32') list.push('py', 'python', 'python3');
  else list.push('python3', 'python');
  return [...new Set(list)];
}

function probeOne(py) {
  try {
    const args = py === 'py' ? ['-3', scriptPath(), 'probe'] : [scriptPath(), 'probe'];
    const r = spawnSync(py, args, { input: '{}', encoding: 'utf8', timeout: 25000, windowsHide: true });
    if (r.error || r.status !== 0) return null;
    const line = (r.stdout || '').trim().split('\n').pop();
    const out = JSON.parse(line);
    return out && out.ok ? out : null;
  } catch {
    return null;
  }
}

// Finds (and remembers) an interpreter with pedalboard. Cheap after the
// first success; a failed search is retried on every status call so a fresh
// install is noticed.
function ensurePython(settings, writeSettings) {
  if (pythonPath) return true;
  for (const py of candidates(settings)) {
    const info = probeOne(py);
    if (info) {
      pythonPath = py;
      pythonInfo = info;
      lastError = null;
      if (writeSettings && settings.vstPython !== py) writeSettings({ vstPython: py });
      return true;
    }
  }
  lastError = 'No Python with pedalboard found. Pick an interpreter that can `import pedalboard` (theDAW’s .venv works), or `pip install pedalboard`.';
  return false;
}

function status(settings, writeSettings) {
  const ok = ensurePython(settings, writeSettings);
  return {
    ok,
    python: pythonPath,
    pedalboard: pythonInfo ? pythonInfo.version : null,
    pythonVersion: pythonInfo ? pythonInfo.python : null,
    error: ok ? null : lastError,
    script: scriptPath(),
  };
}

function setPython(py, settings, writeSettings) {
  pythonPath = null;
  pythonInfo = null;
  const info = probeOne(py);
  if (!info) {
    lastError = `${py} cannot import pedalboard`;
    return status(settings, writeSettings);
  }
  pythonPath = py;
  pythonInfo = info;
  lastError = null;
  if (writeSettings) writeSettings({ vstPython: py });
  return status(settings, writeSettings);
}

function run(cmd, job, { timeoutMs = 120000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!pythonPath) ensurePython(cfg.read(), cfg.write);
    if (!pythonPath) return reject(new Error(lastError || 'VST host not available'));
    const args = pythonPath === 'py' ? ['-3', scriptPath(), cmd] : [scriptPath(), cmd];
    const child = spawn(pythonPath, args, { windowsHide: cmd !== 'editor' });
    let out = '';
    let err = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`${cmd} timed out`));
    }, timeoutMs);
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('error', (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      const line = out.trim().split('\n').pop();
      let parsed = null;
      try {
        parsed = JSON.parse(line);
      } catch {
        /* no JSON on stdout */
      }
      if (parsed && parsed.error) return reject(new Error(parsed.error));
      if (code !== 0 || !parsed) return reject(new Error(err.trim().split('\n').pop() || `${cmd} failed (${code})`));
      resolve(parsed);
    });
    child.stdin.end(JSON.stringify(job || {}));
  });
}

async function scan(refresh) {
  if (scanCache && !refresh) return scanCache;
  const r = await run('scan', {}, { timeoutMs: 60000 });
  scanCache = r.plugins || [];
  return scanCache;
}

function params(pluginPath, state) {
  return run('params', { path: pluginPath, params: state && state.params, rawState: state && state.rawState }, { timeoutMs: 60000 });
}

// Renders `inputPath` through the chain to a WAV under userData/renders,
// named by a hash of the input and the chain state so an unchanged chain
// reuses the file.
async function render(inputPath, plugins, opts) {
  const key = crypto
    .createHash('sha1')
    .update(inputPath)
    .update(JSON.stringify(plugins.map((p) => [p.path, p.params || {}, p.rawState || ''])))
    .digest('hex')
    .slice(0, 20);
  const out = path.join(rendersDir(), `${key}.wav`);
  if (!(opts && opts.force) && fs.existsSync(out)) return { ok: true, output: out, cached: true };
  const r = await run('render', { input: inputPath, output: out, plugins, tail: opts && opts.tail }, { timeoutMs: 15 * 60000 });
  return { ...r, cached: false };
}

function editor(pluginPath, state) {
  return run('editor', { path: pluginPath, params: state && state.params, rawState: state && state.rawState }, { timeoutMs: 6 * 3600000 });
}

module.exports = { configure, status, setPython, scan, params, render, editor, rendersDir };
