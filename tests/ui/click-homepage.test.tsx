import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ClickHomepage } from '../../src/components/home/ClickHomepage';
import { SqlDiagramSvg, PrismaDiagramSvg } from '../../src/components/home/TrackDiagrams';

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

  it('applies the design system styling classes (.tile, .bg-dot-grid, max-w-[1120px])', () => {
    expect(html).toContain('tile');
    expect(html).toContain('bg-dot-grid');
    expect(html).toContain('max-w-[1120px]');
  });

  it('renders ClickFooter with brand tagline and copyright', () => {
    expect(html).toContain('data-testid="click-footer"');
    expect(html).toContain('When concepts finally click.');
    expect(html).toContain('© 2026 Click');
  });

  it('renders returning learner resume card when progress exists', () => {
    const resumeHtml = renderToStaticMarkup(
      <ClickHomepage
        initialProgress={{
          track: 'sql',
          trackLabel: 'SQL',
          dayNumber: 5,
          dayTitle: 'Filtering with WHERE',
          totalDays: 57,
          completedDays: 4,
          percent: 7,
          resumeUrl: '/sql/learn/day-05/practice/where-clause?task=1',
        }}
      />,
    );
    expect(resumeHtml).toContain('id="returning-learner-card"');
    expect(resumeHtml).toContain('SQL Track');
    expect(resumeHtml).toContain('Day 5 of 57');
    expect(resumeHtml).toContain('Filtering with WHERE');
    expect(resumeHtml).toContain('7% Completed');
    expect(resumeHtml).toContain('href="/sql/learn/day-05/practice/where-clause?task=1"');
    expect(resumeHtml).toContain('Resume Learning');
  });
});

describe('TrackDiagrams SVG components', () => {
  it('renders SqlDiagramSvg with query.sql, JOIN code, and sorted result table', () => {
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
});
