import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EmptyState({ icon = "file-tray-outline", message = "Nothing to see here yet!" }) {
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Ionicons name={icon} size={50} color="#ccc" />
      </View>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 40, opacity: 0.8 },
  circle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  text: { color: '#888', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }
});