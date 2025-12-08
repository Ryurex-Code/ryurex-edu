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
      {/* Theme Toggle */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Header */}
      <div className="border-b border-text-secondary/10">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-2"
            >
              {isDraw ? (
                <span className="text-primary-yellow">It&apos;s a Draw!</span>
              ) : isUserWinner ? (
                <span className="text-green-400">🎉 You Won! 🎉</span>
              ) : (
                <span className="text-gray-400">Game Over</span>
              )}
            </motion.h1>
            <p className="text-text-secondary">
              Battle Complete - Final Results
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Winner Icon Animation */}
        {isUserWinner && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mb-12"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-7xl"
            >
              🏆
            </motion.div>
          </motion.div>
        )}

        {/* Scoreboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          {/* Host Score Card */}
          <div
            className={`rounded-3xl p-8 border-2 transition-all ${
              resultData.winner === 'host'
                ? 'bg-primary-yellow/10 border-primary-yellow shadow-lg shadow-primary-yellow/20'
                : 'bg-card border-text-secondary/10'
            }`}
          >
            <div className="text-center space-y-4">
              {resultData.winner === 'host' && (
                <div className="flex justify-center mb-4">
                  <Trophy className="w-8 h-8 text-primary-yellow" />
                </div>
              )}
              <p className="text-text-secondary text-sm">
                {userRole === 'host' ? 'You' : 'Opponent'}
              </p>
              <h2 className="text-3xl font-bold text-text-primary">
                {resultData.hostName}
              </h2>
              <div className="text-5xl font-bold text-primary-yellow">
                {resultData.hostScore}
              </div>
              {resultData.winner === 'host' && (
                <p className="text-primary-yellow font-semibold">Winner</p>
              )}
            </div>
          </div>

          {/* Joined Score Card */}
          <div
            className={`rounded-3xl p-8 border-2 transition-all ${
              resultData.winner === 'joined'
                ? 'bg-primary-yellow/10 border-primary-yellow shadow-lg shadow-primary-yellow/20'
                : 'bg-card border-text-secondary/10'
            }`}
          >
            <div className="text-center space-y-4">
              {resultData.winner === 'joined' && (
                <div className="flex justify-center mb-4">
                  <Trophy className="w-8 h-8 text-primary-yellow" />
                </div>
              )}
              <p className="text-text-secondary text-sm">
                {userRole === 'joined' ? 'You' : 'Opponent'}
              </p>
              <h2 className="text-3xl font-bold text-text-primary">
                {resultData.joinedName}
              </h2>
              <div className="text-5xl font-bold text-primary-yellow">
                {resultData.joinedScore}
              </div>
              {resultData.winner === 'joined' && (
                <p className="text-primary-yellow font-semibold">Winner</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Score Difference */}
        {!isDraw && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <p className="text-text-secondary">
              Score Difference:{' '}
              <span className="text-primary-yellow font-bold text-lg">
                {Math.abs(resultData.hostScore - resultData.joinedScore)} points
              </span>
            </p>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-8 border border-text-secondary/10 mb-12"
        >
          <h3 className="text-2xl font-bold mb-6">Battle Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-background rounded-lg p-4">
              <p className="text-text-secondary text-sm">Your Score</p>
              <p className="text-2xl font-bold text-primary-yellow">
                {userRole === 'host'
                  ? resultData.hostScore
                  : resultData.joinedScore}
              </p>
            </div>
            <div className="bg-background rounded-lg p-4">
              <p className="text-text-secondary text-sm">Opponent Score</p>
              <p className="text-2xl font-bold text-primary-yellow">
                {userRole === 'host'
                  ? resultData.joinedScore
                  : resultData.hostScore}
              </p>
            </div>
            <div className="bg-background rounded-lg p-4">
              <p className="text-text-secondary text-sm">Status</p>
              <p className="text-2xl font-bold text-secondary-purple capitalize">
                Finished
              </p>
            </div>
            <div className="bg-background rounded-lg p-4">
              <p className="text-text-secondary text-sm">Result</p>
              <p className="text-2xl font-bold text-green-400">
                {isDraw ? 'Draw' : isUserWinner ? 'Win' : 'Loss'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {/* Play Again */}
          <button
            onClick={() => router.push('/pvp/create')}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-secondary-purple text-white rounded-xl font-bold hover:scale-105 transition-transform cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>

          {/* Back to Menu */}
          <button
            onClick={() => router.push('/pvp')}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-primary-yellow text-black rounded-xl font-bold hover:scale-105 transition-transform cursor-pointer"
          >
            <Home className="w-5 h-5" />
            Back to Menu
          </button>
        </motion.div>
      </div>
    </div>
  );
}
