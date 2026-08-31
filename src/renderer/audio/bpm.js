// Tempo estimate for an imported stem, onset envelope autocorrelation. Runs
// once at import when the timeline's bpm is unknown, over at most the first
// ninety seconds, so a dropped stem lands on a bar grid instead of a blank
// ruler. Returns { bpm, confidence } or null when nothing periodic is found.

export function estimateBpm(buffer) {
  if (!buffer || !buffer.length) return null;
  const sr = buffer.sampleRate;
  const take = Math.min(buffer.length, Math.floor(sr * 90));
  const hop = 512;
  const frames = Math.floor(take / hop);
  if (frames < 64) return null;

  // Mono energy per hop, log-compressed, half-wave rectified difference.
  const ch = buffer.numberOfChannels;
  const energy = new Float32Array(frames);
  for (let c = 0; c < ch; c++) {
    const d = buffer.getChannelData(c);
    for (let f = 0; f < frames; f++) {
      let s = 0;
      const o = f * hop;
      for (let i = 0; i < hop; i += 2) {
        const v = d[o + i];
        s += v * v;
      }
      energy[f] += s;
    }
  }
  const onset = new Float32Array(frames);
  let prev = 0;
  for (let f = 0; f < frames; f++) {
    const e = Math.log1p(energy[f] * 50);
    onset[f] = Math.max(0, e - prev);
    prev = e;
  }
  // Remove the slow mean so sustained level does not dominate.
  let mean = 0;
  for (let f = 0; f < frames; f++) mean += onset[f];
  mean /= frames;
  for (let f = 0; f < frames; f++) onset[f] -= mean;

  const fps = sr / hop;
  const minLag = Math.floor((60 / 200) * fps); // 200 bpm
  const maxLag = Math.ceil((60 / 60) * fps); // 60 bpm
  const ac = new Float32Array(maxLag + 1);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0;
    for (let f = lag; f < frames; f++) s += onset[f] * onset[f - lag];
    ac[lag] = s / (frames - lag);
  }
  // Mild preference for the 90 to 150 region: weight by a wide Gaussian in bpm.
  let best = -1;
  let bestV = -Infinity;
  for (let lag = minLag; lag <= maxLag; lag++) {
    const bpm = (60 * fps) / lag;
    const w = Math.exp(-Math.pow((bpm - 120) / 55, 2));
    const v = ac[lag] * (0.55 + 0.45 * w);
    if (v > bestV) {
      bestV = v;
      best = lag;
    }
  }
  if (best < 0 || bestV <= 0) return null;
  // Parabolic refinement of the peak lag.
  let lag = best;
  if (best > minLag && best < maxLag) {
    const a = ac[best - 1];
    const b = ac[best];
    const c = ac[best + 1];
    const denom = a - 2 * b + c;
    if (denom !== 0) lag = best + (0.5 * (a - c)) / denom;
  }
  let bpm = (60 * fps) / lag;
  // Octave fold: a strong half-time reading at 60 to 80 usually means 120 to 160.
  if (bpm < 80) {
    const dbl = Math.round(lag / 2);
    if (dbl >= minLag && ac[dbl] > bestV * 0.6) bpm *= 2;
  }
  let norm = 0;
  for (let f = 0; f < frames; f++) norm += onset[f] * onset[f];
  norm /= frames;
  const confidence = norm > 0 ? Math.max(0, Math.min(1, bestV / norm)) : 0;
  return { bpm: Math.round(bpm * 10) / 10, confidence };
}
