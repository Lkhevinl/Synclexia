-- ============================================================
-- FIX: All schema mismatches found in the Schema Visualizer
-- Run in Supabase Dashboard → SQL Editor → New Query
--
-- Issues fixed:
--  1. assignments: DB has "due_date" but the entire app uses "deadline"
--     → Add "deadline" column, migrate data from due_date, keep due_date
--  2. session_logs: DB uses "user_id" but app uses "student_id"
--     → Add "student_id" column and backfill (if not already done)
--  3. session_logs: missing columns (total, accuracy, duration_seconds,
--     xp_earned, details)
--  4. writing_puzzles: RLS was UNRESTRICTED → enable RLS + policies
--  5. profiles: missing RLS policies (teachers/parents/students cross-reads)
--  6. assignments: missing parent SELECT policy
--  7. feedback: no RLS policies at all → admins/teachers/students all blocked
--  8. adaptive_state: no RLS policies → students cannot upsert their state
--  9. parent_messages: no RLS + missing parent_id/student_id columns
-- ============================================================


-- ═══════════════════════════════════════════════════════════
-- 1. ASSIGNMENTS — add "deadline" column (app uses this name)
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;

-- Backfill: copy any data from due_date → deadline
UPDATE public.assignments
  SET deadline = due_date
  WHERE deadline IS NULL AND due_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_assignments_deadline
  ON public.assignments(deadline);

-- RLS: students and parents can view assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Parents can view their child assignments" ON public.assignments;
CREATE POLICY "Parents can view their child assignments"
  ON public.assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_links
      WHERE parent_links.parent_id = auth.uid()
        AND parent_links.student_id = assignments.student_id
    )
  );


-- ═══════════════════════════════════════════════════════════
-- 2. SESSION_LOGS — add student_id + missing columns
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.session_logs
  ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

UPDATE public.session_logs
  SET student_id = user_id
  WHERE student_id IS NULL AND user_id IS NOT NULL;

ALTER TABLE public.session_logs ADD COLUMN IF NOT EXISTS total            INTEGER      DEFAULT 0;
ALTER TABLE public.session_logs ADD COLUMN IF NOT EXISTS accuracy         DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.session_logs ADD COLUMN IF NOT EXISTS duration_seconds INTEGER      DEFAULT 0;
ALTER TABLE public.session_logs ADD COLUMN IF NOT EXISTS xp_earned        INTEGER      DEFAULT 0;
ALTER TABLE public.session_logs ADD COLUMN IF NOT EXISTS details          JSONB        DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_session_logs_student
  ON public.session_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_student_activity
  ON public.session_logs(student_id, activity_type);

ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can insert their own session logs" ON public.session_logs;
DROP POLICY IF EXISTS "Students can view their own session logs"   ON public.session_logs;
DROP POLICY IF EXISTS "Teachers can view enrolled student logs"    ON public.session_logs;
DROP POLICY IF EXISTS "Admins can view all session logs"           ON public.session_logs;
DROP POLICY IF EXISTS "Parents can view their linked child logs"   ON public.session_logs;

CREATE POLICY "Students can insert their own session logs" ON public.session_logs
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their own session logs" ON public.session_logs
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view enrolled student logs" ON public.session_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.teacher_id = auth.uid()
        AND enrollments.student_id = session_logs.student_id
    )
  );

CREATE POLICY "Admins can view all session logs" ON public.session_logs
  FOR SELECT USING (public.get_my_role() = 'admin');

CREATE POLICY "Parents can view their linked child logs" ON public.session_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_links
      WHERE parent_links.parent_id = auth.uid()
        AND parent_links.student_id = session_logs.student_id
    )
  );


-- ═══════════════════════════════════════════════════════════
-- 3. PROFILES — cross-role read policies
--    NOTE: Run fix_infinite_recursion.sql FIRST if you see
--    error 42P17 (infinite recursion in profiles policy).
--    That script creates get_my_role() and wipes recursive
--    pre-existing policies before adding these safe ones.
-- ═══════════════════════════════════════════════════════════

-- Safety: create the SECURITY DEFINER function if not yet done
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Teachers can read enrolled student profiles" ON public.profiles;
CREATE POLICY "Teachers can read enrolled student profiles"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT student_id FROM public.enrollments
      WHERE teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Parents can read their linked child profiles" ON public.profiles;
CREATE POLICY "Parents can read their linked child profiles"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT student_id FROM public.parent_links
      WHERE parent_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can read their teacher profile" ON public.profiles;
