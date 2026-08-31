// Miracle Mile, the launch map: a holographic globe of every ICBM and SLBM
// route "if the unspeakable happened and all were launched", drawn as a
// tactical overlay above the city. A scene-private helper of miraclemile.js
// (docs/SCENE_CONTRACT.md, the sub-directory exception): it exports a factory,
// not a scene, and is never registered.
//
//   import { createLaunchMap } from './miraclemile/launchmap.js';
//   const map = createLaunchMap(THREE, { tier, width, height, renderOrder: 10, fovFraction: 0.55 });
//   scene.add(map.group);
//   map.update(dt, t, io, { camera, hand: io.xy, intensity: io.intensity });  // every frame, AFTER the camera is placed
//   map.show(true | false)     fades the overlay in (grown from a point) / out over ~0.6 s and stops its work when out
//   map.launchAll()            plays the scenario (below); a second call restarts it
//   map.reset()                back to the idle plan: the scars fade, the routes come back faint
//   map.setRotation(yaw, pitch) turns the globe directly (radians: the lon and lat facing the eye);
//                              the hand in `state` does the same, mapped, whenever it moves
//   map.isActive()             shown, or still fading out
//   map.resize(w, h)           the canvas size (the capsules are sized in pixels)
//   map.dispose()              every geometry, material and texture
//   map.totals                 { routes, warheads, nodes } from the table, for a readout
//
//   THE GLOBE   A real unit sphere held at a fixed distance in front of the
//               eye (D = 1 / sin(fovFraction · fov / 2)) so it reads as the
//               pen's orthographic disc (55 % of the frame height by default)
//               wherever the Mile's camera is and however it moves. Dark and
//               translucent (premultiplied over the city: the city behind dims
//               to forty percent), a cool fresnel rim, scanlines flowing up it
//               and a slow sweep (a flow, not a rotation), a graticule every
//               15°, the COASTLINES as polylines and the land as a faint
//               hatched fill, GEOGRAPHY FROM REAL DATA: coast.js is generated
//               by scripts/gen-coast.js from Natural Earth's 1:110m land
//               (public domain) via world-atlas / topojson-client, ~2,570
//               points in 100 rings plus a 1024×512 land mask, imported as a
//               constant (no fetch, no asset; the mask becomes a DataTexture at
//               creation). Nothing rotates by itself: the globe turns only
//               with the hand, X is the yaw (a full turn across the hand), Y
//               the pitch, and holds otherwise.
//   THE DATA    Launch nodes, command nodes and cities from published
//               estimates (the table below, FAS Nuclear Notebook 2025 for the
//               arsenals; the field and base positions are the public ones),
//               labelled "EST" on the overlay. The ROUTES are the obvious
//               reading of those numbers: each arsenal spread over its
//               plausible targets, Russia <-> the US and NATO, China <-> the US
//               and India, the US <-> Russia, China and the DPRK, the UK and
//               France <-> Russia, Israel <-> Iran, India <-> Pakistan and China,
//               Pakistan <-> India, the DPRK <-> the US, Japan and Korea, as
//               ~120 routes { from, to, warheads }. "Data based" means the
//               arsenal sizes and the field locations are real; the targeting
//               is an inference, and nothing here is a plan.
//   THE ROUTES  Great-circle arcs (the real ones go over the Arctic), lifted
//               off the globe on a ballistic profile, 4s(1−s) of an apogee
//               that scales with the arc (0.19 R at 10,000 km, about 1,200
//               km), drawn as Sankey RIBBONS: instanced screen-space
//               capsules, one mesh for every route, width ∝ warheads, the
//               routes from one field fanning out of the node side by side
//               (stacked by bearing at both ends, the pen's nodePadding feel),
//               coloured per launching state from the palette (each arsenal
//               its own ramp coordinate), additive, the far side occluded by
//               the globe (a ray-sphere test per endpoint in the vertex
//               shader). NODES: launch fields as discs sized by warheads,
//               targets as rings, command nodes as ringed dots.
//   ALL LAUNCHED  launchAll() plays the scenario: the map is idle (routes
//               faint, the plan) -> every launch node flashes and BULLETS
//               (bright heads with a short tail) grow from a point at every
//               field at once and travel their arcs, a real ICBM flight is
//               ~30 min, an SLBM 10 to 15, a regional missile under ten; all
//               compressed ×0.8 s per minute so the whole thing is ~25 s and
//               the SLBMs arrive first. MIRV: past 82 % of the arc the bus
//               splits into up to six smaller heads (grown out of the bus)
//               that fan to the target's neighbourhood. ARRIVAL: the target
//               ring flashes white and stays as a glowing SCAR that deepens
//               with every warhead that lands; the ribbon burns warm behind
//               the heads and cools out. A running count, warheads IN FLIGHT
//               (left) and DETONATED (right), in seven-segment glyphs made
//               of capsules (no DOM, no fonts) under the disc, with a bar
//               each. At the end the globe holds the scars and the routes
//               fade; reset() returns to the plan. No sound.
//   LOOK        Cockpit hologram: thin lines, additive, the palette's cool
//               entry (2) for the globe and its lines, the warm end (1 -> 0)
//               for bursts and scars; io.intensity scales everything; the
//               beat pulses the node discs. show(false) fades it out over
//               0.6 s; show(true) grows it from a point. Nothing appears at
//               its size: the overlay, the heads, the MIRV heads and the scars
//               all grow.
//   COST        Five draw calls (sphere, lines, routes, nodes, bullets+HUD),
//               all instanced; the lines and routes are static buffers (the
//               route state is a vec4 uniform per route), the nodes and
//               bullets small per-frame uploads. No per-frame allocation.
//   COLD COMPILE  Every material is visible at creation; the first two
//               update() calls draw everything collapsed to a 2-px patch at
//               zero alpha (uWarm) so the driver's first rasterised use of
//               each program lands off screen, and only then does show(false)
//               hide the group.
//
// PORT, after "Map Sankey Chart: Global Coffee Supply Chain", amCharts
// (https://codepen.io/amcharts/pen/OPRwxBd), which ships as:
//
//     The MIT License (MIT)
//     Copyright (c) 2026 amCharts (https://codepen.io/amcharts/pen/OPRwxBd)
//     Permission is hereby granted, free of charge, to any person obtaining a
//     copy of this software and associated documentation files (the
//     "Software"), to deal in the Software without restriction, including
//     without limitation the rights to use, copy, modify, merge, publish,
//     distribute, sublicense, and/or sell copies of the Software, and to
//     permit persons to whom the Software is furnished to do so, subject to
//     the following conditions: the above copyright notice and this
//     permission notice shall be included in all copies or substantial
//     portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT
//     WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//     THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
//     NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
//     LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
//     OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
//     WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// CHANGES FROM THAT ORIGINAL:
//   * amCharts (MapChart, geoOrthographic, GraticuleSeries, the worldLow
//     polygons, MapSankeySeries, the bullets, the labels) is not used: the
//     globe is a three.js sphere under a GLSL3 material, the graticule and
//     the coastlines are instanced screen-space capsules from a generated
//     constant (Natural Earth 1:110m), the Sankey ribbons are instanced
//     capsules along great-circle arcs with the width and the node stacking
//     computed here, the bullets are capsules with a bright head and a tail,
//     the labels are seven-segment glyphs of capsules. No DOM, no SVG.
//   * The coffee data is replaced by the arsenal table below; the ribbons
//     are lifted off the sphere on a ballistic profile because they are
//     trajectories, not trade.
//   * The pen's auto-rotation (a 120 s rotationX loop until pointer-down) is
//     NOT carried over: the globe turns only with the hand (hard rule 8).
//     The globe/flat-map toggle, the zoom control and the tooltips are
//     dropped; the bullets loop once per launch instead of forever.
//   * Colour is palette-driven; the paper background is the city.
//
// SOURCES for the table: Federation of American Scientists, Nuclear
// Notebook / Status of World Nuclear Forces (2025): US ~1,770 deployed (400
// Minuteman III at three fields, ~970 Trident D5 warheads), Russia ~1,700
// deployed (~1,200 on ~310 ICBMs, ~650 on SLBMs), China ~600 total (~400 on
// ICBMs), France 290, the UK 225 (~120 deployed), India ~180, Pakistan ~170,
// Israel ~90, the DPRK ~50. The positions are the public ones. All of it is
// approximate, rounded, and labelled "EST" on the overlay.

import { COAST_RINGS, LAND_MASK } from './coast.js';

