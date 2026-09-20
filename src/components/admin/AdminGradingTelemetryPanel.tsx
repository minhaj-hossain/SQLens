'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, FlaskConical, RefreshCw, Trash2, TrendingUp } from 'lucide-react';
import {
  GradingEvent,
  clearGradingEvents,
  confusingTasks,
  gradingOverview,
  inconclusiveTasks,
  mismatchedColumns,
  readGradingEvents,
} from '@/lib/grading-telemetry';

function pct(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

/**
 * Local grading telemetry viewer (Phase 5).
 *
 * Reads the ring buffer `runAndGradeSubmission` writes to localStorage — no
 * backend, so this reflects the browser it is viewed from. `validatorPassed +
 * stateOk=false` means the learner got the COUNT right but the VALUES wrong
 * (content problem, not code). `inconclusive` = broken reference solution.
 */
export default function AdminGradingTelemetryPanel() {
  const [events, setEvents] = useState<GradingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setEvents(readGradingEvents());
    setLoading(false);
  }, []);

  useEffect(refresh, [refresh]);

  const overview = gradingOverview(events);
  const confusing = confusingTasks(events);
  const inconclusive = inconclusiveTasks(events);
  const columns = mismatchedColumns(events).slice(0, 8);

  const handleClear = () => {
    clearGradingEvents();
    refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-text">
            Grading Telemetry
          </h2>
          <p className="text-xs sm:text-sm text-text-dim mt-1">
            Local-only ring buffer ({events.length} submits) recording every Run &amp; Check
            with both grading layers&apos; verdicts. Never leaves this browser.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-text-dim hover:text-text text-xs font-mono transition cursor-pointer"
            title="Re-read the ring buffer"
          >
            <RefreshCw size={12} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={events.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-text-dim hover:text-rose-300 text-xs font-mono transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Clear the local buffer"
          >
            <Trash2 size={12} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {loading ? (
        <p className="font-mono text-xs text-text-faint">Reading local buffer…</p>
      ) : events.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-6 text-center">
          <FlaskConical size={20} className="mx-auto text-text-faint" />
          <p className="font-mono text-xs text-text-dim mt-2">
            No submits recorded in this browser yet.
          </p>
          <p className="font-mono text-[11px] text-text-faint mt-1">
            Run any lesson task&apos;s Run &amp; Check, then refresh — each submit records one event.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <StatTile label="Submits" value={String(overview.submits)} />
            <StatTile
              label="Pass rate"
              value={pct(overview.submits > 0 ? overview.passes / overview.submits : 0)}
              tone={overview.passes === overview.submits ? 'text-emerald-400' : 'text-text'}
            />
            <StatTile
              label="Right count, wrong values"
              value={pct(overview.valueMismatchRate)}
              tone={overview.valueMismatchRate > 0.2 ? 'text-amber-400' : 'text-text'}
            />
            <StatTile
              label="Inconclusive"
              value={String(overview.inconclusive)}
              tone={overview.inconclusive > 0 ? 'text-rose-400' : 'text-text'}
            />
          </div>
          <PanelBody
            events={events}
            confusing={confusing}
            inconclusive={inconclusive}
            columns={columns}
          />
        </>
      )}
    </motion.div>
  );
}

function PanelBody({
  events,
  confusing,
  inconclusive,
  columns,
}: {
  events: GradingEvent[];
  confusing: ReturnType<typeof confusingTasks>;
  inconclusive: ReturnType<typeof inconclusiveTasks>;
  columns: ReturnType<typeof mismatchedColumns>;
}) {
  return (
    <>
      {inconclusive.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
          <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-rose-300">
            <AlertTriangle size={12} />
            Broken reference solutions ({inconclusive.length})
          </p>
          <p className="text-[11px] text-text-dim mt-1 leading-snug">
            These tasks passed learners while their own solutionSql failed to run — an
            authoring bug each. Fix the solutionSql, never the grader.
          </p>
          <ul className="mt-3 space-y-1.5">
            {inconclusive.map((s) => (
              <li
                key={s.taskId}
                className="flex items-center justify-between gap-3 font-mono text-[11px]"
              >
                <span className="font-semibold text-text truncate">{s.taskId}</span>
                <span className="text-rose-300 shrink-0">
                  {s.inconclusive} inconclusive / {s.attempts} attempts
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
        <InsightCard
          title="Confusing tasks (right count, wrong values)"
          hint="Learners understood the shape but missed the values — re-word the instructions, never loosen the grader."
          rows={confusing.slice(0, 8).map((s) => ({
            key: s.taskId,
            label: s.taskId,
            value: `${s.valueMismatches}/${s.attempts} mismatches`,
            tone: 'text-amber-300',
          }))}
          empty="✓ No task is dominated by value mismatches."
        />
        <InsightCard
          title="Most-missed columns"
          hint="Where instruction wording actually matters — fix the tuple shown in these columns' tasks."
          rows={columns.map((c) => ({
            key: c.column,
            label: c.column,
            value: `${c.count}×`,
          }))}
          empty="✓ No value mismatches recorded yet."
        />
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 bg-surface-2 border-b border-border-soft font-mono text-[11px] uppercase tracking-wider text-text-dim flex items-center gap-1.5">
          <TrendingUp size={12} />
          Latest submits (newest first)
        </div>
        <ul className="max-h-[260px] overflow-y-auto autosuggest-scrollbar divide-y divide-border-soft/60">
          {events.slice(0, 40).map((e, i) => (
            <li
              key={`${e.t}-${i}`}
              className="px-4 py-1.5 flex items-center gap-3 font-mono text-[11px]"
            >
              <span
                className={`shrink-0 w-20 font-semibold ${
                  e.stage === 'pass'
                    ? 'text-emerald-400'
                    : e.stage === 'engine-error'
                      ? 'text-rose-400'
                      : e.stage === 'final-state'
                        ? 'text-amber-300'
                        : 'text-text-faint'
                }`}
              >
                {e.stage === 'pass'
                  ? 'pass'
                  : e.validatorPassed && e.stateOk === false
                    ? 'count✓ value✗'
                    : e.stage}
              </span>
              <span className="text-text font-semibold w-32 truncate">{e.taskId}</span>
              <span className="text-text-dim truncate flex-1">
                {(e.diffColumns ?? []).join(', ') || e.surface}
              </span>
              <span className="text-text-faint shrink-0">try {e.attempt}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-text-faint font-mono">
        {label}
      </div>
      <p className={`font-display text-lg font-bold mt-1 ${tone ?? 'text-text'}`}>{value}</p>
    </div>
  );
}

function InsightCard({
  title,
  hint,
  rows,
  empty,
}: {
  title: string;
  hint: string;
  rows: { key: string; label: string; value: string; tone?: string }[];
  empty: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <p className="font-mono text-[11px] uppercase tracking-wider text-text-dim">{title}</p>
      <p className="text-[11px] text-text-faint mt-1 leading-snug">{hint}</p>
      {rows.length === 0 ? (
        <p className="text-emerald-400/80 font-mono text-[11px] mt-3">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {rows.map((r) => (
            <li
              key={r.key}
              className="flex items-center justify-between gap-3 font-mono text-[11px]"
            >
              <span className={`font-semibold ${r.tone ?? 'text-text'}`}>{r.label || '(none)'}</span>
              <span className="text-text-dim shrink-0">{r.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
