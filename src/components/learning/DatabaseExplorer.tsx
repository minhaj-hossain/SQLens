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
      className={`flex flex-col bg-[#18181b] rounded-xl border border-zinc-800 overflow-hidden shadow-lg ${className}`}
    >
      {/* Unified Compact Header: Table Context, Quiet Tabs, and Inline Search */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#121215] border-b border-zinc-800">
        {/* Left: Table selector + metadata */}
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-zinc-300" />
          <div className="relative inline-block">
            <select
              id="database-table-selector"
              value={activeTable}
              onChange={(e) => {
                setActiveTable(e.target.value);
                setSearchFilter('');
              }}
              className="appearance-none font-mono text-xs font-semibold text-white bg-[#222226] border border-zinc-700 rounded-md pl-2.5 pr-6 py-1 focus:outline-none focus:border-zinc-400 transition cursor-pointer"
            >
              {allTableNames.map((tName) => (
                <option key={tName} value={tName} className="bg-[#222226] text-zinc-100">
                  {tName} ({INITIAL_TABLES[tName]?.length || 0} rows)
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-1.5 top-2 pointer-events-none" />
          </div>
          <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
            {schema.columns.length} cols
          </span>
        </div>

        {/* Right: Inline Filter (when in preview) & Quiet Segmented Tabs */}
        <div className="flex items-center gap-2">
          {activeTab === 'preview' && (
            <div className="relative flex items-center">
              <Search className="w-3 h-3 text-zinc-500 absolute left-2 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter rows..."
                className="h-6.5 w-28 sm:w-36 pl-6 pr-5 text-[11px] font-mono text-white bg-[#18181b] border border-zinc-700/80 rounded focus:outline-none focus:border-zinc-400 placeholder:text-zinc-500"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-1.5 text-zinc-400 hover:text-white text-[10px]"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Quiet Segmented Tabs */}
          <div className="flex items-center bg-[#141417] p-0.5 rounded-md border border-zinc-800 text-[11px] font-mono">
            <button
              id="tab-data-preview-btn"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded transition cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-zinc-800 text-white font-semibold border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Table className="w-3 h-3" />
              <span>Preview</span>
            </button>
            <button
              id="tab-schema-types-btn"
              onClick={() => setActiveTab('schema')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded transition cursor-pointer ${
                activeTab === 'schema'
                  ? 'bg-zinc-800 text-white font-semibold border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Key className="w-3 h-3" />
              <span>Schema</span>
            </button>
            <button
              id="tab-schema-graph-btn"
              onClick={() => setActiveTab('graph')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded transition cursor-pointer ${
                activeTab === 'graph'
                  ? 'bg-zinc-800 text-white font-semibold border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Network className="w-3 h-3" />
              <span>ER Graph</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="relative">
        <div className="overflow-auto max-h-[300px] min-h-[160px] bg-[#0c0c0e] scrollbar-thin text-xs">
          {activeTab === 'preview' ? (
            <table className="min-w-full text-left font-mono border-collapse">
              <thead className="sticky top-0 z-10 bg-[#151518] border-b border-zinc-800">
                <tr>
                  {schema.columns.map((col) => {
                    const isHighlighted = highlightedColumns.some(
                      (hc) => hc.toLowerCase() === col.name.toLowerCase()
                    );
                    return (
                      <th
                        key={col.name}
                        onClick={() => handleCopyColName(col.name)}
                        className={`px-3 py-1.5 text-[11px] font-medium select-none cursor-pointer group transition border-r border-zinc-800/50 last:border-r-0 ${
                          isHighlighted
                            ? 'bg-zinc-800/80 text-white border-b-2 border-white'
                            : 'text-zinc-300 hover:bg-zinc-800/50'
                        }`}
                        title="Click to copy / insert column name"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-zinc-100 group-hover:text-white">
                            {col.name}
                          </span>
                          {col.primaryKey && (
                            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                              PK
                            </span>
                          )}
                          {col.foreignKey && (
                            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                              FK
                            </span>
                          )}
                          {copiedCol === col.name && (
                            <Check className="w-3 h-3 text-emerald-400 ml-0.5" />
                          )}
                        </div>
                        <span className="text-[9.5px] font-normal text-zinc-500 block leading-tight">
                          {col.type}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-[11.5px] text-zinc-200">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={schema.columns.length} className="py-8 text-center text-zinc-500">
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
                            className={`px-3 py-1.5 whitespace-nowrap border-r border-zinc-800/40 last:border-r-0 ${
                              isHighlighted ? 'bg-zinc-800/50 text-white font-medium' : ''
                            }`}
                          >
                            {row[col.name] !== null && row[col.name] !== undefined ? (
                              String(row[col.name])
                            ) : (
                              <span className="text-zinc-600 italic">NULL</span>
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
            <div className="p-3 divide-y divide-zinc-800/60">
              <div className="pb-2 mb-2 flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                <Info className="w-3 h-3 text-zinc-300" />
                <span>{schema.description || 'Database entity schema metadata'}</span>
              </div>
              {schema.columns.map((col) => {
                const isHighlighted = highlightedColumns.some(
                  (hc) => hc.toLowerCase() === col.name.toLowerCase()
                );
                return (
                  <div
                    key={col.name}
                    className={`py-2 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 rounded transition ${
                      isHighlighted ? 'bg-zinc-800/50 border border-zinc-700' : 'hover:bg-zinc-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-white">{col.name}</span>
                      {col.primaryKey && (
                        <span className="px-1 py-0.2 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono text-[8px] font-bold">
                          PRIMARY KEY
                        </span>
                      )}
                      {col.foreignKey && (
                        <span className="px-1 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono text-[8px] font-bold">
                          REFERENCES {col.foreignKey.table}.{col.foreignKey.column}
                        </span>
                      )}
                      {col.nullable && (
                        <span className="text-[8px] text-zinc-500 font-mono">NULLABLE</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[10px] text-zinc-300 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                        {col.type.toUpperCase()}
                      </span>
                      {col.description && (
                        <span className="text-[10.5px] text-zinc-400 max-w-xs truncate">
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
            <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {allTableNames.map((tblKey) => {
                const tblSchema = DATABASE_SCHEMAS[tblKey];
                const isSelected = activeTable.toLowerCase() === tblKey.toLowerCase();
                const fks = tblSchema.columns.filter((c) => c.foreignKey);
                const pks = tblSchema.columns.filter((c) => c.primaryKey);

                return (
                  <div
                    key={tblKey}
                    onClick={() => {
                      setActiveTable(tblKey);
                      setActiveTab('preview');
                    }}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#222226] border-zinc-400 text-white shadow-md'
                        : 'bg-[#151518] border-zinc-800 hover:border-zinc-700 hover:bg-[#1a1a1e]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Table className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-zinc-400'}`} />
                        <span className="font-mono text-xs font-semibold text-white">{tblKey}</span>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded">
                        {INITIAL_TABLES[tblKey]?.length || 0} rows
                      </span>
                    </div>

                    {pks.length > 0 && (
                      <div className="mb-1 text-[9.5px] font-mono text-zinc-300 flex items-center gap-1">
                        <span className="px-1 py-0.2 rounded bg-zinc-800 border border-zinc-700 text-[8px] font-bold">PK</span>
                        <span>{pks.map((p) => p.name).join(', ')}</span>
                      </div>
                    )}

                    <div className="space-y-0.5 mt-1.5 pt-1.5 border-t border-zinc-800">
                      <div className="text-[8.5px] uppercase tracking-wider font-mono text-zinc-500">
                        Relationships ({fks.length})
                      </div>
                      {fks.length === 0 ? (
                        <span className="text-[9.5px] font-mono text-zinc-500 italic">Root Entity</span>
                      ) : (
                        fks.map((fk) => (
                          <div
                            key={fk.name}
                            className="flex items-center gap-1 text-[9.5px] font-mono text-zinc-300"
                          >
                            <span className="text-zinc-400">{fk.name}</span>
                            <ArrowRight className="w-2.5 h-2.5 text-zinc-500" />
                            <span className="text-zinc-200 font-medium">{fk.foreignKey?.table}</span>
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
