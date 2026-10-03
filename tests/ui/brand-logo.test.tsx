import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { BrandLogo } from '../../src/components/ui/BrandLogo';

describe('BrandLogo component', () => {
  it('renders Click cursor logo and wordmark by default', () => {
    const html = renderToStaticMarkup(<BrandLogo />);
    expect(html).toContain('Click');
    // Path coordinates for pointer arrow
    expect(html).toContain('M10 7V21L14 17L17 24L19.5 23L16.5 16.3H22Z');
    // Path coordinates for radiating click rays
    expect(html).toContain('M10 3V1M6 4L4.5 2.5M6 8H4');
  });

  it('renders SQLens variant when explicitly requested', () => {
    const html = renderToStaticMarkup(<BrandLogo variant="sqlens" />);
    expect(html).toContain('SQL');
    expect(html).toContain('ens');
    // Lens circle
    expect(html).toContain('circle cx="12.5" cy="12.5" r="9"');
    // Not Click
    expect(html).not.toContain('Click');
  });

  it('hides text when showText is false', () => {
    const html = renderToStaticMarkup(<BrandLogo showText={false} />);
    expect(html).not.toContain('Click');
    expect(html).toContain('<svg');
  });

  it('supports sizing variants (sm, md, lg)', () => {
    const htmlSm = renderToStaticMarkup(<BrandLogo size="sm" />);
    const htmlMd = renderToStaticMarkup(<BrandLogo size="md" />);
    const htmlLg = renderToStaticMarkup(<BrandLogo size="lg" />);

    expect(htmlSm).toContain('width="22"');
    expect(htmlMd).toContain('width="26"');
    expect(htmlLg).toContain('width="34"');
  });

  it('merges custom className cleanly', () => {
    const html = renderToStaticMarkup(<BrandLogo className="custom-test-class" />);
    expect(html).toContain('custom-test-class');
  });
});
