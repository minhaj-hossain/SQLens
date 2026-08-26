import { createAuthClient } from 'better-auth/react';

/**
 * Client-side Better Auth instance.
 *
 * The base URL is intentionally omitted → requests go to the same origin at
 * /api/auth/*, which Next.js serves via the App Router route handler
 * `app/api/auth/[...next]/route.ts`.
 */
export const authClient = createAuthClient();