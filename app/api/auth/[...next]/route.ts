import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/lib/auth';

// Better Auth catch-all — replaces the old Express `app.all('/api/auth/*', ...)`.
// Runs on the Node.js runtime (Vercel default) so the MongoDB driver works.
export const { GET, POST } = toNextJsHandler(auth);
