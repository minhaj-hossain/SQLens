'use client';

import React, { useState } from 'react';
import { Key, Shield, ArrowRight, Database, Split } from 'lucide-react';

export const SchemaBlueprintVisualizer: React.FC = () => {
  const [view, setView] = useState<'BLUEPRINT' | 'NORMALIZATION'>('BLUEPRINT');

  return (
    <div className="rounded-xl border border-border bg-surface p-5 text-text my-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-border-soft">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-func font-semibold">
            Mental Model · Schema Architecture & Normalization
          </span>
          <h3 className="font-display font-semibold text-[17px] text-text mt-0.5">
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
