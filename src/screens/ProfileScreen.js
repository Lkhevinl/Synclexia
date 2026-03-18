import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Platform, ScrollView, Image, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import GoBackBtn from '../components/GoBackBtn';

// Cross-platform alert that works on both web and native
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
  const isStudent = profile?.role === 'student';

  useEffect(() => {
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

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);
  const [bannerUrl, setBannerUrl] = useState(profile?.banner_url || null);
  const [uploading, setUploading] = useState(false);   // avatar uploading
  const [bannerUploading, setBannerUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ─── Generic upload helper ────────────────────────────────────────────────
  const uploadImage = async (asset, bucket, fileName) => {
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

  // ─── Pick & Upload Avatar ────────────────────────────────────────────────
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission Required', 'Please allow photo library access to upload a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) {
      uploadAvatar(result.assets[0]);
    }
  };

  const uploadAvatar = async (asset) => {
    setUploading(true);
    try {
      const newUrl = await uploadImage(asset, 'avatars', profile.id);
      await supabase.from('profiles').update({ avatar_url: newUrl }).eq('id', profile.id);
      setAvatarUrl(newUrl);
      fetchProfile(profile.id).catch(() => {}); // fire-and-forget so spinner clears immediately
    } catch (e) {
      showAlert('Upload Failed', e.message);
    } finally {
      setUploading(false);
    }
  };

  // ─── Pick & Upload Banner ─────────────────────────────────────────────────
  const pickBanner = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission Required', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      uploadBanner(result.assets[0]);
    }
  };

  const uploadBanner = async (asset) => {
    setBannerUploading(true);
    try {
      const newUrl = await uploadImage(asset, 'avatars', `banner_${profile.id}`);
      await supabase.from('profiles').update({ banner_url: newUrl }).eq('id', profile.id);
      setBannerUrl(newUrl);
      fetchProfile(profile.id).catch(() => {}); // fire-and-forget so spinner clears immediately
    } catch (e) {
      showAlert('Upload Failed', e.message);
    } finally {
      setBannerUploading(false);
    }
  };

  // ─── Save Profile ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (isStudent) {
      showAlert('View Only', 'Students can view profile details but cannot edit them.');
      return;
    }

    if (!fullName.trim()) {
      showAlert('Validation', 'Full name cannot be empty.');
      return;
    }
    setSaving(true);

    const updates = { full_name: fullName.trim() };
    if (avatarUrl && avatarUrl !== profile?.avatar_url) {
      updates.avatar_url = avatarUrl;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    if (error) {
      showAlert('Error', error.message);
      setSaving(false);
      return;
    }

    // Handle email change separately (requires confirmation link)
    const trimmedEmail = email.trim().toLowerCase();

    // Helper — refresh context then navigate back
    const finishSave = async () => {
      await fetchProfile(profile.id);
      setSaving(false);
      navigation.goBack();
    };

    if (trimmedEmail && trimmedEmail !== profile?.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email: trimmedEmail });
      if (emailError) {
        showAlert(
          'Profile Saved',
          `Name updated, but email change failed: ${emailError.message}`,
          finishSave,
        );
      } else {
        await supabase.from('profiles').update({ email: trimmedEmail }).eq('id', profile.id);
        showAlert(
          'Check Your Email',
          'Profile saved! A confirmation link was sent to the new email address.',
          finishSave,
        );
      }
    } else {
      showAlert('Saved ✓', 'Profile updated successfully!', finishSave);
    }
  };

  const isChanged =
    fullName.trim() !== (profile?.full_name || '') ||
    email.trim().toLowerCase() !== (profile?.email || '') ||
    (avatarUrl && avatarUrl !== profile?.avatar_url) ||
    (bannerUrl && bannerUrl !== profile?.banner_url);

  return (
    <View style={styles.container}>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {/* ── Banner ── */}
        <View style={styles.bannerWrapper}>
          <TouchableOpacity onPress={pickBanner} disabled={bannerUploading || isStudent} activeOpacity={0.85} style={{ flex: 1 }}>
            {bannerUrl ? (
              <Image source={{ uri: bannerUrl }} style={styles.bannerImg} />
            ) : (
              <LinearGradient colors={['#0288D1', '#01579B']} style={styles.bannerImg} />
            )}
            <View style={styles.bannerEditBtn}>
              {bannerUploading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="image-outline" size={15} color="#fff" />}
              <Text style={styles.bannerEditText}>{bannerUploading ? 'Uploading...' : isStudent ? 'View Cover' : 'Edit Cover'}</Text>
            </View>
          </TouchableOpacity>

          {/* Back button sits on top of the banner */}
          <View style={styles.backBtnOnBanner}>
            <GoBackBtn />
          </View>

          {/* Avatar sits at the bottom of the banner */}
          <View style={styles.avatarOnBanner}>
            <TouchableOpacity onPress={pickImage} disabled={uploading || isStudent} activeOpacity={0.8} style={styles.avatarWrapper}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {fullName?.[0]?.toUpperCase() || profile?.full_name?.[0]?.toUpperCase() || '?'}
                  </Text>
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

        <Text style={styles.avatarHint}>
          {uploading ? 'Uploading photo...' : isStudent ? 'Profile is view-only for student accounts' : 'Tap photo or cover to change'}
        </Text>

        {/* ── Form ── */}
        <View style={styles.form}>
          <Text style={styles.fieldLabel}>FULL NAME</Text>
          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={18} color="#90A4AE" />
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
              editable={!isStudent}
              returnKeyType="next"
              nativeID="profile-fullname"
              autoComplete="name"
            />
          </View>

          <Text style={styles.fieldLabel}>EMAIL</Text>
          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={18} color="#90A4AE" />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Your email address"
              editable={!isStudent}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
              nativeID="profile-email"
              autoComplete="email"
            />
          </View>
          {!isStudent && (
            <Text style={styles.emailHint}>
              ⚠️ Changing email requires confirmation via the new address.
            </Text>
          )}

          {/* Save Button */}
          {!isStudent && (
            <TouchableOpacity
              style={[styles.saveBtn, (!isChanged || saving || uploading) && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!isChanged || saving || uploading}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Change Password shortcut */}
          {!isStudent && (
            <TouchableOpacity
              style={styles.changePassBtn}
              onPress={() => navigation.navigate('ChangePassword')}
            >
              <Ionicons name="lock-closed-outline" size={20} color="#0288D1" />
              <Text style={styles.changePassText}>Change Password</Text>
              <Ionicons name="chevron-forward" size={16} color="#90A4AE" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ECEFF1' },
  body: { paddingBottom: 60 },

  // Banner + avatar hero
  bannerWrapper: { width: '100%', height: 200, position: 'relative', marginBottom: 56 },
  bannerImg: { width: '100%', height: 200 },
  bannerEditBtn: {
    position: 'absolute', bottom: 70, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20,
  },
  bannerEditText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  backBtnOnBanner: { position: 'absolute', top: 44, left: 12 },
  avatarOnBanner: {
    position: 'absolute', bottom: -48, left: 20,
  },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 3, borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#0288D1', justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  avatarInitial: { fontSize: 34, fontWeight: 'bold', color: '#fff' },
  cameraOverlay: {
    position: 'absolute', bottom: 2, right: 2,
    backgroundColor: '#0277BD', borderRadius: 13, padding: 4,
    borderWidth: 2, borderColor: '#fff',
  },
  avatarHint: { color: '#90A4AE', fontSize: 12, textAlign: 'center', marginBottom: 16, marginTop: -8 },

  // Form
  form: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginHorizontal: 16, elevation: 2 },
  fieldLabel: {
    fontSize: 11, fontWeight: 'bold', color: '#90A4AE',
    marginTop: 14, marginBottom: 6, letterSpacing: 0.8,
  },
  inputBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderColor: '#CFD8DC', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 11, backgroundColor: '#F9FAFB',
  },
  input: { flex: 1, fontSize: 15, color: '#333' },
  emailHint: { fontSize: 11, color: '#B0BEC5', marginTop: 5, marginLeft: 4, marginBottom: 4 },

  saveBtn: {
    flexDirection: 'row', backgroundColor: '#0288D1', borderRadius: 14,
    padding: 15, justifyContent: 'center', alignItems: 'center',
    marginTop: 22, gap: 8, elevation: 2,
  },
  saveBtnDisabled: { backgroundColor: '#90CAF9' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  changePassBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD',
    borderRadius: 14, padding: 14, marginTop: 12, gap: 8,
  },
  changePassText: { flex: 1, color: '#0288D1', fontWeight: 'bold', fontSize: 15 },
});
