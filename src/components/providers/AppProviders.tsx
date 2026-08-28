'use client';
/**
 * AppProviders — composition root for the learning application's client-side
 * providers (Phase 0). In Phase 1 this mounts inside (app)/layout.tsx.
 *
 * Ordering matters: LearningProgressProvider consumes the session from
 * AuthProvider (cloud sync keys off the signed-in user id).
 */
import React from 'react';
import { AuthProvider } from './AuthProvider';
import { LearningProgressProvider } from './LearningProgressProvider';
import { SqlExecutorProvider } from './SqlExecutorProvider';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LearningProgressProvider>
        <SqlExecutorProvider>{children}</SqlExecutorProvider>
      </LearningProgressProvider>
    </AuthProvider>
  );
}
