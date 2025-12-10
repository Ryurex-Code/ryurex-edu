-- ============================================
-- Remove Sentence Mode Migration
-- Remove sentence columns from vocab_master and user_vocab_progress
-- Replace with AI-powered sentence generation
-- ============================================

-- Drop indexes related to sentences
DROP INDEX IF EXISTS public.idx_vocab_sentence;
DROP INDEX IF EXISTS public.idx_user_vocab_next_due_sentence;

-- Remove sentence columns from vocab_master
ALTER TABLE IF EXISTS public.vocab_master 
DROP COLUMN IF EXISTS sentence_english,
DROP COLUMN IF EXISTS sentence_indo;

-- Remove sentence fluency tracking from user_vocab_progress
ALTER TABLE IF EXISTS public.user_vocab_progress
DROP COLUMN IF EXISTS fluency_sentence,
DROP COLUMN IF EXISTS next_due_sentence;

-- ============================================
-- Notes
-- ============================================
-- 1. Sentence mode is now powered by AI (Groq API)
-- 2. No database sentence storage needed
-- 3. Sentences are generated dynamically per game session
-- 4. User progress still tracked via fluency column in user_vocab_progress
-- 5. All sentence UI pages replaced with AI Mode
