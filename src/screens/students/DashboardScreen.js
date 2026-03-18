import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList, StatusBar, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient'; 
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext'; 
import { supabase } from '../../lib/supabase';
import { xpToLevel } from '../../lib/userUtils';
import Sidebar from '../../components/Sidebar';

const DAILY_TIPS = [
  "Tip: Reading out loud helps you remember better!",
  "Fact: 'A' is the most common letter used in English.",
  "Goal: Try to earn 50 XP today!",
  "Tip: Take a break if your eyes get tired.",
  "Fun: Can you complete all quests this week?"
];

export default function DashboardScreen({ navigation }) {
  const { theme, a11yTextStyle } = useTheme();
  const { profile, fetchProfile } = useAuth();

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
    <View style={[styles.mainContainer, { backgroundColor: theme.bgColor }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      
      {/* HEADER */}
      <LinearGradient
        colors={['#f9a8c9', '#f7c5a0', '#f9b8d0']}
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

      {/* STATS BAR */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>LEVEL</Text>
          <Text style={styles.statValue}>{xpToLevel(profile?.xp)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>XP</Text>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>{profile?.xp || 0}</Text>
        </View>
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* PARENT LINK CODE */}
        {isStudent && (
          <View style={styles.linkCodeCard}>
            <View style={styles.linkCodeLeft}>
              <Ionicons name="people" size={22} color="#7B1FA2" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.linkCodeLabel}>Parent Link Code</Text>
                <Text style={styles.linkCodeHint}>Share this with your parent</Text>
              </View>
            </View>
            <Text style={styles.linkCodeValue}>{profile?.unique_code ?? '...'}</Text>
          </View>
        )}

        {/* DAILY TIP */}
        <View style={styles.tipBox}>
          <Ionicons name="sparkles" size={20} color="#FFD700" style={{ marginRight: 10 }} />
          <Text style={[styles.tipText, { fontSize: theme.fontSize }, a11yTextStyle]}>{dailyTip}</Text>
        </View>

        <Text style={[styles.sectionTitle, { fontSize: theme.fontSize + 4 }, a11yTextStyle]}>Learning Tools</Text>
        
        {/* MENU GRID */}
        <View style={styles.grid}>
          <MenuCard title="Phonics"     icon="🗣️" color="#FF9800" route="Phonics"               activityType="phonics" />
          <MenuCard title="Writing"     icon="✍️" color="#4CAF50" route="Writing"               activityType="writing" />
          <MenuCard title="Reading"     icon="📖" color="#2196F3" route="Reading"               activityType="reading" />
          <MenuCard title="Spelling"    icon="🔤" color="#E91E63" route="Spelling"              activityType="spelling" />
          <MenuCard title="Activities"  icon="🎮" color="#00897B" route="PhonicsActivity"       activityType="phonics_activity" />
          <MenuCard title="Awareness"   icon="🎧" color="#6A1B9A" route="PhonologicalAwareness" activityType="phonological_awareness" />
        </View>

        <Text style={[styles.sectionTitle, { fontSize: theme.fontSize + 4 }, a11yTextStyle]}>Gamification</Text>
        <View style={styles.grid}>
          <MenuCard title="Quests" icon="📜" color="#F44336" route="Quests" badge={true} />
          <MenuCard title="Top 10" icon="🏆" color="#FFC107" route="Leaderboard" />
        </View>

        <View style={{ height: 20 }} /> 
      </ScrollView>

      {/* NOTIFICATIONS MODAL */}
      <Modal visible={notifVisible} transparent={true} animationType="fade" onRequestClose={() => setNotifVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notifications 🔔</Text>
            {unreadReplyCount > 0 && (
              <TouchableOpacity 
                style={{ backgroundColor: '#E8F5E9', padding: 12, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}
                onPress={() => { setNotifVisible(false); navigation.navigate('Support'); }}
              >
                <Ionicons name="chatbubble-ellipses" size={20} color="#4CAF50" />
                <Text style={{ marginLeft: 8, color: '#2E7D32', fontWeight: 'bold', flex: 1 }}>
                  {unreadReplyCount} new feedback {unreadReplyCount === 1 ? 'reply' : 'replies'}!
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#4CAF50" />
              </TouchableOpacity>
            )}
            <FlatList
              data={notifications}
              keyExtractor={i => i.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.notifItem}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.notifBody}>{item.content}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#999' }}>No new alerts.</Text>}
            />
            <TouchableOpacity onPress={() => setNotifVisible(false)} style={styles.closeBtn}>
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
  mainContainer: { flex: 1 }, 

  linkCodeCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#EDE7F6', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 1 },
  linkCodeLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  linkCodeLabel: { fontSize: 13, fontWeight: 'bold', color: '#7B1FA2' },
  linkCodeHint: { fontSize: 11, color: '#9C6DB5', marginTop: 1 },
  linkCodeValue: { fontSize: 22, fontWeight: '900', color: '#7B1FA2', letterSpacing: 4 },

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
  
  statsContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, paddingVertical: 15, paddingHorizontal: 20, marginHorizontal: 20, marginTop: -35, marginBottom: 25, elevation: 5, justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 10, fontWeight: 'bold', color: '#90A4AE', letterSpacing: 1 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  divider: { width: 1, height: 25, backgroundColor: '#ECEFF1' },

  scrollContent: { paddingTop: 20, paddingHorizontal: 20 },
  tipBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#333', borderRadius: 15, padding: 15, marginBottom: 25 },
  tipText: { color: '#fff', flex: 1, lineHeight: 20 },
  sectionTitle: { fontWeight: 'bold', color: '#37474F', marginBottom: 15, marginLeft: 5 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  cardContainer: { width: '48%', marginBottom: 15, borderRadius: 20, elevation: 5 },
  cardGradient: { padding: 20, borderRadius: 20, height: 140, justifyContent: 'center', alignItems: 'center' },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginTop: 5 },
  badge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#FF5252', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 25, maxHeight: '60%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333' },
  notifItem: { marginBottom: 15, borderBottomWidth: 1, borderColor: '#f0f0f0', paddingBottom: 10 },
  notifTitle: { fontWeight: 'bold', color: '#1976D2', marginBottom: 4 },
  notifBody: { color: '#555', fontSize: 13 },
  closeBtn: { backgroundColor: '#333', paddingVertical: 12, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  closeText: { color: '#fff', fontWeight: 'bold' }
});
