// lib/adaptiveEngine.js
// ML-powered adaptive difficulty engine.
//
// Difficulty levels:  1 = easy  |  2 = medium  |  3 = hard
//
// When ≥ 5 sessions exist for an activity, level decisions are driven by:
//   • EWMA accuracy        (recent sessions count more)
//   • Mastery probability  (BKT-inspired confidence-adjusted score)
//   • Learning velocity    (linear regression slope)
//   • Forgetting curve     (Ebbinghaus decay from inactivity)
// When < 5 sessions exist, falls back to streak-based logic for new students.

import { supabase } from './supabase';
import { ADAPTIVE, TABLES } from './constants';
import {
  computeEWMA,
  computeTrend,
  computeMasteryScore,
  computeLearningVelocity,
  recommendLevel,
} from './mlEngine';

const MIN_LEVEL        = ADAPTIVE.MIN_LEVEL;
const MAX_LEVEL        = ADAPTIVE.MAX_LEVEL;
const PROMOTE_STREAK   = ADAPTIVE.PROMOTE_STREAK;
const PROMOTE_ACCURACY = ADAPTIVE.PROMOTE_ACCURACY;
const DEMOTE_ACCURACY  = ADAPTIVE.DEMOTE_ACCURACY;
const INACTIVITY_DAYS  = ADAPTIVE.INACTIVITY_STREAK_DECAY_DAYS;
const ML_MIN_SESSIONS  = 5; // switch from streak → ML after this many sessions

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Get the current adaptive difficulty level for a student + activity.
 * Creates a default row (level 1) if none exists yet.
 *
 * @param {string} studentId
 * @param {string} activityType  e.g. 'phonics', 'spelling', 'phonological_awareness'
 * @returns {number} 1 | 2 | 3
 */
export const getAdaptiveLevel = async (studentId, activityType) => {
  if (!studentId) return MIN_LEVEL;
  try {
    const { data } = await supabase
      .from(TABLES.ADAPTIVE_STATE)
      .select('current_level')
      .eq('student_id', studentId)
      .eq('activity_type', activityType)
      .maybeSingle();

    if (data) return data.current_level;

    // First time — seed with level 1
    await supabase.from(TABLES.ADAPTIVE_STATE).insert({
      student_id: studentId,
      activity_type: activityType,
      current_level: MIN_LEVEL,
      attempts: 0,
      correct_streak: 0,
    });
    return MIN_LEVEL;
  } catch (e) {
    console.warn('[adaptiveEngine] getAdaptiveLevel failed:', e);
    return MIN_LEVEL;
  }
};

/**
 * Update adaptive state after a session.
 * Handles promotion and demotion automatically.
 *
 * @param {string} studentId
 * @param {string} activityType
 * @param {number} accuracy   0–100 float
 * @returns {Object} { newLevel, promoted, demoted }
 */
export const updateAdaptiveState = async (studentId, activityType, accuracy) => {
  if (!studentId) return { newLevel: MIN_LEVEL, promoted: false, demoted: false };
  try {
    // Fetch current adaptive state + recent session history in parallel
    const [{ data: state }, { data: recentSessions }] = await Promise.all([
      supabase
        .from(TABLES.ADAPTIVE_STATE)
        .select('*')
        .eq('student_id', studentId)
        .eq('activity_type', activityType)
        .maybeSingle(),
      supabase
        .from(TABLES.SESSION_LOGS)
        .select('accuracy, created_at')
        .eq('student_id', studentId)
        .eq('activity_type', activityType)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    const current = state ?? {
      student_id: studentId,
      activity_type: activityType,
      current_level: MIN_LEVEL,
      attempts: 0,
      correct_streak: 0,
    };

    let { current_level, attempts, correct_streak, last_updated } = current;
    let promoted = false;
    let demoted = false;

    // Include this session's accuracy at the front (newest first)
    const allAccuracies = [
      accuracy,
      ...((recentSessions ?? []).map(s => s.accuracy != null ? Number(s.accuracy) : 0)),
    ];

    const daysSinceLastSession = last_updated
      ? Math.floor((Date.now() - new Date(last_updated).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    attempts += 1;

    if (allAccuracies.length >= ML_MIN_SESSIONS) {
      // ── ML path: enough history for reliable estimates ────────────────────
      const ewma           = computeEWMA(allAccuracies);
      const trend          = computeTrend(allAccuracies);
      const velocity       = computeLearningVelocity(allAccuracies);
      const uniquePracticeDays = new Set(
        (recentSessions ?? []).map(s => s.created_at?.slice(0, 10)).filter(Boolean)
      ).size;
      const mastery  = computeMasteryScore(ewma, allAccuracies.length, trend, uniquePracticeDays);
      const suggested = recommendLevel(mastery, current_level, velocity, daysSinceLastSession, allAccuracies.length);

      if (suggested > current_level) { promoted = true; correct_streak = 0; }
      if (suggested < current_level) { demoted  = true; correct_streak = 0; }
      current_level = suggested;

      // Keep streak updated (used as tiebreaker / display only)
      if (accuracy >= PROMOTE_ACCURACY) correct_streak = Math.min(correct_streak + 1, PROMOTE_STREAK);
      else if (accuracy < DEMOTE_ACCURACY) correct_streak = 0;

      await supabase.from(TABLES.ADAPTIVE_STATE).upsert({
        student_id: studentId,
        activity_type: activityType,
        current_level,
        attempts,
        correct_streak,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'student_id,activity_type' });

      return { newLevel: current_level, promoted, demoted, mastery, ewma, velocity };

    } else {
      // ── Streak path: not enough data yet, use original logic ─────────────
      // Time-decay streak for inactivity
      if (last_updated && correct_streak > 0) {
        if ((daysSinceLastSession ?? 0) >= INACTIVITY_DAYS) {
          correct_streak = Math.max(0, correct_streak - 1);
        }
      }

      if (accuracy >= PROMOTE_ACCURACY) {
        correct_streak += 1;
        if (correct_streak >= PROMOTE_STREAK && current_level < MAX_LEVEL) {
          current_level += 1;
          correct_streak = 0;
          promoted = true;
        }
      } else if (accuracy < DEMOTE_ACCURACY) {
        correct_streak = 0;
        if (current_level > MIN_LEVEL) {
          current_level -= 1;
          demoted = true;
        }
      } else {
        correct_streak = 0;
      }

      await supabase.from(TABLES.ADAPTIVE_STATE).upsert({
        student_id: studentId,
        activity_type: activityType,
        current_level,
        attempts,
        correct_streak,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'student_id,activity_type' });

      return { newLevel: current_level, promoted, demoted };
    }
  } catch (e) {
    console.warn('[adaptiveEngine] updateAdaptiveState failed:', e);
    return { newLevel: MIN_LEVEL, promoted: false, demoted: false };
  }
};

/**
 * Get all adaptive states for a student.
 *
 * @param {string} studentId
 * @returns {Array} adaptive_state rows
 */
export const getAllAdaptiveStates = async (studentId) => {
  try {
    const { data } = await supabase
      .from(TABLES.ADAPTIVE_STATE)
      .select('*')
      .eq('student_id', studentId)
      .order('activity_type');
    return data ?? [];
  } catch (e) {
    console.warn('[adaptiveEngine] getAllAdaptiveStates failed:', e);
    return [];
  }
};

/**
 * Human-readable label for a difficulty level.
 * @param {number} level 1|2|3
 */
export const levelLabel = (level) => {
  if (level === 1) return 'Easy';
  if (level === 2) return 'Medium';
  if (level === 3) return 'Hard';
  return 'Easy';
};
