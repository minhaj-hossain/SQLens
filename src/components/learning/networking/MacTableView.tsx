'use client';

import React from 'react';
import type { MacTableEntry, SwitchDecision } from '../../../types/networking-curriculum';

export interface MacTableViewProps {
  entries: MacTableEntry[];
  activeDecision?: SwitchDecision;
  highlightedMac?: string;
  highlightedPort?: number;
  className?: string;
}

export const MacTableView: React.FC<MacTableViewProps> = ({
  entries,
  activeDecision,
  highlightedMac,
  highlightedPort,
  className = '',
}) => {
  const getEntryBadge = (entry: MacTableEntry) => {
    const isTargetMac =
      highlightedMac && entry.mac.toUpperCase() === highlightedMac.toUpperCase();
    const isTargetPort = highlightedPort !== undefined && entry.port === highlightedPort;
    const isHot = isTargetMac || isTargetPort;

    if (!isHot || !activeDecision) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-surface-3 text-text-dim">
          DYNAMIC
        </span>
      );
    }

    switch (activeDecision) {
      case 'LEARN_NEW_SOURCE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            NEWLY LEARNED
          </span>
        );
      case 'REFRESH_SOURCE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            REFRESHED
          </span>
        );
      case 'MOVE_SOURCE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            STATION MOVED
          </span>
        );
      case 'FORWARD_KNOWN_UNICAST':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-func/20 text-func border border-func/30">
            MATCHED TARGET
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-surface-3 text-text-dim">
            DYNAMIC
          </span>
        );
    }
  };

  return (
    <div
      className={`rounded-2xl border border-border bg-surface-1/90 backdrop-blur-md overflow-hidden shadow-lg ${className}`}
      data-testid="mac-table-view"
    >
      {/* Table Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-soft bg-surface-2/60">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
          <h3 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-text">
            Switch CAM Table (MAC Address Table)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface-3 text-text-dim">
            {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}
          </span>
          {entries.length === 0 && (
            <span className="font-mono text-[10.5px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Cold Start (Empty)
            </span>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto min-h-[140px] flex flex-col justify-between">
        {entries.length === 0 ? (
          <div className="p-6 text-center text-text-dim flex flex-col items-center justify-center gap-2 my-auto">
            <div className="w-8 h-8 rounded-full bg-surface-3 text-text-muted flex items-center justify-center font-mono text-xs">
              0
            </div>
            <p className="text-xs sm:text-sm max-w-sm font-sans">
              The CAM table has no learned records. Incoming unicast frames with unknown
              destinations will be flooded to all ports except the arrival port.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-border-soft text-text-muted bg-surface-2/30 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold">MAC Address</th>
                <th className="py-2.5 px-4 font-semibold text-center">Port</th>
                <th className="py-2.5 px-4 font-semibold">Entry Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft">
              {entries.map((entry) => {
                const isTargetMac =
                  highlightedMac && entry.mac.toUpperCase() === highlightedMac.toUpperCase();
                const isTargetPort =
                  highlightedPort !== undefined && entry.port === highlightedPort;
                const isHot = isTargetMac || isTargetPort;

                return (
                  <tr
                    key={`${entry.mac}-${entry.port}`}
                    className={`transition-colors duration-200 ${
                      isHot ? 'bg-surface-3/80 font-bold' : 'hover:bg-surface-2/40'
                    }`}
                    data-testid={`mac-entry-${entry.mac}`}
                  >
                    <td className="py-2.5 px-4 text-text flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isHot ? 'bg-func animate-ping' : 'bg-text-muted'
                        }`}
                      />
                      <span>{entry.mac}</span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-surface-3 font-semibold text-text">
                        Port {entry.port}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">{getEntryBadge(entry)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Footer Note */}
        <div className="px-4 py-2 border-t border-border-soft bg-surface-2/20 text-[11px] text-text-muted font-sans flex items-center justify-between">
          <span>Inspection: Ingress Source MACs dynamically populate this table.</span>
          <span className="font-mono text-[10px] text-text-dim">VLAN: 1 (Default)</span>
        </div>
      </div>
    </div>
  );
};
