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
import { analyzeStudentProfile, ACTIVITY_META } from '../../lib/strengthsAnalysis';

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
  const [aiInsights, setAiInsights] = useState(null);
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
            email,
            avatar_url,
            banner_url
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
      const [{ data: cp }, prog, insights] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', sid).maybeSingle(),
        getStudentProgress(sid, 14),
        analyzeStudentProfile(sid, 60),
      ]);

      setChildProfile(cp);
      setProgress(prog);
      setAiInsights(insights);
    } catch (error) {
      console.warn('[ParentDashboard] loadChild failed:', error);
      setChildProfile(null);
      setProgress(null);
      setAiInsights(null);
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
    setAiInsights(null);
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
        <LinearGradient colors={['#E8927C', '#C87456']} style={s.errorHeader}>
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
        <LinearGradient colors={['#E8927C', '#C87456']} style={s.emptyHeader}>
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
      <StatusBar barStyle="dark-content" backgroundColor={getBgColor()} />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* ── Header (matches learner style) ── */}
      <View style={[s.header, { backgroundColor: getBgColor() }]}>
        <View style={s.headerContent}>
          {/* Avatar */}
          <TouchableOpacity style={s.avatarWrapper} activeOpacity={0.8}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={s.avatarImg} resizeMode="cover" />
            ) : (
              <View style={s.avatarPlaceholder}>
                <Text style={s.avatarInitial}>{(profile?.full_name?.[0] ?? 'P').toUpperCase()}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Welcome pill */}
          <View style={s.welcomeCard}>
            <View style={{ flex: 1 }}>
              <Text style={[s.welcomeTitle, a11yTextStyle]} numberOfLines={1}>
                Hello, {profile?.full_name?.split(' ')[0] ?? 'Parent'}!
              </Text>
              <Text style={[s.welcomeSub, a11yTextStyle]} numberOfLines={1}>Monitoring your child's progress</Text>
            </View>
            <Ionicons name="people" size={22} color="rgba(255,255,255,0.9)" />
          </View>

          {/* Bell icon */}
          <TouchableOpacity style={s.iconBtn} onPress={() => setNotifModalVisible(true)}>
            <Ionicons name="notifications-outline" size={22} color="#333" />
            {notifCount > 0 && <View style={s.redDot} />}
          </TouchableOpacity>

          {/* Menu icon */}
          <TouchableOpacity style={s.iconBtn} onPress={() => setSidebarVisible(true)}>
            <Ionicons name="menu-outline" size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 20 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); refresh(); }} colors={['#E8927C']} />}
      >
        {/* Child tabs (only when multiple children) */}
        {children.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.childTabs} contentContainerStyle={{ paddingRight: 8 }}>
            {children.map((c, i) => {
              const n = c.profiles?.full_name ?? 'Child';
              return (
                <TouchableOpacity key={c.student_id || i} style={[s.childTab, i === selectedIdx && s.childTabActive]} onPress={() => switchChild(i)}>
                  <Text style={[s.childTabText, i === selectedIdx && s.childTabTextActive, a11yTextStyle]}>{n.split(' ')[0]}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
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
            <Ionicons name="create-outline" size={16} color="#E8927C" />
            <Text style={[s.editChildBtnText, { fontSize: theme.fontSize - 1 }, a11yTextStyle]}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* ── Stats Row ── */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Ionicons name="flame" size={22} color="#F44336" />
            <Text style={[s.statVal, { color: '#F44336' }, a11yTextStyle]}>{streak}</Text>
            <Text style={[s.statLbl, a11yTextStyle]}>Day Streak</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statBox}>
            <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
            <Text style={[s.statVal, { color: '#4CAF50' }, a11yTextStyle]}>{progress?.totalSessions ?? 0}</Text>
            <Text style={[s.statLbl, a11yTextStyle]}>Sessions</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statBox}>
            <Ionicons name="trophy" size={22} color="#FF9800" />
            <Text style={[s.statVal, { color: '#FF9800' }, a11yTextStyle]}>{progress?.avgAccuracy ?? 0}%</Text>
            <Text style={[s.statLbl, a11yTextStyle]}>Accuracy</Text>
          </View>
        </View>

        {/* ── Quick Nav ── */}
        <Text style={[s.sectionTitle, { fontSize: theme.fontSize + 2 }, a11yTextStyle]}>Quick Access</Text>
        <View style={s.navList}>
          {[
            { icon: 'bar-chart', label: 'Progress Report', desc: 'View detailed learning history', screen: 'ParentProgress' },
            { icon: 'time',      label: 'Activity Log',    desc: 'See recent sessions and exercises', screen: 'ParentActivityLog' },
          ].map((item) => (
            <TouchableOpacity key={item.screen} style={s.navCard} onPress={() => navigation.navigate(item.screen, navParams)} activeOpacity={0.85}>
              <View style={s.navIconSquare}>
                <Ionicons name={item.icon} size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.navLabel, { fontSize: theme.fontSize }, a11yTextStyle]}>{item.label}</Text>
                <Text style={[s.navDesc, { fontSize: theme.fontSize - 2 }, a11yTextStyle]}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#E8927C" />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── AI Insights Panel ── */}
        {aiInsights && aiInsights.totalSessions > 0 && (
          <>
            <Text style={[s.sectionTitle, { fontSize: theme.fontSize + 2 }, a11yTextStyle]}>AI Learning Insights</Text>
            <View style={s.aiCard}>
              <View style={s.aiCardHeader}>
                <Text style={s.aiCardIcon}>🧠</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.aiCardTitle, { fontSize: theme.fontSize }, a11yTextStyle]}>
                    Overall Score: <Text style={{ color: aiInsights.overallScore >= 75 ? '#4CAF50' : aiInsights.overallScore >= 50 ? '#FF9800' : '#EF5350' }}>{aiInsights.overallScore}%</Text>
                  </Text>
                  <Text style={[s.aiCardSub, { fontSize: theme.fontSize - 3 }, a11yTextStyle]}>{aiInsights.totalSessions} sessions analysed</Text>
                </View>
              </View>

              {aiInsights.strengths.length > 0 && (
                <View style={s.aiSection}>
                  <Text style={[s.aiSectionLabel, { color: '#2E7D32', fontSize: theme.fontSize - 2 }, a11yTextStyle]}>Strengths</Text>
                  {aiInsights.strengths.slice(0, 2).map(str => (
                    <View key={str.activity} style={s.aiRow}>
                      <Text style={s.aiRowIcon}>{str.icon}</Text>
                      <Text style={[s.aiRowLabel, { fontSize: theme.fontSize - 2 }, a11yTextStyle]}>{str.label}</Text>
                      <Text style={[s.aiRowScore, { color: '#2E7D32', fontSize: theme.fontSize - 2 }, a11yTextStyle]}>{str.avgAccuracy}%</Text>
                    </View>
                  ))}
                </View>
              )}

              {aiInsights.weaknesses.length > 0 && (
                <View style={s.aiSection}>
                  <Text style={[s.aiSectionLabel, { color: '#E65100', fontSize: theme.fontSize - 2 }, a11yTextStyle]}>Needs Practice</Text>
                  {aiInsights.weaknesses.slice(0, 2).map(wk => (
                    <View key={wk.activity} style={s.aiRow}>
                      <Text style={s.aiRowIcon}>{wk.icon}</Text>
                      <Text style={[s.aiRowLabel, { fontSize: theme.fontSize - 2 }, a11yTextStyle]}>{wk.label}</Text>
                      <Text style={[s.aiRowScore, { color: '#E65100', fontSize: theme.fontSize - 2 }, a11yTextStyle]}>{wk.avgAccuracy}%</Text>
                    </View>
                  ))}
                </View>
              )}

              {aiInsights.notPracticed.length > 0 && (
                <View style={s.aiNotPracticedRow}>
                  <Ionicons name="alert-circle-outline" size={14} color="#FF9800" />
                  <Text style={[s.aiNotPracticedText, { fontSize: theme.fontSize - 3 }, a11yTextStyle]}>
                    Not tried yet: {aiInsights.notPracticed.map(a => ACTIVITY_META[a]?.label).filter(Boolean).join(', ')}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

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
                <Text style={[s.viewAllText, { fontSize: theme.fontSize }, a11yTextStyle]}>View full report</Text>
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
                    <Ionicons name="megaphone" size={18} color="#E8927C" />
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
  container:          { flex: 1, backgroundColor: '#FAF5F1' },
  loadingContainer:   { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF5F1' },
  loadingText:        { marginTop: 12, color: '#E8927C', fontWeight: '600' },
  emptyContainer:     { flex: 1, backgroundColor: '#FAF5F1' },
  emptyHeader:        { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20 },
  emptyHeaderTitle:   { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  emptyBody:          { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyTitle:         { fontSize: 20, fontWeight: 'bold', color: '#555', marginTop: 20 },
  emptyHint:          { fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center', lineHeight: 22 },
  linkChildBtn:       { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E8927C', borderRadius: 25, paddingHorizontal: 24, paddingVertical: 14, marginTop: 24, elevation: 3 },
  linkChildBtnText:   { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  header:             { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16 },
  headerContent:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarWrapper:      { width: 48, height: 48, borderRadius: 24, overflow: 'hidden', flexShrink: 0 },
  avatarImg:          { width: 48, height: 48, borderRadius: 24 },
  avatarPlaceholder:  { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E8927C', justifyContent: 'center', alignItems: 'center' },
  avatarInitial:      { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  welcomeCard:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 24, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#E8927C', elevation: 2, shadowColor: '#E8927C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  welcomeTitle:       { fontSize: 14, fontWeight: '700', color: '#fff' },
  welcomeSub:         { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  iconBtn:            { width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, flexShrink: 0, position: 'relative' },
  redDot:             { position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF5252', borderWidth: 2, borderColor: '#fff' },
  badge:              { position: 'absolute', top: 0, right: 0, backgroundColor: '#F44336', borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  badgeText:          { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  childTabs:          { marginBottom: 14 },
  childTab:           { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', marginRight: 8, elevation: 1, borderWidth: 1.5, borderColor: '#E0D8D4' },
  childTabActive:     { backgroundColor: '#E8927C', borderColor: '#E8927C' },
  childTabText:       { color: '#888', fontWeight: '600', fontSize: 13 },
  childTabTextActive: { color: '#fff' },

  scroll:             { padding: 16 },

  heroCard:           { backgroundColor: '#fff', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 14, elevation: 3, gap: 14, borderLeftWidth: 4, borderLeftColor: '#E8927C' },
  heroAvatar:         { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  heroAvatarImg:      { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#E8927C' },
  heroAvatarText:     { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  heroName:           { fontSize: 18, fontWeight: '800', color: '#222' },
  heroEmail:          { fontSize: 12, color: '#aaa', marginTop: 3 },
  editChildBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF0EB', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, alignSelf: 'flex-start' },
  editChildBtnText:   { color: '#E8927C', fontWeight: '700', fontSize: 13 },

  statsRow:           { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, marginBottom: 16, elevation: 2, overflow: 'hidden' },
  statBox:            { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statDivider:        { width: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
  statVal:            { fontSize: 20, fontWeight: 'bold', marginTop: 5 },
  statLbl:            { fontSize: 10, color: '#999', fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },

  sectionTitle:       { fontSize: 15, fontWeight: '800', color: '#333', marginBottom: 10, marginTop: 4 },

  navList:            { gap: 10, marginBottom: 16 },
  navCard:            { backgroundColor: '#fff', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#E8927C', shadowColor: '#E8927C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
  navIconSquare:      { width: 48, height: 48, borderRadius: 14, backgroundColor: '#E8927C', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  navLabel:           { fontSize: 15, fontWeight: '700', color: '#222', marginBottom: 2 },
  navDesc:            { fontSize: 12, color: '#888' },

  card:               { backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 14, elevation: 2 },
  snapRow:            { flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', marginBottom: 14 },
  snapItem:           { alignItems: 'center' },
  snapVal:            { fontSize: 22, fontWeight: 'bold', color: '#333' },
  snapLbl:            { fontSize: 10, color: '#999', marginTop: 2, fontWeight: '600' },
  snapDiv:            { width: 1, backgroundColor: '#f0f0f0' },
  actRow:             { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  actIcon:            { fontSize: 22, width: 30 },
  actTop:             { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  actLabel:           { fontSize: 13, fontWeight: '600', color: '#333' },
  actAcc:             { fontSize: 13, fontWeight: 'bold' },
  barBg:              { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
  barFill:            { height: '100%', borderRadius: 4 },
  emptySnap:          { alignItems: 'center', paddingVertical: 24 },
  emptySnapText:      { color: '#bbb', marginTop: 8, fontSize: 13 },
  viewAll:            { marginTop: 14, alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  viewAllText:        { color: '#E8927C', fontWeight: 'bold', fontSize: 13 },

  assignRow:          { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', gap: 10 },
  assignIcon:         { fontSize: 24 },
  assignName:         { fontSize: 14, fontWeight: '600', color: '#333' },
  assignNote:         { fontSize: 11, color: '#999', marginTop: 2 },
  diffBadge:          { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  diffText:           { fontSize: 11, fontWeight: 'bold' },

  // AI Insights panel
  aiCard:             { backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 14, elevation: 2 },
  aiCardHeader:       { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  aiCardIcon:         { fontSize: 30 },
  aiCardTitle:        { fontSize: 15, fontWeight: '800', color: '#333' },
  aiCardSub:          { fontSize: 11, color: '#999', marginTop: 2 },
  aiSection:          { marginBottom: 12 },
  aiSectionLabel:     { fontSize: 11, fontWeight: '800', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 },
  aiRow:              { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, gap: 8 },
  aiRowIcon:          { fontSize: 16, width: 22 },
  aiRowLabel:         { flex: 1, fontSize: 13, color: '#444' },
  aiRowScore:         { fontSize: 13, fontWeight: 'bold' },
  aiNotPracticedRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF8E1', borderRadius: 10, padding: 10, marginTop: 4 },
  aiNotPracticedText: { flex: 1, fontSize: 11, color: '#F57C00', lineHeight: 16 },

  // Notification bell
  notifBadgeBtn:      { position: 'relative', padding: 4 },

  // Notification modal
  notifOverlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  notifCard:          { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '75%' },
  notifHeader:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 12 },
  notifTitle:         { fontSize: 18, fontWeight: 'bold', color: '#E8927C' },
  notifItem:          { backgroundColor: '#FFF5F0', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  notifItemIconBox:   { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFE0D0', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  notifItemTitle:     { fontSize: 14, fontWeight: 'bold', color: '#C87456', marginBottom: 4 },
  notifItemBody:      { fontSize: 13, color: '#555', marginBottom: 6, lineHeight: 18 },
  notifItemDate:      { fontSize: 11, color: '#aaa' },

  // Error state
  errorContainer:     { flex: 1 },
  errorHeader:        { paddingTop: 55, paddingBottom: 28, paddingHorizontal: 22, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  errorHeaderTitle:   { fontSize: 24, fontWeight: '900', color: '#fff', textAlign: 'center' },
  errorBody:          { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  errorTitle:         { fontSize: 20, fontWeight: 'bold', color: '#FF6B6B', marginTop: 24, marginBottom: 12 },
  errorMessage:       { color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  retryBtn:           { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#E8927C', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 16, elevation: 3 },
  retryBtnText:       { color: '#fff', fontWeight: 'bold' },
});
