'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  NETWORKING_ROADMAP_STAGES,
  getAllNetworkingModules,
} from '@/content/networking';
import {
  ArrowRight,
  Terminal,
  Layers,
  Network,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight,
  Compass,
  Play,
  Share2,
} from 'lucide-react';

interface TooltipInfo {
  visible: boolean;
  dayNumber: number;
  id: string;
  title: string;
  stageName: string;
  description: string;
  isAvailable: boolean;
  x: number;
  y: number;
}

const MODULE_TEASERS: Record<string, string> = {
  'net-01': 'Connect two computers with a physical cable. Learn IP addresses, ping, and MAC hardware identity.',
  'net-02': 'Understand IP networks, host portions, and subnet masks. Discover why computers must be on the same subnet.',
  'net-03': 'Split networks using CIDR prefix notation (/25). Master broadcast boundaries and subnetting rules.',
  'net-04': 'Introduce Router R1 to connect Subnet 1 and Subnet 2. Configure default gateways and inspect layer-3 boundaries.',
  'net-05': 'Chain Router R1 to Router R2 across Subnet 3. Add static routes with next-hop IP addresses.',
  'net-06': 'Connect to an ISP provider router and external web server. Master 0.0.0.0/0 default routes and longest prefix matching.',
  'net-07': 'How devices find hardware MAC addresses using Address Resolution Protocol (ARP), broadcast requests, and the ARP cache.',
  'net-08': 'Discover how switches map physical ports to MAC hardware addresses, flood unknown unicasts, and selectively forward frames.',
  'net-09': 'Explore broadcast domains, broadcast storms, and how routers isolate broadcast traffic at Layer 3 boundaries.',
  'net-10': 'Segment a single physical switch into isolated logical networks with VLANs and access ports.',
  'net-11': 'Carry multiple VLANs across a single cable using 802.1Q tagged trunks and understand the native VLAN.',
  'net-12': 'Route traffic between isolated VLANs using Router-on-a-Stick and 802.1Q sub-interfaces.',
  'net-13': 'Break Layer 2 loops and prevent broadcast storms using Spanning Tree Protocol (IEEE 802.1D) and BPDUs.',
  'net-14': 'Deconstruct the IPv4 TTL field and ICMP (RFC 792) to understand how ping, traceroute, and PMTUD operate.',
  'net-15': 'Trace multi-hop internet routes across fiber links. Learn 3-probe telemetry, propagation delay physics, and CoPP rate limiting.',
};

