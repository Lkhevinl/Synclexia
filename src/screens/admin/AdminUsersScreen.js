import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl, TextInput, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import GoBackBtn from '../../components/GoBackBtn';
import EmptyState from '../../components/EmptyState';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: '', email: '', role: 'student', xp: 0 });
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => { fetchUsers(); }, []);

  // Search Logic
  useEffect(() => {
    let base = users;
    if (activeTab === 'pending') {
      base = users.filter(u => u.role === 'teacher' && u.status === 'pending');
    }
    if (search.trim() === '') {
        setFilteredUsers(base);
    } else {
        const lowerSearch = search.toLowerCase();
        const filtered = base.filter(u => 
            (u.full_name && u.full_name.toLowerCase().includes(lowerSearch)) || 
            (u.email && u.email.toLowerCase().includes(lowerSearch))
        );
        setFilteredUsers(filtered);
    }
  }, [search, users, activeTab]);

  const fetchUsers = async () => {
    setRefreshing(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['student', 'user', 'teacher', 'parent'])
      .order('full_name', { ascending: true });
    if (data) {
        setUsers(data);
        setFilteredUsers(data);
    }
    setRefreshing(false);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name || '',
      email: user.email || '',
      role: user.role || 'student',
      xp: user.xp || 0,
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
        xp: parseInt(editForm.xp) || 0,
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

  const approveTeacher = (id) => {
    Alert.alert('Approve Teacher', 'Grant this user full teacher access?', [
      { text: 'Cancel' },
      { text: 'Approve', onPress: async () => {
        const { error } = await supabase
          .from('profiles')
          .update({ status: 'active' })
          .eq('id', id);
        if (error) {
          Alert.alert('Error', error.message);
        } else {
          Alert.alert('Approved', 'Teacher account has been activated.');
          fetchUsers();
        }
      }}
    ]);
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
      <View style={{flexDirection:'row', alignItems:'center', marginBottom:15}}>
          <GoBackBtn />
          <Text style={styles.headerTitle}>Student Management</Text>
      </View>

      {/* TABS */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>All Users</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            {'Pending Teachers'}
            {users.filter(u => u.role === 'teacher' && u.status === 'pending').length > 0
              ? ` (${users.filter(u => u.role === 'teacher' && u.status === 'pending').length})`
              : ''}
          </Text>
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
        ListEmptyComponent={<EmptyState icon="people" message={search ? "No user found." : "No students registered yet."} />}
        renderItem={({item}) => (
            <View style={styles.row}>
                <View style={{flex: 2}}>
                    <Text style={styles.cellName}>{item.full_name || "Unknown"}</Text>
                    <Text style={styles.cellDate}>Joined: {new Date(item.created_at).toLocaleDateString()}</Text>
                    {item.role === 'teacher' && item.status === 'pending' && (
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingBadgeText}>PENDING</Text>
                      </View>
                    )}
                </View>
                <Text style={[styles.cell, {flex: 3, fontSize: 11, color: '#666'}]} numberOfLines={1}>{item.email}</Text>
                <View style={{flex: 1, alignItems: 'center'}}>
                    <View style={styles.lvlBadge}>
                        <Text style={styles.lvlText}>{Math.floor((item.xp || 0)/100) + 1}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => openEditModal(item)} style={{flex:1, alignItems: 'flex-end', flexDirection: 'row', gap: 10}}>
                    <View style={styles.editBtn}>
                        <Ionicons name="pencil" size={16} color="white" />
                    </View>
                    {item.role === 'teacher' && item.status === 'pending' ? (
                      <TouchableOpacity onPress={() => approveTeacher(item.id)}>
                        <View style={styles.approveBtn}>
                          <Ionicons name="checkmark" size={16} color="white" />
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => deleteUser(item.id)}>
                          <View style={styles.trashBtn}>
                              <Ionicons name="ban" size={16} color="white" />
                          </View>
                      </TouchableOpacity>
                    )}
                </TouchableOpacity>
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
                {['student', 'teacher', 'parent', 'user'].map(role => (
                  <TouchableOpacity 
                    key={role}
                    style={[styles.roleBtn, editForm.role === role && styles.roleBtnActive]}
                    onPress={() => setEditForm({...editForm, role})}
                  >
                    <Text style={[styles.roleText, editForm.role === role && styles.roleTextActive]}>{role}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.inputLabel}>XP</Text>
              <TextInput 
                style={styles.input} 
                value={String(editForm.xp)} 
                onChangeText={(t) => setEditForm({...editForm, xp: t})}
                keyboardType="numeric"
              />
              
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#F5F5F5' }, // Better bg color
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
  approveBtn: { backgroundColor: '#4CAF50', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  tabRow: { flexDirection: 'row', marginBottom: 15, gap: 10 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#eee', alignItems: 'center' },
  tabActive: { backgroundColor: '#0288D1' },
  tabText: { fontWeight: 'bold', color: '#666', fontSize: 12 },
  tabTextActive: { color: '#fff' },
  pendingBadge: { backgroundColor: '#FFF3E0', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginTop: 2, alignSelf: 'flex-start' },
  pendingBadgeText: { fontSize: 10, color: '#E65100', fontWeight: 'bold' },
  
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