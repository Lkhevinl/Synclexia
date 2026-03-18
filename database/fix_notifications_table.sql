-- ============================================================
-- FIX: notifications table — add missing columns + fix RLS
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add missing columns (safe, no-op if already exist)
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS target_role TEXT DEFAULT 'all';

-- 2. Backfill existing rows
UPDATE public.notifications SET target_role = 'all' WHERE target_role IS NULL;

-- Teacherless cleanup: if legacy columns exist, remove them
DROP INDEX IF EXISTS public.idx_notifications_teacher_id;
DROP INDEX IF EXISTS public.idx_notifications_teacher;
ALTER TABLE public.notifications DROP COLUMN IF EXISTS teacher_id;
ALTER TABLE public.notifications DROP COLUMN IF EXISTS is_global;

-- 3. Enable RLS (no-op if already enabled)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Drop ALL existing policies (old and new names) to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view published notifications"                  ON public.notifications;
DROP POLICY IF EXISTS "Students see teacher + global notifications"              ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage notifications"                          ON public.notifications;
DROP POLICY IF EXISTS "Teachers can manage own notifications"                    ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can view published notifications"     ON public.notifications;
DROP POLICY IF EXISTS "Admins and teachers can insert notifications"             ON public.notifications;
DROP POLICY IF EXISTS "Admins can update any notification"                       ON public.notifications;
DROP POLICY IF EXISTS "Teachers can update own notifications"                    ON public.notifications;
DROP POLICY IF EXISTS "Admins can delete any notification"                       ON public.notifications;
DROP POLICY IF EXISTS "Teachers can delete own notifications"                    ON public.notifications;
DROP POLICY IF EXISTS "Admins can insert notifications"                          ON public.notifications;
DROP POLICY IF EXISTS "Admins can update notifications"                          ON public.notifications;
DROP POLICY IF EXISTS "Admins can delete notifications"                          ON public.notifications;

-- 5. SELECT: authenticated users can read published notifications matching their role
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

-- 6. INSERT: admins only
CREATE POLICY "Admins can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.get_my_role() = 'admin');

-- 6b. INSERT: teachers can send published student announcements (no drafts)
CREATE POLICY "Teachers can insert student notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    public.get_my_role() = 'teacher'
    AND is_draft = false
    AND target_role = 'student'
  );

-- 7. UPDATE: admins only
CREATE POLICY "Admins can update notifications"
  ON public.notifications FOR UPDATE
  USING (public.get_my_role() = 'admin');

-- 8. DELETE: admins only
CREATE POLICY "Admins can delete notifications"
  ON public.notifications FOR DELETE
  USING (public.get_my_role() = 'admin');
