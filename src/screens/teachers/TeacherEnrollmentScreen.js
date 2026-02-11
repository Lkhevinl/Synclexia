// ...existing code from AdminEnrollmentScreen.js...
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import GoBackBtn from '../../components/GoBackBtn';

export default function TeacherEnrollmentScreen() {
  const { profile } = useAuth();
  const [enrollmentCode, setEnrollmentCode] = useState('');
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      generateEnrollmentCode();
      fetchEnrolledStudents();
    }
  }, [profile?.id]);

  const generateEnrollmentCode = () => {
    const code = `TEACHER_${profile?.id}_${Date.now()}`;
    setEnrollmentCode(code);
  };

  const fetchEnrolledStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('enrollments')
      .select('*, profiles!enrollments_student_id_fkey(id, full_name, email, xp, role)')
      .eq('teacher_id', profile?.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching students:', error);
    } else if (data) {
      setEnrolledStudents(data);
    }
    setLoading(false);
  };

  const removeStudent = (enrollmentId) => {
    Alert.alert('Remove Student', 'Remove this student from your class?', [
      { text: 'Cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase
            .from('enrollments')
            .delete()
            .eq('id', enrollmentId);
          if (error) {
            Alert.alert('Error', error.message);
          } else {
            Alert.alert('Success', 'Student removed.');
            fetchEnrolledStudents();
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <GoBackBtn />
        <Text style={styles.headerTitle}>Class Enrollment</Text>
      </View>
      <View style={styles.qrCard}>
        <Text style={styles.qrTitle}>Your Class QR Code</Text>
        <Text style={styles.qrSubtitle}>Students scan this to enroll</Text>
        {enrollmentCode ? (
          <View style={styles.qrWrapper}>
            <QRCode value={enrollmentCode} size={200} />
          </View>
        ) : (
          <ActivityIndicator size="large" color="#0288D1" />
        )}
        <TouchableOpacity style={styles.refreshBtn} onPress={generateEnrollmentCode}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.refreshText}>Generate New Code</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.studentsSection}>
        <Text style={styles.sectionTitle}>
          Enrolled Students ({enrolledStudents.length})
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0288D1" style={{ marginTop: 20 }} />
        ) : enrolledStudents.length === 0 ? (
          <Text style={styles.emptyText}>No students enrolled yet.</Text>
        ) : (
          enrolledStudents.map((enrollment) => (
            <View key={enrollment.id} style={styles.studentCard}>
              <View style={styles.studentInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {enrollment.profiles?.full_name?.charAt(0) || 'S'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.studentName}>
                    {enrollment.profiles?.full_name || 'Unknown'}
                  </Text>
                  <Text style={styles.studentEmail}>{enrollment.profiles?.email}</Text>
                  <Text style={styles.studentLevel}>
                    Level {Math.floor((enrollment.profiles?.xp || 0) / 100) + 1}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeStudent(enrollment.id)}
              >
                <Ionicons name="close-circle" size={24} color="#E53935" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#F5F5F5' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginLeft: 15 },
  qrCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  qrTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  qrSubtitle: { fontSize: 13, color: '#666', marginBottom: 20 },
  qrWrapper: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#0288D1',
    marginBottom: 15,
  },
  refreshBtn: {
    flexDirection: 'row',
    backgroundColor: '#0288D1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    gap: 8,
  },
  refreshText: { color: '#fff', fontWeight: 'bold' },
  studentsSection: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  studentCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  studentInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#0288D1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  studentName: { fontWeight: 'bold', color: '#333', fontSize: 15 },
  studentEmail: { fontSize: 12, color: '#666', marginTop: 2 },
  studentLevel: { fontSize: 11, color: '#0288D1', marginTop: 3 },
  removeBtn: { padding: 5 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 20, fontSize: 14 },
});