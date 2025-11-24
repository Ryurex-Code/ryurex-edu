-- ============================================
-- Sentence Mode Migration
-- Add sentence columns to vocab_master and user_vocab_progress
-- ============================================

-- Add sentence columns to vocab_master
ALTER TABLE IF EXISTS public.vocab_master 
ADD COLUMN IF NOT EXISTS sentence_english text,
ADD COLUMN IF NOT EXISTS sentence_indo text;

-- Add sentence fluency tracking to user_vocab_progress
ALTER TABLE IF EXISTS public.user_vocab_progress
ADD COLUMN IF NOT EXISTS fluency_sentence float DEFAULT 0 CHECK (fluency_sentence >= 0 AND fluency_sentence <= 10),
ADD COLUMN IF NOT EXISTS next_due_sentence date DEFAULT CURRENT_DATE;

-- Create index for efficient sentence fetching
CREATE INDEX IF NOT EXISTS idx_vocab_sentence ON public.vocab_master(sentence_english) 
WHERE sentence_english IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_vocab_next_due_sentence ON public.user_vocab_progress(next_due_sentence);

-- ============================================
-- Sample Sentence Data (Optional - seed for testing)
-- ============================================
-- Uncomment and run to seed sample sentences for categories with existing vocab

-- UPDATE vocab_master 
-- SET 
--   sentence_english = 'The cat sat on the mat',
--   sentence_indo = 'Kucing itu duduk di atas tikar'
-- WHERE english = 'cat' AND category = 'animal' AND sentence_english IS NULL;

-- Note: Add more sentences using similar UPDATE statements
-- Format: sentence_english should contain the English translation with all key words from the vocab
--         sentence_indo should be the Indonesian translation

-- ============================================
-- NOTES
-- ============================================
-- 1. Run this migration in Supabase SQL Editor
-- 2. Add sentence data for existing vocab using UPDATE statements
-- 3. Recommended: 5-10 sentences per category minimum
-- 4. fluency_sentence and next_due_sentence tracked separately from word fluency
-- 5. Sentence mode uses same user_vocab_progress row, but different fluency metrics
