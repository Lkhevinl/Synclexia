# Database Seeder Instructions

This guide explains how to populate the Synclexia database with sample content for testing and demonstration purposes.

## 📋 Overview of Seeders

### 1. **seed_stories.sql** - 50 Stories
- **Level 1**: 10 simple stories (ages 4-5) - Basic vocabulary
- **Level 2**: 10 intermediate stories (ages 5-6) - Expanded sentences
- **Level 3**: 10 advanced stories (ages 6-7) - Complex narratives
- **Level 4**: 10 difficult stories (ages 7-8) - Technical vocabulary
- **Level 5**: 10 expert stories (ages 8+) - Advanced concepts

### 2. **seed_spelling_words.sql** - 50 Words
- **Level 1 (CVC - Easy)**: 17 words - Cat, dog, bat, sun, run, sit, hat, mat, rat, pen, ten, red, bed, pig, big, box, fox
- **Level 2 (4-letter - Medium)**: 17 words - Jump, play, tree, book, fish, bird, milk, rock, hand, food, moon, rain, door, ring, song, horn, rope
- **Level 3 (5-letter+ - Hard)**: 16 words - Elephant, butterfly, chocolate, mountain, strawberry, adventure, rainbow, holiday, bicycle, dinosaur, treasure, happiness, friendship, knowledge, fantastic, extraordinary

### 3. **seed_phonics_activity_content.sql** - 50 Activities
- **Blend Game** (17 items):
  - Level 1: cat, dog, bat, sun, run, fish (6 items)
  - Level 2: stripe, split, tree, flow, green, bread (6 items)
  - Level 3: splash, strong, throw, scream, straight (5 items)

- **Rhyme Game** (17 items):
  - Level 1: cat/bat, log/dog, hat/mat, red/bed, pin/bin, box/fox (6 items)
  - Level 2: night/light, ring/sing, fly/sky, boat/coat, way/day, book/look (6 items)
  - Level 3: share/care, please/freeze, string/spring, dance/chance, throne/stone (5 items)

- **Segment Game** (16 items):
  - Level 1: cat, dog, sun, run, bat (5 items)
  - Level 2: tree, plant, green, bread, light (5 items)
  - Level 3: strength, through, eighteen, scream (4 items)

### 4. **seed_phonological_content.sql** - 50 Tasks
- **Syllable Task** (17 items):
  - Level 1: cat, dog, sun, run, bat, pen (6 items, all 1 syllable)
  - Level 2: apple, water, rabbit, garden, window, butter (6 items, 2 syllables)
  - Level 3: elephant, butterfly, dinosaur, hospital, yesterday (5 items, 3 syllables)

- **Rime Task** (17 items):
  - Level 1: cat/bat, log/dog, hat/mat, red/bed, pin/bin, box/fox (6 items)
  - Level 2: night/light, ring/sing, fly/sky, boat/coat, way/day, book/look (6 items)
  - Level 3: share/care, please/freeze, string/spring, dance/chance, throne/stone (5 items)

- **Phoneme Task** (16 items):
  - Level 1: sun(s), mat(m), bag(b), cat(t-last), dog(g-last), pen(n-last) (6 items)
  - Level 2: fish(i-middle), tree(tr), plant(pl), cloud(cl), bring(br), black(bl) (6 items)
  - Level 3: strength(str), splash(spl), scream(scr), sprout(spr) (4 items)

## 🚀 How to Apply Seeders

### Option 1: Apply All at Once
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Create a new query
3. Copy and paste ALL seeder scripts in this order:
   ```sql
   -- First run table fixes
   -- (copy content from fix_*.sql files)

   -- Then run seeders
   -- (copy content from seed_*.sql files)
   ```
4. Click **Run**

### Option 2: Apply One by One
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. For each file, copy its content and run:
   ```
   Fix tables first:
   - fix_stories_table.sql
   - fix_phonics_items_table.sql
   - fix_spelling_words_table.sql
   - fix_phonics_activity_content_table.sql
   - fix_phonological_content_table.sql

   Then seed data:
   - seed_stories.sql
   - seed_spelling_words.sql
   - seed_phonics_activity_content.sql
   - seed_phonological_content.sql
   ```

