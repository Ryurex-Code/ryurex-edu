'use client';

import { Suspense } from 'react';
import AiModeContent from './ai-mode-content';

export default function AiModePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Initializing AI Mode...</p>
          </div>
        </div>
      }
    >
      <AiModeContent />
    </Suspense>
  );
}
