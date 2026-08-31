// BLAKE2b-512 (RFC 7693), in JavaScript, because Electron cannot do it.
//
// Electron links BoringSSL rather than OpenSSL, and BoringSSL implements no
// BLAKE2 at all, process.versions.openssl reads '0.0.0' and crypto.getHashes()
// returns nothing matching /blake/. So crypto.createHash('blake2b512') throws
// "Digest method not supported" in the main process, while the same call works
// in plain Node. minisign's modern signature format ('ED') signs
// BLAKE2b-512(file), so without this module every signature check on an Audima
// download dies before it can even look at the signature.
//
// Verified byte-for-byte against Node's native blake2b512 and the RFC 7693
// test vector; see scripts/test-blake2b.js.
//
// 64-bit words are held as (low, high) uint32 pairs: word i occupies indices
// 2i and 2i+1. This is the standard approach for BLAKE2b in JS, BigInt would
// be far slower over a file of hundreds of megabytes.

'use strict';

const fs = require('node:fs');

// SHA-512 IV, as (low, high) pairs.
const IV32 = new Uint32Array([
  0xf3bcc908, 0x6a09e667, 0x84caa73b, 0xbb67ae85,
  0xfe94f82b, 0x3c6ef372, 0x5f1d36f1, 0xa54ff53a,
  0xade682d1, 0x510e527f, 0x2b3e6c1f, 0x9b05688c,
  0xfb41bd6b, 0x1f83d9ab, 0x137e2179, 0x5be0cd19,
]);

const SIGMA8 = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3,
  11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4,
  7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8,
  9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13,
  2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9,
  12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11,
  13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10,
  6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5,
  10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0,
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3,
];
// Pre-doubled, since every lookup indexes a (low, high) pair.
const SIGMA82 = new Uint8Array(SIGMA8.map((x) => x * 2));

// Compression scratch, reused across calls. Single-threaded by construction.
const v = new Uint32Array(32);
const m = new Uint32Array(32);

function add64AA(a, b) {
  const lo = v[a] + v[b];
  let hi = v[a + 1] + v[b + 1];
  if (lo >= 0x100000000) hi++;
  v[a] = lo;
  v[a + 1] = hi;
}

function add64AC(a, b0, b1) {
  let lo = v[a] + b0;
  // b0 arrives from a bitwise expression and may be a negative int32.
  if (b0 < 0) lo += 0x100000000;
  let hi = v[a + 1] + b1;
  if (lo >= 0x100000000) hi++;
  v[a] = lo;
  v[a + 1] = hi;
}

function get32(arr, i) {
  return arr[i] ^ (arr[i + 1] << 8) ^ (arr[i + 2] << 16) ^ (arr[i + 3] << 24);
}

// The G mixing function, with the four rotations (32, 24, 16, 63) written out
// as word swaps and shifts across the (low, high) pair.
function mix(a, b, c, d, ix, iy) {
  const x0 = m[ix];
  const x1 = m[ix + 1];
  const y0 = m[iy];
  const y1 = m[iy + 1];

  add64AA(a, b);
  add64AC(a, x0, x1);

  // rotr 32 is a straight swap of the halves.
  let xor0 = v[d] ^ v[a];
  let xor1 = v[d + 1] ^ v[a + 1];
  v[d] = xor1;
  v[d + 1] = xor0;

  add64AA(c, d);

  // rotr 24
  xor0 = v[b] ^ v[c];
  xor1 = v[b + 1] ^ v[c + 1];
  v[b] = (xor0 >>> 24) ^ (xor1 << 8);
  v[b + 1] = (xor1 >>> 24) ^ (xor0 << 8);

  add64AA(a, b);
  add64AC(a, y0, y1);

  // rotr 16
  xor0 = v[d] ^ v[a];
  xor1 = v[d + 1] ^ v[a + 1];
  v[d] = (xor0 >>> 16) ^ (xor1 << 16);
  v[d + 1] = (xor1 >>> 16) ^ (xor0 << 16);

  add64AA(c, d);

  // rotr 63
  xor0 = v[b] ^ v[c];
  xor1 = v[b + 1] ^ v[c + 1];
  v[b] = (xor1 >>> 31) ^ (xor0 << 1);
  v[b + 1] = (xor0 >>> 31) ^ (xor1 << 1);
}

