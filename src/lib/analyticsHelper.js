// lib/analyticsHelper.js
// Session logging for all activity attempts — records every session to
// session_logs, awards XP/coins, marks assignments complete, and
// provides aggregated progress data for the Teacher Progress screen.
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
    
    // Calculate XP: base rate * score + accuracy bonus
    const baseRate = XP_RATES[activityType] || 5;
    const baseXP = baseRate * Math.max(score, 1);
    const accuracyBonus = accuracy >= 80 ? Math.round(baseXP * 0.5) : accuracy >= 50 ? Math.round(baseXP * 0.2) : 0;
    const xpEarned = baseXP + accuracyBonus;

    // 1. Insert session log
    const { data: session, error: logError } = await supabase
      .from('session_logs')
      .insert({
        student_id: studentId,
        activity_type: activityType,
        score,
        total,
        accuracy,
        duration_seconds: durationSeconds,
        xp_earned: xpEarned,
        details,
      })
      .select()
      .single();

    if (logError) {
      console.warn('Session log insert failed:', logError.message);
      return { success: false, xpEarned: 0, session: null };
    }

    // 2. Award XP directly (not just from quest claiming anymore)
    if (xpEarned > 0) {
      await supabase.rpc('add_xp', { amount: xpEarned });
    }

    // 3. Award small coin bonus for high accuracy
    if (accuracy >= 80) {
      const coinBonus = Math.round(xpEarned / 5);
      if (coinBonus > 0) {
        await supabase.rpc('add_coins', { amount: coinBonus });
      }
    }

    // 4. Mark matching assignments as completed
    await markAssignmentComplete(studentId, activityType);

    return { success: true, xpEarned, session };
  } catch (error) {
    console.warn('logSession error:', error.message);
    return { success: false, xpEarned: 0, session: null };
  }
};

/**
 * Mark an assignment as completed if one exists for this activity type.
 */
const markAssignmentComplete = async (studentId, activityType) => {
  try {
    // Map sub-types back to main assignment types
    const typeMap = {
      phonics_blend: 'phonics',
      phonics_rhyme: 'phonics',
      phonics_segment: 'phonics',
    };
    const assignmentType = typeMap[activityType] || activityType;

    const { data: assignments } = await supabase
      .from('assignments')
      .select('id, is_completed')
      .eq('student_id', studentId)
      .eq('activity_type', assignmentType)
      .eq('is_completed', false);

    if (assignments && assignments.length > 0) {
      // Mark the first uncompleted assignment as done
      await supabase
        .from('assignments')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', assignments[0].id);
    }
  } catch (error) {
    // Non-critical — silently fail
  }
};

/**
 * Get session log summary for a student (used by teacher progress screen).
 * 
 * @param {string} studentId
 * @param {number} [daysBack=7] - How many days of data to include
 * @returns {Object} { totalSessions, totalXP, avgAccuracy, byActivity, recentSessions }
 */
export const getStudentProgress = async (studentId, daysBack = 7) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    const { data: sessions } = await supabase
      .from('session_logs')
      .select('*')
      .eq('student_id', studentId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });

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
