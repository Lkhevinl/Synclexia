import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import GoBackBtn from '../components/GoBackBtn';

export default function TextToSpeechScreen() {
  const [text, setText] = useState("");

  const speak = () => {
    if(text) Speech.speak(text);
  };

  return (
    <View style={styles.container}>
       <View style={styles.topRow}>
          <GoBackBtn />
          <Text style={styles.header}>Text-to-Speech</Text>
          <Ionicons name="notifications" size={24} color="#333" />
      </View>

      <View style={styles.textBox}>
          <TextInput 
            multiline 
            placeholder="Type something here..." 
            style={styles.input} 
            value={text} 
            onChangeText={setText} 
          />
      </View>

      <View style={styles.controls}>
          <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playBtn} onPress={speak}>
              <Ionicons name="play" size={32} color="#fff" />
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
  input: { fontSize: 18, color: '#333', lineHeight: 28 },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 20 },
  actionBtn: { width: 60, height: 60, borderRadius: 15, backgroundColor: '#FFE082', justifyContent: 'center', alignItems: 'center' },
  playBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#01579B', justifyContent: 'center', alignItems: 'center', elevation: 5 }
});