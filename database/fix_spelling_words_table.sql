-- Fix Spelling Words Table
-- Drop existing table if needed and recreate with correct schema

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

-- Create indexes
CREATE INDEX idx_spelling_words_active_level ON public.spelling_words (is_active, difficulty_level);
CREATE INDEX idx_spelling_words_created_by ON public.spelling_words (created_by);

-- Enable RLS
ALTER TABLE public.spelling_words ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active words
CREATE POLICY "Read active spelling words" ON public.spelling_words
  FOR SELECT
  USING (is_active = TRUE);

-- Policy: Only admins can manage
CREATE POLICY "Admins manage spelling words" ON public.spelling_words
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_spelling_words_updated_at ON public.spelling_words;
CREATE TRIGGER update_spelling_words_updated_at
  BEFORE UPDATE ON public.spelling_words
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
