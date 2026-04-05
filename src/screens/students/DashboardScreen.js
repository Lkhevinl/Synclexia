import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList, StatusBar, Image, Dimensions, DeviceEventEmitter } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
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
import c from '../../components/student/candyTokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DAILY_TIPS = [
  "Tip: Reading out loud helps you remember better!",
  "Fact: 'A' is the most common letter used in English.",
  "Tip: Take a break if your eyes get tired.",
];

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

  const generateUniqueCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };
  
  const [notifVisible, setNotifVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dailyTip, setDailyTip] = useState(DAILY_TIPS[0]);
  const [unreadReplyCount, setUnreadReplyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalSessions: 0, avgAccuracy: 0, streak: 0 });

  const isStudent = profile?.role === 'student';

  // Auto-generate unique_code for students who were created before the sign-up fix
  useEffect(() => {
    if (!isStudent || !profile?.id || profile?.unique_code) return;
    const assignCode = async () => {
      try {
        const code = generateUniqueCode();
        await supabase.from('profiles').update({ unique_code: code }).eq('id', profile.id);
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
      await Promise.all([fetchNotifications(), fetchUnreadReplies(), fetchStudentStats()]);
      const randomTip = DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
      setDailyTip(randomTip);
    } catch (error) {
      setError('Failed to load dashboard. Please check your connection and try again.');
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

  const fetchNotifications = async () => {
    try {
      // Learner app: show global announcements only (no teacher/class targeting).
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_draft', false)
        .in('target_role', ['all', 'student'])
        .order('created_at', { ascending: false });

      if (error) {
        setNotifications([]);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      setNotifications([]);
    }
  };

  const fetchUnreadReplies = async () => {
    if (!profile?.id) return;
    try {
      const { count, error } = await supabase
        .from('feedback')
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
        .from('session_logs')
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

        for (let i = 0; i < sortedDates.length; i++) {
          const daysDiff = Math.floor((today - sortedDates[i]) / (1000 * 60 * 60 * 24));
          if (daysDiff === streak) {
            streak++;
          } else {
            break;
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


  return (
    <ScreenWrapper role="student" padded={false}>
      <StatusBar barStyle="light-content" backgroundColor={c.primary} translucent={false} />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {loading ? (
        <LoadingScreen surfaceColor={colors.surface} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#FF6B6B" />
          <Text style={[styles.errorTitle, { fontSize: theme.fontSize + 6 }, a11yTextStyle]}>Connection Error</Text>
          <Text style={[styles.errorMessage, { fontSize: theme.fontSize }, a11yTextStyle]}>{error}</Text>
          <StudentButton variant="primary" onPress={() => initializeDashboard()} style={styles.retryBtnWrap}>
            <Ionicons name="refresh" size={22} color="#fff" />
            <Text style={styles.retryBtnText}>Try Again</Text>
          </StudentButton>
        </View>
      ) : (
        <>
          {/* CANDY GRADIENT HEADER */}
          <LinearGradient
            colors={[c.primary, c.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
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
                {profile?.full_name?.split(' ')[0] || 'Learner'} 👋
              </Text>
            </View>

            <TouchableOpacity style={styles.bellBtn} onPress={() => setNotifVisible(true)}>
              <Ionicons name="notifications-outline" size={22} color="#fff" />
              {(notifications.length > 0 || unreadReplyCount > 0) && <View style={styles.redDot} />}
            </TouchableOpacity>
          </LinearGradient>

          {/* SCROLLABLE CONTENT */}
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* QUICK STATS */}
            <View style={styles.statsRow}>
              {[
                { icon: 'checkmark-circle', color: c.success,      value: stats.totalSessions, label: 'Completed' },
                { icon: 'flame',            color: '#FF9800',       value: stats.streak,        label: 'Day Streak' },
                { icon: 'trophy',           color: c.achievement,  value: `${stats.avgAccuracy}%`, label: 'Accuracy' },
              ].map(({ icon, color, value, label }) => (
                <StudentCard key={label} style={styles.statCard}>
                  <Ionicons name={icon} size={22} color={color} />
                  <Text style={styles.statValue}>{value}</Text>
                  <Text style={styles.statLabel}>{label}</Text>
                </StudentCard>
              ))}
            </View>

            {/* DAILY TIP */}
            <StudentBadge variant="level" style={styles.tipBadge}>{dailyTip}</StudentBadge>

            {/* QUICK START GUIDE */}
            <StudentCard variant="tinted" style={styles.guideCard}>
              <View style={styles.guideHeader}>
                <View style={styles.guideIconCircle}>
                  <Ionicons name="rocket" size={20} color={c.primary} />
                </View>
                <Text style={styles.guideTitle}>How to Use Synclexia</Text>
              </View>
              {[
                { icon: 'finger-print', color: c.primary,  step: '1', text: 'Tap any card below to start an activity' },
                { icon: 'volume-high',  color: '#FF9800',  step: '2', text: 'Follow the instructions on each screen' },
                { icon: 'trophy',       color: c.success,  step: '3', text: 'Finish activities and track your progress!' },
              ].map(({ icon, color, step, text }) => (
                <View key={step} style={styles.guideStep}>
                  <StudentBadge variant="tag" style={{ marginRight: 8 }}>{step}</StudentBadge>
                  <Ionicons name={icon} size={20} color={color} style={{ marginRight: 6 }} />
                  <Text style={styles.guideStepText}>{text}</Text>
                </View>
              ))}
            </StudentCard>

            {/* EXPLORE SECTION */}
            <View style={styles.section}>
              <StudentSectionTitle title="Explore" subtitle="Learn phonics, reading, and writing" iconName="compass" />
              {[
                { title: 'Phonics',  iconName: 'volume-high',  desc: 'Tap to hear sounds and learn how to read words!',           route: 'Phonics',  tag: 'Listening'     },
                { title: 'Reading',  iconName: 'book-outline', desc: 'Select a book, listen to the story, and follow along!',    route: 'Reading',  tag: 'Comprehension' },
                { title: 'Writing',  iconName: 'pencil',       desc: 'Practice writing letters and words to build your skills!', route: 'Writing',  tag: 'Practice'      },
              ].map(({ title, iconName, desc, route, tag }) => (
                <StudentActivityCard
                  key={title}
                  title={title}
                  description={desc}
                  tag={tag}
                  iconName={iconName}
                  onPress={() => navigation.navigate(route)}
                />
              ))}
            </View>

            {/* PLAY & LEARN SECTION */}
            <View style={styles.section}>
              <StudentSectionTitle title="Play & Learn" subtitle="Practice your skills with fun games" iconName="game-controller" />
              {[
                { title: 'Spelling',      iconName: 'text',            desc: 'Learn to spell words correctly with fun exercises!',       route: 'Spelling',              tag: 'Words'    },
                { title: 'Sound Games',   iconName: 'headset',         desc: 'Play games that help you recognize sounds and patterns!',  route: 'PhonologicalAwareness', tag: 'Listening' },
                { title: 'Phonics Games', iconName: 'game-controller', desc: 'Have fun while mastering phonics with interactive games!', route: 'PhonicsActivity',       tag: 'Games'    },
              ].map(({ title, iconName, desc, route, tag }) => (
                <StudentActivityCard
                  key={title}
                  title={title}
                  description={desc}
                  tag={tag}
                  iconName={iconName}
                  onPress={() => navigation.navigate(route)}
                  accentColor="#FF9800"
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
                  <TouchableOpacity onPress={() => setNotifVisible(false)} style={styles.modalCloseBtn}>
                    <Ionicons name="close" size={20} color={c.primary} />
                  </TouchableOpacity>
                </View>
                {unreadReplyCount > 0 && (
                  <TouchableOpacity
                    style={styles.unreadReplyItem}
                    onPress={() => { setNotifVisible(false); navigation.navigate('Support'); }}
                  >
                    <Ionicons name="chatbubble-ellipses" size={20} color={c.success} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.unreadReplyTitle}>New Feedback Replies!</Text>
                      <Text style={styles.unreadReplyBody}>
                        You have {unreadReplyCount} new {unreadReplyCount === 1 ? 'reply' : 'replies'}
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color={c.success} />
                  </TouchableOpacity>
                )}
                <FlatList
                  data={notifications}
                  keyExtractor={i => i.id.toString()}
                  contentContainerStyle={{ paddingBottom: 10 }}
                  ListEmptyComponent={
                    <View style={styles.emptyNotif}>
                      <Ionicons name="notifications-off-outline" size={48} color="#ddd" />
                      <Text style={styles.emptyNotifText}>No new announcements</Text>
                    </View>
                  }
                  renderItem={({ item }) => (
                    <StudentCard variant="tinted" style={styles.notifItem}>
                      <View style={styles.notifIcon}>
                        <Ionicons name="megaphone" size={22} color={c.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.notifTitle}>{item.title}</Text>
                        <Text style={styles.notifBody} numberOfLines={2}>{item.content}</Text>
                        <Text style={styles.notifTime}>{new Date(item.created_at).toLocaleDateString()}</Text>
                      </View>
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
  statValue: { fontSize: 20, fontWeight: '800', color: c.text },
  statLabel: { fontSize: 10, color: c.textMuted, fontWeight: '600' },
  tipBadge: { alignSelf: 'flex-start', marginBottom: 18 },

  // Guide
  guideCard: { marginBottom: 28 },
  guideHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  guideIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  guideTitle: { fontSize: 16, fontWeight: '800', color: c.text },
  guideStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  guideStepText: { flex: 1, fontSize: 13, color: c.textMuted, lineHeight: 18 },

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
  modalTitle: { fontSize: 20, fontWeight: '800', color: c.text },
  modalCloseBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: c.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  unreadReplyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', borderRadius: 14, padding: 14, marginBottom: 16 },
  unreadReplyTitle: { fontWeight: 'bold', color: '#2E7D32', fontSize: 14, marginBottom: 2 },
  unreadReplyBody: { color: '#558B2F', fontSize: 12 },
  notifItem: { flexDirection: 'row', marginBottom: 10, padding: 12, alignItems: 'flex-start', gap: 10 },
  notifIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  notifTitle: { fontWeight: 'bold', color: c.primary, marginBottom: 4, fontSize: 14 },
  notifBody: { color: c.textMuted, fontSize: 13, lineHeight: 18 },
  notifTime: { fontSize: 11, color: '#aaa', marginTop: 4 },
  emptyNotif: { alignItems: 'center', paddingVertical: 40 },
  emptyNotifText: { marginTop: 12, color: '#999', fontSize: 15 },
});
