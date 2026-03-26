// lib/strengthsAnalysis.js
// AI-powered strengths & weaknesses analysis engine.
// Reads session_logs + adaptive_state to build a full learning profile
// for a student and returns structured insights with recommendations.

import { supabase } from './supabase';

export const ACTIVITY_META = {
  phonics: {
    label: 'Phonics',
    icon: '🗣️',
    color: '#7C4DFF',
    route: 'Phonics',
    tip: 'Practice letter sounds daily — even 5 minutes helps!',
  },
  spelling: {
    label: 'Spelling',
    icon: '🔤',
    color: '#FF9800',
    route: 'Spelling',
    tip: 'Say words out loud while spelling — it builds memory!',
  },
  reading: {
    label: 'Reading',
    icon: '📖',
    color: '#E91E63',
    route: 'Reading',
    tip: 'Read one short story per day to build fluency.',
  },
  writing: {
    label: 'Writing',
    icon: '✍️',
    color: '#00BFA5',
    route: 'Writing',
    tip: 'Trace letters slowly and carefully for best results.',
  },
  phonological_awareness: {
    label: 'Sound Awareness',
    icon: '🎧',
    color: '#E91E63',
    route: 'PhonologicalAwareness',
    tip: 'Clapping syllables is a great warm-up exercise!',
  },
  text_recognition: {
    label: 'Magic Scanner',
    icon: '🔍',
    color: '#0288D1',
    route: 'Scan',
    tip: 'Scan books or worksheets to practice reading real text!',
  },
};

const ALL_ACTIVITIES = Object.keys(ACTIVITY_META);

const STRENGTH_THRESHOLD = 75;  // >= 75% accuracy = strength
const WEAKNESS_THRESHOLD = 50;  // <  50% accuracy = weakness

/**
 * Analyse a student's session history and return a structured learning profile.
 *
 * @param {string}  studentId
 * @param {number}  days   How many past days to include (default 60)
 * @returns {Object} Learning profile — see inline JSDoc below
 */
