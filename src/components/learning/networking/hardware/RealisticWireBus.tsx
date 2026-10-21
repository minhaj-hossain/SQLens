'use client';

import React, { useState } from 'react';
import { soundFx } from '../../../../lib/networking/audio-fx';

export interface RealisticWireBusProps {
  isConnected: boolean;
  isTransmitting?: boolean;
  fromLabel?: string;
  toLabel?: string;
  packetType?: 'ARP' | 'IPv4' | 'TCP' | 'ICMP';
  className?: string;
}

export const RealisticWireBus: React.FC<RealisticWireBusProps> = ({
  isConnected,
  isTransmitting = true,
  fromLabel = 'Acme-PC-01 (eth0)',
  toLabel = 'Acme-SW-01 (Gi0/1)',
  packetType = 'ARP',
  className = '',
}) => {
  const [hoveredPacket, setHoveredPacket] = useState<boolean>(false);

  return (
    <div className={`relative w-full flex flex-col items-center select-none ${className}`} data-testid="realistic-wire-bus">
      {/* SVG Circuit / Wire Path with Metallic Shine & Flowing Packets */}
      <svg
        viewBox="0 0 400 36"
        className="w-full h-9 overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Metallic Wire Cable Gradient */}
          <linearGradient id="cableCopper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="35%" stopColor={isConnected ? '#2563eb' : '#475569'} />
            <stop offset="50%" stopColor={isConnected ? '#60a5fa' : '#64748b'} />
            <stop offset="65%" stopColor={isConnected ? '#1d4ed8' : '#334155'} />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Packet Glow Filter */}
          <filter id="packetGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Shadow */}
        <line
          x1="10"
          y1="18"
          x2="390"
          y2="18"
          stroke="#020617"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Physical Cat6 Copper Core / Jacket */}
        <line
          x1="10"
          y1="18"
          x2="390"
          y2="18"
          stroke="url(#cableCopper)"
          strokeWidth="6"
          strokeLinecap="round"
          className="transition-colors duration-500"
        />

        {/* Wire Center Highlight Core */}
        <line
          x1="10"
          y1="17"
          x2="390"
          y2="17"
          stroke={isConnected ? '#93c5fd' : '#94a3b8'}
          strokeWidth="1.2"
          strokeOpacity="0.8"
          strokeLinecap="round"
        />

        {/* Animated Flowing Packet Particles (When link is UP) */}
        {isConnected && isTransmitting && (
          <>
            {/* Packet 1 (Primary Frame) */}
            <g
              className="cursor-pointer transition-transform hover:scale-125"
              onMouseEnter={() => {
                setHoveredPacket(true);
                soundFx.playPacketPulse();
              }}
              onMouseLeave={() => setHoveredPacket(false)}
            >
              <rect
                x="0"
                y="11"
                width="28"
                height="14"
                rx="4"
                fill="#38bdf8"
                stroke="#0284c7"
                strokeWidth="1.5"
                filter="url(#packetGlow)"
              >
                <animate
                  attributeName="x"
                  values="10;360"
                  dur={hoveredPacket ? '0s' : '2.4s'}
                  repeatCount="indefinite"
                />
              </rect>
              <text
                x="14"
                y="21"
                fontSize="7"
                fontWeight="bold"
                fontFamily="monospace"
                fill="#0c4a6e"
                textAnchor="middle"
              >
                {packetType}
                <animate
                  attributeName="x"
                  values="24;374"
                  dur={hoveredPacket ? '0s' : '2.4s'}
                  repeatCount="indefinite"
                />
              </text>
            </g>

            {/* Packet 2 (Trailing Bitstream Pulse) */}
            <g opacity="0.75">
              <circle cx="0" cy="18" r="3.5" fill="#34d399" filter="url(#packetGlow)">
                <animate
                  attributeName="cx"
                  values="10;360"
                  dur="2.4s"
                  begin="1.2s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          </>
        )}
      </svg>

      {/* Bit-Level Dissection Hover Card */}
      {hoveredPacket && isConnected && (
        <div className="absolute -top-12 z-20 px-3 py-1.5 rounded-lg bg-slate-900/95 border border-cyan-400 text-[10px] font-mono text-cyan-200 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <strong className="text-white">Ethernet II Frame Captured:</strong>
            <span className="text-cyan-300">Preamble: 7-bytes + SFD</span>
            <span className="text-slate-400">|</span>
            <span className="text-emerald-300">EtherType: 0x0806 ({packetType})</span>
          </div>
        </div>
      )}

      {/* Wire Endpoints Telemetry Legend */}
      <div className="w-full flex items-center justify-between px-2 text-[9px] font-mono text-zinc-400">
        <span>{fromLabel}</span>
        <span className="text-zinc-500 font-sans tracking-tight">
          {isConnected ? '1000BASE-T • Cat6 4-Pair Twisted' : 'NO ELECTRICAL SIGNAL'}
        </span>
        <span>{toLabel}</span>
      </div>
    </div>
  );
};
