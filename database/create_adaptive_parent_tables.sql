-- ============================================================
-- PARENT LINKS TABLE
-- Links parent accounts to their children (students).
-- A parent can have multiple children.
-- A student can have multiple parent accounts linked.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.parent_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_parent_student UNIQUE(parent_id, student_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_parent_links_parent  ON public.parent_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_links_student ON public.parent_links(student_id);

-- Enable Row Level Security
ALTER TABLE public.parent_links ENABLE ROW LEVEL SECURITY;

-- Parents can see their own links
CREATE POLICY "Parents can view their links" ON public.parent_links
  FOR SELECT USING (auth.uid() = parent_id);

-- Admins can insert/manage links
CREATE POLICY "Admins can manage parent links" ON public.parent_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- ============================================================
-- ADAPTIVE STATE TABLE
-- Tracks per-student per-activity adaptive difficulty level.
-- Written by adaptiveEngine.js after every session.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.adaptive_state (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type  VARCHAR(60) NOT NULL,
  current_level  INTEGER NOT NULL DEFAULT 1 CHECK (current_level BETWEEN 1 AND 3),
  attempts       INTEGER NOT NULL DEFAULT 0,
  correct_streak INTEGER NOT NULL DEFAULT 0,
  last_updated   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_adaptive_state UNIQUE(student_id, activity_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_adaptive_state_student   ON public.adaptive_state(student_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_state_activity  ON public.adaptive_state(activity_type);

-- Enable Row Level Security
ALTER TABLE public.adaptive_state ENABLE ROW LEVEL SECURITY;

-- Students can read and upsert their own state
CREATE POLICY "Students can manage their adaptive state" ON public.adaptive_state
  FOR ALL USING (auth.uid() = student_id);

-- Admins can read all; parents can read linked child state
CREATE POLICY "Admins and parents can view adaptive state" ON public.adaptive_state
  FOR SELECT USING (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'parent' AND public.is_my_child(student_id))
  );
