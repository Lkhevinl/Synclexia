import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar, Modal, FlatList, Image, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import Sidebar from '../../components/Sidebar';
import { getStudentProgress } from '../../lib/analyticsHelper';

const AVATAR_COLORS = ['#E91E63','#9C27B0','#3F51B5','#2196F3','#009688','#FF9800'];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const ACTIVITY_LABELS = {
  phonics: '🗣️ Phonics', phonics_blend: '🔗 Blending', phonics_rhyme: '🎵 Rhyme',
  phonics_segment: '✂️ Segmenting', spelling: '🔤 Spelling', writing: '✍️ Writing',
  reading: '📖 Reading', phonological_awareness: '🎧 Phonological',
  phonics_activity: '🎮 Mini Games', speech_to_text: '🎤 Speech Practice', text_to_speech: '🔊 Read Aloud',
};

export default function ParentDashboardScreen({ navigation }) {
  const { profile } = useAuth();
  const { theme, getBgColor, getHeaderGradient, getThemeColors, a11yTextStyle } = useTheme();
  const themeColors = getThemeColors();
  const insets = useSafeAreaInsets();

  const [children, setChildren] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [childProfile, setChildProfile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [notifCount, setNotifCount] = useState(0);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Real-time subscription refs
  const profileSubRef = useRef(null);
  const sessionSubRef = useRef(null);

  // ── Fetch system notifications for parents ────────────────────────────────
  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .in('target_role', ['all', 'parent'])
        .eq('is_draft', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        setNotifications([]);
        setNotifCount(0);
        return;
      }

      setNotifications(data || []);
      // Badge shows only notifications posted in the last 7 days as "new"
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      setNotifCount((data || []).filter(n => n.created_at >= sevenDaysAgo).length);
    } catch (error) {
      setNotifications([]);
      setNotifCount(0);
    }
  };

  // ── Fetch linked children ──────────────────────────────────────────────────
  const fetchChildren = async () => {
    if (!profile?.id) return [];
    try {
      const { data, error } = await supabase
        .from('parent_links')
        .select(`
          student_id,
          profiles!parent_links_student_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .eq('parent_id', profile.id); // make sure profile.id is the logged-in parent's ID

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  };

  // ── Fetch everything for the selected child ────────────────────────────────
  const loadChild = async (childLink) => {
    if (!childLink) return;
    const sid = childLink.profiles?.id ?? childLink.student_id;

    try {
      const [{ data: cp }, prog] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', sid).maybeSingle(),
        getStudentProgress(sid, 14),
      ]);

      setChildProfile(cp);
      setProgress(prog);
    } catch (error) {
      // Set null on error but don't crash
      setChildProfile(null);
      setProgress(null);
    }
  };

  // ── Full refresh ───────────────────────────────────────────────────────────
  const refresh = useCallback(async (showSpinner = false) => {
    if (!profile?.id) {
      // Profile not ready yet; keep spinner minimal and avoid throwing
      if (showSpinner) setLoading(true);
      return;
    }

    if (showSpinner) setLoading(true);
    setError(null); // Clear previous errors
    try {
      const kids = await fetchChildren();
      setChildren(kids);
      const idx = Math.min(selectedIdx, Math.max(kids.length - 1, 0));
      setSelectedIdx(idx);
      await Promise.all([loadChild(kids[idx]), fetchNotifications()]);
    } catch (e) {
      setError('Could not load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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
    sessionSubRef.current?.unsubscribe();

    // Child profile changes (XP, level, streak)
    profileSubRef.current = supabase
      .channel(`parent-child-profile-${sid}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${sid}` },
        (payload) => { setChildProfile(prev => ({ ...prev, ...payload.new })); })
      .subscribe();

    // Progress snapshots depend on session_logs; update when new sessions are logged.
    sessionSubRef.current = supabase
      .channel(`parent-sessions-${sid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_logs', filter: `student_id=eq.${sid}` },
        async () => {
          const prog = await getStudentProgress(sid, 14);
          setProgress(prog);
        })
      .subscribe();

    return () => {
      profileSubRef.current?.unsubscribe();
      sessionSubRef.current?.unsubscribe();
    };
  }, [selectedIdx, children.length]);

  // ── Switch child tab ───────────────────────────────────────────────────────
  const switchChild = async (idx) => {
    setSelectedIdx(idx);
    setChildProfile(null);
    setProgress(null);
    await loadChild(children[idx]);
  };

  const child = children[selectedIdx];
  const cp = childProfile;
  const name = cp?.full_name ?? child?.profiles?.full_name ?? 'Child';
  const streak = cp?.streak ?? 0;

  const navParams = { child };

  if (loading) {
    return (
      <View style={[s.loadingContainer, { backgroundColor: getBgColor() }]}>
        <ActivityIndicator size="large" color={themeColors.primaryColor} />
        <Text style={[s.loadingText, { fontSize: theme.fontSize }, a11yTextStyle]}>Loading your children's data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[s.errorContainer, { backgroundColor: getBgColor() }]}>
        <LinearGradient colors={getHeaderGradient()} style={s.errorHeader}>
          <Text style={[s.errorHeaderTitle, { fontSize: theme.fontSize + 10 }, a11yTextStyle]}>Parent Dashboard</Text>
        </LinearGradient>
        <View style={[s.errorBody, { paddingBottom: insets.bottom + 20 }]}>
          <Ionicons name="alert-circle-outline" size={80} color="#FF6B6B" />
          <Text style={[s.errorTitle, { fontSize: theme.fontSize + 6 }, a11yTextStyle]}>Connection Error</Text>
          <Text style={[s.errorMessage, { fontSize: theme.fontSize }, a11yTextStyle]}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => refresh(true)}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={[s.retryBtnText, { fontSize: theme.fontSize + 2 }, a11yTextStyle]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (children.length === 0) {
    return (
      <View style={[s.emptyContainer, { backgroundColor: getBgColor() }]}>
        <LinearGradient colors={getHeaderGradient()} style={s.emptyHeader}>
          <Text style={[s.emptyHeaderTitle, { fontSize: theme.fontSize + 10 }, a11yTextStyle]}>Parent Dashboard</Text>
        </LinearGradient>
        <View style={[s.emptyBody, { paddingBottom: insets.bottom + 20 }]}>
          <Ionicons name="people-outline" size={80} color="#ddd" />
          <Text style={[s.emptyTitle, { fontSize: theme.fontSize + 6 }, a11yTextStyle]}>No children linked yet</Text>
          <Text style={[s.emptyHint, { fontSize: theme.fontSize }, a11yTextStyle]}>Search for your child's account to start monitoring their progress.</Text>
          <TouchableOpacity style={s.linkChildBtn} onPress={() => navigation.navigate('ParentLinkChild')}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={[s.linkChildBtnText, { fontSize: theme.fontSize + 2 }, a11yTextStyle]}>Link a Child</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: getBgColor() }]}>
      <StatusBar barStyle="light-content" />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* ── Header ── */}
      <LinearGradient colors={getHeaderGradient()} style={s.header}>
        <View style={s.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={[s.greeting, { fontSize: theme.fontSize + 6 }, a11yTextStyle]}>Hello, {profile?.full_name?.split(' ')[0] ?? 'Parent'} 👋</Text>
            <Text style={[s.headerSub, { fontSize: theme.fontSize - 2 }, a11yTextStyle]}>Monitoring your child's progress</Text>
          </View>
          <View style={s.headerActions}>
            <TouchableOpacity style={s.headerIconBtn} onPress={() => navigation.navigate('ParentLinkChild')}>
              <Ionicons name="person-add" size={22} color="#fff" />
            </TouchableOpacity>
            {/* Notifications bell */}
            <TouchableOpacity style={s.notifBadgeBtn} onPress={() => setNotifModalVisible(true)}>
              <Ionicons name="notifications" size={24} color="#fff" />
              {notifCount > 0 && (
                <View style={s.badge}><Text style={[s.badgeText, { fontSize: theme.fontSize - 4 }, a11yTextStyle]}>{notifCount > 9 ? '9+' : notifCount}</Text></View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={s.headerIconBtn} onPress={() => setSidebarVisible(true)}>
              <Ionicons name="menu-outline" size={26} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Child tabs */}
        {children.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.childTabs}>
            {children.map((c, i) => {
              const n = c.profiles?.full_name ?? 'Child';
              return (
                <TouchableOpacity key={c.student_id || i} style={[s.childTab, i === selectedIdx && s.childTabActive]} onPress={() => switchChild(i)}>
                  <Text style={[s.childTabText, i === selectedIdx && s.childTabTextActive, { fontSize: theme.fontSize - 1 }, a11yTextStyle]}>{n.split(' ')[0]}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 20 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); refresh(); }} colors={['#7B1FA2']} />}
      >
        {/* ── Child Hero Card ── */}
        <View style={s.heroCard}>
          {childProfile?.avatar_url ? (
            <Image source={{ uri: childProfile.avatar_url }} style={s.heroAvatarImg} />
          ) : (
            <View style={[s.heroAvatar, { backgroundColor: avatarColor(name) }]}>
              <Text style={[s.heroAvatarText, a11yTextStyle]}>{name[0]?.toUpperCase()}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[s.heroName, { fontSize: theme.fontSize + 4 }, a11yTextStyle]}>{name}</Text>
            <Text style={[s.heroEmail, { fontSize: theme.fontSize - 2 }, a11yTextStyle]}>{cp?.email || 'No email'}</Text>
          </View>
          <TouchableOpacity
            style={s.editChildBtn}
            onPress={() => navigation.navigate('ParentEditChild', { child: children[selectedIdx] })}
          >
            <Ionicons name="create-outline" size={16} color="#7B1FA2" />
            <Text style={[s.editChildBtnText, { fontSize: theme.fontSize - 1 }, a11yTextStyle]}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* ── Stats Row ── */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Ionicons name="flame" size={24} color="#F44336" />
            <Text style={[s.statVal, { color: '#F44336', fontSize: theme.fontSize + 4 }, a11yTextStyle]}>{streak}</Text>
            <Text style={[s.statLbl, { fontSize: theme.fontSize - 5 }, a11yTextStyle]}>Day Streak</Text>
          </View>
        </View>

        {/* ── Quick Nav Grid ── */}
        <Text style={[s.sectionTitle, { fontSize: theme.fontSize + 2 }, a11yTextStyle]}>Quick Access</Text>
        <View style={s.navGrid}>
          {[
            { icon: 'bar-chart', color: '#7B1FA2', bg: '#F3E5F5', label: 'Progress', screen: 'ParentProgress' },
            { icon: 'time', color: '#4CAF50', bg: '#E8F5E9', label: 'Activity Log', screen: 'ParentActivityLog' },
          ].map((item) => (
            <TouchableOpacity key={item.screen} style={[s.navCard, { backgroundColor: item.bg }]} onPress={() => navigation.navigate(item.screen, navParams)}>
              <View style={[s.navIconCircle, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={26} color={item.color} />
              </View>
              <Text style={[s.navLabel, { color: item.color, fontSize: theme.fontSize - 1 }, a11yTextStyle]}>{item.label}</Text>
              {item.badge > 0 && (
                <View style={[s.navBadge, { backgroundColor: item.color }]}>
                  <Text style={[s.navBadgeText, a11yTextStyle]}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Progress Snapshot ── */}
        <Text style={[s.sectionTitle, { fontSize: theme.fontSize + 2 }, a11yTextStyle]}>Progress Snapshot (14 days)</Text>
        <View style={s.card}>
          {!progress || progress.totalSessions === 0 ? (
            <View style={s.emptySnap}>
              <Ionicons name="bar-chart-outline" size={40} color="#ddd" />
              <Text style={[s.emptySnapText, { fontSize: theme.fontSize }, a11yTextStyle]}>No activity in the last 14 days</Text>
            </View>
          ) : (
            <>
              <View style={s.snapRow}>
                <View style={s.snapItem}>
                  <Text style={[s.snapVal, { fontSize: theme.fontSize + 4 }, a11yTextStyle]}>{progress.totalSessions}</Text>
                  <Text style={[s.snapLbl, { fontSize: theme.fontSize - 5 }, a11yTextStyle]}>Sessions</Text>
                </View>
                <View style={s.snapDiv} />
                <View style={s.snapItem}>
                  <Text style={[s.snapVal, { color: '#4CAF50', fontSize: theme.fontSize + 4 }, a11yTextStyle]}>{progress.totalXP}</Text>
                  <Text style={[s.snapLbl, { fontSize: theme.fontSize - 5 }, a11yTextStyle]}>XP Earned</Text>
                </View>
                <View style={s.snapDiv} />
                <View style={s.snapItem}>
                  <Text style={[s.snapVal, {
                    color: progress.avgAccuracy >= 70 ? '#4CAF50' : progress.avgAccuracy >= 40 ? '#FF9800' : '#F44336',
                    fontSize: theme.fontSize + 4
                  }, a11yTextStyle]}>{progress.avgAccuracy}%</Text>
                  <Text style={[s.snapLbl, { fontSize: theme.fontSize - 5 }, a11yTextStyle]}>Avg Accuracy</Text>
                </View>
              </View>
              {Object.entries(progress.byActivity).slice(0, 3).map(([type, data]) => {
                const acc = data.totalItems > 0 ? Math.round((data.totalScore / data.totalItems) * 100) : 0;
                const color = acc >= 70 ? '#4CAF50' : acc >= 40 ? '#FF9800' : '#F44336';
                return (
                  <View key={type} style={s.actRow}>
                    <Text style={[s.actIcon, { fontSize: theme.fontSize + 2 }, a11yTextStyle]}>{ACTIVITY_LABELS[type]?.split(' ')[0] || '📊'}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={s.actTop}>
                        <Text style={[s.actLabel, { fontSize: theme.fontSize }, a11yTextStyle]}>{ACTIVITY_LABELS[type] || type}</Text>
                        <Text style={[s.actAcc, { color, fontSize: theme.fontSize }, a11yTextStyle]}>{acc}%</Text>
                      </View>
                      <View style={s.barBg}>
                        <View style={[s.barFill, { width: `${Math.min(acc, 100)}%`, backgroundColor: color }]} />
                      </View>
                    </View>
                  </View>
                );
              })}
              <TouchableOpacity style={s.viewAll} onPress={() => navigation.navigate('ParentProgress', navParams)}>
                <Text style={[s.viewAllText, { fontSize: theme.fontSize }, a11yTextStyle]}>View full report →</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Notifications Modal ── */}
      <Modal visible={notifModalVisible} transparent animationType="slide" onRequestClose={() => setNotifModalVisible(false)}>
        <View style={s.notifOverlay}>
          <View style={s.notifCard}>
            <View style={s.notifHeader}>
              <Text style={[s.notifTitle, { fontSize: theme.fontSize + 6 }, a11yTextStyle]}>📢 Announcements</Text>
              <TouchableOpacity onPress={() => setNotifModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={notifications}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Ionicons name="notifications-off-outline" size={48} color="#ddd" />
                  <Text style={[{ textAlign: 'center', color: '#999', padding: 30, fontSize: theme.fontSize }, a11yTextStyle]}>
                    No announcements yet.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity style={s.notifItem} activeOpacity={0.7}>
                  <View style={s.notifItemIconBox}>
                    <Ionicons name="megaphone" size={18} color="#7B1FA2" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.notifItemTitle, { fontSize: theme.fontSize }, a11yTextStyle]}>{item.title}</Text>
                    <Text style={[s.notifItemBody, { fontSize: theme.fontSize - 1 }, a11yTextStyle]} numberOfLines={3}>{item.content}</Text>
                    <Text style={[s.notifItemDate, { fontSize: theme.fontSize - 3 }, a11yTextStyle]}>{new Date(item.created_at).toLocaleDateString()}</Text>
                  </View>
                </TouchableOpacity>
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
  headerTop:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  greeting:           { fontSize: 20, fontWeight: '900', color: '#fff', flex: 1, flexShrink: 1 },
  headerSub:          { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  headerActions:      { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 0 },
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

  heroCard:           { backgroundColor: '#fff', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 14, elevation: 3, gap: 12 },
  heroAvatar:         { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  heroAvatarImg:      { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#7B1FA2' },
  heroAvatarText:     { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  heroName:           { fontSize: 18, fontWeight: 'bold', color: '#333' },
  heroEmail:          { fontSize: 12, color: '#999', marginTop: 2 },
  editChildBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3E5F5', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, alignSelf: 'flex-start' },
  editChildBtnText:   { color: '#7B1FA2', fontWeight: '700', fontSize: 13 },

  statsRow:           { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, marginBottom: 14, elevation: 2, overflow: 'hidden', justifyContent: 'center' },
  statBox:            { alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20 },
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
  notifItem:          { backgroundColor: '#F5F0FF', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  notifItemIconBox:   { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E1BEE7', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  notifItemTitle:     { fontSize: 14, fontWeight: 'bold', color: '#4A148C', marginBottom: 4 },
  notifItemBody:      { fontSize: 13, color: '#555', marginBottom: 6, lineHeight: 18 },
  notifItemDate:      { fontSize: 11, color: '#aaa' },

  // Error state
  errorContainer:     { flex: 1 },
  errorHeader:        { paddingTop: 55, paddingBottom: 28, paddingHorizontal: 22, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  errorHeaderTitle:   { fontSize: 24, fontWeight: '900', color: '#fff', textAlign: 'center' },
  errorBody:          { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  errorTitle:         { fontSize: 20, fontWeight: 'bold', color: '#FF6B6B', marginTop: 24, marginBottom: 12 },
  errorMessage:       { color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  retryBtn:           { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#7B1FA2', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 16, elevation: 3 },
  retryBtnText:       { color: '#fff', fontWeight: 'bold' },
});
