-- Create assignments table to track teacher-assigned activities
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'phonics', 'writing', 'reading', 'scan'
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_assignment UNIQUE(teacher_id, student_id, activity_type)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_assignments_student_id ON public.assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON public.assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_activity ON public.assignments(activity_type);

-- Enable Row Level Security
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can see their assigned activities
CREATE POLICY "Teachers can view their assignments" ON public.assignments
  FOR SELECT USING (auth.uid() = teacher_id);

-- Policy: Students can see their assignments
CREATE POLICY "Students can view their assignments" ON public.assignments
  FOR SELECT USING (auth.uid() = student_id);

-- Policy: Teachers can manage assignments
CREATE POLICY "Teachers can manage assignments" ON public.assignments
  FOR ALL USING (auth.uid() = teacher_id);

-- Policy: Students can mark as completed
CREATE POLICY "Students can update completion status" ON public.assignments
  FOR UPDATE USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);
