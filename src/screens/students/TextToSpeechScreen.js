import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import GoBackBtn from '../../components/GoBackBtn';
import { useAuth } from '../../context/AuthContext';
import { logSession } from '../../lib/analyticsHelper';

export default function TextToSpeechScreen() {
  const { profile } = useAuth();
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const startTimeRef = useRef(null);

  const doLogSession = (spokenText, durationSeconds) => {
    if (!profile?.id) return;
    logSession({
      studentId: profile.id,
      activityType: 'text_to_speech',
      score: spokenText.trim().length > 0 ? 1 : 0,
      total: 1,
      durationSeconds,
      details: {
        word_count: spokenText.trim().split(/\s+/).filter(Boolean).length,
        char_count: spokenText.length,
      },
    });
  };

  const speak = async () => {
    if (!text.trim()) {
      Alert.alert('Nothing to Speak', 'Type some text first.');
      return;
    }
    if (isSpeaking) {
      await Speech.stop();
      setIsSpeaking(false);
      const elapsed = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
      doLogSession(text, elapsed);
      return;
    }
    setIsSpeaking(true);
    startTimeRef.current = Date.now();
    const capturedText = text;
    Speech.speak(capturedText, {
      rate: 0.85,
      onDone: () => {
        setIsSpeaking(false);
        const elapsed = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
        doLogSession(capturedText, elapsed);
      },
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleShare = async () => {
    if (!text.trim()) {
      Alert.alert("Nothing to share", "Type some text first.");
      return;
    }
    try {
      await Share.share({ message: text });
    } catch (e) {
      Alert.alert("Error", "Could not share text.");
    }
  };

  return (
    <View style={styles.container}>
       <View style={styles.topRow}>
          <GoBackBtn />
          <Text style={styles.header}>Text-to-Speech</Text>
          <View style={{ width: 24 }} />
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
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.playBtn, isSpeaking && styles.stopBtn]} onPress={speak}>
              <Ionicons name={isSpeaking ? "stop" : "play"} size={32} color="#fff" />
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
  playBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#01579B', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  stopBtn: { backgroundColor: '#C62828' },
});