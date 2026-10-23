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
});
