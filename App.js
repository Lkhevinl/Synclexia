import React, { useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { AdaptiveProvider } from './src/context/AdaptiveContext';
import AppNavigator from './src/navigation/AppNavigator';
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
  const { session } = useAuth();

  // Persist nav state so accessibility key-change remounts land on the same screen.
  // Only restore when logged in — on logout we let the auth gate show Login fresh.
  const savedNavState = useRef(null);

  // Update Text.defaultProps synchronously every render so every Text that
  // mounts in this cycle already has the correct style.
  Text.defaultProps = Text.defaultProps ?? {};
  Text.defaultProps.style = Object.keys(a11yTextStyle).length > 0 ? a11yTextStyle : undefined;

  // Changing this key remounts NavigationContainer + all children so every
  // Text picks up the new defaultProps immediately.
  const a11yKey = `${theme.dyslexiaFont}-${theme.letterSpacing}-${theme.fontStyle}`;

  return (
    <>
      <NavigationContainer
        key={a11yKey}
        initialState={session && savedNavState.current ? savedNavState.current : undefined}
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