'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Loader } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  xp: number;
  level: number;
  rank: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  userRank: number;
  currentUser: {
    id: string;
    display_name: string;
    xp: number;
    level: number;
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
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-primary-yellow" />
        </div>
      </motion.div>
    );
  }

  if (!leaderboardData) {
    return null;
  }

  const { leaderboard, userRank, currentUser } = leaderboardData;

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500 border-yellow-600 text-white';
      case 2:
        return 'bg-gray-400 border-gray-500 text-white';
      case 3:
        return 'bg-orange-500 border-orange-600 text-white';
      default:
        return 'bg-primary-yellow border-primary-yellow text-black font-bold';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className={`rounded-2xl border-2 border-theme overflow-hidden ${
        theme === 'dark' ? 'bg-card' : 'bg-white'
      }`}
    >
      {/* Header */}
      <div className="bg-primary-yellow border-b-2 border-primary-yellow px-6 py-6">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-black" />
          <h3 className="text-2xl font-bold text-black">Global Leaderboard</h3>
        </div>
        <p className="text-sm text-black/70">
          Top 10 players by XP - Your rank: #{userRank}
        </p>
      </div>

      {/* Leaderboard Content */}
      <div className="p-6">
        <div className="space-y-3">
          {/* Leaderboard Entries */}
          {leaderboard.map((entry, index) => {
            const medal = getMedalIcon(entry.rank);
            const isCurrentUser = entry.user_id === currentUser.id;

            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  isCurrentUser
                    ? `border-2 border-primary-yellow ${
                        theme === 'dark'
                          ? 'bg-primary-yellow/15'
                          : 'bg-primary-yellow/10'
                      }`
                    : `border-2 border-theme ${
                        theme === 'dark' ? 'bg-surface/30' : 'bg-gray-100'
                      }`
                }`}
              >
                {/* Rank */}
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-lg border-2 font-bold text-lg flex-shrink-0 ${getRankBadgeColor(
                    entry.rank
                  )}`}
                >
                  {medal ? <span className="text-2xl">{medal}</span> : entry.rank}
                </div>

                {/* User Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg truncate">
                      {entry.display_name}
                      {isCurrentUser && (
                        <span className="ml-2 px-2 py-1 bg-primary-yellow text-black text-xs font-semibold rounded-md">
                          YOU
                        </span>
                      )}
                    </p>
                  </div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Level {entry.level}
                  </p>
                </div>

                {/* XP Display */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-lg text-primary-yellow">
                      {entry.xp.toLocaleString()}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                      XP
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* User's Current Position (if not in top 10) */}
        {userRank > 10 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 pt-6 border-t-2 border-theme"
          >
            <p className={`text-xs font-semibold mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              YOUR POSITION
            </p>
            <div className={`flex items-center gap-4 p-4 rounded-xl border-2 border-primary-yellow ${
              theme === 'dark' ? 'bg-primary-yellow/15' : 'bg-primary-yellow/10'
            }`}>
              {/* Rank */}
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-yellow border-2 border-primary-yellow font-bold text-lg flex-shrink-0 text-black">
                #{userRank}
              </div>

              {/* User Info */}
              <div className="flex-grow">
                <p className="font-bold text-lg">{currentUser.display_name}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Level {currentUser.level}
                </p>
              </div>

              {/* XP */}
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-lg text-primary-yellow">
                  {currentUser.xp.toLocaleString()}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                  XP
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
