import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgWorkstation } from '../SvgWorkstation';
import { SvgSwitch } from '../SvgSwitch';
import { SvgCable } from '../SvgCable';

export const Day10Canvas: React.FC<DayCanvasProps> = ({ activeStepIndex, isPinging, isSwitchPinging }) => (
              <>
                {/* Steps 0 & 1: Factory default switch — Single shared domain container */}
                {activeStepIndex < 2 && (
                  <g>
                    <rect
                      x={35}
                      y={25}
                      width={1010}
                      height={470}
                      rx={16}
                      fill="#0c121e"
                      fillOpacity="0.4"
                      stroke="#475569"
                      strokeWidth={1.5}
                      strokeDasharray="6 6"
                      className="transition-all duration-300"
                    />
                    <text
                      x={55}
                      y={52}
                      fill="#94a3b8"
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="monospace"
                      letterSpacing="0.05em"
                    >
                      FACTORY DEFAULT SWITCH · ALL PORTS ASSIGNED TO VLAN 1 (SHARED BROADCAST DOMAIN)
                    </text>
                  </g>
                )}

                {/* Steps 2+: Segmented into two isolated VLAN containers */}
                {activeStepIndex >= 2 && (
                  <>
                    {/* VLAN 10 (Engineering) Left Container */}
                    <rect
                      x={35}
                      y={25}
                      width={410}
                      height={470}
                      rx={16}
                      fill="#0e1329"
                      fillOpacity="0.55"
                      stroke="#818cf8"
                      strokeWidth={1.8}
                      className="transition-all duration-300"
                    />
                    <text
                      x={55}
                      y={52}
                      fill="#a5b4fc"
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="monospace"
                      letterSpacing="0.05em"
                    >
                      VLAN 10 (ENGINEERING) · 192.168.10.0/24
                    </text>
                    <g transform="translate(325, 42)">
                      <rect
                        x={0}
                        y={0}
                        width={105}
                        height={18}
                        rx={4}
                        fill="#1e1b4b"
                        stroke="#6366f1"
                        strokeWidth={1}
                      />
                      <text
                        x={52}
                        y={12}
                        textAnchor="middle"
                        fill="#c7d2fe"
                        fontSize="8.5"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        ACCESS MODE
                      </text>
                    </g>

                    {/* VLAN 20 (Finance) Right Container */}
                    <rect
                      x={635}
                      y={25}
                      width={410}
                      height={470}
                      rx={16}
                      fill="#091d17"
                      fillOpacity="0.55"
                      stroke="#34d399"
                      strokeWidth={1.8}
                      className="transition-all duration-300"
                    />
                    <text
                      x={655}
                      y={52}
                      fill="#6ee7b7"
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="monospace"
                      letterSpacing="0.05em"
                    >
                      VLAN 20 (FINANCE) · 192.168.20.0/24
                    </text>
                    <g transform="translate(925, 42)">
                      <rect
                        x={0}
                        y={0}
                        width={105}
                        height={18}
                        rx={4}
                        fill="#064e3b"
                        stroke="#10b981"
                        strokeWidth={1}
                      />
                      <text
                        x={52}
                        y={12}
                        textAnchor="middle"
                        fill="#a7f3d0"
                        fontSize="8.5"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        ACCESS MODE
                      </text>
                    </g>
                  </>
                )}

                {/* Cables to Switch SW1 */}
                {/* Cable PC1 to Port 1 */}
                <SvgCable
                  x1={150}
                  y1={170}
                  x2={460}
                  y2={275}
                  color={
                    activeStepIndex < 2
                      ? '#64748b'
                      : '#818cf8'
                  }
                  isTransmitting={
                    activeStepIndex === 3 || activeStepIndex === 4 || isPinging
                  }
                />
                {/* Cable PC2 to Port 2 */}
                <SvgCable
                  x1={150}
                  y1={360}
                  x2={460}
                  y2={295}
                  color={
                    activeStepIndex < 2
                      ? '#64748b'
                      : '#818cf8'
                  }
                  isTransmitting={activeStepIndex === 3}
                />
                {/* Cable PC3 to Port 3 */}
                <SvgCable
                  x1={880}
                  y1={170}
                  x2={580}
                  y2={275}
                  color={
                    activeStepIndex < 2
                      ? '#64748b'
                      : activeStepIndex === 3
                      ? '#334155'
                      : '#34d399'
                  }
                  isTransmitting={false}
                />
                {/* Cable PC4 to Port 4 */}
                <SvgCable
                  x1={880}
                  y1={360}
                  x2={580}
                  y2={295}
                  color={
                    activeStepIndex < 2
                      ? '#64748b'
                      : activeStepIndex === 3
                      ? '#334155'
                      : '#34d399'
                  }
                  isTransmitting={false}
                />

                {/* Workstations (Left VLAN 10) */}
                {/* PC1 */}
                <SvgWorkstation
                  x={90}
                  y={140}
                  name="PC1"
                  ip="192.168.10.10"
                  mac="AA:BB:CC:10:00:01"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />
                {/* PC2 */}
                <SvgWorkstation
                  x={90}
                  y={330}
                  name="PC2"
                  ip="192.168.10.20"
                  mac="AA:BB:CC:10:00:02"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* Workstations (Right VLAN 20) */}
                {/* PC3 */}
                <SvgWorkstation
                  x={880}
                  y={140}
                  name="PC3"
                  ip="192.168.20.30"
                  mac="AA:BB:CC:20:00:03"
                  ipColor="green"
                  showIp={true}
                  showMac={true}
                />
                {/* PC4 */}
                <SvgWorkstation
                  x={880}
                  y={330}
                  name="PC4"
                  ip="192.168.20.40"
                  mac="AA:BB:CC:20:00:04"
                  ipColor="green"
                  showIp={true}
                  showMac={true}
                />

                {/* Central Switch SW1 */}
                <SvgSwitch
                  x={460}
                  y={260}
                  port1Active={true}
                  port2Active={true}
                  port3Active={true}
                  port4Active={true}
                  isPinging={isSwitchPinging || activeStepIndex === 3 || activeStepIndex === 4}
                />

                {/* Port Labels & Color Badges on Switch SW1 */}
                {/* Port 1 (Left Top) */}
                <text
                  x={452}
                  y={272}
                  textAnchor="end"
                  fill={activeStepIndex >= 2 ? '#a5b4fc' : '#94a3b8'}
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  P1 {activeStepIndex >= 2 ? '(V10)' : ''}
                </text>
                {/* Port 2 (Left Bottom) */}
                <text
                  x={452}
                  y={299}
                  textAnchor="end"
                  fill={activeStepIndex >= 2 ? '#a5b4fc' : '#94a3b8'}
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  P2 {activeStepIndex >= 2 ? '(V10)' : ''}
                </text>
                {/* Port 3 (Right Top) */}
                <text
                  x={588}
                  y={272}
                  textAnchor="start"
                  fill={activeStepIndex >= 2 ? '#6ee7b7' : '#94a3b8'}
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {activeStepIndex >= 2 ? '(V20)' : ''} P3
                </text>
                {/* Port 4 (Right Bottom) */}
                <text
                  x={588}
                  y={299}
                  textAnchor="start"
                  fill={activeStepIndex >= 2 ? '#6ee7b7' : '#94a3b8'}
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {activeStepIndex >= 2 ? '(V20)' : ''} P4
                </text>

                {/* Switch Floating VLAN Database HUD Card */}
                <g transform="translate(350, 30)">
                  <rect
                    x={0}
                    y={0}
                    width={380}
                    height={165}
                    rx={10}
                    fill="#080e1a"
                    stroke="#38bdf8"
                    strokeWidth={1.2}
                  />
                  {/* Card Header */}
                  <rect
                    x={0}
                    y={0}
                    width={380}
                    height={26}
                    rx={10}
                    fill="#0f172a"
                  />
                  <text
                    x={15}
                    y={17}
                    fill="#38bdf8"
                    fontSize="9.5"
                    fontWeight="700"
                    fontFamily="monospace"
                    letterSpacing="0.05em"
                  >
                    SWITCH SW1 · VLAN DATABASE (LIVE)
                  </text>
                  <text
                    x={365}
                    y={17}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="8.5"
                    fontFamily="monospace"
                  >
                    {activeStepIndex < 2 ? '1 VLAN' : '2 ACTIVE VLANS'}
                  </text>

                  {/* Table Column Titles */}
                  <g transform="translate(15, 42)" fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="600">
                    <text x={0} y={0}>VLAN</text>
                    <text x={45} y={0}>NAME</text>
                    <text x={145} y={0}>STATUS</text>
                    <text x={215} y={0}>MEMBER PORTS</text>
                  </g>
                  <line x1={15} y1={47} x2={365} y2={47} stroke="#1e293b" strokeWidth={1} />

                  {/* Table Rows */}
                  {/* Step 0: Only default VLAN 1 with all ports */}
                  {activeStepIndex === 0 && (
                    <g transform="translate(15, 66)" fontFamily="monospace" fontSize="9">
                      <text x={0} y={0} fill="#f8fafc" fontWeight="600">1</text>
                      <text x={45} y={0} fill="#94a3b8">default</text>
                      <text x={145} y={0} fill="#4ade80">active</text>
                      <text x={215} y={0} fill="#f8fafc">Port 1, 2, 3, 4</text>

                      {/* State Badge */}
                      <g transform="translate(0, 48)">
                        <rect x={0} y={0} width={350} height={26} rx={5} fill="#0f172a" stroke="#334155" strokeWidth={1} />
                        <text x={175} y={17} textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="600">
                          1 Shared Broadcast Domain (Factory Default)
                        </text>
                      </g>
                    </g>
                  )}

                  {/* Step 1: VLAN 10 and 20 created, but 0 ports assigned */}
                  {activeStepIndex === 1 && (
                    <g transform="translate(15, 63)" fontFamily="monospace" fontSize="8.5">
                      <text x={0} y={0} fill="#94a3b8">1</text>
                      <text x={45} y={0} fill="#94a3b8">default</text>
                      <text x={145} y={0} fill="#4ade80">active</text>
                      <text x={215} y={0} fill="#94a3b8">Port 1, 2, 3, 4</text>

                      <text x={0} y={18} fill="#a5b4fc" fontWeight="600">10</text>
                      <text x={45} y={18} fill="#a5b4fc">Engineering</text>
                      <text x={145} y={18} fill="#4ade80">active</text>
                      <text x={215} y={18} fill="#fbbf24">none (0 ports)</text>

                      <text x={0} y={36} fill="#6ee7b7" fontWeight="600">20</text>
                      <text x={45} y={36} fill="#6ee7b7">Finance</text>
                      <text x={145} y={36} fill="#4ade80">active</text>
                      <text x={215} y={36} fill="#fbbf24">none (0 ports)</text>

                      {/* State Badge */}
                      <g transform="translate(0, 52)">
                        <rect x={0} y={0} width={350} height={22} rx={4} fill="#1e1b4b" stroke="#6366f1" strokeWidth={1} />
                        <text x={175} y={15} textAnchor="middle" fill="#c7d2fe" fontSize="8.5" fontWeight="600">
                          VLANs Created · Awaiting Port Assignment
                        </text>
                      </g>
                    </g>
                  )}

                  {/* Steps 2+: Ports assigned to VLAN 10 & 20 */}
                  {activeStepIndex >= 2 && (
                    <g transform="translate(15, 63)" fontFamily="monospace" fontSize="8.5">
                      <text x={0} y={0} fill="#64748b">1</text>
                      <text x={45} y={0} fill="#64748b">default</text>
                      <text x={145} y={0} fill="#64748b">active</text>
                      <text x={215} y={0} fill="#64748b">none (0 ports)</text>

                      <text x={0} y={18} fill="#a5b4fc" fontWeight="700">10</text>
                      <text x={45} y={18} fill="#a5b4fc" fontWeight="600">Engineering</text>
                      <text x={145} y={18} fill="#4ade80">active</text>
                      <text x={215} y={18} fill="#a5b4fc" fontWeight="700">Port 1, Port 2</text>

                      <text x={0} y={36} fill="#6ee7b7" fontWeight="700">20</text>
                      <text x={45} y={36} fill="#6ee7b7" fontWeight="600">Finance</text>
                      <text x={145} y={36} fill="#4ade80">active</text>
                      <text x={215} y={36} fill="#6ee7b7" fontWeight="700">Port 3, Port 4</text>

                      {/* State Badge */}
                      <g transform="translate(0, 52)">
                        <rect x={0} y={0} width={350} height={22} rx={4} fill="#062e1e" stroke="#22c55e" strokeWidth={1} />
                        <text x={175} y={15} textAnchor="middle" fill="#4ade80" fontSize="8.5" fontWeight="600">
                          Active Segmentation · 2 Isolated Broadcast Domains
                        </text>
                      </g>
                    </g>
                  )}
                </g>

                {/* Step 3: Broadcast Confinement Visualization */}
                {activeStepIndex === 3 && (
                  <>
                    {/* PC2 receives broadcast indicator */}
                    <g transform="translate(90, 440)">
                      <rect x={0} y={0} width={180} height={22} rx={4} fill="#1e1b4b" stroke="#818cf8" strokeWidth={1} />
                      <text x={90} y={15} textAnchor="middle" fill="#c7d2fe" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                        PC2: Broadcast Received ✓
                      </text>
                    </g>

                    {/* VLAN 20 Filtered / Locked Badges on Ports 3 & 4 */}
                    <g transform="translate(650, 260)">
                      <rect x={0} y={0} width={140} height={42} rx={6} fill="#1e293b" stroke="#ef4444" strokeWidth={1.2} />
                      <text x={70} y={16} textAnchor="middle" fill="#f87171" fontSize="8.5" fontFamily="monospace" fontWeight="700">
                        VLAN 20 FILTERED ✕
                      </text>
                      <text x={70} y={32} textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                        Ports 3 &amp; 4 Silent
                      </text>
                    </g>

                    {/* PC3 & PC4 Silent Badges */}
                    <g transform="translate(880, 440)">
                      <text x={0} y={0} fill="#64748b" fontSize="8.5" fontFamily="monospace" fontStyle="italic">
                        PC3 &amp; PC4: Completely Silent (Zero Interrupts)
                      </text>
                    </g>
                  </>
                )}

                {/* Step 4: Unicast Cross-VLAN Dropped Barrier */}
                {activeStepIndex === 4 && (
                  <>
                    {/* Glowing Crimson Shield at Switch Core */}
                    <g transform="translate(520, 235)">
                      <rect
                        x={-150}
                        y={-14}
                        width={300}
                        height={28}
                        rx={6}
                        fill="#450a0a"
                        stroke="#ef4444"
                        strokeWidth={1.5}
                        className="animate-pulse"
                      />
                      <text
                        x={0}
                        y={5}
                        textAnchor="middle"
                        fill="#fca5a5"
                        fontSize="9"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        CROSS-VLAN BLOCKED ✕ (Layer 2 Isolation)
                      </text>
                    </g>

                    {/* Unreachable Ping Badge */}
                    <g transform="translate(880, 235)">
                      <rect x={0} y={0} width={150} height={22} rx={4} fill="#18181b" stroke="#52525b" strokeWidth={1} />
                      <text x={75} y={15} textAnchor="middle" fill="#a1a1aa" fontSize="8.5" fontFamily="monospace">
                        PC3: 100% Packet Loss
                      </text>
                    </g>
                  </>
                )}

                {/* Step 5 / Recap: Four Rules of VLAN Segmentation */}
                {activeStepIndex === 5 && (
                  <g transform="translate(520, 410)">
                    <rect
                      x={-200}
                      y={-18}
                      width={400}
                      height={100}
                      rx={8}
                      fill="#070c14"
                      stroke="#818cf8"
                      strokeWidth={1.3}
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fill="#a5b4fc"
                      fontSize="9.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      THE 4 RULES OF VLAN SEGMENTATION
                    </text>
                    <g transform="translate(-185, 24)" fill="#cbd5e1" fontSize="8.5" fontFamily="monospace">
                      <text x={0} y={0}>1. DEFAULT: All ports start assigned to VLAN 1</text>
                      <text x={0} y={16}>2. ACCESS: Port assigned to one end device on one VLAN</text>
                      <text x={0} y={32}>3. BROADCAST: Confined strictly within the same VLAN</text>
                      <text x={0} y={48} fill="#34d399" fontWeight="600">
                        4. ISOLATION: Cross-VLAN requires a Layer 3 router (Day 12)
                      </text>
                      <text x={0} y={64} fill="#a78bfa" fontWeight="600">
                        Next: Day 11 · 802.1Q Trunks (VLANs across Switches)
                      </text>
                    </g>
                  </g>
                )}
              </>
);
