import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function GoBackBtn() {
  const navigation = useNavigation();
  
  return (
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn}>
      <Ionicons name="chevron-back" size={28} color="#333" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    top: 50, // Adjust based on your status bar
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: 5
  }
});