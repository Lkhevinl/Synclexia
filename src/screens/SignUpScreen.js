import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Synclexia App Colors
const COLORS = {
  background: '#F4F1DE',
  textPrimary: '#3A3A3A',
  textSecondary: '#6B6B6B',
  primary: '#F28C82',
  blue: '#6FA8DC',
  green: '#93C47D',
  lavender: '#B4A7D6',
  inputBg: '#EFEFEF',
  white: '#FFFFFF',
};

const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function SignUpScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1 = role selection, 2 = form
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

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
  };

  const handleContinue = () => {
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigation.goBack();
    }
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
        password: password,
        options: {
          data: { role, full_name: trimmedName },
        },
      });

      if (error) {
        let title = 'Sign Up Failed';
        let message = error.message || 'An unknown error occurred.';

        if (error.status === 422 || message.toLowerCase().includes('already registered')) {
          title = 'Email Already In Use';
          message = 'An account with this email already exists. Please log in instead.';
        }

        showAlert(title, message);
        setLoading(false);
        return;
      }

      const user = data?.user;

      if (!user || (user.identities && user.identities.length === 0)) {
        showAlert('Email Already Registered', 'An account with this email already exists.');
        setLoading(false);
        return;
      }

      // Profile is auto-created server-side by the handle_new_user DB trigger
      // (SECURITY DEFINER — bypasses RLS, works regardless of email-confirm setting)
      setSignedUpSession(data.session);
      setShowSuccessModal(true);
    } catch (e) {
      showAlert('Unexpected Error', `Something went wrong.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    if (signedUpSession && setSession) {
      setSession(signedUpSession);
    } else {
      navigation.navigate('Login');
    }
  };

  // Step 1: Role Selection
  const renderRoleSelection = () => (
    <View style={styles.card}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/synclexia-logo2-removebg-preview.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.subtitle}>Are you a child or a parent?</Text>

      {/* Role Selection Cards */}
      <View style={styles.roleCardsContainer}>
        {/* Child Card */}
        <TouchableOpacity
          style={[styles.roleCard, role === 'student' && styles.roleCardSelected]}
          onPress={() => handleRoleSelect('student')}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../assets/7-removebg-preview.png')}
            style={styles.roleImage}
            resizeMode="contain"
          />
          <Text style={styles.roleLabel}>I am a child</Text>
        </TouchableOpacity>

        {/* Parent Card */}
        <TouchableOpacity
          style={[styles.roleCard, role === 'parent' && styles.roleCardSelected]}
          onPress={() => handleRoleSelect('parent')}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../assets/6-removebg-preview.png')}
            style={styles.roleImage}
            resizeMode="contain"
          />
          <Text style={styles.roleLabel}>I am a parent</Text>
        </TouchableOpacity>
      </View>

      {/* Continue Button */}
      <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.8}>
        <Text style={styles.continueBtnText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  // Step 2: Registration Form
  const renderForm = () => (
    <View style={styles.card}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/synclexia-logo2-removebg-preview.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.subtitle}>Please fill in your details to create an account</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Enter Email Address"
          placeholderTextColor={COLORS.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      {/* Username Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Enter Username"
          placeholderTextColor={COLORS.textSecondary}
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          placeholderTextColor={COLORS.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
          <Ionicons
            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Enter Password Again"
          placeholderTextColor={COLORS.textSecondary}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword((prev) => !prev)}>
          <Ionicons
            name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Create Account Button */}
      <TouchableOpacity
        style={styles.createBtn}
        onPress={handleSignUp}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.createBtnText}>Create Account</Text>}
      </TouchableOpacity>

      {/* Login Link */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLinkText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Success Modal
  const renderSuccessModal = () => (
    <Modal visible={showSuccessModal} transparent animationType="fade" onRequestClose={handleSuccessClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Outlined Green Checkmark */}
          <View style={styles.checkmarkContainer}>
            <Ionicons name="checkmark" size={44} color={COLORS.green} />
          </View>

          {/* Success Message */}
          <Text style={styles.modalTitle}>Account created successfully!</Text>
          <Text style={styles.modalMessage}>
            {role === 'student'
              ? "Yay! Your account is ready. Let's start learning!"
              : "Account created successfully. You can now start monitoring your child's progress."}
          </Text>

          {/* Continue Button */}
          <TouchableOpacity style={styles.modalBtn} onPress={handleSuccessClose} activeOpacity={0.8}>
            <Text style={styles.modalBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
      </TouchableOpacity>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Illustration Area */}
          <View style={styles.illustrationArea}>
            <Image
              source={require('../../assets/9__2_-removebg-preview.png')}
              style={styles.illustration}
              resizeMode="cover"
            />
          </View>

          {/* Card */}
          {step === 1 ? renderRoleSelection() : renderForm()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      {renderSuccessModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Illustration Area
  illustrationArea: {
    height: SCREEN_HEIGHT * 0.45,
    width: '100%',
    overflow: 'hidden',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },

  // Card
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 30,
    paddingTop: 25,
    paddingBottom: 40,
    minHeight: SCREEN_HEIGHT * 0.6,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 50,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 25,
  },

  // Role Selection Cards
  roleCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 15,
  },
  roleCard: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleCardSelected: {
    borderColor: COLORS.primary,
  },
  roleImage: {
    width: '100%',
    height: 110,
    marginBottom: 10,
  },
  roleLabel: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Continue Button
  continueBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  // Inputs
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },

  // Create Account Button
  createBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  loginLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 30,
    width: SCREEN_WIDTH - 60,
  },
  checkmarkContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.green,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
