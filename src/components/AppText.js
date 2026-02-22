import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * Drop-in replacement for React Native's Text.
 * Automatically applies dyslexia font weight and letter spacing
 * from ThemeContext whenever those settings are enabled.
 */
export default function AppText({ style, children, ...props }) {
  const { a11yTextStyle } = useTheme();
  return (
    <Text style={[a11yTextStyle, style]} {...props}>
      {children}
    </Text>
  );
}
