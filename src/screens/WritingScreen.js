import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, Alert, Modal } from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import GoBackBtn from '../components/GoBackBtn';

export default function WritingScreen() {
  const [inputText, setInputText] = useState('');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [feedback, setFeedback] = useState('Tap the speaker to hear the word');
  const [feedbackColor, setFeedbackColor] = useState('#555');
  
  // TUTORIAL STATE
  const [showTutorial, setShowTutorial] = useState(true); // Show automatically on start

  const words = [
    { word: "cat", hint: "A small pet that meows." },
    { word: "dog", hint: "A loyal pet that barks." },
    { word: "red", hint: "The color of an apple." },
    { word: "bat", hint: "A flying mammal." },
    { word: "bed", hint: "Where you sleep." },
  ];

  const targetWord = words[currentLevel].word;

  // Speak instructions when tutorial opens
  useEffect(() => {
    if (showTutorial) {
      Speech.speak("Welcome to Writing Practice! Listen to the word, then type it in the box.", { rate: 0.9 });
    }
  }, [showTutorial]);

  const playWord = () => {
    Speech.speak(targetWord, { rate: 0.7 });
  };

  const checkSpelling = () => {
    const userSpelling = inputText.toLowerCase().trim();
    if (userSpelling === targetWord) {
      setFeedback("Correct! Great job! 🎉");
      setFeedbackColor("#4CAF50");
      Speech.speak("Correct!", { rate: 1.0 });
      Keyboard.dismiss();
    } else {
      setFeedback("Not quite. Try again.");
      setFeedbackColor("#FF5252");
      Speech.speak("Try again.", { rate: 1.0 });
    }
  };

  const nextWord = () => {
    if (currentLevel < words.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setInputText('');
      setFeedback('Tap the speaker to hear the word');
      setFeedbackColor('#555');
    } else {
      Alert.alert("Completed!", "You finished all the words!");
      setCurrentLevel(0);
    }
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER ROW: Back Button + Help Button */}
      <View style={styles.topRow}>
        <GoBackBtn />
        <TouchableOpacity style={styles.helpBtn} onPress={() => setShowTutorial(true)}>
            <Ionicons name="help-circle" size={32} color="#2E7D32" />
            <Text style={styles.helpText}>Help</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.header}>Writing Practice</Text>
      <Text style={styles.subHeader}>Level {currentLevel + 1} of {words.length}</Text>

      <View style={styles.card}>
        <TouchableOpacity style={styles.audioBtn} onPress={playWord}>
           <Ionicons name="volume-high" size={50} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.instruction}>Listen & Type</Text>

        <TextInput 
            style={styles.input} 
            placeholder="Type word here..." 
            value={inputText}
            onChangeText={setInputText}
            autoCapitalize="none"
        />

        <Text style={styles.hint}>Hint: {words[currentLevel].hint}</Text>
        <Text style={[styles.feedback, { color: feedbackColor }]}>{feedback}</Text>

        <View style={styles.btnRow}>
            <TouchableOpacity style={styles.checkBtn} onPress={checkSpelling}>
                <Text style={styles.btnText}>Check</Text>
            </TouchableOpacity>

            {feedback.includes("Correct") && (
                <TouchableOpacity style={styles.nextBtn} onPress={nextWord}>
                    <Text style={styles.btnText}>Next ➡️</Text>
                </TouchableOpacity>
            )}
        </View>
      </View>

      {/* --- TUTORIAL POP-UP (MODAL) --- */}
      <Modal visible={showTutorial} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>How to Play</Text>
                
                <View style={styles.stepRow}>
                    <Ionicons name="volume-high" size={30} color="#2E7D32" />
                    <Text style={styles.stepText}>1. Tap the Speaker to hear a word.</Text>
                </View>
                
                <View style={styles.stepRow}>
                    <Ionicons name="keypad" size={30} color="#2E7D32" />
                    <Text style={styles.stepText}>2. Type the word in the box.</Text>
                </View>

                <View style={styles.stepRow}>
                    <Ionicons name="checkmark-circle" size={30} color="#2E7D32" />
                    <Text style={styles.stepText}>3. Press "Check" to see if you are right!</Text>
                </View>

                <TouchableOpacity 
                    style={styles.closeBtn} 
                    onPress={() => {
                        setShowTutorial(false);
                        Speech.stop();
                    }}
                >
                    <Text style={styles.btnText}>I Understand!</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#E8F5E9' },
  
  // Header with Help Button
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  helpBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 8, borderRadius: 20, elevation: 2 },
  helpText: { fontWeight: 'bold', color: '#2E7D32', marginLeft: 5 },

  header: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32', marginBottom: 5, marginTop: 10 },
  subHeader: { fontSize: 16, color: '#666', marginBottom: 20 },
  
  card: { backgroundColor: '#fff', padding: 30, borderRadius: 20, alignItems: 'center', elevation: 5 },
  audioBtn: { backgroundColor: '#2E7D32', width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 5 },
  instruction: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 20 },
  input: { width: '100%', backgroundColor: '#F1F8E9', padding: 15, fontSize: 24, borderRadius: 10, textAlign: 'center', borderWidth: 2, borderColor: '#C8E6C9', marginBottom: 10 },
  hint: { fontStyle: 'italic', color: '#888', marginBottom: 20 },
  feedback: { fontSize: 20, fontWeight: 'bold', marginBottom: 25, height: 30 },
  
  btnRow: { flexDirection: 'row', gap: 10 },
  checkBtn: { backgroundColor: '#2E7D32', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
  nextBtn: { backgroundColor: '#1976D2', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // MODAL STYLES (The Tutorial Box)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', padding: 30, borderRadius: 20, alignItems: 'center', elevation: 10 },
  modalTitle: { fontSize: 26, fontWeight: 'bold', color: '#2E7D32', marginBottom: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, width: '100%' },
  stepText: { fontSize: 18, color: '#444', marginLeft: 15, flex: 1 },
  closeBtn: { marginTop: 20, backgroundColor: '#FF9800', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25, elevation: 5 }
});