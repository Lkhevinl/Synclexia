// lib/strengthsAnalysis.js
// AI-powered strengths & weaknesses analysis engine.
// Reads session_logs + adaptive_state to build a full learning profile
// for a student and returns structured insights with recommendations.

import { supabase } from './supabase';
import { ANALYSIS, TABLES } from './constants';
import {
  computeEWMA,
  computeTrend,
  computeMasteryScore,
  computeLearningVelocity,
  estimateRetention,
  masteryLabel,
  masteryColor,
} from './mlEngine';

const STRENGTH_THRESHOLD      = ANALYSIS.STRENGTH_THRESHOLD;
const WEAKNESS_THRESHOLD      = ANALYSIS.WEAKNESS_THRESHOLD;
const TREND_DELTA             = ANALYSIS.TREND_DELTA;
const LEARNING_PATH_MAX_ITEMS = ANALYSIS.LEARNING_PATH_MAX_ITEMS;
const RECENT_SESSIONS_SLICE   = ANALYSIS.RECENT_SESSIONS_SLICE;

export const ACTIVITY_META = {
  phonics: {
    label: 'Phonics',
    icon: 'mic',
    color: '#7C4DFF',
    route: 'Phonics',
    tip: 'Practice letter sounds daily — even 5 minutes helps!',
  },
  phonics_blend: {
    label: 'Blend It',
    icon: 'link',
    color: '#7C4DFF',
    route: 'Phonics',
    tip: 'Tap each sound in order, then press BLEND to put the word together!',
  },
  phonics_segment: {
    label: 'Count the Sounds',
    icon: 'hash',
    color: '#5C6BC0',
    route: 'Phonics',
    tip: 'Tap the drum once for each sound you hear in the word!',
  },
  phonics_sound_match: {
    label: 'Sound Match',
    icon: 'music',
    color: '#00897B',
    route: 'Phonics',
    tip: 'Listen carefully and match the sound to the correct option!',
  },
  phonics_word_build: {
    label: 'Word Builder',
    icon: 'type',
    color: '#1E88E5',
    route: 'Phonics',
    tip: 'Tap the phoneme tiles in the correct order to build the word!',
  },
  phonics_tricky: {
    label: 'Tricky Words',
    icon: 'star',
    color: '#8E24AA',
    route: 'Phonics',
    tip: 'Sight words don\'t follow the rules — read them by heart!',
  },
  spelling: {
    label: 'Spelling',
    icon: 'type',
    color: '#FF9800',
    route: 'Spelling',
    tip: 'Say words out loud while spelling — it builds memory!',
  },
  reading: {
    label: 'Reading',
    icon: 'book-open',
    color: '#E91E63',
    route: 'Reading',
    tip: 'Read one short story per day to build fluency.',
    noScoring: true,
  },
  text_to_speech: {
    label: 'Text-to-Speech',
    icon: 'volume-2',
    color: '#009688',
    route: 'TextToSpeech',
    tip: 'Use this tool to hear words and improve listening skills.',
    noScoring: true,
  },
  speech_to_text: {
    label: 'Speech-to-Text',
    icon: 'mic',
    color: '#3F51B5',
    route: 'SpeechToText',
    tip: 'Speak clearly and use this tool to practise verbal expression.',
    noScoring: true,
  },
  writing: {
    label: 'Writing',
    icon: 'pencil',
    color: '#00BFA5',
    route: 'Writing',
    tip: 'Trace letters slowly and carefully for best results.',
  },
  phonological_awareness: {
    label: 'Sound Awareness',
    icon: 'headphones',
    color: '#E91E63',
    route: 'PhonologicalAwareness',
    tip: 'Clapping syllables is a great warm-up exercise!',
  },
  text_recognition: {
    label: 'Magic Scanner',
    icon: 'scan-line',
    color: '#0288D1',
    route: 'Scan',
    tip: 'Scan books or worksheets to practice reading real text!',
    noScoring: true,
  },
};

