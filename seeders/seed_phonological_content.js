// seeders/seed_phonological_content.js
// Populates the phonological_content table with starter content.
// Safe to re-run — checks for existing rows before inserting.
//
// Run with:  node seeders/seed_phonological_content.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL     = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('\n❌  Missing env vars: EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Content ─────────────────────────────────────────────────────────────────

const SYLLABLE_ITEMS = [
  // difficulty_level: NULL means shown at all levels
  { task_type: 'syllable', difficulty_level: null, data: { word: 'cat',        syllables: 1, emoji: '🐱' } },
  { task_type: 'syllable', difficulty_level: null, data: { word: 'dog',        syllables: 1, emoji: '🐶' } },
  { task_type: 'syllable', difficulty_level: null, data: { word: 'sun',        syllables: 1, emoji: '☀️' } },
  { task_type: 'syllable', difficulty_level: null, data: { word: 'hat',        syllables: 1, emoji: '🎩' } },
  { task_type: 'syllable', difficulty_level: null, data: { word: 'cup',        syllables: 1, emoji: '🥤' } },
  { task_type: 'syllable', difficulty_level: 1,   data: { word: 'rabbit',     syllables: 2, emoji: '🐰' } },
  { task_type: 'syllable', difficulty_level: 1,   data: { word: 'apple',      syllables: 2, emoji: '🍎' } },
  { task_type: 'syllable', difficulty_level: 1,   data: { word: 'pizza',      syllables: 2, emoji: '🍕' } },
  { task_type: 'syllable', difficulty_level: 2,   data: { word: 'elephant',   syllables: 3, emoji: '🐘' } },
  { task_type: 'syllable', difficulty_level: 2,   data: { word: 'butterfly',  syllables: 3, emoji: '🦋' } },
  { task_type: 'syllable', difficulty_level: 2,   data: { word: 'banana',     syllables: 3, emoji: '🍌' } },
  { task_type: 'syllable', difficulty_level: 3,   data: { word: 'watermelon', syllables: 4, emoji: '🍉' } },
  { task_type: 'syllable', difficulty_level: 3,   data: { word: 'caterpillar',syllables: 4, emoji: '🐛' } },
  { task_type: 'syllable', difficulty_level: 3,   data: { word: 'celebration',syllables: 5, emoji: '🎉' } },
];

const RIME_ITEMS = [
  { task_type: 'rime', difficulty_level: null, data: { target: 'cat',   correct: 'hat',   distractors: ['dog', 'sun'] } },
  { task_type: 'rime', difficulty_level: null, data: { target: 'run',   correct: 'fun',   distractors: ['cat', 'pig'] } },
  { task_type: 'rime', difficulty_level: null, data: { target: 'bed',   correct: 'red',   distractors: ['map', 'top'] } },
  { task_type: 'rime', difficulty_level: 1,   data: { target: 'big',   correct: 'wig',   distractors: ['cup', 'hen'] } },
  { task_type: 'rime', difficulty_level: 1,   data: { target: 'hop',   correct: 'mop',   distractors: ['bag', 'sit'] } },
  { task_type: 'rime', difficulty_level: 2,   data: { target: 'take',  correct: 'cake',  distractors: ['book', 'ship'] } },
  { task_type: 'rime', difficulty_level: 2,   data: { target: 'night', correct: 'light', distractors: ['tree', 'jump'] } },
  { task_type: 'rime', difficulty_level: 2,   data: { target: 'play',  correct: 'stay',  distractors: ['fish', 'bird'] } },
  { task_type: 'rime', difficulty_level: 3,   data: { target: 'cheese',correct: 'breeze',distractors: ['clock', 'stone'] } },
  { task_type: 'rime', difficulty_level: 3,   data: { target: 'bright',correct: 'flight',distractors: ['brand', 'crash'] } },
];

const PHONEME_ITEMS = [
  { task_type: 'phoneme', difficulty_level: null, data: { word: 'sun',  position: 'first', answer: 's', options: ['s', 'm', 'b'] } },
  { task_type: 'phoneme', difficulty_level: null, data: { word: 'dog',  position: 'first', answer: 'd', options: ['d', 'f', 'g'] } },
  { task_type: 'phoneme', difficulty_level: null, data: { word: 'cat',  position: 'last',  answer: 't', options: ['t', 'n', 'p'] } },
  { task_type: 'phoneme', difficulty_level: 1,   data: { word: 'map',  position: 'last',  answer: 'p', options: ['p', 't', 's'] } },
  { task_type: 'phoneme', difficulty_level: 1,   data: { word: 'fish', position: 'first', answer: 'f', options: ['f', 'v', 'b'] } },
  { task_type: 'phoneme', difficulty_level: 1,   data: { word: 'bell', position: 'last',  answer: 'l', options: ['l', 'm', 'n'] } },
  { task_type: 'phoneme', difficulty_level: 2,   data: { word: 'rain', position: 'first', answer: 'r', options: ['r', 'w', 'l'] } },
  { task_type: 'phoneme', difficulty_level: 2,   data: { word: 'boat', position: 'last',  answer: 't', options: ['t', 'd', 'k'] } },
  { task_type: 'phoneme', difficulty_level: 3,   data: { word: 'phone',position: 'first', answer: 'f', options: ['f', 'p', 'v'] } },
  { task_type: 'phoneme', difficulty_level: 3,   data: { word: 'knight',position: 'last', answer: 't', options: ['t', 'k', 'n'] } },
];

const ALL_ITEMS = [...SYLLABLE_ITEMS, ...RIME_ITEMS, ...PHONEME_ITEMS];

// ─── Seeder ───────────────────────────────────────────────────────────────────

async function seedPhonologicalContent() {
  console.log('\n🌱  Synclexia — Phonological Content Seeder');
  console.log('────────────────────────────────────────────');

  // Check if already seeded
  const { count } = await supabase
    .from('phonological_content')
    .select('*', { count: 'exact', head: true });

  if (count > 0) {
    console.log(`⚠️   Table already has ${count} rows. Skipping seed.`);
    console.log('    Delete all rows first if you want to re-seed.\n');
    process.exit(0);
  }

  console.log(`📝  Inserting ${ALL_ITEMS.length} content items...`);

  const { error } = await supabase
    .from('phonological_content')
    .insert(ALL_ITEMS);

  if (error) {
    console.error('❌  Insert failed:', error.message);
    process.exit(1);
  }

  const syllableCount = ALL_ITEMS.filter(i => i.task_type === 'syllable').length;
  const rimeCount     = ALL_ITEMS.filter(i => i.task_type === 'rime').length;
  const phonemeCount  = ALL_ITEMS.filter(i => i.task_type === 'phoneme').length;

  console.log('\n✅  Phonological content seeded!');
  console.log('────────────────────────────────────────────');
  console.log(`    Syllable tasks : ${syllableCount}`);
  console.log(`    Rime tasks     : ${rimeCount}`);
  console.log(`    Phoneme tasks  : ${phonemeCount}`);
  console.log(`    Total          : ${ALL_ITEMS.length}\n`);
}

seedPhonologicalContent();
