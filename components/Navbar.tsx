'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0f1115]/80 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <GraduationCap className="w-8 h-8 text-[#fee801] group-hover:scale-110 transition-transform" />
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#fee801] to-[#7c5cff] bg-clip-text text-transparent">
              Ryurex Edu Vocab Game
            </span>
          </Link>

          {/* Auth Buttons & Theme Toggle */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {user ? (
              <>
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-4 md:px-6 py-2 text-sm md:text-base text-gray-300 hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">Dashboard</span>
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 md:px-6 py-2 text-sm md:text-base bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </motion.button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 md:px-6 py-2 text-sm md:text-base text-gray-300 hover:text-white transition-colors"
                  >
                    Login
                  </motion.button>
                </Link>
                <Link href="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(254, 232, 1, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 md:px-6 py-2 text-sm md:text-base bg-[#fee801] hover:bg-[#ffd700] text-[#0f1115] rounded-lg font-medium transition-all"
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

