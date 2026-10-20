'use client';

import React, { useState, useEffect, useCallback } from 'react';

export interface StoryReelScene {
  id: string;
  sceneNumber: number;
  title: string;
  subtitle: string;
  explanation: string;
  activeFocus: 'host-a' | 'wire' | 'chip' | 'packet';
  callout: {
    heading: string;
    text: string;
    keyTakeaway: string;
  };
}

export const NET_01_STORY_SCENES: StoryReelScene[] = [
  {
    id: 'scene-1',
    sceneNumber: 1,
    title: 'The Solitary Machine',
    subtitle: 'Zero Jargon Baseline',
    explanation: 'A computer in isolation has nowhere to send information.',
    activeFocus: 'host-a',
    callout: {
      heading: 'The Trapped Data Dilemma',
      text: 'Imagine Computer A wants to send a document to a coworker. With no physical connection to anything else, data cannot move. Networking begins with the absolute simplest requirement: a physical path.',
      keyTakeaway: 'Data requires a physical medium to travel beyond the local motherboard.',
    },
  },
  {
    id: 'scene-2',
    sceneNumber: 2,
    title: 'The Copper Link & Voltage Pulse',
    subtitle: 'From Isolation to Physical Medium',
    explanation: 'A copper cable carries electrical pulses, but raw electricity has no meaning by itself.',
    activeFocus: 'wire',
    callout: {
      heading: 'Raw Voltage Arrives',
      text: 'We connect Computer A to Computer B with a copper twisted-pair cable. Computer A sends electrical pulses (voltage changes). Computer B receives electricity—but how does it know where the message starts or who sent it?',
      keyTakeaway: 'Physical cables carry raw voltage pulses. They do not know who is talking or what the signal means.',
    },
  },
  {
    id: 'scene-3',
    sceneNumber: 3,
    title: 'The Factory-Burned Hardware Serial Number',
    subtitle: 'The Network Interface Card (NIC)',
    explanation: 'Every physical network chip is stamped at the factory with a globally unique hardware identity.',
    activeFocus: 'chip',
    callout: {
      heading: 'The Physical Hardware Fingerprint (MAC)',
      text: 'Just like every motor vehicle has a unique Vehicle Identification Number (VIN) stamped onto its metal frame at the factory, every network chip on Earth has a permanent 48-bit serial number burned into its silicon.',
      keyTakeaway: 'The Physical Address (MAC) is a permanent factory-burned identity stamped into the hardware chip.',
    },
  },
];

interface StoryReelStageProps {
  onComplete?: () => void;
  onSceneChange?: (sceneIndex: number) => void;
}

