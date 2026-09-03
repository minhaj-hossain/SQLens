'use client';

import React, { useState } from 'react';
import { Columns, ArrowDown, Info } from 'lucide-react';

interface ScoreRecord {
  department: string;
  name: string;
  score: number;
  rowNumber: number;
  rank: number;
  denseRank: number;
  lagScore: number | null;
}

const DATA: ScoreRecord[] = [
  // Engineering Department (has a tie at score 95!)
  { department: 'Engineering', name: 'Alex', score: 98, rowNumber: 1, rank: 1, denseRank: 1, lagScore: null },
  { department: 'Engineering', name: 'Blake', score: 95, rowNumber: 2, rank: 2, denseRank: 2, lagScore: 98 },
  { department: 'Engineering', name: 'Chris', score: 95, rowNumber: 3, rank: 2, denseRank: 2, lagScore: 95 },
  { department: 'Engineering', name: 'Dana', score: 88, rowNumber: 4, rank: 4, denseRank: 3, lagScore: 95 },
  // Sales Department (window resets!)
  { department: 'Sales', name: 'Evan', score: 92, rowNumber: 1, rank: 1, denseRank: 1, lagScore: null },
  { department: 'Sales', name: 'Fiona', score: 85, rowNumber: 2, rank: 2, denseRank: 2, lagScore: 92 },
];

export const WindowFrameVisualizer: React.FC = () => {
  const [activeDepartment, setActiveDepartment] = useState<'ALL' | 'Engineering' | 'Sales'>('ALL');

  const filteredData = activeDepartment === 'ALL'
    ? DATA
    : DATA.filter((d) => d.department === activeDepartment);

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-5 text-text my-4 sm:my-5 shadow-sm w-full min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b border-border-soft min-w-0">
        <div className="min-w-0">
          <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-wider text-func font-semibold">
            Mental Model · Analytical Window Functions
          </span>
          <h3 className="font-display font-semibold text-[15px] sm:text-[17px] text-text mt-0.5">
            Sliding Window Framing & Partition Boundaries
          </h3>
        </div>

        {/* Partition Filter Buttons */}
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border text-xs font-mono">
          {(['ALL', 'Engineering', 'Sales'] as const).map((dept) => (
            <button
              key={dept}
              onClick={() => setActiveDepartment(dept)}
              className={`px-2 sm:px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-semibold transition cursor-pointer ${
                activeDepartment === dept
                  ? 'bg-func text-ink'
                  : 'text-text-dim hover:text-text hover:bg-surface-3'
              }`}
            >
              {dept === 'ALL' ? 'Both Partitions' : dept}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-text-dim mt-3 leading-relaxed">
        <strong className="text-text">Unlike GROUP BY, window functions do NOT collapse rows into summaries.</strong> Each row stays intact while computing running totals, peer ranking, or lookback metrics across an analytical frame.
      </p>

      {/* Interactive Table Grid */}
      <div className="mt-4 rounded-lg border border-border overflow-hidden bg-surface-2 w-full min-w-0">
        <div className="overflow-x-auto w-full min-w-0 scrollbar-thin">
          <table className="w-full text-left font-mono text-xs border-collapse min-w-[560px]">
            <thead className="bg-surface text-[10.5px] uppercase tracking-wider text-text-faint border-b border-border">
              <tr>
                <th className="p-2.5 border-r border-border-soft">PARTITION (dept)</th>
                <th className="p-2.5 border-r border-border-soft">Name</th>
                <th className="p-2.5 border-r border-border-soft text-right">Score</th>
                <th className="p-2.5 border-r border-border-soft text-center bg-func/5 text-func">ROW_NUMBER()</th>
                <th className="p-2.5 border-r border-border-soft text-center bg-func/5 text-func">RANK()</th>
                <th className="p-2.5 border-r border-border-soft text-center bg-func/5 text-func">DENSE_RANK()</th>
                <th className="p-2.5 text-right text-text-dim">LAG(score)</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => {
                const isFirstInPartition = idx === 0 || filteredData[idx - 1].department !== row.department;
                const isTie = row.name === 'Blake' || row.name === 'Chris';

                return (
                  <tr
                    key={row.name}
                    className={`border-b border-border-soft last:border-b-0 hover:bg-surface-3/60 transition-colors ${
                      isFirstInPartition && idx > 0 ? 'border-t-2 border-t-func/40' : ''
                    } ${isTie ? 'bg-func/10' : ''}`}
                  >
                    <td className="p-2.5 border-r border-border-soft font-semibold text-text">
                      {isFirstInPartition ? (
                        <span className="inline-flex items-center gap-1.5 text-func">
                          <Columns className="w-3.5 h-3.5" />
                          {row.department}
                        </span>
                      ) : (
                        <span className="text-text-faint opacity-40">↳ {row.department}</span>
                      )}
                    </td>
                    <td className="p-2.5 border-r border-border-soft font-medium text-text">{row.name}</td>
                    <td className="p-2.5 border-r border-border-soft text-right font-bold text-text">{row.score}</td>
                    <td className="p-2.5 border-r border-border-soft text-center text-text-dim">{row.rowNumber}</td>
                    <td className={`p-2.5 border-r border-border-soft text-center font-bold ${isTie ? 'text-func' : 'text-text'}`}>
                      {row.rank}
                    </td>
                    <td className={`p-2.5 border-r border-border-soft text-center font-bold ${isTie ? 'text-func' : 'text-text'}`}>
                      {row.denseRank}
                    </td>
                    <td className="p-2.5 text-right text-text-dim">
                      {row.lagScore !== null ? (
                        <span className="text-text-dim">{row.lagScore} (prev)</span>
                      ) : (
                        <span className="text-text-faint italic">NULL</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tie-Handling Rule Callout */}
      <div className="mt-4 p-3 rounded-lg bg-surface-2 border border-border-soft flex items-start gap-2 text-xs">
        <Info className="w-4 h-4 text-func shrink-0 mt-0.5" />
        <div className="text-text-dim leading-relaxed">
          <strong className="text-text">Notice the Tie at Score 95 (Blake & Chris):</strong>
          <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11.5px]">
            <li><code className="text-func font-bold">ROW_NUMBER()</code> assigns 2 and 3 sequentially (strictly increments, no ties).</li>
            <li><code className="text-func font-bold">RANK()</code> assigns 2 and 2, but skips to <strong>4</strong> for Dana (gap after tie).</li>
            <li><code className="text-func font-bold">DENSE_RANK()</code> assigns 2 and 2, then gives <strong>3</strong> to Dana (no gap).</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WindowFrameVisualizer;
