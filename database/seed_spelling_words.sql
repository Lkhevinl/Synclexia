-- Seed Spelling Words Table with 50 words distributed across difficulty levels

-- Level 1 (CVC - Easy) - 17 words
INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'cat', '🐱', 'A furry pet that meows', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'cat');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'dog', '🐕', 'A pet that barks', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'dog');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'bat', '🦇', 'Flies in the night', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'bat');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'sun', '☀️', 'Bright in the sky', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'sun');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'run', '🏃', 'Move very fast', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'run');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'sit', '💺', 'To be on a chair', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'sit');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'hat', '🎩', 'Worn on the head', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'hat');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'mat', '🪵', 'Floor covering', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'mat');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'rat', '🐭', 'Small rodent', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'rat');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'pen', '✏️', 'Used to write', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'pen');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'ten', '1️⃣0️⃣', 'Number after nine', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'ten');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'red', '❤️', 'A color', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'red');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'bed', '🛏️', 'Sleep here', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'bed');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'pig', '🐷', 'Farm animal', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'pig');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'big', '📏', 'Large size', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'big');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'box', '📦', 'Container', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'box');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'fox', '🦊', 'Red animal', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'fox');

-- Level 2 (4-letter - Medium) - 17 words
INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'jump', '🦘', 'Leap into the air', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'jump');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'play', '🎮', 'Have fun', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'play');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'tree', '🌳', 'Plant with leaves', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'tree');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'book', '📚', 'Read this', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'book');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'fish', '🐠', 'Lives in water', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'fish');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'bird', '🕊️', 'Has wings and flies', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'bird');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'milk', '🥛', 'White drink', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'milk');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'rock', '🪨', 'Hard stone', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'rock');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'hand', '✋', 'Part of arm', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'hand');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'food', '🍎', 'Something to eat', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'food');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'moon', '🌙', 'Night sky object', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'moon');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'rain', '🌧️', 'Water from clouds', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'rain');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'door', '🚪', 'Entrance', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'door');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'ring', '💍', 'Worn on finger', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'ring');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'song', '🎵', 'Musical piece', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'song');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'horn', '📯', 'Musical instrument', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'horn');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'rope', '🪢', 'Thick cord', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'rope');

-- Level 3 (5-letter+ - Hard) - 16 words
INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'elephant', '🐘', 'Large gray animal', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'elephant');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'butterfly', '🦋', 'Colorful insect', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'butterfly');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'chocolate', '🍫', 'Sweet brown treat', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'chocolate');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'mountain', '⛰️', 'Very high land', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'mountain');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'strawberry', '🍓', 'Red fruit', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'strawberry');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'adventure', '🚀', 'Exciting journey', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'adventure');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'rainbow', '🌈', 'Colors in sky', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'rainbow');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'holiday', '🎉', 'Special day', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'holiday');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'bicycle', '🚲', 'Two-wheel vehicle', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'bicycle');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'dinosaur', '🦕', 'Prehistoric creature', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'dinosaur');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'treasure', '💎', 'Valuable items', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'treasure');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'happiness', '😊', 'Feeling of joy', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'happiness');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'friendship', '👫', 'Close relationship', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'friendship');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'knowledge', '📖', 'Understanding', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'knowledge');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'fantastic', '⭐', 'Excellent and amazing', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'fantastic');

INSERT INTO public.spelling_words (word, emoji, hint, difficulty_level, is_active, created_by)
SELECT 'extraordinary', '🌟', 'Very unusual or special', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.spelling_words WHERE word = 'extraordinary');
