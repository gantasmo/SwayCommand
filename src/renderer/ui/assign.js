// Assignment rail, the editor for whatever is selected: a deck control
// (pad / knob / button / gesture dimension), a timeline track, a section
// (region) on a track, or a .gan plugin control. Pads pick an action (sample
// / visual / punch / scene event / stem / track punch), knobs pick a
// continuous target with a range, buttons learn a CC and pick a toggle,
// gesture dimensions and .gan controls hold modulation routes, tracks hold
// their effect chain and VST chain, sections hold one parameter and a value.
// All edits mutate the project's live objects (the router and the transport
// hold the same references) and report through onChanged so the deck labels
// and the dirty flag stay true.
//
// BIND is the short path from "this effect" to "that control": press BIND on
// any track-effect parameter and the next control you click on the deck (or
// touch on the Sway) takes it, a pad becomes a punch to the value shown, a
// knob a continuous control over the parameter's range, a gesture a route.

import { parseTarget, QUANTS } from '../../shared/swayproject.js';
import { FX_KINDS, FX_ORDER } from '../../shared/trackfx.js';

const $ = (sel) => document.querySelector(sel);

// Control ids (pad:5, knob:3, button:2, xy:x, gesture:press, track:<id>,
// region:<track>:<id>, gan:<plugin>:<ctl>) are a different grammar from
// assignment targets, parseTarget rejects them by design.
function ctlParts(id) {
  const at = id.indexOf(':');
  return { ns: id.slice(0, at), key: id.slice(at + 1) };
}

const HEADER_NAMES = {
  'xy:x': 'X',
  'xy:y': 'Y',
  'gesture:pulse': 'PULSE',
  'gesture:press': 'PRESS',
  'gesture:sway': 'SWAY',
};

const ENGINE_TARGETS = [
  ['engine:hue', 'palette hue', 0, 1],
  ['engine:fadeTime', 'fade length', 1, 8],
  ['engine:intensity', 'intensity', 0, 1],
];
const SAMPLER_TARGETS = [
  ['sampler:master', 'kit level', 0, 1],
  ['sampler:cutoff', 'kit filter', 0, 1],
  ['sampler:rate', 'kit rate', 0, 1],
  ['sampler:send', 'kit delay', 0, 1],
];
const TOGGLE_TARGETS = [
  ['engine:fxEnabled', 'rack active'],
  ['engine:autoVJ', 'auto rotation'],
  ['synth:enabled', 'synth notes'],
  ['transport:playPause', 'play / pause'],
  ['transport:stop', 'stop'],
];
const QUANT_LABELS = { none: 'now', beat: 'next beat', bar: 'next bar', twoBars: 'next 2 bars', fourBars: 'next 4 bars' };

