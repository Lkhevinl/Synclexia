import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GoBackBtn from '../components/GoBackBtn';

export default function SpeechToTextScreen() {
  const [text, setText] = useState("Hi sample text.");
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    setIsListening(true);
    // Simulation: In a real app, use 'expo-speech-recognition' or similar
    setTimeout(() => {
        setText((prev) => prev + " (I heard you!)");
        setIsListening(false);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
          <GoBackBtn />
          <Text style={styles.header}>Speech-to-text</Text>
          <Ionicons name="notifications" size={24} color="#333" />
      </View>

      <View style={styles.textBox}>
          <TextInput 
            multiline 
            style={styles.input} 
            value={text} 
            onChangeText={setText}
            editable={false} 
          />
      </View>

      <View style={styles.micContainer}>
          <TouchableOpacity style={styles.micBtn} onPress={startListening}>
             {isListening ? <ActivityIndicator color="#000" /> : <Ionicons name="mic" size={32} color="#000" />}
          </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 50 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  textBox: { flex: 1, backgroundColor: '#FFF9C4', borderRadius: 15, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#ddd' },
  input: { fontSize: 18, color: '#555', lineHeight: 28 },
  micContainer: { alignItems: 'center', marginBottom: 20 },
  micBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFE082', justifyContent: 'center', alignItems: 'center', elevation: 5 }
});