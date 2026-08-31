// ColorMaster, one global 5-color palette every scene reads each frame,
// after Akvj's ColorMaster (which syncs palette properties across all VFX).
// Palettes crossfade smoothly; knob 0 applies a live global hue rotation.

import * as THREE from 'three';

export const PALETTES = {
  'neon-garage': ['#ff2d95', '#7a0bc0', '#2de1fc', '#f9f871', '#ff6b35'],
  'dnb-acid': ['#39ff14', '#0affef', '#ff3131', '#cfff04', '#7df9ff'],
  'hiphop-gold': ['#ffb300', '#ff6f00', '#8d5524', '#fff3c4', '#e63946'],
  'ambient-teal': ['#0f4c5c', '#5bc0be', '#9bf6ff', '#3a506b', '#e0fbfc'],
  'mono-ice': ['#dbe9ff', '#9fc5ff', '#5e8fce', '#2e4a7d', '#f4f9ff'],
  'sunset-vhs': ['#ff5f6d', '#ffc371', '#a83279', '#3c1053', '#ffd9e8'],
  // Deep-space and hyperreal palettes for the fractal, wormhole, and orb scenes.
  'deep-space': ['#4d1bff', '#00c2ff', '#ff2fb9', '#08f7fe', '#ffe66d'],
  'dmt-jewel': ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff'],
  'hyperspace': ['#ffffff', '#9bf6ff', '#4361ee', '#7209b7', '#f72585'],
  'chrysanthemum': ['#39ff14', '#ff10f0', '#00fff7', '#ffea00', '#ff5400'],
};

export function createColorMaster(initialName = 'neon-garage') {
  const current = new Array(5).fill(0).map(() => new THREE.Color());
  const from = new Array(5).fill(0).map(() => new THREE.Color());
  const to = new Array(5).fill(0).map(() => new THREE.Color());
  const out = new Array(5).fill(0).map(() => new THREE.Color()); // hue-shifted copies scenes see
  const hsl = { h: 0, s: 0, l: 0 };

  let blend = 1;
  let blendTime = 1.5;
  let name = initialName;

  function loadInto(target, hexes) {
    for (let i = 0; i < 5; i++) target[i].set(hexes[i % hexes.length]);
  }
  loadInto(current, PALETTES[initialName] || PALETTES['neon-garage']);
  for (let i = 0; i < 5; i++) {
    from[i].copy(current[i]);
    to[i].copy(current[i]);
  }

  return {
    get name() {
      return name;
    },
    palette: out,

    // Accepts a registered palette name or an array of 5 hex strings.
    setPalette(nameOrHexes, fadeSeconds = 1.5) {
      const hexes = Array.isArray(nameOrHexes) ? nameOrHexes : PALETTES[nameOrHexes];
      if (!hexes) return;
      name = Array.isArray(nameOrHexes) ? 'custom' : nameOrHexes;
      for (let i = 0; i < 5; i++) from[i].copy(current[i]);
      loadInto(to, hexes);
      blend = 0;
      blendTime = Math.max(0.01, fadeSeconds);
    },

    // hueShift 0..1 => 0..360° rotation applied on top of the base palette.
    update(dt, hueShift = 0) {
      if (blend < 1) {
        blend = Math.min(1, blend + dt / blendTime);
        const k = blend * blend * (3 - 2 * blend); // smoothstep
        for (let i = 0; i < 5; i++) current[i].lerpColors(from[i], to[i], k);
      }
      for (let i = 0; i < 5; i++) {
        out[i].copy(current[i]);
        if (hueShift > 0.003) {
          out[i].getHSL(hsl);
          out[i].setHSL((hsl.h + hueShift) % 1, hsl.s, hsl.l);
        }
      }
      return out;
    },
  };
}
