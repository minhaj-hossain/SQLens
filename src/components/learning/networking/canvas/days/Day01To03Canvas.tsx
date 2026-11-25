import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgWorkstation } from '../SvgWorkstation';
import { SvgSwitch } from '../SvgSwitch';
import { SvgCable } from '../SvgCable';

export const Day01To03Canvas: React.FC<DayCanvasProps> = ({ lastCommand, isPinging, pc3Ip, pc4Ip, showDay1DirectWire, showSwitch, showPC3, showPC4, showIps, showMacs, showSubnetLegend, wireGlow, isDirectPinging, isSwitchPinging, isPc3Subnet2, pc3Color }) => (
              <>
                {/* Day 1 Direct Wire: PC1 to PC2 */}
                {showDay1DirectWire && (
                  <SvgCable
                    x1={206}
                    y1={230}
                    x2={694}
                    y2={230}
                    glow={wireGlow}
                    color="#4ade80"
                    isTransmitting={isDirectPinging}
                  />
                )}

                {/* Switch Topologies */}
                {showSwitch && (
                  <g className="transition-opacity duration-500">
                    {/* PC1 to SW1 Port 1 */}
                    <SvgCable
                      x1={206}
                      y1={230}
                      x2={395}
                      y2={230}
                      glow={true}
                      color="#4ade80"
                      isTransmitting={isSwitchPinging && lastCommand.includes('192.168.1.')}
                    />

                    {/* PC2 to SW1 Port 2 */}
                    <SvgCable
                      x1={505}
                      y1={230}
                      x2={694}
                      y2={230}
                      glow={true}
                      color="#4ade80"
                      isTransmitting={isSwitchPinging && lastCommand.includes('192.168.1.20')}
                    />

                    {/* PC3 to SW1 Port 3 */}
                    {showPC3 && (
                      <SvgCable
                        x1={450}
                        y1={130}
                        x2={450}
                        y2={201}
                        glow={true}
                        color={isPc3Subnet2 ? '#4ade80' : '#60a5fa'}
                        isTransmitting={isSwitchPinging && lastCommand.includes(pc3Ip)}
                      />
                    )}

                    {/* PC4 to SW1 Port 4 */}
                    {showPC4 && (
                      <SvgCable
                        x1={450}
                        y1={259}
                        x2={450}
                        y2={330}
                        glow={true}
                        color="#4ade80"
                        isTransmitting={isSwitchPinging && lastCommand.includes(pc4Ip)}
                      />
                    )}
                  </g>
                )}

                {/* PC1 Workstation */}
                <SvgWorkstation
                  x={120}
                  y={194}
                  name="PC1"
                  ip="192.168.1.10"
                  mac="AA:BB:CC:00:00:01"
                  ipColor="blue"
                  showIp={showIps}
                  showMac={showMacs}
                  isLinked={wireGlow || showSwitch}
                  isPinging={isDirectPinging}
                />

                {/* PC2 Workstation */}
                <SvgWorkstation
                  x={694}
                  y={194}
                  name="PC2"
                  ip="192.168.1.20"
                  mac="AA:BB:CC:00:00:02"
                  ipColor="blue"
                  showIp={showIps}
                  showMac={showMacs}
                  isLinked={wireGlow || showSwitch}
                  isPinging={isDirectPinging}
                />

                {/* Central Ethernet Switch */}
                {showSwitch && (
                  <SvgSwitch
                    x={395}
                    y={201}
                    port1Active={true}
                    port2Active={true}
                    port3Active={showPC3}
                    port4Active={showPC4}
                    isPinging={isSwitchPinging}
                  />
                )}

                {/* PC3 (Top) */}
                {showPC3 && (
                  <SvgWorkstation
                    x={407}
                    y={50}
                    name="PC3"
                    ip={pc3Ip}
                    mac="AA:BB:CC:00:00:03"
                    ipColor={pc3Color}
                    showIp={showIps}
                    showMac={showMacs}
                    isLinked={true}
                  />
                )}

                {/* PC4 (Bottom) */}
                {showPC4 && (
                  <SvgWorkstation
                    x={407}
                    y={330}
                    name="PC4"
                    ip={pc4Ip}
                    mac="AA:BB:CC:00:00:04"
                    ipColor={pc4Ip.startsWith('192.168.1.') ? 'blue' : 'default'}
                    showIp={true}
                    showMac={false}
                    isLinked={true}
                  />
                )}

                {/* Subnet Legend on Day 3 */}
                {showSubnetLegend && (
                  <g transform="translate(300, 430)">
                    <rect
                      x="-10"
                      y="-14"
                      width="380"
                      height="28"
                      rx="14"
                      fill="#0d111a"
                      stroke="#1e293b"
                      strokeWidth="1.5"
                    />
                    <circle cx="20" cy="0" r="4.5" fill="#60a5fa" />
                    <text
                      x="32"
                      y="4"
                      fill="#60a5fa"
                      fontSize="11.5"
                      fontWeight="600"
                      fontFamily="ui-monospace, Menlo, Consolas, monospace"
                    >
                      Subnet 1 · 192.168.1.0/25
                    </text>
                    <circle cx="215" cy="0" r="4.5" fill="#4ade80" />
                    <text
                      x="227"
                      y="4"
                      fill="#4ade80"
                      fontSize="11.5"
                      fontWeight="600"
                      fontFamily="ui-monospace, Menlo, Consolas, monospace"
                    >
                      Subnet 2 · 192.168.1.128/25
                    </text>
                  </g>
                )}
              </>
);
