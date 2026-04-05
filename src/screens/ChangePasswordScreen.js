import React, { useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, TextInput,
  Alert, ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader';
import ScreenWrapper from '../components/ScreenWrapper';
import AppText from '../components/AppText';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import tokens from '../theme/tokens';

const showAlert = (title, message, onOk) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    onOk?.();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
  }
};

const PasswordField = ({ label, value, onChangeText, show, onToggle, placeholder, colors }) => (
  <View style={styles.fieldGroup}>
    <AppText variant="label" style={[styles.fieldLabel, { color: colors.onSurfaceMuted }]}>{label}</AppText>
    <View style={[styles.inputBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <Ionicons name="lock-closed-outline" size={22} color={colors.onSurfaceMuted} />
      <TextInput
        style={[styles.input, { color: colors.onSurface }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.onSurfaceMuted}
        secureTextEntry={!show}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
      />
      <TouchableOpacity onPress={onToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.onSurfaceMuted} />
      </TouchableOpacity>
    </View>
  </View>
);

export default function ChangePasswordScreen({ navigation }) {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const isStudent = profile?.role === 'student';

  const [newPass, setNewPass]         = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);

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
    if (pw.length === 0)  return null;
    if (pw.length < 6)   return { label: 'Too short', color: '#F44336', width: '20%' };
    if (pw.length < 8)   return { label: 'Weak',      color: '#FF9800', width: '40%' };
    if (pw.length < 12)  return { label: 'Good',      color: '#FFC107', width: '65%' };
    return                       { label: 'Strong',   color: '#4CAF50', width: '100%' };
  };

  const strength = passwordStrength(newPass);

  const handleChange = async () => {
    if (isStudent) return;
    if (!newPass || !confirm) { Alert.alert('Missing Fields', 'Please fill in both password fields.'); return; }
    if (newPass.length < 6)  { Alert.alert('Too Short', 'Password must be at least 6 characters.'); return; }
    if (newPass !== confirm)  { Alert.alert('Mismatch', 'The new passwords do not match. Please try again.'); return; }

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
    <ScreenWrapper padded={false} edges={['left', 'right', 'bottom']}>
      <AppHeader title="Change Password" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">

        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: colors.primaryLight }]}>
          <View style={[styles.bannerIcon, { backgroundColor: colors.surfaceCard }, tokens.shadows.low]}>
            <Ionicons name="shield-checkmark" size={40} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="body" style={{ fontWeight: 'bold', color: colors.primary }}>Secure Your Account</AppText>
            <AppText variant="caption" style={{ color: colors.onSurfaceMuted, marginTop: 3 }}>Use a strong password with at least 8 characters.</AppText>
          </View>
        </View>

        <View style={[styles.form, { backgroundColor: colors.surfaceCard }, tokens.shadows.low]}>
          <PasswordField
            label="NEW PASSWORD"
            value={newPass}
            onChangeText={setNewPass}
            show={showNew}
            onToggle={() => setShowNew(v => !v)}
            placeholder="At least 6 characters"
            colors={colors}
          />

          {strength && (
            <View style={styles.strengthRow}>
              <View style={[styles.strengthBarBg, { backgroundColor: colors.border }]}>
                <View style={[styles.strengthBarFill, { width: strength.width, backgroundColor: strength.color }]} />
              </View>
              <AppText variant="caption" style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</AppText>
            </View>
          )}

          <PasswordField
            label="CONFIRM NEW PASSWORD"
            value={confirm}
            onChangeText={setConfirm}
            show={showConfirm}
            onToggle={() => setShowConfirm(v => !v)}
            placeholder="Repeat new password"
            colors={colors}
          />

          {confirm.length > 0 && (
            <View style={styles.matchRow}>
              <Ionicons
                name={newPass === confirm ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={newPass === confirm ? '#4CAF50' : '#F44336'}
              />
              <AppText variant="caption" style={{ color: newPass === confirm ? '#4CAF50' : '#F44336' }}>
                {newPass === confirm ? 'Passwords match' : 'Passwords do not match'}
              </AppText>
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary }, (loading || !newPass || !confirm) && { opacity: 0.5 }]}
            onPress={handleChange}
            disabled={loading || !newPass || !confirm}
          >
            {loading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={colors.onPrimary} />
                <AppText variant="body" style={{ color: colors.onPrimary, fontWeight: 'bold', marginLeft: tokens.spacing.sm }}>Update Password</AppText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  body:          { padding: tokens.spacing.md, paddingBottom: 60 },
  banner:        { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.md, borderRadius: tokens.radius.lg, padding: tokens.spacing.md, marginBottom: tokens.spacing.md },
  bannerIcon:    { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  form:          { borderRadius: tokens.radius.lg, padding: tokens.spacing.md },
  fieldGroup:    { marginBottom: tokens.spacing.xs },
  fieldLabel:    { letterSpacing: 0.8, marginTop: tokens.spacing.sm, marginBottom: tokens.spacing.xs },
  inputBox:      { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm, borderWidth: 1.5, borderRadius: tokens.radius.md, paddingHorizontal: tokens.spacing.sm, paddingVertical: 11 },
  input:         { flex: 1, fontSize: tokens.fontSize.md },
  strengthRow:   { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm, marginBottom: tokens.spacing.sm, marginTop: tokens.spacing.xs },
  strengthBarBg: { flex: 1, height: 5, borderRadius: 3, overflow: 'hidden' },
  strengthBarFill: { height: 5, borderRadius: 3 },
  strengthLabel: { fontWeight: 'bold', width: 55 },
  matchRow:      { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.xs, marginBottom: tokens.spacing.sm, marginTop: tokens.spacing.xs },
  saveBtn:       { flexDirection: 'row', borderRadius: tokens.radius.md, padding: tokens.spacing.md, justifyContent: 'center', alignItems: 'center', marginTop: tokens.spacing.lg },
});
