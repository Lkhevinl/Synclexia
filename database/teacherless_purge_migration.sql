-- ============================================================
-- SYNCLEXIA — Teacherless purge migration (idempotent)
--
-- Goal:
--   Remove teacher/enrollment/assignment/messaging DB artifacts and
--   rebuild RLS/policies for the teacherless app (student/parent/admin).
--
-- Safe to run multiple times.
-- Run in Supabase Dashboard → SQL Editor.
-- ============================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────
-- 0) Normalize legacy data (avoid constraint failures)
-- ─────────────────────────────────────────────────────────────

-- Teachers no longer exist in-app. Convert any legacy teachers to students.
-- First normalize casing to avoid surprises like 'Teacher'/'ADMIN'.
UPDATE public.profiles
SET role = LOWER(role)
WHERE role IS NOT NULL;

-- Teachers no longer exist in-app. Convert any legacy teachers to students.
UPDATE public.profiles
SET role = 'student', status = 'active'
WHERE role = 'teacher';

-- Coerce any unknown/legacy roles to student so constraints can be applied.
UPDATE public.profiles
SET role = 'student'
WHERE role IS NULL OR role NOT IN ('student', 'parent', 'admin');

-- Teacher approval status is no longer used.
UPDATE public.profiles
SET status = 'active'
WHERE status = 'pending';

-- If any unexpected status slipped in, coerce to active.
UPDATE public.profiles
SET status = 'active'
WHERE status IS NULL OR status NOT IN ('active', 'suspended');

-- ─────────────────────────────────────────────────────────────
-- 1) Drop teacher-era tables
-- ─────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS public.assignments CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.parent_messages CASCADE;

-- ─────────────────────────────────────────────────────────────
-- 2) Drop teacher-era RPCs / helper functions
-- ─────────────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS public.get_teacher_id_by_code(text);
DROP FUNCTION IF EXISTS public.get_teacher_parent_links(uuid);
DROP FUNCTION IF EXISTS public.is_teacher_of_student(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_parent_of_my_student(uuid) CASCADE;

-- ─────────────────────────────────────────────────────────────
-- 3) Profiles: remove teacher-only columns + add constraints
-- ─────────────────────────────────────────────────────────────

DROP INDEX IF EXISTS public.idx_profiles_teacher_code;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS teacher_code;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS credential_url;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'parent', 'admin'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_status_check
  CHECK (status IN ('active', 'suspended'));

-- Keep unique_code for parent linking
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_unique_code
  ON public.profiles(unique_code)
  WHERE unique_code IS NOT NULL;

-- Backfill student unique_code if missing (used by parent linking)
UPDATE public.profiles
SET unique_code = UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6))
WHERE role = 'student' AND (unique_code IS NULL OR unique_code = '');

-- ─────────────────────────────────────────────────────────────
-- 4) Auth trigger: sanitize role + generate unique_code
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  requested_role TEXT;
  safe_role      TEXT;
  _code          TEXT;
BEGIN
  requested_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');

  -- Only allow learner roles from client signup.
  safe_role := CASE
    WHEN requested_role IN ('student', 'parent') THEN requested_role
    ELSE 'student'
  END;

  IF safe_role = 'student' THEN
    _code := UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6));
  ELSE
    _code := NULL;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, status, unique_code)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    safe_role,
    'active',
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

-- ─────────────────────────────────────────────────────────────
-- 5) Shared SECURITY DEFINER helpers (bypass RLS safely)
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$ SELECT role FROM public.profiles WHERE id = auth.uid(); $$;

CREATE OR REPLACE FUNCTION public.is_my_child(student_uuid uuid)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parent_links
    WHERE parent_id = auth.uid() AND student_id = student_uuid
  );
$$;

REVOKE ALL ON FUNCTION public.get_my_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_my_child(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_my_child(uuid) TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- 6) Parent linking RPCs (teacherless)
-- ─────────────────────────────────────────────────────────────

-- find_student_by_code: SECURITY DEFINER lookup by unique_code
DROP FUNCTION IF EXISTS public.find_student_by_code(text);
CREATE OR REPLACE FUNCTION public.find_student_by_code(lookup_code text)
RETURNS TABLE (
  id          uuid,
  full_name   text,
  email       text,
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
      p.unique_code
    FROM public.profiles p
    WHERE p.role = 'student'
      AND p.unique_code = UPPER(TRIM(lookup_code))
    LIMIT 1;
END;
$$;
REVOKE ALL ON FUNCTION public.find_student_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_student_by_code(text) TO authenticated;

-- link_child: SECURITY DEFINER insert into parent_links (parent-owned)
DROP FUNCTION IF EXISTS public.link_child(uuid, uuid);
CREATE OR REPLACE FUNCTION public.link_child(p_parent_id uuid, p_student_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  IF auth.uid() <> p_parent_id THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role <> 'parent' THEN
    RETURN jsonb_build_object('error', 'Only parent accounts can link children');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_student_id AND role = 'student') THEN
    RETURN jsonb_build_object('error', 'Selected user is not a student account');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.parent_links
    WHERE parent_id = p_parent_id AND student_id = p_student_id
  ) THEN
    RETURN jsonb_build_object('error', 'already_linked');
  END IF;

  INSERT INTO public.parent_links (parent_id, student_id)
  VALUES (p_parent_id, p_student_id);

  RETURN jsonb_build_object('success', true);
