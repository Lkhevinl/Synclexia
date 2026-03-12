-- ============================================================
--  EMERGENCY FIX — "Database Error / Could not connect to profile"
--  Run this in Supabase Dashboard → SQL Editor → Run
--
--  Fixes:
--    1. Creates / replaces get_my_role() SECURITY DEFINER function
--       (prevents infinite recursion in profiles RLS)
--    2. Drops ALL existing profiles policies (including recursive ones)
--    3. Recreates clean, non-recursive policies
--    4. Adds any missing columns that SELECT * could trip over
--    5. Reloads the PostgREST schema cache
-- ============================================================


-- ── Step 1: SECURITY DEFINER helper (no recursion possible) ──────────────────
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;


-- ── Step 2: Drop every existing policy on profiles ───────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT policyname
    FROM   pg_policies
    WHERE  schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
  END LOOP;
END;
$$;


-- ── Step 3: Recreate clean, non-recursive policies ───────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Every user can read / update their own row
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins — uses SECURITY DEFINER function, never recurses
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.get_my_role() = 'admin');

-- Teachers can read profiles of their enrolled students
CREATE POLICY "Teachers can read enrolled student profiles"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT student_id FROM public.enrollments
      WHERE  teacher_id = auth.uid()
    )
  );

-- Students can read their teacher's profile  
CREATE POLICY "Students can read their teacher profile"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT teacher_id FROM public.enrollments
      WHERE  student_id = auth.uid()
    )
  );

-- Parents can read profiles of their linked children
CREATE POLICY "Parents can read their linked child profiles"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT student_id FROM public.parent_links
      WHERE  parent_id = auth.uid()
    )
  );

-- Teachers can read profiles of parents linked to their students
CREATE POLICY "Teachers can read parent profiles"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT pl.parent_id
      FROM   public.parent_links pl
      JOIN   public.enrollments  e ON e.student_id = pl.student_id
      WHERE  e.teacher_id = auth.uid()
    )
  );


-- ── Step 4: Ensure all columns exist that SELECT * expects ───────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unique_code      TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS teacher_code     TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status           TEXT    DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned        BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url       TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credential_url   TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS push_token       TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp               INTEGER DEFAULT 0;


-- ── Step 5: Reload PostgREST schema cache ────────────────────────────────────
-- (fixes "relation does not exist" 500s after column additions)
NOTIFY pgrst, 'reload schema';


-- ── Done ─────────────────────────────────────────────────────────────────────
-- After running this, reload the app. The Database Error screen should be gone.
