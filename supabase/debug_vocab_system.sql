-- ============================================
-- DEBUG SCRIPT: Check Vocab Retrieval System
-- ============================================

-- 1. Check total words in vocab_master
SELECT 
  COUNT(*) as total_words,
  COUNT(DISTINCT category) as total_categories
FROM public.vocab_master;

-- 2. Check words by category
SELECT 
  category,
  COUNT(*) as word_count
FROM public.vocab_master
GROUP BY category
ORDER BY category;

-- 3. Check user progress (replace 'YOUR_USER_ID' with actual user ID)
-- Get this from: SELECT id, username FROM public.users;
SELECT 
  COUNT(*) as words_learned,
  AVG(fluency) as avg_fluency,
  SUM(CASE WHEN next_due <= CURRENT_DATE THEN 1 ELSE 0 END) as words_due_today,
  SUM(CASE WHEN next_due > CURRENT_DATE THEN 1 ELSE 0 END) as words_scheduled_future
FROM public.user_vocab_progress
WHERE user_id = 'YOUR_USER_ID';

-- 4. Check which words are due today
SELECT 
  vm.id,
  vm.indo,
  vm.english,
  vm.category,
  uvp.fluency,
  uvp.next_due,
  uvp.correct_count,
  uvp.wrong_count
FROM public.user_vocab_progress uvp
JOIN public.vocab_master vm ON uvp.vocab_id = vm.id
WHERE uvp.user_id = 'YOUR_USER_ID'
  AND uvp.next_due <= CURRENT_DATE
ORDER BY uvp.next_due ASC, uvp.fluency ASC
LIMIT 10;

-- 5. Check NEW words user hasn't learned yet
SELECT 
  vm.id,
  vm.indo,
  vm.english,
  vm.category
FROM public.vocab_master vm
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.user_vocab_progress uvp 
  WHERE uvp.vocab_id = vm.id 
    AND uvp.user_id = 'YOUR_USER_ID'
)
ORDER BY vm.id ASC
LIMIT 10;

-- 6. Get user's XP and stats
SELECT 
  u.id,
  u.username,
  u.xp,
  u.level,
  u.streak,
  u.last_activity_date,
  COUNT(uvp.vocab_id) as total_words_started
FROM public.users u
LEFT JOIN public.user_vocab_progress uvp ON u.id = uvp.user_id
WHERE u.id = 'YOUR_USER_ID'
GROUP BY u.id, u.username, u.xp, u.level, u.streak, u.last_activity_date;

-- 7. Check next review schedule for all user's words
SELECT 
  vm.indo,
  vm.english,
  uvp.fluency,
  uvp.next_due,
  uvp.next_due - CURRENT_DATE as days_until_review,
  CASE 
    WHEN uvp.next_due <= CURRENT_DATE THEN 'DUE NOW'
    WHEN uvp.next_due = CURRENT_DATE + 1 THEN 'TOMORROW'
    ELSE 'FUTURE'
  END as status
FROM public.user_vocab_progress uvp
JOIN public.vocab_master vm ON uvp.vocab_id = vm.id
WHERE uvp.user_id = 'YOUR_USER_ID'
ORDER BY uvp.next_due ASC;

-- ============================================
-- RESET USER PROGRESS (USE WITH CAUTION!)
-- ============================================
-- Uncomment below to reset a user's progress for testing

-- DELETE FROM public.user_vocab_progress WHERE user_id = 'YOUR_USER_ID';
-- UPDATE public.users SET xp = 0, level = 1, streak = 0 WHERE id = 'YOUR_USER_ID';

-- ============================================
-- FORCE ALL WORDS TO BE DUE TODAY (for testing)
-- ============================================
-- Uncomment to make all learned words due for review

-- UPDATE public.user_vocab_progress 
-- SET next_due = CURRENT_DATE 
-- WHERE user_id = 'YOUR_USER_ID';
