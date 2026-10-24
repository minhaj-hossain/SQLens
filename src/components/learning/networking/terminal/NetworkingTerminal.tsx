'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Terminal, CornerDownLeft, Sparkles } from 'lucide-react';

interface NetworkingTerminalProps {
  dayId: string;
  expectedCmd: string | null;
  staticResponses: Record<string, string>;
  onCommandRun: (cmd: string, output: string) => void;
  completedSteps: Set<number>;
  activeStepIndex: number;
  pc3Ip: string;
  pc4Ip: string;
  setPc3Ip: (ip: string) => void;
  setPc4Ip: (ip: string) => void;
  prefillCmd?: string | null;
  onClearPrefill?: () => void;
  gateway?: string;
  setGateway?: (gw: string) => void;
  r1Route?: boolean;
  setR1Route?: (val: boolean) => void;
  r2Route?: boolean;
  setR2Route?: (val: boolean) => void;
  r1DefaultRoute?: boolean;
  setR1DefaultRoute?: (val: boolean) => void;
  r2DefaultRoute?: boolean;
  setR2DefaultRoute?: (val: boolean) => void;
}

interface LogEntry {
  type: 'input' | 'output';
  text: string;
  isSuccess?: boolean;
}

export const NetworkingTerminal: React.FC<NetworkingTerminalProps> = ({
  dayId,
  expectedCmd,
  staticResponses,
  onCommandRun,
  completedSteps,
  activeStepIndex,
  pc3Ip,
  pc4Ip,
  setPc3Ip,
  setPc4Ip,
  prefillCmd,
  onClearPrefill,
  gateway = '192.168.1.1',
  setGateway,
  r1Route = false,
  setR1Route,
  r2Route = false,
  setR2Route,
  r1DefaultRoute = false,
  setR1DefaultRoute,
  r2DefaultRoute = false,
  setR2DefaultRoute,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      type: 'output',
      text: 'Welcome to PC1. Read the lesson on the right, then try the command.',
      isSuccess: true,
    },
  ]);

  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle prefill from clicking <code> snippets in lesson
  useEffect(() => {
    if (prefillCmd) {
      setInputVal(prefillCmd);
      if (inputRef.current) {
        inputRef.current.focus();
      }
      onClearPrefill?.();
    }
  }, [prefillCmd, onClearPrefill]);

  // Auto-scroll to bottom on new output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [logs]);

  // Ghost autocomplete suggestion
  const ghostText =
    expectedCmd &&
    inputVal &&
    expectedCmd.toLowerCase().startsWith(inputVal.toLowerCase()) &&
    expectedCmd.toLowerCase() !== inputVal.toLowerCase()
      ? expectedCmd.slice(inputVal.length)
      : '';

  const runCommand = (raw: string) => {
    const v = raw.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!v) return;

    const newLogs: LogEntry[] = [...logs, { type: 'input', text: `PC1> ${raw}` }];

    if (v === 'clear') {
      setLogs([]);
      setInputVal('');
      return;
    }

    if (v === 'help') {
      let helpMsg = 'Commands: help, clear';
      if (dayId === 'net-01') {
        helpMsg = 'Commands: link status, ipconfig, ping 192.168.1.20, arp -a, show mac table, clear, help';
      } else if (dayId === 'net-02') {
        helpMsg = 'Commands: subnet, subnet info, ping <address>, setip <device> <address> <mask>, clear, help';
      } else if (dayId === 'net-03') {
        helpMsg = 'Commands: cidr, split <network>, subnet <address>/<prefix>, setip pc3 <address> <mask>, ping <address>, clear, help';
      } else if (dayId === 'net-04') {
        helpMsg = 'Commands: show router, show ports, ipconfig, show routes, setgw pc1 <address|none>, ping <address>, clear, help';
      } else if (dayId === 'net-05') {
        helpMsg = 'Commands: show router r2, show ports r2, ping <address>, r1 route add <network> via <next hop>, r2 route add <network> via <next hop>, clear, help';
      } else if (dayId === 'net-06') {
        helpMsg = 'Commands: show router isp, ping <address>, r1 route add <network> via <next hop>, r1 lookup <address>, r2 route add <network> via <next hop>, pc5 ping <address>, clear, help';
      }
      newLogs.push({ type: 'output', text: helpMsg });
      setLogs(newLogs);
      setInputVal('');
      return;
    }

    let out = staticResponses[v];
    let isSuccess = false;

    // Day 1 dynamic logic
    if (dayId === 'net-01') {
      if (v === 'arp -a' && !completedSteps.has(2)) {
        out = 'The list is empty. PC1 has not contacted anyone yet. Ping PC2 first (idea 3).';
      } else if (v === 'arp -a') {
        out = staticResponses['arp -a'];
        isSuccess = true;
      } else if (out) {
        isSuccess = true;
      }
    }

    // Day 2 dynamic logic
    if (dayId === 'net-02') {
      const pingMatch = v.match(/^ping (\S+)$/);
      if (!out && pingMatch) {
        const ip = pingMatch[1];
        const isUp =
          ['192.168.1.20', '192.168.1.30'].includes(ip) ||
          (ip === pc4Ip && ip.startsWith('192.168.1.'));

        if (isUp) {
          out =
            `Reply from ${ip}: time<1ms\nReply from ${ip}: time<1ms\nReply from ${ip}: time<1ms\n3 sent, 3 received, 0% loss`;
          isSuccess = true;
        } else {
          out = `Request timed out.\nRequest timed out.\nRequest timed out.\n0 received. ${ip} is not on PC1's network (192.168.1.0).`;
          isSuccess = true;
        }
      }

      const setipMatch = v.match(/^setip (pc3|pc4) (\S+) (\S+)$/);
      if (!out && setipMatch) {
        const device = setipMatch[1];
        const ip = setipMatch[2];
        const mask = setipMatch[3];

        if (ip === '192.168.1.10') {
          out = `Conflict: ${ip} is already used by PC1.\nEach device needs its own address.`;
          isSuccess = true;
        } else {
          const sameNet = ip.startsWith('192.168.1.');
          out = `${device.toUpperCase()} address set to ${ip} / ${mask}${
            sameNet ? '\nSame network as PC1.' : "\nNot on PC1's network."
          }`;
          if (device === 'pc4') {
            setPc4Ip(ip);
          }
          isSuccess = true;
        }
      }
    }

    // Day 3 dynamic logic
    if (dayId === 'net-03') {
      const pingMatch = v.match(/^ping (\S+)$/);
      if (!out && pingMatch) {
        const ip = pingMatch[1];
        const lastOctet = parseInt(ip.split('.')[3] || '0', 10);
        const pc3Last = parseInt(pc3Ip.split('.')[3] || '0', 10);

        if (ip === '192.168.1.20' || (ip === pc3Ip && pc3Last < 128)) {
          out = `Reply from ${ip}: time<1ms\nReply from ${ip}: time<1ms\nReply from ${ip}: time<1ms\n3 sent, 3 received, 0% loss`;
          isSuccess = true;
        } else if (ip === pc3Ip && pc3Last >= 128) {
          out = `Request timed out.\nRequest timed out.\nRequest timed out.\n0 received. ${ip} is in a different subnet (192.168.1.128/25). PC1 is in 192.168.1.0/25.`;
          isSuccess = true;
        } else {
          out = `Request timed out.\nRequest timed out.\nRequest timed out.\n0 received. No device answers at ${ip}.`;
        }
      }

      const setipPc3Match = v.match(/^setip pc3 (\S+) (\S+)$/);
      if (!out && setipPc3Match) {
        const ip = setipPc3Match[1];
        const mask = setipPc3Match[2];
        const lastOctet = parseInt(ip.split('.')[3] || '0', 10);

        if (ip === '192.168.1.10' || ip === '192.168.1.20') {
          out = `Conflict: ${ip} is already used by ${
            ip.endsWith('.10') ? 'PC1' : 'PC2'
          }.`;
        } else {
          setPc3Ip(ip);
          if (mask !== '255.255.255.128') {
            out = `PC3 address set to ${ip} / ${mask}\nPC3 still uses the old /24 mask. Use 255.255.255.128 to place it in a subnet.`;
          } else if (lastOctet >= 128) {
            out = `PC3 address set to ${ip} / ${mask}\nPC3 is in Subnet 2 (192.168.1.128/25).\nPC1 and PC2 are in Subnet 1 (192.168.1.0/25).`;
            isSuccess = true;
          } else {
            out = `PC3 address set to ${ip} / ${mask}\nPC3 is in Subnet 1 (192.168.1.0/25), the same as PC1 and PC2.`;
            isSuccess = true;
          }
        }
      }
    }

    // Day 4 dynamic logic
    if (dayId === 'net-04') {
      if (v === 'ipconfig') {
        out = `IPv4             192.168.1.10\nMask             255.255.255.128\nDefault gateway  ${
          gateway === 'none' ? '(none)' : gateway
        }`;
        isSuccess = true;
      }

      const setgwMatch = v.match(/^setgw pc1 (\S+)$/);
      if (setgwMatch) {
        const targetGw = setgwMatch[1];
        setGateway?.(targetGw);
        out =
          targetGw === 'none'
            ? 'PC1 default gateway removed.'
            : `PC1 default gateway set to ${targetGw}.`;
        isSuccess = true;
      }

      const pingMatch = v.match(/^ping (\S+)$/);
      if (pingMatch) {
        const ip = pingMatch[1];
        if (ip === '192.168.1.20' || ip === '192.168.1.40') {
          out = `Reply from ${ip}: time<1ms\nReply from ${ip}: time<1ms\nReply from ${ip}: time<1ms\n3 sent, 3 received, 0% loss`;
          isSuccess = true;
        } else if (ip === '192.168.1.130') {
          if (gateway === '192.168.1.1') {
            out = `Reply from ${ip}: time 1ms (sent via gateway 192.168.1.1)\nReply from ${ip}: time 1ms (sent via gateway 192.168.1.1)\nReply from ${ip}: time 1ms (sent via gateway 192.168.1.1)\n3 sent, 3 received, 0% loss`;
            isSuccess = true;
          } else {
            out = `Request timed out.\nRequest timed out.\nRequest timed out.\n0 received. ${
              gateway === 'none'
                ? 'PC1 has no default gateway, so it cannot send data outside 192.168.1.0/25.'
                : `The gateway ${gateway} does not answer.`
            }`;
            isSuccess = true;
          }
        } else {
          out = `Request timed out.\nRequest timed out.\nRequest timed out.\n0 received. No device answers at ${ip}.`;
        }
      }
    }

    // Day 5 dynamic logic
    if (dayId === 'net-05') {
      const pingMatch = v.match(/^ping (\S+)$/);
      if (pingMatch) {
        const ip = pingMatch[1];
        if (ip === '192.168.1.20' || ip === '192.168.1.40') {
          out = `Reply from ${ip}: time<1ms\nReply from ${ip}: time<1ms\nReply from ${ip}: time<1ms\n3 sent, 3 received, 0% loss`;
          isSuccess = true;
        } else if (ip === '192.168.1.130') {
          out = `Reply from ${ip}: time 1ms (via gateway 192.168.1.1)\nReply from ${ip}: time 1ms (via gateway 192.168.1.1)\nReply from ${ip}: time 1ms (via gateway 192.168.1.1)\n3 sent, 3 received, 0% loss`;
          isSuccess = true;
        } else if (ip === '192.168.3.10') {
          if (!r1Route) {
            out =
              'Reply from 192.168.1.1: Destination network unreachable\nReply from 192.168.1.1: Destination network unreachable\nReply from 192.168.1.1: Destination network unreachable\n0 received. R1 has no route to 192.168.3.0/24.';
            isSuccess = true;
          } else if (!r2Route) {
            out =
              'Request timed out.\nRequest timed out.\nRequest timed out.\n0 received. The message reached PC5, but R2 has no route back to 192.168.1.0/24, so the reply was lost.';
            isSuccess = true;
          } else {
            out =
              'Reply from 192.168.3.10: time 2ms (via gateway 192.168.1.1)\nReply from 192.168.3.10: time 2ms (via gateway 192.168.1.1)\nReply from 192.168.3.10: time 2ms (via gateway 192.168.1.1)\n3 sent, 3 received, 0% loss';
            isSuccess = true;
          }
        } else {
          out = `Request timed out.\nRequest timed out.\nRequest timed out.\n0 received. No device answers at ${ip}.`;
        }
      }

      const routeMatch = v.match(/^(r1|r2) route add (\S+) via (\S+)$/);
      if (routeMatch) {
        const router = routeMatch[1];
        const net = routeMatch[2];
        const nextHop = routeMatch[3];

        if (router === 'r1' && net === '192.168.3.0/24' && nextHop === '192.168.2.2') {
          setR1Route?.(true);
          out =
            'Route added on R1.\nRouting table of R1:\nNetwork           Via / Port   Type\n192.168.1.0/25    port 1       connected\n192.168.1.128/25  port 2       connected\n192.168.2.0/24    port 3       connected\n192.168.3.0/24    192.168.2.2  static';
          isSuccess = true;
        } else if (router === 'r2' && net === '192.168.1.0/24' && nextHop === '192.168.2.1') {
          setR2Route?.(true);
          out =
            'Route added on R2.\nRouting table of R2:\nNetwork           Via / Port   Type\n192.168.2.0/24    port 1       connected\n192.168.3.0/24    port 2       connected\n192.168.1.0/24    192.168.2.1  static';
          isSuccess = true;
        } else {
          out = 'Route not accepted. Check the network and the next hop.';
        }
      }
    }

    // Day 6 dynamic logic
    if (dayId === 'net-06') {
      const pingMatch = v.match(/^(?:pc1\s+)?ping (\S+)$/);
      if (pingMatch) {
        const ip = pingMatch[1];
        if (['192.168.1.20', '192.168.1.40', '192.168.1.130'].includes(ip)) {
          out = `Reply from ${ip}: time<1ms\nReply from ${ip}: time<1ms\nReply from ${ip}: time<1ms\n3 sent, 3 received, 0% loss`;
          isSuccess = true;
        } else if (ip === '192.168.3.10') {
          out = `Reply from ${ip}: time 2ms (via gateway 192.168.1.1)\nReply from ${ip}: time 2ms (via gateway 192.168.1.1)\nReply from ${ip}: time 2ms (via gateway 192.168.1.1)\n3 sent, 3 received, 0% loss`;
          isSuccess = true;
        } else if (ip === '198.51.100.10') {
          if (!r1DefaultRoute) {
            out =
              'Reply from 192.168.1.1: Destination network unreachable\nReply from 192.168.1.1: Destination network unreachable\nReply from 192.168.1.1: Destination network unreachable\n0 received. R1 has no route to 198.51.100.10.';
            isSuccess = true;
          } else {
            out =
              'Reply from 198.51.100.10: time 2ms (via gateway 192.168.1.1)\nReply from 198.51.100.10: time 2ms (via gateway 192.168.1.1)\nReply from 198.51.100.10: time 2ms (via gateway 192.168.1.1)\n3 sent, 3 received, 0% loss';
            isSuccess = true;
          }
        } else {
          out = `Request timed out.\nRequest timed out.\nRequest timed out.\n0 received. No device answers at ${ip}.`;
        }
      }

      const pc5PingMatch = v.match(/^pc5 ping (\S+)$/);
      if (pc5PingMatch) {
        const ip = pc5PingMatch[1];
        if (ip === '198.51.100.10') {
          if (!r2DefaultRoute) {
            out =
              'Request timed out.\nRequest timed out.\nRequest timed out.\n0 received. R2 has no route to 198.51.100.10.';
          } else {
            out =
              'Reply from 198.51.100.10: time 3ms (via gateway 192.168.3.1)\nReply from 198.51.100.10: time 3ms (via gateway 192.168.3.1)\nReply from 198.51.100.10: time 3ms (via gateway 192.168.3.1)\n3 sent, 3 received, 0% loss';
            isSuccess = true;
          }
        }
      }

      const routeMatch = v.match(/^(r1|r2) route add (\S+) via (\S+)$/);
      if (routeMatch) {
        const router = routeMatch[1];
        const net = routeMatch[2];
        const nextHop = routeMatch[3];

        if (router === 'r1' && net === '0.0.0.0/0' && nextHop === '203.0.113.1') {
          setR1DefaultRoute?.(true);
          out =
            'Route added on R1.\nRouting table of R1:\nNetwork           Via / Port   Type\n192.168.1.0/25    port 1       connected\n192.168.1.128/25  port 2       connected\n192.168.2.0/24    port 3       connected\n192.168.3.0/24    192.168.2.2  static\n203.0.113.0/24    port 4       connected\n0.0.0.0/0         203.0.113.1  default';
          isSuccess = true;
        } else if (router === 'r2' && net === '0.0.0.0/0' && nextHop === '192.168.2.1') {
          setR2DefaultRoute?.(true);
          out =
            'Route added on R2.\nRouting table of R2:\nNetwork           Via / Port   Type\n192.168.2.0/24    port 1       connected\n192.168.3.0/24    port 2       connected\n192.168.1.0/24    192.168.2.1  static\n0.0.0.0/0         192.168.2.1  default';
          isSuccess = true;
        } else {
          out = 'Route not accepted. Check the network and the next hop.';
        }
      }
    }

    if (v === 'clear' || v === 'cls') {
      setLogs([]);
      setInputVal('');
      return;
    }

    if (!out) {
      if (v.startsWith('pign') || v === 'pin') {
        out = "Did you mean 'ping'? Try: ping 192.168.1.20";
      } else if (v === 'ping') {
        out = 'ping: missing destination address. Try: ping 192.168.1.20';
      } else if (v === 'ifconfig' || v.startsWith('ipconfig /')) {
        out = 'On this system, use: ipconfig (check the lesson instructions).';
      } else if (v === 'arp') {
        out = 'To display the ARP cache, use: arp -a';
      } else if (v === 'mac' || v === 'mac table' || v === 'show mac') {
        out = 'To inspect switch MAC table, use: show mac table';
      } else if (v === 'link' || v === 'status') {
        out = 'To check physical cable state, use: link status';
      } else if (v.startsWith('setip') && v.split(' ').length < 4) {
        out = 'Usage: setip <device> <address> <mask>\nExample: setip pc3 192.168.1.130 255.255.255.128';
      } else {
        out = 'Unknown command. Type help to see commands or tap the green code chip in the lesson.';
      }
      isSuccess = false;
    } else {
      isSuccess = true;
    }

    newLogs.push({ type: 'output', text: out, isSuccess });
    setLogs(newLogs);
    setHistory((prev) => [...prev, raw]);
    setHistoryIdx(-1);
    setInputVal('');

    onCommandRun(v, out);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Ctrl+L or Cmd+L clears terminal
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      setLogs([]);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      runCommand(inputVal);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (expectedCmd) {
        setInputVal(expectedCmd);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx =
          historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx !== -1) {
        const nextIdx = historyIdx + 1;
        if (nextIdx >= history.length) {
          setHistoryIdx(-1);
          setInputVal('');
        } else {
          setHistoryIdx(nextIdx);
          setInputVal(history[nextIdx] || '');
        }
      }
    }
  };

  return (
    <section
      id="term"
      className="flex flex-col bg-[#050506] text-[#d4d4d8] border border-[#26262b] rounded-b-xl md:rounded-bl-xl md:rounded-br-none overflow-hidden h-[220px]"
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-[#222226] bg-[#0c0c0e] text-[11px] font-mono uppercase tracking-wider text-[#8a8a95]">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-[#4ade80]" />
          <span>Terminal · PC1</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-[#62626d]">
          {expectedCmd && (
            <span className="hidden sm:inline text-[#60a5fa]/80">
              hint: <span className="text-[#ececf0]">{expectedCmd}</span> [Tab]
            </span>
          )}
          <span className="hidden md:inline text-[#71717a]">[Ctrl+L] clear</span>
          <span>type help</span>
        </div>
      </div>

      {/* Terminal Output Log */}
      <div
        ref={outputRef}
        id="out"
        className="flex-1 overflow-y-auto px-3.5 py-2 font-mono text-[13px] leading-[1.55] whitespace-pre-wrap select-text space-y-1"
      >
        {logs.map((log, idx) => (
          <div
            key={idx}
            className={
              log.type === 'input'
                ? 'text-[#ececf0] font-semibold'
                : log.isSuccess
                ? 'text-[#4ade80]'
                : 'text-[#d4d4d8]'
            }
          >
            {log.text}
          </div>
        ))}
      </div>

      {/* Command Input Area */}
      <div
        id="in"
        className="relative flex items-center gap-2 px-3.5 py-2 border-t border-[#222226] bg-[#070709] font-mono text-[13px]"
      >
        <span className="text-[#4ade80] font-bold shrink-0">PC1&gt;</span>

        <div className="relative flex-1 flex items-center">
          {/* Main Input Field */}
          <input
            ref={inputRef}
            id="cmd"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            aria-label="terminal input"
            className="w-full bg-transparent border-0 outline-none text-[#ffffff] font-mono text-[13px] p-0 z-10"
            placeholder={!expectedCmd ? 'Enter command...' : ''}
          />

          {/* Ghost Autocomplete Overlay */}
          {ghostText && (
            <div className="absolute left-0 pointer-events-none select-none text-[#52525b] font-mono text-[13px] whitespace-pre z-0">
              <span className="opacity-0">{inputVal}</span>
              <span>{ghostText}</span>
              <span className="ml-2 text-[10px] text-[#3f3f46] uppercase border border-[#27272a] rounded px-1">
                Tab
              </span>
            </div>
          )}
        </div>

        {/* Quick Submit Button */}
        <button
          onClick={() => runCommand(inputVal)}
          disabled={!inputVal.trim()}
          className="p-1 rounded text-[#9a9aa5] hover:text-[#4ade80] disabled:opacity-20 transition-colors"
          title="Press Enter to run"
        >
          <CornerDownLeft size={14} />
        </button>
      </div>
    </section>
  );
};
