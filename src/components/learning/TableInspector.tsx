import React, { useState } from 'react';
import { DATABASE_SCHEMAS } from '../../content/database/schema';
import { INITIAL_TABLES } from '../../content/database/tables';
import { TableRow } from '../../types/database';

interface TableInspectorProps {
  tableName: string;
  highlightedColumns?: string[];
  maxPreviewRows?: number;
  className?: string;
}

export const TableInspector: React.FC<TableInspectorProps> = ({
  tableName,
  highlightedColumns = [],
  maxPreviewRows = 50,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const schema = DATABASE_SCHEMAS[tableName.toLowerCase()];
  const rawRows: TableRow[] = INITIAL_TABLES[tableName.toLowerCase()] || [];

  if (!schema) {
    return (
      <div className="rounded-2xl border border-outline-variant/60 bg-surface-container p-5 text-xs font-mono text-text-muted">
        Table '{tableName}' not found in database registry.
      </div>
    );
  }

  const filteredRows = rawRows.filter((row) => {
    if (!searchTerm) return true;
    return Object.values(row).some((val) =>
      String(val ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const displayRows = filteredRows.slice(0, maxPreviewRows);

  return (
    <div className={`rounded-2xl border border-outline-variant/60 bg-surface-container overflow-hidden shadow-lg flex flex-col ${className}`}>
      {/* Top Header Section */}
      <div className="p-4 sm:p-5 border-b border-outline-variant/40 bg-surface-dim/80 flex flex-col gap-3 shrink-0">
        {/* Row 1: Category Tag and Search Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-primary uppercase tracking-widest">
            <span className="material-symbols-outlined text-[15px]">table_chart</span>
            <span>TABLE REFERENCE</span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1.5 text-[14px] text-text-muted">
              search
            </span>
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-7 w-32 sm:w-40 rounded-lg bg-surface-base pl-7 pr-6 text-[11px] font-mono text-on-surface placeholder-text-muted/60 border border-outline-variant/60 focus:outline-none focus:border-primary/80 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-1.5 top-1 text-text-muted hover:text-on-surface text-[12px] p-0.5"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Table Name and Meta Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-outline-variant/20">
          <div className="flex items-center gap-2">
            <h2 className="font-mono text-sm sm:text-base font-bold text-on-surface tracking-tight">
              {schema.name}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted">
            <span className="px-2 py-0.5 rounded-md bg-surface-base border border-outline-variant/50 text-on-surface/80 whitespace-nowrap">
              {rawRows.length} rows
            </span>
            <span className="px-2 py-0.5 rounded-md bg-surface-base border border-outline-variant/50 text-on-surface/80 whitespace-nowrap">
              {schema.columns.length} columns
            </span>
          </div>
        </div>
      </div>

      {/* Table Data Grid */}
      <div className="overflow-x-auto overflow-y-auto max-h-[460px] bg-surface-base/90 scrollbar-thin">
        <table className="w-max min-w-full text-left text-xs border-collapse font-mono">
          <thead className="sticky top-0 z-10 bg-surface-container-high border-b border-outline-variant/60 shadow-sm backdrop-blur-md">
            <tr>
              {schema.columns.map((col) => {
                const isHighlighted = highlightedColumns.some(
                  (hc) => hc.toLowerCase() === col.name.toLowerCase()
                );
                return (
                  <th
                    key={col.name}
                    className={`px-4 py-3 text-[11px] font-medium whitespace-nowrap select-none transition-colors ${
                      isHighlighted
                        ? 'bg-primary/15 text-primary border-b-2 border-primary'
                        : 'text-text-muted bg-surface-container-high/95'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold ${isHighlighted ? 'text-primary' : 'text-on-surface'}`}>
                        {col.name}
                      </span>
                      {col.primaryKey && (
                        <span className="text-[9px] text-cyan-300 font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-700/50 font-bold uppercase tracking-wider">
                          PK
                        </span>
                      )}
                      {col.foreignKey && (
                        <span className="text-[9px] text-amber-300 font-mono px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-700/50 font-bold uppercase tracking-wider">
                          FK
                        </span>
                      )}
                    </div>
                    <span className="block text-[10px] font-normal text-text-muted/70 lowercase mt-0.5">
                      {col.type}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 text-xs">
            {displayRows.length === 0 ? (
              <tr>
                <td
                  colSpan={schema.columns.length}
                  className="px-4 py-12 text-center text-text-muted font-body-md"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[24px] text-text-muted/50">
                      search_off
                    </span>
                    <span>No matching records found</span>
                  </div>
                </td>
              </tr>
            ) : (
              displayRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={`hover:bg-surface-container/60 transition-colors ${
                    rIdx % 2 === 1 ? 'bg-surface-dim/30' : 'bg-surface-base'
                  }`}
                >
                  {schema.columns.map((col) => {
                    const isHighlighted = highlightedColumns.some(
                      (hc) => hc.toLowerCase() === col.name.toLowerCase()
                    );
                    const val = row[col.name];
                    const isNull = val === null || val === undefined;

                    return (
                      <td
                        key={col.name}
                        className={`px-4 py-2.5 whitespace-nowrap text-on-surface ${
                          isHighlighted ? 'bg-primary/10 font-semibold' : ''
                        }`}
                      >
                        {isNull ? (
                          <span className="italic text-text-muted/40 font-normal">NULL</span>
                        ) : typeof val === 'number' ? (
                          <span className="text-cyan-400 font-medium tabular-nums">{val}</span>
                        ) : (
                          <span className="text-on-surface/90">{String(val)}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Subtle Row Count / Filter Status footer */}
      {searchTerm && (
        <div className="border-t border-outline-variant/40 bg-surface-dim/80 px-4 py-2 text-[11px] font-mono text-text-muted shrink-0 flex items-center justify-between">
          <span>Showing {displayRows.length} of {filteredRows.length} filtered rows</span>
          <button
            onClick={() => setSearchTerm('')}
            className="text-primary hover:underline cursor-pointer"
          >
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
};
