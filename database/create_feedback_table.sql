-- ============================================================
-- CREATE: feedback table (legacy user feedback system)
-- This table predates maintenance_logs. New feedback goes into
-- maintenance_logs; this table is retained as read-only legacy
-- data surfaced in MaintenanceLogsScreen and MaintenanceLogDetailScreen.
-- ============================================================

-- Ensure the SECURITY DEFINER helper exists (idempotent — safe to re-run
-- even if COMPREHENSIVE_RLS_FIX_ALL_USERS.sql has already been applied).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

CREATE TABLE IF NOT EXISTS public.feedback (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message          TEXT,
  rating           INTEGER CHECK (rating BETWEEN 1 AND 5),
  reply            TEXT,
  status           VARCHAR(20) NOT NULL DEFAULT 'open'
                     CHECK (status IN ('open', 'in_progress', 'resolved')),
  has_unread_reply BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id        ON public.feedback (user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status         ON public.feedback (status);
CREATE INDEX IF NOT EXISTS idx_feedback_has_unread     ON public.feedback (has_unread_reply);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Users can submit feedback
DROP POLICY IF EXISTS "Users can insert feedback" ON public.feedback;
CREATE POLICY "Users can insert feedback" ON public.feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
DROP POLICY IF EXISTS "Users can view their feedback" ON public.feedback;
CREATE POLICY "Users can view their feedback" ON public.feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can read and manage all feedback
-- Uses public.is_admin() (SECURITY DEFINER) to avoid RLS infinite recursion
DROP POLICY IF EXISTS "Admins can manage all feedback" ON public.feedback;
CREATE POLICY "Admins can manage all feedback" ON public.feedback
  FOR ALL USING (public.is_admin());

-- Auto-update updated_at on row change
DROP TRIGGER IF EXISTS update_feedback_updated_at ON public.feedback;
CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

NOTIFY pgrst, 'reload schema';
