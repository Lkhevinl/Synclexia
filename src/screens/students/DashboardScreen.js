import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList, StatusBar, Alert, Image, ActivityIndicator, Animated, Dimensions, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { getStudentProgress } from '../../lib/analyticsHelper';
import Sidebar from '../../components/Sidebar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2;

const DAILY_TIPS = [
  "Tip: Reading out loud helps you remember better!",
  "Fact: 'A' is the most common letter used in English.",
  "Goal: Try to earn 50 XP today!",
  "Tip: Take a break if your eyes get tired.",
  "Fun: Can you complete all quests this week?"
];

// Loading Screen Component
const LoadingScreen = ({ progress }) => {
  return (
    <View style={styles.loadingScreenContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF5F1" />
      <Image
        source={require('../../../assets/synclexia-logo2-removebg-preview.png')}
        style={styles.loadingLogo}
        resizeMode="contain"
      />
    </View>
  );
};

export default function DashboardScreen({ navigation }) {
  const { theme, a11yTextStyle, getBgColor, getHeaderGradient, getPrimaryColor, getThemeColors } = useTheme();
  const { profile, fetchProfile } = useAuth();
  const themeColors = getThemeColors();
  const bgColor = getBgColor();

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

  // Dashboard Card Component - Matching the reference UI
  const DashboardCard = ({ title, icon, color, route, gradientColors }) => {
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
      <Animated.View style={[styles.dashboardCardContainer, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={styles.dashboardCardTouchable}
          onPress={() => navigation.navigate(route)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <LinearGradient
            colors={gradientColors || [color, color]}
            style={styles.dashboardCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.dashboardCardIconContainer}>
              <Text style={styles.dashboardCardIcon}>{icon}</Text>
            </View>
            <Text style={styles.dashboardCardTitle}>{title}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: bgColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} translucent={false} />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {loading ? (
        <LoadingScreen />
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
          {/* MODERN HEADER */}
          <View style={[styles.modernHeader, { backgroundColor: bgColor }]}>
            <View style={styles.modernHeaderContent}>
              <View style={styles.modernHeaderLeft}>
                <View style={styles.profileSection}>
                  <TouchableOpacity
                    style={styles.modernAvatarWrapper}
                    onPress={isStudent ? undefined : () => navigation.navigate('Profile')}
                    disabled={isStudent}
                    activeOpacity={isStudent ? 1 : 0.8}
                  >
                    {profile?.avatar_url ? (
                      <Image
                        source={{ uri: profile.avatar_url }}
                        style={styles.modernAvatarImg}
                        resizeMode="cover"
                      />
                    ) : (
                      <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.modernAvatarPlaceholder}
                      >
                        <Text style={styles.modernAvatarInitial}>
                          {profile?.full_name?.[0]?.toUpperCase() || '?'}
                        </Text>
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                  <Text style={styles.profileName}>
                    Hello {profile?.full_name?.split(' ')[0]?.toLowerCase() || "learner"}
                  </Text>
                </View>
                {theme.letterSpacing === 'normal' && (
                  <View style={styles.tipBadgeContainer}>
                    <View style={[
                      styles.tipBadge,
                      dailyTip.startsWith('Goal') && styles.tipBadgeGoal,
                      dailyTip.startsWith('Tip') && styles.tipBadgeTip,
                      dailyTip.startsWith('Fun') && styles.tipBadgeFun,
                      dailyTip.startsWith('Fact') && styles.tipBadgeFact,
                    ]}>
                      <Text style={styles.tipBadgeText}>{dailyTip}</Text>
                    </View>
                  </View>
                )}
              </View>
              <View style={styles.modernHeaderIcons}>
                <TouchableOpacity
                  style={styles.modernIconBtn}
                  onPress={() => setNotifVisible(true)}
                >
                  <Ionicons name="notifications-outline" size={24} color="#333" />
                  {(notifications.length > 0 || unreadReplyCount > 0) && <View style={styles.modernRedDot} />}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modernIconBtn}
                  onPress={() => setSidebarVisible(true)}
                >
                  <Ionicons name="menu-outline" size={26} color="#333" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* SCROLLABLE CONTENT */}
          <ScrollView
            contentContainerStyle={styles.modernScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* QUICK STATS BAR */}
            <View style={styles.quickStatsBar}>
              <View style={styles.quickStatItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.quickStatValue}>{stats.totalSessions}</Text>
                <Text style={styles.quickStatLabel}>Completed</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Ionicons name="flame" size={20} color="#FF9800" />
                <Text style={styles.quickStatValue}>{stats.streak}</Text>
                <Text style={styles.quickStatLabel}>Day Streak</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Ionicons name="trophy" size={20} color="#9C27B0" />
                <Text style={styles.quickStatValue}>{stats.avgAccuracy}%</Text>
                <Text style={styles.quickStatLabel}>Accuracy</Text>
              </View>
            </View>

            {/* TIP BADGE - Shows here when letter spacing is wide/wider */}
            {(theme.letterSpacing === 'wide' || theme.letterSpacing === 'wider') && (
              <View style={styles.movableTipContainer}>
                <View style={[
                  styles.movableTipBadge,
                  dailyTip.startsWith('Goal') && styles.tipBadgeGoal,
                  dailyTip.startsWith('Tip') && styles.tipBadgeTip,
                  dailyTip.startsWith('Fun') && styles.tipBadgeFun,
                  dailyTip.startsWith('Fact') && styles.tipBadgeFact,
                ]}>
                  <Text style={styles.tipBadgeText}>{dailyTip}</Text>
                </View>
              </View>
            )}

            {/* AI INSIGHTS BANNER */}
            <TouchableOpacity
              style={styles.aiBanner}
              onPress={() => navigation.navigate('AIInsights')}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.aiBannerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.aiBannerLeft}>
                  <View style={styles.aiIconBg}>
                    <Text style={{ fontSize: 22 }}>🧠</Text>
                  </View>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.aiBannerTitle}>AI Learning Insights</Text>
                    <Text style={styles.aiBannerSub}>See your strengths & customize learning</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>

            {/* EXPLORE SECTION */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Explore</Text>
                <View style={styles.sectionIconBadge}>
                  <Ionicons name="compass" size={16} color="#667eea" />
                </View>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContainer}
              >
                <View style={styles.horizontalCard}>
                  <DashboardCard
                    title="Phonics"
                    icon="🗣️"
                    color="#7C4DFF"
                    gradientColors={['#7C4DFF', '#651FFF']}
                    route="Phonics"
                  />
                </View>
                <View style={styles.horizontalCard}>
                  <DashboardCard
                    title="Reading"
                    icon="📖"
                    color="#E91E63"
                    gradientColors={['#E91E63', '#C2185B']}
                    route="Reading"
                  />
                </View>
                <View style={styles.horizontalCard}>
                  <DashboardCard
                    title="Writing"
                    icon="✍️"
                    color="#00BFA5"
                    gradientColors={['#00BFA5', '#00897B']}
                    route="Writing"
                  />
                </View>
              </ScrollView>
            </View>

            {/* PLAY & LEARN SECTION */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Play & Learn</Text>
                <View style={styles.sectionIconBadge}>
                  <Ionicons name="game-controller" size={16} color="#FF9800" />
                </View>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContainer}
              >
                <View style={styles.horizontalCard}>
                  <DashboardCard
                    title="Spelling"
                    icon="🔤"
                    color="#FF9800"
                    gradientColors={['#FF9800', '#F57C00']}
                    route="Spelling"
                  />
                </View>
                <View style={styles.horizontalCard}>
                  <DashboardCard
                    title="Sound Games"
                    icon="🎧"
                    color="#E91E63"
                    gradientColors={['#E91E63', '#C2185B']}
                    route="PhonologicalAwareness"
                  />
                </View>
                <View style={styles.horizontalCard}>
                  <DashboardCard
                    title="Phonics Games"
                    icon="🎮"
                    color="#9C27B0"
                    gradientColors={['#9C27B0', '#7B1FA2']}
                    route="PhonicsActivity"
                  />
                </View>
              </ScrollView>
            </View>
          </ScrollView>

          {/* NOTIFICATIONS MODAL */}
          <Modal visible={notifVisible} transparent={true} animationType="slide" onRequestClose={() => setNotifVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Notifications</Text>
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
  mainContainer: { flex: 1 },

  // Loading Screen Styles
  loadingScreenContainer: {
    flex: 1,
    backgroundColor: '#FAF5F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
  },

  // Modern Header Styles
  modernHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  modernHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modernHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  profileSection: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginTop: 6,
  },
  modernAvatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  modernAvatarImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  modernAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernAvatarInitial: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  modernGreetingContainer: {
    marginLeft: 14,
    flex: 1,
  },
  modernGreetingText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  modernSubGreeting: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  tipBadgeContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 16,
    maxWidth: '70%',
  },
  tipBadge: {
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderRadius: 7,
    flexShrink: 1,
    minHeight: 16,
    justifyContent: 'center',
  },
  tipBadgeGoal: {
    backgroundColor: '#FFE5E5',
  },
  tipBadgeTip: {
    backgroundColor: '#E3F2FD',
  },
  tipBadgeFun: {
    backgroundColor: '#FFF9E6',
  },
  tipBadgeFact: {
    backgroundColor: '#E8F5E9',
  },
  tipBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#333',
    lineHeight: 12,
    textAlign: 'left',
  },
  movableTipContainer: {
    paddingHorizontal: 10,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  movableTipBadge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 7,
    justifyContent: 'center',
  },
  modernHeaderIcons: {
    flexDirection: 'row',
    gap: 12,
    flexShrink: 0,
  },
  modernIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  modernRedDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5252',
    borderWidth: 2,
    borderColor: '#fff',
  },

  // Modern Scroll Content
  modernScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },

  // Quick Stats Bar
  quickStatsBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 6,
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },

  // Section Styles
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Dashboard Grid Styles
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // Horizontal Scroll Styles
  horizontalScrollContainer: {
    paddingRight: 20,
    gap: 12,
  },
  horizontalCard: {
    width: CARD_WIDTH,
  },

  dashboardCardContainer: {
    width: CARD_WIDTH,
    marginBottom: 16,
    borderRadius: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dashboardCardTouchable: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  dashboardCardGradient: {
    padding: 20,
    borderRadius: 24,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardCardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  dashboardCardIcon: {
    fontSize: 32,
  },
  dashboardCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },

  // AI Insights Banner
  aiBanner: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 5,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  aiBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  aiBannerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  aiBannerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  aiBannerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },

  // Error State
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  errorTitle: { fontSize: 20, fontWeight: 'bold', color: '#FF6B6B', marginTop: 24, marginBottom: 12 },
  errorMessage: { color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#667eea', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 16, elevation: 3 },
  retryBtnText: { color: '#fff', fontWeight: 'bold' },

  // Modal Styles
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
});
