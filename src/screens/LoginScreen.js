import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '../components/icons/Icon';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { showAlert } from '../lib/uiAlert';
import { STORAGE_KEYS } from '../lib/constants';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/ScreenWrapper';
import AppText from '../components/AppText';
import CustomButton from '../components/CustomButton';
import tokens from '../theme/tokens';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const passwordRef = useRef(null);
  const { resetSigningOut } = useAuth();
  const { colors } = useTheme();
  const { height: SCREEN_HEIGHT } = useWindowDimensions();

  // Pre-fill last-used email
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.LAST_EMAIL)
      .then(saved => { if (saved) setEmail(saved); })
      .catch(() => {});
  }, []);

  const handleLogin = async () => {
    // Reset signingOutRef first so the SIGNED_IN handler is never blocked
    resetSigningOut();

    if (!email || !password) {
      const msg = 'Please fill in all fields.';
      setFormError(msg);
      showAlert('Missing Info', msg);
      return;
    }
    setLoading(true);
    setFormError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
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
      }

      // Success — persist email for next time, let SIGNED_IN handler own the session
      AsyncStorage.setItem(STORAGE_KEYS.LAST_EMAIL, email.trim().toLowerCase()).catch(() => {});
    } catch (err) {
      const msg = 'Something went wrong. Please check your internet and try again.';
      setFormError(msg);
      showAlert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper padded={false}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Illustration Area */}
        <View style={[styles.illustrationArea, { height: SCREEN_HEIGHT * 0.45 }]}>
          <Image
            source={require('../../assets/9__2_-removebg-preview.png')}
            style={styles.illustration}
            resizeMode="cover"
          />
        </View>

        {/* Login Card */}
        <View style={[styles.card, { backgroundColor: colors.surfaceCard, minHeight: SCREEN_HEIGHT * 0.6 }]}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/synclexia-logo2-removebg-preview.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <AppText variant="caption" style={styles.subtitle}>Please enter your details to log in</AppText>

          {/* Email Input */}
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Icon name="user" size="sm" color={colors.onSurfaceMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.onSurface }]}
              placeholder="Enter Email"
              placeholderTextColor={colors.onSurfaceMuted}
              value={email}
              onChangeText={(v) => { setEmail(v); if (formError) setFormError(''); }}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          {/* Password Input */}
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Icon name="lock" size="sm" color={colors.onSurfaceMuted} style={styles.inputIcon} />
            <TextInput
              ref={passwordRef}
              style={[styles.input, { color: colors.onSurface }]}
              placeholder="Enter Password"
              placeholderTextColor={colors.onSurfaceMuted}
              value={password}
              onChangeText={(v) => { setPassword(v); if (formError) setFormError(''); }}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <Icon name={showPassword ? 'eye' : 'eye-off'} size="sm" color={colors.onSurfaceMuted} />
            </TouchableOpacity>
          </View>

          {!!formError && (
            <AppText variant="caption" style={styles.formError}>{formError}</AppText>
          )}

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
            <AppText variant="caption" style={{ color: colors.primary }}>Forgot Password?</AppText>
          </TouchableOpacity>

          {/* Login Button */}
          <CustomButton title="Login" onPress={handleLogin} loading={loading} size="lg" style={styles.loginBtn} />

          {/* Sign Up Link */}
          <View style={styles.footer}>
            <AppText variant="caption" style={{ color: colors.onSurfaceMuted }}>Don't have an account yet? </AppText>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <AppText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>Sign Up</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },

  illustrationArea: { width: '100%', overflow: 'hidden' },
  illustration:     { width: '100%', height: '100%' },

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

  inputContainer: {
    flexDirection:  'row',
    alignItems:     'center',
    borderRadius:   tokens.radius.md,
    borderWidth:    1,
    paddingHorizontal: tokens.spacing.md,
    height: 55,
    marginBottom:   tokens.spacing.md,
  },
  inputIcon: { marginRight: tokens.spacing.sm },
  input:     { flex: 1, fontSize: tokens.fontSize.md },

  formError: {
    color:        '#E53935',
    marginTop:    -tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
    marginLeft:   tokens.spacing.xs,
  },

  forgotBtn:  { alignSelf: 'flex-end', marginBottom: tokens.spacing.lg },
  loginBtn:   { marginBottom: tokens.spacing.lg, borderRadius: tokens.radius.md },
  footer:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});
