'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Clock } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

interface VocabWord {
  vocab_id: number;
  indo: string;
  english: string;
  class: string;
  category: string;
  subcategory: number;
  sentence_english?: string;
  sentence_indo?: string;
  fluency?: number;
  fluency_sentence?: number;
}

interface UserAnswer {
  vocab_id: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeTakenMs: number;
}

interface Scores {
  hostScore: number | null;
  joinedScore: number | null;
  bothSubmitted: boolean;
}

export default function PvPGamePage() {
  const router = useRouter();
  const params = useParams();
  const lobbyId = params.lobbyId as string;
  const supabase = createClient();

  // Game state
  const [gameState, setGameState] = useState<{
    questions: VocabWord[];
    currentQuestionIndex: number;
    userAnswers: UserAnswer[];
    totalScore: number;
  } | null>(null);

  const [user] = useState<{ id: string } | null>(null);
  const [lobbData, setLobbyData] = useState<{
    id: string;
    game_mode: string;
    timer_duration: number;
    category: string;
  } | null>(null);
  const [userRole, setUserRole] = useState<'host' | 'joined' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gameFinished, setGameFinished] = useState(false);
  const [showWaitingPopup, setShowWaitingPopup] = useState(false);
  const [scores, setScores] = useState<Scores | null>(null);
  const [bothSubmitted, setBothSubmitted] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [hintClickCount, setHintClickCount] = useState(0);

  // Question timer interval - only start after page is fully loaded
  useEffect(() => {
    if (isLoading || !gameState || gameFinished || !lobbData) return;

    const interval = setInterval(() => {
      setQuestionTimer((prev) => {
        const newTime = prev + 1;
        const timerDuration = lobbData.timer_duration || 30;

        // Auto-submit if timer runs out
        if (newTime >= timerDuration) {
          // Use a callback to access the latest gameState
          setGameState((currentState) => {
            if (!currentState) return currentState;
            const currentQuestion = currentState.questions[currentState.currentQuestionIndex];
            const correctAnswer =
              lobbData?.game_mode === 'sentence'
                ? (currentQuestion.sentence_english || '')
                : currentQuestion.english;

            handleAnswerSubmit('', correctAnswer, timerDuration * 1000);
            return currentState;
          });
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, gameFinished, lobbData, isLoading]);

  // Initial load: fetch lobby and questions
  useEffect(() => {
    const initializeGame = async () => {
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

        setLobbyData(lobby);

        // Determine user role
        const role = authUser.id === lobby.host_user_id ? 'host' : 'joined';
        setUserRole(role);

        // Validate user is in this game
        if (role === 'joined' && authUser.id !== lobby.joined_user_id) {
          console.error('User not in this game');
          router.push('/pvp');
          return;
        }

        // Fetch questions based on game configuration
        const questions = await fetchQuestions(lobby);
        if (questions.length === 0) {
          console.error('No questions fetched');
          router.push('/pvp');
          return;
        }

        // Initialize game state
        setGameState({
          questions,
          currentQuestionIndex: 0,
          userAnswers: [],
          totalScore: 0,
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing game:', error);
        router.push('/pvp');
      }
    };

    initializeGame();
  }, [lobbyId, router]);

  const fetchQuestions = async (lobby: {
    category: string;
    subcategory: number;
    num_questions: number;
    game_mode: string;
  }): Promise<VocabWord[]> => {
    try {
      const { category, subcategory, num_questions, game_mode } = lobby;

      // Use appropriate endpoint based on game_mode
      const endpoint =
        game_mode === 'sentence' ? '/api/getCustomSentenceBatch' : '/api/getCustomBatch';

      const params = new URLSearchParams();
      params.append('category', category);
      params.append('subcategory', subcategory.toString());

      const response = await fetch(`${endpoint}?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      let questions = data.words || [];

      // Shuffle and limit to num_questions
      questions = questions
        .sort(() => Math.random() - 0.5)
        .slice(0, num_questions);

      return questions;
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  };

  const calculateScore = (isCorrect: boolean, timeTakenMs: number): number => {
    if (!isCorrect) return 0;

    const basePoints = 100;
    const timerDuration = lobbData?.timer_duration || 30;
    const timeTakenSec = timeTakenMs / 1000;
    const timePenalty = (timeTakenSec / timerDuration) * 30;

    return Math.max(0, Math.floor(basePoints - timePenalty));
  };

  const handleAnswerSubmit = (
    answer: string,
    correctAnswer: string,
    timeTakenMs: number
  ) => {
    if (!gameState) return;

    const isCorrect = answer.trim().toLowerCase() === correctAnswer.toLowerCase();
    const score = calculateScore(isCorrect, timeTakenMs);

    const newAnswer: UserAnswer = {
      vocab_id: gameState.questions[gameState.currentQuestionIndex].vocab_id,
      userAnswer: answer,
      correctAnswer,
      isCorrect,
      timeTakenMs,
    };

    const newAnswers = [...gameState.userAnswers, newAnswer];
    const newTotalScore = gameState.totalScore + score;

    // Move to next question or finish game
    if (gameState.currentQuestionIndex < gameState.questions.length - 1) {
      setGameState({
        ...gameState,
        currentQuestionIndex: gameState.currentQuestionIndex + 1,
        userAnswers: newAnswers,
        totalScore: newTotalScore,
      });
      setQuestionTimer(0);
      setHintClickCount(0);
    } else {
      // Game finished
      setGameState({
        ...gameState,
        userAnswers: newAnswers,
        totalScore: newTotalScore,
      });
      submitFinalScore(newTotalScore, newAnswers);
    }
  };

  const submitFinalScore = async (finalScore: number, userAnswers: UserAnswer[]) => {
    try {
      setGameFinished(true);
      setShowWaitingPopup(true);

      // Submit score to database
      const response = await fetch('/api/pvp/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lobbyId,
          playerRole: userRole,
          finalScore,
          userAnswers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit score');
      }

      console.log('✅ Score submitted:', finalScore);

      // Start polling for opponent score
      pollForOpponentScore();
    } catch (error) {
      console.error('Error submitting final score:', error);
      alert('Failed to submit your score. Please try again.');
    }
  };

  const pollForOpponentScore = async () => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/pvp/${lobbyId}/scores`);
        if (!response.ok) throw new Error('Failed to fetch scores');

        const data: Scores = await response.json();
        setScores(data);

        if (data.bothSubmitted) {
          clearInterval(pollInterval);
          setBothSubmitted(true);

          // Wait 1 second then redirect to result page
          setTimeout(() => {
            router.push(`/pvp/result/${lobbyId}`);
          }, 1000);
        }
      } catch (error) {
        console.error('Error polling scores:', error);
      }
    }, 1000); // Poll every 1 second
  };

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
          <p className="text-text-secondary">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!gameState || !lobbData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary text-2xl font-bold mb-2">Game not found</p>
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

  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
  const timerDuration = lobbData.timer_duration || 30;

  return (
    <div className="min-h-screen bg-background">
      {/* Theme Toggle */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Header with Game Info */}
      <div className="border-b border-text-secondary/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            {/* Progress */}
            <div className="flex-1">
              <p className="text-text-secondary text-sm">
                Question{' '}
                <span className="text-primary-yellow font-bold">
                  {gameState.currentQuestionIndex + 1}
                </span>{' '}
                /{' '}
                <span className="text-primary-yellow font-bold">
                  {gameState.questions.length}
                </span>
              </p>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2 text-text-secondary">
              <Clock className="w-5 h-5" />
              <span className="font-mono">
                {timerDuration - questionTimer}s
              </span>
            </div>
          </div>

          {/* Game Mode & Score */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block px-4 py-1 bg-secondary-purple text-white text-sm font-semibold rounded-full capitalize">
                {lobbData.game_mode}
              </span>
              <span className="inline-block px-4 py-1 bg-primary-yellow text-black text-sm font-semibold rounded-full">
                {lobbData.category}
              </span>
            </div>
            <div className="text-primary-yellow font-bold text-xl">
              Score: {gameState.totalScore}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-yellow"
            initial={{ width: 0 }}
            animate={{
              width: `${((gameState.currentQuestionIndex + 1) / gameState.questions.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Game Area - Conditional Render Based on Game Mode */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {lobbData.game_mode === 'vocab' ? (
          <VocabGameDisplay
            currentQuestion={currentQuestion}
            timer={questionTimer}
            timerDuration={timerDuration}
            gameFinished={gameFinished}
            hintClickCount={hintClickCount}
            onHintClick={() => setHintClickCount(hintClickCount + 1)}
            onAnswerSubmit={handleAnswerSubmit}
          />
        ) : (
          <SentenceGameDisplay
            currentQuestion={currentQuestion}
            gameFinished={gameFinished}
            onAnswerSubmit={handleAnswerSubmit}
          />
        )}
      </div>

      {/* Waiting for Opponent Popup */}
      {showWaitingPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-card-darker border-2 border-primary-yellow rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
          >
            <div className="space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="text-5xl"
                >
                  ⏳
                </motion.div>
              </div>

              {/* Text */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">
                  Waiting for Opponent...
                </h3>
                <p className="text-gray-400">
                  {bothSubmitted
                    ? 'Opponent finished! Redirecting to results...'
                    : 'Your opponent is still playing. Please wait.'}
                </p>
              </div>

              {/* Score Info */}
              {scores && (
                <div className="space-y-2 pt-4 border-t border-gray-700">
                  <p className="text-text-secondary text-sm">
                    Your Score: <span className="text-primary-yellow font-bold">{scores.hostScore || scores.joinedScore || 0}</span>
                  </p>
                  {scores.joinedScore !== null && scores.hostScore !== null && (
                    <p className="text-text-secondary text-sm">
                      Opponent Score:{' '}
                      <span className="text-primary-yellow font-bold">
                        {userRole === 'host'
                          ? scores.joinedScore
                          : scores.hostScore}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// Vocab Game Display Component
function VocabGameDisplay({
  currentQuestion,
  timer,
  timerDuration,
  gameFinished,
  hintClickCount,
  onHintClick,
  onAnswerSubmit,
}: {
  currentQuestion: VocabWord;
  timer: number;
  timerDuration: number;
  gameFinished: boolean;
  hintClickCount: number;
  onHintClick: () => void;
  onAnswerSubmit: (answer: string, correctAnswer: string, timeTakenMs: number) => void;
}) {
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (isSubmitting || !userAnswer.trim() || gameFinished) return;

    setIsSubmitting(true);
    const isCorrect =
      userAnswer.trim().toLowerCase() === currentQuestion.english.toLowerCase();

    setFeedback(isCorrect ? 'correct' : 'wrong');

    // Auto-next after 1.5 seconds
    setTimeout(() => {
      onAnswerSubmit(
        userAnswer,
        currentQuestion.english,
        (timerDuration - timer) * 1000
      );
      setUserAnswer('');
      setFeedback(null);
      setIsSubmitting(false);
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    const correctAnswer = currentQuestion.english;
    const revealedLetters = Math.floor(hintClickCount);
    
    // If hint is shown, prevent changing revealed letters
    if (hintClickCount > 0 && revealedLetters > 0) {
      for (let i = 0; i < revealedLetters; i++) {
        if (correctAnswer[i] !== ' ' && newValue[i] !== correctAnswer[i]) {
          const corrected = correctAnswer.slice(0, revealedLetters) + newValue.slice(revealedLetters);
          setUserAnswer(corrected.slice(0, correctAnswer.length));
          return;
        }
      }
    }
    
    // Auto-skip spaces
    if (newValue.length < correctAnswer.length && correctAnswer[newValue.length] === ' ' && userAnswer.length < newValue.length) {
      newValue = newValue + ' ';
    }
    
    // Limit input to length of correct answer
    if (newValue.length <= correctAnswer.length) {
      setUserAnswer(newValue);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === ' ') {
      e.preventDefault();
      return;
    }
    
    if (e.key === 'Enter' && !isSubmitting && !feedback) {
      if (userAnswer.trim() && userAnswer.length === currentQuestion.english.length) {
        handleSubmit();
      }
    }
  };

  // Generate underscore display with hint reveals
  const renderUnderscoreDisplay = () => {
    const correctAnswer = currentQuestion.english;
    const letters = correctAnswer.split('');
    const revealedLetters = Math.floor(hintClickCount);

    return letters.map((letter, idx) => {
      if (letter === ' ') {
        return <span key={idx} className="inline-block w-4"></span>;
      }
      
      if (revealedLetters > idx && hintClickCount > 0) {
        return (
          <span key={idx} className="text-primary-yellow font-bold mx-1">
            {correctAnswer[idx]}
          </span>
        );
      }
      
      if (userAnswer[idx] && !(revealedLetters > idx && hintClickCount > 0)) {
        return (
          <span key={idx} className="text-text-primary mx-1">
            {userAnswer[idx]}
          </span>
        );
      }
      
      return (
        <span key={idx} className="text-text-secondary mx-1">
          _
        </span>
      );
    });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentQuestion.vocab_id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {/* Question */}
        <div className="text-center">
          <p className="text-text-secondary text-sm mb-2">Translate this word to English:</p>
          <h1 className="text-5xl font-bold text-text-primary mb-2">
            {currentQuestion.indo}
          </h1>
          <div className="flex items-center justify-center gap-2">
            {currentQuestion.class && (
              <span className="inline-block px-3 py-1 bg-primary-yellow text-black text-xs font-semibold rounded-full">
                {currentQuestion.class}
              </span>
            )}
          </div>
        </div>

        {/* Interactive Underscore Input */}
        <div className="text-center">
          <div className="relative inline-block">
            {/* Hidden input for capturing keystrokes */}
            <input
              type="text"
              value={userAnswer}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={!!feedback}
              maxLength={currentQuestion.english.length}
              className="absolute inset-0 opacity-0 w-full h-full cursor-default"
              autoFocus
              style={{ caretColor: 'transparent' }}
            />
            
            {/* Visual underscore display */}
            <div 
              className="bg-surface px-8 py-6 rounded-xl border-2 border-text-secondary/20 hover:border-primary-yellow/50 transition-colors cursor-text"
              onClick={() => {
                const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                if (input) input.focus();
              }}
            >
              <p className="text-4xl font-mono tracking-widest select-none">
                {renderUnderscoreDisplay()}
              </p>
            </div>
          </div>
        </div>

        {/* Hint Indicator */}
        {hintClickCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 text-primary-yellow"
          >
            <span className="text-sm">💡 Hint: {Math.floor(hintClickCount)} letter(s) revealed!</span>
          </motion.div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onHintClick}
            disabled={!!feedback || gameFinished}
            className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer bg-secondary-purple text-white hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            💡 Hint ({hintClickCount})
          </button>

          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !userAnswer.trim() ||
              userAnswer.length !== currentQuestion.english.length ||
              !!feedback ||
              gameFinished
            }
            className="flex-1 py-4 bg-primary-yellow text-black rounded-xl font-bold text-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-transform cursor-pointer"
          >
            {isSubmitting ? 'Checking...' : 'Submit'}
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-center py-6 ${
              feedback === 'correct' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            <div className="flex items-center justify-center gap-3 text-2xl font-bold">
              {feedback === 'correct' ? (
                <>
                  <span>✓ Correct!</span>
                </>
              ) : (
                <>
                  <span>✗ Wrong! The answer is: {currentQuestion.english}</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Sentence Game Display Component
function SentenceGameDisplay({
  currentQuestion,
  gameFinished,
  onAnswerSubmit,
}: {
  currentQuestion: VocabWord;
  gameFinished: boolean;
  onAnswerSubmit: (answer: string, correctAnswer: string, timeTakenMs: number) => void;
}) {
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const handleSubmit = () => {
    if (isSubmitting || !userAnswer.trim() || gameFinished) return;

    setIsSubmitting(true);

    // Validate: split, trim, lowercase each word
    const userWords = userAnswer
      .trim()
      .split(/\s+/)
      .map((w) => w.toLowerCase().replace(/[.,!?;:'"]/g, ''));

    const correctWords = (currentQuestion.sentence_english || '')
      .trim()
      .split(/\s+/)
      .map((w) => w.toLowerCase().replace(/[.,!?;:'"]/g, ''));

    const isCorrect =
      userWords.length === correctWords.length &&
      userWords.every((word, idx) => word === correctWords[idx]);

    setFeedback(isCorrect ? 'correct' : 'wrong');

    // Auto-next after 1.5 seconds
    setTimeout(() => {
      const timeTakenMs = Date.now() - startTime;
      onAnswerSubmit(
        userAnswer,
        currentQuestion.sentence_english || '',
        timeTakenMs
      );
      setUserAnswer('');
      setFeedback(null);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentQuestion.vocab_id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {/* Question - Indonesian Sentence */}
        <div className="bg-card border-2 border-theme rounded-2xl p-8">
          <p className="text-sm font-semibold text-text-secondary mb-2 uppercase tracking-wide">
            Complete the sentence
          </p>
          <p className="text-3xl font-bold text-text-primary">
            {currentQuestion.sentence_indo}
          </p>
        </div>

        {/* Input */}
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isSubmitting && !feedback) {
                handleSubmit();
              }
            }}
            placeholder="Type the English translation..."
            autoFocus
            disabled={!!feedback || gameFinished}
            className="w-full px-6 py-4 bg-input border-2 border-input rounded-2xl text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary-yellow transition-colors disabled:opacity-50"
          />

          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !userAnswer.trim() ||
              !!feedback ||
              gameFinished
            }
            className="px-6 py-4 bg-primary-yellow text-black rounded-xl font-bold text-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-transform cursor-pointer"
          >
            {isSubmitting ? 'Checking...' : 'Submit'}
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-center py-6 ${
              feedback === 'correct' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            <div className="text-2xl font-bold">
              {feedback === 'correct' ? (
                <>✓ Correct!</>
              ) : (
                <>
                  ✗ Wrong! The answer is: {currentQuestion.sentence_english}
                </>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
