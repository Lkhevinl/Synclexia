import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Animated, ScrollView, StatusBar,
  useWindowDimensions,
} from 'react-native';
import Icon from '../components/icons/Icon';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/ScreenWrapper';
import AppText from '../components/AppText';
import tokens from '../theme/tokens';
import { AUTH } from '../lib/constants';

const RESEND_COOLDOWN = AUTH.RESEND_COOLDOWN_SECONDS;
const ERROR_RED = '#E53935';
const SUCCESS_GREEN = '#4CAF50';

export default function ForgotPasswordScreen({ navigation }) {
  const [email,      setEmail]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [sent,       setSent]       = useState(false);
  const [inputError, setInputError] = useState('');
  const [focused,    setFocused]    = useState(false);
  const [cooldown,   setCooldown]   = useState(0);

  const { colors } = useTheme();
  const { height: SH } = useWindowDimensions();

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
      Animated.timing(successFade,  { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    startCooldown();
  };

  const handleReset = async () => {
    setInputError('');
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) { setInputError('Please enter your email address.'); shakeInput(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setInputError("That doesn't look like a valid email."); shakeInput(); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, { redirectTo: AUTH.PASSWORD_RESET_REDIRECT_URL });
      if (error) { console.error('[ForgotPassword] Supabase error:', error); setInputError(error.message); shakeInput(); }
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
      await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: AUTH.PASSWORD_RESET_REDIRECT_URL });
      startCooldown();
    } catch (_) {}
    finally { setLoading(false); }
  };

  return (
    <ScreenWrapper padded={false}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Illustration area */}
        <View style={[styles.illustrationArea, { height: SH * 0.4, backgroundColor: colors.surface }]}>
          <Image source={require('../../assets/7-removebg-preview.png')} style={styles.illustration} resizeMode="contain" />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="chevron-left" size="md" color={colors.onSurface} />
          </TouchableOpacity>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: colors.surfaceCard, minHeight: SH * 0.62 }]}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/synclexia-logo2-removebg-preview.png')} style={styles.logo} resizeMode="contain" />
          </View>

          {!sent ? (
            <>
              <AppText variant="display" style={[styles.title, { color: colors.onSurface }]}>Forgot Password?</AppText>
              <AppText variant="caption" style={[styles.subtitle, { color: colors.onSurfaceMuted }]}>
                Enter your email and we'll send you a link to reset your password.
              </AppText>

              <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
                <View style={[
                  styles.inputContainer,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  focused    && { borderColor: colors.primary },
                  inputError && { borderColor: ERROR_RED },
                ]}>
                  <Icon name="mail" size="sm" color={inputError ? ERROR_RED : focused ? colors.primary : colors.onSurfaceMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.onSurface }]}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.onSurfaceMuted}
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
                  <Icon name="alert-circle" size="sm" color={ERROR_RED} />
                  <Text style={[styles.errorTxt, { color: ERROR_RED }]}>{inputError}</Text>
                </View>
              )}

              {/* Send button — has icon+text row, kept as TouchableOpacity */}
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary }, loading && { opacity: 0.75 }]}
                onPress={handleReset}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading
                  ? <ActivityIndicator color={colors.onPrimary} />
                  : <>
                      <Icon name="send" size="md" color={colors.onPrimary} style={{ marginRight: 8 }} />
                      <Text style={[styles.primaryBtnText, { color: colors.onPrimary }]}>Send Reset Link</Text>
                    </>
                }
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.secondaryLink}>
                <Icon name="arrow-left" size="md" color={colors.primary} />
                <AppText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}> Back to Login</AppText>
              </TouchableOpacity>
            </>
          ) : (
            <Animated.View style={{ opacity: successFade, transform: [{ translateY: successSlide }], alignItems: 'center' }}>
              <View style={styles.envelopeWrap}>
                <View style={[styles.envelopeCircle, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
                  <Icon name="mail" size="xl" color={colors.onPrimary} />
                </View>
                <View style={[styles.checkBadge, { backgroundColor: SUCCESS_GREEN }]}>
                  <Icon name="check" size="sm" color="#fff" />
                </View>
              </View>

              <AppText variant="display" style={[styles.title, { color: colors.onSurface }]}>Check Your Inbox!</AppText>
              <AppText variant="caption" style={[styles.subtitle, { color: colors.onSurfaceMuted }]}>We sent a reset link to</AppText>
              <AppText variant="body" style={[styles.emailHighlight, { color: colors.primary }]}>{email.trim().toLowerCase()}</AppText>
              <AppText variant="caption" style={[styles.subtitle, { color: colors.onSurfaceMuted, marginTop: 4 }]}>
                Didn't see it? Check your spam folder or tap below to resend.
              </AppText>

              <TouchableOpacity
                style={[styles.resendBtn, { borderColor: colors.primary, backgroundColor: colors.surfaceCard }, (cooldown > 0 || loading) && styles.resendBtnDisabled]}
                onPress={handleResend}
                disabled={cooldown > 0 || loading}
                activeOpacity={0.8}
              >
                {loading
                  ? <ActivityIndicator color={colors.primary} size="small" />
                  : cooldown > 0
                    ? <Text style={styles.resendTxtDisabled}>Resend in {cooldown}s</Text>
                    : <>
                        <Icon name="refresh-cw" size="md" color={colors.primary} style={{ marginRight: 6 }} />
                        <Text style={[styles.resendTxt, { color: colors.primary }]}>Resend Email</Text>
                      </>
                }
              </TouchableOpacity>

              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                <Icon name="log-in" size="md" color={colors.onPrimary} style={{ marginRight: 8 }} />
                <Text style={[styles.primaryBtnText, { color: colors.onPrimary }]}>Back to Login</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setSent(false); setEmail(''); }} style={{ marginTop: 12 }}>
                <AppText variant="caption" style={{ color: colors.onSurfaceMuted, fontWeight: '600', textDecorationLine: 'underline' }}>Wrong email address?</AppText>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  illustrationArea: { width: '100%', justifyContent: 'center', alignItems: 'center' },
  illustration:     { width: '80%', height: '100%' },
  backBtn: {
    position: 'absolute', top: 50, left: 20,
    width: 40, height: 40, borderRadius: tokens.radius.md,
    backgroundColor: 'rgba(255,255,255,0.75)',
    justifyContent: 'center', alignItems: 'center',
    ...tokens.shadows.low,
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
  logo:          { width: 120, height: 44 },
  title:         { textAlign: 'center', marginBottom: tokens.spacing.sm },
  subtitle:      { textAlign: 'center', lineHeight: 21, marginBottom: tokens.spacing.lg, paddingHorizontal: tokens.spacing.xs },

  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: tokens.radius.md, paddingHorizontal: tokens.spacing.md,
    height: 55, marginBottom: tokens.spacing.sm,
    borderWidth: 1.5,
  },
  inputIcon: { marginRight: tokens.spacing.sm },
  input:     { flex: 1, fontSize: tokens.fontSize.md },

  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: tokens.spacing.sm, marginLeft: 2 },
  errorTxt: { fontSize: tokens.fontSize.xs, fontWeight: '500', flex: 1 },

  primaryBtn: {
    borderRadius: tokens.radius.md, height: 55,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: tokens.spacing.sm, marginBottom: tokens.spacing.md,
    ...tokens.shadows.mid,
  },
  primaryBtnText: { fontWeight: 'bold', fontSize: tokens.fontSize.md },

  secondaryLink: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 4 },

  envelopeWrap:   { position: 'relative', marginBottom: tokens.spacing.lg, marginTop: tokens.spacing.xs },
  envelopeCircle: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  checkBadge:     { position: 'absolute', bottom: 2, right: 2, width: 24, height: 24, borderRadius: tokens.radius.full, justifyContent: 'center', alignItems: 'center', borderWidth: 2.5, borderColor: '#fff', elevation: 3 },
  emailHighlight: { textAlign: 'center', marginBottom: tokens.spacing.sm },

  resendBtn:         { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: tokens.radius.md, height: 48, paddingHorizontal: 28, marginBottom: tokens.spacing.sm, marginTop: tokens.spacing.xs },
  resendBtnDisabled: { borderColor: '#DDD', backgroundColor: '#FAFAFA' },
  resendTxt:         { fontSize: tokens.fontSize.sm, fontWeight: '700' },
  resendTxtDisabled: { fontSize: tokens.fontSize.sm, fontWeight: '600', color: '#BBB' },
});
