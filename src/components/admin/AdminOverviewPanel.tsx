'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Overview from './Overview';
import { useAdminUsers } from './AdminUsersContext';

/**
 * Overview panel content for /admin (Phase 5 split). "Go to users" now
 * navigates to the /admin/users route.
 */
export default function AdminOverviewPanel() {
  const { data } = useAdminUsers();
  const router = useRouter();

  if (!data) return null;
  return <Overview data={data} onGoUsers={() => router.push('/admin/users')} />;
}
