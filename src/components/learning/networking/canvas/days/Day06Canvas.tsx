import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgWorkstation } from '../SvgWorkstation';
import { SvgSwitch } from '../SvgSwitch';
import { SvgRouter } from '../SvgRouter';
import { SvgCable } from '../SvgCable';

export const Day06Canvas: React.FC<DayCanvasProps> = ({ activeStepIndex, lastCommand, isPinging, r1DefaultRoute, r2DefaultRoute, isSwitchPinging }) => (
              <>
                {/* Global Internet Upper Tier Box */}
                <rect
                  x={640}
                  y={30}
                  width={560}
                  height={150}
                  rx={16}
                  fill="#0c182a"
                  fillOpacity="0.4"
                  stroke="#1d3858"
                  strokeDasharray="6 6"
                />
                <text
                  x={670}
                  y={58}
                  fill="#60a5fa"
                  fontSize="12.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  GLOBAL INTERNET · 203.0.113.0/24 &amp; 198.51.100.0/24
                </text>

                {/* Public link label */}
                <text
                  x={620}
                  y={150}
                  textAnchor="middle"
                  fill="#60a5fa"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  Public 203.0.113.0/24
                </text>

                {/* Cables */}
                {/* PC1 to SW1 */}
                <SvgCable x1={156} y1={246} x2={260} y2={320} color="#4ade80" />
                {/* PC2 to SW1 */}
                <SvgCable x1={156} y1={446} x2={260} y2={350} color="#4ade80" />
                {/* PC4 to SW1 */}
                <SvgCable x1={315} y1={368} x2={315} y2={450} color="#4ade80" />
                {/* SW1 to R1 */}
                <SvgCable
                  x1={370}
                  y1={335}
                  x2={480}
                  y2={335}
                  color="#4ade80"
                  isTransmitting={isSwitchPinging}
                />
                {/* R1 Port 2 to PC3 */}
                <SvgCable x1={537} y1={379} x2={537} y2={470} color="#4ade80" />
                {/* R1 Port 3 to R2 Port 1 */}
                <SvgCable x1={594} y1={335} x2={780} y2={335} color="#4ade80" />
                {/* R2 Port 2 to PC5 */}
                <SvgCable x1={894} y1={335} x2={1080} y2={335} color="#4ade80" />

                {/* Public Outside Cables: R1 Port 4 to Router ISP Port 1 */}
                <SvgCable
                  x1={550}
                  y1={301}
                  x2={710}
                  y2={110}
                  color="#60a5fa"
                  isTransmitting={isSwitchPinging && (lastCommand.includes('198.51.100.') || r1DefaultRoute)}
                />

                {/* Router ISP to Web Server */}
                {activeStepIndex >= 1 && (
                  <SvgCable
                    x1={824}
                    y1={104}
                    x2={1040}
                    y2={104}
                    color="#60a5fa"
                    isTransmitting={isSwitchPinging && r1DefaultRoute}
                  />
                )}

                {/* Lower Tier Devices */}
                {/* PC1 */}
                <SvgWorkstation x={70} y={210} name="PC1" ip="192.168.1.10" ipColor="blue" showIp={true} />
                <text x={113} y={198} textAnchor="middle" fill="#60a5fa" fontSize="10.5" fontFamily="monospace">
                  gw: 192.168.1.1
                </text>

                {/* PC2 */}
                <SvgWorkstation x={70} y={410} name="PC2" ip="192.168.1.20" ipColor="blue" showIp={true} />

                {/* Switch SW1 */}
                <SvgSwitch x={260} y={310} port1Active={true} port2Active={true} port3Active={true} port4Active={true} />

                {/* PC4 */}
                <SvgWorkstation x={272} y={450} name="PC4" ip="192.168.1.40" ipColor="blue" showIp={true} />

                {/* Router R1 (Edge Router) */}
                <SvgRouter
                  x={480}
                  y={301}
                  name="Router R1"
                  port1Ip="192.168.1.1"
                  port2Ip="192.168.1.129"
                  port3Ip="203.0.113.2"
                  port1Active={true}
                  port2Active={true}
                  port3Active={true}
                  showPortIps={true}
                  staticRouteText={r1DefaultRoute || activeStepIndex >= 2 ? '0.0.0.0/0 via 203.0.113.1' : undefined}
                  isPinging={isSwitchPinging}
                />

                {/* PC3 */}
                <SvgWorkstation x={494} y={470} name="PC3" ip="192.168.1.130" ipColor="green" showIp={true} />

                {/* Router R2 (Internal Router) */}
                <SvgRouter
                  x={780}
                  y={301}
                  name="Router R2"
                  port1Ip="192.168.2.2"
                  port2Ip="192.168.3.1"
                  port1Active={true}
                  port2Active={true}
                  port3Active={false}
                  showPortIps={true}
                  staticRouteText={r2DefaultRoute || activeStepIndex >= 4 ? '0.0.0.0/0 via 192.168.2.1' : undefined}
                  isPinging={isSwitchPinging}
                />

                {/* PC5 */}
                <SvgWorkstation x={1080} y={299} name="PC5" ip="192.168.3.10" ipColor="blue" showIp={true} />

                {/* Upper Tier Devices */}
                {/* Router ISP */}
                <SvgRouter
                  x={710}
                  y={70}
                  name="Router ISP"
                  port1Ip="203.0.113.1"
                  port2Ip={activeStepIndex >= 1 ? '198.51.100.1' : undefined}
                  port1Active={true}
                  port2Active={activeStepIndex >= 1}
                  port3Active={false}
                  showPortIps={true}
                  isPinging={isSwitchPinging && r1DefaultRoute}
                />

                {/* Web Server */}
                {activeStepIndex >= 1 && (
                  <SvgWorkstation
                    x={1040}
                    y={68}
                    name="Web Server"
                    ip="198.51.100.10"
                    ipColor="green"
                    showIp={true}
                  />
                )}
              </>
);
