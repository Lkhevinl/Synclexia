-- ============================================================
-- MASTER FIX: All database issues in one file
-- Run this ONE file in Supabase Dashboard → SQL Editor
--
-- Fixes:
--   1. Infinite recursion in profiles RLS (42P17 error / 500s)
--   2. Broken find_student_by_code() RPC (references non-existent level column)
--   3. Missing unique_code on existing students (parent linking fails)
--   4. Missing is_primary column + old UNIQUE constraint on enrollments
--   5. Trigger not setting unique_code for new students
--   6. All notification/session_logs/feedback/adaptive_state policies
--      that reference profiles causing cascading 500s
--   7. Missing deadline column on assignments
--   8. Missing student_id + columns on session_logs
--   9. Missing RLS on feedback, adaptive_state, parent_messages, writing_puzzles
-- ============================================================


-- ═══════════════════════════════════════════════════════════
-- 0. CREATE MISSING TABLES (must exist before any policies
--    reference them — otherwise the whole script fails)
-- ═══════════════════════════════════════════════════════════

-- parent_links: maps a parent account to their child student(s)
CREATE TABLE IF NOT EXISTS public.parent_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_parent_student UNIQUE(parent_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_parent_links_parent  ON public.parent_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_links_student ON public.parent_links(student_id);

-- parent_messages: messages between parents and teachers
CREATE TABLE IF NOT EXISTS public.parent_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_parent_messages_sender   ON public.parent_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_parent_messages_receiver ON public.parent_messages(receiver_id);

-- adaptive_state: per-student adaptive difficulty state
CREATE TABLE IF NOT EXISTS public.adaptive_state (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type  VARCHAR(60) NOT NULL,
  current_level  INTEGER NOT NULL DEFAULT 1 CHECK (current_level BETWEEN 1 AND 3),
  attempts       INTEGER NOT NULL DEFAULT 0,
  correct_streak INTEGER NOT NULL DEFAULT 0,
  last_updated   TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_adaptive_state UNIQUE(student_id, activity_type)
);
CREATE INDEX IF NOT EXISTS idx_adaptive_state_student ON public.adaptive_state(student_id);


-- ═══════════════════════════════════════════════════════════
-- 1. SECURITY DEFINER role-lookup (breaks infinite recursion)
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;


-- ═══════════════════════════════════════════════════════════
-- 2. Drop ALL existing profiles policies (including recursive ones)
-- ═══════════════════════════════════════════════════════════
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
  END LOOP;
END;
$$;


-- ═══════════════════════════════════════════════════════════
-- 3. Clean profiles policies (NONE reference profiles = no recursion)
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Teachers can read enrolled student profiles"
  ON public.profiles FOR SELECT
  USING (
    id IN (SELECT student_id FROM public.enrollments WHERE teacher_id = auth.uid())
  );

CREATE POLICY "Parents can read their linked child profiles"
  ON public.profiles FOR SELECT
  USING (
    id IN (SELECT student_id FROM public.parent_links WHERE parent_id = auth.uid())
  );

-- parent_links: clean RLS (no profiles subqueries = no recursion)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'parent_links'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.parent_links', r.policyname);
  END LOOP;
END;
$$;

CREATE POLICY "Parents can view their own links"
  ON public.parent_links FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can create links"
  ON public.parent_links FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Admins can manage all parent links"
  ON public.parent_links FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Teachers can view their student parent links"
  ON public.parent_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.teacher_id = auth.uid()
        AND enrollments.student_id = parent_links.student_id
    )
  );

CREATE POLICY "Students can read their teacher profile"
  ON public.profiles FOR SELECT
  USING (
    id IN (SELECT teacher_id FROM public.enrollments WHERE student_id = auth.uid())
  );


