import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, FlatList, Switch, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../../components/AppHeader';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { fetchEnrollmentsWithProfiles } from '../../../lib/enrollmentHelper';
import { scheduleDeadlineReminder } from '../../../lib/pushNotificationHelper';

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

const DIFFICULTY_LABELS = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };

export default function TeacherAssignActivitiesScreen() {
  const { profile } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assignments, setAssignments] = useState({}); // { activityId: true/false } for quick toggles
  const [detailedAssignments, setDetailedAssignments] = useState([]); // Full assignment records
  const [loading, setLoading] = useState(true);
  const [configModal, setConfigModal] = useState(null); // Which activity is being configured
  const [configDifficulty, setConfigDifficulty] = useState(1);
  const [configTarget, setConfigTarget] = useState('1');
  const [configNotes, setConfigNotes] = useState('');
  const [configDeadline, setConfigDeadline] = useState('');
  const [configError, setConfigError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEnrolledStudents();
  }, []);

  const fetchEnrolledStudents = async () => {
    const data = await fetchEnrollmentsWithProfiles(profile?.id);
    setStudents(data);
    if (data.length > 0) {
      await selectStudent(data[0]);
    }
    setLoading(false);
  };

  // Helper: get the student's UUID safely from enrollment row
  const getStudentId = (student) => student.profiles?.id ?? student.student_id;
  const getStudentName = (student) => student.profiles?.full_name ?? 'Student';
  const getStudentEmail = (student) => student.profiles?.email ?? '';
  const selectStudent = async (student) => {
    setSelectedStudent(student);
    const sid = getStudentId(student);
    if (!sid) return;
    const { data } = await supabase
      .from('assignments')
      .select('*')
      .eq('student_id', sid)
      .eq('teacher_id', profile?.id);
    
    const assignmentMap = {};
    ACTIVITIES.forEach(activity => {
      assignmentMap[activity.id] = data?.some(a => a.activity_type === activity.id) || false;
    });
    setAssignments(assignmentMap);
    setDetailedAssignments(data || []);
  };

  const toggleAssignment = async (activityId) => {
    if (!selectedStudent) return;
    const isAssigned = assignments[activityId];
    const sid = getStudentId(selectedStudent);
    if (isAssigned) {
      await supabase
        .from('assignments')
        .delete()
        .eq('student_id', sid)
        .eq('activity_type', activityId)
        .eq('teacher_id', profile?.id);
      setAssignments(prev => ({ ...prev, [activityId]: false }));
      setDetailedAssignments(prev => prev.filter(a => a.activity_type !== activityId));
    } else {
      setConfigModal(activityId);
      setConfigDifficulty(1);
      setConfigTarget('1');
      setConfigNotes('');
      setConfigDeadline('');
    }
  };

  const confirmAssignment = async () => {
    if (!selectedStudent || !configModal || saving) return;
    setConfigError('');
    const targetNum = parseInt(configTarget) || 1;
    const sid = getStudentId(selectedStudent);

    // Parse deadline — if blank or invalid just skip it (don't block the assignment)
    let deadlineISO = null;
    if (configDeadline.trim()) {
      const d = new Date(configDeadline.trim());
      if (!isNaN(d.getTime()) && d > new Date()) {
        deadlineISO = d.toISOString();
      } else {
        setConfigError('Invalid deadline — use YYYY-MM-DD (e.g. 2026-03-15) or leave blank.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        difficulty_level: configDifficulty,
        target_count: targetNum,
        notes: configNotes || null,
        deadline: deadlineISO,
      };

      const { data: existing } = await supabase
        .from('assignments')
        .select('id')
        .eq('student_id', sid)
        .eq('teacher_id', profile?.id)
        .eq('activity_type', configModal)
        .maybeSingle();

      let data, error;
      if (existing) {
        ({ data, error } = await supabase
          .from('assignments')
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single());
      } else {
        ({ data, error } = await supabase
          .from('assignments')
          .insert({ teacher_id: profile?.id, student_id: sid, activity_type: configModal, ...payload })
          .select()
          .single());
      }

      if (error) {
        setConfigError(`Failed: ${error.message}${error.details ? ' — ' + error.details : ''}`);
      } else {
        setAssignments(prev => ({ ...prev, [configModal]: true }));
        setDetailedAssignments(prev => [
          ...prev.filter(a => a.activity_type !== configModal),
          ...(data ? [data] : []),
        ]);
        if (deadlineISO && data?.id) {
          scheduleDeadlineReminder(data.id, deadlineISO, configModal);
        }
        setConfigModal(null);
      }
    } catch (e) {
      setConfigError(`Unexpected error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const getAssignmentDetails = (activityId) => {
    return detailedAssignments.find(a => a.activity_type === activityId);
  };

  const StudentItem = ({ item, isSelected, onPress }) => (
    <TouchableOpacity 
      style={[styles.studentItem, isSelected && styles.studentItemActive]}
      onPress={onPress}
    >
      <View style={[styles.studentAvatar, isSelected && { backgroundColor: '#2E7D32' }]}>
        <Text style={styles.studentAvatarText}>
          {(getStudentName(item)[0] || '?').toUpperCase()}
        </Text>
      </View>
      <View style={styles.studentInfo}>
        <Text style={[styles.studentName, isSelected && styles.studentNameActive]}>
          {getStudentName(item)}
        </Text>
        <Text style={styles.studentEmail}>{getStudentEmail(item) || 'No email'}</Text>
      </View>
      <Text style={[styles.studentXP, isSelected && styles.studentXPActive]}>
        {getStudentXP(item)} XP
      </Text>
    </TouchableOpacity>
  );

  const ActivityItem = ({ activity }) => {
    const details = getAssignmentDetails(activity.id);
    const isAssigned = assignments[activity.id] || false;

    return (
      <View style={styles.activityItem}>
        <View style={[styles.activityIconBox, { backgroundColor: activity.color }]}>
          <Text style={styles.activityIcon}>{activity.icon}</Text>
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityName}>{activity.name}</Text>
          {isAssigned && details ? (
            <View style={styles.detailsRow}>
              <Text style={styles.detailTag}>{DIFFICULTY_LABELS[details.difficulty_level] || 'Easy'}</Text>
              <Text style={styles.detailTag}>Target: {details.target_count || 1}</Text>
            {details.deadline && (
              <Text style={[styles.detailTag, { backgroundColor: '#FFF3E0', color: '#F57C00' }]}>
                Due: {new Date(details.deadline).toLocaleDateString()}
              </Text>
            )}
            </View>
          ) : (
            <Text style={styles.activityDesc}>Assign to student</Text>
          )}
        </View>
        <Switch
          value={isAssigned}
          onValueChange={() => toggleAssignment(activity.id)}
          trackColor={{ false: '#ccc', true: '#81C784' }}
          thumbColor={isAssigned ? '#4CAF50' : '#999'}
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
        <AppHeader
          title="Assign Activities"
          colors={['#4c669f', '#3b5998']}
        />
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
      <AppHeader
        title="Assign Activities"
        subtitle="Select a student, configure & assign"
        colors={['#4c669f', '#3b5998']}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>Select Student</Text>
        <FlatList
          data={students}
          keyExtractor={item => item.student_id ?? item.id}
          renderItem={({ item }) => (
            <StudentItem 
              item={item} 
              isSelected={getStudentId(selectedStudent) === getStudentId(item)}
              onPress={() => selectStudent(item)}
            />
          )}
          scrollEnabled={false}
        />
        {selectedStudent && (
          <>
            <Text style={styles.sectionLabel}>Activities for {getStudentName(selectedStudent)}</Text>
            <View style={styles.activitiesContainer}>
              {ACTIVITIES.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </View>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Assignment Config Modal */}
      <Modal visible={!!configModal} transparent animationType="fade" onRequestClose={() => setConfigModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Configure Assignment</Text>
            <Text style={styles.modalSub}>{ACTIVITIES.find(a => a.id === configModal)?.name} for {selectedStudent ? getStudentName(selectedStudent) : ''}</Text>

            <Text style={styles.configLabel}>Difficulty Level</Text>
            <View style={styles.difficultyRow}>
              {[1, 2, 3].map(lvl => (
                <TouchableOpacity
                  key={lvl}
                  style={[styles.diffBtn, configDifficulty === lvl && styles.diffBtnActive]}
                  onPress={() => setConfigDifficulty(lvl)}
                >
                  <Text style={[styles.diffText, configDifficulty === lvl && styles.diffTextActive]}>
                    {DIFFICULTY_LABELS[lvl]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.configLabel}>Target (how many to complete)</Text>
            <TextInput
              style={styles.configInput}
              keyboardType="number-pad"
              value={configTarget}
              onChangeText={setConfigTarget}
              placeholder="e.g. 10"
            />

            <Text style={styles.configLabel}>Notes (optional)</Text>
            <TextInput
              style={[styles.configInput, { height: 60, textAlignVertical: 'top' }]}
              multiline
              value={configNotes}
              onChangeText={setConfigNotes}
              placeholder="e.g. Focus on Level 3 words"
            />

            <Text style={styles.configLabel}>Deadline (optional)</Text>
            <TextInput
              style={styles.configInput}
              value={configDeadline}
              onChangeText={setConfigDeadline}
              placeholder="YYYY-MM-DD (e.g. 2026-03-15)"
            />

            {!!configError && (
              <Text style={{ color: '#E53935', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>
                {configError}
              </Text>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setConfigModal(null); setConfigError(''); }} disabled={saving}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.assignBtn, saving && { opacity: 0.6 }]} onPress={confirmAssignment} disabled={saving}>
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.assignText}>Assign</Text>
                }
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
  studentItem: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: 'transparent' },
  studentItemActive: { backgroundColor: '#E8F5E9', borderLeftColor: '#4CAF50' },
  studentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  studentAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  studentNameActive: { color: '#2E7D32' },
  studentEmail: { fontSize: 12, color: '#999', marginTop: 2 },
  studentXP: { fontSize: 13, fontWeight: 'bold', color: '#FF9800' },
  studentXPActive: { color: '#F57C00' },
  activitiesContainer: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginTop: 10 },
  activityItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  activityIconBox: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  activityIcon: { fontSize: 28 },
  activityContent: { flex: 1 },
  activityName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  activityDesc: { fontSize: 12, color: '#999', marginTop: 2 },
  detailsRow: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  detailTag: { fontSize: 10, fontWeight: 'bold', color: '#666', backgroundColor: '#F0F0F0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  completedTag: { backgroundColor: '#E8F5E9', color: '#2E7D32' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '88%', backgroundColor: '#fff', borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  modalSub: { fontSize: 13, color: '#999', textAlign: 'center', marginBottom: 20 },
  configLabel: { fontSize: 13, fontWeight: 'bold', color: '#666', marginTop: 12, marginBottom: 8 },
  difficultyRow: { flexDirection: 'row', gap: 10 },
  diffBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 2, borderColor: '#E0E0E0', alignItems: 'center' },
  diffBtnActive: { borderColor: '#4CAF50', backgroundColor: '#E8F5E9' },
  diffText: { fontWeight: 'bold', color: '#999' },
  diffTextActive: { color: '#2E7D32' },
  configInput: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 12, fontSize: 15, borderWidth: 1, borderColor: '#E0E0E0' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 2, borderColor: '#E0E0E0', alignItems: 'center' },
  cancelText: { fontWeight: 'bold', color: '#999' },
  assignBtn: { flex: 2, padding: 14, borderRadius: 14, backgroundColor: '#4CAF50', alignItems: 'center' },
  assignText: { fontWeight: 'bold', color: '#fff', fontSize: 16 },
});