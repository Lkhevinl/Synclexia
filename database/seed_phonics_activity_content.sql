-- Seed Phonics Activity Content with 50 items (blend, rhyme, segment with difficulties 1-3)

-- BLEND ITEMS (Level 1) - 6 items
INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'blend', 1, jsonb_build_object('phonemes', jsonb_build_array('c','a','t'), 'word', 'cat', 'emoji', '🐱'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'cat' AND game_type = 'blend');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'blend', 1, jsonb_build_object('phonemes', jsonb_build_array('d','o','g'), 'word', 'dog', 'emoji', '🐕'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'dog' AND game_type = 'blend');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'blend', 1, jsonb_build_object('phonemes', jsonb_build_array('b','a','t'), 'word', 'bat', 'emoji', '🦇'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'bat' AND game_type = 'blend');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'blend', 1, jsonb_build_object('phonemes', jsonb_build_array('s','u','n'), 'word', 'sun', 'emoji', '☀️'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'sun' AND game_type = 'blend');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'blend', 1, jsonb_build_object('phonemes', jsonb_build_array('r','u','n'), 'word', 'run', 'emoji', '🏃'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'run' AND game_type = 'blend');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'blend', 1, jsonb_build_object('phonemes', jsonb_build_array('f','i','sh'), 'word', 'fish', 'emoji', '🐠'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'fish' AND game_type = 'blend');

-- BLEND ITEMS (Level 2) - 6 items
INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'blend', 2, jsonb_build_object('phonemes', jsonb_build_array('st','r','i','pe'), 'word', 'stripe', 'emoji', '🦓'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'stripe' AND game_type = 'blend');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'blend', 2, jsonb_build_object('phonemes', jsonb_build_array('s','pl','i','t'), 'word', 'split', 'emoji', '✂️'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'split' AND game_type = 'blend');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'blend', 2, jsonb_build_object('phonemes', jsonb_build_array('t','r','e','e'), 'word', 'tree', 'emoji', '🌳'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'tree' AND game_type = 'blend');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'blend', 2, jsonb_build_object('phonemes', jsonb_build_array('fl','ow'), 'word', 'flow', 'emoji', '💧'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'flow' AND game_type = 'blend');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'blend', 2, jsonb_build_object('phonemes', jsonb_build_array('gr','ee','n'), 'word', 'green', 'emoji', '🍃'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'green' AND game_type = 'blend');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'blend', 2, jsonb_build_object('phonemes', jsonb_build_array('br','ea','d'), 'word', 'bread', 'emoji', '🍞'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'bread' AND game_type = 'blend');

-- BLEND ITEMS (Level 3) - 5 items
INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'blend', 3, jsonb_build_object('phonemes', jsonb_build_array('spl','ash'), 'word', 'splash', 'emoji', '💦'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'splash' AND game_type = 'blend');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'blend', 3, jsonb_build_object('phonemes', jsonb_build_array('str','o','ng'), 'word', 'strong', 'emoji', '💪'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'strong' AND game_type = 'blend');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'blend', 3, jsonb_build_object('phonemes', jsonb_build_array('thr','o','w'), 'word', 'throw', 'emoji', '🎾'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'throw' AND game_type = 'blend');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'blend', 3, jsonb_build_object('phonemes', jsonb_build_array('scr','eam'), 'word', 'scream', 'emoji', '😱'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'scream' AND game_type = 'blend');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'blend', 3, jsonb_build_object('phonemes', jsonb_build_array('str','ai','ght'), 'word', 'straight', 'emoji', '📍'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'straight' AND game_type = 'blend');

