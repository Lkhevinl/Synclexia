import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar, Modal, FlatList, Image, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../components/icons/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import { TABLES } from '../../lib/constants';
import Sidebar from '../../components/Sidebar';
import ScreenWrapper from '../../components/ScreenWrapper';
import AIAvatarWidget from '../../components/AIAvatarWidget';
import tokens from '../../theme/tokens';
import { getStudentProgress } from '../../lib/analyticsHelper';
import { analyzeStudentProfile, ACTIVITY_META } from '../../lib/strengthsAnalysis';

const AVATAR_COLORS = ['#E91E63','#9C27B0','#3F51B5','#2196F3','#009688','#FF9800'];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

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

export default function ParentDashboardScreen({ navigation }) {
  const { profile, signOut } = useAuth();
  const { theme, colors, a11yTextStyle } = useTheme();
  const insets = useSafeAreaInsets();
  const s = React.useMemo(() => makeStyles(colors), [colors]);

  const [children, setChildren] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [childProfile, setChildProfile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [notifCount, setNotifCount] = useState(0);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dismissingId, setDismissingId] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Real-time subscription refs
  const profileSubRef = useRef(null);
  const sessionSubRef = useRef(null);

  // ── Fetch system notifications for parents ────────────────────────────────
  const fetchNotifications = async () => {
    if (!profile?.id) {
      setNotifications([]);
      setNotifCount(0);
      return;
    }
    try {
      // Get notifications that the user has NOT dismissed
      const { data: dismissed, error: dismissedError } = await supabase
        .from(TABLES.USER_NOTIFICATIONS)
        .select('notification_id')
        .eq('user_id', profile.id)
        .eq('is_dismissed', true);

      // If table doesn't exist yet, just show all notifications
      if (dismissedError) {
        console.log('User notifications table not ready, showing all notifications');
        const { data, error } = await supabase
          .from(TABLES.NOTIFICATIONS)
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
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        setNotifCount((data || []).filter(n => n.created_at >= sevenDaysAgo).length);
        return;
      }

      const dismissedIds = (dismissed || []).map(d => d.notification_id);

      // Build query for active notifications
      let query = supabase
        .from(TABLES.NOTIFICATIONS)
        .select('*')
        .in('target_role', ['all', 'parent'])
        .eq('is_draft', false)
        .order('created_at', { ascending: false })
        .limit(20);

      // Filter out dismissed notifications
      if (dismissedIds.length > 0) {
        query = query.not('id', 'in', `(${dismissedIds.join(',')})`);
      }

      const { data, error } = await query;

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
        .from(TABLES.PARENT_LINKS)
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
      // Fetch profile
      const { data: cp } = await supabase.from(TABLES.PROFILES).select('*').eq('id', sid).maybeSingle();
      setChildProfile(cp);

      // Fetch progress (non-critical)
      try {
        const prog = await getStudentProgress(sid, 14);
        setProgress(prog);
      } catch (err) {
        console.log('[ParentDashboard] Progress fetch failed:', err);
        setProgress(null);
      }

      // Fetch insights (non-critical)
      try {
        const insights = await analyzeStudentProfile(sid, 60);
        setAiInsights(insights);
      } catch (err) {
        console.log('[ParentDashboard] Insights fetch failed:', err);
        setAiInsights(null);
      }
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
      // Run fetches independently - don't let one failure break everything
      await Promise.all([
        loadChild(kids[idx]).catch(err => console.log('Load child failed:', err)),
        fetchNotifications().catch(err => console.log('Notifications fetch failed:', err))
      ]);
    } catch (e) {
      console.error('Dashboard refresh error:', e);
      // Only show error if critical data (children) couldn't load
      if (children.length === 0) {
        setError('Could not load dashboard data. Please check your connection and try again.');
      }
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

    // Child profile changes (streak updates)
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

  // ── Notification management ────────────────────────────────────────────────────
  const dismissNotification = async (notificationId) => {
    if (!profile?.id) return;
    setDismissingId(notificationId);
    try {
      const { error } = await supabase
        .from(TABLES.USER_NOTIFICATIONS)
        .upsert({
          user_id: profile.id,
          notification_id: notificationId,
          is_dismissed: true,
          dismissed_at: new Date().toISOString(),
        }, { onConflict: 'user_id,notification_id' });

      if (error) {
        console.error('Error dismissing notification:', error);
        // Still remove from UI even if DB save fails
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setNotifCount(prev => Math.max(0, prev - 1));
        return;
      }
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setNotifCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error dismissing notification:', error);
      // Still remove from UI on error
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setNotifCount(prev => Math.max(0, prev - 1));
    } finally {
      setDismissingId(null);
    }
  };

  const dismissAllNotifications = async () => {
    if (!profile?.id || notifications.length === 0) return;
    try {
      const records = notifications.map(n => ({
        user_id: profile.id,
        notification_id: n.id,
        is_dismissed: true,
        dismissed_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from(TABLES.USER_NOTIFICATIONS)
        .upsert(records, { onConflict: 'user_id,notification_id' });

      if (error) {
        console.error('Error clearing all notifications:', error);
        // Still clear UI even if DB save fails (table may not exist yet)
      }
      setNotifications([]);
      setNotifCount(0);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      setNotifications([]);
      setNotifCount(0);
    }
  };

  const clearAllNotifications = () => {
    if (notifications.length === 0) return;
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: dismissAllNotifications }
      ]
    );
  };

  const child = children[selectedIdx];
  const cp = childProfile;
  const name = cp?.full_name ?? child?.profiles?.full_name ?? 'Child';
  const streak = cp?.streak ?? 0;

  const navParams = { child };

  if (loading) {
    return (
      <ScreenWrapper role="parent" padded={false}>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[s.loadingText, { fontSize: theme.fontSize }, a11yTextStyle]}>Loading your children's data...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper role="parent" padded={false}>
        <LinearGradient colors={colors.headerGradient} style={s.errorHeader}>
          <Text style={[s.errorHeaderTitle, { fontSize: theme.fontSize + 10 }, a11yTextStyle]}>Parent Dashboard</Text>
        </LinearGradient>
        <View style={[s.errorBody, { paddingBottom: insets.bottom + 20 }]}>
          <Icon name="alert-circle" size="xl" color="#FF6B6B" />
          <Text style={[s.errorTitle, { fontSize: theme.fontSize + 6 }, a11yTextStyle]}>Connection Error</Text>
          <Text style={[s.errorMessage, { fontSize: theme.fontSize }, a11yTextStyle]}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => refresh(true)}>
            <Icon name="refresh-cw" size="md" color="#fff" />
            <Text style={[s.retryBtnText, { fontSize: theme.fontSize + 2 }, a11yTextStyle]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  if (children.length === 0) {
    return (
      <ScreenWrapper role="parent" padded={false}>
        <LinearGradient colors={colors.headerGradient} style={s.emptyHeader}>
          <Text style={[s.emptyHeaderTitle, { fontSize: theme.fontSize + 10 }, a11yTextStyle]}>Parent Dashboard</Text>
        </LinearGradient>
        <View style={[s.emptyBody, { paddingBottom: insets.bottom + 20 }]}>
          <Icon name="users" size="xl" color="#ddd" />
          <Text style={[s.emptyTitle, { fontSize: theme.fontSize + 6 }, a11yTextStyle]}>No children linked yet</Text>
          <Text style={[s.emptyHint, { fontSize: theme.fontSize }, a11yTextStyle]}>Search for your child's account to start monitoring their progress.</Text>
          <TouchableOpacity style={s.linkChildBtn} onPress={() => navigation.navigate('ParentLinkChild')}>
            <Icon name="plus-circle" size="md" color="#fff" />
            <Text style={[s.linkChildBtnText, { fontSize: theme.fontSize + 2 }, a11yTextStyle]}>Link a Child</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.logOutBtn} onPress={signOut}>
            <Text style={[s.logOutBtnText, { fontSize: theme.fontSize + 2 }, a11yTextStyle]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper role="parent" padded={false}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* ── Header (matches learner style) ── */}
      <View style={[s.header, { backgroundColor: colors.surface }]}>
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
            <Icon name="users" size="md" color="rgba(255,255,255,0.9)" />
          </View>

          {/* Bell icon */}
          <TouchableOpacity style={s.iconBtn} onPress={() => setNotifModalVisible(true)}>
            <Icon name="bell" size="md" color="#333" />
            {notifCount > 0 && <View style={s.redDot} />}
          </TouchableOpacity>

          {/* Menu icon */}
          <TouchableOpacity style={s.iconBtn} onPress={() => setSidebarVisible(true)}>
            <Icon name="menu" size="md" color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 20 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); refresh(); }} colors={[colors.primary]} />}
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
            <Icon name="pencil" size="md" color={colors.primary} />
            <Text style={[s.editChildBtnText, { fontSize: theme.fontSize - 1 }, a11yTextStyle]}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* ── Stats Row ── */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Icon name="flame" size="md" color="#F44336" />
            <Text style={[s.statVal, { color: '#F44336' }, a11yTextStyle]}>{streak}</Text>
            <Text style={[s.statLbl, a11yTextStyle]}>Day Streak</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statBox}>
            <Icon name="check-circle" size="md" color="#4CAF50" />
            <Text style={[s.statVal, { color: '#4CAF50' }, a11yTextStyle]}>{progress?.totalSessions ?? 0}</Text>
            <Text style={[s.statLbl, a11yTextStyle]}>Sessions</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statBox}>
            <Icon name="trophy" size="md" color="#FF9800" />
            <Text style={[s.statVal, { color: '#FF9800' }, a11yTextStyle]}>{progress?.avgAccuracy ?? 0}%</Text>
            <Text style={[s.statLbl, a11yTextStyle]}>Accuracy</Text>
          </View>
        </View>

        {/* ── Learning Report Summary ── */}
        {aiInsights && aiInsights.totalSessions > 0 && (
          <>
            <Text style={[s.sectionTitle, { fontSize: theme.fontSize + 2 }, a11yTextStyle]}>Learning Report Summary</Text>
            <View style={s.reportCard}>
              {/* 1. PURPOSE & 2. BACKGROUND Header */}
              <View style={s.reportHeader}>
                <View style={[s.reportBadge, { backgroundColor: aiInsights.overallScore >= 75 ? '#E8F5E9' : aiInsights.overallScore >= 50 ? '#FFF3E0' : '#FFEBEE' }]}>
                  <Icon name="file-text" size="sm" color={aiInsights.overallScore >= 75 ? '#4CAF50' : aiInsights.overallScore >= 50 ? '#FF9800' : '#EF5350'} />
                  <Text style={[s.reportBadgeText, { color: aiInsights.overallScore >= 75 ? '#2E7D32' : aiInsights.overallScore >= 50 ? '#E65100' : '#C62828' }]}>AI Assessment</Text>
                </View>
                <Text style={[s.reportDate, { fontSize: theme.fontSize - 3 }, a11yTextStyle]}>
                  {name} · Last 60 days
                </Text>
              </View>

              {/* 3. METHODOLOGY */}
              <View style={s.reportSection}>
                <Text style={[s.reportSectionTitle, { fontSize: theme.fontSize - 2 }, a11yTextStyle]}>
                  <Icon name="database" size="xs" color="#666" /> Data Source
                </Text>
                <Text style={[s.reportSectionBody, { fontSize: theme.fontSize - 2 }, a11yTextStyle]}>
                  Analysis based on {aiInsights.totalSessions} completed sessions across {aiInsights.activitiesPracticed} learning activities.
                </Text>
              </View>

              {/* 4. KEY FINDINGS */}
              <View style={s.reportSection}>
                <Text style={[s.reportSectionTitle, { fontSize: theme.fontSize - 2 }, a11yTextStyle]}>
                  <Icon name="search" size="xs" color="#666" /> Key Findings
                </Text>

                {/* Overall Score */}
                <View style={s.reportFindingsRow}>
                  <View style={[s.reportScoreRingSmall, { borderColor: aiInsights.overallScore >= 75 ? '#4CAF50' : aiInsights.overallScore >= 50 ? '#FF9800' : '#EF5350' }]}>
                    <Text style={[s.reportScoreNumSmall, { color: aiInsights.overallScore >= 75 ? '#4CAF50' : aiInsights.overallScore >= 50 ? '#FF9800' : '#EF5350' }]}>{aiInsights.overallScore}</Text>
                  </View>
                  <View style={s.reportFindingText}>
                    <Text style={[s.reportFindingLabel, { fontSize: theme.fontSize - 1 }, a11yTextStyle]}>Overall Learning Score</Text>
                    <Text style={[s.reportFindingSub, { fontSize: theme.fontSize - 3 }, a11yTextStyle]}>
                      {aiInsights.strengths.length} strength{aiInsights.strengths.length !== 1 ? 's' : ''} · {aiInsights.weaknesses.length} area{aiInsights.weaknesses.length !== 1 ? 's' : ''} to improve
                    </Text>
                  </View>
                </View>

                {/* Top Strength */}
                {aiInsights.strengths.length > 0 && (
                  <View style={[s.reportFindingItem, { backgroundColor: '#E8F5E9' }]}>
                    <Icon name="trending-up" size="sm" color="#4CAF50" />
                    <View style={s.reportFindingItemText}>
                      <Text style={[s.reportFindingItemLabel, { color: '#2E7D32' }, a11yTextStyle]}>
                        Strongest: {aiInsights.strengths[0].label}
                      </Text>
                      <Text style={[s.reportFindingItemValue, { color: '#4CAF50' }, a11yTextStyle]}>
                        {aiInsights.strengths[0].avgAccuracy}% accuracy
                      </Text>
                    </View>
                  </View>
                )}

                {/* Top Weakness */}
                {aiInsights.weaknesses.length > 0 && (
                  <View style={[s.reportFindingItem, { backgroundColor: '#FFF3E0' }]}>
                    <Icon name="alert-circle" size="sm" color="#FF9800" />
                    <View style={s.reportFindingItemText}>
                      <Text style={[s.reportFindingItemLabel, { color: '#E65100' }, a11yTextStyle]}>
                        Needs Focus: {aiInsights.weaknesses[0].label}
                      </Text>
                      <Text style={[s.reportFindingItemValue, { color: '#FF9800' }, a11yTextStyle]}>
                        {aiInsights.weaknesses[0].avgAccuracy}% accuracy
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* 5. CONCLUSION */}
              <View style={[s.reportConclusion, { backgroundColor: aiInsights.overallScore >= 75 ? '#E8F5E9' : aiInsights.overallScore >= 50 ? '#FFF8E1' : '#FFEBEE' }]}>
                <Icon name="check-circle" size="md" color={aiInsights.overallScore >= 75 ? '#4CAF50' : aiInsights.overallScore >= 50 ? '#F57C00' : '#EF5350'} />
                <View style={s.reportConclusionText}>
                  <Text style={[s.reportConclusionTitle, { fontSize: theme.fontSize - 1 }, a11yTextStyle]}>
                    {aiInsights.overallScore >= 75 ? 'Strong Learner' : aiInsights.overallScore >= 50 ? 'Making Progress' : 'Needs Support'}
                  </Text>
                  <Text style={[s.reportConclusionBody, { fontSize: theme.fontSize - 2 }, a11yTextStyle]}>
                    {aiInsights.overallScore >= 75
                      ? `${name.split(' ')[0]} demonstrates excellent learning consistency with strong performance across multiple activities.`
                      : aiInsights.overallScore >= 50
                      ? `${name.split(' ')[0]} is showing steady improvement. Regular practice will help build stronger skills in focus areas.`
                      : `${name.split(' ')[0]} would benefit from additional support and more frequent practice sessions.`}
                  </Text>
                </View>
              </View>

              {/* 6. RECOMMENDATIONS / NEXT STEPS */}
              {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
                <View style={s.reportSection}>
                  <Text style={[s.reportSectionTitle, { fontSize: theme.fontSize - 2 }, a11yTextStyle]}>
                    <Icon name="lightbulb" size="xs" color="#666" /> Recommended Actions
                  </Text>
                  {aiInsights.recommendations.slice(0, 2).map((rec, i) => (
                    <View key={i} style={[s.reportRecItem, { borderLeftColor: rec.color }]}>
                      <Icon name={rec.icon} size="sm" color={rec.color} />
                      <View style={s.reportRecText}>
                        <Text style={[s.reportRecTitle, { color: rec.color }, a11yTextStyle]}>{rec.title}</Text>
                        <Text style={[s.reportRecBody, { fontSize: theme.fontSize - 3 }, a11yTextStyle]} numberOfLines={2}>
                          {rec.body}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

            </View>
          </>
        )}

        {/* ── Quick Nav ── */}
        <Text style={[s.sectionTitle, { fontSize: theme.fontSize + 2 }, a11yTextStyle]}>Quick Access</Text>
        <View style={s.navList}>
          {[
            { icon: 'bar-chart', label: 'Progress Report', desc: 'View detailed learning history', screen: 'AIInsights', params: { studentId: childProfile?.id || child?.profiles?.id || child?.student_id } },
            { icon: 'time',      label: 'Activity Log',    desc: 'See recent sessions and exercises', screen: 'ParentActivityLog' },
          ].map((item) => (
            <TouchableOpacity key={item.screen} style={s.navCard} onPress={() => navigation.navigate(item.screen, item.params ?? navParams)} activeOpacity={0.85}>
              <View style={s.navIconSquare}>
                <Icon name={item.icon} size="md" color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.navLabel, { fontSize: theme.fontSize }, a11yTextStyle]}>{item.label}</Text>
                <Text style={[s.navDesc, { fontSize: theme.fontSize - 2 }, a11yTextStyle]}>{item.desc}</Text>
              </View>
              <Icon name="chevron-forward" size="md" color={colors.primary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── AI Insights Panel ── */}
        {aiInsights && aiInsights.totalSessions > 0 && (
          <>
            <Text style={[s.sectionTitle, { fontSize: theme.fontSize + 2 }, a11yTextStyle]}>AI Learning Insights</Text>
            <View style={s.aiCard}>
              <View style={s.aiCardHeader}>
                <Icon name="brain" size="lg" color="#7C4DFF" />
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
                      <Icon name={str.icon} size="sm" color="#2E7D32" />
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
                      <Icon name={wk.icon} size="sm" color="#E65100" />
                      <Text style={[s.aiRowLabel, { fontSize: theme.fontSize - 2 }, a11yTextStyle]}>{wk.label}</Text>
                      <Text style={[s.aiRowScore, { color: '#E65100', fontSize: theme.fontSize - 2 }, a11yTextStyle]}>{wk.avgAccuracy}%</Text>
                    </View>
                  ))}
                </View>
              )}

              {aiInsights.notPracticed.length > 0 && (
                <View style={s.aiNotPracticedRow}>
                  <Icon name="alert-circle" size="md" color="#FF9800" />
                  <Text style={[s.aiNotPracticedText, { fontSize: theme.fontSize - 3 }, a11yTextStyle]}>
                    Not tried yet: {aiInsights.notPracticed.map(a => ACTIVITY_META[a]?.label).filter(Boolean).join(', ')}
                  </Text>
                </View>
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
              <Text style={[s.notifTitle, { fontSize: theme.fontSize + 6 }, a11yTextStyle]}>Announcements</Text>
              <View style={s.notifHeaderActions}>
                {notifications.length > 0 && (
                  <TouchableOpacity onPress={clearAllNotifications} style={s.clearAllBtn}>
                    <Text style={s.clearAllText}>Clear All</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setNotifModalVisible(false)}>
                  <Icon name="x" size="md" color="#666" />
                </TouchableOpacity>
              </View>
            </View>
            <FlatList
              data={notifications}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Icon name="bell-off" size="lg" color="#ddd" />
                  <Text style={[{ textAlign: 'center', color: '#999', padding: 30, fontSize: theme.fontSize }, a11yTextStyle]}>
                    No announcements yet.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={s.notifItem}>
                  <View style={s.notifItemIconBox}>
                    <Icon name="megaphone" size="md" color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.notifItemTitle, { fontSize: theme.fontSize }, a11yTextStyle]}>{item.title}</Text>
                    <Text style={[s.notifItemBody, { fontSize: theme.fontSize - 1 }, a11yTextStyle]} numberOfLines={3}>{item.content}</Text>
                    <Text style={[s.notifItemDate, { fontSize: theme.fontSize - 3 }, a11yTextStyle]}>{new Date(item.created_at).toLocaleDateString()}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => dismissNotification(item.id)}
                    disabled={dismissingId === item.id}
                    style={s.dismissBtn}
                  >
                    {dismissingId === item.id ? (
                      <ActivityIndicator size="small" color="#999" />
                    ) : (
                      <Icon name="x" size="sm" color="#999" />
                    )}
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* ── Floating AI Widget (shown when child selected) ── */}
      {child && (
        <AIAvatarWidget
          studentId={childProfile?.id || child?.profiles?.id || child?.student_id}
          studentName={childProfile?.full_name?.split(' ')[0] || child?.profiles?.full_name?.split(' ')[0] || 'Child'}
        />
      )}
    </ScreenWrapper>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container:          { flex: 1 },
  loadingContainer:   { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText:        { marginTop: tokens.spacing.md, color: colors.primary, fontWeight: '600' },
  emptyHeader:        { paddingTop: 60, paddingBottom: 30, paddingHorizontal: tokens.spacing.lg },
  emptyHeaderTitle:   { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  emptyBody:          { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyTitle:         { fontSize: 20, fontWeight: 'bold', color: '#555', marginTop: 20 },
  emptyHint:          { fontSize: 14, color: '#999', marginTop: tokens.spacing.sm, textAlign: 'center', lineHeight: 22 },
  linkChildBtn:       { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm, backgroundColor: colors.primary, borderRadius: 25, paddingHorizontal: tokens.spacing.lg, paddingVertical: 14, marginTop: tokens.spacing.lg, elevation: 3 },
  linkChildBtnText:   { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logOutBtn:          { borderWidth: 1.5, borderColor: '#E05C5C', borderRadius: 25, paddingHorizontal: tokens.spacing.lg, paddingVertical: 14, marginTop: tokens.spacing.md, minWidth: 160, alignItems: 'center' },
  logOutBtnText:      { color: '#E05C5C', fontWeight: 'bold', fontSize: 16 },

  header:             { paddingTop: 50, paddingBottom: tokens.spacing.md, paddingHorizontal: tokens.spacing.md },
  headerContent:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarWrapper:      { width: 48, height: 48, borderRadius: 24, overflow: 'hidden', flexShrink: 0 },
  avatarImg:          { width: 48, height: 48, borderRadius: 24 },
  avatarPlaceholder:  { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarInitial:      { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  welcomeCard:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: tokens.radius.lg, paddingVertical: 14, paddingHorizontal: tokens.spacing.md, backgroundColor: colors.primary, ...tokens.shadows.low },
  welcomeTitle:       { fontSize: 14, fontWeight: '700', color: '#fff' },
  welcomeSub:         { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  iconBtn:            { width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', ...tokens.shadows.low, flexShrink: 0, position: 'relative' },
  redDot:             { position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF5252', borderWidth: 2, borderColor: '#fff' },
  badge:              { position: 'absolute', top: 0, right: 0, backgroundColor: '#F44336', borderRadius: tokens.spacing.sm, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  badgeText:          { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  childTabs:          { marginBottom: 14 },
  childTab:           { paddingHorizontal: tokens.spacing.md, paddingVertical: tokens.spacing.sm, borderRadius: tokens.radius.lg, backgroundColor: '#fff', marginRight: tokens.spacing.sm, elevation: 1, borderWidth: 1.5, borderColor: '#E0D8D4' },
  childTabActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  childTabText:       { color: '#888', fontWeight: '600', fontSize: 13 },
  childTabTextActive: { color: '#fff' },

  scroll:             { padding: tokens.spacing.md },

  heroCard:           { backgroundColor: colors.surface, borderRadius: tokens.radius.lg, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 14, ...tokens.shadows.mid, gap: 14, borderLeftWidth: 4, borderLeftColor: colors.primary },
  heroAvatar:         { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  heroAvatarImg:      { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: colors.primary },
  heroAvatarText:     { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  heroName:           { fontSize: 18, fontWeight: '800', color: '#222' },
  heroEmail:          { fontSize: 12, color: '#aaa', marginTop: 3 },
  editChildBtn:       { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.xs, backgroundColor: colors.primaryLight, borderRadius: tokens.radius.lg, paddingHorizontal: tokens.spacing.md, paddingVertical: 7, alignSelf: 'flex-start' },
  editChildBtnText:   { color: colors.primary, fontWeight: '700', fontSize: 13 },

  statsRow:           { flexDirection: 'row', backgroundColor: '#fff', borderRadius: tokens.radius.lg, marginBottom: tokens.spacing.md, ...tokens.shadows.low, overflow: 'hidden' },
  statBox:            { flex: 1, alignItems: 'center', paddingVertical: tokens.spacing.md },
  statDivider:        { width: 1, backgroundColor: '#F0F0F0', marginVertical: tokens.spacing.md },
  statVal:            { fontSize: 20, fontWeight: 'bold', marginTop: 5 },
  statLbl:            { fontSize: 10, color: '#999', fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },

  // Report Summary Card - Essential Elements
  reportCard:              { backgroundColor: '#fff', borderRadius: tokens.radius.lg, padding: 18, marginBottom: 14, ...tokens.shadows.mid },
  // 1. Purpose & Background
  reportHeader:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  reportBadge:             { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: tokens.radius.md, paddingHorizontal: 10, paddingVertical: 6 },
  reportBadgeText:         { fontSize: 12, fontWeight: 'bold' },
  reportDate:              { color: '#888' },
  // 3. Methodology & 4. Key Findings
  reportSection:           { marginBottom: 16 },
  reportSectionTitle:      { fontWeight: 'bold', color: '#444', marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  reportSectionBody:       { color: '#666', lineHeight: 18 },
  reportFindingsRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  reportScoreRingSmall:    { width: 56, height: 56, borderRadius: 28, borderWidth: 3, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  reportScoreNumSmall:     { fontSize: 20, fontWeight: 'bold' },
  reportFindingText:       { flex: 1 },
  reportFindingLabel:      { fontWeight: 'bold', color: '#333' },
  reportFindingSub:        { color: '#888', marginTop: 2 },
  reportFindingItem:       { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: tokens.radius.md, padding: 12, marginBottom: 8 },
  reportFindingItemText:   { flex: 1 },
  reportFindingItemLabel:  { fontWeight: '600', fontSize: 13 },
  reportFindingItemValue:  { fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  // 5. Conclusion
  reportConclusion:        { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: tokens.radius.md, padding: 14, marginBottom: 16 },
  reportConclusionText:    { flex: 1 },
  reportConclusionTitle:   { fontWeight: 'bold', marginBottom: 4 },
  reportConclusionBody:    { color: '#555', lineHeight: 18 },
  // 6. Recommendations
  reportRecItem:           { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FAFAFA', borderRadius: tokens.radius.md, padding: 12, marginBottom: 8, borderLeftWidth: 4 },
  reportRecText:           { flex: 1 },
  reportRecTitle:          { fontWeight: 'bold', fontSize: 13, marginBottom: 2 },
  reportRecBody:           { color: '#666', lineHeight: 16 },
  // View Button
  reportViewBtn:           { borderRadius: tokens.radius.lg, overflow: 'hidden', marginTop: 4 },
  reportViewGradient:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  reportViewText:          { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  sectionTitle:       { fontSize: 15, fontWeight: '800', color: '#333', marginBottom: 10, marginTop: tokens.spacing.xs },

  navList:            { gap: 10, marginBottom: tokens.spacing.md },
  navCard:            { backgroundColor: colors.surfaceCard, borderRadius: tokens.radius.md, padding: tokens.spacing.md, flexDirection: 'row', alignItems: 'center', gap: 14, ...tokens.shadows.low, borderLeftWidth: 4, borderLeftColor: colors.primary },
  navIconSquare:      { width: 48, height: 48, borderRadius: tokens.radius.md, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  navLabel:           { fontSize: 15, fontWeight: '700', color: '#222', marginBottom: 2 },
  navDesc:            { fontSize: 12, color: '#888' },

  card:               { backgroundColor: '#fff', borderRadius: tokens.radius.md, padding: 18, marginBottom: 14, ...tokens.shadows.low },
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
  barBg:              { height: 8, backgroundColor: '#F0F0F0', borderRadius: tokens.spacing.xs, overflow: 'hidden' },
  barFill:            { height: '100%', borderRadius: tokens.spacing.xs },
  emptySnap:          { alignItems: 'center', paddingVertical: tokens.spacing.lg },
  emptySnapText:      { color: '#bbb', marginTop: tokens.spacing.sm, fontSize: 13 },
  viewAll:            { marginTop: 14, alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  viewAllText:        { color: colors.primary, fontWeight: 'bold', fontSize: 13 },

  assignRow:          { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', gap: 10 },
  assignIcon:         { fontSize: 24 },
  assignName:         { fontSize: 14, fontWeight: '600', color: '#333' },
  assignNote:         { fontSize: 11, color: '#999', marginTop: 2 },
  diffBadge:          { borderRadius: 10, paddingHorizontal: 10, paddingVertical: tokens.spacing.xs },
  diffText:           { fontSize: 11, fontWeight: 'bold' },

  // AI Insights panel
  aiCard:             { backgroundColor: '#fff', borderRadius: tokens.radius.md, padding: 18, marginBottom: 14, ...tokens.shadows.low },
  aiCardHeader:       { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.md, marginBottom: 14, paddingBottom: tokens.spacing.md, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  aiCardIcon:         { fontSize: 30 },
  aiCardTitle:        { fontSize: 15, fontWeight: '800', color: '#333' },
  aiCardSub:          { fontSize: 11, color: '#999', marginTop: 2 },
  aiSection:          { marginBottom: tokens.spacing.md },
  aiSectionLabel:     { fontSize: 11, fontWeight: '800', marginBottom: tokens.spacing.sm, textTransform: 'uppercase', letterSpacing: 0.6 },
  aiRow:              { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, gap: tokens.spacing.sm },
  aiRowIcon:          { fontSize: 16, width: 22 },
  aiRowLabel:         { flex: 1, fontSize: 13, color: '#444' },
  aiRowScore:         { fontSize: 13, fontWeight: 'bold' },
  aiNotPracticedRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF8E1', borderRadius: 10, padding: 10, marginTop: tokens.spacing.xs },
  aiNotPracticedText: { flex: 1, fontSize: 11, color: '#F57C00', lineHeight: 16 },

  // Notification bell
  notifBadgeBtn:      { position: 'relative', padding: tokens.spacing.xs },

  // Notification modal
  notifOverlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  notifCard:          { backgroundColor: '#fff', borderTopLeftRadius: tokens.radius.xl, borderTopRightRadius: tokens.radius.xl, padding: tokens.spacing.lg, maxHeight: '75%' },
  notifHeader:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing.md, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: tokens.spacing.md },
  notifTitle:         { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  notifItem:          { backgroundColor: colors.primaryLight, borderRadius: tokens.radius.md, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', gap: tokens.spacing.md },
  notifItemIconBox:   { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary + '30', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  notifItemTitle:     { fontSize: 14, fontWeight: 'bold', color: colors.primary, marginBottom: tokens.spacing.xs },
  notifItemBody:      { fontSize: 13, color: '#555', marginBottom: 6, lineHeight: 18 },
  notifItemDate:      { fontSize: 11, color: '#aaa' },
  notifHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  clearAllBtn:        { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f0f0f0', borderRadius: 16 },
  clearAllText:       { fontSize: 12, color: '#666', fontWeight: '600' },
  dismissBtn:         { padding: 8, marginLeft: 4 },

  // Error state
  errorHeader:        { paddingTop: 55, paddingBottom: tokens.spacing.xl, paddingHorizontal: 22, borderBottomLeftRadius: tokens.radius.md, borderBottomRightRadius: tokens.radius.md },
  errorHeaderTitle:   { fontSize: 24, fontWeight: '900', color: '#fff', textAlign: 'center' },
  errorBody:          { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: tokens.spacing.xl },
  errorTitle:         { fontSize: 20, fontWeight: 'bold', color: '#FF6B6B', marginTop: tokens.spacing.lg, marginBottom: tokens.spacing.md },
  errorMessage:       { color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: tokens.spacing.xl },
  retryBtn:           { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: tokens.spacing.xl, borderRadius: tokens.radius.md, ...tokens.shadows.mid },
  retryBtnText:       { color: '#fff', fontWeight: 'bold' },
});
