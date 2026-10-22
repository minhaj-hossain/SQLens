'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Day2StageState } from '../../../types/networking-day2';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { soundFx } from '../../../lib/networking/audio-fx';

export interface PhysicalSwitchCanvasProps {
  stageState?: Day2StageState;
  onToggleCable?: (target: 'a' | 'b' | 'c') => void;
  onPlugAll?: () => void;
  onInspectSwitch?: () => void;
  onInspectMac?: (target: 'a' | 'b' | 'c') => void;
  onBroadcast?: () => void;
  onSelectTag?: (which: 'a' | 'b' | 'c') => void;
  onOpenLookInside?: (id: string) => void;
  onReplay?: () => void;
  layer?: 'sockets' | 'addresses' | 'tags';
  onLayerChange?: (layer: 'sockets' | 'addresses' | 'tags') => void;
  showMacBadges?: boolean;
  showAddressTags?: boolean;
  showSwitch?: boolean;
  unlockedLayers?: ('sockets' | 'addresses' | 'tags')[];
  readOnly?: boolean;
  className?: string;
}

export const PhysicalSwitchCanvas: React.FC<PhysicalSwitchCanvasProps> = ({
  stageState,
  onToggleCable,
  onPlugAll,
  onInspectSwitch,
  onInspectMac,
  onBroadcast,
  onSelectTag,
  onOpenLookInside,
  onReplay,
  layer,
  onLayerChange,
  showMacBadges: propShowMacBadges,
  showAddressTags: propShowAddressTags,
  showSwitch: propShowSwitch,
  unlockedLayers: propUnlockedLayers,
  readOnly = false,
  className = '',
}) => {
  const showMacBadges = propShowMacBadges ?? stageState?.showMacBadges ?? true;
  const showAddressTags = propShowAddressTags ?? stageState?.showAddressTags ?? true;
  const showSwitch = propShowSwitch ?? stageState?.showSwitch ?? true;
  const unlockedLayers = propUnlockedLayers ?? stageState?.unlockedLayers ?? ['sockets', 'addresses', 'tags'];

  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'sockets' | 'addresses' | 'tags'>(
    layer ?? stageState?.activeLayer ?? 'sockets'
  );

  React.useEffect(() => {
    if (layer) {
      setActiveLayer(layer);
    } else if (stageState?.activeLayer) {
      setActiveLayer(stageState.activeLayer);
    }
  }, [layer, stageState?.activeLayer]);

  const handleLayerSwitch = (nextLayer: 'sockets' | 'addresses' | 'tags') => {
    setActiveLayer(nextLayer);
    onLayerChange?.(nextLayer);
  };

  const cables = stageState?.cables ?? { a: true, b: true, c: true };
  const portLeds = stageState?.portLeds ?? {
    p1: 'green',
    p2: 'green',
    p3: 'green',
    p4: 'off',
  };
  const tags = stageState?.tags ?? {
    a: { street: '192.168.1', house: '10', split: true },
    b: { street: '192.168.1', house: '20', split: true },
    c: { street: '192.168.1', house: '30', split: true },
  };
  const macBadges = stageState?.macBadges ?? {
    a: '00-00-5e-00-53-01',
    b: '00-00-5e-00-53-02',
    c: '00-00-5e-00-53-03',
  };
  const macGlow = stageState?.macGlow ?? { a: false, b: false, c: false };
  const messageState = stageState?.message ?? 'none';
  const highlights = stageState?.highlight ?? [];
  const dims = stageState?.dim ?? [];
  const showBands = stageState?.bands !== 'hidden';

  const isDimmed = (id: string) => dims.includes(id);
  const isHighlighted = (id: string) => highlights.includes(id);

  const isAllConnected = cables.a && cables.b && cables.c;

  const handleCableClick = (which: 'a' | 'b' | 'c') => {
    if (readOnly) return;
    if (soundEnabled) soundFx.playCablePlug();
    onToggleCable?.(which);
  };

  const handleSwitchClick = () => {
    if (readOnly) return;
    if (soundEnabled) soundFx.playButtonPress();
    onInspectSwitch?.();
  };

  const handleMacClick = (which: 'a' | 'b' | 'c') => {
    if (readOnly) return;
    if (soundEnabled) soundFx.playBeep();
    onInspectMac?.(which);
  };

  return (
    <div
      className={`relative w-full rounded-2xl bg-[#0c0c0e] border border-white/[0.08] shadow-2xl overflow-hidden select-none transition-all duration-300 ${className}`}
      data-testid="physical-switch-canvas"
      role="region"
      aria-label="Physical Switch Connection Canvas"
    >
      {/* Top telemetry, layer selector & replay controls */}
      <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between text-xs font-mono pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-mono font-medium tracking-wider transition-all ${
              isAllConnected
                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-sm'
                : 'bg-[#18181b] border-white/[0.08] text-zinc-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isAllConnected
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : 'bg-zinc-600'
              }`}
            />
            {isAllConnected
              ? 'Switch: 3 Ports Linked'
              : 'Switch: Cable Unplugged'}
          </span>
        </div>

        {/* Stage Layer Selector: Sockets | Addresses | Name tags */}
        <div className="flex items-center rounded-xl bg-zinc-950/90 border border-white/[0.12] p-0.5 text-[11px] font-sans font-medium pointer-events-auto shadow-lg">
          {unlockedLayers.includes('sockets') && (
            <button
              type="button"
              onClick={() => handleLayerSwitch('sockets')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeLayer === 'sockets'
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Focus on physical ports and cables"
            >
              Sockets
            </button>
          )}
          {unlockedLayers.includes('addresses') && (
            <button
              type="button"
              onClick={() => handleLayerSwitch('addresses')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeLayer === 'addresses'
                  ? 'bg-blue-600/30 border border-blue-500/40 text-blue-200 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Focus on street IP addresses"
            >
              Addresses
            </button>
          )}
          {unlockedLayers.includes('tags') && (
            <button
              type="button"
              onClick={() => handleLayerSwitch('tags')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeLayer === 'tags'
                  ? 'bg-amber-600/30 border border-amber-500/40 text-amber-200 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Focus on hardware MAC name tags"
            >
              Name tags
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {onReplay && (
            <button
              type="button"
              onClick={onReplay}
              title="Replay animation (R)"
              className="p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="sr-only">Replay</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            title={soundEnabled ? 'Mute audio' : 'Enable audio'}
            className="p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-zinc-200" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
            )}
            <span className="sr-only">Toggle sound</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Area (viewBox 0 0 1000 720) */}
      <div className="relative w-full aspect-[16/11.5] max-h-[660px]">
        <svg
          viewBox="0 0 1000 720"
          className="w-full h-full block"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="deskGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#141D2D" />
              <stop offset="100%" stopColor="#0B101B" />
            </linearGradient>

            <linearGradient id="switchGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* DESK GROUND (y 540 to 720) */}
          <rect x="0" y="540" width="1000" height="180" fill="url(#deskGrad)" />
          <line x1="0" y1="540" x2="1000" y2="540" stroke="#1E293B" strokeWidth="2" />

          {/* SHARED STREET BLUE BAND (y 635) */}
          {showBands && showAddressTags && tags.a !== 'hidden' && (
            <g className="transition-opacity duration-500">
              <rect
                x="80"
                y="635"
                width="840"
                height="34"
                rx="17"
                fill="#2563EB"
                fillOpacity="0.18"
                stroke="#2563EB"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x="500"
                y="657"
                textAnchor="middle"
                fill="#60A5FA"
                fontSize="12"
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
              >
                Neighborhood Street: 192.168.1.x (Shared Street)
              </text>
            </g>
          )}

          {/* ========================================================================= */}
          {/* CABLES (Computer A, B, C -> Switch Ports 1, 2, 3)                         */}
          {/* ========================================================================= */}

          {/* Cable A: Computer A (185, 296) -> Switch Port 1 (430, 448) */}
          {cables.a ? (
            <g
              id="cable-a"
              onClick={() => handleCableClick('a')}
              className="cursor-pointer group"
            >
              <path
                d="M 185 296 C 185 385, 360 448, 430 448"
                fill="none"
                stroke="#2563EB"
                strokeWidth="6"
                strokeLinecap="round"
                className="transition-colors group-hover:stroke-blue-400"
              />
              <path
                d="M 185 296 C 185 385, 360 448, 430 448"
                fill="none"
                stroke="#60A5FA"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.7"
              />
            </g>
          ) : (
            <g id="cable-a-unplugged" onClick={() => handleCableClick('a')} className="cursor-pointer">
              <path
                d="M 185 296 C 185 365, 240 465, 290 480"
                fill="none"
                stroke="#64748B"
                strokeWidth="5"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
              <circle cx="290" cy="480" r="5" fill="#EF4444" />
            </g>
          )}

          {/* Cable B: Computer B (500, 296) -> Switch Port 2 (475, 448) */}
          {cables.b ? (
            <g
              id="cable-b"
              onClick={() => handleCableClick('b')}
              className="cursor-pointer group"
            >
              <path
                d="M 500 296 C 500 360, 475 390, 475 448"
                fill="none"
                stroke="#2563EB"
                strokeWidth="6"
                strokeLinecap="round"
                className="transition-colors group-hover:stroke-blue-400"
              />
              <path
                d="M 500 296 C 500 360, 475 390, 475 448"
                fill="none"
                stroke="#60A5FA"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.7"
              />
            </g>
          ) : (
            <g id="cable-b-unplugged" onClick={() => handleCableClick('b')} className="cursor-pointer group">
              <path
                d="M 500 296 C 500 355, 460 440, 440 495"
                fill="none"
                stroke="#64748B"
                strokeWidth="5"
                strokeDasharray="6 4"
                strokeLinecap="round"
                className="group-hover:stroke-blue-400 transition-colors"
              />
              <circle cx="440" cy="495" r="6" fill="#EF4444" />
              <g transform="translate(440, 515)">
                <rect x="-65" y="-10" width="130" height="20" rx="10" fill="#09090b" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="0" y="3.5" textAnchor="middle" fill="#38BDF8" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  ⚡ Click to Plug Port 2
                </text>
              </g>
            </g>
          )}

          {/* Cable C: Computer C (815, 296) -> Switch Port 3 (525, 448) */}
          {cables.c ? (
            <g
              id="cable-c"
              onClick={() => handleCableClick('c')}
              className="cursor-pointer group"
            >
              <path
                d="M 815 296 C 815 385, 600 448, 525 448"
                fill="none"
                stroke="#2563EB"
                strokeWidth="6"
                strokeLinecap="round"
                className="transition-colors group-hover:stroke-blue-400"
              />
              <path
                d="M 815 296 C 815 385, 600 448, 525 448"
                fill="none"
                stroke="#60A5FA"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.7"
              />
            </g>
          ) : (
            <g id="cable-c-unplugged" onClick={() => handleCableClick('c')} className="cursor-pointer group">
              <path
                d="M 815 296 C 815 365, 750 465, 690 480"
                fill="none"
                stroke="#64748B"
                strokeWidth="5"
                strokeDasharray="6 4"
                strokeLinecap="round"
                className="group-hover:stroke-blue-400 transition-colors"
              />
              <circle cx="690" cy="480" r="6" fill="#EF4444" />
              <g transform="translate(690, 455)">
                <rect x="-65" y="-10" width="130" height="20" rx="10" fill="#09090b" stroke="#38BDF8" strokeWidth="1.5" />
                <text x="0" y="3.5" textAnchor="middle" fill="#38BDF8" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="bold">
                  ⚡ Click to Plug Port 3
                </text>
              </g>
            </g>
          )}

          {/* ========================================================================= */}
          {/* CENTRAL ACCESS SWITCH (4-Port)                                            */}
          {/* ========================================================================= */}
          <g
            id="switch-box"
            onClick={handleSwitchClick}
            className="cursor-pointer group"
            opacity={isDimmed('switch-box') ? 0.35 : 1}
          >
            {/* Bezel glow if highlighted */}
            {isHighlighted('switch-box') && (
              <>
                <rect
                  x="370"
                  y="405"
                  width="260"
                  height="85"
                  rx="10"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  filter="url(#softGlow)"
                />
                <g transform="translate(500, 392)">
                  <rect x="-68" y="-10" width="136" height="20" rx="10" fill="#09090b" stroke="#38BDF8" strokeWidth="1.5" />
                  <text x="0" y="3.5" textAnchor="middle" fill="#38BDF8" fontSize="9" fontFamily="ui-monospace, monospace" fontWeight="bold">
                    ⚡ NEW: Central Switch
                  </text>
                </g>
              </>
            )}

            {/* Switch Body */}
            <rect
              x="375"
              y="415"
              width="250"
              height="70"
              rx="8"
              fill="url(#switchGrad)"
              stroke={isHighlighted('switch-box') ? '#3B82F6' : '#334155'}
              strokeWidth="2"
              className="transition-colors group-hover:stroke-blue-400"
            />

            {/* Switch label */}
            <text
              x="500"
              y="435"
              textAnchor="middle"
              fill="#94A3B8"
              fontSize="9"
              fontFamily="ui-monospace, monospace"
              fontWeight="600"
              letterSpacing="1"
            >
              4-PORT ACCESS SWITCH
            </text>

            {/* 4 Ports & LEDs */}
            {[
              { port: 1, x: 430, led: portLeds.p1, cableKey: 'a' as const },
              { port: 2, x: 475, led: portLeds.p2, cableKey: 'b' as const },
              { port: 3, x: 525, led: portLeds.p3, cableKey: 'c' as const },
              { port: 4, x: 570, led: portLeds.p4, cableKey: null },
            ].map((p) => {
              const isUnplugged = p.cableKey ? !cables[p.cableKey] : false;
              return (
                <g
                  key={`port-${p.port}`}
                  onClick={(e) => {
                    if (isUnplugged && p.cableKey) {
                      e.stopPropagation();
                      handleCableClick(p.cableKey);
                    }
                  }}
                  className={isUnplugged ? 'cursor-pointer group/port' : undefined}
                >
                  {/* Port LED (8px) */}
                  <circle
                    cx={p.x}
                    cy="448"
                    r="4"
                    fill={p.led === 'green' ? '#22C55E' : p.led === 'blinking' ? '#38BDF8' : '#334155'}
                    filter={p.led === 'green' ? 'url(#softGlow)' : undefined}
                  />
                  {/* RJ45 Socket */}
                  <rect
                    x={p.x - 10}
                    y="456"
                    width="20"
                    height="16"
                    rx="3"
                    fill="#0F172A"
                    stroke={isUnplugged ? '#38BDF8' : '#475569'}
                    strokeWidth={isUnplugged ? 2 : 1.5}
                    className={isUnplugged ? 'group-hover/port:stroke-sky-300 transition-colors' : undefined}
                  />
                  {/* Port Number [1] [2] [3] [4] */}
                  <text
                    x={p.x}
                    y="480"
                    textAnchor="middle"
                    fill={isUnplugged ? '#38BDF8' : '#64748B'}
                    fontSize="8"
                    fontFamily="ui-monospace, monospace"
                    fontWeight="bold"
                  >
                    [{p.port}]
                  </text>
                </g>
              );
            })}
          </g>

          {/* ========================================================================= */}
          {/* COMPUTER A (LEFT: x 95 to 275, y 170 to 295)                              */}
          {/* ========================================================================= */}
          <g
            id="computer-a"
            opacity={isDimmed('comp-a') ? 0.35 : 1}
            className="transition-opacity duration-300"
          >
            {/* Monitor Stand */}
            <path d="M165 295 L205 295 L215 325 L155 325 Z" fill="#1E293B" />
            <rect x="145" y="325" width="80" height="10" rx="3" fill="#334155" />

            {/* Monitor Frame */}
            <rect
              x="95"
              y="170"
              width="180"
              height="125"
              rx="10"
              fill="#0F172A"
              stroke={isHighlighted('comp-a') ? '#3B82F6' : '#334155'}
              strokeWidth={isHighlighted('comp-a') ? 3 : 2}
            />

            {/* Screen Glass */}
            <rect x="105" y="180" width="160" height="105" rx="5" fill="#020617" />

            {/* Terminal prompt symbol `>_` */}
            <text
              x="120"
              y="205"
              fill="#38BDF8"
              fontSize="14"
              fontFamily="ui-monospace, monospace"
              fontWeight="bold"
            >
              &gt;_
            </text>

            {/* Cable Socket */}
            <rect x="180" y="290" width="10" height="12" rx="2" fill="#0F172A" stroke="#64748B" strokeWidth="1" />

            {/* Link LED */}
            <circle
              cx="174"
              cy="296"
              r="4.5"
              fill={cables.a ? '#22C55E' : '#334155'}
              filter={cables.a ? 'url(#softGlow)' : undefined}
            />
          </g>

          {/* ========================================================================= */}
          {/* COMPUTER B (CENTER: x 410 to 590, y 170 to 295)                           */}
          {/* ========================================================================= */}
          <g
            id="computer-b"
            opacity={isDimmed('comp-b') ? 0.35 : 1}
            className="transition-opacity duration-300"
          >
            {/* Stand */}
            <path d="M480 295 L520 295 L530 325 L470 325 Z" fill="#1E293B" />
            <rect x="460" y="325" width="80" height="10" rx="3" fill="#334155" />

            {/* Monitor Frame */}
            <rect
              x="410"
              y="170"
              width="180"
              height="125"
              rx="10"
              fill="#0F172A"
              stroke={isHighlighted('comp-b') ? '#3B82F6' : '#334155'}
              strokeWidth={isHighlighted('comp-b') ? 3 : 2}
            />

            {/* Screen Glass */}
            <rect x="420" y="180" width="160" height="105" rx="5" fill="#020617" />

            <text x="435" y="205" fill="#64748B" fontSize="12" fontFamily="ui-monospace, monospace">
              Friend
            </text>

            {/* Socket & Link LED */}
            <rect x="495" y="290" width="10" height="12" rx="2" fill="#0F172A" stroke="#64748B" strokeWidth="1" />
            <circle
              cx="489"
              cy="296"
              r="4.5"
              fill={cables.b ? '#22C55E' : '#334155'}
              filter={cables.b ? 'url(#softGlow)' : undefined}
            />
          </g>

          {/* ========================================================================= */}
          {/* COMPUTER C (RIGHT: x 725 to 905, y 170 to 295)                            */}
          {/* ========================================================================= */}
          <g
            id="computer-c"
            opacity={isDimmed('comp-c') ? 0.35 : 1}
            className="transition-opacity duration-300"
          >
            {/* Stand */}
            <path d="M795 295 L835 295 L845 325 L785 325 Z" fill="#1E293B" />
            <rect x="775" y="325" width="80" height="10" rx="3" fill="#334155" />

            {/* Monitor Frame */}
            <rect
              x="725"
              y="170"
              width="180"
              height="125"
              rx="10"
              fill="#0F172A"
              stroke={isHighlighted('comp-c') ? '#3B82F6' : '#334155'}
              strokeWidth={isHighlighted('comp-c') ? 3 : 2}
            />

            {/* Screen Glass */}
            <rect x="735" y="180" width="160" height="105" rx="5" fill="#020617" />

            <text x="750" y="205" fill="#64748B" fontSize="12" fontFamily="ui-monospace, monospace">
              Third
            </text>

            {/* Socket & Link LED */}
            <rect x="810" y="290" width="10" height="12" rx="2" fill="#0F172A" stroke="#64748B" strokeWidth="1" />
            <circle
              cx="804"
              cy="296"
              r="4.5"
              fill={cables.c ? '#22C55E' : '#334155'}
              filter={cables.c ? 'url(#softGlow)' : undefined}
            />
          </g>

          {/* ========================================================================= */}
          {/* ANIMATED PACKETS: PING PULSE & ROLL-CALL ARP BROADCAST EXPANDING WAVES    */}
          {/* ========================================================================= */}
          <AnimatePresence>
            {/* Direct Ping Pulse: Computer A -> Switch Port 1 -> Port 2 -> Computer B */}
            {messageState === 'ping-a-b' && (
              <motion.g id="pulse-ping-a-b">
                <motion.circle
                  r="7"
                  fill="#10B981"
                  filter="url(#softGlow)"
                  animate={{
                    cx: [185, 430, 475, 500, 475, 430, 185],
                    cy: [296, 448, 448, 296, 448, 448, 296],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.g>
            )}

            {/* Roll-Call ARP Broadcast Waves & Cable Fan-Out */}
            {(messageState === 'arp-broadcast' || messageState === 'arp-silent') && (
              <motion.g id="pulse-arp-fanout">
                {/* Concentric radar roll-call rings radiating out from the switch */}
                {[0, 0.5, 1.0].map((d, i) => (
                  <motion.circle
                    key={`arp-ring-${i}`}
                    cx="500"
                    cy="448"
                    r="25"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    initial={{ r: 25, opacity: 0.8 }}
                    animate={{ r: [25, 340], opacity: [0.8, 0] }}
                    transition={{
                      duration: 2.4,
                      delay: d,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                ))}

                {/* Wave down from A to Port 1 */}
                <motion.circle
                  r="8"
                  fill="#F59E0B"
                  filter="url(#goldGlow)"
                  animate={{
                    cx: [185, 430],
                    cy: [296, 448],
                  }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Wave out Port 2 to Friend's computer */}
                <motion.circle
                  r="8"
                  fill="#F59E0B"
                  filter="url(#goldGlow)"
                  animate={{
                    cx: [475, 500],
                    cy: [448, 296],
                  }}
                  transition={{
                    duration: 0.9,
                    delay: 0.45,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />

                {/* Wave out Port 3 to Third computer */}
                <motion.circle
                  r="8"
                  fill="#F59E0B"
                  filter="url(#goldGlow)"
                  animate={{
                    cx: [525, 815],
                    cy: [448, 296],
                  }}
                  transition={{
                    duration: 0.9,
                    delay: 0.45,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              </motion.g>
            )}
          </AnimatePresence>

          {/* ========================================================================= */}
          {/* NATIVE SVG LABELS, TAGS & BADGES (Zero Overlap Guaranteed by Vector Math) */}
          {/* ========================================================================= */}

          {/* ---------------- Your Computer (Left: x = 185) ---------------- */}
          <g id="comp-a-labels" opacity={isDimmed('comp-a') ? 0.35 : 1}>
            {/* Address Tag Pill */}
            {showAddressTags && tags.a !== 'hidden' && (
              <g
                id="comp-a-tag"
                transform="translate(185, 78)"
                onClick={() => onSelectTag?.('a')}
                className="cursor-pointer group transition-opacity duration-300"
                opacity={activeLayer === 'tags' ? 0.35 : 1}
                role="button"
                aria-label="Your Computer IP Address Tag"
              >
                <rect
                  x="-65"
                  y="-13"
                  width="130"
                  height="26"
                  rx="13"
                  fill="#0F172A"
                  stroke={activeLayer === 'addresses' ? '#3B82F6' : '#334155'}
                  strokeWidth={activeLayer === 'addresses' ? 2 : 1.5}
                  className="group-hover:stroke-blue-400 transition-colors"
                />
                {tags.a === 'not-set' ? (
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#F59E0B"
                    fontSize="11"
                    fontFamily="ui-monospace, monospace"
                    fontWeight="bold"
                  >
                    not set
                  </text>
                ) : tags.a === 'question' ? (
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#38BDF8"
                    fontSize="11"
                    fontFamily="ui-monospace, monospace"
                    fontWeight="bold"
                  >
                    ???
                  </text>
                ) : typeof tags.a === 'object' && 'street' in tags.a ? (
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fontFamily="ui-monospace, monospace"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    <tspan fill={tags.a.street === '192.168.2' ? '#C084FC' : '#60A5FA'}>
                      {tags.a.street}
                    </tspan>
                    <tspan fill="#64748B">.</tspan>
                    <tspan fill="#FBBF24">{tags.a.house}</tspan>
                  </text>
                ) : null}
              </g>
            )}

            {/* MAC Badge Pill */}
            {showMacBadges && (
              <g
                id="comp-a-mac"
                transform="translate(185, 112)"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMacClick('a');
                }}
                className="cursor-pointer group transition-opacity duration-300"
                opacity={activeLayer === 'addresses' ? 0.35 : 1}
                role="button"
                aria-label="Your Computer MAC Badge"
              >
                <rect
                  x="-75"
                  y="-11"
                  width="150"
                  height="22"
                  rx="4"
                  fill="#020617"
                  stroke={activeLayer === 'tags' || macGlow.a || isHighlighted('mac-a') ? '#F59E0B' : '#1E293B'}
                  strokeWidth={activeLayer === 'tags' || macGlow.a || isHighlighted('mac-a') ? 1.5 : 1}
                  filter={activeLayer === 'tags' || macGlow.a || isHighlighted('mac-a') ? 'url(#goldGlow)' : undefined}
                  className="group-hover:stroke-amber-400 transition-colors"
                />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill={activeLayer === 'tags' || macGlow.a || isHighlighted('mac-a') ? '#FCD34D' : '#94A3B8'}
                  fontSize="9.5"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="600"
                  letterSpacing="0.3"
                >
                  MAC: {macBadges.a}
                </text>
              </g>
            )}

            {/* Computer Title */}
            <text
              x="185"
              y="146"
              textAnchor="middle"
              fill="#E2E8F0"
              fontSize="13"
              fontWeight="600"
            >
              Your computer
            </text>

            {/* Link Light Status */}
            <text
              x="185"
              y="356"
              textAnchor="middle"
              fill={cables.a ? '#34D399' : '#64748B'}
              fontSize="11"
              fontFamily="ui-monospace, monospace"
              fontWeight="600"
            >
              Link light: {cables.a ? 'ON' : 'OFF'}
            </text>
          </g>

          {/* ---------------- Friend's Computer (Center: x = 500) ---------------- */}
          <g id="comp-b-labels" opacity={isDimmed('comp-b') ? 0.35 : 1}>
            {/* Address Tag Pill */}
            {showAddressTags && tags.b !== 'hidden' && (
              <g
                id="comp-b-tag"
                transform="translate(500, 78)"
                onClick={() => onSelectTag?.('b')}
                className="cursor-pointer group transition-opacity duration-300"
                opacity={activeLayer === 'tags' ? 0.35 : 1}
                role="button"
                aria-label="Friend's Computer IP Address Tag"
              >
                <rect
                  x="-65"
                  y="-13"
                  width="130"
                  height="26"
                  rx="13"
                  fill="#0F172A"
                  stroke={activeLayer === 'addresses' ? '#3B82F6' : '#334155'}
                  strokeWidth={activeLayer === 'addresses' ? 2 : 1.5}
                  className="group-hover:stroke-blue-400 transition-colors"
                />
                {tags.b === 'not-set' ? (
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#F59E0B"
                    fontSize="11"
                    fontFamily="ui-monospace, monospace"
                    fontWeight="bold"
                  >
                    not set
                  </text>
                ) : tags.b === 'question' ? (
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#38BDF8"
                    fontSize="11"
                    fontFamily="ui-monospace, monospace"
                    fontWeight="bold"
                  >
                    ???
                  </text>
                ) : typeof tags.b === 'object' && 'street' in tags.b ? (
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fontFamily="ui-monospace, monospace"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    <tspan fill={tags.b.street === '192.168.2' ? '#C084FC' : '#60A5FA'}>
                      {tags.b.street}
                    </tspan>
                    <tspan fill="#64748B">.</tspan>
                    <tspan fill="#FBBF24">{tags.b.house}</tspan>
                  </text>
                ) : null}
              </g>
            )}

            {/* MAC Badge Pill */}
            {showMacBadges && (
              <g
                id="comp-b-mac"
                transform="translate(500, 112)"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMacClick('b');
                }}
                className="cursor-pointer group transition-opacity duration-300"
                opacity={activeLayer === 'addresses' ? 0.35 : 1}
                role="button"
                aria-label="Friend's Computer MAC Badge"
              >
                <rect
                  x="-75"
                  y="-11"
                  width="150"
                  height="22"
                  rx="4"
                  fill="#020617"
                  stroke={activeLayer === 'tags' || macGlow.b || isHighlighted('mac-b') ? '#F59E0B' : '#1E293B'}
                  strokeWidth={activeLayer === 'tags' || macGlow.b || isHighlighted('mac-b') ? 1.5 : 1}
                  filter={activeLayer === 'tags' || macGlow.b || isHighlighted('mac-b') ? 'url(#goldGlow)' : undefined}
                  className="group-hover:stroke-amber-400 transition-colors"
                />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill={activeLayer === 'tags' || macGlow.b || isHighlighted('mac-b') ? '#FCD34D' : '#94A3B8'}
                  fontSize="9.5"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="600"
                  letterSpacing="0.3"
                >
                  MAC: {macBadges.b}
                </text>
              </g>
            )}

            {/* Computer Title */}
            <text
              x="500"
              y="146"
              textAnchor="middle"
              fill="#E2E8F0"
              fontSize="13"
              fontWeight="600"
            >
              Friend’s computer
            </text>

            {/* Link Light Status */}
            <text
              x="500"
              y="356"
              textAnchor="middle"
              fill={cables.b ? '#34D399' : '#64748B'}
              fontSize="11"
              fontFamily="ui-monospace, monospace"
              fontWeight="600"
            >
              Link light: {cables.b ? 'ON' : 'OFF'}
            </text>
          </g>

          {/* ---------------- Third Computer (Right: x = 815) ---------------- */}
          <g id="comp-c-labels" opacity={isDimmed('comp-c') ? 0.35 : 1}>
            {/* Address Tag Pill */}
            {showAddressTags && tags.c !== 'hidden' && (
              <g
                id="comp-c-tag"
                transform="translate(815, 78)"
                onClick={() => onSelectTag?.('c')}
                className="cursor-pointer group transition-opacity duration-300"
                opacity={activeLayer === 'tags' ? 0.35 : 1}
                role="button"
                aria-label="Third Computer IP Address Tag"
              >
                <rect
                  x="-65"
                  y="-13"
                  width="130"
                  height="26"
                  rx="13"
                  fill="#0F172A"
                  stroke={activeLayer === 'addresses' ? '#3B82F6' : '#334155'}
                  strokeWidth={activeLayer === 'addresses' ? 2 : 1.5}
                  className="group-hover:stroke-blue-400 transition-colors"
                />
                {tags.c === 'not-set' ? (
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#F59E0B"
                    fontSize="11"
                    fontFamily="ui-monospace, monospace"
                    fontWeight="bold"
                  >
                    not set
                  </text>
                ) : tags.c === 'question' ? (
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#38BDF8"
                    fontSize="11"
                    fontFamily="ui-monospace, monospace"
                    fontWeight="bold"
                  >
                    ???
                  </text>
                ) : typeof tags.c === 'object' && 'street' in tags.c ? (
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fontFamily="ui-monospace, monospace"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    <tspan fill={tags.c.street === '192.168.2' ? '#C084FC' : '#60A5FA'}>
                      {tags.c.street}
                    </tspan>
                    <tspan fill="#64748B">.</tspan>
                    <tspan fill="#FBBF24">{tags.c.house}</tspan>
                  </text>
                ) : null}
              </g>
            )}

            {/* MAC Badge Pill */}
            {showMacBadges && (
              <g
                id="comp-c-mac"
                transform="translate(815, 112)"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMacClick('c');
                }}
                className="cursor-pointer group transition-opacity duration-300"
                opacity={activeLayer === 'addresses' ? 0.35 : 1}
                role="button"
                aria-label="Third Computer MAC Badge"
              >
                <rect
                  x="-75"
                  y="-11"
                  width="150"
                  height="22"
                  rx="4"
                  fill="#020617"
                  stroke={activeLayer === 'tags' || macGlow.c || isHighlighted('mac-c') ? '#F59E0B' : '#1E293B'}
                  strokeWidth={activeLayer === 'tags' || macGlow.c || isHighlighted('mac-c') ? 1.5 : 1}
                  filter={activeLayer === 'tags' || macGlow.c || isHighlighted('mac-c') ? 'url(#goldGlow)' : undefined}
                  className="group-hover:stroke-amber-400 transition-colors"
                />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill={activeLayer === 'tags' || macGlow.c || isHighlighted('mac-c') ? '#FCD34D' : '#94A3B8'}
                  fontSize="9.5"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="600"
                  letterSpacing="0.3"
                >
                  MAC: {macBadges.c}
                </text>
              </g>
            )}

            {/* Computer Title */}
            <text
              x="815"
              y="146"
              textAnchor="middle"
              fill="#E2E8F0"
              fontSize="13"
              fontWeight="600"
            >
              Third computer
            </text>

            {/* Link Light Status */}
            <text
              x="815"
              y="356"
              textAnchor="middle"
              fill={cables.c ? '#34D399' : '#64748B'}
              fontSize="11"
              fontFamily="ui-monospace, monospace"
              fontWeight="600"
            >
              Link light: {cables.c ? 'ON' : 'OFF'}
            </text>
          </g>

          {/* ---------------- ARP Roll Call Bubble (Concept 3) ---------------- */}
          {(messageState === 'arp-broadcast' || messageState === 'arp-silent') && (
            <g
              id="arp-broadcast-bubble"
              onClick={() => {
                if (soundEnabled) soundFx.playSuccess();
                onBroadcast?.();
              }}
              className="transition-all duration-300 cursor-pointer group"
              role="button"
              aria-label="Broadcast ARP Roll Call Question"
            >
              <rect
                x="310"
                y="502"
                width="380"
                height="32"
                rx="16"
                fill="#451A03"
                stroke="#D97706"
                strokeWidth="1.5"
                filter="url(#softGlow)"
                className="group-hover:stroke-amber-400 group-hover:fill-amber-900/60 transition-colors"
              />
              <circle cx="330" cy="518" r="4.5" fill="#FBBF24" />
              <text
                x="505"
                y="522"
                textAnchor="middle"
                fill="#FDE68A"
                fontSize="11"
                fontFamily="ui-monospace, monospace"
                fontWeight="bold"
                className="group-hover:fill-white transition-colors"
              >
                ARP: Who has 192.168.1.20? Tell 192.168.1.10
              </text>
            </g>
          )}
        </svg>

        {/* Floating Broadcast Action Button */}
        {onBroadcast && (messageState === 'arp-broadcast' || messageState === 'arp-silent') && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-auto">
            <button
              type="button"
              onClick={() => {
                if (soundEnabled) soundFx.playSuccess();
                onBroadcast();
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans text-xs font-bold tracking-wide shadow-xl shadow-amber-500/30 border border-amber-300 transition-all flex items-center gap-2 cursor-pointer active:scale-95 animate-pulse"
            >
              <span>⚡ Broadcast ARP Question (Shout to Room)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
