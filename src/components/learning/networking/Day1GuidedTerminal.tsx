'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, HelpCircle, CornerDownLeft } from 'lucide-react';
import type { StageState } from '../../../types/networking-day1';

export interface Day1GuidedTerminalProps {
  expectedCommand?: string;
  allowedTargets?: string[];
  freeTargets?: boolean;
  scenarioCommand?: string;
  stageState?: StageState;
  suggestedChips?: string[];
  currentRungId?: string;
  onCommandRun?: (command: string, outcome: 'reply' | 'cannot-send' | 'unreachable' | 'busy' | 'ipconfig') => void;
  onStageHighlight?: (targetId: string | null) => void;
  className?: string;
}

interface TerminalEntry {
  id: string;
  command: string;
  lines: { text: string; isDimmed?: boolean; isGlowing?: boolean; tagLink?: string; tooltip?: string }[];
  isLabMessage?: boolean;
}

export const Day1GuidedTerminal: React.FC<Day1GuidedTerminalProps> = ({
  expectedCommand = 'ping 192.168.1.20',
  allowedTargets = ['192.168.1.20'],
  freeTargets = false,
  scenarioCommand,
  stageState,
  suggestedChips,
  currentRungId = 'c1-r2',
  onCommandRun,
  onStageHighlight,
  className = '',
}) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<TerminalEntry[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIndex, setCmdHistoryIndex] = useState<number>(-1);
  const [activeTooltip, setActiveTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

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
              text: 'Lab: Type the grey command, or press Tab. That is all you need on Day 1.',
            },
          ],
        },
      ]);
      setInputVal('');
      return;
    }

    // 3. ipconfig
    if (lower === 'ipconfig') {
      const isCableOut = stageState?.cable === 'absent' || stageState?.cable === 'loose-on-desk' || stageState?.cable === 'one-end-yours';
      const hasNoAddress = stageState?.tags?.yours === 'not-set';

      let lines: TerminalEntry['lines'] = [];

      if (isCableOut) {
        lines = [
          { text: 'Windows IP Configuration', isDimmed: true },
          { text: '', isDimmed: true },
          { text: 'Ethernet adapter Ethernet:', isDimmed: true },
          { text: '', isDimmed: true },
          {
            text: '   Media State . . . . . . . . . . . : Media disconnected',
            isGlowing: true,
            tagLink: 'light-yours',
          },
          { text: '   Connection-specific DNS Suffix  . :', isDimmed: true, tooltip: 'A later day explains this. You can ignore it for now.' },
        ];
      } else if (hasNoAddress) {
        lines = [
          { text: 'Windows IP Configuration', isDimmed: true },
          { text: '', isDimmed: true },
          { text: 'Ethernet adapter Ethernet:', isDimmed: true },
          { text: '', isDimmed: true },
          {
            text: '   IPv4 Address. . . . . . . . . . . : not set',
            isGlowing: true,
            tagLink: 'tag-yours',
          },
          {
            text: '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
            isDimmed: true,
            tooltip: 'A later day explains this. You can ignore it for now.',
          },
        ];
      } else {
        lines = [
          { text: 'Windows IP Configuration', isDimmed: true },
          { text: '', isDimmed: true },
          { text: 'Ethernet adapter Ethernet:', isDimmed: true },
          { text: '', isDimmed: true },
          { text: '   Connection-specific DNS Suffix  . :', isDimmed: true, tooltip: 'A later day explains this. You can ignore it for now.' },
          { text: '   Link-local IPv6 Address . . . . . : fe80::1a2b:3c4d:5e6f:7a8b%12', isDimmed: true, tooltip: 'A later day explains this. You can ignore it for now.' },
          {
            text: '   IPv4 Address. . . . . . . . . . . : 192.168.1.10',
            isGlowing: true,
            tagLink: 'tag-yours',
          },
          {
            text: '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
            isDimmed: true,
            tooltip: 'A later day explains this. You can ignore it for now.',
          },
          {
            text: '   Default Gateway . . . . . . . . . :',
            isDimmed: true,
            tooltip: 'A later day explains this. You can ignore it for now.',
          },
        ];
      }

      setHistory((prev) => [
        ...prev,
        {
          id: `entry-${Date.now()}`,
          command: raw,
          lines,
        },
      ]);
      setInputVal('');
      onCommandRun?.(raw, 'ipconfig');
      return;
    }

    // 4. ipconfig /all
    if (lower === 'ipconfig /all') {
      setHistory((prev) => [
        ...prev,
        {
          id: `entry-${Date.now()}`,
          command: raw,
          isLabMessage: true,
          lines: [{ text: 'Lab: This lab shows the short version. Try: ipconfig' }],
        },
      ]);
      setInputVal('');
      return;
    }

    // 5. ping with no target
    if (lower === 'ping') {
      setHistory((prev) => [
        ...prev,
        {
          id: `entry-${Date.now()}`,
          command: raw,
          isLabMessage: true,
          lines: [{ text: `Lab: Ping needs an address after it. Try: ${expectedCommand}` }],
        },
      ]);
      setInputVal('');
      return;
    }

    // 6. ping <target>
    if (lower.startsWith('ping ')) {
      const target = lower.slice(5).trim();

      // Check leading zeros
      if (/192\.168\.0+\d/.test(target)) {
        setHistory((prev) => [
          ...prev,
          {
            id: `entry-${Date.now()}`,
            command: raw,
            isLabMessage: true,
            lines: [{ text: 'Lab: Close. Write it without the extra zeros.' }],
          },
        ]);
        setInputVal('');
        return;
      }

      // Check taught target vs unintended typo
      const isAllowed = freeTargets || allowedTargets.includes(target);
      if (!isAllowed) {
        setHistory((prev) => [
          ...prev,
          {
            id: `entry-${Date.now()}`,
            command: raw,
            isLabMessage: true,
            lines: [{ text: `Lab: Close. Try: ${expectedCommand}` }],
          },
        ]);
        setInputVal('');
        return;
      }

      // Check physical link and logical states
      const isCableOut = stageState?.cable !== 'both';
      const hasNoAddress = stageState?.tags?.yours === 'not-set';
      const isWrongStreet = target.startsWith('192.168.2.') && stageState?.tags?.yours && typeof stageState.tags.yours === 'object' && stageState.tags.yours.street === '192.168.1';
      const isBusy = stageState?.traffic === 'file-transfer';
      const isUnreachable = target === '192.168.1.99';

      let lines: TerminalEntry['lines'] = [];
      let outcome: 'reply' | 'cannot-send' | 'unreachable' | 'busy' = 'reply';

      if (isCableOut || hasNoAddress || isWrongStreet) {
        outcome = 'cannot-send';
        lines = [
          { text: `Pinging ${target} with 32 bytes of data:`, isDimmed: true },
          { text: 'PING: transmit failed. General failure.', isGlowing: true, tagLink: 'msg-stopped' },
          { text: 'PING: transmit failed. General failure.', isGlowing: true, tagLink: 'msg-stopped' },
          { text: 'PING: transmit failed. General failure.', isGlowing: true, tagLink: 'msg-stopped' },
          { text: 'PING: transmit failed. General failure.', isGlowing: true, tagLink: 'msg-stopped' },
          { text: '', isDimmed: true },
          { text: `Ping statistics for ${target}:`, isDimmed: true, tooltip: 'A later day explains this. You can ignore it for now.' },
          { text: '    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),', isDimmed: true, tooltip: 'A later day explains this. You can ignore it for now.' },
        ];
      } else if (isUnreachable) {
        outcome = 'unreachable';
        lines = [
          { text: `Pinging ${target} with 32 bytes of data:`, isDimmed: true },
          { text: 'Reply from 192.168.1.10: Destination host unreachable.', isGlowing: true, tagLink: 'tag-yours' },
          { text: 'Reply from 192.168.1.10: Destination host unreachable.', isGlowing: true, tagLink: 'tag-yours' },
          { text: 'Reply from 192.168.1.10: Destination host unreachable.', isGlowing: true, tagLink: 'tag-yours' },
          { text: 'Reply from 192.168.1.10: Destination host unreachable.', isGlowing: true, tagLink: 'tag-yours' },
          { text: '', isDimmed: true },
          { text: `Ping statistics for ${target}:`, isDimmed: true, tooltip: 'A later day explains this. You can ignore it for now.' },
          { text: '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),', isDimmed: true, tooltip: 'A later day explains this. You can ignore it for now.' },
        ];
      } else if (isBusy) {
        outcome = 'busy';
        lines = [
          { text: `Pinging ${target} with 32 bytes of data:`, isDimmed: true },
          { text: `Reply from ${target}: bytes=32 time=38ms TTL=128`, isGlowing: true, tagLink: 'msg-roundtrip' },
          { text: `Reply from ${target}: bytes=32 time=52ms TTL=128`, isGlowing: true, tagLink: 'msg-roundtrip' },
          { text: `Reply from ${target}: bytes=32 time=45ms TTL=128`, isGlowing: true, tagLink: 'msg-roundtrip' },
          { text: `Reply from ${target}: bytes=32 time=41ms TTL=128`, isGlowing: true, tagLink: 'msg-roundtrip' },
          { text: '', isDimmed: true },
          { text: `Ping statistics for ${target}:`, isDimmed: true, tooltip: 'A later day explains this. You can ignore it for now.' },
          { text: '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),', isDimmed: true, tooltip: 'A later day explains this. You can ignore it for now.' },
          { text: 'Approximate round trip times in milli-seconds:', isDimmed: true, tooltip: 'A later day explains this. You can ignore it for now.' },
          { text: '    Minimum = 38ms, Maximum = 52ms, Average = 44ms', isDimmed: true, tooltip: 'A later day explains this. You can ignore it for now.' },
        ];
      } else {
        outcome = 'reply';
        lines = [
          { text: `Pinging ${target} with 32 bytes of data:`, isDimmed: true },
          { text: `Reply from ${target}: bytes=32 time=1ms TTL=128`, isGlowing: true, tagLink: 'msg-roundtrip' },
          { text: `Reply from ${target}: bytes=32 time=1ms TTL=128`, isGlowing: true, tagLink: 'msg-roundtrip' },
          { text: `Reply from ${target}: bytes=32 time=2ms TTL=128`, isGlowing: true, tagLink: 'msg-roundtrip' },
          { text: `Reply from ${target}: bytes=32 time=1ms TTL=128`, isGlowing: true, tagLink: 'msg-roundtrip' },
          { text: '', isDimmed: true },
          { text: `Ping statistics for ${target}:`, isDimmed: true, tooltip: 'A later day explains this. You can ignore it for now.' },
          { text: '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),', isDimmed: true, tooltip: 'A later day explains this. You can ignore it for now.' },
          { text: 'Approximate round trip times in milli-seconds:', isDimmed: true, tooltip: 'A later day explains this. You can ignore it for now.' },
          { text: '    Minimum = 1ms, Maximum = 2ms, Average = 1ms', isDimmed: true, tooltip: 'A later day explains this. You can ignore it for now.' },
        ];
      }

      setHistory((prev) => [
        ...prev,
        {
          id: `entry-${Date.now()}`,
          command: raw,
          lines,
        },
      ]);
      setInputVal('');
      onCommandRun?.(raw, outcome);
      return;
    }

    // 7. Unknown command
    setHistory((prev) => [
      ...prev,
      {
        id: `entry-${Date.now()}`,
        command: raw,
        isLabMessage: true,
        lines: [
          {
            text: `Lab: That command isn't part of this lab yet. Try: ${expectedCommand}`,
          },
        ],
      },
    ]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (ghostText) {
        setInputVal(expectedCommand);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(inputVal || ghostText ? (inputVal ? inputVal : expectedCommand) : '');
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

  const chips = suggestedChips || (expectedCommand ? [expectedCommand] : []);

  return (
    <div
      className={`relative flex flex-col rounded-xl bg-zinc-950 border border-zinc-800 shadow-xl overflow-hidden font-mono text-xs sm:text-[13px] ${className}`}
      data-testid="day1-guided-terminal"
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-zinc-900 border-b border-zinc-800 text-zinc-400 select-none">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-semibold text-zinc-300">Terminal</span>
        </div>
        <span className="text-[11px] text-zinc-500">C:\Users\you&gt;</span>
      </div>

      {/* Terminal Output Log Area (Max 14 lines before scroll) */}
      <div
        className="flex-1 p-3.5 overflow-y-auto max-h-[300px] space-y-3"
        role="log"
        aria-live="polite"
      >
        {history.map((entry) => (
          <div key={entry.id} className="space-y-1">
            {/* Command typed */}
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="text-zinc-500">C:\Users\you&gt;</span>
              <span className="font-semibold text-zinc-100">{entry.command}</span>
            </div>

            {/* Output block */}
            <div
              className={
                entry.isLabMessage
                  ? 'pl-3 border-l-2 border-blue-500 text-blue-300 bg-blue-950/20 py-1 rounded-r'
                  : 'space-y-0.5'
              }
            >
              {entry.lines.map((l, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => {
                    if (l.tagLink) onStageHighlight?.(l.tagLink);
                  }}
                  onMouseLeave={() => {
                    if (l.tagLink) onStageHighlight?.(null);
                  }}
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

      {/* Input Row with Ghost Text */}
      <div className="p-2.5 bg-zinc-900/60 border-t border-zinc-800/80 space-y-2">
        <div
          className="relative flex items-center px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700/80 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
          onClick={() => inputRef.current?.focus()}
        >
          <span className="text-zinc-500 select-none mr-2">C:\Users\you&gt;</span>

          <div className="relative flex-1 flex items-center font-mono">
            {/* Real Input */}
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

            {/* Ghost Autocomplete Overlay */}
            {ghostText && (
              <span className="absolute left-0 pointer-events-none text-zinc-500 font-mono opacity-60">
                <span className="invisible">{inputVal}</span>
                <span>{ghostText}</span>
              </span>
            )}
          </div>

          {/* Quick Tab Prompt */}
          {ghostText && (
            <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 border border-zinc-700 select-none">
              Tab ⇥
            </span>
          )}
        </div>

        {/* Suggestion Chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-zinc-500 select-none">Try:</span>
            {chips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setInputVal(chip);
                  inputRef.current?.focus();
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-300 hover:text-white font-mono transition-colors cursor-pointer"
              >
                <span>{chip}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
