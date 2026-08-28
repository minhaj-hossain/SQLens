'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AdminUsersResponse, adminListUsers, AdminApiError } from '../../lib/admin-api';

/**
 * AdminUsersContext — shared users-list data for the split admin pages
 * (Phase 5). Loads once per admin session and exposes reload() so the Users
 * panel can refresh the Overview's numbers after mutations.
 */
interface AdminUsersContextValue {
  data: AdminUsersResponse | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const AdminUsersContext = createContext<AdminUsersContextValue | null>(null);

export function AdminUsersProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AdminUsersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await adminListUsers(200, 0));
    } catch (e) {
      setError(
        e instanceof AdminApiError && e.status === 403
          ? 'forbidden'
          : e instanceof Error
            ? e.message
            : 'request_failed',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const value = useMemo(
    () => ({ data, loading, error, reload: load }),
    [data, loading, error, load],
  );

  return <AdminUsersContext.Provider value={value}>{children}</AdminUsersContext.Provider>;
}

export function useAdminUsers(): AdminUsersContextValue {
  const ctx = useContext(AdminUsersContext);
  if (!ctx) throw new Error('useAdminUsers must be used inside <AdminUsersProvider>');
  return ctx;
}
