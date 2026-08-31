// Prune approved work out of HANDOFF.md. Delivered tasks wait for the user's
// approval inside `<!-- prune:<id> -->` ... `<!-- /prune:<id> -->` blocks; once a
// task is approved, removing its block keeps the note short, git history keeps
// the detail. The ids go onto the one-line ledger at the end of the note.
//
//   node scripts/handoff-prune.js --list        print the prunable ids
//   node scripts/handoff-prune.js <id> [<id>...]  remove those blocks
//   node scripts/handoff-prune.js --all         remove every block

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const file = path.join(__dirname, '..', 'HANDOFF.md');
let text = fs.readFileSync(file, 'utf8');
const blockRe = /<!-- prune:([a-z0-9-]+) -->[\s\S]*?<!-- \/prune:\1 -->\n?/g;
const ids = [...text.matchAll(blockRe)].map((m) => m[1]);
const args = process.argv.slice(2);

if (!args.length || args.includes('--list')) {
  console.log(ids.length ? ids.join('\n') : '(no prunable blocks)');
  process.exit(0);
}
const wanted = args.includes('--all') ? ids : args;
const missing = wanted.filter((id) => !ids.includes(id));
if (missing.length) {
  console.error(`no such block: ${missing.join(', ')}`);
  process.exit(1);
}
const removed = [];
text = text.replace(blockRe, (m, id) => {
  if (!wanted.includes(id)) return m;
  removed.push(id);
  return '';
});
const ledgerRe = /^Approved and pruned: (.*)$/m;
const prev = (text.match(ledgerRe) || [])[1];
const prevIds = prev && prev !== '(none yet)' ? prev.split(',').map((s) => s.trim()).filter(Boolean) : [];
const today = new Date().toISOString().slice(0, 10);
const entries = prevIds.concat(removed.map((id) => `${id} (${today})`));
if (ledgerRe.test(text)) text = text.replace(ledgerRe, `Approved and pruned: ${entries.length ? entries.join(', ') : '(none yet)'}`);
text = text.replace(/\n{3,}/g, '\n\n');
fs.writeFileSync(file, text);
console.log(removed.length ? `pruned: ${removed.join(', ')}` : 'nothing pruned');
