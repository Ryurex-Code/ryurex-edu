import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface VocabMaster {
  id: number;
  indo: string;
  english: string;
  class: string;
  category: string;
  subcategory: number;
  sentence_english: string;
  sentence_indo: string;
}

interface UserProgressRow {
  vocab_id: number;
  fluency_sentence: number;
  next_due_sentence: string;
  vocab_master: VocabMaster | VocabMaster[];
}

export async function GET() {
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
    const todayStr = new Date().toISOString().split('T')[0];

    console.log(`🔍 Looking for sentences due today (${todayStr}) for user ${userId}`);

    // Step 1: Get all vocab_master records with sentence_english
    const { data: allVocabWithSentences, error: allVocabError } = await supabase
      .from('vocab_master')
      .select('id')
      .not('sentence_english', 'is', null);

    if (allVocabError) {
      console.error('❌ Error fetching vocab with sentences:', allVocabError);
      return NextResponse.json(
        { error: 'Failed to fetch sentences', success: false },
        { status: 500 }
      );
    }

    const vocabIdsWithSentences = (allVocabWithSentences as Array<{ id: number }>).map(v => v.id);
    console.log(`📊 Total vocab with sentence_english: ${vocabIdsWithSentences.length}`);

    // Step 2: Get user's progress for these vocab
    const { data: userProgress, error: progressError } = await supabase
      .from('user_vocab_progress')
      .select(`
        vocab_id,
        fluency_sentence,
        next_due_sentence
      `)
      .eq('user_id', userId)
      .in('vocab_id', vocabIdsWithSentences);

    if (progressError) {
      console.error('❌ Error fetching user progress:', progressError);
      return NextResponse.json(
        { error: 'Failed to fetch progress', success: false },
        { status: 500 }
      );
    }

    // Step 3: Identify missing vocab IDs (not yet initialized for this user)
    const existingVocabIds = new Set((userProgress as Array<{ vocab_id: number }>).map(p => p.vocab_id));
    const missingVocabIds = vocabIdsWithSentences.filter(id => !existingVocabIds.has(id));

    console.log(`📋 User has progress for: ${existingVocabIds.size} vocab, missing: ${missingVocabIds.length}`);

    // Step 4: Initialize missing vocab (create progress records with fluency_sentence = 0, next_due_sentence = today)
    if (missingVocabIds.length > 0) {
      const { error: initError } = await supabase
        .from('user_vocab_progress')
        .insert(
          missingVocabIds.map(vocabId => ({
            user_id: userId,
            vocab_id: vocabId,
            fluency_sentence: 0,
            next_due_sentence: todayStr,
            fluency: 0,
            next_due: todayStr,
          }))
        );

      if (initError && !initError.message.includes('duplicate')) {
        console.warn('⚠️ Warning initializing new progress:', initError);
      } else {
        console.log(`✅ Initialized ${missingVocabIds.length} new sentence records`);
      }
    }

    // Step 5: Now fetch ALL sentences due today with their full data
    const { data: userProgress2, error: progressError2 } = await supabase
      .from('user_vocab_progress')
      .select(`
        vocab_id,
        fluency_sentence,
        next_due_sentence,
        vocab_master:vocab_id(
          id,
          indo,
          english,
          class,
          category,
          subcategory,
          sentence_english,
          sentence_indo
        )
      `)
      .eq('user_id', userId)
      .in('vocab_id', vocabIdsWithSentences)
      .lte('next_due_sentence', todayStr)
      .order('next_due_sentence', { ascending: true })
      .order('fluency_sentence', { ascending: true });

    if (progressError2) {
      console.error('❌ Error fetching sentence batch:', progressError2);
      return NextResponse.json(
        { error: 'Failed to fetch sentences', success: false },
        { status: 500 }
      );
    }

    console.log(`📊 Raw data from DB: ${(userProgress2 || []).length} records found`);
    (userProgress2 || []).forEach((p: UserProgressRow, idx: number) => {
      const vocab = p.vocab_master instanceof Array ? p.vocab_master[0] : p.vocab_master;
      console.log(`  [${idx}] vocab_id=${p.vocab_id}, next_due_sentence=${p.next_due_sentence}, has_sentence=${!!vocab?.sentence_english}`);
    });

    // Step 6: Filter out records where sentence_english is null
    const filteredProgress = (userProgress2 || []).filter((progress: UserProgressRow) => {
      const vocab = progress.vocab_master instanceof Array ? progress.vocab_master[0] : progress.vocab_master;
      return vocab && vocab.sentence_english !== null && vocab.sentence_english !== undefined;
    });

    console.log(`✅ After filtering: ${filteredProgress.length} records with valid sentences`);

    // Transform data to match expected format
    const words = filteredProgress.map((progress: UserProgressRow) => {
      const vocab = progress.vocab_master instanceof Array ? progress.vocab_master[0] : progress.vocab_master;
      return {
        vocab_id: progress.vocab_id,
        indo: vocab.indo,
        english: vocab.english,
        class: vocab.class,
        category: vocab.category,
        subcategory: vocab.subcategory,
        sentence_english: vocab.sentence_english,
        sentence_indo: vocab.sentence_indo,
        fluency_sentence: progress.fluency_sentence,
        next_due_sentence: progress.next_due_sentence,
      };
    });

    console.log(`📚 Fetched ${words.length} sentences due today for user ${userId}`);
    if (words.length === 0) {
      console.log('⚠️ No sentences found. Debug info:');
      console.log(`   - Total records with progress: ${(userProgress || []).length}`);
      console.log(`   - Total after filter: ${filteredProgress.length}`);
      if (filteredProgress.length > 0) {
        filteredProgress.forEach((p: UserProgressRow) => {
          const vocab = p.vocab_master instanceof Array ? p.vocab_master[0] : p.vocab_master;
          console.log(`     vocab_id=${p.vocab_id}, sentence_english="${vocab?.sentence_english?.substring(0, 30)}..."`);
        });
      }
    }

    return NextResponse.json({
      success: true,
      words,
      count: words.length,
    });
  } catch (error) {
    console.error('❌ Unexpected error in getSentenceBatch:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
