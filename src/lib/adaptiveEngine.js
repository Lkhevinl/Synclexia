// lib/adaptiveEngine.js
// Adaptive difficulty engine — reads and writes adaptive_state per student
// per activity. Screens call getAdaptiveLevel() before a session and
// updateAdaptiveState() after to move the student up or down.
//
// Difficulty levels:  1 = easy  |  2 = medium  |  3 = hard
// Promotion rule:  3 correct in a row with accuracy >= 70%  → level up
// Demotion rule:   accuracy < 40% on last session            → level down

import { supabase } from './supabase';

const MIN_LEVEL = 1;
const MAX_LEVEL = 3;
const PROMOTE_STREAK = 3;   // consecutive correct sessions needed
const PROMOTE_ACCURACY = 70; // minimum accuracy % to promote
const DEMOTE_ACCURACY = 40;  // accuracy % that triggers demotion

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
      .from('adaptive_state')
      .select('current_level')
      .eq('student_id', studentId)
      .eq('activity_type', activityType)
      .maybeSingle();

    if (data) return data.current_level;

    // First time — seed with level 1
    await supabase.from('adaptive_state').insert({
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
    // Fetch current state
    const { data: state } = await supabase
      .from('adaptive_state')
      .select('*')
      .eq('student_id', studentId)
      .eq('activity_type', activityType)
      .maybeSingle();

    const current = state ?? {
      student_id: studentId,
      activity_type: activityType,
      current_level: MIN_LEVEL,
      attempts: 0,
      correct_streak: 0,
    };

    let { current_level, attempts, correct_streak } = current;
    let promoted = false;
    let demoted = false;

    attempts += 1;

    // Promotion check
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
      // Neutral — reset streak
      correct_streak = 0;
    }

    // Upsert state
    await supabase.from('adaptive_state').upsert({
      student_id: studentId,
      activity_type: activityType,
      current_level,
      attempts,
      correct_streak,
      last_updated: new Date().toISOString(),
    }, { onConflict: 'student_id,activity_type' });

    return { newLevel: current_level, promoted, demoted };
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
      .from('adaptive_state')
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
