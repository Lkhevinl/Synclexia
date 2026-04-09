-- ============================================================
-- FIX: User-specific notification tracking with dismiss/clear functionality
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create user_notifications table to track per-user notification state
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id BIGINT NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, notification_id)
);

-- 2. Enable RLS on user_notifications
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own notification status" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can insert own notification status" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can update own notification status" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can delete own notification status" ON public.user_notifications;

-- 4. SELECT: Users can only see their own notification records
CREATE POLICY "Users can view own notification status"
  ON public.user_notifications FOR SELECT
  USING (auth.uid() = user_id);

-- 5. INSERT: Users can only create records for themselves
CREATE POLICY "Users can insert own notification status"
  ON public.user_notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. UPDATE: Users can only update their own records
CREATE POLICY "Users can update own notification status"
  ON public.user_notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. DELETE: Users can only delete their own records
CREATE POLICY "Users can delete own notification status"
  ON public.user_notifications FOR DELETE
  USING (auth.uid() = user_id);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_notification_id ON public.user_notifications(notification_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_dismissed ON public.user_notifications(is_dismissed);

-- 9. Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_notifications_updated_at ON public.user_notifications;
CREATE TRIGGER update_user_notifications_updated_at
  BEFORE UPDATE ON public.user_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Create helper function to dismiss a notification for a user
CREATE OR REPLACE FUNCTION public.dismiss_notification(p_notification_id BIGINT, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_notifications (user_id, notification_id, is_dismissed, dismissed_at)
  VALUES (p_user_id, p_notification_id, true, now())
  ON CONFLICT (user_id, notification_id)
  DO UPDATE SET is_dismissed = true, dismissed_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create helper function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id BIGINT, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_notifications (user_id, notification_id, is_read)
  VALUES (p_user_id, p_notification_id, true)
  ON CONFLICT (user_id, notification_id)
  DO UPDATE SET is_read = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create view for active notifications (not dismissed) per user
CREATE OR REPLACE VIEW public.active_notifications AS
SELECT 
  n.*,
  COALESCE(un.is_read, false) as is_read,
  COALESCE(un.is_dismissed, false) as is_dismissed
FROM public.notifications n
LEFT JOIN public.user_notifications un 
  ON n.id = un.notification_id 
  AND un.is_dismissed = false
WHERE n.is_draft = false;

-- ============================================================
-- END OF MIGRATION
-- ============================================================
