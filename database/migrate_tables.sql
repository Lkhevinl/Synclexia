-- ============================================================
-- MIGRATION: Upgrade existing tables for full connectivity
-- Run this AFTER create_session_logs_table.sql
-- ============================================================

-- ─── 1. UPGRADE ENROLLMENTS: Allow multiple teachers (co-enrollment) ───

-- Drop the old UNIQUE constraint on student_id
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS unique_student_enrollment;
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS enrollments_student_id_key;

-- Add is_primary flag (default true for existing rows)
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT TRUE;

-- Add unique constraint: one primary teacher per student
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_primary
  ON public.enrollments(student_id) WHERE is_primary = TRUE;

-- Prevent duplicate teacher-student pairs
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_student_teacher
  ON public.enrollments(student_id, teacher_id);


-- ─── 2. UPGRADE ASSIGNMENTS: Targeted tasks with difficulty & due dates ───

-- Add new columns
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS difficulty_level INTEGER DEFAULT 1;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS target_count INTEGER DEFAULT 1;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS specific_item_id UUID;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS notes TEXT;

-- Drop old unique constraint (was teacher_id, student_id, activity_type)
ALTER TABLE public.assignments DROP CONSTRAINT IF EXISTS unique_assignment;

-- New constraint: allow multiple assignments of same type with different details
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_assignment_v2
  ON public.assignments(teacher_id, student_id, activity_type, COALESCE(specific_item_id, '00000000-0000-0000-0000-000000000000'));


-- ─── 3. UPGRADE NOTIFICATIONS: Scope per teacher ───

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT FALSE;

-- Index for teacher-scoped queries
CREATE INDEX IF NOT EXISTS idx_notifications_teacher ON public.notifications(teacher_id);

-- Update RLS: Students see notifications from their enrolled teacher + global ones
DROP POLICY IF EXISTS "Anyone can view published notifications" ON public.notifications;

CREATE POLICY "Students see teacher + global notifications" ON public.notifications
  FOR SELECT USING (
    is_draft = false AND (
      is_global = true
      OR teacher_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.enrollments
        WHERE enrollments.student_id = auth.uid()
          AND enrollments.teacher_id = notifications.teacher_id
      )
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role IN ('teacher', 'admin')
      )
    )
  );


-- ─── 4. UPGRADE FEEDBACK: Reply notification flag ───

ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS has_unread_reply BOOLEAN DEFAULT FALSE;


-- ─── 5. MARK EXISTING NOTIFICATIONS AS GLOBAL ───
-- So existing notifications remain visible to everyone
UPDATE public.notifications SET is_global = true WHERE teacher_id IS NULL;
