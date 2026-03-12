-- ============================================================
--  COMPLETE RLS RECURSION FIX v3 — BREAKS ALL CIRCULAR LOOPS
--  Run in Supabase Dashboard → SQL Editor → Run
--
--  Root cause of 42P17 loop:
--    profiles policy reads enrollments
--    → enrollments policy reads parent_links
--    → parent_links policy reads enrollments  ← LOOP
--
--  Solution: SECURITY DEFINER wrapper functions bypass RLS,
--  breaking every circular reference between tables.
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- STEP 0: SECURITY DEFINER helper functions
--   These run as the DB owner and bypass RLS entirely,
--   so they can never trigger recursive policy checks.
-- ════════════════════════════════════════════════════════════

-- Role lookup (used by admin policies)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$ SELECT role FROM public.profiles WHERE id = auth.uid(); $$;

-- Is the current user a teacher of this student?
-- Used in parent_links policies to avoid reading enrollments via RLS
CREATE OR REPLACE FUNCTION public.is_teacher_of_student(student_uuid uuid)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE teacher_id = auth.uid() AND student_id = student_uuid
  );
$$;

-- Is this student a child of the current user (parent)?
-- Used in enrollments policies to avoid reading parent_links via RLS
CREATE OR REPLACE FUNCTION public.is_my_child(student_uuid uuid)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parent_links
    WHERE parent_id = auth.uid() AND student_id = student_uuid
  );
$$;

-- Is this person a parent of a student in the current teacher's class?
-- Used in profiles policies to avoid cross-table joins triggering RLS
CREATE OR REPLACE FUNCTION public.is_parent_of_my_student(parent_uuid uuid)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parent_links pl
    JOIN   public.enrollments e ON e.student_id = pl.student_id
    WHERE  pl.parent_id = parent_uuid AND e.teacher_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_my_role()                   TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_teacher_of_student(uuid)     TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_my_child(uuid)               TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_parent_of_my_student(uuid)   TO authenticated;


-- ════════════════════════════════════════════════════════════
-- STEP 1: PROFILES — drop ALL, rebuild with SECURITY DEFINER
-- ════════════════════════════════════════════════════════════
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Own row always accessible
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow profile insert during signup"
  ON public.profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Admin via SECURITY DEFINER — no recursion
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL USING (public.get_my_role() = 'admin');

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE USING (public.get_my_role() = 'admin');

-- Teachers read their enrolled students
-- (enrollments policies use only auth.uid() — safe)
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
-- (parent_links policies use only auth.uid() — safe)
CREATE POLICY "Parents can read their linked child profiles"
  ON public.profiles FOR SELECT USING (
    id IN (SELECT student_id FROM public.parent_links WHERE parent_id = auth.uid())
  );

-- Teachers read parents of their students — SECURITY DEFINER, no cross-table loop
CREATE POLICY "Teachers can read parent profiles"
  ON public.profiles FOR SELECT USING (public.is_parent_of_my_student(id));


-- ════════════════════════════════════════════════════════════
-- STEP 2: PARENT_LINKS — drop ALL, rebuild
--   "Teachers can view..." now uses is_teacher_of_student()
--   which reads enrollments via SECURITY DEFINER (no RLS)
--   → breaks the parent_links ↔ enrollments loop
-- ════════════════════════════════════════════════════════════
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

CREATE POLICY "Parents can view their own links"
  ON public.parent_links FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Parents can create links"
  ON public.parent_links FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can delete their own links"
  ON public.parent_links FOR DELETE USING (auth.uid() = parent_id);

CREATE POLICY "Admins can manage all parent links"
  ON public.parent_links FOR ALL USING (public.get_my_role() = 'admin');

-- SECURITY DEFINER: reads enrollments without RLS → no loop
CREATE POLICY "Teachers can view their student parent links"
  ON public.parent_links FOR SELECT
  USING (public.is_teacher_of_student(student_id));


-- ════════════════════════════════════════════════════════════
-- STEP 3: ENROLLMENTS — drop ALL, rebuild
--   "Parents can view..." now uses is_my_child()
--   which reads parent_links via SECURITY DEFINER (no RLS)
--   → breaks the enrollments ↔ parent_links loop
-- ════════════════════════════════════════════════════════════
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

-- SECURITY DEFINER: reads parent_links without RLS → no loop
CREATE POLICY "Parents can view their linked child enrollment"
  ON public.enrollments FOR SELECT USING (public.is_my_child(student_id));

CREATE POLICY "Admins can manage all enrollments"
  ON public.enrollments FOR ALL USING (public.get_my_role() = 'admin');


-- ════════════════════════════════════════════════════════════
-- STEP 4: NOTIFICATIONS
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
-- STEP 5: SESSION_LOGS
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
  ON public.session_logs FOR SELECT USING (public.is_teacher_of_student(student_id));

CREATE POLICY "Admins can manage all session logs"
  ON public.session_logs FOR ALL USING (public.get_my_role() = 'admin');

CREATE POLICY "Parents can view their linked child logs"
  ON public.session_logs FOR SELECT USING (public.is_my_child(student_id));


-- ════════════════════════════════════════════════════════════
-- STEP 6: FEEDBACK
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
  ON public.feedback FOR SELECT USING (public.is_teacher_of_student(user_id));

CREATE POLICY "Teachers can reply to student feedback"
  ON public.feedback FOR UPDATE USING (public.is_teacher_of_student(user_id));

CREATE POLICY "Admins can manage all feedback"
  ON public.feedback FOR ALL USING (public.get_my_role() = 'admin');


-- ════════════════════════════════════════════════════════════
-- STEP 7: PARENT_MESSAGES
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
-- STEP 8: ASSIGNMENTS
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
  ON public.assignments FOR SELECT USING (public.is_my_child(student_id));


-- ════════════════════════════════════════════════════════════
-- STEP 9: ADAPTIVE_STATE
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
  ON public.adaptive_state FOR SELECT USING (public.is_teacher_of_student(student_id));

CREATE POLICY "Admins can manage all adaptive state"
  ON public.adaptive_state FOR ALL USING (public.get_my_role() = 'admin');


-- ════════════════════════════════════════════════════════════
-- STEP 10: Ensure all required columns exist
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
-- The full recursion chain is now broken:
--   parent_links → is_teacher_of_student() [SECURITY DEFINER]
--   enrollments  → is_my_child()           [SECURITY DEFINER]
--   profiles     → is_parent_of_my_student() [SECURITY DEFINER]
-- None of these functions trigger RLS, so 42P17 is impossible.
