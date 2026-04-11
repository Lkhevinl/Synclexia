-- ============================================================
-- Auto-create profile on auth user signup (DB trigger)
--
-- Why: Client-side INSERT after signUp fails when Supabase has
-- email confirmation enabled — data.session is null, so
-- auth.uid() = null and RLS blocks the INSERT.
--
-- Fix: SECURITY DEFINER trigger on auth.users. Fires server-side,
-- bypasses RLS, runs in the same transaction as the auth INSERT.
--
-- Roles (must match profiles.role CHECK constraint):
--   student | parent | admin
--
-- Run once in the Supabase SQL Editor.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role    TEXT;
  v_code    TEXT;
  v_chars   TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_attempt INT  := 0;
  i         INT;
BEGIN
  -- Clamp role to the values allowed by profiles.role CHECK constraint.
  -- Any unknown value (including missing metadata) falls back to 'student'.
  v_role := CASE
    WHEN NEW.raw_user_meta_data->>'role' IN ('student', 'parent', 'admin')
    THEN NEW.raw_user_meta_data->>'role'
    ELSE 'student'
  END;

  IF v_role = 'student' THEN
    -- Students need a unique 6-char invite/join code.
    -- Retry up to 5 times if a code collision occurs on the unique_code column.
    LOOP
      v_code    := '';
      v_attempt := v_attempt + 1;

      FOR i IN 1..6 LOOP
        v_code := v_code || substr(v_chars, floor(random() * length(v_chars))::int + 1, 1);
      END LOOP;

      BEGIN
        INSERT INTO public.profiles (id, email, full_name, role, unique_code)
        VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''), 'Student'),
          v_role,
          v_code
        );
        EXIT; -- inserted successfully — exit retry loop
      EXCEPTION
        WHEN unique_violation THEN
          -- Only retry for unique_code collisions (id collisions are impossible here
          -- since this trigger fires on a brand-new auth.users INSERT).
          IF v_attempt >= 5 THEN
            RAISE EXCEPTION 'handle_new_user: unique_code collision after 5 attempts for user %', NEW.id;
          END IF;
          -- loop and try a fresh code
      END;
    END LOOP;

  ELSE
    -- parent / admin — no unique_code column needed
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''), 'User'),
      v_role
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
