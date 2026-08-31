// Generates src/renderer/engine/scenes/miraclemile/coast.js, the coastline
// polylines and the land mask the launch map draws its globe from, out of
// Natural Earth's 1:110m land polygons as shipped by the `world-atlas` npm
// package (TopoJSON), decoded with `topojson-client`. Both are DEV-TIME
// packages installed with `--no-save`; the renderer bundle never touches
// them: the output is a plain ES module of numbers that the scene imports as
// a constant (no fetch, no asset).
//
//   npm install --no-save world-atlas@2 topojson-client@3
//   node scripts/gen-coast.js
//
// What it emits:
//   * RINGS, every land ring (coasts, the Caspian hole) plus a few hand-traced
//     major lakes, simplified on the sphere (Douglas-Peucker on unit vectors,
//     chord tolerance) to ~2,500 points in total, as flat [lon, lat, ...]
//     arrays in degrees rounded to 0.01° (about a kilometre).
//   * MASK, a W×H equirectangular land mask rasterised from the UNSIMPLIFIED
//     rings by even-odd scanline fill, run-length encoded per row (so holes
//     and lakes come out as water), decoded into a Uint8Array at scene
//     creation and sampled as a faint fill on the globe.
//
// Natural Earth data is public domain; world-atlas is ISC (Mike Bostock).

'use strict';

const fs = require('node:fs');
const path = require('node:path');

let topojson, land;
try {
  topojson = require('topojson-client');
  land = require('world-atlas/land-110m.json');
} catch (e) {
  console.error('gen-coast: world-atlas / topojson-client are not installed. Run:\n  npm install --no-save world-atlas@2 topojson-client@3');
  process.exit(1);
}

const OUT = path.join(__dirname, '..', 'src', 'renderer', 'engine', 'scenes', 'miraclemile', 'coast.js');
const TARGET_POINTS = 2600;   // the simplification aims here (±10 %)
const MASK_W = 1024, MASK_H = 512;

// ---- the rings, in [lon, lat] degrees ---------------------------------------------------
const fc = topojson.feature(land, land.objects.land);
const rawRings = [];   // { pts: [[lon, lat], ...], lake: bool }
for (const f of fc.features) {
  const g = f.geometry;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  for (const poly of polys) {
    poly.forEach((ring, k) => rawRings.push({ pts: ring.slice(), lake: k > 0 }));
  }
}

// Natural Earth has no lakes in the land layer at 1:110m (the Caspian is the
// one hole). The big ones are traced coarsely by hand so the continents read:
// the Great Lakes, Baikal, Victoria. Approximate outlines, a few points each.
const LAKES = {
  superior: [[-92.1, 46.75], [-90.3, 46.6], [-88.4, 46.85], [-87.5, 46.5], [-86.0, 46.65], [-84.8, 46.5], [-84.6, 46.9], [-86.0, 47.7], [-87.5, 48.1], [-88.5, 48.55], [-89.5, 48.3], [-90.5, 47.8], [-91.6, 47.3]],
  michigan: [[-87.0, 41.7], [-86.4, 42.5], [-86.3, 43.6], [-86.5, 44.2], [-85.5, 45.2], [-85.0, 45.8], [-86.0, 45.9], [-87.0, 45.7], [-87.6, 45.0], [-87.5, 44.2], [-87.8, 43.0], [-87.6, 42.0]],
  huron: [[-82.4, 43.0], [-83.6, 43.9], [-83.3, 45.3], [-84.6, 46.0], [-83.0, 46.1], [-81.5, 46.0], [-80.4, 45.3], [-80.0, 44.5], [-81.3, 44.8], [-81.7, 44.2], [-81.7, 43.4]],
  erie: [[-83.4, 41.7], [-82.5, 41.4], [-81.0, 41.8], [-79.5, 42.6], [-78.9, 42.9], [-79.8, 42.85], [-81.3, 42.7], [-82.4, 42.1], [-83.1, 42.0]],
  ontario: [[-79.8, 43.3], [-78.5, 43.3], [-77.0, 43.3], [-76.3, 43.5], [-76.2, 44.1], [-77.5, 44.0], [-79.0, 43.8], [-79.6, 43.6]],
  baikal: [[103.7, 51.7], [104.7, 51.5], [106.0, 52.2], [107.5, 53.0], [108.5, 53.8], [109.5, 54.8], [109.8, 55.7], [109.0, 55.6], [108.0, 54.9], [107.0, 53.7], [105.7, 52.8], [104.5, 52.3]],
  victoria: [[31.8, 0.3], [33.3, 0.4], [34.0, -0.3], [34.0, -1.5], [33.5, -2.4], [32.5, -2.7], [31.7, -2.3], [31.6, -1.0]],
};
for (const pts of Object.values(LAKES)) rawRings.push({ pts: pts.concat([pts[0]]), lake: true });

