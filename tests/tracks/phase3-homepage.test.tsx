import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import TrackSelector from '../../src/components/tracks/TrackSelector';

/**
 * Phase 3 (Task 3.1) — the landing page renders server-side without regressions:
 * the hero headline, the interactive lens shell (both tabs, the Re-run control
 * and its honest placeholder), the feature badges and both track cards are all
 * in the static HTML. The continuity card is deliberately absent here: it reads
 * localStorage in an effect, so it can never appear in server markup.
 *
 * The island's continuity card consumes the auth context (its own storage key
 * depends on the user id) — stubbed so this SSR render matches a guest visit.
 */
vi.mock('../../src/components/providers/AuthProvider', () => ({
  useAuth: () => ({ user: null, isAuthPending: false, signOut: async () => {} }),
}));

describe('homepage hero render (Task 3.1)', () => {
  const html = renderToStaticMarkup(<TrackSelector />);

  it('leads with the new headline and keeps both track cards', () => {
    expect(html).toContain(
      'Master the Data Layer: From Bare-Metal SQL to Type-Safe Prisma ORM.',
    );
    expect(html).toContain('Choose your track');
    expect(html).toContain('SQLens — 57 Days of Hands-On SQL');
    expect(html).toContain('PrismaLens — 14 Days of Prisma ORM');
  });

  it('embeds the interactive lens shell with both sample tabs', () => {
    expect(html).toContain('Generated SQL Lens');
    expect(html).toContain('Prisma — findUnique + include');
    expect(html).toContain('Raw SQL — JOIN');
    expect(html).toContain('Re-run');
  });

  it('shows the feature badges as server-rendered proof', () => {
    expect(html).toContain('Zero setup');
    expect(html).toContain('Typed by design');
    expect(html).toContain('ERDs on demand');
    expect(html).toContain('SQL Lens');
  });

  it('never renders a resume card on the server (it waits for real progress)', () => {
    expect(html).not.toContain('Continue where you left off');
    expect(html).not.toContain('% Complete');
    // The only "Resume" in server markup is the static footer hint.
    expect(html).toContain('hit Resume on your roadmap');
  });
});
