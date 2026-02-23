import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
      style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor, zIndex: 9999, pointerEvents: 'none' }]}
    />
  );
}

function AppWithTheme() {
  const { theme, a11yTextStyle } = useTheme();

  // Apply synchronously during render so every Text that mounts
  // in this render cycle already has the correct defaultProps.
  Text.defaultProps = Text.defaultProps ?? {};
  Text.defaultProps.style = Object.keys(a11yTextStyle).length > 0 ? a11yTextStyle : undefined;

  // Key forces NavigationContainer + all children to remount when
  // accessibility settings change, picking up the new defaultProps.
  const a11yKey = `${theme.dyslexiaFont}-${theme.letterSpacing}`;

  return (
    <>
      <NavigationContainer key={a11yKey}>
        <AppNavigator />
      </NavigationContainer>
      <GlobalOverlay />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <AuthProvider>
        <AdaptiveProvider>
          <ThemeProvider>
            <AppWithTheme />
          </ThemeProvider>
        </AdaptiveProvider>
      </AuthProvider>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}