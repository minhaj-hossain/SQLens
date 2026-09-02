'use client';
/**
 * DataGrid — the app's single data-table primitive.
 *
 * Replaces six duplicated `<table>` recipes (ResultsConsole, sql-blocks
 * `DataTable`, ConceptLessonView demo + markdown tables, DatabaseExplorer,
 * Playground and IndependentChallengeView + its inspector modal). One visual
 * spec, per docs/STYLE.md §3 (upgraded):
 *
 *  - type-aware cells: numbers right-aligned + tabular-nums, money keeps 2dp,
 *    dates tabular, NULL as a muted chip             (src/lib/format-cell.ts)
 *  - zebra striping + hover tint + sticky header
 *  - built-in pagination + honest "Showing N–M of K" / "first N of K" footers
 *  - optional row-cap, row numbers, gold highlight columns, clickable headers
 */
import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DATABASE_SCHEMAS } from '../../content/database/schema';
import {
  CellType,
  resolveCellType,
  formatCell,
  cellAlign,
} from '../../lib/format-cell';
import { paginate } from '../../lib/grid-pagination';

export interface DataGridProps {
  columns: string[];
  /** Record rows (column-name keyed) or array rows (index keyed). */
  rows: ReadonlyArray<Record<string, unknown> | ReadonlyArray<unknown>>;
  /** Table name used for schema-typed columns (products, orders, …). */
  schemaName?: string;
  /** Rare explicit per-column overrides. */
  columnTypes?: Record<string, CellType>;
  /** Columns drawn with the gold highlight treatment. */
  highlightColumns?: string[];
  /** Extra header adornments (PK / FK chips, copied check, …). */
  columnBadges?: (col: string) => React.ReactNode | null;
  onColumnClick?: (col: string) => void;
  /** Full-cell override (e.g. markdown `**bold**`/`code` inside theory tables). */
  renderCell?: (value: unknown, col: string) => React.ReactNode;
  /** 0 = render every row (no pagination). */
  pageSize?: number;
  /** Hard cap on rendered rows with a "showing first N of M" footer (0 = off). */
  rowCap?: number;
  /** Tailwind max-height for the inner scroll area, e.g. 'max-h-[300px]'. */
  maxHeight?: string;
  rowNumbers?: boolean;
  /** Always render the footer row counter, even for one small page. */
  showRowCount?: boolean;
  emptyMessage?: string;
  /** No outer border/rounding — the caller provides its own card. */
  bare?: boolean;
  className?: string;
}

const isRecord = (
  row: Record<string, unknown> | ReadonlyArray<unknown>,
): row is Record<string, unknown> => !Array.isArray(row);

