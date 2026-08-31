// Panel layout: drag grips resize the rails, the timeline band, the Sway
// deck and the INPUT box; a corner chip collapses each region to a thin
// strip; double-clicking a grip resets that dimension. Sizes are CSS
// variables written on :root (the drawer outside #cockpit reads them too),
// so the grid, the frames, the stage canvas and the deck SVG all follow by
// themselves. State persists as `settings.layout`.

const ROOT_STYLE = document.documentElement.style;

// Resizable dimensions. `sign` turns pointer travel into growth: the left
// rail grows when its grip moves right, everything else when the grip moves
// toward the stage. `strip` is the collapsed track size (rail columns carry
// the 6 px outer margin, so 24 px leaves an 18 px strip); the input box
// collapses through its flex rule, not its variable.
const DIMS = {
  railLeft: { prop: '--rail-w-left', axis: 'x', sign: 1, min: 120, max: 420, strip: 24, track: ['cols', 0] },
  railRight: { prop: '--rail-w-right', axis: 'x', sign: -1, min: 120, max: 420, strip: 24, track: ['cols', 2] },
  tl: { prop: '--tl-h', axis: 'y', sign: -1, min: 60, max: 400, strip: 18, track: ['rows', 2] },
  deck: { prop: '--deck-h', axis: 'y', sign: -1, min: 80, max: 360, strip: 18, track: ['rows', 3] },
  input: { prop: '--input-h', axis: 'y', sign: -1, min: 120, max: 400, strip: 0, track: null },
};
const FALLBACK = { railLeft: 208, railRight: 208, tl: 170, deck: 160, input: 136 };

// Collapsible regions: where the chip lives, which chevron it shows open and
// closed, which dimension (if any) it pins to its strip size.
const REGIONS = {
  railLeft: { sel: '#rail-left', dim: 'railLeft', open: 'left', shut: 'right', name: 'scenes' },
  railRight: { sel: '#rail-right', dim: 'railRight', open: 'right', shut: 'left', name: 'rail' },
  tl: { sel: '#timeline', dim: 'tl', open: 'down', shut: 'up', name: 'timeline' },
  deck: { sel: '#swaydeck', dim: 'deck', open: 'down', shut: 'up', name: 'deck' },
  assign: { sel: '#assign', dim: null, open: 'up', shut: 'down', name: 'assignment' },
  input: { sel: '#input-box', dim: null, open: 'up', shut: 'down', name: 'input' },
};

