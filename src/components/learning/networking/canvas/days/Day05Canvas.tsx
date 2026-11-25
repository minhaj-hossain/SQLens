import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgWorkstation } from '../SvgWorkstation';
import { SvgSwitch } from '../SvgSwitch';
import { SvgRouter } from '../SvgRouter';
import { SvgCable } from '../SvgCable';

export const Day05Canvas: React.FC<DayCanvasProps> = ({ activeStepIndex, isPinging, r1Route, r2Route, isSwitchPinging }) => (
              <>
                {/* Subnet 1 Box */}
                <rect
                  x={30}
                  y={40}
                  width={390}
                  height={490}
                  rx={16}
                  fill="#0c121e"
                  fillOpacity="0.4"
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
                  SUBNET 1 · 192.168.1.0/25
                </text>

                {/* Transit Network Label */}
                <text
                  x={675}
                  y={185}
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  TRANSIT LINK · 192.168.2.0/24
                </text>

                {/* Subnet 2 Box (Below R1) */}
                <rect
                  x={440}
                  y={340}
                  width={210}
                  height={190}
                  rx={12}
                  fill="#0a1510"
                  fillOpacity="0.4"
                  stroke="#1b382b"
                  strokeDasharray="6 6"
                />
                <text
                  x={460}
                  y={365}
                  fill="#4ade80"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  SUBNET 2 (PC3)
                </text>

                {/* Subnet 3 Box (PC5) */}
                <rect
                  x={980}
                  y={40}
                  width={340}
                  height={490}
                  rx={16}
                  fill="#0a1510"
                  fillOpacity="0.4"
                  stroke="#1b382b"
                  strokeDasharray="6 6"
                />
                <text
                  x={1010}
                  y={75}
                  fill="#4ade80"
                  fontSize="12.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  SUBNET 3 · 192.168.3.0/24
                </text>

                {/* Cables */}
                {/* PC1 to SW1 */}
                <SvgCable x1={156} y1={136} x2={260} y2={210} color="#4ade80" />
                {/* PC2 to SW1 */}
                <SvgCable x1={156} y1={336} x2={260} y2={240} color="#4ade80" />
                {/* PC4 to SW1 */}
                <SvgCable x1={315} y1={258} x2={315} y2={350} color="#4ade80" />
                {/* SW1 to R1 */}
                <SvgCable x1={370} y1={225} x2={480} y2={225} color="#4ade80" />
                {/* R1 Port 2 to PC3 */}
                <SvgCable x1={537} y1={269} x2={537} y2={385} color="#4ade80" />
                {/* R1 Port 3 to R2 Port 1 */}
                <SvgCable
                  x1={594}
                  y1={225}
                  x2={760}
                  y2={225}
                  color="#4ade80"
                  isTransmitting={isSwitchPinging}
                />
                {/* R2 Port 2 to PC5 */}
                {activeStepIndex >= 1 && (
                  <SvgCable
                    x1={874}
                    y1={225}
                    x2={1060}
                    y2={225}
                    color="#4ade80"
                    isTransmitting={isSwitchPinging && r1Route}
                  />
                )}

                {/* PC1 */}
                <SvgWorkstation x={70} y={100} name="PC1" ip="192.168.1.10" ipColor="blue" showIp={true} />
                <text x={113} y={88} textAnchor="middle" fill="#60a5fa" fontSize="10.5" fontFamily="monospace">
                  gw: 192.168.1.1
                </text>

                {/* PC2 */}
                <SvgWorkstation x={70} y={300} name="PC2" ip="192.168.1.20" ipColor="blue" showIp={true} />

                {/* Switch SW1 */}
                <SvgSwitch x={260} y={200} port1Active={true} port2Active={true} port3Active={true} port4Active={true} />

                {/* PC4 */}
                <SvgWorkstation x={272} y={350} name="PC4" ip="192.168.1.40" ipColor="blue" showIp={true} />

                {/* Router R1 */}
                <SvgRouter
                  x={480}
                  y={191}
                  name="Router R1"
                  port1Ip="192.168.1.1"
                  port2Ip="192.168.1.129"
                  port3Ip="192.168.2.1"
                  port1Active={true}
                  port2Active={true}
                  port3Active={true}
                  showPortIps={true}
                  staticRouteText={r1Route || activeStepIndex >= 3 ? '192.168.3.0/24 via 192.168.2.2' : undefined}
                  isPinging={isSwitchPinging}
                />

                {/* PC3 */}
                <SvgWorkstation x={494} y={385} name="PC3" ip="192.168.1.130" ipColor="green" showIp={true} />

                {/* Router R2 */}
                <SvgRouter
                  x={760}
                  y={191}
                  name="Router R2"
                  port1Ip="192.168.2.2"
                  port2Ip={activeStepIndex >= 1 ? '192.168.3.1' : 'no cable'}
                  port1Active={true}
                  port2Active={activeStepIndex >= 1}
                  port3Active={false}
                  showPortIps={true}
                  staticRouteText={r2Route || activeStepIndex >= 5 ? '192.168.1.0/24 via 192.168.2.1' : undefined}
                  isPinging={isSwitchPinging}
                />

                {/* PC5 */}
                {activeStepIndex >= 1 && (
                  <SvgWorkstation
                    x={1060}
                    y={189}
                    name="PC5"
                    ip="192.168.3.10"
                    ipColor="blue"
                    showIp={true}
                  />
                )}
              </>
);
