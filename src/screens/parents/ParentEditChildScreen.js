import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, ScrollView, Image, ActivityIndicator, Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import GoBackBtn from '../../components/GoBackBtn';
import { useTheme } from '../../context/ThemeContext';

const showAlert = (title, message, onOk) => {
  if (Platform.OS === 'web') { window.alert(`${title}\n\n${message}`); onOk?.(); }
  else { Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]); }
};

const AVATAR_COLORS = ['#E91E63','#9C27B0','#3F51B5','#2196F3','#009688','#FF9800'];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

export default function ParentEditChildScreen({ route, navigation }) {
  const { theme, a11yTextStyle, getBgColor } = useTheme();
  const { child } = route.params;
  const childProfile = child?.profiles;
  const studentId    = childProfile?.id ?? child?.student_id;

  const [fullName,        setFullName]        = useState(childProfile?.full_name || '');
  const [email,           setEmail]           = useState(childProfile?.email || '');
  const [avatarUrl,       setAvatarUrl]       = useState(childProfile?.avatar_url || null);
  const [bannerUrl,       setBannerUrl]       = useState(childProfile?.banner_url || null);
  const [uploading,       setUploading]       = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [saving,          setSaving]          = useState(false);

  // ── Generic upload helper ────────────────────────────────────────────────
  const uploadToStorage = async (asset, bucket, fileName) => {
    const mimeType = asset.mimeType || 'image/jpeg';
    const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const fullPath = `${fileName}.${ext}`;
    let blob;
    if (asset.file) {
      blob = asset.file;
    } else {
      const response = await fetch(asset.uri);
      blob = await response.blob();
    }
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fullPath, blob, { contentType: mimeType, upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(fullPath);
    return `${data.publicUrl}?t=${Date.now()}`;
  };

  // ── Avatar picker ────────────────────────────────────────────────────────
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) uploadAvatar(result.assets[0]);
  };

  const uploadAvatar = async (asset) => {
    setUploading(true);
    try {
      const newUrl = await uploadToStorage(asset, 'avatars', studentId);
      setAvatarUrl(newUrl);
    } catch (e) {
      showAlert('Upload Failed', e.message);
    } finally {
      setUploading(false);
    }
  };

  // ── Banner picker ────────────────────────────────────────────────────────
  const pickBanner = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [16, 9], quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) uploadBanner(result.assets[0]);
  };

  const uploadBanner = async (asset) => {
    setBannerUploading(true);
    try {
      const newUrl = await uploadToStorage(asset, 'avatars', `banner_${studentId}`);
      setBannerUrl(newUrl);
    } catch (e) {
      showAlert('Upload Failed', e.message);
    } finally {
      setBannerUploading(false);
    }
  };

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

    const updates = { full_name: fullName.trim(), email: email.trim() };
    if (avatarUrl && avatarUrl !== childProfile?.avatar_url) updates.avatar_url = avatarUrl;

    const { data: result, error } = await supabase
      .rpc('parent_update_child_profile', {
        p_student_id: studentId,
        p_full_name:  updates.full_name,
        p_email:      updates.email,
        p_avatar_url: updates.avatar_url ?? null,
      });

    // Save banner separately (direct update)
    if (!error && !result?.error && bannerUrl && bannerUrl !== childProfile?.banner_url) {
      await supabase.from('profiles').update({ banner_url: bannerUrl }).eq('id', studentId);
    }

    setSaving(false);

    if (error) {
      showAlert('Error', error.message);
    } else if (result?.error) {
      showAlert('Error', result.error);
    } else {
      const message = updates.email !== childProfile?.email
        ? "Profile updated! A verification email has been sent to the new email address."
        : "Your child's profile has been updated!";
      showAlert('Saved ✓', message, () => navigation.goBack());
    }
  };

  const isChanged =
    fullName.trim() !== (childProfile?.full_name || '') ||
    email.trim()    !== (childProfile?.email || '') ||
    (avatarUrl && avatarUrl !== (childProfile?.avatar_url || null)) ||
    (bannerUrl && bannerUrl !== (childProfile?.banner_url || null));

  const displayName = fullName || childProfile?.full_name || 'Child';

  return (
    <View style={[styles.container, { backgroundColor: getBgColor() }]}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">

        {/* ── Banner + Avatar hero ── */}
        <View style={styles.bannerWrapper}>
          <TouchableOpacity onPress={pickBanner} disabled={bannerUploading} activeOpacity={0.85} style={{ flex: 1 }}>
            {bannerUrl ? (
              <Image source={{ uri: bannerUrl }} style={styles.bannerImg} />
            ) : (
              <LinearGradient colors={['#E8927C', '#C87456']} style={styles.bannerImg} />
            )}
            <View style={styles.bannerEditBtn}>
              {bannerUploading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="image-outline" size={14} color="#fff" />}
              <Text style={styles.bannerEditText}>{bannerUploading ? 'Uploading...' : 'Edit Cover'}</Text>
            </View>
          </TouchableOpacity>

          {/* Back button on top of banner */}
          <View style={styles.backBtnOnBanner}>
            <GoBackBtn tintColor="#fff" />
          </View>

          {/* Avatar overlapping bottom of banner */}
          <View style={styles.avatarOnBanner}>
            <TouchableOpacity onPress={pickImage} disabled={uploading} activeOpacity={0.8} style={styles.avatarWrapper}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: avatarColor(displayName) }]}>
                  <Text style={[styles.avatarInitial, a11yTextStyle]}>{displayName[0]?.toUpperCase() || '?'}</Text>
                </View>
              )}
              <View style={styles.cameraOverlay}>
                {uploading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Ionicons name="camera" size={14} color="#fff" />}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Page title + hint */}
        <Text style={[styles.pageTitle, a11yTextStyle]}>Edit Child Profile</Text>
        <Text style={[styles.avatarHint, a11yTextStyle]}>
          {uploading ? 'Uploading photo...' : bannerUploading ? 'Uploading cover...' : 'Tap photo or cover to change'}
        </Text>

        {/* ── Parental guidance notice ── */}
        <View style={styles.noticeBox}>
          <Ionicons name="shield-checkmark" size={18} color="#E8927C" style={{ marginRight: 8, marginTop: 1 }} />
          <Text style={[styles.noticeText, { fontSize: theme.fontSize - 1 }, a11yTextStyle]}>
            As the parent/guardian, you can update your child's display name and email address.
          </Text>
        </View>

        {/* ── Form ── */}
        <View style={styles.form}>
          <Text style={[styles.fieldLabel, { fontSize: theme.fontSize - 3 }, a11yTextStyle]}>CHILD'S DISPLAY NAME</Text>
          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={18} color="#90A4AE" />
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
            <Ionicons name="mail-outline" size={18} color="#90A4AE" />
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
            style={[styles.saveBtn, (!isChanged || saving || uploading || bannerUploading) && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!isChanged || saving || uploading || bannerUploading}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={[styles.saveBtnText, { fontSize: theme.fontSize + 2 }, a11yTextStyle]}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body:       { paddingBottom: 40 },

  // Banner hero
  bannerWrapper:  { width: '100%', height: 200, position: 'relative', marginBottom: 60 },
  bannerImg:      { width: '100%', height: 200 },
  bannerEditBtn:  {
    position: 'absolute', bottom: 72, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20,
  },
  bannerEditText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  backBtnOnBanner: { position: 'absolute', top: 44, left: 12 },
  avatarOnBanner:  { position: 'absolute', bottom: -50, left: 20 },
  avatarWrapper:   { position: 'relative' },
  avatar:          { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: '#fff' },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  avatarInitial:  { fontSize: 38, fontWeight: 'bold', color: '#fff' },
  cameraOverlay:  {
    position: 'absolute', bottom: 2, right: 2,
    backgroundColor: '#E8927C', borderRadius: 13,
    width: 26, height: 26, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },

  pageTitle:  { fontSize: 20, fontWeight: '800', color: '#222', marginHorizontal: 20, marginBottom: 2 },
  avatarHint: { fontSize: 12, color: '#aaa', marginHorizontal: 20, marginBottom: 16 },

  noticeBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#FFF0EB', borderRadius: 14,
    padding: 14, marginHorizontal: 20, marginBottom: 20,
    borderWidth: 1, borderColor: '#F5C4B0',
  },
  noticeText: { flex: 1, color: '#C87456', fontSize: 13, lineHeight: 19 },

  form:       { paddingHorizontal: 20 },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: '#E8927C', letterSpacing: 1, marginBottom: 6, marginTop: 16 },
  inputBox:   {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1.5, borderColor: '#E8D5CC',
    gap: 10, elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  input:      { flex: 1, fontSize: 15, color: '#333' },
  hintText:   { fontSize: 12, color: '#aaa', marginTop: 6, marginLeft: 4 },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#E8927C',
    borderRadius: 16, paddingVertical: 16, marginTop: 28,
    elevation: 3, shadowColor: '#E8927C', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  saveBtnDisabled: { backgroundColor: '#F5C4B0', elevation: 0 },
  saveBtnText:     { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
