'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
      {/* Background gradient effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#fee801]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7c5cff]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Level up your English vocabulary{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[#fee801] to-[#7c5cff] bg-clip-text text-transparent">
                the smart way
              </span>
              <Sparkles className="absolute -top-2 -right-8 w-6 h-6 md:w-8 md:h-8 text-primary animate-pulse" />
            </span>
            💡
          </h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto"
          >
            An adaptive learning game that gets smarter as you do.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-8 md:px-12 py-4 md:py-5 text-lg md:text-xl font-semibold bg-gradient-to-r from-[#fee801] to-[#D4AF37] text-[#0f1115] rounded-full shadow-lg overflow-hidden group"
              >
                <span className="relative z-10">Start Learning →</span>
                
                {/* Pulse animation effect */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-[#fee801] rounded-full"
                />
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#fee801] to-[#7c5cff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Optional illustration placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-16 relative"
          >
            <div className="w-full max-w-2xl mx-auto h-64 md:h-80 bg-gradient-to-br from-[#fee801]/10 to-[#7c5cff]/10 rounded-3xl border border-[#fee801]/20 flex items-center justify-center">
              <p className="text-gray-500 text-sm md:text-base">
                [Illustration Placeholder]
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
