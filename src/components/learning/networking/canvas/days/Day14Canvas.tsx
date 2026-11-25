import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgWorkstation } from '../SvgWorkstation';
import { SvgRouter } from '../SvgRouter';
import { SvgCable } from '../SvgCable';

export const Day14Canvas: React.FC<DayCanvasProps> = ({ activeStepIndex, isPinging }) => (
              <>
                {/* Upper Path Title Banner */}
                <rect
                  x={540}
                  y={18}
                  width={400}
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
                  4-HOP MULTI-ROUTER TRANSIT PATH (RFC 792 ICMP &amp; RFC 791 TTL)
                </text>

                {/* Cable 1: PC1 to R1 */}
                <SvgCable
                  x1={158}
                  y1={250}
                  x2={380}
                  y2={250}
                  color="#38bdf8"
                  isTransmitting={
                    activeStepIndex === 0 ||
                    activeStepIndex === 2 ||
                    activeStepIndex === 3 ||
                    activeStepIndex === 4
                  }
                />
                {/* Link 1 Label: LAN */}
                <g transform="translate(269, 190)">
                  <rect
                    x={-60}
                    y={-10}
                    width={120}
                    height={20}
                    rx={4}
                    fill="#0a0f1d"
                    stroke="#1e293b"
                    strokeWidth={1}
                  />
                  <text
                    x={0}
                    y={3}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="7.5"
                    fontFamily="monospace"
                  >
                    192.168.1.0/24 (LAN)
                  </text>
                </g>

                {/* Cable 2: R1 to R2 */}
                <SvgCable
                  x1={506}
                  y1={250}
                  x2={720}
                  y2={250}
                  color="#38bdf8"
                  isTransmitting={
                    activeStepIndex === 0 ||
                    activeStepIndex === 3 ||
                    activeStepIndex === 4
                  }
                />
                {/* Link 2 Label: Transit 1 */}
                <g transform="translate(613, 190)">
                  <rect
                    x={-70}
                    y={-10}
                    width={140}
                    height={20}
                    rx={4}
                    fill="#0a0f1d"
                    stroke="#1e293b"
                    strokeWidth={1}
                  />
                  <text
                    x={0}
                    y={3}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="7.5"
                    fontFamily="monospace"
                  >
                    10.0.0.0/30 (MTU: 1500)
                  </text>
                </g>

                {/* Cable 3: R2 to ISP */}
                <SvgCable
                  x1={846}
                  y1={250}
                  x2={1040}
                  y2={250}
                  color={activeStepIndex === 4 ? '#ef4444' : '#38bdf8'}
                  isTransmitting={
                    activeStepIndex === 0 ||
                    activeStepIndex === 3 ||
                    activeStepIndex === 4
                  }
                />
                {/* Link 3 Label: WAN Transit (Bottleneck on Step 4) */}
                <g transform="translate(943, 190)">
                  <rect
                    x={-90}
                    y={-10}
                    width={180}
                    height={20}
                    rx={4}
                    fill={activeStepIndex === 4 ? '#450a0a' : '#0a0f1d'}
                    stroke={activeStepIndex === 4 ? '#ef4444' : '#1e293b'}
                    strokeWidth={1}
                    className={activeStepIndex === 4 ? 'animate-pulse' : ''}
                  />
                  <text
                    x={0}
                    y={3}
                    textAnchor="middle"
                    fill={activeStepIndex === 4 ? '#fca5a5' : '#94a3b8'}
                    fontSize="7.5"
                    fontWeight={activeStepIndex === 4 ? '700' : '500'}
                    fontFamily="monospace"
                  >
                    {activeStepIndex === 4
                      ? '203.0.113.0/30 (MTU: 1400 BOTTLENECK)'
                      : '203.0.113.0/30 (MTU: 1400 WAN)'}
                  </text>
                </g>

                {/* Cable 4: ISP to Web Server */}
                <SvgCable
                  x1={1166}
                  y1={250}
                  x2={1320}
                  y2={250}
                  color="#38bdf8"
                  isTransmitting={
                    activeStepIndex === 0 || activeStepIndex === 3
                  }
                />
                {/* Link 4 Label: Server WAN */}
                <g transform="translate(1243, 190)">
                  <rect
                    x={-60}
                    y={-10}
                    width={120}
                    height={20}
                    rx={4}
                    fill="#0a0f1d"
                    stroke="#1e293b"
                    strokeWidth={1}
                  />
                  <text
                    x={0}
                    y={3}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="7.5"
                    fontFamily="monospace"
                  >
                    198.51.100.0/24 (WAN)
                  </text>
                </g>

                {/* Devices */}
                {/* 1. PC1 Workstation */}
                <SvgWorkstation
                  x={70}
                  y={220}
                  name="PC1"
                  ip="192.168.1.10/24"
                  mac="00:1A:2B:3C:4D:10"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                  isPinging={isPinging || activeStepIndex === 0}
                />

                {/* 2. Router R1 (Gateway) */}
                <SvgRouter
                  x={380}
                  y={215}
                  name="Router R1 (Gateway)"
                  port1Ip="192.168.1.1"
                  port2Ip="10.0.0.1"
                  port1Active={true}
                  port2Active={true}
                  showPortIps={true}
                  isPinging={isPinging || activeStepIndex === 0}
                />

                {/* 3. Router R2 (Transit) */}
                <SvgRouter
                  x={720}
                  y={215}
                  name="Router R2 (Transit)"
                  port1Ip="10.0.0.2"
                  port2Ip="203.0.113.1"
                  port1Active={true}
                  port2Active={true}
                  showPortIps={true}
                  isPinging={isPinging || activeStepIndex === 0}
                />

                {/* 4. Router ISP (Upstream) */}
                <SvgRouter
                  x={1040}
                  y={215}
                  name="Router ISP (Upstream)"
                  port1Ip="203.0.113.2"
                  port2Ip="198.51.100.1"
                  port1Active={true}
                  port2Active={true}
                  showPortIps={true}
                  isPinging={isPinging || activeStepIndex === 0}
                />

                {/* 5. Web Server */}
                <SvgWorkstation
                  x={1320}
                  y={220}
                  name="Web Server"
                  ip="198.51.100.10/24"
                  mac="00:1A:2B:3C:4D:99"
                  ipColor="green"
                  showIp={true}
                  showMac={true}
                  isPinging={isPinging || activeStepIndex === 0}
                />

                {/* ================= STEP-SPECIFIC OVERLAYS ================= */}

                {/* Step 0: ICMP Echo Request / Reply Flow */}
                {activeStepIndex === 0 && (
                  <>
                    {/* Echo Request Badge on Forward Path */}
                    <g transform="translate(613, 222)">
                      <rect
                        x={-90}
                        y={-9}
                        width={180}
                        height={18}
                        rx={3}
                        fill="#064e3b"
                        stroke="#34d399"
                        strokeWidth={1}
                        className="animate-pulse"
                      />
                      <text
                        x={0}
                        y={3.5}
                        textAnchor="middle"
                        fill="#6ee7b7"
                        fontSize="7"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        ICMP Type 8 (Echo Request) →
                      </text>
                    </g>

                    {/* Echo Reply Badge on Return Path */}
                    <g transform="translate(943, 278)">
                      <rect
                        x={-77}
                        y={-9}
                        width={154}
                        height={18}
                        rx={3}
                        fill="#1e1b4b"
                        stroke="#818cf8"
                        strokeWidth={1}
                      />
                      <text
                        x={0}
                        y={3.5}
                        textAnchor="middle"
                        fill="#c7d2fe"
                        fontSize="7"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        ← ICMP Type 0 (Echo Reply)
                      </text>
                    </g>

                    {/* Card 1 at (70, 360): ICMP Protocol 1 Anatomy */}
                    <g transform="translate(70, 360)">
                      <rect
                        x={0}
                        y={0}
                        width={280}
                        height={165}
                        rx={6}
                        fill="#070c14"
                        stroke="#38bdf8"
                        strokeWidth={1.2}
                      />
                      <text
                        x={140}
                        y={20}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="8.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        ICMP PROTOCOL 1 (RFC 792) · ECHO
                      </text>
                      <g
                        transform="translate(14, 38)"
                        fill="#cbd5e1"
                        fontSize="7.5"
                        fontFamily="monospace"
                      >
                        <text x={0} y={0}>
                          Layer 3: IP Protocol 1 (Direct L3 packet)
                        </text>
                        <text x={0} y={16}>
                          Echo Request: Type 8 Code 0 (Client query)
                        </text>
                        <text x={0} y={32}>
                          Echo Reply: Type 0 Code 0 (Server answer)
                        </text>
                        <text x={0} y={48}>
                          Payload: 64 bytes · seq=1 · ttl=53
                        </text>
                        <text x={0} y={64} fill="#4ade80" fontWeight="600">
                          RTT: 18.4 ms round-trip time (3 hops)
                        </text>
                        <text x={0} y={80} fill="#94a3b8">
                          Kernel level: Zero TCP/UDP ports opened
                        </text>
                        <text x={0} y={96} fill="#38bdf8" fontWeight="600">
                          Ping Status: Verified end-to-end
                        </text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 360): Multi-Hop Path Breakdown */}
                    <g transform="translate(380, 360)">
                      <rect
                        x={0}
                        y={0}
                        width={620}
                        height={165}
                        rx={6}
                        fill="#070c14"
                        stroke="#1e293b"
                        strokeWidth={1.2}
                      />
                      <text
                        x={310}
                        y={20}
                        textAnchor="middle"
                        fill="#f1f5f9"
                        fontSize="8.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        ROUND-TRIP DIAGNOSTIC PACKET FLOW
                      </text>
                      <g
                        transform="translate(20, 38)"
                        fill="#94a3b8"
                        fontSize="7.5"
                        fontFamily="monospace"
                      >
                        <text x={0} y={0} fill="#38bdf8" fontWeight="600">
                          1. OUTBOUND: PC1 (192.168.1.10) wraps ICMP Type 8 inside IPv4 packet
                        </text>
                        <text x={0} y={16}>
                          2. FORWARDING: R1 forwards across 10.0.0.0/30 → R2 forwards across WAN 203.0.113.0/30
                        </text>
                        <text x={0} y={32}>
                          3. DELIVERY: ISP Router routes to destination Web Server (198.51.100.10)
                        </text>
                        <text x={0} y={48} fill="#a78bfa" fontWeight="600">
                          4. RECEPTION: Server OS kernel swaps IPs and transmits ICMP Type 0 Echo Reply
                        </text>
                        <text x={0} y={64} fill="#4ade80" fontWeight="600">
                          5. RETURN: Reply traverses ISP → R2 → R1 → PC1 arrives in 18.4 ms
                        </text>
                        <text x={0} y={82} fill="#cbd5e1">
                          Terminal: 64 bytes from 198.51.100.10: icmp_seq=1 ttl=53 time=18.4 ms
                        </text>
                        <text x={0} y={98} fill="#64748b">
                          Key Takeaway: Ping is pure Layer 3 ICMP; it tests routing without application servers
                        </text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 1: The Loop Killer: IPv4 Time-To-Live (TTL) */}
                {activeStepIndex === 1 && (
                  <>
                    {/* TTL Decrement Badges along Links */}
                    <g transform="translate(269, 145)">
                      <rect x={-45} y={-9} width={90} height={18} rx={3} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        TTL = 64 (PC1)
                      </text>
                    </g>

                    <g transform="translate(613, 145)">
                      <rect x={-55} y={-9} width={110} height={18} rx={3} fill="#0c1322" stroke="#38bdf8" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="700" fontFamily="monospace">
                        TTL: 64 → 63 (-1 hop)
                      </text>
                    </g>

                    <g transform="translate(943, 145)">
                      <rect x={-55} y={-9} width={110} height={18} rx={3} fill="#0c1322" stroke="#38bdf8" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="700" fontFamily="monospace">
                        TTL: 63 → 62 (-1 hop)
                      </text>
                    </g>

                    <g transform="translate(1243, 145)">
                      <rect x={-55} y={-9} width={110} height={18} rx={3} fill="#1e1b4b" stroke="#a78bfa" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#c7d2fe" fontSize="7" fontWeight="700" fontFamily="monospace">
                        Server gets TTL=61
                      </text>
                    </g>

                    {/* Card 1 at (70, 360): TTL Specification */}
                    <g transform="translate(70, 360)">
                      <rect x={0} y={0} width={280} height={165} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        IPv4 TTL SPECIFICATION (RFC 791)
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0}>Header Field: 8-bit Integer (0 to 255)</text>
                        <text x={0} y={16}>Standard Defaults by OS:</text>
                        <text x={12} y={30} fill="#38bdf8">• Linux / Android: 64 hops</text>
                        <text x={12} y={44} fill="#a78bfa">• Windows: 128 hops</text>
                        <text x={12} y={58} fill="#f59e0b">• Cisco IOS / Juniper: 255 hops</text>
                        <text x={0} y={76} fill="#4ade80" fontWeight="600">
                          Router Invariant: Decrement by 1
                        </text>
                        <text x={0} y={92} fill="#ef4444" fontWeight="600">
                          Drop Rule: If TTL drops to 0, DROP!
                        </text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 360): IPv4 Packet Header Breakdown */}
                    <g transform="translate(380, 360)">
                      <rect x={0} y={0} width={620} height={165} rx={6} fill="#070c14" stroke="#1e293b" strokeWidth={1.2} />
                      <text x={310} y={20} textAnchor="middle" fill="#f1f5f9" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        IPv4 HEADER INSPECTOR (SHOW PACKET HEADER)
                      </text>
                      <g transform="translate(20, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0}>
                          Version: 4   |  IHL: 5 (20 bytes)  |  TOS: 0x00  |  Total Length: 84 bytes
                        </text>
                        <text x={0} y={16}>
                          Identification: 0x4a12  |  Flags: [DF] Don&apos;t Fragment  |  Fragment Offset: 0
                        </text>
                        <text x={0} y={32} fill="#38bdf8" fontWeight="600">
                          Time to Live (TTL): 64  (Decremented by 1 at every Layer 3 forwarding hop)
                        </text>
                        <text x={0} y={48} fill="#4ade80" fontWeight="600">
                          Protocol: 1 (ICMP)      |  Header Checksum: 0x7c9a (Recomputed at every hop!)
                        </text>
                        <text x={0} y={64}>
                          Source IP: 192.168.1.10   →   Destination IP: 198.51.100.10
                        </text>
                        <text x={0} y={82} fill="#f59e0b">
                          Router Rule: Because TTL changes at every router, the header checksum changes too
                        </text>
                        <text x={0} y={98} fill="#94a3b8">
                          Why TTL matters: In a routing loop, packets drop after 64 hops instead of looping forever
                        </text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 2: TTL=0 and ICMP Type 11 Time Exceeded */}
                {activeStepIndex === 2 && (
                  <>
                    {/* Packet Drop Indicator at Router R1 */}
                    <g transform="translate(443, 140)">
                      <rect
                        x={-100}
                        y={-12}
                        width={200}
                        height={24}
                        rx={4}
                        fill="#450a0a"
                        stroke="#ef4444"
                        strokeWidth={1.5}
                        className="animate-pulse"
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill="#fca5a5"
                        fontSize="7.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        ✕ DROPPED AT R1: TTL EXPIRED (0)
                      </text>
                    </g>

                    {/* Returning ICMP Type 11 Error Message on PC1-R1 Link */}
                    <g transform="translate(269, 275)">
                      <rect
                        x={-90}
                        y={-9}
                        width={180}
                        height={18}
                        rx={3}
                        fill="#78350f"
                        stroke="#f59e0b"
                        strokeWidth={1.2}
                        className="animate-pulse"
                      />
                      <text
                        x={0}
                        y={3.5}
                        textAnchor="middle"
                        fill="#fef08a"
                        fontSize="6.6"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        ← ICMP Type 11 (Time Exceeded) from 192.168.1.1
                      </text>
                    </g>

                    {/* Card 1 at (70, 360): Router Drop Mechanism */}
                    <g transform="translate(70, 360)">
                      <rect x={0} y={0} width={280} height={165} rx={6} fill="#070c14" stroke="#ef4444" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#f87171" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        ROUTER TTL EXPIRATION BEHAVIOR
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0}>Command: ping 198.51.100.10 -t 1</text>
                        <text x={0} y={16}>Packet Initial TTL: 1</text>
                        <text x={0} y={32} fill="#ef4444" fontWeight="600">
                          R1 Decrement: 1 - 1 = 0
                        </text>
                        <text x={0} y={48}>Discard: Dropped into bit bucket</text>
                        <text x={0} y={64} fill="#f59e0b" fontWeight="600">
                          Notification: Generates Type 11
                        </text>
                        <text x={0} y={80}>Source IP: 192.168.1.1 (R1 P1)</text>
                        <text x={0} y={96} fill="#94a3b8">
                          Status: Sender notified of death hop
                        </text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 360): ICMP Type 11 Error Anatomy */}
                    <g transform="translate(380, 360)">
                      <rect x={0} y={0} width={620} height={165} rx={6} fill="#070c14" stroke="#f59e0b" strokeWidth={1.2} />
                      <text x={310} y={20} textAnchor="middle" fill="#fef08a" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        ICMP TYPE 11 ERROR DIAGNOSTIC (PING 198.51.100.10 -T 1)
                      </text>
                      <g transform="translate(20, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#f59e0b" fontWeight="600">
                          Diagnostic Message: ICMP Type 11 Code 0 (Time to Live Exceeded in Transit)
                        </text>
                        <text x={0} y={16}>
                          Reporting Router: 192.168.1.1 (Gateway Router R1 incoming interface)
                        </text>
                        <text x={0} y={32}>
                          Payload Attachment: RFC 792 quotes original IP header + first 8 bytes of original packet
                        </text>
                        <text x={0} y={48} fill="#ef4444" fontWeight="600">
                          Terminal Output: From 192.168.1.1 icmp_seq=1 Time to live exceeded
                        </text>
                        <text x={0} y={66} fill="#38bdf8" fontWeight="600">
                          Profound Architectural Discovery:
                        </text>
                        <text x={0} y={82}>
                          The dropped packet forced Router R1 to disclose its IP address and round-trip time.
                        </text>
                        <text x={0} y={98} fill="#94a3b8">
                          By incrementing TTL sequentially (1, 2, 3...), we can force EVERY router on earth to reveal itself!
                        </text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 3: Mapping the Internet: The Traceroute Algorithm */}
                {activeStepIndex === 3 && (
                  <>
                    {/* Hop Discovery Badges above Devices */}
                    <g transform="translate(443, 145)">
                      <rect x={-70} y={-9} width={140} height={18} rx={3} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        Hop 1 · 192.168.1.1 (1.2ms)
                      </text>
                    </g>

                    <g transform="translate(783, 145)">
                      <rect x={-65} y={-9} width={130} height={18} rx={3} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        Hop 2 · 10.0.0.2 (4.8ms)
                      </text>
                    </g>

                    <g transform="translate(1103, 145)">
                      <rect x={-75} y={-9} width={150} height={18} rx={3} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        Hop 3 · 203.0.113.2 (11.5ms)
                      </text>
                    </g>

                    <g transform="translate(1364, 145)">
                      <rect x={-80} y={-9} width={160} height={18} rx={3} fill="#1e1b4b" stroke="#a78bfa" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#c7d2fe" fontSize="7" fontWeight="700" fontFamily="monospace">
                        Hop 4 · 198.51.100.10 (18.2ms)
                      </text>
                    </g>

                    {/* Card 1 at (70, 360): Traceroute Algorithm */}
                    <g transform="translate(70, 360)">
                      <rect x={0} y={0} width={280} height={165} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        THE TRACEROUTE ALGORITHM
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0}>Author: Van Jacobson (1988)</text>
                        <text x={0} y={16}>Probe 1 (TTL=1): Dies at R1 → Type 11</text>
                        <text x={0} y={32}>Probe 2 (TTL=2): Dies at R2 → Type 11</text>
                        <text x={0} y={48}>Probe 3 (TTL=3): Dies at ISP → Type 11</text>
                        <text x={0} y={64} fill="#a78bfa" fontWeight="600">
                          Probe 4 (TTL=4): Reaches Server (Target)
                        </text>
                        <text x={0} y={80} fill="#4ade80" fontWeight="600">
                          Result: Path fully mapped!
                        </text>
                        <text x={0} y={96} fill="#94a3b8">
                          Zero central directory needed
                        </text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 360): Traceroute Hop Table */}
                    <g transform="translate(380, 360)">
                      <rect x={0} y={0} width={620} height={165} rx={6} fill="#070c14" stroke="#1e293b" strokeWidth={1.2} />
                      <text x={310} y={20} textAnchor="middle" fill="#f1f5f9" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        TRACEROUTE HOP DISCOVERY TABLE (TRACEROUTE 198.51.100.10)
                      </text>
                      <g transform="translate(20, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#38bdf8" fontWeight="600">
                          Hop  IP Address      Round-Trip Time  Router Identity      ICMP Response
                        </text>
                        <line x1={0} y1={6} x2={580} y2={6} stroke="#334155" strokeWidth={1} />
                        <text x={0} y={20}>1    192.168.1.1     1.214 ms         Gateway Router R1    ICMP Type 11 (TTL=0)</text>
                        <text x={0} y={36}>2    10.0.0.2        4.842 ms         Transit Router R2    ICMP Type 11 (TTL=0)</text>
                        <text x={0} y={52}>3    203.0.113.2     11.532 ms        Upstream ISP Router  ICMP Type 11 (TTL=0)</text>
                        <text x={0} y={68} fill="#4ade80" fontWeight="600">
                          4    198.51.100.10   18.241 ms        Target Web Server    ICMP Type 0 (Echo Reply)
                        </text>
                        <text x={0} y={88} fill="#94a3b8">
                          Path Discovery Complete: 4 hops mapped across 3 autonomous router boundaries
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1040, 360): Path Latency Telemetry */}
                    <g transform="translate(1040, 360)">
                      <rect x={0} y={0} width={380} height={165} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={190} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        PATH TELEMETRY METRICS
                      </text>
                      <g transform="translate(16, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0}>Total Forwarding Hops: 4 Hops</text>
                        <text x={0} y={16}>First-Hop LAN Latency: 1.2 ms</text>
                        <text x={0} y={32}>Backbone Transit Latency: 6.7 ms</text>
                        <text x={0} y={48}>Upstream ISP Latency: 11.5 ms</text>
                        <text x={0} y={64} fill="#4ade80" fontWeight="600">
                          End-to-End Server RTT: 18.2 ms
                        </text>
                        <text x={0} y={80} fill="#94a3b8">
                          Probe Method: 3 UDP / ICMP probes per hop
                        </text>
                        <text x={0} y={96} fill="#38bdf8">
                          Packet Drop Rate: 0.0% (Clean transit)
                        </text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 4: Path MTU Discovery & ICMP Type 3 Code 4 */}
                {activeStepIndex === 4 && (
                  <>
                    {/* Bottleneck Alert on R2-ISP link - Staggered at y=100 to eliminate overlap with Drop Warning */}
                    <g transform="translate(943, 100)">
                      <rect
                        x={-90}
                        y={-11}
                        width={180}
                        height={22}
                        rx={4}
                        fill="#450a0a"
                        stroke="#ef4444"
                        strokeWidth={1.5}
                        className="animate-pulse"
                      />
                      <text
                        x={0}
                        y={3.5}
                        textAnchor="middle"
                        fill="#fca5a5"
                        fontSize="7"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        ⚠ BOTTLENECK: MTU 1400 WAN LINK
                      </text>
                    </g>

                    {/* Packet Drop Warning at R2 (y=140) */}
                    <g transform="translate(783, 140)">
                      <rect
                        x={-100}
                        y={-11}
                        width={200}
                        height={22}
                        rx={4}
                        fill="#450a0a"
                        stroke="#ef4444"
                        strokeWidth={1.5}
                        className="animate-pulse"
                      />
                      <text
                        x={0}
                        y={3.5}
                        textAnchor="middle"
                        fill="#fca5a5"
                        fontSize="7"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        ✕ DROPPED: 1500B EXCEEDS MTU 1400 (DF=1)
                      </text>
                    </g>

                    {/* Returning ICMP Type 3 Code 4 Error Message on R1-R2 Link (clears R1 at x=506 and R2 at x=720 by 20px) */}
                    <g transform="translate(613, 275)">
                      <rect
                        x={-87}
                        y={-9}
                        width={174}
                        height={18}
                        rx={3}
                        fill="#78350f"
                        stroke="#f59e0b"
                        strokeWidth={1.2}
                        className="animate-pulse"
                      />
                      <text
                        x={0}
                        y={3.5}
                        textAnchor="middle"
                        fill="#fef08a"
                        fontSize="6.6"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        ← ICMP Type 3 Code 4 (Next-Hop MTU: 1400)
                      </text>
                    </g>

                    {/* Card 1 at (70, 360): PMTUD Mechanics */}
                    <g transform="translate(70, 360)">
                      <rect x={0} y={0} width={280} height={165} rx={6} fill="#070c14" stroke="#f59e0b" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#fef08a" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        PATH MTU DISCOVERY (RFC 1191)
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0}>Command: ping ... -s 1472 -d</text>
                        <text x={0} y={16}>Payload: 1472B + 28B IP/ICMP = 1500B</text>
                        <text x={0} y={32} fill="#f59e0b" fontWeight="600">
                          Header Flag: DF=1 (Don&apos;t Fragment)
                        </text>
                        <text x={0} y={48} fill="#ef4444" fontWeight="600">
                          Drop: R2 cannot fit 1500B in 1400B link
                        </text>
                        <text x={0} y={64}>Action: Generates ICMP Type 3 Code 4</text>
                        <text x={0} y={80} fill="#4ade80" fontWeight="600">
                          Payload reports: Next-Hop MTU = 1400
                        </text>
                        <text x={0} y={96} fill="#38bdf8">
                          PC1 shrinks packet to 1400 and resends
                        </text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 360): The PMTUD Black Hole Warning */}
                    <g transform="translate(380, 360)">
                      <rect x={0} y={0} width={620} height={165} rx={6} fill="#070c14" stroke="#ef4444" strokeWidth={1.2} />
                      <text x={310} y={20} textAnchor="middle" fill="#fca5a5" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        THE PMTUD BLACK HOLE DANGER
                      </text>
                      <g transform="translate(20, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#fca5a5" fontWeight="600">
                          Why Misconfigured Firewalls Break the Internet:
                        </text>
                        <text x={0} y={16}>
                          Many security engineers reflexively configure firewalls to &quot;block all ICMP traffic&quot;.
                        </text>
                        <text x={0} y={32} fill="#f59e0b">
                          • Ping (Type 8 / 0) packets are tiny (64 bytes) and pass through without issue.
                        </text>
                        <text x={0} y={48} fill="#ef4444" fontWeight="600">
                          • Web browsing / SSH sends full 1500-byte packets that get dropped at narrow links.
                        </text>
                        <text x={0} y={64}>
                          • If Type 3 Code 4 is blocked, the sender NEVER learns the MTU and retransmits forever!
                        </text>
                        <text x={0} y={82} fill="#4ade80" fontWeight="600">
                          Golden Rule: Edge firewalls MUST permit ICMP Type 3 Code 4 to ensure dynamic MTU learning
                        </text>
                        <text x={0} y={98} fill="#94a3b8">
                          Terminal Output: From 10.0.0.2 icmp_seq=1 Frag needed and DF set (mtu = 1400)
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1040, 360): Link MTU Comparison */}
                    <g transform="translate(1040, 360)">
                      <rect x={0} y={0} width={380} height={165} rx={6} fill="#070c14" stroke="#1e293b" strokeWidth={1.2} />
                      <text x={190} y={20} textAnchor="middle" fill="#f1f5f9" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        PATH MTU SEGMENT ANALYSIS
                      </text>
                      <g transform="translate(16, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0}>PC1 LAN Link (192.168.1.0/24):</text>
                        <text x={12} y={14} fill="#4ade80">MTU: 1500 Bytes (Standard Ethernet)</text>
                        <text x={0} y={28}>R1-R2 Transit Link (10.0.0.0/30):</text>
                        <text x={12} y={42} fill="#4ade80">MTU: 1500 Bytes</text>
                        <text x={0} y={56}>R2-ISP WAN Link (203.0.113.0/30):</text>
                        <text x={12} y={70} fill="#ef4444" fontWeight="600">
                          MTU: 1400 Bytes (Bottleneck Tunnel)
                        </text>
                        <text x={0} y={84} fill="#38bdf8" fontWeight="600">
                          Effective Path MTU: 1400 Bytes
                        </text>
                        <text x={0} y={98} fill="#94a3b8">
                          Dynamic adjustment prevents packet fragmentation
                        </text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 5: Recap: The 4 Core Rules of ICMP & TTL */}
                {activeStepIndex === 5 && (
                  <>
                    {/* Card 1 at (70, 350): ICMP Type Reference Cheat Sheet */}
                    <g transform="translate(70, 350)">
                      <rect x={0} y={0} width={280} height={175} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        ICMP MESSAGE TYPE CHEAT SHEET
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#34d399" fontWeight="600">Type 8 Code 0: Echo Request</text>
                        <text x={12} y={13} fill="#94a3b8">Ping probe sent by client</text>
                        <text x={0} y={27} fill="#818cf8" fontWeight="600">Type 0 Code 0: Echo Reply</text>
                        <text x={12} y={40} fill="#94a3b8">Ping answer returned by server</text>
                        <text x={0} y={54} fill="#f59e0b" fontWeight="600">Type 11 Code 0: Time Exceeded</text>
                        <text x={12} y={67} fill="#94a3b8">TTL reached 0 in transit (Traceroute)</text>
                        <text x={0} y={81} fill="#f87171" fontWeight="600">Type 3 Code 4: Frag Needed</text>
                        <text x={12} y={94} fill="#94a3b8">Packet exceeds link MTU with DF=1 (PMTUD)</text>
                        <text x={0} y={110} fill="#38bdf8" fontWeight="600">Protocol 1: Direct L3 encapsulation</text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 350): The 4 Core Rules of ICMP & TTL */}
                    <g transform="translate(380, 350)">
                      <rect x={0} y={0} width={720} height={175} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.3} />
                      <text x={360} y={22} textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="700" fontFamily="monospace">
                        THE 4 CORE RULES OF ICMP &amp; TTL
                      </text>
                      <g transform="translate(20, 42)" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                        <text x={0} y={0}>
                          1. ICMP IS PROTOCOL 1: Diagnostic companion built directly into IPv4 without TCP or UDP
                        </text>
                        <text x={0} y={16}>
                          2. TTL KILLS LOOPS: 8-bit hop counter; every router decrements by 1; packet dropped at TTL=0
                        </text>
                        <text x={0} y={32}>
                          3. TRACEROUTE HOP DISCOVERY: Sequential TTL=1, 2, 3... forces intermediate routers to reveal their IPs
                        </text>
                        <text x={0} y={48} fill="#4ade80" fontWeight="600">
                          4. PMTUD SIZING: ICMP Type 3 Code 4 communicates bottleneck MTU to prevent black holes
                        </text>
                        <line x1={0} y1={60} x2={680} y2={60} stroke="#1e293b" strokeWidth={1} />
                        <text x={0} y={78} fill="#a78bfa" fontWeight="600">
                          Mastery Unlocked: You understand how IP networks self-diagnose and discover multi-hop paths.
                        </text>
                        <text x={0} y={96} fill="#6ee7b7" fontWeight="600">
                          Next: Day 15 · Traceroute Deep Dive &amp; Path Latency Analysis →
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1130, 350): Protocol Metrics Summary */}
                    <g transform="translate(1130, 350)">
                      <rect x={0} y={0} width={280} height={175} rx={6} fill="#070c14" stroke="#1e293b" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#f1f5f9" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        LAYER 3 PROTOCOL METRICS
                      </text>
                      <g transform="translate(16, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0}>IPv4 Protocol: 1 (ICMP)</text>
                        <text x={0} y={16}>Default Linux TTL: 64 hops</text>
                        <text x={0} y={32}>Default Windows TTL: 128 hops</text>
                        <text x={0} y={48}>Standard Ethernet MTU: 1500B</text>
                        <text x={0} y={64}>Bottleneck WAN MTU: 1400B</text>
                        <text x={0} y={80} fill="#4ade80" fontWeight="600">
                          Total Hops Verified: 4 Hops
                        </text>
                        <text x={0} y={96} fill="#38bdf8">
                          Topology State: 100% Loop-Free
                        </text>
                      </g>
                    </g>
                  </>
                )}
              </>
);
