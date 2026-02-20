import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { AdaptiveProvider } from './src/context/AdaptiveContext';
import AppNavigator from './src/navigation/AppNavigator';
import { useTheme } from './src/context/ThemeContext';

// Sits INSIDE ThemeProvider so it can read theme state
function GlobalOverlay() {
  const { getOverlayColor } = useTheme();
  const overlayColor = getOverlayColor();
  if (!overlayColor) return null;
  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor, zIndex: 9999 }]}
      pointerEvents="none"
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AdaptiveProvider>
          <ThemeProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
            <GlobalOverlay />
          </ThemeProvider>
        </AdaptiveProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}