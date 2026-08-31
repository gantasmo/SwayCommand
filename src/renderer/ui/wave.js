// Layered sinewave activity display, driven by the real analyser bands,
// bass sets the slow deep wave, mids the body, highs the ripple. Draws only
// when the canvas is visible; amplitudes ease so silence settles to calm
// lines instead of freezing.

export function createWave(canvas) {
  const ctx = canvas.getContext('2d');
  let t = 0;
  const eased = { bass: 0, mid: 0, high: 0 };

  const LAYERS = [
    { band: 'bass', freq: 1.6, speed: 0.9, amp: 0.9, width: 1.5, alpha: 0.85 },
    { band: 'mid', freq: 3.4, speed: 1.7, amp: 0.65, width: 1.0, alpha: 0.6 },
    { band: 'mid', freq: 5.2, speed: -1.2, amp: 0.5, width: 1.0, alpha: 0.4 },
    { band: 'high', freq: 9.0, speed: 2.6, amp: 0.35, width: 0.75, alpha: 0.35 },
  ];

  function fit() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (w && h && (canvas.width !== w || canvas.height !== h)) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  return {
    update(dt, bands, accentA, accentB) {
      fit();
      const w = canvas.width;
      const h = canvas.height;
      if (!w || !h) return;
      t += dt;
      const k = 1 - Math.exp(-dt * 8);
      eased.bass += (bands.bass - eased.bass) * k;
      eased.mid += (bands.mid - eased.mid) * k;
      eased.high += (bands.high - eased.high) * k;

      ctx.clearRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, accentA);
      grad.addColorStop(1, accentB);
      ctx.strokeStyle = grad;
      ctx.lineCap = 'round';

      const mid = h / 2;
      const maxAmp = h * 0.42;
      for (const layer of LAYERS) {
        const level = 0.08 + eased[layer.band] * 0.92;
        ctx.globalAlpha = layer.alpha;
        ctx.lineWidth = layer.width * (window.devicePixelRatio || 1);
        ctx.beginPath();
        for (let x = 0; x <= w; x += 3) {
          const p = x / w;
          const envelope = Math.sin(p * Math.PI); // pinch the ends
          const y = mid + Math.sin(p * layer.freq * Math.PI * 2 + t * layer.speed * 2) * maxAmp * layer.amp * level * envelope;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  };
}
