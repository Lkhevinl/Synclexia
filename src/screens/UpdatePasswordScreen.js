import React, { useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, TextInput,
  Alert, ScrollView, ActivityIndicator, StatusBar, Image,
  useWindowDimensions,
} from 'react-native';
import Icon from '../components/icons/Icon';
import { supabase } from '../lib/supabase';
import ScreenWrapper from '../components/ScreenWrapper';
import AppText from '../components/AppText';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import tokens from '../theme/tokens';

const ERROR_RED = '#E53935';
const SUCCESS_GREEN = '#4CAF50';

const passwordStrength = (pw) => {
  if (pw.length === 0)  return null;
  if (pw.length < 6)   return { label: 'Too short', color: '#F44336', width: '20%' };
  if (pw.length < 8)   return { label: 'Weak',      color: '#FF9800', width: '40%' };
  if (pw.length < 12)  return { label: 'Good',      color: '#FFC107', width: '65%' };
  return                       { label: 'Strong',   color: '#4CAF50', width: '100%' };
};

export default function UpdatePasswordScreen() {
  const { signOut } = useAuth();
  const { colors } = useTheme();
  const { height: SH } = useWindowDimensions();

  const [newPass,      setNewPass]      = useState('');
  const [confirm,      setConfirm]      = useState('');
  const [showNew,      setShowNew]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [done,         setDone]         = useState(false);

  const strength = passwordStrength(newPass);

  const handleUpdate = async () => {
    if (!newPass || !confirm) {
      Alert.alert('Missing Fields', 'Please fill in both password fields.');
      return;
    }
    if (newPass.length < 6) {
      Alert.alert('Too Short', 'Password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirm) {
      Alert.alert('Mismatch', 'The passwords do not match. Please try again.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPass });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setDone(true);
      setTimeout(() => signOut(), 2000);
    }
  };

  return (
    <ScreenWrapper padded={false}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <View style={[styles.illustrationArea, { height: SH * 0.32, backgroundColor: colors.surface }]}>
          <Image source={require('../../assets/7-removebg-preview.png')} style={styles.illustration} resizeMode="contain" />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surfaceCard, minHeight: SH * 0.68 }]}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/synclexia-logo2-removebg-preview.png')} style={styles.logo} resizeMode="contain" />
          </View>

          {done ? (
            <View style={styles.successWrap}>
              <View style={[styles.successCircle, { backgroundColor: SUCCESS_GREEN }]}>
                <Icon name="check" size="xl" color="#fff" />
              </View>
              <AppText variant="display" style={[styles.title, { color: colors.onSurface }]}>Password Updated!</AppText>
              <AppText variant="caption" style={[styles.subtitle, { color: colors.onSurfaceMuted }]}>
                Your password has been changed. Redirecting you to login…
              </AppText>
            </View>
          ) : (
            <>
              <AppText variant="display" style={[styles.title, { color: colors.onSurface }]}>Set New Password</AppText>
              <AppText variant="caption" style={[styles.subtitle, { color: colors.onSurfaceMuted }]}>
                Choose a strong password for your account.
              </AppText>

              <View style={styles.form}>
                <AppText variant="label" style={[styles.fieldLabel, { color: colors.onSurfaceMuted }]}>NEW PASSWORD</AppText>
                <View style={[styles.inputBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <Icon name="lock" size="md" color={colors.onSurfaceMuted} />
                  <TextInput
                    style={[styles.input, { color: colors.onSurface }]}
                    value={newPass}
                    onChangeText={setNewPass}
                    placeholder="At least 6 characters"
                    placeholderTextColor={colors.onSurfaceMuted}
                    secureTextEntry={!showNew}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                  <TouchableOpacity onPress={() => setShowNew(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Icon name={showNew ? 'eye-off' : 'eye'} size="sm" color={colors.onSurfaceMuted} />
                  </TouchableOpacity>
                </View>

                {strength && (
                  <View style={styles.strengthRow}>
                    <View style={[styles.strengthBarBg, { backgroundColor: colors.border }]}>
                      <View style={[styles.strengthBarFill, { width: strength.width, backgroundColor: strength.color }]} />
                    </View>
                    <AppText variant="caption" style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</AppText>
                  </View>
                )}

                <AppText variant="label" style={[styles.fieldLabel, { color: colors.onSurfaceMuted, marginTop: tokens.spacing.sm }]}>CONFIRM PASSWORD</AppText>
                <View style={[styles.inputBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <Icon name="lock" size="md" color={colors.onSurfaceMuted} />
                  <TextInput
                    style={[styles.input, { color: colors.onSurface }]}
                    value={confirm}
                    onChangeText={setConfirm}
                    placeholder="Repeat new password"
                    placeholderTextColor={colors.onSurfaceMuted}
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleUpdate}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(v => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Icon name={showConfirm ? 'eye-off' : 'eye'} size="sm" color={colors.onSurfaceMuted} />
                  </TouchableOpacity>
                </View>

                {confirm.length > 0 && (
                  <View style={styles.matchRow}>
                    <Icon
                      name={newPass === confirm ? 'check-circle' : 'x-circle'}
                      size="xs"
                      color={newPass === confirm ? SUCCESS_GREEN : ERROR_RED}
                    />
                    <AppText variant="caption" style={{ color: newPass === confirm ? SUCCESS_GREEN : ERROR_RED }}>
                      {newPass === confirm ? 'Passwords match' : 'Passwords do not match'}
                    </AppText>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.primary }, (loading || !newPass || !confirm) && { opacity: 0.5 }]}
                  onPress={handleUpdate}
                  disabled={loading || !newPass || !confirm}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.onPrimary} />
                  ) : (
                    <>
                      <Icon name="check-circle" size="md" color={colors.onPrimary} />
                      <AppText variant="body" style={{ color: colors.onPrimary, fontWeight: 'bold', marginLeft: tokens.spacing.sm }}>
                        Update Password
                      </AppText>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  illustrationArea: { justifyContent: 'center', alignItems: 'center' },
  illustration:     { width: '70%', height: '80%' },
  card:             { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: tokens.spacing.lg, paddingTop: tokens.spacing.md },
  logoContainer:    { alignItems: 'center', marginBottom: tokens.spacing.sm },
  logo:             { width: 100, height: 40 },
  title:            { textAlign: 'center', fontWeight: 'bold', marginBottom: tokens.spacing.xs },
  subtitle:         { textAlign: 'center', color: '#888', marginBottom: tokens.spacing.lg },
  form:             { marginTop: tokens.spacing.sm },
  fieldLabel:       { letterSpacing: 0.8, marginBottom: tokens.spacing.xs },
  inputBox:         { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm, borderWidth: 1.5, borderRadius: tokens.radius.md, paddingHorizontal: tokens.spacing.sm, paddingVertical: 11, marginBottom: tokens.spacing.xs },
  input:            { flex: 1, fontSize: tokens.fontSize.md },
  strengthRow:      { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm, marginBottom: tokens.spacing.sm, marginTop: tokens.spacing.xs },
  strengthBarBg:    { flex: 1, height: 5, borderRadius: 3, overflow: 'hidden' },
  strengthBarFill:  { height: 5, borderRadius: 3 },
  strengthLabel:    { fontWeight: 'bold', width: 55 },
  matchRow:         { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.xs, marginBottom: tokens.spacing.sm, marginTop: tokens.spacing.xs },
  saveBtn:          { flexDirection: 'row', borderRadius: tokens.radius.md, padding: tokens.spacing.md, justifyContent: 'center', alignItems: 'center', marginTop: tokens.spacing.lg },
  successWrap:      { alignItems: 'center', paddingTop: tokens.spacing.lg },
  successCircle:    { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: tokens.spacing.lg },
});
