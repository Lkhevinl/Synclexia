import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, StatusBar, useWindowDimensions } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { useTheme } from '../context/ThemeContext';

export default function LoadingScreen() {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeIn    = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(fadeIn, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <ScreenWrapper padded={false}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.inner}>
        <Animated.View style={{ opacity: fadeIn, transform: [{ scale: scaleAnim }] }}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Image
              source={require('../../assets/synclexia-logo2-removebg-preview.png')}
              style={{ width: width * 0.45, height: height * 0.18 }}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
