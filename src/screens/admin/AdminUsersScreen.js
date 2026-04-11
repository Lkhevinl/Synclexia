import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl, TextInput, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';

export default function AdminUsersScreen({ route }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: '', email: '', role: 'student' });
  const initialTab = (route?.params?.filterRole === 'parent') ? 'parent' : 'student';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab when navigating here from dashboard with a different filterRole
  useEffect(() => {
    if (route?.params?.filterRole) {
      setActiveTab(route.params.filterRole === 'parent' ? 'parent' : 'student');
    }
  }, [route?.params?.filterRole]);

  useEffect(() => { fetchUsers(); }, []);

  // Search + tab filter
  useEffect(() => {
    let base = users;
    if (activeTab === 'student') base = users.filter(u => u.role === 'student' || u.role === 'user');
    else if (activeTab === 'parent') base = users.filter(u => u.role === 'parent');
    if (search.trim() !== '') {
      const lowerSearch = search.toLowerCase();
      base = base.filter(u =>
        (u.full_name && u.full_name.toLowerCase().includes(lowerSearch)) ||
        (u.email && u.email.toLowerCase().includes(lowerSearch))
      );
    }
    setFilteredUsers(base);
  }, [search, users, activeTab]);

  const fetchUsers = async () => {
    setRefreshing(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['student', 'user', 'parent', 'admin'])
      .order('full_name', { ascending: true });
    if (error) {
      Alert.alert('Load Error', `Could not load users.\n\n${error.message}`);
      setUsers([]);
    } else {
      setUsers(data ?? []);
      // Do NOT call setFilteredUsers here — the filter useEffect handles it
    }
    setRefreshing(false);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name || '',
      email: user.email || '',
      role: user.role || 'student',
    });
    setEditModalVisible(true);
  };

  const saveUserEdit = async () => {
    if (!selectedUser) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editForm.full_name,
        email: editForm.email,
        role: editForm.role,
      })
      .eq('id', selectedUser.id);
    
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "User updated successfully");
      setEditModalVisible(false);
      fetchUsers();
    }
  };

  const deleteUser = (id) => {
    Alert.alert("Ban User", "This will block their access. Continue?", [
        { text: "Cancel" },
        { text: "Ban", style: 'destructive', onPress: async () => {
             await supabase.from('profiles').update({ is_banned: true }).eq('id', id);
             Alert.alert("Info", "User banned successfully.");
             fetchUsers();
        }}
    ]);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="User Management"
        subtitle="Students · Parents"
        colors={['#4c669f', '#192f6a']}
      />
      <View style={styles.innerContent}>

      {/* TABS */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'student' && styles.tabActive]}
          onPress={() => setActiveTab('student')}
        >
          <Text style={[styles.tabText, activeTab === 'student' && styles.tabTextActive]}>Students</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'parent' && styles.tabActive]}
          onPress={() => setActiveTab('parent')}
        >
          <Text style={[styles.tabText, activeTab === 'parent' && styles.tabTextActive]}>Parents</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#666" style={{marginRight: 10}} />
          <TextInput 
            placeholder="Search by name or email..." 
            value={search} 
            onChangeText={setSearch} 
            style={{flex: 1}} 
          />
          {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
          )}
      </View>

      {/* HEADER ROW */}
      <View style={styles.tableHeader}>
          <Text style={[styles.col, {flex: 2}]}>Name</Text>
          <Text style={[styles.col, {flex: 3}]}>Email</Text>
          <Text style={[styles.col, {flex: 1, textAlign: 'center'}]}>Lvl</Text>
          <Text style={[styles.col, {flex: 1, textAlign: 'right'}]}>Action</Text>
      </View>

      <FlatList 
        data={filteredUsers}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchUsers} />}
        ListEmptyComponent={<EmptyState icon="people" message={search ? "No user found." : `No ${activeTab + 's'} registered yet.`} />}
        renderItem={({item}) => (
            <View style={styles.row}>
                <View style={{flex: 2}}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Text style={styles.cellName}>{item.full_name || "Unknown"}</Text>
                    </View>
                    <Text style={styles.cellDate}>Joined: {new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
                <Text style={[styles.cell, {flex: 3, fontSize: 11, color: '#666'}]} numberOfLines={1}>{item.email}</Text>
                <View style={{flex: 1, alignItems: 'center'}}>
                    <View style={styles.lvlBadge}>
                        <Text style={styles.lvlText}>{item.role?.toUpperCase?.() || 'USER'}</Text>
                    </View>
                </View>
                <View style={{flex:1, alignItems: 'flex-end', flexDirection: 'row', gap: 10}}>
                    <TouchableOpacity onPress={() => openEditModal(item)}>
                        <View style={styles.editBtn}>
                            <Ionicons name="pencil" size={16} color="white" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteUser(item.id)}>
                        <View style={styles.trashBtn}>
                            <Ionicons name="ban" size={16} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )}
      />
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit User</Text>
            <ScrollView>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput 
                style={styles.input} 
                value={editForm.full_name} 
                onChangeText={(t) => setEditForm({...editForm, full_name: t})}
              />
              
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput 
                style={styles.input} 
                value={editForm.email} 
                onChangeText={(t) => setEditForm({...editForm, email: t})}
                keyboardType="email-address"
              />
              
              <Text style={styles.inputLabel}>Role</Text>
              <View style={styles.roleContainer}>
                {['student', 'parent', 'user'].map(role => (
                  <TouchableOpacity 
                    key={role}
                    style={[styles.roleBtn, editForm.role === role && styles.roleBtnActive]}
                    onPress={() => setEditForm({...editForm, role})}
                  >
                    <Text style={[styles.roleText, editForm.role === role && styles.roleTextActive]}>{role}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.saveBtn} onPress={saveUserEdit}>
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  innerContent: { flex: 1, padding: 16 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginLeft: 15 },
  
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 15, elevation: 2 },

  tableHeader: { flexDirection: 'row', backgroundColor: '#E0E0E0', padding: 12, borderRadius: 8, marginBottom: 5 },
  col: { fontWeight: 'bold', color: '#555', fontSize: 12, textTransform: 'uppercase' },
  
  row: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', borderRadius: 10, marginBottom: 8, alignItems: 'center', elevation: 1 },
  cellName: { fontWeight: 'bold', color: '#333' },
  cellDate: { fontSize: 10, color: '#999' },
  cell: { color: '#333' },
  
  lvlBadge: { backgroundColor: '#E3F2FD', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  lvlText: { fontSize: 12, fontWeight: 'bold', color: '#1565C0' },
  
  trashBtn: { backgroundColor: '#EF5350', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  editBtn: { backgroundColor: '#0288D1', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  tabRow: { flexDirection: 'row', marginBottom: 15, gap: 6 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#eee', alignItems: 'center' },
  tabActive: { backgroundColor: '#0288D1' },
  tabText: { fontWeight: 'bold', color: '#666', fontSize: 11 },
  tabTextActive: { color: '#fff' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: '#fff', borderRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12, fontSize: 16 },
  roleContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#eee' },
  roleBtnActive: { backgroundColor: '#0288D1' },
  roleText: { color: '#666' },
  roleTextActive: { color: '#fff' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  saveBtn: { flex: 1, backgroundColor: '#0288D1', padding: 15, borderRadius: 10, marginRight: 10 },
  saveBtnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  cancelBtn: { flex: 1, backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10 },
  cancelBtnText: { color: '#666', textAlign: 'center' }
});