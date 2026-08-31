// End-to-end check of minisignVerify() in src/main/audima.js.
//
// Audima's private key is obviously not available, so this mints its own
// Ed25519 keypair, produces signatures in minisign's exact wire format, and
// drives the real verifier with them. It must accept a good signature and
// reject every way of tampering with one.
//
// Run it under BOTH runtimes, the failure it exists to catch only appears in
// one of them:
//   node scripts/test-minisign.js
//   ELECTRON_RUN_AS_NODE=1 ./node_modules/electron/dist/electron.exe scripts/test-minisign.js

'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { minisignVerify } = require('../src/main/audima');
const { blake2b512File } = require('../src/main/blake2b');

let failures = 0;
let checks = 0;

function ok(name, fn) {
  checks++;
  try {
    fn();
  } catch (err) {
    failures++;
    console.error(`FAIL  ${name}: ${err.message}`);
  }
}

function rejects(name, fn) {
  checks++;
  try {
    fn();
    failures++;
    console.error(`FAIL  ${name}: expected a rejection, got none`);
  } catch {
    /* expected */
  }
}

// --- mint a keypair and render it the way minisign does ----------------------

const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
const rawPub = publicKey.export({ format: 'der', type: 'spki' }).subarray(-32);
const keyId = crypto.randomBytes(8);
const pubkeyB64 = Buffer.concat([Buffer.from('Ed'), keyId, rawPub]).toString('base64');

function signatureFor(filePath, { alg = 'ED', id = keyId } = {}) {
  const message = alg === 'ED' ? blake2b512File(filePath) : fs.readFileSync(filePath);
  const sig = crypto.sign(null, message, privateKey);
  const blob = Buffer.concat([Buffer.from(alg), id, sig]).toString('base64');
  return `untrusted comment: signature from test key\n${blob}\ntrusted comment: test\n`;
}

const tmp = path.join(os.tmpdir(), `minisign-test-${process.pid}.bin`);
const payload = crypto.randomBytes(300000);
fs.writeFileSync(tmp, payload);

try {
  console.log(`runtime: node ${process.version}, openssl ${process.versions.openssl}`);

  // The case that was broken: prehashed 'ED', the format Audima actually ships.
  ok('accepts a valid prehashed (ED) signature', () => {
    if (minisignVerify(tmp, signatureFor(tmp), pubkeyB64) !== true) {
      throw new Error('returned falsy');
    }
  });

  ok('accepts a valid legacy (Ed) signature', () => {
    if (minisignVerify(tmp, signatureFor(tmp, { alg: 'Ed' }), pubkeyB64) !== true) {
      throw new Error('returned falsy');
    }
  });

  // Tauri manifests carry the whole .sig file base64-encoded.
  ok('accepts a base64-wrapped signature file', () => {
    const wrapped = Buffer.from(signatureFor(tmp), 'utf8').toString('base64');
    if (minisignVerify(tmp, wrapped, pubkeyB64) !== true) throw new Error('returned falsy');
  });

  ok('verifies an empty file', () => {
    const empty = `${tmp}.empty`;
    fs.writeFileSync(empty, Buffer.alloc(0));
    try {
      if (minisignVerify(empty, signatureFor(empty), pubkeyB64) !== true) {
        throw new Error('returned falsy');
      }
    } finally {
      fs.rmSync(empty, { force: true });
    }
  });

  // --- and now everything that must NOT pass ---------------------------------

  const goodSig = signatureFor(tmp);

  rejects('rejects a file altered after signing', () => {
    const tampered = `${tmp}.tampered`;
    const bytes = Buffer.from(payload);
    bytes[12345] = bytes[12345] ^ 0x01;
    fs.writeFileSync(tampered, bytes);
    try {
      minisignVerify(tampered, goodSig, pubkeyB64);
    } finally {
      fs.rmSync(tampered, { force: true });
    }
  });

  rejects('rejects a signature from a different key', () => {
    const other = crypto.generateKeyPairSync('ed25519');
    const otherRaw = other.publicKey.export({ format: 'der', type: 'spki' }).subarray(-32);
    const otherPub = Buffer.concat([Buffer.from('Ed'), keyId, otherRaw]).toString('base64');
    minisignVerify(tmp, goodSig, otherPub);
  });

  rejects('rejects a mismatched key id', () => {
    minisignVerify(tmp, signatureFor(tmp, { id: crypto.randomBytes(8) }), pubkeyB64);
  });

  rejects('rejects a corrupted signature blob', () => {
    const raw = Buffer.from(goodSig.split('\n')[1], 'base64');
    raw[40] = raw[40] ^ 0xff;
    const bad = `untrusted comment: x\n${raw.toString('base64')}\n`;
    minisignVerify(tmp, bad, pubkeyB64);
  });

  rejects('rejects an ED signature presented as Ed (prehash confusion)', () => {
    // Same 64 signature bytes, relabelled: verifying the raw file against a
    // signature over its hash must fail.
    const raw = Buffer.from(signatureFor(tmp, { alg: 'ED' }).split('\n')[1], 'base64');
    raw.write('Ed', 0, 'latin1');
    minisignVerify(tmp, `untrusted comment: x\n${raw.toString('base64')}\n`, pubkeyB64);
  });

  rejects('rejects a truncated signature', () => {
    const raw = Buffer.from(goodSig.split('\n')[1], 'base64').subarray(0, 60);
    minisignVerify(tmp, `untrusted comment: x\n${raw.toString('base64')}\n`, pubkeyB64);
  });

  rejects('rejects a malformed public key', () => {
    minisignVerify(tmp, goodSig, Buffer.from('nonsense').toString('base64'));
  });
} finally {
  fs.rmSync(tmp, { force: true });
}

console.log(`${checks - failures}/${checks} checks passed`);
process.exit(failures === 0 ? 0 : 1);
