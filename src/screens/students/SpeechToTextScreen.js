import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { logSession } from '../../lib/analyticsHelper';

// expo-speech-recognition requires a dev/production build (not Expo Go).
// Install with: npx expo install expo-speech-recognition
// Then add the plugin to app.json plugins array.
let ExpoSpeechRecognitionModule, useSpeechRecognitionEvent;
try {
  const mod = require('expo-speech-recognition');
  ExpoSpeechRecognitionModule = mod.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = mod.useSpeechRecognitionEvent;
} catch (_) {
  ExpoSpeechRecognitionModule = null;
  useSpeechRecognitionEvent = () => {};
}

const AVAILABLE = !!ExpoSpeechRecognitionModule;

export default function SpeechToTextScreen() {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const startTimeRef = useRef(null);
  // Ref mirrors transcript state so event-handler closures always see latest value
  const transcriptRef = useRef('');

  const doLogSession = (finalTranscript) => {
    if (!profile?.id) return;
    const wordCount = finalTranscript.trim().split(/\s+/).filter(Boolean).length;
    const duration = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current) / 1000)
      : 0;
    logSession({
      studentId: profile.id,
      activityType: 'speech_to_text',
      score: wordCount > 0 ? 1 : 0,
      total: 1,
      durationSeconds: duration,
      details: { word_count: wordCount, char_count: finalTranscript.length },
    });
  };

  // Register event listeners if module is available
  useSpeechRecognitionEvent('result', (event) => {
    if (event?.results?.[0]) {
      const text = event.results[0].transcript ?? '';
      transcriptRef.current = text;   // keep ref in sync
      setTranscript(text);
    }
  });
  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
    // Use ref so we always have the latest transcript, not stale closure state
    const final = transcriptRef.current;
    if (final.trim()) doLogSession(final);
  });
  useSpeechRecognitionEvent('error', (event) => {
    setError(event?.message ?? 'Recognition error');
    setIsListening(false);
  });

  const toggleListening = async () => {
    if (!AVAILABLE) {
      Alert.alert(
        'Development Build Required',
        'Speech recognition requires a development build with expo-speech-recognition.\n\nSteps to enable:\n1. Run: npx expo install expo-speech-recognition\n2. Build with: eas build --platform android --profile development\n3. Install the development build on your device',
        [{ text: 'OK' }]
      );
      return;
    }

    if (isListening) {
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch (e) {
        console.warn('Error stopping speech recognition:', e);
      }
      setIsListening(false);
      return;
    }

    try {
      setError(null);
      setTranscript('');
      transcriptRef.current = '';

      const { granted } = await ExpoSpeechRecognitionModule.requestSpeechRecognizerPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Required', 'Microphone permission is required for speech recognition. Please enable it in your device settings.');
        return;
      }

      setIsListening(true);
      startTimeRef.current = Date.now();
      await ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: false
      });
    } catch (error) {
      setError(`Failed to start speech recognition: ${error.message}`);
      setIsListening(false);
    }
  };

  const handleClear = () => { transcriptRef.current = ''; setTranscript(''); setError(null); };

  return (
    <ScreenWrapper role="student" padded={false} edges={['left', 'right', 'bottom']}>
      <AppHeader title="Speech to Text" subtitle="Tap the microphone button below and speak clearly — your words will appear as text on screen!" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.transcriptBox}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.transcriptContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {transcript ? (
              <Text style={styles.transcriptText}>{transcript}</Text>
            ) : (
              <Text style={styles.placeholderText}>
                {isListening ? 'Listening... speak now 🎙️' : 'Your spoken words will appear here.'}
              </Text>
            )}
            {error && <Text style={styles.errorText}>⚠️ {error}</Text>}
          </ScrollView>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={[styles.clearBtn, !transcript && styles.clearBtnHidden]} onPress={handleClear} disabled={!transcript}>
            <Ionicons name="trash-outline" size={22} color="#78909C" />
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.micBtn, isListening && styles.micBtnActive]} onPress={toggleListening} activeOpacity={0.8}>
            <Ionicons name={isListening ? 'stop' : 'mic'} size={36} color="#fff" />
          </TouchableOpacity>

          <View style={styles.clearBtn} />
        </View>

        {!AVAILABLE && (
          <Text style={styles.devNote}>⚙️ Install expo-speech-recognition for live recognition</Text>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  transcriptBox: { height: 280, margin: 20, backgroundColor: '#fff', borderRadius: 20, elevation: 3 },
  scrollView: { flex: 1 },
  transcriptContent: { padding: 24, flexGrow: 1 },
  transcriptText: { fontSize: 22, color: '#333', lineHeight: 36 },
  placeholderText: { fontSize: 16, color: '#B0BEC5', textAlign: 'center', marginTop: 40, lineHeight: 26 },
  errorText: { fontSize: 14, color: '#F44336', marginTop: 16, textAlign: 'center' },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 40, paddingBottom: 100 },
  micBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8927C', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  micBtnActive: { backgroundColor: '#C62828' },
  clearBtn: { width: 60, height: 60, borderRadius: 15, backgroundColor: '#ECEFF1', justifyContent: 'center', alignItems: 'center' },
  clearBtnHidden: { opacity: 0 },
  clearBtnText: { fontSize: 11, color: '#78909C', fontWeight: 'bold', marginTop: 2 },
  devNote: { textAlign: 'center', fontSize: 12, color: '#90A4AE', paddingBottom: 16, paddingHorizontal: 20 },
});