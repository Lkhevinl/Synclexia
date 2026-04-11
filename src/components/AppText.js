// src/components/AppText.js
import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import tokens from '../theme/tokens';

/**
 * Drop-in replacement for React Native's Text.
 * Automatically applies dyslexia font weight, letter spacing, font family,
 * and font size from ThemeContext whenever those settings are enabled.
 *
 * variant — maps to a token font size:
 *   'caption'  → tokens.fontSize.sm  (13)
 *   'body'     → tokens.fontSize.md  (15)  [default]
 *   'label'    → tokens.fontSize.sm  (13) + bold
 *   'heading'  → tokens.fontSize.lg  (18)
 *   'display'  → tokens.fontSize.xl  (22)
 */
const VARIANT_STYLES = {
  caption: { fontSize: tokens.fontSize.sm },
  body:    { fontSize: tokens.fontSize.md },
  label:   { fontSize: tokens.fontSize.sm, fontWeight: '600' },
  heading: { fontSize: tokens.fontSize.lg, fontWeight: '700' },
  display: { fontSize: tokens.fontSize.xl, fontWeight: '700' },
};

export default function AppText({ style, variant = 'body', children, ...props }) {
  const { a11yTextStyle, colors } = useTheme();
  const variantStyle = VARIANT_STYLES[variant] ?? VARIANT_STYLES.body;
  return (
    <Text style={[{ color: colors.onSurface }, variantStyle, a11yTextStyle, style]} {...props}>
      {children}
    </Text>
  );
}
