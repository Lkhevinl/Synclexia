import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Alert,
  RefreshControl, TextInput, Modal, ScrollView, ActivityIndicator,
} from 'react-native';
import Icon from '../../components/icons/Icon';
import { supabase } from '../../lib/supabase';
import { TABLES } from '../../lib/constants';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

// ─── Tab: Learners & Parents ──────────────────────────────────────────────────
function UsersTab({ role }) {
  const { colors } = useTheme();
  const { suppressNextSignIn } = useAuth();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: '', email: '', role: 'student' });
  const [addVisible, setAddVisible] = useState(false);
  const [addForm, setAddForm] = useState({ full_name: '', email: '', password: '', role });
  const [adding, setAdding] = useState(false);

  useEffect(() => { fetchUsers(); }, [role]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(users); return; }
    const q = search.toLowerCase();
    setFiltered(users.filter(u =>
      u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    ));
  }, [search, users]);

  const fetchUsers = async () => {
    setRefreshing(true);
    setLoading(true);
    const roles = role === 'student' ? ['student', 'user'] : ['parent'];
    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .select('*')
      .in('role', roles)
      .order('full_name', { ascending: true });
    if (error) {
      Alert.alert('Load Error', error.message);
      setUsers([]);
    } else {
      setUsers(data ?? []);
    }
    setRefreshing(false);
    setLoading(false);
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditForm({ full_name: user.full_name || '', email: user.email || '', role: user.role || 'student' });
    setEditVisible(true);
  };

  const saveEdit = async () => {
    const { error } = await supabase
      .from(TABLES.PROFILES)
      .update({ full_name: editForm.full_name, email: editForm.email, role: editForm.role })
      .eq('id', selectedUser.id);
    if (error) { Alert.alert('Error', error.message); return; }
    Alert.alert('Success', 'User updated.');
    setEditVisible(false);
    fetchUsers();
  };

  const deleteUser = (user) => {
    Alert.alert(
      'Delete Account',
      `Permanently delete "${user.full_name || user.email}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          const { error } = await supabase
            .from(TABLES.PROFILES)
            .delete()
            .eq('id', user.id);
          if (error) { Alert.alert('Error', error.message); return; }
          Alert.alert('Deleted', 'Account has been removed.');
          fetchUsers();
        }},
      ]
    );
  };

  const addUser = async () => {
    if (!addForm.full_name.trim() || !addForm.email.trim() || !addForm.password.trim()) {
      Alert.alert('Missing Fields', 'Name, email, and password are required.');
      return;
    }
    setAdding(true);
    // Prevent the SIGNED_IN event fired by signUp from replacing the admin's session.
    suppressNextSignIn();
    const { data, error } = await supabase.auth.signUp({
      email: addForm.email.trim(),
      password: addForm.password,
      options: { data: { full_name: addForm.full_name.trim(), role: addForm.role } },
    });
    if (error) { Alert.alert('Error', error.message); setAdding(false); return; }

    // Upsert profile in case trigger hasn't fired yet
    if (data?.user?.id) {
      await supabase.from(TABLES.PROFILES).upsert({
        id: data.user.id,
        full_name: addForm.full_name.trim(),
        email: addForm.email.trim(),
        role: addForm.role,
      }, { onConflict: 'id' });
    }
    setAdding(false);
    setAddVisible(false);
    setAddForm({ full_name: '', email: '', password: '', role });
    Alert.alert('Account Created', `${addForm.full_name} has been added. They will receive a confirmation email.`);
    fetchUsers();
  };

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Search + Add */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { flex: 1 }]}>
          <Icon name="search" size="md" color="#666" />
          <TextInput
            placeholder={`Search ${role === 'student' ? 'learners' : 'parents'}...`}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="x-circle" size="md" color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => { setAddForm({ full_name: '', email: '', password: '', role }); setAddVisible(true); }}>
          <Icon name="plus" size="md" color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Count */}
      <Text style={styles.countLabel}>{filtered.length} {role === 'student' ? 'learner' : 'parent'}{filtered.length !== 1 ? 's' : ''}</Text>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.col, { flex: 2 }]}>Name</Text>
        <Text style={[styles.col, { flex: 3 }]}>Email</Text>
        <Text style={[styles.col, { flex: 1, textAlign: 'right' }]}>Actions</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchUsers} />}
        ListEmptyComponent={
          <EmptyState icon="people" message={search ? 'No user found.' : `No ${role === 'student' ? 'learners' : 'parents'} registered yet.`} />
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 2 }}>
              <Text style={styles.cellName}>{item.full_name || 'Unknown'}</Text>
              <Text style={styles.cellDate}>Joined: {new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            <Text style={[styles.cell, { flex: 3, fontSize: 11, color: '#666' }]} numberOfLines={1}>{item.email}</Text>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              <TouchableOpacity onPress={() => openEdit(item)}>
                <View style={styles.editBtn}><Icon name="pencil" size="md" color="#fff" /></View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteUser(item)}>
                <View style={styles.trashBtn}><Icon name="trash" size="md" color="#fff" /></View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Edit Modal */}
      <Modal visible={editVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit User</Text>
            <ScrollView>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput style={styles.input} value={editForm.full_name} onChangeText={t => setEditForm({ ...editForm, full_name: t })} />
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput style={styles.input} value={editForm.email} onChangeText={t => setEditForm({ ...editForm, email: t })} keyboardType="email-address" />
              <Text style={styles.inputLabel}>Role</Text>
              <View style={styles.roleContainer}>
                {['student', 'parent', 'user'].map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleBtn, editForm.role === r && styles.roleBtnActive]}
                    onPress={() => setEditForm({ ...editForm, role: r })}
                  >
                    <Text style={[styles.roleText, editForm.role === r && styles.roleTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add User Modal */}
      <Modal visible={addVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.modalTitle}>Add New {role === 'student' ? 'Learner' : 'Parent'}</Text>
              <TouchableOpacity onPress={() => setAddVisible(false)}>
                <Icon name="x" size="md" color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                value={addForm.full_name}
                onChangeText={t => setAddForm({ ...addForm, full_name: t })}
              />
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email address"
                value={addForm.email}
                onChangeText={t => setAddForm({ ...addForm, email: t })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Set a temporary password"
                value={addForm.password}
                onChangeText={t => setAddForm({ ...addForm, password: t })}
                secureTextEntry
              />
              <Text style={styles.inputLabel}>Role</Text>
              <View style={styles.roleContainer}>
                {['student', 'parent', 'user'].map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleBtn, addForm.role === r && styles.roleBtnActive]}
                    onPress={() => setAddForm({ ...addForm, role: r })}
                  >
                    <Text style={[styles.roleText, addForm.role === r && styles.roleTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.saveBtn, adding && { opacity: 0.6 }]} onPress={addUser} disabled={adding}>
                  {adding
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.saveBtnText}>Create Account</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddVisible(false)}>
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

// ─── Tab: Parent Links ────────────────────────────────────────────────────────
function ParentLinksTab() {
  const [links, setLinks] = useState([]);
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [linkVisible, setLinkVisible] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [parentSearch, setParentSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [linking, setLinking] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchLinks(), fetchParents(), fetchStudents()]);
    setLoading(false);
  };

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from(TABLES.PARENT_LINKS)
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data?.length) { setLinks([]); return; }

    const allIds = [...new Set([...data.map(l => l.parent_id), ...data.map(l => l.student_id)])];
    const { data: profiles } = await supabase.from(TABLES.PROFILES).select('id, full_name, email, role').in('id', allIds);
    const map = {};
    (profiles || []).forEach(p => { map[p.id] = p; });
    setLinks(data.map(l => ({ ...l, parent_profile: map[l.parent_id] || null, student_profile: map[l.student_id] || null })));
  };

  const fetchParents = async () => {
    const { data } = await supabase.from(TABLES.PROFILES).select('id, full_name, email').eq('role', 'parent').order('full_name');
    setParents(data || []);
  };

  const fetchStudents = async () => {
    const { data } = await supabase.from(TABLES.PROFILES).select('id, full_name, email').eq('role', 'student').order('full_name');
    setStudents(data || []);
  };

  const onRefresh = async () => { setRefreshing(true); await fetchAll(); setRefreshing(false); };

  const createLink = async () => {
    if (!selectedParent || !selectedStudent) { Alert.alert('Error', 'Select both a parent and a student.'); return; }
    const existing = links.find(l => l.parent_id === selectedParent.id && l.student_id === selectedStudent.id);
    if (existing) { Alert.alert('Already Linked', 'This parent is already linked to this student.'); return; }
    setLinking(true);
    const { data: result, error } = await supabase.rpc('admin_link_child', { p_parent_id: selectedParent.id, p_student_id: selectedStudent.id });
    setLinking(false);
    if (error || result?.error) { Alert.alert('Error', error?.message || result?.error); return; }
    Alert.alert('Linked!', `${selectedParent.full_name} → ${selectedStudent.full_name}`);
    setLinkVisible(false);
    setSelectedParent(null);
    setSelectedStudent(null);
    fetchLinks();
  };

  const removeLink = (link) => {
    Alert.alert('Remove Link', `Remove link between ${link.parent_profile?.full_name || 'Parent'} and ${link.student_profile?.full_name || 'Student'}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        const { data: result, error } = await supabase.rpc('admin_unlink_child', { p_link_id: link.id });
        if (!error && result?.success) setLinks(prev => prev.filter(l => l.id !== link.id));
        else Alert.alert('Error', error?.message || result?.error || 'Could not remove link.');
      }},
    ]);
  };

  const filteredLinks = links.filter(l => {
    if (!search) return true;
    const s = search.toLowerCase();
    return l.parent_profile?.full_name?.toLowerCase().includes(s) ||
      l.student_profile?.full_name?.toLowerCase().includes(s) ||
      l.parent_profile?.email?.toLowerCase().includes(s);
  });

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#6A1B9A" />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Stats */}
      <View style={styles.statsBar}>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: '#6A1B9A' }]}>{parents.length}</Text>
          <Text style={styles.statLbl}>Parents</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: '#4CAF50' }]}>{links.length}</Text>
          <Text style={styles.statLbl}>Links</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: '#FF9800' }]}>{students.length}</Text>
          <Text style={styles.statLbl}>Students</Text>
        </View>
      </View>

      {/* Search + Add */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { flex: 1 }]}>
          <Icon name="search" size="md" color="#666" />
          <TextInput placeholder="Search links..." value={search} onChangeText={setSearch} style={styles.searchInput} />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setLinkVisible(true)}>
          <Icon name="plus" size="md" color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredLinks.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Icon name="link" size="lg" color="#ccc" />
            <Text style={{ fontSize: 16, color: '#666', marginTop: 12 }}>No Links Found</Text>
            <Text style={{ fontSize: 13, color: '#999', marginTop: 4 }}>Tap + to link a parent to a student</Text>
          </View>
        ) : filteredLinks.map(link => (
          <View key={link.id} style={styles.linkCard}>
            <View style={styles.linkRow}>
              <View style={styles.linkPerson}>
                <View style={[styles.personAvatar, { backgroundColor: '#6A1B9A' }]}>
                  <Icon name="user" size="md" color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.personName}>{link.parent_profile?.full_name || 'Unknown'}</Text>
                  <Text style={styles.personRole}>Parent</Text>
                </View>
              </View>
              <Icon name="link" size="sm" color="#ccc" />
              <View style={styles.linkPerson}>
                <View style={[styles.personAvatar, { backgroundColor: '#FF9800' }]}>
                  <Icon name="graduation-cap" size="md" color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.personName}>{link.student_profile?.full_name || 'Unknown'}</Text>
                  <Text style={styles.personRole}>Student</Text>
                </View>
              </View>
            </View>
            <View style={styles.linkFooter}>
              <Text style={styles.linkDate}>Linked {new Date(link.created_at).toLocaleDateString()}</Text>
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeLink(link)}>
                <Icon name="trash" size="sm" color="#E53935" />
                <Text style={styles.removeTxt}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Create Link Modal */}
      <Modal visible={linkVisible} transparent animationType="slide" onRequestClose={() => setLinkVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.modalTitle}>Link Parent to Student</Text>
              <TouchableOpacity onPress={() => setLinkVisible(false)}>
                <Icon name="x" size="md" color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView nestedScrollEnabled>
              <Text style={styles.inputLabel}>Select Parent</Text>
              <TextInput style={styles.input} placeholder="Search parents..." value={parentSearch} onChangeText={setParentSearch} />
              <ScrollView style={{ maxHeight: 120, marginBottom: 8 }} nestedScrollEnabled>
                {parents.filter(p => !parentSearch || p.full_name?.toLowerCase().includes(parentSearch.toLowerCase())).map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.pickerItem, selectedParent?.id === p.id && styles.pickerItemActive]}
                    onPress={() => setSelectedParent(p)}
                  >
                    <Icon name={selectedParent?.id === p.id ? 'check-circle' : 'circle'} size="sm" color={selectedParent?.id === p.id ? '#6A1B9A' : '#ccc'} />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.pickerName}>{p.full_name}</Text>
                      <Text style={{ fontSize: 11, color: '#999' }}>{p.email}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Select Student</Text>
              <TextInput style={styles.input} placeholder="Search students..." value={studentSearch} onChangeText={setStudentSearch} />
              <ScrollView style={{ maxHeight: 120, marginBottom: 8 }} nestedScrollEnabled>
                {students.filter(s => !studentSearch || s.full_name?.toLowerCase().includes(studentSearch.toLowerCase())).map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.pickerItem, selectedStudent?.id === s.id && styles.pickerItemActive]}
                    onPress={() => setSelectedStudent(s)}
                  >
                    <Icon name={selectedStudent?.id === s.id ? 'check-circle' : 'circle'} size="sm" color={selectedStudent?.id === s.id ? '#FF9800' : '#ccc'} />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.pickerName}>{s.full_name}</Text>
                      <Text style={{ fontSize: 11, color: '#999' }}>{s.email}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {selectedParent && selectedStudent && (
                <View style={{ backgroundColor: '#E8F5E9', borderRadius: 10, padding: 10, marginVertical: 8, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#2E7D32' }}>
                    {selectedParent.full_name} → {selectedStudent.full_name}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.saveBtn, { marginTop: 8 }, linking && { opacity: 0.5 }]}
                onPress={createLink}
                disabled={linking}
              >
                {linking
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveBtnText}>Create Link</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
const TABS = [
  { key: 'student', label: 'Learners' },
  { key: 'parent',  label: 'Parents' },
  { key: 'links',   label: 'Parent Links' },
];

export default function AdminUsersScreen({ route }) {
  const initialTab = route?.params?.filterRole === 'parent' ? 'parent' : 'student';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (route?.params?.filterRole) {
      setActiveTab(route.params.filterRole === 'parent' ? 'parent' : 'student');
    }
  }, [route?.params?.filterRole]);

  return (
    <ScreenWrapper role="admin" padded={false} edges={['left', 'right', 'bottom']} style={{ backgroundColor: '#F5F7FA' }}>
      <AppHeader title="User Management" subtitle="Learners · Parents · Links" />

      {/* TABS */}
      <View style={styles.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
        {activeTab === 'student' && <UsersTab role="student" />}
        {activeTab === 'parent'  && <UsersTab role="parent" />}
        {activeTab === 'links'   && <ParentLinksTab />}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#E0E0E0', alignItems: 'center' },
  tabActive: { backgroundColor: '#0288D1' },
  tabText: { fontWeight: 'bold', color: '#666', fontSize: 12 },
  tabTextActive: { color: '#fff' },

  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, elevation: 1, marginBottom: 12 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333' },

  countLabel: { fontSize: 12, color: '#999', fontWeight: '600', marginBottom: 8 },

  tableHeader: { flexDirection: 'row', backgroundColor: '#E0E0E0', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginBottom: 6 },
  col: { fontWeight: 'bold', color: '#555', fontSize: 11, textTransform: 'uppercase' },

  row: { flexDirection: 'row', padding: 14, backgroundColor: '#fff', borderRadius: 10, marginBottom: 8, alignItems: 'center', elevation: 1 },
  cellName: { fontWeight: 'bold', color: '#333', fontSize: 14 },
  cellDate: { fontSize: 10, color: '#999', marginTop: 2 },
  cell: { color: '#333' },
  editBtn: { backgroundColor: '#0288D1', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  trashBtn: { backgroundColor: '#EF5350', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },

  statsBar: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, elevation: 2, justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  statLbl: { fontSize: 10, color: '#999', fontWeight: 'bold', textTransform: 'uppercase', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: '#F0F0F0' },

  addBtn: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#6A1B9A', justifyContent: 'center', alignItems: 'center', elevation: 3 },

  linkCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  linkPerson: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  personAvatar: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  personName: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  personRole: { fontSize: 10, color: '#999' },
  linkFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  linkDate: { fontSize: 11, color: '#999' },
  removeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  removeTxt: { fontSize: 12, color: '#E53935', fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '92%', backgroundColor: '#fff', borderRadius: 20, padding: 20, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1, borderColor: '#E0E0E0' },
  roleContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  roleBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#eee' },
  roleBtnActive: { backgroundColor: '#0288D1' },
  roleText: { color: '#666', fontWeight: '600' },
  roleTextActive: { color: '#fff' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10 },
  saveBtn: { flex: 1, backgroundColor: '#0288D1', padding: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { flex: 1, backgroundColor: '#f5f5f5', padding: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtnText: { color: '#666', fontWeight: '600' },

  pickerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  pickerItemActive: { backgroundColor: '#F3E5F5', borderRadius: 8 },
  pickerName: { fontSize: 14, fontWeight: '600', color: '#333' },
});
