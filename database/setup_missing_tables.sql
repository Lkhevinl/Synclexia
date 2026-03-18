-- ============================================================
-- SETUP: Create core tables/policies (teacherless)
-- Run this in your Supabase SQL Editor
-- Safe to run even if some tables already exist (IF NOT EXISTS)
-- ============================================================

-- NOTE: This script assumes `public.profiles` already exists.


-- ============================================================
-- 1. PARENT_LINKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.parent_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_parent_student UNIQUE(parent_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_links_parent  ON public.parent_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_links_student ON public.parent_links(student_id);

ALTER TABLE public.parent_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Parents can view their links"      ON public.parent_links;
DROP POLICY IF EXISTS "Admins can view all parent links"  ON public.parent_links;

CREATE POLICY "Parents can view their links" ON public.parent_links
  FOR SELECT USING (auth.uid() = parent_id);

-- Admins can list all links from admin screens
CREATE POLICY "Admins can view all parent links" ON public.parent_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ============================================================
-- 2. Helper functions used by RLS
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$ SELECT role FROM public.profiles WHERE id = auth.uid(); $$;

CREATE OR REPLACE FUNCTION public.is_my_child(student_uuid uuid)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parent_links
    WHERE parent_id = auth.uid() AND student_id = student_uuid
  );
$$;

REVOKE ALL ON FUNCTION public.get_my_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_my_child(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_my_child(uuid) TO authenticated;


-- ============================================================
-- 3. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_draft BOOLEAN DEFAULT FALSE,
  target_role TEXT DEFAULT 'all',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_target_role ON public.notifications(target_role);
CREATE INDEX IF NOT EXISTS idx_notifications_created     ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view published notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can insert notifications"                      ON public.notifications;
DROP POLICY IF EXISTS "Teachers can insert student notifications"            ON public.notifications;
DROP POLICY IF EXISTS "Admins can update notifications"                      ON public.notifications;
DROP POLICY IF EXISTS "Admins can delete notifications"                      ON public.notifications;
DROP POLICY IF EXISTS "Anyone can view published notifications"              ON public.notifications;
DROP POLICY IF EXISTS "Students see teacher + global notifications"          ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage notifications"                      ON public.notifications;
DROP POLICY IF EXISTS "Teachers can manage own notifications"                ON public.notifications;

-- SELECT: all authenticated users can read published notifications matching their role
CREATE POLICY "Authenticated users can view published notifications"
  ON public.notifications FOR SELECT
  USING (
    is_draft = false
    AND auth.uid() IS NOT NULL
    AND (
      target_role = 'all'
      OR target_role = public.get_my_role()
      OR (public.get_my_role() = 'teacher' AND target_role = 'student')
    )
  );

-- Admin-only write access
CREATE POLICY "Admins can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.get_my_role() = 'admin');

-- Teachers can send published announcements to students only
CREATE POLICY "Teachers can insert student notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    public.get_my_role() = 'teacher'
    AND is_draft = false
    AND target_role = 'student'
  );

CREATE POLICY "Admins can update notifications"
  ON public.notifications FOR UPDATE
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Admins can delete notifications"
  ON public.notifications FOR DELETE
  USING (public.get_my_role() = 'admin');


-- ============================================================
-- 4. SESSION LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  score INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_session_logs_student          ON public.session_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_activity         ON public.session_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_session_logs_created          ON public.session_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_logs_student_activity ON public.session_logs(student_id, activity_type);

ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can insert their own session logs" ON public.session_logs;
DROP POLICY IF EXISTS "Students can view their own session logs"   ON public.session_logs;
DROP POLICY IF EXISTS "Parents can view linked child session logs" ON public.session_logs;
DROP POLICY IF EXISTS "Admins can view all session logs"          ON public.session_logs;

CREATE POLICY "Students can insert their own session logs" ON public.session_logs
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their own session logs" ON public.session_logs
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Parents can view linked child session logs" ON public.session_logs
  FOR SELECT USING (public.get_my_role() = 'parent' AND public.is_my_child(student_id));

CREATE POLICY "Admins can view all session logs" ON public.session_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ============================================================
-- Reload PostgREST schema cache
-- ============================================================
NOTIFY pgrst, 'reload schema';


