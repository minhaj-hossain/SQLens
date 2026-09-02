'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { SqlExecutor } from '@/lib/sql-engine/executor';
import { INITIAL_TABLES } from '@/content/database/tables';
import { DATABASE_SCHEMAS } from '@/content/database/schema';
import { QueryExecutionResult } from '@/types/database';
import { formatExecutionTime } from '@/lib/format-execution-time';
import { DataGrid } from '../learning/DataGrid';
import { Play, RotateCcw, AlertTriangle, CheckCircle2, Terminal } from 'lucide-react';

interface PresetScenario {
  id: string;
  name: string;
  category: string;
  description: string;
  sql: string;
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'join-fanout',
    name: 'Join Fanout & Duplicate Count Bug',
    category: 'Relational Joins',
    description: 'When joining 1:N relations, each customer row duplicates for every order. Notice how COUNT(*) inflates compared to COUNT(DISTINCT customer_id).',
    sql: `SELECT 
  c.id,
  c.name,
  COUNT(*) AS total_rows,
  COUNT(DISTINCT c.id) AS unique_customers
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
LIMIT 5;`,
  },
  {
    id: 'null-trap',
    name: 'NOT IN Subquery NULL Trap',
    category: 'Subqueries',
    description: 'In SQL, if a subquery returns even a single NULL, NOT IN evaluates to UNKNOWN for all rows, returning 0 rows unexpectedly.',
    sql: `SELECT id, name
FROM students
WHERE id NOT IN (
  SELECT student_id 
  FROM enrollments 
  WHERE grade IS NULL
);`,
  },
  {
    id: 'window-ranking',
    name: 'RANK() vs DENSE_RANK() Ties',
    category: 'Window Functions',
    description: 'Compare tie-handling behavior: RANK() leaves gaps after ties (1, 1, 3), while DENSE_RANK() leaves no gaps (1, 1, 2).',
    sql: `SELECT 
  name, 
  department, 
  age,
  RANK() OVER (PARTITION BY department ORDER BY age DESC) as age_rank,
  DENSE_RANK() OVER (PARTITION BY department ORDER BY age DESC) as age_dense_rank
FROM students;`,
  },
  {
    id: 'cte-pipeline',
    name: 'Modular CTE Breakdown',
    category: 'CTEs',
    description: 'Test a two-stage Common Table Expression calculating departmental averages then filtering students above average.',
    sql: `WITH dept_averages AS (
  SELECT department, AVG(age) as avg_age
  FROM students
  GROUP BY department
)
SELECT s.name, s.department, s.age, ROUND(d.avg_age, 1) as dept_avg
FROM students s
JOIN dept_averages d ON s.department = d.department
WHERE s.age >= d.avg_age;`,
  },
  {
    id: 'case-bucketing',
    name: 'CASE Conditional Pivoting',
    category: 'Aggregation',
    description: 'Using CASE statements inside aggregate functions to compute categorical distributions in a single pass.',
    sql: `SELECT 
  department,
  COUNT(*) as total_students,
  SUM(CASE WHEN age < 22 THEN 1 ELSE 0 END) as junior_count,
  SUM(CASE WHEN age >= 22 THEN 1 ELSE 0 END) as senior_count
FROM students
GROUP BY department;`,
  },
];

