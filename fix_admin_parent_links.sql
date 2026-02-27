-- ============================================================
-- FIX: Admin Parent-Student Linking — RPC + RLS
-- Run this entire script in the Supabase SQL Editor.
-- ============================================================

-- ─── 1. RPC: admin_link_child ─────────────────────────────────
-- SECURITY DEFINER so it can bypass RLS.
-- Checks that the caller is an admin or teacher profile.
-- ─────────────────────────────────────────────────────────────
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
  -- Verify caller is admin or teacher
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role NOT IN ('admin', 'teacher') THEN
    RETURN jsonb_build_object('error', 'Only admins or teachers can use this function');
  END IF;

  -- Verify parent exists and has role 'parent'
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_parent_id AND role = 'parent') THEN
    RETURN jsonb_build_object('error', 'Selected user is not a parent account');
  END IF;

  -- Verify student exists and has role 'student'
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_student_id AND role = 'student') THEN
    RETURN jsonb_build_object('error', 'Selected user is not a student account');
  END IF;

  -- Prevent duplicate
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


-- ─── 2. RPC: admin_unlink_child ───────────────────────────────
-- Allows admin/teacher to delete any parent_link by its ID.
-- ─────────────────────────────────────────────────────────────
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
  IF caller_role NOT IN ('admin', 'teacher') THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  DELETE FROM public.parent_links WHERE id = p_link_id;
  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_unlink_child(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_unlink_child(uuid) TO authenticated;


-- ─── 3. RLS: Allow admins/teachers to SELECT all parent_links ─
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'parent_links'
      AND policyname = 'Admins can view all links'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Admins can view all links" ON public.parent_links
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'teacher')
          )
        )
    $p$;
  END IF;
END
$$;


-- ─── 4. RLS: Allow admins/teachers to INSERT parent_links ─────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'parent_links'
      AND policyname = 'Admins can insert links'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Admins can insert links" ON public.parent_links
        FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'teacher')
          )
        )
    $p$;
  END IF;
END
$$;


-- ─── 5. RLS: Allow admins/teachers to DELETE parent_links ─────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'parent_links'
      AND policyname = 'Admins can delete links'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Admins can delete links" ON public.parent_links
        FOR DELETE USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'teacher')
          )
        )
    $p$;
  END IF;
END
$$;

-- ─── 6. Ensure profiles table has upsert policy for self ──────
-- Allows a user to upsert their own profile so the SignUp
-- upsert fix can overwrite trigger-created rows with role=student.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
      AND policyname = 'Users can upsert own profile'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Users can upsert own profile" ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id)
    $p$;
  END IF;
END
$$;
