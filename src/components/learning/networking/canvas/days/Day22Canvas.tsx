import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgRouter } from '../SvgRouter';
import { SvgCable } from '../SvgCable';

export const Day22Canvas: React.FC<DayCanvasProps> = ({ activeStepIndex }) => (
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
      OSPF: SHARING THE MAP · LINK-STATE, AREA 0, COST &amp; DIJKSTRA SPF
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
      AREA 0.0.0.0 · OSPF BACKBONE
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
      10.22.0.0/24 LAN
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
    {/* R1 <-> R2 (Upper 10 Mbps Serial Link — Cost 1000) */}
    <SvgCable
      x1={256}
      y1={224}
      x2={677}
      y2={121}
      color={activeStepIndex >= 2 ? '#64748b' : '#38bdf8'}
      isTransmitting={activeStepIndex === 0 || activeStepIndex === 1}
    />

    {/* R2 <-> R5 (Upper 10 Mbps Serial Link — Cost 1000) */}
    <SvgCable
      x1={803}
      y1={121}
      x2={1220}
      y2={224}
      color={activeStepIndex >= 2 ? '#64748b' : '#38bdf8'}
      isTransmitting={activeStepIndex === 1}
    />

    {/* R1 <-> R3 (Lower 10 Gbps Fiber Link — Cost 1) */}
    <SvgCable
      x1={256}
      y1={248}
      x2={460}
      y2={286}
      color={activeStepIndex >= 2 ? '#10b981' : '#38bdf8'}
      isTransmitting={true}
    />

    {/* R3 <-> R4 (Lower 10 Gbps Fiber Link — Cost 1, 304px span) */}
    <SvgCable
      x1={586}
      y1={286}
      x2={890}
      y2={286}
      color={activeStepIndex >= 2 ? '#10b981' : '#38bdf8'}
      isTransmitting={activeStepIndex >= 1}
    />

    {/* R4 <-> R5 (Lower 10 Gbps Fiber Link — Cost 1) */}
    <SvgCable
      x1={1016}
      y1={286}
      x2={1220}
      y2={248}
      color={activeStepIndex >= 2 ? '#10b981' : '#38bdf8'}
      isTransmitting={activeStepIndex >= 1}
    />

    {/* Cost / Speed Labels */}
    <g transform="translate(405, 58)">
      <rect x={0} y={0} width={155} height={22} rx={4} fill="#0f172a" stroke="#475569" strokeWidth={1} />
      <text x={77} y={14} textAnchor="middle" fill="#fbbf24" fontSize="7.5" fontWeight="700" fontFamily="monospace">
        {activeStepIndex >= 2 ? 'UPPER: 10M · COST 1000' : 'UPPER: 10 Mbps SERIAL'}
      </text>
    </g>

    <g transform="translate(668, 240)">
      <rect x={0} y={0} width={145} height={22} rx={4} fill="#0f172a" stroke="#10b981" strokeWidth={1} />
      <text x={72} y={14} textAnchor="middle" fill="#34d399" fontSize="7.5" fontWeight="700" fontFamily="monospace">
        {activeStepIndex >= 2 ? 'LOWER: 10G · COST 1' : 'LOWER: 10 Gbps FIBER'}
      </text>
    </g>

    {/* Routers */}
    <SvgRouter
      x={130}
      y={210}
      name="R1 (1.1.1.1)"
      port1Ip="10.22.12.1/30"
      port2Ip="10.22.13.1/30"
      port1Active={true}
      port2Active={true}
      showPortIps={true}
    />
    <SvgRouter
      x={677}
      y={95}
      name="R2 (2.2.2.2)"
      port1Ip="10.22.12.2/30"
      port2Ip="10.22.25.1/30"
      port1Active={true}
      port2Active={true}
      showPortIps={true}
    />
    <SvgRouter
      x={460}
      y={260}
      name="R3 (3.3.3.3)"
      port1Ip="10.22.13.2/30"
      port2Ip="10.22.34.1/30"
      port1Active={true}
      port2Active={true}
      showPortIps={true}
    />
    <SvgRouter
      x={890}
      y={260}
      name="R4 (4.4.4.4)"
      port1Ip="10.22.34.2/30"
      port2Ip="10.22.45.1/30"
      port1Active={true}
      port2Active={true}
      showPortIps={true}
    />
    <SvgRouter
      x={1220}
      y={210}
      name="R5 (5.5.5.5)"
      port1Ip="10.22.25.2/30"
      port2Ip="10.22.0.1/24"
      port1Active={true}
      port2Active={true}
      showPortIps={true}
    />

    {/* Step 0: Hello / FULL Adjacency */}
    {activeStepIndex === 0 && (
      <g transform="translate(673, 273)">
        <rect x={0} y={0} width={130} height={26} rx={5} fill="#082f49" stroke="#06b6d4" strokeWidth={1.2} />
        <text x={65} y={16} textAnchor="middle" fill="#67e8f9" fontSize="8" fontWeight="700" fontFamily="monospace">
          PROTO 89 · HELLO
        </text>
      </g>
    )}

    {/* Step 1: Type-1 LSA Flooding */}
    {activeStepIndex === 1 && (
      <g transform="translate(673, 273)">
        <rect x={0} y={0} width={130} height={26} rx={5} fill="#082f49" stroke="#38bdf8" strokeWidth={1.2} />
        <text x={65} y={16} textAnchor="middle" fill="#7dd3fc" fontSize="8" fontWeight="700" fontFamily="monospace">
          TYPE-1 LSA SYNC
        </text>
      </g>
    )}

    {/* Step 2 & 3: Cost 3 Winner */}
    {(activeStepIndex === 2 || activeStepIndex === 3) && (
      <g transform="translate(673, 273)">
        <rect x={0} y={0} width={130} height={26} rx={5} fill="#064e3b" stroke="#10b981" strokeWidth={1.2} />
        <text x={65} y={16} textAnchor="middle" fill="#6ee7b7" fontSize="8" fontWeight="700" fontFamily="monospace">
          {activeStepIndex === 2 ? 'TOTAL COST = 3' : 'SPF: COST 3 (AD 110)'}
        </text>
      </g>
    )}

    {/* Bottom HUD Cards (y=395 clears R3/R4 port pills at y=348 by 47px) */}
    {activeStepIndex === 0 && (
      <>
        <g transform="translate(70, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#06b6d4" strokeWidth={1.2} />
          <text x={20} y={28} fill="#22d3ee" fontSize="11" fontWeight="700" fontFamily="monospace">
            OSPFv2 HELLO &amp; ADJACENCY (RFC 2328)
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Transport : IP Protocol 89 → Multicast 224.0.0.5 (AllSPFRouters)
          </text>
          <text x={20} y={80} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Timers    : Hello 10s | Dead 40s | Administrative Distance 110
          </text>
          <text x={20} y={105} fill="#4ade80" fontSize="10.5" fontFamily="monospace">
            • Neighbors : R1 (1.1.1.1) ↔ R2 (2.2.2.2) [FULL], R3 (3.3.3.3) [FULL]
          </text>
        </g>
        <g transform="translate(780, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
          <text x={20} y={28} fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="monospace">
            AREA 0.0.0.0 (BACKBONE AREA)
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Every router in Area 0 shares the exact same topology database.
          </text>
          <text x={20} y={80} fill="#94a3b8" fontSize="10.5" fontFamily="monospace">
            • Area ID, subnet mask, and Hello/Dead timers must match to peer.
          </text>
          <text x={20} y={105} fill="#94a3b8" fontSize="10" fontFamily="monospace">
            • Unlike RIP, routers do NOT swap routing tables—they sync LSAs.
          </text>
        </g>
      </>
    )}

    {activeStepIndex === 1 && (
      <>
        <g transform="translate(70, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
          <text x={20} y={28} fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="monospace">
            TYPE-1 ROUTER LSAs &amp; EVENT-DRIVEN FLOODING
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Each router originates a Type-1 Router LSA for its own links.
          </text>
          <text x={20} y={80} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Flooded immediately on link change + acknowledged via LS Ack.
          </text>
          <text x={20} y={105} fill="#94a3b8" fontSize="10" fontFamily="monospace">
            • 1800s safety refresh replaces RIP&apos;s blind 30s full-table dumps.
          </text>
        </g>
        <g transform="translate(780, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#06b6d4" strokeWidth={1.2} />
          <text x={20} y={28} fill="#22d3ee" fontSize="11" fontWeight="700" fontFamily="monospace">
            SYNCHRONIZED LSDB (IDENTICAL 5-NODE GRAPH)
          </text>
          <text x={20} y={55} fill="#4ade80" fontSize="10.5" fontFamily="monospace">
            LSDB contains: 1.1.1.1, 2.2.2.2, 3.3.3.3, 4.4.4.4, 5.5.5.5
          </text>
          <text x={20} y={80} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • R1 sees the entire Area 0 graph, including R4 and R5 directly.
          </text>
          <text x={20} y={105} fill="#94a3b8" fontSize="10" fontFamily="monospace">
            • Identical LSDBs guarantee every router computes consistent paths.
          </text>
        </g>
      </>
    )}

    {activeStepIndex === 2 && (
      <>
        <g transform="translate(70, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#10b981" strokeWidth={1.2} />
          <text x={20} y={28} fill="#34d399" fontSize="11" fontWeight="700" fontFamily="monospace">
            BANDWIDTH-AWARE COST (REF = 10,000 Mbps)
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Formula : Cost = Reference Bandwidth / Interface Bandwidth
          </text>
          <text x={20} y={80} fill="#4ade80" fontSize="10.5" fontFamily="monospace">
            • 10 Gbps Fiber : 10,000 / 10,000 = Cost 1 per link
          </text>
          <text x={20} y={105} fill="#fbbf24" fontSize="10.5" fontFamily="monospace">
            • 10 Mbps Serial: 10,000 / 10     = Cost 1000 per link
          </text>
        </g>
        <g transform="translate(780, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
          <text x={20} y={28} fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="monospace">
            PATH COST COMPARISON TO 10.22.0.0/24
          </text>
          <text x={20} y={55} fill="#4ade80" fontSize="10.5" fontFamily="monospace">
            [WINNER] Lower (R1→R3→R4→R5) : 1 + 1 + 1 = Cost 3 (10 Gbps)
          </text>
          <text x={20} y={80} fill="#94a3b8" fontSize="10.5" fontFamily="monospace">
            [BACKUP] Upper (R1→R2→R5)    : 1000 + 1000 = Cost 2000 (10 Mbps)
          </text>
          <text x={20} y={110} fill="#e2e8f0" fontSize="10" fontFamily="monospace">
            OSPF fixes RIPv2&apos;s bandwidth blindness cleanly.
          </text>
        </g>
      </>
    )}

    {activeStepIndex === 3 && (
      <>
        <g transform="translate(70, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#10b981" strokeWidth={1.2} />
          <text x={20} y={28} fill="#34d399" fontSize="11" fontWeight="700" fontFamily="monospace">
            DIJKSTRA&apos;S SHORTEST PATH FIRST (SPF)
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Root: R1 (1.1.1.1) builds a cycle-free Shortest-Path Tree (SPT).
          </text>
          <text x={20} y={80} fill="#4ade80" fontSize="10.5" fontFamily="monospace">
            • Active FIB Route: 10.22.0.0/24 via R3 (Cost 3, OSPF AD 110).
          </text>
          <text x={20} y={105} fill="#94a3b8" fontSize="10" fontFamily="monospace">
            • 1.4 ms RTT on 10 Gbps fiber vs 38 ms on RIP&apos;s 10 Mbps path.
          </text>
        </g>
        <g transform="translate(780, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
          <text x={20} y={28} fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="monospace">
            WHY OSPF SCALES BEYOND RIPv2
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • No 15-Hop Ceiling: 32-bit cumulative cost supports large cores.
          </text>
          <text x={20} y={80} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Loop Immunity: Synchronized LSDB prevents count-to-infinity.
          </text>
          <text x={20} y={105} fill="#94a3b8" fontSize="10" fontFamily="monospace">
            • Each router computes its own SPT independently from the map.
          </text>
        </g>
      </>
    )}

    {activeStepIndex === 4 && (
      <>
        <g transform="translate(70, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
          <text x={20} y={28} fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="monospace">
            DAY 22 COMPLETE · OSPFv2 LINK-STATE SUMMARY
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • IP Proto 89 (224.0.0.5) · 10s Hello / 40s Dead · Area 0.0.0.0
          </text>
          <text x={20} y={80} fill="#4ade80" fontSize="10.5" fontFamily="monospace">
            • Type-1 LSAs sync identical LSDB · Cost = Ref BW / Link BW
          </text>
          <text x={20} y={105} fill="#7dd3fc" fontSize="10.5" fontFamily="monospace">
            • Dijkstra SPF selects Cost 3 fiber path with zero loop risk
          </text>
        </g>
        <g transform="translate(780, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#10b981" strokeWidth={1.2} />
          <text x={20} y={28} fill="#34d399" fontSize="11" fontWeight="700" fontFamily="monospace">
            NEXT: DAY 23 · FAILOVER AND CONVERGENCE
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            What happens when a live 10 Gbps fiber link fails in Area 0?
          </text>
          <text x={20} y={85} fill="#94a3b8" fontSize="10.5" fontFamily="monospace">
            Day 23 measures link-down detection, LSA re-flooding, SPF rerun,
          </text>
          <text x={20} y={105} fill="#94a3b8" fontSize="10.5" fontFamily="monospace">
            and real-time convergence onto redundant backup paths.
          </text>
        </g>
      </>
    )}
  </>
);
