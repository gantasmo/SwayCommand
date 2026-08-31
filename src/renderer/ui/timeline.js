// Timeline band, a toolbar (import, add track, tempo, snap), a head column
// (one row per lane: scenes, then every audio track with mute / solo), the
// ruler with bar / beat grid, loop region and locators, one visual lane of
// scene clips (DOM), N audio lanes with waveforms and effect regions (one
// canvas), and a playhead. The clip, track and region objects it edits are
// the project's own timeline objects; every structural change goes through
// transport.refresh() and onEdit().
//
// Import is the intuitive path: IMPORT (or dropping files from the desktop
// onto the band) lays every file down as its own track at the playhead,
// snapped to the grid; the first import sets the tempo from the audio when
// the session has none. Dragging a kit sample onto a track lays it as a clip
// on that track. Shift+drag on a track marks a SECTION, a region that
// engages one effect parameter while the playhead crosses it.

import { uid } from '../../shared/swayproject.js';
import { FX_KINDS } from '../../shared/trackfx.js';

const $ = (sel) => document.querySelector(sel);
const EDGE = 8; // px resize zone on clip edges
const PEAK_BUCKETS = 2048;
const REGION_BAND = 0.34; // top fraction of an audio row where regions live

export function createTimeline({ transport, engine, store, onEdit, onSelect, onImport }) {
  const root = $('#timeline');
  const ruler = $('#tl-ruler');
  const visualLane = $('#tl-visual');
  const audioCanvas = $('#tl-audio');
  const playhead = $('#tl-playhead');
  const heads = $('#tl-heads');
  const lanes = $('#tl-lanes');
  const bpmInput = $('#tl-bpm');
  const snapSel = $('#tl-snap');
  const hint = $('#tl-hint');

  let pxPerSec = 12;
  let scrollX = 0; // seconds at the left edge
  let sel = null; // { kind: 'clip'|'region'|'track', id, track }
  const peaks = new Map(); // mediaId -> Float32Array(2 * PEAK_BUCKETS)
  const taps = [];

  function timeline() {
    return transport.collect();
  }
  function tracks() {
    return transport.tracks();
  }
  function visualClips() {
    const tl = timeline();
    return tl ? tl.tracks.find((t) => t.type === 'visual').clips : [];
  }

  function xToTime(x) {
    return Math.max(0, scrollX + x / pxPerSec);
  }
  function timeToX(t) {
    return (t - scrollX) * pxPerSec;
  }
  function snap(t) {
    return transport.snapTime(t);
  }

  function fitCanvas(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (w && h && (canvas.width !== w || canvas.height !== h)) {
      canvas.width = w;
      canvas.height = h;
    }
    return dpr;
  }

  function fmtTime(t) {
    const m = Math.floor(t / 60);
    const s = t - m * 60;
    return m ? `${m}:${s < 10 ? '0' : ''}${Math.floor(s)}` : `${Math.round(s * 10) / 10}`;
  }

  function css(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  // --- ruler ---------------------------------------------------------------------

  function renderRuler() {
    const dpr = fitCanvas(ruler);
    const ctx = ruler.getContext('2d');
    const w = ruler.width;
    const h = ruler.height;
    ctx.clearRect(0, 0, w, h);
    const accent = css('--accent') || '#2de1fc';
    const dim = css('--info') || '#64748b';
    ctx.font = `${9 * dpr}px ${css('--mono') || 'monospace'}`;
    ctx.fillStyle = dim;
    ctx.lineWidth = 1;

    const bpm = transport.state.bpm;
    if (bpm > 0) {
      // Bars and beats: label bars, tick beats while a beat is wide enough.
      const beat = 60 / bpm;
      const bar = beat * 4;
      const barPx = bar * pxPerSec;
      const labelEvery = barPx >= 56 ? 1 : barPx >= 28 ? 2 : barPx >= 14 ? 4 : barPx >= 7 ? 8 : 16;
      const firstBar = Math.floor(scrollX / bar);
      for (let b = firstBar; timeToX(b * bar) * dpr < w; b++) {
        const x = Math.round(timeToX(b * bar) * dpr) + 0.5;
        if (x >= 0) {
          const major = b % labelEvery === 0;
          ctx.strokeStyle = major ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.08)';
          ctx.beginPath();
          ctx.moveTo(x, major ? h * 0.35 : h * 0.6);
          ctx.lineTo(x, h);
          ctx.stroke();
          if (major) ctx.fillText(String(b + 1), x + 3 * dpr, h * 0.62);
        }
        if (beat * pxPerSec >= 9) {
          ctx.strokeStyle = 'rgba(255,255,255,.06)';
          for (let k = 1; k < 4; k++) {
            const bx = Math.round(timeToX(b * bar + k * beat) * dpr) + 0.5;
            if (bx < 0 || bx > w) continue;
            ctx.beginPath();
            ctx.moveTo(bx, h * 0.78);
            ctx.lineTo(bx, h);
            ctx.stroke();
          }
        }
      }
    } else {
      const target = 80 / pxPerSec;
      const steps = [0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300];
      const step = steps.find((s) => s >= target) || 600;
      const first = Math.floor(scrollX / step) * step;
      ctx.strokeStyle = 'rgba(255,255,255,.14)';
      for (let t = first; timeToX(t) * dpr < w; t += step) {
        const x = Math.round(timeToX(t) * dpr) + 0.5;
        if (x < 0) continue;
        ctx.beginPath();
        ctx.moveTo(x, h * 0.45);
        ctx.lineTo(x, h);
        ctx.stroke();
        ctx.fillText(fmtTime(t), x + 3 * dpr, h * 0.62);
      }
    }

    const loop = transport.state.loop;
    if (loop.end > loop.start) {
      const x0 = timeToX(loop.start) * dpr;
      const x1 = timeToX(loop.end) * dpr;
      ctx.fillStyle = loop.enabled ? 'rgba(45,225,252,.22)' : 'rgba(45,225,252,.09)';
      ctx.fillRect(x0, 0, x1 - x0, h * 0.4);
      ctx.strokeStyle = accent;
      ctx.beginPath();
      ctx.moveTo(x0 + 0.5, 0);
      ctx.lineTo(x0 + 0.5, h * 0.4);
      ctx.moveTo(x1 + 0.5, 0);
      ctx.lineTo(x1 + 0.5, h * 0.4);
      ctx.stroke();
    }

    const tl = timeline();
    if (tl) {
      ctx.fillStyle = accent;
      for (const loc of tl.locators) {
        const x = timeToX(loc.time) * dpr;
        if (x < -8 || x > w + 8) continue;
        ctx.save();
        ctx.translate(x, h * 0.3);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-3 * dpr, -3 * dpr, 6 * dpr, 6 * dpr);
        ctx.restore();
      }
    }
  }

  // --- audio lanes -----------------------------------------------------------------

  function buildPeaks(mediaId) {
    if (peaks.has(mediaId)) return peaks.get(mediaId);
    const buffer = transport.getBuffer(mediaId);
    if (!buffer) return null;
    const data = buffer.getChannelData(0);
    const out = new Float32Array(PEAK_BUCKETS * 2);
    const per = Math.max(1, Math.floor(data.length / PEAK_BUCKETS));
    for (let b = 0; b < PEAK_BUCKETS; b++) {
      let lo = 0;
      let hi = 0;
      const start = b * per;
      const end = Math.min(data.length, start + per);
      for (let i = start; i < end; i += 4) {
        const v = data[i];
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
      out[b * 2] = lo;
      out[b * 2 + 1] = hi;
    }
    peaks.set(mediaId, out);
    return out;
  }

  function rowGeom() {
    const n = Math.max(1, tracks().length);
    const H = audioCanvas.clientHeight;
    return { n, rowH: H / n };
  }

  function regionLabel(track, r) {
    if (r.fx === 'vst') return 'vst mix';
    const e = track.fx.find((x) => x.id === r.fx);
    return e ? `${FX_KINDS[e.kind] ? FX_KINDS[e.kind].label : e.kind} · ${r.param}` : r.param;
  }

  function renderAudio() {
    const dpr = fitCanvas(audioCanvas);
    const ctx = audioCanvas.getContext('2d');
    const w = audioCanvas.width;
    const h = audioCanvas.height;
    ctx.clearRect(0, 0, w, h);
    const accent = css('--accent') || '#2de1fc';
    const list = tracks();
    const n = Math.max(1, list.length);
    const rowH = h / n;
    const anySolo = list.some((t) => t.solo);
    ctx.font = `${9 * dpr}px ${css('--display-font') || 'monospace'}`;

    list.forEach((track, ti) => {
      const y0 = ti * rowH;
      const dimmed = track.muted || (anySolo && !track.solo);
      ctx.fillStyle = ti % 2 ? 'rgba(255,255,255,.012)' : 'rgba(255,255,255,0)';
      ctx.fillRect(0, y0, w, rowH);
      if (sel && sel.kind === 'track' && sel.id === track.id) {
        ctx.fillStyle = 'rgba(45,225,252,.04)';
        ctx.fillRect(0, y0, w, rowH);
      }
      ctx.strokeStyle = 'rgba(255,255,255,.05)';
      ctx.beginPath();
      ctx.moveTo(0, Math.round(y0 + rowH) + 0.5);
      ctx.lineTo(w, Math.round(y0 + rowH) + 0.5);
      ctx.stroke();

      // Grid shadow under the clips when the tempo is known.
      if (transport.state.bpm > 0) {
        const bar = (60 / transport.state.bpm) * 4;
        if (bar * pxPerSec >= 10) {
          ctx.strokeStyle = 'rgba(255,255,255,.035)';
          for (let b = Math.floor(scrollX / bar); timeToX(b * bar) * dpr < w; b++) {
            const x = Math.round(timeToX(b * bar) * dpr) + 0.5;
            if (x < 0) continue;
            ctx.beginPath();
            ctx.moveTo(x, y0);
            ctx.lineTo(x, y0 + rowH);
            ctx.stroke();
          }
        }
      }

      const clipTop = y0 + rowH * REGION_BAND;
      const clipH = rowH * (1 - REGION_BAND) - 2 * dpr;
      for (const clip of track.clips) {
        const x0 = timeToX(clip.start) * dpr;
        const x1 = timeToX(clip.end) * dpr;
        if (x1 < 0 || x0 > w) continue;
        const selected = sel && sel.kind === 'clip' && sel.id === clip.id;
        ctx.globalAlpha = dimmed ? 0.45 : 1;
        ctx.fillStyle = selected ? 'rgba(45,225,252,.16)' : 'rgba(45,225,252,.07)';
        ctx.fillRect(x0, clipTop, x1 - x0, clipH);
        ctx.strokeStyle = selected ? accent : 'rgba(45,225,252,.4)';
        ctx.strokeRect(x0 + 0.5, clipTop + 0.5, x1 - x0 - 1, clipH - 1);

        const pk = buildPeaks(clip.media);
        const buffer = transport.getBuffer(clip.media);
        if (pk && buffer) {
          ctx.strokeStyle = 'rgba(45,225,252,.55)';
          ctx.beginPath();
          const mid = clipTop + clipH / 2;
          const span = clipH * 0.42 * clip.gain;
          const clipDur = clip.end - clip.start;
          const px0 = Math.max(0, x0);
          const px1 = Math.min(w, x1);
          for (let x = px0; x <= px1; x += 2) {
            const t = clip.offset + ((x - x0) / (x1 - x0)) * clipDur;
            const b = Math.min(PEAK_BUCKETS - 1, Math.floor((t / buffer.duration) * PEAK_BUCKETS));
            ctx.moveTo(x + 0.5, mid + pk[b * 2] * span);
            ctx.lineTo(x + 0.5, mid + pk[b * 2 + 1] * span);
          }
          ctx.stroke();
        }
        if (clip.name && x1 - x0 > 40 * dpr) {
          ctx.fillStyle = 'rgba(232,236,244,.75)';
          ctx.fillText(clip.name.replace(/\.[a-z0-9]+$/i, '').slice(0, 40), Math.max(x0, 0) + 4 * dpr, clipTop + 10 * dpr);
        }
        ctx.globalAlpha = 1;
      }

      // Regions: a band across the top of the row.
      const bandTop = y0 + 2 * dpr;
      const bandH = rowH * REGION_BAND - 3 * dpr;
      for (const r of track.regions) {
        const x0 = timeToX(r.start) * dpr;
        const x1 = timeToX(r.end) * dpr;
        if (x1 < 0 || x0 > w) continue;
        const selected = sel && sel.kind === 'region' && sel.id === r.id;
        ctx.fillStyle = selected ? 'rgba(255,45,149,.34)' : 'rgba(255,45,149,.17)';
        ctx.fillRect(x0, bandTop, x1 - x0, bandH);
        ctx.strokeStyle = selected ? '#ff2d95' : 'rgba(255,45,149,.55)';
        ctx.strokeRect(x0 + 0.5, bandTop + 0.5, x1 - x0 - 1, bandH - 1);
        if (x1 - x0 > 30 * dpr) {
          ctx.fillStyle = 'rgba(255,220,236,.85)';
          ctx.fillText(regionLabel(track, r), Math.max(x0, 0) + 4 * dpr, bandTop + bandH * 0.72);
        }
      }
    });
  }

  function renderVisual() {
    const rows = [];
    for (const clip of visualClips()) {
      const left = timeToX(clip.start);
      const width = (clip.end - clip.start) * pxPerSec;
      if (left + width < 0 || left > visualLane.clientWidth) continue;
      const meta = engine.sceneList.find((s) => s.id === clip.scene);
      const selected = sel && sel.kind === 'clip' && sel.id === clip.id;
      rows.push(
        `<div class="tl-clip${selected ? ' selected' : ''}" data-clip="${clip.id}" ` +
          `style="left:${left.toFixed(1)}px;width:${Math.max(8, width).toFixed(1)}px">${meta ? meta.name : clip.scene}</div>`
      );
    }
    visualLane.innerHTML = rows.join('');
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  function renderHeads() {
    const list = tracks();
    const rulerH = ruler.clientHeight || 18;
    const visualH = visualLane.clientHeight || 20;
    const { rowH } = rowGeom();
    const anySolo = list.some((t) => t.solo);
    const html = [
      `<div class="tl-head spacer" style="height:${rulerH}px;flex:0 0 ${rulerH}px"></div>`,
      `<div class="tl-head spacer" style="height:${visualH}px;flex:0 0 ${visualH}px"><span class="nm">SCENES</span></div>`,
    ];
    for (const t of list) {
      const selected = sel && sel.kind === 'track' && sel.id === t.id;
      html.push(
        `<div class="tl-head${selected ? ' selected' : ''}" data-track="${esc(t.id)}" style="height:${rowH}px;flex:0 0 ${rowH}px" title="${esc(t.name)}, click to edit effects, double-click to rename">` +
          `<span class="nm">${esc(t.name)}</span>` +
          `<button class="ms${t.muted ? ' on' : ''}" data-m title="mute">M</button>` +
          `<button class="ms${t.solo ? ' on' : ''}${anySolo && !t.solo ? ' dim' : ''}" data-s title="solo">S</button>` +
          `</div>`
      );
    }
    heads.innerHTML = html.join('');
  }

  function renderBar() {
    const bpm = transport.state.bpm;
    if (document.activeElement !== bpmInput) bpmInput.value = bpm > 0 ? String(Math.round(bpm * 10) / 10) : '';
    if (snapSel.value !== transport.state.snap) snapSel.value = transport.state.snap;
  }

  function render() {
    renderBar();
    renderRuler();
    renderVisual();
    renderAudio();
    renderHeads();
  }

  function edited() {
    transport.refresh();
    onEdit && onEdit();
    render();
  }

  function select(next) {
    sel = next;
    render();
    if (onSelect) {
      if (!sel) onSelect(null);
      else if (sel.kind === 'track') onSelect(`track:${sel.id}`);
      else if (sel.kind === 'region') onSelect(`region:${sel.track}:${sel.id}`);
      else onSelect(null);
    }
  }

  function setHint(text, ms = 4000) {
    hint.textContent = text || '';
    clearTimeout(setHint.t);
    if (text) setHint.t = setTimeout(() => (hint.textContent = ''), ms);
  }

  // --- interactions ---------------------------------------------------------

  // Ruler: drag scrubs; Shift+drag sets the loop region; double-click drops a
  // locator; a locator click within 6 px jumps to it.
  let rulerDrag = null;
  ruler.addEventListener('pointerdown', (e) => {
    ruler.setPointerCapture(e.pointerId);
    const t = xToTime(e.offsetX);
    if (e.shiftKey) {
      rulerDrag = { mode: 'loop', from: snap(t) };
      transport.setLoop(rulerDrag.from, rulerDrag.from, false);
    } else {
      const tl = timeline();
      const near = tl && tl.locators.find((l) => Math.abs(timeToX(l.time) - e.offsetX) < 6);
      if (near) {
        transport.seek(near.time);
      } else {
        rulerDrag = { mode: 'scrub' };
        transport.seek(t);
      }
    }
    render();
  });
  ruler.addEventListener('pointermove', (e) => {
    if (!rulerDrag) return;
    const t = xToTime(e.offsetX);
    if (rulerDrag.mode === 'scrub') transport.seek(t);
    else {
      const s = snap(t);
      transport.setLoop(Math.min(rulerDrag.from, s), Math.max(rulerDrag.from, s), true);
      const tl = timeline();
      if (tl) tl.loop = transport.state.loop;
    }
    render();
  });
  ruler.addEventListener('pointerup', () => {
    if (rulerDrag && rulerDrag.mode === 'loop') edited();
    rulerDrag = null;
  });
  ruler.addEventListener('dblclick', (e) => {
    const tl = timeline();
    if (!tl) return;
    tl.locators.push({ id: uid('loc'), name: '', time: snap(xToTime(e.offsetX)), color: null });
    edited();
  });

  // Zoom / pan anywhere on the lanes.
  lanes.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      if (e.shiftKey) {
        scrollX = Math.max(0, scrollX + (e.deltaY || e.deltaX) / pxPerSec);
      } else {
        const rect = lanes.getBoundingClientRect();
        const anchorT = xToTime(e.clientX - rect.left);
        pxPerSec = Math.min(400, Math.max(1.5, pxPerSec * (e.deltaY > 0 ? 1 / 1.2 : 1.2)));
        scrollX = Math.max(0, anchorT - (e.clientX - rect.left) / pxPerSec);
      }
      render();
    },
    { passive: false }
  );

  // Visual clips: drag body to move, edges to resize; double-click empty lane
  // lays the current scene down.
  let clipDrag = null;
  visualLane.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('[data-clip]');
    if (!el) return;
    const clip = visualClips().find((c) => c.id === el.dataset.clip);
    if (!clip) return;
    sel = { kind: 'clip', id: clip.id, track: 'visual' };
    const rect = el.getBoundingClientRect();
    const atStart = e.clientX - rect.left < EDGE;
    const atEnd = rect.right - e.clientX < EDGE;
    clipDrag = {
      clip,
      mode: atEnd ? 'end' : atStart ? 'start' : 'move',
      grabT: xToTime(e.clientX - visualLane.getBoundingClientRect().left) - clip.start,
    };
    visualLane.setPointerCapture(e.pointerId);
    render();
  });
  visualLane.addEventListener('pointermove', (e) => {
    if (!clipDrag) return;
    const t = xToTime(e.clientX - visualLane.getBoundingClientRect().left);
    const c = clipDrag.clip;
    if (clipDrag.mode === 'move') {
      const dur = c.end - c.start;
      c.start = snap(t - clipDrag.grabT);
      c.end = c.start + dur;
    } else if (clipDrag.mode === 'end') {
      c.end = Math.max(c.start + 0.5, snap(t));
    } else {
      c.start = Math.min(c.end - 0.5, snap(t));
    }
    renderVisual();
  });
  visualLane.addEventListener('pointerup', () => {
    if (clipDrag) edited();
    clipDrag = null;
  });
  visualLane.addEventListener('dblclick', (e) => {
    if (e.target.closest('[data-clip]')) return;
    const t = snap(xToTime(e.offsetX));
    const scene = engine.currentScene ? engine.currentScene.id : engine.sceneList[0].id;
    visualClips().push({ id: uid('v'), scene, start: t, end: t + 8, transition: { type: 'cut', duration: 0 } });
    edited();
  });

  // Drops: scenes from the bank onto the visual lane; kit samples onto a
  // track; files from the desktop anywhere on the band (one track per file).
  for (const lane of [visualLane, audioCanvas, heads, ruler]) {
    lane.addEventListener('dragover', (e) => {
      e.preventDefault();
      root.classList.add('droppable');
    });
    lane.addEventListener('dragleave', () => root.classList.remove('droppable'));
  }
  visualLane.addEventListener('drop', (e) => {
    e.preventDefault();
    root.classList.remove('droppable');
    const scene = e.dataTransfer.getData('application/x-sway-scene');
    if (scene) {
      const t = snap(xToTime(e.offsetX));
      visualClips().push({ id: uid('v'), scene, start: t, end: t + 8, transition: { type: 'cut', duration: 0 } });
      edited();
      return;
    }
    dropFiles(e, null);
  });
  function dropFiles(e, trackId) {
    const files = [...(e.dataTransfer.files || [])];
    if (!files.length) return false;
    const paths = files.map((f) => window.swaycommand.files.pathOf(f)).filter(Boolean);
    if (!paths.length) return false;
    const rect = lanes.getBoundingClientRect();
    const t = snap(xToTime(e.clientX - rect.left));
    onImport && onImport(paths, { at: t, trackId });
    return true;
  }
  for (const el of [heads, ruler]) {
    el.addEventListener('drop', (e) => {
      e.preventDefault();
      root.classList.remove('droppable');
      dropFiles(e, null);
    });
  }

  // Audio lanes: hit-test regions (top band), then clips; drag moves, the
  // trailing edge resizes; Shift+drag marks a section; click empty selects
  // the track.
  let audioDrag = null;
  function rowAt(y) {
    const { n, rowH } = rowGeom();
    const i = Math.max(0, Math.min(n - 1, Math.floor(y / rowH)));
    return { track: tracks()[i] || null, i, rowH, inBand: y - i * rowH < rowH * REGION_BAND };
  }
  audioCanvas.addEventListener('pointerdown', (e) => {
    const t = xToTime(e.offsetX);
    const { track, inBand } = rowAt(e.offsetY);
    if (!track) return;
    if (e.shiftKey) {
      audioDrag = { mode: 'region', track, from: snap(t), to: snap(t) };
      audioCanvas.setPointerCapture(e.pointerId);
      return;
    }
    const region = inBand ? track.regions.find((r) => t >= r.start && t < r.end) : null;
    if (region) {
      const endX = timeToX(region.end);
      audioDrag = { mode: endX - e.offsetX < EDGE ? 'regionEnd' : 'regionMove', region, track, grabT: t - region.start };
      audioCanvas.setPointerCapture(e.pointerId);
      select({ kind: 'region', id: region.id, track: track.id });
      return;
    }
    const clip = track.clips.find((c) => t >= c.start && t < c.end);
    if (clip) {
      const endX = timeToX(clip.end);
      audioDrag = { clip, track, mode: endX - e.offsetX < EDGE ? 'end' : 'move', grabT: t - clip.start };
      audioCanvas.setPointerCapture(e.pointerId);
      sel = { kind: 'clip', id: clip.id, track: track.id };
      render();
      return;
    }
    select({ kind: 'track', id: track.id });
  });
  audioCanvas.addEventListener('pointermove', (e) => {
    if (!audioDrag) return;
    const t = xToTime(e.offsetX);
    const d = audioDrag;
    if (d.mode === 'region') {
      d.to = snap(t);
      renderAudio();
      // live preview: draw the pending band
      const ctx = audioCanvas.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const i = tracks().indexOf(d.track);
      const { rowH } = rowGeom();
      const x0 = timeToX(Math.min(d.from, d.to)) * dpr;
      const x1 = timeToX(Math.max(d.from, d.to)) * dpr;
      ctx.fillStyle = 'rgba(255,45,149,.25)';
      ctx.fillRect(x0, i * rowH * dpr + 2 * dpr, x1 - x0, rowH * REGION_BAND * dpr - 3 * dpr);
      return;
    }
    if (d.mode === 'regionMove') {
      const dur = d.region.end - d.region.start;
      d.region.start = snap(t - d.grabT);
      d.region.end = d.region.start + dur;
    } else if (d.mode === 'regionEnd') {
      d.region.end = Math.max(d.region.start + 0.1, snap(t));
    } else if (d.mode === 'move') {
      const dur = d.clip.end - d.clip.start;
      d.clip.start = snap(t - d.grabT);
      d.clip.end = d.clip.start + dur;
    } else {
      d.clip.end = Math.max(d.clip.start + 0.25, snap(t));
    }
    renderAudio();
  });
  audioCanvas.addEventListener('pointerup', () => {
    const d = audioDrag;
    audioDrag = null;
    if (!d) return;
    if (d.mode === 'region') {
      const a = Math.min(d.from, d.to);
      const b = Math.max(d.from, d.to);
      if (b - a < 0.05) {
        render();
        return;
      }
      const t = d.track;
      let fx = null;
      let param = null;
      let value = 1;
      if (t.fx.length) {
        const e = t.fx[0];
        fx = e.id;
        param = 'mix' in e.params ? 'mix' : Object.keys(e.params)[0];
        value = param === 'mix' ? 1 : e.params[param];
      } else if (t.vst.plugins.length) {
        fx = 'vst';
        param = 'mix';
      }
      if (!fx) {
        setHint('Add an effect to the track first (click its head), then Shift+drag to mark the section it plays on.');
        select({ kind: 'track', id: t.id });
        return;
      }
      const r = transport.addRegion(t.id, a, b, fx, param, value);
      edited();
      select({ kind: 'region', id: r.id, track: t.id });
      return;
    }
    edited();
  });
  audioCanvas.addEventListener('dblclick', (e) => {
    const { track } = rowAt(e.offsetY);
    if (track) select({ kind: 'track', id: track.id });
  });
  audioCanvas.addEventListener('drop', async (e) => {
    e.preventDefault();
    root.classList.remove('droppable');
    const { track } = rowAt(e.offsetY);
    const mediaId = e.dataTransfer.getData('application/x-sway-media');
    if (mediaId && track) {
      await placeMedia(mediaId, track.id, snap(xToTime(e.offsetX)));
      return;
    }
    dropFiles(e, track ? track.id : null);
  });

  // Lays a media entry down as a clip on a track at `t`.
  async function placeMedia(mediaId, trackId, t, name) {
    const buffer = await store.loadMediaBuffer(mediaId);
    if (!buffer) return null;
    const track = transport.trackById(trackId) || tracks()[0];
    if (!track) return null;
    const media = store.project().media.find((m) => m.id === mediaId);
    const clip = {
      id: uid('c'),
      name: name || (media ? media.name : ''),
      media: mediaId,
      start: t,
      end: t + buffer.duration,
      offset: 0,
      gain: 1,
      fadeIn: 0,
      fadeOut: 0,
    };
    track.clips.push(clip);
    edited();
    return clip;
  }

  // Heads: click selects the track; M / S toggle; double-click renames.
  heads.addEventListener('click', (e) => {
    const head = e.target.closest('[data-track]');
    if (!head) return;
    const id = head.dataset.track;
    const t = transport.trackById(id);
    if (!t) return;
    if (e.target.closest('[data-m]')) {
      transport.setTrackMute(id, !t.muted);
      onEdit && onEdit();
      render();
      return;
    }
    if (e.target.closest('[data-s]')) {
      transport.setTrackSolo(id, !t.solo);
      onEdit && onEdit();
      render();
      return;
    }
    select({ kind: 'track', id });
  });
  heads.addEventListener('dblclick', (e) => {
    const head = e.target.closest('[data-track]');
    if (!head || e.target.closest('.ms')) return;
    const t = transport.trackById(head.dataset.track);
    if (!t) return;
    const nm = head.querySelector('.nm');
    const input = document.createElement('input');
    input.type = 'text';
    input.value = t.name;
    input.style.cssText = 'width:100%;min-width:0;background:#0a0d15;color:var(--text);border:1px solid var(--line);font:10px var(--mono);padding:1px 3px';
    nm.replaceWith(input);
    input.focus();
    input.select();
    const done = () => {
      t.name = input.value.trim() || t.name;
      onEdit && onEdit();
      render();
    };
    input.addEventListener('blur', done);
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') input.blur();
      if (ev.key === 'Escape') {
        input.value = t.name;
        input.blur();
      }
      ev.stopPropagation();
    });
  });

  // Toolbar.
  $('#tl-import').addEventListener('click', () => onImport && onImport(null, { at: snap(transport.state.position), trackId: null }));
  $('#tl-addtrack').addEventListener('click', () => {
    const t = transport.addTrack();
    edited();
    if (t) select({ kind: 'track', id: t.id });
  });
  bpmInput.addEventListener('change', () => {
    transport.setBpm(Number(bpmInput.value) || 0);
    edited();
  });
  bpmInput.addEventListener('keydown', (e) => e.stopPropagation());
  $('#tl-tap').addEventListener('click', () => {
    const now = performance.now();
    if (taps.length && now - taps[taps.length - 1] > 2000) taps.length = 0;
    taps.push(now);
    if (taps.length > 8) taps.shift();
    if (taps.length >= 3) {
      const span = taps[taps.length - 1] - taps[0];
      const bpm = Math.round((60000 / (span / (taps.length - 1))) * 10) / 10;
      transport.setBpm(bpm);
      edited();
      setHint(`${bpm} bpm`);
    } else {
      setHint('tap...');
    }
  });
  snapSel.addEventListener('change', () => {
    transport.setSnap(snapSel.value);
    onEdit && onEdit();
    render();
  });

  let lastPlayheadX = -1;
  return {
    render,
    edited,
    placeMedia,
    setHint,

    updatePlayhead() {
      const x = timeToX(transport.state.position);
      if (Math.abs(x - lastPlayheadX) < 0.5) return;
      lastPlayheadX = x;
      const w = lanes.clientWidth;
      if (x < 0 || x > w) {
        if (transport.state.playing && x > w) {
          scrollX = transport.state.position;
          render();
        }
        playhead.style.opacity = x < 0 ? '0' : '1';
      } else {
        playhead.style.opacity = '1';
      }
      playhead.style.transform = `translateX(${Math.max(0, Math.min(w, x)).toFixed(1)}px)`;
    },

    deleteSelected() {
      if (!sel) return false;
      if (sel.kind === 'clip') {
        const va = visualClips();
        let idx = va.findIndex((c) => c.id === sel.id);
        if (idx >= 0) va.splice(idx, 1);
        else {
          for (const t of tracks()) {
            idx = t.clips.findIndex((c) => c.id === sel.id);
            if (idx >= 0) {
              t.clips.splice(idx, 1);
              break;
            }
          }
          if (idx < 0) return false;
        }
      } else if (sel.kind === 'region') {
        if (!transport.removeRegion(sel.track, sel.id)) return false;
      } else if (sel.kind === 'track') {
        // Tracks go from their panel (DELETE), never from a stray keypress.
        return false;
      }
      sel = null;
      edited();
      onSelect && onSelect(null);
      return true;
    },

    nudgeSelected(dt) {
      if (!sel || sel.kind === 'track') return false;
      const step = transport.state.bpm > 0 ? transport.beatSeconds() : 0.5;
      const d = Math.sign(dt) * step;
      let item = null;
      if (sel.kind === 'clip') {
        item = visualClips().find((c) => c.id === sel.id);
        if (!item) for (const t of tracks()) item = item || t.clips.find((c) => c.id === sel.id);
      } else {
        const t = transport.trackById(sel.track);
        item = t && t.regions.find((r) => r.id === sel.id);
      }
      if (!item) return false;
      const dur = item.end - item.start;
      item.start = Math.max(0, item.start + d);
      item.end = item.start + dur;
      edited();
      return true;
    },

    hasSelection() {
      return sel !== null;
    },
    selection() {
      return sel;
    },
    clearSelection() {
      sel = null;
      render();
    },
    selectTrack(id) {
      select({ kind: 'track', id });
    },
    selectRegion(trackId, regionId) {
      select({ kind: 'region', id: regionId, track: trackId });
    },
    invalidateMedia(mediaId) {
      peaks.delete(mediaId);
    },
  };
}
