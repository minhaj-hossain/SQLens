'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SvgWorkstation } from './SvgWorkstation';
import { SvgSwitch } from './SvgSwitch';
import { SvgRouter } from './SvgRouter';
import { SvgCable } from './SvgCable';
import { ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';

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
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const isDay1 = dayId === 'net-01';
  const isDay2 = dayId === 'net-02';
  const isDay3 = dayId === 'net-03';
  const isDay4 = dayId === 'net-04';
  const isDay5 = dayId === 'net-05';
  const isDay6 = dayId === 'net-06';
  const isDay7 = dayId === 'net-07';
  const isDay8 = dayId === 'net-08';
  const isDay9 = dayId === 'net-09';
  const isDay10 = dayId === 'net-10';
  const isDay11 = dayId === 'net-11';

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

  // Fit automatically when dayId changes
  useEffect(() => {
    fitToView();
  }, [dayId, fitToView]);

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
          <Maximize2 size={12} />
          <span>Fit</span>
        </button>
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
        className={`flex-1 w-full h-full relative overflow-hidden ${
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

            {/* ========================================================
                DAY 1 - DAY 3: SPACIOUS LOCAL SUBNET TOPOLOGIES
                ======================================================== */}
            {(isDay1 || isDay2 || isDay3) && (
              <>
                {/* Day 1 Direct Wire: PC1 to PC2 */}
                {showDay1DirectWire && (
                  <SvgCable
                    x1={206}
                    y1={230}
                    x2={694}
                    y2={230}
                    glow={wireGlow}
                    color="#4ade80"
                    isTransmitting={isDirectPinging}
                  />
                )}

                {/* Switch Topologies */}
                {showSwitch && (
                  <g className="transition-opacity duration-500">
                    {/* PC1 to SW1 Port 1 */}
                    <SvgCable
                      x1={206}
                      y1={230}
                      x2={395}
                      y2={230}
                      glow={true}
                      color="#4ade80"
                      isTransmitting={isSwitchPinging && lastCommand.includes('192.168.1.')}
                    />

                    {/* PC2 to SW1 Port 2 */}
                    <SvgCable
                      x1={505}
                      y1={230}
                      x2={694}
                      y2={230}
                      glow={true}
                      color="#4ade80"
                      isTransmitting={isSwitchPinging && lastCommand.includes('192.168.1.20')}
                    />

                    {/* PC3 to SW1 Port 3 */}
                    {showPC3 && (
                      <SvgCable
                        x1={450}
                        y1={130}
                        x2={450}
                        y2={201}
                        glow={true}
                        color={isPc3Subnet2 ? '#4ade80' : '#60a5fa'}
                        isTransmitting={isSwitchPinging && lastCommand.includes(pc3Ip)}
                      />
                    )}

                    {/* PC4 to SW1 Port 4 */}
                    {showPC4 && (
                      <SvgCable
                        x1={450}
                        y1={259}
                        x2={450}
                        y2={330}
                        glow={true}
                        color="#4ade80"
                        isTransmitting={isSwitchPinging && lastCommand.includes(pc4Ip)}
                      />
                    )}
                  </g>
                )}

                {/* PC1 Workstation */}
                <SvgWorkstation
                  x={120}
                  y={194}
                  name="PC1"
                  ip="192.168.1.10"
                  mac="AA:BB:CC:00:00:01"
                  ipColor="blue"
                  showIp={showIps}
                  showMac={showMacs}
                  isLinked={wireGlow || showSwitch}
                  isPinging={isDirectPinging}
                />

                {/* PC2 Workstation */}
                <SvgWorkstation
                  x={694}
                  y={194}
                  name="PC2"
                  ip="192.168.1.20"
                  mac="AA:BB:CC:00:00:02"
                  ipColor="blue"
                  showIp={showIps}
                  showMac={showMacs}
                  isLinked={wireGlow || showSwitch}
                  isPinging={isDirectPinging}
                />

                {/* Central Ethernet Switch */}
                {showSwitch && (
                  <SvgSwitch
                    x={395}
                    y={201}
                    port1Active={true}
                    port2Active={true}
                    port3Active={showPC3}
                    port4Active={showPC4}
                    isPinging={isSwitchPinging}
                  />
                )}

                {/* PC3 (Top) */}
                {showPC3 && (
                  <SvgWorkstation
                    x={407}
                    y={50}
                    name="PC3"
                    ip={pc3Ip}
                    mac="AA:BB:CC:00:00:03"
                    ipColor={pc3Color}
                    showIp={showIps}
                    showMac={showMacs}
                    isLinked={true}
                  />
                )}

                {/* PC4 (Bottom) */}
                {showPC4 && (
                  <SvgWorkstation
                    x={407}
                    y={330}
                    name="PC4"
                    ip={pc4Ip}
                    mac="AA:BB:CC:00:00:04"
                    ipColor={pc4Ip.startsWith('192.168.1.') ? 'blue' : 'default'}
                    showIp={true}
                    showMac={false}
                    isLinked={true}
                  />
                )}

                {/* Subnet Legend on Day 3 */}
                {showSubnetLegend && (
                  <g transform="translate(300, 430)">
                    <rect
                      x="-10"
                      y="-14"
                      width="380"
                      height="28"
                      rx="14"
                      fill="#0d111a"
                      stroke="#1e293b"
                      strokeWidth="1.5"
                    />
                    <circle cx="20" cy="0" r="4.5" fill="#60a5fa" />
                    <text
                      x="32"
                      y="4"
                      fill="#60a5fa"
                      fontSize="11.5"
                      fontWeight="600"
                      fontFamily="ui-monospace, Menlo, Consolas, monospace"
                    >
                      Subnet 1 · 192.168.1.0/25
                    </text>
                    <circle cx="215" cy="0" r="4.5" fill="#4ade80" />
                    <text
                      x="227"
                      y="4"
                      fill="#4ade80"
                      fontSize="11.5"
                      fontWeight="600"
                      fontFamily="ui-monospace, Menlo, Consolas, monospace"
                    >
                      Subnet 2 · 192.168.1.128/25
                    </text>
                  </g>
                )}
              </>
            )}

            {/* ========================================================
                DAY 4: THE ROUTER CONNECTING TWO SUBNETS
                De-cramped with generous 1180px width
                ======================================================== */}
            {isDay4 && (
              <>
                {/* Subnet Boundaries / Section Boxes */}
                {/* Subnet 1 Box */}
                <rect
                  x={40}
                  y={40}
                  width={420}
                  height={440}
                  rx={16}
                  fill="#0c121e"
                  fillOpacity="0.4"
                  stroke="#1e293b"
                  strokeDasharray="6 6"
                />
                <text
                  x={70}
                  y={75}
                  fill="#60a5fa"
                  fontSize="12.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  SUBNET 1 · 192.168.1.0/25
                </text>

                {/* Subnet 2 Box */}
                <rect
                  x={780}
                  y={40}
                  width={340}
                  height={440}
                  rx={16}
                  fill="#0a1510"
                  fillOpacity="0.4"
                  stroke="#1b382b"
                  strokeDasharray="6 6"
                />
                <text
                  x={810}
                  y={75}
                  fill="#4ade80"
                  fontSize="12.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  SUBNET 2 · 192.168.1.128/25
                </text>

                {/* Cables */}
                {/* PC1 to SW1 Port 1 */}
                <SvgCable
                  x1={166}
                  y1={146}
                  x2={280}
                  y2={220}
                  color="#4ade80"
                  isTransmitting={isSwitchPinging}
                />
                {/* PC2 to SW1 Port 2 */}
                <SvgCable
                  x1={166}
                  y1={336}
                  x2={280}
                  y2={250}
                  color="#4ade80"
                />
                {/* PC4 to SW1 Port 4 */}
                <SvgCable
                  x1={335}
                  y1={268}
                  x2={335}
                  y2={340}
                  color="#4ade80"
                />
                {/* SW1 Port 3 to Router R1 Port 1 */}
                <SvgCable
                  x1={390}
                  y1={235}
                  x2={530}
                  y2={235}
                  color="#4ade80"
                  isTransmitting={isSwitchPinging}
                />
                {/* Router R1 Port 2 to PC3 */}
                <SvgCable
                  x1={644}
                  y1={235}
                  x2={860}
                  y2={235}
                  color="#4ade80"
                  isTransmitting={isSwitchPinging}
                />

                {/* PC1 */}
                <SvgWorkstation
                  x={80}
                  y={110}
                  name="PC1"
                  ip="192.168.1.10"
                  ipColor="blue"
                  showIp={true}
                />
                {/* Gateway readout above PC1 */}
                {activeStepIndex >= 2 && (
                  <text
                    x={123}
                    y={98}
                    textAnchor="middle"
                    fill={gateway === 'none' ? '#ef4444' : '#60a5fa'}
                    fontSize="11"
                    fontFamily="ui-monospace, monospace"
                    fontWeight="600"
                  >
                    {gateway === 'none' ? 'no gateway' : `gw: ${gateway}`}
                  </text>
                )}

                {/* PC2 */}
                <SvgWorkstation
                  x={80}
                  y={300}
                  name="PC2"
                  ip="192.168.1.20"
                  ipColor="blue"
                  showIp={true}
                />

                {/* SW1 Switch */}
                <SvgSwitch
                  x={280}
                  y={210}
                  port1Active={true}
                  port2Active={true}
                  port3Active={true}
                  port4Active={true}
                />

                {/* PC4 */}
                <SvgWorkstation
                  x={292}
                  y={340}
                  name="PC4"
                  ip="192.168.1.40"
                  ipColor="blue"
                  showIp={true}
                />

                {/* Router R1 */}
                <SvgRouter
                  x={530}
                  y={201}
                  name="Router R1"
                  port1Ip={activeStepIndex >= 1 ? '192.168.1.1' : undefined}
                  port2Ip={activeStepIndex >= 1 ? '192.168.1.129' : undefined}
                  port1Active={true}
                  port2Active={true}
                  showPortIps={activeStepIndex >= 1}
                  isPinging={isSwitchPinging}
                />

                {/* PC3 in Subnet 2 */}
                <SvgWorkstation
                  x={860}
                  y={199}
                  name="PC3"
                  ip="192.168.1.130"
                  ipColor="green"
                  showIp={true}
                />
              </>
            )}

            {/* ========================================================
                DAY 5: STATIC ROUTES & DISTANT NETWORKS
                De-cramped with generous 1380px width
                ======================================================== */}
            {isDay5 && (
              <>
                {/* Subnet 1 Box */}
                <rect
                  x={30}
                  y={40}
                  width={390}
                  height={490}
                  rx={16}
                  fill="#0c121e"
                  fillOpacity="0.4"
                  stroke="#1e293b"
                  strokeDasharray="6 6"
                />
                <text
                  x={60}
                  y={75}
                  fill="#60a5fa"
                  fontSize="12.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  SUBNET 1 · 192.168.1.0/25
                </text>

                {/* Transit Network Label */}
                <text
                  x={675}
                  y={185}
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  TRANSIT LINK · 192.168.2.0/24
                </text>

                {/* Subnet 2 Box (Below R1) */}
                <rect
                  x={440}
                  y={340}
                  width={210}
                  height={190}
                  rx={12}
                  fill="#0a1510"
                  fillOpacity="0.4"
                  stroke="#1b382b"
                  strokeDasharray="6 6"
                />
                <text
                  x={460}
                  y={365}
                  fill="#4ade80"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  SUBNET 2 (PC3)
                </text>

                {/* Subnet 3 Box (PC5) */}
                <rect
                  x={980}
                  y={40}
                  width={340}
                  height={490}
                  rx={16}
                  fill="#0a1510"
                  fillOpacity="0.4"
                  stroke="#1b382b"
                  strokeDasharray="6 6"
                />
                <text
                  x={1010}
                  y={75}
                  fill="#4ade80"
                  fontSize="12.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  SUBNET 3 · 192.168.3.0/24
                </text>

                {/* Cables */}
                {/* PC1 to SW1 */}
                <SvgCable x1={156} y1={136} x2={260} y2={210} color="#4ade80" />
                {/* PC2 to SW1 */}
                <SvgCable x1={156} y1={336} x2={260} y2={240} color="#4ade80" />
                {/* PC4 to SW1 */}
                <SvgCable x1={315} y1={258} x2={315} y2={350} color="#4ade80" />
                {/* SW1 to R1 */}
                <SvgCable x1={370} y1={225} x2={480} y2={225} color="#4ade80" />
                {/* R1 Port 2 to PC3 */}
                <SvgCable x1={537} y1={269} x2={537} y2={385} color="#4ade80" />
                {/* R1 Port 3 to R2 Port 1 */}
                <SvgCable
                  x1={594}
                  y1={225}
                  x2={760}
                  y2={225}
                  color="#4ade80"
                  isTransmitting={isSwitchPinging}
                />
                {/* R2 Port 2 to PC5 */}
                {activeStepIndex >= 1 && (
                  <SvgCable
                    x1={874}
                    y1={225}
                    x2={1060}
                    y2={225}
                    color="#4ade80"
                    isTransmitting={isSwitchPinging && r1Route}
                  />
                )}

                {/* PC1 */}
                <SvgWorkstation x={70} y={100} name="PC1" ip="192.168.1.10" ipColor="blue" showIp={true} />
                <text x={113} y={88} textAnchor="middle" fill="#60a5fa" fontSize="10.5" fontFamily="monospace">
                  gw: 192.168.1.1
                </text>

                {/* PC2 */}
                <SvgWorkstation x={70} y={300} name="PC2" ip="192.168.1.20" ipColor="blue" showIp={true} />

                {/* Switch SW1 */}
                <SvgSwitch x={260} y={200} port1Active={true} port2Active={true} port3Active={true} port4Active={true} />

                {/* PC4 */}
                <SvgWorkstation x={272} y={350} name="PC4" ip="192.168.1.40" ipColor="blue" showIp={true} />

                {/* Router R1 */}
                <SvgRouter
                  x={480}
                  y={191}
                  name="Router R1"
                  port1Ip="192.168.1.1"
                  port2Ip="192.168.1.129"
                  port3Ip="192.168.2.1"
                  port1Active={true}
                  port2Active={true}
                  port3Active={true}
                  showPortIps={true}
                  staticRouteText={r1Route || activeStepIndex >= 3 ? '192.168.3.0/24 via 192.168.2.2' : undefined}
                  isPinging={isSwitchPinging}
                />

                {/* PC3 */}
                <SvgWorkstation x={494} y={385} name="PC3" ip="192.168.1.130" ipColor="green" showIp={true} />

                {/* Router R2 */}
                <SvgRouter
                  x={760}
                  y={191}
                  name="Router R2"
                  port1Ip="192.168.2.2"
                  port2Ip={activeStepIndex >= 1 ? '192.168.3.1' : 'no cable'}
                  port1Active={true}
                  port2Active={activeStepIndex >= 1}
                  port3Active={false}
                  showPortIps={true}
                  staticRouteText={r2Route || activeStepIndex >= 5 ? '192.168.1.0/24 via 192.168.2.1' : undefined}
                  isPinging={isSwitchPinging}
                />

                {/* PC5 */}
                {activeStepIndex >= 1 && (
                  <SvgWorkstation
                    x={1060}
                    y={189}
                    name="PC5"
                    ip="192.168.3.10"
                    ipColor="blue"
                    showIp={true}
                  />
                )}
              </>
            )}

            {/* ========================================================
                DAY 6: THE DEFAULT ROUTE & GLOBAL INTERNET
                De-cramped with dual-tier 1480px width
                ======================================================== */}
            {isDay6 && (
              <>
                {/* Global Internet Upper Tier Box */}
                <rect
                  x={640}
                  y={30}
                  width={560}
                  height={150}
                  rx={16}
                  fill="#0c182a"
                  fillOpacity="0.4"
                  stroke="#1d3858"
                  strokeDasharray="6 6"
                />
                <text
                  x={670}
                  y={58}
                  fill="#60a5fa"
                  fontSize="12.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  GLOBAL INTERNET · 203.0.113.0/24 &amp; 198.51.100.0/24
                </text>

                {/* Public link label */}
                <text
                  x={620}
                  y={150}
                  textAnchor="middle"
                  fill="#60a5fa"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  Public 203.0.113.0/24
                </text>

                {/* Cables */}
                {/* PC1 to SW1 */}
                <SvgCable x1={156} y1={246} x2={260} y2={320} color="#4ade80" />
                {/* PC2 to SW1 */}
                <SvgCable x1={156} y1={446} x2={260} y2={350} color="#4ade80" />
                {/* PC4 to SW1 */}
                <SvgCable x1={315} y1={368} x2={315} y2={450} color="#4ade80" />
                {/* SW1 to R1 */}
                <SvgCable
                  x1={370}
                  y1={335}
                  x2={480}
                  y2={335}
                  color="#4ade80"
                  isTransmitting={isSwitchPinging}
                />
                {/* R1 Port 2 to PC3 */}
                <SvgCable x1={537} y1={379} x2={537} y2={470} color="#4ade80" />
                {/* R1 Port 3 to R2 Port 1 */}
                <SvgCable x1={594} y1={335} x2={780} y2={335} color="#4ade80" />
                {/* R2 Port 2 to PC5 */}
                <SvgCable x1={894} y1={335} x2={1080} y2={335} color="#4ade80" />

                {/* Public Outside Cables: R1 Port 4 to Router ISP Port 1 */}
                <SvgCable
                  x1={550}
                  y1={301}
                  x2={710}
                  y2={110}
                  color="#60a5fa"
                  isTransmitting={isSwitchPinging && (lastCommand.includes('198.51.100.') || r1DefaultRoute)}
                />

                {/* Router ISP to Web Server */}
                {activeStepIndex >= 1 && (
                  <SvgCable
                    x1={824}
                    y1={104}
                    x2={1040}
                    y2={104}
                    color="#60a5fa"
                    isTransmitting={isSwitchPinging && r1DefaultRoute}
                  />
                )}

                {/* Lower Tier Devices */}
                {/* PC1 */}
                <SvgWorkstation x={70} y={210} name="PC1" ip="192.168.1.10" ipColor="blue" showIp={true} />
                <text x={113} y={198} textAnchor="middle" fill="#60a5fa" fontSize="10.5" fontFamily="monospace">
                  gw: 192.168.1.1
                </text>

                {/* PC2 */}
                <SvgWorkstation x={70} y={410} name="PC2" ip="192.168.1.20" ipColor="blue" showIp={true} />

                {/* Switch SW1 */}
                <SvgSwitch x={260} y={310} port1Active={true} port2Active={true} port3Active={true} port4Active={true} />

                {/* PC4 */}
                <SvgWorkstation x={272} y={450} name="PC4" ip="192.168.1.40" ipColor="blue" showIp={true} />

                {/* Router R1 (Edge Router) */}
                <SvgRouter
                  x={480}
                  y={301}
                  name="Router R1"
                  port1Ip="192.168.1.1"
                  port2Ip="192.168.1.129"
                  port3Ip="203.0.113.2"
                  port1Active={true}
                  port2Active={true}
                  port3Active={true}
                  showPortIps={true}
                  staticRouteText={r1DefaultRoute || activeStepIndex >= 2 ? '0.0.0.0/0 via 203.0.113.1' : undefined}
                  isPinging={isSwitchPinging}
                />

                {/* PC3 */}
                <SvgWorkstation x={494} y={470} name="PC3" ip="192.168.1.130" ipColor="green" showIp={true} />

                {/* Router R2 (Internal Router) */}
                <SvgRouter
                  x={780}
                  y={301}
                  name="Router R2"
                  port1Ip="192.168.2.2"
                  port2Ip="192.168.3.1"
                  port1Active={true}
                  port2Active={true}
                  port3Active={false}
                  showPortIps={true}
                  staticRouteText={r2DefaultRoute || activeStepIndex >= 4 ? '0.0.0.0/0 via 192.168.2.1' : undefined}
                  isPinging={isSwitchPinging}
                />

                {/* PC5 */}
                <SvgWorkstation x={1080} y={299} name="PC5" ip="192.168.3.10" ipColor="blue" showIp={true} />

                {/* Upper Tier Devices */}
                {/* Router ISP */}
                <SvgRouter
                  x={710}
                  y={70}
                  name="Router ISP"
                  port1Ip="203.0.113.1"
                  port2Ip={activeStepIndex >= 1 ? '198.51.100.1' : undefined}
                  port1Active={true}
                  port2Active={activeStepIndex >= 1}
                  port3Active={false}
                  showPortIps={true}
                  isPinging={isSwitchPinging && r1DefaultRoute}
                />

                {/* Web Server */}
                {activeStepIndex >= 1 && (
                  <SvgWorkstation
                    x={1040}
                    y={68}
                    name="Web Server"
                    ip="198.51.100.10"
                    ipColor="green"
                    showIp={true}
                  />
                )}
              </>
            )}

            {/* ========================================================
                DAY 7: ARP & HARDWARE NEIGHBOUR DISCOVERY
                PC1, PC2, Switch, Router R1, and Distant PC5 with ARP cache HUD
                ======================================================== */}
            {isDay7 && (
              <>
                {/* Local Subnet 1 Container Box */}
                <rect
                  x={30}
                  y={40}
                  width={490}
                  height={450}
                  rx={16}
                  fill="#0c121e"
                  fillOpacity="0.45"
                  stroke="#1e293b"
                  strokeDasharray="6 6"
                />
                <text
                  x={60}
                  y={75}
                  fill="#60a5fa"
                  fontSize="12.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  LOCAL SUBNET 1 · 192.168.1.0/24 (BROADCAST DOMAIN)
                </text>

                {/* Distant Subnet 3 Container Box */}
                <rect
                  x={750}
                  y={40}
                  width={380}
                  height={450}
                  rx={16}
                  fill="#0a1510"
                  fillOpacity="0.4"
                  stroke="#1b382b"
                  strokeDasharray="6 6"
                />
                <text
                  x={780}
                  y={75}
                  fill="#4ade80"
                  fontSize="12.5"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  DISTANT SUBNET 3 · 192.168.3.0/24
                </text>

                {/* Cables */}
                {/* PC1 to SW1 Port 1 */}
                <SvgCable
                  x1={156}
                  y1={146}
                  x2={280}
                  y2={220}
                  color="#4ade80"
                  isTransmitting={isSwitchPinging}
                />
                {/* PC2 to SW1 Port 2 */}
                <SvgCable
                  x1={156}
                  y1={356}
                  x2={280}
                  y2={250}
                  color="#4ade80"
                  isTransmitting={isSwitchPinging && (lastCommand.includes('192.168.1.20') || activeStepIndex === 2)}
                />
                {/* SW1 Port 3 to Router R1 Port 1 */}
                <SvgCable
                  x1={390}
                  y1={235}
                  x2={540}
                  y2={235}
                  color="#4ade80"
                  isTransmitting={isSwitchPinging && (lastCommand.includes('192.168.3.10') || activeStepIndex >= 4)}
                />
                {/* Router R1 Port 2 to PC5 */}
                <SvgCable
                  x1={654}
                  y1={235}
                  x2={840}
                  y2={235}
                  color="#4ade80"
                  isTransmitting={isSwitchPinging && lastCommand.includes('192.168.3.10')}
                />

                {/* PC1 */}
                <SvgWorkstation
                  x={70}
                  y={110}
                  name="PC1"
                  ip="192.168.1.10"
                  mac="AA:BB:CC:00:00:01"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* PC2 */}
                <SvgWorkstation
                  x={70}
                  y={320}
                  name="PC2"
                  ip="192.168.1.20"
                  mac="AA:BB:CC:00:00:02"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* Switch SW1 */}
                <SvgSwitch
                  x={280}
                  y={210}
                  port1Active={true}
                  port2Active={true}
                  port3Active={true}
                  port4Active={false}
                />

                {/* Router R1 */}
                <SvgRouter
                  x={540}
                  y={201}
                  name="Router R1"
                  port1Ip="192.168.1.1"
                  port2Ip="192.168.3.1"
                  port1Active={true}
                  port2Active={true}
                  showPortIps={true}
                  isPinging={isSwitchPinging}
                />
                {/* Router R1 Port 1 MAC label */}
                <text
                  x={597}
                  y={188}
                  textAnchor="middle"
                  fill="#a1a1aa"
                  fontSize="10"
                  fontFamily="ui-monospace, monospace"
                >
                  P1 MAC: AA:BB:CC:00:A1:01
                </text>

                {/* Distant PC5 */}
                <SvgWorkstation
                  x={840}
                  y={199}
                  name="PC5"
                  ip="192.168.3.10"
                  mac="AA:BB:CC:00:00:05"
                  ipColor="green"
                  showIp={true}
                  showMac={true}
                />

                {/* Interactive ARP Cache Table HUD under PC1 */}
                <g transform="translate(60, 205)">
                  <rect
                    width={200}
                    height={98}
                    rx={8}
                    fill="#080c14"
                    stroke="#27272a"
                    strokeWidth={1}
                  />
                  <rect
                    width={200}
                    height={22}
                    rx={8}
                    fill="#101726"
                  />
                  <text
                    x={10}
                    y={15}
                    fill="#38bdf8"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="ui-monospace, monospace"
                    letterSpacing="0.05em"
                  >
                    ARP CACHE · PC1
                  </text>
                  <text
                    x={190}
                    y={15}
                    textAnchor="end"
                    fill="#71717a"
                    fontSize="9.5"
                    fontFamily="monospace"
                  >
                    {activeStepIndex === 0
                      ? '0 entries'
                      : activeStepIndex < 4
                      ? '1 entry'
                      : '2 entries'}
                  </text>

                  {/* Table Contents based on Step */}
                  {activeStepIndex === 0 ? (
                    <text
                      x={100}
                      y={60}
                      textAnchor="middle"
                      fill="#71717a"
                      fontSize="10.5"
                      fontFamily="monospace"
                      fontStyle="italic"
                    >
                      (empty · no entries learned)
                    </text>
                  ) : activeStepIndex === 1 ? (
                    <g>
                      <text
                        x={100}
                        y={50}
                        textAnchor="middle"
                        fill="#fbbf24"
                        fontSize="10.5"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        Searching FF:FF:FF:FF:FF:FF
                      </text>
                      <text
                        x={100}
                        y={68}
                        textAnchor="middle"
                        fill="#71717a"
                        fontSize="9.5"
                        fontFamily="monospace"
                      >
                        Who has 192.168.1.20?
                      </text>
                    </g>
                  ) : (
                    <g>
                      {/* Entry 1: PC2 */}
                      <g transform="translate(10, 38)">
                        <circle cx={4} cy={-3} r={2.5} fill="#4ade80" />
                        <text x={12} y={0} fill="#f1f5f9" fontSize="10" fontFamily="monospace" fontWeight="500">
                          192.168.1.20
                        </text>
                        <text x={95} y={0} fill="#4ade80" fontSize="9.5" fontFamily="monospace">
                          ..00:00:02
                        </text>
                        <text x={175} y={0} textAnchor="end" fill="#71717a" fontSize="9" fontFamily="monospace">
                          14s
                        </text>
                      </g>

                      {/* Entry 2: Router R1 (Step 4+) */}
                      {activeStepIndex >= 4 ? (
                        <g transform="translate(10, 58)">
                          <circle cx={4} cy={-3} r={2.5} fill="#60a5fa" />
                          <text x={12} y={0} fill="#f1f5f9" fontSize="10" fontFamily="monospace" fontWeight="500">
                            192.168.1.1
                          </text>
                          <text x={95} y={0} fill="#60a5fa" fontSize="9.5" fontFamily="monospace">
                            ..00:A1:01
                          </text>
                          <text x={175} y={0} textAnchor="end" fill="#71717a" fontSize="9" fontFamily="monospace">
                            4s
                          </text>
                        </g>
                      ) : (
                        <text x={10} y={60} fill="#52525b" fontSize="9" fontFamily="monospace" fontStyle="italic">
                          + awaiting gateway...
                        </text>
                      )}

                      {/* Distant Host Note (Step 4+) */}
                      {activeStepIndex >= 4 && (
                        <text x={10} y={84} fill="#a1a1aa" fontSize="8.5" fontFamily="monospace">
                          * 192.168.3.10 routed via R1
                        </text>
                      )}
                    </g>
                  )}
                </g>

                {/* Animated ARP Broadcast Callout (Step 1 / debug arp on) */}
                {(activeStepIndex === 1 || lastCommand === 'debug arp on') && (
                  <g transform="translate(345, 150)">
                    <rect
                      x={-110}
                      y={-14}
                      width={220}
                      height={26}
                      rx={6}
                      fill="#1c1917"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      className="animate-pulse"
                    />
                    <text
                      x={0}
                      y={3}
                      textAnchor="middle"
                      fill="#fbbf24"
                      fontSize="10"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      ARP Request ➔ FF:FF:FF:FF:FF:FF
                    </text>
                  </g>
                )}

                {/* Animated ARP Reply Callout (Step 2 / ping 192.168.1.20) */}
                {(activeStepIndex === 2 || lastCommand === 'ping 192.168.1.20') && (
                  <g transform="translate(180, 290)">
                    <rect
                      x={-100}
                      y={-14}
                      width={200}
                      height={26}
                      rx={6}
                      fill="#062e1e"
                      stroke="#4ade80"
                      strokeWidth={1.5}
                    />
                    <text
                      x={0}
                      y={3}
                      textAnchor="middle"
                      fill="#4ade80"
                      fontSize="9.5"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      ARP Reply: ..00:00:02 to PC1
                    </text>
                  </g>
                )}

                {/* Animated Gateway ARP Callout (Step 4 / ping 192.168.3.10) */}
                {(activeStepIndex === 4 || lastCommand === 'ping 192.168.3.10') && (
                  <g transform="translate(460, 160)">
                    <rect
                      x={-105}
                      y={-14}
                      width={210}
                      height={26}
                      rx={6}
                      fill="#0b243b"
                      stroke="#38bdf8"
                      strokeWidth={1.5}
                    />
                    <text
                      x={0}
                      y={3}
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="9.5"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      Gateway MAC: AA:BB:CC:00:A1:01
                    </text>
                  </g>
                )}
              </>
            )}

            {/* ========================================================
                DAY 8: HOW A SWITCH LEARNS: THE MAC ADDRESS TABLE
                Switch SW1 with 4 PCs, MAC Table HUD, and Flooding/Selective Forwarding
                ======================================================== */}
            {isDay8 && (
              <>
                {/* Local Star Topology Container Box */}
                <rect
                  x={30}
                  y={25}
                  width={640}
                  height={470}
                  rx={16}
                  fill="#0c121e"
                  fillOpacity="0.45"
                  stroke="#1e293b"
                  strokeDasharray="6 6"
                />
                <text
                  x={50}
                  y={52}
                  fill="#38bdf8"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="monospace"
                  letterSpacing="0.05em"
                >
                  LOCAL STAR TOPOLOGY · SWITCH SW1 (SINGLE BROADCAST DOMAIN)
                </text>

                {/* Cables */}
                {/* PC1 to SW1 Port 1 */}
                <SvgCable
                  x1={206}
                  y1={234}
                  x2={450}
                  y2={234}
                  color="#4ade80"
                  isTransmitting={isSwitchPinging || activeStepIndex === 1 || activeStepIndex === 3}
                />
                {/* SW1 Port 2 to PC2 */}
                <SvgCable
                  x1={562}
                  y1={234}
                  x2={780}
                  y2={234}
                  color={activeStepIndex === 2 ? '#fbbf24' : '#4ade80'}
                  isTransmitting={isSwitchPinging || activeStepIndex === 2 || activeStepIndex === 3}
                />
                {/* SW1 Port 3 to PC3 */}
                <SvgCable
                  x1={506}
                  y1={97}
                  x2={506}
                  y2={210}
                  color={activeStepIndex === 2 ? '#fbbf24' : '#4ade80'}
                  isTransmitting={activeStepIndex === 2}
                />
                {/* SW1 Port 4 to PC4 */}
                <SvgCable
                  x1={506}
                  y1={258}
                  x2={506}
                  y2={375}
                  color={activeStepIndex === 2 ? '#fbbf24' : '#4ade80'}
                  isTransmitting={activeStepIndex === 2}
                />

                {/* PC1 (Left) */}
                <SvgWorkstation
                  x={120}
                  y={204}
                  name="PC1"
                  ip="192.168.1.10"
                  mac="AA:BB:CC:00:00:01"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* PC2 (Right) */}
                <SvgWorkstation
                  x={780}
                  y={204}
                  name="PC2"
                  ip="192.168.1.20"
                  mac="AA:BB:CC:00:00:02"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* PC3 (Top) */}
                <SvgWorkstation
                  x={463}
                  y={45}
                  name="PC3"
                  ip="192.168.1.30"
                  mac="AA:BB:CC:00:00:03"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* PC4 (Bottom) */}
                <SvgWorkstation
                  x={463}
                  y={375}
                  name="PC4"
                  ip="192.168.1.40"
                  mac="AA:BB:CC:00:00:04"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* Switch SW1 (Center) */}
                <SvgSwitch
                  x={450}
                  y={210}
                  port1Active={true}
                  port2Active={activeStepIndex >= 2}
                  port3Active={true}
                  port4Active={true}
                  isPinging={isSwitchPinging}
                />

                {/* Switch Port Number Labels */}
                <text
                  x={438}
                  y={238}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  P1
                </text>
                <text
                  x={574}
                  y={238}
                  textAnchor="start"
                  fill="#94a3b8"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  P2
                </text>
                <text
                  x={518}
                  y={204}
                  textAnchor="start"
                  fill="#94a3b8"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  P3
                </text>
                <text
                  x={518}
                  y={274}
                  textAnchor="start"
                  fill="#94a3b8"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  P4
                </text>

                {/* Interactive MAC Address Table HUD */}
                <g transform="translate(685, 25)">
                  <rect
                    width={330}
                    height={165}
                    rx={8}
                    fill="#080c14"
                    stroke="#27272a"
                    strokeWidth={1}
                  />
                  <rect
                    width={330}
                    height={26}
                    rx={8}
                    fill="#101726"
                  />
                  <text
                    x={12}
                    y={17}
                    fill="#38bdf8"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="monospace"
                    letterSpacing="0.05em"
                  >
                    MAC ADDRESS TABLE · SW1
                  </text>
                  <text
                    x={318}
                    y={17}
                    textAnchor="end"
                    fill="#71717a"
                    fontSize="9.5"
                    fontFamily="monospace"
                  >
                    {activeStepIndex === 0
                      ? '0 entries (empty)'
                      : activeStepIndex < 3
                      ? '1 learned entry'
                      : activeStepIndex === 4 && (completedSteps.has(4) || lastCommand.includes('clear'))
                      ? '0 entries (flushed)'
                      : '2 learned entries'}
                  </text>

                  {/* Column Header Titles */}
                  <g transform="translate(12, 42)">
                    <text x={0} y={0} fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="600">
                      PORT
                    </text>
                    <text x={65} y={0} fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="600">
                      MAC ADDRESS
                    </text>
                    <text x={190} y={0} fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="600">
                      TYPE
                    </text>
                    <text x={260} y={0} fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="600">
                      AGE
                    </text>
                    <line x1={0} y1={8} x2={306} y2={8} stroke="#1e293b" strokeWidth={1} />
                  </g>

                  {/* Table Contents based on Step */}
                  {activeStepIndex === 0 ? (
                    <g transform="translate(165, 95)">
                      <text
                        x={0}
                        y={0}
                        textAnchor="middle"
                        fill="#71717a"
                        fontSize="10.5"
                        fontFamily="monospace"
                        fontStyle="italic"
                      >
                        (0 entries learned · table empty)
                      </text>
                      <text
                        x={0}
                        y={20}
                        textAnchor="middle"
                        fill="#52525b"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        Awaiting ingress wire frames...
                      </text>
                    </g>
                  ) : activeStepIndex === 1 || activeStepIndex === 2 ? (
                    <g transform="translate(12, 72)">
                      {/* Row 1: Port 1 */}
                      <rect x={-4} y={-10} width={314} height={20} rx={4} fill="#052e16" fillOpacity="0.3" stroke="#22c55e" strokeWidth={0.8} />
                      <circle cx={4} cy={0} r={2.5} fill="#4ade80" />
                      <text x={12} y={3} fill="#4ade80" fontSize="10" fontFamily="monospace" fontWeight="600">
                        Port 1
                      </text>
                      <text x={65} y={3} fill="#f1f5f9" fontSize="10" fontFamily="monospace">
                        AA:BB:CC:00:00:01
                      </text>
                      <text x={190} y={3} fill="#94a3b8" fontSize="9.5" fontFamily="monospace">
                        DYNAMIC
                      </text>
                      <text x={260} y={3} fill="#38bdf8" fontSize="9.5" fontFamily="monospace">
                        298s
                      </text>

                      {/* Unlearned row */}
                      <text x={12} y={30} fill="#52525b" fontSize="9.5" fontFamily="monospace" fontStyle="italic">
                        Port 2..4: (not yet learned · unmapped)
                      </text>

                      {/* Step 2 indicator */}
                      {activeStepIndex === 2 && (
                        <g transform="translate(0, 52)">
                          <rect x={-4} y={-8} width={314} height={22} rx={4} fill="#451a03" fillOpacity="0.4" stroke="#f59e0b" strokeWidth={0.8} />
                          <text x={6} y={6} fill="#fbbf24" fontSize="9.5" fontFamily="monospace" fontWeight="600">
                            Lookup DA ..00:00:02 ➔ UNKNOWN FLOOD
                          </text>
                        </g>
                      )}
                    </g>
                  ) : activeStepIndex === 4 && (completedSteps.has(4) || lastCommand.includes('clear')) ? (
                    <g transform="translate(165, 95)">
                      <text
                        x={0}
                        y={0}
                        textAnchor="middle"
                        fill="#fbbf24"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        TABLE FLUSHED (0 ENTRIES)
                      </text>
                      <text
                        x={0}
                        y={18}
                        textAnchor="middle"
                        fill="#71717a"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        All dynamic MAC mappings purged
                      </text>
                    </g>
                  ) : (
                    <g transform="translate(12, 70)">
                      {/* Row 1: Port 1 */}
                      <circle cx={4} cy={0} r={2.5} fill="#4ade80" />
                      <text x={12} y={3} fill="#4ade80" fontSize="10" fontFamily="monospace" fontWeight="600">
                        Port 1
                      </text>
                      <text x={65} y={3} fill="#f1f5f9" fontSize="10" fontFamily="monospace">
                        AA:BB:CC:00:00:01
                      </text>
                      <text x={190} y={3} fill="#94a3b8" fontSize="9.5" fontFamily="monospace">
                        DYNAMIC
                      </text>
                      <text x={260} y={3} fill="#38bdf8" fontSize="9.5" fontFamily="monospace">
                        {activeStepIndex === 4 ? '184s' : '284s'}
                      </text>

                      {/* Row 2: Port 2 */}
                      <circle cx={4} cy={24} r={2.5} fill="#4ade80" />
                      <text x={12} y={27} fill="#4ade80" fontSize="10" fontFamily="monospace" fontWeight="600">
                        Port 2
                      </text>
                      <text x={65} y={27} fill="#f1f5f9" fontSize="10" fontFamily="monospace">
                        AA:BB:CC:00:00:02
                      </text>
                      <text x={190} y={27} fill="#94a3b8" fontSize="9.5" fontFamily="monospace">
                        DYNAMIC
                      </text>
                      <text x={260} y={27} fill="#38bdf8" fontSize="9.5" fontFamily="monospace">
                        {activeStepIndex === 4 ? '212s' : '300s'}
                      </text>

                      {/* Quiet note */}
                      <text x={12} y={54} fill="#52525b" fontSize="9" fontFamily="monospace">
                        Ports 3 & 4: quiet · 0 frames forwarded
                      </text>
                    </g>
                  )}
                </g>

                {/* Step 1: Ingress Source MAC Learning Callout */}
                {activeStepIndex === 1 && (
                  <g transform="translate(328, 175)">
                    <rect
                      x={-115}
                      y={-13}
                      width={230}
                      height={26}
                      rx={6}
                      fill="#062e1e"
                      stroke="#4ade80"
                      strokeWidth={1.5}
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fill="#4ade80"
                      fontSize="9.5"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      Ingress Port 1 ➔ Learn Source MAC
                    </text>
                  </g>
                )}

                {/* Step 2: Unknown Unicast Flooding Callouts */}
                {activeStepIndex === 2 && (
                  <>
                    {/* Switch Flood Action Pill */}
                    <g transform="translate(506, 175)">
                      <rect
                        x={-130}
                        y={-13}
                        width={260}
                        height={26}
                        rx={6}
                        fill="#1c1917"
                        stroke="#f59e0b"
                        strokeWidth={1.5}
                        className="animate-pulse"
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill="#fbbf24"
                        fontSize="9.5"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        UNKNOWN UNICAST FLOOD ➔ Ports 2, 3, 4
                      </text>
                    </g>

                    {/* PC3 Drop Badge */}
                    <g transform="translate(615, 60)">
                      <rect x={-80} y={-11} width={160} height={22} rx={4} fill="#271010" stroke="#ef4444" strokeWidth={1} />
                      <text x={0} y={4} textAnchor="middle" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="600">
                        PC3: DA Mismatch ➔ Discard ✕
                      </text>
                    </g>

                    {/* PC4 Drop Badge */}
                    <g transform="translate(615, 395)">
                      <rect x={-80} y={-11} width={160} height={22} rx={4} fill="#271010" stroke="#ef4444" strokeWidth={1} />
                      <text x={0} y={4} textAnchor="middle" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="600">
                        PC4: DA Mismatch ➔ Discard ✕
                      </text>
                    </g>

                    {/* PC2 Accept Badge */}
                    <g transform="translate(780, 275)">
                      <rect x={-80} y={-11} width={160} height={22} rx={4} fill="#062e1e" stroke="#4ade80" strokeWidth={1} />
                      <text x={0} y={4} textAnchor="middle" fill="#4ade80" fontSize="9" fontFamily="monospace" fontWeight="600">
                        PC2: DA Matched ➔ Accept ✓
                      </text>
                    </g>
                  </>
                )}

                {/* Step 3: Selective Forwarding Callout */}
                {activeStepIndex === 3 && (
                  <>
                    <g transform="translate(506, 175)">
                      <rect
                        x={-135}
                        y={-13}
                        width={270}
                        height={26}
                        rx={6}
                        fill="#062e1e"
                        stroke="#4ade80"
                        strokeWidth={1.5}
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill="#4ade80"
                        fontSize="9.5"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        SELECTIVE POINT-TO-POINT (P2 ➔ P1)
                      </text>
                    </g>

                    {/* PC3 & PC4 Quiet Indicators */}
                    <g transform="translate(506, 130)">
                      <text x={0} y={0} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace" fontStyle="italic">
                        Wire to PC3 is silent (filtered)
                      </text>
                    </g>
                    <g transform="translate(506, 320)">
                      <text x={0} y={0} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace" fontStyle="italic">
                        Wire to PC4 is silent (filtered)
                      </text>
                    </g>
                  </>
                )}

                {/* Step 4: Aging & Timer Info Callout */}
                {activeStepIndex === 4 && (
                  <g transform="translate(685, 205)">
                    <rect
                      width={330}
                      height={40}
                      rx={6}
                      fill="#141026"
                      stroke="#8b5cf6"
                      strokeWidth={1}
                    />
                    <text
                      x={12}
                      y={16}
                      fill="#c4b5fd"
                      fontSize="9.5"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      AGING TIMER: 300 SECONDS INACTIVITY TIMEOUT
                    </text>
                    <text
                      x={12}
                      y={30}
                      fill="#94a3b8"
                      fontSize="8.5"
                      fontFamily="monospace"
                    >
                      Protects against stale delivery when cables move or PCs disconnect.
                    </text>
                  </g>
                )}

                {/* Step 5 / Recap: Four Principles of Switching */}
                {activeStepIndex === 5 && (
                  <g transform="translate(685, 200)">
                    <rect
                      width={330}
                      height={130}
                      rx={8}
                      fill="#0b1320"
                      stroke="#38bdf8"
                      strokeWidth={1}
                    />
                    <text
                      x={12}
                      y={20}
                      fill="#38bdf8"
                      fontSize="10"
                      fontWeight="700"
                      fontFamily="monospace"
                      letterSpacing="0.04em"
                    >
                      THE 4 PRINCIPLES OF ETHERNET SWITCHING
                    </text>
                    <g transform="translate(12, 38)" fill="#e2e8f0" fontSize="9" fontFamily="monospace">
                      <text x={0} y={0} fill="#4ade80">1. LEARN:</text>
                      <text x={65} y={0} fill="#cbd5e1">Source MAC on frame arrival</text>

                      <text x={0} y={20} fill="#4ade80">2. FORWARD:</text>
                      <text x={65} y={20} fill="#cbd5e1">Lookup Dest MAC in table</text>

                      <text x={0} y={40} fill="#fbbf24">3. UNKNOWN:</text>
                      <text x={65} y={40} fill="#cbd5e1">Flood all non-ingress ports</text>

                      <text x={0} y={60} fill="#a78bfa">4. AGING:</text>
                      <text x={65} y={60} fill="#cbd5e1">Flush stale entries after 300s</text>
                    </g>
                  </g>
                )}
              </>
            )}

            {/* ========================================================
                DAY 9: BROADCAST DOMAINS & ROUTER BOUNDARIES
                Subnet 1 (SW1 + PC1-4) ↔ Router R1 ↔ Subnet 2 (SW2 + PC5-6)
                ======================================================== */}
            {isDay9 && (
              <>
                {/* Broadcast Domain 1 Container Box (Subnet 1) */}
                <rect
                  x={30}
                  y={25}
                  width={520}
                  height={485}
                  rx={16}
                  fill="#0c121e"
                  fillOpacity="0.45"
                  stroke={activeStepIndex === 3 ? '#38bdf8' : '#1e293b'}
                  strokeWidth={activeStepIndex === 3 ? 2 : 1.2}
                  strokeDasharray={activeStepIndex === 3 ? undefined : '6 6'}
                  className="transition-all duration-300"
                />
                <text
                  x={50}
                  y={52}
                  fill="#38bdf8"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="monospace"
                  letterSpacing="0.05em"
                >
                  LOCAL SUBNET 1 · 192.168.1.0/24 (BROADCAST DOMAIN 1)
                </text>

                {/* Broadcast Domain 2 Container Box (Subnet 2) */}
                <rect
                  x={740}
                  y={25}
                  width={410}
                  height={485}
                  rx={16}
                  fill="#0a1510"
                  fillOpacity="0.4"
                  stroke={activeStepIndex === 3 ? '#4ade80' : '#1b382b'}
                  strokeWidth={activeStepIndex === 3 ? 2 : 1.2}
                  strokeDasharray={activeStepIndex === 3 ? undefined : '6 6'}
                  className="transition-all duration-300"
                />
                <text
                  x={760}
                  y={52}
                  fill="#4ade80"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="monospace"
                  letterSpacing="0.05em"
                >
                  LOCAL SUBNET 2 · 192.168.2.0/24 (BROADCAST DOMAIN 2)
                </text>

                {/* Cables in Domain 1 */}
                {/* PC1 to SW1 Port 1 */}
                <SvgCable
                  x1={156}
                  y1={170}
                  x2={240}
                  y2={225}
                  color={activeStepIndex === 1 ? '#fbbf24' : '#4ade80'}
                  isTransmitting={isPinging || activeStepIndex === 1 || activeStepIndex === 4}
                />
                {/* PC2 to SW1 Port 2 */}
                <SvgCable
                  x1={156}
                  y1={345}
                  x2={240}
                  y2={245}
                  color={activeStepIndex === 1 ? '#fbbf24' : '#4ade80'}
                  isTransmitting={isPinging || activeStepIndex === 1 || activeStepIndex === 4}
                />
                {/* PC3 to SW1 Port 3 */}
                <SvgCable
                  x1={296}
                  y1={97}
                  x2={296}
                  y2={210}
                  color={activeStepIndex === 1 ? '#fbbf24' : '#4ade80'}
                  isTransmitting={isPinging || activeStepIndex === 1 || activeStepIndex === 4}
                />
                {/* PC4 to SW1 Port 4 */}
                <SvgCable
                  x1={296}
                  y1={390}
                  x2={296}
                  y2={258}
                  color={activeStepIndex === 1 ? '#fbbf24' : '#4ade80'}
                  isTransmitting={isPinging || activeStepIndex === 1 || activeStepIndex === 4}
                />
                {/* SW1 Port 5 to Router R1 Port 1 */}
                <SvgCable
                  x1={352}
                  y1={234}
                  x2={580}
                  y2={234}
                  color={activeStepIndex === 1 || activeStepIndex === 2 ? '#fbbf24' : '#4ade80'}
                  isTransmitting={activeStepIndex === 1 || activeStepIndex === 2 || (activeStepIndex === 4 && isPinging)}
                />

                {/* Cables in Domain 2 (Isolated by Router R1) */}
                {/* Router R1 Port 2 to SW2 */}
                <SvgCable
                  x1={706}
                  y1={234}
                  x2={800}
                  y2={234}
                  color={activeStepIndex >= 1 && activeStepIndex <= 4 ? '#334155' : '#4ade80'}
                  isTransmitting={false}
                />
                {/* SW2 to PC5 */}
                <SvgCable
                  x1={912}
                  y1={225}
                  x2={970}
                  y2={170}
                  color={activeStepIndex >= 1 && activeStepIndex <= 4 ? '#334155' : '#4ade80'}
                  isTransmitting={false}
                />
                {/* SW2 to PC6 */}
                <SvgCable
                  x1={912}
                  y1={245}
                  x2={970}
                  y2={345}
                  color={activeStepIndex >= 1 && activeStepIndex <= 4 ? '#334155' : '#4ade80'}
                  isTransmitting={false}
                />

                {/* Subnet 1 Workstations */}
                {/* PC1 (Transmitter) */}
                <SvgWorkstation
                  x={80}
                  y={140}
                  name="PC1"
                  ip="192.168.1.10"
                  mac="AA:BB:CC:00:00:01"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                  isPinging={isPinging || activeStepIndex === 1 || activeStepIndex === 4}
                />

                {/* PC2 */}
                <SvgWorkstation
                  x={80}
                  y={320}
                  name="PC2"
                  ip="192.168.1.20"
                  mac="AA:BB:CC:00:00:02"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* PC3 */}
                <SvgWorkstation
                  x={258}
                  y={45}
                  name="PC3"
                  ip="192.168.1.30"
                  mac="AA:BB:CC:00:00:03"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* PC4 */}
                <SvgWorkstation
                  x={258}
                  y={390}
                  name="PC4"
                  ip="192.168.1.40"
                  mac="AA:BB:CC:00:00:04"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* Switch SW1 (Domain 1 Center) */}
                <SvgSwitch
                  x={240}
                  y={210}
                  port1Active={true}
                  port2Active={true}
                  port3Active={true}
                  port4Active={true}
                  isPinging={activeStepIndex === 1}
                />

                {/* Central Layer 3 Router R1 */}
                <SvgRouter
                  x={580}
                  y={208}
                  name="Router R1"
                  port1Ip="192.168.1.1"
                  port2Ip="192.168.2.1"
                  showPortIps={true}
                  port1Active={true}
                  port2Active={true}
                />

                {/* Subnet 2 Switch SW2 */}
                <SvgSwitch
                  x={800}
                  y={210}
                  port1Active={activeStepIndex === 0 || activeStepIndex === 5}
                  port2Active={activeStepIndex === 0 || activeStepIndex === 5}
                  port3Active={true}
                  port4Active={false}
                />

                {/* Subnet 2 Workstations */}
                {/* PC5 */}
                <SvgWorkstation
                  x={970}
                  y={140}
                  name="PC5"
                  ip="192.168.2.10"
                  mac="AA:BB:CC:00:02:01"
                  ipColor="green"
                  showIp={true}
                  showMac={true}
                />

                {/* PC6 */}
                <SvgWorkstation
                  x={970}
                  y={320}
                  name="PC6"
                  ip="192.168.2.20"
                  mac="AA:BB:CC:00:02:02"
                  ipColor="green"
                  showIp={true}
                  showMac={true}
                />

                {/* ========================================================
                    GRADUAL REVEAL ANNOTATIONS & HUD INTERACTION
                    ======================================================== */}

                {/* Step 0: Broadcast Scope HUD */}
                {activeStepIndex === 0 && (
                  <g transform="translate(180, 160)">
                    <rect
                      x={-140}
                      y={-14}
                      width={280}
                      height={28}
                      rx={6}
                      fill="#0b1728"
                      stroke="#38bdf8"
                      strokeWidth={1.2}
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="9.5"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      BROADCAST DA: FF:FF:FF:FF:FF:FF (ALL PORTS)
                    </text>
                  </g>
                )}

                {/* Step 1: Replicate & Flood Pulse */}
                {activeStepIndex === 1 && (
                  <>
                    <g transform="translate(296, 175)">
                      <rect
                        x={-125}
                        y={-13}
                        width={250}
                        height={26}
                        rx={6}
                        fill="#1c1917"
                        stroke="#f59e0b"
                        strokeWidth={1.5}
                        className="animate-pulse"
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill="#fbbf24"
                        fontSize="9.5"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        REPLICATE &amp; FLOOD TO ALL PORTS
                      </text>
                    </g>
                  </>
                )}

                {/* Step 2: CPU Interrupt Badges on PC2, PC3, PC4 */}
                {activeStepIndex === 2 && (
                  <>
                    {/* Badge over PC2 */}
                    <g transform="translate(165, 305)">
                      <rect x={-75} y={-11} width={150} height={22} rx={4} fill="#451a03" stroke="#f59e0b" strokeWidth={1} />
                      <text x={0} y={4} textAnchor="middle" fill="#fbbf24" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                        PC2: CPU INTERRUPT ⚡
                      </text>
                    </g>
                    {/* Badge over PC3 */}
                    <g transform="translate(345, 35)">
                      <rect x={-75} y={-11} width={150} height={22} rx={4} fill="#451a03" stroke="#f59e0b" strokeWidth={1} />
                      <text x={0} y={4} textAnchor="middle" fill="#fbbf24" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                        PC3: CPU INTERRUPT ⚡
                      </text>
                    </g>
                    {/* Badge over PC4 */}
                    <g transform="translate(345, 380)">
                      <rect x={-75} y={-11} width={150} height={22} rx={4} fill="#451a03" stroke="#f59e0b" strokeWidth={1} />
                      <text x={0} y={4} textAnchor="middle" fill="#fbbf24" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                        PC4: CPU INTERRUPT ⚡
                      </text>
                    </g>
                  </>
                )}

                {/* Step 3: Router R1 Broadcast Barrier Badge */}
                {activeStepIndex === 3 && (
                  <>
                    <g transform="translate(643, 175)">
                      <rect
                        x={-150}
                        y={-14}
                        width={300}
                        height={28}
                        rx={6}
                        fill="#271010"
                        stroke="#ef4444"
                        strokeWidth={1.5}
                        className="animate-pulse"
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill="#f87171"
                        fontSize="9.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        ROUTER BROADCAST BARRIER ✕ (RFC 1812)
                      </text>
                    </g>

                    {/* Subnet 2 Silence Indicator */}
                    <g transform="translate(945, 238)">
                      <rect x={-90} y={-11} width={180} height={22} rx={4} fill="#090d16" stroke="#334155" strokeWidth={1} />
                      <text x={0} y={4} textAnchor="middle" fill="#64748b" fontSize="8.5" fontFamily="monospace">
                        Subnet 2: Silent (0 frames)
                      </text>
                    </g>
                  </>
                )}

                {/* Step 4: Dual Domain Inventory Card */}
                {activeStepIndex === 4 && (
                  <>
                    <g transform="translate(643, 160)">
                      <rect
                        x={-140}
                        y={-12}
                        width={280}
                        height={24}
                        rx={5}
                        fill="#062e1e"
                        stroke="#22c55e"
                        strokeWidth={1.2}
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill="#4ade80"
                        fontSize="9"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        2 BROADCAST DOMAINS · ROUTER R1 ISOLATION
                      </text>
                    </g>

                    {/* Ping reply badges in Domain 1 */}
                    <g transform="translate(80, 275)">
                      <text x={0} y={0} fill="#4ade80" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                        PC2 Reply ✓
                      </text>
                      <text x={0} y={15} fill="#4ade80" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                        PC3 Reply ✓
                      </text>
                      <text x={0} y={30} fill="#4ade80" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                        PC4 Reply ✓
                      </text>
                    </g>

                    {/* Subnet 2 Unaffected indicator */}
                    <g transform="translate(945, 238)">
                      <text x={0} y={4} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace" fontStyle="italic">
                        Subnet 2: 0 responses (Protected)
                      </text>
                    </g>
                  </>
                )}

                {/* Step 5 / Recap: Four Rules & Stage 4 Preview */}
                {activeStepIndex === 5 && (
                  <g transform="translate(425, 385)">
                    <rect
                      x={-180}
                      y={-15}
                      width={360}
                      height={95}
                      rx={8}
                      fill="#070c14"
                      stroke="#38bdf8"
                      strokeWidth={1.2}
                    />
                    <text
                      x={0}
                      y={6}
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="9.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      THE 4 RULES OF BROADCAST DOMAINS
                    </text>
                    <g transform="translate(-165, 26)" fill="#cbd5e1" fontSize="8.5" fontFamily="monospace">
                      <text x={0} y={0}>1. SWITCH: Floods every broadcast to all ports</text>
                      <text x={0} y={16}>2. HOSTS: Every CPU halted by hardware interrupt</text>
                      <text x={0} y={32}>3. ROUTER: Drops broadcasts at the interface</text>
                      <text x={0} y={48} fill="#a78bfa" fontWeight="600">Next Stage: Day 10 · VLANs (Splitting 1 Switch)</text>
                    </g>
                  </g>
                )}
              </>
            )}

            {/* ========================================================
                DAY 10: VLANS: SEPARATING NETWORKS ON ONE SWITCH
                ======================================================== */}
            {isDay10 && (
              <>
                {/* Steps 0 & 1: Factory default switch — Single shared domain container */}
                {activeStepIndex < 2 && (
                  <g>
                    <rect
                      x={35}
                      y={25}
                      width={1010}
                      height={470}
                      rx={16}
                      fill="#0c121e"
                      fillOpacity="0.4"
                      stroke="#475569"
                      strokeWidth={1.5}
                      strokeDasharray="6 6"
                      className="transition-all duration-300"
                    />
                    <text
                      x={55}
                      y={52}
                      fill="#94a3b8"
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="monospace"
                      letterSpacing="0.05em"
                    >
                      FACTORY DEFAULT SWITCH · ALL PORTS ASSIGNED TO VLAN 1 (SHARED BROADCAST DOMAIN)
                    </text>
                  </g>
                )}

                {/* Steps 2+: Segmented into two isolated VLAN containers */}
                {activeStepIndex >= 2 && (
                  <>
                    {/* VLAN 10 (Engineering) Left Container */}
                    <rect
                      x={35}
                      y={25}
                      width={410}
                      height={470}
                      rx={16}
                      fill="#0e1329"
                      fillOpacity="0.55"
                      stroke="#818cf8"
                      strokeWidth={1.8}
                      className="transition-all duration-300"
                    />
                    <text
                      x={55}
                      y={52}
                      fill="#a5b4fc"
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="monospace"
                      letterSpacing="0.05em"
                    >
                      VLAN 10 (ENGINEERING) · 192.168.10.0/24
                    </text>
                    <g transform="translate(325, 42)">
                      <rect
                        x={0}
                        y={0}
                        width={105}
                        height={18}
                        rx={4}
                        fill="#1e1b4b"
                        stroke="#6366f1"
                        strokeWidth={1}
                      />
                      <text
                        x={52}
                        y={12}
                        textAnchor="middle"
                        fill="#c7d2fe"
                        fontSize="8.5"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        ACCESS MODE
                      </text>
                    </g>

                    {/* VLAN 20 (Finance) Right Container */}
                    <rect
                      x={635}
                      y={25}
                      width={410}
                      height={470}
                      rx={16}
                      fill="#091d17"
                      fillOpacity="0.55"
                      stroke="#34d399"
                      strokeWidth={1.8}
                      className="transition-all duration-300"
                    />
                    <text
                      x={655}
                      y={52}
                      fill="#6ee7b7"
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="monospace"
                      letterSpacing="0.05em"
                    >
                      VLAN 20 (FINANCE) · 192.168.20.0/24
                    </text>
                    <g transform="translate(925, 42)">
                      <rect
                        x={0}
                        y={0}
                        width={105}
                        height={18}
                        rx={4}
                        fill="#064e3b"
                        stroke="#10b981"
                        strokeWidth={1}
                      />
                      <text
                        x={52}
                        y={12}
                        textAnchor="middle"
                        fill="#a7f3d0"
                        fontSize="8.5"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        ACCESS MODE
                      </text>
                    </g>
                  </>
                )}

                {/* Cables to Switch SW1 */}
                {/* Cable PC1 to Port 1 */}
                <SvgCable
                  x1={150}
                  y1={170}
                  x2={460}
                  y2={275}
                  color={
                    activeStepIndex < 2
                      ? '#64748b'
                      : '#818cf8'
                  }
                  isTransmitting={
                    activeStepIndex === 3 || activeStepIndex === 4 || isPinging
                  }
                />
                {/* Cable PC2 to Port 2 */}
                <SvgCable
                  x1={150}
                  y1={360}
                  x2={460}
                  y2={295}
                  color={
                    activeStepIndex < 2
                      ? '#64748b'
                      : '#818cf8'
                  }
                  isTransmitting={activeStepIndex === 3}
                />
                {/* Cable PC3 to Port 3 */}
                <SvgCable
                  x1={880}
                  y1={170}
                  x2={580}
                  y2={275}
                  color={
                    activeStepIndex < 2
                      ? '#64748b'
                      : activeStepIndex === 3
                      ? '#334155'
                      : '#34d399'
                  }
                  isTransmitting={false}
                />
                {/* Cable PC4 to Port 4 */}
                <SvgCable
                  x1={880}
                  y1={360}
                  x2={580}
                  y2={295}
                  color={
                    activeStepIndex < 2
                      ? '#64748b'
                      : activeStepIndex === 3
                      ? '#334155'
                      : '#34d399'
                  }
                  isTransmitting={false}
                />

                {/* Workstations (Left VLAN 10) */}
                {/* PC1 */}
                <SvgWorkstation
                  x={90}
                  y={140}
                  name="PC1"
                  ip="192.168.10.10"
                  mac="AA:BB:CC:10:00:01"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />
                {/* PC2 */}
                <SvgWorkstation
                  x={90}
                  y={330}
                  name="PC2"
                  ip="192.168.10.20"
                  mac="AA:BB:CC:10:00:02"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />

                {/* Workstations (Right VLAN 20) */}
                {/* PC3 */}
                <SvgWorkstation
                  x={880}
                  y={140}
                  name="PC3"
                  ip="192.168.20.30"
                  mac="AA:BB:CC:20:00:03"
                  ipColor="green"
                  showIp={true}
                  showMac={true}
                />
                {/* PC4 */}
                <SvgWorkstation
                  x={880}
                  y={330}
                  name="PC4"
                  ip="192.168.20.40"
                  mac="AA:BB:CC:20:00:04"
                  ipColor="green"
                  showIp={true}
                  showMac={true}
                />

                {/* Central Switch SW1 */}
                <SvgSwitch
                  x={460}
                  y={260}
                  port1Active={true}
                  port2Active={true}
                  port3Active={true}
                  port4Active={true}
                  isPinging={isSwitchPinging || activeStepIndex === 3 || activeStepIndex === 4}
                />

                {/* Port Labels & Color Badges on Switch SW1 */}
                {/* Port 1 (Left Top) */}
                <text
                  x={452}
                  y={272}
                  textAnchor="end"
                  fill={activeStepIndex >= 2 ? '#a5b4fc' : '#94a3b8'}
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  P1 {activeStepIndex >= 2 ? '(V10)' : ''}
                </text>
                {/* Port 2 (Left Bottom) */}
                <text
                  x={452}
                  y={299}
                  textAnchor="end"
                  fill={activeStepIndex >= 2 ? '#a5b4fc' : '#94a3b8'}
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  P2 {activeStepIndex >= 2 ? '(V10)' : ''}
                </text>
                {/* Port 3 (Right Top) */}
                <text
                  x={588}
                  y={272}
                  textAnchor="start"
                  fill={activeStepIndex >= 2 ? '#6ee7b7' : '#94a3b8'}
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {activeStepIndex >= 2 ? '(V20)' : ''} P3
                </text>
                {/* Port 4 (Right Bottom) */}
                <text
                  x={588}
                  y={299}
                  textAnchor="start"
                  fill={activeStepIndex >= 2 ? '#6ee7b7' : '#94a3b8'}
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {activeStepIndex >= 2 ? '(V20)' : ''} P4
                </text>

                {/* Switch Floating VLAN Database HUD Card */}
                <g transform="translate(350, 30)">
                  <rect
                    x={0}
                    y={0}
                    width={380}
                    height={165}
                    rx={10}
                    fill="#080e1a"
                    stroke="#38bdf8"
                    strokeWidth={1.2}
                  />
                  {/* Card Header */}
                  <rect
                    x={0}
                    y={0}
                    width={380}
                    height={26}
                    rx={10}
                    fill="#0f172a"
                  />
                  <text
                    x={15}
                    y={17}
                    fill="#38bdf8"
                    fontSize="9.5"
                    fontWeight="700"
                    fontFamily="monospace"
                    letterSpacing="0.05em"
                  >
                    SWITCH SW1 · VLAN DATABASE (LIVE)
                  </text>
                  <text
                    x={365}
                    y={17}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="8.5"
                    fontFamily="monospace"
                  >
                    {activeStepIndex < 2 ? '1 VLAN' : '2 ACTIVE VLANS'}
                  </text>

                  {/* Table Column Titles */}
                  <g transform="translate(15, 42)" fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="600">
                    <text x={0} y={0}>VLAN</text>
                    <text x={45} y={0}>NAME</text>
                    <text x={145} y={0}>STATUS</text>
                    <text x={215} y={0}>MEMBER PORTS</text>
                  </g>
                  <line x1={15} y1={47} x2={365} y2={47} stroke="#1e293b" strokeWidth={1} />

                  {/* Table Rows */}
                  {/* Step 0: Only default VLAN 1 with all ports */}
                  {activeStepIndex === 0 && (
                    <g transform="translate(15, 66)" fontFamily="monospace" fontSize="9">
                      <text x={0} y={0} fill="#f8fafc" fontWeight="600">1</text>
                      <text x={45} y={0} fill="#94a3b8">default</text>
                      <text x={145} y={0} fill="#4ade80">active</text>
                      <text x={215} y={0} fill="#f8fafc">Port 1, 2, 3, 4</text>

                      {/* State Badge */}
                      <g transform="translate(0, 48)">
                        <rect x={0} y={0} width={350} height={26} rx={5} fill="#0f172a" stroke="#334155" strokeWidth={1} />
                        <text x={175} y={17} textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="600">
                          1 Shared Broadcast Domain (Factory Default)
                        </text>
                      </g>
                    </g>
                  )}

                  {/* Step 1: VLAN 10 and 20 created, but 0 ports assigned */}
                  {activeStepIndex === 1 && (
                    <g transform="translate(15, 63)" fontFamily="monospace" fontSize="8.5">
                      <text x={0} y={0} fill="#94a3b8">1</text>
                      <text x={45} y={0} fill="#94a3b8">default</text>
                      <text x={145} y={0} fill="#4ade80">active</text>
                      <text x={215} y={0} fill="#94a3b8">Port 1, 2, 3, 4</text>

                      <text x={0} y={18} fill="#a5b4fc" fontWeight="600">10</text>
                      <text x={45} y={18} fill="#a5b4fc">Engineering</text>
                      <text x={145} y={18} fill="#4ade80">active</text>
                      <text x={215} y={18} fill="#fbbf24">none (0 ports)</text>

                      <text x={0} y={36} fill="#6ee7b7" fontWeight="600">20</text>
                      <text x={45} y={36} fill="#6ee7b7">Finance</text>
                      <text x={145} y={36} fill="#4ade80">active</text>
                      <text x={215} y={36} fill="#fbbf24">none (0 ports)</text>

                      {/* State Badge */}
                      <g transform="translate(0, 52)">
                        <rect x={0} y={0} width={350} height={22} rx={4} fill="#1e1b4b" stroke="#6366f1" strokeWidth={1} />
                        <text x={175} y={15} textAnchor="middle" fill="#c7d2fe" fontSize="8.5" fontWeight="600">
                          VLANs Created · Awaiting Port Assignment
                        </text>
                      </g>
                    </g>
                  )}

                  {/* Steps 2+: Ports assigned to VLAN 10 & 20 */}
                  {activeStepIndex >= 2 && (
                    <g transform="translate(15, 63)" fontFamily="monospace" fontSize="8.5">
                      <text x={0} y={0} fill="#64748b">1</text>
                      <text x={45} y={0} fill="#64748b">default</text>
                      <text x={145} y={0} fill="#64748b">active</text>
                      <text x={215} y={0} fill="#64748b">none (0 ports)</text>

                      <text x={0} y={18} fill="#a5b4fc" fontWeight="700">10</text>
                      <text x={45} y={18} fill="#a5b4fc" fontWeight="600">Engineering</text>
                      <text x={145} y={18} fill="#4ade80">active</text>
                      <text x={215} y={18} fill="#a5b4fc" fontWeight="700">Port 1, Port 2</text>

                      <text x={0} y={36} fill="#6ee7b7" fontWeight="700">20</text>
                      <text x={45} y={36} fill="#6ee7b7" fontWeight="600">Finance</text>
                      <text x={145} y={36} fill="#4ade80">active</text>
                      <text x={215} y={36} fill="#6ee7b7" fontWeight="700">Port 3, Port 4</text>

                      {/* State Badge */}
                      <g transform="translate(0, 52)">
                        <rect x={0} y={0} width={350} height={22} rx={4} fill="#062e1e" stroke="#22c55e" strokeWidth={1} />
                        <text x={175} y={15} textAnchor="middle" fill="#4ade80" fontSize="8.5" fontWeight="600">
                          Active Segmentation · 2 Isolated Broadcast Domains
                        </text>
                      </g>
                    </g>
                  )}
                </g>

                {/* Step 3: Broadcast Confinement Visualization */}
                {activeStepIndex === 3 && (
                  <>
                    {/* PC2 receives broadcast indicator */}
                    <g transform="translate(90, 440)">
                      <rect x={0} y={0} width={180} height={22} rx={4} fill="#1e1b4b" stroke="#818cf8" strokeWidth={1} />
                      <text x={90} y={15} textAnchor="middle" fill="#c7d2fe" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                        PC2: Broadcast Received ✓
                      </text>
                    </g>

                    {/* VLAN 20 Filtered / Locked Badges on Ports 3 & 4 */}
                    <g transform="translate(605, 260)">
                      <rect x={0} y={0} width={140} height={42} rx={6} fill="#1e293b" stroke="#ef4444" strokeWidth={1.2} />
                      <text x={70} y={16} textAnchor="middle" fill="#f87171" fontSize="8.5" fontFamily="monospace" fontWeight="700">
                        VLAN 20 FILTERED ✕
                      </text>
                      <text x={70} y={32} textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                        Ports 3 &amp; 4 Silent
                      </text>
                    </g>

                    {/* PC3 & PC4 Silent Badges */}
                    <g transform="translate(880, 440)">
                      <text x={0} y={0} fill="#64748b" fontSize="8.5" fontFamily="monospace" fontStyle="italic">
                        PC3 &amp; PC4: Completely Silent (Zero Interrupts)
                      </text>
                    </g>
                  </>
                )}

                {/* Step 4: Unicast Cross-VLAN Dropped Barrier */}
                {activeStepIndex === 4 && (
                  <>
                    {/* Glowing Crimson Shield at Switch Core */}
                    <g transform="translate(520, 235)">
                      <rect
                        x={-150}
                        y={-14}
                        width={300}
                        height={28}
                        rx={6}
                        fill="#450a0a"
                        stroke="#ef4444"
                        strokeWidth={1.5}
                        className="animate-pulse"
                      />
                      <text
                        x={0}
                        y={5}
                        textAnchor="middle"
                        fill="#fca5a5"
                        fontSize="9"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        CROSS-VLAN BLOCKED ✕ (Layer 2 Isolation)
                      </text>
                    </g>

                    {/* Unreachable Ping Badge */}
                    <g transform="translate(880, 235)">
                      <rect x={0} y={0} width={150} height={22} rx={4} fill="#18181b" stroke="#52525b" strokeWidth={1} />
                      <text x={75} y={15} textAnchor="middle" fill="#a1a1aa" fontSize="8.5" fontFamily="monospace">
                        PC3: 100% Packet Loss
                      </text>
                    </g>
                  </>
                )}

                {/* Step 5 / Recap: Four Rules of VLAN Segmentation */}
                {activeStepIndex === 5 && (
                  <g transform="translate(520, 410)">
                    <rect
                      x={-200}
                      y={-18}
                      width={400}
                      height={100}
                      rx={8}
                      fill="#070c14"
                      stroke="#818cf8"
                      strokeWidth={1.3}
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fill="#a5b4fc"
                      fontSize="9.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      THE 4 RULES OF VLAN SEGMENTATION
                    </text>
                    <g transform="translate(-185, 24)" fill="#cbd5e1" fontSize="8.5" fontFamily="monospace">
                      <text x={0} y={0}>1. DEFAULT: All ports start assigned to VLAN 1</text>
                      <text x={0} y={16}>2. ACCESS: Port assigned to one end device on one VLAN</text>
                      <text x={0} y={32}>3. BROADCAST: Confined strictly within the same VLAN</text>
                      <text x={0} y={48} fill="#34d399" fontWeight="600">
                        4. ISOLATION: Cross-VLAN requires a Layer 3 router (Day 12)
                      </text>
                      <text x={0} y={64} fill="#a78bfa" fontWeight="600">
                        Next: Day 11 · 802.1Q Trunks (VLANs across Switches)
                      </text>
                    </g>
                  </g>
                )}
              </>
            )}

            {/* ========================================================
                DAY 11: TRUNKS: CARRYING VLANS BETWEEN SWITCHES
                ======================================================== */}
            {isDay11 && (
              <>
                {/* Left Building 1 (SW1 Campus) Container */}
                <rect
                  x={30}
                  y={25}
                  width={435}
                  height={490}
                  rx={16}
                  fill="#0c1220"
                  fillOpacity="0.5"
                  stroke="#334155"
                  strokeWidth={1.4}
                />
                <text
                  x={50}
                  y={52}
                  fill="#94a3b8"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="monospace"
                  letterSpacing="0.05em"
                >
                  CAMPUS BUILDING 1 · SWITCH SW1
                </text>

                {/* Right Building 2 (SW2 Campus) Container */}
                <rect
                  x={735}
                  y={25}
                  width={435}
                  height={490}
                  rx={16}
                  fill="#0c1220"
                  fillOpacity="0.5"
                  stroke="#334155"
                  strokeWidth={1.4}
                />
                <text
                  x={755}
                  y={52}
                  fill="#94a3b8"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="monospace"
                  letterSpacing="0.05em"
                >
                  CAMPUS BUILDING 2 · SWITCH SW2
                </text>

                {/* Subnet Labels inside Building 1 */}
                <text x={50} y={80} fill="#818cf8" fontSize="9.5" fontWeight="600" fontFamily="monospace">
                  VLAN 10 (Engineering) · 192.168.10.0/24
                </text>
                <text x={50} y={320} fill="#34d399" fontSize="9.5" fontWeight="600" fontFamily="monospace">
                  VLAN 20 (Finance) · 192.168.20.0/24
                </text>

                {/* Subnet Labels inside Building 2 */}
                <text x={755} y={80} fill="#818cf8" fontSize="9.5" fontWeight="600" fontFamily="monospace">
                  VLAN 10 (Engineering) · 192.168.10.0/24
                </text>
                <text x={755} y={320} fill="#34d399" fontSize="9.5" fontWeight="600" fontFamily="monospace">
                  VLAN 20 (Finance) · 192.168.20.0/24
                </text>

                {/* Workstations in Building 1 */}
                {/* PC1 (VLAN 10) */}
                <SvgWorkstation
                  x={70}
                  y={110}
                  name="PC1"
                  ip="192.168.10.10"
                  mac="AA:BB:CC:10:00:01"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />
                {/* PC2 (VLAN 20) */}
                <SvgWorkstation
                  x={70}
                  y={350}
                  name="PC2"
                  ip="192.168.20.20"
                  mac="AA:BB:CC:20:00:02"
                  ipColor="green"
                  showIp={true}
                  showMac={true}
                />

                {/* Workstations in Building 2 */}
                {/* PC3 (VLAN 10) */}
                <SvgWorkstation
                  x={1030}
                  y={110}
                  name="PC3"
                  ip="192.168.10.30"
                  mac="AA:BB:CC:10:00:03"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                />
                {/* PC4 (VLAN 20) */}
                <SvgWorkstation
                  x={1030}
                  y={350}
                  name="PC4"
                  ip="192.168.20.40"
                  mac="AA:BB:CC:20:00:04"
                  ipColor="green"
                  showIp={true}
                  showMac={true}
                />

                {/* Switch SW1 (Left) */}
                <SvgSwitch
                  x={310}
                  y={240}
                  port1Active={true}
                  port2Active={true}
                  port3Active={true}
                  port4Active={true}
                  isPinging={isSwitchPinging || activeStepIndex === 4}
                />
                {/* Switch SW2 (Right) */}
                <SvgSwitch
                  x={770}
                  y={240}
                  port1Active={true}
                  port2Active={true}
                  port3Active={true}
                  port4Active={true}
                  isPinging={isSwitchPinging || activeStepIndex === 4}
                />

                {/* Local Access Cables in Building 1 */}
                {/* PC1 to SW1 Port 1 */}
                <SvgCable
                  x1={130}
                  y1={140}
                  x2={310}
                  y2={252}
                  color="#818cf8"
                  isTransmitting={activeStepIndex === 4 || isPinging}
                />
                {/* PC2 to SW1 Port 2 */}
                <SvgCable
                  x1={130}
                  y1={380}
                  x2={310}
                  y2={276}
                  color="#34d399"
                  isTransmitting={false}
                />

                {/* Local Access Cables in Building 2 */}
                {/* PC3 to SW2 Port 1 */}
                <SvgCable
                  x1={1030}
                  y1={140}
                  x2={890}
                  y2={252}
                  color="#818cf8"
                  isTransmitting={activeStepIndex === 4}
                />
                {/* PC4 to SW2 Port 2 */}
                <SvgCable
                  x1={1030}
                  y1={380}
                  x2={890}
                  y2={276}
                  color="#34d399"
                  isTransmitting={false}
                />

                {/* Port Labels on SW1 */}
                <text x={302} y={254} textAnchor="end" fill="#818cf8" fontSize="8" fontFamily="monospace" fontWeight="600">
                  P1 (V10)
                </text>
                <text x={302} y={278} textAnchor="end" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="600">
                  P2 (V20)
                </text>
                <text x={438} y={266} textAnchor="start" fill={activeStepIndex >= 1 ? '#38bdf8' : '#94a3b8'} fontSize="8" fontFamily="monospace" fontWeight="700">
                  P5 {activeStepIndex >= 1 ? '(TRUNK)' : '(ACCESS)'}
                </text>

                {/* Port Labels on SW2 */}
                <text x={762} y={266} textAnchor="end" fill={activeStepIndex >= 1 ? '#38bdf8' : '#94a3b8'} fontSize="8" fontFamily="monospace" fontWeight="700">
                  {activeStepIndex >= 1 ? '(TRUNK)' : '(ACCESS)'} P5
                </text>
                <text x={898} y={254} textAnchor="start" fill="#818cf8" fontSize="8" fontFamily="monospace" fontWeight="600">
                  (V10) P1
                </text>
                <text x={898} y={278} textAnchor="start" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="600">
                  (V20) P2
                </text>

                {/* Central Trunk Cable between SW1:P5 and SW2:P5 */}
                {activeStepIndex === 0 ? (
                  // Step 0: Standard untrunked wire
                  <g>
                    <SvgCable
                      x1={430}
                      y1={264}
                      x2={770}
                      y2={264}
                      color="#64748b"
                      isTransmitting={false}
                    />
                    <g transform="translate(600, 240)">
                      <rect x={-110} y={-12} width={220} height={24} rx={4} fill="#182030" stroke="#475569" strokeWidth={1} />
                      <text x={0} y={4} textAnchor="middle" fill="#94a3b8" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                        Port 5: Access Mode (Untrunked)
                      </text>
                    </g>
                  </g>
                ) : (
                  // Steps 1+: Active 802.1Q Trunk Link
                  <g>
                    {/* Multi-tone Trunk Cable */}
                    <line
                      x1={430}
                      y1={264}
                      x2={770}
                      y2={264}
                      stroke="#0284c7"
                      strokeWidth={5}
                      strokeLinecap="round"
                    />
                    <line
                      x1={430}
                      y1={264}
                      x2={770}
                      y2={264}
                      stroke="#38bdf8"
                      strokeWidth={2}
                      strokeDasharray="8 6"
                      strokeLinecap="round"
                      className="animate-pulse"
                    />

                    {/* Trunk Active Badge */}
                    <g transform="translate(600, 240)">
                      <rect
                        x={-140}
                        y={-14}
                        width={280}
                        height={26}
                        rx={6}
                        fill="#082f49"
                        stroke="#38bdf8"
                        strokeWidth={1.3}
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill="#7dd3fc"
                        fontSize="9"
                        fontWeight="700"
                        fontFamily="monospace"
                        letterSpacing="0.04em"
                      >
                        IEEE 802.1Q TRUNK (VLAN 10 + 20)
                      </text>
                    </g>
                  </g>
                )}

                {/* Floating 802.1Q Frame Dissection Inspector Card */}
                <g transform="translate(450, 35)">
                  <rect
                    x={0}
                    y={0}
                    width={300}
                    height={180}
                    rx={10}
                    fill="#080e1a"
                    stroke="#38bdf8"
                    strokeWidth={1.2}
                  />
                  {/* Card Title */}
                  <rect x={0} y={0} width={300} height={26} rx={10} fill="#0f172a" />
                  <text
                    x={15}
                    y={17}
                    fill="#38bdf8"
                    fontSize="9.5"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    802.1Q FRAME DISSECTION (TRUNK WIRE)
                  </text>

                  {/* Frame Field Anatomy */}
                  <g transform="translate(15, 42)">
                    {/* Header Strip */}
                    <rect x={0} y={0} width={55} height={22} rx={3} fill="#1e293b" stroke="#475569" strokeWidth={1} />
                    <text x={27} y={14} textAnchor="middle" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                      Dest MAC
                    </text>

                    <rect x={60} y={0} width={55} height={22} rx={3} fill="#1e293b" stroke="#475569" strokeWidth={1} />
                    <text x={87} y={14} textAnchor="middle" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                      Src MAC
                    </text>

                    {/* 802.1Q Tag Highlight */}
                    <rect
                      x={120}
                      y={-2}
                      width={80}
                      height={26}
                      rx={4}
                      fill="#1e1b4b"
                      stroke="#818cf8"
                      strokeWidth={1.5}
                    />
                    <text x={160} y={14} textAnchor="middle" fill="#a5b4fc" fontSize="8" fontWeight="700" fontFamily="monospace">
                      802.1Q Tag
                    </text>

                    <rect x={205} y={0} width={65} height={22} rx={3} fill="#1e293b" stroke="#475569" strokeWidth={1} />
                    <text x={237} y={14} textAnchor="middle" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">
                      Payload
                    </text>
                  </g>

                  {/* Tag Details */}
                  <g transform="translate(15, 82)" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                    <text x={0} y={0} fill="#7dd3fc" fontWeight="600">Tag Protocol ID (TPID):</text>
                    <text x={170} y={0} fill="#f8fafc">0x8100 (802.1Q)</text>

                    <text x={0} y={18} fill="#7dd3fc" fontWeight="600">VLAN Identifier (VID):</text>
                    <text x={170} y={18} fill="#a5b4fc" fontWeight="700">VID=10 (Engineering)</text>

                    <text x={0} y={36} fill="#7dd3fc" fontWeight="600">Priority Code Point (PCP):</text>
                    <text x={170} y={36} fill="#f8fafc">0 (Best Effort)</text>

                    <line x1={0} y1={46} x2={270} y2={46} stroke="#1e293b" strokeWidth={1} />

                    <text x={0} y={60} fill="#34d399" fontSize="7.5">
                      SW1: Inserts Tag ➔ SW2: Strips Tag before PC3
                    </text>
                  </g>
                </g>

                {/* Step 3: Native VLAN Match Box */}
                {activeStepIndex >= 3 && (
                  <g transform="translate(600, 310)">
                    <rect
                      x={-140}
                      y={-12}
                      width={280}
                      height={32}
                      rx={6}
                      fill="#062e1e"
                      stroke="#22c55e"
                      strokeWidth={1.2}
                    />
                    <text
                      x={0}
                      y={2}
                      textAnchor="middle"
                      fill="#4ade80"
                      fontSize="8.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      NATIVE VLAN: 1 (UNTAGGED TRANSIT)
                    </text>
                    <text
                      x={0}
                      y={14}
                      textAnchor="middle"
                      fill="#86efac"
                      fontSize="7.5"
                      fontFamily="monospace"
                    >
                      Matched on SW1 &amp; SW2 · Zero VLAN Leaking
                    </text>
                  </g>
                )}

                {/* Step 4: Cross-Switch Ping Active Visualization */}
                {activeStepIndex === 4 && (
                  <>
                    {/* PC3 Ping Success Callout */}
                    <g transform="translate(1030, 80)">
                      <rect x={-75} y={-10} width={150} height={20} rx={4} fill="#1e1b4b" stroke="#818cf8" strokeWidth={1} />
                      <text x={0} y={4} textAnchor="middle" fill="#c7d2fe" fontSize="8" fontWeight="600" fontFamily="monospace">
                        PC3: Ping Reply Sent ✓
                      </text>
                    </g>

                    {/* VLAN 20 Silent Indicators */}
                    <g transform="translate(80, 420)">
                      <text x={0} y={0} fill="#64748b" fontSize="8" fontFamily="monospace" fontStyle="italic">
                        PC2 (VLAN 20): Silent (0 frames)
                      </text>
                    </g>
                    <g transform="translate(1030, 420)">
                      <text x={0} y={0} fill="#64748b" fontSize="8" fontFamily="monospace" fontStyle="italic">
                        PC4 (VLAN 20): Silent (0 frames)
                      </text>
                    </g>
                  </>
                )}

                {/* Step 5 / Recap: Four Rules of VLAN Trunks */}
                {activeStepIndex === 5 && (
                  <g transform="translate(600, 415)">
                    <rect
                      x={-190}
                      y={-16}
                      width={380}
                      height={96}
                      rx={8}
                      fill="#070c14"
                      stroke="#38bdf8"
                      strokeWidth={1.3}
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="9.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      THE 4 RULES OF VLAN TRUNKS
                    </text>
                    <g transform="translate(-175, 22)" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                      <text x={0} y={0}>1. TRUNK PORT: Carries multiple VLANs over one link</text>
                      <text x={0} y={15}>2. IEEE 802.1Q: Inserts 4-byte header with 12-bit VLAN ID</text>
                      <text x={0} y={30}>3. TRANSPARENT: Access ports strip tags; PCs never see them</text>
                      <text x={0} y={45} fill="#4ade80" fontWeight="600">
                        4. NATIVE VLAN: Untagged trunk transit; must match on both ends
                      </text>
                      <text x={0} y={60} fill="#a78bfa" fontWeight="600">
                        Next: Day 12 · Router-on-a-Stick (Inter-VLAN Routing)
                      </text>
                    </g>
                  </g>
                )}
              </>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};
