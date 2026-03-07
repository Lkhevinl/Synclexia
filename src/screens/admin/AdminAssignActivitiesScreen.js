import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar,
  FlatList, Switch, Modal, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GoBackBtn from '../../components/GoBackBtn';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { fetchEnrollmentsWithProfiles } from '../../lib/enrollmentHelper';

const ACTIVITIES = [
  { id: 'phonics',               name: 'Phonics',            icon: '🗣️', color: '#FF9800' },
  { id: 'phonics_activity',      name: 'Activities',         icon: '🎮', color: '#00897B' },
  { id: 'phonics_blend',         name: 'Blending',           icon: '🔗', color: '#00BCD4' },
  { id: 'phonics_rhyme',         name: 'Rhyme',              icon: '🎵', color: '#E91E63' },
  { id: 'phonics_segment',       name: 'Segmenting',         icon: '✂️', color: '#795548' },
  { id: 'spelling',              name: 'Spelling',           icon: '🔤', color: '#3F51B5' },
  { id: 'writing',               name: 'Writing',            icon: '✍️', color: '#4CAF50' },
  { id: 'reading',               name: 'Reading',            icon: '📖', color: '#2196F3' },
  { id: 'scan',                  name: 'Scan',               icon: '📷', color: '#9C27B0' },
  { id: 'phonological_awareness',name: 'Awareness',          icon: '🎧', color: '#607D8B' },
  { id: 'speech_to_text',        name: 'Speech',             icon: '🎤', color: '#F44336' },
  { id: 'text_to_speech',        name: 'Read Aloud',         icon: '🔊', color: '#0288D1' },
];