END;
$$;
REVOKE ALL ON FUNCTION public.link_child(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_child(uuid, uuid) TO authenticated;

-- Admin parent linking RPCs
DROP FUNCTION IF EXISTS public.admin_link_child(uuid, uuid);
CREATE OR REPLACE FUNCTION public.admin_link_child(p_parent_id uuid, p_student_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role <> 'admin' THEN
    RETURN jsonb_build_object('error', 'Only admins can use this function');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_parent_id AND role = 'parent') THEN
    RETURN jsonb_build_object('error', 'Selected user is not a parent account');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_student_id AND role = 'student') THEN
    RETURN jsonb_build_object('error', 'Selected user is not a student account');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.parent_links
    WHERE parent_id = p_parent_id AND student_id = p_student_id
  ) THEN
    RETURN jsonb_build_object('error', 'already_linked');
  END IF;

  INSERT INTO public.parent_links (parent_id, student_id)
  VALUES (p_parent_id, p_student_id);

  RETURN jsonb_build_object('success', true);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_link_child(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_link_child(uuid, uuid) TO authenticated;

DROP FUNCTION IF EXISTS public.admin_unlink_child(uuid);
CREATE OR REPLACE FUNCTION public.admin_unlink_child(p_link_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role <> 'admin' THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  DELETE FROM public.parent_links WHERE id = p_link_id;
  RETURN jsonb_build_object('success', true);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_unlink_child(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_unlink_child(uuid) TO authenticated;

-- Parent updates to child profile should be restricted to safe fields.
DROP FUNCTION IF EXISTS public.parent_update_child_profile(uuid, text, text);
CREATE OR REPLACE FUNCTION public.parent_update_child_profile(
  p_student_id uuid,
  p_full_name  text,
  p_avatar_url text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role <> 'parent' THEN
    RETURN jsonb_build_object('error', 'Only parent accounts can update child profiles');
  END IF;

  IF NOT public.is_my_child(p_student_id) THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  UPDATE public.profiles
  SET
    full_name  = COALESCE(NULLIF(TRIM(p_full_name), ''), full_name),
    avatar_url = COALESCE(NULLIF(TRIM(p_avatar_url), ''), avatar_url)
  WHERE id = p_student_id AND role = 'student';

  RETURN jsonb_build_object('success', true);
END;
$$;
REVOKE ALL ON FUNCTION public.parent_update_child_profile(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.parent_update_child_profile(uuid, text, text) TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- 7) Notifications: remove teacher columns + rebuild RLS
-- ─────────────────────────────────────────────────────────────

DO $$
DECLARE r RECORD;
BEGIN
  IF to_regclass('public.notifications') IS NOT NULL THEN
    -- Drop all policies first (some depend on teacher_id)
    FOR r IN SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'notifications'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.notifications', r.policyname);
    END LOOP;

    -- Drop teacher-era indexes/columns
    DROP INDEX IF EXISTS public.idx_notifications_teacher_id;
    DROP INDEX IF EXISTS public.idx_notifications_teacher;

    ALTER TABLE public.notifications DROP COLUMN IF EXISTS teacher_id;
    ALTER TABLE public.notifications DROP COLUMN IF EXISTS is_global;

    UPDATE public.notifications SET target_role = 'all' WHERE target_role IS NULL OR target_role = 'teacher';

    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

    -- Anyone authenticated can read posted notifications matching their role
    CREATE POLICY "Authenticated users can read notifications"
      ON public.notifications FOR SELECT
      USING (
        auth.uid() IS NOT NULL
        AND is_draft = false
        AND (
          target_role = 'all'
          OR target_role = public.get_my_role()
        )
      );

    -- Admins manage notifications
    CREATE POLICY "Admins can insert notifications"
      ON public.notifications FOR INSERT
      WITH CHECK (public.get_my_role() = 'admin');

    CREATE POLICY "Admins can update notifications"
      ON public.notifications FOR UPDATE
      USING (public.get_my_role() = 'admin');

    CREATE POLICY "Admins can delete notifications"
      ON public.notifications FOR DELETE
      USING (public.get_my_role() = 'admin');
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 8) RLS rebuild: profiles/parent_links/session_logs/adaptive_state/feedback
-- ─────────────────────────────────────────────────────────────

-- PROFILES
DO $$
DECLARE r RECORD;
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    FOR r IN SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
    END LOOP;

    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can read own profile"
      ON public.profiles FOR SELECT
      USING (auth.uid() = id);

    CREATE POLICY "Users can update own profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id);

    CREATE POLICY "Users can upsert own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);

    CREATE POLICY "Admins can read all profiles"
      ON public.profiles FOR SELECT
      USING (public.get_my_role() = 'admin');

    CREATE POLICY "Admins can update any profile"
      ON public.profiles FOR UPDATE
      USING (public.get_my_role() = 'admin');

    CREATE POLICY "Parents can read linked child profiles"
      ON public.profiles FOR SELECT
      USING (public.get_my_role() = 'parent' AND public.is_my_child(id));
  END IF;
END $$;

-- PARENT_LINKS
DO $$
DECLARE r RECORD;
BEGIN
  IF to_regclass('public.parent_links') IS NOT NULL THEN
    FOR r IN SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'parent_links'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.parent_links', r.policyname);
    END LOOP;

    ALTER TABLE public.parent_links ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Parents can view their links"
      ON public.parent_links FOR SELECT
      USING (auth.uid() = parent_id);

    CREATE POLICY "Admins can view all parent links"
      ON public.parent_links FOR SELECT
      USING (public.get_my_role() = 'admin');

    -- Inserts/deletes are done via SECURITY DEFINER RPCs.
  END IF;
END $$;

-- SESSION_LOGS
DO $$
DECLARE r RECORD;
BEGIN
  IF to_regclass('public.session_logs') IS NOT NULL THEN
    FOR r IN SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'session_logs'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.session_logs', r.policyname);
    END LOOP;

    ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Students can insert own session logs"
      ON public.session_logs FOR INSERT
      WITH CHECK (auth.uid() = student_id);

    CREATE POLICY "Students can read own session logs"
      ON public.session_logs FOR SELECT
      USING (auth.uid() = student_id);

    CREATE POLICY "Parents can read linked child session logs"
      ON public.session_logs FOR SELECT
      USING (public.get_my_role() = 'parent' AND public.is_my_child(student_id));

    CREATE POLICY "Admins can read all session logs"
      ON public.session_logs FOR SELECT
      USING (public.get_my_role() = 'admin');
  END IF;
END $$;

-- ADAPTIVE_STATE
DO $$
DECLARE r RECORD;
BEGIN
  IF to_regclass('public.adaptive_state') IS NOT NULL THEN
    FOR r IN SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'adaptive_state'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.adaptive_state', r.policyname);
    END LOOP;

    ALTER TABLE public.adaptive_state ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Students can manage their adaptive state"
      ON public.adaptive_state FOR ALL
      USING (auth.uid() = student_id)
      WITH CHECK (auth.uid() = student_id);

    CREATE POLICY "Parents can read linked child adaptive state"
      ON public.adaptive_state FOR SELECT
      USING (public.get_my_role() = 'parent' AND public.is_my_child(student_id));

    CREATE POLICY "Admins can read all adaptive state"
      ON public.adaptive_state FOR SELECT
      USING (public.get_my_role() = 'admin');
  END IF;
END $$;

-- FEEDBACK
DO $$
DECLARE r RECORD;
BEGIN
  IF to_regclass('public.feedback') IS NOT NULL THEN
    FOR r IN SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'feedback'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.feedback', r.policyname);
    END LOOP;

    ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can submit feedback"
      ON public.feedback FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can read own feedback"
      ON public.feedback FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can update own feedback"
      ON public.feedback FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Admins can manage feedback"
      ON public.feedback FOR ALL
      USING (public.get_my_role() = 'admin');
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 9) Content tables: remove teacher management policies
-- ─────────────────────────────────────────────────────────────

-- spelling_words
DO $$
BEGIN
  IF to_regclass('public.spelling_words') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admin teacher manage spelling words" ON public.spelling_words;

    -- Ensure an admin-only management policy exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'spelling_words'
        AND policyname = 'Admins manage spelling words'
    ) THEN
      EXECUTE $p$
        CREATE POLICY "Admins manage spelling words" ON public.spelling_words
          FOR ALL USING (public.get_my_role() = 'admin')
      $p$;
    END IF;
  END IF;
END $$;

-- phonics_activity_content
DO $$
BEGIN
  IF to_regclass('public.phonics_activity_content') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admin teacher manage phonics activity content" ON public.phonics_activity_content;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'phonics_activity_content'
        AND policyname = 'Admins manage phonics activity content'
    ) THEN
      EXECUTE $p$
        CREATE POLICY "Admins manage phonics activity content" ON public.phonics_activity_content
          FOR ALL USING (public.get_my_role() = 'admin')
      $p$;
    END IF;
  END IF;
END $$;

-- phonological_content
DO $$
BEGIN
  IF to_regclass('public.phonological_content') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admins and teachers can manage phonological content" ON public.phonological_content;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'phonological_content'
        AND policyname = 'Admins manage phonological content'
    ) THEN
      EXECUTE $p$
        CREATE POLICY "Admins manage phonological content" ON public.phonological_content
          FOR ALL USING (public.get_my_role() = 'admin')
      $p$;
    END IF;
  END IF;
END $$;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
