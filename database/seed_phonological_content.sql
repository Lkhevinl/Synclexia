-- Seed Phonological Content with 50 items (syllable, rime, phoneme with difficulties 1-3)

-- SYLLABLE ITEMS (Level 1) - 6 items
INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'syllable', 1, jsonb_build_object('word', 'cat', 'syllables', 1, 'emoji', '🐱'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'cat' AND task_type = 'syllable' AND data->>'syllables' = '1');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'syllable', 1, jsonb_build_object('word', 'dog', 'syllables', 1, 'emoji', '🐕'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'dog' AND task_type = 'syllable' AND data->>'syllables' = '1');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'syllable', 1, jsonb_build_object('word', 'sun', 'syllables', 1, 'emoji', '☀️'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'sun' AND task_type = 'syllable' AND data->>'syllables' = '1');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'syllable', 1, jsonb_build_object('word', 'run', 'syllables', 1, 'emoji', '🏃'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'run' AND task_type = 'syllable' AND data->>'syllables' = '1');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'syllable', 1, jsonb_build_object('word', 'bat', 'syllables', 1, 'emoji', '🦇'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'bat' AND task_type = 'syllable' AND data->>'syllables' = '1');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'syllable', 1, jsonb_build_object('word', 'pen', 'syllables', 1, 'emoji', '✏️'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'pen' AND task_type = 'syllable' AND data->>'syllables' = '1');

-- SYLLABLE ITEMS (Level 2) - 6 items
INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'syllable', 2, jsonb_build_object('word', 'apple', 'syllables', 2, 'emoji', '🍎'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'apple' AND task_type = 'syllable' AND data->>'syllables' = '2');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'syllable', 2, jsonb_build_object('word', 'water', 'syllables', 2, 'emoji', '💧'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'water' AND task_type = 'syllable' AND data->>'syllables' = '2');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'syllable', 2, jsonb_build_object('word', 'rabbit', 'syllables', 2, 'emoji', '🐰'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'rabbit' AND task_type = 'syllable' AND data->>'syllables' = '2');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'syllable', 2, jsonb_build_object('word', 'garden', 'syllables', 2, 'emoji', '🌿'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'garden' AND task_type = 'syllable' AND data->>'syllables' = '2');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'syllable', 2, jsonb_build_object('word', 'window', 'syllables', 2, 'emoji', '🪟'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'window' AND task_type = 'syllable' AND data->>'syllables' = '2');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'syllable', 2, jsonb_build_object('word', 'butter', 'syllables', 2, 'emoji', '🧈'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'butter' AND task_type = 'syllable' AND data->>'syllables' = '2');

-- SYLLABLE ITEMS (Level 3) - 5 items
INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'syllable', 3, jsonb_build_object('word', 'elephant', 'syllables', 3, 'emoji', '🐘'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'elephant' AND task_type = 'syllable' AND data->>'syllables' = '3');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'syllable', 3, jsonb_build_object('word', 'butterfly', 'syllables', 3, 'emoji', '🦋'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'butterfly' AND task_type = 'syllable' AND data->>'syllables' = '3');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'syllable', 3, jsonb_build_object('word', 'dinosaur', 'syllables', 3, 'emoji', '🦕'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'dinosaur' AND task_type = 'syllable' AND data->>'syllables' = '3');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'syllable', 3, jsonb_build_object('word', 'hospital', 'syllables', 3, 'emoji', '🏥'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'hospital' AND task_type = 'syllable' AND data->>'syllables' = '3');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'syllable', 3, jsonb_build_object('word', 'yesterday', 'syllables', 3, 'emoji', '📅'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'yesterday' AND task_type = 'syllable' AND data->>'syllables' = '3');

