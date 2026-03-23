-- ============================================================
-- QUICK SEED: Phonological Content (for PhonologicalAwarenessScreen)
-- Run this in Supabase SQL Editor after COMPLETE_SETUP.sql
-- ============================================================

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active) VALUES
-- SYLLABLE Level 1 (1 syllable words)
('syllable', 1, '{"word": "cat", "syllables": 1, "emoji": "🐱"}', true),
('syllable', 1, '{"word": "dog", "syllables": 1, "emoji": "🐕"}', true),
('syllable', 1, '{"word": "sun", "syllables": 1, "emoji": "☀️"}', true),
('syllable', 1, '{"word": "run", "syllables": 1, "emoji": "🏃"}', true),
('syllable', 1, '{"word": "bat", "syllables": 1, "emoji": "🦇"}', true),
('syllable', 1, '{"word": "pen", "syllables": 1, "emoji": "✏️"}', true),

-- SYLLABLE Level 2 (2 syllable words)
('syllable', 2, '{"word": "apple", "syllables": 2, "emoji": "🍎"}', true),
('syllable', 2, '{"word": "water", "syllables": 2, "emoji": "💧"}', true),
('syllable', 2, '{"word": "rabbit", "syllables": 2, "emoji": "🐰"}', true),
('syllable', 2, '{"word": "garden", "syllables": 2, "emoji": "🌿"}', true),
('syllable', 2, '{"word": "window", "syllables": 2, "emoji": "🪟"}', true),
('syllable', 2, '{"word": "butter", "syllables": 2, "emoji": "🧈"}', true),

-- SYLLABLE Level 3 (3 syllable words)
('syllable', 3, '{"word": "elephant", "syllables": 3, "emoji": "🐘"}', true),
('syllable', 3, '{"word": "butterfly", "syllables": 3, "emoji": "🦋"}', true),
('syllable', 3, '{"word": "dinosaur", "syllables": 3, "emoji": "🦕"}', true),
('syllable', 3, '{"word": "hospital", "syllables": 3, "emoji": "🏥"}', true),
('syllable', 3, '{"word": "yesterday", "syllables": 3, "emoji": "📅"}', true),

-- RIME Level 1
('rime', 1, '{"target": "cat", "correct": "bat", "distractors": ["dog","sun"], "emoji": "🐱"}', true),
('rime', 1, '{"target": "log", "correct": "dog", "distractors": ["pen","book"], "emoji": "📦"}', true),
('rime', 1, '{"target": "hat", "correct": "mat", "distractors": ["run","tree"], "emoji": "🎩"}', true),
('rime', 1, '{"target": "red", "correct": "bed", "distractors": ["pen","sun"], "emoji": "❤️"}', true),
('rime', 1, '{"target": "pin", "correct": "bin", "distractors": ["cup","hat"], "emoji": "📌"}', true),
('rime', 1, '{"target": "box", "correct": "fox", "distractors": ["dog","pen"], "emoji": "📦"}', true),

-- RIME Level 2
('rime', 2, '{"target": "night", "correct": "light", "distractors": ["book","rain"], "emoji": "🌙"}', true),
('rime', 2, '{"target": "ring", "correct": "sing", "distractors": ["jump","fish"], "emoji": "💍"}', true),
('rime', 2, '{"target": "fly", "correct": "sky", "distractors": ["run","bear"], "emoji": "🦋"}', true),
('rime', 2, '{"target": "boat", "correct": "coat", "distractors": ["rain","tree"], "emoji": "⛵"}', true),
('rime', 2, '{"target": "way", "correct": "day", "distractors": ["jump","play"], "emoji": "🛣️"}', true),
('rime', 2, '{"target": "book", "correct": "look", "distractors": ["run","fish"], "emoji": "📚"}', true),

-- RIME Level 3
('rime', 3, '{"target": "share", "correct": "care", "distractors": ["jump","tree"], "emoji": "🎈"}', true),
('rime', 3, '{"target": "please", "correct": "freeze", "distractors": ["jump","bear"], "emoji": "🥶"}', true),
('rime', 3, '{"target": "string", "correct": "spring", "distractors": ["jump","fish"], "emoji": "🎯"}', true),
('rime', 3, '{"target": "dance", "correct": "chance", "distractors": ["run","tree"], "emoji": "💃"}', true),
('rime', 3, '{"target": "throne", "correct": "stone", "distractors": ["run","fish"], "emoji": "👑"}', true),

-- PHONEME Level 1
('phoneme', 1, '{"word": "sun", "position": "first", "answer": "s", "options": ["s","m","b"], "emoji": "☀️"}', true),
('phoneme', 1, '{"word": "mat", "position": "first", "answer": "m", "options": ["m","b","t"], "emoji": "🪵"}', true),
('phoneme', 1, '{"word": "bag", "position": "first", "answer": "b", "options": ["b","d","p"], "emoji": "👜"}', true),
('phoneme', 1, '{"word": "cat", "position": "last", "answer": "t", "options": ["t","d","p"], "emoji": "🐱"}', true),
('phoneme', 1, '{"word": "dog", "position": "last", "answer": "g", "options": ["g","k","d"], "emoji": "🐕"}', true),
('phoneme', 1, '{"word": "pen", "position": "last", "answer": "n", "options": ["n","m","d"], "emoji": "✏️"}', true),

-- PHONEME Level 2
('phoneme', 2, '{"word": "fish", "position": "middle", "answer": "i", "options": ["i","a","o"], "emoji": "🐠"}', true),
('phoneme', 2, '{"word": "tree", "position": "first", "answer": "tr", "options": ["tr","dr","br"], "emoji": "🌳"}', true),
('phoneme', 2, '{"word": "plant", "position": "first", "answer": "pl", "options": ["pl","bl","fl"], "emoji": "🌿"}', true),
('phoneme', 2, '{"word": "cloud", "position": "first", "answer": "cl", "options": ["cl","bl","gl"], "emoji": "☁️"}', true),
('phoneme', 2, '{"word": "bring", "position": "first", "answer": "br", "options": ["br","tr","gr"], "emoji": "🎁"}', true),
('phoneme', 2, '{"word": "black", "position": "first", "answer": "bl", "options": ["bl","cl","fl"], "emoji": "⬛"}', true),

-- PHONEME Level 3
('phoneme', 3, '{"word": "strength", "position": "first", "answer": "str", "options": ["str","spr","scr"], "emoji": "💪"}', true),
('phoneme', 3, '{"word": "splash", "position": "first", "answer": "spl", "options": ["spl","str","scr"], "emoji": "💦"}', true),
('phoneme', 3, '{"word": "scream", "position": "first", "answer": "scr", "options": ["scr","str","spr"], "emoji": "😱"}', true),
('phoneme', 3, '{"word": "sprout", "position": "first", "answer": "spr", "options": ["spr","str","scr"], "emoji": "🌱"}', true)
ON CONFLICT DO NOTHING;
