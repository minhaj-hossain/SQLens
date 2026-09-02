'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  adminListAnnouncements,
  adminCreateAnnouncement,
  adminToggleAnnouncement,
  adminDeleteAnnouncement,
  AdminAnnouncement,
} from '@/lib/admin-api';
import { Megaphone, Trash2, Plus, AlertCircle, Info, Wrench, CheckCircle } from 'lucide-react';

export default function AdminAnnouncementsPanel() {
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AdminAnnouncement['severity']>('info');
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    setLoading(true);
    adminListAnnouncements()
      .then((res) => {
        setAnnouncements(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load announcements');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      await adminCreateAnnouncement({
        title: title.trim(),
        message: message.trim(),
        severity,
        active,
      });
      setTitle('');
      setMessage('');
      setShowCreate(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await adminToggleAnnouncement(id, !currentActive);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await adminDeleteAnnouncement(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete announcement');
    }
  };

  const severityIcon = (sev: AdminAnnouncement['severity']) => {
    switch (sev) {
      case 'warning':
        return <AlertCircle size={14} className="text-amber-400" />;
      case 'maintenance':
        return <Wrench size={14} className="text-rose-400" />;
      case 'success':
        return <CheckCircle size={14} className="text-emerald-400" />;
      default:
        return <Info size={14} className="text-func" />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-text">Broadcast Announcements</h2>
          <p className="text-xs sm:text-sm text-text-dim mt-1">
            Publish sitewide alerts, maintenance windows, and curriculum updates visible to all learners.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-func text-ink hover:bg-func-hover font-mono text-xs font-semibold transition cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>{showCreate ? 'Cancel' : 'New Broadcast'}</span>
        </button>
      </div>

      {/* Creation Modal / Inline Box */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-surface border border-func/40 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-func font-mono text-xs font-semibold">
            <Megaphone size={15} />
            <span>Compose Announcement</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-mono text-[11px] text-text-dim mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Scheduled Maintenance or New Phase 6 Unlocked"
                required
                className="w-full bg-surface-2 border border-border px-3 py-2 rounded-lg text-sm text-text outline-none focus:border-func transition"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] text-text-dim mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AdminAnnouncement['severity'])}
                className="w-full bg-surface-2 border border-border px-3 py-2 rounded-lg text-sm text-text outline-none focus:border-func transition font-mono"
              >
                <option value="info">Info (Blue/Gold)</option>
                <option value="warning">Warning (Amber)</option>
                <option value="maintenance">Maintenance (Rose)</option>
                <option value="success">Success (Emerald)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] text-text-dim mb-1">Message Content</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Announcement text that will be displayed across the app..."
              rows={3}
              required
              className="w-full bg-surface-2 border border-border px-3 py-2 rounded-lg text-sm text-text outline-none focus:border-func transition resize-y"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-text">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded accent-func"
              />
              <span>Activate Immediately (Broadcast to all learners)</span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-func text-ink hover:bg-func-hover font-mono text-xs font-semibold transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-surface-2 border-b border-border-soft flex items-center justify-between font-mono text-xs text-text-dim">
          <span>All Broadcasts ({announcements.length})</span>
          <span>Status</span>
        </div>

        {loading ? (
          <p className="p-8 text-center font-mono text-xs text-text-dim animate-pulse">Loading announcements...</p>
        ) : error ? (
          <p className="p-8 text-center font-mono text-xs text-error">{error}</p>
        ) : announcements.length === 0 ? (
          <p className="p-8 text-center font-mono text-xs text-text-dim">No announcements created yet.</p>
        ) : (
          <ul className="divide-y divide-border-soft">
            {announcements.map((item) => (
              <li key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    {severityIcon(item.severity)}
                    <span className="font-semibold text-sm text-text">{item.title}</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-border bg-surface-2 text-text-dim">
                      {item.severity}
                    </span>
                    {item.active && (
                      <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Live on App
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-dim leading-relaxed">{item.message}</p>
                  <p className="font-mono text-[10px] text-text-faint">
                    Created: {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleToggle(item.id, item.active)}
                    className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                      item.active
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                        : 'bg-func/10 text-func border-func/30 hover:bg-func/20'
                    }`}
                  >
                    {item.active ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-text-faint hover:text-rose-400 transition cursor-pointer"
                    title="Delete announcement"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
