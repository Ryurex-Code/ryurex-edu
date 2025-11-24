import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  try {
    // Get query parameters
    const searchParams = new URL(req.url).searchParams;
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');

    // Validate inputs
    if (!category || !subcategory) {
      return NextResponse.json(
        { error: 'Category and subcategory are required', success: false },
        { status: 400 }
      );
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    const userId = user.id;
    const subcategoryNum = parseInt(subcategory);

    // 1. Get all sentences in this category/subcategory with non-null sentence_english
    const { data: allSentences, error: fetchAllError } = await supabase
      .from('vocab_master')
      .select('id')
      .eq('category', category)
      .eq('subcategory', subcategoryNum)
      .not('sentence_english', 'is', null);

    if (fetchAllError) {
      console.error('❌ Error fetching total sentences:', fetchAllError);
      return NextResponse.json(
        { error: 'Failed to fetch sentences', success: false },
        { status: 500 }
      );
    }

    const totalAvailable = (allSentences as Array<{ id: number }>).length;

    if (totalAvailable === 0) {
      console.log('⚠️ No sentences with sentence_english content available');
      return NextResponse.json({
        success: true,
        words: [],
        count: 0,
        total_available: 0,
      });
    }

    // 2. Get user's progress for sentences in this category (for mixing review/new)
    const { data: userProgress, error: progressError } = await supabase
      .from('user_vocab_progress')
      .select('vocab_id, fluency_sentence')
      .eq('user_id', userId)
      .in(
        'vocab_id',
        (allSentences as Array<{ id: number }>).map((s) => s.id)
      );

    if (progressError) {
      console.error('❌ Error fetching user progress:', progressError);
      return NextResponse.json(
        { error: 'Failed to fetch progress', success: false },
        { status: 500 }
      );
    }

    // Separate review vs new sentences
    const reviewedVocabIds = new Set((userProgress as Array<{ vocab_id: number }>).map((p) => p.vocab_id));
    const reviewSentences = (allSentences as Array<{ id: number }>).filter((s) => reviewedVocabIds.has(s.id));
    const newSentences = (allSentences as Array<{ id: number }>).filter((s) => !reviewedVocabIds.has(s.id));

    // Get ALL available sentences (no hardcoded limit)
    const selectedVocabIds = [
      ...reviewSentences.map((s) => s.id),
      ...newSentences.map((s) => s.id),
    ];

    // 3. Fetch full data for selected sentences
    const { data: sentences, error: fetchError } = await supabase
      .from('vocab_master')
      .select(`
        id,
        indo,
        english,
        class,
        category,
        subcategory,
        sentence_english,
        sentence_indo
      `)
      .in('id', selectedVocabIds);

    if (fetchError) {
      console.error('❌ Error fetching selected sentences:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch sentences', success: false },
        { status: 500 }
      );
    }

    // 4. Auto-initialize progress for new sentences (create entries with fluency_sentence = 0)
    const newVocabIds = selectedVocabIds.filter((id) => !reviewedVocabIds.has(id));

    if (newVocabIds.length > 0) {
      const { error: initError } = await supabase
        .from('user_vocab_progress')
        .insert(
          newVocabIds.map((vocabId) => ({
            user_id: userId,
            vocab_id: vocabId,
            fluency_sentence: 0,
            next_due_sentence: new Date().toISOString().split('T')[0],
            fluency: 0,
            next_due: new Date().toISOString().split('T')[0],
          }))
        );

      if (initError && !initError.message.includes('duplicate')) {
        console.warn('⚠️ Warning initializing new progress:', initError);
      }
    }

    // 5. Get user's progress for selected sentences (after initialization)
    const { data: progressData } = await supabase
      .from('user_vocab_progress')
      .select('vocab_id, fluency_sentence, next_due_sentence')
      .eq('user_id', userId)
      .in('vocab_id', selectedVocabIds);

    const progressMap = new Map();
    if (progressData) {
      progressData.forEach((p) => {
        progressMap.set(p.vocab_id, p);
      });
    }

    // Transform data
    const words = (sentences as Array<{
      id: number;
      indo: string;
      english: string;
      class: string;
      category: string;
      subcategory: number;
      sentence_english: string;
      sentence_indo: string;
    }>).map((sentence) => {
      const progress = progressMap.get(sentence.id);
      return {
        vocab_id: sentence.id,
        indo: sentence.indo,
        english: sentence.english,
        class: sentence.class,
        category: sentence.category,
        subcategory: sentence.subcategory,
        sentence_english: sentence.sentence_english,
        sentence_indo: sentence.sentence_indo,
        fluency_sentence: progress?.fluency_sentence || 0,
        next_due_sentence: progress?.next_due_sentence,
      };
    });

    console.log(
      `📚 Fetched ${words.length} sentences for ${category} part ${subcategory} (${totalAvailable} available)`
    );

    return NextResponse.json({
      success: true,
      words,
      count: words.length,
      total_available: totalAvailable,
    });
  } catch (error) {
    console.error('❌ Unexpected error in getCustomSentenceBatch:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
