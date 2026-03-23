-- ============================================================
-- COMPREHENSIVE DATABASE SETUP FOR SYNCLEXIA
-- Run this FIRST to set up all tables and RLS policies
-- Then run the seed_*.sql files to populate data
-- ============================================================

-- ─── 1. STORIES TABLE (Reading/Writing Practice) ───────────────────────────
DROP TABLE IF EXISTS public.stories CASCADE;

CREATE TABLE public.stories (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            VARCHAR(200) NOT NULL,
  content          TEXT NOT NULL,
  level            INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stories_active_level ON public.stories (is_active, level);
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: Allow ALL authenticated users to read stories (not just when is_active=true)
CREATE POLICY "Anyone can read stories" ON public.stories
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins manage stories" ON public.stories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── 2. PHONICS_ITEMS TABLE ─────────────────────────────────────────────────
DROP TABLE IF EXISTS public.phonics_items CASCADE;

CREATE TABLE public.phonics_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label            VARCHAR(10) NOT NULL,
  icon             VARCHAR(10),
  bg_color         VARCHAR(7),
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_phonics_items_label ON public.phonics_items (label);
ALTER TABLE public.phonics_items ENABLE ROW LEVEL SECURITY;

-- Allow ALL authenticated users to read phonics items
CREATE POLICY "Anyone can read phonics items" ON public.phonics_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins manage phonics items" ON public.phonics_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── 3. SPELLING_WORDS TABLE ────────────────────────────────────────────────
DROP TABLE IF EXISTS public.spelling_words CASCADE;

CREATE TABLE public.spelling_words (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word             VARCHAR(50) NOT NULL,
  emoji            VARCHAR(10),
  hint             TEXT,
  difficulty_level INTEGER NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 3),
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_spelling_words_level ON public.spelling_words (difficulty_level);
ALTER TABLE public.spelling_words ENABLE ROW LEVEL SECURITY;

-- Allow ALL authenticated users to read spelling words
CREATE POLICY "Anyone can read spelling words" ON public.spelling_words
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins manage spelling words" ON public.spelling_words
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── 4. PHONICS_ACTIVITY_CONTENT TABLE ──────────────────────────────────────
DROP TABLE IF EXISTS public.phonics_activity_content CASCADE;

CREATE TABLE public.phonics_activity_content (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type        VARCHAR(10) NOT NULL CHECK (game_type IN ('blend', 'rhyme', 'segment')),
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 3),
  data             JSONB NOT NULL,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_phonics_activity_type ON public.phonics_activity_content (game_type, difficulty_level);
ALTER TABLE public.phonics_activity_content ENABLE ROW LEVEL SECURITY;

-- Allow ALL authenticated users to read phonics activity content
CREATE POLICY "Anyone can read phonics activity content" ON public.phonics_activity_content
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins manage phonics activity content" ON public.phonics_activity_content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── 5. PHONOLOGICAL_CONTENT TABLE ──────────────────────────────────────────
DROP TABLE IF EXISTS public.phonological_content CASCADE;

CREATE TABLE public.phonological_content (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type        VARCHAR(20) NOT NULL CHECK (task_type IN ('syllable', 'rime', 'phoneme')),
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 3),
  data             JSONB NOT NULL,
  is_active        BOOLEAN DEFAULT TRUE,
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_phonological_task ON public.phonological_content (task_type, difficulty_level);
ALTER TABLE public.phonological_content ENABLE ROW LEVEL SECURITY;

-- Allow ALL authenticated users to read phonological content
CREATE POLICY "Anyone can read phonological content" ON public.phonological_content
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins manage phonological content" ON public.phonological_content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── 6. WRITING_PRACTICE TABLE ──────────────────────────────────────────────
DROP TABLE IF EXISTS public.writing_practice CASCADE;

CREATE TABLE public.writing_practice (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label      TEXT NOT NULL,
  svg_path   TEXT,
  category   TEXT DEFAULT 'letter',
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_writing_practice_label ON public.writing_practice (label);
ALTER TABLE public.writing_practice ENABLE ROW LEVEL SECURITY;

-- Allow ALL authenticated users to read writing practice items
CREATE POLICY "Anyone can read writing practice" ON public.writing_practice
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins manage writing practice" ON public.writing_practice
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed default A-Z letters
INSERT INTO public.writing_practice (label, category) VALUES
  ('A','letter'),('B','letter'),('C','letter'),('D','letter'),
  ('E','letter'),('F','letter'),('G','letter'),('H','letter'),
  ('I','letter'),('J','letter'),('K','letter'),('L','letter'),
  ('M','letter'),('N','letter'),('O','letter'),('P','letter'),
  ('Q','letter'),('R','letter'),('S','letter'),('T','letter'),
  ('U','letter'),('V','letter'),('W','letter'),('X','letter'),
  ('Y','letter'),('Z','letter')
ON CONFLICT DO NOTHING;

-- ─── 7. CREATE updated_at TRIGGER FUNCTION ──────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS update_stories_updated_at ON public.stories;
CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_phonics_items_updated_at ON public.phonics_items;
CREATE TRIGGER update_phonics_items_updated_at
  BEFORE UPDATE ON public.phonics_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_spelling_words_updated_at ON public.spelling_words;
CREATE TRIGGER update_spelling_words_updated_at
  BEFORE UPDATE ON public.spelling_words
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_phonics_activity_updated_at ON public.phonics_activity_content;
CREATE TRIGGER update_phonics_activity_updated_at
  BEFORE UPDATE ON public.phonics_activity_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_phonological_content_updated_at ON public.phonological_content;
CREATE TRIGGER update_phonological_content_updated_at
  BEFORE UPDATE ON public.phonological_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── 8. RELOAD SCHEMA CACHE ─────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- SETUP COMPLETE!
-- Now run the seed_*.sql files to populate sample data:
-- 1. seed_stories.sql (50 stories)
-- 2. seed_spelling_words.sql (50 words)
-- 3. seed_phonics_activity_content.sql (50 game items)
-- 4. seed_phonological_content.sql (50 awareness tasks)
-- ============================================================
