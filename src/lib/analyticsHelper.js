// lib/analyticsHelper.js
// Session logging for all activity attempts — records every session to
// session_logs and awards XP.
import { supabase } from './supabase';

/**
 * XP awarded per activity type (base rates)
 * Bonus XP is calculated from accuracy
 */
const XP_RATES = {
  phonics: 5,
  phonics_blend: 8,
  phonics_rhyme: 8,
  phonics_segment: 8,
  spelling: 10,
  writing: 5,
  reading: 8,
  scan: 3,
  phonological_awareness: 8, // onset-rime, syllable, phoneme isolation
};

/**
 * Log a completed activity session and award XP.
 * 
 * @param {Object} params
 * @param {string} params.studentId - The student's profile UUID
 * @param {string} params.activityType - e.g. 'phonics', 'spelling', 'phonics_blend'
 * @param {number} params.score - Number of correct answers
 * @param {number} params.total - Total items in session
 * @param {number} [params.durationSeconds] - Time spent (seconds)
 * @param {Object} [params.details] - Extra info (wrong answers, words, etc.)
 * @returns {Object} { success, xpEarned, session }
 */
export const logSession = async ({ studentId, activityType, score, total, durationSeconds = 0, details = {} }) => {
  try {
    if (!studentId || !activityType) {
      return { success: false, xpEarned: 0, session: null };
    }

    const accuracy = total > 0 ? Math.round((score / total) * 10000) / 100 : 0;
    
    // Calculate XP: base rate * score (no XP for zero score)
    const baseRate = XP_RATES[activityType] || 5;
    const baseXP = baseRate * score;
    const accuracyBonus = accuracy >= 80 ? Math.round(baseXP * 0.5) : accuracy >= 50 ? Math.round(baseXP * 0.2) : 0;
    const xpEarned = baseXP + accuracyBonus;

    const basePayload = {
      activity_type: activityType,
      score,
      total,
      accuracy,
      duration_seconds: durationSeconds,
      xp_earned: xpEarned,
      details,
    };

    const isUndefinedColumn = (err) =>
      err?.code === '42703' || /column .* does not exist/i.test(err?.message || '');

    const isNotNullViolation = (err) =>
      err?.code === '23502' || /violates not-null constraint/i.test(err?.message || '');

    // 1) Insert session log
    // Support both schemas:
    // - new schema: session_logs.student_id
    // - legacy schema: session_logs.user_id
    // - some DBs may temporarily have both (e.g. migrations)
    const attempts = [
      { ...basePayload, student_id: studentId, user_id: studentId },
      { ...basePayload, student_id: studentId },
      { ...basePayload, user_id: studentId },
    ];

    let session = null;
    let logError = null;
    for (const payload of attempts) {
      const res = await supabase.from('session_logs').insert(payload).select().single();
      if (!res.error) {
        session = res.data;
        logError = null;
        break;
      }
      logError = res.error;

      // Retry only when the DB schema doesn't match our columns, or when a
      // required id column wasn't provided.
      if (!(isUndefinedColumn(logError) || isNotNullViolation(logError))) {
        break;
      }
    }

    if (logError) {
      console.warn('Session log insert failed:', logError.message);
      return { success: false, xpEarned: 0, session: null };
    }

    // 2. Award XP directly (not just from quest claiming anymore)
    if (xpEarned > 0) {
      await supabase.rpc('add_xp', { amount: xpEarned });
    }

    return { success: true, xpEarned, session };
  } catch (error) {
    console.warn('logSession error:', error.message);
    return { success: false, xpEarned: 0, session: null };
  }
};

/**
 * Get session log summary for a student.
 * 
 * @param {string} studentId
 * @param {number} [daysBack=7] - How many days of data to include
 * @returns {Object} { totalSessions, totalXP, avgAccuracy, byActivity, recentSessions }
 */
export const getStudentProgress = async (studentId, daysBack = 7) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    const isUndefinedColumn = (err) =>
      err?.code === '42703' || /column .* does not exist/i.test(err?.message || '');

    // Support both schemas (student_id vs user_id)
    let sessions = null;
    let sessErr = null;

    ({ data: sessions, error: sessErr } = await supabase
      .from('session_logs')
      .select('*')
      .eq('student_id', studentId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false }));

    if (sessErr && isUndefinedColumn(sessErr)) {
      ({ data: sessions, error: sessErr } = await supabase
        .from('session_logs')
        .select('*')
        .eq('user_id', studentId)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false }));
    }

    if (sessErr) {
      return { totalSessions: 0, totalXP: 0, avgAccuracy: 0, byActivity: {}, recentSessions: [] };
    }

    if (!sessions || sessions.length === 0) {
      return { totalSessions: 0, totalXP: 0, avgAccuracy: 0, byActivity: {}, recentSessions: [] };
    }

    const totalSessions = sessions.length;
    const totalXP = sessions.reduce((sum, s) => sum + (s.xp_earned || 0), 0);
    const avgAccuracy = Math.round(sessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / totalSessions * 100) / 100;

    // Group by activity type
    const byActivity = {};
    sessions.forEach(s => {
      if (!byActivity[s.activity_type]) {
        byActivity[s.activity_type] = { count: 0, totalScore: 0, totalItems: 0, totalXP: 0 };
      }
      byActivity[s.activity_type].count++;
      byActivity[s.activity_type].totalScore += s.score || 0;
      byActivity[s.activity_type].totalItems += s.total || 0;
      byActivity[s.activity_type].totalXP += s.xp_earned || 0;
    });

    return {
      totalSessions,
      totalXP,
      avgAccuracy,
      byActivity,
      recentSessions: sessions.slice(0, 10),
    };
  } catch (error) {
    return { totalSessions: 0, totalXP: 0, avgAccuracy: 0, byActivity: {}, recentSessions: [] };
  }
};
