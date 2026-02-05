import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Line } from 'react-native-svg'; // <--- Drawing Tools
import GoBackBtn from '../components/GoBackBtn';
import { supabase } from '../lib/supabase';

// DATA: Letters to trace
const LETTERS = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");

export default function WritingScreen() {
  const [selectedLetter, setSelectedLetter] = useState(null); // Null = Grid, 'A' = Tracing
  const [paths, setPaths] = useState([]); // Stores the drawing lines
  const [currentPath, setCurrentPath] = useState(''); 

  // --- DRAWING LOGIC (PanResponder) ---
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath(`M${locationX},${locationY}`);
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath((prev) => `${prev} L${locationX},${locationY}`);
    },
    onPanResponderRelease: async () => {
      setPaths((prev) => [...prev, currentPath]);
      setCurrentPath('');
      
      // GAMIFICATION: Award XP for "finishing" a drawing (Simulated)
      if (paths.length > 2) {
         await supabase.rpc('add_xp', { amount: 5 });
         Alert.alert("Great Job!", "You practiced " + selectedLetter + "! (+5 XP)");
      }
    },
  });

  const clearBoard = () => {
    setPaths([]);
    setCurrentPath('');
  };

  // --- RENDER 1: THE GRID (Select a Letter) ---
  if (!selectedLetter) {
    return (
      <View style={styles.container}>
        <GoBackBtn />
        <Text style={styles.header}>Writing Practice ✍️</Text>
        <Text style={styles.subHeader}>Choose a letter to trace:</Text>

        <ScrollView contentContainerStyle={styles.grid}>
          {LETTERS.map((letter) => (
            <TouchableOpacity key={letter} style={styles.letterCard} onPress={() => setSelectedLetter(letter)}>
              <Text style={styles.letterText}>{letter}</Text>
              <View style={styles.lockIcon}>
                  {/* Visual polish: Open lock for demo */}
                  <Ionicons name="lock-open-outline" size={16} color="#aaa" /> 
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // --- RENDER 2: THE TRACING BOARD ---
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => setSelectedLetter(null)}>
           <Ionicons name="arrow-back" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.header}>{selectedLetter}</Text>
        <TouchableOpacity onPress={clearBoard}>
           <Ionicons name="refresh" size={30} color="#006064" />
        </TouchableOpacity>
      </View>

      {/* VIDEO / INSTRUCTION PLACEHOLDER */}
      <View style={styles.videoPlaceholder}>
          <Text style={styles.videoText}>VIDEO DEMO</Text>
          <Text style={styles.guideText}>1. Down  2. Down  3. Across</Text>
          <Ionicons name="play-circle" size={50} color="rgba(0,0,0,0.5)" />
      </View>

      {/* DRAWING CANVAS */}
      <Text style={styles.instruction}>Trace the letter below:</Text>
      
      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
          {/* Background Letter Guide */}
          <Text style={styles.backgroundLetter}>{selectedLetter}</Text>
          
          {/* The Actual Drawing */}
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            {paths.map((d, index) => (
              <Path key={index} d={d} stroke="#000" strokeWidth={15} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
            <Path d={currentPath} stroke="#000" strokeWidth={15} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
      </View>

      <View style={styles.colorPalette}>
          {['#F44336', '#4CAF50', '#2196F3', '#FFEB3B', '#000000'].map(color => (
              <View key={color} style={[styles.colorDot, {backgroundColor: color}]} />
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#FFFDE7' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#FBC02D', textAlign: 'center', marginBottom: 10 },
  subHeader: { textAlign: 'center', color: '#666', marginBottom: 20 },
  
  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, paddingBottom: 50 },
  letterCard: { width: 80, height: 80, backgroundColor: '#fff', borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 3, borderWidth: 1, borderColor: '#eee' },
  letterText: { fontSize: 40, fontWeight: 'bold', color: '#333', fontFamily: 'monospace' },
  lockIcon: { position: 'absolute', top: 5, right: 5 },

  // Tracing
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  videoPlaceholder: { height: 150, backgroundColor: '#FFF59D', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: '#FBC02D' },
  videoText: { fontWeight: 'bold', color: '#F9A825', letterSpacing: 2 },
  guideText: { fontSize: 12, color: '#555', marginBottom: 5 },
  
  instruction: { textAlign: 'center', marginBottom: 10, color: '#888' },
  canvasContainer: { height: 350, backgroundColor: '#fff', borderRadius: 20, borderWidth: 2, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  backgroundLetter: { fontSize: 300, color: '#f0f0f0', fontWeight: 'bold', position: 'absolute' },
  
  colorPalette: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginTop: 20 },
  colorDot: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#ccc' }
});