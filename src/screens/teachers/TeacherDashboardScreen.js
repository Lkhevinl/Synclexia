import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

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

  const TeacherCard = ({ title, subtitle, icon, color, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconBox, { backgroundColor: color }]}>
        <Ionicons name={icon} size={32} color="#fff" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#CFD8DC" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bgColor }]}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello, {profile?.full_name?.split(' ')[0] || "Teacher"}! 👨‍🏫</Text>
            <Text style={styles.subGreeting}>Manage your students & activities.</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => setNotifVisible(true)} style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {notifications.length > 0 && <View style={styles.redDot} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* STATS BAR */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>LEVEL</Text>
            <Text style={styles.statValue}>{Math.floor((profile?.xp || 0) / 100) + 1}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>STUDENTS</Text>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>{enrolledCount}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={{ height: 40 }} />

        {/* DAILY TIP */}
        <View style={styles.tipBox}>
          <Ionicons name="sparkles" size={20} color="#FFD700" style={{ marginRight: 10 }} />
          <Text style={[styles.tipText, { fontSize: theme.fontSize }]}>{dailyTip}</Text>
        </View>

        <Text style={[styles.sectionTitle, { fontSize: theme.fontSize + 4 }]}>Class Management</Text>

        {/* ✅ FIXED NAVIGATION NAMES BELOW */}
        <TeacherCard
          title="Student List"
          subtitle="View all your enrolled students"
          icon="people"
          color="#4CAF50"
          onPress={() => navigation.push('TeacherUsers')} // Fixed: AdminUsers -> TeacherUsers
        />

        <TeacherCard
          title="Assign Activities"
          subtitle="Give learning tasks to students"
          icon="checkbox"
          color="#2196F3"
          onPress={() => navigation.push('TeacherAssignActivities')} // Fixed: AdminAssignActivities -> TeacherAssignActivities
        />

        <TeacherCard
          title="Give Rewards"
          subtitle="Award coins & XP to students"
          icon="star"
          color="#FFD700"
          onPress={() => navigation.push('TeacherUsers')} // Fixed: AdminUsers -> TeacherUsers
        />

        <TeacherCard
          title="Monitor Progress"
          subtitle="Track student comprehension & XP"
          icon="trending-up"
          color="#FF9800"
          onPress={() => navigation.push('TeacherProgress')}
        />

        <Text style={[styles.sectionTitle, { fontSize: theme.fontSize + 4 }]}>Content Management</Text>

        <TeacherCard
          title="Writing Practice"
          subtitle="Create & manage tracing words"
          icon="pencil"
          color="#9C27B0"
          onPress={() => navigation.push('TeacherAddStory')} // Fixed: AdminAddStory -> TeacherAddStory
        />

        <TeacherCard
          title="Phonics Audio"
          subtitle="Add sounds & letters for lessons"
          icon="volume-high"
          color="#00BCD4"
          onPress={() => navigation.push('TeacherPhonics')} // Fixed: AdminPhonics -> TeacherPhonics
        />

        <TeacherCard
          title="Spelling Words"
          subtitle="Add and manage spelling word bank"
          icon="text"
          color="#2196F3"
          onPress={() => navigation.push('TeacherSpelling')}
        />

        <TeacherCard
          title="Phonics Activity"
          subtitle="Manage blend, rhyme & segment games"
          icon="musical-notes"
          color="#FF9800"
          onPress={() => navigation.push('TeacherPhonicsActivity')}
        />

        <TeacherCard
          title="Phonological"
          subtitle="Manage syllable, rime & phoneme tasks"
          icon="ear"
          color="#9C27B0"
          onPress={() => navigation.push('TeacherPhonological')}
        />

        <Text style={[styles.sectionTitle, { fontSize: theme.fontSize + 4 }]}>Communication</Text>

        <TeacherCard
          title="Feedback & Replies"
          subtitle="Read student feedback & respond"
          icon="chatbubbles"
          color="#E91E63"
          onPress={() => navigation.push('TeacherFeedback')} // Fixed: AdminFeedback -> TeacherFeedback
        />

        <TeacherCard
          title="Announcements"
          subtitle="Send notifications to students"
          icon="megaphone"
          color="#FF5722"
          onPress={() => navigation.push('TeacherNotifications')} // Fixed: AdminNotifications -> TeacherNotifications
        />

        <Text style={[styles.sectionTitle, { fontSize: theme.fontSize + 4 }]}>Enrollment</Text>

        <TeacherCard
          title="Class Code"
          subtitle="Generate QR code for students"
          icon="qr-code"
          color="#009688"
          onPress={() => navigation.push('TeacherEnrollment')}
        />

        {/* LIVE ACTIVITY FEED */}
        {activityFeed.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { fontSize: theme.fontSize + 4 }]}>Recent Student Activity</Text>
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
              <TouchableOpacity 
                style={{ alignItems: 'center', paddingVertical: 10 }}
                onPress={() => navigation.push('TeacherProgress')}
              >
                <Text style={{ color: '#3b5998', fontWeight: 'bold' }}>View All Activity →</Text>
              </TouchableOpacity>
            )}
          </>
        )}

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
  header: { paddingTop: 80, paddingBottom: 50, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subGreeting: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  headerIcons: { flexDirection: 'row', gap: 15 },
  iconBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  redDot: { position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF5252' },

  statsContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, paddingVertical: 15, paddingHorizontal: 20, position: 'absolute', bottom: -30, left: 20, right: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 10, fontWeight: 'bold', color: '#90A4AE', letterSpacing: 1 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  divider: { width: 1, height: 25, backgroundColor: '#ECEFF1' },

  scrollContent: { paddingTop: 20, paddingHorizontal: 20 },
  tipBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#333', borderRadius: 15, padding: 15, marginBottom: 25 },
  tipText: { color: '#fff', flex: 1, lineHeight: 20 },
  sectionTitle: { fontWeight: 'bold', color: '#37474F', marginBottom: 15, marginLeft: 5 },

  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 15, elevation: 2 },
  iconBox: { width: 60, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#37474F' },
  cardSub: { fontSize: 13, color: '#90A4AE', marginTop: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 25, maxHeight: '60%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333' },
  notifItem: { marginBottom: 15, borderBottomWidth: 1, borderColor: '#f0f0f0', paddingBottom: 10 },
  notifTitle: { fontWeight: 'bold', color: '#1976D2', marginBottom: 4 },
  notifBody: { color: '#555', fontSize: 13 },
  closeBtn: { backgroundColor: '#333', paddingVertical: 12, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  closeText: { color: '#fff', fontWeight: 'bold' },

  // Activity Feed
  feedItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 15, marginBottom: 10, elevation: 1 },
  feedDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  feedName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  feedDetail: { fontSize: 12, color: '#666', marginTop: 2 },
  feedTime: { fontSize: 11, color: '#999' },
});