import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lobbyId } = await request.json();

    if (!lobbyId) {
      return NextResponse.json(
        { error: 'Missing lobbyId' },
        { status: 400 }
      );
    }

    // Fetch lobby data
    const { data: lobby, error: fetchError } = await supabase
      .from('pvp_lobbies')
      .select('*')
      .eq('id', lobbyId)
      .single();

    if (fetchError || !lobby) {
      return NextResponse.json(
        { error: 'Lobby not found' },
        { status: 404 }
      );
    }

    // Verify user is in this lobby
    if (user.id !== lobby.host_user_id && user.id !== lobby.joined_user_id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update lobby status to in_progress
    const { error: updateError } = await supabase
      .from('pvp_lobbies')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .eq('id', lobbyId);

    if (updateError) {
      console.error('Error updating lobby status:', updateError);
      return NextResponse.json(
        { error: 'Failed to start game' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Game started',
    });
  } catch (error) {
    console.error('Error in start-game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
