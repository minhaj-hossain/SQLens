'use client';

import React from 'react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { PracticeSkeleton } from '@/components/learn/PracticeSkeleton';

export interface ClickSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'func' | 'sky' | 'white' | 'muted';
  className?: string;
  label?: string;
}

/**
 * ClickSpinner — Theme-consistent, hardware-accelerated micro spinner.
 * Used for inline buttons, headers, and compact action states.
 */
export const ClickSpinner: React.FC<ClickSpinnerProps> = ({
  size = 'md',
  variant = 'func',
  className = '',
  label = 'Loading',
}) => {
  const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  };

  const borderVariant = {
    func: 'border-border-soft border-t-func',
    sky: 'border-[#1b2a47] border-t-[#38bdf8]',
    white: 'border-white/20 border-t-white',
    muted: 'border-[#1e293b] border-t-[#8a9bbd]',
  }[variant];

  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block rounded-full border-2 animate-spin shrink-0 ${sizeMap[size]} ${borderVariant} ${className}`}
    />
  );
};

export interface ClickPageLoaderProps {
  message?: string;
  subMessage?: string;
  fullscreen?: boolean;
}

/**
 * ClickPageLoader — Full-page branded loading experience for top-level suspense.
 * Adheres strictly to the active theme tokens (Graphite / Sky).
 */
export const ClickPageLoader: React.FC<ClickPageLoaderProps> = ({
  message = 'Loading Click environment…',
  subMessage = 'When concepts finally click.',
  fullscreen = true,
}) => {
  return (
    <main
      className={`w-full flex items-center justify-center bg-ink text-text select-none ${
        fullscreen ? 'min-h-screen' : 'py-20'
      }`}
      aria-busy="true"
      aria-label={message}
    >
      <div className="relative flex flex-col items-center gap-5 px-6 text-center max-w-sm">
        {/* Soft radial backdrop aura */}
        <div
          className="absolute -top-10 w-40 h-40 bg-func/10 rounded-full blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Brand mark */}
        <div className="relative flex items-center justify-center p-3.5 rounded-2xl bg-surface border border-border shadow-[0_0_24px_-4px_var(--accent-dim)]">
          <BrandLogo size="lg" showText={false} variant="click" />
        </div>

        {/* Text and dynamic progress bar */}
        <div className="flex flex-col items-center gap-1.5">
          <h2 className="text-sm font-semibold tracking-wide text-text font-display">
            {message}
          </h2>
          <p className="text-xs text-text-dim font-mono">{subMessage}</p>

          <div className="mt-3 w-36 h-1 bg-surface-2 rounded-full overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-func to-transparent animate-[shimmer_1.5s_infinite] -translate-x-full" />
          </div>
        </div>
      </div>
    </main>
  );
};

/**
 * CurriculumWorkspaceSkeleton — Matches the interactive learning IDE layout.
 * Used during route transitions on /sql/learn and /prisma/learn to eliminate layout shift.
 */
export const CurriculumWorkspaceSkeleton: React.FC<{ trackName?: string }> = ({
  trackName = 'Curriculum',
}) => {
  return (
    <div className="min-h-screen bg-ink flex flex-col w-full" aria-busy="true" aria-label={`Loading ${trackName}`}>
      {/* Top Breadcrumb Header Bar Skeleton */}
      <div className="border-b border-border-soft bg-surface/60 backdrop-blur px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-5 w-24 bg-surface-2 rounded animate-pulse" />
            <span className="text-border-soft">/</span>
            <div className="h-5 w-36 bg-surface-2 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-20 bg-surface-2 rounded-lg animate-pulse" />
            <div className="h-7 w-24 bg-surface-2 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Learning Grid Skeleton */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">
        <PracticeSkeleton />
      </div>
    </div>
  );
};

/**
 * AdminSystemSkeleton — Tailored skeleton for the Admin System Telemetry dashboard.
 * Mirrors: 3 metric KPI cards + memory allocation meter + resource stat boxes.
 */
export const AdminSystemSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading system telemetry">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="h-6 w-56 bg-surface-2 rounded-lg" />
          <div className="h-3.5 w-80 bg-surface-2/60 rounded" />
        </div>
        <div className="h-8 w-24 bg-surface-2 rounded-lg self-start sm:self-auto" />
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface border border-border p-4 rounded-xl flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-2 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-2.5 w-20 bg-surface-2 rounded font-mono" />
              <div className="h-5 w-28 bg-surface-2 rounded" />
              <div className="h-2.5 w-24 bg-surface-2/60 rounded font-mono" />
            </div>
          </div>
        ))}
      </div>

      {/* Memory Allocation Card */}
      <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-40 bg-surface-2 rounded" />
          <div className="h-3 w-28 bg-surface-2 rounded font-mono" />
        </div>
        <div className="w-full bg-surface-2 h-3 rounded-full overflow-hidden" />
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-2 p-3 rounded-lg border border-border-soft space-y-2">
              <div className="h-2.5 w-16 bg-surface-3 rounded" />
              <div className="h-5 w-20 bg-surface-3 rounded font-mono" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * AdminAnnouncementsSkeleton — Tailored skeleton for the Admin Broadcast Announcements panel.
 * Mirrors: Announcement compose action + broadcast item cards with severity badges.
 */
export const AdminAnnouncementsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading announcements">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="h-6 w-60 bg-surface-2 rounded-lg" />
          <div className="h-3.5 w-80 bg-surface-2/60 rounded" />
        </div>
        <div className="h-9 w-32 bg-surface-2 rounded-lg self-start sm:self-auto" />
      </div>

      {/* Announcements Card Feed */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-16 bg-surface-2 rounded-full" />
                <div className="h-4 w-48 bg-surface-2 rounded" />
              </div>
              <div className="h-5 w-16 bg-surface-2 rounded-md" />
            </div>
            <div className="h-3.5 w-3/4 bg-surface-2/70 rounded" />
            <div className="flex items-center justify-between pt-2 border-t border-border-soft">
              <div className="h-3 w-28 bg-surface-2/50 rounded font-mono" />
              <div className="h-6 w-14 bg-surface-2 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * AdminAnalyticsSkeleton — Tailored skeleton for the Admin Learner Progression Analytics panel.
 * Mirrors: Header + 4 KPI summary cards + module progression breakdown list.
 */
export const AdminAnalyticsSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse" aria-busy="true" aria-label="Loading analytics">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-6 w-64 bg-surface-2 rounded-lg" />
        <div className="h-3.5 w-96 bg-surface-2/60 rounded" />
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex gap-2 pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-7 w-24 bg-surface-2 rounded-lg" />
        ))}
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface border border-border p-4 rounded-xl space-y-2">
            <div className="h-3 w-24 bg-surface-2 rounded font-mono" />
            <div className="h-6 w-16 bg-surface-2 rounded font-bold" />
            <div className="h-2.5 w-20 bg-surface-2/60 rounded font-mono" />
          </div>
        ))}
      </div>

      {/* Progress Funnel List */}
      <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
        <div className="h-5 w-48 bg-surface-2 rounded mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-surface-2/50 rounded-lg border border-border-soft flex items-center justify-between px-4">
            <div className="h-4 w-40 bg-surface-2 rounded" />
            <div className="h-4 w-20 bg-surface-2 rounded font-mono" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * AdminTableSkeleton — Professional table and list placeholder for admin views.
 * Used for UsersPanel, ModulesPanel, and structured data tables.
 */
export const AdminTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-3 animate-pulse py-2" aria-busy="true" aria-label="Loading admin data">
      {/* Search / Filter toolbar */}
      <div className="h-10 bg-surface-2 rounded-xl border border-border flex items-center justify-between px-4">
        <div className="h-4 w-44 bg-surface rounded font-mono" />
        <div className="h-6 w-24 bg-surface rounded-lg" />
      </div>

      {/* Data rows */}
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-14 bg-surface rounded-xl border border-border-soft flex items-center justify-between px-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-surface-2 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-44 bg-surface-2 rounded" />
                <div className="h-2.5 w-28 bg-surface-2/60 rounded font-mono" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-16 bg-surface-2 rounded-md" />
              <div className="h-6 w-12 bg-surface-2 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

