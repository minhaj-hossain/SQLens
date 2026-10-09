'use client';

import React, { useState, useEffect } from 'react';
import type { HostNode, SimulationStep, PortState } from '../../../types/networking-curriculum';

interface SwitchingTopologyCanvasProps {
  hosts: HostNode[];
  currentStep: SimulationStep | null;
  selectedPorts?: number[];
  onTogglePort?: (port: number) => void;
  interactivePortSelection?: boolean;
  className?: string;
}

interface NodePosition {
  x: number;
  y: number;
  portX: number;
  portY: number;
}

export const SwitchingTopologyCanvas: React.FC<SwitchingTopologyCanvasProps> = ({
  hosts,
  currentStep,
  selectedPorts = [],
  onTogglePort,
  interactivePortSelection = false,
  className = '',
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [inspectedNode, setInspectedNode] = useState<{ id: string; type: 'host' | 'port' } | null>(
    null,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Canvas bounds
  const width = 640;
  const height = 400;
  const switchBox = { x: 260, y: 150, w: 120, h: 100 };

  // Calculate coordinates for hosts based on host count
  const getNodePositions = (hostList: HostNode[]): Record<number, NodePosition> => {
    const count = hostList.length;
    const positions: Record<number, NodePosition> = {};

    if (count <= 4) {
      // Standard 4-port topology
      const coords = [
        { x: 90, y: 80, portX: switchBox.x, portY: switchBox.y + 25 }, // Port 1 (Top Left)
        { x: 550, y: 80, portX: switchBox.x + switchBox.w, portY: switchBox.y + 25 }, // Port 2 (Top Right)
        { x: 90, y: 320, portX: switchBox.x, portY: switchBox.y + 75 }, // Port 3 (Bottom Left)
        { x: 550, y: 320, portX: switchBox.x + switchBox.w, portY: switchBox.y + 75 }, // Port 4 (Bottom Right)
      ];
      hostList.forEach((h, i) => {
        positions[h.port] = coords[i % coords.length];
      });
    } else {
      // 5-port or N-port radial distribution
      const centerX = width / 2;
      const centerY = height / 2;
      const radiusX = 230;
      const radiusY = 140;

      hostList.forEach((h, idx) => {
        const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
        const hx = Math.round(centerX + radiusX * Math.cos(angle));
        const hy = Math.round(centerY + radiusY * Math.sin(angle));
        // Switch edge intersection
        const px = Math.round(
          centerX + Math.min(switchBox.w / 2, Math.max(-switchBox.w / 2, (radiusX / 2.5) * Math.cos(angle))),
        );
        const py = Math.round(
          centerY + Math.min(switchBox.h / 2, Math.max(-switchBox.h / 2, (radiusY / 2.5) * Math.sin(angle))),
        );
        positions[h.port] = { x: hx, y: hy, portX: px, portY: py };
      });
    }

    return positions;
  };

  const positions = getNodePositions(hosts);

  // Active transmission states from simulation step
  const activeFrame = currentStep?.activeFrame;
  const ingressPort = currentStep?.ingressPort;
  const egressPorts = currentStep?.egressPorts ?? [];
  const decision = currentStep?.decision;
  const isEvaluatingSource = currentStep?.phase === 'source_evaluation';
  const isForwardingAction = currentStep?.phase === 'forwarding_action';

  const getPortState = (portNum: number): PortState['state'] => {
    const found = currentStep?.portStates.find((p) => p.port === portNum);
    return found ? found.state : 'idle';
  };

  return (
    <div
      className={`relative w-full rounded-2xl border border-border bg-surface-1/90 backdrop-blur-md overflow-hidden p-2 sm:p-4 shadow-lg select-none ${className}`}
      data-testid="switching-topology-canvas"
    >
      {/* Topology Header */}
      <div className="flex items-center justify-between px-2 pb-2 border-b border-border-soft text-xs text-text-dim">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono font-semibold tracking-wide text-text uppercase">
            Layer 2 Ethernet Broadcast Domain
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-text-muted">
            {hosts.length} Hosts &bull; 100BASE-TX Full-Duplex
          </span>
          {prefersReducedMotion && (
            <span className="px-2 py-0.5 rounded bg-surface-3 text-[10px] text-text-dim font-mono">
              Reduced Motion
            </span>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[16/10] max-h-[420px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Layer 2 Switch Topology Diagram"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="net-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path
                d="M 30 0 L 0 0 0 30"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border-soft/40"
              />
            </pattern>

            {/* Glowing gradients */}
            <radialGradient id="switch-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="packet-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Grid */}
          <rect width={width} height={height} fill="url(#net-grid)" />

          {/* Switch Ambient Glow */}
          <rect
            x={switchBox.x - 30}
            y={switchBox.y - 30}
            width={switchBox.w + 60}
            height={switchBox.h + 60}
            fill="url(#switch-glow)"
          />

          {/* Link Cables */}
          {hosts.map((host) => {
            const pos = positions[host.port];
            if (!pos) return null;

            const isIngress = ingressPort === host.port;
            const isEgress = egressPorts.includes(host.port);
            const portState = getPortState(host.port);

            let strokeColor = '#334155'; // default slate-700
            let strokeWidth = 2.5;
            let strokeDash = 'none';

            if (isEvaluatingSource && isIngress) {
              strokeColor = '#10b981'; // emerald
              strokeWidth = 3.5;
            } else if (isForwardingAction && isEgress) {
              strokeColor = decision === 'FLOOD_BROADCAST' || decision === 'FLOOD_UNKNOWN_UNICAST' ? '#a855f7' : '#eab308';
              strokeWidth = 3.5;
            } else if (portState === 'dropped') {
              strokeColor = '#ef4444';
              strokeDash = '4 4';
            }

            return (
              <g key={`cable-${host.id}`}>
                <line
                  x1={pos.x}
                  y1={pos.y}
                  x2={pos.portX}
                  y2={pos.portY}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  className="transition-all duration-300"
                />

                {/* Reduced-motion Direction Indicator */}
                {prefersReducedMotion && (
                  <>
                    {isEvaluatingSource && isIngress && (
                      <g
                        transform={`translate(${(pos.x + pos.portX) / 2}, ${(pos.y + pos.portY) / 2})`}
                      >
                        <circle r="12" fill="#10b981" />
                        <text
                          textAnchor="middle"
                          dy="4"
                          fontSize="10"
                          fill="#ffffff"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          IN
                        </text>
                      </g>
                    )}
                    {isForwardingAction && isEgress && (
                      <g
                        transform={`translate(${(pos.x + pos.portX) / 2}, ${(pos.y + pos.portY) / 2})`}
                      >
                        <circle
                          r="12"
                          fill={decision === 'FORWARD_KNOWN_UNICAST' ? '#eab308' : '#a855f7'}
                        />
                        <text
                          textAnchor="middle"
                          dy="4"
                          fontSize="9"
                          fill="#ffffff"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          OUT
                        </text>
                      </g>
                    )}
                    {portState === 'dropped' && (
                      <g
                        transform={`translate(${(pos.x + pos.portX) / 2}, ${(pos.y + pos.portY) / 2})`}
                      >
                        <circle r="11" fill="#ef4444" />
                        <text
                          textAnchor="middle"
                          dy="4"
                          fontSize="9"
                          fill="#ffffff"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          DROP
                        </text>
                      </g>
                    )}
                  </>
                )}

                {/* Animated Packet Marker (when reduced-motion is FALSE) */}
                {!prefersReducedMotion && (
                  <>
                    {/* Ingress packet traveling from Host -> Switch */}
                    {isEvaluatingSource && isIngress && (
                      <circle r="6" fill="#10b981" filter="drop-shadow(0 0 4px #10b981)">
                        <animateMotion
                          path={`M ${pos.x} ${pos.y} L ${pos.portX} ${pos.portY}`}
                          dur="1.2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Egress packet traveling from Switch -> Host */}
                    {isForwardingAction && isEgress && (
                      <circle
                        r="6"
                        fill={decision === 'FORWARD_KNOWN_UNICAST' ? '#eab308' : '#a855f7'}
                        filter="drop-shadow(0 0 4px #eab308)"
                      >
                        <animateMotion
                          path={`M ${pos.portX} ${pos.portY} L ${pos.x} ${pos.y}`}
                          dur="1.2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </>
                )}
              </g>
            );
          })}

          {/* Central Switch Chassis */}
          <g>
            <rect
              x={switchBox.x}
              y={switchBox.y}
              width={switchBox.w}
              height={switchBox.h}
              rx="12"
              fill="#0f172a"
              stroke="#38bdf8"
              strokeWidth="2"
              className="filter drop-shadow-md"
            />
            {/* Switch Title & Status */}
            <text
              x={switchBox.x + switchBox.w / 2}
              y={switchBox.y + 32}
              textAnchor="middle"
              fill="#f8fafc"
              fontSize="13"
              fontWeight="bold"
              fontFamily="monospace"
            >
              Switch-1
            </text>
            <text
              x={switchBox.x + switchBox.w / 2}
              y={switchBox.y + 48}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="9.5"
              fontFamily="monospace"
            >
              Layer 2 Bridge
            </text>

            {/* Switch Activity LED */}
            <circle
              cx={switchBox.x + switchBox.w / 2}
              cy={switchBox.y + 68}
              r="4.5"
              fill={currentStep ? '#10b981' : '#64748b'}
              className={currentStep ? 'animate-pulse' : ''}
            />
            <text
              x={switchBox.x + switchBox.w / 2}
              y={switchBox.y + 84}
              textAnchor="middle"
              fill={currentStep ? '#38bdf8' : '#64748b'}
              fontSize="8.5"
              fontFamily="monospace"
            >
              {currentStep ? (isEvaluatingSource ? 'LEARNING' : 'FORWARDING') : 'READY'}
            </text>
          </g>

          {/* Switch Ports */}
          {hosts.map((host) => {
            const pos = positions[host.port];
            if (!pos) return null;

            const isSelected = selectedPorts.includes(host.port);
            const isIngress = ingressPort === host.port;
            const isEgress = egressPorts.includes(host.port);
            const portState = getPortState(host.port);

            let portFill = '#1e293b';
            let portStroke = '#64748b';

            if (isSelected) {
              portStroke = '#f59e0b';
              portFill = '#78350f';
            } else if (isIngress) {
              portFill = '#064e3b';
              portStroke = '#10b981';
            } else if (isEgress) {
              portFill = decision === 'FORWARD_KNOWN_UNICAST' ? '#713f12' : '#581c87';
              portStroke = decision === 'FORWARD_KNOWN_UNICAST' ? '#eab308' : '#c084fc';
            } else if (portState === 'dropped') {
              portFill = '#450a0a';
              portStroke = '#ef4444';
            }

            return (
              <g
                key={`port-box-${host.port}`}
                className={interactivePortSelection ? 'cursor-pointer' : ''}
                onClick={() => onTogglePort?.(host.port)}
                role="button"
                tabIndex={interactivePortSelection ? 0 : -1}
                aria-label={`Switch Port ${host.port}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onTogglePort?.(host.port);
                  }
                }}
              >
                <circle
                  cx={pos.portX}
                  cy={pos.portY}
                  r="12"
                  fill={portFill}
                  stroke={portStroke}
                  strokeWidth="2"
                  className="transition-colors duration-200"
                />
                <text
                  x={pos.portX}
                  y={pos.portY + 3.5}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  P{host.port}
                </text>
              </g>
            );
          })}

          {/* Host Nodes */}
          {hosts.map((host) => {
            const pos = positions[host.port];
            if (!pos) return null;

            const isSender = activeFrame?.srcMac === host.mac;
            const isTarget = activeFrame?.dstMac === host.mac;
            const isBroadcasting = activeFrame?.dstMac === 'FF:FF:FF:FF:FF:FF';

            return (
              <g
                key={`host-${host.id}`}
                className="cursor-pointer"
                onClick={() =>
                  setInspectedNode(inspectedNode?.id === host.id ? null : { id: host.id, type: 'host' })
                }
                role="button"
                tabIndex={0}
                aria-label={`Host ${host.name}, MAC ${host.mac}, Port ${host.port}`}
              >
                {/* Host Card Container */}
                <rect
                  x={pos.x - 65}
                  y={pos.y - 30}
                  width="130"
                  height="60"
                  rx="10"
                  fill="#0b1329"
                  stroke={
                    isSender
                      ? '#10b981'
                      : isTarget
                        ? '#eab308'
                        : isBroadcasting
                          ? '#a855f7'
                          : '#334155'
                  }
                  strokeWidth={isSender || isTarget ? '2.5' : '1.5'}
                  className="filter drop-shadow transition-all duration-200"
                />

                {/* Host Name & Port Pill */}
                <text
                  x={pos.x - 55}
                  y={pos.y - 12}
                  fill="#f1f5f9"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {host.name}
                </text>
                <rect
                  x={pos.x + 18}
                  y={pos.y - 24}
                  width="38"
                  height="16"
                  rx="4"
                  fill="#1e293b"
                />
                <text
                  x={pos.x + 37}
                  y={pos.y - 12}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  Port {host.port}
                </text>

                {/* MAC Address */}
                <text
                  x={pos.x}
                  y={pos.y + 16}
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="9.5"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  {host.mac}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Inspect Node Popover / Tooltip */}
      {inspectedNode && (
        <div className="mt-2 p-2.5 rounded-lg bg-surface-2 border border-border-soft flex items-center justify-between text-xs font-mono">
          {(() => {
            const h = hosts.find((item) => item.id === inspectedNode.id);
            if (!h) return null;
            return (
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-text">{h.name}</span>
                <span className="text-text-dim">MAC: <b className="text-func">{h.mac}</b></span>
                <span className="text-text-dim">Switch Port: <b className="text-text">{h.port}</b></span>
                {h.ip && <span className="text-text-dim">IP: {h.ip}</span>}
              </div>
            );
          })()}
          <button
            onClick={() => setInspectedNode(null)}
            className="text-text-dim hover:text-text px-1 cursor-pointer"
            aria-label="Close Inspector"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};
