/**
 * Phase 4 / Task 4.2 — the shared day layout (TrackDayLayoutView).
 * ─────────────────────────────────────────────────────────────────────────────
 * 4.2.1 (first block): the extracted view renders the day chrome for BOTH
 * tracks straight from the registry (`Day 1 of 57` / `Day 1 of 14`), 404s ids
 * the track does not own, renders the in-place LockedDayNotice for a locked
 * day (Phase 4: the layout NEVER redirects — the `/learn/[dayId]` overview
 * page is gone) and keeps a day with a completion record reachable.
 *
 * 4.2.3 (third block): the retired `/learn/[dayId]` page is now a server
 * redirect to the day's FIRST CONCEPT lesson.
 *
 * 4.2.2 (static guard block): the two route layouts are thin delegates that
 * differ only in their `track` literal; the route inventory, the canonical
 * sitemap contract and the legacy redirect table are frozen.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import sitemap from '../../src/app/sitemap';
import { ALL_MODULES } from '../../src/content/curriculum-index';
import { PRISMA_MODULES } from '../../src/content/prisma/prisma-curriculum-index';
import { initialStateForTrack } from '../../src/lib/progress/track-storage';
import type { UserLearningState } from '../../src/types/progress';

/**
 * Mutable values the hoisted mocks read at render time. `vi.hoisted` is
 * required because `vi.mock` factories run before module imports (and before
 * top-level `const`s) — the classic ReferenceError trap.
 */
