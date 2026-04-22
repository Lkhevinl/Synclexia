// src/lib/constants.js
// Central repository for all previously-hardcoded values.
// Import from here instead of scattering literals throughout the codebase.

// ── Supabase Table Names ──────────────────────────────────────────────────────
export const TABLES = {
  PROFILES:                 'profiles',
  SESSION_LOGS:             'session_logs',
  ADAPTIVE_STATE:           'adaptive_state',
  PHONOLOGICAL_CONTENT:     'phonological_content',
  PHONICS_ACTIVITY_CONTENT: 'phonics_activity_content',
  SPELLING_WORDS:           'spelling_words',
  NOTIFICATIONS:            'notifications',
  USER_NOTIFICATIONS:       'user_notifications',
  PARENT_LINKS:             'parent_links',
  STORIES:                  'stories',
  PHONICS_ITEMS:            'phonics_items',
  PHONOLOGICAL_ITEMS:       'phonological_content',
  MAINTENANCE_LOGS:         'maintenance_logs',
  FEEDBACK:                 'feedback',
  WRITING_PRACTICE:         'writing_practice',
  PHONEME_REFERENCE:        'phoneme_reference',
};

// ── User Roles ────────────────────────────────────────────────────────────────
export const ROLES = {
  STUDENT: 'student',
  PARENT:  'parent',
  TEACHER: 'teacher',
  ADMIN:   'admin',
};

// ── AsyncStorage Keys ─────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: '@synclexia_onboarding_complete',
  THEME:               '@synclexia_theme',
};

// ── Network / Timeout Constants ───────────────────────────────────────────────
export const TIMEOUTS = {
  FETCH_MS:             15000,  // Faster response
  PROFILE_QUERY_MS:     10000,
  PROFILE_TOTAL_MS:     30000,
  PROFILE_SAFETY_NET_MS:35000,
  RETRY_DELAY_MS:       2000,
  SIGN_OUT_AUTO_DELAY_MS:2000,
};

// ── Adaptive Engine ───────────────────────────────────────────────────────────
export const ADAPTIVE = {
  MIN_LEVEL:        1,
  MAX_LEVEL:        3,
  PROMOTE_STREAK:   3,   // consecutive correct sessions to level up
  PROMOTE_ACCURACY: 80,  // % accuracy required to level up
  DEMOTE_ACCURACY:  40,  // % accuracy threshold to level down
};

// ── Strengths Analysis ────────────────────────────────────────────────────────
export const ANALYSIS = {
  STRENGTH_THRESHOLD:     75,  // % accuracy = strength
  WEAKNESS_THRESHOLD:     55,  // % accuracy below = weakness
  TREND_DELTA:            8,   // % point delta for improving/declining trend
  LEARNING_PATH_MAX_ITEMS:4,
  RECENT_SESSIONS_SLICE:  5,   // sessions used for "recent accuracy"
};

// ── Speech / TTS ──────────────────────────────────────────────────────────────
export const SPEECH = {
  DEFAULT_RATE:       0.85,
  SONG_RATE:          0.75,
  DEFAULT_PITCH:      1.1,
  SONG_PITCH:         1.15,
  ELEVENLABS_VOICE_ID: process.env.EXPO_PUBLIC_ELEVENLABS_VOICE_ID || 'Xb7hH8MSUJpSbSDYk0k2',
  ELEVENLABS_MODEL:    process.env.EXPO_PUBLIC_ELEVENLABS_MODEL    || 'eleven_multilingual_v2',
  ELEVENLABS_STABILITY:         0.35,
  ELEVENLABS_SIMILARITY_BOOST:  0.60,
  ELEVENLABS_STYLE:             0.55,
  ELEVENLABS_SPEAKER_BOOST:     false,
  ELEVENLABS_PLAYBACK_RATE:     0.92,
};

