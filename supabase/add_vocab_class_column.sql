-- ============================================
-- Add 'class' column to vocab_master
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- Add class column (Noun, Verb, Adjective, etc.)
ALTER TABLE public.vocab_master 
ADD COLUMN IF NOT EXISTS class text;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_vocab_class ON public.vocab_master(class);

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'vocab_master'
ORDER BY ordinal_position;

-- ============================================
-- Example: Update existing words with class
-- ============================================
-- UPDATE public.vocab_master SET class = 'Noun' WHERE id IN (1, 2, 3);
-- UPDATE public.vocab_master SET class = 'Verb' WHERE id IN (4, 5, 6);
-- UPDATE public.vocab_master SET class = 'Adjective' WHERE id IN (7, 8);
