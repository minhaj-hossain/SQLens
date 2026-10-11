'use client';

import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Eye, EyeOff, Layers, Sparkles } from 'lucide-react';

export interface SubnetBitSlicerProps {
  initialIp?: string;
  initialPrefix?: number;
  isInteractive?: boolean;
  minPrefix?: number;
  maxPrefix?: number;
  initiallyCollapsed?: boolean;
  onPrefixChange?: (prefix: number) => void;
  showCalculations?: boolean;
  title?: string;
}

// Utility: parse IPv4 dotted quad into 4 octet numbers
export function parseIpv4(ip: string): number[] {
  const parts = ip.trim().split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return [0, 0, 0, 0];
  }
  return parts;
}

// Utility: convert 32-bit number to dotted quad string
export function intToIpv4(intVal: number): string {
  const o1 = (intVal >>> 24) & 255;
  const o2 = (intVal >>> 16) & 255;
  const o3 = (intVal >>> 8) & 255;
  const o4 = intVal & 255;
  return `${o1}.${o2}.${o3}.${o4}`;
}

// Utility: convert 4 octets to unsigned 32-bit integer
export function ipv4ToInt(octets: number[]): number {
  return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
}

// Calculate subnet details from IP and prefix length
export function calculateSubnet(ip: string, prefix: number) {
  const octets = parseIpv4(ip);
  const ipInt = ipv4ToInt(octets);

  // Mask integer
  const maskInt = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const wildcardInt = (~maskInt) >>> 0;
  const broadcastInt = (networkInt | wildcardInt) >>> 0;

  const totalAddresses = Math.pow(2, 32 - prefix);
  let usableHosts = 0;
  let firstUsableInt = networkInt;
  let lastUsableInt = broadcastInt;

  if (prefix === 31) {
    // RFC 3021: 2 usable host endpoints on point-to-point links
    usableHosts = 2;
    firstUsableInt = networkInt;
    lastUsableInt = broadcastInt;
  } else if (prefix === 32) {
    // Single host route
    usableHosts = 1;
    firstUsableInt = networkInt;
    lastUsableInt = networkInt;
  } else if (prefix < 31) {
    usableHosts = Math.max(0, totalAddresses - 2);
    firstUsableInt = (networkInt + 1) >>> 0;
    lastUsableInt = (broadcastInt - 1) >>> 0;
  }

  // Active octet (1-indexed: 1, 2, 3, or 4)
  const activeOctet = prefix === 0 ? 1 : Math.min(4, Math.ceil(prefix / 8));
  const hostBitsInActiveOctet = activeOctet * 8 - prefix;
  const blockIncrement = Math.pow(2, hostBitsInActiveOctet);

  return {
    octets,
    prefix,
    maskDotted: intToIpv4(maskInt),
    networkDotted: intToIpv4(networkInt),
    broadcastDotted: intToIpv4(broadcastInt),
    firstUsableDotted: intToIpv4(firstUsableInt),
    lastUsableDotted: intToIpv4(lastUsableInt),
    totalAddresses,
    usableHosts,
    activeOctet,
    hostBitsInActiveOctet,
    blockIncrement,
    maskInt,
    networkInt,
    broadcastInt,
  };
}

