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
  // Laptop geometry strictly matching the user's reference image
  const screenW = 76;
  const screenH = 48;
  const baseW = 88;
  const baseH = 4;

  const cx = x + screenW / 2;
  const baseX = cx - baseW / 2;
  const baseY = y + screenH;

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
    <g className="transition-all duration-300 ease-out">
      {/* Ping Pulse Outer Halo */}
      {isPinging && (
        <rect
          x={baseX - 4}
          y={y - 4}
          width={baseW + 8}
          height={screenH + baseH + 8}
          rx={8}
          fill="none"
          stroke="#4ade80"
          strokeWidth="1.5"
          className="animate-pulse opacity-75"
        />
      )}

      {/* 1. Laptop Display Lid / Screen (Dark Charcoal Rectangle) */}
      <rect
        x={x}
        y={y}
        width={screenW}
        height={screenH}
        rx={3}
        fill="#232326"
        stroke="#3c3c44"
        strokeWidth="1.2"
      />

      {/* Inner Screen Display Glass Bezel */}
      <rect
        x={x + 3}
        y={y + 3}
        width={screenW - 6}
        height={screenH - 6}
        rx={2}
        fill="#141416"
        stroke="#1c1c20"
        strokeWidth="0.8"
      />

      {/* Device Name Inside Screen - Bold Typography */}
      <text
        x={cx}
        y={y + 28}
        textAnchor="middle"
        fill="#f1f5f9"
        fontSize="12.5"
        fontWeight="600"
        fontFamily="ui-monospace, Menlo, Consolas, monospace"
        letterSpacing="0.04em"
      >
        {name}
      </text>

      {/* 2. Sleek Metallic Silver Base Chassis (Matching User Image Exactly) */}
      <rect
        x={baseX}
        y={baseY}
        width={baseW}
        height={baseH}
        rx={2}
        fill="#d4d4d8"
        stroke="#9ca3af"
        strokeWidth="0.6"
        className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
      />

      {/* Base Center Notch (MacBook/Laptop style thumb-indent) */}
      <rect
        x={cx - 7}
        y={baseY}
        width={14}
        height={1.5}
        rx={0.8}
        fill="#9ca3af"
      />

      {/* 3. IP Address Badge (Positioned safely below the silver base) */}
      {showIp && ip && (
        <g
          className="transition-all duration-300"
          style={{ opacity: 1, transform: 'translateY(0)' }}
        >
          <rect
            x={cx - 52}
            y={baseY + 8}
            width={104}
            height={18}
            rx={4}
            fill={ipBg}
            stroke={ipBorder}
            strokeWidth="1"
          />
          <text
            x={cx}
            y={baseY + 20.5}
            textAnchor="middle"
            fill={ipFill}
            fontSize="10.5"
            fontWeight="500"
            fontFamily="ui-monospace, Menlo, Consolas, monospace"
            letterSpacing="-0.02em"
          >
            {ip}
          </text>
        </g>
      )}

      {/* 4. MAC Address Badge (Positioned safely below the IP pill) */}
      {showMac && mac && (
        <g className="transition-all duration-300">
          <rect
            x={cx - 62}
            y={baseY + (showIp ? 30 : 8)}
            width={124}
            height={16}
            rx={4}
            fill="rgba(74, 222, 128, 0.08)"
            stroke="rgba(74, 222, 128, 0.25)"
            strokeWidth="0.8"
          />
          <text
            x={cx}
            y={baseY + (showIp ? 41.5 : 19.5)}
            textAnchor="middle"
            fill="#4ade80"
            fontSize="9.5"
            fontWeight="500"
            fontFamily="ui-monospace, Menlo, Consolas, monospace"
            letterSpacing="0.03em"
          >
            {mac}
          </text>
        </g>
      )}
    </g>
  );
};
