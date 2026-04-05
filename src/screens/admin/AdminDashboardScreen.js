import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList, ActivityIndicator } from 'react-native';
import Icon from '../../components/icons/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Sidebar from '../../components/Sidebar';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function AdminDashboardScreen({ navigation }) {
  const { theme, colors } = useTheme();
  const { profile } = useAuth();
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initializeAdminDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchNotifications(), fetchUserCounts(), fetchContentStats()]);
    } catch (error) {
      setError('Failed to load admin dashboard. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAdminDashboard();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase.from('notifications').select('*').eq('is_draft', false).order('created_at', { ascending: false });
      if (error) {
        setNotifications([]);
        return;
      }
      setNotifications(data || []);
    } catch (error) {
      setNotifications([]);
    }
  };

  const fetchUserCounts = async () => {
    try {
      const [s, p] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'parent'),
      ]);

      if (s.error || p.error) {
        setStudentCount(0);
        setParentCount(0);
        return;
      }

      setStudentCount(s.count || 0);
      setParentCount(p.count || 0);
    } catch (error) {
      setStudentCount(0);
      setParentCount(0);
    }
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
      setContentStats({
        stories: 0,
        phonics: 0,
        spelling: 0,
        phonicsActivities: 0,
        phonological: 0,
      });
    }
  };

  const AdminCard = ({ title, subtitle, icon, color, onPress, badge }) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconBox, { backgroundColor: color }]}>
        <Icon name={icon} size="lg" color="#fff" />
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
      <Icon name="chevron-forward" size="md" color="#CFD8DC" />
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
    <ScreenWrapper role="admin" padded={false} style={{ backgroundColor: colors.surface }}>
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading admin dashboard...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size="xl" color="#FF6B6B" />
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={initializeAdminDashboard}>
            <Icon name="refresh-cw" size="sm" color="#fff" />
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* HEADER */}
          <LinearGradient colors={theme.headerGradient} style={styles.enhancedHeader}>
        <View style={styles.enhancedHeaderContent}>
          <View style={styles.headerTextSection}>
            <Text style={styles.enhancedGreeting}>Hello, {profile?.full_name?.split(' ')[0] || 'Admin'}!</Text>
            <Text style={styles.enhancedSubGreeting}>Manage platform content and users</Text>
          </View>
          <View style={styles.enhancedHeaderIcons}>
            <TouchableOpacity onPress={() => setNotifVisible(true)} style={styles.enhancedIconBtn}>
              <Icon name="bell" size="md" color="#fff" />
              {notifications.length > 0 && <View style={styles.enhancedRedDot} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.enhancedIconBtn}>
              <Icon name="menu" size="lg" color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ENHANCED STATS OVERVIEW */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <View style={styles.statIconContainer}>
              <Icon name="users" size="md" color="#4CAF50" />
            </View>
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{studentCount}</Text>
            <Text style={styles.statLabel}>Students</Text>
            <Text style={styles.statSubtext}>Active learners</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
            <View style={styles.statIconContainer}>
              <Icon name="heart" size="md" color="#9C27B0" />
            </View>
            <Text style={[styles.statNumber, { color: '#9C27B0' }]}>{parentCount}</Text>
            <Text style={styles.statLabel}>Parents</Text>
            <Text style={styles.statSubtext}>Family support</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <View style={styles.statIconContainer}>
              <Icon name="library" size="md" color="#2196F3" />
            </View>
            <Text style={[styles.statNumber, { color: '#2196F3' }]}>{Object.values(contentStats).reduce((a, b) => a + b, 0)}</Text>
            <Text style={styles.statLabel}>Content</Text>
            <Text style={styles.statSubtext}>Learning items</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <View style={styles.statIconContainer}>
              <Icon name="trending-up" size="md" color="#FF9800" />
            </View>
            <Text style={[styles.statNumber, { color: '#FF9800' }]}>98%</Text>
            <Text style={styles.statLabel}>Uptime</Text>
            <Text style={styles.statSubtext}>System health</Text>
          </View>
        </View>

        {/* QUICK ACTIONS SECTION */}
        <View style={styles.sectionHeader}>
          <Icon name="zap" size="sm" color={colors.primary} />
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        {/* MAIN ACTION CARDS - ENHANCED LAYOUT */}
        <View style={styles.enhancedCardGrid}>
          {/* MANAGE CONTENTS */}
          <TouchableOpacity
            style={[styles.enhancedCard, styles.wideCard]}
            onPress={() => navigation.navigate('AdminManageContents')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.enhancedCardGradient}>
              <View style={styles.enhancedCardHeader}>
                <View style={styles.enhancedIconWrap}>
                  <Icon name="layers" size="lg" color="#fff" />
                </View>
                <Text style={styles.enhancedCardTitle}>Manage Contents</Text>
              </View>
              <Text style={styles.enhancedCardDescription}>
                Create and organize learning materials for students
              </Text>
              <View style={styles.enhancedCardFooter}>
                <Text style={styles.enhancedCardStats}>{Object.values(contentStats).reduce((a, b) => a + b, 0)} total items</Text>
                <Icon name="arrow-right" size="sm" color="rgba(255,255,255,0.8)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* MANAGE USERS */}
          <TouchableOpacity
            style={styles.enhancedCard}
            onPress={() => setUsersModalVisible(true)}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.enhancedCardGradient}>
              <View style={styles.enhancedIconWrap}>
                <Icon name="users" size="lg" color="#fff" />
              </View>
              <Text style={styles.enhancedCardTitle}>Users</Text>
              <Text style={styles.enhancedCardSubtitle}>{studentCount + parentCount} total</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* MAINTENANCE LOGS */}
          <TouchableOpacity
            style={styles.enhancedCard}
            onPress={() => navigation.navigate('MaintenanceLogs')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.enhancedCardGradient}>
              <View style={styles.enhancedIconWrap}>
                <Icon name="wrench" size="lg" color="#fff" />
              </View>
              <Text style={styles.enhancedCardTitle}>Maintenance</Text>
              <Text style={styles.enhancedCardSubtitle}>Logs & Issues</Text>
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
                <Icon name="x" size="md" color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <TouchableOpacity
                style={styles.submenuItem}
                onPress={() => { setUsersModalVisible(false); navigation.navigate('AdminUsers', { filterRole: 'student' }); }}
              >
                <View style={[styles.submenuIcon, { backgroundColor: '#C8E6C9' }]}>
                  <Icon name="graduation-cap" size="md" color="#2E7D32" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.submenuItemTitle}>Learners (Students)</Text>
                  <Text style={styles.submenuItemSub}>{studentCount} total</Text>
                </View>
                <Icon name="chevron-forward" size="sm" color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submenuItem}
                onPress={() => { setUsersModalVisible(false); navigation.navigate('AdminUsers', { filterRole: 'parent' }); }}
              >
                <View style={[styles.submenuIcon, { backgroundColor: '#F8BBD0' }]}>
                  <Icon name="users" size="md" color="#C2185B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.submenuItemTitle}>Parents</Text>
                  <Text style={styles.submenuItemSub}>{parentCount} total</Text>
                </View>
                <Icon name="chevron-forward" size="sm" color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submenuItem}
                onPress={() => { setUsersModalVisible(false); navigation.navigate('AdminParentLinks'); }}
              >
                <View style={[styles.submenuIcon, { backgroundColor: '#E1BEE7' }]}>
                  <Icon name="users" size="md" color="#6A1B9A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.submenuItemTitle}>Parent Links</Text>
                  <Text style={styles.submenuItemSub}>Manage relationships</Text>
                </View>
                <Icon name="chevron-forward" size="sm" color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submenuItem}
                onPress={() => { setUsersModalVisible(false); navigation.navigate('AdminNotifications'); }}
              >
                <View style={[styles.submenuIcon, { backgroundColor: '#FFCCBC' }]}>
                  <Icon name="megaphone" size="md" color="#D84315" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.submenuItemTitle}>Send Announcements</Text>
                  <Text style={styles.submenuItemSub}>Notify all users</Text>
                </View>
                <Icon name="chevron-forward" size="sm" color="#ccc" />
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
                <Icon name="x" size="md" color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={notifications}
              keyExtractor={i => i.id.toString()}
              contentContainerStyle={{ paddingBottom: 10 }}
              ListEmptyComponent={
                <View style={styles.emptyNotifContainer}>
                  <Icon name="bell-off" size="lg" color="#ddd" />
                  <Text style={styles.emptyNotifText}>No notifications yet</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.notifItem}>
                  <View style={styles.notifIconBox}>
                    <Icon name="megaphone" size="md" color="#4c669f" />
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
    </ScreenWrapper>
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

  scrollContent: { paddingTop: 12, paddingHorizontal: 20, paddingBottom: 20 },

  sectionTitle: { fontWeight: 'bold', color: '#37474F', marginBottom: 15, marginLeft: 5 },

  // Modal styles (keeping these as they're still used)
  submenuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  submenuContent: { width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '80%' },
  submenuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  submenuTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  submenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', gap: 14 },
  submenuIcon: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  submenuItemTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  submenuItemSub: { fontSize: 12, color: '#999', marginTop: 2 },

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

  // Loading and Error states
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  loadingText: { color: '#666', marginTop: 16, fontSize: 16, textAlign: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  errorTitle: { fontSize: 20, fontWeight: 'bold', color: '#FF6B6B', marginTop: 24, marginBottom: 12 },
  errorMessage: { color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 32, fontSize: 16 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#607D8B', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 16, elevation: 3 },
  retryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Enhanced Layout Styles
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 24 },
  statCard: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 1
  },
  statNumber: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 2 },
  statSubtext: { fontSize: 11, color: '#666', textAlign: 'center' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },

  enhancedCardGrid: { gap: 16 },
  enhancedCard: {
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginBottom: 16
  },
  wideCard: { width: '100%' },
  enhancedCardGradient: {
    borderRadius: 20,
    padding: 20,
    minHeight: 140
  },
  enhancedCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  enhancedIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  enhancedCardTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', flex: 1 },
  enhancedCardSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 8 },
  enhancedCardDescription: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 20, marginBottom: 16 },
  enhancedCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  enhancedCardStats: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },

  // Enhanced Header Styles
  enhancedHeader: {
    paddingTop: 55,
    paddingBottom: 28,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  enhancedHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextSection: {
    flex: 1,
  },
  enhancedGreeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  enhancedSubGreeting: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  enhancedHeaderIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  enhancedIconBtn: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  enhancedRedDot: {
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
});