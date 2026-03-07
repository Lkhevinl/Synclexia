import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, ScrollView, Image, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import GoBackBtn from '../components/GoBackBtn';

export default function ProfileScreen({ navigation }) {
  const { profile, fetchProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ─── Pick & Upload Avatar ────────────────────────────────────────────────
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow photo library access to upload a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      uploadAvatar(result.assets[0]);
    }
  };

  const uploadAvatar = async (asset) => {
    setUploading(true);
    try {
      const ext = (asset.uri.split('.').pop() || 'jpg').toLowerCase();
      const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
      const fileName = `avatars/${profile.id}.${ext}`;

      // Decode base64 → ArrayBuffer
      const binary = atob(asset.base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, bytes.buffer, { contentType: mimeType, upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      // Cache-bust so Image re-renders
      setAvatarUrl(`${urlData.publicUrl}?t=${Date.now()}`);
    } catch (e) {
      Alert.alert('Upload Failed', e.message);
    }
    setUploading(false);
  };

  // ─── Save Profile ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validation', 'Full name cannot be empty.');
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
      Alert.alert('Error', error.message);
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
        Alert.alert(
          'Profile Saved',
          `Name updated, but email change failed: ${emailError.message}`,
          [{ text: 'OK', onPress: finishSave }],
        );
      } else {
        // Also update profiles table so email stays in sync (auth email change requires confirmation)
        await supabase.from('profiles').update({ email: trimmedEmail }).eq('id', profile.id);
        Alert.alert(
          'Check Your Email',
          'Profile saved! A confirmation link was sent to the new email address. Changes will apply once confirmed.',
          [{ text: 'OK', onPress: finishSave }],
        );
      }
    } else {
      Alert.alert('Saved ✓', 'Profile updated successfully!', [
        { text: 'OK', onPress: finishSave },
      ]);
    }
  };

  const isChanged =
    fullName.trim() !== (profile?.full_name || '') ||
    email.trim().toLowerCase() !== (profile?.email || '') ||
    (avatarUrl && avatarUrl !== profile?.avatar_url);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0288D1', '#01579B']} style={styles.header}>
        <GoBackBtn />
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {/* ── Avatar ── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} disabled={uploading} activeOpacity={0.8} style={styles.avatarWrapper}>
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
                : <Ionicons name="camera" size={16} color="#fff" />}
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>
            {uploading ? 'Uploading...' : 'Tap to change photo'}
          </Text>
        </View>

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
              returnKeyType="next"
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
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
            />
          </View>
          <Text style={styles.emailHint}>
            ⚠️ Changing email requires confirmation via the new address.
          </Text>

          {/* Save Button */}
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

          {/* Change Password shortcut */}
          <TouchableOpacity
            style={styles.changePassBtn}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#0288D1" />
            <Text style={styles.changePassText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={16} color="#90A4AE" />
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

  // Avatar
  avatarSection: { alignItems: 'center', marginVertical: 24 },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: '#0288D1',
  },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#0288D1', justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#01579B',
  },
  avatarInitial: { fontSize: 38, fontWeight: 'bold', color: '#fff' },
  cameraOverlay: {
    position: 'absolute', bottom: 2, right: 2,
    backgroundColor: '#0277BD', borderRadius: 14, padding: 5,
    borderWidth: 2, borderColor: '#fff',
  },
  avatarHint: { color: '#90A4AE', marginTop: 8, fontSize: 12 },

  // Form
  form: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 2 },
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
