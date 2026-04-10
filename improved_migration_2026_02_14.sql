-- MIGRATION: Improved RLS, Indexes, Validation, and Constraints for All Tables
-- Date: 2026-02-14

-- 1. ENROLLMENTS TABLE
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can view their enrolled students" ON public.enrollments;
CREATE POLICY "Teachers can view their enrolled students" ON public.enrollments
  FOR SELECT USING (auth.uid() = teacher_id);
DROP POLICY IF EXISTS "Students can view their enrollment" ON public.enrollments;
CREATE POLICY "Students can view their enrollment" ON public.enrollments
  FOR SELECT USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Teachers can manage their enrollments" ON public.enrollments;
CREATE POLICY "Teachers can manage their enrollments" ON public.enrollments
  FOR ALL USING (auth.uid() = teacher_id);
DROP POLICY IF EXISTS "Students can enroll" ON public.enrollments;
CREATE POLICY "Students can enroll" ON public.enrollments
  FOR INSERT WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "Students can unenroll" ON public.enrollments;
CREATE POLICY "Students can unenroll" ON public.enrollments
  FOR DELETE USING (auth.uid() = student_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_teacher_id ON public.enrollments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);

-- 2. ASSIGNMENTS TABLE
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can view their assignments" ON public.assignments;
CREATE POLICY "Teachers can view their assignments" ON public.assignments
  FOR SELECT USING (auth.uid() = teacher_id);
DROP POLICY IF EXISTS "Students can view their assignments" ON public.assignments;
CREATE POLICY "Students can view their assignments" ON public.assignments
  FOR SELECT USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Teachers can manage assignments" ON public.assignments;
CREATE POLICY "Teachers can manage assignments" ON public.assignments
  FOR ALL USING (auth.uid() = teacher_id);
DROP POLICY IF EXISTS "Students can mark as completed" ON public.assignments;
CREATE POLICY "Students can mark as completed" ON public.assignments
  FOR UPDATE USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assignments_student_id ON public.assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON public.assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_activity ON public.assignments(activity_type);

-- Constraint for allowed activity types
ALTER TABLE public.assignments
  ADD CONSTRAINT chk_activity_type CHECK (activity_type IN ('phonics', 'writing', 'reading', 'scan'));

-- 3. PROFILES TABLE
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 4. STORIES TABLE
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read stories" ON public.stories;
CREATE POLICY "Anyone can read stories" ON public.stories
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Teachers can insert stories" ON public.stories;
CREATE POLICY "Teachers can insert stories" ON public.stories
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'));
DROP POLICY IF EXISTS "Teachers can update stories" ON public.stories;
CREATE POLICY "Teachers can update stories" ON public.stories
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'));
DROP POLICY IF EXISTS "Teachers can delete stories" ON public.stories;
CREATE POLICY "Teachers can delete stories" ON public.stories
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stories_level ON public.stories(level);
CREATE INDEX IF NOT EXISTS idx_stories_title ON public.stories(title);

-- Constraints
ALTER TABLE public.stories
  ADD CONSTRAINT chk_level CHECK (level >= 1 AND level <= 5);

-- 5. PHONICS_ITEMS TABLE
ALTER TABLE public.phonics_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read phonics items" ON public.phonics_items;
CREATE POLICY "Anyone can read phonics items" ON public.phonics_items
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Teachers can manage phonics items" ON public.phonics_items;
CREATE POLICY "Teachers can manage phonics items" ON public.phonics_items
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_phonics_label ON public.phonics_items(label);

-- 6. SHOP_ITEMS TABLE
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read shop items" ON public.shop_items;
CREATE POLICY "Anyone can read shop items" ON public.shop_items
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage shop items" ON public.shop_items;
CREATE POLICY "Admins can manage shop items" ON public.shop_items
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shop_items_cost ON public.shop_items(cost);

-- 7. USER_INVENTORY TABLE
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their inventory" ON public.user_inventory;
CREATE POLICY "Users can view their inventory" ON public.user_inventory
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage their inventory" ON public.user_inventory;
CREATE POLICY "Users can manage their inventory" ON public.user_inventory
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON public.user_inventory(user_id);

-- 8. FEEDBACK TABLE
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert feedback" ON public.feedback;
CREATE POLICY "Users can insert feedback" ON public.feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view their feedback" ON public.feedback;
CREATE POLICY "Users can view their feedback" ON public.feedback
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage all feedback" ON public.feedback;
CREATE POLICY "Admins can manage all feedback" ON public.feedback
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);

-- 9. NOTIFICATIONS TABLE
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read notifications" ON public.notifications;
CREATE POLICY "Anyone can read notifications" ON public.notifications
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Teachers and Admins can manage notifications" ON public.notifications;
CREATE POLICY "Teachers and Admins can manage notifications" ON public.notifications
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'teacher' OR role = 'admin')));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- 10. USER_QUESTS TABLE
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their quests" ON public.user_quests;
CREATE POLICY "Users can view their quests" ON public.user_quests
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their quests" ON public.user_quests;
CREATE POLICY "Users can update their quests" ON public.user_quests
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their quests" ON public.user_quests;
CREATE POLICY "Users can insert their quests" ON public.user_quests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_quests_user_id ON public.user_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_quest_id ON public.user_quests(quest_id);

-- 11. GENERAL: Add NOT NULL and UNIQUE constraints where appropriate

-- 11a. Ensure all existing NULL emails are set to unique placeholders before applying NOT NULL/UNIQUE constraints
DO $$
DECLARE
  r RECORD;
  i INT := 1;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE email IS NULL LOOP
    UPDATE public.profiles SET email = 'placeholder_' || i || '@example.com' WHERE id = r.id;
    i := i + 1;
  END LOOP;
END$$;

-- 11b. Add NOT NULL constraint (safe after all emails are filled)
ALTER TABLE public.profiles
  ALTER COLUMN email SET NOT NULL;

-- 11c. Add UNIQUE constraint (safe after all emails are unique)
ALTER TABLE public.profiles
  ADD CONSTRAINT unique_email UNIQUE(email);

-- 12. GENERAL: Add CHECK constraints for data validation
-- (Example for feedback rating)
ALTER TABLE public.feedback
  ADD CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5);

-- 13. GENERAL: Use upserts for idempotent operations in your code (see questHelper.js)
-- Example:
-- INSERT INTO user_quests (user_id, quest_id, progress) VALUES (...) ON CONFLICT (user_id, quest_id) DO UPDATE SET progress = EXCLUDED.progress;

-- 14. GENERAL: For complex logic, use Supabase Edge Functions or Postgres functions/triggers as needed.

-- END OF MIGRATION
