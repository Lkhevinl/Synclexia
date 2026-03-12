// ...existing code from AdminEnrollmentScreen.js...
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { fetchEnrollmentsWithProfiles } from '../../lib/enrollmentHelper';
import GoBackBtn from '../../components/GoBackBtn';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCode() {
  return Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

export default function TeacherEnrollmentScreen() {
  const { profile, fetchProfile } = useAuth();
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // teacher_code is stored permanently in the DB — always read from profile
  const teacherCode = profile?.teacher_code;
  // QR encodes the permanent teacher code so scanning and manual entry use the same lookup
  const qrValue = teacherCode ? `TCODE_${teacherCode}` : null;

  useEffect(() => {
    if (profile?.id) {
      fetchEnrolledStudents();
      // If the teacher somehow has no code yet (pre-migration account), generate one now
      if (!profile.teacher_code) {
        ensureTeacherCode();
      }
    }
  }, [profile?.id]);

  const ensureTeacherCode = async () => {
    setGeneratingCode(true);
    for (let attempt = 0; attempt < 10; attempt++) {
      const code = generateCode();
      const { error } = await supabase
        .from('profiles')
        .update({ teacher_code: code })
        .eq('id', profile.id);
      if (!error || error.code !== '23505') {
        if (!error) await fetchProfile(profile.id);
        break;
      }
    }
    setGeneratingCode(false);
  };

  const regenerateTeacherCode = () => {
    Alert.alert(
      'Generate New Code?',
      'This will create a new enrollment code. Students who haven\'t enrolled yet will need the new code. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            setGeneratingCode(true);
            for (let attempt = 0; attempt < 10; attempt++) {
              const code = generateCode();
              const { error } = await supabase
                .from('profiles')
                .update({ teacher_code: code })
                .eq('id', profile.id);
              if (!error || error.code !== '23505') {
                if (!error) await fetchProfile(profile.id);
                break;
              }
            }
            setGeneratingCode(false);
          },
        },
      ]
    );
  };

  const fetchEnrolledStudents = async () => {
    setLoading(true);
    const data = await fetchEnrollmentsWithProfiles(profile?.id);
    setEnrolledStudents(data);
    setLoading(false);
  };

  const copyCode = () => {
    if (!teacherCode) return;
    if (Platform.OS === 'web' && navigator?.clipboard) {
      navigator.clipboard.writeText(teacherCode).then(() => {
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
      });
    } else {
      // On native, show a share sheet as a copy alternative
      const Share = require('react-native').Share;
      Share.share({ message: `My Synclexia enrollment code: ${teacherCode}` });
    }
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
        {generatingCode ? (
          <ActivityIndicator size="large" color="#0288D1" style={{ marginVertical: 20 }} />
        ) : qrValue ? (
          <View style={styles.qrWrapper}>
            <QRCode value={qrValue} size={200} />
          </View>
        ) : (
          <ActivityIndicator size="large" color="#0288D1" style={{ marginVertical: 20 }} />
        )}

        {/* Permanent unique code for manual entry */}
        <View style={styles.codeBox}>
          <View>
            <Text style={styles.codeLabel}>Manual Enrollment Code</Text>
            <Text style={styles.codeHint}>Students without a camera can type this</Text>
          </View>
          <TouchableOpacity style={styles.codeValueRow} onPress={copyCode} activeOpacity={0.7}>
            <Text style={styles.codeValue} selectable>{teacherCode || '------'}</Text>
            <Ionicons
              name={codeCopied ? 'checkmark-circle' : 'copy-outline'}
              size={20}
              color={codeCopied ? '#4CAF50' : '#0288D1'}
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={regenerateTeacherCode} disabled={generatingCode}>
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
  codeBox: {
    width: '100%',
    backgroundColor: '#EEF7FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B3D9F5',
    padding: 14,
    marginBottom: 14,
  },
  codeLabel: { fontSize: 13, fontWeight: 'bold', color: '#0288D1' },
  codeHint: { fontSize: 11, color: '#888', marginTop: 2, marginBottom: 10 },
  codeValueRow: { flexDirection: 'row', alignItems: 'center' },
  codeValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    letterSpacing: 6,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
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