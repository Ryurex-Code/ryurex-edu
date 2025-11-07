'use client';

import { Suspense } from 'react';
import VocabGameContent from './vocabgame-content';

export default function VocabGamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#fee801] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading vocabulary...</p>
        </div>
      </div>
    }>
      <VocabGameContent />
    </Suspense>
  );
}
