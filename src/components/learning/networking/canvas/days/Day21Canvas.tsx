import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgRouter } from '../SvgRouter';
import { SvgCable } from '../SvgCable';

export const Day21Canvas: React.FC<DayCanvasProps> = ({ activeStepIndex }) => (
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
      RIP: COUNTING HOPS · DISTANCE-VECTOR, 15-HOP LIMIT &amp; LOOP PREVENTION
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
      10.21.0.0/24 LAN
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
    {/* R1 <-> R2 (Upper 10 Mbps Serial Link) */}
    <SvgCable
      x1={256}
      y1={224}
      x2={677}
      y2={121}
      color={
        activeStepIndex === 2
          ? '#ef4444'
          : activeStepIndex === 1
          ? '#10b981'
          : '#38bdf8'
      }
      isTransmitting={activeStepIndex <= 2}
    />

    {/* R2 <-> R5 (Upper 10 Mbps Serial Link — DOWN on Steps 2 & 3) */}
    <SvgCable
      x1={803}
      y1={121}
      x2={1220}
      y2={224}
      color={
        activeStepIndex === 2 || activeStepIndex === 3
          ? '#ef4444'
          : activeStepIndex === 1
          ? '#10b981'
          : '#38bdf8'
      }
      isTransmitting={activeStepIndex === 0 || activeStepIndex === 1}
    />

    {/* R1 <-> R3 (Lower 10 Gbps Fiber Link) */}
    <SvgCable
      x1={256}
      y1={248}
      x2={460}
      y2={286}
      color={activeStepIndex === 3 || activeStepIndex === 4 ? '#10b981' : '#38bdf8'}
      isTransmitting={
        activeStepIndex === 0 || activeStepIndex === 3 || activeStepIndex === 4
      }
    />

    {/* R3 <-> R4 (Lower 10 Gbps Fiber Link — 304px horizontal span) */}
    <SvgCable
      x1={586}
      y1={286}
      x2={890}
      y2={286}
      color={activeStepIndex === 3 || activeStepIndex === 4 ? '#10b981' : '#38bdf8'}
      isTransmitting={
        activeStepIndex === 0 || activeStepIndex === 3 || activeStepIndex === 4
      }
    />

    {/* R4 <-> R5 (Lower 10 Gbps Fiber Link) */}
    <SvgCable
      x1={1016}
      y1={286}
      x2={1220}
      y2={248}
      color={activeStepIndex === 3 || activeStepIndex === 4 ? '#10b981' : '#38bdf8'}
      isTransmitting={
        activeStepIndex === 0 || activeStepIndex === 3 || activeStepIndex === 4
      }
    />

    {/* Link Speed Labels */}
    <rect x={410} y={56} width={135} height={20} rx={4} fill="#0f172a" stroke="#475569" strokeWidth={1} />
    <text x={477} y={69} textAnchor="middle" fill="#fbbf24" fontSize="7.5" fontWeight="700" fontFamily="monospace">
      UPPER: 10 Mbps (2 HOPS)
    </text>

    <rect x={673} y={240} width={135} height={20} rx={4} fill="#0f172a" stroke="#475569" strokeWidth={1} />
    <text x={740} y={253} textAnchor="middle" fill="#34d399" fontSize="7.5" fontWeight="700" fontFamily="monospace">
      LOWER: 10 Gbps (3 HOPS)
    </text>

    {/* Routers */}
    <SvgRouter
      x={130}
      y={210}
      name="Router R1"
      port1Ip="10.21.12.1/30"
      port2Ip="10.21.13.1/30"
      port1Active={true}
      port2Active={true}
      showPortIps={true}
    />
    <SvgRouter
      x={677}
      y={95}
      name="Router R2"
      port1Ip="10.21.12.2/30"
      port2Ip="10.21.25.1/30"
      port1Active={true}
      port2Active={activeStepIndex !== 2 && activeStepIndex !== 3}
      showPortIps={true}
    />
    <SvgRouter
      x={460}
      y={260}
      name="Router R3"
      port1Ip="10.21.13.2/30"
      port2Ip="10.21.34.1/30"
      port1Active={true}
      port2Active={true}
      showPortIps={true}
    />
    <SvgRouter
      x={890}
      y={260}
      name="Router R4"
      port1Ip="10.21.34.2/30"
      port2Ip="10.21.45.1/30"
      port1Active={true}
      port2Active={true}
      showPortIps={true}
    />
    <SvgRouter
      x={1220}
      y={210}
      name="Router R5"
      port1Ip="10.21.25.2/30"
      port2Ip="10.21.0.1/24"
      port1Active={activeStepIndex !== 2 && activeStepIndex !== 3}
      port2Active={true}
      showPortIps={true}
    />

    {/* Step 0: UDP 520 Periodic Updates */}
    {activeStepIndex === 0 && (
      <g transform="translate(673, 273)">
        <rect
          x={0}
          y={0}
          width={130}
          height={26}
          rx={5}
          fill="#082f49"
          stroke="#06b6d4"
          strokeWidth={1.2}
        />
        <text
          x={65}
          y={16}
          textAnchor="middle"
          fill="#67e8f9"
          fontSize="8"
          fontWeight="700"
          fontFamily="monospace"
        >
          UDP:520 · 224.0.0.9
        </text>
      </g>
    )}

    {/* Step 1: Bandwidth-Blind 2-Hop Path Wins */}
    {activeStepIndex === 1 && (
      <g transform="translate(673, 273)">
        <rect
          x={0}
          y={0}
          width={130}
          height={26}
          rx={5}
          fill="#0f172a"
          stroke="#64748b"
          strokeWidth={1}
        />
        <text
          x={65}
          y={16}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="7.5"
          fontWeight="700"
          fontFamily="monospace"
        >
          UNUSED (3 HOPS)
        </text>
      </g>
    )}

    {/* Step 2: Count-to-Infinity Staggered Alerts (>= 25px vertical stagger) */}
    {activeStepIndex === 2 && (
      <>
        <g transform="translate(950, 118)">
          <rect
            x={0}
            y={0}
            width={200}
            height={28}
            rx={5}
            fill="#450a0a"
            stroke="#ef4444"
            strokeWidth={1.5}
          />
          <text
            x={100}
            y={18}
            textAnchor="middle"
            fill="#fca5a5"
            fontSize="8"
            fontWeight="700"
            fontFamily="monospace"
          >
            LINK DOWN (NO-CARRIER)
          </text>
        </g>

        <g transform="translate(330, 108)">
          <rect
            x={0}
            y={0}
            width={190}
            height={28}
            rx={5}
            fill="#451a03"
            stroke="#f59e0b"
            strokeWidth={1.2}
          />
          <text
            x={95}
            y={18}
            textAnchor="middle"
            fill="#fcd34d"
            fontSize="7.5"
            fontWeight="700"
            fontFamily="monospace"
          >
            R1 → R2: 10.21.0.0/24 = 2
          </text>
        </g>

        <g transform="translate(435, 158)">
          <rect
            x={0}
            y={0}
            width={205}
            height={28}
            rx={5}
            fill="#450a0a"
            stroke="#ef4444"
            strokeWidth={1.2}
          />
          <text
            x={102}
            y={18}
            textAnchor="middle"
            fill="#fca5a5"
            fontSize="7.5"
            fontWeight="700"
            fontFamily="monospace"
          >
            R2 ↔ R1: 3 → 4 → ... → 16
          </text>
        </g>
      </>
    )}

    {/* Step 3: Split Horizon & Poison Reverse Staggered Alerts (30px stagger) */}
    {activeStepIndex === 3 && (
      <>
        <g transform="translate(950, 118)">
          <rect
            x={0}
            y={0}
            width={200}
            height={28}
            rx={5}
            fill="#450a0a"
            stroke="#ef4444"
            strokeWidth={1.5}
          />
          <text
            x={100}
            y={18}
            textAnchor="middle"
            fill="#fca5a5"
            fontSize="8"
            fontWeight="700"
            fontFamily="monospace"
          >
            LINK DOWN (NO-CARRIER)
          </text>
        </g>

        <g transform="translate(105, 148)">
          <rect
            x={0}
            y={0}
            width={195}
            height={28}
            rx={5}
            fill="#064e3b"
            stroke="#10b981"
            strokeWidth={1.2}
          />
          <text
            x={97}
            y={18}
            textAnchor="middle"
            fill="#6ee7b7"
            fontSize="7.5"
            fontWeight="700"
            fontFamily="monospace"
          >
            SPLIT HORIZON: eth0 blocked
          </text>
        </g>

        <g transform="translate(365, 118)">
          <rect
            x={0}
            y={0}
            width={195}
            height={28}
            rx={5}
            fill="#082f49"
            stroke="#38bdf8"
            strokeWidth={1.2}
          />
          <text
            x={97}
            y={18}
            textAnchor="middle"
            fill="#7dd3fc"
            fontSize="7.5"
            fontWeight="700"
            fontFamily="monospace"
          >
            POISON: 10.21.0.0/24 = 16
          </text>
        </g>

        <g transform="translate(673, 273)">
          <rect
            x={0}
            y={0}
            width={130}
            height={26}
            rx={5}
            fill="#064e3b"
            stroke="#10b981"
            strokeWidth={1.2}
          />
          <text
            x={65}
            y={16}
            textAnchor="middle"
            fill="#6ee7b7"
            fontSize="7.5"
            fontWeight="700"
            fontFamily="monospace"
          >
            FAILOVER: 3 HOPS
          </text>
        </g>
      </>
    )}

    {/* Bottom HUD Cards (y=395 clears R3/R4 port pills at y=348 by 47px) */}
    {activeStepIndex === 0 && (
      <>
        <g transform="translate(70, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#06b6d4" strokeWidth={1.2} />
          <text x={20} y={28} fill="#22d3ee" fontSize="11" fontWeight="700" fontFamily="monospace">
            RIPv2 WIRE FORMAT &amp; TIMERS (RFC 2453)
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Transport : UDP port 520 → Multicast 224.0.0.9 (Classless masks)
          </text>
          <text x={20} y={80} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Bellman-Ford : Receive (prefix, M) → install next-hop with M + 1
          </text>
          <text x={20} y={105} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Timers : Update 30s | Invalid 180s | Hold-down 180s | Flush 240s
          </text>
          <text x={20} y={130} fill="#94a3b8" fontSize="10" fontFamily="monospace">
            • Administrative Distance: 120 (loses to OSPF 110 &amp; Static 1)
          </text>
        </g>
        <g transform="translate(780, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
          <text x={20} y={28} fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="monospace">
            R1 DISTANCE-VECTOR RIB (10.21.0.0/24)
          </text>
          <text x={20} y={55} fill="#4ade80" fontSize="10.5" fontFamily="monospace">
            [ACTIVE] 10.21.0.0/24 via R2 (eth0) · Metric = 2 hops
          </text>
          <text x={20} y={80} fill="#94a3b8" fontSize="10.5" fontFamily="monospace">
            [BACKUP] 10.21.0.0/24 via R3 (eth1) · Metric = 3 hops (suppressed)
          </text>
          <text x={20} y={110} fill="#e2e8f0" fontSize="10" fontFamily="monospace">
            R1 never sees R4 or R5 directly—it only knows neighbor hop counts.
          </text>
        </g>
      </>
    )}

    {activeStepIndex === 1 && (
      <>
        <g transform="translate(70, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#10b981" strokeWidth={1.2} />
          <text x={20} y={28} fill="#34d399" fontSize="11" fontWeight="700" fontFamily="monospace">
            BANDWIDTH BLINDNESS (HOP COUNT ONLY)
          </text>
          <text x={20} y={55} fill="#fbbf24" fontSize="10.5" fontFamily="monospace">
            • Upper (R1 → R2 → R5): 2 hops · 10 Mbps serial [SELECTED]
          </text>
          <text x={20} y={80} fill="#94a3b8" fontSize="10.5" fontFamily="monospace">
            • Lower (R1 → R3 → R4 → R5): 3 hops · 10 Gbps fiber [IGNORED]
          </text>
          <text x={20} y={110} fill="#e2e8f0" fontSize="10" fontFamily="monospace">
            RIP treats a 10 Mbps link and a 10 Gbps link as equal cost (1 hop).
          </text>
        </g>
        <g transform="translate(780, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#f59e0b" strokeWidth={1.2} />
          <text x={20} y={28} fill="#fbbf24" fontSize="11" fontWeight="700" fontFamily="monospace">
            THE 15-HOP CEILING (INFINITY = 16)
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Valid Metrics : 1 through 15 router hops
          </text>
          <text x={20} y={80} fill="#f87171" fontSize="10.5" fontFamily="monospace">
            • Metric 16     : Reserved for INFINITY (Unreachable / Drop)
          </text>
          <text x={20} y={110} fill="#94a3b8" fontSize="10" fontFamily="monospace">
            Any network deeper than 15 hops cannot be reached with RIPv2.
          </text>
        </g>
      </>
    )}

    {activeStepIndex === 2 && (
      <>
        <g transform="translate(70, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#ef4444" strokeWidth={1.2} />
          <text x={20} y={28} fill="#f87171" fontSize="11" fontWeight="700" fontFamily="monospace">
            COUNT-TO-INFINITY TIMELINE (R2–R5 DOWN)
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            1. t=001s : R2 deletes direct 1-hop route to 10.21.0.0/24.
          </text>
          <text x={20} y={80} fill="#fcd34d" fontSize="10.5" fontFamily="monospace">
            2. t=014s : R1 periodic 30s update advertises metric 2 back to R2.
          </text>
          <text x={20} y={105} fill="#fca5a5" fontSize="10.5" fontFamily="monospace">
            3. t=014s+ : R2 installs via R1 (3) → R1 installs (4) → ... → 16.
          </text>
          <text x={20} y={135} fill="#94a3b8" fontSize="10" fontFamily="monospace">
            Small infinity (16) bounds how long this loop persists.
          </text>
        </g>
        <g transform="translate(780, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#f59e0b" strokeWidth={1.2} />
          <text x={20} y={28} fill="#fbbf24" fontSize="11" fontWeight="700" fontFamily="monospace">
            DATA PLANE IMPACT: TTL EXPIRY LOOP
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • R1 forwards 10.21.0.10 packets to R2 (expecting R5).
          </text>
          <text x={20} y={80} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • R2 forwards the same packets back to R1 (expecting R1).
          </text>
          <text x={20} y={110} fill="#f87171" fontSize="10.5" fontFamily="monospace">
            • Packets ping-pong R1 ↔ R2 until IP TTL hits 0 (dropped).
          </text>
        </g>
      </>
    )}

    {activeStepIndex === 3 && (
      <>
        <g transform="translate(70, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#10b981" strokeWidth={1.2} />
          <text x={20} y={28} fill="#34d399" fontSize="11" fontWeight="700" fontFamily="monospace">
            LOOP SAFEGUARDS: SPLIT HORIZON &amp; POISONING
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Split Horizon : R1 never advertises R2-learned routes back to R2.
          </text>
          <text x={20} y={80} fill="#7dd3fc" fontSize="10.5" fontFamily="monospace">
            • Route Poison : R2 sends triggered update "10.21.0.0/24 = 16" now.
          </text>
          <text x={20} y={105} fill="#6ee7b7" fontSize="10.5" fontFamily="monospace">
            • Poison Reverse: R1 echoes metric 16 to R2 to confirm withdrawal.
          </text>
        </g>
        <g transform="translate(780, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
          <text x={20} y={28} fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="monospace">
            HOLD-DOWN TIMER (180s) &amp; CONVERGENCE
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • Hold-Down (180s): Ignores stale updates while route is poisoned.
          </text>
          <text x={20} y={80} fill="#4ade80" fontSize="10.5" fontFamily="monospace">
            • Failover Result : R1 installs 3-hop path R1 → R3 → R4 → R5.
          </text>
          <text x={20} y={110} fill="#94a3b8" fontSize="10" fontFamily="monospace">
            Traffic recovers onto the 10 Gbps fiber path without looping.
          </text>
        </g>
      </>
    )}

    {activeStepIndex === 4 && (
      <>
        <g transform="translate(70, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
          <text x={20} y={28} fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="monospace">
            DAY 21 COMPLETE · RIPv2 DISTANCE-VECTOR SUMMARY
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            • UDP 520 (224.0.0.9) · Bellman-Ford (M + 1) · 30s / 180s / 240s
          </text>
          <text x={20} y={80} fill="#fbbf24" fontSize="10.5" fontFamily="monospace">
            • Hop Count ignores bandwidth · 15-hop ceiling (16 = infinity)
          </text>
          <text x={20} y={105} fill="#6ee7b7" fontSize="10.5" fontFamily="monospace">
            • Split Horizon + Poison Reverse + Hold-Down stop 2-node loops
          </text>
        </g>
        <g transform="translate(780, 395)">
          <rect x={0} y={0} width={630} height={175} rx={8} fill="#070c14" stroke="#10b981" strokeWidth={1.2} />
          <text x={20} y={28} fill="#34d399" fontSize="11" fontWeight="700" fontFamily="monospace">
            NEXT: DAY 22 · OSPF: SHARING THE MAP
          </text>
          <text x={20} y={55} fill="#e2e8f0" fontSize="10.5" fontFamily="monospace">
            Why share neighbor hop counts when every router can share the full map?
          </text>
          <text x={20} y={85} fill="#94a3b8" fontSize="10.5" fontFamily="monospace">
            Day 22 introduces Link-State Advertisements (LSAs), Area 0, and
          </text>
          <text x={20} y={105} fill="#94a3b8" fontSize="10.5" fontFamily="monospace">
            Dijkstra SPF using interface bandwidth cost instead of hop count.
          </text>
        </g>
      </>
    )}
  </>
);
