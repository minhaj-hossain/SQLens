'use client';

import React, { useState } from 'react';
import { X, ZoomIn, Cpu, Network, ShieldCheck, Sparkles, Layers } from 'lucide-react';

export interface RealisticNicSiliconModalProps {
  isOpen: boolean;
  onClose: () => void;
  macAddress?: string;
  hostname?: string;
}

export const RealisticNicSiliconModal: React.FC<RealisticNicSiliconModalProps> = ({
  isOpen,
  onClose,
  macAddress = '00-1A-2B-3C-4D-10',
  hostname = 'Acme-PC-01',
}) => {
  const [activeSpot, setActiveSpot] = useState<'mac' | 'chip' | 'pins' | 'rj45'>('mac');

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="nic-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"
      data-testid="nic-silicon-modal"
    >
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-950/95 border border-slate-700/80 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 id="nic-modal-title" className="text-sm font-mono font-bold text-slate-100 flex items-center gap-2">
                PCIe Network Interface Card (NIC) • Silicon Hardware Zoom
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px] text-cyan-300">
                  Layer 2 Silicon
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-sans">
                Station: <strong className="text-slate-200">{hostname}</strong> • Factory-Stamped Physical Address
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Silicon Inspector"
            className="p-1.5 rounded-lg border border-slate-700 hover:border-slate-500 bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Photorealistic Macro Viewer + Interactive Hotspots */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center min-h-[300px] sm:min-h-[420px]">
          {/* Photorealistic Background Render */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/networking/nic-chip-macro.jpg"
            alt="Macro PCIe Network Controller Silicon Chip"
            className="w-full h-full object-cover object-center max-h-[500px] select-none"
          />

          {/* Frosted Inspection Overlay Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 pointer-events-none" />

          {/* Interactive Hotspot 1: Silicon Controller (MAC Address Burn-In) */}
          <button
            type="button"
            onClick={() => setActiveSpot('mac')}
            className={`absolute top-[48%] left-[50%] -translate-x-1/2 -translate-y-1/2 p-2 rounded-xl backdrop-blur-md border transition-all ${
              activeSpot === 'mac'
                ? 'bg-cyan-500/30 border-cyan-400 ring-4 ring-cyan-500/40 scale-110 shadow-[0_0_25px_rgba(6,182,212,0.8)]'
                : 'bg-black/60 border-cyan-500/50 hover:bg-cyan-950/50 animate-pulse'
            }`}
          >
            <div className="flex items-center gap-1.5 text-cyan-300 font-mono text-[11px] font-bold px-2 py-1 rounded bg-black/80">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>MAC: {macAddress}</span>
            </div>
          </button>

          {/* Interactive Hotspot 2: RJ-45 10GbE Socket (8 Gold Pins) */}
          <button
            type="button"
            onClick={() => setActiveSpot('rj45')}
            className={`absolute top-[18%] left-[50%] -translate-x-1/2 p-1.5 rounded-lg backdrop-blur-md border transition-all ${
              activeSpot === 'rj45'
                ? 'bg-amber-500/30 border-amber-400 ring-4 ring-amber-500/40 scale-105 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
                : 'bg-black/60 border-amber-500/40 hover:bg-amber-950/50'
            }`}
          >
            <span className="text-amber-300 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/80">
              RJ-45 8-Pin Contact
            </span>
          </button>

          {/* Interactive Hotspot 3: PCIe Bus Interface (Golden Fingers) */}
          <button
            type="button"
            onClick={() => setActiveSpot('pins')}
            className={`absolute bottom-[10%] left-[8%] p-1.5 rounded-lg backdrop-blur-md border transition-all ${
              activeSpot === 'pins'
                ? 'bg-emerald-500/30 border-emerald-400 ring-4 ring-emerald-500/40 scale-105'
                : 'bg-black/60 border-emerald-500/40 hover:bg-emerald-950/50'
            }`}
          >
            <span className="text-emerald-300 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/80">
              PCIe Bus Traces
            </span>
          </button>
        </div>

        {/* Bottom Explanatory Drawer / Teachable Moment */}
        <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-slate-800 text-slate-200">
          {activeSpot === 'mac' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                The Factory Burned-In Physical Address (MAC)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Like a vehicle’s Vehicle Identification Number (VIN) stamped into steel at the factory, every Network Interface Card (NIC) has a 48-bit Media Access Control address permanently burned into read-only memory during fabrication.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700/60 text-cyan-300">
                  OUI Vendor Prefix: 00-1A-2B
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  Device Serial: 3C-4D-10
                </span>
                <span className="text-slate-400 text-[10px]">
                  (Ethernet switches inspect this address to build their forwarding tables)
                </span>
              </div>
            </div>
          )}

          {activeSpot === 'rj45' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Network className="w-4 h-4" />
                8-Pin Modular Jack (8P8C) &amp; Magnetics
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                The 8 gold-plated contact blades mate with the Cat6 copper cable. Ethernet signals travel as differential voltage pairs (+1V / -1V) through an isolation transformer, protecting the computer from electrical surges and EMI noise.
              </p>
            </div>
          )}

          {activeSpot === 'pins' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                PCIe Host Bus &amp; DMA Ring Buffers
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                When an Ethernet frame arrives on the wire, the controller uses Direct Memory Access (DMA) to copy raw frame bytes directly into the operating system’s RAM ring buffer without loading the CPU.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