CREATE POLICY "Students can read their teacher profile"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT teacher_id FROM public.enrollments
      WHERE student_id = auth.uid()
    )
  );


-- ═══════════════════════════════════════════════════════════
-- 4. WRITING_PUZZLES — enable RLS (was UNRESTRICTED)
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.writing_puzzles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can view writing puzzles" ON public.writing_puzzles;
DROP POLICY IF EXISTS "Admins can manage writing puzzles"             ON public.writing_puzzles;

CREATE POLICY "Anyone authenticated can view writing puzzles"
  ON public.writing_puzzles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage writing puzzles"
  ON public.writing_puzzles FOR ALL
  USING (public.get_my_role() = 'admin');


-- ═══════════════════════════════════════════════════════════
-- 5. FEEDBACK — add complete RLS
--    AdminFeedbackScreen: reads all feedback
--    TeacherFeedbackScreen: reads feedback from their students
--    SupportScreen: students insert feedback
--    DashboardScreen: student reads own unread reply count
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Add missing status column used by AdminFeedbackScreen.markResolved()
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';

DROP POLICY IF EXISTS "Students can submit feedback"              ON public.feedback;
DROP POLICY IF EXISTS "Students can view own feedback"           ON public.feedback;
DROP POLICY IF EXISTS "Teachers can view their student feedback" ON public.feedback;
DROP POLICY IF EXISTS "Teachers can reply to student feedback"   ON public.feedback;
DROP POLICY IF EXISTS "Admins can manage all feedback"           ON public.feedback;

-- Students: insert own + read own (for unread reply count)
CREATE POLICY "Students can submit feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can view own feedback"
  ON public.feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Teachers: read feedback from their enrolled students, update to add reply
CREATE POLICY "Teachers can view their student feedback"
  ON public.feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.teacher_id = auth.uid()
        AND enrollments.student_id = feedback.user_id
    )
  );

CREATE POLICY "Teachers can reply to student feedback"
  ON public.feedback FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.teacher_id = auth.uid()
        AND enrollments.student_id = feedback.user_id
    )
  );

-- Students can update own feedback to clear has_unread_reply
CREATE POLICY "Students can update own feedback"
  ON public.feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins: full access
CREATE POLICY "Admins can manage all feedback"
  ON public.feedback FOR ALL
  USING (public.get_my_role() = 'admin');


-- ═══════════════════════════════════════════════════════════
-- 6. ADAPTIVE_STATE — add RLS (currently no policies)
--    adaptiveEngine.js: students read/upsert their own state
--    Teachers/admins read student states for progress screens
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.adaptive_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can manage own adaptive state"    ON public.adaptive_state;
DROP POLICY IF EXISTS "Teachers can view enrolled student states" ON public.adaptive_state;
DROP POLICY IF EXISTS "Admins can view all adaptive states"       ON public.adaptive_state;

CREATE POLICY "Students can manage own adaptive state"
  ON public.adaptive_state FOR ALL
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can view enrolled student states"
  ON public.adaptive_state FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.teacher_id = auth.uid()
        AND enrollments.student_id = adaptive_state.student_id
    )
  );

CREATE POLICY "Admins can view all adaptive states"
  ON public.adaptive_state FOR SELECT
  USING (public.get_my_role() = 'admin');


-- ═══════════════════════════════════════════════════════════
-- 7. PARENT_MESSAGES — add missing columns + RLS
--    ParentMessagesScreen inserts: sender_id, receiver_id,
--    parent_id, student_id, message, is_read
--    But DB only has: sender_id, receiver_id, message, is_read
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.parent_messages ADD COLUMN IF NOT EXISTS parent_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.parent_messages ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.parent_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can send messages"          ON public.parent_messages;
DROP POLICY IF EXISTS "Users can view own messages"      ON public.parent_messages;
DROP POLICY IF EXISTS "Users can mark messages as read"  ON public.parent_messages;

-- Anyone authenticated can send a message (sender_id = auth.uid())
CREATE POLICY "Users can send messages"
  ON public.parent_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Participants can read the conversation (sender or receiver)
CREATE POLICY "Users can view own messages"
  ON public.parent_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Receiver can mark as read
CREATE POLICY "Users can mark messages as read"
  ON public.parent_messages FOR UPDATE
  USING (auth.uid() = receiver_id);


-- ═══════════════════════════════════════════════════════════
-- Reload schema cache
-- ═══════════════════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';

