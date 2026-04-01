import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import GoBackBtn from '../../components/GoBackBtn';
import ScreenWrapper from '../../components/ScreenWrapper';
import EmptyState from '../../components/EmptyState';

const RANGES = [
  { label: 'This Week', days: 7 },
  { label: 'This Month', days: 30 },
  { label: 'All Time', days: null },
];

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(0); // index into RANGES

  useEffect(() => {
    fetchLeaders();
  }, [range]);

  const fetchLeaders = async () => {
    setLoading(true);
    const { days } = RANGES[range];

    if (days === null) {
      // All-time: top 10 by total XP in profiles
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, xp')
        .eq('role', 'student')
        .order('xp', { ascending: false })
        .limit(10);
      if (data) setLeaders(data.map(u => ({ ...u, periodXp: u.xp })));
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

      const result = sorted.map(([id, periodXp]) => ({
        ...(profMap[id] || { id, full_name: 'Unknown', xp: 0 }),
        periodXp,
      }));

      setLeaders(result);
    }

    setLoading(false);
  };

  const getMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return null;
  };

  return (
    <ScreenWrapper style={{ backgroundColor: '#FAF5F1' }}>
      <GoBackBtn title="Hall of Fame" />

      <View style={styles.instructionHint}>
        <Ionicons name="information-circle" size={22} color="#E8927C" />
        <Text style={styles.instructionHintText}>
          <Text style={{ fontWeight: 'bold' }}>How it works: </Text>
          Students who practice the most earn the most XP and climb the leaderboard. Keep doing activities to move up!
        </Text>
      </View>

      <Text style={styles.subtitle}>
        {RANGES[range].days === null ? 'All-Time Top Students' : `Top Students — ${RANGES[range].label}`}
      </Text>

      {/* Range Selector */}
      <View style={styles.rangeRow}>
        {RANGES.map((r, i) => (
          <TouchableOpacity
            key={r.label}
            style={[styles.rangeBtn, i === range && styles.rangeBtnActive]}
            onPress={() => setRange(i)}
          >
            <Text style={[styles.rangeBtnText, i === range && styles.rangeBtnTextActive]}>
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#E8927C" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={leaders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<EmptyState message="No activity found for this period. Be the first!" />}
          renderItem={({ item, index }) => (
            <View style={[styles.card, index < 3 && styles.top3Card]}>
              <View style={styles.rankCol}>
                <Text style={styles.rankText}>{getMedal(index) || `#${index + 1}`}</Text>
              </View>

              <View style={styles.infoCol}>
                <Text style={styles.name}>{item.full_name || 'Unknown'}</Text>
                <Text style={styles.xpText}>
                  {RANGES[range].days === null
                    ? `${item.xp} XP (all time)`
                    : `${item.periodXp} XP earned`}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  instructionHint: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF0E8', borderRadius: 14, padding: 12, marginBottom: 12, gap: 10, borderWidth: 1, borderColor: '#E8927C30' },
  instructionHintText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 19 },
  subtitle: { color: '#888', textAlign: 'center', marginBottom: 12 },

  rangeRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  rangeBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#E8927C',
    backgroundColor: '#fff',
  },
  rangeBtnActive: { backgroundColor: '#E8927C', borderColor: '#E8927C' },
  rangeBtnText: { fontSize: 12, fontWeight: 'bold', color: '#E8927C' },
  rangeBtnTextActive: { color: '#fff' },

  card: {
    flexDirection: 'row', backgroundColor: '#fff', padding: 15,
    borderRadius: 15, marginBottom: 10, alignItems: 'center', elevation: 2,
  },
  top3Card: { borderWidth: 2, borderColor: '#E8927C', backgroundColor: '#FFF5F0' },

  rankCol: { width: 50, alignItems: 'center' },
  rankText: { fontSize: 24, fontWeight: 'bold', color: '#333' },

  infoCol: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  xpText: { fontSize: 12, color: '#E8927C', fontWeight: 'bold' },
});