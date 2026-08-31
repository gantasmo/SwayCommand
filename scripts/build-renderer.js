// Bundle the renderer into dist/ (the Electron app) or dist-embed/ (a static
// bundle a host application serves over http) and copy the static files each
// one needs.
//
//   node scripts/build-renderer.js                           -> dist/
//   node scripts/build-renderer.js --embed --base=/sway-app/ -> dist-embed/
//
// The embed target exists so the same cockpit can run inside theDAW while
// SwayCommand stays a standalone desktop application. It differs from the
// desktop bundle in four ways and no others:
//
//   - entry point src/renderer/embed.js, which installs the browser bridge
//     (src/renderer/host/) before app.js runs. app.js itself is untouched.
//   - a <base href> so every relative asset resolves under the host's mount
//     path rather than the host's root.
//   - a CSP without `frame-src gan:` (an Electron-only scheme) so plugin
//     surfaces served over http still frame.
//   - templates, docs and a prebuilt docs index copied in, because there is no
//     main process to read them off disk.
//
// dist-embed/ is deliberately NOT under dist/: electron-builder packs
// `dist/**/*` into the asar, and a nested copy would ship the embed bundle
// inside the desktop app for no reason.

'use strict';

const path = require('node:path');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const esbuild = require('esbuild');

const root = path.join(__dirname, '..');

const argv = process.argv.slice(2);
const EMBED = argv.includes('--embed');
const baseArg = argv.find((a) => a.startsWith('--base='));
const BASE = baseArg ? baseArg.slice('--base='.length) : '/';

const outDir = path.join(root, EMBED ? 'dist-embed' : 'dist');

/** Documents the in-app viewer offers, in order. Mirrors DOC_ORDER in main.js. */
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

function copyDir(src, dst, keep) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(from, to, keep);
    else if (!keep || keep(entry.name)) fs.copyFileSync(from, to);
  }
}

/** Package identity, stamped into the bundle and into build.json. */
function buildInfo() {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  let sha = 'unknown';
  try {
    sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root }).toString().trim();
  } catch {
    /* not a git checkout */
  }
  return {
    name: pkg.productName || pkg.name,
    version: pkg.version,
    sha,
    builtAt: new Date().toISOString(),
  };
}

/** The embed's index.html: base href, and a CSP without Electron-only schemes. */
function embedHtml(html, info) {
  let out = html;

  // Every asset load is relative, so one <base> repoints the whole document at
  // the host's mount path. Without it the AudioWorklet and the fonts resolve
  // against the host's root and 404.
  out = out.replace(/<head>/i, `<head>\n  <base href="${BASE}" />`);

  // gan: is an Electron custom scheme; over http a plugin surface is a normal
  // same-origin URL.
  out = out.replace(/frame-src gan:/, "frame-src 'self'");

  // The embed entry replaces the desktop bundle.
  out = out.replace('./renderer.bundle.js', './embed.bundle.js');

  // A marker for support and for the host's version display.
  out = out.replace(
    /<\/head>/i,
    `  <meta name="swaycommand-build" content="${info.version} ${info.sha.slice(0, 12)}" />\n</head>`,
  );
  return out;
}

async function main() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const info = buildInfo();

  await esbuild.build({
    entryPoints: [path.join(root, 'src', 'renderer', EMBED ? 'embed.js' : 'app.js')],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'chrome140',
    outfile: path.join(outDir, EMBED ? 'embed.bundle.js' : 'renderer.bundle.js'),
    minify: EMBED,
    sourcemap: false,
    logLevel: 'info',
    // Keep the third-party notices esbuild would otherwise drop; the bundle
    // carries Apache-2.0 and MIT derived work.
    legalComments: 'eof',
    define: {
      // Build identity, read by the browser bridge's info(). Defined for BOTH
      // targets: esbuild does not fail a build on a missing define, it emits
      // the bare identifier and the page throws ReferenceError at runtime.
      __SWAY_EMBED_BUILD__: JSON.stringify(info),
    },
  });

  const rendererDir = path.join(root, 'src', 'renderer');
  const html = fs.readFileSync(path.join(rendererDir, 'index.html'), 'utf8');
  fs.writeFileSync(
    path.join(outDir, 'index.html'),
    EMBED ? embedHtml(html, info) : html,
    'utf8',
  );
  fs.copyFileSync(path.join(rendererDir, 'styles.css'), path.join(outDir, 'styles.css'));

  // The AudioWorklet module loads by URL beside the bundle (CSP: self only).
  fs.copyFileSync(
    path.join(rendererDir, 'audio', 'dsp.worklet.js'),
    path.join(outDir, 'dsp.worklet.js'),
  );

  // Bundled display font, the CSP has no font-src, so remote fonts cannot load.
  copyDir(path.join(rendererDir, 'fonts'), path.join(outDir, 'fonts'));

  // Images the documentation viewer draws. It renders README.md, whose scene
  // gallery points at docs/media/; markdown.js rewrites that to ./media/, which
  // is why the directory lands beside index.html rather than under docs/.
  // Both targets need it: the desktop viewer and the embedded one render the
  // same Markdown.
  copyDir(
    path.join(root, 'docs', 'media'),
    path.join(outDir, 'media'),
    (f) => /\.(webp|png|jpe?g|gif|svg)$/i.test(f), // not the provenance note or the harness plan
  );

  if (EMBED) {
    // No main process over http, so what it used to read off disk ships inside
    // the bundle directory instead.
    copyDir(path.join(root, 'projects', 'templates'), path.join(outDir, 'templates'));

    const docsOut = path.join(outDir, 'docs');
    const index = [];
    for (const rel of DOC_ORDER) {
      const abs = path.join(root, rel);
      if (!fs.existsSync(abs)) continue;
      const dest = path.join(docsOut, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(abs, dest);
      let title = path.basename(rel, '.md');
      const head = fs.readFileSync(abs, 'utf8').slice(0, 4096);
      // Same fallback chain as listDocs() in main.js: first heading, else the
      // alt text of a leading banner image, else the file name.
      const m = /^#\s+(.+)$/m.exec(head) || /^!\[([^\]]+)\]\(/m.exec(head);
      if (m) title = m[1].trim();
      index.push({ id: rel, title });
    }
    fs.writeFileSync(
      path.join(outDir, 'docs-index.json'),
      `${JSON.stringify(index, null, 2)}\n`,
      'utf8',
    );

    for (const f of ['LICENSE', 'THIRD-PARTY-NOTICES.md']) {
      const abs = path.join(root, f);
      if (fs.existsSync(abs)) fs.copyFileSync(abs, path.join(outDir, f));
    }

    // Provenance, so a stale artifact in the host reads as a version rather
    // than a mystery cockpit that is missing a scene.
    fs.writeFileSync(
      path.join(outDir, 'build.json'),
      `${JSON.stringify({ ...info, base: BASE, target: 'embed' }, null, 2)}\n`,
      'utf8',
    );
  }

  console.log(`[build] renderer bundled to ${path.relative(root, outDir)}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
