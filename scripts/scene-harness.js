// Offscreen scene harness: compiles and renders registry scenes in a hidden
// Electron window (not the app) so shader errors, per-frame cost and stills
// can be checked without a headless app launch (HANDOFF.md asks for those to
// stay rare). Bundles scene-harness.entry.js with esbuild, writes the page
// next to the output, then runs itself under Electron as the main script.
//
//   node scripts/scene-harness.js <plan.json>
//
// The plan:
//   {
//     "out": "<directory for the PNGs and the page>",   // default: os.tmpdir()/swaycommand-harness
//     "width": 1280, "height": 720, "tier": "med",
//     "freshCache": true,            // cold GPU shader cache: every scene's first draw is a real compile
//     "userDataDir": "<path>",       // or pin a specific Electron profile
//     "shots": [
//       { "name": "tomb-egg", "scene": "naturestomb", "frames": 120, "dt": 0.01667,
//         "io": { "knobs": { "4": 0.75 }, "gestures": { "sway": 0.5 }, "xy": { "x": 0.5, "y": 0.5 },
//                 "bands": { "bass": 0.3 }, "level": 0.4, "beat": 0, "strike": 2, "strikes": [0, 5],
//                 "transport": { "playing": true, "time": 0 },
//                 "actions": ["blackhole"], "params": { "objectScale": 3 },
//                 "palette": ["#...", ...] } }
//     ]
//   }
// Shots run in order on cached instances, so a scene's state carries from one
// shot to the next (a strike in shot 2 lands on the state shot 1 left). One
// JSON report prints at the end: per shot the update cost per frame, the
// ms/frame of a timed burst closed by a pipeline-draining readPixels, the
// GPU's own per-frame time from the disjoint timer query where the driver
// exposes it (`gpuMs`, the number to trust), and the hooked console errors
// and warnings, a shader that fails to compile shows there. `actions` and
// `params` reach a scene's control surface (action() / setParam()) exactly as
// the router would.

'use strict';

const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const root = path.join(__dirname, '..');

if (process.versions.electron && !process.env.ELECTRON_RUN_AS_NODE) {
  // ---- Electron main: drive the hidden window through the plan
  const { app, BrowserWindow } = require('electron');
  const plan = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const out = plan.out;
  app.whenReady().then(async () => {
    const win = new BrowserWindow({
      show: false,
      width: plan.width || 1280,
      height: plan.height || 720,
      webPreferences: { contextIsolation: true, nodeIntegration: false, backgroundThrottling: false },
    });
    const report = { scenes: 0, shots: [], logs: [] };
    try {
      await win.loadFile(path.join(out, 'harness.html'));
      const ids = await win.webContents.executeJavaScript(
        `window.__h.init(${plan.width || 1280}, ${plan.height || 720}, ${JSON.stringify(plan.tier || 'med')})`,
      );
      report.scenes = ids.length;
      for (const shot of plan.shots || []) {
        const js = `(() => { try { return window.__h.run(${JSON.stringify(shot.scene)}, ${shot.frames || 60}, ${shot.dt || 1 / 60}, ${JSON.stringify(shot.io || null)}); } catch (e) { return { error: String((e && e.stack) || e) }; } })()`;
        const r = await win.webContents.executeJavaScript(js);
        if (r && r.png) fs.writeFileSync(path.join(out, `${shot.name}.png`), Buffer.from(r.png.split(',')[1], 'base64'));
        report.shots.push({ name: shot.name, scene: shot.scene, updateMs: r.updateMs, msPerFrame: r.msPerFrame, gpuMs: r.gpuMs, warm: r.warm, error: r.error });
      }
      report.logs = await win.webContents.executeJavaScript('window.__h.logs');
    } catch (err) {
      report.fatal = String((err && err.stack) || err);
    }
    console.log(JSON.stringify(report, null, 1));
    app.exit(report.fatal ? 1 : 0);
  });
} else {
  // ---- Node: bundle, write the page, spawn Electron on this file
  const planPath = path.resolve(process.argv[2] || '');
  if (!planPath || !fs.existsSync(planPath)) {
    console.error('usage: node scripts/scene-harness.js <plan.json>');
    process.exit(2);
  }
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
  const out = path.resolve(plan.out || path.join(os.tmpdir(), 'swaycommand-harness'));
  fs.mkdirSync(out, { recursive: true });
  plan.out = out;
  const esbuild = require('esbuild');
  esbuild.buildSync({
    entryPoints: [path.join(__dirname, 'scene-harness.entry.js')],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'chrome140',
    outfile: path.join(out, 'harness.bundle.js'),
    logLevel: 'warning',
  });
  fs.writeFileSync(
    path.join(out, 'harness.html'),
    '<!doctype html><meta charset="utf-8"><title>scene harness</title><style>html,body{margin:0;background:#000}</style><canvas id="c"></canvas><script src="harness.bundle.js"></script>',
  );
  const resolved = path.join(out, 'harness.plan.json');
  fs.writeFileSync(resolved, JSON.stringify(plan));
  const { spawnSync } = require('node:child_process');
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  const electron = require('electron');
  // "freshCache": true runs Electron on an empty user-data dir, so the GPU
  // shader cache is cold and every shot's `warm.firstDrawMs` is the real
  // first-use compile, the number a user meets on the first launch after an
  // install. "userDataDir": "<path>" pins a specific profile instead.
  const args = [__filename, resolved];
  if (plan.freshCache) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'swaycommand-harness-cold-'));
    args.push(`--user-data-dir=${dir}`);
  } else if (plan.userDataDir) {
    args.push(`--user-data-dir=${path.resolve(plan.userDataDir)}`);
  }
  // "electronArgs": ["--gpu-program-cache-size-kb=524288", "--use-angle=gl"]
  // passes Chromium/ANGLE switches through, so the shader-cache and backend
  // questions can be measured without editing this file.
  for (const a of plan.electronArgs || []) args.push(String(a));
  const r = spawnSync(electron, args, { env, stdio: 'inherit', cwd: root });
  process.exit(r.status == null ? 1 : r.status);
}
