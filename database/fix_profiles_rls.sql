-- ============================================================
-- FIX: Profiles RLS — resolves "Couldn't Load Your Profile"
-- for parent and admin roles on login.
--
-- Root cause: Some policies query public.profiles directly
-- inside an RLS USING clause, causing infinite recursion
-- (PostgreSQL error 42P17) for non-student roles.
--
-- Fix: All role-based checks go through get_my_role(), a
-- SECURITY DEFINER function that bypasses RLS when it reads
-- the profiles table — breaking the recursion.
--
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- ── Step 1: Ensure SECURITY DEFINER helper functions exist ──

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

-- ── Step 2: Drop ALL existing profiles policies ──────────────

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

-- ── Step 3: Ensure RLS is enabled ───────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ── Step 4: Recreate policies (no direct subquery into profiles) ─

-- Every authenticated user can read their OWN profile row
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can read ALL profiles
-- get_my_role() is SECURITY DEFINER → bypasses RLS, no recursion
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() = 'admin');

-- Parents can read their linked children's profiles
CREATE POLICY "Parents can read linked child profiles"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() = 'parent' AND public.is_my_child(id));

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.get_my_role() = 'admin');

-- Users can insert their own profile row (signup flow)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can insert profiles (manual user creation)
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.get_my_role() = 'admin');

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.get_my_role() = 'admin');
