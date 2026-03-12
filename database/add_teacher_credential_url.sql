-- ============================================================
-- Add credential_url column to profiles for teacher ID uploads
-- Run this in your Supabase Dashboard → SQL Editor → New Query
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credential_url TEXT;

-- ─── Supabase Storage bucket for teacher credentials ────────────────────────
-- Run the following in Supabase Dashboard → Storage → New bucket:
--   Name: teacher-credentials
--   Public: false  (admin reviews these privately)
--
-- Then add this Storage policy so teachers can upload their own credential:
--   Policy name: Teacher upload own credential
--   Allowed operations: INSERT, UPDATE
--   Target roles: authenticated
--   USING expression: (auth.uid())::text = (storage.foldername(name))[1]
-- ─────────────────────────────────────────────────────────────────────────────
