'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Sparkles, UserPlus } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) {
        // Handle specific Supabase errors
        if (error.message.includes('already registered') || 
            error.message.includes('User already registered')) {
          throw new Error('This email is already registered. Please log in instead.');
        }
        throw error;
      }

      // Check if user was actually created or already exists
      // When email is already registered, Supabase returns user but with empty identities array
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError('This email is already registered. Please log in instead.');
        setLoading(false);
        return;
      }

      setMessage('Success! Check your email to confirm your account.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: Error | unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-md w-full"
      >
        {/* Card */}
        <div className="bg-card rounded-3xl border border-theme p-8 md:p-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-16 h-16 bg-[#fee801] border-2 border-[#fee801] rounded-2xl mb-4"
            >
              <UserPlus className="w-8 h-8 text-black" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Join Us! <Sparkles className="inline w-6 h-6 text-primary animate-pulse" />
            </h1>
            <p className="text-muted-foreground">Create your account and start learning</p>
          </div>

          {/* Error/Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 p-4 bg-[#fee801]/10 border border-[#fee801]/20 rounded-lg text-[#fee801] text-sm"
            >
              {message}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-input border border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder-muted-foreground"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3 bg-input border border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder-muted-foreground"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">At least 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-input border border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder-muted-foreground"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#fee801] to-[#ffd700] text-[#0f1115] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#fee801]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-[#fee801] hover:text-[#ffd700] hover:underline font-semibold transition-colors">
              Log In
            </Link>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
