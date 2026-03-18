import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Modal, FlatList, Image, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Sidebar from '../../../components/Sidebar';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isDesktop = isWeb && width > 768;

const DAILY_TIPS = [
  "Tip: Add engaging content to help students learn!",
  "Tip: Keep spelling words organized by difficulty.",
  "Tip: Update phonics content regularly for variety.",
  "Tip: Create diverse learning activities for students."
];

export default function TeacherDashboardScreen({ navigation }) {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notifVisible, setNotifVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [dailyTip, setDailyTip] = useState(DAILY_TIPS[0]);
  const [contentStats, setContentStats] = useState({
    stories: 0,
    phonics: 0,
    spelling: 0,
    phonicsActivities: 0,
    phonological: 0,
  });

  useEffect(() => {
    fetchNotifications();
    fetchContentStats();
    const randomTip = DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
    setDailyTip(randomTip);
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_draft', false)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setNotifications(data);
  };

  const fetchContentStats = async () => {
    try {
      const [stories, phonics, spelling, phonicsAct, phonological] = await Promise.all([
        supabase.from('stories').select('id', { count: 'exact', head: true }),
        supabase.from('phonics_items').select('id', { count: 'exact', head: true }),
        supabase.from('spelling_words').select('id', { count: 'exact', head: true }),
        supabase.from('phonics_activities').select('id', { count: 'exact', head: true }),
        supabase.from('phonological_items').select('id', { count: 'exact', head: true }),
      ]);

      setContentStats({
        stories: stories.count || 0,
        phonics: phonics.count || 0,
        spelling: spelling.count || 0,
        phonicsActivities: phonicsAct.count || 0,
        phonological: phonological.count || 0,
      });
    } catch (error) {
      console.error('Error fetching content stats:', error);
    }
  };

  // Desktop Grid Card - Enhanced Design
  const GridCard = ({ title, subtitle, icon, color, count, onPress }) => (
    <TouchableOpacity
      style={[styles.gridCard, isDesktop && styles.gridCardDesktop]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[color, color + 'E6', color + 'CC']}
        style={styles.gridGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardTop}>
          <View style={styles.gridIconWrapper}>
            <Ionicons name={icon} size={isDesktop ? 34 : 30} color="#fff" />
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        </View>
        <View style={styles.gridContent}>
          <Text style={[styles.gridTitle, isDesktop && styles.gridTitleDesktop]}>{title}</Text>
          <Text style={[styles.gridSubtitle, isDesktop && styles.gridSubtitleDesktop]}>{subtitle}</Text>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.itemsLabel}>items</Text>
          <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.9)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const totalItems = contentStats.stories + contentStats.phonics + contentStats.spelling +
                     contentStats.phonicsActivities + contentStats.phonological;

  return (
    <View style={[styles.container, { backgroundColor: isDesktop ? '#f0f4f8' : theme.bgColor }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* ── HEADER ── */}
      <LinearGradient
        colors={['#7B1FA2', '#9C27B0', '#AB47BC']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.headerContainer, isDesktop && styles.headerContainerDesktop]}>
          {/* Main Header Content */}
          <View style={styles.headerMain}>
            <View style={styles.logoSection}>
              <View style={styles.logoWrapper}>
                <Image
                  source={require('../../../../assets/icon.png')}
                  style={styles.logoImg}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.brandSection}>
                <Text style={styles.appName}>SYNCLEXIA</Text>
                <Text style={styles.appTagline}>Content Management Portal</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => setNotifVisible(true)} style={styles.iconBtn}>
                <Ionicons name="notifications" size={23} color="#fff" />
                {notifications.length > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>{notifications.length > 9 ? '9+' : notifications.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.iconBtn}>
                <Ionicons name="menu" size={25} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Greeting Section */}
          <View style={[styles.greetingSection, isDesktop && styles.greetingSectionDesktop]}>
            <View style={styles.greetingContent}>
              <View style={styles.greetingRow}>
                <Text style={styles.greeting}>
                  Hello, {profile?.full_name?.split(' ')[0] || 'Teacher'}!
                </Text>
                <Text style={styles.waveEmoji}>👋</Text>
              </View>
              <Text style={styles.subGreeting}>
                Welcome back! Manage learning content for all students.
              </Text>
            </View>
            {profile?.status === 'active' && (
              <View style={styles.statusBadge}>
                <Ionicons name="shield-checkmark" size={isDesktop ? 16 : 14} color="#4CAF50" />
                <Text style={styles.statusText}>Active</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
        showsVerticalScrollIndicator={false}
      >
        {/* DAILY TIP */}
        <LinearGradient
          colors={['#1a237e', '#283593', '#3949ab']}
          style={[styles.tipBox, isDesktop && styles.tipBoxDesktop]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.tipIcon}>
            <Ionicons name="bulb" size={isDesktop ? 24 : 20} color="#FFD700" />
          </View>
          <Text style={[styles.tipText, { fontSize: theme.fontSize }]}>{dailyTip}</Text>
        </LinearGradient>

        {/* ── CONTENT MANAGEMENT GRID ── */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>Content Management</Text>
            <Text style={styles.sectionSubtitle}>Click any card to manage content</Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchContentStats}>
            <Ionicons name="refresh" size={isDesktop ? 20 : 18} color="#9C27B0" />
          </TouchableOpacity>
        </View>

        <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
          <GridCard
            title="Writing Practice"
            subtitle="Tracing words & stories"
            icon="pencil"
            color="#9C27B0"
            count={contentStats.stories}
            onPress={() => navigation.navigate('TeacherAddStory')}
          />
          <GridCard
            title="Phonics Audio"
            subtitle="Sounds & letters"
            icon="volume-high"
            color="#00BCD4"
            count={contentStats.phonics}
            onPress={() => navigation.navigate('TeacherPhonics')}
          />
          <GridCard
            title="Spelling Words"
            subtitle="Word bank management"
            icon="text"
            color="#2196F3"
            count={contentStats.spelling}
            onPress={() => navigation.navigate('TeacherSpelling')}
          />
          <GridCard
            title="Phonics Activity"
            subtitle="Blend, rhyme & segment"
            icon="musical-notes"
            color="#FF9800"
            count={contentStats.phonicsActivities}
            onPress={() => navigation.navigate('TeacherPhonicsActivity')}
          />
          <GridCard
            title="Phonological"
            subtitle="Syllable, rime & phoneme"
            icon="ear"
            color="#673AB7"
            count={contentStats.phonological}
            onPress={() => navigation.navigate('TeacherPhonological')}
          />
        </View>

        {/* CONTENT OVERVIEW */}
        <View style={styles.overviewSection}>
          <Text style={[styles.sectionTitle, isDesktop && styles.sectionTitleDesktop]}>Content Overview</Text>
          <View style={[styles.statsContainer, isDesktop && styles.statsContainerDesktop]}>
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.statGradient}>
                <Ionicons name="albums" size={32} color="#fff" />
                <Text style={styles.statValue}>{totalItems}</Text>
                <Text style={styles.statLabel}>Total Items</Text>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statContent, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="text" size={28} color="#4CAF50" />
                <Text style={[styles.statValue, { color: '#4CAF50' }]}>{contentStats.spelling}</Text>
                <Text style={[styles.statLabel, { color: '#2E7D32' }]}>Spelling Words</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statContent, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="volume-high" size={28} color="#2196F3" />
                <Text style={[styles.statValue, { color: '#2196F3' }]}>{contentStats.phonics}</Text>
                <Text style={[styles.statLabel, { color: '#1565C0' }]}>Phonics Items</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statContent, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="musical-notes" size={28} color="#FF9800" />
                <Text style={[styles.statValue, { color: '#FF9800' }]}>{contentStats.phonicsActivities}</Text>
                <Text style={[styles.statLabel, { color: '#E65100' }]}>Activities</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* NOTIFICATIONS MODAL */}
      <Modal visible={notifVisible} transparent animationType="fade" onRequestClose={() => setNotifVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDesktop && styles.modalContentDesktop]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="notifications" size={24} color="#9C27B0" />
                <Text style={styles.modalTitle}>Notifications</Text>
              </View>
              <TouchableOpacity onPress={() => setNotifVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={notifications}
              keyExtractor={i => i.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.notifItem}>
                  <View style={styles.notifIcon}>
                    <Ionicons name="megaphone" size={22} color="#9C27B0" />
                  </View>
                  <View style={styles.notifContent}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <Text style={styles.notifBody} numberOfLines={2}>{item.content}</Text>
                    <Text style={styles.notifTime}>{new Date(item.created_at).toLocaleDateString()}</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyNotif}>
                  <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyNotifText}>No notifications yet</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Header ──
  header: {
    paddingTop: isWeb ? 20 : 50,
    paddingBottom: isDesktop ? 32 : 20,
    paddingHorizontal: isDesktop ? 24 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10
  },
  headerContainer: {
    gap: isDesktop ? 20 : 12
  },
  headerContainerDesktop: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%'
  },
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isDesktop ? 16 : 12
  },
  logoWrapper: {
    width: isDesktop ? 68 : 52,
    height: isDesktop ? 68 : 52,
    borderRadius: isDesktop ? 20 : 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: isDesktop ? 3 : 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5
  },
  logoImg: {
    width: isDesktop ? 60 : 46,
    height: isDesktop ? 60 : 46,
    borderRadius: isDesktop ? 18 : 14
  },
  brandSection: {
    gap: 2
  },
  appName: {
    fontSize: isDesktop ? 14 : 12,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: isDesktop ? 3.5 : 2.5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  appTagline: {
    fontSize: isDesktop ? 11 : 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.5
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: isDesktop ? 16 : 12,
    padding: isDesktop ? 16 : 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  greetingSectionDesktop: {
    padding: 20
  },
  greetingContent: {
    flex: 1,
    gap: isDesktop ? 6 : 4
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isDesktop ? 10 : 6
  },
  greeting: {
    fontSize: isDesktop ? 26 : 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4
  },
  waveEmoji: {
    fontSize: isDesktop ? 24 : 20
  },
  subGreeting: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: isDesktop ? 14 : 12,
    fontWeight: '500',
    lineHeight: isDesktop ? 20 : 18
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isDesktop ? 6 : 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: isDesktop ? 14 : 10,
    paddingVertical: isDesktop ? 8 : 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  statusText: {
    color: '#fff',
    fontSize: isDesktop ? 13 : 11,
    fontWeight: '700'
  },
  headerActions: {
    flexDirection: 'row',
    gap: isDesktop ? 12 : 8
  },
  iconBtn: {
    padding: isDesktop ? 13 : 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: isDesktop ? 16 : 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3
  },
  notifBadge: {
    position: 'absolute',
    top: isDesktop ? 5 : 3,
    right: isDesktop ? 5 : 3,
    backgroundColor: '#FF3D00',
    borderRadius: 11,
    minWidth: isDesktop ? 22 : 20,
    height: isDesktop ? 22 : 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#7B1FA2'
  },
  notifBadgeText: {
    color: '#fff',
    fontSize: isDesktop ? 11 : 10,
    fontWeight: 'bold'
  },

  // ── Scroll content ──
  scrollContent: { paddingHorizontal: isDesktop ? 18 : 14, paddingTop: isDesktop ? 24 : 18 },
  scrollContentDesktop: { maxWidth: 1200, marginHorizontal: 'auto', width: '100%', paddingHorizontal: 32 },

  // Tip box
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isDesktop ? 14 : 10,
    borderRadius: isDesktop ? 20 : 16,
    padding: isDesktop ? 18 : 14,
    marginBottom: isDesktop ? 32 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5
  },
  tipBoxDesktop: { padding: 22 },
  tipIcon: {
    width: isDesktop ? 48 : 40,
    height: isDesktop ? 48 : 40,
    borderRadius: isDesktop ? 12 : 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  tipText: { color: '#fff', flex: 1, lineHeight: isDesktop ? 22 : 20, fontWeight: '600', fontSize: isDesktop ? 14 : 13 },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isDesktop ? 20 : 16
  },
  sectionTitle: { fontSize: isDesktop ? 20 : 17, fontWeight: '900', color: '#1a237e', letterSpacing: 0.5 },
  sectionTitleDesktop: { fontSize: 22 },
  sectionSubtitle: { fontSize: isDesktop ? 13 : 11, color: '#7986cb', marginTop: 4, fontWeight: '500' },
  refreshBtn: {
    width: isDesktop ? 40 : 36,
    height: isDesktop ? 40 : 36,
    borderRadius: isDesktop ? 12 : 10,
    backgroundColor: '#f3e5f5',
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Grid layout
  grid: { gap: isDesktop ? 16 : 12, marginBottom: 20 },
  gridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'space-between'
  },

  // Grid cards
  gridCard: {
    borderRadius: isDesktop ? 24 : 18,
    marginBottom: isDesktop ? 0 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6
  },
  gridCardDesktop: {
    width: 'calc(50% - 12px)',
    marginBottom: 0
  },
  gridGradient: {
    borderRadius: isDesktop ? 24 : 18,
    padding: isDesktop ? 20 : 16,
    minHeight: isDesktop ? 140 : 120
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: isDesktop ? 16 : 12
  },
  gridIconWrapper: {
    width: isDesktop ? 64 : 52,
    height: isDesktop ? 64 : 52,
    borderRadius: isDesktop ? 18 : 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: isDesktop ? 14 : 10,
    paddingVertical: isDesktop ? 8 : 6,
    borderRadius: isDesktop ? 16 : 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)'
  },
  countText: { color: '#fff', fontSize: isDesktop ? 20 : 16, fontWeight: 'bold' },
  gridContent: { marginBottom: isDesktop ? 12 : 10 },
  gridTitle: { color: '#fff', fontWeight: 'bold', fontSize: isDesktop ? 18 : 15, marginBottom: isDesktop ? 6 : 4 },
  gridTitleDesktop: { fontSize: 19 },
  gridSubtitle: { color: 'rgba(255,255,255,0.95)', fontSize: isDesktop ? 13 : 11, fontWeight: '500' },
  gridSubtitleDesktop: { fontSize: 14 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)'
  },
  itemsLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' },

  // Overview section
  overviewSection: { marginTop: 32 },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 16 },
  statsContainerDesktop: { gap: 20 },
  statCard: {
    flex: 1,
    minWidth: isDesktop ? 'calc(25% - 15px)' : 'calc(50% - 8px)',
    borderRadius: 20,
    overflow: 'hidden'
  },
  statCardPrimary: { minWidth: isDesktop ? 'calc(25% - 15px)' : '100%' },
  statGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140
  },
  statContent: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    borderRadius: 20
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 8
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
    textAlign: 'center'
  },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center' },
  modalContent: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 28,
    maxHeight: '75%',
    maxWidth: 600,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15
  },
  modalContentDesktop: { width: 600 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a237e' },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  notifItem: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 14
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center'
  },
  notifContent: { flex: 1 },
  notifTitle: { fontWeight: 'bold', color: '#1a237e', marginBottom: 6, fontSize: 15 },
  notifBody: { color: '#616161', fontSize: 13, lineHeight: 20, marginBottom: 6 },
  notifTime: { fontSize: 11, color: '#9e9e9e', fontWeight: '500' },
  emptyNotif: { alignItems: 'center', paddingVertical: 60 },
  emptyNotifText: { marginTop: 12, color: '#999', fontSize: 15 }
});
