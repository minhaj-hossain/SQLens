import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgWorkstation } from '../SvgWorkstation';
import { SvgRouter } from '../SvgRouter';
import { SvgCable } from '../SvgCable';

export const Day15Canvas: React.FC<DayCanvasProps> = ({ activeStepIndex, isPinging }) => (
              <>
                {/* Upper Path Title Banner */}
                <rect
                  x={500}
                  y={18}
                  width={480}
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
                  TRANSCONTINENTAL &amp; SUBSEA PATH TRACE (SF ↔ DEN ↔ NYC ↔ FRA)
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
                    activeStepIndex === 1 ||
                    activeStepIndex === 2 ||
                    activeStepIndex === 3
                  }
                />
                {/* Link 1 Label: LAN */}
                <g transform="translate(269, 190)">
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
                    15m (LAN / Switched)
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
                    activeStepIndex === 1 ||
                    activeStepIndex === 2 ||
                    activeStepIndex === 3
                  }
                />
                {/* Link 2 Label: SF to Denver Fiber */}
                <g transform="translate(613, 190)">
                  <rect
                    x={-80}
                    y={-10}
                    width={160}
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
                    1,620 km Fiber (SF-Denver)
                  </text>
                </g>

                {/* Cable 3: R2 to R3 */}
                <SvgCable
                  x1={846}
                  y1={250}
                  x2={1040}
                  y2={250}
                  color={activeStepIndex === 2 ? '#f59e0b' : '#38bdf8'}
                  isTransmitting={
                    activeStepIndex === 0 ||
                    activeStepIndex === 1 ||
                    activeStepIndex === 2 ||
                    activeStepIndex === 3
                  }
                />
                {/* Link 3 Label: Denver to NYC DWDM */}
                <g transform="translate(943, 190)">
                  <rect
                    x={-75}
                    y={-10}
                    width={150}
                    height={20}
                    rx={4}
                    fill={activeStepIndex === 2 ? '#451a03' : '#0a0f1d'}
                    stroke={activeStepIndex === 2 ? '#f59e0b' : '#1e293b'}
                    strokeWidth={1}
                  />
                  <text
                    x={0}
                    y={3}
                    textAnchor="middle"
                    fill={activeStepIndex === 2 ? '#fef08a' : '#94a3b8'}
                    fontSize="7.5"
                    fontWeight={activeStepIndex === 2 ? '700' : '500'}
                    fontFamily="monospace"
                  >
                    2,850 km DWDM (Denver-NYC)
                  </text>
                </g>

                {/* Cable 4: R3 to Web Server */}
                <SvgCable
                  x1={1166}
                  y1={250}
                  x2={1320}
                  y2={250}
                  color="#38bdf8"
                  isTransmitting={
                    activeStepIndex === 0 ||
                    activeStepIndex === 1 ||
                    activeStepIndex === 2 ||
                    activeStepIndex === 3
                  }
                />
                {/* Link 4 Label: Subsea Cable */}
                <g transform="translate(1243, 190)">
                  <rect
                    x={-55}
                    y={-10}
                    width={110}
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
                    5,800 km Subsea
                  </text>
                </g>

                {/* Devices */}
                {/* 1. PC1 Workstation (San Francisco) */}
                <SvgWorkstation
                  x={70}
                  y={220}
                  name="PC1 (SF)"
                  ip="192.168.1.10/24"
                  mac="00:1A:2B:3C:4D:10"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                  isPinging={isPinging || activeStepIndex === 0 || activeStepIndex === 2}
                />

                {/* 2. Router R1 (SF Gateway) */}
                <SvgRouter
                  x={380}
                  y={215}
                  name="Router R1 (SF Gateway)"
                  port1Ip="192.168.1.1"
                  port2Ip="10.0.0.1"
                  port1Active={true}
                  port2Active={true}
                  showPortIps={true}
                  isPinging={isPinging || activeStepIndex === 0 || activeStepIndex === 2}
                />

                {/* 3. Router R2 (Denver Regional Hub) */}
                <SvgRouter
                  x={720}
                  y={215}
                  name="Router R2 (Denver Hub)"
                  port1Ip="10.0.0.2"
                  port2Ip="203.0.113.1"
                  port1Active={true}
                  port2Active={true}
                  showPortIps={true}
                  isPinging={isPinging || activeStepIndex === 0 || activeStepIndex === 2}
                />

                {/* 4. Router R3 (NYC Backbone) */}
                <SvgRouter
                  x={1040}
                  y={215}
                  name="Router R3 (NYC Backbone)"
                  port1Ip="203.0.113.2"
                  port2Ip="198.51.100.1"
                  port1Active={true}
                  port2Active={true}
                  showPortIps={true}
                  isPinging={isPinging || activeStepIndex === 0 || activeStepIndex === 2}
                />

                {/* 5. Web Server (Frankfurt Datacenter) */}
                <SvgWorkstation
                  x={1320}
                  y={220}
                  name="Web Server (Frankfurt)"
                  ip={activeStepIndex === 2 ? '198.51.100.50/24' : '198.51.100.10/24'}
                  mac="00:1A:2B:3C:4D:99"
                  ipColor="green"
                  showIp={true}
                  showMac={true}
                  isPinging={isPinging || activeStepIndex === 0 || activeStepIndex === 2}
                />

                {/* ================= STEP-SPECIFIC OVERLAYS ================= */}

                {/* Step 0: The Three Probes per Hop */}
                {activeStepIndex === 0 && (
                  <>
                    {/* Hop Badges above Routers */}
                    <g transform="translate(443, 145)">
                      <rect x={-75} y={-9} width={150} height={18} rx={3} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        Hop 1 · 1.182, 1.145, 1.198ms
                      </text>
                    </g>

                    <g transform="translate(783, 145)">
                      <rect x={-75} y={-9} width={150} height={18} rx={3} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        Hop 2 · 8.412, 8.389, 8.405ms
                      </text>
                    </g>

                    <g transform="translate(1103, 145)">
                      <rect x={-75} y={-9} width={150} height={18} rx={3} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        Hop 3 · 42.115, 42.088ms
                      </text>
                    </g>

                    <g transform="translate(1364, 145)">
                      <rect x={-75} y={-9} width={150} height={18} rx={3} fill="#1e1b4b" stroke="#a78bfa" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#c7d2fe" fontSize="7" fontWeight="700" fontFamily="monospace">
                        Hop 4 · 48.241, 48.196ms
                      </text>
                    </g>

                    {/* Card 1 at (70, 360): 3-Probe Mechanism */}
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
                        3-PROBE MECHANISM &amp; TELEMETRY
                      </text>
                      <g
                        transform="translate(14, 38)"
                        fill="#cbd5e1"
                        fontSize="7.5"
                        fontFamily="monospace"
                      >
                        <text x={0} y={0}>Probes: 3 datagrams sent per TTL</text>
                        <text x={0} y={16}>Purpose: Measures latency stability &amp; jitter</text>
                        <text x={0} y={32} fill="#38bdf8">Linux Default: UDP dport 33434+</text>
                        <text x={0} y={48} fill="#a78bfa">Windows Default: ICMP Echo (Type 8)</text>
                        <text x={0} y={64} fill="#4ade80" fontWeight="600">
                          Target Reply: ICMP Type 3 Code 3
                        </text>
                        <text x={0} y={80} fill="#94a3b8">
                          Sample: 1.182ms  1.145ms  1.198ms
                        </text>
                        <text x={0} y={96} fill="#34d399" fontWeight="600">
                          Jitter Delta: &lt;0.05ms (Stable transit)
                        </text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 360): 3-Probe Telemetry Table */}
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
                        MULTI-HOP 3-PROBE TELEMETRY TABLE (TRACEROUTE 198.51.100.10)
                      </text>
                      <g
                        transform="translate(20, 38)"
                        fill="#cbd5e1"
                        fontSize="7.5"
                        fontFamily="monospace"
                      >
                        <text x={0} y={0} fill="#38bdf8" fontWeight="600">
                          Hop  IP Address      Probe 1    Probe 2    Probe 3    Router Identity / Node
                        </text>
                        <line x1={0} y1={6} x2={580} y2={6} stroke="#334155" strokeWidth={1} />
                        <text x={0} y={20}>1    192.168.1.1     1.182 ms   1.145 ms   1.198 ms   Local Gateway R1 (SF)</text>
                        <text x={0} y={36}>2    10.0.0.2        8.412 ms   8.389 ms   8.405 ms   Denver Regional Hub R2</text>
                        <text x={0} y={52}>3    203.0.113.2     42.115 ms  42.088 ms  42.102 ms  NYC Backbone Hub R3</text>
                        <text x={0} y={68} fill="#4ade80" fontWeight="600">
                          4    198.51.100.10   48.241 ms  48.196 ms  48.212 ms  Frankfurt Datacenter Server
                        </text>
                        <text x={0} y={88} fill="#94a3b8">
                          Interpretation: 3 samples per hop provide statistical proof against buffer bloat and congestion
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1040, 360): Probing Protocol Comparison */}
                    <g transform="translate(1040, 360)">
                      <rect
                        x={0}
                        y={0}
                        width={380}
                        height={165}
                        rx={6}
                        fill="#070c14"
                        stroke="#38bdf8"
                        strokeWidth={1.2}
                      />
                      <text
                        x={190}
                        y={20}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="8.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        PROBING PROTOCOL COMPARISON
                      </text>
                      <g
                        transform="translate(16, 38)"
                        fill="#cbd5e1"
                        fontSize="7.5"
                        fontFamily="monospace"
                      >
                        <text x={0} y={0} fill="#60a5fa" fontWeight="600">Linux / macOS traceroute:</text>
                        <text x={12} y={14}>• Sends UDP datagrams to ports 33434+</text>
                        <text x={12} y={28}>• Final host replies: ICMP Port Unreachable</text>
                        <text x={0} y={46} fill="#a78bfa" fontWeight="600">Windows tracert:</text>
                        <text x={12} y={60}>• Sends ICMP Echo Requests (Type 8)</text>
                        <text x={12} y={74}>• Final host replies: ICMP Echo Reply (Type 0)</text>
                        <text x={0} y={92} fill="#34d399">Both methods rely identically on TTL=0 drops!</text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 1: Physics, Distance, and RTT Jumps */}
                {activeStepIndex === 1 && (
                  <>
                    {/* Fiber Distance Indicators on Links */}
                    <g transform="translate(269, 145)">
                      <rect x={-50} y={-9} width={100} height={18} rx={3} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        15m (0.0001 ms)
                      </text>
                    </g>

                    <g transform="translate(613, 145)">
                      <rect x={-60} y={-9} width={120} height={18} rx={3} fill="#0c1322" stroke="#38bdf8" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="700" fontFamily="monospace">
                        1,620 km (8.1 ms prop)
                      </text>
                    </g>

                    <g transform="translate(943, 145)">
                      <rect x={-65} y={-9} width={130} height={18} rx={3} fill="#451a03" stroke="#f59e0b" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#fef08a" fontSize="7" fontWeight="700" fontFamily="monospace">
                        2,850 km (28.5 ms jump)
                      </text>
                    </g>

                    <g transform="translate(1243, 145)">
                      <rect x={-50} y={-9} width={100} height={18} rx={3} fill="#1e1b4b" stroke="#a78bfa" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#c7d2fe" fontSize="7" fontWeight="700" fontFamily="monospace">
                        5,800 km subsea
                      </text>
                    </g>

                    {/* Card 1 at (70, 360): Optical Fiber Physics */}
                    <g transform="translate(70, 360)">
                      <rect x={0} y={0} width={280} height={165} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        OPTICAL FIBER PROPAGATION LAWS
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0}>Light in Vacuum: 300,000 km/s</text>
                        <text x={0} y={16}>Light in Glass Fiber: ~200,000 km/s</text>
                        <text x={0} y={32} fill="#38bdf8" fontWeight="600">
                          Propagation Delay: ~5 µs per km
                        </text>
                        <text x={0} y={48} fill="#4ade80" fontWeight="600">
                          Golden Rule: 1 ms RTT ≈ 100 km fiber
                        </text>
                        <text x={0} y={64}>SF to Denver: ~8 ms RTT</text>
                        <text x={0} y={80}>Denver to NYC: ~28 ms RTT</text>
                        <text x={0} y={96} fill="#94a3b8">
                          Latency is physics, not software error!
                        </text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 360): Fiber Telemetry Table */}
                    <g transform="translate(380, 360)">
                      <rect x={0} y={0} width={620} height={165} rx={6} fill="#070c14" stroke="#1e293b" strokeWidth={1.2} />
                      <text x={310} y={20} textAnchor="middle" fill="#f1f5f9" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        FIBER DISTANCE &amp; LATENCY CORRELATION (SHOW FIBER LINKS)
                      </text>
                      <g transform="translate(20, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#38bdf8" fontWeight="600">
                          Segment              Fiber Distance  Propagation Delay  Effective RTT
                        </text>
                        <line x1={0} y1={6} x2={580} y2={6} stroke="#334155" strokeWidth={1} />
                        <text x={0} y={20}>PC1 - R1 (LAN)       15 meters       0.0001 ms          1.1 ms (switched)</text>
                        <text x={0} y={36}>R1 - R2 (SF-Denver)  1,620 km        8.10 ms            8.4 ms</text>
                        <text x={0} y={52} fill="#f59e0b" fontWeight="600">
                          R2 - R3 (Denver-NYC) 2,850 km        28.50 ms           42.1 ms  (33.7 ms jump!)
                        </text>
                        <text x={0} y={68} fill="#a78bfa" fontWeight="600">
                          R3 - Server (NYC-FRA)5,800 km subsea 29.00 ms           48.2 ms
                        </text>
                        <text x={0} y={88} fill="#94a3b8">
                          Diagnostic Lesson: Large RTT jumps reflect transcontinental or subsea glass, not packet drops
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1040, 360): Diagnostic Rule of Thumb */}
                    <g transform="translate(1040, 360)">
                      <rect x={0} y={0} width={380} height={165} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={190} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        DIAGNOSTIC RULE OF THUMB
                      </text>
                      <g transform="translate(16, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#60a5fa" fontWeight="600">Analyzing RTT Spikes:</text>
                        <text x={12} y={14}>1. Does the jump match physical distance?</text>
                        <text x={12} y={28}>2. Do subsequent hops maintain the high RTT?</text>
                        <text x={24} y={42} fill="#4ade80">• YES: Normal geographic fiber distance</text>
                        <text x={24} y={56} fill="#f59e0b">• NO: Asymmetric return or router CPU queue</text>
                        <text x={12} y={74}>Speed of light in silica fiber (~200,000 km/s)</text>
                        <text x={12} y={88} fill="#94a3b8">creates an absolute lower bound for latency</text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 2: The * * * Mystery: Control Plane Policing */}
                {activeStepIndex === 2 && (
                  <>
                    {/* Upper CoPP Alert above R3 at y=100 (clearing hop tag at y=145) */}
                    <g transform="translate(1103, 100)">
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
                        ⚠ COPP ICMP SUPPRESSION ACTIVE
                      </text>
                    </g>

                    {/* Hop Badges showing Hop 3 as * * * */}
                    <g transform="translate(443, 145)">
                      <rect x={-55} y={-9} width={110} height={18} rx={3} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        Hop 1 · 1.182 ms
                      </text>
                    </g>

                    <g transform="translate(783, 145)">
                      <rect x={-55} y={-9} width={110} height={18} rx={3} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        Hop 2 · 8.412 ms
                      </text>
                    </g>

                    <g transform="translate(1103, 145)">
                      <rect x={-65} y={-9} width={130} height={18} rx={3} fill="#78350f" stroke="#f59e0b" strokeWidth={1.5} className="animate-pulse" />
                      <text x={0} y={3.5} textAnchor="middle" fill="#fef08a" fontSize="7" fontWeight="700" fontFamily="monospace">
                        Hop 3 · * * * (CoPP)
                      </text>
                    </g>

                    <g transform="translate(1364, 145)">
                      <rect x={-75} y={-9} width={150} height={18} rx={3} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        Hop 4 · 48.241 ms (OK!)
                      </text>
                    </g>

                    {/* Card 1 at (70, 360): Data Plane vs Control Plane */}
                    <g transform="translate(70, 360)">
                      <rect x={0} y={0} width={280} height={165} rx={6} fill="#070c14" stroke="#f59e0b" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#fef08a" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        DATA PLANE VS CONTROL PLANE
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#34d399" fontWeight="600">Data Plane (Hardware ASICs):</text>
                        <text x={12} y={14}>• Forwards customer transit packets</text>
                        <text x={12} y={28}>• Wire speed (Terabits/sec), 0% CPU</text>
                        <text x={0} y={46} fill="#f59e0b" fontWeight="600">Control Plane (General CPU):</text>
                        <text x={12} y={60}>• Computes BGP/OSPF route tables</text>
                        <text x={12} y={74}>• Generates ICMP error messages</text>
                        <text x={12} y={88} fill="#ef4444">• Protected by CoPP rate limiters!</text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 360): Control Plane Policing Analysis */}
                    <g transform="translate(380, 360)">
                      <rect x={0} y={0} width={620} height={165} rx={6} fill="#070c14" stroke="#ef4444" strokeWidth={1.2} />
                      <text x={310} y={20} textAnchor="middle" fill="#fca5a5" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        CONTROL PLANE POLICING (COPP) ANALYSIS (TRACEROUTE 198.51.100.50)
                      </text>
                      <g transform="translate(20, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#f59e0b" fontWeight="600">
                          Observed Telemetry: Hop 3 outputs * * *  →  Hop 4 outputs 48.241 ms (Reached!)
                        </text>
                        <text x={0} y={16}>
                          Common Misconception: &quot;Hop 3 is offline or dropping user data packets&quot;
                        </text>
                        <text x={0} y={32} fill="#4ade80" fontWeight="600">
                          Physical Network Reality:
                        </text>
                        <text x={0} y={48}>
                          • If Hop 3 were down, Hop 4 could NEVER have received or replied to probes!
                        </text>
                        <text x={0} y={64}>
                          • R3&apos;s hardware ASIC forwarded Hop 4&apos;s packets at 100% line rate without delay.
                        </text>
                        <text x={0} y={80} fill="#fca5a5">
                          • R3&apos;s CPU dropped the ICMP generation to protect its control plane from DDoS.
                        </text>
                        <text x={0} y={98} fill="#94a3b8">
                          The Invariant: If subsequent hops respond, intermediate * * * is harmless ICMP suppression
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1040, 360): Why Routers Drop ICMP */}
                    <g transform="translate(1040, 360)">
                      <rect x={0} y={0} width={380} height={165} rx={6} fill="#070c14" stroke="#f59e0b" strokeWidth={1.2} />
                      <text x={190} y={20} textAnchor="middle" fill="#fef08a" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        WHY ROUTERS DROP ICMP
                      </text>
                      <g transform="translate(16, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0}>1. ICMP Generation Requires CPU Interrupt</text>
                        <text x={12} y={14} fill="#94a3b8">Cannot be executed in hardware ASICs</text>
                        <text x={0} y={30}>2. Rate Limiting (Token Bucket)</text>
                        <text x={12} y={44} fill="#94a3b8">Limits ICMP to 100 packets/sec</text>
                        <text x={0} y={60}>3. Edge Firewall Filtering</text>
                        <text x={12} y={74} fill="#94a3b8">Drops traceroute probes entirely</text>
                        <text x={0} y={92} fill="#4ade80" fontWeight="600">
                          Data Plane Forwarding: 100% Operational
                        </text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 3: Asymmetric Routing: The Return Path Paradox */}
                {activeStepIndex === 3 && (
                  <>
                    {/* Asymmetric Reverse Return Path Visualization Arc (Overhead, clearing all chassis and port pills) */}
                    <path
                      d="M 1320 220 C 1120 70, 660 70, 470 220"
                      fill="none"
                      stroke="#a78bfa"
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      className="animate-pulse"
                    />
                    <g transform="translate(1040, 105)">
                      <rect x={-60} y={-8} width={120} height={16} rx={3} fill="#1e1b4b" stroke="#a78bfa" strokeWidth={1} />
                      <text x={0} y={3} textAnchor="middle" fill="#c7d2fe" fontSize="6.8" fontWeight="700" fontFamily="monospace">
                        ← AS64510 (Amsterdam)
                      </text>
                    </g>
                    <g transform="translate(680, 105)">
                      <rect x={-55} y={-8} width={110} height={16} rx={3} fill="#1e1b4b" stroke="#a78bfa" strokeWidth={1} />
                      <text x={0} y={3} textAnchor="middle" fill="#c7d2fe" fontSize="6.8" fontWeight="700" fontFamily="monospace">
                        ← AS64520 (Chicago)
                      </text>
                    </g>

                    {/* Card 1 at (70, 360): The Asymmetric Paradox */}
                    <g transform="translate(70, 360)">
                      <rect x={0} y={0} width={280} height={165} rx={6} fill="#070c14" stroke="#a78bfa" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#c7d2fe" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        THE ASYMMETRIC PARADOX
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0}>Fallacy: &quot;Packets return the same way&quot;</text>
                        <text x={0} y={16}>Reality: Over 100,000 global ASes</text>
                        <text x={0} y={32} fill="#a78bfa" fontWeight="600">
                          BGP Rule: Each AS routes independently
                        </text>
                        <text x={0} y={48}>Outbound != Inbound Transit</text>
                        <text x={0} y={64} fill="#f59e0b">
                          Traceroute shows ONLY outgoing hops!
                        </text>
                        <text x={0} y={80}>Return hops are completely invisible</text>
                        <text x={0} y={96} fill="#34d399">
                          Trace from both sides to see reality
                        </text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 360): BGP Asymmetric Route Inspection */}
                    <g transform="translate(380, 360)">
                      <rect x={0} y={0} width={620} height={165} rx={6} fill="#070c14" stroke="#1e293b" strokeWidth={1.2} />
                      <text x={310} y={20} textAnchor="middle" fill="#f1f5f9" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        BGP ASYMMETRIC ROUTE INSPECTION (SHOW RETURN PATH)
                      </text>
                      <g transform="translate(20, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#38bdf8" fontWeight="600">
                          OUTBOUND FORWARD PATH (Traceroute View):
                        </text>
                        <text x={12} y={16}>
                          PC1 (SF) → R1 (AS64501) → R2 (AS64502 Denver) → R3 (AS64503 NYC) → Server (Frankfurt)
                        </text>
                        <text x={0} y={34} fill="#a78bfa" fontWeight="600">
                          INBOUND RETURN PATH (Reverse Path Traversed by Replies):
                        </text>
                        <text x={12} y={50}>
                          Server (Frankfurt) → AS64510 (Amsterdam) → AS64520 (Chicago) → R1 (AS64501) → PC1
                        </text>
                        <text x={0} y={70} fill="#f59e0b">
                          Why this matters: Jitter or high RTT on Hop 2 may be caused by congestion in Chicago!
                        </text>
                        <text x={0} y={88} fill="#94a3b8">
                          Architectural Invariant: Internet routing is hop-by-hop and asymmetric by design
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1040, 360): How to Map the Full Path */}
                    <g transform="translate(1040, 360)">
                      <rect x={0} y={0} width={380} height={165} rx={6} fill="#070c14" stroke="#a78bfa" strokeWidth={1.2} />
                      <text x={190} y={20} textAnchor="middle" fill="#c7d2fe" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        HOW TO MAP THE FULL PATH
                      </text>
                      <g transform="translate(16, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#60a5fa" fontWeight="600">Two-Way Path Diagnosis:</text>
                        <text x={12} y={14}>1. Trace client → server (Forward path)</text>
                        <text x={12} y={28}>2. Trace server → client (Reverse path)</text>
                        <text x={12} y={42}>3. Use BGP Looking Glasses to inspect ASes</text>
                        <text x={0} y={60} fill="#f59e0b" fontWeight="600">Firewall Danger:</text>
                        <text x={12} y={74}>Stateful firewalls drop asymmetric flows</text>
                        <text x={12} y={88} fill="#94a3b8">unless configured for asymmetric bypass</text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 4: Recap: The 4 Core Rules of Traceroute */}
                {activeStepIndex === 4 && (
                  <>
                    {/* Card 1 at (70, 350): Traceroute Metrics Cheat Sheet */}
                    <g transform="translate(70, 350)">
                      <rect x={0} y={0} width={280} height={175} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        TRACEROUTE METRICS CHEAT SHEET
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#34d399" fontWeight="600">3 Probes per Hop</text>
                        <text x={12} y={13} fill="#94a3b8">Filters out queue jitter and transient loss</text>
                        <text x={0} y={27} fill="#60a5fa" fontWeight="600">Fiber Physics (~5 µs/km)</text>
                        <text x={12} y={40} fill="#94a3b8">1 ms RTT ≈ 100 km physical fiber</text>
                        <text x={0} y={54} fill="#f59e0b" fontWeight="600">Intermediate * * *</text>
                        <text x={12} y={67} fill="#94a3b8">CoPP rate limiting, not packet drop</text>
                        <text x={0} y={81} fill="#a78bfa" fontWeight="600">Asymmetric Reality</text>
                        <text x={12} y={94} fill="#94a3b8">Return path is completely independent</text>
                        <text x={0} y={110} fill="#38bdf8" fontWeight="600">Layer 3 Path Discovery Mastered</text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 350): The 4 Core Rules of Traceroute */}
                    <g transform="translate(380, 350)">
                      <rect x={0} y={0} width={720} height={175} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.3} />
                      <text x={360} y={22} textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="700" fontFamily="monospace">
                        THE 4 CORE RULES OF TRACEROUTE &amp; INTERNET PATHS
                      </text>
                      <g transform="translate(20, 42)" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                        <text x={0} y={0}>
                          1. THREE PROBES PER HOP: Measures latency stability, jitter, and intermittent packet loss
                        </text>
                        <text x={0} y={16}>
                          2. FIBER PROPAGATION PHYSICS: Speed of light in silica fiber (~200,000 km/s) dictates RTT distance jumps
                        </text>
                        <text x={0} y={32}>
                          3. THE * * * TRUTH: Intermediate timeouts reflect Control Plane Policing (CoPP), not packet loss
                        </text>
                        <text x={0} y={48} fill="#4ade80" fontWeight="600">
                          4. ASYMMETRIC REALITY: Outbound and inbound paths are independent; traceroute only maps outbound hops
                        </text>
                        <line x1={0} y1={60} x2={680} y2={60} stroke="#1e293b" strokeWidth={1} />
                        <text x={0} y={78} fill="#a78bfa" fontWeight="600">
                          Stage 5 Path Mastery Unlocked: You understand how global internet paths function at Layer 3.
                        </text>
                        <text x={0} y={96} fill="#6ee7b7" fontWeight="600">
                          Next: Day 16 · Ports &amp; Sockets: Layer 4 Transport Multiplexing →
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1130, 350): Global Path Telemetry */}
                    <g transform="translate(1130, 350)">
                      <rect x={0} y={0} width={280} height={175} rx={6} fill="#070c14" stroke="#1e293b" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#f1f5f9" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        GLOBAL PATH TELEMETRY
                      </text>
                      <g transform="translate(16, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0}>Origin: San Francisco (AS64501)</text>
                        <text x={0} y={16}>Target: Frankfurt (AS64599)</text>
                        <text x={0} y={32}>Transcon DWDM: 2,850 km</text>
                        <text x={0} y={48}>Transoceanic Subsea: 5,800 km</text>
                        <text x={0} y={64} fill="#4ade80" fontWeight="600">
                          Verified Outbound RTT: 48.2 ms
                        </text>
                        <text x={0} y={80} fill="#38bdf8">
                          Return Transit: Independent BGP
                        </text>
                        <text x={0} y={96} fill="#6ee7b7" fontWeight="600">
                          Status: 100% Production Ready
                        </text>
                      </g>
                    </g>
                  </>
                )}
              </>
);
