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
