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

/**
 * Get comprehensive analytics for students (excludes parents).
 * Returns detailed metrics for User Progress, Activity Performance,
 * Engagement Analytics, and Performance Trends.
 *
 * @param {number} [daysBack=30] - Number of days to analyze
 * @returns {Object} Comprehensive analytics object with all metrics
 */
export const getComprehensiveAnalytics = async (daysBack = 30) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    // Get all students (exclude parents and admins)
    const { data: students } = await supabase
      .from('profiles')
      .select('id, full_name, email, created_at')
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    // Get session logs for the date range (support both student_id and user_id columns)
    let sessions = [];
    const { data: byStudentId, error: err1 } = await supabase
      .from('session_logs')
      .select('*')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });

    if (!err1 && byStudentId) {
      sessions = byStudentId;
    } else {
      // Fallback to user_id if student_id doesn't exist
      const { data: byUserId } = await supabase
        .from('session_logs')
        .select('*')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false });
      sessions = byUserId || [];
    }

    // Filter out non-student sessions (exclude parents/admins by checking student list)
    const studentIds = new Set(students?.map(s => s.id) || []);
    const studentSessions = sessions.filter(s =>
      studentIds.has(s.student_id) || studentIds.has(s.user_id)
    );

    // ──────────────────────────────────────────────────────────────────────
    // OVERVIEW METRICS
    // ──────────────────────────────────────────────────────────────────────
    const totalSessions = studentSessions.length;
    const activeStudents = new Set(
      studentSessions.map(s => s.student_id || s.user_id)
    ).size;
    const completedActivities = studentSessions.filter(
      s => (s.score || 0) >= (s.total || 1) * 0.5
    ).length;
    const avgAccuracy = totalSessions > 0
      ? studentSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / totalSessions
      : 0;

    // ──────────────────────────────────────────────────────────────────────
    // DAILY TRENDS
    // ──────────────────────────────────────────────────────────────────────
    const dailyData = {};
    studentSessions.forEach(s => {
      const date = new Date(s.created_at).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { sessions: 0, accuracy: [], xp: 0 };
      }
      dailyData[date].sessions++;
      dailyData[date].accuracy.push(s.accuracy || 0);
      dailyData[date].xp += s.xp_earned || 0;
    });

    const dailyTrends = Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        sessions: data.sessions,
        avgAccuracy: data.accuracy.length > 0
          ? data.accuracy.reduce((a, b) => a + b, 0) / data.accuracy.length
          : 0,
        totalXP: data.xp,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // ──────────────────────────────────────────────────────────────────────
    // ENGAGEMENT ANALYTICS
    // ──────────────────────────────────────────────────────────────────────
    const hourlyActivity = Array(24).fill(0);
    studentSessions.forEach(s => {
      const hour = new Date(s.created_at).getHours();
      hourlyActivity[hour]++;
    });

    const peakHours = hourlyActivity
      .map((count, hour) => ({ hour, count }))
      .filter(h => h.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const avgSessionDuration = totalSessions > 0
      ? studentSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / totalSessions
      : 0;

    // Calculate session frequency (sessions per active student)
    const sessionFrequency = activeStudents > 0 ? totalSessions / activeStudents : 0;

    // ──────────────────────────────────────────────────────────────────────
    // ACTIVITY PERFORMANCE BREAKDOWN
    // ──────────────────────────────────────────────────────────────────────
    const activityBreakdown = {};
    studentSessions.forEach(s => {
      const type = s.activity_type || 'unknown';
      if (!activityBreakdown[type]) {
        activityBreakdown[type] = {
          count: 0,
          totalScore: 0,
          totalItems: 0,
          totalAccuracy: 0,
          totalXP: 0,
        };
      }
      activityBreakdown[type].count++;
      activityBreakdown[type].totalScore += s.score || 0;
      activityBreakdown[type].totalItems += s.total || 0;
      activityBreakdown[type].totalAccuracy += s.accuracy || 0;
      activityBreakdown[type].totalXP += s.xp_earned || 0;
    });

    const activityPerformance = Object.entries(activityBreakdown)
      .map(([type, data]) => ({
        activityType: type,
        totalSessions: data.count,
        avgAccuracy: data.count > 0 ? data.totalAccuracy / data.count : 0,
        completionRate: data.totalItems > 0
          ? (data.totalScore / data.totalItems) * 100
          : 0,
        totalXP: data.totalXP,
      }))
      .sort((a, b) => b.totalSessions - a.totalSessions);

    // ──────────────────────────────────────────────────────────────────────
    // STUDENT PROGRESS (individual learner tracking with streaks)
    // ──────────────────────────────────────────────────────────────────────
    const studentProgress = (students || []).map(student => {
      const studentSessionData = studentSessions.filter(s =>
        s.student_id === student.id || s.user_id === student.id
      );

      const sortedSessions = studentSessionData.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      // Calculate streak (consecutive days with activity)
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activityDates = new Set();
      sortedSessions.forEach(s => {
        const sessionDate = new Date(s.created_at);
        sessionDate.setHours(0, 0, 0, 0);
        activityDates.add(sessionDate.getTime());
      });

      const sortedDates = Array.from(activityDates).sort((a, b) => b - a);

      for (let i = 0; i < sortedDates.length; i++) {
        const daysDiff = Math.floor((today - sortedDates[i]) / (1000 * 60 * 60 * 24));
        if (daysDiff === streak) {
          streak++;
        } else {
          break;
        }
      }

      const totalSessions = studentSessionData.length;
      const totalXP = studentSessionData.reduce((sum, s) => sum + (s.xp_earned || 0), 0);
      const avgAccuracy = totalSessions > 0
        ? studentSessionData.reduce((sum, s) => sum + (s.accuracy || 0), 0) / totalSessions
        : 0;

      return {
        ...student,
        totalSessions,
        avgAccuracy: Math.round(avgAccuracy * 100) / 100,
        totalXP,
        lastActive: sortedSessions[0]?.created_at || student.created_at,
        streak,
      };
    }).sort((a, b) => b.totalSessions - a.totalSessions);

    // ──────────────────────────────────────────────────────────────────────
    // RETURN COMPREHENSIVE ANALYTICS
    // ──────────────────────────────────────────────────────────────────────
    return {
      overview: {
        totalSessions,
        activeStudents,
        totalActivities: totalSessions,
        completedActivities,
        completionRate: totalSessions > 0 ? (completedActivities / totalSessions) * 100 : 0,
        avgAccuracy: Math.round(avgAccuracy * 100) / 100,
      },
      trends: {
        daily: dailyTrends,
      },
      engagement: {
        peakHours,
        avgSessionDuration: Math.round(avgSessionDuration),
        sessionFrequency: Math.round(sessionFrequency * 100) / 100,
        totalActiveStudents: activeStudents,
      },
      activityPerformance,
      students: studentProgress,
    };
  } catch (error) {
    console.error('getComprehensiveAnalytics error:', error);
    return {
      overview: {
        totalSessions: 0,
        activeStudents: 0,
        totalActivities: 0,
        completedActivities: 0,
        completionRate: 0,
        avgAccuracy: 0,
      },
      trends: { daily: [] },
      engagement: {
        peakHours: [],
        avgSessionDuration: 0,
        sessionFrequency: 0,
        totalActiveStudents: 0,
      },
      activityPerformance: [],
      students: [],
    };
  }
};

