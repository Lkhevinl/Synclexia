import React, { useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { AdaptiveProvider } from './src/context/AdaptiveContext';
import AppNavigator, { AuthNavigator } from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import LoadingScreen from './src/screens/LoadingScreen';
import { useTheme } from './src/context/ThemeContext';
import { useAuth } from './src/context/AuthContext';

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
  const { session, loading } = useAuth();
  const savedNavState = useRef(null);

  Text.defaultProps = Text.defaultProps ?? {};
  Text.defaultProps.style = Object.keys(a11yTextStyle).length > 0 ? a11yTextStyle : undefined;

  // Remount NavigationContainer on accessibility changes so Text picks up new defaultProps
  const a11yKey = `${theme.dyslexiaFont}-${theme.letterSpacing}-${theme.fontStyle}`;

  if (loading) return <LoadingScreen />;

  // ── NOT logged in: mount a clean auth-only NavigationContainer ──────────
  // When session becomes null this branch is rendered, the app NavigationContainer
  // is UNMOUNTED, and a fresh auth one is MOUNTED showing Login. Guaranteed.
  if (!session) {
    return (
      <NavigationContainer key={`auth-${a11yKey}`}>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  // ── Logged in ────────────────────────────────────────────────────────────
  return (
    <>
      <NavigationContainer
        ref={navigationRef}
        key={`app-${a11yKey}`}
        initialState={savedNavState.current ?? undefined}
        onStateChange={(state) => { savedNavState.current = state; }}
      >
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