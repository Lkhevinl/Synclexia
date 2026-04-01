import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, KeyboardAvoidingView, Platform,
  Animated, Dimensions, ScrollView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const { width: SW, height: SH } = Dimensions.get('window');

const COLORS = {
  background:     '#F4F1DE',
  white:          '#FFFFFF',
  primary:        '#F28C82',
  primaryDark:    '#E07068',
  textPrimary:    '#3A3A3A',
  textSecondary:  '#6B6B6B',
  inputBg:        '#EFEFEF',
  error:          '#E53935',
  success:        '#4CAF50',
};

const RESEND_COOLDOWN = 60;

export default function ForgotPasswordScreen({ navigation }) {
  const [email,      setEmail]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [sent,       setSent]       = useState(false);
  const [inputError, setInputError] = useState('');
  const [focused,    setFocused]    = useState(false);
  const [cooldown,   setCooldown]   = useState(0);

  const shakeX       = useRef(new Animated.Value(0)).current;
  const successFade  = useRef(new Animated.Value(0)).current;
  const successSlide = useRef(new Animated.Value(30)).current;
  const cooldownRef  = useRef(null);

  useEffect(() => () => clearInterval(cooldownRef.current), []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const shakeInput = () => {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:  8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -5, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:  5, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:  0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const showSuccess = () => {
    setSent(true);
    successSlide.setValue(30);
    successFade.setValue(0);
    Animated.parallel([
      Animated.spring(successSlide, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
      Animated.timing(successFade,  { toValue: 1, duration: 300,             useNativeDriver: true }),
    ]).start();
    startCooldown();
  };

  const handleReset = async () => {
    setInputError('');
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setInputError('Please enter your email address.');
      shakeInput(); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setInputError("That doesn't look like a valid email.");
      shakeInput(); return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: 'synclexia://update-password',
      });
      if (error) { setInputError(error.message); shakeInput(); }
      else        { showSuccess(); }
    } catch {
      setInputError('Something went wrong. Check your internet connection.');
      shakeInput();
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: 'synclexia://update-password',
      });
      startCooldown();
    } catch (_) {}
    finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Illustration area (matches login) ── */}
          <View style={styles.illustrationArea}>
            <Image
              source={require('../../assets/7-removebg-preview.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
            {/* Back button overlaid on illustration */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* ── White card sliding over illustration ── */}
          <View style={styles.card}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/synclexia-logo2-removebg-preview.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {!sent ? (
              /* ════════ FORM ════════ */
              <>
                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.subtitle}>
                  Enter your email and we'll send you a link to reset your password.
                </Text>

                {/* Email input */}
                <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
                  <View style={[
                    styles.inputContainer,
                    focused    && styles.inputFocused,
                    inputError && styles.inputError,
                  ]}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={inputError ? COLORS.error : focused ? COLORS.primary : COLORS.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor={COLORS.textSecondary}
                      value={email}
                      onChangeText={t => { setEmail(t); if (inputError) setInputError(''); }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      onSubmitEditing={handleReset}
                      returnKeyType="send"
                    />
                  </View>
                </Animated.View>

                {!!inputError && (
                  <View style={styles.errorRow}>
                    <Ionicons name="alert-circle" size={13} color={COLORS.error} />
                    <Text style={styles.errorTxt}>{inputError}</Text>
                  </View>
                )}

                {/* Send button */}
                <TouchableOpacity
                  style={[styles.primaryBtn, loading && { opacity: 0.75 }]}
                  onPress={handleReset}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading
                    ? <ActivityIndicator color={COLORS.white} />
                    : <>
                        <Ionicons name="send" size={16} color={COLORS.white} style={{ marginRight: 8 }} />
                        <Text style={styles.primaryBtnText}>Send Reset Link</Text>
                      </>
                  }
                </TouchableOpacity>

                {/* Back to login */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.secondaryLink}>
                  <Ionicons name="arrow-back" size={14} color={COLORS.primary} />
                  <Text style={styles.secondaryLinkText}> Back to Login</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* ════════ SUCCESS STATE ════════ */
              <Animated.View style={{
                opacity: successFade,
                transform: [{ translateY: successSlide }],
                alignItems: 'center',
              }}>
                {/* Envelope badge */}
                <View style={styles.envelopeWrap}>
                  <View style={styles.envelopeCircle}>
                    <Ionicons name="mail" size={38} color={COLORS.white} />
                  </View>
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={12} color={COLORS.white} />
                  </View>
                </View>

                <Text style={styles.title}>Check Your Inbox!</Text>
                <Text style={styles.subtitle}>
                  We sent a reset link to
                </Text>
                <Text style={styles.emailHighlight}>{email.trim().toLowerCase()}</Text>
                <Text style={[styles.subtitle, { marginTop: 4 }]}>
                  Didn't see it? Check your spam folder or tap below to resend.
                </Text>

                {/* Resend */}
                <TouchableOpacity
                  style={[styles.resendBtn, (cooldown > 0 || loading) && styles.resendBtnDisabled]}
                  onPress={handleResend}
                  disabled={cooldown > 0 || loading}
                  activeOpacity={0.8}
                >
                  {loading
                    ? <ActivityIndicator color={COLORS.primary} size="small" />
                    : cooldown > 0
                      ? <Text style={styles.resendTxtDisabled}>Resend in {cooldown}s</Text>
                      : <>
                          <Ionicons name="refresh" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                          <Text style={styles.resendTxt}>Resend Email</Text>
                        </>
                  }
                </TouchableOpacity>

                {/* Back to login */}
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.8}
                >
                  <Ionicons name="log-in-outline" size={17} color={COLORS.white} style={{ marginRight: 8 }} />
                  <Text style={styles.primaryBtnText}>Back to Login</Text>
                </TouchableOpacity>

                {/* Wrong email */}
                <TouchableOpacity onPress={() => { setSent(false); setEmail(''); }} style={{ marginTop: 12 }}>
                  <Text style={styles.wrongEmailTxt}>Wrong email address?</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
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

  // ── Illustration ───────────────────────────────────────────────────────────
  illustrationArea: {
    height: SH * 0.4,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  illustration: {
    width: '80%',
    height: '100%',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // ── Card ───────────────────────────────────────────────────────────────────
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 30,
    paddingTop: 24,
    paddingBottom: 50,
    minHeight: SH * 0.62,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 120,
    height: 44,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
    paddingHorizontal: 4,
  },

  // ── Input ──────────────────────────────────────────────────────────────────
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF5F4',
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FFF5F5',
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
    marginLeft: 2,
  },
  errorTxt: { fontSize: 12, color: COLORS.error, fontWeight: '500', flex: 1 },

  // ── Buttons ────────────────────────────────────────────────────────────────
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 55,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 14,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },

  secondaryLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  secondaryLinkText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },

  // ── Success ────────────────────────────────────────────────────────────────
  envelopeWrap: {
    position: 'relative',
    marginBottom: 20,
    marginTop: 4,
  },
  envelopeCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: COLORS.white,
    elevation: 3,
  },
  emailHighlight: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 6,
  },

  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 28,
    marginBottom: 12,
    marginTop: 4,
    backgroundColor: COLORS.white,
  },
  resendBtnDisabled: {
    borderColor: '#DDD',
    backgroundColor: '#FAFAFA',
  },
  resendTxt:         { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  resendTxtDisabled: { fontSize: 14, fontWeight: '600', color: '#BBB' },

  wrongEmailTxt: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