### Option 3: Using Command Line (if pgSQL access available)
```bash
psql -h [DATABASE_HOST] -U [DATABASE_USER] -d [DATABASE_NAME] -f fix_stories_table.sql
psql -h [DATABASE_HOST] -U [DATABASE_USER] -d [DATABASE_NAME] -f seed_stories.sql
# ... repeat for other files
```

## ✅ Verification Checklist

After running all migrations and seeders, verify:

1. **Check Stories Count**
   ```sql
   SELECT COUNT(*) FROM public.stories;
   -- Should return: 50
   ```

2. **Check Spelling Words Count**
   ```sql
   SELECT COUNT(*) FROM public.spelling_words;
   -- Should return: 50
   ```

3. **Check Phonics Activity Count**
   ```sql
   SELECT COUNT(*) FROM public.phonics_activity_content;
   -- Should return: 50
   ```

4. **Check Phonological Content Count**
   ```sql
   SELECT COUNT(*) FROM public.phonological_content;
   -- Should return: 50
   ```

5. **Verify Distribution by Level**
   ```sql
   SELECT difficulty_level, COUNT(*)
   FROM public.spelling_words
   GROUP BY difficulty_level;
   -- Should show: Level 1: 17, Level 2: 17, Level 3: 16
   ```

6. **Verify Phonics Activity Game Types**
   ```sql
   SELECT game_type, difficulty_level, COUNT(*)
   FROM public.phonics_activity_content
   GROUP BY game_type, difficulty_level
   ORDER BY game_type, difficulty_level;
   -- Should show: blend, rhyme, segment all with levels 1-3
   ```

7. **Verify Phonological Task Types**
   ```sql
   SELECT task_type, difficulty_level, COUNT(*)
   FROM public.phonological_content
   GROUP BY task_type, difficulty_level
   ORDER BY task_type, difficulty_level;
   -- Should show: syllable, rime, phoneme all with levels 1-3
   ```

## 📊 Expected Results After Seeding

| Table | Total Items | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 |
|-------|-------------|---------|---------|---------|---------|---------|
| stories | 50 | 10 | 10 | 10 | 10 | 10 |
| spelling_words | 50 | 17 | 17 | 16 | - | - |
| phonics_activity_content | 50 | 17 | 17 | 16 | - | - |
| phonological_content | 50 | 17 | 17 | 16 | - | - |

## 🎯 What Content is Available for Testing

### Writing Practice
- **50 stories** across 5 reading levels
- Easy stories for beginner readers
- Complex stories for advanced readers
- Perfect for testing reading comprehension features

### Spelling Challenges
- **50 words** across 3 difficulty levels:
  - CVC (3-letter) words - Easy
  - 4-letter words - Medium
  - 5+ letter words - Hard
- Progressive difficulty for skill building

### Phonics Games
- **50 game activities** with 3 game types:
  - Blend It: Blend phonemes into words
  - Rhyme Time: Match rhyming words
  - Count Sounds: Segment words into phonemes
- Each game type has 3 difficulty levels

### Phonological Awareness
- **50 awareness tasks** with 3 task types:
  - Syllable counting
  - Rime matching
  - Phoneme identification
- Progressive difficulty from single syllables to complex consonant clusters

## 💡 Tips

- Test all difficulty levels to ensure progressive learning
- Verify RLS policies are working (only admins can see creator info)
- Check that inactive items don't appear to regular users
- Ensure timestamps are set correctly
- Test filtering by difficulty level works in the app

## 🔄 Resetting Data

If you need to clear all seeded data and start fresh:

```sql
-- Delete all seed data (keeps table structure)
DELETE FROM public.stories;
DELETE FROM public.spelling_words;
DELETE FROM public.phonics_activity_content;
DELETE FROM public.phonological_content;

-- Re-run the seed files to repopulate
```

Or to completely reset tables:

```sql
-- Drop and recreate tables
DROP TABLE IF EXISTS public.stories CASCADE;
DROP TABLE IF EXISTS public.spelling_words CASCADE;
DROP TABLE IF EXISTS public.phonics_activity_content CASCADE;
DROP TABLE IF EXISTS public.phonological_content CASCADE;

-- Run the fix_*.sql files to rebuild structure
-- Then run the seed_*.sql files to repopulate
```
