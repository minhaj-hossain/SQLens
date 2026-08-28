'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Playground from '@/components/learning/Playground';

/**
 * /playground — real route since Phase 1. Sits OUTSIDE the (app) group on
 * purpose: the playground is a standalone full-page tool (no Header, no
 * learning providers — it owns its own SqlExecutor instances).
 */
export default function PlaygroundPage() {
  const router = useRouter();
  return <Playground onClose={() => router.push('/')} />;
}
