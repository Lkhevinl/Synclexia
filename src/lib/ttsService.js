import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';
import { GOOGLE_TTS } from './constants';

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_TTS_API_KEY;

let _sound = null;
let _resolveCurrentSpeak = null;
let _abortController = null;

// In-memory cache: text → audio URI (avoids re-fetching the same word/letter)
const _audioCache = new Map();

// Returns a URI expo-av can load from a base64 MP3 string
async function getAudioUri(mp3Base64, cacheKey) {
  if (Platform.OS === 'web') {
    const bytes = Uint8Array.from(atob(mp3Base64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: 'audio/mp3' });
    return URL.createObjectURL(blob);
  }
  // Native: write to filesystem cache with a stable filename per text
  const safe = cacheKey.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40);
  const fileUri = `${FileSystem.cacheDirectory}tts_${safe}.mp3`;
  await FileSystem.writeAsStringAsync(fileUri, mp3Base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return fileUri;
}

export function stop() {
  if (_abortController) {
    _abortController.abort();
    _abortController = null;
  }
  if (_resolveCurrentSpeak) {
    _resolveCurrentSpeak();
    _resolveCurrentSpeak = null;
  }
  if (_sound) {
    _sound.stopAsync().catch(() => {});
    _sound.unloadAsync().catch(() => {});
    _sound = null;
  }
}

export async function speak(text) {
  stop();
  if (!text?.trim()) return;

  try {
    let uri = _audioCache.get(text);

    if (!uri) {
      _abortController = new AbortController();
      const response = await fetch(
        `${GOOGLE_TTS.API_URL}?key=${API_KEY}`,
        {
          method: 'POST',
          signal: _abortController.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text },
            voice: {
              languageCode: GOOGLE_TTS.LANGUAGE_CODE,
              name: GOOGLE_TTS.VOICE_NAME,
            },
            audioConfig: {
              audioEncoding: 'MP3',
              speakingRate: GOOGLE_TTS.SPEAKING_RATE,
            },
          }),
        }
      );

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        console.error('[TTS] API error', response.status, errBody);
        if (response.status !== 429) {
          Alert.alert('TTS Error', `Status ${response.status}`);
        }
        return;
      }

      const json = await response.json();
      const mp3Base64 = json.audioContent;
      if (!mp3Base64) {
        console.error('[TTS] No audioContent in response', JSON.stringify(json));
        return;
      }

      uri = await getAudioUri(mp3Base64, text);
      _audioCache.set(text, uri);
    }

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    }).catch(() => {});

    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true, volume: 1.0 }
    );
    _sound = sound;

    return new Promise((resolve) => {
      _resolveCurrentSpeak = resolve;
      sound.setOnPlaybackStatusUpdate((st) => {
        if (st.didJustFinish || st.error) {
          sound.unloadAsync().catch(() => {});
          if (_sound === sound) _sound = null;
          if (_resolveCurrentSpeak === resolve) _resolveCurrentSpeak = null;
          resolve();
        }
      });
    });
  } catch (e) {
    if (e?.name === 'AbortError') return;
    console.error('[TTS] error', e);
    Alert.alert('No Internet', 'Sound requires internet connection.');
  }
}
