-- Fix RLS Policies for Profile Updates and Image Uploads
-- Ensures admins can update their own profiles and upload images

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Drop existing policies if they're too restrictive
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure admins can also update other profiles (for user management)
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- STORAGE BUCKET POLICIES
-- ============================================

-- Policy: Users can upload to their own folder in avatars bucket
-- This allows profile picture and cover photo uploads
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Avatar uploads insert" ON storage.objects;
DROP POLICY IF EXISTS "Avatar uploads update" ON storage.objects;

CREATE POLICY "Allow authenticated uploads to avatars bucket" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (
      -- Allow uploads to own folder (avatar_<user_id> or banner_<user_id>)
      auth.uid()::text = (storage.foldername(name))[1]
      OR name LIKE 'avatar_' || auth.uid()::text || '%'
      OR name LIKE 'banner_' || auth.uid()::text || '%'
    )
  );

CREATE POLICY "Allow authenticated updates to own avatars" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR name LIKE 'avatar_' || auth.uid()::text || '%'
      OR name LIKE 'banner_' || auth.uid()::text || '%'
    )
  );

-- Policy: Users can read all avatars (for viewing other profiles)
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if avatars bucket exists
DO $$
BEGIN
  -- If bucket doesn't exist, log a warning
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
    RAISE NOTICE 'WARNING: avatars bucket does not exist. Create it in Supabase Storage dashboard.';
  END IF;
END $$;

-- Display current RLS policies for verification
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'profiles' OR tablename = 'objects'
ORDER BY tablename, policyname;
