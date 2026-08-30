'use client';

import React from 'react';

/** Small status/role pill used across the admin dashboard. */
export function StatusBadge({ status, role }: { status: string; role: string }) {
  return (
    <span className="flex items-center gap-1.5 shrink-0">
      {role === 'admin' && (
        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-keyword/40 text-keyword bg-keyword/10 uppercase tracking-wider">
          admin
        </span>
      )}
      <span
        className={`font-mono text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${
          status === 'active'
            ? 'border-border text-text bg-surface'
            : status === 'blocked'
              ? 'border-error/50 text-error bg-error/10'
              : 'border-border text-text-dim bg-surface-2'
        }`}
      >
        {status}
      </span>
    </span>
  );
}

export default StatusBadge;
