-- ============================================================
-- RPC: get_teacher_parent_links
-- Returns all (parent_id, student_id) pairs for students
-- enrolled under the given teacher.
-- SECURITY DEFINER bypasses RLS so teachers don't need a
-- separate policy on parent_links.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_teacher_parent_links(p_teacher_id uuid)
RETURNS TABLE(parent_id uuid, student_id uuid)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT pl.parent_id, pl.student_id
  FROM   public.parent_links pl
  JOIN   public.enrollments  e  ON e.student_id = pl.student_id
  WHERE  e.teacher_id = p_teacher_id;
$$;

-- Only authenticated users can call this
REVOKE ALL ON FUNCTION public.get_teacher_parent_links(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_teacher_parent_links(uuid) TO authenticated;
