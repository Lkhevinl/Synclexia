// src/components/CustomInput.js
import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import tokens from '../theme/tokens';

export default function CustomInput({
  label,
  value,
  onChangeText,
  placeholder,
  secure,
  multiline,
  keyboardType,
  autoCapitalize = 'none',
  style,
}) {
  const { colors, a11yTextStyle } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.onSurfaceMuted }, a11yTextStyle]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surfaceCard,
            borderColor:     colors.border,
            color:           colors.onSurface,
          },
          a11yTextStyle,
          multiline && styles.multiline,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.onSurfaceMuted}
        secureTextEntry={secure}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: tokens.spacing.md, width: '100%' },
  label:     { marginBottom: tokens.spacing.xs, fontWeight: '600', marginLeft: tokens.spacing.xs },
  input: {
    padding:      tokens.spacing.md,
    borderRadius: tokens.radius.md,
    borderWidth:  1,
    fontSize:     tokens.fontSize.md,
  },
  multiline: { height: 100, textAlignVertical: 'top' },
});
