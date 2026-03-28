import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import a11yStyleRef from '../lib/a11yStyleRef';

const THEME_STORAGE_KEY = '@synclexia_theme';

// Color themes based on overlay selection
const COLOR_THEMES = {
  none: {
    bgColor: '#FAF5F1',        // Warm cream
    primaryColor: '#C06080',   // Rose
    cardBg: '#ffffff',
    headerGradient: ['#4c669f', '#3b5998', '#192f6a'],
    accentLight: '#FCE4EC',
    textPrimary: '#333333',
    textSecondary: '#666666',
  },
  yellow: {
    bgColor: '#FFFDE7',        // Light yellow
    primaryColor: '#F9A825',   // Amber
    cardBg: '#FFF9C4',
    headerGradient: ['#FFB300', '#FF8F00', '#FF6F00'],
    accentLight: '#FFF59D',
    textPrimary: '#4E342E',
    textSecondary: '#6D4C41',
  },
  blue: {
    bgColor: '#E3F2FD',        // Light blue
    primaryColor: '#1976D2',   // Blue
    cardBg: '#BBDEFB',
    headerGradient: ['#42A5F5', '#1E88E5', '#1565C0'],
    accentLight: '#90CAF9',
    textPrimary: '#0D47A1',
    textSecondary: '#1565C0',
  },
  green: {
    bgColor: '#E8F5E9',        // Light green
    primaryColor: '#388E3C',   // Green
    cardBg: '#C8E6C9',
    headerGradient: ['#66BB6A', '#43A047', '#2E7D32'],
    accentLight: '#A5D6A7',
    textPrimary: '#1B5E20',
    textSecondary: '#2E7D32',
  },
  pink: {
    bgColor: '#FCE4EC',        // Light pink
    primaryColor: '#E91E63',   // Pink
    cardBg: '#F8BBD9',
    headerGradient: ['#EC407A', '#D81B60', '#AD1457'],
    accentLight: '#F48FB1',
    textPrimary: '#880E4F',
    textSecondary: '#AD1457',
  },
  orange: {
    bgColor: '#FFF3E0',        // Light orange
    primaryColor: '#F57C00',   // Orange
    cardBg: '#FFE0B2',
    headerGradient: ['#FF9800', '#F57C00', '#E65100'],
    accentLight: '#FFCC80',
    textPrimary: '#E65100',
    textSecondary: '#EF6C00',
  },
};

const DEFAULT_THEME = {
  fontSize: 12,            // Default Text Size
  bgColor: '#FAF5F1',      // Default Background — warm cream
  fontStyle: 'System',     // Default Font
  primaryColor: '#C06080', // Default Accent — rose

  // ── Dyslexia Accessibility Settings ──────────────────────────────────
  dyslexiaFont: false,     // Enables wider letter spacing + bolder weight for readability
  letterSpacing: 'normal', // 'normal' | 'wide' | 'wider'
  colorOverlay: 'none',    // 'none' | 'yellow' | 'blue' | 'green' | 'pink' | 'orange'
  audioInstructions: true, // Speak screen instructions on entry
};

const normalizeTheme = (rawTheme = {}) => {
  const merged = { ...DEFAULT_THEME, ...rawTheme };
  // Clamp fontSize to a safe range so UI cannot break with extreme values
  if (typeof merged.fontSize === 'number') {
    merged.fontSize = Math.max(10, Math.min(17, merged.fontSize));
  } else {
    merged.fontSize = DEFAULT_THEME.fontSize;
  }
  const colors = COLOR_THEMES[merged.colorOverlay] || COLOR_THEMES.none;

  // Keep derived color fields in sync because many screens read theme.* directly.
  return {
    ...merged,
    bgColor: colors.bgColor,
    primaryColor: colors.primaryColor,
    cardBg: colors.cardBg,
    headerGradient: colors.headerGradient,
    accentLight: colors.accentLight,
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
  };
};

