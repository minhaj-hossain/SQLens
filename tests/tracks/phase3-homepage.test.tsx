import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import TrackSelector from '../../src/components/tracks/TrackSelector';

/**
 * Phase 6 (Task 6.1) — the Click landing page renders server-side without regressions:
 * the hero headline and monospace overline, both interactive SVG diagrams (SQL query/result
 * and Prisma schema/autocomplete), both track cards with day badges, and the dedicated
 * multi-column Click footer are all present in the static HTML. The continuity card
 * is deliberately absent on first-time visits as it awaits client localStorage hydration.
 *
 * Auth is stubbed so this SSR render matches a guest visit.
 */
vi.mock('../../src/components/providers/AuthProvider', () => ({
  useAuth: () => ({ user: null, isAuthPending: false, signOut: async () => {} }),
}));

describe('Click Homepage render via TrackSelector (Task 6.1)', () => {
  const html = renderToStaticMarkup(<TrackSelector />);

  it('renders Click overline, headline, and subtitle value proposition', () => {
    expect(html).toContain('WHEN CONCEPTS FINALLY CLICK');
    expect(html).toContain('Learn the data layer by running it.');
    expect(html).toContain('Hands-on tracks. A real engine. All in your browser.');
  });

  it('renders SQL track card with interactive query/result diagram and link', () => {
    expect(html).toContain('href="/sql"');
    expect(html).toContain('SQL');
    expect(html).toContain('57 days');
    expect(html).toContain('From SELECT to production engineering');
    expect(html).toContain('query.sql');
    expect(html).toContain('SELECT');
    expect(html).toContain('JOIN');
    expect(html).toContain('result');
    expect(html).toContain('Ava');
  });

  it('renders Prisma track card with schema/autocomplete diagram and link', () => {
    expect(html).toContain('href="/prisma"');
    expect(html).toContain('Prisma');
    expect(html).toContain('14 days');
    expect(html).toContain('Schema modeling and type-safe database access');
    expect(html).toContain('schema.prisma');
    expect(html).toContain('model');
    expect(html).toContain('app.ts');
    expect(html).toContain('prisma');
    expect(html).toContain('.user.');
  });

  it('renders the Click multi-column footer with copyright and links', () => {
    expect(html).toContain('data-testid="click-footer"');
    expect(html).toContain('When concepts finally click.');
    expect(html).toContain('TRACKS');
    expect(html).toContain('PROJECT');
    expect(html).toContain('© 2026 Click');
  });

  it('never renders a resume card on the server for guest visits (waits for client progress hydration)', () => {
    expect(html).not.toContain('Continue where you left off');
    expect(html).not.toContain('% Complete');
  });

  it('applies the design system styling classes (.tile, .bg-dot-grid, .flink, 1120px)', () => {
    expect(html).toContain('tile');
    expect(html).toContain('bg-dot-grid');
    expect(html).toContain('flink');
    expect(html).toContain('max-w-[1120px]');
  });
});
