'use client';

import React, { useState } from 'react';
import { GitMerge, Layers, ArrowDown, CheckCircle2, ShieldAlert, Repeat, Building2, CornerDownRight, RotateCcw } from 'lucide-react';

/**
 * Milestone 4 extends this visualizer beyond plain CTE decomposition:
 *   - `recursive` (Day 41) — anchor member → lap → termination trace, the running
 *     result set growing one row per pass until a pass returns nothing.
 *   - `hierarchy` (Day 42) — the same recursion walking a manager tree: down from
 *     a root for a subtree, up from a leaf for a breadcrumb.
 * `decomposition` is the original Days 21–22 view and stays the default, so every
 * pre-M4 concept renders exactly as before.
 */
export type CtePipelineVariant = 'decomposition' | 'recursive' | 'hierarchy';

export const CtePipelineVisualizer: React.FC<{ variant?: CtePipelineVariant }> = ({
  variant = 'decomposition',
}) => {
  if (variant === 'recursive') return <RecursiveSeriesTrace />;
  if (variant === 'hierarchy') return <HierarchyWalkTrace />;
  return <DecompositionView />;
};

const Shell: React.FC<{ kicker: string; title: string; children: React.ReactNode }> = ({
  kicker,
  title,
  children,
}) => (
  <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-5 text-text my-4 sm:my-5 shadow-sm w-full min-w-0">
    <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b border-border-soft min-w-0">
      <div className="min-w-0">
        <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-wider text-func font-semibold">
          {kicker}
        </span>
        <h3 className="font-display font-semibold text-[15px] sm:text-[17px] text-text mt-0.5">{title}</h3>
      </div>
    </div>
    {children}
  </div>
);

/* ---------------------------------------------------------------------------
 * Day 41 — WITH RECURSIVE: anchor, then one lap at a time
 * ------------------------------------------------------------------------- */
