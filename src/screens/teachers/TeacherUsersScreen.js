import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { fetchEnrollmentsWithProfiles } from '../../lib/enrollmentHelper';
import GoBackBtn from '../../components/GoBackBtn';
import EmptyState from '../../components/EmptyState';

export default function TeacherUsersScreen() {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { if (profile?.id) fetchUsers(); }, [profile?.id]);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredUsers(users);
    } else {
      const q = search.toLowerCase();
      setFilteredUsers(users.filter(u =>
        (u.full_name && u.full_name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
      ));
    }
  }, [search, users]);

  const fetchUsers = async () => {
    setRefreshing(true);

    const data = await fetchEnrollmentsWithProfiles(profile.id);
    const students = data.map(e => ({
      enrollmentId: e.id,
      enrolledAt:   e.created_at,
      id:           e.profiles?.id         ?? e.id,
      full_name:    e.profiles?.full_name  ?? 'Unknown',
      email:        e.profiles?.email      ?? '—',
      xp:           e.profiles?.xp         ?? 0,
      created_at:   e.profiles?.created_at ?? e.created_at,
    }));
    setUsers(students);
    setFilteredUsers(students);

    setLoading(false);
    setRefreshing(false);
  };

  const removeStudent = (enrollmentId, name) => {
    Alert.alert('Remove Student', `Remove ${name} from your class?`, [
      { text: 'Cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          const { error } = await supabase
            .from('enrollments')
            .delete()
            .eq('id', enrollmentId);
          if (error) Alert.alert('Error', error.message);
          else fetchUsers();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={{flexDirection:'row', alignItems:'center', marginBottom:15}}>
          <GoBackBtn />
          <Text style={styles.headerTitle}>Student Management</Text>
      </View>
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

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#4c669f" />
          <Text style={styles.loadingText}>Loading students…</Text>
        </View>
      ) : (
        <>
          <View style={styles.tableHeader}>
              <Text style={[styles.col, {flex: 2}]}>Name</Text>
              <Text style={[styles.col, {flex: 3}]}>Email</Text>
              <Text style={[styles.col, {flex: 1, textAlign: 'center'}]}>Lvl</Text>
              <Text style={[styles.col, {flex: 1, textAlign: 'right'}]}>Action</Text>
          </View>
          <FlatList 
            data={filteredUsers}
            keyExtractor={item => item.enrollmentId}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchUsers} />}
            ListEmptyComponent={<EmptyState icon="people" message={search ? "No student found." : "No enrolled students yet."} />}
            renderItem={({item}) => (
                <View style={styles.row}>
                    <View style={{flex: 2}}>
                        <Text style={styles.cellName}>{item.full_name || 'Unknown'}</Text>
                        <Text style={styles.cellDate}>Enrolled: {new Date(item.enrolledAt).toLocaleDateString()}</Text>
                    </View>
                    <Text style={[styles.cell, {flex: 3, fontSize: 11, color: '#666'}]} numberOfLines={1}>{item.email || '—'}</Text>
                    <View style={{flex: 1, alignItems: 'center'}}>
                        <View style={styles.lvlBadge}>
                            <Text style={styles.lvlText}>{Math.floor((item.xp || 0)/100) + 1}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => removeStudent(item.enrollmentId, item.full_name || 'this student')} style={{flex:1, alignItems: 'flex-end'}}>
                        <View style={styles.trashBtn}>
                            <Ionicons name="person-remove" size={16} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#F5F5F5' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginLeft: 15 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 15, elevation: 2 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#78909C', fontSize: 14 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#E0E0E0', padding: 12, borderRadius: 8, marginBottom: 5 },
  col: { fontWeight: 'bold', color: '#555', fontSize: 12, textTransform: 'uppercase' },
  row: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', borderRadius: 10, marginBottom: 8, alignItems: 'center', elevation: 1 },
  cellName: { fontWeight: 'bold', color: '#333' },
  cellDate: { fontSize: 10, color: '#999' },
  cell: { color: '#333' },
  lvlBadge: { backgroundColor: '#E3F2FD', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  lvlText: { fontSize: 12, fontWeight: 'bold', color: '#1565C0' },
  trashBtn: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EF5350' }
});