function compress(ctx, last) {
  let i = 0;
  for (i = 0; i < 16; i++) {
    v[i] = ctx.h[i];
    v[i + 16] = IV32[i];
  }

  // Counter t, low 64 bits. t never approaches 2^53 for real files, so
  // deriving the halves arithmetically is safe here.
  v[24] = v[24] ^ (ctx.t % 0x100000000);
  v[25] = v[25] ^ (ctx.t / 0x100000000);
  if (last) {
    v[28] = ~v[28];
    v[29] = ~v[29];
  }

  for (i = 0; i < 32; i++) m[i] = get32(ctx.b, 4 * i);

  for (i = 0; i < 12; i++) {
    const s = SIGMA82.subarray(i * 16, i * 16 + 16);
    mix(0, 8, 16, 24, s[0], s[1]);
    mix(2, 10, 18, 26, s[2], s[3]);
    mix(4, 12, 20, 28, s[4], s[5]);
    mix(6, 14, 22, 30, s[6], s[7]);
    mix(0, 10, 20, 30, s[8], s[9]);
    mix(2, 12, 22, 24, s[10], s[11]);
    mix(4, 14, 16, 26, s[12], s[13]);
    mix(6, 8, 18, 28, s[14], s[15]);
  }

  for (i = 0; i < 16; i++) ctx.h[i] = ctx.h[i] ^ v[i] ^ v[i + 16];
}

function init(outlen) {
  if (outlen <= 0 || outlen > 64) throw new Error('Illegal BLAKE2b output length');
  const ctx = {
    b: new Uint8Array(128),
    h: new Uint32Array(16),
    t: 0, // bytes compressed so far
    c: 0, // bytes buffered in b
    outlen,
  };
  for (let i = 0; i < 16; i++) ctx.h[i] = IV32[i];
  // Parameter block: no key, no salt, no personalisation.
  ctx.h[0] = ctx.h[0] ^ 0x01010000 ^ outlen;
  return ctx;
}

function update(ctx, input) {
  for (let i = 0; i < input.length; ) {
    if (ctx.c === 128) {
      // Only compress once we know more input follows, so the final block is
      // always handled by final() with the `last` flag set.
      ctx.t += ctx.c;
      compress(ctx, false);
      ctx.c = 0;
    }
    const take = Math.min(128 - ctx.c, input.length - i);
    ctx.b.set(input.subarray(i, i + take), ctx.c);
    ctx.c += take;
    i += take;
  }
  return ctx;
}

function final(ctx) {
  ctx.t += ctx.c;
  while (ctx.c < 128) ctx.b[ctx.c++] = 0;
  compress(ctx, true);

  const out = Buffer.allocUnsafe(ctx.outlen);
  for (let i = 0; i < ctx.outlen; i++) {
    out[i] = (ctx.h[i >> 2] >> (8 * (i & 3))) & 0xff;
  }
  return out;
}

/** Incremental hasher, shaped like crypto.createHash for familiarity. */
function createHash(outlen = 64) {
  const ctx = init(outlen);
  return {
    update(chunk) {
      update(ctx, chunk instanceof Uint8Array ? chunk : Buffer.from(chunk));
      return this;
    },
    digest() {
      return final(ctx);
    },
  };
}

/** One-shot over a buffer. */
function blake2b512(data) {
  return createHash(64).update(data).digest();
}

/**
 * Streams a file, so verifying a several-hundred-megabyte installer never
 * needs the whole thing resident.
 */
function blake2b512File(filePath) {
  const ctx = init(64);
  const buffer = Buffer.allocUnsafe(1 << 20);
  const fd = fs.openSync(filePath, 'r');
  try {
    for (;;) {
      const read = fs.readSync(fd, buffer, 0, buffer.length, null);
      if (read <= 0) break;
      update(ctx, buffer.subarray(0, read));
    }
  } finally {
    fs.closeSync(fd);
  }
  return final(ctx);
}

module.exports = { blake2b512, blake2b512File, createHash };
