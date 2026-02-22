import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GoBackBtn from '../../components/GoBackBtn';

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
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  // Register event listeners if module is available
  useSpeechRecognitionEvent('result', (event) => {
    if (event?.results?.[0]) {
      setTranscript(event.results[0].transcript ?? '');
    }
  });
  useSpeechRecognitionEvent('end', () => setIsListening(false));
  useSpeechRecognitionEvent('error', (event) => {
    setError(event?.message ?? 'Recognition error');
    setIsListening(false);
  });

  const toggleListening = async () => {
    if (!AVAILABLE) {
      Alert.alert(
        'Not Available',
        'Speech recognition requires a development build.\n\nRun: npx expo install expo-speech-recognition\nThen rebuild the app with EAS.',
      );
      return;
    }
    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
      setIsListening(false);
      return;
    }
    setError(null);
    setTranscript('');
    const { granted } = await ExpoSpeechRecognitionModule.requestSpeechRecognizerPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission Denied', 'Microphone permission is required for speech recognition.');
      return;
    }
    setIsListening(true);
    ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: true, continuous: false });
  };

  const handleClear = () => { setTranscript(''); setError(null); };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#01579B', '#0288D1']} style={styles.header}>
        <GoBackBtn />
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Speech to Text</Text>
          <Text style={styles.headerSub}>Tap the mic and start speaking</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.transcriptBox} contentContainerStyle={styles.transcriptContent}>
        {transcript ? (
          <Text style={styles.transcriptText}>{transcript}</Text>
        ) : (
          <Text style={styles.placeholderText}>
            {isListening ? 'Listening... speak now 🎙️' : 'Your spoken words will appear here.'}
          </Text>
        )}
        {error && <Text style={styles.errorText}>⚠️ {error}</Text>}
      </ScrollView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitleBox: { alignItems: 'center', marginTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  transcriptBox: { flex: 1, margin: 20, backgroundColor: '#fff', borderRadius: 20, elevation: 3 },
  transcriptContent: { padding: 24, minHeight: 200 },
  transcriptText: { fontSize: 22, color: '#333', lineHeight: 36 },
  placeholderText: { fontSize: 16, color: '#B0BEC5', textAlign: 'center', marginTop: 40, lineHeight: 26 },
  errorText: { fontSize: 14, color: '#F44336', marginTop: 16, textAlign: 'center' },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 40, paddingBottom: 40 },
  micBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0288D1', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  micBtnActive: { backgroundColor: '#C62828' },
  clearBtn: { width: 60, height: 60, borderRadius: 15, backgroundColor: '#ECEFF1', justifyContent: 'center', alignItems: 'center' },
  clearBtnHidden: { opacity: 0 },
  clearBtnText: { fontSize: 11, color: '#78909C', fontWeight: 'bold', marginTop: 2 },
  devNote: { textAlign: 'center', fontSize: 12, color: '#90A4AE', paddingBottom: 16, paddingHorizontal: 20 },
});