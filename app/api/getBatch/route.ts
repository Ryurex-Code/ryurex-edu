import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get category and subcategory from query params
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get('category');
    const subcategoryFilter = searchParams.get('subcategory');

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user exists in public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    console.log('=== VOCAB BATCH DEBUG ===');
    console.log(`📅 Today's date: ${today}`);

    // Get words that are due for review (ONLY words due today)
    let progressQuery = supabase
      .from('user_vocab_progress')
      .select(`
        vocab_id,
        fluency,
        next_due,
        vocab_master (
          id,
          indo,
          english,
          class,
          category,
          subcategory
        )
      `)
      .eq('user_id', user.id)
      .lte('next_due', today)
      .order('next_due', { ascending: true })
      .order('fluency', { ascending: true })
      .limit(10);

    // Apply category filter if provided
    if (categoryFilter) {
      console.log(`🎯 Filtering by category: ${categoryFilter}`);
      progressQuery = progressQuery.eq('vocab_master.category', categoryFilter);
    }

    // Apply subcategory filter if provided
    if (subcategoryFilter) {
      console.log(`📊 Filtering by subcategory: ${subcategoryFilter}`);
      progressQuery = progressQuery.eq('vocab_master.subcategory', parseInt(subcategoryFilter));
    }

    const { data: progressWords, error: progressError } = await progressQuery;

    if (progressError) {
      console.error('❌ Error fetching progress words:', progressError);
    }

    const words = progressWords || [];

    console.log(`✅ Found ${words.length} words due for review today`);
    
    if (words.length > 0) {
      console.log('📝 Review words:');
      words.forEach((w: unknown, idx: number) => {
        const word = w as { vocab_master?: { indo: string }; next_due: string; fluency: number };
        console.log(`  ${idx + 1}. ${word.vocab_master?.indo} (next_due: ${word.next_due}, fluency: ${word.fluency})`);
      });
    }

    // NEW BEHAVIOR: Only return words that are due today
    // Do NOT fetch new words if less than 10
    // Let the user know there are no more words to review today
    
    console.log(`📊 Final batch: ${words.length} words (review due today only)`);

    // Format response
    const formattedWords = words.map((item: unknown) => {
      const word = item as { vocab_master?: { id: number; indo: string; english: string; class: string; category: string; subcategory: number }; vocab_id: number; fluency: number; next_due: string };
      return {
        vocab_id: word.vocab_master?.id || word.vocab_id,
        indo: word.vocab_master?.indo,
        english: word.vocab_master?.english,
        class: word.vocab_master?.class,
        category: word.vocab_master?.category,
        subcategory: word.vocab_master?.subcategory,
        fluency: word.fluency,
        next_due: word.next_due,
      };
    });

    return NextResponse.json({
      success: true,
      words: formattedWords,
      count: formattedWords.length,
    });

  } catch (error: Error | unknown) {
    console.error('Error fetching batch:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
