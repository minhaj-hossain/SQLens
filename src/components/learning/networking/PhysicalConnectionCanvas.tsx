'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StageState, CableState } from '../../../types/networking-day1';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { soundFx } from '../../../lib/networking/audio-fx';

export interface PhysicalConnectionCanvasProps {
  stageState?: StageState;
  isCableSeated?: boolean;
  onToggleCable?: () => void;
  onPlugCable?: (target: 'yours' | 'friends' | 'both') => void;
  onSelectTag?: (which: 'yours' | 'friends') => void;
  onOpenLookInside?: (id: string) => void;
  onReplay?: () => void;
  readOnly?: boolean;
  className?: string;
  activeBeatIndex?: number;
}

export const PhysicalConnectionCanvas: React.FC<PhysicalConnectionCanvasProps> = ({
  stageState,
  isCableSeated = false,
  onToggleCable,
  onPlugCable,
  onSelectTag,
  onOpenLookInside,
  onReplay,
  readOnly = false,
  className = '',
}) => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Normalize state from either explicit stageState or legacy props
  const effectiveCable: CableState =
    stageState?.cable ?? (isCableSeated ? 'both' : 'loose-on-desk');
  const isBothConnected = effectiveCable === 'both';
  const isOneYours = effectiveCable === 'one-end-yours';
  const isLoose = effectiveCable === 'loose-on-desk';
  const isAbsent = effectiveCable === 'absent';

  const lightYours =
    stageState?.lights?.yours ?? (isBothConnected ? 'on' : 'off');
  const lightFriends =
    stageState?.lights?.friends ?? (isBothConnected ? 'on' : 'off');

  const messageState = stageState?.message ?? 'none';
  const trafficState = stageState?.traffic ?? 'idle';
  const tagYours = stageState?.tags?.yours ?? 'hidden';
  const tagFriends = stageState?.tags?.friends ?? 'hidden';
  const showBands = stageState?.bands === 'shown';
  const stopwatch = stageState?.stopwatch ?? null;

  const highlights = stageState?.highlight ?? [];
  const dims = stageState?.dim ?? [];

  const isDimmed = (id: string) => dims.includes(id);
  const isHighlighted = (id: string) => highlights.includes(id);

  const handlePlugClick = () => {
    if (readOnly) return;
    if (soundEnabled) soundFx.playCablePlug();
    if (onPlugCable) {
      onPlugCable(isBothConnected ? 'loose-on-desk' : 'both');
    } else if (onToggleCable) {
      onToggleCable();
    }
  };

  return (
    <div
      className={`relative w-full rounded-2xl bg-[#0B101B] border border-zinc-800 shadow-2xl overflow-hidden select-none transition-all duration-300 ${className}`}
      data-testid="physical-connection-canvas"
      data-cable={effectiveCable}
      data-light-yours={lightYours}
      data-light-friends={lightFriends}
      role="region"
      aria-label="Physical Connection Canvas"
    >
      {/* Top telemetry & replay controls */}
      <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between text-xs font-mono pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold tracking-wider uppercase transition-colors ${
              isBothConnected
                ? 'bg-emerald-950/80 border-emerald-600/70 text-emerald-300'
                : 'bg-zinc-900/90 border-zinc-700/80 text-zinc-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isBothConnected
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : 'bg-zinc-500'
              }`}
            />
            {isBothConnected ? 'Link: 100 Mbps UP' : 'Link: Disconnected'}
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

            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* DESK GROUND (y 470 to 620) */}
          <rect x="0" y="470" width="1000" height="150" fill="url(#deskGrad)" />
          <line x1="0" y1="470" x2="1000" y2="470" stroke="#1E293B" strokeWidth="2" />

          {/* STREET BANDS (Concept 2 onward) */}
          {showBands && (
            <g className="transition-opacity duration-500">
              {/* Left computer street band (Blue: 192.168.1) */}
              <rect
                x="80"
                y="485"
                width="380"
                height="28"
                rx="14"
                fill="#2563EB"
                fillOpacity="0.18"
                stroke="#2563EB"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x="270"
                y="504"
                textAnchor="middle"
                fill="#60A5FA"
                fontSize="12"
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
              >
                Neighborhood Street: 192.168.1.x
              </text>

              {/* Right computer street band */}
              {tagFriends !== 'hidden' &&
              typeof tagFriends === 'object' &&
              tagFriends.street === '192.168.2' ? (
                // Purple band for street 2
                <>
                  <rect
                    x="540"
                    y="485"
                    width="380"
                    height="28"
                    rx="14"
                    fill="#7C3AED"
                    fillOpacity="0.18"
                    stroke="#7C3AED"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="730"
                    y="504"
                    textAnchor="middle"
                    fill="#C084FC"
                    fontSize="12"
                    fontFamily="ui-monospace, monospace"
                    fontWeight="600"
                  >
                    Neighborhood Street: 192.168.2.x (Different!)
                  </text>
                </>
              ) : (
                // Shared blue band
                <>
                  <rect
                    x="540"
                    y="485"
                    width="380"
                    height="28"
                    rx="14"
                    fill="#2563EB"
                    fillOpacity="0.18"
                    stroke="#2563EB"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="730"
                    y="504"
                    textAnchor="middle"
                    fill="#60A5FA"
                    fontSize="12"
                    fontFamily="ui-monospace, monospace"
                    fontWeight="600"
                  >
                    Neighborhood Street: 192.168.1.x
                  </text>
                </>
              )}
            </g>
          )}

          {/* COMPUTER A (LEFT: x 120 to 340, y 250 to 460) */}
          <g
            id="computer-a"
            opacity={isDimmed('yours') ? 0.35 : 1}
            className="transition-opacity duration-300"
          >
            {/* Monitor Stand */}
            <path d="M210 410 L250 410 L260 455 L200 455 Z" fill="#1E293B" />
            <rect x="180" y="455" width="100" height="12" rx="4" fill="#334155" />

            {/* Monitor Frame */}
            <rect
              x="120"
              y="250"
              width="220"
              height="160"
              rx="12"
              fill="#0F172A"
              stroke={isHighlighted('yours') ? '#3B82F6' : '#334155'}
              strokeWidth={isHighlighted('yours') ? 3 : 2}
            />

            {/* Monitor Screen Glass */}
            <rect
              x="132"
              y="262"
              width="196"
              height="136"
              rx="6"
              fill="#020617"
            />

            {/* Terminal prompt symbol `>_` */}
            <text
              x="148"
              y="290"
              fill="#38BDF8"
              fontSize="16"
              fontFamily="ui-monospace, monospace"
              fontWeight="bold"
            >
              &gt;_
            </text>

            {/* Internal NIC Buffer Area */}
            <rect
              x="260"
              y="370"
              width="60"
              height="20"
              rx="4"
              fill="#1E293B"
              stroke="#475569"
              strokeWidth="1"
            />
            <text
              x="290"
              y="384"
              textAnchor="middle"
              fill="#94A3B8"
              fontSize="9"
              fontFamily="ui-monospace, monospace"
            >
              NIC Buffer
            </text>

            {/* Cable Socket (340, 380) */}
            <rect
              x="338"
              y="372"
              width="14"
              height="22"
              rx="3"
              fill="#0F172A"
              stroke="#64748B"
              strokeWidth="1.5"
            />

            {/* Link LED */}
            <circle
              cx="330"
              cy="383"
              r="6"
              fill={lightYours === 'on' ? '#22C55E' : '#334155'}
              stroke={lightYours === 'on' ? '#16A34A' : '#1E293B'}
              strokeWidth="1.5"
              filter={lightYours === 'on' ? 'url(#softGlow)' : undefined}
            />
          </g>

          {/* COMPUTER B (RIGHT: x 660 to 880, y 250 to 460) */}
          <g
            id="computer-b"
            opacity={isDimmed('friends') ? 0.35 : 1}
            className="transition-opacity duration-300"
          >
            {/* Monitor Stand */}
            <path d="M750 410 L790 410 L800 455 L740 455 Z" fill="#1E293B" />
            <rect x="720" y="455" width="100" height="12" rx="4" fill="#334155" />

            {/* Monitor Frame */}
            <rect
              x="660"
              y="250"
              width="220"
              height="160"
              rx="12"
              fill="#0F172A"
              stroke={isHighlighted('friends') ? '#3B82F6' : '#334155'}
              strokeWidth={isHighlighted('friends') ? 3 : 2}
            />

            {/* Monitor Screen Glass */}
            <rect
              x="672"
              y="262"
              width="196"
              height="136"
              rx="6"
              fill="#020617"
            />

            {/* Internal NIC Buffer Area */}
            <rect
              x="680"
              y="370"
              width="60"
              height="20"
              rx="4"
              fill="#1E293B"
              stroke="#475569"
              strokeWidth="1"
            />
            <text
              x="710"
              y="384"
              textAnchor="middle"
              fill="#94A3B8"
              fontSize="9"
              fontFamily="ui-monospace, monospace"
            >
              NIC Buffer
            </text>

            {/* Cable Socket (650, 380) */}
            <rect
              x="648"
              y="372"
              width="14"
              height="22"
              rx="3"
              fill="#0F172A"
              stroke="#64748B"
              strokeWidth="1.5"
            />

            {/* Link LED */}
            <circle
              cx="670"
              cy="383"
              r="6"
              fill={lightFriends === 'on' ? '#22C55E' : '#334155'}
              stroke={lightFriends === 'on' ? '#16A34A' : '#1E293B'}
              strokeWidth="1.5"
              filter={lightFriends === 'on' ? 'url(#softGlow)' : undefined}
            />
          </g>

          {/* THE PHYSICAL CABLE */}
          {!isAbsent && (
            <g id="cable-system">
              {/* Connected at both ends */}
              {isBothConnected && (
                <g>
                  {/* Cable Wire Path */}
                  <path
                    d="M 350 383 C 450 430, 550 430, 650 383"
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  {/* RJ45 Plugs */}
                  <rect x="342" y="375" width="16" height="16" rx="2" fill="#38BDF8" />
                  <rect x="642" y="375" width="16" height="16" rx="2" fill="#38BDF8" />
                </g>
              )}

              {/* Plugged only at Computer A (friend end loose) */}
              {isOneYours && (
                <g>
                  <path
                    d="M 350 383 C 420 420, 500 480, 580 470"
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <rect x="342" y="375" width="16" height="16" rx="2" fill="#38BDF8" />
                  {/* Loose plug on desk */}
                  <g
                    transform="translate(575, 460) rotate(15)"
                    className="cursor-pointer hover:scale-110 transition-transform"
                    onClick={handlePlugClick}
                  >
                    <rect x="0" y="0" width="22" height="14" rx="3" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
                    <text x="11" y="10" textAnchor="middle" fill="#000" fontSize="8" fontWeight="bold">PLUG</text>
                  </g>
                </g>
              )}

              {/* Completely loose on desk */}
              {isLoose && (
                <g
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={handlePlugClick}
                >
                  <path
                    d="M 400 475 C 460 460, 540 485, 600 472"
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <rect x="390" y="468" width="20" height="14" rx="3" fill="#38BDF8" />
                  <rect x="590" y="465" width="20" height="14" rx="3" fill="#38BDF8" />
                  <text
                    x="500"
                    y="450"
                    textAnchor="middle"
                    fill="#38BDF8"
                    fontSize="11"
                    fontFamily="sans-serif"
                    fontWeight="600"
                  >
                    Ethernet Cable (Click to Plug)
                  </text>
                </g>
              )}
            </g>
          )}

          {/* BUSY CABLE TRAFFIC CAPSULES (Concept 3 Rung 2) */}
          {trafficState === 'file-transfer' && (
            <g id="file-traffic">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <motion.rect
                  key={i}
                  width="18"
                  height="10"
                  rx="4"
                  fill="#94A3B8"
                  initial={{ x: 630 - i * 40, y: 395 }}
                  animate={{ x: [630 - i * 40, 360] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2,
                    ease: 'linear',
                    delay: i * 0.3,
                  }}
                />
              ))}
            </g>
          )}

          {/* PING MESSAGE ANIMATION */}
          <AnimatePresence>
            {/* 1. Transmit Failed (stops inside Computer A) */}
            {messageState === 'inside-stopped' && (
              <motion.g
                id="msg-stopped"
                initial={{ x: 170, y: 330, opacity: 0 }}
                animate={{ x: 310, y: 380, opacity: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              >
                {/* Envelope */}
                <rect x="0" y="0" width="34" height="22" rx="4" fill="#3B82F6" stroke="#93C5FD" strokeWidth="1.5" />
                <path d="M 0 0 L 17 12 L 34 0" fill="none" stroke="#93C5FD" strokeWidth="1.5" />
                <text x="17" y="19" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">ping</text>

                {/* Stopped Red Cross Badge */}
                <motion.g
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2, type: 'spring' }}
                >
                  <circle cx="38" cy="11" r="10" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1.5" />
                  <line x1="33" y1="6" x2="43" y2="16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                  <line x1="43" y1="6" x2="33" y2="16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                </motion.g>
              </motion.g>
            )}

            {/* 2. Round Trip Success (Pulse goes to friend, stopwatch rides it, reply returns) */}
            {messageState === 'roundtrip' && (
              <motion.g id="msg-roundtrip">
                <motion.g
                  animate={{
                    x: [350, 640, 350],
                    y: [383, 383, 383],
                  }}
                  transition={{
                    duration: trafficState === 'file-transfer' ? 3.8 : 2.2,
                    times: [0, 0.5, 1],
                    ease: 'easeInOut',
                    repeat: Infinity,
                  }}
                >
                  <rect x="-17" y="-11" width="34" height="22" rx="4" fill="#10B981" stroke="#A7F3D0" strokeWidth="1.5" filter="url(#softGlow)" />
                  <path d="M -17 -11 L 0 1 L 17 -11" fill="none" stroke="#A7F3D0" strokeWidth="1.5" />
                  <text x="0" y="8" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">echo</text>

                  {/* Stopwatch Pill riding pulse */}
                  {stopwatch && (
                    <g transform="translate(-16, -24)">
                      <rect x="0" y="0" width="32" height="14" rx="7" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
                      <text x="16" y="10" textAnchor="middle" fill="#38BDF8" fontSize="8" fontFamily="ui-monospace, monospace" fontWeight="bold">
                        {stopwatch}
                      </text>
                    </g>
                  )}
                </motion.g>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* HTML OVERLAYS: Strictly HTML positioned by percentage for crisp accessibility */}

        {/* Computer A Label */}
        <div
          className="absolute text-center transform -translate-x-1/2 pointer-events-none"
          style={{ left: '23%', top: '74%' }}
        >
          <div className="text-sm font-semibold text-zinc-200">Your computer</div>
          <div
            className={`text-xs font-mono font-medium ${
              lightYours === 'on' ? 'text-emerald-400' : 'text-zinc-500'
            }`}
          >
            Light: {lightYours === 'on' ? 'ON' : 'OFF'}
          </div>
        </div>

        {/* Computer B Label */}
        <div
          className="absolute text-center transform -translate-x-1/2 pointer-events-none"
          style={{ left: '77%', top: '74%' }}
        >
          <div className="text-sm font-semibold text-zinc-200">Friend&apos;s computer</div>
          <div
            className={`text-xs font-mono font-medium ${
              lightFriends === 'on' ? 'text-emerald-400' : 'text-zinc-500'
            }`}
          >
            Light: {lightFriends === 'on' ? 'ON' : 'OFF'}
          </div>
        </div>

        {/* Address Tag Above Computer A */}
        {tagYours !== 'hidden' && (
          <div
            className="absolute transform -translate-x-1/2 pointer-events-auto cursor-pointer"
            style={{ left: '23%', top: '34%' }}
            onClick={() => onSelectTag?.('yours')}
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 shadow-md font-mono text-xs sm:text-sm">
              {tagYours === 'not-set' ? (
                <span className="text-amber-400 font-medium">not set</span>
              ) : typeof tagYours === 'object' ? (
                <span>
                  <span className="text-blue-400 font-semibold">{tagYours.street}</span>
                  <span className="text-zinc-500">.</span>
                  <span className="text-amber-400 font-semibold">{tagYours.house}</span>
                </span>
              ) : null}
            </div>
          </div>
        )}

        {/* Address Tag Above Computer B */}
        {tagFriends !== 'hidden' && (
          <div
            className="absolute transform -translate-x-1/2 pointer-events-auto cursor-pointer"
            style={{ left: '77%', top: '34%' }}
            onClick={() => onSelectTag?.('friends')}
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 shadow-md font-mono text-xs sm:text-sm">
              {typeof tagFriends === 'object' ? (
                <span>
                  <span
                    className={
                      tagFriends.street === '192.168.2'
                        ? 'text-purple-400 font-semibold'
                        : 'text-blue-400 font-semibold'
                    }
                  >
                    {tagFriends.street}
                  </span>
                  <span className="text-zinc-500">.</span>
                  <span className="text-amber-400 font-semibold">{tagFriends.house}</span>
                </span>
              ) : null}
            </div>
          </div>
        )}

        {/* STOPPED INSIDE BADGE (Concept 1 Rung 4) */}
        {messageState === 'inside-stopped' && (
          <div
            className="absolute transform -translate-y-1/2 pointer-events-none animate-in fade-in zoom-in duration-300"
            style={{ left: '33%', top: '61%' }}
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/90 border border-red-700/80 text-red-300 font-medium text-xs shadow-lg">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Stopped inside</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