// ---------------------------------------------------------------- the data
// [id, name, lat, lon, side, kind, warheads]  kind: icbm | ssbn | mrbm (regional) | cmd | city
export const NODES = [
  // the United States
  ['malmstrom', 'Malmstrom AFB MT', 47.5, -111.2, 'US', 'icbm', 150],
  ['minot', 'Minot AFB ND', 48.4, -101.3, 'US', 'icbm', 150],
  ['warren', 'F.E. Warren AFB WY', 41.1, -104.9, 'US', 'icbm', 150],
  ['kingsbay', 'Kings Bay GA (SSBN)', 30.8, -81.5, 'US', 'ssbn', 480],
  ['bangor', 'Bangor WA (SSBN)', 47.7, -122.7, 'US', 'ssbn', 490],
  // Russia
  ['kozelsk', 'Kozelsk', 54.0, 35.8, 'RU', 'icbm', 80],
  ['tatishchevo', 'Tatishchevo', 51.7, 45.6, 'RU', 'icbm', 80],
  ['uzhur', 'Uzhur (heavy silos)', 55.3, 89.8, 'RU', 'icbm', 240],
  ['dombarovsky', 'Dombarovsky (heavy silos)', 50.8, 59.5, 'RU', 'icbm', 200],
  ['teykovo', 'Teykovo', 56.9, 40.5, 'RU', 'icbm', 100],
  ['yoshkarola', 'Yoshkar-Ola', 56.6, 47.9, 'RU', 'icbm', 100],
  ['ntagil', 'Nizhny Tagil', 57.9, 60.0, 'RU', 'icbm', 120],
  ['novosibirsk', 'Novosibirsk', 55.0, 82.9, 'RU', 'icbm', 100], // the division and the city
  ['irkutsk', 'Irkutsk', 52.3, 104.3, 'RU', 'icbm', 80],
  ['barnaul', 'Barnaul', 53.3, 83.8, 'RU', 'icbm', 60],
  ['vypolzovo', 'Vypolzovo', 57.9, 33.7, 'RU', 'icbm', 40],
  ['gadzhiyevo', 'Gadzhiyevo (SSBN)', 69.3, 33.3, 'RU', 'ssbn', 350],
  ['vilyuchinsk', 'Vilyuchinsk (SSBN)', 52.9, 158.5, 'RU', 'ssbn', 300],
  // China
  ['yumen', 'Yumen field', 40.3, 96.9, 'CN', 'icbm', 100],
  ['hami', 'Hami field', 42.8, 93.5, 'CN', 'icbm', 100],
  ['ordos', 'Ordos field', 40.0, 107.5, 'CN', 'icbm', 100],
  ['jilantai', 'Jilantai', 39.7, 105.6, 'CN', 'icbm', 60],
  ['df41', 'DF-41 / DF-31 brigades', 34.5, 109.0, 'CN', 'icbm', 80],
  ['yulin', 'Yulin, Hainan (SSBN)', 18.2, 109.6, 'CN', 'ssbn', 70],
  // the others
  ['faslane', 'Faslane (SSBN)', 56.1, -4.8, 'UK', 'ssbn', 120],
  ['ilelongue', 'Ile Longue (SSBN)', 48.3, -4.5, 'FR', 'ssbn', 240],
  ['sdotmicha', 'Sdot Micha', 31.7, 34.9, 'IL', 'mrbm', 90],
  ['india', 'India (central)', 23.0, 79.0, 'IN', 'mrbm', 180],
  ['pakistan', 'Pakistan (central)', 30.0, 70.0, 'PK', 'mrbm', 170],
  ['pyongyang', 'Pyongyang', 39.0, 125.8, 'KP', 'mrbm', 50],
  // command nodes
  ['washington', 'Washington', 38.9, -77.0, 'US', 'cmd', 0],
  ['omaha', 'Omaha / STRATCOM', 41.1, -95.9, 'US', 'cmd', 0],
  ['coloradosprings', 'Colorado Springs', 38.8, -104.8, 'US', 'cmd', 0],
  ['moscow', 'Moscow', 55.8, 37.6, 'RU', 'cmd', 0],
  ['beijing', 'Beijing', 39.9, 116.4, 'CN', 'cmd', 0],
  // the cities
  ['newyork', 'New York', 40.7, -74.0, 'US', 'city', 0],
  ['losangeles', 'Los Angeles', 34.1, -118.2, 'US', 'city', 0],
  ['chicago', 'Chicago', 41.9, -87.6, 'US', 'city', 0],
  ['sanfrancisco', 'San Francisco', 37.8, -122.4, 'US', 'city', 0],
  ['seattle', 'Seattle', 47.6, -122.3, 'US', 'city', 0],
  ['houston', 'Houston', 29.8, -95.4, 'US', 'city', 0],
  ['stpetersburg', 'St Petersburg', 59.9, 30.3, 'RU', 'city', 0],
  ['yekaterinburg', 'Yekaterinburg', 56.8, 60.6, 'RU', 'city', 0],
  ['vladivostok', 'Vladivostok', 43.1, 131.9, 'RU', 'city', 0],
  ['murmansk', 'Murmansk', 69.0, 33.1, 'RU', 'city', 0],
  ['shanghai', 'Shanghai', 31.2, 121.5, 'CN', 'city', 0],
  ['guangzhou', 'Guangzhou', 23.1, 113.3, 'CN', 'city', 0],
  ['chongqing', 'Chongqing', 29.6, 106.6, 'CN', 'city', 0],
  ['london', 'London', 51.5, -0.1, 'UK', 'city', 0],
  ['paris', 'Paris', 48.9, 2.4, 'FR', 'city', 0],
  ['berlin', 'Berlin', 52.5, 13.4, 'DE', 'city', 0],
  ['tokyo', 'Tokyo', 35.7, 139.7, 'JP', 'city', 0],
  ['seoul', 'Seoul', 37.6, 127.0, 'KR', 'city', 0],
  ['delhi', 'Delhi', 28.6, 77.2, 'IN', 'city', 0],
  ['mumbai', 'Mumbai', 19.1, 72.9, 'IN', 'city', 0],
  ['islamabad', 'Islamabad', 33.7, 73.0, 'PK', 'city', 0],
  ['karachi', 'Karachi', 24.9, 67.0, 'PK', 'city', 0],
  ['telaviv', 'Tel Aviv', 32.1, 34.8, 'IL', 'city', 0],
  ['tehran', 'Tehran', 35.7, 51.4, 'IR', 'city', 0],
];

