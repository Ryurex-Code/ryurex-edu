'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart3, BookOpen, LogOut, Play, Clock, Search, Edit2, Zap, Menu, X, Sword } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import ThemeToggle from '@/components/ThemeToggle';
import EditDisplayNameModal from '@/components/EditDisplayNameModal';
import Leaderboard from '@/components/Leaderboard';
import Footer from '@/components/Footer';
import Image from 'next/image';

// Helper function to convert 'a1-oxford' to 'A1 Oxford'
const formatCategoryName = (category: string): string => {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface UserStats {
  user: {
    id: string;
    username: string;
    email: string;
    xp: number;
    streak: number;
    display_name?: string;
  };
  stats: {
    words_due_today: number;
    sentences_due_today: number;
    words_learned: number;
  };
}

interface Category {
  name: string;
  count: number;
  learned_count: number;
  icon: string;
}

export default function DashboardPage() {
  const [, setUser] = useState<SupabaseUser | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
            if (isMounted) {
              setUserStats(data);
              setDisplayName(data.user.display_name || data.user.username || '');
            }
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
  }, [supabase.auth]);

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
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-card border-b border-theme">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <Link href="/dashboard" className="flex items-center gap-3 cursor-pointer">
              <Image
                src="/favicon.svg"
                alt="Ryurex Edu Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <div className="flex flex-col">
                <div className="text-lg font-bold text-primary-yellow leading-none">
                  Ryurex
                </div>
                <div className="text-xs font-semibold text-primary-yellow tracking-wide">
                  EDU
                </div>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center justify-center w-10 h-10 bg-primary-yellow rounded-lg hover:bg-primary-yellow-hover transition-colors cursor-pointer"
              >
                <Edit2 className="w-5 h-5 text-black" />
              </button>
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-10 h-10 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu - Theme Toggle + Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 hover:bg-theme rounded-lg transition-colors cursor-pointer"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <motion.div
            initial={false}
            animate={isMobileMenuOpen ? { height: 'auto' } : { height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3 border-t border-theme">
              <button
                onClick={() => {
                  setIsEditModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:text-primary-yellow transition-colors cursor-pointer rounded-lg hover:bg-theme"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Name</span>
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        </div>
      </nav>

      {/* Main Content - Add padding-top untuk navbar fixed */}
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                Welcome back, <span className="text-primary-yellow">{displayName || userStats?.user.display_name || 'User'}</span>!
              </h1>
              <p className="text-muted-foreground text-lg">
                Ready to train your vocabulary today? Let&apos;s get started! 🚀
              </p>
            </div>
          </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: BookOpen, label: 'Words Learned', value: userStats?.stats.words_learned || 0, iconBg: 'bg-primary-yellow', iconColor: 'text-black' },
            { icon: Clock, label: 'Words Due Today', value: userStats?.stats.words_due_today || 0, iconBg: 'bg-secondary-purple', iconColor: 'text-white' },
            { icon: BarChart3, label: 'Sentences Due Today', value: userStats?.stats.sentences_due_today || 0, iconBg: 'bg-secondary-purple', iconColor: 'text-white' },
            { icon: Zap, label: 'Total XP', value: userStats?.user.xp || 0, iconBg: 'bg-primary-yellow', iconColor: 'text-black' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-lg"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vocab Mode */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/vocab">
              <div className="group bg-card border-2 border-primary-yellow border-opacity-30 rounded-3xl p-8 hover:border-primary-yellow transition-colors cursor-pointer shadow-lg">
                <div className="flex items-center justify-center w-16 h-16 bg-primary-yellow rounded-2xl mb-4">
                  <Play className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Vocab Mode</h3>
                <p className="text-muted-foreground mb-4">
                  Practice Indonesian to English vocabulary translation
                </p>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-6 h-6 bg-primary-yellow rounded-md flex items-center justify-center">
                    <Clock className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-primary-yellow font-semibold">
                    {userStats?.stats.words_due_today || 0} words due today
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Sentence Mode */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link href="/sentence">
              <div className="group bg-card border-2 border-secondary-purple border-opacity-30 rounded-3xl p-8 hover:border-secondary-purple transition-colors cursor-pointer shadow-lg">
                <div className="flex items-center justify-center w-16 h-16 bg-secondary-purple rounded-2xl mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Sentence Mode</h3>
                <p className="text-muted-foreground mb-4">
                  Practice vocabulary in context with full sentences
                </p>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-6 h-6 bg-secondary-purple rounded-md flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-secondary-purple font-semibold">
                    {userStats?.stats.sentences_due_today || 0} sentences due today
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* PvP Mode */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Link href="/pvp">
              <div className="group bg-card border-2 border-red-500 border-opacity-30 rounded-3xl p-8 hover:border-red-500 transition-colors cursor-pointer shadow-lg">
                <div className="flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-2xl mb-4">
                  <Sword className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">PvP Mode</h3>
                <p className="text-muted-foreground mb-4">
                  Challenge friends in head-to-head vocabulary battles
                </p>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-6 h-6 bg-red-500/20 rounded-md flex items-center justify-center">
                    <Sword className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-red-500 font-semibold">
                    Competitive
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Leaderboard Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12"
        >
          <Leaderboard />
        </motion.div>

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
              className="w-full pl-12 pr-4 py-4 bg-card rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors shadow-lg"
            />
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredCategories.map((category, index) => {
              const learnedCount = category.learned_count || 0;
              const totalWords = category.count;
              const progressPercentage = totalWords > 0 ? (learnedCount / totalWords) * 100 : 0;

              return (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                >
                  <Link href={`/category-menu/${encodeURIComponent(category.name)}`}>
                    <div className="group bg-card rounded-2xl hover:border-primary-yellow transition-all cursor-pointer h-full flex flex-col overflow-hidden shadow-lg">
                      {/* Image Container - Full width with rounded top corners */}
                      <div className="relative w-full aspect-square bg-gradient-to-br from-primary-yellow-light to-secondary-purple-light flex items-center justify-center">
                        <Image 
                          src={`/images/categories/${category.name.toLowerCase()}.svg`}
                          alt={category.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            // Fallback to default image if category image doesn't exist
                            e.currentTarget.src = '/images/categories/default.svg';
                          }}
                        />
                        
                      </div>
                      
                      {/* Content Section */}
                      <div className="p-4 flex flex-col flex-grow">
                        {/* Category Name */}
                        <h3 className="text-lg font-bold text-center mb-3 group-hover:text-primary-yellow transition-colors">
                          {formatCategoryName(category.name)}
                        </h3>

                        {/* Progress Bar */}
                        <div className="mb-4 space-y-1">
                          <div className="w-full bg-input border border-input rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercentage}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className="h-full bg-primary-yellow"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground text-center">
                            {learnedCount} of {totalWords} learned
                          </p>
                        </div>
                        
                        {/* Play Button */}
                        <button className="w-full py-2 bg-primary-yellow text-black rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary-yellow-hover transition-colors group-hover:scale-105 cursor-pointer">
                          <Play className="w-4 h-4" />
                          Play
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No categories found matching &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </motion.div>

        {/* Edit Display Name Modal */}
        <EditDisplayNameModal
          isOpen={isEditModalOpen}
          currentDisplayName={displayName}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={(newDisplayName) => {
            setDisplayName(newDisplayName);
          }}
        />
        </div>
      </div>

      {/* Full-width Footer */}
      <Footer />
    </div>
  );
}
