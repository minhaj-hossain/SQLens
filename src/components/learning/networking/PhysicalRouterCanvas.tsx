'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Day3StageState } from '../../../types/networking-day3';
import { Volume2, VolumeX, RotateCcw, Network, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { soundFx } from '../../../lib/networking/audio-fx';

export interface PhysicalRouterCanvasProps {
  stageState?: Day3StageState;
  onToggleCable?: (target: 'hostA' | 'routerEth0' | 'routerEth1' | 'hostB') => void;
  onPlugRouterCables?: () => void;
  onInspectRoutingTable?: () => void;
  onInspectRouterArp?: () => void;
  onOpenLookInside?: (id: string) => void;
  onReplay?: () => void;
  readOnly?: boolean;
  className?: string;
}

export const PhysicalRouterCanvas: React.FC<PhysicalRouterCanvasProps> = ({
  stageState,
  onToggleCable,
  onPlugRouterCables,
  onInspectRoutingTable,
  onInspectRouterArp,
  onOpenLookInside,
  onReplay,
  readOnly = false,
  className = '',
}) => {
  const [soundEnabled, setSoundEnabled] = useState(false);

  const cables = stageState?.cables ?? {
    hostA: true,
    hostB: true,
    routerEth0: true,
    routerEth1: true,
  };

  const portLeds = stageState?.portLeds ?? {
    hostA: 'green',
    hostB: 'green',
    routerEth0: 'green',
    routerEth1: 'green',
  };

  const showRouter = stageState?.showRouter ?? true;
  const showGatewayBadges = stageState?.showGatewayBadges ?? true;
  const gateways = stageState?.gateways ?? { a: '192.168.1.1', b: '192.168.2.1' };
  const message = stageState?.message ?? 'none';

  return (
    <div
      className={`relative w-full h-full min-h-[460px] bg-[#0c0c0e] rounded-2xl overflow-hidden border border-white/[0.08] flex flex-col justify-between p-4 sm:p-6 select-none ${className}`}
      aria-label="Physical Router & Subnet Canvas"
    >
      {/* ========================================================================= */}
      {/* 1. TOP UTILITY BAR: STREET LABELS & CANVAS CONTROLS                       */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">Green Street:</span>
            <span className="text-zinc-300">192.168.1.x</span>
          </div>

          <div className="text-zinc-600 font-bold hidden sm:inline">↔</div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold">Orange Street:</span>
            <span className="text-zinc-300">192.168.2.x</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onReplay && (
            <button
              type="button"
              onClick={onReplay}
              title="Replay packet animation"
              className="p-1.5 rounded-lg bg-zinc-900/90 border border-white/10 hover:border-white/25 text-zinc-400 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            title={soundEnabled ? 'Mute audio fx' : 'Enable audio fx'}
            className="p-1.5 rounded-lg bg-zinc-900/90 border border-white/10 hover:border-white/25 text-zinc-400 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN TOPOLOGY STAGE: HOST A <-> ROUTER <-> HOST B                      */}
      {/* ========================================================================= */}
      <div className="relative flex-1 my-4 flex items-center justify-between gap-3 sm:gap-6 z-0">
        
        {/* SVG Cable Connection Underlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="cableGradA" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="cableGradB" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Left Cable: Host A -> Router Port 1 */}
          {cables.hostA && cables.routerEth0 && (
            <motion.line
              x1="22%"
              y1="50%"
              x2="42%"
              y2="50%"
              stroke="url(#cableGradA)"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Right Cable: Router Port 2 -> Host B */}
          {cables.hostB && cables.routerEth1 && (
            <motion.line
              x1="58%"
              y1="50%"
              x2="78%"
              y2="50%"
              stroke="url(#cableGradB)"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Animated Packet Flow (Ping Hops) */}
          {(message === 'cross-hop-ping' || message === 'ping-to-gateway') && cables.hostA && cables.routerEth0 && (
            <motion.circle
              r="6"
              fill="#10b981"
              initial={{ cx: '22%', cy: '50%' }}
              animate={
                message === 'cross-hop-ping' && cables.routerEth1 && cables.hostB
                  ? {
                      cx: ['22%', '50%', '78%', '50%', '22%'],
                      fill: ['#10b981', '#10b981', '#f59e0b', '#f59e0b', '#10b981'],
                    }
                  : { cx: ['22%', '45%', '22%'] }
              }
              transition={{
                duration: message === 'cross-hop-ping' ? 3.5 : 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </svg>

        {/* --------------------------------------------------------------------- */}
        {/* HOST A (Green Street Machine: 192.168.1.10)                           */}
        {/* --------------------------------------------------------------------- */}
        <div className="w-[30%] sm:w-[28%] max-w-[210px] rounded-2xl bg-[#141418] border border-white/10 p-3.5 sm:p-4 shadow-xl flex flex-col justify-between gap-3 relative z-10 transition-all hover:border-emerald-500/40">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Computer A
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                You
              </span>
            </div>

            {/* IP Address Pill */}
            <div className="p-2 rounded-xl bg-zinc-900/90 border border-white/[0.06] space-y-0.5">
              <div className="text-[9px] uppercase font-mono text-zinc-500">IP Address</div>
              <div className="text-xs font-mono font-bold text-zinc-100 flex items-center gap-1">
                <span className="text-emerald-400">192.168.1</span>
                <span>.10</span>
              </div>
            </div>

            {/* Default Gateway Setting Box */}
            {showGatewayBadges && (
              <div className="mt-2 p-2 rounded-xl bg-zinc-900/90 border border-white/[0.06] space-y-0.5">
                <div className="text-[9px] uppercase font-mono text-zinc-500 flex items-center justify-between">
                  <span>Gateway Doorway</span>
                  {gateways.a ? (
                    <span className="text-[9px] text-emerald-400 font-bold">SET</span>
                  ) : (
                    <span className="text-[9px] text-rose-400 font-bold">BLANK</span>
                  )}
                </div>
                <div className="text-xs font-mono font-bold">
                  {gateways.a ? (
                    <span className={gateways.a === '192.168.1.1' ? 'text-emerald-300' : 'text-amber-400'}>
                      {gateways.a}
                    </span>
                  ) : (
                    <span className="text-zinc-600 italic font-normal text-[11px]">&lt;none configured&gt;</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sockets & Hardware Tag */}
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono">
            <span className="text-zinc-500">MAC: ..53-01</span>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${portLeds.hostA === 'green' ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-zinc-700'}`} />
              <span className="text-[9px] text-zinc-400">RJ-45</span>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* CENTRAL ROUTER (The Gateway Doorway between Streets)                  */}
        {/* --------------------------------------------------------------------- */}
        {showRouter ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-[36%] sm:w-[32%] max-w-[260px] rounded-2xl bg-[#121217] border border-blue-500/30 p-3.5 sm:p-4 shadow-2xl flex flex-col justify-between gap-3 relative z-10 transition-all hover:border-blue-400/50"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-semibold text-xs text-white">Central Router</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-500/30">
                  Doorway
                </span>
              </div>

              {/* Dual Interface Cards */}
              <div className="grid grid-cols-2 gap-2 text-center">
                {/* Port 1 (eth0) - Green Street */}
                <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                  <div className="text-[9px] uppercase font-mono text-emerald-400 font-bold">Port 1 (eth0)</div>
                  <div className="text-[11px] font-mono font-bold text-zinc-100">192.168.1.1</div>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${portLeds.routerEth0 === 'green' ? 'bg-emerald-400' : 'bg-zinc-700'}`} />
                    <span className="text-[8px] font-mono text-zinc-400">{cables.routerEth0 ? 'Plugged' : 'Loose'}</span>
                  </div>
                </div>

                {/* Port 2 (eth1) - Orange Street */}
                <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-500/30">
                  <div className="text-[9px] uppercase font-mono text-amber-400 font-bold">Port 2 (eth1)</div>
                  <div className="text-[11px] font-mono font-bold text-zinc-100">192.168.2.1</div>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${portLeds.routerEth1 === 'green' ? 'bg-amber-400' : 'bg-zinc-700'}`} />
                    <span className="text-[8px] font-mono text-zinc-400">{cables.routerEth1 ? 'Plugged' : 'Loose'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Router Action Utilities */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-1 text-[10px]">
              <button
                type="button"
                onClick={onInspectRoutingTable}
                className="px-2 py-1 rounded bg-zinc-900 border border-white/10 hover:border-white/25 text-zinc-300 hover:text-white cursor-pointer font-mono"
              >
                Routing Table
              </button>
              <button
                type="button"
                onClick={onInspectRouterArp}
                className="px-2 py-1 rounded bg-zinc-900 border border-white/10 hover:border-white/25 text-zinc-300 hover:text-white cursor-pointer font-mono"
              >
                Router ARP
              </button>
            </div>
          </motion.div>
        ) : (
          /* Concept 1 Chasm View: Dead End / No Bridge */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-zinc-700/60 rounded-2xl bg-zinc-950/40">
            <div className="text-zinc-600 font-mono text-xs uppercase tracking-widest mb-1">Physical Divide</div>
            <p className="text-xs text-zinc-500 max-w-[180px]">
              No doorway device bridges Green Street and Orange Street.
            </p>
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* HOST B (Orange Street Machine: 192.168.2.20)                          */}
        {/* --------------------------------------------------------------------- */}
        <div className="w-[30%] sm:w-[28%] max-w-[210px] rounded-2xl bg-[#141418] border border-white/10 p-3.5 sm:p-4 shadow-xl flex flex-col justify-between gap-3 relative z-10 transition-all hover:border-amber-500/40">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Computer B
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
                Friend
              </span>
            </div>

            {/* IP Address Pill */}
            <div className="p-2 rounded-xl bg-zinc-900/90 border border-white/[0.06] space-y-0.5">
              <div className="text-[9px] uppercase font-mono text-zinc-500">IP Address</div>
              <div className="text-xs font-mono font-bold text-zinc-100 flex items-center gap-1">
                <span className="text-amber-400">192.168.2</span>
                <span>.20</span>
              </div>
            </div>

            {/* Default Gateway Setting Box */}
            {showGatewayBadges && (
              <div className="mt-2 p-2 rounded-xl bg-zinc-900/90 border border-white/[0.06] space-y-0.5">
                <div className="text-[9px] uppercase font-mono text-zinc-500">Gateway Doorway</div>
                <div className="text-xs font-mono font-bold text-amber-300">
                  {gateways.b || '192.168.2.1'}
                </div>
              </div>
            )}
          </div>

          {/* Sockets & Hardware Tag */}
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono">
            <span className="text-zinc-500">MAC: ..53-02</span>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${portLeds.hostB === 'green' ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-zinc-700'}`} />
              <span className="text-[9px] text-zinc-400">RJ-45</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM HARDWARE STATUS STRIP                                           */}
      {/* ========================================================================= */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
        <div className="flex items-center gap-2">
          <span>Physical Layer:</span>
          <span className="text-zinc-300">
            {cables.hostA && cables.routerEth0 && cables.routerEth1 && cables.hostB
              ? 'All 4 RJ-45 Links Connected'
              : !cables.routerEth1
              ? 'Warning: Router Port 2 (Orange) Unplugged'
              : 'Physical links down'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span>Traffic:</span>
          <span className="text-zinc-400">
            {message === 'cross-hop-ping'
              ? 'Routing 2 Hops'
              : message === 'drop-no-gateway'
              ? 'Dropped (No Doorway)'
              : 'Idle'}
          </span>
        </div>
      </div>
    </div>
  );
};
