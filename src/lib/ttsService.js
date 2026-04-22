import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { toPhonicsSound } from './constants';

// ─── Config for General Phonics (Listing/Reference Screen) ───────────────────

const GENERAL_BUCKET = 'phonics audio';
const GENERAL_FOLDER = 'phonics sounds';

const GENERAL_STORAGE_MAP = {
  // Schwa
  schwa:      'Schwa-What',
  // Short vowels
  a:          'a-apple',
  e:          'e-elephant',
  i:          'i-igloo',
  o:          'o-octopus',
  u:          'u-up',
  // Long vowels — /ā/
  ai:         'a-cake',
  ay:         'a-cake',
  'a_e':      'a-cake',
  // Long vowels — /ē/
  ee:         'e-team',
  ea:         'e-team',
  'e_e':      'e-team',
  // Long vowels — /ī/
  ie:         'i-kite',
  igh:        'i-kite',
  'i_e':      'i-kite',
  // Long vowels — /ō/
  oa:         'o-rope',
  'o_e':      'o-rope',
  // Long vowels — /oo/ and /yoo/
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

// ─── Config for Phonics Games (The specific phonemes sounds bucket) ──────────

const ACTIVITY_BUCKET = 'phonemes sounds';
const ACTIVITY_FOLDER = 'phonemes sounds';

// Keys map phoneme → filename (without .mp3). Based on phoneme chart.
// Phonemes with no matching bucket file fall back to TTS automatically.
const ACTIVITY_MAP = {
  // ── Short vowels ──
  'a':       'a',       // /æ/ cat, apple
  'e':       'e',       // /ɛ/ bed, egg
  'i':       'i_alt3',  // /ɪ/ if, gym, women, busy, pretty
  'o':       'o_alt1',  // /ɒ/ on, was, quad
  'u':       'u',       // /ʌ/ up, son, young

  // ── Long vowels / vowel teams ──
  'ai':      'ai',      // /eɪ/ wait
  'ay':      'ai',      // /eɪ/ day
  'a_e':     'ai',      // /eɪ/ cake
  'ee':      'ee',      // /iː/ see
  'ea':      'ee',      // /iː/ team
  'e_e':     'ee',      // /iː/ theme
  'eer':     'eer',     // /ɪər/ beer
  'igh':     'igh',     // /aɪ/ night, my
  'ie':      'igh',     // /aɪ/ tie, pie
  'i_e':     'igh',     // /aɪ/ like, fine
  'oa':      'oa',      // /oʊ/ boat, go, home
  'o_e':     'oa',      // /oʊ/ home, bone
  'oi':      'oi',      // /ɔɪ/ coin
  'oy':      'oi',      // /ɔɪ/ boy
  'ow':      'ow',      // /aʊ/ cow, drought
  'ou':      'ow',      // /aʊ/ out, cloud

  // ── R-controlled vowels ──
  'ar':      'ar',      // /ɑːr/ jar, car
  'or':      'or',      // /ɔːr/ for, more
  'aw':      'or',      // /ɔː/ saw → or file
  'au':      'or',      // /ɔː/ Paul → or file
  'al':      'or',      // /ɔː/ talk, ball → or file
  'ur':      'ur',      // /ɜːr/ hurt
  'er':      'ur',      // /ɜːr/ her → ur file
  'ir':      'ur',      // /ɜːr/ girl → ur file
  'air':     'air',     // /eər/ pair, share

  // ── Consonants ──
  'b':       'b_alt1',  // bat
  'c':       'c',       // /k/ cat, school
  'ck':      'c',       // /k/ duck
  'ch':      'ch',      // /tʃ/ chick
  'd':       'd_alt1',  // dip
  'f':       'f',       // fan, photo
  'g':       'g_alt2',  // /g/ go
  'gz':      'Gz_new',  // /gz/ exam (x in exam)
  'h':       'h',       // hen
  'j':       'j',       // /dʒ/ jet, giant, gem
  'k':       'k',       // kit
  'l':       'l_alt2',  // leg, bell
  'm':       'm',       // map
  'n':       'n',       // net
  'p':       'p',       // pen
  'r':       'ar',      // rat, carrot → ar file
  's':       's',       // sun, cell
  'sh':      'sh',      // /ʃ/ shop
  't':       't',       // tap
  'th':      'th',      // /θ/ thin
  'v':       'v',       // van
  'w':       'w',       // wig
  'x':       'Gz_new',  // x → gz/ks sound, Gz_new best match
  'y':       'y',       // yes
  'z':       'z',       // zip, buzz
  'str':     's',       // /str/ string, street → s file (closest match)
  'nght':    'igh',     // night → igh file (/aɪ/ sound)
  'ght':     'igh',     // /ght/ → igh file (/aɪ/ sound)
  // 'ng', 'kw', 'qu', 'wh', 'ks', 'zh', 'schwa' → no bucket file, fall back to TTS
};

// ─── State ────────────────────────────────────────────────────────────────────

let _sound = null;

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

// ─── Main Speak (OpenAI Ash Voice) ───────────────────────────────────────────

export async function speak(text, isPhonics = false) {
  if (!text?.trim()) return;
  await stop();

  // If it's a key like 'schwa', we might want to speak the IPA sound instead of the name
  const ttsText = isPhonics ? (toPhonicsSound(text.toLowerCase()) || text) : text;

  try {
    const { data, error } = await supabase.functions.invoke('openai-tts', {
      body: { text: ttsText, voice: 'ash' },
    });
    if (!error && data) {
      const fr = new FileReader();
      fr.readAsDataURL(data);
      return new Promise((resolve) => {
        fr.onloadend = async () => {
          const { sound } = await Audio.Sound.createAsync({ uri: fr.result });
          _sound = sound;
          await sound.playAsync();
          sound.setOnPlaybackStatusUpdate((s) => { if (s.didJustFinish) resolve(); });
        };
      });
    }
  } catch (e) {
    console.warn('[ttsService] OpenAI failed:', e.message);
  }

  return new Promise((resolve) => {
    Speech.speak(ttsText, { language: 'en-US', rate: 0.75, onDone: resolve });
  });
}

// ─── General Phonics (For Listing/Reference Screen) ──────────────────────────

export async function speakPhonics(letter) {
  const lower = letter?.toLowerCase();
  // Try mapping first, then try the key itself as a fallback filename
  const fileName = GENERAL_STORAGE_MAP[lower] || lower;

  try {
    await stop();
    const { data } = supabase.storage.from(GENERAL_BUCKET).getPublicUrl(`${GENERAL_FOLDER}/${fileName}.mp3`);

    // We attempt to play. If it fails (e.g. 404), it will catch and use OpenAI.
    const { sound } = await Audio.Sound.createAsync({ uri: data.publicUrl }, { shouldPlay: true });
    _sound = sound;
    return new Promise((resolve) => {
      sound.setOnPlaybackStatusUpdate((s) => {
        if (s.didJustFinish) {
          sound.unloadAsync();
          resolve();
        }
      });
    });
  } catch (err) {
    // Fallback to OpenAI Ash voice for anything not in the bucket
    return speak(letter, true);
  }
}

// ─── SPECIFIC FOR PHONICS GAMES (Phonemes Sounds Bucket) ─────────────────────

export async function speakActivityPhonics(phoneme) {
  const lower = phoneme?.toLowerCase();
  const fileName = ACTIVITY_MAP[lower];

  if (fileName) {
    try {
      await stop();
      const { data } = supabase.storage.from(ACTIVITY_BUCKET).getPublicUrl(`${ACTIVITY_FOLDER}/${fileName}.mp3`);
      if (data?.publicUrl) {
        const { sound } = await Audio.Sound.createAsync({ uri: data.publicUrl }, { shouldPlay: true });
        _sound = sound;
        return new Promise((resolve) => {
          sound.setOnPlaybackStatusUpdate((s) => { if (s.didJustFinish) { sound.unloadAsync(); resolve(); } });
        });
      }
    } catch (err) {
      console.warn(`[ttsService] Activity sound failed:`, err.message);
    }
  }
  return speak(phoneme, true);
}
