import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all categories with count
    const { data: categories, error: categoryError } = await supabase
      .from('vocab_master')
      .select('category, id')
      .order('category', { ascending: true });

    if (categoryError) {
      console.error('Error fetching categories:', categoryError);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    // Count vocab per category
    const categoryMap = new Map<string, { count: number; vocabIds: string[] }>();
    categories?.forEach((item: { category: string; id: string }) => {
      const existing = categoryMap.get(item.category) || { count: 0, vocabIds: [] };
      existing.count += 1;
      existing.vocabIds.push(item.id);
      categoryMap.set(item.category, existing);
    });

    // Get user's learned words (fluency > 0)
    const { data: progressData } = await supabase
      .from('user_vocab_progress')
      .select('vocab_id, fluency')
      .eq('user_id', user.id)
      .gt('fluency', 0);

    const learnedVocabIds = new Set(progressData?.map((p: { vocab_id: string }) => p.vocab_id) || []);

    // Convert to array with icons and learned count
    const categoryIcons: { [key: string]: string } = {
      'Emotion': '😊',
      'Family': '👨‍👩‍👧‍👦',
      'Food': '🍕',
      'Action': '🏃',
      'Nature': '🌳',
      'Animal': '🐶',
      'Color': '🎨',
      'Body': '👤',
      'Time': '⏰',
      'Place': '🏠',
      'Object': '📦',
    };

    const formattedCategories = Array.from(categoryMap.entries()).map(([name, data]) => {
      const learnedCount = data.vocabIds.filter(id => learnedVocabIds.has(id)).length;
      return {
        name,
        count: data.count,
        learned_count: learnedCount,
        icon: categoryIcons[name] || '📚',
      };
    });

    return NextResponse.json({
      success: true,
      categories: formattedCategories,
    });

  } catch (error) {
    console.error('Error in categories API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
