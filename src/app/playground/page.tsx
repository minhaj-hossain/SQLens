'use client';
import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Playground from '@/components/learning/Playground';

function sanitizeReturnUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }
  return null;
}

function PlaygroundInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = sanitizeReturnUrl(searchParams.get('from'));
  const mode = searchParams.get('mode');

  const handleClose = () => {
    if (fromParam) {
      router.push(fromParam);
      return;
    }
    // Return to the respective track roadmap instead of kicking to root
    if (mode === 'prisma') {
      router.push('/prisma');
    } else {
      router.push('/sql');
    }
  };

  return <Playground onClose={handleClose} />;
}

/**
 * /playground — real route since Phase 1. Sits OUTSIDE the (app) group on
 * purpose: the playground is a standalone full-page tool (no Header, no
 * learning providers — it owns its own SqlExecutor instances).
 * Supports ?from= to seamlessly return to the learner's previous workspace.
 */
export default function PlaygroundPage() {
  return (
    <Suspense fallback={null}>
      <PlaygroundInner />
    </Suspense>
  );
}
