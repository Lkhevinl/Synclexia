import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useCandyTokens } from './candyTokens';

export default function StudentCard({ children, style, variant = 'default' }) {
  const c = useCandyTokens();
  const variantMap = {
    default: { backgroundColor: c.surface },
    tinted:  { backgroundColor: c.primaryLight },
    muted:   { backgroundColor: '#f5f5f5', opacity: 0.55 },
    success: { backgroundColor: '#E8F5E9' },
  };
  const v = variantMap[variant] || variantMap.default;
  return (
    <View style={[styles.card, v, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 4,
    borderColor: 'transparent',
    padding: 16,
  },
});
