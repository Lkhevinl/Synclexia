import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GoBackBtn from '../../components/GoBackBtn';
import { useFocusEffect } from '@react-navigation/native';
import { getStudentProgress } from '../../lib/analyticsHelper';
import { getAllAdaptiveStates, levelLabel } from '../../lib/adaptiveEngine';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

const ACTIVITY_LABELS = {
  phonics: '🗣️ Phonics', phonics_blend: '🔗 Blending', phonics_rhyme: '🎵 Rhyme',
  phonics_segment: '✂️ Segmenting', spelling: '🔤 Spelling', writing: '✍️ Writing',
  reading: '📖 Reading', phonological_awareness: '🎧 Phonological',
  phonics_activity: '🎮 Mini Games', speech_to_text: '🎤 Speech Practice', text_to_speech: '🔊 Read Aloud',
};

export default function ParentProgressScreen({ route }) {
  const { theme, a11yTextStyle } = useTheme();
  const { child } = route.params || {};
  const sid = child?.profiles?.id ?? child?.student_id;
  const name = child?.profiles?.full_name ?? 'Child';
  const insets = useSafeAreaInsets();

  const [daysBack, setDaysBack] = useState(14);
  const [progress, setProgress] = useState(null);
  const [adaptive, setAdaptive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const subRef = useRef(null);

  const load = useCallback(async (days) => {
    setLoading(true);
    setError(null);
    try {
      const [prog, adap] = await Promise.all([
        getStudentProgress(sid, days),
        getAllAdaptiveStates(sid),
      ]);
      setProgress(prog);
      setAdaptive(adap || []);
    } catch (error) {
      setError('Failed to load progress data. Please check your connection and try again.');
      setProgress({ totalSessions: 0, totalXP: 0, avgAccuracy: 0, byActivity: {}, recentSessions: [] });
      setAdaptive([]);
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
    <View style={s.container}>
      <LinearGradient colors={['#7B1FA2','#4A148C']} style={s.header}>
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
        <View style={s.centered}><ActivityIndicator size="large" color="#7B1FA2" /></View>
      ) : error ? (
        <View style={s.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={s.errorTitle}>Connection Error</Text>
          <Text style={s.errorMessage}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => load(daysBack)}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={s.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 20 }]}>
          {/* Summary */}
          <View style={s.card}>
            <Text style={s.cardTitle}>📊 Summary</Text>
            <View style={s.summaryRow}>
              <View style={s.summaryItem}>
                <Text style={s.summaryVal}>{progress?.totalSessions ?? 0}</Text>
                <Text style={s.summaryLbl}>Sessions</Text>
              </View>
              <View style={s.summaryDiv} />
              <View style={s.summaryItem}>
                <Text style={[s.summaryVal, { color: '#4CAF50' }]}>{progress?.totalXP ?? 0}</Text>
                <Text style={s.summaryLbl}>XP Earned</Text>
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
            <Text style={s.cardTitle}>🎯 Activity Breakdown</Text>
            {Object.keys(progress?.byActivity ?? {}).length === 0 ? (
              <Text style={s.emptyText}>No activity in this period.</Text>
            ) : Object.entries(progress.byActivity).map(([type, data]) => {
              const acc = data.totalItems > 0 ? Math.round((data.totalScore / data.totalItems) * 100) : 0;
              const color = acc >= 70 ? '#4CAF50' : acc >= 40 ? '#FF9800' : '#F44336';
              return (
                <View key={type} style={s.breakRow}>
                  <Text style={s.breakIcon}>{ACTIVITY_LABELS[type]?.split(' ')[0] || '📊'}</Text>
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
              <Text style={s.cardTitle}>🎮 Difficulty Levels</Text>
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

          {/* Recent Sessions */}
          {(progress?.recentSessions?.length ?? 0) > 0 && (
            <View style={s.card}>
              <Text style={s.cardTitle}>🕐 Recent Sessions</Text>
              {progress.recentSessions.map((session, i) => (
                <View key={session.id || i} style={s.sessionRow}>
                  <Text style={s.sessionIcon}>{ACTIVITY_LABELS[session.activity_type]?.split(' ')[0] || '📊'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.sessionType}>{ACTIVITY_LABELS[session.activity_type] || session.activity_type}</Text>
                    <Text style={s.sessionDate}>{new Date(session.created_at).toLocaleDateString()} · {session.score}/{session.total}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.sessionXP}>+{session.xp_earned} XP</Text>
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
              <Ionicons name="bar-chart-outline" size={60} color="#ddd" />
              <Text style={s.emptyTitle}>No activity yet</Text>
              <Text style={s.emptyHint}>Encourage {name} to complete some activities!</Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F5F0FF' },
  centered:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:       { paddingTop: 55, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle:  { fontSize: 22, fontWeight: '900', color: '#fff', marginTop: 12 },
  headerSub:    { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  timeRow:      { flexDirection: 'row', gap: 10, padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  timeBtn:      { flex: 1, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F3E5F5', alignItems: 'center' },
  timeBtnActive:{ backgroundColor: '#7B1FA2' },
  timeText:     { fontWeight: 'bold', color: '#7B1FA2', fontSize: 13 },
  timeTextActive:{ color: '#fff' },
  scroll:       { padding: 16 },
  card:         { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 14, elevation: 2 },
  cardTitle:    { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  cardSub:      { fontSize: 11, color: '#999', marginBottom: 12 },
  summaryRow:   { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12 },
  summaryItem:  { alignItems: 'center' },
  summaryVal:   { fontSize: 24, fontWeight: 'bold', color: '#333' },
  summaryLbl:   { fontSize: 10, color: '#999', marginTop: 3, fontWeight: '600' },
  summaryDiv:   { width: 1, backgroundColor: '#f0f0f0' },
  breakRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  breakIcon:    { fontSize: 24, width: 32 },
  breakTop:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  breakLabel:   { fontSize: 13, fontWeight: '600', color: '#333' },
  breakSessions:{ fontSize: 11, color: '#999' },
  barBg:        { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden' },
  barFill:      { height: '100%', borderRadius: 3 },
  breakAcc:     { fontSize: 13, fontWeight: 'bold', width: 38, textAlign: 'right' },
  adaptRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  adaptLabel:   { fontSize: 14, color: '#333' },
  adaptRight:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  adaptAttempts:{ fontSize: 11, color: '#999' },
  levelBadge:   { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 3 },
  levelText:    { fontSize: 12, fontWeight: 'bold' },
  sessionRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  sessionIcon:  { fontSize: 22, marginRight: 10 },
  sessionType:  { fontSize: 13, fontWeight: '600', color: '#333' },
  sessionDate:  { fontSize: 11, color: '#999', marginTop: 1 },
  sessionXP:    { fontSize: 13, fontWeight: 'bold', color: '#7B1FA2' },
  sessionAcc:   { fontSize: 11, fontWeight: 'bold' },
  emptyText:    { color: '#bbb', textAlign: 'center', paddingVertical: 20 },
  emptyCard:    { alignItems: 'center', paddingVertical: 40 },
  emptyTitle:   { fontSize: 18, fontWeight: 'bold', color: '#555', marginTop: 14 },
  emptyHint:    { fontSize: 13, color: '#999', marginTop: 6, textAlign: 'center' },

  // Error state
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  errorTitle:     { fontSize: 18, fontWeight: 'bold', color: '#FF6B6B', marginTop: 16, marginBottom: 8 },
  errorMessage:   { color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  retryBtn:       { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#7B1FA2', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, elevation: 2 },
  retryBtnText:   { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