-- ═══════════════════════════════════════════════════════════
-- 4. Fix find_student_by_code() — compute level, don't read it
--    (profiles has NO level column — it's calculated client-side)
-- ═══════════════════════════════════════════════════════════
DROP FUNCTION IF EXISTS public.find_student_by_code(text);

CREATE OR REPLACE FUNCTION public.find_student_by_code(lookup_code text)
RETURNS TABLE (
  id          uuid,
  full_name   text,
  email       text,
  xp          integer,
  level       integer,
  unique_code text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT
      p.id,
      p.full_name,
      p.email,
      p.xp,
      (FLOOR(p.xp / 100) + 1)::integer AS level,
      p.unique_code
    FROM public.profiles p
    WHERE p.role = 'student'
      AND p.unique_code = UPPER(TRIM(lookup_code))
    LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.find_student_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_student_by_code(text) TO authenticated;


-- ═══════════════════════════════════════════════════════════
-- 5. Backfill unique_code for students who don't have one
-- ═══════════════════════════════════════════════════════════
UPDATE public.profiles
SET unique_code = UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6))
WHERE role = 'student' AND (unique_code IS NULL OR unique_code = '');

-- Unique index (if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_unique_code
  ON public.profiles(unique_code) WHERE unique_code IS NOT NULL;


-- ═══════════════════════════════════════════════════════════
-- 6. Fix handle_new_user() trigger — generate unique_code for students
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _role   TEXT;
  _status TEXT;
  _code   TEXT;
BEGIN
  _role   := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  _status := CASE WHEN _role = 'teacher' THEN 'pending' ELSE 'active' END;

  -- Generate a 6-char unique code for students
  IF _role = 'student' THEN
    _code := UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6));
  ELSE
    _code := NULL;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, status, unique_code)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    _role,
    _status,
    _code
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name   = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role        = COALESCE(EXCLUDED.role, profiles.role),
    status      = COALESCE(EXCLUDED.status, profiles.status),
    unique_code = COALESCE(profiles.unique_code, EXCLUDED.unique_code);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '[handle_new_user] Could not create profile for user %: % (SQLSTATE %)',
      NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ═══════════════════════════════════════════════════════════
-- 7. Fix enrollments table — add is_primary, drop old UNIQUE
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT TRUE;
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS unique_student_enrollment;
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS enrollments_student_id_key;

-- Allow multi-teacher enrollment (one entry per student-teacher pair)
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_student_teacher
  ON public.enrollments(student_id, teacher_id);

-- One primary teacher per student
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_primary
  ON public.enrollments(student_id) WHERE is_primary = TRUE;


-- ═══════════════════════════════════════════════════════════
-- 8. Fix assignments — add deadline column
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;

-- Only backfill from due_date if that column exists (it may not)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'assignments'
      AND column_name  = 'due_date'
  ) THEN
    UPDATE public.assignments SET deadline = due_date
      WHERE deadline IS NULL AND due_date IS NOT NULL;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_assignments_deadline
  ON public.assignments(deadline);

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
-- 9. Fix session_logs — add student_id + missing columns
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.session_logs
  ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Only backfill from user_id if that column exists (it may not)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'session_logs'
      AND column_name  = 'user_id'
  ) THEN
    UPDATE public.session_logs SET student_id = user_id
      WHERE student_id IS NULL AND user_id IS NOT NULL;
  END IF;
END;
$$;

ALTER TABLE public.session_logs ADD COLUMN IF NOT EXISTS total            INTEGER      DEFAULT 0;
ALTER TABLE public.session_logs ADD COLUMN IF NOT EXISTS accuracy         DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.session_logs ADD COLUMN IF NOT EXISTS duration_seconds INTEGER      DEFAULT 0;
ALTER TABLE public.session_logs ADD COLUMN IF NOT EXISTS xp_earned        INTEGER      DEFAULT 0;
ALTER TABLE public.session_logs ADD COLUMN IF NOT EXISTS details          JSONB        DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_session_logs_student
  ON public.session_logs(student_id);

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
-- 10. Fix notifications — add missing columns + fix policies
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_draft    BOOLEAN DEFAULT FALSE;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS target_role TEXT    DEFAULT 'all';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS teacher_id  UUID    REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Fix notifications policies (remove profiles subqueries)

DROP POLICY IF EXISTS "Admins and teachers can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can update any notification"           ON public.notifications;
DROP POLICY IF EXISTS "Teachers can update own notifications"        ON public.notifications;
DROP POLICY IF EXISTS "Admins can delete any notification"           ON public.notifications;
DROP POLICY IF EXISTS "Teachers can delete own notifications"        ON public.notifications;
DROP POLICY IF EXISTS "Students see teacher + global notifications"  ON public.notifications;

CREATE POLICY "Admins and teachers can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.get_my_role() IN ('admin', 'teacher'));

