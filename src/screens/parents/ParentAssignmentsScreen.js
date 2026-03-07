import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GoBackBtn from '../../components/GoBackBtn';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

const ACTIVITY_LABELS = {
  phonics: '🗣️ Phonics', phonics_blend: '🔗 Blending', phonics_rhyme: '🎵 Rhyme',
  phonics_segment: '✂️ Segmenting', spelling: '🔤 Spelling', writing: '✍️ Writing',
  reading: '📖 Reading', scan: '📷 Scan', phonological_awareness: '🎧 Phonological',
};
const DIFF = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
const DIFF_COLOR = { 1: '#4CAF50', 2: '#FF9800', 3: '#F44336' };

export default function ParentAssignmentsScreen({ route }) {
  const { child } = route.params || {};
  const sid = child?.profiles?.id ?? child?.student_id;
  const name = child?.profiles?.full_name ?? 'Child';
  const insets = useSafeAreaInsets();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('pending'); // 'pending' | 'done'
  const subRef = useRef(null);

  const fetchAssignments = useCallback(async () => {
    setRefreshing(true);
    const { data } = await supabase
      .from('assignments')
      .select('*')
      .eq('student_id', sid)
      .order('assigned_at', { ascending: false });
    setAssignments(data || []);
    setLoading(false);
    setRefreshing(false);
  }, [sid]);

  // Re-fetch every time screen comes into focus
  useFocusEffect(
    useCallback(() => { fetchAssignments(); }, [])
  );

  // Real-time: update when teacher assigns or child completes
  useEffect(() => {
    if (!sid) return;
    subRef.current?.unsubscribe();
    subRef.current = supabase
      .channel(`parent-assign-${sid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments', filter: `student_id=eq.${sid}` },
        () => { fetchAssignments(); })
      .subscribe();
    return () => subRef.current?.unsubscribe();
  }, [sid]);

  const pending = assignments.filter(a => !a.is_completed);
  const done = assignments.filter(a => a.is_completed);
  const shown = tab === 'pending' ? pending : done;

  const renderItem = ({ item }) => {
    const diff = item.difficulty_level || 1;
    const color = DIFF_COLOR[diff] || '#4CAF50';
    return (
      <View style={[s.card, item.is_completed && s.cardDone]}>
        <View style={s.cardLeft}>
          <Text style={s.actIcon}>{ACTIVITY_LABELS[item.activity_type]?.split(' ')[0] || '📋'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.actName}>{ACTIVITY_LABELS[item.activity_type] || item.activity_type}</Text>
          {item.notes ? <Text style={s.actNote}>{item.notes}</Text> : null}
          <View style={s.tagRow}>
            <View style={[s.tag, { backgroundColor: color + '20', borderColor: color }]}>
              <Text style={[s.tagText, { color }]}>{DIFF[diff]}</Text>
            </View>
            <View style={s.tag}>
              <Text style={s.tagText}>Target: {item.target_count || 1}</Text>
            </View>
            {item.deadline && !item.is_completed && (
            <View style={[s.tag, { backgroundColor: '#FFF3E0', borderColor: '#F57C00' }]}>
              <Text style={[s.tagText, { color: '#F57C00' }]}>
                Due: {new Date(item.deadline).toLocaleDateString()}
              </Text>
            </View>
          )}
            {item.is_completed && (
              <View style={[s.tag, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' }]}>
                <Text style={[s.tagText, { color: '#2E7D32' }]}>✓ Done</Text>
              </View>
            )}
          </View>
          {item.is_completed && item.completed_at && (
            <Text style={s.doneDate}>Completed {new Date(item.completed_at).toLocaleDateString()}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={s.container}>
      <LinearGradient colors={['#7B1FA2','#4A148C']} style={s.header}>
        <GoBackBtn />
        <Text style={s.headerTitle}>Assignments</Text>
        <Text style={s.headerSub}>{name}'s tasks from teacher</Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={s.tabRow}>
        <View style={[s.tabBtn, tab === 'pending' && s.tabBtnActive]}>
          <Text
            style={[s.tabText, tab === 'pending' && s.tabTextActive]}
            onPress={() => setTab('pending')}
          >Pending ({pending.length})</Text>
        </View>
        <View style={[s.tabBtn, tab === 'done' && s.tabBtnActive]}>
          <Text
            style={[s.tabText, tab === 'done' && s.tabTextActive]}
            onPress={() => setTab('done')}
          >Completed ({done.length})</Text>
        </View>
      </View>

      {loading ? (
        <View style={s.centered}><ActivityIndicator size="large" color="#7B1FA2" /></View>
      ) : (
        <FlatList
          data={shown}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAssignments} colors={['#7B1FA2']} />}
          contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 20 }]}
          ListEmptyComponent={
            <View style={s.emptyBox}>
              <Ionicons name="clipboard-outline" size={60} color="#ddd" />
              <Text style={s.emptyTitle}>{tab === 'pending' ? 'No pending assignments' : 'No completed assignments yet'}</Text>
              <Text style={s.emptyHint}>{tab === 'pending' ? `${name} is all caught up!` : 'Completed tasks will appear here.'}</Text>
            </View>
          }
        />
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
  tabRow:       { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  tabBtn:       { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: '#7B1FA2' },
  tabText:      { fontWeight: 'bold', color: '#999', fontSize: 14 },
  tabTextActive:{ color: '#7B1FA2' },
  list:         { padding: 16, paddingBottom: 40 },
  card:         { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', elevation: 2, alignItems: 'flex-start' },
  cardDone:     { opacity: 0.7 },
  cardLeft:     { marginRight: 12, paddingTop: 2 },
  actIcon:      { fontSize: 28 },
  actName:      { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  actNote:      { fontSize: 12, color: '#666', marginBottom: 6, fontStyle: 'italic' },
  tagRow:       { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag:          { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#F5F5F5' },
  tagText:      { fontSize: 11, fontWeight: 'bold', color: '#666' },
  doneDate:     { fontSize: 10, color: '#999', marginTop: 6 },
  emptyBox:     { alignItems: 'center', paddingTop: 60 },
  emptyTitle:   { fontSize: 17, fontWeight: 'bold', color: '#555', marginTop: 14 },
  emptyHint:    { fontSize: 13, color: '#999', marginTop: 6, textAlign: 'center' },
});
