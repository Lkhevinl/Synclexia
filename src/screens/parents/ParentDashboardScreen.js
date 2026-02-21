// screens/parents/ParentDashboardScreen.js
// Parents can view the progress of their linked children.
// A parent account is linked to a student via the parent_links table.
// Read-only: parents cannot assign activities or post notifications.

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { getStudentProgress } from '../../lib/analyticsHelper';
import { getAllAdaptiveStates, levelLabel } from '../../lib/adaptiveEngine';

const ACTIVITY_LABELS = {
  phonics:                  '🗣️ Phonics',
  phonics_blend:            '🔗 Blending',
  phonics_rhyme:            '🎵 Rhyme',
  phonics_segment:          '✂️ Segmenting',
  spelling:                 '🔤 Spelling',
  writing:                  '✍️ Writing',
  reading:                  '📖 Reading',
  scan:                     '📷 Scan',
  phonological_awareness:   '🎧 Phonological',
};

export default function ParentDashboardScreen({ navigation }) {
  const { profile, signOut } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [progress, setProgress] = useState(null);
  const [adaptiveStates, setAdaptiveStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLinkedChildren();
  }, []);

  const fetchLinkedChildren = async () => {
    setLoading(true);
    // Step 1: get parent_links rows
    const { data, error } = await supabase
      .from('parent_links')
      .select('*')
      .eq('parent_id', profile?.id)
      .order('created_at');

    if (data && data.length > 0) {
      // Step 2: fetch child profiles
      const childIds = [...new Set(data.map(l => l.student_id))];
      const { data: childProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, xp, coins, role')
        .in('id', childIds);
      const profileMap = {};
      (childProfiles || []).forEach(p => { profileMap[p.id] = p; });

      const enriched = data.map(l => ({
        ...l,
        profiles: profileMap[l.student_id] || null,
      }));
      setChildren(enriched);
      selectChild(enriched[0]);
    }
    setLoading(false);
  };

  const selectChild = async (link) => {
    setSelectedChild(link);
    const [prog, adaptive] = await Promise.all([
      getStudentProgress(link.profiles.id, 14),
      getAllAdaptiveStates(link.profiles.id),
    ]);
    setProgress(prog);
    setAdaptiveStates(adaptive);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLinkedChildren();
    setRefreshing(false);
  };

  const level = Math.floor((selectedChild?.profiles?.xp || 0) / 100) + 1;
  const xp    = selectedChild?.profiles?.xp || 0;
  const xpToNext = 100 - (xp % 100);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6A1B9A" />
      </View>
    );
  }

  if (children.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#6A1B9A', '#4A148C']} style={styles.header}>
          <Text style={styles.headerTitle}>Parent Dashboard</Text>
          <Text style={styles.headerSub}>No linked children found.</Text>
        </LinearGradient>
        <View style={styles.centered}>
          <Ionicons name="people-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No children linked yet.</Text>
          <Text style={styles.emptyHint}>Ask the teacher or admin to link your account.</Text>
        </View>
        <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#6A1B9A', '#4A148C']} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Parent Dashboard</Text>
            <Text style={styles.headerSub}>Welcome, {profile?.full_name}</Text>
          </View>
          <TouchableOpacity onPress={signOut}>
            <Ionicons name="log-out-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Child Selector (if multiple children) */}
      {children.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childSelector}>
          {children.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[styles.childChip, selectedChild?.id === c.id && styles.childChipActive]}
              onPress={() => selectChild(c)}>
              <Text style={[styles.childChipText, selectedChild?.id === c.id && styles.childChipTextActive]}>
                {c.profiles?.full_name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {selectedChild && (
          <>
            {/* Child Summary Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="person-circle" size={40} color="#6A1B9A" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.childName}>{selectedChild.profiles?.full_name}</Text>
                  <Text style={styles.childEmail}>{selectedChild.profiles?.email}</Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>Lv. {level}</Text>
                  <Text style={styles.statLabel}>LEVEL</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{xp}</Text>
                  <Text style={styles.statLabel}>TOTAL XP</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{xpToNext}</Text>
                  <Text style={styles.statLabel}>XP TO NEXT</Text>
                </View>
              </View>
            </View>

            {/* Progress Summary (last 14 days) */}
            {progress && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>📊 Last 14 Days</Text>
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{progress.totalSessions}</Text>
                    <Text style={styles.statLabel}>SESSIONS</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{progress.totalXP}</Text>
                    <Text style={styles.statLabel}>XP EARNED</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: progress.avgAccuracy >= 70 ? '#4CAF50' : progress.avgAccuracy >= 40 ? '#FF9800' : '#F44336' }]}>
                      {progress.avgAccuracy}%
                    </Text>
                    <Text style={styles.statLabel}>AVG ACCURACY</Text>
                  </View>
                </View>

                {/* Per-activity breakdown */}
                {Object.keys(progress.byActivity).length > 0 && (
                  <>
                    <Text style={styles.subTitle}>Activity Breakdown</Text>
                    {Object.entries(progress.byActivity).map(([type, data]) => {
                      const acc = data.totalItems > 0 ? Math.round((data.totalScore / data.totalItems) * 100) : 0;
                      const color = acc >= 70 ? '#4CAF50' : acc >= 40 ? '#FF9800' : '#F44336';
                      return (
                        <View key={type} style={styles.activityRow}>
                          <Text style={styles.activityLabel}>{ACTIVITY_LABELS[type] || type}</Text>
                          <View style={styles.activityRight}>
                            <Text style={styles.activitySessions}>{data.count}x</Text>
                            <View style={[styles.accBadge, { backgroundColor: color + '20', borderColor: color }]}>
                              <Text style={[styles.accText, { color }]}>{acc}%</Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </>
                )}
              </View>
            )}

            {/* Adaptive Levels */}
            {adaptiveStates.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>🎯 Adaptive Difficulty</Text>
                {adaptiveStates.map(s => {
                  const color = s.current_level === 1 ? '#4CAF50' : s.current_level === 2 ? '#FF9800' : '#F44336';
                  return (
                    <View key={s.activity_type} style={styles.adaptiveRow}>
                      <Text style={styles.adaptiveLabel}>{ACTIVITY_LABELS[s.activity_type] || s.activity_type}</Text>
                      <View style={[styles.levelBadge, { backgroundColor: color + '20', borderColor: color }]}>
                        <Text style={[styles.levelText, { color }]}>{levelLabel(s.current_level)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Recent Sessions */}
            {progress?.recentSessions?.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>🕐 Recent Activity</Text>
                {progress.recentSessions.slice(0, 5).map(s => (
                  <View key={s.id} style={styles.sessionRow}>
                    <View>
                      <Text style={styles.sessionType}>{ACTIVITY_LABELS[s.activity_type] || s.activity_type}</Text>
                      <Text style={styles.sessionDate}>{new Date(s.created_at).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.sessionRight}>
                      <Text style={styles.sessionXP}>+{s.xp_earned} XP</Text>
                      <Text style={styles.sessionAcc}>{s.accuracy}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F5F7FA' },
  centered:        { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  header:          { paddingTop: 10, paddingBottom: 20, paddingHorizontal: 20 },
  headerRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:     { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSub:       { fontSize: 13, color: '#fff', opacity: 0.85, marginTop: 2 },
  childSelector:   { paddingHorizontal: 15, paddingVertical: 10, maxHeight: 55 },
  childChip:       { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 10, elevation: 2 },
  childChipActive: { backgroundColor: '#6A1B9A' },
  childChipText:   { fontWeight: 'bold', color: '#6A1B9A' },
  childChipTextActive: { color: '#fff' },
  scroll:          { padding: 15, paddingBottom: 40 },
  card:            { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 3 },
  cardHeader:      { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  childName:       { fontSize: 18, fontWeight: 'bold', color: '#37474F' },
  childEmail:      { fontSize: 12, color: '#90A4AE' },
  statsRow:        { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  stat:            { alignItems: 'center' },
  statValue:       { fontSize: 20, fontWeight: 'bold', color: '#6A1B9A' },
  statLabel:       { fontSize: 10, color: '#90A4AE', marginTop: 2, letterSpacing: 0.5 },
  divider:         { width: 1, backgroundColor: '#f0f0f0' },
  sectionTitle:    { fontSize: 16, fontWeight: 'bold', color: '#37474F', marginBottom: 14 },
  subTitle:        { fontSize: 13, fontWeight: 'bold', color: '#78909C', marginTop: 14, marginBottom: 8 },
  activityRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  activityLabel:   { fontSize: 14, color: '#37474F' },
  activityRight:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  activitySessions:{ fontSize: 12, color: '#90A4AE' },
  accBadge:        { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  accText:         { fontSize: 12, fontWeight: 'bold' },
  adaptiveRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  adaptiveLabel:   { fontSize: 14, color: '#37474F' },
  levelBadge:      { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 3 },
  levelText:       { fontSize: 12, fontWeight: 'bold' },
  sessionRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  sessionType:     { fontSize: 14, fontWeight: '600', color: '#37474F' },
  sessionDate:     { fontSize: 11, color: '#90A4AE', marginTop: 2 },
  sessionRight:    { alignItems: 'flex-end' },
  sessionXP:       { fontSize: 13, fontWeight: 'bold', color: '#6A1B9A' },
  sessionAcc:      { fontSize: 11, color: '#90A4AE' },
  emptyText:       { fontSize: 18, fontWeight: 'bold', color: '#555', marginTop: 16 },
  emptyHint:       { fontSize: 13, color: '#999', marginTop: 6, textAlign: 'center' },
  signOutBtn:      { margin: 20, backgroundColor: '#E53935', borderRadius: 12, padding: 14, alignItems: 'center' },
  signOutText:     { color: '#fff', fontWeight: 'bold' },
});
