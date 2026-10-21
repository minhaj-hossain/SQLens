import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NET_07_MODULE } from '../../src/content/networking/modules/net-07';
import { NET_08_MODULE } from '../../src/content/networking/modules/net-08';
import { NetworkingPracticeTaskView } from '../../src/components/learning/networking/NetworkingPracticeTaskView';
import { gradeNetworkingSubmission } from '../../src/lib/network-engine/networking-submit-pipeline';

describe('Milestone 3 — Internetwork Routing & Gateways Architecture (Modules 7 & 8)', () => {
  it('verifies Module 7 contains Default Gateways, Longest Prefix Match, and TTL Loop Mitigation', () => {
    expect(NET_07_MODULE.concepts).toHaveLength(3);
    const conceptIds = NET_07_MODULE.concepts.map((c) => c.id);
    expect(conceptIds).toEqual([
      'default-gateways-and-mac-rewriting',
      'routing-tables-and-lpm',
      'ttl-and-loop-mitigation',
    ]);
  });

  it('verifies Module 8 contains RFC 1918 NAT Terminology, Port Address Translation (PAT), and Return De-NATting', () => {
    expect(NET_08_MODULE.concepts).toHaveLength(3);
    const conceptIds = NET_08_MODULE.concepts.map((c) => c.id);
    expect(conceptIds).toEqual([
      'why-nat-and-terminology',
      'port-address-translation-pat',
      'nat-return-flows-and-security',
    ]);
  });

  it('verifies all 6 concepts implement complete 3-beat physical causality theories and valid MCQs', () => {
    const allConcepts = [...NET_07_MODULE.concepts, ...NET_08_MODULE.concepts];
    expect(allConcepts).toHaveLength(6);

    for (const concept of allConcepts) {
      expect(concept.theory.summary.length).toBeGreaterThan(25);
      expect(concept.theory.keyTakeaway.length).toBeGreaterThan(20);

      // Verify 3-beat causality structure
      const fullText = concept.theory.explanation.join('\n');
      expect(fullText).toContain('Beat 1');
      expect(fullText).toContain('Beat 2');
      expect(fullText).toContain('Beat 3');

      // Verify MCQs
      expect(concept.theory.mcqs).toBeDefined();
      expect(concept.theory.mcqs!.length).toBeGreaterThanOrEqual(2);
      for (const mcq of concept.theory.mcqs!) {
        expect(mcq.options.length).toBeGreaterThanOrEqual(3);
        expect(mcq.correctIndex).toBeGreaterThanOrEqual(0);
        expect(mcq.correctIndex).toBeLessThan(mcq.options.length);
        expect(mcq.explanation.length).toBeGreaterThan(15);
      }
    }
  });
});

describe('Milestone 3 — Dual-Platform Diagnostic Terminals (Tickets #108, #109, #110)', () => {
  it('validates Ticket #108 in Module 7 Concept 1 provides dual Windows and Linux routing table diagnostics', () => {
    const task = NET_07_MODULE.concepts[0].tasks.find((t) => t.id === 'net07-p1-remote-gateway-arp');
    expect(task).toBeDefined();
    expect(task!.terminal).toBeDefined();

    const term = task!.terminal!;
    expect(term.title).toContain('Ticket #108');
    expect(term.availableCommands).toContain('route print');
    expect(term.availableCommands).toContain('ipconfig');
    expect(term.availableCommands).toContain('ip route show default');
    expect(term.availableCommands).toContain('ip route show');
    expect(term.availableCommands).toContain('ping 192.168.1.1');

    // Windows verification
    expect(term.commandResponses['route print']).toContain('0.0.0.0          0.0.0.0      192.168.1.1');
    expect(term.commandResponses['ipconfig']).toContain('Default Gateway . . . . . . . . . : 192.168.1.1');

    // Linux verification
    expect(term.commandResponses['ip route show default']).toContain('default via 192.168.1.1 dev eth0');
    expect(term.commandResponses['ip route show']).toContain('192.168.1.0/24 dev eth0 proto kernel');
    expect(term.commandResponses['ping 192.168.1.1']).toContain('TTL=64');
  });

  it('validates Ticket #109 in Module 7 Concept 3 provides dual Windows tracert and Linux traceroute path diagnostics', () => {
    const task = NET_07_MODULE.concepts[2].tasks.find((t) => t.id === 'net07-p3-ttl-loop-mitigation');
    expect(task).toBeDefined();
    expect(task!.terminal).toBeDefined();

    const term = task!.terminal!;
    expect(term.title).toContain('Ticket #109');
    expect(term.availableCommands).toContain('tracert -d 8.8.8.8');
    expect(term.availableCommands).toContain('ping -i 1 8.8.8.8');
    expect(term.availableCommands).toContain('traceroute -n 8.8.8.8');
    expect(term.availableCommands).toContain('ping -c 2 -t 1 8.8.8.8');
    expect(term.availableCommands).toContain('ip route get 8.8.8.8');

    // Windows verification
    expect(term.commandResponses['tracert -d 8.8.8.8']).toContain('1    <1 ms    <1 ms    <1 ms  192.168.1.1');
    expect(term.commandResponses['tracert -d 8.8.8.8']).toContain('Trace complete.');
    expect(term.commandResponses['ping -i 1 8.8.8.8']).toContain('Reply from 192.168.1.1: TTL expired in transit.');

    // Linux verification
    expect(term.commandResponses['traceroute -n 8.8.8.8']).toContain('1  192.168.1.1');
    expect(term.commandResponses['ping -c 2 -t 1 8.8.8.8']).toContain('From 192.168.1.1 icmp_seq=1 Time to live exceeded');
  });

  it('validates Ticket #110 in Module 8 Concept 2 provides Cisco IOS and Linux conntrack NAT state table diagnostics', () => {
    const task = NET_08_MODULE.concepts[1].tasks.find((t) => t.id === 'net08-p2-pat-port-multiplexing');
    expect(task).toBeDefined();
    expect(task!.terminal).toBeDefined();

    const term = task!.terminal!;
    expect(term.title).toContain('Ticket #110');
    expect(term.availableCommands).toContain('show ip nat translations');
    expect(term.availableCommands).toContain('show ip nat statistics');
    expect(term.availableCommands).toContain('conntrack -L');
    expect(term.availableCommands).toContain('iptables -t nat -L -v -n');

    // Cisco IOS verification
    expect(term.commandResponses['show ip nat translations']).toContain('198.51.100.1:49152 192.168.1.10:49152');
    expect(term.commandResponses['show ip nat translations']).toContain('198.51.100.1:49153 192.168.1.20:49152');
    expect(term.commandResponses['show ip nat statistics']).toContain('Total active translations: 3');

    // Linux conntrack verification
    expect(term.commandResponses['conntrack -L']).toContain('dport=49153 [ASSURED]');
    expect(term.commandResponses['iptables -t nat -L -v -n']).toContain('MASQUERADE');
  });
});

