'use client';

import React, { useState } from 'react';
import { soundFx } from '../../../../lib/networking/audio-fx';

export interface RealisticRj45CableProps {
  isPlugged: boolean;
  onToggle: () => void;
  disabled?: boolean;
  cableColor?: string;
  label?: string;
}

export const RealisticRj45Cable: React.FC<RealisticRj45CableProps> = ({
  isPlugged,
  onToggle,
  disabled = false,
  cableColor = '#2563eb', // Cat6 Industrial Blue
  label = 'Cat6 UTP Patch Cable',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLatching, setIsLatching] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    setIsLatching(true);
    if (!isPlugged) {
      soundFx.playCablePlug();
    } else {
      soundFx.playCableUnplug();
    }
    setTimeout(() => {
      onToggle();
      setIsLatching(false);
    }, 140);
  };

  return (
    <div className="flex flex-col items-center select-none group" data-testid="realistic-rj45-cable">
      {/* Cable Plug Interactive Assembly */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`${label}. Status: ${isPlugged ? 'Seated in socket' : 'Unplugged'}. Click to ${isPlugged ? 'unplug' : 'plug into socket'}.`}
        className={`relative p-2 rounded-xl border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 flex flex-col items-center gap-1 ${
          isPlugged
            ? 'bg-emerald-950/30 border-emerald-500/50 hover:bg-emerald-900/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            : 'bg-amber-950/30 border-amber-500/60 hover:bg-amber-900/40 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.25)]'
        } ${disabled ? 'cursor-default opacity-80' : 'cursor-pointer active:scale-95'}`}
      >
        <div className="flex flex-col items-center gap-1">
          {/* SVG RJ-45 Modular Connector (Photorealistic Vector) */}
          <svg
            width="56"
            height="44"
            viewBox="0 0 112 88"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform duration-200 ${
              isLatching ? 'scale-90 rotate-2' : isHovered ? 'scale-105' : 'scale-100'
            }`}
          >
            {/* Flexible Plastic Retention Clip / Latch */}
            <path
              d={
                isPlugged || isLatching
                  ? 'M42 22 L70 22 L72 28 L40 28 Z' // Pressed down / seated
                  : 'M40 10 L72 10 L70 26 L42 26 Z' // Raised / unlocked
              }
              fill="url(#crystalPlastic)"
              stroke="#94a3b8"
              strokeWidth="1.5"
              className="transition-all duration-150"
            />
            {/* Latch Hinge Barb */}
            <path d="M52 14 L60 14 L58 20 L54 20 Z" fill="#64748b" />

            {/* Clear Crystal Polycarbonate Plug Body */}
            <rect
              x="26"
              y="26"
              width="60"
              height="38"
              rx="4"
              fill="url(#crystalPlastic)"
              stroke="#cbd5e1"
              strokeWidth="2"
            />
            {/* Internal Cavity / Divider */}
            <rect x="30" y="30" width="52" height="30" rx="2" fill="#0f172a" fillOpacity="0.4" />

            {/* 8 Gold-Plated Phosphor Bronze Contact Pins */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((pin) => (
              <g key={pin}>
                {/* Gold Pin Blade */}
                <rect
                  x={34 + pin * 5.8}
                  y="26"
                  width="3.4"
                  height="14"
                  rx="0.8"
                  fill="url(#goldContact)"
                  stroke="#b45309"
                  strokeWidth="0.5"
                />
                {/* Gold Pin Reflection Highlight */}
                <rect
                  x={34.5 + pin * 5.8}
                  y="27"
                  width="1.2"
                  height="10"
                  fill="#fef08a"
                  fillOpacity="0.9"
                />
              </g>
            ))}

            {/* 4 Twisted Wire Pairs Visible inside Clear Housing (T568B Standard) */}
            {/* Pair 1: Orange / White-Orange */}
            <path d="M35 44 C38 46 38 52 35 54" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M39 44 C42 46 42 52 39 54" stroke="#fdba74" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="2 1" />
            {/* Pair 2: Green / White-Green */}
            <path d="M48 44 C51 46 51 52 48 54" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M52 44 C55 46 55 52 52 54" stroke="#86efac" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="2 1" />
            {/* Pair 3: Blue / White-Blue */}
            <path d="M61 44 C64 46 64 52 61 54" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M65 44 C68 46 68 52 65 54" stroke="#93c5fd" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="2 1" />
            {/* Pair 4: Brown / White-Brown */}
            <path d="M74 44 C77 46 77 52 74 54" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M78 44 C81 46 81 52 78 54" stroke="#d6d3d1" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="2 1" />

            {/* Molded Strain-Relief Boot (Flexible Rubber) */}
            <path
              d="M32 64 L80 64 L84 76 L28 76 Z"
              fill="url(#bootRubber)"
              stroke="#1e293b"
              strokeWidth="1.5"
            />
            {/* Snagless Hood Arch */}
            <path
              d="M44 64 C44 56 68 56 68 64"
              fill={cableColor}
              stroke="#0f172a"
              strokeWidth="1.5"
            />

            {/* Round Flexible Cable Jacket */}
            <rect
              x="36"
              y="74"
              width="40"
              height="14"
              rx="4"
              fill="url(#cableJacket)"
              stroke="#1e293b"
              strokeWidth="1"
            />

            {/* Gradients */}
            <defs>
              <linearGradient id="goldContact" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
              <linearGradient id="crystalPlastic" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#cbd5e1" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#64748b" stopOpacity="0.75" />
              </linearGradient>
              <linearGradient id="bootRubber" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="cableJacket" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="40%" stopColor={cableColor} />
                <stop offset="70%" stopColor={cableColor} />
                <stop offset="100%" stopColor="#172554" />
              </linearGradient>
            </defs>
          </svg>

          {/* Connection Text Status */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isPlugged
                  ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]'
                  : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)] animate-ping'
              }`}
            />
            <span
              className={`text-[9px] font-mono font-bold tracking-tight ${
                isPlugged ? 'text-emerald-300' : 'text-amber-300'
              }`}
            >
              {isPlugged ? 'LINK 1Gbps SEATED' : 'DISCONNECTED'}
            </span>
          </div>
        </div>

        {/* Screen Reader & Test Parity Tag */}
        <span className="sr-only">8P8C T568B 1000BASE-T Full Duplex</span>
      </button>
    </div>
  );
};
