'use client';

import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import type { Concept } from '../../../../types/curriculum';
import type { MentorScript } from '../../../../types/networking-curriculum';
import { useMentorScript } from './useMentorScript';
import { MentorDialoguePanel } from './MentorDialoguePanel';
import { SpotlightLayer } from './SpotlightLayer';
import { SwitchSimulationLab } from '../SwitchSimulationLab';
import { ArpSimulationLab } from '../ArpSimulationLab';
import { SubnetBitSlicer } from '../SubnetBitSlicer';
import { EthernetFrameInspector } from '../EthernetFrameInspector';
import { PacketInspector } from '../PacketInspector';
import type { ArpTaskContent, PacketInspectionTaskContent } from '../../../../types/curriculum';

const DEFAULT_NET05_ARP: ArpTaskContent = {
  stage: 1,
  sourceHost: { name: 'Host A', ip: '192.168.1.10', mac: '00:00:5E:00:53:01', port: 1 },
  targetHost: { name: 'Host B', ip: '192.168.1.20', mac: '00:00:5E:00:53:02', port: 2 },
  allHosts: [
    { name: 'Host A', ip: '192.168.1.10', mac: '00:00:5E:00:53:01', port: 1 },
    { name: 'Host B', ip: '192.168.1.20', mac: '00:00:5E:00:53:02', port: 2 },
    { name: 'Host C', ip: '192.168.1.30', mac: '00:00:5E:00:53:03', port: 3 },
  ],
};

const DEFAULT_NET01_PACKET: PacketInspectionTaskContent = {
  title: 'End-to-End Packet Encapsulation: Host A -> Router R1 -> Server Z',
  description: 'Observe multi-layer parcel encapsulation from Layer 7 application data to Layer 2 Ethernet frame.',
  snapshots: [
    {
      hopLabel: 'Hop 1: Host A -> Switch SW1 -> Router R1',
      deviceType: 'Host',
      layer2: {
        srcMac: '00:00:5E:00:53:01',
        dstMac: '00:00:5E:00:53:FE',
        etherType: '0x0800 (IPv4)',
      },
      layer3: {
        version: 4,
        srcIp: '192.168.1.10',
        dstIp: '10.0.0.50',
        ttl: 64,
        protocol: 'TCP (6)',
      },
      layer4: {
        type: 'TCP',
        srcPort: 49152,
        dstPort: 80,
      },
      layer7: {
        protocol: 'HTTP',
        summary: 'GET /index.html HTTP/1.1',
      },
    },
    {
      hopLabel: 'Hop 2: Router R1 -> Server Z (WAN Link)',
      deviceType: 'Router',
      layer2: {
        srcMac: '00:00:5E:00:53:FF',
        dstMac: '00:00:5E:00:53:50',
        etherType: '0x0800 (IPv4)',
      },
      layer3: {
        version: 4,
        srcIp: '192.168.1.10',
        dstIp: '10.0.0.50',
        ttl: 63,
        protocol: 'TCP (6)',
      },
      layer4: {
        type: 'TCP',
        srcPort: 49152,
        dstPort: 80,
      },
      layer7: {
        protocol: 'HTTP',
        summary: 'GET /index.html HTTP/1.1',
      },
    },
  ],
};

interface MentorLessonStageProps {
  moduleId: string;
  concept: Concept;
  script: MentorScript;
  onComplete?: () => void;
}

