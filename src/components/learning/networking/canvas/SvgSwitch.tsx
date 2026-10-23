import React from 'react';

interface SvgSwitchProps {
  x: number;
  y: number;
  port1Active?: boolean;
  port2Active?: boolean;
  port3Active?: boolean;
  port4Active?: boolean;
}

export const SvgSwitch: React.FC<SvgSwitchProps> = ({
  x,
  y,
  port1Active = true,
  port2Active = true,
  port3Active = true,
  port4Active = false,
}) => {
  const width = 110;
  const height = 58;
  const cx = x + width / 2;
  const cy = y + height / 2;

  return (
    <g className="transition-all duration-500 ease-out">
      {/* Switch Outer Chassis */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        fill="#141418"
        stroke="#2c2c36"
        strokeWidth="1.5"
      />

      {/* Front Face Inset Plate */}
      <rect
        x={x + 3}
        y={y + 3}
        width={width - 6}
        height={height - 6}
        rx={6}
        fill="#0d0d10"
        stroke="#1c1c22"
        strokeWidth="1"
      />

      {/* Switch Label */}
      <text
        x={cx}
        y={y + 16}
        textAnchor="middle"
        fill="#9a9aa5"
        fontSize="10"
        fontWeight="700"
        letterSpacing="0.12em"
        fontFamily="ui-monospace, Menlo, Consolas, monospace"
      >
        ETHERNET SWITCH
      </text>

      {/* 4 Front Ports Cluster */}
      {/* Port 1 (left) */}
      <g transform={`translate(${cx - 38}, ${y + 24})`}>
        <rect x="0" y="4" width="16" height="12" rx="2" fill="#070709" stroke="#2c2c34" strokeWidth="0.8" />
        <rect x="4" y="5" width="8" height="4" fill="#141418" />
        <circle cx="8" cy="1" r="1.5" fill={port1Active ? '#4ade80' : '#27272a'} />
        <text x="8" y="24" textAnchor="middle" fill="#62626d" fontSize="8" fontFamily="monospace">1</text>
      </g>

      {/* Port 2 (center-left) */}
      <g transform={`translate(${cx - 18}, ${y + 24})`}>
        <rect x="0" y="4" width="16" height="12" rx="2" fill="#070709" stroke="#2c2c34" strokeWidth="0.8" />
        <rect x="4" y="5" width="8" height="4" fill="#141418" />
        <circle cx="8" cy="1" r="1.5" fill={port2Active ? '#4ade80' : '#27272a'} />
        <text x="8" y="24" textAnchor="middle" fill="#62626d" fontSize="8" fontFamily="monospace">2</text>
      </g>

      {/* Port 3 (center-right) */}
      <g transform={`translate(${cx + 2}, ${y + 24})`}>
        <rect x="0" y="4" width="16" height="12" rx="2" fill="#070709" stroke="#2c2c34" strokeWidth="0.8" />
        <rect x="4" y="5" width="8" height="4" fill="#141418" />
        <circle cx="8" cy="1" r="1.5" fill={port3Active ? '#4ade80' : '#27272a'} />
        <text x="8" y="24" textAnchor="middle" fill="#62626d" fontSize="8" fontFamily="monospace">3</text>
      </g>

      {/* Port 4 (right) */}
      <g transform={`translate(${cx + 22}, ${y + 24})`}>
        <rect x="0" y="4" width="16" height="12" rx="2" fill="#070709" stroke="#2c2c34" strokeWidth="0.8" />
        <rect x="4" y="5" width="8" height="4" fill="#141418" />
        <circle cx="8" cy="1" r="1.5" fill={port4Active ? '#4ade80' : '#27272a'} />
        <text x="8" y="24" textAnchor="middle" fill="#62626d" fontSize="8" fontFamily="monospace">4</text>
      </g>

      {/* Power status LED */}
      <circle cx={x + 10} cy={y + 14} r="1.5" fill="#4ade80" className="drop-shadow-[0_0_3px_#4ade80]" />
    </g>
  );
};
