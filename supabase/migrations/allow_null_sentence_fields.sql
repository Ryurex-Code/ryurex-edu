-- ============================================
-- Migration: Allow NULL for sentence fields
-- When vocab has no sentence_english/sentence_indo,
-- fluency_sentence and next_due_sentence should be NULL
-- ============================================

-- Step 1: Drop existing constraints on fluency_sentence and next_due_sentence
-- Note: We need to drop the CHECK constraint first before altering column

ALTER TABLE IF EXISTS public.user_vocab_progress
  ALTER COLUMN fluency_sentence DROP NOT NULL,
  ALTER COLUMN fluency_sentence DROP DEFAULT;

-- Step 2: Recreate the CHECK constraint without NOT NULL requirement
-- Remove old CHECK constraint if exists
ALTER TABLE IF EXISTS public.user_vocab_progress
  DROP CONSTRAINT IF EXISTS user_vocab_progress_fluency_sentence_check;

-- Add new CHECK constraint that allows NULL
ALTER TABLE IF EXISTS public.user_vocab_progress
  ADD CONSTRAINT user_vocab_progress_fluency_sentence_check 
  CHECK (fluency_sentence IS NULL OR (fluency_sentence >= 0 AND fluency_sentence <= 10));

-- Step 3: Allow NULL for next_due_sentence
ALTER TABLE IF EXISTS public.user_vocab_progress
  ALTER COLUMN next_due_sentence DROP NOT NULL,
  ALTER COLUMN next_due_sentence DROP DEFAULT;

-- ============================================
-- NOTES
-- ============================================
-- 1. fluency_sentence can now be NULL when vocab has no sentence_english
-- 2. next_due_sentence can now be NULL when vocab has no sentence_english
-- 3. Application logic should initialize these as NULL only for vocab without sentences
-- 4. For vocab with sentences, initialize with fluency_sentence=0 and next_due_sentence=TODAY
-- 5. This maintains backward compatibility - existing rows with values remain unchanged
