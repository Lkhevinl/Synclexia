-- ============================================================
-- SYNCLEXIA: RPC to look up a teacher's ID by their enrollment code
-- This runs with SECURITY DEFINER, bypassing RLS so a student
-- can find their teacher without needing direct profile read access.
-- Run this in Supabase SQL Editor.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_teacher_id_by_code(p_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_teacher_id UUID;
BEGIN
  SELECT id INTO v_teacher_id
  FROM public.profiles
  WHERE teacher_code = UPPER(TRIM(p_code))
    AND role = 'teacher'
  LIMIT 1;

  RETURN v_teacher_id; -- returns NULL if not found
END;
$$;

-- Allow any authenticated user to call this function
GRANT EXECUTE ON FUNCTION public.get_teacher_id_by_code(TEXT) TO authenticated;
