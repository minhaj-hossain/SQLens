import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgWorkstation } from '../SvgWorkstation';
import { SvgSwitch } from '../SvgSwitch';
import { SvgCable } from '../SvgCable';

export const Day08Canvas: React.FC<DayCanvasProps> = ({ activeStepIndex, completedSteps, lastCommand, isPinging, isSwitchPinging }) => (
              <>
                {/* Local Star Topology Container Box */}
                <rect
                  x={30}
                  y={25}
                  width={640}
                  height={470}
                  rx={16}
                  fill="#0c121e"
                  fillOpacity="0.45"
                  stroke="#1e293b"
                  strokeDasharray="6 6"
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
                  LOCAL STAR TOPOLOGY · SWITCH SW1 (SINGLE BROADCAST DOMAIN)
                </text>

                {/* Cables */}
                {/* PC1 to SW1 Port 1 */}
                <SvgCable
                  x1={206}
                  y1={234}
                  x2={450}
                  y2={234}
                  color="#4ade80"
                  isTransmitting={isSwitchPinging || activeStepIndex === 1 || activeStepIndex === 3}
                />
                {/* SW1 Port 2 to PC2 */}
                <SvgCable
                  x1={562}
                  y1={234}
                  x2={780}
                  y2={234}
                  color={activeStepIndex === 2 ? '#fbbf24' : '#4ade80'}
                  isTransmitting={isSwitchPinging || activeStepIndex === 2 || activeStepIndex === 3}
                />
                {/* SW1 Port 3 to PC3 */}
                <SvgCable
                  x1={506}
                  y1={97}
                  x2={506}
                  y2={210}
                  color={activeStepIndex === 2 ? '#fbbf24' : '#4ade80'}
                  isTransmitting={activeStepIndex === 2}
                />
                {/* SW1 Port 4 to PC4 */}
                <SvgCable
                  x1={506}
                  y1={258}
                  x2={506}
                  y2={375}
                  color={activeStepIndex === 2 ? '#fbbf24' : '#4ade80'}
                  isTransmitting={activeStepIndex === 2}
                />

                {/* PC1 (Left) */}
                <SvgWorkstation
                  x={120}
                  y={204}
                  name="PC1"
                  ip="192.168.1.10"
                  mac="AA:BB:CC:00:00:01"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* PC2 (Right) */}
                <SvgWorkstation
                  x={780}
                  y={204}
                  name="PC2"
                  ip="192.168.1.20"
                  mac="AA:BB:CC:00:00:02"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* PC3 (Top) */}
                <SvgWorkstation
                  x={463}
                  y={45}
                  name="PC3"
                  ip="192.168.1.30"
                  mac="AA:BB:CC:00:00:03"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* PC4 (Bottom) */}
                <SvgWorkstation
                  x={463}
                  y={375}
                  name="PC4"
                  ip="192.168.1.40"
                  mac="AA:BB:CC:00:00:04"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* Switch SW1 (Center) */}
                <SvgSwitch
                  x={450}
                  y={210}
                  port1Active={true}
                  port2Active={activeStepIndex >= 2}
                  port3Active={true}
                  port4Active={true}
                  isPinging={isSwitchPinging}
                />

                {/* Switch Port Number Labels */}
                <text
                  x={438}
                  y={238}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  P1
                </text>
                <text
                  x={574}
                  y={238}
                  textAnchor="start"
                  fill="#94a3b8"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  P2
                </text>
                <text
                  x={518}
                  y={204}
                  textAnchor="start"
                  fill="#94a3b8"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  P3
                </text>
                <text
                  x={518}
                  y={274}
                  textAnchor="start"
                  fill="#94a3b8"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  P4
                </text>

                {/* Interactive MAC Address Table HUD */}
                <g transform="translate(685, 25)">
                  <rect
                    width={330}
                    height={165}
                    rx={8}
                    fill="#080c14"
                    stroke="#27272a"
                    strokeWidth={1}
                  />
                  <rect
                    width={330}
                    height={26}
                    rx={8}
                    fill="#101726"
                  />
                  <text
                    x={12}
                    y={17}
                    fill="#38bdf8"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="monospace"
                    letterSpacing="0.05em"
                  >
                    MAC ADDRESS TABLE · SW1
                  </text>
                  <text
                    x={318}
                    y={17}
                    textAnchor="end"
                    fill="#71717a"
                    fontSize="9.5"
                    fontFamily="monospace"
                  >
                    {activeStepIndex === 0
                      ? '0 entries (empty)'
                      : activeStepIndex < 3
                      ? '1 learned entry'
                      : activeStepIndex === 4 && (completedSteps.has(4) || lastCommand.includes('clear'))
                      ? '0 entries (flushed)'
                      : '2 learned entries'}
                  </text>

                  {/* Column Header Titles */}
                  <g transform="translate(12, 42)">
                    <text x={0} y={0} fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="600">
                      PORT
                    </text>
                    <text x={65} y={0} fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="600">
                      MAC ADDRESS
                    </text>
                    <text x={190} y={0} fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="600">
                      TYPE
                    </text>
                    <text x={260} y={0} fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="600">
                      AGE
                    </text>
                    <line x1={0} y1={8} x2={306} y2={8} stroke="#1e293b" strokeWidth={1} />
                  </g>

                  {/* Table Contents based on Step */}
                  {activeStepIndex === 0 ? (
                    <g transform="translate(165, 95)">
                      <text
                        x={0}
                        y={0}
                        textAnchor="middle"
                        fill="#71717a"
                        fontSize="10.5"
                        fontFamily="monospace"
                        fontStyle="italic"
                      >
                        (0 entries learned · table empty)
                      </text>
                      <text
                        x={0}
                        y={20}
                        textAnchor="middle"
                        fill="#52525b"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        Awaiting ingress wire frames...
                      </text>
                    </g>
                  ) : activeStepIndex === 1 || activeStepIndex === 2 ? (
                    <g transform="translate(12, 72)">
                      {/* Row 1: Port 1 */}
                      <rect x={-4} y={-10} width={314} height={20} rx={4} fill="#052e16" fillOpacity="0.3" stroke="#22c55e" strokeWidth={0.8} />
                      <circle cx={4} cy={0} r={2.5} fill="#4ade80" />
                      <text x={12} y={3} fill="#4ade80" fontSize="10" fontFamily="monospace" fontWeight="600">
                        Port 1
                      </text>
                      <text x={65} y={3} fill="#f1f5f9" fontSize="10" fontFamily="monospace">
                        AA:BB:CC:00:00:01
                      </text>
                      <text x={190} y={3} fill="#94a3b8" fontSize="9.5" fontFamily="monospace">
                        DYNAMIC
                      </text>
                      <text x={260} y={3} fill="#38bdf8" fontSize="9.5" fontFamily="monospace">
                        298s
                      </text>

                      {/* Unlearned row */}
                      <text x={12} y={30} fill="#52525b" fontSize="9.5" fontFamily="monospace" fontStyle="italic">
                        Port 2..4: (not yet learned · unmapped)
                      </text>

                      {/* Step 2 indicator */}
                      {activeStepIndex === 2 && (
                        <g transform="translate(0, 52)">
                          <rect x={-4} y={-8} width={314} height={22} rx={4} fill="#451a03" fillOpacity="0.4" stroke="#f59e0b" strokeWidth={0.8} />
                          <text x={6} y={6} fill="#fbbf24" fontSize="9.5" fontFamily="monospace" fontWeight="600">
                            Lookup DA ..00:00:02 ➔ UNKNOWN FLOOD
                          </text>
                        </g>
                      )}
                    </g>
                  ) : activeStepIndex === 4 && (completedSteps.has(4) || lastCommand.includes('clear')) ? (
                    <g transform="translate(165, 95)">
                      <text
                        x={0}
                        y={0}
                        textAnchor="middle"
                        fill="#fbbf24"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        TABLE FLUSHED (0 ENTRIES)
                      </text>
                      <text
                        x={0}
                        y={18}
                        textAnchor="middle"
                        fill="#71717a"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        All dynamic MAC mappings purged
                      </text>
                    </g>
                  ) : (
                    <g transform="translate(12, 70)">
                      {/* Row 1: Port 1 */}
                      <circle cx={4} cy={0} r={2.5} fill="#4ade80" />
                      <text x={12} y={3} fill="#4ade80" fontSize="10" fontFamily="monospace" fontWeight="600">
                        Port 1
                      </text>
                      <text x={65} y={3} fill="#f1f5f9" fontSize="10" fontFamily="monospace">
                        AA:BB:CC:00:00:01
                      </text>
                      <text x={190} y={3} fill="#94a3b8" fontSize="9.5" fontFamily="monospace">
                        DYNAMIC
                      </text>
                      <text x={260} y={3} fill="#38bdf8" fontSize="9.5" fontFamily="monospace">
                        {activeStepIndex === 4 ? '184s' : '284s'}
                      </text>

                      {/* Row 2: Port 2 */}
                      <circle cx={4} cy={24} r={2.5} fill="#4ade80" />
                      <text x={12} y={27} fill="#4ade80" fontSize="10" fontFamily="monospace" fontWeight="600">
                        Port 2
                      </text>
                      <text x={65} y={27} fill="#f1f5f9" fontSize="10" fontFamily="monospace">
                        AA:BB:CC:00:00:02
                      </text>
                      <text x={190} y={27} fill="#94a3b8" fontSize="9.5" fontFamily="monospace">
                        DYNAMIC
                      </text>
                      <text x={260} y={27} fill="#38bdf8" fontSize="9.5" fontFamily="monospace">
                        {activeStepIndex === 4 ? '212s' : '300s'}
                      </text>

                      {/* Quiet note */}
                      <text x={12} y={54} fill="#52525b" fontSize="9" fontFamily="monospace">
                        Ports 3 & 4: quiet · 0 frames forwarded
                      </text>
                    </g>
                  )}
                </g>

                {/* Step 1: Ingress Source MAC Learning Callout */}
                {activeStepIndex === 1 && (
                  <g transform="translate(328, 175)">
                    <rect
                      x={-115}
                      y={-13}
                      width={230}
                      height={26}
                      rx={6}
                      fill="#062e1e"
                      stroke="#4ade80"
                      strokeWidth={1.5}
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fill="#4ade80"
                      fontSize="9.5"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      Ingress Port 1 ➔ Learn Source MAC
                    </text>
                  </g>
                )}

                {/* Step 2: Unknown Unicast Flooding Callouts */}
                {activeStepIndex === 2 && (
                  <>
                    {/* Switch Flood Action Pill */}
                    <g transform="translate(506, 175)">
                      <rect
                        x={-130}
                        y={-13}
                        width={260}
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
                        UNKNOWN UNICAST FLOOD ➔ Ports 2, 3, 4
                      </text>
                    </g>

                    {/* PC3 Drop Badge */}
                    <g transform="translate(585, 60)">
                      <rect x={-75} y={-11} width={150} height={22} rx={4} fill="#271010" stroke="#ef4444" strokeWidth={1} />
                      <text x={0} y={4} textAnchor="middle" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="600">
                        PC3: DA Mismatch ➔ Discard ✕
                      </text>
                    </g>

                    {/* PC4 Drop Badge */}
                    <g transform="translate(615, 395)">
                      <rect x={-80} y={-11} width={160} height={22} rx={4} fill="#271010" stroke="#ef4444" strokeWidth={1} />
                      <text x={0} y={4} textAnchor="middle" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="600">
                        PC4: DA Mismatch ➔ Discard ✕
                      </text>
                    </g>

                    {/* PC2 Accept Badge */}
                    <g transform="translate(818, 172)">
                      <rect x={-80} y={-11} width={160} height={22} rx={4} fill="#062e1e" stroke="#4ade80" strokeWidth={1} />
                      <text x={0} y={4} textAnchor="middle" fill="#4ade80" fontSize="9" fontFamily="monospace" fontWeight="600">
                        PC2: DA Matched ➔ Accept ✓
                      </text>
                    </g>
                  </>
                )}

                {/* Step 3: Selective Forwarding Callout */}
                {activeStepIndex === 3 && (
                  <>
                    <g transform="translate(506, 175)">
                      <rect
                        x={-135}
                        y={-13}
                        width={270}
                        height={26}
                        rx={6}
                        fill="#062e1e"
                        stroke="#4ade80"
                        strokeWidth={1.5}
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill="#4ade80"
                        fontSize="9.5"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        SELECTIVE POINT-TO-POINT (P2 ➔ P1)
                      </text>
                    </g>

                    {/* PC3 & PC4 Quiet Indicators */}
                    <g transform="translate(506, 130)">
                      <text x={0} y={0} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace" fontStyle="italic">
                        Wire to PC3 is silent (filtered)
                      </text>
                    </g>
                    <g transform="translate(506, 320)">
                      <text x={0} y={0} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace" fontStyle="italic">
                        Wire to PC4 is silent (filtered)
                      </text>
                    </g>
                  </>
                )}

                {/* Step 4: Aging & Timer Info Callout */}
                {activeStepIndex === 4 && (
                  <g transform="translate(685, 345)">
                    <rect
                      width={330}
                      height={40}
                      rx={6}
                      fill="#141026"
                      stroke="#8b5cf6"
                      strokeWidth={1}
                    />
                    <text
                      x={12}
                      y={16}
                      fill="#c4b5fd"
                      fontSize="9.5"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      AGING TIMER: 300 SECONDS INACTIVITY TIMEOUT
                    </text>
                    <text
                      x={12}
                      y={30}
                      fill="#94a3b8"
                      fontSize="8.5"
                      fontFamily="monospace"
                    >
                      Protects against stale delivery when cables move or PCs disconnect.
                    </text>
                  </g>
                )}

                {/* Step 5 / Recap: Four Principles of Switching */}
                {activeStepIndex === 5 && (
                  <g transform="translate(685, 335)">
                    <rect
                      width={330}
                      height={130}
                      rx={8}
                      fill="#0b1320"
                      stroke="#38bdf8"
                      strokeWidth={1}
                    />
                    <text
                      x={12}
                      y={20}
                      fill="#38bdf8"
                      fontSize="10"
                      fontWeight="700"
                      fontFamily="monospace"
                      letterSpacing="0.04em"
                    >
                      THE 4 PRINCIPLES OF ETHERNET SWITCHING
                    </text>
                    <g transform="translate(12, 38)" fill="#e2e8f0" fontSize="9" fontFamily="monospace">
                      <text x={0} y={0} fill="#4ade80">1. LEARN:</text>
                      <text x={65} y={0} fill="#cbd5e1">Source MAC on frame arrival</text>

                      <text x={0} y={20} fill="#4ade80">2. FORWARD:</text>
                      <text x={65} y={20} fill="#cbd5e1">Lookup Dest MAC in table</text>

                      <text x={0} y={40} fill="#fbbf24">3. UNKNOWN:</text>
                      <text x={65} y={40} fill="#cbd5e1">Flood all non-ingress ports</text>

                      <text x={0} y={60} fill="#a78bfa">4. AGING:</text>
                      <text x={65} y={60} fill="#cbd5e1">Flush stale entries after 300s</text>
                    </g>
                  </g>
                )}
              </>
);
