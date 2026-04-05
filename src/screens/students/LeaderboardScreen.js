import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import StudentCard from '../../components/student/StudentCard';
import StudentButton from '../../components/student/StudentButton';
import StudentPageHeader from '../../components/student/StudentPageHeader';
import StudentSectionTitle from '../../components/student/StudentSectionTitle';
import c from '../../components/student/candyTokens';

const RANGES = [
  { label: 'This Week', days: 7 },
  { label: 'This Month', days: 30 },
  { label: 'All Time', days: null },
];

const RANGE_LABELS = { week: 'This Week', month: 'This Month', all: 'All Time' };
const BORDER_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function LeaderboardScreen() {
  const { colors } = useTheme();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('week');

  useEffect(() => {
    fetchLeaders();
  }, [selectedRange]);

  const fetchLeaders = async () => {
    setLoading(true);
    const { days } = RANGES.find(range => RANGE_LABELS[range.label] === RANGE_LABELS[selectedRange]);

    if (days === null) {
      // All-time: top 10 by total XP in profiles
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, xp')
        .eq('role', 'student')
        .order('xp', { ascending: false })
        .limit(10);
      if (data) setLeaders(data.map(u => ({ ...u, total_xp: u.xp })));
    } else {
      // Filtered: sum XP earned from session_logs in the past N days
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceISO = since.toISOString();

      // Fetch session logs in range that have xp_earned
      const { data: logs } = await supabase
        .from('session_logs')
        .select('student_id, xp_earned')
        .gte('created_at', sinceISO);

      if (!logs || logs.length === 0) {
        setLeaders([]);
        setLoading(false);
        return;
      }

      // Aggregate XP per student
      const xpMap = {};
      logs.forEach(log => {
        const sid = log.student_id;
        if (!sid) return;
        xpMap[sid] = (xpMap[sid] || 0) + (log.xp_earned || 0);
      });

      // Sort and take top 10
      const sorted = Object.entries(xpMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      if (sorted.length === 0) {
        setLeaders([]);
        setLoading(false);
        return;
      }

      // Fetch profiles for these students
      const ids = sorted.map(([id]) => id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, xp')
        .in('id', ids);

      const profMap = {};
      (profiles || []).forEach(p => { profMap[p.id] = p; });

      const result = sorted.map(([id, total_xp]) => ({
        ...(profMap[id] || { id, full_name: 'Unknown', xp: 0 }),
        total_xp,
      }));

      setLeaders(result);
    }

    setLoading(false);
  };

  return (
    <ScreenWrapper role="student" style={{ backgroundColor: colors.surface }}>
      <StudentPageHeader title="Leaderboard" />

      <StudentCard variant="tinted" style={styles.hintCard}>
        <View style={styles.hintRow}>
          <Ionicons name="information-circle" size={22} color={c.primary} />
          <Text style={styles.hintText}>
            <Text style={{ fontWeight: 'bold' }}>How to use: </Text>
            Keep completing activities to climb to the top!
          </Text>
        </View>
      </StudentCard>

      {/* TIME RANGE TABS */}
      <View style={styles.tabs}>
        {['week', 'month', 'all'].map(range => (
          selectedRange === range ? (
            <StudentButton key={range} variant="primary" onPress={() => setSelectedRange(range)} style={styles.tabBtn}>
              <Text style={styles.tabTextActive}>{RANGE_LABELS[range]}</Text>
            </StudentButton>
          ) : (
            <StudentButton key={range} variant="outline" onPress={() => setSelectedRange(range)} style={styles.tabBtn}>
              <Text style={styles.tabTextInactive}>{RANGE_LABELS[range]}</Text>
            </StudentButton>
          )
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={c.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={leaders}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="podium-outline" size={64} color="#ddd" />
              <Text style={styles.emptyText}>No data yet for this period.</Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
            const borderColor = BORDER_COLORS[index] || c.primary;
            return (
              <StudentCard
                style={[styles.row, { borderLeftColor: borderColor, borderLeftWidth: 4 }]}
              >
                <Text style={styles.rank}>{medal || `#${index + 1}`}</Text>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.full_name || 'Unknown'}</Text>
                  <Text style={styles.xp}>{item.total_xp || 0} XP</Text>
                </View>
              </StudentCard>
            );
          }}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  hintCard: { marginBottom: 14 },
  hintRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  hintText: { flex: 1, fontSize: 13, color: c.textMuted, lineHeight: 19 },

  tabs: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tabBtn: { flex: 1, alignSelf: 'stretch' },
  tabTextActive: { color: '#fff', fontWeight: '700', fontSize: 12 },
  tabTextInactive: { color: c.primary, fontWeight: '700', fontSize: 12 },

  row: { marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  rank: { fontSize: 24, minWidth: 36, textAlign: 'center' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '800', color: c.text },
  xp: { fontSize: 13, color: c.textMuted, marginTop: 2 },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#aaa', marginTop: 12, fontSize: 15 },
});