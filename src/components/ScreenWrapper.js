// src/components/ScreenWrapper.js
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import tokens from '../theme/tokens';

/**
 * Mandatory root container for every screen.
 *
 * Props:
 *   scrollable  — wraps children in ScrollView (default false)
 *   padded      — applies tokens.spacing.md (16) horizontal padding (default true)
 *                 set false for edge-to-edge screens (splash, onboarding, login)
 *   role        — 'student' | 'teacher' | 'admin' | 'parent' | undefined
 *                 student: adds a 6% role-accent tint overlay
 *                 teacher/admin: no tint, clean surface
 *   style       — additional style for the inner content container
 */
/**
 * edges — SafeAreaView edges to consume (default: all four sides).
 *         Pass ['left','right','bottom'] for screens with AppHeader —
 *         AppHeader handles the top inset itself via useSafeAreaInsets().
 */
export default function ScreenWrapper({
  children,
  style,
  scrollable = false,
  padded = true,
  role,
  edges = ['top', 'left', 'right', 'bottom'],
}) {
  const { colors } = useTheme();
  const px = padded ? tokens.spacing.md : 0;

  const inner = scrollable ? (
    <ScrollView
      contentContainerStyle={[{ paddingHorizontal: px, flexGrow: 1 }, style]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, paddingHorizontal: px }, style]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.surface }]}
      edges={edges}
    >
      {/* Student role: subtle warm accent tint overlay */}
      {role === 'student' && (
        <View
          style={[StyleSheet.absoluteFillObject, { backgroundColor: tokens.roleAccents.student, opacity: 0.06 }]}
          pointerEvents="none"
        />
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        {inner}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  kav:  { flex: 1 },
});