const RecursiveSeriesTrace: React.FC = () => {
  const [lap, setLap] = useState(0);
  // The anchor seeds n = 1; each lap appends the next number until we reach 5.
  const produced: number[] = [];
  for (let n = 1; n <= Math.min(lap + 1, 5); n++) produced.push(n);
  const stopped = lap >= 4;

  return (
    <Shell kicker="Mental Model · Recursion & Iteration" title="WITH RECURSIVE — Anchor, Lap, Termination">
      <p className="text-xs text-text-dim mt-3 leading-relaxed font-sans">
        A recursive CTE runs in <strong className="text-text">laps</strong>. The{' '}
        <strong className="text-text">anchor</strong> runs once and seeds the result. Each{' '}
        <strong className="text-text">lap</strong> feeds the previous lap&apos;s rows back into the query
        body and appends whatever comes out. The moment a lap produces{' '}
        <strong className="text-text">zero rows</strong>, recursion stops. It is one rule applied
        repeatedly, not hidden multi-step programming.
      </p>

      <div className="mt-4 font-mono text-xs space-y-0">
        <div className="p-3 rounded-lg bg-surface-2 border border-func/40">
          <div className="flex items-center gap-1.5 text-func font-bold pb-1 mb-1.5 border-b border-border-soft">
            <Layers className="w-3.5 h-3.5" />
            <span>Anchor member — runs exactly once</span>
          </div>
          <p className="text-[11.5px] text-text-dim font-sans">
            <code className="text-text">SELECT 1 AS n</code> produces the first row. This is the seed the
            laps start from — without it the CTE returns nothing at all.
          </p>
        </div>

        {produced.map((n, idx) => (
          <div key={n}>
            <div className="flex justify-center py-1">
              <ArrowDown className="w-4 h-4 text-func" />
            </div>
            <div
              className={`p-3 rounded-lg border ${
                idx === produced.length - 1 && idx > 0 ? 'bg-func/10 border-func' : 'bg-surface-2 border-border'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-func font-bold pb-1 mb-1.5 border-b border-border-soft">
                <span className="flex items-center gap-1.5 min-w-0">
                  <Repeat className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    Lap {idx} — input n = {idx}
                  </span>
                </span>
                <span className="text-[10px] text-text-faint font-normal shrink-0">
                  {idx === 0 ? 'seeded by anchor' : 'one new row'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11.5px] font-sans">
                <code className="bg-func/15 text-text px-1.5 rounded">
                  SELECT n + 1 AS n FROM series WHERE n = {idx}
                </code>
                <span className="text-text-faint">→</span>
                <code className="text-success-text font-bold">n = {n}</code>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-center py-1">
          <ArrowDown className={`w-4 h-4 ${stopped ? 'text-warning-text' : 'text-text-faint'}`} />
        </div>

        <div
          className={`p-3 rounded-lg border ${
            stopped ? 'bg-warning-bg/30 border-warning-border' : 'bg-surface-2 border-border border-dashed'
          }`}
        >
          <div
            className={`flex items-center gap-1.5 font-bold pb-1 mb-1.5 border-b border-border-soft ${
              stopped ? 'text-warning-text' : 'text-text-faint'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>
              {stopped
                ? 'Termination check — last lap returned 0 rows → STOP'
                : 'Termination check — still producing rows, so keep going'}
            </span>
          </div>
          <p className="text-[11.5px] text-text-dim font-sans">
            {stopped
              ? 'The lap after n = 5 filtered on WHERE n = 6, matched nothing, and returned an empty set. That empty set is the loop guard — the engine stops instead of running forever.'
              : 'Recursion continues while each lap still returns rows. Every recursive CTE must be able to reach an empty lap, or it never stops.'}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
        <div className="p-3 rounded-lg bg-surface-2 border border-border">
          <div className="text-[10.5px] uppercase tracking-wider text-text-faint">Running result set</div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {produced.map((n) => (
              <span key={n} className="px-2 py-0.5 rounded bg-func/15 border border-func/40 text-text">
                {n}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-text-dim font-sans mt-2">
            {produced.length} row{produced.length === 1 ? '' : 's'} so far —{' '}
            <code className="text-text">UNION ALL</code> appends each lap instead of overwriting it.
          </p>
        </div>
        <div className="p-3 rounded-lg bg-error-bg/20 border border-error-border">
          <div className="text-[10.5px] uppercase tracking-wider text-error-text font-semibold">
            The classic runaway
          </div>
          <p className="text-[11.5px] text-text-dim font-sans mt-2">
            Drop the predicate that advances <code className="text-text">n</code> and every lap returns 1
            again: <code className="text-text">1, 1, 1, 1…</code> forever. The guard is that predicate, not
            the word <code className="text-text">RECURSIVE</code>.
          </p>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-xl bg-surface-2/60 border border-border flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => setLap((p) => Math.min(5, p + 1))}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-func text-ink font-semibold text-xs transition hover:brightness-110 cursor-pointer"
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>{lap === 0 ? 'Run first lap' : 'Run next lap'}</span>
        </button>
        <button
          onClick={() => setLap(0)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-3 hover:bg-surface border border-border text-xs font-mono text-text cursor-pointer transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to anchor</span>
        </button>
        <span className="text-xs font-mono text-text-dim">
          {stopped ? 'Loop exited — 5 rows total' : `Laps run: ${lap}`}
        </span>
      </div>

    </Shell>
  );
};


/* ---------------------------------------------------------------------------
 * Day 42 — the same recursion walking a manager tree
 * ------------------------------------------------------------------------- */
const HIERARCHY = [
  { id: 1, name: 'Ayesha Rahman', manager: null as number | null, depth: 0 },
  { id: 2, name: 'Karim Chowdhury', manager: 1, depth: 1 },
  { id: 3, name: 'Nusrat Jahan', manager: 2, depth: 2 },
  { id: 4, name: 'Tanvir Ahmed', manager: null, depth: 0 },
];

const HierarchyWalkTrace: React.FC = () => {
  const [direction, setDirection] = useState<'down' | 'up'>('down');
  const leaf = 3;
  const root = 1;

  const childChain = (start: number): number[] => {
    const out = [start];
    let cursor = start;
    for (;;) {
      const kid = HIERARCHY.find((h) => h.manager === cursor);
      if (!kid) break;
      out.push(kid.id);
      cursor = kid.id;
    }
    return out;
  };
  const upwardChain = (start: number): number[] => {
    const out = [start];
    let cursor: (typeof HIERARCHY)[number] | undefined = HIERARCHY.find((h) => h.id === start);
    while (cursor && cursor.manager !== null) {
      out.push(cursor.manager);
      const parentId: number = cursor.manager;
      cursor = HIERARCHY.find((h) => h.id === parentId);
    }
    return out;
  };

  const chain = direction === 'down' ? childChain(root) : upwardChain(leaf);
  const chainNames = chain.map((id) => HIERARCHY.find((h) => h.id === id)!.name);

  return (
    <Shell
      kicker="Mental Model · Hierarchy Recursion"
      title="Walking a Tree Down (subtree) and Back Up (breadcrumb)"
    >
      <p className="text-xs text-text-dim mt-3 leading-relaxed font-sans">
        A manager tree is a table where one row points at another row of the same table (
        <code className="text-func font-bold">manager_id → employees.employee_id</code>). There is no
        &ldquo;depth&rdquo; column — the depth <em>is</em> how many laps of recursion you needed to arrive. The
        same CTE answers both questions; only the anchor row and the join direction change.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border text-xs font-mono w-fit">
        <button
          onClick={() => setDirection('down')}
          className={`px-3 py-1 rounded text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            direction === 'down' ? 'bg-func text-ink' : 'text-text-dim hover:text-text hover:bg-surface-3'
          }`}
        >
          <CornerDownRight className="w-3 h-3" />
          Walk DOWN (subtree)
        </button>
        <button
          onClick={() => setDirection('up')}
          className={`px-3 py-1 rounded text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            direction === 'up' ? 'bg-func text-ink' : 'text-text-dim hover:text-text hover:bg-surface-3'
          }`}
        >
          <ArrowDown className="w-3 h-3 rotate-180" />
          Walk UP (breadcrumb)
        </button>
      </div>

      <div className="mt-4 space-y-2 font-mono text-xs">
        {HIERARCHY.map((node) => {
          const lapIndex = chain.indexOf(node.id);
          const onPath = lapIndex !== -1;
          return (
            <div
              key={node.id}
              style={{ marginLeft: `${node.depth * 16}px` }}
              className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${
                onPath ? 'bg-func/10 border-func' : 'bg-surface-2 border-border opacity-60'
              }`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <Building2 className={`w-3.5 h-3.5 shrink-0 ${onPath ? 'text-func' : 'text-text-faint'}`} />
                <span className="text-text truncate">{node.name}</span>
                <span className="text-text-faint text-[10.5px]">employee_id {node.id}</span>
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="text-[10.5px] text-text-faint">
                  manager_id {node.manager === null ? 'NULL' : node.manager}
                </span>
                {onPath && (
                  <span className="px-1.5 py-0.5 rounded bg-func text-ink text-[10px] font-bold">
                    lap {lapIndex}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
        <div className="p-3 rounded-lg bg-surface-2 border border-border">
          <div className="text-[10.5px] uppercase tracking-wider text-text-faint">
            Anchor + join direction
          </div>
          <p className="text-[11.5px] text-text-dim font-sans mt-2">
            {direction === 'down' ? (
              <>
                Anchor = one row (<code className="text-text">WHERE employee_id = {root}</code>), then each lap
                joins <code className="text-text">e.manager_id = r.employee_id</code> to append the next layer
                of direct reports.
              </>
            ) : (
              <>
                Anchor = the leaf (<code className="text-text">WHERE employee_id = {leaf}</code>), then each lap
                joins <code className="text-text">e.employee_id = r.manager_id</code> to climb to the manager
                above.
              </>
            )}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-success-bg/25 border border-success-border">
          <div className="text-[10.5px] uppercase tracking-wider text-success-text font-semibold">
            Chain returned
          </div>
          <p className="text-[11.5px] text-text-dim font-sans mt-2">{chainNames.join(' → ')}</p>
          <p className="text-[11px] text-text-faint font-sans mt-1.5">
            {chain.length} lap{chain.length === 1 ? '' : 's'} to reach the end of the branch. The stop is
            structural: a row whose <code className="text-text">manager_id</code> is NULL has no manager, so
            the climb simply finds nothing and the loop exits.
          </p>
        </div>
      </div>
    </Shell>
  );
};


const DecompositionView: React.FC = () => {
  const [view, setView] = useState<'CTE' | 'NESTED'>('CTE');

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-5 text-text my-4 sm:my-5 shadow-sm w-full min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b border-border-soft min-w-0">
        <div className="min-w-0">
          <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-wider text-func font-semibold">
            Mental Model · Query Decomposition & Readability
          </span>
          <h3 className="font-display font-semibold text-[15px] sm:text-[17px] text-text mt-0.5">
            Modular CTE Pipelines vs Nested Bracket Inception
          </h3>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border text-xs font-mono">
          <button
            onClick={() => setView('CTE')}
            className={`px-3 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
              view === 'CTE'
                ? 'bg-func text-ink'
                : 'text-text-dim hover:text-text hover:bg-surface-3'
            }`}
          >
            Clean CTE Pipeline (WITH)
          </button>
          <button
            onClick={() => setView('NESTED')}
            className={`px-3 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
              view === 'NESTED'
                ? 'bg-func text-ink'
                : 'text-text-dim hover:text-text hover:bg-surface-3'
            }`}
          >
            Messy Nested Subquery
          </button>
        </div>
      </div>

      <p className="text-xs text-text-dim mt-3 leading-relaxed font-sans">
        When queries become complex, nesting brackets inside brackets creates cognitive overload. Common Table Expressions (<code className="text-func font-bold">WITH ... AS</code>) let you read and debug queries sequentially from top to bottom:
      </p>

      {/* Visual Content */}
      <div className="mt-4 font-mono text-xs">
        {view === 'CTE' ? (
          <div className="space-y-2.5">
            {/* CTE Step 1 */}
            <div className="p-3 rounded-lg bg-surface-2 border border-border">
              <div className="flex items-center justify-between text-func font-bold pb-1 mb-1 border-b border-border-soft">
                <span>1. WITH CustomerSpending AS (...)</span>
                <span className="text-[10px] text-text-faint font-normal">Step 1: Aggregate totals</span>
              </div>
              <p className="text-[11.5px] text-text-dim font-sans">
                Calculates total revenue per customer. Encapsulates grouping logic into a clean named dataset.
              </p>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="w-4 h-4 text-func" />
            </div>

            {/* CTE Step 2 */}
            <div className="p-3 rounded-lg bg-surface-2 border border-border">
              <div className="flex items-center justify-between text-func font-bold pb-1 mb-1 border-b border-border-soft">
                <span>2. TopTierCustomers AS (...)</span>
                <span className="text-[10px] text-text-faint font-normal">Step 2: Filter VIPs</span>
              </div>
              <p className="text-[11.5px] text-text-dim font-sans">
                Filters <code className="text-text">CustomerSpending</code> for clients with &gt; $1,000 total spend.
              </p>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="w-4 h-4 text-func" />
            </div>

            {/* Final SELECT */}
            <div className="p-3 rounded-lg bg-success-bg/30 border border-success-border">
              <div className="flex items-center gap-1.5 text-success-text font-bold pb-1 mb-1 border-b border-border-soft">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>3. SELECT * FROM TopTierCustomers JOIN ...</span>
              </div>
              <p className="text-[11.5px] text-text-dim font-sans">
                The final query reads like plain English. Clean, maintainable, and easily debugged by teammates.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-error-bg/20 border border-error-border space-y-2">
            <div className="flex items-center gap-1.5 text-error-text font-bold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>Bracket Inception (The Unmaintainable Anti-Pattern)</span>
            </div>
            <div className="p-3 rounded bg-surface border border-border text-[11px] text-text-dim leading-relaxed">
              SELECT * FROM (SELECT * FROM (SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id) WHERE total &gt; 1000) AS sub2 JOIN users ON ...
            </div>
            <p className="text-[11.5px] text-text-dim font-sans">
              Notice how this must be read from the inside out. Any syntax error requires counting parenthesis pairs, making maintenance a nightmare.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CtePipelineVisualizer;
