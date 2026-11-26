import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgWorkstation } from '../SvgWorkstation';
import { SvgSwitch } from '../SvgSwitch';
import { SvgRouter } from '../SvgRouter';
import { SvgCable } from '../SvgCable';

export const Day24Canvas: React.FC<DayCanvasProps> = ({ activeStepIndex }) => (
  <>
    {/* Top Title Banner */}
    <rect
      x={490}
      y={18}
      width={500}
      height={22}
      rx={4}
      fill="#070c14"
      stroke="#38bdf8"
      strokeWidth={1}
    />
    <text
      x={740}
      y={32}
      textAnchor="middle"
      fill="#38bdf8"
      fontSize="8"
      fontWeight="700"
      fontFamily="monospace"
    >
      DHCP: AUTOMATIC ADDRESSING · DORA, POOLS, OPTIONS &amp; LEASE TIMERS
    </text>

    {/* Layer 2 Broadcast Domain Boundary */}
    <rect
      x={60}
      y={50}
      width={1360}
      height={335}
      rx={10}
      fill="rgba(56, 189, 248, 0.03)"
      stroke="#38bdf8"
      strokeWidth={1.2}
      strokeDasharray="6 4"
    />
    <rect
      x={75}
      y={58}
      width={285}
      height={18}
      rx={4}
      fill="#070c14"
      stroke="#38bdf8"
      strokeWidth={1}
    />
    <text
      x={217}
      y={70}
      textAnchor="middle"
      fill="#38bdf8"
      fontSize="7.5"
      fontWeight="700"
      fontFamily="monospace"
    >
      192.168.24.0/24 · LAYER 2 BROADCAST DOMAIN
    </text>

    {/* Physical Links */}
    {/* PC1 <-> Switch SW1 (312px horizontal span: 208..520) */}
    <SvgCable
      x1={208}
      y1={238}
      x2={520}
      y2={238}
      color={activeStepIndex === 0 ? '#f59e0b' : '#38bdf8'}
      isTransmitting={activeStepIndex <= 1 || activeStepIndex === 3}
    />

    {/* Switch SW1 <-> DHCP Server (568px horizontal span: 632..1200) */}
    <SvgCable
      x1={632}
      y1={238}
      x2={1200}
      y2={238}
      color={activeStepIndex >= 1 ? '#10b981' : '#38bdf8'}
      isTransmitting={activeStepIndex >= 1}
    />

    {/* Switch SW1 <-> Router R1 (Gateway) */}
    <SvgCable
      x1={632}
      y1={228}
      x2={890}
      y2={121}
      color="#64748b"
      isTransmitting={activeStepIndex >= 2}
    />

    {/* PC1 Workstation (88x94 envelope -> x:120..208, y:195..289) */}
    <SvgWorkstation
      x={120}
      y={195}
      name="PC1"
      ip={activeStepIndex === 0 ? '0.0.0.0' : '192.168.24.101/24'}
      mac="aa:bb:cc:00:24:01"
      ipColor={activeStepIndex === 0 ? 'default' : 'green'}
      showIp={true}
      showMac={true}
      isLinked={true}
    />

    {/* Switch SW1 (112x48 -> x:520..632, y:215..263) */}
    <SvgSwitch
      x={520}
      y={215}
      port1Active={true}
      port2Active={true}
      port3Active={true}
    />

    {/* Router R1 (Default Gateway) */}
    <SvgRouter
      x={890}
      y={95}
      name="Router R1 (GW)"
      port1Ip="192.168.24.1/24"
      port2Ip="10.0.0.1/30"
      port1Active={true}
      port2Active={true}
      showPortIps={true}
    />

    {/* DHCP Server (dark-slate server rack — NO silver workstation base) */}
    <g transform="translate(1200, 195)">
      <rect
        x={0}
        y={0}
        width={96}
        height={64}
        rx={6}
        fill="#0f172a"
        stroke="#38bdf8"
        strokeWidth={1.5}
      />
      <rect x={10} y={10} width={76} height={12} rx={2} fill="#1e293b" />
      <circle cx={18} cy={16} r={2.5} fill="#10b981" />
      <rect x={10} y={26} width={76} height={12} rx={2} fill="#1e293b" />
      <circle cx={18} cy={32} r={2.5} fill="#38bdf8" />
      <rect x={10} y={42} width={76} height={12} rx={2} fill="#1e293b" />
      <circle cx={18} cy={48} r={2.5} fill="#38bdf8" />
      <text
        x={48}
        y={78}
        textAnchor="middle"
        fill="#e2e8f0"
        fontSize="9"
        fontWeight="700"
        fontFamily="monospace"
      >
        DHCP Server
      </text>
      <rect x={4} y={84} width={88} height={16} rx={4} fill="#082f49" stroke="#38bdf8" strokeWidth={1} />
      <text
        x={48}
        y={95}
        textAnchor="middle"
        fill="#7dd3fc"
        fontSize="7.5"
        fontWeight="700"
        fontFamily="monospace"
      >
        192.168.24.10
      </text>
    </g>

    {/* Cable Packet Badges (width=130 fits 312px & 568px spans cleanly) */}
    {activeStepIndex === 0 && (
      <g transform="translate(299, 225)">
        <rect x={0} y={0} width={130} height={26} rx={5} fill="#451a03" stroke="#f59e0b" strokeWidth={1.2} />
        <text x={65} y={16} textAnchor="middle" fill="#fcd34d" fontSize="7.5" fontWeight="700" fontFamily="monospace">
          0.0.0.0:68 → :67
        </text>
      </g>
    )}

    {activeStepIndex === 1 && (
      <>
        <g transform="translate(299, 225)">
          <rect x={0} y={0} width={130} height={26} rx={5} fill="#082f49" stroke="#38bdf8" strokeWidth={1.2} />
          <text x={65} y={16} textAnchor="middle" fill="#7dd3fc" fontSize="7.5" fontWeight="700" fontFamily="monospace">
            DISCOVER / REQUEST
          </text>
        </g>
        <g transform="translate(851, 225)">
          <rect x={0} y={0} width={130} height={26} rx={5} fill="#064e3b" stroke="#10b981" strokeWidth={1.2} />
          <text x={65} y={16} textAnchor="middle" fill="#6ee7b7" fontSize="7.5" fontWeight="700" fontFamily="monospace">
            OFFER / ACK (.101)
          </text>
        </g>
      </>
    )}

    {activeStepIndex === 2 && (
      <g transform="translate(851, 225)">
        <rect x={0} y={0} width={130} height={26} rx={5} fill="#064e3b" stroke="#10b981" strokeWidth={1.2} />
        <text x={65} y={16} textAnchor="middle" fill="#6ee7b7" fontSize="7.5" fontWeight="700" fontFamily="monospace">
          POOL: .100 – .200
        </text>
      </g>
    )}

    {activeStepIndex === 3 && (
      <g transform="translate(851, 225)">
        <rect x={0} y={0} width={130} height={26} rx={5} fill="#082f49" stroke="#38bdf8" strokeWidth={1.2} />
        <text x={65} y={16} textAnchor="middle" fill="#7dd3fc" fontSize="7.5" fontWeight="700" fontFamily="monospace">
          T1 (50%) UNICAST
        </text>
      </g>
    )}

    {/* Bottom HUD Cards (y=395 clears PC1 & DHCP Server at y=289 by 106px) */}
    {activeStepIndex === 0 && (
      <>
        <g transform="translate(70, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#f59e0b" strokeWidth={1.2} />
          <text x={20} y={28} fill="#fbbf24" fontSize="11" fontWeight="700" fontFamily="monospace">
            UNCONFIGURED BOOTSTRAP (0.0.0.0)
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Interface eth0 has MAC aa:bb:cc:00:24:01 but no IPv4 address.
          </text>
          <text x={20} y={80} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Broadcast: L2 ff:ff:ff:ff:ff:ff | L3 255.255.255.255
          </text>
          <text x={20} y={105} fill="#94a3b8" fontSize="10" fontFamily="monospace">
            • Transport: Client UDP port 68 → Server UDP port 67 (RFC 2131)
          </text>
        </g>
        <g transform="translate(780, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
          <text x={20} y={28} fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="monospace">
            WHY DYNAMIC ADDRESSING IS MANDATORY
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Manual IP entry across thousands of endpoints causes conflicts.
          </text>
          <text x={20} y={80} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • DHCP delivers IP, Subnet Mask, Gateway, and DNS automatically.
          </text>
        </g>
      </>
    )}

    {activeStepIndex === 1 && (
      <>
        <g transform="translate(70, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
          <text x={20} y={28} fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="monospace">
            THE 4-PACKET DORA HANDSHAKE (RFC 2131)
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            1. DISCOVER : 0.0.0.0:68 → 255.255.255.255:67 (xid + chaddr)
          </text>
          <text x={20} y={80} fill="#4ade80" fontSize="10.5" fontFamily="monospace">
            2. OFFER    : Server proposes 192.168.24.101/24 + Options
          </text>
          <text x={20} y={105} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            3. REQUEST  : Broadcast acceptance (Option 54 ServerID=.10)
          </text>
          <text x={20} y={130} fill="#4ade80" fontSize="10.5" fontFamily="monospace">
            4. ACK      : Server commits lease; PC1 runs Gratuitous ARP DAD
          </text>
        </g>
        <g transform="translate(780, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#10b981" strokeWidth={1.2} />
          <text x={20} y={28} fill="#34d399" fontSize="11" fontWeight="700" fontFamily="monospace">
            PC1 BOUND CONFIGURATION
          </text>
          <text x={20} y={55} fill="#4ade80" fontSize="10.5" fontFamily="monospace">
            • IPv4 / Mask : 192.168.24.101 / 255.255.255.0
          </text>
          <text x={20} y={80} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Gateway     : 192.168.24.1 (Router R1)
          </text>
          <text x={20} y={105} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • DNS Server  : 192.168.24.10 | Lease: 86400s (24h)
          </text>
        </g>
      </>
    )}

    {activeStepIndex === 2 && (
      <>
        <g transform="translate(70, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#10b981" strokeWidth={1.2} />
          <text x={20} y={28} fill="#34d399" fontSize="11" fontWeight="700" fontFamily="monospace">
            ADDRESS POOL &amp; STATIC EXCLUSIONS
          </text>
          <text x={20} y={55} fill="#fbbf24" fontSize="10.5" fontFamily="monospace">
            • Excluded : 192.168.24.1 – .99 (.1 Router R1, .10 Server)
          </text>
          <text x={20} y={80} fill="#4ade80" fontSize="10.5" fontFamily="monospace">
            • Pool     : 192.168.24.100 – .200 (101 IPs | 1 leased)
          </text>
          <text x={20} y={105} fill="#94a3b8" fontSize="10" fontFamily="monospace">
            • Binding  : aa:bb:cc:00:24:01 → 192.168.24.101 (ACTIVE)
          </text>
        </g>
        <g transform="translate(780, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
          <text x={20} y={28} fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="monospace">
            DHCP OPTIONS PAYLOAD (RFC 2132)
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Option 1  (Subnet Mask)     : 255.255.255.0
          </text>
          <text x={20} y={80} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Option 3  (Default Gateway) : 192.168.24.1
          </text>
          <text x={20} y={105} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Option 6  (DNS) : .10 | Option 51 (Lease) : 86400s
          </text>
        </g>
      </>
    )}

    {activeStepIndex === 3 && (
      <>
        <g transform="translate(70, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
          <text x={20} y={28} fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="monospace">
            LEASE TIMERS: T1 (50%) &amp; T2 (87.5%)
          </text>
          <text x={20} y={55} fill="#4ade80" fontSize="10.5" fontFamily="monospace">
            • T1 (50% = 12h)   : Unicast DHCPREQUEST → 192.168.24.10:67
          </text>
          <text x={20} y={80} fill="#fbbf24" fontSize="10.5" fontFamily="monospace">
            • T2 (87.5% = 21h) : Broadcast DHCPREQUEST → 255.255.255.255:67
          </text>
          <text x={20} y={105} fill="#f87171" fontSize="10.5" fontFamily="monospace">
            • 100% (24h)       : Drop IP (0.0.0.0) &amp; restart DORA
          </text>
        </g>
        <g transform="translate(780, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#10b981" strokeWidth={1.2} />
          <text x={20} y={28} fill="#34d399" fontSize="11" fontWeight="700" fontFamily="monospace">
            SEAMLESS RENEWAL &amp; DHCPRELEASE
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • T1 unicast renewal resets the 24h clock with zero packet drop.
          </text>
          <text x={20} y={80} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • On clean shutdown, PC1 sends DHCPRELEASE to free the IP early.
          </text>
        </g>
      </>
    )}

    {activeStepIndex === 4 && (
      <>
        <g transform="translate(70, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
          <text x={20} y={28} fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="monospace">
            DAY 24 COMPLETE · DHCP (RFC 2131) SUMMARY
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • UDP 68 → 67 · 0.0.0.0 → 255.255.255.255 broadcast bootstrap
          </text>
          <text x={20} y={80} fill="#4ade80" fontSize="10.5" fontFamily="monospace">
            • DORA + DAD · Pools + Options (1, 3, 6, 51) · T1 50% / T2 87.5%
          </text>
        </g>
        <g transform="translate(780, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#10b981" strokeWidth={1.2} />
          <text x={20} y={28} fill="#34d399" fontSize="11" fontWeight="700" fontFamily="monospace">
            NEXT: DAY 25 · DHCP IN LARGER NETWORKS
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            Broadcasts (255.255.255.255) stop at Router R1.
          </text>
          <text x={20} y={85} fill="#94a3b8" fontSize="10.5" fontFamily="monospace">
            Day 25 introduces DHCP Relay Agents (ip helper-address) to serve
          </text>
          <text x={20} y={105} fill="#94a3b8" fontSize="10.5" fontFamily="monospace">
            remote subnets from a single centralized DHCP server.
          </text>
        </g>
      </>
    )}
  </>
);
