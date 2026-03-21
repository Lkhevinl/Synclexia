-- Enhanced Maintenance Logs Table
-- Captures admin maintenance, user concerns, bug reports, and system issues

-- Drop existing table and recreate with enhanced structure
DROP TABLE IF EXISTS public.maintenance_logs CASCADE;

CREATE TABLE public.maintenance_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Enhanced log types to capture all user feedback and system issues
  log_type          VARCHAR(50) NOT NULL CHECK (log_type IN (
    'system_update',      -- Admin system updates
    'bug_fix',           -- Admin bug fixes
    'feature_added',     -- Admin new features
    'database_change',   -- Admin database changes
    'user_concern',      -- User-reported concerns
    'bug_report',        -- User-reported bugs
    'parent_feedback',   -- Parent feedback/concerns
    'learner_issue',     -- Learner-specific issues
    'app_error',         -- System-detected errors
    'performance_issue', -- Performance problems
    'ui_problem',        -- UI/UX issues
    'content_issue'      -- Educational content problems
  )),

  -- Basic information
  title             VARCHAR(200) NOT NULL,
  description       TEXT,

  -- User information (who reported/performed)
  performed_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_role     VARCHAR(20) CHECK (reporter_role IN ('admin', 'teacher', 'parent', 'student')),

  -- Issue categorization
  priority          VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status            VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  category          VARCHAR(50), -- e.g., 'phonics', 'spelling', 'writing', 'navigation', 'login'

  -- Technical details
  device_info       JSONB, -- Device type, OS, app version, etc.
  error_details     JSONB, -- Error messages, stack traces, logs
  reproduction_steps TEXT, -- How to reproduce the issue

  -- Resolution tracking
  assigned_to       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at       TIMESTAMPTZ,
  resolution_notes  TEXT,

  -- Timestamps
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_maintenance_logs_created ON public.maintenance_logs (created_at DESC);
CREATE INDEX idx_maintenance_logs_type ON public.maintenance_logs (log_type);
CREATE INDEX idx_maintenance_logs_status ON public.maintenance_logs (status);
CREATE INDEX idx_maintenance_logs_priority ON public.maintenance_logs (priority);
CREATE INDEX idx_maintenance_logs_category ON public.maintenance_logs (category);
CREATE INDEX idx_maintenance_logs_performed_by ON public.maintenance_logs (performed_by);
CREATE INDEX idx_maintenance_logs_reported_by ON public.maintenance_logs (reported_by);

-- Enable RLS
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view logs relevant to them
CREATE POLICY "Users can view relevant maintenance logs" ON public.maintenance_logs
  FOR SELECT
  USING (
    -- Everyone can see system updates and general maintenance
    log_type IN ('system_update', 'feature_added', 'bug_fix', 'database_change')
    OR
    -- Users can see their own reports
    reported_by = auth.uid()
    OR
    -- Admins can see everything
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    -- Teachers can see system issues and general reports
    (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'teacher'
      )
      AND log_type IN ('system_update', 'feature_added', 'bug_fix', 'app_error', 'performance_issue')
    )
  );

-- Policy: Authenticated users can report issues
CREATE POLICY "Users can report issues" ON public.maintenance_logs
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND reported_by = auth.uid()
    AND log_type IN ('user_concern', 'bug_report', 'parent_feedback', 'learner_issue', 'ui_problem', 'content_issue')
  );

-- Policy: Admins can manage all logs
CREATE POLICY "Admins manage all logs" ON public.maintenance_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Users can update their own reports (add details)
CREATE POLICY "Users update own reports" ON public.maintenance_logs
  FOR UPDATE
  USING (
    reported_by = auth.uid()
    AND status = 'open'
  )
  WITH CHECK (
    reported_by = auth.uid()
    AND status = 'open'
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_maintenance_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_maintenance_logs_updated_at
  BEFORE UPDATE ON public.maintenance_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_maintenance_logs_updated_at();

-- Insert some sample user feedback categories for reference
INSERT INTO public.maintenance_logs (
  log_type, title, description, performed_by, priority, status
) VALUES
(
  'system_update',
  'Enhanced Maintenance Logs System',
  'Upgraded maintenance logs to capture user feedback, bug reports, and system issues from learners and parents. Now supports comprehensive issue tracking and resolution.',
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
  'high',
  'resolved'
);

-- Add helpful comments
COMMENT ON TABLE public.maintenance_logs IS 'Enhanced system for tracking admin maintenance, user concerns, bug reports, and system issues from all users';
COMMENT ON COLUMN public.maintenance_logs.log_type IS 'Type: system_update, bug_fix, feature_added, database_change, user_concern, bug_report, parent_feedback, learner_issue, app_error, performance_issue, ui_problem, content_issue';
COMMENT ON COLUMN public.maintenance_logs.reporter_role IS 'Role of person who reported: admin, teacher, parent, student';
COMMENT ON COLUMN public.maintenance_logs.priority IS 'Issue priority: low, medium, high, critical';
COMMENT ON COLUMN public.maintenance_logs.status IS 'Current status: open, in_progress, resolved, closed';
COMMENT ON COLUMN public.maintenance_logs.device_info IS 'JSON object with device details: type, OS, app version, screen size, etc.';
COMMENT ON COLUMN public.maintenance_logs.error_details IS 'JSON object with error information: messages, stack traces, logs';