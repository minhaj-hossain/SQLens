'use client';

import React from 'react';
import { SvgWorkstation } from './SvgWorkstation';
import { SvgSwitch } from './SvgSwitch';
import { SvgRouter } from './SvgRouter';
import { SvgCable } from './SvgCable';

interface NetworkingCanvasProps {
  dayId: string; // 'net-01' | 'net-02' | 'net-03' | 'net-04' | 'net-05'
  activeStepIndex: number;
  completedSteps: Set<number>;
  lastCommand?: string;
  isPinging?: boolean;
  pc3Ip?: string;
  pc4Ip?: string;
  isLinkUp?: boolean;
  gateway?: string;
  r1Route?: boolean;
  r2Route?: boolean;
  r1DefaultRoute?: boolean;
  r2DefaultRoute?: boolean;
}

export const NetworkingCanvas: React.FC<NetworkingCanvasProps> = ({
  dayId,
  activeStepIndex,
  completedSteps,
  lastCommand = '',
  isPinging = false,
  pc3Ip = '192.168.1.30',
  pc4Ip = '192.168.2.10',
  isLinkUp = true,
  gateway = '192.168.1.1',
  r1Route = false,
  r2Route = false,
  r1DefaultRoute = false,
  r2DefaultRoute = false,
}) => {
  const isDay1 = dayId === 'net-01';
  const isDay2 = dayId === 'net-02';
  const isDay3 = dayId === 'net-03';
  const isDay4 = dayId === 'net-04';
  const isDay5 = dayId === 'net-05';
  const isDay6 = dayId === 'net-06';

  // Day 1 Progressive reveals
  const showDay1DirectWire = isDay1 && activeStepIndex < 4;
  const showSwitch = !isDay1 || activeStepIndex >= 4;
  const showPC3 = !isDay1 || activeStepIndex >= 4;
  const showPC4 = (isDay2 && activeStepIndex >= 2) || isDay4 || isDay5;

  const showIps = !isDay1 || activeStepIndex >= 1;
  const showMacs = (!isDay1 && !isDay4 && !isDay5) || activeStepIndex >= 3;
  const showSubnetLegend = isDay3 && activeStepIndex >= 1;

  // Day 1 link status glow
  const wireGlow =
    isDay1 && (activeStepIndex === 0 || completedSteps.has(0) || isLinkUp);

  // Ping transmitting animation
  const isDirectPinging =
    isDay1 && (activeStepIndex === 2 || isPinging || lastCommand.startsWith('ping'));
  const isSwitchPinging =
    !isDay1 && (isPinging || lastCommand.startsWith('ping'));

  // Day 3 Subnet color logic
  const isPc3Subnet2 =
    isDay3 && (pc3Ip === '192.168.1.130' || activeStepIndex >= 3);
  const pc3Color = isPc3Subnet2 || isDay4 || isDay5 || isDay6 ? 'green' : 'blue';

  return (
    <div className="w-full h-full flex flex-col bg-[#0d0d10] relative select-none overflow-hidden rounded-t-xl md:rounded-l-xl md:rounded-tr-none border-b md:border-b-0 md:border-r border-[#26262b]">
      {/* Canvas Header / Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#26262b] bg-[#141416] text-[11px] font-mono tracking-wider uppercase text-[#9a9aa5]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></span>
          <span>PHYSICAL WORKBENCH</span>
        </div>
        <div className="text-[10px] text-[#62626d]">
          {isDay1 && activeStepIndex < 4
            ? 'DIRECT POINT-TO-POINT LINK'
            : isDay4
            ? 'ROUTER CONNECTING TWO SUBNETS'
            : isDay5
            ? 'MULTI-ROUTER STATIC ROUTES TOPOLOGY'
            : isDay6
            ? 'THE DEFAULT ROUTE & GLOBAL INTERNET ACCESS (0.0.0.0/0)'
            : showPC4
            ? '4-NODE LOCAL STAR TOPOLOGY'
            : '3-NODE SWITCH TOPOLOGY'}
        </div>
      </div>

      {/* Main SVG Stage */}
      <div className="flex-1 w-full min-h-0 flex items-center justify-center p-2">
        <svg
          viewBox="0 0 740 310"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full max-h-[300px]"
        >
          {/* Subtle Grid Pattern */}
          <defs>
            <pattern
              id="stage-grid"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="12" cy="12" r="0.75" fill="#23232a" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#stage-grid)" opacity="0.6" />

          {/* =================================================== */}
          {/* DAY 1 - DAY 3 TOPOLOGIES */}
          {/* =================================================== */}
          {(isDay1 || isDay2 || isDay3) && (
            <>
              {/* Day 1 Direct Wire: PC1 to PC2 */}
              {showDay1DirectWire && (
                <SvgCable
                  x1={146}
                  y1={150}
                  x2={594}
                  y2={150}
                  glow={wireGlow}
                  color="#4ade80"
                  isTransmitting={isDirectPinging}
                />
              )}

              {/* Switch Topologies */}
              {showSwitch && (
                <g className="transition-opacity duration-500">
                  <SvgCable
                    x1={146}
                    y1={150}
                    x2={326}
                    y2={150}
                    glow={true}
                    color="#4ade80"
                    isTransmitting={isSwitchPinging && lastCommand.includes('192.168.1.')}
                  />

                  <SvgCable
                    x1={434}
                    y1={150}
                    x2={594}
                    y2={150}
                    glow={true}
                    color="#4ade80"
                    isTransmitting={isSwitchPinging && lastCommand.includes('192.168.1.20')}
                  />

                  {showPC3 && (
                    <SvgCable
                      x1={380}
                      y1={82}
                      x2={380}
                      y2={126}
                      glow={true}
                      color={isPc3Subnet2 ? '#4ade80' : '#60a5fa'}
                      isTransmitting={isSwitchPinging && lastCommand.includes(pc3Ip)}
                    />
                  )}

                  {showPC4 && (
                    <SvgCable
                      x1={380}
                      y1={184}
                      x2={380}
                      y2={220}
                      glow={true}
                      color="#4ade80"
                      isTransmitting={isSwitchPinging && lastCommand.includes(pc4Ip)}
                    />
                  )}
                </g>
              )}

              {/* Devices */}
              <SvgWorkstation
                x={60}
                y={114}
                name="PC1"
                ip="192.168.1.10"
                mac="AA:BB:CC:00:00:01"
                ipColor="blue"
                showIp={showIps}
                showMac={showMacs}
                isLinked={wireGlow || showSwitch}
                isPinging={isDirectPinging}
              />

              <SvgWorkstation
                x={594}
                y={114}
                name="PC2"
                ip="192.168.1.20"
                mac="AA:BB:CC:00:00:02"
                ipColor="blue"
                showIp={showIps}
                showMac={showMacs}
                isLinked={wireGlow || showSwitch}
                isPinging={isDirectPinging}
              />

              {showSwitch && (
                <SvgSwitch
                  x={325}
                  y={124}
                  port1Active={true}
                  port2Active={true}
                  port3Active={showPC3}
                  port4Active={showPC4}
                  isPinging={isSwitchPinging}
                />
              )}

              {showPC3 && (
                <SvgWorkstation
                  x={337}
                  y={10}
                  name="PC3"
                  ip={pc3Ip}
                  mac="AA:BB:CC:00:00:03"
                  ipColor={pc3Color}
                  showIp={showIps}
                  showMac={showMacs}
                  isLinked={true}
                />
              )}

              {showPC4 && (
                <SvgWorkstation
                  x={337}
                  y={220}
                  name="PC4"
                  ip={pc4Ip}
                  mac="AA:BB:CC:00:00:04"
                  ipColor={pc4Ip.startsWith('192.168.1.') ? 'blue' : 'default'}
                  showIp={true}
                  showMac={false}
                  isLinked={true}
                />
              )}

              {showSubnetLegend && (
                <g transform="translate(200, 290)">
                  <rect
                    x="-10"
                    y="-14"
                    width="360"
                    height="24"
                    rx="12"
                    fill="#141417"
                    stroke="#2a2a32"
                    strokeWidth="1"
                  />
                  <circle cx="16" cy="-2" r="4" fill="#60a5fa" />
                  <text
                    x="26"
                    y="2"
                    fill="#60a5fa"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="ui-monospace, Menlo, Consolas, monospace"
                  >
                    Subnet 1 · 192.168.1.0/25
                  </text>
                  <circle cx="204" cy="-2" r="4" fill="#4ade80" />
                  <text
                    x="214"
                    y="2"
                    fill="#4ade80"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="ui-monospace, Menlo, Consolas, monospace"
                  >
                    Subnet 2 · 192.168.1.128/25
                  </text>
                </g>
              )}
            </>
          )}

          {/* =================================================== */}
          {/* DAY 4: THE ROUTER CONNECTING TWO SUBNETS */}
          {/* =================================================== */}
          {isDay4 && (
            <>
              {/* Cables */}
              {/* PC1 to SW1 */}
              <SvgCable x1={116} y1={76} x2={190} y2={145} color="#4ade80" isTransmitting={isSwitchPinging} />
              {/* PC2 to SW1 */}
              <SvgCable x1={116} y1={216} x2={190} y2={165} color="#4ade80" />
              {/* PC4 to SW1 */}
              <SvgCable x1={220} y1={175} x2={220} y2={215} color="#4ade80" />
              {/* SW1 to R1 Port 1 */}
              <SvgCable x1={250} y1={150} x2={330} y2={150} color="#4ade80" isTransmitting={isSwitchPinging} />
              {/* R1 Port 2 to PC3 */}
              <SvgCable x1={444} y1={150} x2={580} y2={150} color="#4ade80" isTransmitting={isSwitchPinging} />

              {/* Subnet 1 Label */}
              <text x={170} y={30} fill="#60a5fa" fontSize="11" fontWeight="700" fontFamily="monospace">
                SUBNET 1 · 192.168.1.0/25
              </text>
              {/* Subnet 2 Label */}
              <text x={530} y={30} fill="#4ade80" fontSize="11" fontWeight="700" fontFamily="monospace">
                SUBNET 2 · 192.168.1.128/25
              </text>

              {/* PC1 */}
              <SvgWorkstation
                x={30}
                y={40}
                name="PC1"
                ip="192.168.1.10"
                ipColor="blue"
                showIp={true}
              />
              {/* PC1 Gateway status indicator */}
              {activeStepIndex >= 2 && (
                <text
                  x={73}
                  y={136}
                  textAnchor="middle"
                  fill={gateway === 'none' ? '#ef4444' : '#60a5fa'}
                  fontSize="10"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="600"
                >
                  {gateway === 'none' ? 'no gateway' : `gw: ${gateway}`}
                </text>
              )}

              {/* PC2 */}
              <SvgWorkstation
                x={30}
                y={180}
                name="PC2"
                ip="192.168.1.20"
                ipColor="blue"
                showIp={true}
              />

              {/* SW1 Switch */}
              <SvgSwitch x={190} y={125} port1Active={true} port2Active={true} port3Active={true} port4Active={true} />

              {/* PC4 */}
              <SvgWorkstation
                x={180}
                y={215}
                name="PC4"
                ip="192.168.1.40"
                ipColor="blue"
                showIp={true}
              />

              {/* Router R1 */}
              <SvgRouter
                x={330}
                y={116}
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
                x={580}
                y={114}
                name="PC3"
                ip="192.168.1.130"
                ipColor="green"
                showIp={true}
              />
            </>
          )}

          {/* =================================================== */}
          {/* DAY 5: STATIC ROUTES & DISTANT NETWORKS */}
          {/* =================================================== */}
          {isDay5 && (
            <>
              {/* Cables */}
              {/* PC1 to SW1 */}
              <SvgCable x1={106} y1={70} x2={165} y2={140} color="#4ade80" />
              {/* PC2 to SW1 */}
              <SvgCable x1={106} y1={210} x2={165} y2={160} color="#4ade80" />
              {/* PC4 to SW1 */}
              <SvgCable x1={195} y1={175} x2={195} y2={210} color="#4ade80" />
              {/* SW1 to R1 */}
              <SvgCable x1={225} y1={145} x2={295} y2={145} color="#4ade80" />
              {/* R1 to PC3 */}
              <SvgCable x1={337} y1={180} x2={337} y2={215} color="#4ade80" />
              {/* R1 to R2 Inter-router link */}
              <SvgCable x1={409} y1={145} x2={475} y2={145} color="#4ade80" isTransmitting={isSwitchPinging} />
              {/* R2 to PC5 (shown when step >= 1) */}
              {activeStepIndex >= 1 && (
                <SvgCable x1={589} y1={145} x2={640} y2={145} color="#4ade80" isTransmitting={isSwitchPinging && r1Route} />
              )}

              {/* PC1 */}
              <SvgWorkstation x={20} y={35} name="PC1" ip="192.168.1.10" ipColor="blue" showIp={true} />
              <text x={63} y={124} textAnchor="middle" fill="#60a5fa" fontSize="9.5" fontFamily="monospace">
                gw: 192.168.1.1
              </text>

              {/* PC2 */}
              <SvgWorkstation x={20} y={175} name="PC2" ip="192.168.1.20" ipColor="blue" showIp={true} />

              {/* Switch SW1 */}
              <SvgSwitch x={165} y={125} port1Active={true} port2Active={true} port3Active={true} port4Active={true} />

              {/* PC4 */}
              <SvgWorkstation x={160} y={215} name="PC4" ip="192.168.1.40" ipColor="blue" showIp={true} />

              {/* Router R1 */}
              <SvgRouter
                x={295}
                y={110}
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
              <SvgWorkstation x={300} y={215} name="PC3" ip="192.168.1.130" ipColor="green" showIp={true} />

              {/* Router R2 */}
              <SvgRouter
                x={475}
                y={110}
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
                  x={640}
                  y={110}
                  name="PC5"
                  ip="192.168.3.10"
                  ipColor="blue"
                  showIp={true}
                />
              )}

              {/* Inter-router link network label */}
              <text x={442} y={135} textAnchor="middle" fill="#9a9aa5" fontSize="9" fontFamily="monospace">
                192.168.2.0/24
              </text>
            </>
          )}

          {/* =================================================== */}
          {/* DAY 6: THE DEFAULT ROUTE & INTERNET ACCESS */}
          {/* =================================================== */}
          {isDay6 && (
            <>
              {/* Internal Cables */}
              {/* PC1 to SW1 */}
              <SvgCable x1={106} y1={65} x2={160} y2={135} color="#4ade80" />
              {/* PC2 to SW1 */}
              <SvgCable x1={106} y1={205} x2={160} y2={155} color="#4ade80" />
              {/* PC4 to SW1 */}
              <SvgCable x1={160} y1={175} x2={160} y2={205} color="#4ade80" />
              {/* SW1 to R1 */}
              <SvgCable x1={190} y1={140} x2={240} y2={140} color="#4ade80" isTransmitting={isSwitchPinging} />
              {/* R1 to PC3 */}
              <SvgCable x1={295} y1={170} x2={295} y2={215} color="#4ade80" />
              {/* R1 Port 3 to R2 Port 1 */}
              <SvgCable x1={354} y1={140} x2={385} y2={185} color="#4ade80" />
              {/* R2 Port 2 to PC5 */}
              <SvgCable x1={499} y1={195} x2={560} y2={195} color="#4ade80" />

              {/* Public Outside Cables */}
              {/* R1 Port 4 to Router ISP Port 1 */}
              <SvgCable
                x1={354}
                y1={120}
                x2={420}
                y2={65}
                color="#60a5fa"
                isTransmitting={isSwitchPinging && (lastCommand.includes('198.51.100.') || r1DefaultRoute)}
              />

              {/* Router ISP Port 2 to Web Server (revealed in idea 2+) */}
              {activeStepIndex >= 1 && (
                <SvgCable
                  x1={534}
                  y1={65}
                  x2={605}
                  y2={65}
                  color="#60a5fa"
                  isTransmitting={isSwitchPinging && r1DefaultRoute}
                />
              )}

              {/* PC1 */}
              <SvgWorkstation x={20} y={30} name="PC1" ip="192.168.1.10" ipColor="blue" showIp={true} />
              <text x={63} y={118} textAnchor="middle" fill="#60a5fa" fontSize="9" fontFamily="monospace">
                gw: 192.168.1.1
              </text>

              {/* PC2 */}
              <SvgWorkstation x={20} y={170} name="PC2" ip="192.168.1.20" ipColor="blue" showIp={true} />

              {/* Switch SW1 */}
              <SvgSwitch x={135} y={115} port1Active={true} port2Active={true} port3Active={true} port4Active={true} />

              {/* PC4 */}
              <SvgWorkstation x={125} y={205} name="PC4" ip="192.168.1.40" ipColor="blue" showIp={true} />

              {/* Router R1 (Edge Router) */}
              <SvgRouter
                x={240}
                y={100}
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
              <SvgWorkstation x={250} y={215} name="PC3" ip="192.168.1.130" ipColor="green" showIp={true} />

              {/* Router R2 (Internal Router) */}
              <SvgRouter
                x={385}
                y={165}
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
              <SvgWorkstation x={560} y={165} name="PC5" ip="192.168.3.10" ipColor="blue" showIp={true} />

              {/* Router ISP (Internet Service Provider) */}
              <SvgRouter
                x={420}
                y={30}
                name="Router ISP"
                port1Ip="203.0.113.1"
                port2Ip={activeStepIndex >= 1 ? '198.51.100.1' : undefined}
                port1Active={true}
                port2Active={activeStepIndex >= 1}
                port3Active={false}
                showPortIps={true}
                isPinging={isSwitchPinging && r1DefaultRoute}
              />

              {/* Web Server (198.51.100.10) */}
              {activeStepIndex >= 1 && (
                <SvgWorkstation
                  x={605}
                  y={30}
                  name="Web Server"
                  ip="198.51.100.10"
                  ipColor="green"
                  showIp={true}
                />
              )}

              {/* Public link label */}
              <text x={388} y={80} textAnchor="middle" fill="#60a5fa" fontSize="8.5" fontFamily="monospace">
                Public 203.0.113.0/24
              </text>
            </>
          )}
        </svg>
      </div>
    </div>
  );
};
