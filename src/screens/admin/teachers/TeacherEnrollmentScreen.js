// ...existing code from AdminEnrollmentScreen.js...
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, ScrollView } from 'react-native';
import Icon from '../../../components/icons/Icon';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { fetchEnrollmentsWithProfiles } from '../../../lib/enrollmentHelper';
import AppHeader from '../../../components/AppHeader';
import ScreenWrapper from '../../../components/ScreenWrapper';
import tokens from '../../../theme/tokens';
import { useTheme } from '../../../context/ThemeContext';

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

  const { colors } = useTheme();

  return (
    <ScreenWrapper role="teacher" scrollable>
      <AppHeader
        title="Class Enrollment"
        subtitle="QR Code & Student Management"
        colors={['#0288D1', '#01579B']}
      />
      <View style={styles.innerContent}>
      <View style={[styles.qrCard, { backgroundColor: colors.surfaceCard }]}>
        <Text style={[styles.qrTitle, { color: colors.onSurface }]}>Your Class QR Code</Text>
        <Text style={[styles.qrSubtitle, { color: colors.onSurfaceMuted }]}>Students scan this to enroll</Text>
        {generatingCode ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: tokens.spacing.lg }} />
        ) : qrValue ? (
          <View style={styles.qrWrapper}>
            <QRCode value={qrValue} size={200} />
          </View>
        ) : (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: tokens.spacing.lg }} />
        )}

        {/* Permanent unique code for manual entry */}
        <View style={styles.codeBox}>
          <View>
            <Text style={styles.codeLabel}>Manual Enrollment Code</Text>
            <Text style={[styles.codeHint, { color: colors.onSurfaceMuted }]}>Students without a camera can type this</Text>
          </View>
          <TouchableOpacity style={styles.codeValueRow} onPress={copyCode} activeOpacity={0.7}>
            <Text style={[styles.codeValue, { color: colors.onSurface }]} selectable>{teacherCode || '------'}</Text>
            <Icon
              name={codeCopied ? 'check-circle' : 'copy'}
              size="md"
              color={codeCopied ? '#4CAF50' : colors.primary}
              style={{ marginLeft: tokens.spacing.sm }}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={regenerateTeacherCode} disabled={generatingCode}>
          <Icon name="refresh-cw" size="md" color="#fff" />
          <Text style={styles.refreshText}>Generate New Code</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.studentsSection}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
          Enrolled Students ({enrolledStudents.length})
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: tokens.spacing.lg }} />
        ) : enrolledStudents.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.onSurfaceMuted }]}>No students enrolled yet.</Text>
        ) : (
          enrolledStudents.map((enrollment) => (
            <View key={enrollment.id} style={[styles.studentCard, { backgroundColor: colors.surfaceCard }]}>
              <View style={styles.studentInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {enrollment.profiles?.full_name?.charAt(0) || 'S'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.studentName, { color: colors.onSurface }]}>
                    {enrollment.profiles?.full_name || 'Unknown'}
                  </Text>
                  <Text style={[styles.studentEmail, { color: colors.onSurfaceMuted }]}>{enrollment.profiles?.email}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeStudent(enrollment.id)}
              >
                <Icon name="x-circle" size="md" color="#E53935" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  innerContent: { flex: 1, padding: tokens.spacing.lg },
  qrCard: {
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
    elevation: 3,
  },
  qrTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  qrSubtitle: { fontSize: 13, marginBottom: tokens.spacing.lg },
  qrWrapper: {
    padding: tokens.spacing.lg,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#0288D1',
    marginBottom: 15,
  },
  refreshBtn: {
    flexDirection: 'row',
    backgroundColor: '#0288D1',
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    borderRadius: 10,
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  refreshText: { color: '#fff', fontWeight: 'bold' },
  codeBox: {
    width: '100%',
    backgroundColor: '#EEF7FF',
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: '#B3D9F5',
    padding: 14,
    marginBottom: 14,
  },
  codeLabel: { fontSize: 13, fontWeight: 'bold', color: '#0288D1' },
  codeHint: { fontSize: 11, marginTop: 2, marginBottom: 10 },
  codeValueRow: { flexDirection: 'row', alignItems: 'center' },
  codeValue: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 6,
  },
  studentsSection: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  studentCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: tokens.radius.md,
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
    marginRight: tokens.spacing.md,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  studentName: { fontWeight: 'bold', fontSize: 15 },
  studentEmail: { fontSize: 12, marginTop: 2 },
  removeBtn: { padding: 5 },
  emptyText: { textAlign: 'center', marginTop: tokens.spacing.lg, fontSize: 14 },
});