-- Remove unused columns from pvp_lobbies table
-- Remove random_seed and finished_at columns

ALTER TABLE public.pvp_lobbies
DROP COLUMN IF EXISTS random_seed,
DROP COLUMN IF EXISTS finished_at;
