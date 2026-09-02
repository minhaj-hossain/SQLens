/**
 * Client-side helpers for the admin API (`/api/admin/*`).
 * Safe to import from client components — it only performs fetches.
 *
 * SECURITY: these calls carry zero authority. The server re-verifies the
 * session's role/status on every request (see src/lib/authorize.ts), so a
 * modified frontend or forged localStorage gains nothing.
 */

export interface AdminUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'blocked' | 'deleted';
  createdAt?: string | unknown;
  updatedAt?: string | unknown;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
}

export class AdminApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function parse(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function assertOk(res: Response, fallbackCode: string): Promise<any> {
  const body = await parse(res);
  if (!res.ok) {
    const code =
      (body && typeof body === 'object' && 'error' in body
        ? String((body as { error: unknown }).error)
        : undefined) ?? fallbackCode;
    throw new AdminApiError(res.status, code, code);
  }
  return body;
}

/** GET /api/admin/users — paginated user list. */
export async function adminListUsers(limit = 50, offset = 0): Promise<AdminUsersResponse> {
  const res = await fetch(`/api/admin/users?limit=${limit}&offset=${offset}`, {
    credentials: 'same-origin',
  });
  return assertOk(res, 'request_failed') as Promise<AdminUsersResponse>;
}

/** PATCH /api/admin/users/:id — block or unblock. */
export async function adminSetUserStatus(
  id: string,
  action: 'block' | 'unblock',
): Promise<{ user: AdminUser }> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ action }),
  });
  return assertOk(res, 'request_failed');
}

/** DELETE /api/admin/users/:id — permanently remove the user. */
export async function adminDeleteUser(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });
  return assertOk(res, 'request_failed');
}

// ─── Curriculum availability (Phase 8) ────────────────────────────────────

export interface ModuleAvailability {
  dayId: string;
  unlockMode: 'automatic' | 'manual' | 'scheduled' | 'locked';
  unlockAt?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export type AvailabilityMap = Record<string, ModuleAvailability>;

/** GET /api/admin/modules — full availability map (admin only). */
export async function adminListModules(): Promise<AvailabilityMap> {
  const res = await fetch('/api/admin/modules', { credentials: 'same-origin' });
  const body = (await assertOk(res, 'request_failed')) as { availability?: AvailabilityMap };
  return body?.availability ?? {};
}

/** PUT /api/admin/modules/:dayId — set one module's availability mode. */
export async function adminSetModule(
  dayId: string,
  payload: { unlockMode: ModuleAvailability['unlockMode']; unlockAt?: string | null },
): Promise<{ module: ModuleAvailability }> {
  const res = await fetch(`/api/admin/modules/${dayId}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });
  return assertOk(res, 'request_failed');
}

// ─── Analytics ─────────────────────────────────────────────────────────────

export interface AdminAnalyticsData {
  totalLearners: number;
  activeLearners7d: number;
  completedCurriculumCount: number;
  medianDayReached: number;
  streakDistribution: {
    streak0to3: number;
    streak4to7: number;
    streak8to14: number;
    streak15plus: number;
  };
  milestones: {
    id: string;
    number: number;
    title: string;
    subtitle: string;
    totalModules: number;
    completedCount: number;
    completionRate: number;
  }[];
  modules: {
    id: string;
    day: number;
    title: string;
    milestoneId: string;
    completedCount: number;
    completionRate: number;
    dropoffRate: number;
  }[];
  dropoffCliffs: { moduleId: string; day: number; title: string; dropCount: number }[];
}

export async function adminGetAnalytics(): Promise<AdminAnalyticsData> {
  const res = await fetch('/api/admin/analytics', { credentials: 'same-origin' });
  const body = (await assertOk(res, 'request_failed')) as { analytics: AdminAnalyticsData };
  return body.analytics;
}

// ─── Announcements ─────────────────────────────────────────────────────────

export interface AdminAnnouncement {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'maintenance' | 'success';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function adminListAnnouncements(): Promise<AdminAnnouncement[]> {
  const res = await fetch('/api/admin/announcements', { credentials: 'same-origin' });
  const body = (await assertOk(res, 'request_failed')) as { announcements: AdminAnnouncement[] };
  return body.announcements;
}

export async function adminCreateAnnouncement(payload: {
  title: string;
  message: string;
  severity: AdminAnnouncement['severity'];
  active?: boolean;
}): Promise<AdminAnnouncement> {
  const res = await fetch('/api/admin/announcements', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });
  const body = (await assertOk(res, 'request_failed')) as { announcement: AdminAnnouncement };
  return body.announcement;
}

export async function adminToggleAnnouncement(id: string, active: boolean): Promise<void> {
  const res = await fetch(`/api/admin/announcements/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ active }),
  });
  await assertOk(res, 'request_failed');
}

export async function adminDeleteAnnouncement(id: string): Promise<void> {
  const res = await fetch(`/api/admin/announcements/${id}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });
  await assertOk(res, 'request_failed');
}

// ─── System Telemetry ──────────────────────────────────────────────────────

export interface AdminSystemHealth {
  serverTime: string;
  uptimeSeconds: number;
  nodeVersion: string;
  platform: string;
  arch: string;
  environment: string;
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  };
  database: {
    status: string;
    name: string;
    collectionsCount: number;
  };
  curriculum: {
    modulesCount: number;
    conceptsCount: number;
    practiceTasksCount: number;
    milestonesCount: number;
    status: string;
  };
}

export async function adminGetSystemHealth(): Promise<AdminSystemHealth> {
  const res = await fetch('/api/admin/system', { credentials: 'same-origin' });
  const body = (await assertOk(res, 'request_failed')) as { system: AdminSystemHealth };
  return body.system;
}

