import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, ScrollView, Image, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import GoBackBtn from '../../components/GoBackBtn';

const AVATAR_COLORS = ['#E91E63','#9C27B0','#3F51B5','#2196F3','#009688','#FF9800'];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

export default function ParentEditChildScreen({ route, navigation }) {
  // child is the parent_links row which has a nested `profiles` key
  const { child } = route.params;
  const childProfile = child?.profiles;
  const studentId    = childProfile?.id ?? child?.student_id;

  const [fullName,   setFullName]   = useState(childProfile?.full_name || '');
  const [avatarUrl,  setAvatarUrl]  = useState(childProfile?.avatar_url || null);
  const [uploading,  setUploading]  = useState(false);
  const [saving,     setSaving]     = useState(false);

  // ── Avatar picker ────────────────────────────────────────────────────────
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow photo library access to upload a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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
      const ext      = (asset.uri.split('.').pop() || 'jpg').toLowerCase();
      const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
      const fileName = `avatars/${studentId}.${ext}`;

      const binary = atob(asset.base64);
      const bytes  = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, bytes.buffer, { contentType: mimeType, upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setAvatarUrl(`${urlData.publicUrl}?t=${Date.now()}`);
    } catch (e) {
      Alert.alert('Upload Failed', e.message);
    }
    setUploading(false);
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validation', "Child's name cannot be empty.");
      return;
    }
    setSaving(true);

    const updates = { full_name: fullName.trim() };
    if (avatarUrl && avatarUrl !== childProfile?.avatar_url) {
      updates.avatar_url = avatarUrl;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', studentId);

    setSaving(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Saved ✓', "Your child's profile has been updated!", [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  const isChanged =
    fullName.trim() !== (childProfile?.full_name || '') ||
    (avatarUrl && avatarUrl !== (childProfile?.avatar_url || null));

  const displayName = fullName || childProfile?.full_name || 'Child';

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#7B1FA2', '#4A148C']} style={styles.header}>
        <GoBackBtn tintColor="#fff" />
        <Text style={styles.headerTitle}>Edit Child Profile</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">

        {/* ── Parental guidance notice ── */}
        <View style={styles.noticeBox}>
          <Ionicons name="shield-checkmark" size={20} color="#7B1FA2" style={{ marginRight: 8 }} />
          <Text style={styles.noticeText}>
            As the parent/guardian, you can update your child's display name and profile photo.
          </Text>
        </View>

        {/* ── Avatar ── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} disabled={uploading} activeOpacity={0.8} style={styles.avatarWrapper}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: avatarColor(displayName) }]}>
                <Text style={styles.avatarInitial}>{displayName[0]?.toUpperCase() || '?'}</Text>
              </View>
            )}
            <View style={styles.cameraOverlay}>
              {uploading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="camera" size={16} color="#fff" />}
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>
            {uploading ? 'Uploading...' : "Tap to change child's photo"}
          </Text>
        </View>

        {/* ── Form ── */}
        <View style={styles.form}>
          <Text style={styles.fieldLabel}>CHILD'S DISPLAY NAME</Text>
          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={18} color="#90A4AE" />
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Child's full name"
              returnKeyType="done"
            />
          </View>

          {/* Read-only info */}
          <Text style={styles.fieldLabel}>EMAIL (READ ONLY)</Text>
          <View style={[styles.inputBox, styles.inputBoxReadOnly]}>
            <Ionicons name="mail-outline" size={18} color="#B0BEC5" />
            <Text style={styles.readOnlyText}>{childProfile?.email || '—'}</Text>
          </View>
          <Text style={styles.hintText}>
            To change the email or password, please contact your school administrator.
          </Text>

          {/* XP info */}
          <View style={styles.xpRow}>
            <Ionicons name="trophy" size={18} color="#FF9800" style={{ marginRight: 6 }} />
            <Text style={styles.xpText}>Current XP: <Text style={{ color: '#FF9800', fontWeight: 'bold' }}>{childProfile?.xp ?? 0}</Text></Text>
          </View>

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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0FF' },

  header: {
    paddingTop: 55, paddingBottom: 20, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },

  body: { padding: 20 },

  noticeBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#F3E5F5', borderRadius: 12,
    padding: 14, marginBottom: 24,
    borderWidth: 1, borderColor: '#CE93D8',
  },
  noticeText: { flex: 1, color: '#4A148C', fontSize: 13, lineHeight: 19 },

  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#7B1FA2' },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#7B1FA2',
  },
  avatarInitial: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  cameraOverlay: {
    position: 'absolute', bottom: 2, right: 2,
    backgroundColor: '#7B1FA2', borderRadius: 14,
    width: 28, height: 28, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  avatarHint: { color: '#9C27B0', fontSize: 12, marginTop: 8 },

  form: {},
  fieldLabel: { fontSize: 11, fontWeight: 'bold', color: '#7B1FA2', letterSpacing: 1, marginBottom: 6, marginTop: 16 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: '#E1BEE7',
    gap: 10,
  },
  inputBoxReadOnly: { backgroundColor: '#FAFAFA', borderColor: '#E0E0E0' },
  input: { flex: 1, fontSize: 15, color: '#333' },
  readOnlyText: { flex: 1, fontSize: 15, color: '#90A4AE' },

  hintText: { fontSize: 12, color: '#90A4AE', marginTop: 6, marginLeft: 4 },

  xpRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF8E1', borderRadius: 10,
    padding: 12, marginTop: 16,
    borderWidth: 1, borderColor: '#FFE082',
  },
  xpText: { fontSize: 14, color: '#555' },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#7B1FA2',
    borderRadius: 14, paddingVertical: 15, marginTop: 28,
  },
  saveBtnDisabled: { backgroundColor: '#CE93D8' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
