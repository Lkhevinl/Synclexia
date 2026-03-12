import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Modal, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { xpToLevel } from '../../lib/userUtils';


const DAILY_TIPS = [
  "Tip: Engage your students with interactive lessons!",
  "Tip: Monitor student progress regularly.",
  "Tip: Provide timely feedback to students.",
  "Tip: Create diverse learning activities."
];

export default function TeacherDashboardScreen({ navigation }) {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notifVisible, setNotifVisible] = useState(false);
  const [dailyTip, setDailyTip] = useState(DAILY_TIPS[0]);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [activityFeed, setActivityFeed] = useState([]);
  const [enrolledStudentIds, setEnrolledStudentIds] = useState([]);
  const channelRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    fetchEnrolledCount();
    const randomTip = DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
    setDailyTip(randomTip);
  }, []);

  // Real-time subscription for student activity
  useEffect(() => {
    if (enrolledStudentIds.length === 0) return;
    
    // Subscribe to session_logs inserts from enrolled students
    const channel = supabase
      .channel('teacher-activity-feed')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'session_logs',
      }, (payload) => {
        const newLog = payload.new;
        // Only show logs from enrolled students
        if (enrolledStudentIds.includes(newLog.student_id)) {
          setActivityFeed(prev => [newLog, ...prev].slice(0, 20));
        }
      })
      .subscribe();

    channelRef.current = channel;
    
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [enrolledStudentIds]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_draft', false)
      .eq('teacher_id', profile?.id)
      .order('created_at', { ascending: false });
    if (data) setNotifications(data);
  };

  const fetchEnrolledCount = async () => {
    const { data } = await supabase
      .from('enrollments')
      .select('student_id')
      .eq('teacher_id', profile?.id);
    
    if (data) {
      setEnrolledCount(data.length);
      const ids = data.map(e => e.student_id);
      setEnrolledStudentIds(ids);
      
      // Fetch recent activity for feed
      if (ids.length > 0) {
        try {
          // session_logs table may not exist yet — wrap in try/catch
          const { data: logs } = await supabase
            .from('session_logs')
            .select('*')
            .in('student_id', ids)
            .order('created_at', { ascending: false })
            .limit(10);
          if (logs) {
            // Attach student names from profiles
            const { data: nameData } = await supabase
              .from('profiles')
              .select('id, full_name')
              .in('id', ids);
            const nameMap = {};
            (nameData || []).forEach(p => { nameMap[p.id] = p.full_name; });
            const enriched = logs.map(l => ({ ...l, student_name: nameMap[l.student_id] || 'Student' }));
            setActivityFeed(enriched);
          }
        } catch (_) { /* table doesn't exist yet */ }
      }
    }
  };

  // Grid card for 2-column layout
  const GridCard = ({ title, icon, color, onPress }) => (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient colors={[color, color + 'CC']} style={styles.gridCardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.gridIconCircle}>
          <Ionicons name={icon} size={28} color="#fff" />
        </View>
        <Text style={styles.gridCardTitle}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Full-width row card
  const RowCard = ({ title, subtitle, icon, color, onPress }) => (
    <TouchableOpacity style={styles.rowCard} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.rowIconBox, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <View style={styles.rowCardContent}>
        <Text style={styles.rowCardTitle}>{title}</Text>
        <Text style={styles.rowCardSub}>{subtitle}</Text>
      </View>
      <View style={[styles.rowChevron, { backgroundColor: color + '22' }]}>
        <Ionicons name="chevron-forward" size={18} color={color} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bgColor }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── HEADER ── */}
      <LinearGradient colors={['#f9a8c9', '#f7c5a0', '#f9b8d0']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        {/* Logo + greeting row */}
        <View style={styles.headerTop}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logoImg}
              resizeMode="contain"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.appName}>Synclexia</Text>
            <Text style={styles.greeting}>Hello, {profile?.full_name?.split(' ')[0] || 'Teacher'}! 👨‍🏫</Text>
            <Text style={styles.subGreeting}>Manage your students & activities.</Text>
          </View>
          <TouchableOpacity onPress={() => setNotifVisible(true)} style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={24} color="#7B2D52" />
            {notifications.length > 0 && <View style={styles.redDot} />}
          </TouchableOpacity>
        </View>

        {/* Stats pills */}
        <View style={styles.statsPillRow}>
          <View style={styles.statsPill}>
            <Ionicons name="ribbon-outline" size={16} color="#C06080" />
            <Text style={styles.statsPillLabel}>Level</Text>
            <Text style={styles.statsPillValue}>{xpToLevel(profile?.xp)}</Text>
          </View>
          <View style={styles.statsPillDivider} />
          <View style={styles.statsPill}>
            <Ionicons name="people-outline" size={16} color="#C06080" />
            <Text style={styles.statsPillLabel}>Students</Text>
            <Text style={[styles.statsPillValue, { color: '#C06080' }]}>{enrolledCount}</Text>
          </View>
          <View style={styles.statsPillDivider} />
          <View style={styles.statsPill}>
            <Ionicons name="star-outline" size={16} color="#C06080" />
            <Text style={styles.statsPillLabel}>XP</Text>
            <Text style={[styles.statsPillValue, { color: '#C06080' }]}>{profile?.xp || 0}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* DAILY TIP */}
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.tipBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Ionicons name="sparkles" size={18} color="#FFD700" />
          <Text style={[styles.tipText, { fontSize: theme.fontSize }]}>{dailyTip}</Text>
        </LinearGradient>

        {/* ── CLASS MANAGEMENT (2-col grid) ── */}
        <Text style={styles.sectionTitle}>Class Management</Text>
        <View style={styles.grid}>
          <GridCard title="Student List"     icon="people"      color="#4CAF50" onPress={() => navigation.navigate('TeacherUsers')} />
          <GridCard title="Assign Tasks"     icon="checkbox"    color="#2196F3" onPress={() => navigation.navigate('TeacherAssignActivities')} />
          <GridCard title="Give Rewards"     icon="star"        color="#FF9800" onPress={() => navigation.navigate('TeacherUsers')} />
          <GridCard title="Monitor Progress" icon="trending-up" color="#E91E63" onPress={() => navigation.navigate('TeacherProgress')} />
        </View>

        {/* ── CONTENT MANAGEMENT (row cards) ── */}
        <Text style={styles.sectionTitle}>Content Management</Text>
        <RowCard title="Writing Practice" subtitle="Create & manage tracing words"       icon="pencil"        color="#9C27B0" onPress={() => navigation.navigate('TeacherAddStory')} />
        <RowCard title="Phonics Audio"    subtitle="Add sounds & letters for lessons"    icon="volume-high"   color="#00BCD4" onPress={() => navigation.navigate('TeacherPhonics')} />
        <RowCard title="Spelling Words"   subtitle="Add and manage spelling word bank"   icon="text"          color="#2196F3" onPress={() => navigation.navigate('TeacherSpelling')} />
        <RowCard title="Phonics Activity" subtitle="Manage blend, rhyme & segment games" icon="musical-notes" color="#FF9800" onPress={() => navigation.navigate('TeacherPhonicsActivity')} />
        <RowCard title="Phonological"     subtitle="Manage syllable, rime & phoneme tasks" icon="ear"         color="#673AB7" onPress={() => navigation.navigate('TeacherPhonological')} />

        {/* ── COMMUNICATION & ENROLLMENT (row cards) ── */}
        <Text style={styles.sectionTitle}>Communication & Enrollment</Text>
        <RowCard title="Feedback & Replies" subtitle="Read student feedback & respond"    icon="chatbubbles" color="#E91E63" onPress={() => navigation.navigate('TeacherFeedback')} />
        <RowCard title="Announcements"      subtitle="Send notifications to students"     icon="megaphone"   color="#FF5722" onPress={() => navigation.navigate('TeacherNotifications')} />
        <RowCard title="Class QR Code"      subtitle="Generate QR code for enrollment"   icon="qr-code"     color="#009688" onPress={() => navigation.navigate('TeacherEnrollment')} />
        <RowCard title="Parent Messages"    subtitle="Chat with parents of your students" icon="mail"         color="#6A1B9A" onPress={() => navigation.navigate('TeacherMessages')} />

        {/* ── LIVE ACTIVITY FEED ── */}
        {activityFeed.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Student Activity</Text>
            {activityFeed.slice(0, 5).map((log, idx) => (
              <View key={log.id || idx} style={styles.feedItem}>
                <View style={[styles.feedDot, { backgroundColor: log.accuracy >= 80 ? '#4CAF50' : log.accuracy >= 50 ? '#FF9800' : '#F44336' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.feedName}>{log.student_name || 'Student'}</Text>
                  <Text style={styles.feedDetail}>
                    {log.activity_type} — {log.score}/{log.total} ({log.accuracy}%) {log.xp_earned ? `+${log.xp_earned} XP` : ''}
                  </Text>
                </View>
                <Text style={styles.feedTime}>
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}
            {activityFeed.length > 5 && (
              <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate('TeacherProgress')}>
                <Text style={styles.viewAllText}>View All Activity →</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* NOTIFICATIONS MODAL */}
      <Modal visible={notifVisible} transparent animationType="fade" onRequestClose={() => setNotifVisible(false)}>
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
              ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#999' }}>No notifications yet.</Text>}
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

  // ── Header ──
  header: { paddingTop: 55, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  logoWrapper: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  logoImg: { width: 46, height: 46, borderRadius: 12 },
  appName: { fontSize: 11, fontWeight: '800', color: 'rgba(100,30,60,0.6)', letterSpacing: 2, textTransform: 'uppercase' },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#7B2D52', marginTop: 1 },
  subGreeting: { color: '#9E5070', fontSize: 12, marginTop: 2 },
  iconBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: 14 },
  redDot: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF5252' },

  // Stats pills inside header
  statsPillRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: 18, paddingVertical: 12, paddingHorizontal: 10, justifyContent: 'space-around', alignItems: 'center' },
  statsPill: { alignItems: 'center', gap: 3 },
  statsPillLabel: { fontSize: 10, color: '#9E5070', fontWeight: '600', letterSpacing: 0.5 },
  statsPillValue: { fontSize: 18, fontWeight: 'bold', color: '#7B2D52' },
  statsPillDivider: { width: 1, height: 30, backgroundColor: 'rgba(180,80,120,0.2)' },

  // ── Scroll content ──
  scrollContent: { paddingHorizontal: 18, paddingTop: 20 },

  // Tip box
  tipBox: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, padding: 14, marginBottom: 24 },
  tipText: { color: '#fff', flex: 1, lineHeight: 20 },

  // Section title
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#37474F', marginBottom: 14, marginTop: 6, letterSpacing: 0.3 },

  // 2-col grid cards
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
  gridCard: { width: '48%', marginBottom: 14, borderRadius: 20, elevation: 4 },
  gridCardGradient: { borderRadius: 20, padding: 20, height: 120, justifyContent: 'space-between' },
  gridIconCircle: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  gridCardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginTop: 4 },

  // Row cards
  rowCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 18, alignItems: 'center', marginBottom: 12, elevation: 2 },
  rowIconBox: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  rowCardContent: { flex: 1 },
  rowCardTitle: { fontSize: 15, fontWeight: 'bold', color: '#263238' },
  rowCardSub: { fontSize: 12, color: '#90A4AE', marginTop: 3 },
  rowChevron: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  // Activity feed
  feedItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 16, marginBottom: 10, elevation: 1 },
  feedDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  feedName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  feedDetail: { fontSize: 12, color: '#666', marginTop: 2 },
  feedTime: { fontSize: 11, color: '#999' },
  viewAllBtn: { alignItems: 'center', paddingVertical: 12, backgroundColor: '#EEF2FF', borderRadius: 14, marginBottom: 8 },
  viewAllText: { color: '#3b5998', fontWeight: 'bold', fontSize: 14 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '88%', backgroundColor: '#fff', borderRadius: 24, padding: 24, maxHeight: '60%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333' },
  notifItem: { marginBottom: 15, borderBottomWidth: 1, borderColor: '#f0f0f0', paddingBottom: 10 },
  notifTitle: { fontWeight: 'bold', color: '#1976D2', marginBottom: 4 },
  notifBody: { color: '#555', fontSize: 13 },
  closeBtn: { backgroundColor: '#C06080', paddingVertical: 13, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  closeText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});