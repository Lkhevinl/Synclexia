-- ============================================================
-- SYNCLEXIA: Add teacher_code column for manual student enrollment
-- Run this in your Supabase SQL Editor (Dashboard → SQL → New query)
-- Safe to run on an existing project.
-- ============================================================

-- ─── 1. ADD teacher_code COLUMN ───
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS teacher_code TEXT;

-- ─── 2. UNIQUE CONSTRAINT ───
-- Only enforced where the column is not NULL.
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_teacher_code
  ON public.profiles(teacher_code)
  WHERE teacher_code IS NOT NULL;

-- ─── 3. BACKFILL EXISTING TEACHERS ───
-- Generate a unique 6-char code for every teacher that currently has none.
DO $$
DECLARE
  teacher_record RECORD;
  new_code TEXT;
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i INT;
  success BOOLEAN;
BEGIN
  FOR teacher_record IN
    SELECT id FROM public.profiles
    WHERE role = 'teacher' AND teacher_code IS NULL
  LOOP
    success := FALSE;
    WHILE NOT success LOOP
      -- Build a random 6-character uppercase alphanumeric code
      new_code := '';
      FOR i IN 1..6 LOOP
        new_code := new_code || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INT, 1);
      END LOOP;

      BEGIN
        UPDATE public.profiles SET teacher_code = new_code WHERE id = teacher_record.id;
        success := TRUE;
      EXCEPTION WHEN unique_violation THEN
        -- Collision — try again with a different code
        success := FALSE;
      END;
    END LOOP;
  END LOOP;
END $$;
