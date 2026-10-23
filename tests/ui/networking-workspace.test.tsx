import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NetworkingWorkspace } from '@/components/learning/networking/workspace/NetworkingWorkspace';
import { NET_01_MODULE, NET_02_MODULE, NET_03_MODULE } from '@/content/networking';

describe('NetworkingWorkspace Component', () => {
  it('renders Day 1 workspace with canvas, terminal prompt, and lesson card', () => {
    const html = renderToStaticMarkup(
      <NetworkingWorkspace module={NET_01_MODULE} />
    );

    // Header title
    expect(html).toContain('Day 1 · The First Link &amp; Hardware Identity');
    // Step indicator & group tag
    expect(html).toContain('Idea 1 of 5 · The connection');
    expect(html).toContain('The cable: the physical link');
    // Command code snippet
    expect(html).toContain('link status');
    // Terminal prompt
    expect(html).toContain('PC1&gt;');
    expect(html).toContain('Terminal · PC1');
  });

  it('renders Day 2 workspace with IP addressing content', () => {
    const html = renderToStaticMarkup(
      <NetworkingWorkspace module={NET_02_MODULE} />
    );

    expect(html).toContain('Day 2 · IP Addressing: Networks and Hosts');
    expect(html).toContain('The subnet mask: splitting the address');
    expect(html).toContain('subnet');
  });

  it('renders Day 3 workspace with Subnetting content', () => {
    const html = renderToStaticMarkup(
      <NetworkingWorkspace module={NET_03_MODULE} />
    );

    expect(html).toContain('Day 3 · Subnetting: Splitting a Network');
    expect(html).toContain('Prefix length: a shorter way to write the mask');
    expect(html).toContain('cidr');
  });
});
