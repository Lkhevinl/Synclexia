-- ============================================================
-- FIX: session_logs table — add missing columns
-- Run this in your Supabase SQL Editor
-- ============================================================

ALTER TABLE public.session_logs ADD COLUMN IF NOT EXISTS accuracy       DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.session_logs ADD COLUMN IF NOT EXISTS duration_seconds INTEGER    DEFAULT 0;
ALTER TABLE public.session_logs ADD COLUMN IF NOT EXISTS xp_earned      INTEGER      DEFAULT 0;
ALTER TABLE public.session_logs ADD COLUMN IF NOT EXISTS details        JSONB        DEFAULT '{}';

-- Refresh the schema cache (forces PostgREST to re-read the table definition)
NOTIFY pgrst, 'reload schema';
