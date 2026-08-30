'use client';

import React from 'react';
import { motion } from 'motion/react';
import type { ConfirmState } from './confirm-types';

/** Modal confirmation for destructive admin actions (block / delete). */
export default function ConfirmDialog({
  state,
  busy,
  onCancel,
  onConfirm,
}: {
  state: Exclude<ConfirmState, { kind: 'none' }>;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
}) {
  const isDelete = state.kind === 'delete';
  const u = state.user;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      >
        <h3 className={`font-display font-bold text-base mb-2 ${isDelete ? 'text-error' : 'text-text'}`}>
          {isDelete ? 'Delete user' : 'Block user'}
        </h3>

        <p className="text-sm text-text-dim mb-1">
          <span className="text-text">{u.name ?? u.email}</span>{' '}
          <span className="font-mono text-xs">({u.email})</span>
        </p>

        {isDelete ? (
          <p className="font-mono text-[11px] text-error/90 mt-3 leading-relaxed">
            This permanently removes the account, its sessions, and credentials.
            This action cannot be undone.
          </p>
        ) : (
          <p className="font-mono text-[11px] text-text-faint mt-3 leading-relaxed">
            The user will be denied access on their next request. Progress is kept and can be restored by unblocking.
          </p>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            disabled={busy}
            className="font-mono text-xs px-4 py-2 rounded-lg border border-border text-text-dim hover:text-text transition disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={() => void onConfirm()}
            disabled={busy}
            className={`font-mono text-xs px-4 py-2 rounded-lg transition disabled:opacity-40 ${
              isDelete
                ? 'bg-error text-ink hover:bg-error/90'
                : 'bg-error/80 text-ink hover:bg-error'
            }`}
          >
            {busy ? 'Working…' : isDelete ? 'Delete User' : 'Block User'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
