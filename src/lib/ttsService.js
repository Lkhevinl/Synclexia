import { Audio } from 'expo-av';
import { Alert } from 'react-native';
import { GEMINI_TTS } from './constants';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

let _sound = null;
let _resolveCurrentSpeak = null;

// Build a WAV data URI from raw base64-encoded PCM (24 kHz, 16-bit, mono)
function buildWavUri(pcmBase64) {
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
  view.setUint32(16, 16, true);    // fmt chunk size
  view.setUint16(20, 1, true);     // PCM format
  view.setUint16(22, 1, true);     // mono
  view.setUint32(24, 24000, true); // sample rate
  view.setUint32(28, 48000, true); // byte rate (24000 × 1 × 2)
  view.setUint16(32, 2, true);     // block align (1 × 2)
  view.setUint16(34, 16, true);    // bits per sample
  writeStr(36, 'data');
  view.setUint32(40, pcmBytes.length, true);
  new Uint8Array(buf).set(pcmBytes, 44);

  const bytes = new Uint8Array(buf);
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let b64 = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i], b = bytes[i + 1] ?? 0, c = bytes[i + 2] ?? 0;
    b64 += CHARS[a >> 2] + CHARS[((a & 3) << 4) | (b >> 4)]
         + (i + 1 < bytes.length ? CHARS[((b & 15) << 2) | (c >> 6)] : '=')
         + (i + 2 < bytes.length ? CHARS[c & 63] : '=');
  }
  return `data:audio/wav;base64,${b64}`;
}

/** Stop and unload any currently playing audio. Resolves any in-flight speak() Promise. */
export function stop() {
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

/**
 * Speak text via Gemini TTS.
 * Returns a Promise that resolves when playback finishes (or is stopped/cancelled).
 * Shows an Alert and resolves silently on network failure.
 */
export async function speak(text) {
  stop();
  if (!text?.trim()) return;

  try {
    const response = await fetch(
      `${GEMINI_TTS.API_URL}?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
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
      Alert.alert('No Internet', 'Sound requires internet connection.');
      return;
    }

    const json = await response.json();
    const pcmBase64 = json.candidates[0].content.parts[0].inlineData.data;
    const uri = buildWavUri(pcmBase64);

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
  } catch {
    Alert.alert('No Internet', 'Sound requires internet connection.');
  }
}
