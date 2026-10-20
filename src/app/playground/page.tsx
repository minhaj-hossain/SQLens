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
    // If the learner arrived from a page on the same origin (e.g. project homepage), return there
    if (typeof window !== 'undefined' && document.referrer) {
      try {
        const refUrl = new URL(document.referrer);
        if (refUrl.origin === window.location.origin) {
          const path = refUrl.pathname + refUrl.search + refUrl.hash;
          if (path.startsWith('/') && !path.startsWith('//')) {
            router.push(path);
            return;
          }
        }
      } catch {
        /* fallback below */
      }
    }
    // Return to the respective track roadmap or project homepage instead of defaulting to /sql
    if (mode === 'prisma') {
      router.push('/prisma');
    } else if (mode === 'sql') {
      router.push('/sql');
    } else {
      router.push('/');
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
