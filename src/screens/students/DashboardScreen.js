import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList, StatusBar, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient'; 
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext'; 
import { supabase } from '../../lib/supabase';
import Sidebar from '../../components/Sidebar';

const DAILY_TIPS = [
  "Tip: Reading out loud helps you remember better!",
  "Fact: 'A' is the most common letter used in English.",
  "Goal: Try to earn 50 XP today!",
  "Tip: Take a break if your eyes get tired.",
  "Fun: Can you complete all quests this week?"
];

export default function DashboardScreen({ navigation }) {
  const { theme, a11yTextStyle, getBgColor, getHeaderGradient, getPrimaryColor, getThemeColors } = useTheme();
  const { profile, fetchProfile } = useAuth();
  const themeColors = getThemeColors();

  const generateUniqueCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };
  
  const [notifVisible, setNotifVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dailyTip, setDailyTip] = useState(DAILY_TIPS[0]);
  const [unreadReplyCount, setUnreadReplyCount] = useState(0);

  const isStudent = profile?.role === 'student';

  // Auto-generate unique_code for students who were created before the sign-up fix
  useEffect(() => {
    if (!isStudent || !profile?.id || profile?.unique_code) return;
    const assignCode = async () => {
      const code = generateUniqueCode();
      await supabase.from('profiles').update({ unique_code: code }).eq('id', profile.id);
      await fetchProfile(profile.id);
    };
    assignCode();
  }, [profile?.id]);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadReplies();
    const randomTip = DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
    setDailyTip(randomTip);
  }, []);

  const fetchNotifications = async () => {
    // Learner app: show global announcements only (no teacher/class targeting).
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_draft', false)
      .in('target_role', ['all', 'student'])
      .order('created_at', { ascending: false });
    if (data) setNotifications(data);
  };

  const fetchUnreadReplies = async () => {
    if (!profile?.id) return;
    const { count } = await supabase
      .from('feedback')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile?.id)
      .eq('has_unread_reply', true);
    setUnreadReplyCount(count || 0);
  };

  const MenuCard = ({ title, icon, color, route, badge, activityType }) => {
    const { a11yTextStyle: cardA11y } = useTheme();
    return (
      <TouchableOpacity 
        style={[styles.cardContainer]} 
        onPress={() => {
          navigation.navigate(route);
        }}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[color, color + '99']} 
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 32 }}>{icon}</Text>
          </View>
          <Text style={[styles.cardTitle, cardA11y]}>{title}</Text>
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>!</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: getBgColor() }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* HEADER */}
      <LinearGradient
        colors={getHeaderGradient()}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.headerLogoWrapper}
              onPress={isStudent ? undefined : () => navigation.navigate('Profile')}
              disabled={isStudent}
              activeOpacity={isStudent ? 1 : 0.8}
            >
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.headerLogoImg}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.headerLogoInitial}>
                  {profile?.full_name?.[0]?.toUpperCase() || '?'}
                </Text>
              )}
            </TouchableOpacity>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.headerAppName}>Synclexia</Text>
              <Text style={styles.greeting}>Hello, {profile?.full_name?.split(' ')[0] || "Learner"}! 👋</Text>
              <Text style={styles.subGreeting}>Let's learn something new.</Text>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => setNotifVisible(true)} style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {(notifications.length > 0 || unreadReplyCount > 0) && <View style={styles.redDot} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.iconBtn}>
              <Ionicons name="menu-outline" size={26} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* PARENT LINK CODE BAR */}
      {isStudent && (
        <View style={styles.statsContainer}>
          <View style={[styles.linkCodeBar, { backgroundColor: themeColors.cardBg }]}>
            <View style={styles.linkCodeBarContent}>
              <Ionicons name="people" size={20} color={getPrimaryColor()} />
              <View style={styles.linkCodeBarText}>
                <Text style={[styles.linkCodeBarLabel, { color: themeColors.textSecondary }]}>Parent Link Code</Text>
                <Text style={[styles.linkCodeBarValue, { color: getPrimaryColor() }]}>{profile?.unique_code ?? '...'}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* SCROLLABLE CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* DAILY TIP */}
        <View style={[styles.tipBox, { backgroundColor: themeColors.textPrimary }]}>
          <Ionicons name="sparkles" size={20} color="#FFD700" style={{ marginRight: 10 }} />
          <Text style={[styles.tipText, { fontSize: theme.fontSize, color: '#fff' }, a11yTextStyle]}>{dailyTip}</Text>
        </View>

        {/* RECENT ACHIEVEMENTS */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { fontSize: theme.fontSize + 4, color: themeColors.textPrimary }, a11yTextStyle]}>Recent Achievements</Text>

          <View style={[styles.achievementCard, { backgroundColor: themeColors.cardBg }]}>
            <View style={styles.achievementItem}>
              <View style={[styles.achievementBadge, { backgroundColor: '#FFD700' }]}>
                <Ionicons name="trophy" size={16} color="#fff" />
              </View>
              <View style={styles.achievementContent}>
                <Text style={[styles.achievementText, { color: themeColors.textPrimary }]}>Reading Champion!</Text>
                <Text style={[styles.achievementTime, { color: themeColors.textSecondary }]}>Completed 10 reading exercises</Text>
              </View>
            </View>

            <View style={styles.achievementItem}>
              <View style={[styles.achievementBadge, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="checkmark-circle" size={16} color="#fff" />
              </View>
              <View style={styles.achievementContent}>
                <Text style={[styles.achievementText, { color: themeColors.textPrimary }]}>Perfect Spelling!</Text>
                <Text style={[styles.achievementTime, { color: themeColors.textSecondary }]}>Got 100% on spelling test</Text>
              </View>
            </View>

            <View style={styles.achievementItem}>
              <View style={[styles.achievementBadge, { backgroundColor: getPrimaryColor() }]}>
                <Ionicons name="flash" size={16} color="#fff" />
              </View>
              <View style={styles.achievementContent}>
                <Text style={[styles.achievementText, { color: themeColors.textPrimary }]}>Speed Reader!</Text>
                <Text style={[styles.achievementTime, { color: themeColors.textSecondary }]}>Fastest reading time this week</Text>
              </View>
            </View>
          </View>
        </View>

        {/* LEARNING PROGRESS SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { fontSize: theme.fontSize + 4, color: themeColors.textPrimary }, a11yTextStyle]}>Activities Completed</Text>

          <View style={styles.progressRow}>
            <View style={[styles.progressCard, { backgroundColor: themeColors.cardBg }]}>
              <View style={[styles.progressIcon, { backgroundColor: themeColors.accentLight }]}>
                <Ionicons name="book" size={18} color={getPrimaryColor()} />
              </View>
              <Text style={[styles.progressValue, { color: themeColors.textPrimary }]}>12</Text>
              <Text style={[styles.progressLabel, { color: themeColors.textSecondary }]}>Lessons</Text>
            </View>

            <View style={[styles.progressCard, { backgroundColor: themeColors.cardBg }]}>
              <View style={[styles.progressIcon, { backgroundColor: themeColors.accentLight }]}>
                <Ionicons name="checkmark-circle" size={18} color={getPrimaryColor()} />
              </View>
              <Text style={[styles.progressValue, { color: themeColors.textPrimary }]}>95%</Text>
              <Text style={[styles.progressLabel, { color: themeColors.textSecondary }]}>Accuracy</Text>
            </View>

            <View style={[styles.progressCard, { backgroundColor: themeColors.cardBg }]}>
              <View style={[styles.progressIcon, { backgroundColor: themeColors.accentLight }]}>
                <Ionicons name="flame" size={18} color={getPrimaryColor()} />
              </View>
              <Text style={[styles.progressValue, { color: themeColors.textPrimary }]}>5</Text>
              <Text style={[styles.progressLabel, { color: themeColors.textSecondary }]}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* LEARNING LESSONS SECTION */}
        <Text style={[styles.sectionTitle, { fontSize: theme.fontSize + 4, color: themeColors.textPrimary }, a11yTextStyle]}>Learning Lessons</Text>
        
        {/* MENU GRID - Learning Lessons */}
        <View style={styles.grid}>
          <MenuCard title="Phonics"     icon="🗣️" color={getPrimaryColor()} route="Phonics"               activityType="phonics" />
          <MenuCard title="Reading"     icon="📖" color={getHeaderGradient()[0]} route="Reading"               activityType="reading" />
          <MenuCard title="Writing"     icon="✍️" color={themeColors.textSecondary} route="Writing"               activityType="writing" />
        </View>

        {/* PLAY & LEARN SECTION */}
        <Text style={[styles.sectionTitle, { fontSize: theme.fontSize + 4, color: themeColors.textPrimary }, a11yTextStyle]}>Play & Learn</Text>
        <View style={styles.grid}>
          <MenuCard title="Spelling"        icon="🔤" color={themeColors.accentLight} route="Spelling"              activityType="spelling" />
          <MenuCard title="Sound Games"     icon="🎧" color={themeColors.textPrimary} route="PhonologicalAwareness" activityType="phonological_awareness" />
          <MenuCard title="Phonics Games"   icon="🎮" color={getPrimaryColor()} route="PhonicsActivity"       activityType="phonics_activity" />
        </View>

        <View style={{ height: 20 }} /> 
      </ScrollView>

      {/* NOTIFICATIONS MODAL */}
      <Modal visible={notifVisible} transparent={true} animationType="slide" onRequestClose={() => setNotifVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications 🔔</Text>
              <TouchableOpacity onPress={() => setNotifVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            {unreadReplyCount > 0 && (
              <TouchableOpacity
                style={styles.unreadReplyItem}
                onPress={() => { setNotifVisible(false); navigation.navigate('Support'); }}
              >
                <Ionicons name="chatbubble-ellipses" size={20} color="#4CAF50" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.unreadReplyTitle}>New Feedback Replies!</Text>
                  <Text style={styles.unreadReplyBody}>You have {unreadReplyCount} new feedback {unreadReplyCount === 1 ? 'reply' : 'replies'}</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color="#4CAF50" />
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
                <View style={styles.notifItem}>
                  <View style={styles.notifIcon}>
                    <Ionicons name="megaphone" size={20} color="#1976D2" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <Text style={styles.notifBody} numberOfLines={2}>{item.content}</Text>
                    <Text style={styles.notifTime}>{new Date(item.created_at).toLocaleDateString()}</Text>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainContainer: { flex: 1 }, 

  linkCodeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  linkCodeContent: {
    gap: 12
  },
  linkCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  linkCodeTextContainer: {
    flex: 1
  },
  linkCodeLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    lineHeight: 20
  },
  linkCodeHint: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16
  },
  linkCodeValueContainer: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    minWidth: 120
  },
  linkCodeValue: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center'
  },

  headerGradient: { paddingTop: 55, paddingBottom: 50, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerLogoWrapper: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.30)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
  headerLogoImg: { width: 48, height: 48, borderRadius: 24 },
  headerLogoInitial: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerAppName: { fontSize: 10, fontWeight: '800', color: 'rgba(100,30,60,0.6)', letterSpacing: 2, textTransform: 'uppercase' },
  greeting: { fontSize: 18, fontWeight: 'bold', color: '#7B2D52', marginTop: 1 },
  subGreeting: { color: '#9E5070', fontSize: 12, marginTop: 1 },
  headerIcons: { flexDirection: 'row', gap: 15 },
  iconBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: 12 },
  redDot: { position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF5252' },
  
  statsContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, paddingVertical: 15, paddingHorizontal: 20, marginHorizontal: 20, marginTop: -35, marginBottom: 25, elevation: 5, justifyContent: 'center', alignItems: 'center' },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 10, fontWeight: 'bold', color: '#90A4AE', letterSpacing: 1 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  divider: { width: 1, height: 25, backgroundColor: '#ECEFF1' },

  linkCodeBar: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  linkCodeBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  linkCodeBarText: {
    flex: 1
  },
  linkCodeBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2
  },
  linkCodeBarValue: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2
  },

  scrollContent: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 20 },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  tipText: { flex: 1, lineHeight: 20, fontWeight: '500' },
  sectionTitle: { fontWeight: 'bold', color: '#37474F', marginBottom: 15, marginLeft: 5 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  cardContainer: { width: '48%', marginBottom: 16, borderRadius: 18, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  cardGradient: { padding: 18, borderRadius: 18, height: 120, justifyContent: 'center', alignItems: 'center' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  badge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#FF5252', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: '75%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  unreadReplyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', borderRadius: 14, padding: 14, marginBottom: 16 },
  unreadReplyTitle: { fontWeight: 'bold', color: '#2E7D32', fontSize: 14, marginBottom: 2 },
  unreadReplyBody: { color: '#558B2F', fontSize: 12 },
  notifItem: { flexDirection: 'row', marginBottom: 12, backgroundColor: '#F5F5F5', borderRadius: 12, padding: 12, alignItems: 'flex-start', gap: 10 },
  notifIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  notifTitle: { fontWeight: 'bold', color: '#1976D2', marginBottom: 4, fontSize: 14 },
  notifBody: { color: '#555', fontSize: 13, lineHeight: 18 },
  notifTime: { fontSize: 11, color: '#999', marginTop: 4 },
  emptyNotif: { alignItems: 'center', paddingVertical: 40 },
  emptyNotifText: { marginTop: 12, color: '#999', fontSize: 15 },
  closeBtn: { backgroundColor: '#333', paddingVertical: 12, borderRadius: 15, alignItems: 'center', marginTop: 12 },
  closeText: { color: '#fff', fontWeight: 'bold' },

  // New enhancement styles
  sectionContainer: { marginBottom: 24 },

  progressRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  progressCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    minHeight: 90
  },
  progressIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  progressValue: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  progressLabel: { fontSize: 11, textAlign: 'center', lineHeight: 14, fontWeight: '500' },

  achievementCard: {
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  achievementItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 14 },
  achievementBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  achievementContent: { flex: 1 },
  achievementText: { fontSize: 14, fontWeight: '600', lineHeight: 18 },
  achievementTime: { fontSize: 12, marginTop: 2, lineHeight: 16 }
});
