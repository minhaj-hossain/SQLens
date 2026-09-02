'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminUsers } from './AdminUsersContext';

/**
 * AdminShell — shared chrome for the split admin pages (Phase 5):
 * top bar with the admin badge + tab navigation as real links
 * (/admin, /admin/modules, /admin/users). Also centralizes the loading and
 * forbidden-error states shared by all admin panels.
 */
export default function AdminShell({ adminName, children }: { adminName: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, loading, error } = useAdminUsers();

  const tabs: { href: string; label: string }[] = [
    { href: '/admin', label: 'overview' },
    { href: '/admin/modules', label: 'curriculum' },
    { href: '/admin/users', label: `users${data ? ` (${data.total})` : ''}` },
    { href: '/admin/analytics', label: 'analytics' },
    { href: '/admin/query-debug', label: 'query debug' },
    { href: '/admin/announcements', label: 'announcements' },
    { href: '/admin/system', label: 'system' },
  ];

  return (
    <main className="min-h-screen bg-ink">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-ink/90 backdrop-blur-md border-b border-border-soft">
        <div className="max-w-5xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-display font-bold text-sm sm:text-base text-text whitespace-nowrap">
              SQL<span className="text-func">ens</span>
            </span>
            <span className="hidden sm:inline-block text-border font-mono text-xs">/</span>
            <span className="hidden sm:inline-block font-body text-xs text-text-dim">Admin</span>
            <span className="ml-2 inline-flex items-center bg-func/10 text-func border border-func/30 font-mono text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
              {adminName}
            </span>
          </div>
          <Link
            href="/"
            className="shrink-0 text-text-dim hover:text-text transition-colors font-mono text-xs"
          >
            ← App
          </Link>
        </div>
        {/* Tab navigation — real routes */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto scrollbar-none whitespace-nowrap">
          {tabs.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`px-4 py-2.5 font-mono text-xs transition-colors border-b-2 -mb-px ${
                  active
                    ? 'text-func border-func'
                    : 'text-text-dim border-transparent hover:text-text'
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {error ? (
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-sm w-full mx-auto text-center mt-8">
            <p className="font-mono text-xs text-error uppercase tracking-wider mb-2">{error}</p>
            <p className="text-text-dim text-sm mb-6">You are not authorized to view this page.</p>
            <Link
              href="/"
              className="inline-block bg-func/10 text-func border border-func/30 font-mono text-xs px-4 py-2 rounded-lg hover:bg-func/20 transition"
            >
              ← Back to SQLens
            </Link>
          </div>
        ) : loading || !data ? (
          <p className="font-mono text-xs text-text-dim animate-pulse py-12 text-center">Loading…</p>
        ) : (
          children
        )}
      </div>
    </main>
  );
}
