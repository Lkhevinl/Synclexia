// lib/analyticsHelper.js
// Session logging for all activity attempts — records every session to
// session_logs.
import { supabase } from './supabase';
import { TABLES } from './constants';

/**
 * Log a completed activity session.
 *
 * @param {Object} params
 * @param {string} params.studentId - The student's profile UUID
 * @param {string} params.activityType - e.g. 'phonics', 'spelling', 'phonics_blend'
 * @param {number} params.score - Number of correct answers
 * @param {number} params.total - Total items in session
 * @param {number} [params.durationSeconds] - Time spent (seconds)
 * @param {Object} [params.details] - Extra info (wrong answers, words, etc.)
 * @returns {Object} { success, session }
 */
export const logSession = async ({ studentId, activityType, score, total, durationSeconds = 0, details = {} }) => {
  try {
    if (!studentId || !activityType) {
      return { success: false, session: null };
    }

    const accuracy = total > 0 ? Math.round((score / total) * 10000) / 100 : 0;

    const basePayload = {
      activity_type: activityType,
      score,
      total,
      accuracy,
      duration_seconds: durationSeconds,
      details,
    };

    const isUndefinedColumn = (err) =>
      err?.code === '42703' || /column .* does not exist/i.test(err?.message || '');

    const isNotNullViolation = (err) =>
      err?.code === '23502' || /violates not-null constraint/i.test(err?.message || '');

    // Insert session log — support both schemas (student_id vs user_id)
    const attempts = [
      { ...basePayload, student_id: studentId, user_id: studentId },
      { ...basePayload, student_id: studentId },
      { ...basePayload, user_id: studentId },
    ];

    let session = null;
    let logError = null;
    for (const payload of attempts) {
      const res = await supabase.from(TABLES.SESSION_LOGS).insert(payload).select().single();
      if (!res.error) {
        session = res.data;
        logError = null;
        break;
      }
      logError = res.error;

      if (!(isUndefinedColumn(logError) || isNotNullViolation(logError))) {
        break;
      }
    }

    if (logError) {
      console.warn('Session log insert failed:', logError.message);
      return { success: false, session: null };
    }

    return { success: true, session };
  } catch (error) {
    console.warn('logSession error:', error.message);
    return { success: false, session: null };
  }
};

/**
 * Get session log summary for a student.
 * 
 * @param {string} studentId
 * @param {number} [daysBack=7] - How many days of data to include
 * @returns {Object} { totalSessions, avgAccuracy, byActivity, recentSessions }
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
      .from(TABLES.SESSION_LOGS)
      .select('*')
      .eq('student_id', studentId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false }));

    if (sessErr && isUndefinedColumn(sessErr)) {
      ({ data: sessions, error: sessErr } = await supabase
        .from(TABLES.SESSION_LOGS)
        .select('*')
        .eq('user_id', studentId)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false }));
    }

    if (sessErr) {
      return { totalSessions: 0, avgAccuracy: 0, byActivity: {}, recentSessions: [] };
    }

    if (!sessions || sessions.length === 0) {
      return { totalSessions: 0, avgAccuracy: 0, byActivity: {}, recentSessions: [] };
    }

    const totalSessions = sessions.length;
    const avgAccuracy = Math.round(sessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / totalSessions * 100) / 100;

    // Group by activity type
    const byActivity = {};
    sessions.forEach(s => {
      if (!byActivity[s.activity_type]) {
        byActivity[s.activity_type] = { count: 0, totalScore: 0, totalItems: 0 };
      }
      byActivity[s.activity_type].count++;
      byActivity[s.activity_type].totalScore += s.score || 0;
      byActivity[s.activity_type].totalItems += s.total || 0;
    });

    return {
      totalSessions,
      avgAccuracy,
      byActivity,
      recentSessions: sessions.slice(0, 10),
    };
  } catch (error) {
    return { totalSessions: 0, avgAccuracy: 0, byActivity: {}, recentSessions: [] };
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
      .from(TABLES.PROFILES)
      .select('id, full_name, email, created_at')
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    // Get session logs for the date range (support both student_id and user_id columns)
    let sessions = [];
    const { data: byStudentId, error: err1 } = await supabase
      .from(TABLES.SESSION_LOGS)
      .select('*')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });

    if (!err1 && byStudentId) {
      sessions = byStudentId;
    } else {
      // Fallback to user_id if student_id doesn't exist
      const { data: byUserId } = await supabase
        .from(TABLES.SESSION_LOGS)
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
        dailyData[date] = { sessions: 0, accuracy: [] };
      }
      dailyData[date].sessions++;
      dailyData[date].accuracy.push(s.accuracy || 0);
    });

    const dailyTrends = Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        sessions: data.sessions,
        avgAccuracy: data.accuracy.length > 0
          ? data.accuracy.reduce((a, b) => a + b, 0) / data.accuracy.length
          : 0,
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
        };
      }
      activityBreakdown[type].count++;
      activityBreakdown[type].totalScore += s.score || 0;
      activityBreakdown[type].totalItems += s.total || 0;
      activityBreakdown[type].totalAccuracy += s.accuracy || 0;
    });

    const activityPerformance = Object.entries(activityBreakdown)
      .map(([type, data]) => ({
        activityType: type,
        totalSessions: data.count,
        avgAccuracy: data.count > 0 ? data.totalAccuracy / data.count : 0,
        completionRate: data.totalItems > 0
          ? (data.totalScore / data.totalItems) * 100
          : 0,
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

      const mostRecentDiff = sortedDates.length > 0
        ? Math.floor((today - sortedDates[0]) / (1000 * 60 * 60 * 24))
        : Infinity;
      if (mostRecentDiff <= 1) {
        for (let i = 0; i < sortedDates.length; i++) {
          const daysDiff = Math.floor((today - sortedDates[i]) / (1000 * 60 * 60 * 24));
          if (daysDiff === streak) {
            streak++;
          } else {
            break;
          }
        }
      }

      const totalSessions = studentSessionData.length;
      const avgAccuracy = totalSessions > 0
        ? studentSessionData.reduce((sum, s) => sum + (s.accuracy || 0), 0) / totalSessions
        : 0;

      return {
        ...student,
        totalSessions,
        avgAccuracy: Math.round(avgAccuracy * 100) / 100,
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
    'Streak (days)',
    'Last Active',
  ];

  const rows = students.map(s => [
    s.full_name || 'Unknown',
    s.email || 'N/A',
    s.totalSessions,
    s.avgAccuracy.toFixed(2),
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
 * Export analytics as a formatted PDF-ready HTML string.
 *
 * @param {Object} analyticsData - Output from getComprehensiveAnalytics()
 * @param {number} dateRange - Number of days the report covers
 * @returns {string} HTML string suitable for expo-print
 */
