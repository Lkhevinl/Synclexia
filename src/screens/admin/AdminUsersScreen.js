import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import GoBackBtn from '../../components/GoBackBtn';
import EmptyState from '../../components/EmptyState'; // <--- NEW

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  // Search Logic
  useEffect(() => {
    if (search.trim() === '') {
        setFilteredUsers(users);
    } else {
        const lowerSearch = search.toLowerCase();
        const filtered = users.filter(u => 
            (u.full_name && u.full_name.toLowerCase().includes(lowerSearch)) || 
            (u.email && u.email.toLowerCase().includes(lowerSearch))
        );
        setFilteredUsers(filtered);
    }
  }, [search, users]);

  const fetchUsers = async () => {
    setRefreshing(true);
    const { data } = await supabase.from('profiles').select('*').eq('role', 'user').order('created_at', {ascending: false});
    if (data) {
        setUsers(data);
        setFilteredUsers(data);
    }
    setRefreshing(false);
  };

  const deleteUser = (id) => {
    Alert.alert("Ban User", "This will block their access. Continue?", [
        { text: "Cancel" },
        { text: "Ban", style: 'destructive', onPress: async () => {
             // In real app: await supabase.auth.admin.deleteUser(id);
             Alert.alert("Info", "User banned (Simulation for safety).");
        }}
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={{flexDirection:'row', alignItems:'center', marginBottom:15}}>
          <GoBackBtn />
          <Text style={styles.headerTitle}>Student Management</Text>
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
                </View>
                <Text style={[styles.cell, {flex: 3, fontSize: 11, color: '#666'}]} numberOfLines={1}>{item.email}</Text>
                <View style={{flex: 1, alignItems: 'center'}}>
                    <View style={styles.lvlBadge}>
                        <Text style={styles.lvlText}>{Math.floor((item.xp || 0)/100) + 1}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => deleteUser(item.id)} style={{flex:1, alignItems: 'flex-end'}}>
                    <View style={styles.trashBtn}>
                        <Ionicons name="ban" size={16} color="white" />
                    </View>
                </TouchableOpacity>
            </View>
        )}
      />
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
  
  trashBtn: { backgroundColor: '#FFEBEE', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EF5350' }
});