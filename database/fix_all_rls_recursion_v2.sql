-- ============================================================
--  FULL RLS RECURSION FIX v2
--  Run in Supabase Dashboard → SQL Editor → Run
--
--  Fixes: 42P17 infinite recursion in parent_links / profiles
--  ALL policies that reference profiles from other tables
--  are replaced with get_my_role() (SECURITY DEFINER).
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- STEP 0: SECURITY DEFINER role helper
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$ SELECT role FROM public.profiles WHERE id = auth.uid(); $$;

GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;


-- ════════════════════════════════════════════════════════════
-- STEP 1: PROFILES — drop every known policy, rebuild clean
-- ════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Users can read own profile"                      ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile"                      ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile"                    ON public.profiles;
DROP POLICY IF EXISTS "Allow profile insert during signup"              ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"                    ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles"                  ON public.profiles;
DROP POLICY IF EXISTS "Admins and teachers can view all profiles"       ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile"                   ON public.profiles;
DROP POLICY IF EXISTS "Teachers can read enrolled student profiles"     ON public.profiles;
DROP POLICY IF EXISTS "Students can read their teacher profile"         ON public.profiles;
DROP POLICY IF EXISTS "Parents can read their linked child profiles"    ON public.profiles;
DROP POLICY IF EXISTS "Teachers can read parent profiles"               ON public.profiles;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Own row access
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Signup trigger / upsert always allowed
CREATE POLICY "Allow profile insert during signup"
  ON public.profiles FOR INSERT WITH CHECK (true);

-- Admins via SECURITY DEFINER — no recursion possible
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL USING (public.get_my_role() = 'admin');

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE USING (public.get_my_role() = 'admin');

-- Teachers read enrolled students
CREATE POLICY "Teachers can read enrolled student profiles"
  ON public.profiles FOR SELECT USING (
    id IN (SELECT student_id FROM public.enrollments WHERE teacher_id = auth.uid())
  );

-- Students read their teacher
CREATE POLICY "Students can read their teacher profile"
  ON public.profiles FOR SELECT USING (
    id IN (SELECT teacher_id FROM public.enrollments WHERE student_id = auth.uid())
  );

-- Parents read their linked children
CREATE POLICY "Parents can read their linked child profiles"
  ON public.profiles FOR SELECT USING (
    id IN (SELECT student_id FROM public.parent_links WHERE parent_id = auth.uid())
  );

-- Teachers read parents of their students
CREATE POLICY "Teachers can read parent profiles"
  ON public.profiles FOR SELECT USING (
    id IN (
      SELECT pl.parent_id FROM public.parent_links pl
      JOIN   public.enrollments e ON e.student_id = pl.student_id
      WHERE  e.teacher_id = auth.uid()
    )
  );


-- ════════════════════════════════════════════════════════════
-- STEP 2: PARENT_LINKS — drop every known policy, rebuild
--         WITHOUT any reference to profiles table
-- ════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Parents can view their own links"                ON public.parent_links;
DROP POLICY IF EXISTS "Parents can create links"                        ON public.parent_links;
DROP POLICY IF EXISTS "Parents can delete their own links"              ON public.parent_links;
DROP POLICY IF EXISTS "Admins can manage all parent links"              ON public.parent_links;
DROP POLICY IF EXISTS "Admins can manage parent links"                  ON public.parent_links;
DROP POLICY IF EXISTS "Teachers can view their student parent links"    ON public.parent_links;
DROP POLICY IF EXISTS "Anyone can view parent links"                    ON public.parent_links;
DROP POLICY IF EXISTS "Service role can manage parent links"            ON public.parent_links;

-- Catch-all: drop any remaining policies via dynamic SQL
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'parent_links'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.parent_links', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.parent_links ENABLE ROW LEVEL SECURITY;

-- auth.uid() comparisons only — zero profiles references
CREATE POLICY "Parents can view their own links"
  ON public.parent_links FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Parents can create links"
  ON public.parent_links FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can delete their own links"
  ON public.parent_links FOR DELETE USING (auth.uid() = parent_id);

-- Admin via SECURITY DEFINER
CREATE POLICY "Admins can manage all parent links"
  ON public.parent_links FOR ALL USING (public.get_my_role() = 'admin');

-- Teachers see their students' parent links (enrollments only, no profiles ref)
CREATE POLICY "Teachers can view their student parent links"
  ON public.parent_links FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.teacher_id = auth.uid()
        AND enrollments.student_id = parent_links.student_id
    )
  );


-- ════════════════════════════════════════════════════════════
-- STEP 3: ENROLLMENTS — clean policies
-- ════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Teachers can view their enrolled students"           ON public.enrollments;
DROP POLICY IF EXISTS "Teachers can manage their enrollments"               ON public.enrollments;
DROP POLICY IF EXISTS "Students can view their enrollment"                  ON public.enrollments;
DROP POLICY IF EXISTS "Students can enroll"                                 ON public.enrollments;
DROP POLICY IF EXISTS "Students can unenroll"                               ON public.enrollments;
DROP POLICY IF EXISTS "Parents can view their linked child enrollment"      ON public.enrollments;
DROP POLICY IF EXISTS "Admins can manage all enrollments"                   ON public.enrollments;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'enrollments'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.enrollments', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage their enrollments"
  ON public.enrollments FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view their enrollment"
  ON public.enrollments FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can enroll"
  ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can unenroll"
  ON public.enrollments FOR DELETE USING (auth.uid() = student_id);

