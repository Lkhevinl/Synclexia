import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import Icon from '../../components/icons/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import GoBackBtn from '../../components/GoBackBtn';
import ScreenWrapper from '../../components/ScreenWrapper';
import tokens from '../../theme/tokens';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';
import { TABLES } from '../../lib/constants';

const ACTIVITY_LABELS = {
  phonics: 'Phonics', phonics_blend: 'Blending',
  phonics_segment: 'Segmenting', spelling: 'Spelling', writing: 'Writing',
  reading: 'Reading', phonological_awareness: 'Phonological',
  phonics_activity: 'Mini Games', speech_to_text: 'Speech Practice', text_to_speech: 'Read Aloud',
};
const ACTIVITY_ICON_NAMES = {
  phonics: 'mic', phonics_blend: 'link-2',
  phonics_segment: 'scissors', spelling: 'type', writing: 'pencil',
  reading: 'book-open', phonological_awareness: 'headphones',
  phonics_activity: 'gamepad-2', speech_to_text: 'mic-2', text_to_speech: 'volume-2',
};

export default function ParentActivityLogScreen({ route }) {
  const { colors, a11yTextStyle } = useTheme();
  const { child } = route.params || {};
  const sid = child?.profiles?.id ?? child?.student_id;
  const name = child?.profiles?.full_name ?? 'Child';

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
        .from(TABLES.SESSION_LOGS)
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
            <Icon name={ACTIVITY_ICON_NAMES[session.activity_type] || 'bar-chart'} size="md" color="#607D8B" />
            <View style={{ flex: 1 }}>
              <Text style={s.sessionType}>{ACTIVITY_LABELS[session.activity_type] || session.activity_type}</Text>
              <Text style={s.sessionScore}>{session.score}/{session.total} correct</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
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
    <ScreenWrapper role="parent" padded={false}>
      <LinearGradient colors={colors.headerGradient} style={s.header}>
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
            <Icon name="layers" size="md" color={colors.primary} />
            <Text style={s.summaryText}>{sessions.length} sessions</Text>
          </View>
          <View style={s.summaryItem}>
            <Icon name="check-circle" size="md" color="#4CAF50" />
            <Text style={s.summaryText}>{avgAcc}% avg</Text>
          </View>
        </View>
      )}

      {loading ? (
        <View style={s.centered}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : error ? (
        <View style={s.errorContainer}>
          <Icon name="alert-circle" size="xl" color="#FF6B6B" />
          <Text style={s.errorTitle}>Connection Error</Text>
          <Text style={s.errorMessage}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => fetchSessions(daysBack)}>
            <Icon name="refresh-cw" size="md" color="#fff" />
            <Text style={s.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={groupedList}
          keyExtractor={item => item.date}
          renderItem={renderGroup}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchSessions(daysBack)} colors={[colors.primary]} />}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.emptyBox}>
              <Icon name="clock" size="lg" color="#ddd" />
              <Text style={s.emptyTitle}>No activity in this period</Text>
              <Text style={s.emptyHint}>Encourage {name} to practice daily!</Text>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
}

const s = StyleSheet.create({
  centered:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:        { paddingTop: 55, paddingBottom: tokens.spacing.lg, paddingHorizontal: tokens.spacing.lg },
  headerTitle:   { fontSize: 22, fontWeight: '900', color: '#fff', marginTop: tokens.spacing.md },
  headerSub:     { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  timeRow:       { flexDirection: 'row', gap: 10, padding: tokens.spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  timeBtn:       { flex: 1, paddingVertical: 9, borderRadius: tokens.radius.lg, backgroundColor: '#F3E5F5', alignItems: 'center' },
  timeBtnActive: { backgroundColor: '#7B1FA2' },
  timeText:      { fontWeight: 'bold', color: '#7B1FA2', fontSize: 13 },
  timeTextActive:{ color: '#fff' },
  summaryBar:    { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  summaryItem:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  summaryText:   { fontSize: 12, fontWeight: 'bold', color: '#555' },
  list:          { padding: tokens.spacing.md, paddingBottom: 40 },
  group:         { marginBottom: tokens.spacing.md },
  dateBadge:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing.sm },
  dateText:      { fontSize: 13, fontWeight: 'bold', color: '#7B1FA2' },
  dateCount:     { fontSize: 11, color: '#999' },
  sessionCard:   { backgroundColor: '#fff', borderRadius: tokens.radius.md, padding: tokens.spacing.md, marginBottom: 6, flexDirection: 'row', alignItems: 'center', ...tokens.shadows.low },
  sessionIcon:   { fontSize: 24, marginRight: tokens.spacing.md },
  sessionType:   { fontSize: 13, fontWeight: '600', color: '#333' },
  sessionScore:  { fontSize: 11, color: '#999', marginTop: 2 },
  accBadge:      { borderWidth: 1, borderRadius: 10, paddingHorizontal: tokens.spacing.sm, paddingVertical: 2 },
  accText:       { fontSize: 11, fontWeight: 'bold' },
  emptyBox:      { alignItems: 'center', paddingTop: 60 },
  emptyTitle:    { fontSize: 17, fontWeight: 'bold', color: '#555', marginTop: 14 },
  emptyHint:     { fontSize: 13, color: '#999', marginTop: 6, textAlign: 'center' },

  // Error state
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: tokens.spacing.xl },
  errorTitle:     { fontSize: 18, fontWeight: 'bold', color: '#FF6B6B', marginTop: tokens.spacing.md, marginBottom: tokens.spacing.sm },
  errorMessage:   { color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: tokens.spacing.lg },
  retryBtn:       { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm, backgroundColor: '#7B1FA2', paddingVertical: tokens.spacing.md, paddingHorizontal: tokens.spacing.lg, borderRadius: tokens.radius.md, ...tokens.shadows.low },
  retryBtnText:   { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
