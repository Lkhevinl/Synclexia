import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export default function CustomInput({ label, value, onChangeText, placeholder, secure, multiline }) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput 
        style={[styles.input, multiline && {height: 100, textAlignVertical: 'top'}]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secure}
        multiline={multiline}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 15, width: '100%' },
  label: { color: '#666', marginBottom: 5, fontWeight: 'bold', marginLeft: 10 },
  input: { backgroundColor: '#F9FBE7', padding: 15, borderRadius: 25, borderWidth: 1, borderColor: '#E0E0E0' }
});