const ALL_ACTIVITIES    = Object.keys(ACTIVITY_META);
const SCORED_ACTIVITIES = ALL_ACTIVITIES.filter(a => !ACTIVITY_META[a].noScoring);
const PRACTICE_TOOLS    = ALL_ACTIVITIES.filter(a =>  ACTIVITY_META[a].noScoring);

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
      .from(TABLES.SESSION_LOGS)
      .select('activity_type, score, total, accuracy, created_at')
      .or(`student_id.eq.${studentId},user_id.eq.${studentId}`)
      .gte('created_at', sinceISO)
      .order('created_at', { ascending: false }),
    supabase
      .from(TABLES.ADAPTIVE_STATE)
      .select('activity_type, current_level, attempts, correct_streak')
      .or(`student_id.eq.${studentId},user_id.eq.${studentId}`),
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

  // ── Classify SCORED activities only (no-scoring tools are excluded) ───────
  const strengths    = [];
  const weaknesses   = [];
  const averages     = [];
  const notPracticed = [];

  SCORED_ACTIVITIES.forEach(activity => {
    const m = metrics[activity];
    if (m.totalSessions === 0) {
      notPracticed.push(activity);
    } else if (m.masteryScore >= STRENGTH_THRESHOLD) {
      strengths.push({ activity, ...m, ...ACTIVITY_META[activity] });
    } else if (m.masteryScore < WEAKNESS_THRESHOLD) {
      weaknesses.push({ activity, ...m, ...ACTIVITY_META[activity] });
    } else {
      averages.push({ activity, ...m, ...ACTIVITY_META[activity] });
    }
  });

  // Sort: strengths highest mastery first, weaknesses lowest mastery first
  strengths.sort((a, b) => b.masteryScore - a.masteryScore);
  weaknesses.sort((a, b) => a.masteryScore - b.masteryScore);

  // ── Practice tools (no scoring — tracked by engagement only) ─────────────
  const practiceTools = PRACTICE_TOOLS.map(activity => ({
    activity,
    ...ACTIVITY_META[activity],
    totalSessions: metrics[activity]?.totalSessions ?? 0,
    lastUsed: metrics[activity]?.daysSinceLastSession,
  })).filter(t => t.totalSessions > 0);

  // ── Overall score — scored activities only ────────────────────────────────
  const practicedActivities = SCORED_ACTIVITIES.filter(a => metrics[a].totalSessions > 0);
  const overallScore = practicedActivities.length > 0
    ? Math.round(
        practicedActivities.reduce((sum, a) => sum + metrics[a].masteryScore, 0) /
        practicedActivities.length
      )
    : 0;

  // ── Generate AI recommendations ───────────────────────────────────────────
  const recommendations = _generateRecommendations(weaknesses, notPracticed, strengths, metrics);

  // ── Generate learning path ────────────────────────────────────────────────
  const learningPath = _buildLearningPath(weaknesses, notPracticed, averages, adaptiveLevels);

  // ── Consistency score (unique practice days in last 30 days) ─────────────
  const last30 = sessions.filter(s => {
    const daysAgo = (Date.now() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 30;
  });
  const uniquePracticeDays = new Set(last30.map(s => s.created_at.slice(0, 10))).size;
  const consistencyScore   = Math.min(100, Math.round((uniquePracticeDays / 30) * 100));
  const sessionsPerWeek    = parseFloat(((sessions.length / Math.max(days, 1)) * 7).toFixed(1));

  // ── Overall mastery label ─────────────────────────────────────────────────
  const overallMasteryLabel = masteryLabel(overallScore);
  const overallMasteryColor = masteryColor(overallScore);

  return {
    overallScore,
    overallMasteryLabel,
    overallMasteryColor,
    totalSessions: sessions.length,
    activitiesPracticed: practicedActivities.length,
    consistencyScore,
    sessionsPerWeek,
    uniquePracticeDays,
    strengths,
    weaknesses,
    averages,
    notPracticed,
    practiceTools,
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
      ewmaAccuracy: 0,
      recentAccuracy: 0,
      masteryScore: 0,
      masteryLabel: 'Needs Support',
      masteryColor: '#EF5350',
      learningVelocity: 0,
      trend: 'none',
      daysSinceLastSession: null,
      adaptiveLevel: adaptive?.level ?? 1,
      insight: null,
    };
  }

  // accuracies: newest first (matches Supabase order desc)
  const accuracies = sessions.map(s => {
    if (s.accuracy != null) return Number(s.accuracy);
    if (s.total && s.total > 0) return (s.score / s.total) * 100;
    return 0;
  });

  // Simple average (kept for backward-compat display)
  const avgAccuracy = Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length);

  // ── ML metrics ────────────────────────────────────────────────────────────
  // EWMA: recent sessions count more than old ones
  const ewmaAccuracy = computeEWMA(accuracies);

  // Recent accuracy: last 5 sessions (simple avg of recent slice)
  const recentSlice    = accuracies.slice(0, Math.min(RECENT_SESSIONS_SLICE, accuracies.length));
  const recentAccuracy = Math.round(recentSlice.reduce((a, b) => a + b, 0) / recentSlice.length);

  // Trend via linear regression velocity (more reliable than half-split)
  const trend           = computeTrend(accuracies);
  const learningVelocity = computeLearningVelocity(accuracies);

  const lastSession = sessions[0];
  const daysSinceLastSession = Math.floor(
    (Date.now() - new Date(lastSession.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Unique practice days (for this activity, within the session window)
  const uniqueDays = new Set(sessions.map(s => s.created_at.slice(0, 10))).size;

  // Mastery score: BKT-inspired, confidence-adjusted
  const mScore = computeMasteryScore(ewmaAccuracy, sessions.length, trend, uniqueDays);

  // Retention factor: how much skill is retained after inactivity
  const retention = estimateRetention(daysSinceLastSession, sessions.length, ewmaAccuracy);

  return {
    totalSessions: sessions.length,
    avgAccuracy,                   // raw simple average (display only)
    ewmaAccuracy,                  // EWMA-weighted accuracy (primary ML signal)
    recentAccuracy,
    masteryScore: mScore,          // 0–100 confidence-adjusted mastery
    masteryLabel: masteryLabel(mScore),
    masteryColor: masteryColor(mScore),
    learningVelocity,              // %/session slope (positive = improving)
    retention,                     // forgetting curve retention factor
    trend,
    daysSinceLastSession,
    adaptiveLevel: adaptive?.level ?? 1,
    insight: _activityInsight(ewmaAccuracy, trend, sessions.length),
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
  const URGENCY_DAYS = 5;

  // 1. Declining trend — scored activities only (exclude no-scoring tools)
  const decliningActivities = Object.entries(metrics)
    .filter(([activity, m]) => !ACTIVITY_META[activity]?.noScoring && m.trend === 'declining' && m.totalSessions > 0)
    .sort(([, a], [, b]) => a.masteryScore - b.masteryScore);

  decliningActivities.slice(0, 1).forEach(([activity, m]) => {
    const meta = ACTIVITY_META[activity];
    if (!meta) return;
    recs.push({
      type: 'declining',
      activity,
      title: `${meta.label} scores are dropping`,
      body: `Recent accuracy around ${m.ewmaAccuracy}%. ${meta.tip}`,
      icon: meta.icon,
      color: '#EF5350',
    });
  });

  // 2. Overdue — weak activity not practiced in 5+ days
  const overdueWeak = weaknesses.find(
    w => w.daysSinceLastSession != null && w.daysSinceLastSession >= URGENCY_DAYS
      && !decliningActivities.find(([a]) => a === w.activity)
  );
  if (overdueWeak) {
    recs.push({
      type: 'overdue',
      activity: overdueWeak.activity,
      title: `Time to revisit ${overdueWeak.label}!`,
      body: `${overdueWeak.daysSinceLastSession} days without practice (last seen at ${overdueWeak.ewmaAccuracy}%). Jump back in!`,
      icon: overdueWeak.icon,
      color: '#9C27B0',
    });
  }

  // 3. Remaining weaknesses (not already covered above)
  const coveredActivities = new Set([
    ...decliningActivities.map(([a]) => a),
    overdueWeak?.activity,
  ].filter(Boolean));

  weaknesses.filter(w => !coveredActivities.has(w.activity)).slice(0, 2).forEach(w => {
    recs.push({
      type: 'improve',
      activity: w.activity,
      title: `Focus on ${w.label}`,
      body: `Mastery at ${w.masteryScore}% — ${ACTIVITY_META[w.activity].tip}`,
      icon: ACTIVITY_META[w.activity].icon,
      color: '#FF6B6B',
    });
  });

  // 4. Not explored yet
  notPracticed.slice(0, 1).forEach(activity => {
    recs.push({
      type: 'explore',
      activity,
      title: `Explore ${ACTIVITY_META[activity].label}`,
      body: `You haven't tried this yet. ${ACTIVITY_META[activity].tip}`,
      icon: ACTIVITY_META[activity].icon,
      color: '#FF9800',
    });
  });

  // 5. Celebrate top strength
  strengths.slice(0, 1).forEach(s => {
    const celebTitle = s.trend === 'improving'
      ? `${s.label} is your superpower and growing!`
      : `${s.label} is your superpower!`;
    recs.push({
      type: 'celebrate',
      activity: s.activity,
      title: celebTitle,
      body: `Mastery score ${s.masteryScore}% — you're ready for even harder challenges!`,
      icon: s.icon,
      color: '#4CAF50',
    });
  });

  return recs;
}

function _suggestLevel(activity, adaptiveLevels, m) {
  const currentLevel = adaptiveLevels[activity]?.level ?? 1;
  if (!m || m.totalSessions === 0) return 1;
  // Very low mastery → step back one level for confidence
  if (m.masteryScore < 35 && currentLevel > 1) return currentLevel - 1;
  // Declining trend → ease off to rebuild
  if (m.trend === 'declining' && currentLevel > 1) return currentLevel - 1;
  // Long absence (2+ weeks) + retention degraded → ease off slightly
  if (m.daysSinceLastSession != null && m.daysSinceLastSession > 14 && currentLevel > 1) return currentLevel - 1;
  return currentLevel;
}

function _learningPathReason(m, suggestedLevel) {
  const currentLevel = m.adaptiveLevel ?? 1;
  const willStep = suggestedLevel < currentLevel;
  if (m.trend === 'declining') {
    return willStep
      ? `Mastery dropping to ${m.masteryScore}% — easing difficulty to rebuild confidence`
      : `Scores have been dropping — focused practice needed`;
  }
  if (m.daysSinceLastSession != null && m.daysSinceLastSession > 14) {
    return `${m.daysSinceLastSession} days without practice — resuming at a comfortable level`;
  }
  if (m.masteryScore < 40) {
    return willStep
      ? `Mastery at ${m.masteryScore}% — stepping back to a more comfortable level`
      : `Mastery at ${m.masteryScore}% — extra practice needed`;
  }
  return `Mastery at ${m.masteryScore}% — keep practising to improve!`;
}

function _buildLearningPath(weaknesses, notPracticed, averages, adaptiveLevels) {
  const path = [];

  weaknesses.forEach((w, i) => {
    const suggestedLevel = _suggestLevel(w.activity, adaptiveLevels, w);
    path.push({
      priority: i + 1,
      activity: w.activity,
      label: ACTIVITY_META[w.activity].label,
      icon: ACTIVITY_META[w.activity].icon,
      route: ACTIVITY_META[w.activity].route,
      reason: _learningPathReason(w, suggestedLevel),
      suggestedLevel,
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
      reason: 'Never practiced — start exploring this skill!',
      suggestedLevel: 1,
      currentLevel: adaptiveLevels[activity]?.level ?? 1,
    });
  });

  averages.slice(0, 1).forEach((a, i) => {
    const currentLevel = adaptiveLevels[a.activity]?.level ?? 1;
    const reason = a.trend === 'improving'
      ? `Mastery growing to ${a.masteryScore}% — keep the momentum going!`
      : `Mastery at ${a.masteryScore}% — consistent practice will push you higher!`;
    path.push({
      priority: weaknesses.length + notPracticed.length + i + 1,
      activity: a.activity,
      label: ACTIVITY_META[a.activity].label,
      icon: ACTIVITY_META[a.activity].icon,
      route: ACTIVITY_META[a.activity].route,
      reason,
      suggestedLevel: currentLevel,
      currentLevel,
    });
  });

  return path.slice(0, LEARNING_PATH_MAX_ITEMS);
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
      await supabase.from(TABLES.ADAPTIVE_STATE).upsert(
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
    overallMasteryLabel: 'Needs Support',
    overallMasteryColor: '#EF5350',
    totalSessions: 0,
    activitiesPracticed: 0,
    consistencyScore: 0,
    sessionsPerWeek: 0,
    uniquePracticeDays: 0,
    strengths: [],
    weaknesses: [],
    averages: [],
    notPracticed: SCORED_ACTIVITIES,
    practiceTools: [],
    metrics: {},
    adaptiveLevels: {},
    recommendations: [],
    learningPath: [],
    analysisDate: new Date().toISOString(),
  };
}
