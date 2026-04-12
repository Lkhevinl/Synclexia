-- ============================================================
-- DIAGNOSTIC: Run this in Supabase SQL Editor to find out
-- why "Couldn't Load Your Profile" is appearing.
-- Check each section's output carefully.
-- ============================================================

-- 1. Is the signup trigger installed?
SELECT
  CASE WHEN COUNT(*) > 0 THEN '✓ TRIGGER EXISTS' ELSE '✗ TRIGGER MISSING — run fix_signup_profile_trigger.sql' END AS trigger_status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 2. Is the is_admin() helper function installed?
SELECT
  CASE WHEN COUNT(*) > 0 THEN '✓ is_admin() EXISTS' ELSE '✗ is_admin() MISSING — run COMPREHENSIVE_RLS_FIX_ALL_USERS.sql' END AS is_admin_status
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'is_admin';

-- 3. Is the get_my_role() helper function installed?
SELECT
  CASE WHEN COUNT(*) > 0 THEN '✓ get_my_role() EXISTS' ELSE '✗ get_my_role() MISSING — run COMPREHENSIVE_RLS_FIX_ALL_USERS.sql' END AS get_my_role_status
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'get_my_role';

-- 4. Current RLS policies on the profiles table
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY cmd, policyname;

-- 5. Users in auth.users that have NO profile row
--    (these users will ALWAYS get "Couldn't Load Your Profile")
SELECT
  u.id,
  u.email,
  u.created_at,
  'MISSING PROFILE — INSERT manually or re-run trigger' AS issue
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC
LIMIT 20;

-- 6. All existing profiles (to confirm data is there)
SELECT id, email, full_name, role, created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 20;
