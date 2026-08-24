import React, { useState } from 'react';
import { Table, Database, Key, Search, ChevronDown, Check, Info, Network, ArrowRight } from 'lucide-react';
import { DATABASE_SCHEMAS } from '../../content/database/schema';
import { INITIAL_TABLES } from '../../content/database/tables';
import { TableRow } from '../../types/database';

interface DatabaseExplorerProps {
  initialTableName?: string;
  highlightedColumns?: string[];
  onSelectColumn?: (colName: string) => void;
  className?: string;
}

export const DatabaseExplorer: React.FC<DatabaseExplorerProps> = ({
  initialTableName = 'products',
  highlightedColumns = [],
  onSelectColumn,
  className = '',
}) => {
  const [activeTable, setActiveTable] = useState<string>(initialTableName);
  const [activeTab, setActiveTab] = useState<'preview' | 'schema' | 'graph'>('preview');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedCol, setCopiedCol] = useState<string | null>(null);

  // Sync if initialTableName changes
  React.useEffect(() => {
    if (initialTableName && DATABASE_SCHEMAS[initialTableName.toLowerCase()]) {
      setActiveTable(initialTableName.toLowerCase());
    }
  }, [initialTableName]);

  const schema = DATABASE_SCHEMAS[activeTable.toLowerCase()] || DATABASE_SCHEMAS.products;
  const rawRows: TableRow[] = INITIAL_TABLES[activeTable.toLowerCase()] || [];

  const filteredRows = rawRows.filter((row) => {
    if (!searchFilter) return true;
    return Object.values(row).some((val) =>
      String(val ?? '').toLowerCase().includes(searchFilter.toLowerCase())
    );
  });

  const handleCopyColName = (colName: string) => {
    navigator.clipboard.writeText(colName);
    setCopiedCol(colName);
    if (onSelectColumn) onSelectColumn(colName);
    setTimeout(() => setCopiedCol(null), 1200);
  };

  const allTableNames = Object.keys(DATABASE_SCHEMAS);

  return (
    <div
      id="database-explorer-container"
      className={`flex flex-col bg-[#11171e] rounded-xl border border-zinc-700/60 overflow-hidden shadow-lg ${className}`}
    >
      {/* Header & Table Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3.5 bg-[#0e141a] border-b border-zinc-700/60">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          {/* Table Selector Dropdown */}
          <div className="relative inline-block">
            <select
              id="database-table-selector"
              value={activeTable}
              onChange={(e) => setActiveTable(e.target.value)}
              className="appearance-none font-mono text-xs font-bold text-zinc-100 bg-[#19212a] border border-zinc-600/80 rounded-lg pl-3 pr-7 py-1.5 focus:outline-none focus:border-cyan-400 transition cursor-pointer"
            >
              {allTableNames.map((tName) => (
                <option key={tName} value={tName} className="bg-[#19212a] text-zinc-200">
                  {tName} ({INITIAL_TABLES[tName]?.length || 0} rows)
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>
          <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">
            {schema.columns.length} cols
          </span>
        </div>

        {/* View Mode Toggle Tabs */}
        <div className="flex items-center bg-[#18212b] p-0.5 rounded-lg border border-zinc-700/70 text-xs">
          <button
            id="tab-data-preview-btn"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono font-medium transition cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Table className="w-3 h-3" />
            <span>Data Preview</span>
          </button>
          <button
            id="tab-schema-types-btn"
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono font-medium transition cursor-pointer ${
              activeTab === 'schema'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Key className="w-3 h-3" />
            <span>Schema & Types</span>
          </button>
          <button
            id="tab-schema-graph-btn"
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono font-medium transition cursor-pointer ${
              activeTab === 'graph'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Network className="w-3 h-3" />
            <span>ER Relationships</span>
          </button>
        </div>
      </div>

      {/* Subheader Toolbar: Search or Description */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#121922] border-b border-zinc-800/80 text-xs">
        {activeTab === 'preview' ? (
          <div className="flex items-center justify-between w-full gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={`Filter ${activeTable}...`}
                className="w-full h-7 pl-8 pr-6 text-[11px] font-mono text-zinc-200 bg-[#0e141a] border border-zinc-700/60 rounded-md focus:outline-none focus:border-cyan-400 placeholder:text-zinc-400"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2 top-1.5 text-zinc-400 hover:text-zinc-200 text-[10px]"
                >
                  ✕
                </button>
              )}
            </div>
            <span className="text-[11px] font-mono text-zinc-400 shrink-0">
              Showing {filteredRows.length} of {rawRows.length}
            </span>
          </div>
        ) : activeTab === 'schema' ? (
          <div className="flex items-center gap-2 text-zinc-300 text-xs font-mono">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>{schema.description || 'Database entity schema metadata'}</span>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-zinc-300 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Network className="w-3.5 h-3.5 text-cyan-400" />
              <span>Interactive Entity-Relationship Graph & Foreign Key Network</span>
            </div>
            <span className="text-[10px] text-zinc-400">Click any entity to inspect</span>
          </div>
        )}
      </div>

      {/* Body View Content with Mobile Scroll Indicator */}
      <div className="relative">
        <div className="sm:hidden px-3 py-1 bg-[#151c24] text-[10px] font-mono text-zinc-400 border-b border-zinc-800 flex items-center justify-between">
          <span>← Swipe horizontally to view all columns →</span>
        </div>
        <div className="overflow-auto max-h-[320px] min-h-[160px] bg-[#0c1117] scrollbar-thin text-xs">
          {activeTab === 'preview' ? (
            <table className="min-w-full text-left font-mono border-collapse">
            <thead className="sticky top-0 z-10 bg-[#161e27] border-b border-zinc-700/70">
              <tr>
                {schema.columns.map((col) => {
                  const isHighlighted = highlightedColumns.some(
                    (hc) => hc.toLowerCase() === col.name.toLowerCase()
                  );
                  return (
                    <th
                      key={col.name}
                      onClick={() => handleCopyColName(col.name)}
                      className={`px-3 py-2 text-[11px] font-semibold select-none cursor-pointer group transition ${
                        isHighlighted
                          ? 'bg-cyan-950/40 text-cyan-300 border-b-2 border-cyan-400'
                          : 'text-zinc-300 hover:bg-zinc-800'
                      }`}
                      title="Click to copy / insert column name"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="group-hover:text-cyan-300">{col.name}</span>
                        {col.primaryKey && (
                          <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                            PK
                          </span>
                        )}
                        {col.foreignKey && (
                          <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-900/60 text-amber-300 border border-amber-700/50">
                            FK
                          </span>
                        )}
                        {copiedCol === col.name && (
                          <Check className="w-3 h-3 text-emerald-400 ml-1" />
                        )}
                      </div>
                      <span className="text-[9px] font-normal text-zinc-400 block mt-0.5">
                        {col.type}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-[11.5px] text-zinc-300">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={schema.columns.length} className="py-8 text-center text-zinc-400">
                    No records found matching "{searchFilter}"
                  </td>
                </tr>
              ) : (
                filteredRows.slice(0, 40).map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-zinc-800/40 transition-colors"
                  >
                    {schema.columns.map((col) => {
                      const isHighlighted = highlightedColumns.some(
                        (hc) => hc.toLowerCase() === col.name.toLowerCase()
                      );
                      return (
                        <td
                          key={col.name}
                          className={`px-3 py-1.5 whitespace-nowrap ${
                            isHighlighted ? 'bg-cyan-950/20 text-cyan-200 font-medium' : ''
                          }`}
                        >
                          {row[col.name] !== null && row[col.name] !== undefined ? (
                            String(row[col.name])
                          ) : (
                            <span className="text-zinc-400 italic">NULL</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : activeTab === 'schema' ? (
          /* Schema & Types List View */
          <div className="p-3 divide-y divide-zinc-800/70">
            {schema.columns.map((col) => {
              const isHighlighted = highlightedColumns.some(
                (hc) => hc.toLowerCase() === col.name.toLowerCase()
              );
              return (
                <div
                  key={col.name}
                  className={`py-2.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg transition ${
                    isHighlighted ? 'bg-cyan-950/20 border border-cyan-700/30' : 'hover:bg-zinc-800/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-zinc-100">{col.name}</span>
                    {col.primaryKey && (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 font-mono text-[9px] font-bold">
                        PRIMARY KEY
                      </span>
                    )}
                    {col.foreignKey && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 font-mono text-[9px] font-bold">
                        REFERENCES {col.foreignKey.table}.{col.foreignKey.column}
                      </span>
                    )}
                    {col.nullable && (
                      <span className="text-[9px] text-zinc-400 font-mono">NULLABLE</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-amber-300 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700/50">
                      {col.type.toUpperCase()}
                    </span>
                    {col.description && (
                      <span className="text-[11px] text-zinc-400 max-w-xs truncate">
                        {col.description}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Interactive ER Graph / Network View */
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {allTableNames.map((tblKey) => {
              const tblSchema = DATABASE_SCHEMAS[tblKey];
              const isSelected = activeTable.toLowerCase() === tblKey.toLowerCase();
              const fks = tblSchema.columns.filter((c) => c.foreignKey);
              const pks = tblSchema.columns.filter((c) => c.primaryKey);

              return (
                <div
                  key={tblKey}
                  onClick={() => setActiveTable(tblKey)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#15202b] border-cyan-400 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400/40'
                      : 'bg-[#10161d] border-zinc-800 hover:border-zinc-600 hover:bg-[#141b24]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Table className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-zinc-400'}`} />
                      <span className="font-mono text-xs font-bold text-zinc-100">{tblKey}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded">
                      {INITIAL_TABLES[tblKey]?.length || 0} rows
                    </span>
                  </div>

                  {/* Primary Key Summary */}
                  {pks.length > 0 && (
                    <div className="mb-2 text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                      <span className="px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-800/60 font-bold">PK</span>
                      <span>{pks.map((p) => p.name).join(', ')}</span>
                    </div>
                  )}

                  {/* Foreign Key Links */}
                  <div className="space-y-1 mt-2 pt-2 border-t border-zinc-800/60">
                    <div className="text-[9px] uppercase tracking-wider font-mono text-zinc-400">
                      Relationships ({fks.length})
                    </div>
                    {fks.length === 0 ? (
                      <span className="text-[10px] font-mono text-zinc-400 italic">Root Entity (No FKs)</span>
                    ) : (
                      fks.map((fk) => (
                        <div
                          key={fk.name}
                          className="flex items-center gap-1 text-[10px] font-mono text-amber-300/90"
                        >
                          <span className="text-zinc-300">{fk.name}</span>
                          <ArrowRight className="w-2.5 h-2.5 text-zinc-400" />
                          <span className="text-amber-400 font-semibold">{fk.foreignKey?.table}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

