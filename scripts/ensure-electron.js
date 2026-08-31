// Make sure the Electron runtime binary is actually on disk.
//
// electron 43 publishes NO scripts at all, so nothing runs its own install.js
// and `npm install` exits 0 having downloaded no runtime. The package's
// path.txt and install.js are there; the ~100 MB dist/ is not. Everything that
// spawns the runtime then fails on a fresh clone:
//
//   npm start                       -> electron . cannot start
//   npm run test:electron           -> spawns a path that does not exist
//   node scripts/scene-harness.js   -> same
//
// The end-user launcher (scripts/bootstrap/) solves this its own way, by
// fetching and caching a verified Electron outside the repository. This is the
// developer half of the same problem.
//
// Runs as `postinstall`, and standalone as `npm run ensure:electron`.

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const pkgDir = path.join(__dirname, '..', 'node_modules', 'electron');

function binaryPath() {
  const marker = path.join(pkgDir, 'path.txt');
  if (!fs.existsSync(marker)) return null;
  return path.join(pkgDir, 'dist', fs.readFileSync(marker, 'utf8').trim());
}

function main() {
  if (!fs.existsSync(pkgDir)) {
    console.log('[electron] package not installed; nothing to do');
    return;
  }

  const exe = binaryPath();
  if (exe && fs.existsSync(exe)) {
    console.log(`[electron] runtime present (${path.relative(process.cwd(), exe)})`);
    return;
  }

  // electron-builder downloads its own runtime for packaging, so a release job
  // does not need this one and should not spend the download on it. A developer
  // running npm install locally does.
  if (process.env.CI && !process.env.SWAYCOMMAND_FORCE_ELECTRON) {
    console.log('[electron] runtime absent, skipped under CI (electron-builder fetches its own)');
    return;
  }

  const installer = path.join(pkgDir, 'install.js');
  if (!fs.existsSync(installer)) {
    console.warn('[electron] no install.js in the package; run `npm rebuild electron`');
    return;
  }

  console.log('[electron] runtime absent, downloading it (about 100 MB, once)');
  const result = spawnSync(process.execPath, [installer], { stdio: 'inherit', cwd: pkgDir });

  if (result.error || result.status !== 0) {
    // A failed download must not fail `npm install`: the tree is still usable
    // for everything that does not spawn the runtime, and the message says how
    // to finish the job.
    console.warn('[electron] download failed. Run `node node_modules/electron/install.js` to retry.');
    return;
  }

  const after = binaryPath();
  console.log(
    after && fs.existsSync(after)
      ? `[electron] runtime ready (${path.relative(process.cwd(), after)})`
      : '[electron] install.js finished but no binary appeared; run `npm rebuild electron`',
  );
}

main();
