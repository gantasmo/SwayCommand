// Audima CDN client. Two rules, both verified against Audima's site behavior
// and terms (docs/RESEARCH.md):
//   1. Never bundle Audima binaries — always fetch them onto the user's
//      machine from Audima's official CDN, with an honest custom User-Agent
//      (the CDN 403s curl/python-style UAs).
//   2. Verify everything we can: Audima signs release artifacts with minisign
//      (the pubkey their own app embeds); we verify before opening anything.

'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { app, shell } = require('electron');
const { AUDIMA } = require('../shared/constants');
const blake2b = require('./blake2b');

const ALLOWED_HOSTS = new Set(['cdn.audima.com.au', 'audima.com.au', 'www.audima.com.au']);

function assertAllowed(url) {
  const u = new URL(url);
  if (u.protocol !== 'https:' || !ALLOWED_HOSTS.has(u.hostname)) {
    throw new Error(`Refusing to fetch non-Audima URL: ${url}`);
  }
  return u;
}

async function audimaFetch(url, { timeout = 15000 } = {}) {
  assertAllowed(url);
  const res = await fetch(url, {
    headers: { 'User-Agent': AUDIMA.USER_AGENT },
    signal: AbortSignal.timeout(timeout),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).hostname}`);
  return res;
}

// --- latest.json (Tauri updater manifest) -----------------------------------

let latestCache = null;

async function fetchLatest(timeout = 15000) {
  if (latestCache) return latestCache;
  const res = await audimaFetch(AUDIMA.LATEST_JSON, { timeout });
  const manifest = await res.json();
  if (!manifest.version || !manifest.platforms) throw new Error('Unexpected latest.json shape');
  latestCache = manifest;
  return manifest;
}

function platformKey() {
  if (process.platform === 'win32') return 'windows-x86_64';
  if (process.platform === 'darwin') return process.arch === 'arm64' ? 'darwin-aarch64' : 'darwin-x86_64';
  return null; // Audima ships no Linux companion build
}

// --- minisign verification ----------------------------------------------------
// Pubkey blob: 'Ed' (2) + key id (8) + Ed25519 public key (32).
// Signature file: line 1 untrusted comment, line 2 base64 of
// 'ED'|'Ed' (2) + key id (8) + signature (64). 'ED' = prehashed: the
// signature is over BLAKE2b-512(file); 'Ed' = legacy, over the file itself.

function parsePubkey(b64) {
  const raw = Buffer.from(b64, 'base64');
  if (raw.length !== 42 || raw.toString('latin1', 0, 2) !== 'Ed') {
    throw new Error('Bad minisign public key');
  }
  return { keyId: raw.subarray(2, 10), key: raw.subarray(10, 42) };
}

function parseSignature(sigText) {
  const lines = sigText.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('untrusted comment:') && !l.startsWith('trusted comment:'));
  // First non-comment line is the signature blob; a second (if present) is the
  // global signature over the trusted comment, which we don't need.
  const raw = Buffer.from(lines[0], 'base64');
  const alg = raw.toString('latin1', 0, 2);
  if ((alg !== 'ED' && alg !== 'Ed') || raw.length !== 74) throw new Error('Bad minisign signature');
  return { alg, keyId: raw.subarray(2, 10), sig: raw.subarray(10, 74) };
}

function ed25519KeyObject(raw32) {
  // Wrap the raw key in SPKI DER: SEQUENCE { AlgorithmIdentifier(Ed25519), BIT STRING key }
  const spki = Buffer.concat([Buffer.from('302a300506032b6570032100', 'hex'), raw32]);
  return crypto.createPublicKey({ key: spki, format: 'der', type: 'spki' });
}

function minisignVerify(filePath, signatureB64OrText, pubkeyB64) {
  const pub = parsePubkey(pubkeyB64);
  // Tauri manifests carry the whole .sig file base64-encoded; accept either form.
  let sigText = signatureB64OrText;
  if (!sigText.includes('minisign') && !sigText.includes('\n')) {
    try {
      const decoded = Buffer.from(signatureB64OrText, 'base64').toString('utf8');
      if (decoded.includes('comment:') || decoded.includes('\n')) sigText = decoded;
    } catch {
      /* treat as raw text */
    }
  }
  const parsed = parseSignature(sigText);
  if (!parsed.keyId.equals(pub.keyId)) throw new Error('Signature key id does not match Audima’s public key');

  // 'ED' signs BLAKE2b-512(file), 'Ed' signs the file itself. The prehash comes
  // from our own BLAKE2b: Electron links BoringSSL, which implements no BLAKE2,
  // so crypto.createHash('blake2b512') throws "Digest method not supported" here
  // and every signature check died before it could look at the signature.
  // It also streams, so a large installer never has to be resident.
  const message = parsed.alg === 'ED' ? blake2b.blake2b512File(filePath) : fs.readFileSync(filePath);
  const ok = crypto.verify(null, message, ed25519KeyObject(pub.key), parsed.sig);
  if (!ok) throw new Error('minisign signature verification FAILED');
  return true;
}

// --- downloads ------------------------------------------------------------------

async function downloadTo(url, destPath, progress) {
  const res = await audimaFetch(url, { timeout: 10 * 60 * 1000 });
  const total = Number(res.headers.get('content-length') || 0);
  const tmp = destPath + '.part';
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  const out = fs.createWriteStream(tmp);
  let received = 0;
  for await (const chunk of res.body) {
    out.write(chunk);
    received += chunk.length;
    if (progress && total) progress({ phase: 'download', received, total, pct: Math.round((received / total) * 100) });
  }
  await new Promise((resolve, reject) => out.end((err) => (err ? reject(err) : resolve())));
  fs.renameSync(tmp, destPath);
  return destPath;
}

// Download the official Sway companion app for this OS, verify its minisign
// signature against the pubkey Audima's own app embeds, then hand the
// installer to the OS (msiexec / DMG mount) for the user to complete.
async function downloadCompanion(progress) {
  const key = platformKey();
  if (!key) {
    return { ok: false, detail: 'Audima ships no Linux companion app. Playing SwayCommand does not require it.' };
  }

  let url;
  let signature = null;
  try {
    const manifest = await fetchLatest();
    const entry = manifest.platforms[key];
    if (!entry || !entry.url) throw new Error(`No ${key} entry in latest.json`);
    url = entry.url;
    signature = entry.signature || null;
  } catch (err) {
    // CDN manifest unreachable/odd — fall back to the pinned known-good URL.
    url =
      process.platform === 'win32'
        ? AUDIMA.FALLBACK_APP_WIN
        : process.arch === 'arm64'
          ? AUDIMA.FALLBACK_APP_MAC_ARM
          : AUDIMA.FALLBACK_APP_MAC_X64;
  }

  const fileName = decodeURIComponent(path.basename(new URL(url).pathname));
  const dest = path.join(app.getPath('downloads'), fileName);
  await downloadTo(url, dest, progress);

  if (signature) {
    if (progress) progress({ phase: 'verify', pct: 100 });
    try {
      minisignVerify(dest, signature, AUDIMA.MINISIGN_PUBKEY);
    } catch (err) {
      fs.rmSync(dest, { force: true });
      return { ok: false, detail: `Deleted download — ${err.message}. Get it manually from audima.com.au/downloads.` };
    }
  }

  await shell.openPath(dest);
  const verifiedNote = signature ? 'signature verified ✓' : 'no signature available for this fallback URL — installer opened, proceed at your discretion';
  return { ok: true, detail: `Downloaded ${fileName} (${verifiedNote}). Complete the install in the window that just opened, then re-run checks.` };
}

// Download + extract the official Windows DFU driver package; returns the
// directory containing STM32Bootloader.inf. Extraction via PowerShell's
// Expand-Archive so we need no zip dependency.
async function downloadDfuDriver(progress) {
  const zipPath = path.join(app.getPath('userData'), 'audima', 'dfu-driver.zip');
  const outDir = path.join(app.getPath('userData'), 'audima', 'dfu-driver');
  await downloadTo(AUDIMA.DFU_DRIVER_ZIP, zipPath, progress);
  fs.rmSync(outDir, { recursive: true, force: true });
  await new Promise((resolve, reject) => {
    const { execFile } = require('node:child_process');
    execFile(
      'powershell.exe',
      ['-NoProfile', '-Command', `Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${outDir}' -Force`],
      { windowsHide: true, timeout: 60000 },
      (err) => (err ? reject(err) : resolve())
    );
  });
  // The INF may sit at the zip root or one folder down.
  const stack = [outDir];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(p);
      else if (/stm32bootloader\.inf$/i.test(entry.name)) return p;
    }
  }
  throw new Error('STM32Bootloader.inf not found in the driver package');
}

module.exports = { fetchLatest, downloadCompanion, downloadDfuDriver, minisignVerify, audimaFetch };