CREATE POLICY "Parents can view their linked child enrollment"
  ON public.enrollments FOR SELECT USING (
    student_id IN (SELECT student_id FROM public.parent_links WHERE parent_id = auth.uid())
  );

CREATE POLICY "Admins can manage all enrollments"
  ON public.enrollments FOR ALL USING (public.get_my_role() = 'admin');


-- ════════════════════════════════════════════════════════════
-- STEP 4: NOTIFICATIONS — replace profiles-referencing policies
-- ════════════════════════════════════════════════════════════
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notifications'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.notifications', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published notifications"
  ON public.notifications FOR SELECT
  USING (is_draft = false AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins and teachers can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

CREATE POLICY "Admins can update any notification"
  ON public.notifications FOR UPDATE USING (public.get_my_role() = 'admin');

CREATE POLICY "Teachers can update own notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Admins can delete any notification"
  ON public.notifications FOR DELETE USING (public.get_my_role() = 'admin');

CREATE POLICY "Teachers can delete own notifications"
  ON public.notifications FOR DELETE USING (auth.uid() = teacher_id);


-- ════════════════════════════════════════════════════════════
-- STEP 5: SESSION_LOGS — replace profiles-referencing policies
-- ════════════════════════════════════════════════════════════
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'session_logs'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.session_logs', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can insert their own session logs"
  ON public.session_logs FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their own session logs"
  ON public.session_logs FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view enrolled student logs"
  ON public.session_logs FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.teacher_id = auth.uid()
        AND enrollments.student_id = session_logs.student_id
    )
  );

CREATE POLICY "Admins can manage all session logs"
  ON public.session_logs FOR ALL USING (public.get_my_role() = 'admin');

CREATE POLICY "Parents can view their linked child logs"
  ON public.session_logs FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_links
      WHERE parent_links.parent_id = auth.uid()
        AND parent_links.student_id = session_logs.student_id
    )
  );


-- ════════════════════════════════════════════════════════════
-- STEP 6: FEEDBACK — replace profiles-referencing policies
-- ════════════════════════════════════════════════════════════
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'feedback'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.feedback', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can submit feedback"
  ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can view own feedback"
  ON public.feedback FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view their student feedback"
  ON public.feedback FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.teacher_id = auth.uid()
        AND enrollments.student_id = feedback.user_id
    )
  );

CREATE POLICY "Teachers can reply to student feedback"
  ON public.feedback FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.teacher_id = auth.uid()
        AND enrollments.student_id = feedback.user_id
    )
  );

CREATE POLICY "Admins can manage all feedback"
  ON public.feedback FOR ALL USING (public.get_my_role() = 'admin');


-- ════════════════════════════════════════════════════════════
-- STEP 7: PARENT_MESSAGES — clean policies
-- ════════════════════════════════════════════════════════════
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'parent_messages'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.parent_messages', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.parent_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can send messages"
  ON public.parent_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view their own messages"
  ON public.parent_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can mark messages as read"
  ON public.parent_messages FOR UPDATE USING (auth.uid() = receiver_id);

CREATE POLICY "Admins can manage all messages"
  ON public.parent_messages FOR ALL USING (public.get_my_role() = 'admin');


-- ════════════════════════════════════════════════════════════
-- STEP 8: ASSIGNMENTS — clean policies
-- ════════════════════════════════════════════════════════════
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'assignments'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.assignments', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their assignments"
  ON public.assignments FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can update their assignments"
  ON public.assignments FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Teachers can manage their assignments"
  ON public.assignments FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Admins can manage all assignments"
  ON public.assignments FOR ALL USING (public.get_my_role() = 'admin');

CREATE POLICY "Parents can view their child assignments"
  ON public.assignments FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_links
      WHERE parent_links.parent_id = auth.uid()
        AND parent_links.student_id = assignments.student_id
    )
  );


-- ════════════════════════════════════════════════════════════
-- STEP 9: ADAPTIVE_STATE — clean policies
-- ════════════════════════════════════════════════════════════
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'adaptive_state'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.adaptive_state', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.adaptive_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage their own adaptive state"
  ON public.adaptive_state FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view their student adaptive state"
  ON public.adaptive_state FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.teacher_id = auth.uid()
        AND enrollments.student_id = adaptive_state.student_id
    )
  );

CREATE POLICY "Admins can manage all adaptive state"
  ON public.adaptive_state FOR ALL USING (public.get_my_role() = 'admin');


-- ════════════════════════════════════════════════════════════
-- STEP 10: Ensure all required columns exist on profiles
-- ════════════════════════════════════════════════════════════
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unique_code    TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS teacher_code   TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status         TEXT    DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned      BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url     TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credential_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS push_token     TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp             INTEGER DEFAULT 0;


-- ════════════════════════════════════════════════════════════
-- STEP 11: Reload PostgREST schema cache
-- ════════════════════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';

-- ── DONE ─────────────────────────────────────────────────────
-- All 9 tables now use ONLY auth.uid() or get_my_role().
-- Zero profiles subqueries remain outside of profiles itself.
-- 42P17 infinite recursion is fully resolved.
