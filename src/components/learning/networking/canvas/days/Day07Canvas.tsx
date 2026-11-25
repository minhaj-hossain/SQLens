import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgWorkstation } from '../SvgWorkstation';
import { SvgSwitch } from '../SvgSwitch';
import { SvgRouter } from '../SvgRouter';
import { SvgCable } from '../SvgCable';

export const Day07Canvas: React.FC<DayCanvasProps> = ({ activeStepIndex, lastCommand, isPinging, gateway, isSwitchPinging }) => (
              <>
                {/* Local Subnet 1 Container Box */}
                <rect
                  x={30}
                  y={40}
                  width={490}
                  height={450}
                  rx={16}
                  fill="#0c121e"
                  fillOpacity="0.45"
                  stroke="#1e293b"
                  strokeDasharray="6 6"
                />
                <text
                  x={60}
                  y={75}
                  fill="#60a5fa"
                  fontSize="12.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  LOCAL SUBNET 1 · 192.168.1.0/24 (BROADCAST DOMAIN)
                </text>

                {/* Distant Subnet 3 Container Box */}
                <rect
                  x={750}
                  y={40}
                  width={380}
                  height={450}
                  rx={16}
                  fill="#0a1510"
                  fillOpacity="0.4"
                  stroke="#1b382b"
                  strokeDasharray="6 6"
                />
                <text
                  x={780}
                  y={75}
                  fill="#4ade80"
                  fontSize="12.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  DISTANT SUBNET 3 · 192.168.3.0/24
                </text>

                {/* Cables */}
                {/* PC1 to SW1 Port 1 */}
                <SvgCable
                  x1={156}
                  y1={146}
                  x2={280}
                  y2={220}
                  color="#4ade80"
                  isTransmitting={isSwitchPinging}
                />
                {/* PC2 to SW1 Port 2 */}
                <SvgCable
                  x1={156}
                  y1={356}
                  x2={280}
                  y2={250}
                  color="#4ade80"
                  isTransmitting={isSwitchPinging && (lastCommand.includes('192.168.1.20') || activeStepIndex === 2)}
                />
                {/* SW1 Port 3 to Router R1 Port 1 */}
                <SvgCable
                  x1={390}
                  y1={235}
                  x2={540}
                  y2={235}
                  color="#4ade80"
                  isTransmitting={isSwitchPinging && (lastCommand.includes('192.168.3.10') || activeStepIndex >= 4)}
                />
                {/* Router R1 Port 2 to PC5 */}
                <SvgCable
                  x1={654}
                  y1={235}
                  x2={840}
                  y2={235}
                  color="#4ade80"
                  isTransmitting={isSwitchPinging && lastCommand.includes('192.168.3.10')}
                />

                {/* PC1 */}
                <SvgWorkstation
                  x={70}
                  y={110}
                  name="PC1"
                  ip="192.168.1.10"
                  mac="AA:BB:CC:00:00:01"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* PC2 */}
                <SvgWorkstation
                  x={70}
                  y={320}
                  name="PC2"
                  ip="192.168.1.20"
                  mac="AA:BB:CC:00:00:02"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* Switch SW1 */}
                <SvgSwitch
                  x={280}
                  y={210}
                  port1Active={true}
                  port2Active={true}
                  port3Active={true}
                  port4Active={false}
                />

                {/* Router R1 */}
                <SvgRouter
                  x={540}
                  y={201}
                  name="Router R1"
                  port1Ip="192.168.1.1"
                  port2Ip="192.168.3.1"
                  port1Active={true}
                  port2Active={true}
                  showPortIps={true}
                  isPinging={isSwitchPinging}
                />
                {/* Router R1 Port 1 MAC label */}
                <text
                  x={597}
                  y={188}
                  textAnchor="middle"
                  fill="#a1a1aa"
                  fontSize="10"
                  fontFamily="ui-monospace, monospace"
                >
                  P1 MAC: AA:BB:CC:00:A1:01
                </text>

                {/* Distant PC5 */}
                <SvgWorkstation
                  x={840}
                  y={199}
                  name="PC5"
                  ip="192.168.3.10"
                  mac="AA:BB:CC:00:00:05"
                  ipColor="green"
                  showIp={true}
                  showMac={true}
                />

                {/* Interactive ARP Cache Table HUD under PC1 */}
                <g transform="translate(60, 205)">
                  <rect
                    width={200}
                    height={98}
                    rx={8}
                    fill="#080c14"
                    stroke="#27272a"
                    strokeWidth={1}
                  />
                  <rect
                    width={200}
                    height={22}
                    rx={8}
                    fill="#101726"
                  />
                  <text
                    x={10}
                    y={15}
                    fill="#38bdf8"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="ui-monospace, monospace"
                    letterSpacing="0.05em"
                  >
                    ARP CACHE · PC1
                  </text>
                  <text
                    x={190}
                    y={15}
                    textAnchor="end"
                    fill="#71717a"
                    fontSize="9.5"
                    fontFamily="monospace"
                  >
                    {activeStepIndex === 0
                      ? '0 entries'
                      : activeStepIndex < 4
                      ? '1 entry'
                      : '2 entries'}
                  </text>

                  {/* Table Contents based on Step */}
                  {activeStepIndex === 0 ? (
                    <text
                      x={100}
                      y={60}
                      textAnchor="middle"
                      fill="#71717a"
                      fontSize="10.5"
                      fontFamily="monospace"
                      fontStyle="italic"
                    >
                      (empty · no entries learned)
                    </text>
                  ) : activeStepIndex === 1 ? (
                    <g>
                      <text
                        x={100}
                        y={50}
                        textAnchor="middle"
                        fill="#fbbf24"
                        fontSize="10.5"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        Searching FF:FF:FF:FF:FF:FF
                      </text>
                      <text
                        x={100}
                        y={68}
                        textAnchor="middle"
                        fill="#71717a"
                        fontSize="9.5"
                        fontFamily="monospace"
                      >
                        Who has 192.168.1.20?
                      </text>
                    </g>
                  ) : (
                    <g>
                      {/* Entry 1: PC2 */}
                      <g transform="translate(10, 38)">
                        <circle cx={4} cy={-3} r={2.5} fill="#4ade80" />
                        <text x={12} y={0} fill="#f1f5f9" fontSize="10" fontFamily="monospace" fontWeight="500">
                          192.168.1.20
                        </text>
                        <text x={95} y={0} fill="#4ade80" fontSize="9.5" fontFamily="monospace">
                          ..00:00:02
                        </text>
                        <text x={175} y={0} textAnchor="end" fill="#71717a" fontSize="9" fontFamily="monospace">
                          14s
                        </text>
                      </g>

                      {/* Entry 2: Router R1 (Step 4+) */}
                      {activeStepIndex >= 4 ? (
                        <g transform="translate(10, 58)">
                          <circle cx={4} cy={-3} r={2.5} fill="#60a5fa" />
                          <text x={12} y={0} fill="#f1f5f9" fontSize="10" fontFamily="monospace" fontWeight="500">
                            192.168.1.1
                          </text>
                          <text x={95} y={0} fill="#60a5fa" fontSize="9.5" fontFamily="monospace">
                            ..00:A1:01
                          </text>
                          <text x={175} y={0} textAnchor="end" fill="#71717a" fontSize="9" fontFamily="monospace">
                            4s
                          </text>
                        </g>
                      ) : (
                        <text x={10} y={60} fill="#52525b" fontSize="9" fontFamily="monospace" fontStyle="italic">
                          + awaiting gateway...
                        </text>
                      )}

                      {/* Distant Host Note (Step 4+) */}
                      {activeStepIndex >= 4 && (
                        <text x={10} y={84} fill="#a1a1aa" fontSize="8.5" fontFamily="monospace">
                          * 192.168.3.10 routed via R1
                        </text>
                      )}
                    </g>
                  )}
                </g>

                {/* Animated ARP Broadcast Callout (Step 1 / debug arp on) */}
                {(activeStepIndex === 1 || lastCommand === 'debug arp on') && (
                  <g transform="translate(345, 150)">
                    <rect
                      x={-110}
                      y={-14}
                      width={220}
                      height={26}
                      rx={6}
                      fill="#1c1917"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      className="animate-pulse"
                    />
                    <text
                      x={0}
                      y={3}
                      textAnchor="middle"
                      fill="#fbbf24"
                      fontSize="10"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      ARP Request ➔ FF:FF:FF:FF:FF:FF
                    </text>
                  </g>
                )}

                {/* Animated ARP Reply Callout (Step 2 / ping 192.168.1.20) */}
                {(activeStepIndex === 2 || lastCommand === 'ping 192.168.1.20') && (
                  <g transform="translate(370, 295)">
                    <rect
                      x={-100}
                      y={-14}
                      width={200}
                      height={26}
                      rx={6}
                      fill="#062e1e"
                      stroke="#4ade80"
                      strokeWidth={1.5}
                    />
                    <text
                      x={0}
                      y={3}
                      textAnchor="middle"
                      fill="#4ade80"
                      fontSize="9.5"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      ARP Reply: ..00:00:02 to PC1
                    </text>
                  </g>
                )}

                {/* Animated Gateway ARP Callout (Step 4 / ping 192.168.3.10) */}
                {(activeStepIndex === 4 || lastCommand === 'ping 192.168.3.10') && (
                  <g transform="translate(460, 160)">
                    <rect
                      x={-105}
                      y={-14}
                      width={210}
                      height={26}
                      rx={6}
                      fill="#0b243b"
                      stroke="#38bdf8"
                      strokeWidth={1.5}
                    />
                    <text
                      x={0}
                      y={3}
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="9.5"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      Gateway MAC: AA:BB:CC:00:A1:01
                    </text>
                  </g>
                )}
              </>
);
