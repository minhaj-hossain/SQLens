'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { useLearning } from '@/components/providers/LearningProgressProvider';
import { useTrackCurriculum } from '@/components/learn/use-track';
import { isModuleFullyComplete } from '@/lib/progress/unlock-calculator';
import { trackLearnUrl } from '@/lib/track-routes';
import ResetProgressModal from '@/components/ui/ResetProgressModal';

// Interactive Topology simulation in the Hero
interface HeroPacket {
  id: number;
  stage: number; // 0: host-a, 1: wire, 2: switch, 3: router, 4: cloud
  label: string;
}

export const NetworkingTrackHomePage: React.FC = () => {
  const router = useRouter();
  const { userState, resetProgress, resetError } = useLearning();
  const { modules, milestones, meta } = useTrackCurriculum();
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Packet animation state for hero
  const [packet, setPacket] = useState<HeroPacket | null>(null);
  const [pingLog, setPingLog] = useState<string[]>([]);
  const [isPinging, setIsPinging] = useState(false);
  const [expandedMilestone, setExpandedMilestone] = useState<string>('net-milestone-1');

  // Trigger interactive test ping in Hero
  const triggerPing = () => {
    if (isPinging) return;
    setIsPinging(true);
    setPingLog(['[Host-A] Generating ARP & ICMP Echo Request...']);
    setPacket({ id: Date.now(), stage: 0, label: '01011001 (Pulse)' });

    setTimeout(() => {
      setPacket((p) => (p ? { ...p, stage: 1 } : null));
      setPingLog((l) => [...l, '[Copper Link] Carrier signal detected on physical wire (1Gbps Full-Duplex)']);
    }, 600);

    setTimeout(() => {
      setPacket((p) => (p ? { ...p, stage: 2, label: 'ETH: 52:54:00:... → 00:1A:2B:...' } : null));
      setPingLog((l) => [...l, '[SW-1] Ingress Port 1 -> Learned MAC -> Forwarding to Uplink Port 24']);
    }, 1300);

    setTimeout(() => {
      setPacket((p) => (p ? { ...p, stage: 3, label: 'IP: 192.168.1.10 → 8.8.8.8' } : null));
      setPingLog((l) => [...l, '[R-1 Gateway] Longest Prefix Match -> NAT Translation -> Forward to WAN']);
    }, 2000);

    setTimeout(() => {
      setPacket((p) => (p ? { ...p, stage: 4, label: 'ICMP Echo Reply ➔ 8.8.8.8' } : null));
      setPingLog((l) => [...l, '[Cloud] Target 8.8.8.8 reached! Round-trip: 4.2ms. Reply received!']);
      setIsPinging(false);
    }, 2700);

    setTimeout(() => {
      setPacket(null);
    }, 3800);
  };

  // Find first incomplete module to continue
  const completedCount = modules.filter((m) => isModuleFullyComplete(m, userState)).length;
  const progressPercent = Math.round((completedCount / Math.max(modules.length, 1)) * 100);

  const nextModule = modules.find((m) => !isModuleFullyComplete(m, userState)) || modules[0];
  const firstModuleUrl = '/networking/learn/net-01';
  const continueModuleUrl = nextModule ? `/networking/learn/${nextModule.id}` : firstModuleUrl;

  return (
    <div className="min-h-screen bg-[#080c14] text-[#f4f4f5] selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Background Blueprint Grid */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent via-[#080c14]/60 to-[#080c14]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        {/* TOP STATUS BAR */}
        <header className="flex items-center justify-between pb-6 border-b border-white/[0.08] mb-12">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <span className="font-mono font-bold text-sm">NET</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-wide text-white">Networking Track</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  NOC Console v2.0
                </span>
              </div>
              <p className="text-xs text-zinc-400">First-Principles Network Administration</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-mono text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-md hover:bg-white/[0.05]"
            >
              <span>Switch Track</span>
              <span className="text-zinc-600">/</span>
              <span className="text-amber-400/90 hover:underline">SQL</span>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400/90 hover:underline">Prisma</span>
            </Link>
            <button
              onClick={() => setResetModalOpen(true)}
              className="text-xs font-mono text-zinc-500 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
              title="Reset progress"
            >
              Reset
            </button>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="relative rounded-2xl bg-gradient-to-b from-[#0f172a]/80 to-[#0a101f]/90 border border-cyan-500/20 p-6 md:p-10 shadow-[0_0_50px_rgba(6,182,212,0.08)] backdrop-blur-xl mb-16 overflow-hidden">
          {/* Subtle Accent Glows */}
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-cyan-500/10 blur-[90px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-blue-600/10 blur-[90px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Mission Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>ZERO JARGON TO JOB-READY ADMIN</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Master Networking From the <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">Physical Wire</span> to the Cloud.
              </h1>

              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal max-w-2xl">
                No dry textbooks. No memorizing questions. Discover networking from first principles with{' '}
                <strong className="text-white font-semibold">Interactive Story Reels</strong> that auto-pause at teachable moments, paired with{' '}
                <strong className="text-white font-semibold">Guided Workplace Labs</strong> where you run real terminal diagnostics.
              </p>

              {/* Action Buttons & Progress Bar */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href={completedCount > 0 ? continueModuleUrl : firstModuleUrl}
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 group"
                >
                  <span>{completedCount > 0 ? `Resume Module ${nextModule?.day ?? 1}` : 'Launch Module 1: The First Wire'}</span>
                  <span className="transition-transform group-hover:translate-x-1">➔</span>
                </Link>

                <a
                  href="#curriculum-roadmap"
                  className="px-5 py-3.5 rounded-xl font-medium text-sm text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] transition-all flex items-center gap-2"
                >
                  <span>Explore 7 Milestones</span>
                  <span>↓</span>
                </a>
              </div>

              {/* Live Metric Badges */}
              <div className="pt-4 grid grid-cols-3 gap-3 border-t border-white/[0.08] text-center sm:text-left">
                <div>
                  <div className="text-xl font-bold font-mono text-cyan-400">{modules.length} Modules</div>
                  <div className="text-xs text-zinc-400">Story Reel + Lab</div>
                </div>
                <div>
                  <div className="text-xl font-bold font-mono text-emerald-400">{progressPercent}%</div>
                  <div className="text-xs text-zinc-400">Track Completed</div>
                </div>
                <div>
                  <div className="text-xl font-bold font-mono text-amber-400">0 Jargon</div>
                  <div className="text-xs text-zinc-400">Starts with 1 PC</div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive NOC Topology Simulation */}
            <div className="lg:col-span-5 bg-[#090d16] border border-cyan-500/30 rounded-xl p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-xs font-semibold text-zinc-300">LIVE TOPOLOGY SIMULATOR</span>
                </div>
                <button
                  onClick={triggerPing}
                  disabled={isPinging}
                  className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <span>⚡</span>
                  <span>{isPinging ? 'Transmitting...' : 'Send Test Packet'}</span>
                </button>
              </div>

              {/* Topology Visualizer */}
              <div className="py-6 relative flex items-center justify-between px-2">
                {/* Connecting Bus Line */}
                <div className="absolute top-1/2 left-8 right-8 h-1 -translate-y-1/2 bg-zinc-800">
                  {/* Glowing progress packet indicator */}
                  {packet && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_12px_#38bdf8] transition-all duration-500 ease-out flex items-center justify-center text-[8px] font-bold text-black"
                      style={{
                        left: `${packet.stage * 25}%`,
                      }}
                    >
                      ●
                    </div>
                  )}
                </div>

                {/* Node 1: Host A */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-11 h-11 rounded-lg border flex items-center justify-center text-sm font-mono transition-all ${
                    packet?.stage === 0 ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                  }`}>
                    💻
                  </div>
                  <span className="text-[10px] font-mono mt-1 text-zinc-300 font-semibold">Host-A</span>
                  <span className="text-[9px] font-mono text-zinc-500">.1.10</span>
                </div>

                {/* Node 2: Switch SW-1 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-11 h-11 rounded-lg border flex items-center justify-center text-sm font-mono transition-all ${
                    packet?.stage === 2 ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                  }`}>
                    🔀
                  </div>
                  <span className="text-[10px] font-mono mt-1 text-zinc-300 font-semibold">SW-1</span>
                  <span className="text-[9px] font-mono text-zinc-500">L2 MAC</span>
                </div>

                {/* Node 3: Router R-1 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-11 h-11 rounded-lg border flex items-center justify-center text-sm font-mono transition-all ${
                    packet?.stage === 3 ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                  }`}>
                    🛡️
                  </div>
                  <span className="text-[10px] font-mono mt-1 text-zinc-300 font-semibold">R-1</span>
                  <span className="text-[9px] font-mono text-zinc-500">Gateway</span>
                </div>

                {/* Node 4: Cloud 8.8.8.8 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-11 h-11 rounded-lg border flex items-center justify-center text-sm font-mono transition-all ${
                    packet?.stage === 4 ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                  }`}>
                    ☁️
                  </div>
                  <span className="text-[10px] font-mono mt-1 text-zinc-300 font-semibold">Internet</span>
                  <span className="text-[9px] font-mono text-zinc-500">8.8.8.8</span>
                </div>
              </div>

              {/* Dynamic Packet Tag */}
              {packet && (
                <div className="bg-cyan-950/60 border border-cyan-500/40 rounded px-2.5 py-1 text-[11px] font-mono text-cyan-300 text-center mb-3 animate-fade-in">
                  Inspect: {packet.label}
                </div>
              )}

              {/* Mini Terminal Telemetry Log */}
              <div className="bg-black/80 rounded-lg p-2.5 border border-white/[0.06] font-mono text-[10px] text-zinc-400 h-24 overflow-y-auto space-y-1">
                <div className="text-zinc-600">// Live Telemetry Buffer</div>
                {pingLog.length === 0 ? (
                  <div className="text-zinc-500 italic">Click &quot;Send Test Packet&quot; above to watch the signal traverse from physical copper to the internet gateway...</div>
                ) : (
                  pingLog.map((log, idx) => (
                    <div key={idx} className={idx === pingLog.length - 1 ? 'text-cyan-300 font-medium' : 'text-zinc-400'}>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* PEDAGOGY SHOWCASE: The 3-Beat Golden Formula */}
        <section className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Why Other Networking Courses Fail (And How Ours Clicks)
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 mt-2">
              Most courses dump 50 acronyms on day 1. We teach through physical necessity, one machine at a time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Beat 1 */}
            <div className="p-6 rounded-xl bg-[#0c121e] border border-white/[0.08] hover:border-cyan-500/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-mono font-bold mb-4">
                01
              </div>
              <h3 className="font-semibold text-lg text-white mb-2">The Physical Dilemma First</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Before mentioning IP or MAC, we show two machines trying to share a photo. Why does it fail? Because raw electricity has no concept of who is talking. You discover the need before learning the name.
              </p>
            </div>

            {/* Beat 2 */}
            <div className="p-6 rounded-xl bg-[#0c121e] border border-white/[0.08] hover:border-cyan-500/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold mb-4">
                02
              </div>
              <h3 className="font-semibold text-lg text-white mb-2">The Interactive Story Reel</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Animated concepts play like a movie, but automatically freeze at critical teachable moments. A focused spotlight zooms in on the physical network chip so you absorb the &quot;Why&quot; at your own pace.
              </p>
            </div>

            {/* Beat 3 */}
            <div className="p-6 rounded-xl bg-[#0c121e] border border-white/[0.08] hover:border-cyan-500/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold mb-4">
                03
              </div>
              <h3 className="font-semibold text-lg text-white mb-2">The Guided Workplace Lab</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                We never tell you to type a command without explaining what instrument you are holding. You run real diagnostic commands (<code className="text-cyan-300">ipconfig</code>, <code className="text-cyan-300">ping</code>, <code className="text-cyan-300">arp</code>) and match the output to the visual wire.
              </p>
            </div>
          </div>
        </section>

        {/* CURRICULUM ROADMAP: Milestones & Modules */}
        <section id="curriculum-roadmap" className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">Structured Curriculum</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                7 Milestones • 16 Workplace Modules
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Current</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Completed</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-zinc-600"></span> Available</span>
            </div>
          </div>

          <div className="space-y-6">
            {milestones.map((ms) => {
              const isExpanded = expandedMilestone === ms.id;
              const msModules = modules.filter((m) => ms.moduleIds.includes(m.id));
              const msCompletedCount = msModules.filter((m) => isModuleFullyComplete(m, userState)).length;
              const msPercent = Math.round((msCompletedCount / Math.max(msModules.length, 1)) * 100);

              return (
                <div
                  key={ms.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isExpanded
                      ? 'bg-[#0c121e] border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.06)]'
                      : 'bg-[#090d16] border-white/[0.08] hover:border-white/[0.15]'
                  }`}
                >
                  {/* Milestone Header (Click to toggle) */}
                  <div
                    onClick={() => setExpandedMilestone(isExpanded ? '' : ms.id)}
                    className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none hover:bg-white/[0.01]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-lg shrink-0">
                        0{ms.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-cyan-400 tracking-wider">
                            MILESTONE {ms.number}
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-xs font-mono text-zinc-400">{ms.daysRange}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
                          {ms.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                          {ms.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-mono font-medium text-zinc-300">
                          {msCompletedCount} / {msModules.length} Modules
                        </div>
                        <div className="w-24 h-1.5 bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                            style={{ width: `${msPercent}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-zinc-400 font-mono text-sm px-2">
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* Milestone Modules Grid */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-white/[0.06] bg-black/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                        {msModules.map((mod) => {
                          const isCompleted = isModuleFullyComplete(mod, userState);
                          const isCurrent = nextModule?.id === mod.id;

                          return (
                            <div
                              key={mod.id}
                              className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-200 ${
                                isCurrent
                                  ? 'bg-gradient-to-b from-[#121c30] to-[#0d1525] border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/30'
                                  : isCompleted
                                  ? 'bg-[#0a0f19] border-emerald-500/20 hover:border-emerald-500/40'
                                  : 'bg-[#090d16] border-white/[0.06] hover:border-white/[0.12]'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[11px] font-mono font-semibold text-zinc-400">
                                    Module {mod.day}
                                  </span>
                                  {isCompleted ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                      ✓ Complete
                                    </span>
                                  ) : isCurrent ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-400/40 animate-pulse">
                                      ● Current
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.03] px-2 py-0.5 rounded">
                                      Available
                                    </span>
                                  )}
                                </div>

                                <h4 className="font-semibold text-sm text-white line-clamp-1 mb-1">
                                  {mod.title}
                                </h4>
                                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                                  {mod.subtitle || mod.description}
                                </p>
                              </div>

                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-[10px] font-mono bg-zinc-800/80 text-zinc-300 border border-white/[0.08] px-1.5 py-0.5 rounded">
                                    🎬 Story Reel
                                  </span>
                                  <span className="text-[10px] font-mono bg-zinc-800/80 text-zinc-300 border border-white/[0.08] px-1.5 py-0.5 rounded">
                                    💻 Admin Lab
                                  </span>
                                </div>

                                <Link
                                  href={`/networking/learn/${mod.id}`}
                                  className={`w-full py-2 rounded-xl text-xs font-semibold text-center block transition-all active:scale-[0.98] ${
                                    isCurrent
                                      ? 'bg-black hover:bg-zinc-900 text-white border border-white/20 hover:border-white/40 shadow-lg'
                                      : 'bg-[#18181b] hover:bg-[#202024] text-zinc-200 hover:text-white border border-white/[0.08]'
                                  }`}
                                >
                                  {isCompleted ? 'Review Module' : isCurrent ? 'Continue Lesson ➔' : 'Start Module ➔'}
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* BOTTOM FOOTER SECTION */}
        <footer className="mt-24 pt-10 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-zinc-500 font-mono">
          <div>
            <div className="text-zinc-300 font-semibold mb-1">Click • Networking Fundamentals Track</div>
            <p>From the first wire to global internet engineering. Built for aspiring Network Administrators.</p>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/sql" className="hover:text-amber-400 transition-colors">
              SQL Track (57 Days)
            </Link>
            <Link href="/prisma" className="hover:text-emerald-400 transition-colors">
              Prisma ORM Track (14 Days)
            </Link>
            <button
              onClick={() => setResetModalOpen(true)}
              className="hover:text-red-400 transition-colors"
            >
              Reset Track Progress
            </button>
          </div>
        </footer>
      </div>

      {/* Reset Confirmation Modal */}
      <ResetProgressModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        serverError={resetError ?? null}
        onConfirmReset={async (mode, moduleId) => {
          await resetProgress(mode, moduleId);
          setResetModalOpen(false);
        }}
      />
    </div>
  );
};

export default NetworkingTrackHomePage;
