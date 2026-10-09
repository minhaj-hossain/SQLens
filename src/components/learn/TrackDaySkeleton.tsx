import React from 'react';
import { PracticeSkeleton } from './PracticeSkeleton';

/**
 * TrackDaySkeleton — theme-consistent loading placeholder for TrackDayLayoutView.
 * Renders inside the persistent breadcrumb shell while isProgressReady is false.
 */
export function TrackDaySkeleton() {
  return (
    <div className="w-full space-y-4" aria-busy="true" aria-label="Loading day content">
      <PracticeSkeleton />
    </div>
  );
}
