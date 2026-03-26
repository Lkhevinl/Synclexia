import React, { useEffect } from 'react';
import { View, Image, StyleSheet, StatusBar, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Synclexia App Colors
const COLORS = {
  background: '#F4F1DE',
  textPrimary: '#3A3A3A',
  textSecondary: '#6B6B6B',
  primary: '#F28C82',
  blue: '#6FA8DC',
  green: '#93C47D',
  lavender: '#B4A7D6',
};

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Image
        source={require('../../assets/synclexia-logo2-removebg-preview.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: SCREEN_WIDTH * 0.45,
    height: SCREEN_HEIGHT * 0.18,
  },
});
