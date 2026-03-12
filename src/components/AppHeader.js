/**
 * AppHeader — consistent top header for all secondary screens.
 *
 * Props:
 *   title       — main title string (required)
 *   subtitle    — optional smaller text below the title
 *   colors      — gradient colors array (default deep blue)
 *   right       — optional right-side React node (icon button, etc.)
 *   showBack    — show back button (default true)
 *   backColor   — back button icon color (default '#fff')
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GoBackBtn from './GoBackBtn';

export default function AppHeader({
  title,
  subtitle,
  colors = ['#3b5998', '#192f6a'],
  right = null,
  showBack = true,
  backColor = '#fff',
}) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={colors}
      style={[styles.header, { paddingTop: Math.max(insets.top + 12, 28) }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.row}>
        {/* Left — back button */}
        <View style={styles.side}>
          {showBack && <GoBackBtn color={backColor} />}
        </View>

        {/* Center — title */}
        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>

        {/* Right — optional action */}
        <View style={styles.side}>{right}</View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 3,
  },
});
