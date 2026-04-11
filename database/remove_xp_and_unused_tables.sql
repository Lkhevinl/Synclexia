-- ============================================================
-- Remove XP system and unused tables
--
-- Drops:
--   • shop_items, user_inventory, user_notifications, writing_puzzles
--     (features never implemented)
--   • quests, user_quests  (XP quest system removed)
--   • profiles.xp column
--   • session_logs.xp_earned column
--   • add_xp() RPC function
--
-- Run in the Supabase SQL Editor.
-- ============================================================

-- ── Drop unused feature tables ────────────────────────────────

DROP TABLE IF EXISTS public.user_inventory     CASCADE;
DROP TABLE IF EXISTS public.shop_items         CASCADE;
DROP TABLE IF EXISTS public.user_notifications CASCADE;
DROP TABLE IF EXISTS public.writing_puzzles    CASCADE;

-- ── Drop XP quest tables ──────────────────────────────────────

DROP TABLE IF EXISTS public.user_quests CASCADE;
DROP TABLE IF EXISTS public.quests      CASCADE;

-- ── Drop XP columns ───────────────────────────────────────────

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS xp;

ALTER TABLE public.session_logs
  DROP COLUMN IF EXISTS xp_earned;

-- ── Drop add_xp RPC ───────────────────────────────────────────

DROP FUNCTION IF EXISTS public.add_xp(integer);
DROP FUNCTION IF EXISTS public.add_xp(amount integer);
DROP FUNCTION IF EXISTS public.add_xp(amount numeric);
