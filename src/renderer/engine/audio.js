// Audio analysis, WebAudio FFT split into smoothed bands with slow auto-gain
import { hostAudio } from '../host/host-channel.js';
// and a bass-onset beat detector (the Lasp/Akvj role in web form).
//
// "Just works" guarantee: if no microphone/line-in is available or permission
// is denied, an internal groove (synthesized kick/hat bus routed ONLY into the
// analyser, never to the speakers) keeps the visuals alive.

export async function createAudioEngine() {
  const ctx = new AudioContext({ latencyHint: 'interactive' });
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.55;

  const bins = analyser.frequencyBinCount;
  const freqData = new Uint8Array(bins);
  const nyquist = ctx.sampleRate / 2;
  const binOf = (hz) => Math.min(bins - 1, Math.round((hz / nyquist) * bins));
  const RANGES = {
    bass: [binOf(20), binOf(250)],
    mid: [binOf(250), binOf(2000)],
    high: [binOf(2000), binOf(9000)],
  };

  const state = {
    source: 'none', // 'input' | 'system' | 'internal' | 'none'
    deviceId: null,
    deviceLabel: '',
    level: 0,
    bands: { bass: 0, mid: 0, high: 0 },
    beat: 0,
    bpmHint: 0,
  };

  let inputNode = null;
  let inputStream = null;
  let internal = null;
  let agcMax = 0.12; // running loudness ceiling for auto-gain
  const bassHistory = new Float32Array(43); // ~0.7s at 60fps
  let bassIdx = 0;
  let lastBeatAt = 0;

  // --- external input ---------------------------------------------------------

  // Replaces whatever is currently feeding the analyser. Called by every
  // source-selection path so exactly one source is live at a time.
  function attachStream(stream, source, label, deviceId) {
    stopInternal();
    releaseInput();
    inputStream = stream;
    inputNode = ctx.createMediaStreamSource(stream);
    inputNode.connect(analyser);
    state.source = source;
    state.deviceLabel = label;
    state.deviceId = deviceId || null;
    agcMax = 0.12; // a new source can be much louder or quieter; re-converge
    return label;
  }

  function releaseInput() {
    if (inputNode) {
      inputNode.disconnect();
      inputNode = null;
    }
    if (inputStream) {
      for (const track of inputStream.getTracks()) track.stop();
      inputStream = null;
    }
  }

  async function useInput(deviceId) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    const track = stream.getAudioTracks()[0];
    // Resolve the id the browser actually granted; autoStart passes none, and
    // without this the UI cannot tell which device in the list is live.
    const settings = track && track.getSettings ? track.getSettings() : null;
    const actualId = deviceId || (settings && settings.deviceId) || null;
    return attachStream(stream, 'input', track ? track.label || 'Audio input' : 'audio input', actualId);
  }

  // System audio (Windows WASAPI loopback). Chromium requires a video source
  // for getDisplayMedia, so the video track is stopped and dropped the moment
  // the stream arrives; only loopback audio reaches the analyser.
  async function useSystemAudio() {
    const stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
    for (const track of stream.getVideoTracks()) {
      track.stop();
      stream.removeTrack(track);
    }
    if (!stream.getAudioTracks().length) {
      for (const track of stream.getTracks()) track.stop();
      throw new Error('The capture returned no audio track; system audio is unavailable on this platform.');
    }
    return attachStream(stream, 'system', 'System audio (loopback)', null);
  }

  async function listInputs() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((d) => d.kind === 'audioinput')
      .map((d) => ({ id: d.deviceId, label: d.label || 'Audio input' }));
  }

  // --- internal groove ---------------------------------------------------------
  // 120 BPM four-on-the-floor kick + offbeat hats, scheduled with a lookahead
  // timer; the bus feeds the analyser only, so it is inaudible by design.

  function startInternal() {
    if (internal) return;
    releaseInput();
    const bus = ctx.createGain();
    bus.gain.value = 1;
    bus.connect(analyser);

    const BPM = 120;
    const spb = 60 / BPM;
    let nextBeat = ctx.currentTime + 0.1;
    let step = 0;

    function scheduleKick(t) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      g.gain.setValueAtTime(1.0, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
      osc.connect(g).connect(bus);
      osc.start(t);
      osc.stop(t + 0.26);
    }
    function scheduleHat(t, loud) {
      const len = 0.06;
      const buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'highpass';
      bp.frequency.value = 6000;
      const g = ctx.createGain();
      g.gain.value = loud ? 0.5 : 0.28;
      src.connect(bp).connect(g).connect(bus);
      src.start(t);
    }

    const timer = setInterval(() => {
      while (nextBeat < ctx.currentTime + 0.3) {
        if (step % 2 === 0) scheduleKick(nextBeat);
        scheduleHat(nextBeat + spb * 0.5, step % 4 === 3);
        nextBeat += spb * 0.5;
        step++;
      }
    }, 120);

    internal = {
      stop() {
        clearInterval(timer);
        bus.disconnect();
      },
    };
    state.source = 'internal';
    state.deviceLabel = 'internal groove (120 BPM)';
    state.bpmHint = BPM;
  }

  function stopInternal() {
    if (internal) {
      internal.stop();
      internal = null;
    }
  }

  // --- per-frame analysis --------------------------------------------------------

  function bandAvg([a, b]) {
    let sum = 0;
    for (let i = a; i <= b; i++) sum += freqData[i];
    return sum / ((b - a + 1) * 255);
  }

  function update(dt) {
    // Embedded with the host as the source: theDAW analyses its own master and
    // posts bands here. Treat them as the raw read and fall through to the same
    // AGC, smoothing and beat detection, so nothing downstream can tell the
    // difference. A stale frame (host paused, tab hidden) decays to the local
    // analyser rather than freezing the visuals on the last value.
    const hostFresh = hostAudio.active && performance.now() - hostAudio.t < 500;
    if (!hostFresh) analyser.getByteFrequencyData(freqData);

    const rawBass = hostFresh ? hostAudio.bass : bandAvg(RANGES.bass);
    const rawMid = hostFresh ? hostAudio.mid : bandAvg(RANGES.mid);
    const rawHigh = hostFresh ? hostAudio.high : bandAvg(RANGES.high);
    const rawLevel = rawBass * 0.5 + rawMid * 0.35 + rawHigh * 0.15;

    // slow AGC so quiet rooms and loud rigs both land in 0..1
    agcMax = Math.max(agcMax * (1 - dt * 0.05), rawLevel, 0.06);
    const norm = (v) => Math.min(1, v / agcMax);

    const k = 1 - Math.exp(-dt * 12);
    state.bands.bass += (norm(rawBass) - state.bands.bass) * k;
    state.bands.mid += (norm(rawMid) - state.bands.mid) * k;
    state.bands.high += (norm(rawHigh) - state.bands.high) * k;
    state.level += (norm(rawLevel) - state.level) * k;

    // beat: bass onset above rolling mean, refractory 180 ms
    bassHistory[bassIdx] = rawBass;
    bassIdx = (bassIdx + 1) % bassHistory.length;
    let mean = 0;
    for (let i = 0; i < bassHistory.length; i++) mean += bassHistory[i];
    mean /= bassHistory.length;
    const now = performance.now();
    if (rawBass > mean * 1.35 && rawBass > 0.06 && now - lastBeatAt > 180) {
      state.beat = 1;
      lastBeatAt = now;
    } else {
      state.beat *= Math.exp(-dt * 6);
    }
  }

  // --- bootstrap: try the default input, fall back to the internal groove ------

  async function autoStart() {
    if (ctx.state === 'suspended') await ctx.resume().catch(() => {});
    try {
      await useInput();
    } catch {
      startInternal();
    }
    return state.source;
  }

  return {
    state,
    ctx,
    analyser, // the sampler mixes into this so triggered stems drive the visuals
    update,
    autoStart,
    useInput,
    useSystemAudio,
    listInputs,
    startInternal,
    stopInternal,
    releaseInput,
    resume: () => ctx.resume(),
  };
}
