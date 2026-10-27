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

    if (v === 'clear' || v === 'cls') {
      setLogs([]);
      setInputVal('');
      return;
    }

    if (v === 'help') {
      let helpMsg = 'Commands: help, cls, clear';
      if (dayId === 'net-01') {
        helpMsg = 'Commands: link status, ipconfig, ping 192.168.1.20, arp -a, show mac table, cls, clear, help';
      } else if (dayId === 'net-02') {
        helpMsg = 'Commands: subnet, subnet info, ping <address>, setip <device> <address> <mask>, cls, clear, help';
      } else if (dayId === 'net-03') {
        helpMsg = 'Commands: cidr, split <network>, subnet <address>/<prefix>, setip pc3 <address> <mask>, ping <address>, cls, clear, help';
      } else if (dayId === 'net-04') {
        helpMsg = 'Commands: show router, show ports, ipconfig, show routes, setgw pc1 <address|none>, ping <address>, cls, clear, help';
      } else if (dayId === 'net-05') {
        helpMsg = 'Commands: show router r2, show ports r2, ping <address>, r1 route add <network> via <next hop>, r2 route add <network> via <next hop>, cls, clear, help';
      } else if (dayId === 'net-06') {
        helpMsg = 'Commands: show router isp, ping <address>, r1 route add <network> via <next hop>, r1 lookup <address>, r2 route add <network> via <next hop>, pc5 ping <address>, cls, clear, help';
      } else if (dayId === 'net-07') {
        helpMsg = 'Commands: arp -a, debug arp on, ping 192.168.1.20, ping 192.168.3.10, ipconfig, link status, cls, clear, help';
      } else if (dayId === 'net-08') {
        helpMsg = 'Commands: show mac table, ping 192.168.1.20, show switch log, clear mac table, cls, clear, help';
      } else if (dayId === 'net-09') {
        helpMsg = 'Commands: show broadcast domain, show station stats, show router broadcast, show domains, ping 192.168.1.255, cls, clear, help';
      } else if (dayId === 'net-10') {
        helpMsg = 'Commands: show vlan, vlan create 10 20, set port 1,2 vlan 10; set port 3,4 vlan 20, ping 192.168.10.255, ping 192.168.20.30, cls, clear, help';
      } else if (dayId === 'net-11') {
        helpMsg = 'Commands: show trunk, set port 5 trunk, show frame header, show trunk native, ping 192.168.10.30, cls, clear, help';
      } else if (dayId === 'net-12') {
        helpMsg = 'Commands: ping 192.168.20.20, show router interfaces, create subif eth0.10 10 192.168.10.1/24, create subif eth0.20 20 192.168.20.1/24, cls, clear, help';
      } else if (dayId === 'net-13') {
        helpMsg = 'Commands: test broadcast loop, show mac-flapping, enable stp, show spanning-tree, show spanning-tree ports, cls, clear, help';
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

    // Day 7 dynamic logic
    if (dayId === 'net-07') {
      if (v === 'arp -a') {
        if (completedSteps.has(4) || activeStepIndex >= 4) {
          out =
            'Interface: 192.168.1.10 on eth0\n  Internet Address      Physical Address      Type       Age\n  192.168.1.1           AA:BB:CC:00:A1:01     dynamic    4s\n  192.168.1.20          AA:BB:CC:00:00:02     dynamic    45s';
          isSuccess = true;
        } else if (completedSteps.has(2) || activeStepIndex >= 3) {
          out =
            'Interface: 192.168.1.10 on eth0\n  Internet Address      Physical Address      Type       Age\n  192.168.1.20          AA:BB:CC:00:00:02     dynamic    14s';
          isSuccess = true;
        } else {
          out = 'No ARP entries found.';
          isSuccess = true;
        }
      }
    }

    // Day 8 dynamic logic
    if (dayId === 'net-08') {
      if (v === 'show mac table' || v === 'mac-table' || v === 'show mac') {
        if (activeStepIndex === 0 && !completedSteps.has(1)) {
          out =
            'Switch SW1 MAC Address Table\n--------------------------------------------\nVLAN  Port    MAC Address        Type     Age\n(0 entries learned · table empty at boot)';
          isSuccess = true;
        } else if (activeStepIndex === 1 || activeStepIndex === 2) {
          out =
            'Switch SW1 MAC Address Table\n--------------------------------------------\nVLAN  Port    MAC Address        Type     Age\n1     Port 1  AA:BB:CC:00:00:01  DYNAMIC  14s\nTotal entries: 1';
          isSuccess = true;
        } else if (activeStepIndex === 4 && completedSteps.has(4)) {
          out =
            'Switch SW1 MAC Address Table\n--------------------------------------------\nVLAN  Port    MAC Address        Type     Age\n(0 entries learned · table flushed by clear mac table)';
          isSuccess = true;
        } else {
          out =
            'Switch SW1 MAC Address Table\n--------------------------------------------\nVLAN  Port    MAC Address        Type     Age\n1     Port 1  AA:BB:CC:00:00:01  DYNAMIC  22s\n1     Port 2  AA:BB:CC:00:00:02  DYNAMIC  6s\nTotal entries: 2';
          isSuccess = true;
        }
      } else if (v === 'clear mac table' || v === 'clear mac') {
        out =
          'Switch SW1: Dynamic MAC address table cleared.\nAll learned port mappings removed.';
        isSuccess = true;
      } else if (v === 'show switch log' || v === 'show log') {
        out =
          '[Port 1] Ingress frame: SA=AA:BB:CC:00:00:01 DA=AA:BB:CC:00:00:02\n[SW1]    Learned: AA:BB:CC:00:00:01 on Port 1\n[SW1]    Lookup DA AA:BB:CC:00:00:02: NOT IN TABLE\n[SW1]    Action: UNKNOWN UNICAST FLOOD -> Ports 2, 3, 4\n[Port 2] Frame delivered to PC2 (DA matched)\n[Port 3] Discarded by PC3 (DA mismatch)\n[Port 4] Discarded by PC4 (DA mismatch)';
        isSuccess = true;
      }
    }

    // Day 10 dynamic logic
    if (dayId === 'net-10') {
      if (v === 'show vlan' || v === 'show vlans' || v === 'vlan list') {
        if (completedSteps.has(2) || activeStepIndex >= 3) {
          out =
            'Switch SW1 VLAN Database\n----------------------------------------------------\nVLAN  Name              Status    Ports\n1     default           active    none\n10    Engineering       active    Port 1, Port 2\n20    Finance           active    Port 3, Port 4\n----------------------------------------------------\nActive VLANs: 2 user-defined (access mode assigned)';
          isSuccess = true;
        } else if (completedSteps.has(1) || activeStepIndex >= 2) {
          out =
            'Switch SW1 VLAN Database\n----------------------------------------------------\nVLAN  Name              Status    Ports\n1     default           active    Port 1, Port 2, Port 3, Port 4\n10    Engineering       active    none\n20    Finance           active    none\n----------------------------------------------------\nActive VLANs: 3 (VLAN 10 and 20 created, 0 ports assigned)';
          isSuccess = true;
        } else {
          out =
            'Switch SW1 VLAN Database\n----------------------------------------------------\nVLAN  Name              Status    Ports\n1     default           active    Port 1, Port 2, Port 3, Port 4\n----------------------------------------------------\nTotal VLANs: 1 (factory default state: all ports share one broadcast domain)';
          isSuccess = true;
        }
      } else if (
        v === 'vlan create 10 20' ||
        v === 'vlan 10 20' ||
        v === 'create vlan 10 20'
      ) {
        out =
          'Switch SW1(config)# vlan 10\nSwitch SW1(config-vlan)# name Engineering\nSwitch SW1(config)# vlan 20\nSwitch SW1(config-vlan)# name Finance\n\nVLAN 10 (Engineering) created.\nVLAN 20 (Finance) created.\nAssigned ports: none (empty VLANs).';
        isSuccess = true;
      } else if (
        v === 'set port 1,2 vlan 10; set port 3,4 vlan 20' ||
        v === 'set port 1,2 vlan 10 ; set port 3,4 vlan 20' ||
        v === 'set port 1, 2 vlan 10; set port 3, 4 vlan 20' ||
        v === 'set port 1,2 vlan 10 and set port 3,4 vlan 20'
      ) {
        out =
          'Switch SW1(config)# interface range port 1 - 2\nSwitch SW1(config-if-range)# switchport mode access\nSwitch SW1(config-if-range)# switchport access vlan 10\nSwitch SW1(config)# interface range port 3 - 4\nSwitch SW1(config-if-range)# switchport mode access\nSwitch SW1(config-if-range)# switchport access vlan 20\n\nPort 1, Port 2 -> VLAN 10 (Engineering · Access Mode)\nPort 3, Port 4 -> VLAN 20 (Finance · Access Mode)';
        isSuccess = true;
      }
    }

    // Day 11 dynamic logic
    if (dayId === 'net-11') {
      if (v === 'show trunk' || v === 'show trunks' || v === 'show interfaces trunk') {
        if (completedSteps.has(1) || activeStepIndex >= 1) {
          out =
            'Switch SW1 Trunk Interface Status\n----------------------------------------------------\nPort   Mode      Encapsulation   Status        Native VLAN\nPort 5 on        802.1q          trunking      1\n----------------------------------------------------\nTrunk Port 5: Active · Allowed VLANs: 1, 10, 20 · 802.1Q Tagging Enabled';
          isSuccess = true;
        } else {
          out =
            'Switch SW1 Trunk Interface Status\n----------------------------------------------------\nPort   Mode      Encapsulation   Status        Native VLAN\nPort 5 auto      802.1q          not-trunking  1\n----------------------------------------------------\nResult: Port 5 is operating in standard Access Mode (single VLAN only).';
          isSuccess = true;
        }
      } else if (
        v === 'set port 5 trunk' ||
        v === 'switchport mode trunk' ||
        v === 'port 5 trunk'
      ) {
        out =
          'Switch SW1(config)# interface port 5\nSwitch SW1(config-if)# switchport mode trunk\nSwitch SW1(config-if)# switchport trunk allowed vlan 1,10,20\n\nSwitch SW2(config)# interface port 5\nSwitch SW2(config-if)# switchport mode trunk\nSwitch SW2(config-if)# switchport trunk allowed vlan 1,10,20\n\nTrunk link established on Port 5 between SW1 and SW2.\nEncapsulation: IEEE 802.1Q (Dot1q) · Allowed VLANs: 1, 10, 20.';
        isSuccess = true;
      } else if (
        v === 'show frame header' ||
        v === 'show header' ||
        v === 'debug 802.1q' ||
        v === 'show frame'
      ) {
        out =
          'Captured Frame on Trunk Port 5 Link (SW1 -> SW2):\n----------------------------------------------------\n[Ethernet Header]\n  Destination MAC:  AA:BB:CC:10:00:03 (PC3)\n  Source MAC:       AA:BB:CC:10:00:01 (PC1)\n[IEEE 802.1Q Tag]\n  TPID (Tag Protocol Identifier): 0x8100\n  Priority (PCP):                 0 (Best Effort)\n  VLAN ID (VID):                  10 (Engineering)\n[Payload]\n  EtherType:        0x0800 (IPv4)\n  Source IP:        192.168.10.10\n  Destination IP:   192.168.10.30\n  Protocol:         ICMP Echo Request\n----------------------------------------------------\nAction at SW2: Tag 0x8100 stripped before egress on Port 1.';
        isSuccess = true;
      } else if (
        v === 'show trunk native' ||
        v === 'show native vlan' ||
        v === 'show native'
      ) {
        out =
          'Switch SW1 & SW2 Trunk Native VLAN Status\n----------------------------------------------------\nPort     Trunk Mode   Native VLAN   Status    VLAN Leaking\nSW1:P5   802.1Q       VLAN 1        MATCHED   Protected (None)\nSW2:P5   802.1Q       VLAN 1        MATCHED   Protected (None)\n----------------------------------------------------\nNative VLAN frames traverse Port 5 untagged with 0 byte overhead.';
        isSuccess = true;
      }
    }

    // Day 12 dynamic logic
    if (dayId === 'net-12') {
      if (
        v === 'show router interfaces' ||
        v === 'show ip interface brief' ||
        v === 'show interfaces router' ||
        v === 'show int router' ||
        v === 'show subif'
      ) {
        if (completedSteps.has(3) || activeStepIndex >= 4) {
          out =
            'Router R1 Interface Status\n----------------------------------------------------\nInterface  IP-Address         Status   Protocol  Description\neth0       unassigned         up       up        Trunk link to SW1:Port 4\neth0.10    192.168.10.1/24    up       up        Gateway for VLAN 10 (dot1q 10)\neth0.20    192.168.20.1/24    up       up        Gateway for VLAN 20 (dot1q 20)\n----------------------------------------------------\nSub-interfaces: 2 active (routing enabled between VLAN 10 & 20).';
          isSuccess = true;
        } else if (completedSteps.has(2) || activeStepIndex >= 3) {
          out =
            'Router R1 Interface Status\n----------------------------------------------------\nInterface  IP-Address         Status   Protocol  Description\neth0       unassigned         up       up        Trunk link to SW1:Port 4\neth0.10    192.168.10.1/24    up       up        Gateway for VLAN 10 (dot1q 10)\n----------------------------------------------------\nSub-interfaces: 1 active (awaiting VLAN 20 gateway).';
          isSuccess = true;
        } else {
          out =
            'Router R1 Interface Status\n----------------------------------------------------\nInterface  IP-Address         Status   Protocol  Description\neth0       unassigned         up       up        Trunk link to SW1:Port 4\n----------------------------------------------------\nSub-interfaces: None configured.';
          isSuccess = true;
        }
      } else if (
        v === 'create subif eth0.10 10 192.168.10.1/24' ||
        v === 'interface eth0.10' ||
        v === 'int eth0.10' ||
        v === 'create subif eth0.10' ||
        v === 'create subinterface eth0.10 10 192.168.10.1/24'
      ) {
        out =
          'Router R1(config)# interface eth0.10\nRouter R1(config-subif)# encapsulation dot1q 10\nRouter R1(config-subif)# ip address 192.168.10.1 255.255.255.0\n\nSub-interface eth0.10 created.\nEncapsulation: IEEE 802.1Q · VLAN ID: 10\nIP Address: 192.168.10.1/24 (Gateway for VLAN 10).';
        isSuccess = true;
      } else if (
        v === 'create subif eth0.20 20 192.168.20.1/24' ||
        v === 'interface eth0.20' ||
        v === 'int eth0.20' ||
        v === 'create subif eth0.20' ||
        v === 'create subinterface eth0.20 20 192.168.20.1/24'
      ) {
        out =
          'Router R1(config)# interface eth0.20\nRouter R1(config-subif)# encapsulation dot1q 20\nRouter R1(config-subif)# ip address 192.168.20.1 255.255.255.0\n\nSub-interface eth0.20 created.\nEncapsulation: IEEE 802.1Q · VLAN ID: 20\nIP Address: 192.168.20.1/24 (Gateway for VLAN 20).\n\nRouting table updated: 2 connected subnets (192.168.10.0/24, 192.168.20.0/24).';
        isSuccess = true;
      } else if (
        v === 'ping 192.168.20.20' ||
        v.startsWith('ping 192.168.20.')
      ) {
        if (completedSteps.has(3) || activeStepIndex >= 4) {
          out =
            'Sending 4 64-byte ICMP Echos to 192.168.20.20 via gateway 192.168.10.1:\nReply from 192.168.20.20: bytes=64 time=1.8ms TTL=63\nReply from 192.168.20.20: bytes=64 time=1.6ms TTL=63\nReply from 192.168.20.20: bytes=64 time=1.7ms TTL=63\nReply from 192.168.20.20: bytes=64 time=1.7ms TTL=63\n\n--- 192.168.20.20 ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss, time 3004ms\nRound-trip min/avg/max = 1.6/1.7/1.8 ms\n(Inter-VLAN route verified: hairpin traversal via R1 eth0.10 -> eth0.20 with TTL=63)';
          isSuccess = true;
        } else {
          out =
            'Sending 4 64-byte ICMP Echos to 192.168.20.20:\nRequest timed out.\nRequest timed out.\nRequest timed out.\nRequest timed out.\n\n--- 192.168.20.20 ping statistics ---\n4 packets transmitted, 0 received, 100% packet loss\n(Host unreachable: Switch SW1 will not forward between VLAN 10 and VLAN 20 at Layer 2)';
          isSuccess = true;
        }
      }
    }

    // Day 13 dynamic logic
    if (dayId === 'net-13') {
      if (
        v === 'test broadcast loop' ||
        v === 'test broadcast' ||
        v === 'test loop' ||
        v === 'ping 192.168.1.255'
      ) {
        if (completedSteps.has(2) || activeStepIndex >= 3) {
          out =
            'Transmitting 1 broadcast frame (FF:FF:FF:FF:FF:FF) from PC1 into SW2...\n\n[SW2] Received broadcast on Port 3. Forwarding to Port 1 (SW1).\n[SW2] Port 2 is in STP BLOCKING state (frame suppressed).\n[SW1] Received broadcast on Port 1. Forwarding to Port 2 (SW3).\n[SW3] Received broadcast on Port 1. Delivered to Port 3 (PC2).\n[SW3] Port 2 is in STP BLOCKING state (frame suppressed).\n\n*** ZERO LOOPS DETECTED ***\nSTP loop prevention active. 0% storm saturation. Network stable.';
          isSuccess = true;
        } else {
          out =
            'Transmitting 1 broadcast frame (FF:FF:FF:FF:FF:FF) from PC1 into SW2...\n\n[SW2] Received broadcast on Port 3. Flooding to Port 1 (SW1) and Port 2 (SW3).\n[SW1] Received broadcast on Port 1. Flooding to Port 2 (SW3).\n[SW3] Received broadcast on Port 1. Flooding to Port 2 (SW2).\n[SW2] Received duplicate broadcast on Port 2. Flooding to Port 1 (SW1)...\n\n*** LAYER 2 LOOP DETECTED ***\nCirculating frames: 4,096 / sec\nBandwidth utilization: 100% (Link saturated)\nSwitch CPU: 100% (Broadcast Storm in progress)';
          isSuccess = true;
        }
      } else if (
        v === 'show mac-flapping' ||
        v === 'show flapping' ||
        v === 'show mac table flapping' ||
        v === 'show log'
      ) {
        out =
          'Switch SW1 MAC Flapping Diagnostic Log\n----------------------------------------------------\nTime      MAC Address        Previous Port  Current Port  Delta\n14:02:01  AA:BB:CC:00:00:01  Port 1         Port 2        1.4ms\n14:02:01  AA:BB:CC:00:00:01  Port 2         Port 1        1.2ms\n14:02:01  AA:BB:CC:00:00:01  Port 1         Port 2        1.3ms\n14:02:01  AA:BB:CC:00:00:01  Port 2         Port 1        1.5ms\n----------------------------------------------------\nAlert: MAC table instability detected. Unicast forwarding corrupted.';
        isSuccess = true;
      } else if (
        v === 'enable stp' ||
        v === 'spanning-tree mode classic' ||
        v === 'spanning-tree enable' ||
        v === 'stp enable'
      ) {
        out =
          'Switch SW1(config)# spanning-tree mode classic\nSwitch SW2(config)# spanning-tree mode classic\nSwitch SW3(config)# spanning-tree mode classic\n\nSTP IEEE 802.1D activated on all switches.\nTransmitting configuration BPDUs to multicast 01:80:C2:00:00:00 every 2s.\nRoot Bridge election in progress...';
        isSuccess = true;
      } else if (
        v === 'show spanning-tree' ||
        v === 'show stp' ||
        v === 'show spanning tree'
      ) {
        out =
          'VLAN 1 Spanning Tree Protocol (IEEE 802.1D)\n----------------------------------------------------\nRoot ID    Priority: 32768\n           Address:  AA:BB:CC:00:00:01 (Switch SW1)\n           Cost:     0 (This bridge is the root)\n           Hello:    2 sec  Max Age: 20 sec  Forward Delay: 15 sec\n\nBridge ID  Priority: 32768\n           Address:  AA:BB:CC:00:00:01\n           Aging:    300 sec\n----------------------------------------------------\nElection: SW1 elected Root Bridge (lowest Bridge ID: 32768.AA:BB:CC:00:00:01).';
        isSuccess = true;
      } else if (
        v === 'show spanning-tree ports' ||
        v === 'show spanning-tree blocked' ||
        v === 'show stp ports' ||
        v === 'show stp brief'
      ) {
        out =
          'Switch Port Spanning Tree Roles & States\n----------------------------------------------------\nSwitch  Port    Role        State       Cost  Designated Bridge\nSW1     Port 1  Designated  FORWARDING  4     32768.AA:BB:CC:00:00:01\nSW1     Port 2  Designated  FORWARDING  4     32768.AA:BB:CC:00:00:01\nSW2     Port 1  Root        FORWARDING  4     32768.AA:BB:CC:00:00:01\nSW2     Port 2  Designated  FORWARDING  4     32768.AA:BB:CC:00:00:02\nSW3     Port 1  Root        FORWARDING  4     32768.AA:BB:CC:00:00:01\nSW3     Port 2  Alternate   BLOCKING    4     32768.AA:BB:CC:00:00:02\n----------------------------------------------------\nLoop-Free Topology Confirmed: SW3 Port 2 is BLOCKING (Amber).';
        isSuccess = true;
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
      } else if (v === 'vlan' || v === 'vlans') {
        out = 'To inspect switch VLANs, use: show vlan';
      } else if (v === 'trunk' || v === 'trunks') {
        out = 'To inspect switch trunk interfaces, use: show trunk';
      } else if (v === 'subif' || v === 'subinterface' || v === 'sub-interface') {
        out = 'To configure router sub-interfaces, use: create subif eth0.10 10 192.168.10.1/24';
      } else if (v === 'stp' || v === 'spanning-tree' || v === 'spanning') {
        out = 'To inspect or enable Spanning Tree Protocol, try: enable stp or show spanning-tree';
      } else if (v === 'bpdu' || v === 'bpdus') {
        out = 'BPDUs are Layer 2 STP control messages. Enable STP using: enable stp';
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
          <span className="hidden md:inline text-[#71717a]">[Ctrl+L] / cls clear</span>
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
