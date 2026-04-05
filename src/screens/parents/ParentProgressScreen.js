import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from '../../components/icons/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import GoBackBtn from '../../components/GoBackBtn';
import ScreenWrapper from '../../components/ScreenWrapper';
import tokens from '../../theme/tokens';
import { useFocusEffect } from '@react-navigation/native';
import { getStudentProgress } from '../../lib/analyticsHelper';
import { getAllAdaptiveStates, levelLabel } from '../../lib/adaptiveEngine';
import { analyzeStudentProfile, ACTIVITY_META } from '../../lib/strengthsAnalysis';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

const ACTIVITY_LABELS = {
  phonics: 'Phonics', phonics_blend: 'Blending', phonics_rhyme: 'Rhyme',
  phonics_segment: 'Segmenting', spelling: 'Spelling', writing: 'Writing',
  reading: 'Reading', phonological_awareness: 'Phonological',
  phonics_activity: 'Mini Games', speech_to_text: 'Speech Practice', text_to_speech: 'Read Aloud',
};
const ACTIVITY_ICON_NAMES = {
  phonics: 'mic', phonics_blend: 'link-2', phonics_rhyme: 'music',
  phonics_segment: 'scissors', spelling: 'type', writing: 'pencil',
  reading: 'book-open', phonological_awareness: 'headphones',
  phonics_activity: 'gamepad-2', speech_to_text: 'mic-2', text_to_speech: 'volume-2',
};

