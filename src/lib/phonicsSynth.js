import { Audio } from 'expo-av';

const SAMPLE_RATE = 22050;

// ─── WAV Builder ─────────────────────────────────────────────────────────────

function buildWavBase64(samples) {
  const numSamples = samples.length;
  const byteCount = 44 + numSamples * 2;
  const buf = new ArrayBuffer(byteCount);
  const view = new DataView(buf);

  const writeStr = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
  writeStr(0, 'RIFF');
  view.setUint32(4, byteCount - 8, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true);
  }

  const bytes = new Uint8Array(buf);
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let b64 = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i], b = bytes[i + 1] ?? 0, c = bytes[i + 2] ?? 0;
    b64 += CHARS[a >> 2] + CHARS[((a & 3) << 4) | (b >> 4)]
         + (i + 1 < bytes.length ? CHARS[((b & 15) << 2) | (c >> 6)] : '=')
         + (i + 2 < bytes.length ? CHARS[c & 63] : '=');
  }
  return `data:audio/wav;base64,${b64}`;
}

// ─── Filters ─────────────────────────────────────────────────────────────────

function highpass(samples, cutoff) {
  const rc = 1 / (2 * Math.PI * cutoff);
  const dt = 1 / SAMPLE_RATE;
  const alpha = rc / (rc + dt);
  const out = new Float32Array(samples.length);
  out[0] = samples[0];
  for (let i = 1; i < samples.length; i++) {
    out[i] = alpha * (out[i - 1] + samples[i] - samples[i - 1]);
  }
  return out;
}

function bandpass(samples, center, q) {
  const w0 = (2 * Math.PI * center) / SAMPLE_RATE;
  const alpha = Math.sin(w0) / (2 * q);
  const cosW = Math.cos(w0);
  const b0 = Math.sin(w0) / 2, b1 = 0, b2 = -(Math.sin(w0) / 2);
  const a0 = 1 + alpha, a1 = -2 * cosW, a2 = 1 - alpha;
  const out = new Float32Array(samples.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < samples.length; i++) {
    const x = samples[i];
    const y = (b0 / a0) * x + (b1 / a0) * x1 + (b2 / a0) * x2 - (a1 / a0) * y1 - (a2 / a0) * y2;
    out[i] = y; x2 = x1; x1 = x; y2 = y1; y1 = y;
  }
  return out;
}

function notch(samples, center, q) {
  const w0 = (2 * Math.PI * center) / SAMPLE_RATE;
  const alpha = Math.sin(w0) / (2 * q);
  const cosW = Math.cos(w0);
  const b0 = 1, b1 = -2 * cosW, b2 = 1;
  const a0 = 1 + alpha, a1 = -2 * cosW, a2 = 1 - alpha;
  const out = new Float32Array(samples.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < samples.length; i++) {
    const x = samples[i];
    const y = (b0 / a0) * x + (b1 / a0) * x1 + (b2 / a0) * x2 - (a1 / a0) * y1 - (a2 / a0) * y2;
    out[i] = y; x2 = x1; x1 = x; y2 = y1; y1 = y;
  }
  return out;
}

function applyEnvelope(samples, attackSec, releaseSec, gain = 1) {
  const atk = Math.floor(SAMPLE_RATE * attackSec);
  const rel = Math.floor(SAMPLE_RATE * releaseSec);
  const relStart = samples.length - rel;
  for (let i = 0; i < samples.length; i++) {
    let g = gain;
    if (i < atk) g = gain * (i / atk);
    else if (i >= relStart) g = gain * (1 - (i - relStart) / rel);
    samples[i] *= g;
  }
  return samples;
}

// ─── Phoneme Synthesisers ─────────────────────────────────────────────────────

// S → high-frequency noise above 4000 Hz
function synthS() {
  const n = Math.floor(SAMPLE_RATE * 0.75);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) s[i] = Math.random() * 2 - 1;
  const f = highpass(s, 4000);
  return applyEnvelope(f, 0.05, 0.10, 0.28);
}

// A → sawtooth at 130 Hz through bandpass at 800 Hz
function synthA() {
  const n = Math.floor(SAMPLE_RATE * 0.85);
  const s = new Float32Array(n);
  const f0 = 130;
  for (let i = 0; i < n; i++) s[i] = 2 * ((i * f0 / SAMPLE_RATE) % 1) - 1;
  const f = bandpass(s, 800, 5);
  return applyEnvelope(f, 0.05, 0.12, 0.65);
}

// T → sharp noise burst, highpass 2000 Hz, exponential decay
function synthT() {
  const n = Math.floor(SAMPLE_RATE * 0.10);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) s[i] = Math.random() * 2 - 1;
  const f = highpass(s, 2000);
  for (let i = 0; i < f.length; i++) f[i] *= 0.5 * Math.exp(-i / (SAMPLE_RATE * 0.04));
  return f;
}

// I → sawtooth at 130 Hz through bandpass at 1000 Hz
function synthI() {
  const n = Math.floor(SAMPLE_RATE * 0.65);
  const s = new Float32Array(n);
  const f0 = 130;
  for (let i = 0; i < n; i++) s[i] = 2 * ((i * f0 / SAMPLE_RATE) % 1) - 1;
  const f = bandpass(s, 1000, 5);
  return applyEnvelope(f, 0.04, 0.10, 0.55);
}

// P → sine sweep 200 → 60 Hz, fast decay
function synthP() {
  const n = Math.floor(SAMPLE_RATE * 0.12);
  const s = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const freq = 200 * Math.pow(60 / 200, t / 0.12);
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    s[i] = Math.sin(phase) * 0.6 * Math.exp(-i / (SAMPLE_RATE * 0.06));
  }
  return s;
}

// N → sawtooth at 220 Hz, bandpass 280 Hz + notch 1000 Hz
function synthN() {
  const n = Math.floor(SAMPLE_RATE * 0.75);
  const s = new Float32Array(n);
  const f0 = 220;
  for (let i = 0; i < n; i++) s[i] = 2 * ((i * f0 / SAMPLE_RATE) % 1) - 1;
  let f = bandpass(s, 280, 8);
  f = notch(f, 1000, 2);
  return applyEnvelope(f, 0.06, 0.10, 0.48);
}

// ─── Phoneme map ─────────────────────────────────────────────────────────────

const SYNTH_MAP = {
  s: synthS, a: synthA, t: synthT,
  i: synthI, p: synthP, n: synthN,
};

// ─── Public player ────────────────────────────────────────────────────────────

let _sound = null;

export async function playPhoneme(letter) {
  const fn = SYNTH_MAP[letter?.toLowerCase()];
  if (!fn) return;
  try {
    if (_sound) {
      await _sound.stopAsync().catch(() => {});
      await _sound.unloadAsync().catch(() => {});
      _sound = null;
    }
    const uri = buildWavBase64(fn());
    const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true, volume: 1.0 });
    _sound = sound;
    sound.setOnPlaybackStatusUpdate((st) => {
      if (st.didJustFinish) { sound.unloadAsync().catch(() => {}); if (_sound === sound) _sound = null; }
    });
  } catch (e) {
    console.warn('phonicsSynth:', e);
  }
}
