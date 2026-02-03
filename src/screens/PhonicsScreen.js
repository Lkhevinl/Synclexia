import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Speech from 'expo-speech';
import GoBackBtn from '../components/GoBackBtn'; // Import your new button

export default function PhonicsScreen() {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const speak = (letter) => {
    Speech.speak(letter, { rate: 0.8, pitch: 1.1 });
  };

  return (
    <View style={styles.container}>
      {/* 1. THE BACK BUTTON */}
      <GoBackBtn />

      <Text style={styles.header}>Phonics Soundboard</Text>
      <Text style={styles.subHeader}>Tap a tile to hear the sound</Text>

      <ScrollView contentContainerStyle={styles.grid}>
        {letters.map((letter) => (
          <TouchableOpacity 
            key={letter} 
            style={styles.card} 
            onPress={() => speak(letter)}
            activeOpacity={0.6} // Nice touch effect
          >
            <Text style={styles.letter}>{letter}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    paddingTop: 50, 
    backgroundColor: '#E0F7FA' // Soft blue background
  },
  header: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#006064', 
    marginBottom: 5 
  },
  subHeader: { 
    fontSize: 16, 
    color: '#555', 
    marginBottom: 20 
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    paddingBottom: 40
  },
  // IMPROVED UI: 3D Tile Look
  card: { 
    width: '45%', // Two columns
    aspectRatio: 1, // Perfect square
    backgroundColor: '#FFFFFF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20, 
    borderRadius: 20, 
    // Shadow for "Pop" effect
    elevation: 5, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderBottomWidth: 6, // 3D effect
    borderBottomColor: '#B2EBF2'
  },
  letter: { 
    fontSize: 60, 
    fontWeight: 'bold', 
    color: '#0097A7' 
  },
});