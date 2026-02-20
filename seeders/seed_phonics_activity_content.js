// seeders/seed_phonics_activity_content.js
// Populates the phonics_activity_content table with starter content.
// Safe to re-run — checks for existing rows before inserting.
//
// Run with:  npm run seed:phonics-activity

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

const BLEND_ITEMS = [
  { game_type: 'blend', difficulty_level: 1, data: { phonemes: ['c','a','t'],    word: 'cat',  emoji: '🐱' } },
  { game_type: 'blend', difficulty_level: 1, data: { phonemes: ['d','o','g'],    word: 'dog',  emoji: '🐶' } },
  { game_type: 'blend', difficulty_level: 1, data: { phonemes: ['s','u','n'],    word: 'sun',  emoji: '☀️' } },
  { game_type: 'blend', difficulty_level: 1, data: { phonemes: ['h','a','t'],    word: 'hat',  emoji: '🎩' } },
  { game_type: 'blend', difficulty_level: 2, data: { phonemes: ['b','u','s'],    word: 'bus',  emoji: '🚌' } },
  { game_type: 'blend', difficulty_level: 2, data: { phonemes: ['f','i','sh'],   word: 'fish', emoji: '🐟' } },
  { game_type: 'blend', difficulty_level: 3, data: { phonemes: ['fr','o','g'],   word: 'frog', emoji: '🐸' } },
  { game_type: 'blend', difficulty_level: 3, data: { phonemes: ['cl','a','p'],   word: 'clap', emoji: '👏' } },
];

const RHYME_ITEMS = [
  { game_type: 'rhyme', difficulty_level: 1, data: { target: 'cat',   options: ['bat','dog','sun'],   correct: 'bat',   emoji: '🐱' } },
  { game_type: 'rhyme', difficulty_level: 1, data: { target: 'hop',   options: ['mop','cat','pen'],   correct: 'mop',   emoji: '🐰' } },
  { game_type: 'rhyme', difficulty_level: 1, data: { target: 'big',   options: ['map','pig','sun'],   correct: 'pig',   emoji: '🐷' } },
  { game_type: 'rhyme', difficulty_level: 2, data: { target: 'ring',  options: ['sing','cat','hop'],  correct: 'sing',  emoji: '💍' } },
  { game_type: 'rhyme', difficulty_level: 2, data: { target: 'bee',   options: ['cat','tree','hop'],  correct: 'tree',  emoji: '🐝' } },
  { game_type: 'rhyme', difficulty_level: 2, data: { target: 'run',   options: ['sit','sun','cat'],   correct: 'sun',   emoji: '🏃' } },
  { game_type: 'rhyme', difficulty_level: 3, data: { target: 'ship',  options: ['cat','drip','tip'],  correct: 'tip',   emoji: '🚢' } },
  { game_type: 'rhyme', difficulty_level: 3, data: { target: 'night', options: ['light','day','cat'], correct: 'light', emoji: '🌙' } },
];

const SEGMENT_ITEMS = [
  { game_type: 'segment', difficulty_level: 1, data: { word: 'cat',  phonemes: ['c','a','t'],   count: 3, emoji: '🐱' } },
  { game_type: 'segment', difficulty_level: 1, data: { word: 'it',   phonemes: ['i','t'],        count: 2, emoji: '👆' } },
  { game_type: 'segment', difficulty_level: 2, data: { word: 'frog', phonemes: ['fr','o','g'],   count: 3, emoji: '🐸' } },
  { game_type: 'segment', difficulty_level: 2, data: { word: 'ship', phonemes: ['sh','i','p'],   count: 3, emoji: '🚢' } },
  { game_type: 'segment', difficulty_level: 2, data: { word: 'play', phonemes: ['pl','ay'],       count: 2, emoji: '🎮' } },
  { game_type: 'segment', difficulty_level: 3, data: { word: 'stop', phonemes: ['st','o','p'],   count: 3, emoji: '🛑' } },
  { game_type: 'segment', difficulty_level: 3, data: { word: 'tree', phonemes: ['tr','ee'],       count: 2, emoji: '🌳' } },
  { game_type: 'segment', difficulty_level: 3, data: { word: 'best', phonemes: ['b','e','st'],   count: 3, emoji: '⭐' } },
];

const ALL_ITEMS = [...BLEND_ITEMS, ...RHYME_ITEMS, ...SEGMENT_ITEMS];

async function seedPhonicsActivityContent() {
  console.log('🔗 Seeding phonics_activity_content table...');

  const { count } = await supabase
    .from('phonics_activity_content')
    .select('id', { count: 'exact', head: true });

  if (count > 0) {
    console.log(`ℹ️  Table already has ${count} rows — skipping seed.`);
    return;
  }

  const { data, error } = await supabase
    .from('phonics_activity_content')
    .insert(ALL_ITEMS)
    .select('id');

  if (error) {
    console.error('❌  Insert failed:', error.message);
    process.exit(1);
  }

  console.log(`✅  Inserted ${data.length} phonics activity entries (${BLEND_ITEMS.length} blend, ${RHYME_ITEMS.length} rhyme, ${SEGMENT_ITEMS.length} segment).`);
}

seedPhonicsActivityContent();