// [from, to, warheads], each arsenal allocated across its plausible targets;
// the sums per launch node equal the node's estimate above.
export const ROUTES = [
  // US ICBM fields -> Russian fields, command, bases; F.E. Warren -> China
  ['malmstrom', 'kozelsk', 25], ['malmstrom', 'tatishchevo', 25], ['malmstrom', 'teykovo', 20], ['malmstrom', 'yoshkarola', 20], ['malmstrom', 'vypolzovo', 20], ['malmstrom', 'moscow', 20], ['malmstrom', 'gadzhiyevo', 20],
  ['minot', 'uzhur', 30], ['minot', 'dombarovsky', 30], ['minot', 'ntagil', 25], ['minot', 'novosibirsk', 25], ['minot', 'barnaul', 20], ['minot', 'irkutsk', 20],
  ['warren', 'yumen', 30], ['warren', 'hami', 30], ['warren', 'ordos', 25], ['warren', 'jilantai', 25], ['warren', 'beijing', 20], ['warren', 'df41', 20],
  // US SSBN: the Atlantic boats at Russia's west, the Pacific boats at its east, China and the DPRK
  ['kingsbay', 'moscow', 80], ['kingsbay', 'stpetersburg', 60], ['kingsbay', 'kozelsk', 50], ['kingsbay', 'tatishchevo', 50], ['kingsbay', 'teykovo', 40], ['kingsbay', 'yoshkarola', 40], ['kingsbay', 'gadzhiyevo', 60], ['kingsbay', 'murmansk', 40], ['kingsbay', 'vypolzovo', 30], ['kingsbay', 'yekaterinburg', 30],
  ['bangor', 'vilyuchinsk', 70], ['bangor', 'vladivostok', 60], ['bangor', 'irkutsk', 50], ['bangor', 'beijing', 50], ['bangor', 'shanghai', 40], ['bangor', 'yulin', 40], ['bangor', 'yumen', 40], ['bangor', 'hami', 40], ['bangor', 'ordos', 30], ['bangor', 'pyongyang', 40], ['bangor', 'df41', 30],
  // Russian ICBM divisions -> US fields, command, cities
  ['kozelsk', 'malmstrom', 40], ['kozelsk', 'washington', 40],
  ['tatishchevo', 'minot', 40], ['tatishchevo', 'omaha', 40],
  ['uzhur', 'malmstrom', 60], ['uzhur', 'minot', 60], ['uzhur', 'warren', 60], ['uzhur', 'coloradosprings', 30], ['uzhur', 'omaha', 30],
  ['dombarovsky', 'warren', 60], ['dombarovsky', 'washington', 50], ['dombarovsky', 'chicago', 50], ['dombarovsky', 'houston', 40],
  ['teykovo', 'newyork', 50], ['teykovo', 'kingsbay', 50],
  ['yoshkarola', 'bangor', 50], ['yoshkarola', 'seattle', 50],
  ['ntagil', 'losangeles', 50], ['ntagil', 'sanfrancisco', 40], ['ntagil', 'coloradosprings', 30],
  ['novosibirsk', 'chicago', 50], ['novosibirsk', 'houston', 50],
  ['irkutsk', 'seattle', 40], ['irkutsk', 'bangor', 40],
  ['barnaul', 'sanfrancisco', 30], ['barnaul', 'losangeles', 30],
  ['vypolzovo', 'newyork', 40],
  // Russian SSBN: the Northern Fleet at Europe and the US east coast, the Pacific Fleet at the west coast and Japan
  ['gadzhiyevo', 'london', 70], ['gadzhiyevo', 'paris', 60], ['gadzhiyevo', 'berlin', 40], ['gadzhiyevo', 'faslane', 50], ['gadzhiyevo', 'ilelongue', 50], ['gadzhiyevo', 'washington', 40], ['gadzhiyevo', 'newyork', 40],
  ['vilyuchinsk', 'losangeles', 60], ['vilyuchinsk', 'sanfrancisco', 60], ['vilyuchinsk', 'seattle', 50], ['vilyuchinsk', 'bangor', 50], ['vilyuchinsk', 'tokyo', 40], ['vilyuchinsk', 'houston', 40],
  // China -> the US and India
  ['yumen', 'washington', 30], ['yumen', 'newyork', 30], ['yumen', 'losangeles', 20], ['yumen', 'malmstrom', 20],
  ['hami', 'minot', 30], ['hami', 'warren', 30], ['hami', 'seattle', 20], ['hami', 'chicago', 20],
  ['ordos', 'sanfrancisco', 30], ['ordos', 'losangeles', 30], ['ordos', 'omaha', 20], ['ordos', 'coloradosprings', 20],
  ['jilantai', 'delhi', 30], ['jilantai', 'mumbai', 30],
  ['df41', 'washington', 20], ['df41', 'houston', 20], ['df41', 'delhi', 20], ['df41', 'omaha', 20],
  ['yulin', 'losangeles', 20], ['yulin', 'seattle', 20], ['yulin', 'delhi', 15], ['yulin', 'mumbai', 15],
  // the UK and France -> Russia
  ['faslane', 'moscow', 50], ['faslane', 'stpetersburg', 30], ['faslane', 'kozelsk', 20], ['faslane', 'murmansk', 20],
  ['ilelongue', 'moscow', 80], ['ilelongue', 'stpetersburg', 50], ['ilelongue', 'yekaterinburg', 40], ['ilelongue', 'novosibirsk', 30], ['ilelongue', 'kozelsk', 40],
  // the regional exchanges
  ['sdotmicha', 'tehran', 90],
  ['india', 'islamabad', 50], ['india', 'karachi', 50], ['india', 'beijing', 30], ['india', 'chongqing', 30], ['india', 'guangzhou', 20],
  ['pakistan', 'delhi', 90], ['pakistan', 'mumbai', 80],
  ['pyongyang', 'seoul', 15], ['pyongyang', 'tokyo', 15], ['pyongyang', 'seattle', 10], ['pyongyang', 'washington', 10],
];

// each arsenal its own ramp coordinate on the five-stop palette (0 hot core ... 4 ash)
const SIDE_TINT = { US: 2.0, UK: 2.35, FR: 2.7, CN: 3.0, IN: 3.4, PK: 3.8, RU: 1.0, IL: 0.55, KP: 1.5 };

// ---------------------------------------------------------------- constants
const MAX_ROUTES = 128;
const SEG = 32;               // capsules along a route
const MIRV_MAX = 6;           // heads a bus splits into (at most)
const BULLETS_PER_ROUTE = 1 + MIRV_MAX;
const SPLIT_S = 0.82;         // where the bus deploys
const SEC_PER_MIN = 0.8;      // the time compression: a 30-minute ICBM flight in 24 s
const HUD_DIGITS = 4;
const HUD_CAPS = 3 * 7 + 2 * HUD_DIGITS * 7 + 2;   // "EST", two counters, two bars
const HUD_Z = 0.0;            // the HUD sits on the plane through the globe's centre, outside the disc
const PX_R = 300;             // nominal pixels of globe radius at 1080p, for the Sankey stacking
const GRAT_STEP = 15;
const D2R = Math.PI / 180;
const EARTH_KM = 6371;

// seven-segment glyphs: bit 0..6 = a b c d e f g (top, top-right, bottom-right, bottom, bottom-left, top-left, middle)
const SEG7 = [0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07, 0x7f, 0x6f];
const SEG7_E = 0x79, SEG7_S = 0x6d, SEG7_T = 0x78;

// ---------------------------------------------------------------- shaders
const GLSL_COMMON = /* glsl */ `
  #define PI 3.14159265359
  #define TAU 6.28318530718
  vec3 ramp(vec3 p0, vec3 p1, vec3 p2, vec3 p3, vec3 p4, float t) {
    t = clamp(t, 0.0, 5.0);
    if (t < 1.0) return mix(p0, p1, t);
    if (t < 2.0) return mix(p1, p2, t - 1.0);
    if (t < 3.0) return mix(p2, p3, t - 2.0);
    if (t < 4.0) return mix(p3, p4, t - 3.0);
    return mix(p4, vec3(1.0), t - 4.0);
  }
  // Is the point p (globe-local, unit sphere at the origin) hidden behind the
  // globe from the eye at uEyeL? The ray eye -> p is tested against the
  // sphere: hidden when it enters the sphere before reaching p, softened over
  // the last half-percent of the miss distance (about a pixel at the limb).
  // Points on the front surface sit exactly at the entry and stay visible;
  // lifted arcs stay visible past the limb as far as they clear it.
  float visAt(vec3 p, vec3 eye) {
    vec3 d = p - eye;
    float L = length(d);
    vec3 dn = d / max(L, 1e-6);
    float b = dot(eye, dn);
    float rho2 = max(dot(eye, eye) - b * b, 0.0);
    float tEnter = -b - sqrt(max(1.0 - rho2, 0.0));
    float beyond = step(0.01, L - tEnter);
    return 1.0 - beyond * (1.0 - smoothstep(0.99, 1.0, sqrt(rho2)));
  }
`;

const SPHERE_VERT = /* glsl */ `
  uniform float uWarm;
  out vec3 vL;
  void main() {
    vL = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * (1.0 - uWarm * 0.999), 1.0);
  }
`;
const SPHERE_FRAG = /* glsl */ `
  ${GLSL_COMMON}
  uniform vec3 uPal0, uPal1, uPal2, uPal3, uPal4;
  uniform float uIntensity, uAlpha, uTime, uWarm;
  uniform vec3 uEyeL;
  uniform sampler2D uLand;
  in vec3 vL;
  out vec4 fragColor;
  void main() {
    vec3 n = normalize(vL);
    vec3 V = normalize(uEyeL - vL);
    float ndv = max(dot(n, V), 0.0);
    float fres = pow(1.0 - ndv, 3.0);
    float lon = atan(n.x, n.z);
    float lat = asin(clamp(n.y, -1.0, 1.0));
    float land = texture(uLand, vec2(lon / TAU + 0.5, lat / PI + 0.5)).r;
    // a screen-space hatch for the land: the tactical-display fill, never aliasing with the turn
    float hatch = smoothstep(0.6, 0.85, fract((gl_FragCoord.x + gl_FragCoord.y) * 0.1));
    // scanlines flowing up the sphere, and a broad sweep every twelve seconds, flows, not rotation
    float scan = smoothstep(0.86, 1.0, sin(vL.y * 110.0 - uTime * 2.4));
    float sweepY = fract(uTime / 12.0) * 2.8 - 1.4;
    float sweep = exp(-(vL.y - sweepY) * (vL.y - sweepY) * 90.0);
    vec3 cool = uPal2;
    vec3 rim = mix(uPal2, uPal3, 0.35);
    vec3 col = cool * (0.03 + scan * 0.04 + sweep * 0.045) + rim * fres * 0.34 + cool * land * (0.085 + hatch * 0.06) * (0.7 + 0.3 * ndv);
    float a = 0.62 * (0.82 + 0.18 * fres);
    float k = uAlpha * (1.0 - uWarm);
    fragColor = vec4(col * uIntensity * k, a * k);
  }
`;

