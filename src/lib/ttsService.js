import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { toPhonicsSound } from './constants';

// ─── Config ───────────────────────────────────────────────────────────────────

const BUCKET = 'phonics audio';
const FOLDER = 'phonics sounds';

const STORAGE_MAP = {
  // Schwa
  schwa:      'Schwa-What',
  // Short vowels
  a:          'a-apple',
  e:          'e-elephant',
  i:          'i-igloo',
  o:          'o-octopus',
  u:          'u-up',
  // Long vowels  — /ā/
  ai:         'a-cake',
  ay:         'a-cake',
  'a_e':      'a-cake',
  // Long vowels  — /ē/
  ee:         'e-team',
  ea:         'e-team',
  'e_e':      'e-team',
  // Long vowels  — /ī/
  ie:         'i-kite',
  igh:        'i-kite',
  'i_e':      'i-kite',
  // Long vowels  — /ō/
  oa:         'o-rope',
  'o_e':      'o-rope',
  // Long vowels  — /oo/ and /yoo/
  ue:         'u-lute-glue',
  ew:         'u-lute-glue',
  'u_e':      'u-lute-glue',
  u_oo:       'u-lute-glue',
  u_yoo:      'u-use-cue',
  // Consonants
  b:          'b-bat',
  c:          'c-cut',
  ck:         'c-cut',
  d:          'd-dip',
  f:          'f-fun',
  g:          'g-get',
  h:          'h-hat',
  j:          'j-jog',
  k:          'k-kit',
  l:          'l-lip',
  m:          'm-mug',
  n:          'n-nap',
  p:          'p-pick',
  qu:         'qu-quest',
  r:          'r-rid',
  s:          's-sit-mess',
  t:          't-tuck',
  v:          'v-van',
  w:          'w-will',
  x:          'x-mix-rocks',
  y:          'y-yes',
  z:          'z-zip-buzz',
  // Soft consonants
  soft_c:     's-cent-circus-cycle',
  soft_g:     'j-gem-giant-gym',
  // Digraphs
  ch:         'ch-chick',
  sh:         'sh-ship',
  th:         'th-thin',
  th_voiced:  'th-the',
  ng:         'ng-ring',
  wh:         'hw-whip',
  // Silent consonants
  kn:         'n-knife',
  gn:         'n-gnome',
  wr:         'wr-wrist',
  // Voiced /z/ via 's'
  z_s:        's-his',
  // R-controlled vowels
  ar:         'ar-jar',
  er:         'er-herd-bird-turn',
  ir:         'er-herd-bird-turn',
  ur:         'er-herd-bird-turn',
  or:         'or-fork',
  air:        'air-pair-share',
  ear:        'ear-hear',
  ure:        'ure-lure',
  // Other vowel teams
  oi:         'oi-soil-toy',
  oy:         'oi-soil-toy',
  ou:         'ou-how-out',
  ow:         'ou-how-out',
  aw:         'aw-haul-hawk-ball',
  au:         'aw-haul-hawk-ball',
  al:         'aw-haul-hawk-ball',
  oo:         'oo-boot-new',
  oo_short:   'oo-book-bush',
};

// ─── State ────────────────────────────────────────────────────────────────────

let _sound = null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function stopSound() {
  if (_sound) {
    try { await _sound.stopAsync(); } catch {}
    try { await _sound.unloadAsync(); } catch {}
    _sound = null;
  }
}

export async function stop() {
  await stopSound();
  if (Platform.OS === 'web') {
    window.speechSynthesis?.cancel();
  } else {
    Speech.stop();
  }
}

// ─── Device TTS ───────────────────────────────────────────────────────────────

function getBestVoice(voices) {
  const en = voices.filter(v => v.lang.startsWith('en'));
  const pick = (...keywords) =>
    en.find(v => keywords.every(k => v.name.toLowerCase().includes(k.toLowerCase())));
  return (
    pick('aria', 'natural') || pick('jenny', 'natural') ||
    pick('guy', 'natural') || pick('natasha', 'natural') ||
    pick('google', 'uk', 'female') || pick('google', 'us', 'female') ||
    pick('google', 'us') || pick('google') ||
    en.find(v => v.name.toLowerCase().includes('online')) ||
    en.find(v => v.lang === 'en-US') || en[0] || null
  );
}

export async function speak(text) {
  if (!text?.trim()) return;
  await stop();
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis;
      const trySpeak = () => {
        const voice = getBestVoice(synth.getVoices());
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'en-US'; utter.rate = 0.80; utter.pitch = 1.05;
        if (voice) utter.voice = voice;
        utter.onend = resolve; utter.onerror = resolve;
        synth.speak(utter);
      };
      synth.getVoices().length > 0 ? trySpeak()
        : (synth.onvoiceschanged = () => { synth.onvoiceschanged = null; trySpeak(); });
    });
  }
  return new Promise((resolve) => {
    Speech.speak(text, { language: 'en-US', rate: 0.80, pitch: 1.05,
      onDone: resolve, onError: resolve, onStopped: resolve });
  });
}

// ─── Main phonics entry point ─────────────────────────────────────────────────

export async function speakPhonics(letter) {
  if (!letter) return;
  const key = letter.toLowerCase();
  const filename = STORAGE_MAP[key];

  await stopSound();
  Speech.stop();

  if (!filename) {
    await speak(toPhonicsSound(key));
    return;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(`${FOLDER}/${filename}.mp3`);
  const url = data?.publicUrl?.replace(/ /g, '%20');

  console.log('[ttsService] url:', url);

  if (!url) {
    await speak(toPhonicsSound(key));
    return;
  }

  try {
    if (Platform.OS === 'web') {
      await new Promise((resolve, reject) => {
        const audio = new window.Audio(url);
        audio.onended = resolve;
        audio.onerror = (e) => reject(new Error('web audio error'));
        audio.play().catch(reject);
      });
    } else {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, shouldDuckAndroid: true });
      const { sound, status } = await Audio.Sound.createAsync({ uri: url });
      console.log('[ttsService] loaded:', status.isLoaded);
      if (!status.isLoaded) throw new Error('load failed');
      _sound = sound;
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((s) => {
        if (s.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          if (_sound === sound) _sound = null;
        }
      });
    }
  } catch (e) {
    console.warn('[ttsService] failed:', e?.message);
    await speak(toPhonicsSound(key));
  }
}
