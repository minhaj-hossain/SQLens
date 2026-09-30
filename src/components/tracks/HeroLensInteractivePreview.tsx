'use client';
/**
 * HeroLensInteractivePreview — Phase 3 (Task 3.1).
 * ─────────────────────────────────────────────────────────────────────────────
 * The landing page's "show, don't tell" moment: two tabs, one seed universe.
 *
 *   Prisma tab — `prisma.user.findUnique({ include: { posts: true } })` runs
 *                through the REAL translator + runner the curriculum grades
 *                with, so the lens shows the two statements that call actually
 *                sends (parent read + relation load) and the engine's timings.
 *   SQL tab    — the same rows hand-written as a JOIN, on the same engine.
 *
 * Both engines arrive via `import()` inside the run, so the homepage bundle
 * stays a demo shell until the island executes, and the prerender pass never
 * touches the executor (no effects on the server, no window at module scope).
 *
 * Also exports `ReturningLearnerCard` — the continuity strip that resumes the
 * track the learner actually started. It reads localStorage, so it renders
 * nothing on the server (and for first-time visitors) and appears after mount.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatExecutionTime } from '@/lib/format-execution-time';
import { loadUserState } from '@/lib/progress/storage';
import {
  HERO_PRISMA_SAMPLE,
  HERO_SQL_SAMPLE,
  buildContinuityEntry,
  buildPrismaSampleRun,
  buildSqlSampleRun,
  type ContinuityEntry,
  type HeroLensEngine,
  type HeroLensRun,
  type HeroLensStep,
} from '@/lib/homepage';
import { TRACK_IDS, TRACK_META } from '@/types/track';
import type { QueryExecutionResult } from '@/types/database';
import type { SqlExecutor } from '@/lib/sql-engine/executor';

type HeroTab = 'prisma' | 'sql';

interface HeroTabDef {
  id: HeroTab;
  label: string;
  caption: string;
  snippet: string;
}

const HERO_TABS: HeroTabDef[] = [
  {
    id: 'prisma',
    label: 'Prisma — findUnique + include',
    caption:
      'One client call. The engine sends the parent read, then loads the relation — the lens keeps both statements.',
    snippet: HERO_PRISMA_SAMPLE,
  },
  {
    id: 'sql',
    label: 'Raw SQL — JOIN',
    caption: 'The same rows by hand: one statement, executed by the same in-browser engine.',
    snippet: HERO_SQL_SAMPLE,
  },
];

const EMPTY_RUN: HeroLensRun = { steps: [], main: null, note: null };

interface HeroEngine {
  exec: SqlExecutor;
  prisma: typeof import('@/lib/prisma-playground');
}

/** One statement card in the lens — label, exact SQL, rows and real timing. */
function LensStepCard({ step, index }: { step: HeroLensStep; index: number }) {
  const time = formatExecutionTime(step.ms ?? undefined);
  return (
    <div
      className="lens-step-in rounded border border-border-soft bg-ink p-3"
      style={{ animationDelay: `${Math.min(index, 6) * 90}ms` }}
    >
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded border border-border bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text-dim">
          {step.role === 'relation' ? `relation · ${step.label}` : step.label}
        </span>
        <span className="font-mono text-[10.5px] text-text-faint">
          {step.error ? 'failed' : `${step.rows ?? 0} rows${time ? ` · ${time}` : ''}`}
        </span>
      </div>
      <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-text-dim">
        {step.sql}
      </pre>
      {step.error && <p className="mt-1.5 text-[11px] text-error-text">{step.error}</p>}
    </div>
  );
}

/** A compact peek at the call's own result: first columns, first rows, real counts. */
/* ── Returning-learner continuity ───────────────────────────────────────── */

/**
 * The returning-learner strip: one line per started track, using this user's
 * OWN storage key (guest or signed-in). It renders nothing until a first
 * effect reads that storage — so the server HTML never guesses, and
 * first-time visitors see no card at all. It re-reads on cross-tab writes and
 * on window focus, because the progress provider hydrates cloud state after
 * this card mounts.
 */
