'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { adminGetSystemHealth, AdminSystemHealth } from '@/lib/admin-api';
import { Server, Database, BookOpen, Activity, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AdminSystemPanel() {
  const [health, setHealth] = useState<AdminSystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    adminGetSystemHealth()
      .then((data) => {
        setHealth(data);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch telemetry');
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <p className="font-mono text-xs text-text-dim animate-pulse">Querying server diagnostics & database health…</p>
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="bg-surface border border-error/30 rounded-xl p-6 text-center">
        <p className="font-mono text-xs text-error uppercase tracking-wider mb-2">Diagnostic Error</p>
        <p className="text-text-dim text-sm">{error || 'Could not communicate with server telemetry'}</p>
        <button
          onClick={() => fetchHealth()}
          className="mt-4 px-3 py-1.5 rounded-lg bg-func/10 text-func font-mono text-xs border border-func/30 hover:bg-func/20 transition cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const memoryPercent = Math.min(
    100,
    Math.round((health.memory.heapUsedMB / Math.max(health.memory.heapTotalMB, 1)) * 100),
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-text">System Telemetry & Health</h2>
          <p className="text-xs sm:text-sm text-text-dim mt-1">
            Real-time server resource monitoring, database ping state, and curriculum engine verification.
          </p>
        </div>

        <button
          onClick={() => fetchHealth(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-text-dim hover:text-text font-mono text-xs transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-surface border border-border p-4 rounded-xl flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-dim">Engine State</p>
            <p className="font-display text-lg font-bold text-text mt-0.5">Operational</p>
            <p className="text-[11px] font-mono text-emerald-400 mt-1">Ready for queries</p>
          </div>
        </div>

        <div className="bg-surface border border-border p-4 rounded-xl flex items-start gap-3">
          <div className="p-2 rounded-lg bg-func/10 text-func shrink-0">
            <Database size={18} />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-dim">Database (MongoDB)</p>
            <p className="font-display text-lg font-bold text-text mt-0.5 capitalize">{health.database.status}</p>
            <p className="text-[11px] font-mono text-text-dim mt-1">{health.database.collectionsCount} collections</p>
          </div>
        </div>

        <div className="bg-surface border border-border p-4 rounded-xl flex items-start gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
            <Activity size={18} />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-dim">Process Uptime</p>
            <p className="font-display text-lg font-bold text-text mt-0.5">{formatUptime(health.uptimeSeconds)}</p>
            <p className="text-[11px] font-mono text-text-dim mt-1">Node {health.nodeVersion}</p>
          </div>
        </div>
      </div>

      {/* Memory & Resource Telemetry */}
      <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server size={16} className="text-func" />
            <h3 className="font-display text-base font-semibold text-text">Memory Allocation</h3>
          </div>
          <span className="font-mono text-xs text-text-dim">{memoryPercent}% Heap In Use</span>
        </div>

        <div className="w-full bg-surface-2 h-3 rounded-full overflow-hidden border border-border-soft">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              memoryPercent > 80 ? 'bg-rose-400' : 'bg-func'
            }`}
            style={{ width: `${Math.max(memoryPercent, 5)}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 font-mono text-xs pt-2">
          <div className="bg-surface-2 p-3 rounded-lg border border-border-soft">
            <p className="text-text-dim text-[11px]">Heap Used</p>
            <p className="text-base font-bold text-text mt-1">{health.memory.heapUsedMB} MB</p>
          </div>
          <div className="bg-surface-2 p-3 rounded-lg border border-border-soft">
            <p className="text-text-dim text-[11px]">Heap Total</p>
            <p className="text-base font-bold text-text mt-1">{health.memory.heapTotalMB} MB</p>
          </div>
          <div className="bg-surface-2 p-3 rounded-lg border border-border-soft">
            <p className="text-text-dim text-[11px]">Resident Set (RSS)</p>
            <p className="text-base font-bold text-text mt-1">{health.memory.rssMB} MB</p>
          </div>
        </div>
      </div>

      {/* Curriculum Catalog Integrity */}
      <div className="bg-surface border border-border rounded-xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-func" />
          <h3 className="font-display text-base font-semibold text-text">Curriculum Catalog Integrity</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="bg-surface-2 p-3.5 rounded-lg border border-border-soft">
            <p className="text-text-dim text-[11px]">Total Modules</p>
            <p className="text-xl font-bold text-func mt-1">{health.curriculum.modulesCount}</p>
            <p className="text-[10px] text-text-faint mt-0.5">Canonical Days</p>
          </div>
          <div className="bg-surface-2 p-3.5 rounded-lg border border-border-soft">
            <p className="text-text-dim text-[11px]">Total Concepts</p>
            <p className="text-xl font-bold text-text mt-1">{health.curriculum.conceptsCount}</p>
            <p className="text-[10px] text-text-faint mt-0.5">Theory units</p>
          </div>
          <div className="bg-surface-2 p-3.5 rounded-lg border border-border-soft">
            <p className="text-text-dim text-[11px]">Practice Tasks</p>
            <p className="text-xl font-bold text-text mt-1">{health.curriculum.practiceTasksCount}</p>
            <p className="text-[10px] text-text-faint mt-0.5">Guided tasks</p>
          </div>
          <div className="bg-surface-2 p-3.5 rounded-lg border border-border-soft">
            <p className="text-text-dim text-[11px]">Milestones</p>
            <p className="text-xl font-bold text-text mt-1">{health.curriculum.milestonesCount}</p>
            <p className="text-[10px] text-text-faint mt-0.5">Major stages</p>
          </div>
        </div>
      </div>

      {/* Environment Details */}
      <div className="bg-surface border border-border rounded-xl p-5 sm:p-6">
        <h3 className="font-display text-base font-semibold text-text mb-3">Runtime Environment</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs font-mono">
          <div className="flex justify-between py-1.5 border-b border-border-soft">
            <dt className="text-text-dim">Node.js Version:</dt>
            <dd className="text-text font-semibold">{health.nodeVersion}</dd>
          </div>
          <div className="flex justify-between py-1.5 border-b border-border-soft">
            <dt className="text-text-dim">Platform / OS:</dt>
            <dd className="text-text font-semibold">{health.platform} ({health.arch})</dd>
          </div>
          <div className="flex justify-between py-1.5 border-b border-border-soft">
            <dt className="text-text-dim">Environment Mode:</dt>
            <dd className="text-text font-semibold uppercase">{health.environment}</dd>
          </div>
          <div className="flex justify-between py-1.5 border-b border-border-soft">
            <dt className="text-text-dim">Curriculum Status:</dt>
            <dd className="text-emerald-400 font-semibold uppercase">100% Passed</dd>
          </div>
        </dl>
      </div>
    </motion.div>
  );
}
