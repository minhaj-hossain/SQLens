'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Activity, AlertTriangle, Clock, RefreshCw, Trash2, Zap } from 'lucide-react';
import {
  PrefixStats,
  SuggestEvent,
  clearSuggestEvents,
  missedPrefixes,
  readSuggestEvents,
  slowestPasses,
  summarizeSuggestEvents,
} from '@/lib/suggest-telemetry';

/** Accept-rate tone: green = the list worked, amber = mixed, red = it missed. */
function rateTone(rate: number): string {
  if (rate >= 0.6) return 'text-emerald-400';
  if (rate >= 0.25) return 'text-amber-400';
  return 'text-rose-400';
}

function pct(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

function ms(value: number | null): string {
  return value === null ? '—' : `${value} ms`;
}

/**
 * Local suggestion telemetry viewer (Batch 5, item 2).
 *
 * Reads the ring buffer the editor writes to localStorage — no backend, so this
 * reflects the browser it is viewed from. Answers the two questions that used to
 * be guesswork: which prefixes does the engine offer but nobody accept, and
 * which passes are too slow.
 */
export default function AdminSuggestTelemetryPanel() {
  const [events, setEvents] = useState<SuggestEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setEvents(readSuggestEvents());
    setLoading(false);
  }, []);

  useEffect(refresh, [refresh]);

  const stats: PrefixStats[] = summarizeSuggestEvents(events);
  const missed = missedPrefixes(events);
  const slowest = slowestPasses(events);

  const shownCount = events.filter((e) => e.kind === 'shown').length;
  const acceptedCount = events.filter((e) => e.kind === 'accepted').length;
  const dismissedCount = events.filter((e) => e.kind === 'dismissed').length;
  const overallRate = shownCount > 0 ? acceptedCount / shownCount : 0;
  const worstP95 = slowest[0]?.passP95 ?? null;

  const handleClear = () => {
    clearSuggestEvents();
    refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-text">
            Suggestion Telemetry
          </h2>
          <p className="text-xs sm:text-sm text-text-dim mt-1">
            Local-only ring buffer ({events.length} events) recording which prefixes the
            editor offered, which ones were accepted, and how long each pass took. Never
            leaves this browser.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-text-dim hover:text-text text-xs font-mono transition cursor-pointer"
            title="Re-read the ring buffer"
          >
            <RefreshCw size={12} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={events.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-text-dim hover:text-rose-300 text-xs font-mono transition cursor-pointer disabled:opacity-40"
            title="Erase the ring buffer"
          >
            <Trash2 size={12} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-text-dim font-mono text-xs">Reading ring buffer…</p>
      ) : events.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-6 text-center">
          <Activity size={18} className="mx-auto text-text-faint mb-2" />
          <p className="text-text-dim font-mono text-xs">
            No suggestion activity recorded in this browser yet. Open any editor, type a few
            characters and accept or escape a suggestion.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatTile label="Shown" value={String(shownCount)} icon={<Activity size={12} />} />
            <StatTile
              label="Accept rate"
              value={pct(overallRate)}
              tone={rateTone(overallRate)}
              icon={<Zap size={12} />}
            />
            <StatTile
              label="Dismissed"
              value={String(dismissedCount)}
              icon={<AlertTriangle size={12} />}
            />
            <StatTile
              label="Slowest p95"
              value={ms(worstP95)}
              tone={worstP95 !== null && worstP95 > 16 ? 'text-amber-400' : undefined}
              icon={<Clock size={12} />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <InsightCard
              title="Offered but never accepted"
              hint="Shown at least twice with zero accepts — the engine is guessing wrong here."
              rows={missed.map((s) => ({
                key: s.prefix,
                label: s.prefix,
                value: `${s.shown} shown · ${s.ignored + s.dismissed} ignored`,
                tone: 'text-rose-400',
              }))}
              empty="Nothing systemic — every repeated prefix got accepted at least once."
            />
            <InsightCard
              title="Slowest suggestion passes"
              hint="Time to build the pool and measure the caret. Over 16 ms risks a dropped frame."
              rows={slowest.map((s) => ({
                key: s.prefix,
                label: s.prefix,
                value: `p50 ${ms(s.passP50)} · p95 ${ms(s.passP95)}`,
              }))}
              empty="No passes recorded."
            />
          </div>

          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-surface-2 border-b border-border-soft font-mono text-[11px] uppercase tracking-wider text-text-dim">
              Per-prefix breakdown
            </div>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="text-text-faint text-[10px] uppercase tracking-wider">
                    <th className="text-left px-4 py-2 font-semibold">Prefix</th>
                    <th className="text-right px-3 py-2 font-semibold">Shown</th>
                    <th className="text-right px-3 py-2 font-semibold">Accepted</th>
                    <th className="text-right px-3 py-2 font-semibold">Dismissed</th>
                    <th className="text-right px-3 py-2 font-semibold">Ignored</th>
                    <th className="text-right px-3 py-2 font-semibold">Rate</th>
                    <th className="text-right px-3 py-2 font-semibold">Pass p50</th>
                    <th className="text-right px-3 py-2 font-semibold">Pass p95</th>
                    <th className="text-right px-4 py-2 font-semibold">Decide p50</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((s) => (
                    <tr key={s.prefix} className="border-t border-border-soft/60">
                      <td className="text-left px-4 py-1.5 text-text font-semibold">
                        {s.prefix || '(none)'}
                      </td>
                      <td className="text-right px-3 py-1.5 text-text-dim">{s.shown}</td>
                      <td className="text-right px-3 py-1.5 text-text-dim">{s.accepted}</td>
                      <td className="text-right px-3 py-1.5 text-text-dim">{s.dismissed}</td>
                      <td className="text-right px-3 py-1.5 text-text-dim">{s.ignored}</td>
                      <td
                        className={`text-right px-3 py-1.5 font-semibold ${rateTone(s.acceptRate)}`}
                      >
                        {s.shown > 0 ? pct(s.acceptRate) : '—'}
                      </td>
                      <td className="text-right px-3 py-1.5 text-text-dim">{ms(s.passP50)}</td>
                      <td className="text-right px-3 py-1.5 text-text-dim">{ms(s.passP95)}</td>
                      <td className="text-right px-4 py-1.5 text-text-dim">{ms(s.decideP50)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-surface-2 border-b border-border-soft font-mono text-[11px] uppercase tracking-wider text-text-dim">
              Latest events (newest first)
            </div>
            <ul className="max-h-[260px] overflow-y-auto autosuggest-scrollbar divide-y divide-border-soft/60">
              {events.slice(0, 40).map((e, i) => (
                <li
                  key={`${e.t}-${i}`}
                  className="px-4 py-1.5 flex items-center gap-3 font-mono text-[11px]"
                >
                  <span
                    className={`shrink-0 w-16 font-semibold ${
                      e.kind === 'accepted'
                        ? 'text-emerald-400'
                        : e.kind === 'dismissed'
                          ? 'text-rose-400'
                          : 'text-text-faint'
                    }`}
                  >
                    {e.kind}
                  </span>
                  <span className="text-text font-semibold w-24 truncate">
                    {e.prefix || '(none)'}
                  </span>
                  <span className="text-text-dim truncate flex-1">{e.text ?? e.ctx ?? ''}</span>
                  <span className="text-text-faint shrink-0">
                    {e.passMs !== undefined ? `pass ${e.passMs}ms` : ''}
                    {e.decisionMs !== undefined ? ` · ${e.decisionMs}ms` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </motion.div>
  );
}

function StatTile({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-text-faint font-mono">
        {icon}
        {label}
      </div>
      <p className={`font-display text-lg font-bold mt-1 ${tone ?? 'text-text'}`}>{value}</p>
    </div>
  );
}

function InsightCard({
  title,
  hint,
  rows,
  empty,
}: {
  title: string;
  hint: string;
  rows: { key: string; label: string; value: string; tone?: string }[];
  empty: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <p className="font-mono text-[11px] uppercase tracking-wider text-text-dim">{title}</p>
      <p className="text-[11px] text-text-faint mt-1 leading-snug">{hint}</p>
      {rows.length === 0 ? (
        <p className="text-emerald-400/80 font-mono text-[11px] mt-3">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {rows.map((r) => (
            <li
              key={r.key}
              className="flex items-center justify-between gap-3 font-mono text-[11px]"
            >
              <span className={`font-semibold ${r.tone ?? 'text-text'}`}>{r.label || '(none)'}</span>
              <span className="text-text-dim shrink-0">{r.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