// ── Phonics Sound Map ─────────────────────────────────────────────────────────
// Maps each letter/digraph to text the TTS pronounces as its phonics sound.
export const PHONICS_SOUNDS = {
  // ── Short vowels ──────────────────────────────────────────────
  a:   'ah',      // /æ/ as in apple (not "ay")
  e:   'eh',      // /ɛ/ as in egg
  i:   'ih',      // /ɪ/ as in igloo (not "eye")
  o:   'aw',      // /ɒ/ as in orange
  u:   'uh',      // /ʌ/ as in mug

  // ── Consonants ────────────────────────────────────────────────
  // Adding spaces and extra letters helps the TTS sustain the sound
  b:   'buh',
  c:   'k ',
  d:   'duh',
  f:   'fffff',
  g:   'guh',
  h:   ' h ',
  j:   'juh',
  k:   ' k ',
  l:   'lllll',
  m:   'mmmmm',
  n:   'nnnnn',
  p:   'puh',
  q:   'kw',
  r:   'rrrrr',
  s:   'sssss',
  t:   ' t ',
  v:   'vvvvv',
  w:   'wuh',
  x:   'ks',
  y:   'yuh',
  z:   'zzzzz',

  // ── Digraphs ──────────────────────────────────────────────────
  sh:  'shhhh',
  ch:  'ch ',
  th:  'th ',
  ng:  'ng ',
  ph:  'f ',
  zh:  'zh ',
  wh:  'wuh',

  // ── Long vowels (Letter Names) ────────────────────────────────
  ai:  'ay',  ay:  'ay',
  ee:  'ee',  ea:  'ee',  eam: 'ee',
  ie:  'eye', igh: 'eye',
  oa:  'oh',  oe:  'oh',
  oo:  'oo',
  ue:  'yoo', ew:  'yoo',

  // ── Diphthongs ────────────────────────────────────────────────
  oi:  'oy',  oy:  'oy',          // /ɔɪ/ coin
  ou:  'ow',  ow:  'ow',          // /aʊ/ cow

  // ── R-controlled vowels ───────────────────────────────────────
  ar:  'ar',                      // /ɑː/ car
  er:  'er',  ir:  'er', ur: 'er',// /ɜː/ bird
  or:  'or',                      // /ɔː/ fork
  air: 'air',                     // /eə/ chair
  ear: 'ear',                     // /ɪə/ ear
  ure: 'yoor',                    // /ʊə/ cure

  // ── Magic-e (split digraph / long vowels) ─────────────────────
  'a_e': 'ay',   // cake
  'e_e': 'ee',   // these
  'i_e': 'eye',  // kite
  'o_e': 'oh',   // rope
  'u_e': 'yoo',  // cube

  // ── More vowel teams ──────────────────────────────────────────
  aw:  'aw',     // claw
  au:  'aw',     // sauce
  al:  'awl',    // ball

  // ── Silent-letter clusters ─────────────────────────────────────
  kn:  'n',      // knee
  gn:  'n',      // gnome
  wr:  'r',      // write

  // ── Other ─────────────────────────────────────────────────────
  qu:       'kwuh',
  oo_short: 'oo',   // short /ŏo/ — book, bush
  schwa:    'uh',   // /ə/ as in about, sofa
};

// Converts a raw phoneme string to TTS-friendly text using the map above.
// Consonant clusters with no vowel get "uh" appended so TTS blends them.
export function toPhonicsSound(ph) {
  if (!ph) return ph;
  const lower = ph.toLowerCase();
  if (PHONICS_SOUNDS[lower]) return PHONICS_SOUNDS[lower];
  if (!/[aeiou]/.test(lower) && lower.length > 1) return lower + 'uh';
  return ph;
}

// ── ElevenLabs Text-to-Speech ─────────────────────────────────────────────────
export const ELEVENLABS_TTS = {
  API_URL: 'https://api.elevenlabs.io/v1/text-to-speech',
  VOICE_ID: '21m00Tcm4TlvDq8ikWAM', // Rachel — clear, calm female voice
  MODEL_ID: 'eleven_turbo_v2_5',
};

// ── Auth / Password ───────────────────────────────────────────────────────────
export const AUTH = {
  PASSWORD_RESET_REDIRECT_URL: process.env.EXPO_PUBLIC_PASSWORD_RESET_URL || 'https://synclexia-password-reset.netlify.app',
  RESEND_COOLDOWN_SECONDS:     60,
  PASSWORD_MIN_LENGTH:         6,
  PASSWORD_WEAK_LENGTH:        8,
  PASSWORD_GOOD_LENGTH:        12,
};

// ── Password Strength Helper ──────────────────────────────────────────────────
/**
 * Returns a strength descriptor object for a given password string,
 * or null if the password is empty.
 */
export function getPasswordStrength(password) {
  if (!password || password.length === 0) return null;
  if (password.length < AUTH.PASSWORD_MIN_LENGTH)  return { label: 'Too short', color: '#F44336', width: '20%' };
  if (password.length < AUTH.PASSWORD_WEAK_LENGTH) return { label: 'Weak',      color: '#FF9800', width: '40%' };
  if (password.length < AUTH.PASSWORD_GOOD_LENGTH) return { label: 'Good',      color: '#FFC107', width: '65%' };
  return                                                  { label: 'Strong',    color: '#4CAF50', width: '100%' };
}
