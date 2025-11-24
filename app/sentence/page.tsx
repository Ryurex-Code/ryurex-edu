'use client';

import { Suspense } from 'react';
import SentenceModeContent from './sentence-content';

export default function SentenceModePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="spinner-loading" />
          </div>
          <p className="text-text-secondary">Loading sentence mode...</p>
        </div>
      </div>
    }>
      <SentenceModeContent />
    </Suspense>
  );
}
