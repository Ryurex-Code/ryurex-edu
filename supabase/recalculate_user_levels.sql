-- ============================================
-- QUICK FIX: Recalculate User Levels
-- ============================================
-- Run this to fix levels that don't match XP
-- Safe to run multiple times
-- ============================================

-- Show current user stats (before fix)
SELECT 
  id,
  username,
  xp,
  level,
  CASE 
    WHEN xp >= 1000 THEN 10
    WHEN xp >= 800 THEN 9
    WHEN xp >= 600 THEN 8
    WHEN xp >= 450 THEN 7
    WHEN xp >= 350 THEN 6
    WHEN xp >= 250 THEN 5
    WHEN xp >= 170 THEN 4
    WHEN xp >= 100 THEN 3
    WHEN xp >= 50 THEN 2
    ELSE 1
  END as correct_level,
  CASE 
    WHEN xp >= 1000 THEN 10
    WHEN xp >= 800 THEN 9
    WHEN xp >= 600 THEN 8
    WHEN xp >= 450 THEN 7
    WHEN xp >= 350 THEN 6
    WHEN xp >= 250 THEN 5
    WHEN xp >= 170 THEN 4
    WHEN xp >= 100 THEN 3
    WHEN xp >= 50 THEN 2
    ELSE 1
  END != level as needs_fix
FROM public.users
ORDER BY xp DESC;

-- Fix all users' levels based on their XP
UPDATE public.users
SET 
  level = CASE 
    WHEN xp >= 1000 THEN 10
    WHEN xp >= 800 THEN 9
    WHEN xp >= 600 THEN 8
    WHEN xp >= 450 THEN 7
    WHEN xp >= 350 THEN 6
    WHEN xp >= 250 THEN 5
    WHEN xp >= 170 THEN 4
    WHEN xp >= 100 THEN 3
    WHEN xp >= 50 THEN 2
    ELSE 1
  END,
  updated_at = now();

-- Show updated stats (after fix)
SELECT 
  id,
  username,
  xp,
  level,
  CASE 
    WHEN level = 1 THEN CONCAT(xp, ' / 50 XP')
    WHEN level = 2 THEN CONCAT((xp - 50), ' / 50 XP')
    WHEN level = 3 THEN CONCAT((xp - 100), ' / 70 XP')
    WHEN level = 4 THEN CONCAT((xp - 170), ' / 80 XP')
    WHEN level = 5 THEN CONCAT((xp - 250), ' / 100 XP')
    WHEN level = 6 THEN CONCAT((xp - 350), ' / 100 XP')
    WHEN level = 7 THEN CONCAT((xp - 450), ' / 150 XP')
    WHEN level = 8 THEN CONCAT((xp - 600), ' / 200 XP')
    WHEN level = 9 THEN CONCAT((xp - 800), ' / 200 XP')
    WHEN level = 10 THEN 'MAX LEVEL'
  END as progress_display
FROM public.users
ORDER BY xp DESC;

-- ============================================
-- Example: Fix specific user with 435 XP
-- ============================================
-- Should be Level 6 (350-449 range)
-- UPDATE public.users
-- SET level = 6, updated_at = now()
-- WHERE xp = 435;

-- Verify:
-- SELECT username, xp, level FROM public.users WHERE xp = 435;
-- Expected: level = 6, displays "85 / 100 XP"
