-- Add admin_comment field to maintenance_logs table
-- This allows admins to add comments/replies to maintenance logs

-- Add admin_comment column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'maintenance_logs'
        AND column_name = 'admin_comment'
    ) THEN
        ALTER TABLE public.maintenance_logs
        ADD COLUMN admin_comment TEXT;
    END IF;
END $$;

-- Add comment to document the new field
COMMENT ON COLUMN public.maintenance_logs.admin_comment IS 'Admin comments or responses to maintenance logs and user feedback';

-- Update RLS policies to allow admins to update admin_comment
-- The existing policy should already cover this, but let's ensure it's explicit

-- Update the existing update policy to specifically mention admin_comment
DROP POLICY IF EXISTS "Users can update own reports" ON public.maintenance_logs;

CREATE POLICY "Users can update own reports" ON public.maintenance_logs
  FOR UPDATE
  USING (
    reported_by = auth.uid() OR
    performed_by = auth.uid() OR
    (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'))
  );