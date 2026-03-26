import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { showAlert } from '../lib/uiAlert';

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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const { setSession, resetSigningOut } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      const msg = 'Please fill in all fields.';
      setFormError(msg);
      showAlert('Missing Info', msg);
      return;
    }
    setLoading(true);
    setFormError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (error) {
        const raw = (error.message || '').trim();
        const lower = raw.toLowerCase();

        let title = 'Login Failed';
        let message = raw || 'Unable to sign in. Please try again.';

        if (lower.includes('invalid login credentials')) {
          title = 'Incorrect Password';
          message = 'The email or password is incorrect.';
        } else if (lower.includes('email not confirmed')) {
          title = 'Email Not Verified';
          message = 'Please verify your email first, then try again.';
        } else if (lower.includes('network') || lower.includes('fetch')) {
          title = 'Connection Error';
          message = 'Please check your internet connection and try again.';
        }

        setFormError(message);
        showAlert(title, message);
        return;
      } else {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_banned, role')
          .eq('id', data.session.user.id)
          .single();
        if (profileData?.is_banned) {
          await supabase.auth.signOut();
          showAlert('Access Denied', 'Your account has been suspended. Please contact support.');
          return;
        }

        if (resetSigningOut) resetSigningOut();
        if (setSession) {
          setSession(data.session);
        }
      }
    } catch (err) {
      const msg = 'Something went wrong. Please check your internet and try again.';
      setFormError(msg);
      showAlert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
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
              resizeMode="contain"
            />
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/synclexia-logo2-removebg-preview.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.subtitle}>Please enter your details to log in</Text>

            {/* Username/Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={COLORS.textSecondary}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (formError) setFormError('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (formError) setFormError('');
                }}
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

            {!!formError && <Text style={styles.formError}>{formError}</Text>}

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account yet? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signupText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Illustration Area
  illustrationArea: {
    height: SCREEN_HEIGHT * 0.38,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  illustration: {
    width: '90%',
    height: '100%',
  },

  // Card
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 25,
    paddingBottom: 40,
    minHeight: SCREEN_HEIGHT * 0.68,
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

  formError: {
    color: '#E53935',
    fontSize: 13,
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 4,
  },

  // Forgot Password
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotText: {
    fontSize: 14,
    color: COLORS.primary,
  },

  // Login Button
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  loginBtnText: {
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
  signupText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
