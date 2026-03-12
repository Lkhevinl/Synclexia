import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoadingScreen() {
  const pulse = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in on mount
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 600,
      useNativeDriver: false,
    }).start();

    // Pulse loop on logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 800, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 1,    duration: 800, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient
      colors={['#f9a8c9', '#fde8d8', '#f9b8d0']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View style={[styles.content, { opacity: fadeIn }]}>

        {/* Logo */}
        <Animated.View style={[styles.logoWrapper, { transform: [{ scale: pulse }] }]}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />
        </Animated.View>

        {/* App name */}
        <Text style={styles.appName}>SYNCLEXIA</Text>
        <Text style={styles.tagline}>Learning made accessible.</Text>

        {/* Dot loader */}
        <View style={styles.dotsRow}>
          <DotBounce delay={0} />
          <DotBounce delay={200} />
          <DotBounce delay={400} />
        </View>

        <Text style={styles.loadingText}>Loading your progress...</Text>
      </Animated.View>
    </LinearGradient>
  );
}

function DotBounce({ delay }) {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(bounce, { toValue: -10, duration: 300, useNativeDriver: false }),
        Animated.timing(bounce, { toValue: 0,   duration: 300, useNativeDriver: false }),
        Animated.delay(600 - delay),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.dot, { transform: [{ translateY: bounce }] }]} />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center' },

  logoWrapper: {
    width: 130,
    height: 130,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 8,
    boxShadow: '0px 6px 12px rgba(192, 96, 128, 0.25)',
    overflow: 'hidden',
  },
  logoImg: { width: 120, height: 120, borderRadius: 28 },

  appName: {
    fontSize: 30,
    fontWeight: '900',
    color: '#7B2D52',
    letterSpacing: 4,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    color: '#9E5070',
    letterSpacing: 0.5,
    marginBottom: 36,
  },

  dotsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C06080',
  },

  loadingText: {
    fontSize: 13,
    color: '#9E5070',
    letterSpacing: 0.3,
  },
});