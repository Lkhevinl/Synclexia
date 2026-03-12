-- ============================================================
-- SYNCLEXIA: Fix chk_activity_type constraint on assignments table
-- Adds all activity types the app uses.
-- Run this in Supabase SQL Editor.
-- ============================================================

ALTER TABLE public.assignments
  DROP CONSTRAINT IF EXISTS chk_activity_type;

ALTER TABLE public.assignments
  ADD CONSTRAINT chk_activity_type
  CHECK (activity_type IN (
    'phonics',
    'phonics_activity',
    'phonics_blend',
    'phonics_rhyme',
    'phonics_segment',
    'spelling',
    'writing',
    'reading',
    'scan',
    'phonological_awareness',
    'speech_to_text',
    'text_to_speech'
  ));
