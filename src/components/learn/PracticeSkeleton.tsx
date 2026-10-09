import React from 'react';

/**
 * PracticeSkeleton — theme-consistent loading placeholder for PracticeView.
 * Uses design system tokens (bg-surface, bg-surface-2, border-border, animate-pulse)
 * to eliminate layout shift during suspense streaming or hydration.
 */
export function PracticeSkeleton() {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 w-full animate-pulse"
      aria-busy="true"
      aria-label="Loading practice task"
    >
      {/* Left Column: Task Instructions & Database Explorer */}
      <div className="flex flex-col gap-3.5 sm:gap-4 min-w-0 w-full">
        {/* Task Card Skeleton */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 bg-surface-2 rounded font-mono" />
              <div className="h-4 w-24 bg-surface-2 rounded font-mono" />
            </div>
            <div className="h-5 w-20 bg-surface-2 rounded-full" />
          </div>

          <div className="space-y-2 pt-1">
            <div className="h-6 w-3/4 bg-surface-2 rounded" />
            <div className="h-4 w-full bg-surface-2 rounded" />
            <div className="h-4 w-5/6 bg-surface-2 rounded" />
          </div>

          <div className="pt-3 border-t border-border-soft flex items-center justify-between">
            <div className="h-4 w-28 bg-surface-2 rounded font-mono" />
            <div className="h-4 w-20 bg-surface-2 rounded font-mono" />
          </div>
        </div>

        {/* Database Explorer Skeleton */}
        <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-surface-2 rounded" />
              <div className="h-4 w-32 bg-surface-2 rounded font-mono" />
            </div>
            <div className="h-4 w-16 bg-surface-2 rounded font-mono" />
          </div>

          <div className="h-28 bg-surface-2/60 rounded-lg border border-border-soft flex flex-col justify-center px-4 space-y-2">
            <div className="h-3 w-4/5 bg-surface-2 rounded" />
            <div className="h-3 w-3/5 bg-surface-2 rounded" />
            <div className="h-3 w-2/3 bg-surface-2 rounded" />
          </div>
        </div>
      </div>

      {/* Right Column: Code Editor & Results Console */}
      <div className="flex flex-col gap-3.5 sm:gap-4 min-w-0 w-full">
        {/* Code Editor Skeleton */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-surface-2 border-b border-border-soft">
            <div className="h-4 w-20 bg-surface-3 rounded font-mono" />
            <div className="flex items-center gap-2">
              <div className="h-5 w-14 bg-surface-3 rounded" />
              <div className="h-5 w-14 bg-surface-3 rounded" />
            </div>
          </div>

          {/* Editor Body */}
          <div className="p-4 space-y-2.5 min-h-[220px] bg-surface">
            <div className="h-4 w-1/4 bg-surface-2 rounded font-mono" />
            <div className="h-4 w-2/5 bg-surface-2 rounded font-mono" />
            <div className="h-4 w-1/3 bg-surface-2 rounded font-mono" />
            <div className="h-4 w-1/2 bg-surface-2 rounded font-mono" />
          </div>

          {/* Editor Footer / Action Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-surface border-t border-border">
            <div className="h-4 w-32 bg-surface-2 rounded font-mono" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-16 bg-surface-2 rounded-lg" />
              <div className="h-8 w-28 bg-surface-2 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Results Console Skeleton */}
        <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-surface-2 rounded font-mono" />
            <div className="h-4 w-16 bg-surface-2 rounded font-mono" />
          </div>
          <div className="h-24 bg-surface-2/40 rounded-lg border border-border-soft flex items-center justify-center">
            <div className="h-3 w-40 bg-surface-2 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
