import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { AdaptiveProvider } from './src/context/AdaptiveContext';
import RootNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { useTheme } from './src/context/ThemeContext';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

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

  Text.defaultProps = Text.defaultProps ?? {};
  Text.defaultProps.style = Object.keys(a11yTextStyle).length > 0 ? a11yTextStyle : undefined;

  // Key changes on accessibility setting changes, remounting NavigationContainer
  // so all Text components pick up the updated defaultProps.
  const a11yKey = `${theme.dyslexiaFont}-${theme.letterSpacing}-${theme.fontStyle}`;

  return (
    <NavigationContainer ref={navigationRef} key={a11yKey}>
      <RootNavigator />
      <GlobalOverlay />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  if (!fontsLoaded) return null;

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