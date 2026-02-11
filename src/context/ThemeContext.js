import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Create the Context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Default Settings
  const [theme, setTheme] = useState({
    fontSize: 14,          // Default Text Size
    bgColor: '#F5F7FA',    // Default Background
    fontStyle: 'System',   // Default Font
    primaryColor: '#4c669f' // Default Accent
  });

  // 2. Function to update settings
  const updateTheme = (newSettings) => {
    setTheme((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 3. Hook to use it in any screen
export const useTheme = () => useContext(ThemeContext);