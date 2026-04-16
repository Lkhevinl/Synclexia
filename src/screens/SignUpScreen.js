import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  StatusBar,
  Modal,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Icon from '../components/icons/Icon';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/ScreenWrapper';
import AppText from '../components/AppText';
import CustomButton from '../components/CustomButton';
import tokens from '../theme/tokens';

const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

// Fixed accent colors that don't change with theme (role card borders, success checkmark)
const SUCCESS_GREEN = '#93C47D';

export default function SignUpScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [signedUpSession, setSignedUpSession] = useState(null);

  const { setSession } = useAuth();
  const { colors } = useTheme();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

const handleRoleSelect = (selectedRole) => setRole(selectedRole);
  const handleContinue = () => setStep(2);
  const handleBack = () => {
    if (step === 2) setStep(1);
    else navigation.goBack();
  };

  const handleSignUp = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();

    if (!trimmedEmail || !password || !trimmedName) {
      showAlert('Missing Info', 'Please fill in all the boxes!');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showAlert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      showAlert('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      showAlert('Password Mismatch', 'Passwords do not match. Please try again.');
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: { data: { role, full_name: trimmedName } },
      });

      if (error) {
        let title = 'Sign Up Failed';
        let message = error.message || 'An unknown error occurred.';
        if (error.status === 422 || message.toLowerCase().includes('already registered')) {
          title = 'Email Already In Use';
          message = 'An account with this email already exists. Please log in instead.';
        }
        showAlert(title, message);
        return;
      }

      const user = data?.user;
      if (!user || (user.identities && user.identities.length === 0)) {
        showAlert('Email Already Registered', 'An account with this email already exists.');
        return;
      }

      // Profile is created server-side by the handle_new_user() trigger
      // (SECURITY DEFINER) using the role/full_name passed in options.data above.
      // Client-side upsert is blocked by RLS and is not needed.
      setSignedUpSession(data.session);
      setShowSuccessModal(true);
    } catch (e) {
      showAlert('Unexpected Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    if (signedUpSession && setSession) setSession(signedUpSession);
    else navigation.navigate('Login');
  };

  const renderRoleSelection = () => (
    <View style={[styles.card, { backgroundColor: colors.surfaceCard, minHeight: SCREEN_HEIGHT * 0.6 }]}>
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/synclexia-logo2-removebg-preview.png')} style={styles.logo} resizeMode="contain" />
      </View>
      <AppText variant="caption" style={styles.subtitle}>Are you a child or a parent?</AppText>

      <View style={styles.roleCardsContainer}>
        <TouchableOpacity
          style={[styles.roleCard, { backgroundColor: colors.surface, borderColor: role === 'student' ? colors.primary : 'transparent' }]}
          onPress={() => handleRoleSelect('student')}
          activeOpacity={0.8}
        >
          <Image source={require('../../assets/7-removebg-preview.png')} style={styles.roleImage} resizeMode="contain" />
          <AppText variant="label" style={{ textAlign: 'center' }}>I am a child</AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleCard, { backgroundColor: colors.surface, borderColor: role === 'parent' ? colors.primary : 'transparent' }]}
          onPress={() => handleRoleSelect('parent')}
          activeOpacity={0.8}
        >
          <Image source={require('../../assets/6-removebg-preview.png')} style={styles.roleImage} resizeMode="contain" />
          <AppText variant="label" style={{ textAlign: 'center' }}>I am a parent</AppText>
        </TouchableOpacity>
      </View>

      <CustomButton title="Continue" onPress={handleContinue} size="lg" style={styles.actionBtn} />
    </View>
  );

  const renderForm = () => (
    <View style={[styles.card, { backgroundColor: colors.surfaceCard, minHeight: SCREEN_HEIGHT * 0.6 }]}>
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/synclexia-logo2-removebg-preview.png')} style={styles.logo} resizeMode="contain" />
      </View>
      <AppText variant="caption" style={styles.subtitle}>Please fill in your details to create an account</AppText>

      {/* Email */}
      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Icon name="mail" size="sm" color={colors.onSurfaceMuted} style={styles.inputIcon} />
        <TextInput style={[styles.input, { color: colors.onSurface }]} placeholder="Enter Email Address" placeholderTextColor={colors.onSurfaceMuted} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      </View>

      {/* Username */}
      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Icon name="user" size="sm" color={colors.onSurfaceMuted} style={styles.inputIcon} />
        <TextInput style={[styles.input, { color: colors.onSurface }]} placeholder="Enter Username" placeholderTextColor={colors.onSurfaceMuted} value={fullName} onChangeText={setFullName} />
      </View>

      {/* Password */}
      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Icon name="lock" size="sm" color={colors.onSurfaceMuted} style={styles.inputIcon} />
        <TextInput style={[styles.input, { color: colors.onSurface }]} placeholder="Enter Password" placeholderTextColor={colors.onSurfaceMuted} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
        <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
          <Icon name={showPassword ? 'eye' : 'eye-off'} size="sm" color={colors.onSurfaceMuted} />
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}
      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Icon name="lock" size="sm" color={colors.onSurfaceMuted} style={styles.inputIcon} />
        <TextInput style={[styles.input, { color: colors.onSurface }]} placeholder="Enter Password Again" placeholderTextColor={colors.onSurfaceMuted} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} />
        <TouchableOpacity onPress={() => setShowConfirmPassword(p => !p)}>
          <Icon name={showConfirmPassword ? 'eye' : 'eye-off'} size="sm" color={colors.onSurfaceMuted} />
        </TouchableOpacity>
      </View>

      <CustomButton title="Create Account" onPress={handleSignUp} loading={loading} size="lg" style={styles.actionBtn} />

      <View style={styles.footer}>
        <AppText variant="caption" style={{ color: colors.onSurfaceMuted }}>Already have an account? </AppText>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <AppText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>Login</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenWrapper padded={false}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
        <Icon name="arrow-left" size="md" color="#fff" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.illustrationArea, { height: SCREEN_HEIGHT * 0.45 }]}>
          <Image source={require('../../assets/9__2_-removebg-preview.png')} style={styles.illustration} resizeMode="cover" />
        </View>
        {step === 1 ? renderRoleSelection() : renderForm()}
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade" onRequestClose={handleSuccessClose}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surfaceCard, width: SCREEN_WIDTH - 60 }]}>
            <View style={[styles.checkmarkContainer, { borderColor: SUCCESS_GREEN }]}>
              <Icon name="check" size="xl" color={SUCCESS_GREEN} />
            </View>
            <AppText variant="heading" style={styles.modalTitle}>Account created successfully!</AppText>
            <AppText variant="caption" style={[styles.modalMessage, { color: colors.onSurfaceMuted }]}>
              {role === 'student'
                ? "Yay! Your account is ready. Let's start learning!"
                : "Account created successfully. You can now start monitoring your child's progress."}
            </AppText>
            <CustomButton title="Continue" onPress={handleSuccessClose} size="lg" style={{ width: '100%' }} />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent:    { flexGrow: 1 },
  illustrationArea: { width: '100%', overflow: 'hidden' },
  illustration:     { width: '100%', height: '100%' },

  backBtn: {
    position: 'absolute', top: 50, left: 20, zIndex: 100,
    width: 40, height: 40, borderRadius: tokens.radius.full,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },

  card: {
    flex: 1,
    borderTopLeftRadius: tokens.radius.xl,
    borderTopRightRadius: tokens.radius.xl,
    marginTop: -30,
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xxl,
  },
  logoContainer: { alignItems: 'center', marginBottom: tokens.spacing.sm },
  logo:          { width: 120, height: 50 },
  subtitle:      { textAlign: 'center', marginBottom: tokens.spacing.lg },

  roleCardsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: tokens.spacing.lg, gap: tokens.spacing.md },
  roleCard: { flex: 1, borderRadius: tokens.radius.lg, padding: tokens.spacing.md, alignItems: 'center', borderWidth: 2 },
  roleImage: { width: '100%', height: 110, marginBottom: tokens.spacing.sm },

  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: tokens.radius.md, borderWidth: 1, paddingHorizontal: tokens.spacing.md, height: 55, marginBottom: tokens.spacing.md },
  inputIcon: { marginRight: tokens.spacing.sm },
  input:     { flex: 1, fontSize: tokens.fontSize.md },

  actionBtn: { marginBottom: tokens.spacing.md, borderRadius: tokens.radius.md },
  footer:    { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },

  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent:  { borderRadius: tokens.radius.xl, padding: tokens.spacing.xl, alignItems: 'center', marginHorizontal: tokens.spacing.xl },
  checkmarkContainer: { width: 80, height: 80, borderRadius: tokens.radius.full, borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginBottom: tokens.spacing.lg },
  modalTitle:    { textAlign: 'center', marginBottom: tokens.spacing.sm },
  modalMessage:  { textAlign: 'center', lineHeight: 20, marginBottom: tokens.spacing.lg },
});
