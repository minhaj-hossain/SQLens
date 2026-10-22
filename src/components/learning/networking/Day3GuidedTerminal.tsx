'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, CornerDownLeft } from 'lucide-react';
import type { Day3StageState } from '../../../types/networking-day3';

export interface Day3GuidedTerminalProps {
  expectedCommand?: string;
  stageState?: Day3StageState;
  suggestedChips?: string[];
  currentRungId?: string;
  onCommandRun?: (
    command: string,
    outcome: 'reply' | 'cannot-send' | 'unreachable' | 'timed-out' | 'arp' | 'tracert' | 'route'
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
}

export const Day3GuidedTerminal: React.FC<Day3GuidedTerminalProps> = ({
  expectedCommand = 'ping 192.168.2.20',
  stageState,
  suggestedChips,
  currentRungId = 'c1-r2',
  onCommandRun,
  className = '',
}) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<TerminalEntry[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIndex, setCmdHistoryIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-focus input on rung change
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

  const executeCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    setCmdHistory((prev) => [...prev, cmd]);
    setCmdHistoryIndex(-1);

    const lower = cmd.toLowerCase();
    const entryId = Math.random().toString(36).substring(7);
    const newLines: { text: string; isDimmed?: boolean; isGlowing?: boolean; tooltip?: string }[] = [];
    let outcome: 'reply' | 'cannot-send' | 'unreachable' | 'timed-out' | 'arp' | 'tracert' | 'route' = 'unreachable';

    // 1. PING COMMAND
    if (lower.startsWith('ping')) {
      if (lower.includes('192.168.1.1')) {
        // Pinging the Gateway Doorway
        if (stageState?.cables.hostA && stageState?.cables.routerEth0 && stageState?.gateways.a === '192.168.1.1') {
          newLines.push({ text: 'Pinging 192.168.1.1 with 32 bytes of data:' });
          newLines.push({ text: 'Reply from 192.168.1.1: bytes=32 time<1ms TTL=64', isGlowing: true });
          newLines.push({ text: 'Reply from 192.168.1.1: bytes=32 time<1ms TTL=64', isGlowing: true });
          newLines.push({ text: 'Ping statistics for 192.168.1.1: Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)' });
          outcome = 'reply';
        } else {
          newLines.push({ text: 'Pinging 192.168.1.1 with 32 bytes of data:' });
          newLines.push({ text: 'Destination host unreachable.', isDimmed: true });
          outcome = 'unreachable';
        }
      } else if (lower.includes('192.168.2.20')) {
        // Pinging Computer B on Orange Street
        const gateway = stageState?.gateways.a;
        const port2Connected = stageState?.cables.routerEth1;

        if (!gateway) {
          // No Gateway set
          newLines.push({ text: 'Pinging 192.168.2.20 with 32 bytes of data:' });
          newLines.push({ text: 'Destination host unreachable.', isDimmed: true });
          newLines.push({ text: '[Reason: Destination 192.168.2.20 is on a different street, but no Default Gateway is configured.]', isDimmed: true });
          outcome = 'unreachable';
        } else if (gateway === '192.168.2.1') {
          // Wrong Subnet Gateway
          newLines.push({ text: 'Pinging 192.168.2.20 with 32 bytes of data:' });
          newLines.push({ text: 'Destination host unreachable.', isDimmed: true });
          newLines.push({ text: '[Reason: Default Gateway 192.168.2.1 is not on local street 192.168.1. Host cannot reach it.]', isDimmed: true });
          outcome = 'unreachable';
        } else if (gateway === '192.168.1.1' && !port2Connected) {
          // Far-side link disconnected
          newLines.push({ text: 'Pinging 192.168.2.20 with 32 bytes of data:' });
          newLines.push({ text: 'Request timed out.', isDimmed: true });
          newLines.push({ text: 'Request timed out.', isDimmed: true });
          newLines.push({ text: '[Reason: Packet reached Gateway 192.168.1.1, but Router Port 2 cable is unplugged.]', isDimmed: true });
          outcome = 'timed-out';
        } else if (gateway === '192.168.1.1' && port2Connected) {
          // Full success across router
          newLines.push({ text: 'Pinging 192.168.2.20 with 32 bytes of data:' });
          newLines.push({ text: 'Reply from 192.168.2.20: bytes=32 time=2ms TTL=127', isGlowing: true });
          newLines.push({ text: 'Reply from 192.168.2.20: bytes=32 time=2ms TTL=127', isGlowing: true });
          newLines.push({ text: 'Ping statistics for 192.168.2.20: Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)' });
          outcome = 'reply';
        } else {
          newLines.push({ text: 'Pinging 192.168.2.20 with 32 bytes of data:' });
          newLines.push({ text: 'Destination host unreachable.', isDimmed: true });
          outcome = 'unreachable';
        }
      } else {
        newLines.push({ text: `Pinging ${cmd.split(' ')[1] || 'target'}:` });
        newLines.push({ text: 'Destination host unreachable.', isDimmed: true });
        outcome = 'unreachable';
      }
    }

    // 2. ARP COMMAND
    else if (lower.startsWith('arp')) {
      outcome = 'arp';
      if (stageState?.hostArpTable && stageState.hostArpTable.length > 0) {
        newLines.push({ text: 'Interface: 192.168.1.10 --- 0x2' });
        newLines.push({ text: '  Internet Address      Physical Address      Type' });
        stageState.hostArpTable.forEach((item) => {
          newLines.push({ text: `  ${item.ip.padEnd(20)}  ${item.mac}     ${item.type}`, isGlowing: true });
        });
      } else {
        newLines.push({ text: 'No ARP Entries Found.', isDimmed: true });
      }
    }

    // 3. TRACERT / TRACEROUTE COMMAND
    else if (lower.startsWith('tracert') || lower.startsWith('traceroute')) {
      outcome = 'tracert';
      newLines.push({ text: 'Tracing route to 192.168.2.20 over a maximum of 30 hops:' });
      newLines.push({ text: '  1    <1 ms    192.168.1.1    [Hop 1: Your Local Gateway Doorway]', isGlowing: true });
      newLines.push({ text: '  2     2 ms    192.168.2.20   [Hop 2: Friend’s Computer on Orange Street]', isGlowing: true });
      newLines.push({ text: 'Trace complete. 2 hops total.' });
    }

    // 4. ROUTE PRINT COMMAND
    else if (lower.startsWith('route')) {
      outcome = 'route';
      newLines.push({ text: 'IPv4 Route Table' });
      newLines.push({ text: 'Active Routes:' });
      newLines.push({ text: 'Network Destination        Netmask          Gateway       Interface  Metric' });
      newLines.push({ text: '          0.0.0.0          0.0.0.0      192.168.1.1    192.168.1.10      25', isGlowing: true });
      newLines.push({ text: '      192.168.1.0    255.255.255.0         On-link     192.168.1.10     281' });
    }

    // 5. UNRECOGNIZED COMMAND
    else {
      newLines.push({ text: `'${cmd}' is not recognized as an internal or external command.`, isDimmed: true });
      newLines.push({ text: 'Type ping 192.168.2.20, ping 192.168.1.1, arp -a, or tracert 192.168.2.20.', isDimmed: true });
    }

    setHistory((prev) => [...prev, { id: entryId, command: cmd, lines: newLines }]);
    setInputVal('');
    onCommandRun?.(cmd, outcome);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (ghostText) {
        setInputVal((prev) => prev + ghostText);
      }
    } else if (e.key === 'Enter') {
      executeCommand(inputVal || ghostText);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = cmdHistoryIndex === -1 ? cmdHistory.length - 1 : Math.max(0, cmdHistoryIndex - 1);
      setCmdHistoryIndex(nextIdx);
      setInputVal(cmdHistory[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cmdHistoryIndex === -1) return;
      const nextIdx = cmdHistoryIndex + 1;
      if (nextIdx >= cmdHistory.length) {
        setCmdHistoryIndex(-1);
        setInputVal('');
      } else {
        setCmdHistoryIndex(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      }
    }
  };

  return (
    <div className={`rounded-2xl bg-[#09090b] border border-white/10 shadow-2xl overflow-hidden flex flex-col font-mono text-xs ${className}`}>
      {/* Terminal Title Bar */}
      <div className="px-4 py-2 bg-[#121216] border-b border-white/[0.06] flex items-center justify-between text-zinc-400">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-semibold text-zinc-200">Terminal: Computer A (192.168.1.10)</span>
        </div>
        <span className="text-[10px] text-zinc-500">Press Tab to auto-complete</span>
      </div>

      {/* Suggested Command Chips */}
      {suggestedChips && suggestedChips.length > 0 && (
        <div className="px-3 py-1.5 bg-[#0f0f13] border-b border-white/[0.04] flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] text-zinc-500 uppercase font-semibold">Chips:</span>
          {suggestedChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setInputVal(chip);
                executeCommand(chip);
              }}
              className="px-2.5 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-mono border border-white/10 transition-colors cursor-pointer shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Output Console Log */}
      <div className="p-3.5 space-y-2.5 max-h-[160px] sm:max-h-[200px] overflow-y-auto leading-relaxed text-zinc-300">
        {history.length === 0 && (
          <div className="text-zinc-600 text-[11px] italic">
            Ready. Type a command or click a chip above.
          </div>
        )}

        {history.map((entry) => (
          <div key={entry.id} className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-200 font-semibold">
              <span className="text-blue-400">&gt;</span>
              <span>{entry.command}</span>
            </div>
            {entry.lines.map((line, idx) => (
              <div
                key={idx}
                className={`pl-3.5 ${
                  line.isGlowing
                    ? 'text-emerald-400 font-semibold'
                    : line.isDimmed
                    ? 'text-zinc-500'
                    : 'text-zinc-300'
                }`}
              >
                {line.text}
              </div>
            ))}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {/* Active Command Line Input */}
      <div className="px-3 py-2 bg-[#101014] border-t border-white/[0.06] flex items-center gap-2 relative">
        <span className="text-blue-400 font-bold">&gt;</span>

        <div className="relative flex-1 flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={ghostText ? '' : 'Type command here...'}
            className="w-full bg-transparent text-zinc-100 font-mono text-xs outline-none relative z-10"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />

          {/* Ghost Suggestion Text */}
          {ghostText && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none text-xs font-mono select-none">
              <span className="opacity-0">{inputVal}</span>
              <span>{ghostText}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => executeCommand(inputVal || ghostText)}
          className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title="Execute command (Enter)"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