const h = vi.hoisted(() => ({
  params: { dayId: 'day-01' } as Record<string, string>,
  pathname: '/sql/learn/day-01',
  userState: null as unknown as UserLearningState,
  isProgressReady: true,
  replace: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  resetDatabase: vi.fn(),
  backToRoadmap: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: () => h.params,
  usePathname: () => h.pathname,
  useRouter: () => ({ replace: h.replace, push: vi.fn() }),
  redirect: (url: string) => h.redirect(url),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

vi.mock('../../src/components/providers/LearningProgressProvider', () => ({
  useLearning: () => ({ userState: h.userState, isProgressReady: h.isProgressReady }),
}));

vi.mock('../../src/components/providers/SqlExecutorProvider', () => ({
  useSqlExecutor: () => ({ resetDatabase: h.resetDatabase }),
}));

vi.mock('../../src/components/learn/use-learning-navigation', () => ({
  useLearningNavigation: () => ({ backToRoadmap: h.backToRoadmap }),
}));

import TrackDayLayoutView, {
  resolveDayLayoutState,
} from '../../src/components/learn/TrackDayLayoutView';
import SqlDayEntry from '../../src/app/(app)/sql/learn/[dayId]/page';
import PrismaDayEntry from '../../src/app/(app)/prisma/learn/[dayId]/page';

/** Renders the view with the given route mocks; returns static HTML. */
function render(track: 'sql' | 'prisma', dayId: string, pathname: string): string {
  h.params = { dayId };
  h.pathname = pathname;
  return renderToStaticMarkup(
    <TrackDayLayoutView track={track}>
      <p>CHILD-CONTENT-MARKER</p>
    </TrackDayLayoutView>,
  );
}

describe('Phase 4.2 — TrackDayLayoutView renders both tracks from the registry', () => {
  beforeEach(() => {
    h.params = { dayId: 'day-01' };
    h.pathname = '/sql/learn/day-01';
    h.userState = initialStateForTrack('sql');
    h.isProgressReady = true;
    h.replace.mockClear();
    h.resetDatabase.mockClear();
    h.backToRoadmap.mockClear();
  });

  it('renders the day chrome + children for an unlocked sql day (Day 1 of 57)', () => {
    const html = render('sql', 'day-01', '/sql/learn/day-01/theory/select-basics');
    expect(html).toContain('Roadmap');
    expect(html).toContain('Day 1 of 57');
    expect(html).toContain('CHILD-CONTENT-MARKER');
  });

  it('renders prisma days against the prisma curriculum (Day 1 of 14)', () => {
    h.userState = initialStateForTrack('prisma');
    const html = render('prisma', 'prisma-01', '/prisma/learn/prisma-01');
    expect(html).toContain('Day 1 of 14');
    expect(html).toContain('CHILD-CONTENT-MARKER');
  });

  it('isolates tracks: a foreign module id under a layout is a 404', () => {
    expect(() => render('sql', 'prisma-01', '/sql/learn/prisma-01')).toThrow('NEXT_NOT_FOUND');
    expect(() => render('prisma', 'day-01', '/prisma/learn/day-01')).toThrow('NEXT_NOT_FOUND');
  });

  it('an unknown dayId is a 404 for both tracks', () => {
    expect(() => render('sql', 'day-99', '/sql/learn/day-99')).toThrow('NEXT_NOT_FOUND');
    expect(() => render('prisma', 'prisma-99', '/prisma/learn/prisma-99')).toThrow(
      'NEXT_NOT_FOUND',
    );
  });

  it('a locked deep link renders the in-place locked notice (never a redirect)', () => {
    const html = render('sql', 'day-02', '/sql/learn/day-02/theory/where-and-intersection');
    expect(html).toContain('Day 2 is locked');
    expect(html).toContain('Back to Learning Path');
    expect(html).not.toContain('CHILD-CONTENT-MARKER');
    expect(h.replace).not.toHaveBeenCalled();
  });

  it('holds the exact route (no chrome) until progress is ready — even for an unlocked day', () => {
    // Phase 3: a signed-in refresh mounts with the seeded guest state (looks
    // empty) before the user snapshot lands. The layout must render nothing —
    // NOT bounce — until `isProgressReady`, so the refreshed task page survives.
    h.isProgressReady = false;
    const html = render('sql', 'day-01', '/sql/learn/day-01/theory/select-basics');
    expect(html).toBe('');
    expect(h.replace).not.toHaveBeenCalled();
  });

  it('a locked day keeps the day chrome (Roadmap + Day chip) around the notice', () => {
    const html = render('sql', 'day-02', '/sql/learn/day-02/theory/where-and-intersection');
    expect(html).toContain('Roadmap');
    expect(html).toContain('Day 2 of 57');
    expect(html).toContain('Day 2 is locked');
    expect(html).toContain('href="/sql"');
  });

  it('a completion record keeps a locked day reachable, deep links included', () => {
    h.userState = {
      ...initialStateForTrack('sql'),
      completedModules: {
        'day-02': { moduleId: 'day-02', day: 2, completedAt: new Date().toISOString() },
      },
    };
    const html = render('sql', 'day-02', '/sql/learn/day-02/theory/where-and-intersection');
    expect(html).toContain('Day 2 of 57');
    expect(html).toContain('CHILD-CONTENT-MARKER');
  });
});

describe('Phase 4.2 — resolveDayLayoutState owns the lock rule only', () => {
  const day01 = ALL_MODULES.find((m) => m.id === 'day-01')!;
  const day02 = ALL_MODULES.find((m) => m.id === 'day-02')!;
  const prisma01 = PRISMA_MODULES.find((m) => m.id === 'prisma-01')!;
  const prisma02 = PRISMA_MODULES.find((m) => m.id === 'prisma-02')!;

  it('unlocked day: not locked', () => {
    const state = resolveDayLayoutState(day01, ALL_MODULES, initialStateForTrack('sql'));
    expect(state).toEqual({ isLocked: false });
  });

  it('locked sql day: isLocked (no overview/redirect fields exist any more)', () => {
    const state = resolveDayLayoutState(day02, ALL_MODULES, initialStateForTrack('sql'));
    expect(state).toEqual({ isLocked: true });
  });

  it('locked prisma day: isLocked', () => {
    const state = resolveDayLayoutState(prisma02, PRISMA_MODULES, initialStateForTrack('prisma'));
    expect(state).toEqual({ isLocked: true });
  });

  it('a completion record unlocks rendering even without a progression record', () => {
    const userState: UserLearningState = {
      ...initialStateForTrack('sql'),
      completedModules: {
        'day-02': { moduleId: 'day-02', day: 2, completedAt: new Date().toISOString() },
      },
    };
    const state = resolveDayLayoutState(day02, ALL_MODULES, userState);
    expect(state.isLocked).toBe(false);
  });

  it('the first module of each track is always unlocked', () => {
    const sql = resolveDayLayoutState(day01, ALL_MODULES, initialStateForTrack('sql'));
    const prisma = resolveDayLayoutState(prisma01, PRISMA_MODULES, initialStateForTrack('prisma'));
    expect(sql.isLocked).toBe(false);
    expect(prisma.isLocked).toBe(false);
  });
});

describe('Phase 4 — /learn/[dayId] is a server redirect to the day first concept', () => {
  it('sql day entry redirects to .../theory/<firstConceptId>', async () => {
    const day01 = ALL_MODULES.find((m) => m.id === 'day-01')!;
    const target = `/sql/learn/day-01/theory/${day01.concepts[0].id}`;
    await expect(SqlDayEntry({ params: Promise.resolve({ dayId: 'day-01' }) })).rejects.toThrow(
      `NEXT_REDIRECT:${target}`,
    );
    expect(h.redirect).toHaveBeenLastCalledWith(target);
  });

  it('prisma day entry redirects to the PRISMA url (per-track basePath)', async () => {
    const prisma01 = PRISMA_MODULES.find((m) => m.id === 'prisma-01')!;
    const target = `/prisma/learn/prisma-01/theory/${prisma01.concepts[0].id}`;
    await expect(
      PrismaDayEntry({ params: Promise.resolve({ dayId: 'prisma-01' }) }),
    ).rejects.toThrow(`NEXT_REDIRECT:${target}`);
    expect(h.redirect).toHaveBeenLastCalledWith(target);
  });

  it('an unknown dayId is a 404, never a redirect', async () => {
    await expect(SqlDayEntry({ params: Promise.resolve({ dayId: 'day-99' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    );
  });
});

/** Repo file, resolved from this test file so `process.cwd()` cannot matter. */
function repoFile(rel: string): string {
  return fileURLToPath(new URL(`../../${rel}`, import.meta.url));
}

/**
 * Route-layout source: CRLF-normalized, then comments stripped so the header
 * prose may freely describe the logic the file must NOT contain (the static
 * guard targets real code, phase10 precedent).
 */
function layoutSource(rel: string): string {
  return readFileSync(repoFile(rel), 'utf8')
    .replace(/\r\n/g, '\n')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

/** Every file under a directory (absolute paths). */
function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

const SQL_LAYOUT = 'src/app/(app)/sql/learn/[dayId]/layout.tsx';
const PRISMA_LAYOUT = 'src/app/(app)/prisma/learn/[dayId]/layout.tsx';
const VIEW = 'src/components/learn/TrackDayLayoutView.tsx';

describe('Phase 4.2 — both day layouts are thin, parity-checked delegates', () => {
  it('each delegate renders the shared view with its own track literal', () => {
    const importLine = "import TrackDayLayoutView from '@/components/learn/TrackDayLayoutView'";
    const sql = layoutSource(SQL_LAYOUT);
    expect(sql).toContain(importLine);
    expect(sql).toContain('<TrackDayLayoutView track="sql">');
    const prisma = layoutSource(PRISMA_LAYOUT);
    expect(prisma).toContain(importLine);
    expect(prisma).toContain('<TrackDayLayoutView track="prisma">');
  });

  it('delegates contain none of the day-boundary logic (single owner: the view)', () => {
    const markers = [
      'useEffect',
      'useState',
      'useParams',
      'usePathname',
      'useRouter',
      'useTrack',
      'useTrackCurriculum',
      'useTrackConceptId',
      'notFound',
      'resetDatabase',
      'getModuleUnlockStatus',
      'backToRoadmap',
      'TRACK_META',
      'Icon',
      'resolveDayLayoutState',
    ];
    for (const rel of [SQL_LAYOUT, PRISMA_LAYOUT]) {
      const src = layoutSource(rel);
      for (const marker of markers) {
        expect(src, `${rel} must not contain ${marker}`).not.toMatch(
          new RegExp(`\\b${marker}\\b`),
        );
      }
    }
  });

  it('the shared view is the positive owner of that same logic', () => {
    const src = layoutSource(VIEW);
    for (const marker of [
      'useEffect',
      'notFound',
      'resetDatabase',
      'getModuleUnlockStatus',
      'backToRoadmap',
      'resolveDayLayoutState',
      'getTrackDefinition',
    ]) {
      expect(src, `TrackDayLayoutView must own ${marker}`).toContain(marker);
    }
  });

  it('the view no longer carries any overview/redirect logic (Phase 4 removal)', () => {
    const src = layoutSource(VIEW);
    for (const gone of [
      'isOverview',
      'overviewUrl',
      'redirectUrl',
      'usePathname',
      'useRouter',
      'ModuleOverview',
    ]) {
      expect(src, `TrackDayLayoutView must not contain ${gone}`).not.toContain(gone);
    }
    expect(src).toContain('LockedDayNotice');
  });

  it('the retired /learn/[dayId] overview component is gone', () => {
    expect(existsSync(repoFile('src/components/learn/ModuleOverview.tsx'))).toBe(false);
  });

  it('the two delegates differ ONLY in the track literal (zero drift, forever)', () => {
    const sql = layoutSource(SQL_LAYOUT);
    const prisma = layoutSource(PRISMA_LAYOUT);
    expect(sql.replace('track="sql"', 'track="prisma"')).toBe(prisma);
  });
});

describe('Phase 4.2 — route inventory, sitemap and redirect contracts stay frozen', () => {
  it('exactly the two learn-day layouts exist under src/app', () => {
    const learnLayouts = walk(repoFile('src/app'))
      .map((p) => p.replace(/\\/g, '/'))
      .filter((p) => p.includes('/learn/') && p.endsWith('/layout.tsx'))
      .map((p) => p.slice(p.indexOf('/src/app') + 1))
      .sort();
    expect(
      learnLayouts,
      'Adding a track? Add its delegate layout AND update this pinned list (Task 4.2 tripwire).',
    ).toEqual([PRISMA_LAYOUT, SQL_LAYOUT].sort());
  });

  it('the canonical sitemap still emits both track surfaces and every module overview', () => {
    const paths = sitemap().map((entry) => new URL(entry.url).pathname);
    expect(paths).toContain('/sql');
    expect(paths).toContain('/prisma');
    expect(paths).toContain('/sql/learn');
    expect(paths).toContain('/prisma/learn');
    expect(paths).toContain('/sql/learn/day-01');
    expect(paths).toContain('/sql/learn/day-57');
    expect(paths).toContain('/prisma/learn/prisma-01');
    expect(paths).toContain('/prisma/learn/prisma-14');
    expect(paths).toHaveLength(5 + ALL_MODULES.length + PRISMA_MODULES.length);
  });

  it('the legacy /learn redirect bridge in next.config is still declared verbatim', () => {
    const src = readFileSync(repoFile('next.config.ts'), 'utf8');
    expect(src).toContain("{ source: '/learn', destination: '/sql/learn', permanent: false }");
    expect(src).toContain(
      "{ source: '/learn/:path*', destination: '/sql/learn/:path*', permanent: false }",
    );
  });
});
describe('Phase 5 — no app source builds a bare /learn/<moduleId> overview URL', () => {
  const CLEANED_FILES = [
    'src/components/learn/TheoryView.tsx',
    'src/components/learn/ChallengeView.tsx',
    'src/components/learn/CompleteView.tsx',
    'src/components/learn/use-learning-navigation.ts',
    'src/components/learning/ModuleCompletionView.tsx',
  ];

  it('the cleaned-up views/hooks never construct `…/learn/${moduleId}` without a stage', () => {
    for (const rel of CLEANED_FILES) {
      const src = layoutSource(rel);
      expect(src, `${rel} must not build a bare overview URL`).not.toContain('/learn/${');
    }
  });

  it('they build track-aware stage URLs instead (trackLearnUrl / trackRoadmapUrl)', () => {
    for (const rel of CLEANED_FILES) {
      const src = layoutSource(rel);
      expect(src, `${rel} must use a track-aware builder`).toMatch(
        /trackLearnUrl|trackRoadmapUrl/,
      );
    }
  });
});



