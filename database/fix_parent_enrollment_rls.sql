-- Allow parents to read the enrollments of their linked children.
-- Without this policy the parent RLS check on `enrollments` returned null,
-- making ParentMessagesScreen show "No teacher found" even for enrolled
-- students.
--
-- Run in Supabase SQL Editor (once is enough; the IF NOT EXISTS guard prevents
-- duplicate creation on re-runs).

DROP POLICY IF EXISTS "Parents can view their linked child enrollment" ON public.enrollments;

CREATE POLICY "Parents can view their linked child enrollment"
  ON public.enrollments
  FOR SELECT
  USING (
    student_id IN (
      SELECT student_id
      FROM   public.parent_links
      WHERE  parent_id = auth.uid()
    )
  );
