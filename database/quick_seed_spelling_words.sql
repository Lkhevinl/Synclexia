-- ============================================================
-- QUICK SEED: Spelling Words (for SpellingScreen)
-- Run this in Supabase SQL Editor after COMPLETE_SETUP.sql
-- ============================================================

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active) VALUES
-- Level 1 (CVC - Easy)
('cat', '🐱', 'A furry pet that meows', 1, true),
('dog', '🐕', 'A pet that barks', 1, true),
('bat', '🦇', 'Flies in the night', 1, true),
('sun', '☀️', 'Bright in the sky', 1, true),
('run', '🏃', 'Move very fast', 1, true),
('sit', '💺', 'To be on a chair', 1, true),
('hat', '🎩', 'Worn on the head', 1, true),
('mat', '🪵', 'Floor covering', 1, true),
('rat', '🐭', 'Small rodent', 1, true),
('pen', '✏️', 'Used to write', 1, true),
('ten', '🔟', 'Number after nine', 1, true),
('red', '❤️', 'A color', 1, true),
('bed', '🛏️', 'Sleep here', 1, true),
('pig', '🐷', 'Farm animal', 1, true),
('big', '📏', 'Large size', 1, true),
('box', '📦', 'Container', 1, true),
('fox', '🦊', 'Red animal', 1, true),

-- Level 2 (4-letter - Medium)
('jump', '🦘', 'Leap into the air', 2, true),
('play', '🎮', 'Have fun', 2, true),
('tree', '🌳', 'Plant with leaves', 2, true),
('book', '📚', 'Read this', 2, true),
('fish', '🐠', 'Lives in water', 2, true),
('bird', '🕊️', 'Has wings and flies', 2, true),
('milk', '🥛', 'White drink', 2, true),
('rock', '🪨', 'Hard stone', 2, true),
('hand', '✋', 'Part of arm', 2, true),
('food', '🍎', 'Something to eat', 2, true),
('moon', '🌙', 'Night sky object', 2, true),
('rain', '🌧️', 'Water from clouds', 2, true),
('door', '🚪', 'Entrance', 2, true),
('ring', '💍', 'Worn on finger', 2, true),
('song', '🎵', 'Musical piece', 2, true),
('horn', '📯', 'Musical instrument', 2, true),
('rope', '🪢', 'Thick cord', 2, true),

-- Level 3 (5-letter+ - Hard)
('elephant', '🐘', 'Large gray animal', 3, true),
('butterfly', '🦋', 'Colorful insect', 3, true),
('chocolate', '🍫', 'Sweet brown treat', 3, true),
('mountain', '⛰️', 'Very high land', 3, true),
('strawberry', '🍓', 'Red fruit', 3, true),
('adventure', '🚀', 'Exciting journey', 3, true),
('rainbow', '🌈', 'Colors in sky', 3, true),
('holiday', '🎉', 'Special day', 3, true),
('bicycle', '🚲', 'Two-wheel vehicle', 3, true),
('dinosaur', '🦕', 'Prehistoric creature', 3, true),
('treasure', '💎', 'Valuable items', 3, true),
('happiness', '😊', 'Feeling of joy', 3, true),
('friendship', '👫', 'Close relationship', 3, true),
('knowledge', '📖', 'Understanding', 3, true),
('fantastic', '⭐', 'Excellent and amazing', 3, true),
('wonderful', '🌟', 'Very good', 3, true)
ON CONFLICT DO NOTHING;
