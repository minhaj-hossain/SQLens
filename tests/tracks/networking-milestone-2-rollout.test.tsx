import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NET_04_MODULE } from '../../src/content/networking/modules/net-04';
import { NET_05_MODULE } from '../../src/content/networking/modules/net-05';
import { NET_06_MODULE } from '../../src/content/networking/modules/net-06';
import { NetworkingPracticeTaskView } from '../../src/components/learning/networking/NetworkingPracticeTaskView';
import { VirtualTerminalSimulator } from '../../src/components/learning/networking/VirtualTerminalSimulator';
import { calculateSubnet } from '../../src/components/learning/networking/SubnetBitSlicer';
import { macToEui64, toSolicitedNodeMulticast } from '../../src/components/learning/networking/Ipv6NdpSimulator';
import { gradeNetworkingSubmission } from '../../src/lib/network-engine/networking-submit-pipeline';

describe('Milestone 2 — Addressing, Subnetting & ARP Architecture', () => {
  it('verifies Module 4 contains IPv4 addressing, binary AND masking, and CIDR sizing', () => {
    expect(NET_04_MODULE.concepts).toHaveLength(3);
    const conceptIds = NET_04_MODULE.concepts.map((c) => c.id);
    expect(conceptIds).toEqual([
      'why-ip-addresses-exist',
      'subnet-masks-and-binary-and',
      'cidr-notation-and-exceptions',
    ]);
  });

  it('verifies Module 5 contains ARP exchange, cache management, and asymmetric mask mismatch', () => {
    expect(NET_05_MODULE.concepts).toHaveLength(3);
    const conceptIds = NET_05_MODULE.concepts.map((c) => c.id);
    expect(conceptIds).toEqual([
      'arp-request-reply',
      'arp-cache-and-garp',
      'mask-mismatch-asymmetric',
    ]);
  });

  it('verifies Module 6 contains IPv6 compression, address scopes, and NDP/SLAAC', () => {
    expect(NET_06_MODULE.concepts).toHaveLength(3);
    const conceptIds = NET_06_MODULE.concepts.map((c) => c.id);
    expect(conceptIds).toEqual([
      'ipv6-notation-compression',
      'ipv6-address-scopes',
      'ndp-and-slaac',
    ]);
  });

  it('verifies all concepts possess robust explanations, key takeaways, and valid MCQs', () => {
    const allConcepts = [
      ...NET_04_MODULE.concepts,
      ...NET_05_MODULE.concepts,
      ...NET_06_MODULE.concepts,
    ];
    expect(allConcepts).toHaveLength(9);

    for (const concept of allConcepts) {
      expect(concept.theory.summary.length).toBeGreaterThan(20);
      expect(concept.theory.explanation.length).toBeGreaterThanOrEqual(3);
      expect(concept.theory.mcqs).toBeDefined();
      expect(concept.theory.mcqs!.length).toBeGreaterThanOrEqual(1);
      for (const mcq of concept.theory.mcqs!) {
        expect(mcq.options.length).toBeGreaterThanOrEqual(3);
        expect(mcq.correctIndex).toBeGreaterThanOrEqual(0);
        expect(mcq.correctIndex).toBeLessThan(mcq.options.length);
        expect(mcq.explanation.length).toBeGreaterThan(10);
      }
    }
  });
});

