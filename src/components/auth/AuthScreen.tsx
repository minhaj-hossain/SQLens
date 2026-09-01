'use client';
/**
 * AuthScreen — route wrapper around AuthView (Phase 1).
 * Mode switching and back/success navigation become real route navigation:
 *   /signin ↔ /signup, success/back → /
 */
import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthView } from './AuthView';

interface AuthScreenProps {
  mode: 'signin' | 'signup';
}

export default function AuthScreen({ mode }: AuthScreenProps) {
  const router = useRouter();

  const handleSetMode = useCallback(
    (next: 'signin' | 'signup') => {
      router.push(next === 'signin' ? '/signin' : '/signup');
    },
    [router],
  );

  const handleBack = useCallback(() => router.push('/'), [router]);

  // Sign-up now lands on the themed verification hub (check inbox / resend);
  // sign-in goes straight into the app.
  const handleSuccess = useCallback(
    (origin: 'signin' | 'signup') => {
      router.push(origin === 'signup' ? '/verify-email' : '/');
    },
    [router],
  );

  return (
    <AuthView
      mode={mode}
      onSetMode={handleSetMode}
      onBack={handleBack}
      onSuccess={handleSuccess}
    />
  );
}