-- RHYME ITEMS (Level 1) - 6 items
INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'rhyme', 1, jsonb_build_object('target', 'cat', 'options', jsonb_build_array('bat','dog','sun'), 'correct', 'bat', 'emoji', '🐱'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'target' = 'cat' AND game_type = 'rhyme' AND data->>'correct' = 'bat');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'rhyme', 1, jsonb_build_object('target', 'log', 'options', jsonb_build_array('dog','pen','book'), 'correct', 'dog', 'emoji', '📍'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'target' = 'log' AND game_type = 'rhyme' AND data->>'correct' = 'dog');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'rhyme', 1, jsonb_build_object('target', 'hat', 'options', jsonb_build_array('mat','run','tree'), 'correct', 'mat', 'emoji', '🎩'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'target' = 'hat' AND game_type = 'rhyme' AND data->>'correct' = 'mat');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'rhyme', 1, jsonb_build_object('target', 'red', 'options', jsonb_build_array('bed','pen','sun'), 'correct', 'bed', 'emoji', '❤️'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'target' = 'red' AND game_type = 'rhyme' AND data->>'correct' = 'bed');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'rhyme', 1, jsonb_build_object('target', 'pin', 'options', jsonb_build_array('bin','cup','hat'), 'correct', 'bin', 'emoji', '📌'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'target' = 'pin' AND game_type = 'rhyme' AND data->>'correct' = 'bin');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'rhyme', 1, jsonb_build_object('target', 'box', 'options', jsonb_build_array('fox','dog','pen'), 'correct', 'fox', 'emoji', '📦'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'target' = 'box' AND game_type = 'rhyme' AND data->>'correct' = 'fox');

-- RHYME ITEMS (Level 2) - 6 items
INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'rhyme', 2, jsonb_build_object('target', 'night', 'options', jsonb_build_array('light','book','rain'), 'correct', 'light', 'emoji', '🌙'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'target' = 'night' AND game_type = 'rhyme' AND data->>'correct' = 'light');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'rhyme', 2, jsonb_build_object('target', 'ring', 'options', jsonb_build_array('sing','jump','fish'), 'correct', 'sing', 'emoji', '💍'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'target' = 'ring' AND game_type = 'rhyme' AND data->>'correct' = 'sing');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'rhyme', 2, jsonb_build_object('target', 'fly', 'options', jsonb_build_array('sky','run','bear'), 'correct', 'sky', 'emoji', '🦋'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'target' = 'fly' AND game_type = 'rhyme' AND data->>'correct' = 'sky');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'rhyme', 2, jsonb_build_object('target', 'boat', 'options', jsonb_build_array('coat','rain','tree'), 'correct', 'coat', 'emoji', '⛵'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'target' = 'boat' AND game_type = 'rhyme' AND data->>'correct' = 'coat');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'rhyme', 2, jsonb_build_object('target', 'way', 'options', jsonb_build_array('day','jump','play'), 'correct', 'day', 'emoji', '🛣️'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'target' = 'way' AND game_type = 'rhyme' AND data->>'correct' = 'day');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'rhyme', 2, jsonb_build_object('target', 'book', 'options', jsonb_build_array('look','run','fish'), 'correct', 'look', 'emoji', '📚'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'target' = 'book' AND game_type = 'rhyme' AND data->>'correct' = 'look');

-- RHYME ITEMS (Level 3) - 5 items
INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'rhyme', 3, jsonb_build_object('target', 'share', 'options', jsonb_build_array('care','jump','tree'), 'correct', 'care', 'emoji', '🎈'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'target' = 'share' AND game_type = 'rhyme' AND data->>'correct' = 'care');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'rhyme', 3, jsonb_build_object('target', 'please', 'options', jsonb_build_array('freeze','jump','bear'), 'correct', 'freeze', 'emoji', '🥶'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'target' = 'please' AND game_type = 'rhyme' AND data->>'correct' = 'freeze');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'rhyme', 3, jsonb_build_object('target', 'string', 'options', jsonb_build_array('spring','jump','fish'), 'correct', 'spring', 'emoji', '🎯'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'target' = 'string' AND game_type = 'rhyme' AND data->>'correct' = 'spring');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'rhyme', 3, jsonb_build_object('target', 'dance', 'options', jsonb_build_array('chance','run','tree'), 'correct', 'chance', 'emoji', '💃'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'target' = 'dance' AND game_type = 'rhyme' AND data->>'correct' = 'chance');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'rhyme', 3, jsonb_build_object('target', 'throne', 'options', jsonb_build_array('stone','run','fish'), 'correct', 'stone', 'emoji', '👑'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'target' = 'throne' AND game_type = 'rhyme' AND data->>'correct' = 'stone');

