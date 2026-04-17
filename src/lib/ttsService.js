import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';
import { ELEVENLABS_TTS } from './constants';

const API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;

let _sound = null;
let _resolveCurrentSpeak = null;
let _abortController = null;

// In-memory cache: text → audio URI
const _audioCache = new Map();

// ElevenLabs returns raw MP3 binary — convert to a URI expo-av can load
async function getAudioUri(arrayBuffer, cacheKey) {
  if (Platform.OS === 'web') {
    const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  }
  // Native: encode to base64 and write to cache file
  const bytes = new Uint8Array(arrayBuffer);
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let b64 = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i], b = bytes[i + 1] ?? 0, c = bytes[i + 2] ?? 0;
    b64 += CHARS[a >> 2] + CHARS[((a & 3) << 4) | (b >> 4)]
         + (i + 1 < bytes.length ? CHARS[((b & 15) << 2) | (c >> 6)] : '=')
         + (i + 2 < bytes.length ? CHARS[c & 63] : '=');
  }
  const safe = cacheKey.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40);
  const fileUri = `${FileSystem.cacheDirectory}tts_${safe}.mp3`;
  await FileSystem.writeAsStringAsync(fileUri, b64, {
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
        `${ELEVENLABS_TTS.API_URL}/${ELEVENLABS_TTS.VOICE_ID}`,
        {
          method: 'POST',
          signal: _abortController.signal,
          headers: {
            'xi-api-key': API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
          },
          body: JSON.stringify({
            text,
            model_id: ELEVENLABS_TTS.MODEL_ID,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
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

      const arrayBuffer = await response.arrayBuffer();
      uri = await getAudioUri(arrayBuffer, text);
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