export const MentorLessonStage: React.FC<MentorLessonStageProps> = ({
  moduleId,
  concept,
  script,
  onComplete,
}) => {
  const {
    state,
    currentBeat,
    handleNext,
    handleActionDone,
    handleSelectPrediction,
    handleSelectWhy,
    handleSubmitFill,
    handleReplay,
  } = useMentorScript(script);

  const [activeSpotlightOverride, setActiveSpotlightOverride] = useState<string | null>(null);
  const [showTextFallback, setShowTextFallback] = useState(false);

  // Active spotlight is either overridden by clicking a Term chip, or the beat's defined spotlight
  const effectiveSpotlight = activeSpotlightOverride ?? state.currentSpotlight;
  const activeTermLabel = Object.values(script.terms).find((t) => t.part === effectiveSpotlight)?.label;

  const handleNextWithCompletion = () => {
    if (state.beatIndex >= script.beats.length - 1) {
      onComplete?.();
    }
    handleNext();
  };

  /**
   * Render the corresponding interactive simulator stage.
   * Controlled mode: passes visibleParts, spotlight, and controlledStepIndex.
   */
  const renderSimulatorStage = () => {
    if (moduleId === 'net-03') {
      return (
        <SwitchSimulationLab
          visibleParts={state.revealedParts}
          spotlight={effectiveSpotlight ?? undefined}
          controlledStepIndex={currentBeat?.stage?.stepIndex}
          onAction={handleActionDone}
        />
      );
    }

    if (moduleId === 'net-05') {
      const taskArp = concept.tasks?.find((t) => t.arp)?.arp || DEFAULT_NET05_ARP;
      return (
        <div data-testid="arp-simulation-stage" className="w-full">
          <ArpSimulationLab
            taskArp={taskArp}
            title={concept.title}
            description="Interactive ARP Resolution & FIFO Hold Queue"
          />
        </div>
      );
    }

    if (moduleId === 'net-04') {
      return (
        <div data-testid="subnet-slicer-stage" className="w-full">
          <SubnetBitSlicer
            initialIp="192.168.10.130"
            initialPrefix={26}
            isInteractive={true}
            title="Interactive Subnet Bit Slicer & Active Octet"
          />
        </div>
      );
    }

    if (moduleId === 'net-02') {
      return (
        <div data-testid="ethernet-frame-stage" className="w-full">
          <EthernetFrameInspector
            title="Ethernet II Frame Inspector & 32-bit CRC-32"
            description="Inspect MTU boundaries, payload slicing, and CRC error verification."
          />
        </div>
      );
    }

    if (moduleId === 'net-01') {
      const taskContent =
        concept.tasks?.find((t) => t.packetInspection)?.packetInspection || DEFAULT_NET01_PACKET;
      return (
        <div data-testid="packet-inspector-stage" className="w-full">
          <PacketInspector
            taskContent={taskContent}
            title="End-to-End Packet & Frame Inspector"
            description="Multi-layer parcel encapsulation from Layer 7 to Layer 2."
          />
        </div>
      );
    }

    // Fallback placeholder stage
    return (
      <div className="w-full h-full min-h-[360px] flex flex-col items-center justify-center p-6 bg-surface-2/60 border border-border rounded-2xl text-center">
        <span className="font-mono text-xs font-bold text-func uppercase tracking-wider mb-2">
          Interactive Stage • {moduleId.toUpperCase()}
        </span>
        <p className="text-xs text-text-dim max-w-sm font-sans leading-relaxed">
          The interactive stage for {concept.title} is currently active in Mentor Mode.
        </p>
      </div>
    );
  };

  return (
    <div
      className="w-full max-w-[1440px] mx-auto space-y-4 px-0 sm:px-4 min-w-0"
      data-testid="mentor-lesson-stage"
    >
      {/* 2-Pane Split Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 min-w-0 items-start">
        {/* LEFT / BOTTOM (Mobile): Mentor Dialogue Panel (5 cols on desktop) */}
        <div className="order-2 lg:order-1 lg:col-span-5 h-[480px] lg:h-[620px] flex flex-col min-w-0">
          <MentorDialoguePanel
            script={script}
            currentBeat={currentBeat}
            state={state}
            onNext={handleNextWithCompletion}
            onSelectPrediction={handleSelectPrediction}
            onSelectWhy={handleSelectWhy}
            onSubmitFill={handleSubmitFill}
            onReplay={handleReplay}
            onHoverTerm={(partId) => setActiveSpotlightOverride(partId)}
            onClickTerm={(partId) =>
              setActiveSpotlightOverride((prev) => (prev === partId ? null : partId))
            }
            activeSpotlight={effectiveSpotlight}
          />
        </div>

        {/* RIGHT / TOP (Mobile Sticky): Interactive Simulator Stage (7 cols on desktop) */}
        <div className="order-1 lg:order-2 lg:col-span-7 sticky top-2 z-10 lg:static min-w-0">
          <div className="bg-surface border border-border rounded-2xl p-3 sm:p-4 shadow-md overflow-hidden min-h-[380px] lg:min-h-[620px] flex flex-col justify-center">
            <SpotlightLayer
              spotlight={effectiveSpotlight}
              activeLabel={activeTermLabel}
              onClearSpotlight={() => setActiveSpotlightOverride(null)}
            >
              {renderSimulatorStage()}
            </SpotlightLayer>
          </div>
        </div>
      </div>

      {/* Accessible "Read as Text" Fallback Disclosure */}
      <div className="rounded-xl border border-border bg-surface-2/40 overflow-hidden text-xs">
        <button
          type="button"
          onClick={() => setShowTextFallback((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-text-dim hover:text-text hover:bg-surface-3/50 transition-colors focus:outline-none"
        >
          <span className="flex items-center gap-2 font-mono font-medium">
            <BookOpen className="w-3.5 h-3.5 text-func" />
            <span>Read lesson summary as standard text</span>
          </span>
          {showTextFallback ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showTextFallback && (
          <div className="p-4 border-t border-border/60 bg-surface space-y-3 font-sans text-text-dim leading-relaxed animate-in fade-in duration-200">
            <p className="font-semibold text-text">{concept.theory.summary}</p>
            {concept.theory.explanation.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            <div className="p-3 rounded-lg bg-func/10 border border-func/30 text-func font-medium font-mono text-[11px]">
              Key Takeaway: {concept.theory.keyTakeaway}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
