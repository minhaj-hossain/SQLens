import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgWorkstation } from '../SvgWorkstation';
import { SvgSwitch } from '../SvgSwitch';
import { SvgRouter } from '../SvgRouter';
import { SvgCable } from '../SvgCable';

export const Day04Canvas: React.FC<DayCanvasProps> = ({ activeStepIndex, isPinging, gateway, isSwitchPinging }) => (
              <>
                {/* Subnet Boundaries / Section Boxes */}
                {/* Subnet 1 Box */}
                <rect
                  x={40}
                  y={40}
                  width={420}
                  height={440}
                  rx={16}
                  fill="#0c121e"
                  fillOpacity="0.4"
                  stroke="#1e293b"
                  strokeDasharray="6 6"
                />
                <text
                  x={70}
                  y={75}
                  fill="#60a5fa"
                  fontSize="12.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  SUBNET 1 · 192.168.1.0/25
                </text>

                {/* Subnet 2 Box */}
                <rect
                  x={780}
                  y={40}
                  width={340}
                  height={440}
                  rx={16}
                  fill="#0a1510"
                  fillOpacity="0.4"
                  stroke="#1b382b"
                  strokeDasharray="6 6"
                />
                <text
                  x={810}
                  y={75}
                  fill="#4ade80"
                  fontSize="12.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  SUBNET 2 · 192.168.1.128/25
                </text>

                {/* Cables */}
                {/* PC1 to SW1 Port 1 */}
                <SvgCable
                  x1={166}
                  y1={146}
                  x2={280}
                  y2={220}
                  color="#4ade80"
                  isTransmitting={isSwitchPinging}
                />
                {/* PC2 to SW1 Port 2 */}
                <SvgCable
                  x1={166}
                  y1={336}
                  x2={280}
                  y2={250}
                  color="#4ade80"
                />
                {/* PC4 to SW1 Port 4 */}
                <SvgCable
                  x1={335}
                  y1={268}
                  x2={335}
                  y2={340}
                  color="#4ade80"
                />
                {/* SW1 Port 3 to Router R1 Port 1 */}
                <SvgCable
                  x1={390}
                  y1={235}
                  x2={530}
                  y2={235}
                  color="#4ade80"
                  isTransmitting={isSwitchPinging}
                />
                {/* Router R1 Port 2 to PC3 */}
                <SvgCable
                  x1={644}
                  y1={235}
                  x2={860}
                  y2={235}
                  color="#4ade80"
                  isTransmitting={isSwitchPinging}
                />

                {/* PC1 */}
                <SvgWorkstation
                  x={80}
                  y={110}
                  name="PC1"
                  ip="192.168.1.10"
                  ipColor="blue"
                  showIp={true}
                />
                {/* Gateway readout above PC1 */}
                {activeStepIndex >= 2 && (
                  <text
                    x={123}
                    y={98}
                    textAnchor="middle"
                    fill={gateway === 'none' ? '#ef4444' : '#60a5fa'}
                    fontSize="11"
                    fontFamily="ui-monospace, monospace"
                    fontWeight="600"
                  >
                    {gateway === 'none' ? 'no gateway' : `gw: ${gateway}`}
                  </text>
                )}

                {/* PC2 */}
                <SvgWorkstation
                  x={80}
                  y={300}
                  name="PC2"
                  ip="192.168.1.20"
                  ipColor="blue"
                  showIp={true}
                />

                {/* SW1 Switch */}
                <SvgSwitch
                  x={280}
                  y={210}
                  port1Active={true}
                  port2Active={true}
                  port3Active={true}
                  port4Active={true}
                />

                {/* PC4 */}
                <SvgWorkstation
                  x={292}
                  y={340}
                  name="PC4"
                  ip="192.168.1.40"
                  ipColor="blue"
                  showIp={true}
                />

                {/* Router R1 */}
                <SvgRouter
                  x={530}
                  y={201}
                  name="Router R1"
                  port1Ip={activeStepIndex >= 1 ? '192.168.1.1' : undefined}
                  port2Ip={activeStepIndex >= 1 ? '192.168.1.129' : undefined}
                  port1Active={true}
                  port2Active={true}
                  showPortIps={activeStepIndex >= 1}
                  isPinging={isSwitchPinging}
                />

                {/* PC3 in Subnet 2 */}
                <SvgWorkstation
                  x={860}
                  y={199}
                  name="PC3"
                  ip="192.168.1.130"
                  ipColor="green"
                  showIp={true}
                />
              </>
);
