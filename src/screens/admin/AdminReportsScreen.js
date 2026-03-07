import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl, Share, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import GoBackBtn from '../../components/GoBackBtn';
import EmptyState from '../../components/EmptyState';

export default function AdminReportsScreen() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRole, setSelectedRole] = useState('all');
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => { fetchUsers(selectedRole); }, []);

  const fetchUsers = async (role = selectedRole) => {
    setRefreshing(true);
    let query = supabase.from('profiles').select('*');
    if (role !== 'all') {
      query = query.eq('role', role);
    }
    const { data } = await query.order('full_name', { ascending: true });
    if (data) {
      setUsers(data);
      setFilteredUsers(data);
    }
    setRefreshing(false);
  };

  const fetchUserActivity = async (userId) => {
    setLoadingLogs(true);
    // session_logs may use student_id (for students) or user_id (legacy) — try both
    const [{ data: byStudent }, { data: byUser }] = await Promise.all([
      supabase.from('session_logs').select('*').eq('student_id', userId)
        .order('created_at', { ascending: false }).limit(50),
      supabase.from('session_logs').select('*').eq('user_id', userId)
        .order('created_at', { ascending: false }).limit(50),
    ]);
    // Merge & deduplicate by id
    const merged = [...(byStudent || []), ...(byUser || [])];
    const seen = new Set();
    const unique = merged.filter(l => {
      if (seen.has(l.id)) return false;
      seen.add(l.id);
      return true;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 50);
    setActivityLogs(unique);
    setLoadingLogs(false);
  };

  const exportReport = async () => {
    try {
      const reportData = users.map(u => ({
        name: u.full_name || 'Unknown',
        email: u.email || '',
        role: u.role || 'user',
        xp: u.xp || 0,
        level: Math.floor((u.xp || 0) / 100) + 1,
        status: u.is_banned ? 'Banned' : 'Active',
        joined: new Date(u.created_at).toLocaleDateString()
      }));

      const csvContent = [
        ['Name', 'Email', 'Role', 'XP', 'Level', 'Status', 'Joined Date'],
        ...reportData.map(r => [r.name, r.email, r.role, r.xp, r.level, r.status, r.joined])
      ].map(row => row.join(',')).join('\n');

      await Share.share({
        message: csvContent,
        title: 'User Activity Report'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export report');
    }
  };

  const filterByRole = (role) => {
    setSelectedRole(role);
    fetchUsers(role);
  };

  const showUserDetails = (user) => {
    setSelectedUser(user);
    fetchUserActivity(user.id);
  };

  return (
    <View style={styles.container}>
      <View style={{flexDirection:'row', alignItems:'center', marginBottom:15}}>
        <GoBackBtn />
        <Text style={styles.headerTitle}>Reports & Analytics</Text>
      </View>

      {/* FILTERS */}
      <View style={styles.filterContainer}>
        {['all', 'student', 'teacher', 'parent'].map(role => (
          <TouchableOpacity 
            key={role}
            style={[styles.filterBtn, selectedRole === role && styles.filterBtnActive]}
            onPress={() => filterByRole(role)}
          >
            <Text style={[styles.filterText, selectedRole === role && styles.filterTextActive]}>
              {role === 'all' ? 'All' : role}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* STATS SUMMARY */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{filteredUsers.length}</Text>
          <Text style={styles.statLabel}>Users</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {filteredUsers.reduce((sum, u) => sum + (u.xp || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {filteredUsers.filter(u => u.is_banned).length}
          </Text>
          <Text style={styles.statLabel}>Banned</Text>
        </View>
      </View>

      {/* EXPORT BUTTON */}
      <TouchableOpacity style={styles.exportBtn} onPress={exportReport}>
        <Ionicons name="download-outline" size={20} color="#fff" />
        <Text style={styles.exportBtnText}>Export Report (CSV)</Text>
      </TouchableOpacity>

      {/* USER LIST */}
      <FlatList 
        data={filteredUsers}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchUsers} />}
        ListEmptyComponent={<EmptyState icon="people" message="No users found" />}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.userCard} onPress={() => showUserDetails(item)}>
            <View style={styles.userInfo}>
              <View style={[styles.roleBadge, {backgroundColor: getRoleColor(item.role)}]}>
                <Text style={styles.roleBadgeText}>{item.role?.[0]?.toUpperCase() || 'U'}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.userName}>{item.full_name || 'Unknown'}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
              </View>
            </View>
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.floor((item.xp || 0)/100) + 1}</Text>
                <Text style={styles.statTitle}>Lvl</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* ACTIVITY LOGS MODAL */}
      {selectedUser && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedUser.full_name}'s Activity</Text>
              <TouchableOpacity onPress={() => setSelectedUser(null)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {loadingLogs ? (
              <ActivityIndicator size="large" color="#0288D1" />
            ) : activityLogs.length === 0 ? (
              <Text style={{textAlign: 'center', color: '#999', padding: 20}}>
                No activity logs found for this user
              </Text>
            ) : (
              <FlatList
                data={activityLogs}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                  <View style={styles.logItem}>
                    <View style={styles.logHeader}>
                      <Text style={styles.logType}>{item.activity_type}</Text>
                      <Text style={styles.logDate}>
                        {new Date(item.created_at).toLocaleString()}
                      </Text>
                    </View>
                    <Text style={styles.logDetail}>
                      {item.details ? JSON.stringify(item.details) : 'No details'}
                    </Text>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const getRoleColor = (role) => {
  switch(role) {
    case 'admin': return '#9C27B0';
    case 'teacher': return '#2196F3';
    case 'parent': return '#FF9800';
    case 'student': return '#4CAF50';
    default: return '#757575';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#F5F5F5' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginLeft: 15 },
  
  filterContainer: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#fff' },
  filterBtnActive: { backgroundColor: '#0288D1' },
  filterText: { color: '#666', fontSize: 12 },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },
  
  statsContainer: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  statBox: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 12, alignItems: 'center', elevation: 2 },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#0288D1' },
  statLabel: { fontSize: 11, color: '#666', marginTop: 4 },
  
  exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4CAF50', padding: 12, borderRadius: 10, marginBottom: 15, gap: 8 },
  exportBtnText: { color: '#fff', fontWeight: 'bold' },
  
  userCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 1 },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  roleBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  roleBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  userName: { fontWeight: 'bold', color: '#333', fontSize: 15 },
  userEmail: { fontSize: 12, color: '#666' },
  userStats: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 10, borderTopWidth: 1, borderColor: '#f0f0f0' },
  statItem: { alignItems: 'center' },
  statValue: { fontWeight: 'bold', color: '#0288D1', fontSize: 16 },
  statTitle: { fontSize: 10, color: '#999' },
  
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  logItem: { padding: 12, backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 8 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  logType: { fontWeight: 'bold', color: '#0288D1', textTransform: 'capitalize' },
  logDate: { fontSize: 10, color: '#999' },
  logDetail: { fontSize: 11, color: '#666' }
});
