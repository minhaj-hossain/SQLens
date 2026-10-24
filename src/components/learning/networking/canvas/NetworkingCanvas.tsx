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
          </svg>
        </div>
      </div>
    </div>
  );
};
