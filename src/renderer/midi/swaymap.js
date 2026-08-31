// Factory MIDI map of the Audima Labs Sway (Base Project V2).
// Recovered from Audima's own artifacts: the Base Project V2 .swayproj,
// the official Ableton Live remote scripts, and the Cubase MIDI Remote script.
// Not officially published by Audima, every binding here can be overridden
// at runtime via MIDI-learn (see midi.js), which also makes any other
// class-compliant controller usable.

export const SWAY_PORT_NAME = 'Audima Labs The Sway';

export const FACTORY_MAP = {
  channel: 0, // MIDI channel 1 (0-indexed)

  // Full-surface hand tracking (both hands merged in factory map)
  xy: { x: 50, y: 38 }, // CC numbers

  // Gesture-isolation dimensions (subset the hardware exposes as dedicated CCs)
  gestures: {
    pulse: 35, // vertical bounce energy
    press: 36, // downward press depth
    sway: 37, // lateral sway amount
  },

  // Paired X-trigger / Y-modulation regions
  xtrigYmod: { x: 73, y: 74 },

  // 8 click knobs, rotation
  knobs: [20, 21, 22, 23, 24, 25, 26, 27],

  // 16 drum pads. Factory default is a B-minor Theory Engine grid;
  // Audima's own Ableton demo packs remap pads to chromatic notes 24 to 39,
  // which is also what we normalize to internally. Pads may arrive on
  // channel 1 or 16 depending on firmware/project (observed conflict
  // between the .swayproj and the Ableton script), we accept both.
  pads: {
    chromaticBase: 24, // notes 24..39 => pad index 0..15
    channels: [0, 15],
    // B natural minor grid (factory Theory Engine default), low to high
    factoryNotes: [47, 49, 50, 52, 54, 55, 57, 59, 61, 62, 64, 66, 67, 69, 71, 73],
  },

  // Program changes the device emits on sleep/wake (bank 0)
  programs: { sleep: 37, wake: 38 },
};

// Normalized control state every consumer reads. midi.js owns one of these.
export function createControlState() {
  return {
    connected: false,
    portName: null,
    isSway: false,
    busy: false, // a bound port another process already holds (Windows: one opener per input)
    xy: { x: 0.5, y: 0.5 }, // 0..1
    gestures: { pulse: 0, press: 0, sway: 0 }, // 0..1
    xtrigYmod: { x: 0, y: 0 },
    knobs: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], // 0..1
    pads: new Array(16).fill(0), // velocity 0..1, decays in engine
    lastPad: -1,
    awake: true,
    lastEventAt: 0,
  };
}
