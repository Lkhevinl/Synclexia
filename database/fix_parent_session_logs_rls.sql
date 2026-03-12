-- ============================================================
-- FIX: Allow parents to read session_logs of their linked children
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- Parents can view session logs of their linked children
CREATE POLICY "Parents can view linked children session logs" ON public.session_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_links
      WHERE parent_links.parent_id = auth.uid()
        AND parent_links.student_id = session_logs.student_id
    )
  );
