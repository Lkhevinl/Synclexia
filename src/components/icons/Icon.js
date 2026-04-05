// src/components/icons/Icon.js
// Centralized Lucide Icon component with standard sizes

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { iconMapping } from './iconMapping';

// Standard icon sizes
export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,   // Standard medium size (default)
  lg: 32,
  xl: 48,
  xxl: 64,
};

// Converts kebab-case Lucide names to PascalCase: 'bar-chart' → 'BarChart'
function kebabToPascalCase(str) {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

// Check if a string is an emoji - more comprehensive detection
function isEmoji(str) {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  // Check for emoji using unicode ranges and properties
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F020}-\u{1F0FF}]|[\u{1F0A0}-\u{1F0FF}]|[\u{2190}-\u{21FF}]|[\u{2300}-\u{23FF}]|[\u{2460}-\u{24FF}]|[\u{25A0}-\u{25FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{2900}-\u{297F}]|[\u{2B00}-\u{2BFF}]|[\u{3000}-\u{303F}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2000}-\u{206F}]|[\u{E000}-\u{F8FF}]|[\u{FE00}-\u{FE0F}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F251}]|[\u{00A9}]|[\u{00AE}]|[\u{2122}]|[\u{3030}]|[\u{25AA}]|[\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2B50}]|[\u{2B55}]/gu;
  const nonEmojiRegex = /[a-zA-Z0-9\s\-_]/g;
  const cleaned = trimmed.replace(nonEmojiRegex, '');
  return cleaned.length > 0 || /^\p{Emoji}$/u.test(trimmed);
}

/**
 * Icon component - Centralized Lucide icon with standard sizing
 * @param {string} name - Icon name (Ionicons name will be auto-mapped to Lucide, or emoji)
 * @param {string|number} size - Size preset ('xs'|'sm'|'md'|'lg'|'xl'|'xxl') or custom number
 * @param {string} color - Icon color
 * @param {number} strokeWidth - Stroke width (default 2)
 * @param {object} style - Additional styles
 */
export default function Icon({ name, size = 'md', color = '#000', strokeWidth = 2, style, ...props }) {
  // Resolve size
  const resolvedSize = typeof size === 'string' ? ICON_SIZES[size] || ICON_SIZES.md : size;

  // If the name is an emoji, render it as text with explicit sizing
  if (isEmoji(name)) {
    const emojiSize = Math.round(resolvedSize * 0.85);
    return (
      <View style={[{ width: resolvedSize, height: resolvedSize, justifyContent: 'center', alignItems: 'center' }, style]} {...props}>
        <Text style={[styles.emojiText, { fontSize: emojiSize, lineHeight: resolvedSize }]}>
          {name}
        </Text>
      </View>
    );
  }

  // 1. Check explicit Ionicons→Lucide mapping
  // 2. Try auto-converting kebab-case Lucide name to PascalCase ('bar-chart' → 'BarChart')
  // 3. Fall back to original name as-is (for already-PascalCase usage)
  const lucideName = iconMapping[name] || kebabToPascalCase(name) || name;

  // Get the Lucide icon component
  const LucideIcon = LucideIcons[lucideName] || LucideIcons.CircleAlert;

  if (!LucideIcon) {
    console.warn(`Icon "${name}" (mapped to "${lucideName}") not found in Lucide icons`);
    return null;
  }

  return (
    <LucideIcon
      size={resolvedSize}
      color={color}
      strokeWidth={strokeWidth}
      style={style}
      {...props}
    />
  );
}

// Convenience exports for direct icon usage
export { LucideIcons };

const styles = StyleSheet.create({
  emojiText: {
    fontWeight: 'normal',
    textAlign: 'center',
  },
});
