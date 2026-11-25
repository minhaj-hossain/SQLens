import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgWorkstation } from '../SvgWorkstation';
import { SvgSwitch } from '../SvgSwitch';
import { SvgRouter } from '../SvgRouter';
import { SvgCable } from '../SvgCable';

export const Day09Canvas: React.FC<DayCanvasProps> = ({ activeStepIndex, isPinging }) => (
              <>
                {/* Broadcast Domain 1 Container Box (Subnet 1) */}
                <rect
                  x={30}
                  y={25}
                  width={520}
                  height={485}
                  rx={16}
                  fill="#0c121e"
                  fillOpacity="0.45"
                  stroke={activeStepIndex === 3 ? '#38bdf8' : '#1e293b'}
                  strokeWidth={activeStepIndex === 3 ? 2 : 1.2}
                  strokeDasharray={activeStepIndex === 3 ? undefined : '6 6'}
                  className="transition-all duration-300"
                />
                <text
                  x={50}
                  y={52}
                  fill="#38bdf8"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="monospace"
                  letterSpacing="0.05em"
                >
                  LOCAL SUBNET 1 · 192.168.1.0/24 (BROADCAST DOMAIN 1)
                </text>

                {/* Broadcast Domain 2 Container Box (Subnet 2) */}
                <rect
                  x={740}
                  y={25}
                  width={410}
                  height={485}
                  rx={16}
                  fill="#0a1510"
                  fillOpacity="0.4"
                  stroke={activeStepIndex === 3 ? '#4ade80' : '#1b382b'}
                  strokeWidth={activeStepIndex === 3 ? 2 : 1.2}
                  strokeDasharray={activeStepIndex === 3 ? undefined : '6 6'}
                  className="transition-all duration-300"
                />
                <text
                  x={760}
                  y={52}
                  fill="#4ade80"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="monospace"
                  letterSpacing="0.05em"
                >
                  LOCAL SUBNET 2 · 192.168.2.0/24 (BROADCAST DOMAIN 2)
                </text>

                {/* Cables in Domain 1 */}
                {/* PC1 to SW1 Port 1 */}
                <SvgCable
                  x1={156}
                  y1={170}
                  x2={240}
                  y2={225}
                  color={activeStepIndex === 1 ? '#fbbf24' : '#4ade80'}
                  isTransmitting={isPinging || activeStepIndex === 1 || activeStepIndex === 4}
                />
                {/* PC2 to SW1 Port 2 */}
                <SvgCable
                  x1={156}
                  y1={345}
                  x2={240}
                  y2={245}
                  color={activeStepIndex === 1 ? '#fbbf24' : '#4ade80'}
                  isTransmitting={isPinging || activeStepIndex === 1 || activeStepIndex === 4}
                />
                {/* PC3 to SW1 Port 3 */}
                <SvgCable
                  x1={296}
                  y1={97}
                  x2={296}
                  y2={210}
                  color={activeStepIndex === 1 ? '#fbbf24' : '#4ade80'}
                  isTransmitting={isPinging || activeStepIndex === 1 || activeStepIndex === 4}
                />
                {/* PC4 to SW1 Port 4 */}
                <SvgCable
                  x1={296}
                  y1={390}
                  x2={296}
                  y2={258}
                  color={activeStepIndex === 1 ? '#fbbf24' : '#4ade80'}
                  isTransmitting={isPinging || activeStepIndex === 1 || activeStepIndex === 4}
                />
                {/* SW1 Port 5 to Router R1 Port 1 */}
                <SvgCable
                  x1={352}
                  y1={234}
                  x2={580}
                  y2={234}
                  color={activeStepIndex === 1 || activeStepIndex === 2 ? '#fbbf24' : '#4ade80'}
                  isTransmitting={activeStepIndex === 1 || activeStepIndex === 2 || (activeStepIndex === 4 && isPinging)}
                />

                {/* Cables in Domain 2 (Isolated by Router R1) */}
                {/* Router R1 Port 2 to SW2 */}
                <SvgCable
                  x1={706}
                  y1={234}
                  x2={800}
                  y2={234}
                  color={activeStepIndex >= 1 && activeStepIndex <= 4 ? '#334155' : '#4ade80'}
                  isTransmitting={false}
                />
                {/* SW2 to PC5 */}
                <SvgCable
                  x1={912}
                  y1={225}
                  x2={970}
                  y2={170}
                  color={activeStepIndex >= 1 && activeStepIndex <= 4 ? '#334155' : '#4ade80'}
                  isTransmitting={false}
                />
                {/* SW2 to PC6 */}
                <SvgCable
                  x1={912}
                  y1={245}
                  x2={970}
                  y2={345}
                  color={activeStepIndex >= 1 && activeStepIndex <= 4 ? '#334155' : '#4ade80'}
                  isTransmitting={false}
                />

                {/* Subnet 1 Workstations */}
                {/* PC1 (Transmitter) */}
                <SvgWorkstation
                  x={80}
                  y={140}
                  name="PC1"
                  ip="192.168.1.10"
                  mac="AA:BB:CC:00:00:01"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                  isPinging={isPinging || activeStepIndex === 1 || activeStepIndex === 4}
                />

                {/* PC2 */}
                <SvgWorkstation
                  x={80}
                  y={320}
                  name="PC2"
                  ip="192.168.1.20"
                  mac="AA:BB:CC:00:00:02"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* PC3 */}
                <SvgWorkstation
                  x={258}
                  y={45}
                  name="PC3"
                  ip="192.168.1.30"
                  mac="AA:BB:CC:00:00:03"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* PC4 */}
                <SvgWorkstation
                  x={258}
                  y={390}
                  name="PC4"
                  ip="192.168.1.40"
                  mac="AA:BB:CC:00:00:04"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* Switch SW1 (Domain 1 Center) */}
                <SvgSwitch
                  x={240}
                  y={210}
                  port1Active={true}
                  port2Active={true}
                  port3Active={true}
                  port4Active={true}
                  isPinging={activeStepIndex === 1}
                />

                {/* Central Layer 3 Router R1 */}
                <SvgRouter
                  x={580}
                  y={208}
                  name="Router R1"
                  port1Ip="192.168.1.1"
                  port2Ip="192.168.2.1"
                  showPortIps={true}
                  port1Active={true}
                  port2Active={true}
                />

                {/* Subnet 2 Switch SW2 */}
                <SvgSwitch
                  x={800}
                  y={210}
                  port1Active={activeStepIndex === 0 || activeStepIndex === 5}
                  port2Active={activeStepIndex === 0 || activeStepIndex === 5}
                  port3Active={true}
                  port4Active={false}
                />

                {/* Subnet 2 Workstations */}
                {/* PC5 */}
                <SvgWorkstation
                  x={970}
                  y={140}
                  name="PC5"
                  ip="192.168.2.10"
                  mac="AA:BB:CC:00:02:01"
                  ipColor="green"
                  showIp={true}
                  showMac={true}
                />

                {/* PC6 */}
                <SvgWorkstation
                  x={970}
                  y={320}
                  name="PC6"
                  ip="192.168.2.20"
                  mac="AA:BB:CC:00:02:02"
                  ipColor="green"
                  showIp={true}
                  showMac={true}
                />

                {/* ========================================================
                    GRADUAL REVEAL ANNOTATIONS & HUD INTERACTION
                    ======================================================== */}

                {/* Step 0: Broadcast Scope HUD */}
                {activeStepIndex === 0 && (
                  <g transform="translate(180, 160)">
                    <rect
                      x={-140}
                      y={-14}
                      width={280}
                      height={28}
                      rx={6}
                      fill="#0b1728"
                      stroke="#38bdf8"
                      strokeWidth={1.2}
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="9.5"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      BROADCAST DA: FF:FF:FF:FF:FF:FF (ALL PORTS)
                    </text>
                  </g>
                )}

                {/* Step 1: Replicate & Flood Pulse */}
                {activeStepIndex === 1 && (
                  <>
                    <g transform="translate(296, 175)">
                      <rect
                        x={-125}
                        y={-13}
                        width={250}
                        height={26}
                        rx={6}
                        fill="#1c1917"
                        stroke="#f59e0b"
                        strokeWidth={1.5}
                        className="animate-pulse"
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill="#fbbf24"
                        fontSize="9.5"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        REPLICATE &amp; FLOOD TO ALL PORTS
                      </text>
                    </g>
                  </>
                )}

                {/* Step 2: CPU Interrupt Badges on PC2, PC3, PC4 */}
                {activeStepIndex === 2 && (
                  <>
                    {/* Badge over PC2 */}
                    <g transform="translate(165, 305)">
                      <rect x={-75} y={-11} width={150} height={22} rx={4} fill="#451a03" stroke="#f59e0b" strokeWidth={1} />
                      <text x={0} y={4} textAnchor="middle" fill="#fbbf24" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                        PC2: CPU INTERRUPT ⚡
                      </text>
                    </g>
                    {/* Badge over PC3 */}
                    <g transform="translate(345, 35)">
                      <rect x={-75} y={-11} width={150} height={22} rx={4} fill="#451a03" stroke="#f59e0b" strokeWidth={1} />
                      <text x={0} y={4} textAnchor="middle" fill="#fbbf24" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                        PC3: CPU INTERRUPT ⚡
                      </text>
                    </g>
                    {/* Badge over PC4 */}
                    <g transform="translate(345, 380)">
                      <rect x={-75} y={-11} width={150} height={22} rx={4} fill="#451a03" stroke="#f59e0b" strokeWidth={1} />
                      <text x={0} y={4} textAnchor="middle" fill="#fbbf24" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                        PC4: CPU INTERRUPT ⚡
                      </text>
                    </g>
                  </>
                )}

                {/* Step 3: Router R1 Broadcast Barrier Badge */}
                {activeStepIndex === 3 && (
                  <>
                    <g transform="translate(643, 175)">
                      <rect
                        x={-150}
                        y={-14}
                        width={300}
                        height={28}
                        rx={6}
                        fill="#271010"
                        stroke="#ef4444"
                        strokeWidth={1.5}
                        className="animate-pulse"
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill="#f87171"
                        fontSize="9.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        ROUTER BROADCAST BARRIER ✕ (RFC 1812)
                      </text>
                    </g>

                    {/* Subnet 2 Silence Indicator */}
                    <g transform="translate(945, 238)">
                      <rect x={-90} y={-11} width={180} height={22} rx={4} fill="#090d16" stroke="#334155" strokeWidth={1} />
                      <text x={0} y={4} textAnchor="middle" fill="#64748b" fontSize="8.5" fontFamily="monospace">
                        Subnet 2: Silent (0 frames)
                      </text>
                    </g>
                  </>
                )}

                {/* Step 4: Dual Domain Inventory Card */}
                {activeStepIndex === 4 && (
                  <>
                    <g transform="translate(643, 160)">
                      <rect
                        x={-140}
                        y={-12}
                        width={280}
                        height={24}
                        rx={5}
                        fill="#062e1e"
                        stroke="#22c55e"
                        strokeWidth={1.2}
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill="#4ade80"
                        fontSize="9"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        2 BROADCAST DOMAINS · ROUTER R1 ISOLATION
                      </text>
                    </g>

                    {/* Ping reply badges in Domain 1 */}
                    <g transform="translate(80, 275)">
                      <text x={0} y={0} fill="#4ade80" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                        PC2 Reply ✓
                      </text>
                      <text x={0} y={15} fill="#4ade80" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                        PC3 Reply ✓
                      </text>
                      <text x={0} y={30} fill="#4ade80" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                        PC4 Reply ✓
                      </text>
                    </g>

                    {/* Subnet 2 Unaffected indicator */}
                    <g transform="translate(945, 238)">
                      <text x={0} y={4} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace" fontStyle="italic">
                        Subnet 2: 0 responses (Protected)
                      </text>
                    </g>
                  </>
                )}

                {/* Step 5 / Recap: Four Rules & Stage 4 Preview */}
                {activeStepIndex === 5 && (
                  <g transform="translate(643, 385)">
                    <rect
                      x={-180}
                      y={-15}
                      width={360}
                      height={95}
                      rx={8}
                      fill="#070c14"
                      stroke="#38bdf8"
                      strokeWidth={1.2}
                    />
                    <text
                      x={0}
                      y={6}
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="9.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      THE 4 RULES OF BROADCAST DOMAINS
                    </text>
                    <g transform="translate(-165, 26)" fill="#cbd5e1" fontSize="8.5" fontFamily="monospace">
                      <text x={0} y={0}>1. SWITCH: Floods every broadcast to all ports</text>
                      <text x={0} y={16}>2. HOSTS: Every CPU halted by hardware interrupt</text>
                      <text x={0} y={32}>3. ROUTER: Drops broadcasts at the interface</text>
                      <text x={0} y={48} fill="#a78bfa" fontWeight="600">Next Stage: Day 10 · VLANs (Splitting 1 Switch)</text>
                    </g>
                  </g>
                )}
              </>
);
