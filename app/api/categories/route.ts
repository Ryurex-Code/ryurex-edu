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
      .select('category')
      .order('category', { ascending: true });

    if (categoryError) {
      console.error('Error fetching categories:', categoryError);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    // Count vocab per category
    const categoryMap = new Map<string, number>();
    categories?.forEach((item: any) => {
      const count = categoryMap.get(item.category) || 0;
      categoryMap.set(item.category, count + 1);
    });

    // Convert to array with icons
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

    const formattedCategories = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
      icon: categoryIcons[name] || '📚',
    }));

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
