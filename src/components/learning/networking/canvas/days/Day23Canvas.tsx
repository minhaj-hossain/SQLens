import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgRouter } from '../SvgRouter';
import { SvgCable } from '../SvgCable';

export const Day23Canvas: React.FC<DayCanvasProps> = ({ activeStepIndex }) => (
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
      FAILOVER AND CONVERGENCE · LSA RE-FLOOD, SPF RERUN &amp; BFD (15ms)
    </text>

    {/* Area 0 (0.0.0.0) Backbone Boundary */}
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
      width={240}
      height={18}
      rx={4}
      fill="#070c14"
      stroke="#38bdf8"
      strokeWidth={1}
    />
    <text
      x={195}
      y={70}
      textAnchor="middle"
      fill="#38bdf8"
      fontSize="7.5"
      fontWeight="700"
      fontFamily="monospace"
    >
      AREA 0.0.0.0 · OSPF + BFD DOMAIN
    </text>

    {/* Destination Subnet Pill (44px clear above R5 at y=210) */}
    <rect
      x={1213}
      y={138}
      width={140}
      height={28}
      rx={6}
      fill="#0f172a"
      stroke="#38bdf8"
      strokeWidth={1.2}
    />
    <text
      x={1283}
      y={156}
      textAnchor="middle"
      fill="#7dd3fc"
      fontSize="8.5"
      fontWeight="700"
      fontFamily="monospace"
    >
      10.23.0.0/24 LAN
    </text>
    <line
      x1={1283}
      y1={166}
      x2={1283}
      y2={210}
      stroke="#38bdf8"
      strokeWidth={1.5}
      strokeDasharray="3 3"
    />

    {/* Physical Links */}
    {/* R1 <-> R2 (Backup 10 Mbps Path -> Active on Steps 1-4) */}
    <SvgCable
      x1={256}
      y1={224}
      x2={677}
      y2={121}
      color={activeStepIndex >= 1 ? '#10b981' : '#64748b'}
      isTransmitting={activeStepIndex >= 1}
    />

    {/* R2 <-> R5 (Backup 10 Mbps Path -> Active on Steps 1-4) */}
    <SvgCable
      x1={803}
      y1={121}
      x2={1220}
      y2={224}
      color={activeStepIndex >= 1 ? '#10b981' : '#64748b'}
      isTransmitting={activeStepIndex >= 1}
    />

    {/* R1 <-> R3 (Lower 10 Gbps Fiber) */}
    <SvgCable
      x1={256}
      y1={248}
      x2={460}
      y2={286}
      color={activeStepIndex === 1 ? '#f59e0b' : '#38bdf8'}
      isTransmitting={activeStepIndex === 1 || activeStepIndex === 3}
    />

    {/* R3 <-> R4 (Severed 10 Gbps Fiber Link — 304px span) */}
    <SvgCable
      x1={586}
      y1={286}
      x2={890}
      y2={286}
      color="#ef4444"
      isTransmitting={false}
    />

    {/* R4 <-> R5 (Lower 10 Gbps Fiber) */}
    <SvgCable
      x1={1016}
      y1={286}
      x2={1220}
      y2={248}
      color={activeStepIndex === 1 ? '#f59e0b' : '#38bdf8'}
      isTransmitting={activeStepIndex === 1}
    />

    {/* Routers */}
    <SvgRouter
      x={130}
      y={210}
      name="R1 (1.1.1.1)"
      port1Ip="10.23.12.1/30"
      port2Ip="10.23.13.1/30"
      port1Active={true}
      port2Active={true}
      showPortIps={true}
    />
    <SvgRouter
      x={677}
      y={95}
      name="R2 (2.2.2.2)"
      port1Ip="10.23.12.2/30"
      port2Ip="10.23.25.1/30"
      port1Active={true}
      port2Active={true}
      showPortIps={true}
    />
    <SvgRouter
      x={460}
      y={260}
      name="R3 (3.3.3.3)"
      port1Ip="10.23.13.2/30"
      port2Ip="10.23.34.1/30"
      port1Active={true}
      port2Active={false}
      showPortIps={true}
    />
    <SvgRouter
      x={890}
      y={260}
      name="R4 (4.4.4.4)"
      port1Ip="10.23.34.2/30"
      port2Ip="10.23.45.1/30"
      port1Active={false}
      port2Active={true}
      showPortIps={true}
    />
    <SvgRouter
      x={1220}
      y={210}
      name="R5 (5.5.5.5)"
      port1Ip="10.23.25.2/30"
      port2Ip="10.23.0.1/24"
      port1Active={true}
      port2Active={true}
      showPortIps={true}
    />

    {/* Severed Link Badge on R3 <-> R4 (width=130 fits 304px span with 87px clearance) */}
    <g transform="translate(673, 273)">
      <rect x={0} y={0} width={130} height={26} rx={5} fill="#450a0a" stroke="#ef4444" strokeWidth={1.4} />
      <text x={65} y={16} textAnchor="middle" fill="#fca5a5" fontSize="7.5" fontWeight="700" fontFamily="monospace">
        LINK CUT (NO-CARRIER)
      </text>
    </g>

    {/* Step 1: Staggered LSA Flood & SPF Rerun Callouts (75px vertical stagger) */}
    {activeStepIndex === 1 && (
      <>
        <g transform="translate(275, 195)">
          <rect x={0} y={0} width={175} height={26} rx={5} fill="#451a03" stroke="#f59e0b" strokeWidth={1.2} />
          <text x={87} y={16} textAnchor="middle" fill="#fcd34d" fontSize="7.5" fontWeight="700" fontFamily="monospace">
            LSA SEQ 0x80000006
          </text>
        </g>
        <g transform="translate(390, 120)">
          <rect x={0} y={0} width={195} height={26} rx={5} fill="#064e3b" stroke="#10b981" strokeWidth={1.2} />
          <text x={97} y={16} textAnchor="middle" fill="#6ee7b7" fontSize="7.5" fontWeight="700" fontFamily="monospace">
            SPF: R1→R2→R5 (COST 2000)
          </text>
        </g>
      </>
    )}

    {/* Step 2: Converged Backup Path Badge */}
    {activeStepIndex === 2 && (
      <g transform="translate(390, 120)">
        <rect x={0} y={0} width={195} height={26} rx={5} fill="#064e3b" stroke="#10b981" strokeWidth={1.2} />
        <text x={97} y={16} textAnchor="middle" fill="#6ee7b7" fontSize="7.5" fontWeight="700" fontFamily="monospace">
          CONVERGED IN ~85 ms
        </text>
      </g>
    )}

    {/* Step 3: BFD Sub-Second Probe Badge */}
    {activeStepIndex === 3 && (
      <g transform="translate(390, 120)">
        <rect x={0} y={0} width={210} height={26} rx={5} fill="#082f49" stroke="#38bdf8" strokeWidth={1.2} />
        <text x={105} y={16} textAnchor="middle" fill="#7dd3fc" fontSize="7.5" fontWeight="700" fontFamily="monospace">
          BFD UDP:3784 (5ms × 3 = 15ms)
        </text>
      </g>
    )}

    {/* Bottom HUD Cards (y=395 clears R3/R4 port pills at y=348 by 47px) */}
    {activeStepIndex === 0 && (
      <>
        <g transform="translate(70, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#ef4444" strokeWidth={1.2} />
          <text x={20} y={28} fill="#f87171" fontSize="11" fontWeight="700" fontFamily="monospace">
            FAILURE DETECTION: NO-CARRIER VS DEAD TIMER
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Direct Fiber Cut : Kernel detects NO-CARRIER in &lt; 10 ms.
          </text>
          <text x={20} y={80} fill="#fbbf24" fontSize="10.5" fontFamily="monospace">
            • Silent L2 Failure: Port stays UP → OSPF waits 40s Dead timer.
          </text>
          <text x={20} y={105} fill="#94a3b8" fontSize="10" fontFamily="monospace">
            • R3 &amp; R4 drop adjacency immediately and prepare updated LSAs.
          </text>
        </g>
        <g transform="translate(780, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
          <text x={20} y={28} fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="monospace">
            WHY DETECTION SPEED DOMINATES CONVERGENCE
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • LSA flooding and Dijkstra SPF take only tens of milliseconds.
          </text>
          <text x={20} y={80} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Waiting 40 seconds on Hello/Dead timers drops real-time traffic.
          </text>
          <text x={20} y={105} fill="#94a3b8" fontSize="10" fontFamily="monospace">
            • Next: trace the LSA flood and SPF rerun onto R1 → R2 → R5.
          </text>
        </g>
      </>
    )}

    {activeStepIndex === 1 && (
      <>
        <g transform="translate(70, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#f59e0b" strokeWidth={1.2} />
          <text x={20} y={28} fill="#fbbf24" fontSize="11" fontWeight="700" fontFamily="monospace">
            EVENT-DRIVEN LSA FLOOD &amp; SPF THROTTLE
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • R3 &amp; R4 increment Type-1 LSA Seq (0x80000005 → 0x80000006).
          </text>
          <text x={20} y={80} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Area 0 LSDB removes R3 ↔ R4 edge in ~12 ms across all routers.
          </text>
          <text x={20} y={105} fill="#94a3b8" fontSize="10" fontFamily="monospace">
            • 50 ms SPF throttle batches flaps before running Dijkstra (4 ms).
          </text>
        </g>
        <g transform="translate(780, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#10b981" strokeWidth={1.2} />
          <text x={20} y={28} fill="#34d399" fontSize="11" fontWeight="700" fontFamily="monospace">
            REDUNDANT PATH PROMOTED (COST 2000)
          </text>
          <text x={20} y={55} fill="#4ade80" fontSize="10.5" fontFamily="monospace">
            [NEW ACTIVE] R1 → R2 → R5 (10 Mbps backup, OSPF Cost 2000)
          </text>
          <text x={20} y={80} fill="#f87171" fontSize="10.5" fontFamily="monospace">
            [WITHDRAWN]  R1 → R3 → R4 → R5 (R3 ↔ R4 edge DOWN)
          </text>
          <text x={20} y={105} fill="#94a3b8" fontSize="10" fontFamily="monospace">
            No count-to-infinity loop—every router holds the identical LSDB.
          </text>
        </g>
      </>
    )}

    {activeStepIndex === 2 && (
      <>
        <g transform="translate(70, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#10b981" strokeWidth={1.2} />
          <text x={20} y={28} fill="#34d399" fontSize="11" fontWeight="700" fontFamily="monospace">
            CONVERGENCE TIME BUDGET (~85 ms TOTAL)
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Link Detection (8 ms) + LSA Flood (12 ms) = 20 ms
          </text>
          <text x={20} y={80} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • SPF Rerun (54 ms) + FIB Route Swap (11 ms) = 65 ms
          </text>
          <text x={20} y={105} fill="#4ade80" fontSize="10.5" fontFamily="monospace">
            • Total Failover: ~85 ms (vs 180s+ in legacy RIPv2)
          </text>
        </g>
        <g transform="translate(780, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
          <text x={20} y={28} fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="monospace">
            LIVE FAILOVER TRAFFIC: R1 → R2 → R5
          </text>
          <text x={20} y={55} fill="#4ade80" fontSize="10.5" fontFamily="monospace">
            10.23.0.0/24 FIB next-hop swapped to 10.23.12.2 (R2, eth0).
          </text>
          <text x={20} y={80} fill="#fbbf24" fontSize="10.5" fontFamily="monospace">
            Remaining gap: indirect silent failures still wait 40s Dead timer.
          </text>
        </g>
      </>
    )}

    {activeStepIndex === 3 && (
      <>
        <g transform="translate(70, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
          <text x={20} y={28} fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="monospace">
            BFD SUB-SECOND DETECTION (RFC 5880 · UDP 3784)
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Probe Interval: 5 ms Tx / 5 ms Rx | Multiplier: 3
          </text>
          <text x={20} y={80} fill="#4ade80" fontSize="10.5" fontFamily="monospace">
            • Detection Time: 3 × 5 ms = 15 ms (2,600× faster than 40s Dead)
          </text>
          <text x={20} y={105} fill="#94a3b8" fontSize="10" fontFamily="monospace">
            • Offloads rapid liveness from OSPF control-plane CPU.
          </text>
        </g>
        <g transform="translate(780, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#10b981" strokeWidth={1.2} />
          <text x={20} y={28} fill="#34d399" fontSize="11" fontWeight="700" fontFamily="monospace">
            OSPF + BFD CONVERGENCE GUARANTEE
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • On 3 missed BFD probes (15 ms), OSPF tears down neighbor now.
          </text>
          <text x={20} y={80} fill="#4ade80" fontSize="10.5" fontFamily="monospace">
            • Sub-100 ms convergence even across intermediate L2 switches.
          </text>
        </g>
      </>
    )}

    {activeStepIndex === 4 && (
      <>
        <g transform="translate(70, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
          <text x={20} y={28} fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="monospace">
            STAGE 6 COMPLETE · DYNAMIC ROUTING (DAYS 20–23)
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Day 20: Static O(R×S) limits, ASes, IGP vs EGP, AD ranking
          </text>
          <text x={20} y={80} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Day 21: RIPv2 hop count (15-hop cap) &amp; count-to-infinity
          </text>
          <text x={20} y={105} fill="#4ade80" fontSize="10.5" fontFamily="monospace">
            • Day 22–23: OSPF LSDB + Dijkstra SPF + BFD (sub-100 ms failover)
          </text>
        </g>
        <g transform="translate(780, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#10b981" strokeWidth={1.2} />
          <text x={20} y={28} fill="#34d399" fontSize="11" fontWeight="700" fontFamily="monospace">
            NEXT: STAGE 7 · DAY 24 · DHCP AUTOMATIC ADDRESSING
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            Stage 7 moves into core network services: DHCP, DNS, and NAT.
          </text>
          <text x={20} y={85} fill="#94a3b8" fontSize="10.5" fontFamily="monospace">
            Day 24 unpacks the 4-packet DORA handshake (Discover, Offer,
          </text>
          <text x={20} y={105} fill="#94a3b8" fontSize="10.5" fontFamily="monospace">
            Request, Acknowledge), address pools, and lease timers.
          </text>
        </g>
      </>
    )}
  </>
);
