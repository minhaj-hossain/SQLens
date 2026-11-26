'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Scan, Move } from 'lucide-react';
import type { DayCanvasProps } from './days/types';
import { Day01To03Canvas } from './days/Day01To03Canvas';
import { Day04Canvas } from './days/Day04Canvas';
import { Day05Canvas } from './days/Day05Canvas';
import { Day06Canvas } from './days/Day06Canvas';
import { Day07Canvas } from './days/Day07Canvas';
import { Day08Canvas } from './days/Day08Canvas';
import { Day09Canvas } from './days/Day09Canvas';
import { Day10Canvas } from './days/Day10Canvas';
import { Day11Canvas } from './days/Day11Canvas';
import { Day12Canvas } from './days/Day12Canvas';
import { Day13Canvas } from './days/Day13Canvas';
import { Day14Canvas } from './days/Day14Canvas';
import { Day15Canvas } from './days/Day15Canvas';
import { Day16Canvas } from './days/Day16Canvas';
import { Day17Canvas } from './days/Day17Canvas';
import { Day18Canvas } from './days/Day18Canvas';
import { Day19Canvas } from './days/Day19Canvas';
import { Day20Canvas } from './days/Day20Canvas';
import { Day21Canvas } from './days/Day21Canvas';
import { Day22Canvas } from './days/Day22Canvas';
import { Day23Canvas } from './days/Day23Canvas';
import { Day24Canvas } from './days/Day24Canvas';

const DAY_CANVAS_MAP: Record<string, React.FC<DayCanvasProps>> = {
  'net-01': Day01To03Canvas,
  'net-02': Day01To03Canvas,
  'net-03': Day01To03Canvas,
  'net-04': Day04Canvas,
  'net-05': Day05Canvas,
  'net-06': Day06Canvas,
  'net-07': Day07Canvas,
  'net-08': Day08Canvas,
  'net-09': Day09Canvas,
  'net-10': Day10Canvas,
  'net-11': Day11Canvas,
  'net-12': Day12Canvas,
  'net-13': Day13Canvas,
  'net-14': Day14Canvas,
  'net-15': Day15Canvas,
  'net-16': Day16Canvas,
  'net-17': Day17Canvas,
  'net-18': Day18Canvas,
  'net-19': Day19Canvas,
  'net-20': Day20Canvas,
  'net-21': Day21Canvas,
  'net-22': Day22Canvas,
  'net-23': Day23Canvas,
  'net-24': Day24Canvas,
};

