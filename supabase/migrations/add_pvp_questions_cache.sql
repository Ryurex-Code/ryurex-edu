-- Add questions_data column to pvp_lobbies to cache generated AI sentences
-- This ensures both players get the same questions

ALTER TABLE public.pvp_lobbies 
ADD COLUMN IF NOT EXISTS questions_data jsonb;

-- Add comment explaining the column
COMMENT ON COLUMN public.pvp_lobbies.questions_data IS 
'Cached questions for AI mode. Structure: [{"vocab_id": 1, "indo": "...", "english": "...", "sentence_indo": "...", "sentence_english": "..."}, ...]';
