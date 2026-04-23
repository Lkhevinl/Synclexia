import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, Image, ActivityIndicator, Platform,
} from 'react-native';
import Icon from '../../components/icons/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import GoBackBtn from '../../components/GoBackBtn';
import ScreenWrapper from '../../components/ScreenWrapper';
import tokens from '../../theme/tokens';
import { useTheme } from '../../context/ThemeContext';

const showAlert = (title, message, onOk) => {
  if (Platform.OS === 'web') { window.alert(`${title}\n\n${message}`); onOk?.(); }
  else { Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]); }
};

const AVATAR_COLORS = ['#E91E63','#9C27B0','#3F51B5','#2196F3','#009688','#FF9800'];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

export default function ParentEditChildScreen({ route, navigation }) {
  const { theme, colors, a11yTextStyle } = useTheme();
  const { child } = route.params;
  const childProfile = child?.profiles;
  const studentId    = childProfile?.id ?? child?.student_id;

  const [fullName, setFullName] = useState(childProfile?.full_name || '');
  const [email,    setEmail]    = useState(childProfile?.email || '');
  const [saving,   setSaving]   = useState(false);

  const avatarUrl = childProfile?.avatar_url || null;
  const bannerUrl = childProfile?.banner_url || null;

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!fullName.trim()) {
      showAlert('Validation', "Child's name cannot be empty.");
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showAlert('Validation', 'Please enter a valid email address.');
      return;
    }
    setSaving(true);

    const { data: result, error } = await supabase
      .rpc('parent_update_child_profile', {
        p_student_id: studentId,
        p_full_name:  fullName.trim(),
        p_email:      email.trim(),
        p_avatar_url: null,
      });

    setSaving(false);

    if (error) {
      showAlert('Error', error.message);
    } else if (result?.error) {
      showAlert('Error', result.error);
    } else {
      const message = email.trim() !== childProfile?.email
        ? "Profile updated! A verification email has been sent to the new email address."
        : "Your child's profile has been updated!";
      showAlert('Saved ✓', message, () => navigation.goBack());
    }
  };

  const isChanged =
    fullName.trim() !== (childProfile?.full_name || '') ||
    email.trim()    !== (childProfile?.email || '');

  const displayName = fullName || childProfile?.full_name || 'Child';

  return (
    <ScreenWrapper role="parent" scrollable>
      {/* ── Banner + Avatar hero ── */}
      <View style={styles.bannerWrapper}>
        <View style={{ flex: 1 }}>
          {bannerUrl ? (
            <Image source={{ uri: bannerUrl }} style={styles.bannerImg} />
          ) : (
            <LinearGradient colors={colors.headerGradient} style={styles.bannerImg} />
          )}
        </View>

        {/* Back button on top of banner */}
        <View style={styles.backBtnOnBanner}>
          <GoBackBtn tintColor="#fff" />
        </View>

        {/* Avatar overlapping bottom of banner */}
        <View style={styles.avatarOnBanner}>
          <View style={styles.avatarWrapper}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: avatarColor(displayName) }]}>
                <Text style={[styles.avatarInitial, a11yTextStyle]}>{displayName[0]?.toUpperCase() || '?'}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Page title */}
      <Text style={[styles.pageTitle, a11yTextStyle]}>Edit Child Profile</Text>

        {/* ── Parental guidance notice ── */}
        <View style={styles.noticeBox}>
          <Icon name="shield-check" size="md" color="#E8927C" style={{ marginRight: 8, marginTop: 1 }} />
          <Text style={[styles.noticeText, { fontSize: theme.fontSize - 1 }, a11yTextStyle]}>
            As the parent/guardian, you can update your child's display name and email address.
          </Text>
        </View>

        {/* ── Form ── */}
        <View style={styles.form}>
          <Text style={[styles.fieldLabel, { fontSize: theme.fontSize - 3 }, a11yTextStyle]}>CHILD'S DISPLAY NAME</Text>
          <View style={styles.inputBox}>
            <Icon name="user" size="md" color="#90A4AE" />
            <TextInput
              style={[styles.input, { fontSize: theme.fontSize }, a11yTextStyle]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Child's full name"
              returnKeyType="next"
            />
          </View>

          <Text style={[styles.fieldLabel, { fontSize: theme.fontSize - 3 }, a11yTextStyle]}>CHILD'S EMAIL</Text>
          <View style={styles.inputBox}>
            <Icon name="mail" size="md" color="#90A4AE" />
            <TextInput
              style={[styles.input, { fontSize: theme.fontSize }, a11yTextStyle]}
              value={email}
              onChangeText={setEmail}
              placeholder="child@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
            />
          </View>
          <Text style={[styles.hintText, { fontSize: theme.fontSize - 2 }, a11yTextStyle]}>
            Changing the email will send a verification link to the new address.
          </Text>

          <TouchableOpacity
            style={[styles.saveBtn, (!isChanged || saving) && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!isChanged || saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="check-circle" size="md" color="#fff" />
                <Text style={[styles.saveBtnText, { fontSize: theme.fontSize + 2 }, a11yTextStyle]}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  // Banner hero
  bannerWrapper:  { width: '100%', height: 200, position: 'relative', marginBottom: 60, marginHorizontal: -tokens.spacing.md },
  bannerImg:      { width: '100%', height: 200 },
  backBtnOnBanner: { position: 'absolute', top: 44, left: tokens.spacing.md },
  avatarOnBanner:  { position: 'absolute', bottom: -50, left: tokens.spacing.lg },
  avatarWrapper:   { position: 'relative' },
  avatar:          { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: '#fff' },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  avatarInitial:  { fontSize: 38, fontWeight: 'bold', color: '#fff' },

  pageTitle:  { fontSize: 20, fontWeight: '800', color: '#222', marginBottom: 2 },

  noticeBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#FFF0EB', borderRadius: tokens.radius.md,
    padding: 14, marginBottom: tokens.spacing.lg,
    borderWidth: 1, borderColor: '#F5C4B0',
  },
  noticeText: { flex: 1, color: '#C87456', fontSize: 13, lineHeight: 19 },

  form:       { },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: '#E8927C', letterSpacing: 1, marginBottom: 6, marginTop: tokens.spacing.md },
  inputBox:   {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: tokens.radius.md,
    paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1.5, borderColor: '#E8D5CC',
    gap: 10, ...tokens.shadows.low,
  },
  input:      { flex: 1, fontSize: 15, color: '#333' },
  hintText:   { fontSize: 12, color: '#aaa', marginTop: 6, marginLeft: tokens.spacing.xs },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: tokens.spacing.sm, backgroundColor: '#E8927C',
    borderRadius: tokens.radius.md, paddingVertical: tokens.spacing.md, marginTop: tokens.spacing.xl,
    ...tokens.shadows.mid,
  },
  saveBtnDisabled: { backgroundColor: '#F5C4B0', elevation: 0, shadowOpacity: 0 },
  saveBtnText:     { color: '#fff', fontSize: 16, fontWeight: 'bold' },

});
