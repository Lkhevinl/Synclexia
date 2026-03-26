import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const showAlert = (title, message) => {
  if (Platform.OS === 'web') { window.alert(`${title}\n\n${message}`); }
  else { Alert.alert(title, message); }
};

export default function SignUpScreen({ navigation }) {
  const { getBgColor, getPrimaryColor } = useTheme();
  const [step, setStep] = useState(1); // 1 = role selection, 2 = form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const generateUniqueCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const bgColor = getBgColor();
  const primaryColor = getPrimaryColor();

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
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

      const profileData = {
        id: user.id,
        full_name: trimmedName,
        email: trimmedEmail,
        role,
      };

      let profileError = null;
      if (role === 'student') {
        for (let attempt = 0; attempt < 5; attempt++) {
          profileData.unique_code = generateUniqueCode();
          const result = await supabase
            .from('profiles')
            .upsert([profileData], { onConflict: 'id' });
          profileError = result.error;
          if (!profileError || profileError.code !== '23505') break;
        }
      } else {
        const result = await supabase
          .from('profiles')
          .upsert([profileData], { onConflict: 'id' });
        profileError = result.error;
      }

      if (profileError) {
        showAlert('Profile Save Failed', `Could not save your profile.`);
      } else {
        try {
          await Promise.race([
            supabase.auth.signOut(),
            new Promise(resolve => setTimeout(resolve, 3000)),
          ]);
        } catch (_) {}

        showAlert('Account Created!', 'Your account has been created! Please log in.');
        navigation.navigate('Login');
      }
    } catch (e) {
      showAlert('Unexpected Error', `Something went wrong.`);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Role Selection
  const renderRoleSelection = () => (
    <View style={styles.card}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.subtitle}>Please fill in your details to create an account</Text>

      {/* Role Buttons */}
      <View style={styles.roleButtonsContainer}>
        <TouchableOpacity
          style={[styles.roleBtn, styles.kidBtn]}
          onPress={() => handleRoleSelect('student')}
          activeOpacity={0.8}
        >
          <Text style={styles.roleBtnText}>KID</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleBtn, styles.parentBtn]}
          onPress={() => handleRoleSelect('parent')}
          activeOpacity={0.8}
        >
          <Text style={styles.roleBtnText}>PARENT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleBtn, styles.therapistBtn]}
          onPress={() => handleRoleSelect('teacher')}
          activeOpacity={0.8}
        >
          <Text style={styles.roleBtnText}>THERAPIST</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.loginBtn, { backgroundColor: primaryColor }]}
        onPress={() => navigation.navigate('Login')}
        activeOpacity={0.8}
      >
        <Text style={styles.loginBtnText}>Login</Text>
      </TouchableOpacity>
    </View>
  );

  // Step 2: Registration Form
  const renderForm = () => (
    <View style={[styles.card, styles.formCard]}>
      {/* Blue accent bar */}
      <View style={styles.accentBar} />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.subtitle}>Please fill in your details to create an account</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      {/* Username Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#999"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
          <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#999"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
        />
      </View>

      {/* Create Account Button */}
      <TouchableOpacity
        style={[styles.createBtn, { backgroundColor: primaryColor }]}
        onPress={handleSignUp}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.createBtnText}>Create Account</Text>
        )}
      </TouchableOpacity>

      {/* Login Link */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.loginLinkText, { color: primaryColor }]}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />

      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Illustration Area */}
          <View style={styles.illustrationArea}>
            {/* ADD YOUR ILLUSTRATION IMAGE HERE */}
            {/* Uncomment and replace with your actual image: */}
            {/* <Image
              source={require('../../assets/explore-illustration.png')}
              style={styles.illustrationImage}
              resizeMode="contain"
            /> */}

            {/* Temporary placeholder - Remove when you add your image */}
            <View style={styles.illustrationBox}>
              <Text style={styles.exploreText}>EXPLORE</Text>
              <View style={styles.illustrationCircle}>
                <Ionicons name="book-outline" size={60} color="#2D5A5A" />
              </View>
              <View style={styles.decorStar1}>
                <Ionicons name="star" size={16} color="#FFD93D" />
              </View>
              <View style={styles.decorStar2}>
                <Ionicons name="star" size={12} color="#FFD93D" />
              </View>
            </View>
          </View>

          {/* Card */}
          {step === 1 ? renderRoleSelection() : renderForm()}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Illustration Area
  illustrationArea: {
    height: SCREEN_HEIGHT * 0.28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Add this for when you use an actual illustration image
  illustrationImage: {
    width: '70%',
    height: '100%',
  },
  illustrationBox: {
    width: 200,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  exploreText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D5A5A',
    marginBottom: 10,
    letterSpacing: 2,
  },
  illustrationCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorStar1: {
    position: 'absolute',
    top: 15,
    right: 30,
  },
  decorStar2: {
    position: 'absolute',
    top: 45,
    left: 25,
  },

  // Card
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 40,
    minHeight: SCREEN_HEIGHT * 0.72,
  },
  formCard: {
    position: 'relative',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 30,
    bottom: 30,
    width: 5,
    backgroundColor: '#5C9DFF',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },

  // Role Buttons
  roleButtonsContainer: {
    gap: 15,
    marginBottom: 30,
  },
  roleBtn: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kidBtn: {
    backgroundColor: '#90CAF9',
  },
  parentBtn: {
    backgroundColor: '#F48FB1',
  },
  therapistBtn: {
    backgroundColor: '#CE93D8',
  },
  roleBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  loginBtn: {
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  // Inputs
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
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
    color: '#333',
  },

  // Create Account Button
  createBtn: {
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
    color: '#666',
    fontSize: 14,
  },
  loginLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
