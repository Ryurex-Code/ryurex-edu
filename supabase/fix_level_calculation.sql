-- ============================================
-- FIX: Update increment_user_xp function
-- ============================================
-- This ensures level calculation is consistent
-- Run this in Supabase SQL Editor
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
-- Verify the function
-- ============================================
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'increment_user_xp';

-- ============================================
-- Level System Reference
-- ============================================
-- Level 1:  0 - 49 XP    (needs 50 XP)
-- Level 2:  50 - 99 XP   (needs 50 XP)
-- Level 3:  100 - 169 XP (needs 70 XP)
-- Level 4:  170 - 249 XP (needs 80 XP)
-- Level 5:  250 - 349 XP (needs 100 XP)
-- Level 6:  350 - 449 XP (needs 100 XP)
-- Level 7:  450 - 599 XP (needs 150 XP)
-- Level 8:  600 - 799 XP (needs 200 XP)
-- Level 9:  800 - 999 XP (needs 200 XP)
-- Level 10: 1000+ XP     (MAX LEVEL)
-- ============================================
