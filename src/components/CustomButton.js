// src/components/CustomButton.js
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import tokens from '../theme/tokens';

const SIZE_STYLES = {
  sm: { paddingVertical: tokens.spacing.sm,  paddingHorizontal: tokens.spacing.md, fontSize: tokens.fontSize.sm },
  md: { paddingVertical: tokens.spacing.md,  paddingHorizontal: tokens.spacing.xl, fontSize: tokens.fontSize.md },
  lg: { paddingVertical: tokens.spacing.lg,  paddingHorizontal: tokens.spacing.xl, fontSize: tokens.fontSize.lg },
};

/**
 * type — 'primary' (filled) | 'secondary' (outlined)  [default: 'primary']
 * size — 'sm' | 'md' | 'lg'                           [default: 'md']
 */
export default function CustomButton({ title, onPress, loading, type = 'primary', size = 'md', style }) {
  const { colors } = useTheme();
  const sz = SIZE_STYLES[size] ?? SIZE_STYLES.md;
  const isPrimary = type === 'primary';

  const btnStyle = {
    backgroundColor:   isPrimary ? colors.primary : 'transparent',
    borderWidth:       isPrimary ? 0 : 1.5,
    borderColor:       isPrimary ? 'transparent' : colors.primary,
    borderRadius:      tokens.radius.full,
    paddingVertical:   sz.paddingVertical,
    paddingHorizontal: sz.paddingHorizontal,
    alignItems:        'center',
    marginTop:         tokens.spacing.sm,
    ...tokens.shadows.low,
  };

  const textStyle = {
    color:      isPrimary ? colors.onPrimary : colors.primary,
    fontSize:   sz.fontSize,
    fontWeight: '700',
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={loading} style={[btnStyle, style]} activeOpacity={0.8}>
      {loading
        ? <ActivityIndicator color={isPrimary ? colors.onPrimary : colors.primary} />
        : <Text style={textStyle}>{title}</Text>
      }
    </TouchableOpacity>
  );
}
