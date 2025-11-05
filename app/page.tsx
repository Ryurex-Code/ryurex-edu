'use client';

import { motion } from 'framer-motion';
import { Clock, Target, Trophy, BarChart3, Quote } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeatureCard from '@/components/FeatureCard';
import Footer from '@/components/Footer';

export default function Home() {
  const features = [
    {
      icon: Clock,
      title: 'Adaptive Learning',
      description: 'Adjusts to your speed and learning style for optimal progress.',
    },
    {
      icon: Target,
      title: 'Smart Review',
      description: 'Spaced repetition built in to maximize retention and recall.',
    },
    {
      icon: Trophy,
      title: 'Gamified XP',
      description: 'Earn points and level up as you master new vocabulary.',
    },
    {
      icon: BarChart3,
      title: 'Track Progress',
      description: 'See how far you\'ve come with detailed analytics and insights.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      
      <Hero />

      {/* Feature Highlights Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-[#fee801] to-[#7c5cff] bg-clip-text text-transparent">
                Ryurex Edu
              </span>
              ?
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              Powerful features designed to accelerate your vocabulary learning journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Preview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#0a0c0f]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative p-8 md:p-12 bg-card rounded-3xl border border-theme"
          >
            <Quote className="absolute top-6 left-6 w-10 h-10 text-primary/30" />
            
            <div className="relative z-10 text-center">
              <p className="text-xl md:text-2xl lg:text-3xl font-medium mb-6 leading-relaxed">
                "It feels like playing a game, but I actually learn!"
              </p>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#fee801] to-[#7c5cff] rounded-full flex items-center justify-center text-[#0f1115] font-bold">
                  A
                </div>
                <div className="text-left">
                  <p className="font-semibold">Anonymous User</p>
                  <p className="text-sm text-gray-400">Beta Tester</p>
                </div>
              </div>
            </div>

            <Quote className="absolute bottom-6 right-6 w-10 h-10 text-[#7c5cff]/30 rotate-180" />
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

