import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface SentenceResult {
  vocab_id: number;
  correct: boolean;
  hintClickCount: number;
}

interface SubmitPayload {
  results: SentenceResult[];
}

interface ProgressUpdate {
  user_id: string;
  vocab_id: number;
  fluency_sentence: number;
  next_due_sentence: string;
  xp_earned: number;
  last_reviewed: string;
  correct_count: number;
  wrong_count: number;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    const userId = user.id;
    const body: SubmitPayload = await req.json();
    const { results } = body;

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: 'Invalid results format', success: false },
        { status: 400 }
      );
    }

    const todayStr = new Date().toISOString().split('T')[0];
    let totalXpGained = 0;
    const updates: ProgressUpdate[] = [];

    // Process each result
    for (const result of results) {
      const { vocab_id, correct, hintClickCount } = result;

      // Fetch current progress
      const { data: progressData, error: fetchError } = await supabase
        .from('user_vocab_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('vocab_id', vocab_id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error(`❌ Error fetching progress for vocab ${vocab_id}:`, fetchError);
        continue;
      }

      const currentProgress = progressData;
      const isPreviouslyStudied = !!currentProgress;

      // Calculate fluency_sentence change
      let fluencyChange = 0;
      let daysUntilNext = 0;

      if (correct) {
        // Correct answer
        fluencyChange = 1;

        // Check if it's next_due_sentence today (only +1 if it is)
        const isNextDueToday =
          !isPreviouslyStudied ||
          currentProgress.next_due_sentence === todayStr;

        if (!isNextDueToday) {
          // Was scheduled for later, but user practiced anyway - don't give fluency boost
          fluencyChange = 0;
          daysUntilNext = 1; // Review again tomorrow
        } else {
          // Was due today - calculate normal progression
          const newFluency = (currentProgress?.fluency_sentence || 0) + 1;
          const clampedFluency = Math.min(10, Math.max(0, newFluency));

          if (clampedFluency <= 2) {
            daysUntilNext = clampedFluency;
          } else {
            // Exponential formula: days = round(7 × 1.7^(fluency - 3))
            daysUntilNext = Math.round(7 * Math.pow(1.7, clampedFluency - 3));
          }
        }
      } else {
        // Wrong answer
        fluencyChange = -1;
        daysUntilNext = 0; // Force review today
      }

      // Calculate new fluency_sentence
      const oldFluencySentence = currentProgress?.fluency_sentence || 0;
      const newFluencySentence = Math.max(0, Math.min(10, oldFluencySentence + fluencyChange));

      // Calculate next_due_sentence
      const nextDueSentence = new Date(new Date(todayStr).getTime() + daysUntilNext * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      // Calculate XP with hint penalty
      let xpGain = 0;
      if (correct) {
        if (hintClickCount === 0) {
          xpGain = 10; // Full XP - no hint
        } else if (hintClickCount === 1) {
          xpGain = 5; // 50% XP - 1 hint click
        } else {
          xpGain = 1; // Minimal XP - 2+ hint clicks
        }
      } else {
        xpGain = 1; // Participation bonus for wrong answer (no hint penalty for wrong)
      }

      totalXpGained += xpGain;

      // Prepare update
      updates.push({
        user_id: userId,
        vocab_id,
        fluency_sentence: newFluencySentence,
        next_due_sentence: nextDueSentence,
        xp_earned: (currentProgress?.xp_earned || 0) + xpGain,
        last_reviewed: new Date().toISOString(),
        correct_count: (currentProgress?.correct_count || 0) + (correct ? 1 : 0),
        wrong_count: (currentProgress?.wrong_count || 0) + (correct ? 0 : 1),
      });

      console.log(
        `📝 Sentence ${vocab_id}: ${correct ? '✅' : '❌'} | fluency: ${oldFluencySentence} → ${newFluencySentence} | next_due: ${nextDueSentence} | XP: +${xpGain} (hints: ${hintClickCount})`
      );
    }

    // Batch upsert updates
    if (updates.length > 0) {
      const { error: upsertError } = await supabase
        .from('user_vocab_progress')
        .upsert(updates, { onConflict: 'user_id,vocab_id' });

      if (upsertError) {
        console.error('❌ Error upserting progress:', upsertError);
        return NextResponse.json(
          { error: 'Failed to save progress', success: false },
          { status: 500 }
        );
      }
    }

    // Update user XP
    if (totalXpGained > 0) {
      const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('xp')
        .eq('id', userId)
        .single();

      if (!userFetchError && userData) {
        const newXp = (userData.xp || 0) + totalXpGained;

        const { error: updateError } = await supabase
          .from('users')
          .update({
            xp: newXp,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          console.error('❌ Error updating user XP:', updateError);
        }
      }
    }

    // Update streak (if any correct answer)
    const hasCorrect = results.some((r) => r.correct);
    if (hasCorrect) {
      const { data: userData } = await supabase
        .from('users')
        .select('last_activity_date, streak')
        .eq('id', userId)
        .single();

      if (userData) {
        const lastActivityDate = new Date(userData.last_activity_date || '2000-01-01')
          .toISOString()
          .split('T')[0];
        const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];

        let newStreak = userData.streak || 0;
        if (lastActivityDate !== todayStr) {
          newStreak = lastActivityDate === yesterday ? (newStreak || 0) + 1 : 1;
        }

        await supabase
          .from('users')
          .update({
            last_activity_date: todayStr,
            streak: newStreak,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      }
    }

    console.log(`✅ Sentence batch submission complete: +${totalXpGained} XP`);

    return NextResponse.json({
      success: true,
      message: 'Sentence results submitted successfully',
      xpGained: totalXpGained,
      resultsProcessed: results.length,
    });
  } catch (error) {
    console.error('❌ Unexpected error in submitSentenceBatch:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
