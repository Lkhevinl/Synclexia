import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GoBackBtn() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets(); // <--- Detects Notch/Dynamic Island automatically

  const handlePress = () => {
    // 1. Smart Safety Check
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // 2. Fallback to Home (AppTabs) if history is lost
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }], 
      });
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      style={[
        styles.btn, 
        { top: Math.max(insets.top + 10, 20) } // Dynamic positioning
      ]}
    >
      <Ionicons name="chevron-back" size={24} color="#333" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    left: 20,
    zIndex: 100,
    
    // Modern "Glass" Look
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Slightly transparent
    width: 45,
    height: 45,
    borderRadius: 25, // Perfect Circle
    justifyContent: 'center',
    alignItems: 'center',

    // Professional Drop Shadow
    boxShadow: '0px 4px 8px rgba(0,0,0,0.15)',
    elevation: 6,

    // Subtle border for contrast on light images
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  }
});