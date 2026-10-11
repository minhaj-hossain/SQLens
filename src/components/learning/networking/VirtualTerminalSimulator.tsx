'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { TerminalScenario } from '../../../types/curriculum';
import {
  Terminal as TerminalIcon,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';

export interface VirtualTerminalSimulatorProps {
  scenario?: TerminalScenario;
  hostname?: string;
  userPrompt?: string;
  initialLines?: string[];
  commandResponses?: Record<string, string>;
  customResponses?: Record<string, string[]>;
  availableCommands?: string[];
  currentIp?: string;
  subnetMask?: string;
  gatewayIp?: string;
  dnsServer?: string;
  macAddress?: string;
  title?: string;
  description?: string;
  onCommandRun?: (command: string, output: string) => void;
}

interface CommandHistoryItem {
  command: string;
  output: string;
}

export const VirtualTerminalSimulator: React.FC<VirtualTerminalSimulatorProps> = ({
  scenario,
  hostname: propHostname,
  userPrompt: propUserPrompt,
  initialLines: propInitialLines,
  commandResponses: propCommandResponses,
  customResponses: propCustomResponses,
  availableCommands: propAvailableCommands,
  currentIp: propCurrentIp,
  subnetMask: propSubnetMask,
  gatewayIp: propGatewayIp,
  dnsServer: propDnsServer,
  macAddress: propMacAddress,
  title = 'Interactive Command-Line Diagnostics Lab',
  description = 'Execute real diagnostic commands to troubleshoot network reachability, DNS resolution, and interface configuration.',
  onCommandRun,
}) => {
  const hostname = scenario?.hostname || propHostname || 'WORKSTATION-PC';
  const userPrompt = scenario?.userPrompt || propUserPrompt || 'C:\\Users\\admin>';
  const currentIp = scenario?.currentIp || propCurrentIp || '192.168.1.105';
  const subnetMask = scenario?.subnetMask || propSubnetMask || '255.255.255.0';
  const gatewayIp = scenario?.gatewayIp || propGatewayIp || '192.168.1.1';
  const dnsServer = scenario?.dnsServer || propDnsServer || '192.168.1.1';
  const macAddress = scenario?.macAddress || propMacAddress || 'B4-2E-99-4A-12-88';

  const initialLines = scenario?.initialLines || propInitialLines;
  const defaultHistory: CommandHistoryItem[] = initialLines && initialLines.length > 0
    ? initialLines.map((line: string) => ({ command: '', output: line }))
    : [
        {
          command: 'ipconfig',
          output: `Windows IP Configuration\n\nEthernet adapter Local Area Connection:\n   Connection-specific DNS Suffix  . : localdomain\n   Link-local IPv6 Address . . . . . : fe80::512b:1198:4e4a:71d9%12\n   IPv4 Address. . . . . . . . . . . : ${currentIp}\n   Subnet Mask . . . . . . . . . . . : ${subnetMask}\n   Default Gateway . . . . . . . . . : ${gatewayIp}`,
        },
      ];

  const [history, setHistory] = useState<CommandHistoryItem[]>(defaultHistory);
  const [inputVal, setInputVal] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const executeCommand = (cmdText: string) => {
    const raw = cmdText.trim();
    if (!raw) return;

    const lower = raw.toLowerCase();
    let output = '';

    const cmdResponses = scenario?.commandResponses || propCommandResponses;
    const custResponses = scenario?.customResponses || propCustomResponses;

    // 1. Check custom scenario command response override
    if (cmdResponses && cmdResponses[raw]) {
      output = cmdResponses[raw];
    } else if (cmdResponses && cmdResponses[lower]) {
      output = cmdResponses[lower];
    } else if (custResponses && custResponses[raw]) {
      output = custResponses[raw].join('\n');
    } else if (custResponses && custResponses[lower]) {
      output = custResponses[lower].join('\n');
    }
    // 2. Built-in command simulator
    else if (lower === 'cls' || lower === 'clear') {
      setHistory([]);
      setInputVal('');
      return;
    } else if (lower === 'help') {
      output = `Supported Diagnostics Commands:\n  ipconfig          - View IPv4 address, subnet mask, and gateway\n  ipconfig /all     - View detailed adapter info (MAC, DHCP, DNS)\n  ipconfig /flushdns- Purge OS DNS resolver cache\n  ping <ip/host>    - Test Layer 3 reachability using ICMP Echo\n  tracert <ip/host> - Trace router hops using TTL decrement\n  nslookup <domain> - Query DNS records directly\n  netstat -ano      - Display active TCP/UDP ports and PIDs\n  clear / cls       - Clear terminal screen`;
    } else if (lower === 'ipconfig') {
      output = `Windows IP Configuration\n\nEthernet adapter Local Area Connection:\n   Connection-specific DNS Suffix  . : corp.internal\n   IPv4 Address. . . . . . . . . . . : ${currentIp}\n   Subnet Mask . . . . . . . . . . . : ${subnetMask}\n   Default Gateway . . . . . . . . . : ${gatewayIp}`;
    } else if (lower === 'ipconfig /all') {
      output = `Windows IP Configuration\n\n   Host Name . . . . . . . . . . . . : ${hostname}\n   Primary Dns Suffix  . . . . . . . : corp.internal\n   Node Type . . . . . . . . . . . . : Hybrid\n   IP Routing Enabled. . . . . . . . : No\n   WINS Proxy Enabled. . . . . . . . : No\n\nEthernet adapter Local Area Connection:\n   Connection-specific DNS Suffix  . : corp.internal\n   Description . . . . . . . . . . . : Intel(R) Ethernet Connection I219-LM\n   Physical Address. . . . . . . . . : ${macAddress}\n   DHCP Enabled. . . . . . . . . . . : Yes\n   Autoconfiguration Enabled . . . . : Yes\n   IPv4 Address. . . . . . . . . . . : ${currentIp}(Preferred)\n   Subnet Mask . . . . . . . . . . . : ${subnetMask}\n   Default Gateway . . . . . . . . . : ${gatewayIp}\n   DHCP Server . . . . . . . . . . . : ${gatewayIp}\n   DNS Servers . . . . . . . . . . . : ${dnsServer}\n                                       8.8.8.8`;
    } else if (lower === 'ipconfig /flushdns') {
      output = `Windows IP Configuration\n\nSuccessfully flushed the DNS Resolver Cache.`;
    } else if (lower.startsWith('ping')) {
      const target = raw.slice(4).trim() || '8.8.8.8';
      output = `Pinging ${target} with 32 bytes of data:\nReply from ${target}: bytes=32 time=12ms TTL=118\nReply from ${target}: bytes=32 time=11ms TTL=118\nReply from ${target}: bytes=32 time=13ms TTL=118\nReply from ${target}: bytes=32 time=11ms TTL=118\n\nPing statistics for ${target}:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),\nApproximate round trip times in milli-seconds:\n    Minimum = 11ms, Maximum = 13ms, Average = 11ms`;
    } else if (lower.startsWith('tracert') || lower.startsWith('traceroute')) {
      const target = raw.replace(/^(tracert|traceroute)/i, '').trim() || '93.184.216.34';
      output = `Tracing route to ${target} over a maximum of 30 hops:\n\n  1     1 ms     1 ms     1 ms  ${gatewayIp} [Default Gateway]\n  2     8 ms     7 ms     8 ms  10.240.0.1 [ISP Aggregation Node]\n  3    14 ms    13 ms    14 ms  72.14.215.82 [Core Backbone]\n  4    15 ms    14 ms    15 ms  ${target} [Destination Reached]\n\nTrace complete.`;
    } else if (lower.startsWith('nslookup')) {
      const domain = raw.slice(8).trim() || 'example.com';
      output = `Server:  resolver.corp.internal\nAddress:  ${dnsServer}\n\nNon-authoritative answer:\nName:    ${domain}\nAddresses:  93.184.216.34\n          2606:2800:220:1:248:1893:25c8:1946`;
    } else if (lower.startsWith('netstat')) {
      output = `Active Connections\n\n  Proto  Local Address          Foreign Address        State           PID\n  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       940\n  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING       4\n  TCP    ${currentIp}:52140    93.184.216.34:443      ESTABLISHED     4812\n  TCP    ${currentIp}:52141    142.250.190.46:443     ESTABLISHED     4812\n  UDP    0.0.0.0:5353           *:*                                    2104`;
    } else {
      output = `'${raw}' is not recognized as an internal or external command,\noperable program or batch file. Type 'help' for supported commands.`;
    }

    setHistory((prev) => [...prev, { command: raw, output }]);
    setInputVal('');
    if (onCommandRun) {
      onCommandRun(raw, output);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(inputVal);
    }
  };

  const quickPills = scenario?.availableCommands || propAvailableCommands || scenario?.suggestedCommands || [
    'ipconfig',
    'ipconfig /all',
    'ping 8.8.8.8',
    'tracert 93.184.216.34',
    'nslookup example.com',
    'ipconfig /flushdns',
  ];

  return (
    <div
      className="w-full rounded-2xl border border-slate-800 bg-slate-950/95 backdrop-blur-md p-4 sm:p-5 shadow-xl space-y-3 font-mono text-xs text-slate-200"
      data-testid="virtual-terminal-simulator"
    >
      {/* 1. Terminal Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200 text-xs sm:text-sm">
            {title}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-mono">
            {hostname}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHistory([])}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Reset Terminal Screen"
          >
            <RotateCcw className="w-3 h-3" /> Clear
          </button>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
        </div>
      </div>

      {description && (
        <p className="text-slate-400 text-xs font-sans leading-relaxed">
          {description}
        </p>
      )}

      {/* 2. Quick Action Command Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
        <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">
          Quick Commands:
        </span>
        {quickPills.map((cmd: string) => (
          <button
            key={cmd}
            type="button"
            onClick={() => executeCommand(cmd)}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-[11px] text-emerald-400 font-mono transition cursor-pointer shrink-0"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* 3. Terminal Viewport */}
      <div
        className="p-3 sm:p-4 rounded-xl bg-black/90 border border-slate-800/80 min-h-[220px] max-h-[360px] overflow-y-auto space-y-3 font-mono text-xs leading-relaxed text-slate-300"
        data-testid="terminal-viewport"
      >
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1">
            {item.command ? (
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>{userPrompt} {item.command}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(item.output);
                    setCopiedIndex(idx);
                    setTimeout(() => setCopiedIndex(null), 1500);
                  }}
                  className="text-[10px] text-slate-400 hover:text-slate-300 transition flex items-center gap-1"
                  title="Copy output"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-2.5 h-2.5 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-2.5 h-2.5" /> Copy
                    </>
                  )}
                </button>
              </div>
            ) : null}
            <pre className="text-slate-300 whitespace-pre-wrap font-mono text-[11px] pl-2 border-l border-slate-800">
              {item.output}
            </pre>
          </div>
        ))}

        {/* Active Command Prompt Input */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-emerald-400 font-bold shrink-0">
            {userPrompt}&nbsp;
          </span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type diagnostic command (e.g. ipconfig /all, ping, tracert)..."
            className="flex-1 bg-transparent border-none outline-none text-slate-200 text-xs font-mono placeholder:text-slate-600 focus:ring-0"
            autoComplete="off"
            spellCheck={false}
            data-testid="terminal-input"
          />
          <button
            type="button"
            onClick={() => executeCommand(inputVal)}
            className="p-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition cursor-pointer"
            aria-label="Run Command"
          >
            <Play className="w-3 h-3" />
          </button>
        </div>

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
