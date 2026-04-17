import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';
import { GEMINI_TTS } from './constants';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

let _sound = null;
let _resolveCurrentSpeak = null;
let _abortController = null;

// Build raw WAV bytes (ArrayBuffer) from base64-encoded PCM (24 kHz, 16-bit, mono)
function buildWavBuffer(pcmBase64) {
  const pcmBytes = Uint8Array.from(atob(pcmBase64), (c) => c.charCodeAt(0));
  const buf = new ArrayBuffer(44 + pcmBytes.length);
  const view = new DataView(buf);
  const writeStr = (off, s) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + pcmBytes.length, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 24000, true);
  view.setUint32(28, 48000, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, pcmBytes.length, true);
  new Uint8Array(buf).set(pcmBytes, 44);
  return buf;
}

// Returns a URI that expo-av can load, handling web vs native
async function getAudioUri(pcmBase64) {
  const wavBuf = buildWavBuffer(pcmBase64);

  if (Platform.OS === 'web') {
    // On web, create a Blob URL — expo-av uses HTML5 Audio which supports this
    const blob = new Blob([wavBuf], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  // On native, write to the filesystem cache
  const bytes = new Uint8Array(wavBuf);
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let b64 = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i], b = bytes[i + 1] ?? 0, c = bytes[i + 2] ?? 0;
    b64 += CHARS[a >> 2] + CHARS[((a & 3) << 4) | (b >> 4)]
         + (i + 1 < bytes.length ? CHARS[((b & 15) << 2) | (c >> 6)] : '=')
         + (i + 2 < bytes.length ? CHARS[c & 63] : '=');
  }
  const fileUri = FileSystem.cacheDirectory + 'tts_audio.wav';
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
    _abortController = new AbortController();
    const response = await fetch(
      `${GEMINI_TTS.API_URL}?key=${API_KEY}`,
      {
        method: 'POST',
        signal: _abortController.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: GEMINI_TTS.VOICE_NAME },
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      console.error('[TTS] API error', response.status, errBody);
      Alert.alert('TTS Error', `Status ${response.status} — check console for details.`);
      return;
    }

    const json = await response.json();
    const pcmBase64 = json.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!pcmBase64) {
      console.error('[TTS] Unexpected response shape', JSON.stringify(json));
      return;
    }

    const uri = await getAudioUri(pcmBase64);

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
    console.error('[TTS] fetch/playback error', e);
    Alert.alert('No Internet', 'Sound requires internet connection.');
  }
}
