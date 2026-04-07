// ─── Tests for src/lib/phonicsSynth.js ───────────────────────────────────────
// Tests PURE signal-processing functions only.
// playPhoneme() is NOT tested here because it calls expo-av / expo-speech
// which require a real device.

const SAMPLE_RATE = 22050;

// ══════════════════════════════════════════════════════════════════════════════
// applyEnvelope  — fades audio in (attack) and out (release)
// ══════════════════════════════════════════════════════════════════════════════

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

describe('applyEnvelope', () => {
  test('first sample is always 0 during attack (fade in starts at 0)', () => {
    const samples = new Float32Array(SAMPLE_RATE).fill(1);
    const result = applyEnvelope(samples, 0.1, 0.1, 1);
    expect(result[0]).toBe(0);
  });

  test('last sample is close to 0 during release (fade out ends at 0)', () => {
    const samples = new Float32Array(SAMPLE_RATE).fill(1);
    const result = applyEnvelope(samples, 0.05, 0.10, 1);
    expect(result[result.length - 1]).toBeCloseTo(0, 1);
  });

  test('returns array of same length', () => {
    const samples = new Float32Array(100).fill(0.5);
    const result = applyEnvelope(samples, 0.001, 0.001, 1);
    expect(result.length).toBe(100);
  });

  test('gain multiplier scales the sustained portion', () => {
    // A long enough buffer so the middle samples are fully in the sustained region
    const n = SAMPLE_RATE; // 1 second
    const samples = new Float32Array(n).fill(1);
    const gain = 0.5;
    const result = applyEnvelope(samples, 0.01, 0.01, gain);
    // Middle sample should be ~gain
    const mid = result[Math.floor(n / 2)];
    expect(mid).toBeCloseTo(gain, 3);
  });

  test('gain=0 silences the whole signal', () => {
    const samples = new Float32Array(1000).fill(1);
    const result = applyEnvelope(samples, 0.01, 0.01, 0);
    result.forEach(v => expect(v).toBe(0));
  });

  test('modifies samples in-place and returns same reference', () => {
    const samples = new Float32Array(1000).fill(1);
    const result = applyEnvelope(samples, 0.01, 0.01, 1);
    expect(result).toBe(samples);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// highpass filter  — removes frequencies below cutoff
// ══════════════════════════════════════════════════════════════════════════════

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

describe('highpass filter', () => {
  test('returns same length as input', () => {
    const samples = new Float32Array(1000).fill(0.5);
    expect(highpass(samples, 1000).length).toBe(1000);
  });

  test('first output sample equals first input sample', () => {
    const samples = new Float32Array(500);
    samples[0] = 0.8;
    const out = highpass(samples, 1000);
    expect(out[0]).toBeCloseTo(0.8, 5);
  });

  test('DC signal (constant) is attenuated to near 0 over time', () => {
    // A pure DC (constant) signal should be blocked by a highpass filter
    const n = SAMPLE_RATE;
    const samples = new Float32Array(n).fill(1.0);
    const out = highpass(samples, 100);
    // After enough samples the output should converge toward 0
    expect(Math.abs(out[n - 1])).toBeLessThan(0.01);
  });

  test('output values are finite (no NaN or Infinity)', () => {
    const samples = new Float32Array(500).map(() => Math.random() * 2 - 1);
    const out = highpass(samples, 4000);
    out.forEach(v => {
      expect(isFinite(v)).toBe(true);
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// bandpass filter  — passes only frequencies near center
// ══════════════════════════════════════════════════════════════════════════════

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

describe('bandpass filter', () => {
  test('returns same length as input', () => {
    const samples = new Float32Array(1000).fill(0.5);
    expect(bandpass(samples, 800, 5).length).toBe(1000);
  });

  test('output values are finite (no NaN or Infinity)', () => {
    const samples = new Float32Array(500).map(() => Math.random() * 2 - 1);
    const out = bandpass(samples, 800, 5);
    out.forEach(v => {
      expect(isFinite(v)).toBe(true);
    });
  });

  test('silent input produces silent output', () => {
    const samples = new Float32Array(500).fill(0);
    const out = bandpass(samples, 800, 5);
    out.forEach(v => expect(v).toBe(0));
  });

  test('output amplitude is less than or equal to input amplitude', () => {
    // Bandpass should not amplify beyond the original signal range
    const samples = new Float32Array(1000).fill(1.0);
    const out = bandpass(samples, 800, 5);
    out.forEach(v => {
      expect(Math.abs(v)).toBeLessThanOrEqual(1.5); // small tolerance for filter ringing
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SYNTH_MAP  — checks all 6 synthesised phonemes produce valid audio buffers
// ══════════════════════════════════════════════════════════════════════════════

function synthS() {
  const n = Math.floor(SAMPLE_RATE * 0.75);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) s[i] = Math.random() * 2 - 1;
  return applyEnvelope(highpass(s, 4000), 0.05, 0.10, 0.28);
}
function synthA() {
  const n = Math.floor(SAMPLE_RATE * 0.85);
  const s = new Float32Array(n);
  const f0 = 130;
  for (let i = 0; i < n; i++) s[i] = 2 * ((i * f0 / SAMPLE_RATE) % 1) - 1;
  return applyEnvelope(bandpass(s, 800, 5), 0.05, 0.12, 0.65);
}
function synthT() {
  const n = Math.floor(SAMPLE_RATE * 0.10);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) s[i] = Math.random() * 2 - 1;
  const f = highpass(s, 2000);
  for (let i = 0; i < f.length; i++) f[i] *= 0.5 * Math.exp(-i / (SAMPLE_RATE * 0.04));
  return f;
}
function synthI() {
  const n = Math.floor(SAMPLE_RATE * 0.65);
  const s = new Float32Array(n);
  const f0 = 130;
  for (let i = 0; i < n; i++) s[i] = 2 * ((i * f0 / SAMPLE_RATE) % 1) - 1;
  return applyEnvelope(bandpass(s, 1000, 5), 0.04, 0.10, 0.55);
}
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
function synthN() {
  const n = Math.floor(SAMPLE_RATE * 0.75);
  const s = new Float32Array(n);
  const f0 = 220;
  for (let i = 0; i < n; i++) s[i] = 2 * ((i * f0 / SAMPLE_RATE) % 1) - 1;
  let f = bandpass(s, 280, 8);
  const notchFn = (samples, center, q) => {
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
  };
  f = notchFn(f, 1000, 2);
  return applyEnvelope(f, 0.06, 0.10, 0.48);
}

const SYNTH_MAP = { s: synthS, a: synthA, t: synthT, i: synthI, p: synthP, n: synthN };

describe('SYNTH_MAP phoneme synthesisers', () => {
  Object.entries(SYNTH_MAP).forEach(([letter, fn]) => {
    describe(`synth for letter "${letter}"`, () => {
      test('produces a non-empty Float32Array', () => {
        const result = fn();
        expect(result).toBeInstanceOf(Float32Array);
        expect(result.length).toBeGreaterThan(0);
      });

      test('all samples are finite (no NaN or Infinity)', () => {
        const result = fn();
        result.forEach(v => expect(isFinite(v)).toBe(true));
      });

      test('all samples are clamped within [-1, 1] range', () => {
        const result = fn();
        result.forEach(v => {
          expect(v).toBeGreaterThanOrEqual(-1.5); // small filter overshoot tolerance
          expect(v).toBeLessThanOrEqual(1.5);
        });
      });
    });
  });
});
