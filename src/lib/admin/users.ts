import 'server-only';
import { ObjectId } from 'mongodb';
import { db } from '@/lib/auth';

/**
 * Server-side user management for admins. Never import from the client.
 *
 * Reads/writes the Better Auth `user` collection inside the same database
 * (`db`, from `MONGODB_DB_NAME`) that auth itself uses — never the URI's
 * default db. `requireAdmin` (server-side) has already verified the caller is
 * an active admin, so these helpers are never reachable from the browser.
 *
 * Note: Better Auth stores Mongo user ids as ObjectId `_id` and exposes them to
 * the session as hex strings — we translate between the two here.
 */

export interface AdminUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'blocked' | 'deleted';
  createdAt?: unknown;
  updatedAt?: unknown;
  [k: string]: unknown;
}

const usersCol = () => db.collection('user');

function toObjectId(id: string): ObjectId | null {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

function mapUser(doc: Record<string, any>): AdminUser {
  const id = String(doc._id ?? doc.id);
  return {
    id,
    name: doc.name ?? null,
    email: doc.email ?? null,
    role: doc.role === 'admin' ? 'admin' : 'user',
    status:
      doc.status === 'blocked'
        ? 'blocked'
        : doc.status === 'deleted'
          ? 'deleted'
          : 'active',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/** List users with pagination (newest first). */
export async function listUsers({
  limit = 50,
  offset = 0,
} = {}): Promise<{ users: AdminUser[]; total: number }> {
  const col = usersCol();
  const [rows, total] = await Promise.all([
    col
      .find({})
      .sort({ createdAt: -1 })
      .skip(Math.max(0, offset))
      .limit(Math.max(1, limit))
      .toArray(),
    col.countDocuments({}),
  ]);
  return { users: rows.map(mapUser), total };
}

/** Fetch a single user by id. */
export async function getUserById(id: string): Promise<AdminUser | null> {
  const oid = toObjectId(id);
  if (!oid) return null;
  const doc = await usersCol().findOne({ _id: oid });
  return doc ? mapUser(doc) : null;
}

/** Block / unblock a user (server-sanitised status write). */
export async function setUserStatus(
  id: string,
  status: 'active' | 'blocked',
): Promise<AdminUser | null> {
  const oid = toObjectId(id);
  if (!oid) return null;
  const doc = await usersCol().findOneAndUpdate(
    { _id: oid },
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: 'after' },
  );
  return doc ? mapUser(doc) : null;
}

/** Permanently remove a user across user/session/account collections. */
export async function removeUser(id: string): Promise<boolean> {
  const oid = toObjectId(id);
  if (!oid) return false;
  await db.collection('session').deleteMany({ userId: String(id) });
  await db.collection('account').deleteMany({ userId: String(id) });
  const res = await usersCol().deleteOne({ _id: oid });
  return (res.deletedCount ?? 0) > 0;
}