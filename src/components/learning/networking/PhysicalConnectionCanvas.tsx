'use client';

import React, { useState } from 'react';
import {
  Monitor,
  Server,
  Network,
  Cable,
  Check,
  AlertTriangle,
  ZoomIn,
  Volume2,
  VolumeX,
  Palette,
  Sparkles,
  Layers,
} from 'lucide-react';
import { RealisticRj45Cable } from './hardware/RealisticRj45Cable';
import { RealisticSwitchChassis } from './hardware/RealisticSwitchChassis';
import { RealisticNicSiliconModal } from './hardware/RealisticNicSiliconModal';
import { RealisticWireBus } from './hardware/RealisticWireBus';
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
  const { theme, toggleTheme, soundEnabled, toggleSound, panelClass, cardClass } = useNetworkingTheme();
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

  const isCyber = theme === 'cyber-glass';

  return (
    <div
      className={`relative w-full rounded-2xl ${panelClass} p-4 sm:p-6 shadow-2xl overflow-hidden transition-all duration-300 ${className}`}
      data-testid="physical-connection-canvas"
    >
      {/* Background Datacenter Ambient Render (Photorealistic Subtle Watermark) */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-center bg-cover mix-blend-screen"
        style={{ backgroundImage: `url('/networking/rack-datacenter.jpg')` }}
      />

      {/* Top Telemetry Header & Sound Controls */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-white/10 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isCableSeated
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse'
            }`}
          />
          <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-100 flex items-center gap-2">
            Acme Office • Physical Layer 1 Canvas
          </h3>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
              isCableSeated
                ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
            }`}
          >
            {isCableSeated ? 'Link Carrier: UP' : 'Link Carrier: OFF (Unplugged)'}
          </span>
        </div>

        {/* Audio Synthesizer Mute Toggle */}
        <button
          type="button"
          onClick={toggleSound}
          title={soundEnabled ? 'Mute Mechanical Audio FX' : 'Enable Mechanical Audio FX'}
          className="self-end sm:self-auto p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
          )}
        </button>
      </div>

      {/* Main 3-Node Physical Flow (Clean, Fluid Flex Row that never collides) */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3 py-2 w-full">
        {/* Node 1: Acme-PC-01 (Host A Workstation) */}
        <div
          className={`flex-1 w-full md:w-auto min-w-[130px] max-w-full md:max-w-[200px] flex flex-col items-center ${cardClass} rounded-xl p-3 relative group`}
        >
          {/* Hardware Header */}
          <div className="w-full flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/5">
            <div className="flex flex-col">
              <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>🖥️</span>
                <span>Workstation PC</span>
              </span>
              <span className="text-[9px] font-mono text-zinc-400">Endpoint Client (Host A)</span>
            </div>
          </div>

          {/* Workstation PC Avatar with Glass Icon */}
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2 shadow-inner group-hover:scale-105 transition-transform">
            <Monitor className="w-5 h-5" />
          </div>

          <span className="font-mono text-xs font-bold text-zinc-100">Acme-PC-01</span>
          <span className="text-[10px] text-zinc-400 font-mono mt-0.5">192.168.1.10</span>
          <span className="text-[9px] text-zinc-500 font-mono">00-1A-2B-3C-4D-10</span>

          {/* PC NIC Port & LED */}
          <div className="mt-2.5 w-full pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono px-0.5">
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

          {/* Zoom NIC Chip Button */}
          <button
            type="button"
            onClick={() => setIsNicModalOpen(true)}
            className="mt-2 w-full flex items-center justify-center gap-1 text-[9px] font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 py-1 rounded border border-cyan-500/30 transition-colors shadow-sm"
          >
            <ZoomIn className="w-3 h-3" />
            <span>Zoom NIC Chip</span>
          </button>
        </div>

        {/* Cable Connection 1 (Host A -> SW1) */}
        <div className="shrink-0 flex flex-col items-center justify-center py-1">
          <span className="text-[9px] font-mono font-bold text-cyan-300 mb-1">
            🔌 Cat6 Cable
          </span>
          <RealisticRj45Cable
            isPlugged={isCableSeated}
            onToggle={handleToggle}
            disabled={readOnly}
            label="Cat6 Ethernet cable between Acme-PC-01 and Acme-SW-01"
          />

          {/* Fallback Accessible Button for Legacy Test Assertions */}
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
        </div>

        {/* Node 2: Acme-SW-01 (Access Switch) */}
        <div className="flex-1 w-full md:w-auto min-w-[140px] max-w-full md:max-w-[210px] flex flex-col items-center">
          <div className="w-full flex items-center justify-between px-1 pb-1 text-[10px] font-mono">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <span>🎛️</span>
              <span>Network Switch</span>
            </span>
            <span className="text-[9px] font-mono text-zinc-400">
              Layer 2
            </span>
          </div>
          <RealisticSwitchChassis
            title="Acme-SW-01"
            model="Access Switch (L2)"
            highlightPort={1}
            ports={[
              {
                portNumber: 1,
                isConnected: isCableSeated,
                isActive: isCableSeated,
                connectedDevice: 'Acme-PC-01 (192.168.1.10)',
                speed: isCableSeated ? '1000Mbps' : 'Down',
                vlan: 1,
              },
              { portNumber: 2, isConnected: false, isActive: false, speed: 'Down', vlan: 1 },
              { portNumber: 3, isConnected: false, isActive: false, speed: 'Down', vlan: 1 },
              { portNumber: 4, isConnected: false, isActive: false, speed: 'Down', vlan: 1 },
              { portNumber: 5, isConnected: false, isActive: false, speed: 'Down', vlan: 1 },
              { portNumber: 6, isConnected: false, isActive: false, speed: 'Down', vlan: 1 },
              { portNumber: 7, isConnected: false, isActive: false, speed: 'Down', vlan: 1 },
              {
                portNumber: 8,
                isConnected: true,
                isActive: true,
                connectedDevice: 'Acme-RTR-01 Gateway (192.168.1.1)',
                speed: '1000Mbps',
                vlan: 1,
              },
            ]}
          />
        </div>

        {/* Link 2: Switch to Router (Permanent Office Backbone with Flowing Packets) */}
        <div className="shrink-0 w-12 flex flex-col items-center justify-center py-1">
          <span className="text-[9px] font-mono font-bold text-emerald-300 mb-1">
            ⚡ Backbone
          </span>
          <RealisticWireBus
            isConnected={isCableSeated}
            isTransmitting={isCableSeated}
            fromLabel="SW-01 (Gi0/8)"
            toLabel="RTR-01 (gi0/0)"
            packetType="ICMP"
          />
        </div>

        {/* Node 3: Acme-RTR-01 (Gateway Router) */}
        <div
          className={`flex-1 w-full md:w-auto min-w-[130px] max-w-full md:max-w-[200px] flex flex-col items-center ${cardClass} rounded-xl p-3 relative`}
        >
          <div className="w-full flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/5">
            <span className="text-[11px] font-mono font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🌐</span>
              <span>Gateway Router</span>
            </span>
          </div>

          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2 shadow-inner">
            <Server className="w-5 h-5" />
          </div>

          <span className="font-mono text-xs font-bold text-zinc-100">Acme-RTR-01</span>
          <span className="text-[10px] text-zinc-400 font-mono mt-0.5">192.168.1.1 (Target)</span>
          <span className="text-[9px] text-zinc-500 font-mono">00-1A-2B-3C-4D-01</span>

          {/* Router Port */}
          <div className="mt-2.5 w-full pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono px-0.5">
            <span className="text-zinc-400">Port gi0/0:</span>
            <span className="text-emerald-400 font-bold">[LINK: 1Gbps UP]</span>
          </div>
        </div>
      </div>

      {/* Wire & Circuit Status Explanatory Caption Strip */}
      <div className="relative z-10 mt-3 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-400 gap-2">
        <div className="flex items-center gap-1.5">
          {isCableSeated ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Layer 1 Physical circuit closed. Electrical carrier detected (1000BASE-T Full Duplex).</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Physical Layer 1 Open Circuit: Patch cable is unplugged. Click the RJ-45 plug to seat.</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
          <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
            Cat6 UTP • RJ-45
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-cyan-400">T568B Standard</span>
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
