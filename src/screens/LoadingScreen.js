import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoadingScreen() {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F1DE" />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeIn,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Image
            source={require('../../assets/synclexia-logo2-removebg-preview.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F1DE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoImage: {
    width: SCREEN_WIDTH * 0.45,
    height: SCREEN_HEIGHT * 0.18,
  },
});
