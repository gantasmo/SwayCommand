// Engine, renders two scenes into offscreen targets and crossfades them
// (equal-power), after Akvj's VfxController: an Auto-VJ timer holds a scene
// for a random interval, then fades to another from the project's pool.
// Scene instances are cached for glitch-free switching.

import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { creators, sceneList } from './scenes/index.js';
import { createColorMaster } from './colormaster.js';
import { createFxRack } from './fxrack.js';

const QUALITY_TIERS = {
  low: { tier: 'low', particles: 8000 },
  med: { tier: 'med', particles: 30000 },
  high: { tier: 'high', particles: 80000 },
};

export function createEngine({ canvas, quality = 'med' }) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.autoClear = true;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  const q = QUALITY_TIERS[quality] || QUALITY_TIERS.med;
  const colorMaster = createColorMaster();

  let width = canvas.clientWidth || 1280;
  let height = canvas.clientHeight || 720;

  // Half-float targets keep the scenes' additive HDR (values past 1.0) alive
  // for the bloom pass, exactly like theDAW's EffectComposer buffers.
  const rtOpts = { depthBuffer: true, stencilBuffer: false, type: THREE.HalfFloatType };
  let rtA = new THREE.WebGLRenderTarget(width, height, rtOpts);
  let rtB = new THREE.WebGLRenderTarget(width, height, rtOpts);

  // The crossfade composite lands here when bloom or the FX rack needs a
  // texture to work from. Straight to the screen when both are idle.
  let rtComp = new THREE.WebGLRenderTarget(width, height, { depthBuffer: false, stencilBuffer: false, type: THREE.HalfFloatType });
  const fxRack = createFxRack(THREE, renderer, width, height);

  // Shared reflection environment for the chrome scenes, the no-asset
  // stand-in for theDAW's EXR: a PMREM-filtered RoomEnvironment.
  //
  // Generating it costs the better part of a SECOND on a cold GPU cache: it
  // builds the room, renders it to a cube map and runs the whole PMREM blur
  // chain, compiling a fistful of shaders on the way. It used to run here, at
  // engine construction, on every single launch, and it was almost the whole
  // of the frozen first load, even though only three scenes (ferrofluid,
  // chladni, valley) ever ask for it. It is now built on FIRST ACCESS, which
  // happens inside the warm pipeline when one of those scenes is instantiated,
  // off the boot path entirely, and cached for the rest of the session.
  let environmentTex = null;
  function environment() {
    if (environmentTex) return environmentTex;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    environmentTex = pmrem.fromScene(room, 0.04).texture;
    pmrem.dispose();
    room.dispose(); // the room's own geometries and materials; the texture stays
    return environmentTex;
  }

  // Per-scene bloom (theDAW's UnrealBloomPass). Scenes request it through
  // meta.bloom { strength, radius, threshold } or a live instance.bloom that
  // update() mutates; the engine crossfades strength with the scene mix.
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0, 0.4, 0.6);
  const copyMat = new THREE.MeshBasicMaterial({ map: rtComp.texture, depthTest: false, depthWrite: false });
  const copyScene = new THREE.Scene();
  copyScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), copyMat));

  // Fullscreen composite pass
  const compScene = new THREE.Scene();
  const compCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const compMat = new THREE.ShaderMaterial({
    uniforms: {
      tA: { value: rtA.texture },
      tB: { value: rtB.texture },
      uMix: { value: 0 },
      uMaster: { value: 1 },
      uFlash: { value: 0 },
    },
    glslVersion: THREE.GLSL3,
    vertexShader: /* glsl */ `
      out vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D tA, tB;
      uniform float uMix, uMaster, uFlash;
      in vec2 vUv;
      out vec4 fragColor;
      void main() {
        float a = cos(uMix * 1.5707963) ;
        float b = sin(uMix * 1.5707963);
        vec3 col = texture(tA, vUv).rgb * a * a + texture(tB, vUv).rgb * b * b;
        // gentle S-curve + master fader + beat flash headroom
        col = col * (1.0 + uFlash * 0.25);
        col = col / (1.0 + 0.35 * col);
        // subtle vignette keeps edges calm on projectors
        float vig = smoothstep(1.35, 0.45, length(vUv - 0.5) * 1.6);
        fragColor = vec4(col * uMaster * vig, 1.0);
      }`,
    depthTest: false,
    depthWrite: false,
  });
  compScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), compMat));

  // --- scene management --------------------------------------------------------

  const instances = new Map(); // id -> created scene
  // The creation context is built per scene rather than spread from a shared
  // object, because `environment` has to stay a getter all the way to the
  // scene: spreading would read it, and reading it is the second that was
  // being spent on every launch.
  function sceneCtx() {
    const c = { THREE, renderer, width, height, quality: q };
    Object.defineProperty(c, 'environment', { get: environment, enumerable: true });
    return c;
  }

  function instance(id) {
    if (!instances.has(id)) {
      const create = creators[id];
      if (!create) throw new Error(`Unknown scene: ${id}`);
      instances.set(id, create(sceneCtx()));
    }
    return instances.get(id);
  }

  let slotA = null; // active scene id
  let slotB = null; // incoming scene id during a fade
  let mix = 0; // 0 = full A, 1 = full B
  let fading = false;
  let fadeTime = 4;

  // A switch to a scene that has never been built used to instantiate it,
  // compile its shaders and draw it in one frame, hundreds of milliseconds
  // of frozen stage, and the reason a cold start was so rough. A switch to a
  // cold scene is now DEFERRED: the target goes to the head of the warm queue
  // and the stage keeps showing what it was showing until the target is
  // genuinely ready to draw. Nothing is lost, a deferred switch runs as soon
  // as the scene is up, usually within a frame or two, and nothing freezes.
  let pending = null; // { id, seconds }, a switch waiting on its scene

  function applyCut(id) {
    slotA = id;
    slotB = null;
    mix = 0;
    fading = false;
  }

  function applyFade(id, seconds) {
    if (fading) {
      // settle the current fade instantly, then start the new one
      slotA = mix > 0.5 ? slotB : slotA;
      mix = 0;
    }
    slotB = id;
    fading = true;
    fadeTime = Math.max(0.1, seconds);
  }

  function cutTo(id) {
    if (!creators[id]) return;
    if (!ready.has(id)) {
      pending = { id, seconds: 0 };
      warmFirst(id);
      return;
    }
    pending = null;
    applyCut(id);
  }

  function crossfadeTo(id, seconds) {
    if (seconds <= 0.12) return cutTo(id);
    if (id === slotA && !fading) return;
    if (!creators[id]) return;
    if (!ready.has(id)) {
      pending = { id, seconds };
      warmFirst(id);
      return;
    }
    pending = null;
    applyFade(id, seconds);
  }

  function servePending() {
    if (!pending || !ready.has(pending.id)) return;
    const { id, seconds } = pending;
    pending = null;
    if (seconds <= 0.12 || !slotA) applyCut(id);
    else applyFade(id, seconds);
  }

  // Bringing a scene up costs twice: building its geometry, buffers and
  // textures on the CPU, then compiling and linking its shader programs. Doing
  // both in one frame, which is what a project load used to do, nine times
  // over, one scene per frame, is what made a cold start crawl. The warm
  // pipeline splits them:
  //
  //   frame n     instantiate one scene (CPU: geometry, buffers, textures)
  //   frame n+1   hand its programs to the driver with compileAsync, which
  //               links them on the driver's own threads through
  //               KHR_parallel_shader_compile instead of blocking ours
  //   later       the promise resolves; the scene is drawn ONCE into a 32 px
  //               target on the next frame, the first use of a program is
  //               where ANGLE's translation and the uniform setup land, and
  //               only then joins `ready` and may be shown
  //
  // Only one scene is in flight at a time, and the pipeline stands down on any
  // frame that already ran long, so warming can never be what makes a
  // struggling stage worse. A scene is only drawn once it is in `ready`.
  const ready = new Set(); // scene ids whose programs are linked, drawn once off screen, and safe to show
  let warmLinked = null; // { id, inst } whose programs linked, waiting for the raster warm
  // The raster warm target: 32 px is enough to make every program actually
  // execute once, it is the first USE of a program that costs, not the pixels.
  const warmRT = new THREE.WebGLRenderTarget(32, 32, { depthBuffer: true, stencilBuffer: false, type: THREE.HalfFloatType });
  const warmQueue = []; // ids waiting to be instantiated
  let warmResolvers = [];
  let warmBuilt = null; // { id, inst } built last frame, waiting for compileAsync
  let warmInFlight = null; // id whose compileAsync has not resolved yet

  function warmFirst(id) {
    // A scene something is waiting on jumps the queue.
    if (!creators[id] || ready.has(id) || warmInFlight === id) return;
    if (warmBuilt && warmBuilt.id === id) return;
    if (warmLinked && warmLinked.id === id) return;
    const at = warmQueue.indexOf(id);
    if (at > 0) warmQueue.splice(at, 1);
    if (at !== 0) warmQueue.unshift(id);
  }

  function warmSettle() {
    if (warmQueue.length || warmBuilt || warmInFlight || warmLinked) return;
    for (const resolve of warmResolvers) resolve();
    warmResolvers = [];
  }

  function rasterWarm(id, inst) {
    const r0 = performance.now();
    try {
      renderer.setRenderTarget(warmRT);
      renderer.clear();
      renderer.render(inst.scene, inst.camera);
    } catch (err) {
      console.warn(`[engine] warm draw ${id} failed:`, err.message);
    }
    renderer.setRenderTarget(null);
    (stats.warm[id] = stats.warm[id] || {}).drawMs = Math.round(performance.now() - r0);
    ready.add(id);
    warmSettle();
  }

  function warmTick(dt) {
    if (warmLinked) {
      // programs linked last frame: draw them once, small, and the scene is ready
      const { id, inst } = warmLinked;
      warmLinked = null;
      rasterWarm(id, inst);
      return;
    }
    if (warmInFlight) return; // the driver is linking; leave it alone
    // Stand down while the frame is already over budget, 28 ms is comfortably
    // past a 60 fps frame without tripping on the odd slow one, but never
    // when the stage is waiting on this scene to appear at all. On a machine
    // that never makes budget, that exception is the difference between a slow
    // start and a permanently black stage.
    const urgent = !!pending || !slotA || !ready.has(slotA);
    if (!urgent && dt > 0.028) return;

    if (warmBuilt) {
      const { id, inst } = warmBuilt;
      warmBuilt = null;
      warmInFlight = id;
      let promise;
      const c0 = performance.now();
      try {
        // Linked with the HDR target BOUND. The D3D driver compiles a program
        // for the render target signature it first meets: linking against the
        // canvas and then drawing into a half-float target cost a second,
        // synchronous compile on the first draw, 170 to 970 ms per scene on a
        // cold shader cache, the bulk of what a first launch used to spend.
        // Bound to a target of the scenes' own format, that compile happens
        // inside the parallel link and the first draw costs single digits.
        renderer.setRenderTarget(warmRT);
        promise = renderer.compileAsync(inst.scene, inst.camera);
        renderer.setRenderTarget(null);
        (stats.warm[id] = stats.warm[id] || {}).submitMs = Math.round(performance.now() - c0);
      } catch (err) {
        console.warn(`[engine] compile ${id} failed:`, err.message);
        ready.add(id); // draw it anyway rather than hiding the scene for good
        warmInFlight = null;
        warmSettle();
        return;
      }
      // A link that never reports ready, a driver quirk we cannot see from
      // here, would otherwise hide the scene for the rest of the session, so
      // the wait is bounded and the scene is drawn regardless after it.
      const settled = () => {
        if (ready.has(id) || (warmLinked && warmLinked.id === id)) return;
        // linked, the raster warm on the next frame is what makes it ready
        warmLinked = { id, inst };
        if (warmInFlight === id) warmInFlight = null;
      };
      const guard = setTimeout(() => {
        console.warn(`[engine] compile ${id} did not report ready in 6 s; drawing it anyway`);
        settled();
      }, 6000);
      promise
        .catch((err) => console.warn(`[engine] compile ${id} failed:`, err && err.message))
        .then(() => {
          clearTimeout(guard);
          (stats.warm[id] = stats.warm[id] || {}).linkMs = Math.round(performance.now() - c0);
          settled();
        });
      return;
    }

    if (!warmQueue.length) return;
    const id = warmQueue.shift();
    if (ready.has(id)) return warmSettle();
    try {
      const t0 = performance.now();
      const built = instance(id);
      (stats.warm[id] = stats.warm[id] || {}).buildMs = Math.round(performance.now() - t0);
      warmBuilt = { id, inst: built };
    } catch (err) {
      console.warn(`[engine] prewarm ${id} failed:`, err.message);
      warmSettle();
    }
  }

  function prewarm(ids = autoVJ.pool) {
    for (const id of ids) {
      if (!creators[id] || ready.has(id)) continue;
      if (warmQueue.includes(id) || warmInFlight === id) continue;
      if (warmBuilt && warmBuilt.id === id) continue;
      if (warmLinked && warmLinked.id === id) continue;
      warmQueue.push(id);
    }
    if (!warmQueue.length && !warmBuilt && !warmInFlight && !warmLinked) return Promise.resolve();
    return new Promise((resolve) => warmResolvers.push(resolve));
  }

  // --- Auto-VJ (VfxController pattern) ------------------------------------------

  const autoVJ = {
    enabled: true,
    pool: sceneList.map((s) => s.id),
    minHold: 18,
    maxHold: 40,
    fadeTime: 4,
    holdLeft: 8,
  };

  function autoVJTick(dt) {
    if (!autoVJ.enabled || fading || pending || autoVJ.pool.length < 2) return;
    autoVJ.holdLeft -= dt;
    if (autoVJ.holdLeft <= 0) {
      const others = autoVJ.pool.filter((id) => id !== slotA);
      const next = others[(Math.random() * others.length) | 0];
      crossfadeTo(next, autoVJ.fadeTime);
      autoVJ.holdLeft = autoVJ.minHold + Math.random() * (autoVJ.maxHold - autoVJ.minHold);
    }
  }

  // --- io assembly ----------------------------------------------------------------

  const io = {
    level: 0,
    bands: { bass: 0, mid: 0, high: 0 },
    beat: 0,
    xy: { x: 0.5, y: 0.5 },
    gestures: { pulse: 0, press: 0, sway: 0 },
    knobs: new Array(8).fill(0.5),
    pads: new Array(16).fill(0),
    lastPad: -1,
    strike: 0, // max pad energy this frame, the strike dimension scenes morph on
    palette: colorMaster.palette,
    intensity: 1,
    // Mirrored by the router each frame (it owns the transport): a scene
    // that opens on a trigger, Will I Dream stays dark until the show
    // starts, watches the rising edge of `playing`.
    transport: { playing: false, time: 0 },
  };

  // `worst` and `slow` make a rough startup measurable without a profiler:
  // the longest frame yet, and how many frames ran past 50 ms.
  const stats = { fps: 0, frames: 0, acc: 0, worst: 0, slow: 0, warm: {}, stallLog: [] };
  const engineT0 = performance.now();

  // Engine-level performance parameters. These used to be hardwired to knobs
  // 0/1/2 inside the frame loop; the assignment router writes them now, and
  // io.knobs keeps mirroring the raw hardware for scenes that read it.
  const params = { hue: 0, intensity: 0.5 };

  // The rack costs several fullscreen passes, so it stays out of the pipeline
  // until something actually enables it.
  let fxEnabled = false;

  // --- main loop --------------------------------------------------------------------

  let running = false;
  let last = 0;
  let audioEngine = null;
  let control = null;
  let frameHook = null; // fn(dt, t, io), router/transport slot, same-frame

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const raw = (now - last) / 1000 || 0.016;
    const dt = Math.min(0.05, raw);
    last = now;
    const t = now / 1000;

    stats.acc += dt;
    stats.frames++;
    // Measured on the RAW delta: dt is clamped, so it can never show a stall.
    if (raw * 1000 > stats.worst) stats.worst = raw * 1000;
    if (raw > 0.05) {
      stats.slow++;
      if (stats.stallLog.length < 40) stats.stallLog.push({ atMs: Math.round(now - engineT0), ms: Math.round(raw * 1000), warming: warmInFlight || (warmBuilt && warmBuilt.id) || (warmLinked && warmLinked.id) || null, scene: slotA });
    }
    if (stats.acc >= 0.5) {
      stats.fps = Math.round(stats.frames / stats.acc);
      stats.frames = 0;
      stats.acc = 0;
    }

    // pull inputs
    if (audioEngine) {
      audioEngine.update(dt);
      const a = audioEngine.state;
      io.level = a.level;
      io.bands.bass = a.bands.bass;
      io.bands.mid = a.bands.mid;
      io.bands.high = a.bands.high;
      io.beat = a.beat;
    }
    if (control) {
      io.xy.x += (control.xy.x - io.xy.x) * (1 - Math.exp(-dt * 14));
      io.xy.y += (control.xy.y - io.xy.y) * (1 - Math.exp(-dt * 14));
      io.gestures.pulse = control.gestures.pulse;
      io.gestures.press = control.gestures.press;
      io.gestures.sway = control.gestures.sway;
      for (let i = 0; i < 8; i++) io.knobs[i] = control.knobs[i];
      let strike = 0;
      for (let i = 0; i < 16; i++) {
        io.pads[i] = Math.max(io.pads[i] * Math.exp(-dt * 5), control.pads[i]);
        control.pads[i] = 0; // consume the hit; engine owns the decay
        if (io.pads[i] > strike) strike = io.pads[i];
      }
      io.strike = strike;
      io.lastPad = control.lastPad;
    }

    if (frameHook) frameHook(dt, t, io);

    colorMaster.update(dt, params.hue);
    io.intensity = 0.25 + params.intensity * 0.75 + io.gestures.pulse * 0.35;

    warmTick(dt);
    servePending();

    autoVJTick(dt);

    // fade progress, held while the incoming scene is still warming, so a
    // fade never crosses into an empty target
    if (fading && slotB && !ready.has(slotB)) warmFirst(slotB);
    if (fading && (!slotB || ready.has(slotB))) {
      mix = Math.min(1, mix + dt / fadeTime);
      if (mix >= 1) {
        slotA = slotB;
        slotB = null;
        mix = 0;
        fading = false;
      }
    }

    // render A (and B mid-fade) into targets, then composite. A scene that is
    // not `ready` is never drawn, that is the whole point of the warm
    // pipeline, so its target simply stays cleared.
    const a = slotA && ready.has(slotA) ? instances.get(slotA) : null;
    if (a) {
      a.update(dt, t, io);
      renderer.setRenderTarget(rtA);
      renderer.setClearColor(0x000000, 1);
      renderer.clear();
      renderer.render(a.scene, a.camera);
    }
    const b = fading && slotB && ready.has(slotB) ? instances.get(slotB) : null;
    if (b) {
      b.update(dt, t, io);
      renderer.setRenderTarget(rtB);
      renderer.clear();
      renderer.render(b.scene, b.camera);
    }
    compMat.uniforms.uMix.value = fading ? mix : 0;
    compMat.uniforms.uMaster.value = 1;
    compMat.uniforms.uFlash.value = io.beat;

    // Per-scene bloom, crossfaded with the scene mix. A live instance.bloom
    // (mutated in update()) wins over the static meta.bloom.
    const bloomA = bloomOf(slotA);
    const bloomB = fading ? bloomOf(slotB) : null;
    const wB = fading ? mix : 0;
    const strength = (bloomA ? bloomA.strength : 0) * (1 - wB) + (bloomB ? bloomB.strength : 0) * wB;
    const lead = wB > 0.5 ? bloomB || bloomA : bloomA || bloomB;
    const bloomOn = strength > 0.01 && lead;

    if (fxEnabled || bloomOn) {
      renderer.setRenderTarget(rtComp);
      renderer.clear();
      renderer.render(compScene, compCam);
      if (bloomOn) {
        bloomPass.strength = strength;
        bloomPass.radius = lead.radius ?? 0.4;
        bloomPass.threshold = lead.threshold ?? 0.6;
        bloomPass.render(renderer, null, rtComp, dt, false); // adds bloom into rtComp
      }
      renderer.setRenderTarget(null);
      if (fxEnabled) {
        fxRack.render(rtComp.texture, null, dt, io);
      } else {
        renderer.render(copyScene, compCam);
      }
    } else {
      renderer.setRenderTarget(null);
      renderer.render(compScene, compCam);
    }
  }

  // --- scene control surface ---------------------------------------------------
  // A scene declares its own actions and parameters in meta.controls, so the
  // assignment panel can list them without instancing the scene, and the
  // router drives them through the normal `scene:<id>:<key>` target grammar.
  // Parameters reach a cached instance whether it is on screen or not (they
  // are state); an action only reaches a scene that is actually visible,
  // because an event fired at an off-screen scene has nowhere to land.
  function controlsOf(id) {
    const m = sceneList.find((s) => s.id === id);
    return (m && m.controls) || null;
  }
  function onScreen(id) {
    return id === slotA || (fading && id === slotB);
  }
  function sceneAction(id, key) {
    if (!onScreen(id)) return false;
    const inst = instances.get(id);
    if (!inst || typeof inst.action !== 'function') return false;
    inst.action(key);
    return true;
  }
  function setSceneParam(id, key, value) {
    const inst = instances.get(id);
    if (!inst || typeof inst.setParam !== 'function') return false;
    inst.setParam(key, value);
    return true;
  }

  function bloomOf(id) {
    if (!id) return null;
    const inst = instances.get(id);
    if (inst && inst.bloom) return inst.bloom;
    const m = sceneList.find((s) => s.id === id);
    return (m && m.bloom) || null;
  }

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    if (!width || !height) return;
    const pr = renderer.getPixelRatio();
    renderer.setSize(width, height, false);
    rtA.setSize(width * pr, height * pr);
    rtB.setSize(width * pr, height * pr);
    rtComp.setSize(width * pr, height * pr);
    bloomPass.setSize(width, height);
    fxRack.resize(width * pr, height * pr);
    instances.forEach((s) => s.resize(width, height));
  }
  window.addEventListener('resize', resize);
  // The stage lives in a grid cell now, so its box changes without a window
  // resize (drawer, solo view, breakpoints). The window listener stays as a
  // no-op backstop; this is the one that actually fires.
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(() => resize()).observe(canvas);
  }

  return {
    sceneList,
    stats,
    io,
    colorMaster,
    autoVJ,
    params,

    // --- effects rack (ported from the VJ-9000 decks) ---
    fx: fxRack,
    get fxEnabled() {
      return fxEnabled;
    },
    set fxEnabled(v) {
      fxEnabled = !!v;
    },
    setFxParam(key, value) {
      fxRack.setParam(key, value);
    },
    resetFx() {
      fxRack.reset();
    },

    attachAudio(engine) {
      audioEngine = engine;
    },
    attachControl(c) {
      control = c;
    },

    loadProject(project) {
      colorMaster.setPalette(project.palette, 2);
      autoVJ.pool = project.scenes.filter((id) => creators[id]);
      autoVJ.enabled = project.autoVJ ? !!project.autoVJ.enabled : true;
      if (project.autoVJ) {
        autoVJ.minHold = project.autoVJ.minHold ?? 18;
        autoVJ.maxHold = project.autoVJ.maxHold ?? 40;
        autoVJ.fadeTime = project.autoVJ.fadeTime ?? 4;
      }
      autoVJ.holdLeft = autoVJ.minHold;
      const first = (project.start && project.start.scene) || autoVJ.pool[0];
      slotA = null;
      fading = false;
      mix = 0;
      crossfadeTo(first, 0.8);
    },

    // .sway-format sibling of loadProject: takes a validated project object
    // and replays the fx snapshot through the rack so the file is never
    // trusted with raw parameter values.
    applyProject(project) {
      colorMaster.setPalette(project.palette, 2);
      const eng = project.engine || {};
      const av = eng.autoVJ || {};
      autoVJ.pool = (av.pool || []).filter((id) => creators[id]);
      autoVJ.enabled = !!av.enabled;
      autoVJ.minHold = av.minHold ?? 18;
      autoVJ.maxHold = av.maxHold ?? 40;
      autoVJ.fadeTime = av.fadeTime ?? 4;
      autoVJ.holdLeft = autoVJ.minHold;
      fxEnabled = !!eng.fxEnabled;
      fxRack.reset();
      for (const [key, value] of Object.entries((project.fx && project.fx.params) || {})) {
        fxRack.setParam(key, value);
      }
      const first = (eng.start && eng.start.scene) || autoVJ.pool[0];
      if (first) cutTo(creators[first] ? first : autoVJ.pool[0]);
      prewarm();
    },

    setScene(id, seconds = 2.5) {
      if (creators[id]) crossfadeTo(id, seconds);
    },
    cutTo,
    prewarm,
    // The GPU's real name, read from the stage's own context, the doctor
    // used to open a second WebGL context just to ask, which on a cold GPU
    // process was a half-second stall at boot and answered "WebKit WebGL".
    get gpuName() {
      const gl = renderer.getContext();
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      const name = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      return typeof name === 'string' && name ? name : null;
    },
    sceneReady: (id) => ready.has(id),
    // How far the warm pipeline is, for a progress readout: scenes ready
    // against scenes ready-or-in-flight.
    warmProgress() {
      const inFlight = warmQueue.length + (warmBuilt ? 1 : 0) + (warmInFlight ? 1 : 0) + (warmLinked ? 1 : 0);
      return { done: ready.size, total: ready.size + inFlight, busy: inFlight > 0 };
    },
    sceneAction,
    setSceneParam,
    sceneControls: controlsOf,
    setFrameHook(fn) {
      frameHook = typeof fn === 'function' ? fn : null;
    },
    nextScene(seconds = 2.5) {
      const others = autoVJ.pool.filter((id) => id !== slotA);
      if (others.length) crossfadeTo(others[(Math.random() * others.length) | 0], seconds);
    },
    get currentScene() {
      const id = pending ? pending.id : fading && mix > 0.5 ? slotB : slotA;
      const meta = sceneList.find((s) => s.id === id);
      return meta || { id, name: id };
    },

    start() {
      if (running) return;
      running = true;
      resize();
      last = performance.now();
      requestAnimationFrame(frame);
    },
    stop() {
      running = false;
    },
    resize,
  };
}