// ---- simplification on the sphere ---------------------------------------------------------
const D2R = Math.PI / 180;
const toVec = ([lon, lat]) => {
  const cl = Math.cos(lat * D2R);
  return [cl * Math.sin(lon * D2R), Math.sin(lat * D2R), cl * Math.cos(lon * D2R)];
};
// perpendicular distance of p from the chord a->b (all unit vectors, chord in R³)
function chordDist(p, a, b) {
  const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
  const l2 = ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2];
  let t = l2 > 0 ? (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  const dx = ap[0] - ab[0] * t, dy = ap[1] - ab[1] * t, dz = ap[2] - ab[2] * t;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
function douglasPeucker(vecs, tol) {
  const n = vecs.length;
  const keep = new Uint8Array(n);
  keep[0] = 1; keep[n - 1] = 1;
  const stack = [[0, n - 1]];
  while (stack.length) {
    const [i0, i1] = stack.pop();
    let best = -1, bestD = tol;
    for (let i = i0 + 1; i < i1; i++) {
      const d = chordDist(vecs[i], vecs[i0], vecs[i1]);
      if (d > bestD) { bestD = d; best = i; }
    }
    if (best >= 0) { keep[best] = 1; stack.push([i0, best], [best, i1]); }
  }
  return keep;
}
function simplifyAll(tol) {
  const out = [];
  let total = 0;
  for (const r of rawRings) {
    const pts = r.pts;
    if (pts.length < 4) continue;
    const vecs = pts.map(toVec);
    // a closed ring: split at the farthest point from the start so both halves simplify honestly
    let far = 1, farD = -1;
    for (let i = 1; i < vecs.length - 1; i++) {
      const d = chordDist(vecs[i], vecs[0], vecs[0]);
      if (d > farD) { farD = d; far = i; }
    }
    const k1 = douglasPeucker(vecs.slice(0, far + 1), tol);
    const k2 = douglasPeucker(vecs.slice(far), tol);
    const kept = [];
    for (let i = 0; i <= far; i++) if (k1[i]) kept.push(pts[i]);
    for (let i = 1; i < k2.length; i++) if (k2[i]) kept.push(pts[far + i]);
    if (kept.length < 4) continue;                       // an islet that simplified to nothing
    // drop specks: rings whose extent is under the tolerance several times over
    let lo0 = 1e9, lo1 = 1e9, hi0 = -1e9, hi1 = -1e9;
    for (const [x, y] of pts) { if (x < lo0) lo0 = x; if (x > hi0) hi0 = x; if (y < lo1) lo1 = y; if (y > hi1) hi1 = y; }
    const ext = Math.max((hi0 - lo0) * Math.cos(((lo1 + hi1) / 2) * D2R), hi1 - lo1) * D2R;
    if (ext < tol * 6 && !r.lake) continue;
    out.push(kept);
    total += kept.length;
  }
  return { rings: out, total };
}
// bisect the tolerance to land near the target point count
let lo = 0.0005, hi = 0.05, res = null;
for (let it = 0; it < 30; it++) {
  const mid = Math.sqrt(lo * hi);
  res = simplifyAll(mid);
  if (res.total > TARGET_POINTS) lo = mid; else hi = mid;
  if (Math.abs(res.total - TARGET_POINTS) < TARGET_POINTS * 0.04) break;
}

// ---- the land mask: even-odd scanline fill of the unsimplified rings -------------------------
// Antarctica's ring closes across the antimeridian at 84.7° S and leaves the
// pole implicit; for the fill it is closed down the ±180° meridians and along
// the pole instead, so the rows south of it fill as land.
const fillRings = rawRings.map((r) => r.pts);
{
  const i = fillRings.findIndex((pts) => pts.some((q) => q[1] < -80));
  if (i >= 0) {
    const pts = fillRings[i].slice();
    // the ring's last point duplicates its first (-180, -84.7): reroute the
    // closing edge 178 -> -180 through the pole
    pts.pop();
    pts.push([180, pts[pts.length - 1][1]], [180, -90], [-180, -90], pts[0]);
    fillRings[i] = pts;
  }
}
const mask = new Uint8Array(MASK_W * MASK_H);
{
  const xs = [];
  for (let row = 0; row < MASK_H; row++) {
    const lat = -90 + ((row + 0.5) * 180) / MASK_H;
    xs.length = 0;
    for (const pts of fillRings) {
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
        if (y0 === y1) continue;
        if (lat >= Math.min(y0, y1) && lat < Math.max(y0, y1)) {
          let dx = x1 - x0;
          if (Math.abs(dx) > 180) continue; // an edge wrapping the antimeridian (not one after the reroute, but guard)
          xs.push(x0 + ((lat - y0) / (y1 - y0)) * dx);
        }
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const c0 = Math.max(0, Math.round(((xs[k] + 180) / 360) * MASK_W));
      const c1 = Math.min(MASK_W, Math.round(((xs[k + 1] + 180) / 360) * MASK_W));
      for (let c = c0; c < c1; c++) mask[row * MASK_W + c] = 1;
    }
  }
}
// run-length per row: [count, c0, c1, c0, c1, ...], land between each pair
const runs = [];
for (let row = 0; row < MASK_H; row++) {
  const rowRuns = [];
  let inside = false;
  for (let c = 0; c <= MASK_W; c++) {
    const v = c < MASK_W ? mask[row * MASK_W + c] : 0;
    if (v && !inside) { rowRuns.push(c); inside = true; }
    else if (!v && inside) { rowRuns.push(c); inside = false; }
  }
  runs.push(rowRuns.length / 2, ...rowRuns);
}

// ---- emit -----------------------------------------------------------------------------------
const r2 = (v) => Math.round(v * 100) / 100;
const ringText = res.rings.map((ring) => '  [' + ring.map(([x, y]) => `${r2(x)},${r2(y)}`).join(',') + '],').join('\n');
let landCells = 0;
for (let i = 0; i < mask.length; i++) landCells += mask[i];
const header = `// Coastlines and land mask for the Miracle Mile launch map, GENERATED by
// scripts/gen-coast.js; do not edit by hand.
//
// SOURCE: Natural Earth 1:110m land polygons (public domain), as packaged in
// world-atlas ${require('world-atlas/package.json').version} (ISC, Mike Bostock), decoded with
// topojson-client ${require('topojson-client/package.json').version}, simplified on the sphere to ${res.total} points in
// ${res.rings.length} rings; the Great Lakes, Baikal and Victoria traced coarsely by hand
// (the 1:110m land layer has no lakes; the Caspian is its one hole).
//
//   RINGS  flat [lon, lat, lon, lat, ...] in degrees (0.01° rounding), one
//          array per closed ring, the last point NOT repeated.
//   MASK   { w, h, runs }: a ${MASK_W}×${MASK_H} equirectangular land mask, row 0 the
//          south pole, run-length encoded per row as [count, c0, c1, ...]
//          (land on [c0, c1)); ${landCells} land cells of ${MASK_W * MASK_H}.
`;
const body = `${header}
export const COAST_RINGS = [
${ringText}
];

export const LAND_MASK = {
  w: ${MASK_W},
  h: ${MASK_H},
  runs: [${runs.join(',')}],
};
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, body);
console.log(`coast.js: ${res.rings.length} rings, ${res.total} points, mask ${MASK_W}x${MASK_H} (${landCells} land cells, ${runs.length} run numbers), ${(body.length / 1024).toFixed(1)} KB -> ${OUT}`);
