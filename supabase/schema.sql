-- ============================================
-- Ryurex Edu Vocab Game - Database Schema
-- Phase 3: Dashboard & Vocab Game
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table 1: users (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  display_name text,
  xp integer DEFAULT 0,
  streak integer DEFAULT 0,
  last_activity_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);

-- ============================================
-- Table 2: vocab_master
-- ============================================
CREATE TABLE IF NOT EXISTS public.vocab_master (
  id serial PRIMARY KEY,
  indo text NOT NULL,
  english text NOT NULL,
  class text,
  category text,
  subcategory smallint DEFAULT 1,
  created_at timestamp with time zone DEFAULT now()
);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_vocab_category ON public.vocab_master(category);
CREATE INDEX IF NOT EXISTS idx_vocab_class ON public.vocab_master(class);
CREATE INDEX IF NOT EXISTS idx_vocab_subcategory ON public.vocab_master(category, subcategory);

-- ============================================
-- Table 3: user_vocab_progress
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_vocab_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vocab_id integer NOT NULL REFERENCES public.vocab_master(id) ON DELETE CASCADE,
  fluency float DEFAULT 0 CHECK (fluency >= 0 AND fluency <= 10),
  next_due date DEFAULT CURRENT_DATE,
  last_reviewed timestamp with time zone,
  response_avg float DEFAULT 0,
  correct_count integer DEFAULT 0,
  wrong_count integer DEFAULT 0,
  xp_earned integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, vocab_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_vocab_user_id ON public.user_vocab_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vocab_next_due ON public.user_vocab_progress(next_due);
CREATE INDEX IF NOT EXISTS idx_user_vocab_fluency ON public.user_vocab_progress(fluency);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocab_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vocab_progress ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Vocab master policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view vocab"
  ON public.vocab_master FOR SELECT
  TO authenticated
  USING (true);

-- User vocab progress policies
CREATE POLICY "Users can view own progress"
  ON public.user_vocab_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.user_vocab_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_vocab_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON public.user_vocab_progress FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Triggers for updated_at timestamps
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_vocab_progress_updated_at
  BEFORE UPDATE ON public.user_vocab_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Function: Initialize user on signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, display_name, xp, level, streak)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    0,
    1,
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile on auth signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Function: Increment User XP (for batch updates)
-- ============================================

CREATE OR REPLACE FUNCTION public.increment_user_xp(
  user_id_input uuid,
  xp_amount integer
)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET 
    xp = xp + xp_amount,
    -- Simple linear level: every 100 XP = 1 level
    -- Level = floor(xp / 100) + 1
    level = FLOOR((xp + xp_amount) / 100.0) + 1,
    updated_at = now()
  WHERE id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- NOTES
-- ============================================
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Make sure to seed vocab_master table (see seed_vocab_data.sql)
-- 3. Test RLS policies by querying as authenticated user
-- 4. User profile is auto-created when user signs up
