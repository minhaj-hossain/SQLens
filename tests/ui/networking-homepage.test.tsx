import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NetworkingHomePage } from '@/components/learning/networking/homepage/NetworkingHomePage';

describe('NetworkingHomePage Component', () => {
  it('renders the homepage with active links for all 6 completed modules', () => {
    const html = renderToStaticMarkup(<NetworkingHomePage />);

    // Check Hero and Track branding
    expect(html).toContain('Learn networking by');
    expect(html).toContain('building it.');
    expect(html).toContain('6 Days Live');

    // Modules 1 to 6 MUST have valid accessible hrefs
    expect(html).toContain('href="/networking/learn/net-01"');
    expect(html).toContain('href="/networking/learn/net-02"');
    expect(html).toContain('href="/networking/learn/net-03"');
    expect(html).toContain('href="/networking/learn/net-04"');
    expect(html).toContain('href="/networking/learn/net-05"');
    expect(html).toContain('href="/networking/learn/net-06"');

    // Stage names must be present
    expect(html).toContain('Foundations');
    expect(html).toContain('Routing');

    // View switcher controls
    expect(html).toContain('Topology Tree');
    expect(html).toContain('Module Cards');

    // Clean navbar track labels and 35 Days Track hero badge
    expect(html).toContain('>SQL<');
    expect(html).toContain('>Prisma<');
    expect(html).not.toContain('Playground');
    expect(html).not.toContain('SQL Track (57 Days)');
    expect(html).toContain('35 Days Track');
  });

  it('renders module titles and roadmap tree elements', () => {
    const html = renderToStaticMarkup(<NetworkingHomePage />);

    // Day 4, 5, 6 titles in tree micro-labels or accessible attributes
    expect(html).toContain('Day 4: The Router: Connecting Networks (Available)');
    expect(html).toContain('Day 5: Static Routes: Reaching Distant Networks (Available)');
    expect(html).toContain('Day 6: The Default Route: Leaving the Network (Available)');
  });
});