export default function AdminAssignActivitiesScreen({ navigation }) {
  const { profile } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assignments, setAssignments] = useState({});   // { activityId: assignment row | false }
  const [loading, setLoading] = useState(true);

  // Assignment config modal
  const [configModal, setConfigModal] = useState(false);
  const [pendingActivity, setPendingActivity] = useState(null);
  const [configNotes, setConfigNotes] = useState('');
  const [configTarget, setConfigTarget] = useState('1');
  const [configDeadline, setConfigDeadline] = useState(''); // string MM/DD/YYYY

  useEffect(() => {
    fetchEnrolledStudents();
  }, []);

  const fetchEnrolledStudents = async () => {
    const data = await fetchEnrollmentsWithProfiles(profile?.id);
    setStudents(data);
    if (data.length > 0) {
      selectStudent(data[0]);
    }
    setLoading(false);
  };

  const selectStudent = async (student) => {
    setSelectedStudent(student);
    
    // Fetch current assignments for this student (include all fields)
    const { data } = await supabase
      .from('assignments')
      .select('*')
      .eq('student_id', student.profiles.id);
    
    const assignmentMap = {};
    ACTIVITIES.forEach(activity => {
      const existing = data?.find(a => a.activity_type === activity.id);
      assignmentMap[activity.id] = existing || false;
    });
    setAssignments(assignmentMap);
  };

  const openConfig = (activityId) => {
    setPendingActivity(activityId);
    setConfigNotes('');
    setConfigTarget('1');
    setConfigDeadline('');
    setConfigModal(true);
  };

  const toggleAssignment = (activityId) => {
    if (!selectedStudent) return;
    const isAssigned = !!assignments[activityId];

    if (isAssigned) {
      // Remove immediately
      removeAssignment(activityId);
    } else {
      // Open config modal before inserting
      openConfig(activityId);
    }
  };

  const removeAssignment = async (activityId) => {
    await supabase
      .from('assignments')
      .delete()
      .eq('student_id', selectedStudent.profiles.id)
      .eq('activity_type', activityId)
      .eq('teacher_id', profile?.id);

    setAssignments(prev => ({ ...prev, [activityId]: false }));
  };

  const confirmAssignment = async () => {
    const targetNum = parseInt(configTarget) || 1;

    // Parse deadline string MM/DD/YYYY
    let deadlineISO = null;
    if (configDeadline.trim()) {
      const parts = configDeadline.trim().split('/');
      if (parts.length === 3) {
        const d = new Date(parts[2], parseInt(parts[0]) - 1, parseInt(parts[1]));
        if (!isNaN(d.getTime()) && d > new Date()) {
          deadlineISO = d.toISOString();
        } else {
          Alert.alert('Invalid Date', 'Please enter a future date in MM/DD/YYYY format, or leave it blank.');
          return;
        }
      } else {
        Alert.alert('Invalid Date', 'Use MM/DD/YYYY format (e.g. 03/15/2026), or leave blank.');
        return;
      }
    }
    const { data, error } = await supabase
      .from('assignments')
      .insert({
        teacher_id: profile?.id,
        student_id: selectedStudent.profiles.id,
        activity_type: pendingActivity,
        notes: configNotes.trim() || null,
        target_count: targetNum,
        deadline: deadlineISO,
      })
      .select()
      .single();

    if (error) {
      // Keep modal open so user can retry or cancel
      Alert.alert('Error', error.message);
      return;
    }
    setAssignments(prev => ({ ...prev, [pendingActivity]: data }));
    setConfigModal(false);
    setPendingActivity(null);
  };

  const StudentItem = ({ item, isSelected, onPress }) => (
    <TouchableOpacity 
      style={[styles.studentItem, isSelected && styles.studentItemActive]}
      onPress={onPress}
    >
      <View style={styles.studentInfo}>
        <Text style={[styles.studentName, isSelected && styles.studentNameActive]}>
          {item.profiles?.full_name}
        </Text>
        <Text style={styles.studentEmail}>{item.profiles?.email}</Text>
      </View>
      <Text style={[styles.studentXP, isSelected && styles.studentXPActive]}>
        {item.profiles?.xp || 0} XP
      </Text>
    </TouchableOpacity>
  );

  const ActivityItem = ({ activity }) => {
    const assigned = assignments[activity.id];
    const isOn = !!assigned;
    return (
      <View style={styles.activityItem}>
        <View style={[styles.activityIconBox, { backgroundColor: activity.color }]}>
          <Text style={styles.activityIcon}>{activity.icon}</Text>
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityName}>{activity.name}</Text>
          {isOn && assigned ? (
            <View style={{ gap: 1 }}>
              {assigned.deadline && (
                <Text style={styles.activityMeta}>
                  📅 Due: {new Date(assigned.deadline).toLocaleDateString()}
                </Text>
              )}
              {assigned.target_count > 0 && (
                <Text style={styles.activityMeta}>🎯 Target: {assigned.target_count}×</Text>
              )}
              {assigned.notes ? (
                <Text style={styles.activityMeta} numberOfLines={1}>📝 {assigned.notes}</Text>
              ) : null}
            </View>
          ) : (
            <Text style={styles.activityDesc}>Tap to assign</Text>
          )}
        </View>
        <Switch
          value={isOn}
          onValueChange={() => toggleAssignment(activity.id)}
          trackColor={{ false: '#ccc', true: '#81C784' }}
          thumbColor={isOn ? '#4CAF50' : '#999'}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (students.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#4c669f', '#3b5998']} style={styles.header}>
          <GoBackBtn />
          <Text style={styles.headerTitle}>Assign Activities</Text>
        </LinearGradient>
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <Ionicons name="people" size={80} color="#ccc" style={{ marginBottom: 20 }} />
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#666', textAlign: 'center' }}>
            No students enrolled yet
          </Text>
          <Text style={{ fontSize: 14, color: '#999', marginTop: 10, textAlign: 'center' }}>
            Once students enroll, you can assign them activities here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={['#4c669f', '#3b5998']} style={styles.header}>
        <GoBackBtn />
        <Text style={styles.headerTitle}>Assign Activities</Text>
        <Text style={styles.headerSub}>Select a student and enable activities</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>Select Student</Text>
        
        <FlatList
          data={students}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <StudentItem 
              item={item} 
              isSelected={selectedStudent?.id === item.id}
              onPress={() => selectStudent(item)}
            />
          )}
          scrollEnabled={false}
        />

        {selectedStudent && (
          <>
            <Text style={styles.sectionLabel}>Activities for {selectedStudent.profiles?.full_name}</Text>
            
            <View style={styles.activitiesContainer}>
              {ACTIVITIES.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Assignment Config Modal ── */}
      <Modal visible={configModal} transparent animationType="slide" onRequestClose={() => setConfigModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Configure Assignment
            </Text>
            <Text style={styles.modalSub}>
              {ACTIVITIES.find(a => a.id === pendingActivity)?.icon}{' '}
              {ACTIVITIES.find(a => a.id === pendingActivity)?.name}
              {' '}for {selectedStudent?.profiles?.full_name}
            </Text>

            {/* Target Count */}
            <Text style={styles.modalLabel}>Target (sessions to complete)</Text>
            <View style={styles.modalInputRow}>
              {[1, 2, 3, 5, 10].map(n => (
                <TouchableOpacity
                  key={n}
                  style={[styles.targetChip, configTarget === String(n) && styles.targetChipActive]}
                  onPress={() => setConfigTarget(String(n))}
                >
                  <Text style={[styles.targetChipText, configTarget === String(n) && styles.targetChipTextActive]}>
                    {n}×
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Deadline */}
            <Text style={styles.modalLabel}>Deadline (optional)</Text>
            <View style={styles.modalInputBox}>
              <Ionicons name="calendar-outline" size={18} color="#4c669f" />
              <TextInput
                style={styles.modalInlineInput}
                value={configDeadline}
                onChangeText={setConfigDeadline}
                placeholder="MM/DD/YYYY (e.g. 03/15/2026)"
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />
            </View>

            {/* Notes */}
            <Text style={styles.modalLabel}>Notes (optional)</Text>
            <TextInput
              style={styles.modalNotesInput}
              value={configNotes}
              onChangeText={setConfigNotes}
              placeholder="e.g. Focus on blending CVC words"
              multiline
              numberOfLines={2}
              maxLength={200}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setConfigModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmAssignment}>
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={styles.modalConfirmText}>Assign</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, paddingRight: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 15 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 5 },
  
  scrollContent: { padding: 20 },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 15, marginTop: 15 },
  
  studentItem: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: 'transparent' },
  studentItemActive: { backgroundColor: '#E8F5E9', borderLeftColor: '#4CAF50' },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  studentNameActive: { color: '#2E7D32' },
  studentEmail: { fontSize: 12, color: '#999', marginTop: 3 },
  studentXP: { fontSize: 14, fontWeight: 'bold', color: '#FFD700' },
  studentXPActive: { color: '#F57C00' },
  
  activitiesContainer: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginTop: 10 },
  activityItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  activityIconBox: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  activityIcon: { fontSize: 28 },
  activityContent: { flex: 1 },
  activityName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  activityDesc: { fontSize: 11, color: '#999', marginTop: 2 },
  activityMeta: { fontSize: 11, color: '#4c669f', marginTop: 1 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  modalSub: { fontSize: 13, color: '#888', marginBottom: 16 },
  modalLabel: { fontSize: 11, fontWeight: 'bold', color: '#90A4AE', marginTop: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 },
  modalInputRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  targetChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#CFD8DC', backgroundColor: '#F5F5F5' },
  targetChipActive: { backgroundColor: '#4c669f', borderColor: '#4c669f' },
  targetChipText: { fontWeight: 'bold', color: '#607D8B' },
  targetChipTextActive: { color: '#fff' },
  modalDateBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EEF2FF', borderRadius: 12, padding: 12 },
  modalDateText: { flex: 1, color: '#4c669f', fontWeight: '600' },
  modalInputBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: '#CFD8DC', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F9FAFB' },
  modalInlineInput: { flex: 1, fontSize: 14, color: '#333' },
  modalNotesInput: {
    borderWidth: 1.5, borderColor: '#CFD8DC', borderRadius: 12,
    padding: 12, fontSize: 14, color: '#333', backgroundColor: '#F9FAFB',
    textAlignVertical: 'top', minHeight: 60,
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalCancelBtn: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#CFD8DC', alignItems: 'center' },
  modalCancelText: { color: '#607D8B', fontWeight: 'bold' },
  modalConfirmBtn: { flex: 2, padding: 14, borderRadius: 14, backgroundColor: '#4c669f', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  modalConfirmText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
