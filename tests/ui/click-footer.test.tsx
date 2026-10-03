import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ClickFooter } from '../../src/components/layout/ClickFooter';

describe('ClickFooter Component', () => {
  const html = renderToStaticMarkup(<ClickFooter />);

  it('renders semantic footer element with testid', () => {
    expect(html).toContain('<footer');
    expect(html).toContain('data-testid="click-footer"');
    expect(html).toContain('border-t');
    expect(html).toContain('border-[#121d33]');
  });

  it('renders Click brand logo and wordmark linked to /', () => {
    expect(html).toContain('href="/"');
    expect(html).toContain('aria-label="Click Homepage"');
    expect(html).toContain('Click');
    // SVG cursor logo path presence
    expect(html).toContain('M10 7V21L14 17L17 24L19.5 23L16.5 16.3H22Z');
  });

  it('renders the brand tagline', () => {
    expect(html).toContain('When concepts finally click.');
  });

  it('renders the TRACKS column with links to /sql and /prisma', () => {
    expect(html).toContain('TRACKS');
    expect(html).toContain('href="/sql"');
    expect(html).toContain('SQL');
    expect(html).toContain('href="/prisma"');
    expect(html).toContain('Prisma');
  });

  it('renders the PROJECT column with About and Feedback links', () => {
    expect(html).toContain('PROJECT');
    expect(html).toContain('href="#about"');
    expect(html).toContain('About');
    expect(html).toContain('href="#feedback"');
    expect(html).toContain('Feedback');
  });

  it('renders the copyright notice and border separator', () => {
    expect(html).toContain('© 2026 Click');
    expect(html).toContain('border-t border-[#121d33]');
  });

  it('applies the .flink transition class to navigation links', () => {
    expect(html).toContain('flink');
  });

  it('uses unified 1120px max-width container', () => {
    expect(html).toContain('max-w-[1120px]');
  });
});
