'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AvailabilityMap,
  ModuleAvailability,
  adminListModules,
  adminSetModule,
  AdminApiError,
} from '../../lib/admin-api';
import { ALL_MODULES } from '../../content/curriculum-index';

const MODE_META: Record<
  ModuleAvailability['unlockMode'],
  { label: string; hint: string; badge: string }
> = {
  automatic: {
    label: 'Automatic',
    hint: 'Default 6 PM cycle after the previous day is fully completed.',
    badge: 'bg-surface text-text-dim border-border',
  },
  manual: {
    label: 'Unlocked now',
    hint: 'Open for everyone immediately, regardless of progression.',
    badge: 'bg-surface text-text border-border',
  },
  scheduled: {
    label: 'Scheduled',
    hint: 'Opens for everyone at the scheduled date & time.',
    badge: 'bg-func/10 text-func border-func/30',
  },
  locked: {
    label: 'Locked',
    hint: 'Closed for everyone ‐ even users who finished the previous day.',
    badge: 'bg-error/10 text-error border-error/30',
  },
};

/**
 * Curriculum Control tab ‐ global unlock configuration for all 38 Days.
 * The database is authoritative; this panel only writes config via the
 * admin API (which re-verifies role/status on every request).
 */
export default function ModulesPanel() {
  const [map, setMap] = useState<AvailabilityMap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyDay, setBusyDay] = useState<string | null>(null);
  const [scheduling, setScheduling] = useState<string | null>(null);
  const [scheduleValue, setScheduleValue] = useState('');
  const [days, setDays] = useState<{ id: string; day: number }[]>([]);

  useEffect(() => {
    // Build the module list from the single source of truth: every module in
    // the curriculum (legacy day-NN IDs and semantic-ID modules alike),
    // numbered by its canonical curriculum order (display day).
    setDays(
      ALL_MODULES.map((m) => ({
        id: m.id,
        day: m.day || m.curriculumOrder || 0,
      })).sort((a, b) => a.day - b.day),
    );
    adminListModules()
      .then(setMap)
      .catch((e) =>
        setError(e instanceof AdminApiError && e.status === 403 ? 'forbidden' : 'request_failed'),
      );
  }, []);

  const overrides = useMemo(
    () => (map ? Object.values(map).filter((m) => m.unlockMode !== 'automatic').length : 0),
    [map],
  );

  const apply = async (
    dayId: string,
    payload: { unlockMode: ModuleAvailability['unlockMode']; unlockAt?: string | null },
  ) => {
    setBusyDay(dayId);
    setError(null);
    try {
      const { module: rec } = await adminSetModule(dayId, payload);
      setMap((prev) => ({ ...(prev ?? {}), [dayId]: rec }));
      setScheduling(null);
      setScheduleValue('');
    } catch (e) {
      setError(
        e instanceof AdminApiError
          ? e.code === 'invalid_unlock_at'
            ? 'invalid_datetime'
            : e.code
          : 'request_failed',
      );
    } finally {
      setBusyDay(null);
    }
  };

  if (!map && !error) {
    return <p className="font-mono text-xs text-text-dim animate-pulse py-12 text-center">Loading⬦</p>;
  }

  if (error && !map) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 text-center">
        <p className="font-mono text-xs text-error uppercase tracking-wider">{error}</p>
      </div>
    );
  }

  return (
    <ModulesList
      days={days}
      map={map ?? {}}
      overrides={overrides}
      error={error}
      busyDay={busyDay}
      scheduling={scheduling}
      scheduleValue={scheduleValue}
      onApply={apply}
      onToggleSchedule={(id) => {
        setScheduling(scheduling === id ? null : id);
        setScheduleValue((map?.[id]?.unlockAt ?? '').slice(0, 16));
      }}
      onScheduleChange={setScheduleValue}
      onCancelSchedule={() => setScheduling(null)}
    />
  );
}

interface ModulesListProps {
  days: { id: string; day: number }[];
  map: AvailabilityMap;
  overrides: number;
  error: string | null;
  busyDay: string | null;
  scheduling: string | null;
  scheduleValue: string;
  onApply: (
    dayId: string,
    payload: { unlockMode: ModuleAvailability['unlockMode']; unlockAt?: string | null },
  ) => Promise<void>;
  onToggleSchedule: (dayId: string) => void;
  onScheduleChange: (value: string) => void;
  onCancelSchedule: () => void;
}

