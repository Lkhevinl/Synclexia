import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

/**
 * GoBackBtn — inline back button, works inside flex rows / gradient headers.
 * Props:
 *   color  — icon + border color (default '#333'; pass '#fff' on dark headers)
 *   style  — additional style overrides
 */
export default function GoBackBtn({ color = '#333', style }) {
  const navigation = useNavigation();

  const handlePress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  };

  const isDark = color === '#fff' || color?.startsWith('rgb(255');

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.btn, isDark ? styles.btnLight : styles.btnDark, style]}
      activeOpacity={0.75}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="chevron-back" size={22} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDark: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  btnLight: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});
