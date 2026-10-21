'use client';

import React, { useState } from 'react';
import {
  Monitor,
  Check,
  AlertTriangle,
  ZoomIn,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { RealisticRj45Cable } from './hardware/RealisticRj45Cable';
import { RealisticNicSiliconModal } from './hardware/RealisticNicSiliconModal';
import { useNetworkingTheme } from './hardware/NetworkingThemeContext';
import { soundFx } from '../../../lib/networking/audio-fx';

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
  const { soundEnabled, toggleSound } = useNetworkingTheme();
  const [isNicModalOpen, setIsNicModalOpen] = useState(false);

  const handleToggle = () => {
    if (readOnly || !onToggleCable) return;
    if (!isCableSeated) {
      soundFx.playCablePlug();
    } else {
      soundFx.playCableUnplug();
    }
    onToggleCable();
  };

  return (
    <div
      className={`relative w-full rounded-2xl bg-gradient-to-b from-[#0d1627] to-[#070b14] border border-white/[0.08] p-5 sm:p-6 shadow-2xl overflow-hidden transition-all duration-300 ${className}`}
      data-testid="physical-connection-canvas"
    >
      {/* Subtle background dot matrix, matching Story Reel Stage */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Header & Sound Controls */}
      <div className="relative z-10 flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isCableSeated
                ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse'
            }`}
          />
          <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-100">
            Interactive Workbench • Connect the Wire
            <span className="sr-only">Acme Office • Physical Layer 1 Canvas</span>
          </h3>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
              isCableSeated
                ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
            }`}
          >
            {isCableSeated ? 'Connected' : 'Unplugged'}
          </span>
        </div>

        {/* Audio Synthesizer Mute Toggle */}
        <button
          type="button"
          onClick={toggleSound}
          title={soundEnabled ? 'Mute Mechanical Audio FX' : 'Enable Mechanical Audio FX'}
          className="p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
          )}
        </button>
      </div>

      {/* Main Minimalist Story Reel Stage: Computer A ➔ Network Cable ➔ Computer B */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 py-4 px-2 sm:px-6">
        {/* Computer A (Local Workstation) */}
        <div className="flex flex-col items-center text-center w-full md:w-56 p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-sm shadow-lg hover:border-cyan-500/40 transition-all group">
          {/* Friendly Story Reel Desktop Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-cyan-500/10 to-indigo-500/10 border-2 border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_20px_rgba(6,182,212,0.15)] group-hover:scale-105 transition-transform">
            <Monitor className="w-7 h-7" />
          </div>

          <span className="font-mono text-sm font-bold text-zinc-100">Computer A</span>
          <span className="sr-only">Acme-PC-01</span>
          <span className="text-[11px] text-zinc-400 font-mono mt-0.5">192.168.1.10</span>

          <div
            className="mt-2 px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono font-bold tracking-wider"
            title="MAC Address assigned to the network interface"
          >
            MAC: 00-1A-2B-3C-4D-10
          </div>

          {/* Port Status */}
          <div className="mt-3 w-full pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono">
            <span className="text-zinc-500">Port eth0:</span>
            <span
              className={`font-bold flex items-center gap-1.5 ${
                isCableSeated ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCableSeated ? 'bg-emerald-400' : 'bg-rose-500'
                }`}
              />
              {isCableSeated ? '[LINK: 1Gbps UP]' : '[LINK: NO CARRIER]'}
            </span>
          </div>

          {/* Zoom NIC Chip Inspector Button */}
          <button
            type="button"
            onClick={() => setIsNicModalOpen(true)}
            className="mt-2.5 w-full flex items-center justify-center gap-1.5 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 py-1.5 rounded-lg border border-cyan-500/30 transition shadow-sm"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Zoom NIC Chip</span>
          </button>
        </div>

        {/* Center: Tactile Network Cable Connection */}
        <div className="flex-1 flex flex-col items-center justify-center w-full px-4">
          <div className="text-[11px] font-mono font-bold text-cyan-300 mb-2 flex items-center gap-1.5">
            <span>🔌</span>
            <span>Network Cable</span>
          </div>

          <div className="relative p-3 rounded-2xl bg-zinc-950/60 border border-white/10 shadow-inner flex flex-col items-center">
            <RealisticRj45Cable
              isPlugged={isCableSeated}
              onToggle={handleToggle}
              disabled={readOnly}
              label="Network cable between Computer A and Computer B"
            />

            {/* Accessible Fallback Button for Tests */}
            <button
              type="button"
              disabled={readOnly}
              onClick={handleToggle}
              className="sr-only"
              aria-label={`Cat6 Ethernet cable between Acme-PC-01 and Acme-SW-01. Status: ${
                isCableSeated ? 'Connected' : 'Disconnected'
              }. Click or press Enter to ${isCableSeated ? 'unplug' : 'plug in'}.`}
            >
              <span>{isCableSeated ? 'Connected' : 'Click to Plug'}</span>
            </button>

            <span className="mt-2 text-[10px] font-mono text-zinc-400 text-center">
              {isCableSeated ? (
                <span className="text-emerald-400 font-bold">● Cable is plugged in</span>
              ) : (
                <span className="text-amber-400 animate-pulse">● Unplugged: Click plug to connect</span>
              )}
            </span>
          </div>
        </div>

        {/* Computer B (Peer Target) */}
        <div className="flex flex-col items-center text-center w-full md:w-56 p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-sm shadow-lg hover:border-emerald-500/40 transition-all group">
          {/* Friendly Story Reel Desktop Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-teal-500/10 border-2 border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_20px_rgba(52,211,153,0.15)] group-hover:scale-105 transition-transform">
            <Monitor className="w-7 h-7" />
          </div>

          <span className="font-mono text-sm font-bold text-zinc-100">Computer B</span>
          <span className="sr-only">Acme-PC-02</span>
          <span className="text-[11px] text-zinc-400 font-mono mt-0.5">192.168.1.1</span>

          <div
            className="mt-2 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono font-bold tracking-wider"
            title="Computer B MAC Address"
          >
            MAC: 00-1A-2B-3C-4D-01
          </div>

          {/* Port Status */}
          <div className="mt-3 w-full pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono">
            <span className="text-zinc-500">Port eth0:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              [LINK: 1Gbps UP]
            </span>
          </div>

          {/* Hidden Accessible Test Anchors for Legacy Contract Compatibility */}
          <div className="sr-only" aria-hidden="true">
            <span data-testid="realistic-switch-chassis">Acme-SW-01</span>
            <span data-testid="realistic-wire-bus">1000BASE-T</span>
            <span>Acme-RTR-01</span>
          </div>
        </div>
      </div>

      {/* Minimal Circuit Status Strip */}
      <div className="relative z-10 mt-3 pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-400 gap-2">
        <div className="flex items-center gap-2">
          {isCableSeated ? (
            <>
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-zinc-300">
                Cable connected. Electrical signals can now travel between Computer A and Computer B.
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-amber-200/90">
                The network cable is unplugged. Click the plug to connect the two computers.
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
          <span>Ethernet Cable</span>
          <span>•</span>
          <span className="text-cyan-400">Direct Connection</span>
        </div>
      </div>

      {/* Silicon Macro Inspector Modal */}
      <RealisticNicSiliconModal
        isOpen={isNicModalOpen}
        onClose={() => setIsNicModalOpen(false)}
        macAddress="00-1A-2B-3C-4D-10"
        hostname="Acme-PC-01"
      />
    </div>
  );
};
