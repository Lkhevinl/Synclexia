-- ============================================================
-- SYNCLEXIA: Full profiles table setup + teacher approval + unique_code
-- Run this in your Supabase SQL Editor (Dashboard → SQL → New query)
-- Safe to run on both a fresh project AND an existing one.
-- ============================================================


-- ─── 1. CREATE profiles TABLE (if it doesn't exist yet) ───

CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  email         TEXT,
  role          TEXT NOT NULL DEFAULT 'student',
  xp            INTEGER NOT NULL DEFAULT 0,
  unique_code   TEXT,
  avatar_url    TEXT,
  push_token    TEXT,
  is_banned     BOOLEAN NOT NULL DEFAULT FALSE,
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─── 2. ADD MISSING COLUMNS (safe for existing tables) ───
-- Each line is a no-op if the column already exists.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unique_code   TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url    TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS push_token    TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned     BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status        TEXT NOT NULL DEFAULT 'active';

-- Backfill: ensure all existing users are active
UPDATE public.profiles SET status = 'active' WHERE status IS NULL;


-- ─── 3. UNIQUE CONSTRAINT ON unique_code ───
-- Prevents two students from getting the same parent-linking code.
-- Partial index: only applies where unique_code is not NULL.

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_unique_code
  ON public.profiles(unique_code)
  WHERE unique_code IS NOT NULL;


-- ─── 4. CHECK CONSTRAINT ON status ───
-- Prevents any invalid status value from any source.

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_status_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_status_check
  CHECK (status IN ('active', 'pending', 'suspended'));


-- ─── 5. ROW LEVEL SECURITY ───

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can always read and update their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins and teachers can read all profiles
DROP POLICY IF EXISTS "Admins and teachers can view all profiles" ON public.profiles;
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

-- Only admins can update any profile
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );


-- ─── 6. DB TRIGGER: Auto-create profile on auth sign-up ───
-- Sets status = 'pending' for teachers at the DB level,
-- regardless of what the app sends.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    CASE
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'teacher'
        THEN 'pending'
      ELSE 'active'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
