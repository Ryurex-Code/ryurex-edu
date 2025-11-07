'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/update-password`,
      });

      if (error) throw error;

      setSuccess(true);
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
          {/* Back Link */}
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-[#fee801] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Login</span>
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-16 h-16 bg-[#7c5cff] border-2 border-[#7c5cff] rounded-2xl mb-4"
            >
              <KeyRound className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Forgot Password?
            </h1>
            <p className="text-muted-foreground text-sm">
              No worries! Enter your email and we&apos;ll send you reset instructions.
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
                <Mail className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Check Your Email!</h3>
              <p className="text-muted-foreground text-sm mb-6">
                We&apos;ve sent password reset instructions to <span className="text-[#fee801] font-semibold">{email}</span>
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="text-[#fee801] hover:text-[#ffd700] text-sm font-semibold transition-colors"
              >
                Try another email
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
              <form onSubmit={handleResetPassword} className="space-y-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address
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

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-[#7c5cff] to-[#9575ff] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#7c5cff]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </motion.button>
              </form>

              {/* Remember Password */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Remember your password?{' '}
                  <Link href="/login" className="text-[#fee801] hover:text-[#ffd700] hover:underline font-semibold transition-colors">
                    Log In
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