// screen-space capsules: the lines, the routes, the bullets and the HUD glyphs
const CAP_VERT = /* glsl */ `
  ${GLSL_COMMON}
  uniform vec2 uRes;
  uniform vec3 uEyeL;
  uniform float uWarm;
  in vec2 aQuad;
  in vec3 aP0;
  in vec3 aP1;
  in vec4 aS;     // radius px (at 1080p), alpha, tint, mode (0 line, 1 ribbon, 2 bullet, 3 hud)
  #ifdef ROUTES
  in vec2 aRt;    // route index, s at the segment's middle
  uniform vec4 uRoute[MAX_ROUTES];   // head s (-1 idle), burn scale, presence, 0
  uniform float uPlan;
  out float vBurn;
  #endif
  out vec2 vQ;
  out float vLenR, vA, vTint, vMode;
  vec2 toScreen(vec3 p, out float w) {
    vec4 c = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    w = c.w;
    return c.xy / max(c.w, 0.001) * vec2(uRes.x / uRes.y, 1.0) * 0.5;
  }
  void main() {
    float alpha = aS.y;
    float mode = aS.w;
    #ifdef ROUTES
    vec4 R = uRoute[int(aRt.x + 0.5)];
    float s = aRt.y;
    float behind = step(s, R.x);
    float burn = behind * exp(-(R.x - s) * 7.0) * R.y;
    alpha *= (uPlan * mix(0.15, 0.035, behind) + burn * 1.9) * R.z;
    vBurn = burn;
    #endif
    alpha *= min(visAt(aP0, uEyeL), visAt(aP1, uEyeL));
    float w0, w1;
    vec2 s0 = toScreen(aP0, w0);
    vec2 s1 = toScreen(aP1, w1);
    float vis = step(0.1, w0) * step(0.1, w1) * step(0.001, alpha);
    float aspect = uRes.x / uRes.y;
    vec2 d = s1 - s0;
    float len = length(d);
    vec2 dir = len > 1e-5 ? d / len : vec2(1.0, 0.0);
    vec2 nrm = vec2(-dir.y, dir.x);
    float rad = max(aS.x * uRes.y / 1080.0, 0.75) / uRes.y;
    float cap = step(1.5, mode) * (1.0 - step(2.5, mode));   // round caps on the bullets only
    vLenR = len / rad;
    vec2 pos = mix(s0 - dir * rad * cap, s1 + dir * rad * cap, aQuad.y) + nrm * aQuad.x * rad;
    pos *= 1.0 - uWarm * 0.999;   // the warm frames: everything collapsed to a patch at the centre, at zero alpha
    gl_Position = vec4(pos / vec2(aspect, 1.0) * 2.0 * vis, vis > 0.5 ? 0.0 : 2.0, 1.0);
    vQ = vec2(aQuad.x, aQuad.y * (vLenR + 2.0 * cap) - cap);
    vA = alpha * (1.0 - uWarm);
    vTint = aS.z;
    vMode = mode;
  }
`;
const CAP_FRAG = /* glsl */ `
  ${GLSL_COMMON}
  uniform vec3 uPal0, uPal1, uPal2, uPal3, uPal4;
  uniform float uIntensity;
  in vec2 vQ;
  in float vLenR, vA, vTint, vMode;
  #ifdef ROUTES
  in float vBurn;
  #endif
  out vec4 fragColor;
  void main() {
    float u = clamp(vQ.y, 0.0, vLenR);
    float dx = vQ.y - u;
    float d2 = dx * dx + vQ.x * vQ.x;
    if (d2 > 1.0) discard;
    vec3 col = ramp(uPal0, uPal1, uPal2, uPal3, uPal4, vTint);
    float prof;
    if (vMode < 0.5) prof = exp(-d2 * 3.0) * (1.0 - d2 * 0.2);                 // a thin line
    else if (vMode < 1.5) prof = 1.0 - smoothstep(0.4, 1.0, vQ.x * vQ.x);        // a ribbon: flat, soft-edged
    else if (vMode < 2.5) {                                                      // a bullet: the head at P1, the tail back to P0
      float along = vLenR > 1e-3 ? clamp(vQ.y / vLenR, 0.0, 1.0) : 1.0;
      vec2 dh = vec2(vQ.x, vQ.y - vLenR);
      float head = exp(-dot(dh, dh) * 2.4);
      prof = exp(-d2 * 2.5) * along * along * 0.75 + head * 1.4;
      col = mix(col, vec3(1.0), head * 0.65);
    } else prof = 0.95 * (1.0 - smoothstep(0.55, 1.0, vQ.x * vQ.x));            // a glyph stroke
    #ifdef ROUTES
    col = mix(col, mix(uPal1, uPal0, 0.45), clamp(vBurn * 1.6, 0.0, 1.0));      // the burn behind the head is the warm end
    #endif
    fragColor = vec4(col * prof * vA * uIntensity, 1.0);
  }
`;

// the nodes: camera-facing quads at a surface point; a disc, a ring or a ringed dot, and the scar
const NODE_VERT = /* glsl */ `
  ${GLSL_COMMON}
  uniform vec3 uEyeL;
  uniform float uWarm;
  in vec2 aQuad;
  in vec3 aPos;
  in vec4 aS;     // size (local units), alpha, tint, kind (0 disc, 1 ring, 2 ringed dot)
  in vec4 aF;     // flash, scar, launch glow, 0
  out vec2 vQ;
  out vec4 vS, vF;
  void main() {
    float sc = length(modelViewMatrix[0].xyz);
    vec4 mv = modelViewMatrix * vec4(aPos, 1.0);
    float alpha = aS.y * visAt(aPos, uEyeL);
    float vis = step(0.001, alpha);
    mv.xy += aQuad * aS.x * sc * (1.0 - uWarm * 0.999);
    vec4 clip = projectionMatrix * mv;
    gl_Position = vis > 0.5 ? clip : vec4(0.0, 0.0, 2.0, 1.0);
    vQ = aQuad;
    vS = vec4(aS.x, alpha * (1.0 - uWarm), aS.z, aS.w);
    vF = aF;
  }
`;
const NODE_FRAG = /* glsl */ `
  ${GLSL_COMMON}
  uniform vec3 uPal0, uPal1, uPal2, uPal3, uPal4;
  uniform float uIntensity;
  in vec2 vQ;
  in vec4 vS, vF;
  out vec4 fragColor;
  void main() {
    float r2 = dot(vQ, vQ);
    if (r2 > 1.0) discard;
    float r = sqrt(r2);
    float disc = 1.0 - smoothstep(0.42, 0.62, r);
    float ring = 1.0 - smoothstep(0.07, 0.15, abs(r - 0.62));
    float dot_ = 1.0 - smoothstep(0.12, 0.24, r);
    float halo = exp(-r2 * 3.2);
    float kind = vS.w;
    float shape = kind < 0.5 ? disc * 0.95 + halo * 0.35 : (kind < 1.5 ? ring * 0.9 + halo * 0.12 : ring * 0.8 + dot_ * 0.9 + halo * 0.15);
    vec3 col = ramp(uPal0, uPal1, uPal2, uPal3, uPal4, vS.z) * shape;
    // the launch glow: the field lit warm as its missiles leave
    col += mix(uPal1, uPal0, 0.5) * halo * vF.z * 1.2;
    // the scar: a warm glow that deepens with every warhead landed, a hot core, held
    float scar = vF.y;
    vec3 warm = mix(uPal1, uPal0, 0.4);
    col += warm * (exp(-r2 * 2.4) * 0.8 + (1.0 - smoothstep(0.15, 0.35, r)) * 0.6) * scar;
    // the arrival flash: white, wide, fast
    col += vec3(1.0) * vF.x * exp(-r2 * 1.8) * 1.0;
    fragColor = vec4(col * vS.y * uIntensity, 1.0);
  }
`;

