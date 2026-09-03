'use client';

import React, { useState } from 'react';
import { Database, Filter, Layers, CheckSquare, Eye, ArrowUpDown, Scissors, Info } from 'lucide-react';

interface StageInfo {
  id: string;
  name: string;
  clause: string;
  order: number;
  icon: React.ReactNode;
  purpose: string;
  dataState: string;
  cardinality: string;
  gotcha: string;
}

const STAGES: StageInfo[] = [
  {
    id: 'from',
    name: 'Source & JOINs',
    clause: 'FROM / JOIN',
    order: 1,
    icon: <Database className="w-4 h-4 text-func" />,
    purpose: 'Identifies working tables, evaluates cartesian products, and applies ON join predicates.',
    dataState: 'Loads raw rows from disk into memory. Virtual working table initialized.',
    cardinality: '100 rows loaded',
    gotcha: 'The database cannot filter rows until it first establishes which tables exist.',
  },
  {
    id: 'where',
    name: 'Row Filtering',
    clause: 'WHERE',
    order: 2,
    icon: <Filter className="w-4 h-4 text-func" />,
    purpose: 'Evaluates row-by-row Boolean conditions. Discards false/unknown rows before aggregation.',
    dataState: 'Prunes non-matching rows. Only surviving records proceed.',
    cardinality: '40 rows survive',
    gotcha: 'Aliases created in SELECT do not exist yet! You cannot write WHERE total_price > 100.',
  },
  {
    id: 'group_by',
    name: 'Partition Buckets',
    clause: 'GROUP BY',
    order: 3,
    icon: <Layers className="w-4 h-4 text-func" />,
    purpose: 'Collapses surviving rows into partitioned groups sharing identical key values.',
    dataState: 'Individual rows condense into distinct category buckets.',
    cardinality: '6 group buckets formed',
    gotcha: 'Any un-aggregated column not in GROUP BY is illegal because the engine cannot guess which value to show.',
  },
  {
    id: 'having',
    name: 'Group Filtering',
    clause: 'HAVING',
    order: 4,
    icon: <CheckSquare className="w-4 h-4 text-func" />,
    purpose: 'Filters grouped buckets using aggregate conditions (e.g. COUNT(*) > 5).',
    dataState: 'Discards entire group buckets that fail summary thresholds.',
    cardinality: '4 group buckets survive',
    gotcha: 'WHERE filters individual records; HAVING filters aggregated groups.',
  },
  {
    id: 'select',
    name: 'Projection & Aliases',
    clause: 'SELECT',
    order: 5,
    icon: <Eye className="w-4 h-4 text-func" />,
    purpose: 'Picks requested columns, evaluates scalar expressions, calculates window functions, and assigns aliases.',
    dataState: 'Final output shape and expressions computed.',
    cardinality: '4 projected rows',
    gotcha: 'Only now are aliases like AS profit born and registered in memory.',
  },
  {
    id: 'order_by',
    name: 'Sorting',
    clause: 'ORDER BY',
    order: 6,
    icon: <ArrowUpDown className="w-4 h-4 text-func" />,
    purpose: 'Orders the projected rows in ASC or DESC sequence based on specified keys.',
    dataState: 'Rows sorted in memory. Can now safely reference SELECT aliases.',
    cardinality: '4 sorted rows',
    gotcha: 'ORDER BY executes after SELECT, which is why sorting by SELECT aliases is valid.',
  },
  {
    id: 'limit',
    name: 'Pagination Cap',
    clause: 'LIMIT / OFFSET',
    order: 7,
    icon: <Scissors className="w-4 h-4 text-func" />,
    purpose: 'Slices the final sorted row array to the specified count and offset.',
    dataState: 'Final viewport sliced for consumer/frontend display.',
    cardinality: '2 rows returned',
    gotcha: 'LIMIT is the absolute last step. It never speeds up upstream GROUP BY or JOIN calculations.',
  },
];

export const ExecutionPipelineVisualizer: React.FC = () => {
  const [activeStageId, setActiveStageId] = useState<string>('where');

  const activeStage = STAGES.find((s) => s.id === activeStageId) || STAGES[1];

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-5 text-text my-4 sm:my-5 shadow-sm w-full min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b border-border-soft min-w-0">
        <div>
          <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-wider text-func font-semibold">
            Mental Model · Query Execution Engine
          </span>
          <h3 className="font-display font-semibold text-[15px] sm:text-[17px] text-text mt-0.5">
            The 7-Stage SQL Execution Lifecycle
          </h3>
        </div>
        <div className="font-mono text-[11px] text-text-dim px-2.5 py-1 rounded-full bg-surface-2 border border-border">
          Interactive Pipeline
        </div>
      </div>

      <p className="text-xs text-text-dim mt-3 leading-relaxed">
        Unlike procedural code that runs top-to-bottom, SQL queries are processed by the query planner in a strict logical order. Click any stage to inspect what happens in engine memory:
      </p>

      {/* Pipeline Stepper Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mt-4">
        {STAGES.map((stage) => {
          const isSelected = stage.id === activeStageId;
          return (
            <button
              key={stage.id}
              onClick={() => setActiveStageId(stage.id)}
              className={`flex flex-col items-center text-center p-2.5 rounded-lg border transition-all cursor-pointer text-left ${
                isSelected
                  ? 'bg-surface-2 border-func shadow-[0_0_10px_var(--accent-dim)]'
                  : 'bg-surface-2/60 border-border hover:border-border-strong hover:bg-surface-2'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center font-mono text-[9.5px] font-bold ${
                  isSelected ? 'bg-func text-ink' : 'bg-surface-3 text-text-dim'
                }`}>
                  {stage.order}
                </span>
                {stage.icon}
              </div>
              <span className={`font-mono text-[11px] font-bold truncate w-full ${isSelected ? 'text-text' : 'text-text-dim'}`}>
                {stage.clause}
              </span>
              <span className="text-[10px] text-text-faint truncate w-full mt-0.5">
                {stage.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Stage Inspector Card */}
      <div className="mt-4 rounded-lg bg-surface-2 border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border-soft">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-func text-ink flex items-center justify-center font-mono text-[11px] font-bold">
              {activeStage.order}
            </span>
            <span className="font-mono text-[13px] font-bold text-text">
              Step {activeStage.order}: {activeStage.clause}
            </span>
            <span className="text-xs text-text-dim">({activeStage.name})</span>
          </div>

          <span className="font-mono text-[11px] text-func bg-func/10 border border-func/30 px-2 py-0.5 rounded">
            {activeStage.cardinality}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-wider text-text-faint mb-1">
              What the Engine Does
            </div>
            <p className="text-text-dim leading-relaxed font-sans">
              {activeStage.purpose}
            </p>
            <p className="text-text font-medium mt-2 leading-relaxed">
              <span className="text-text-faint">Memory state:</span> {activeStage.dataState}
            </p>
          </div>

          <div className="rounded-md bg-surface border border-border-soft p-3">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-warning-text mb-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Architectural Rule / Gotcha</span>
            </div>
            <p className="text-text-dim text-[11.5px] leading-relaxed">
              {activeStage.gotcha}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionPipelineVisualizer;