export function createAssign(deps) {
  const { router, sampler, synth, engine, transport, store, fxRanges, onChanged } = deps;
  let selected = null;
  let follow = true;
  let learning = false;
  // BIND arming: { track, fx, param, lo, hi, value, label }
  let pendingBind = null;
  let vstList = null; // scanned plugins, fetched on first track panel
  let vstStatus = null;
  let vstBusy = '';
  let vstParamsOpen = null; // { track, index, rows }, the inline parameter editor

  const header = $('#assign-target');
  const body = $('#assign-body');

  function asg() {
    return router.getAssignments();
  }
  function project() {
    return store.project();
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }
  function fmt(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return '--';
    if (Math.abs(n) >= 1000) return String(Math.round(n));
    if (Math.abs(n) >= 100) return n.toFixed(1);
    return n.toFixed(2);
  }

  function trackOf(id) {
    return transport.trackById(id);
  }
  function ganControl(id) {
    // gan:<plugin>:<ctl>[:axis]
    const parts = id.split(':');
    const plugin = (project() && project().plugins.find((g) => g.id === parts[1])) || null;
    const ctl = plugin && plugin.controls.find((c) => c.id === parts[2]);
    return { plugin, ctl, axis: parts[3] || null };
  }

  function headerName(target) {
    if (!target) return 'SELECT A CONTROL';
    if (HEADER_NAMES[target]) return HEADER_NAMES[target];
    const t = ctlParts(target);
    if (t.ns === 'pad') return `PAD ${Number(t.key)}`; // pads read 0-15, as the deck is numbered
    if (t.ns === 'knob') return `KNOB ${Number(t.key) + 1}`;
    if (t.ns === 'button') return `BUTTON ${Number(t.key) + 1}`;
    if (t.ns === 'track') {
      const tr = trackOf(t.key);
      return tr ? `TRACK · ${tr.name.toUpperCase()}` : 'TRACK';
    }
    if (t.ns === 'region') return 'SECTION';
    if (t.ns === 'gan') {
      const { plugin, ctl } = ganControl(target);
      return `${plugin ? plugin.name.toUpperCase() : 'PLUGIN'} · ${ctl ? ctl.name.toUpperCase() : t.key}`;
    }
    return target.toUpperCase();
  }

  function numericFxOptions(current) {
    return Object.entries(fxRanges)
      .filter(([, spec]) => Array.isArray(spec))
      .map(([key, spec]) => `<option value="fx:${key}" data-min="${spec[0]}" data-max="${spec[1]}"${`fx:${key}` === current ? ' selected' : ''}>${key}</option>`)
      .join('');
  }

  function booleanFxOptions(current) {
    return Object.entries(fxRanges)
      .filter(([, spec]) => spec === true)
      .map(([key]) => `<option value="fx:${key}"${`fx:${key}` === current ? ' selected' : ''}>${key}</option>`)
      .join('');
  }

  // Scenes declare their own controls in meta.controls, so the panel lists a
  // scene's parameters and events without ever instancing the scene.
  function scenesWith(kind) {
    return engine.sceneList.filter((m) => m.controls && Array.isArray(m.controls[kind]) && m.controls[kind].length);
  }
  function sceneParamOptions(current) {
    return scenesWith('params')
      .map((m) => {
        const opts = m.controls.params
          .map((c) => {
            const v = `scene:${m.id}:${c.key}`;
            return `<option value="${esc(v)}" data-min="${c.min ?? 0}" data-max="${c.max ?? 1}"${v === current ? ' selected' : ''}>${esc(c.label || c.key)}</option>`;
          })
          .join('');
        return `<optgroup label="${esc(m.name.toUpperCase())}">${opts}</optgroup>`;
      })
      .join('');
  }
  function sceneActionOptions(current) {
    return scenesWith('actions')
      .map((m) => {
        const opts = m.controls.actions
          .map((c) => {
            const v = `scene:${m.id}:${c.key}`;
            return `<option value="${esc(v)}"${v === current ? ' selected' : ''}>${esc(c.label || c.key)}</option>`;
          })
          .join('');
        return `<optgroup label="${esc(m.name.toUpperCase())}">${opts}</optgroup>`;
      })
      .join('');
  }

  // Every track's continuous targets: gain, VST wet/dry, each chain param.
  function trackParamOptions(current) {
    return transport
      .tracks()
      .map((t) => {
        const rows = [
          `<option value="track:${esc(t.id)}:gain" data-min="0" data-max="1.5"${`track:${t.id}:gain` === current ? ' selected' : ''}>level</option>`,
        ];
        if (t.vst.plugins.length) rows.push(`<option value="track:${esc(t.id)}:vstmix" data-min="0" data-max="1"${`track:${t.id}:vstmix` === current ? ' selected' : ''}>vst wet / dry</option>`);
        for (const e of t.fx) {
          const spec = FX_KINDS[e.kind];
          if (!spec) continue;
          for (const [k, s] of Object.entries(spec.params)) {
            const v = `track:${t.id}:${e.id}:${k}`;
            rows.push(`<option value="${esc(v)}" data-min="${s[0]}" data-max="${s[1]}"${v === current ? ' selected' : ''}>${esc(spec.label)} · ${k}</option>`);
          }
        }
        return `<optgroup label="TRACK · ${esc(t.name.toUpperCase())}">${rows.join('')}</optgroup>`;
      })
      .join('');
  }
  function trackToggleOptions(current) {
    return transport
      .tracks()
      .map((t) => {
        const rows = [
          `<option value="track:${esc(t.id)}:mute"${`track:${t.id}:mute` === current ? ' selected' : ''}>mute</option>`,
          `<option value="track:${esc(t.id)}:solo"${`track:${t.id}:solo` === current ? ' selected' : ''}>solo</option>`,
        ];
        for (const e of t.fx) {
          const v = `track:${t.id}:${e.id}:enabled`;
          rows.push(`<option value="${esc(v)}"${v === current ? ' selected' : ''}>${esc(FX_KINDS[e.kind] ? FX_KINDS[e.kind].label : e.kind)} on / off</option>`);
        }
        return `<optgroup label="TRACK · ${esc(t.name.toUpperCase())}">${rows.join('')}</optgroup>`;
      })
      .join('');
  }

  function continuousTargetOptions(current) {
    const groups = [];
    groups.push(`<optgroup label="ENGINE">${ENGINE_TARGETS.map(([v, l, lo, hi]) => `<option value="${v}" data-min="${lo}" data-max="${hi}"${v === current ? ' selected' : ''}>${l}</option>`).join('')}</optgroup>`);
    groups.push(`<optgroup label="RACK">${numericFxOptions(current)}</optgroup>`);
    const manifest = synth.controlManifest().filter((c) => c.kind === 'range');
    groups.push(`<optgroup label="SYNTH">${manifest.map((c) => `<option value="synth:${c.key}" data-min="${c.min}" data-max="${c.max}"${`synth:${c.key}` === current ? ' selected' : ''}>${c.label} (${c.group.toLowerCase()})</option>`).join('')}</optgroup>`);
    groups.push(`<optgroup label="KIT">${SAMPLER_TARGETS.map(([v, l, lo, hi]) => `<option value="${v}" data-min="${lo}" data-max="${hi}"${v === current ? ' selected' : ''}>${l}</option>`).join('')}</optgroup>`);
    groups.push(trackParamOptions(current));
    const sc = sceneParamOptions(current);
    if (sc) groups.push(sc); // scene parameters, grouped by scene
    return groups.join('');
  }

  function sampleOptions(current) {
    const rows = sampler.listSamples().map((s) => `<option value="${esc(s.id)}"${s.id === current ? ' selected' : ''}>${esc(s.name)}</option>`);
    return `<option value=""${current ? '' : ' selected'}>-</option>${rows.join('')}`;
  }
  function mediaOptions(current) {
    const p = project();
    const rows = (p ? p.media : []).map((m) => `<option value="${esc(m.id)}"${m.id === current ? ' selected' : ''}>${esc(m.name)}</option>`);
    return `<option value=""${current ? '' : ' selected'}>-</option>${rows.join('')}`;
  }
  function trackOptions(current, allowNone) {
    const rows = transport.tracks().map((t) => `<option value="${esc(t.id)}"${t.id === current ? ' selected' : ''}>${esc(t.name)}</option>`);
    return (allowNone ? `<option value=""${current ? '' : ' selected'}>stem bus</option>` : '') + rows.join('');
  }

  function sceneOptions(current) {
    return engine.sceneList.map((s) => `<option value="${s.id}"${s.id === current ? ' selected' : ''}>${s.name}</option>`).join('');
  }

  // A learned override for this control, if any. Buttons keep their CC in
  // the slot itself, so only continuous dimensions have one here.
  function hasOverride(ctl) {
    if (!ctl || ctl.startsWith('button:')) return false;
    const o = deps.midi.getOverrides();
    return !!o[ctl];
  }

  function renderHeader() {
    const learnable = selected && (/^knob:|^xy:|^gesture:/.test(selected) || selected.startsWith('button:'));
    const clearable = selected && !/^track:|^region:/.test(selected);
    header.innerHTML =
      `<span>${esc(headerName(selected))}</span>` +
      `<button class="chip${follow ? ' on' : ''}" data-act="follow" title="Hardware touch selects here">FOLLOW</button>` +
      (learnable ? `<button class="chip${learning ? ' armed' : ''}" data-act="learn" title="Bind the next incoming CC">LEARN</button>` : '') +
      (learnable && hasOverride(selected) ? `<button class="chip" data-act="unlearn" title="Drop the learned CC and fall back to the factory map">UNLEARN</button>` : '') +
      (clearable ? '<button class="chip" data-act="clear">CLEAR</button>' : '');
  }

  function renderBody() {
    if (!selected) {
      body.innerHTML =
        '<div class="empty">Click a control on the deck, or touch it on the Sway, to edit what it does.<br><br>Click a track head on the timeline to add effects to that track and bind them to pads and knobs.</div>';
      return;
    }
    const t = ctlParts(selected);
    if (t.ns === 'pad') return renderPad(Number(t.key));
    if (t.ns === 'knob') return renderKnob(Number(t.key));
    if (t.ns === 'button') return renderButton(Number(t.key));
    if (t.ns === 'track') return renderTrack(t.key);
    if (t.ns === 'region') {
      const [trackId, regionId] = t.key.split(':');
      return renderRegion(trackId, regionId);
    }
    if (t.ns === 'gan') return renderGan(selected);
    return renderRoutes([selected]);
  }

  function bindNote() {
    if (!pendingBind) return '';
    return `<div class="assign-note"><b>BIND ARMED</b>, click a pad, a knob or a gesture chip on the deck (or touch it on the Sway) to put <b>${esc(pendingBind.label)}</b> on it. Esc cancels.</div>`;
  }

  // --- pads ------------------------------------------------------------------------

  function renderPad(i) {
    const a = asg().pads[i];
    const kind = a ? a.type : 'off';
    const rows = [
      bindNote(),
      `<div class="assign-row"><span>ACTION</span><select data-pad-kind>
        <option value="off"${kind === 'off' ? ' selected' : ''}>-</option>
        <option value="sample"${kind === 'sample' ? ' selected' : ''}>sample</option>
        <option value="stem"${kind === 'stem' ? ' selected' : ''}>stem (in sync)</option>
        <option value="scene"${kind === 'scene' ? ' selected' : ''}>visual</option>
        <option value="fxPunch"${kind === 'fxPunch' ? ' selected' : ''}>rack punch</option>
        <option value="trackFx"${kind === 'trackFx' ? ' selected' : ''}>track punch</option>
        <option value="sceneAction"${kind === 'sceneAction' ? ' selected' : ''}>scene event</option>
      </select></div>`,
    ];
    if (kind === 'sample') {
      const kit = sampler.getKit();
      const pad = kit.pads && kit.pads[i];
      rows.push(`<div class="assign-row"><span>SAMPLE</span><select data-pad-sample>${sampleOptions(pad && pad.id)}</select></div>`);
      if (pad && pad.id) {
        rows.push(`<div class="assign-row"><span>MODE</span><select data-pad-opt="mode">
          <option value="oneshot"${pad.mode === 'oneshot' ? ' selected' : ''}>one-shot</option>
          <option value="loop"${pad.mode === 'loop' ? ' selected' : ''}>loop</option>
          <option value="gate"${pad.mode === 'gate' ? ' selected' : ''}>gate</option>
        </select></div>`);
        rows.push(`<div class="assign-row"><span>GAIN</span><input type="range" data-pad-opt="gain" min="0" max="1.5" step="0.01" value="${pad.gain}"><b>${pad.gain.toFixed(2)}</b></div>`);
        rows.push(`<div class="assign-row"><span>CHOKE</span><input type="number" data-pad-opt="chokeGroup" min="0" max="8" step="1" value="${pad.chokeGroup ?? ''}" placeholder="-"></div>`);
        rows.push('<div class="assign-row"><span></span><button class="btn btn-ghost btn-small" data-pad-trig>TRIG</button></div>');
      }
    } else if (kind === 'stem') {
      rows.push(`<div class="assign-row"><span>STEM</span><select data-pad-stem>${mediaOptions(a.media)}</select></div>`);
      rows.push(`<div class="assign-row"><span>START</span><select data-pad-quant>${QUANTS.map((q) => `<option value="${q}"${a.quant === q ? ' selected' : ''}>${QUANT_LABELS[q]}</option>`).join('')}</select></div>`);
      rows.push(`<div class="assign-row"><span>MODE</span><select data-pad-stemmode>
        <option value="toggle"${a.mode === 'toggle' ? ' selected' : ''}>toggle</option>
        <option value="gate"${a.mode === 'gate' ? ' selected' : ''}>hold</option>
      </select></div>`);
      rows.push(`<div class="assign-row"><span>THROUGH</span><select data-pad-stemtrack>${trackOptions(a.track, true)}</select></div>`);
      rows.push(`<div class="assign-row"><span>GAIN</span><input type="range" data-pad-stemgain min="0" max="1.5" step="0.01" value="${a.gain}"><b>${Number(a.gain).toFixed(2)}</b></div>`);
      const st = transport.stemState(a.media);
      rows.push(`<div class="assign-row"><span></span><span style="min-width:0">${st === 'off' ? 'stopped · starts on the grid, in phase with the timeline' : st}</span></div>`);
    } else if (kind === 'scene') {
      rows.push(`<div class="assign-row"><span>VISUAL</span><select data-pad-scene>${sceneOptions(a.scene)}</select></div>`);
      rows.push(`<div class="assign-row"><span>ENTRY</span><select data-pad-trans>
        <option value="cut"${a.transition.type === 'cut' ? ' selected' : ''}>cut</option>
        <option value="crossfade"${a.transition.type === 'crossfade' ? ' selected' : ''}>fade</option>
      </select>${a.transition.type === 'crossfade' ? `<input type="number" data-pad-fade min="0.2" max="20" step="0.1" value="${a.transition.duration}"> s` : ''}</div>`);
    } else if (kind === 'sceneAction') {
      // A scene event fires only while its scene is on screen; the panel says so.
      rows.push(`<div class="assign-row"><span>EVENT</span><select data-pad-event>${sceneActionOptions(`scene:${a.scene}:${a.action}`)}</select></div>`);
      const on = engine.currentScene && engine.currentScene.id === a.scene;
      rows.push(`<div class="assign-row"><span></span><span style="min-width:0">${on ? 'fires now' : 'fires while that visual is on stage'}</span></div>`);
    } else if (kind === 'fxPunch') {
      const spec = (parseTarget(`fx:${a.param}`) && fxRanges[a.param]) || [0, 1];
      const [lo, hi] = Array.isArray(spec) ? spec : [0, 1];
      rows.push(`<div class="assign-row"><span>PARAM</span><select data-pad-param>${numericFxOptions(`fx:${a.param}`)}</select></div>`);
      rows.push(`<div class="assign-row"><span>VALUE</span><input type="range" data-pad-value min="${lo}" max="${hi}" step="${(hi - lo) / 200}" value="${a.value}"><b>${Number(a.value).toFixed(2)}</b></div>`);
    } else if (kind === 'trackFx') {
      const cur = `track:${a.track}:${a.fx}:${a.param}`;
      const opts = trackParamOptions(cur).replace(/track:[^"]+:gain"[^>]*>level<\/option>/g, '');
      const tr = trackOf(a.track);
      let lo = 0;
      let hi = 1;
      if (tr) {
        if (a.fx === 'vst') [lo, hi] = [0, 1];
        else {
          const e = tr.fx.find((x) => x.id === a.fx);
          const s = e && FX_KINDS[e.kind] && FX_KINDS[e.kind].params[a.param];
          if (s) [lo, hi] = [s[0], s[1]];
        }
      }
      rows.push(`<div class="assign-row"><span>PARAM</span><select data-pad-tparam>${opts}</select></div>`);
      rows.push(`<div class="assign-row"><span>VALUE</span><input type="range" data-pad-tvalue min="${lo}" max="${hi}" step="${(hi - lo) / 200}" value="${a.value}"><b>${fmt(a.value)}</b></div>`);
      rows.push('<div class="assign-row"><span></span><span style="min-width:0">held while the pad is down, released after</span></div>');
    }
    body.innerHTML = rows.join('');
  }

  function renderKnob(i) {
    const a = asg().knobs[i];
    const rows = [
      bindNote(),
      `<div class="assign-row"><span>TARGET</span><select data-knob-target>
        <option value=""${a ? '' : ' selected'}>-</option>${continuousTargetOptions(a && a.target)}
      </select></div>`,
    ];
    if (a) {
      rows.push(`<div class="assign-row"><span>RANGE</span><input type="number" data-knob-min step="any" value="${a.min}">, <input type="number" data-knob-max step="any" value="${a.max}"></div>`);
      rows.push(`<div class="assign-row"><span>CURVE</span><select data-knob-curve>
        <option value="linear"${a.curve === 'linear' ? ' selected' : ''}>linear</option>
        <option value="detent"${a.curve === 'detent' ? ' selected' : ''}>center detent</option>
      </select></div>`);
    }
    body.innerHTML = rows.join('');
  }

  function renderButton(i) {
    const b = asg().buttons[i];
    const rows = [
      `<div class="assign-row"><span>CC</span><b>${b.cc === null ? '-' : b.cc}</b><span style="min-width:0">${b.cc === null ? 'LEARN captures the hardware button' : ''}</span></div>`,
      `<div class="assign-row"><span>TARGET</span><select data-btn-target>
        <option value=""${b.action ? '' : ' selected'}>-</option>
        <optgroup label="SWITCHES">${TOGGLE_TARGETS.map(([v, l]) => `<option value="${v}"${b.action && b.action.target === v ? ' selected' : ''}>${l}</option>`).join('')}</optgroup>
        <optgroup label="RACK">${booleanFxOptions(b.action && b.action.target)}</optgroup>
        ${trackToggleOptions(b.action && b.action.target)}
        ${sceneActionOptions(b.action && b.action.target)}
      </select></div>`,
    ];
    body.innerHTML = rows.join('');
  }

  function renderRoutes(sources, prefixHtml) {
    const routes = asg().gestures;
    const rows = [prefixHtml || ''];
    for (const source of sources) {
      if (sources.length > 1) rows.push(`<div class="assign-sub">${esc(source.split(':').pop().toUpperCase())}</div>`);
      let any = false;
      routes.forEach((g, gi) => {
        if (g.source !== source) return;
        any = true;
        rows.push(
          `<div class="assign-list" data-route="${gi}">
            <div class="assign-row"><span>ROUTE</span><select data-route-target="${gi}">${continuousTargetOptions(g.target)}</select>
              <button class="btn btn-ghost btn-small" data-route-del="${gi}">✕</button></div>
            <div class="assign-row"><span>DEPTH</span><input type="number" data-route-min="${gi}" step="any" value="${g.min}">, <input type="number" data-route-max="${gi}" step="any" value="${g.max}">
              <input type="checkbox" data-route-on="${gi}"${g.enabled ? ' checked' : ''} title="active"></div>
          </div>`
        );
      });
      if (!any) rows.push('<div class="empty">No routes. This dimension can drive any engine, rack, synth, kit, track or scene parameter.</div>');
      rows.push(`<div class="assign-row"><span></span><button class="btn btn-ghost btn-small" data-route-add="${esc(source)}">ADD ROUTE</button></div>`);
    }
    body.innerHTML = rows.join('');
  }

  function renderGan(id) {
    const { plugin, ctl } = ganControl(id);
    if (!plugin || !ctl) {
      body.innerHTML = '<div class="empty">This plugin control is no longer in the project.</div>';
      return;
    }
    const sources = ctl.kind === 'xy' ? [`${id}:x`, `${id}:y`] : ctl.kind === 'xyz' ? [`${id}:x`, `${id}:y`, `${id}:z`] : [id];
    const live = sources.map((s) => `${s.split(':').pop()} ${router.ganValue(s).toFixed(2)}`).join(' · ');
    renderRoutes(sources, `<div class="assign-note">${esc(plugin.name)} · ${esc(ctl.kind)} · ${esc(live)}</div>`);
  }

  // --- tracks ----------------------------------------------------------------------

  function slider(attr, spec, value) {
    const [lo, hi, , unit] = spec;
    if (unit === 'enum') {
      return `<select ${attr}>${(spec.options || []).map((o, i) => `<option value="${i}"${Math.round(value) === i ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    }
    // Log-mapped slider for frequencies: the range input carries 0..1000.
    if (unit === 'hz') {
      const pos = Math.round((Math.log(value / lo) / Math.log(hi / lo)) * 1000);
      return `<input type="range" ${attr} data-log-lo="${lo}" data-log-hi="${hi}" min="0" max="1000" step="1" value="${Math.max(0, Math.min(1000, pos))}">`;
    }
    return `<input type="range" ${attr} min="${lo}" max="${hi}" step="${(hi - lo) / 200}" value="${value}">`;
  }
  function sliderValue(el) {
    if (el.dataset.logLo) {
      const lo = Number(el.dataset.logLo);
      const hi = Number(el.dataset.logHi);
      return lo * Math.pow(hi / lo, Number(el.value) / 1000);
    }
    return Number(el.value);
  }
  function unitText(unit, v) {
    if (unit === 'hz') return v >= 1000 ? `${(v / 1000).toFixed(2)}k` : `${Math.round(v)}`;
    if (unit === 'db') return `${v.toFixed(1)}dB`;
    if (unit === 'beats') return v >= 1 ? `${v}b` : `1/${Math.round(1 / v)}`;
    return fmt(v);
  }

  function boundBy(track, fxId, param) {
    // Which deck controls currently drive this parameter (for the readout).
    const out = [];
    const a = asg();
    a.pads.forEach((p, i) => {
      if (p && p.type === 'trackFx' && p.track === track.id && p.fx === fxId && p.param === param) out.push(`pad ${i}`);
    });
    const tgt = fxId === 'vst' ? `track:${track.id}:vstmix` : `track:${track.id}:${fxId}:${param}`;
    a.knobs.forEach((k, i) => {
      if (k && k.target === tgt) out.push(`knob ${i + 1}`);
    });
    a.gestures.forEach((g) => {
      if (g.target === tgt) out.push(HEADER_NAMES[g.source] ? HEADER_NAMES[g.source].toLowerCase() : g.source.split(':').slice(1).join(' '));
    });
    return out;
  }

  function renderTrack(id) {
    const t = trackOf(id);
    if (!t) {
      body.innerHTML = '<div class="empty">This track is gone.</div>';
      return;
    }
    const rows = [bindNote()];
    rows.push(`<div class="assign-row"><span>NAME</span><input type="text" data-tr-name value="${esc(t.name)}"></div>`);
    rows.push(`<div class="assign-row"><span>LEVEL</span><input type="range" data-tr-gain min="0" max="1.5" step="0.01" value="${t.gain}"><b>${t.gain.toFixed(2)}</b><button class="chip" data-bind-gain title="Put the level on a control">BIND</button></div>`);
    rows.push(`<div class="assign-row"><span></span><button class="chip${t.muted ? ' on' : ''}" data-tr-mute>MUTE</button><button class="chip${t.solo ? ' on' : ''}" data-tr-solo>SOLO</button><span style="flex:1"></span><button class="chip" data-tr-delete title="Remove this track">DELETE</button></div>`);

    // Live effect chain.
    rows.push(`<div class="assign-sub">EFFECTS <select data-fx-add class="chip" style="margin-left:auto"><option value="">+ add...</option>${FX_ORDER.map((k) => `<option value="${k}">${esc(FX_KINDS[k].label)}</option>`).join('')}</select></div>`);
    if (!t.fx.length) rows.push('<div class="assign-note">No effects yet. Add one, set it, then BIND a parameter to a pad (a held punch), a knob (continuous) or a gesture. Shift+drag on the track marks a section where it engages by itself.</div>');
    t.fx.forEach((e, ei) => {
      const spec = FX_KINDS[e.kind];
      if (!spec) return;
      const params = Object.entries(spec.params)
        .map(([k, s]) => {
          const bound = boundBy(t, e.id, k);
          const armed = pendingBind && pendingBind.fx === e.id && pendingBind.param === k && pendingBind.track === t.id;
          return `<div class="fx-param"><span title="${k}">${k}</span>${slider(`data-fx-param="${e.id}:${k}"`, Object.assign([...s], { options: spec.options && spec.options[k] }), e.params[k])}<b class="${bound.length ? 'bound' : ''}" title="${esc(bound.join(', '))}">${unitText(s[3], e.params[k])}</b><button class="chip${armed ? ' armed' : ''}" data-bind="${e.id}:${k}" title="${bound.length ? 'on ' + esc(bound.join(', ')) : 'Put this on a control'}">${bound.length ? '●' : 'BIND'}</button></div>`;
        })
        .join('');
      rows.push(
        `<div class="fx-entry${e.enabled ? '' : ' off'}" data-fx="${e.id}">
          <div class="fx-entry-head"><span class="nm">${esc(spec.label)}</span>
            <button class="chip${e.enabled ? ' on' : ''}" data-fx-on="${e.id}">${e.enabled ? 'ON' : 'OFF'}</button>
            <button class="chip" data-fx-move="${e.id}:-1" ${ei === 0 ? 'disabled' : ''}>▲</button>
            <button class="chip" data-fx-move="${e.id}:1" ${ei === t.fx.length - 1 ? 'disabled' : ''}>▼</button>
            <button class="chip" data-fx-del="${e.id}">✕</button></div>
          ${params}
        </div>`
      );
    });

    // VST chain (offline render through the sidecar).
    rows.push('<div class="assign-sub">VST3</div>');
    if (!vstStatus) {
      rows.push('<div class="assign-note">Checking for a pedalboard host...</div>');
      refreshVst();
    } else if (!vstStatus.ok) {
      rows.push(`<div class="assign-note">${esc(vstStatus.error || 'no host')} <button class="chip" data-vst-python>PICK PYTHON</button></div>`);
    } else {
      rows.push(`<div class="assign-row"><span>ADD</span><select data-vst-add><option value="">${vstList ? (vstList.length ? '+ plugin...' : 'no VST3 found') : 'scanning...'}</option>${(vstList || []).map((p) => `<option value="${esc(p.path)}">${esc(p.name)}${p.vendor ? ' · ' + esc(p.vendor) : ''}</option>`).join('')}</select><button class="chip" data-vst-rescan title="Scan the VST3 folders again">SCAN</button></div>`);
      t.vst.plugins.forEach((p, pi) => {
        const builtin = p.path.startsWith('builtin:');
        const open = vstParamsOpen && vstParamsOpen.track === t.id && vstParamsOpen.index === pi;
        rows.push(
          `<div class="vst-row"><span class="nm" title="${esc(p.path)}">${esc(p.name)}</span>` +
            `<button class="chip${open ? ' on' : ''}" data-vst-params="${pi}" title="Set the plugin’s parameters here">PARAMS</button>` +
            (builtin ? '' : `<button class="chip" data-vst-edit="${pi}" title="Open the plugin’s own window; its state is kept when it closes">EDIT</button>`) +
            `<button class="chip" data-vst-del="${pi}">✕</button></div>`
        );
        if (open) {
          if (!vstParamsOpen.rows) rows.push('<div class="assign-note">reading parameters...</div>');
          else if (!vstParamsOpen.rows.length) rows.push('<div class="assign-note">this plugin exposes no parameters</div>');
          for (const row of vstParamsOpen.rows || []) {
            const cur = p.params[row.name] !== undefined ? p.params[row.name] : row.raw;
            const hi = builtin ? Math.max(1, Math.abs(cur) * 2 || 1) : 1;
            rows.push(`<div class="fx-param"><span title="${esc(row.name)}">${esc(row.name)}</span><input type="range" data-vst-p="${pi}:${esc(row.name)}" min="0" max="${hi}" step="${hi / 200}" value="${cur}"><b>${fmt(cur)}</b></div>`);
          }
        }
      });
      if (t.vst.plugins.length) {
        const rendered = Object.keys(t.vst.renders).length;
        const need = new Set(t.clips.map((c) => c.media)).size;
        const bound = boundBy(t, 'vst', 'mix');
        const armed = pendingBind && pendingBind.fx === 'vst' && pendingBind.track === t.id;
        rows.push(`<div class="assign-row"><span></span><button class="chip" data-vst-render>${vstBusy ? esc(vstBusy) : rendered >= need && need ? 'RE-RENDER' : 'RENDER'}</button><span style="min-width:0">${need ? `${rendered} of ${need} stems rendered` : 'no clips on this track yet'}</span></div>`);
        rows.push(`<div class="fx-param"><span>wet / dry</span><input type="range" data-vst-mix min="0" max="1" step="0.005" value="${t.vst.mix}"><b class="${bound.length ? 'bound' : ''}">${t.vst.mix.toFixed(2)}</b><button class="chip${armed ? ' armed' : ''}" data-bind="vst:mix">${bound.length ? '●' : 'BIND'}</button></div>`);
        rows.push('<div class="assign-note">A VST chain is rendered, not live: RENDER writes each stem through the plugins once, and the wet / dry mix is what you play from a pad, a knob or a section.</div>');
      }
    }

    // Sections.
    rows.push('<div class="assign-sub">SECTIONS</div>');
    if (!t.regions.length) rows.push('<div class="assign-note">Shift+drag across the track on the timeline to mark a section; the effect parameter you pick takes its value while the playhead is inside.</div>');
    for (const r of t.regions) {
      rows.push(`<div class="region-row" data-region="${r.id}"><span class="nm">${fmt(r.start)}s, ${fmt(r.end)}s · ${esc(regionLabel(t, r))} = ${fmt(r.value)}</span><button class="chip" data-region-del="${r.id}">✕</button></div>`);
    }
    body.innerHTML = rows.join('');
  }

  function regionLabel(t, r) {
    if (r.fx === 'vst') return 'vst wet / dry';
    const e = t.fx.find((x) => x.id === r.fx);
    return e ? `${FX_KINDS[e.kind] ? FX_KINDS[e.kind].label : e.kind} · ${r.param}` : r.param;
  }

  function renderRegion(trackId, regionId) {
    const t = trackOf(trackId);
    const r = t && t.regions.find((x) => x.id === regionId);
    if (!t || !r) {
      body.innerHTML = '<div class="empty">This section is gone.</div>';
      return;
    }
    const targets = [];
    for (const e of t.fx) {
      const spec = FX_KINDS[e.kind];
      if (!spec) continue;
      for (const [k, s] of Object.entries(spec.params)) targets.push({ v: `${e.id}:${k}`, label: `${spec.label} · ${k}`, lo: s[0], hi: s[1], unit: s[3] });
    }
    if (t.vst.plugins.length) targets.push({ v: 'vst:mix', label: 'vst wet / dry', lo: 0, hi: 1 });
    const cur = `${r.fx}:${r.param}`;
    const curSpec = targets.find((x) => x.v === cur) || { lo: 0, hi: 1 };
    const rows = [
      `<div class="assign-note">TRACK · ${esc(t.name)} · ${fmt(r.start)}s, ${fmt(r.end)}s</div>`,
      `<div class="assign-row"><span>EFFECT</span><select data-rg-target>${targets.map((x) => `<option value="${esc(x.v)}"${x.v === cur ? ' selected' : ''}>${esc(x.label)}</option>`).join('')}</select></div>`,
      `<div class="assign-row"><span>VALUE</span>${slider('data-rg-value', [curSpec.lo, curSpec.hi, r.value, curSpec.unit], Math.max(curSpec.lo, Math.min(curSpec.hi, r.value)))}<b>${unitText(curSpec.unit, r.value)}</b></div>`,
      `<div class="assign-row"><span>START</span><input type="number" data-rg-start step="0.01" min="0" value="${r.start}"> s</div>`,
      `<div class="assign-row"><span>END</span><input type="number" data-rg-end step="0.01" min="0" value="${r.end}"> s</div>`,
      `<div class="assign-row"><span></span><button class="chip" data-rg-track>TRACK</button><button class="chip" data-rg-del>DELETE</button></div>`,
      '<div class="assign-note">While the playhead is inside the section the parameter takes this value, and returns to what it was when it leaves.</div>',
    ];
    body.innerHTML = rows.join('');
  }

  async function refreshVst(rescan) {
    try {
      vstStatus = await window.swaycommand.vst.status();
      if (vstStatus.ok) {
        vstList = null;
        if (selected && selected.startsWith('track:')) renderBody();
        vstList = await window.swaycommand.vst.scan(!!rescan);
      }
    } catch (err) {
      vstStatus = { ok: false, error: err.message };
    }
    if (selected && selected.startsWith('track:')) renderBody();
  }

  function changed(structural) {
    if (onChanged) onChanged();
    if (structural) renderBody();
  }

  // Applies an armed BIND to the control the user just selected.
  function applyBind(target) {
    const b = pendingBind;
    const t = ctlParts(target);
    const a = asg();
    const tgt = b.fx === 'vst' ? `track:${b.track}:vstmix` : b.fx === 'gain' ? `track:${b.track}:gain` : `track:${b.track}:${b.fx}:${b.param}`;
    if (t.ns === 'pad') {
      if (b.fx === 'gain') return false;
      a.pads[Number(t.key)] = { type: 'trackFx', track: b.track, fx: b.fx, param: b.param, value: b.value };
    } else if (t.ns === 'knob') {
      a.knobs[Number(t.key)] = { target: tgt, min: b.lo, max: b.hi, curve: 'linear' };
    } else if (t.ns === 'xy' || t.ns === 'gesture' || t.ns === 'gan') {
      a.gestures.push({ source: target, target: tgt, min: b.lo, max: b.hi, curve: 'linear', enabled: true });
    } else {
      return false;
    }
    pendingBind = null;
    deps.onBindArmed && deps.onBindArmed(null);
    changed(false);
    return true;
  }

  function armBind(spec) {
    pendingBind = spec;
    deps.onBindArmed && deps.onBindArmed(spec);
    renderBody();
  }

  // --- events ---------------------------------------------------------------

  header.addEventListener('click', async (e) => {
    const chip = e.target.closest('[data-act]');
    if (!chip) return;
    if (chip.dataset.act === 'follow') {
      follow = !follow;
      renderHeader();
    } else if (chip.dataset.act === 'clear' && selected) {
      const t = ctlParts(selected);
      if (selected.startsWith('pad:')) {
        asg().pads[Number(t.key)] = null;
        sampler.clearPad(Number(t.key));
      } else if (selected.startsWith('knob:')) {
        asg().knobs[Number(t.key)] = null;
      } else if (selected.startsWith('button:')) {
        asg().buttons[Number(t.key)] = { cc: null, channel: null, action: null };
      } else {
        const g = asg().gestures;
        for (let i = g.length - 1; i >= 0; i--) if (g[i].source === selected || g[i].source.startsWith(selected + ':')) g.splice(i, 1);
      }
      changed(true);
    } else if (chip.dataset.act === 'unlearn' && selected) {
      const overrides = deps.midi.getOverrides();
      delete overrides[selected];
      deps.midi.setOverrides(overrides);
      try {
        await window.swaycommand.settings.set({ midiOverrides: overrides });
      } catch {
        /* settings persistence is best-effort */
      }
      renderHeader();
      changed(false);
    } else if (chip.dataset.act === 'learn' && selected && !learning) {
      learning = true;
      renderHeader();
      deps.onLearnArmed && deps.onLearnArmed(true);
      try {
        if (selected.startsWith('button:')) {
          // Capture the CC into the button slot via a throwaway learn target.
          const slot = ctlParts(selected).key;
          const result = await router.learnBinding(`button:${slot}`);
          const b = asg().buttons[Number(slot)];
          b.cc = result.cc;
          // The captured CC is a button, not a continuous control, drop the
          // override the learn call recorded so it never drives a knob path.
          const overrides = deps.midi.getOverrides();
          delete overrides[result.target];
          deps.midi.setOverrides(overrides);
        } else {
          await router.learnBinding(selected);
        }
      } finally {
        learning = false;
        renderHeader();
        deps.onLearnArmed && deps.onLearnArmed(false);
        changed(true);
      }
    }
  });

  body.addEventListener('change', (e) => {
    if (!selected) return;
    const t = ctlParts(selected);
    const el = e.target;

    if (selected.startsWith('pad:')) {
      const i = Number(t.key);
      if (el.matches('[data-pad-kind]')) {
        const kind = el.value;
        if (kind === 'off') asg().pads[i] = null;
        else if (kind === 'sample') asg().pads[i] = { type: 'sample', pad: i };
        else if (kind === 'stem') {
          const p = project();
          asg().pads[i] = p && p.media.length ? { type: 'stem', media: p.media[0].id, quant: 'bar', mode: 'toggle', track: null, gain: 1 } : null;
          if (!asg().pads[i]) deps.notice && deps.notice('Import a stem first (IMPORT on the timeline, or drop a file on it).');
        } else if (kind === 'scene') asg().pads[i] = { type: 'scene', scene: engine.sceneList[0].id, transition: { type: 'cut', duration: 0 } };
        else if (kind === 'sceneAction') {
          const first = engine.sceneList.find((m) => m.controls && m.controls.actions && m.controls.actions.length);
          asg().pads[i] = first ? { type: 'sceneAction', scene: first.id, action: first.controls.actions[0].key } : null;
        } else if (kind === 'trackFx') {
          const tr = transport.tracks().find((x) => x.fx.length || x.vst.plugins.length);
          if (!tr) {
            asg().pads[i] = null;
            deps.notice && deps.notice('Add an effect to a track first (click its head on the timeline).');
          } else if (tr.fx.length) {
            const en = tr.fx[0];
            const k = 'mix' in en.params ? 'mix' : Object.keys(en.params)[0];
            asg().pads[i] = { type: 'trackFx', track: tr.id, fx: en.id, param: k, value: k === 'mix' ? 1 : en.params[k] };
          } else asg().pads[i] = { type: 'trackFx', track: tr.id, fx: 'vst', param: 'mix', value: 1 };
        } else asg().pads[i] = { type: 'fxPunch', param: 'glitch', value: 0.8 };
        return changed(true);
      }
      if (el.matches('[data-pad-sample]')) {
        if (el.value) sampler.assignPad(i, el.value, padOpts(i));
        else sampler.clearPad(i);
        return changed(true);
      }
      if (el.matches('[data-pad-opt]')) {
        const kit = sampler.getKit();
        const pad = kit.pads && kit.pads[i];
        if (pad && pad.id) sampler.assignPad(i, pad.id, padOpts(i));
        return changed(false);
      }
      const a = asg().pads[i];
      if (!a) return;
      if (el.matches('[data-pad-scene]')) { a.scene = el.value; return changed(false); }
      if (el.matches('[data-pad-event]')) {
        const t2 = parseTarget(el.value);
        a.scene = t2.scene;
        a.action = t2.key;
        return changed(true);
      }
      if (el.matches('[data-pad-trans]')) {
        a.transition.type = el.value;
        if (el.value === 'crossfade' && !a.transition.duration) a.transition.duration = 2.5;
        return changed(true);
      }
      if (el.matches('[data-pad-fade]')) { a.transition.duration = Number(el.value) || 0; return changed(false); }
      if (el.matches('[data-pad-param]')) {
        a.param = parseTarget(el.value).key;
        const spec = fxRanges[a.param];
        if (Array.isArray(spec)) a.value = Math.min(Math.max(a.value, spec[0]), spec[1]);
        return changed(true);
      }
      if (el.matches('[data-pad-value]')) { a.value = Number(el.value); return changed(false); }
      if (el.matches('[data-pad-stem]')) { if (el.value) a.media = el.value; return changed(true); }
      if (el.matches('[data-pad-quant]')) { a.quant = el.value; return changed(false); }
      if (el.matches('[data-pad-stemmode]')) { a.mode = el.value; return changed(false); }
      if (el.matches('[data-pad-stemtrack]')) { a.track = el.value || null; return changed(false); }
      if (el.matches('[data-pad-stemgain]')) { a.gain = Number(el.value); return changed(false); }
      if (el.matches('[data-pad-tparam]')) {
        const t2 = parseTarget(el.value);
        if (!t2) return;
        a.track = t2.track;
        if (t2.key === 'vstmix') {
          a.fx = 'vst';
          a.param = 'mix';
        } else {
          a.fx = t2.fx;
          a.param = t2.key;
        }
        const opt = el.selectedOptions[0];
        a.value = Math.min(Math.max(a.value, Number(opt.dataset.min ?? 0)), Number(opt.dataset.max ?? 1));
        return changed(true);
      }
      if (el.matches('[data-pad-tvalue]')) { a.value = Number(el.value); return changed(false); }
    }

    if (selected.startsWith('knob:')) {
      const i = Number(t.key);
      if (el.matches('[data-knob-target]')) {
        if (!el.value) asg().knobs[i] = null;
        else {
          const opt = el.selectedOptions[0];
          asg().knobs[i] = {
            target: el.value,
            min: Number(opt.dataset.min ?? 0),
            max: Number(opt.dataset.max ?? 1),
            curve: 'linear',
          };
        }
        return changed(true);
      }
      const a = asg().knobs[i];
      if (!a) return;
      if (el.matches('[data-knob-min]')) a.min = Number(el.value) || 0;
      if (el.matches('[data-knob-max]')) a.max = Number(el.value) || 0;
      if (el.matches('[data-knob-curve]')) a.curve = el.value;
      return changed(false);
    }

    if (selected.startsWith('button:')) {
      const b = asg().buttons[Number(t.key)];
      if (el.matches('[data-btn-target]')) {
        b.action = el.value ? { type: 'toggle', target: el.value } : null;
        return changed(false);
      }
    }

    if (selected.startsWith('track:')) {
      const tr = trackOf(t.key);
      if (!tr) return;
      if (el.matches('[data-tr-name]')) {
        tr.name = el.value.trim() || tr.name;
        deps.onTimelineChanged && deps.onTimelineChanged();
        renderHeader();
        return changed(false);
      }
      if (el.matches('[data-fx-add]')) {
        if (el.value) transport.addFx(tr.id, el.value);
        deps.onTimelineChanged && deps.onTimelineChanged();
        return changed(true);
      }
      if (el.matches('[data-fx-param]')) {
        const [fxId, key] = el.dataset.fxParam.split(':');
        transport.setTrackParam(tr.id, fxId, key, sliderValue(el));
        return changed(false);
      }
      if (el.matches('[data-vst-add]')) {
        const p = (vstList || []).find((x) => x.path === el.value);
        if (p) tr.vst.plugins.push({ path: p.path, name: p.name, params: {}, rawState: null });
        return changed(true);
      }
      return;
    }

    if (selected.startsWith('region:')) {
      const [trackId, regionId] = t.key.split(':');
      const tr = trackOf(trackId);
      const r = tr && tr.regions.find((x) => x.id === regionId);
      if (!r) return;
      if (el.matches('[data-rg-target]')) {
        const [fx, param] = el.value.split(':');
        r.fx = fx;
        r.param = param;
        deps.onTimelineChanged && deps.onTimelineChanged();
        return changed(true);
      }
      if (el.matches('[data-rg-value]')) r.value = sliderValue(el);
      if (el.matches('[data-rg-start]')) r.start = Math.max(0, Number(el.value) || 0);
      if (el.matches('[data-rg-end]')) r.end = Math.max(r.start + 0.05, Number(el.value) || 0);
      deps.onTimelineChanged && deps.onTimelineChanged();
      return changed(false);
    }

    // gesture / xy / gan routes
    const gi = Number(el.dataset.routeTarget ?? el.dataset.routeMin ?? el.dataset.routeMax ?? el.dataset.routeOn);
    const g = asg().gestures[gi];
    if (!g) return;
    if (el.dataset.routeTarget !== undefined) {
      g.target = el.value;
      const opt = el.selectedOptions[0];
      g.min = Number(opt.dataset.min ?? g.min);
      g.max = Number(opt.dataset.max ?? g.max);
      return changed(true);
    }
    if (el.dataset.routeMin !== undefined) g.min = Number(el.value) || 0;
    if (el.dataset.routeMax !== undefined) g.max = Number(el.value) || 0;
    if (el.dataset.routeOn !== undefined) g.enabled = el.checked;
    changed(false);
  });

  body.addEventListener('input', (e) => {
    // live readouts and live parameter moves for range rows
    const el = e.target;
    if (el.type !== 'range') return;
    const b = el.parentElement.querySelector('b');
    if (el.matches('[data-fx-param]') && selected && selected.startsWith('track:')) {
      const [fxId, key] = el.dataset.fxParam.split(':');
      const tr = trackOf(ctlParts(selected).key);
      const v = sliderValue(el);
      if (tr) transport.setTrackParam(tr.id, fxId, key, v);
      const en = tr && tr.fx.find((x) => x.id === fxId);
      const s = en && FX_KINDS[en.kind] && FX_KINDS[en.kind].params[key];
      if (b) b.textContent = unitText(s && s[3], v);
      return;
    }
    if (el.matches('[data-tr-gain]') && selected && selected.startsWith('track:')) {
      transport.setTrackGain(ctlParts(selected).key, Number(el.value));
      if (b) b.textContent = Number(el.value).toFixed(2);
      deps.onTimelineChanged && deps.onTimelineChanged();
      return;
    }
    if (el.matches('[data-vst-p]') && selected && selected.startsWith('track:')) {
      const tr = trackOf(ctlParts(selected).key);
      const [pi, ...rest] = el.dataset.vstP.split(':');
      const p = tr && tr.vst.plugins[Number(pi)];
      if (p) {
        p.params[rest.join(':')] = Number(el.value);
        if (Object.keys(tr.vst.renders).length) tr.vst.renders = {}; // the sound changed; renders are stale
        onChanged && onChanged();
      }
      if (b) b.textContent = fmt(Number(el.value));
      return;
    }
    if (el.matches('[data-vst-mix]') && selected && selected.startsWith('track:')) {
      transport.setVstMix(ctlParts(selected).key, Number(el.value));
      if (b) b.textContent = Number(el.value).toFixed(2);
      return;
    }
    if (el.matches('[data-rg-value]')) {
      if (b) b.textContent = fmt(sliderValue(el));
      return;
    }
    if (b) b.textContent = Number(el.value).toFixed(2);
  });

  body.addEventListener('click', async (e) => {
    if (!selected) return;
    const t = ctlParts(selected);
    if (e.target.closest('[data-pad-trig]')) {
      sampler.trigger(Number(t.key), 0.9);
      return;
    }
    const del = e.target.closest('[data-route-del]');
    if (del) {
      asg().gestures.splice(Number(del.dataset.routeDel), 1);
      return changed(true);
    }
    const add = e.target.closest('[data-route-add]');
    if (add) {
      asg().gestures.push({ source: add.dataset.routeAdd, target: 'fx:glitch', min: 0, max: 1, curve: 'linear', enabled: true });
      return changed(true);
    }

    if (selected.startsWith('track:')) {
      const tr = trackOf(t.key);
      if (!tr) return;
      if (e.target.closest('[data-tr-mute]')) {
        transport.setTrackMute(tr.id, !tr.muted);
        deps.onTimelineChanged && deps.onTimelineChanged();
        return changed(true);
      }
      if (e.target.closest('[data-tr-solo]')) {
        transport.setTrackSolo(tr.id, !tr.solo);
        deps.onTimelineChanged && deps.onTimelineChanged();
        return changed(true);
      }
      if (e.target.closest('[data-tr-delete]')) {
        if (!transport.removeTrack(tr.id)) return deps.notice && deps.notice('The last track stays.');
        deps.onTimelineChanged && deps.onTimelineChanged();
        selected = null;
        renderHeader();
        return changed(true);
      }
      const on = e.target.closest('[data-fx-on]');
      if (on) {
        const cur = transport.getTrackParam(tr.id, on.dataset.fxOn, 'enabled');
        transport.setTrackParam(tr.id, on.dataset.fxOn, 'enabled', cur >= 0.5 ? 0 : 1);
        return changed(true);
      }
      const mv = e.target.closest('[data-fx-move]');
      if (mv) {
        const [id, dir] = mv.dataset.fxMove.split(':');
        transport.moveFx(tr.id, id, Number(dir));
        return changed(true);
      }
      const fdel = e.target.closest('[data-fx-del]');
      if (fdel) {
        transport.removeFx(tr.id, fdel.dataset.fxDel);
        deps.onTimelineChanged && deps.onTimelineChanged();
        return changed(true);
      }
      const bind = e.target.closest('[data-bind]');
      if (bind) {
        const [fxId, key] = bind.dataset.bind.split(':');
        if (pendingBind && pendingBind.fx === fxId && pendingBind.param === key) return armBind(null);
        if (fxId === 'vst') return armBind({ track: tr.id, fx: 'vst', param: 'mix', lo: 0, hi: 1, value: 1, label: `${tr.name} · vst wet / dry` });
        const en = tr.fx.find((x) => x.id === fxId);
        const s = en && FX_KINDS[en.kind] && FX_KINDS[en.kind].params[key];
        if (!s) return;
        const isMix = key === 'mix' || key === 'depth';
        return armBind({ track: tr.id, fx: fxId, param: key, lo: s[0], hi: s[1], value: isMix ? s[1] : en.params[key], label: `${tr.name} · ${FX_KINDS[en.kind].label} ${key}` });
      }
      if (e.target.closest('[data-bind-gain]')) {
        if (pendingBind && pendingBind.fx === 'gain') return armBind(null);
        return armBind({ track: tr.id, fx: 'gain', param: 'gain', lo: 0, hi: 1.5, value: tr.gain, label: `${tr.name} · level` });
      }
      if (e.target.closest('[data-vst-python]')) {
        vstStatus = await window.swaycommand.vst.pickPython();
        return refreshVst(true);
      }
      if (e.target.closest('[data-vst-rescan]')) return refreshVst(true);
      const vdel = e.target.closest('[data-vst-del]');
      if (vdel) {
        tr.vst.plugins.splice(Number(vdel.dataset.vstDel), 1);
        tr.vst.renders = {};
        vstParamsOpen = null;
        return changed(true);
      }
      const vpar = e.target.closest('[data-vst-params]');
      if (vpar) {
        const pi = Number(vpar.dataset.vstParams);
        if (vstParamsOpen && vstParamsOpen.track === tr.id && vstParamsOpen.index === pi) {
          vstParamsOpen = null;
          return renderBody();
        }
        const p = tr.vst.plugins[pi];
        vstParamsOpen = { track: tr.id, index: pi, rows: null };
        renderBody();
        try {
          const r = await window.swaycommand.vst.params(p.path, { params: p.params, rawState: p.rawState });
          if (vstParamsOpen && vstParamsOpen.index === pi) vstParamsOpen.rows = r.params || [];
        } catch (err) {
          deps.notice && deps.notice(`VST: ${err.message}`, 6000);
          vstParamsOpen = null;
        }
        return renderBody();
      }
      const vedit = e.target.closest('[data-vst-edit]');
      if (vedit) {
        const p = tr.vst.plugins[Number(vedit.dataset.vstEdit)];
        if (!p) return;
        vstBusy = 'EDITING...';
        renderBody();
        try {
          const r = await window.swaycommand.vst.editor(p.path, { params: p.params, rawState: p.rawState });
          if (r && r.rawState) p.rawState = r.rawState;
          if (r && r.params) {
            p.params = {};
            for (const row of r.params) if (row.raw !== null && row.raw !== undefined) p.params[row.name] = row.raw;
          }
          tr.vst.renders = {}; // the sound changed; renders are stale
        } catch (err) {
          deps.notice && deps.notice(`VST editor: ${err.message}`, 7000);
        }
        vstBusy = '';
        return changed(true);
      }
      if (e.target.closest('[data-vst-render]')) {
        if (vstBusy) return;
        vstBusy = 'RENDERING...';
        renderBody();
        try {
          await deps.onRenderVst(tr, (msg) => {
            vstBusy = msg;
            renderBody();
          });
        } catch (err) {
          deps.notice && deps.notice(`VST render: ${err.message}`, 8000);
        }
        vstBusy = '';
        return changed(true);
      }
      const rsel = e.target.closest('[data-region]');
      if (rsel && !e.target.closest('[data-region-del]')) {
        deps.onSelectRegion && deps.onSelectRegion(tr.id, rsel.dataset.region);
        return;
      }
      const rdel = e.target.closest('[data-region-del]');
      if (rdel) {
        transport.removeRegion(tr.id, rdel.dataset.regionDel);
        deps.onTimelineChanged && deps.onTimelineChanged();
        return changed(true);
      }
      return;
    }

    if (selected.startsWith('region:')) {
      const [trackId, regionId] = t.key.split(':');
      if (e.target.closest('[data-rg-track]')) return deps.onSelectTrack && deps.onSelectTrack(trackId);
      if (e.target.closest('[data-rg-del]')) {
        transport.removeRegion(trackId, regionId);
        deps.onTimelineChanged && deps.onTimelineChanged();
        return deps.onSelectTrack && deps.onSelectTrack(trackId);
      }
    }
  });

  function padOpts(i) {
    const mode = body.querySelector('[data-pad-opt="mode"]');
    const gain = body.querySelector('[data-pad-opt="gain"]');
    const choke = body.querySelector('[data-pad-opt="chokeGroup"]');
    const kit = sampler.getKit();
    const pad = (kit.pads && kit.pads[i]) || {};
    return {
      mode: mode ? mode.value : pad.mode || 'oneshot',
      gain: gain ? Number(gain.value) : pad.gain ?? 1,
      chokeGroup: choke && choke.value !== '' ? Number(choke.value) : null,
      loop: (mode ? mode.value : pad.mode) === 'loop',
    };
  }

  renderHeader();
  renderBody();

  return {
    select(target) {
      // An armed BIND takes the next deck control and lands the parameter on it.
      if (pendingBind && target && /^(pad|knob|xy|gesture|gan):/.test(target)) {
        if (applyBind(target)) deps.notice && deps.notice(`Bound to ${headerName(target)}`);
      }
      selected = target;
      learning = false;
      renderHeader();
      renderBody();
    },
    current() {
      return selected;
    },
    followEnabled() {
      return follow;
    },
    refresh() {
      renderBody();
    },
    cancelBind() {
      if (!pendingBind) return false;
      armBind(null);
      return true;
    },
    bindArmed() {
      return !!pendingBind;
    },
  };
}
