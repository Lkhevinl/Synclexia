import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList, StatusBar, Alert, Image, ActivityIndicator, Animated } from 'react-native';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      await Promise.all([fetchNotifications(), fetchUnreadReplies()]);
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

  const MenuCard = ({ title, icon, color, route, badge, activityType, description }) => {
    const { a11yTextStyle: cardA11y } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        friction: 5,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
      }).start();
    };

    return (
      <Animated.View style={[styles.enhancedCardContainer, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => {
            navigation.navigate(route);
          }}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <LinearGradient
            colors={[color, color]}
            style={styles.enhancedCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.enhancedCardHeader}>
              <View style={styles.enhancedIconCircle}>
                <Text style={styles.enhancedIconText}>{icon}</Text>
              </View>
              {badge && (
                <View style={styles.enhancedBadge}>
                  <Text style={styles.enhancedBadgeText}>!</Text>
                </View>
              )}
            </View>
            <Text style={[styles.enhancedCardTitle, cardA11y]}>{title}</Text>
            {description && (
              <Text style={[styles.enhancedCardDescription, cardA11y]}>{description}</Text>
            )}
            {/* Removed shine effect for cleaner look */}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: getBgColor() }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primaryColor} />
          <Text style={[styles.loadingText, { fontSize: theme.fontSize }, a11yTextStyle]}>Loading your dashboard...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#FF6B6B" />
          <Text style={[styles.errorTitle, { fontSize: theme.fontSize + 6 }, a11yTextStyle]}>Connection Error</Text>
          <Text style={[styles.errorMessage, { fontSize: theme.fontSize }, a11yTextStyle]}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => initializeDashboard()}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={[styles.retryBtnText, { fontSize: theme.fontSize + 2 }, a11yTextStyle]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
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

      {/* PARENT LINK CODE BAR - ENHANCED */}
      {isStudent && (
        <View style={styles.enhancedLinkContainer}>
          <LinearGradient
            colors={['rgba(123, 31, 162, 0.1)', 'rgba(123, 31, 162, 0.05)']}
            style={styles.enhancedLinkCard}
          >
            <View style={styles.linkCardHeader}>
              <View style={styles.linkIconContainer}>
                <Ionicons name="people" size={20} color={getPrimaryColor()} />
              </View>
              <View style={styles.linkCardInfo}>
                <Text style={[styles.linkCardTitle, { color: themeColors.textPrimary, fontSize: theme.fontSize }, a11yTextStyle]}>
                  Parent Link Code
                </Text>
                <Text style={[styles.linkCardSubtitle, { color: themeColors.textSecondary, fontSize: theme.fontSize - 2 }, a11yTextStyle]}>
                  Share with your parents to connect
                </Text>
              </View>
            </View>
            <View style={styles.linkCodeContainer}>
              <Text style={[styles.linkCodeValue, { color: getPrimaryColor(), fontSize: theme.fontSize + 8 }, a11yTextStyle]}>
                {profile?.unique_code ?? '...'}
              </Text>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* SCROLLABLE CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* QUICK ACCESS BAR - Horizontal scroll for main activities */}
        <View style={styles.quickAccessSection}>
          <Text style={[styles.quickAccessTitle, { color: themeColors.textPrimary }, a11yTextStyle]}>
            🚀 Quick Start
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickAccessScroll}>
            {[
              { title: 'Phonics', icon: '🗣️', color: '#5C6BC0', route: 'Phonics' },
              { title: 'Reading', icon: '📖', color: '#EC407A', route: 'Reading' },
              { title: 'Writing', icon: '✍️', color: '#29B6F6', route: 'Writing' },
              { title: 'Spelling', icon: '🔤', color: '#66BB6A', route: 'Spelling' },
              { title: 'Games', icon: '🎮', color: '#FFA726', route: 'PhonicsActivity' },
            ].map((item, index) => (
              <TouchableOpacity
                key={item.route}
                style={[styles.quickAccessItem, { backgroundColor: item.color }]}
                onPress={() => navigation.navigate(item.route)}
                activeOpacity={0.8}
              >
                <Text style={styles.quickAccessIcon}>{item.icon}</Text>
                <Text style={styles.quickAccessLabel}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* DAILY TIP - COMPACT */}
        <TouchableOpacity
          style={[styles.compactTipBox, { backgroundColor: themeColors.cardBg || '#fff' }]}
          activeOpacity={0.9}
        >
          <View style={styles.tipBulb}>
            <Ionicons name="bulb" size={20} color="#FFD700" />
          </View>
          <Text style={[styles.compactTipText, { color: themeColors.textSecondary }, a11yTextStyle]} numberOfLines={2}>
            {dailyTip}
          </Text>
        </TouchableOpacity>

        {/* MAIN LEARNING ACTIVITIES */}
        <View style={styles.activitiesSection}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: '#667eea20' }]}>
              <Ionicons name="school" size={18} color="#667eea" />
            </View>
            <Text style={[styles.sectionTitle, { fontSize: theme.fontSize + 4, color: themeColors.textPrimary }, a11yTextStyle]}>
              Core Skills
            </Text>
          </View>

          <View style={styles.enhancedGrid}>
            <MenuCard
              title="Phonics"
              icon="🗣️"
              color="#5C6BC0"
              route="Phonics"
              description="Learn letter sounds"
              activityType="phonics"
            />
            <MenuCard
              title="Reading"
              icon="📖"
              color="#EC407A"
              route="Reading"
              description="Practice reading"
              activityType="reading"
            />
            <MenuCard
              title="Writing"
              icon="✍️"
              color="#29B6F6"
              route="Writing"
              description="Creative writing"
              activityType="writing"
            />
            <MenuCard
              title="Spelling"
              icon="🔤"
              color="#66BB6A"
              route="Spelling"
              description="Master spelling"
              activityType="spelling"
            />
          </View>
        </View>

        {/* INTERACTIVE GAMES - Horizontal Cards */}
        <View style={styles.activitiesSection}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: '#FF6B6B20' }]}>
              <Ionicons name="game-controller" size={18} color="#FF6B6B" />
            </View>
            <Text style={[styles.sectionTitle, { fontSize: theme.fontSize + 4, color: themeColors.textPrimary }, a11yTextStyle]}>
              Interactive Games
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
            <TouchableOpacity
              style={[styles.horizontalCard, { backgroundColor: '#E91E63' }]}
              onPress={() => navigation.navigate('PhonologicalAwareness')}
              activeOpacity={0.9}
            >
              <Text style={styles.hCardIcon}>🎧</Text>
              <View style={styles.hCardContent}>
                <Text style={styles.hCardTitle}>Sound Games</Text>
                <Text style={styles.hCardDesc}>Listen & learn sounds</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.horizontalCard, { backgroundColor: '#FF9800' }]}
              onPress={() => navigation.navigate('PhonicsActivity')}
              activeOpacity={0.9}
            >
              <Text style={styles.hCardIcon}>🎮</Text>
              <View style={styles.hCardContent}>
                <Text style={styles.hCardTitle}>Phonics Games</Text>
                <Text style={styles.hCardDesc}>Blend, rhyme & more</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* TOOLS & EXTRAS - Compact Grid */}
        <View style={styles.activitiesSection}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: '#00BCD420' }]}>
              <Ionicons name="apps" size={18} color="#00BCD4" />
            </View>
            <Text style={[styles.sectionTitle, { fontSize: theme.fontSize + 4, color: themeColors.textPrimary }, a11yTextStyle]}>
              Tools & More
            </Text>
          </View>

          <View style={styles.compactGrid}>
            <TouchableOpacity
              style={[styles.compactCard, { borderLeftColor: '#00BCD4' }]}
              onPress={() => navigation.navigate('TextToSpeech')}
              activeOpacity={0.8}
            >
              <Text style={styles.compactIcon}>🔊</Text>
              <Text style={[styles.compactTitle, { color: themeColors.textPrimary }]}>Text to Speech</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.compactCard, { borderLeftColor: '#26C6DA' }]}
              onPress={() => navigation.navigate('SpeechToText')}
              activeOpacity={0.8}
            >
              <Text style={styles.compactIcon}>🎤</Text>
              <Text style={[styles.compactTitle, { color: themeColors.textPrimary }]}>Speech to Text</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.compactCard, { borderLeftColor: '#7C4DFF' }]}
              onPress={() => navigation.navigate('Scan')}
              activeOpacity={0.8}
            >
              <Text style={styles.compactIcon}>📸</Text>
              <Text style={[styles.compactTitle, { color: themeColors.textPrimary }]}>Scan & Learn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.compactCard, { borderLeftColor: '#FFB300' }]}
              onPress={() => navigation.navigate('Leaderboard')}
              activeOpacity={0.8}
            >
              <Text style={styles.compactIcon}>🏆</Text>
              <Text style={[styles.compactTitle, { color: themeColors.textPrimary }]}>Leaderboard</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 30 }} /> 
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
      </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainContainer: { flex: 1 },

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
  
  statsContainer: { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 16, marginHorizontal: 20, marginTop: -30, marginBottom: 20, elevation: 4 },

  linkCodeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  linkCodeBarText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  linkCodeBarLabel: {
    fontWeight: '600'
  },
  linkCodeBarValue: {
    fontWeight: '900'
  },

  scrollContent: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 20 },

  sectionTitle: { fontWeight: 'bold', color: '#37474F', marginBottom: 15, marginLeft: 5 },

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

  // Loading and Error states
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  loadingText: { color: '#666', marginTop: 16, textAlign: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  errorTitle: { fontSize: 20, fontWeight: 'bold', color: '#FF6B6B', marginTop: 24, marginBottom: 12 },
  errorMessage: { color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#7B1FA2', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 16, elevation: 3 },
  retryBtnText: { color: '#fff', fontWeight: 'bold' },

  // Enhanced Layout Styles
  enhancedLinkContainer: { paddingHorizontal: 20, marginTop: -20, marginBottom: 20 },
  enhancedLinkCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#9C27B0',
    backgroundColor: '#F3E5F5',
  },
  linkCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  linkIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(123, 31, 162, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  linkCardInfo: { flex: 1 },
  linkCardTitle: { fontWeight: 'bold', marginBottom: 2 },
  linkCardSubtitle: { opacity: 0.7 },
  linkCodeContainer: {
    backgroundColor: 'rgba(123, 31, 162, 0.05)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(123, 31, 162, 0.1)'
  },
  linkCodeValue: { fontWeight: 'bold', letterSpacing: 3 },

  welcomeSection: { marginBottom: 24, paddingHorizontal: 4 },
  welcomeTitle: { fontWeight: 'bold', marginBottom: 6 },
  welcomeSubtitle: {},

  enhancedTipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6
  },
  tipIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  tipContent: { flex: 1 },
  tipLabel: { fontSize: 12, fontWeight: 'bold', color: 'rgba(255,255,255,0.9)', marginBottom: 4 },
  tipText: { color: '#fff', lineHeight: 20, fontWeight: '500' },

  activitiesSection: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4, gap: 8 },
  sectionTitle: { fontWeight: 'bold' },

  enhancedGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
  enhancedCardContainer: {
    width: '47%',
    marginBottom: 16,
    borderRadius: 20,
  },
  enhancedCardGradient: {
    padding: 20,
    borderRadius: 20,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  enhancedCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  enhancedIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  enhancedIconText: { fontSize: 28 },
  enhancedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF5252',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  enhancedBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  enhancedCardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
  enhancedCardDescription: { color: 'rgba(255,255,255,0.9)', fontSize: 12, lineHeight: 16 },
  cardShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  // Quick Access Bar Styles
  quickAccessSection: {
    marginBottom: 20,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  quickAccessScroll: {
    paddingHorizontal: 4,
    gap: 12,
  },
  quickAccessItem: {
    width: 72,
    height: 80,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAccessIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  quickAccessLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },

  // Compact Tip Box Styles
  compactTipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#FFD700',
    backgroundColor: '#FFFDE7',
  },
  tipBulb: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  compactTipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#5D4037',
  },

  // Section Icon Background
  sectionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Horizontal Cards Styles (Interactive Games)
  horizontalCards: {
    paddingHorizontal: 4,
    gap: 14,
  },
  horizontalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 200,
    borderRadius: 18,
    padding: 16,
  },
  hCardIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  hCardContent: {
    flex: 1,
  },
  hCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  hCardDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
  },

  // Compact Grid Styles (Tools & More)
  compactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  compactCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
  },
  compactIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  compactTitle: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
});
