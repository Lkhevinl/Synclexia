-- ============================================================
-- FIX: Parent Child Linking — RPC + RLS
-- Run this entire script in the Supabase SQL Editor.
-- ============================================================


-- ─── 1. RPC: find_student_by_code ─────────────────────────────
-- SECURITY DEFINER means it runs as the DB owner and bypasses
-- RLS completely, so no profile policy issues block the lookup.
-- ─────────────────────────────────────────────────────────────
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

-- Grant execute to authenticated users only
REVOKE ALL ON FUNCTION public.find_student_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_student_by_code(text) TO authenticated;


-- ─── 2. RPC: link_child ────────────────────────────────────────
-- Also SECURITY DEFINER so parents can insert into parent_links
-- without needing a separate INSERT policy.
-- ─────────────────────────────────────────────────────────────
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
  -- Make sure caller is the parent themselves
  IF auth.uid() <> p_parent_id THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;

  -- Make sure caller is actually a parent
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role <> 'parent' THEN
    RETURN jsonb_build_object('error', 'Only parent accounts can link children');
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

REVOKE ALL ON FUNCTION public.link_child(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_child(uuid, uuid) TO authenticated;


-- ─── 3. PARENT_LINKS RLS: ensure parents can read their links ─
-- (SELECT policy already existed — just confirm it's there)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'parent_links'
      AND policyname = 'Parents can view their links'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Parents can view their links" ON public.parent_links
        FOR SELECT USING (auth.uid() = parent_id)
    $p$;
  END IF;
END
$$;
