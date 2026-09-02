'use client';

import React, { useState } from 'react';
import { Calendar, Clock, ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface OrderDateSample {
  id: number;
  date: string;
  daysAgo: number;
}

const SIMULATED_TODAY = '2026-08-24';

const ORDERS: OrderDateSample[] = [
  { id: 101, date: '2026-08-20', daysAgo: 4 },
  { id: 102, date: '2026-08-10', daysAgo: 14 },
  { id: 103, date: '2026-07-28', daysAgo: 27 },
  { id: 104, date: '2026-07-15', daysAgo: 40 },
  { id: 105, date: '2026-06-01', daysAgo: 84 },
];

export const DateTimelineVisualizer: React.FC = () => {
  const [intervalDays, setIntervalDays] = useState<number>(30);

  return (
    <div className="rounded-xl border border-border bg-surface p-5 text-text my-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-border-soft">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-func font-semibold">
            Mental Model · Temporal Math & Retention Windows
          </span>
          <h3 className="font-display font-semibold text-[17px] text-text mt-0.5">
            Chronological Timeline & Relative Date Intervals
          </h3>
        </div>

        {/* Interval Selector */}
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border text-xs font-mono">
          {[7, 30, 60].map((days) => (
            <button
              key={days}
              onClick={() => setIntervalDays(days)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                intervalDays === days
                  ? 'bg-func text-ink'
                  : 'text-text-dim hover:text-text hover:bg-surface-3'
              }`}
            >
              Last {days} Days
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-text-dim mt-3 leading-relaxed font-sans">
        Never hardcode static dates like <code className="text-error-text">&apos;2026-08-01&apos;</code> in production queries! Instead, measure backward from <code className="text-func font-bold">CURDATE()</code> using dynamic intervals:
      </p>

      {/* Code Banner */}
      <div className="mt-3 p-2.5 rounded bg-surface-2 border border-border font-mono text-xs text-text">
        WHERE order_date &gt;= <span className="text-func font-bold">CURDATE()</span> - <span className="text-func font-bold">INTERVAL {intervalDays} DAY</span>
      </div>

      {/* Timeline Graphic */}
      <div className="mt-4 p-4 rounded-xl bg-surface-2 border border-border font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-border-soft text-[11px]">
          <span className="text-text-dim">Threshold Cutoff: <strong className="text-func">T - {intervalDays} days</strong></span>
          <span className="text-text font-bold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-func" />
            CURDATE() = {SIMULATED_TODAY}
          </span>
        </div>

        <div className="mt-3 space-y-2">
          {ORDERS.map((order) => {
            const isIncluded = order.daysAgo <= intervalDays;
            return (
              <div
                key={order.id}
                className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${
                  isIncluded
                    ? 'bg-success-bg/30 border-success-border text-success-text'
                    : 'bg-surface border-border-soft text-text-faint opacity-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold">Order #{order.id}</span>
                  <span className="text-[11px] text-text-dim">({order.date})</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10.5px]">Placed {order.daysAgo} days ago</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isIncluded ? 'bg-success text-ink' : 'bg-surface-3 text-text-faint'
                  }`}>
                    {isIncluded ? '✔ INCLUDED' : '✖ EXCLUDED'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DateTimelineVisualizer;
