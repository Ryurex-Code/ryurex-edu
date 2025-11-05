-- ============================================
-- MIGRATION: Add xp_earned column
-- ============================================
-- Run this in Supabase SQL Editor to fix the error:
-- "column user_vocab_progress.xp_earned does not exist"
-- ============================================

-- Add xp_earned column to user_vocab_progress table
ALTER TABLE public.user_vocab_progress 
ADD COLUMN IF NOT EXISTS xp_earned integer DEFAULT 0;

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_vocab_progress'
  AND column_name = 'xp_earned';

-- ============================================
-- NOTES:
-- ============================================
-- 1. This migration is safe to run multiple times (IF NOT EXISTS)
-- 2. Existing records will get xp_earned = 0 by default
-- 3. Future records will also default to 0
-- 4. The batch submission API now tracks XP per word
-- ============================================
