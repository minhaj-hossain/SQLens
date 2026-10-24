import React from 'react';

interface SvgRouterProps {
  x: number;
  y: number;
  name?: string; // e.g. "Router R1", "Router R2", "Router ISP"
  port1Ip?: string;
  port2Ip?: string;
  port3Ip?: string;
  port4Ip?: string;
  port1Active?: boolean;
  port2Active?: boolean;
  port3Active?: boolean;
  port4Active?: boolean;
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
  port4Ip,
  port1Active = true,
  port2Active = true,
  port3Active = false,
  port4Active = false,
  showPortIps = false,
  staticRouteText,
  isPinging = false,
}) => {
  const width = 126;
  const height = 52;
  const cx = x + width / 2;

  // Filter list of active port IPs to render in a clean, non-overlapping stacked table
  const portList: { label: string; ip: string }[] = [];
  if (port1Ip && port1Ip !== 'no cable') portList.push({ label: 'P1', ip: port1Ip });
  if (port2Ip && port2Ip !== 'no cable') portList.push({ label: 'P2', ip: port2Ip });
  if (port3Ip && port3Ip !== 'no cable') portList.push({ label: 'P3', ip: port3Ip });
  if (port4Ip && port4Ip !== 'no cable') portList.push({ label: 'P4', ip: port4Ip });

  return (
    <g className="transition-all duration-300 ease-out">
      {/* Static Route Badge Above Router (when active) */}
      {staticRouteText && (
        <g className="animate-fadeIn">
          <rect
            x={cx - 80}
            y={y - 28}
            width={160}
            height={22}
            rx={5}
            fill="#0c121e"
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

      {/* Router Main Chassis (Dark Charcoal, rounded corners) */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        fill="#232326"
        stroke="#3c3c44"
        strokeWidth="1.2"
      />

      {/* Inset Faceplate */}
      <rect
        x={x + 3}
        y={y + 3}
        width={width - 6}
        height={height - 6}
        rx={3}
        fill="#141416"
        stroke="#1c1c20"
        strokeWidth="0.8"
      />

      {/* Router Name Label - Bold matching PC */}
      <text
        x={cx}
        y={y + 14}
        textAnchor="middle"
        fill="#f1f5f9"
        fontSize="10"
        fontWeight="700"
        letterSpacing="0.06em"
        fontFamily="ui-monospace, Menlo, Consolas, monospace"
      >
        {name.toUpperCase()}
      </text>

      {/* Layer 3 Gateway subtext */}
      <text
        x={cx}
        y={y + 22.5}
        textAnchor="middle"
        fill="#64748b"
        fontSize="6.8"
        fontWeight="600"
        letterSpacing="0.08em"
        fontFamily="ui-monospace, Menlo, Consolas, monospace"
      >
        LAYER 3 GATEWAY
      </text>

      {/* Interface Port Sockets Cluster */}
      {/* Port 1 */}
      <g transform={`translate(${cx - 44}, ${y + 26})`}>
        <rect x="0" y="3" width="16" height="12" rx="1.5" fill="#09090b" stroke="#27272a" strokeWidth="0.8" />
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
        <text x="8" y="22" textAnchor="middle" fill="#64748b" fontSize="7.5" fontFamily="monospace">P1</text>
      </g>

      {/* Port 2 */}
      <g transform={`translate(${cx - 20}, ${y + 26})`}>
        <rect x="0" y="3" width="16" height="12" rx="1.5" fill="#09090b" stroke="#27272a" strokeWidth="0.8" />
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
        <text x="8" y="22" textAnchor="middle" fill="#64748b" fontSize="7.5" fontFamily="monospace">P2</text>
      </g>

      {/* Port 3 */}
      <g transform={`translate(${cx + 4}, ${y + 26})`}>
        <rect x="0" y="3" width="16" height="12" rx="1.5" fill="#09090b" stroke="#27272a" strokeWidth="0.8" />
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
        <text x="8" y="22" textAnchor="middle" fill="#64748b" fontSize="7.5" fontFamily="monospace">P3</text>
      </g>

      {/* Port 4 */}
      <g transform={`translate(${cx + 28}, ${y + 26})`}>
        <rect x="0" y="3" width="16" height="12" rx="1.5" fill="#09090b" stroke="#27272a" strokeWidth="0.8" />
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
        <text x="8" y="22" textAnchor="middle" fill="#64748b" fontSize="7.5" fontFamily="monospace">P4</text>
      </g>

      {/* Structured, Non-Overlapping Port IP Badges Below Router Chassis */}
      {showPortIps && portList.length > 0 && (
        <g transform={`translate(${cx}, ${y + height + 6})`}>
          {portList.map((p, idx) => (
            <g key={idx} transform={`translate(0, ${idx * 17})`}>
              {/* Clean Port Pill Container */}
              <rect
                x="-64"
                y="0"
                width="128"
                height="15"
                rx="3.5"
                fill="#0c121e"
                stroke="#1e293b"
                strokeWidth="0.8"
              />
              {/* Port Name */}
              <text
                x="-56"
                y="11"
                fill="#60a5fa"
                fontSize="8.5"
                fontFamily="monospace"
                fontWeight="600"
              >
                {p.label}
              </text>
              {/* Port IP (Right-aligned, never overlaps) */}
              <text
                x="56"
                y="11"
                textAnchor="end"
                fill="#ececf0"
                fontSize="8.5"
                fontFamily="monospace"
              >
                {p.ip}
              </text>
            </g>
          ))}
        </g>
      )}
    </g>
  );
};
