import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import GoBackBtn from '../../components/GoBackBtn';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const DAILY_TIPS = [
  "Tip: Engage your students with interactive lessons!",
  "Tip: Monitor student progress regularly.",
  "Tip: Provide timely feedback to students.",
  "Tip: Create diverse learning activities."
];

export default function AdminDashboardScreen({ navigation }) {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notifVisible, setNotifVisible] = useState(false);
  const [dailyTip, setDailyTip] = useState(DAILY_TIPS[0]);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchStudentCount();
    const randomTip = DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
    setDailyTip(randomTip);
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase.from('notifications').select('*').eq('is_draft', false).order('created_at', {ascending: false});
    if (data) setNotifications(data);
  };

  const fetchStudentCount = async () => {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');
    setStudentCount(count || 0);
  };

  const AdminCard = ({ title, subtitle, icon, color, onPress }) => (
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
            <Text style={styles.greeting}>Hello, {profile?.full_name?.split(' ')[0] || 'Admin'}! 🧑‍🏫</Text>
            <Text style={styles.subGreeting}>Manage your students & activities.</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => setNotifVisible(true)} style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {notifications.length > 0 && <View style={styles.redDot} />}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* STATS BAR - floats out of header */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>LEVEL</Text>
          <Text style={styles.statValue}>{Math.floor((profile?.xp || 0)/100) + 1}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>STUDENTS</Text>
          <Text style={[styles.statValue, {color: '#4CAF50'}]}>{studentCount}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* DAILY TIP */}
        <View style={styles.tipBox}>
          <Ionicons name="sparkles" size={20} color="#FFD700" style={{marginRight: 10}} />
          <Text style={[styles.tipText, { fontSize: theme.fontSize }]}>{dailyTip}</Text>
        </View>

        <Text style={[styles.sectionTitle, { fontSize: theme.fontSize + 4 }]}>Student Management</Text>
        
        <AdminCard 
          title="Writing Practice" 
          subtitle="Add or delete tracing words"
          icon="pencil" 
          color="#FF9800"
          onPress={() => navigation.navigate('AdminAddStory')}
        />

        <AdminCard 
          title="Phonics Audio" 
          subtitle="Manage sounds and letters"
          icon="volume-high" 
          color="#2196F3"
          onPress={() => navigation.navigate('AdminPhonics')} 
        />

        <AdminCard 
          title="Student List" 
          subtitle="View progress and XP"
          icon="people" 
          color="#4CAF50"
          onPress={() => navigation.navigate('AdminUsers')} 
        />

        <AdminCard 
          title="Give Rewards" 
          subtitle="Award coins & XP to students"
          icon="star" 
          color="#FFD700"
          onPress={() => navigation.navigate('AdminUsers')} 
        />

        <AdminCard 
          title="Assign Activities" 
          subtitle="Give learning tasks to students"
          icon="checkbox" 
          color="#4CAF50"
          onPress={() => navigation.navigate('AdminUsers')} 
        />

        <AdminCard 
          title="Monitor Progress" 
          subtitle="Track student comprehension"
          icon="trending-up" 
          color="#2196F3"
          onPress={() => navigation.navigate('AdminUsers')} 
        />

        <AdminCard 
          title="Feedback" 
          subtitle="Read and reply to users"
          icon="chatbubbles" 
          color="#9C27B0"
          onPress={() => navigation.navigate('AdminFeedback')} 
        />

        <AdminCard 
          title="Notifications" 
          subtitle="Send announcements"
          icon="megaphone" 
          color="#FF5722"
          onPress={() => navigation.navigate('AdminNotifications')} 
        />

        <AdminCard 
          title="Enrollment" 
          subtitle="Manage student enrollments"
          icon="qr-code" 
          color="#009688"
          onPress={() => navigation.navigate('AdminEnrollment')} 
        />

        <AdminCard 
          title="Parent Links" 
          subtitle="Link parents to students"
          icon="people-circle" 
          color="#6A1B9A"
          onPress={() => navigation.navigate('AdminParentLinks')} 
        />

        <Text style={[styles.sectionTitle, { fontSize: theme.fontSize + 4 }]}>Content Management</Text>

        <AdminCard
          title="Spelling Words"
          subtitle="Add and manage spelling word bank"
          icon="text"
          color="#2196F3"
          onPress={() => navigation.navigate('AdminSpelling')}
        />

        <AdminCard
          title="Phonics Activity"
          subtitle="Manage blend, rhyme & segment games"
          icon="musical-notes"
          color="#FF9800"
          onPress={() => navigation.navigate('AdminPhonicsActivity')}
        />

        <AdminCard
          title="Phonological"
          subtitle="Manage syllable, rime & phoneme tasks"
          icon="ear"
          color="#9C27B0"
          onPress={() => navigation.navigate('AdminPhonological')}
        />

        <View style={{height: 20}} /> 
      </ScrollView>

      {/* NOTIFICATIONS MODAL */}
      <Modal visible={notifVisible} transparent={true} animationType="fade" onRequestClose={() => setNotifVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notifications 🔔</Text>
            <FlatList
              data={notifications}
              keyExtractor={i => i.id.toString()}
              renderItem={({item}) => (
                <View style={styles.notifItem}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.notifBody}>{item.content}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={{textAlign:'center', color:'#999'}}>No notifications</Text>}
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

  statsContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, paddingVertical: 15, paddingHorizontal: 20, marginHorizontal: 20, marginTop: -30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 8, justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 10, fontWeight: 'bold', color: '#90A4AE', letterSpacing: 1 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  divider: { width: 1, height: 25, backgroundColor: '#ECEFF1' },

  scrollContent: { paddingTop: 30, paddingHorizontal: 20 },
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
  closeText: { color: '#fff', fontWeight: 'bold' }
});