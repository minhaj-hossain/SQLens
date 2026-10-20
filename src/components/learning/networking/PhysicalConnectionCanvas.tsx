'use client';

import React from 'react';
import { Monitor, Server, Network, Cable, Check, AlertTriangle, ArrowRight } from 'lucide-react';

export interface PhysicalConnectionCanvasProps {
  isCableSeated: boolean;
  onToggleCable?: () => void;
  readOnly?: boolean;
  className?: string;
}

export const PhysicalConnectionCanvas: React.FC<PhysicalConnectionCanvasProps> = ({
  isCableSeated,
  onToggleCable,
  readOnly = false,
  className = '',
}) => {
  return (
    <div
      className={`relative w-full rounded-2xl bg-zinc-950/90 border border-zinc-800/80 p-4 sm:p-6 shadow-xl backdrop-blur-md overflow-hidden ${className}`}
      data-testid="physical-connection-canvas"
    >
      {/* Topology Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-zinc-800/60 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-300">
            Acme Office • Physical Layer 1 Canvas
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
          <span>Subnet:</span>
          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700/60 text-zinc-200">
            192.168.1.0/24
          </span>
        </div>
      </div>

      {/* Interactive 3-Node Topology Flow */}
      <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-3 py-3 relative">
        {/* Node 1: Acme-PC-01 (Host A) */}
        <div className="md:col-span-3 flex flex-col items-center bg-zinc-900/90 border border-zinc-700/70 rounded-xl p-3 shadow-lg relative group">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2">
            <Monitor className="w-5 h-5" />
          </div>
          <span className="font-mono text-xs font-bold text-zinc-100">Acme-PC-01</span>
          <span className="text-[10px] text-zinc-400 font-mono mt-0.5">192.168.1.10</span>
          <span className="text-[9px] text-zinc-500 font-mono">00-1A-2B-3C-4D-10</span>

          {/* PC Port & LED */}
          <div className="mt-3 w-full pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono px-1">
            <span className="text-zinc-400">Port eth0:</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  isCableSeated
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : 'bg-rose-500/80 animate-pulse'
                }`}
              />
              <span
                className={`font-bold ${
                  isCableSeated ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isCableSeated ? '[LINK: 1Gbps UP]' : '[LINK: OFF]'}
              </span>
            </div>
          </div>
        </div>

        {/* Cable Connection 1 (Host A -> SW1) */}
        <div className="md:col-span-1 flex flex-col items-center justify-center py-2 relative">
          <button
            type="button"
            disabled={readOnly}
            onClick={onToggleCable}
            aria-label={`Cat6 Ethernet cable between Acme-PC-01 and Acme-SW-01. Status: ${
              isCableSeated ? 'Connected' : 'Disconnected'
            }. Click or press Enter to ${isCableSeated ? 'unplug' : 'plug in'}.`}
            className={`group relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              isCableSeated
                ? 'bg-emerald-950/30 border-emerald-500/50 hover:bg-emerald-900/40 text-emerald-300'
                : 'bg-amber-950/30 border-amber-500/60 hover:bg-amber-900/40 text-amber-300 animate-bounce motion-reduce:animate-none'
            } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <Cable className={`w-5 h-5 ${isCableSeated ? 'rotate-90' : 'rotate-45'}`} />
            <span className="text-[9px] font-mono font-bold mt-1 tracking-tight">
              {isCableSeated ? 'Connected' : 'Click to Plug'}
            </span>
            <span className="sr-only">
              {isCableSeated ? 'Cable is seated in socket' : 'Cable is unplugged'}
            </span>
          </button>
        </div>

        {/* Node 2: Acme-SW-01 (Access Switch) */}
        <div className="md:col-span-3 flex flex-col items-center bg-zinc-900/90 border border-zinc-700/70 rounded-xl p-3 shadow-lg relative">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
            <Network className="w-5 h-5" />
          </div>
          <span className="font-mono text-xs font-bold text-zinc-100">Acme-SW-01</span>
          <span className="text-[10px] text-cyan-400 font-sans mt-0.5 text-center line-clamp-1">
            Access Switch
          </span>
          <p className="text-[9px] text-zinc-400 text-center mt-1 px-1 leading-tight">
            Passes traffic between office devices (Module 3 deep dive)
          </p>

          {/* Switch Ports */}
          <div className="mt-2 w-full pt-2 border-t border-zinc-800/80 flex items-center justify-around text-[9px] font-mono">
            <span
              className={`px-1.5 py-0.5 rounded ${
                isCableSeated ? 'bg-emerald-950/60 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              Port 1: {isCableSeated ? 'UP' : 'DOWN'}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400">
              Port 2: UP
            </span>
          </div>
        </div>

        {/* Link 2: Switch to Router (Permanent Office Backbone) */}
        <div className="md:col-span-1 flex flex-col items-center justify-center py-2 text-zinc-500">
          <div className="w-full h-0.5 bg-emerald-500/60 hidden md:block" />
          <div className="h-6 w-0.5 bg-emerald-500/60 md:hidden" />
          <span className="text-[8px] font-mono text-emerald-400 mt-1">1Gbps Link</span>
        </div>

        {/* Node 3: Acme-RTR-01 (Gateway Router) */}
        <div className="md:col-span-3 flex flex-col items-center bg-zinc-900/90 border border-zinc-700/70 rounded-xl p-3 shadow-lg relative">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
            <Server className="w-5 h-5" />
          </div>
          <span className="font-mono text-xs font-bold text-zinc-100">Acme-RTR-01</span>
          <span className="text-[10px] text-zinc-400 font-mono mt-0.5">192.168.1.1 (Target)</span>
          <span className="text-[9px] text-zinc-500 font-mono">00-1A-2B-3C-4D-01</span>

          {/* Router Port */}
          <div className="mt-3 w-full pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono px-1">
            <span className="text-zinc-400">Port gi0/0:</span>
            <span className="text-emerald-400 font-bold">[LINK: 1Gbps UP]</span>
          </div>
        </div>
      </div>

      {/* Explanatory Caption Strip */}
      <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          {isCableSeated ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Layer 1 Physical circuit closed. Electrical carrier detected.</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Physical Layer 1 Open Circuit: Patch cable is unplugged.</span>
            </>
          )}
        </div>
        <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
          Cat6 UTP • RJ-45
        </span>
      </div>
    </div>
  );
};
