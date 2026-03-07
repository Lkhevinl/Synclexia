import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar, Modal, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { getStudentProgress } from '../../lib/analyticsHelper';

const AVATAR_COLORS = ['#E91E63','#9C27B0','#3F51B5','#2196F3','#009688','#FF9800'];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const ACTIVITY_LABELS = {
  phonics: '🗣️ Phonics', phonics_blend: '🔗 Blending', phonics_rhyme: '🎵 Rhyme',
  phonics_segment: '✂️ Segmenting', spelling: '🔤 Spelling', writing: '✍️ Writing',
  reading: '📖 Reading', scan: '📷 Scan', phonological_awareness: '🎧 Phonological',
};

export default function ParentDashboardScreen({ navigation }) {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();

  const [children, setChildren] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [childProfile, setChildProfile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Real-time subscription refs
  const profileSubRef = useRef(null);
  const assignSubRef = useRef(null);
  const msgSubRef = useRef(null);

  // ── Fetch system notifications for parents ────────────────────────────────
  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .in('target_role', ['all', 'parent'])
      .eq('is_draft', false)
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifications(data || []);
    // Badge shows only notifications posted in the last 7 days as "new"
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    setNotifCount((data || []).filter(n => n.created_at >= sevenDaysAgo).length);
  };

  // ── Fetch linked children ──────────────────────────────────────────────────
  const fetchChildren = async () => {
    const { data, error } = await supabase
      .from('parent_links')
      .select(`
        student_id,
        profiles!parent_links_student_id_fkey (
          id,
          full_name,
          email,
          xp
        )
      `)
      .eq('parent_id', profile.id); // make sure profile.id is the logged-in parent's ID

    return data || [];
  };

  // ── Fetch everything for the selected child ────────────────────────────────
  const loadChild = async (childLink) => {
    if (!childLink) return;
    const sid = childLink.profiles?.id ?? childLink.student_id;

    const [{ data: cp }, prog, { data: assign }, { data: msgs }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', sid).maybeSingle(),
      getStudentProgress(sid, 14),
      supabase.from('assignments').select('*').eq('student_id', sid).eq('is_completed', false).order('assigned_at', { ascending: false }),
      supabase.from('parent_messages').select('id').eq('receiver_id', profile?.id).eq('is_read', false),
    ]);

    setChildProfile(cp);
    setProgress(prog);
    setAssignments(assign || []);
    setUnreadCount(msgs?.length ?? 0);
  };

  // ── Full refresh ───────────────────────────────────────────────────────────
  const refresh = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    const kids = await fetchChildren();
    setChildren(kids);
    const idx = Math.min(selectedIdx, Math.max(kids.length - 1, 0));
    setSelectedIdx(idx);
    await Promise.all([loadChild(kids[idx]), fetchNotifications()]);
    setLoading(false);
    setRefreshing(false);
  }, [profile?.id, selectedIdx]);

  // ── useFocusEffect — re-fetch every time screen comes into focus ───────────
  useFocusEffect(
    useCallback(() => {
      refresh(children.length === 0);
    }, [profile?.id, selectedIdx])
  );

  // ── Real-time subscriptions for selected child ─────────────────────────────
  useEffect(() => {
    if (!children[selectedIdx]) return;
    const sid = children[selectedIdx]?.profiles?.id ?? children[selectedIdx]?.student_id;
    if (!sid) return;

    // Unsubscribe previous
    profileSubRef.current?.unsubscribe();
    assignSubRef.current?.unsubscribe();
    msgSubRef.current?.unsubscribe();

    // Child profile changes (XP, level, streak)
    profileSubRef.current = supabase
      .channel(`parent-child-profile-${sid}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${sid}` },
        (payload) => { setChildProfile(prev => ({ ...prev, ...payload.new })); })
      .subscribe();

    // Assignments changes
    assignSubRef.current = supabase
      .channel(`parent-assignments-${sid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments', filter: `student_id=eq.${sid}` },
        () => {
          supabase.from('assignments').select('*').eq('student_id', sid).eq('is_completed', false)
            .order('assigned_at', { ascending: false })
            .then(({ data }) => setAssignments(data || []));
        })
      .subscribe();

    // Unread messages
    msgSubRef.current = supabase
      .channel(`parent-msgs-${profile?.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parent_messages', filter: `receiver_id=eq.${profile?.id}` },
        () => {
          supabase.from('parent_messages').select('id').eq('receiver_id', profile?.id).eq('is_read', false)
            .then(({ data }) => setUnreadCount(data?.length ?? 0));
        })
      .subscribe();

    return () => {
      profileSubRef.current?.unsubscribe();
      assignSubRef.current?.unsubscribe();
      msgSubRef.current?.unsubscribe();
    };
  }, [selectedIdx, children.length]);

  // ── Switch child tab ───────────────────────────────────────────────────────
  const switchChild = async (idx) => {
    setSelectedIdx(idx);
    setChildProfile(null);
    setProgress(null);
    setAssignments([]);
    await loadChild(children[idx]);
  };

  const child = children[selectedIdx];
  const cp = childProfile;
  const name = cp?.full_name ?? child?.profiles?.full_name ?? 'Child';
  const xp = cp?.xp ?? 0;
  const level = cp?.level ?? Math.floor(xp / 100) + 1;
  const streak = cp?.streak ?? 0;
  const xpInLevel = xp % 100;
  const pendingCount = assignments.length;

  const navParams = { child };

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color="#7B1FA2" />
        <Text style={s.loadingText}>Loading your children's data...</Text>
      </View>
    );
  }

  if (children.length === 0) {
    return (
      <View style={s.emptyContainer}>
        <LinearGradient colors={['#7B1FA2','#4A148C']} style={s.emptyHeader}>
          <Text style={s.emptyHeaderTitle}>Parent Dashboard</Text>
        </LinearGradient>
        <View style={[s.emptyBody, { paddingBottom: insets.bottom + 20 }]}>
          <Ionicons name="people-outline" size={80} color="#ddd" />
          <Text style={s.emptyTitle}>No children linked yet</Text>
          <Text style={s.emptyHint}>Search for your child's account to start monitoring their progress.</Text>
          <TouchableOpacity style={s.linkChildBtn} onPress={() => navigation.navigate('ParentLinkChild')}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={s.linkChildBtnText}>Link a Child</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <LinearGradient colors={['#7B1FA2','#4A148C']} style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.greeting}>Hello, {profile?.full_name?.split(' ')[0] ?? 'Parent'} 👋</Text>
            <Text style={s.headerSub}>Monitoring your child's progress</Text>
          </View>
          <View style={s.headerActions}>
            <TouchableOpacity style={s.headerIconBtn} onPress={() => navigation.navigate('ParentLinkChild')}>
              <Ionicons name="person-add" size={22} color="#fff" />
            </TouchableOpacity>
            {/* Notifications bell */}
            <TouchableOpacity style={s.notifBadgeBtn} onPress={() => setNotifModalVisible(true)}>
              <Ionicons name="notifications" size={24} color="#fff" />
              {notifCount > 0 && (
                <View style={s.badge}><Text style={s.badgeText}>{notifCount > 9 ? '9+' : notifCount}</Text></View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={s.msgBadgeBtn} onPress={() => navigation.navigate('ParentMessages', navParams)}>
              <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
              {unreadCount > 0 && (
                <View style={s.badge}><Text style={s.badgeText}>{unreadCount}</Text></View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Child tabs */}
        {children.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.childTabs}>
            {children.map((c, i) => {
              const n = c.profiles?.full_name ?? 'Child';
              return (
                <TouchableOpacity key={c.id} style={[s.childTab, i === selectedIdx && s.childTabActive]} onPress={() => switchChild(i)}>
                  <Text style={[s.childTabText, i === selectedIdx && s.childTabTextActive]}>{n.split(' ')[0]}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 20 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); refresh(); }} colors={['#7B1FA2']} />}
      >
        {/* ── Child Hero Card ── */}
        <View style={s.heroCard}>
          <View style={[s.heroAvatar, { backgroundColor: avatarColor(name) }]}>
            <Text style={s.heroAvatarText}>{name[0]?.toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.heroName}>{name}</Text>
            <Text style={s.heroLevel}>Level {level}</Text>
            <View style={s.xpBarBg}>
              <View style={[s.xpBarFill, { width: `${xpInLevel}%` }]} />
            </View>
            <Text style={s.xpLabel}>{xpInLevel}/100 XP to next level</Text>
          </View>
        </View>

        {/* ── Stats Row ── */}
        <View style={s.statsRow}>
          {[
            { icon: 'trophy', color: '#FF9800', val: xp, lbl: 'Total XP' },
            { icon: 'flame', color: '#F44336', val: streak, lbl: 'Day Streak' },
            { icon: 'clipboard', color: '#7B1FA2', val: pendingCount, lbl: 'Pending' },
          ].map((stat, i) => (
            <View key={i} style={s.statBox}>
              <Ionicons name={stat.icon} size={20} color={stat.color} />
              <Text style={[s.statVal, { color: stat.color }]}>{stat.val}</Text>
              <Text style={s.statLbl}>{stat.lbl}</Text>
            </View>
          ))}
        </View>

        {/* ── Quick Nav Grid ── */}
        <Text style={s.sectionTitle}>Quick Access</Text>
        <View style={s.navGrid}>
          {[
            { icon: 'bar-chart', color: '#7B1FA2', bg: '#F3E5F5', label: 'Progress', screen: 'ParentProgress' },
            { icon: 'chatbubbles', color: '#2196F3', bg: '#E3F2FD', label: 'Messages', screen: 'ParentMessages', badge: unreadCount },
            { icon: 'clipboard', color: '#FF9800', bg: '#FFF3E0', label: 'Assignments', screen: 'ParentAssignments', badge: pendingCount },
            { icon: 'time', color: '#4CAF50', bg: '#E8F5E9', label: 'Activity Log', screen: 'ParentActivityLog' },
          ].map((item) => (
            <TouchableOpacity key={item.screen} style={[s.navCard, { backgroundColor: item.bg }]} onPress={() => navigation.navigate(item.screen, navParams)}>
              <View style={[s.navIconCircle, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={26} color={item.color} />
              </View>
              <Text style={[s.navLabel, { color: item.color }]}>{item.label}</Text>
              {item.badge > 0 && (
                <View style={[s.navBadge, { backgroundColor: item.color }]}>
                  <Text style={s.navBadgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Progress Snapshot ── */}
        <Text style={s.sectionTitle}>Progress Snapshot (14 days)</Text>
        <View style={s.card}>
          {!progress || progress.totalSessions === 0 ? (
            <View style={s.emptySnap}>
              <Ionicons name="bar-chart-outline" size={40} color="#ddd" />
              <Text style={s.emptySnapText}>No activity in the last 14 days</Text>
            </View>
          ) : (
            <>
              <View style={s.snapRow}>
                <View style={s.snapItem}>
                  <Text style={s.snapVal}>{progress.totalSessions}</Text>
                  <Text style={s.snapLbl}>Sessions</Text>
                </View>
                <View style={s.snapDiv} />
                <View style={s.snapItem}>
                  <Text style={[s.snapVal, { color: '#4CAF50' }]}>{progress.totalXP}</Text>
                  <Text style={s.snapLbl}>XP Earned</Text>
                </View>
                <View style={s.snapDiv} />
                <View style={s.snapItem}>
                  <Text style={[s.snapVal, {
                    color: progress.avgAccuracy >= 70 ? '#4CAF50' : progress.avgAccuracy >= 40 ? '#FF9800' : '#F44336'
                  }]}>{progress.avgAccuracy}%</Text>
                  <Text style={s.snapLbl}>Avg Accuracy</Text>
                </View>
              </View>
              {Object.entries(progress.byActivity).slice(0, 3).map(([type, data]) => {
                const acc = data.totalItems > 0 ? Math.round((data.totalScore / data.totalItems) * 100) : 0;
                const color = acc >= 70 ? '#4CAF50' : acc >= 40 ? '#FF9800' : '#F44336';
                return (
                  <View key={type} style={s.actRow}>
                    <Text style={s.actIcon}>{ACTIVITY_LABELS[type]?.split(' ')[0] || '📊'}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={s.actTop}>
                        <Text style={s.actLabel}>{ACTIVITY_LABELS[type] || type}</Text>
                        <Text style={[s.actAcc, { color }]}>{acc}%</Text>
                      </View>
                      <View style={s.barBg}>
                        <View style={[s.barFill, { width: `${Math.min(acc, 100)}%`, backgroundColor: color }]} />
                      </View>
                    </View>
                  </View>
                );
              })}
              <TouchableOpacity style={s.viewAll} onPress={() => navigation.navigate('ParentProgress', navParams)}>
                <Text style={s.viewAllText}>View full report →</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── Pending Assignments ── */}
        {assignments.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Pending Assignments</Text>
            <View style={s.card}>
              {assignments.slice(0, 3).map((a) => (
                <View key={a.id} style={s.assignRow}>
                  <Text style={s.assignIcon}>{ACTIVITY_LABELS[a.activity_type]?.split(' ')[0] || '📋'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.assignName}>{ACTIVITY_LABELS[a.activity_type] || a.activity_type}</Text>
                    {a.notes ? <Text style={s.assignNote}>{a.notes}</Text> : null}
                  </View>
                  <View style={[s.diffBadge, { backgroundColor: a.difficulty_level === 3 ? '#FFEBEE' : a.difficulty_level === 2 ? '#FFF3E0' : '#E8F5E9' }]}>
                    <Text style={[s.diffText, { color: a.difficulty_level === 3 ? '#F44336' : a.difficulty_level === 2 ? '#FF9800' : '#4CAF50' }]}>
                      {a.difficulty_level === 3 ? 'Hard' : a.difficulty_level === 2 ? 'Medium' : 'Easy'}
                    </Text>
                  </View>
                </View>
              ))}
              {assignments.length > 3 && (
                <TouchableOpacity style={s.viewAll} onPress={() => navigation.navigate('ParentAssignments', navParams)}>
                  <Text style={s.viewAllText}>+{assignments.length - 3} more assignments →</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Notifications Modal ── */}
      <Modal visible={notifModalVisible} transparent animationType="slide" onRequestClose={() => setNotifModalVisible(false)}>
        <View style={s.notifOverlay}>
          <View style={s.notifCard}>
            <View style={s.notifHeader}>
              <Text style={s.notifTitle}>📢 Announcements</Text>
              <TouchableOpacity onPress={() => setNotifModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={notifications}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: '#999', padding: 30 }}>
                  No announcements yet.
                </Text>
              }
              renderItem={({ item }) => (
                <View style={s.notifItem}>
                  <Text style={s.notifItemTitle}>{item.title}</Text>
                  <Text style={s.notifItemBody}>{item.content}</Text>
                  <Text style={s.notifItemDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#F5F0FF' },
  loadingContainer:   { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F0FF' },
  loadingText:        { marginTop: 12, color: '#7B1FA2', fontWeight: '600' },
  emptyContainer:     { flex: 1, backgroundColor: '#F5F0FF' },
  emptyHeader:        { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20 },
  emptyHeaderTitle:   { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  emptyBody:          { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyTitle:         { fontSize: 20, fontWeight: 'bold', color: '#555', marginTop: 20 },
  emptyHint:          { fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center', lineHeight: 22 },
  linkChildBtn:       { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#7B1FA2', borderRadius: 25, paddingHorizontal: 24, paddingVertical: 14, marginTop: 24, elevation: 3 },
  linkChildBtnText:   { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  header:             { paddingTop: 55, paddingBottom: 16, paddingHorizontal: 20 },
  headerTop:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting:           { fontSize: 20, fontWeight: '900', color: '#fff' },
  headerSub:          { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  headerActions:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIconBtn:      { padding: 4 },
  msgBadgeBtn:        { position: 'relative', padding: 4 },
  badge:              { position: 'absolute', top: 0, right: 0, backgroundColor: '#F44336', borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  badgeText:          { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  childTabs:          { marginTop: 14 },
  childTab:           { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', marginRight: 8 },
  childTabActive:     { backgroundColor: '#fff' },
  childTabText:       { color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', fontSize: 13 },
  childTabTextActive: { color: '#7B1FA2' },

  scroll:             { padding: 16 },

  heroCard:           { backgroundColor: '#fff', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 14, elevation: 3 },
  heroAvatar:         { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  heroAvatarText:     { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  heroName:           { fontSize: 18, fontWeight: 'bold', color: '#333' },
  heroLevel:          { fontSize: 12, color: '#7B1FA2', fontWeight: '600', marginTop: 2 },
  xpBarBg:            { height: 6, backgroundColor: '#F0E6FF', borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  xpBarFill:          { height: '100%', backgroundColor: '#7B1FA2', borderRadius: 3 },
  xpLabel:            { fontSize: 10, color: '#999', marginTop: 4 },

  statsRow:           { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, marginBottom: 14, elevation: 2, overflow: 'hidden' },
  statBox:            { flex: 1, alignItems: 'center', paddingVertical: 14, borderRightWidth: 1, borderRightColor: '#f5f5f5' },
  statVal:            { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  statLbl:            { fontSize: 9, color: '#999', fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },

  sectionTitle:       { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 10, marginTop: 4 },

  navGrid:            { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  navCard:            { width: '47%', borderRadius: 16, padding: 16, alignItems: 'center', elevation: 1, position: 'relative' },
  navIconCircle:      { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  navLabel:           { fontSize: 13, fontWeight: 'bold' },
  navBadge:           { position: 'absolute', top: 10, right: 10, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  navBadgeText:       { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  card:               { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 14, elevation: 2 },
  snapRow:            { flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', marginBottom: 14 },
  snapItem:           { alignItems: 'center' },
  snapVal:            { fontSize: 22, fontWeight: 'bold', color: '#333' },
  snapLbl:            { fontSize: 10, color: '#999', marginTop: 2, fontWeight: '600' },
  snapDiv:            { width: 1, backgroundColor: '#f0f0f0' },
  actRow:             { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  actIcon:            { fontSize: 22, width: 30 },
  actTop:             { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  actLabel:           { fontSize: 13, fontWeight: '600', color: '#333' },
  actAcc:             { fontSize: 13, fontWeight: 'bold' },
  barBg:              { height: 5, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden' },
  barFill:            { height: '100%', borderRadius: 3 },
  emptySnap:          { alignItems: 'center', paddingVertical: 20 },
  emptySnapText:      { color: '#bbb', marginTop: 8, fontSize: 13 },
  viewAll:            { marginTop: 12, alignItems: 'center' },
  viewAllText:        { color: '#7B1FA2', fontWeight: 'bold', fontSize: 13 },

  assignRow:          { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', gap: 10 },
  assignIcon:         { fontSize: 24 },
  assignName:         { fontSize: 14, fontWeight: '600', color: '#333' },
  assignNote:         { fontSize: 11, color: '#999', marginTop: 2 },
  diffBadge:          { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  diffText:           { fontSize: 11, fontWeight: 'bold' },

  // Notification bell
  notifBadgeBtn:      { position: 'relative', padding: 4 },

  // Notification modal
  notifOverlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  notifCard:          { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '75%' },
  notifHeader:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 12 },
  notifTitle:         { fontSize: 18, fontWeight: 'bold', color: '#7B1FA2' },
  notifItem:          { backgroundColor: '#F5F0FF', borderRadius: 14, padding: 14, marginBottom: 10 },
  notifItemTitle:     { fontSize: 14, fontWeight: 'bold', color: '#4A148C' },
  notifItemBody:      { fontSize: 13, color: '#555', marginTop: 4, lineHeight: 18 },
  notifItemDate:      { fontSize: 11, color: '#aaa', marginTop: 6 },
});
