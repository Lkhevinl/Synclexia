-- ============================================================
-- Profiles RLS — aligned with current schema
--
-- Roles in profiles.role CHECK: student | parent | admin
--
-- Design:
--   • get_my_role()    — SECURITY DEFINER, avoids infinite recursion
--     when an RLS policy queries profiles to check the caller's role
--   • is_my_child(uuid) — SECURITY DEFINER, same reason
--   • No INSERT policy for regular users: profile creation is
--     handled entirely by the handle_new_user() trigger, which
--     runs server-side and bypasses RLS. Keeping a user INSERT
--     policy here would require auth.uid() to be set at signup
--     time, which is not guaranteed when email confirmation is on.
--
-- Run in the Supabase SQL Editor.
-- ============================================================

-- ── Helper functions ─────────────────────────────────────────

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

-- Restrict execution to authenticated users only
REVOKE ALL ON FUNCTION public.get_my_role()          FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_my_child(uuid)      FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_my_role()      TO authenticated;
GRANT  EXECUTE ON FUNCTION public.is_my_child(uuid)  TO authenticated;

-- ── Drop all existing profiles policies ──────────────────────

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

-- ── Enable RLS ────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ── SELECT policies ───────────────────────────────────────────

-- Every authenticated user can read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() = 'admin');

-- Parents can read their linked children's profiles
CREATE POLICY "profiles_select_parent_child"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() = 'parent' AND public.is_my_child(id));

-- ── UPDATE policies ───────────────────────────────────────────

-- Users can update their own profile (avatar, name, push_token, etc.)
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING  (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile (ban, role change, etc.)
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (public.get_my_role() = 'admin');

-- ── INSERT policy ─────────────────────────────────────────────

-- Profile rows are created by the handle_new_user() trigger
-- (SECURITY DEFINER, no session required).
-- This policy covers only the admin use-case (manual user creation
-- from the admin dashboard) and edge-case re-inserts by the user
-- themselves when they already have an active session.
CREATE POLICY "profiles_insert_admin"
  ON public.profiles FOR INSERT
  WITH CHECK (public.get_my_role() = 'admin');

-- ── DELETE policy ─────────────────────────────────────────────

-- Only admins can delete profiles
CREATE POLICY "profiles_delete_admin"
  ON public.profiles FOR DELETE
  USING (public.get_my_role() = 'admin');
