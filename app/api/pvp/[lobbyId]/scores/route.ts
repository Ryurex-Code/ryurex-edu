import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ lobbyId: string }> }
) {
  try {
    const { lobbyId } = await context.params;
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch lobby
    const { data: lobby, error: fetchError } = await supabase
      .from('pvp_lobbies')
      .select('host_score, joined_score, host_user_id, joined_user_id')
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

    const bothSubmitted =
      lobby.host_score !== null && lobby.joined_score !== null;

    return NextResponse.json({
      hostScore: lobby.host_score,
      joinedScore: lobby.joined_score,
      bothSubmitted,
    });
  } catch (error) {
    console.error('Error in get-scores:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
