'use client';
/**
 * AuthScreen — route wrapper around AuthView.
 * Mode switching and back/success navigation respect the originating URL (?from= / ?redirect=):
 *   /signin ↔ /signup (propagating from parameter)
 *   success / back → return target (or / if none)
 */
import React, { Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthView } from './AuthView';

function sanitizeReturnUrl(url: string | null): string {
  if (!url) return '/';
  if (url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }
  return '/';
}

interface AuthScreenProps {
  mode: 'signin' | 'signup';
}

function AuthScreenInner({ mode }: AuthScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTarget = sanitizeReturnUrl(searchParams.get('from') || searchParams.get('redirect'));

  const handleSetMode = useCallback(
    (next: 'signin' | 'signup') => {
      const qs = returnTarget !== '/' ? `?from=${encodeURIComponent(returnTarget)}` : '';
      router.push(next === 'signin' ? `/signin${qs}` : `/signup${qs}`);
    },
    [router, returnTarget],
  );

  const handleBack = useCallback(() => {
    router.push(returnTarget);
  }, [router, returnTarget]);

  return (
    <AuthView
      mode={mode}
      onSetMode={handleSetMode}
      onBack={handleBack}
      onSuccess={handleBack}
    />
  );
}

export default function AuthScreen({ mode }: AuthScreenProps) {
  return (
    <Suspense fallback={null}>
      <AuthScreenInner mode={mode} />
    </Suspense>
  );
}
