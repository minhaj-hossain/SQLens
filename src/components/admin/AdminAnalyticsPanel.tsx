'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { adminGetAnalytics, AdminAnalyticsData } from '@/lib/admin-api';

export default function AdminAnalyticsPanel() {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<'all' | 'milestone-1' | 'milestone-2' | 'milestone-3' | 'cliffs'>('all');

  useEffect(() => {
    adminGetAnalytics()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load analytics');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <p className="font-mono text-xs text-text-dim animate-pulse">Aggregating learner analytics across all 38 modules…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-surface border border-error/30 rounded-xl p-6 text-center">
        <p className="font-mono text-xs text-error uppercase tracking-wider mb-2">Error</p>
        <p className="text-text-dim text-sm">{error || 'Failed to aggregate analytics'}</p>
      </div>
    );
  }

  const filteredModules = data.modules.filter((m) => {
    if (stageFilter === 'all') return true;
    if (stageFilter === 'cliffs') return m.dropoffRate >= 8 || m.day === 7 || m.day === 14 || m.day === 21;
    return m.milestoneId === stageFilter;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-text">Learner Progression Analytics</h2>
        <p className="text-xs sm:text-sm text-text-dim mt-1">
          Real-time retention funnel, completion rates, and drop-off heatmap across all 38 curriculum days.
        </p>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-surface border border-border p-4 rounded-xl">
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-dim mb-1">Total Learners</p>
          <p className="font-display text-2xl sm:text-3xl font-bold text-text">{data.totalLearners}</p>
          <p className="text-[11px] text-text-faint mt-1 font-mono">Registered accounts</p>
        </div>

        <div className="bg-surface border border-border p-4 rounded-xl">
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-dim mb-1">Active Learners (7d)</p>
          <p className="font-display text-2xl sm:text-3xl font-bold text-func">{data.activeLearners7d}</p>
          <p className="text-[11px] text-text-faint mt-1 font-mono">
            {Math.round((data.activeLearners7d / Math.max(data.totalLearners, 1)) * 100)}% active this week
          </p>
        </div>

        <div className="bg-surface border border-border p-4 rounded-xl">
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-dim mb-1">38/38 Graduates</p>
          <p className="font-display text-2xl sm:text-3xl font-bold text-text">{data.completedCurriculumCount}</p>
          <p className="text-[11px] text-text-faint mt-1 font-mono">
            {Math.round((data.completedCurriculumCount / Math.max(data.totalLearners, 1)) * 100)}% graduation rate
          </p>
        </div>

        <div className="bg-surface border border-border p-4 rounded-xl">
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-dim mb-1">Median Day Reached</p>
          <p className="font-display text-2xl sm:text-3xl font-bold text-text">Day {data.medianDayReached || 1}</p>
          <p className="text-[11px] text-text-faint mt-1 font-mono">Across all learners</p>
        </div>
      </div>

      {/* Milestone Progress Summary */}
      <div className="bg-surface border border-border rounded-xl p-5 sm:p-6">
        <h3 className="font-display text-sm sm:text-base font-semibold text-text mb-4">Milestone Progression</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.milestones.map((ms) => (
            <div key={ms.id} className="bg-surface-2 border border-border-soft p-4 rounded-lg">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono text-func font-semibold">STAGE {ms.number}</span>
                <span className="font-mono text-text-dim">{ms.totalModules} Days</span>
              </div>
              <p className="font-display font-medium text-sm text-text truncate">{ms.subtitle}</p>
              <div className="w-full bg-surface h-2 rounded-full mt-3 overflow-hidden border border-border-soft">
                <div
                  className="bg-func h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(ms.completionRate, 4)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-text-dim mt-2">
                <span>Avg Completion</span>
                <span className="text-text font-semibold">{ms.completionRate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drop-off Heatmap & 38-Day Funnel */}
      <div className="bg-surface border border-border rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-border-soft">
          <div>
            <h3 className="font-display text-base font-semibold text-text">38-Day Drop-off Heatmap & Retention Matrix</h3>
            <p className="text-xs text-text-dim mt-0.5">
              Inspect completion and drop-off per module to detect bottlenecks in the learning pipeline.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {(
              [
                { id: 'all', label: 'All 38 Days' },
                { id: 'milestone-1', label: 'Stage 1' },
                { id: 'milestone-2', label: 'Stage 2' },
                { id: 'milestone-3', label: 'Stage 3' },
                { id: 'cliffs', label: 'Top Drop-offs' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStageFilter(tab.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] transition cursor-pointer ${
                  stageFilter === tab.id
                    ? 'bg-func text-ink font-semibold'
                    : 'bg-surface-2 text-text-dim hover:text-text border border-border-soft'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modules Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-soft font-mono text-[11px] text-text-dim uppercase tracking-wider">
                <th className="py-2.5 px-3">Day</th>
                <th className="py-2.5 px-3">Module Title</th>
                <th className="py-2.5 px-3 text-right">Completions</th>
                <th className="py-2.5 px-3 text-center w-40">Retention Bar</th>
                <th className="py-2.5 px-3 text-right">Pass Rate</th>
                <th className="py-2.5 px-3 text-right">Drop-off</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft font-mono">
              {filteredModules.map((m) => {
                const isCliff = m.dropoffRate >= 10;
                return (
                  <tr key={m.id} className="hover:bg-surface-2/60 transition">
                    <td className="py-2.5 px-3 text-func font-semibold whitespace-nowrap">
                      Day {m.day}
                    </td>
                    <td className="py-2.5 px-3 font-body text-text font-medium truncate max-w-[280px]">
                      {m.title.replace(/^Day\s*\d+\s*[—–-]\s*/, '')}
                    </td>
                    <td className="py-2.5 px-3 text-right text-text-dim">
                      {m.completedCount} <span className="text-text-faint">/ {data.totalLearners}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="w-full bg-surface-2 h-2 rounded-full overflow-hidden border border-border-soft">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            m.completionRate > 75
                              ? 'bg-emerald-400'
                              : m.completionRate > 40
                              ? 'bg-func'
                              : 'bg-rose-400'
                          }`}
                          style={{ width: `${Math.max(m.completionRate, 3)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-text">
                      {m.completionRate}%
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {m.dropoffRate > 0 ? (
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
                            isCliff
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'text-text-faint'
                          }`}
                        >
                          -{m.dropoffRate}%
                        </span>
                      ) : (
                        <span className="text-text-faint">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Streak Distribution */}
      <div className="bg-surface border border-border rounded-xl p-5 sm:p-6">
        <h3 className="font-display text-base font-semibold text-text mb-3">Streak & Engagement Distribution</h3>
        <p className="text-xs text-text-dim mb-4">Current continuous learning streaks across the userbase.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="bg-surface-2 p-3.5 rounded-lg border border-border-soft">
            <p className="text-text-dim text-[11px]">0 – 3 Days</p>
            <p className="text-xl font-bold text-text mt-1">{data.streakDistribution.streak0to3}</p>
            <p className="text-[10px] text-text-faint mt-0.5">Learners</p>
          </div>
          <div className="bg-surface-2 p-3.5 rounded-lg border border-border-soft">
            <p className="text-text-dim text-[11px]">4 – 7 Days</p>
            <p className="text-xl font-bold text-text mt-1">{data.streakDistribution.streak4to7}</p>
            <p className="text-[10px] text-text-faint mt-0.5">Learners</p>
          </div>
          <div className="bg-surface-2 p-3.5 rounded-lg border border-border-soft">
            <p className="text-text-dim text-[11px]">8 – 14 Days</p>
            <p className="text-xl font-bold text-func mt-1">{data.streakDistribution.streak8to14}</p>
            <p className="text-[10px] text-text-faint mt-0.5">Consistent</p>
          </div>
          <div className="bg-surface-2 p-3.5 rounded-lg border border-border-soft">
            <p className="text-text-dim text-[11px]">15+ Days</p>
            <p className="text-xl font-bold text-func mt-1">{data.streakDistribution.streak15plus}</p>
            <p className="text-[10px] text-text-faint mt-0.5">Super learners</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
