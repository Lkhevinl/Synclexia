import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GoBackBtn from '../../components/GoBackBtn';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

const ACTIVITY_LABELS = {
  phonics: '🗣️ Phonics', phonics_blend: '🔗 Blending', phonics_rhyme: '🎵 Rhyme',
  phonics_segment: '✂️ Segmenting', spelling: '🔤 Spelling', writing: '✍️ Writing',
  reading: '📖 Reading', phonological_awareness: '🎧 Phonological',
  phonics_activity: '🎮 Mini Games', speech_to_text: '🎤 Speech Practice', text_to_speech: '🔊 Read Aloud',
};

export default function ParentActivityLogScreen({ route }) {
  const { theme, a11yTextStyle } = useTheme();
  const { child } = route.params || {};
  const sid = child?.profiles?.id ?? child?.student_id;
  const name = child?.profiles?.full_name ?? 'Child';
  const insets = useSafeAreaInsets();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [daysBack, setDaysBack] = useState(14);
  const [error, setError] = useState(null);
  const subRef = useRef(null);

  const fetchSessions = useCallback(async (days) => {
    setRefreshing(true);
    setError(null);
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const { data, error } = await supabase
        .from('session_logs')
        .select('*')
        .eq('student_id', sid)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to load activity sessions. Please try again.');
        setSessions([]);
      } else {
        setSessions(data || []);
      }
    } catch (error) {
      setError('Failed to load activity sessions. Please try again.');
      setSessions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sid]);

  // Re-fetch every time screen comes into focus
  useFocusEffect(
    useCallback(() => { fetchSessions(daysBack); }, [daysBack])
  );

  // Real-time: new session logged by child
  useEffect(() => {
    if (!sid) return;
    subRef.current?.unsubscribe();
    subRef.current = supabase
      .channel(`parent-actlog-${sid}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'session_logs', filter: `student_id=eq.${sid}` },
        () => { fetchSessions(daysBack); })
      .subscribe();
    return () => subRef.current?.unsubscribe();
  }, [sid, daysBack]);

  const changeDays = (d) => { setDaysBack(d); fetchSessions(d); };

  // Group sessions by date
  const grouped = sessions.reduce((acc, s) => {
    if (!s.created_at) return acc; // Skip sessions without valid dates
    const date = new Date(s.created_at).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(s);
    return acc;
  }, {});

  const groupedList = Object.entries(grouped).map(([date, items]) => ({ date, items }));

  const totalXP = sessions.reduce((sum, s) => sum + (s.xp_earned || 0), 0);
  const avgAcc = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / sessions.length)
    : 0;

  const renderGroup = ({ item }) => (
    <View style={s.group}>
      <View style={s.dateBadge}>
        <Text style={s.dateText}>{item.date}</Text>
        <Text style={s.dateCount}>{item.items.length} session{item.items.length !== 1 ? 's' : ''}</Text>
      </View>
      {item.items.map((session, i) => {
        const accColor = session.accuracy >= 70 ? '#4CAF50' : session.accuracy >= 40 ? '#FF9800' : '#F44336';
        return (
          <View key={session.id || i} style={s.sessionCard}>
            <Text style={s.sessionIcon}>{ACTIVITY_LABELS[session.activity_type]?.split(' ')[0] || '📊'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.sessionType}>{ACTIVITY_LABELS[session.activity_type] || session.activity_type}</Text>
              <Text style={s.sessionScore}>{session.score}/{session.total} correct</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.sessionXP}>+{session.xp_earned} XP</Text>
              <View style={[s.accBadge, { backgroundColor: accColor + '20', borderColor: accColor }]}>
                <Text style={[s.accText, { color: accColor }]}>{session.accuracy}%</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={s.container}>
      <LinearGradient colors={['#7B1FA2','#4A148C']} style={s.header}>
        <GoBackBtn />
        <Text style={s.headerTitle}>Activity Log</Text>
        <Text style={s.headerSub}>{name}'s session history</Text>
      </LinearGradient>

      {/* Time Range */}
      <View style={s.timeRow}>
        {[7, 14, 30].map(d => (
          <TouchableOpacity key={d} style={[s.timeBtn, daysBack === d && s.timeBtnActive]} onPress={() => changeDays(d)}>
            <Text style={[s.timeText, daysBack === d && s.timeTextActive]}>{d} days</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary bar */}
      {sessions.length > 0 && (
        <View style={s.summaryBar}>
          <View style={s.summaryItem}>
            <Ionicons name="layers-outline" size={16} color="#7B1FA2" />
            <Text style={s.summaryText}>{sessions.length} sessions</Text>
          </View>
          <View style={s.summaryItem}>
            <Ionicons name="star-outline" size={16} color="#FF9800" />
            <Text style={s.summaryText}>{totalXP} XP earned</Text>
          </View>
          <View style={s.summaryItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
            <Text style={s.summaryText}>{avgAcc}% avg</Text>
          </View>
        </View>
      )}

      {loading ? (
        <View style={s.centered}><ActivityIndicator size="large" color="#7B1FA2" /></View>
      ) : error ? (
        <View style={s.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={s.errorTitle}>Connection Error</Text>
          <Text style={s.errorMessage}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => fetchSessions(daysBack)}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={s.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={groupedList}
          keyExtractor={item => item.date}
          renderItem={renderGroup}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchSessions(daysBack)} colors={['#7B1FA2']} />}
          contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 20 }]}
          ListEmptyComponent={
            <View style={s.emptyBox}>
              <Ionicons name="time-outline" size={60} color="#ddd" />
              <Text style={s.emptyTitle}>No activity in this period</Text>
              <Text style={s.emptyHint}>Encourage {name} to practice daily!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#F5F0FF' },
  centered:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:        { paddingTop: 55, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle:   { fontSize: 22, fontWeight: '900', color: '#fff', marginTop: 12 },
  headerSub:     { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  timeRow:       { flexDirection: 'row', gap: 10, padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  timeBtn:       { flex: 1, paddingVertical: 9, borderRadius: 20, backgroundColor: '#F3E5F5', alignItems: 'center' },
  timeBtnActive: { backgroundColor: '#7B1FA2' },
  timeText:      { fontWeight: 'bold', color: '#7B1FA2', fontSize: 13 },
  timeTextActive:{ color: '#fff' },
  summaryBar:    { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  summaryItem:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  summaryText:   { fontSize: 12, fontWeight: 'bold', color: '#555' },
  list:          { padding: 16, paddingBottom: 40 },
  group:         { marginBottom: 16 },
  dateBadge:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dateText:      { fontSize: 13, fontWeight: 'bold', color: '#7B1FA2' },
  dateCount:     { fontSize: 11, color: '#999' },
  sessionCard:   { backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 6, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  sessionIcon:   { fontSize: 24, marginRight: 12 },
  sessionType:   { fontSize: 13, fontWeight: '600', color: '#333' },
  sessionScore:  { fontSize: 11, color: '#999', marginTop: 2 },
  sessionXP:     { fontSize: 13, fontWeight: 'bold', color: '#7B1FA2', marginBottom: 4 },
  accBadge:      { borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  accText:       { fontSize: 11, fontWeight: 'bold' },
  emptyBox:      { alignItems: 'center', paddingTop: 60 },
  emptyTitle:    { fontSize: 17, fontWeight: 'bold', color: '#555', marginTop: 14 },
  emptyHint:     { fontSize: 13, color: '#999', marginTop: 6, textAlign: 'center' },

  // Error state
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  errorTitle:     { fontSize: 18, fontWeight: 'bold', color: '#FF6B6B', marginTop: 16, marginBottom: 8 },
  errorMessage:   { color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  retryBtn:       { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#7B1FA2', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, elevation: 2 },
  retryBtnText:   { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
