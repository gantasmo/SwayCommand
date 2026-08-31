// Hardware monitor session probe, one SWAYCOMMAND_PROBE expression.
//
// Launched by scripts/midi-session.ps1. It wraps the MIDI monitor ring buffer
// (src/renderer/midi/midi.js pushMonitor -> monitor.unshift) so every incoming
// line is captured with a timestamp for window.__midiSessionMs milliseconds,
// then resolves one JSON report the main process prints as `[probe] ...`.
//
// The report answers the three open hardware questions in HANDOFF.md §4:
//   padStrikeOrder, the pads in the order they were first struck, each with
//                    the raw note and the pad index the app resolved it to.
//                    Struck in the deck's order (left cluster top row
//                    left->right = 0-3, right cluster top row = 4-7, left
//                    bottom row = 8-11, right bottom row = 12-15) the `pad`
//                    column must read 0..15; anything else is the reorder
//                    PAD_CELLS needs (src/renderer/ui/surface.js).
//   unmappedCCs   , every CC number the factory map has no target for, in
//                    first-seen order: the eight buttons and the knob presses,
//                    if the hardware sends them as CCs. Buttons should show
//                    min 0 / max 127 value pairs.
//   mappedCCs     , factory-mapped CCs that also moved (sanity: the knobs,
//                    xy, gestures), without their value samples.
//   raw           , the first 400 captured lines, for anything unexpected.
//
// The file is a single expression (an async IIFE) so it can be handed to
// webContents.executeJavaScript verbatim; executeJavaScript awaits the promise.
(async () => {
  const S = window.__swaycommand && window.__swaycommand.state;
  if (!S || !S.midi) return 'midi-session: no midi module on the automation handle';
  const DURATION_MS = Number(window.__midiSessionMs || 120000);
  const midi = S.midi;
  const mon = midi.monitor;
  const t0 = performance.now();
  const captured = [];
  const orig = mon.unshift.bind(mon);
  mon.unshift = (...lines) => {
    for (const l of lines) captured.push([Math.round(performance.now() - t0), l]);
    return orig(...lines);
  };
  await new Promise((r) => setTimeout(r, DURATION_MS));
  mon.unshift = orig;

  const padSeq = [];
  const padSeen = new Set();
  const ccs = new Map();
  for (const [ms, l] of captured) {
    let m = /^NOTE (\d+) vel(\d+) ch(\d+)(?: -> pad(\d+))?$/.exec(l);
    if (m) {
      const note = +m[1];
      if (!padSeen.has(note)) {
        padSeen.add(note);
        padSeq.push({ note, ch: +m[3], pad: m[4] != null ? +m[4] : null, atMs: ms });
      }
      continue;
    }
    m = /^CC(\d+)=(\d+) ch(\d+)(?: -> (.+))?$/.exec(l);
    if (m) {
      const cc = +m[1];
      const v = +m[2];
      let e = ccs.get(cc);
      if (!e) {
        e = { cc, ch: +m[3], target: m[4] || null, count: 0, min: v, max: v, firstAtMs: ms, values: [] };
        ccs.set(cc, e);
      }
      e.count++;
      e.min = Math.min(e.min, v);
      e.max = Math.max(e.max, v);
      if (e.values.length < 8) e.values.push(v);
    }
  }
  const byFirst = (a, b) => a.firstAtMs - b.firstAtMs;
  const unmapped = [...ccs.values()].filter((e) => !e.target).sort(byFirst);
  const mapped = [...ccs.values()].filter((e) => e.target).sort(byFirst)
    .map(({ values, ...e }) => e);
  return JSON.stringify({
    port: midi.control.portName,
    isSway: midi.control.isSway,
    durationMs: DURATION_MS,
    events: captured.length,
    padStrikeOrder: padSeq,
    unmappedCCs: unmapped,
    mappedCCs: mapped,
    raw: captured.slice(0, 400),
  }, null, 1);
})()
