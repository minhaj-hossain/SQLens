'use client';

import React from 'react';
import { SvgWorkstation } from './SvgWorkstation';
import { SvgSwitch } from './SvgSwitch';
import { SvgCable } from './SvgCable';

interface NetworkingCanvasProps {
  dayId: string; // 'net-01' | 'net-02' | 'net-03'
  activeStepIndex: number;
  completedSteps: Set<number>;
  lastCommand?: string;
  isPinging?: boolean;
  pc3Ip?: string; // default: '192.168.1.30'
  pc4Ip?: string; // default: '192.168.2.10'
  isLinkUp?: boolean;
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
}) => {
  const isDay1 = dayId === 'net-01';
  const isDay2 = dayId === 'net-02';
  const isDay3 = dayId === 'net-03';

  // Day 1 Progressive reveals
  const showDay1DirectWire = isDay1 && activeStepIndex < 4;
  const showSwitch = !isDay1 || activeStepIndex >= 4;
  const showPC3 = !isDay1 || activeStepIndex >= 4;
  const showPC4 = isDay2 && activeStepIndex >= 2;

  const showIps = !isDay1 || activeStepIndex >= 1;
  const showMacs = !isDay1 || activeStepIndex >= 3;
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
  const pc3Color = isPc3Subnet2 ? 'green' : 'blue';

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
          {/* CABLES LAYER */}
          {/* =================================================== */}

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
              {/* Wire 1: PC1 to Switch */}
              <SvgCable
                x1={146}
                y1={150}
                x2={326}
                y2={150}
                glow={true}
                color="#4ade80"
                isTransmitting={isSwitchPinging && lastCommand.includes('192.168.1.')}
              />

              {/* Wire 2: Switch to PC2 */}
              <SvgCable
                x1={434}
                y1={150}
                x2={594}
                y2={150}
                glow={true}
                color="#4ade80"
                isTransmitting={isSwitchPinging && lastCommand.includes('192.168.1.20')}
              />

              {/* Wire 3: PC3 to Switch */}
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

              {/* Wire 4: Switch to PC4 (Day 2 Step 3+) */}
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

          {/* =================================================== */}
          {/* HARDWARE DEVICES LAYER */}
          {/* =================================================== */}

          {/* PC1 (Left) */}
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

          {/* PC2 (Right) */}
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

          {/* Central Switch */}
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

          {/* PC3 (Top Center) */}
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

          {/* PC4 (Bottom Center - Day 2 only) */}
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

          {/* =================================================== */}
          {/* DAY 3 SUBNET LEGEND */}
          {/* =================================================== */}
          {showSubnetLegend && (
            <g
              transform="translate(200, 290)"
              className="transition-opacity duration-300"
            >
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
        </svg>
      </div>
    </div>
  );
};
