'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  // Check if user came from valid password reset link
  useEffect(() => {
    const checkSession = async () => {
      try {
        // First refresh the session to get the latest auth state
        await supabase.auth.refreshSession();
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsValidSession(true);
        } else {
          setError('Invalid or expired reset link. Please request a new one.');
        }
      } catch (err) {
        console.error('Session check error:', err);
        setError('Unable to verify session. Please request a new password reset link.');
      }
    };
    
    checkSession();
  }, [supabase]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: Error | unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
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
              className="inline-flex items-center justify-center w-16 h-16 bg-[#7c5cff] border-2 border-[#7c5cff] rounded-2xl mb-4"
            >
              <Lock className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Set New Password
            </h1>
            <p className="text-muted-foreground text-sm">
              Choose a strong password to secure your account
            </p>
          </div>

          {/* Success Message */}
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-500/10 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Password Updated!</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Your password has been successfully changed.
              </p>
              <p className="text-xs text-muted-foreground">
                Redirecting to login page...
              </p>
            </motion.div>
          ) : !isValidSession ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-red-500/10 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Invalid Link</h3>
              <p className="text-muted-foreground text-sm mb-6">
                This password reset link is invalid or has expired.
              </p>
              <button
                onClick={() => router.push('/forgot-password')}
                className="px-6 py-3 bg-gradient-to-r from-[#7c5cff] to-[#9575ff] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#7c5cff]/20 transition-all"
              >
                Request New Link
              </button>
            </motion.div>
          ) : (
            <>
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                {/* New Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    New Password
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
                    Confirm New Password
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
                  className="w-full py-3 bg-gradient-to-r from-[#fee801] to-[#ffd700] text-black rounded-lg font-semibold hover:shadow-lg hover:shadow-[#fee801]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating Password...' : 'Update Password'}
                </motion.button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
