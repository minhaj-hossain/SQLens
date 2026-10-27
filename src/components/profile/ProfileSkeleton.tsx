'use client';

import React from 'react';

/**
 * ProfileSkeleton — Matches the exact layout of UserProfileView.
 * Prevents layout shift during suspense streaming and hydration.
 */
export const ProfileSkeleton: React.FC = () => {
  return (
    <div
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-pulse select-none"
      aria-busy="true"
      aria-label="Loading learner profile and progress"
    >
      {/* Identity Card Skeleton */}
      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface-2 border border-border shrink-0" />
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-44 bg-surface-2 rounded-lg" />
              <div className="h-5 w-16 bg-surface-2 rounded-full" />
            </div>
            <div className="h-4 w-52 bg-surface-2/60 rounded" />
            <div className="h-4 w-32 bg-surface-2/40 rounded font-mono" />
          </div>
        </div>
        <div className="h-9 w-28 bg-surface-2 rounded-xl self-start sm:self-auto" />
      </div>

      {/* 4 Stats KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface rounded-xl border border-border p-4 sm:p-5 space-y-2.5">
            <div className="h-3.5 w-24 bg-surface-2 rounded font-mono" />
            <div className="h-7 w-20 bg-surface-2 rounded font-bold" />
            <div className="h-3 w-28 bg-surface-2/50 rounded font-mono" />
          </div>
        ))}
      </div>

      {/* Track Progress Section Header Skeleton */}
      <div className="space-y-2 pt-2">
        <div className="h-6 w-48 bg-surface-2 rounded-lg" />
        <div className="h-4 w-72 bg-surface-2/60 rounded" />
      </div>

      {/* 3 Track Progress Cards Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface rounded-2xl border border-border p-5 sm:p-6 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-6 w-20 bg-surface-2 rounded-full" />
                <div className="h-5 w-48 bg-surface-2 rounded" />
              </div>
              <div className="h-4 w-28 bg-surface-2/70 rounded font-mono self-start sm:self-auto" />
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden" />

            {/* Bottom details & action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 bg-surface-2/50 rounded font-mono" />
                <div className="h-5 w-56 bg-surface-2 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-24 bg-surface-2 rounded-xl" />
                <div className="h-9 w-32 bg-surface-2 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Account Settings Skeleton */}
      <div className="bg-surface rounded-xl border border-border p-5 flex items-center justify-between">
        <div className="h-4 w-40 bg-surface-2 rounded" />
        <div className="h-8 w-28 bg-surface-2 rounded-lg" />
      </div>
    </div>
  );
};
