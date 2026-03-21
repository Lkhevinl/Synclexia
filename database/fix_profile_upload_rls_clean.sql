-- Fix RLS Policies for Profile Updates and Image Uploads
-- Ensures admins can update their own profiles and upload images

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create policy: Admins can update any profile (for user management)
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

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Avatar uploads insert" ON storage.objects;
DROP POLICY IF EXISTS "Avatar uploads update" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to avatars bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Policy: Users can upload to their own avatar folder
CREATE POLICY "Allow authenticated uploads to avatars bucket" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR name LIKE 'avatar_' || auth.uid()::text || '%'
      OR name LIKE 'banner_' || auth.uid()::text || '%'
    )
  );

-- Policy: Users can update their own avatars
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

-- Policy: Anyone can view avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');