-- ============================================================
-- FIX: Create missing writing_practice table
-- Also enables RLS on writing_puzzles (was UNRESTRICTED)
--
-- Run in Supabase Dashboard → SQL Editor → New Query
-- ============================================================


-- ─── 1. Create writing_practice table ────────────────────────────────────────
-- Used by WritingScreen.js → supabase.from('writing_practice').select('*').order('label')
-- Falls back to A–Z if empty, so the table is optional content, but must exist.

CREATE TABLE IF NOT EXISTS public.writing_practice (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label      TEXT NOT NULL,           -- The letter or word to trace (e.g. 'A', 'cat')
  svg_path   TEXT,                    -- Optional: SVG path data for guided tracing
  category   TEXT DEFAULT 'letter',   -- 'letter' | 'word' | 'number'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_writing_practice_label
  ON public.writing_practice(label);

CREATE INDEX IF NOT EXISTS idx_writing_practice_category
  ON public.writing_practice(category);


-- ─── 2. Row Level Security ────────────────────────────────────────────────────
ALTER TABLE public.writing_practice ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can view writing practice items" ON public.writing_practice;
DROP POLICY IF EXISTS "Admins can manage writing practice items"             ON public.writing_practice;

-- All logged-in users (students, teachers, parents) can read
CREATE POLICY "Anyone authenticated can view writing practice items"
  ON public.writing_practice FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can insert / update / delete
CREATE POLICY "Admins can manage writing practice items"
  ON public.writing_practice FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ─── 3. Seed default A–Z letters (skips if already present) ──────────────────
INSERT INTO public.writing_practice (label, category) VALUES
  ('A','letter'),('B','letter'),('C','letter'),('D','letter'),
  ('E','letter'),('F','letter'),('G','letter'),('H','letter'),
  ('I','letter'),('J','letter'),('K','letter'),('L','letter'),
  ('M','letter'),('N','letter'),('O','letter'),('P','letter'),
  ('Q','letter'),('R','letter'),('S','letter'),('T','letter'),
  ('U','letter'),('V','letter'),('W','letter'),('X','letter'),
  ('Y','letter'),('Z','letter')
ON CONFLICT (label) DO NOTHING;


-- ─── 4. Secure writing_puzzles (was UNRESTRICTED / RLS off) ──────────────────
ALTER TABLE public.writing_puzzles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can view writing puzzles" ON public.writing_puzzles;
DROP POLICY IF EXISTS "Admins can manage writing puzzles"             ON public.writing_puzzles;

CREATE POLICY "Anyone authenticated can view writing puzzles"
  ON public.writing_puzzles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage writing puzzles"
  ON public.writing_puzzles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ─── Reload schema cache ──────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
