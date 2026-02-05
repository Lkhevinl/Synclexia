import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboardScreen({ navigation }) {
  const { signOut, profile } = useAuth();
  const [stats, setStats] = useState({ users: 0, feedback: 0, notifications: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    // Count Users
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user');
    // Count Feedback
    const { count: feedbackCount } = await supabase.from('feedback').select('*', { count: 'exact', head: true });
    // Count Posted Notifications
    const { count: notifCount } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('is_draft', false);

    setStats({ users: userCount || 0, feedback: feedbackCount || 0, notifications: notifCount || 0 });
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { fetchStats(); }, []));

  const handleLogout = () => {
    signOut(); 
    // Navigation handled by AppNavigator automatically
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} />}
    >
      <View style={styles.header}>
        <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.adminName}>{profile?.full_name || "Admin"}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
            <Ionicons name="log-out-outline" size={24} color="#D32F2F" />
        </TouchableOpacity>
      </View>

      {/* STATS ROW */}
      <View style={styles.statsRow}>
          <View style={[styles.statCard, {backgroundColor: '#E1F5FE'}]}>
              <Text style={styles.statNumber}>{stats.users}</Text>
              <Text style={styles.statLabel}>Users</Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: '#FFF9C4'}]}>
              <Text style={styles.statNumber}>{stats.feedback}</Text>
              <Text style={styles.statLabel}>Feedback</Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: '#E8F5E9'}]}>
              <Text style={styles.statNumber}>{stats.notifications}</Text>
              <Text style={styles.statLabel}>Posts</Text>
          </View>
      </View>

      <Text style={styles.sectionTitle}>Management Tools</Text>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('AdminUsers')}>
            <View style={[styles.iconBox, {backgroundColor: '#B3E5FC'}]}>
                <Ionicons name="people" size={24} color="#0277BD" />
            </View>
            <View>
                <Text style={styles.btnTitle}>Manage Users</Text>
                <Text style={styles.btnSub}>View and manage students</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" style={{marginLeft: 'auto'}} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('AdminNotifications')}>
            <View style={[styles.iconBox, {backgroundColor: '#FFF59D'}]}>
                <Ionicons name="megaphone" size={24} color="#F57F17" />
            </View>
            <View>
                <Text style={styles.btnTitle}>Announcements</Text>
                <Text style={styles.btnSub}>Post updates to dashboard</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" style={{marginLeft: 'auto'}} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('AdminFeedback')}>
            <View style={[styles.iconBox, {backgroundColor: '#C8E6C9'}]}>
                <Ionicons name="chatbubbles" size={24} color="#2E7D32" />
            </View>
            <View>
                <Text style={styles.btnTitle}>User Feedback</Text>
                <Text style={styles.btnSub}>Read and reply to messages</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" style={{marginLeft: 'auto'}} />
        </TouchableOpacity>

        {/* NEW BUTTON: ADD STORY */}
        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('AdminAddStory')}>
            <View style={[styles.iconBox, {backgroundColor: '#E1BEE7'}]}>
                <Ionicons name="book" size={24} color="#8E24AA" />
            </View>
            <View>
                <Text style={styles.btnTitle}>Story Creator</Text>
                <Text style={styles.btnSub}>Write new books for students</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" style={{marginLeft: 'auto'}} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  welcomeText: { color: '#666', fontSize: 14 },
  adminName: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  logoutIcon: { padding: 10, backgroundColor: '#FFEBEE', borderRadius: 12 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statCard: { width: '31%', padding: 15, borderRadius: 15, alignItems: 'center', elevation: 2 },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 5 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  menuContainer: { gap: 15 },
  menuBtn: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderRadius: 15, borderWidth: 1, borderColor: '#eee', elevation: 2 },
  iconBox: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  btnTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  btnSub: { fontSize: 12, color: '#888' }
});