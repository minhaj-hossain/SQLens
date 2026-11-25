import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgWorkstation } from '../SvgWorkstation';
import { SvgSwitch } from '../SvgSwitch';
import { SvgCable } from '../SvgCable';

export const Day13Canvas: React.FC<DayCanvasProps> = ({ activeStepIndex, isPinging }) => (
              <>
                {/* Background Spanning Tree Triangle Domain Boundary */}
                <polygon
                  points="545,55 210,435 880,435"
                  fill="#0c1322"
                  fillOpacity="0.35"
                  stroke="#334155"
                  strokeWidth={1.2}
                  strokeDasharray="4 4"
                />
                <rect
                  x={395}
                  y={18}
                  width={300}
                  height={22}
                  rx={4}
                  fill="#070c14"
                  stroke="#38bdf8"
                  strokeWidth={1}
                />
                <text
                  x={545}
                  y={32}
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="8"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  SPANNING TREE DOMAIN (IEEE 802.1D TRIANGLE)
                </text>

                {/* Cable: PC1 to SW2 Port 3 */}
                <SvgCable
                  x1={146}
                  y1={375}
                  x2={230}
                  y2={375}
                  color="#38bdf8"
                  isTransmitting={activeStepIndex === 0 || activeStepIndex === 4}
                />

                {/* Cable: SW3 Port 3 to PC2 */}
                <SvgCable
                  x1={852}
                  y1={375}
                  x2={950}
                  y2={375}
                  color="#38bdf8"
                  isTransmitting={activeStepIndex === 4}
                />

                {/* Link 1: SW1:P1 to SW2:P1 (Diagonal Left) */}
                <line
                  x1={510}
                  y1={130}
                  x2={295}
                  y2={350}
                  stroke={activeStepIndex === 0 ? '#ef4444' : '#4ade80'}
                  strokeWidth={activeStepIndex >= 2 ? 3 : 2}
                  strokeDasharray={activeStepIndex === 0 ? '6 4' : 'none'}
                  className={activeStepIndex === 0 ? 'animate-pulse' : ''}
                />

                {/* Link 2: SW1:P2 to SW3:P1 (Diagonal Right) */}
                <line
                  x1={580}
                  y1={130}
                  x2={805}
                  y2={350}
                  stroke={activeStepIndex === 0 ? '#ef4444' : '#4ade80'}
                  strokeWidth={activeStepIndex >= 2 ? 3 : 2}
                  strokeDasharray={activeStepIndex === 0 ? '6 4' : 'none'}
                  className={activeStepIndex === 0 ? 'animate-pulse' : ''}
                />

                {/* Link 3: SW2:P2 to SW3:P2 (Redundant Base Link) */}
                <line
                  x1={342}
                  y1={380}
                  x2={740}
                  y2={380}
                  stroke={
                    activeStepIndex >= 4
                      ? '#f59e0b'
                      : activeStepIndex === 0
                      ? '#ef4444'
                      : '#38bdf8'
                  }
                  strokeWidth={activeStepIndex >= 4 ? 2.5 : 2}
                  strokeDasharray={activeStepIndex >= 4 ? '6 4' : activeStepIndex === 0 ? '4 4' : 'none'}
                  opacity={activeStepIndex >= 4 ? 0.75 : 1}
                  className={activeStepIndex === 0 ? 'animate-pulse' : ''}
                />

                {/* Link 3 Status Badge (Base Link) */}
                <g transform="translate(545, 380)">
                  <rect
                    x={-110}
                    y={-12}
                    width={220}
                    height={24}
                    rx={4}
                    fill="#070c14"
                    stroke={activeStepIndex >= 4 ? '#f59e0b' : activeStepIndex === 0 ? '#ef4444' : '#334155'}
                    strokeWidth={1}
                  />
                  <text
                    x={0}
                    y={4}
                    textAnchor="middle"
                    fill={activeStepIndex >= 4 ? '#fbbf24' : activeStepIndex === 0 ? '#fca5a5' : '#94a3b8'}
                    fontSize="7.5"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {activeStepIndex >= 4
                      ? 'STANDBY LINK (SW3:P2 BLOCKED)'
                      : activeStepIndex === 0
                      ? 'REDUNDANT LINK (ACTIVE LOOP)'
                      : 'REDUNDANT INTER-SWITCH TRUNK'}
                  </text>
                </g>

                {/* PC1 (Left) */}
                <SvgWorkstation
                  x={60}
                  y={345}
                  name="PC1"
                  ip="192.168.1.10"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* PC2 (Right) */}
                <SvgWorkstation
                  x={950}
                  y={345}
                  name="PC2"
                  ip="192.168.1.20"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* Switch SW1 (Top Center · Root Bridge) */}
                <SvgSwitch
                  x={480}
                  y={70}
                  port1Active={true}
                  port2Active={true}
                  isPinging={activeStepIndex === 0 || activeStepIndex === 4}
                />
                {/* SW1 Bridge ID tag */}
                <g transform="translate(536, 145)">
                  <rect x={-80} y={-9} width={160} height={18} rx={3} fill="#0f172a" stroke="#334155" strokeWidth={0.8} />
                  <text x={0} y={3} textAnchor="middle" fill="#cbd5e1" fontSize="7" fontFamily="monospace">
                    BID: 32768.AA:BB:CC:00:00:01
                  </text>
                </g>

                {/* Root Bridge Crown on SW1 (Step 3+) */}
                {activeStepIndex >= 3 && (
                  <g transform="translate(536, 55)">
                    <rect
                      x={-75}
                      y={-10}
                      width={150}
                      height={20}
                      rx={4}
                      fill="#78350f"
                      stroke="#fbbf24"
                      strokeWidth={1.3}
                      className="animate-pulse"
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fill="#fef08a"
                      fontSize="8"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      ★ ROOT BRIDGE ★ (Lowest BID)
                    </text>
                  </g>
                )}

                {/* Switch SW2 (Bottom Left) */}
                <SvgSwitch
                  x={230}
                  y={350}
                  port1Active={true}
                  port2Active={true}
                  port3Active={true}
                  isPinging={activeStepIndex === 0 || activeStepIndex === 4}
                />
                {/* SW2 Bridge ID tag */}
                <g transform="translate(286, 425)">
                  <rect x={-80} y={-9} width={160} height={18} rx={3} fill="#0f172a" stroke="#334155" strokeWidth={0.8} />
                  <text x={0} y={3} textAnchor="middle" fill="#cbd5e1" fontSize="7" fontFamily="monospace">
                    BID: 32768.AA:BB:CC:00:00:02
                  </text>
                </g>

                {/* Switch SW3 (Bottom Right) */}
                <SvgSwitch
                  x={740}
                  y={350}
                  port1Active={true}
                  port2Active={true}
                  port3Active={true}
                  isPinging={activeStepIndex === 0 || activeStepIndex === 4}
                />
                {/* SW3 Bridge ID tag */}
                <g transform="translate(796, 425)">
                  <rect x={-80} y={-9} width={160} height={18} rx={3} fill="#0f172a" stroke="#334155" strokeWidth={0.8} />
                  <text x={0} y={3} textAnchor="middle" fill="#cbd5e1" fontSize="7" fontFamily="monospace">
                    BID: 32768.AA:BB:CC:00:00:03
                  </text>
                </g>

                {/* Port Roles Badges (Step 4+) */}
                {activeStepIndex >= 4 && (
                  <>
                    {/* SW1 Port 1: DP */}
                    <g transform="translate(470, 120)">
                      <rect x={-16} y={-8} width={32} height={16} rx={3} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        DP
                      </text>
                    </g>
                    {/* SW1 Port 2: DP */}
                    <g transform="translate(605, 120)">
                      <rect x={-16} y={-8} width={32} height={16} rx={3} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        DP
                      </text>
                    </g>
                    {/* SW2 Port 1: RP */}
                    <g transform="translate(290, 335)">
                      <rect x={-16} y={-8} width={32} height={16} rx={3} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        RP
                      </text>
                    </g>
                    {/* SW2 Port 2: DP */}
                    <g transform="translate(355, 370)">
                      <rect x={-16} y={-8} width={32} height={16} rx={3} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        DP
                      </text>
                    </g>
                    {/* SW3 Port 1: RP */}
                    <g transform="translate(800, 335)">
                      <rect x={-16} y={-8} width={32} height={16} rx={3} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        RP
                      </text>
                    </g>
                    {/* SW3 Port 2: BLK (Amber Blocked Shield) */}
                    <g transform="translate(730, 370)">
                      <rect
                        x={-28}
                        y={-10}
                        width={56}
                        height={20}
                        rx={4}
                        fill="#78350f"
                        stroke="#f59e0b"
                        strokeWidth={1.5}
                        className="animate-pulse"
                      />
                      <text x={0} y={4} textAnchor="middle" fill="#fef08a" fontSize="7.5" fontWeight="700" fontFamily="monospace">
                        ✕ BLK
                      </text>
                    </g>
                  </>
                )}

                {/* ================= STEP-SPECIFIC OVERLAYS ================= */}

                {/* Step 0: Layer 2 Loop Alert & Circulating Storm */}
                {activeStepIndex === 0 && (
                  <>
                    {/* Central Storm Alert Banner */}
                    <g transform="translate(545, 255)">
                      <rect
                        x={-135}
                        y={-22}
                        width={270}
                        height={44}
                        rx={6}
                        fill="#450a0a"
                        stroke="#ef4444"
                        strokeWidth={1.5}
                        className="animate-pulse"
                      />
                      <text
                        x={0}
                        y={-3}
                        textAnchor="middle"
                        fill="#fca5a5"
                        fontSize="8.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        LAYER 2 LOOP DETECTED ⚠
                      </text>
                      <text
                        x={0}
                        y={12}
                        textAnchor="middle"
                        fill="#fecaca"
                        fontSize="7"
                        fontFamily="monospace"
                      >
                        Ethernet has no TTL · Storm circulating
                      </text>
                    </g>

                    {/* Rotating Storm Arrows in center of triangle */}
                    <g transform="translate(545, 200)" fill="none" stroke="#ef4444" strokeWidth={1.8} opacity={0.8}>
                      <path d="M -30,-15 A 35 35 0 0 1 30,-15" markerEnd="url(#arrow)" />
                      <path d="M 30,15 A 35 35 0 0 1 -30,15" markerEnd="url(#arrow)" />
                    </g>
                  </>
                )}

                {/* Step 1: MAC Flapping Diagnostic Log Card */}
                {activeStepIndex === 1 && (
                  <g transform="translate(545, 240)">
                    <rect
                      x={-135}
                      y={-50}
                      width={270}
                      height={100}
                      rx={8}
                      fill="#070c14"
                      stroke="#ef4444"
                      strokeWidth={1.3}
                    />
                    <rect x={-135} y={-50} width={270} height={22} rx={8} fill="#1c1917" />
                    <text
                      x={0}
                      y={-35}
                      textAnchor="middle"
                      fill="#fca5a5"
                      fontSize="7.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      SWITCH SW1 · MAC TABLE FLAPPING LOG
                    </text>
                    <g transform="translate(-130, -15)" fill="#e2e8f0" fontSize="7" fontFamily="monospace">
                      <text x={0} y={0}>Target: AA:BB:CC:00:00:01 (PC1)</text>
                      <text x={0} y={15} fill="#f87171">
                        Oscillation: Port 1 ⇄ Port 2 every 1.4 ms
                      </text>
                      <text x={0} y={30} fill="#f87171">
                        Table Thrashing · 100% Bandwidth Saturation
                      </text>
                      <text x={0} y={45} fill="#94a3b8">
                        Result: Switch CPU 100% · Unicast forwarding fails
                      </text>
                    </g>
                  </g>
                )}

                {/* Step 2: BPDU Exchange Active */}
                {activeStepIndex === 2 && (
                  <>
                    {/* BPDU Exchange Card */}
                    <g transform="translate(545, 240)">
                      <rect
                        x={-135}
                        y={-40}
                        width={270}
                        height={80}
                        rx={8}
                        fill="#0c1929"
                        stroke="#38bdf8"
                        strokeWidth={1.2}
                      />
                      <text
                        x={0}
                        y={-20}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="8"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        IEEE 802.1D BPDU EXCHANGE ACTIVE
                      </text>
                      <g transform="translate(-120, -2)" fill="#bae6fd" fontSize="7" fontFamily="monospace">
                        <text x={0} y={0}>Frame: BPDU (802.1D Spanning Tree)</text>
                        <text x={0} y={14}>Dest: 01:80:C2:00:00:00 (Multicast)</text>
                        <text x={0} y={28} fill="#4ade80">
                          Interval: 2.0s · Discovery Active
                        </text>
                      </g>
                    </g>

                    {/* BPDU Link Badges (Placed along links above central card) */}
                    <g transform="translate(440, 170)">
                      <rect x={-35} y={-8} width={70} height={16} rx={3} fill="#0369a1" />
                      <text x={0} y={3} textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="700" fontFamily="monospace">
                        BPDU 2s
                      </text>
                    </g>
                    <g transform="translate(650, 170)">
                      <rect x={-35} y={-8} width={70} height={16} rx={3} fill="#0369a1" />
                      <text x={0} y={3} textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="700" fontFamily="monospace">
                        BPDU 2s
                      </text>
                    </g>
                  </>
                )}

                {/* Step 3: Root Bridge Election Summary */}
                {activeStepIndex === 3 && (
                  <g transform="translate(545, 240)">
                    <rect
                      x={-135}
                      y={-45}
                      width={270}
                      height={90}
                      rx={8}
                      fill="#070c14"
                      stroke="#fbbf24"
                      strokeWidth={1.3}
                    />
                    <text
                      x={0}
                      y={-25}
                      textAnchor="middle"
                      fill="#fef08a"
                      fontSize="8"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      ROOT BRIDGE ELECTION CONVERGED
                    </text>
                    <g transform="translate(-120, -5)" fill="#cbd5e1" fontSize="7" fontFamily="monospace">
                      <text x={0} y={0}>Default Bridge Priority: 32768</text>
                      <text x={0} y={14} fill="#4ade80" fontWeight="600">
                        Winner: SW1 (Lowest MAC: AA:BB:CC:00:00:01)
                      </text>
                      <text x={0} y={28}>SW2 Path Cost to Root: 4</text>
                      <text x={0} y={42}>SW3 Path Cost to Root: 4</text>
                    </g>
                  </g>
                )}

                {/* Step 4: Topology Converged & Ping Flow */}
                {activeStepIndex === 4 && (
                  <>
                    {/* Convergence Banner */}
                    <g transform="translate(545, 235)">
                      <rect
                        x={-135}
                        y={-20}
                        width={270}
                        height={40}
                        rx={6}
                        fill="#062e1e"
                        stroke="#22c55e"
                        strokeWidth={1.4}
                      />
                      <text
                        x={0}
                        y={-2}
                        textAnchor="middle"
                        fill="#4ade80"
                        fontSize="8.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        TOPOLOGY CONVERGED · LOOP BROKEN ✓
                      </text>
                      <text
                        x={0}
                        y={12}
                        textAnchor="middle"
                        fill="#86efac"
                        fontSize="7"
                        fontFamily="monospace"
                      >
                        SW3:P2 Blocked · 0 Saturation
                      </text>
                    </g>

                    {/* Active Forwarding Tree Indicator */}
                    <g transform="translate(545, 470)">
                      <text x={0} y={0} textAnchor="middle" fill="#6ee7b7" fontSize="8" fontFamily="monospace">
                        Active Path: PC1 → SW2:P1 → SW1 → SW3:P1 → PC2 (100% Loop-Free)
                      </text>
                    </g>
                  </>
                )}

                {/* Step 5 / Recap: Four Rules of Spanning Tree Protocol */}
                {activeStepIndex === 5 && (
                  <g transform="translate(545, 460)">
                    <rect
                      x={-205}
                      y={-20}
                      width={410}
                      height={100}
                      rx={8}
                      fill="#070c14"
                      stroke="#38bdf8"
                      strokeWidth={1.3}
                    />
                    <text
                      x={0}
                      y={-2}
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="9.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      THE 4 RULES OF SPANNING TREE PROTOCOL
                    </text>
                    <g transform="translate(-190, 16)" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                      <text x={0} y={0}>1. LOOPS ARE FATAL: Ethernet has no TTL; loops cause broadcast storms</text>
                      <text x={0} y={15}>2. BPDUs MAP TOPOLOGY: Switches exchange BPDUs every 2s on 01:80:C2:00:00:00</text>
                      <text x={0} y={30}>3. ROOT BRIDGE: Switch with lowest Bridge ID (Priority + MAC) becomes Root</text>
                      <text x={0} y={45} fill="#4ade80" fontWeight="600">
                        4. BLOCKING PREVENTS LOOPS: Redundant ports block in software for failover
                      </text>
                      <text x={0} y={60} fill="#a78bfa" fontWeight="600">
                        Next: Stage 5 · Day 14: ICMP and TTL (How Ping Works at Layer 3)
                      </text>
                    </g>
                  </g>
                )}
              </>
);
