-- ============================================================
-- SYNCLEXIA: Fix assignments table — add missing columns + fix RLS
-- Run this in Supabase SQL Editor.
-- ============================================================

-- ─── 1. ADD MISSING COLUMNS ───
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS difficulty_level INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS target_count     INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS notes            TEXT;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS deadline         TIMESTAMPTZ;

-- ─── 2. ENSURE UNIQUE CONSTRAINT EXISTS ───
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_assignment' AND conrelid = 'public.assignments'::regclass
  ) THEN
    ALTER TABLE public.assignments
      ADD CONSTRAINT unique_assignment UNIQUE(teacher_id, student_id, activity_type);
  END IF;
END $$;

-- ─── 3. FIX RLS — explicit INSERT + UPDATE policies for teachers ───
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can manage assignments" ON public.assignments;
CREATE POLICY "Teachers can manage assignments" ON public.assignments
  FOR ALL
  USING  (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can view their assignments" ON public.assignments;
CREATE POLICY "Teachers can view their assignments" ON public.assignments
  FOR SELECT USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Students can view their assignments" ON public.assignments;
CREATE POLICY "Students can view their assignments" ON public.assignments
  FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update completion status" ON public.assignments;
CREATE POLICY "Students can update completion status" ON public.assignments
  FOR UPDATE
  USING     (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);
