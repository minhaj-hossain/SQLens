'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, HelpCircle, CornerDownLeft } from 'lucide-react';
import type { Day2StageState } from '../../../types/networking-day2';

export interface Day2GuidedTerminalProps {
  expectedCommand?: string;
  allowedTargets?: string[];
  freeTargets?: boolean;
  scenarioCommand?: string;
  stageState?: Day2StageState;
  suggestedChips?: string[];
  currentRungId?: string;
  isCBlocked?: boolean;
  onCommandRun?: (
    command: string,
    outcome: 'reply' | 'cannot-send' | 'unreachable' | 'timed-out' | 'arp' | 'ipconfig'
  ) => void;
  className?: string;
}

interface TerminalEntry {
  id: string;
  command: string;
  lines: {
    text: string;
    isDimmed?: boolean;
    isGlowing?: boolean;
    tooltip?: string;
  }[];
  isLabMessage?: boolean;
}

export const Day2GuidedTerminal: React.FC<Day2GuidedTerminalProps> = ({
  expectedCommand = 'ping 192.168.1.20',
  allowedTargets = ['192.168.1.20'],
  freeTargets = false,
  scenarioCommand,
  stageState,
  suggestedChips,
  currentRungId = 'c1-r4',
  isCBlocked = true,
  onCommandRun,
  className = '',
}) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<TerminalEntry[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIndex, setCmdHistoryIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-focus input on mount or rung change
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentRungId]);

  // Auto-scroll on new output
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Ghost text for Tab completion
  const ghostText = (() => {
    if (!expectedCommand) return '';
    if (!inputVal) return expectedCommand;
    if (expectedCommand.toLowerCase().startsWith(inputVal.toLowerCase())) {
      return expectedCommand.slice(inputVal.length);
    }
    return '';
  })();

  const executeCommand = (cmd: string) => {
    const raw = cmd.trim();
    if (!raw) return;

    setCmdHistory((prev) => [...prev, raw]);
    setCmdHistoryIndex(-1);

    const lower = raw.toLowerCase().replace(/\s+/g, ' ');

    // 1. cls / clear
    if (lower === 'cls' || lower === 'clear') {
      setHistory([]);
      setInputVal('');
      return;
    }

    // 2. help
    if (lower === 'help') {
      setHistory((prev) => [
        ...prev,
        {
          id: `entry-${Date.now()}`,
          command: raw,
          isLabMessage: true,
          lines: [
            {
              text: 'Lab: Type the suggested command, or press Tab. That is all you need on Day 2.',
            },
          ],
        },
      ]);
      setInputVal('');
      return;
    }

    // 3. ipconfig
    if (lower === 'ipconfig') {
      const isCableAOut = !stageState?.cables.a;
      if (isCableAOut) {
        setHistory((prev) => [
          ...prev,
          {
            id: `entry-${Date.now()}`,
            command: raw,
            lines: [
              { text: 'Windows IP Configuration', isDimmed: true },
              { text: '', isDimmed: true },
              { text: 'Ethernet adapter Ethernet:', isDimmed: true },
              { text: '   Media State . . . . . . . . . . . : Media disconnected', isGlowing: true },
              { text: '   Connection-specific DNS Suffix  . :', isDimmed: true },
            ],
          },
        ]);
        onCommandRun?.(raw, 'ipconfig');
        setInputVal('');
        return;
      }

      setHistory((prev) => [
        ...prev,
        {
          id: `entry-${Date.now()}`,
          command: raw,
          lines: [
            { text: 'Windows IP Configuration', isDimmed: true },
            { text: '', isDimmed: true },
            { text: 'Ethernet adapter Ethernet:', isDimmed: true },
            { text: '   Connection-specific DNS Suffix  . :', isDimmed: true, tooltip: 'A later day explains this' },
            { text: '   Link-local IPv6 Address . . . . . : fe80::a1b2:c3d4%12', isDimmed: true, tooltip: 'A later day explains IPv6' },
            { text: '   IPv4 Address. . . . . . . . . . . : 192.168.1.10', isGlowing: true },
            {
              text: '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
              isGlowing: currentRungId === 'c2-r3',
              tooltip: 'Subnet mask: tells which numbers belong to the street',
            },
            {
              text: '   Default Gateway . . . . . . . . . :',
              isDimmed: true,
              tooltip: 'A later day introduces the Default Gateway (router)',
            },
          ],
        },
      ]);
      onCommandRun?.(raw, 'ipconfig');
      setInputVal('');
      return;
    }

    // 4. arp -a
    if (lower === 'arp -a' || lower === 'arp') {
      const entries = stageState?.arpTable && stageState.arpTable.length > 0
        ? stageState.arpTable
        : [{ ip: '192.168.1.20', mac: '00-00-5e-00-53-02', type: 'dynamic' as const }];

      setHistory((prev) => [
        ...prev,
        {
          id: `entry-${Date.now()}`,
          command: raw,
          lines: [
            { text: 'Interface: 192.168.1.10 --- 0x2' },
            { text: '  Internet Address      Physical Address      Type' },
            ...entries.map((entry) => ({
              text: `  ${entry.ip.padEnd(22)}${entry.mac.toLowerCase().padEnd(22)}${entry.type}`,
              isGlowing: true,
            })),
            { text: '  224.0.0.22            01-00-5e-00-00-16     static', isDimmed: true, tooltip: 'Multicast system entry (dimmed)' },
            { text: '  224.0.0.251           01-00-5e-00-00-fb     static', isDimmed: true, tooltip: 'Multicast system entry (dimmed)' },
            { text: '  224.0.0.252           01-00-5e-00-00-fc     static', isDimmed: true, tooltip: 'Multicast system entry (dimmed)' },
            { text: '  239.255.255.250       01-00-5e-7f-ff-fa     static', isDimmed: true, tooltip: 'Multicast system entry (dimmed)' },
            { text: '  255.255.255.255       ff-ff-ff-ff-ff-ff     static', isDimmed: true, tooltip: 'Broadcast system entry (dimmed)' },
            { text: '' },
            { text: '  (Entries are learned automatically. This notebook forgets entries after a while).', isDimmed: true },
          ],
        },
      ]);
      onCommandRun?.(raw, 'arp');
      setInputVal('');
      return;
    }

    // 5. ping commands
    if (lower.startsWith('ping')) {
      const target = lower.replace(/^ping\s*/, '').trim();

      // Check if Port 1 (local computer A) is unplugged
      if (!stageState?.cables.a) {
        setHistory((prev) => [
          ...prev,
          {
            id: `entry-${Date.now()}`,
            command: raw,
            lines: [
              { text: `Pinging ${target} with 32 bytes of data:` },
              { text: 'PING: transmit failed. General failure.' },
              { text: 'PING: transmit failed. General failure.' },
              { text: 'PING: transmit failed. General failure.' },
              { text: 'PING: transmit failed. General failure.' },
              { text: '' },
              { text: `Ping statistics for ${target}:` },
              { text: '    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),' },
            ],
          },
        ]);
        onCommandRun?.(raw, 'cannot-send');
        setInputVal('');
        return;
      }

      // Ping to Friend's computer (192.168.1.20)
      if (target === '192.168.1.20') {
        if (!stageState?.cables.b) {
          setHistory((prev) => [
            ...prev,
            {
              id: `entry-${Date.now()}`,
              command: raw,
              lines: [
                { text: 'Pinging 192.168.1.20 with 32 bytes of data:' },
                { text: 'Reply from 192.168.1.10: Destination host unreachable.' },
                { text: 'Reply from 192.168.1.10: Destination host unreachable.' },
                { text: 'Reply from 192.168.1.10: Destination host unreachable.' },
                { text: 'Reply from 192.168.1.10: Destination host unreachable.' },
                { text: '' },
                { text: 'Ping statistics for 192.168.1.20:' },
                { text: '    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),' },
              ],
            },
          ]);
          onCommandRun?.(raw, 'unreachable');
          setInputVal('');
          return;
        }

        setHistory((prev) => [
          ...prev,
          {
            id: `entry-${Date.now()}`,
            command: raw,
            lines: [
              { text: 'Pinging 192.168.1.20 with 32 bytes of data:' },
              { text: 'Reply from 192.168.1.20: bytes=32 time=1ms TTL=128', isGlowing: true },
              { text: 'Reply from 192.168.1.20: bytes=32 time=1ms TTL=128', isGlowing: true },
              { text: 'Reply from 192.168.1.20: bytes=32 time=1ms TTL=128', isGlowing: true },
              { text: 'Reply from 192.168.1.20: bytes=32 time=1ms TTL=128', isGlowing: true },
              { text: '' },
              { text: 'Ping statistics for 192.168.1.20:' },
              { text: '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),' },
              { text: 'Approximate round trip times in milli-seconds:' },
              { text: '    Minimum = 1ms, Maximum = 1ms, Average = 1ms' },
            ],
          },
        ]);
        onCommandRun?.(raw, 'reply');
        setInputVal('');
        return;
      }

      // Ping to Third computer (192.168.1.30)
      if (target === '192.168.1.30') {
        const isCPortDown = !stageState?.cables.c;
        const tagC = stageState?.tags.c;
        const isCWrongSubnet =
          typeof tagC === 'object' && 'street' in tagC && tagC.street !== '192.168.1';

        if (isCPortDown || isCWrongSubnet) {
          setHistory((prev) => [
            ...prev,
            {
              id: `entry-${Date.now()}`,
              command: raw,
              lines: [
                { text: 'Pinging 192.168.1.30 with 32 bytes of data:' },
                { text: 'Reply from 192.168.1.10: Destination host unreachable.' },
                { text: 'Reply from 192.168.1.10: Destination host unreachable.' },
                { text: 'Reply from 192.168.1.10: Destination host unreachable.' },
                { text: 'Reply from 192.168.1.10: Destination host unreachable.' },
                { text: '' },
                { text: 'Ping statistics for 192.168.1.30:' },
                { text: '    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),' },
              ],
            },
          ]);
          onCommandRun?.(raw, 'unreachable');
          setInputVal('');
          return;
        }

        // Silent machine scenario (firewall blocking ping echo): Request timed out
        const shouldTimeOut = currentRungId === 'c4-r2' || (currentRungId === 'c4-r5' && isCBlocked !== false);
        if (shouldTimeOut) {
          setHistory((prev) => [
            ...prev,
            {
              id: `entry-${Date.now()}`,
              command: raw,
              lines: [
                { text: 'Pinging 192.168.1.30 with 32 bytes of data:' },
                { text: 'Request timed out.', isGlowing: true },
                { text: 'Request timed out.', isGlowing: true },
                { text: 'Request timed out.', isGlowing: true },
                { text: 'Request timed out.', isGlowing: true },
                { text: '' },
                { text: 'Ping statistics for 192.168.1.30:' },
                { text: '    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),' },
              ],
            },
          ]);
          onCommandRun?.(raw, 'timed-out');
          setInputVal('');
          return;
        }

        // Third computer is healthy and ping unblocked
        setHistory((prev) => [
          ...prev,
          {
            id: `entry-${Date.now()}`,
            command: raw,
            lines: [
              { text: 'Pinging 192.168.1.30 with 32 bytes of data:' },
              { text: 'Reply from 192.168.1.30: bytes=32 time=1ms TTL=128', isGlowing: true },
              { text: 'Reply from 192.168.1.30: bytes=32 time=1ms TTL=128', isGlowing: true },
              { text: 'Reply from 192.168.1.30: bytes=32 time=1ms TTL=128', isGlowing: true },
              { text: 'Reply from 192.168.1.30: bytes=32 time=1ms TTL=128', isGlowing: true },
              { text: '' },
              { text: 'Ping statistics for 192.168.1.30:' },
              { text: '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),' },
              { text: 'Approximate round trip times in milli-seconds:' },
              { text: '    Minimum = 1ms, Maximum = 1ms, Average = 1ms' },
            ],
          },
        ]);
        onCommandRun?.(raw, 'reply');
        setInputVal('');
        return;
      }

      // Ping to .99 (silent machine / unreachable)
      if (target === '192.168.1.99') {
        setHistory((prev) => [
          ...prev,
          {
            id: `entry-${Date.now()}`,
            command: raw,
            lines: [
              { text: 'Pinging 192.168.1.99 with 32 bytes of data:' },
              { text: 'Reply from 192.168.1.10: Destination host unreachable.', isGlowing: true },
              { text: 'Reply from 192.168.1.10: Destination host unreachable.', isGlowing: true },
              { text: 'Reply from 192.168.1.10: Destination host unreachable.', isGlowing: true },
              { text: 'Reply from 192.168.1.10: Destination host unreachable.', isGlowing: true },
              { text: '' },
              { text: 'Ping statistics for 192.168.1.99:' },
              { text: '    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),' },
            ],
          },
        ]);
        onCommandRun?.(raw, 'unreachable');
        setInputVal('');
        return;
      }

      // Fallback ping
      setHistory((prev) => [
        ...prev,
        {
          id: `entry-${Date.now()}`,
          command: raw,
          lines: [
            { text: `Pinging ${target} with 32 bytes of data:` },
            { text: 'Reply from 192.168.1.10: Destination host unreachable.' },
          ],
        },
      ]);
      onCommandRun?.(raw, 'unreachable');
      setInputVal('');
      return;
    }

    // Unrecognized command
    setHistory((prev) => [
      ...prev,
      {
        id: `entry-${Date.now()}`,
        command: raw,
        lines: [
          {
            text: `'${raw}' is not recognized as an internal or external command, operable program or batch file.`,
          },
        ],
      },
    ]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmdToRun = inputVal.trim() || (ghostText ? expectedCommand : '');
      if (cmdToRun) {
        executeCommand(cmdToRun);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (expectedCommand) {
        setInputVal(expectedCommand);
        inputRef.current?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextIdx = cmdHistoryIndex === -1 ? cmdHistory.length - 1 : Math.max(0, cmdHistoryIndex - 1);
        setCmdHistoryIndex(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cmdHistoryIndex !== -1) {
        const nextIdx = cmdHistoryIndex + 1;
        if (nextIdx < cmdHistory.length) {
          setCmdHistoryIndex(nextIdx);
          setInputVal(cmdHistory[nextIdx]);
        } else {
          setCmdHistoryIndex(-1);
          setInputVal('');
        }
      }
    }
  };

  const chips = (suggestedChips && suggestedChips.length > 0)
    ? suggestedChips
    : (expectedCommand ? [expectedCommand] : []);

  return (
    <div
      className={`rounded-2xl bg-[#09090b] border border-white/[0.08] overflow-hidden font-mono text-xs sm:text-[13px] shadow-2xl select-text cursor-text ${className}`}
      data-testid="day2-guided-terminal"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#121214] border-b border-white/[0.06] text-zinc-400 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80" />
          </div>
          <div className="flex items-center gap-2 pl-1">
            <TerminalIcon className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-zinc-200">Terminal (Computer A)</span>
          </div>
        </div>
        <span className="text-[11px] text-zinc-500 font-mono">C:\Users\you&gt;</span>
      </div>

      {/* Terminal Output Log Area */}
      <div
        className="flex-1 p-4 overflow-y-auto max-h-[220px] sm:max-h-[260px] space-y-3 cursor-text"
        role="log"
        aria-live="polite"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((entry) => (
          <div key={entry.id} className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="text-zinc-500">C:\Users\you&gt;</span>
              <span className="font-semibold text-zinc-100">{entry.command}</span>
            </div>

            <div
              className={
                entry.isLabMessage
                  ? 'pl-3 border-l-2 border-white/60 text-zinc-200 bg-white/[0.04] py-1.5 rounded-r'
                  : 'space-y-0.5'
              }
            >
              {entry.lines.map((l, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed transition-colors ${
                    l.isGlowing
                      ? 'text-emerald-300 font-semibold underline decoration-emerald-500/50 underline-offset-2'
                      : l.isDimmed
                      ? 'text-zinc-500 opacity-60'
                      : 'text-zinc-300'
                  } ${l.tooltip ? 'cursor-help border-b border-dotted border-zinc-600 inline-block' : ''}`}
                  title={l.tooltip}
                >
                  {l.text}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {/* Input Row with Ghost Text & Chips */}
      <div className="p-3 bg-[#121214] border-t border-white/[0.06] space-y-2">
        <div
          className="relative flex items-center px-3.5 py-2 rounded-xl bg-[#09090b] border border-white/[0.08] focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/10"
          onClick={() => inputRef.current?.focus()}
        >
          <span className="text-zinc-500 select-none mr-2">C:\Users\you&gt;</span>

          <div className="relative flex-1 flex items-center font-mono">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent outline-none text-zinc-100 font-mono text-xs sm:text-[13px] z-10"
              spellCheck={false}
              autoComplete="off"
              aria-label="Terminal command"
            />

            {ghostText && (
              <span className="absolute left-0 pointer-events-none text-zinc-500 font-mono opacity-60">
                <span className="invisible">{inputVal}</span>
                <span>{ghostText}</span>
              </span>
            )}
          </div>

          {/* Quick Run / Enter button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const cmdToRun = inputVal.trim() || (ghostText ? expectedCommand : '');
              if (cmdToRun) {
                setInputVal(cmdToRun);
                executeCommand(cmdToRun);
              }
              inputRef.current?.focus();
            }}
            className="ml-2 px-2.5 py-1 rounded-lg bg-[#1c1c1f] hover:bg-[#25252a] text-zinc-200 text-xs font-mono font-medium flex items-center gap-1 cursor-pointer transition-colors shrink-0 border border-white/10 active:scale-[0.98]"
            title="Execute command"
          >
            <span>Run</span>
            <CornerDownLeft className="w-3 h-3 text-zinc-400" />
          </button>
        </div>

        {/* Suggested Command Chips */}
        {chips.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] text-zinc-500 select-none uppercase font-semibold tracking-wider">Quick:</span>
            {chips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setInputVal(chip);
                  executeCommand(chip);
                  inputRef.current?.focus();
                }}
                className="px-2.5 py-1 rounded-lg bg-[#18181b] hover:bg-[#222226] text-zinc-300 hover:text-white border border-white/10 text-xs font-mono transition-colors cursor-pointer active:scale-[0.98] shadow-sm"
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
