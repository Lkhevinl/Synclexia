-- ============================================================
-- FIX: notifications table — add missing columns + fix RLS
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add missing columns (safe, no-op if already exist)
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS target_role TEXT DEFAULT 'all';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT TRUE;

-- 2. Backfill existing rows
UPDATE public.notifications SET target_role = 'all' WHERE target_role IS NULL;
UPDATE public.notifications SET is_global = true WHERE is_global IS NULL;

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

-- 5. SELECT: students, teachers, admins, parents can read published notifications
CREATE POLICY "Authenticated users can view published notifications"
  ON public.notifications FOR SELECT
  USING (
    is_draft = false
    AND auth.uid() IS NOT NULL
  );

-- 6. INSERT: admins and teachers can create notifications
CREATE POLICY "Admins and teachers can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'teacher')
    )
  );

-- 7. UPDATE: admins can update any, teachers can only update their own
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

-- 8. DELETE: admins can delete any, teachers can only delete their own
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
