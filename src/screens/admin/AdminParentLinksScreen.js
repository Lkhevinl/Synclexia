// screens/admin/AdminParentLinksScreen.js
// Admin screen to manage parent-student links.
// Allows linking/unlinking parent accounts to student accounts.

import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar,
  Alert, ActivityIndicator, TextInput, RefreshControl, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GoBackBtn from '../../components/GoBackBtn';
import { supabase } from '../../lib/supabase';

export default function AdminParentLinksScreen({ navigation }) {
  const [links, setLinks] = useState([]);
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Link modal
  const [linkVisible, setLinkVisible] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [parentSearch, setParentSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchLinks(), fetchParents(), fetchStudents()]);
    } catch (e) {
      console.error('[AdminParentLinks] fetchAll exception:', e?.message || e);
      Alert.alert('Load Error', 'Could not load parent links. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from('parent_links')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[AdminParentLinks] fetchLinks error:', error.message);
      setLinks([]);
      return;
    }

    if (data && data.length > 0) {
      // Get all unique user IDs for hydration
      const parentIds = [...new Set(data.map(l => l.parent_id))];
      const studentIds = [...new Set(data.map(l => l.student_id))];
      const allIds = [...new Set([...parentIds, ...studentIds])];

      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .in('id', allIds);

      if (profErr) {
        console.error('[AdminParentLinks] hydrate profiles error:', profErr.message);
        // Still show raw links even if hydration fails
        setLinks(data.map(l => ({ ...l, parent_profile: null, student_profile: null })));
        return;
      }

      const profileMap = {};
      (profiles || []).forEach(p => { profileMap[p.id] = p; });

      const enriched = data.map(l => ({
        ...l,
        parent_profile: profileMap[l.parent_id] || null,
        student_profile: profileMap[l.student_id] || null,
      }));
      setLinks(enriched);
    } else {
      setLinks([]);
    }
  };

  const fetchParents = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('role', 'parent')
      .order('full_name');
    if (error) {
      console.error('[AdminParentLinks] fetchParents error:', error.message);
      setParents([]);
      return;
    }
    setParents(data || []);
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('role', 'student')
      .order('full_name');
    if (error) {
      console.error('[AdminParentLinks] fetchStudents error:', error.message);
      setStudents([]);
      return;
    }
    setStudents(data || []);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAll();
    } finally {
      setRefreshing(false);
    }
  };

  const createLink = async () => {
    if (!selectedParent || !selectedStudent) {
      Alert.alert('Error', 'Please select both a parent and a student.');
      return;
    }

    // Check if link already exists
    const existing = links.find(l => l.parent_id === selectedParent.id && l.student_id === selectedStudent.id);
    if (existing) {
      Alert.alert('Already Linked', 'This parent is already linked to this student.');
      return;
    }

    setLinking(true);
    const { data: result, error } = await supabase
      .rpc('admin_link_child', {
        p_parent_id: selectedParent.id,
        p_student_id: selectedStudent.id,
      });
    setLinking(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else if (result?.error === 'already_linked') {
      Alert.alert('Already Linked', 'This parent is already linked to this student.');
    } else if (result?.error) {
      Alert.alert('Error', result.error);
    } else {
      Alert.alert('Linked!', `${selectedParent.full_name} is now linked to ${selectedStudent.full_name}`);
      setLinkVisible(false);
      setSelectedParent(null);
      setSelectedStudent(null);
      await fetchLinks();
    }
  };

  const removeLink = (link) => {
    const parentName = link.parent_profile?.full_name || 'Parent';
    const studentName = link.student_profile?.full_name || 'Student';
    Alert.alert(
      'Remove Link',
      `Remove link between ${parentName} and ${studentName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive',
          onPress: async () => {
            // Use admin RPC to bypass RLS on DELETE
            const { data: result, error } = await supabase
              .rpc('admin_unlink_child', { p_link_id: link.id });
            if (!error && result?.success) {
              setLinks(prev => prev.filter(l => l.id !== link.id));
            } else {
              Alert.alert('Error', error?.message || result?.error || 'Could not remove link.');
            }
          },
        },
      ]
    );
  };

  const filteredLinks = links.filter(l => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      l.parent_profile?.full_name?.toLowerCase().includes(s) ||
      l.parent_profile?.email?.toLowerCase().includes(s) ||
      l.student_profile?.full_name?.toLowerCase().includes(s) ||
      l.student_profile?.email?.toLowerCase().includes(s)
    );
  });

  const filteredParents = parents.filter(p => {
    if (!parentSearch) return true;
    const s = parentSearch.toLowerCase();
    return p.full_name?.toLowerCase().includes(s) || p.email?.toLowerCase().includes(s);
  });

  const filteredStudents = students.filter(s => {
    if (!studentSearch) return true;
    const q = studentSearch.toLowerCase();
    return s.full_name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4c669f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.header}>
        <GoBackBtn />
        <Text style={styles.headerTitle}>Parent-Student Links</Text>
        <Text style={styles.headerSub}>Manage parent account connections</Text>
      </LinearGradient>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{parents.length}</Text>
          <Text style={styles.statLbl}>Parents</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: '#4CAF50' }]}>{links.length}</Text>
          <Text style={styles.statLbl}>Links</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: '#2196F3' }]}>{students.length}</Text>
          <Text style={styles.statLbl}>Students</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search links..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setLinkVisible(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredLinks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="link-outline" size={60} color="#ccc" />
            <Text style={styles.emptyTitle}>No Links Found</Text>
            <Text style={styles.emptyHint}>Tap + to link a parent to a student</Text>
          </View>
        ) : (
          filteredLinks.map(link => (
            <View key={link.id} style={styles.linkCard}>
              <View style={styles.linkRow}>
                {/* Parent */}
                <View style={styles.linkPerson}>
                  <View style={[styles.personAvatar, { backgroundColor: '#6A1B9A' }]}>
                    <Ionicons name="person" size={18} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.personName}>{link.parent_profile?.full_name || 'Unknown'}</Text>
                    <Text style={styles.personRole}>Parent</Text>
                  </View>
                </View>

                <Ionicons name="link" size={20} color="#ccc" style={{ marginHorizontal: 8 }} />

                {/* Student */}
                <View style={styles.linkPerson}>
                  <View style={[styles.personAvatar, { backgroundColor: '#FF9800' }]}>
                    <Ionicons name="school" size={18} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.personName}>{link.student_profile?.full_name || 'Unknown'}</Text>
                    <Text style={styles.personRole}>Student</Text>
                  </View>
                </View>
              </View>

              <View style={styles.linkFooter}>
                <Text style={styles.linkDate}>
                  Linked {new Date(link.created_at).toLocaleDateString()}
                </Text>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeLink(link)}
                >
                  <Ionicons name="trash-outline" size={16} color="#E53935" />
                  <Text style={styles.removeTxt}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Create Link Modal */}
      <Modal visible={linkVisible} transparent animationType="slide" onRequestClose={() => setLinkVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Link Parent to Student</Text>
              <TouchableOpacity onPress={() => setLinkVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Select Parent */}
            <Text style={styles.pickerLabel}>Select Parent</Text>
            <TextInput
              style={styles.pickerSearch}
              placeholder="Search parents..."
              value={parentSearch}
              onChangeText={setParentSearch}
            />
            <ScrollView style={styles.pickerList} nestedScrollEnabled>
              {filteredParents.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.pickerItem, selectedParent?.id === p.id && styles.pickerItemActive]}
                  onPress={() => setSelectedParent(p)}
                >
                  <Ionicons
                    name={selectedParent?.id === p.id ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={selectedParent?.id === p.id ? '#6A1B9A' : '#ccc'}
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.pickerName}>{p.full_name}</Text>
                    <Text style={styles.pickerEmail}>{p.email}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {filteredParents.length === 0 && (
                <Text style={{ textAlign: 'center', color: '#999', paddingVertical: 10 }}>No parent accounts found</Text>
              )}
            </ScrollView>

            {/* Select Student */}
            <Text style={styles.pickerLabel}>Select Student</Text>
            <TextInput
              style={styles.pickerSearch}
              placeholder="Search students..."
              value={studentSearch}
              onChangeText={setStudentSearch}
            />
            <ScrollView style={styles.pickerList} nestedScrollEnabled>
              {filteredStudents.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.pickerItem, selectedStudent?.id === s.id && styles.pickerItemActive]}
                  onPress={() => setSelectedStudent(s)}
                >
                  <Ionicons
                    name={selectedStudent?.id === s.id ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={selectedStudent?.id === s.id ? '#FF9800' : '#ccc'}
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.pickerName}>{s.full_name}</Text>
                    <Text style={styles.pickerEmail}>{s.email}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {filteredStudents.length === 0 && (
                <Text style={{ textAlign: 'center', color: '#999', paddingVertical: 10 }}>No students found</Text>
              )}
            </ScrollView>

            {/* Summary */}
            {selectedParent && selectedStudent && (
              <View style={styles.linkSummary}>
                <Text style={styles.summaryText}>
                  {selectedParent.full_name} → {selectedStudent.full_name}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.confirmBtn, linking && { opacity: 0.5 }]}
              onPress={createLink}
              disabled={linking}
            >
              {linking ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmText}>Create Link</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 15 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 5 },

  statsBar: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 20, marginTop: -20, paddingVertical: 14, paddingHorizontal: 20, elevation: 4, boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)', justifyContent: 'space-around', alignItems: 'center' },
  statBox: { alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  statLbl: { fontSize: 10, color: '#999', fontWeight: 'bold', textTransform: 'uppercase', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: '#F0F0F0' },

  searchRow: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 20, gap: 10 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, elevation: 1 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, marginLeft: 8, color: '#333' },
  addBtn: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#6A1B9A', justifyContent: 'center', alignItems: 'center', elevation: 3 },

  scrollContent: { padding: 20 },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#666', marginTop: 16 },
  emptyHint: { fontSize: 13, color: '#999', marginTop: 6 },

  linkCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  linkRow: { flexDirection: 'row', alignItems: 'center' },
  linkPerson: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  personAvatar: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  personName: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  personRole: { fontSize: 10, color: '#999' },
  linkFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  linkDate: { fontSize: 11, color: '#999' },
  removeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  removeTxt: { fontSize: 12, color: '#E53935', fontWeight: 'bold' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '92%', backgroundColor: '#fff', borderRadius: 20, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  pickerLabel: { fontSize: 13, fontWeight: 'bold', color: '#666', marginTop: 12, marginBottom: 6 },
  pickerSearch: { backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, borderWidth: 1, borderColor: '#E0E0E0' },
  pickerList: { maxHeight: 120, marginTop: 6, marginBottom: 6 },
  pickerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  pickerItemActive: { backgroundColor: '#F3E5F5', borderRadius: 8 },
  pickerName: { fontSize: 14, fontWeight: '600', color: '#333' },
  pickerEmail: { fontSize: 11, color: '#999' },
  linkSummary: { backgroundColor: '#E8F5E9', borderRadius: 10, padding: 10, marginTop: 10, alignItems: 'center' },
  summaryText: { fontSize: 13, fontWeight: 'bold', color: '#2E7D32' },
  confirmBtn: { backgroundColor: '#6A1B9A', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 14 },
  confirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
