'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  getProfileLearningSummary,
  ProfileLearningSummary,
} from '@/lib/progress/profile-progress';
import {
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  RotateCcw,
  Cloud,
  CloudOff,
  ExternalLink,
  Shield,
  Layers,
  Terminal,
  Sparkles,
  Zap,
} from 'lucide-react';
import ResetProgressModal from '@/components/ui/ResetProgressModal';
import {
  loadUserState,
  saveUserState,
  resetUserState,
  resetModuleProgress,
} from '@/lib/progress/storage';

export const UserProfileView: React.FC = () => {
  const { user, isAuthPending, signOut } = useAuth();
  const [summary, setSummary] = useState<ProfileLearningSummary>(() =>
    getProfileLearningSummary(user),
  );
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Sync summary with current auth & local storage
  const refreshSummary = () => {
    setSummary(getProfileLearningSummary(user));
  };

  useEffect(() => {
    refreshSummary();

    const handleStorageChange = () => {
      refreshSummary();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  if (!summary || isAuthPending) {
    return (
      <div className="w-full flex items-center justify-center py-24 text-text-dim font-mono text-xs">
        <span className="inline-block w-4 h-4 rounded-full border-2 border-border border-t-func animate-spin mr-2" />
        Loading learner profile…
      </div>
    );
  }

  const { user: profileUser, globalStats, tracks, syncStatus } = summary;

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] bg-ink text-text">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-14 h-96 overflow-hidden opacity-25 select-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, #38bdf8 0%, rgba(56, 189, 248, 0.05) 50%, transparent 100%)',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Profile Identity Card */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
            {/* Avatar disc with conic ring */}
            <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full shrink-0">
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full animate-conic-spin"
                style={{
                  background:
                    'conic-gradient(from 140deg, #38bdf8, var(--border), #38bdf8, var(--border-soft), #38bdf8)',
                }}
              />
              <span className="absolute inset-[2.5px] rounded-full bg-ink" />
              <span className="absolute inset-[4px] rounded-full bg-surface-2 flex items-center justify-center shadow-inner">
                <span className="font-display font-bold text-text text-xl sm:text-2xl select-none">
                  {profileUser.initials}
                </span>
              </span>
            </div>

            {/* User Identity Details */}
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-display text-text truncate">
                  {profileUser.name}
                </h1>
                <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-func/10 text-func border border-func/30">
                  {profileUser.role}
                </span>
                {profileUser.role === 'admin' && (
                  <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    <Shield size={10} />
                    Admin
                  </span>
                )}
              </div>

              <p className="font-mono text-xs text-text-dim truncate">
                {profileUser.email}
              </p>

              {/* Cloud Sync Status Indicator */}
              <div className="flex items-center gap-2 pt-1">
                {syncStatus.isCloudSynced ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Cloud Sync Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Local Browser Progress
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Account Action */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            {profileUser.isGuest ? (
              <Link
                href="/signin?from=/profile"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-func text-ink hover:bg-func-hover transition shadow-sm"
              >
                <Zap size={14} />
                <span>Sign in to Cloud Sync</span>
              </Link>
            ) : (
              <button
                onClick={() => void signOut()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono text-text-dim hover:text-error border border-border bg-surface-2 hover:bg-error/10 transition cursor-pointer"
              >
                Sign out
              </button>
            )}
          </div>
        </div>

        {/* Guest Warning / Value Banner */}
        {profileUser.isGuest && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                <CloudOff size={18} />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-amber-200">
                  You are browsing in guest mode
                </p>
                <p className="text-xs text-text-dim leading-relaxed">
                  Your curriculum progress is saved locally to this browser. Create an account to unlock automatic cloud sync and learn seamlessly across all your devices.
                </p>
              </div>
            </div>
            <Link
              href="/signup?from=/profile"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-400 text-ink hover:bg-amber-300 transition shrink-0"
            >
              <span>Create Free Account</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* 4 Global Stats KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-surface rounded-xl border border-border p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between text-text-dim font-mono text-xs">
              <span>Days Cleared</span>
              <BookOpen size={15} className="text-func" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-display text-text">
              {globalStats.totalDaysCompleted}
              <span className="text-sm font-mono text-text-dim font-normal ml-1">
                / {globalStats.totalDaysAvailable}
              </span>
            </div>
            <p className="text-[11px] font-mono text-text-dim">
              Across all available tracks
            </p>
          </div>

          <div className="bg-surface rounded-xl border border-border p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between text-text-dim font-mono text-xs">
              <span>Tasks Solved</span>
              <CheckCircle2 size={15} className="text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-display text-text">
              {globalStats.totalTasksCompleted}
            </div>
            <p className="text-[11px] font-mono text-text-dim">
              Hands-on query & schema tasks
            </p>
          </div>

          <div className="bg-surface rounded-xl border border-border p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between text-text-dim font-mono text-xs">
              <span>Challenges</span>
              <Award size={15} className="text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-display text-text">
              {globalStats.totalChallengesCompleted}
            </div>
            <p className="text-[11px] font-mono text-text-dim">
              Independent milestone projects
            </p>
          </div>

          <div className="bg-surface rounded-xl border border-border p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between text-text-dim font-mono text-xs">
              <span>Overall Progress</span>
              <Sparkles size={15} className="text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-display text-text">
              {globalStats.overallPercent}%
            </div>
            <div className="w-full bg-surface-2 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(2, globalStats.overallPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Learning Tracks Hub */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-text">
                Learning Tracks Progression
              </h2>
              <p className="text-xs sm:text-sm text-text-dim mt-0.5">
                Detailed roadmap milestone progress and next lesson resume links.
              </p>
            </div>
          </div>

          {/* SQL Track Card */}
          <div id="profile-track-sql" className="bg-surface rounded-2xl border border-border p-6 space-y-5 hover:border-func/40 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-func/15 text-func border border-func/30">
                  SQL Track
                </span>
                <span className="font-mono text-xs text-text-dim">
                  {tracks.sql.completedModules} of {tracks.sql.totalModules} Days ({tracks.sql.percent}%)
                </span>
              </div>
              <span className="font-mono text-xs text-func font-medium self-start sm:self-auto">
                Milestone {tracks.sql.currentMilestoneOrder} · {tracks.sql.currentMilestoneTitle}
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2.5 bg-surface-2 rounded-full overflow-hidden border border-border-soft">
                <div
                  className="h-full bg-func rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(2, tracks.sql.percent)}%` }}
                />
              </div>
              <div className="flex justify-between font-mono text-[11px] text-text-dim">
                <span>{tracks.sql.completedTasks} practice tasks completed</span>
                <span>{tracks.sql.completedChallenges} challenges cleared</span>
              </div>
            </div>

            {/* Active Resume / Roadmap Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-border-soft">
              <div className="space-y-0.5 min-w-0">
                <p className="font-mono text-[11px] text-text-dim uppercase tracking-wider">
                  Current Lesson
                </p>
                <p className="font-semibold text-sm sm:text-base text-text truncate">
                  Day {tracks.sql.currentDayNumber}: {tracks.sql.currentDayTitle}
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  href={tracks.sql.roadmapUrl}
                  className="px-3.5 py-2 rounded-xl text-xs font-mono text-text-dim hover:text-text border border-border bg-surface-2 hover:bg-surface-3 transition"
                >
                  Full Roadmap
                </Link>
                <Link
                  id="profile-resume-sql-btn"
                  href={tracks.sql.resumeUrl}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-func text-ink hover:bg-func-hover transition shadow-sm"
                >
                  <span>Resume Day {tracks.sql.currentDayNumber}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>

          {/* Prisma Track Card */}
          <div id="profile-track-prisma" className="bg-surface rounded-2xl border border-border p-6 space-y-5 hover:border-[#38bdf8]/40 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30">
                  Prisma Track
                </span>
                <span className="font-mono text-xs text-text-dim">
                  {tracks.prisma.completedModules} of {tracks.prisma.totalModules} Days ({tracks.prisma.percent}%)
                </span>
              </div>
              <span className="font-mono text-xs text-[#38bdf8] font-medium self-start sm:self-auto">
                Type-Safe ORM & Schemas
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2.5 bg-surface-2 rounded-full overflow-hidden border border-border-soft">
                <div
                  className="h-full bg-[#38bdf8] rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(2, tracks.prisma.percent)}%` }}
                />
              </div>
              <div className="flex justify-between font-mono text-[11px] text-text-dim">
                <span>{tracks.prisma.completedTasks} schema tasks completed</span>
                <span>{tracks.prisma.completedChallenges} relations cleared</span>
              </div>
            </div>

            {/* Active Resume / Roadmap Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-border-soft">
              <div className="space-y-0.5 min-w-0">
                <p className="font-mono text-[11px] text-text-dim uppercase tracking-wider">
                  Current Lesson
                </p>
                <p className="font-semibold text-sm sm:text-base text-text truncate">
                  Day {tracks.prisma.currentDayNumber}: {tracks.prisma.currentDayTitle}
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  href={tracks.prisma.roadmapUrl}
                  className="px-3.5 py-2 rounded-xl text-xs font-mono text-text-dim hover:text-text border border-border bg-surface-2 hover:bg-surface-3 transition"
                >
                  Full Roadmap
                </Link>
                <Link
                  id="profile-resume-prisma-btn"
                  href={tracks.prisma.resumeUrl}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#38bdf8] text-[#060b16] hover:bg-[#38bdf8]/90 transition shadow-sm"
                >
                  <span>Resume Day {tracks.prisma.currentDayNumber}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>

          {/* Networking Track Card */}
          <div id="profile-track-networking" className="bg-surface rounded-2xl border border-border p-6 space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Networking Track
                </span>
                <span className="font-mono text-xs text-text-dim">
                  {tracks.networking.totalModules} Days Live Simulation
                </span>
              </div>
              <span className="font-mono text-xs text-emerald-400 font-medium self-start sm:self-auto">
                Interactive Packet & Topology Lab
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text-dim leading-relaxed">
              Step through physical cables, MAC learning tables, ARP broadcast domains, and router hops on an interactive SVG canvas with a real terminal.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-border-soft">
              <div className="space-y-0.5">
                <p className="font-mono text-[11px] text-text-dim uppercase tracking-wider">
                  Current Lab
                </p>
                <p className="font-semibold text-sm text-text">
                  Day {tracks.networking.currentDayNumber}: {tracks.networking.currentDayTitle}
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  href={tracks.networking.roadmapUrl}
                  className="px-3.5 py-2 rounded-xl text-xs font-mono text-text-dim hover:text-text border border-border bg-surface-2 hover:bg-surface-3 transition"
                >
                  Overview
                </Link>
                <Link
                  href={tracks.networking.resumeUrl}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-400 text-[#060b16] hover:bg-emerald-300 transition shadow-sm"
                >
                  <Terminal size={13} />
                  <span>Open Lab</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Account Data & Storage Preferences */}
        <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Layers size={16} className="text-text-dim" />
              <h3 className="text-sm font-semibold text-text font-display">
                Data & Storage Management
              </h3>
            </div>
            <span className="font-mono text-xs text-text-dim">
              {syncStatus.storageKeyPrefix}
            </span>
          </div>

          <p className="text-xs text-text-dim leading-relaxed">
            Your learning progress is maintained with anti-regression guarantees across tab refreshes and browser restarts. If you need to restart curriculum tracks from Day 1, you can perform a safe reset below.
          </p>

          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => setResetModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Reset Curriculum Progress…</span>
            </button>

            <Link
              href="/playground"
              className="inline-flex items-center gap-1 text-xs font-mono text-text-dim hover:text-func transition"
            >
              <span>Open Scratch Playground</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Reset Progress Modal Integration */}
      <ResetProgressModal
        isOpen={resetModalOpen}
        onClose={() => {
          setResetModalOpen(false);
          refreshSummary();
        }}
        onConfirmReset={async (mode, moduleId) => {
          const userId = user?.id ?? null;
          if (mode === 'module' && moduleId) {
            const state = loadUserState(userId, 'sql');
            const next = resetModuleProgress(moduleId, state);
            saveUserState(next, userId, 'sql');
          } else {
            resetUserState(userId, undefined, 'sql');
            resetUserState(userId, undefined, 'prisma');
          }
          setResetModalOpen(false);
          refreshSummary();
        }}
      />
    </div>
  );
};