export function ReturningLearnerCard() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [entries, setEntries] = useState<ContinuityEntry[]>([]);

  const refresh = useCallback(() => {
    const found: ContinuityEntry[] = [];
    for (const track of TRACK_IDS) {
      const entry = buildContinuityEntry(track, loadUserState(userId, track));
      if (entry) found.push(entry);
    }
    setEntries(found);
  }, [userId]);

  useEffect(() => {
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  if (entries.length === 0) return null;

  return (
    <section aria-label="Continue where you left off" className="mt-8 flex flex-col gap-2 sm:mt-10">
      {entries.map((entry) => (
        <Link
          key={entry.track}
          href={entry.url}
          className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-4 py-3 transition hover:border-text-dim hover:bg-surface-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-dim"
        >
          <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text">
            <Icon name="play_circle" className="text-[16px] text-func" />
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-text-dim">
              {TRACK_META[entry.track].label}
            </span>
            <span>
              Resume{' '}
              <b className="font-semibold">
                {entry.moduleLabel}: {entry.moduleTitle}
              </b>
            </span>
            {entry.percent > 0 && (
              <span className="font-mono text-[11px] text-func">[{entry.percent}% Complete]</span>
            )}
          </span>
          <Icon
            name="arrow_forward"
            className="text-[16px] text-text-dim transition group-hover:translate-x-0.5 group-hover:text-text"
          />
        </Link>
      ))}
    </section>
  );
}

/* ── Lens panel ─────────────────────────────────────────────────────────── */

/**
 * The lens panel: statement count, one animated card per statement, and the
 * call's own result peek — kept out of the tab logic so the section reads as
 * two panes instead of one wall of JSX.
 */
function LensPanel({
  run,
  running,
  token,
  activeLabel,
}: {
  run: HeroLensRun;
  running: boolean;
  token: number;
  activeLabel: string;
}) {
  const totalTime = formatExecutionTime(run.steps.reduce((sum, step) => sum + (step.ms ?? 0), 0));
  return (
    <div role="tabpanel" aria-label={`${activeLabel} output`} className="flex min-w-0 flex-col">
      <div className="mb-2 flex items-center justify-between gap-2 font-mono text-[11px] text-text-faint">
        <span className="uppercase tracking-[0.18em]">Generated SQL Lens</span>
        <span>
          {run.steps.length > 0
            ? `${run.steps.length} statement${run.steps.length === 1 ? '' : 's'}${
                totalTime ? ` · ${totalTime}` : ''
              }`
            : running
              ? 'translating…'
              : ''}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {run.steps.map((step, index) => (
          <LensStepCard key={`${token}-${index}`} step={step} index={index} />
        ))}
        {run.note && (
          <p className="rounded border border-border-soft bg-ink p-3 text-xs leading-relaxed text-text-dim">
            {run.note}
          </p>
        )}
        {run.steps.length === 0 && !run.note && (
          <p className="rounded border border-dashed border-border p-3 text-xs leading-relaxed text-text-dim">
            {running
              ? 'Starting the in-browser engine and translating the first call…'
              : 'Press Re-run to translate the sample.'}
          </p>
        )}
        {run.main && <ResultPeek result={run.main} />}
      </div>
    </div>
  );
}

/* ── Hero demo island ────────────────────────────────────────────────────── */

/**
 * The hero demo — auto-runs the Prisma tab once on mount so the lens is alive
 * without a click, then re-runs on tab switches and on demand. One engine is
 * seeded once and shared by both tabs; a run counter discards stale async
 * results when the learner switches tabs mid-run.
 */
export default function HeroLensInteractivePreview() {
  const [tab, setTab] = useState<HeroTab>('prisma');
  const [run, setRun] = useState<HeroLensRun>(EMPTY_RUN);
  const [running, setRunning] = useState(false);
  const [runToken, setRunToken] = useState(0);
  const engineRef = useRef<HeroEngine | null>(null);
  const runIdRef = useRef(0);

  const ensureEngine = useCallback(async (): Promise<HeroEngine> => {
    const existing = engineRef.current;
    if (existing) return existing;
    const [executorModule, prismaModule] = await Promise.all([
      import('@/lib/sql-engine/executor'),
      import('@/lib/prisma-playground'),
    ]);
    const exec = new executorModule.SqlExecutor();
    exec.execute(prismaModule.prismaPlaygroundSeedSql());
    const engine: HeroEngine = { exec, prisma: prismaModule };
    engineRef.current = engine;
    return engine;
  }, []);

  const execute = useCallback(
    async (which: HeroTab) => {
      const runId = ++runIdRef.current;
      setRunning(true);
      try {
        const engine = await ensureEngine();
        const runner: HeroLensEngine = {
          execute: (sql: string) => engine.exec.execute(sql),
          runPrismaPlaygroundCode: engine.prisma.runPrismaPlaygroundCode,
        };
        const next = which === 'prisma' ? buildPrismaSampleRun(runner) : buildSqlSampleRun(runner);
        if (runIdRef.current !== runId) return;
        setRun(next);
        setRunToken((token) => token + 1);
      } catch (error) {
        if (runIdRef.current !== runId) return;
        setRun({
          ...EMPTY_RUN,
          note: error instanceof Error ? error.message : 'The in-browser engine could not start.',
        });
      } finally {
        if (runIdRef.current === runId) setRunning(false);
      }
    },
    [ensureEngine],
  );

  useEffect(() => {
    void execute(tab);
  }, [execute, tab]);

  const activeTab = HERO_TABS.find((def) => def.id === tab) ?? HERO_TABS[0];

  return (
    <section
      aria-label="Interactive SQL Lens preview"
      className="mt-8 rounded-xl border border-border bg-surface p-4 sm:mt-10 sm:p-5"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-text-dim">
          <Icon name="science" className="text-[14px] text-func" />
          Live Lens · the engine the lessons grade with
        </p>
        <button
          type="button"
          onClick={() => void execute(tab)}
          disabled={running}
          className="inline-flex items-center gap-1.5 rounded border border-border bg-surface-3 px-2.5 py-1 font-mono text-[11px] text-text-dim transition hover:border-text-dim hover:text-text disabled:opacity-60"
        >
          <Icon name="play_arrow" className="text-[13px]" />
          {running ? 'Running…' : 'Re-run'}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col">
          <div role="tablist" aria-label="Sample query" className="mb-3 flex flex-wrap gap-1.5">
            {HERO_TABS.map((def) => {
              const selected = def.id === tab;
              return (
                <button
                  key={def.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setTab(def.id)}
                  className={
                    selected
                      ? 'rounded border border-text-dim bg-surface-3 px-3 py-1.5 font-mono text-[11px] text-text'
                      : 'rounded border border-border bg-surface-base px-3 py-1.5 font-mono text-[11px] text-text-dim transition hover:border-text-dim hover:text-text'
                  }
                >
                  {def.label}
                </button>
              );
            })}
          </div>
          <pre className="min-h-[124px] flex-1 overflow-x-auto rounded border border-border-soft bg-ink p-3 font-mono text-[11.5px] leading-relaxed text-text">
            {activeTab.snippet}
          </pre>
          <p className="mt-2 text-xs leading-relaxed text-text-dim">{activeTab.caption}</p>
        </div>

        <LensPanel run={run} running={running} token={runToken} activeLabel={activeTab.label} />
      </div>
    </section>
  );
}

function ResultPeek({ result }: { result: QueryExecutionResult }) {
  const columns = result.columns.slice(0, 4);
  const rows = result.rows.slice(0, 3);
  const hiddenRows = result.rowCount - rows.length;
  const hiddenColumns = result.columns.length - columns.length;
  const cell = (value: unknown) => (value === null || value === undefined ? 'NULL' : String(value));
  return (
    <div className="mt-1 overflow-hidden rounded border border-border-soft bg-surface-2">
      <div className="flex items-center justify-between gap-2 border-b border-border-soft px-3 py-1.5 font-mono text-[10.5px] text-text-faint">
        <span>RESULT — {result.rowCount} rows</span>
        <span>{formatExecutionTime(result.executionTimeMs) ?? ''}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-[11px]">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="border-b border-border-soft px-3 py-1 text-left font-medium text-text-dim"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={column} className="px-3 py-1 text-text">
                    {cell(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(hiddenRows > 0 || hiddenColumns > 0) && (
        <p className="px-3 py-1.5 font-mono text-[10.5px] text-text-faint">
          {hiddenRows > 0 ? `+${hiddenRows} more rows` : ''}
          {hiddenRows > 0 && hiddenColumns > 0 ? ' · ' : ''}
          {hiddenColumns > 0 ? `+${hiddenColumns} more columns` : ''}
        </p>
      )}
    </div>
  );
}
