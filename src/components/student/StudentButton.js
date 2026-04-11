import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import c from './candyTokens';

const FILL_COLORS = {
  primary: c.primary,
  success: '#66BB6A',
  muted:   '#ccc',
};

const SHADOW_COLORS = {
  primary: c.primaryDark,
  success: c.successDark,
  muted:   '#888',
};

export default function StudentButton({ children, onPress, variant = 'primary', style, disabled }) {
  const activeVariant = disabled ? 'muted' : variant;
  const isOutline = activeVariant === 'outline';

  if (isOutline) {
    return (
      <TouchableOpacity
        onPress={disabled ? undefined : onPress}
        activeOpacity={0.75}
        style={[styles.outlineOuter, style]}
      >
        <View style={styles.outlineInner}>
          {typeof children === 'string'
            ? <Text style={styles.outlineText}>{children}</Text>
            : children}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      activeOpacity={0.85}
      style={[
        styles.outer,
        { borderBottomColor: SHADOW_COLORS[activeVariant] || c.primaryDark },
        style,
      ]}
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
    borderBottomWidth: 4,
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
    borderColor: c.primary,
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
    color: c.primary,
    fontWeight: '700',
    fontSize: 15,
  },
});
