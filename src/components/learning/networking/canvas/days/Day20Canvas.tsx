import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgWorkstation } from '../SvgWorkstation';
import { SvgRouter } from '../SvgRouter';
import { SvgCable } from '../SvgCable';

export const Day20Canvas: React.FC<DayCanvasProps> = ({ activeStepIndex }) => (
  <>
    {/* Upper Path Title Banner */}
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
      WHY DYNAMIC ROUTING · SCALABILITY, FAILOVER &amp; IGP VS EGP
    </text>

    {/* Autonomous System 64512 Boundary (Enterprise Core · IGP Domain) */}
    <rect
      x={50}
      y={55}
      width={975}
      height={330}
      rx={10}
      fill="rgba(56, 189, 248, 0.03)"
      stroke={activeStepIndex >= 2 ? '#38bdf8' : '#1e293b'}
      strokeWidth={activeStepIndex >= 2 ? 1.5 : 1}
      strokeDasharray="6 4"
    />
    <rect
      x={65}
      y={63}
      width={255}
      height={18}
      rx={4}
      fill="#070c14"
      stroke={activeStepIndex >= 2 ? '#38bdf8' : '#334155'}
      strokeWidth={1}
    />
    <text
      x={192}
      y={75}
      textAnchor="middle"
      fill={activeStepIndex >= 2 ? '#38bdf8' : '#94a3b8'}
      fontSize="7.5"
      fontWeight="700"
      fontFamily="monospace"
    >
      AS 64512 · ENTERPRISE CORE (IGP DOMAIN)
    </text>

    {/* Autonomous System 64513 Boundary (Upstream ISP · External AS) */}
    <rect
      x={1085}
      y={55}
      width={355}
      height={330}
      rx={10}
      fill="rgba(168, 85, 247, 0.03)"
      stroke={activeStepIndex >= 2 ? '#a855f7' : '#1e293b'}
      strokeWidth={activeStepIndex >= 2 ? 1.5 : 1}
      strokeDasharray="6 4"
    />
    <rect
      x={1100}
      y={63}
      width={235}
      height={18}
      rx={4}
      fill="#070c14"
      stroke={activeStepIndex >= 2 ? '#a855f7' : '#334155'}
      strokeWidth={1}
    />
    <text
      x={1217}
      y={75}
      textAnchor="middle"
      fill={activeStepIndex >= 2 ? '#c084fc' : '#94a3b8'}
      fontSize="7.5"
      fontWeight="700"
      fontFamily="monospace"
    >
      AS 64513 · UPSTREAM ISP (EXTERNAL AS)
    </text>

    {/* Physical Links */}
    {/* PC1 -> R1 */}
    <SvgCable
      x1={156}
      y1={246}
      x2={320}
      y2={246}
      color="#38bdf8"
      isTransmitting={activeStepIndex === 0 || activeStepIndex === 1}
    />

    {/* R1 -> R2 (Upper Primary Path) */}
    <SvgCable
      x1={446}
      y1={236}
      x2={600}
      y2={146}
      color={activeStepIndex === 1 ? '#f59e0b' : '#38bdf8'}
      isTransmitting={activeStepIndex === 0 || activeStepIndex === 1}
    />

    {/* R1 -> R3 (Lower Backup Path) */}
    <SvgCable
      x1={446}
      y1={256}
      x2={600}
      y2={306}
      color={activeStepIndex === 1 ? '#4ade80' : '#38bdf8'}
      isTransmitting={activeStepIndex === 0 || activeStepIndex === 3}
    />

    {/* R2 -> R4 (Fails on Step 1!) */}
    <SvgCable
      x1={726}
      y1={146}
      x2={870}
      y2={236}
      color={activeStepIndex === 1 ? '#ef4444' : '#38bdf8'}
      isTransmitting={activeStepIndex === 0}
    />

    {/* R3 -> R4 (Backup Path) */}
    <SvgCable
      x1={726}
      y1={306}
      x2={870}
      y2={256}
      color={activeStepIndex === 1 ? '#4ade80' : '#38bdf8'}
      isTransmitting={activeStepIndex === 0 || activeStepIndex === 3}
    />

    {/* R4 -> ISP1 (eBGP Border Link across AS64512 <-> AS64513) */}
    <SvgCable
      x1={996}
      y1={246}
      x2={1160}
      y2={246}
      color={activeStepIndex >= 2 ? '#a855f7' : '#475569'}
      isTransmitting={activeStepIndex === 2 || activeStepIndex === 3}
    />

    {/* ISP1 -> S1 */}
    <SvgCable
      x1={1286}
      y1={246}
      x2={1345}
      y2={246}
      color={activeStepIndex >= 2 ? '#a855f7' : '#475569'}
      isTransmitting={activeStepIndex === 2 || activeStepIndex === 3}
    />

    {/* Devices */}
    <SvgWorkstation
      x={80}
      y={220}
      name="PC1"
      ip="10.10.0.10/24"
      ipColor="blue"
      showIp={true}
      isPinging={activeStepIndex === 0 || activeStepIndex === 1}
    />
    <SvgRouter
      x={320}
      y={220}
      name="Router R1"
      port1Ip="10.10.0.1"
      port2Ip="10.12.0.1"
      port3Ip="10.13.0.1"
      showPortIps={true}
      staticRouteText={activeStepIndex === 0 ? 'STATIC: O(R × S)' : undefined}
      isPinging={activeStepIndex === 0 || activeStepIndex === 1}
    />
    <SvgRouter
      x={600}
      y={120}
      name="Router R2"
      port1Ip="10.12.0.2"
      port2Ip="10.24.0.1"
      port2Active={activeStepIndex !== 1}
      showPortIps={true}
    />
    <SvgRouter
      x={600}
      y={280}
      name="Router R3"
      port1Ip="10.13.0.2"
      port2Ip="10.34.0.1"
      showPortIps={true}
    />
    <SvgRouter
      x={870}
      y={220}
      name="Router R4 (ASBR)"
      port1Ip="10.24.0.2"
      port2Ip="203.0.113.1"
      showPortIps={true}
      isPinging={activeStepIndex === 2 || activeStepIndex === 3}
    />
    <SvgRouter
      x={1160}
      y={220}
      name="ISP1 (AS 64513)"
      port1Ip="203.0.113.2"
      port2Ip="198.51.100.1"
      showPortIps={true}
      isPinging={activeStepIndex === 2 || activeStepIndex === 3}
    />
    <SvgWorkstation
      x={1345}
      y={220}
      name="Server S1"
      ip="198.51.100.10"
      ipColor="green"
      showIp={true}
      isPinging={activeStepIndex === 3}
    />

    {/* Step 0: Static Route Scaling Badge on PC1->R1 span (width 130 <= 164-30=134) */}
    {activeStepIndex === 0 && (
      <g transform="translate(238, 250)">
        <rect
          x={-65}
          y={12}
          width={130}
          height={22}
          rx={4}
          fill="#0c121e"
          stroke="#38bdf8"
          strokeWidth={1}
        />
        <text
          x={0}
          y={26}
          textAnchor="middle"
          fill="#38bdf8"
          fontSize="7"
          fontWeight="700"
          fontFamily="monospace"
        >
          RIB: 24 STATIC ROUTES
        </text>
      </g>
    )}

    {/* Step 1: Link Failure & Blackhole Alert (staggered >= 25px vertically from R3 backup badge) */}
    {activeStepIndex === 1 && (
      <>
        <g transform="translate(798, 155)">
          <rect
            x={-88}
            y={-12}
            width={176}
            height={24}
            rx={4}
            fill="#1f0b0e"
            stroke="#ef4444"
            strokeWidth={1.2}
          />
          <text
            x={0}
            y={3}
            textAnchor="middle"
            fill="#fca5a5"
            fontSize="7"
            fontWeight="700"
            fontFamily="monospace"
          >
            DOWN / NO-CARRIER · BLACKHOLE
          </text>
        </g>

        <g transform="translate(798, 325)">
          <rect
            x={-84}
            y={-12}
            width={168}
            height={24}
            rx={4}
            fill="#071a12"
            stroke="#4ade80"
            strokeWidth={1.2}
          />
          <text
            x={0}
            y={3}
            textAnchor="middle"
            fill="#86efac"
            fontSize="7"
            fontWeight="700"
            fontFamily="monospace"
          >
            HEALTHY BACKUP (UNUSED STATIC)
          </text>
        </g>
      </>
    )}

    {/* Step 2 & 3: eBGP AS-Boundary Badge on R4->ISP1 span (width 130 <= 164-30=134) */}
    {(activeStepIndex === 2 || activeStepIndex === 3) && (
      <g transform="translate(1078, 250)">
        <rect
          x={-65}
          y={12}
          width={130}
          height={22}
          rx={4}
          fill="#160d24"
          stroke="#a855f7"
          strokeWidth={1}
        />
        <text
          x={0}
          y={26}
          textAnchor="middle"
          fill="#d8b4fe"
          fontSize="7"
          fontWeight="700"
          fontFamily="monospace"
        >
          {activeStepIndex === 2 ? 'AS64512 ↔ AS64513' : 'EGP: BGP-4 (AD 20)'}
        </text>
      </g>
    )}

    {/* Bottom Diagnostic HUD Cards (y=395 clears R3+ports ~368px and PC1/S1 314px) */}
    {activeStepIndex === 0 && (
      <>
        <g transform="translate(70, 395)">
          <rect width={320} height={185} rx={6} fill="#070d19" stroke="#1e293b" strokeWidth={1} />
          <text x={16} y={24} fill="#38bdf8" fontSize="9" fontWeight="700" fontFamily="monospace">
            RIB vs FIB ARCHITECTURE
          </text>
          <text x={16} y={50} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • RIB: Routing Information Base (table)
          </text>
          <text x={16} y={74} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • FIB: Active kernel forwarding table
          </text>
          <text x={16} y={98} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • Static: Typed manually via ip route
          </text>
          <text x={16} y={122} fill="#f59e0b" fontSize="8" fontFamily="monospace">
            • Scaling: O(R × S) manual entries
          </text>
          <text x={16} y={154} fill="#94a3b8" fontSize="7.5" fontFamily="monospace">
            Run: ip route show
          </text>
        </g>
        <g transform="translate(420, 395)">
          <rect width={640} height={185} rx={6} fill="#070d19" stroke="#38bdf8" strokeWidth={1} />
          <text x={18} y={24} fill="#38bdf8" fontSize="9" fontWeight="700" fontFamily="monospace">
            STATIC ROUTE SCALING BOTTLENECK (4 ROUTERS × 6 SUBNETS = 24 ENTRIES)
          </text>
          <text x={18} y={52} fill="#e2e8f0" fontSize="8" fontFamily="monospace">
            Adding 1 new subnet (10.20.0.0/24) behind Router R4 forces manual edits on R1, R2, R3, and R4:
          </text>
          <text x={18} y={80} fill="#94a3b8" fontSize="8" fontFamily="monospace">
            R1: ip route add 10.20.0.0/24 via 10.12.0.2
          </text>
          <text x={18} y={104} fill="#94a3b8" fontSize="8" fontFamily="monospace">
            R2: ip route add 10.20.0.0/24 via 10.24.0.2
          </text>
          <text x={18} y={128} fill="#94a3b8" fontSize="8" fontFamily="monospace">
            R4: ip route add 10.10.0.0/24 via 10.24.0.1 (return route required)
          </text>
          <text x={18} y={158} fill="#4ade80" fontSize="8" fontFamily="monospace">
            Dynamic Routing: Routers advertise prefixes automatically into every RIB.
          </text>
        </g>
        <g transform="translate(1090, 395)">
          <rect width={320} height={185} rx={6} fill="#070d19" stroke="#1e293b" strokeWidth={1} />
          <text x={16} y={24} fill="#a855f7" fontSize="9" fontWeight="700" fontFamily="monospace">
            STAGE 6 GOAL
          </text>
          <text x={16} y={52} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • Day 20: Why Dynamic Routing
          </text>
          <text x={16} y={76} fill="#94a3b8" fontSize="8" fontFamily="monospace">
            • Day 21: RIP (Hop Count)
          </text>
          <text x={16} y={100} fill="#94a3b8" fontSize="8" fontFamily="monospace">
            • Day 22: OSPF (Link-State SPF)
          </text>
          <text x={16} y={124} fill="#94a3b8" fontSize="8" fontFamily="monospace">
            • Day 23: Failover &amp; Convergence
          </text>
        </g>
      </>
    )}

    {activeStepIndex === 1 && (
      <>
        <g transform="translate(70, 395)">
          <rect width={320} height={185} rx={6} fill="#070d19" stroke="#ef4444" strokeWidth={1} />
          <text x={16} y={24} fill="#fca5a5" fontSize="9" fontWeight="700" fontFamily="monospace">
            STATIC BLIND SPOT
          </text>
          <text x={16} y={52} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • R1 eth1 (to R2) stays UP
          </text>
          <text x={16} y={76} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • R2–R4 fiber is DOWN (NO-CARRIER)
          </text>
          <text x={16} y={100} fill="#fca5a5" fontSize="8" fontFamily="monospace">
            • R1 keeps forwarding to R2
          </text>
          <text x={16} y={124} fill="#fca5a5" fontSize="8" fontFamily="monospace">
            • R2 drops packets (Blackhole)
          </text>
          <text x={16} y={154} fill="#94a3b8" fontSize="7.5" fontFamily="monospace">
            Run: traceroute 10.20.0.10
          </text>
        </g>
        <g transform="translate(420, 395)">
          <rect width={640} height={185} rx={6} fill="#070d19" stroke="#4ade80" strokeWidth={1} />
          <text x={18} y={24} fill="#4ade80" fontSize="9" fontWeight="700" fontFamily="monospace">
            DYNAMIC FAILURE DETECTION (HELLO / KEEPALIVE TIMERS)
          </text>
          <text x={18} y={54} fill="#e2e8f0" fontSize="8" fontFamily="monospace">
            1. Neighbors exchange periodic Hello / Keepalive packets over each link.
          </text>
          <text x={18} y={82} fill="#e2e8f0" fontSize="8" fontFamily="monospace">
            2. When R2–R4 enters NO-CARRIER, R2 sends a route withdrawal to R1.
          </text>
          <text x={18} y={110} fill="#4ade80" fontSize="8" fontFamily="monospace">
            3. R1 removes 10.20.0.0/24 via R2 and installs R1 → R3 → R4 automatically.
          </text>
          <text x={18} y={145} fill="#94a3b8" fontSize="8" fontFamily="monospace">
            Result: Zero manual intervention; traffic reconverges in seconds.
          </text>
        </g>
        <g transform="translate(1090, 395)">
          <rect width={320} height={185} rx={6} fill="#070d19" stroke="#1e293b" strokeWidth={1} />
          <text x={16} y={24} fill="#f59e0b" fontSize="9" fontWeight="700" fontFamily="monospace">
            TRACEROUTE TELEMETRY
          </text>
          <text x={16} y={54} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            Hop 1: 10.10.0.1 (R1) 0.4 ms
          </text>
          <text x={16} y={80} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            Hop 2: 10.12.0.2 (R2) 1.1 ms
          </text>
          <text x={16} y={106} fill="#ef4444" fontSize="8" fontFamily="monospace">
            Hop 3: * * * (Blackhole Drop)
          </text>
          <text x={16} y={136} fill="#4ade80" fontSize="8" fontFamily="monospace">
            R3 Backup: Healthy, Idle
          </text>
        </g>
      </>
    )}

    {activeStepIndex === 2 && (
      <>
        <g transform="translate(70, 395)">
          <rect width={320} height={185} rx={6} fill="#070d19" stroke="#38bdf8" strokeWidth={1} />
          <text x={16} y={24} fill="#38bdf8" fontSize="9" fontWeight="700" fontFamily="monospace">
            AS 64512 (ENTERPRISE)
          </text>
          <text x={16} y={52} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • Private ASN: 64512–65534
          </text>
          <text x={16} y={76} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • Single administrative policy
          </text>
          <text x={16} y={100} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • Full internal topology inside
          </text>
          <text x={16} y={124} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • Border Router: R4 (ASBR)
          </text>
          <text x={16} y={154} fill="#94a3b8" fontSize="7.5" fontFamily="monospace">
            Run: as inspect 64512
          </text>
        </g>
        <g transform="translate(420, 395)">
          <rect width={640} height={185} rx={6} fill="#070d19" stroke="#a855f7" strokeWidth={1} />
          <text x={18} y={24} fill="#c084fc" fontSize="9" fontWeight="700" fontFamily="monospace">
            AUTONOMOUS SYSTEM BOUNDARY &amp; INFORMATION HIDING (RFC 1930 / RFC 6793)
          </text>
          <text x={18} y={54} fill="#e2e8f0" fontSize="8" fontFamily="monospace">
            • Internal link states (R1–R2–R3) never leave AS 64512.
          </text>
          <text x={18} y={82} fill="#e2e8f0" fontSize="8" fontFamily="monospace">
            • Only summary prefix reachability crosses the R4 ↔ ISP1 border.
          </text>
          <text x={18} y={110} fill="#e2e8f0" fontSize="8" fontFamily="monospace">
            • Prevents 100,000+ networks from flooding global router CPUs.
          </text>
          <text x={18} y={145} fill="#94a3b8" fontSize="8" fontFamily="monospace">
            Public ASNs: Google (AS15169), Cloudflare (AS13335); Private: 64512–65534.
          </text>
        </g>
        <g transform="translate(1090, 395)">
          <rect width={320} height={185} rx={6} fill="#070d19" stroke="#a855f7" strokeWidth={1} />
          <text x={16} y={24} fill="#c084fc" fontSize="9" fontWeight="700" fontFamily="monospace">
            AS 64513 (UPSTREAM ISP)
          </text>
          <text x={16} y={52} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • Separate organization &amp; policy
          </text>
          <text x={16} y={76} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • Peer Link: 203.0.113.0/30
          </text>
          <text x={16} y={100} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • Serves 198.51.100.0/24
          </text>
        </g>
      </>
    )}

    {activeStepIndex === 3 && (
      <>
        <g transform="translate(70, 395)">
          <rect width={320} height={185} rx={6} fill="#070d19" stroke="#38bdf8" strokeWidth={1} />
          <text x={16} y={24} fill="#38bdf8" fontSize="9" fontWeight="700" fontFamily="monospace">
            IGP (INTRA-AS PROTOCOLS)
          </text>
          <text x={16} y={52} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • Scope: Inside AS 64512
          </text>
          <text x={16} y={76} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • RIP: Hop count (AD 120)
          </text>
          <text x={16} y={100} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • OSPF: Link cost (AD 110)
          </text>
          <text x={16} y={124} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • Goal: Fastest internal path
          </text>
          <text x={16} y={154} fill="#94a3b8" fontSize="7.5" fontFamily="monospace">
            Run: show route-protocols
          </text>
        </g>
        <g transform="translate(420, 395)">
          <rect width={640} height={185} rx={6} fill="#070d19" stroke="#38bdf8" strokeWidth={1} />
          <text x={18} y={24} fill="#38bdf8" fontSize="9" fontWeight="700" fontFamily="monospace">
            ADMINISTRATIVE DISTANCE (AD) — ROUTE SOURCE TRUST RANKING
          </text>
          <text x={18} y={54} fill="#4ade80" fontSize="8" fontFamily="monospace">
            AD 0   · Connected Interface (Most Trusted)
          </text>
          <text x={18} y={78} fill="#38bdf8" fontSize="8" fontFamily="monospace">
            AD 1   · Static Route
          </text>
          <text x={18} y={102} fill="#c084fc" fontSize="8" fontFamily="monospace">
            AD 20  · External BGP (eBGP / RFC 4271)
          </text>
          <text x={18} y={126} fill="#f59e0b" fontSize="8" fontFamily="monospace">
            AD 110 · OSPF (Interior Link-State)
          </text>
          <text x={18} y={150} fill="#94a3b8" fontSize="8" fontFamily="monospace">
            AD 120 · RIP (Interior Distance-Vector)
          </text>
        </g>
        <g transform="translate(1090, 395)">
          <rect width={320} height={185} rx={6} fill="#070d19" stroke="#a855f7" strokeWidth={1} />
          <text x={16} y={24} fill="#c084fc" fontSize="9" fontWeight="700" fontFamily="monospace">
            EGP (INTER-AS PROTOCOL)
          </text>
          <text x={16} y={52} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • Scope: AS 64512 ↔ AS 64513
          </text>
          <text x={16} y={76} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • BGP-4 (RFC 4271)
          </text>
          <text x={16} y={100} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • Policy &amp; AS-Path filtering
          </text>
        </g>
      </>
    )}

    {activeStepIndex === 4 && (
      <>
        <g transform="translate(70, 395)">
          <rect width={320} height={185} rx={6} fill="#070d19" stroke="#4ade80" strokeWidth={1.2} />
          <text x={16} y={24} fill="#4ade80" fontSize="9" fontWeight="700" fontFamily="monospace">
            DAY 20 COMPLETE
          </text>
          <text x={16} y={54} fill="#e2e8f0" fontSize="8" fontFamily="monospace">
            1. Static O(R × S) limits
          </text>
          <text x={16} y={80} fill="#e2e8f0" fontSize="8" fontFamily="monospace">
            2. Hello/Keepalive failover
          </text>
          <text x={16} y={106} fill="#e2e8f0" fontSize="8" fontFamily="monospace">
            3. Autonomous Systems (ASN)
          </text>
          <text x={16} y={132} fill="#e2e8f0" fontSize="8" fontFamily="monospace">
            4. IGP vs EGP &amp; AD ranking
          </text>
        </g>
        <g transform="translate(420, 395)">
          <rect width={640} height={185} rx={6} fill="#070d19" stroke="#38bdf8" strokeWidth={1} />
          <text x={18} y={24} fill="#38bdf8" fontSize="9" fontWeight="700" fontFamily="monospace">
            DYNAMIC ROUTING ARCHITECTURE SUMMARY
          </text>
          <text x={18} y={56} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • Inside AS 64512: IGP (RIP / OSPF) automates RIB &amp; FIB updates
          </text>
          <text x={18} y={84} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • On Link Failure: Hello timers trigger rapid backup convergence
          </text>
          <text x={18} y={112} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • Across AS Border: EGP (BGP-4) exchanges policy-filtered prefixes
          </text>
          <text x={18} y={148} fill="#4ade80" fontSize="8" fontFamily="monospace">
            Next: Day 21 · RIP: Counting Hops (Distance-Vector Routing)
          </text>
        </g>
        <g transform="translate(1090, 395)">
          <rect width={320} height={185} rx={6} fill="#070d19" stroke="#1e293b" strokeWidth={1} />
          <text x={16} y={24} fill="#94a3b8" fontSize="9" fontWeight="700" fontFamily="monospace">
            CORE INVARIANTS
          </text>
          <text x={16} y={54} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • Lower AD = Higher Trust
          </text>
          <text x={16} y={80} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • Connected (0) &lt; Static (1)
          </text>
          <text x={16} y={106} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • eBGP (20) &lt; OSPF (110)
          </text>
          <text x={16} y={132} fill="#cbd5e1" fontSize="8" fontFamily="monospace">
            • OSPF (110) &lt; RIP (120)
          </text>
        </g>
      </>
    )}
  </>
);
