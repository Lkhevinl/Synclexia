-- ============================================================
-- FIX: Signup returning 500 Internal Server Error
-- 
-- Run this in your Supabase Dashboard → SQL Editor → New Query
-- ============================================================


-- ─── 1. Ensure profiles table has ALL required columns ──────────────────────
-- Safe no-ops if the columns already exist.

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  email       TEXT,
  role        TEXT NOT NULL DEFAULT 'student',
  xp          INTEGER NOT NULL DEFAULT 0,
  unique_code TEXT,
  avatar_url  TEXT,
  push_token  TEXT,
  is_banned   BOOLEAN NOT NULL DEFAULT FALSE,
  status      TEXT NOT NULL DEFAULT 'active',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role        TEXT NOT NULL DEFAULT 'student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp         INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unique_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url  TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS push_token  TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned   BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status      TEXT NOT NULL DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Backfill any rows with NULL status
UPDATE public.profiles SET status = 'active' WHERE status IS NULL;

-- Add/replace status check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_status_check
  CHECK (status IN ('active', 'pending', 'suspended'));


-- ─── 2. Unique index on unique_code ─────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_unique_code
  ON public.profiles(unique_code)
  WHERE unique_code IS NOT NULL;


-- ─── 3. RLS ─────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile"                  ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"               ON public.profiles;
DROP POLICY IF EXISTS "Admins and teachers can view all profiles"  ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile"              ON public.profiles;
DROP POLICY IF EXISTS "Allow profile insert during signup"         ON public.profiles;

-- Allow the trigger (and upsert from app) to INSERT a new profile
CREATE POLICY "Allow profile insert during signup"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins and teachers can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'teacher')
        AND p.status = 'active'
    )
  );

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );


-- ─── 4. EXCEPTION-SAFE trigger function ─────────────────────────────────────
-- Wrapping in EXCEPTION means a profile-creation failure will NEVER cause
-- the auth signup to return 500. The app-side upsert will handle profile
-- creation if the trigger is skipped.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _role   TEXT;
  _status TEXT;
BEGIN
  _role   := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  _status := CASE WHEN _role = 'teacher' THEN 'pending' ELSE 'active' END;

  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    _role,
    _status
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but let signup succeed.
    -- The app will upsert the full profile after signup anyway.
    RAISE WARNING '[handle_new_user] Could not create profile for user %: % (SQLSTATE %)',
      NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── 5. Safe prevent_admin_self_assign (also exception-tolerant) ────────────
CREATE OR REPLACE FUNCTION public.prevent_admin_self_assign()
RETURNS TRIGGER AS $$
BEGIN
  -- Only block client-side attempts (uid() != NULL).
  -- Service-role inserts (seed scripts, triggers) are allowed.
  IF NEW.role = 'admin' AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'You cannot self-assign the admin role.';
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN raise_exception THEN
    RAISE; -- re-raise intentional exceptions
  WHEN OTHERS THEN
    RAISE WARNING '[prevent_admin_self_assign] Unexpected error: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_admin_self_assign_trigger ON public.profiles;
CREATE TRIGGER prevent_admin_self_assign_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_admin_self_assign();


-- ─── Reload schema cache ─────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
