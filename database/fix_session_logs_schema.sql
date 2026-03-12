-- ============================================================
-- FIX: session_logs schema mismatch
--
-- Problem: The DB table was created with 'user_id' but the entire
-- app codebase uses 'student_id'. Several required columns are also
-- missing. This script adds all missing columns and backfills data.
--
-- Run in Supabase Dashboard → SQL Editor → New Query
-- SAFE to run multiple times (all are IF NOT EXISTS / DO NOTHING)
-- ============================================================


-- ─── 1. Add student_id column (what the app actually uses) ────────────────────
ALTER TABLE public.session_logs
  ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Backfill: copy user_id → student_id for any existing rows
UPDATE public.session_logs
  SET student_id = user_id
  WHERE student_id IS NULL AND user_id IS NOT NULL;


-- ─── 2. Add missing columns ───────────────────────────────────────────────────
ALTER TABLE public.session_logs ADD COLUMN IF NOT EXISTS total            INTEGER     DEFAULT 0;
ALTER TABLE public.session_logs ADD COLUMN IF NOT EXISTS accuracy         DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.session_logs ADD COLUMN IF NOT EXISTS duration_seconds INTEGER     DEFAULT 0;
ALTER TABLE public.session_logs ADD COLUMN IF NOT EXISTS xp_earned        INTEGER     DEFAULT 0;
ALTER TABLE public.session_logs ADD COLUMN IF NOT EXISTS details          JSONB       DEFAULT '{}';


-- ─── 3. Indexes for student_id ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_session_logs_student          ON public.session_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_student_activity ON public.session_logs(student_id, activity_type);


-- ─── 4. Fix RLS policies to use student_id ────────────────────────────────────
ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can insert their own session logs" ON public.session_logs;
DROP POLICY IF EXISTS "Students can view their own session logs"   ON public.session_logs;
DROP POLICY IF EXISTS "Teachers can view enrolled student logs"    ON public.session_logs;
DROP POLICY IF EXISTS "Admins can view all session logs"          ON public.session_logs;
DROP POLICY IF EXISTS "Parents can view their linked child logs"  ON public.session_logs;

-- Students insert/view their own logs
CREATE POLICY "Students can insert their own session logs" ON public.session_logs
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their own session logs" ON public.session_logs
  FOR SELECT USING (auth.uid() = student_id);

-- Teachers can view logs of enrolled students
CREATE POLICY "Teachers can view enrolled student logs" ON public.session_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.teacher_id = auth.uid()
        AND enrollments.student_id = session_logs.student_id
    )
  );

-- Admins can view all
CREATE POLICY "Admins can view all session logs" ON public.session_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Parents can view their linked child's logs
CREATE POLICY "Parents can view their linked child logs" ON public.session_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_links
      WHERE parent_links.parent_id = auth.uid()
        AND parent_links.student_id = session_logs.student_id
    )
  );


-- ─── Reload schema cache ──────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
