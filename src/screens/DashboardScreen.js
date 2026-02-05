import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext'; 
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar'; 

const DAILY_TIPS = [
  "Tip: Reading out loud helps you remember better!",
  "Fact: 'A' is the most common letter used in English.",
  "Goal: Try to earn 50 XP today!",
  "Tip: Take a break if your eyes get tired."
];

export default function DashboardScreen({ navigation }) {
  const { theme } = useTheme(); 
  const { profile } = useAuth(); 
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dailyTip, setDailyTip] = useState(DAILY_TIPS[0]);

  useEffect(() => {
    fetchNotifications();
    const randomTip = DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
    setDailyTip(randomTip);
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase.from('notifications').select('*').eq('is_draft', false).order('created_at', {ascending: false});
    if (data) setNotifications(data);
  };

  // NEW: Handle clicking a message
  const openNotification = (item) => {
    Alert.alert(
      item.title,
      item.content,
      [{ text: "Close", style: "cancel" }]
    );
  };

  const globalFont = theme.fontStyle === 'System' ? undefined : theme.fontStyle;

  return (
    <View style={[styles.dashboardContainer, { backgroundColor: theme.bgColor }]}>
      
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.logoText}>SYNCLEXIA</Text>
        <View style={{flexDirection:'row', gap: 15}}>
            <TouchableOpacity onPress={() => setNotifVisible(true)}>
                <Ionicons name="notifications" size={28} color="#333" />
                {notifications.length > 0 && <View style={styles.redDot} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <Ionicons name="menu" size={32} color="#333" />
            </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{paddingBottom: 50}} showsVerticalScrollIndicator={false}>
          {/* WELCOME */}
          <View style={styles.welcomeCard}>
              <Text style={[styles.welcomeTitle, {fontSize: theme.fontSize + 8, fontFamily: globalFont}]}>
                  Hello {profile?.full_name || "Learner"}
              </Text>
              <Text style={[styles.welcomeSub, {fontFamily: globalFont}]}>Welcome back!</Text>
          </View>

          {/* TIP CARD */}
          <View style={styles.tipCard}>
              <Ionicons name="bulb" size={20} color="#F57F17" style={{marginRight: 10}} />
              <Text style={styles.tipText}>{dailyTip}</Text>
          </View>

          {/* PROGRESS */}
          <View style={styles.progressCard}>
              <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom: 5}}>
                <Text style={styles.progressLabel}>Current Level</Text>
                <Text style={styles.progressLabel}>{profile?.xp || 0} XP</Text>
              </View>
              <View style={styles.barBg}>
                  <View style={[styles.barFill, {width: `${(profile?.xp % 100) || 0}%`}]} />
              </View>
              <Text style={styles.lvlText}>Lvl {Math.floor((profile?.xp || 0)/100) + 1}</Text>
          </View>

          {/* BIG BUTTONS */}
          <View style={styles.grid}>
              <TouchableOpacity style={[styles.card, {backgroundColor: '#FFECB3'}]} onPress={() => navigation.navigate('Phonics')}>
                  <Text style={{fontSize: 40}}>🗣️</Text>
                  <Text style={[styles.cardTitle, {fontFamily: globalFont}]}>Phonics</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.card, {backgroundColor: '#C8E6C9'}]} onPress={() => navigation.navigate('Writing')}>
                  <Text style={{fontSize: 40}}>✍️</Text>
                  <Text style={[styles.cardTitle, {fontFamily: globalFont}]}>Writing</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.card, {backgroundColor: '#BBDEFB'}]} onPress={() => navigation.navigate('Reading')}>
                  <Text style={{fontSize: 40}}>📖</Text>
                  <Text style={[styles.cardTitle, {fontFamily: globalFont}]}>Reading</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.card, {backgroundColor: '#E1BEE7'}]} onPress={() => navigation.navigate('Scan')}>
                  <Text style={{fontSize: 40}}>📷</Text>
                  <Text style={[styles.cardTitle, {fontFamily: globalFont}]}>Scan</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.card, {backgroundColor: '#FFF176'}]} onPress={() => navigation.navigate('Leaderboard')}>
                  <Text style={{fontSize: 40}}>🏆</Text>
                  <Text style={[styles.cardTitle, {fontFamily: globalFont}]}>Top 10</Text>
              </TouchableOpacity>

              {/* QUEST BUTTON */}
              <TouchableOpacity style={[styles.card, {backgroundColor: '#FFCCBC'}]} onPress={() => navigation.navigate('Quests')}>
                  <Text style={{fontSize: 40}}>📜</Text>
                  <Text style={[styles.cardTitle, {fontFamily: globalFont}]}>Quests</Text>
                  <View style={styles.questBadge}>
                      <Text style={{color:'#fff', fontWeight:'bold', fontSize:10}}>!</Text>
                  </View>
              </TouchableOpacity>
          </View>
      </ScrollView>

      {/* REUSABLE SIDEBAR COMPONENT */}
      <Sidebar visible={menuVisible} onClose={() => setMenuVisible(false)} />

      {/* --- FIXED NOTIFICATIONS MODAL --- */}
      <Modal visible={notifVisible} transparent={true} animationType="fade" onRequestClose={() => setNotifVisible(false)}>
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                     <Text style={styles.modalTitle}>📢 Inbox</Text>
                     <TouchableOpacity onPress={() => setNotifVisible(false)}>
                        <Ionicons name="close-circle" size={24} color="#666" />
                     </TouchableOpacity>
                  </View>
                  
                  <FlatList
                    data={notifications}
                    keyExtractor={i => i.id.toString()}
                    ListEmptyComponent={<Text style={{textAlign:'center', color:'#999', marginTop: 20}}>No new messages.</Text>}
                    renderItem={({item}) => (
                        <TouchableOpacity style={styles.notifItem} onPress={() => openNotification(item)}>
                            <View style={styles.notifIcon}>
                                <Ionicons name="mail" size={20} color="#fff" />
                            </View>
                            <View style={{flex: 1}}>
                                <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
                                <Text style={styles.notifPreview} numberOfLines={1}>{item.content}</Text>
                                <Text style={styles.tapToRead}>Tap to read</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                  />
              </View>
          </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  dashboardContainer: { flex: 1, paddingTop: 50, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logoText: { fontSize: 20, fontWeight: 'bold', color: '#5C6BC0', letterSpacing: 1 },
  redDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'red', position: 'absolute', right: 0, top: 0 },
  welcomeCard: { backgroundColor: '#FFF59D', padding: 20, borderRadius: 15, marginBottom: 15 },
  welcomeTitle: { fontWeight: 'bold', color: '#333' },
  welcomeSub: { color: '#555' },
  
  tipCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#FFE0B2' },
  tipText: { color: '#E65100', fontSize: 13, fontStyle: 'italic' },

  progressCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 20, elevation: 2 },
  progressLabel: { fontWeight: 'bold', color: '#666' },
  barBg: { height: 10, backgroundColor: '#f0f0f0', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#4CAF50' },
  lvlText: { textAlign: 'center', marginTop: 5, fontWeight: 'bold', color: '#333' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15 },
  card: { width: '47%', aspectRatio: 1, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  cardTitle: { fontWeight: 'bold', marginTop: 10, fontSize: 16 },
  
  // MODAL STYLES (New & Improved)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 20, maxHeight: '60%', elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  
  notifItem: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#F5F5F5', padding: 12, borderRadius: 12, alignItems: 'center' },
  notifIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#5C6BC0', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  notifTitle: { fontWeight: 'bold', color: '#333', fontSize: 16 },
  notifPreview: { color: '#666', fontSize: 12 },
  tapToRead: { color: '#5C6BC0', fontSize: 10, marginTop: 2, fontWeight: 'bold' },

  questBadge: { position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 10, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fff' }
});