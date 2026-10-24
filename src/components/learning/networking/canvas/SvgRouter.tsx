import React from 'react';

interface SvgRouterProps {
  x: number;
  y: number;
  name?: string; // e.g. "Router R1", "Router R2", "Router ISP"
  port1Ip?: string;
  port2Ip?: string;
  port3Ip?: string;
  port1Active?: boolean;
  port2Active?: boolean;
  port3Active?: boolean;
  showPortIps?: boolean;
  staticRouteText?: string;
  isPinging?: boolean;
}

export const SvgRouter: React.FC<SvgRouterProps> = ({
  x,
  y,
  name = 'Router R1',
  port1Ip,
  port2Ip,
  port3Ip,
  port1Active = true,
  port2Active = true,
  port3Active = false,
  showPortIps = false,
  staticRouteText,
  isPinging = false,
}) => {
  const width = 114;
  const height = 68;
  const cx = x + width / 2;

  return (
    <g className="transition-all duration-500 ease-out">
      {/* Static Route Badge Above Router */}
      {staticRouteText && (
        <g className="animate-fadeIn">
          <rect
            x={cx - 75}
            y={y - 28}
            width={150}
            height={22}
            rx={5}
            fill="#121216"
            stroke="#60a5fa"
            strokeWidth="1"
            className="drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]"
          />
          <text
            x={cx}
            y={y - 14}
            textAnchor="middle"
            fill="#60a5fa"
            fontSize="10"
            fontWeight="600"
            fontFamily="ui-monospace, Menlo, Consolas, monospace"
          >
            {staticRouteText}
          </text>
        </g>
      )}

      {/* Router Main Chassis */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        fill="#141418"
        stroke="#3b3b48"
        strokeWidth="1.5"
      />

      {/* Front Face Inset Plate */}
      <rect
        x={x + 3}
        y={y + 3}
        width={width - 6}
        height={height - 6}
        rx={6}
        fill="#0d0d11"
        stroke="#22222a"
        strokeWidth="1"
      />

      {/* Prominent Device Name */}
      <text
        x={cx}
        y={y + 18}
        textAnchor="middle"
        fill="#ececf0"
        fontSize="11"
        fontWeight="800"
        letterSpacing="0.08em"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {name.toUpperCase()}
      </text>

      {/* Subtitle / Role indicator */}
      <text
        x={cx}
        y={y + 28}
        textAnchor="middle"
        fill="#9a9aa5"
        fontSize="8.5"
        letterSpacing="0.06em"
        fontFamily="ui-monospace, Menlo, monospace"
      >
        LAYER 3 GATEWAY
      </text>

      {/* Port 1 (Left: typically Subnet 1 or Uplink) */}
      <g transform={`translate(${x + 12}, ${y + 36})`}>
        <rect x="0" y="4" width="18" height="13" rx="2" fill="#070709" stroke="#2c2c34" strokeWidth="0.8" />
        <rect x="5" y="5" width="8" height="4" fill="#141418" />
        <circle
          cx="9"
          cy="1"
          r="1.5"
          fill={port1Active ? '#4ade80' : '#27272a'}
          className={port1Active ? 'drop-shadow-[0_0_3px_#4ade80]' : ''}
        >
          {port1Active && (
            <animate
              attributeName="opacity"
              values={isPinging ? '1;0.2;0.9;0.1;1' : '1;0.4;0.9;0.3;1'}
              dur={isPinging ? '0.2s' : '2.1s'}
              repeatCount="indefinite"
            />
          )}
        </circle>
        <text x="9" y="25" textAnchor="middle" fill="#62626d" fontSize="7.5" fontFamily="monospace">P1</text>
      </g>

      {/* Port 2 (Center: typically Subnet 2 or Next Hop) */}
      <g transform={`translate(${cx - 9}, ${y + 36})`}>
        <rect x="0" y="4" width="18" height="13" rx="2" fill="#070709" stroke="#2c2c34" strokeWidth="0.8" />
        <rect x="5" y="5" width="8" height="4" fill="#141418" />
        <circle
          cx="9"
          cy="1"
          r="1.5"
          fill={port2Active ? '#4ade80' : '#27272a'}
          className={port2Active ? 'drop-shadow-[0_0_3px_#4ade80]' : ''}
        >
          {port2Active && (
            <animate
              attributeName="opacity"
              values={isPinging ? '1;0.1;0.95;0.2;1' : '0.9;0.3;1;0.5;0.9'}
              dur={isPinging ? '0.24s' : '1.8s'}
              repeatCount="indefinite"
            />
          )}
        </circle>
        <text x="9" y="25" textAnchor="middle" fill="#62626d" fontSize="7.5" fontFamily="monospace">P2</text>
      </g>

      {/* Port 3 (Right: Link to R2 or ISP) */}
      <g transform={`translate(${x + width - 30}, ${y + 36})`}>
        <rect x="0" y="4" width="18" height="13" rx="2" fill="#070709" stroke="#2c2c34" strokeWidth="0.8" />
        <rect x="5" y="5" width="8" height="4" fill="#141418" />
        <circle
          cx="9"
          cy="1"
          r="1.5"
          fill={port3Active ? '#4ade80' : '#27272a'}
          className={port3Active ? 'drop-shadow-[0_0_3px_#4ade80]' : ''}
        >
          {port3Active && (
            <animate
              attributeName="opacity"
              values={isPinging ? '1;0.3;0.8;0.15;1' : '1;0.5;0.8;0.3;1'}
              dur={isPinging ? '0.19s' : '2.4s'}
              repeatCount="indefinite"
            />
          )}
        </circle>
        <text x="9" y="25" textAnchor="middle" fill="#62626d" fontSize="7.5" fontFamily="monospace">P3</text>
      </g>

      {/* Power status LED */}
      <circle cx={x + 10} cy={y + 14} r="1.5" fill="#4ade80" className="drop-shadow-[0_0_3px_#4ade80]" />

      {/* Optional Port IP labels below or above ports */}
      {showPortIps && port1Ip && (
        <text
          x={x + 21}
          y={y + 78}
          textAnchor="middle"
          fill="#9a9aa5"
          fontSize="9"
          fontWeight="500"
          fontFamily="ui-monospace, Menlo, monospace"
        >
          {port1Ip}
        </text>
      )}

      {showPortIps && port2Ip && (
        <text
          x={cx}
          y={y + 78}
          textAnchor="middle"
          fill="#9a9aa5"
          fontSize="9"
          fontWeight="500"
          fontFamily="ui-monospace, Menlo, monospace"
        >
          {port2Ip}
        </text>
      )}

      {showPortIps && port3Ip && (
        <text
          x={x + width - 21}
          y={y + 78}
          textAnchor="middle"
          fill="#9a9aa5"
          fontSize="9"
          fontWeight="500"
          fontFamily="ui-monospace, Menlo, monospace"
        >
          {port3Ip}
        </text>
      )}
    </g>
  );
};
