'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Day2StageState } from '../../../types/networking-day2';
import { Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';
import { soundFx } from '../../../lib/networking/audio-fx';

export interface PhysicalSwitchCanvasProps {
  stageState?: Day2StageState;
  onToggleCable?: (target: 'a' | 'b' | 'c') => void;
  onPlugAll?: () => void;
  onInspectSwitch?: () => void;
  onInspectMac?: (target: 'a' | 'b' | 'c') => void;
  onBroadcast?: () => void;
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
  onOpenLookInside,
  onReplay,
  readOnly = false,
  className = '',
}) => {
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Fallback defaults
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

  const isDimmed = (id: string) => dims.includes(id);
  const isHighlighted = (id: string) => highlights.includes(id);

  // Switch ports geometry
  // Switch box: x: 380, y: 380, w: 240, h: 70
  // Port 1: x: 410, y: 415
  // Port 2: x: 470, y: 415
  // Port 3: x: 530, y: 415
  // Port 4: x: 590, y: 415
  const portCoords = {
    p1: { x: 410, y: 415 },
    p2: { x: 470, y: 415 },
    p3: { x: 530, y: 415 },
    p4: { x: 590, y: 415 },
  };

  // Computers geometry
  const compA = { x: 180, y: 160, jackX: 180, jackY: 220 };
  const compB = { x: 500, y: 140, jackX: 500, jackY: 200 };
  const compC = { x: 820, y: 160, jackX: 820, jackY: 220 };

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
      className={`relative w-full rounded-2xl bg-[#090D16] border border-zinc-800 shadow-2xl overflow-hidden select-none transition-all duration-300 ${className}`}
      data-testid="physical-switch-canvas"
      role="region"
      aria-label="Physical Switch Topology Canvas"
    >
      {/* Top telemetry & status banner */}
      <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between text-xs font-mono pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold tracking-wider uppercase transition-colors ${
              portLeds.p1 === 'green' && portLeds.p2 === 'green' && portLeds.p3 === 'green'
                ? 'bg-emerald-950/80 border-emerald-600/70 text-emerald-300'
                : 'bg-amber-950/80 border-amber-600/70 text-amber-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                portLeds.p1 === 'green' && portLeds.p2 === 'green' && portLeds.p3 === 'green'
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />
            {portLeds.p1 === 'green' && portLeds.p2 === 'green' && portLeds.p3 === 'green'
              ? 'Switch: 3 Ports Linked'
              : 'Switch: Link Alert'}
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900/80 border border-zinc-800 text-[10px] text-zinc-400">
            Star Topology • 100BASE-TX
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {onBroadcast && (
            <button
              onClick={() => {
                if (soundEnabled) soundFx.playBeep();
                onBroadcast();
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 text-xs transition-colors"
              title="Broadcast ARP to everyone in the room"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Send Broadcast</span>
            </button>
          )}

          {onPlugAll && (!cables.a || !cables.b || !cables.c) && (
            <button
              onClick={() => {
                if (soundEnabled) soundFx.playCablePlug();
                onPlugAll();
              }}
              className="px-2.5 py-1 rounded-md bg-sky-500/20 border border-sky-500/50 text-sky-300 hover:bg-sky-500/30 text-xs transition-colors font-sans"
            >
              Connect All Cables
            </button>
          )}

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
            title={soundEnabled ? 'Mute lab sounds' : 'Enable lab sounds'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {onReplay && (
            <button
              onClick={onReplay}
              className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Replay animation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* SVG Stage */}
      <svg
        viewBox="0 0 1000 620"
        className="w-full h-auto max-h-[560px] block"
        style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))' }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="bgGridGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0B1220" />
            <stop offset="100%" stopColor="#060911" />
          </linearGradient>

          <linearGradient id="deskGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E2638" />
            <stop offset="15%" stopColor="#151C2C" />
            <stop offset="100%" stopColor="#0D111A" />
          </linearGradient>

          <linearGradient id="pcBezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A3347" />
            <stop offset="100%" stopColor="#151A26" />
          </linearGradient>

          <linearGradient id="switchGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1F2839" />
            <stop offset="50%" stopColor="#141B26" />
            <stop offset="100%" stopColor="#0C1017" />
          </linearGradient>

          <linearGradient id="cableGradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Background Grid & Shared Street Blue Band */}
        <rect width="1000" height="620" fill="url(#bgGridGrad)" />

        {/* Subtle grid lines */}
        <g stroke="#1F293D" strokeWidth="1" strokeDasharray="3 3" opacity="0.3">
          <line x1="0" y1="150" x2="1000" y2="150" />
          <line x1="0" y1="300" x2="1000" y2="300" />
          <line x1="0" y1="450" x2="1000" y2="450" />
          <line x1="250" y1="0" x2="250" y2="620" />
          <line x1="500" y1="0" x2="500" y2="620" />
          <line x1="750" y1="0" x2="750" y2="620" />
        </g>

        {/* Shared Blue Band (Street 192.168.1) */}
        {stageState?.bands !== 'hidden' && (
          <g id="shared-street-band" opacity={isDimmed('street-band') ? 0.35 : 1}>
            <rect
              x="60"
              y="275"
              width="880"
              height="34"
              rx="8"
              fill="#0284C7"
              fillOpacity="0.12"
              stroke="#0284C7"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <text
              x="500"
              y="297"
              textAnchor="middle"
              className="text-[12px] font-mono fill-sky-300 font-semibold tracking-wider select-none"
            >
              ═══════ Local Street: 192.168.1 (Shared Broadcast Domain) ═══════
            </text>
          </g>
        )}

        {/* Desk Surface */}
        <polygon
          points="20,490 980,490 1000,620 0,620"
          fill="url(#deskGrad)"
          stroke="#334155"
          strokeWidth="1"
        />
        <line x1="0" y1="490" x2="1000" y2="490" stroke="#475569" strokeWidth="1.5" />

        {/* 2. Three Category-6 Patch Cables */}
        {/* Cable A: Computer A (180, 220) -> Switch Port 1 (410, 415) */}
        {cables.a ? (
          <g
            id="cable-a"
            onClick={() => handleCableClick('a')}
            className="cursor-pointer group"
          >
            <path
              d="M 180 220 C 180 340, 360 415, 410 415"
              fill="none"
              stroke="#0284C7"
              strokeWidth="5"
              strokeLinecap="round"
              className="transition-all duration-300 group-hover:stroke-sky-300"
            />
            <circle cx="180" cy="220" r="4.5" fill="#38BDF8" />
            <circle cx="410" cy="415" r="4" fill="#38BDF8" />
          </g>
        ) : (
          <g id="cable-a-unplugged" onClick={() => handleCableClick('a')} className="cursor-pointer">
            <path
              d="M 180 220 C 180 320, 260 460, 310 480"
              fill="none"
              stroke="#64748B"
              strokeWidth="4"
              strokeDasharray="5 4"
              strokeLinecap="round"
            />
            <circle cx="310" cy="480" r="5" fill="#F43F5E" />
            <text x="325" y="485" className="text-[10px] font-mono fill-rose-400">Loose cable</text>
          </g>
        )}

        {/* Cable B: Computer B (500, 200) -> Switch Port 2 (470, 415) */}
        {cables.b ? (
          <g
            id="cable-b"
            onClick={() => handleCableClick('b')}
            className="cursor-pointer group"
          >
            <path
              d="M 500 200 C 500 300, 470 340, 470 415"
              fill="none"
              stroke="#0284C7"
              strokeWidth="5"
              strokeLinecap="round"
              className="transition-all duration-300 group-hover:stroke-sky-300"
            />
            <circle cx="500" cy="200" r="4.5" fill="#38BDF8" />
            <circle cx="470" cy="415" r="4" fill="#38BDF8" />
          </g>
        ) : (
          <g id="cable-b-unplugged" onClick={() => handleCableClick('b')} className="cursor-pointer">
            <path
              d="M 500 200 C 500 290, 460 360, 440 400"
              fill="none"
              stroke="#64748B"
              strokeWidth="4"
              strokeDasharray="5 4"
              strokeLinecap="round"
            />
            <circle cx="440" cy="400" r="5" fill="#F43F5E" />
            <text x="375" y="390" className="text-[10px] font-mono fill-rose-400">Unplugged</text>
          </g>
        )}

        {/* Cable C: Computer C (820, 220) -> Switch Port 3 (530, 415) */}
        {cables.c ? (
          <g
            id="cable-c"
            onClick={() => handleCableClick('c')}
            className="cursor-pointer group"
          >
            <path
              d="M 820 220 C 820 340, 600 415, 530 415"
              fill="none"
              stroke="#0284C7"
              strokeWidth="5"
              strokeLinecap="round"
              className="transition-all duration-300 group-hover:stroke-sky-300"
            />
            <circle cx="820" cy="220" r="4.5" fill="#38BDF8" />
            <circle cx="530" cy="415" r="4" fill="#38BDF8" />
          </g>
        ) : (
          <g id="cable-c-unplugged" onClick={() => handleCableClick('c')} className="cursor-pointer">
            <path
              d="M 820 220 C 820 320, 720 460, 660 480"
              fill="none"
              stroke="#64748B"
              strokeWidth="4"
              strokeDasharray="5 4"
              strokeLinecap="round"
            />
            <circle cx="660" cy="480" r="5" fill="#F43F5E" />
            <text x="675" y="485" className="text-[10px] font-mono fill-rose-400">Unplugged at Port 3</text>
          </g>
        )}

        {/* 3. The 4-Port Access Switch */}
        <g
          id="switch-box"
          onClick={handleSwitchClick}
          className="cursor-pointer group"
          opacity={isDimmed('switch-box') ? 0.35 : 1}
        >
          {/* Glow if highlighted */}
          {isHighlighted('switch-box') && (
            <rect
              x="368"
              y="370"
              width="264"
              height="80"
              rx="12"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="3"
              filter="url(#cyanGlow)"
              className="animate-pulse"
            />
          )}

          {/* Switch body */}
          <rect
            x="374"
            y="376"
            width="252"
            height="72"
            rx="10"
            fill="url(#switchGrad)"
            stroke="#475569"
            strokeWidth="2"
            className="transition-colors group-hover:stroke-sky-400"
          />

          {/* Top bezel line */}
          <line x1="384" y1="388" x2="616" y2="388" stroke="#334155" strokeWidth="1" />

          {/* Switch Label */}
          <text
            x="500"
            y="400"
            textAnchor="middle"
            className="text-[10px] font-mono fill-zinc-400 uppercase tracking-widest font-semibold"
          >
            4-Port Fast Ethernet Switch
          </text>

          {/* 4 Switch Ports & LEDs */}
          {([1, 2, 3, 4] as const).map((num) => {
            const portKey = `p${num}` as keyof typeof portLeds;
            const coords = portCoords[portKey];
            const ledState = portLeds[portKey];

            return (
              <g key={`port-${num}`}>
                {/* Port LED (8px circle above socket) */}
                <circle
                  cx={coords.x}
                  cy={coords.y - 14}
                  r="4"
                  fill={
                    ledState === 'green'
                      ? '#10B981'
                      : ledState === 'blinking'
                      ? '#34D399'
                      : '#374151'
                  }
                  className={ledState === 'blinking' ? 'animate-ping' : ''}
                />
                {ledState === 'green' && (
                  <circle
                    cx={coords.x}
                    cy={coords.y - 14}
                    r="6"
                    fill="#10B981"
                    opacity="0.3"
                    className="animate-pulse"
                  />
                )}

                {/* RJ45 Jack Socket */}
                <rect
                  x={coords.x - 12}
                  y={coords.y - 6}
                  width="24"
                  height="16"
                  rx="3"
                  fill="#0F172A"
                  stroke="#334155"
                  strokeWidth="1.5"
                />

                {/* Port Number [1], [2], [3], [4] */}
                <text
                  x={coords.x}
                  y={coords.y + 20}
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-zinc-400 font-bold"
                >
                  [{num}]
                </text>
              </g>
            );
          })}
        </g>

        {/* 4. Computer A (Your Workstation) */}
        <g
          id="comp-a"
          opacity={isDimmed('comp-a') ? 0.35 : 1}
          className={isHighlighted('comp-a') ? 'animate-pulse' : ''}
        >
          {/* Monitor */}
          <rect
            x="110"
            y="80"
            width="140"
            height="95"
            rx="8"
            fill="url(#pcBezelGrad)"
            stroke={isHighlighted('comp-a') ? '#38BDF8' : '#334155'}
            strokeWidth="2"
          />
          {/* Screen with terminal glow */}
          <rect
            x="118"
            y="88"
            width="124"
            height="79"
            rx="4"
            fill="#050811"
            stroke="#1E293B"
            strokeWidth="1"
          />
          {/* Terminal prompt symbol on screen */}
          <text x="126" y="105" className="text-[12px] font-mono fill-emerald-400 font-bold">
            &gt;_
          </text>
          <text x="142" y="105" className="text-[10px] font-mono fill-zinc-400">
            A: 192.168.1.10
          </text>

          {/* Stand */}
          <rect x="172" y="175" width="16" height="25" fill="#1E293B" />
          <ellipse cx="180" cy="200" rx="30" ry="6" fill="#0F172A" stroke="#334155" />

          {/* Workstation Label */}
          <text
            x="180"
            y="65"
            textAnchor="middle"
            className="text-[12px] font-sans fill-zinc-200 font-semibold"
          >
            Computer A (You)
          </text>

          {/* IP Tag (Street + House) */}
          <g id="tag-a">
            <rect
              x="115"
              y="22"
              width="130"
              height="24"
              rx="6"
              fill="#0F172A"
              stroke="#0284C7"
              strokeWidth="1.5"
            />
            <text
              x="180"
              y="38"
              textAnchor="middle"
              className="text-[11px] font-mono fill-sky-300 font-bold"
            >
              192.168.1 . 10
            </text>
          </g>

          {/* Monospace Hardware MAC Badge */}
          <g
            id="mac-a"
            onClick={() => handleMacClick('a')}
            className="cursor-pointer group"
          >
            <rect
              x="110"
              y="48"
              width="140"
              height="18"
              rx="4"
              fill="#18181B"
              stroke={macGlow.a || isHighlighted('mac-a') ? '#F59E0B' : '#3F3F46'}
              strokeWidth={macGlow.a || isHighlighted('mac-a') ? '2' : '1'}
              className="transition-colors group-hover:stroke-amber-400"
            />
            <text
              x="180"
              y="61"
              textAnchor="middle"
              className={`text-[9.5px] font-mono font-medium tracking-tight ${
                macGlow.a || isHighlighted('mac-a') ? 'fill-amber-300' : 'fill-zinc-400'
              }`}
            >
              MAC: {macBadges.a}
            </text>
          </g>
        </g>

        {/* 5. Computer B (Teammate / Friend) */}
        <g
          id="comp-b"
          opacity={isDimmed('comp-b') ? 0.35 : 1}
          className={isHighlighted('comp-b') ? 'animate-pulse' : ''}
        >
          {/* Monitor */}
          <rect
            x="430"
            y="60"
            width="140"
            height="95"
            rx="8"
            fill="url(#pcBezelGrad)"
            stroke={isHighlighted('comp-b') ? '#38BDF8' : '#334155'}
            strokeWidth="2"
          />
          {/* Screen */}
          <rect
            x="438"
            y="68"
            width="124"
            height="79"
            rx="4"
            fill="#050811"
            stroke="#1E293B"
            strokeWidth="1"
          />
          <text x="446" y="85" className="text-[10px] font-mono fill-zinc-500">
            B: 192.168.1.20
          </text>

          {/* Stand */}
          <rect x="492" y="155" width="16" height="25" fill="#1E293B" />
          <ellipse cx="500" cy="180" rx="30" ry="6" fill="#0F172A" stroke="#334155" />

          {/* Label */}
          <text
            x="500"
            y="45"
            textAnchor="middle"
            className="text-[12px] font-sans fill-zinc-200 font-semibold"
          >
            Computer B (Teammate)
          </text>

          {/* IP Tag */}
          <g id="tag-b">
            <rect
              x="435"
              y="2"
              width="130"
              height="24"
              rx="6"
              fill="#0F172A"
              stroke="#0284C7"
              strokeWidth="1.5"
            />
            <text
              x="500"
              y="18"
              textAnchor="middle"
              className="text-[11px] font-mono fill-sky-300 font-bold"
            >
              192.168.1 . 20
            </text>
          </g>

          {/* Monospace Hardware MAC Badge */}
          <g
            id="mac-b"
            onClick={() => handleMacClick('b')}
            className="cursor-pointer group"
          >
            <rect
              x="430"
              y="28"
              width="140"
              height="18"
              rx="4"
              fill="#18181B"
              stroke={macGlow.b || isHighlighted('mac-b') ? '#F59E0B' : '#3F3F46'}
              strokeWidth={macGlow.b || isHighlighted('mac-b') ? '2' : '1'}
              className="transition-colors group-hover:stroke-amber-400"
            />
            <text
              x="500"
              y="41"
              textAnchor="middle"
              className={`text-[9.5px] font-mono font-medium tracking-tight ${
                macGlow.b || isHighlighted('mac-b') ? 'fill-amber-300' : 'fill-zinc-400'
              }`}
            >
              MAC: {macBadges.b}
            </text>
          </g>
        </g>

        {/* 6. Computer C (Third Computer / Problem Machine) */}
        <g
          id="comp-c"
          opacity={isDimmed('comp-c') ? 0.35 : 1}
          className={isHighlighted('comp-c') ? 'animate-pulse' : ''}
        >
          {/* Monitor */}
          <rect
            x="750"
            y="80"
            width="140"
            height="95"
            rx="8"
            fill="url(#pcBezelGrad)"
            stroke={isHighlighted('comp-c') ? '#38BDF8' : '#334155'}
            strokeWidth="2"
          />
          {/* Screen */}
          <rect
            x="758"
            y="88"
            width="124"
            height="79"
            rx="4"
            fill="#050811"
            stroke="#1E293B"
            strokeWidth="1"
          />
          <text x="766" y="105" className="text-[10px] font-mono fill-zinc-500">
            C: {typeof tags.c === 'object' && 'street' in tags.c ? `${tags.c.street}.${tags.c.house}` : '192.168.1.30'}
          </text>

          {/* Stand */}
          <rect x="812" y="175" width="16" height="25" fill="#1E293B" />
          <ellipse cx="820" cy="200" rx="30" ry="6" fill="#0F172A" stroke="#334155" />

          {/* Label */}
          <text
            x="820"
            y="65"
            textAnchor="middle"
            className="text-[12px] font-sans fill-zinc-200 font-semibold"
          >
            Computer C (New Desk)
          </text>

          {/* IP Tag */}
          <g id="tag-c">
            <rect
              x="755"
              y="22"
              width="130"
              height="24"
              rx="6"
              fill="#0F172A"
              stroke={
                typeof tags.c === 'object' && 'street' in tags.c && tags.c.street !== '192.168.1'
                  ? '#F43F5E'
                  : '#0284C7'
              }
              strokeWidth="1.5"
            />
            <text
              x="820"
              y="38"
              textAnchor="middle"
              className={`text-[11px] font-mono font-bold ${
                typeof tags.c === 'object' && 'street' in tags.c && tags.c.street !== '192.168.1'
                  ? 'fill-rose-300'
                  : 'fill-sky-300'
              }`}
            >
              {typeof tags.c === 'object' && 'street' in tags.c
                ? `${tags.c.street} . ${tags.c.house}`
                : '192.168.1 . 30'}
            </text>
          </g>

          {/* Monospace Hardware MAC Badge */}
          <g
            id="mac-c"
            onClick={() => handleMacClick('c')}
            className="cursor-pointer group"
          >
            <rect
              x="750"
              y="48"
              width="140"
              height="18"
              rx="4"
              fill="#18181B"
              stroke={macGlow.c || isHighlighted('mac-c') ? '#F59E0B' : '#3F3F46'}
              strokeWidth={macGlow.c || isHighlighted('mac-c') ? '2' : '1'}
              className="transition-colors group-hover:stroke-amber-400"
            />
            <text
              x="820"
              y="61"
              textAnchor="middle"
              className={`text-[9.5px] font-mono font-medium tracking-tight ${
                macGlow.c || isHighlighted('mac-c') ? 'fill-amber-300' : 'fill-zinc-400'
              }`}
            >
              MAC: {macBadges.c}
            </text>
          </g>
        </g>

        {/* 7. Traffic & Broadcast Wave Animations */}
        {/* A -> B direct Ping pulse */}
        {messageState === 'ping-a-b' && (
          <g id="pulse-ping-a-b">
            <motion.circle
              cx="180"
              cy="220"
              r="8"
              fill="#10B981"
              filter="url(#cyanGlow)"
              animate={{
                cx: [180, 410, 470, 500],
                cy: [220, 415, 415, 200],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </g>
        )}

        {/* Golden ARP Broadcast Fan-Out: Port 1 -> Port 2 AND Port 3 */}
        {(messageState === 'arp-broadcast' || messageState === 'arp-silent') && (
          <g id="pulse-arp-fanout">
            {/* Wave down from Computer A to Switch Port 1 */}
            <motion.circle
              cx="180"
              cy="220"
              r="9"
              fill="#F59E0B"
              filter="url(#goldGlow)"
              animate={{
                cx: [180, 410],
                cy: [220, 415],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Ripple fan-out to Port 2 (Computer B) */}
            <motion.circle
              cx="470"
              cy="415"
              r="8"
              fill="#F59E0B"
              filter="url(#goldGlow)"
              animate={{
                cx: [470, 500],
                cy: [415, 200],
              }}
              transition={{
                duration: 0.8,
                delay: 0.4,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />

            {/* Ripple fan-out to Port 3 (Computer C) */}
            <motion.circle
              cx="530"
              cy="415"
              r="8"
              fill="#F59E0B"
              filter="url(#goldGlow)"
              animate={{
                cx: [530, 820],
                cy: [415, 220],
              }}
              transition={{
                duration: 0.8,
                delay: 0.4,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />

            {/* Broadcast speech label */}
            <rect x="290" y="340" width="220" height="24" rx="6" fill="#18181B" stroke="#F59E0B" />
            <text x="400" y="356" textAnchor="middle" className="text-[10px] font-mono fill-amber-300 font-bold">
              ARP: Who has .20? Tell .10
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
