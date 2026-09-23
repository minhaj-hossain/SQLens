'use client';

import React, { useState } from 'react';
import { Gauge, Zap, Search, ShieldAlert, CheckCircle2 } from 'lucide-react';

export type BTreeIndexVariant = 'basics' | 'composite' | 'covering';

const BasicIndexView: React.FC = () => {
  const [mode, setMode] = useState<'SCAN' | 'BTREE'>('BTREE');

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-5 text-text my-4 sm:my-5 shadow-sm w-full min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b border-border-soft min-w-0">
        <div className="min-w-0">
          <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-wider text-func font-semibold">
            Mental Model · Query Optimization & Database Internals
          </span>
          <h3 className="font-display font-semibold text-[15px] sm:text-[17px] text-text mt-0.5">
            B-Tree Index Seek vs Sequential Table Scan
          </h3>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border text-xs font-mono">
          <button
            onClick={() => setMode('SCAN')}
            className={`px-3 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
              mode === 'SCAN'
                ? 'bg-func text-ink'
                : 'text-text-dim hover:text-text hover:bg-surface-3'
            }`}
          >
            Seq Scan (No Index)
          </button>
          <button
            onClick={() => setMode('BTREE')}
            className={`px-3 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
              mode === 'BTREE'
                ? 'bg-func text-ink'
                : 'text-text-dim hover:text-text hover:bg-surface-3'
            }`}
          >
            B-Tree Index Seek
          </button>
        </div>
      </div>

      <p className="text-xs text-text-dim mt-3 leading-relaxed">
        Looking up <code className="text-func font-bold">WHERE user_id = 45290</code> across a 1,000,000-row table:
      </p>

      {/* Visual Comparison Stage */}
      <div className="mt-4 p-4 rounded-xl bg-surface-2 border border-border">
        {mode === 'SCAN' ? (
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-border-soft">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-error-text">
                <ShieldAlert className="w-4 h-4" />
                <span>Full Table Scan (Brute-Force O(N))</span>
              </div>
              <span className="font-mono text-[11px] text-error-text bg-error-bg border border-error-border px-2 py-0.5 rounded">
                Cost: ~1,000,000 row inspections (124 ms)
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto py-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-12 h-14 rounded border flex flex-col items-center justify-center font-mono text-[10px] shrink-0 ${
                    i === 8
                      ? 'bg-func/20 border-func text-text font-bold'
                      : 'bg-surface border-border-soft text-text-faint opacity-50'
                  }`}
                >
                  <span>Block</span>
                  <span className="text-text-dim">#{i * 80}</span>
                </div>
              ))}
              <span className="text-text-faint text-xs font-mono px-2">... 999,900 more blocks</span>
            </div>
            <p className="text-xs text-text-dim mt-2 font-mono">
              The engine reads every physical disk page one-by-one from block 0 to the end, discarding unmatching rows.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-border-soft">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-success-text">
                <Zap className="w-4 h-4 text-func" />
                <span>B-Tree Tree Traversal (Binary Branching O(log N))</span>
              </div>
              <span className="font-mono text-[11px] text-success-text bg-success-bg border border-success-border px-2 py-0.5 rounded">
                Cost: 3 block reads (0.4 ms)
              </span>
            </div>

            {/* B-Tree Graph Representation */}
            <div className="flex flex-col items-center space-y-3 py-2 font-mono text-xs">
              {/* Root Node */}
              <div className="px-4 py-1.5 rounded-lg bg-surface-3 border border-func text-text font-bold shadow-[0_0_8px_var(--accent-dim)]">
                Root Node [Keys: 25000 | 50000 | 75000]
              </div>
              <div className="text-func text-[11px]">↓ Jump to child [25000 - 50000]</div>

              {/* Intermediate Branch Node */}
              <div className="px-4 py-1.5 rounded-lg bg-surface-3 border border-func/60 text-text">
                Branch Node [Keys: 35000 | 45000 | 48000]
              </div>
              <div className="text-func text-[11px]">↓ Jump to Leaf [45000 - 48000]</div>

              {/* Target Leaf Pointer */}
              <div className="px-4 py-1.5 rounded-lg bg-success-bg border border-success-border text-success-text font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Leaf Page #412 → Row user_id = 45290 Found Instantly!</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------------------
 * Day 52 — composite keys (the leading-column rule) and covering indexes
 * ------------------------------------------------------------------------- */
const COMPOSITE_INDEX = '(status, order_date)';

const CompositeSeekView: React.FC = () => {
  const queries = [
    { sql: "WHERE status = 'shipped' AND order_date = '2026-01-05'", verdict: 'full seek', tone: 'good' as const, why: 'Both keys bound: descend on status, then jump straight to the date inside that bucket.' },
    { sql: "WHERE status = 'shipped'", verdict: 'partial seek', tone: 'good' as const, why: 'A prefix of the key is bound — still a seek, just a range of dates instead of one.' },
    { sql: "WHERE order_date = '2026-01-05'", verdict: 'cannot seek', tone: 'bad' as const, why: 'The leading key (status) is unbound. The tree is ordered by status first, so dates are scattered across every status bucket — full scan.' },
    { sql: "WHERE status = 'shipped' ORDER BY order_date", verdict: 'seek + free sort', tone: 'great' as const, why: 'Within one status the entries are already in date order, so the ORDER BY costs nothing extra.' },
  ];
  const toneClass = {
    great: 'bg-success-bg/25 border-success-border text-success-text',
    good: 'bg-func/10 border-func/40 text-func',
    bad: 'bg-error-bg/20 border-error-border text-error-text',
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-5 text-text my-4 sm:my-5 shadow-sm w-full min-w-0">
      <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-wider text-func font-semibold">
        Mental Model · Composite Index Key Order
      </span>
      <h3 className="font-display font-semibold text-[15px] sm:text-[17px] text-text mt-0.5">
        A Composite Index Is Sorted by Its First Column First
      </h3>
      <p className="text-xs text-text-dim mt-3 leading-relaxed font-sans">
        A multi-column index is still one ordered structure — it is sorted by the leading column, and only
        then by the next. So the usable part of the key is always a{' '}
        <strong className="text-text">left-to-right prefix</strong>. Skip the first column and the ordering
        no longer helps you: think of a phone book sorted by (surname, first name) — searching by first name
        alone means reading the whole book.
      </p>

      <div className="mt-3 p-3 rounded-lg bg-surface-2 border border-border font-mono text-[11.5px]">
        <div className="text-[10.5px] uppercase tracking-wider text-text-faint mb-2">The index</div>
        <code className="text-text">CREATE INDEX idx_orders_status_date ON orders {COMPOSITE_INDEX};</code>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10.5px]">
          <span className="px-2 py-0.5 rounded bg-func text-ink font-bold">key 1 · status</span>
          <span className="text-text-faint">then</span>
          <span className="px-2 py-0.5 rounded bg-func/20 border border-func/40 text-text font-bold">
            key 2 · order_date
          </span>
          <span className="text-text-faint ml-1">sorted left to right, in that order</span>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {queries.map((q) => (
          <div
            key={q.sql}
            className={`p-2.5 rounded-lg border flex flex-col sm:flex-row sm:items-center gap-2 justify-between ${toneClass[q.tone]}`}
          >
            <code className="text-[11.5px] text-text break-all">{q.sql}</code>
            <span className="text-[10.5px] font-mono uppercase tracking-wider shrink-0 px-2 py-0.5 rounded bg-surface border border-border-soft">
              {q.verdict}
            </span>
            <p className="text-[11px] text-text-dim font-sans sm:max-w-[45%]">{q.why}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 p-3 rounded-lg bg-warning-bg/25 border border-warning-border">
        <div className="text-[10.5px] uppercase tracking-wider text-warning-text font-semibold">
          The design rule
        </div>
        <p className="text-[11.5px] text-text-dim font-sans mt-1.5">
          Order the keys by <strong className="text-text">equality first, then range, then sort</strong> — and
          keep the column your queries filter on most often at the front. One composite index can serve
          several queries, but only those that use its prefix.
        </p>
      </div>
    </div>
  );
};

const CoveringIndexView: React.FC = () => {
  const [covering, setCovering] = useState(true);
  const rowsFetched = covering ? 0 : 1400;

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-5 text-text my-4 sm:my-5 shadow-sm w-full min-w-0">
      <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-wider text-func font-semibold">
        Mental Model · Covering Index (Index-Only Access)
      </span>
      <h3 className="font-display font-semibold text-[15px] sm:text-[17px] text-text mt-0.5">
        When the Index Already Holds Everything the Query Needs
      </h3>
      <p className="text-xs text-text-dim mt-3 leading-relaxed font-sans">
        An index normally gets you to the right rows and then hands you a pointer — you still have to visit
        the table itself for the columns you selected. If every column the query touches is{' '}
        <strong className="text-text">already inside the index</strong>, that second trip disappears. The
        index <em>covers</em> the query, and an ordinary seek becomes an index-only read.
      </p>

      <div className="mt-3 p-3 rounded-lg bg-surface-2 border border-border font-mono text-[11.5px] space-y-1">
        <div className="text-[10.5px] uppercase tracking-wider text-text-faint">Index + query</div>
        <code className="text-text block">
          CREATE INDEX idx_orders_status_date ON orders (status, order_date);
        </code>
        <code className="text-text block">
          SELECT status, order_date FROM orders WHERE status = &apos;shipped&apos;;
        </code>
        <p className="text-[11px] text-text-dim font-sans pt-1">
          Both selected columns are inside the index key, so no table lookup is needed.
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border w-fit font-mono">
        <button
          onClick={() => setCovering(true)}
          className={`px-3 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
            covering ? 'bg-func text-ink' : 'text-text-dim hover:text-text hover:bg-surface-3'
          }`}
        >
          Covered (status, order_date)
        </button>
        <button
          onClick={() => setCovering(false)}
          className={`px-3 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
            !covering ? 'bg-func text-ink' : 'text-text-dim hover:text-text hover:bg-surface-3'
          }`}
        >
          Not covered (+ customer_id)
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
        <div className={`p-3 rounded-lg border ${covering ? 'bg-success-bg/25 border-success-border' : 'bg-error-bg/20 border-error-border'}`}>
          <div className={`text-[10.5px] uppercase tracking-wider font-semibold ${covering ? 'text-success-text' : 'text-error-text'}`}>
            Trip 1 — the index
          </div>
          <div className="mt-2 space-y-1 text-[11.5px] text-text">
            <div>entries read: <span className="font-bold">1400</span> (the shipped bucket)</div>
            <div>tree depth: <span className="font-bold">3 levels</span></div>
            <div>
              status:{' '}
              <span className={covering ? 'text-success-text font-bold' : 'text-warning-text font-bold'}>
                {covering ? 'answer complete' : 'needs columns from the table'}
              </span>
            </div>
          </div>
        </div>
        <div className={`p-3 rounded-lg border ${covering ? 'bg-success-bg/25 border-success-border' : 'bg-warning-bg/25 border-warning-border'}`}>
          <div className={`text-[10.5px] uppercase tracking-wider font-semibold ${covering ? 'text-success-text' : 'text-warning-text'}`}>
            Trip 2 — the table (heap)
          </div>
          <div className="mt-2 space-y-1 text-[11.5px] text-text">
            {covering ? (
              <>
                <div className="font-bold text-success-text">row lookups: 0</div>
                <div className="text-text-dim font-sans text-[11px]">
                  Skipped entirely — the plan shows <code className="text-text">Using index</code> with no
                  table step at all.
                </div>
              </>
            ) : (
              <>
                <div className="font-bold text-warning-text">row lookups: {rowsFetched}</div>
                <div className="text-text-dim font-sans text-[11px]">
                  <code className="text-text">customer_id</code> is not in the index, so each matching entry
                  forces a visit to the table page that holds that row.
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className={`mt-3 p-3 rounded-lg border font-mono text-[11.5px] font-sans ${
          covering ? 'bg-success-bg/20 border-success-border' : 'bg-warning-bg/20 border-warning-border'
        }`}
      >
        <span className={covering ? 'text-success-text font-semibold' : 'text-warning-text font-semibold'}>
          {covering ? 'Index-only read: 1400 entries, 0 table visits.' : '1400 entries + 1400 table visits.'}
        </span>{' '}
        <span className="text-text-dim">
          {covering
            ? 'The index key contains every column the query asked for, so the table is never opened.'
            : 'The moment one selected column lives outside the index, the seek is only half the work.'}
        </span>
      </div>
    </div>
  );
};

export const BTreeIndexVisualizer: React.FC<{ variant?: BTreeIndexVariant }> = ({
  variant = 'basics',
}) => {
  if (variant === 'composite') return <CompositeSeekView />;
  if (variant === 'covering') return <CoveringIndexView />;
  return <BasicIndexView />;
};

export default BTreeIndexVisualizer;
