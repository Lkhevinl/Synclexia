-- ============================================================
-- MIGRATION: Remove coins column from profiles table
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Drop the coins column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS coins;

-- 2. Drop the add_coins RPC function (if it exists)
DROP FUNCTION IF EXISTS public.add_coins(integer);
DROP FUNCTION IF EXISTS public.add_coins(amount integer);

-- 3. Drop the add_coins_to_user RPC function (if it exists)
DROP FUNCTION IF EXISTS public.add_coins_to_user(uuid, integer);
DROP FUNCTION IF EXISTS public.add_coins_to_user(target_user_id uuid, amount integer);

-- 4. (Optional) Drop coin-related columns from quests table if present
-- If your quests table has a coin_reward column and you want to remove it:
ALTER TABLE public.quests DROP COLUMN IF EXISTS coin_reward;

-- 5. Drop shop tables
DROP TABLE IF EXISTS public.user_inventory;
DROP TABLE IF EXISTS public.shop_items;
