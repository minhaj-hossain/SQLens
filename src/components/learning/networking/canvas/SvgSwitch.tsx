import React from 'react';

interface SvgSwitchProps {
  x: number;
  y: number;
  port1Active?: boolean;
  port2Active?: boolean;
  port3Active?: boolean;
  port4Active?: boolean;
  isPinging?: boolean;
}

export const SvgSwitch: React.FC<SvgSwitchProps> = ({
  x,
  y,
  port1Active = true,
  port2Active = true,
  port3Active = true,
  port4Active = false,
  isPinging = false,
}) => {
  const width = 112;
  const height = 48;
  const baseW = 122;
  const baseH = 4;

  const cx = x + width / 2;
  const baseX = cx - baseW / 2;
  const baseY = y + height;

  return (
    <g className="transition-all duration-300 ease-out">
      {/* Switch Main Chassis (Dark Charcoal matching laptop screen) */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={3}
        fill="#232326"
        stroke="#3c3c44"
        strokeWidth="1.2"
      />

      {/* Front Face Inset Plate */}
      <rect
        x={x + 3}
        y={y + 3}
        width={width - 6}
        height={height - 6}
        rx={2}
        fill="#141416"
        stroke="#1c1c20"
        strokeWidth="0.8"
      />

      {/* Switch Label */}
      <text
        x={cx}
        y={y + 16}
        textAnchor="middle"
        fill="#94a3b8"
        fontSize="9.5"
        fontWeight="700"
        letterSpacing="0.1em"
        fontFamily="ui-monospace, Menlo, Consolas, monospace"
      >
        ETHERNET SWITCH
      </text>

      {/* 4 Port Sockets Cluster */}
      {/* Port 1 */}
      <g transform={`translate(${cx - 39}, ${y + 22})`}>
        <rect x="0" y="3" width="16" height="11" rx="1.5" fill="#09090b" stroke="#27272a" strokeWidth="0.8" />
        <circle
          cx="8"
          cy="1"
          r="1.4"
          fill={port1Active ? '#4ade80' : '#3f3f46'}
          className={port1Active ? 'drop-shadow-[0_0_3px_#4ade80]' : ''}
        >
          {port1Active && isPinging && (
            <animate attributeName="opacity" values="1;0.2;1;0.2;1" dur="0.25s" repeatCount="indefinite" />
          )}
        </circle>
        <text x="8" y="21" textAnchor="middle" fill="#64748b" fontSize="7.5" fontFamily="monospace">1</text>
      </g>

      {/* Port 2 */}
      <g transform={`translate(${cx - 19}, ${y + 22})`}>
        <rect x="0" y="3" width="16" height="11" rx="1.5" fill="#09090b" stroke="#27272a" strokeWidth="0.8" />
        <circle
          cx="8"
          cy="1"
          r="1.4"
          fill={port2Active ? '#4ade80' : '#3f3f46'}
          className={port2Active ? 'drop-shadow-[0_0_3px_#4ade80]' : ''}
        >
          {port2Active && isPinging && (
            <animate attributeName="opacity" values="1;0.2;1;0.2;1" dur="0.25s" repeatCount="indefinite" />
          )}
        </circle>
        <text x="8" y="21" textAnchor="middle" fill="#64748b" fontSize="7.5" fontFamily="monospace">2</text>
      </g>

      {/* Port 3 */}
      <g transform={`translate(${cx + 3}, ${y + 22})`}>
        <rect x="0" y="3" width="16" height="11" rx="1.5" fill="#09090b" stroke="#27272a" strokeWidth="0.8" />
        <circle
          cx="8"
          cy="1"
          r="1.4"
          fill={port3Active ? '#4ade80' : '#3f3f46'}
          className={port3Active ? 'drop-shadow-[0_0_3px_#4ade80]' : ''}
        >
          {port3Active && isPinging && (
            <animate attributeName="opacity" values="1;0.2;1;0.2;1" dur="0.25s" repeatCount="indefinite" />
          )}
        </circle>
        <text x="8" y="21" textAnchor="middle" fill="#64748b" fontSize="7.5" fontFamily="monospace">3</text>
      </g>

      {/* Port 4 */}
      <g transform={`translate(${cx + 23}, ${y + 22})`}>
        <rect x="0" y="3" width="16" height="11" rx="1.5" fill="#09090b" stroke="#27272a" strokeWidth="0.8" />
        <circle
          cx="8"
          cy="1"
          r="1.4"
          fill={port4Active ? '#4ade80' : '#3f3f46'}
          className={port4Active ? 'drop-shadow-[0_0_3px_#4ade80]' : ''}
        >
          {port4Active && isPinging && (
            <animate attributeName="opacity" values="1;0.2;1;0.2;1" dur="0.25s" repeatCount="indefinite" />
          )}
        </circle>
        <text x="8" y="21" textAnchor="middle" fill="#64748b" fontSize="7.5" fontFamily="monospace">4</text>
      </g>

      {/* Power status LED */}
      <circle cx={x + 9} cy={y + 13} r="1.4" fill="#4ade80" className="drop-shadow-[0_0_3px_#4ade80]" />

      {/* Sleek Metallic Silver Base (Matching Laptop Base) */}
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
    </g>
  );
};
