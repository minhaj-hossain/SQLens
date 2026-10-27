import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ClickHomepage } from '../../src/components/home/ClickHomepage';
import { SqlDiagramSvg, PrismaDiagramSvg, NetworkingDiagramSvg } from '../../src/components/home/TrackDiagrams';

describe('ClickHomepage Component', () => {
  const html = renderToStaticMarkup(<ClickHomepage />);

  it('renders the complete Hero typography and value proposition', () => {
    expect(html).toContain('WHEN CONCEPTS FINALLY CLICK');
    expect(html).toContain('Learn the data layer by running it.');
    expect(html).toContain('Hands-on tracks. A real engine. All in your browser.');
  });

  it('renders the SQL track card with link, meta, and description', () => {
    expect(html).toContain('href="/sql"');
    expect(html).toContain('SQL');
    expect(html).toContain('57 days');
    expect(html).toContain('From SELECT to production engineering');
  });

  it('renders the Prisma track card with link, meta, and description', () => {
    expect(html).toContain('href="/prisma"');
    expect(html).toContain('Prisma');
    expect(html).toContain('14 days');
    expect(html).toContain('Schema modeling and type-safe database access');
  });

  it('renders the Networking track card with link, meta, and description', () => {
    expect(html).toContain('href="/networking"');
    expect(html).toContain('Networking');
    expect(html).toContain('35 days');
    expect(html).toContain('Physical reality of packets, cables, routing tables &amp; sockets');
    expect(html).toContain('Packet Simulation');
  });

  it('applies the design system styling classes (.tile, .bg-dot-grid, max-w-[1120px], bg-ink, text-text)', () => {
    expect(html).toContain('tile');
    expect(html).toContain('bg-dot-grid');
    expect(html).toContain('max-w-[1120px]');
    expect(html).toContain('bg-ink');
    expect(html).toContain('text-text');
    expect(html).toContain('border-func/30');
    expect(html).toContain('text-func');
    expect(html).toContain('border-[#4ade80]/30');
    expect(html).toContain('text-[#4ade80]');
  });

  it('renders ClickFooter with brand tagline and copyright', () => {
    expect(html).toContain('data-testid="click-footer"');
    expect(html).toContain('When concepts finally click.');
    expect(html).toContain('© 2026 Click');
  });

  it('does not render progress or returning-learner-card on the landing homepage', () => {
    expect(html).not.toContain('returning-learner-card');
    expect(html).not.toContain('resume-learning-btn');
    expect(html).not.toContain('returning-learner-section');
  });
});

describe('TrackDiagrams SVG components', () => {
  it('renders SqlDiagramSvg with query.sql, JOIN code, and sorted result table with theme tokens', () => {
    const sqlHtml = renderToStaticMarkup(<SqlDiagramSvg />);
    expect(sqlHtml).toContain('query.sql');
    expect(sqlHtml).toContain('SELECT');
    expect(sqlHtml).toContain('orders');
    expect(sqlHtml).toContain('JOIN');
    expect(sqlHtml).toContain('customers');
    expect(sqlHtml).toContain('result');
    expect(sqlHtml).toContain('Ava');
    expect(sqlHtml).toContain('420');
    expect(sqlHtml).toContain('Liam');
    expect(sqlHtml).toContain('310');
    expect(sqlHtml).toContain('var(--func)');
    expect(sqlHtml).toContain('var(--surface-2)');
    expect(sqlHtml).toContain('var(--border)');
  });

  it('renders PrismaDiagramSvg with schema.prisma, model User, and app.ts autocomplete', () => {
    const prismaHtml = renderToStaticMarkup(<PrismaDiagramSvg />);
    expect(prismaHtml).toContain('schema.prisma');
    expect(prismaHtml).toContain('model');
    expect(prismaHtml).toContain('User');
    expect(prismaHtml).toContain('@id');
    expect(prismaHtml).toContain('app.ts');
    expect(prismaHtml).toContain('prisma');
    expect(prismaHtml).toContain('.user.');
    expect(prismaHtml).toContain('email');
    expect(prismaHtml).toContain('string');
  });

  it('renders NetworkingDiagramSvg with terminal ping, ICMP packet badge, and topology decoder', () => {
    const netHtml = renderToStaticMarkup(<NetworkingDiagramSvg />);
    expect(netHtml).toContain('terminal');
    expect(netHtml).toContain('ping 192.168.1.1');
    expect(netHtml).toContain('ttl=64');
    expect(netHtml).toContain('ICMP');
    expect(netHtml).toContain('topology');
    expect(netHtml).toContain('PC1');
    expect(netHtml).toContain('R1 GATEWAY');
    expect(netHtml).toContain('192.168.1.10');
    expect(netHtml).toContain('192.168.1.1');
    expect(netHtml).toContain('LAYER 2/3 FRAME DECODE');
  });
});