describe('Milestone 2 — Dual-OS CLI Terminal Diagnostics (Tickets #104, #105, #107)', () => {
  it('validates Ticket #104 in Module 4 provides dual Windows and Linux IP addressing diagnostics', () => {
    const task = NET_04_MODULE.concepts[0].tasks.find((t) => t.id === 'net04-p1-ip-need');
    expect(task).toBeDefined();
    expect(task!.terminal).toBeDefined();

    const term = task!.terminal!;
    expect(term.availableCommands).toContain('netsh interface ip show config');
    expect(term.availableCommands).toContain('ipconfig /all');
    expect(term.availableCommands).toContain('ip -4 addr show');

    // Windows verification
    expect(term.commandResponses['netsh interface ip show config']).toContain('IP Address:                           192.168.1.100');
    expect(term.commandResponses['netsh interface ip show config']).toContain('Default Gateway:                      192.168.1.1');
    expect(term.commandResponses['ipconfig /all']).toContain('Physical Address. . . . . . . . . : 00-1A-2B-3C-4D-40');
    expect(term.commandResponses['ipconfig /all']).toContain('192.168.1.100(Preferred)');

    // Linux verification
    expect(term.commandResponses['ip -4 addr show']).toContain('inet 192.168.1.100/24');
    expect(term.commandResponses['ip -4 addr show']).toContain('scope global eth0');
  });

  it('validates Ticket #105 in Module 5 provides dual Windows and Linux mask mismatch diagnostics', () => {
    const task = NET_05_MODULE.concepts[2].tasks.find((t) => t.id === 'net05-p3-mask-mismatch-diagnosis');
    expect(task).toBeDefined();
    expect(task!.terminal).toBeDefined();

    const term = task!.terminal!;
    expect(term.availableCommands).toContain('ipconfig');
    expect(term.availableCommands).toContain('ip addr show eth0');
    expect(term.availableCommands).toContain('ip route show table local');

    // Windows verification
    expect(term.commandResponses['ipconfig']).toContain('Subnet Mask . . . . . . . . . . . : 255.255.255.0');
    expect(term.commandResponses['ipconfig']).toContain('10.0.1.5');

    // Linux verification
    expect(term.commandResponses['ip addr show eth0']).toContain('inet 10.0.1.100/16');
    expect(term.commandResponses['ip route show table local']).toContain('local 10.0.1.100 dev eth0');
  });

  it('validates Ticket #107 in Module 6 provides dual Windows and Linux IPv6 link-local diagnostics', () => {
    const task = NET_06_MODULE.concepts[1].tasks.find((t) => t.id === 'net06-p2-scope-classification');
    expect(task).toBeDefined();
    expect(task!.terminal).toBeDefined();

    const term = task!.terminal!;
    expect(term.availableCommands).toContain('ipconfig');
    expect(term.availableCommands).toContain('ping -6 fe80::1%12');
    expect(term.availableCommands).toContain('ip -6 addr show');
    expect(term.availableCommands).toContain('ip -6 neigh show');

    // Windows verification
    expect(term.commandResponses['ipconfig']).toContain('fe80::1abc:2def%12');
    expect(term.commandResponses['ping -6 fe80::1%12']).toContain('Reply from fe80::1%12');

    // Linux verification
    expect(term.commandResponses['ip -6 addr show']).toContain('inet6 fe80::1abc:2def/64 scope link');
    expect(term.commandResponses['ip -6 neigh show']).toContain('fe80::1 dev eth0 lladdr');
  });
});

describe('Milestone 2 — Cognitive Fading & Interactive Lab Mechanics', () => {
  it('validates SubnetBitSlicer calculation engine precision for /26 and /22 active octets', () => {
    const sub26 = calculateSubnet('192.168.10.130', 26);
    expect(sub26.networkDotted).toBe('192.168.10.128');
    expect(sub26.broadcastDotted).toBe('192.168.10.191');
    expect(sub26.usableHosts).toBe(62);
    expect(sub26.activeOctet).toBe(4);

    const sub22 = calculateSubnet('10.50.14.73', 22);
    expect(sub22.networkDotted).toBe('10.50.12.0');
    expect(sub22.broadcastDotted).toBe('10.50.15.255');
    expect(sub22.usableHosts).toBe(1022);
    expect(sub22.activeOctet).toBe(3);
  });

  it('validates IPv6 EUI-64 and solicited-node multicast derivation logic', () => {
    const eui = macToEui64('00:1A:2B:3C:4D:5E');
    expect(eui.invertedFirstOctet).toBe('02');
    expect(eui.linkLocal).toContain('fe80::');

    const multi = toSolicitedNodeMulticast('2001:db8::1:ffaa:bbcc');
    expect(multi.solicitedMulticast).toBe('ff02::1:ffaa:bbcc');
    expect(multi.multicastMac).toBe('33:33:FF:AA:BB:CC');
  });

  it('renders VirtualTerminalSimulator in static markup without errors', () => {
    const task = NET_04_MODULE.concepts[0].tasks[0];
    const html = renderToStaticMarkup(
      <VirtualTerminalSimulator
        scenario={task.terminal}
        availableCommands={task.terminal?.availableCommands}
        onCommandExecuted={vi.fn()}
      />
    );
    expect(html).toContain('Interactive Command-Line Diagnostics Lab');
    expect(html).toContain('netsh interface ip show config');
  });
});
