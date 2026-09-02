import 'server-only';
import { db } from '@/lib/auth';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'maintenance' | 'success';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const col = () => db.collection('announcements');

export async function listAnnouncements(): Promise<Announcement[]> {
  const docs = await col().find({}).sort({ createdAt: -1 }).toArray();
  return docs.map((d) => ({
    id: String(d._id ?? d.id),
    title: String(d.title || ''),
    message: String(d.message || ''),
    severity: (d.severity || 'info') as Announcement['severity'],
    active: Boolean(d.active),
    createdAt: String(d.createdAt || new Date().toISOString()),
    updatedAt: String(d.updatedAt || new Date().toISOString()),
  }));
}

export async function getActiveAnnouncement(): Promise<Announcement | null> {
  const doc = await col().findOne({ active: true }, { sort: { updatedAt: -1 } });
  if (!doc) return null;
  return {
    id: String(doc._id ?? doc.id),
    title: String(doc.title || ''),
    message: String(doc.message || ''),
    severity: (doc.severity || 'info') as Announcement['severity'],
    active: true,
    createdAt: String(doc.createdAt || new Date().toISOString()),
    updatedAt: String(doc.updatedAt || new Date().toISOString()),
  };
}

export async function createAnnouncement(payload: {
  title: string;
  message: string;
  severity: Announcement['severity'];
  active?: boolean;
}): Promise<Announcement> {
  const now = new Date().toISOString();
  // If activating this one, deactivate all others so only one is active at a time
  if (payload.active) {
    await col().updateMany({}, { $set: { active: false, updatedAt: now } });
  }

  const res = await col().insertOne({
    title: payload.title.trim(),
    message: payload.message.trim(),
    severity: payload.severity || 'info',
    active: Boolean(payload.active),
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: String(res.insertedId),
    title: payload.title.trim(),
    message: payload.message.trim(),
    severity: payload.severity,
    active: Boolean(payload.active),
    createdAt: now,
    updatedAt: now,
  };
}

export async function toggleAnnouncementActive(id: string, active: boolean): Promise<void> {
  const { ObjectId } = await import('mongodb');
  const now = new Date().toISOString();
  let query: Record<string, any> = { _id: id };
  try {
    query = { _id: new ObjectId(id) };
  } catch {
    query = { id };
  }

  if (active) {
    // Deactivate all others first
    await col().updateMany({}, { $set: { active: false, updatedAt: now } });
  }

  await col().updateOne(query, { $set: { active, updatedAt: now } });
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const { ObjectId } = await import('mongodb');
  let query: Record<string, any> = { _id: id };
  try {
    query = { _id: new ObjectId(id) };
  } catch {
    query = { id };
  }
  await col().deleteOne(query);
}
