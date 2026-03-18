import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import a11yStyleRef from '../lib/a11yStyleRef';

const THEME_STORAGE_KEY = '@synclexia_theme';

// 1. Create the Context
const ThemeContext = createContext();

const DEFAULT_THEME = {
  fontSize: 14,            // Default Text Size
  bgColor: '#FFF0F5',      // Default Background — pastel blush
  fontStyle: 'System',     // Default Font
  primaryColor: '#C06080', // Default Accent — rose

  // ── Dyslexia Accessibility Settings ──────────────────────────────────
  dyslexiaFont: false,     // Enables wider letter spacing + bolder weight for readability
  letterSpacing: 'normal', // 'normal' | 'wide' | 'wider'
  colorOverlay: 'none',    // 'none' | 'yellow' | 'blue' | 'green' | 'pink' | 'orange'
  audioInstructions: true, // Speak screen instructions on entry
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(DEFAULT_THEME);

  // Load persisted theme on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setTheme((prev) => ({ ...prev, ...JSON.parse(stored) }));
        } catch (_) {}
      }
    });
  }, []);

  // 2. Function to update settings — persists to AsyncStorage
  const updateTheme = (newSettings) => {
    setTheme((prev) => {
      const updated = { ...prev, ...newSettings };
      AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  // 3. Computed helpers consumed throughout the app
  const getLetterSpacingValue = () => {
    if (theme.letterSpacing === 'wide') return 2;
    if (theme.letterSpacing === 'wider') return 4;
    return 0;
  };

  const getOverlayColor = () => {
    switch (theme.colorOverlay) {
      case 'yellow': return 'rgba(255, 243, 150, 0.25)';
      case 'blue':   return 'rgba(173, 216, 255, 0.25)';
      case 'green':  return 'rgba(180, 255, 180, 0.25)';
      case 'pink':   return 'rgba(255, 182, 193, 0.25)';
      case 'orange': return 'rgba(255, 200, 120, 0.25)';
      default:       return null;
    }
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
    if (theme.letterSpacing === 'wide')  return { letterSpacing: 2 };
    if (theme.letterSpacing === 'wider') return { letterSpacing: 4 };
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
  // NOTE: We intentionally do NOT set a global fontSize here; that caused headings
  // to shrink/flatten. The global JSX patch will apply per-component scaling when
  // dyslexiaFont is enabled.
  const a11yTextStyle = { ...dyslexiaStyle, ...letterSpacingStyle, ...fontFamilyStyle };

  // ── Keep the global ref up to date so the patched Text always reads
  //    the latest value — updated synchronously during render so it is
  //    current before any child Text renders.
  a11yStyleRef.current = a11yTextStyle;
  a11yStyleRef.meta = {
    dyslexiaFont: !!theme.dyslexiaFont,
    textScale: theme.dyslexiaFont ? 1.12 : 1,
    inputScale: theme.dyslexiaFont ? 1.08 : 1,
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, getLetterSpacingValue, getOverlayColor, getDyslexiaTextStyle, dyslexiaStyle, letterSpacingStyle, resolveFontFamily, getFontFamily, fontFamilyStyle, a11yTextStyle }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 4. Hook to use it in any screen
export const useTheme = () => useContext(ThemeContext);