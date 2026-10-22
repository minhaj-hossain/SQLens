'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Day3StageState } from '../../../types/networking-day3';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
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

type StageLayer = 'all' | 'sockets' | 'addresses' | 'gateways' | 'tags';

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
  const [activeLayer, setActiveLayer] = useState<StageLayer>('all');

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
  const macBadges = stageState?.macBadges ?? {
    a: '00-00-5e-00-53-01',
    b: '00-00-5e-00-53-02',
    routerEth0: '11-22-33-44-00-01',
    routerEth1: '11-22-33-44-00-02',
  };
  const message = stageState?.message ?? 'none';
  const highlights = stageState?.highlight ?? [];
  const dims = stageState?.dim ?? [];

  const isDimmed = (id: string) => dims.includes(id);
  const isHighlighted = (id: string) => highlights.includes(id);

  const isBothConnected =
    cables.hostA && cables.routerEth0 && cables.routerEth1 && cables.hostB;

  const handleCableClick = (target: 'hostA' | 'routerEth0' | 'routerEth1' | 'hostB') => {
    if (readOnly) return;
    if (soundEnabled) soundFx.playCablePlug();
    if (onToggleCable) {
      onToggleCable(target);
    } else if (onPlugRouterCables) {
      onPlugRouterCables();
    }
  };

  return (
    <div
      className={`relative w-full h-full rounded-2xl bg-[#0c0c0e] border border-white/[0.08] shadow-2xl overflow-hidden select-none transition-all duration-300 flex flex-col justify-between ${className}`}
      data-testid="physical-router-canvas"
      role="region"
      aria-label="Physical Router & Subnet Canvas"
    >
      {/* ========================================================================= */}
      {/* 1. TOP TELEMETRY, LAYER SWITCHER & AUDIO / REPLAY CONTROLS                */}
      {/* ========================================================================= */}
      <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between text-xs font-mono pointer-events-none gap-2">
        {/* Left Telemetry Status */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-mono font-medium tracking-wider transition-all shadow-sm ${
              showRouter && isBothConnected
                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                : showRouter && !isBothConnected
                ? 'bg-amber-950/70 border-amber-500/60 text-amber-300'
                : 'bg-rose-950/70 border-rose-500/60 text-rose-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                showRouter && isBothConnected
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : showRouter && !isBothConnected
                  ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                  : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
              }`}
            />
            {showRouter && isBothConnected
              ? 'Router: Dual Interfaces Linked'
              : showRouter && !isBothConnected
              ? 'Router: Cable Unplugged'
              : 'Physical Chasm: No Router'}
          </span>
        </div>

        {/* Center Layer Selector: All | Sockets | Addresses | Gateways | Name tags */}
        <div className="hidden md:flex items-center rounded-xl bg-zinc-950/90 border border-white/[0.12] p-0.5 text-[11px] font-sans font-medium pointer-events-auto shadow-lg">
          <button
            type="button"
            onClick={() => setActiveLayer('all')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeLayer === 'all'
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Show all physical details"
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('sockets')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeLayer === 'sockets'
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Focus on physical ports and patch cables"
          >
            Sockets
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('addresses')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeLayer === 'addresses'
                ? 'bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Focus on neighborhood street IP addresses"
          >
            Addresses
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('gateways')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeLayer === 'gateways'
                ? 'bg-sky-600/30 border border-sky-500/40 text-sky-200 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Focus on default gateway doorways"
          >
            Doorways
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('tags')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeLayer === 'tags'
                ? 'bg-amber-600/30 border border-amber-500/40 text-amber-200 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Focus on hardware MAC name tags"
          >
            Name tags
          </button>
        </div>

        {/* Right Replay & Sound Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {onReplay && (
            <button
              type="button"
              onClick={onReplay}
              title="Replay packet animation (R)"
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
              <Volume2 className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
            )}
            <span className="sr-only">Toggle sound</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FULL SVG WORKBENCH SCENE (viewBox 0 0 1000 680)                         */}
      {/* ========================================================================= */}
      <div className="relative w-full aspect-[16/11] max-h-[660px]">
        <svg
          viewBox="0 0 1000 680"
          className="w-full h-full block"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="deskGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#141D2D" />
              <stop offset="100%" stopColor="#0B101B" />
            </linearGradient>

            <linearGradient id="routerGrad" x1="0" y1="0" x2="0" y2="1">
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

            <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* DESK GROUND (y 500 to 680) */}
          <rect x="0" y="500" width="1000" height="180" fill="url(#deskGrad)" />
          <line x1="0" y1="500" x2="1000" y2="500" stroke="#1E293B" strokeWidth="2" />

          {/* STREET BANDS ON DESK GROUND */}
          {/* Green Street: 192.168.1.x */}
          <g
            id="band-green-street"
            className="transition-opacity duration-300"
            opacity={activeLayer === 'tags' || activeLayer === 'sockets' ? 0.35 : 1}
          >
            <rect
              x="60"
              y="590"
              width="400"
              height="34"
              rx="17"
              fill="#10B981"
              fillOpacity="0.16"
              stroke="#10B981"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text
              x="260"
              y="612"
              textAnchor="middle"
              fill="#34D399"
              fontSize="12"
              fontFamily="ui-monospace, monospace"
              fontWeight="600"
            >
              Green Street: 192.168.1.x
            </text>
          </g>

          {/* Orange Street: 192.168.2.x */}
          <g
            id="band-orange-street"
            className="transition-opacity duration-300"
            opacity={activeLayer === 'tags' || activeLayer === 'sockets' ? 0.35 : 1}
          >
            <rect
              x="540"
              y="590"
              width="400"
              height="34"
              rx="17"
              fill="#F59E0B"
              fillOpacity="0.16"
              stroke="#F59E0B"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text
              x="740"
              y="612"
              textAnchor="middle"
              fill="#FBBF24"
              fontSize="12"
              fontFamily="ui-monospace, monospace"
              fontWeight="600"
            >
              Orange Street: 192.168.2.x
            </text>
          </g>

          {/* ========================================================================= */}
          {/* 3. PATCH CABLES (Host A -> Router Port 1 | Host B -> Router Port 2)       */}
          {/* ========================================================================= */}

          {/* Cable A: Host A socket (185, 286) -> Router Port 1 (405, 444) */}
          {showRouter && cables.hostA && cables.routerEth0 ? (
            <g
              id="cable-a"
              onClick={() => handleCableClick('hostA')}
              className="cursor-pointer group"
            >
              <path
                d="M 185 286 C 185 390, 310 444, 405 444"
                fill="none"
                stroke="#10B981"
                strokeWidth="6"
                strokeLinecap="round"
                className="transition-colors group-hover:stroke-emerald-400"
              />
              <path
                d="M 185 286 C 185 390, 310 444, 405 444"
                fill="none"
                stroke="#6EE7B7"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>
          ) : (
            <g
              id="cable-a-unplugged"
              onClick={() => handleCableClick('hostA')}
              className="cursor-pointer group"
            >
              <path
                d="M 185 286 C 185 365, 235 470, 275 490"
                fill="none"
                stroke="#64748B"
                strokeWidth="5"
                strokeDasharray="6 4"
                strokeLinecap="round"
                className="group-hover:stroke-emerald-400 transition-colors"
              />
              <circle cx="275" cy="490" r="5.5" fill="#EF4444" />
              <g transform="translate(275, 465)">
                <rect
                  x="-65"
                  y="-10"
                  width="130"
                  height="20"
                  rx="10"
                  fill="#09090b"
                  stroke="#10B981"
                  strokeWidth="1.5"
                />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill="#34D399"
                  fontSize="9"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="bold"
                >
                  ⚡ Click to Plug Cable A
                </text>
              </g>
            </g>
          )}

          {/* Cable B: Host B socket (815, 286) -> Router Port 2 (595, 444) */}
          {showRouter && cables.hostB && cables.routerEth1 ? (
            <g
              id="cable-b"
              onClick={() => handleCableClick('hostB')}
              className="cursor-pointer group"
            >
              <path
                d="M 815 286 C 815 390, 690 444, 595 444"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="6"
                strokeLinecap="round"
                className="transition-colors group-hover:stroke-amber-400"
              />
              <path
                d="M 815 286 C 815 390, 690 444, 595 444"
                fill="none"
                stroke="#FDE68A"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>
          ) : (
            <g
              id="cable-b-unplugged"
              onClick={() => handleCableClick('hostB')}
              className="cursor-pointer group"
            >
              <path
                d="M 815 286 C 815 365, 765 470, 725 490"
                fill="none"
                stroke="#64748B"
                strokeWidth="5"
                strokeDasharray="6 4"
                strokeLinecap="round"
                className="group-hover:stroke-amber-400 transition-colors"
              />
              <circle cx="725" cy="490" r="5.5" fill="#EF4444" />
              <g transform="translate(725, 465)">
                <rect
                  x="-65"
                  y="-10"
                  width="130"
                  height="20"
                  rx="10"
                  fill="#09090b"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill="#FCD34D"
                  fontSize="9"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="bold"
                >
                  ⚡ Click to Plug Cable B
                </text>
              </g>
            </g>
          )}

          {/* ========================================================================= */}
          {/* 4. CENTRAL GATEWAY ROUTER (Middle: x = 355 to 645, y = 370 to 480)        */}
          {/* ========================================================================= */}
          {showRouter ? (
            <g
              id="central-router"
              opacity={isDimmed('router') ? 0.35 : 1}
              className="transition-opacity duration-300"
            >
              {/* Highlight halo */}
              {isHighlighted('router') && (
                <rect
                  x="345"
                  y="360"
                  width="310"
                  height="130"
                  rx="14"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="3"
                  filter="url(#softGlow)"
                />
              )}

              {/* Rack Mount Chassis Body */}
              <rect
                x="355"
                y="370"
                width="290"
                height="110"
                rx="10"
                fill="url(#routerGrad)"
                stroke="#334155"
                strokeWidth="2"
              />

              {/* Left & Right Rack Ears with Screws */}
              <rect x="345" y="380" width="10" height="90" rx="2" fill="#1E293B" stroke="#334155" />
              <circle cx="350" cy="395" r="2.5" fill="#64748B" />
              <circle cx="350" cy="455" r="2.5" fill="#64748B" />

              <rect x="645" y="380" width="10" height="90" rx="2" fill="#1E293B" stroke="#334155" />
              <circle cx="650" cy="395" r="2.5" fill="#64748B" />
              <circle cx="650" cy="455" r="2.5" fill="#64748B" />

              {/* Faceplate Header */}
              <text
                x="500"
                y="392"
                textAnchor="middle"
                fill="#38BDF8"
                fontSize="10.5"
                fontFamily="ui-monospace, monospace"
                fontWeight="bold"
                letterSpacing="0.8"
              >
                DUAL-INTERFACE GATEWAY ROUTER
              </text>

              {/* Central Routing Engine Core Display */}
              <rect
                x="460"
                y="404"
                width="80"
                height="20"
                rx="4"
                fill="#020617"
                stroke="#334155"
                strokeWidth="1"
              />
              <circle
                cx="472"
                cy="414"
                r="3.5"
                fill={isBothConnected ? '#10B981' : '#F59E0B'}
                filter="url(#softGlow)"
              />
              <text
                x="504"
                y="418"
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="8.5"
                fontFamily="ui-monospace, monospace"
                fontWeight="bold"
              >
                ROUTE CORE
              </text>

              {/* ---------------- Port 1 (eth0: Green Street Doorway) ---------------- */}
              <g
                id="router-port-1"
                onClick={() => handleCableClick('routerEth0')}
                className="cursor-pointer group"
              >
                {/* Port Socket */}
                <rect
                  x="394"
                  y="432"
                  width="22"
                  height="24"
                  rx="3"
                  fill="#020617"
                  stroke={activeLayer === 'sockets' || isHighlighted('router-eth0') ? '#34D399' : '#10B981'}
                  strokeWidth={activeLayer === 'sockets' ? 2 : 1.5}
                  className="group-hover:stroke-emerald-300 transition-colors"
                />
                {/* Link LED */}
                <circle
                  cx="405"
                  cy="424"
                  r="4"
                  fill={portLeds.routerEth0 === 'green' ? '#10B981' : '#334155'}
                  filter={portLeds.routerEth0 === 'green' ? 'url(#softGlow)' : undefined}
                />
                {/* Port Label */}
                <text
                  x="405"
                  y="468"
                  textAnchor="middle"
                  fill="#34D399"
                  fontSize="9"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="bold"
                >
                  eth0 [Port 1]
                </text>
                {/* Doorway IP Badge */}
                <rect
                  x="368"
                  y="473"
                  width="74"
                  height="16"
                  rx="3"
                  fill="#064E3B"
                  stroke="#10B981"
                  strokeWidth="1"
                />
                <text
                  x="405"
                  y="484.5"
                  textAnchor="middle"
                  fill="#A7F3D0"
                  fontSize="8.5"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="bold"
                >
                  192.168.1.1
                </text>
              </g>

              {/* ---------------- Port 2 (eth1: Orange Street Doorway) ---------------- */}
              <g
                id="router-port-2"
                onClick={() => handleCableClick('routerEth1')}
                className="cursor-pointer group"
              >
                {/* Port Socket */}
                <rect
                  x="584"
                  y="432"
                  width="22"
                  height="24"
                  rx="3"
                  fill="#020617"
                  stroke={activeLayer === 'sockets' || isHighlighted('router-eth1') ? '#FBBF24' : '#F59E0B'}
                  strokeWidth={activeLayer === 'sockets' ? 2 : 1.5}
                  className="group-hover:stroke-amber-300 transition-colors"
                />
                {/* Link LED */}
                <circle
                  cx="595"
                  cy="424"
                  r="4"
                  fill={portLeds.routerEth1 === 'green' ? '#F59E0B' : '#334155'}
                  filter={portLeds.routerEth1 === 'green' ? 'url(#goldGlow)' : undefined}
                />
                {/* Port Label */}
                <text
                  x="595"
                  y="468"
                  textAnchor="middle"
                  fill="#FBBF24"
                  fontSize="9"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="bold"
                >
                  eth1 [Port 2]
                </text>
                {/* Doorway IP Badge */}
                <rect
                  x="558"
                  y="473"
                  width="74"
                  height="16"
                  rx="3"
                  fill="#78350F"
                  stroke="#F59E0B"
                  strokeWidth="1"
                />
                <text
                  x="595"
                  y="484.5"
                  textAnchor="middle"
                  fill="#FDE68A"
                  fontSize="8.5"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="bold"
                >
                  192.168.2.1
                </text>
              </g>

              {/* Quick Inspection Buttons directly on the router stage */}
              <g id="router-inspect-triggers" transform="translate(500, 508)">
                {onInspectRoutingTable && (
                  <g
                    onClick={onInspectRoutingTable}
                    className="cursor-pointer group"
                    role="button"
                    aria-label="Inspect Router Routing Table"
                  >
                    <rect
                      x="-70"
                      y="-10"
                      width="66"
                      height="20"
                      rx="4"
                      fill="#1E293B"
                      stroke="#38BDF8"
                      strokeWidth="1"
                      className="group-hover:fill-sky-950/80 transition-colors"
                    />
                    <text
                      x="-37"
                      y="3.5"
                      textAnchor="middle"
                      fill="#38BDF8"
                      fontSize="8.5"
                      fontFamily="ui-monospace, monospace"
                      fontWeight="bold"
                    >
                      Route Table
                    </text>
                  </g>
                )}

                {onInspectRouterArp && (
                  <g
                    onClick={onInspectRouterArp}
                    className="cursor-pointer group"
                    role="button"
                    aria-label="Inspect Router ARP Cache"
                  >
                    <rect
                      x="4"
                      y="-10"
                      width="66"
                      height="20"
                      rx="4"
                      fill="#1E293B"
                      stroke="#38BDF8"
                      strokeWidth="1"
                      className="group-hover:fill-sky-950/80 transition-colors"
                    />
                    <text
                      x="37"
                      y="3.5"
                      textAnchor="middle"
                      fill="#38BDF8"
                      fontSize="8.5"
                      fontFamily="ui-monospace, monospace"
                      fontWeight="bold"
                    >
                      Router ARP
                    </text>
                  </g>
                )}
              </g>
            </g>
          ) : (
            /* Concept 1: The Chasm between the two streets */
            <g id="chasm-no-router">
              <rect
                x="350"
                y="350"
                width="300"
                height="130"
                rx="12"
                fill="#18181B"
                fillOpacity="0.4"
                stroke="#EF4444"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
              <text
                x="500"
                y="395"
                textAnchor="middle"
                fill="#EF4444"
                fontSize="12.5"
                fontFamily="ui-monospace, monospace"
                fontWeight="bold"
                letterSpacing="0.5"
              >
                ⚠️ NO ROUTER: Physical Divide (Chasm)
              </text>
              <text
                x="500"
                y="420"
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="10.5"
                fontFamily="ui-monospace, monospace"
              >
                192.168.1.x and 192.168.2.x
              </text>
              <text
                x="500"
                y="442"
                textAnchor="middle"
                fill="#64748B"
                fontSize="10"
                fontFamily="ui-monospace, monospace"
              >
                have NO physical path between them!
              </text>
            </g>
          )}

          {/* ========================================================================= */}
          {/* 5. COMPUTER A (LEFT WORKSTATION: center x = 185)                           */}
          {/* ========================================================================= */}
          <g
            id="computer-a"
            opacity={isDimmed('hostA') ? 0.35 : 1}
            className="transition-opacity duration-300"
          >
            {/* Monitor Stand */}
            <path d="M165 285 L205 285 L215 315 L155 315 Z" fill="#1E293B" />
            <rect x="145" y="315" width="80" height="10" rx="3" fill="#334155" />

            {/* Monitor Frame */}
            <rect
              x="95"
              y="160"
              width="180"
              height="125"
              rx="10"
              fill="#0F172A"
              stroke={isHighlighted('hostA') ? '#10B981' : '#334155'}
              strokeWidth={isHighlighted('hostA') ? 3 : 2}
            />

            {/* Screen Glass */}
            <rect x="105" y="170" width="160" height="105" rx="5" fill="#020617" />

            {/* Terminal prompt symbol `>_` */}
            <text
              x="120"
              y="196"
              fill="#10B981"
              fontSize="14"
              fontFamily="ui-monospace, monospace"
              fontWeight="bold"
            >
              &gt;_
            </text>
            <text
              x="142"
              y="196"
              fill="#94A3B8"
              fontSize="11"
              fontFamily="ui-monospace, monospace"
            >
              Host A
            </text>

            {/* Screen text */}
            <text
              x="120"
              y="222"
              fill="#64748B"
              fontSize="9.5"
              fontFamily="ui-monospace, monospace"
            >
              IP:{' '}
              <tspan fill="#34D399" fontWeight="bold">
                192.168.1.10
              </tspan>
            </text>
            <text
              x="120"
              y="242"
              fill="#64748B"
              fontSize="9.5"
              fontFamily="ui-monospace, monospace"
            >
              GW:{' '}
              <tspan
                fill={gateways.a ? '#38BDF8' : '#EF4444'}
                fontWeight={gateways.a ? 'bold' : 'normal'}
              >
                {gateways.a || '<none>'}
              </tspan>
            </text>
            <text
              x="120"
              y="260"
              fill="#475569"
              fontSize="8.5"
              fontFamily="ui-monospace, monospace"
            >
              Mask: 255.255.255.0
            </text>

            {/* Cable Socket */}
            <rect
              x="180"
              y="280"
              width="10"
              height="12"
              rx="2"
              fill="#0F172A"
              stroke="#64748B"
              strokeWidth="1"
            />

            {/* Link LED */}
            <circle
              cx="174"
              cy="286"
              r="4.5"
              fill={portLeds.hostA === 'green' ? '#22C55E' : '#334155'}
              filter={portLeds.hostA === 'green' ? 'url(#softGlow)' : undefined}
            />

            {/* Title above monitor */}
            <text
              x="185"
              y="42"
              textAnchor="middle"
              fill="#E2E8F0"
              fontSize="13"
              fontWeight="600"
            >
              Computer A (You)
            </text>

            {/* Address Tag Pill */}
            <g
              id="host-a-ip-pill"
              transform="translate(185, 68)"
              className="cursor-pointer group transition-opacity duration-300"
              opacity={activeLayer === 'tags' || activeLayer === 'gateways' ? 0.35 : 1}
            >
              <rect
                x="-65"
                y="-13"
                width="130"
                height="26"
                rx="13"
                fill="#0F172A"
                stroke={activeLayer === 'addresses' ? '#10B981' : '#334155'}
                strokeWidth={activeLayer === 'addresses' ? 2 : 1.5}
                className="group-hover:stroke-emerald-400 transition-colors"
              />
              <text
                x="0"
                y="4"
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
                fontSize="11"
                fontWeight="bold"
              >
                <tspan fill="#34D399">192.168.1</tspan>
                <tspan fill="#64748B">.</tspan>
                <tspan fill="#FBBF24">10</tspan>
              </text>
            </g>

            {/* Gateway Doorway Pill */}
            {showGatewayBadges && (
              <g
                id="host-a-gw-pill"
                transform="translate(185, 98)"
                className="cursor-pointer group transition-opacity duration-300"
                opacity={activeLayer === 'tags' || activeLayer === 'addresses' ? 0.35 : 1}
              >
                <rect
                  x="-75"
                  y="-11"
                  width="150"
                  height="22"
                  rx="11"
                  fill="#020617"
                  stroke={
                    activeLayer === 'gateways'
                      ? '#38BDF8'
                      : gateways.a
                      ? '#1E3A8A'
                      : '#EF4444'
                  }
                  strokeWidth={activeLayer === 'gateways' ? 2 : 1.2}
                  strokeDasharray={gateways.a ? undefined : '3 3'}
                  className="group-hover:stroke-sky-400 transition-colors"
                />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fontFamily="ui-monospace, monospace"
                  fontSize="9.5"
                  fontWeight="bold"
                >
                  <tspan fill="#64748B">GW: </tspan>
                  <tspan fill={gateways.a ? '#38BDF8' : '#F87171'}>
                    {gateways.a || 'NO GATEWAY'}
                  </tspan>
                </text>
              </g>
            )}

            {/* MAC Hardware Badge */}
            <g
              id="host-a-mac-pill"
              transform="translate(185, 126)"
              className="cursor-pointer group transition-opacity duration-300"
              opacity={activeLayer === 'addresses' || activeLayer === 'gateways' ? 0.35 : 1}
            >
              <rect
                x="-75"
                y="-10"
                width="150"
                height="20"
                rx="4"
                fill="#020617"
                stroke={activeLayer === 'tags' ? '#F59E0B' : '#1E293B'}
                strokeWidth={activeLayer === 'tags' ? 1.5 : 1}
                className="group-hover:stroke-amber-400 transition-colors"
              />
              <text
                x="0"
                y="3.5"
                textAnchor="middle"
                fill={activeLayer === 'tags' ? '#FCD34D' : '#94A3B8'}
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
              >
                MAC: {macBadges.a}
              </text>
            </g>

            {/* Link light text */}
            <text
              x="185"
              y="345"
              textAnchor="middle"
              fill={cables.hostA ? '#34D399' : '#64748B'}
              fontSize="11"
              fontFamily="ui-monospace, monospace"
              fontWeight="600"
            >
              Link light: {cables.hostA ? 'ON' : 'OFF'}
            </text>
          </g>

          {/* ========================================================================= */}
          {/* 6. COMPUTER B (RIGHT WORKSTATION: center x = 815)                          */}
          {/* ========================================================================= */}
          <g
            id="computer-b"
            opacity={isDimmed('hostB') ? 0.35 : 1}
            className="transition-opacity duration-300"
          >
            {/* Monitor Stand */}
            <path d="M795 285 L835 285 L845 315 L785 315 Z" fill="#1E293B" />
            <rect x="775" y="315" width="80" height="10" rx="3" fill="#334155" />

            {/* Monitor Frame */}
            <rect
              x="725"
              y="160"
              width="180"
              height="125"
              rx="10"
              fill="#0F172A"
              stroke={isHighlighted('hostB') ? '#F59E0B' : '#334155'}
              strokeWidth={isHighlighted('hostB') ? 3 : 2}
            />

            {/* Screen Glass */}
            <rect x="735" y="170" width="160" height="105" rx="5" fill="#020617" />

            {/* Terminal prompt symbol `>_` */}
            <text
              x="750"
              y="196"
              fill="#F59E0B"
              fontSize="14"
              fontFamily="ui-monospace, monospace"
              fontWeight="bold"
            >
              &gt;_
            </text>
            <text
              x="772"
              y="196"
              fill="#94A3B8"
              fontSize="11"
              fontFamily="ui-monospace, monospace"
            >
              Host B
            </text>

            {/* Screen text */}
            <text
              x="750"
              y="222"
              fill="#64748B"
              fontSize="9.5"
              fontFamily="ui-monospace, monospace"
            >
              IP:{' '}
              <tspan fill="#FBBF24" fontWeight="bold">
                192.168.2.20
              </tspan>
            </text>
            <text
              x="750"
              y="242"
              fill="#64748B"
              fontSize="9.5"
              fontFamily="ui-monospace, monospace"
            >
              GW:{' '}
              <tspan fill="#38BDF8" fontWeight="bold">
                {gateways.b || '192.168.2.1'}
              </tspan>
            </text>
            <text
              x="750"
              y="260"
              fill="#475569"
              fontSize="8.5"
              fontFamily="ui-monospace, monospace"
            >
              Mask: 255.255.255.0
            </text>

            {/* Cable Socket */}
            <rect
              x="810"
              y="280"
              width="10"
              height="12"
              rx="2"
              fill="#0F172A"
              stroke="#64748B"
              strokeWidth="1"
            />

            {/* Link LED */}
            <circle
              cx="804"
              cy="286"
              r="4.5"
              fill={portLeds.hostB === 'green' ? '#22C55E' : '#334155'}
              filter={portLeds.hostB === 'green' ? 'url(#softGlow)' : undefined}
            />

            {/* Title above monitor */}
            <text
              x="815"
              y="42"
              textAnchor="middle"
              fill="#E2E8F0"
              fontSize="13"
              fontWeight="600"
            >
              Computer B (Friend)
            </text>

            {/* Address Tag Pill */}
            <g
              id="host-b-ip-pill"
              transform="translate(815, 68)"
              className="cursor-pointer group transition-opacity duration-300"
              opacity={activeLayer === 'tags' || activeLayer === 'gateways' ? 0.35 : 1}
            >
              <rect
                x="-65"
                y="-13"
                width="130"
                height="26"
                rx="13"
                fill="#0F172A"
                stroke={activeLayer === 'addresses' ? '#F59E0B' : '#334155'}
                strokeWidth={activeLayer === 'addresses' ? 2 : 1.5}
                className="group-hover:stroke-amber-400 transition-colors"
              />
              <text
                x="0"
                y="4"
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
                fontSize="11"
                fontWeight="bold"
              >
                <tspan fill="#FBBF24">192.168.2</tspan>
                <tspan fill="#64748B">.</tspan>
                <tspan fill="#FBBF24">20</tspan>
              </text>
            </g>

            {/* Gateway Doorway Pill */}
            {showGatewayBadges && (
              <g
                id="host-b-gw-pill"
                transform="translate(815, 98)"
                className="cursor-pointer group transition-opacity duration-300"
                opacity={activeLayer === 'tags' || activeLayer === 'addresses' ? 0.35 : 1}
              >
                <rect
                  x="-75"
                  y="-11"
                  width="150"
                  height="22"
                  rx="11"
                  fill="#020617"
                  stroke={activeLayer === 'gateways' ? '#38BDF8' : '#1E3A8A'}
                  strokeWidth={activeLayer === 'gateways' ? 2 : 1.2}
                  className="group-hover:stroke-sky-400 transition-colors"
                />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fontFamily="ui-monospace, monospace"
                  fontSize="9.5"
                  fontWeight="bold"
                >
                  <tspan fill="#64748B">GW: </tspan>
                  <tspan fill="#38BDF8">{gateways.b || '192.168.2.1'}</tspan>
                </text>
              </g>
            )}

            {/* MAC Hardware Badge */}
            <g
              id="host-b-mac-pill"
              transform="translate(815, 126)"
              className="cursor-pointer group transition-opacity duration-300"
              opacity={activeLayer === 'addresses' || activeLayer === 'gateways' ? 0.35 : 1}
            >
              <rect
                x="-75"
                y="-10"
                width="150"
                height="20"
                rx="4"
                fill="#020617"
                stroke={activeLayer === 'tags' ? '#F59E0B' : '#1E293B'}
                strokeWidth={activeLayer === 'tags' ? 1.5 : 1}
                className="group-hover:stroke-amber-400 transition-colors"
              />
              <text
                x="0"
                y="3.5"
                textAnchor="middle"
                fill={activeLayer === 'tags' ? '#FCD34D' : '#94A3B8'}
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
              >
                MAC: {macBadges.b}
              </text>
            </g>

            {/* Link light text */}
            <text
              x="815"
              y="345"
              textAnchor="middle"
              fill={cables.hostB ? '#34D399' : '#64748B'}
              fontSize="11"
              fontFamily="ui-monospace, monospace"
              fontWeight="600"
            >
              Link light: {cables.hostB ? 'ON' : 'OFF'}
            </text>
          </g>

          {/* ========================================================================= */}
          {/* 7. ANIMATED PACKET FLOWS: CROSS-HOP PING, PING-TO-GATEWAY, DROP ALERTS    */}
          {/* ========================================================================= */}
          <AnimatePresence>
            {/* Cross-Hop Ping: Host A (185, 286) -> Router Eth0 (405, 444) -> Router Eth1 (595, 444) -> Host B (815, 286) */}
            {message === 'cross-hop-ping' && showRouter && isBothConnected && (
              <motion.g id="pulse-cross-hop">
                <motion.circle
                  r="7.5"
                  fill="#10B981"
                  filter="url(#emeraldGlow)"
                  animate={{
                    cx: [185, 405, 500, 595, 815, 595, 500, 405, 185],
                    cy: [286, 444, 414, 444, 286, 444, 414, 444, 286],
                    fill: [
                      '#10B981',
                      '#10B981',
                      '#38BDF8',
                      '#F59E0B',
                      '#F59E0B',
                      '#F59E0B',
                      '#38BDF8',
                      '#10B981',
                      '#10B981',
                    ],
                  }}
                  transition={{
                    duration: 3.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.g>
            )}

            {/* Ping to Gateway: Host A (185, 286) -> Router Eth0 (405, 444) -> Return */}
            {message === 'ping-to-gateway' && showRouter && cables.hostA && cables.routerEth0 && (
              <motion.g id="pulse-ping-gateway">
                <motion.circle
                  r="7.5"
                  fill="#10B981"
                  filter="url(#emeraldGlow)"
                  animate={{
                    cx: [185, 405, 185],
                    cy: [286, 444, 286],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.g>
            )}

            {/* Packet Dropped - No Gateway Configured or Remote Down */}
            {(message === 'drop-no-gateway' || message === 'drop-remote-down') && (
              <motion.g id="pulse-dropped">
                <motion.circle
                  r="7"
                  fill="#EF4444"
                  animate={{
                    cx: [185, 250, 250],
                    cy: [286, 340, 340],
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
                <motion.g
                  transform="translate(250, 340)"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1.2, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <circle r="12" fill="#7F1D1D" stroke="#EF4444" strokeWidth="1.5" />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#FCA5A5"
                    fontSize="11"
                    fontFamily="ui-monospace, monospace"
                    fontWeight="bold"
                  >
                    ✕
                  </text>
                </motion.g>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </div>
    </div>
  );
};
