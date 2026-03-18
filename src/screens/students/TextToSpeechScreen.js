import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import GoBackBtn from '../../components/GoBackBtn';
import { useAuth } from '../../context/AuthContext';
import { logSession } from '../../lib/analyticsHelper';
import { showAlert } from '../../lib/uiAlert';

export default function TextToSpeechScreen() {
  const { profile } = useAuth();
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const startTimeRef = useRef(null);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const speakRunIdRef = useRef(0);

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

  const tokenize = (t) => {
    const parts = String(t || '').match(/(\s+|[^\s]+)/g) || [];
    const tokens = [];
    let wordCursor = 0;
    for (const part of parts) {
      const isSpace = /^\s+$/.test(part);
      if (isSpace) tokens.push({ text: part, isWord: false, wordIndex: null });
      else {
        tokens.push({ text: part, isWord: true, wordIndex: wordCursor });
        wordCursor += 1;
      }
    }
    return { tokens, wordCount: wordCursor };
  };

  const stopSpeaking = async (shouldLog = true) => {
    speakRunIdRef.current += 1;
    try { await Speech.stop(); } catch (_) {}
    if (shouldLog) {
      const elapsed = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
      doLogSession(text, elapsed);
    }
    setIsSpeaking(false);
    setActiveWordIndex(-1);
  };

  const speakWordByIndex = (words, idx, runId, capturedText) => {
    if (runId !== speakRunIdRef.current) return;
    if (!words || idx >= words.length) {
      setIsSpeaking(false);
      setActiveWordIndex(-1);
      const elapsed = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
      doLogSession(capturedText, elapsed);
      return;
    }

    setActiveWordIndex(idx);
    Speech.speak(words[idx], {
      rate: 0.85,
      onDone: () => speakWordByIndex(words, idx + 1, runId, capturedText),
      onStopped: () => {
        if (runId === speakRunIdRef.current) {
          setIsSpeaking(false);
          setActiveWordIndex(-1);
        }
      },
      onError: () => {
        if (runId === speakRunIdRef.current) {
          setIsSpeaking(false);
          setActiveWordIndex(-1);
        }
      },
    });
  };

  const speak = async () => {
    if (!text.trim()) {
      showAlert('Nothing to Speak', 'Type some text first.');
      return;
    }

    if (isSpeaking) {
      await stopSpeaking(true);
      return;
    }

    const capturedText = text;
    const { tokens } = tokenize(capturedText);
    const words = tokens.filter(x => x.isWord).map(x => x.text);
    if (words.length === 0) {
      showAlert('Nothing to Speak', 'Type some text first.');
      return;
    }

    setIsSpeaking(true);
    startTimeRef.current = Date.now();
    await Speech.stop();
    const runId = (speakRunIdRef.current += 1);
    speakWordByIndex(words, 0, runId, capturedText);
  };

  const handleShare = async () => {
    if (!text.trim()) {
      showAlert('Nothing to share', 'Type some text first.');
      return;
    }
    try {
      await Share.share({ message: text });
    } catch (e) {
      showAlert('Error', 'Could not share text.');
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
          onChangeText={(t) => { setText(t); if (!isSpeaking) setActiveWordIndex(-1); }}
          nativeID="tts-input"
          textAlignVertical="top"
        />
      </View>

      {/* Read-along preview (highlighted as it speaks) */}
      {text.trim().length > 0 && (
        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>Read-along Preview</Text>
          <Text style={styles.previewText}>
            {tokenize(text).tokens.map((t, i) => {
              if (!t.isWord) return <Text key={`pws-${i}`}>{t.text}</Text>;
              const isActive = isSpeaking && t.wordIndex === activeWordIndex;
              return (
                <Text key={`pw-${i}`} style={isActive ? styles.activeWord : null}>
                  {t.text}
                </Text>
              );
            })}
          </Text>
        </View>
      )}

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
  input: { flex: 1, fontSize: 18, color: '#333', lineHeight: 28, textAlignVertical: 'top' },
  previewBox: { backgroundColor: '#F5F7FA', borderRadius: 15, padding: 14, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 16 },
  previewLabel: { fontSize: 12, fontWeight: 'bold', color: '#78909C', marginBottom: 6, textTransform: 'uppercase' },
  previewText: { fontSize: 16, color: '#333', lineHeight: 24 },
  activeWord: { backgroundColor: 'rgba(255, 235, 59, 0.6)' },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 20 },
  actionBtn: { width: 60, height: 60, borderRadius: 15, backgroundColor: '#FFE082', justifyContent: 'center', alignItems: 'center' },
  playBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#01579B', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  stopBtn: { backgroundColor: '#C62828' },
});