function ModulesList({
  days,
  map,
  overrides,
  error,
  busyDay,
  scheduling,
  scheduleValue,
  onApply,
  onToggleSchedule,
  onScheduleChange,
  onCancelSchedule,
}: ModulesListProps) {
  return (
    <div className="space-y-4">
      {/* Header / legend */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-lg text-text">Curriculum Control</h2>
          <p className="font-mono text-[11px] text-text-dim mt-0.5">
            Global module availability · {overrides} override{overrides === 1 ? '' : 's'} active
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(MODE_META) as ModuleAvailability['unlockMode'][]).map((m) => (
            <span
              key={m}
              className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${MODE_META[m].badge}`}
            >
              {MODE_META[m].label}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <p className="font-mono text-[11px] text-error bg-error/10 border border-error/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Module rows */}
      <ModuleRows
        days={days}
        map={map}
        busyDay={busyDay}
        scheduling={scheduling}
        scheduleValue={scheduleValue}
        onApply={onApply}
        onToggleSchedule={onToggleSchedule}
        onScheduleChange={onScheduleChange}
        onCancelSchedule={onCancelSchedule}
      />
    </div>
  );
}

interface ModuleRowsProps {
  days: { id: string; day: number }[];
  map: AvailabilityMap;
  busyDay: string | null;
  scheduling: string | null;
  scheduleValue: string;
  onApply: ModulesListProps['onApply'];
  onToggleSchedule: (dayId: string) => void;
  onScheduleChange: (value: string) => void;
  onCancelSchedule: () => void;
}

function ModuleRows({
  days,
  map,
  busyDay,
  scheduling,
  scheduleValue,
  onApply,
  onToggleSchedule,
  onScheduleChange,
  onCancelSchedule,
}: ModuleRowsProps) {
  return (
    <div className="space-y-2">
      {days.map(({ id, day }) => {
        const rec = map[id];
        const mode: ModuleAvailability['unlockMode'] = rec?.unlockMode ?? 'automatic';
        const meta = MODE_META[mode];
        const isBusy = busyDay === id;

        return (
          <div
            key={id}
            className={`bg-surface border rounded-xl px-4 py-3 transition ${
              mode === 'locked'
                ? 'border-error/30'
                : mode === 'manual' || mode === 'scheduled'
                  ? 'border-func/25'
                  : 'border-border'
            }`}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="font-mono text-xs text-text-faint w-14 shrink-0">
                DAY {String(day).padStart(2, '0')}
              </span>

              <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${meta.badge}`}>
                {meta.label}
              </span>

              {mode === 'scheduled' && rec?.unlockAt && (
                <span className="font-mono text-[11px] text-func">
                  ⅎ {new Date(rec.unlockAt).toLocaleString()}
                </span>
              )}

              <div className="ml-auto flex flex-wrap items-center gap-1.5">
                {mode !== 'automatic' && (
                  <button
                    disabled={isBusy}
                    onClick={() => void onApply(id, { unlockMode: 'automatic' })}
                    className="font-mono text-[11px] px-2.5 py-1 rounded-lg border border-border text-text-dim hover:text-text hover:border-text-dim disabled:opacity-40 transition"
                  >
                    Reset
                  </button>
                )}

                {mode !== 'manual' && (
                  <button
                    disabled={isBusy}
                    onClick={() => void onApply(id, { unlockMode: 'manual' })}
                    className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-surface-2 text-text border border-border hover:bg-surface-3 disabled:opacity-40 transition"
                  >
                    Unlock now
                  </button>
                )}

                {mode !== 'scheduled' && (
                  <button
                    disabled={isBusy}
                    onClick={() => onToggleSchedule(id)}
                    className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-func/10 text-func border border-func/30 hover:bg-func/20 disabled:opacity-40 transition"
                  >
                    Schedule
                  </button>
                )}

                {mode !== 'locked' && (
                  <button
                    disabled={isBusy}
                    onClick={() => void onApply(id, { unlockMode: 'locked' })}
                    className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-error/10 text-error border border-error/30 hover:bg-error/20 disabled:opacity-40 transition"
                  >
                    Lock
                  </button>
                )}
              </div>
            </div>

            {/* Schedule input row */}
            {scheduling === id && (
              <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center gap-2">
                <input
                  type="datetime-local"
                  value={scheduleValue}
                  onChange={(e) => onScheduleChange(e.target.value)}
                  className="bg-ink border border-border rounded-lg px-3 py-1.5 font-mono text-xs text-text focus:outline-none focus:border-func/60 [color-scheme:dark]"
                />
                <button
                  disabled={busyDay === id || !scheduleValue}
                  onClick={() => {
                    const dt = new Date(scheduleValue);
                    if (isNaN(dt.getTime())) return;
                    void onApply(id, { unlockMode: 'scheduled', unlockAt: dt.toISOString() });
                  }}
                  className="font-mono text-[11px] px-3 py-1.5 rounded-lg bg-func text-ink font-bold disabled:opacity-40 hover:brightness-110 transition"
                >
                  Save schedule
                </button>
                <button
                  onClick={onCancelSchedule}
                  className="font-mono text-[11px] px-2.5 py-1.5 text-text-dim hover:text-text transition"
                >
                  Cancel
                </button>
                <span className="font-mono text-[10px] text-text-faint">
                  Shown in your local timezone; stored as UTC.
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
