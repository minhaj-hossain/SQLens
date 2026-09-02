'use client';

import React from 'react';

/** Small status/role pill used across the admin dashboard. */
export function StatusBadge({ status, role }: { status: string; role: string }) {
  return (
    <span className="flex items-center gap-1.5 shrink-0">
      {role === 'admin' && (
        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-func/40 text-func bg-func/10 uppercase tracking-wider font-semibold">
          admin
        </span>
      )}
      <span
        className={`font-mono text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-medium ${
          status === 'active'
            ? 'border-success-border text-success-text bg-success-bg'
            : status === 'blocked'
              ? 'border-error-border text-error-text bg-error-bg'
              : 'border-border text-text-dim bg-surface-2'
        }`}
      >
        {status}
      </span>
    </span>
  );
}

export default StatusBadge;
