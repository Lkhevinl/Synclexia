import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import c from './candyTokens';

export default function StudentProgressBar({ progress = 0, height = 14, showLabel = false }) {
  const clamped = Math.min(100, Math.max(0, progress));
  return (
    <View style={[styles.container, { height }]}>
      <LinearGradient
        colors={['#FF9800', c.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${clamped}%` }]}
      />
      {showLabel && (
        <Text style={styles.label}>{clamped}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: c.primaryLight,
    borderRadius: 9999,
    borderWidth: 3,
    borderColor: '#fff',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 9999,
  },
  label: {
    position: 'absolute',
    alignSelf: 'center',
    color: '#fff',
    fontWeight: '800',
    fontSize: 10,
  },
});
