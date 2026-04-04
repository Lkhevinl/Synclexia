import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { fetchEnrollmentsWithProfiles } from '../../../lib/enrollmentHelper';
import GoBackBtn from '../../../components/GoBackBtn';
import ScreenWrapper from '../../../components/ScreenWrapper';
import tokens from '../../../theme/tokens';
import { useTheme } from '../../../context/ThemeContext';

const AVATAR_COLORS = ['#E91E63','#9C27B0','#3F51B5','#2196F3','#009688','#FF9800','#795548'];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

export default function TeacherUsersScreen() {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { if (profile?.id) fetchUsers(); }, [profile?.id]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredUsers(
      search.trim() === '' ? users :
      users.filter(u =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      )
    );
  }, [search, users]);

  const fetchUsers = async () => {
    setRefreshing(true);
    const data = await fetchEnrollmentsWithProfiles(profile.id);
    const students = data.map(e => ({
      enrollmentId: e.id,
      enrolledAt:   e.created_at,
      studentId:    e.profiles?.id        ?? e.student_id,
      full_name:    e.profiles?.full_name ?? 'Unknown',
      email:        e.profiles?.email     ?? '—',
      xp:           e.profiles?.xp        ?? 0,
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
          const { error } = await supabase.from('enrollments').delete().eq('id', enrollmentId);
          if (error) Alert.alert('Error', error.message);
          else fetchUsers();
        },
      },
    ]);
  };


  const StudentCard = ({ item }) => {
    const level = Math.floor((item.xp || 0) / 100) + 1;
    const initial = (item.full_name || '?')[0].toUpperCase();
    return (
      <View style={styles.card}>
        <View style={[styles.avatar, { backgroundColor: avatarColor(item.full_name) }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.full_name}</Text>
          <Text style={styles.cardEmail} numberOfLines={1}>{item.email}</Text>
          <Text style={styles.cardDate}>Enrolled: {new Date(item.enrolledAt).toLocaleDateString()}</Text>
        </View>
        <View style={styles.cardRight}>
          <View style={styles.lvlBadge}>
            <Text style={styles.lvlText}>Lv {level}</Text>
          </View>
          <Text style={styles.xpText}>{item.xp} XP</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.trashBtn} onPress={() => removeStudent(item.enrollmentId, item.full_name)}>
              <Ionicons name="person-remove" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const { colors } = useTheme();
  
  return (
    <ScreenWrapper role="teacher">
      <LinearGradient colors={['#f9a8c9', '#f7c5a0']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.headerRow}>
          <GoBackBtn />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Student Management</Text>
            <Text style={styles.headerSub}>{users.length} enrolled student{users.length !== 1 ? 's' : ''}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.searchBox, { backgroundColor: colors.surfaceCard }]}>
        <Ionicons name="search" size={18} color={colors.primary} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search by name or email..."
          placeholderTextColor={colors.onSurfaceMuted}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { color: colors.onSurface }]}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.onSurfaceMuted} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.onSurfaceMuted }]}>Loading students…</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.enrollmentId?.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchUsers} tintColor={colors.primary} />}
          contentContainerStyle={{ padding: tokens.spacing.md, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="people-outline" size={60} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.onSurfaceMuted }]}>{search ? 'No student found.' : 'No enrolled students yet.'}</Text>
            </View>
          }
          renderItem={({ item }) => <StudentCard item={item} />}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 55, paddingBottom: 20, paddingHorizontal: tokens.spacing.lg, borderBottomLeftRadius: tokens.radius.lg, borderBottomRightRadius: tokens.radius.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#7B2D52' },
  headerSub: { fontSize: 12, color: '#9E5070', marginTop: 2 },

  searchBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, margin: tokens.spacing.md, paddingHorizontal: 14, paddingVertical: 10, elevation: 2, borderWidth: 1, borderColor: '#f9a8c9' },
  searchInput: { flex: 1, fontSize: 14 },

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: tokens.spacing.md, fontSize: 14 },

  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, marginTop: tokens.spacing.md },

  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18, padding: 14, marginBottom: 10, elevation: 2, alignItems: 'center' },
  avatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: tokens.spacing.md },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  cardEmail: { fontSize: 11, color: '#999', marginTop: 2 },
  cardDate: { fontSize: 10, color: '#bbb', marginTop: 2 },
  cardRight: { alignItems: 'center', gap: 4 },
  lvlBadge: { backgroundColor: '#EDE7F6', paddingHorizontal: tokens.spacing.sm, paddingVertical: 3, borderRadius: 10 },
  lvlText: { fontSize: 11, fontWeight: 'bold', color: '#7B1FA2' },
  xpText: { fontSize: 10, color: '#999', fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  trashBtn: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EF5350' },
});