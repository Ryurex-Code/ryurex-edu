'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Trophy, BarChart3, BookOpen, LogOut, Play, Clock, Flame, Search } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import ThemeToggle from '@/components/ThemeToggle';
import Image from 'next/image';

interface UserStats {
  user: {
    id: string;
    username: string;
    email: string;
    xp: number;
    level: number;
    streak: number;
  };
  stats: {
    words_due_today: number;
    words_learned: number;
    xp_progress: number;
    xp_needed: number;
    progress_percentage: number;
  };
}

interface Category {
  name: string;
  count: number;
  icon: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (isMounted) setUser(user);

      if (user) {
        // Fetch user stats from API
        try {
          const response = await fetch('/api/userStats');
          if (response.ok) {
            const data = await response.json();
            if (isMounted) setUserStats(data);
          }
        } catch (error) {
          console.error('Error fetching user stats:', error);
        }

        // Fetch categories
        try {
          const response = await fetch('/api/categories');
          if (response.ok) {
            const data = await response.json();
            if (isMounted) setCategories(data.categories);
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
        }
      }
      
      if (isMounted) setLoading(false);
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // Filter categories based on search query
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Dashboard
            </h1>
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Hi, <span className="text-[#fee801] font-semibold">{userStats?.user.username || user?.email}</span>! Ready to train your vocab today?
          </p>
        </motion.div>

        {/* XP Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 bg-card border-2 border-[#fee801]/30 rounded-2xl p-6"
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#fee801] rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-black" />
              </div>
              <span className="font-bold text-lg">Level {userStats?.user.level || 1}</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {userStats?.stats.xp_progress || 0} / {userStats?.stats.xp_needed || 100} XP
            </span>
          </div>
          <div className="w-full bg-input border border-input rounded-lg h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${userStats?.stats.progress_percentage || 0}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-[#fee801]"
            />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: BookOpen, label: 'Words Learned', value: userStats?.stats.words_learned || 0, iconBg: 'bg-[#fee801]', iconColor: 'text-black' },
            { icon: Clock, label: 'Words Due Today', value: userStats?.stats.words_due_today || 0, iconBg: 'bg-[#7c5cff]', iconColor: 'text-white' },
            { icon: Flame, label: 'Streak Days', value: userStats?.user.streak || 0, iconBg: 'bg-[#fee801]', iconColor: 'text-black' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-card border-2 border-theme rounded-2xl p-6 hover:border-[#fee801]/50 transition-colors"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 ${stat.iconBg} rounded-xl mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Game Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vocab Mode */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/vocab">
              <div className="group bg-card border-2 border-[#fee801]/30 rounded-3xl p-8 hover:border-[#fee801] transition-colors cursor-pointer">
                <div className="flex items-center justify-center w-16 h-16 bg-[#fee801] rounded-2xl mb-4">
                  <Play className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Vocab Mode</h3>
                <p className="text-muted-foreground mb-4">
                  Practice Indonesian to English vocabulary translation
                </p>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-6 h-6 bg-[#fee801] rounded-md flex items-center justify-center">
                    <Clock className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-[#fee801] font-semibold">
                    {userStats?.stats.words_due_today || 0} words due today
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Sentence Mode - Coming Soon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="relative bg-card border-2 border-theme rounded-3xl p-8 opacity-60 cursor-not-allowed">
              <div className="absolute top-4 right-4 px-3 py-1 bg-[#7c5cff] rounded-lg text-xs text-white font-semibold">
                Coming Soon
              </div>
              
              <div className="flex items-center justify-center w-16 h-16 bg-[#7c5cff] rounded-2xl mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Sentence Mode</h3>
              <p className="text-muted-foreground">
                Practice vocabulary in context with full sentences
              </p>
            </div>
          </motion.div>
        </div>

        {/* Category Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12"
        >
          {/* Section Title */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Browse by Category</h2>
            <p className="text-muted-foreground">Choose a category to practice specific vocabulary</p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-card border-2 border-theme rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#fee801] transition-colors"
            />
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.05 }}
              >
                <Link href={`/category-menu/${encodeURIComponent(category.name)}`}>
                  <div className="group bg-card border-2 border-theme rounded-2xl hover:border-[#fee801] transition-all cursor-pointer h-full flex flex-col overflow-hidden">
                    {/* Image Container - Full width with rounded top corners */}
                    <div className="relative w-full aspect-square bg-gradient-to-br from-[#fee801]/20 to-[#7c5cff]/20 flex items-center justify-center">
                      <Image 
                        src={`/images/categories/${category.name.toLowerCase()}.svg`}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                      
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-4 flex flex-col flex-grow">
                      {/* Category Name */}
                      <h3 className="text-lg font-bold text-center mb-2 group-hover:text-[#fee801] transition-colors">
                        {category.name}
                      </h3>
                      
                      {/* Word Count */}
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        {category.count} words
                      </p>
                      
                      {/* Play Button */}
                      <button className="w-full mt-auto py-2 bg-[#fee801] text-black rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#fef030] transition-colors group-hover:scale-105 cursor-pointer">
                        <Play className="w-4 h-4" />
                        Play
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No categories found matching "{searchQuery}"</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
