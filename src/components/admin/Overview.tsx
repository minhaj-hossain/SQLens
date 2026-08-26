'use client';

import React from 'react';
import { motion } from 'motion/react';
import type { AdminUsersResponse } from '../../lib/admin-api';
import { StatusBadge } from './StatusBadge';

/** Overview tab — stats + recent signups. */
export default function Overview({
  data,
  onGoUsers,
}: {
  data: AdminUsersResponse;
  onGoUsers: () => void;
}) {
  const users = data.users;
  const blocked = users.filter((u) => u.status === 'blocked').length;
  const admins = users.filter((u) => u.role === 'admin').length;
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const recent = users.filter(
    (u) =>
      u.createdAt && new Date(u.createdAt as string).getTime() > weekAgo,
  ).length;

  const stats = [
    { label: 'Total users', value: data.total, danger: false },
    { label: 'Blocked', value: blocked, danger: blocked > 0 },
    { label: 'Admins', value: admins, danger: false },
    { label: 'New (7d)', value: recent, danger: false },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`bg-surface border p-4 rounded-xl ${
              s.danger ? 'border-error/40' : 'border-border'
            }`}
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-dim mb-1.5">
              {s.label}
            </p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-text">{s.value}</p>
          </div>
        ))}
      </div>

      <h3 className="font-display text-sm font-semibold text-text mt-8 mb-3">Recent signups</h3>
      <ul className="divide-y divide-border-soft border border-border rounded-xl overflow-hidden">
        {users.slice(0, 6).map((u) => (
          <li key={u.id} className="bg-surface px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-text truncate">{u.name ?? '—'}</p>
              <p className="font-mono text-[11px] text-text-dim truncate">{u.email}</p>
            </div>
            <StatusBadge status={u.status} role={u.role} />
          </li>
        ))}
        {users.length === 0 && (
          <li className="bg-surface px-4 py-6 text-center font-mono text-xs text-text-dim">
            No users yet.
          </li>
        )}
      </ul>

      <button
        onClick={onGoUsers}
        className="mt-6 bg-func/10 text-func border border-func/30 font-mono text-xs px-4 py-2 rounded-lg hover:bg-func/20 transition"
      >
        Manage users →
      </button>
    </motion.div>
  );
}
