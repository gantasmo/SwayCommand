// .sway project file I/O, the application's only write channel. Reads and
// writes validated documents at user-chosen paths; bundled templates are
// id-gated the same way DOC_ORDER gates docs:read, so no caller-supplied path
// reaches the filesystem through the template surface.

'use strict';

const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { app } = require('electron');

const { FORMAT, FORMAT_VERSION, validateProject } = require('../shared/swayproject');

// A v1 document is kilobytes of JSON; the cap exists to keep the read channel
// from being pointed at anything else.
const MAX_PROJECT_BYTES = 8 * 1024 * 1024;

function defaultProjectsDir() {
  return path.join(app.getPath('documents'), 'SwayCommand Projects');
}

function templatesDir() {
  // package root in dev; resources/app.asar root when packaged
  return path.join(__dirname, '..', '..', 'projects', 'templates');
}

function templateOrder() {
  try {
    const index = JSON.parse(fs.readFileSync(path.join(templatesDir(), 'index.json'), 'utf8'));
    return Array.isArray(index.order) ? index.order : [];
  } catch {
    return [];
  }
}

function assertSwayPath(filePath) {
  if (typeof filePath !== 'string' || path.extname(filePath).toLowerCase() !== '.sway') {
    throw new Error('Project files use the .sway extension');
  }
}

function readProject(filePath) {
  assertSwayPath(filePath);
  const stat = fs.statSync(filePath);
  if (stat.size > MAX_PROJECT_BYTES) {
    throw new Error(`${path.basename(filePath)} is not a project file (too large)`);
  }
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (raw.format !== FORMAT) throw new Error(`${path.basename(filePath)} is not a .sway project`);
  const fv = Number(raw.format_version);
  if (fv > FORMAT_VERSION) {
    throw new Error(`This project uses format v${fv}; this build supports up to v${FORMAT_VERSION}, update SwayCommand to open it.`);
  }
  const { doc, warnings } = validateProject(raw);
  const dir = path.dirname(filePath);
  for (const m of doc.project.media) {
    m.resolvedPath = path.isAbsolute(m.path) ? m.path : path.resolve(dir, m.path);
  }
  return { doc, path: filePath, dir, warnings };
}

function writeProject(filePath, input) {
  assertSwayPath(filePath);
  const appRoot = app.getAppPath();
  const resolved = path.resolve(filePath);
  if (resolved === appRoot || resolved.startsWith(appRoot + path.sep)) {
    throw new Error('Projects cannot be saved inside the application directory');
  }
  const { doc, warnings } = validateProject(input);
  const now = new Date().toISOString();
  if (!doc.created_at) doc.created_at = now;
  doc.modified_at = now;
  doc.app_version = app.getVersion();
  const dir = path.dirname(resolved);
  for (const m of doc.project.media) {
    // Prefer the freshest absolute path the renderer knows, then store it
    // project-relative when the file sits under the project directory.
    const abs = m.resolvedPath && path.isAbsolute(m.resolvedPath)
      ? m.resolvedPath
      : path.isAbsolute(m.path) ? m.path : path.resolve(dir, m.path);
    delete m.resolvedPath;
    const rel = path.relative(dir, abs);
    m.path = rel && !rel.startsWith('..') && !path.isAbsolute(rel) ? rel.split(path.sep).join('/') : abs;
  }
  fs.mkdirSync(dir, { recursive: true });
  const tmp = resolved + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(doc, null, 2) + '\n');
  fs.renameSync(tmp, resolved);
  return { ok: true, path: resolved, warnings };
}

function listTemplates() {
  const dir = templatesDir();
  return templateOrder()
    .map((id) => {
      try {
        const doc = JSON.parse(fs.readFileSync(path.join(dir, `${id}.sway`), 'utf8'));
        const meta = (doc.project && doc.project.meta) || {};
        return {
          id,
          name: meta.name || id,
          description: meta.description || '',
          vibe: meta.vibe || '',
          bpmHint: meta.bpmHint || 0,
          palette: (doc.project && doc.project.palette) || [],
        };
      } catch (err) {
        console.error(`[templates] failed to load ${id}:`, err.message);
        return null;
      }
    })
    .filter(Boolean);
}

function readTemplate(id) {
  // Only ids the bundled index enumerates are readable.
  if (!templateOrder().includes(id)) throw new Error(`Unknown template: ${id}`);
  const raw = JSON.parse(fs.readFileSync(path.join(templatesDir(), `${id}.sway`), 'utf8'));
  const { doc, warnings } = validateProject(raw);
  return { doc, path: null, dir: null, warnings };
}

// --- recents (stored under settings.recentProjects) --------------------------

const MAX_RECENTS = 10;

function pruneRecents(list) {
  const seen = new Set();
  const out = [];
  for (const r of Array.isArray(list) ? list : []) {
    if (!r || typeof r.path !== 'string' || seen.has(r.path)) continue;
    seen.add(r.path);
    try {
      fs.accessSync(r.path);
    } catch {
      continue;
    }
    out.push({ path: r.path, name: typeof r.name === 'string' ? r.name : path.basename(r.path, '.sway'), openedAt: r.openedAt || null });
    if (out.length >= MAX_RECENTS) break;
  }
  return out;
}

function pushRecent(list, entry) {
  return pruneRecents([{ ...entry, openedAt: new Date().toISOString() }, ...(Array.isArray(list) ? list : [])]);
}

// --- media hashing -----------------------------------------------------------

function statAudio(filePath, maxBytes) {
  return new Promise((resolve, reject) => {
    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch (err) {
      return reject(err);
    }
    if (maxBytes && stat.size > maxBytes) {
      return reject(new Error(`${path.basename(filePath)} is ${Math.round(stat.size / 1e6)} MB; the limit is ${maxBytes / 1e6} MB`));
    }
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve({ bytes: stat.size, sha256: hash.digest('hex') }));
  });
}

module.exports = {
  MAX_PROJECT_BYTES,
  defaultProjectsDir,
  readProject,
  writeProject,
  listTemplates,
  readTemplate,
  pruneRecents,
  pushRecent,
  statAudio,
};
