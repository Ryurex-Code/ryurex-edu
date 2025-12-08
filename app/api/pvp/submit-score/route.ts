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

    const { lobbyId, playerRole, finalScore } = await request.json();

    if (!lobbyId || !playerRole || finalScore === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user is in this lobby
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

    // Verify user is host or joined_user
    if (playerRole === 'host' && user.id !== lobby.host_user_id) {
      return NextResponse.json(
        { error: 'Unauthorized: Not the host' },
        { status: 403 }
      );
    }

    if (playerRole === 'joined' && user.id !== lobby.joined_user_id) {
      return NextResponse.json(
        { error: 'Unauthorized: Not the joined player' },
        { status: 403 }
      );
    }

    // Update lobby with score
    const updateData =
      playerRole === 'host'
        ? { host_score: finalScore }
        : { joined_score: finalScore };

    const { error: updateError } = await supabase
      .from('pvp_lobbies')
      .update(updateData)
      .eq('id', lobbyId);

    if (updateError) {
      console.error('Error updating score:', updateError);
      return NextResponse.json(
        { error: 'Failed to submit score' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Score submitted successfully',
    });
  } catch (error) {
    console.error('Error in submit-score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