interface NetworkingCanvasProps {
  dayId: string;
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
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

// World coordinate dimensions tailored per module so networks can breathe
const DAY_WORLD_SPECS: Record<
  string,
  { width: number; height: number; title: string }
> = {
  'net-01': { width: 900, height: 460, title: 'DIRECT POINT-TO-POINT LINK' },
  'net-02': { width: 980, height: 500, title: 'LOCAL STAR TOPOLOGY' },
  'net-03': { width: 980, height: 520, title: 'SUBNETTING TOPOLOGY' },
  'net-04': { width: 1180, height: 520, title: 'ROUTER CONNECTING TWO SUBNETS' },
  'net-05': { width: 1380, height: 580, title: 'MULTI-ROUTER STATIC ROUTES TOPOLOGY' },
  'net-06': {
    width: 1480,
    height: 640,
    title: 'THE DEFAULT ROUTE & GLOBAL INTERNET ACCESS (0.0.0.0/0)',
  },
  'net-07': {
    width: 1180,
    height: 540,
    title: 'ARP: DISCOVERING NEIGHBOUR HARDWARE MAC ADDRESSES',
  },
  'net-08': {
    width: 1040,
    height: 520,
    title: 'LAYER 2 SWITCHING · MAC ADDRESS TABLE & FLOODING ENGINE',
  },
  'net-09': {
    width: 1180,
    height: 540,
    title: 'BROADCAST DOMAINS & ROUTER BOUNDARY ISOLATION',
  },
  'net-10': {
    width: 1080,
    height: 520,
    title: 'VLANS · LOGICAL SEGMENTATION ON A SINGLE SWITCH',
  },
  'net-11': {
    width: 1200,
    height: 540,
    title: '802.1Q TRUNKS · CARRYING MULTIPLE VLANS BETWEEN SWITCHES',
  },
  'net-12': {
    width: 1100,
    height: 560,
    title: 'ROUTER-ON-A-STICK · INTER-VLAN ROUTING VIA 802.1Q SUB-INTERFACES',
  },
  'net-13': {
    width: 1140,
    height: 560,
    title: 'SPANNING TREE PROTOCOL (IEEE 802.1D) · REDUNDANT LINKS & LOOP PREVENTION',
  },
  'net-14': {
    width: 1480,
    height: 560,
    title: 'ICMP & TTL · LAYER 3 DIAGNOSTICS & PATH DISCOVERY',
  },
  'net-15': {
    width: 1480,
    height: 560,
    title: 'TRACEROUTE · LATENCY, COPP & ASYMMETRIC PATH DISCOVERY',
  },
  'net-16': {
    width: 1480,
    height: 620,
    title: 'LAYER 4 TRANSPORT MULTIPLEXING · PORTS & SOCKETS',
  },
  'net-17': {
    width: 1480,
    height: 620,
    title: 'TCP CONNECTION LIFECYCLE · 3-WAY HANDSHAKE & 4-WAY TEARDOWN',
  },
  'net-18': {
    width: 1480,
    height: 620,
    title: 'TCP RELIABLE DELIVERY · SEQUENCE NUMBERS, ACKS, RTO & FLOW CONTROL',
  },
  'net-19': {
    width: 1480,
    height: 620,
    title: 'UDP: FAST AND SIMPLE · CONNECTIONLESS TRANSPORT & MINIMAL OVERHEAD',
  },
  'net-20': {
    width: 1480,
    height: 620,
    title: 'WHY DYNAMIC ROUTING · SCALABILITY, FAILOVER & IGP VS EGP',
  },
  'net-21': {
    width: 1480,
    height: 620,
    title: 'RIP: COUNTING HOPS · DISTANCE-VECTOR, 15-HOP LIMIT & LOOP PREVENTION',
  },
  'net-22': {
    width: 1480,
    height: 620,
    title: 'OSPF: SHARING THE MAP · LINK-STATE, AREA 0, COST & DIJKSTRA SPF',
  },
  'net-23': {
    width: 1480,
    height: 620,
    title: 'FAILOVER AND CONVERGENCE · LSA RE-FLOOD, SPF RERUN & BFD (15ms)',
  },
  'net-24': {
    width: 1480,
    height: 620,
    title: 'DHCP: AUTOMATIC ADDRESSING · DORA, POOLS, OPTIONS & LEASE TIMERS',
  },
};

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
  isExpanded = false,
  onToggleExpand,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const isDay1 = dayId === 'net-01';
  const isDay2 = dayId === 'net-02';
  const isDay3 = dayId === 'net-03';
  const isDay4 = dayId === 'net-04';
  const isDay5 = dayId === 'net-05';
  const isDay6 = dayId === 'net-06';

  // World bounds for active day
  const spec = DAY_WORLD_SPECS[dayId] || {
    width: 1200,
    height: 600,
    title: 'PHYSICAL WORKBENCH TOPOLOGY',
  };

  // Pan & Zoom state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const zoomRef = useRef<number>(1);

  // Keep refs synchronized
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // Progressive element reveal states
  const showDay1DirectWire = isDay1 && activeStepIndex < 4;
  const showSwitch = !isDay1 || activeStepIndex >= 4;
  const showPC3 = !isDay1 || activeStepIndex >= 4;
  const showPC4 = (isDay2 && activeStepIndex >= 2) || isDay4 || isDay5;

  const showIps = !isDay1 || activeStepIndex >= 1;
  const showMacs = (!isDay1 && !isDay4 && !isDay5) || activeStepIndex >= 3;
  const showSubnetLegend = isDay3 && activeStepIndex >= 1;

