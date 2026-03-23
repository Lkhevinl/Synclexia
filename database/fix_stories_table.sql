-- Fix Stories Table
-- Drop existing table if needed and recreate with correct schema

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

-- Create indexes for better query performance
CREATE INDEX idx_stories_active_level ON public.stories (is_active, level);
CREATE INDEX idx_stories_created_by ON public.stories (created_by);

-- Enable Row Level Security
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read active stories
CREATE POLICY "Read active stories" ON public.stories
  FOR SELECT
  USING (is_active = TRUE);

-- Policy: Admins can manage all stories
CREATE POLICY "Admins manage stories" ON public.stories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Teachers can manage stories they created
CREATE POLICY "Teachers manage own stories" ON public.stories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
    AND created_by = auth.uid()
  );

-- Create or replace trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_stories_updated_at ON public.stories;
CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
