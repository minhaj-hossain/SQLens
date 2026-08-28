'use client';

import React from 'react';
import UsersPanel from './UsersPanel';
import { useAdminUsers } from './AdminUsersContext';

/**
 * Users panel content for /admin/users (Phase 5 split). Data comes from the
 * shared admin context; onChanged reloads it (keeping the Overview numbers
 * fresh across the split pages).
 */
export default function AdminUsersPanel() {
  const { data, reload } = useAdminUsers();

  if (!data) return null;
  return <UsersPanel initial={data} onChanged={() => void reload()} />;
}