export default function ParentProgressScreen({ route }) {
  const { colors, a11yTextStyle } = useTheme();
  const { child } = route.params || {};
  const sid = child?.profiles?.id ?? child?.student_id;
  const name = child?.profiles?.full_name ?? 'Child';

  const [daysBack, setDaysBack] = useState(14);
  const [progress, setProgress] = useState(null);
  const [adaptive, setAdaptive] = useState([]);
  const [aiProfile, setAiProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const subRef = useRef(null);

  const load = useCallback(async (days) => {
    setLoading(true);
    setError(null);
    try {
      const [prog, adap, aiData] = await Promise.all([
        getStudentProgress(sid, days),
        getAllAdaptiveStates(sid),
        analyzeStudentProfile(sid, 60),
      ]);
      setProgress(prog);
      setAdaptive(adap || []);
      setAiProfile(aiData);
    } catch (error) {
      console.warn('[ParentProgressScreen] load failed:', error);
      setError('Failed to load progress data. Please check your connection and try again.');
      setProgress({ totalSessions: 0, avgAccuracy: 0, byActivity: {}, recentSessions: [] });
      setAdaptive([]);
      setAiProfile(null);
    } finally {
      setLoading(false);
    }
  }, [sid]);

  // Re-fetch every time screen comes into focus or daysBack changes
  useFocusEffect(
    useCallback(() => { load(daysBack); }, [daysBack, load])
  );

  const changeDays = (d) => { setDaysBack(d); };

  // Real-time: re-fetch when child logs a new session
  useEffect(() => {
    if (!sid) return;
    subRef.current?.unsubscribe();
    subRef.current = supabase
      .channel(`parent-progress-sessions-${sid}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'session_logs', filter: `student_id=eq.${sid}` },
        () => { load(daysBack); })
      .subscribe();
    return () => subRef.current?.unsubscribe();
  }, [sid, daysBack]);

  return (
    <ScreenWrapper role="parent" scrollable>
      <LinearGradient colors={colors.headerGradient} style={s.header}>
        <GoBackBtn />
        <Text style={s.headerTitle}>Progress Report</Text>
        <Text style={s.headerSub}>{name}'s learning analytics</Text>
      </LinearGradient>

      {/* Time Range */}
      <View style={s.timeRow}>
        {[7, 14, 30].map(d => (
          <TouchableOpacity key={d} style={[s.timeBtn, daysBack === d && s.timeBtnActive]} onPress={() => changeDays(d)}>
            <Text style={[s.timeText, daysBack === d && s.timeTextActive]}>{d} days</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.centered}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : error ? (
        <View style={s.errorContainer}>
          <Icon name="alert-circle" size="xl" color="#FF6B6B" />
          <Text style={s.errorTitle}>Connection Error</Text>
          <Text style={s.errorMessage}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => load(daysBack)}>
            <Icon name="refresh-cw" size="md" color="#fff" />
            <Text style={s.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Summary */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Summary</Text>
            <View style={s.summaryRow}>
              <View style={s.summaryItem}>
                <Text style={s.summaryVal}>{progress?.totalSessions ?? 0}</Text>
                <Text style={s.summaryLbl}>Sessions</Text>
              </View>
              <View style={s.summaryDiv} />
              <View style={s.summaryItem}>
                <Text style={[s.summaryVal, {
                  color: (progress?.avgAccuracy ?? 0) >= 70 ? '#4CAF50' : (progress?.avgAccuracy ?? 0) >= 40 ? '#FF9800' : '#F44336'
                }]}>{progress?.avgAccuracy ?? 0}%</Text>
                <Text style={s.summaryLbl}>Avg Accuracy</Text>
              </View>
            </View>
          </View>

          {/* Activity Breakdown with bars */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Activity Breakdown</Text>
            {Object.keys(progress?.byActivity ?? {}).length === 0 ? (
              <Text style={s.emptyText}>No activity in this period.</Text>
            ) : Object.entries(progress.byActivity).map(([type, data]) => {
              const acc = data.totalItems > 0 ? Math.round((data.totalScore / data.totalItems) * 100) : 0;
              const color = acc >= 70 ? '#4CAF50' : acc >= 40 ? '#FF9800' : '#F44336';
              return (
                <View key={type} style={s.breakRow}>
                  <Icon name={ACTIVITY_ICON_NAMES[type] || 'bar-chart'} size="md" color="#607D8B" />
                  <View style={{ flex: 1 }}>
                    <View style={s.breakTop}>
                      <Text style={s.breakLabel}>{ACTIVITY_LABELS[type] || type}</Text>
                      <Text style={s.breakSessions}>{data.count} sessions</Text>
                    </View>
                    <View style={s.barBg}>
                      <View style={[s.barFill, { width: `${Math.min(acc, 100)}%`, backgroundColor: color }]} />
                    </View>
                  </View>
                  <Text style={[s.breakAcc, { color }]}>{acc}%</Text>
                </View>
              );
            })}
          </View>

          {/* Adaptive Difficulty Levels */}
          {adaptive.length > 0 && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Difficulty Levels</Text>
              <Text style={s.cardSub}>System-adjusted based on performance</Text>
              {adaptive.map(a => {
                const color = a.current_level === 1 ? '#4CAF50' : a.current_level === 2 ? '#FF9800' : '#F44336';
                const label = levelLabel(a.current_level);
                return (
                  <View key={a.activity_type} style={s.adaptRow}>
                    <Text style={s.adaptLabel}>{ACTIVITY_LABELS[a.activity_type] || a.activity_type}</Text>
                    <View style={s.adaptRight}>
                      <Text style={s.adaptAttempts}>{a.attempts || 0} attempts</Text>
                      <View style={[s.levelBadge, { backgroundColor: color + '20', borderColor: color }]}>
                        <Text style={[s.levelText, { color }]}>{label}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* AI Strengths & Weaknesses */}
          {aiProfile && aiProfile.totalSessions > 0 && (
            <View style={s.card}>
              <Text style={s.cardTitle}>AI Strength & Weakness Analysis</Text>
              <Text style={s.cardSub}>Based on last 60 days of activity</Text>

              {/* Overall Score */}
              <View style={s.aiScoreRow}>
                <View style={[s.aiScoreBadge, {
                  backgroundColor: aiProfile.overallScore >= 75 ? '#E8F5E9' : aiProfile.overallScore >= 50 ? '#FFF8E1' : '#FFEBEE',
                  borderColor: aiProfile.overallScore >= 75 ? '#4CAF50' : aiProfile.overallScore >= 50 ? '#FF9800' : '#EF5350',
                }]}>
                  <Text style={[s.aiScoreNum, {
                    color: aiProfile.overallScore >= 75 ? '#2E7D32' : aiProfile.overallScore >= 50 ? '#E65100' : '#B71C1C',
                  }]}>{aiProfile.overallScore}%</Text>
                  <Text style={s.aiScoreLbl}>Overall</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.aiScoreDesc}>
                    {aiProfile.overallScore >= 75 ? `${name} is excelling! Keep up the great work.` :
                     aiProfile.overallScore >= 50 ? `${name} is making steady progress. A little more practice will help!` :
                     `${name} needs more support in some areas. Focus on the weaknesses below.`}
                  </Text>
                </View>
              </View>

              {aiProfile.strengths.length > 0 && (
                <>
                  <Text style={[s.aiGroupLabel, { color: '#2E7D32' }]}>Strengths</Text>
                  {aiProfile.strengths.map(item => (
                    <View key={item.activity} style={s.aiItemRow}>
                      <Icon name={item.icon} size="sm" color="#2E7D32" />
                      <Text style={s.aiItemLabel}>{item.label}</Text>
                      <View style={s.aiBar}>
                        <View style={[s.aiBarFill, { width: `${Math.min(item.avgAccuracy, 100)}%`, backgroundColor: '#4CAF50' }]} />
                      </View>
                      <Text style={[s.aiItemScore, { color: '#2E7D32' }]}>{item.avgAccuracy}%</Text>
                    </View>
                  ))}
                </>
              )}

              {aiProfile.weaknesses.length > 0 && (
                <>
                  <Text style={[s.aiGroupLabel, { color: '#E65100', marginTop: 10 }]}>Needs Focus</Text>
                  {aiProfile.weaknesses.map(item => (
                    <View key={item.activity} style={s.aiItemRow}>
                      <Icon name={item.icon} size="sm" color="#EF5350" />
                      <Text style={s.aiItemLabel}>{item.label}</Text>
                      <View style={s.aiBar}>
                        <View style={[s.aiBarFill, { width: `${Math.min(item.avgAccuracy, 100)}%`, backgroundColor: '#EF5350' }]} />
                      </View>
                      <Text style={[s.aiItemScore, { color: '#EF5350' }]}>{item.avgAccuracy}%</Text>
                    </View>
                  ))}
                </>
              )}

              {aiProfile.notPracticed.length > 0 && (
                <View style={s.aiNotPracticedBox}>
                  <Text style={s.aiNotPracticedTitle}>Not practiced yet:</Text>
                  <Text style={s.aiNotPracticedList}>
                    {aiProfile.notPracticed.map(a => ACTIVITY_META[a]?.label).filter(Boolean).join(' · ')}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Recent Sessions */}
          {(progress?.recentSessions?.length ?? 0) > 0 && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Recent Sessions</Text>
              {progress.recentSessions.map((session, i) => (
                <View key={session.id || i} style={s.sessionRow}>
                  <Icon name={ACTIVITY_ICON_NAMES[session.activity_type] || 'bar-chart'} size="md" color="#607D8B" />
                  <View style={{ flex: 1 }}>
                    <Text style={s.sessionType}>{ACTIVITY_LABELS[session.activity_type] || session.activity_type}</Text>
                    <Text style={s.sessionDate}>{new Date(session.created_at).toLocaleDateString()} · {session.score}/{session.total}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[s.sessionAcc, {
                      color: session.accuracy >= 70 ? '#4CAF50' : session.accuracy >= 40 ? '#FF9800' : '#F44336'
                    }]}>{session.accuracy}%</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {progress?.totalSessions === 0 && (
            <View style={s.emptyCard}>
              <Icon name="bar-chart" size="lg" color="#ddd" />
              <Text style={s.emptyTitle}>No activity yet</Text>
              <Text style={s.emptyHint}>Encourage {name} to complete some activities!</Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </>
      )}
    </ScreenWrapper>
  );
}

const s = StyleSheet.create({
  centered:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:       { paddingTop: 55, paddingBottom: tokens.spacing.lg, paddingHorizontal: tokens.spacing.lg, marginHorizontal: -tokens.spacing.md },
  headerTitle:  { fontSize: 22, fontWeight: '900', color: '#fff', marginTop: tokens.spacing.md },
  headerSub:    { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  timeRow:      { flexDirection: 'row', gap: 10, padding: tokens.spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: -tokens.spacing.md },
  timeBtn:      { flex: 1, paddingVertical: 10, borderRadius: tokens.radius.lg, backgroundColor: '#F3E5F5', alignItems: 'center' },
  timeBtnActive:{ backgroundColor: '#7B1FA2' },
  timeText:     { fontWeight: 'bold', color: '#7B1FA2', fontSize: 13 },
  timeTextActive:{ color: '#fff' },
  card:         { backgroundColor: '#fff', borderRadius: tokens.radius.md, padding: tokens.spacing.md, marginBottom: 14, ...tokens.shadows.low },
  cardTitle:    { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: tokens.spacing.xs },
  cardSub:      { fontSize: 11, color: '#999', marginBottom: tokens.spacing.md },
  summaryRow:   { flexDirection: 'row', justifyContent: 'space-around', paddingTop: tokens.spacing.md },
  summaryItem:  { alignItems: 'center' },
  summaryVal:   { fontSize: 24, fontWeight: 'bold', color: '#333' },
  summaryLbl:   { fontSize: 10, color: '#999', marginTop: 3, fontWeight: '600' },
  summaryDiv:   { width: 1, backgroundColor: '#f0f0f0' },
  breakRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  breakIcon:    { fontSize: 24, width: 32 },
  breakTop:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: tokens.spacing.xs },
  breakLabel:   { fontSize: 13, fontWeight: '600', color: '#333' },
  breakSessions:{ fontSize: 11, color: '#999' },
  barBg:        { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden' },
  barFill:      { height: '100%', borderRadius: 3 },
  breakAcc:     { fontSize: 13, fontWeight: 'bold', width: 38, textAlign: 'right' },
  adaptRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  adaptLabel:   { fontSize: 14, color: '#333' },
  adaptRight:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  adaptAttempts:{ fontSize: 11, color: '#999' },
  levelBadge:   { borderWidth: 1, borderRadius: tokens.radius.md, paddingHorizontal: tokens.spacing.md, paddingVertical: 3 },
  levelText:    { fontSize: 12, fontWeight: 'bold' },
  sessionRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: tokens.spacing.sm, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  sessionIcon:  { fontSize: 22, marginRight: 10 },
  sessionType:  { fontSize: 13, fontWeight: '600', color: '#333' },
  sessionDate:  { fontSize: 11, color: '#999', marginTop: 1 },
  sessionXP:    { fontSize: 13, fontWeight: 'bold', color: '#7B1FA2' },
  sessionAcc:   { fontSize: 11, fontWeight: 'bold' },
  emptyText:    { color: '#bbb', textAlign: 'center', paddingVertical: tokens.spacing.lg },
  emptyCard:    { alignItems: 'center', paddingVertical: 40 },
  emptyTitle:   { fontSize: 18, fontWeight: 'bold', color: '#555', marginTop: 14 },
  emptyHint:    { fontSize: 13, color: '#999', marginTop: 6, textAlign: 'center' },

  // AI analysis styles
  aiScoreRow:           { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  aiScoreBadge:         { width: 72, height: 72, borderRadius: 36, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
  aiScoreNum:           { fontSize: 22, fontWeight: 'bold' },
  aiScoreLbl:           { fontSize: 9, fontWeight: '700', color: '#999', textTransform: 'uppercase' },
  aiScoreDesc:          { fontSize: 13, color: '#555', lineHeight: 18 },
  aiGroupLabel:         { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: tokens.spacing.sm },
  aiItemRow:            { flexDirection: 'row', alignItems: 'center', marginBottom: tokens.spacing.sm, gap: 6 },
  aiItemIcon:           { fontSize: 16, width: 22 },
  aiItemLabel:          { width: 90, fontSize: 12, fontWeight: '600', color: '#444' },
  aiBar:                { flex: 1, height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden' },
  aiBarFill:            { height: '100%', borderRadius: 3 },
  aiItemScore:          { width: 36, fontSize: 12, fontWeight: 'bold', textAlign: 'right' },
  aiNotPracticedBox:    { backgroundColor: '#FFF8E1', borderRadius: 10, padding: 10, marginTop: 10 },
  aiNotPracticedTitle:  { fontSize: 11, fontWeight: '700', color: '#F57C00', marginBottom: tokens.spacing.xs },
  aiNotPracticedList:   { fontSize: 12, color: '#795548', lineHeight: 18 },

  // Error state
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: tokens.spacing.xl },
  errorTitle:     { fontSize: 18, fontWeight: 'bold', color: '#FF6B6B', marginTop: tokens.spacing.md, marginBottom: tokens.spacing.sm },
  errorMessage:   { color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: tokens.spacing.lg },
  retryBtn:       { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm, backgroundColor: '#7B1FA2', paddingVertical: tokens.spacing.md, paddingHorizontal: tokens.spacing.lg, borderRadius: tokens.radius.md, ...tokens.shadows.low },
  retryBtnText:   { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
