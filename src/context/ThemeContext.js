import React, { createContext, useState, useContext } from 'react';

// 1. Create the Context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Default Settings
  const [theme, setTheme] = useState({
    fontSize: 14,            // Default Text Size
    bgColor: '#F5F7FA',      // Default Background
    fontStyle: 'System',     // Default Font
    primaryColor: '#4c669f', // Default Accent

    // ── Dyslexia Accessibility Settings ──────────────────────────────────
    dyslexiaFont: false,     // Enables wider letter spacing + bolder weight for readability
    letterSpacing: 'normal', // 'normal' | 'wide' | 'wider'
    colorOverlay: 'none',    // 'none' | 'yellow' | 'blue' | 'green' | 'pink' | 'orange'
    audioInstructions: true, // Speak screen instructions on entry
  });

  // 2. Function to update settings
  const updateTheme = (newSettings) => {
    setTheme((prev) => ({ ...prev, ...newSettings }));
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

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, getLetterSpacingValue, getOverlayColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 4. Hook to use it in any screen
export const useTheme = () => useContext(ThemeContext);