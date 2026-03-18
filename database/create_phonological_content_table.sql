-- ============================================================
-- PHONOLOGICAL CONTENT TABLE
-- Stores all content for PhonologicalAwarenessScreen tasks.
-- Admins can add/edit items from the admin panel.
-- task_type: 'syllable' | 'rime' | 'phoneme'
-- difficulty_level: 1=Easy  2=Medium  3=Hard  NULL=All levels
--
-- JSONB structure per task_type:
--   syllable: { "word": "cat",  "syllables": 1, "emoji": "🐱" }
--   rime:     { "target": "cat", "correct": "hat", "distractors": ["dog","sun"] }
--   phoneme:  { "word": "sun",  "position": "first", "answer": "s", "options": ["s","m","b"] }
-- ============================================================

CREATE TABLE IF NOT EXISTS public.phonological_content (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type        VARCHAR(20) NOT NULL CHECK (task_type IN ('syllable', 'rime', 'phoneme')),
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 3),  -- NULL = appears in all levels
  data             JSONB NOT NULL,
  is_active        BOOLEAN DEFAULT TRUE,
  created_by       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_phonological_task_type  ON public.phonological_content(task_type);
CREATE INDEX IF NOT EXISTS idx_phonological_difficulty ON public.phonological_content(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_phonological_active     ON public.phonological_content(is_active);

-- Enable RLS
ALTER TABLE public.phonological_content ENABLE ROW LEVEL SECURITY;

-- Everyone can read active content
CREATE POLICY "Anyone can read active phonological content" ON public.phonological_content
  FOR SELECT USING (is_active = TRUE);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage phonological content" ON public.phonological_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
