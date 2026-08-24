import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DATABASE_SCHEMAS } from '../../content/database/schema';
import { INITIAL_TABLES } from '../../content/database/tables';

interface SchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchemaModal: React.FC<SchemaModalProps> = ({ isOpen, onClose }) => {
  const [selectedTable, setSelectedTable] = useState<string>('products');

  if (!isOpen) return null;

  const tableKeys = Object.keys(DATABASE_SCHEMAS);
  const currentSchema = DATABASE_SCHEMAS[selectedTable] || DATABASE_SCHEMAS.products;
  const currentRows = INITIAL_TABLES[selectedTable] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-4xl rounded-xl border border-outline-variant/80 bg-surface-container shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/60 bg-surface-base/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary-container">database</span>
            <div>
              <h2 className="font-label-sm text-xs font-semibold uppercase tracking-wider text-on-surface">
                Database Schema Reference
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded p-1 text-text-muted hover:bg-surface-variant hover:text-on-surface transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Table Selector (4 cols) */}
          <div className="md:col-span-4 border-r border-outline-variant/60 bg-surface-dim p-3 space-y-1.5 overflow-y-auto">
            <span className="font-label-sm text-[10px] font-semibold uppercase tracking-wider text-text-muted block px-2 py-1">
              Tables ({tableKeys.length})
            </span>
            <div className="space-y-0.5">
              {tableKeys.map((tKey) => {
                const schema = DATABASE_SCHEMAS[tKey];
                const isSelected = tKey === selectedTable;
                const rows = INITIAL_TABLES[tKey] || [];
                return (
                  <button
                    key={tKey}
                    onClick={() => setSelectedTable(tKey)}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-mono transition cursor-pointer ${
                      isSelected
                        ? 'bg-surface-base text-primary font-medium border border-primary-container'
                        : 'text-text-muted hover:bg-surface-base/50 hover:text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-text-muted">
                        table_chart
                      </span>
                      <span>{schema.name}</span>
                    </div>
                    <span className="text-[10px] text-text-muted/60 font-label-sm">
                      {rows.length} rows
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Table Columns & Schema Breakdown (8 cols) */}
          <div className="md:col-span-8 p-4 space-y-4 overflow-y-auto bg-surface-container">
            <div className="flex items-center justify-between border-b border-outline-variant/60 pb-2">
              <div>
                <h3 className="font-headline-sm text-sm font-semibold text-on-surface flex items-center gap-2 font-mono">
                  <span>{currentSchema.name}</span>
                </h3>
                <p className="text-xs text-text-muted mt-0.5 font-body-md">{currentSchema.description}</p>
              </div>
              <span className="text-xs font-label-sm text-text-muted">
                {currentRows.length} rows · {currentSchema.columns.length} columns
              </span>
            </div>

            {/* Column Schema Definition */}
            <div className="space-y-2">
              <span className="font-label-sm text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
                Columns & Types
              </span>
              <div className="rounded-lg border border-outline-variant/60 overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-surface-dim text-[11px] text-text-muted border-b border-outline-variant/60">
                    <tr>
                      <th className="px-3 py-1.5 font-medium">Column</th>
                      <th className="px-3 py-1.5 font-medium">Type</th>
                      <th className="px-3 py-1.5 font-medium">Key</th>
                      <th className="px-3 py-1.5 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40 text-[11px] bg-surface-base">
                    {currentSchema.columns.map((col) => (
                      <tr key={col.name} className="hover:bg-surface-variant/30">
                        <td className="px-3 py-1.5 font-medium text-on-surface">{col.name}</td>
                        <td className="px-3 py-1.5 text-primary">{col.type}</td>
                        <td className="px-3 py-1.5">
                          {col.primaryKey ? (
                            <span className="text-primary font-bold">[PK]</span>
                          ) : col.foreignKey ? (
                            <span className="text-text-muted">[FK]</span>
                          ) : (
                            <span className="text-text-muted/40">-</span>
                          )}
                        </td>
                        <td className="px-3 py-1.5 text-text-muted font-body-md">
                          {col.description || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
