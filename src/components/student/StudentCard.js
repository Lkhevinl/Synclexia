import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useCandyTokens } from './candyTokens';

export default function StudentCard({ children, style, variant = 'default' }) {
  const c = useCandyTokens();
  const variantMap = {
    default: { backgroundColor: c.surface,      shadowColor: c.primary },
    tinted:  { backgroundColor: c.primaryLight, shadowColor: c.primary },
    muted:   { backgroundColor: '#f5f5f5',      shadowColor: '#999', opacity: 0.55 },
    success: { backgroundColor: '#E8F5E9',      shadowColor: c.success },
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
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
});
