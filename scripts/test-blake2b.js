// Checks src/main/blake2b.js against Node's native blake2b512 and RFC 7693.
//
// Run under plain Node (which has BLAKE2b via OpenSSL) — that is the whole
// point: the reference we are testing against is exactly the implementation
// Electron cannot give us. Run under Electron it will skip the differential
// half and only assert the fixed vectors.
//
//   node scripts/test-blake2b.js

'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { blake2b512, blake2b512File, createHash } = require('../src/main/blake2b');

let failures = 0;
let checks = 0;

function check(name, actual, expected) {
  checks++;
  if (actual !== expected) {
    failures++;
    console.error(`FAIL  ${name}\n        got      ${actual}\n        expected ${expected}`);
  }
}

let hasNative = false;
try {
  crypto.createHash('blake2b512');
  hasNative = true;
} catch {
  hasNative = false;
}
console.log(`native blake2b512 available: ${hasNative} (openssl ${process.versions.openssl})`);

// --- RFC 7693 / known vectors -------------------------------------------------

check(
  'empty string',
  blake2b512(Buffer.alloc(0)).toString('hex'),
  '786a02f742015903c6c6fd852552d272912f4740e15847618a86e217f71f5419' +
    'd25e1031afee585313896444934eb04b903a685b1448b755d56f701afe9be2ce'
);

check(
  'RFC 7693 "abc"',
  blake2b512(Buffer.from('abc')).toString('hex'),
  'ba80a53f981c4d0d6a2797b69f12f6e94c212f14685ac4b74b12bb6fdbffa2d1' +
    '7d87c5392aab792dc252d5de4533cc9518d38aa8dbf1925ab92386edd4009923'
);

// The digest length is encoded in the parameter block, so a wrong outlen
// changes every output byte. Node only exposes blake2b at 512 bits, so these
// shorter lengths are pinned to published BLAKE2b-256 vectors instead.
check(
  'BLAKE2b-256 empty',
  createHash(32).update(Buffer.alloc(0)).digest().toString('hex'),
  '0e5751c026e543b2e8ab2eb06099daa1d1e5df47778f7787faab45cdf12fe3a8'
);
check(
  'BLAKE2b-256 "abc"',
  createHash(32).update(Buffer.from('abc')).digest().toString('hex'),
  'bddd813c634239723171ef3fee98579b94964e3bb1cb3e427262c8c068d52319'
);

// --- differential against Node's own implementation ---------------------------
// Sizes chosen around the 128-byte block boundary, where an off-by-one in the
// buffering or the final-block flag would hide.

if (hasNative) {
  const sizes = [
    0, 1, 55, 63, 64, 65, 111, 127, 128, 129, 130, 200, 255, 256, 257,
    1000, 4096, 65535, 65536, 100000, 1 << 20,
  ];
  for (const size of sizes) {
    const data = crypto.randomBytes(size);
    check(
      `differential ${size} bytes`,
      blake2b512(data).toString('hex'),
      crypto.createHash('blake2b512').update(data).digest('hex')
    );
  }

  // Chunked updates must equal a single-shot hash of the concatenation.
  for (let trial = 0; trial < 40; trial++) {
    const chunks = [];
    const count = 1 + Math.floor(Math.random() * 8);
    for (let i = 0; i < count; i++) {
      chunks.push(crypto.randomBytes(Math.floor(Math.random() * 400)));
    }
    const whole = Buffer.concat(chunks);
    const h = createHash(64);
    for (const c of chunks) h.update(c);
    check(
      `chunked trial ${trial} (${chunks.length} chunks, ${whole.length} bytes)`,
      h.digest().toString('hex'),
      crypto.createHash('blake2b512').update(whole).digest('hex')
    );
  }

  // The streaming file path, which is what actually runs in production.
  const tmp = path.join(os.tmpdir(), `blake2b-test-${process.pid}.bin`);
  try {
    for (const size of [0, 1, 128, 100000, 3 * (1 << 20) + 17]) {
      const data = crypto.randomBytes(size);
      fs.writeFileSync(tmp, data);
      check(
        `file ${size} bytes`,
        blake2b512File(tmp).toString('hex'),
        crypto.createHash('blake2b512').update(data).digest('hex')
      );
    }
  } finally {
    fs.rmSync(tmp, { force: true });
  }
} else {
  console.log('skipping differential checks — no native blake2b512 here');
}

console.log(`${checks - failures}/${checks} checks passed`);
process.exit(failures === 0 ? 0 : 1);
