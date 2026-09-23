'use client';

import React, { useState } from 'react';
import { ShieldCheck, RotateCcw, CheckCircle2, Play, AlertCircle, Lock, GitBranch } from 'lucide-react';

type TxState = 'INITIAL' | 'IN_FLIGHT' | 'COMMITTED' | 'ROLLED_BACK';

/* ---------------------------------------------------------------------------
 * Day 26 — the atomicity view (original content)
 * ------------------------------------------------------------------------- */
const AtomicityView: React.FC = () => {
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
/* ---------------------------------------------------------------------------
 * Day 49 — two sessions interleaved: the isolation anomalies
 * ------------------------------------------------------------------------- */
type Interleaving = {
  id: 'dirty' | 'nonrepeatable' | 'phantom';
  name: string;
  userStory: string;
  a: string[];
  b: string[];
  damage: string;
  fix: string;
};

const INTERLEAVINGS: Interleaving[] = [
  {
    id: 'dirty',
    name: 'Dirty read',
    userStory: 'Session B reads a balance that was never committed, then A backs out.',
    a: ['BEGIN', 'UPDATE accounts SET balance = 900 WHERE id = 1  -- was 1000', 'ROLLBACK  -- money never left'],
    b: ['SELECT balance FROM accounts WHERE id = 1  -- sees 900 (uncommitted!)', 'Report already sent: "balance = 900"'],
    damage:
      'B acted on 900, but the committed truth is 1000. The report is wrong and no error was ever raised.',
    fix: 'B must not read uncommitted rows. READ COMMITTED (or SERIALIZABLE) blocks the read until A decides.',
  },
  {
    id: 'nonrepeatable',
    name: 'Non-repeatable read',
    userStory: 'The same row gives two different answers inside one transaction.',
    a: ['BEGIN', 'SELECT balance WHERE id = 1  -- 1000', 'UPDATE accounts SET balance = 700 WHERE id = 1; COMMIT  -- meanwhile'],
    b: ['BEGIN', 'SELECT balance WHERE id = 1  -- 1000', 'SELECT balance WHERE id = 1  -- now 700: same query, new answer'],
    damage:
      'B computed with 1000 and reported 700 — inside a single transaction that was supposed to be one consistent snapshot.',
    fix: 'REPEATABLE READ pins each row for the life of the transaction; B keeps seeing 1000 until it commits.',
  },
  {
    id: 'phantom',
    name: 'Phantom read',
    userStory: 'A row that did not exist appears between two identical range queries.',
    a: ['BEGIN', "SELECT COUNT(*) FROM orders WHERE status = 'pending'  -- 10", 'INSERT INTO orders (...); COMMIT  -- an 11th pending order'],
    b: ['BEGIN', "SELECT COUNT(*) FROM orders WHERE status = 'pending'  -- 10", "SELECT COUNT(*) FROM orders WHERE status = 'pending'  -- 11"],
    damage:
      'The same range produced 10 and then 11. Totals no longer add up and reconciliation breaks.',
    fix: 'SERIALIZABLE puts a range lock on the predicate, so A cannot insert into the range B is reading.',
  },
];



const IsolationLanesView: React.FC = () => {
  const [selected, setSelected] = useState<Interleaving['id']>('dirty');
  const scenario = INTERLEAVINGS.find((s) => s.id === selected)!;

  const lane = (title: string, sub: string, steps: string[], tone: 'a' | 'b') => (
    <div
      className={`p-3 rounded-lg border flex-1 min-w-0 ${
        tone === 'a' ? 'bg-surface-2 border-func/40' : 'bg-surface-2 border-warning-border'
      }`}
    >
      <div
        className={`flex items-center gap-1.5 font-bold pb-1.5 mb-2 border-b border-border-soft ${
          tone === 'a' ? 'text-func' : 'text-warning-text'
        }`}
      >
        {tone === 'a' ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
        <span>{title}</span>
        <span className="text-[10px] text-text-faint font-normal">({sub})</span>
      </div>
      <ol className="space-y-1.5">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-2 text-[11px]">
            <span className="text-text-faint shrink-0 w-3.5">{i + 1}.</span>
            <code className="text-text break-all">{s}</code>
          </li>
        ))}
      </ol>
    </div>
  );

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-5 text-text my-4 sm:my-5 shadow-sm w-full min-w-0">
      <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-wider text-func font-semibold">
        Mental Model · Isolation &amp; Concurrency
      </span>
      <h3 className="font-display font-semibold text-[15px] sm:text-[17px] text-text mt-0.5">
        Two Sessions, One Timeline — Where Isolation Levels Earn Their Keep
      </h3>
      <p className="text-xs text-text-dim mt-3 leading-relaxed font-sans">
        Isolation is not an abstract setting: it is the guarantee about what one session is allowed to see
        while another session is mid-flight. Each anomaly below is the same shape — two sessions interleaved
        on one timeline — and each is closed by a stronger level.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border w-fit font-mono">
        {INTERLEAVINGS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s.id)}
            className={`px-3 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
              selected === s.id ? 'bg-func text-ink' : 'text-text-dim hover:text-text hover:bg-surface-3'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <p className="mt-3 text-[11.5px] text-text-dim font-sans">{scenario.userStory}</p>

      <div className="mt-3 flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
        {lane('Session A', 'writes', scenario.a, 'a')}
        {lane('Session B', 'reads', scenario.b, 'b')}
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-error-bg/20 border border-error-border">
          <div className="text-[10.5px] uppercase tracking-wider text-error-text font-semibold">
            What went wrong
          </div>
          <p className="text-[11.5px] text-text-dim font-sans mt-1.5">{scenario.damage}</p>
        </div>
        <div className="p-3 rounded-lg bg-success-bg/25 border border-success-border">
          <div className="text-[10.5px] uppercase tracking-wider text-success-text font-semibold">
            The level that closes it
          </div>
          <p className="text-[11.5px] text-text-dim font-sans mt-1.5">{scenario.fix}</p>
        </div>
      </div>

      <div className="mt-3 p-3 rounded-lg bg-surface-2 border border-border">
        <div className="text-[10.5px] uppercase tracking-wider text-text-faint font-mono">The ladder</div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          <span className="px-2 py-0.5 rounded bg-error-bg/30 border border-error-border text-text">
            READ UNCOMMITTED — dirty reads allowed
          </span>
          <span className="text-text-faint">→</span>
          <span className="px-2 py-0.5 rounded bg-warning-bg/30 border border-warning-border text-text">
            READ COMMITTED — no dirty reads
          </span>
          <span className="text-text-faint">→</span>
          <span className="px-2 py-0.5 rounded bg-func/15 border border-func/40 text-text">
            REPEATABLE READ — no non-repeatable reads
          </span>
          <span className="text-text-faint">→</span>
          <span className="px-2 py-0.5 rounded bg-success-bg/30 border border-success-border text-text">
            SERIALIZABLE — no phantoms
          </span>
        </div>
        <p className="text-[11px] text-text-faint font-sans mt-2">
          Each step up buys a stronger promise and costs concurrency. Most production systems sit on READ
          COMMITTED; SERIALIZABLE is for money-moving logic that cannot tolerate a shifted range.
        </p>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------------------
 * Day 50 — the wait-for cycle: how a deadlock actually forms and breaks
 * ------------------------------------------------------------------------- */
const DeadlockCycleView: React.FC = () => {
  const [ordered, setOrdered] = useState(false);
  const [victim, setVictim] = useState<'A' | 'B' | null>(null);

  const rowState = (id: number) => {
    if (ordered) return id === 1 ? 'A' : 'waiting';
    if (victim === 'A') return id === 2 ? 'B' : 'A';
    if (victim === 'B') return id === 1 ? 'A' : 'waiting';
    return id === 1 ? 'A' : 'B';
  };

  const holders = [
    { id: 1, label: 'accounts · id = 1', owner: 'A', waiter: ordered ? null : 'B' },
    { id: 2, label: 'accounts · id = 2', owner: ordered ? null : 'B', waiter: ordered ? 'B' : 'A' },
  ];

  const inCycle = !ordered && victim === null;

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-5 text-text my-4 sm:my-5 shadow-sm w-full min-w-0">
      <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-wider text-func font-semibold">
        Mental Model · Locking &amp; Deadlock Resolution
      </span>
      <h3 className="font-display font-semibold text-[15px] sm:text-[17px] text-text mt-0.5">
        A Deadlock Is a Cycle in the Wait-For Graph
      </h3>
      <p className="text-xs text-text-dim mt-3 leading-relaxed font-sans">
        Nothing is broken about either transaction. A holds one row, B holds another, and each one now needs
        what the other is holding. Neither can proceed and neither will ever let go on its own — that is a
        deadlock, and the only way out is for the engine to break the cycle by aborting one side.
      </p>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-surface-2 border border-border">
          <div className="text-[10.5px] uppercase tracking-wider text-text-faint font-mono mb-2">
            Lock ledger (exclusive row locks)
          </div>
          <div className="space-y-2">
            {holders.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between gap-2 p-2 rounded border border-border-soft bg-surface text-[11.5px]"
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  <Lock className="w-3.5 h-3.5 text-func shrink-0" />
                  <span className="text-text truncate">{h.label}</span>
                </span>
                <span className="flex items-center gap-1.5 shrink-0 font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-func/15 border border-func/40 text-text">
                    held by {h.owner}
                  </span>
                  {h.waiter ? (
                    <span className="px-1.5 py-0.5 rounded bg-warning-bg/40 border border-warning-border text-warning-text">
                      {h.waiter} waiting
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-success-bg/30 border border-success-border text-success-text">
                      free
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`p-3 rounded-lg border ${
            inCycle ? 'bg-error-bg/20 border-error-border' : 'bg-surface-2 border-border'
          }`}
        >
          <div className="text-[10.5px] uppercase tracking-wider text-text-faint font-mono mb-2">
            Wait-for graph
          </div>
          <div className="flex items-center justify-center gap-3 py-3 font-mono text-sm">
            <span className="px-3 py-1.5 rounded-lg bg-surface border border-func/40 text-text">A</span>
            <span className="flex flex-col items-center text-[10px] leading-tight">
              <span className={inCycle ? 'text-error-text font-bold' : 'text-func'}>
                {inCycle ? '→ wants row 2 →' : ordered ? 'locked row 1 ✓' : '→ wants row 2 →'}
              </span>
              <span className={inCycle ? 'text-error-text font-bold' : 'text-text-faint'}>
                {inCycle
                  ? '← wants row 1 ←'
                  : ordered
                    ? 'B is queued behind A'
                    : victim
                      ? 'lock released'
                      : ''}
              </span>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-surface border border-func/40 text-text">B</span>
          </div>
          <div
            className={`flex items-center gap-1.5 text-[11px] font-sans ${
              inCycle ? 'text-error-text font-semibold' : 'text-text-dim'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 shrink-0" />
            <span>
              {inCycle
                ? 'Cycle detected: A waits for B, and B waits for A. No ordering of the two can ever finish.'
                : ordered
                  ? 'No cycle: both sessions take row 1 before row 2, so B simply queues behind A and finishes after it.'
                  : 'Cycle broken: the victim rolled back, released its row, and the survivor can now proceed.'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-error-bg/20 border border-error-border">
          <div className="text-[10.5px] uppercase tracking-wider text-error-text font-semibold">
            What the engine does when it sees the cycle
          </div>
          <ol className="mt-2 space-y-1.5 text-[11.5px] text-text-dim font-sans list-none">
            <li className="flex gap-2">
              <span className="text-text-faint shrink-0">1.</span>
              <span>
                Detect the cycle instead of waiting forever (real engines also have a{' '}
                <code className="text-text">lock wait timeout</code> as the backstop).
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-text-faint shrink-0">2.</span>
              <span>
                Pick the cheaper victim — usually the transaction that has changed the fewest rows, since
                redoing it is cheapest.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-text-faint shrink-0">3.</span>
              <span>
                <code className="text-text">ROLLBACK</code> that one transaction only, releasing its locks,
                and return an error to its client (MySQL: <code className="text-text">1213 Deadlock</code>).
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-text-faint shrink-0">4.</span>
              <span>The survivor proceeds and commits normally. The victim&apos;s work is retried by the app.</span>
            </li>
          </ol>
        </div>
        <div className="p-3 rounded-lg bg-success-bg/25 border border-success-border">
          <div className="text-[10.5px] uppercase tracking-wider text-success-text font-semibold">
            How you avoid creating one
          </div>
          <ul className="mt-2 space-y-1.5 text-[11.5px] text-text-dim font-sans list-none">
            <li className="flex gap-2">
              <span className="text-success-text shrink-0">✓</span>
              <span>Always touch rows in the same order (here: ascending <code className="text-text">id</code>).</span>
            </li>
            <li className="flex gap-2">
              <span className="text-success-text shrink-0">✓</span>
              <span>Keep transactions short so lock windows barely overlap.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-success-text shrink-0">✓</span>
              <span>Update in one statement where possible, and never wait on user input mid-transaction.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-success-text shrink-0">✓</span>
              <span>Treat a deadlock error as retryable — it is a scheduling accident, not a bug in the SQL.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setOrdered(false);
            setVictim(null);
          }}
          className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
            inCycle ? 'bg-error-bg/30 border-error-border text-text' : 'bg-surface-3 border-border text-text-dim hover:text-text'
          }`}
        >
          1. Interleave the updates (A:1→2, B:2→1)
        </button>
        <button
          onClick={() => {
            setOrdered(false);
            setVictim('B');
          }}
          className="px-3 py-1.5 rounded-lg bg-func text-ink text-[11px] font-semibold transition hover:brightness-110 cursor-pointer"
          disabled={ordered || victim !== null}
        >
          2. Let the engine abort the victim
        </button>
        <button
          onClick={() => {
            setVictim(null);
            setOrdered(true);
          }}
          className="px-3 py-1.5 rounded-lg bg-surface-3 hover:bg-surface border border-border text-[11px] font-mono text-text transition cursor-pointer"
        >
          3. Prevent it: lock in the same order
        </button>
        <span className="text-[11px] font-mono text-text-dim">
          {inCycle
            ? 'State: deadlocked — both sides waiting'
            : ordered
              ? 'State: serialized — no cycle possible'
              : `State: recovered — ${victim} was rolled back and retried`}
        </span>
      </div>
    </div>
  );
};

export type TransactionTimelineVariant = 'atomicity' | 'isolation' | 'deadlock';

export const TransactionTimelineVisualizer: React.FC<{ variant?: TransactionTimelineVariant }> = ({
  variant = 'atomicity',
}) => {
  if (variant === 'isolation') return <IsolationLanesView />;
  if (variant === 'deadlock') return <DeadlockCycleView />;
  return <AtomicityView />;
};

export default TransactionTimelineVisualizer;



