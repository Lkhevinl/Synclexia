import React, { useEffect } from 'react';
import { View, Image, StyleSheet, StatusBar, useWindowDimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/ScreenWrapper';

export default function SplashScreen({ navigation }) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ScreenWrapper padded={false}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={[styles.inner, { backgroundColor: colors.surface }]}>
        <Image
          source={require('../../assets/synclexia-logo2-removebg-preview.png')}
          style={{ width: width * 0.5, height: height * 0.22 }}
          resizeMode="contain"
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
