// Generate the SwayCommand icon with zero image dependencies: raw RGBA is
// painted in JS, PNG-encoded by hand (zlib + CRC32), and wrapped in a
// PNG-flavored .ico (valid on Vista+). Motif: sixteen beam stripes, one per
// Sway IR sensor, rising through the brand gradient on near-black.

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

// ---- tiny PNG encoder --------------------------------------------------------

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePNG(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- painter -------------------------------------------------------------------

const lerp = (a, b, t) => a + (b - a) * t;
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

function paint(size) {
  const px = Buffer.alloc(size * size * 4);
  const cyan = hex('#2de1fc');
  const pink = hex('#ff2d95');
  const violet = hex('#7a0bc0');

  const cx = size / 2;
  const rOuter = size * 0.47;
  const rCorner = size * 0.22;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;

      // rounded-square mask
      const dx = Math.max(Math.abs(x - cx) - (rOuter - rCorner), 0);
      const dy = Math.max(Math.abs(y - cx) - (rOuter - rCorner), 0);
      const inside = Math.hypot(dx, dy) <= rCorner;
      if (!inside) {
        px[i + 3] = 0;
        continue;
      }

      // near-black base with a faint violet floor glow
      const v = 1 - y / size;
      let r = lerp(5, violet[0] * 0.18, 1 - v);
      let g = lerp(6, violet[1] * 0.18, 1 - v);
      let b = lerp(10, violet[2] * 0.22, 1 - v);

      // 16 beams
      const u = (x / size) * 16;
      const beam = Math.floor(u);
      const frac = u - beam;
      const core = Math.exp(-Math.pow((frac - 0.5) * 3.2, 2)); // beam cross-section
      // per-beam height: a hand-swell curve peaking off-center
      const hgt = 0.35 + 0.6 * Math.exp(-Math.pow((beam - 9.5) / 4.2, 2));
      const lit = v < hgt ? 1 - Math.pow(v / hgt, 2.2) * 0.55 : Math.exp(-(v - hgt) * 14);
      const t = beam / 15;
      const cr = lerp(cyan[0], pink[0], t);
      const cg = lerp(cyan[1], pink[1], t);
      const cb = lerp(cyan[2], pink[2], t);
      const e = core * lit;
      r += cr * e;
      g += cg * e;
      b += cb * e;

      px[i] = Math.min(255, r);
      px[i + 1] = Math.min(255, g);
      px[i + 2] = Math.min(255, b);
      px[i + 3] = 255;
    }
  }
  return px;
}

// ---- ico wrapper ----------------------------------------------------------------

function pngToIco(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // count
  const entry = Buffer.alloc(16);
  entry[0] = size >= 256 ? 0 : size;
  entry[1] = size >= 256 ? 0 : size;
  entry[4] = 1; // planes
  entry.writeUInt16LE(32, 6); // bpp
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12); // offset
  return Buffer.concat([header, entry, png]);
}

// ---- main -----------------------------------------------------------------------

const buildDir = path.join(__dirname, '..', 'build');
fs.mkdirSync(buildDir, { recursive: true });

const png256 = encodePNG(256, 256, paint(256));
const png512 = encodePNG(512, 512, paint(512));
fs.writeFileSync(path.join(buildDir, 'icon.ico'), pngToIco(png256, 256));
fs.writeFileSync(path.join(buildDir, 'icon.png'), png512);
console.log('[icon] build/icon.ico + build/icon.png generated');
