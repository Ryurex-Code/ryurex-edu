'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2 } from 'lucide-react';

interface EditDisplayNameModalProps {
  isOpen: boolean;
  currentDisplayName: string;
  onClose: () => void;
  onSuccess: (newDisplayName: string) => void;
}

export default function EditDisplayNameModal({
  isOpen,
  currentDisplayName,
  onClose,
  onSuccess,
}: EditDisplayNameModalProps) {
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    const trimmed = displayName.trim();
    if (trimmed.length === 0 || trimmed.length > 50) {
      setError('Display name must be between 1 and 50 characters');
      return;
    }

    if (trimmed === currentDisplayName) {
      onClose();
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/updateDisplayName', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: trimmed }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update display name');
      }

      await response.json();
      onSuccess(trimmed);
      
      // Dispatch event to trigger leaderboard refresh
      window.dispatchEvent(new CustomEvent('displayNameUpdated', { detail: { newDisplayName: trimmed } }));
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setDisplayName(currentDisplayName);
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card border-2 border-theme rounded-2xl p-6 max-w-md w-full shadow-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-primary-yellow" />
                <h3 className="text-xl font-bold">Change Display Name</h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-surface rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current Display Name Info */}
              <div>
                <label className="text-sm text-text-secondary mb-1 block">
                  Current Name
                </label>
                <div className="p-3 bg-surface rounded-lg border border-theme text-text-secondary">
                  {currentDisplayName}
                </div>
              </div>

              {/* Input */}
              <div>
                <label htmlFor="displayName" className="text-sm text-text-secondary mb-2 block">
                  New Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your new display name"
                  maxLength={50}
                  className="w-full px-4 py-2 bg-surface border-2 border-theme rounded-lg text-foreground placeholder:text-text-secondary focus:outline-none focus:border-primary-yellow transition-colors"
                  disabled={isLoading}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-text-secondary">
                    {displayName.length}/50 characters
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg border-2 border-theme text-foreground hover:border-primary-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-primary-yellow text-black rounded-lg font-semibold hover:bg-primary-yellow-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
