'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NetworkingModule } from '@/types/networking';
import { NetworkingCanvas } from '../canvas/NetworkingCanvas';
import { NetworkingTerminal } from '../terminal/NetworkingTerminal';
import { NetworkingLessonSidebar } from '../sidebar/NetworkingLessonSidebar';
import { ArrowLeft, Map, CheckCircle2 } from 'lucide-react';

interface NetworkingWorkspaceProps {
  module: NetworkingModule;
}

export const NetworkingWorkspace: React.FC<NetworkingWorkspaceProps> = ({
  module,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [lastCommand, setLastCommand] = useState('');
  const [isPinging, setIsPinging] = useState(false);
  const [pc3Ip, setPc3Ip] = useState('192.168.1.30');
  const [pc4Ip, setPc4Ip] = useState('192.168.2.10');
  const [prefillCmd, setPrefillCmd] = useState<string | null>(null);
  const [gateway, setGateway] = useState('192.168.1.1');
  const [r1Route, setR1Route] = useState(false);
  const [r2Route, setR2Route] = useState(false);
  const [r1DefaultRoute, setR1DefaultRoute] = useState(false);
  const [r2DefaultRoute, setR2DefaultRoute] = useState(false);
  const [isCanvasExpanded, setIsCanvasExpanded] = useState(false);

  const currentStep = module.steps[activeStepIndex];
  const recapIdx = module.steps.length - 1;

  // Auto-complete recap step if all preceding commands are done
  useEffect(() => {
    if (activeStepIndex === recapIdx) {
      const allPriorDone = Array.from({ length: recapIdx }, (_, idx) => idx).every(
        (k) => completedSteps.has(k)
      );
      if (allPriorDone) {
        setCompletedSteps((prev) => new Set([...prev, recapIdx]));
      }
    }
  }, [activeStepIndex, completedSteps, recapIdx]);

  const isCurrentStepDone =
    completedSteps.has(activeStepIndex) || currentStep?.cmd === null;
  const canGoNext = isCurrentStepDone && activeStepIndex < module.steps.length - 1;

  // Keyboard ergonomics: Ctrl+Enter to proceed, Alt+Arrow keys to navigate
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (canGoNext) {
          e.preventDefault();
          setActiveStepIndex((prev) => Math.min(module.steps.length - 1, prev + 1));
        }
      } else if (e.altKey && e.key === 'ArrowLeft') {
        if (activeStepIndex > 0) {
          e.preventDefault();
          setActiveStepIndex((prev) => Math.max(0, prev - 1));
        }
      } else if (e.altKey && e.key === 'ArrowRight') {
        if (canGoNext) {
          e.preventDefault();
          setActiveStepIndex((prev) => Math.min(module.steps.length - 1, prev + 1));
        }
      } else if (e.key === 'Escape') {
        setIsCanvasExpanded(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [canGoNext, activeStepIndex, module.steps.length]);

  const handleCommandRun = (cmd: string, output: string) => {
    setLastCommand(cmd);

    // Trigger ping pulse animation
    if (cmd.startsWith('ping')) {
      setIsPinging(true);
      setTimeout(() => setIsPinging(false), 2500);
    }

    const norm = (str: string) => str.trim().toLowerCase().replace(/\s+/g, ' ');
    const normalizedCmd = norm(cmd);

    // Prioritize active step if its command matches, otherwise find any matching step
    const currentStep = module.steps[activeStepIndex];
    if (currentStep?.cmd && norm(currentStep.cmd) === normalizedCmd) {
      setCompletedSteps((prev) => new Set([...prev, activeStepIndex]));
    } else {
      // Check multi-action / alternate commands explicitly instructed in tasks
      let isAlternateMatch = false;
      if (
        module.id === 'net-02' &&
        activeStepIndex === 3 &&
        normalizedCmd === 'ping 192.168.1.40'
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-04' &&
        activeStepIndex === 5 &&
        (normalizedCmd === 'setgw pc1 192.168.1.1' ||
          normalizedCmd.startsWith('ping 192.168.1.'))
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-05' &&
        activeStepIndex === 5 &&
        normalizedCmd === 'ping 192.168.3.10'
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-06' &&
        activeStepIndex === 4 &&
        normalizedCmd === 'ping 198.51.100.10'
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-08' &&
        (activeStepIndex === 0 || activeStepIndex === 3) &&
        (normalizedCmd === 'show mac' || normalizedCmd === 'mac-table')
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-08' &&
        activeStepIndex === 2 &&
        normalizedCmd === 'show log'
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-08' &&
        activeStepIndex === 4 &&
        normalizedCmd === 'clear mac'
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-09' &&
        activeStepIndex === 0 &&
        (normalizedCmd === 'show broadcast' || normalizedCmd === 'show domain')
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-09' &&
        activeStepIndex === 1 &&
        (normalizedCmd === 'show stats' || normalizedCmd === 'station stats')
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-09' &&
        activeStepIndex === 2 &&
        (normalizedCmd === 'show router' || normalizedCmd === 'router broadcast')
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-09' &&
        activeStepIndex === 3 &&
        (normalizedCmd === 'domains' || normalizedCmd === 'show domain')
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-09' &&
        activeStepIndex === 4 &&
        (normalizedCmd === 'ping 192.168.1.255' || normalizedCmd.startsWith('ping 192.168.1.'))
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-10' &&
        activeStepIndex === 0 &&
        (normalizedCmd === 'show vlan' || normalizedCmd === 'show vlans' || normalizedCmd === 'vlan')
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-10' &&
        activeStepIndex === 1 &&
        (normalizedCmd === 'vlan create 10 20' || normalizedCmd === 'vlan 10 20' || normalizedCmd === 'create vlan 10 20')
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-10' &&
        activeStepIndex === 2 &&
        (normalizedCmd.includes('port 1,2 vlan 10') || normalizedCmd.includes('port 1, 2 vlan 10') || normalizedCmd.includes('set port'))
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-10' &&
        activeStepIndex === 3 &&
        (normalizedCmd === 'ping 192.168.10.255' || normalizedCmd.startsWith('ping 192.168.10.'))
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-10' &&
        activeStepIndex === 4 &&
        (normalizedCmd === 'ping 192.168.20.30' || normalizedCmd.startsWith('ping 192.168.20.'))
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-11' &&
        activeStepIndex === 0 &&
        (normalizedCmd === 'show trunk' || normalizedCmd === 'show trunks' || normalizedCmd === 'trunk' || normalizedCmd === 'show interfaces trunk')
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-11' &&
        activeStepIndex === 1 &&
        (normalizedCmd === 'set port 5 trunk' || normalizedCmd === 'switchport mode trunk' || normalizedCmd === 'port 5 trunk')
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-11' &&
        activeStepIndex === 2 &&
        (normalizedCmd === 'show frame header' || normalizedCmd === 'show header' || normalizedCmd === 'debug 802.1q' || normalizedCmd === 'show frame')
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-11' &&
        activeStepIndex === 3 &&
        (normalizedCmd === 'show trunk native' || normalizedCmd === 'show native vlan' || normalizedCmd === 'show native')
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-11' &&
        activeStepIndex === 4 &&
        (normalizedCmd === 'ping 192.168.10.30' || normalizedCmd.startsWith('ping 192.168.10.'))
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-12' &&
        activeStepIndex === 0 &&
        (normalizedCmd === 'ping 192.168.20.20' || normalizedCmd.startsWith('ping 192.168.20.'))
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-12' &&
        activeStepIndex === 1 &&
        (normalizedCmd === 'show router interfaces' ||
          normalizedCmd === 'show ip interface brief' ||
          normalizedCmd === 'show interfaces router' ||
          normalizedCmd === 'show int router' ||
          normalizedCmd === 'show subif')
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-12' &&
        activeStepIndex === 2 &&
        (normalizedCmd === 'create subif eth0.10 10 192.168.10.1/24' ||
          normalizedCmd === 'interface eth0.10' ||
          normalizedCmd === 'int eth0.10' ||
          normalizedCmd === 'create subif eth0.10' ||
          normalizedCmd.includes('eth0.10'))
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-12' &&
        activeStepIndex === 3 &&
        (normalizedCmd === 'create subif eth0.20 20 192.168.20.1/24' ||
          normalizedCmd === 'interface eth0.20' ||
          normalizedCmd === 'int eth0.20' ||
          normalizedCmd === 'create subif eth0.20' ||
          normalizedCmd.includes('eth0.20'))
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-12' &&
        activeStepIndex === 4 &&
        (normalizedCmd === 'ping 192.168.20.20' || normalizedCmd.startsWith('ping 192.168.20.'))
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-13' &&
        activeStepIndex === 0 &&
        (normalizedCmd === 'test broadcast loop' ||
          normalizedCmd === 'test broadcast' ||
          normalizedCmd === 'test loop' ||
          normalizedCmd === 'ping 192.168.1.255')
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-13' &&
        activeStepIndex === 1 &&
        (normalizedCmd === 'show mac-flapping' ||
          normalizedCmd === 'show flapping' ||
          normalizedCmd === 'show mac table flapping' ||
          normalizedCmd === 'show log')
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-13' &&
        activeStepIndex === 2 &&
        (normalizedCmd === 'enable stp' ||
          normalizedCmd === 'spanning-tree mode classic' ||
          normalizedCmd === 'spanning-tree enable' ||
          normalizedCmd === 'stp enable')
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-13' &&
        activeStepIndex === 3 &&
        (normalizedCmd === 'show spanning-tree' ||
          normalizedCmd === 'show stp' ||
          normalizedCmd === 'show spanning tree')
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-13' &&
        activeStepIndex === 4 &&
        (normalizedCmd === 'show spanning-tree ports' ||
          normalizedCmd === 'show spanning-tree blocked' ||
          normalizedCmd === 'show stp ports' ||
          normalizedCmd === 'show stp brief')
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-14' &&
        activeStepIndex === 0 &&
        (normalizedCmd === 'ping 198.51.100.10 -c 1' ||
          normalizedCmd === 'ping 198.51.100.10 -c1' ||
          normalizedCmd === 'ping 198.51.100.10')
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-14' &&
        activeStepIndex === 1 &&
        (normalizedCmd === 'show packet header' ||
          normalizedCmd === 'show header' ||
          normalizedCmd === 'show packet' ||
          normalizedCmd === 'show ip header' ||
          normalizedCmd === 'show ip packet')
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-14' &&
        activeStepIndex === 2 &&
        (normalizedCmd === 'ping 198.51.100.10 -t 1' ||
          normalizedCmd === 'ping 198.51.100.10 -t1' ||
          normalizedCmd === 'ping 198.51.100.10 -ttl 1')
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-14' &&
        activeStepIndex === 3 &&
        (normalizedCmd === 'traceroute 198.51.100.10' ||
          normalizedCmd === 'tracert 198.51.100.10' ||
          normalizedCmd === 'traceroute')
      ) {
        isAlternateMatch = true;
      } else if (
        module.id === 'net-14' &&
        activeStepIndex === 4 &&
        (normalizedCmd === 'ping 198.51.100.10 -s 1472 -d' ||
          normalizedCmd === 'ping 198.51.100.10 -s 1472' ||
          normalizedCmd === 'ping 198.51.100.10 -d')
      ) {
        isAlternateMatch = true;
      }

      if (isAlternateMatch) {
        setCompletedSteps((prev) => new Set([...prev, activeStepIndex]));
      } else {
        const stepIdx = module.steps.findIndex(
          (s) => s.cmd && norm(s.cmd) === normalizedCmd
        );
        if (stepIdx > -1) {
          setCompletedSteps((prev) => new Set([...prev, stepIdx]));
        }
      }
    }
  };

  const handleCodeClick = (cmd: string) => {
    setPrefillCmd(cmd);
  };

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
      className="flex flex-col h-screen w-full bg-[#0a0a0a] text-[#ececf0] text-[15px] leading-[1.6] overflow-hidden"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between p-[10px_16px] border-b border-[#26262b] bg-[#0a0a0a] shrink-0 z-20 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/networking#day-${module.dayNumber}`}
            className="flex items-center gap-1.5 text-[12px] font-mono text-[#9a9aa5] hover:text-[#4ade80] transition-colors px-2 py-0.5 rounded bg-[#141416] border border-[#26262b]"
          >
            <ArrowLeft size={13} />
            <span>Roadmap</span>
          </Link>
          <div className="h-4 w-[1px] bg-[#26262b]"></div>
          <b className="text-[14px] font-bold text-[#ececf0]">
            {module.title}
          </b>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[12px] font-mono text-[#9a9aa5]">
            <CheckCircle2
              size={14}
              className={
                completedSteps.size >= 5 ? 'text-[#4ade80]' : 'text-[#62626d]'
              }
            />
            <span>
              {completedSteps.size} / {module.steps.length} Completed
            </span>
          </div>

          <Link
            href={`/networking#day-${module.dayNumber}`}
            className="hidden sm:flex items-center gap-1 text-[12px] text-[#9a9aa5] hover:text-[#60a5fa] transition-colors"
          >
            <Map size={13} />
            <span>35 Days</span>
          </Link>
        </div>
      </header>

      {/* Main Workspace (Layout A: Top-left Canvas, Bottom-left Terminal, Right Sidebar) */}
      <main className="flex-1 min-h-0 p-[10px] grid gap-[10px] overflow-hidden md:grid-cols-[1fr_410px] md:grid-rows-[1fr_220px] max-md:flex max-md:flex-col max-md:overflow-y-auto">
        {/* Canvas Area (Top-Left or Fullscreen Overlay) */}
        <section
          id="canvas"
          className={
            isCanvasExpanded
              ? 'fixed inset-0 z-50 bg-[#07090e] p-2 flex flex-col'
              : 'md:[grid-area:1/1] min-h-0 min-w-0 max-md:h-[270px] max-md:shrink-0'
          }
        >
          <NetworkingCanvas
            dayId={module.id}
            activeStepIndex={activeStepIndex}
            completedSteps={completedSteps}
            lastCommand={lastCommand}
            isPinging={isPinging}
            pc3Ip={pc3Ip}
            pc4Ip={pc4Ip}
            gateway={gateway}
            r1Route={r1Route}
            r2Route={r2Route}
            r1DefaultRoute={r1DefaultRoute}
            r2DefaultRoute={r2DefaultRoute}
            isExpanded={isCanvasExpanded}
            onToggleExpand={() => setIsCanvasExpanded((prev) => !prev)}
          />
        </section>

        {/* Terminal Area (Bottom-Left) */}
        <div
          id="term-container"
          className="md:[grid-area:2/1] min-h-0 min-w-0 max-md:order-3 max-md:h-[240px] max-md:shrink-0"
        >
          <NetworkingTerminal
            dayId={module.id}
            expectedCmd={currentStep?.cmd || null}
            staticResponses={module.staticResponses}
            onCommandRun={handleCommandRun}
            completedSteps={completedSteps}
            activeStepIndex={activeStepIndex}
            pc3Ip={pc3Ip}
            pc4Ip={pc4Ip}
            setPc3Ip={setPc3Ip}
            setPc4Ip={setPc4Ip}
            prefillCmd={prefillCmd}
            onClearPrefill={() => setPrefillCmd(null)}
            gateway={gateway}
            setGateway={setGateway}
            r1Route={r1Route}
            setR1Route={setR1Route}
            r2Route={r2Route}
            setR2Route={setR2Route}
            r1DefaultRoute={r1DefaultRoute}
            setR1DefaultRoute={setR1DefaultRoute}
            r2DefaultRoute={r2DefaultRoute}
            setR2DefaultRoute={setR2DefaultRoute}
          />
        </div>

        {/* Lesson Sidebar Area (Right Full-Height) */}
        <aside
          id="lesson-container"
          className="md:[grid-area:1/2/3/2] min-h-0 min-w-0 max-md:order-2 max-md:min-h-[380px]"
        >
          <NetworkingLessonSidebar
            steps={module.steps}
            activeStepIndex={activeStepIndex}
            setActiveStepIndex={setActiveStepIndex}
            completedSteps={completedSteps}
            onCodeClick={handleCodeClick}
            dayNumber={module.dayNumber}
          />
        </aside>
      </main>
    </div>
  );
};
