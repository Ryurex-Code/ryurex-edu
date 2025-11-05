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

    let words = progressWords || [];

    console.log(`✅ Found ${words.length} words due for review today`);
    
    if (words.length > 0) {
      console.log('📝 Review words:');
      words.forEach((w: any, idx: number) => {
        console.log(`  ${idx + 1}. ${w.vocab_master?.indo} (next_due: ${w.next_due}, fluency: ${w.fluency})`);
      });
    }

    // NEW BEHAVIOR: Only return words that are due today
    // Do NOT fetch new words if less than 10
    // Let the user know there are no more words to review today
    
    console.log(`📊 Final batch: ${words.length} words (review due today only)`);

    // Format response
    const formattedWords = words.map((item: any) => ({
      vocab_id: item.vocab_master?.id || item.vocab_id,
      indo: item.vocab_master?.indo,
      english: item.vocab_master?.english,
      class: item.vocab_master?.class,
      category: item.vocab_master?.category,
      subcategory: item.vocab_master?.subcategory,
      fluency: item.fluency,
      next_due: item.next_due,
    }));

    return NextResponse.json({
      success: true,
      words: formattedWords,
      count: formattedWords.length,
    });

  } catch (error: any) {
    console.error('Error fetching batch:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