export const NetworkingHomePage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'tree' | 'cards'>('tree');
  const [activeStageFilter, setActiveStageFilter] = useState<string>('all');
  const [tooltip, setTooltip] = useState<TooltipInfo>({
    visible: false,
    dayNumber: 1,
    id: 'net-01',
    title: '',
    stageName: '',
    description: '',
    isAvailable: true,
    x: 0,
    y: 0,
  });

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const availableModules = getAllNetworkingModules();
  const availableSet = new Set(availableModules.map((m) => m.id));
  const latestModule = availableModules[availableModules.length - 1];

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLElement>,
    day: { dayNumber: number; id: string; title: string },
    stageName: string
  ) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const isAvail = availableSet.has(day.id);
    const teaser =
      MODULE_TEASERS[day.id] ||
      (isAvail
        ? 'Interactive hands-on networking lesson on live canvas.'
        : `Scheduled lesson in ${stageName}. Building on the foundations from previous days.`);

    // Clamp coordinates inside window viewport bounds
    const targetX = rect.left + rect.width / 2;
    const clampedX = Math.max(150, Math.min(window.innerWidth - 150, targetX));
    const targetY = rect.top - 12;

    setTooltip({
      visible: true,
      dayNumber: day.dayNumber,
      id: day.id,
      title: day.title,
      stageName,
      description: teaser,
      isAvailable: isAvail,
      x: clampedX,
      y: targetY,
    });
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setTooltip((prev) => ({ ...prev, visible: false }));
    }, 120);
  };

  const handleTooltipEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleTooltipLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setTooltip((prev) => ({ ...prev, visible: false }));
    }, 100);
  };

  // Filter stages if active filter is applied
  const filteredStages =
    activeStageFilter === 'all'
      ? NETWORKING_ROADMAP_STAGES
      : NETWORKING_ROADMAP_STAGES.filter((s) => s.name === activeStageFilter);

  // Smoothly center the targeted day if returning from a lesson (e.g., #day-4 or #day-6)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scrollToHash = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#day-')) {
        const dayNum = hash.replace('#day-', '');
        const target =
          document.getElementById(`day-${dayNum}`) ||
          document.getElementById(`card-day-${dayNum}`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
      }
    };

    const timer = setTimeout(scrollToHash, 200);
    window.addEventListener('hashchange', scrollToHash);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', scrollToHash);
    };
  }, [viewMode]);

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
      className="min-h-screen bg-[#07090e] text-[#ececf0] text-[15px] leading-[1.6] flex flex-col selection:bg-[#4ade80]/20 selection:text-[#4ade80] relative overflow-x-hidden"
    >
      {/* Background Ambient Glow & Grid Accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden select-none opacity-40 z-0"
      >
        <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#22c55e]/15 via-[#0ea5e9]/5 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[800px] right-[-100px] w-[500px] h-[500px] bg-[#3b82f6]/5 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-40" />
      </div>

      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-3.5 bg-[#07090e]/85 backdrop-blur-md border-b border-[#1b2230]">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-[17px] tracking-tight hover:text-[#4ade80] transition-colors"
          >
            <div className="w-6 h-6 rounded-md bg-[#4ade80]/10 border border-[#4ade80]/30 grid place-items-center text-[#4ade80]">
              <Network size={14} />
            </div>
            <span>Click</span>
          </Link>

          <div className="hidden md:flex items-center gap-5 text-[13.5px] text-[#8e98a8]">
            <Link href="/sql" className="hover:text-[#ececf0] transition-colors">
              SQL
            </Link>
            <Link href="/prisma" className="hover:text-[#ececf0] transition-colors">
              Prisma
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-mono bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/25">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
            {availableModules.length} Days Live
          </span>

          <Link
            href="/networking/learn/net-01"
            className="inline-flex items-center gap-1.5 bg-[#4ade80] text-[#07090e] font-semibold px-4 py-1.5 rounded-full text-[13px] hover:bg-[#4ade80]/90 transition-all active:scale-95 shadow-[0_0_16px_rgba(74,222,128,0.25)]"
          >
            <Play size={13} fill="currentColor" />
            <span>Start Day 1</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 max-w-[760px] mx-auto pt-16 sm:pt-20 pb-10 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121824] border border-[#222d42] text-[12px] font-mono tracking-wide text-[#4ade80] font-medium mb-4 shadow-sm">
          <Terminal size={13} />
          <span>Interactive Networking Curriculum · Zero Analogies</span>
        </div>

        <h1 className="text-[36px] sm:text-[52px] font-semibold tracking-[-0.03em] leading-[1.12] mb-5 text-[#f1f5f9]">
          Learn networking by{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ade80] via-[#38bdf8] to-[#818cf8]">
            building it.
          </span>
        </h1>

        <p className="text-[#94a3b8] text-[16px] sm:text-[17px] leading-relaxed max-w-[580px] mx-auto mb-8">
          Short, concrete daily modules. Learn the physical reality of packets,
          routers, switches, and routing tables on a live canvas with an
          in-browser simulated network terminal.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/networking/learn/net-01"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#4ade80] text-[#07090e] rounded-full px-6 py-3 font-semibold text-[15px] hover:bg-[#4ade80]/90 transition-all hover:shadow-[0_0_24px_rgba(74,222,128,0.35)] active:scale-95"
          >
            <span>Start Day 1 · The First Link</span>
            <ArrowRight size={16} />
          </Link>

          {latestModule && (
            <Link
              href={`/networking/learn/${latestModule.id}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#121824] border border-[#26354d] text-[#e2e8f0] rounded-full px-5 py-3 font-medium text-[14px] hover:border-[#4ade80]/60 hover:text-[#4ade80] transition-colors"
            >
              <span>Latest: Day {latestModule.dayNumber} · {latestModule.shortTitle || latestModule.title}</span>
              <ChevronRight size={15} />
            </Link>
          )}
        </div>

        {/* Key Track Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] font-mono text-[#7b899e]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-[#4ade80]" /> {availableModules.length} Days Live
            Today
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-[#38bdf8]" /> 35 Days Track
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-[#a78bfa]" /> Real In-Browser
            Terminal
          </span>
        </div>
      </header>

      {/* Main Roadmap & Curriculum Area */}
      <section id="roadmap" className="relative z-10 px-4 sm:px-6 pt-6 pb-28 flex-1 max-w-[1100px] w-full mx-auto">
        {/* Controls Bar: View Mode Switcher & Quick Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-8 border-b border-[#1b2230]">
          <div>
            <h2 className="text-[13px] font-mono tracking-[0.14em] uppercase text-[#7b899e] font-semibold flex items-center gap-2">
              <Compass size={14} className="text-[#4ade80]" />
              <span>Curriculum Roadmap & Modules</span>
            </h2>
            <p className="text-[13px] text-[#64748b] mt-0.5">
              Select any live module (Days 1–6) to enter its interactive workspace.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            {/* View Switcher: Tree vs Cards */}
            <div className="inline-flex p-1 rounded-lg bg-[#111622] border border-[#1e2738] text-[13px]">
              <button
                onClick={() => setViewMode('tree')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  viewMode === 'tree'
                    ? 'bg-[#1e2738] text-[#4ade80] shadow-sm'
                    : 'text-[#8e98a8] hover:text-[#ececf0]'
                }`}
              >
                <Network size={14} />
                <span>Topology Tree</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-[#1e2738] text-[#4ade80] shadow-sm'
                    : 'text-[#8e98a8] hover:text-[#ececf0]'
                }`}
              >
                <Layers size={14} />
                <span>Module Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================
            VIEW 1: Interactive Connected Topology Tree
            ============================================================ */}
        {viewMode === 'tree' && (
          <div className="w-full overflow-x-auto pb-10 pt-2 scrollbar-thin scrollbar-thumb-[#1e2738] scrollbar-track-transparent">
            <div className="min-w-[640px] flex flex-col items-center">
              {/* Root Circuit Node */}
              <div className="border border-[#4ade80] text-[#4ade80] bg-[#4ade80]/[0.08] shadow-[0_0_20px_rgba(74,222,128,0.15)] rounded-full px-5 py-1.5 text-[13px] font-mono font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-ping" />
                <span>Networking · Zero to Router</span>
              </div>

              {/* Stages Breakdown */}
              {NETWORKING_ROADMAP_STAGES.map((stage, stageIdx) => {
                const isLiveStage = stage.days.some((d) => availableSet.has(d.id));

                return (
                  <React.Fragment key={stageIdx}>
                    {/* Vertical trunk line */}
                    <div
                      className={`w-[2px] h-8 transition-colors ${
                        isLiveStage
                          ? 'bg-gradient-to-b from-[#4ade80]/60 to-[#4ade80]/30'
                          : 'bg-[#1e2738]'
                      }`}
                    />

                    {/* Stage Pill Label */}
                    <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#111622] border border-[#1e2738] text-[11px] font-mono tracking-[0.14em] uppercase text-[#94a3b8]">
                      <span>{stage.name}</span>
                      {isLiveStage && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                      )}
                    </div>

                    {/* Small connector trunk */}
                    <div
                      className={`w-[2px] h-4 transition-colors ${
                        isLiveStage ? 'bg-[#4ade80]/30' : 'bg-[#1e2738]'
                      }`}
                    />

                    {/* Day Children Cluster */}
                    <div className="relative flex gap-8 sm:gap-11 justify-center px-6">
                      {/* Horizontal connector line */}
                      <div
                        className={`absolute top-0 left-[36px] right-[36px] h-[2px] ${
                          isLiveStage ? 'bg-[#4ade80]/30' : 'bg-[#1e2738]'
                        }`}
                      />

                      {stage.days.map((day) => {
                        const isAvailable = availableSet.has(day.id);
                        const isFirst = day.dayNumber === 1;

                        return (
                          <div
                            key={day.id}
                            className="relative pt-6 flex flex-col items-center group"
                          >
                            {/* Vertical line from horizontal bus to node */}
                            <div
                              className={`absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-6 transition-colors ${
                                isAvailable
                                  ? 'bg-[#4ade80]/40 group-hover:bg-[#4ade80]'
                                  : 'bg-[#1e2738]'
                              }`}
                            />

                            {/* Node Circle Anchor */}
                            <Link
                              id={`day-${day.dayNumber}`}
                              href={
                                isAvailable
                                  ? `/networking/learn/${day.id}`
                                  : `#roadmap`
                              }
                              onClick={(e) => {
                                if (!isAvailable) {
                                  e.preventDefault();
                                }
                              }}
                              onMouseEnter={(e) =>
                                handleMouseEnter(e, day, stage.name)
                              }
                              onMouseLeave={handleMouseLeave}
                              className={`relative z-10 w-[54px] h-[54px] rounded-full border grid place-items-center font-mono text-[16px] font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] scroll-mt-48 target:ring-4 target:ring-[#4ade80]/60 target:scale-110 target:border-[#4ade80] ${
                                isFirst
                                  ? 'bg-[#4ade80] border-[#4ade80] text-[#07090e] shadow-[0_0_24px_rgba(74,222,128,0.45)] hover:scale-110 active:scale-95 ring-4 ring-[#4ade80]/20'
                                  : isAvailable
                                  ? 'bg-[#111927] border-[#4ade80]/60 text-[#4ade80] hover:border-[#4ade80] hover:bg-[#152338] hover:scale-110 hover:shadow-[0_0_22px_rgba(74,222,128,0.35)] active:scale-95 cursor-pointer'
                                  : 'bg-[#0d111a] border-[#1b2230] text-[#475569] hover:border-[#2d3748] cursor-not-allowed opacity-75'
                              }`}
                              aria-label={`Day ${day.dayNumber}: ${day.title} (${
                                isAvailable ? 'Available' : 'Upcoming'
                              })`}
                            >
                              <span>{day.dayNumber}</span>

                              {!isAvailable && (
                                <Lock
                                  size={10}
                                  className="absolute bottom-1 text-[#475569]"
                                />
                              )}
                            </Link>

                            {/* Micro title label below circle */}
                            <span
                              className={`mt-2 text-[11px] font-mono text-center max-w-[80px] truncate transition-colors ${
                                isAvailable
                                  ? 'text-[#94a3b8] group-hover:text-[#4ade80]'
                                  : 'text-[#475569]'
                              }`}
                            >
                              Day {day.dayNumber}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================
            VIEW 2: Stage Module Cards View (Comprehensive & Direct)
            ============================================================ */}
        {viewMode === 'cards' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {NETWORKING_ROADMAP_STAGES.map((stage, idx) => {
              const liveCount = stage.days.filter((d) =>
                availableSet.has(d.id)
              ).length;
              const isStageLive = liveCount > 0;

              return (
                <div
                  key={idx}
                  className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
                    isStageLive
                      ? 'bg-[#0f1420]/80 border-[#1f2d45] shadow-lg shadow-black/20'
                      : 'bg-[#0b0e15]/50 border-[#161c28] opacity-80'
                  }`}
                >
                  {/* Stage Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#1b2538]">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg grid place-items-center font-mono text-xs font-semibold ${
                          isStageLive
                            ? 'bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30'
                            : 'bg-[#161d2a] text-[#64748b] border border-[#20293a]'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="text-[17px] font-semibold text-[#f1f5f9] tracking-tight">
                          {stage.name}
                        </h3>
                        <p className="text-[12.5px] text-[#7b899e]">
                          {liveCount} of {stage.days.length} modules ready to practice
                        </p>
                      </div>
                    </div>

                    {isStageLive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                        Live Stage
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#141a26] text-[#64748b] border border-[#1e2738]">
                        <Lock size={11} /> Planned
                      </span>
                    )}
                  </div>

                  {/* Modules Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {stage.days.map((day) => {
                      const isAvailable = availableSet.has(day.id);
                      const teaser =
                        MODULE_TEASERS[day.id] ||
                        `Upcoming lesson in ${stage.name}.`;

                      return (
                        <div
                          key={day.id}
                          id={`card-day-${day.dayNumber}`}
                          className={`rounded-xl border p-4 flex flex-col justify-between transition-all duration-200 scroll-mt-36 target:ring-2 target:ring-[#4ade80]/60 target:border-[#4ade80] ${
                            isAvailable
                              ? 'bg-[#131b2a] border-[#22314a] hover:border-[#4ade80]/60 hover:shadow-lg hover:shadow-[#4ade80]/5 hover:-translate-y-0.5'
                              : 'bg-[#0d121c] border-[#182130] opacity-60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span
                                className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                                  isAvailable
                                    ? 'bg-[#4ade80]/15 text-[#4ade80]'
                                    : 'bg-[#182130] text-[#64748b]'
                                }`}
                              >
                                Day {day.dayNumber}
                              </span>

                              {isAvailable ? (
                                <span className="text-[11px] text-[#4ade80] font-mono">
                                  ● Ready
                                </span>
                              ) : (
                                <span className="text-[11px] text-[#475569] font-mono">
                                  Upcoming
                                </span>
                              )}
                            </div>

                            <h4 className="text-[15px] font-semibold text-[#f1f5f9] mb-1.5 leading-snug">
                              {day.title}
                            </h4>

                            <p className="text-[12.5px] text-[#8e98a8] leading-relaxed mb-4 line-clamp-3">
                              {teaser}
                            </p>
                          </div>

                          <div>
                            {isAvailable ? (
                              <Link
                                href={`/networking/learn/${day.id}`}
                                className="w-full inline-flex items-center justify-between px-3.5 py-2 rounded-lg bg-[#4ade80]/10 hover:bg-[#4ade80] text-[#4ade80] hover:text-[#07090e] border border-[#4ade80]/30 hover:border-[#4ade80] text-[13px] font-semibold transition-all group"
                              >
                                <span>Launch Workspace</span>
                                <ArrowRight
                                  size={14}
                                  className="transition-transform group-hover:translate-x-0.5"
                                />
                              </Link>
                            ) : (
                              <div className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#111722] text-[#475569] border border-[#1a2333] text-[12px] font-mono cursor-not-allowed">
                                <Lock size={12} />
                                <span>Curriculum Reserved</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ============================================================
          SMOOTH FLOATING POPOVER CARD
          Animated with CSS opacity & scale without abrupt unmounting
          ============================================================ */}
      <div
        onMouseEnter={handleTooltipEnter}
        onMouseLeave={handleTooltipLeave}
        style={{
          left: `${tooltip.x}px`,
          top: `${tooltip.y}px`,
          transform: 'translate(-50%, -100%)',
        }}
        className={`fixed z-50 transition-all duration-200 ease-out max-w-[280px] w-full ${
          tooltip.visible
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="relative bg-[#111827]/95 backdrop-blur-xl border border-[#2a374f] rounded-xl p-3.5 text-[#ececf0] shadow-[0_20px_40px_rgba(0,0,0,0.7),0_0_24px_rgba(74,222,128,0.12)]">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-medium text-[#94a3b8]">
              {tooltip.stageName} · Day {tooltip.dayNumber}
            </span>

            {tooltip.isAvailable ? (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-mono px-2 py-0.2 rounded-full bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-mono px-2 py-0.2 rounded-full bg-[#1e293b] text-[#64748b] border border-[#334155]">
                <Lock size={9} /> Upcoming
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="text-[14px] font-semibold text-[#f8fafc] leading-tight mb-2">
            {tooltip.title}
          </h4>

          {/* Description */}
          <p className="text-[12px] text-[#94a3b8] leading-relaxed mb-3">
            {tooltip.description}
          </p>

          {/* Action CTA inside popover */}
          {tooltip.isAvailable ? (
            <Link
              href={`/networking/learn/${tooltip.id}`}
              className="inline-flex w-full items-center justify-center gap-1.5 bg-[#4ade80] text-[#07090e] font-semibold text-[12.5px] py-1.5 px-3 rounded-lg hover:bg-[#4ade80]/90 transition-all shadow-[0_0_12px_rgba(74,222,128,0.25)]"
            >
              <span>Enter Day {tooltip.dayNumber} Lesson</span>
              <ArrowRight size={13} />
            </Link>
          ) : (
            <div className="text-[11px] font-mono text-[#64748b] text-center py-0.5">
              Part of upcoming release
            </div>
          )}

          {/* Downward triangle arrow indicator */}
          <div className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-3 h-3 bg-[#111827] border-b border-r border-[#2a374f] rotate-45" />
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1b2230] py-8 px-6 text-center text-[13px] text-[#64748b] bg-[#07090e]">
        <div className="flex flex-wrap items-center justify-center gap-6 mb-3">
          <Link href="/sql" className="hover:text-[#94a3b8] transition-colors">
            SQL
          </Link>
          <Link href="/prisma" className="hover:text-[#94a3b8] transition-colors">
            Prisma
          </Link>
          <a
            href="#roadmap"
            className="hover:text-[#4ade80] transition-colors"
          >
            Back to Top ↑
          </a>
        </div>
        <p className="m-0">
          Click Networking Track · Hands-on interactive packet & routing simulation
        </p>
      </footer>
    </div>
  );
};
