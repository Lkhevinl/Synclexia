import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // <--- NEW IMPORT
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';

import AppNavigator from './src/navigation/AppNavigator'; 

export default function App() {
  return (
    <SafeAreaProvider> {/* <--- WRAP EVERYTHING HERE */}
      <AuthProvider>
        <ThemeProvider> 
          <NavigationContainer>
             <AppNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}