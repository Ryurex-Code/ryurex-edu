-- ============================================
-- QUICK CHECK: Words Due Today
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Get your user ID first
SELECT id, username, email FROM auth.users LIMIT 5;

-- Step 2: Check words due TODAY (replace YOUR_USER_ID)
SELECT 
  uvp.vocab_id,
  vm.indo,
  vm.english,
  vm.category,
  uvp.fluency,
  uvp.next_due,
  uvp.correct_count,
  uvp.wrong_count,
  CASE 
    WHEN uvp.next_due < CURRENT_DATE THEN '🔴 OVERDUE'
    WHEN uvp.next_due = CURRENT_DATE THEN '🟡 DUE TODAY'
    WHEN uvp.next_due > CURRENT_DATE THEN '🟢 FUTURE'
  END as status
FROM public.user_vocab_progress uvp
JOIN public.vocab_master vm ON uvp.vocab_id = vm.id
WHERE uvp.user_id = 'YOUR_USER_ID'
ORDER BY uvp.next_due ASC, uvp.fluency ASC;

-- Step 3: Count by status
SELECT 
  CASE 
    WHEN next_due < CURRENT_DATE THEN 'OVERDUE'
    WHEN next_due = CURRENT_DATE THEN 'DUE TODAY'
    WHEN next_due > CURRENT_DATE THEN 'FUTURE'
  END as status,
  COUNT(*) as count
FROM public.user_vocab_progress
WHERE user_id = 'YOUR_USER_ID'
GROUP BY status;

-- Step 4: See today's date in database
SELECT CURRENT_DATE as today, NOW() as now_with_time;

-- Step 5: Force some words to be due today (for testing)
-- Uncomment to use:
/*
UPDATE public.user_vocab_progress
SET next_due = CURRENT_DATE
WHERE user_id = 'YOUR_USER_ID'
  AND vocab_id IN (1, 2, 3, 4, 5)
RETURNING vocab_id, next_due;
*/
