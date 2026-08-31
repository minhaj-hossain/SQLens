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
}

const SqlExecutorContext = createContext<SqlExecutorContextValue | null>(null);

export function SqlExecutorProvider({ children }: { children: React.ReactNode }) {
  const executor = useMemo(() => new SqlExecutor(), []);

  const executeQuery = useCallback(
    (sql: string) => executor.executeQuery(sql),
    [executor],
  );

  const resetDatabase = useCallback(() => {
    executor.resetDatabase();
  }, [executor]);

  const getDatabaseState = useCallback(
    () => executor.getDatabaseState(),
    [executor],
  );

  const value = useMemo(
    () => ({ executeQuery, resetDatabase, getDatabaseState }),
    [executeQuery, resetDatabase, getDatabaseState],
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