export default function AdminQueryDebugPanel() {
  const [sql, setSql] = useState(PRESET_SCENARIOS[0].sql);
  const [selectedScenario, setSelectedScenario] = useState<string>(PRESET_SCENARIOS[0].id);
  const [result, setResult] = useState<QueryExecutionResult | null>(null);
  const [executing, setExecuting] = useState(false);

  // In-memory executor initialized with standard schema
  const executor = useMemo(() => new SqlExecutor(), []);

  const handleRun = () => {
    setExecuting(true);
    try {
      const res = executor.executeQuery(sql);
      setResult(res);
    } catch (err: any) {
      setResult({
        success: false,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: 0,
        error: err.message || 'Unknown runtime error in SQL engine',
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleSelectScenario = (sc: PresetScenario) => {
    setSelectedScenario(sc.id);
    setSql(sc.sql);
    setResult(null);
  };

  const handleReset = () => {
    const sc = PRESET_SCENARIOS.find((s) => s.id === selectedScenario);
    if (sc) {
      setSql(sc.sql);
      setResult(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-text">Live Query Debugger & Sandbox</h2>
        <p className="text-xs sm:text-sm text-text-dim mt-1">
          Simulate, debug, and diagnose complex learner query scenarios against all seed database schemas in real time.
        </p>
      </div>

      {/* Preset Scenarios Strip */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <p className="font-mono text-[11px] text-text-dim uppercase tracking-wider mb-2.5">
          Curated Learner Pitfall Scenarios:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {PRESET_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleSelectScenario(sc)}
              className={`p-3 rounded-lg text-left transition cursor-pointer border ${
                selectedScenario === sc.id
                  ? 'bg-func/10 border-func/40 text-text'
                  : 'bg-surface-2 border-border-soft text-text-dim hover:text-text hover:border-border'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-func mb-1">
                <span>{sc.category}</span>
                {selectedScenario === sc.id && <span className="text-xs">✓</span>}
              </div>
              <p className="text-xs font-semibold text-text truncate">{sc.name}</p>
              <p className="text-[11px] text-text-dim line-clamp-2 mt-1 leading-snug">{sc.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Execution Panel */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        {/* Editor Toolbar */}
        <div className="bg-surface-2 px-4 py-2.5 border-b border-border-soft flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-xs text-text">
            <Terminal size={14} className="text-func" />
            <span className="font-semibold">Query Editor</span>
            <span className="text-text-faint text-[11px] hidden sm:inline">· SQLens In-Browser Engine</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-text-dim hover:text-text text-xs font-mono transition cursor-pointer"
              title="Reset query"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={handleRun}
              disabled={executing || !sql.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-func text-ink hover:bg-func-hover font-mono text-xs font-semibold transition cursor-pointer disabled:opacity-50"
            >
              <Play size={12} fill="currentColor" />
              <span>Execute</span>
            </button>
          </div>
        </div>

        {/* Textarea */}
        <div className="p-4 bg-ink/40">
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            rows={8}
            className="w-full bg-transparent font-mono text-xs sm:text-sm text-text outline-none resize-y placeholder:text-text-faint selection:bg-func/20 leading-relaxed"
            placeholder="Write or paste SQL statement..."
            spellCheck={false}
          />
        </div>

        {/* Results Bar */}
        {result && (
          <div className="border-t border-border-soft px-4 py-2.5 bg-surface-2 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              {result.success ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Execution Successful</span>
                  <span className="text-text-dim">({result.rowCount} rows returned)</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={14} className="text-rose-400" />
                  <span className="text-rose-400 font-semibold">Engine Error</span>
                </>
              )}
            </div>

            <div className="text-text-faint text-[11px]">
              {formatExecutionTime(result.executionTimeMs)}
            </div>
          </div>
        )}

        {/* Error Box */}
        {result && !result.success && (
          <div className="p-4 bg-rose-500/10 border-t border-rose-500/20 text-xs font-mono text-rose-300">
            <p className="font-semibold mb-1">Diagnostics:</p>
            <pre className="whitespace-pre-wrap font-mono">{result.error}</pre>
          </div>
        )}

        {/* Results DataGrid */}
        {result && result.success && (
          <div className="p-4 border-t border-border-soft overflow-x-auto">
            {result.rowCount === 0 ? (
              <p className="text-text-dim font-mono text-xs py-4 text-center">
                Query executed successfully, but returned 0 rows.
              </p>
            ) : (
              <DataGrid
                columns={result.columns}
                rows={result.rows}
                showRowCount
                maxHeight="max-h-[350px]"
              />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
