import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import GoBackBtn from '../components/GoBackBtn'; // <--- We keep the back button here

export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [credentialUri, setCredentialUri] = useState(null);
  const [credentialFileName, setCredentialFileName] = useState('');

  const pickCredential = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload a credential.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      setCredentialUri(asset.uri);
      setCredentialFileName(asset.fileName || `credential_${Date.now()}.jpg`);
    }
  };

  const generateUniqueCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const handleSignUp = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();

    if (!trimmedEmail || !password || !trimmedName) {
      Alert.alert('Missing Info', 'Please fill in all the boxes!');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // Require at least 8 characters
    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match. Please try again.');
      return;
    }

    // Guard against multiple rapid taps
    if (loading) return;
    setLoading(true);

    try {
      // 1. Create Auth User
      // Pass role in metadata so the DB trigger can set the correct
      // role and status (pending for teachers) on the auto-created profile.
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password,
        options: {
          data: { role, full_name: trimmedName },
        },
      });

      if (error) {
        console.error('[SignUp] Auth error:', JSON.stringify(error, null, 2));

        // Map known error codes / messages to friendly text
        let title = 'Sign Up Failed';
        let message = error.message || 'An unknown error occurred.';

        if (error.status === 500 || message.toLowerCase().includes('internal server error')) {
          title = 'Server Error (500)';
          message =
            'Supabase returned an internal server error.\n\n' +
            'Possible causes:\n' +
            '• A database trigger on auth.users is failing\n' +
            '• Email provider is not configured in Supabase\n' +
            '• The profiles table is missing required columns\n\n' +
            `Raw: ${error.message}`;
        } else if (error.status === 422 || message.toLowerCase().includes('already registered')) {
          title = 'Email Already In Use';
          message = 'An account with this email already exists. Please log in instead.';
        } else if (message.toLowerCase().includes('password')) {
          title = 'Weak Password';
        } else if (message.toLowerCase().includes('email')) {
          title = 'Invalid Email';
        }

        Alert.alert(title, message);
        setLoading(false);
        return;
      }

      const user = data?.user;

      // Supabase may return a fake user (no identities) if the email is already taken
      if (!user || (user.identities && user.identities.length === 0)) {
        Alert.alert(
          'Email Already Registered',
          'An account with this email already exists. Please log in instead.'
        );
        setLoading(false);
        return;
      }

      // 2. Create / overwrite Profile in Database.
      // We use UPSERT (onConflict: 'id') because some Supabase setups have a
      // trigger that auto-creates a profile with the default role='student'.
      // Upserting guarantees the role the user selected is always persisted.
      // Upload teacher credential if provided
      let credentialUrl = null;
      if (role === 'teacher' && credentialUri) {
        try {
          const response = await fetch(credentialUri);
          const blob = await response.blob();
          const fileExt = credentialFileName.split('.').pop() || 'jpg';
          const filePath = `${user.id}/credential_${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('teacher-credentials')
            .upload(filePath, blob, { contentType: `image/${fileExt}`, upsert: true });
          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('teacher-credentials')
              .getPublicUrl(filePath);
            credentialUrl = urlData?.publicUrl || null;
          } else {
            console.warn('[SignUp] Credential upload error:', uploadError.message);
          }
        } catch (uploadErr) {
          console.warn('[SignUp] Credential upload failed:', uploadErr);
        }
      }

      const profileData = { 
        id: user.id, 
        full_name: trimmedName,
        email: trimmedEmail,
        xp: 0,
        role,
        // Teachers require admin approval before they can access the app
        ...(role === 'teacher' && { status: 'pending', credential_url: credentialUrl }),
      };

      // Students get a unique_code for parent-linking.
      // Teachers get a teacher_code for student enrollment (manual entry fallback).
      // Retry up to 5 times to handle rare collisions on the UNIQUE constraint.
      let profileError = null;
      if (role === 'student') {
        for (let attempt = 0; attempt < 5; attempt++) {
          profileData.unique_code = generateUniqueCode();
          const result = await supabase
            .from('profiles')
            .upsert([profileData], { onConflict: 'id' });
          profileError = result.error;
          // '23505' = unique_violation on unique_code; retry with a new code
          if (!profileError || profileError.code !== '23505') break;
        }
      } else if (role === 'teacher') {
        for (let attempt = 0; attempt < 5; attempt++) {
          profileData.teacher_code = generateUniqueCode();
          const result = await supabase
            .from('profiles')
            .upsert([profileData], { onConflict: 'id' });
          profileError = result.error;
          // '23505' = unique_violation on teacher_code; retry with a new code
          if (!profileError || profileError.code !== '23505') break;
        }
      } else {
        const result = await supabase
          .from('profiles')
          .upsert([profileData], { onConflict: 'id' });
        profileError = result.error;
      }

      if (profileError) {
        console.error('[SignUp] Profile upsert error:', JSON.stringify(profileError, null, 2));
        Alert.alert(
          'Profile Save Failed',
          `Could not save your profile.\n\nError [${profileError.code}]: ${profileError.message}\n\nHint: ${profileError.hint || 'Check Supabase logs for details.'}`
        );
      } else {
        // Sign out immediately so the auto-session from signUp doesn't
        // cause a race condition where AuthContext fetches a null profile.
        // The user must log in fresh to get their profile loaded correctly.
        await supabase.auth.signOut();
        if (role === 'teacher') {
          Alert.alert(
            'Account Submitted!',
            'Your teacher account is pending admin approval. You will be notified once it is activated.'
          );
        } else {
          Alert.alert(
            'Account Created!',
            'Please check your email to verify your account, then log in.'
          );
        }
      }
    } catch (e) {
      console.error('[SignUp] Unexpected error:', e);
      Alert.alert(
        'Unexpected Error',
        `Something went wrong.\n\n${e.message || String(e)}\n\nCheck the console for more details.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <GoBackBtn /> 
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.iconCircle}>
                    <Ionicons name="person-add" size={40} color="#fff" />
                </View>
                <Text style={styles.title}>Join Synclexia</Text>
                <Text style={styles.subtitle}>Start your learning adventure!</Text>
            </View>

            {/* GLASS CARD */}
            <View style={styles.card}>
                
                {/* Full Name Input */}
                <Text style={styles.label}>What should we call you?</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Full Name (e.g. Kevin)"
                        placeholderTextColor="#999"
                        value={fullName}
                        onChangeText={setFullName}
                    />
                </View>

                {/* Email Input */}
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="student@example.com"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                {/* Password Input */}
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Pick a strong password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                {/* Confirm Password Input */}
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Re-enter your password"
                        placeholderTextColor="#999"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />
                </View>

                {/* Account Type */}
                <Text style={styles.label}>I am a</Text>
                <View style={styles.roleRow}>
                  <TouchableOpacity
                    style={[styles.roleBtn, role === 'student' && styles.roleBtnActive]}
                    onPress={() => setRole('student')}
                  >
                    <Text style={[styles.roleText, role === 'student' && styles.roleTextActive]}>Student</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.roleBtn, role === 'teacher' && styles.roleBtnActive]}
                    onPress={() => setRole('teacher')}
                  >
                    <Text style={[styles.roleText, role === 'teacher' && styles.roleTextActive]}>Teacher</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.roleBtn, role === 'parent' && styles.roleBtnActive]}
                    onPress={() => setRole('parent')}
                  >
                    <Text style={[styles.roleText, role === 'parent' && styles.roleTextActive]}>Parent</Text>
                  </TouchableOpacity>
                </View>

                {/* Teacher Verification Section */}
                {role === 'teacher' && (
                  <View style={styles.teacherVerifyBox}>
                    {/* School Email Notice */}
                    <View style={styles.teacherInfoRow}>
                      <Ionicons name="school-outline" size={20} color="#1565C0" style={{ marginRight: 8, marginTop: 2 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.teacherInfoTitle}>School Email Verification</Text>
                        <Text style={styles.teacherInfoText}>
                          Please register using your <Text style={styles.bold}>school-issued email</Text>. A verification link will be sent to it automatically. Once verified, your account goes to admin for final approval.
                        </Text>
                      </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Credential Upload */}
                    <View style={styles.teacherInfoRow}>
                      <Ionicons name="id-card-outline" size={20} color="#1565C0" style={{ marginRight: 8, marginTop: 2 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.teacherInfoTitle}>Upload Teaching Credential <Text style={styles.optionalTag}>(Optional)</Text></Text>
                        <Text style={styles.teacherInfoText}>
                          Upload a valid <Text style={styles.bold}>teaching ID, license, or certificate</Text> to speed up admin approval.
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.uploadBtn} onPress={pickCredential}>
                      <Ionicons name="cloud-upload-outline" size={18} color="#1565C0" style={{ marginRight: 6 }} />
                      <Text style={styles.uploadBtnText}>
                        {credentialUri ? 'Change Credential' : 'Upload Credential'}
                      </Text>
                    </TouchableOpacity>
                    {credentialUri && (
                      <View style={styles.credentialPreview}>
                        <Image source={{ uri: credentialUri }} style={styles.credentialThumb} resizeMode="cover" />
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={styles.credentialName} numberOfLines={1}>{credentialFileName || 'credential.jpg'}</Text>
                          <TouchableOpacity onPress={() => { setCredentialUri(null); setCredentialFileName(''); }}>
                            <Text style={styles.removeCredText}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Sign Up Button */}
                <TouchableOpacity style={styles.signUpBtn} onPress={handleSignUp} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.btnText}>CREATE ACCOUNT</Text>
                    )}
                </TouchableOpacity>

            </View>

            {/* Footer Login Link */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.loginLink}>Log In</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingTop: 60 },

  // Header
  header: { alignItems: 'center', marginBottom: 30 },
  iconCircle: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center', alignItems: 'center',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
      marginBottom: 15
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 16 },

  // Card
  card: {
      backgroundColor: '#fff',
      borderRadius: 25,
      padding: 25,
      elevation: 10,
      boxShadow: '0px 10px 10px rgba(0,0,0,0.25)',
      marginBottom: 20
  },
  
  label: { fontWeight: 'bold', color: '#333', marginBottom: 8, marginLeft: 5 },
  inputContainer: { 
      flexDirection: 'row', alignItems: 'center', 
      backgroundColor: '#f5f5f5', borderRadius: 12, 
      marginBottom: 20, paddingHorizontal: 15, height: 50
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#333', fontWeight: '600' },

  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },

  // Teacher Verification
  teacherVerifyBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  teacherInfoRow: { flexDirection: 'row', marginBottom: 8 },
  teacherInfoTitle: { fontWeight: 'bold', color: '#1565C0', fontSize: 13, marginBottom: 3 },
  teacherInfoText: { color: '#37474F', fontSize: 12, lineHeight: 18 },
  bold: { fontWeight: 'bold' },
  optionalTag: { fontWeight: 'normal', color: '#888', fontSize: 11 },
  divider: { height: 1, backgroundColor: '#90CAF9', marginVertical: 12 },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1565C0',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  uploadBtnText: { color: '#1565C0', fontWeight: 'bold', fontSize: 13 },
  credentialPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  credentialThumb: { width: 48, height: 48, borderRadius: 6 },
  credentialName: { color: '#333', fontSize: 12, fontWeight: '600' },
  removeCredText: { color: '#e53935', fontSize: 12, marginTop: 4 },
  roleBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', backgroundColor: '#f5f5f5', alignItems: 'center' },
  roleBtnActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  roleText: { color: '#666', fontWeight: 'bold' },
  roleTextActive: { color: '#fff' },

  signUpBtn: {
      backgroundColor: '#4CAF50',
      borderRadius: 12,
      height: 55,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
      boxShadow: '0px 4px 5px rgba(76,175,80,0.3)',
      elevation: 5
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  footerText: { color: 'rgba(255,255,255,0.8)' },
  loginLink: { color: '#fff', fontWeight: 'bold', textDecorationLine: 'underline' }
});