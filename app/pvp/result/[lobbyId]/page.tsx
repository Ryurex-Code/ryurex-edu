'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Trophy, Home, RotateCcw } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

interface ResultData {
  hostName: string;
  joinedName: string;
  hostScore: number;
  joinedScore: number;
  winner: 'host' | 'joined' | 'tie';
  hostStats?: {
    correctAnswers: number;
    totalQuestions: number;
    avgTimeMs: number;
  } | null;
  joinedStats?: {
    correctAnswers: number;
    totalQuestions: number;
    avgTimeMs: number;
  } | null;
}

export default function PvPResultPage() {
  const router = useRouter();
  const params = useParams();
  const lobbyId = params.lobbyId as string;
  const supabase = createClient();

  const [user] = useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [userRole, setUserRole] = useState<'host' | 'joined' | null>(null);

  // Fetch result data
  useEffect(() => {
    const fetchResult = async () => {
      try {
        // Get current user
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser) {
          router.push('/login');
          return;
        }

        // Fetch lobby data
        const { data: lobby, error: lobbyError } = await supabase
          .from('pvp_lobbies')
          .select('*')
          .eq('id', lobbyId)
          .single();

        if (lobbyError || !lobby) {
          console.error('Lobby not found:', lobbyError);
          router.push('/pvp');
          return;
        }

        // Determine user role
        const role = authUser.id === lobby.host_user_id ? 'host' : 'joined';
        setUserRole(role);

        // Validate user is in this game
        if (role === 'joined' && authUser.id !== lobby.joined_user_id) {
          console.error('User not in this game');
          router.push('/pvp');
          return;
        }

        // Fetch player names
        const hostId = lobby.host_user_id;
        const joinedId = lobby.joined_user_id;

        // Get host name
        const { data: hostData } = await supabase
          .from('users')
          .select('display_name')
          .eq('id', hostId)
          .single();

        // Get joined name
        let joinedName = 'Unknown';
        if (joinedId) {
          const { data: joinedData } = await supabase
            .from('users')
            .select('display_name')
            .eq('id', joinedId)
            .single();
          joinedName = joinedData?.display_name || 'Unknown';
        }

        // Fetch game stats for both players from lobby table
        let hostStats = null;
        let joinedStats = null;

        // Get host stats from lobby
        if (lobby.host_total_questions > 0) {
          hostStats = {
            correctAnswers: lobby.host_correct_answers,
            totalQuestions: lobby.host_total_questions,
            avgTimeMs: lobby.host_avg_time_per_question_ms,
          };
        }

        // Get joined stats from lobby
        if (lobby.joined_total_questions > 0) {
          joinedStats = {
            correctAnswers: lobby.joined_correct_answers,
            totalQuestions: lobby.joined_total_questions,
            avgTimeMs: lobby.joined_avg_time_per_question_ms,
          };
        }

        // Determine winner
        let winner: 'host' | 'joined' | 'tie' = 'tie';
        if (lobby.host_score > lobby.joined_score) {
          winner = 'host';
        } else if (lobby.joined_score > lobby.host_score) {
          winner = 'joined';
        }

        // Update lobby status to finished
        await supabase
          .from('pvp_lobbies')
          .update({ status: 'finished' })
          .eq('id', lobbyId);

        setResultData({
          hostName: hostData?.display_name || 'Host',
          joinedName,
          hostScore: lobby.host_score || 0,
          joinedScore: lobby.joined_score || 0,
          winner,
          hostStats,
          joinedStats,
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching result:', error);
        router.push('/pvp');
      }
    };

    fetchResult();
  }, [lobbyId, router, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="spinner-loading"
            />
          </div>
          <p className="text-text-secondary">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!resultData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary text-2xl font-bold mb-2">Results not found</p>
          <button
            onClick={() => router.push('/pvp')}
            className="px-6 py-3 bg-primary-yellow text-black rounded-lg font-semibold hover:scale-105 transition-transform cursor-pointer"
          >
            Back to PvP Menu
          </button>
        </div>
      </div>
    );
  }

  const isUserWinner = 
    (userRole === 'host' && resultData.winner === 'host') ||
    (userRole === 'joined' && resultData.winner === 'joined');
  
  const isDraw = resultData.winner === 'tie';

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Minimalist */}
      <div className="border-b border-text-secondary/10">
        <div className="max-w-full mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex-1" />
          <p className="text-text-secondary text-center text-label flex-1">
            Battle Complete - Final Results
          </p>
          <div className="flex-1 flex justify-end">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content - Match Style */}
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        {/* Score Section - Highlighted with Yellow Background */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-primary-yellow rounded-2xl p-6 sm:p-8 mb-8"
        >
          <div className="flex items-center justify-between gap-4">
            {/* Host Score */}
            <div className="flex-1 text-center">
              <h2 className="text-body-lg text-black mb-3 truncate font-black">
                {resultData.hostName}
              </h2>
              <div className="text-heading-1 font-black text-black mb-2">
                {resultData.hostScore}
              </div>
            </div>

            {/* VS Divider */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-lg sm:text-2xl font-black text-black">VS</p>
              {/* Result Indicator */}
              <div className="text-sm font-bold px-2 py-1 rounded bg-black/10 text-black">
                {isDraw ? '🤝 Draw' : ''}
              </div>
            </div>

            {/* Joined Score */}
            <div className="flex-1 text-center">
              <h2 className="text-body-lg text-black mb-3 truncate font-black">
                {resultData.joinedName}
              </h2>
              <div className="text-heading-1 font-black text-black mb-2">
                {resultData.joinedScore}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Rows - Like Match Stats with 3-column layout */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-primary-yellow rounded-2xl overflow-hidden mb-8 space-y-0"
        >
          {/* Accuracy */}
          <div className="px-4 sm:px-6 py-4 flex justify-between items-center gap-3">
            <div className="flex-1 flex justify-start">
              <div className={`${
                (resultData.hostStats ? ((resultData.hostStats.correctAnswers / resultData.hostStats.totalQuestions) * 100) : 0) > 
                (resultData.joinedStats ? ((resultData.joinedStats.correctAnswers / resultData.joinedStats.totalQuestions) * 100) : 0)
                  ? 'bg-black rounded px-2 py-1'
                  : ''
              }`}>
                <span className={`text-heading-3 font-bold ${
                  (resultData.hostStats ? ((resultData.hostStats.correctAnswers / resultData.hostStats.totalQuestions) * 100) : 0) > 
                  (resultData.joinedStats ? ((resultData.joinedStats.correctAnswers / resultData.joinedStats.totalQuestions) * 100) : 0)
                    ? 'text-primary-yellow'
                    : 'text-black'
                }`}>
                  {resultData.hostStats 
                    ? ((resultData.hostStats.correctAnswers / resultData.hostStats.totalQuestions) * 100).toFixed(1)
                    : '0'}%
                </span>
              </div>
            </div>
            <span className="text-black text-body-lg font-bold flex-1 text-center">
              Accuracy
            </span>
            <div className="flex-1 flex justify-end">
              <div className={`${
                (resultData.joinedStats ? ((resultData.joinedStats.correctAnswers / resultData.joinedStats.totalQuestions) * 100) : 0) > 
                (resultData.hostStats ? ((resultData.hostStats.correctAnswers / resultData.hostStats.totalQuestions) * 100) : 0)
                  ? 'bg-black rounded px-2 py-1'
                  : ''
              }`}>
                <span className={`text-heading-3 font-bold ${
                  (resultData.joinedStats ? ((resultData.joinedStats.correctAnswers / resultData.joinedStats.totalQuestions) * 100) : 0) > 
                  (resultData.hostStats ? ((resultData.hostStats.correctAnswers / resultData.hostStats.totalQuestions) * 100) : 0)
                    ? 'text-primary-yellow'
                    : 'text-black'
                }`}>
                  {resultData.joinedStats
                    ? ((resultData.joinedStats.correctAnswers / resultData.joinedStats.totalQuestions) * 100).toFixed(1)
                    : '0'}%
                </span>
              </div>
            </div>
          </div>

          {/* Avg Time */}
          <div className="px-4 sm:px-6 py-4 flex justify-between items-center gap-3">
            <div className="flex-1 flex justify-start">
              <div className={`${
                (resultData.hostStats?.avgTimeMs ?? 0) < (resultData.joinedStats?.avgTimeMs ?? Infinity)
                  ? 'bg-black rounded px-2 py-1'
                  : ''
              }`}>
                <span className={`text-heading-3 font-bold ${
                  (resultData.hostStats?.avgTimeMs ?? 0) < (resultData.joinedStats?.avgTimeMs ?? Infinity)
                    ? 'text-primary-yellow'
                    : 'text-black'
                }`}>
                  {resultData.hostStats?.avgTimeMs 
                    ? (resultData.hostStats.avgTimeMs / 1000).toFixed(1) 
                    : '0'}s
                </span>
              </div>
            </div>
            <span className="text-black text-body-lg font-bold flex-1 text-center">
              Avg Time
            </span>
            <div className="flex-1 flex justify-end">
              <div className={`${
                (resultData.joinedStats?.avgTimeMs ?? Infinity) < (resultData.hostStats?.avgTimeMs ?? 0)
                  ? 'bg-black rounded px-2 py-1'
                  : ''
              }`}>
                <span className={`text-heading-3 font-bold ${
                  (resultData.joinedStats?.avgTimeMs ?? Infinity) < (resultData.hostStats?.avgTimeMs ?? 0)
                    ? 'text-primary-yellow'
                    : 'text-black'
                }`}>
                  {resultData.joinedStats?.avgTimeMs 
                    ? (resultData.joinedStats.avgTimeMs / 1000).toFixed(1) 
                    : '0'}s
                </span>
              </div>
            </div>
          </div>

          {/* Answered */}
          <div className="px-4 sm:px-6 py-4 flex justify-between items-center gap-3 border-b border-black/20">
            <div className="flex-1 flex justify-start">
              <div className={`${
                (resultData.hostStats?.correctAnswers ?? 0) > (resultData.joinedStats?.correctAnswers ?? 0)
                  ? 'bg-black rounded px-2 py-1'
                  : ''
              }`}>
                <span className={`text-heading-3 font-bold ${
                  (resultData.hostStats?.correctAnswers ?? 0) > (resultData.joinedStats?.correctAnswers ?? 0)
                    ? 'text-primary-yellow'
                    : 'text-black'
                }`}>
                  {resultData.hostStats?.correctAnswers || 0} / {resultData.hostStats?.totalQuestions || 0}
                </span>
              </div>
            </div>
            <span className="text-black text-body-lg font-bold flex-1 text-center">
              Answered
            </span>
            <div className="flex-1 flex justify-end">
              <div className={`${
                (resultData.joinedStats?.correctAnswers ?? 0) > (resultData.hostStats?.correctAnswers ?? 0)
                  ? 'bg-black rounded px-2 py-1'
                  : ''
              }`}>
                <span className={`text-heading-3 font-bold ${
                  (resultData.joinedStats?.correctAnswers ?? 0) > (resultData.hostStats?.correctAnswers ?? 0)
                    ? 'text-primary-yellow'
                    : 'text-black'
                }`}>
                  {resultData.joinedStats?.correctAnswers || 0} / {resultData.joinedStats?.totalQuestions || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Result Status - Full Width Bottom */}
          <div className={`w-full px-4 sm:px-6 py-4 text-center font-black text-heading-3 ${
            isDraw 
              ? 'bg-black/10 text-black' 
              : isUserWinner 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
          }`}>
            {isDraw ? 'Draw' : isUserWinner ? 'Win' : 'Lose'}
          </div>
        </motion.div>

        {/* Divider Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2 }}
          className="h-0.5 bg-gradient-to-r from-text-secondary/20 via-primary-yellow to-text-secondary/20 mb-8 origin-center"
        />

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
        >
          {/* Play Again */}
          <button
            onClick={() => router.push('/pvp/create')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-secondary-purple text-white rounded-xl sm:rounded-2xl font-bold text-body-lg hover:bg-secondary-purple/90 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>

          {/* Back to Menu */}
          <button
            onClick={() => router.push('/pvp')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary-yellow text-black rounded-xl sm:rounded-2xl font-bold text-body-lg hover:bg-primary-yellow-hover transition-all cursor-pointer"
          >
            <Home className="w-5 h-5" />
            Back to Menu
          </button>
        </motion.div>
      </div>
    </div>
  );
}
