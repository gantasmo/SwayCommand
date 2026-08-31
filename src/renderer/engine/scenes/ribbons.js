// Ribbons, a bundle of glowing triangle-strip trails on per-ribbon
// lissajous paths, blended toward the Sway hand so the whole swarm
// chases it. Mid band + press fatten the strips, beats spike them,
// pads teleport a ribbon's head with a flash. Sway morphs the ribbon
// geometry itself, the lissajous rate accumulates faster while the
// amplitudes and strip width pull in, so the field glides from long
// silk sweeps to tight coils, and a strike is a whipcrack: one
// amplitude impulse travels head -> tail down every strip. The camera
// holds a fixed eye (bass dollies it, the hand lifts it), nothing in the
// scene turns by itself; the lissajous travel is path motion, not a spin.
// One draw call for all strips + one for the head sprites.
// (docs/SCENE_CONTRACT.md)

export const meta = { id: 'ribbons', name: 'Ribbons', mood: 'fluid' };

const POINTS = 96;     // trail points per ribbon (2 verts each)
const TAU = Math.PI * 2;
const WHIP_LEN = 0.9;  // seconds for the whipcrack to run the strip

export function createScene(ctx) {
  const { THREE, quality } = ctx;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, ctx.width / ctx.height, 0.1, 400);
  camera.position.set(0, 0, 30);

  const RIBBONS = quality.tier === 'high' ? 16 : quality.tier === 'low' ? 8 : 12;
  const VERTS = RIBBONS * POINTS * 2;

  // --- per-ribbon lissajous parameters + head state (all preallocated)
  const freq = new Float32Array(RIBBONS * 3);
  const acc = new Float32Array(RIBBONS * 3);   // accumulated lissajous angles
  const heads = new Float32Array(RIBBONS * 3); // current head positions
  const flash = new Float32Array(RIBBONS);     // pad-teleport flash energy
  const padPrev = new Float32Array(16);        // for pad rising-edge detection
  const AMP_X = 16, AMP_Y = 10, AMP_Z = 6;     // lissajous amplitudes
  for (let i = 0; i < RIBBONS; i++) {
    freq[i * 3] = 0.7 + Math.random() * 1.1;
    freq[i * 3 + 1] = 0.8 + Math.random() * 1.2;
    freq[i * 3 + 2] = 0.5 + Math.random() * 0.9;
    acc[i * 3] = Math.random() * TAU;
    acc[i * 3 + 1] = Math.random() * TAU;
    acc[i * 3 + 2] = Math.random() * TAU;
    heads[i * 3] = Math.sin(acc[i * 3]) * AMP_X;
    heads[i * 3 + 1] = Math.sin(acc[i * 3 + 1]) * AMP_Y;
    heads[i * 3 + 2] = Math.sin(acc[i * 3 + 2]) * AMP_Z;
  }

  // --- trail center points, shift buffer: index 0 = head (newest)
  const trail = new Float32Array(RIBBONS * POINTS * 3);
  for (let i = 0; i < RIBBONS; i++)
    for (let j = 0; j < POINTS; j++) {
      trail[(i * POINTS + j) * 3] = heads[i * 3];
      trail[(i * POINTS + j) * 3 + 1] = heads[i * 3 + 1];
      trail[(i * POINTS + j) * 3 + 2] = heads[i * 3 + 2];
    }

  // --- one geometry for all ribbons: 2 verts per trail point, indexed quads.
  // position = strip centerline, aPrev = older neighbor; the vertex shader
  // extrudes sideways in screen space so strips always face the camera.
  const geo = new THREE.BufferGeometry();
  const posArr = new Float32Array(VERTS * 3);
  const prevArr = new Float32Array(VERTS * 3);
  const sideArr = new Float32Array(VERTS);  // -1 / +1 across the strip
  const fadeArr = new Float32Array(VERTS);  // 0 at head -> 1 at tail
  const ribArr = new Float32Array(VERTS);   // ribbon index (palette + flash lookup)
  const index = new Uint16Array(RIBBONS * (POINTS - 1) * 6);
  let ix = 0;
  for (let i = 0; i < RIBBONS; i++) {
    for (let j = 0; j < POINTS; j++) {
      const v = (i * POINTS + j) * 2;
      sideArr[v] = -1; sideArr[v + 1] = 1;
      fadeArr[v] = fadeArr[v + 1] = j / (POINTS - 1);
      ribArr[v] = ribArr[v + 1] = i;
      if (j < POINTS - 1) {
        index[ix++] = v; index[ix++] = v + 1; index[ix++] = v + 2;
        index[ix++] = v + 2; index[ix++] = v + 1; index[ix++] = v + 3;
      }
    }
  }
  const posAttr = new THREE.BufferAttribute(posArr, 3);
  const prevAttr = new THREE.BufferAttribute(prevArr, 3);
  posAttr.setUsage(THREE.DynamicDrawUsage);
  prevAttr.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('position', posAttr);
  geo.setAttribute('aPrev', prevAttr);
  geo.setAttribute('aSide', new THREE.BufferAttribute(sideArr, 1));
  geo.setAttribute('aFade', new THREE.BufferAttribute(fadeArr, 1));
  geo.setAttribute('aRib', new THREE.BufferAttribute(ribArr, 1));
  geo.setIndex(new THREE.BufferAttribute(index, 1));

  // palette lives in a 5-slot uniform array, .copy()'d every frame;
  // per-ribbon flash rides along as a float array uniform (shared buffer).
  const mat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uPalette: { value: [new THREE.Color(), new THREE.Color(), new THREE.Color(), new THREE.Color(), new THREE.Color()] },
      uFlash: { value: flash },
      uWidth: { value: 0.012 }, // half-width in NDC units
      uAspect: { value: ctx.width / ctx.height },
      uWhip: { value: 0 },     // whipcrack impulse strength
      uWhipPos: { value: 0 },  // whipcrack position along the strip (aFade units)
      uIntensity: { value: 0 },
    },
    vertexShader: /* glsl */ `
      in vec3 aPrev;
      in float aSide;
      in float aFade;
      in float aRib;
      uniform vec3 uPalette[5];
      uniform float uFlash[${RIBBONS}];
      uniform float uWidth;
      uniform float uAspect;
      uniform float uWhip;
      uniform float uWhipPos;
      out float vFade;
      out float vSide;
      out vec3 vColor;
      out float vFlash;
      void main() {
        vec4 cur = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vec4 prv = projectionMatrix * modelViewMatrix * vec4(aPrev, 1.0);
        // screen-space direction along the strip -> perpendicular extrusion
        vec2 dir = cur.xy / cur.w - prv.xy / prv.w;
        dir.x *= uAspect;
        float len = length(dir);
        dir = len > 0.0001 ? dir / len : vec2(0.0, 1.0);
        vec2 perp = vec2(-dir.y, dir.x);
        perp.x /= uAspect;
        float flash = uFlash[int(aRib + 0.5)];
        // whipcrack: a gaussian amplitude bump centred at uWhipPos runs the
        // strip head -> tail, fattening and brightening as it passes
        float wd = (aFade - uWhipPos) * 6.0;
        float whip = uWhip * exp(-wd * wd);
        float w = uWidth * (1.0 + flash * 1.5 + whip * 2.5) * (0.25 + 0.75 * (1.0 - aFade));
        cur.xy += perp * aSide * w * cur.w;
        vFade = aFade;
        vSide = aSide;
        vFlash = flash + whip; // the whip rides the flash brightening path
        vColor = uPalette[int(mod(aRib, 5.0) + 0.5)];
        gl_Position = cur;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uIntensity;
      in float vFade;
      in float vSide;
      in vec3 vColor;
      in float vFlash;
      out vec4 fragColor;
      void main() {
        float tail = 1.0 - vFade;
        float a = tail * tail;                 // alpha fades along the tail
        a *= 1.0 - vSide * vSide;              // soft strip edges
        a *= (0.9 + vFlash * 1.2) * uIntensity;
        vec3 col = vColor * (1.2 + vFlash * 1.6);
        fragColor = vec4(col * uIntensity, a);
      }`,
  });
  const ribbons = new THREE.Mesh(geo, mat);
  ribbons.frustumCulled = false; // positions live in a dynamic buffer
  scene.add(ribbons);

  // --- glowing head sprites: share the heads buffer directly
  const headGeo = new THREE.BufferGeometry();
  const headAttr = new THREE.BufferAttribute(heads, 3);
  headAttr.setUsage(THREE.DynamicDrawUsage);
  headGeo.setAttribute('position', headAttr);
  const headRib = new Float32Array(RIBBONS);
  for (let i = 0; i < RIBBONS; i++) headRib[i] = i;
  headGeo.setAttribute('aRib', new THREE.BufferAttribute(headRib, 1));
  const headMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: {
      uPalette: mat.uniforms.uPalette, // shared, copied once per frame
      uFlash: { value: flash },
      uBeat: { value: 0 },
      uIntensity: { value: 0 },
    },
    vertexShader: /* glsl */ `
      in float aRib;
      uniform vec3 uPalette[5];
      uniform float uFlash[${RIBBONS}];
      uniform float uBeat;
      out vec3 vColor;
      out float vFlash;
      void main() {
        vFlash = uFlash[int(aRib + 0.5)];
        vColor = uPalette[int(mod(aRib, 5.0) + 0.5)];
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = (5.0 + uBeat * 3.0 + vFlash * 14.0) * (160.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uIntensity;
      in vec3 vColor;
      in float vFlash;
      out vec4 fragColor;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d) * (0.6 + vFlash) * uIntensity;
        fragColor = vec4(vColor * (1.0 + vFlash) * uIntensity, a);
      }`,
  });
  const headPts = new THREE.Points(headGeo, headMat);
  headPts.frustumCulled = false;
  scene.add(headPts);

  // --- preallocated scratch
  const camTarget = new THREE.Vector3(0, 0, 0);
  const CHASE = 0.45;      // blend weight toward the hand
  const HAND_X = 16, HAND_Y = 10;
  let swayS = 0;           // smoothed sway -> geometry morph position
  let whipT = WHIP_LEN;    // whipcrack clock; >= WHIP_LEN == idle

  return {
    scene,
    camera,
    update(dt, t, io) {
      // hand target in world space (io.xy.y = 0 is low)
      const hx = (io.xy.x - 0.5) * 2 * HAND_X;
      const hy = (io.xy.y - 0.5) * 2 * HAND_Y;

      // sway morphs the ribbon geometry: the lissajous angles accumulate
      // faster (shorter wavelength, more twist) while the amplitudes pull
      // in, so the field glides from long silk sweeps to tight coils.
      // Integrating the angle keeps the morph phase-continuous, scaling
      // t * freq directly would teleport every head on a sway move.
      swayS += (io.gestures.sway - swayS) * (1 - Math.exp(-dt * 4));
      const rateXY = 1 + swayS * 2.6;
      const rateZ = 1 + swayS * 3.4; // z coils hardest for visible twist
      const ampK = 1 - swayS * 0.45;

      // pad rising edges teleport ribbon (pad % RIBBONS) onto a 4x4 grid
      // and crack the whip: one impulse travels down every strip
      for (let k = 0; k < 16; k++) {
        if (io.pads[k] > padPrev[k] + 0.3) {
          const r = k % RIBBONS;
          heads[r * 3] = ((k % 4) / 3 - 0.5) * 2 * HAND_X;
          heads[r * 3 + 1] = ((k >> 2) / 3 - 0.5) * 2 * HAND_Y;
          heads[r * 3 + 2] = 0;
          flash[r] = 1;
          whipT = 0;
        }
        padPrev[k] = io.pads[k];
      }

      // whipcrack: the bump runs head -> tail over WHIP_LEN, fading out
      if (whipT < WHIP_LEN) {
        whipT += dt;
        const wn = Math.min(1, whipT / WHIP_LEN);
        mat.uniforms.uWhipPos.value = wn;
        mat.uniforms.uWhip.value = 1.6 * (1 - wn);
      } else {
        mat.uniforms.uWhip.value = 0;
      }

      const ease = Math.min(1, dt * 7); // head chase rate
      const decay = Math.pow(0.04, dt);   // flash decay
      for (let i = 0; i < RIBBONS; i++) {
        flash[i] *= decay;

        // accumulate the lissajous angles at the morphed rate (wrap keeps
        // the float32 store precise over long sets)
        acc[i * 3] += dt * freq[i * 3] * rateXY;
        acc[i * 3 + 1] += dt * freq[i * 3 + 1] * rateXY;
        acc[i * 3 + 2] += dt * freq[i * 3 + 2] * rateZ;
        if (acc[i * 3] > TAU * 64) acc[i * 3] -= TAU * 64;
        if (acc[i * 3 + 1] > TAU * 64) acc[i * 3 + 1] -= TAU * 64;
        if (acc[i * 3 + 2] > TAU * 64) acc[i * 3 + 2] -= TAU * 64;

        // lissajous point blended toward the hand -> desired head position
        const lx = Math.sin(acc[i * 3]) * AMP_X * ampK;
        const ly = Math.sin(acc[i * 3 + 1]) * AMP_Y * ampK;
        const lz = Math.sin(acc[i * 3 + 2]) * AMP_Z * ampK;
        const dx = lx * (1 - CHASE) + hx * CHASE;
        const dy = ly * (1 - CHASE) + hy * CHASE;
        heads[i * 3] += (dx - heads[i * 3]) * ease;
        heads[i * 3 + 1] += (dy - heads[i * 3 + 1]) * ease;
        heads[i * 3 + 2] += (lz - heads[i * 3 + 2]) * ease;

        // shift the trail one slot older, write the new head at slot 0
        const base = i * POINTS * 3;
        trail.copyWithin(base + 3, base, base + (POINTS - 1) * 3);
        trail[base] = heads[i * 3];
        trail[base + 1] = heads[i * 3 + 1];
        trail[base + 2] = heads[i * 3 + 2];

        // rebuild strip verts: both verts share the centerline point,
        // aPrev points at the older neighbor (tail-most degenerates, alpha 0)
        for (let j = 0; j < POINTS; j++) {
          const src = base + j * 3;
          const prv = j < POINTS - 1 ? src + 3 : src;
          const v = (i * POINTS + j) * 6;
          posArr[v] = posArr[v + 3] = trail[src];
          posArr[v + 1] = posArr[v + 4] = trail[src + 1];
          posArr[v + 2] = posArr[v + 5] = trail[src + 2];
          prevArr[v] = prevArr[v + 3] = trail[prv];
          prevArr[v + 1] = prevArr[v + 4] = trail[prv + 1];
          prevArr[v + 2] = prevArr[v + 5] = trail[prv + 2];
        }
      }
      posAttr.needsUpdate = true;
      prevAttr.needsUpdate = true;
      headAttr.needsUpdate = true;

      // palette copy into the shared uniform array (never mutate io.palette)
      const pal = mat.uniforms.uPalette.value;
      for (let k = 0; k < 5; k++) pal[k].copy(io.palette[k]);

      // width breathes with mid + press, beat kicks a brief spike; the
      // coil morph thins the strips so tight coils read as wire, not tape
      mat.uniforms.uWidth.value =
        (0.014 + io.bands.mid * 0.022 + io.gestures.press * 0.016 + io.beat * 0.016) *
        (1 - swayS * 0.35);
      mat.uniforms.uIntensity.value = io.intensity * (0.9 + io.level * 0.5);
      headMat.uniforms.uBeat.value = io.beat;
      headMat.uniforms.uIntensity.value = io.intensity;

      // fixed eye, nothing orbits by itself; bass breathes the dolly
      // distance and the hand lifts the eye (sway morphs the field above)
      const radius = 30 - io.bands.bass * 4;
      camera.position.x = 0;
      camera.position.z = radius;
      camera.position.y = (io.xy.y - 0.5) * 4;
      camera.lookAt(camTarget);
    },
    resize(w, h) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      mat.uniforms.uAspect.value = w / h;
    },
    dispose() {
      geo.dispose();
      mat.dispose();
      headGeo.dispose();
      headMat.dispose();
    },
  };
}
