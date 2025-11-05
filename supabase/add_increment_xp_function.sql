-- ============================================
-- ADD THIS TO SUPABASE SQL EDITOR
-- ============================================
-- This migration adds:
-- 1. xp_earned column to user_vocab_progress
-- 2. increment_user_xp RPC function
-- ============================================

-- STEP 1: Add xp_earned column
-- ============================================
ALTER TABLE public.user_vocab_progress 
ADD COLUMN IF NOT EXISTS xp_earned integer DEFAULT 0;

-- STEP 2: Create increment_user_xp function
-- ============================================
-- Function: Increment User XP (for batch updates)
-- ============================================

CREATE OR REPLACE FUNCTION public.increment_user_xp(
  user_id_input uuid,
  xp_amount integer
)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET 
    xp = xp + xp_amount,
    level = CASE 
      WHEN (xp + xp_amount) >= 1000 THEN 10
      WHEN (xp + xp_amount) >= 800 THEN 9
      WHEN (xp + xp_amount) >= 600 THEN 8
      WHEN (xp + xp_amount) >= 450 THEN 7
      WHEN (xp + xp_amount) >= 350 THEN 6
      WHEN (xp + xp_amount) >= 250 THEN 5
      WHEN (xp + xp_amount) >= 170 THEN 4
      WHEN (xp + xp_amount) >= 100 THEN 3
      WHEN (xp + xp_amount) >= 50 THEN 2
      ELSE 1
    END,
    updated_at = now()
  WHERE id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 3: Verify Installation
-- ============================================

-- Check if xp_earned column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_vocab_progress'
  AND column_name = 'xp_earned';
-- Expected: Should return 1 row with xp_earned | integer | 0

-- Check if function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'increment_user_xp';
-- Expected: Should return 1 row with increment_user_xp | FUNCTION

-- ============================================
-- TEST THE FUNCTION (Optional)
-- ============================================
-- Test with your user ID:
-- SELECT increment_user_xp('your-uuid-here', 100);
-- 
-- Then check:
-- SELECT id, xp, level FROM public.users WHERE id = 'your-uuid-here';

-- ============================================
-- NOTES:
-- ============================================
-- 1. Safe to run multiple times (IF NOT EXISTS, OR REPLACE)
-- 2. Existing progress records get xp_earned = 0
-- 3. Function uses SECURITY DEFINER (runs with creator's privileges)
-- 4. Level calculation is automatic based on XP thresholds
-- ============================================
