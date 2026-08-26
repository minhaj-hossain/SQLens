'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the failure in the console for debugging/diagnostics.
    console.error('SQLens runtime error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="bg-surface border border-error/30 rounded-2xl p-8 max-w-md w-full text-center">
        <div className="mx-auto mb-5 w-12 h-12 rounded-full bg-error/10 border border-error/40 flex items-center justify-center">
          <span className="text-error font-mono font-bold text-lg">!</span>
        </div>
        <h1 className="font-display font-bold text-xl text-text mb-2">Something went wrong</h1>
        <p className="text-sm text-text-dim leading-relaxed mb-6">
          An unexpected error occurred while running the app. Your saved progress is safe.
          {error.digest && (
            <span className="block mt-2 font-mono text-[11px] text-text-faint">
              ref: {error.digest}
            </span>
          )}
        </p>
        <button
          onClick={reset}
          className="inline-block bg-func text-ink font-mono text-xs font-bold px-5 py-2.5 rounded-lg hover:brightness-110 transition"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
