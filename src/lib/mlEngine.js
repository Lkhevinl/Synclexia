// src/lib/mlEngine.js
//
// ML-inspired adaptive learning engine for Synclexia.
//
// Techniques used:
//   • EWMA   – Exponentially Weighted Moving Average (α=0.35)
//             Recent sessions carry more weight than old ones.
//   • BKT    – Bayesian Knowledge Tracing-inspired mastery probability
//             Estimates confidence-adjusted skill mastery (0–100).
//   • LR     – Linear Regression for learning velocity (% accuracy / session)
//   • EFC    – Ebbinghaus Forgetting Curve to model skill decay from inactivity.
//   • Smart Level Recommendation combining all of the above.

// ── 1. EWMA — Exponentially Weighted Moving Average ──────────────────────────
// accuracies: array of numbers, NEWEST first (matches Supabase order desc).
// alpha: smoothing factor (0–1). Higher = more weight on recent sessions.
export function computeEWMA(accuracies, alpha = 0.35) {
  if (!accuracies || accuracies.length === 0) return 0;
  // Reverse to chronological order (oldest first) for correct EWMA direction
  const chron = [...accuracies].reverse();
  let ewma = chron[0];
  for (let i = 1; i < chron.length; i++) {
    ewma = alpha * chron[i] + (1 - alpha) * ewma;
  }
  return Math.round(ewma);
}

// ── 2. Learning Velocity — Linear Regression Slope ───────────────────────────
// Returns average accuracy change per session (positive = improving).
// accuracies: NEWEST first.
export function computeLearningVelocity(accuracies) {
  if (!accuracies || accuracies.length < 4) return 0;
  const chron = [...accuracies].reverse(); // oldest first
  const n = chron.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const sumX  = x.reduce((a, b) => a + b, 0);
  const sumY  = chron.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((s, xi, i) => s + xi * chron[i], 0);
  const sumX2 = x.reduce((s, xi) => s + xi * xi, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return 0;
  return parseFloat(((n * sumXY - sumX * sumY) / denom).toFixed(2));
}

// ── 3. Trend Detection ────────────────────────────────────────────────────────
// Uses velocity threshold instead of simple half-split for accuracy.
export function computeTrend(accuracies) {
  const v = computeLearningVelocity(accuracies);
  if (accuracies.length < 4) return 'none';
  if (v >= 1.5)  return 'improving';
  if (v <= -1.5) return 'declining';
  return 'stable';
}

// ── 4. Mastery Score (0–100) — BKT-inspired ──────────────────────────────────
// Combines EWMA accuracy, session count (confidence), trend, and consistency.
// Few sessions → estimate pulled toward 50 (uncertain).
export function computeMasteryScore(ewmaAccuracy, sessions, trend, uniquePracticeDays = 0) {
  if (sessions === 0) return 0;

  let mastery = ewmaAccuracy / 100;

  // Trend modifier
  if (trend === 'improving') mastery = Math.min(1, mastery * 1.12);
  else if (trend === 'declining') mastery *= 0.82;

  // Confidence factor: fewer than 15 sessions → shrink toward 0.50 (uncertain)
  const confidence = Math.min(sessions / 15, 1);
  mastery = mastery * confidence + 0.50 * (1 - confidence);

  // Consistency bonus: practicing on multiple distinct days signals real retention
  if (uniquePracticeDays >= 10) mastery = Math.min(1, mastery * 1.08);
  else if (uniquePracticeDays >= 5) mastery = Math.min(1, mastery * 1.04);

  return Math.min(100, Math.round(mastery * 100));
}

// ── 5. Ebbinghaus Forgetting Curve ───────────────────────────────────────────
// Estimates skill retention after inactivity: R = e^(−t / S)
// Stability S grows with more sessions and higher accuracy → slower forgetting.
// Returns retention factor (0.30 – 1.0).
export function estimateRetention(daysSinceLastSession, sessions = 0, avgAccuracy = 50) {
  if (!daysSinceLastSession || daysSinceLastSession <= 0) return 1;
  const stability = 1 + (sessions / 8) + (avgAccuracy / 100) * 4;
  const retention = Math.exp(-daysSinceLastSession / stability);
  return Math.max(0.30, Math.min(1, retention));
}

// ── 6. Smart Level Recommendation ────────────────────────────────────────────
// Combines mastery + forgetting curve + velocity to suggest difficulty 1/2/3.
export function recommendLevel(masteryScore, currentLevel, velocity, daysSinceLastSession, sessions) {
  const MIN = 1, MAX = 3;

  // Apply forgetting curve: if student was away, effective mastery is lower
  const retention = estimateRetention(daysSinceLastSession, sessions, masteryScore);
  const effectiveMastery = masteryScore * retention;

  let target = currentLevel;

  if (effectiveMastery >= 85 && velocity >= 0 && (daysSinceLastSession ?? 0) < 7) {
    // High mastery, improving or stable, and recently active → level up
    target = Math.min(MAX, currentLevel + 1);
  } else if (effectiveMastery < 30 || (velocity <= -3 && effectiveMastery < 50)) {
    // Low mastery or fast decline → level down
    target = Math.max(MIN, currentLevel - 1);
  } else if (effectiveMastery < 50 && (daysSinceLastSession ?? 0) > 14 && currentLevel > MIN) {
    // Returning after long break with degraded mastery → ease back
    target = Math.max(MIN, currentLevel - 1);
  }

  return Math.max(MIN, Math.min(MAX, target));
}

// ── 7. Mastery Labels & Colors ────────────────────────────────────────────────
export function masteryLabel(score) {
  if (score >= 85) return 'Mastered';
  if (score >= 70) return 'Proficient';
  if (score >= 50) return 'Developing';
  if (score >= 30) return 'Beginning';
  return 'Needs Support';
}

export function masteryColor(score) {
  if (score >= 85) return '#4CAF50';
  if (score >= 70) return '#8BC34A';
  if (score >= 50) return '#FF9800';
  if (score >= 30) return '#FF5722';
  return '#EF5350';
}
