-- Create Maintenance Logs Table
-- This table stores system maintenance activities and updates

CREATE TABLE IF NOT EXISTS public.maintenance_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_type         VARCHAR(50) NOT NULL CHECK (log_type IN ('system_update', 'bug_fix', 'feature_added', 'database_change')),
  title            VARCHAR(200) NOT NULL,
  description      TEXT,
  performed_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_created
  ON public.maintenance_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_maintenance_logs_type
  ON public.maintenance_logs (log_type);

CREATE INDEX IF NOT EXISTS idx_maintenance_logs_performed_by
  ON public.maintenance_logs (performed_by);

-- Enable Row Level Security
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view maintenance logs
CREATE POLICY "Anyone can view maintenance logs" ON public.maintenance_logs
  FOR SELECT
  USING (true);

-- Policy: Only admins can create/update/delete maintenance logs
CREATE POLICY "Admins manage maintenance logs" ON public.maintenance_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add comment for documentation
COMMENT ON TABLE public.maintenance_logs IS 'Stores system maintenance activities and updates for transparency';
COMMENT ON COLUMN public.maintenance_logs.log_type IS 'Type of maintenance: system_update, bug_fix, feature_added, database_change';
COMMENT ON COLUMN public.maintenance_logs.title IS 'Brief title describing the maintenance activity';
COMMENT ON COLUMN public.maintenance_logs.description IS 'Detailed description of what was changed or updated';
COMMENT ON COLUMN public.maintenance_logs.performed_by IS 'Admin user who performed the maintenance';
