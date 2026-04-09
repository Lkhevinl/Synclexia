-- ============================================================
-- COMPREHENSIVE RLS FIX FOR ALL USER ROLES
-- Run this in Supabase SQL Editor to fix "Couldn't Load Your Profile"
-- for students, parents, admins, and teachers
--
-- Root cause: RLS policies with subqueries into public.profiles cause
-- infinite recursion (PostgreSQL error 42P17)
-- Solution: Use SECURITY DEFINER helper functions that bypass RLS
-- ============================================================

-- ============================================================
-- STEP 1: Create SECURITY DEFINER Helper Functions
-- These bypass RLS to prevent infinite recursion
-- ============================================================

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

-- Additional helper to check if user is admin (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Grant execute permissions
REVOKE ALL ON FUNCTION public.get_my_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_my_child(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_my_child(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================================
-- STEP 2: Fix PROFILES Table RLS (Critical - affects all users)
-- ============================================================

-- Drop ALL existing profiles policies
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
  END LOOP;
END $$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Every user can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- SELECT: Admins can read ALL profiles (uses SECURITY DEFINER function)
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() = 'admin');

-- SELECT: Parents can read their linked children's profiles
CREATE POLICY "Parents can read linked child profiles"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() = 'parent' AND public.is_my_child(id));

-- SELECT: Teachers can read student profiles (for enrollment/assignment)
CREATE POLICY "Teachers can read student profiles"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() = 'teacher' AND role = 'student');

-- UPDATE: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- UPDATE: Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.get_my_role() = 'admin');

-- INSERT: Users can insert their own profile (signup flow)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- INSERT: Admins can insert profiles (manual user creation)
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.get_my_role() = 'admin');

-- DELETE: Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.get_my_role() = 'admin');

-- ============================================================
-- STEP 3: Fix PARENT_LINKS Table RLS
-- ============================================================

-- Drop recursive policies
DROP POLICY IF EXISTS "Admins can view all parent links" ON public.parent_links;
DROP POLICY IF EXISTS "Admins can insert links" ON public.parent_links;
DROP POLICY IF EXISTS "Admins can delete links" ON public.parent_links;

ALTER TABLE public.parent_links ENABLE ROW LEVEL SECURITY;

-- SELECT: Parents can view their own links
DROP POLICY IF EXISTS "Parents can view their links" ON public.parent_links;
CREATE POLICY "Parents can view their links"
  ON public.parent_links FOR SELECT USING (auth.uid() = parent_id);

-- SELECT: Admins can view all links (non-recursive using helper function)
CREATE POLICY "Admins can view all parent links"
  ON public.parent_links FOR SELECT
  USING (public.is_admin());

-- SELECT: Parents can view their linked children's data
CREATE POLICY "Parents can view linked child data"
  ON public.parent_links FOR SELECT
  USING (public.get_my_role() = 'parent' AND parent_id = auth.uid());

-- INSERT: Admins can insert links
CREATE POLICY "Admins can insert parent links"
  ON public.parent_links FOR INSERT
  WITH CHECK (public.is_admin());

-- DELETE: Admins can delete links
CREATE POLICY "Admins can delete parent links"
  ON public.parent_links FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- STEP 4: Fix SESSION_LOGS Table RLS
-- ============================================================

DROP POLICY IF EXISTS "Admins can view all session logs" ON public.session_logs;
DROP POLICY IF EXISTS "Parents can view linked child session logs" ON public.session_logs;

ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;

-- INSERT: Students can insert their own logs
DROP POLICY IF EXISTS "Students can insert their own session logs" ON public.session_logs;
CREATE POLICY "Students can insert their own session logs"
  ON public.session_logs FOR INSERT WITH CHECK (auth.uid() = student_id);

-- SELECT: Students can view their own logs
DROP POLICY IF EXISTS "Students can view their own session logs" ON public.session_logs;
CREATE POLICY "Students can view their own session logs"
  ON public.session_logs FOR SELECT USING (auth.uid() = student_id);

-- SELECT: Parents can view linked child logs (non-recursive)
CREATE POLICY "Parents can view linked child session logs"
  ON public.session_logs FOR SELECT
  USING (public.get_my_role() = 'parent' AND public.is_my_child(student_id));

-- SELECT: Admins can view all logs (non-recursive)
CREATE POLICY "Admins can view all session logs"
  ON public.session_logs FOR SELECT
  USING (public.is_admin());

-- ============================================================
-- STEP 5: Fix NOTIFICATIONS Table RLS
-- ============================================================

DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notifications;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- SELECT: All authenticated users can view published notifications
DROP POLICY IF EXISTS "Authenticated users can view published notifications" ON public.notifications;
CREATE POLICY "Authenticated users can view published notifications"
  ON public.notifications FOR SELECT
  USING (
    is_draft = false
    AND auth.uid() IS NOT NULL
    AND (
      target_role = 'all'
      OR target_role = public.get_my_role()
      OR (public.get_my_role() = 'teacher' AND target_role = 'student')
    )
  );

