import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useCandyTokens } from './candyTokens';

export default function StudentButton({ children, onPress, variant = 'primary', style, disabled }) {
  const c = useCandyTokens();
  const FILL_COLORS = { primary: c.primary, success: '#66BB6A', muted: '#ccc' };
  const SHADOW_COLORS = { primary: c.primaryDark, success: c.successDark, muted: '#888' };
  const activeVariant = disabled ? 'muted' : variant;
  const isOutline = activeVariant === 'outline';

  if (isOutline) {
    return (
      <TouchableOpacity
        onPress={disabled ? undefined : onPress}
        activeOpacity={0.75}
        style={[styles.outlineOuter, { borderColor: c.primary }, style]}
      >
        <View style={styles.outlineInner}>
          {typeof children === 'string'
            ? <Text style={[styles.outlineText, { color: c.primary }]}>{children}</Text>
            : children}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      activeOpacity={0.85}
      style={[styles.outer, style]}
    >
      <View style={[styles.gradient, { backgroundColor: FILL_COLORS[activeVariant] || c.primary }]}>
        {typeof children === 'string'
          ? <Text style={styles.text}>{children}</Text>
          : children}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  outlineOuter: {
    borderRadius: 9999,
    borderWidth: 2,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  outlineInner: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outlineText: {
    fontWeight: '700',
    fontSize: 15,
  },
});
