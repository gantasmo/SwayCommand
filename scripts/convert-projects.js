// One-shot: convert the legacy projects/*.json presets into bundled .sway
// templates under projects/templates/. Output is committed; safe to re-run.

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { legacyToSway } = require('../src/shared/swayproject');

const root = path.join(__dirname, '..');
const legacyDir = path.join(root, 'projects');
const outDir = path.join(legacyDir, 'templates');

const legacyIndex = path.join(legacyDir, 'index.json');
if (!fs.existsSync(legacyIndex)) {
  console.log('[convert] no legacy projects/index.json, the conversion already ran; templates/ is the output.');
  process.exit(0);
}
const index = JSON.parse(fs.readFileSync(legacyIndex, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });

const order = [];
for (const id of index.order) {
  const legacyPath = path.join(legacyDir, `${id}.json`);
  let legacy;
  try {
    legacy = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
  } catch (err) {
    console.error(`[convert] skipped ${id}: ${err.message}`);
    continue;
  }
  const doc = legacyToSway(legacy);
  // Right-cluster pads (8-15) come pre-assigned to the template's pool
  // scenes as instant cuts, so a fresh project answers the hardware
  // immediately; the left cluster stays free for samples.
  doc.project.engine.autoVJ.pool.slice(0, 8).forEach((scene, i) => {
    doc.project.assignments.pads[8 + i] = {
      type: 'scene',
      scene,
      transition: { type: 'cut', duration: 0 },
    };
  });
  const outPath = path.join(outDir, `${id}.sway`);
  fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n');
  order.push(id);
  console.log(`[convert] ${id} -> ${path.relative(root, outPath)}`);
}

fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify({ order }, null, 2) + '\n');
console.log(`[convert] wrote templates/index.json (${order.length} templates)`);
