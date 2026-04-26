import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList, StatusBar, Image, Dimensions, DeviceEventEmitter, Alert, ActivityIndicator, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../../components/icons/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { TABLES } from '../../lib/constants';
import { getStudentProgress } from '../../lib/analyticsHelper';
import Sidebar from '../../components/Sidebar';
import ScreenWrapper from '../../components/ScreenWrapper';
import tokens from '../../theme/tokens';
import StudentCard from '../../components/student/StudentCard';
import StudentButton from '../../components/student/StudentButton';
import StudentBadge from '../../components/student/StudentBadge';
import StudentIconBadge from '../../components/student/StudentIconBadge';
import StudentActivityCard from '../../components/student/StudentActivityCard';
import StudentSectionTitle from '../../components/student/StudentSectionTitle';
import { useCandyTokens } from '../../components/student/candyTokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');


// Loading Screen Component
const LoadingScreen = ({ surfaceColor }) => {
  return (
    <View style={[styles.loadingScreenContainer, { backgroundColor: surfaceColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={surfaceColor} />
      <Image
        source={require('../../../assets/synclexia-logo2-removebg-preview.png')}
        style={styles.loadingLogo}
        resizeMode="contain"
      />
    </View>
  );
};

export default function DashboardScreen({ navigation }) {
  const { theme, colors, a11yTextStyle } = useTheme();
  const { profile, fetchProfile } = useAuth();
  const c = useCandyTokens();

  const generateUniqueCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };
  
  const [notifVisible, setNotifVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadReplyCount, setUnreadReplyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dismissingId, setDismissingId] = useState(null);
  const [stats, setStats] = useState({ totalSessions: 0, avgAccuracy: 0, streak: 0 });

  const isStudent = profile?.role === 'student';

  // Auto-generate unique_code for students who were created before the sign-up fix
  useEffect(() => {
    if (!isStudent || !profile?.id || profile?.unique_code) return;
    const assignCode = async () => {
      try {
        const code = generateUniqueCode();
        await supabase.from(TABLES.PROFILES).update({ unique_code: code }).eq('id', profile.id);
        await fetchProfile(profile.id);
      } catch (error) {
        // Silently fail - code generation is not critical
      }
    };
    assignCode();
  }, [profile?.id]);

  const initializeDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      // Run all fetches independently - don't let one failure break everything
      await Promise.all([
        fetchNotifications().catch(err => console.log('Notifications fetch failed:', err)),
        fetchUnreadReplies().catch(err => console.log('Unread replies fetch failed:', err)),
        fetchStudentStats().catch(err => console.log('Stats fetch failed:', err))
      ]);
    } catch (error) {
      console.error('Dashboard initialization error:', error);
      // Don't show error screen - individual fetches handle their own errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeDashboard();
  }, []);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('openSidebar', () => setSidebarVisible(true));
    return () => sub.remove();
  }, []);

  // Re-fetch notifications each time this screen comes into focus so that
  // announcements posted after the initial mount are reflected immediately.
  useFocusEffect(
    useCallback(() => {
      if (profile?.id) fetchNotifications();
    }, [profile?.id])
  );

  const fetchNotifications = async () => {
    if (!profile?.id) {
      setNotifications([]);
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
          .eq('is_draft', false)
          .in('target_role', ['all', 'student'])
          .order('created_at', { ascending: false });

        if (error) {
          setNotifications([]);
          return;
        }
        setNotifications(data || []);
        return;
      }

      const dismissedIds = (dismissed || []).map(d => d.notification_id);

      // Build query for active notifications
      let query = supabase
        .from(TABLES.NOTIFICATIONS)
        .select('*')
        .eq('is_draft', false)
        .in('target_role', ['all', 'student'])
        .order('created_at', { ascending: false });

      // Filter out dismissed notifications
      if (dismissedIds.length > 0) {
        query = query.not('id', 'in', `(${dismissedIds.join(',')})`);
      }

      const { data, error } = await query;

      if (error) {
        setNotifications([]);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  const fetchUnreadReplies = async () => {
    if (!profile?.id) return;
    try {
      const { count, error } = await supabase
        .from(TABLES.FEEDBACK)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile?.id)
        .eq('has_unread_reply', true);

      if (error) {
        setUnreadReplyCount(0);
        return;
      }

      setUnreadReplyCount(count || 0);
    } catch (error) {
      setUnreadReplyCount(0);
    }
  };

  const fetchStudentStats = async () => {
    if (!profile?.id) return;
    try {
      const progress = await getStudentProgress(profile.id, 30);

      // Calculate streak (consecutive days with activity)
      const { data: sessions } = await supabase
        .from(TABLES.SESSION_LOGS)
        .select('created_at')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });

      let streak = 0;
      if (sessions && sessions.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activityDates = new Set();
        sessions.forEach(s => {
          const sessionDate = new Date(s.created_at);
          sessionDate.setHours(0, 0, 0, 0);
          activityDates.add(sessionDate.getTime());
        });

        const sortedDates = Array.from(activityDates).sort((a, b) => b - a);

        const mostRecentDiff = Math.floor((today - sortedDates[0]) / (1000 * 60 * 60 * 24));
        if (mostRecentDiff <= 1) {
          for (let i = 0; i < sortedDates.length; i++) {
            const daysDiff = Math.floor((today - sortedDates[i]) / (1000 * 60 * 60 * 24));
            if (daysDiff === streak) {
              streak++;
            } else {
              break;
            }
          }
        }
      }

      setStats({
        totalSessions: progress.totalSessions || 0,
        avgAccuracy: Math.round(progress.avgAccuracy) || 0,
        streak: streak,
      });
    } catch (error) {
      setStats({ totalSessions: 0, avgAccuracy: 0, streak: 0 });
    }
  };

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
        return;
      }
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error dismissing notification:', error);
      // Still remove from UI on error
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
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
        return;
      }
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const clearAllNotifications = () => {
    if (notifications.length === 0) return;
    if (Platform.OS === 'web') {
      if (!window.confirm('Clear all notifications?')) return;
      dismissAllNotifications();
    } else {
      Alert.alert(
        'Clear All Notifications',
        'Are you sure you want to clear all notifications?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear All', style: 'destructive', onPress: dismissAllNotifications }
        ]
      );
    }
  };


  return (
    <ScreenWrapper role="student" padded={false}>
      <StatusBar barStyle="light-content" backgroundColor={c.primary} translucent={false} />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {loading ? (
        <LoadingScreen surfaceColor={colors.surface} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size="xl" color="#FF6B6B" />
          <Text style={[styles.errorTitle, { fontSize: theme.fontSize + 6 }, a11yTextStyle]}>Connection Error</Text>
          <Text style={[styles.errorMessage, { fontSize: theme.fontSize }, a11yTextStyle]}>{error}</Text>
          <StudentButton variant="primary" onPress={() => initializeDashboard()} style={styles.retryBtnWrap}>
            <Icon name="refresh-cw" size="md" color="#fff" />
            <Text style={styles.retryBtnText}>Try Again</Text>
          </StudentButton>
        </View>
      ) : (
        <>
          {/* CANDY GRADIENT HEADER */}
          <LinearGradient
            colors={[c.primary, c.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={isStudent ? undefined : () => navigation.navigate('Profile')}
              disabled={isStudent}
              activeOpacity={isStudent ? 1 : 0.8}
            >
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImg} resizeMode="cover" />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{profile?.full_name?.[0]?.toUpperCase() || '?'}</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerGreeting}>Welcome back,</Text>
              <Text style={styles.headerName} numberOfLines={1}>
                {profile?.full_name?.split(' ')[0] || 'Learner'}
              </Text>
            </View>

            <TouchableOpacity style={styles.bellBtn} onPress={() => setNotifVisible(true)}>
              <Icon name="bell" size="md" color="#fff" />
              {(notifications.length > 0 || unreadReplyCount > 0) && <View style={styles.redDot} />}
            </TouchableOpacity>
          </LinearGradient>

          {/* SCROLLABLE CONTENT */}
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* QUICK STATS */}
            <View style={styles.statsRow}>
              {[
                { icon: 'checkmark-circle', color: c.success,  value: stats.totalSessions,      label: 'Completed' },
                { icon: 'flame',            color: c.primary,  value: stats.streak,             label: 'Day Streak' },
                { icon: 'trophy',           color: c.primary,  value: `${stats.avgAccuracy}%`,  label: 'Accuracy'  },
              ].map(({ icon, color, value, label }) => (
                <StudentCard key={label} style={styles.statCard}>
                  <Icon name={icon} size="md" color={color} />
                  <Text style={[styles.statValue, { color: c.text }]}>{value}</Text>
                  <Text style={[styles.statLabel, { color: c.textMuted }]}>{label}</Text>
                </StudentCard>
              ))}
            </View>

            {/* EXPLORE SECTION */}
            <View style={styles.section}>
              <StudentSectionTitle title="Explore" subtitle="Learn phonics, reading, and writing" iconName="compass" />
              {[
                { title: 'Phonics',  iconSource: require('../../../assets/phonics.png'), illustrationSource: require('../../../assets/phonics learner.png'), desc: 'Tap to hear sounds and learn how to read words!',           route: 'Phonics',  tag: 'Listening'     },
                { title: 'Reading',  iconSource: require('../../../assets/read.png'), illustrationSource: require('../../../assets/read leanrers.png'), desc: 'Select a book, listen to the story, and follow along!',    route: 'Reading',  tag: 'Comprehension' },
                { title: 'Writing',  iconSource: require('../../../assets/write.png'), illustrationSource: require('../../../assets/practice writing.png'), desc: 'Practice writing letters and words to build your skills!', route: 'Writing',  tag: 'Practice'      },
              ].map(({ title, iconSource, illustrationSource, desc, route, tag }) => (
                <StudentActivityCard
                  key={title}
                  title={title}
                  description={desc}
                  tag={tag}
                  iconSource={iconSource}
                  illustrationSource={illustrationSource}
                  variant="featured"
                  onPress={() => navigation.navigate(route)}
                />
              ))}
            </View>

            {/* PLAY & LEARN SECTION */}
            <View style={styles.section}>
              <StudentSectionTitle title="Play & Learn" subtitle="Practice your skills with fun games" iconName="game-controller" />
              {[
                { title: 'Spelling',      iconSource: require('../../../assets/games.png'), illustrationSource: require('../../../assets/word games.png'), desc: 'Learn to spell words correctly with fun exercises!',       route: 'Spelling',              tag: 'Words'    },
                { title: 'Sound Games',   iconSource: require('../../../assets/gamers.png'), illustrationSource: require('../../../assets/sound games.png'),       desc: 'Play games that help you recognize sounds and patterns!',  route: 'PhonologicalAwareness', tag: 'Listening' },
                { title: 'Phonics Games', iconSource: require('../../../assets/phonics.png'), illustrationSource: require('../../../assets/phonics games.png'),      desc: 'Have fun while mastering phonics with interactive games!', route: 'PhonicsActivity',       tag: 'Games'    },
              ].map(({ title, iconSource, illustrationSource, desc, route, tag }) => (
                <StudentActivityCard
                  key={title}
                  title={title}
                  description={desc}
                  tag={tag}
                  iconSource={iconSource}
                  illustrationSource={illustrationSource}
                  variant="featured"
                  onPress={() => navigation.navigate(route)}
                />
              ))}
            </View>
          </ScrollView>

          {/* NOTIFICATIONS MODAL */}
          <Modal visible={notifVisible} transparent={true} animationType="slide" onRequestClose={() => setNotifVisible(false)}>
            <View style={styles.modalOverlay}>
              <StudentCard style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Notifications</Text>
                  <View style={styles.modalHeaderActions}>
                    {notifications.length > 0 && (
                      <TouchableOpacity onPress={clearAllNotifications} style={styles.clearAllBtn}>
                        <Text style={styles.clearAllText}>Clear All</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => setNotifVisible(false)} style={[styles.modalCloseBtn, { backgroundColor: c.primaryLight }]}>
                      <Icon name="x" size="sm" color={c.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                {unreadReplyCount > 0 && (
                  <TouchableOpacity
                    style={styles.unreadReplyItem}
                    onPress={() => { setNotifVisible(false); navigation.navigate('Support'); }}
                  >
                    <Icon name="message-square-dashed" size="sm" color={c.primary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.unreadReplyTitle}>New Feedback Replies!</Text>
                      <Text style={styles.unreadReplyBody}>
                        You have {unreadReplyCount} new {unreadReplyCount === 1 ? 'reply' : 'replies'}
                      </Text>
                    </View>
                    <Icon name="arrow-right" size="sm" color={c.primary} />
                  </TouchableOpacity>
                )}
                <FlatList
                  data={notifications}
                  keyExtractor={i => i.id.toString()}
                  contentContainerStyle={{ paddingBottom: 10 }}
                  ListEmptyComponent={
                    <View style={styles.emptyNotif}>
                      <Icon name="bell-off" size="lg" color="#ddd" />
                      <Text style={styles.emptyNotifText}>No new announcements</Text>
                    </View>
                  }
                  renderItem={({ item }) => (
                    <StudentCard variant="tinted" style={styles.notifItem}>
                      <View style={[styles.notifIcon, { backgroundColor: c.primaryLight }]}>
                        <Icon name="megaphone" size="md" color={c.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.notifTitle, { color: c.primary }]}>{item.title}</Text>
                        <Text style={[styles.notifBody, { color: c.textMuted }]} numberOfLines={2}>{item.content}</Text>
                        <Text style={styles.notifTime}>{new Date(item.created_at).toLocaleDateString()}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => dismissNotification(item.id)}
                        disabled={dismissingId === item.id}
                        style={styles.dismissBtn}
                      >
                        {dismissingId === item.id ? (
                          <ActivityIndicator size="small" color="#999" />
                        ) : (
                          <Icon name="x" size="sm" color="#999" />
                        )}
                      </TouchableOpacity>
                    </StudentCard>
                  )}
                />
              </StudentCard>
            </View>
          </Modal>
        </>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  // Loading
  loadingScreenContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingLogo: { width: SCREEN_WIDTH * 0.5, height: SCREEN_WIDTH * 0.5 },

  // Header
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden', flexShrink: 0 },
  avatarImg: { width: 48, height: 48, borderRadius: 24 },
  avatarPlaceholder: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarInitial: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerCenter: { flex: 1 },
  headerGreeting: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  headerName: { fontSize: 18, fontWeight: '800', color: '#fff' },
  bellBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
    flexShrink: 0,
  },
  redDot: {
    position: 'absolute', top: 8, right: 8,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#FF5252', borderWidth: 2, borderColor: '#fff',
  },

  // Scroll
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 110 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statCard: { flex: 1, alignItems: 'center', padding: 12, gap: 4 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600' },
  tipBadge: { alignSelf: 'flex-start', marginBottom: 18 },

  // Sections
  section: { marginBottom: 24 },

  // Error
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  errorTitle: { fontSize: 20, fontWeight: 'bold', color: '#FF6B6B', marginTop: 24, marginBottom: 12 },
  errorMessage: { color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  retryBtnWrap: { alignSelf: 'center' },
  retryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '75%', padding: 20,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalCloseBtn: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  unreadReplyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', borderRadius: 14, padding: 14, marginBottom: 16 },
  unreadReplyTitle: { fontWeight: 'bold', color: '#2E7D32', fontSize: 14, marginBottom: 2 },
  unreadReplyBody: { color: '#558B2F', fontSize: 12 },
  notifItem: { flexDirection: 'row', marginBottom: 10, padding: 12, alignItems: 'flex-start', gap: 10 },
  notifIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  notifTitle: { fontWeight: 'bold', marginBottom: 4, fontSize: 14 },
  notifBody: { fontSize: 13, lineHeight: 18 },
  notifTime: { fontSize: 11, color: '#aaa', marginTop: 4 },
  modalHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  clearAllBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f0f0f0', borderRadius: 16 },
  clearAllText: { fontSize: 12, color: '#666', fontWeight: '600' },
  dismissBtn: { padding: 8, marginLeft: 4 },
});