/** Reads a cell by column name (records) or index (arrays). */
function cellAt(
  row: Record<string, unknown> | ReadonlyArray<unknown>,
  ci: number,
  col: string,
): unknown {
  return isRecord(row) ? row[col] : (row as ReadonlyArray<unknown>)[ci];
}
export const DataGrid: React.FC<DataGridProps> = ({
  columns,
  rows,
  schemaName,
  columnTypes,
  highlightColumns = [],
  columnBadges,
  onColumnClick,
  renderCell,
  pageSize = 0,
  rowCap = 0,
  maxHeight = '',
  rowNumbers = false,
  showRowCount = false,
  emptyMessage = 'No rows to display.',
  bare = false,
  className = '',
}) => {
  const [page, setPage] = useState(0);

  const cap = rowCap > 0 ? Math.min(rowCap, rows.length) : rows.length;
  const { start, end, pages, page: safePage } = useMemo(
    () => paginate(cap, page, pageSize),
    [cap, page, pageSize],
  );
  const sliced = rows.slice(start, end);
  const capped = rowCap > 0 && rows.length > rowCap;

  // Reset to the first page whenever the underlying dataset changes.
  useEffect(() => {
    setPage(0);
  }, [columns, rows]);

  // Column → display type, resolved once per dataset.
  const types = useMemo(() => {
    const schema = schemaName ? DATABASE_SCHEMAS[schemaName.toLowerCase()] : undefined;
    return columns.map((col, ci) => {
      const values = rows.map((r) => cellAt(r, ci, col));
      const schemaCol = schema?.columns.find(
        (c) => c.name.toLowerCase() === col.toLowerCase(),
      );
      return resolveCellType(col, values, {
        schemaType: schemaCol?.type,
        explicit: columnTypes?.[col],
      });
    });
  }, [columns, rows, schemaName, columnTypes]);

  const highlighted = useMemo(
    () => new Set(highlightColumns.map((c) => c.toLowerCase())),
    [highlightColumns],
  );

  if (columns.length === 0 || rows.length === 0) {
    return (
      <div
        className={`flex items-center justify-center py-10 text-center font-mono text-xs text-text-dim ${className}`}
      >
        {emptyMessage}
      </div>
    );
  }

  const showFooter = pages > 1 || capped || showRowCount;

  return (
    <div
      className={`${bare ? '' : 'border border-border rounded-lg overflow-hidden bg-surface'} ${className}`}
    >
      <div className={`overflow-auto scrollbar-thin ${maxHeight}`}>
        <table className="w-full border-collapse font-mono text-[13px]">
          <thead className="sticky top-0 z-10">
            <tr>
              {rowNumbers && (
                <th className="px-3 py-2 text-right text-[11px] font-semibold bg-(--table-head-bg) text-(--table-head-text) border-b border-border select-none whitespace-nowrap">
                  #
                </th>
              )}
              {columns.map((col, ci) => {
                const isHigh = highlighted.has(col.toLowerCase());
                const clickable = Boolean(onColumnClick);
                return (
                  <th
                    key={col}
                    onClick={clickable ? () => onColumnClick?.(col) : undefined}
                    title={
                      clickable ? 'Click to copy / insert column name' : undefined
                    }
                    className={`px-3.5 py-2 text-left text-[11px] font-semibold select-none whitespace-nowrap bg-(--table-head-bg) border-b border-border ${
                      isHigh ? 'text-text border-b-2 border-b-func' : 'text-(--table-head-text)'
                    } ${clickable ? 'cursor-pointer group hover:bg-surface-2' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={isHigh ? '' : 'group-hover:text-text'}>
                        {col}
                      </span>
                      {columnBadges?.(col)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
<tbody>
            {sliced.map((row, rIdx) => {
              const absIdx = start + rIdx;
              return (
                <tr
                  key={rIdx}
                  className="odd:bg-(--table-zebra) hover:bg-(--table-hover) transition-colors border-b border-(--table-row-border) last:border-b-0"
                >
                  {rowNumbers && (
                    <td className="px-3 py-2 text-right text-[11px] text-text-faint tabular-nums select-none whitespace-nowrap">
                      {absIdx + 1}
                    </td>
                  )}
                  {columns.map((col, ci) => {
                    const value = cellAt(row, ci, col);
                    const type = types[ci];
                    const isNull = value === null || value === undefined;
                    const isHigh = highlighted.has(col.toLowerCase());
                    return (
                      <td
                        key={col}
                        className={`px-3.5 py-2 whitespace-nowrap align-top ${cellAlign(
                          type,
                        )} ${
                          isNull
                            ? 'text-text-faint'
                            : type === 'string' || type === 'number'
                              ? 'text-text-dim'
                              : 'text-text'
                        } ${isHigh ? 'bg-func/10 font-medium text-text' : ''}`}
                      >
                        {renderCell ? (
                          renderCell(value, col)
                        ) : isNull ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-2 border border-border text-[9.5px] font-bold uppercase tracking-wide text-text-faint italic">
                            NULL
                          </span>
                        ) : (
                          formatCell(value, type)
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer — honest counts + pagination controls */}
      {showFooter && (
        <div className="flex items-center justify-between gap-3 px-3 py-2 bg-surface-2 border-t border-border-soft text-[11px] font-mono text-text-dim">
          <span>
            {capped
              ? `Showing first ${cap} of ${rows.length} rows`
              : pages > 1
                ? `Showing ${start + 1}–${end} of ${rows.length} rows`
                : `${rows.length} ${rows.length === 1 ? 'row' : 'rows'}`}
          </span>
          {pages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                aria-label="Previous page"
                className="p-1 rounded bg-surface-2 hover:bg-surface-3 disabled:opacity-40 text-text-dim transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-text-faint">
                {safePage + 1} / {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                disabled={safePage >= pages - 1}
                aria-label="Next page"
                className="p-1 rounded bg-surface-2 hover:bg-surface-3 disabled:opacity-40 text-text-dim transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};