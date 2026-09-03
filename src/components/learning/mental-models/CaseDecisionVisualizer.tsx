'use client';

import React, { useState } from 'react';
import { GitFork, ArrowDown, CheckCircle2, CornerDownRight, Info } from 'lucide-react';

interface ProductCaseExample {
  name: string;
  stock: number;
}

const PRODUCTS: ProductCaseExample[] = [
  { name: 'USB-C Cable', stock: 0 },
  { name: 'Wireless Mouse', stock: 4 },
  { name: 'Mechanical Keyboard', stock: 25 },
];

export const CaseDecisionVisualizer: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<ProductCaseExample>(PRODUCTS[0]);

  // Evaluate CASE branches
  const isBranch1 = selectedProduct.stock === 0;
  const isBranch2 = !isBranch1 && selectedProduct.stock < 10;
  const isElse = !isBranch1 && !isBranch2;

  const resultLabel = isBranch1
    ? 'Out of Stock'
    : isBranch2
    ? 'Low Stock'
    : 'In Stock';

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-5 text-text my-4 sm:my-5 shadow-sm w-full min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b border-border-soft min-w-0">
        <div className="min-w-0">
          <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-wider text-func font-semibold">
            Mental Model · Branching Conditional Logic
          </span>
          <h3 className="font-display font-semibold text-[15px] sm:text-[17px] text-text mt-0.5">
            CASE Expression Flowchart & The &quot;First Match Wins&quot; Rule
          </h3>
        </div>

        {/* Product selector */}
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border text-xs font-mono">
          {PRODUCTS.map((p) => (
            <button
              key={p.name}
              onClick={() => setSelectedProduct(p)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                selectedProduct.name === p.name
                  ? 'bg-func text-ink'
                  : 'text-text-dim hover:text-text hover:bg-surface-3'
              }`}
            >
              {p.name} ({p.stock} units)
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-text-dim mt-3 leading-relaxed font-sans">
        SQL evaluates each <code className="text-func font-bold">WHEN</code> condition from top to bottom. The moment a condition evaluates to <strong className="text-success-text">TRUE</strong>, SQL assigns that value and exits immediately. Later conditions are never evaluated.
      </p>

      {/* Decision Tree Graphic */}
      <div className="mt-4 p-4 rounded-xl bg-surface-2 border border-border font-mono text-xs space-y-3">
        {/* Incoming Row Data */}
        <div className="flex items-center justify-between p-2.5 rounded bg-surface border border-border-soft">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-func animate-ping" />
            <span>Evaluating Row: <strong className="text-text">{selectedProduct.name}</strong></span>
          </div>
          <span className="text-func font-bold">stock = {selectedProduct.stock}</span>
        </div>

        <div className="flex justify-center">
          <ArrowDown className="w-4 h-4 text-text-faint" />
        </div>

        {/* Branch 1 */}
        <div className={`p-3 rounded-lg border transition-all ${
          isBranch1
            ? 'bg-success-bg/30 border-success-border text-success-text shadow-[0_0_10px_var(--accent-dim)]'
            : 'bg-surface border-border-soft text-text-faint opacity-50'
        }`}>
          <div className="flex items-center justify-between">
            <span>WHEN stock = 0 THEN &apos;Out of Stock&apos;</span>
            <span className="font-bold">{isBranch1 ? '✔ TRUE (Matches & Exits!)' : '✖ FALSE (Next Branch)'}</span>
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowDown className="w-4 h-4 text-text-faint" />
        </div>

        {/* Branch 2 */}
        <div className={`p-3 rounded-lg border transition-all ${
          isBranch2
            ? 'bg-success-bg/30 border-success-border text-success-text shadow-[0_0_10px_var(--accent-dim)]'
            : 'bg-surface border-border-soft text-text-faint opacity-50'
        }`}>
          <div className="flex items-center justify-between">
            <span>WHEN stock &lt; 10 THEN &apos;Low Stock&apos;</span>
            <span className="font-bold">
              {isBranch1 ? 'Skipped (Already Matched)' : isBranch2 ? '✔ TRUE (Matches & Exits!)' : '✖ FALSE (Next Branch)'}
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowDown className="w-4 h-4 text-text-faint" />
        </div>

        {/* Fallback Else */}
        <div className={`p-3 rounded-lg border transition-all ${
          isElse
            ? 'bg-success-bg/30 border-success-border text-success-text shadow-[0_0_10px_var(--accent-dim)]'
            : 'bg-surface border-border-soft text-text-faint opacity-50'
        }`}>
          <div className="flex items-center justify-between">
            <span>ELSE &apos;In Stock&apos;</span>
            <span className="font-bold">{isElse ? '✔ Default Fallback Triggered' : 'Skipped'}</span>
          </div>
        </div>

        {/* Computed Output Column */}
        <div className="mt-3 pt-3 border-t border-border-soft flex items-center justify-between">
          <span className="text-text-dim text-[11px]">Computed Column (stock_status):</span>
          <span className="font-mono text-xs px-3 py-1 rounded bg-func text-ink font-bold">
            &apos;{resultLabel}&apos;
          </span>
        </div>
      </div>
    </div>
  );
};

export default CaseDecisionVisualizer;
