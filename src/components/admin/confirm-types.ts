'use client';

import type { AdminUser } from '../../lib/admin-api';

export type ConfirmState =
  | { kind: 'none' }
  | { kind: 'block'; user: AdminUser }
  | { kind: 'delete'; user: AdminUser };
