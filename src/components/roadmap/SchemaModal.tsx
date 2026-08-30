import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import Icon from '@/components/ui/Icon';
import { DATABASE_SCHEMAS } from '../../content/database/schema';
import { INITIAL_TABLES } from '../../content/database/tables';
import { useCloseOnOutside } from '../../lib/use-close-on-outside';

interface SchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchemaModal: React.FC<SchemaModalProps> = ({ isOpen, onClose }) => {
  const [selectedTable, setSelectedTable] = useState<string>('products');
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when clicking/tapping anywhere outside the modal panel.
  useCloseOnOutside(panelRef, isOpen, onClose);

  if (!isOpen) return null;

  const tableKeys = Object.keys(DATABASE_SCHEMAS);
  const currentSchema = DATABASE_SCHEMAS[selectedTable] || DATABASE_SCHEMAS.products;
  const currentRows = INITIAL_TABLES[selectedTable] || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-4xl rounded-xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-soft bg-ink px-4 py-3">
          <div className="flex items-center gap-2">
            <Icon name="database" className="text-[20px] text-text-dim" />
            <div>
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-text">
                Database Schema Reference
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded p-1 text-text-dim hover:bg-surface-2 hover:text-text transition cursor-pointer"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Table Selector (4 cols) */}
          <div className="md:col-span-4 border-r border-border bg-ink p-3 space-y-1.5 overflow-y-auto">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-text-faint block px-2 py-1">
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
                        ? 'bg-surface text-text font-medium border border-text-dim'
                        : 'text-text-dim hover:bg-surface/50 hover:text-text'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon name="table_chart" className="text-[15px] text-text-faint" />
                      <span>{schema.name}</span>
                    </div>
                    <span className="text-[10px] text-text-faint font-mono">
                      {rows.length} rows
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Table Columns & Schema Breakdown (8 cols) */}
          <div className="md:col-span-8 p-4 space-y-4 overflow-y-auto bg-surface">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div>
                <h3 className="font-display text-sm font-semibold text-text flex items-center gap-2 font-mono">
                  <span>{currentSchema.name}</span>
                </h3>
                <p className="text-xs text-text-dim mt-0.5 font-body">{currentSchema.description}</p>
              </div>
              <span className="text-xs font-mono text-text-faint">
                {currentRows.length} rows · {currentSchema.columns.length} columns
              </span>
            </div>

            {/* Column Schema Definition */}
            <div className="space-y-2">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-text-faint block">
                Columns &amp; Types
              </span>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-surface-2 text-[11px] text-text-dim border-b border-border">
                    <tr>
                      <th className="px-3 py-1.5 font-medium text-text">Column</th>
                      <th className="px-3 py-1.5 font-medium text-text-dim">Type</th>
                      <th className="px-3 py-1.5 font-medium">Key</th>
                      <th className="px-3 py-1.5 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-[11px] bg-ink">
                    {currentSchema.columns.map((col) => (
                      <tr key={col.name} className="hover:bg-surface-2/50">
                        <td className="px-3 py-1.5 font-medium text-text">{col.name}</td>
                        <td className="px-3 py-1.5 text-text-dim">{col.type}</td>
                        <td className="px-3 py-1.5">
                          {col.primaryKey ? (
                            <span className="text-text font-bold">[PK]</span>
                          ) : col.foreignKey ? (
                            <span className="text-comment">[FK]</span>
                          ) : (
                            <span className="text-text-faint">-</span>
                          )}
                        </td>
                        <td className="px-3 py-1.5 text-text-dim font-body">
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

