import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoadingScreen() {
  const { getBgColor } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const bgColor = getBgColor();

  useEffect(() => {
    // Initial fade and scale in
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeIn,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* App Name */}
        <Text style={styles.appName}>SYNCLEXIA</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D5A5A',
    letterSpacing: 3,
  },
});
