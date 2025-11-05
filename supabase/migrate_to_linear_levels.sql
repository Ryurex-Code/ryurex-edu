-- ============================================
-- MIGRATION: Unlimited Linear Level System
-- ============================================
-- Changes level system from capped (max 10) 
-- to unlimited with fixed 100 XP per level
-- ============================================

-- STEP 1: Update increment_user_xp function
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
    -- Simple linear level: every 100 XP = 1 level
    -- Formula: level = floor(xp / 100) + 1
    -- Examples:
    --   0-99 XP   → Level 1
    --   100-199   → Level 2
    --   200-299   → Level 3
    --   435 XP    → Level 5 (floor(435/100) + 1 = 4 + 1 = 5)
    --   1000 XP   → Level 11
    --   9999 XP   → Level 100
    level = FLOOR((xp + xp_amount) / 100.0) + 1,
    updated_at = now()
  WHERE id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 2: Recalculate all existing user levels
-- ============================================

UPDATE public.users
SET 
  level = FLOOR(xp / 100.0) + 1,
  updated_at = now();

-- ============================================
-- STEP 3: Verify the changes
-- ============================================

-- Show all users with new level calculation
SELECT 
  username,
  xp,
  level,
  CONCAT((xp % 100), ' / 100 XP') as progress_display,
  ROUND(((xp % 100) / 100.0) * 100) as progress_percentage
FROM public.users
ORDER BY xp DESC;

-- ============================================
-- Examples of new level system:
-- ============================================
-- XP    | Level | Display
-- ------|-------|-------------
-- 0     | 1     | 0 / 100 XP
-- 50    | 1     | 50 / 100 XP
-- 99    | 1     | 99 / 100 XP
-- 100   | 2     | 0 / 100 XP
-- 150   | 2     | 50 / 100 XP
-- 199   | 2     | 99 / 100 XP
-- 200   | 3     | 0 / 100 XP
-- 435   | 5     | 35 / 100 XP  ← Your case
-- 1000  | 11    | 0 / 100 XP
-- 5000  | 51    | 0 / 100 XP
-- ============================================

-- Test increment function
-- SELECT increment_user_xp('your-user-id', 50);
-- Then check: SELECT username, xp, level FROM public.users WHERE id = 'your-user-id';
