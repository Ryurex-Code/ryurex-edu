'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Lightbulb, ArrowLeft, RotateCcw, Home } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

interface SentenceWord {
  vocab_id: number;
  indo: string;
  english: string;
  class: string;
  category: string;
  subcategory: number;
  sentence_english: string;
  sentence_indo: string;
  fluency_sentence: number;
}

interface GameResult {
  vocab_id: number;
  correct: boolean;
  hintClickCount: number;
}

export default function SentenceLearningContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');

  // Game state
  const [sentences, setSentences] = useState<SentenceWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [hintClickCount, setHintClickCount] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isSubmittingResults, setIsSubmittingResults] = useState(false);

  // Reset all game state when category or subcategory changes
  useEffect(() => {
    setSentences([]);
    setCurrentIndex(0);
    setUserAnswer('');
    setHintClickCount(0);
    setFeedback(null);
    setIsSubmitting(false);
    setGameResults([]);
    setIsLoading(true);
    setShowResultModal(false);
    setIsSubmittingResults(false);
  }, [category, subcategory]);

  // Fetch sentences on mount - REQUIRED category and subcategory
  useEffect(() => {
    if (!category || !subcategory) {
      alert('Category and Subcategory are required!');
      router.push('/dashboard');
      return;
    }
    
    let isMounted = true;
    
    const loadSentences = async () => {
      try {
        // Use custom sentence batch endpoint
        const params = new URLSearchParams();
        params.append('category', category);
        params.append('subcategory', subcategory);
        
        const url = `/api/getCustomSentenceBatch?${params.toString()}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch sentences');
        }
        
        const data = await response.json();
        console.log('📚 Fetched custom sentence batch:', data);
        console.log(`📊 Selected: ${data.count} sentences, Total available: ${data.total_available}`);
        console.log(`🎯 Filter: category=${category}, subcategory=${subcategory}`);
        
        if (data.words && Array.isArray(data.words)) {
          if (data.words.length === 0) {
            console.log('⚠️ No sentences available for this category and subcategory');
            if (isMounted) setSentences([]);
          } else {
            if (isMounted) setSentences(data.words);
            console.log(`✅ Loaded ${data.words.length} sentences for learning`);
          }
        } else {
          throw new Error('Invalid data format from API');
        }
        
        if (isMounted) setIsLoading(false);
      } catch (error) {
        console.error('❌ Error fetching sentences:', error);
        if (isMounted) {
          alert(`Failed to load sentences: ${error instanceof Error ? error.message : 'Unknown error'}`);
          router.push(`/category-menu/${category}`);
        }
      }
    };
    
    loadSentences();
    
    return () => {
      isMounted = false;
    };
  }, [category, subcategory, router]);

  const fetchSentences = async () => {
    try {
      const params = new URLSearchParams();
      params.append('category', category || '');
      params.append('subcategory', subcategory || '');
      
      const url = `/api/getCustomSentenceBatch?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sentences');
      }
      
      const data = await response.json();
      console.log('📚 Fetched sentence batch:', data);
      
      if (data.words && Array.isArray(data.words)) {
        if (data.words.length === 0) {
          alert('No sentences available. Come back later!');
          router.push(`/category-menu/${category}`);
        } else {
          setSentences(data.words);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error fetching sentences:', error);
      alert(`Failed to load sentences: ${error instanceof Error ? error.message : 'Unknown error'}`);
      router.push(`/category-menu/${category}`);
    }
  };

  const handleSubmit = () => {
    if (isSubmitting || !userAnswer.trim()) return;

    setIsSubmitting(true);
    const currentSentence = sentences[currentIndex];
    
    // Validate: split, trim, lowercase each word
    const userWords = userAnswer
      .trim()
      .split(/\s+/)
      .map((w) => w.toLowerCase().replace(/[.,!?;:'"]/g, ''));
    
    const correctWords = currentSentence.sentence_english
      .trim()
      .split(/\s+/)
      .map((w) => w.toLowerCase().replace(/[.,!?;:'"]/g, ''));

    const isCorrect = userWords.length === correctWords.length &&
      userWords.every((word, idx) => word === correctWords[idx]);

    // Show feedback
    setFeedback(isCorrect ? 'correct' : 'wrong');

    // Record result with hintClickCount
    const result: GameResult = {
      vocab_id: currentSentence.vocab_id,
      correct: isCorrect,
      hintClickCount,
    };
    setGameResults((prev) => [...prev, result]);

    // Auto-next after 2 seconds
    setTimeout(() => {
      if (currentIndex < sentences.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        resetQuestion();
      } else {
        submitAllResults([...gameResults, result]);
      }
    }, 2000);
  };

  const submitAllResults = async (results: GameResult[]) => {
    setIsSubmittingResults(true);
    try {
      console.log('📤 Submitting sentence batch results:', results);

      const response = await fetch('/api/submitSentenceBatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit results');
      }

      const data = await response.json();
      console.log('✅ Batch submission success:', data);

      setShowResultModal(true);
    } catch (error) {
      console.error('❌ Error submitting batch results:', error);
      alert('Failed to save your progress. Please try again.');
    } finally {
      setIsSubmittingResults(false);
    }
  };

  const resetQuestion = () => {
    setUserAnswer('');
    setHintClickCount(0);
    setFeedback(null);
    setIsSubmitting(false);
  };

  const handleHintClick = () => {
    setHintClickCount((prev) => prev + 1);
  };

  // Get max letters count from all words (for hint limit)
  const getMaxWordLength = (sentence: string) => {
    const words = sentence.split(/\s+/);
    const maxLength = Math.max(
      ...words.map((word) => word.replace(/[^a-zA-Z]/g, '').length)
    );
    return maxLength;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setUserAnswer(newValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting && !feedback) {
      if (userAnswer.trim()) {
        handleSubmit();
      }
    }
  };

  // Generate underscore display with progressive hint reveals
  const renderUnderscoreDisplay = () => {
    if (!sentences[currentIndex]) return null;

    const correctSentence = sentences[currentIndex].sentence_english;
    const words = correctSentence.split(/\s+/);

    return words.map((word, wordIdx) => {
      const letters = word.split('');

      return (
        <span key={wordIdx}>
          {letters.map((letter, letterIdx) => {
            // Preserve punctuation
            if (!/[a-zA-Z]/.test(letter)) {
              return <span key={letterIdx}>{letter}</span>;
            }

            // Show revealed letters in yellow (hintClickCount determines how many letters per word)
            if (letterIdx < hintClickCount) {
              return (
                <span key={letterIdx} className="text-primary-yellow font-bold">
                  {letter}
                </span>
              );
            }

            // Show user's typed input if available
            const userWords = userAnswer
              .trim()
              .split(/\s+/)
              .filter((w) => w.length > 0);
            if (userWords[wordIdx] && userWords[wordIdx][letterIdx]) {
              return (
                <span key={letterIdx} className="text-text-primary">
                  {userWords[wordIdx][letterIdx]}
                </span>
              );
            }

            // Show underscore for empty positions
            return (
              <span key={letterIdx} className="text-text-secondary">
                _
              </span>
            );
          })}
          {wordIdx < words.length - 1 && <span> </span>}
        </span>
      );
    });
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
          <p className="text-text-secondary">Loading sentences...</p>
        </div>
      </div>
    );
  }

  if (sentences.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-text-primary text-2xl font-bold mb-2">No Sentences Available</p>
          <p className="text-text-secondary mb-6">
            There are no sentences in &quot;{category}&quot; Part {subcategory} yet. Please try another category or part.
          </p>
          <button
            onClick={() => router.push(`/category-menu/${category}`)}
            className="px-6 py-3 bg-primary-yellow text-black rounded-lg font-semibold hover:scale-105 transition-transform cursor-pointer"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const currentSentence = sentences[currentIndex];

  return (
    <div className="min-h-screen bg-background">
      {/* Theme Toggle */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Header */}
      <div className="border-b border-text-secondary/10">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
            <div className="flex-1">
              <button
                onClick={() => router.push(`/category-menu/${category}`)}
                className="flex items-center gap-2 text-text-secondary hover:text-primary-yellow transition-colors cursor-pointer text-body-lg"
              >
                <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
                <span>Back</span>
              </button>
            </div>

            {/* Progress - Center */}
            <div className="flex-1 text-center text-text-secondary text-label">
              Question <span className="text-primary-yellow font-bold">{currentIndex + 1}</span> / {sentences.length}
            </div>

            {/* Spacer - Right */}
            <div className="flex-1" />
          </div>

          {/* Category & Subcategory Badges */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-block px-2 sm:px-4 py-1 bg-secondary-purple text-white text-label font-semibold rounded-full capitalize">
              {category}
            </span>
            <span className="inline-block px-2 sm:px-4 py-1 bg-primary-yellow text-black text-label font-semibold rounded-full">
              Part {subcategory}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 mt-3 sm:mt-4">
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-yellow"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / sentences.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Game Area */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Question - Indonesian Sentence */}
            <div className="bg-card border-2 border-theme rounded-2xl p-8">
              <p className="text-label font-semibold text-text-secondary mb-2 uppercase tracking-wide">
                Complete the sentence
              </p>
              <p className="text-heading-1 text-text-primary">
                {currentSentence.sentence_indo}
              </p>
            </div>

            {/* Underscore Display (all words blank) */}
            <div className="bg-card-darker border-2 border-theme rounded-2xl p-8 text-center">
              <p className="text-game-display text-text-secondary tracking-wider break-words">
                {renderUnderscoreDisplay()}
              </p>
            </div>

            {/* Input Area */}
            <div className="space-y-4">
              <input
                type="text"
                value={userAnswer}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type the English translation..."
                autoFocus
                disabled={!!feedback}
                className="w-full px-6 py-4 bg-input border-2 border-input rounded-2xl text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary-yellow transition-colors disabled:opacity-50 cursor-pointer"
              />

              {/* Hint Button */}
              <div className="flex gap-4">
                <button
                  onClick={handleHintClick}
                  disabled={hintClickCount >= getMaxWordLength(currentSentence.sentence_english) || !!feedback}
                  className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer bg-secondary-purple text-white hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lightbulb className="w-5 h-5" />
                  Hint ({hintClickCount})
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !userAnswer.trim() || !!feedback}
                  className="flex-1 py-3 rounded-xl font-semibold bg-primary-yellow text-black hover:scale-105 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {feedback ? (feedback === 'correct' ? '✓ Correct!' : '✗ Wrong!') : 'Check Answer'}
                </button>
              </div>
            </div>

            {/* Feedback Display */}
            {feedback && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`p-6 rounded-2xl text-center font-bold text-body-lg flex items-center justify-center gap-3 ${
                  feedback === 'correct'
                    ? 'bg-green-500/20 border-2 border-green-500/50 text-green-400'
                    : 'bg-red-500/20 border-2 border-red-500/50 text-red-400'
                }`}
              >
                {feedback === 'correct' ? (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    Excellent!
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6" />
                    Incorrect
                  </>
                )}
              </motion.div>
            )}

            {/* Correct Answer Display */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-card border-2 border-theme rounded-2xl p-6"
              >
                <p className="text-label text-text-secondary mb-2">Correct Answer:</p>
                <p className="text-heading-3 text-primary-yellow">{currentSentence.sentence_english}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Loading Submission Modal */}
      {isSubmittingResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-card rounded-3xl p-8 text-center max-w-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="spinner-loading mx-auto mb-4"
            />
            <p className="text-text-primary font-semibold">Saving your progress...</p>
          </motion.div>
        </motion.div>
      )}

      {/* Result Modal */}
      {showResultModal && (
        <ResultModal
          results={gameResults}
          onClose={() => router.push(`/category-menu/${category}`)}
          onPlayAgain={() => {
            setShowResultModal(false);
            setIsLoading(true);
            setCurrentIndex(0);
            setGameResults([]);
            resetQuestion();
            fetchSentences();
          }}
        />
      )}
    </div>
  );
}

// Result Modal Component
function ResultModal({
  results,
  onClose,
  onPlayAgain,
}: {
  results: GameResult[];
  onClose: () => void;
  onPlayAgain: () => void;
}) {
  const correctCount = results.filter((r) => r.correct).length;
  const accuracy = ((correctCount / results.length) * 100).toFixed(0);

  // Calculate XP gained with hint penalty
  const xpGained = results.reduce((sum, r) => {
    if (!r.correct) return sum + 1; // Wrong answer: 1 XP
    if (r.hintClickCount === 0) return sum + 10; // No hint: 10 XP
    if (r.hintClickCount === 1) return sum + 5; // 1 hint: 5 XP
    return sum + 1; // 2+ hints: 1 XP
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        onClick={(e) => e.stopPropagation()}
        className="border-2 border-primary-yellow rounded-3xl p-8 max-w-md w-full shadow-2xl bg-card-darker"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary-yellow mb-6">Session Complete! 🎉</h2>

          {/* Stats Grid */}
          <div className="space-y-4 mb-8">
            <div className="bg-card p-4 rounded-xl border border-theme">
              <p className="text-text-secondary text-sm mb-1">Accuracy</p>
              <p className="text-3xl font-bold text-primary-yellow">{accuracy}%</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-xl border border-theme">
                <p className="text-text-secondary text-sm mb-1">Correct</p>
                <p className="text-2xl font-bold text-green-400">{correctCount}</p>
              </div>
              <div className="bg-card p-4 rounded-xl border border-theme">
                <p className="text-text-secondary text-sm mb-1">Wrong</p>
                <p className="text-2xl font-bold text-red-400">{results.length - correctCount}</p>
              </div>
            </div>

            <div className="bg-secondary-purple/20 p-4 rounded-xl border border-secondary-purple">
              <p className="text-text-secondary text-sm mb-1">XP Earned</p>
              <p className="text-3xl font-bold text-secondary-purple">+{xpGained}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <motion.button
              onClick={onPlayAgain}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-4 bg-primary-yellow text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </motion.button>

            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-4 bg-card border-2 border-theme text-text-primary rounded-2xl font-bold flex items-center justify-center gap-2 hover:border-primary-yellow transition-all cursor-pointer"
            >
              <Home className="w-5 h-5" />
              Back to Category
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
