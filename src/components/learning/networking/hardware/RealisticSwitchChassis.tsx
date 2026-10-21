'use client';

import React, { useState, useEffect } from 'react';

export interface SwitchPortConfig {
  portNumber: number;
  label?: string;
  isConnected: boolean;
  isActive?: boolean;
  connectedDevice?: string;
  speed?: string;
  vlan?: number;
}

export interface RealisticSwitchChassisProps {
  title?: string;
  model?: string;
  ports?: SwitchPortConfig[];
  highlightPort?: number;
  onPortClick?: (portNumber: number) => void;
  className?: string;
}

const DEFAULT_PORTS: SwitchPortConfig[] = [
  { portNumber: 1, isConnected: true, isActive: true, connectedDevice: 'Acme-PC-01 (192.168.1.10)', speed: '1000M', vlan: 1 },
  { portNumber: 2, isConnected: false, isActive: false, speed: 'Down', vlan: 1 },
  { portNumber: 3, isConnected: false, isActive: false, speed: 'Down', vlan: 1 },
  { portNumber: 4, isConnected: false, isActive: false, speed: 'Down', vlan: 1 },
  { portNumber: 5, isConnected: false, isActive: false, speed: 'Down', vlan: 1 },
  { portNumber: 6, isConnected: false, isActive: false, speed: 'Down', vlan: 1 },
  { portNumber: 7, isConnected: false, isActive: false, speed: 'Down', vlan: 1 },
  { portNumber: 8, isConnected: true, isActive: true, connectedDevice: 'Acme-RTR-01 Gateway (192.168.1.1)', speed: '1000M', vlan: 1 },
];

export const RealisticSwitchChassis: React.FC<RealisticSwitchChassisProps> = ({
  title = 'Acme-SW-01',
  model = 'Catalyst 2960-X • 8-Port Gigabit',
  ports = DEFAULT_PORTS,
  highlightPort,
  onPortClick,
  className = '',
}) => {
  const [blinkState, setBlinkState] = useState(false);
  const [selectedPort, setSelectedPort] = useState<SwitchPortConfig | null>(null);

  // Activity LED simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkState((prev) => !prev);
    }, 280);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`relative w-full rounded-xl bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 border border-zinc-700/80 p-3 sm:p-4 shadow-2xl select-none ${className}`}
      data-testid="realistic-switch-chassis"
    >
      {/* Rack Ears (Subtle Inset) */}
      <div className="absolute left-1 top-2 bottom-2 w-1 bg-zinc-700/60 rounded-full" />
      <div className="absolute right-1 top-2 bottom-2 w-1 bg-zinc-700/60 rounded-full" />

      {/* Faceplate Header / Logo & System Status */}
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-zinc-800/80 text-[10px] font-mono">
        <div className="flex items-center gap-1.5 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" />
          <span className="text-zinc-200 font-bold uppercase tracking-wider truncate">{title}</span>
        </div>

        {/* Console / Management Port Badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-700/50 text-cyan-300 text-[8px]">
            CONSOLE RJ-45
          </div>
          <span className="text-emerald-400 font-bold text-[9px] hidden sm:inline">PWR: OK</span>
        </div>
      </div>

      {/* 8-Port RJ-45 Metallic Gang Block (Clean 4x2 Grid) */}
      <div className="grid grid-cols-4 gap-1.5 bg-zinc-950/90 p-2 rounded-lg border border-zinc-800/90 shadow-inner">
        {ports.map((port) => {
          const isHighlighted = highlightPort === port.portNumber;
          const isLinkUp = port.isConnected;
          const isActBlinking = isLinkUp && port.isActive && blinkState;

          return (
            <div
              key={port.portNumber}
              onClick={() => {
                setSelectedPort(port);
                if (onPortClick) onPortClick(port.portNumber);
              }}
              className={`flex flex-col items-center p-1 rounded border transition-all cursor-pointer group ${
                isHighlighted
                  ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-500/40'
                  : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {/* Port Number & Activity LEDs */}
              <div className="w-full flex items-center justify-between px-0.5 mb-0.5">
                <span className="text-[8px] font-mono font-bold text-zinc-400 group-hover:text-zinc-200">
                  #{port.portNumber}
                </span>
                <div className="flex items-center gap-1">
                  {/* Link LED (Green) */}
                  <span
                    title={isLinkUp ? 'Link Carrier UP (1000BASE-T)' : 'Link Carrier DOWN'}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      isLinkUp
                        ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]'
                        : 'bg-zinc-700'
                    }`}
                  />
                  {/* Activity LED (Amber) */}
                  <span
                    title={isActBlinking ? 'Frame Activity' : 'Idle'}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      isActBlinking
                        ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]'
                        : 'bg-zinc-800'
                    }`}
                  />
                </div>
              </div>

              {/* Realistic Recessed RJ-45 Port Jack */}
              <div className="relative w-full h-5 rounded bg-zinc-950 border border-zinc-700/80 shadow-inner flex flex-col justify-end p-0.5 overflow-hidden">
                {/* 8 Gold Contact Pins inside jack */}
                <div className="flex justify-between w-full px-0.5 mb-0.5">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-[1px] h-2 rounded-sm ${
                        isLinkUp ? 'bg-amber-400' : 'bg-amber-600/60'
                      }`}
                    />
                  ))}
                </div>
                {/* Retention Clip Notch */}
                <div className="w-3 h-1 mx-auto bg-zinc-900 rounded-t border-t border-zinc-700" />
              </div>

              {/* Port Label */}
              <span className="text-[7.5px] font-mono text-zinc-500 mt-0.5 truncate max-w-[40px]">
                {port.portNumber === 1 ? 'Gi0/1' : port.portNumber === 8 ? 'Gi0/8' : `P${port.portNumber}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Port Inspection Card (Active Tooltip / Telemetry) */}
      {selectedPort && (
        <div className="mt-2.5 p-2 rounded-lg bg-zinc-900/90 border border-zinc-700/60 flex items-center justify-between text-[10px] font-mono animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-bold">
              Port Gi0/{selectedPort.portNumber}
            </span>
            <span className="text-zinc-400">
              {selectedPort.connectedDevice || 'Empty / Disconnected'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <span>Speed: <strong className="text-emerald-400">{selectedPort.speed || '1000Mbps'}</strong></span>
            <span>VLAN: <strong className="text-cyan-400">{selectedPort.vlan || 1}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
