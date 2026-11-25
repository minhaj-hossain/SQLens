import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgWorkstation } from '../SvgWorkstation';
import { SvgSwitch } from '../SvgSwitch';
import { SvgRouter } from '../SvgRouter';
import { SvgCable } from '../SvgCable';

export const Day12Canvas: React.FC<DayCanvasProps> = ({ activeStepIndex, isPinging, gateway, isSwitchPinging }) => (
              <>
                {/* Background Zone 1: VLAN 10 (Engineering Subnet 192.168.10.0/24) */}
                <g>
                  <rect
                    x={60}
                    y={220}
                    width={290}
                    height={270}
                    rx={14}
                    fill="#1e1b4b"
                    fillOpacity="0.22"
                    stroke="#6366f1"
                    strokeWidth={1.3}
                    strokeDasharray="4 4"
                  />
                  <rect
                    x={75}
                    y={210}
                    width={220}
                    height={20}
                    rx={4}
                    fill="#18181b"
                    stroke="#6366f1"
                    strokeWidth={1}
                  />
                  <text
                    x={185}
                    y={223}
                    textAnchor="middle"
                    fill="#a5b4fc"
                    fontSize="8.5"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    VLAN 10 · ENGINEERING (192.168.10.0/24)
                  </text>
                </g>

                {/* Background Zone 2: VLAN 20 (Finance Subnet 192.168.20.0/24) */}
                <g>
                  <rect
                    x={750}
                    y={220}
                    width={290}
                    height={270}
                    rx={14}
                    fill="#064e3b"
                    fillOpacity="0.22"
                    stroke="#10b981"
                    strokeWidth={1.3}
                    strokeDasharray="4 4"
                  />
                  <rect
                    x={765}
                    y={210}
                    width={200}
                    height={20}
                    rx={4}
                    fill="#18181b"
                    stroke="#10b981"
                    strokeWidth={1}
                  />
                  <text
                    x={865}
                    y={223}
                    textAnchor="middle"
                    fill="#6ee7b7"
                    fontSize="8.5"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    VLAN 20 · FINANCE (192.168.20.0/24)
                  </text>
                </g>

                {/* Background Zone 3: Layer 3 Routing Domain (Router R1 & Trunk Stick) */}
                <rect
                  x={375}
                  y={25}
                  width={350}
                  height={175}
                  rx={14}
                  fill="#0c1524"
                  fillOpacity="0.45"
                  stroke="#38bdf8"
                  strokeWidth={1.2}
                />
                <rect
                  x={410}
                  y={16}
                  width={280}
                  height={18}
                  rx={4}
                  fill="#070c14"
                  stroke="#38bdf8"
                  strokeWidth={0.9}
                />
                <text
                  x={550}
                  y={28}
                  textAnchor="middle"
                  fill="#7dd3fc"
                  fontSize="8"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  LAYER 3 ROUTING CORE (ROUTER-ON-A-STICK)
                </text>

                {/* Access Link: PC1 to SW1 Port 1 (VLAN 10 Access Mode) */}
                <SvgCable
                  x1={186}
                  y1={356}
                  x2={494}
                  y2={356}
                  color="#818cf8"
                  isTransmitting={activeStepIndex === 0 || activeStepIndex === 4}
                />

                {/* Access Link: SW1 Port 2 to PC2 (VLAN 20 Access Mode) */}
                <SvgCable
                  x1={606}
                  y1={356}
                  x2={870}
                  y2={356}
                  color="#34d399"
                  isTransmitting={activeStepIndex === 4}
                />

                {/* The "Stick": 802.1Q Trunk Link between SW1 Port 4 and Router R1 eth0 */}
                {/* Thick glowing backing line */}
                <line
                  x1={550}
                  y1={335}
                  x2={550}
                  y2={122}
                  stroke="#38bdf8"
                  strokeWidth={activeStepIndex >= 1 ? 4 : 2}
                  strokeDasharray={activeStepIndex >= 1 ? 'none' : '4 4'}
                  opacity={activeStepIndex >= 1 ? 0.85 : 0.4}
                />
                <line
                  x1={550}
                  y1={335}
                  x2={550}
                  y2={122}
                  stroke="#a855f7"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  opacity={activeStepIndex >= 1 ? 0.9 : 0}
                  className={activeStepIndex >= 1 ? 'animate-pulse' : ''}
                />

                {/* Trunk Label Badge alongside the stick */}
                <g transform="translate(560, 155)">
                  <rect
                    x={0}
                    y={0}
                    width={170}
                    height={38}
                    rx={5}
                    fill="#070c14"
                    stroke={activeStepIndex >= 1 ? '#38bdf8' : '#475569'}
                    strokeWidth={1.2}
                  />
                  <text
                    x={85}
                    y={15}
                    textAnchor="middle"
                    fill={activeStepIndex >= 1 ? '#38bdf8' : '#94a3b8'}
                    fontSize="8"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    802.1Q TRUNK "STICK"
                  </text>
                  <text
                    x={85}
                    y={28}
                    textAnchor="middle"
                    fill="#cbd5e1"
                    fontSize="7"
                    fontFamily="monospace"
                  >
                    SW1:Port 4 ⟷ R1:eth0
                  </text>
                </g>

                {/* PC1 (Engineering Workstation · VLAN 10) */}
                <SvgWorkstation
                  x={100}
                  y={320}
                  name="PC1"
                  ip="192.168.10.10"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />
                {/* PC1 Default Gateway Indicator */}
                <text
                  x={143}
                  y={305}
                  textAnchor="middle"
                  fill="#a5b4fc"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  gw: 192.168.10.1 (eth0.10)
                </text>

                {/* PC2 (Finance Workstation · VLAN 20) */}
                <SvgWorkstation
                  x={870}
                  y={320}
                  name="PC2"
                  ip="192.168.20.20"
                  ipColor="green"
                  showIp={true}
                  showMac={true}
                />
                {/* PC2 Default Gateway Indicator */}
                <text
                  x={913}
                  y={305}
                  textAnchor="middle"
                  fill="#6ee7b7"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  gw: 192.168.20.1 (eth0.20)
                </text>

                {/* Switch SW1 (Bottom Center) */}
                <SvgSwitch
                  x={494}
                  y={335}
                  port1Active={true}
                  port2Active={true}
                  port3Active={false}
                  port4Active={true}
                  isPinging={isSwitchPinging || activeStepIndex === 0 || activeStepIndex === 4}
                />

                {/* Switch Port Labels */}
                {/* Port 1 (Access VLAN 10) */}
                <text
                  x={486}
                  y={360}
                  textAnchor="end"
                  fill="#a5b4fc"
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  P1 (V10)
                </text>

                {/* Port 2 (Access VLAN 20) */}
                <text
                  x={614}
                  y={360}
                  textAnchor="start"
                  fill="#6ee7b7"
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  (V20) P2
                </text>

                {/* Port 4 (Trunk to Router) */}
                <text
                  x={550}
                  y={328}
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="700"
                >
                  Port 4 [802.1Q TRUNK]
                </text>

                {/* Router R1 (Top Center) */}
                <SvgRouter
                  x={487}
                  y={70}
                  name="Router R1"
                  port1Active={true}
                  isPinging={activeStepIndex === 4}
                />

                {/* R1 Physical eth0 label */}
                <text
                  x={550}
                  y={136}
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="700"
                >
                  eth0 (Trunk)
                </text>

                {/* Sub-interface Badges on Router R1 */}
                {/* eth0.10 badge */}
                <g transform="translate(390, 85)">
                  <rect
                    x={0}
                    y={0}
                    width={90}
                    height={34}
                    rx={5}
                    fill={activeStepIndex >= 2 ? '#1e1b4b' : '#18181b'}
                    stroke={activeStepIndex >= 2 ? '#818cf8' : '#334155'}
                    strokeWidth={activeStepIndex === 2 ? 1.8 : 1}
                    className={activeStepIndex === 2 ? 'animate-pulse' : ''}
                  />
                  <text
                    x={45}
                    y={14}
                    textAnchor="middle"
                    fill={activeStepIndex >= 2 ? '#a5b4fc' : '#64748b'}
                    fontSize="8"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    eth0.10
                  </text>
                  <text
                    x={45}
                    y={26}
                    textAnchor="middle"
                    fill={activeStepIndex >= 2 ? '#c7d2fe' : '#475569'}
                    fontSize="7"
                    fontFamily="monospace"
                  >
                    {activeStepIndex >= 2 ? '192.168.10.1' : 'Unconfigured'}
                  </text>
                </g>

                {/* eth0.20 badge */}
                <g transform="translate(620, 85)">
                  <rect
                    x={0}
                    y={0}
                    width={90}
                    height={34}
                    rx={5}
                    fill={activeStepIndex >= 3 ? '#064e3b' : '#18181b'}
                    stroke={activeStepIndex >= 3 ? '#34d399' : '#334155'}
                    strokeWidth={activeStepIndex === 3 ? 1.8 : 1}
                    className={activeStepIndex === 3 ? 'animate-pulse' : ''}
                  />
                  <text
                    x={45}
                    y={14}
                    textAnchor="middle"
                    fill={activeStepIndex >= 3 ? '#6ee7b7' : '#64748b'}
                    fontSize="8"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    eth0.20
                  </text>
                  <text
                    x={45}
                    y={26}
                    textAnchor="middle"
                    fill={activeStepIndex >= 3 ? '#a7f3d0' : '#475569'}
                    fontSize="7"
                    fontFamily="monospace"
                  >
                    {activeStepIndex >= 3 ? '192.168.20.1' : 'Unconfigured'}
                  </text>
                </g>

                {/* Sub-interface Table HUD Card (Top Right) */}
                <g transform="translate(740, 35)">
                  <rect
                    x={0}
                    y={0}
                    width={330}
                    height={165}
                    rx={8}
                    fill="#070c14"
                    stroke="#38bdf8"
                    strokeWidth={1.2}
                  />
                  {/* Table Header Bar */}
                  <rect x={0} y={0} width={330} height={26} rx={8} fill="#0c1524" />
                  <text
                    x={12}
                    y={17}
                    fill="#38bdf8"
                    fontSize="8.5"
                    fontWeight="700"
                    fontFamily="monospace"
                    letterSpacing="0.05em"
                  >
                    ROUTER R1 · SUB-INTERFACE TABLE
                  </text>
                  <rect
                    x={255}
                    y={5}
                    width={65}
                    height={16}
                    rx={3}
                    fill={activeStepIndex >= 3 ? '#064e3b' : activeStepIndex >= 2 ? '#1e1b4b' : '#27272a'}
                  />
                  <text
                    x={287}
                    y={16}
                    textAnchor="middle"
                    fill={activeStepIndex >= 3 ? '#6ee7b7' : activeStepIndex >= 2 ? '#a5b4fc' : '#a1a1aa'}
                    fontSize="7.5"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {activeStepIndex >= 3 ? '2 ROUTES' : activeStepIndex >= 2 ? '1 ROUTE' : '0 ROUTES'}
                  </text>

                  {/* Table Column Titles */}
                  <g transform="translate(12, 42)" fill="#94a3b8" fontSize="7.5" fontFamily="monospace" fontWeight="600">
                    <text x={0} y={0}>INTERFACE</text>
                    <text x={80} y={0}>ENCAP</text>
                    <text x={145} y={0}>IP ADDRESS / MASK</text>
                    <text x={275} y={0}>STATUS</text>
                  </g>
                  <line x1={12} y1={47} x2={318} y2={47} stroke="#1e293b" strokeWidth={1} />

                  {/* Row 1: eth0 */}
                  <g transform="translate(12, 63)" fontSize="7.5" fontFamily="monospace">
                    <text x={0} y={0} fill="#f1f5f9" fontWeight="600">eth0</text>
                    <text x={80} y={0} fill="#64748b">Trunk Link</text>
                    <text x={145} y={0} fill="#64748b">Unassigned</text>
                    <text x={275} y={0} fill="#4ade80" fontWeight="600">UP</text>
                  </g>
                  <line x1={12} y1={71} x2={318} y2={71} stroke="#1e293b" strokeWidth={0.7} />

                  {/* Row 2: eth0.10 */}
                  <g transform="translate(12, 87)" fontSize="7.5" fontFamily="monospace">
                    <text x={0} y={0} fill={activeStepIndex >= 2 ? '#a5b4fc' : '#475569'} fontWeight="600">eth0.10</text>
                    <text x={80} y={0} fill={activeStepIndex >= 2 ? '#818cf8' : '#475569'}>dot1q 10</text>
                    <text x={145} y={0} fill={activeStepIndex >= 2 ? '#c7d2fe' : '#475569'}>
                      {activeStepIndex >= 2 ? '192.168.10.1/24' : '---'}
                    </text>
                    <text x={275} y={0} fill={activeStepIndex >= 2 ? '#4ade80' : '#475569'} fontWeight="600">
                      {activeStepIndex >= 2 ? 'UP' : 'DOWN'}
                    </text>
                  </g>
                  <line x1={12} y1={95} x2={318} y2={95} stroke="#1e293b" strokeWidth={0.7} />

                  {/* Row 3: eth0.20 */}
                  <g transform="translate(12, 111)" fontSize="7.5" fontFamily="monospace">
                    <text x={0} y={0} fill={activeStepIndex >= 3 ? '#6ee7b7' : '#475569'} fontWeight="600">eth0.20</text>
                    <text x={80} y={0} fill={activeStepIndex >= 3 ? '#34d399' : '#475569'}>dot1q 20</text>
                    <text x={145} y={0} fill={activeStepIndex >= 3 ? '#a7f3d0' : '#475569'}>
                      {activeStepIndex >= 3 ? '192.168.20.1/24' : '---'}
                    </text>
                    <text x={275} y={0} fill={activeStepIndex >= 3 ? '#4ade80' : '#475569'} fontWeight="600">
                      {activeStepIndex >= 3 ? 'UP' : 'DOWN'}
                    </text>
                  </g>

                  {/* Table Footer Status */}
                  <rect x={8} y={124} width={314} height={32} rx={4} fill="#030712" stroke="#1e293b" strokeWidth={0.8} />
                  <text x={16} y={138} fill="#94a3b8" fontSize="7" fontFamily="monospace">
                    {activeStepIndex < 2 && '⚠ Sub-interfaces unconfigured. VLANs cannot communicate.'}
                    {activeStepIndex === 2 && 'ℹ eth0.10 active (VLAN 10). Waiting for eth0.20 gateway.'}
                    {activeStepIndex >= 3 && '✓ Both sub-interfaces active. Inter-VLAN routing enabled.'}
                  </text>
                  <text x={16} y={149} fill={activeStepIndex >= 3 ? '#34d399' : '#64748b'} fontSize="7" fontFamily="monospace">
                    {activeStepIndex >= 3
                      ? 'Connected: 192.168.10.0/24 (eth0.10) & 192.168.20.0/24 (eth0.20)'
                      : 'Connected: 0 routing table entries'}
                  </text>
                </g>

                {/* ================= STEP-SPECIFIC OVERLAYS ================= */}

                {/* Step 0: Layer 2 Cross-VLAN Isolation Dropped Barrier */}
                {activeStepIndex === 0 && (
                  <>
                    {/* Glowing Crimson Shield at Switch Core */}
                    <g transform="translate(550, 420)">
                      <rect
                        x={-170}
                        y={-14}
                        width={340}
                        height={28}
                        rx={6}
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
                        fontSize="9"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        CROSS-VLAN BLOCKED ✕ (Layer 2 Isolation)
                      </text>
                    </g>

                    {/* Dropped Packet Indicator near SW1 */}
                    <g transform="translate(430, 335)">
                      <rect x={0} y={0} width={120} height={20} rx={4} fill="#18181b" stroke="#ef4444" strokeWidth={1} />
                      <text x={60} y={13} textAnchor="middle" fill="#fca5a5" fontSize="7.5" fontFamily="monospace">
                        Dropped at SW1
                      </text>
                    </g>
                  </>
                )}

                {/* Step 1: Single Cable Design Highlight */}
                {activeStepIndex === 1 && (
                  <g transform="translate(250, 110)">
                    <rect
                      x={-150}
                      y={-14}
                      width={300}
                      height={50}
                      rx={6}
                      fill="#082f49"
                      stroke="#0284c7"
                      strokeWidth={1.2}
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="8.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      ONE PHYSICAL CABLE · "THE STICK"
                    </text>
                    <text
                      x={0}
                      y={20}
                      textAnchor="middle"
                      fill="#bae6fd"
                      fontSize="7.5"
                      fontFamily="monospace"
                    >
                      Carries all VLAN traffic via 802.1Q tags
                    </text>
                  </g>
                )}

                {/* Step 2: First Sub-interface Activated Callout */}
                {activeStepIndex === 2 && (
                  <g transform="translate(240, 110)">
                    <rect
                      x={-140}
                      y={-14}
                      width={280}
                      height={50}
                      rx={6}
                      fill="#1e1b4b"
                      stroke="#818cf8"
                      strokeWidth={1.3}
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fill="#a5b4fc"
                      fontSize="8.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      GATEWAY CREATED: eth0.10
                    </text>
                    <text
                      x={0}
                      y={20}
                      textAnchor="middle"
                      fill="#c7d2fe"
                      fontSize="7.5"
                      fontFamily="monospace"
                    >
                      192.168.10.1 · Encapsulation dot1q 10
                    </text>
                  </g>
                )}

                {/* Step 3: Second Sub-interface Activated Callout */}
                {activeStepIndex === 3 && (
                  <g transform="translate(240, 110)">
                    <rect
                      x={-140}
                      y={-14}
                      width={280}
                      height={50}
                      rx={6}
                      fill="#064e3b"
                      stroke="#34d399"
                      strokeWidth={1.3}
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fill="#6ee7b7"
                      fontSize="8.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      GATEWAY CREATED: eth0.20
                    </text>
                    <text
                      x={0}
                      y={20}
                      textAnchor="middle"
                      fill="#a7f3d0"
                      fontSize="7.5"
                      fontFamily="monospace"
                    >
                      192.168.20.1 · Encapsulation dot1q 20
                    </text>
                  </g>
                )}

                {/* Step 4: The Hairpin Journey Packet Flow */}
                {activeStepIndex === 4 && (
                  <>
                    {/* Hairpin Path Banner */}
                    <g transform="translate(550, 435)">
                      <rect
                        x={-190}
                        y={-14}
                        width={380}
                        height={30}
                        rx={6}
                        fill="#062e1e"
                        stroke="#22c55e"
                        strokeWidth={1.4}
                      />
                      <text
                        x={0}
                        y={5}
                        textAnchor="middle"
                        fill="#4ade80"
                        fontSize="9"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        HAIRPIN ROUTING SUCCESSFUL ✓ (TTL 64 → 63 · 0% LOSS)
                      </text>
                    </g>

                    {/* Tagged VID=10 ascending label */}
                    <g transform="translate(485, 230)">
                      <rect x={-45} y={-10} width={90} height={20} rx={4} fill="#1e1b4b" stroke="#818cf8" strokeWidth={1} />
                      <text x={0} y={3} textAnchor="middle" fill="#c7d2fe" fontSize="7.5" fontWeight="700" fontFamily="monospace">
                        ▲ Tag: VID=10
                      </text>
                    </g>

                    {/* Tagged VID=20 descending label */}
                    <g transform="translate(615, 230)">
                      <rect x={-45} y={-10} width={90} height={20} rx={4} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3} textAnchor="middle" fill="#a7f3d0" fontSize="7.5" fontWeight="700" fontFamily="monospace">
                        ▼ Tag: VID=20
                      </text>
                    </g>

                    {/* Router L3 Internal Forwarding badge */}
                    <g transform="translate(550, 46)">
                      <rect x={-110} y={-9} width={220} height={18} rx={3} fill="#0284c7" />
                      <text x={0} y={3} textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="700" fontFamily="monospace">
                        L3 ROUTE: eth0.10 ↷ eth0.20 (TTL: 63)
                      </text>
                    </g>
                  </>
                )}

                {/* Step 5 / Recap: Four Rules of Inter-VLAN Routing */}
                {activeStepIndex === 5 && (
                  <g transform="translate(550, 455)">
                    <rect
                      x={-200}
                      y={-20}
                      width={400}
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
                      THE 4 RULES OF INTER-VLAN ROUTING
                    </text>
                    <g transform="translate(-185, 16)" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                      <text x={0} y={0}>1. ROUTER REQUIRED: Switches cannot pass cross-VLAN frames at L2</text>
                      <text x={0} y={15}>2. THE STICK: One 802.1Q trunk carries all VLAN traffic to the router</text>
                      <text x={0} y={30}>3. SUB-INTERFACES: Virtual router ports act as subnet gateways</text>
                      <text x={0} y={45} fill="#4ade80" fontWeight="600">
                        4. HAIRPIN ROUTING: Packets travel up tagged, route, and down tagged
                      </text>
                      <text x={0} y={60} fill="#a78bfa" fontWeight="600">
                        Next: Day 13 · Spanning Tree Protocol (Preventing Loops)
                      </text>
                    </g>
                  </g>
                )}
              </>
);