const CHEVRON = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5 8 3.5" /></svg>';

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function createLayout({ root, settings }) {
  const sizes = {}; // user-set px per dimension; absent -> CSS default
  const collapsed = {};
  const grips = {};
  const chips = {};
  let timer = 0;

  // --- variables ---

  function applyDim(key) {
    const d = DIMS[key];
    if (collapsed[key] && d.strip) ROOT_STYLE.setProperty(d.prop, `${d.strip}px`);
    else if (sizes[key] != null) ROOT_STYLE.setProperty(d.prop, `${sizes[key]}px`);
    else ROOT_STYLE.removeProperty(d.prop);
  }

  // Current track size in px, read back from the resolved grid so CSS
  // defaults (media query, the deck's viewport-derived height) count too.
  function currentPx(key) {
    const d = DIMS[key];
    let v = NaN;
    if (d.track) {
      const cs = getComputedStyle(root);
      const list = d.track[0] === 'cols' ? cs.gridTemplateColumns : cs.gridTemplateRows;
      const px = list.match(/[\d.]+px/g) || [];
      v = parseFloat(px[d.track[1]]);
    } else {
      const el = root.querySelector('#input-box');
      if (el) v = el.getBoundingClientRect().height;
    }
    if (!Number.isFinite(v) || v <= 0) v = sizes[key] != null ? sizes[key] : FALLBACK[key];
    return v;
  }

  // --- collapse ---

  function applyRegion(key) {
    const r = REGIONS[key];
    const el = root.querySelector(r.sel);
    const on = !!collapsed[key];
    if (el) el.classList.toggle('collapsed', on);
    const chip = chips[key];
    if (chip) {
      chip.dataset.dir = on ? r.shut : r.open;
      const label = `${on ? 'Expand' : 'Collapse'} ${r.name}`;
      chip.title = label;
      chip.setAttribute('aria-label', label);
    }
    if (r.dim) {
      applyDim(r.dim);
      if (grips[r.dim]) grips[r.dim].hidden = on;
    }
    if (grips.input) grips.input.hidden = !!(collapsed.input || collapsed.assign);
  }

  function applyAll() {
    for (const key in DIMS) applyDim(key);
    for (const key in REGIONS) applyRegion(key);
  }

  function toggle(key, on) {
    if (!REGIONS[key]) return;
    collapsed[key] = on == null ? !collapsed[key] : !!on;
    applyRegion(key);
    persist();
  }

  // --- persistence ---

  function snapshot() {
    const out = { collapsed: {} };
    for (const key in DIMS) if (sizes[key] != null) out[key] = sizes[key];
    for (const key in REGIONS) if (collapsed[key]) out.collapsed[key] = true;
    return out;
  }

  function persist() {
    if (!settings || typeof settings.set !== 'function') return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = 0;
      Promise.resolve()
        .then(() => settings.set({ layout: snapshot() }))
        .catch(() => {});
    }, 300);
  }

  function restore(saved) {
    if (!saved || typeof saved !== 'object') return;
    for (const key in DIMS) {
      const v = Number(saved[key]);
      if (Number.isFinite(v) && v > 0) sizes[key] = clamp(Math.round(v), DIMS[key].min, DIMS[key].max);
    }
    const c = saved.collapsed;
    if (c && typeof c === 'object') for (const key in REGIONS) collapsed[key] = !!c[key];
    applyAll();
  }

  // --- grips ---

  let drag = null; // { key, id, start, base, moved }
  let pending = 0;
  let raf = 0;

  // One variable write per frame at most; a click without travel pins nothing.
  function flush() {
    raf = 0;
    if (!drag || !drag.moved) return;
    if (sizes[drag.key] !== pending) {
      sizes[drag.key] = pending;
      applyDim(drag.key);
    }
  }

  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const grip = grips[drag.key];
    if (raf) cancelAnimationFrame(raf);
    flush();
    grip.classList.remove('active');
    if (grip.hasPointerCapture(e.pointerId)) grip.releasePointerCapture(e.pointerId);
    document.body.classList.remove('lay-drag-x', 'lay-drag-y');
    const moved = drag.moved;
    drag = null;
    if (moved) persist();
  }

  function makeGrip(key, parent) {
    const d = DIMS[key];
    const grip = document.createElement('div');
    grip.className = `lay-grip lay-grip-${d.axis}`;
    grip.dataset.grip = key;
    grip.title = 'Resize · double-click resets';
    grip.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || drag) return;
      e.preventDefault();
      grip.setPointerCapture(e.pointerId);
      drag = { key, id: e.pointerId, start: d.axis === 'x' ? e.clientX : e.clientY, base: currentPx(key), moved: false };
      grip.classList.add('active');
      document.body.classList.add(`lay-drag-${d.axis}`);
    });
    grip.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const pos = d.axis === 'x' ? e.clientX : e.clientY;
      if (pos === drag.start && !drag.moved) return;
      drag.moved = true;
      pending = clamp(Math.round(drag.base + (pos - drag.start) * d.sign), d.min, d.max);
      if (!raf) raf = requestAnimationFrame(flush);
    });
    grip.addEventListener('pointerup', endDrag);
    grip.addEventListener('pointercancel', endDrag);
    grip.addEventListener('dblclick', () => {
      delete sizes[key];
      applyDim(key);
      persist();
    });
    parent.appendChild(grip);
    grips[key] = grip;
  }

  function makeChip(key) {
    const r = REGIONS[key];
    const host = root.querySelector(r.sel);
    if (!host) return;
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'lay-chip';
    chip.dataset.region = key;
    chip.innerHTML = CHEVRON;
    chip.addEventListener('click', (e) => {
      toggle(key);
      if (e.detail) chip.blur(); // pointer click: hand the keys back to the instrument
    });
    host.appendChild(chip);
    chips[key] = chip;
  }

  // --- build ---

  makeGrip('railLeft', root);
  makeGrip('railRight', root);
  makeGrip('tl', root);
  makeGrip('deck', root);
  const inputBox = root.querySelector('#input-box');
  if (inputBox) makeGrip('input', inputBox);
  for (const key in REGIONS) makeChip(key);
  applyAll();

  if (settings && typeof settings.get === 'function') {
    Promise.resolve()
      .then(() => settings.get())
      .then((s) => restore(s && s.layout))
      .catch(() => {});
  }

  return {
    toggle,
    collapsed: (key) => !!collapsed[key],
    reset() {
      for (const key in DIMS) delete sizes[key];
      for (const key in REGIONS) collapsed[key] = false;
      applyAll();
      persist();
    },
  };
}
