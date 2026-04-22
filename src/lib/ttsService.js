import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { toPhonicsSound, PHONICS_SOUNDS } from './constants';
import * as phonicsSynth from './phonicsSynth';

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
  soft_c:     's-cent-cirus-cycle',
  'soft c':   's-cent-cirus-cycle',
  'soft-c':   's-cent-cirus-cycle',
  ce:         's-cent-cirus-cycle',
  ci:         's-cent-cirus-cycle',
  cy:         's-cent-cirus-cycle',
  soft_g:     'j-gem-giant-gym',
  'soft g':   'j-gem-giant-gym',
  'soft-g':   'j-gem-giant-gym',
  ge:         'j-gem-giant-gym',
  gi:         'j-gem-giant-gym',
  gy:         'j-gem-giant-gym',
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

// ─── OpenAI TTS Config ──────────────────────────────────────────────────────

const OPENAI_INSTRUCTIONS = `
Voice Affect: Calm, composed, and reassuring; project quiet authority and confidence.
Tone: Sincere, empathetic, and gently authoritative—express genuine apology while conveying competence.
Pacing: Steady and moderate; unhurried enough to communicate care, yet efficient enough to demonstrate professionalism.
Emotion: Genuine empathy and understanding; speak with warmth, especially during apologies.
Pronunciation: Clear and precise, emphasizing key reassurances ("smoothly," "quickly," "promptly") to reinforce confidence.
Pauses: Brief pauses after offering assistance or requesting details, highlighting willingness to listen and support.
`;

export async function speak(text, isPhonics = false) {
  if (!text?.trim()) return;
  await stop();

  // 1. Try OpenAI TTS via Supabase Edge Function (Premium Teacher Voice)
  // This is the MOST natural voice (Ash).
  try {
    const { data, error } = await supabase.functions.invoke('openai-tts', {
      body: { text, instructions: OPENAI_INSTRUCTIONS },
    });

    if (!error && data) {
      const fr = new FileReader();
      fr.readAsDataURL(data);
      return new Promise((resolve) => {
        fr.onloadend = async () => {
          const base64data = fr.result;
          const { sound } = await Audio.Sound.createAsync({ uri: base64data });
          _sound = sound;
          await sound.playAsync();
          sound.setOnPlaybackStatusUpdate((s) => { if (s.didJustFinish) resolve(); });
        };
      });
    }
  } catch (e) {
    console.warn('[ttsService] OpenAI TTS failed, falling back:', e.message);
  }

  // 2. Fallback to Device TTS (High-quality Teacher Persona)
  const TEACHER_RATE = 0.72;
  const TEACHER_PITCH = 1.02;

  if (isPhonics) {
    const lower = text.toLowerCase();

    // Check if it's a known single phoneme or digraph
    if (STORAGE_MAP[lower] || PHONICS_SOUNDS[lower]) {
      // Note: We bypass phonicsSynth because it's purely mathematical/robotic.
      const mapped = toPhonicsSound(lower);
      return new Promise((resolve) => {
        Speech.speak(mapped, { language: 'en-US', rate: TEACHER_RATE, pitch: TEACHER_PITCH, onDone: resolve, onError: resolve });
      });
    }

    // Breakdown clusters
    if (lower.length > 1 && !/[aeiou]/.test(lower)) {
      for (const char of lower) {
        // Use device TTS for each character instead of synth
        await new Promise((res) => {
          Speech.speak(toPhonicsSound(char), { language: 'en-US', rate: TEACHER_RATE, pitch: TEACHER_PITCH, onDone: res, onError: res });
        });
      }
      return;
    }
  }

  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis;
      const trySpeak = () => {
        const voice = getBestVoice(synth.getVoices());
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'en-US'; utter.rate = TEACHER_RATE; utter.pitch = TEACHER_PITCH;
        if (voice) utter.voice = voice;
        utter.onend = resolve; utter.onerror = resolve;
        synth.speak(utter);
      };
      synth.getVoices().length > 0 ? trySpeak() : (synth.onvoiceschanged = () => { synth.onvoiceschanged = null; trySpeak(); });
    });
  }

  return new Promise((resolve) => {
    Speech.speak(text, { language: 'en-US', rate: TEACHER_RATE, pitch: TEACHER_PITCH, onDone: resolve, onError: resolve, onStopped: resolve });
  });
}

// ─── Main phonics entry point ─────────────────────────────────────────────────

export async function speakPhonics(letter) {
  if (!letter) return;
  const lower = letter.toLowerCase();
  const fileName = STORAGE_MAP[lower];

  // 1. Try playing from Supabase Storage (MP3s)
  if (fileName) {
    try {
      await stop();
      const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(`${FOLDER}/${fileName}.mp3`);

      if (data?.publicUrl) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: data.publicUrl },
          { shouldPlay: true }
        );
        _sound = sound;
        return new Promise((resolve) => {
          sound.setOnPlaybackStatusUpdate((s) => {
            if (s.didJustFinish) {
              sound.unloadAsync();
              resolve();
            }
          });
        });
      }
    } catch (err) {
      console.warn(`[ttsService] Storage play failed for ${fileName}:`, err.message);
    }
  }

  // 2. Fallback to Teacher TTS if MP3 is missing
  await speak(letter, true);
}
