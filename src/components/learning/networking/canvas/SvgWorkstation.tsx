import React from 'react';

interface SvgWorkstationProps {
  x: number;
  y: number;
  name: string;
  ip?: string;
  mac?: string;
  ipColor?: 'blue' | 'green' | 'default';
  showIp?: boolean;
  showMac?: boolean;
  isLinked?: boolean;
  isPinging?: boolean;
}

export const SvgWorkstation: React.FC<SvgWorkstationProps> = ({
  x,
  y,
  name,
  ip,
  mac,
  ipColor = 'blue',
  showIp = true,
  showMac = false,
  isLinked = true,
  isPinging = false,
}) => {
  const width = 86;
  const height = 72;
  const cx = x + width / 2;

  const ipFill =
    ipColor === 'green'
      ? '#4ade80'
      : ipColor === 'blue'
      ? '#60a5fa'
      : '#ececf0';

  const ipBg =
    ipColor === 'green'
      ? 'rgba(74, 222, 128, 0.12)'
      : ipColor === 'blue'
      ? 'rgba(96, 165, 250, 0.12)'
      : 'rgba(255, 255, 255, 0.08)';

  const ipBorder =
    ipColor === 'green'
      ? 'rgba(74, 222, 128, 0.35)'
      : ipColor === 'blue'
      ? 'rgba(96, 165, 250, 0.35)'
      : 'rgba(255, 255, 255, 0.15)';

  return (
    <g className="transition-all duration-500 ease-out">
      {/* Outer Glow on Ping / Active */}
      {isPinging && (
        <rect
          x={x - 4}
          y={y - 4}
          width={width + 8}
          height={height + 8}
          rx={12}
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
          className="animate-pulse opacity-70"
        />
      )}

      {/* Main Metal PC Chassis */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        fill="#141417"
        stroke="#2a2a32"
        strokeWidth="1.5"
      />

      {/* Bevel highlight */}
      <rect
        x={x + 1}
        y={y + 1}
        width={width - 2}
        height={height - 2}
        rx={7}
        fill="none"
        stroke="rgba(255, 255, 255, 0.05)"
        strokeWidth="1"
      />

      {/* Top ventilation grille */}
      <line
        x1={x + 14}
        y1={y + 12}
        x2={x + width - 14}
        y2={y + 12}
        stroke="#232328"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1={x + 14}
        y1={y + 17}
        x2={x + width - 14}
        y2={y + 17}
        stroke="#232328"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Power LED and Button */}
      <circle cx={x + 16} cy={y + 30} r={3} fill="#1f2937" stroke="#374151" strokeWidth="1" />
      <circle
        cx={x + 28}
        cy={y + 30}
        r={2}
        fill={isLinked ? '#4ade80' : '#6b7280'}
        className={isLinked ? 'drop-shadow-[0_0_4px_#4ade80]' : ''}
      />

      {/* Optical Drive Slot / Brand accent */}
      <rect
        x={x + 38}
        y={y + 28}
        width={width - 50}
        height={4}
        rx={1}
        fill="#1b1b20"
      />

      {/* RJ-45 Ethernet Port Socket */}
      <rect
        x={cx - 10}
        y={y + 44}
        width={20}
        height={14}
        rx={2}
        fill="#0a0a0c"
        stroke="#33333d"
        strokeWidth="1"
      />
      {/* Port pinout notch */}
      <rect x={cx - 4} y={y + 45} width={8} height={5} fill="#141417" />
      {/* Port Link LEDs */}
      {/* Green Link LED (solid when link is up) */}
      <circle
        cx={cx - 6}
        cy={y + 41}
        r={1.5}
        fill={isLinked ? '#4ade80' : '#3f3f46'}
        className={isLinked ? 'drop-shadow-[0_0_3px_#4ade80]' : ''}
      />
      {/* Amber Activity LED (flickers realistically on network traffic) */}
      <circle
        cx={cx + 6}
        cy={y + 41}
        r={1.5}
        fill={isPinging ? '#fbbf24' : isLinked ? '#f59e0b' : '#3f3f46'}
        className={isPinging ? 'drop-shadow-[0_0_5px_#fbbf24]' : ''}
      >
        {isLinked && (
          <animate
            attributeName="opacity"
            values={isPinging ? '1;0.15;1;0.3;0.9;0.2;1' : '0.9;0.4;0.85;0.3;0.9'}
            dur={isPinging ? '0.25s' : '2.4s'}
            repeatCount="indefinite"
          />
        )}
      </circle>

      {/* Device Name Label */}
      <text
        x={cx}
        y={y + 92}
        textAnchor="middle"
        fill="#ececf0"
        fontSize="13"
        fontWeight="600"
        fontFamily="ui-monospace, Menlo, Consolas, monospace"
        letterSpacing="0.05em"
      >
        {name}
      </text>

      {/* IP Address Pill */}
      {showIp && ip && (
        <g
          className="transition-all duration-300"
          style={{ opacity: 1, transform: 'translateY(0)' }}
        >
          <rect
            x={cx - 52}
            y={y + 101}
            width={104}
            height={20}
            rx={5}
            fill={ipBg}
            stroke={ipBorder}
            strokeWidth="1"
          />
          <text
            x={cx}
            y={y + 115}
            textAnchor="middle"
            fill={ipFill}
            fontSize="11.5"
            fontWeight="500"
            fontFamily="ui-monospace, Menlo, Consolas, monospace"
            letterSpacing="-0.02em"
          >
            {ip}
          </text>
        </g>
      )}

      {/* MAC Address Badge */}
      {showMac && mac && (
        <g
          className="transition-all duration-300"
          style={{ opacity: 1 }}
        >
          <rect
            x={cx - 60}
            y={y + 126}
            width={120}
            height={18}
            rx={4}
            fill="rgba(74, 222, 128, 0.08)"
            stroke="rgba(74, 222, 128, 0.25)"
            strokeWidth="0.8"
          />
          <text
            x={cx}
            y={y + 139}
            textAnchor="middle"
            fill="#4ade80"
            fontSize="10"
            fontWeight="600"
            fontFamily="ui-monospace, Menlo, Consolas, monospace"
            letterSpacing="0.04em"
          >
            {mac}
          </text>
        </g>
      )}
    </g>
  );
};
