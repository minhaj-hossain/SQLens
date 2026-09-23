'use client';

import React, { useState } from 'react';
import { Key, Shield, ArrowRight, Database, Split } from 'lucide-react';

export type SchemaBlueprintVariant = 'blueprint' | 'migration';

/* ---------------------------------------------------------------------------
 * Day 56 — Expand → Backfill → Contract (safe schema evolution)
 * ------------------------------------------------------------------------- */
const EXPAND_STAGES = [
  {
    key: 'expand',
    label: '1. EXPAND',
    sql: 'ALTER TABLE customers ADD COLUMN full_name VARCHAR(120) NULL;',
    tone: 'func' as const,
    title: 'Add the new column as NULLable — old and new code both keep working',
    body: 'Two versions of the app run at the same time during a deploy. The old version never mentions full_name, so the column has to accept NULL: a NOT NULL column with no default would reject every INSERT the old code makes.',
  },
  {
    key: 'backfill',
    label: '2. BACKFILL',
    sql: 'UPDATE customers SET full_name = name WHERE full_name IS NULL;',
    tone: 'warning' as const,
    title: 'Fill history in batches — never one giant UPDATE',
    body: 'Existing rows have no full_name yet. Backfilling in bounded batches keeps locks short and lets you stop and resume. Run it before any constraint is tightened.',
  },
  {
    key: 'contract',
    label: '3. CONTRACT',
    sql: 'ALTER TABLE customers DROP COLUMN name;',
    tone: 'error' as const,
    title: 'Only after the last reader of the old column is gone',
    body: 'The rollback window has to be closed first. Dropping name while the previous app version is still running breaks it instantly — this is the step that must never be merged into the expand step.',
  },
];

