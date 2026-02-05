import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>S</Text>
      </View>
      <Text style={styles.title}>SYNCLEXIA</Text>
      <ActivityIndicator size="large" color="#FBC02D" style={{marginTop: 20}} />
      <Text style={styles.loading}>Loading your progress...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDE7', justifyContent: 'center', alignItems: 'center' },
  logoBox: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#333', marginBottom: 20 },
  logoText: { fontSize: 40, fontWeight: 'bold', color: '#5C6BC0' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', letterSpacing: 2 },
  loading: { marginTop: 10, color: '#666' }
});