-- Add game statistics columns to pvp_lobbies table
-- This migration adds columns to store statistics for both host and joined players

-- Host Statistics columns
ALTER TABLE public.pvp_lobbies 
ADD COLUMN IF NOT EXISTS host_total_questions integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS host_correct_answers integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS host_wrong_answers integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS host_accuracy_percent float,
ADD COLUMN IF NOT EXISTS host_total_time_ms integer,
ADD COLUMN IF NOT EXISTS host_avg_time_per_question_ms float,
ADD COLUMN IF NOT EXISTS host_fastest_answer_ms integer,
ADD COLUMN IF NOT EXISTS host_slowest_answer_ms integer;

-- Joined Player Statistics columns
ALTER TABLE public.pvp_lobbies 
ADD COLUMN IF NOT EXISTS joined_total_questions integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS joined_correct_answers integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS joined_wrong_answers integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS joined_accuracy_percent float,
ADD COLUMN IF NOT EXISTS joined_total_time_ms integer,
ADD COLUMN IF NOT EXISTS joined_avg_time_per_question_ms float,
ADD COLUMN IF NOT EXISTS joined_fastest_answer_ms integer,
ADD COLUMN IF NOT EXISTS joined_slowest_answer_ms integer;
