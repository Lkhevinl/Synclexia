import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Sidebar from '../../components/Sidebar';

export default function AdminDashboardScreen({ navigation }) {
  const { theme, getBgColor, getHeaderGradient, getThemeColors, getPrimaryColor } = useTheme();
  const { profile } = useAuth();
  const themeColors = getThemeColors();
  const [notifications, setNotifications] = useState([]);
  const [notifVisible, setNotifVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [parentCount, setParentCount] = useState(0);
  const [contentStats, setContentStats] = useState({
    stories: 0,
    phonics: 0,
    spelling: 0,
    phonicsActivities: 0,
    phonological: 0,
  });
  const [usersModalVisible, setUsersModalVisible] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUserCounts();
    fetchContentStats();
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase.from('notifications').select('*').eq('is_draft', false).order('created_at', { ascending: false });
    if (data) setNotifications(data);
  };

  const fetchUserCounts = async () => {
    const [s, p] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'parent'),
    ]);
    setStudentCount(s.count || 0);
    setParentCount(p.count || 0);
  };

  const fetchContentStats = async () => {
    try {
      const [stories, phonics, spelling, phonicsAct, phonological] = await Promise.all([
        supabase.from('stories').select('id', { count: 'exact', head: true }),
        supabase.from('phonics_items').select('id', { count: 'exact', head: true }),
        supabase.from('spelling_words').select('id', { count: 'exact', head: true }),
        supabase.from('phonics_activity_content').select('id', { count: 'exact', head: true }),
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

  const AdminCard = ({ title, subtitle, icon, color, onPress, badge }) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconBox, { backgroundColor: color }]}>
        <Ionicons name={icon} size={32} color="#fff" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSub}>{subtitle}</Text>
      </View>
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={24} color="#CFD8DC" />
    </TouchableOpacity>
  );

  const ContentCard = ({ title, subtitle, icon, color, count, onPress }) => (
    <TouchableOpacity
      style={styles.contentCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[color, color + '99']}
        style={styles.contentGradient}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.contentIconCircle}>
          <Text style={{ fontSize: 28 }}>{icon}</Text>
        </View>
        <Text style={styles.contentCardTitle}>{title}</Text>
        <Text style={styles.contentCardSubtitle}>{subtitle}</Text>
        <View style={styles.contentCardFooter}>
          <Text style={styles.itemsCount}>{count} items</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: getBgColor() }]}>
      <StatusBar barStyle="light-content" />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* HEADER */}
      <LinearGradient colors={getHeaderGradient()} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello, {profile?.full_name?.split(' ')[0] || 'Admin'}! 👋</Text>
            <Text style={styles.subGreeting}>Manage platform content and users</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => setNotifVisible(true)} style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {notifications.length > 0 && <View style={styles.redDot} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.iconBtn}>
              <Ionicons name="menu-outline" size={26} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* STATS BAR */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>STUDENTS</Text>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>{studentCount}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>PARENTS</Text>
          <Text style={[styles.statValue, { color: '#9C27B0' }]}>{parentCount}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* QUICK OVERVIEW SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Quick Overview</Text>

          <View style={styles.overviewRow}>
            <View style={[styles.overviewCard, { backgroundColor: themeColors.cardBg }]}>
              <View style={[styles.overviewIcon, { backgroundColor: themeColors.accentLight }]}>
                <Ionicons name="trending-up" size={20} color={getPrimaryColor()} />
              </View>
              <Text style={[styles.overviewValue, { color: themeColors.textPrimary }]}>24</Text>
              <Text style={[styles.overviewLabel, { color: themeColors.textSecondary }]}>Active Sessions</Text>
            </View>

            <View style={[styles.overviewCard, { backgroundColor: themeColors.cardBg }]}>
              <View style={[styles.overviewIcon, { backgroundColor: themeColors.accentLight }]}>
                <Ionicons name="checkmark-circle" size={20} color={getPrimaryColor()} />
              </View>
              <Text style={[styles.overviewValue, { color: themeColors.textPrimary }]}>156</Text>
              <Text style={[styles.overviewLabel, { color: themeColors.textSecondary }]}>Completed Tasks</Text>
            </View>

            <View style={[styles.overviewCard, { backgroundColor: themeColors.cardBg }]}>
              <View style={[styles.overviewIcon, { backgroundColor: themeColors.accentLight }]}>
                <Ionicons name="time" size={20} color={getPrimaryColor()} />
              </View>
              <Text style={[styles.overviewValue, { color: themeColors.textPrimary }]}>3</Text>
              <Text style={[styles.overviewLabel, { color: themeColors.textSecondary }]}>Pending Reviews</Text>
            </View>
          </View>
        </View>

        {/* RECENT ACTIVITY SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Recent Activity</Text>

          <View style={[styles.activityCard, { backgroundColor: themeColors.cardBg }]}>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#4CAF50' }]} />
              <View style={styles.activityContent}>
                <Text style={[styles.activityText, { color: themeColors.textPrimary }]}>New student enrollment</Text>
                <Text style={[styles.activityTime, { color: themeColors.textSecondary }]}>2 hours ago</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: getPrimaryColor() }]} />
              <View style={styles.activityContent}>
                <Text style={[styles.activityText, { color: themeColors.textPrimary }]}>Content updated: Phonics lesson</Text>
                <Text style={[styles.activityTime, { color: themeColors.textSecondary }]}>5 hours ago</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#FF9800' }]} />
              <View style={styles.activityContent}>
                <Text style={[styles.activityText, { color: themeColors.textPrimary }]}>Parent feedback received</Text>
                <Text style={[styles.activityTime, { color: themeColors.textSecondary }]}>1 day ago</Text>
              </View>
            </View>
          </View>
        </View>

        {/* MAIN ACTION CARDS - ROW 1 */}
        <View style={styles.cardRow}>
          {/* MANAGE CONTENTS */}
          <TouchableOpacity
            style={styles.mainCard}
            onPress={() => navigation.navigate('AdminManageContents')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={getHeaderGradient()} style={styles.mainCardGradient}>
              <View style={styles.cardIconWrap}>
                <Ionicons name="layers" size={28} color="#fff" />
              </View>
              <Text style={styles.mainCardTitle}>Manage Contents</Text>
              <Text style={styles.mainCardSubtitle}>{Object.values(contentStats).reduce((a, b) => a + b, 0)} items</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* MANAGE USERS */}
          <TouchableOpacity
            style={styles.mainCard}
            onPress={() => setUsersModalVisible(true)}
            activeOpacity={0.85}
          >
            <LinearGradient colors={[getPrimaryColor(), themeColors.textPrimary]} style={styles.mainCardGradient}>
              <View style={styles.cardIconWrap}>
                <Ionicons name="people" size={28} color="#fff" />
              </View>
              <Text style={styles.mainCardTitle}>Manage Users</Text>
              <Text style={styles.mainCardSubtitle}>{studentCount + parentCount} users</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* MAIN ACTION CARDS - ROW 2 */}
        <View style={styles.cardRow}>
          {/* MANAGE FEEDBACK */}
          <TouchableOpacity
            style={styles.mainCard}
            onPress={() => navigation.navigate('AdminFeedback')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={[themeColors.textSecondary, getPrimaryColor()]} style={styles.mainCardGradient}>
              <View style={styles.cardIconWrap}>
                <Ionicons name="chatbubbles" size={28} color="#fff" />
              </View>
              <Text style={styles.mainCardTitle}>Manage Feedback</Text>
              <Text style={styles.mainCardSubtitle}>Read & respond</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* REPORTS */}
          <TouchableOpacity
            style={styles.mainCard}
            onPress={() => navigation.navigate('AdminReports')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={[...getHeaderGradient()].reverse()} style={styles.mainCardGradient}>
              <View style={styles.cardIconWrap}>
                <Ionicons name="bar-chart" size={28} color="#fff" />
              </View>
              <Text style={styles.mainCardTitle}>Reports</Text>
              <Text style={styles.mainCardSubtitle}>Analytics & data</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* USERS MANAGEMENT MODAL */}
      <Modal visible={usersModalVisible} transparent animationType="slide" onRequestClose={() => setUsersModalVisible(false)}>
        <View style={styles.submenuOverlay}>
          <View style={styles.submenuContent}>
            <View style={styles.submenuHeader}>
              <Text style={styles.submenuTitle}>User Management</Text>
              <TouchableOpacity onPress={() => setUsersModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <TouchableOpacity
                style={styles.submenuItem}
                onPress={() => { setUsersModalVisible(false); navigation.navigate('AdminUsers', { filterRole: 'student' }); }}
              >
                <View style={[styles.submenuIcon, { backgroundColor: '#C8E6C9' }]}>
                  <Ionicons name="school" size={24} color="#2E7D32" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.submenuItemTitle}>Learners (Students)</Text>
                  <Text style={styles.submenuItemSub}>{studentCount} total</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submenuItem}
                onPress={() => { setUsersModalVisible(false); navigation.navigate('AdminUsers', { filterRole: 'parent' }); }}
              >
                <View style={[styles.submenuIcon, { backgroundColor: '#F8BBD0' }]}>
                  <Ionicons name="people" size={24} color="#C2185B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.submenuItemTitle}>Parents</Text>
                  <Text style={styles.submenuItemSub}>{parentCount} total</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submenuItem}
                onPress={() => { setUsersModalVisible(false); navigation.navigate('AdminParentLinks'); }}
              >
                <View style={[styles.submenuIcon, { backgroundColor: '#E1BEE7' }]}>
                  <Ionicons name="people-circle" size={24} color="#6A1B9A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.submenuItemTitle}>Parent Links</Text>
                  <Text style={styles.submenuItemSub}>Manage relationships</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submenuItem}
                onPress={() => { setUsersModalVisible(false); navigation.navigate('AdminNotifications'); }}
              >
                <View style={[styles.submenuIcon, { backgroundColor: '#FFCCBC' }]}>
                  <Ionicons name="megaphone" size={24} color="#D84315" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.submenuItemTitle}>Send Announcements</Text>
                  <Text style={styles.submenuItemSub}>Notify all users</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* NOTIFICATIONS MODAL */}
      <Modal visible={notifVisible} transparent={true} animationType="slide" onRequestClose={() => setNotifVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalTitle}>Notifications 🔔</Text>
              <TouchableOpacity onPress={() => setNotifVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={notifications}
              keyExtractor={i => i.id.toString()}
              contentContainerStyle={{ paddingBottom: 10 }}
              ListEmptyComponent={
                <View style={styles.emptyNotifContainer}>
                  <Ionicons name="notifications-off-outline" size={48} color="#ddd" />
                  <Text style={styles.emptyNotifText}>No notifications yet</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.notifItem}>
                  <View style={styles.notifIconBox}>
                    <Ionicons name="megaphone" size={20} color="#4c669f" />
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
  header: { paddingTop: 48, paddingBottom: 18, paddingHorizontal: 14, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  subGreeting: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8 },
  redDot: { position: 'absolute', top: 2, right: 2, width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF5252' },

  statsContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14, marginHorizontal: 14, marginTop: -14, marginBottom: 8, elevation: 3, justifyContent: 'space-around', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 8, fontWeight: 'bold', color: '#90A4AE', letterSpacing: 0.5 },
  statValue: { fontSize: 15, fontWeight: 'bold', color: '#333', marginTop: 2 },
  statDivider: { width: 1, height: 18, backgroundColor: '#ECEFF1' },

  scrollContent: { paddingTop: 12, paddingHorizontal: 12, paddingBottom: 20 },

  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  mainCard: { flex: 1, marginHorizontal: 6, borderRadius: 18, elevation: 4, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  mainCardGradient: { paddingVertical: 24, paddingHorizontal: 12, height: 160, justifyContent: 'center', alignItems: 'center' },
  cardIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  mainCardTitle: { fontSize: 13, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  mainCardSubtitle: { fontSize: 10, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 3 },

  submenuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  submenuContent: { width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '80%' },
  submenuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  submenuTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  submenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', gap: 14 },
  submenuIcon: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  submenuItemTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  submenuItemSub: { fontSize: 12, color: '#999', marginTop: 2 },
  sectionTitle: { fontWeight: 'bold', color: '#37474F', marginBottom: 15, marginLeft: 5 },

  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 15, elevation: 2 },
  iconBox: { width: 60, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#37474F' },
  cardSub: { fontSize: 13, color: '#90A4AE', marginTop: 4 },
  badge: { backgroundColor: '#F44336', borderRadius: 12, minWidth: 24, height: 24, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, marginRight: 8 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  tipBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a237e', borderRadius: 16, padding: 14, marginBottom: 18, elevation: 2 },
  tipText: { color: '#fff', flex: 1, lineHeight: 18, fontWeight: '600', fontSize: 13 },

  contentGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 20 },
  contentCard: { width: '48%', marginBottom: 12, borderRadius: 18, elevation: 4 },
  contentGradient: { padding: 16, borderRadius: 18, height: 160, justifyContent: 'space-between', alignItems: 'center' },
  contentIconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  contentCardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14, textAlign: 'center', marginBottom: 3 },
  contentCardSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 11, textAlign: 'center', marginBottom: 10 },
  contentCardFooter: { width: '100%', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' },
  itemsCount: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '600' },

  pendingAlert: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F44336', borderRadius: 16,
    padding: 16, marginBottom: 16,
    elevation: 4,
  },
  pendingAlertIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  pendingAlertTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  pendingAlertSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: '75%' },
  modalHeaderContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  notifItem: { flexDirection: 'row', marginBottom: 12, backgroundColor: '#F5F5F5', borderRadius: 12, padding: 12, alignItems: 'flex-start', gap: 10 },
  notifIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  notifTitle: { fontWeight: 'bold', color: '#1976D2', marginBottom: 4, fontSize: 14 },
  notifBody: { color: '#555', fontSize: 13, lineHeight: 18 },
  notifTime: { fontSize: 11, color: '#999', marginTop: 4 },
  emptyNotifContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyNotifText: { marginTop: 12, color: '#999', fontSize: 15 },
  closeBtn: { backgroundColor: '#333', paddingVertical: 12, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  closeText: { color: '#fff', fontWeight: 'bold' },

  // New layout enhancement styles
  sectionContainer: { marginBottom: 20, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginLeft: 4 },

  overviewRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  overviewCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  overviewIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  overviewValue: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  overviewLabel: { fontSize: 11, textAlign: 'center', lineHeight: 14 },

  activityCard: { borderRadius: 16, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  activityItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, gap: 12 },
  activityDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  activityContent: { flex: 1 },
  activityText: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  activityTime: { fontSize: 11, marginTop: 2 }
});