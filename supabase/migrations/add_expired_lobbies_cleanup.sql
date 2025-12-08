-- Create function to delete expired PvP lobbies
CREATE OR REPLACE FUNCTION delete_expired_pvp_lobbies()
RETURNS void AS $$
BEGIN
  DELETE FROM public.pvp_lobbies
  WHERE expires_at < NOW()
    AND status = 'waiting';
END;
$$ LANGUAGE plpgsql;

-- Create index on expires_at for faster queries
CREATE INDEX IF NOT EXISTS idx_pvp_lobbies_expires_at 
ON public.pvp_lobbies(expires_at) 
WHERE status = 'waiting';

-- Note: To run this cleanup automatically, you can:
-- 1. Use pg_cron extension (if available on your Supabase plan)
-- 2. Call this function from your application periodically
-- 3. Set up a scheduled job in your application backend

-- Example pg_cron setup (requires pg_cron extension):
-- SELECT cron.schedule('delete-expired-lobbies', '*/1 * * * *', 'SELECT delete_expired_pvp_lobbies()');
