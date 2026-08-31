// Voxels, an N x N slab of boxes whose heights form a living heightfield.
// Bass pumps radial waves out from the center, each pad hit drops a stone
// into its own patch of the grid (expanding ripple), and the hand drags a
// gaussian hill across the field. Press crushes everything flat; beat pops
// the whole slab up a notch. Palette maps low cells to palette[0] and
// peaks to palette[4]. See docs/SCENE_CONTRACT.md.

export const meta = { id: 'voxels', name: 'Voxels', mood: 'chunky' };

const SIZE = 40;        // world-space extent of the field (fixed; N is resolution)
const MAX_RIPPLES = 12; // preallocated ripple pool, round-robin reuse
const H_MAX = 7;        // height that counts as a "peak" for color mapping

export function createScene(ctx) {
  const { THREE, quality } = ctx;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.016);
  const camera = new THREE.PerspectiveCamera(55, ctx.width / ctx.height, 0.1, 400);
  camera.position.set(0, 20, 44);

  // grid resolution by tier, instance count stays comfortably under ~1k
  const N = quality.tier === 'high' ? 32 : quality.tier === 'low' ? 20 : 26;
  const COUNT = N * N;
  const cell = SIZE / N;

  // --- the voxel slab: one InstancedMesh, unit-height boxes with their base
  // at y=0 so scaling Y grows them straight up out of the floor
  const boxGeo = new THREE.BoxGeometry(cell * 0.82, 1, cell * 0.82);
  boxGeo.translate(0, 0.5, 0);
  const boxMat = new THREE.MeshLambertMaterial();
  const voxels = new THREE.InstancedMesh(boxGeo, boxMat, COUNT);
  voxels.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(voxels);

  // lights give the boxes readable faces; all hue still comes from the
  // per-instance palette colors these merely modulate
  const sun = new THREE.DirectionalLight(0xffffff, 2.4);
  sun.position.set(18, 30, 12);
  scene.add(sun);
  const fill = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(fill);

  // --- faint floor grid extends the field into the dark
  const grid = new THREE.GridHelper(SIZE * 1.7, 34, 0xffffff, 0xffffff);
  grid.material.transparent = true;
  grid.material.opacity = 0.1;
  grid.material.blending = THREE.AdditiveBlending;
  grid.material.depthWrite = false;
  grid.position.y = -0.05;
  scene.add(grid);

  // --- per-cell constants, computed once
  const cellX = new Float32Array(COUNT);
  const cellZ = new Float32Array(COUNT);
  const cellR = new Float32Array(COUNT);    // distance from field center
  const cellFall = new Float32Array(COUNT); // radial falloff for the bass wave
  for (let gz = 0; gz < N; gz++) {
    for (let gx = 0; gx < N; gx++) {
      const i = gz * N + gx;
      cellX[i] = (gx + 0.5) * cell - SIZE / 2;
      cellZ[i] = (gz + 0.5) * cell - SIZE / 2;
      cellR[i] = Math.sqrt(cellX[i] * cellX[i] + cellZ[i] * cellZ[i]);
      cellFall[i] = Math.exp(-cellR[i] * 0.03);
    }
  }

  // 16 pads map to a 4x4 lattice of impact points across the field
  const padX = new Float32Array(16);
  const padZ = new Float32Array(16);
  for (let i = 0; i < 16; i++) {
    padX[i] = ((i % 4) + 0.5) * (SIZE / 4) - SIZE / 2;
    padZ[i] = (((i / 4) | 0) + 0.5) * (SIZE / 4) - SIZE / 2;
  }

  // --- preallocated ripple pool (position, expanding radius, decaying amp)
  const rX = new Float32Array(MAX_RIPPLES);
  const rZ = new Float32Array(MAX_RIPPLES);
  const rRad = new Float32Array(MAX_RIPPLES);
  const rAmp = new Float32Array(MAX_RIPPLES);
  let rNext = 0;
  const prevPads = new Float32Array(16); // for rising-edge detection

  // --- preallocated scratch
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  const c = new THREE.Color();
  const camTarget = new THREE.Vector3(0, 2, 0);

  // prime the instance color buffer so instanceColor exists before frame one
  c.setRGB(0, 0, 0);
  for (let i = 0; i < COUNT; i++) voxels.setColorAt(i, c);
  voxels.instanceColor.setUsage(THREE.DynamicDrawUsage);

  return {
    scene,
    camera,
    update(dt, t, io) {
      const bass = io.bands.bass;
      const crush = 1 - io.gestures.press * 0.85; // press flattens the field
      const pop = 1 + io.beat * 0.1;              // beat lifts everything ~10%

      // pad rising edges spawn ripples at their lattice point
      for (let i = 0; i < 16; i++) {
        const v = io.pads[i];
        if (v > 0.1 && v > prevPads[i] + 0.05) {
          rX[rNext] = padX[i];
          rZ[rNext] = padZ[i];
          rRad[rNext] = 0;
          rAmp[rNext] = 2.5 + v * 3.5;
          rNext = (rNext + 1) % MAX_RIPPLES;
        }
        prevPads[i] = v;
      }

      // ripples expand outward and bleed away
      for (let k = 0; k < MAX_RIPPLES; k++) {
        if (rAmp[k] <= 0.02) continue;
        rRad[k] += dt * 16;
        rAmp[k] *= Math.pow(0.25, dt);
      }

      // hand position in field space (y=0 is near edge)
      const hx = (io.xy.x - 0.5) * SIZE;
      const hz = (0.5 - io.xy.y) * SIZE;

      for (let i = 0; i < COUNT; i++) {
        const x = cellX[i];
        const z = cellZ[i];

        // gentle idle breathing so the slab never sits dead still
        let h = 0.55 + 0.25 * Math.sin(t * 0.7 + cellR[i] * 0.4);

        // bass-driven radial waves rolling out from the center
        h += bass * 2.8 * (0.5 + 0.5 * Math.sin(cellR[i] * 0.5 - t * 4.5)) * cellFall[i];

        // pad ripples: a gaussian ring at each ripple's current radius
        for (let k = 0; k < MAX_RIPPLES; k++) {
          const a = rAmp[k];
          if (a <= 0.02) continue;
          const dx = x - rX[k];
          const dz = z - rZ[k];
          const d = Math.sqrt(dx * dx + dz * dz) - rRad[k];
          h += a * Math.exp(-d * d * 0.35);
        }

        // gaussian hill under the hand
        const bx = x - hx;
        const bz = z - hz;
        h += 3.5 * Math.exp(-(bx * bx + bz * bz) * 0.03);

        h = Math.max(0.15, h) * crush * pop;
        h = Math.max(0.08, h);

        p.set(x, 0, z);
        s.set(1, h, 1);
        m.compose(p, q, s);
        voxels.setMatrixAt(i, m);

        // color by height band: valleys palette[0], peaks palette[4]
        const hn = Math.min(1, h / H_MAX);
        const f = hn * 4;
        const i0 = f | 0;
        c.copy(io.palette[i0]);
        if (i0 < 4) c.lerp(io.palette[i0 + 1], f - i0);
        c.multiplyScalar(0.3 + hn * 1.1 * io.intensity);
        voxels.setColorAt(i, c);
      }
      voxels.instanceMatrix.needsUpdate = true;
      voxels.instanceColor.needsUpdate = true;

      // fixed viewpoint, nothing auto-rotates (user rule); sway leans it,
      // hand height sets elevation
      const orbit = (io.gestures.sway - 0.5) * 1.0;
      camera.position.x = Math.sin(orbit) * 44;
      camera.position.z = Math.cos(orbit) * 44;
      camera.position.y = 10 + io.xy.y * 22 + io.beat * 0.8;
      camera.lookAt(camTarget);

      grid.material.opacity = 0.05 + bass * 0.15;
    },
    resize(w, h) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    dispose() {
      voxels.dispose(); // frees the instanceMatrix/instanceColor GPU buffers
      boxGeo.dispose();
      boxMat.dispose();
      grid.geometry.dispose();
      grid.material.dispose();
    },
  };
}
