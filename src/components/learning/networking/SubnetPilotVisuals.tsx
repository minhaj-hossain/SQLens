'use client';

import React from 'react';
import { Terminal, Shield, ArrowRight, Network, Server, Laptop, Activity } from 'lucide-react';

export interface RouterOnAStickProps {
  workstationIp?: string;
  dest1Ip?: string;
  dest2Ip?: string;
}

export const RouterOnAStickDiagram: React.FC<RouterOnAStickProps> = ({
  workstationIp = '10.10.4.82/28',
  dest1Ip = '10.10.4.94/28',
  dest2Ip = '10.10.4.98/28',
}) => {
  return (
    <div
      className="w-full rounded-2xl border border-border bg-surface-1/90 backdrop-blur-md p-4 sm:p-5 shadow-lg space-y-4 text-text"
      data-testid="router-on-a-stick-diagram"
    >
      <div className="flex items-center justify-between border-b border-border-soft pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-mono text-xs sm:text-sm font-bold text-text">
              802.1Q Router-on-a-Stick Architecture
            </h4>
            <span className="text-[10px] font-mono text-text-dim">
              Single Physical Trunk Cable (Gig0/0 ↔ Port 24)
            </span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 border border-blue-500/30 text-blue-300">
          VLAN 10 &amp; VLAN 20
        </span>
      </div>

      {/* Router Node */}
      <div className="p-3 rounded-xl bg-surface-2/70 border border-blue-500/40 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono font-bold">
          <span className="flex items-center gap-1.5 text-blue-300">
            <Server className="w-4 h-4 text-blue-400" /> Router R1 (Physical Interface Gig0/0)
          </span>
          <span className="text-[10px] text-text-muted">Single Physical Port</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="p-2 rounded bg-surface-3 border border-border-soft">
            <div className="text-blue-400 font-bold">Subinterface Gig0/0.10 (VLAN 10)</div>
            <div className="text-text-dim">IP: 10.10.4.81/28</div>
            <div className="text-text-dim">MAC: GW:81:81:81:81:81</div>
          </div>
          <div className="p-2 rounded bg-surface-3 border border-border-soft">
            <div className="text-amber-400 font-bold">Subinterface Gig0/0.20 (VLAN 20)</div>
            <div className="text-text-dim">IP: 10.10.4.97/28</div>
            <div className="text-text-dim">MAC: GW:97:97:97:97:97</div>
          </div>
        </div>
      </div>

      {/* Trunk Connection */}
      <div className="flex flex-col items-center justify-center py-1">
        <div className="h-4 w-0.5 bg-blue-500/60" />
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-surface-3 border border-border text-text-dim">
          802.1Q Tagged Trunk Link
        </span>
        <div className="h-4 w-0.5 bg-blue-500/60" />
      </div>

      {/* Switch & Access Ports */}
      <div className="p-3 rounded-xl bg-surface-2/70 border border-border-soft space-y-3">
        <div className="flex items-center justify-between text-xs font-mono font-bold">
          <span className="flex items-center gap-1.5 text-text">
            <Shield className="w-4 h-4 text-purple-400" /> Switch SW1 (Trunk Port 24)
          </span>
          <span className="text-[10px] font-mono text-purple-400">Layer 2 Isolation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
          {/* Workstation A */}
          <div className="p-2.5 rounded-lg bg-surface-3 border border-blue-500/40">
            <div className="text-[10px] text-blue-400 font-bold">Port 1 (Access VLAN 10)</div>
            <div className="text-text font-bold flex items-center gap-1 mt-1">
              <Laptop className="w-3.5 h-3.5 text-blue-400" /> Workstation A
            </div>
            <div className="text-text-dim text-[10px] mt-0.5">IP: {workstationIp}</div>
            <div className="text-text-dim text-[10px]">GW: 10.10.4.81</div>
          </div>

          {/* Destination 1 */}
          <div className="p-2.5 rounded-lg bg-surface-3 border border-blue-500/40">
            <div className="text-[10px] text-blue-400 font-bold">Port 2 (Access VLAN 10)</div>
            <div className="text-text font-bold flex items-center gap-1 mt-1">
              <Laptop className="w-3.5 h-3.5 text-blue-400" /> Destination 1
            </div>
            <div className="text-text-dim text-[10px] mt-0.5">IP: {dest1Ip}</div>
            <div className="text-emerald-400 text-[10px] font-semibold">Local Subnet (.80–.95)</div>
          </div>

          {/* Destination 2 */}
          <div className="p-2.5 rounded-lg bg-surface-3 border border-amber-500/40">
            <div className="text-[10px] text-amber-400 font-bold">Port 5 (Access VLAN 20)</div>
            <div className="text-text font-bold flex items-center gap-1 mt-1">
              <Laptop className="w-3.5 h-3.5 text-amber-400" /> Destination 2
            </div>
            <div className="text-text-dim text-[10px] mt-0.5">IP: {dest2Ip}</div>
            <div className="text-amber-400 text-[10px] font-semibold">Remote Subnet (.96–.111)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface HostTelemetryTerminalProps {
  routeOutput?: string;
  pingOutput?: string;
  packetCount?: number;
}

export const HostTelemetryTerminal: React.FC<HostTelemetryTerminalProps> = ({
  routeOutput = `default via 192.168.1.129 dev eth0 [status: unreachable - gateway not on link]\n192.168.1.0/25 dev eth0 proto kernel scope link src 192.168.1.120`,
  pingOutput = `C:\\> ping 192.168.1.129\nPING 192.168.1.129: Destination host unreachable (no valid on-link route to gateway)`,
  packetCount = 0,
}) => {
  return (
    <div
      className="w-full rounded-2xl border border-border bg-slate-950/95 backdrop-blur-md p-4 sm:p-5 shadow-xl space-y-3 font-mono text-xs text-slate-200"
      data-testid="host-telemetry-terminal"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200 text-xs">Simulated Host Terminal Telemetry</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
        </div>
      </div>

      {/* ip route show */}
      <div className="space-y-1">
        <div className="text-slate-400 text-[11px] flex items-center gap-1">
          <span className="text-emerald-400 font-bold">$</span> ip route show
        </div>
        <pre className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-[11px] text-amber-300 overflow-x-auto whitespace-pre-wrap">
          {routeOutput}
        </pre>
      </div>

      {/* ping command */}
      <div className="space-y-1">
        <div className="text-slate-400 text-[11px] flex items-center gap-1">
          <span className="text-emerald-400 font-bold">$</span> ping 192.168.1.129
        </div>
        <pre className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-[11px] text-rose-300 overflow-x-auto whitespace-pre-wrap">
          {pingOutput}
        </pre>
      </div>

      {/* sniffer bar */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
        <div className="flex items-center gap-2 text-slate-400">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>Packet Sniffer on Port 2 (eth0):</span>
        </div>
        <span className="text-amber-400 font-bold">
          {packetCount} packets transmitted (ARP suppressed internally)
        </span>
      </div>
    </div>
  );
};
