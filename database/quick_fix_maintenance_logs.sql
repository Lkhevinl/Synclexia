-- Quick Fix: Create a working maintenance_logs table
-- This creates the table with the existing structure first, then we can enhance it later

-- Drop if exists and recreate
DROP TABLE IF EXISTS public.maintenance_logs CASCADE;

-- Create basic maintenance logs table that matches current code expectations
CREATE TABLE public.maintenance_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_type         VARCHAR(50) NOT NULL,
  title            VARCHAR(200) NOT NULL,
  description      TEXT,
  priority         VARCHAR(10) DEFAULT 'medium',
  status           VARCHAR(20) DEFAULT 'open',
  category         VARCHAR(50),
  reproduction_steps TEXT,
  device_info      JSONB,

  -- User tracking
  performed_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_role    VARCHAR(20),

  -- Timestamps
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_maintenance_logs_created_at ON public.maintenance_logs (created_at DESC);
CREATE INDEX idx_maintenance_logs_type ON public.maintenance_logs (log_type);
CREATE INDEX idx_maintenance_logs_status ON public.maintenance_logs (status);

-- Enable RLS
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Simple policies that work
CREATE POLICY "All users can view logs" ON public.maintenance_logs
  FOR SELECT
  USING (true);

CREATE POLICY "All users can insert logs" ON public.maintenance_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own reports" ON public.maintenance_logs
  FOR UPDATE
  USING (reported_by = auth.uid() OR performed_by = auth.uid());

-- Insert a test log to verify it works
INSERT INTO public.maintenance_logs (
  log_type,
  title,
  description,
  performed_by,
  status,
  priority
) VALUES (
  'system_update',
  'Enhanced Maintenance Logs System',
  'Successfully deployed the new maintenance tracking system with user feedback capabilities.',
  (SELECT id FROM auth.users LIMIT 1),
  'resolved',
  'medium'
);

-- Add comment
COMMENT ON TABLE public.maintenance_logs IS 'System maintenance and user feedback tracking';