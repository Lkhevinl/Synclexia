-- ============================================================
-- SETUP: Create all missing tables from scratch
-- Run this in your Supabase SQL Editor
-- Safe to run even if some tables already exist (IF NOT EXISTS)
-- ============================================================


-- ============================================================
-- 1. ENROLLMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_student_enrollment UNIQUE(student_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_teacher_id ON public.enrollments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can view their enrolled students" ON public.enrollments;
DROP POLICY IF EXISTS "Students can view their enrollment"        ON public.enrollments;
DROP POLICY IF EXISTS "Teachers can manage their enrollments"     ON public.enrollments;
DROP POLICY IF EXISTS "Students can enroll"                       ON public.enrollments;
DROP POLICY IF EXISTS "Students can unenroll"                     ON public.enrollments;
DROP POLICY IF EXISTS "Admins can view all enrollments"           ON public.enrollments;

CREATE POLICY "Teachers can view their enrolled students" ON public.enrollments
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view their enrollment" ON public.enrollments
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can manage their enrollments" ON public.enrollments
  FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Students can enroll" ON public.enrollments
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can unenroll" ON public.enrollments
  FOR DELETE USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all enrollments" ON public.enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ============================================================
-- 2. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_draft BOOLEAN DEFAULT FALSE,
  target_role TEXT DEFAULT 'all',
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_global BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_target_role ON public.notifications(target_role);
CREATE INDEX IF NOT EXISTS idx_notifications_teacher_id  ON public.notifications(teacher_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created     ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view published notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins and teachers can insert notifications"         ON public.notifications;
DROP POLICY IF EXISTS "Admins can update any notification"                   ON public.notifications;
DROP POLICY IF EXISTS "Teachers can update own notifications"                ON public.notifications;
DROP POLICY IF EXISTS "Admins can delete any notification"                   ON public.notifications;
DROP POLICY IF EXISTS "Teachers can delete own notifications"                ON public.notifications;
DROP POLICY IF EXISTS "Anyone can view published notifications"              ON public.notifications;
DROP POLICY IF EXISTS "Students see teacher + global notifications"          ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage notifications"                      ON public.notifications;
DROP POLICY IF EXISTS "Teachers can manage own notifications"                ON public.notifications;

-- SELECT: all authenticated users can read published notifications
CREATE POLICY "Authenticated users can view published notifications"
  ON public.notifications FOR SELECT
  USING (is_draft = false AND auth.uid() IS NOT NULL);

-- INSERT: admins and teachers
CREATE POLICY "Admins and teachers can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    )
  );

-- UPDATE: admins update any, teachers update their own
CREATE POLICY "Admins can update any notification"
  ON public.notifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Teachers can update own notifications"
  ON public.notifications FOR UPDATE
  USING (
    teacher_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- DELETE: admins delete any, teachers delete their own
CREATE POLICY "Admins can delete any notification"
  ON public.notifications FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Teachers can delete own notifications"
  ON public.notifications FOR DELETE
  USING (
    teacher_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'teacher'
    )
  );


-- ============================================================
-- 3. SESSION LOGS TABLE
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
DROP POLICY IF EXISTS "Teachers can view enrolled student logs"    ON public.session_logs;
DROP POLICY IF EXISTS "Admins can view all session logs"          ON public.session_logs;

CREATE POLICY "Students can insert their own session logs" ON public.session_logs
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their own session logs" ON public.session_logs
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view enrolled student logs" ON public.session_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.teacher_id = auth.uid()
        AND enrollments.student_id = session_logs.student_id
    )
  );

CREATE POLICY "Admins can view all session logs" ON public.session_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ============================================================
-- 4. ASSIGNMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_assignment UNIQUE(teacher_id, student_id, activity_type)
);

CREATE INDEX IF NOT EXISTS idx_assignments_student_id ON public.assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON public.assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_activity   ON public.assignments(activity_type);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can view their assignments"    ON public.assignments;
DROP POLICY IF EXISTS "Students can view their assignments"    ON public.assignments;
DROP POLICY IF EXISTS "Teachers can manage assignments"        ON public.assignments;
DROP POLICY IF EXISTS "Students can update completion status"  ON public.assignments;

CREATE POLICY "Teachers can view their assignments" ON public.assignments
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view their assignments" ON public.assignments
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can manage assignments" ON public.assignments
  FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Students can update completion status" ON public.assignments
  FOR UPDATE USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);


-- ============================================================
-- Reload PostgREST schema cache
-- ============================================================
NOTIFY pgrst, 'reload schema';
