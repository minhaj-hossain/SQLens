'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, HelpCircle, CornerDownLeft } from 'lucide-react';
import type { Day2StageState } from '../../../types/networking-day2';

export interface Day2GuidedTerminalProps {
  expectedCommand?: string;
  allowedTargets?: string[];
  freeTargets?: boolean;
  scenarioCommand?: string;
  stageState?: Day2StageState;
  suggestedChips?: string[];
  currentRungId?: string;
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
  onCommandRun,
  className = '',
}) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<TerminalEntry[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIndex, setCmdHistoryIndex] = useState<number>(-1);
  const [activeTooltip, setActiveTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new entries
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Handle ghost text calculation
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
              text: 'Lab: Type the suggested command, or press Tab to auto-complete. That is all you need on Day 2.',
            },
          ],
        },
      ]);
      setInputVal('');
      return;
    }

    // 3. ipconfig
    if (lower === 'ipconfig') {
      const isCableOut = !stageState?.cables.a;
      if (isCableOut) {
        setHistory((prev) => [
          ...prev,
          {
            id: `entry-${Date.now()}`,
            command: raw,
            lines: [
              { text: 'Windows IP Configuration' },
              { text: '' },
              { text: 'Ethernet adapter Ethernet0:' },
              { text: '   Media State . . . . . . . . . . . : Media disconnected' },
              { text: '   Connection-specific DNS Suffix  . : ' },
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
            { text: 'Windows IP Configuration' },
            { text: '' },
            { text: 'Ethernet adapter Ethernet0:' },
            { text: '   Connection-specific DNS Suffix  . : ' },
            { text: '   Link-local IPv6 Address . . . . . : fe80::a1b2:c3d4%12', isDimmed: true, tooltip: 'A later day explains IPv6' },
            { text: '   IPv4 Address. . . . . . . . . . . : 192.168.1.10' },
            {
              text: '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
              isGlowing: currentRungId === 'c2-r3',
              tooltip: 'Subnet mask: tells which numbers belong to the street',
            },
            {
              text: '   Default Gateway . . . . . . . . . : ',
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
      const entries = stageState?.arpTable ?? [
        { ip: '192.168.1.20', mac: '00-1a-2b-3c-4d-20', type: 'dynamic' },
      ];

      setHistory((prev) => [
        ...prev,
        {
          id: `entry-${Date.now()}`,
          command: raw,
          lines: [
            { text: 'Interface: 192.168.1.10 --- 0x2' },
            { text: '  Internet Address      Physical Address      Type' },
            ...entries.map((entry) => ({
              text: `  ${entry.ip.padEnd(22)}${entry.mac.padEnd(22)}${entry.type}`,
              isGlowing: true,
            })),
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

      // Ping to Computer B (192.168.1.20)
      if (target === '192.168.1.20') {
        if (!stageState?.cables.b) {
          // Port 2 unplugged
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

        // Port 2 healthy
        setHistory((prev) => [
          ...prev,
          {
            id: `entry-${Date.now()}`,
            command: raw,
            lines: [
              { text: 'Pinging 192.168.1.20 with 32 bytes of data:' },
              { text: 'Reply from 192.168.1.20: bytes=32 time=1ms TTL=128' },
              { text: 'Reply from 192.168.1.20: bytes=32 time=1ms TTL=128' },
              { text: 'Reply from 192.168.1.20: bytes=32 time=1ms TTL=128' },
              { text: 'Reply from 192.168.1.20: bytes=32 time=1ms TTL=128' },
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

      // Ping to Computer C (192.168.1.30)
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

        // Silent machine scenario on C4 Rung 2: Request timed out
        if (currentRungId === 'c4-r2') {
          setHistory((prev) => [
            ...prev,
            {
              id: `entry-${Date.now()}`,
              command: raw,
              lines: [
                { text: 'Pinging 192.168.1.30 with 32 bytes of data:' },
                { text: 'Request timed out.' },
                { text: 'Request timed out.' },
                { text: 'Request timed out.' },
                { text: 'Request timed out.' },
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

        // C is healthy
        setHistory((prev) => [
          ...prev,
          {
            id: `entry-${Date.now()}`,
            command: raw,
            lines: [
              { text: 'Pinging 192.168.1.30 with 32 bytes of data:' },
              { text: 'Reply from 192.168.1.30: bytes=32 time=1ms TTL=128' },
              { text: 'Reply from 192.168.1.30: bytes=32 time=1ms TTL=128' },
              { text: 'Reply from 192.168.1.30: bytes=32 time=1ms TTL=128' },
              { text: 'Reply from 192.168.1.30: bytes=32 time=1ms TTL=128' },
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
              { text: 'Reply from 192.168.1.10: Destination host unreachable.' },
              { text: 'Reply from 192.168.1.10: Destination host unreachable.' },
              { text: 'Reply from 192.168.1.10: Destination host unreachable.' },
              { text: 'Reply from 192.168.1.10: Destination host unreachable.' },
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
      executeCommand(inputVal || expectedCommand);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (expectedCommand) {
        setInputVal(expectedCommand);
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

  return (
    <div
      className={`relative flex flex-col h-full min-h-[300px] rounded-xl bg-[#0C101A] border border-zinc-800 font-mono text-sm text-zinc-100 shadow-xl overflow-hidden select-text ${className}`}
      data-testid="day2-guided-terminal"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#151C2C] border-b border-zinc-800 text-xs text-zinc-400 select-none">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>Computer A • Command Prompt</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
        </div>
      </div>

      {/* Suggested Chips Bar */}
      {suggestedChips && suggestedChips.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/60 border-b border-zinc-800/80 text-xs">
          <span className="text-zinc-500 font-sans text-[11px]">Suggested:</span>
          {suggestedChips.map((chip) => (
            <button
              key={chip}
              onClick={(e) => {
                e.stopPropagation();
                setInputVal(chip);
                executeCommand(chip);
              }}
              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-sky-300 border border-zinc-700 text-xs transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Terminal log output */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs sm:text-[13px] leading-relaxed">
        <div className="text-zinc-500 text-xs mb-2">
          Microsoft Windows [Version 10.0.19045.3803]<br />
          (c) Microsoft Corporation. All rights reserved.
        </div>

        {history.map((entry) => (
          <div key={entry.id} className="space-y-0.5">
            <div className="flex items-center gap-1 text-zinc-300">
              <span className="text-zinc-500">C:\Users\you&gt;</span>
              <span>{entry.command}</span>
            </div>
            {entry.lines.map((line, idx) => (
              <div
                key={idx}
                className={`${
                  line.isGlowing
                    ? 'text-sky-300 font-semibold'
                    : line.isDimmed
                    ? 'text-zinc-600'
                    : 'text-zinc-300'
                } flex items-center gap-1`}
              >
                <span>{line.text}</span>
                {line.tooltip && (
                  <span
                    className="cursor-help text-zinc-500 hover:text-zinc-300"
                    title={line.tooltip}
                  >
                    <HelpCircle className="w-3 h-3 inline" />
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}

        {/* Current active input line */}
        <div className="relative flex items-center text-zinc-200 mt-2">
          <span className="text-zinc-500 mr-2 shrink-0">C:\Users\you&gt;</span>
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent outline-none text-zinc-100 font-mono caret-emerald-400"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
            />
            {ghostText && (
              <span className="absolute left-0 top-0 pointer-events-none text-zinc-600 font-mono">
                {inputVal}
                <span className="text-zinc-500">{ghostText}</span>
              </span>
            )}
          </div>
          <button
            onClick={() => executeCommand(inputVal || expectedCommand)}
            className="ml-2 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs flex items-center gap-1 transition-colors"
            title="Execute command (Enter)"
          >
            <Play className="w-3 h-3" />
            <span className="hidden sm:inline">Enter</span>
          </button>
        </div>

        <div ref={logEndRef} />
      </div>
    </div>
  );
};