export const StoryReelStage: React.FC<StoryReelStageProps> = ({
  onComplete,
  onSceneChange,
}) => {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPausedAtCheckpoint, setIsPausedAtCheckpoint] = useState(false);
  const [pulsePosition, setPulsePosition] = useState(0);

  const scene = NET_01_STORY_SCENES[currentSceneIdx];

  // Animate pulse when scene 2 is active
  useEffect(() => {
    if (scene.id === 'scene-2') {
      const interval = setInterval(() => {
        setPulsePosition((pos) => (pos >= 100 ? 0 : pos + 4));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [scene.id]);

  // Auto-pause after 800ms to let the animation start, then present the teachable moment
  useEffect(() => {
    setIsPausedAtCheckpoint(false);
    setIsPlaying(true);

    const timer = setTimeout(() => {
      setIsPausedAtCheckpoint(true);
      setIsPlaying(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [currentSceneIdx]);

  const handleContinue = useCallback(() => {
    if (currentSceneIdx < NET_01_STORY_SCENES.length - 1) {
      const nextIdx = currentSceneIdx + 1;
      setCurrentSceneIdx(nextIdx);
      onSceneChange?.(nextIdx);
    } else {
      onComplete?.();
    }
  }, [currentSceneIdx, onComplete, onSceneChange]);

  // Spacebar hotkey to continue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isPausedAtCheckpoint) {
        e.preventDefault();
        handleContinue();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPausedAtCheckpoint, handleContinue]);

  return (
    <div className="relative rounded-2xl bg-[#070b14] border border-cyan-500/30 overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.12)]">
      {/* Stage Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#0a101f] border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs">
            🎬
          </div>
          <div>
            <span className="text-xs font-mono font-semibold text-cyan-400">
              INTERACTIVE STORY REEL • SCENE {scene.sceneNumber} OF {NET_01_STORY_SCENES.length}
            </span>
            <h3 className="text-sm font-bold text-white tracking-wide">{scene.title}</h3>
          </div>
        </div>

        {/* Scene progress dots */}
        <div className="flex items-center gap-2">
          {NET_01_STORY_SCENES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                setCurrentSceneIdx(idx);
                onSceneChange?.(idx);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSceneIdx
                  ? 'w-6 bg-cyan-400 shadow-[0_0_8px_#38bdf8]'
                  : idx < currentSceneIdx
                  ? 'w-2 bg-emerald-400'
                  : 'w-2 bg-zinc-700'
              }`}
              title={s.title}
            />
          ))}
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative h-[340px] sm:h-[380px] flex items-center justify-center overflow-hidden bg-radial-at-c from-[#0d1627] to-[#060912]">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* SCENE 1: Isolated Computer */}
        {scene.id === 'scene-1' && (
          <div className="relative flex flex-col items-center animate-fade-in">
            <div className="relative p-6 rounded-2xl bg-zinc-900/90 border-2 border-cyan-400/60 shadow-[0_0_35px_rgba(6,182,212,0.3)]">
              <span className="text-5xl">💻</span>
              {/* Isolated Warning Badge */}
              <div className="absolute -top-3 -right-3 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono text-amber-300 animate-pulse">
                No Link Detected
              </div>
            </div>
            <span className="mt-3 font-mono text-xs font-semibold text-zinc-300">Computer A (Isolated)</span>
            <span className="text-[11px] font-mono text-zinc-500">Physical Link: Disconnected</span>
          </div>
        )}

        {/* SCENE 2: The Physical Wire & Electrical Beam */}
        {scene.id === 'scene-2' && (
          <div className="relative w-full max-w-lg px-8 flex items-center justify-between animate-fade-in">
            {/* Host A */}
            <div className="flex flex-col items-center">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-700 text-3xl">
                💻
              </div>
              <span className="mt-2 font-mono text-xs text-zinc-300 font-semibold">Computer A</span>
              <span className="text-[10px] font-mono text-cyan-400">Transmitting</span>
            </div>

            {/* Connecting Copper Wire with Traveling Electrical Pulse */}
            <div className="flex-1 relative mx-6 h-3 flex items-center">
              <div className="w-full h-1.5 rounded-full bg-zinc-800 border border-zinc-700 relative overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-[1px] shadow-[0_0_10px_#f59e0b]"
                  style={{ left: `${pulsePosition}%` }}
                />
              </div>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[9px] font-mono text-amber-300">
                ⚡ Copper Twisted-Pair (Voltage Signals)
              </div>
            </div>

            {/* Host B */}
            <div className="flex flex-col items-center">
              <div className="p-4 rounded-xl bg-zinc-900 border border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.25)] text-3xl">
                💻
              </div>
              <span className="mt-2 font-mono text-xs text-zinc-300 font-semibold">Computer B</span>
              <span className="text-[10px] font-mono text-amber-400">Signal Received</span>
            </div>
          </div>
        )}

        {/* SCENE 3: The Hardware Chip (NIC) & Factory MAC Address */}
        {scene.id === 'scene-3' && (
          <div className="relative flex flex-col items-center animate-fade-in">
            {/* The Physical Chip Simulation */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-b from-zinc-900 to-black border-2 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.35)] flex flex-col items-center">
              <div className="w-16 h-16 rounded-xl bg-zinc-800 border border-cyan-500/40 flex items-center justify-center text-3xl mb-3 shadow-inner">
                🎛️
              </div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                Network Interface Controller (NIC)
              </div>
              {/* Factory Burned Serial Number Badge */}
              <div className="mt-2 px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 font-mono text-sm tracking-wider font-bold shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                52:54:00:12:34:56
              </div>
              <div className="mt-1 text-[9px] font-mono text-zinc-500">
                Factory Stamped • IEEE OUI Assigned
              </div>
            </div>
            <span className="mt-3 font-mono text-xs font-semibold text-white">Physical Address (MAC)</span>
          </div>
        )}

        {/* Freeze-Frame Teachable Moment Overlay */}
        {isPausedAtCheckpoint && (
          <div className="absolute inset-x-4 bottom-4 z-20 animate-slide-up">
            <div className="rounded-xl bg-[#0a1120]/95 border border-cyan-500/40 p-4 sm:p-5 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      ⏸ AUTO-PAUSED • TEACHABLE MOMENT
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {scene.callout.heading}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                    {scene.callout.text}
                  </p>
                  <div className="text-[11px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 rounded px-2.5 py-1">
                    💡 <strong>Takeaway:</strong> {scene.callout.keyTakeaway}
                  </div>
                </div>

                {/* Continue Action Button */}
                <button
                  onClick={handleContinue}
                  className="self-end sm:self-center px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 shrink-0"
                >
                  <span>{currentSceneIdx < NET_01_STORY_SCENES.length - 1 ? 'Continue' : 'Enter Workplace Lab'}</span>
                  <span className="text-[10px] font-mono bg-black/20 px-1.5 py-0.5 rounded text-zinc-900 font-semibold">
                    ␣ Space
                  </span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryReelStage;
