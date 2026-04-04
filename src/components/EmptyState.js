// src/components/EmptyState.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AppText from './AppText';
import tokens from '../theme/tokens';

export default function EmptyState({
  icon = 'file-tray-outline',
  message = 'Nothing to see here yet!',
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.circle, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon} size={50} color={colors.onSurfaceMuted} />
      </View>
      <AppText variant="body" style={styles.text}>{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: tokens.spacing.xxl, opacity: 0.85 },
  circle:    { width: 100, height: 100, borderRadius: tokens.radius.full, justifyContent: 'center', alignItems: 'center', marginBottom: tokens.spacing.md },
  text:      { fontWeight: '700', textAlign: 'center' },
});
