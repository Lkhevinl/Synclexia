// src/components/icons/Icon.js
// Centralized Lucide Icon component with standard sizes

import React from 'react';
import { Text } from 'react-native';
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

// Check if a string is an emoji
function isEmoji(str) {
  if (!str || typeof str !== 'string') return false;
  // Emoji regex pattern - matches most emoji characters
  const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})$/u;
  return emojiRegex.test(str.trim());
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

  // If the name is an emoji, render it as text
  if (isEmoji(name)) {
    return (
      <Text style={[{ fontSize: resolvedSize, color: color, lineHeight: resolvedSize * 1.2 }, style]} {...props}>
        {name}
      </Text>
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
