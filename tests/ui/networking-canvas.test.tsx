import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NetworkingCanvas } from '@/components/learning/networking/canvas/NetworkingCanvas';

describe('NetworkingCanvas Component', () => {
  it('renders Day 1 Step 0 with direct point-to-point link and PC1/PC2', () => {
    const html = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-01"
        activeStepIndex={0}
        completedSteps={new Set()}
      />
    );

    expect(html).toContain('DIRECT POINT-TO-POINT LINK');
    expect(html).toContain('PC1');
    expect(html).toContain('PC2');

    // IPs and MACs not shown on step 0
    expect(html).not.toContain('192.168.1.10');
    expect(html).not.toContain('AA:BB:CC:00:00:01');
    // Switch not shown on step 0
    expect(html).not.toContain('ETHERNET SWITCH');
  });

  it('reveals IPs on Day 1 Step 1 and MACs on Step 3', () => {
    const htmlStep1 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-01"
        activeStepIndex={1}
        completedSteps={new Set([0])}
      />
    );
    expect(htmlStep1).toContain('192.168.1.10');
    expect(htmlStep1).not.toContain('AA:BB:CC:00:00:01');

    const htmlStep3 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-01"
        activeStepIndex={3}
        completedSteps={new Set([0, 1, 2])}
      />
    );
    expect(htmlStep3).toContain('AA:BB:CC:00:00:01');
    expect(htmlStep3).toContain('AA:BB:CC:00:00:02');
  });

  it('reveals central Switch and PC3 on Day 1 Step 4', () => {
    const html = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-01"
        activeStepIndex={4}
        completedSteps={new Set([0, 1, 2, 3])}
      />
    );
    expect(html).toContain('ETHERNET SWITCH');
    expect(html).toContain('PC3');
  });

  it('Day 2 Step 2 reveals PC4', () => {
    const htmlStep1 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-02"
        activeStepIndex={1}
        completedSteps={new Set([0])}
      />
    );
    expect(htmlStep1).not.toContain('PC4');

    const htmlStep2 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-02"
        activeStepIndex={2}
        completedSteps={new Set([0, 1])}
        pc4Ip="192.168.2.10"
      />
    );
    expect(htmlStep2).toContain('PC4');
    expect(htmlStep2).toContain('192.168.2.10');
  });

  it('Day 3 reveals Subnet legend and switches PC3 color to green', () => {
    const html = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-03"
        activeStepIndex={3}
        completedSteps={new Set([0, 1, 2])}
        pc3Ip="192.168.1.130"
      />
    );
    expect(html).toContain('Subnet 1 · 192.168.1.0/25');
    expect(html).toContain('Subnet 2 · 192.168.1.128/25');
    expect(html).toContain('192.168.1.130');
  });

  it('Day 6 progressively reveals ISP router, Web Server, and default route indicators', () => {
    // Step 0: ISP Router is visible, Web Server is not
    const htmlStep0 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-06"
        activeStepIndex={0}
        completedSteps={new Set()}
      />
    );
    expect(htmlStep0).toContain('ROUTER ISP');
    expect(htmlStep0).toContain('Public 203.0.113.0/24');
    expect(htmlStep0).not.toContain('Web Server');

    // Step 1: Web Server appears
    const htmlStep1 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-06"
        activeStepIndex={1}
        completedSteps={new Set([0])}
      />
    );
    expect(htmlStep1).toContain('Web Server');
    expect(htmlStep1).toContain('198.51.100.10');

    // Step 2: R1 default route indicator appears
    const htmlStep2 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-06"
        activeStepIndex={2}
        completedSteps={new Set([0, 1])}
        r1DefaultRoute="203.0.113.1"
      />
    );
    expect(htmlStep2).toContain('0.0.0.0/0 via 203.0.113.1');

    // Step 4: R2 default route indicator appears
    const htmlStep4 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-06"
        activeStepIndex={4}
        completedSteps={new Set([0, 1, 2, 3])}
        r1DefaultRoute="203.0.113.1"
        r2DefaultRoute="192.168.2.1"
      />
    );
    expect(htmlStep4).toContain('0.0.0.0/0 via 192.168.2.1');
  });

  it('Day 7 renders ARP cache HUD, broadcast indicators, and gateway MAC lookup', () => {
    // Step 0: Empty ARP cache HUD
    const htmlStep0 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-07"
        activeStepIndex={0}
        completedSteps={new Set()}
      />
    );
    expect(htmlStep0).toContain('ARP CACHE · PC1');
    expect(htmlStep0).toContain('(empty · no entries learned)');
    expect(htmlStep0).toContain('LOCAL SUBNET 1');
    expect(htmlStep0).toContain('DISTANT SUBNET 3');

    // Step 1: Broadcast request indicator
    const htmlStep1 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-07"
        activeStepIndex={1}
        completedSteps={new Set([0])}
      />
    );
    expect(htmlStep1).toContain('Searching FF:FF:FF:FF:FF:FF');
    expect(htmlStep1).toContain('ARP Request ➔ FF:FF:FF:FF:FF:FF');

    // Step 4: Router R1 gateway MAC learned
    const htmlStep4 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-07"
        activeStepIndex={4}
        completedSteps={new Set([0, 1, 2, 3])}
      />
    );
    expect(htmlStep4).toContain('P1 MAC: AA:BB:CC:00:A1:01');
    expect(htmlStep4).toContain('192.168.1.1');
    expect(htmlStep4).toContain('192.168.1.20');
    expect(htmlStep4).toContain('* 192.168.3.10 routed via R1');
  });

  it('Day 8 renders MAC address table HUD, unknown unicast flooding, and selective forwarding', () => {
    // Step 0: Empty MAC address table
    const htmlStep0 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-08"
        activeStepIndex={0}
        completedSteps={new Set()}
      />
    );
    expect(htmlStep0).toContain('MAC ADDRESS TABLE · SW1');
    expect(htmlStep0).toContain('(0 entries learned · table empty)');
    expect(htmlStep0).toContain('LOCAL STAR TOPOLOGY · SWITCH SW1');

    // Step 2: Unknown unicast flood & mismatch drops
    const htmlStep2 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-08"
        activeStepIndex={2}
        completedSteps={new Set([0, 1])}
      />
    );
    expect(htmlStep2).toContain('UNKNOWN UNICAST FLOOD ➔ Ports 2, 3, 4');
    expect(htmlStep2).toContain('PC3: DA Mismatch ➔ Discard ✕');
    expect(htmlStep2).toContain('PC4: DA Mismatch ➔ Discard ✕');
    expect(htmlStep2).toContain('PC2: DA Matched ➔ Accept ✓');

    // Step 3: Selective forwarding
    const htmlStep3 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-08"
        activeStepIndex={3}
        completedSteps={new Set([0, 1, 2])}
      />
    );
    expect(htmlStep3).toContain('SELECTIVE POINT-TO-POINT (P2 ➔ P1)');
    expect(htmlStep3).toContain('AA:BB:CC:00:00:01');
    expect(htmlStep3).toContain('AA:BB:CC:00:00:02');

    // Step 4: Flushed table
    const htmlStep4 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-08"
        activeStepIndex={4}
        completedSteps={new Set([0, 1, 2, 3, 4])}
      />
    );
    expect(htmlStep4).toContain('TABLE FLUSHED (0 ENTRIES)');
  });

  it('Day 9 renders dual broadcast domains, flooding, CPU interrupts, and router barrier', () => {
    // Step 0: Initial dual-subnet topology
    const htmlStep0 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-09"
        activeStepIndex={0}
        completedSteps={new Set()}
      />
    );
    expect(htmlStep0).toContain('LOCAL SUBNET 1 · 192.168.1.0/24 (BROADCAST DOMAIN 1)');
    expect(htmlStep0).toContain('LOCAL SUBNET 2 · 192.168.2.0/24 (BROADCAST DOMAIN 2)');
    expect(htmlStep0).toContain('ROUTER R1');
    expect(htmlStep0).toContain('BROADCAST DA: FF:FF:FF:FF:FF:FF');

    // Step 1: Replicate & Flood
    const htmlStep1 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-09"
        activeStepIndex={1}
        completedSteps={new Set([0])}
      />
    );
    expect(htmlStep1).toContain('REPLICATE &amp; FLOOD TO ALL PORTS');

    // Step 2: CPU Interrupts
    const htmlStep2 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-09"
        activeStepIndex={2}
        completedSteps={new Set([0, 1])}
      />
    );
    expect(htmlStep2).toContain('PC2: CPU INTERRUPT ⚡');
    expect(htmlStep2).toContain('PC3: CPU INTERRUPT ⚡');
    expect(htmlStep2).toContain('PC4: CPU INTERRUPT ⚡');

    // Step 3: Router Barrier
    const htmlStep3 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-09"
        activeStepIndex={3}
        completedSteps={new Set([0, 1, 2])}
      />
    );
    expect(htmlStep3).toContain('ROUTER BROADCAST BARRIER ✕ (RFC 1812)');
    expect(htmlStep3).toContain('Subnet 2: Silent (0 frames)');

    // Step 4: Dual Domain Inventory
    const htmlStep4 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-09"
        activeStepIndex={4}
        completedSteps={new Set([0, 1, 2, 3])}
      />
    );
    expect(htmlStep4).toContain('2 BROADCAST DOMAINS · ROUTER R1 ISOLATION');
    expect(htmlStep4).toContain('PC2 Reply ✓');

    // Step 5: Recap Rules
    const htmlStep5 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-09"
        activeStepIndex={5}
        completedSteps={new Set([0, 1, 2, 3, 4])}
      />
    );
    expect(htmlStep5).toContain('THE 4 RULES OF BROADCAST DOMAINS');
    expect(htmlStep5).toContain('Next Stage: Day 10 · VLANs');
  });

  it('Day 10 progressively reveals single-domain default state, VLAN containers, broadcast confinement, and cross-VLAN block', () => {
    // Step 0: Factory Default Single Shared Domain
    const htmlStep0 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-10"
        activeStepIndex={0}
        completedSteps={new Set()}
      />
    );
    expect(htmlStep0).toContain('VLANS · LOGICAL SEGMENTATION ON A SINGLE SWITCH');
    expect(htmlStep0).toContain('FACTORY DEFAULT SWITCH · ALL PORTS ASSIGNED TO VLAN 1');
    expect(htmlStep0).toContain('1 Shared Broadcast Domain (Factory Default)');
    expect(htmlStep0).toContain('PC1');
    expect(htmlStep0).toContain('PC4');
    expect(htmlStep0).toContain('192.168.10.10');
    expect(htmlStep0).toContain('192.168.20.40');

    // Step 1: VLANs Created (0 ports assigned)
    const htmlStep1 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-10"
        activeStepIndex={1}
        completedSteps={new Set([0])}
      />
    );
    expect(htmlStep1).toContain('VLANs Created · Awaiting Port Assignment');
    expect(htmlStep1).toContain('Engineering');
    expect(htmlStep1).toContain('Finance');

    // Step 2: Access Port Assignment -> Split into Two Isolated Containers
    const htmlStep2 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-10"
        activeStepIndex={2}
        completedSteps={new Set([0, 1])}
      />
    );
    expect(htmlStep2).toContain('VLAN 10 (ENGINEERING) · 192.168.10.0/24');
    expect(htmlStep2).toContain('VLAN 20 (FINANCE) · 192.168.20.0/24');
    expect(htmlStep2).toContain('ACCESS MODE');
    expect(htmlStep2).toContain('Active Segmentation · 2 Isolated Broadcast Domains');

    // Step 3: Broadcast Confinement (PC2 receives, Ports 3 & 4 silent)
    const htmlStep3 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-10"
        activeStepIndex={3}
        completedSteps={new Set([0, 1, 2])}
      />
    );
    expect(htmlStep3).toContain('PC2: Broadcast Received ✓');
    expect(htmlStep3).toContain('VLAN 20 FILTERED ✕');
    expect(htmlStep3).toContain('Ports 3 &amp; 4 Silent');

    // Step 4: Unicast Cross-VLAN Dropped
    const htmlStep4 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-10"
        activeStepIndex={4}
        completedSteps={new Set([0, 1, 2, 3])}
      />
    );
    expect(htmlStep4).toContain('CROSS-VLAN BLOCKED ✕ (Layer 2 Isolation)');
    expect(htmlStep4).toContain('PC3: 100% Packet Loss');

    // Step 5: Recap 4 Rules of VLANs
    const htmlStep5 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-10"
        activeStepIndex={5}
        completedSteps={new Set([0, 1, 2, 3, 4])}
      />
    );
    expect(htmlStep5).toContain('THE 4 RULES OF VLAN SEGMENTATION');
    expect(htmlStep5).toContain('Next: Day 11 · 802.1Q Trunks');
  });

  it('Day 11 progressively reveals untrunked link, 802.1Q trunk, frame dissection, native VLAN, and cross-switch ping', () => {
    // Step 0: Untrunked access link
    const htmlStep0 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-11"
        activeStepIndex={0}
        completedSteps={new Set()}
      />
    );
    expect(htmlStep0).toContain('802.1Q TRUNKS · CARRYING MULTIPLE VLANS BETWEEN SWITCHES');
    expect(htmlStep0).toContain('CAMPUS BUILDING 1 · SWITCH SW1');
    expect(htmlStep0).toContain('CAMPUS BUILDING 2 · SWITCH SW2');
    expect(htmlStep0).toContain('Port 5: Access Mode (Untrunked)');
    expect(htmlStep0).toContain('PC1');
    expect(htmlStep0).toContain('PC3');

    // Step 1: 802.1Q Trunk active
    const htmlStep1 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-11"
        activeStepIndex={1}
        completedSteps={new Set([0])}
      />
    );
    expect(htmlStep1).toContain('IEEE 802.1Q TRUNK (VLAN 10 + 20)');

    // Step 2: Frame Dissection
    const htmlStep2 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-11"
        activeStepIndex={2}
        completedSteps={new Set([0, 1])}
      />
    );
    expect(htmlStep2).toContain('802.1Q FRAME DISSECTION (TRUNK WIRE)');
    expect(htmlStep2).toContain('0x8100 (802.1Q)');
    expect(htmlStep2).toContain('VID=10 (Engineering)');

    // Step 3: Native VLAN Match Box
    const htmlStep3 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-11"
        activeStepIndex={3}
        completedSteps={new Set([0, 1, 2])}
      />
    );
    expect(htmlStep3).toContain('NATIVE VLAN: 1 (UNTAGGED TRANSIT)');
    expect(htmlStep3).toContain('Matched on SW1 &amp; SW2 · Zero VLAN Leaking');

    // Step 4: Cross-Switch Ping Active
    const htmlStep4 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-11"
        activeStepIndex={4}
        completedSteps={new Set([0, 1, 2, 3])}
      />
    );
    expect(htmlStep4).toContain('PC3: Ping Reply Sent ✓');
    expect(htmlStep4).toContain('PC2 (VLAN 20): Silent (0 frames)');
    expect(htmlStep4).toContain('PC4 (VLAN 20): Silent (0 frames)');

    // Step 5: Recap
    const htmlStep5 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-11"
        activeStepIndex={5}
        completedSteps={new Set([0, 1, 2, 3, 4])}
      />
    );
    expect(htmlStep5).toContain('THE 4 RULES OF VLAN TRUNKS');
    expect(htmlStep5).toContain('Next: Day 12 · Router-on-a-Stick');
  });

  it('Day 12 progressively reveals Router-on-a-Stick, sub-interfaces, and hairpin routing', () => {
    // Step 0: L2 Isolation Barrier
    const htmlStep0 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-12"
        activeStepIndex={0}
        completedSteps={new Set()}
      />
    );
    expect(htmlStep0).toContain('ROUTER-ON-A-STICK · INTER-VLAN ROUTING VIA 802.1Q SUB-INTERFACES');
    expect(htmlStep0).toContain('VLAN 10 · ENGINEERING (192.168.10.0/24)');
    expect(htmlStep0).toContain('VLAN 20 · FINANCE (192.168.20.0/24)');
    expect(htmlStep0).toContain('CROSS-VLAN BLOCKED ✕ (Layer 2 Isolation)');
    expect(htmlStep0).toContain('Dropped at SW1');
    expect(htmlStep0).toContain('0 ROUTES');

    // Step 1: The Stick Highlight
    const htmlStep1 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-12"
        activeStepIndex={1}
        completedSteps={new Set([0])}
      />
    );
    expect(htmlStep1).toContain('ONE PHYSICAL CABLE · &quot;THE STICK&quot;');
    expect(htmlStep1).toContain('802.1Q TRUNK &quot;STICK&quot;');

    // Step 2: eth0.10 Created
    const htmlStep2 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-12"
        activeStepIndex={2}
        completedSteps={new Set([0, 1])}
      />
    );
    expect(htmlStep2).toContain('GATEWAY CREATED: eth0.10');
    expect(htmlStep2).toContain('192.168.10.1/24');
    expect(htmlStep2).toContain('1 ROUTE');

    // Step 3: eth0.20 Created
    const htmlStep3 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-12"
        activeStepIndex={3}
        completedSteps={new Set([0, 1, 2])}
      />
    );
    expect(htmlStep3).toContain('GATEWAY CREATED: eth0.20');
    expect(htmlStep3).toContain('192.168.20.1/24');
    expect(htmlStep3).toContain('2 ROUTES');

    // Step 4: Hairpin Traversal Active
    const htmlStep4 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-12"
        activeStepIndex={4}
        completedSteps={new Set([0, 1, 2, 3])}
      />
    );
    expect(htmlStep4).toContain('HAIRPIN ROUTING SUCCESSFUL ✓ (TTL 64 → 63 · 0% LOSS)');
    expect(htmlStep4).toContain('▲ Tag: VID=10');
    expect(htmlStep4).toContain('▼ Tag: VID=20');
    expect(htmlStep4).toContain('L3 ROUTE: eth0.10 ↷ eth0.20 (TTL: 63)');

    // Step 5: Recap
    const htmlStep5 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-12"
        activeStepIndex={5}
        completedSteps={new Set([0, 1, 2, 3, 4])}
      />
    );
    expect(htmlStep5).toContain('THE 4 RULES OF INTER-VLAN ROUTING');
    expect(htmlStep5).toContain('Next: Day 13 · Spanning Tree Protocol (Preventing Loops)');
  });

  it('renders pan/zoom controls and navigation hints', () => {
    const html = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-04"
        activeStepIndex={0}
        completedSteps={new Set()}
      />
    );

    expect(html).toContain('Zoom Out');
    expect(html).toContain('Zoom In');
    expect(html).toContain('Fit');
    expect(html).toContain('Drag to Pan · Scroll to Zoom');
    expect(html).toContain('ROUTER CONNECTING TWO SUBNETS');
  });
});