/**
 * Export analytics as CSV format.
 *
 * @param {Object} analyticsData - Output from getComprehensiveAnalytics()
 * @returns {string} CSV formatted string
 */
export const exportAnalyticsCSV = (analyticsData) => {
  const { students } = analyticsData;

  const headers = [
    'Student Name',
    'Email',
    'Total Sessions',
    'Avg Accuracy (%)',
    'Total XP',
    'Streak (days)',
    'Last Active',
  ];

  const rows = students.map(s => [
    s.full_name || 'Unknown',
    s.email || 'N/A',
    s.totalSessions,
    s.avgAccuracy.toFixed(2),
    s.totalXP,
    s.streak,
    new Date(s.lastActive).toLocaleDateString(),
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

/**
 * Export analytics as JSON format.
 *
 * @param {Object} analyticsData - Output from getComprehensiveAnalytics()
 * @returns {string} JSON formatted string
 */
export const exportAnalyticsJSON = (analyticsData) => {
  return JSON.stringify(analyticsData, null, 2);
};

/**
 * Format activity type name for display.
 *
 * @param {string} activityType
 * @returns {string} Formatted name
 */
export const formatActivityType = (activityType) => {
  const typeMap = {
    'phonics': 'Phonics',
    'phonics_blend': 'Phonics Blending',
    'phonics_rhyme': 'Phonics Rhyming',
    'phonics_segment': 'Phonics Segmenting',
    'spelling': 'Spelling',
    'writing': 'Writing Practice',
    'reading': 'Reading',
    'scan': 'Text Scan',
    'phonological_awareness': 'Phonological Awareness',
  };
  return typeMap[activityType] || activityType;
};

