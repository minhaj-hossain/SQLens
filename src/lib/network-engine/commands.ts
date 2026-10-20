import type { CommandExecutionResult, EthernetFrame, SimulationState } from './types';

export function normalizeCommand(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function isPingCommand(raw: string, expectedTarget?: string): boolean {
  const norm = normalizeCommand(raw);
  if (!norm.startsWith('ping')) return false;

  const parts = norm.split(' ').filter(Boolean);
  // remove flags like -n 4, -t, -l 32
  const nonFlagParts: string[] = [];
  for (let i = 1; i < parts.length; i++) {
    if (parts[i].startsWith('-')) {
      if (['--n', '-n', '-l', '-w'].includes(parts[i]) && i + 1 < parts.length) {
        i++; // skip flag value
      }
      continue;
    }
    nonFlagParts.push(parts[i]);
  }

  if (expectedTarget) {
    return nonFlagParts.includes(expectedTarget.toLowerCase());
  }
  return nonFlagParts.length > 0;
}

export function executeCommandTruthfully(
  state: SimulationState,
  rawCommand: string,
): { result: CommandExecutionResult; updatedState: SimulationState } {
  const command = normalizeCommand(rawCommand);
  const hostA = state.devices['host-a'];
  const eth0 = hostA?.interfaces?.eth0;
  const link = state.links['cable-hostA-sw1'];
  const isPhysicalUp = link?.status === 'carrier-active' && eth0?.linkState === 'up';

  let nextLogicalClock = state.logicalClock + 1;
  let nextState: SimulationState = {
    ...state,
    logicalClock: nextLogicalClock,
  };

  // 1. CLS / CLEAR
  if (command === 'cls' || command === 'clear') {
    return {
      result: {
        stdout: '',
        exitCode: 0,
        outcome: 'SUCCESS',
      },
      updatedState: {
        ...nextState,
        terminalHistory: [],
      },
    };
  }

  // 2. HELP
  if (command === 'help') {
    const helpText = [
      'Supported Diagnostics Commands:',
      '  ping <ip>      - Test Layer 3 reachability using ICMP Echo',
      '  ipconfig       - Display IP configuration and interface media state',
      '  ipconfig /all  - Display detailed adapter parameters (MAC, static/DHCP)',
      '  arp -a         - View the ARP neighbor address cache',
      '  cls            - Clear terminal screen',
    ].join('\n');

    return {
      result: {
        stdout: helpText,
        exitCode: 0,
        outcome: 'SUCCESS',
      },
      updatedState: nextState,
    };
  }

  // 3. IPCONFIG
  if (command === 'ipconfig') {
    if (!isPhysicalUp) {
      const out = [
        'Windows IP Configuration',
        '',
        'Ethernet adapter Ethernet0:',
        '',
        '   Media State . . . . . . . . . . . : Media disconnected',
        '   Connection-specific DNS Suffix  . : ',
      ].join('\n');
      return {
        result: {
          stdout: out,
          exitCode: 0,
          outcome: 'MEDIA_DISCONNECTED',
        },
        updatedState: nextState,
      };
    } else {
      const out = [
        'Windows IP Configuration',
        '',
        'Ethernet adapter Ethernet0:',
        '',
        '   Connection-specific DNS Suffix  . : ',
        '   IPv4 Address. . . . . . . . . . . : 192.168.1.10',
        '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
        '   Default Gateway . . . . . . . . . : 192.168.1.1',
      ].join('\n');
      return {
        result: {
          stdout: out,
          exitCode: 0,
          outcome: 'SUCCESS',
        },
        updatedState: nextState,
      };
    }
  }

  // 4. IPCONFIG /ALL
  if (command === 'ipconfig /all') {
    if (!isPhysicalUp) {
      const out = [
        'Windows IP Configuration',
        '',
        '   Host Name . . . . . . . . . . . . : Acme-PC-01',
        '   Primary Dns Suffix  . . . . . . . : ',
        '   Node Type . . . . . . . . . . . . : Hybrid',
        '   IP Routing Enabled. . . . . . . . : No',
        '   WINS Proxy Enabled. . . . . . . . : No',
        '',
        'Ethernet adapter Ethernet0:',
        '',
        '   Media State . . . . . . . . . . . : Media disconnected',
        '   Connection-specific DNS Suffix  . : ',
        '   Description . . . . . . . . . . . : Realtek PCIe GbE Family Controller',
        '   Physical Address. . . . . . . . . : 00-1A-2B-3C-4D-10',
        '   DHCP Enabled. . . . . . . . . . . : No',
        '   Autoconfiguration Enabled . . . . : Yes',
      ].join('\n');
      return {
        result: {
          stdout: out,
          exitCode: 0,
          outcome: 'MEDIA_DISCONNECTED',
        },
        updatedState: nextState,
      };
    } else {
      const out = [
        'Windows IP Configuration',
        '',
        '   Host Name . . . . . . . . . . . . : Acme-PC-01',
        '   Primary Dns Suffix  . . . . . . . : ',
        '   Node Type . . . . . . . . . . . . : Hybrid',
        '   IP Routing Enabled. . . . . . . . : No',
        '   WINS Proxy Enabled. . . . . . . . : No',
        '',
        'Ethernet adapter Ethernet0:',
        '',
        '   Connection-specific DNS Suffix  . : ',
        '   Description . . . . . . . . . . . : Realtek PCIe GbE Family Controller',
        '   Physical Address. . . . . . . . . : 00-1A-2B-3C-4D-10',
        '   DHCP Enabled. . . . . . . . . . . : No',
        '   Autoconfiguration Enabled . . . . : Yes',
        '   IPv4 Address. . . . . . . . . . . : 192.168.1.10(Preferred)',
        '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
        '   Default Gateway . . . . . . . . . : 192.168.1.1',
      ].join('\n');
      return {
        result: {
          stdout: out,
          exitCode: 0,
          outcome: 'SUCCESS',
        },
        updatedState: nextState,
      };
    }
  }

  // 5. ARP -A
  if (command === 'arp -a' || command === 'arp') {
    const arpTable = hostA?.arpTable || {};
    const entries = Object.entries(arpTable);

    if (entries.length === 0) {
      return {
        result: {
          stdout: 'No ARP Entries Found.',
          exitCode: 0,
          outcome: 'ARP_EMPTY',
        },
        updatedState: nextState,
      };
    } else {
      const lines = [
        'Interface: 192.168.1.10 --- 0xb',
        '  Internet Address      Physical Address      Type',
      ];
      for (const [ip, entry] of entries) {
        lines.push(`  ${ip.padEnd(22)}${entry.mac.toLowerCase().padEnd(22)}${entry.type}`);
      }
      return {
        result: {
          stdout: lines.join('\n'),
          exitCode: 0,
          outcome: 'ARP_RESOLVED',
        },
        updatedState: nextState,
      };
    }
  }

  // 6. PING
  if (isPingCommand(command)) {
    // Extract target
    const parts = command.split(' ').filter(Boolean);
    let target = '192.168.1.1';
    for (let i = 1; i < parts.length; i++) {
      if (!parts[i].startsWith('-')) {
        target = parts[i];
        break;
      }
    }

    if (!isPhysicalUp) {
      const out = [
        `Pinging ${target} with 32 bytes of data:`,
        'PING: transmit failed. General failure.',
        'PING: transmit failed. General failure.',
        'PING: transmit failed. General failure.',
        'PING: transmit failed. General failure.',
        '',
        `Ping statistics for ${target}:`,
        '    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),',
      ].join('\n');
      return {
        result: {
          stdout: out,
          exitCode: 1,
          outcome: 'TRANSMIT_FAIL_NO_CARRIER',
        },
        updatedState: nextState,
      };
    }

    // Physical is UP
    if (target === '192.168.1.1') {
      // Dynamic ARP resolution occurs if not already in ARP table
      const newArpTable = {
        ...hostA.arpTable,
        '192.168.1.1': {
          mac: '00-1A-2B-3C-4D-01',
          type: 'dynamic' as const,
          learnedAtTick: nextLogicalClock,
        },
      };

      const emittedFrames: EthernetFrame[] = [
        {
          sourceMac: '00-1A-2B-3C-4D-10',
          destMac: 'FF-FF-FF-FF-FF-FF',
          etherType: '0x0806',
          payloadHex: '0001080006040001001A2B3C4D10C0A8010A000000000000C0A80101',
          fcsValid: true,
          description: 'ARP Request Broadcast: Who has 192.168.1.1? Tell 192.168.1.10',
        },
        {
          sourceMac: '00-1A-2B-3C-4D-01',
          destMac: '00-1A-2B-3C-4D-10',
          etherType: '0x0806',
          payloadHex: '0001080006040002001A2B3C4D01C0A80101001A2B3C4D10C0A8010A',
          fcsValid: true,
          description: 'ARP Reply Unicast: 192.168.1.1 is at 00-1A-2B-3C-4D-01',
        },
        {
          sourceMac: '00-1A-2B-3C-4D-10',
          destMac: '00-1A-2B-3C-4D-01',
          etherType: '0x0800',
          payloadHex: '4500003C1C46000080010000C0A8010AC0A8010108004D5800010001',
          fcsValid: true,
          description: 'IPv4 ICMP Echo Request (32 bytes data)',
        },
        {
          sourceMac: '00-1A-2B-3C-4D-01',
          destMac: '00-1A-2B-3C-4D-10',
          etherType: '0x0800',
          payloadHex: '4500003C1C47000040010000C0A80101C0A8010A0000555800010001',
          fcsValid: true,
          description: 'IPv4 ICMP Echo Reply (32 bytes data)',
        },
      ];

      const out = [
        `Pinging ${target} with 32 bytes of data:`,
        `Reply from ${target}: bytes=32 time<1ms TTL=64`,
        `Reply from ${target}: bytes=32 time<1ms TTL=64`,
        `Reply from ${target}: bytes=32 time<1ms TTL=64`,
        `Reply from ${target}: bytes=32 time<1ms TTL=64`,
        '',
        `Ping statistics for ${target}:`,
        '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),',
      ].join('\n');

      return {
        result: {
          stdout: out,
          exitCode: 0,
          outcome: 'SUCCESS',
          emittedFrames,
        },
        updatedState: {
          ...nextState,
          devices: {
            ...nextState.devices,
            'host-a': {
              ...hostA,
              arpTable: newArpTable,
            },
          },
          packetTrace: [...nextState.packetTrace, ...emittedFrames],
        },
      };
    } else {
      // Off-link or non-existent IP on local subnet
      const out = [
        `Pinging ${target} with 32 bytes of data:`,
        'Request timed out.',
        'Request timed out.',
        'Request timed out.',
        'Request timed out.',
        '',
        `Ping statistics for ${target}:`,
        '    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),',
      ].join('\n');
      return {
        result: {
          stdout: out,
          exitCode: 1,
          outcome: 'REQUEST_TIMED_OUT',
        },
        updatedState: nextState,
      };
    }
  }

  // 7. UNKNOWN COMMAND
  const err = `'${rawCommand.trim()}' is not recognized as an internal or external command,\noperable program or batch file.`;
  return {
    result: {
      stdout: err,
      exitCode: 9009,
      outcome: 'UNKNOWN_COMMAND',
    },
    updatedState: nextState,
  };
}
