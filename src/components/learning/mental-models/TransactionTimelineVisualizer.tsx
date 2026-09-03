'use client';

import React, { useState } from 'react';
import { ShieldCheck, RotateCcw, CheckCircle2, Play, AlertCircle } from 'lucide-react';

type TxState = 'INITIAL' | 'IN_FLIGHT' | 'COMMITTED' | 'ROLLED_BACK';

export const TransactionTimelineVisualizer: React.FC = () => {
  const [txState, setTxState] = useState<TxState>('INITIAL');

  // Account balances
  const initialAlice = 500;
  const initialBob = 200;

  const currentAlice = txState === 'INITIAL' || txState === 'ROLLED_BACK'
    ? initialAlice
    : initialAlice - 100; // Deducted in flight or committed

  const currentBob = txState === 'COMMITTED'
    ? initialBob + 100
    : initialBob; // Not yet credited if failed before commit

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-5 text-text my-4 sm:my-5 shadow-sm w-full min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b border-border-soft min-w-0">
        <div>
          <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-wider text-func font-semibold">
            Mental Model · ACID Transactions & Atomicity
          </span>
          <h3 className="font-display font-semibold text-[15px] sm:text-[17px] text-text mt-0.5">
            Interactive Transaction Atomicity & Rollback Checkpoint
          </h3>
        </div>

        {/* State Badge */}
        <span className={`font-mono text-xs px-2.5 py-1 rounded-full border font-semibold ${
          txState === 'COMMITTED'
            ? 'bg-success-bg text-success-text border-success-border'
            : txState === 'ROLLED_BACK'
            ? 'bg-error-bg text-error-text border-error-border'
            : txState === 'IN_FLIGHT'
            ? 'bg-warning-bg text-warning-text border-warning-border'
            : 'bg-surface-2 text-text-dim border-border'
        }`}>
          Status: {txState}
        </span>
      </div>

      <p className="text-xs text-text-dim mt-3 leading-relaxed">
        <strong className="text-text font-semibold">The Atomicity Guarantee:</strong> All operations inside a transaction succeed together, or all fail together. Staged mutations remain isolated in memory until <code className="text-func font-bold">COMMIT</code> writes them permanently to disk.
      </p>

      {/* Account Balances Preview */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="rounded-lg bg-surface-2 border border-border p-3.5 font-mono text-xs">
          <div className="text-text-faint text-[10.5px] uppercase tracking-wider">Account A (Alice)</div>
          <div className="text-[20px] font-bold text-text mt-1">
            ${currentAlice}
          </div>
          {txState === 'IN_FLIGHT' && (
            <div className="text-warning-text text-[11px] mt-1">Staged debit: -$100 (uncommitted)</div>
          )}
        </div>

        <div className="rounded-lg bg-surface-2 border border-border p-3.5 font-mono text-xs">
          <div className="text-text-faint text-[10.5px] uppercase tracking-wider">Account B (Bob)</div>
          <div className="text-[20px] font-bold text-text mt-1">
            ${currentBob}
          </div>
          {txState === 'IN_FLIGHT' && (
            <div className="text-text-faint text-[11px] mt-1">Awaiting credit confirmation...</div>
          )}
        </div>
      </div>

      {/* Interactive Controls Stepper */}
      <div className="mt-4 p-4 rounded-xl bg-surface-2/60 border border-border flex flex-wrap items-center justify-between gap-3">
        {txState === 'INITIAL' && (
          <button
            onClick={() => setTxState('IN_FLIGHT')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-func text-ink font-semibold text-xs transition hover:brightness-110 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>1. Execute BEGIN & Transfer $100</span>
          </button>
        )}

        {txState === 'IN_FLIGHT' && (
          <div className="flex flex-wrap items-center gap-2.5 w-full">
            <button
              onClick={() => setTxState('COMMITTED')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-success text-ink font-semibold text-xs transition hover:brightness-110 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>COMMIT (Persist Changes)</span>
            </button>

            <button
              onClick={() => setTxState('ROLLED_BACK')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-error text-white font-semibold text-xs transition hover:brightness-110 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Simulate Crash / ROLLBACK</span>
            </button>
          </div>
        )}

        {(txState === 'COMMITTED' || txState === 'ROLLED_BACK') && (
          <div className="flex items-center justify-between w-full">
            <div className="text-xs font-mono">
              {txState === 'COMMITTED' ? (
                <span className="text-success-text font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Changes persisted permanently. Both accounts updated cleanly.
                </span>
              ) : (
                <span className="text-error-text font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Crash detected! ROLLBACK restored Alice&apos;s $100. Zero data corrupted.
                </span>
              )}
            </div>

            <button
              onClick={() => setTxState('INITIAL')}
              className="px-3 py-1.5 rounded-lg bg-surface-3 hover:bg-surface border border-border text-xs font-mono text-text cursor-pointer transition"
            >
              Reset Simulation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionTimelineVisualizer;