// ---------------------------------------------------------------- the factory
export function createLaunchMap(THREE, opts = {}) {
  const tier = opts.tier || 'med';
  const RO = opts.renderOrder != null ? opts.renderOrder : 10;
  let fovFraction = opts.fovFraction || 0.55;   // the disc's share of the frame height; live through map.fovFraction
  const SPHERE_SEGS = tier === 'low' ? 40 : tier === 'high' ? 96 : 64;

  const group = new THREE.Group();       // camera-aligned frame at distance D, scaled by the grow
  group.name = 'launchmap';
  const globe = new THREE.Group();       // the hand's rotation
  group.add(globe);

  const pal5 = () => Array.from({ length: 5 }, () => ({ value: new THREE.Color(1, 1, 1) }));
  const palUniforms = (p) => ({ uPal0: p[0], uPal1: p[1], uPal2: p[2], uPal3: p[3], uPal4: p[4] });
  const pals = [];
  const shared = () => {
    const p = pal5();
    pals.push(p);
    return palUniforms(p);
  };
  const eyeL = new THREE.Vector3(0, 0, 4);

  // ---- lat/lon -> unit vector: lon 0 at +Z, east toward +X, north +Y (Europe right of the Americas from outside)
  const ll = (lat, lon, out) => {
    const cl = Math.cos(lat * D2R);
    out.x = cl * Math.sin(lon * D2R);
    out.y = Math.sin(lat * D2R);
    out.z = cl * Math.cos(lon * D2R);
    return out;
  };
  const v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3();

  // ---- the land mask -> a DataTexture
  const landTex = (() => {
    const { w, h, runs } = LAND_MASK;
    const data = new Uint8Array(w * h);
    let i = 0;
    for (let r = 0; r < h; r++) {
      const n = runs[i++];
      for (let k = 0; k < n; k++) {
        const c0 = runs[i++], c1 = runs[i++];
        data.fill(255, r * w + c0, r * w + c1);
      }
    }
    const tex = new THREE.DataTexture(data, w, h, THREE.RedFormat, THREE.UnsignedByteType);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
  })();

  // ---- the sphere
  const SU = {
    uIntensity: { value: 1 }, uAlpha: { value: 1 }, uTime: { value: 0 }, uWarm: { value: 1 },
    uEyeL: { value: eyeL }, uLand: { value: landTex }, ...shared(),
  };
  const sphereMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, uniforms: SU, vertexShader: SPHERE_VERT, fragmentShader: SPHERE_FRAG,
    transparent: true, depthTest: false, depthWrite: false, side: THREE.FrontSide,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
  });
  sphereMat.name = 'launchmap-sphere';
  const sphereGeo = new THREE.SphereGeometry(1, SPHERE_SEGS, Math.round(SPHERE_SEGS * 0.625));
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.frustumCulled = false;
  sphere.renderOrder = RO;
  globe.add(sphere);

  // ---- one quad geometry for every instanced system
  const quadPos = new Float32Array([-1, 0, 0, 1, 0, 0, -1, 1, 0, 1, 1, 0]);
  const quadUV = new Float32Array([-1, 0, 1, 0, -1, 1, 1, 1]);
  const sphUV = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  function instancedQuad(uvs) {
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(quadPos, 3));
    g.setAttribute('aQuad', new THREE.BufferAttribute(uvs, 2));
    g.setIndex([0, 1, 2, 2, 1, 3]);
    return g;
  }
  const attr = (arr, n, dynamic) => {
    const a = new THREE.InstancedBufferAttribute(arr, n);
    if (dynamic) a.setUsage(THREE.DynamicDrawUsage);
    return a;
  };
  const uRes = { value: new THREE.Vector2(opts.width || 1920, opts.height || 1080) };
  function capsuleSystem(n, order, routes, dynamic) {
    const geo = instancedQuad(quadUV);
    const p0 = new Float32Array(n * 3), p1 = new Float32Array(n * 3), s = new Float32Array(n * 4);
    const aP0 = attr(p0, 3, dynamic), aP1 = attr(p1, 3, dynamic), aS = attr(s, 4, dynamic);
    geo.setAttribute('aP0', aP0);
    geo.setAttribute('aP1', aP1);
    geo.setAttribute('aS', aS);
    let rt = null, aRt = null;
    if (routes) {
      rt = new Float32Array(n * 2);
      aRt = attr(rt, 2, false);
      geo.setAttribute('aRt', aRt);
    }
    geo.instanceCount = n;
    const U = { uRes, uEyeL: { value: eyeL }, uWarm: { value: 1 }, uIntensity: { value: 1 }, ...shared() };
    if (routes) {
      U.uRoute = { value: new Float32Array(MAX_ROUTES * 4) };
      U.uPlan = { value: 1 };
    }
    const mat = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3, uniforms: U, vertexShader: CAP_VERT, fragmentShader: CAP_FRAG,
      defines: routes ? { ROUTES: 1, MAX_ROUTES } : {},
      transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    });
    mat.name = routes ? 'launchmap-routes' : dynamic ? 'launchmap-bullets' : 'launchmap-lines';
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = order;
    globe.add(mesh);
    return { geo, mat, mesh, p0, p1, s, rt, aP0, aP1, aS, aRt, U };
  }
  const capSet = (sys, i, x0, y0, z0, x1, y1, z1, rad, alpha, tint, mode) => {
    const o = i * 3, q = i * 4;
    sys.p0[o] = x0; sys.p0[o + 1] = y0; sys.p0[o + 2] = z0;
    sys.p1[o] = x1; sys.p1[o + 1] = y1; sys.p1[o + 2] = z1;
    sys.s[q] = rad; sys.s[q + 1] = alpha; sys.s[q + 2] = tint; sys.s[q + 3] = mode;
  };

  // ---- the lines: graticule + coastlines, static
  let nLines = 0;
  for (let lat = -90 + GRAT_STEP; lat < 90; lat += GRAT_STEP) nLines += 48;
  nLines += (360 / GRAT_STEP) * 24;
  for (const ring of COAST_RINGS) nLines += ring.length / 2;
  const lines = capsuleSystem(nLines, RO + 1, false, false);
  {
    let i = 0;
    const GRAT_T = 2.0, GRAT_A = 0.16, COAST_T = 2.1, COAST_A = 0.55;
    for (let lat = -90 + GRAT_STEP; lat < 90; lat += GRAT_STEP) {
      for (let k = 0; k < 48; k++) {
        ll(lat, (k / 48) * 360 - 180, v0);
        ll(lat, ((k + 1) / 48) * 360 - 180, v1);
        capSet(lines, i++, v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, 0.9, GRAT_A * (lat === 0 ? 1.5 : 1), GRAT_T, 0);
      }
    }
    for (let m = 0; m < 360 / GRAT_STEP; m++) {
      const lon = m * GRAT_STEP - 180;
      for (let k = 0; k < 24; k++) {
        ll((k / 24) * 180 - 90, lon, v0);
        ll(((k + 1) / 24) * 180 - 90, lon, v1);
        capSet(lines, i++, v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, 0.9, GRAT_A * (lon === 0 ? 1.5 : 1), GRAT_T, 0);
      }
    }
    for (const ring of COAST_RINGS) {
      const n = ring.length / 2;
      for (let k = 0; k < n; k++) {
        const k2 = (k + 1) % n;
        ll(ring[k * 2 + 1], ring[k * 2], v0);
        ll(ring[k2 * 2 + 1], ring[k2 * 2], v1);
        capSet(lines, i++, v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, 1.3, COAST_A, COAST_T, 0);
      }
    }
  }

  // ---- the nodes
  const nodeIdx = new Map();
  const nodePos = new Float32Array(NODES.length * 3);
  NODES.forEach((n, i) => {
    nodeIdx.set(n[0], i);
    ll(n[2], n[3], v0);
    nodePos[i * 3] = v0.x; nodePos[i * 3 + 1] = v0.y; nodePos[i * 3 + 2] = v0.z;
  });
  const nodeWar = new Float32Array(NODES.length);   // warheads launched from each node (the table's estimate)
  NODES.forEach((n, i) => { nodeWar[i] = n[6]; });
  const nodeScar = new Float32Array(NODES.length);  // warheads landed on each node
  const nodeFlashT = new Float32Array(NODES.length).fill(-1);
  let totalWar = 0;
  for (const r of ROUTES) totalWar += r[2];

  // ---- the routes: great-circle arcs with a ballistic lift and the Sankey stacking at both ends
  const nRoutes = Math.min(ROUTES.length, MAX_ROUTES);
  const rFrom = new Int32Array(nRoutes), rTo = new Int32Array(nRoutes), rWar = new Float32Array(nRoutes);
  const rTint = new Float32Array(nRoutes), rWidth = new Float32Array(nRoutes), rFlight = new Float32Array(nRoutes);
  const rMirv = new Uint8Array(nRoutes), rSlbm = new Uint8Array(nRoutes);
  const rArrived = new Uint8Array(nRoutes), rArrT = new Float32Array(nRoutes);
  const arcPts = new Float32Array(nRoutes * (SEG + 1) * 3);
  const rOff0 = new Float32Array(nRoutes), rOff1 = new Float32Array(nRoutes);
  {
    // widths from the warheads, the pen's maxWidth feel: 2 px for a handful, 8 px for a boat's whole load
    for (let r = 0; r < nRoutes; r++) {
      const [from, to, w] = ROUTES[r];
      rFrom[r] = nodeIdx.get(from);
      rTo[r] = nodeIdx.get(to);
      if (rFrom[r] == null || rTo[r] == null) throw new Error(`launchmap: unknown node in route ${from} -> ${to}`);
      rWar[r] = w;
      rWidth[r] = 1.0 + 5.5 * Math.sqrt(w / 480);
      rTint[r] = SIDE_TINT[NODES[rFrom[r]][4]] ?? 2.0;
      const kind = NODES[rFrom[r]][5];
      rSlbm[r] = kind === 'ssbn' ? 1 : 0;
      v0.fromArray(nodePos, rFrom[r] * 3);
      v1.fromArray(nodePos, rTo[r] * 3);
      const km = Math.acos(Math.min(1, Math.max(-1, v0.dot(v1)))) * EARTH_KM;
      const minutes = kind === 'ssbn' ? 11 + 4 * (km / 8000) : kind === 'mrbm' ? 5.5 + 9 * (km / 4000) : Math.min(32, 8 + 22 * (km / 10000));
      rFlight[r] = minutes * SEC_PER_MIN;
      rMirv[r] = w <= 3 ? w : Math.max(3, Math.min(MIRV_MAX, 2 + Math.floor(Math.log2(w / 3))));
    }
    // the stacking: at every node the routes through it, sorted by the bearing
    // they leave along, sit side by side with a little padding, out of the
    // source along each route's right, into the target along its left
    const bearingAt = (node, other) => {
      // bearing from node toward other, clockwise from north, as seen from outside
      v0.fromArray(nodePos, node * 3);             // up
      v1.fromArray(nodePos, other * 3);
      const nd = v0.y;                             // north at the node: the pole projected onto the tangent plane
      v3.set(-v0.x * nd, 1 - v0.y * nd, -v0.z * nd).normalize();
      v2.crossVectors(v3, v0).normalize();         // east = north × up (at 0° N 0° E: Y × Z = +X)
      v1.addScaledVector(v0, -v0.dot(v1));         // the direction to the other, in the tangent plane
      return Math.atan2(v1.dot(v2), v1.dot(v3));
    };
    const byNode = new Array(NODES.length).fill(null).map(() => []);
    for (let r = 0; r < nRoutes; r++) {
      byNode[rFrom[r]].push({ r, end: 0, b: bearingAt(rFrom[r], rTo[r]) });
      byNode[rTo[r]].push({ r, end: 1, b: bearingAt(rTo[r], rFrom[r]) });
    }
    const PAD = 1.5;
    for (const list of byNode) {
      if (list.length < 2) continue;
      list.sort((a, b) => a.b - b.b);
      let total = 0;
      for (const e of list) total += rWidth[e.r] + PAD;
      let cum = 0;
      for (const e of list) {
        const o = (cum + (rWidth[e.r] + PAD) / 2 - total / 2) / PX_R;
        if (e.end === 0) rOff0[e.r] = o; else rOff1[e.r] = -o;
        cum += rWidth[e.r] + PAD;
      }
    }
    // the arc samples
    const A = new THREE.Vector3(), B = new THREE.Vector3(), right = new THREE.Vector3(), T = new THREE.Vector3();
    for (let r = 0; r < nRoutes; r++) {
      A.fromArray(nodePos, rFrom[r] * 3);
      B.fromArray(nodePos, rTo[r] * 3);
      const cosw = Math.min(1, Math.max(-1, A.dot(B)));
      const w = Math.acos(cosw);
      const sinw = Math.sin(w);
      // the tangent at A along the arc, and the right-hand direction (constant along a great circle)
      T.copy(B).addScaledVector(A, -cosw).normalize();
      right.crossVectors(T, A).normalize();
      // apogee: 0.19 R at 10,000 km, less for shorter flights, a little more for longer
      const H = Math.min(0.24, Math.max(0.035, 0.19 * Math.pow(w / 1.5696, 0.85)));
      for (let k = 0; k <= SEG; k++) {
        const s = k / SEG;
        const u = s * s * (3 - 2 * s);
        const off = rOff0[r] * (1 - u) + rOff1[r] * u;
        if (sinw > 1e-5) v0.copy(A).multiplyScalar(Math.sin((1 - s) * w) / sinw).addScaledVector(B, Math.sin(s * w) / sinw);
        else v0.copy(A);
        v0.addScaledVector(right, off).normalize().multiplyScalar(1 + H * 4 * s * (1 - s));
        v0.toArray(arcPts, (r * (SEG + 1) + k) * 3);
      }
    }
  }
  const routes = capsuleSystem(MAX_ROUTES * SEG, RO + 2, true, false);
  {
    for (let r = 0; r < nRoutes; r++) {
      for (let k = 0; k < SEG; k++) {
        const i = r * SEG + k;
        const o0 = (r * (SEG + 1) + k) * 3, o1 = o0 + 3;
        capSet(routes, i, arcPts[o0], arcPts[o0 + 1], arcPts[o0 + 2], arcPts[o1], arcPts[o1 + 1], arcPts[o1 + 2], rWidth[r] * 0.5, 1.0, rTint[r], 1);
        routes.rt[i * 2] = r;
        routes.rt[i * 2 + 1] = (k + 0.5) / SEG;
      }
    }
    for (let r = 0; r < nRoutes; r++) { routes.U.uRoute.value[r * 4] = -1; routes.U.uRoute.value[r * 4 + 1] = 1; routes.U.uRoute.value[r * 4 + 2] = 1; }
  }
  // a point on the arc, written to dst at off (lerp between the samples)
  const arcAt = (r, s, dst, off) => {
    s = s < 0 ? 0 : s > 1 ? 1 : s;
    const f = s * SEG;
    let k = Math.floor(f);
    if (k >= SEG) k = SEG - 1;
    const u = f - k;
    const o0 = (r * (SEG + 1) + k) * 3, o1 = o0 + 3;
    dst[off] = arcPts[o0] + (arcPts[o1] - arcPts[o0]) * u;
    dst[off + 1] = arcPts[o0 + 1] + (arcPts[o1 + 1] - arcPts[o0 + 1]) * u;
    dst[off + 2] = arcPts[o0 + 2] + (arcPts[o1 + 2] - arcPts[o0 + 2]) * u;
  };
  // the MIRV spread at every target: a tangent-plane basis, and a fixed fan per route
  const tgtE1 = new Float32Array(NODES.length * 3), tgtE2 = new Float32Array(NODES.length * 3);
  for (let i = 0; i < NODES.length; i++) {
    v0.fromArray(nodePos, i * 3);
    v1.set(0, 1, 0);
    v2.crossVectors(v1, v0).normalize();
    if (v2.lengthSq() < 1e-6) v2.set(1, 0, 0);
    v3.crossVectors(v0, v2).normalize();
    v2.toArray(tgtE1, i * 3);
    v3.toArray(tgtE2, i * 3);
  }
  const h1 = (n) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };

  // ---- the nodes mesh
  const nodes = (() => {
    const n = NODES.length;
    const geo = instancedQuad(sphUV);
    const pos = new Float32Array(n * 3);
    pos.set(nodePos);
    const s = new Float32Array(n * 4), f = new Float32Array(n * 4);
    const aPos = attr(pos, 3, false), aS = attr(s, 4, true), aF = attr(f, 4, true);
    geo.setAttribute('aPos', aPos);
    geo.setAttribute('aS', aS);
    geo.setAttribute('aF', aF);
    geo.instanceCount = n;
    const U = { uEyeL: { value: eyeL }, uWarm: { value: 1 }, uIntensity: { value: 1 }, ...shared() };
    const mat = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3, uniforms: U, vertexShader: NODE_VERT, fragmentShader: NODE_FRAG,
      transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    });
    mat.name = 'launchmap-nodes';
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = RO + 3;
    globe.add(mesh);
    return { geo, mat, mesh, s, f, aS, aF, U };
  })();

  // ---- the bullets and the HUD glyphs
  const N_BULLETS = nRoutes * BULLETS_PER_ROUTE;
  const HUD0 = N_BULLETS;
  const bullets = capsuleSystem(N_BULLETS + HUD_CAPS, RO + 4, false, true);
  for (let i = 0; i < N_BULLETS + HUD_CAPS; i++) bullets.s[i * 4 + 1] = 0;
  const qInv = new THREE.Quaternion();
  const hudCap = (i, x0, y0, x1, y1, rad, alpha, tint) => {
    v0.set(x0, y0, HUD_Z).applyQuaternion(qInv);
    v1.set(x1, y1, HUD_Z).applyQuaternion(qInv);
    capSet(bullets, i, v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, rad, alpha, tint, 3);
  };
  // a seven-segment glyph at (x, y) bottom-left, w wide, h tall; returns the next capsule index
  const glyph = (i, mask, x, y, w, h, rad, alpha, tint) => {
    const m = h / 2;
    hudCap(i + 0, x, y + h, x + w, y + h, rad, mask & 1 ? alpha : 0, tint);           // a
    hudCap(i + 1, x + w, y + h, x + w, y + m, rad, mask & 2 ? alpha : 0, tint);       // b
    hudCap(i + 2, x + w, y + m, x + w, y, rad, mask & 4 ? alpha : 0, tint);           // c
    hudCap(i + 3, x, y, x + w, y, rad, mask & 8 ? alpha : 0, tint);                   // d
    hudCap(i + 4, x, y + m, x, y, rad, mask & 16 ? alpha : 0, tint);                  // e
    hudCap(i + 5, x, y + h, x, y + m, rad, mask & 32 ? alpha : 0, tint);              // f
    hudCap(i + 6, x, y + m, x + w, y + m, rad, mask & 64 ? alpha : 0, tint);          // g
    return i + 7;
  };
  const counter = (i, value, x, y, w, h, gap, rad, alpha, tint) => {
    let v = Math.max(0, Math.round(value));
    for (let d = HUD_DIGITS - 1; d >= 0; d--) {
      const digit = v % 10;
      const shown = d === HUD_DIGITS - 1 || v > 0;
      i = glyph(i, SEG7[digit], x + d * (w + gap), y, w, h, rad, shown ? alpha : 0, tint);
      v = Math.floor(v / 10);
    }
    return i;
  };

  // ---- state
  let shownTarget = false;
  let showS = 0;
  let warmFrames = 2;
  let phase = 0;            // 0 idle plan, 1 launched, 2 after
  let tLaunch = -1;
  let plan = 1;             // the idle plan's visibility
  let scarS = 1;            // the scars' visibility (reset fades them)
  let inFlight = 0, detonated = 0;
  let yaw = -30 * D2R, pitch = 40 * D2R;       // the globe's centre: lon, lat as seen from the eye
  let yawT = yaw, pitchT = pitch;
  let hx = 0.5, hy = 0.5;
  let pulse = 0, beatPrev = 0;
  let lastHand = -1;        // the hand's last seen values: the mapping applies only when the hand moves, so setRotation holds between
  let lhx = 0, lhy = 0;
  const rot = new THREE.Quaternion(), qx = new THREE.Quaternion(), qy = new THREE.Quaternion();
  const camPos = new THREE.Vector3(), camQ = new THREE.Quaternion(), camScale = new THREE.Vector3();
  const fwd = new THREE.Vector3();
  const approach = (v, to, tau, dt) => v + (to - v) * (1 - Math.exp(-dt / tau));
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  function setRotationTarget(y, p) { yawT = y; pitchT = clamp(p, -85 * D2R, 85 * D2R); }

  function writeIdle() {
    const R = routes.U.uRoute.value;
    for (let r = 0; r < nRoutes; r++) { R[r * 4] = -1; R[r * 4 + 1] = 1; }
    for (let i = 0; i < N_BULLETS; i++) bullets.s[i * 4 + 1] = 0;
  }

  function launchAll() {
    phase = 1;
    tLaunch = 0;
    plan = 1;
    scarS = 1;
    rArrived.fill(0);
    rArrT.fill(-1);
    nodeScar.fill(0);
    nodeFlashT.fill(-1);
    for (let r = 0; r < nRoutes; r++) nodeFlashT[rFrom[r]] = 0;   // every field flashes at once
    inFlight = 0; detonated = 0;
  }
  function reset() {
    phase = 0;
    tLaunch = -1;
    inFlight = 0; detonated = 0;
    rArrived.fill(0);
    nodeFlashT.fill(-1);
    writeIdle();
  }

  // ---- per frame
  function updateRoutesAndBullets(dt, t) {
    const R = routes.U.uRoute.value;
    let allDone = true;
    let fly = 0, det = 0;
    for (let r = 0; r < nRoutes; r++) {
      const T = rFlight[r];
      const s = tLaunch / T;
      const b0 = r * BULLETS_PER_ROUTE;
      if (s >= 1) {
        if (!rArrived[r]) {
          rArrived[r] = 1;
          rArrT[r] = tLaunch;
          nodeScar[rTo[r]] += rWar[r];
          nodeFlashT[rTo[r]] = 0;
        }
        det += rWar[r];
        const since = tLaunch - rArrT[r];
        R[r * 4] = 1.001;
        R[r * 4 + 1] = Math.exp(-since * 1.4);          // the burn behind the last head cools out
        for (let j = 0; j < BULLETS_PER_ROUTE; j++) bullets.s[(b0 + j) * 4 + 1] = 0;
        continue;
      }
      allDone = false;
      fly += rWar[r];
      R[r * 4] = s;
      R[r * 4 + 1] = 1;
      // the bus: grown from a point at the field over the first half second, faded out as it deploys
      const grow = Math.min(1, tLaunch / 0.5);
      const deploy = s < SPLIT_S ? 0 : Math.min(1, (s - SPLIT_S) / 0.06);
      const busA = 1 - deploy;
      const tail = 0.05 * grow;
      arcAt(r, s, bullets.p1, b0 * 3);
      arcAt(r, s - tail, bullets.p0, b0 * 3);
      const q = b0 * 4;
      bullets.s[q] = (2.2 + 1.8 * Math.sqrt(rWar[r] / 100)) * grow;
      bullets.s[q + 1] = busA;
      bullets.s[q + 2] = rTint[r];
      bullets.s[q + 3] = 2;
      // the MIRV heads: out of the bus past SPLIT_S, fanning to the target's neighbourhood
      const k = rMirv[r];
      const tgt = rTo[r];
      for (let j = 0; j < MIRV_MAX; j++) {
        const bi = b0 + 1 + j;
        const qq = bi * 4;
        if (j >= k || deploy <= 0) { bullets.s[qq + 1] = 0; continue; }
        const fan = (s - SPLIT_S) / (1 - SPLIT_S);
        const ang = (j / k) * Math.PI * 2 + h1(r * 7.1 + j) * 1.2;
        const rad = (0.022 + 0.030 * h1(r * 3.3 + j * 1.7)) * fan;
        const ox = Math.cos(ang) * rad, oy = Math.sin(ang) * rad;
        const o3 = tgt * 3;
        const dx = tgtE1[o3] * ox + tgtE2[o3] * oy, dy = tgtE1[o3 + 1] * ox + tgtE2[o3 + 1] * oy, dz = tgtE1[o3 + 2] * ox + tgtE2[o3 + 2] * oy;
        arcAt(r, s, bullets.p1, bi * 3);
        arcAt(r, s - 0.025, bullets.p0, bi * 3);
        bullets.p1[bi * 3] += dx; bullets.p1[bi * 3 + 1] += dy; bullets.p1[bi * 3 + 2] += dz;
        const fan0 = Math.max(0, fan - 0.12);
        bullets.p0[bi * 3] += dx * fan0 / Math.max(fan, 1e-3); bullets.p0[bi * 3 + 1] += dy * fan0 / Math.max(fan, 1e-3); bullets.p0[bi * 3 + 2] += dz * fan0 / Math.max(fan, 1e-3);
        bullets.s[qq] = 1.9 * deploy;
        bullets.s[qq + 1] = 1.0 * deploy;
        bullets.s[qq + 2] = rTint[r];
        bullets.s[qq + 3] = 2;
      }
    }
    inFlight = fly;
    detonated = det;
    if (allDone && phase === 1) phase = 2;
  }

  function updateNodes() {
    const s = nodes.s, f = nodes.f;
    const beatK = 1 + 0.14 * pulse;
    for (let i = 0; i < NODES.length; i++) {
      const kind = NODES[i][5];
      const q = i * 4;
      const w = nodeWar[i];
      let size, alpha, tint, shape;
      if (w > 0) {
        size = (0.022 + 0.032 * Math.sqrt(w / 480)) * beatK;
        alpha = 0.85;
        tint = SIDE_TINT[NODES[i][4]] ?? 2.0;
        shape = 0;
      } else {
        size = kind === 'cmd' ? 0.05 : 0.038;
        alpha = 0.6;
        tint = 2.2;
        shape = kind === 'cmd' ? 2 : 1;
      }
      // the flash: white at a launch or an arrival, the ring swelling with it
      let flash = 0, glow = 0;
      if (nodeFlashT[i] >= 0) {
        const age = tLaunch - nodeFlashT[i];
        flash = Math.exp(-age * 2.6);
        if (w > 0) glow = Math.exp(-age * 0.35) * (phase === 1 ? 1 : 0.5);
      }
      // the scar: a glowing blot that deepens with the warheads landed (held after the end)
      const scar = nodeScar[i] > 0 ? Math.pow(Math.min(1, nodeScar[i] / 160), 0.6) * scarS : 0;
      const scarGrow = nodeScar[i] > 0 ? (nodeFlashT[i] >= 0 ? Math.min(1, (tLaunch - nodeFlashT[i]) / 0.7 + 0.3) : 1) : 0;
      s[q] = size + 0.02 * flash + 0.03 * scar * scarGrow;
      s[q + 1] = alpha;
      s[q + 2] = tint;
      s[q + 3] = shape;
      f[q] = flash;
      f[q + 1] = scar * scarGrow;
      f[q + 2] = glow;
      f[q + 3] = 0;
    }
    nodes.aS.needsUpdate = true;
    nodes.aF.needsUpdate = true;
  }

  function updateHud() {
    let i = HUD0;
    const rad = 1.1, tint = 2.2;
    // "EST" at the top right of the disc
    const gw = 0.055, gh = 0.095, gap = 0.03;
    i = glyph(i, SEG7_E, 0.80, 1.02, gw, gh, rad, 0.5, tint);
    i = glyph(i, SEG7_S, 0.80 + gw + gap, 1.02, gw, gh, rad, 0.5, tint);
    i = glyph(i, SEG7_T, 0.80 + 2 * (gw + gap), 1.02, gw, gh, rad, 0.5, tint);
    // the counters under the disc: in flight (left, cool), detonated (right, warm)
    const dw = 0.07, dh = 0.12, dgap = 0.035, y = -1.24;
    const scen = phase > 0 ? 1 : 0;
    i = counter(i, inFlight, -1.0, y, dw, dh, dgap, 1.2, 0.9 * scen, 2.0);
    i = counter(i, detonated, 0.6, y, dw, dh, dgap, 1.2, 0.9 * scen, 0.5);
    // a bar each, the length the share of all warheads
    const bw = HUD_DIGITS * (dw + dgap) - dgap;
    const fly = totalWar > 0 ? inFlight / totalWar : 0, det = totalWar > 0 ? detonated / totalWar : 0;
    hudCap(i++, -1.0, y - 0.05, -1.0 + bw * fly, y - 0.05, 1.6, fly > 0.001 ? 0.6 : 0, 2.0);
    hudCap(i++, 0.6, y - 0.05, 0.6 + bw * det, y - 0.05, 1.6, det > 0.001 ? 0.7 : 0, 0.5);
  }

  function update(dt, t, io, state) {
    // ---- visibility, and the warm frames
    const target = shownTarget ? 1 : 0;
    showS = approach(showS, target, 0.2, dt);
    if (!shownTarget && showS < 0.003) showS = 0;
    const warm = warmFrames > 0;
    if (warm) warmFrames--;
    const active = warm || showS > 0;
    group.visible = active;
    if (!active) return;
    const cam = (state && state.camera) || opts.camera || null;
    const hand = state && state.hand ? state.hand : io.xy;
    const intensity = (state && state.intensity != null) ? state.intensity : io.intensity;

    // ---- the hand turns the globe (X yaw, Y pitch); it holds otherwise
    if (hand) {
      const hxN = hand.x, hyN = hand.y;
      if (lastHand < 0 || hxN !== lhx || hyN !== lhy) {
        lhx = hxN; lhy = hyN;
        hx = hxN; hy = hyN;
        setRotationTarget((-30 + (hx - 0.5) * 360) * D2R, (40 + (hy - 0.5) * 130) * D2R);
        lastHand = 1;
      }
    }
    yaw = approach(yaw, yawT, 0.22, dt);
    pitch = approach(pitch, pitchT, 0.22, dt);
    // bring (lat = pitch, lon = yaw) to face the eye: Ry(-lon) then Rx(lat)
    qy.setFromAxisAngle(v2.set(0, 1, 0), -yaw);
    qx.setFromAxisAngle(v2.set(1, 0, 0), pitch);
    rot.copy(qx).multiply(qy);
    globe.quaternion.copy(rot);
    qInv.copy(rot).invert();

    // ---- the frame: a fixed distance in front of the eye, grown from a point
    const grow = Math.max(0.02, showS);
    if (cam) {
      cam.matrixWorld.decompose(camPos, camQ, camScale);
      const fovDeg = cam.fov || 55;
      const D = 1 / Math.sin(Math.min(0.98, fovFraction) * fovDeg * 0.5 * D2R);
      fwd.set(0, 0, -1).applyQuaternion(camQ);
      group.position.copy(camPos).addScaledVector(fwd, D);
      group.quaternion.copy(camQ);
    }
    group.scale.setScalar(grow);
    group.updateMatrixWorld(true);
    eyeL.copy(cam ? camPos : v2.set(0, 0, 4));
    globe.worldToLocal(eyeL);

    // ---- the beat
    if (io.beat > beatPrev + 0.3) pulse = 1;
    beatPrev = io.beat;
    pulse = Math.max(0, pulse - dt * 3.5);

    // ---- the scenario
    if (phase > 0) {
      tLaunch += dt;
      updateRoutesAndBullets(dt, t);
      if (phase === 2) plan = approach(plan, 0.12, 1.4, dt);
    } else {
      plan = approach(plan, 1, 0.35, dt);
      scarS = approach(scarS, 0, 0.35, dt);
      if (scarS < 0.002) { scarS = 0; nodeScar.fill(0); }
    }
    updateNodes();
    updateHud();

    // ---- uniforms and buffers
    const k = intensity;
    const pl = io.palette;
    for (let p = 0; p < pals.length; p++) for (let i = 0; i < 5; i++) pals[p][i].value.copy(pl[i]);
    const wv = warm ? 1 : 0;
    SU.uIntensity.value = k * showS;
    SU.uAlpha.value = showS;
    SU.uTime.value = t;
    SU.uWarm.value = wv;
    lines.U.uIntensity.value = k * showS;
    lines.U.uWarm.value = wv;
    routes.U.uIntensity.value = k * showS;
    routes.U.uWarm.value = wv;
    routes.U.uPlan.value = plan;
    nodes.U.uIntensity.value = k * showS;
    nodes.U.uWarm.value = wv;
    bullets.U.uIntensity.value = k * showS;
    bullets.U.uWarm.value = wv;
    // the bullets carry the HUD, which changes every frame the map is on
    bullets.aP0.needsUpdate = true; bullets.aP1.needsUpdate = true; bullets.aS.needsUpdate = true;
  }

  // the static buffers upload once
  lines.aP0.needsUpdate = true; lines.aP1.needsUpdate = true; lines.aS.needsUpdate = true;
  routes.aP0.needsUpdate = true; routes.aP1.needsUpdate = true; routes.aS.needsUpdate = true; routes.aRt.needsUpdate = true;
  writeIdle();

  return {
    group,
    update,
    show(on) { shownTarget = !!on; },
    launchAll,
    reset,
    setRotation(y, p) { setRotationTarget(y, p); lastHand = 1; },
    isActive() { return shownTarget || showS > 0; },
    resize(w, h) { uRes.value.set(w, h); },
    get fovFraction() { return fovFraction; },
    set fovFraction(f) { fovFraction = Math.max(0.1, f || 0.55); },
    dispose() {
      sphereGeo.dispose(); sphereMat.dispose(); landTex.dispose();
      lines.geo.dispose(); lines.mat.dispose();
      routes.geo.dispose(); routes.mat.dispose();
      nodes.geo.dispose(); nodes.mat.dispose();
      bullets.geo.dispose(); bullets.mat.dispose();
    },
    // for the integrator: the table's totals
    totals: { routes: nRoutes, warheads: totalWar, nodes: NODES.length },
  };
}
