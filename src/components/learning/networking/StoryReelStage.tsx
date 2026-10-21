'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { soundFx } from '../../../lib/networking/audio-fx';

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
  onEnterLab?: () => void;
}

export const StoryReelStage: React.FC<StoryReelStageProps> = ({
  onComplete,
  onSceneChange,
  onEnterLab,
}) => {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [pulsePosition, setPulsePosition] = useState(0);

  const scene = NET_01_STORY_SCENES[currentSceneIdx];

  // Animate pulse when scene 2 is active
  useEffect(() => {
    if (scene.id === 'scene-2') {
      const interval = setInterval(() => {
        setPulsePosition((pos) => (pos >= 100 ? 0 : pos + 3.5));
      }, 40);
      return () => clearInterval(interval);
    }
  }, [scene.id]);

  const handleNext = useCallback(() => {
    if (currentSceneIdx < NET_01_STORY_SCENES.length - 1) {
      const nextIdx = currentSceneIdx + 1;
      setCurrentSceneIdx(nextIdx);
      onSceneChange?.(nextIdx);
      soundFx.playPacketPulse();
    } else {
      if (onEnterLab) {
        onEnterLab();
      } else {
        onComplete?.();
      }
    }
  }, [currentSceneIdx, onComplete, onSceneChange, onEnterLab]);

  const handlePrev = useCallback(() => {
    if (currentSceneIdx > 0) {
      const prevIdx = currentSceneIdx - 1;
      setCurrentSceneIdx(prevIdx);
      onSceneChange?.(prevIdx);
      soundFx.playCableUnplug();
    }
  }, [currentSceneIdx, onSceneChange]);

  // Keyboard navigation: ArrowRight / Space / Enter = Next, ArrowLeft / Backspace = Prev
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside a form input
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.code === 'Space' || e.code === 'ArrowRight' || e.code === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft' || e.code === 'Backspace') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  return (
    <div
      className="relative rounded-2xl bg-[#070b14] border border-cyan-500/30 overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col"
      data-testid="story-reel-stage"
    >
      {/* 1. Header Toolbar with Scene Stepper */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#0a101f] border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs">
            🎬
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              INTERACTIVE STORY REEL • SCENE {scene.sceneNumber} OF {NET_01_STORY_SCENES.length}
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">{scene.title}</h3>
          </div>
        </div>

        {/* Clickable Scene Navigation Dots */}
        <div className="flex items-center gap-2">
          {NET_01_STORY_SCENES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setCurrentSceneIdx(idx);
                onSceneChange?.(idx);
              }}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${
                idx === currentSceneIdx
                  ? 'w-7 bg-cyan-400 shadow-[0_0_10px_#38bdf8]'
                  : idx < currentSceneIdx
                  ? 'w-2.5 bg-emerald-400'
                  : 'w-2 bg-zinc-700 hover:bg-zinc-500'
              }`}
              title={`Jump to Scene ${idx + 1}: ${s.title}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Unobstructed Visual Animation Viewport (Clean, Never Covered!) */}
      <div className="relative h-[250px] sm:h-[280px] flex items-center justify-center overflow-hidden bg-radial-at-c from-[#0d1627] to-[#060912] border-b border-white/5">
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
          <div className="relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            {/* Clean status badge positioned directly above the device */}
            <div className="mb-3 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-[11px] font-mono text-rose-300 flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>No Physical Link</span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/90 border-2 border-cyan-400/60 shadow-[0_0_35px_rgba(6,182,212,0.25)]">
              <span className="text-5xl">💻</span>
            </div>
            <span className="mt-3 font-mono text-xs font-bold text-zinc-200">Computer A (Isolated)</span>
            <span className="text-[11px] font-mono text-zinc-500 mt-0.5">Physical Link: Disconnected</span>
          </div>
        )}

        {/* SCENE 2: The Physical Wire & Electrical Beam */}
        {scene.id === 'scene-2' && (
          <div className="relative w-full max-w-lg px-8 flex items-center justify-between animate-in fade-in zoom-in-95 duration-300">
            {/* Host A */}
            <div className="flex flex-col items-center">
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-3xl shadow-md">
                💻
              </div>
              <span className="mt-2 font-mono text-xs text-zinc-200 font-bold">Computer A</span>
              <span className="text-[10px] font-mono text-cyan-400">Transmitting</span>
            </div>

            {/* Connecting Copper Wire with Traveling Electrical Pulse */}
            <div className="flex-1 relative mx-6 h-3 flex items-center">
              <div className="w-full h-2 rounded-full bg-zinc-800 border border-zinc-700 relative overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 w-10 bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-[1px] shadow-[0_0_12px_#f59e0b]"
                  style={{ left: `${pulsePosition}%` }}
                />
              </div>
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[9px] font-mono text-amber-300 whitespace-nowrap">
                ⚡ Copper Twisted-Pair (Voltage Signals)
              </div>
            </div>

            {/* Host B */}
            <div className="flex flex-col items-center">
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.25)] text-3xl">
                💻
              </div>
              <span className="mt-2 font-mono text-xs text-zinc-200 font-bold">Computer B</span>
              <span className="text-[10px] font-mono text-amber-400">Signal Received</span>
            </div>
          </div>
        )}

        {/* SCENE 3: The Hardware Chip (NIC) & Factory MAC Address */}
        {scene.id === 'scene-3' && (
          <div className="relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            <div className="relative p-5 rounded-2xl bg-gradient-to-b from-zinc-900 to-black border-2 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.35)] flex flex-col items-center">
              <div className="w-14 h-14 rounded-xl bg-zinc-800 border border-cyan-500/40 flex items-center justify-center text-3xl mb-2 shadow-inner">
                🎛️
              </div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                Network Interface Controller (NIC)
              </div>
              {/* Factory Burned Serial Number Badge */}
              <div className="mt-2 px-3 py-1 rounded-lg bg-cyan-950/90 border border-cyan-400/60 text-cyan-300 font-mono text-xs sm:text-sm tracking-wider font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                00-1A-2B-3C-4D-10
              </div>
              <div className="mt-1 text-[9px] font-mono text-zinc-400">
                Factory Stamped • Permanent Physical Address (MAC)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Dedicated Teachable Moment Dialogue Panel (Separated Below — Never Covers the Visual!) */}
      <div className="p-4 sm:p-5 bg-[#0a1120] flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3 h-3 text-amber-400" />
                TEACHABLE MOMENT
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {scene.callout.heading}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
              {scene.callout.text}
            </p>
            <div className="text-[11px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 rounded-lg px-3 py-1.5">
              💡 <strong>Takeaway:</strong> {scene.callout.keyTakeaway}
            </div>
          </div>

          {/* Clean Bidirectional Navigation Controls */}
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            {/* PREVIOUS BUTTON */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentSceneIdx === 0}
              aria-label="Previous Scene (Left Arrow or Backspace)"
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                currentSceneIdx > 0
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 cursor-pointer active:scale-95'
                  : 'bg-zinc-900/50 text-zinc-600 border border-zinc-800/40 cursor-not-allowed opacity-40'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>← Back</span>
            </button>

            {/* NEXT / ENTER LAB BUTTON */}
            <button
              type="button"
              onClick={handleNext}
              aria-label={
                currentSceneIdx < NET_01_STORY_SCENES.length - 1
                  ? 'Next Scene (Space or Right Arrow)'
                  : 'Enter Workplace Lab'
              }
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <span>
                {currentSceneIdx < NET_01_STORY_SCENES.length - 1 ? 'Space →' : 'Enter Workplace Lab ➔'}
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryReelStage;
