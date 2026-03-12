import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import GoBackBtn from '../components/GoBackBtn';

export default function StudentEnrollScreen({ navigation }) {
  const { profile } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [myTeacher, setMyTeacher] = useState(null);
  const [myTeachers, setMyTeachers] = useState([]);
  const [showManual, setShowManual] = useState(false);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    if (profile?.id) {
      checkExistingEnrollment();
    }
  }, [profile?.id]);

  const checkExistingEnrollment = async () => {
    // Step 1: get enrollment rows
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('student_id', profile?.id);

    if (data && data.length > 0) {
      // Step 2: fetch teacher profiles
      const teacherIds = [...new Set(data.map(e => e.teacher_id))];
      const { data: teachers } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', teacherIds);
      const teacherMap = {};
      (teachers || []).forEach(t => { teacherMap[t.id] = t; });

      const enriched = data.map(e => ({
        ...e,
        profiles: teacherMap[e.teacher_id] || null,
      }));
      setMyTeachers(enriched);
      const primary = enriched.find(e => e.is_primary) || enriched[0];
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

    try {
      let teacherId = null;

      // New format: TCODE_{teacher_code}
      const newMatch = data.match(/^TCODE_([A-Z0-9]{6})$/);
      if (newMatch) {
        const { data: resolvedId, error: rpcError } = await supabase
          .rpc('get_teacher_id_by_code', { p_code: newMatch[1] });
        if (rpcError) throw new Error(rpcError.message);
        teacherId = resolvedId ?? null;
      } else {
        // Legacy format: TEACHER_{uuid}_{timestamp}
        const oldMatch = data.match(/^TEACHER_([^_]+)_\d+$/);
        if (oldMatch) teacherId = oldMatch[1];
      }

      if (!teacherId) {
        Alert.alert('Invalid QR Code', 'This is not a valid enrollment code.');
        setScanned(false);
        setEnrolling(false);
        return;
      }

      const enrolled = await enrollWithTeacherId(teacherId);
      if (enrolled) {
        navigation.replace('Home');
      } else {
        setScanned(false);
        setEnrolling(false);
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Something went wrong. Please try again.');
      setScanned(false);
      setEnrolling(false);
    }
  };

  const handleManualEnroll = async () => {
    const code = manualCode.trim().toUpperCase();
    if (code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-character code from your teacher.');
      return;
    }
    setEnrolling(true);
    try {
      console.log('[Enroll] Looking up teacher_code via RPC:', code);

      // Use a SECURITY DEFINER RPC to bypass RLS — students can't
      // directly query other profiles rows.
      const { data: teacherId, error: rpcError } = await supabase
        .rpc('get_teacher_id_by_code', { p_code: code });

      console.log('[Enroll] RPC result:', { teacherId, rpcError });

      if (rpcError) throw new Error(rpcError.message || JSON.stringify(rpcError));

      if (!teacherId) {
        Alert.alert('Code Not Found', 'No teacher was found with that code. Please double-check and try again.');
        setEnrolling(false);
        return;
      }

      const enrolled = await enrollWithTeacherId(teacherId);
      if (enrolled) {
        setManualCode('');
        setShowManual(false);
        navigation.replace('Home');
      } else {
        setEnrolling(false);
      }
    } catch (e) {
      console.error('[Enroll] Error:', e.message);
      Alert.alert('Enrollment Failed', e.message || 'Something went wrong. Please try again.');
      setEnrolling(false);
    }
  };

  // Returns true on success, false if already enrolled, throws on error
  const enrollWithTeacherId = async (teacherId) => {
    console.log('[Enroll] Checking existing enrollment for teacher:', teacherId);

    const { data: existing, error: existingError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', profile?.id)
      .eq('teacher_id', teacherId)
      .maybeSingle();

    if (existingError) throw new Error(existingError.message || JSON.stringify(existingError));

    if (existing) {
      Alert.alert('Already Enrolled', 'You are already enrolled with this teacher.');
      return false;
    }

    console.log('[Enroll] Inserting enrollment...');

    const { count, error: countError } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', profile?.id);

    if (countError) throw new Error(countError.message || JSON.stringify(countError));

    const isPrimary = (count || 0) === 0;

    const { error: insertError } = await supabase
      .from('enrollments')
      .insert([{ student_id: profile?.id, teacher_id: teacherId, is_primary: isPrimary }]);

    if (insertError) throw new Error(insertError.message || JSON.stringify(insertError));

    console.log('[Enroll] Enrollment successful!');
    return true;
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

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <GoBackBtn />
        <View style={styles.centerContent}>
          <Ionicons name="camera-off" size={80} color="#ccc" />
          <Text style={styles.errorText}>No camera access</Text>
          <Text style={styles.errorSubtext}>Please enable camera in settings</Text>
          <TouchableOpacity style={[styles.rescanBtn, { marginTop: 24 }]} onPress={requestPermission}>
            <Text style={styles.rescanText}>Grant Permission</Text>
          </TouchableOpacity>
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

          {/* Toggle: Camera / Manual */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, !showManual && styles.tabActive]}
              onPress={() => setShowManual(false)}
            >
              <Ionicons name="qr-code-outline" size={16} color={!showManual ? '#fff' : '#0288D1'} />
              <Text style={[styles.tabText, !showManual && styles.tabTextActive]}>Scan QR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, showManual && styles.tabActive]}
              onPress={() => setShowManual(true)}
            >
              <Ionicons name="keypad-outline" size={16} color={showManual ? '#fff' : '#0288D1'} />
              <Text style={[styles.tabText, showManual && styles.tabTextActive]}>Enter Code</Text>
            </TouchableOpacity>
          </View>

          {showManual ? (
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
              <View style={styles.manualCard}>
                <Ionicons name="key-outline" size={48} color="#0288D1" />
                <Text style={styles.manualTitle}>Enter Enrollment Code</Text>
                <Text style={styles.manualSubtitle}>
                  Ask your teacher for their 6-character code
                </Text>
                <TextInput
                  style={styles.codeInput}
                  value={manualCode}
                  onChangeText={t => setManualCode(t.toUpperCase())}
                  placeholder="A B C 1 2 3"
                  placeholderTextColor="#ccc"
                  autoCapitalize="characters"
                  maxLength={6}
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[styles.rescanBtn, enrolling && { opacity: 0.6 }]}
                  onPress={handleManualEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.rescanText}>Enroll</Text>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          ) : (
            <>
              <View style={styles.cameraContainer}>
                <CameraView
                  style={styles.camera}
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
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

  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabActive: { backgroundColor: '#0288D1' },
  tabText: { color: '#0288D1', fontWeight: 'bold', fontSize: 14 },
  tabTextActive: { color: '#fff' },

  manualCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  manualTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 16, marginBottom: 6 },
  manualSubtitle: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 24 },
  codeInput: {
    borderWidth: 2,
    borderColor: '#0288D1',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 8,
    textAlign: 'center',
    color: '#222',
    width: '100%',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
