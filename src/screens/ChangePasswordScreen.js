import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import GoBackBtn from '../components/GoBackBtn';
import { useAuth } from '../context/AuthContext';

const showAlert = (title, message, onOk) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    onOk?.();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
  }
};

const PasswordField = ({ label, value, onChangeText, show, onToggle, placeholder }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.inputBox}>
      <Ionicons name="lock-closed-outline" size={18} color="#90A4AE" />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={!show}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
      />
      <TouchableOpacity onPress={onToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color="#90A4AE" />
      </TouchableOpacity>
    </View>
  </View>
);

export default function ChangePasswordScreen({ navigation }) {
  const { profile } = useAuth();
  const isStudent = profile?.role === 'student';

  const [newPass, setNewPass]       = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showNew, setShowNew]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]       = useState(false);

  React.useEffect(() => {
    if (!isStudent) return;
    showAlert(
      'Not Available',
      'Only a parent can manage a student account profile and password.',
      () => {
        if (typeof navigation?.canGoBack === 'function' && navigation.canGoBack()) navigation.goBack();
        else navigation.reset?.({ index: 0, routes: [{ name: 'Home' }] });
      },
    );
  }, [isStudent, navigation]);

  const passwordStrength = (pw) => {
    if (pw.length === 0) return null;
    if (pw.length < 6)  return { label: 'Too short',  color: '#F44336', width: '20%' };
    if (pw.length < 8)  return { label: 'Weak',       color: '#FF9800', width: '40%' };
    if (pw.length < 12) return { label: 'Good',       color: '#FFC107', width: '65%' };
    return                       { label: 'Strong',    color: '#4CAF50', width: '100%' };
  };

  const strength = passwordStrength(newPass);

  const handleChange = async () => {
    if (isStudent) return;
    if (!newPass || !confirm) {
      Alert.alert('Missing Fields', 'Please fill in both password fields.');
      return;
    }
    if (newPass.length < 6) {
      Alert.alert('Too Short', 'Password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirm) {
      Alert.alert('Mismatch', 'The new passwords do not match. Please try again.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPass });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Password Updated ✓', 'Your password has been changed successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0288D1', '#01579B']} style={styles.header}>
        <GoBackBtn />
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Ionicons name="shield-checkmark" size={40} color="#0288D1" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Secure Your Account</Text>
            <Text style={styles.bannerSub}>Use a strong password with at least 8 characters.</Text>
          </View>
        </View>

        <View style={styles.form}>
          <PasswordField
            label="NEW PASSWORD"
            value={newPass}
            onChangeText={setNewPass}
            show={showNew}
            onToggle={() => setShowNew(v => !v)}
            placeholder="At least 6 characters"
          />

          {/* Strength indicator */}
          {strength && (
            <View style={styles.strengthRow}>
              <View style={styles.strengthBarBg}>
                <View style={[styles.strengthBarFill, { width: strength.width, backgroundColor: strength.color }]} />
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
            </View>
          )}

          <PasswordField
            label="CONFIRM NEW PASSWORD"
            value={confirm}
            onChangeText={setConfirm}
            show={showConfirm}
            onToggle={() => setShowConfirm(v => !v)}
            placeholder="Repeat new password"
          />

          {/* Match indicator */}
          {confirm.length > 0 && (
            <View style={styles.matchRow}>
              <Ionicons
                name={newPass === confirm ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={newPass === confirm ? '#4CAF50' : '#F44336'}
              />
              <Text style={[styles.matchText, { color: newPass === confirm ? '#4CAF50' : '#F44336' }]}>
                {newPass === confirm ? 'Passwords match' : 'Passwords do not match'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, (loading || !newPass || !confirm) && styles.saveBtnDisabled]}
            onPress={handleChange}
            disabled={loading || !newPass || !confirm}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>Update Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ECEFF1' },
  header: {
    paddingTop: 55, paddingBottom: 20, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  body: { padding: 20, paddingBottom: 60 },

  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#E3F2FD', borderRadius: 16, padding: 16, marginBottom: 20,
  },
  bannerIcon: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    elevation: 2,
  },
  bannerTitle: { fontSize: 15, fontWeight: 'bold', color: '#01579B' },
  bannerSub: { fontSize: 12, color: '#4FC3F7', marginTop: 3 },

  form: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 2 },
  fieldGroup: { marginBottom: 8 },
  fieldLabel: {
    fontSize: 11, fontWeight: 'bold', color: '#90A4AE',
    marginTop: 10, marginBottom: 6, letterSpacing: 0.8,
  },
  inputBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderColor: '#CFD8DC', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 11, backgroundColor: '#F9FAFB',
  },
  input: { flex: 1, fontSize: 15, color: '#333' },

  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, marginTop: 4 },
  strengthBarBg: { flex: 1, height: 5, backgroundColor: '#ECEFF1', borderRadius: 3, overflow: 'hidden' },
  strengthBarFill: { height: 5, borderRadius: 3 },
  strengthLabel: { fontSize: 11, fontWeight: 'bold', width: 55 },

  matchRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8, marginTop: 4 },
  matchText: { fontSize: 12 },

  saveBtn: {
    flexDirection: 'row', backgroundColor: '#0288D1', borderRadius: 14,
    padding: 15, justifyContent: 'center', alignItems: 'center',
    marginTop: 20, gap: 8, elevation: 2,
  },
  saveBtnDisabled: { backgroundColor: '#90CAF9' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