CREATE POLICY "Admins can update any notification"
  ON public.notifications FOR UPDATE
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Teachers can update own notifications"
  ON public.notifications FOR UPDATE
  USING (teacher_id = auth.uid() AND public.get_my_role() = 'teacher');

CREATE POLICY "Admins can delete any notification"
  ON public.notifications FOR DELETE
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Teachers can delete own notifications"
  ON public.notifications FOR DELETE
  USING (teacher_id = auth.uid() AND public.get_my_role() = 'teacher');


-- ═══════════════════════════════════════════════════════════
-- 11. Fix writing_puzzles RLS (only if table exists)
-- ═══════════════════════════════════════════════════════════
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'writing_puzzles'
  ) THEN
    EXECUTE 'ALTER TABLE public.writing_puzzles ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone authenticated can view writing puzzles" ON public.writing_puzzles';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage writing puzzles" ON public.writing_puzzles';
    EXECUTE $policy$
      CREATE POLICY "Anyone authenticated can view writing puzzles"
        ON public.writing_puzzles FOR SELECT
        USING (auth.uid() IS NOT NULL)
    $policy$;
    EXECUTE $policy$
      CREATE POLICY "Admins can manage writing puzzles"
        ON public.writing_puzzles FOR ALL
        USING (public.get_my_role() = 'admin')
    $policy$;
  END IF;
END;
$$;


-- ═══════════════════════════════════════════════════════════
-- 12. Fix feedback — add status column + RLS
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';

DROP POLICY IF EXISTS "Students can submit feedback"              ON public.feedback;
DROP POLICY IF EXISTS "Students can view own feedback"           ON public.feedback;
DROP POLICY IF EXISTS "Students can update own feedback"         ON public.feedback;
DROP POLICY IF EXISTS "Teachers can view their student feedback" ON public.feedback;
DROP POLICY IF EXISTS "Teachers can reply to student feedback"   ON public.feedback;
DROP POLICY IF EXISTS "Admins can manage all feedback"           ON public.feedback;

CREATE POLICY "Students can submit feedback"
  ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can view own feedback"
  ON public.feedback FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can update own feedback"
  ON public.feedback FOR UPDATE USING (auth.uid() = user_id);

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
  ON public.feedback FOR ALL
  USING (public.get_my_role() = 'admin');


-- ═══════════════════════════════════════════════════════════
-- 13. Fix adaptive_state RLS
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.adaptive_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can manage own adaptive state"    ON public.adaptive_state;
DROP POLICY IF EXISTS "Teachers can view enrolled student states" ON public.adaptive_state;
DROP POLICY IF EXISTS "Admins can view all adaptive states"       ON public.adaptive_state;

CREATE POLICY "Students can manage own adaptive state"
  ON public.adaptive_state FOR ALL
  USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can view enrolled student states"
  ON public.adaptive_state FOR SELECT USING (
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
-- 14. Fix parent_messages — ensure columns exist + RLS
--     (table already created in step 0 above)
-- ═══════════════════════════════════════════════════════════
-- Ensure columns exist (no-ops if already added by step 0)
ALTER TABLE public.parent_messages ADD COLUMN IF NOT EXISTS parent_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.parent_messages ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.parent_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can send messages"         ON public.parent_messages;
DROP POLICY IF EXISTS "Users can view own messages"     ON public.parent_messages;
DROP POLICY IF EXISTS "Users can mark messages as read" ON public.parent_messages;

CREATE POLICY "Users can send messages"
  ON public.parent_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view own messages"
  ON public.parent_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can mark messages as read"
  ON public.parent_messages FOR UPDATE USING (auth.uid() = receiver_id);


-- ═══════════════════════════════════════════════════════════
-- 15. Fix writing_practice admin policy (if table exists)
-- ═══════════════════════════════════════════════════════════
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'writing_practice'
  ) THEN
    DROP POLICY IF EXISTS "Admins can manage writing practice" ON public.writing_practice;
    EXECUTE $policy$
      CREATE POLICY "Admins can manage writing practice"
        ON public.writing_practice FOR ALL
        USING (public.get_my_role() = 'admin')
    $policy$;
  END IF;
END;
$$;


-- ═══════════════════════════════════════════════════════════
-- Reload PostgREST schema cache
-- ═══════════════════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';
