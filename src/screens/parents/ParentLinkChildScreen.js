import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Platform,
} from 'react-native';

const showAlert = (title, message, onOk) => {
  if (Platform.OS === 'web') { window.alert(`${title}\n\n${message}`); onOk?.(); }
  else { Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]); }
};
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GoBackBtn from '../../components/GoBackBtn';
import ScreenWrapper from '../../components/ScreenWrapper';
import tokens from '../../theme/tokens';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';

const AVATAR_COLORS = ['#E91E63', '#9C27B0', '#3F51B5', '#2196F3', '#009688', '#FF9800'];
const avatarColor = (name) =>
  AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

export default function ParentLinkChildScreen({ navigation }) {
  const { profile } = useAuth();
  const { theme, colors, a11yTextStyle } = useTheme();

  const [code, setCode]         = useState('');
  const [found, setFound]       = useState(null);
  const [looking, setLooking]   = useState(false);
  const [linking, setLinking]   = useState(false);
  const [error, setError]       = useState('');
  const [linkSuccess, setLinkSuccess] = useState(false);
  const [linkError, setLinkError]     = useState('');
  const timeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // ── Base font size driven by theme ──────────────────────────────────
  const fs = theme.fontSize || 14;

  // ── text helper: merge a11yTextStyle with local style ───────────────
  const tx = (extra) => [a11yTextStyle, extra];

  // ── Lookup ───────────────────────────────────────────────────────────
  const lookupCode = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setError('Code must be exactly 6 characters.');
      return;
    }
    setError('');
    setFound(null);
    setLooking(true);

    const { data: rows, error: dbErr } = await supabase
      .rpc('find_student_by_code', { lookup_code: trimmed });

    setLooking(false);

    if (dbErr) {
      setError('Something went wrong while searching. Please try again.');
      return;
    }
    const data = rows?.[0] ?? null;
    if (!data) {
      setError(
        'No student found with that code. Ask your child to check their code in the app.'
      );
      return;
    }
    setFound(data);
  };

  // ── Link ─────────────────────────────────────────────────────────────
  const confirmLink = async () => {
    if (!found) return;
    setLinking(true);
    setLinkError('');
    try {
      const { data: result, error: linkErr } = await supabase
        .rpc('link_child', { p_parent_id: profile?.id, p_student_id: found.id });

      if (linkErr) {
        setLinkError(linkErr.message || 'Could not link child. Please try again.');
        return;
      }
      if (result?.error === 'already_linked') {
        setLinkError(`${found.full_name} is already linked to your account.`);
        return;
      }
      if (result?.error) {
        setLinkError(result.error);
        return;
      }
      // Success — show inline banner then navigate back
      setLinkSuccess(true);
      timeoutRef.current = setTimeout(() => navigation.goBack(), 1800);
    } catch (e) {
      setLinkError(e.message || 'An unexpected error occurred.');
    } finally {
      setLinking(false);
    }
  };

  const level     = found?.level ?? Math.floor((found?.xp || 0) / 100) + 1;
  const firstName = found?.full_name?.split(' ')[0] ?? '';

  return (
    <ScreenWrapper role="parent" scrollable>
      {/* ── Header ── */}
      <LinearGradient colors={colors.headerGradient} style={s.header}>
        <GoBackBtn />
        <Text style={tx(s.headerTitle)}>Link a Child</Text>
        <Text style={tx([s.headerSub, { fontSize: fs }])}>
          Enter the 6-character code from your child's app
        </Text>
      </LinearGradient>

      {/* How it works */}
      <View style={s.infoCard}>
        <Ionicons name="information-circle" size={22} color={colors.primary} style={s.infoIcon} />
        <Text style={tx([s.infoText, { fontSize: fs }])}>
          Ask your child to open{' '}
          <Text style={tx(s.infoBold)}>Synclexia</Text>
            {' '}and share their{' '}
            <Text style={tx(s.infoBold)}>Link Code</Text>
            {' '}shown on their dashboard.
          </Text>
        </View>

        {/* Steps */}
        <View style={s.stepsCard}>
          {[
            { n: '1', t: 'Child opens Synclexia app' },
            { n: '2', t: 'Tap their Profile → find the 6-letter Link Code' },
            { n: '3', t: 'Parent enters the code below and taps Find Child' },
          ].map((step) => (
            <View key={step.n} style={s.stepRow}>
              <View style={s.stepBadge}>
                <Text style={tx(s.stepNum)}>{step.n}</Text>
              </View>
              <Text style={tx([s.stepTxt, { fontSize: fs }])}>{step.t}</Text>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View style={s.divider} />

        {/* Label */}
        <Text style={tx([s.label, { fontSize: fs }])}>Child's Link Code</Text>

        {/* Code input */}
        <View style={[s.codeBox, error ? s.codeBoxError : null]}>
          <TextInput
            style={[s.codeInput, a11yTextStyle, { fontSize: Math.max(fs + 14, 28) }]}
            value={code}
            onChangeText={(t) => {
              setCode(t.toUpperCase());
              setError('');
              setFound(null);
            }}
            placeholder="AB12CD"
            placeholderTextColor="#C9B8DC"
            autoCapitalize="characters"
            maxLength={6}
            autoFocus
          />
          {code.length > 0 && (
            <TouchableOpacity
              onPress={() => { setCode(''); setFound(null); setError(''); }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={24} color="#B0A0C8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Character-count dots */}
        <View style={s.hintRow}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={[s.hintDot, i < code.trim().length && s.hintDotFilled]}
            />
          ))}
        </View>

        {/* Error */}
        {error ? (
          <View style={s.errorRow}>
            <Ionicons name="alert-circle" size={16} color="#D32F2F" />
            <Text style={tx([s.errorText, { fontSize: fs - 1 }])}>{error}</Text>
          </View>
        ) : null}

        {/* Find button */}
        <TouchableOpacity
          style={[s.lookupBtn, (looking || code.trim().length !== 6) && s.lookupBtnDisabled]}
          onPress={lookupCode}
          disabled={looking || code.trim().length !== 6}
          activeOpacity={0.82}
        >
          {looking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="search" size={20} color="#fff" />
              <Text style={tx([s.lookupBtnText, { fontSize: fs + 2 }])}>Find Child</Text>
            </>
          )}
        </TouchableOpacity>

        {/* ── Found student card ── */}
        {found && (
          <View style={s.foundCard}>

            {/* Verified badge */}
            <View style={s.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#388E3C" />
              <Text style={tx([s.verifiedText, { fontSize: fs - 1 }])}>Student found!</Text>
            </View>

            {/* Avatar + info */}
            <View style={s.foundRow}>
              <View style={[s.avatar, { backgroundColor: avatarColor(found.full_name) }]}>
                <Text style={tx(s.avatarText)}>{found.full_name?.[0]?.toUpperCase()}</Text>
              </View>

              <View style={s.foundInfo}>
                <Text style={tx([s.foundName, { fontSize: fs + 4 }])}>{found.full_name}</Text>
                <Text style={tx([s.foundEmail, { fontSize: fs - 1 }])}>
                  {found.email || 'Student account'}
                </Text>
                <View style={s.levelRow}>
                  <Ionicons name="star" size={14} color="#FF9800" />
                  <Text style={tx([s.levelText, { fontSize: fs - 1 }])}>Level {level}</Text>
                  <View style={s.xpBadge}>
                    <Text style={tx([s.xpText, { fontSize: fs - 2 }])}>{found.xp ?? 0} XP</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Confirm link button */}
            <TouchableOpacity
              style={[s.confirmBtn, linking && s.confirmBtnDisabled]}
              onPress={confirmLink}
              disabled={linking}
              activeOpacity={0.82}
            >
              {linking ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="link" size={20} color="#fff" />
                  <Text style={tx([s.confirmBtnText, { fontSize: fs + 2 }])}>
                    Link {firstName}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Inline error */}
            {linkError ? (
              <View style={s.linkErrorBox}>
                <Ionicons name="alert-circle" size={16} color="#C62828" />
                <Text style={tx([s.linkErrorText, { fontSize: fs - 1 }])}>{linkError}</Text>
              </View>
            ) : null}

            {/* Inline success */}
            {linkSuccess ? (
              <View style={s.linkSuccessBox}>
                <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                <Text style={tx([s.linkSuccessText, { fontSize: fs }])}>
                  {found?.full_name} linked! Returning to dashboard…
                </Text>
              </View>
            ) : null}

            {/* Not the right child */}
            <TouchableOpacity
              style={s.cancelLink}
              onPress={() => { setFound(null); setCode(''); setError(''); setLinkError(''); setLinkSuccess(false); }}
            >
              <Text style={tx([s.cancelLinkText, { fontSize: fs - 1 }])}>
                Not the right child? Try again
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
    </ScreenWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Header
  header:             { paddingTop: 55, paddingBottom: tokens.spacing.xl, paddingHorizontal: 22, marginHorizontal: -tokens.spacing.md },
  headerTitle:        { fontSize: 24, fontWeight: '900', color: '#fff', marginTop: 14, letterSpacing: 0.5 },
  headerSub:          { color: 'rgba(255,255,255,0.85)', marginTop: 6, lineHeight: 22 },

  // Info card
  infoCard:           {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#EDE7F6', borderRadius: tokens.radius.md,
    padding: tokens.spacing.md, marginBottom: tokens.spacing.md, marginTop: tokens.spacing.md,
    borderLeftWidth: 4, borderLeftColor: '#7B1FA2',
  },
  infoIcon:           { marginTop: 2, marginRight: 10 },
  infoText:           { flex: 1, color: '#4A148C', lineHeight: 22 },
  infoBold:           { fontWeight: '800', color: '#6A1B9A' },

  // Steps
  stepsCard:          {
    backgroundColor: '#F3E5F5', borderRadius: tokens.radius.md,
    padding: tokens.spacing.md, marginBottom: tokens.spacing.lg, gap: 14,
  },
  stepRow:            { flexDirection: 'row', alignItems: 'flex-start', gap: tokens.spacing.md },
  stepBadge:          {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#7B1FA2', justifyContent: 'center', alignItems: 'center',
  },
  stepNum:            { color: '#fff', fontWeight: '900', fontSize: 14 },
  stepTxt:            { flex: 1, color: '#4A148C', lineHeight: 22, paddingTop: tokens.spacing.xs },

  // Divider
  divider:            { height: 1, backgroundColor: '#E0D0F5', marginBottom: tokens.spacing.lg },

  // Input section
  label:              { fontWeight: '800', color: '#4A148C', marginBottom: 10, letterSpacing: 0.4 },
  codeBox:            {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: tokens.radius.md,
    borderWidth: 2.5, borderColor: '#CE93D8',
    paddingHorizontal: tokens.spacing.lg, paddingVertical: 6,
    ...tokens.shadows.low,
  },
  codeBoxError:       { borderColor: '#D32F2F' },
  codeInput:          {
    flex: 1, fontWeight: '900', color: '#6A1B9A',
    letterSpacing: 10, paddingVertical: tokens.spacing.md, textAlign: 'center',
  },

  // Dot indicators
  hintRow:            { flexDirection: 'row', justifyContent: 'center', gap: tokens.spacing.sm, marginTop: 10, marginBottom: 6 },
  hintDot:            { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E0D0F5' },
  hintDotFilled:      { backgroundColor: '#7B1FA2' },

  // Error
  errorRow:           { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14, marginTop: tokens.spacing.xs },
  errorText:          { color: '#D32F2F', flex: 1, lineHeight: 20 },

  // Find button
  lookupBtn:          {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#7B1FA2', borderRadius: tokens.radius.md,
    paddingVertical: 18, marginTop: 10, ...tokens.shadows.mid,
  },
  lookupBtnDisabled:  { backgroundColor: '#CE93D8', elevation: 0, shadowOpacity: 0 },
  lookupBtnText:      { color: '#fff', fontWeight: '900', letterSpacing: 0.5 },

  // Found card
  foundCard:          {
    backgroundColor: '#fff', borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg, marginTop: tokens.spacing.xl, ...tokens.shadows.mid,
    borderWidth: 2.5, borderColor: '#4CAF50',
  },

  // Verified badge
  verifiedBadge:      {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#E8F5E9', borderRadius: tokens.radius.lg,
    paddingHorizontal: tokens.spacing.md, paddingVertical: 5,
    alignSelf: 'flex-start', marginBottom: tokens.spacing.md,
  },
  verifiedText:       { color: '#2E7D32', fontWeight: '700' },

  // Avatar row
  foundRow:           { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.md, marginBottom: tokens.spacing.lg },
  avatar:             { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  avatarText:         { color: '#fff', fontSize: 26, fontWeight: '900' },

  // Student info
  foundInfo:          { flex: 1 },
  foundName:          { fontWeight: '900', color: '#1A1A2E', lineHeight: 28 },
  foundEmail:         { color: '#888', marginTop: 2, lineHeight: 20 },
  levelRow:           { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  levelText:          { color: '#E65100', fontWeight: '700' },
  xpBadge:            { backgroundColor: '#FFF3E0', borderRadius: 10, paddingHorizontal: tokens.spacing.sm, paddingVertical: 2 },
  xpText:             { color: '#E65100', fontWeight: '700' },

  // Confirm button
  confirmBtn:         {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#388E3C', borderRadius: tokens.radius.md,
    paddingVertical: tokens.spacing.md, ...tokens.shadows.mid,
  },
  confirmBtnDisabled: { backgroundColor: '#A5D6A7', elevation: 0, shadowOpacity: 0 },
  confirmBtnText:     { color: '#fff', fontWeight: '900', letterSpacing: 0.5 },

  // Cancel
  cancelLink:         { alignItems: 'center', marginTop: 14, paddingVertical: 6 },

  linkErrorBox:  { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm, backgroundColor: '#FFEBEE', borderRadius: 10, padding: tokens.spacing.md, marginTop: 10 },
  linkErrorText: { flex: 1, color: '#C62828', fontWeight: '500' },
  linkSuccessBox: { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm, backgroundColor: '#E8F5E9', borderRadius: 10, padding: tokens.spacing.md, marginTop: 10 },
  linkSuccessText: { flex: 1, color: '#2E7D32', fontWeight: '600' },
  cancelLinkText:     { color: '#9E9E9E', textDecorationLine: 'underline', lineHeight: 22 },
});
