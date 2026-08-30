'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AdminUser,
  AdminUsersResponse,
  AdminApiError,
  adminSetUserStatus,
  adminDeleteUser,
} from '../../lib/admin-api';
import { StatusBadge } from './StatusBadge';
import ConfirmDialog from './ConfirmDialog';
import type { ConfirmState } from './confirm-types';

/** Users tab — searchable list with block/unblock/delete (confirmation-gated). */
export default function UsersPanel({
  initial,
  onChanged,
}: {
  initial: AdminUsersResponse;
  onChanged: () => Promise<void> | void;
}) {
  const [users, setUsers] = useState<AdminUser[]>(initial.users);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>({ kind: 'none' });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.email ?? '').toLowerCase().includes(q) || (u.name ?? '').toLowerCase().includes(q),
    );
  }, [users, query]);

  const doBlockUnblock = async (user: AdminUser) => {
    setBusyId(user.id);
    setRowError(null);
    try {
      const { user: updated } = await adminSetUserStatus(
        user.id,
        user.status === 'blocked' ? 'unblock' : 'block',
      );
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
      await onChanged();
    } catch (e) {
      setRowError(e instanceof AdminApiError ? e.message : 'request_failed');
    } finally {
      setBusyId(null);
    }
  };

  const doDelete = async (user: AdminUser) => {
    setBusyId(user.id);
    setRowError(null);
    try {
      await adminDeleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      await onChanged();
    } catch (e) {
      setRowError(e instanceof AdminApiError ? e.message : 'request_failed');
    } finally {
      setBusyId(null);
      setConfirm({ kind: 'none' });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      {/* Search */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or email⬦"
        className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-func/50 mb-4"
      />

      {rowError && (
        <p className="font-mono text-[11px] text-error mb-3">⚠  {rowError}</p>
      )}

      <ul className="divide-y divide-border-soft border border-border rounded-xl overflow-hidden">
        {filtered.map((u) => (
          <li key={u.id} className="bg-surface px-4 py-3.5 flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1 basis-48">
              <div className="flex items-center gap-2">
                <p className="text-sm text-text truncate">{u.name ?? '—'}</p>
              </div>
              <p className="font-mono text-[11px] text-text-dim truncate">{u.email}</p>
              <p className="font-mono text-[10px] text-text-faint mt-0.5">
                joined{' '}
                {u.createdAt ? new Date(u.createdAt as string).toLocaleDateString() : 'unknown'}
              </p>
            </div>

            <StatusBadge status={u.status} role={u.role} />

            <div className="flex gap-2 ml-auto shrink-0">
              {u.status === 'active' && (
                <button
                  disabled={busyId === u.id}
                  onClick={() => setConfirm({ kind: 'block', user: u })}
                  className="font-mono text-[11px] px-3 py-1.5 rounded-lg border border-error/40 text-error hover:bg-error/10 transition disabled:opacity-40"
                >
                  Block
                </button>
              )}
              {u.status === 'blocked' && (
                <button
                  disabled={busyId === u.id}
                  onClick={() => void doBlockUnblock(u)}
                  className="font-mono text-[11px] px-3 py-1.5 rounded-lg border border-border text-text hover:bg-surface-2 transition disabled:opacity-40"
                >
                  Unblock
                </button>
              )}
              <button
                disabled={busyId === u.id}
                onClick={() => setConfirm({ kind: 'delete', user: u })}
                className="font-mono text-[11px] px-3 py-1.5 rounded-lg border border-border text-text-dim hover:text-error hover:border-error/40 transition disabled:opacity-40"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="bg-surface px-4 py-8 text-center font-mono text-xs text-text-dim">
            No users match "{query}".
          </li>
        )}
      </ul>

      {/* Confirmation dialogs for destructive actions */}
      <AnimatePresence>
        {confirm.kind !== 'none' && (
          <ConfirmDialog
            state={confirm}
            busy={busyId != null}
            onCancel={() => setConfirm({ kind: 'none' })}
            onConfirm={async () => {
              if (confirm.kind === 'block') await doBlockUnblock(confirm.user);
              else if (confirm.kind === 'delete') await doDelete(confirm.user);
              else setConfirm({ kind: 'none' });
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
