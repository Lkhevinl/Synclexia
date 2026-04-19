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
  PHONOLOGICAL_ITEMS:       'phonological_items',
  MAINTENANCE_LOGS:         'maintenance_logs',
  FEEDBACK:                 'feedback',
  ENROLLMENTS:              'enrollments',
  PARENT_MESSAGES:          'parent_messages',
  ASSIGNMENTS:              'assignments',
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
  FETCH_MS:             20000,  // supabase fetch timeout (increased from 15s)
  PROFILE_QUERY_MS:     12000,  // single fetchProfile query cap (increased from 8s)
  PROFILE_TOTAL_MS:     30000,  // total fetchProfile ceiling (increased from 20s)
  PROFILE_SAFETY_NET_MS:45000,  // AppNavigator loading safety-net (increased from 35s)
  RETRY_DELAY_MS:       2000,   // delay between retries (increased from 1.5s)
  SIGN_OUT_AUTO_DELAY_MS:2000,  // auto sign-out delay after password reset
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
  a:   'aah',    // /æ/  cat
  e:   'eh',     // /ɛ/  egg
  i:   'in',     // /ɪ/  igloo  (avoids "i,h" spelling)
  o:   'aw',     // /ɒ/  orange
  u:   'uh',     // /ʌ/  mug

  // ── Consonants ────────────────────────────────────────────────
  b:   'buh',    // /b/  ball
  c:   'kuh',    // /k/  cat
  d:   'duh',    // /d/  dog
  f:   'fuh',    // /f/  fan
  g:   'guh',    // /g/  grapes
  h:   'huh',    // /h/  hat
  j:   'juh',    // /dʒ/ jellyfish
  k:   'kuh',    // /k/  kite
  l:   'luh',    // /l/  leaf
  m:   'muh',    // /m/  monkey
  n:   'nuh',    // /n/  nest
  p:   'puh',    // /p/  pig
  q:   'kwuh',   // /kw/ queen
  r:   'ruh',    // /r/  robot
  s:   'sah',    // /s/  sun
  t:   'tuh',    // /t/  tap
  v:   'vuh',    // /v/  van
  w:   'wuh',    // /w/  web
  x:   'ex',     // /ks/ box
  y:   'yuh',    // /j/  yo-yo
  z:   'zuh',    // /z/  zebra (avoids "z,z,z" spelling)

  // ── Digraphs ──────────────────────────────────────────────────
  sh:  'shh',    // /ʃ/  shark
  ch:  'chuh',   // /tʃ/ cheese
  th:  'thuh',   // /θ/  thongs / /ð/ feather
  ng:  'ing',    // /ŋ/  ring  (avoids "n,g" spelling)
  ph:  'fuh',    // /f/  phone
  zh:  'zhuh',   // /ʒ/  treasure
  wh:  'wuh',    // /w/  why

  // ── Long vowels ───────────────────────────────────────────────
  ai:  'ay',  ay:  'ay',          // /eɪ/ snail
  ee:  'ee',  ea:  'ee',          // /iː/ bee
  ie:  'eye', igh: 'eye',         // /aɪ/ spider
  oa:  'oh',  oe:  'oh',          // /oʊ/ boat
  oo:  'oo',                      // /uː/ moon  /ʊ/ book
  ue:  'yoo', ew:  'yoo',         // /juː/ uniform

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
