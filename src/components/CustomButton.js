import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function CustomButton({ title, onPress, loading, type = 'primary', style }) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={loading}
      style={[
        styles.btn, 
        type === 'secondary' ? styles.btnSec : styles.btnPri, 
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={type === 'secondary' ? '#006064' : '#333'} />
      ) : (
        <Text style={[styles.text, type === 'secondary' ? styles.textSec : styles.textPri]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { padding: 15, borderRadius: 25, alignItems: 'center', marginTop: 10, elevation: 3 },
  btnPri: { backgroundColor: '#FBC02D' },
  btnSec: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#006064' },
  text: { fontWeight: 'bold', fontSize: 16 },
  textPri: { color: '#333' },
  textSec: { color: '#006064' }
});