const ExpandContractView: React.FC = () => {
  const [stage, setStage] = useState(0);
  const [rowId, setRowId] = useState(99);

  const columnState = [
    { name: 'customer_id', note: 'untouched', alive: true },
    {
      name: 'name',
      note: stage >= 2 ? 'dropped in contract' : stage === 1 ? 'still readable, now redundant' : 'legacy column',
      alive: stage < 2,
    },
    {
      name: 'full_name',
      note: stage === 0 ? 'freshly added, all NULL' : stage === 1 ? 'backfilled from name' : 'new source of truth',
      alive: stage >= 1,
    },
  ];
  const active = EXPAND_STAGES[stage];
  const toneRing =
    active.tone === 'func'
      ? 'border-func/50 bg-func/10'
      : active.tone === 'warning'
      ? 'border-warning-border bg-warning-bg/25'
      : 'border-error-border bg-error-bg/20';

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-5 text-text my-4 sm:my-5 shadow-sm w-full min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b border-border-soft min-w-0">
        <div className="min-w-0">
          <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-wider text-func font-semibold">
            Mental Model · Migrations & Schema Evolution
          </span>
          <h3 className="font-display font-semibold text-[15px] sm:text-[17px] text-text mt-0.5">
            Expand → Backfill → Contract: changing shape while the app stays up
          </h3>
        </div>
        <span className="font-mono text-[11px] px-2.5 py-1 rounded-full border border-border bg-surface-2 text-text-dim">
          Stage {stage + 1} / 3
        </span>
      </div>

      <p className="text-xs text-text-dim mt-3 leading-relaxed font-sans">
        A schema change is not one statement — it is a <strong className="text-text">sequence</strong> that has
        to survive a rolling deploy where two app versions run at once. Each stage is safe on its own; only the
        order makes the whole migration safe.
      </p>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
        {EXPAND_STAGES.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setStage(i)}
            className={`text-left p-3 rounded-lg border transition cursor-pointer ${
              i === stage ? toneRing : 'bg-surface-2 border-border hover:bg-surface-3'
            }`}
          >
            <div
              className={`font-mono text-[11px] font-bold ${
                s.tone === 'func' ? 'text-func' : s.tone === 'warning' ? 'text-warning-text' : 'text-error-text'
              }`}
            >
              {s.label}
            </div>
            <code className="block mt-1.5 text-[10.5px] text-text-dim break-words">{s.sql}</code>
          </button>
        ))}
      </div>

      <div className={`mt-3 p-3.5 rounded-lg border ${toneRing}`}>
        <div className="text-xs font-semibold text-text">{active.title}</div>
        <p className="text-[11.5px] text-text-dim font-sans mt-1.5 leading-relaxed">{active.body}</p>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
        <div className="p-3 rounded-lg bg-surface-2 border border-border">
          <div className="text-[10.5px] uppercase tracking-wider text-text-faint">customers — column state</div>
          <div className="mt-2 space-y-1.5">
            {columnState.map((c) => (
              <div
                key={c.name}
                className={`flex items-center justify-between gap-2 p-1.5 rounded border ${
                  c.alive ? 'bg-surface border-border-soft' : 'bg-error-bg/15 border-error-border opacity-70'
                }`}
              >
                <span className={c.alive ? 'text-text' : 'text-error-text line-through'}>{c.name}</span>
                <span className="text-[10.5px] text-text-faint text-right">{c.note}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-surface-2 border border-border">
          <div className="text-[10.5px] uppercase tracking-wider text-text-faint">
            The old app version is still running…
          </div>
          <code className="block mt-2 text-[10.5px] text-text-dim break-words">
            {`INSERT INTO customers (customer_id, name, email) VALUES (${rowId}, 'Salma', 's@x.com')`}
          </code>
          <div
            className={`mt-2 p-2 rounded border text-[11px] font-sans ${
              stage < 2
                ? 'bg-success-bg/25 border-success-border text-success-text'
                : 'bg-error-bg/20 border-error-border text-error-text'
            }`}
          >
            {stage < 2
              ? 'Succeeds — name still exists and full_name tolerates NULL. That is the entire point of expanding before switching over.'
              : 'Fails — the column is gone, so every request handled by the not-yet-replaced version starts erroring mid-deploy.'}
          </div>
          <button
            onClick={() => setRowId((r) => (r === 99 ? 98 : 99))}
            className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-border bg-surface-3 hover:bg-surface text-[10.5px] cursor-pointer transition"
          >
            <Shield className="w-3 h-3" />
            <span>Retry as the old version</span>
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => setStage((s) => Math.max(0, s - 1))}
          className="px-3 py-1.5 rounded-lg bg-surface-3 hover:bg-surface border border-border text-xs font-mono text-text cursor-pointer transition"
        >
          ← Previous stage
        </button>
        <button
          onClick={() => setStage((s) => Math.min(2, s + 1))}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-func text-ink font-semibold text-xs cursor-pointer transition hover:brightness-110"
        >
          <span>Advance migration</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const SchemaBlueprintVisualizer: React.FC<{ variant?: SchemaBlueprintVariant }> = ({
  variant = 'blueprint',
}) => {
  if (variant === 'migration') return <ExpandContractView />;

  const [view, setView] = useState<'BLUEPRINT' | 'NORMALIZATION'>('BLUEPRINT');

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-5 text-text my-4 sm:my-5 shadow-sm w-full min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b border-border-soft min-w-0">
        <div>
          <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-wider text-func font-semibold">
            Mental Model · Schema Architecture & Normalization
          </span>
          <h3 className="font-display font-semibold text-[15px] sm:text-[17px] text-text mt-0.5">
            Relational Blueprint & Constraint Verification
          </h3>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border text-xs font-mono">
          <button
            onClick={() => setView('BLUEPRINT')}
            className={`px-3 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
              view === 'BLUEPRINT'
                ? 'bg-func text-ink'
                : 'text-text-dim hover:text-text hover:bg-surface-3'
            }`}
          >
            Schema Blueprint & Constraints
          </button>
          <button
            onClick={() => setView('NORMALIZATION')}
            className={`px-3 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
              view === 'NORMALIZATION'
                ? 'bg-func text-ink'
                : 'text-text-dim hover:text-text hover:bg-surface-3'
            }`}
          >
            3NF Decomposition Splitter
          </button>
        </div>
      </div>

      <div className="mt-4">
        {view === 'BLUEPRINT' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Table 1: users */}
            <div className="rounded-lg border border-border bg-surface-2 p-3.5 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-border-soft">
                <span className="font-bold text-text flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-func" />
                  users
                </span>
                <span className="text-[10px] text-text-faint uppercase">Parent Entity</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-1.5 rounded bg-surface border border-border-soft">
                  <span className="flex items-center gap-1 text-func font-semibold">
                    <Key className="w-3 h-3" /> id
                  </span>
                  <span className="text-text-dim text-[11px]">SERIAL PRIMARY KEY</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-surface border border-border-soft">
                  <span className="text-text">email</span>
                  <span className="text-text-dim text-[11px]">VARCHAR(255) UNIQUE NOT NULL</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-surface border border-border-soft">
                  <span className="text-text">created_at</span>
                  <span className="text-text-dim text-[11px]">TIMESTAMP DEFAULT NOW()</span>
                </div>
              </div>
            </div>

            {/* Table 2: orders with FK */}
            <div className="rounded-lg border border-border bg-surface-2 p-3.5 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-border-soft">
                <span className="font-bold text-text flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-func" />
                  orders
                </span>
                <span className="text-[10px] text-text-faint uppercase">Child Entity</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-1.5 rounded bg-surface border border-border-soft">
                  <span className="flex items-center gap-1 text-func font-semibold">
                    <Key className="w-3 h-3" /> id
                  </span>
                  <span className="text-text-dim text-[11px]">SERIAL PRIMARY KEY</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-surface border border-border-soft">
                  <span className="flex items-center gap-1 text-func font-semibold">
                    user_id
                  </span>
                  <span className="text-func text-[11px]">REFERENCES users(id)</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-surface border border-border-soft">
                  <span className="text-text">total_amount</span>
                  <span className="text-text-dim text-[11px]">NUMERIC(10,2) CHECK (&gt; 0)</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-error-bg/30 border border-error-border">
              <div className="text-error-text font-bold mb-1 flex items-center gap-1.5">
                <span>❌ Un-Normalized Table (Anomalies & Duplicate Bloat)</span>
              </div>
              <p className="text-text-dim text-[11.5px] leading-relaxed">
                Table: <code>orders_flat(order_id, user_id, user_email, user_address, product, price)</code>
                <br />
                Updating an address requires rewriting 50 redundant rows. If a user deletes an order, their user profile is accidentally destroyed!
              </p>
            </div>

            <div className="flex justify-center my-1">
              <ArrowRight className="w-5 h-5 text-func rotate-90" />
            </div>

            <div className="p-3 rounded-lg bg-success-bg/30 border border-success-border">
              <div className="text-success-text font-bold mb-1 flex items-center gap-1.5">
                <span>✅ Third Normal Form (3NF Decomposed Entities)</span>
              </div>
              <p className="text-text-dim text-[11.5px] leading-relaxed">
                <code>users(user_id [PK], user_email, user_address)</code>
                <br />
                <code>orders(order_id [PK], user_id [FK], product, price)</code>
                <br />
                Zero duplication, zero update anomalies, and independent entity life cycles.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemaBlueprintVisualizer;


