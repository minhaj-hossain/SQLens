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
  readOnly = false,
  className = '',
}) => {
  const [soundEnabled, setSoundEnabled] = useState(false);

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
    a: '00-1A-2B-3C-4D-10',
    b: '00-1A-2B-3C-4D-20',
    c: '00-1A-2B-3C-4D-30',
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
      className={`relative w-full rounded-2xl bg-[#0B101B] border border-zinc-800 shadow-2xl overflow-hidden select-none transition-all duration-300 ${className}`}
      data-testid="physical-switch-canvas"
      role="region"
      aria-label="Physical Switch Connection Canvas"
    >
      {/* Top telemetry & replay controls */}
      <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between text-xs font-mono pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold tracking-wider uppercase transition-colors ${
              isAllConnected
                ? 'bg-emerald-950/80 border-emerald-600/70 text-emerald-300'
                : 'bg-zinc-900/90 border-zinc-700/80 text-zinc-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isAllConnected
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : 'bg-zinc-500'
              }`}
            />
            {isAllConnected
              ? 'Switch: 3 Ports Linked (100 Mbps)'
              : 'Switch: Link Disconnected'}
          </span>
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

      {/* SVG Canvas Area (viewBox 0 0 1000 620) */}
      <div className="relative w-full aspect-[16/10] max-h-[580px]">
        <svg
          viewBox="0 0 1000 620"
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

          {/* DESK GROUND (y 470 to 620) */}
          <rect x="0" y="470" width="1000" height="150" fill="url(#deskGrad)" />
          <line x1="0" y1="470" x2="1000" y2="470" stroke="#1E293B" strokeWidth="2" />

          {/* SHARED STREET BLUE BAND (y 525) */}
          {showBands && (
            <g className="transition-opacity duration-500">
              <rect
                x="80"
                y="525"
                width="840"
                height="32"
                rx="16"
                fill="#2563EB"
                fillOpacity="0.18"
                stroke="#2563EB"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x="500"
                y="546"
                textAnchor="middle"
                fill="#60A5FA"
                fontSize="12"
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
              >
                Neighborhood Street: 192.168.1.x (Shared Star Topology)
              </text>
            </g>
          )}

          {/* ========================================================================= */}
          {/* CABLES (Computer A, B, C -> Switch Ports 1, 2, 3)                         */}
          {/* ========================================================================= */}

          {/* Cable A: Computer A (185, 310) -> Switch Port 1 (430, 405) */}
          {cables.a ? (
            <g
              id="cable-a"
              onClick={() => handleCableClick('a')}
              className="cursor-pointer group"
            >
              <path
                d="M 185 310 C 185 390, 360 405, 430 405"
                fill="none"
                stroke="#2563EB"
                strokeWidth="6"
                strokeLinecap="round"
                className="transition-colors group-hover:stroke-blue-400"
              />
              <path
                d="M 185 310 C 185 390, 360 405, 430 405"
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
                d="M 185 310 C 185 370, 240 450, 290 460"
                fill="none"
                stroke="#64748B"
                strokeWidth="5"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
              <circle cx="290" cy="460" r="5" fill="#EF4444" />
            </g>
          )}

          {/* Cable B: Computer B (500, 290) -> Switch Port 2 (475, 405) */}
          {cables.b ? (
            <g
              id="cable-b"
              onClick={() => handleCableClick('b')}
              className="cursor-pointer group"
            >
              <path
                d="M 500 290 C 500 350, 475 365, 475 405"
                fill="none"
                stroke="#2563EB"
                strokeWidth="6"
                strokeLinecap="round"
                className="transition-colors group-hover:stroke-blue-400"
              />
              <path
                d="M 500 290 C 500 350, 475 365, 475 405"
                fill="none"
                stroke="#60A5FA"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.7"
              />
            </g>
          ) : (
            <g id="cable-b-unplugged" onClick={() => handleCableClick('b')} className="cursor-pointer">
              <path
                d="M 500 290 C 500 340, 460 380, 440 410"
                fill="none"
                stroke="#64748B"
                strokeWidth="5"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
              <circle cx="440" cy="410" r="5" fill="#EF4444" />
            </g>
          )}

          {/* Cable C: Computer C (815, 310) -> Switch Port 3 (525, 405) */}
          {cables.c ? (
            <g
              id="cable-c"
              onClick={() => handleCableClick('c')}
              className="cursor-pointer group"
            >
              <path
                d="M 815 310 C 815 390, 600 405, 525 405"
                fill="none"
                stroke="#2563EB"
                strokeWidth="6"
                strokeLinecap="round"
                className="transition-colors group-hover:stroke-blue-400"
              />
              <path
                d="M 815 310 C 815 390, 600 405, 525 405"
                fill="none"
                stroke="#60A5FA"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.7"
              />
            </g>
          ) : (
            <g id="cable-c-unplugged" onClick={() => handleCableClick('c')} className="cursor-pointer">
              <path
                d="M 815 310 C 815 370, 750 450, 690 460"
                fill="none"
                stroke="#64748B"
                strokeWidth="5"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
              <circle cx="690" cy="460" r="5" fill="#EF4444" />
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
              <rect
                x="370"
                y="365"
                width="260"
                height="70"
                rx="10"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
                filter="url(#softGlow)"
              />
            )}

            {/* Switch Body */}
            <rect
              x="375"
              y="370"
              width="250"
              height="65"
              rx="8"
              fill="url(#switchGrad)"
              stroke={isHighlighted('switch-box') ? '#3B82F6' : '#334155'}
              strokeWidth="2"
              className="transition-colors group-hover:stroke-blue-400"
            />

            {/* Switch label */}
            <text
              x="500"
              y="390"
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
              { port: 1, x: 430, led: portLeds.p1 },
              { port: 2, x: 475, led: portLeds.p2 },
              { port: 3, x: 525, led: portLeds.p3 },
              { port: 4, x: 570, led: portLeds.p4 },
            ].map((p) => (
              <g key={`port-${p.port}`}>
                {/* Port LED (8px) */}
                <circle
                  cx={p.x}
                  cy="400"
                  r="4"
                  fill={p.led === 'green' ? '#22C55E' : p.led === 'blinking' ? '#38BDF8' : '#334155'}
                  filter={p.led === 'green' ? 'url(#softGlow)' : undefined}
                />
                {/* RJ45 Socket */}
                <rect
                  x={p.x - 10}
                  y="408"
                  width="20"
                  height="16"
                  rx="3"
                  fill="#0F172A"
                  stroke="#475569"
                  strokeWidth="1.5"
                />
                {/* Port Number [1] [2] [3] [4] */}
                <text
                  x={p.x}
                  y="432"
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="8"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="bold"
                >
                  [{p.port}]
                </text>
              </g>
            ))}
          </g>

          {/* ========================================================================= */}
          {/* COMPUTER A (LEFT: x 95 to 275, y 180 to 320)                              */}
          {/* ========================================================================= */}
          <g
            id="computer-a"
            opacity={isDimmed('comp-a') ? 0.35 : 1}
            className="transition-opacity duration-300"
          >
            {/* Monitor Stand */}
            <path d="M165 305 L205 305 L215 335 L155 335 Z" fill="#1E293B" />
            <rect x="145" y="335" width="80" height="10" rx="3" fill="#334155" />

            {/* Monitor Frame */}
            <rect
              x="95"
              y="180"
              width="180"
              height="125"
              rx="10"
              fill="#0F172A"
              stroke={isHighlighted('comp-a') ? '#3B82F6' : '#334155'}
              strokeWidth={isHighlighted('comp-a') ? 3 : 2}
            />

            {/* Screen Glass */}
            <rect x="105" y="190" width="160" height="105" rx="5" fill="#020617" />

            {/* Terminal prompt symbol `>_` */}
            <text
              x="120"
              y="215"
              fill="#38BDF8"
              fontSize="14"
              fontFamily="ui-monospace, monospace"
              fontWeight="bold"
            >
              &gt;_
            </text>

            {/* Cable Socket */}
            <rect x="180" y="300" width="10" height="12" rx="2" fill="#0F172A" stroke="#64748B" strokeWidth="1" />

            {/* Link LED */}
            <circle
              cx="174"
              cy="306"
              r="4.5"
              fill={cables.a ? '#22C55E' : '#334155'}
              filter={cables.a ? 'url(#softGlow)' : undefined}
            />
          </g>

          {/* ========================================================================= */}
          {/* COMPUTER B (CENTER: x 410 to 590, y 160 to 300)                           */}
          {/* ========================================================================= */}
          <g
            id="computer-b"
            opacity={isDimmed('comp-b') ? 0.35 : 1}
            className="transition-opacity duration-300"
          >
            {/* Stand */}
            <path d="M480 285 L520 285 L530 315 L470 315 Z" fill="#1E293B" />
            <rect x="460" y="315" width="80" height="10" rx="3" fill="#334155" />

            {/* Monitor Frame */}
            <rect
              x="410"
              y="160"
              width="180"
              height="125"
              rx="10"
              fill="#0F172A"
              stroke={isHighlighted('comp-b') ? '#3B82F6' : '#334155'}
              strokeWidth={isHighlighted('comp-b') ? 3 : 2}
            />

            {/* Screen Glass */}
            <rect x="420" y="170" width="160" height="105" rx="5" fill="#020617" />

            <text x="435" y="195" fill="#64748B" fontSize="12" fontFamily="ui-monospace, monospace">
              Teammate
            </text>

            {/* Socket & Link LED */}
            <rect x="495" y="280" width="10" height="12" rx="2" fill="#0F172A" stroke="#64748B" strokeWidth="1" />
            <circle
              cx="489"
              cy="286"
              r="4.5"
              fill={cables.b ? '#22C55E' : '#334155'}
              filter={cables.b ? 'url(#softGlow)' : undefined}
            />
          </g>

          {/* ========================================================================= */}
          {/* COMPUTER C (RIGHT: x 725 to 905, y 180 to 320)                            */}
          {/* ========================================================================= */}
          <g
            id="computer-c"
            opacity={isDimmed('comp-c') ? 0.35 : 1}
            className="transition-opacity duration-300"
          >
            {/* Stand */}
            <path d="M795 305 L835 305 L845 335 L785 335 Z" fill="#1E293B" />
            <rect x="775" y="335" width="80" height="10" rx="3" fill="#334155" />

            {/* Monitor Frame */}
            <rect
              x="725"
              y="180"
              width="180"
              height="125"
              rx="10"
              fill="#0F172A"
              stroke={isHighlighted('comp-c') ? '#3B82F6' : '#334155'}
              strokeWidth={isHighlighted('comp-c') ? 3 : 2}
            />

            {/* Screen Glass */}
            <rect x="735" y="190" width="160" height="105" rx="5" fill="#020617" />

            <text x="750" y="215" fill="#64748B" fontSize="12" fontFamily="ui-monospace, monospace">
              Desk C
            </text>

            {/* Socket & Link LED */}
            <rect x="810" y="300" width="10" height="12" rx="2" fill="#0F172A" stroke="#64748B" strokeWidth="1" />
            <circle
              cx="804"
              cy="306"
              r="4.5"
              fill={cables.c ? '#22C55E' : '#334155'}
              filter={cables.c ? 'url(#softGlow)' : undefined}
            />
          </g>

          {/* ========================================================================= */}
          {/* ANIMATED PACKETS: PING PULSE & GOLDEN ARP BROADCAST FAN-OUT               */}
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
                    cy: [310, 405, 405, 290, 405, 405, 310],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.g>
            )}

            {/* Golden ARP Broadcast Fan-Out: Port 1 -> Port 2 AND Port 3 */}
            {(messageState === 'arp-broadcast' || messageState === 'arp-silent') && (
              <motion.g id="pulse-arp-fanout">
                {/* Wave down from A to Port 1 */}
                <motion.circle
                  r="8"
                  fill="#F59E0B"
                  filter="url(#goldGlow)"
                  animate={{
                    cx: [185, 430],
                    cy: [310, 405],
                  }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Wave out Port 2 to Computer B */}
                <motion.circle
                  r="8"
                  fill="#F59E0B"
                  filter="url(#goldGlow)"
                  animate={{
                    cx: [475, 500],
                    cy: [405, 290],
                  }}
                  transition={{
                    duration: 0.9,
                    delay: 0.45,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />

                {/* Wave out Port 3 to Computer C */}
                <motion.circle
                  r="8"
                  fill="#F59E0B"
                  filter="url(#goldGlow)"
                  animate={{
                    cx: [525, 815],
                    cy: [405, 310],
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
        </svg>

        {/* ========================================================================= */}
        {/* HTML OVERLAYS: Strictly Crisp HTML Positioned by Percentage               */}
        {/* ========================================================================= */}

        {/* Computer A Overlays (18.5% left) */}
        <div
          className="absolute text-center transform -translate-x-1/2 pointer-events-none"
          style={{ left: '18.5%', top: '56%' }}
        >
          <div className="text-sm font-semibold text-zinc-200">Computer A (You)</div>
          <div
            className={`text-xs font-mono font-medium ${
              cables.a ? 'text-emerald-400' : 'text-zinc-500'
            }`}
          >
            Light: {cables.a ? 'ON' : 'OFF'}
          </div>
        </div>

        {/* Address & MAC Tag Above Computer A */}
        <div
          className="absolute transform -translate-x-1/2 pointer-events-auto cursor-pointer space-y-1 text-center"
          style={{ left: '18.5%', top: '14%' }}
          onClick={() => onSelectTag?.('a')}
        >
          {/* IP Tag */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 shadow-md font-mono text-xs sm:text-sm">
            <span className="text-blue-400 font-semibold">192.168.1</span>
            <span className="text-zinc-500">.</span>
            <span className="text-amber-400 font-semibold">10</span>
          </div>
          {/* MAC Badge */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleMacClick('a');
            }}
            className={`inline-block px-2 py-0.5 rounded bg-zinc-950 border font-mono text-[11px] transition-colors ${
              macGlow.a || isHighlighted('mac-a')
                ? 'border-amber-500 text-amber-300 shadow-[0_0_8px_#f59e0b]'
                : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            MAC: {macBadges.a}
          </div>
        </div>

        {/* Computer B Overlays (50% left) */}
        <div
          className="absolute text-center transform -translate-x-1/2 pointer-events-none"
          style={{ left: '50%', top: '52%' }}
        >
          <div className="text-sm font-semibold text-zinc-200">Computer B (Teammate)</div>
          <div
            className={`text-xs font-mono font-medium ${
              cables.b ? 'text-emerald-400' : 'text-zinc-500'
            }`}
          >
            Light: {cables.b ? 'ON' : 'OFF'}
          </div>
        </div>

        {/* Address & MAC Tag Above Computer B */}
        <div
          className="absolute transform -translate-x-1/2 pointer-events-auto cursor-pointer space-y-1 text-center"
          style={{ left: '50%', top: '10%' }}
          onClick={() => onSelectTag?.('b')}
        >
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 shadow-md font-mono text-xs sm:text-sm">
            <span className="text-blue-400 font-semibold">192.168.1</span>
            <span className="text-zinc-500">.</span>
            <span className="text-amber-400 font-semibold">20</span>
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleMacClick('b');
            }}
            className={`inline-block px-2 py-0.5 rounded bg-zinc-950 border font-mono text-[11px] transition-colors ${
              macGlow.b || isHighlighted('mac-b')
                ? 'border-amber-500 text-amber-300 shadow-[0_0_8px_#f59e0b]'
                : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            MAC: {macBadges.b}
          </div>
        </div>

        {/* Computer C Overlays (81.5% left) */}
        <div
          className="absolute text-center transform -translate-x-1/2 pointer-events-none"
          style={{ left: '81.5%', top: '56%' }}
        >
          <div className="text-sm font-semibold text-zinc-200">Computer C (New Desk)</div>
          <div
            className={`text-xs font-mono font-medium ${
              cables.c ? 'text-emerald-400' : 'text-zinc-500'
            }`}
          >
            Light: {cables.c ? 'ON' : 'OFF'}
          </div>
        </div>

        {/* Address & MAC Tag Above Computer C */}
        <div
          className="absolute transform -translate-x-1/2 pointer-events-auto cursor-pointer space-y-1 text-center"
          style={{ left: '81.5%', top: '14%' }}
          onClick={() => onSelectTag?.('c')}
        >
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 shadow-md font-mono text-xs sm:text-sm">
            {typeof tags.c === 'object' && 'street' in tags.c ? (
              <span>
                <span
                  className={
                    tags.c.street === '192.168.2' ? 'text-purple-400 font-semibold' : 'text-blue-400 font-semibold'
                  }
                >
                  {tags.c.street}
                </span>
                <span className="text-zinc-500">.</span>
                <span className="text-amber-400 font-semibold">{tags.c.house}</span>
              </span>
            ) : null}
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleMacClick('c');
            }}
            className={`inline-block px-2 py-0.5 rounded bg-zinc-950 border font-mono text-[11px] transition-colors ${
              macGlow.c || isHighlighted('mac-c')
                ? 'border-amber-500 text-amber-300 shadow-[0_0_8px_#f59e0b]'
                : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            MAC: {macBadges.c}
          </div>
        </div>

        {/* ARP Roll Call Bubble Overlay (Concept 3) */}
        {(messageState === 'arp-broadcast' || messageState === 'arp-silent') && (
          <div
            className="absolute transform -translate-x-1/2 pointer-events-none animate-in fade-in duration-300"
            style={{ left: '50%', top: '68%' }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-950/90 border border-amber-600/80 text-amber-300 font-mono text-xs shadow-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>ARP: Who has 192.168.1.20? Tell 192.168.1.10</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
