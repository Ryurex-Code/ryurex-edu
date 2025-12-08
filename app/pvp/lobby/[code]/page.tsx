'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Copy, Check, LogOut, Users } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import ThemeToggle from '@/components/ThemeToggle';

interface LobbyData {
  id: string;
  game_code: string;
  host_user_id: string;
  joined_user_id: string | null;
  category: string;
  subcategory: number;
  num_questions: number;
  timer_duration: number;
  game_mode: string;
  status: string;
  host_approved: boolean | null;
  player2_ready: boolean;
  created_at: string;
  expires_at: string;
}

interface UserProfile {
  id: string;
  display_name: string;
}

export default function LobbyPage() {
  const router = useRouter();
  const params = useParams();
  const gameCode = params.code as string;

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [lobbyData, setLobbyData] = useState<LobbyData | null>(null);
  const [hostProfile, setHostProfile] = useState<UserProfile | null>(null);
  const [joinedProfile, setJoinedProfile] = useState<UserProfile | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [copied, setCopied] = useState(false);
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);
  const [isKicked, setIsKicked] = useState(false);

  const supabase = createClient();

  // Fetch user
  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (isMounted) {
        if (!user) {
          router.push('/login');
        } else {
          setUser(user);
        }
        setLoading(false);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [supabase.auth, router]);

  // Fetch lobby data
  useEffect(() => {
    if (!user || !gameCode) return;

    let isMounted = true;
    let interval: NodeJS.Timeout | null = null;

    const fetchLobby = async () => {
      try {
        const { data, error } = await supabase
          .from('pvp_lobbies')
          .select('*')
          .eq('game_code', gameCode)
          .single();

        if (error) {
          console.error('Error fetching lobby:', error);
          return;
        }

        if (isMounted && data) {
          const wasStatusWaiting = lobbyData?.status === 'waiting';
          const isNowOpponentJoined = data.status === 'opponent_joined';
          const wasOpponentJoined = lobbyData?.status === 'opponent_joined';
          const isNowInProgress = data.status === 'in_progress';
          
          console.log('[LOBBY POLLING]', {
            gameCode,
            currentUser: user.id,
            isHost: data.host_user_id === user.id,
            status: data.status,
            hostUserId: data.host_user_id,
            joinedUserId: data.joined_user_id,
            wasStatusWaiting,
            isNowOpponentJoined,
            wasOpponentJoined,
            isNowInProgress,
            shouldShowPopup: data.host_user_id === user.id && wasStatusWaiting && isNowOpponentJoined,
            hostApproved: data.host_approved,
            player2Ready: data.player2_ready
          });
          
          setLobbyData(data);
          setIsHost(data.host_user_id === user.id);
          setIsJoined(data.joined_user_id === user.id);

          // Detect if game has started - redirect both players to game page
          if (isNowInProgress && (wasOpponentJoined || data.status === 'opponent_joined')) {
            console.log('[GAME START] Redirecting to game:', data.id);
            router.push(`/pvp/game/${data.id}`);
            return;
          }

          // Detect if Player 2 was kicked
          if (!isHost && isJoined && !data.joined_user_id) {
            console.log('[KICKED] Player 2 has been kicked');
            setIsKicked(true);
          }

          // Show approval popup when opponent joins (for host only)
          if (data.host_user_id === user.id && wasStatusWaiting && isNowOpponentJoined) {
            console.log('[POPUP TRIGGER] Showing approval popup for', data.joined_user_id);
            setShowApprovalPopup(true);
          }

          // Fetch user profiles
          const { data: hostData } = await supabase
            .from('users')
            .select('id, display_name')
            .eq('id', data.host_user_id)
            .single();

          if (isMounted && hostData) {
            setHostProfile(hostData);
          }

          if (data.joined_user_id) {
            const { data: joinedData } = await supabase
              .from('users')
              .select('id, display_name')
              .eq('id', data.joined_user_id)
              .single();

            if (isMounted && joinedData) {
              console.log('[JOINED PROFILE] Fetched:', joinedData.display_name);
              setJoinedProfile(joinedData);
            }
          } else {
            setJoinedProfile(null);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchLobby();

    // Poll every 1 second for faster updates
    interval = setInterval(fetchLobby, 1000);

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, gameCode, supabase, lobbyData?.status]);

  // Countdown timer
  useEffect(() => {
    if (!lobbyData) return;

    let isMounted = true;
    let interval: NodeJS.Timeout | null = null;

    const updateCountdown = () => {
      if (isMounted && lobbyData) {
        const now = new Date().getTime();
        const expiresAt = new Date(lobbyData.expires_at).getTime();
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));

        setTimeRemaining(remaining);

        // Redirect if expired
        if (remaining === 0 && isHost) {
          router.push('/pvp/create');
        }
      }
    };

    updateCountdown();
    interval = setInterval(updateCountdown, 1000);

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [lobbyData, isHost, isJoined, router]);

  const handleKickedOk = () => {
    router.push('/pvp/join');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAcceptOpponent = async () => {
    if (!lobbyData) return;

    try {
      const { error } = await supabase
        .from('pvp_lobbies')
        .update({
          host_approved: true,
          status: 'opponent_joined',
        })
        .eq('id', lobbyData.id);

      if (error) {
        console.error('Error accepting opponent:', error);
      } else {
        setShowApprovalPopup(false);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRejectOpponent = async () => {
    if (!lobbyData) return;

    try {
      const { error } = await supabase
        .from('pvp_lobbies')
        .update({
          joined_user_id: null,
          host_approved: null,
          status: 'waiting',
        })
        .eq('id', lobbyData.id);

      if (error) {
        console.error('Error rejecting opponent:', error);
      } else {
        setShowApprovalPopup(false);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleKickPlayer = async () => {
    if (!lobbyData || !isHost || !lobbyData.joined_user_id) return;

    try {
      const { error } = await supabase
        .from('pvp_lobbies')
        .update({
          joined_user_id: null,
          host_approved: false,
          player2_ready: false,
          status: 'waiting',
        })
        .eq('id', lobbyData.id);

      if (error) {
        console.error('Error kicking player:', error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleReady = async () => {
    if (!lobbyData || !isJoined) return;

    try {
      const { error } = await supabase
        .from('pvp_lobbies')
        .update({
          player2_ready: true,
        })
        .eq('id', lobbyData.id);

      if (error) {
        console.error('Error marking ready:', error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleStartGame = async () => {
    if (!lobbyData) return;

    try {
      const { error } = await supabase
        .from('pvp_lobbies')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .eq('id', lobbyData.id);

      if (error) {
        console.error('Error starting game:', error);
      } else {
        router.push(`/pvp/game/${lobbyData.id}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLeaveLobby = async () => {
    if (!lobbyData) return;

    try {
      if (isHost) {
        // Host deletes lobby
        const { error } = await supabase
          .from('pvp_lobbies')
          .delete()
          .eq('id', lobbyData.id);

        if (error) console.error('Error deleting lobby:', error);
      } else if (isJoined) {
        // Player 2 leaves
        const { error } = await supabase
          .from('pvp_lobbies')
          .update({
            joined_user_id: null,
            host_approved: null,
            player2_ready: false,
            status: 'waiting',
          })
          .eq('id', lobbyData.id);

        if (error) console.error('Error leaving lobby:', error);
      }

      router.push('/pvp');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl">Loading...</div>
      </div>
    );
  }

  if (!lobbyData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading lobby...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <div className="border-b border-text-secondary/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/pvp')}
              className="flex items-center gap-2 text-text-secondary hover:text-primary-yellow hover:font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to PvP</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Kicked Popup */}
          {isKicked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                className="bg-card rounded-2xl p-8 border border-theme max-w-md w-full mx-4"
              >
                <h2 className="text-2xl font-bold mb-4 text-red-400">Rejected/Kicked from Lobby</h2>
                <p className="text-muted-foreground mb-6">
                  Host telah mengeluarkan Anda dari lobby.
                </p>
                <button
                  onClick={handleKickedOk}
                  className="w-full py-2 px-4 bg-primary-yellow text-black rounded-lg hover:bg-primary-yellow/90 transition-colors font-semibold cursor-pointer"
                >
                  Kembali
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="text-primary-yellow">Battle</span> Lobby
            </h1>
            <p className="text-muted-foreground text-lg">
              {isHost ? 'Waiting for opponent to join...' : 'Waiting for host to accept...'}
            </p>
          </motion.div>

          {/* Approval Popup */}
          {showApprovalPopup && isHost && joinedProfile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowApprovalPopup(false)}
            >
              <motion.div
                className="bg-card rounded-2xl p-8 border border-theme max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold mb-4">Accept Opponent?</h2>
                <p className="text-muted-foreground mb-6">
                  <span className="text-foreground font-semibold">{joinedProfile.display_name}</span> wants to join your battle. Accept or reject?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleRejectOpponent}
                    className="flex-1 py-2 px-4 bg-background border border-theme rounded-lg hover:border-primary-yellow transition-colors font-semibold cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleAcceptOpponent}
                    className="flex-1 py-2 px-4 bg-primary-yellow text-black rounded-lg hover:bg-primary-yellow-hover transition-colors font-semibold cursor-pointer"
                  >
                    Accept
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Game Code Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-6 border border-theme"
            >
              <h2 className="text-xl font-bold mb-4">Game Code</h2>
              <div className="relative">
                <input
                  type="text"
                  value={gameCode}
                  readOnly
                  className="w-full px-4 py-4 bg-primary-yellow text-black text-center text-2xl font-mono font-bold border border-primary-yellow rounded-lg focus:outline-none"
                />
                <button
                  onClick={handleCopyCode}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-primary-yellow/80 rounded-lg transition-colors cursor-pointer"
                  title="Copy game code"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-black" />
                  ) : (
                    <Copy className="w-5 h-5 text-black" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Countdown Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-6 border border-theme"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-yellow" />
                Expires In
              </h2>
              <div className="text-5xl font-bold text-primary-yellow text-center">
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-center text-muted-foreground text-sm mt-2">
                Lobby will expire after 5 minutes
              </p>
            </motion.div>
          </div>

          {/* Players Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 border border-theme mb-8"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-yellow" />
              Players
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Player 1 (Host) */}
              <div className="bg-background rounded-lg p-6 border border-theme">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Player 1</h3>
                  <span className="text-xs px-2 py-1 bg-primary-yellow/20 text-primary-yellow rounded-full">
                    Host
                  </span>
                </div>
                <p className="text-foreground font-semibold text-xl mb-4">
                  {hostProfile?.display_name || 'Loading...'}
                </p>
                <div className="flex gap-2">
                  {isHost && (
                    <button
                      onClick={handleLeaveLobby}
                      className="flex-1 py-2 px-4 bg-background border border-theme rounded-lg hover:border-primary-yellow transition-colors font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Leave
                    </button>
                  )}
                </div>
              </div>

              {/* Player 2 (Joined) */}
              <div className="bg-background rounded-lg p-6 border border-theme">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Player 2</h3>
                  {joinedProfile && (
                    <>
                      {lobbyData.host_approved === null && (
                        <span className="text-xs px-2 py-1 bg-secondary-purple/20 text-secondary-purple rounded-full">
                          Pending
                        </span>
                      )}
                      {lobbyData.host_approved === false && (
                        <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full">
                          Rejected
                        </span>
                      )}
                      {lobbyData.host_approved === true && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          lobbyData.player2_ready
                            ? 'bg-primary-yellow/20 text-primary-yellow'
                            : 'bg-muted-foreground/20 text-muted-foreground'
                        }`}>
                          {lobbyData.player2_ready ? 'Ready' : 'Not Ready'}
                        </span>
                      )}
                    </>
                  )}
                </div>
                {joinedProfile ? (
                  <>
                    <p className="text-foreground font-semibold text-xl mb-4">
                      {joinedProfile.display_name}
                    </p>
                    {lobbyData.host_approved === null && (
                      <p className="text-muted-foreground text-sm mb-4">
                        Waiting for host approval...
                      </p>
                    )}
                    <div className="flex gap-2">
                      {isHost && joinedProfile && lobbyData.status !== 'in_progress' && (
                        <button
                          onClick={handleKickPlayer}
                          className="flex-1 py-2 px-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors font-semibold text-sm cursor-pointer"
                        >
                          Kick
                        </button>
                      )}
                      {isJoined && !lobbyData.player2_ready && lobbyData.host_approved === true && (
                        <button
                          onClick={handleReady}
                          className="flex-1 py-2 px-4 bg-primary-yellow text-black rounded-lg hover:bg-primary-yellow/90 transition-colors font-semibold text-sm cursor-pointer"
                        >
                          Ready
                        </button>
                      )}
                      {isJoined && (
                        <button
                          onClick={handleLeaveLobby}
                          className="flex-1 py-2 px-4 bg-background border border-theme rounded-lg hover:border-primary-yellow transition-colors font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Leave
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">Waiting for opponent to join...</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Game Config */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 border border-theme mb-8"
          >
            <h2 className="text-lg font-bold mb-4 text-foreground">Battle Configuration</h2>
            <div className="bg-background rounded-lg p-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-semibold text-primary-yellow">{lobbyData.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mode</p>
                <p className="font-semibold text-primary-yellow">
                  {lobbyData.subcategory === 0 ? 'Random' : `Part ${lobbyData.subcategory}`}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Questions</p>
                <p className="font-semibold text-primary-yellow">{lobbyData.num_questions}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Time/Q</p>
                <p className="font-semibold text-primary-yellow">{lobbyData.timer_duration}s</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-semibold text-secondary-purple capitalize">{lobbyData.game_mode}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-semibold text-primary-yellow capitalize">{lobbyData.status}</p>
              </div>
            </div>
          </motion.div>

          {/* Start Game Button */}
          {isHost && joinedProfile && lobbyData.player2_ready && lobbyData.host_approved && lobbyData.status !== 'in_progress' && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleStartGame}
              className="w-full py-4 bg-primary-yellow text-black rounded-lg font-bold text-lg hover:bg-primary-yellow-hover transition-colors cursor-pointer"
            >
              Start Battle
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