-- RIME ITEMS (Level 1) - 6 items
INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'rime', 1, jsonb_build_object('target', 'cat', 'correct', 'bat', 'distractors', jsonb_build_array('dog','sun'), 'emoji', '🐱'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'target' = 'cat' AND task_type = 'rime' AND data->>'correct' = 'bat');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'rime', 1, jsonb_build_object('target', 'log', 'correct', 'dog', 'distractors', jsonb_build_array('pen','book'), 'emoji', '📍'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'target' = 'log' AND task_type = 'rime' AND data->>'correct' = 'dog');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'rime', 1, jsonb_build_object('target', 'hat', 'correct', 'mat', 'distractors', jsonb_build_array('run','tree'), 'emoji', '🎩'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'target' = 'hat' AND task_type = 'rime' AND data->>'correct' = 'mat');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'rime', 1, jsonb_build_object('target', 'red', 'correct', 'bed', 'distractors', jsonb_build_array('pen','sun'), 'emoji', '❤️'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'target' = 'red' AND task_type = 'rime' AND data->>'correct' = 'bed');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'rime', 1, jsonb_build_object('target', 'pin', 'correct', 'bin', 'distractors', jsonb_build_array('cup','hat'), 'emoji', '📌'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'target' = 'pin' AND task_type = 'rime' AND data->>'correct' = 'bin');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'rime', 1, jsonb_build_object('target', 'box', 'correct', 'fox', 'distractors', jsonb_build_array('dog','pen'), 'emoji', '📦'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'target' = 'box' AND task_type = 'rime' AND data->>'correct' = 'fox');

-- RIME ITEMS (Level 2) - 6 items
INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'rime', 2, jsonb_build_object('target', 'night', 'correct', 'light', 'distractors', jsonb_build_array('book','rain'), 'emoji', '🌙'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'target' = 'night' AND task_type = 'rime' AND data->>'correct' = 'light');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'rime', 2, jsonb_build_object('target', 'ring', 'correct', 'sing', 'distractors', jsonb_build_array('jump','fish'), 'emoji', '💍'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'target' = 'ring' AND task_type = 'rime' AND data->>'correct' = 'sing');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'rime', 2, jsonb_build_object('target', 'fly', 'correct', 'sky', 'distractors', jsonb_build_array('run','bear'), 'emoji', '🦋'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'target' = 'fly' AND task_type = 'rime' AND data->>'correct' = 'sky');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'rime', 2, jsonb_build_object('target', 'boat', 'correct', 'coat', 'distractors', jsonb_build_array('rain','tree'), 'emoji', '⛵'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'target' = 'boat' AND task_type = 'rime' AND data->>'correct' = 'coat');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'rime', 2, jsonb_build_object('target', 'way', 'correct', 'day', 'distractors', jsonb_build_array('jump','play'), 'emoji', '🛣️'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'target' = 'way' AND task_type = 'rime' AND data->>'correct' = 'day');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'rime', 2, jsonb_build_object('target', 'book', 'correct', 'look', 'distractors', jsonb_build_array('run','fish'), 'emoji', '📚'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'target' = 'book' AND task_type = 'rime' AND data->>'correct' = 'look');

-- RIME ITEMS (Level 3) - 5 items
INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'rime', 3, jsonb_build_object('target', 'share', 'correct', 'care', 'distractors', jsonb_build_array('jump','tree'), 'emoji', '🎈'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'target' = 'share' AND task_type = 'rime' AND data->>'correct' = 'care');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'rime', 3, jsonb_build_object('target', 'please', 'correct', 'freeze', 'distractors', jsonb_build_array('jump','bear'), 'emoji', '🥶'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'target' = 'please' AND task_type = 'rime' AND data->>'correct' = 'freeze');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'rime', 3, jsonb_build_object('target', 'string', 'correct', 'spring', 'distractors', jsonb_build_array('jump','fish'), 'emoji', '🎯'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'target' = 'string' AND task_type = 'rime' AND data->>'correct' = 'spring');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'rime', 3, jsonb_build_object('target', 'dance', 'correct', 'chance', 'distractors', jsonb_build_array('run','tree'), 'emoji', '💃'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'target' = 'dance' AND task_type = 'rime' AND data->>'correct' = 'chance');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'rime', 3, jsonb_build_object('target', 'throne', 'correct', 'stone', 'distractors', jsonb_build_array('run','fish'), 'emoji', '👑'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'target' = 'throne' AND task_type = 'rime' AND data->>'correct' = 'stone');

