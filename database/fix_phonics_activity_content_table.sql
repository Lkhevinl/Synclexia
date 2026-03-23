-- Fix Phonics Activity Content Table

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

-- Create indexes
CREATE INDEX idx_phonics_activity_content_type_level ON public.phonics_activity_content (game_type, is_active, difficulty_level);
CREATE INDEX idx_phonics_activity_created_by ON public.phonics_activity_content (created_by);

-- Enable RLS
ALTER TABLE public.phonics_activity_content ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active content
CREATE POLICY "Read active phonics activity content" ON public.phonics_activity_content
  FOR SELECT
  USING (is_active = TRUE);

-- Policy: Only admins can manage
CREATE POLICY "Admins manage phonics activity content" ON public.phonics_activity_content
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

DROP TRIGGER IF EXISTS update_phonics_activity_updated_at ON public.phonics_activity_content;
CREATE TRIGGER update_phonics_activity_updated_at
  BEFORE UPDATE ON public.phonics_activity_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
