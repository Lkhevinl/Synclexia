-- ============================================================
-- SPELLING WORDS TABLE
-- Manages words used in SpellingScreen.
-- Admin/Teacher can add, edit, deactivate words.
-- difficulty_level: 1=CVC/Easy  2=4-letter/Medium  3=5-letter+/Hard
-- ============================================================

CREATE TABLE IF NOT EXISTS public.spelling_words (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word             VARCHAR(50) NOT NULL,
  emoji            VARCHAR(10),
  hint             TEXT,
  difficulty_level INTEGER NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 3),
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast filtering
CREATE INDEX IF NOT EXISTS idx_spelling_words_active_level
  ON public.spelling_words (is_active, difficulty_level);

-- RLS
ALTER TABLE public.spelling_words ENABLE ROW LEVEL SECURITY;

-- Students/Parents: read active words only
CREATE POLICY "Read active spelling words" ON public.spelling_words
  FOR SELECT USING (is_active = TRUE);

-- Admin/Teacher: full management
CREATE POLICY "Admin teacher manage spelling words" ON public.spelling_words
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    )
  );

-- ============================================================
-- PHONICS ACTIVITY CONTENT TABLE
-- Manages content for PhonicsActivityScreen games.
-- game_type: 'blend' | 'rhyme' | 'segment'
-- difficulty_level: 1=Easy  2=Medium  3=Hard  NULL=All levels
--
-- JSONB structure per game_type:
--   blend:   { "phonemes": ["c","a","t"], "word": "cat", "emoji": "🐱" }
--   rhyme:   { "target": "cat", "options": ["bat","dog","sun"], "correct": "bat", "emoji": "🐱" }
--   segment: { "word": "cat", "phonemes": ["c","a","t"], "count": 3, "emoji": "🐱" }
-- ============================================================

CREATE TABLE IF NOT EXISTS public.phonics_activity_content (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type        VARCHAR(10) NOT NULL CHECK (game_type IN ('blend', 'rhyme', 'segment')),
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 3),
  data             JSONB NOT NULL,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phonics_activity_content_type_level
  ON public.phonics_activity_content (game_type, is_active, difficulty_level);

ALTER TABLE public.phonics_activity_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read active phonics activity content" ON public.phonics_activity_content
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admin teacher manage phonics activity content" ON public.phonics_activity_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    )
  );
