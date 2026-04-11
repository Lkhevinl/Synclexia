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
  { task_type: 'syllable', difficulty_level: null, data: { word: 'rabbit',     syllables: 2, emoji: '🐰' } },
  { task_type: 'syllable', difficulty_level: null, data: { word: 'apple',      syllables: 2, emoji: '🍎' } },
  { task_type: 'syllable', difficulty_level: null, data: { word: 'pizza',      syllables: 2, emoji: '🍕' } },
  { task_type: 'syllable', difficulty_level: null, data: { word: 'elephant',   syllables: 3, emoji: '🐘' } },
  { task_type: 'syllable', difficulty_level: null, data: { word: 'butterfly',  syllables: 3, emoji: '🦋' } },
  { task_type: 'syllable', difficulty_level: null, data: { word: 'banana',     syllables: 3, emoji: '🍌' } },
  { task_type: 'syllable', difficulty_level: null, data: { word: 'watermelon', syllables: 4, emoji: '🍉' } },
  { task_type: 'syllable', difficulty_level: null, data: { word: 'caterpillar',syllables: 4, emoji: '🐛' } },
  { task_type: 'syllable', difficulty_level: null, data: { word: 'celebration',syllables: 5, emoji: '🎉' } },
];

const PHONEME_ITEMS = [
  { task_type: 'phoneme', difficulty_level: null, data: { word: 'sun',  position: 'first', answer: 's', options: ['s', 'm', 'b'] } },
  { task_type: 'phoneme', difficulty_level: null, data: { word: 'dog',  position: 'first', answer: 'd', options: ['d', 'f', 'g'] } },
  { task_type: 'phoneme', difficulty_level: null, data: { word: 'cat',  position: 'last',  answer: 't', options: ['t', 'n', 'p'] } },
  { task_type: 'phoneme', difficulty_level: null, data: { word: 'map',  position: 'last',  answer: 'p', options: ['p', 't', 's'] } },
  { task_type: 'phoneme', difficulty_level: null, data: { word: 'fish', position: 'first', answer: 'f', options: ['f', 'v', 'b'] } },
  { task_type: 'phoneme', difficulty_level: null, data: { word: 'bell', position: 'last',  answer: 'l', options: ['l', 'm', 'n'] } },
  { task_type: 'phoneme', difficulty_level: null, data: { word: 'rain', position: 'first', answer: 'r', options: ['r', 'w', 'l'] } },
  { task_type: 'phoneme', difficulty_level: null, data: { word: 'boat', position: 'last',  answer: 't', options: ['t', 'd', 'k'] } },
  { task_type: 'phoneme', difficulty_level: null, data: { word: 'phone',position: 'first', answer: 'f', options: ['f', 'p', 'v'] } },
  { task_type: 'phoneme', difficulty_level: null, data: { word: 'knight',position: 'last', answer: 't', options: ['t', 'k', 'n'] } },
];

const ALL_ITEMS = [...SYLLABLE_ITEMS, ...PHONEME_ITEMS];

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
  const phonemeCount  = ALL_ITEMS.filter(i => i.task_type === 'phoneme').length;

  console.log('\n✅  Phonological content seeded!');
  console.log('────────────────────────────────────────────');
  console.log(`    Syllable tasks : ${syllableCount}`);
  console.log(`    Phoneme tasks  : ${phonemeCount}`);
  console.log(`    Total          : ${ALL_ITEMS.length}\n`);
}

seedPhonologicalContent();
