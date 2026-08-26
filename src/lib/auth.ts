import { betterAuth } from 'better-auth';
import { MongoClient } from 'mongodb';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { APIError, createAuthMiddleware } from 'better-auth/api';

/**
 * Server-side Better Auth instance (never import this file from the client —
 * use `./auth-client` instead). Imported only by the App Router API route
 * `app/api/auth/[...next]/route.ts`.
 *
 * Credentials are injected via environment variables — placeholder values are
 * in `.env` / `.env.example`. Replace them with the real keys:
 *
 *   BETTER_AUTH_SECRET  – secret for signing & encrypting (min 32 chars).
 *                          Generate: `openssl rand -base64 32`
 *   BETTER_AUTH_URL     – canonical public base URL of the app.
 *   MONGODB_URI         – MongoDB Driver connection string (official `mongodb`
 *                          driver). May include the database name, e.g.
 *                          mongodb://user:pass@host:27017/db
 *                          mongodb+srv://...mongodb.net/db
 *   MONGODB_DB_NAME     – optional database-name override.
 */

/** Extract a database name from the connection string when present. */
function databaseNameFromUri(uri: string): string | undefined {
  try {
    const parsed = new URL(uri);
    return parsed.pathname.replace(/^\//, '').split('/')[0] || undefined;
  } catch {
    return undefined;
  }
}

const mongodbUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/sqlens';

/**
 * Shared MongoClient from the official MongoDB driver. The driver connects
 * lazily, so constructing it does not require a live database yet.
 */
export const mongoClient = new MongoClient(mongodbUri, {
  // Fail fast (5s) when the database is unreachable instead of waiting for the
  // driver's default 30s server-selection window — clearer UX during setup.
  serverSelectionTimeoutMS: 5000,
});

const databaseName =
  (process.env.MONGODB_DB_NAME ?? databaseNameFromUri(mongodbUri)) || 'sqlens';

/**
 * The database used by Better Auth. Admin tooling should use this same handle
 * so reads/writes hit the identical collection set as auth does.
 */
export const db = mongoClient.db(databaseName);

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    `http://localhost:${process.env.PORT || 3000}`,
  user: {
    additionalFields: {
      role: {
        type: 'string',
        input: false, // never writable from the client UI
        returned: true, // exposed on the session user object
        defaultValue: 'user',
      },
      status: {
        type: 'string',
        input: false,
        returned: true,
        defaultValue: 'active',
      },
    },
  },
  database: mongodbAdapter(db, {
    client: mongoClient,
    // IMPORTANT: Passing a `client` enables multi-document transactions by
    // default. On a fresh database, Better Auth's first signup/sign-in triggers
    // collection + index creation, which makes MongoDB implicitly commit the
    // session — the adapter then calls abortTransaction() on the committed
    // session and throws "Cannot call abortTransaction after calling
    // commitTransaction" (upstream bug #10925). Transactions are disabled to
    // avoid this; signup/sign-in remain fully functional.
    transaction: false,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  hooks: {
    // Block sign-in at the door for suspended accounts. Existing/live sessions
    // are enforced separately in src/lib/authorize.ts (status check per request)
    // and by the blocked-account screen in the app shell.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/sign-in/email') {
        const email = (
          ctx.body as { email?: string } | undefined
        )?.email?.toLowerCase();
        if (!email) return;
        const user = await db.collection('user').findOne({ email });
        if (user?.status === 'blocked') {
          throw new APIError('FORBIDDEN', { message: 'ACCOUNT_BLOCKED' });
        }
      }
    }),
  },
  advanced: {
    database: { joins: true },
  },
});