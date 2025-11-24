'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Loader } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  xp: number;
  rank: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  userRank: number;
  currentUser: {
    id: string;
    display_name: string;
    xp: number;
  };
}

export default function Leaderboard() {
  const { theme } = useTheme();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setLeaderboardData(data);
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLeaderboard();

    // Listen for display name update event
    const handleDisplayNameUpdate = () => {
      fetchLeaderboard();
    };

    window.addEventListener('displayNameUpdated', handleDisplayNameUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('displayNameUpdated', handleDisplayNameUpdate);
    };
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={`rounded-2xl border-2 border-theme p-8 ${
          theme === 'dark' ? 'bg-card' : 'bg-white'
        }`}
      >
        <div className="flex items-center justify-center h-64 p-8">
          <Loader className="w-8 h-8 animate-spin text-primary-yellow" />
        </div>
      </motion.div>
    );
  }

  if (!leaderboardData) {
    return null;
  }

  const { leaderboard, userRank, currentUser } = leaderboardData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className={`rounded-2xl shadow-lg ${
        theme === 'dark' ? 'bg-card' : 'bg-white'
      }`}
    >
      {/* Header */}
      <div className="bg-primary-yellow px-6 py-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-black" />
          <h3 className="text-lg font-bold text-black">Top Players</h3>
          <span className="text-sm text-black/70 ml-auto">Your rank: #{userRank}</span>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="p-4">
        <div className="space-y-2">
          {/* Leaderboard Entries - Top 5 only */}
          {leaderboard.slice(0, 5).map((entry, index) => {
            const isCurrentUser = entry.user_id === currentUser.id;

            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={`flex items-center gap-1 p-3 rounded-lg transition-all ${
                  isCurrentUser
                    ? `border-2 border-primary-yellow ${
                        theme === 'dark'
                          ? 'bg-primary-yellow/15'
                          : 'bg-primary-yellow/10'
                      }`
                    : `${
                        theme === 'dark' ? 'bg-surface/20' : 'bg-gray-50'
                      }`
                }`}
              >
                {/* Simple Rank Number */}
                <div className={`text-base font-bold w-5 text-center flex-shrink-0 ${
                  entry.rank === 1 ? 'text-yellow-500' :
                  entry.rank === 2 ? 'text-gray-400' :
                  entry.rank === 3 ? 'text-orange-500' :
                  'text-foreground/60'
                }`}>
                  {entry.rank}
                </div>

                {/* User Info */}
                <div className="flex-grow min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {entry.display_name}
                    {isCurrentUser && (
                      <span className="ml-2 px-1.5 py-0.5 bg-primary-yellow text-black text-xs font-bold rounded">
                        YOU
                      </span>
                    )}
                  </p>
                </div>

                {/* XP Display */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm text-primary-yellow">
                    {entry.xp.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* User's Current Position (if not in top 5) */}
        {userRank > 5 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-4 pt-4 border-t border-theme/50"
          >
            <div className={`flex items-center gap-1 p-3 rounded-lg border-2 border-primary-yellow ${
              theme === 'dark' ? 'bg-primary-yellow/15' : 'bg-primary-yellow/10'
            }`}>
              {/* Rank */}
              <div className="text-base font-bold w-4 text-center flex-shrink-0 text-primary-yellow">
                #{userRank}
              </div>

              {/* User Info */}
              <div className="flex-grow">
                <p className="font-semibold text-sm">{currentUser.display_name}</p>
              </div>

              {/* XP */}
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-sm text-primary-yellow">
                  {currentUser.xp.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