export async function analyzeStudentProfile(studentId, days = 60) {
  if (!studentId) return _emptyProfile();

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceISO = since.toISOString();

  // ── Fetch data in parallel ────────────────────────────────────────────────
  const [sessionsResult, adaptiveResult] = await Promise.all([
    supabase
      .from('session_logs')
      .select('activity_type, score, total, accuracy, created_at')
      .eq('student_id', studentId)
      .gte('created_at', sinceISO)
      .order('created_at', { ascending: false }),
    supabase
      .from('adaptive_state')
      .select('activity_type, current_level, attempts, correct_streak')
      .eq('student_id', studentId),
  ]);

  const sessions = sessionsResult.data ?? [];
  const adaptiveRows = adaptiveResult.data ?? [];

  // ── Build adaptive lookup ─────────────────────────────────────────────────
  const adaptiveLevels = {};
  adaptiveRows.forEach(row => {
    adaptiveLevels[row.activity_type] = {
      level: row.current_level,
      attempts: row.attempts,
      correctStreak: row.correct_streak,
    };
  });

  // ── Group sessions by activity_type ───────────────────────────────────────
  const grouped = {};
  sessions.forEach(s => {
    const key = s?.activity_type;
    if (!key) return; // skip malformed rows
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  // ── Compute per-activity metrics ──────────────────────────────────────────
  const metrics = {};
  ALL_ACTIVITIES.forEach(activity => {
    const actSessions = grouped[activity] ?? [];
    metrics[activity] = _computeMetrics(activity, actSessions, adaptiveLevels[activity]);
  });

  // ── Classify activities ───────────────────────────────────────────────────
  const strengths   = [];
  const weaknesses  = [];
  const averages    = [];
  const notPracticed = [];

  ALL_ACTIVITIES.forEach(activity => {
    const m = metrics[activity];
    if (m.totalSessions === 0) {
      notPracticed.push(activity);
    } else if (m.avgAccuracy >= STRENGTH_THRESHOLD) {
      strengths.push({ activity, ...m, ...ACTIVITY_META[activity] });
    } else if (m.avgAccuracy < WEAKNESS_THRESHOLD) {
      weaknesses.push({ activity, ...m, ...ACTIVITY_META[activity] });
    } else {
      averages.push({ activity, ...m, ...ACTIVITY_META[activity] });
    }
  });

  // Sort: strengths highest first, weaknesses lowest first
  strengths.sort((a, b) => b.avgAccuracy - a.avgAccuracy);
  weaknesses.sort((a, b) => a.avgAccuracy - b.avgAccuracy);

  // ── Overall score ─────────────────────────────────────────────────────────
  const practicedActivities = ALL_ACTIVITIES.filter(a => metrics[a].totalSessions > 0);
  const overallScore = practicedActivities.length > 0
    ? Math.round(
        practicedActivities.reduce((sum, a) => sum + metrics[a].avgAccuracy, 0) /
        practicedActivities.length
      )
    : 0;

  // ── Generate AI recommendations ───────────────────────────────────────────
  const recommendations = _generateRecommendations(weaknesses, notPracticed, strengths, metrics);

  // ── Generate learning path ────────────────────────────────────────────────
  const learningPath = _buildLearningPath(weaknesses, notPracticed, averages, adaptiveLevels);

  return {
    overallScore,
    totalSessions: sessions.length,
    activitiesPracticed: practicedActivities.length,
    strengths,
    weaknesses,
    averages,
    notPracticed,
    metrics,
    adaptiveLevels,
    recommendations,
    learningPath,
    analysisDate: new Date().toISOString(),
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _computeMetrics(activity, sessions, adaptive) {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      avgAccuracy: 0,
      recentAccuracy: 0,
      trend: 'none',
      daysSinceLastSession: null,
      adaptiveLevel: adaptive?.level ?? 1,
      insight: null,
    };
  }

  const accuracies = sessions.map(s => {
    // Use stored accuracy first; fall back to score/total
    if (s.accuracy != null) return Number(s.accuracy);
    if (s.total && s.total > 0) return (s.score / s.total) * 100;
    return 0;
  });

  const avgAccuracy = Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length);

  // Recent accuracy: last 5 sessions
  const recentSlice = accuracies.slice(0, Math.min(5, accuracies.length));
  const recentAccuracy = Math.round(recentSlice.reduce((a, b) => a + b, 0) / recentSlice.length);

  // Trend: compare first half vs second half (oldest → newest in array is reversed)
  let trend = 'stable';
  if (sessions.length >= 4) {
    const half = Math.floor(sessions.length / 2);
    const older = accuracies.slice(half);  // older sessions (higher index = older)
    const newer = accuracies.slice(0, half);
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    const newerAvg = newer.reduce((a, b) => a + b, 0) / newer.length;
    if (newerAvg - olderAvg >= 8) trend = 'improving';
    else if (olderAvg - newerAvg >= 8) trend = 'declining';
  }

  const lastSession = sessions[0];
  const daysSinceLastSession = Math.floor(
    (Date.now() - new Date(lastSession.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    totalSessions: sessions.length,
    avgAccuracy,
    recentAccuracy,
    trend,
    daysSinceLastSession,
    adaptiveLevel: adaptive?.level ?? 1,
    insight: _activityInsight(avgAccuracy, trend, sessions.length),
  };
}

function _activityInsight(avg, trend, sessions) {
  if (avg >= 90) return 'Outstanding performance — keep it up!';
  if (avg >= 75) return trend === 'improving' ? 'Great work and still getting better!' : 'Strong results consistently.';
  if (avg >= 60) return trend === 'improving' ? 'Solid progress — improvement is clear!' : 'Decent performance with room to grow.';
  if (avg >= 40) return trend === 'declining' ? 'Scores have been dropping — needs attention.' : 'Still learning — more practice will help.';
  return sessions < 3 ? 'Just getting started here.' : 'This area needs focused practice.';
}

function _generateRecommendations(weaknesses, notPracticed, strengths, metrics) {
  const recs = [];

  weaknesses.slice(0, 2).forEach(w => {
    recs.push({
      type: 'improve',
      activity: w.activity,
      title: `Focus on ${w.label}`,
      body: `Your accuracy is ${w.avgAccuracy}%. ${ACTIVITY_META[w.activity].tip}`,
      icon: ACTIVITY_META[w.activity].icon,
      color: '#FF6B6B',
    });
  });

  notPracticed.slice(0, 2).forEach(activity => {
    recs.push({
      type: 'explore',
      activity,
      title: `Try ${ACTIVITY_META[activity].label}`,
      body: `You haven't practiced this yet. ${ACTIVITY_META[activity].tip}`,
      icon: ACTIVITY_META[activity].icon,
      color: '#FF9800',
    });
  });

  strengths.slice(0, 1).forEach(s => {
    recs.push({
      type: 'celebrate',
      activity: s.activity,
      title: `${s.label} is your superpower!`,
      body: `${s.avgAccuracy}% accuracy — you're ready for even harder challenges.`,
      icon: s.icon,
      color: '#4CAF50',
    });
  });

  return recs;
}

function _buildLearningPath(weaknesses, notPracticed, averages, adaptiveLevels) {
  const path = [];

  weaknesses.forEach((w, i) => {
    path.push({
      priority: i + 1,
      activity: w.activity,
      label: ACTIVITY_META[w.activity].label,
      icon: ACTIVITY_META[w.activity].icon,
      route: ACTIVITY_META[w.activity].route,
      reason: `Low accuracy (${w.avgAccuracy}%) — needs practice`,
      suggestedLevel: 1, // restart from easy
      currentLevel: adaptiveLevels[w.activity]?.level ?? 1,
    });
  });

  notPracticed.forEach((activity, i) => {
    path.push({
      priority: weaknesses.length + i + 1,
      activity,
      label: ACTIVITY_META[activity].label,
      icon: ACTIVITY_META[activity].icon,
      route: ACTIVITY_META[activity].route,
      reason: 'Not practiced yet — explore this area!',
      suggestedLevel: 1,
      currentLevel: adaptiveLevels[activity]?.level ?? 1,
    });
  });

  averages.slice(0, 1).forEach((a, i) => {
    path.push({
      priority: weaknesses.length + notPracticed.length + i + 1,
      activity: a.activity,
      label: ACTIVITY_META[a.activity].label,
      icon: ACTIVITY_META[a.activity].icon,
      route: ACTIVITY_META[a.activity].route,
      reason: 'Average performance — consistent practice will build mastery',
      suggestedLevel: adaptiveLevels[a.activity]?.level ?? 1,
      currentLevel: adaptiveLevels[a.activity]?.level ?? 1,
    });
  });

  return path.slice(0, 4); // top 4 priorities
}

/**
 * Apply the AI-suggested learning path by adjusting adaptive difficulty levels.
 * This resets weak activities to easier content so the child can rebuild confidence.
 *
 * @param {string} studentId
 * @param {Array}  learningPath  from analyzeStudentProfile()
 * @returns {{ applied: number, errors: number }}
 */
export async function applyLearningPath(studentId, learningPath) {
  if (!studentId || !learningPath?.length) return { applied: 0, errors: 0 };

  let applied = 0;
  let errors = 0;

  for (const item of learningPath) {
    if (item.suggestedLevel === item.currentLevel) continue; // already correct
    try {
      await supabase.from('adaptive_state').upsert(
        {
          student_id: studentId,
          activity_type: item.activity,
          current_level: item.suggestedLevel,
          attempts: 0,
          correct_streak: 0,
          last_updated: new Date().toISOString(),
        },
        { onConflict: 'student_id,activity_type' }
      );
      applied++;
    } catch (e) {
      console.warn('[strengthsAnalysis] applyLearningPath upsert failed:', e);
      errors++;
    }
  }

  return { applied, errors };
}

function _emptyProfile() {
  return {
    overallScore: 0,
    totalSessions: 0,
    activitiesPracticed: 0,
    strengths: [],
    weaknesses: [],
    averages: [],
    notPracticed: ALL_ACTIVITIES,
    metrics: {},
    adaptiveLevels: {},
    recommendations: [],
    learningPath: [],
    analysisDate: new Date().toISOString(),
  };
}
