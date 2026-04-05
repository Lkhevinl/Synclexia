import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import c from './student/candyTokens';

/**
 * GoBackBtn — back button, optionally with an inline title bar.
 * Props:
 *   title  — when provided, renders a full top-bar row: [back] [title] [spacer]
 *   color  — icon color (default '#333'; pass '#fff' on dark headers)
 *   candy  — boolean; use candy/student design system styling
 *   style  — additional style overrides for the button (or the bar when title is set)
 *   right  — optional right-side element to replace the spacer
 */
export default function GoBackBtn({ color = '#333', style, title, right, candy = false }) {
  const navigation = useNavigation();

  const handlePress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  };

  const isDark = color === '#fff' || color?.startsWith('rgb(255');

  const btn = (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.btn,
        candy ? styles.btnCandy : (isDark ? styles.btnLight : styles.btnDark),
      ]}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="chevron-back" size={24} color={candy ? c.primary : (isDark ? '#fff' : '#E8927C')} />
    </TouchableOpacity>
  );

  if (title) {
    return (
      <View style={[candy ? styles.candyBar : styles.bar, style]}>
        {btn}
        <Text style={[styles.barTitle, isDark && styles.barTitleLight, candy && styles.barTitleCandy]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.barSpacer}>
          {right ?? null}
        </View>
      </View>
    );
  }

  return React.cloneElement(btn, {
    style: [
      styles.btn,
      candy ? styles.btnCandy : (isDark ? styles.btnLight : styles.btnDark),
      style,
    ],
  });
}

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDark: {
    backgroundColor: '#FFF0E8',
    borderWidth: 1.5,
    borderColor: '#E8927C40',
    elevation: 2,
    shadowColor: '#E8927C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  btnLight: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  btnCandy: {
    backgroundColor: c.primaryLight,
    borderWidth: 1.5,
    borderColor: c.primary + '40',
    borderRadius: 22,
    elevation: 2,
    shadowColor: c.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },

  // Top-bar modes
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  candyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  barTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginHorizontal: 8,
  },
  barTitleLight: {
    color: '#fff',
  },
  barTitleCandy: {
    color: c.text,
    fontWeight: '800',
  },
  barSpacer: {
    width: 44,
    alignItems: 'center',
  },
});
