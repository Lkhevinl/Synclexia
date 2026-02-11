-- Create enrollments table to manage teacher-student relationships
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_student_enrollment UNIQUE(student_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_enrollments_teacher_id ON public.enrollments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);

-- Enable Row Level Security
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can see their enrolled students
CREATE POLICY "Teachers can view their enrolled students" ON public.enrollments
  FOR SELECT USING (auth.uid() = teacher_id);

-- Policy: Students can see their enrollment
CREATE POLICY "Students can view their enrollment" ON public.enrollments
  FOR SELECT USING (auth.uid() = student_id);

-- Policy: Teachers can manage their enrollments
CREATE POLICY "Teachers can manage their enrollments" ON public.enrollments
  FOR ALL USING (auth.uid() = teacher_id);

-- Policy: Students can insert their enrollment
CREATE POLICY "Students can enroll" ON public.enrollments
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Policy: Students can delete their enrollment
CREATE POLICY "Students can unenroll" ON public.enrollments
  FOR DELETE USING (auth.uid() = student_id);
