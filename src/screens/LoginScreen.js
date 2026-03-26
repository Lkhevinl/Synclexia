import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { showAlert } from '../lib/uiAlert';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const { setSession, resetSigningOut } = useAuth();
  const { getBgColor, getPrimaryColor } = useTheme();

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

  const bgColor = getBgColor();
  const primaryColor = getPrimaryColor();

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />

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
            <View style={styles.illustrationContainer}>
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
                <View style={styles.decorLeaf}>
                  <Ionicons name="leaf" size={20} color="#7CB342" />
                </View>
              </View>
            </View>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.subtitle}>Please enter your details to log in</Text>

            {/* Username/Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(v) => { setEmail(v); if (formError) setFormError(''); }}
                autoCapitalize="none"
                keyboardType="email-address"
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
                onChangeText={(v) => { setPassword(v); if (formError) setFormError(''); }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#999" />
              </TouchableOpacity>
            </View>

            {!!formError && <Text style={styles.formError}>{formError}</Text>}

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={[styles.forgotText, { color: primaryColor }]}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: primaryColor }]}
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
                <Text style={[styles.signupText, { color: primaryColor }]}>Sign Up</Text>
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
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Illustration Area
  illustrationArea: {
    height: SCREEN_HEIGHT * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Add this for when you use an actual illustration image
  illustrationImage: {
    width: '80%',
    height: '80%',
  },
  illustrationBox: {
    width: 200,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  exploreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D5A5A',
    marginBottom: 10,
    letterSpacing: 2,
  },
  illustrationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorStar1: {
    position: 'absolute',
    top: 20,
    right: 30,
  },
  decorStar2: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  decorLeaf: {
    position: 'absolute',
    bottom: 30,
    right: 20,
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
    minHeight: SCREEN_HEIGHT * 0.65,
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
  },

  // Login Button
  loginBtn: {
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
    color: '#666',
    fontSize: 14,
  },
  signupText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
