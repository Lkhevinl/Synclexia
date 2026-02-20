// seeders/seed_spelling_words.js
// Populates the spelling_words table with starter content.
// Safe to re-run — checks for existing rows before inserting.
//
// Run with:  npm run seed:spelling

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

const WORDS = [
  // Level 1 — CVC (3-letter)
  { word: 'cat',  emoji: '🐱', hint: 'A fluffy pet that meows',          difficulty_level: 1 },
  { word: 'dog',  emoji: '🐶', hint: 'A pet that barks',                 difficulty_level: 1 },
  { word: 'sun',  emoji: '☀️', hint: 'It shines in the sky',             difficulty_level: 1 },
  { word: 'hat',  emoji: '🎩', hint: 'You wear it on your head',         difficulty_level: 1 },
  { word: 'bug',  emoji: '🐛', hint: 'A small crawling creature',        difficulty_level: 1 },
  { word: 'pig',  emoji: '🐷', hint: 'A pink farm animal',               difficulty_level: 1 },
  { word: 'map',  emoji: '🗺️', hint: 'Used to find your way',           difficulty_level: 1 },
  { word: 'cup',  emoji: '🥤', hint: 'You drink from it',                difficulty_level: 1 },
  // Level 2 — 4-letter
  { word: 'frog', emoji: '🐸', hint: 'Jumps and says ribbit',            difficulty_level: 2 },
  { word: 'ship', emoji: '🚢', hint: 'Sails on the ocean',               difficulty_level: 2 },
  { word: 'clap', emoji: '👏', hint: 'You do this with your hands',      difficulty_level: 2 },
  { word: 'flag', emoji: '🚩', hint: 'Waves in the wind',                difficulty_level: 2 },
  { word: 'drum', emoji: '🥁', hint: 'You bang on it to make music',     difficulty_level: 2 },
  { word: 'bell', emoji: '🔔', hint: 'It rings loudly',                  difficulty_level: 2 },
  // Level 3 — 5-letter+
  { word: 'smile', emoji: '😊', hint: 'What a happy face makes',         difficulty_level: 3 },
  { word: 'crane', emoji: '🏗️', hint: 'Lifts heavy things at a site',   difficulty_level: 3 },
  { word: 'grass', emoji: '🌿', hint: 'Green plants on the ground',      difficulty_level: 3 },
  { word: 'light', emoji: '💡', hint: 'A bulb gives you this',           difficulty_level: 3 },
  { word: 'cloud', emoji: '☁️', hint: 'Floats in the sky',              difficulty_level: 3 },
  { word: 'stone', emoji: '🪨', hint: 'A hard piece of rock',            difficulty_level: 3 },
];

async function seedSpellingWords() {
  console.log('🔤 Seeding spelling_words table...');

  const { count } = await supabase
    .from('spelling_words')
    .select('id', { count: 'exact', head: true });

  if (count > 0) {
    console.log(`ℹ️  Table already has ${count} rows — skipping seed.`);
    console.log('   Delete existing rows first if you want to re-seed.');
    return;
  }

  const { data, error } = await supabase.from('spelling_words').insert(WORDS).select('id');

  if (error) {
    console.error('❌  Insert failed:', error.message);
    process.exit(1);
  }

  console.log(`✅  Inserted ${data.length} spelling words successfully.`);
}

seedSpellingWords();