describe('Milestone 3 — Packet Invariance & Routing State Forensics', () => {
  it('validates Hop-by-Hop MAC rewriting vs End-to-End IP preservation in Module 7', () => {
    const task = NET_07_MODULE.concepts[0].tasks[0];
    expect(task.packetInspection).toBeDefined();
    const snapshots = task.packetInspection!.snapshots;
    expect(snapshots).toHaveLength(2);

    // Hop 1: Host to Router
    expect(snapshots[0].layer3.srcIp).toBe('192.168.1.10');
    expect(snapshots[0].layer3.dstIp).toBe('198.51.100.50');
    expect(snapshots[0].layer3.ttl).toBe(64);
    expect(snapshots[0].layer2.srcMac).toBe('AA:AA:AA:AA:AA:AA');
    expect(snapshots[0].layer2.dstMac).toBe('00:00:5E:00:53:01'); // Gateway MAC

    // Hop 2: Router to Server
    expect(snapshots[1].layer3.srcIp).toBe('192.168.1.10'); // IP PRESERVED
    expect(snapshots[1].layer3.dstIp).toBe('198.51.100.50'); // IP PRESERVED
    expect(snapshots[1].layer3.ttl).toBe(63); // TTL DECREMENTED
    expect(snapshots[1].layer2.srcMac).toBe('00:00:5E:00:53:02'); // MAC REWRITTEN
    expect(snapshots[1].layer2.dstMac).toBe('ZZ:ZZ:ZZ:ZZ:ZZ:ZZ'); // MAC REWRITTEN
  });

  it('validates Inside Local to Inside Global address translation in Module 8', () => {
    const task = NET_08_MODULE.concepts[0].tasks[0];
    expect(task.packetInspection).toBeDefined();
    const snapshots = task.packetInspection!.snapshots;
    expect(snapshots).toHaveLength(2);

    // Segment 1 (Inside LAN)
    expect(snapshots[0].layer3.srcIp).toBe('10.50.1.25'); // Inside Local
    expect(snapshots[0].layer4.srcPort).toBe(52140);
    expect(snapshots[0].layer3.dstIp).toBe('198.51.100.4'); // Outside Global

    // Segment 2 (Outside WAN)
    expect(snapshots[1].layer3.srcIp).toBe('203.0.113.10'); // Inside Global (Rewritten)
    expect(snapshots[1].layer4.srcPort).toBe(41000); // Port Rewritten
    expect(snapshots[1].layer3.dstIp).toBe('198.51.100.4'); // Outside Global Preserved
  });
});

describe('Milestone 3 — Judgment Grader & UI Static Markup Parity', () => {
  it('correctly grades all milestone 3 guided tasks with reference answer vectors', () => {
    const tasks = [
      NET_07_MODULE.concepts[0].tasks[0], // net07-p1: [1, 1]
      NET_07_MODULE.concepts[1].tasks[0], // net07-p2: [1, 1]
      NET_07_MODULE.concepts[2].tasks[0], // net07-p3: [1, 1]
      NET_08_MODULE.concepts[0].tasks[0], // net08-p1: [1, 1]
      NET_08_MODULE.concepts[1].tasks[0], // net08-p2: [1, 1]
      NET_08_MODULE.concepts[2].tasks[0], // net08-p3: [1, 1]
    ];

    for (const task of tasks) {
      const res = gradeNetworkingSubmission({
        task,
        judgmentAnswers: [1, 1],
      });
      expect(res.passed, `Failed task ${task.id}`).toBe(true);
    }
  });

  it('renders NetworkingPracticeTaskView to static markup with terminal simulators without error', () => {
    const taskWithTerminal = NET_07_MODULE.concepts[0].tasks[0];
    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={taskWithTerminal}
        isCompleted={false}
        onComplete={vi.fn()}
      />,
    );
    expect(html).toContain('Ticket #108');
    expect(html).toContain('route print');
    expect(html).toContain('Cross-Hop Header Inspection');
  });
});
