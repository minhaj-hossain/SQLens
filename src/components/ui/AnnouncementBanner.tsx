'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, Info, Wrench, CheckCircle, X } from 'lucide-react';

interface ActiveAnnouncement {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'maintenance' | 'success';
}

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<ActiveAnnouncement | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    fetch('/api/announcements/active')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.announcement) {
          const item = data.announcement as ActiveAnnouncement;
          const isDismissed =
            typeof window !== 'undefined' &&
            localStorage.getItem(`sqlens_announcement_${item.id}`) === 'dismissed';
          if (!isDismissed) {
            setAnnouncement(item);
            setDismissed(false);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleDismiss = () => {
    if (announcement) {
      localStorage.setItem(`sqlens_announcement_${announcement.id}`, 'dismissed');
      setDismissed(true);
    }
  };

  if (!announcement || dismissed) return null;

  const styleMap = {
    info: 'bg-func/10 border-func/30 text-func',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    maintenance: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  };

  const IconComponent = () => {
    switch (announcement.severity) {
      case 'warning':
        return <AlertCircle size={15} className="shrink-0 text-amber-400" />;
      case 'maintenance':
        return <Wrench size={15} className="shrink-0 text-rose-400" />;
      case 'success':
        return <CheckCircle size={15} className="shrink-0 text-emerald-400" />;
      default:
        return <Info size={15} className="shrink-0 text-func" />;
    }
  };

  return (
    <div
      className={`w-full border-b px-4 py-2.5 flex items-center justify-between gap-3 text-xs ${
        styleMap[announcement.severity] || styleMap.info
      }`}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <IconComponent />
          <p className="truncate">
            <strong className="font-semibold">{announcement.title}:</strong>{' '}
            <span className="opacity-90">{announcement.message}</span>
          </p>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1 text-text-dim hover:text-text transition cursor-pointer shrink-0"
          title="Dismiss announcement"
          aria-label="Dismiss announcement"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