export const SubnetBitSlicer: React.FC<SubnetBitSlicerProps> = ({
  initialIp = '192.168.10.130',
  initialPrefix = 26,
  isInteractive = true,
  minPrefix = 1,
  maxPrefix = 32,
  initiallyCollapsed = false,
  onPrefixChange,
  showCalculations = true,
  title = '32-Bit CIDR Subnet Bit-Slicer',
}) => {
  const sliderId = useId();
  const [prefix, setPrefix] = useState<number>(initialPrefix);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(initiallyCollapsed);

  const subnet = calculateSubnet(initialIp, prefix);

  const handleSliderChange = (newPrefix: number) => {
    setPrefix(newPrefix);
    onPrefixChange?.(newPrefix);
  };

  // Convert each octet to an 8-bit boolean array (network=true, host=false)
  const octetBits = [0, 1, 2, 3].map((octIdx) => {
    const octVal = subnet.octets[octIdx];
    const bits: { bitIndex: number; val: number; isNetwork: boolean }[] = [];
    for (let bit = 7; bit >= 0; bit--) {
      const bitIndex = octIdx * 8 + (7 - bit);
      const isNetwork = bitIndex < prefix;
      const val = (octVal >> bit) & 1;
      bits.push({ bitIndex, val, isNetwork });
    }
    return { octIdx, octVal, bits };
  });

  return (
    <div
      className="w-full rounded-2xl border border-border bg-surface-1/90 backdrop-blur-md shadow-lg overflow-hidden text-text transition-all"
      data-testid="subnet-bit-slicer"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-2/60 border-b border-border-soft">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-func/15 border border-func/30 flex items-center justify-center text-func">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-mono text-xs sm:text-sm font-bold text-text flex items-center gap-2">
              {title}
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-surface-3 border border-border text-text-dim">
                {initialIp}/{prefix}
              </span>
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium text-text-dim hover:text-text hover:bg-surface-3 transition-colors"
          data-testid="toggle-collapse-bit-slicer"
        >
          {isCollapsed ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Expand Visualizer</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Collapse</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4 sm:p-5 space-y-5"
          >
            {/* Interactive Prefix Slider */}
            {isInteractive && (
              <div className="space-y-2 bg-surface-2/40 border border-border-soft rounded-xl p-3.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <label htmlFor={sliderId} className="text-text-dim font-bold uppercase tracking-wider">
                    CIDR Prefix Length: <span className="text-func font-extrabold text-sm">/{prefix}</span>
                  </label>
                  <span className="text-text-dim">
                    Mask: <span className="text-text font-bold">{subnet.maskDotted}</span>
                  </span>
                </div>
                <input
                  id={sliderId}
                  type="range"
                  min={minPrefix}
                  max={maxPrefix}
                  value={prefix}
                  onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-surface-3 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  data-testid="cidr-prefix-slider"
                />
                <div className="flex justify-between text-[10px] font-mono text-text-muted px-0.5">
                  <span>/1 (Classless WAN)</span>
                  <span>/8</span>
                  <span>/16</span>
                  <span>/24 (Class C size)</span>
                  <span>/32 (Host)</span>
                </div>
              </div>
            )}

            {/* 32-Bit Grid with 4 Octets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-text-dim">
                <span>32-Bit Binary Representation:</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-500/30 border border-blue-400" />
                    <span className="text-blue-400 font-bold">Network Bits ({prefix})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-400" />
                    <span className="text-emerald-400 font-bold">Host Bits ({32 - prefix})</span>
                  </span>
                </div>
              </div>

              {/* Octets row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {octetBits.map(({ octIdx, octVal, bits }) => {
                  const isThisActiveOctet = octIdx + 1 === subnet.activeOctet;
                  return (
                    <div
                      key={octIdx}
                      className={`p-3 rounded-xl border transition-all ${
                        isThisActiveOctet
                          ? 'border-blue-500/50 bg-blue-500/5 ring-1 ring-blue-500/20'
                          : 'border-border-soft bg-surface-2/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider font-semibold">
                          Octet {octIdx + 1} {isThisActiveOctet && '★ Active'}
                        </span>
                        <span className="font-mono text-xs font-bold text-text px-1.5 py-0.5 rounded bg-surface-3 border border-border-soft">
                          {octVal}
                        </span>
                      </div>

                      {/* 8 Bits Grid */}
                      <div className="grid grid-cols-8 gap-1">
                        {bits.map(({ bitIndex, val, isNetwork }) => (
                          <div
                            key={bitIndex}
                            title={`Bit ${bitIndex}: ${isNetwork ? 'Network' : 'Host'}`}
                            className={`flex flex-col items-center justify-center py-1.5 rounded text-[11px] font-mono font-bold border transition-colors ${
                              isNetwork
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}
                          >
                            <span>{val}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-1.5 text-center text-[9px] font-mono text-text-dim">
                        Mask: {parseIpv4(subnet.maskDotted)[octIdx]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calculations & Subnet Boundaries */}
            {showCalculations && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
                <div className="p-2.5 rounded-xl bg-surface-2/60 border border-border-soft">
                  <div className="text-[10px] font-mono text-text-dim font-semibold uppercase">Network Address</div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-blue-400 truncate" data-testid="calc-network-address">
                    {subnet.networkDotted}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-2/60 border border-border-soft">
                  <div className="text-[10px] font-mono text-text-dim font-semibold uppercase">Broadcast Address</div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-amber-400 truncate" data-testid="calc-broadcast-address">
                    {subnet.broadcastDotted}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-2/60 border border-border-soft">
                  <div className="text-[10px] font-mono text-text-dim font-semibold uppercase">First Usable</div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-emerald-400 truncate" data-testid="calc-first-usable">
                    {subnet.firstUsableDotted}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-2/60 border border-border-soft">
                  <div className="text-[10px] font-mono text-text-dim font-semibold uppercase">Last Usable</div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-emerald-400 truncate" data-testid="calc-last-usable">
                    {subnet.lastUsableDotted}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-2/60 border border-border-soft">
                  <div className="text-[10px] font-mono text-text-dim font-semibold uppercase">Usable Hosts</div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-text truncate" data-testid="calc-usable-hosts">
                    {subnet.usableHosts.toLocaleString()}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-2/60 border border-border-soft">
                  <div className="text-[10px] font-mono text-text-dim font-semibold uppercase">Octet Increment</div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-purple-400 truncate" data-testid="calc-block-increment">
                    {subnet.blockIncrement}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
