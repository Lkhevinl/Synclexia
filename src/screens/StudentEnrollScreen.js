import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import GoBackBtn from '../components/GoBackBtn';

export default function StudentEnrollScreen({ navigation }) {
  const { profile } = useAuth();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [myTeacher, setMyTeacher] = useState(null);
  const [myTeachers, setMyTeachers] = useState([]);

  useEffect(() => {
    getCameraPermission();
  }, []);

  useEffect(() => {
    if (profile?.id) {
      checkExistingEnrollment();
    }
  }, [profile?.id]); // checkExistingEnrollment only uses profile.id which is the dep

  const getCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const checkExistingEnrollment = async () => {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*, profiles!enrollments_teacher_id_fkey(full_name, email)')
      .eq('student_id', profile?.id);

    if (data && data.length > 0) {
      setMyTeachers(data);
      // Set primary teacher for display
      const primary = data.find(e => e.is_primary) || data[0];
      setMyTeacher(primary);
    } else {
      setMyTeachers([]);
      setMyTeacher(null);
    }
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || enrolling) return;
    setScanned(true);
    setEnrolling(true);

    // Extract teacher ID from QR code format: TEACHER_{teacherId}_{timestamp}
    const match = data.match(/^TEACHER_([^_]+)_\d+$/);
    if (!match) {
      Alert.alert('Invalid QR Code', 'This is not a valid enrollment code.');
      setScanned(false);
      setEnrolling(false);
      return;
    }

    const teacherId = match[1];

    // Check if already enrolled with this specific teacher
    const { data: existing } = await supabase
      .from('enrollments')
      .select('*')
      .eq('student_id', profile?.id)
      .eq('teacher_id', teacherId)
      .maybeSingle();

    if (existing) {
      Alert.alert('Already Enrolled', 'You are already enrolled with this teacher.');
      setEnrolling(false);
      return;
    }

    // Check if this is the first enrollment (will be primary)
    const { count } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', profile?.id);

    const isPrimary = (count || 0) === 0;

    // Enroll student
    const { error } = await supabase
      .from('enrollments')
      .insert([{ student_id: profile?.id, teacher_id: teacherId, is_primary: isPrimary }]);

    if (error) {
      Alert.alert('Error', error.message);
      setScanned(false);
      setEnrolling(false);
      return;
    }

    Alert.alert('Success', 'You have been enrolled!', [
      {
        text: 'OK',
        onPress: () => {
          checkExistingEnrollment();
          setEnrolling(false);
        },
      },
    ]);
  };

  const unenroll = (enrollmentId, wasPrimary) => {
    Alert.alert('Unenroll', 'Are you sure you want to leave this class?', [
      { text: 'Cancel' },
      {
        text: 'Unenroll',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase
            .from('enrollments')
            .delete()
            .eq('id', enrollmentId);

          if (error) {
            Alert.alert('Error', error.message);
          } else {
            // If we removed the primary, promote the next one
            if (wasPrimary) {
              const { data: remaining } = await supabase
                .from('enrollments')
                .select('id')
                .eq('student_id', profile?.id)
                .limit(1);
              if (remaining && remaining.length > 0) {
                await supabase
                  .from('enrollments')
                  .update({ is_primary: true })
                  .eq('id', remaining[0].id);
              }
            }
            Alert.alert('Success', 'You have been unenrolled.');
            checkExistingEnrollment();
          }
        },
      },
    ]);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <GoBackBtn />
        <View style={styles.centerContent}>
          <Ionicons name="camera-off" size={80} color="#ccc" />
          <Text style={styles.errorText}>No camera access</Text>
          <Text style={styles.errorSubtext}>Please enable camera in settings</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GoBackBtn />
      <Text style={styles.title}>Enroll in a Class</Text>

      {myTeacher ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.enrolledCard}>
            <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            <Text style={styles.enrolledTitle}>You're Enrolled!</Text>
            
            {myTeachers.map((t, idx) => (
              <View key={t.id} style={{ 
                backgroundColor: t.is_primary ? '#E8F5E9' : '#F5F5F5', 
                padding: 15, borderRadius: 12, marginTop: 15, width: '100%',
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <View>
                  <Text style={styles.teacherName}>{t.profiles?.full_name || 'Teacher'}</Text>
                  <Text style={styles.teacherEmail}>{t.profiles?.email}</Text>
                  {t.is_primary && (
                    <Text style={{ fontSize: 10, color: '#4CAF50', fontWeight: 'bold', marginTop: 4 }}>PRIMARY</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => unenroll(t.id, t.is_primary)}>
                  <Ionicons name="close-circle" size={24} color="#E53935" />
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity 
              style={[styles.rescanBtn, { marginTop: 20, width: '100%' }]}
              onPress={() => { setMyTeacher(null); setScanned(false); }}
            >
              <Text style={styles.rescanText}>Enroll with Another Teacher</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <>
          <Text style={styles.instruction}>Scan your teacher's QR code</Text>
          <View style={styles.cameraContainer}>
            <Camera
              style={styles.camera}
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              barCodeScannerSettings={{
                barCodeTypes: ['qr'],
              }}
            />
            <View style={styles.overlay}>
              <View style={styles.scanArea} />
            </View>
          </View>

          {enrolling && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Enrolling...</Text>
            </View>
          )}

          {scanned && !enrolling && (
            <TouchableOpacity
              style={styles.rescanBtn}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.rescanText}>Tap to Scan Again</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20, paddingTop: 50 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  instruction: { textAlign: 'center', color: '#666', marginBottom: 20, fontSize: 15 },

  cameraContainer: { flex: 1, borderRadius: 20, overflow: 'hidden', position: 'relative' },
  camera: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#0288D1',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { color: '#fff', marginTop: 10, fontSize: 16 },

  rescanBtn: {
    backgroundColor: '#0288D1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  rescanText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  enrolledCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  enrolledTitle: { fontSize: 22, fontWeight: 'bold', color: '#4CAF50', marginTop: 15 },
  teacherName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 20 },
  teacherEmail: { fontSize: 14, color: '#666', marginTop: 5 },
  unenrollBtn: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E53935',
  },
  unenrollText: { color: '#E53935', fontWeight: 'bold' },

  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: { fontSize: 18, fontWeight: 'bold', color: '#666', marginTop: 15 },
  errorSubtext: { fontSize: 14, color: '#999', marginTop: 5 },
});
