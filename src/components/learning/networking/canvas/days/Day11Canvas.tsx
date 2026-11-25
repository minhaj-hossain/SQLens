import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgWorkstation } from '../SvgWorkstation';
import { SvgSwitch } from '../SvgSwitch';
import { SvgCable } from '../SvgCable';

export const Day11Canvas: React.FC<DayCanvasProps> = ({ activeStepIndex, isPinging, isSwitchPinging }) => (
              <>
                {/* Left Building 1 (SW1 Campus) Container */}
                <rect
                  x={30}
                  y={25}
                  width={435}
                  height={490}
                  rx={16}
                  fill="#0c1220"
                  fillOpacity="0.5"
                  stroke="#334155"
                  strokeWidth={1.4}
                />
                <text
                  x={50}
                  y={52}
                  fill="#94a3b8"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="monospace"
                  letterSpacing="0.05em"
                >
                  CAMPUS BUILDING 1 · SWITCH SW1
                </text>

                {/* Right Building 2 (SW2 Campus) Container */}
                <rect
                  x={735}
                  y={25}
                  width={435}
                  height={490}
                  rx={16}
                  fill="#0c1220"
                  fillOpacity="0.5"
                  stroke="#334155"
                  strokeWidth={1.4}
                />
                <text
                  x={755}
                  y={52}
                  fill="#94a3b8"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="monospace"
                  letterSpacing="0.05em"
                >
                  CAMPUS BUILDING 2 · SWITCH SW2
                </text>

                {/* Subnet Labels inside Building 1 */}
                <text x={50} y={80} fill="#818cf8" fontSize="9.5" fontWeight="600" fontFamily="monospace">
                  VLAN 10 (Engineering) · 192.168.10.0/24
                </text>
                <text x={50} y={320} fill="#34d399" fontSize="9.5" fontWeight="600" fontFamily="monospace">
                  VLAN 20 (Finance) · 192.168.20.0/24
                </text>

                {/* Subnet Labels inside Building 2 */}
                <text x={755} y={80} fill="#818cf8" fontSize="9.5" fontWeight="600" fontFamily="monospace">
                  VLAN 10 (Engineering) · 192.168.10.0/24
                </text>
                <text x={755} y={320} fill="#34d399" fontSize="9.5" fontWeight="600" fontFamily="monospace">
                  VLAN 20 (Finance) · 192.168.20.0/24
                </text>

                {/* Workstations in Building 1 */}
                {/* PC1 (VLAN 10) */}
                <SvgWorkstation
                  x={70}
                  y={110}
                  name="PC1"
                  ip="192.168.10.10"
                  mac="AA:BB:CC:10:00:01"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />
                {/* PC2 (VLAN 20) */}
                <SvgWorkstation
                  x={70}
                  y={350}
                  name="PC2"
                  ip="192.168.20.20"
                  mac="AA:BB:CC:20:00:02"
                  ipColor="green"
                  showIp={true}
                  showMac={true}
                />

                {/* Workstations in Building 2 */}
                {/* PC3 (VLAN 10) */}
                <SvgWorkstation
                  x={1030}
                  y={110}
                  name="PC3"
                  ip="192.168.10.30"
                  mac="AA:BB:CC:10:00:03"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />
                {/* PC4 (VLAN 20) */}
                <SvgWorkstation
                  x={1030}
                  y={350}
                  name="PC4"
                  ip="192.168.20.40"
                  mac="AA:BB:CC:20:00:04"
                  ipColor="green"
                  showIp={true}
                  showMac={true}
                />

                {/* Switch SW1 (Left) */}
                <SvgSwitch
                  x={310}
                  y={240}
                  port1Active={true}
                  port2Active={true}
                  port3Active={true}
                  port4Active={true}
                  isPinging={isSwitchPinging || activeStepIndex === 4}
                />
                {/* Switch SW2 (Right) */}
                <SvgSwitch
                  x={770}
                  y={240}
                  port1Active={true}
                  port2Active={true}
                  port3Active={true}
                  port4Active={true}
                  isPinging={isSwitchPinging || activeStepIndex === 4}
                />

                {/* Local Access Cables in Building 1 */}
                {/* PC1 to SW1 Port 1 */}
                <SvgCable
                  x1={130}
                  y1={140}
                  x2={310}
                  y2={252}
                  color="#818cf8"
                  isTransmitting={activeStepIndex === 4 || isPinging}
                />
                {/* PC2 to SW1 Port 2 */}
                <SvgCable
                  x1={130}
                  y1={380}
                  x2={310}
                  y2={276}
                  color="#34d399"
                  isTransmitting={false}
                />

                {/* Local Access Cables in Building 2 */}
                {/* PC3 to SW2 Port 1 */}
                <SvgCable
                  x1={1030}
                  y1={140}
                  x2={890}
                  y2={252}
                  color="#818cf8"
                  isTransmitting={activeStepIndex === 4}
                />
                {/* PC4 to SW2 Port 2 */}
                <SvgCable
                  x1={1030}
                  y1={380}
                  x2={890}
                  y2={276}
                  color="#34d399"
                  isTransmitting={false}
                />

                {/* Port Labels on SW1 */}
                <text x={302} y={254} textAnchor="end" fill="#818cf8" fontSize="8" fontFamily="monospace" fontWeight="600">
                  P1 (V10)
                </text>
                <text x={302} y={278} textAnchor="end" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="600">
                  P2 (V20)
                </text>
                <text x={438} y={266} textAnchor="start" fill={activeStepIndex >= 1 ? '#38bdf8' : '#94a3b8'} fontSize="8" fontFamily="monospace" fontWeight="700">
                  P5 {activeStepIndex >= 1 ? '(TRUNK)' : '(ACCESS)'}
                </text>

                {/* Port Labels on SW2 */}
                <text x={762} y={266} textAnchor="end" fill={activeStepIndex >= 1 ? '#38bdf8' : '#94a3b8'} fontSize="8" fontFamily="monospace" fontWeight="700">
                  {activeStepIndex >= 1 ? '(TRUNK)' : '(ACCESS)'} P5
                </text>
                <text x={898} y={254} textAnchor="start" fill="#818cf8" fontSize="8" fontFamily="monospace" fontWeight="600">
                  (V10) P1
                </text>
                <text x={898} y={278} textAnchor="start" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="600">
                  (V20) P2
                </text>

                {/* Central Trunk Cable between SW1:P5 and SW2:P5 */}
                {activeStepIndex === 0 ? (
                  // Step 0: Standard untrunked wire
                  <g>
                    <SvgCable
                      x1={430}
                      y1={264}
                      x2={770}
                      y2={264}
                      color="#64748b"
                      isTransmitting={false}
                    />
                    <g transform="translate(600, 240)">
                      <rect x={-110} y={-12} width={220} height={24} rx={4} fill="#182030" stroke="#475569" strokeWidth={1} />
                      <text x={0} y={4} textAnchor="middle" fill="#94a3b8" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                        Port 5: Access Mode (Untrunked)
                      </text>
                    </g>
                  </g>
                ) : (
                  // Steps 1+: Active 802.1Q Trunk Link
                  <g>
                    {/* Multi-tone Trunk Cable */}
                    <line
                      x1={430}
                      y1={264}
                      x2={770}
                      y2={264}
                      stroke="#0284c7"
                      strokeWidth={5}
                      strokeLinecap="round"
                    />
                    <line
                      x1={430}
                      y1={264}
                      x2={770}
                      y2={264}
                      stroke="#38bdf8"
                      strokeWidth={2}
                      strokeDasharray="8 6"
                      strokeLinecap="round"
                      className="animate-pulse"
                    />

                    {/* Trunk Active Badge */}
                    <g transform="translate(600, 240)">
                      <rect
                        x={-110}
                        y={-14}
                        width={220}
                        height={26}
                        rx={6}
                        fill="#082f49"
                        stroke="#38bdf8"
                        strokeWidth={1.3}
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill="#7dd3fc"
                        fontSize="8"
                        fontWeight="700"
                        fontFamily="monospace"
                        letterSpacing="0.04em"
                      >
                        IEEE 802.1Q TRUNK (VLAN 10 + 20)
                      </text>
                    </g>
                  </g>
                )}

                {/* Floating 802.1Q Frame Dissection Inspector Card */}
                <g transform="translate(450, 35)">
                  <rect
                    x={0}
                    y={0}
                    width={300}
                    height={180}
                    rx={10}
                    fill="#080e1a"
                    stroke="#38bdf8"
                    strokeWidth={1.2}
                  />
                  {/* Card Title */}
                  <rect x={0} y={0} width={300} height={26} rx={10} fill="#0f172a" />
                  <text
                    x={15}
                    y={17}
                    fill="#38bdf8"
                    fontSize="9.5"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    802.1Q FRAME DISSECTION (TRUNK WIRE)
                  </text>

                  {/* Frame Field Anatomy */}
                  <g transform="translate(15, 42)">
                    {/* Header Strip */}
                    <rect x={0} y={0} width={55} height={22} rx={3} fill="#1e293b" stroke="#475569" strokeWidth={1} />
                    <text x={27} y={14} textAnchor="middle" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                      Dest MAC
                    </text>

                    <rect x={60} y={0} width={55} height={22} rx={3} fill="#1e293b" stroke="#475569" strokeWidth={1} />
                    <text x={87} y={14} textAnchor="middle" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                      Src MAC
                    </text>

                    {/* 802.1Q Tag Highlight */}
                    <rect
                      x={120}
                      y={-2}
                      width={80}
                      height={26}
                      rx={4}
                      fill="#1e1b4b"
                      stroke="#818cf8"
                      strokeWidth={1.5}
                    />
                    <text x={160} y={14} textAnchor="middle" fill="#a5b4fc" fontSize="8" fontWeight="700" fontFamily="monospace">
                      802.1Q Tag
                    </text>

                    <rect x={205} y={0} width={65} height={22} rx={3} fill="#1e293b" stroke="#475569" strokeWidth={1} />
                    <text x={237} y={14} textAnchor="middle" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">
                      Payload
                    </text>
                  </g>

                  {/* Tag Details */}
                  <g transform="translate(15, 82)" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                    <text x={0} y={0} fill="#7dd3fc" fontWeight="600">Tag Protocol ID (TPID):</text>
                    <text x={170} y={0} fill="#f8fafc">0x8100 (802.1Q)</text>

                    <text x={0} y={18} fill="#7dd3fc" fontWeight="600">VLAN Identifier (VID):</text>
                    <text x={170} y={18} fill="#a5b4fc" fontWeight="700">VID=10 (Engineering)</text>

                    <text x={0} y={36} fill="#7dd3fc" fontWeight="600">Priority Code Point (PCP):</text>
                    <text x={170} y={36} fill="#f8fafc">0 (Best Effort)</text>

                    <line x1={0} y1={46} x2={270} y2={46} stroke="#1e293b" strokeWidth={1} />

                    <text x={0} y={60} fill="#34d399" fontSize="7.5">
                      SW1: Inserts Tag ➔ SW2: Strips Tag before PC3
                    </text>
                  </g>
                </g>

                {/* Step 3: Native VLAN Match Box */}
                {activeStepIndex >= 3 && (
                  <g transform="translate(600, 310)">
                    <rect
                      x={-140}
                      y={-12}
                      width={280}
                      height={32}
                      rx={6}
                      fill="#062e1e"
                      stroke="#22c55e"
                      strokeWidth={1.2}
                    />
                    <text
                      x={0}
                      y={2}
                      textAnchor="middle"
                      fill="#4ade80"
                      fontSize="8.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      NATIVE VLAN: 1 (UNTAGGED TRANSIT)
                    </text>
                    <text
                      x={0}
                      y={14}
                      textAnchor="middle"
                      fill="#86efac"
                      fontSize="7.5"
                      fontFamily="monospace"
                    >
                      Matched on SW1 &amp; SW2 · Zero VLAN Leaking
                    </text>
                  </g>
                )}

                {/* Step 4: Cross-Switch Ping Active Visualization */}
                {activeStepIndex === 4 && (
                  <>
                    {/* PC3 Ping Success Callout */}
                    <g transform="translate(1030, 80)">
                      <rect x={-75} y={-10} width={150} height={20} rx={4} fill="#1e1b4b" stroke="#818cf8" strokeWidth={1} />
                      <text x={0} y={4} textAnchor="middle" fill="#c7d2fe" fontSize="8" fontWeight="600" fontFamily="monospace">
                        PC3: Ping Reply Sent ✓
                      </text>
                    </g>

                    {/* VLAN 20 Silent Indicators */}
                    <g transform="translate(80, 420)">
                      <text x={0} y={0} fill="#64748b" fontSize="8" fontFamily="monospace" fontStyle="italic">
                        PC2 (VLAN 20): Silent (0 frames)
                      </text>
                    </g>
                    <g transform="translate(1030, 420)">
                      <text x={0} y={0} fill="#64748b" fontSize="8" fontFamily="monospace" fontStyle="italic">
                        PC4 (VLAN 20): Silent (0 frames)
                      </text>
                    </g>
                  </>
                )}

                {/* Step 5 / Recap: Four Rules of VLAN Trunks */}
                {activeStepIndex === 5 && (
                  <g transform="translate(600, 415)">
                    <rect
                      x={-190}
                      y={-16}
                      width={380}
                      height={96}
                      rx={8}
                      fill="#070c14"
                      stroke="#38bdf8"
                      strokeWidth={1.3}
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="9.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      THE 4 RULES OF VLAN TRUNKS
                    </text>
                    <g transform="translate(-175, 22)" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                      <text x={0} y={0}>1. TRUNK PORT: Carries multiple VLANs over one link</text>
                      <text x={0} y={15}>2. IEEE 802.1Q: Inserts 4-byte header with 12-bit VLAN ID</text>
                      <text x={0} y={30}>3. TRANSPARENT: Access ports strip tags; PCs never see them</text>
                      <text x={0} y={45} fill="#4ade80" fontWeight="600">
                        4. NATIVE VLAN: Untagged trunk transit; must match on both ends
                      </text>
                      <text x={0} y={60} fill="#a78bfa" fontWeight="600">
                        Next: Day 12 · Router-on-a-Stick (Inter-VLAN Routing)
                      </text>
                    </g>
                  </g>
                )}
              </>
);
