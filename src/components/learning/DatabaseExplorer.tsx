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
      className={`flex flex-col bg-surface rounded-xl border border-border overflow-hidden shadow-lg ${className}`}
    >
      {/* Header & Table Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3.5 bg-surface-2 border-b border-border-soft">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-text-dim" />
          <div className="relative inline-block">
            <select
              id="database-table-selector"
              value={activeTable}
              onChange={(e) => {
                setActiveTable(e.target.value);
                setSearchFilter('');
              }}
              className="appearance-none font-mono text-xs font-bold text-text bg-surface border border-border rounded-lg pl-3 pr-7 py-1.5 focus:outline-none focus:border-func transition cursor-pointer"
            >
              {allTableNames.map((tName) => (
                <option key={tName} value={tName} className="bg-surface text-text-dim">
                  {tName} ({INITIAL_TABLES[tName]?.length || 0} rows)
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-text-faint absolute right-2 top-2.5 pointer-events-none" />
          </div>
          <span className="text-[11px] font-mono text-text-faint hidden sm:inline">
            {schema.columns.length} cols
          </span>
        </div>

        {/* Right: Tabs */}
        <div className="flex items-center gap-2">
          {/* Segmented Tabs */}
          <div className="flex items-center bg-surface-2 p-0.5 rounded-lg border border-border text-[11px] font-mono">
            <button
              id="tab-data-preview-btn"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded transition cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-surface text-text font-semibold border border-border'
                  : 'text-text-faint hover:text-text'
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
                  ? 'bg-surface text-text font-semibold border border-border'
                  : 'text-text-faint hover:text-text'
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
                  ? 'bg-surface text-text font-semibold border border-border'
                  : 'text-text-faint hover:text-text'
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
        <div className="sm:hidden px-3 py-1 bg-surface-2 text-[10px] font-mono text-text-faint border-b border-border-soft flex items-center justify-between">
          <span>â† Swipe horizontally to view all columns â†’</span>
        </div>
        <div className="overflow-auto max-h-[320px] min-h-[160px] bg-editor-bg scrollbar-thin text-xs">
          {activeTab === 'preview' ? (
            <table className="min-w-full text-left font-mono border-collapse">
            <thead className="sticky top-0 z-10 bg-surface-2 border-b border-border">
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
                            ? 'bg-editor-active-line text-text border-b-2 border-func'
                            : 'text-text-dim hover:bg-surface'
                        }`}
                        title="Click to copy / insert column name"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="group-hover:text-text">{col.name}</span>
                          {col.primaryKey && (
                            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-surface text-text border border-border">
                              PK
                            </span>
                          )}
                          {col.foreignKey && (
                            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-surface text-text-dim border border-border">
                              FK
                            </span>
                          )}
                          {copiedCol === col.name && (
                            <Check className="w-3 h-3 text-text ml-1" />
                          )}
                        </div>
                        <span className="text-[9px] font-normal text-text-faint block mt-0.5">
                          {col.type}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
            <tbody className="divide-y divide-border-soft text-[11.5px] text-text-dim">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={schema.columns.length} className="py-8 text-center text-text-faint">
                      No records found matching "{searchFilter}"
                    </td>
                  </tr>
                ) : (
                  filteredRows.slice(0, 40).map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-surface-2/50 transition-colors"
                    >
                      {schema.columns.map((col) => {
                        const isHighlighted = highlightedColumns.some(
                          (hc) => hc.toLowerCase() === col.name.toLowerCase()
                        );
                        return (
                          <td
                            key={col.name}
                            className={`px-3 py-1.5 whitespace-nowrap ${
                              isHighlighted ? 'bg-func/10 text-text font-medium' : ''
                            }`}
                          >
                            {row[col.name] !== null && row[col.name] !== undefined ? (
                              String(row[col.name])
                            ) : (
                              <span className="text-text-faint italic">NULL</span>
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
            <div className="p-3 divide-y divide-border-soft">
              <div className="pb-2 mb-2 flex items-center gap-1.5 text-[11px] font-mono text-text-faint">
                <Info className="w-3 h-3 text-text-dim" />
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
                      isHighlighted ? 'bg-func/10 border border-func/40' : 'hover:bg-surface-2/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-text">{col.name}</span>
                      {col.primaryKey && (
                        <span className="px-1 py-0.2 rounded bg-surface text-text-dim border border-border font-mono text-[8px] font-bold">
                          PRIMARY KEY
                        </span>
                      )}
                      {col.foreignKey && (
                        <span className="px-1 py-0.2 rounded bg-surface text-text-dim border border-border font-mono text-[8px] font-bold">
                          REFERENCES {col.foreignKey.table}.{col.foreignKey.column}
                        </span>
                      )}
                      {col.nullable && (
                        <span className="text-[8px] text-text-faint font-mono">NULLABLE</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[10px] text-text-dim px-1.5 py-0.5 rounded bg-surface border border-border">
                        {col.type.toUpperCase()}
                      </span>
                      {col.description && (
                        <span className="text-[10.5px] text-text-faint max-w-xs truncate">
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
                        ? 'bg-surface-3 border-border text-text shadow-md'
                        : 'bg-surface border-border-soft hover:border-border hover:bg-surface-2'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Table className={`w-3 h-3 ${isSelected ? 'text-text' : 'text-text-faint'}`} />
                        <span className="font-mono text-xs font-semibold text-text">{tblKey}</span>
                      </div>
                      <span className="text-[9px] font-mono text-text-faint bg-surface px-1.5 py-0.2 rounded">
                        {INITIAL_TABLES[tblKey]?.length || 0} rows
                      </span>
                    </div>

                    {pks.length > 0 && (
                      <div className="mb-1 text-[9.5px] font-mono text-text-dim flex items-center gap-1">
                        <span className="px-1 py-0.2 rounded bg-surface border border-border text-[8px] font-bold">PK</span>
                        <span>{pks.map((p) => p.name).join(', ')}</span>
                      </div>
                    )}

                    <div className="space-y-0.5 mt-1.5 pt-1.5 border-t border-border-soft">
                      <div className="text-[8.5px] uppercase tracking-wider font-mono text-text-faint">
                        Relationships ({fks.length})
                      </div>
                      {fks.length === 0 ? (
                        <span className="text-[9.5px] font-mono text-text-faint italic">Root Entity</span>
                      ) : (
                        fks.map((fk) => (
                          <div
                            key={fk.name}
                            className="flex items-center gap-1 text-[9.5px] font-mono text-text-dim"
                          >
                            <span className="text-text-faint">{fk.name}</span>
                            <ArrowRight className="w-2.5 h-2.5 text-text-faint" />
                            <span className="text-text font-medium">{fk.foreignKey?.table}</span>
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
