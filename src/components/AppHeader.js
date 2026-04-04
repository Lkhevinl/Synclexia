/**
 * AppHeader — consistent top header for all secondary screens.
 *
 * Props:
 *   title       — main title string (required)
 *   subtitle    — optional smaller text below the title
 *   variant     — 'default' (gradient) | 'flat' (solid surface, dark text)
 *                 admin/teacher screens use 'flat'; default is 'default'
 *   right       — optional right-side React node
 *   showBack    — show back button (default true)
 *   backColor   — back button icon color (auto-set by variant, but overridable)
 *
 * Note: the old `colors` prop is removed — gradients are read from ThemeContext automatically.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import tokens from '../theme/tokens';
import GoBackBtn from './GoBackBtn';

export default function AppHeader({
  title,
  subtitle,
  variant = 'default',
  right = null,
  showBack = true,
  backColor,
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const isFlat = variant === 'flat';
  const resolvedBackColor = backColor ?? (isFlat ? colors.onSurface : '#fff');
  const paddingTop = Math.max(insets.top + 12, 28);

  const content = (
    <View style={[styles.row, { paddingTop, paddingBottom: tokens.spacing.lg, paddingHorizontal: tokens.spacing.md }]}>
      <View style={styles.side}>
        {showBack && <GoBackBtn color={resolvedBackColor} />}
      </View>
      <View style={styles.center}>
        <Text style={[styles.title, isFlat && { color: colors.onSurface }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, isFlat && { color: colors.onSurfaceMuted }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.side}>{right}</View>
    </View>
  );

  if (isFlat) {
    return (
      <View style={[styles.flatHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {content}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={colors.headerGradient}
      style={styles.gradientHeader}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {content}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientHeader: {
    borderBottomLeftRadius: tokens.radius.xl,
    borderBottomRightRadius: tokens.radius.xl,
  },
  flatHeader: {
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  side: {
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: tokens.fontSize.lg,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: tokens.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 3,
  },
});
