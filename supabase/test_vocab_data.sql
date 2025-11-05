-- Test script untuk verify vocab_master data
-- Run this in Supabase SQL Editor

-- Check if vocab_master table exists and has data
SELECT COUNT(*) as total_words FROM public.vocab_master;

-- Show first 10 words
SELECT id, indo, english, category 
FROM public.vocab_master 
LIMIT 10;

-- Check categories distribution
SELECT category, COUNT(*) as word_count 
FROM public.vocab_master 
GROUP BY category
ORDER BY category;
