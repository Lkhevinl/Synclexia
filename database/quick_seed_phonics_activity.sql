-- ============================================================
-- QUICK SEED: Phonics Activity Content (for PhonicsActivityScreen)
-- Run this in Supabase SQL Editor after COMPLETE_SETUP.sql
-- ============================================================

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active) VALUES
-- BLEND Level 1
('blend', 1, '{"phonemes": ["c","a","t"], "word": "cat", "emoji": "🐱"}', true),
('blend', 1, '{"phonemes": ["d","o","g"], "word": "dog", "emoji": "🐕"}', true),
('blend', 1, '{"phonemes": ["b","a","t"], "word": "bat", "emoji": "🦇"}', true),
('blend', 1, '{"phonemes": ["s","u","n"], "word": "sun", "emoji": "☀️"}', true),
('blend', 1, '{"phonemes": ["r","u","n"], "word": "run", "emoji": "🏃"}', true),
('blend', 1, '{"phonemes": ["f","i","sh"], "word": "fish", "emoji": "🐠"}', true),

-- BLEND Level 2
('blend', 2, '{"phonemes": ["t","r","ee"], "word": "tree", "emoji": "🌳"}', true),
('blend', 2, '{"phonemes": ["fl","ow"], "word": "flow", "emoji": "💧"}', true),
('blend', 2, '{"phonemes": ["gr","ee","n"], "word": "green", "emoji": "🍃"}', true),
('blend', 2, '{"phonemes": ["br","ea","d"], "word": "bread", "emoji": "🍞"}', true),
('blend', 2, '{"phonemes": ["pl","ay"], "word": "play", "emoji": "🎮"}', true),

-- BLEND Level 3
('blend', 3, '{"phonemes": ["spl","ash"], "word": "splash", "emoji": "💦"}', true),
('blend', 3, '{"phonemes": ["str","o","ng"], "word": "strong", "emoji": "💪"}', true),
('blend', 3, '{"phonemes": ["thr","o","w"], "word": "throw", "emoji": "🎾"}', true),
('blend', 3, '{"phonemes": ["scr","eam"], "word": "scream", "emoji": "😱"}', true),

-- RHYME Level 1
('rhyme', 1, '{"target": "cat", "options": ["bat","dog","sun"], "correct": "bat", "emoji": "🐱"}', true),
('rhyme', 1, '{"target": "log", "options": ["dog","pen","book"], "correct": "dog", "emoji": "📦"}', true),
('rhyme', 1, '{"target": "hat", "options": ["mat","run","tree"], "correct": "mat", "emoji": "🎩"}', true),
('rhyme', 1, '{"target": "red", "options": ["bed","pen","sun"], "correct": "bed", "emoji": "❤️"}', true),
('rhyme', 1, '{"target": "pin", "options": ["bin","cup","hat"], "correct": "bin", "emoji": "📌"}', true),
('rhyme', 1, '{"target": "box", "options": ["fox","dog","pen"], "correct": "fox", "emoji": "📦"}', true),

-- RHYME Level 2
('rhyme', 2, '{"target": "night", "options": ["light","book","rain"], "correct": "light", "emoji": "🌙"}', true),
('rhyme', 2, '{"target": "ring", "options": ["sing","jump","fish"], "correct": "sing", "emoji": "💍"}', true),
('rhyme', 2, '{"target": "fly", "options": ["sky","run","bear"], "correct": "sky", "emoji": "🦋"}', true),
('rhyme', 2, '{"target": "boat", "options": ["coat","rain","tree"], "correct": "coat", "emoji": "⛵"}', true),
('rhyme', 2, '{"target": "book", "options": ["look","run","fish"], "correct": "look", "emoji": "📚"}', true),

-- RHYME Level 3
('rhyme', 3, '{"target": "share", "options": ["care","jump","tree"], "correct": "care", "emoji": "🎈"}', true),
('rhyme', 3, '{"target": "please", "options": ["freeze","jump","bear"], "correct": "freeze", "emoji": "🥶"}', true),
('rhyme', 3, '{"target": "string", "options": ["spring","jump","fish"], "correct": "spring", "emoji": "🎯"}', true),
('rhyme', 3, '{"target": "dance", "options": ["chance","run","tree"], "correct": "chance", "emoji": "💃"}', true),

-- SEGMENT Level 1
('segment', 1, '{"word": "cat", "phonemes": ["c","a","t"], "count": 3, "emoji": "🐱"}', true),
('segment', 1, '{"word": "dog", "phonemes": ["d","o","g"], "count": 3, "emoji": "🐕"}', true),
('segment', 1, '{"word": "sun", "phonemes": ["s","u","n"], "count": 3, "emoji": "☀️"}', true),
('segment', 1, '{"word": "run", "phonemes": ["r","u","n"], "count": 3, "emoji": "🏃"}', true),
('segment', 1, '{"word": "bat", "phonemes": ["b","a","t"], "count": 3, "emoji": "🦇"}', true),

-- SEGMENT Level 2
('segment', 2, '{"word": "tree", "phonemes": ["t","r","ee"], "count": 3, "emoji": "🌳"}', true),
('segment', 2, '{"word": "plant", "phonemes": ["p","l","a","n","t"], "count": 5, "emoji": "🌿"}', true),
('segment', 2, '{"word": "green", "phonemes": ["g","r","ee","n"], "count": 4, "emoji": "🍃"}', true),
('segment', 2, '{"word": "bread", "phonemes": ["b","r","e","d"], "count": 4, "emoji": "🍞"}', true),
('segment', 2, '{"word": "light", "phonemes": ["l","i","ght"], "count": 3, "emoji": "💡"}', true),

-- SEGMENT Level 3
('segment', 3, '{"word": "strength", "phonemes": ["str","e","ngth"], "count": 3, "emoji": "💪"}', true),
('segment', 3, '{"word": "through", "phonemes": ["th","r","oo"], "count": 3, "emoji": "➡️"}', true),
('segment', 3, '{"word": "scream", "phonemes": ["scr","ee","m"], "count": 3, "emoji": "😱"}', true)
ON CONFLICT DO NOTHING;
