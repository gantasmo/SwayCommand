// .gan web-plugins, GANTASMO's portable plugin format from theDAW: a ZIP
// holding manifest.json, an index.html entry and its assets (zip comment
// "GANv1"). A .gan is a CONTROL SURFACE: its page posts
// { type: 'updateValue', id, value | valueX/valueY/valueZ } to its parent, and
// the manifest's `controls` list names those ids. SwayCommand unpacks one into
// userData/plugins/<id>/, serves it to an iframe through the gan:// protocol,
// and routes its control outputs like gesture dimensions.
//
// The ZIP reader here is deliberately tiny (central directory + inflateRaw);
// no dependency, zip-slip guarded.

'use strict';

const path = require('node:path');
const fs = require('node:fs');
const zlib = require('node:zlib');
const { app, protocol, net } = require('electron');
const { pathToFileURL } = require('node:url');

const SCHEME = 'gan';

function pluginsDir() {
  const d = path.join(app.getPath('userData'), 'plugins');
  fs.mkdirSync(d, { recursive: true });
  return d;
}

// --- zip -----------------------------------------------------------------------

function readZipEntries(buf) {
  // End of central directory record: signature 0x06054b50, scan back 64 KB.
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('not a zip file');
  const count = buf.readUInt16LE(eocd + 10);
  const cdOffset = buf.readUInt32LE(eocd + 16);
  const commentLen = buf.readUInt16LE(eocd + 20);
  const comment = buf.slice(eocd + 22, eocd + 22 + commentLen).toString('utf8');
  const entries = [];
  let p = cdOffset;
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('bad central directory');
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const size = buf.readUInt32LE(p + 24);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const cmtLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.slice(p + 46, p + 46 + nameLen).toString('utf8');
    entries.push({ name, method, compSize, size, localOffset });
    p += 46 + nameLen + extraLen + cmtLen;
  }
  return { entries, comment };
}

function readEntry(buf, e) {
  const p = e.localOffset;
  if (buf.readUInt32LE(p) !== 0x04034b50) throw new Error(`bad local header for ${e.name}`);
  const nameLen = buf.readUInt16LE(p + 26);
  const extraLen = buf.readUInt16LE(p + 28);
  const start = p + 30 + nameLen + extraLen;
  const data = buf.slice(start, start + e.compSize);
  if (e.method === 0) return data;
  if (e.method === 8) return zlib.inflateRawSync(data);
  throw new Error(`unsupported compression ${e.method} for ${e.name}`);
}

// --- .gan ----------------------------------------------------------------------

function safeId(s) {
  const id = String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return id || 'plugin';
}

function info(ganPath) {
  const buf = fs.readFileSync(ganPath);
  const { entries, comment } = readZipEntries(buf);
  const m = entries.find((e) => e.name === 'manifest.json');
  if (!m) throw new Error('Invalid .gan: missing manifest.json');
  const manifest = JSON.parse(readEntry(buf, m).toString('utf8'));
  if (Number(manifest.format_version || 1) > 1) throw new Error(`This .gan uses format v${manifest.format_version}; only v1 is supported`);
  return { manifest, comment, buf, entries };
}

// Unpacks a .gan into userData/plugins/<id>/ (replacing an older copy) and
// returns what the renderer needs to host it.
function open(ganPath) {
  const { manifest, buf, entries } = info(ganPath);
  const id = safeId(manifest.id || path.basename(ganPath, '.gan'));
  const dir = path.join(pluginsDir(), id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const root = path.resolve(dir);
  for (const e of entries) {
    if (e.name.endsWith('/') || e.name === 'manifest.json') continue;
    const dest = path.resolve(root, e.name);
    if (!dest.startsWith(root + path.sep)) continue; // zip-slip
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, readEntry(buf, e));
  }
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(dir, '.source.json'), JSON.stringify({ path: ganPath, openedAt: new Date().toISOString() }));
  return describe(id, manifest, ganPath);
}

function describe(id, manifest, source) {
  const entry = String(manifest.entry_html || 'index.html').replace(/^\/+/, '');
  return {
    id,
    name: manifest.name || id,
    description: manifest.description || '',
    source,
    entry,
    url: `${SCHEME}://${id}/${entry}`,
    controls: (Array.isArray(manifest.controls) ? manifest.controls : []).map((c) => ({
      id: String(c.id),
      name: String(c.name || c.id),
      kind: String(c.kind || 'value'),
    })),
    params: Array.isArray(manifest.params) ? manifest.params : [],
    canvas: manifest.canvas || null,
  };
}

function list() {
  const out = [];
  for (const id of fs.readdirSync(pluginsDir())) {
    try {
      const manifest = JSON.parse(fs.readFileSync(path.join(pluginsDir(), id, 'manifest.json'), 'utf8'));
      let source = null;
      try {
        source = JSON.parse(fs.readFileSync(path.join(pluginsDir(), id, '.source.json'), 'utf8')).path;
      } catch {
        /* no source record */
      }
      out.push(describe(id, manifest, source));
    } catch {
      /* not a plugin dir */
    }
  }
  return out;
}

function remove(id) {
  const dir = path.join(pluginsDir(), safeId(id));
  fs.rmSync(dir, { recursive: true, force: true });
  return true;
}

// --- protocol ------------------------------------------------------------------

// Must run before app.whenReady(): a standard, secure scheme so the plugin
// page has a real origin (gan://<id>) and relative asset URLs resolve.
function registerScheme() {
  protocol.registerSchemesAsPrivileged([
    { scheme: SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } },
  ]);
}

function installHandler() {
  const root = path.resolve(pluginsDir());
  protocol.handle(SCHEME, (request) => {
    try {
      const u = new URL(request.url);
      const id = safeId(u.hostname);
      let rel = decodeURIComponent(u.pathname).replace(/^\/+/, '');
      if (!rel) rel = 'index.html';
      const file = path.resolve(root, id, rel);
      if (!file.startsWith(root + path.sep)) return new Response('forbidden', { status: 403 });
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return new Response('not found', { status: 404 });
      return net.fetch(pathToFileURL(file).toString());
    } catch (err) {
      return new Response(String(err && err.message), { status: 500 });
    }
  });
}

module.exports = { SCHEME, registerScheme, installHandler, open, list, remove, info, pluginsDir };
