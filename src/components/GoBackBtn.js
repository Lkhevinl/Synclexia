import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function GoBackBtn() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity style={styles.container} onPress={() => navigation.goBack()}>
      <Ionicons name="arrow-back-circle" size={28} color="#006064" />
      <Text style={styles.text}>Back</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5, // Reduced from 20 to 5
    marginTop: 0,   // Reduced from 10 to 0
    alignSelf: 'flex-start', // Ensures it sticks to the left
  },
  text: {
    marginLeft: 5,
    fontSize: 16, // Slightly smaller text for better proportion
    color: '#006064',
    fontWeight: '600',
  }
});