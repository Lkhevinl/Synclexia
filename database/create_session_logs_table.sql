-- ============================================================
-- SESSION LOGS TABLE — The core of completion tracking
-- Every activity session result is persisted here
-- ============================================================

CREATE TABLE IF NOT EXISTS public.session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,        -- 'phonics', 'phonics_blend', 'phonics_rhyme', 'phonics_segment', 'spelling', 'writing', 'reading', 'scan'
  score INTEGER DEFAULT 0,                   -- points or correct count
  total INTEGER DEFAULT 0,                   -- total items in session
  accuracy DECIMAL(5,2) DEFAULT 0,           -- percentage 0.00 - 100.00
  duration_seconds INTEGER DEFAULT 0,        -- time spent in seconds
  xp_earned INTEGER DEFAULT 0,              -- XP awarded for this session
  details JSONB DEFAULT '{}',               -- flexible: wrong answers, words attempted, difficulty level, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_session_logs_student ON public.session_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_activity ON public.session_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_session_logs_created ON public.session_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_logs_student_activity ON public.session_logs(student_id, activity_type);

-- Enable Row Level Security
ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;

-- Students can insert their own logs
CREATE POLICY "Students can insert their own session logs" ON public.session_logs
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Students can view their own logs
CREATE POLICY "Students can view their own session logs" ON public.session_logs
  FOR SELECT USING (auth.uid() = student_id);

-- Teachers can view logs of their enrolled students
CREATE POLICY "Teachers can view enrolled student logs" ON public.session_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.teacher_id = auth.uid()
        AND enrollments.student_id = session_logs.student_id
    )
  );

-- Admins can view all logs
CREATE POLICY "Admins can view all session logs" ON public.session_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