-- SEGMENT ITEMS (Level 1) - 5 items
INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'segment', 1, jsonb_build_object('word', 'cat', 'phonemes', jsonb_build_array('c','a','t'), 'count', 3, 'emoji', '🐱'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'cat' AND game_type = 'segment' AND data->>'count' = '3');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'segment', 1, jsonb_build_object('word', 'dog', 'phonemes', jsonb_build_array('d','o','g'), 'count', 3, 'emoji', '🐕'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'dog' AND game_type = 'segment' AND data->>'count' = '3');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'segment', 1, jsonb_build_object('word', 'sun', 'phonemes', jsonb_build_array('s','u','n'), 'count', 3, 'emoji', '☀️'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'sun' AND game_type = 'segment' AND data->>'count' = '3');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'segment', 1, jsonb_build_object('word', 'run', 'phonemes', jsonb_build_array('r','u','n'), 'count', 3, 'emoji', '🏃'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'run' AND game_type = 'segment' AND data->>'count' = '3');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'segment', 1, jsonb_build_object('word', 'bat', 'phonemes', jsonb_build_array('b','a','t'), 'count', 3, 'emoji', '🦇'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'bat' AND game_type = 'segment' AND data->>'count' = '3');

-- SEGMENT ITEMS (Level 2) - 5 items
INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'segment', 2, jsonb_build_object('word', 'tree', 'phonemes', jsonb_build_array('t','r','ee'), 'count', 3, 'emoji', '🌳'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'tree' AND game_type = 'segment' AND data->>'count' = '3');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'segment', 2, jsonb_build_object('word', 'plant', 'phonemes', jsonb_build_array('p','l','a','n','t'), 'count', 5, 'emoji', '🌿'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'plant' AND game_type = 'segment' AND data->>'count' = '5');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'segment', 2, jsonb_build_object('word', 'green', 'phonemes', jsonb_build_array('g','r','ee','n'), 'count', 4, 'emoji', '🍃'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'green' AND game_type = 'segment' AND data->>'count' = '4');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'segment', 2, jsonb_build_object('word', 'bread', 'phonemes', jsonb_build_array('b','r','e','d'), 'count', 4, 'emoji', '🍞'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'bread' AND game_type = 'segment' AND data->>'count' = '4');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'segment', 2, jsonb_build_object('word', 'light', 'phonemes', jsonb_build_array('l','i','ght'), 'count', 3, 'emoji', '💡'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'light' AND game_type = 'segment' AND data->>'count' = '3');

-- SEGMENT ITEMS (Level 3) - 4 items
INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'segment', 3, jsonb_build_object('word', 'strength', 'phonemes', jsonb_build_array('str','e','ngth'), 'count', 3, 'emoji', '💪'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'strength' AND game_type = 'segment' AND data->>'count' = '3');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'segment', 3, jsonb_build_object('word', 'through', 'phonemes', jsonb_build_array('th','r','oo'), 'count', 3, 'emoji', '📍'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'through' AND game_type = 'segment' AND data->>'count' = '3');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'segment', 3, jsonb_build_object('word', 'eighteen', 'phonemes', jsonb_build_array('ei','g','h','t','ee','n'), 'count', 6, 'emoji', '1️⃣8️⃣'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'eighteen' AND game_type = 'segment' AND data->>'count' = '6');

INSERT INTO public.phonics_activity_content (game_type, difficulty_level, data, is_active, created_by)
SELECT 'segment', 3, jsonb_build_object('word', 'scream', 'phonemes', jsonb_build_array('scr','ee','m'), 'count', 3, 'emoji', '😱'), TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_activity_content WHERE data->>'word' = 'scream' AND game_type = 'segment' AND data->>'count' = '3');
