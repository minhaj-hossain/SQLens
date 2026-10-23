import React from 'react';

interface SvgCableProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  glow?: boolean;
  color?: string;
  isTransmitting?: boolean;
  curvature?: number;
}

export const SvgCable: React.FC<SvgCableProps> = ({
  x1,
  y1,
  x2,
  y2,
  glow = false,
  color = '#4ade80',
  isTransmitting = false,
  curvature = 0,
}) => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2 + curvature;

  const pathD =
    curvature === 0
      ? `M ${x1} ${y1} L ${x2} ${y2}`
      : `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;

  return (
    <g>
      {/* Outer Glow Path */}
      {glow && (
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeOpacity="0.25"
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      )}

      {/* Main Cable Wire */}
      <path
        d={pathD}
        fill="none"
        stroke={glow ? color : '#3a3a46'}
        strokeWidth="2.5"
        strokeLinecap="round"
        className="transition-colors duration-300"
      />

      {/* RJ45 Connector Boots */}
      <circle cx={x1} cy={y1} r={3} fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
      <circle cx={x2} cy={y2} r={3} fill="#18181b" stroke="#3f3f46" strokeWidth="1" />

      {/* Pulse Packet Animation */}
      {isTransmitting && (
        <g>
          {/* Soft outer glow halo */}
          <circle r={6} fill={color} opacity={0.4} className="drop-shadow-[0_0_8px_#4ade80]">
            <animateMotion path={pathD} dur="0.95s" repeatCount="indefinite" />
          </circle>
          {/* High-intensity particle core */}
          <circle r={3.5} fill="#ffffff" className="drop-shadow-[0_0_5px_#ffffff]">
            <animateMotion path={pathD} dur="0.95s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
    </g>
  );
};
