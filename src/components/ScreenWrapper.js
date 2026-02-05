import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // <--- CHANGED FROM 'react-native'
import { useTheme } from '../context/ThemeContext';

export default function ScreenWrapper({ children, style }) {
  const { theme } = useTheme();

  return (
    // We use 'edges' to only protect the top/sides, letting the bottom flow naturally if needed
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bgColor }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={[styles.content, style]}>
          {children}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20 } 
});