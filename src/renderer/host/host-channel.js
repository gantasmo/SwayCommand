// The postMessage channel to the embedding host (theDAW's SWAY tab).
//
// theDAW owns the only navigator.requestMIDIAccess() in its renderer, and
// Windows lets exactly one process hold a MIDI input, so the cockpit must not
// open the hardware itself when embedded -- it would either steal the port from
// theDAW or report PORT BUSY. Instead theDAW relays raw MIDI bytes here and the
// cockpit's own decoding (factory map, learned overrides, pad channels) applies
// to them unchanged.
//
// The same channel carries audio analysis (so the visuals follow whatever
// theDAW is playing) and a visibility signal (so a hidden tab stops rendering
// instead of burning the GPU for the rest of the session).
//
// Everything here is inert in the desktop app: bridge.js only installs it when
// there is no Electron preload.

const PROTOCOL = 1;

/** Set by the host handshake; used to pin outbound posts. */
let hostOrigin = null;

/** Latest analysis frame from the host, consumed by engine/audio.js. */
export const hostAudio = {
  active: false,
  bass: 0,
  mid: 0,
  high: 0,
  level: 0,
  t: 0,
};

/** Raw MIDI frames from the host, consumed by midi/midi.js in bridge mode. */
const midiListeners = new Set();

/** Visibility from the host, consumed by app.js to idle the render loop. */
export const hostVisibility = { visible: true, known: false };
const visibilityListeners = new Set();

export function onHostMidi(cb) {
  midiListeners.add(cb);
  return () => midiListeners.delete(cb);
}

export function onHostVisibility(cb) {
  visibilityListeners.add(cb);
  return () => visibilityListeners.delete(cb);
}

/** True when a host is driving this cockpit (i.e. we are embedded). */
export function hasHost() {
  return hostOrigin !== null;
}

/**
 * True when this document is framed by another page.
 *
 * Deliberately separate from hasHost(): the handshake completes a few frames
 * after boot, but createMidi() runs DURING boot and has to decide there and
 * then whether to open the hardware. Being framed is the synchronous, race-free
 * signal that someone else owns the MIDI port -- and on Windows only one
 * process may hold it.
 */
export function isFramed() {
  try {
    return window.parent !== window;
  } catch {
    // A cross-origin parent throws on access; that still means we are framed.
    return true;
  }
}

/**
 * True when something other than this page owns the MIDI hardware.
 *
 * Being framed implies it, which is theDAW's case. An Android WebView is the
 * opposite shape: the page is top level, so isFramed() is false, yet the host
 * absolutely owns the port because a WebView implements no Web MIDI at all and
 * the device is opened through android.media.midi. Such a host says so before
 * app.js runs by setting the flag below.
 */
export function hostOwnsMidi() {
  return isFramed() || window.__SWAY_HOST_MIDI__ === true;
}

export function postToHost(payload) {
  if (!window.parent || window.parent === window) return;
  try {
    window.parent.postMessage({ ...payload, v: PROTOCOL }, hostOrigin || '*');
  } catch {
    /* the host went away; nothing to do */
  }
}

export function installHostChannel() {
  window.addEventListener('message', (e) => {
    // Only the embedder may drive this cockpit. Before the handshake we accept
    // the parent frame alone; afterwards we also pin the origin it declared.
    if (e.source !== window.parent) return;
    if (hostOrigin !== null && e.origin !== hostOrigin) return;
    const d = e.data;
    if (!d || typeof d.type !== 'string' || !d.type.startsWith('sway/')) return;

    switch (d.type) {
      case 'sway/host-ready':
        hostOrigin = e.origin;
        break;

      case 'sway/midi': {
        if (!Array.isArray(d.data)) break;
        for (const cb of midiListeners) {
          try {
            cb(d.data, d.t);
          } catch (err) {
            console.error('[host] midi listener threw:', err);
          }
        }
        break;
      }

      case 'sway/analysis': {
        hostAudio.active = true;
        hostAudio.bass = Number(d.bass) || 0;
        hostAudio.mid = Number(d.mid) || 0;
        hostAudio.high = Number(d.high) || 0;
        hostAudio.level = Number(d.volume) || 0;
        hostAudio.t = performance.now();
        break;
      }

      case 'sway/audio-source':
        // 'host' = theDAW's master feeds the analysis frames above.
        // 'input' = the cockpit opens its own input device, as it does
        // standalone, so stop honouring stale host frames.
        hostAudio.active = d.source === 'host';
        break;

      case 'sway/visibility': {
        hostVisibility.visible = d.visible !== false;
        hostVisibility.known = true;
        for (const cb of visibilityListeners) {
          try {
            cb(hostVisibility.visible);
          } catch (err) {
            console.error('[host] visibility listener threw:', err);
          }
        }
        break;
      }

      default:
        break;
    }
  });

  // Announce readiness. The host queues anything it wanted to send before this
  // and flushes on receipt, so a race during boot loses nothing.
  const announce = () => postToHost({ type: 'sway/ready', app: 'swaycommand' });
  if (document.readyState === 'complete') announce();
  else window.addEventListener('load', announce, { once: true });
  // Also announce immediately: the host tolerates duplicates, and 'load' can be
  // late behind the bundle's own work.
  announce();
}
