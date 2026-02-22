import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl, TextInput, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { fetchEnrollmentsWithProfiles } from '../../lib/enrollmentHelper';
import GoBackBtn from '../../components/GoBackBtn';

const AVATAR_COLORS = ['#E91E63','#9C27B0','#3F51B5','#2196F3','#009688','#FF9800','#795548'];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

export default function TeacherUsersScreen() {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rewardModal, setRewardModal] = useState(null); // student object
  const [rewardCoins, setRewardCoins] = useState('10');

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

  const giveReward = async () => {
    if (!rewardModal) return;
    const coins = parseInt(rewardCoins) || 0;
    if (coins <= 0) return Alert.alert('Invalid', 'Enter a positive coin amount.');
    const { error } = await supabase.rpc('add_coins_to_user', {
      target_user_id: rewardModal.studentId,
      amount: coins,
    });
    if (error) {
      // Fallback: direct update if RPC doesn't exist
      await supabase.from('profiles').update({ coins: (rewardModal.coins || 0) + coins }).eq('id', rewardModal.studentId);
    }
    Alert.alert('Reward Sent! 🎉', `${coins} coins given to ${rewardModal.full_name}.`);
    setRewardModal(null);
    setRewardCoins('10');
    fetchUsers();
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
            <TouchableOpacity style={styles.rewardBtn} onPress={() => { setRewardModal(item); setRewardCoins('10'); }}>
              <Ionicons name="star" size={14} color="#FF9800" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.trashBtn} onPress={() => removeStudent(item.enrollmentId, item.full_name)}>
              <Ionicons name="person-remove" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#f9a8c9', '#f7c5a0']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.headerRow}>
          <GoBackBtn />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Student Management</Text>
            <Text style={styles.headerSub}>{users.length} enrolled student{users.length !== 1 ? 's' : ''}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#C06080" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search by name or email..."
          placeholderTextColor="#bbb"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#ccc" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#C06080" />
          <Text style={styles.loadingText}>Loading students…</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.enrollmentId?.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchUsers} tintColor="#C06080" />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="people-outline" size={60} color="#ddd" />
              <Text style={styles.emptyText}>{search ? 'No student found.' : 'No enrolled students yet.'}</Text>
            </View>
          }
          renderItem={({ item }) => <StudentCard item={item} />}
        />
      )}

      {/* Reward Modal */}
      <Modal visible={!!rewardModal} transparent animationType="fade" onRequestClose={() => setRewardModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Give Reward 🌟</Text>
            <Text style={styles.modalSub}>Reward {rewardModal?.full_name} with coins</Text>
            <View style={styles.coinRow}>
              {[5, 10, 25, 50].map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.coinBtn, rewardCoins === String(c) && styles.coinBtnActive]}
                  onPress={() => setRewardCoins(String(c))}
                >
                  <Text style={[styles.coinBtnText, rewardCoins === String(c) && { color: '#fff' }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.coinInput}
              keyboardType="number-pad"
              value={rewardCoins}
              onChangeText={setRewardCoins}
              placeholder="Custom amount"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setRewardModal(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.giveBtn} onPress={giveReward}>
                <Ionicons name="star" size={16} color="#fff" />
                <Text style={styles.giveBtnText}>Give Coins</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  header: { paddingTop: 55, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#7B2D52' },
  headerSub: { fontSize: 12, color: '#9E5070', marginTop: 2 },

  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, margin: 16, paddingHorizontal: 14, paddingVertical: 10, elevation: 2, borderWidth: 1, borderColor: '#f9a8c9' },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#9E5070', fontSize: 14 },

  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#bbb', fontSize: 15, marginTop: 12 },

  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18, padding: 14, marginBottom: 10, elevation: 2, alignItems: 'center' },
  avatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  cardEmail: { fontSize: 11, color: '#999', marginTop: 2 },
  cardDate: { fontSize: 10, color: '#bbb', marginTop: 2 },
  cardRight: { alignItems: 'center', gap: 4 },
  lvlBadge: { backgroundColor: '#EDE7F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  lvlText: { fontSize: 11, fontWeight: 'bold', color: '#7B1FA2' },
  xpText: { fontSize: 10, color: '#999', fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  rewardBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFF8E1', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFE082' },
  trashBtn: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EF5350' },

  // Reward Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '88%', backgroundColor: '#fff', borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  modalSub: { fontSize: 13, color: '#999', textAlign: 'center', marginBottom: 20, marginTop: 4 },
  coinRow: { flexDirection: 'row', gap: 10, marginBottom: 14, justifyContent: 'center' },
  coinBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 2, borderColor: '#E0E0E0', backgroundColor: '#F5F5F5' },
  coinBtnActive: { backgroundColor: '#C06080', borderColor: '#C06080' },
  coinBtnText: { fontWeight: 'bold', color: '#666', fontSize: 15 },
  coinInput: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 12, fontSize: 15, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 16, textAlign: 'center' },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 2, borderColor: '#E0E0E0', alignItems: 'center' },
  cancelText: { fontWeight: 'bold', color: '#999' },
  giveBtn: { flex: 2, padding: 14, borderRadius: 14, backgroundColor: '#C06080', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  giveBtnText: { fontWeight: 'bold', color: '#fff', fontSize: 15 },
});