  const wireGlow =
    isDay1 && (activeStepIndex === 0 || completedSteps.has(0) || isLinkUp);
  const isDirectPinging =
    isDay1 && (activeStepIndex === 2 || isPinging || lastCommand.startsWith('ping'));
  const isSwitchPinging =
    !isDay1 && (isPinging || lastCommand.startsWith('ping'));

  const isPc3Subnet2 =
    isDay3 && (pc3Ip === '192.168.1.130' || activeStepIndex >= 3);
  const pc3Color = isPc3Subnet2 || isDay4 || isDay5 || isDay6 ? 'green' : 'blue';

  // Fit active topology to container bounds
  const fitToView = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const cw = el.clientWidth || 700;
    const ch = el.clientHeight || 300;

    // Pad by 30px
    const scaleX = (cw - 30) / spec.width;
    const scaleY = (ch - 30) / spec.height;
    const optimalZoom = Math.max(0.4, Math.min(scaleX, scaleY, 1.05));

    // Center in container
    const scaledW = spec.width * optimalZoom;
    const scaledH = spec.height * optimalZoom;
    const cx = (cw - scaledW) / 2;
    const cy = (ch - scaledH) / 2;

    setZoom(optimalZoom);
    setPan({ x: cx, y: cy });
  }, [spec.width, spec.height]);

  // Fit automatically when dayId or expanded mode changes
  useEffect(() => {
    fitToView();
  }, [dayId, fitToView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fitToView();
    }, 60);
    return () => clearTimeout(timer);
  }, [isExpanded, fitToView]);

  // Window resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      // Re-fit view if pan is 0 (initial)
      if (panRef.current.x === 0 && panRef.current.y === 0) {
        fitToView();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitToView]);

  // Mouse wheel zoom centered on cursor
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const currentZoom = zoomRef.current;
      const currentPan = panRef.current;

      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      const newZoom = Math.min(2.8, Math.max(0.4, currentZoom * zoomFactor));

      // Zoom centered on cursor
      const newPanX = mouseX - (mouseX - currentPan.x) * (newZoom / currentZoom);
      const newPanY = mouseY - (mouseY - currentPan.y) * (newZoom / currentZoom);

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Mouse drag panning
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on left click
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag panning for mobile & tablet viewports
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = {
      x: touch.clientX - pan.x,
      y: touch.clientY - pan.y,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStartRef.current.x,
      y: touch.clientY - dragStartRef.current.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    const el = containerRef.current;
    const cw = el?.clientWidth || 700;
    const ch = el?.clientHeight || 300;
    const newZoom = Math.min(2.8, zoom * 1.2);
    setPan((prev) => ({
      x: cw / 2 - (cw / 2 - prev.x) * (newZoom / zoom),
      y: ch / 2 - (ch / 2 - prev.y) * (newZoom / zoom),
    }));
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const el = containerRef.current;
    const cw = el?.clientWidth || 700;
    const ch = el?.clientHeight || 300;
    const newZoom = Math.max(0.4, zoom * 0.83);
    setPan((prev) => ({
      x: cw / 2 - (cw / 2 - prev.x) * (newZoom / zoom),
      y: ch / 2 - (ch / 2 - prev.y) * (newZoom / zoom),
    }));
    setZoom(newZoom);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#07090e] relative select-none overflow-hidden rounded-t-xl md:rounded-l-xl md:rounded-tr-none border-b md:border-b-0 md:border-r border-[#1b2230]">
      {/* Top Status Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1b2230] bg-[#0c1017] text-[11px] font-mono tracking-wider uppercase text-[#8e98a8] z-20 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></span>
          <span className="font-semibold text-[#ececf0]">PHYSICAL WORKBENCH</span>
        </div>
        <div className="text-[10.5px] text-[#64748b] hidden sm:block truncate max-w-[450px]">
          {spec.title}
        </div>
      </div>

      {/* Floating Canvas Pan & Zoom Toolbar */}
      <div className="absolute top-12 right-3 z-30 flex items-center gap-1 bg-[#0f1420]/90 backdrop-blur-md border border-[#222d42] p-1 rounded-lg shadow-xl text-[#94a3b8]">
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-7 h-7 grid place-items-center rounded hover:bg-[#1c2638] hover:text-[#ececf0] transition-colors"
          aria-label="Zoom out canvas"
        >
          <ZoomOut size={13} />
        </button>

        <span className="text-[11px] font-mono font-medium px-1.5 min-w-[40px] text-center text-[#ececf0]">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-7 h-7 grid place-items-center rounded hover:bg-[#1c2638] hover:text-[#ececf0] transition-colors"
          aria-label="Zoom in canvas"
        >
          <ZoomIn size={13} />
        </button>

        <div className="w-[1px] h-4 bg-[#222d42] mx-0.5" />

        <button
          onClick={fitToView}
          title="Fit view to window"
          className="px-2 h-7 flex items-center gap-1.5 rounded hover:bg-[#1c2638] hover:text-[#4ade80] text-[11px] font-mono transition-colors"
          aria-label="Fit canvas to view"
        >
          <Scan size={12} />
          <span>Fit</span>
        </button>

        {onToggleExpand && (
          <>
            <div className="w-[1px] h-4 bg-[#222d42] mx-0.5" />
            <button
              onClick={onToggleExpand}
              title={isExpanded ? 'Exit full canvas (Esc)' : 'Expand canvas to full workspace'}
              className={`px-2 h-7 flex items-center gap-1.5 rounded text-[11px] font-mono transition-colors ${
                isExpanded
                  ? 'bg-[#1e293b] text-[#38bdf8] hover:bg-[#283548]'
                  : 'hover:bg-[#1c2638] hover:text-[#ececf0]'
              }`}
              aria-label={isExpanded ? 'Exit full canvas' : 'Expand canvas to full workspace'}
            >
              {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              <span className="hidden sm:inline">{isExpanded ? 'Restore' : 'Expand'}</span>
            </button>
          </>
        )}
      </div>

      {/* Navigation Hint Badge */}
      <div className="absolute bottom-2.5 left-3 z-20 pointer-events-none hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[#64748b] bg-[#0c1017]/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-[#1b2230]">
        <Move size={11} className="text-[#4ade80]" />
        <span>Drag to Pan · Scroll to Zoom</span>
      </div>

      {/* Pannable & Zoomable Virtual Stage Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`flex-1 w-full h-full relative overflow-hidden touch-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* World Transform Layer */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: `${spec.width}px`,
            height: `${spec.height}px`,
            position: 'absolute',
            left: 0,
            top: 0,
          }}
          className="transition-transform duration-75 ease-out select-none"
        >
          <svg
            width={spec.width}
            height={spec.height}
            viewBox={`0 0 ${spec.width} ${spec.height}`}
            className="w-full h-full block"
          >
            {/* Ambient Background Grid */}
            <defs>
              <pattern
                id="world-grid"
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="15" cy="15" r="0.8" fill="#1c2538" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#world-grid)" />

            {(() => {
              const DayCanvas = DAY_CANVAS_MAP[dayId];
              if (!DayCanvas) return null;
              return (
                <DayCanvas
                  dayId={dayId}
                  activeStepIndex={activeStepIndex}
                  completedSteps={completedSteps}
                  lastCommand={lastCommand}
                  isPinging={isPinging}
                  pc3Ip={pc3Ip}
                  pc4Ip={pc4Ip}
                  isLinkUp={isLinkUp}
                  gateway={gateway}
                  r1Route={r1Route}
                  r2Route={r2Route}
                  r1DefaultRoute={r1DefaultRoute}
                  r2DefaultRoute={r2DefaultRoute}
                  isDay1={isDay1}
                  isDay2={isDay2}
                  isDay3={isDay3}
                  showDay1DirectWire={showDay1DirectWire}
                  showSwitch={showSwitch}
                  showPC3={showPC3}
                  showPC4={showPC4}
                  showIps={showIps}
                  showMacs={showMacs}
                  showSubnetLegend={showSubnetLegend}
                  wireGlow={wireGlow}
                  isDirectPinging={isDirectPinging}
                  isSwitchPinging={isSwitchPinging}
                  isPc3Subnet2={isPc3Subnet2}
                  pc3Color={pc3Color}
                />
              );
            })()}
          </svg>
        </div>
      </div>
    </div>
  );
};
