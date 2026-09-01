// MIDI layer, WebMIDI with Sway-first behavior:
//   * prefers the port named exactly "Audima Labs The Sway" (substring match
//     covers Linux/ALSA's " MIDI 1" suffix), hot-attaches on plug-in;
//   * applies the recovered factory map (swaymap.js), tolerant of the known
//     pad-channel ambiguity (accepts channel 1 and 16);
//   * MIDI-learn can rebind any control, which also makes any class-compliant
//     controller a first-class citizen;
//   * keeps a small monitor ring buffer for the HUD.

import { FACTORY_MAP, SWAY_PORT_NAME, createControlState } from './swaymap.js';
import { hostOwnsMidi, onHostMidi } from '../host/host-channel.js';

const MONITOR_SIZE = 14;

export async function createMidi({ onEvent } = {}) {
  const control = createControlState();
  const monitor = [];
  let access = null;
  let boundInputs = new Map(); // id -> input
  let overrides = {}; // learned bindings: { 'knob:3': {type:'cc', num: 71}, 'xy:x': {...} }
  let learnTarget = null;
  let learnResolve = null;

  // Embedded: the host owns the only MIDIAccess and relays raw bytes to us.
  // Windows allows exactly ONE process to hold a MIDI input, so opening the
  // port here would either take it away from the host or fail as PORT BUSY.
  const relayed = hostOwnsMidi();
  const supported = relayed || typeof navigator.requestMIDIAccess === 'function';
  if (!relayed && typeof navigator.requestMIDIAccess === 'function') {
    try {
      // requestMIDIAccess does not settle until the user answers Chromium's
      // permission prompt - measured hanging indefinitely when it is never
      // answered. Awaiting it bare wedges main(), leaving the blast door
      // locked with no error anywhere. Give it a bounded wait and carry on
      // without MIDI if it does not arrive; a late grant is picked up by the
      // statechange handler below.
      access = await Promise.race([
        navigator.requestMIDIAccess({ sysex: false }),
        new Promise((resolve) => setTimeout(() => resolve(null), 3000)),
      ]);
      if (!access) {
        pushMonitor('MIDI permission not answered - continuing without it.');
      }
    } catch (err) {
      console.warn('[midi] access denied/unavailable:', err.message);
    }
  }

  function pushMonitor(line) {
    monitor.unshift(line);
    if (monitor.length > MONITOR_SIZE) monitor.pop();
  }

  function ccTargetFor(cc) {
    // learned overrides win over the factory map
    for (const [target, bind] of Object.entries(overrides)) {
      if (bind.type === 'cc' && bind.num === cc) return target;
    }
    const M = FACTORY_MAP;
    if (cc === M.xy.x) return 'xy:x';
    if (cc === M.xy.y) return 'xy:y';
    if (cc === M.gestures.pulse) return 'gesture:pulse';
    if (cc === M.gestures.press) return 'gesture:press';
    if (cc === M.gestures.sway) return 'gesture:sway';
    if (cc === M.xtrigYmod.x) return 'xtrig:x';
    if (cc === M.xtrigYmod.y) return 'xtrig:y';
    const k = M.knobs.indexOf(cc);
    if (k >= 0) return `knob:${k}`;
    return null;
  }

  function applyTarget(target, value01) {
    switch (target) {
      case 'xy:x':
        control.xy.x = value01;
        break;
      case 'xy:y':
        control.xy.y = value01;
        break;
      case 'gesture:pulse':
        control.gestures.pulse = value01;
        break;
      case 'gesture:press':
        control.gestures.press = value01;
        break;
      case 'gesture:sway':
        control.gestures.sway = value01;
        break;
      case 'xtrig:x':
        control.xtrigYmod.x = value01;
        break;
      case 'xtrig:y':
        control.xtrigYmod.y = value01;
        break;
      default:
        if (target && target.startsWith('knob:')) {
          control.knobs[Number(target.slice(5))] = value01;
        }
    }
  }

  function padIndexFor(note) {
    const { chromaticBase, factoryNotes } = FACTORY_MAP.pads;
    if (note >= chromaticBase && note < chromaticBase + 16) return note - chromaticBase;
    const fi = factoryNotes.indexOf(note);
    return fi; // -1 when not a pad note
  }

  function handleMessage(e, portName) {
    const [status, d1, d2] = e.data;
    const type = status & 0xf0;
    const ch = status & 0x0f;
    control.lastEventAt = performance.now();

    if (type === 0xb0) {
      // CC, feed MIDI-learn first
      if (learnTarget) {
        overrides[learnTarget] = { type: 'cc', num: d1 };
        const t = learnTarget;
        learnTarget = null;
        if (learnResolve) learnResolve({ target: t, cc: d1 });
        pushMonitor(`LEARN ${t} <- CC${d1}`);
        return;
      }
      const target = ccTargetFor(d1);
      if (target) applyTarget(target, d2 / 127);
      // CC 1 is the modulation wheel by convention; the synth uses it as a
      // mod-matrix source.
      if (d1 === 1 && onEvent) onEvent({ kind: 'mod', value: d2 / 127 });
      // Every CC also goes out as an event: the router matches button
      // bindings and touch-to-select on it, continuous state alone lands
      // silently in `control`, which the UI cannot observe per-control.
      if (onEvent) onEvent({ kind: 'cc', cc: d1, value: d2 / 127, channel: ch, target });
      pushMonitor(`CC${d1}=${d2} ch${ch + 1}${target ? ' -> ' + target : ''}`);
    } else if (type === 0x90 && d2 > 0) {
      const idx = padIndexFor(d1);
      if (idx >= 0) {
        control.pads[idx] = d2 / 127;
        control.lastPad = idx;
      }
      pushMonitor(`NOTE ${d1} vel${d2} ch${ch + 1}${idx >= 0 ? ' -> pad' + idx : ''}`);
      if (onEvent) {
        onEvent({ kind: 'pad', idx, vel: d2 / 127 });
        // The raw note goes out too: pads drive the visuals, but the synth
        // needs the actual pitch, including notes outside the pad range that
        // the Sway's Theory Engine sends. idx rides along so note routing
        // can tell an assigned pad from a free pitch.
        onEvent({ kind: 'note', note: d1, vel: d2 / 127, channel: ch, idx });
      }
    } else if (type === 0x80 || (type === 0x90 && d2 === 0)) {
      // Pads decay in the engine, but a synth voice has to be released,
      // and a gate-mode pad needs its index to release the sampler.
      pushMonitor(`NOTE OFF ${d1} ch${ch + 1}`);
      if (onEvent) onEvent({ kind: 'noteoff', note: d1, channel: ch, idx: padIndexFor(d1) });
    } else if (type === 0xe0) {
      // Pitch bend: 14-bit little-endian, centre 8192 -> 0.5.
      const value = ((d2 << 7) | d1) / 16383;
      if (onEvent) onEvent({ kind: 'bend', value });
      pushMonitor(`BEND ${value.toFixed(3)} ch${ch + 1}`);
    } else if (type === 0xc0) {
      if (d1 === FACTORY_MAP.programs.sleep) control.awake = false;
      if (d1 === FACTORY_MAP.programs.wake) control.awake = true;
      pushMonitor(`PC ${d1} ch${ch + 1}`);
    }
  }

  function isSwayPort(name) {
    return !!name && name.includes(SWAY_PORT_NAME);
  }

  function rescan() {
    if (!access) return;
    boundInputs.forEach((input) => (input.onmidimessage = null));
    boundInputs = new Map();

    const inputs = [...access.inputs.values()];
    const sway = inputs.find((i) => isSwayPort(i.name));
    // Sway present: bind it (exclusively authoritative for isSway flag).
    // Otherwise: bind ALL inputs so any controller drives the show.
    const targets = sway ? [sway] : inputs;
    control.busy = false;
    for (const input of targets) {
      input.onmidimessage = (e) => handleMessage(e, input.name);
      boundInputs.set(input.id, input);
      // Windows lets ONE process hold a MIDI input. If another app, or a
      // stale headless instance of this one, already owns the port, the
      // implicit open behind onmidimessage fails silently and the deck looks
      // dead with the Sway plugged in. Open explicitly so that failure is
      // visible: the link pill reads BUSY and the monitor names the port.
      if (typeof input.open === 'function') {
        input.open().catch((err) => {
          control.busy = true;
          pushMonitor(`PORT BUSY ${input.name}, held by another process (${err && err.name ? err.name : 'open failed'})`);
        });
      }
    }
    control.connected = targets.length > 0;
    control.isSway = !!sway;
    control.portName = sway ? sway.name : targets.length ? targets.map((t) => t.name).join(', ') : null;
  }

  if (relayed) {
    // The host names the port so the link pill has something to show; every
    // decode below is the hardware path, byte for byte.
    control.connected = true;
    control.isSway = true;
    control.portName = window.__SWAY_HOST_NAME__ || 'theDAW (relayed)';
    pushMonitor('Linked to the host application - MIDI is relayed.');
    onHostMidi((data) => {
      try {
        handleMessage({ data }, 'theDAW');
      } catch (err) {
        console.error('[midi] relayed frame failed:', err);
      }
    });
  } else if (access) {
    rescan();
    access.onstatechange = () => rescan(); // hot-plug / hot-unplug
  }

  return {
    control,
    monitor,
    supported,
    get available() {
      // Embedded (relayed) mode never opens its own MIDIAccess, the host
      // relays raw bytes, so `access` alone made the splash report "WebMIDI
      // unavailable" while relayed MIDI was audibly playing. The relay IS
      // availability.
      return relayed || !!access;
    },
    // Resolves when the next CC arrives; that CC becomes the binding.
    learn(target) {
      learnTarget = target;
      return new Promise((resolve) => (learnResolve = resolve));
    },
    cancelLearn() {
      learnTarget = null;
      learnResolve = null;
    },
    setOverrides(o) {
      overrides = o || {};
    },
    getOverrides() {
      return { ...overrides };
    },
  };
}
