-- Update cleanup logic for inactive lobbies (12 hours inactivity)
-- This replaces the old 5-minute expires_at logic

-- Add updated_at column if not exists (for tracking last activity)
ALTER TABLE public.pvp_lobbies 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create helper function to update timestamp (create FIRST before using in trigger)
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create improved cleanup function for inactive lobbies
CREATE OR REPLACE FUNCTION delete_inactive_pvp_lobbies()
RETURNS TABLE(deleted_count int) AS $$
DECLARE
  v_deleted_count int;
BEGIN
  -- Delete lobbies that haven't been updated in 12 hours
  -- This includes lobbies in waiting, ready, or in_progress status
  DELETE FROM public.pvp_lobbies
  WHERE (NOW() - INTERVAL '12 hours') > COALESCE(updated_at, created_at)
    AND status NOT IN ('finished'); -- Keep finished games for history
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create index on updated_at for faster queries
CREATE INDEX IF NOT EXISTS idx_pvp_lobbies_updated_at 
ON public.pvp_lobbies(updated_at DESC);

-- Also keep index on created_at for reference
CREATE INDEX IF NOT EXISTS idx_pvp_lobbies_created_at_desc 
ON public.pvp_lobbies(created_at DESC);

-- Trigger to automatically update updated_at on any modification (AFTER function is defined)
CREATE OR REPLACE TRIGGER update_pvp_lobbies_updated_at
BEFORE UPDATE ON public.pvp_lobbies
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Note: Call delete_inactive_pvp_lobbies() periodically:
-- Option 1: Via application (e.g., cron job every 1 hour)
-- Option 2: Via pg_cron (if available):
--   SELECT cron.schedule('cleanup-inactive-lobbies', '0 * * * *', 'SELECT delete_inactive_pvp_lobbies();');
