-- Fix Phonics Items Table
-- Drop existing table if needed and recreate with correct schema

DROP TABLE IF EXISTS public.phonics_items CASCADE;

-- Create the function for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the table
CREATE TABLE public.phonics_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label            VARCHAR(10) NOT NULL UNIQUE,
  icon             VARCHAR(10),
  bg_color         VARCHAR(7),
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.phonics_items ENABLE ROW LEVEL SECURITY;

-- Policy: All can read active phonics items
CREATE POLICY "Read active phonics items" ON public.phonics_items
  FOR SELECT
  USING (is_active = TRUE);

-- Policy: Only admins can insert/update/delete
CREATE POLICY "Admins manage phonics items" ON public.phonics_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX idx_phonics_items_active ON public.phonics_items (is_active);
CREATE INDEX idx_phonics_items_label ON public.phonics_items (label);
CREATE INDEX idx_phonics_items_created_by ON public.phonics_items (created_by);

-- Create trigger
DROP TRIGGER IF EXISTS update_phonics_items_updated_at ON public.phonics_items;
CREATE TRIGGER update_phonics_items_updated_at
  BEFORE UPDATE ON public.phonics_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default data only if table is empty
INSERT INTO public.phonics_items (label, icon, bg_color, created_by)
SELECT 'ba', '🔤', '#4FC3F7', (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_items WHERE label = 'ba');

INSERT INTO public.phonics_items (label, icon, bg_color, created_by)
SELECT 'ca', '🔤', '#81C784', (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_items WHERE label = 'ca');

INSERT INTO public.phonics_items (label, icon, bg_color, created_by)
SELECT 'ch', '🔤', '#4DD0E1', (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_items WHERE label = 'ch');

INSERT INTO public.phonics_items (label, icon, bg_color, created_by)
SELECT 'sh', '🔤', '#AED581', (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_items WHERE label = 'sh');

INSERT INTO public.phonics_items (label, icon, bg_color, created_by)
SELECT 'th', '🔤', '#FFCC02', (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_items WHERE label = 'th');
