-- Fix Phonological Content Table

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

-- Create indexes
CREATE INDEX idx_phonological_task_type ON public.phonological_content(task_type);
CREATE INDEX idx_phonological_difficulty ON public.phonological_content(difficulty_level);
CREATE INDEX idx_phonological_active ON public.phonological_content(is_active);
CREATE INDEX idx_phonological_created_by ON public.phonological_content(created_by);

-- Enable RLS
ALTER TABLE public.phonological_content ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active content
CREATE POLICY "Read active phonological content" ON public.phonological_content
  FOR SELECT
  USING (is_active = TRUE);

-- Policy: Only admins can manage
CREATE POLICY "Admins manage phonological content" ON public.phonological_content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
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

DROP TRIGGER IF EXISTS update_phonological_content_updated_at ON public.phonological_content;
CREATE TRIGGER update_phonological_content_updated_at
  BEFORE UPDATE ON public.phonological_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
