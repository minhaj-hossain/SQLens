'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import UsersPanel from './UsersPanel';
import Overview from './Overview';
import ModulesPanel from './ModulesPanel';
import { AdminUsersResponse, adminListUsers, AdminApiError } from '../../lib/admin-api';

/**
 * Admin dashboard shell — Overview & Users tabs.
 * Rendered only after the server component verified an active admin session.
 */
export default function AdminDashboard({ adminName }: { adminName: string }) {
  const [tab, setTab] = useState<'overview' | 'curriculum' | 'users'>('overview');
  const [data, setData] = useState<AdminUsersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
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
  };

  useEffect(() => {
    void load();
  }, []);

  if (error) {
    return (
      <main className="min-h-screen bg-ink flex items-center justify-center px-4">
        <div className="bg-surface border border-border rounded-2xl p-8 max-w-sm w-full text-center">
          <p className="font-mono text-xs text-error uppercase tracking-wider mb-2">{error}</p>
          <p className="text-text-dim text-sm mb-6">You are not authorized to view this page.</p>
          <Link
            href="/"
            className="inline-block bg-func/10 text-func border border-func/30 font-mono text-xs px-4 py-2 rounded-lg hover:bg-func/20 transition"
          >
            ← Back to SQLens
          </Link>
        </div>
      </main>
    );
  }

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
        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-1">
          {(['overview', 'curriculum', 'users'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 font-mono text-xs capitalize transition-colors border-b-2 -mb-px ${
                tab === t
                  ? 'text-func border-func'
                  : 'text-text-dim border-transparent hover:text-text'
              }`}
            >
              {t === 'users' ? `Users${data ? ` (${data.total})` : ''}` : t}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading || !data ? (
          <p className="font-mono text-xs text-text-dim animate-pulse py-12 text-center">Loading…</p>
        ) : tab === 'overview' ? (
          <Overview data={data} onGoUsers={() => setTab('users')} />
        ) : tab === 'curriculum' ? (
          <ModulesPanel />
        ) : (
          <UsersPanel initial={data} onChanged={load} />
        )}
      </div>
    </main>
  );
}