// Create the Context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(normalizeTheme(DEFAULT_THEME));

  // Load persisted theme on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            setTheme((prev) => normalizeTheme({ ...prev, ...parsed }));
          }
        } catch (e) {
          console.warn('[ThemeContext] Corrupt stored theme, using defaults:', e);
        }
      }
    });
  }, []);

  // Function to update settings — persists to AsyncStorage
  const updateTheme = (newSettings) => {
    setTheme((prev) => {
      const updated = normalizeTheme({ ...prev, ...newSettings });
      AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  // Get the complete color theme based on colorOverlay selection
  const getThemeColors = () => {
    return COLOR_THEMES[theme.colorOverlay] || COLOR_THEMES.none;
  };

  // Computed helpers consumed throughout the app
  const getLetterSpacingValue = () => {
    if (theme.letterSpacing === 'wide') return 1;
    if (theme.letterSpacing === 'wider') return 2;
    return 0;
  };

  // Keep overlay color for backward compatibility (applies a tint on top)
  const getOverlayColor = () => {
    return null; // No longer using overlay - using full theme colors instead
  };

  // Dynamic background color based on theme selection
  const getBgColor = () => {
    const colors = getThemeColors();
    return colors.bgColor;
  };

  // Dynamic primary/accent color based on theme selection
  const getPrimaryColor = () => {
    const colors = getThemeColors();
    return colors.primaryColor;
  };

  // Get header gradient colors
  const getHeaderGradient = () => {
    const colors = getThemeColors();
    return colors.headerGradient;
  };

  // Get card background color
  const getCardBg = () => {
    const colors = getThemeColors();
    return colors.cardBg;
  };

  /**
   * Returns a text style object to apply dyslexia-friendly rendering.
   * Spread this into any Text or TextInput style when dyslexiaFont is on.
   * Usage: <Text style={[styles.myText, getDyslexiaTextStyle()]}>...</Text>
   */
  const getDyslexiaTextStyle = () => {
    if (!theme.dyslexiaFont) return {};
    return {
      fontWeight: '700',
      letterSpacing: 1.2,
    };
  };

  // Pre-computed style objects — spread directly onto any Text style
  const dyslexiaStyle = theme.dyslexiaFont ? { fontWeight: '700' } : {};

  const letterSpacingStyle = (() => {
    if (theme.letterSpacing === 'wide')  return { letterSpacing: 1 };
    if (theme.letterSpacing === 'wider') return { letterSpacing: 2 };
    return {};
  })();

  // Font family helper — platform-safe fallbacks (Android doesn't have many desktop fonts).
  // Keep the mapping distinct so users can *see* the difference.
  const resolveFontFamily = (fontStyleValue) => {
    if (!fontStyleValue || fontStyleValue === 'System') return undefined;

    const fontMap = {
      // These are labels from the picker; map to platform-available families.
      'OpenDyslexic': Platform.select({ ios: 'Arial Rounded MT Bold', android: 'monospace', default: 'monospace' }),
      'Open Sans': Platform.select({ ios: 'Arial', android: 'sans-serif', default: 'sans-serif' }),
      'Trebuchet MS': Platform.select({ ios: 'Trebuchet MS', android: 'serif', default: 'serif' }),
      'Century Gothic': Platform.select({ ios: 'Arial', android: 'sans-serif-light', default: 'sans-serif' }),
      'Calibri': Platform.select({ ios: 'Arial', android: 'sans-serif-condensed', default: 'sans-serif' }),
      'Arial': Platform.select({ ios: 'Arial', android: 'sans-serif', default: 'sans-serif' }),
      'Verdana': Platform.select({ ios: 'Verdana', android: 'sans-serif', default: 'sans-serif' }),
      'Tahoma': Platform.select({ ios: 'Tahoma', android: 'sans-serif', default: 'sans-serif' }),
    };

    return fontMap[fontStyleValue] || fontStyleValue;
  };

  const getFontFamily = () => resolveFontFamily(theme.fontStyle);
  const fontFamilyStyle = getFontFamily() ? { fontFamily: getFontFamily() } : {};

  // Combined — used by screens that explicitly apply it.
  // NOTE: fontSize is now included as a base font size that can be scaled
  const a11yTextStyle = {
    fontSize: theme.fontSize || 12,
    ...dyslexiaStyle,
    ...letterSpacingStyle,
    ...fontFamilyStyle
  };

  // ── Keep the global ref up to date so the patched Text always reads
  //    the latest value — updated synchronously during render so it is
  //    current before any child Text renders.
  a11yStyleRef.current = a11yTextStyle;

  // Calculate scale multiplier based on fontSize setting (base is 12)
  const fontSizeScale = (theme.fontSize || 12) / 12;
  const combinedTextScale = fontSizeScale * (theme.dyslexiaFont ? 1.12 : 1);
  const combinedInputScale = fontSizeScale * (theme.dyslexiaFont ? 1.08 : 1);

  a11yStyleRef.meta = {
    dyslexiaFont: !!theme.dyslexiaFont,
    textScale: combinedTextScale,
    inputScale: combinedInputScale,
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      updateTheme,
      getLetterSpacingValue,
      getOverlayColor, // kept for backward compatibility — always returns null
      getDyslexiaTextStyle,
      dyslexiaStyle,
      letterSpacingStyle,
      resolveFontFamily,
      getFontFamily,
      fontFamilyStyle,
      a11yTextStyle,
      getThemeColors,
      getBgColor,
      getPrimaryColor,
      getHeaderGradient,
      getCardBg,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 4. Hook to use it in any screen
export const useTheme = () => useContext(ThemeContext);