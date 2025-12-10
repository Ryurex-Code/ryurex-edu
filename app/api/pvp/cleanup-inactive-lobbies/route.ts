import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Cleanup inactive lobbies that haven't been updated in 12 hours
 * This endpoint can be called periodically via cron or scheduled job
 * 
 * For security, this should ideally be called with an internal API key
 * or from a scheduled backend task, not from client-side
 */
export async function POST(request: NextRequest) {
  try {
    // Security: Check for internal API key or authorization
    const apiKey = request.headers.get('x-api-key');
    const internalKey = process.env.INTERNAL_API_KEY;
    
    // Allow if internal API key matches or if it's from localhost (dev)
    const isAuthorized = 
      apiKey === internalKey || 
      request.nextUrl.hostname === 'localhost' ||
      request.nextUrl.hostname === '127.0.0.1';
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    console.log('🧹 Starting cleanup of inactive lobbies...');

    // Call the cleanup function
    const { data, error } = await supabase.rpc('delete_inactive_pvp_lobbies');

    if (error) {
      console.error('Error cleaning up lobbies:', error);
      return NextResponse.json(
        { error: 'Failed to cleanup lobbies', details: error.message },
        { status: 500 }
      );
    }

    const deletedCount = data?.[0]?.deleted_count || 0;
    console.log(`✅ Cleaned up ${deletedCount} inactive lobbies`);

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} inactive lobbies`,
      deletedCount,
    });
  } catch (error) {
    console.error('Error in cleanup-inactive-lobbies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
