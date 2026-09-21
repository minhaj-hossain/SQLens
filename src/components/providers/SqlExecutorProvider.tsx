'use client';
/**
 * SqlExecutorProvider — owns the in-memory SQL engine instance.
 * Extracted from AppShell (Phase 0). Deliberately navigation-agnostic:
 * `resetDatabase()` is exposed as a plain FUNCTION — callers decide when to
 * reset. Route-driven reset boundaries arrive in Phase 3; until then AppShell
 * keeps its existing effect that calls this function on position changes.
 */
import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { SqlExecutor } from '@/lib/sql-engine/executor';

interface SqlExecutorContextValue {
  executeQuery: (sql: string) => ReturnType<SqlExecutor['executeQuery']>;
  resetDatabase: () => void;
  /** F1: live database snapshot for mutation-task state verification. */
  getDatabaseState: () => ReturnType<SqlExecutor['getDatabaseState']>;
  /**
   * Batch A: DURABLE snapshot (live minus uncommitted txn writes) — the ONLY
   * view grading may use. The explorer keeps `getDatabaseState` (session).
   */
  getCommittedState: () => ReturnType<SqlExecutor['getCommittedState']>;
  /** Batch B: session txn state for the dirty banner + submit gate. */
  getTransactionState: () => ReturnType<SqlExecutor['getTransactionState']>;
}

const SqlExecutorContext = createContext<SqlExecutorContextValue | null>(null);

export function SqlExecutorProvider({ children }: { children: React.ReactNode }) {
  const executor = useMemo(() => {
    const ex = new SqlExecutor();
    // Sandbox leniency: learners can Run Code then Check Answer (or retry after
    // a validation error) on DDL tasks without hitting "Table already exists".
    ex.allowDdlOverwrite = true;
    return ex;
  }, []);

  const executeQuery = useCallback(
    (sql: string) => executor.executeQuery(sql),
    [executor],
  );

  const resetDatabase = useCallback(() => {
    executor.resetDatabase();
  }, [executor]);

  const getDatabaseState = useCallback(
    // P0 FIX: executor.getDatabaseState() now deep-clones, so this snapshot
    // is frozen even if the learner runs more SQL afterwards.
    () => executor.getDatabaseState(),
    [executor],
  );

  // Batch A/B: committed snapshot + txn state are already bound in the
  // executor constructor, so passing them by reference is safe.
  const getCommittedState = useCallback(() => executor.getCommittedState(), [executor]);

  const getTransactionState = useCallback(() => executor.getTransactionState(), [executor]);

  const value = useMemo(
    () => ({ executeQuery, resetDatabase, getDatabaseState, getCommittedState, getTransactionState }),
    [executeQuery, resetDatabase, getDatabaseState, getCommittedState, getTransactionState],
  );

  return (
    <SqlExecutorContext.Provider value={value}>
      {children}
    </SqlExecutorContext.Provider>
  );
}

export function useSqlExecutor(): SqlExecutorContextValue {
  const ctx = useContext(SqlExecutorContext);
  if (!ctx) throw new Error('useSqlExecutor must be used inside <SqlExecutorProvider>');
  return ctx;
}
