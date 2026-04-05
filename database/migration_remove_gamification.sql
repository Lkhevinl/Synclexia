-- ============================================================================
-- DATABASE MIGRATION: Remove Gamification Features
-- ============================================================================
-- This migration removes XP, Quests, and Leaderboard features from Synclexia
-- while preserving streaks and core learning analytics.
--
-- Tables to drop:
--   - quests (quest definitions)
--   - user_quests (user quest progress)
--   - quest_templates (template quests)
--   - quest_progress (quest tracking)
--   - user_progress_leaderboard (leaderboard data)
--   - achievements (achievement definitions)
--   - user_achievements (user achievements)
--
-- Columns to remove from profiles:
--   - xp (total XP earned)
--   - level (calculated level from XP)
--
-- Columns to remove from session_logs:
--   - xp_earned (XP earned per session)
--
-- Run this migration AFTER the application code has been updated
-- to no longer reference these tables/columns.
-- ============================================================================

-- Start transaction
BEGIN;

-- ============================================================================
-- STEP 1: Drop quest-related tables
-- ============================================================================

-- Drop quest_progress first (depends on quests and user_quests)
DROP TABLE IF EXISTS quest_progress;

-- Drop user_quests (depends on quests)
DROP TABLE IF EXISTS user_quests;

-- Drop quest_templates (depends on quests)
DROP TABLE IF EXISTS quest_templates;

-- Drop quests table
DROP TABLE IF EXISTS quests;

-- Drop quest tracking function if it exists
DROP FUNCTION IF EXISTS check_quest_progress(uuid, text);

-- ============================================================================
-- STEP 2: Drop leaderboard-related tables
-- ============================================================================

DROP TABLE IF EXISTS user_progress_leaderboard;

-- ============================================================================
-- STEP 3: Drop achievement-related tables (if they exist)
-- ============================================================================

DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS achievements;

-- ============================================================================
-- STEP 4: Remove XP/level columns from profiles table
-- ============================================================================

-- Remove xp column
ALTER TABLE profiles DROP COLUMN IF EXISTS xp;

-- Remove level column (this is typically calculated from xp)
ALTER TABLE profiles DROP COLUMN IF EXISTS level;

-- ============================================================================
-- STEP 5: Remove xp_earned column from session_logs table
-- ============================================================================

ALTER TABLE session_logs DROP COLUMN IF EXISTS xp_earned;

-- ============================================================================
-- STEP 6: Clean up any orphaned RLS policies
-- ============================================================================

-- Drop RLS policies for removed tables (these may fail silently if already gone)
DO $$
BEGIN
    -- Attempt to drop policies for quests table
    BEGIN
        DROP POLICY IF EXISTS "Enable read access for all users" ON quests;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON quests;
        DROP POLICY IF EXISTS "Enable update for users based on user_id" ON quests;
        DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON quests;
    EXCEPTION WHEN undefined_table THEN
        NULL;
    END;

    -- Attempt to drop policies for user_quests table
    BEGIN
        DROP POLICY IF EXISTS "Enable read access for own quests" ON user_quests;
        DROP POLICY IF EXISTS "Enable insert for own quests" ON user_quests;
        DROP POLICY IF EXISTS "Enable update for own quests" ON user_quests;
        DROP POLICY IF EXISTS "Enable delete for own quests" ON user_quests;
    EXCEPTION WHEN undefined_table THEN
        NULL;
    END;

    -- Attempt to drop policies for leaderboard table
    BEGIN
        DROP POLICY IF EXISTS "Enable read access for all users" ON user_progress_leaderboard;
    EXCEPTION WHEN undefined_table THEN
        NULL;
    END;
END $$;

-- ============================================================================
-- STEP 7: Commit transaction
-- ============================================================================

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (optional - run these to confirm cleanup)
-- ============================================================================

-- Check that quest tables are gone:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('quests', 'user_quests', 'quest_templates', 'quest_progress', 
--                    'user_progress_leaderboard', 'achievements', 'user_achievements');
-- Should return 0 rows

-- Check that xp/level columns are gone from profiles:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name = 'profiles' 
-- AND column_name IN ('xp', 'level');
-- Should return 0 rows

-- Check that xp_earned column is gone from session_logs:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name = 'session_logs' 
-- AND column_name = 'xp_earned';
-- Should return 0 rows
