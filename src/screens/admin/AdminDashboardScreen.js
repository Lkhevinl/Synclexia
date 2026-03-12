import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Sidebar from '../../components/Sidebar';

export default function AdminDashboardScreen({ navigation }) {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notifVisible, setNotifVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [parentCount, setParentCount] = useState(0);
  const [pendingTeachers, setPendingTeachers] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchUserCounts();
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase.from('notifications').select('*').eq('is_draft', false).order('created_at', { ascending: false });
    if (data) setNotifications(data);
  };

  const fetchUserCounts = async () => {
    const [s, t, p, pt] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher').eq('status', 'active'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'parent'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher').eq('status', 'pending'),
    ]);
    setStudentCount(s.count || 0);
    setTeacherCount(t.count || 0);
    setParentCount(p.count || 0);
    setPendingTeachers(pt.count || 0);
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

  return (
    <View style={[styles.container, { backgroundColor: theme.bgColor }]}>
      <StatusBar barStyle="light-content" />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* HEADER */}
      <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello, {profile?.full_name?.split(' ')[0] || 'Admin'}! 🛡️</Text>
            <Text style={styles.subGreeting}>Manage all users on the platform.</Text>
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
          <Text style={styles.statLabel}>TEACHERS</Text>
          <Text style={[styles.statValue, { color: '#2196F3' }]}>{teacherCount}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>PARENTS</Text>
          <Text style={[styles.statValue, { color: '#9C27B0' }]}>{parentCount}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>PENDING</Text>
          <Text style={[styles.statValue, { color: pendingTeachers > 0 ? '#F44336' : '#90A4AE' }]}>{pendingTeachers}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* USER MANAGEMENT */}
        <Text style={[styles.sectionTitle, { fontSize: theme.fontSize + 4 }]}>User Management</Text>

        {/* PENDING APPROVALS ALERT */}
        {pendingTeachers > 0 && (
          <TouchableOpacity
            style={styles.pendingAlert}
            onPress={() => navigation.navigate('AdminUsers', { filterRole: 'pending' })}
            activeOpacity={0.8}
          >
            <View style={styles.pendingAlertIcon}>
              <Ionicons name="time" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pendingAlertTitle}>
                {pendingTeachers} Teacher{pendingTeachers > 1 ? 's' : ''} Awaiting Approval
              </Text>
              <Text style={styles.pendingAlertSub}>Tap to review and approve</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        <AdminCard
          title="Learners (Students)"
          subtitle="View, edit and manage student accounts"
          icon="school"
          color="#4CAF50"
          onPress={() => navigation.navigate('AdminUsers', { filterRole: 'student' })}
        />

        <AdminCard
          title="Teachers"
          subtitle="Manage teacher accounts & approvals"
          icon="person-circle"
          color="#2196F3"
          badge={pendingTeachers}
          onPress={() => navigation.navigate('AdminUsers', { filterRole: 'teacher' })}
        />

        <AdminCard
          title="Parents"
          subtitle="View and manage parent accounts"
          icon="people"
          color="#9C27B0"
          onPress={() => navigation.navigate('AdminUsers', { filterRole: 'parent' })}
        />

        {/* ADMINISTRATION */}
        <Text style={[styles.sectionTitle, { fontSize: theme.fontSize + 4, marginTop: 10 }]}>Administration</Text>

        <AdminCard
          title="Parent Links"
          subtitle="Link parents to their children"
          icon="people-circle"
          color="#6A1B9A"
          onPress={() => navigation.navigate('AdminParentLinks')}
        />

        <AdminCard
          title="Enrollment"
          subtitle="Oversee student enrollments"
          icon="qr-code"
          color="#009688"
          onPress={() => navigation.navigate('AdminEnrollment')}
        />

        <AdminCard
          title="Notifications"
          subtitle="Send announcements to all users"
          icon="megaphone"
          color="#FF5722"
          onPress={() => navigation.navigate('AdminNotifications')}
        />

        <AdminCard
          title="Feedback"
          subtitle="Read and reply to user feedback"
          icon="chatbubbles"
          color="#FF9800"
          onPress={() => navigation.navigate('AdminFeedback')}
        />

        <AdminCard
          title="Reports & Analytics"
          subtitle="View activity data and export reports"
          icon="bar-chart"
          color="#673AB7"
          onPress={() => navigation.navigate('AdminReports')}
        />

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* NOTIFICATIONS MODAL */}
      <Modal visible={notifVisible} transparent={true} animationType="fade" onRequestClose={() => setNotifVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notifications 🔔</Text>
            <FlatList
              data={notifications}
              keyExtractor={i => i.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.notifItem}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.notifBody}>{item.content}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#999' }}>No notifications</Text>}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setNotifVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 80, paddingBottom: 40, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subGreeting: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  headerIcons: { flexDirection: 'row', gap: 15 },
  iconBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  redDot: { position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF5252' },

  statsContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, paddingVertical: 15, paddingHorizontal: 20, marginHorizontal: 20, marginTop: -30, boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', elevation: 8, justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 10, fontWeight: 'bold', color: '#90A4AE', letterSpacing: 1 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statDivider: { width: 1, height: 25, backgroundColor: '#ECEFF1' },

  scrollContent: { paddingTop: 30, paddingHorizontal: 20 },
  sectionTitle: { fontWeight: 'bold', color: '#37474F', marginBottom: 15, marginLeft: 5 },

  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 15, elevation: 2 },
  iconBox: { width: 60, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#37474F' },
  cardSub: { fontSize: 13, color: '#90A4AE', marginTop: 4 },
  badge: { backgroundColor: '#F44336', borderRadius: 12, minWidth: 24, height: 24, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, marginRight: 8 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

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

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 25, maxHeight: '60%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333' },
  notifItem: { marginBottom: 15, borderBottomWidth: 1, borderColor: '#f0f0f0', paddingBottom: 10 },
  notifTitle: { fontWeight: 'bold', color: '#1976D2', marginBottom: 4 },
  notifBody: { color: '#555', fontSize: 13 },
  closeBtn: { backgroundColor: '#333', paddingVertical: 12, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  closeText: { color: '#fff', fontWeight: 'bold' }
});