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

  it('Day 13 progressively reveals loops, broadcast storms, BPDUs, Root Bridge, and blocked port', () => {
    // Step 0: Loop and storm active
    const htmlStep0 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-13"
        activeStepIndex={0}
        completedSteps={new Set()}
      />
    );
    expect(htmlStep0).toContain('SPANNING TREE PROTOCOL (IEEE 802.1D) · REDUNDANT LINKS &amp; LOOP PREVENTION');
    expect(htmlStep0).toContain('LAYER 2 LOOP DETECTED ⚠');
    expect(htmlStep0).toContain('REDUNDANT LINK (ACTIVE LOOP)');

    // Step 1: MAC Flapping
    const htmlStep1 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-13"
        activeStepIndex={1}
        completedSteps={new Set([0])}
      />
    );
    expect(htmlStep1).toContain('SWITCH SW1 · MAC TABLE FLAPPING LOG');
    expect(htmlStep1).toContain('Table Thrashing · 100% Bandwidth Saturation');

    // Step 2: BPDU Exchange
    const htmlStep2 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-13"
        activeStepIndex={2}
        completedSteps={new Set([0, 1])}
      />
    );
    expect(htmlStep2).toContain('IEEE 802.1D BPDU EXCHANGE ACTIVE');
    expect(htmlStep2).toContain('01:80:C2:00:00:00 (Multicast)');

    // Step 3: Root Bridge Election
    const htmlStep3 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-13"
        activeStepIndex={3}
        completedSteps={new Set([0, 1, 2])}
      />
    );
    expect(htmlStep3).toContain('ROOT BRIDGE ELECTION CONVERGED');
    expect(htmlStep3).toContain('★ ROOT BRIDGE ★ (Lowest BID)');
    expect(htmlStep3).toContain('Winner: SW1 (Lowest MAC: AA:BB:CC:00:00:01)');

    // Step 4: Blocked Port & Converged Tree
    const htmlStep4 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-13"
        activeStepIndex={4}
        completedSteps={new Set([0, 1, 2, 3])}
      />
    );
    expect(htmlStep4).toContain('TOPOLOGY CONVERGED · LOOP BROKEN ✓');
    expect(htmlStep4).toContain('✕ BLK');
    expect(htmlStep4).toContain('STANDBY LINK (SW3:P2 BLOCKED)');

    // Step 5: Recap
    const htmlStep5 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-13"
        activeStepIndex={5}
        completedSteps={new Set([0, 1, 2, 3, 4])}
      />
    );
    expect(htmlStep5).toContain('THE 4 RULES OF SPANNING TREE PROTOCOL');
    expect(htmlStep5).toContain('Next: Stage 5 · Day 14: ICMP and TTL (How Ping Works at Layer 3)');
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

  it('renders expand/restore button in floating toolbar when onToggleExpand is provided', () => {
    const handleToggle = () => {};
    // Normal mode (collapsed)
    const htmlCollapsed = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-04"
        activeStepIndex={0}
        completedSteps={new Set()}
        isExpanded={false}
        onToggleExpand={handleToggle}
      />
    );
    expect(htmlCollapsed).toContain('Expand canvas to full workspace');
    expect(htmlCollapsed).toContain('Expand');

    // Expanded mode
    const htmlExpanded = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-04"
        activeStepIndex={0}
        completedSteps={new Set()}
        isExpanded={true}
        onToggleExpand={handleToggle}
      />
    );
    expect(htmlExpanded).toContain('Exit full canvas (Esc)');
    expect(htmlExpanded).toContain('Restore');
  });

  it('ensures progressive reveal components across Days 7-13 maintain clear non-overlapping positioning', () => {
    // Day 7: ARP Reply callout positioned clear of ARP Cache HUD
    const htmlDay7 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-07"
        activeStepIndex={2}
        completedSteps={new Set([0, 1])}
      />
    );
    expect(htmlDay7).toContain('translate(370, 295)');
    expect(htmlDay7).toContain('ARP CACHE · PC1');

    // Day 8: Aging timer and recap positioned clear of PC2
    const htmlDay8Step4 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-08"
        activeStepIndex={4}
        completedSteps={new Set([0, 1, 2, 3])}
      />
    );
    expect(htmlDay8Step4).toContain('translate(685, 345)');

    const htmlDay8Step5 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-08"
        activeStepIndex={5}
        completedSteps={new Set([0, 1, 2, 3, 4])}
      />
    );
    expect(htmlDay8Step5).toContain('translate(685, 335)');

    // Day 9: Step 5 recap positioned centrally under Router R1, clear of PC4
    const htmlDay9 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-09"
        activeStepIndex={5}
        completedSteps={new Set([0, 1, 2, 3, 4])}
      />
    );
    expect(htmlDay9).toContain('translate(643, 385)');

    // Day 10: VLAN 20 filtered badge cleared past switch port labels
    const htmlDay10 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-10"
        activeStepIndex={3}
        completedSteps={new Set([0, 1, 2])}
      />
    );
    expect(htmlDay10).toContain('translate(650, 260)');

    // Day 12: Trunk stick badge raised to (560, 155), clearing the hairpin tags at y=230
    const htmlDay12 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-12"
        activeStepIndex={4}
        completedSteps={new Set([0, 1, 2, 3])}
      />
    );
    expect(htmlDay12).toContain('translate(560, 155)');
    expect(htmlDay12).toContain('translate(615, 230)');
  });

  it('Day 14 renders 4-hop multi-router topology and progressive reveals for ICMP, TTL, Traceroute, and PMTUD', () => {
    // Step 0: Initial ping exchange
    const htmlStep0 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-14"
        activeStepIndex={0}
        completedSteps={new Set()}
      />
    );
    expect(htmlStep0).toContain('ICMP &amp; TTL · LAYER 3 DIAGNOSTICS &amp; PATH DISCOVERY');
    expect(htmlStep0).toContain('4-HOP MULTI-ROUTER TRANSIT PATH');
    expect(htmlStep0).toContain('PC1');
    expect(htmlStep0).toContain('192.168.1.10/24');
    expect(htmlStep0).toContain('ROUTER R1 (GATEWAY)');
    expect(htmlStep0).toContain('ROUTER R2 (TRANSIT)');
    expect(htmlStep0).toContain('ROUTER ISP (UPSTREAM)');
    expect(htmlStep0).toContain('Web Server');
    expect(htmlStep0).toContain('198.51.100.10/24');
    expect(htmlStep0).toContain('ICMP Type 8 (Echo Request) →');
    expect(htmlStep0).toContain('← ICMP Type 0 (Echo Reply)');
    expect(htmlStep0).toContain('ICMP PROTOCOL 1 (RFC 792) · ECHO');
    expect(htmlStep0).toContain('ROUND-TRIP DIAGNOSTIC PACKET FLOW');

    // Step 1: TTL decrementing at each hop
    const htmlStep1 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-14"
        activeStepIndex={1}
        completedSteps={new Set([0])}
      />
    );
    expect(htmlStep1).toContain('TTL = 64 (PC1)');
    expect(htmlStep1).toContain('TTL: 64 → 63 (-1 hop)');
    expect(htmlStep1).toContain('TTL: 63 → 62 (-1 hop)');
    expect(htmlStep1).toContain('Server gets TTL=61');
    expect(htmlStep1).toContain('IPv4 HEADER INSPECTOR (SHOW PACKET HEADER)');

    // Step 2: TTL=0 dropped and ICMP Type 11 returned
    const htmlStep2 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-14"
        activeStepIndex={2}
        completedSteps={new Set([0, 1])}
      />
    );
    expect(htmlStep2).toContain('✕ DROPPED AT R1: TTL EXPIRED (0)');
    expect(htmlStep2).toContain('← ICMP Type 11 (Time Exceeded) from 192.168.1.1');
    expect(htmlStep2).toContain('ROUTER TTL EXPIRATION BEHAVIOR');
    expect(htmlStep2).toContain('ICMP TYPE 11 ERROR DIAGNOSTIC');

    // Step 3: Traceroute algorithm with 4 sequential hops
    const htmlStep3 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-14"
        activeStepIndex={3}
        completedSteps={new Set([0, 1, 2])}
      />
    );
    expect(htmlStep3).toContain('Hop 1 · 192.168.1.1 (1.2ms)');
    expect(htmlStep3).toContain('Hop 2 · 10.0.0.2 (4.8ms)');
    expect(htmlStep3).toContain('Hop 3 · 203.0.113.2 (11.5ms)');
    expect(htmlStep3).toContain('Hop 4 · 198.51.100.10 (18.2ms)');
    expect(htmlStep3).toContain('THE TRACEROUTE ALGORITHM');
    expect(htmlStep3).toContain('TRACEROUTE HOP DISCOVERY TABLE');
    expect(htmlStep3).toContain('PATH TELEMETRY METRICS');

    // Step 4: PMTUD and ICMP Type 3 Code 4 bottleneck
    const htmlStep4 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-14"
        activeStepIndex={4}
        completedSteps={new Set([0, 1, 2, 3])}
      />
    );
    expect(htmlStep4).toContain('⚠ BOTTLENECK: MTU 1400 WAN LINK');
    expect(htmlStep4).toContain('✕ DROPPED: 1500B EXCEEDS MTU 1400 (DF=1)');
    expect(htmlStep4).toContain('← ICMP Type 3 Code 4 (Next-Hop MTU: 1400)');
    expect(htmlStep4).toContain('PATH MTU DISCOVERY (RFC 1191)');
    expect(htmlStep4).toContain('THE PMTUD BLACK HOLE DANGER');
    expect(htmlStep4).toContain('PATH MTU SEGMENT ANALYSIS');

    // Step 5: Recap
    const htmlStep5 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-14"
        activeStepIndex={5}
        completedSteps={new Set([0, 1, 2, 3, 4])}
      />
    );
    expect(htmlStep5).toContain('ICMP MESSAGE TYPE CHEAT SHEET');
    expect(htmlStep5).toContain('THE 4 CORE RULES OF ICMP &amp; TTL');
    expect(htmlStep5).toContain('LAYER 3 PROTOCOL METRICS');
  });

  it('ensures Day 14 canvas coordinates strictly prevent component overlaps', () => {
    const html = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-14"
        activeStepIndex={3}
        completedSteps={new Set([0, 1, 2])}
      />
    );
    // Link labels cleared 60px above cables (y=190 vs cable y=250)
    expect(html).toContain('translate(269, 190)');
    expect(html).toContain('translate(613, 190)');
    expect(html).toContain('translate(943, 190)');
    expect(html).toContain('translate(1243, 190)');

    // Hop discovery tags positioned above routers at y=145
    expect(html).toContain('translate(443, 145)');
    expect(html).toContain('translate(783, 145)');
    expect(html).toContain('translate(1103, 145)');
    expect(html).toContain('translate(1364, 145)');

    // Bottom diagnostic HUD cards strictly clear the 94px device envelope (y=360 vs device y=220..314)
    expect(html).toContain('translate(70, 360)');
    expect(html).toContain('translate(380, 360)');
    expect(html).toContain('translate(1040, 360)');

    // Step 4: Verify Bottleneck Alert is staggered at y=100 so it does not collide with Drop Warning at y=140
    const htmlStep4 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-14"
        activeStepIndex={4}
        completedSteps={new Set([0, 1, 2, 3])}
      />
    );
    expect(htmlStep4).toContain('translate(943, 100)');
    expect(htmlStep4).toContain('translate(783, 140)');
    // ICMP Type 3 Code 4 badge constrained to 174px width to clear R1 (x=506) and R2 (x=720) by 20px
    expect(htmlStep4).toContain('width="174"');

    // Step 2: Verify ICMP Type 11 badge is constrained to 180px width for 21px clearance from PC1 and R1
    const htmlStep2 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-14"
        activeStepIndex={2}
        completedSteps={new Set([0, 1])}
      />
    );
    expect(htmlStep2).toContain('width="180"');

    // Step 0: Verify Echo Reply badge is constrained to 154px width for 20px clearance from R2 and ISP
    const htmlStep0 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-14"
        activeStepIndex={0}
        completedSteps={new Set()}
      />
    );
    expect(htmlStep0).toContain('width="154"');
  });

  it('Day 15 renders 4-hop transcontinental/transatlantic topology and progressive reveals for Traceroute', () => {
    // Step 0: Initial 3 probes per hop
    const htmlStep0 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-15"
        activeStepIndex={0}
        completedSteps={new Set()}
      />
    );
    expect(htmlStep0).toContain(
      'TRANSCONTINENTAL &amp; SUBSEA PATH TRACE (SF ↔ DEN ↔ NYC ↔ FRA)'
    );
    expect(htmlStep0).toContain('PC1 (SF)');
    expect(htmlStep0).toContain('192.168.1.10/24');
    expect(htmlStep0).toContain('ROUTER R1 (SF GATEWAY)');
    expect(htmlStep0).toContain('ROUTER R2 (DENVER HUB)');
    expect(htmlStep0).toContain('ROUTER R3 (NYC BACKBONE)');
    expect(htmlStep0).toContain('Web Server (Frankfurt)');
    expect(htmlStep0).toContain('198.51.100.10/24');
    expect(htmlStep0).toContain('Hop 1 · 1.182, 1.145, 1.198ms');
    expect(htmlStep0).toContain('3-PROBE MECHANISM &amp; TELEMETRY');
    expect(htmlStep0).toContain(
      'MULTI-HOP 3-PROBE TELEMETRY TABLE (TRACEROUTE 198.51.100.10)'
    );
    expect(htmlStep0).toContain('PROBING PROTOCOL COMPARISON');

    // Step 1: Fiber link telemetry and propagation delay
    const htmlStep1 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-15"
        activeStepIndex={1}
        completedSteps={new Set([0])}
      />
    );
    expect(htmlStep1).toContain('1,620 km Fiber (SF-Denver)');
    expect(htmlStep1).toContain('2,850 km DWDM (Denver-NYC)');
    expect(htmlStep1).toContain('5,800 km Subsea');
    expect(htmlStep1).toContain('OPTICAL FIBER PROPAGATION LAWS');
    expect(htmlStep1).toContain(
      'FIBER DISTANCE &amp; LATENCY CORRELATION (SHOW FIBER LINKS)'
    );
    expect(htmlStep1).toContain('DIAGNOSTIC RULE OF THUMB');

    // Step 2: CoPP and * * * rate limiting
    const htmlStep2 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-15"
        activeStepIndex={2}
        completedSteps={new Set([0, 1])}
      />
    );
    expect(htmlStep2).toContain('⚠ COPP ICMP SUPPRESSION ACTIVE');
    expect(htmlStep2).toContain('Hop 3 · * * * (CoPP)');
    expect(htmlStep2).toContain('DATA PLANE VS CONTROL PLANE');
    expect(htmlStep2).toContain(
      'CONTROL PLANE POLICING (COPP) ANALYSIS (TRACEROUTE 198.51.100.50)'
    );
    expect(htmlStep2).toContain('WHY ROUTERS DROP ICMP');

    // Step 3: Asymmetric routing reverse path
    const htmlStep3 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-15"
        activeStepIndex={3}
        completedSteps={new Set([0, 1, 2])}
      />
    );
    expect(htmlStep3).toContain('← AS64510 (Amsterdam)');
    expect(htmlStep3).toContain('← AS64520 (Chicago)');
    expect(htmlStep3).toContain('THE ASYMMETRIC PARADOX');
    expect(htmlStep3).toContain(
      'BGP ASYMMETRIC ROUTE INSPECTION (SHOW RETURN PATH)'
    );
    expect(htmlStep3).toContain('HOW TO MAP THE FULL PATH');

    // Step 4: Recap
    const htmlStep4 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-15"
        activeStepIndex={4}
        completedSteps={new Set([0, 1, 2, 3])}
      />
    );
    expect(htmlStep4).toContain('TRACEROUTE METRICS CHEAT SHEET');
    expect(htmlStep4).toContain(
      'THE 4 CORE RULES OF TRACEROUTE &amp; INTERNET PATHS'
    );
    expect(htmlStep4).toContain('GLOBAL PATH TELEMETRY');
  });

  it('ensures Day 15 canvas coordinates strictly prevent component overlaps', () => {
    // Step 0: Hop discovery tags positioned above routers at y=145
    const htmlStep0 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-15"
        activeStepIndex={0}
        completedSteps={new Set()}
      />
    );
    // Link distance labels cleared 60px above cables (y=190 vs cable y=250)
    expect(htmlStep0).toContain('translate(269, 190)');
    expect(htmlStep0).toContain('translate(613, 190)');
    expect(htmlStep0).toContain('translate(943, 190)');
    expect(htmlStep0).toContain('translate(1243, 190)');

    expect(htmlStep0).toContain('translate(443, 145)');
    expect(htmlStep0).toContain('translate(783, 145)');
    expect(htmlStep0).toContain('translate(1103, 145)');
    expect(htmlStep0).toContain('translate(1364, 145)');

    // Bottom diagnostic HUD cards strictly clear the 94px device envelope (y=360 vs device y=220..314)
    expect(htmlStep0).toContain('translate(70, 360)');
    expect(htmlStep0).toContain('translate(380, 360)');
    expect(htmlStep0).toContain('translate(1040, 360)');

    // Step 2: Verify CoPP alert is staggered at y=100 with 45px vertical clearance above Hop 3 tag at y=145
    const htmlStep2 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-15"
        activeStepIndex={2}
        completedSteps={new Set([0, 1])}
      />
    );
    expect(htmlStep2).toContain('translate(1103, 100)');
    expect(htmlStep2).toContain('translate(1103, 145)');

    // Step 3: Verify reverse path badges are positioned along the overhead arc at y=105 strictly clearing all router chassis and port pills
    const htmlStep3 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-15"
        activeStepIndex={3}
        completedSteps={new Set([0, 1, 2])}
      />
    );
    expect(htmlStep3).toContain('translate(1040, 105)');
    expect(htmlStep3).toContain('translate(680, 105)');
  });

  it('Day 16 renders 2-hop LAN/WAN transit topology and progressive reveals for Ports & Sockets', () => {
    // Step 0: Host vs Process Delivery
    const htmlStep0 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-16"
        activeStepIndex={0}
        completedSteps={new Set()}
      />
    );
    expect(htmlStep0).toContain(
      'LAYER 4 TRANSPORT MULTIPLEXING · PORTS &amp; SOCKETS'
    );
    expect(htmlStep0).toContain('PC1 (Client)');
    expect(htmlStep0).toContain('192.168.1.10/24');
    expect(htmlStep0).toContain('GATEWAY R1');
    expect(htmlStep0).toContain('Web Server');
    expect(htmlStep0).toContain('198.51.100.10/24');
    expect(htmlStep0).toContain('LAN Access Link (Gigabit Ethernet)');
    expect(htmlStep0).toContain('Datacenter Transit Link (10 GbE)');
    expect(htmlStep0).toContain('Running Apps: Browser, SSH, Discord');
    expect(htmlStep0).toContain('LISTENING PORTS (SS -TLPN)');
    expect(htmlStep0).toContain('HOST VS PROCESS ADDRESSING');
    expect(htmlStep0).toContain('ACTIVE LISTENING SOCKETS (SS -TLPN)');
    expect(htmlStep0).toContain('THE BIND() &amp; LISTEN() SYSTEM CALLS');

    // Step 1: Port Number Hierarchy (RFC 6335)
    const htmlStep1 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-16"
        activeStepIndex={1}
        completedSteps={new Set([0])}
      />
    );
    expect(htmlStep1).toContain(
      'RFC 6335 PORT NUMBER SPECTRUM (16-BIT INTEGER: 0 TO 65535)'
    );
    expect(htmlStep1).toContain('WELL-KNOWN: 0–1023');
    expect(htmlStep1).toContain('REGISTERED: 1024–49151');
    expect(htmlStep1).toContain('EPHEMERAL: 49152–65535');
    expect(htmlStep1).toContain('PORT HIERARCHY RULES');
    expect(htmlStep1).toContain(
      'IANA PORT ALLOCATION TIERS (SHOW IP-PORT-RANGE)'
    );
    expect(htmlStep1).toContain('SECURITY &amp; CAP_NET_BIND_SERVICE');

    // Step 2: The Socket 5-Tuple & Demultiplexing
    const htmlStep2 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-16"
        activeStepIndex={2}
        completedSteps={new Set([0, 1])}
      />
    );
    expect(htmlStep2).toContain('Tab 1: 192.168.1.10:52101 → :443');
    expect(htmlStep2).toContain('Tab 2: 192.168.1.10:52102 → :443');
    expect(htmlStep2).toContain('Port 443 Demux: 2 Active Streams');
    expect(htmlStep2).toContain(
      'Tab 1: 192.168.1.10:52101 → 198.51.100.10:443 [TCP ACK]'
    );
    expect(htmlStep2).toContain('THE SOCKET 5-TUPLE');
    expect(htmlStep2).toContain(
      'CONCURRENT CONNECTION DEMULTIPLEXING (SS -T4)'
    );
    expect(htmlStep2).toContain('KERNEL SOCKET HASH TABLE');

    // Step 3: Transport Header Anatomy & Closed Ports
    const htmlStep3 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-16"
        activeStepIndex={3}
        completedSteps={new Set([0, 1, 2])}
      />
    );
    expect(htmlStep3).toContain('TCP / UDP TRANSPORT HEADER (FIRST 4 BYTES)');
    expect(htmlStep3).toContain('SOURCE PORT (16 BITS / 2 BYTES)');
    expect(htmlStep3).toContain('DESTINATION PORT (16 BITS / 2 BYTES)');
    expect(htmlStep3).toContain('Port 80 [HTTP]: OPEN → SYN-ACK');
    expect(htmlStep3).toContain('Port 81 [TCP]: CLOSED → TCP RST');
    expect(htmlStep3).toContain('OPEN VS CLOSED PORTS');
    expect(htmlStep3).toContain(
      'PORT PROBING TELEMETRY (NC -ZV 198.51.100.10 80 81)'
    );
    expect(htmlStep3).toContain('HOW PORT SCANNERS WORK (SYN VS RST)');

    // Step 4: Recap
    const htmlStep4 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-16"
        activeStepIndex={4}
        completedSteps={new Set([0, 1, 2, 3])}
      />
    );
    expect(htmlStep4).toContain('LAYER 4 CHEAT SHEET');
    expect(htmlStep4).toContain(
      'THE 4 CORE RULES OF PORTS, SOCKETS &amp; TRANSPORT MULTIPLEXING'
    );
    expect(htmlStep4).toContain('TRANSPORT METRICS');
  });

  it('ensures Day 16 canvas coordinates strictly prevent component overlaps', () => {
    // Step 0: Initial layout
    const htmlStep0 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-16"
        activeStepIndex={0}
        completedSteps={new Set()}
      />
    );
    // Link labels cleared 60px above cables (y=190 vs cable y=250)
    expect(htmlStep0).toContain('translate(454, 190)');
    expect(htmlStep0).toContain('translate(1013, 190)');

    // App and service badges above devices
    expect(htmlStep0).toContain('translate(140, 130)');
    expect(htmlStep0).toContain('translate(1220, 110)');

    // Bottom diagnostic HUD cards strictly clear the 94px device envelope (y=360 vs device y=220..314)
    expect(htmlStep0).toContain('translate(70, 360)');
    expect(htmlStep0).toContain('translate(380, 360)');
    expect(htmlStep0).toContain('translate(1040, 360)');

    // Step 1: Overhead spectrum container position
    const htmlStep1 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-16"
        activeStepIndex={1}
        completedSteps={new Set([0])}
      />
    );
    expect(htmlStep1).toContain('translate(440, 65)');

    // Step 2: In-flight packet badge width is constrained to 340px to ensure >=15px clearance on Cable 2 (span 806..1220)
    const htmlStep2 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-16"
        activeStepIndex={2}
        completedSteps={new Set([0, 1])}
      />
    );
    expect(htmlStep2).toContain('translate(1013, 250)');
    expect(htmlStep2).toContain('width="340"');

    // Step 3: Overhead header layout card at translate(440, 65)
    const htmlStep3 = renderToStaticMarkup(
      <NetworkingCanvas
        dayId="net-16"
        activeStepIndex={3}
        completedSteps={new Set([0, 1, 2])}
      />
    );
    expect(htmlStep3).toContain('translate(440, 65)');
    expect(htmlStep3).toContain('translate(1220, 115)');
  });
});


