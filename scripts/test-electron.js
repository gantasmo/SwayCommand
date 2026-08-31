// Runs the crypto tests inside Electron's runtime rather than Node's.
//
// This matters more than it looks: Electron links BoringSSL and Node links
// OpenSSL, so the two disagree about which hashes exist. The BLAKE2b bug that
// broke every Audima signature check passed cleanly under `npm test` and only
// showed up here. Any test touching node:crypto should be run both ways.
//
//   npm run test:electron

'use strict';

const { spawnSync } = require('node:child_process');
const path = require('node:path');

// Under plain Node, requiring electron yields the path to its executable.
const electron = require('electron');
if (typeof electron !== 'string') {
  console.error('Run this with node, not with electron.');
  process.exit(1);
}

const targets = process.argv.slice(2);
if (targets.length === 0) {
  targets.push('scripts/test-blake2b.js', 'scripts/test-minisign.js');
}

let failed = 0;
for (const target of targets) {
  console.log(`\n--- ${target} under Electron ---`);
  const result = spawnSync(electron, [path.resolve(target)], {
    stdio: 'inherit',
    // Run Electron's Node without a browser window; the crypto stack is the
    // same one the main process gets.
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
  });
  if (result.status !== 0) {
    failed++;
    console.error(`FAILED: ${target} (exit ${result.status})`);
  }
}

process.exit(failed === 0 ? 0 : 1);