-- INSERT: Admins can insert (non-recursive)
CREATE POLICY "Admins can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_admin());

-- Teachers can send published announcements to students only
DROP POLICY IF EXISTS "Teachers can insert student notifications" ON public.notifications;
CREATE POLICY "Teachers can insert student notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    public.get_my_role() = 'teacher'
    AND is_draft = false
    AND target_role = 'student'
  );

-- UPDATE: Admins can update (non-recursive)
CREATE POLICY "Admins can update notifications"
  ON public.notifications FOR UPDATE
  USING (public.is_admin());

-- DELETE: Admins can delete (non-recursive)
CREATE POLICY "Admins can delete notifications"
  ON public.notifications FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- STEP 6: Fix OTHER TABLES with potential RLS recursion
-- ============================================================

-- Stories table policies (if they reference profiles)
DROP POLICY IF EXISTS "Anyone can read stories" ON public.stories;
DROP POLICY IF EXISTS "Admins manage stories" ON public.stories;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read stories"
  ON public.stories FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage stories"
  ON public.stories FOR ALL USING (public.is_admin());

-- Phonics items
DROP POLICY IF EXISTS "Anyone can read phonics items" ON public.phonics_items;
DROP POLICY IF EXISTS "Admins manage phonics items" ON public.phonics_items;
ALTER TABLE public.phonics_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read phonics items"
  ON public.phonics_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage phonics items"
  ON public.phonics_items FOR ALL USING (public.is_admin());

-- Spelling words
DROP POLICY IF EXISTS "Anyone can read spelling words" ON public.spelling_words;
DROP POLICY IF EXISTS "Admins manage spelling words" ON public.spelling_words;
ALTER TABLE public.spelling_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read spelling words"
  ON public.spelling_words FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage spelling words"
  ON public.spelling_words FOR ALL USING (public.is_admin());

-- Phonics activity content
DROP POLICY IF EXISTS "Anyone can read phonics activity content" ON public.phonics_activity_content;
DROP POLICY IF EXISTS "Admins manage phonics activity content" ON public.phonics_activity_content;
ALTER TABLE public.phonics_activity_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read phonics activity content"
  ON public.phonics_activity_content FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage phonics activity content"
  ON public.phonics_activity_content FOR ALL USING (public.is_admin());

-- Phonological content
DROP POLICY IF EXISTS "Anyone can read phonological content" ON public.phonological_content;
DROP POLICY IF EXISTS "Admins manage phonological content" ON public.phonological_content;
ALTER TABLE public.phonological_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read phonological content"
  ON public.phonological_content FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage phonological content"
  ON public.phonological_content FOR ALL USING (public.is_admin());

-- Writing practice
DROP POLICY IF EXISTS "Anyone can read writing practice" ON public.writing_practice;
DROP POLICY IF EXISTS "Admins manage writing practice" ON public.writing_practice;
ALTER TABLE public.writing_practice ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read writing practice"
  ON public.writing_practice FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage writing practice"
  ON public.writing_practice FOR ALL USING (public.is_admin());

-- Feedback table
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can insert own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can update feedback" ON public.feedback;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback"
  ON public.feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own feedback"
  ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all feedback"
  ON public.feedback FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update feedback"
  ON public.feedback FOR UPDATE USING (public.is_admin());

-- Maintenance logs
DROP POLICY IF EXISTS "Users can view own maintenance logs" ON public.maintenance_logs;
DROP POLICY IF EXISTS "Admins can view all maintenance logs" ON public.maintenance_logs;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own maintenance logs"
  ON public.maintenance_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all maintenance logs"
  ON public.maintenance_logs FOR SELECT USING (public.is_admin());

-- Enrollments
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON public.enrollments;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enrollments"
  ON public.enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Admins can manage all enrollments"
  ON public.enrollments FOR ALL USING (public.is_admin());

-- ============================================================
-- STEP 7: Create RPC Functions for Common Operations
-- These bypass RLS entirely for reliable access
-- ============================================================

-- RPC: Find student by code (for parent linking)
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
      p.level,
      p.unique_code
    FROM public.profiles p
    WHERE p.role = 'student'
      AND p.unique_code = UPPER(TRIM(lookup_code))
    LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.find_student_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_student_by_code(text) TO authenticated;

-- RPC: Link child (for parents)
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

-- RPC: Admin link child
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

-- ============================================================
-- STEP 8: Reload Schema Cache
-- ============================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- DONE! All RLS policies are now non-recursive.
-- Students, Parents, Admins, and Teachers should all be able
-- to load their profiles without "infinite recursion" errors.
-- ============================================================
