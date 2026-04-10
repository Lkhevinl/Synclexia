import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Platform, ScrollView, Image, ActivityIndicator,
} from 'react-native';
import Icon from '../components/icons/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { TABLES } from '../lib/constants';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/ScreenWrapper';
import AppText from '../components/AppText';
import CustomButton from '../components/CustomButton';
import GoBackBtn from '../components/GoBackBtn';
import tokens from '../theme/tokens';

const showAlert = (title, message, onOk) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    onOk?.();
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
  }
};

export default function ProfileScreen({ navigation }) {
  const { profile, fetchProfile } = useAuth();
  const { colors } = useTheme();
  const isStudent = profile?.role === 'student';

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (isStudent) { showAlert('View Only', 'Name and email can only be changed by a parent.'); return; }
    if (!fullName.trim()) { showAlert('Validation', 'Full name cannot be empty.'); return; }
    setSaving(true);
    const updates = { full_name: fullName.trim() };
    const { error } = await supabase.from(TABLES.PROFILES).update(updates).eq('id', profile.id);
    if (error) { showAlert('Error', error.message); setSaving(false); return; }
    const trimmedEmail = email.trim().toLowerCase();
    const finishSave = async () => { await fetchProfile(profile.id); setSaving(false); navigation.goBack(); };
    if (trimmedEmail && trimmedEmail !== profile?.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email: trimmedEmail });
      if (emailError) {
        showAlert('Profile Saved', `Name updated, but email change failed: ${emailError.message}`, finishSave);
      } else {
        await supabase.from(TABLES.PROFILES).update({ email: trimmedEmail }).eq('id', profile.id);
        showAlert('Check Your Email', 'Profile saved! A confirmation link was sent to the new email address.', finishSave);
      }
    } else {
      showAlert('Saved ✓', 'Profile updated successfully!', finishSave);
    }
  };

  const isChanged =
    fullName.trim() !== (profile?.full_name || '') ||
    email.trim().toLowerCase() !== (profile?.email || '');

  return (
    <ScreenWrapper padded={false}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        {/* Banner */}
        <View style={styles.bannerWrapper}>
          <LinearGradient colors={['#E8927C', '#C87456']} style={styles.bannerImg} />

          <View style={styles.backBtnOnBanner}><GoBackBtn /></View>

          <View style={styles.avatarOnBanner}>
            <View style={styles.avatarWrapper}>
              {profile?.avatar_url
                ? <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                : <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                    <Text style={styles.avatarInitial}>{fullName?.[0]?.toUpperCase() || profile?.full_name?.[0]?.toUpperCase() || '?'}</Text>
                  </View>
              }
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={[styles.form, { backgroundColor: colors.surfaceCard }, tokens.shadows.low]}>
          <AppText variant="label" style={[styles.fieldLabel, { color: colors.onSurfaceMuted }]}>FULL NAME</AppText>
          <View style={[styles.inputBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Icon name="user" size="md" color={colors.onSurfaceMuted} />
            <TextInput style={[styles.input, { color: colors.onSurface }]} value={fullName} onChangeText={setFullName} placeholder="Your full name" placeholderTextColor={colors.onSurfaceMuted} editable={!isStudent} returnKeyType="next" autoComplete="name" />
          </View>

          <AppText variant="label" style={[styles.fieldLabel, { color: colors.onSurfaceMuted }]}>EMAIL</AppText>
          <View style={[styles.inputBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Icon name="mail" size="md" color={colors.onSurfaceMuted} />
            <TextInput style={[styles.input, { color: colors.onSurface }]} value={email} onChangeText={setEmail} placeholder="Your email address" placeholderTextColor={colors.onSurfaceMuted} editable={!isStudent} keyboardType="email-address" autoCapitalize="none" returnKeyType="done" autoComplete="email" />
          </View>
          {!isStudent && <AppText variant="caption" style={{ color: colors.onSurfaceMuted, marginTop: tokens.spacing.xs, marginLeft: tokens.spacing.xs, marginBottom: tokens.spacing.xs }}>Changing email requires confirmation via the new address.</AppText>}

          {!isStudent && (
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }, (!isChanged || saving) && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={!isChanged || saving}
            >
              {saving ? <ActivityIndicator color={colors.onPrimary} /> : (
                <>
                  <Icon name="check-circle" size="md" color={colors.onPrimary} />
                  <AppText variant="body" style={{ color: colors.onPrimary, fontWeight: 'bold', marginLeft: tokens.spacing.sm }}>Save Changes</AppText>
                </>
              )}
            </TouchableOpacity>
          )}

          {!isStudent && (
            <TouchableOpacity style={[styles.changePassBtn, { backgroundColor: colors.primaryLight }]} onPress={() => navigation.navigate('ChangePassword')}>
              <Icon name="lock" size="md" color={colors.primary} />
              <AppText variant="body" style={{ flex: 1, color: colors.primary, fontWeight: 'bold', marginLeft: tokens.spacing.sm }}>Change Password</AppText>
              <Icon name="chevron-forward" size="sm" color={colors.onSurfaceMuted} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  bannerWrapper:  { width: '100%', height: 200, position: 'relative', marginBottom: 56 },
  bannerImg:      { width: '100%', height: 200 },
  backBtnOnBanner: { position: 'absolute', top: 44, left: 12 },
  avatarOnBanner: { position: 'absolute', bottom: -48, left: 20 },
  avatarWrapper:  { position: 'relative' },
  avatar:         { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#fff' },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  avatarInitial:  { fontSize: 34, fontWeight: 'bold' },

  form:        { borderRadius: tokens.radius.lg, padding: tokens.spacing.lg, marginHorizontal: tokens.spacing.md },
  fieldLabel:  { letterSpacing: 0.8, marginTop: tokens.spacing.md, marginBottom: tokens.spacing.sm },
  inputBox:    { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm, borderWidth: 1.5, borderRadius: tokens.radius.md, paddingHorizontal: tokens.spacing.sm, paddingVertical: 11 },
  input:       { flex: 1, fontSize: tokens.fontSize.md },
  saveBtn:     { flexDirection: 'row', borderRadius: tokens.radius.md, padding: tokens.spacing.md, justifyContent: 'center', alignItems: 'center', marginTop: tokens.spacing.lg },
  changePassBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: tokens.radius.md, padding: tokens.spacing.md, marginTop: tokens.spacing.sm },
});
