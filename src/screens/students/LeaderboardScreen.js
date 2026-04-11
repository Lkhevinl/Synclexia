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
      // All-time: top 10 by total session count
      const { data: logs } = await supabase
        .from('session_logs')
        .select('student_id');

      if (!logs || logs.length === 0) {
        setLeaders([]);
        setLoading(false);
        return;
      }

      const countMap = {};
      logs.forEach(log => {
        const sid = log.student_id;
        if (!sid) return;
        countMap[sid] = (countMap[sid] || 0) + 1;
      });

      const sorted = Object.entries(countMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      const ids = sorted.map(([id]) => id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', ids);

      const profMap = {};
      (profiles || []).forEach(p => { profMap[p.id] = p; });

      setLeaders(sorted.map(([id, count]) => ({
        ...(profMap[id] || { id, full_name: 'Unknown' }),
        sessionCount: count,
      })));
    } else {
      // Filtered: count sessions in the past N days
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data: logs } = await supabase
        .from('session_logs')
        .select('student_id')
        .gte('created_at', since.toISOString());

      if (!logs || logs.length === 0) {
        setLeaders([]);
        setLoading(false);
        return;
      }

      const countMap = {};
      logs.forEach(log => {
        const sid = log.student_id;
        if (!sid) return;
        countMap[sid] = (countMap[sid] || 0) + 1;
      });

      const sorted = Object.entries(countMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      if (sorted.length === 0) {
        setLeaders([]);
        setLoading(false);
        return;
      }

      const ids = sorted.map(([id]) => id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', ids);

      const profMap = {};
      (profiles || []).forEach(p => { profMap[p.id] = p; });

      setLeaders(sorted.map(([id, count]) => ({
        ...(profMap[id] || { id, full_name: 'Unknown' }),
        sessionCount: count,
      })));
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
    <ScreenWrapper style={{ backgroundColor: '#FFF9C4' }}>
      <GoBackBtn />
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Hall of Fame</Text>
        <Text style={styles.subtitle}>
          {RANGES[range].days === null ? 'All-Time Top Students' : `Top Students — ${RANGES[range].label}`}
        </Text>
      </View>

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
        <ActivityIndicator size="large" color="#F57F17" style={{ marginTop: 40 }} />
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
                <Text style={styles.sessionText}>
                  {item.sessionCount} session{item.sessionCount !== 1 ? 's' : ''}
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
  header: { alignItems: 'center', marginVertical: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#F57F17' },
  subtitle: { color: '#888', marginTop: 4 },

  rangeRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  rangeBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#FFD54F',
    backgroundColor: '#fff',
  },
  rangeBtnActive: { backgroundColor: '#F57F17', borderColor: '#F57F17' },
  rangeBtnText: { fontSize: 12, fontWeight: 'bold', color: '#F57F17' },
  rangeBtnTextActive: { color: '#fff' },

  card: {
    flexDirection: 'row', backgroundColor: '#fff', padding: 15,
    borderRadius: 15, marginBottom: 10, alignItems: 'center', elevation: 2,
  },
  top3Card: { borderWidth: 2, borderColor: '#FFD700', backgroundColor: '#FFFDE7' },

  rankCol: { width: 50, alignItems: 'center' },
  rankText: { fontSize: 24, fontWeight: 'bold', color: '#333' },

  infoCol: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  sessionText: { fontSize: 12, color: '#1976D2', fontWeight: 'bold' },
});