export const exportAnalyticsPDF = (analyticsData, dateRange = 30) => {
  const { overview, activityPerformance, students } = analyticsData;
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const activityRows = activityPerformance.map(a => `
    <tr>
      <td>${formatActivityType(a.activityType)}</td>
      <td>${a.totalSessions}</td>
      <td>${a.avgAccuracy.toFixed(1)}%</td>
      <td>${a.completionRate.toFixed(1)}%</td>
    </tr>`).join('');

  const studentRows = students.map(s => `
    <tr>
      <td>${s.full_name || 'Unknown'}</td>
      <td>${s.email || 'N/A'}</td>
      <td>${s.totalSessions}</td>
      <td>${s.avgAccuracy.toFixed(1)}%</td>
      <td>${s.streak > 0 ? s.streak + ' days' : '—'}</td>
      <td>${new Date(s.lastActive).toLocaleDateString()}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Synclexia Analytics Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #263238; }
    .report-header { border-bottom: 3px solid #607D8B; padding-bottom: 16px; margin-bottom: 24px; }
    .report-title { font-size: 24px; font-weight: bold; color: #37474F; margin: 0 0 4px 0; }
    .report-subtitle { font-size: 13px; color: #78909C; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    .info-table th { background: #ECEFF1; text-align: left; padding: 10px 14px; font-size: 13px; color: #546E7A; width: 200px; border: 1px solid #CFD8DC; }
    .info-table td { padding: 10px 14px; font-size: 13px; border: 1px solid #CFD8DC; }
    .section-title { font-size: 16px; font-weight: bold; color: #37474F; margin: 28px 0 12px 0; border-left: 4px solid #607D8B; padding-left: 12px; }
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
    .data-table thead th { background: #607D8B; color: #fff; padding: 10px 12px; text-align: left; }
    .data-table tbody tr:nth-child(even) { background: #FAFAFA; }
    .data-table tbody td { padding: 9px 12px; border-bottom: 1px solid #ECEFF1; }
    .footer { margin-top: 40px; border-top: 1px solid #CFD8DC; padding-top: 12px; font-size: 11px; color: #90A4AE; text-align: center; }
  </style>
</head>
<body>
  <div class="report-header">
    <p class="report-title">Synclexia Analytics Report</p>
    <p class="report-subtitle">Generated by the Synclexia Admin Dashboard</p>
  </div>

  <table class="info-table">
    <tr><th>Date Generated</th><td>${generatedDate}</td></tr>
    <tr><th>Report Period</th><td>Last ${dateRange} days</td></tr>
    <tr><th>Total Sessions</th><td>${overview.totalSessions}</td></tr>
    <tr><th>Active Students</th><td>${overview.activeStudents}</td></tr>
    <tr><th>Average Accuracy</th><td>${overview.avgAccuracy.toFixed(1)}%</td></tr>
    <tr><th>Completion Rate</th><td>${overview.completionRate.toFixed(1)}%</td></tr>
    <tr><th>Completed Activities</th><td>${overview.completedActivities}</td></tr>
  </table>

  <p class="section-title">Activity Performance Breakdown</p>
  <table class="data-table">
    <thead>
      <tr>
        <th>Activity Type</th>
        <th>Total Sessions</th>
        <th>Avg Accuracy</th>
        <th>Completion Rate</th>
      </tr>
    </thead>
    <tbody>${activityRows || '<tr><td colspan="4" style="text-align:center;color:#90A4AE;">No activity data</td></tr>'}</tbody>
  </table>

  <p class="section-title">Student Progress</p>
  <table class="data-table">
    <thead>
      <tr>
        <th>Student Name</th>
        <th>Email</th>
        <th>Sessions</th>
        <th>Avg Accuracy</th>
        <th>Streak</th>
        <th>Last Active</th>
      </tr>
    </thead>
    <tbody>${studentRows || '<tr><td colspan="6" style="text-align:center;color:#90A4AE;">No student data</td></tr>'}</tbody>
  </table>

  <div class="footer">Synclexia &mdash; Dyslexia-Friendly Learning Platform &mdash; ${generatedDate}</div>
</body>
</html>`;
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
    'phonics_segment': 'Phonics Segmenting',
    'spelling': 'Spelling',
    'writing': 'Writing Practice',
    'reading': 'Reading',
    'scan': 'Text Scan',
    'phonological_awareness': 'Phonological Awareness',
  };
  return typeMap[activityType] || activityType;
};