-- PHONEME ITEMS (Level 1) - 6 items
INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'phoneme', 1, jsonb_build_object('word', 'sun', 'position', 'first', 'answer', 's', 'options', jsonb_build_array('s','m','b'), 'emoji', '☀️'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'sun' AND task_type = 'phoneme' AND data->>'answer' = 's');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'phoneme', 1, jsonb_build_object('word', 'mat', 'position', 'first', 'answer', 'm', 'options', jsonb_build_array('m','b','t'), 'emoji', '🪵'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'mat' AND task_type = 'phoneme' AND data->>'answer' = 'm');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'phoneme', 1, jsonb_build_object('word', 'bag', 'position', 'first', 'answer', 'b', 'options', jsonb_build_array('b','d','p'), 'emoji', '👜'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'bag' AND task_type = 'phoneme' AND data->>'answer' = 'b');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'phoneme', 1, jsonb_build_object('word', 'cat', 'position', 'last', 'answer', 't', 'options', jsonb_build_array('t','d','p'), 'emoji', '🐱'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'cat' AND task_type = 'phoneme' AND data->>'position' = 'last');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'phoneme', 1, jsonb_build_object('word', 'dog', 'position', 'last', 'answer', 'g', 'options', jsonb_build_array('g','k','d'), 'emoji', '🐕'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'dog' AND task_type = 'phoneme' AND data->>'position' = 'last' AND data->>'answer' = 'g');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'phoneme', 1, jsonb_build_object('word', 'pen', 'position', 'last', 'answer', 'n', 'options', jsonb_build_array('n','m','d'), 'emoji', '✏️'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'pen' AND task_type = 'phoneme' AND data->>'position' = 'last' AND data->>'answer' = 'n');

-- PHONEME ITEMS (Level 2) - 6 items
INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'phoneme', 2, jsonb_build_object('word', 'fish', 'position', 'middle', 'answer', 'i', 'options', jsonb_build_array('i','a','o'), 'emoji', '🐠'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'fish' AND task_type = 'phoneme' AND data->>'position' = 'middle');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'phoneme', 2, jsonb_build_object('word', 'tree', 'position', 'first', 'answer', 'tr', 'options', jsonb_build_array('tr','dr','br'), 'emoji', '🌳'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'tree' AND task_type = 'phoneme' AND data->>'answer' = 'tr');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'phoneme', 2, jsonb_build_object('word', 'plant', 'position', 'first', 'answer', 'pl', 'options', jsonb_build_array('pl','bl','fl'), 'emoji', '🌿'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'plant' AND task_type = 'phoneme' AND data->>'answer' = 'pl');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'phoneme', 2, jsonb_build_object('word', 'cloud', 'position', 'first', 'answer', 'cl', 'options', jsonb_build_array('cl','bl','gl'), 'emoji', '☁️'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'cloud' AND task_type = 'phoneme' AND data->>'answer' = 'cl');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'phoneme', 2, jsonb_build_object('word', 'bring', 'position', 'first', 'answer', 'br', 'options', jsonb_build_array('br','tr','gr'), 'emoji', '🎁'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'bring' AND task_type = 'phoneme' AND data->>'answer' = 'br');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'phoneme', 2, jsonb_build_object('word', 'black', 'position', 'first', 'answer', 'bl', 'options', jsonb_build_array('bl','cl','fl'), 'emoji', '⬛'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'black' AND task_type = 'phoneme' AND data->>'answer' = 'bl');

-- PHONEME ITEMS (Level 3) - 4 items
INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'phoneme', 3, jsonb_build_object('word', 'strength', 'position', 'first', 'answer', 'str', 'options', jsonb_build_array('str','spr','scr'), 'emoji', '💪'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'strength' AND task_type = 'phoneme' AND data->>'answer' = 'str');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'phoneme', 3, jsonb_build_object('word', 'splash', 'position', 'first', 'answer', 'spl', 'options', jsonb_build_array('spl','str','scr'), 'emoji', '💦'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'splash' AND task_type = 'phoneme' AND data->>'answer' = 'spl');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'phoneme', 3, jsonb_build_object('word', 'scream', 'position', 'first', 'answer', 'scr', 'options', jsonb_build_array('scr','str','spr'), 'emoji', '😱'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'scream' AND task_type = 'phoneme' AND data->>'answer' = 'scr');

INSERT INTO public.phonological_content (task_type, difficulty_level, data, is_active, created_by)
SELECT 'phoneme', 3, jsonb_build_object('word', 'sprout', 'position', 'first', 'answer', 'spr', 'options', jsonb_build_array('spr','str','scr'), 'emoji', '🌱'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonological_content WHERE data->>'word' = 'sprout' AND task_type = 'phoneme' AND data->>'answer' = 'spr');
